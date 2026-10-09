// Hero checks: geometry at many screen shapes, both languages, plus role-label fit.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = [[1024, 1366], [2560, 1080], [1536, 730], [1366, 600], [1180, 820], [844, 390], [667, 375], [412, 915], [320, 568]];

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  let i = 0;
  for (const [w, h] of SIZES)
    for (const lang of ['en', 'gu']) {
      await page.setViewport({ width: w, height: h, isMobile: w < 900, hasTouch: w < 900 });
      await page.goto(`http://localhost:3001/${lang}`, { waitUntil: 'networkidle2', timeout: 120000 });
      await sleep(5600);
      if (lang === 'en' || w === 1366 || w === 320) await page.screenshot({ path: path.join(out, `h-${String(i++).padStart(2, '0')}-${w}x${h}-${lang}.jpg`), type: 'jpeg', quality: 70 });
      const o = await page.evaluate(() => {
        const R = (s) => document.querySelector(s)?.getBoundingClientRect();
        const img = document.querySelector('[data-portrait] img');
        const box = R('[data-portrait]');
        // the painted portrait inside its object-contain box
        const ratio = img.naturalWidth / img.naturalHeight;
        const ph = Math.min(box.height, box.width / ratio);
        const pw = ph * ratio;
        const person = { left: box.left + (box.width - pw) / 2, right: box.left + (box.width + pw) / 2, top: box.bottom - ph, bottom: box.bottom };
        const plot = R('[data-plot]');
        const info = R('[data-info] > div');
        const stage = R('[data-plot]').bottom;
        const first = R('[data-first] [data-name]');
        const last = R('[data-last] [data-name]');
        const header = R('header');
        const role = document.querySelector('[data-info] p span.relative');
        const issues = [];
        const desktop = window.innerWidth >= 1024;
        if (plot.top < person.top + ph * 0.08) issues.push(`plot rises above his shoulders (plot top ${Math.round(plot.top)}, head top ${Math.round(person.top)})`);
        if (person.top < header.bottom - 4) issues.push(`head runs under the header (${Math.round(person.top)} < ${Math.round(header.bottom)})`);
        if (desktop && info.right > person.left + pw * 0.12) issues.push(`text column reaches the portrait (${Math.round(info.right)} > ${Math.round(person.left)})`);
        if (desktop && info.top < first.bottom - 8 && info.left < first.right) issues.push(`text column collides with the first name (info top ${Math.round(info.top)}, name bottom ${Math.round(first.bottom)})`);
        if (first.right > window.innerWidth || last.left < 0) issues.push('name wider than the screen');
        if (first.bottom > last.top + 4 && !desktop) issues.push('the two name lines overlap');
        if (ph < window.innerHeight * 0.35 && window.innerHeight > 500) issues.push(`portrait is small (${Math.round(ph)}px of ${window.innerHeight})`);
        if (stage > window.innerHeight + 2 && desktop) issues.push('hero taller than the screen on desktop');
        if (role && role.firstElementChild && role.firstElementChild.scrollWidth > role.clientWidth + 2) issues.push('role label is cut off');
        if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push('sideways overflow');
        return issues;
      });
      console.log(`${w}x${h} ${lang}: ${o.length ? o.join('; ') : 'ok'}`);
    }
  console.log('errors', JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
