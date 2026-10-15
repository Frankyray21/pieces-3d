// Capture image par image de la vidéo du plancher (video-plancher.html), puis
// encodage MP4 (H.264, 1280 × 720, 24 i/s).
//
// Serveur de développement lancé (npm run dev), Playwright installé à part :
//   PW=$(npm root -g)/playwright node scripts/video-plancher.mjs --out scratch/video
//   options : --from 0 --to 310 (s) · --jobs 2 · --stills 12.5,40 (images isolées)
//             --encode-only · --url http://localhost:5173
import { createRequire } from 'node:module';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
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
const FPS = 24;
mkdirSync(join(out, 'frames'), { recursive: true });

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('page:', e.message));
  await page.goto(`${base}/video-plancher.html?capture`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  return page;
}
const shot = async (page, t, file) => {
  await page.evaluate((x) => window.__render(x), t);
  await page.screenshot({ path: file, type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 1280, height: 720 } });
};

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const probe = await open(browser);
const info = await probe.evaluate(() => window.__video);
const total = Math.round(info.duration * FPS);

if (opt('stills')) {
  for (const t of opt('stills').split(',').map(Number)) await shot(probe, t, join(out, `still_${String(t).replace('.', '_')}.jpg`));
  await browser.close();
  process.exit(0);
}

if (!flag('encode-only')) {
  const from = Math.round(Number(opt('from', '0')) * FPS);
  const to = Math.min(total, Math.round(Number(opt('to', String(info.duration))) * FPS));
  const todo = [];
  for (let f = from; f < to; f++) if (!existsSync(join(out, 'frames', `f_${String(f).padStart(5, '0')}.jpg`))) todo.push(f);
  console.log(`${info.duration.toFixed(1)} s, ${total} images ; ${todo.length} à rendre (${jobs} onglets)`);
  const pages = [probe];
  for (let i = 1; i < jobs; i++) pages.push(await open(browser));
  let done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async (page, k) => {
    for (let i = k; i < todo.length; i += jobs) {
      const f = todo[i];
      await shot(page, f / FPS, join(out, 'frames', `f_${String(f).padStart(5, '0')}.jpg`));
      if (++done % 240 === 0) console.log(`${done}/${todo.length} · ${((Date.now() - t0) / done).toFixed(0)} ms/image`);
    }
  }));
}
await browser.close();

const frames = readdirSync(join(out, 'frames')).filter((f) => f.endsWith('.jpg')).length;
if (frames < total) { console.log(`Encodage reporté : ${frames}/${total} images.`); process.exit(0); }
const mp4 = join(out, 'plancher_foreuse_diamants.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(out, 'frames', 'f_%05d.jpg'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '3.5', '-i', mp4, '-frames:v', '1', '-q:v', '4', join(out, 'plancher_poster.jpg')]);
console.log(`→ ${mp4}`);
