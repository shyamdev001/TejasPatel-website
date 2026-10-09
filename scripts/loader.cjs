// Review capture of the preloader: one frame every ~300ms from first paint.
// Usage: node scripts/loader.cjs [path] [mobile]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const [, , route = '/en', device = 'desktop'] = process.argv;
const mobile = device === 'mobile';
const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  // warm the dev compiler so timings reflect the animation, not the build
  await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle2', timeout: 120000 });
  const t0 = Date.now();
  await page.goto('http://localhost:3001' + route, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const stamps = [];
  for (let i = 0; i < 16; i++) {
    await page.screenshot({ path: path.join(out, `load-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 70 });
    stamps.push(Date.now() - t0);
    await sleep(250);
  }
  console.log(JSON.stringify({ stamps, errors: [...new Set(errors)] }));
  await browser.close();
})();
