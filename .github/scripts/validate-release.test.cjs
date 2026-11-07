const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const script = path.join(__dirname, 'validate-release.cjs');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function fixture(t, tag = 'v2.0.7', files = { 'iox_matter_bridge-2.0.7.pkg': 'package', 'download_build.sh': '#!/bin/sh\necho installer\n' }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, 'artifacts'); fs.mkdirSync(dir);
  const release = { tag_name: tag, assets: [] };
  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), data);
    release.assets.push({ name, size: Buffer.byteLength(data), digest: `sha256:${hash(data)}` });
  }
  return { root, dir, release, run() {
    fs.writeFileSync(path.join(root, 'release.json'), JSON.stringify(release));
    const result = spawnSync(process.execPath, [script, path.join(root, 'release.json'), dir, path.join(root, 'report.md')], { encoding: 'utf8' });
    assert.ok(fs.existsSync(path.join(root, 'report.md')), `Validator must write a report: ${result.stderr}`);
    return { ...result, report: fs.existsSync(path.join(root, 'report.md')) ? fs.readFileSync(path.join(root, 'report.md'), 'utf8') : '' };
  } };
}
test('accepts published pkg and installer with GitHub SHA-256 digests, without obsolete tarball', t => {
  const r = fixture(t).run(); assert.equal(r.status, 0, r.stderr); assert.match(r.report, /PASS/);
});
for (const name of ['iox_matter_bridge-2.0.7.pkg', 'download_build.sh']) {
  test(`fails missing required ${name}`, t => { const f = fixture(t); fs.unlinkSync(path.join(f.dir, name)); const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /FAIL/); });
}
test('fails a digest mismatch', t => { const f = fixture(t); f.release.assets[0].digest = `sha256:${'0'.repeat(64)}`; const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /SHA-256 mismatch/); });
test('fails a size mismatch', t => { const f = fixture(t); f.release.assets[0].size++; assert.equal(f.run().status, 1); });
test('fails when integrity information is unavailable', t => { const f = fixture(t); delete f.release.assets[0].digest; const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /No SHA-256/); });
test('accepts checksum manifest fallback for older releases', t => {
  const f = fixture(t); const sums = f.release.assets.map(a => `${a.digest.slice(7)}  ${a.name}`).join('\n');
  for (const a of f.release.assets) a.digest = null;
  fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), sums); f.release.assets.push({ name: 'SHA256SUMS', size: Buffer.byteLength(sums) });
  assert.equal(f.run().status, 0);
});
test('rejects a bad checksum even when API digest matches', t => {
  const f = fixture(t); const sums = `${'0'.repeat(64)}  download_build.sh\n`; fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), sums); f.release.assets.push({ name: 'SHA256SUMS', size: sums.length });
  assert.equal(f.run().status, 1);
});
test('rejects unsafe checksum paths', t => { const f = fixture(t); fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), `${'0'.repeat(64)}  ../secret\n`); f.release.assets.push({ name: 'SHA256SUMS' }); const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /Unsafe/); });
test('rejects invalid optional SBOM rather than claiming validity', t => { const f = fixture(t, 'v2.0.7', { 'iox_matter_bridge-2.0.7.pkg': 'pkg', 'download_build.sh': 'sh', 'iox-matter-bridge-v2.0.7.sbom.json': '{bad' }); assert.equal(f.run().status, 1); });
test('labels signatures unverified, never cryptographically verified', t => { const f = fixture(t, 'v2.0.7', { 'iox_matter_bridge-2.0.7.pkg': 'pkg', 'download_build.sh': 'sh', 'package.sig': 'sig' }); const r = f.run(); assert.equal(r.status, 0); assert.match(r.report, /signature.*not verified/i); });
function tui(t, omit = false) {
  const f = fixture(t, 'tui-v1.0.0', {}); const tree = path.join(f.root, 'tree');
  fs.mkdirSync(path.join(tree, 'tui/agent-skills/iox-matter-tui'), { recursive: true });
  for (const name of ['release.json', 'agent-skills/iox-matter-tui/SKILL.md', ...(omit ? [] : ['install-skills.py'])]) fs.writeFileSync(path.join(tree, 'tui', name), '{}');
  const name = 'iox-matter-tui-linux-x64.tar.gz'; execFileSync('tar', ['-czf', path.join(f.dir, name), '-C', tree, 'tui']);
  const data = fs.readFileSync(path.join(f.dir, name)); const sums = `${hash(data)}  ${name}\n`;
  fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), sums);
  f.release.assets = [{ name, size: data.length }, { name: 'SHA256SUMS', size: sums.length }]; return f;
}
test('validates TUI hashes and required archive entries without extracting', t => assert.equal(tui(t).run().status, 0));
test('fails TUI missing required entry', t => assert.equal(tui(t, true).run().status, 1));
test('fails TUI archive omitted from checksum manifest even with API digest', t => { const f = tui(t); fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), ''); assert.equal(f.run().status, 1); });
test('fails TUI with no archive', t => assert.equal(fixture(t, 'tui-v1.0.0', { SHA256SUMS: '' }).run().status, 1));
test('fails malformed release metadata and writes report', t => { const f = fixture(t); f.release.assets = null; const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /FAIL/); });

test('rejects unsafe metadata names before opening files', t => { const f = fixture(t); f.release.assets.push({ name: '../secret' }); const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /Unsafe artifact path/); });
test('rejects symlink artifacts', t => { const f = fixture(t); fs.unlinkSync(path.join(f.dir, 'download_build.sh')); fs.symlinkSync(path.join(f.dir, 'iox_matter_bridge-2.0.7.pkg'), path.join(f.dir, 'download_build.sh')); const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /Not a regular file/); });
test('requires each TUI archive to be included in SHA256SUMS', t => {
  const f = tui(t); const archive = f.release.assets[0];
  archive.digest = `sha256:${hash(fs.readFileSync(path.join(f.dir, archive.name)))}`;
  const readme = 'readme'; fs.writeFileSync(path.join(f.dir, 'README.txt'), readme);
  const sums = `${hash(readme)}  README.txt\n`; fs.writeFileSync(path.join(f.dir, 'SHA256SUMS'), sums);
  f.release.assets[1].size = Buffer.byteLength(sums); f.release.assets.push({ name: 'README.txt', size: readme.length });
  const r = f.run(); assert.equal(r.status, 1); assert.match(r.report, /TUI archive missing from SHA256SUMS/);
});
