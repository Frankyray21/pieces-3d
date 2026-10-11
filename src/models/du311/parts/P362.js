// P362 — Vanne de translation droite CX030863 rév. 0 (page 362), repère 30 du
// porteur P328. Bloc d'équilibrage double à rapport de pilotage 10:1 (1,
// CP000305) : corps d'aluminium 5 × 2 1/2 × 1 3/4 po, deux cartouches
// réglables sur le dessus (six-pans, vis de réglage, contre-écrou), deux
// boutonnières de fixation ouvertes aux bouts de la face arrière, orifices
// SAE -12 : V1 (bout +X) et V2 (bout −X), C1 / C2 dessous. Dessous :
// adaptateurs droits -12 (6) vers les moteurs de translation. V1 : coude 90°
// -12 (5) vers le haut, té tournant -12 (4) et réduction tournante -12 / -06
// (3) sur la branche (pilotage). V2 : coude 90° -12 (5) vers l'avant, coude
// tournant -12 (2) vers le haut, puis le même té (4) et la même réduction (3).
// Repère : origine au centre de la face arrière du corps (face d'appui contre
// la traverse du porteur, boutonnières), Y vers le haut, X le long du corps
// (+X côté V1), +Z vers l'avant (face opposée à l'appui). Encombrement ≈ 0.31
// (X) × 0.17 (Y) × 0.10 (Z) m.
// tramValve() sert aussi à la vanne gauche P364 (sans le coude tournant 2).
import { RAC_IN as IN, racFactory, racBlock, racPose, racPort, racOut } from './_porteur.js';

const L = 5 * IN, H = 2.5 * IN, W = 1.75 * IN;

/**
 * Construit le bloc et ses raccords. refs : repères de la liste ({ valve,
 * swivelElbow?, reducer, tee, elbow, straight }). Le bloc est commun ; seul
 * le circuit du bout −X change (coude tournant de la vanne droite).
 */
export function tramValve(api, refs) {
  const { S, THREE } = api;
  const { lathe, merged, group, at, box } = S;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const r12 = (1.0625 * IN) / 2, sp12 = 0.92 * IN;
  const XC = 1.2 * IN; // orifices du dessous et cartouches à ±1,2 po du milieu

  // 1 — corps, boutonnières, cartouches.
  const body = racBlock(S, THREE, L, H, W, [
    { p: [L / 2, 0, 0], n: '+x', r: r12, spot: sp12 }, { p: [-L / 2, 0, 0], n: '-x', r: r12, spot: sp12 },
    { p: [XC, -H / 2, 0], n: '-y', r: r12, spot: sp12 }, { p: [-XC, -H / 2, 0], n: '-y', r: r12, spot: sp12 },
  ], { material: 'castAlu' });
  // Boutonnières : entailles sombres sur la face avant et les bouts, en bas.
  const slots = [];
  for (const s of [-1, 1]) {
    slots.push(box(0.6 * IN, 0.4 * IN, 0.0006, 'blackOxide', { pos: [s * (L / 2 - 0.3 * IN), -H / 2 + 0.45 * IN, W / 2 + 0.0003] }));
    slots.push(box(0.0006, 0.4 * IN, W * 0.98, 'blackOxide', { pos: [s * (L / 2 + 0.0003), -H / 2 + 0.45 * IN, 0] }));
  }
  const cart = [];
  for (const s of [-1, 1]) {
    const x = s * XC;
    cart.push(lathe([[0, 0], [0.72 * IN, 0], [0.72 * IN, 0.85 * IN], [0.62 * IN, 0.95 * IN], [0.42 * IN, 0.95 * IN], [0.42 * IN, 1.3 * IN], [0, 1.3 * IN]], 'zinc', { seg: 6, pos: [x, H / 2, 0] }));
    cart.push(lathe([[0, 1.3 * IN], [0.25 * IN, 1.3 * IN], [0.25 * IN, 1.42 * IN], [0, 1.42 * IN]], 'zinc', { seg: 6, pos: [x, H / 2, 0] }));
    cart.push(lathe([[0, 1.42 * IN], [0.11 * IN, 1.42 * IN], [0.11 * IN, 1.62 * IN], [0, 1.62 * IN]], 'zinc', { seg: 8, pos: [x, H / 2, 0] }));
  }
  const valve = group(body, merged(slots, 'blackOxide'), merged(cart, 'zinc'));
  P(refs.valve, at(valve, [0, 0, W / 2]), [0, 0, 0]);

  const Z0 = W / 2, Y0 = H / 2; // axe des orifices des bouts
  // 6 — adaptateurs droits -12 sous le corps.
  for (const s of [-1, 1]) P(refs.straight, racPose(THREE, F.straight({ pd: 12, jd: 12 }), [s * XC, 0, Z0], [0, -1, 0]), [0, -0.06, 0]);

  // Bout +X (V1) : coude vers le haut, té, réduction.
  const branch = (q, s, k) => {
    const t = racPose(THREE, F.swivel({ kind: 'tee', fd: 12 }), q.p, q.d, [s, 0, 0]);
    P(refs.tee, t, add(k, [0, 0.05, 0]));
    const b = racPort(THREE, t, 1);
    P(refs.reducer, racPose(THREE, F.swivel({ kind: 'reducer', fd: 12, jd: 6 }), b.p, b.d), add(k, add([0, 0.05, 0], racOut(b.d, 0.05))));
  };
  const eR = racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [L / 2, Y0, Z0], [1, 0, 0], [0, 1, 0]);
  P(refs.elbow, eR, [0.05, 0, 0]);
  branch(racPort(THREE, eR), 1, [0.05, 0.03, 0]);

  // Bout −X (V2).
  if (refs.swivelElbow) {
    const eL = racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [-L / 2, Y0, Z0], [-1, 0, 0], [0, 0, 1]);
    P(refs.elbow, eL, [-0.05, 0, 0]);
    const q = racPort(THREE, eL);
    const sw = racPose(THREE, F.swivel({ kind: 'elbow', fd: 12 }), q.p, q.d, [0, 1, 0]);
    P(refs.swivelElbow, sw, [-0.05, 0, 0.05]);
    branch(racPort(THREE, sw), -1, [-0.05, 0.03, 0.05]);
  } else {
    const eL = racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [-L / 2, Y0, Z0], [-1, 0, 0], [0, 1, 0]);
    P(refs.elbow, eL, [-0.05, 0, 0]);
    branch(racPort(THREE, eL), -1, [-0.05, 0.03, 0]);
  }
}

export default function P362(api) {
  tramValve(api, { valve: '1', swivelElbow: '2', reducer: '3', tee: '4', elbow: '5', straight: '6' });
  return { view: { dir: [0.9, 0.7, 1.1] } };
}
