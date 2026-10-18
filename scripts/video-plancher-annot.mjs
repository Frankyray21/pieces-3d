// Calque d'annotations de la vidéo du plancher (cotes et notes), image par
// image : PNG transparents de 1280 × 540, superposés à la 3D au montage.
// Calcul sans rendu 3D (la caméra suffit), dans l'ordre des images : le
// placement des étiquettes est lissé d'une image à l'autre.
//   PW=$(npm root -g)/playwright node scripts/video-plancher-annot.mjs --out scratch/video --fps 24
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync, symlinkSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const out = join(opt('out', 'scratch/video'), 'annot');
const FPS = Number(opt('fps', '24'));
const base = opt('url', 'http://localhost:5173');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('page:', e.message));
await page.goto(`${base}/video-plancher.html?capture&scale=0.25`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 200000 });
// Repère : si la page se recharge (serveur de dév.), l'état de lissage est perdu ; on arrête.
await page.evaluate(() => { window.__annotRun = 1; });
const info = await page.evaluate(() => window.__video);
const total = Math.round(info.duration * FPS);
const blank = resolve(out, 'vide.png');
let blankUrl = null;
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  const url = await page.evaluate((t) => (window.__annotRun === 1 ? window.__annot(t) : null), f / FPS);
  if (url === null) throw new Error(`page rechargée à l'image ${f} : relancer le calque`);
  const file = join(out, `a_${String(f).padStart(5, '0')}.png`);
  if (existsSync(file)) unlinkSync(file);
  if (blankUrl === null && f === 0) { blankUrl = url; writeFileSync(blank, Buffer.from(url.split(',')[1], 'base64')); }
  if (url === blankUrl) symlinkSync(blank, file);
  else writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  if ((f + 1) % 1200 === 0) console.log(`${f + 1}/${total} · ${((Date.now() - t0) / (f + 1)).toFixed(0)} ms/image`);
}
await browser.close();
console.log(`${total} images → ${out}`);
