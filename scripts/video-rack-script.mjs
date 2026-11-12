// Script de voix et sous-titres de la vidéo du support de tiges, tirés du
// scénario (src/video/rack-script.js) et minutés sur la vidéo. Écrit :
//   video/rack/script.json              passage, étape, texte à dire, mots, début et durée
//   video/rack/script-elevenlabs.txt    à coller dans ElevenLabs (une réplique par paragraphe)
//   video/rack/script-elevenlabs.md     tableau de lecture et de révision
//   public/equipment/rack-tiges-dd/video/sous-titres.vtt   sous-titres de la vidéo publiée
//   node scripts/video-rack-script.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { timeline } from '../src/video/rack-script.js';

// Formes à dire plutôt qu'à lire (sigles, numéros de procédure).
const DIT = [
  [/PRO-DD-ST-008/g, 'P-R-O, D-D, S-T, zéro zéro huit'],
  [/\bHQ\b/g, 'H-Q'], [/\bNQ\b/g, 'N-Q'], [/\bBQ\b/g, 'B-Q'],
  [/bear trap/g, '« bear trap »'],
];
const dire = (t) => DIT.reduce((s, [a, b]) => s.replace(a, b), t);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const tc = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const vtt = (t) => `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${(t % 60).toFixed(3).padStart(6, '0')}`;

const segs = timeline();
const total = segs.at(-1).start + segs.at(-1).dur;
const rows = segs.map((s) => ({ passage: s.id, etape: s.step, titre: s.title, texte: dire(s.voix), mots: words(s.voix), debut: s.start + 0.6, duree: s.dur }));

mkdirSync('video/rack', { recursive: true });
writeFileSync('video/rack/script.json', `${JSON.stringify(rows, null, 1)}\n`);
writeFileSync('video/rack/script-elevenlabs.txt', rows.map((r) => r.texte).join('\n\n') + '\n');
const md = [
  '# Script de voix : installation du support de tiges de forage (PRO-DD-ST-008)',
  '',
  `Une seule voix (formateur). Durée de la vidéo : ${tc(total)} ; ${rows.reduce((n, r) => n + r.mots, 0)} mots.`,
  'Chaque réplique commence à l’instant indiqué et doit tenir dans la durée de son passage.',
  '',
  '| Début | Durée | Passage | Réplique |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) => `| ${tc(r.debut)} | ${r.duree} s | ${r.titre} | ${r.texte} |`),
  '',
];
writeFileSync('video/rack/script-elevenlabs.md', md.join('\n'));

// Sous-titres : chaque réplique découpée en phrases, réparties dans son passage au prorata des mots.
const cues = [];
for (const s of segs) {
  const parts = s.voix.match(/[^.!?:]+[.!?:]+(?:\s|$)|[^.!?:]+$/g).map((x) => x.trim()).filter(Boolean);
  // Phrases très courtes (« Étape 3. ») rattachées à la suivante.
  const lines = [];
  for (const p of parts) { if (lines.length && words(lines.at(-1)) < 4) lines[lines.length - 1] += ` ${p}`; else lines.push(p); }
  const w = lines.reduce((n, x) => n + words(x), 0);
  let t = s.start + 0.5;
  for (const x of lines) {
    const d = ((s.dur - 0.9) * words(x)) / w;
    cues.push(`${vtt(t)} --> ${vtt(t + d - 0.1)}\n${x}`);
    t += d;
  }
}
mkdirSync('public/equipment/rack-tiges-dd/video', { recursive: true });
writeFileSync('public/equipment/rack-tiges-dd/video/sous-titres.vtt', `WEBVTT\n\n${cues.join('\n\n')}\n`);
console.log(`${rows.length} répliques, ${cues.length} sous-titres, ${tc(total)} → video/rack/ et public/equipment/rack-tiges-dd/video/sous-titres.vtt`);
