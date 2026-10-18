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
  assert.equal(pkg.license, 'Apache-2.0');
  assert.deepEqual(Object.keys(pkg.dependencies || {}), []);
  assert.deepEqual(Object.keys(pkg.exports), ['./tokens.css', './components.css', './contract.json']);
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
    assert.match(tokens, /--sp-color-text: #0f172a/);
    assert.match(tokens, /--sp-color-primary: oklch\(48\.8% .243 264\.376\)/);
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
