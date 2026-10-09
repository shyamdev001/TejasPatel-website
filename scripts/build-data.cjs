// One-off snapshot builder: turns the extracted live-site content + CMS dumps
// into src/content/*.json and downloads the CMS images that the site uses.
// Usage: node scripts/build-data.cjs <dir containing content.json, main.js, cms-*.json, gallery-*.json>
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'content');
const IMG = path.join(ROOT, 'public', 'cms');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(IMG, { recursive: true });

const read = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
const pairs = read('content.json');
const byName = (n) => pairs.find((p) => (p.en || p.gu).name === n || p.gu.name === n);
const pair = (n) => {
  const p = byName(n);
  return { en: p.en.v, gu: p.gu.v };
};

// English "positions" object is not adjacent to its Gujarati twin in the bundle.
const bundle = fs.readFileSync(path.join(SRC, 'main.js'), 'utf8');
function literalAt(open) {
  let d = 0, q = null;
  for (let k = open; k < bundle.length; k++) {
    const c = bundle[k];
    if (q) { if (c.charCodeAt(0) === 92) { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') d++;
    else if (c === '}' || c === ']') { d--; if (d === 0) return bundle.slice(open, k + 1); }
  }
}
const exIdx = bundle.indexOf('exDirector:[{text1:"The');
const posOpen = bundle.lastIndexOf('{chairman:[', exIdx);
const positionsEn = new Function('return (' + literalAt(posOpen) + ')')();

const clean = (v) => {
  if (typeof v === 'string') return v.startsWith('$mod:') || v.startsWith('$ref:') ? null : v;
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
};
const ORG = { Ra: 'The Kheda Dist. Central Co-op Bank Ltd.', Da: 'The Kheda Dist. Central Co-op Bank Ltd.' };
const fixAwards = (a) => ({
  ...a,
  awards: a.awards.map((x) => ({
    ...x,
    organization: typeof x.organization === 'string' && x.organization.startsWith('$ref:') ? ORG[x.organization.slice(5)] || '' : x.organization,
  })),
});

const details = {
  'kdcc-bank': 'ca', sauraurja: 'pa', 'sakar-mall': 'ma', 'atmnirbhar-bio-gas-plant': 'bl', 'villages-self': 'xl',
  'retail-prices': 'Cl', 'stepping-Yard': 'El', 'farmer-assistance-center': 'Ol',
  'from-grassroots-representation': 'Ll', 'cng-organic-fertilizer': 'Dl',
};
const legacy = byName('bo').gu.v;
const aw = pair('Fa');
const site = {
  footer: pair('Ue'),
  legacy: { en: legacy.english, gu: legacy.gujarati },
  positions: { en: positionsEn, gu: byName('i').gu.v },
  home: pair('jo'),
  about: pair('Eo'),
  projects: pair('Oo'),
  achievements: pair('No'),
  initiatives: pair('Uo'),
  press: pair('Qo'),
  contact: pair('sa'),
  awards: { en: fixAwards(aw.en), gu: fixAwards(aw.gu) },
  details: Object.fromEntries(Object.entries(details).map(([slug, n]) => [slug, pair(byName(n).gu.name)])),
};
fs.writeFileSync(path.join(OUT, 'site.json'), JSON.stringify(clean(site)));

// ---- CMS ----
const ENT = { rsquo: '’', lsquo: '‘', quot: '"', amp: '&', nbsp: ' ', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', '#39': "'", hellip: '…', zwnj: '', zwj: '' };
const strip = (h) =>
  String(h || '')
    .replace(/<\/p>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#?\w+);/g, (m, e) => (e in ENT ? ENT[e] : e[0] === '#' ? String.fromCodePoint(Number(e.slice(1)) || 32) : ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

const cms = { en: read('cms-en.json').data, gu: read('cms-gu.json').data };
const gal = { en: read('gallery-en.json').data, gu: read('gallery-gu.json').data };
const wanted = new Map(); // url -> local file
const local = (url) => {
  if (!url) return null;
  if (!wanted.has(url)) {
    const ext = (url.split('?')[0].match(/\.(jpe?g|png|webp|gif)$/i) || ['', 'jpg'])[1].toLowerCase();
    wanted.set(url, `c${wanted.size + 1}.${ext}`);
  }
  return '/cms/' + wanted.get(url);
};
const flat = (groups) => (groups || []).flatMap((g) => g.detail || []);
const guIndex = (key) => new Map(flat(cms.gu[key]).map((x) => [x.id, x]));
const articles = (key, limit) => {
  const gu = guIndex(key);
  return flat(cms.en[key]).slice(0, limit).map((x) => {
    const g = gu.get(x.id) || x;
    return {
      id: x.id, year: x.year, image: local(x.image),
      title: { en: strip(x.title), gu: strip(g.title) },
      body: { en: strip(x.desc), gu: strip(g.desc) },
    };
  });
};
const galImg = (x) => (typeof x === 'string' ? x : x.image || x.img || x.url);
const pressOut = {
  news: articles('News', 24),
  editorials: articles('Editorials', 8),
  pressMedia: articles('PressMedia', 6),
  activity: articles('OurActivity', 6),
  videos: flat(cms.en.Videos).slice(0, 12).map((v) => ({ id: v.id, year: v.year, url: v.url, title: strip(v.title) })),
  homeGallery: (cms.en.Gallery || []).map((x, i) => ({
    id: x.id, image: local(x.image),
    title: { en: strip(x.title), gu: strip(((cms.gu.Gallery || [])[i] || x).title) },
  })),
  gallery: [['2026', 36], ['2025', 28], ['2024', 16], ['2021', 2]].map(([year, n]) => {
    const g = gal.en.find((y) => y.title === year) || { images: [] };
    return { year, total: g.images.length, images: g.images.slice(0, n).map((x) => local(galImg(x))).filter(Boolean) };
  }),
};
fs.writeFileSync(path.join(OUT, 'cms.json'), JSON.stringify(pressOut));
console.log('gallery item sample', JSON.stringify(gal.en.find((y) => y.images.length).images[0]).slice(0, 200));
console.log('site.json', fs.statSync(path.join(OUT, 'site.json')).size, 'cms.json', fs.statSync(path.join(OUT, 'cms.json')).size, 'images', wanted.size);

(async () => {
  const jobs = [...wanted.entries()];
  let ok = 0, fail = 0;
  const worker = async () => {
    for (let j = jobs.shift(); j; j = jobs.shift()) {
      const [url, file] = j;
      const dest = path.join(IMG, file);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { ok++; continue; }
      try {
        const r = await fetch(encodeURI(decodeURI(url)));
        if (!r.ok) throw new Error(r.status);
        fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
        ok++;
      } catch (e) { fail++; console.log('FAIL', url, String(e).slice(0, 60)); }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log('downloaded', ok, 'failed', fail);
})();
