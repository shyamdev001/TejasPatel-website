// Mechanical audit of every route in both languages and both viewports.
// Reports console errors, sideways overflow, clipped text, broken images, leftover markup and filler.
const puppeteer = require('puppeteer-core');

const SLUGS = ['kdcc-bank', 'sauraurja', 'sakar-mall', 'atmnirbhar-bio-gas-plant', 'villages-self', 'retail-prices', 'stepping-Yard', 'farmer-assistance-center', 'from-grassroots-representation', 'cng-organic-fertilizer'];
const ROUTES = ['about', 'achievements', 'awards', 'projects', 'initiatives', 'press', 'gallery', 'contact', ...SLUGS];
const VIEWS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844, isMobile: true, hasTouch: true } };

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  let errors = [];
  page.on('pageerror', (e) => errors.push('PE ' + String(e).slice(0, 160)));
  page.on('console', (m) => m.type() === 'error' && errors.push('CE ' + m.text().slice(0, 160)));
  page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url().slice(-70)}`));
  let clean = 0;
  for (const lang of ['en', 'gu'])
    for (const route of ROUTES)
      for (const [view, vp] of Object.entries(VIEWS)) {
        errors = [];
        await page.setViewport(vp);
        await page.goto(`http://localhost:3001/${lang}/${route}?still`, { waitUntil: 'networkidle2', timeout: 120000 });
        // walk the page so lazy images load
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
        });
        await new Promise((r) => setTimeout(r, 500));
        const found = await page.evaluate(() => {
          const out = [];
          const vw = window.innerWidth;
          if (document.documentElement.scrollWidth > vw + 1) out.push(`page overflows sideways by ${document.documentElement.scrollWidth - vw}px`);
          const visible = (e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
          };
          const label = (e) => `${e.tagName.toLowerCase()} "${(e.textContent || '').trim().slice(0, 40)}"`;
          for (const e of document.querySelectorAll('main h1, main h2, main h3, main p, main li, main a, main button, main dt, main dd, footer p, footer a')) {
            if (!visible(e) || e.closest('.marquee-track, [data-track], [aria-hidden="true"], .sr-only')) continue;
            const r = e.getBoundingClientRect();
            if (r.right > vw + 2 || r.left < -2) out.push(`off-screen: ${label(e)} (${Math.round(r.left)}..${Math.round(r.right)})`);
            if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible' && !e.closest('[role="tablist"]')) out.push(`clipped: ${label(e)}`);
          }
          for (const h of document.querySelectorAll('main h1, main h2, main h3')) if (visible(h) && !h.textContent.trim()) out.push('empty heading');
          for (const i of document.querySelectorAll('img')) if (i.complete && i.naturalWidth === 0) out.push('broken image ' + (i.currentSrc || i.src).slice(-60));
          const text = document.querySelector('main').innerText;
          for (const [name, re] of [['html entity', /&#?\w+;/], ['raw tag', /<\/?[a-z][^>]*>/i], ['filler', /lorem ipsum/i], ['undefined', /\bundefined\b|\bnull\b|\[object/], ['stray bullet', /^[•\t]/m]]) {
            const m = text.match(re);
            if (m) out.push(`${name}: "${text.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\n/g, ' ')}"`);
          }
          const paras = [...document.querySelectorAll('main p')].map((p) => p.textContent.trim()).filter((t) => t.length > 60);
          const dup = paras.find((t, i) => paras.indexOf(t) !== i);
          if (dup) out.push(`repeated paragraph: "${dup.slice(0, 50)}"`);
          const h1 = document.querySelectorAll('main h1').length;
          if (h1 !== 1) out.push(`${h1} h1 elements`);
          return out;
        });
        const all = [...new Set([...errors, ...found])];
        if (all.length) console.log(`\n${lang}/${route} [${view}]\n  - ` + all.slice(0, 8).join('\n  - '));
        else clean++;
      }
  console.log(`\nclean: ${clean} of ${2 * ROUTES.length * 2}`);
  await browser.close();
})();
