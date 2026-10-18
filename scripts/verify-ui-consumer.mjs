// SPDX-License-Identifier: Apache-2.0
// Browser runner reads only installed consumer public files; never UI sources.
import assert from 'node:assert/strict';
import {writeFile, mkdir, realpath} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const [publicArg, outArg] = process.argv.slice(2);
if (!publicArg || !outArg) throw Error('Usage: node scripts/verify-ui-consumer.mjs PUBLIC_DIR OUTPUT_DIR');
const publicDir = await realpath(publicArg), out = path.resolve(outArg);
await mkdir(out, {recursive: true});
const browser = await chromium.launch({channel: 'chromium', headless: true, chromiumSandbox: true});
const context = await browser.newContext({viewport: {width: 960, height: 900}});
const result = {status: 'RUNNING', publicDir, checks: [], browser: browser.version(), errors: [], requests: []};
try {
  const page = await context.newPage();
  page.on('request', r => result.requests.push(r.url()));
  page.on('pageerror', e => result.errors.push(e.message));
  await page.goto('file://' + publicDir + '/index.html');
  assert.equal(await page.title(), 'Clean installed extension UI');
  assert.equal(await page.locator('h1').textContent(), 'Installed package only');
  assert(await page.locator('img.sp-brandmark').evaluate(async e => { await e.decode(); return e.naturalWidth > 0; }));
  result.checks.push('installed supplied brand asset loads without a source-checkout URL');
  const input = page.getByLabel('Local field');
  await input.fill('Installed tarball only');
  assert.equal(await input.inputValue(), 'Installed tarball only');
  const computed = await input.evaluate(e => {
    const s = getComputedStyle(e); return {radius: s.borderRadius, padding: s.paddingTop, font: s.fontSize};
  });
  assert.deepEqual(computed, {radius: '6px', padding: '7px', font: '12px'});
  result.checks.push('installed CSS renders native field');
  await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>[...document.fonts].some(f=>f.family==='StatePort Inter'&&f.status==='loaded')));
  const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const doc=await cdp.send('DOM.getDocument');const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'main h1'});
  const rendered=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});await cdp.detach();
  assert(rendered.fonts.some(f=>f.isCustomFont&&/Inter/.test(f.familyName)),JSON.stringify(rendered));
  result.fonts=rendered.fonts;result.checks.push('installed Inter file actually renders text, verified by Chromium platform fonts');

  await input.focus(); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'action');
  assert.equal(await page.locator('#action').evaluate(e => getComputedStyle(e).outlineWidth), '2px');
  result.checks.push('keyboard and focus visible');
  assert.equal(await page.locator('.sp-status').count(), 2);
  assert.match(await page.locator('main').innerText(), /Unknown[\s\S]*Stale/);
  result.checks.push('explicit neutral status text');
  for (const width of [960, 360]) {
    await page.setViewportSize({width, height: 900});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({path: out + '/consumer-' + width + '.png', fullPage: true});
  }
  assert(result.requests.every(url => url.startsWith('file://' + publicDir + '/')), 'consumer fetched outside its installed assets');
  assert.deepEqual(result.errors, []);
  result.checks.push('only clean-consumer files requested; no network or checkout source');
  result.status = 'PASS';
} catch (e) { result.status = 'FAIL'; result.error = String(e.stack || e); process.exitCode = 1; }
finally {
  await browser.close();
  await writeFile(out + '/consumer-verification.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
