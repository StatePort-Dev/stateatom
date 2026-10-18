// SPDX-License-Identifier: Apache-2.0
// Local immutable handoff only. Never publishes to a registry.
import {readFile, writeFile, mkdir, mkdtemp, cp, readdir, realpath, access, rename, rm} from 'node:fs/promises';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
import {buildUI} from '../packages/extension-ui/scripts/build.mjs';

const root = path.resolve(import.meta.dirname, '..'), pkgRoot = path.join(root, 'packages/extension-ui');
const pkg = JSON.parse(await readFile(pkgRoot + '/package.json', 'utf8'));
const contract = JSON.parse(await readFile(pkgRoot + '/contract.json', 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const run = (cmd, args, cwd) => execFileSync(cmd, args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
await buildUI();
await buildUI({check: true});

// Exact package build/payload inputs. Paths are package-relative POSIX strings.
const sourceFiles = [];
async function collect(rel) {
  for (const entry of (await readdir(path.join(pkgRoot, rel), {withFileTypes: true})).sort((a,b) => a.name < b.name ? -1 : 1)) {
    const file = rel ? rel + '/' + entry.name : entry.name;
    if (entry.isDirectory()) await collect(file);
    else if (entry.isFile()) sourceFiles.push(file);
    else throw Error('Non-regular package input: ' + file);
  }
}
for (const directory of ['tokens', 'styles', 'scripts', 'assets']) await collect(directory);
sourceFiles.push('package.json', 'contract.json', 'LICENSE', 'NOTICE', 'README.md', 'CHANGELOG.md');
sourceFiles.sort();
const sourceManifest = await Promise.all(sourceFiles.map(async file => [file, sha(await readFile(pkgRoot + '/' + file))]));
const sourceTreeDigest = sha(JSON.stringify(sourceManifest));
const sourceCommit = run('git', ['rev-parse', 'HEAD'], root).trim();
const sourceDirty = run('git', ['status', '--porcelain=v1', '--untracked-files=all'], root).trim().length > 0;
const out = root + '/.artifacts/extension-ui/' + pkg.version;
// Never reuse a handed-off candidate directory, even when only documentation changed.
await mkdir(path.dirname(out), {recursive: true});
async function refuseExistingCandidate() {
  try { await access(out); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
  throw Error('Candidate already exists; preserve it and bump the package version: ' + out);
}
await refuseExistingCandidate();
const staging = await mkdtemp(path.dirname(out) + '/.staging-' + pkg.version + '-');

const packTemp = await mkdtemp(path.join(os.tmpdir(), 'stateport-ui-pack-'));
const evidenceArg = process.argv.find(arg => arg.startsWith('--verification-evidence='));
const verificationEvidence = evidenceArg
  ? JSON.parse(await readFile(path.resolve(evidenceArg.slice('--verification-evidence='.length)), 'utf8')) : null;
const verificationCommands = [
  ...(verificationEvidence?.checks || []).map(check => check.command),
  'npm run pack:ui' + (evidenceArg ? ' -- ' + evidenceArg : '')
];
const packArgs = ['pack', '--json', '--ignore-scripts', '--pack-destination', packTemp];
verificationCommands.push('cd packages/extension-ui && npm ' + packArgs.join(' '));
const [packed] = JSON.parse(run('npm', packArgs, pkgRoot));
const allowed = [...pkg.files, 'package.json'].sort();
const packedFiles = packed.files.map(f => f.path).sort();
if (JSON.stringify(packedFiles) !== JSON.stringify(allowed)) throw Error('Unexpected package files: ' + packedFiles);
const tarball = await readFile(packTemp + '/' + packed.filename);
// npm tar metadata must be deterministic too, not just the generated CSS.
const repeatDir = await mkdtemp(path.join(os.tmpdir(), 'stateport-ui-repeat-'));
run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', repeatDir], pkgRoot);
verificationCommands.push('cd packages/extension-ui && npm pack --json --ignore-scripts --pack-destination ' + repeatDir);
if (sha(await readFile(repeatDir + '/' + packed.filename)) !== sha(tarball)) throw Error('Nondeterministic npm tarball');
const artifactFile = path.join(out, packed.filename);
await writeFile(path.join(staging, packed.filename), tarball, {flag: 'wx'});

const consumers = [];
for (const manager of ['npm', 'pnpm']) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'stateport-ui-' + manager + '-consumer-'));
  const version = spawnSync(manager, ['--version'], {cwd: temp, encoding: 'utf8'});
  if (version.error || version.status !== 0) {
    if (manager === 'npm') throw Error('npm unavailable');
    consumers.push({manager, status: 'BLOCKED', reason: version.error?.message || version.stderr});
    continue;
  }
  await writeFile(temp + '/package.json', JSON.stringify({name: 'extension-ui-clean-consumer', private: true, version: '0.0.0'}));
  await cp(path.join(staging, packed.filename), temp + '/' + packed.filename);
  const localTar = './' + packed.filename;
  const args = manager === 'npm'
    ? ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', localTar]
    : ['add', '--offline', '--ignore-scripts', '--store-dir', temp + '/store', localTar];
  const output = run(manager, args, temp);
  verificationCommands.push('cd ' + temp + ' && ' + manager + ' ' + args.join(' '));
  // Resolve exclusively from the clean consumer. No source checkout imports.
  const require = createRequire(temp + '/package.json');
  const resolved = {};
  for (const name of ['tokens.css', 'components.css', 'contract.json', 'assets/stateport-mark.svg', 'fonts.css', 'assets/fonts/InterVariable.woff2']) {
    const file = await realpath(require.resolve('@stateport/extension-ui/' + name));
    if (!file.startsWith(temp + '/node_modules/')) throw Error('Consumer resolved outside its installed package: ' + file);
    resolved[name] = file;
  }
  const installedContract = JSON.parse(await readFile(resolved['contract.json'], 'utf8'));
  if (installedContract.uiContractVersion !== contract.uiContractVersion) throw Error('Consumer contract mismatch');
  const publicDir = temp + '/public'; await mkdir(publicDir);
  for (const name of ['tokens.css', 'components.css', 'fonts.css']) await cp(resolved[name], publicDir + '/' + name);
  await mkdir(publicDir + '/assets/fonts', {recursive:true});await cp(resolved['assets/fonts/InterVariable.woff2'], publicDir + '/assets/fonts/InterVariable.woff2');
  await cp(resolved['assets/stateport-mark.svg'], publicDir + '/stateport-mark.svg');
  await writeFile(publicDir + '/index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Clean installed extension UI</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="fonts.css"><link rel="stylesheet" href="components.css"></head><body><button id="host">Host</button><main data-sp-ui><img class="sp-brandmark" src="stateport-mark.svg" alt=""><h1>Installed package only</h1><section class="sp-panel"><label for="field">Local field</label><input id="field"><button id="action" class="sp-button-primary">Inspect</button><p class="sp-status">Unknown · no observation</p><p class="sp-status">Stale · inspect again</p></section></main></body></html>');
  const browserArgs = [root + '/scripts/verify-ui-consumer.mjs', publicDir, temp + '/verification'];
  const browserVerification = JSON.parse(run(process.execPath, browserArgs, root));
  if (browserVerification.status !== 'PASS') throw Error('Installed consumer browser verification failed');
  verificationCommands.push('node scripts/verify-ui-consumer.mjs ' + publicDir + ' ' + temp + '/verification');
  await mkdir(staging + '/consumer-' + manager);
  for (const name of ['consumer-verification.json', 'consumer-960.png', 'consumer-360.png']) {
    await cp(temp + '/verification/' + name, staging + '/consumer-' + manager + '/' + name);
  }
  consumers.push({manager, version: version.stdout.trim(), status: 'PASS', directory: temp, publicDir, resolved, output, browserVerification});
}
const handoff = {packageName: pkg.name, packageVersion: pkg.version, uiContractVersion: contract.uiContractVersion,
  sourceCommit, sourceDirty, sourceTreeDigest,
  sourceTreeDigestMethod: 'SHA-256 of UTF-8 JSON.stringify(sourceManifest), an array of [package-relative POSIX path, SHA-256 of exact file bytes], sorted by path. Covers tokens/, styles/, scripts/, assets/ plus package.json, contract.json, LICENSE, NOTICE, README.md, CHANGELOG.md. Excludes generated dist, showcase, Atom consumers and this handoff; identifies package build and payload inputs, not the entire Atom checkout.',
  sourceManifest, artifactFile, artifactSha256: sha(tarball), exports: pkg.exports,
  verificationCommands, packageFiles: packedFiles, tarballDeterministic: true,
  consumers, verificationEvidence,
  designReference: {repositoryPath: 'packages/extension-ui/design', entry: 'README_RU.md', priority: 'docs/HANDOFF_RU.md', screens: 'design/SCREEN_INDEX.md', rule: 'Required basis for subsequent extension-ui work; prototype/reference evidence, not production verification.'},
  verificationBoundary: 'Local candidate; actual StatePort Capture is unmodified and unverified. UI screenshots are candidate baselines, not human-approved designs.',
  tools: {node: process.version, npm: run('npm', ['--version'], packTemp).trim()}};
await writeFile(staging + '/ui-handoff.json', JSON.stringify(handoff, null, 2) + '\n', {flag: 'wx'});
// Serialize promotion across pack invocations. Failed preflight/consumer checks
// leave only a disposable staging directory, never a reserved final candidate.
const lock = out + '.lock';
await mkdir(lock);
try { await refuseExistingCandidate(); await rename(staging, out); }
finally { await rm(lock, {recursive: true}); }
console.log(JSON.stringify({artifactFile, handoffFile: out + '/ui-handoff.json', artifactSha256: handoff.artifactSha256, consumers: consumers.map(c => ({manager:c.manager,status:c.status,directory:c.directory}))}, null, 2));
