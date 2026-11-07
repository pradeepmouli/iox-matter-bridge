const assert = require('node:assert/strict');
const { test } = require('node:test');
const { prepareSync, copyIssue, markSynced } = require('../scripts/sync-issues.cjs');

const context = { repo: { owner: 'pradeepmouli', repo: 'iox-matter-bridge' } };
const original = {
  number: 80, title: 'Bridge bug', body: 'Reproduction details',
  html_url: 'https://github.com/pradeepmouli/iox-matter-bridge/issues/80',
  user: { login: 'reporter' }, created_at: '2026-11-07T12:00:00Z',
  labels: [{ name: 'bug' }, { name: 'needs-triage' }],
};
const marker = '<!-- synced-from: pradeepmouli/iox-matter-bridge#80 -->';
const target = { owner: 'pradeepmouli', repo: 'udi-js' };
const core = { info() {}, warning() {} };

function api({ issue = structuredClone(original), targets = [], comments = [], fail = '' } = {}) {
  const calls = [];
  const operation = (name, handler) => async args => {
    calls.push([name, args]);
    if (name === fail) throw new Error(`${name} denied`);
    return { data: handler(args) };
  };
  const issues = {
    get: operation('get', () => issue),
    listForRepo: operation('listForRepo', () => targets),
    listComments: operation('listComments', () => comments),
    create: operation('create', args => {
      const created = { ...args, user: { id: 16478229, login: 'pradeepmouli' }, number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' };
      targets.push(created);
      return created;
    }),
    createComment: operation('createComment', args => { comments.push({ ...args, user: { login: 'github-actions[bot]', type: 'Bot' } }); return args; }),
    addLabels: operation('addLabels', args => args),
  };
  return { github: { rest: { issues, users: { getAuthenticated: async () => ({ data: { id: 16478229, login: 'pradeepmouli' } }) } }, paginate: async (fn, args) => (await fn(args)).data }, calls, targets, comments };
}

test('uses current labels rather than stale event data', async () => {
  const source = api({ issue: { ...original, labels: [{ name: 'synced-to-udi-js' }, { name: 'bug' }] } });
  assert.equal(await prepareSync({ github: source.github, context, issueNumber: 80, token: '' }), null);
});

test('non-development issues do not require cross-repository credentials', async () => {
  const source = api({ issue: { ...original, labels: [{ name: 'install' }] } });
  assert.equal(await prepareSync({ github: source.github, context, issueNumber: 80, token: '' }), null);
});

test('pending sync fails clearly when the target token is missing without writing anything', async () => {
  const source = api();
  await assert.rejects(prepareSync({ github: source.github, context, issueNumber: 80, token: '' }), /UDI_JS_ISSUES_TOKEN/);
  assert.deepEqual(source.calls.map(([name]) => name), ['get']);
});

test('rejects invalid manual issue numbers before API access', async () => {
  const source = api();
  await assert.rejects(prepareSync({ github: source.github, context, issueNumber: 'not-a-number', token: 'configured' }), /positive integer/);
  assert.equal(source.calls.length, 0);
});

test('copies the original report and filters source-only labels', async () => {
  const remote = api();
  const result = await copyIssue({ github: remote.github, context, issue: original, target, core });
  assert.equal(result.html_url, 'https://github.com/pradeepmouli/udi-js/issues/240');
  const created = remote.targets[0];
  assert.equal(created.owner, 'pradeepmouli');
  assert.equal(created.repo, 'udi-js');
  assert.equal(created.title, '[iox-matter-bridge] Bridge bug');
  assert.ok(created.body.startsWith(marker + '\n'));
  assert.ok(created.body.includes(original.body));
  assert.deepEqual(remote.calls.find(([name]) => name === 'addLabels')[1].labels, ['bug']);
});

test('target creation errors propagate without reporting success', async () => {
  const remote = api({ fail: 'create' });
  await assert.rejects(copyIssue({ github: remote.github, context, issue: original, target, core }), /create denied/);
  assert.equal(remote.calls.some(([name]) => name === 'addLabels'), false);
  assert.equal(remote.calls.some(([name]) => name === 'createComment'), false);
});

test('retries reuse a previously created target issue, including a closed one', async () => {
  const remote = api({ targets: [{ number: 240, user: { id: 16478229, login: 'pradeepmouli' }, state: 'closed', body: marker + '\nExisting copy', html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' }] });
  const result = await copyIssue({ github: remote.github, context, issue: original, target, core });
  assert.equal(result.number, 240);
  assert.equal(remote.calls.some(([name]) => name === 'create'), false);
  assert.equal(remote.calls.find(([name]) => name === 'listForRepo')[1].state, 'all');
});

test('a marker quoted inside another report does not count as a target copy', async () => {
  const remote = api({ targets: [{ number: 1, body: 'Quoted report\n' + marker, html_url: 'https://github.com/pradeepmouli/udi-js/issues/1' }] });
  assert.equal((await copyIssue({ github: remote.github, context, issue: original, target, core })).number, 240);
});

test('unavailable target labels do not undo a successful copy', async () => {
  const remote = api({ fail: 'addLabels' });
  assert.equal((await copyIssue({ github: remote.github, context, issue: original, target, core })).number, 240);
});

test('source issue gets a link and success label only after a real target exists', async () => {
  const source = api();
  const synced = { number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' };
  await markSynced({ github: source.github, context, issue: original, synced, target });
  assert.ok(source.comments[0].body.includes(synced.html_url));
  assert.deepEqual(source.calls.at(-1), ['addLabels', { ...context.repo, issue_number: 80, labels: ['synced-to-udi-js', 'copilot-tracked'] }]);
});

test('a failed source comment never writes the success label', async () => {
  const source = api({ fail: 'createComment' });
  await assert.rejects(markSynced({ github: source.github, context, issue: original, synced: { number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' }, target }), /createComment denied/);
  assert.equal(source.calls.some(([name]) => name === 'addLabels'), false);
});

test('source retries do not duplicate the synchronization comment', async () => {
  const source = api();
  const synced = { number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' };
  await markSynced({ github: source.github, context, issue: original, synced, target });
  await markSynced({ github: source.github, context, issue: original, synced, target });
  assert.equal(source.comments.length, 1);
});

test('source cannot be marked synced with an invalid target link', async () => {
  const source = api();
  await assert.rejects(markSynced({ github: source.github, context, issue: original, synced: { number: 240, html_url: 'https://example.com/issues/240' }, target }), /target issue/);
  assert.equal(source.calls.length, 0);
});


test('an unrelated account cannot forge a successful target copy marker', async () => {
  const remote = api({ targets: [{ number: 99, body: marker + '\nNot the copied report', user: { id: 999, login: 'stranger' }, html_url: 'https://github.com/pradeepmouli/udi-js/issues/99' }] });
  assert.equal((await copyIssue({ github: remote.github, context, issue: original, target, core })).number, 240);
});

test('untrusted source comments cannot suppress the official synchronization link', async () => {
  const synced = { number: 240, html_url: 'https://github.com/pradeepmouli/udi-js/issues/240' };
  const source = api({ comments: [{ body: marker + '\n' + synced.html_url, user: { login: 'stranger', type: 'User' } }] });
  await markSynced({ github: source.github, context, issue: original, synced, target });
  assert.equal(source.comments.length, 2);
});

for (const issueNumber of ['080', '8e1', '+80', '80.0', ' 80', '0x50', '80 ', '80\n', '', '9007199254740992']) {
  test(`rejects noncanonical issue number ${JSON.stringify(issueNumber)} before any API call`, async () => {
    const source = api();
    await assert.rejects(prepareSync({ github: source.github, context, issueNumber, token: 'configured' }), /positive integer/);
    assert.equal(source.calls.length, 0);
  });
}

test('canonical manual input uses the same issue number as an issue event', async () => {
  const source = api();
  assert.equal((await prepareSync({ github: source.github, context, issueNumber: '80', token: 'configured' })).number, 80);
  assert.equal(source.calls[0][1].issue_number, 80);
});
