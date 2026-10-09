// Behaviour checks for the site shell: preloader lock, menu, page wipe, back button, tabs, resize, 404.
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:3001';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text().slice(0, 200)));
  const results = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const menuBtn = 'header button[aria-controls="site-menu"]';

  await page.goto(BASE + '/en', { waitUntil: 'networkidle2', timeout: 120000 });
  await page.goto(BASE + '/en', { waitUntil: 'domcontentloaded' });
  await sleep(900);
  await page.mouse.move(700, 450);
  await page.mouse.wheel({ deltaY: 900 });
  await sleep(500);
  check('page cannot scroll under the preloader', (await ev(() => window.scrollY)) === 0, 'scrollY ' + (await ev(() => window.scrollY)));
  await sleep(4500);
  check('preloader is removed', !(await page.$('.preloader')));
  await page.mouse.wheel({ deltaY: 300 });
  await sleep(900);
  check('page scrolls after the preloader', (await ev(() => window.scrollY)) > 100);
  await page.mouse.wheel({ deltaY: -2000 });
  await sleep(1600);

  await page.click(menuBtn);
  await sleep(1300);
  check('menu opens', !!(await page.$('#site-menu')));
  check('page behind the menu is inert', await ev(() => document.querySelector('main').inert));
  await page.mouse.wheel({ deltaY: 900 });
  await sleep(500);
  check('page cannot scroll behind the menu', (await ev(() => window.scrollY)) === 0);
  await page.keyboard.press('Escape');
  await sleep(1300);
  check('Escape closes the menu', !(await page.$('#site-menu')));
  check('focus returns to the menu button', await ev((s) => document.activeElement === document.querySelector(s), menuBtn));
  check('page is usable again', await ev(() => !document.querySelector('main').inert && document.documentElement.style.overflow === ''));

  await page.click(menuBtn);
  await sleep(1300);
  await page.click('#site-menu a[href="/en"]');
  await sleep(1300);
  check('choosing the current page closes the menu', !(await page.$('#site-menu')) && (await ev(() => location.pathname)) === '/en');

  await page.click(menuBtn);
  await sleep(1300);
  const link = await page.$('#site-menu a[href="/en/projects"]');
  await link.click();
  await link.click().catch(() => {});
  await page.waitForFunction(() => location.pathname === '/en/projects', { timeout: 20000 });
  await sleep(2800);
  check('double click navigates once, cover clears', await ev(() => !!document.querySelector('main h1') && getComputedStyle(document.querySelector('[aria-hidden].fixed.z-\\[90\\]')).visibility === 'hidden'));
  check('new page starts at the top', (await ev(() => window.scrollY)) < 5);

  await page.goBack();
  await sleep(2500);
  const back = await ev(() => {
    const h = document.querySelector('main h1');
    const n = document.querySelector('[data-name]');
    const r = n?.getBoundingClientRect();
    return { path: location.pathname, h1: !!h, nameVisible: !!r && r.height > 0 && getComputedStyle(n).visibility !== 'hidden', portrait: getComputedStyle(document.querySelector('[data-portrait]')).opacity };
  });
  check('back button returns to a working home page', back.path === '/en' && back.h1 && back.nameVisible && back.portrait === '1', JSON.stringify(back));

  await ev(() => document.querySelector('#pos-tab-chairman').scrollIntoView({ block: 'center' }));
  await sleep(1200);
  await page.focus('#pos-tab-chairman');
  await page.keyboard.press('ArrowDown');
  await sleep(900);
  check('arrow keys move between role tabs', await ev(() => document.querySelector('#pos-tab-director').getAttribute('aria-selected') === 'true' && document.activeElement.id === 'pos-tab-director'));

  await page.mouse.wheel({ deltaY: -30000 });
  await sleep(2200);
  await page.mouse.wheel({ deltaY: 1400 });
  await sleep(1200);
  const hidden = await ev(() => document.querySelector('header').getBoundingClientRect().bottom);
  await page.mouse.wheel({ deltaY: -300 });
  await sleep(1200);
  const shown = await ev(() => document.querySelector('header').getBoundingClientRect().top);
  check('header hides scrolling down and returns scrolling up', hidden <= 0 && Math.abs(shown) < 2, `bottom ${Math.round(hidden)}, top ${Math.round(shown)}`);

  await page.setViewport({ width: 390, height: 844 });
  await sleep(1800);
  const small = await ev(() => ({ over: document.documentElement.scrollWidth - window.innerWidth, scaled: [...document.querySelectorAll('[data-card] > article')].some((a) => getComputedStyle(a).transform !== 'none' && !getComputedStyle(a).transform.startsWith('matrix(1, 0, 0, 1')) }));
  check('resizing to phone width: no sideways overflow', small.over <= 1, 'overflow ' + small.over);
  check('resizing to phone width: project cards are not shrunk', !small.scaled);
  await page.setViewport({ width: 1440, height: 900 });
  await sleep(1500);
  check('resizing back to desktop: no sideways overflow', (await ev(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1);

  for (const u of ['/en/does-not-exist', '/xyz']) {
    await page.goto(BASE + u, { waitUntil: 'networkidle2' });
    await sleep(600);
    const t = await ev(() => ({ text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 90), header: !!document.querySelector('header'), link: !!document.querySelector('a[href^="/en"]') }));
    check(`unknown address ${u} shows a usable page`, t.link, t.text);
  }

  console.log(results.join('\n'));
  console.log('console errors:', JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
