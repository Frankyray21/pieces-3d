// Montage final de la vidéo du plancher, après les rendus :
//   1. 3D à 12 i/s (scripts/video-plancher.mjs --fps 12 --fxaa) portée à
//      24 i/s par interpolation de mouvement (ffmpeg minterpolate), puis
//      calque d'annotations à 24 i/s (scripts/video-plancher-annot.mjs) superposé ;
//   2. montage HyperFrames (scripts/video-plancher-hf.mjs : bandeau, cartons) ;
//   3. voix (VOICE_FILE) placée selon la chronologie, niveau normalisé, mixée.
//   node scripts/video-plancher-final.mjs --frames scratch/video --out scratch/video24 --render plancher.mp4
//
// 3D déjà à 24 i/s (--fps3d 24) : montage direct (scripts/video-plancher-montage.mjs,
// mêmes calques, une seule passe ffmpeg, quelques minutes) ; --hf garde l'ancien
// chemin HyperFrames (35 à 40 min).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { timeline, vt, VOICE_FILE } from '../src/video/plancher-script.js';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const FRAMES = path.resolve(opt('frames', 'scratch/video'));
const OUT = path.resolve(opt('out', 'scratch/video24'));
const RENDER = path.resolve(opt('render', 'plancher.mp4'));
const HFPROJ = opt('project', path.join(os.homedir(), 'hf-plancher', 'final'));
const FPS3D = Number(opt('fps3d', '12')); // 24 : 3D déjà à 24 i/s, sans interpolation
const SEGS = timeline();
const DUR = SEGS.at(-1).start + SEGS.at(-1).dur;
const total = Math.round(DUR * 24);
const run = (cmd, a) => { const r = spawnSync(cmd, a, { stdio: 'inherit' }); if (r.status !== 0) throw new Error(`${cmd} : code ${r.status}`); };

if (FPS3D === 24 && !args.includes('--hf')) {
  run('node', ['scripts/video-plancher-montage.mjs', '--frames', FRAMES, '--render', RENDER]);
  process.exit(0);
}

// 1) 3D interpolée + annotations.
const dir3 = path.join(OUT, '3d');
fs.mkdirSync(dir3, { recursive: true });
const have = fs.readdirSync(dir3).length;
if (have < total) {
  const interp = FPS3D === 24 ? '' : 'minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,';
  run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS3D), '-i', path.join(FRAMES, '3d', 'f_%05d.jpg'), '-framerate', '24', '-i', path.join(FRAMES, 'annot', 'a_%05d.png'),
    '-filter_complex', `[0:v]${interp}format=rgba[b];[b][1:v]overlay=0:0:eof_action=repeat,format=rgb24`,
    '-q:v', '2', '-start_number', '0', path.join(dir3, 'f_%05d.jpg')]);
}
// Dernières images manquantes (interpolation) : copie de la dernière.
const files = fs.readdirSync(dir3).sort();
const last = path.join(dir3, files.at(-1));
for (let f = 0; f <= total; f++) {
  const p = path.join(dir3, `f_${String(f).padStart(5, '0')}.jpg`);
  if (!fs.existsSync(p)) fs.copyFileSync(last, p);
}
fs.copyFileSync(path.join(FRAMES, 'fits.json'), path.join(OUT, 'fits.json'));

// 2) Montage HyperFrames (sans voix).
const muet = path.join(path.dirname(HFPROJ), 'montage-muet.mp4');
if (!fs.existsSync(muet)) {
  fs.rmSync(HFPROJ, { recursive: true, force: true });
  run('node', ['scripts/video-plancher-hf.mjs', '--frames', OUT, '--fps', '24', '--project', HFPROJ, '--render', muet, '--workers', '2']);
}

// 3) Voix : chaque morceau de l'enregistrement placé à son instant (silences ajoutés compris).
const pieces = [];
for (const s of SEGS) {
  const cuts = [s.voice.a, ...s.voice.gaps.map((g) => g[0]).filter((x) => x > s.voice.a && x < s.voice.b), s.voice.b];
  for (let i = 0; i + 1 < cuts.length; i++) pieces.push({ a: cuts[i], b: cuts[i + 1], at: vt(s, cuts[i]) + (i > 0 ? 0 : 0) });
}
const fc = pieces.map((p, i) => `[0:a]atrim=start=${p.a}:end=${p.b},asetpts=PTS-STARTPTS,adelay=${Math.round(p.at * 1000)}:all=1[p${i}]`).join(';')
  + `;${pieces.map((_, i) => `[p${i}]`).join('')}amix=inputs=${pieces.length}:normalize=0:dropout_transition=0,atrim=duration=${DUR.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
run('ffmpeg', ['-v', 'error', '-y', '-i', muet, '-i', VOICE_FILE, '-filter_complex', fc.replace(/\[0:a\]/g, '[1:a]'), '-map', '0:v', '-map', '[a]',
  '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', RENDER]);
console.log(`→ ${RENDER}`);
