// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, access, mkdtemp, rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const pkgRoot = path.resolve(import.meta.dirname, '../packages/extension-ui');
const json = async p => JSON.parse(await readFile(path.join(pkgRoot, p), 'utf8'));

test('extension UI is an independent native-CSS package with the required exports', async () => {
  assert.equal(await access(path.join(pkgRoot, 'package.json')).then(() => true, () => false), true,
    'shared UI package must exist');
  const pkg = await json('package.json'), contract = await json('contract.json');
  assert.equal(pkg.name, '@stateport/extension-ui');
  assert.equal(pkg.license, '(Apache-2.0 AND OFL-1.1)');
  assert.deepEqual(Object.keys(pkg.dependencies || {}), []);
  assert.deepEqual(Object.keys(pkg.exports), ['./tokens.css', './components.css', './contract.json', './assets/stateport-mark.svg', './fonts.css', './assets/fonts/InterVariable.woff2']);
  assert.deepEqual(contract.exports, pkg.exports);
  assert.deepEqual(contract.themes, ['light']);
  assert.deepEqual(contract.densities, ['comfortable']);
  assert.equal(contract.scope, '[data-sp-ui]');
});

test('standalone generation is deterministic, scoped and checks drift', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'extension-ui-generation-'));
  try {
    const build = path.join(pkgRoot, 'scripts/build.mjs');
    execFileSync(process.execPath, [build, '--out', tmp]);
    const tokens = await readFile(path.join(tmp, 'tokens.css'), 'utf8');
    const components = await readFile(path.join(tmp, 'components.css'), 'utf8');
    execFileSync(process.execPath, [build, '--out', tmp, '--check']);
    execFileSync(process.execPath, [build, '--out', tmp]);
    assert.equal(await readFile(path.join(tmp, 'tokens.css'), 'utf8'), tokens);
    assert.match(tokens, /--sp-color-text: #17191f/);
    assert.match(tokens, /--sp-color-primary: #0b5cff/);
    assert.match(components, /:focus-visible/);
    assert.match(components, /\[aria-busy="true"\]/);
    // Every ordinary rule must carry the scope; there are no global resets or at-rules.
    for (const css of [tokens, components]) {
      const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const block of clean.split('}').filter(x => x.trim())) {
        const selectorList = block.split('{')[0];
        let depth = 0;
        const selectors = selectorList.replace(/[(),]/g, ch => {
          if (ch === '(') depth++;
          if (ch === ')') depth--;
          return ch === ',' && depth === 0 ? '\n' : ch;
        }).split('\n').filter(x => x.trim());
        for (const selector of selectors) assert.match(selector.trim(), /^\[data-sp-ui\]/);
      }
      assert.doesNotMatch(clean, /@import|url\(/);
    }
    await writeFile(path.join(tmp, 'tokens.css'), tokens + '/* drift */');
    assert.throws(() => execFileSync(process.execPath, [build, '--out', tmp, '--check'], {stdio: 'pipe'}), /Command failed/);
  } finally { await rm(tmp, {recursive: true, force: true}); }
});

test('shared visual base follows supplied design palette and preserves its original brand asset', async () => {
  const tokens = await json('tokens/tokens.json');
  const reference = await readFile(path.join(pkgRoot, 'design/source/style.css'), 'utf8');
  const color = value => value.length === 4 ? '#' + [...value.slice(1)].map(x => x + x).join('') : value.toLowerCase();
  for (const [token, name] of [['color-text', 'ink'], ['color-muted', 'muted'], ['color-primary', 'blue'], ['color-surface', 'surface'], ['color-border', 'line']]) {
    assert.equal(color(tokens[token]), color(reference.match(new RegExp('--' + name + ':([^;}]+)'))[1]));
  }
  assert.equal(tokens['font-size-body'], '13px');
  assert.equal(tokens['font-size-control'], '12px');
  assert.equal(tokens['radius-control'], '7px');
  assert.equal(await readFile(path.join(pkgRoot, 'assets/stateport-mark.svg'), 'utf8'),
    await readFile(path.join(pkgRoot, 'design/source/assets/stateport-mark.svg'), 'utf8'));
});

test('optional font registration is local, independently namespaced and keeps the original OFL asset', async()=>{
  const fonts=await readFile(path.join(pkgRoot,'styles/fonts.css'),'utf8');
  assert.match(fonts, /font-family: "StatePort Inter"/);
  assert.match(fonts, /url\("\.\/assets\/fonts\/InterVariable\.woff2"\)/);
  assert.doesNotMatch(fonts, /https?:|@import/);
  const provenance=await json('assets/fonts/provenance.json');
  const {createHash}=await import('node:crypto');
  for(const [file,digest] of Object.entries(provenance.sha256))assert.equal(createHash('sha256').update(await readFile(path.join(pkgRoot,'assets/fonts',file))).digest('hex'),digest);
  assert.match(await readFile(path.join(pkgRoot,'assets/fonts/Inter-LICENSE.txt'),'utf8'), /SIL OPEN FONT LICENSE Version 1.1/);
});
