// Montage direct de la vidéo du plancher, à la place de HyperFrames (bien plus rapide) :
//   1. les calques 2D (scripts/plancher-calques.mjs : bandeau, cartons, « Pourquoi »,
//      étiquette) dans une page Chromium, avancés image par image (animations CSS
//      mises en pause et calées sur le temps) ; une capture PNG par état distinct
//      (un bandeau fixe ne se capture qu'une fois) ;
//   2. ffmpeg compose en une seule passe, en RVB : 3D (JPEG) + annotations (PNG) +
//      calques (PNG) + voix ; un seul encodage H.264 (au lieu de trois).
//
//   PW=$(npm root -g)/playwright node scripts/video-plancher-montage.mjs \
//     --frames scratch/v11 --render plancher.mp4
//   options : --range a:b (images a à b-1, sans voix : essai) · --muet · --crf 21
//     · --preset slow · --tune film · --x264 "bframes=0:…" ou « aucun » (encodeur, voir plus bas)
//     · --abr 192k (débit de la voix) ; version compressée (environ 40 Mo) : --crf 26 --abr 96k
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { timeline, vt, voicePieces, VOICE_FILE } from '../src/video/plancher-script.js';
import { V8 } from '../src/video/plancher-v8.js';
import { W, H, H3, FONTS, calques } from './plancher-calques.mjs';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes(`--${n}`);
const FRAMES = path.resolve(opt('frames', 'scratch/video'));
const RENDER = path.resolve(opt('render', 'plancher.mp4'));
const WORK = path.resolve(opt('work', path.join(FRAMES, 'calques')));
const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const FPS = 24;
const SEGS = timeline();
const DUR = SEGS.at(-1).start + SEGS.at(-1).dur;
const total = Math.round(DUR * FPS);
const [F0, F1] = opt('range') ? opt('range').split(':').map(Number) : [0, total];
const VOICE = !flag('muet') && !opt('range');
const pad5 = (f) => String(f).padStart(5, '0');
const run = (cmd, a) => { const r = spawnSync(cmd, a, { stdio: 'inherit' }); if (r.status !== 0) throw new Error(`${cmd} : code ${r.status}`); };

// ------------------------------------------------------------------ 1) calques
const FITS = fs.existsSync(path.join(FRAMES, 'fits.json')) ? JSON.parse(fs.readFileSync(path.join(FRAMES, 'fits.json'), 'utf8')) : [];
// Polices intégrées (data:) : la page n'a besoin d'aucun fichier à côté.
let fontCss = '';
for (const [fam, wt, pkg, file] of FONTS) {
  const b64 = fs.readFileSync(path.join(REPO, 'node_modules', '@fontsource', pkg, 'files', file)).toString('base64');
  fontCss += `@font-face { font-family: "${fam}"; font-weight: ${wt}; font-style: normal; src: url("data:font/woff2;base64,${b64}") format("woff2"); }\n`;
}
const { css, layers, subs } = calques({ segs: SEGS, fits: FITS, fontCss });
// Calques à plusieurs éléments montés directement dans leur hôte (comme les
// sous-compositions HyperFrames : même boîte plein cadre).
const body = new Map(subs);
const flat = layers.map((l) => {
  const id = /id="([^"]+)"/.exec(l)[1];
  return body.has(id) ? l.replace('></div>', `><div class="root">${body.get(id)}</div></div>`) : l;
});
const html = `<!doctype html><html lang="fr"><head><meta charset="UTF-8" /><style>${css}
.root { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; font-family: "IBM Plex Sans", sans-serif; color: #f1f3f4; }
html, body, #video { background: transparent !important; }
</style></head><body><div id="video"><div class="bandbg"></div><div class="tag">PRO-DD-ST-003</div>
${flat.join('\n')}
</div></body></html>`;

