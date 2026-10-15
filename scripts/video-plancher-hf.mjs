// Montage HyperFrames (HeyGen) de la vidéo du plancher, comme la vidéo du
// mandrin (dépôt Animation-forage) : la 3D vient de la capture image par image
// (scripts/video-plancher.mjs : dossier 3d/ et levels.json), HyperFrames
// compose les calques (bandeau des étapes avec le texte de la procédure,
// encadrés « Pourquoi », carton titre, carton « À retenir », étiquette) et
// produit le MP4.
//
// HyperFrames 0.8.144 installé HORS du dépôt (npm ci de
// Animation-forage/video/hyperframes/installation/), navigateur imposé :
// headless shell Chromium 141 de Playwright. Le projet HyperFrames est écrit
// hors du dépôt (--project).
//
//   node scripts/video-plancher-hf.mjs --frames scratch/apercu --fps 12 \
//     --project ~/hf-plancher/apercu --render ~/hf-plancher/apercu.mp4
//
// Variables : HYPERFRAMES (défaut ~/outils-hf/node_modules/.bin/hyperframes),
// HF_NAVIGATEUR (défaut : chromium_headless_shell-1194 de $PLAYWRIGHT_BROWSERS_PATH).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { timeline, RETENIR } from '../src/video/plancher-script.js';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const FRAMES = path.resolve(opt('frames', 'scratch/apercu'));
const FPS = Number(opt('fps', '24'));
const PROJ = path.resolve(opt('project', path.join(os.homedir(), 'hf-plancher', 'projet')));
const RENDER = opt('render', null);
const REPO = path.resolve(new URL('..', import.meta.url).pathname);
if (PROJ.startsWith(REPO + path.sep)) throw new Error('Le projet HyperFrames doit être hors du dépôt.');

const W = 1280, H = 720, H3 = 590;
// --segments N : seulement les N premiers segments (essai rapide du montage).
const SEGS = timeline().slice(0, Number(opt('segments', '999')));
const DUR = SEGS.at(-1).start + SEGS.at(-1).dur;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = (x) => (+x.toFixed(4)).toString();

