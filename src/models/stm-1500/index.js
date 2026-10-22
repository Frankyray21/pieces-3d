import { P010, SLED_VIA, HEAD_PORTS, SWIVEL_PORT } from './drill.js';
import { P048 } from './head.js';
import { P042, P039, P040, P041 } from './winch.js';
import { P068, PP_PORTS, PP_CABLE, PP_N } from './powerpack.js';
import { P078, CON_PACK, CON_ROT, CON_WATER, CON_SLED, CON_CABLE, CON_BACK_N, CON_SIDE_N } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010), sa tête
// Boyles (P048) et son treuil de câble 10 000 pi (P042, étapes P039 à P041),
// le groupe hydraulique 125 HP (P068) et la console (P078) ; les autres
// assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble prêt à forer, disposé comme sur le plan de l'atelier (vue de
// dessus : X vers la droite du plan, Z vers le bas) : foreuse à gauche, inclinée,
// l'avance pointée vers le bas à gauche (trou). Console STM à droite de la
// foreuse, à plus de 3 m, commandes tournées vers la droite : l'opérateur se tient
// entre la console et le groupe et regarde la foreuse par-dessus la console.
// Groupe hydraulique en haut à droite, en long, à plus de 3 m de la foreuse,
// raccords au bout tourné vers la console, interrupteur principal (porte de la
// boîte électrique) accessible du côté bas du plan, vers la gauche. Boyaux posés
// au sol, chacun dans sa voie, et branchés : groupe → console (pression, retour,
// drain) et câble de commande ; console → foreuse (rotation A et B vers le moteur
// de la tête, boyaux des sélecteurs du traîneau, eau vers l'émerillon par-dessus le
// moteur). Seul le matériel du manuel est modélisé.
// Contrôles : node scripts/check-layout.mjs --eq stm-1500 P002 --min 3 --ref 1.
const DRILL = { pos: [-3.0, 0, 0.6], yaw: -1.84 }; // avance vers (−0,27 ; 0,96) dans le plan
const CONSOLE = { pos: [1.75, 0, -0.9], yaw: Math.PI / 2 }; // commandes vers +X (opérateur à droite)
const PACK = { pos: [4.85, 0, -1.1], yaw: 0 }; // bout des raccords (−X) vers la console
const FLOOR = 0.025; // boyaux posés au sol (garde sous la courbe)

