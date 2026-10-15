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
//             aperçu rapide : --fps 12 --scale 0.5
import { createRequire } from 'node:module';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

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
for (const d of ['3d', 'layers']) mkdirSync(join(out, d), { recursive: true });

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('page:', e.message));
  await page.goto(`${base}/video-plancher.html?capture&scale=${SCALE}`, { waitUntil: 'networkidle' });
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

  const todo = [];
  for (let f = 0; f < total; f++) if ((!stills || stills.includes(f)) && (!existsSync(frameFile(f)) || !levels[f])) todo.push(f);
  console.log(`${info.duration.toFixed(1)} s, ${total} images ; ${todo.length} à rendre (${jobs} onglets)`);
  const pages = [probe];
  for (let i = 1; i < jobs; i++) pages.push(await open(browser));
  let done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async (page, k) => {
    for (let i = k; i < todo.length; i += jobs) {
      const f = todo[i];
      const r = await page.evaluate((x) => window.__frame(x), f / FPS);
      writeFileSync(frameFile(f), Buffer.from(r.img.split(',')[1], 'base64'));
      delete r.img;
      levels[f] = r;
      if (++done % 480 === 0) {
        console.log(`${done}/${todo.length} · ${((Date.now() - t0) / done).toFixed(0)} ms/image`);
        writeFileSync(levelsFile, JSON.stringify(levels));
      }
    }
  }));
  writeFileSync(levelsFile, JSON.stringify(levels));
}
await browser.close();

const compose = ['scripts/video-plancher-compose.py', out, String(FPS)];
if (stills) {
  execFileSync('python3', [...compose, '--stills', stills.join(',')], { stdio: 'inherit' });
} else {
  execFileSync('python3', [...compose, String(total)], { stdio: 'inherit' });
}
