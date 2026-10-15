// Script ElevenLabs de la vidéo du plancher, tiré du scénario
// (src/video/plancher-script.js) : mêmes répliques, minutées sur la vidéo.
// Écrit video/plancher/script.json (format de la vidéo du mandrin : passage,
// orateur, texte, mots, plus l'instant visé dans la vidéo),
// video/plancher/script-elevenlabs.txt (à coller dans ElevenLabs) et
// video/plancher/script-elevenlabs.md (lecture et révision).
//   node scripts/video-plancher-script.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { timeline } from '../src/video/plancher-script.js';

const VOIX = { 1: 'Formateur', 2: 'Travailleur' };
// Formes à dire plutôt qu'à lire (sigles, numéros de procédure).
const DIT = [
  [/PRO-DD-ST-003/g, 'P-R-O, D-D, S-T, zéro zéro trois'],
  [/\bRSST\b/g, 'R-S-S-T'],
];
const dire = (t) => DIT.reduce((s, [a, b]) => s.replace(a, b), t);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const NOMS = { titre: 'Titre', materiel: 'Matériel', demont: 'Démantèlement', fin: 'À retenir' };
const tc = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

const segs = timeline();
const total = segs.at(-1).start + segs.at(-1).dur;
const rows = [];
for (const s of segs) {
  // Répliques réparties dans le segment au prorata des mots.
  const w = s.lines.reduce((n, [, x]) => n + words(x), 0);
  let t = s.start + 0.6;
  s.lines.forEach(([o, x], i) => {
    rows.push({ passage: s.id, etape: s.band.n || null, orateur: o, texte: dire(x), mots: words(x), debut: Math.round(t * 10) / 10 });
    t += ((s.dur - 1.6) * words(x)) / w + 0.35;
  });
}

mkdirSync('video/plancher', { recursive: true });
writeFileSync('video/plancher/script.json', `${JSON.stringify(rows, null, 1)}\n`);
writeFileSync('video/plancher/script-elevenlabs.txt', rows.map((r) => `${VOIX[r.orateur]}: ${r.texte}`).join('\n\n') + '\n');

const md = [
  '# Script ElevenLabs : fabrication d’un plancher pour foreuse aux diamants sous terre',
  '',
  `Procédure PRO-DD-ST-003 (révision juillet 2026). Vidéo de ${tc(total)} (${total.toFixed(1)} s), ${rows.length} répliques, ${rows.reduce((n, r) => n + r.mots, 0)} mots.`,
  '',
  'Deux voix, comme la vidéo du mandrin : **Formateur** (voix 1, posée, québécoise) et **Travailleur** (voix 2, aide-foreur). Coller `script-elevenlabs.txt` dans le mode dialogue d’ElevenLabs et associer chaque nom à sa voix. Débit visé : environ 2,5 mots par seconde. Les sigles sont écrits comme ils se disent (P-R-O, D-D, S-T, zéro zéro trois ; R-S-S-T).',
  '',
  'Le minutage est celui de la vidéo actuelle. Une fois l’audio enregistré, la vidéo peut être recalée sur la voix (comme la vidéo du mandrin).',
  '',
  '| Début | Partie | Voix | Réplique |',
  '|---|---|---|---|',
  ...rows.map((r) => `| ${tc(r.debut)} | ${r.etape ? (r.etape === '0' ? 'Inspection' : r.etape === '18' ? 'Plancher secondaire' : `Étape ${r.etape}`) : NOMS[r.passage] || r.passage} | ${VOIX[r.orateur]} | ${r.texte} |`),
  '',
].join('\n');
writeFileSync('video/plancher/script-elevenlabs.md', md);
console.log(`${rows.length} répliques, ${tc(total)} → video/plancher/`);
