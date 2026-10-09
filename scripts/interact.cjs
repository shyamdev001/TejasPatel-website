// Review captures of interactive states: menu, page wipe, language switch, hover reveal.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  const shot = (n) => page.screenshot({ path: path.join(out, `ix-${n}.jpg`), type: 'jpeg', quality: 70 });

  await page.goto('http://localhost:3001/en', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(1200);
  await shot('0-preloader');
  await sleep(4200);
  await page.click('header button[aria-controls="site-menu"]');
  await sleep(1600);
  await shot('1-menu');
  await page.click('#site-menu a[href="/en/awards"]');
  await sleep(900);
  await shot('2-wipe');
  await page.waitForFunction(() => location.pathname === '/en/awards', { timeout: 20000 });
  await sleep(2600);
  await shot('3-awards');
  const box = await page.evaluate(() => {
    const r = document.querySelectorAll('li[data-row]')[2]?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, height: r.height } : null;
  });
  if (!box) throw new Error('no award rows: ' + (await page.evaluate(() => document.body.innerText.slice(0, 300))));
  await page.mouse.move(box.x + 500, box.y + box.height / 2, { steps: 8 });
  await sleep(1200);
  await shot('4-award-hover');
  await page.click('header a[lang="gu"]');
  await page.waitForFunction(() => location.pathname === '/gu/awards', { timeout: 20000 });
  await sleep(2600);
  await shot('5-gu-awards');
  console.log(JSON.stringify({ path: await page.evaluate(() => location.pathname), errors: [...new Set(errors)].slice(0, 6) }));
  await browser.close();
})();
