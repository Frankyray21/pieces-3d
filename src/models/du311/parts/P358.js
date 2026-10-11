// P358 — Ensemble de clapets navettes de translation CX030852 rév. 0 (page
// 358), repère 28 du porteur P328. Trois clapets navettes 1/4 NPT (1,
// CP17024 : deux entrées aux bouts, sortie au milieu d'un flanc) en ligne :
// la sortie du clapet gauche (V1) et celle du clapet droit (V3) alimentent les
// deux entrées du clapet central (V2) par des mamelons six-pans 1/4 NPT (4) ;
// la sortie de V2 (dessus) porte un coude 1/4 NPT / JIC -06 (3) et un té
// tournant -06 (2). Les entrées de V1 et de V3 (dessus et dessous) reçoivent
// chacune un coude 1/4 NPT / JIC -06 (3), sorties vers l'avant.
// Repère : origine au centre de la face inférieure du clapet central V2, Y vers
// le haut, X le long de la rangée (V1 vers −X, V3 vers +X), +Z vers l'avant
// (sorties des coudes). Encombrement ≈ 0.11 (X) × 0.09 (Y) × 0.07 (Z) m.
// Corps 1 1/2 × 1 × 1 po (estimé d'après la vue isométrique).
import { RAC_IN as IN, racFactory, racBlock, racPose, racPort, racOut } from './_porteur.js';

const L = 1.5 * IN, C = 1.0 * IN; // corps des clapets
const GAP = 0.45 * IN; // jour entre deux corps reliés par un mamelon
const XS = L / 2 + GAP + C / 2; // entraxe V2 – V1 / V3

export default function P358(api) {
  const { S, THREE } = api;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (0.54 * IN) / 2; // taraudage 1/4 NPT

  // 1 — clapets : V2 couché selon X, V1 et V3 debout selon Y.
  const v2 = racBlock(S, THREE, L, C, C, [
    { p: [-L / 2, 0, 0], n: '-x', r: rn }, { p: [L / 2, 0, 0], n: '+x', r: rn }, { p: [0, C / 2, 0], n: '+y', r: rn },
  ], { material: 'castAlu' });
  P('1', S.at(v2, [0, C / 2, 0]), [0, 0, 0]);
  const yc = C / 2; // axe commun des mamelons
  const side = (s) => racBlock(S, THREE, C, L, C, [
    { p: [-s * C / 2, 0, 0], n: s > 0 ? '-x' : '+x', r: rn }, { p: [0, L / 2, 0], n: '+y', r: rn }, { p: [0, -L / 2, 0], n: '-y', r: rn },
  ], { material: 'castAlu' });
  for (const s of [-1, 1]) {
    const xc = s * XS;
    P('1', S.at(side(s), [xc, yc, 0]), [s * 0.06, 0, 0]);
    // 4 — mamelon : queue dans l'entrée de V2, mâle dans la sortie du clapet latéral.
    P('4', racPose(THREE, F.hexNipple(4), [s * L / 2, yc, 0], [s, 0, 0]), [s * 0.03, 0, 0]);
    // 3 — coudes des entrées haute et basse, sorties vers l'avant.
    for (const t of [-1, 1]) {
      P('3', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), [xc, yc + t * L / 2, 0], [0, t, 0], [0, 0, 1]), [s * 0.06, t * 0.04, 0]);
    }
  }
  // 3 — coude de sortie de V2 (vers l'avant) et 2 — té tournant -06 (branche vers le haut).
  const e = racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), [0, C, 0], [0, 1, 0], [0, 0, 1]);
  P('3', e, [0, 0.04, 0]);
  const q = racPort(THREE, e);
  P('2', racPose(THREE, F.swivel({ kind: 'tee', fd: 6 }), q.p, q.d, [0, 1, 0]), add(racOut(q.d, 0.04), [0, 0.04, 0]));

  return { view: { dir: [0.8, 0.9, 1.2] } };
}

function add(a, b) { return a.map((v, i) => v + b[i]); }