function P002(api) {
  const { at, tube, group } = api.S;
  const V = (a) => new api.THREE.Vector3(...a);
  const drill = at(api.sub('P010'), DRILL.pos, [0, DRILL.yaw, 0]);
  const cons = at(api.sub('P078'), CONSOLE.pos, [0, CONSOLE.yaw, 0]);
  const pack = at(api.sub('P068'), PACK.pos, [0, PACK.yaw, 0]);
  [drill, cons, pack].forEach((o) => o.updateMatrixWorld(true));
  const W = (obj, p) => obj.localToWorld(V(p));
  const D = (obj, d) => V(d).transformDirection(obj.matrixWorld);

  // Côté d'un boyau : sortie dans l'axe du raccord, point haut puis descente quasi verticale
  // jusqu'au sol (ou tracé imposé « via », du sol jusqu'au raccord, pour contourner une pièce).
  const end = (p, n, r, out, shift) => {
    const floor = FLOOR + r;
    const g = p.clone().addScaledVector(n, out).add(shift || V([0, 0, 0])).setY(floor);
    const pts = [p, p.clone().addScaledVector(n, Math.min(0.18, out * 0.45))];
    if (pts[1].y > floor + 0.3) pts.push(g.clone().setY(floor + 0.2));
    pts.push(g);
    return pts;
  };
  // Boyau entre deux raccords : les deux côtés, deux points au sol à 0,3 m des descentes
  // (le parcours reste posé au sol, sans plonger dessous), câble ou boyau.
  const run = (A, B, r, mat = 'hose') => {
    const a = A.via ? A.via.slice().reverse() : end(A.p, A.n, r, A.out ?? 0.4, A.shift);
    const b = B.via ? B.via : end(B.p, B.n, r, B.out ?? 0.4, B.shift).reverse();
    const ga = a[a.length - 1], gb = b[0];
    const u = gb.clone().sub(ga).setY(0);
    const len = u.length();
    u.normalize().multiplyScalar(Math.min(0.3, len * 0.3));
    const pts = [...a, ga.clone().add(u), gb.clone().sub(u), ...b];
    let L = 0;
    for (let k = 1; k < pts.length; k++) L += pts[k].distanceTo(pts[k - 1]);
    const seg = Math.ceil(L / 0.025); // un segment tous les 2,5 cm : coudes lisses
    const arr = pts.map((q) => q.toArray());
    return mat === 'hose' ? tube(arr, r, 'hose', { seg }) : tube(arr, r, 'black', { seg, ends: 'gland', endMaterial: 'black', radial: 8, tension: 0.4 });
  };
  const hoses = [];
  const cBack = D(cons, CON_BACK_N), cSide = D(cons, CON_SIDE_N), pEnd = D(pack, PP_N), dSide = D(drill, [0, 0, -1]);
  const along = D(drill, [1, 0, 0]);
  // Groupe → console : pression (1 po), retour, drain, chacun sur son raccord, et câble de commande.
  // Le boyau du raccord le plus à l'arrière de la console s'écarte le plus du flanc : les voies
  // restent parallèles et ne se croisent pas (câble à l'extérieur du faisceau).
  PP_PORTS.forEach((p, i) => hoses.push(run({ p: W(cons, CON_PACK[2 - i]), n: cSide, out: 0.3 + i * 0.07 }, { p: W(pack, p), n: pEnd }, i === 0 ? 0.022 : 0.017)));
  hoses.push(run({ p: W(cons, CON_CABLE), n: cSide, out: 0.55 }, { p: W(pack, PP_CABLE), n: pEnd, shift: D(pack, [0, 0, -1]).multiplyScalar(0.1) }, 0.012, 'cable'));
  // Console → tête : rotation A et B (1 po), descentes écartées le long de l'avance.
  HEAD_PORTS.forEach((p, i) => hoses.push(run({ p: W(cons, CON_ROT[i]), n: cBack }, { p: W(drill, p), n: dSide, shift: along.clone().multiplyScalar(i ? 0.06 : -0.06) }, 0.022)));
  // Console → raccords avant des deux sélecteurs mât / treuil du traîneau (tracés imposés : par-dessus le longeron
  // gauche, devant les poteaux avant).
  SLED_VIA.forEach((via, i) => hoses.push(run({ p: W(cons, CON_SLED[i]), n: cBack }, { via: via.map((q) => W(drill, q)) }, 0.016)));
  // Eau : traversée de la console → entrée sur le dessus de l'émerillon, par-dessus le moteur de la tête.
  const [sx, sy, sz] = SWIVEL_PORT, wr = 0.02;
  const swivel = [[sx, FLOOR + wr, -0.94], [sx, 0.2, -0.92], [sx, 0.9, -0.86], [sx, 1.45, -0.62], [sx, sy + 0.16, -0.3], [sx, sy + 0.12, sz], [sx, sy + 0.04, sz], [sx, sy, sz]];
  hoses.push(run({ p: W(cons, CON_WATER), n: cBack }, { via: swivel.map((q) => W(drill, q)) }, wr));

  api.part('1', drill, [-1.2, 0, 0]);
  api.part('3', cons, [0, 0.6, 0]);
  api.part('2', pack, [1.2, 0, -0.6]);
  api.add(group(hoses));
  return { view: { dir: [0.2, 1.1, 1.0] } };
}

export default { P002, P010, P039, P040, P041, P042, P048, P068, P078 };
