// Projects stack checks: every card fully readable and clickable while it is in place, photos revealed, links work.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(__dirname, '..', '.impeccable', 'review');
fs.mkdirSync(out, { recursive: true });
const BASE = 'http://localhost:3001';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const results = [];
  const errors = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  const CASES = [
    ['1440x900 en', { width: 1440, height: 900 }, 'en'],
    ['1366x600 en', { width: 1366, height: 600 }, 'en'],
    ['1280x720 gu', { width: 1280, height: 720 }, 'gu'],
    ['1024x768 gu', { width: 1024, height: 768 }, 'gu'],
    ['820x1180 en', { width: 820, height: 1180, isMobile: true, hasTouch: true }, 'en'],
    ['390x844 gu', { width: 390, height: 844, isMobile: true, hasTouch: true }, 'gu'],
  ];
  for (const [name, vp, lang] of CASES) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    await page.setViewport(vp);
    await page.goto(`${BASE}/${lang}`, { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(5200);
    const desktop = vp.width >= 1024;
    const count = await page.evaluate(() => document.querySelectorAll('[data-card]').length);
    const bad = [];
    for (let i = 0; i < count; i++) {
      // bring card i to its resting place: stuck under the header on desktop, top of screen on touch layouts
      for (let k = 0; k < 60; k++) {
        const d = await page.evaluate((i, desktop) => {
          const c = document.querySelectorAll('[data-card]')[i];
          const target = desktop ? parseFloat(getComputedStyle(c).top) || 80 : 90;
          // the wrapper's natural position: use its parent offset so a stuck card still reports distance left
          // offsetTop of a stuck sticky box is its stuck position, so add up the cards before it instead
          const all = [...document.querySelectorAll('[data-card]')];
          const natural = c.parentElement.getBoundingClientRect().top + all.slice(0, i).reduce((h, x) => h + x.offsetHeight, 0);
          return Math.round(natural - target);
        }, i, desktop);
        if (Math.abs(d) < 6) break;
        const step = Math.max(-900, Math.min(900, d));
        if (vp.isMobile) await page.evaluate((s) => window.scrollBy(0, s), step);
        else await page.mouse.wheel({ deltaY: step });
        await sleep(300);
      }
      await sleep(2200);
      const r = await page.evaluate((i) => {
        const c = document.querySelectorAll('[data-card]')[i];
        const art = c.querySelector('article');
        const btn = c.querySelector('a.btn');
        const title = c.querySelector('h3');
        const img = c.querySelector('img');
        const b = btn.getBoundingClientRect();
        const t = title.getBoundingClientRect();
        const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        const clip = getComputedStyle(c.querySelector('[data-img]')).clipPath;
        return {
          title: title.textContent.slice(0, 18),
          btnOnScreen: b.bottom <= innerHeight - 2 && b.top >= 0,
          btnClickable: !!top && btn.contains(top),
          titleOnScreen: t.top >= 0 && t.bottom <= innerHeight,
          imgLoaded: img.complete && img.naturalWidth > 0,
          imgOpen: clip === 'none' || /inset\(0(px|%)?( 0(px|%)?){0,3}\)/.test(clip),
          clip,
          cardH: Math.round(art.getBoundingClientRect().height),
          room: innerHeight - Math.round(art.getBoundingClientRect().top),
          titleFits: title.scrollWidth <= title.clientWidth + 2,
        };
      }, i);
      const problems = [];
      if (!r.btnOnScreen) problems.push(`button below the screen (card ${r.cardH}px, room ${r.room}px)`);
      else if (!r.btnClickable) problems.push('button covered');
      if (!r.titleOnScreen) problems.push('title cut');
      if (!r.titleFits) problems.push('title overflows its column');
      if (!r.imgLoaded) problems.push('photo not loaded');
      if (!r.imgOpen) problems.push('photo not revealed (' + r.clip + ')');
      if (problems.length) bad.push(`#${i + 1} ${r.title}: ${problems.join(', ')}`);
      if ((name === '1366x600 en' && i === 0) || (name === '1024x768 gu' && i === 2) || (name === '390x844 gu' && i === 1) || (name === '1440x900 en' && i === 3)) await page.screenshot({ path: path.join(out, `proj-${name.replace(/ /g, '-')}.jpg`), type: 'jpeg', quality: 72 });
    }
    check(`${name}: all ${count} cards readable, clickable, photo shown`, !bad.length, bad.join(' | '));
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${name}: no sideways overflow`, over <= 1);
    await page.close();
  }

  // links
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(5000);
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('[data-card] a.btn')].map((a) => a.getAttribute('href')));
  const codes = [];
  for (const h of hrefs) codes.push((await fetch(BASE + h)).status);
  check('every card links to a page that exists', codes.every((c) => c === 200) && new Set(hrefs).size === hrefs.length, hrefs.map((h, i) => `${h}:${codes[i]}`).join(' '));
  await page.evaluate(() => document.querySelector('[data-card] a.btn').click());
  await page.waitForFunction((h) => location.pathname === h, { timeout: 20000 }, hrefs[0]);
  await sleep(2500);
  check('clicking a card opens its project page', await page.evaluate(() => !!document.querySelector('main h1')));
  await page.goBack();
  await sleep(2500);
  check('back from a project returns home with cards intact', await page.evaluate(() => document.querySelectorAll('[data-card]').length === 5));
  await page.close();

  console.log(results.join('\n'));
  console.log('console errors:', JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
