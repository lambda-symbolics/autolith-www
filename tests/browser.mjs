import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('dist');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.cast':'application/json'};
const server = createServer(async (request, response) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  const file = path === root ? resolve(root, 'index.html') : path;
  try {
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = process.env.SITE_TEST_URL || `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const axe = await readFile('node_modules/axe-core/axe.min.js', 'utf8');
await mkdir('test-results', { recursive: true });

try {
  for (const [name, options] of [
    ['desktop', {viewport:{width:1440,height:1000}}],
    ['mobile', {viewport:{width:390,height:844}}],
    ['reduced', {viewport:{width:1440,height:1000},reducedMotion:'reduce'}],
    ['no-js', {viewport:{width:390,height:844},javaScriptEnabled:false}]
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(url, {waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    assert(await page.locator('h1').isVisible());
    const brokenLinks = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
      .filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
    assert.deepEqual(brokenLinks, []);
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
    await page.screenshot({path:`test-results/${name}-initial.png`});
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 ? [] :
      [...document.querySelectorAll('body *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1)
        .map(element => [element.tagName, element.id, element.className, Math.round(element.getBoundingClientRect().right)]).slice(0, 12));
    assert.deepEqual(overflow, [], name + ' horizontal overflow');

    if (name !== 'no-js') {
      const firstTab = page.locator('.hero [role="tab"]').first();
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.hero [role="tab"]').nth(1).getAttribute('aria-selected'), 'true');
      assert(await page.locator('[data-tabpanel="h-binary"]').isVisible());
      await page.locator('#replInput').fill('hello <script>');
      assert((await page.locator('#replOut').innerText()).includes('hello <script>'));
      assert.equal(await page.locator('#replOut script').count(), 0);
      if (name === 'mobile') {
        await page.locator('#burger').click();
        assert.equal(await page.locator('#burger').getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#burger').getAttribute('aria-expanded'), 'false');
        assert(await page.locator('#burger').evaluate(element => element === document.activeElement));
      }
      if (name === 'reduced') {
        assert(await page.locator('html').evaluate(element => element.classList.contains('still')));
        const before = await page.locator('#monolith').evaluate(canvas => canvas.toDataURL());
        await page.waitForTimeout(200);
        assert.equal(await page.locator('#monolith').evaluate(canvas => canvas.toDataURL()), before);
      } else {
        await page.locator('#motionToggle').click();
        assert.equal(await page.locator('#motionToggle').getAttribute('aria-pressed'), 'true');
      }
      await page.addScriptTag({content:axe});
      const violations = await page.evaluate(async () => (await axe.run(document, {
        runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}
      })).violations.map(item => ({id:item.id, nodes:item.nodes.map(node => node.target)})));
      assert.deepEqual(violations, [], name + ' accessibility');
      if (name === 'desktop') {
        const recording = page.waitForResponse(response => response.url().endsWith('/casts/oversized-context.cast'));
        await page.locator('.player__load').first().click();
        assert((await recording).ok());
        await page.locator('.player__poster.gone').first().waitFor({state:'attached'});
        await page.waitForTimeout(500);
      }
    } else {
      for (const panel of await page.locator('[data-tabpanel]').all()) assert(await panel.isVisible());
      assert(await page.locator('#navLinks').isVisible());
    }
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({path:`test-results/${name}.png`});
    assert.deepEqual(errors, [], name + ' browser errors');
    await context.close();
    console.log(`${name}: passed`);
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