function ffmpeg(a) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg ${a.slice(0, 6).join(' ')}…`);
}

// --- 1) 3D : un clip sans perte par segment (H.264 RVB, qp 0) ---
fs.mkdirSync(path.join(PROJ, 'clips'), { recursive: true });
const total = Math.round(DUR * FPS);
SEGS.forEach((s, i) => {
  const f0 = Math.round(s.start * FPS), f1 = Math.min(total, Math.round((s.start + s.dur) * FPS));
  const out = path.join(PROJ, 'clips', `s${String(i).padStart(2, '0')}.mp4`);
  if (fs.existsSync(out)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hfseq-'));
  for (let f = f0; f < f1; f++) {
    const src = path.join(FRAMES, '3d', `f_${String(f).padStart(5, '0')}.jpg`);
    if (!fs.existsSync(src)) throw new Error(`image 3D manquante : ${src}`);
    fs.symlinkSync(src, path.join(tmp, `${String(f - f0).padStart(5, '0')}.jpg`));
  }
  ffmpeg(['-framerate', String(FPS), '-i', path.join(tmp, '%05d.jpg'), '-vf', `scale=${W}:${H3}:flags=bilinear,format=gbrp`,
    '-c:v', 'libx264rgb', '-qp', '0', '-preset', 'veryfast', '-g', String(FPS), '-pix_fmt', 'rgb24', '-r', String(FPS), '-an', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// --- 2) polices locales (fontsource), comme le site ---
fs.mkdirSync(path.join(PROJ, 'fonts'), { recursive: true });
const FONTS = [
  ['Barlow Condensed', 600, 'barlow-condensed', 'barlow-condensed-latin-600-normal.woff2'],
  ['Barlow Condensed', 700, 'barlow-condensed', 'barlow-condensed-latin-700-normal.woff2'],
  ['IBM Plex Sans', 400, 'ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2'],
  ['IBM Plex Sans', 600, 'ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2'],
  ['IBM Plex Mono', 500, 'ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2'],
];
let fontCss = '';
for (const [fam, wt, pkg, file] of FONTS) {
  fs.copyFileSync(path.join(REPO, 'node_modules', '@fontsource', pkg, 'files', file), path.join(PROJ, 'fonts', file));
  fontCss += `@font-face { font-family: "${fam}"; font-weight: ${wt}; font-style: normal; src: url("fonts/${file}") format("woff2"); }\n`;
}

// --- 3) composition ---
const STEPS = Array.from({ length: 18 }, (_, i) => String(i + 1));
const label = (b) => (b.n === '' ? '' : b.n === '0' ? 'Avant' : b.n === '18' ? 'Plancher secondaire' : `Étape ${b.n}`);
const bar = (s) => STEPS.map((k) => {
  const n = Number(s.band.n), kk = Number(k);
  const cls = s.band.n !== '' && kk === n ? 'on' : (s.band.n !== '' && kk < n) || s.id === 'demont' || s.id === 'fin' ? 'done' : '';
  return `<i class="${cls}">${k}</i>`;
}).join('');
// Fondu : animation CSS calée par HyperFrames sur le temps local du calque (délai 0 = début du calque).
const anim = (name, at, d) => `animation: ${name} ${S(d)}s linear ${S(at)}s both;`;
const keys = [];
let K = 0;
const inOut = (at, d, fin = 0.5, fout = 0.4) => {
  const name = `io${K++}`;
  const a = (100 * fin) / d, b = 100 - (100 * fout) / d;
  keys.push(`@keyframes ${name} { 0% { opacity: 0; } ${S(a)}% { opacity: 1; } ${S(b)}% { opacity: 1; } 100% { opacity: 0; } }`);
  return anim(name, at, d);
};

const L = [];
// Calque à plusieurs éléments (bandeau, carton) : sous-composition HyperFrames,
// temps locaux (0 = début du calque), montée par un hôte plein cadre.
fs.mkdirSync(path.join(PROJ, 'compositions'), { recursive: true });
const SUBS = [];
function sub(id, at, d, track, body) {
  SUBS.push([id, body]);
  L.push(`<div id="${id}" class="clip hote" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${S(at)}" data-duration="${S(d)}" data-track-index="${track}" data-width="${W}" data-height="${H}" data-no-timeline></div>`);
}
SEGS.forEach((s, i) => {
  const id = String(i).padStart(2, '0');
  L.push(`<video id="v${id}" class="clip vue3d" src="clips/s${id}.mp4" data-start="${S(s.start)}" data-duration="${S(s.dur)}" data-media-start="0" data-track-index="0" muted playsinline></video>`);
  const bStart = s.card === 'title' ? s.start + s.dur * 0.55 : s.start;
  const b = s.band;
  const bLen = s.start + s.dur - bStart;
  const fit = (txt, max, min, ref) => Math.max(min, Math.min(max, +(max * Math.sqrt(ref / Math.max(1, txt.length))).toFixed(1)));
  sub(`b${id}`, bStart, bLen, 1, `<div class="band">`
    + `<div class="bar">${bar(s)}</div><div class="head" style="${anim('fadein', 0, 0.35)}"><span class="num">${esc(label(b))}</span><span class="title">${b.n === '18' ? '' : esc(b.title)}</span></div>`
    + `<div class="text" style="font-size:${fit(b.text, 17, 12, 235)}px;${anim('fadein', 0, 0.35)}">${esc(b.text)}</div>`
    + `<div class="detail" style="font-size:${fit(b.detail, 14, 10.5, 175)}px;${anim('fadein', 0, 0.35)}">${esc(b.detail)}</div></div>`);
  if (s.why) {
    const at = s.start + 0.8, d = s.dur - 0.8;
    L.push(`<div id="w${id}" class="clip why" data-start="${S(at)}" data-duration="${S(d)}" data-track-index="2" style="${inOut(0, d)}"><b>Pourquoi</b><span>${esc(s.why)}</span></div>`);
  }
  if (s.card === 'title') {
    const d = s.dur * 0.55 + 0.6;
    sub(`c${id}`, s.start, d, 3, `<div class="card title" style="${inOut(0, d, 0.01, 0.6)}">`
      + '<small>Procédure de travail · PRO-DD-ST-003</small><h1>Fabrication d’un plancher pour foreuse aux diamants sous terre</h1><p>Machines Roger International · révision juillet 2026</p></div>');
  }
  if (s.card === 'end') {
    const at = s.start + 1.2, d = s.dur - 1.2;
    sub(`c${id}`, at, d, 3, `<div class="card end" style="${anim('fadein', 0, 0.6)}">`
      + `<h2>À retenir</h2><ol>${RETENIR.map((r) => `<li>${esc(r)}</li>`).join('')}</ol><p>Procédure PRO-DD-ST-003 · Modèle 3D : reconstitution d’après la procédure</p></div>`);
  }
});

