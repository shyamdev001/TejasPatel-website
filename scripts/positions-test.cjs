// Positions section checks: tab switching speed, no stranded viewport, reveals below still fire, phone tab row.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(__dirname, '..', '.impeccable', 'review');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const results = [];
  const errors = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);

  // ---- desktop ----
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3001/en', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(5200);
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const wheelTo = async (fn) => {
    for (let k = 0; k < 40; k++) {
      const d = await ev(fn);
      if (Math.abs(d) < 8) break;
      await page.mouse.wheel({ deltaY: Math.max(-1200, Math.min(1200, d)) });
      await sleep(350);
    }
    await sleep(900);
  };
  // go deep into the long chairman list: last row near the top of the screen
  await wheelTo(() => Math.round(document.querySelector('#pos-panel li:last-child').getBoundingClientRect().top - 200));
  const sticky = await ev(() => Math.round(document.querySelector('#pos-tab-exDirector').getBoundingClientRect().top));
  check('role tabs stay on screen while reading a long list', sticky > 0 && sticky < 900, 'tab top ' + sticky);
  await page.screenshot({ path: path.join(out, 'pos-0.jpg'), type: 'jpeg', quality: 72 });

  const t0 = Date.now();
  await page.click('#pos-tab-exDirector');
  await page.waitForFunction(() => { const li = document.querySelector('#pos-panel li'); return li && /Amul/.test(li.textContent) && Number(getComputedStyle(li).opacity) > 0.9; }, { timeout: 5000 });
  check('new list is readable quickly after choosing a role', Date.now() - t0 < 1300, Date.now() - t0 + 'ms');
  await sleep(1600);
  const after = await ev(() => { const r = document.querySelector('#pos-panel li').getBoundingClientRect(); const s = document.querySelector('#pos-panel').closest('section').getBoundingClientRect(); return { rowTop: Math.round(r.top), sectionTop: Math.round(s.top), sectionBottom: Math.round(s.bottom) }; });
  check('reader is not stranded below a shorter list', after.rowTop > 0 && after.rowTop < 800, JSON.stringify(after));
  await page.screenshot({ path: path.join(out, 'pos-1.jpg'), type: 'jpeg', quality: 72 });

  // reveals below must still fire where they are now, not where they used to be
  await wheelTo(() => Math.round(document.querySelector('dl').getBoundingClientRect().top - 300));
  await sleep(2600);
  const stats = await ev(() => { const d = document.querySelector('dl > *'); const col = document.querySelector('[data-digit]'); return { opacity: getComputedStyle(d).opacity, rolled: getComputedStyle(col).transform !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(col).transform) }; });
  check('stats below still animate in at the right moment', stats.opacity === '1' && stats.rolled, JSON.stringify(stats));
  const rows = await ev(() => [...document.querySelectorAll('#pos-panel li p')].map((p) => p.textContent).join(' | '));
  check('no doubled spaces or loose hyphens in the years', !/\s{2,}|\d -\d|\( /.test(rows), rows.slice(0, 80));
  await page.close();

  // ---- phone ----
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await m.goto('http://localhost:3001/gu', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(5200);
  await m.evaluate(() => document.querySelector('[role="tablist"]').scrollIntoView({ block: 'center' }));
  await sleep(900);
  await m.evaluate(() => document.querySelector('#pos-tab-social_org').click());
  await sleep(1600);
  const mob = await m.evaluate(() => { const b = document.querySelector('#pos-tab-social_org').getBoundingClientRect(); return { left: Math.round(b.left), right: Math.round(b.right), vw: innerWidth, over: document.documentElement.scrollWidth - innerWidth, rows: document.querySelectorAll('#pos-panel li').length }; });
  check('phone: the chosen tab scrolls into view', mob.left >= 0 && mob.right <= mob.vw, JSON.stringify(mob));
  check('phone: no sideways overflow', mob.over <= 1);
  await m.screenshot({ path: path.join(out, 'pos-m.jpg'), type: 'jpeg', quality: 72 });
  await m.close();

  console.log(results.join('\n'));
  console.log('console errors:', JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
