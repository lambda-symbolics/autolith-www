import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

// Run the real server against disposable copy files, never the working tree.
const root = resolve('.');
const isolated = await mkdtemp(join(tmpdir(), 'autolith-editor-'));
let server;
let browser;
let output = '';
try {
  for (const entry of ['autolith-www.asd', 'script', 'src', 'content', 'public', 'vendor']) {
    await cp(join(root, entry), join(isolated, entry), { recursive: true });
  }
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const url = `http://127.0.0.1:${port}/`;
  server = spawn('./script/edit', [String(port)], { cwd: isolated, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  server.on('error', error => { output += error.message; });
  const deadline = Date.now() + 120000;
  while (true) {
    if (server.exitCode !== null) throw new Error(`Editor exited: ${output}`);
    let response;
    try { response = await fetch(url); } catch {}
    if (response) {
      assert.equal(response.status, 200, `Editor render failed: ${output.slice(0, 4000)}`);
      break;
    }
    if (Date.now() > deadline) throw new Error(`Editor startup timed out: ${output}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  const field = page.locator('.edit-field[data-edit]').first();
  assert(await field.isVisible(), 'In-page copy must be editable');
  const designator = await field.getAttribute('data-edit');
  const selector = `[data-edit="${designator}"]`;
  const file = join(isolated, 'content', designator.split(':')[0] + '.sexp');
  const initial = await readFile(file, 'utf8');
  const value = 'Editor round trip "quoted" \\ λ <safe>';
  await field.fill(value);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+b');
  const saved = page.waitForResponse(response => response.url() === url + 'copy' && response.request().method() === 'POST');
  await page.keyboard.press('Escape');
  assert.equal((await saved).status(), 200);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator(selector).textContent(), value);
  assert.equal(await page.locator(selector + ' strong').textContent(), value);
  assert.equal(await page.locator(selector + ' script').count(), 0);
  assert.notEqual(await readFile(file, 'utf8'), initial, 'Save must reach the content file');
  const leadingComment = initial.match(/^(;[^\n]*)/);
  if (leadingComment) assert((await readFile(file, 'utf8')).startsWith(leadingComment[1]));

  // Metadata and command copy without a page position is editable in the panel.
  await page.locator('.edit-panel summary').click();
  const panel = page.locator('.edit-panel [data-edit-form="text"]').first();
  const panelDesignator = await panel.getAttribute('data-edit');
  const panelValue = 'Editor panel round trip λ';
  await panel.fill(panelValue);
  const panelSaved = page.waitForResponse(response => response.url() === url + 'copy' && response.request().postData()?.includes(encodeURIComponent(panelDesignator)));
  await page.keyboard.press('Control+s');
  assert.equal((await panelSaved).status(), 200);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator(`[data-edit="${panelDesignator}"]`).inputValue(), panelValue);

  // Discover sections from the rendered editor, so reorganization needs no inventory.
  const sectionFields = await page.locator('section').evaluateAll(sections => sections.map(section => {
    const field = section.querySelector('.edit-field[data-edit]');
    return field?.dataset.edit;
  }).filter(Boolean));
  assert(sectionFields.length > 0, 'Rendered sections need editable copy');
  const roundTrips = [...new Set(sectionFields)].map((copy, index) => ({
    copy, text: `Section editor round trip ${index} λ`
  }));
  for (const { copy, text } of roundTrips) {
    const response = await page.request.post(url + 'copy', { form: { copy, value: `(${JSON.stringify(text)})` } });
    assert.equal(response.status(), 200, copy);
  }
  await page.reload({ waitUntil: 'networkidle' });
  for (const { copy, text } of roundTrips) {
    assert.equal(await page.locator(`.edit-field[data-edit="${copy}"]`).first().textContent(), text, copy);
  }

  // Invalid markup, unsafe links, reader evaluation and missing keys fail atomically.
  const beforeInvalid = await readFile(file, 'utf8');
  for (const invalid of ['((:script () "unsafe"))', '((:a (:href "javascript:alert(1)") "unsafe"))', '#.(error "reader evaluation")']) {
    const response = await page.request.post(url + 'copy', { form: { copy: designator, value: invalid } });
    assert.equal(response.status(), 400, invalid);
    assert.equal(await readFile(file, 'utf8'), beforeInvalid, 'Rejected saves must not alter copy');
  }
  const missing = await page.request.post(url + 'copy', { form: { copy: 'hero:nonexistent-editor-test', value: '("invalid")' } });
  assert.equal(missing.status(), 400);
  assert.equal(await readFile(file, 'utf8'), beforeInvalid);
  assert.deepEqual(errors, []);

  // The deployment output contains neither the editing interface nor its assets.
  const production = await readFile(join(root, 'dist/index.html'), 'utf8');
  assert(!production.includes('data-edit='));
  assert(!production.includes('/edit/editor'));
  await assert.rejects(stat(join(root, 'dist/edit')), { code: 'ENOENT' });
  console.log(`Editor: ${roundTrips.length} sections, edit/save/reload, formatting, escaping, panel, rejected saves and production isolation passed.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const stopped = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await stopped;
  }
  await rm(isolated, { recursive: true, force: true });
}
