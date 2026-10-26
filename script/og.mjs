// Capture dist/og-card.html as the 1200 by 630 Open Graph image in public/og.png.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('dist');
const types = {'.html':'text/html', '.css':'text/css', '.png':'image/png',
  '.svg':'image/svg+xml', '.woff2':'font/woff2'};
const server = createServer(async (request, response) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    response.end(await readFile(path));
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
try {
  const page = await browser.newPage({viewport:{width:1200, height:630}});
  await page.goto(`http://127.0.0.1:${server.address().port}/og-card.html`, {waitUntil:'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:'public/og.png'});
} finally {
  await browser.close();
  server.close();
}
