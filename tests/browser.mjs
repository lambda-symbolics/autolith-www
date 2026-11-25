import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('dist');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
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
    assert.equal(await page.locator('#context + #screenshots + #install').count(), 1);
    assert.equal(await page.locator('#navLinks a').last().getAttribute('href'), '#context');

    const gallery = page.locator('#screenshots');
    const images = gallery.locator('img');
    assert.equal(await images.count(), 3);
    const controls = gallery.getByRole('group', {name:'Screenshot controls'});
    if (name === 'no-js') {
      assert.equal(await controls.count(), 0);
      assert.equal(await images.filter({visible:true}).count(), 3);
    } else {
      const previous = controls.getByRole('button', {name:'Previous screenshot'});
      const next = controls.getByRole('button', {name:'Next screenshot'});
      const counter = controls.getByRole('status');
      async function checkSlide(index) {
        assert(await images.nth(index).isVisible());
        assert.equal(await images.filter({visible:true}).count(), 1);
        assert.equal(await counter.textContent(), `0${index + 1} / 03`);
      }
      await checkSlide(0);
      await previous.click();
      await checkSlide(2);
      await next.click();
      await checkSlide(0);
      await next.press('Enter');
      await checkSlide(1);
      await next.press('ArrowRight');
      await checkSlide(2);
      await next.press('ArrowLeft');
      await checkSlide(1);
      await next.press('End');
      await checkSlide(2);
      await next.press('Home');
      await checkSlide(0);
      assert(await next.evaluate(button => button === document.activeElement));
      const imageBounds = await images.first().boundingBox();
      const counterBounds = await counter.boundingBox();
      assert(counterBounds.y >= imageBounds.y + imageBounds.height);
      assert(Math.abs(counterBounds.x + counterBounds.width / 2 - imageBounds.x - imageBounds.width / 2) <= 1);
    }
    const shownImages = images.filter({visible:true});
    for (const image of await shownImages.all()) {
      await image.scrollIntoViewIfNeeded();
      assert(await image.evaluate(async element => {
        await element.decode();
        return element.naturalWidth > 0 && element.closest('a').href === element.currentSrc
          && document.documentElement.scrollWidth <= innerWidth + 1;
      }), `${name}: screenshot must fit and link to the full image`);
    }
    if (name !== 'no-js') {
      await gallery.screenshot({path:`test-results/${name}-screenshots.png`});
    }

    for (const block of await page.locator('.shellblock').all()) {
      const commands = await block.locator('b').allTextContents();
      const lines = (await block.textContent()).split('\n').map(line => line.replace(/^\$ /, ''));
      assert.deepEqual(lines, commands, 'Shell commands need real line separators');
      if (await block.isVisible()) {
        const tops = await block.locator('b').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
        assert(tops.every((top, index) => index === 0 || top > tops[index - 1]), 'Each command must occupy its own line');
      }
    }
    if (name === 'desktop') {
      await page.locator('.install__auth').screenshot({path:'test-results/provider-commands.png'});
    }

    const friends = page.locator('.foot__friends li');
    const columns = await friends.evaluateAll(items => new Set(items.map(item => item.getBoundingClientRect().left)).size);
    assert.equal(columns, 2, `${name}: footer friend links should occupy two columns`);
    if (name !== 'no-js') {
      const firstTab = page.locator('.hero [role="tab"]').first();
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.hero [role="tab"]').nth(1).getAttribute('aria-selected'), 'true');
      assert(await page.locator('[data-tabpanel="h-binary"]').isVisible());

      const slides = page.locator('#knowledge [role="tabpanel"]');
      const tabs = page.locator('#knowledge [role="tab"]');
      assert.equal(await tabs.count(), 3);
      assert.equal(await slides.filter({visible:true}).count(), 1);
      await tabs.first().focus();
      await page.keyboard.press('ArrowRight');
      assert(await slides.nth(1).isVisible());
      assert(await tabs.nth(1).evaluate(tab => tab === document.activeElement));
      await page.keyboard.press('End');
      assert(await slides.last().isVisible());
      await page.keyboard.press('ArrowRight');
      assert(await slides.first().isVisible());
      for (const tab of await tabs.all()) {
        await tab.click();
        const panel = page.locator('#' + await tab.getAttribute('aria-controls'));
        assert(await panel.isVisible());
        assert.equal(await slides.filter({visible:true}).count(), 1);
        assert.equal(await tab.getAttribute('aria-selected'), 'true');
        assert(await panel.evaluate(element => document.documentElement.scrollWidth <= innerWidth + 1
          && element.scrollWidth <= element.clientWidth + 1), `${name}: ${panel} overflow`);
        if (name === 'desktop' || name === 'mobile') {
          await page.locator('#knowledge .kb__carousel').screenshot({path:`test-results/${name}-${await tab.getAttribute('id')}.png`});
        }
      }
      if (name === 'mobile') {
        // The narrow bar drops the section links and keeps the mark and the
        // call to action. Nothing is left behind an overlay.
        assert(await page.locator('.nav .brand svg').isVisible());
        assert(await page.locator('.nav__cta').isVisible());
        assert.equal(await page.locator('#navLinks').isVisible(), false);
        assert.equal(await page.locator('#burger, .menu').count(), 0);
      }
      assert.equal(await page.locator('html').evaluate(element => element.classList.contains('still')), false);
      const canvases = page.locator('.plate__c, #swell');
      assert.equal(await canvases.count(), 6);
      for (const canvas of await canvases.all()) {
        await canvas.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        const label = await canvas.getAttribute('data-plate') || 'swell';
        const dimensions = await canvas.evaluate(element => [element.width, element.height]);
        assert(dimensions.every(size => size > 8), `${name}: ${label} initialized while hidden`);
        const before = await canvas.evaluate(element => element.toDataURL());
        await page.waitForTimeout(250);
        assert.notEqual(await canvas.evaluate(element => element.toDataURL()), before,
          `${name}: ${label} must animate when visible`);
        if (name === 'desktop') await canvas.screenshot({path:`test-results/figure-${label}.png`});
      }
      const viewport = page.viewportSize();
      await page.setViewportSize({width:viewport.width - 10, height:viewport.height});
      await page.locator('#swell').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const wave = await page.locator('#swell').evaluate(canvas => canvas.toDataURL());
      await page.waitForTimeout(250);
      assert.notEqual(await page.locator('#swell').evaluate(canvas => canvas.toDataURL()), wave,
        'Footer wave must keep animating after resize');
      await page.setViewportSize(viewport);
      await page.addScriptTag({content:axe});
      const violations = await page.evaluate(async () => (await axe.run(document, {
        runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}
      })).violations.map(item => ({id:item.id, nodes:item.nodes.map(node => node.target)})));
      assert.deepEqual(violations, [], name + ' accessibility');
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
