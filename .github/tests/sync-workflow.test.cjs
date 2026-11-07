const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

// Exercise the actual github-script blocks and their environment bindings.
// actionlint validates the complete YAML; this harness only needs this workflow's
// script steps and simple step-output expressions, not a general YAML parser.
const workflow = fs.readFileSync(path.join(__dirname, '../workflows/sync-issues.yml'), 'utf8');
function step(name) {
  const block = workflow.split('      - name: ').find(value => value.startsWith(name + '\n'));
  assert.ok(block, `Missing workflow step: ${name}`);
  const script = block.split('          script: |\n')[1];
  assert.ok(script, `Missing script in: ${name}`);
  return {
    script: script.split('\n').map(line => line.slice(12)).join('\n'),
    env: [...(block.match(/        env:\n([\s\S]*?)        with:/)?.[1] || '').matchAll(/^          ([A-Z_]+): (.+)$/gm)]
      .map(([, key, value]) => [key, value]),
  };
}

test('large Unicode reports cross workflow step boundaries through files without E2BIG', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-workflow-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.github/scripts'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, '../scripts/sync-issues.cjs'), path.join(root, '.github/scripts/sync-issues.cjs'));
  const issue = {
    number: 80, title: 'Large report', body: '界'.repeat(60000),
    html_url: 'https://github.com/pradeepmouli/iox-matter-bridge/issues/80',
    user: { login: 'reporter' }, created_at: '2026-11-07T12:00:00Z', labels: [{ name: 'bug' }],
  };
  fs.writeFileSync(path.join(root, 'fixture.json'), JSON.stringify(issue));
  fs.writeFileSync(path.join(root, 'run-step.cjs'), `
    const fs = require('node:fs');
    const issue = JSON.parse(fs.readFileSync('fixture.json', 'utf8'));
    const outputs = {};
    const core = { setOutput(key, value) { outputs[key] = String(value); }, info() {}, warning() {} };
    const context = { repo: { owner: 'pradeepmouli', repo: 'iox-matter-bridge' } };
    const issues = {
      get: async () => ({ data: issue }),
      listForRepo: async () => ({ data: [] }),
      listComments: async () => ({ data: [] }),
      create: async args => {
        fs.writeFileSync('created-issue.json', JSON.stringify(args));
        return { data: { number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' } };
      },
      createComment: async args => { fs.writeFileSync('source-comment.json', JSON.stringify(args)); },
      addLabels: async args => { fs.writeFileSync(args.repo + '-labels.json', JSON.stringify(args)); },
    };
    const github = { rest: { issues, users: { getAuthenticated: async () => ({ data: { id: 16478229 } }) } },
      paginate: async (fn, args) => (await fn(args)).data };
    const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
    const script = fs.readFileSync('current-step.js', 'utf8');
    (async () => {
      const result = await new AsyncFunction('github', 'context', 'core', 'require', script)(github, context, core, require);
      outputs.result = JSON.stringify(result);
      fs.writeFileSync('outputs.json', JSON.stringify(outputs));
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `);
  const outputs = {};
  function run(id, name) {
    const current = step(name);
    const env = { ...process.env, TARGET_REPO_OWNER: 'pradeepmouli', TARGET_REPO_NAME: 'udi-js' };
    for (const [key, value] of current.env) {
      const output = /^\$\{\{ steps\.([a-z]+)\.outputs\.([a-z_]+) \}\}$/.exec(value);
      if (output) env[key] = outputs[output[1]][output[2]];
      else if (key === 'ISSUE_NUMBER') env[key] = '80';
      else if (key === 'UDI_JS_ISSUES_TOKEN') env[key] = 'configured';
      else throw new Error(`Unsupported environment binding: ${key}: ${value}`);
    }
    fs.writeFileSync(path.join(root, 'current-step.js'), current.script);
    const result = spawnSync(process.execPath, ['run-step.cjs'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.status, 0, `${name}: ${result.error || result.stderr}`);
    outputs[id] = JSON.parse(fs.readFileSync(path.join(root, 'outputs.json'), 'utf8'));
  }
  run('check', 'Check current issue and target credentials');
  assert.equal(outputs.check.should_sync, 'true');
  run('copy', 'Copy issue to udi-js repository');
  assert.ok(JSON.parse(fs.readFileSync(path.join(root, 'created-issue.json'), 'utf8')).body.includes(issue.body));
  run('link', 'Link and label successfully synced source issue');
  const labels = JSON.parse(fs.readFileSync(path.join(root, 'iox-matter-bridge-labels.json'), 'utf8'));
  assert.equal(labels.issue_number, 80);
  assert.ok(labels.labels.includes('synced-to-udi-js'));
});
