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
import { timeline } from '../src/video/plancher-script.js';
import { W, H, H3, FONTS, S, calques } from './plancher-calques.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const FRAMES = path.resolve(opt('frames', 'scratch/apercu'));
const FPS = Number(opt('fps', '24'));
const PROJ = path.resolve(opt('project', path.join(os.homedir(), 'hf-plancher', 'projet')));
const RENDER = opt('render', null);
const REPO = path.resolve(new URL('..', import.meta.url).pathname);
if (PROJ.startsWith(REPO + path.sep)) throw new Error('Le projet HyperFrames doit être hors du dépôt.');

// Tailles de police du bandeau mesurées dans la page de capture (fits.json), sinon estimées.
const FITS = fs.existsSync(path.join(FRAMES, 'fits.json')) ? JSON.parse(fs.readFileSync(path.join(FRAMES, 'fits.json'), 'utf8')) : [];
// --segments N : seulement les N premiers segments (essai rapide du montage).
const SEGS = timeline().slice(0, Number(opt('segments', '999')));
const DUR = SEGS.at(-1).start + SEGS.at(-1).dur;

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
let fontCss = '';
for (const [fam, wt, pkg, file] of FONTS) {
  fs.copyFileSync(path.join(REPO, 'node_modules', '@fontsource', pkg, 'files', file), path.join(PROJ, 'fonts', file));
  fontCss += `@font-face { font-family: "${fam}"; font-weight: ${wt}; font-style: normal; src: url("fonts/${file}") format("woff2"); }\n`;
}

// --- 3) composition (calques communs : scripts/plancher-calques.mjs) ---
fs.mkdirSync(path.join(PROJ, 'compositions'), { recursive: true });
const { css, layers: L, subs: SUBS } = calques({
  segs: SEGS, fits: FITS, fontCss,
  video: (s, i) => { const id = String(i).padStart(2, '0'); return `<video id="v${id}" class="clip vue3d" src="clips/s${id}.mp4" data-start="${S(s.start)}" data-duration="${S(s.dur)}" data-media-start="0" data-track-index="0" muted playsinline></video>`; },
});

const html = `<!doctype html>
<!-- Généré par scripts/video-plancher-hf.mjs (dépôt pieces-3d) : ne pas modifier à la main. -->
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<title>Plancher pour foreuse aux diamants sous terre</title>
<style>${css}</style>
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
  const r = spawnSync('nice', ['-n', '10', HF, 'render', PROJ, '--output', path.resolve(RENDER), '--fps', String(FPS), '--crf', opt('crf', '17'),
    '--workers', opt('workers', '2'), '--no-browser-gpu', '--quiet'], { stdio: 'inherit', env });
  if (r.status !== 0) throw new Error(`rendu HyperFrames : code ${r.status}`);
  console.log(`→ ${RENDER}`);
}
