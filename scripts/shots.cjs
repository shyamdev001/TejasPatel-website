// Review captures: scrolls a page with real motion and writes one frame per viewport.
// Usage: node scripts/shots.cjs <path> <name> [mobile] [maxFrames]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const [, , route = '/en', name = 'home', device = 'desktop', max = '30'] = process.argv;
const mobile = device === 'mobile';
const vp = mobile
  ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
  : device === 'tablet'
    ? { width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
    : { width: 1440, height: 900, deviceScaleFactor: 1 };
const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport(vp);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(5200);
  let i = 0;
  let last = -1;
  for (; i < Number(max); i++) {
    await page.screenshot({ path: path.join(out, `${name}-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 70 });
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === last) break;
    last = y;
    if (mobile || device === 'tablet') await page.evaluate((h) => window.scrollBy(0, h), vp.height * 0.9);
    else await page.mouse.wheel({ deltaY: vp.height * 0.9 });
    await sleep(1700);
  }
  const info = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - window.innerWidth }));
  console.log(JSON.stringify({ name, frames: i, ...info, errors: [...new Set(errors)].slice(0, 6) }));
  await browser.close();
})();
