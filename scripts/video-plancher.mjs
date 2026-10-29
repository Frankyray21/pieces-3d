// Capture et montage de la vidéo du plancher (video-plancher.html) :
// 1280 × 720, 24 i/s, H.264.
//
// 1. Calques : bandeau, « Pourquoi », carton et étiquette capturés une fois
//    par segment (PNG transparents) ;
// 2. 3D : chaque image calculée par window.__frame(t) et lue sur le canevas
//    (JPEG), avec les opacités des calques ; une capture d'écran de la page
//    entière coûterait 2 à 3 s par image, la 3D seule 50 ms ;
// 3. composition (scripts/video-plancher-compose.py, Pillow) envoyée à ffmpeg.
//
// Serveur de développement lancé (npm run dev), Playwright installé à part :
//   PW=$(npm root -g)/playwright node scripts/video-plancher.mjs --out scratch/video
//   options : --jobs 2 · --stills 12.5,40 (images composées isolées) · --encode-only
//             aperçu rapide : --fps 12 --scale 0.5 · --fxaa (anticrénelage FXAA, plus rapide)
//             --ao half (occlusion en demi-résolution) · --no-plan (rendu de chaque image)
//             --reuse scratch/v11 (images d'un rendu précédent reprises à empreinte égale)
//
// Rendu planifié (par défaut) : l'empreinte de chaque image (scène visible +
// caméra, window.__state) est calculée d'abord ; une seule image est rendue par
// empreinte distincte (images fixes) et le cache (--cache, partagé entre les
// versions) fournit celles déjà rendues avec le même code. Le cache est propre à
// une « graine » : contenu des sources (hors chronologie et annotations, que
// l'empreinte couvre) et options de rendu.
import { createRequire } from 'node:module';
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync, linkSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes(`--${name}`);
const out = opt('out', 'scratch/video');
const base = opt('url', 'http://localhost:5173');
const jobs = Number(opt('jobs', '2'));
const FPS = Number(opt('fps', '24'));
const SCALE = opt('scale', '1'); // 0.5 : aperçu rapide
// --range a:b : seulement les images a à b-1 (rendu partagé entre plusieurs machines).
const RANGE = opt('range') ? opt('range').split(':').map(Number) : null;
const AO = opt('ao'); // half : occlusion en demi-résolution
const PLAN = !flag('no-plan');
const QUERY = `capture&scale=${SCALE}${flag('fxaa') ? '&fxaa=1' : ''}${AO ? `&ao=${AO}` : ''}`;
for (const d of ['3d', 'layers']) mkdirSync(join(out, d), { recursive: true });

