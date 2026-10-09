// Stats band checks: digits land on the right value, nothing overflows its column, both languages agree.
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
  const numbers = {};
  const CASES = [['d-en', { width: 1440, height: 900 }, 'en'], ['d-gu', { width: 1440, height: 900 }, 'gu'], ['l-gu', { width: 1024, height: 768 }, 'gu'], ['t-en', { width: 820, height: 1180, isMobile: true, hasTouch: true }, 'en'], ['m-gu', { width: 390, height: 844, isMobile: true, hasTouch: true }, 'gu'], ['s-gu', { width: 320, height: 568, isMobile: true, hasTouch: true }, 'gu']];
  for (const [name, vp, lang] of CASES) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    await page.setViewport(vp);
    await page.goto('http://localhost:3001/' + lang, { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(5200);
    const before = await page.evaluate(() => [...document.querySelectorAll('dl [data-digit]')].every((c) => getComputedStyle(c).transform === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(c).transform)));
    for (let k = 0; k < 60; k++) {
      const d = await page.evaluate(() => Math.round(document.querySelector('dl').getBoundingClientRect().top - innerHeight * 0.25));
      if (Math.abs(d) < 10) break;
      const step = Math.max(-1100, Math.min(1100, d));
      if (vp.isMobile) await page.evaluate((s) => window.scrollBy(0, s), step);
      else await page.mouse.wheel({ deltaY: step });
      await sleep(320);
    }
    await sleep(3600);
    const r = await page.evaluate(() => {
      const groups = [...document.querySelectorAll('dl > *')];
      return groups.map((g) => {
        const dd = g.querySelector('dd');
        const dt = g.querySelector('dt');
        const cols = [...g.querySelectorAll('[data-digit]')];
        // read the digit each column actually shows
        const shown = cols.map((c) => { const box = c.parentElement.getBoundingClientRect(); const hit = [...c.children].find((s) => Math.abs(s.getBoundingClientRect().top - box.top) < 2); return hit ? hit.textContent : '?'; }).join('');
        const want = cols.map((c) => c.dataset.digit).join('');
        const gr = g.getBoundingClientRect();
        const inner = [...dd.querySelectorAll('span')].reduce((m, s) => Math.max(m, s.getBoundingClientRect().right), 0);
        const digitBox = cols[0]?.parentElement.getBoundingClientRect();
        const glyph = cols[0]?.children[Number(cols[0].dataset.digit)]?.getBoundingClientRect();
        return { shown, want, suffix: dd.textContent.replace(/[0-9]/g, '').trim(), fits: inner <= gr.right - 2, dtFirst: dt.compareDocumentPosition(dd) & Node.DOCUMENT_POSITION_FOLLOWING ? true : false, opacity: getComputedStyle(g).opacity, labelLines: Math.round(dt.getBoundingClientRect().height / parseFloat(getComputedStyle(dt).lineHeight)), sameBaseline: true, digitH: digitBox ? Math.round(digitBox.height) : 0, glyphH: glyph ? Math.round(glyph.height) : 0 };
      });
    });
    numbers[lang] = r.map((x) => x.want);
    check(`${name}: digits wait at zero until the band is reached`, before);
    check(`${name}: every number lands on its value`, r.every((x) => x.shown === x.want), r.map((x) => `${x.shown}/${x.want}`).join(' '));
    check(`${name}: numbers and suffixes fit their columns`, r.every((x) => x.fits), r.map((x) => x.suffix + ':' + x.fits).join(' '));
    check(`${name}: all four columns are visible`, r.every((x) => x.opacity === '1'));
    if (name === 'd-en') check('list markup: label comes before its value', r.every((x) => x.dtFirst));
    await page.screenshot({ path: path.join(out, `stats-${name}.jpg`), type: 'jpeg', quality: 72 });
    if (name === 'd-en') {
      const b = await page.evaluate(() => { const r = document.querySelector('dl > *:nth-child(2)').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await page.mouse.move(b.x, b.y, { steps: 6 });
      await sleep(900);
      await page.screenshot({ path: path.join(out, 'stats-hover.jpg'), type: 'jpeg', quality: 72 });
    }
    await page.close();
  }
  check('years of service is the same number in English and Gujarati', numbers.en[0] === numbers.gu[0], `en ${numbers.en[0]} / gu ${numbers.gu[0]}`);
  console.log(results.join('\n'));
  console.log('console errors:', JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
