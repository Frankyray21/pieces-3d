import { P010 } from './drill.js';
import { P048 } from './head.js';
import { P068, PP_PORTS, PP_CABLE } from './powerpack.js';
import { P078, CON_PACK, CON_DRILL, CON_WATER, CON_CABLE } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010) et sa tête
// Boyles (P048), le groupe hydraulique 125 HP (P068) et la console (P078) ;
// les autres assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble prêt à forer, disposé comme sur le plan de l'atelier (vue de
// dessus : X vers la droite du plan, Z vers le bas) : foreuse à gauche, inclinée,
// l'avance pointée vers le bas à gauche (trou) ; console STM à la droite de la
// foreuse, commandes tournées vers elle (l'opérateur voit la tête et le pied) ;
// groupe hydraulique en haut à droite, en long, interrupteur principal (porte de
// la boîte électrique) accessible sur le côté bas du plan. Boyaux branchés :
// groupe → console (pression, retour, drain), console → foreuse (rotation A et B
// vers le moteur de la tête, avance et vérins vers le bloc du traîneau), eau
// (bloc 3 voies de la console → émerillon), câble de commande groupe → console.
// Seul le matériel du manuel est modélisé (pas de grillages ni d'accessoires de chantier).
const DRILL = { pos: [-3.0, 0, 0.6], yaw: -1.84 }; // avance vers (−0,27 ; 0,96) dans le plan
const CONSOLE = { pos: [-1.05, 0, -1.25], yaw: -0.84 }; // face des commandes vers la foreuse
const PACK = { pos: [1.75, 0, -1.9], yaw: 0 };
// Orifices de la foreuse (repère de la foreuse) : bloc du traîneau côté console, moteur de la tête, émerillon.
const RAIL_Z = 0.864 / 2 - 0.051;
const DRILL_PORTS = [-0.4, -0.55, -0.75, -0.9].map((x) => [x, 0.2, -RAIL_Z - 0.15]);
const HEAD_PORTS = [[-1.33, 1.355, -0.67], [-1.33, 1.115, -0.67]];
const SWIVEL_PORT = [-1.04, 1.385, 0.09];

function P002(api) {
  const { at, hose, cable, group } = api.S;
  const V = (a) => new api.THREE.Vector3(...a);
  const drill = at(api.sub('P010'), DRILL.pos, [0, DRILL.yaw, 0]);
  const cons = at(api.sub('P078'), CONSOLE.pos, [0, CONSOLE.yaw, 0]);
  const pack = at(api.sub('P068'), PACK.pos, [0, PACK.yaw, 0]);
  [drill, cons, pack].forEach((o) => o.updateMatrixWorld(true));
  const W = (obj, p) => obj.localToWorld(V(p));
  const D = (obj, d) => V(d).transformDirection(obj.matrixWorld);

  // Boyau posé au sol entre deux orifices : sortie dans l'axe de l'orifice, descente, parcours au sol
  // (décalé de k fois l'écart dans le faisceau), remontée vers l'orifice d'arrivée.
  const run = (a, na, b, nb, r, k, mat = 'hose') => {
    const floor = 0.025 + r;
    const side = V([b.z - a.z, 0, a.x - b.x]).normalize().multiplyScalar(k * 0.05);
    const a1 = a.clone().addScaledVector(na, 0.18);
    const b1 = b.clone().addScaledVector(nb, 0.18);
    const a2 = a.clone().addScaledVector(na, 0.4).add(side).setY(floor);
    const b2 = b.clone().addScaledVector(nb, 0.4).add(side).setY(floor);
    const pts = [a, a1, a2, a2.clone().lerp(b2, 0.5), b2, b1, b];
    return mat === 'hose' ? hose(pts.map((p) => p.toArray()), r) : cable(pts.map((p) => p.toArray()), r);
  };
  const hoses = [];
  // Groupe → console : pression (1 po), retour, drain.
  PP_PORTS.forEach((p, i) => hoses.push(run(W(pack, p), D(pack, [0, 0, 1]), W(cons, CON_PACK[i]), D(cons, [0, 0, -1]), i === 0 ? 0.022 : 0.017, i - 1)));
  // Console → tête : rotation A et B (1 po) ; console → bloc du traîneau : avance et vérins.
  HEAD_PORTS.forEach((p, i) => hoses.push(run(W(cons, CON_DRILL[i]), D(cons, [-1, 0, 0]), W(drill, p), D(drill, [0, 0, -1]), 0.022, i - 2)));
  DRILL_PORTS.forEach((p, i) => hoses.push(run(W(cons, CON_DRILL[2 + i]), D(cons, [-1, 0, 0]), W(drill, p), D(drill, [0, 0, -1]), 0.016, i)));
  // Eau : bloc 3 voies de la console → émerillon d'eau.
  hoses.push(run(W(cons, CON_WATER), D(cons, [1, 0, 0]), W(drill, SWIVEL_PORT), D(drill, [0, 0, 1]), 0.02, 5));
  // Câble de commande : boîte électrique du groupe → contrôleur de sécurité de la console.
  hoses.push(run(W(pack, PP_CABLE), D(pack, [0, -1, 0.3]), W(cons, CON_CABLE), D(cons, [0, 1, 0]), 0.012, -3, 'cable'));

  api.part('1', drill, [-1.2, 0, 0]);
  api.part('3', cons, [0, 0, -0.8]);
  api.part('2', pack, [1.2, 0, -0.6]);
  api.add(group(hoses));
  return { view: { dir: [0.35, 1.1, 1.0] } };
}

export default { P002, P010, P048, P068, P078 };