// Graine du cache : sources qui changent l'image pour une même empreinte.
function salt() {
  const h = createHash('sha1');
  const walk = (d) => readdirSync(d).sort().forEach((n) => {
    const p = join(d, n);
    if (statSync(p).isDirectory()) return walk(p);
    const r = relative('.', p);
    if (['src/video/plancher-script.js', 'src/video/plancher-annot.js'].includes(r)) return;
    h.update(r); h.update(readFileSync(p));
  });
  walk('src');
  for (const f of ['video-plancher.html', 'package-lock.json']) if (existsSync(f)) h.update(readFileSync(f));
  h.update(QUERY);
  return h.digest('hex').slice(0, 12);
}
// Écrit une image sans toucher aux autres liens du même fichier (cache, versions précédentes).
const put = (file, buf) => { rmSync(file, { force: true }); writeFileSync(file, buf); };
const link = (src, dst) => { rmSync(dst, { force: true }); linkSync(src, dst); };

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('page:', e.message));
  await page.goto(`${base}/video-plancher.html?${QUERY}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  return page;
}

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const probe = await open(browser);
const info = await probe.evaluate(() => window.__video);
const total = Math.round(info.duration * FPS);
const stills = opt('stills') ? opt('stills').split(',').map((t) => Math.round(Number(t) * FPS)) : null;
const frameFile = (f) => join(out, '3d', `f_${String(f).padStart(5, '0')}.jpg`);
const levelsFile = join(out, 'levels.json');
const levels = existsSync(levelsFile) ? JSON.parse(readFileSync(levelsFile, 'utf8')) : {};

if (!flag('encode-only')) {
  // Calques par segment (une page à part : son état ne sert plus au rendu 3D).
  const lp = await open(browser);
  const fits = [];
  for (let i = 0; i < info.segments.length; i++) {
    // Tailles de police du bandeau ajustées dans la page (reprises par le montage HyperFrames).
    const f = await lp.evaluate((k) => window.__layer(k, 'band'), i);
    fits.push({ text: f.text, detail: f.detail });
    // L'étiquette ne change pas : capturée au premier segment seulement.
    for (const which of ['band', 'why', 'card', 'tag']) {
      const file = join(out, 'layers', `${which}_${String(i).padStart(2, '0')}.png`);
      if (existsSync(file) || (which === 'tag' && i > 0)) continue;
      const has = await lp.evaluate(([k, w]) => window.__layer(k, w), [i, which]);
      if ((which === 'why' && !has.why) || (which === 'card' && !has.card)) continue;
      if (process.env.DEBUG) console.log('calque', which, i, has);
      await lp.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    }
  }
  await lp.close();
  writeFileSync(join(out, 'fits.json'), JSON.stringify(fits));

  const want = (f) => (!RANGE || (f >= RANGE[0] && f < RANGE[1])) && (!stills || stills.includes(f));
  const todo = [];
  for (let f = 0; f < total; f++) if (want(f) && (!existsSync(frameFile(f)) || !levels[f])) todo.push(f);
  const pages = [probe];
  for (let i = 1; i < jobs; i++) pages.push(await open(browser));
  let done = 0;
  const t0 = Date.now();
  const tick = (n) => {
    done += n;
    if (Math.floor(done / 240) !== Math.floor((done - n) / 240)) {
      console.log(`${done}/${todo.length} · ${((Date.now() - t0) / done).toFixed(0)} ms/image`);
      writeFileSync(levelsFile, JSON.stringify(levels));
    }
  };
  if (!PLAN) {
    console.log(`${info.duration.toFixed(1)} s, ${total} images ; ${todo.length} à rendre (${jobs} onglets)`);
    await Promise.all(pages.map(async (page, k) => {
      for (let i = k; i < todo.length; i += jobs) {
        const f = todo[i];
        const r = await page.evaluate((x) => window.__frame(x), f / FPS);
        put(frameFile(f), Buffer.from(r.img.split(',')[1], 'base64'));
        delete r.img;
        levels[f] = r;
        tick(1);
      }
    }));
  } else {
    // 1) Empreintes de toutes les images à faire.
    const st = await probe.evaluate((ts) => ts.map((t) => window.__state(t)), todo.map((f) => f / FPS));
    const SALT = salt();
    const cacheDir = join(opt('cache', 'scratch/cache-plancher'), SALT);
    mkdirSync(cacheDir, { recursive: true });
    const groups = new Map();
    let kept = 0;
    todo.forEach((f, i) => {
      const { scene, cam, pose, ...lv } = st[i];
      levels[f] = lv;
      // --keep-existing : image déjà rendue (rendu interrompu avant l'écriture des
      // niveaux) gardée telle quelle.
      if (flag('keep-existing') && existsSync(frameFile(f))) { kept++; return; }
      const key = `${scene}-${cam}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    });
    // Empreintes de ce rendu (states.json), pour qu'un rendu suivant reprenne ses images.
    const statesFile = join(out, 'states.json');
    const states = existsSync(statesFile) ? JSON.parse(readFileSync(statesFile, 'utf8')) : [];
    todo.forEach((f, i) => { states[f] = { scene: st[i].scene, cam: st[i].cam }; });
    writeFileSync(statesFile, JSON.stringify(states));
    // --reuse : images d'un rendu précédent (son states.json et son dossier 3d/) à empreinte égale.
    const reuse = new Map();
    for (const dir of opt('reuse') ? opt('reuse').split(',') : []) {
      JSON.parse(readFileSync(join(dir, 'states.json'), 'utf8')).forEach((x, f) => {
        const file = join(dir, '3d', `f_${String(f).padStart(5, '0')}.jpg`);
        const k = x && `${x.scene}-${x.cam}`;
        if (k && !reuse.has(k) && existsSync(file)) reuse.set(k, file);
      });
    }
    // 2) Images déjà dans le cache ou dans un rendu précédent : liées directement.
    const toRender = [];
    let fromCache = 0;
    for (const [key, fs] of groups) {
      const c = join(cacheDir, `${key}.jpg`);
      const src = existsSync(c) ? c : reuse.get(key);
      if (src) { for (const f of fs) link(src, frameFile(f)); fromCache += fs.length; } else toRender.push([key, fs]);
    }
    const n = toRender.reduce((a, [, fs]) => a + fs.length, 0);
    console.log(`${info.duration.toFixed(1)} s, ${total} images ; ${todo.length} à faire : ${kept} gardées, ${fromCache} reprises (cache ou rendu précédent), ${n - toRender.length} identiques, ${toRender.length} à rendre (${jobs} onglets, graine ${SALT})`);
    writeFileSync(levelsFile, JSON.stringify(levels));
    // 3) Une image rendue par empreinte, liée aux autres images de même empreinte.
    await Promise.all(pages.map(async (page, k) => {
      for (let i = k; i < toRender.length; i += jobs) {
        const [key, fs] = toRender[i];
        const r = await page.evaluate((x) => window.__frame(x), fs[0] / FPS);
        const c = join(cacheDir, `${key}.jpg`);
        put(c, Buffer.from(r.img.split(',')[1], 'base64'));
        for (const f of fs) link(c, frameFile(f));
        tick(fs.length);
      }
    }));
  }
  writeFileSync(levelsFile, JSON.stringify(levels));
}
await browser.close();

if (flag('no-compose') || RANGE) process.exit(0);
const compose = ['scripts/video-plancher-compose.py', out, String(FPS)];
if (stills) {
  execFileSync('python3', [...compose, '--stills', stills.join(',')], { stdio: 'inherit' });
} else {
  execFileSync('python3', [...compose, String(total)], { stdio: 'inherit' });
}
