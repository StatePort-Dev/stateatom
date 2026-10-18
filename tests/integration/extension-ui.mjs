// SPDX-License-Identifier: Apache-2.0
// Actual Chromium CSS/keyboard checks. Does not infer evidence semantics from color.
import assert from 'node:assert/strict';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import path from 'node:path';
import {startBrowser, panelFor, chooseTab, select} from '../../scripts/harness.mjs';
import {startServer} from '../../scripts/inspection-server.mjs';
import {root} from '../../scripts/vite-config.mjs';

const tag = process.env.UI_TAG || new Date().toISOString().replaceAll(/[:.]/g, '-');
assert.match(tag, /^[\w-]+$/);
const out = path.join(root, '.artifacts/extension-ui/verification', tag);
await mkdir(out, {recursive: true});
const result = {status: 'RUNNING', checks: [], screenshots: [], errors: [],
  configuration: {browserPath: 'Browser plugin not available; existing Playwright native MV3 harness',
    sandbox: true, humanApprovedBaseline: false, viewports: [960, 360], zoom: 'CSS zoom 200% (not browser chrome zoom)'}};
const check = async (name, fn) => { await fn(); result.checks.push({name, status: 'PASS'}); };
let browser, server;
try {
  browser = await startBrowser(out + '/profiles', 'shared-ui');
  result.browser = browser.context.browser().version();
  const page = await browser.context.newPage();
  page.on('pageerror', e => result.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.goto('file://' + root + '/packages/extension-ui/showcase/index.html');
  await check('showcase identity and meaningful content', async () => {
    assert.equal(await page.title(), 'StatePort extension UI candidate');
    assert(await page.locator('h1').innerText());
    assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0);
  });
  await check('shared styles do not change any computed host-control property', async () => {
    const values = await page.evaluate(async () => {
      const sheets = [...document.styleSheets].filter(s => /\/(tokens|components)\.css$/.test(s.href));
      const fingerprint = () => ['host-control', 'host-button', 'host-input', 'host-status'].map(id => {
        const s = getComputedStyle(document.getElementById(id));
        return Object.fromEntries([...s].map(k => [k, s.getPropertyValue(k)]));
      });
      const enabled = fingerprint();
      sheets.forEach(s => s.disabled = true);
      await new Promise(requestAnimationFrame);
      const disabled = fingerprint();
      sheets.forEach(s => s.disabled = false);
      return {enabled, disabled, stylesheets: sheets.length};
    });
    assert.equal(values.stylesheets, 2);
    assert.deepEqual(values.enabled, values.disabled);
  });
  await check('keyboard focus, disabled skip and icon accessible name', async () => {
    await page.locator('#default-button').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'primary-button');
    const outline = await page.locator('#primary-button').evaluate(e => {
      const s = getComputedStyle(e); return {width: s.outlineWidth, style: s.outlineStyle};
    });
    assert.deepEqual(outline, {width: '2px', style: 'solid'});
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#action-status').innerText(), /primary-button/);
    await page.keyboard.press('Tab');
    assert.equal(await page.getByRole('button', {name: 'Refresh showcase'}).count(), 1);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'icon-button');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'long-button');
  });
  await check('labels, help/error association and native busy/disabled affordances', async () => {
    assert.equal(await page.getByRole('textbox', {name: 'App origin', exact: true}).count(), 1);
    const associations = await page.locator('[data-sp-ui]').evaluate(scope =>
      [...scope.querySelectorAll('input,select,textarea')].every(e => e.labels.length > 0));
    assert(associations);
    assert.equal(await page.locator('#invalid').getAttribute('aria-describedby'), 'name-error');
    assert.match(await page.locator('#name-error').innerText(), /^Error:/);
    assert(await page.locator('#busy-button').isDisabled());
    assert.equal(await page.locator('#busy-button').evaluate(e => getComputedStyle(e).borderTopStyle), 'dashed');
    assert.equal(await page.locator('#disabled-input').evaluate(e => getComputedStyle(e).opacity), '0.5');
    await page.getByLabel('Notes with a long descriptive label that wraps').fill('A synthetic edited note');
    assert.equal(await page.locator('#notes').inputValue(), 'A synthetic edited note');
  });
  await check('default and primary hover states', async () => {
    for (const id of ['default-button', 'primary-button']) {
      await page.mouse.move(0, 0);
      const before = await page.locator('#' + id).evaluate(e => getComputedStyle(e).backgroundColor);
      await page.locator('#' + id).hover();
      const after = await page.locator('#' + id).evaluate(e => getComputedStyle(e).backgroundColor);
      assert.notEqual(before, after, id);
    }
  });
  await check('navigation distinguishes current links without styling every link as active', async () => {
    const nav = await page.locator('.sp-nav').evaluate(e => {
      const current=getComputedStyle(e.querySelector('#nav-current')), other=getComputedStyle(e.querySelector('#nav-other'));
      return {current:current.color,other:other.color,decoration:other.textDecorationLine};
    });
    assert.notEqual(nav.current, nav.other);
    assert.equal(nav.other, 'rgb(100, 108, 122)');
    assert.equal(nav.decoration, 'none');
  });
  await check('text contrast >=4.5 and enabled field boundary contrast >=3', async () => {
    result.contrast = await page.evaluate(() => {
      const context = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
      function lum(color) {
        context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
        const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(x => {
          const v = x / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
        });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      }
      const ratio = (a, b) => (Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05);
      const style = id => getComputedStyle(document.getElementById(id));
      const primary = style('primary-button'), field = style('app-origin'), help = style('origin-help');
      const canvas = getComputedStyle(document.querySelector('[data-sp-ui]')).backgroundColor;
      return {primary: ratio(primary.color, primary.backgroundColor),
        helpOnCanvas: ratio(help.color, canvas), bodyOnField: ratio(field.color, field.backgroundColor),
        fieldBoundary: ratio(field.borderTopColor, field.backgroundColor)};
    });
    assert(result.contrast.primary >= 4.5, JSON.stringify(result.contrast));
    assert(result.contrast.helpOnCanvas >= 4.5, JSON.stringify(result.contrast));
    assert(result.contrast.bodyOnField >= 4.5, JSON.stringify(result.contrast));
    assert(result.contrast.fieldBoundary >= 3, JSON.stringify(result.contrast));
  });
  const shot = async (surface, name) => {
    // Commit resize/scroll paint before full-page capture (headless culling may
    // otherwise retain blank offscreen tiles after the keyboard scroll).
    await surface.evaluate(async () => {
      const paint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      scrollTo(0, document.documentElement.scrollHeight); await paint();
      scrollTo(0, 0);for(const e of document.querySelectorAll('.sp-extension-body'))e.scrollTop=0;await paint();
    });
    const file = name + '.png'; await surface.screenshot({path: path.join(out, file), fullPage: true});
    result.screenshots.push(file);
  };
  for (const width of [960, 360]) {
    await page.setViewportSize({width, height: 900});
    await check('showcase wraps long labels at ' + width, async () => {
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const bounds = await page.locator('#long-button').boundingBox();
      assert(bounds.width <= width);
      await page.locator('#notes').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'invalid');
      assert.equal(await page.locator('#invalid').evaluate(e => getComputedStyle(e).outlineWidth), '2px');
    });
    await shot(page, 'showcase-' + width);
  }
  await page.setViewportSize({width: 720, height: 900});
  await page.evaluate(() => document.documentElement.style.zoom = '2');
  await check('showcase 200% CSS zoom retains controls without horizontal overflow', async () => {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  });
  await shot(page, 'showcase-zoom-200');

  const panel = await panelFor(browser.context, browser.id);
  panel.on('pageerror', e => result.errors.push(e.message));
  await check('Atom starts without an invalid-tab error when no local app is open', async () => {
    await panel.locator('[data-atom-id="sources"]').filter({hasText: 'Source unavailable for this selection.'}).waitFor({timeout: 3000});
    assert.doesNotMatch(await panel.locator('#status').innerText(), /^Error:/);
  });
  await check('inspector composition keeps data before setup and footer within the viewport', async()=>{
    await panel.setViewportSize({width:440,height:900});
    await panel.evaluate(()=>document.fonts.ready);
    const geometry=await panel.evaluate(()=>{
      const root=document.querySelector('[data-atom-root]'),box=id=>root.querySelector('[data-atom-id="'+id+'"]').getBoundingClientRect();
      return {sourceTop:box('sources').top,footerBottom:root.querySelector('footer').getBoundingClientRect().bottom,headerHeight:root.querySelector('header').getBoundingClientRect().height,scrollHeight:box('scroll').height};
    });
    assert(geometry.sourceTop<400,JSON.stringify(geometry));assert.equal(geometry.footerBottom,900);assert.equal(geometry.headerHeight,57);
    assert(await panel.evaluate(()=>[...document.fonts].some(f=>f.family==='StatePort Inter'&&f.status==='loaded')));
    await panel.getByRole('button',{name:'Diagnostics',exact:true}).click();
    assert.equal(await panel.locator('#diagnostics-details').getAttribute('open'),'');
    assert.equal(await panel.locator('#diagnostics-nav').getAttribute('aria-current'),'location');
    await panel.locator('#diagnostics-details > summary').click();await panel.locator('#inputs-nav').click();
    assert.equal(await panel.locator('#inputs-nav').getAttribute('aria-current'),'location');
    await panel.setViewportSize({width:1280,height:900});
  });
  const reader = await browser.context.newPage();
  await reader.goto('file://' + root + '/dist/reader/reader.html');
  for (const [name, surface] of [['atom-panel', panel], ['atom-reader', reader]]) {
    await check(name + ' consumes exported tokens and native control styles', async () => {
      const style = await surface.locator('input:not([type=checkbox]),select:not([data-atom-id="property"])').first().evaluate(e => {
        const s = getComputedStyle(e); return [s.borderRadius, s.paddingTop, s.paddingRight];
      });
      assert.deepEqual(style, ['6px', '7px', '11px']);
      assert.equal(await surface.locator('[data-sp-ui]').count(), 1);
      if (name === 'atom-panel') {
        const geometry = await surface.locator('[data-atom-root]').evaluate(e => ({width:e.getBoundingClientRect().width,font:getComputedStyle(e).fontSize,background:getComputedStyle(e.querySelector('.sp-code')).backgroundColor}));
        assert.equal(geometry.width, 440);
        assert.equal(geometry.font, '13px');
        assert.equal(geometry.background, 'rgb(23, 31, 48)');
        assert.equal(await surface.locator('#property').evaluate(e=>getComputedStyle(e).fontSize),'11px');
      }
    });
    for (const width of [960, 360]) {
      await surface.setViewportSize({width, height: 900});
      await check(name + ' has no overflow at ' + width, async () => {
        assert(await surface.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      });
      await shot(surface, name + '-' + width);
    }
    await surface.setViewportSize({width: 720, height: 900});
    await surface.evaluate(() => document.documentElement.style.zoom = '2');
    await check(name + ' remains usable at 200% CSS zoom', async () => {
      assert(await surface.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    });
    await shot(surface, name + '-zoom-200');
  }
  // Actual selected property, stale state and export dialog at narrow sizes.
  // This uses the existing browser-only fixture, without IDE or instrumentation.
  server = await startServer('A');
  const app = await browser.context.newPage();
  await app.goto('http://127.0.0.1:4173/react/'); await app.locator('#p1').waitFor();
  await panel.evaluate(() => document.documentElement.style.zoom = '1');
  await chooseTab(panel, '/react/'); await panel.locator('#attach').click();
  await panel.locator('#status').filter({hasText: /^OK$/}).waitFor();
  await app.reload(); await app.locator('#p1').waitFor();
  await select(panel, app, '#p1');
  await check('selected browser-only property retains explicit Unknown evidence', async () => {
    assert.match(await panel.locator('#selected').innerText(), /13/);
    assert.match(await panel.locator('#atom-summary').innerText(), /Unknown\/Unsupported/);
  });
  for (const width of [960, 360]) {
    await panel.setViewportSize({width, height: 900});
    assert(await panel.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await shot(panel, 'atom-selected-' + width);
  }
  await app.reload(); await app.locator('#p1').waitFor();
  await panel.locator('#refresh-tabs').click();
  await check('page reload preserves visible Stale text', async () => {
    await panel.locator('#freshness').filter({hasText: /^Stale/}).waitFor();
    assert.match(await panel.locator('#atom-summary').innerText(), /^Stale/);
  });
  await shot(panel, 'atom-stale-360');
  await panel.locator('#load').click(); await panel.locator('#status').filter({hasText: /^OK$/}).waitFor();
  await panel.locator('#diagnostics-details > summary').click();
  await panel.locator('#diagnostic-notes').fill('Synthetic shared UI narrow export check');
  await panel.locator('#save-report').click(); await panel.locator('#diagnostic-status').filter({hasText: /^Saved/}).waitFor();
  await panel.locator('#export-report').click();
  await check('narrow export dialog keeps labelled text and all actions reachable', async () => {
    assert(await panel.getByRole('textbox', {name: 'Exact JSON to download'}).isVisible());
    const bounds = await panel.locator('#export-review').boundingBox(); assert(bounds.width <= 360);
    assert(await panel.locator('#export-review').evaluate(e => e.scrollWidth <= e.clientWidth + 1));
    for (const id of ['export-omit-content', 'export-cancel', 'export-confirm']) assert(await panel.locator('#' + id).isVisible());
  });
  await shot(panel, 'atom-export-dialog-360');
  const preview = await panel.locator('#export-json').inputValue(), downloading = panel.waitForEvent('download');
  await panel.locator('#export-confirm').click();
  const diagnostic = out + '/synthetic.stateatom.json'; await (await downloading).saveAs(diagnostic);
  assert.equal(await readFile(diagnostic, 'utf8'), preview);
  await reader.evaluate(() => document.documentElement.style.zoom = '1');
  await reader.locator('#diagnostic-file').setInputFiles(diagnostic);
  await reader.locator('#reader-status').filter({hasText: /^Imported historical/}).waitFor();
  for (const width of [960, 360]) {
    await reader.setViewportSize({width, height: 900});
    assert(await reader.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await shot(reader, 'atom-imported-reader-' + width);
  }
  await check('reviewed export loads as inert historical data in the shared reader', async () => {
    assert.match(await reader.locator('#reader-summary').innerText(), /Synthetic shared UI narrow export check/);
  });
  await check('no page exceptions or showcase console errors', async () => assert.deepEqual(result.errors, []));
  result.status = 'PASS';
} catch (e) {
  result.status = 'FAIL'; result.error = String(e.stack || e); process.exitCode = 1;
} finally {
  await browser?.context.close();
  await server?.close();
  await writeFile(path.join(out, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(result.status, result.checks.length, out);
  if (result.error) console.error(result.error);
}
