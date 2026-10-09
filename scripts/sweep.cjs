// Wider sweep: accessibility rules (axe), the hero at many screen sizes, and page weight.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', '.impeccable', 'review', 'frames');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://localhost:3001';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();

  // ---- accessibility ----
  await page.setViewport({ width: 1440, height: 900 });
  for (const route of ['/en', '/gu', '/en/about', '/en/achievements', '/en/awards', '/en/projects', '/en/kdcc-bank', '/en/initiatives', '/en/press', '/en/gallery', '/en/contact']) {
    await page.goto(BASE + route + '?still', { waitUntil: 'networkidle2', timeout: 120000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.evaluate(axeSource);
    const v = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map((x) => ({
        id: x.id,
        impact: x.impact,
        n: x.nodes.length,
        sample: x.nodes.slice(0, 2).map((nd) => nd.target.join(' ').slice(0, 70) + ' | ' + (nd.any[0]?.message || nd.none[0]?.message || nd.all[0]?.message || '').slice(0, 110)),
      }));
    });
    console.log(`\nA11Y ${route}: ${v.length ? '' : 'no violations'}`);
    for (const x of v) console.log(`  [${x.impact}] ${x.id} x${x.n}\n     ` + x.sample.join('\n     '));
  }

  // ---- page weight of the home page (cold) ----
  const cold = await browser.newPage();
  await cold.setViewport({ width: 1440, height: 900 });
  await cold.setCacheEnabled(false);
  const sizes = {};
  cold.on('response', async (r) => {
    try {
      const len = Number(r.headers()['content-length']) || (await r.buffer()).length;
      const type = r.request().resourceType();
      sizes[type] = (sizes[type] || 0) + len;
      if (len > 400000) console.log('  heavy:', Math.round(len / 1024) + 'KB', r.url().slice(-90));
    } catch {}
  });
  console.log('\nWEIGHT /en (first screen, before scrolling)');
  await cold.goto(BASE + '/en', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(1500);
  console.log('  ' + Object.entries(sizes).map(([k, v]) => `${k} ${Math.round(v / 1024)}KB`).join(', '));
  await cold.close();

  // ---- hero at many sizes ----
  const sizesList = [[1920, 1080], [1280, 720], [1366, 768], [1024, 768], [768, 1024], [360, 640], [390, 844], [844, 390]];
  let i = 0;
  for (const [w, h] of sizesList) {
    await page.setViewport({ width: w, height: h, isMobile: w < 900 && h > w, hasTouch: w < 900 });
    await page.goto(BASE + (i % 2 ? '/gu' : '/en'), { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(5500);
    await page.screenshot({ path: path.join(out, `hero-${i}-${w}x${h}.jpg`), type: 'jpeg', quality: 70 });
    const o = await page.evaluate(() => {
      const r = (s) => document.querySelector(s)?.getBoundingClientRect();
      const info = r('[data-info] > div');
      const last = r('[data-last]');
      const first = r('[data-first]');
      const hit = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return { infoOverName: hit(info, last) || hit(info, first), firstRight: Math.round(first?.right || 0), vw: innerWidth, over: document.documentElement.scrollWidth - innerWidth };
    });
    console.log(`HERO ${w}x${h} ${i % 2 ? 'gu' : 'en'}: ` + JSON.stringify(o));
    i++;
  }
  await browser.close();
})();