fs.mkdirSync(path.join(WORK, 'u'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'o'), { recursive: true });
const { chromium } = require(process.env.PW || 'playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(async (fonts) => {
  await Promise.all(fonts.map(([fam, wt]) => document.fonts.load(`${wt} 20px "${fam}"`)));
  await document.fonts.ready;
  // Calque visible de a à a + d (exclu) ; animations figées au temps local du calque.
  const clips = [...document.querySelectorAll('#video [data-start]')];
  window.__seek = (t) => {
    const key = [];
    for (const el of clips) {
      const a = Number(el.dataset.start), d = Number(el.dataset.duration);
      const on = t >= a - 1e-6 && t < a + d - 1e-6;
      el.style.display = on ? '' : 'none';
      if (!on) continue;
      key.push(el.id);
      for (const an of el.getAnimations({ subtree: true })) {
        an.pause();
        an.currentTime = Math.max(0, (t - a) * 1000);
        // État visible (opacité, transformation), pas l'avancement : un palier
        // d'opacité constante ne demande qu'une capture.
        const cs = getComputedStyle(an.effect.target);
        key.push(`${an.effect.target.className}:${(+cs.opacity).toFixed(4)}:${cs.transform}`);
      }
    }
    return key.join('|');
  };
}, FONTS);
// États de toutes les images, puis une capture par état distinct.
const keys = await page.evaluate(([a, b]) => { const k = []; for (let f = a; f < b; f++) k.push(window.__seek(f / 24)); return k; }, [F0, F1]);
const uniq = new Map();
keys.forEach((k, i) => { if (!uniq.has(k)) uniq.set(k, i); });
const t0 = Date.now();
let n = 0;
for (const [k, i] of uniq) {
  const file = path.join(WORK, 'u', `u_${pad5(n)}.png`);
  await page.evaluate((t) => window.__seek(t), (F0 + i) / FPS);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  uniq.set(k, file);
  n++;
}
await browser.close();
for (let i = 0; i < keys.length; i++) {
  const link = path.join(WORK, 'o', `o_${pad5(F0 + i)}.png`);
  fs.rmSync(link, { force: true });
  fs.symlinkSync(uniq.get(keys[i]), link);
}
console.log(`calques : ${keys.length} images, ${n} captures (${((Date.now() - t0) / 1000).toFixed(0)} s)`);

// ------------------------------------------------------------------ 2) composition + voix
const ins = ['-framerate', String(FPS), '-start_number', String(F0), '-i', path.join(FRAMES, '3d', 'f_%05d.jpg'),
  '-framerate', String(FPS), '-start_number', String(F0), '-i', path.join(FRAMES, 'annot', 'a_%05d.png'),
  '-framerate', String(FPS), '-start_number', String(F0), '-i', path.join(WORK, 'o', 'o_%05d.png')];
let fc = `[0:v]format=gbrp[b];[1:v]format=gbrap[an];[b][an]overlay=0:0:format=gbrp:eof_action=repeat[v3];`
  + `[v3]pad=${W}:${H}:0:0:color=0x15191c[p];[2:v]format=gbrap[ov];[p][ov]overlay=0:0:format=gbrp:eof_action=repeat[c];`
  + `[c]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[v]`;
const maps = ['-map', '[v]'];
if (VOICE) {
  // Voix : chaque morceau de l'enregistrement placé à son instant (silences ajoutés compris).
  const pieces = SEGS.flatMap((s) => voicePieces(s)).map((p) => ({ ...p, src: 3 }));
  ins.push('-i', VOICE_FILE);
  // Encart de la variante 8 pi : sa voix (fichier à part) au complet, la première
  // réplique calée sur V8.lead (la fin du fichier tombe avant la fin de l'encart).
  const v8 = SEGS.find((s) => s.insert);
  if (v8 && fs.existsSync(V8.file)) {
    ins.push('-i', V8.file);
    pieces.push({ src: 4, a: 0, b: V8.fileDur, at: v8.start + v8.insert.at + V8.lead - V8.lines[0][0] });
  } else if (v8) console.warn(`voix de l'encart absente (${V8.file}) : encart muet`);
  fc += ';' + pieces.map((p, i) => `[${p.src}:a]atrim=start=${p.a}:end=${p.b},asetpts=PTS-STARTPTS,adelay=${Math.round(p.at * 1000)}:all=1[p${i}]`).join(';')
    + `;${pieces.map((_, i) => `[p${i}]`).join('')}amix=inputs=${pieces.length}:normalize=0:dropout_transition=0,atrim=duration=${DUR.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
  maps.push('-map', '[a]', '-c:a', 'aac', '-b:a', opt('abr', '192k'), '-ar', '48000');
}
const t1 = Date.now();
run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...ins, '-filter_complex', fc, ...maps, '-frames:v', String(F1 - F0),
  // Rendu photoréaliste (bois veiné) : aucune image B. Avec les images B (réglage
  // « animation »), la veine du bois était plus floue sur 5 images sur 6 et nette sur la
  // sixième : le plancher scintillait 4 fois par seconde dès qu'une pièce ou la caméra
  // bougeait. Images P seulement, images I aussi fines que les P (ipratio=1) : netteté
  // constante d'une image à l'autre, pour un fichier de taille comparable.
  '-c:v', 'libx264', '-crf', opt('crf', '21'), '-preset', opt('preset', 'slow'), '-tune', opt('tune', 'film'),
  ...(opt('x264', '') === 'aucun' ? [] : ['-x264-params', opt('x264', 'bframes=0:aq-mode=3:ipratio=1.0')]), '-pix_fmt', 'yuv420p',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', RENDER]);
console.log(`→ ${RENDER} (${((Date.now() - t1) / 1000).toFixed(0)} s)`);
