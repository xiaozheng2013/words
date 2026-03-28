import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const DIR = dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer((req, res) => {
  try {
    const file = join(DIR, req.url === '/' ? 'index.html' : req.url);
    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end();
  }
});

await new Promise(r => server.listen(0, 'localhost', r));
const { port } = server.address();

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();

const results = await new Promise(async (resolve) => {
  await page.exposeFunction('reportResults', resolve);
  await page.goto(`http://localhost:${port}/test_switch_user.html`);
  // Poll for results to appear then collect them
  await page.waitForFunction(() => document.querySelectorAll('#results li').length > 0, { timeout: 10000 });
  const items = await page.$$eval('#results li', els => els.map(el => ({ text: el.textContent, pass: el.classList.contains('pass') })));
  resolve(items);
});

let allPass = true;
for (const r of results) {
  console.log(r.text);
  if (!r.pass) allPass = false;
}

await browser.close();
server.close();
process.exit(allPass ? 0 : 1);
