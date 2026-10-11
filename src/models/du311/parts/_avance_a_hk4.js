// Fonctions communes aux trousses de boyaux longs P088 et P090 de l'avance
// V30 (repère de P032 : axe du mât selon +Y, pied à y = 0, face avant vers
// +Z). Fichier préfixé « _ » : pas un assemblage, non inscrit dans
// parts/index.js.
//
// slackHose() : flexible serti (hose() de _avance_a.js) dont le mou est logé
// à un endroit choisi — seuls certains points de passage (move) se déplacent,
// selon dir (pondérés par w), pour que la longueur libre égale celle du
// catalogue ; hose() reçoit ensuite le tracé définitif sans flèche propre.
// Utile pour les grands boyaux où la flèche répartie de hose() traverserait
// les pièces voisines.
import * as THREE from 'three';
import { IN, size } from './_avance_a.js';
import { addHose } from './_avance_a_hk2.js';

const v3 = (a) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(...a));

// Cotes d'embout serti de _avance_a.js (endLen, crimpEnd) : sortie de la
// douille et longueur d'embout comptée dans la longueur hors tout.
function endExit(n, e) {
  const s = size(n), d = s.hose;
  const E = { st: 0.03 + d * 1.4, drop: 0.018 + d * 1.0, le: 0.022 + d * 1.25 };
  const p = v3(e.p), dd = v3(e.d).normalize();
  const kind = e.end || 'st';
  if (kind === 'st') return { exit: p.addScaledVector(dd, E.st), dir: dd, len: E.st };
  const t = v3(e.t || [0, 0, 1]);
  t.addScaledVector(dd, -t.dot(dd)).normalize();
  const a = kind === '45' ? Math.PI / 4 : Math.PI / 2;
  const dir = dd.clone().multiplyScalar(Math.cos(a)).addScaledVector(t, Math.sin(a)).normalize();
  const nutH = s.nut * 0.72, rb = E.drop - nutH;
  const c = p.clone().addScaledVector(dd, nutH + rb * Math.sin(a)).addScaledVector(t, rb - rb * Math.cos(a));
  return { exit: c.addScaledVector(dir, E.le - rb * 0.2), dir, len: E.drop + E.le * 0.8 };
}

// Longueur de la courbe d'Hermite de hose() (mêmes tangentes, même poids).
function hermiteLen(pts, T) {
  let L = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const h = pts[i].distanceTo(pts[i + 1]) * 0.39;
    const c = new THREE.CubicBezierCurve3(pts[i], pts[i].clone().addScaledVector(T[i], h),
      pts[i + 1].clone().addScaledVector(T[i + 1], -h), pts[i + 1]);
    L += c.getLength();
  }
  return L;
}

/**
 * Flexible L (po), taille n, entre les sièges a et b ({ p, d, end, t }) par
 * les points vias ; move : indices des points qui reçoivent le mou, dir :
 * direction (ou une par indice), w : poids. tans : tangentes imposées.
 * Retourne { obj, len0, free, k } (len0 : tracé tendu).
 */
export function slackHose(api, ref, L, n, a, b, { vias = [], move = [], dir = [0, -1, 0], w = null, tans = null } = {}, explode = [0, 0, 0]) {
  const A = endExit(n, a), B = endExit(n, b);
  const free = L * IN - A.len - B.len;
  const base = vias.map(v3);
  const dirs = move.map((_, j) => v3(Array.isArray(dir[0]) ? dir[j] : dir).normalize());
  const make = (k) => base.map((p, i) => {
    const j = move.indexOf(i);
    return j < 0 ? p : p.clone().addScaledVector(dirs[j], k * (w ? w[j] : 1));
  });
  const len = (vs) => {
    const pts = [A.exit, ...vs, B.exit];
    const T = pts.map((p, i) => {
      if (i === 0) return A.dir.clone();
      if (i === pts.length - 1) return B.dir.clone().negate();
      if (tans && tans[i - 1]) return v3(tans[i - 1]).normalize();
      return pts[i + 1].clone().sub(pts[i - 1]).normalize();
    });
    return hermiteLen(pts, T);
  };
  const len0 = len(base);
  let k = 0;
  if (move.length && len0 < free) {
    let lo = 0, hi = 1.5;
    for (let it = 0; it < 32; it++) {
      k = (lo + hi) / 2;
      if (len(make(k)) < free) lo = k; else hi = k;
    }
  }
  const vs = make(k);
  const obj = addHose(api, ref, L, n, a, b, { vias: vs, sag: [0, 0, 0], tans }, explode);
  obj.userData.slack = { len0, free, k };
  if (typeof process !== 'undefined' && process.env?.HK4_DEBUG) {
    console.log(`${ref} ${L} po : libre ${free.toFixed(3)} m, tendu ${len0.toFixed(3)} m, mou ${k.toFixed(3)} m`);
  }
  return obj;
}
