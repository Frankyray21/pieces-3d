// Contrôle chiffré du core knocker NQ 15222420 contre ses plans : encombrement
// et position de chaque pièce (cotes des plans et relevés à l'échelle, en
// pouces), jeux entre les pièces, et masse d'acier du modèle à comparer aux
// cartouches (9,4 lb pour l'assemblage, 6,3 lb pour le corps). Les cordons de
// soudure ne sont comptés ni dans les cotes ni dans la masse.
//
// Usage : node scripts/check-core-knocker.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/core-knocker/index.js';

const IN = 0.0254;
const ACIER = 0.2836; // lb/po³
const model = buildProcedural(builders, 'P01');
model.root.updateMatrixWorld(true);

const cordon = (o) => !!o.userData.soudure;

/** Boîte d'un objet en pouces (x du bout ouvert du tube, y du bas de la plaque). */
function boite(p) {
  const b = new THREE.Box3();
  p.traverse((o) => { if (o.isMesh && !cordon(o)) b.expandByObject(o); });
  return { x0: b.min.x / IN, x1: b.max.x / IN, y0: b.min.y / IN, y1: b.max.y / IN, z0: b.min.z / IN, z1: b.max.z / IN };
}

/** Volume d'acier d'un objet (po³), par somme de tétraèdres signés (maillages fermés). */
function volume(p) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let v = 0;
  p.traverse((o) => {
    if (!o.isMesh || cordon(o)) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i < n; i += 3) {
      const k = idx ? [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)] : [i, i + 1, i + 2];
      a.fromBufferAttribute(pos, k[0]).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, k[1]).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, k[2]).applyMatrix4(o.matrixWorld);
      v += a.dot(b.cross(c)) / 6;
    }
  });
  return v / IN ** 3;
}

let failed = false;
let n = 0;
/** Mesure comparée à la valeur attendue (tolérance en pouces ; plans : ± 1/16). */
function cote(nom, mesure, attendu, tol = 0.01, source = 'plan') {
  n++;
  const ok = Math.abs(mesure - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${mesure.toFixed(3)} po (${source} : ${attendu})`);
}
const releve = (nom, mesure, attendu, tol = 0.01) => cote(nom, mesure, attendu, tol, 'relevé');
const f = (a, b) => a + b / 16; // pouces et seizièmes

const P = (ref) => model.refs.get(ref)[0];
const corps = P('1');
const [tubeObj] = corps.userData.parts.filter((p) => p.userData.partRef === '1');
const [brasObj] = corps.userData.parts.filter((p) => p.userData.partRef === '2');
const tube = boite(tubeObj), bras = boite(brasObj);
const tige = boite(P('2')), plaque = boite(P('3')), ressort = boite(P('4')), bague = boite(P('5'));
const tout = boite(model.root);

// Plan d'assemblage 15222420.
cote('Longueur hors tout', tout.x1 - tout.x0, 17.75);
cote('Plaque, diamètre', plaque.y1 - plaque.y0, 4);
releve('Plaque, écart de son centre à l\'axe du tube', (plaque.y0 + plaque.y1) / 2 - (tube.y0 + tube.y1) / 2, 0);
cote('Tige, sortie depuis le bout du tube', tige.x1 - tube.x1, 1.5);
cote('Du bas de la plaque à l\'axe du dessus de la poignée', bras.y1 - 3 / 16 - plaque.y0, f(6, 2), 1 / 16);
releve('Hauteur hors tout', tout.y1 - tout.y0, 6.296);
releve('Plaque, épaisseur', plaque.x1 - plaque.x0, 0.25);
releve('Plaque, appuyée au bout du tube', plaque.x0 - tube.x1, 0);
releve('Tige, longueur', tige.x1 - tige.x0, 6);
releve('Du bout ouvert du tube au bout de la tige', tige.x0 - tube.x0, 11.75);
releve('Collet de la tige, diamètre', tige.y1 - tige.y0, 1.5);
releve('Bague, diamètre du manchon', bague.y1 - bague.y0, 2.375);
releve('Bague, longueur avec le fond', bague.x1 - bague.x0, 2.625);
releve('Bague, du bout ouvert au fond', bague.x0 - tube.x0, 13.625);
releve('Bague, manchon appuyé sur la plaque', plaque.x0 - bague.x1, 0);
releve('Ressort, diamètre extérieur', ressort.y1 - ressort.y0, 1.459);
releve('Ressort, longueur montée', ressort.x1 - ressort.x0, 2.375);
releve('Ressort, appuyé sur le fond de la bague', ressort.x0 - tube.x0, 13.75);
releve('Ressort, appuyé sur le collet', tube.x1 - ressort.x1, 0.125);

// Plan du corps 15222405.
cote('Tube, longueur', tube.x1 - tube.x0, 16.25);
cote('Tube, diamètre (coté 2 11/16, arrondi au 1/16)', tube.y1 - tube.y0, f(2, 11), 1 / 16);
releve('Tube, diamètre sur le tracé', tube.y1 - tube.y0, 2.715);
cote('Poignée, du bout ouvert à la première jambe', bras.x0 - tube.x0, f(4, 15));
cote('Du dessous du tube au dessus de la poignée', bras.y1 - tube.y0, f(5, 10), 1 / 16);
releve('Poignée, hors tout des deux jambes', bras.x1 - bras.x0, 6.375);
releve('Poignée, diamètre du rond', bras.z1 - bras.z0, 0.375);
releve('Poignée, dans le plan de l\'axe', (bras.z0 + bras.z1) / 2, 0);

// Jeux : rien ne se traverse.
const jeu = (nom, v) => { n++; const ok = v >= -1e-6; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po`); };
jeu('Jeu radial, manchon de la bague dans le tube', (2.375 - (bague.y1 - bague.y0)) / 2);
jeu('Jeu radial, ressort dans le manchon', (2.067 - (ressort.y1 - ressort.y0)) / 2);
jeu('Jeu radial, ressort autour de la tige', (ressort.y1 - ressort.y0 - 2 * 0.113 - 1) / 2);
jeu('Portée du ressort sous le collet', (tige.y1 - tige.y0 - (ressort.y1 - ressort.y0)) / 2);

// Masses : les cartouches semblent ne compter ni la poignée ni le ressort (voir le README).
const lb = (o) => volume(o) * ACIER;
const mTube = lb(tubeObj), mBras = lb(brasObj), mRessort = lb(P('4'));
const mReste = lb(P('2')) + lb(P('3')) + lb(P('5'));
const masse = (nom, v, attendu, tol) => {
  n++;
  const ok = Math.abs(v - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(2)} lb (cartouche : ${String(attendu).replace('.', ',')} lb)`);
};
masse('Masse du tube seul', mTube, 6.3, 0.1);
masse('Masse sans la poignée ni le ressort', mTube + mReste, 9.4, 0.1);
console.log(`  Poignée : ${mBras.toFixed(2)} lb ; ressort : ${mRessort.toFixed(2)} lb ; tige, plaque et bague : ${mReste.toFixed(2)} lb`);
console.log(`  Corps complet : ${(mTube + mBras).toFixed(2)} lb ; core knocker complet : ${(mTube + mBras + mRessort + mReste).toFixed(2)} lb`);
console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);