const html = `<!doctype html>
<!-- Généré par scripts/video-plancher-hf.mjs (dépôt pieces-3d) : ne pas modifier à la main. -->
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<title>Plancher pour foreuse aux diamants sous terre</title>
<style>
${fontCss}
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #15191c; }
#video { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #15191c; color: #f1f3f4; font-family: "IBM Plex Sans", sans-serif; }
.hote { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
.vue3d { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H3}px; object-fit: fill; z-index: 1; }
.tag { position: absolute; top: 16px; right: 18px; z-index: 5; font: 500 12px/1 "IBM Plex Mono", monospace; letter-spacing: .08em; color: rgba(255,255,255,.8); background: rgba(10,12,14,.55); padding: 6px 9px; border-radius: 4px; }
.bandbg { position: absolute; left: 0; top: ${H3}px; width: ${W}px; height: ${H - H3}px; background: #15191c; border-top: 3px solid #f2c230; box-sizing: border-box; z-index: 1; }
.band { position: absolute; left: 0; top: ${H3}px; width: ${W}px; height: ${H - H3}px; box-sizing: border-box; padding: 9px 22px 10px; border-top: 3px solid #f2c230; background: #15191c; z-index: 2; display: grid; grid-template-rows: auto auto 1fr auto; row-gap: 3px; }
.bar { display: flex; gap: 3px; }
.bar i { flex: 1; font: 500 10px/14px "IBM Plex Mono", monospace; font-style: normal; text-align: center; color: #6c767d; background: #232a2f; border-radius: 2px; }
.bar i.done { background: #3b4348; color: #c8cfd3; }
.bar i.on { background: #f2c230; color: #15191c; font-weight: 600; }
.head { display: flex; align-items: baseline; gap: 12px; white-space: nowrap; overflow: hidden; }
.num { font: 700 23px/1.05 "Barlow Condensed", sans-serif; color: #f2c230; text-transform: uppercase; letter-spacing: .02em; }
.title { font: 600 23px/1.05 "Barlow Condensed", sans-serif; }
.text { color: #f2c230; font-size: 17px; line-height: 1.28; overflow: hidden; min-height: 0; }
.detail { color: #a9b3ba; font-size: 14px; line-height: 1.3; overflow: hidden; max-height: 37px; }
.why { position: absolute; top: 16px; left: 18px; width: 380px; z-index: 4; background: rgba(14,17,20,.86); border-left: 4px solid #f2c230; border-radius: 4px; padding: 10px 14px 11px; font-size: 15px; line-height: 1.38; box-sizing: border-box; will-change: transform; }
.why b { display: block; font: 700 15px/1 "Barlow Condensed", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f2c230; margin-bottom: 6px; }
.card { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H3}px; z-index: 3; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; padding: 0 90px; background: linear-gradient(90deg, rgba(12,14,16,.92) 0%, rgba(12,14,16,.78) 55%, rgba(12,14,16,.35) 100%); }
.card.title h1 { font: 700 60px/1.02 "Barlow Condensed", sans-serif; margin: 10px 0 18px; max-width: 900px; text-transform: uppercase; }
.card.title small { font: 500 15px/1 "IBM Plex Mono", monospace; letter-spacing: .12em; color: #f2c230; }
.card.title p { margin: 0; font-size: 19px; color: #a9b3ba; }
.card.end h2 { font: 700 48px/1 "Barlow Condensed", sans-serif; color: #f2c230; text-transform: uppercase; margin: 0 0 22px; }
.card.end ol { margin: 0 0 24px; padding-left: 30px; font-size: 24px; line-height: 1.5; max-width: 980px; }
.card.end li::marker { color: #f2c230; font-weight: 600; }
.card.end p { margin: 0; font-size: 14px; color: #a9b3ba; }
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
${keys.join('\n')}
</style>
</head>
<body>
<div id="video" data-composition-id="plancher" data-start="0" data-duration="${S(DUR)}" data-width="${W}" data-height="${H}" data-fps="${FPS}" data-no-timeline>
<div class="bandbg"></div>
<div class="tag">PRO-DD-ST-003</div>
${L.join('\n')}
</div>
</body>
</html>
`;
const subCss = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>')).replace(/url\("fonts\//g, 'url("../fonts/');
for (const [id, body] of SUBS) {
  fs.writeFileSync(path.join(PROJ, 'compositions', `${id}.html`), `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>${id}</title></head>
<body><template><style>${subCss}
#root { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; font-family: "IBM Plex Sans", sans-serif; color: #f1f3f4; }
</style><div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}" data-no-timeline>${body}</div></template></body></html>
`);
}
fs.writeFileSync(path.join(PROJ, 'index.html'), html);
console.log(`projet HyperFrames : ${PROJ} (${SEGS.length} segments, ${S(DUR)} s, ${FPS} i/s)`);

// --- 4) rendu (optionnel) ---
if (RENDER) {
  const HF = process.env.HYPERFRAMES || path.join(os.homedir(), 'outils-hf', 'node_modules', '.bin', 'hyperframes');
  const NAV = process.env.HF_NAVIGATEUR || path.join(process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), '.cache', 'ms-playwright'), 'chromium_headless_shell-1194', 'chrome-linux', 'headless_shell');
  const work = path.join(path.dirname(PROJ), '.hf');
  for (const d of ['home', 'tmp', 'cache']) fs.mkdirSync(path.join(work, d), { recursive: true });
  const env = {
    PATH: `${path.dirname(process.execPath)}:/usr/local/bin:/usr/bin:/bin`, HOME: path.join(work, 'home'), TMPDIR: path.join(work, 'tmp'), LANG: 'C.UTF-8',
    HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1', HYPERFRAMES_NO_UPDATE_CHECK: '1', HYPERFRAMES_SKIP_SKILLS: '1', HYPERFRAMES_NO_AUTO_INSTALL: '1',
    HYPERFRAMES_EXTRACT_CACHE_DIR: path.join(work, 'cache'), HYPERFRAMES_BROWSER_PATH: NAV,
    HYPERFRAMES_FFMPEG_PATH: spawnSync('which', ['ffmpeg']).stdout.toString().trim(), HYPERFRAMES_FFPROBE_PATH: spawnSync('which', ['ffprobe']).stdout.toString().trim(),
  };
  const r = spawnSync('nice', ['-n', '10', HF, 'render', PROJ, '--output', path.resolve(RENDER), '--fps', String(FPS), '--crf', '22',
    '--workers', opt('workers', '2'), '--no-browser-gpu', '--quiet'], { stdio: 'inherit', env });
  if (r.status !== 0) throw new Error(`rendu HyperFrames : code ${r.status}`);
  console.log(`→ ${RENDER}`);
}
