import { P010 } from './drill.js';
import { P048 } from './head.js';
import { P068, PP_PORTS, PP_CABLE, PP_N } from './powerpack.js';
import { P078, CON_PACK, CON_DRILL, CON_WATER, CON_CABLE, CON_BACK_N, CON_SIDE_N } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010) et sa tête
// Boyles (P048), le groupe hydraulique 125 HP (P068) et la console (P078) ;
// les autres assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble prêt à forer, disposé comme sur le plan de l'atelier (vue de
// dessus : X vers la droite du plan, Z vers le bas) : foreuse à gauche, inclinée,
// l'avance pointée vers le bas à gauche (trou). Console STM à droite de la
// foreuse, à plus de 3 m, commandes tournées vers la droite : l'opérateur se tient
// entre la console et le groupe et regarde la foreuse par-dessus la console.
// Groupe hydraulique en haut à droite, en long, à plus de 3 m de la foreuse,
// interrupteur principal (porte de la boîte électrique) accessible du côté bas du
// plan, vers la gauche. Boyaux posés au sol et branchés : groupe → console
// (pression, retour, drain) et câble de commande, console → foreuse (rotation A et
// B vers le moteur de la tête, avance et vérins vers le bloc du traîneau, eau vers
// l'émerillon). Seul le matériel du manuel est modélisé.
// Distances contrôlées par node scripts/check-layout.mjs --eq stm-1500 P002 --min 3 --ref 1.
const DRILL = { pos: [-3.0, 0, 0.6], yaw: -1.84 }; // avance vers (−0,27 ; 0,96) dans le plan
const CONSOLE = { pos: [1.65, 0, -0.9], yaw: Math.PI / 2 }; // commandes vers +X (opérateur à droite)
const PACK = { pos: [4.75, 0, -1.1], yaw: 0 }; // bout des raccords (−X) vers la console
// Orifices de la foreuse (repère de la foreuse, normale −Z : côté console) : bloc du
// traîneau, moteur de la tête (rotation A et B), entrée d'eau de l'émerillon.
const RAIL_Z = 0.864 / 2 - 0.051;
const DRILL_PORTS = [-0.4, -0.55, -0.75, -0.9].map((x) => [x, 0.2, -RAIL_Z - 0.15]);
const HEAD_PORTS = [[-1.33, 1.355, -0.67], [-1.33, 1.115, -0.67]];
const SWIVEL_PORT = [-1.04, 1.235, -0.125];
const DRILL_N = [0, 0, -1];

function P002(api) {
  const { at, hose, cable, group } = api.S;
  const V = (a) => new api.THREE.Vector3(...a);
  const drill = at(api.sub('P010'), DRILL.pos, [0, DRILL.yaw, 0]);
  const cons = at(api.sub('P078'), CONSOLE.pos, [0, CONSOLE.yaw, 0]);
  const pack = at(api.sub('P068'), PACK.pos, [0, PACK.yaw, 0]);
  [drill, cons, pack].forEach((o) => o.updateMatrixWorld(true));
  const W = (obj, p) => obj.localToWorld(V(p));
  const D = (obj, d) => V(d).transformDirection(obj.matrixWorld);

  // Boyau posé au sol entre deux orifices : sortie dans l'axe de l'orifice (outA, outB),
  // descente au sol, parcours au sol (décalé de k fois l'écart dans le faisceau),
  // remontée vers l'orifice d'arrivée.
  const run = (a, na, b, nb, r, k, { outA = 0.4, outB = 0.4, mat = 'hose' } = {}) => {
    const floor = 0.025 + r;
    const side = V([b.z - a.z, 0, a.x - b.x]).normalize().multiplyScalar(k * 0.05);
    const a1 = a.clone().addScaledVector(na, Math.min(0.18, outA * 0.45));
    const b1 = b.clone().addScaledVector(nb, Math.min(0.18, outB * 0.45));
    const a2 = a.clone().addScaledVector(na, outA).add(side).setY(floor);
    const b2 = b.clone().addScaledVector(nb, outB).add(side).setY(floor);
    const pts = [a, a1, a2, a2.clone().lerp(b2, 0.5), b2, b1, b].map((p) => p.toArray());
    return mat === 'hose' ? hose(pts, r) : cable(pts, r);
  };
  const hoses = [];
  const cBack = D(cons, CON_BACK_N), cSide = D(cons, CON_SIDE_N), pEnd = D(pack, PP_N), dSide = D(drill, DRILL_N);
  // Groupe → console : pression (1 po), retour, drain ; câble de commande à côté.
  PP_PORTS.forEach((p, i) => hoses.push(run(W(cons, CON_PACK[i]), cSide, W(pack, p), pEnd, i === 0 ? 0.022 : 0.017, 1 - i)));
  hoses.push(run(W(cons, CON_CABLE), cSide, W(pack, PP_CABLE), pEnd, 0.012, 2, { mat: 'cable' }));
  // Console → tête : rotation A et B (1 po) ; console → bloc du traîneau : avance et vérins ; eau → émerillon.
  HEAD_PORTS.forEach((p, i) => hoses.push(run(W(cons, CON_DRILL[i]), cBack, W(drill, p), dSide, 0.022, i - 3)));
  DRILL_PORTS.forEach((p, i) => hoses.push(run(W(cons, CON_DRILL[2 + i]), cBack, W(drill, p), dSide, 0.016, i - 1)));
  hoses.push(run(W(cons, CON_WATER), cBack, W(drill, SWIVEL_PORT), dSide, 0.02, 3, { outB: 0.8 }));

  api.part('1', drill, [-1.2, 0, 0]);
  api.part('3', cons, [0, 0.6, 0]);
  api.part('2', pack, [1.2, 0, -0.6]);
  api.add(group(hoses));
  return { view: { dir: [0.2, 1.1, 1.0] } };
}

export default { P002, P010, P048, P068, P078 };
