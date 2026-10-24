// Contrôle de la visserie calculée (src/data/visserie.js) sur tous les data.json :
// rejoue le calcul de la page des données techniques et signale les descriptions
// à risque dont la taille calculée contredit le texte :
//  - « n LG » (longueur explicite) : la longueur calculée doit valoir n ;
//  - « d DIA » (diamètre d'épaulement ou de corps) : d ne doit pas être pris pour la longueur ;
//  - « #n » (vis à jauge) : la taille doit être la jauge n, pas une fraction ;
//  - « M14 » (filet métrique) : taille « non précisée ».
// Usage : node scripts/check-visserie.mjs [--verbose]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { visserie, libTaille, same } from '../src/data/visserie.js';

const ROOT = join(import.meta.dirname, '..', 'public', 'equipment');
const verbose = process.argv.includes('--verbose');
const FR = String.raw`(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`;
const num = (s) => {
  const t = String(s).trim();
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = t.match(/^(\d+)\/(\d+)$/);
  return m ? m[1] / m[2] : parseFloat(t);
};

let problems = 0, checked = 0, total = 0;
for (const id of readdirSync(ROOT).sort()) {
  const file = join(ROOT, id, 'data.json');
  if (!existsSync(file)) continue;
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const assemblies = new Map(Object.entries(data.assemblies || {}).map(([aid, a]) => [aid, {
    id: aid,
    parts: (a.parts || []).map(([ref, pn, qty, desc, extra = {}]) => ({ ref: String(ref), pn: pn || '', qty: qty ?? null, desc: desc || '', ...extra })),
  }]));
  const lignes = visserie({ assemblies });
  total += lignes.length;
  for (const l of lignes) {
    const d = String(l.r.desc).replace(/''/g, '"');
    const t = l.t;
    const why = [];
    const lg = d.match(new RegExp(String.raw`${FR}\s*"?\s*(?:LG|LONG|LENGTH)\b`, 'i'));
    const dia = d.match(new RegExp(String.raw`${FR}\s*"?\s*DIA\b`, 'i'));
    const gauge = d.match(/#\s*(\d{1,2})\b/);
    const metric = /\bM\d{1,2}(?:\s*[xX×]|\b)/.test(d);
    if (!lg && !dia && !gauge && !metric) continue;
    checked++;
    if (metric && t) why.push('filet métrique lu comme une taille en pouces');
    if (gauge && (!t || t.jauge !== +gauge[1])) why.push(`jauge #${gauge[1]} non reconnue`);
    if (lg && t && !(t.l != null && same(t.l, num(lg[1])))) why.push(`longueur ${lg[1]} po attendue`);
    if (dia && t && t.l != null && same(t.l, num(dia[1])) && !(lg && same(num(lg[1]), num(dia[1])))) why.push(`diamètre ${dia[1]} pris pour la longueur`);
    if (why.length) {
      problems++;
      console.log(`✗ ${id} ${l.asm.id} rep. ${l.r.ref} ${l.r.pn} « ${l.r.desc} » → ${t ? libTaille(t) : 'non précisée'} : ${why.join(' ; ')}`);
    } else if (verbose) console.log(`✓ ${id} ${l.asm.id} rep. ${l.r.ref} « ${l.r.desc} » → ${t ? libTaille(t) : 'non précisée'}`);
  }
}
console.log(`${total} lignes de visserie, ${checked} descriptions à risque contrôlées, ${problems} problème${problems > 1 ? 's' : ''}.`);
process.exit(problems ? 1 : 0);
