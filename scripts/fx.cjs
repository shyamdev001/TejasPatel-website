// Review captures for the 3D ring and the WebGL ripple.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  const shot = (n) => page.screenshot({ path: path.join(out, `fx-${n}.jpg`), type: 'jpeg', quality: 72 });

  await page.goto('http://localhost:3001/en/gallery', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(5000);
  await page.mouse.wheel({ deltaY: 520 });
  await sleep(2500);
  await shot('0-ring');
  const before = await page.evaluate(() => document.querySelector('[aria-roledescription="carousel"] > div').style.transform);
  await page.mouse.move(900, 450);
  await page.mouse.down();
  await page.mouse.move(500, 450, { steps: 12 });
  await page.mouse.up();
  await sleep(700);
  const after = await page.evaluate(() => document.querySelector('[aria-roledescription="carousel"] > div').style.transform);
  await shot('1-ring-dragged');
  await page.mouse.wheel({ deltaY: 1100 });
  await sleep(3000);
  const box = await page.evaluate(() => {
    const b = [...document.querySelectorAll('ul button')].map((x) => x.getBoundingClientRect()).find((r) => r.top > 90 && r.top < 500);
    return b ? { x: b.x, y: b.y, w: b.width, h: Math.min(b.height, 880 - b.y) } : null;
  });
  let ripple = null;
  if (box) {
    await page.mouse.move(box.x + box.w * 0.3, box.y + box.h * 0.4, { steps: 5 });
    await page.mouse.move(box.x + box.w * 0.55, box.y + box.h * 0.5, { steps: 10 });
    await sleep(500);
    ripple = await page.evaluate(() => {
      const c = document.querySelector('canvas[aria-hidden="true"][style*="pointer-events"]');
      return c ? { w: c.width, h: c.height, parent: c.parentElement.tagName } : null;
    });
    await page.screenshot({ path: path.join(out, 'fx-2-ripple.jpg'), type: 'jpeg', quality: 80, clip: { x: box.x, y: box.y + (await page.evaluate(() => window.scrollY)), width: box.w, height: box.h } });
  }
  console.log(JSON.stringify({ before, after, box: !!box, ripple, errors: [...new Set(errors)].slice(0, 5) }));
  await browser.close();
})();
