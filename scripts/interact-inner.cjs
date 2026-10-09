// Review captures of inner-page interactions: press accordion and tabs, gallery lightbox, contact validation.
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
  let n = 0;
  const shot = (name) => page.screenshot({ path: path.join(out, `in-${String(n++).padStart(2, '0')}-${name}.jpg`), type: 'jpeg', quality: 70 });
  const open = async (route) => {
    await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(4800);
  };
  const clickAt = async (sel, index = 0) => {
    const box = await page.evaluate(
      (s, i) => {
        const el = document.querySelectorAll(s)[i];
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      },
      sel,
      index,
    );
    if (!box) throw new Error('not found: ' + sel);
    await sleep(900);
    const fresh = await page.evaluate((s, i) => { const r = document.querySelectorAll(s)[i].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel, index);
    await page.mouse.click(fresh.x, fresh.y);
  };

  await open('/en/press');
  await clickAt('button[aria-controls^="art-"]', 1);
  await sleep(1600);
  await shot('press-open');
  await clickAt('[role="tab"]', 4);
  await sleep(1500);
  await shot('press-videos');

  await open('/en/gallery');
  await clickAt('main ul button', 2);
  await sleep(1600);
  await shot('gallery-lightbox');
  await page.keyboard.press('ArrowRight');
  await sleep(900);
  await page.keyboard.press('Escape');
  await sleep(1300);
  await clickAt('[role="tab"]', 1);
  await sleep(2200);
  await shot('gallery-2025');

  await open('/en/contact');
  await clickAt('button[type="submit"]');
  await sleep(900);
  await shot('contact-error');
  await page.type('#f-first', 'Ravi');
  await page.type('#f-email', 'ravi@example.com');
  await page.type('#f-message', 'Namaste');
  await sleep(500);
  await shot('contact-filled');

  console.log(JSON.stringify({ errors: [...new Set(errors)] }));
  await browser.close();
})();
