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

async function runTestPage(url, expectedCount) {
  const p = await browser.newPage();
  await p.goto(url);
  await p.waitForFunction(
    (n) => document.querySelectorAll('#results li').length >= n,
    { timeout: 10000 }, expectedCount
  );
  const items = await p.$$eval('#results li', els => els.map(el => ({ text: el.textContent, pass: el.classList.contains('pass') })));
  await p.close();
  return items;
}

const suites = [
  { file: 'test_switch_user.html', count: 5 },
  { file: 'test_bulk_add.html',    count: 11 },
  { file: 'test_pwa.html',         count: 11 },
];

let allPass = true;
for (const suite of suites) {
  console.log(`\n── ${suite.file} ──`);
  const results = await runTestPage(`http://localhost:${port}/${suite.file}`, suite.count);
  for (const r of results) {
    console.log(r.text);
    if (!r.pass) allPass = false;
  }
}

await browser.close();
server.close();
process.exit(allPass ? 0 : 1);
