#!/usr/bin/env node
// Validate downloaded bytes only. Never install packages or run release scripts.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const [metadataPath, artifactDir, reportPath] = process.argv.slice(2);
const errors = [];
const notes = [];
const safeName = name => typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(name);
function fail(message) { errors.push(message); }
function read(name) {
  if (!safeName(name)) throw new Error(`Unsafe artifact path: ${name}`);
  const file = path.join(artifactDir, name);
  if (!fs.lstatSync(file).isFile()) throw new Error(`Not a regular file: ${name}`);
  return fs.readFileSync(file);
}
try {
  const release = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  if (!Array.isArray(release.assets) || typeof release.tag_name !== 'string') throw new Error('Invalid release metadata');
  const assets = new Map();
  for (const asset of release.assets) {
    if (!safeName(asset.name)) throw new Error(`Unsafe artifact path: ${asset.name}`);
    if (assets.has(asset.name)) throw new Error(`Duplicate asset: ${asset.name}`);
    assets.set(asset.name, asset);
  }
  const tag = release.tag_name;
  const version = tag.replace(/^v/, '');
  if (!/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(tag)) throw new Error('Unsupported release tag');
  notes.push(`Release: ${tag}`);
  const tui = tag.startsWith('tui-v');
  const checksums = new Map();
  const manifests = [...assets.keys()].filter(name => name === 'SHA256SUMS' || name === `checksums-v${version}.txt`);
  if (tui && !assets.has('SHA256SUMS')) fail('Missing required SHA256SUMS');
  for (const name of manifests) {
    try {
      const lines = read(name).toString('utf8').split(/\r?\n/).filter(line => line.trim());
      if (!lines.length) throw new Error(`Empty checksum manifest: ${name}`);
      for (const line of lines) {
        const match = /^([a-fA-F0-9]{64}) [ *](.+)$/.exec(line);
        if (!match) throw new Error(`Malformed checksum entry in ${name}`);
        const [, hash, file] = match;
        if (!safeName(file)) throw new Error(`Unsafe checksum path: ${file}`);
        if (!assets.has(file)) throw new Error(`Checksum references missing release asset: ${file}`);
        if (checksums.has(file) && checksums.get(file) !== hash.toLowerCase()) throw new Error(`Conflicting checksums: ${file}`);
        checksums.set(file, hash.toLowerCase());
      }
    } catch (error) { fail(error.message); }
  }
  const archives = [...assets.keys()].filter(name => /^iox-matter-tui-.+\.tar\.gz$/.test(name));
  const required = tui ? archives : [`iox_matter_bridge-${version}.pkg`, 'download_build.sh'];
  if (tui && !archives.length) fail('No TUI archives found');
  for (const name of required) if (!assets.has(name)) fail(`Missing required release asset: ${name}`);
  for (const [name, asset] of assets) {
    try {
      const data = read(name);
      if (!data.length) throw new Error(`Empty artifact: ${name}`);
      if (Number.isInteger(asset.size) && data.length !== asset.size) throw new Error(`Size mismatch: ${name}`);
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      let verified = false;
      if (asset.digest) {
        if (!/^sha256:[a-fA-F0-9]{64}$/.test(asset.digest)) throw new Error(`Unsupported asset digest: ${name}`);
        if (hash !== asset.digest.slice(7).toLowerCase()) throw new Error(`SHA-256 mismatch (GitHub digest): ${name}`);
        verified = true;
      }
      if (checksums.has(name)) {
        if (hash !== checksums.get(name)) throw new Error(`SHA-256 mismatch (checksum manifest): ${name}`);
        verified = true;
      }
      if (required.includes(name) && !verified) throw new Error(`No SHA-256 integrity information: ${name}`);
      if (tui && archives.includes(name) && !checksums.has(name)) throw new Error(`TUI archive missing from SHA256SUMS: ${name}`);
      if (verified) notes.push(`SHA-256 verified: ${name}`);
      else notes.push(`Present, no SHA-256 verification: ${name}`);
      if (name.endsWith('.sbom.json')) {
        JSON.parse(data.toString('utf8'));
        notes.push(`SBOM JSON syntax valid: ${name} (schema/content not validated)`);
      }
      if (name.endsWith('.sig') || name.endsWith('.asc')) notes.push(`Signature present, authenticity not verified: ${name}`);
      if (tui && archives.includes(name)) {
        const listing = execFileSync('tar', ['-tzf', path.resolve(artifactDir, name)], { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
        const entries = listing.split('\n');
        for (const requiredEntry of ['/release.json', '/agent-skills/iox-matter-tui/SKILL.md', '/install-skills.py']) {
          if (!entries.some(entry => entry.endsWith(requiredEntry))) throw new Error(`Missing ${requiredEntry} in ${name}`);
        }
        notes.push(`TUI archive required entries present: ${name}`);
      }
    } catch (error) { fail(`${name}: ${error.message}`); }
  }
  if (!tui && ![...assets.keys()].some(name => name.endsWith('.sbom.json'))) notes.push('SBOM not supplied (optional).');
  notes.push('Integrity checks do not prove package functionality or publisher authenticity. Release assets were not executed.');
} catch (error) { fail(error.message); }
const report = `# Release Artifact Validation\n\n**${errors.length ? 'FAIL' : 'PASS'}**\n\n${errors.map(error => `- ERROR: ${error}`).join('\n')}\n\n${notes.map(note => `- ${note}`).join('\n')}\n`;
if (reportPath) fs.writeFileSync(reportPath, report);
process.stdout.write(report);
process.exitCode = errors.length ? 1 : 0;
