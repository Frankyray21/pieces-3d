// Vidéo de la procédure d'installation du support de tiges (PRO-DD-ST-008) :
// le montage par étapes de la page #rack-tiges-dd.P02 est joué passage par
// passage (src/video/rack-script.js), avec un bandeau (étape, titre, texte),
// et capturé image par image sous une horloge simulée (Playwright clock) :
// 1280 × 720, 24 i/s, H.264. La voix (video/rack/script-elevenlabs.txt) est
// ajoutée ensuite avec --voix.
//
// Serveur de développement lancé (npm run dev) :
//   node scripts/video-rack.mjs --out scratch/rack [--fps 24] [--only 5,9] [--encode-only]
//   node scripts/video-rack.mjs --out scratch/rack --encode-only --voix video/rack/voix.mp3
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { timeline } from '../src/video/rack-script.js';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const out = opt('out', 'scratch/rack');
const base = opt('url', 'http://localhost:5173');
const FPS = Number(opt('fps', '24'));
const only = opt('only') ? opt('only').split(',').map(Number) : null; // indices de passages (essais)
const voix = opt('voix');
const mp4 = opt('render', join(out, 'installation-support-tiges.mp4'));
const frames = join(out, 'images');
const segs = timeline();

const CSS = `
  .topbar, #rail, #panel, #mtabs, #toast, #dock, #stage > :not(#viewport) { display: none !important; }
  #stage { position: fixed !important; inset: 0 !important; z-index: 50; }
  #vband { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 18px 34px 22px; color: #fff;
    background: linear-gradient(to top, rgba(14,18,24,.94) 62%, rgba(14,18,24,0)); font-family: 'IBM Plex Sans', sans-serif; }
  #vband .n { font: 600 17px 'IBM Plex Mono', monospace; color: #ff9d4d; letter-spacing: .06em; text-transform: uppercase; }
  #vband .t { font: 700 34px 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: .02em; margin: 2px 0 4px; }
  #vband .x { font-size: 19px; line-height: 1.35; max-width: 60em; color: #e8ecf1; }
  .balloon.caption.note { font-size: 15px !important; padding: 5px 9px !important; }
`;

if (!args.includes('--encode-only')) {
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('ERREUR', e.message));
  await page.clock.install();
  await page.goto(`${base}/#rack-tiges-dd.P02`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#loading')?.hidden !== false, null, { timeout: 120000 });
  await page.addStyleTag({ content: CSS });
  await page.evaluate(() => {
    const b = document.createElement('div');
    b.id = 'vband';
    b.innerHTML = '<div class="n"></div><div class="t"></div><div class="x"></div>';
    document.body.append(b);
    if (document.querySelector('#btn-labels').getAttribute('aria-pressed') === 'true') document.querySelector('#btn-labels').click();
    window.dispatchEvent(new Event('resize'));
  });
  await page.clock.runFor(1500);
  const click = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
  // La page s'ouvre en montage par étapes (view.stepsAuto), à l'étape 0.
  let n = 0, inSteps = await page.evaluate(() => !document.querySelector('#stepsbar').hidden), at = inSteps ? 0 : -1;
  const t0 = Date.now();
  for (const [i, s] of segs.entries()) {
    if (only && !only.includes(i)) continue;
    if (s.step == null) {
      if (inSteps) { await click('#st-close'); inSteps = false; at = -1; }
    } else {
      if (!inSteps) { await click('#btn-steps'); inSteps = true; at = 0; await page.clock.runFor(1200); }
      // Étape 0 déjà affichée à l'ouverture : rejouée pour partir du décor seul.
      else if (s.step === 0 && at === 0) await click('#st-replay');
      // Essais (--only) : étapes précédentes posées sans animation.
      if (at < s.step - 1) { await page.evaluate((k) => { const r = document.querySelector('#st-range'); r.value = k; r.dispatchEvent(new Event('input')); }, s.step - 1); at = s.step - 1; }
      if (at < s.step) { await click('#st-next'); at = s.step; }
    }
    await page.evaluate((b) => {
      const el = document.querySelector('#vband');
      el.querySelector('.n').textContent = b.num; el.querySelector('.t').textContent = b.title; el.querySelector('.x').textContent = b.text;
    }, s);
    const count = Math.round(s.dur * FPS);
    for (let f = 0; f < count; f++) {
      await page.clock.runFor(1000 / FPS);
      await page.screenshot({ path: join(frames, `f${String(n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
    console.log(`${s.id} : ${count} images (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  await browser.close();
}

if (!existsSync(join(frames, 'f00000.jpg'))) throw new Error(`Aucune image dans ${frames}`);
const input = ['-framerate', String(FPS), '-i', join(frames, 'f%05d.jpg')];
const audio = voix ? ['-i', voix, '-c:a', 'aac', '-b:a', '128k', '-shortest'] : [];
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...input, ...audio, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
console.log('→', mp4);
