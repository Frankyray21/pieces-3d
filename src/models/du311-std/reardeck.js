// P416 — Pont arrière (« CLTR ASSY, REAR DECK ») : châssis du pont, capot du
// surpresseur (grille arrière, ventilateur du refroidisseur côté gauche),
// surpresseur Le Roi et son moteur électrique 75 HP entraîné par courroies,
// enrouleur de câble à l'avant du pont, filtre coalescent, poteaux porte-câble.
// Formes simplifiées d'après les vues des pages 416 et 420 ; repère machine
// (voir layout.js), le pont prolonge le capot moteur vers l'arrière.
import { M, body } from './layout.js';
import { workLight, tailLamp, chevrons } from './lights.js';

const X0 = M.rear, X1 = M.engine.x0; // -4.4 → -2.75
const HOOD = { x0: X0 + 0.02, x1: -3.6, top: 1.95 };
export const REEL = { x: -3.08, y: 1.32, r: 0.55, w: 0.46 };
const REEL_DRIVE = REEL.x - REEL.w / 2 - 0.14; // motoréducteur côté arrière
export const DRIVE = { x: -3.95, yMotor: 0.76, yComp: 1.36, z: -0.55 };

export function P416(api) {
  const { box, cyl, ring, tube, torus, plate, fitting, filterCanister, enclosure, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const FB = 0.48, FT = 1.0, FZ = 0.86;
  const hx = (HOOD.x0 + HOOD.x1) / 2, hl = HOOD.x1 - HOOD.x0;

  // Panneau latéral vertical (plan XY) percé d'un trou rond [x, y, r] en coordonnées machine.
  const sidePanel = (z, hole) => {
    const h = HOOD.top - FT;
    const pl = plate(hl, h, 0.02, 'lightGrey', { holes: hole ? [[hole[0] - hx, -(hole[1] - (FT + h / 2)), hole[2]]] : [] });
    return at(pl, [hx, FT + h / 2, z], [Math.PI / 2, 0, 0]);
  };
  const fan = { x: -3.98, y: 1.48, r: 0.3 };

  // 7 — pont arrière : châssis (flancs, traverses, pare-chocs, marchepied), capot du
  // surpresseur, refroidisseur et ventilateur, surpresseur, supports de l'enrouleur, poteaux porte-câble
  P('7', group(
    ...[1, -1].map((s) => at(plate(X1 - X0, FT - FB, 0.025, 'lightGrey', { holes: [[-0.45, 0, 0.11], [0.35, 0, 0.09]] }), [(X0 + X1) / 2, (FT + FB) / 2, s * FZ], [Math.PI / 2, 0, 0])),
    ...[X0 + 0.03, X1 - 0.03].map((x) => at(box(0.05, FT - FB, 2 * FZ, 'lightGrey'), [x, (FT + FB) / 2, 0])),
    at(box(X1 - X0 - 0.1, 0.02, 2 * FZ, 'grey'), [(X0 + X1) / 2, FB + 0.01, 0]),
    at(box(0.12, 0.12, 2 * FZ + 0.2, 'lightGrey', { r: 0.03 }), [X0 - 0.04, FT - 0.08, 0]),
    group(
      ...[-0.45, -0.8].map((z) => at(box(0.04, 0.55, 0.04, 'lightGrey'), [X0 - 0.08, 0.6, z])),
      ...[0.4, 0.62].map((y) => at(box(0.12, 0.03, 0.4, 'safety'), [X0 - 0.1, y, -0.625])),
    ),
    // zébras sur la face du pare-chocs, feux arrière (stop et recul) et projecteurs de travail arrière
    at(chevrons(api.S, 2 * FZ + 0.14, 0.06), [X0 - 0.1005, FT - 0.08, 0], [0, -Math.PI / 2, 0]),
    ...[1, -1].flatMap((s) => [
      at(tailLamp(api.S), [HOOD.x0 - 0.02, FT + 0.1, s * 0.8], [0, Math.PI, 0]),
      at(tailLamp(api.S, 'lamp'), [HOOD.x0 - 0.02, FT + 0.1, s * 0.62], [0, Math.PI, 0]),
      at(workLight(api.S), [HOOD.x0 - 0.04, HOOD.top - 0.08, s * 0.78], [0, Math.PI, 0]),
    ]),
  ), [0, -0.35, 0]);
  P('7', group(
    at(box(hl, 0.03, 1.92, 'lightGrey', { r: 0.012 }), [hx, HOOD.top - 0.015, 0]),
    sidePanel(-0.95, [fan.x, fan.y, fan.r + 0.02]),
    sidePanel(0.95),
    ...Array.from({ length: 6 }, (_, i) => at(box(0.42, 0.02, 0.012, 'darkSteel'), [hx, 1.25 + i * 0.09, 0.962])),
    at(box(0.02, HOOD.top - FT, 1.9, 'lightGrey'), [HOOD.x1, (HOOD.top + FT) / 2, 0]),
    // grille arrière (barreaux) et cadre
    at(box(0.02, 0.04, 1.9, 'lightGrey'), [HOOD.x0, FT + 0.02, 0]),
    ...Array.from({ length: 16 }, (_, i) => at(box(0.012, HOOD.top - FT - 0.06, 0.016, 'grey'), [HOOD.x0, (HOOD.top + FT) / 2, -0.88 + i * 0.1173])),
    ...Array.from({ length: 3 }, (_, i) => at(box(0.016, 0.02, 1.9, 'grey'), [HOOD.x0, 1.25 + i * 0.25, 0])),
  ), [0, 0.75, 0]);
  P('7', group(
    // refroidisseur du surpresseur et ventilateur derrière le panneau gauche
    at(box(0.66, 0.66, 0.08, 'darkSteel'), [fan.x, fan.y, -0.82]),
    at(ring(fan.r + 0.03, fan.r, 0.12, 'black', { axis: 'z', seg: 48 }), [fan.x, fan.y, -0.88]),
    at(cyl(0.07, 0.06, 'black', { axis: 'z' }), [fan.x, fan.y, -0.88]),
    ...Array.from({ length: 7 }, (_, i) => at(group(at(box(0.09, 0.2, 0.01, 'black'), [0, 0.16, 0], [0, 0.4, 0])), [fan.x, fan.y, -0.88], [0, 0, (i / 7) * Math.PI * 2])),
    ...[0.1, 0.18, 0.26].map((r) => at(torus(r, 0.004, 'steel', { axis: 'z' }), [fan.x, fan.y, -0.955])),
  ), [0, 0.2, -0.6]);
  P('7', group(
    // surpresseur Le Roi : carter, deux cylindres ailetés en V, culasses, volant-poulie
    at(box(0.42, 0.3, 0.6, 'charcoal', { r: 0.02 }), [DRIVE.x, FT + 0.2, -0.05]),
    ...[-1, 1].map((s) => group(
      at(cyl(0.11, 0.26, 'charcoal', { seg: 24 }), [0, 0.13, 0]),
      ...[0.06, 0.1, 0.14, 0.18, 0.22].map((y) => at(ring(0.14, 0.1, 0.012, 'charcoal', { seg: 24 }), [0, y, 0])),
      at(box(0.24, 0.06, 0.24, 'darkSteel', { r: 0.01 }), [0, 0.29, 0]),
    ).translateX(DRIVE.x).translateY(FT + 0.35).translateZ(s * 0.16 - 0.05).rotateX(s * 0.45)),
    body('flywheel', group(
      at(cyl(0.28, 0.07, 'darkSteel', { axis: 'z', seg: 48 }), [DRIVE.x, DRIVE.yComp, DRIVE.z]),
      ...Array.from({ length: 5 }, (_, i) => at(box(0.035, 0.42, 0.04, 'darkSteel'), [DRIVE.x, DRIVE.yComp, DRIVE.z + 0.03], [0, 0, (i / 5) * Math.PI])),
      at(cyl(0.06, 0.12, 'steel', { axis: 'z' }), [DRIVE.x, DRIVE.yComp, DRIVE.z + 0.08]),
    )),
    tube([[DRIVE.x + 0.1, FT + 0.62, 0.11], [DRIVE.x + 0.3, FT + 0.7, 0.2], [-3.66, FT + 0.6, 0.45]], 0.035, 'steel', { seg: 16 }),
    // paliers de l'arbre de l'enrouleur
    ...[REEL_DRIVE, REEL.x + REEL.w / 2 + 0.06].map((x) => group(
      at(box(0.06, REEL.y - FT - 0.15, 0.3, 'lightGrey'), [x, (REEL.y - 0.15 + FT) / 2, 0]),
      at(cyl(0.06, 0.08, 'darkSteel', { axis: 'x' }), [x, REEL.y, 0]),
    )),
    // poteaux porte-câble à crochets aux coins arrière
    ...[0.93, 0.72, -0.72, -0.93].map((z) => group(
      at(cyl(0.035, 1.4, 'grey'), [X0 - 0.06, 1.62, z]),
      ...(Math.abs(z) > 0.8 ? [1.62, 2.1] : [1.9]).map((y) => tube([[X0 - 0.06, y - 0.14, z], [X0 - 0.2, y - 0.08, z], [X0 - 0.22, y + 0.06, z]], 0.018, 'grey', { seg: 10 })),
    )),
  ), [0, 0.45, 0]);

  // 3 — moteur électrique 75 HP (365T), couché en travers sous le surpresseur
  P('3', group(
    at(cyl(0.24, 0.72, 'blue', { axis: 'z', seg: 40 }), [DRIVE.x, DRIVE.yMotor, -0.02]),
    ...[-0.28, -0.14, 0, 0.14, 0.26].map((z) => at(ring(0.255, 0.23, 0.014, 'blue', { axis: 'z', seg: 40 }), [DRIVE.x, DRIVE.yMotor, z])),
    at(cyl(0.2, 0.06, 'blue', { axis: 'z' }), [DRIVE.x, DRIVE.yMotor, 0.37]),
    at(box(0.5, 0.05, 0.6, 'blue'), [DRIVE.x, FB + 0.045, -0.02]),
    at(box(0.2, 0.18, 0.16, 'blue', { r: 0.015 }), [DRIVE.x + 0.12, DRIVE.yMotor + 0.26, 0.1]),
    at(cyl(0.03, 0.14, 'steel', { axis: 'z' }), [DRIVE.x, DRIVE.yMotor, -0.43]),
  ), [0, -0.3, 0.45]);
  // 6 — transmission : poulie 10,3 po du moteur, courroies trapézoïdales vers le volant du surpresseur
  const rS = 0.131, rL = 0.28;
  P('6', group(
    body('sheave', group(
      at(cyl(rS, 0.09, 'darkSteel', { axis: 'z', seg: 36 }), [DRIVE.x, DRIVE.yMotor, DRIVE.z]),
      ...Array.from({ length: 4 }, (_, i) => at(box(0.02, rS * 1.6, 0.095, 'steel'), [DRIVE.x, DRIVE.yMotor, DRIVE.z], [0, 0, (i / 4) * Math.PI])),
    )),
    ...[-0.025, 0, 0.025].map((dz) => at(torus(rS, 0.006, 'black', { axis: 'z' }), [DRIVE.x, DRIVE.yMotor, DRIVE.z + dz])),
    ...[-0.025, 0, 0.025].flatMap((dz) => [1, -1].map((s) => tube([[DRIVE.x + s * rS, DRIVE.yMotor, DRIVE.z + dz], [DRIVE.x + s * rL, DRIVE.yComp, DRIVE.z + dz]], 0.008, 'black', { sharp: true, seg: 2 }))),
  ), [0, 0, -0.55]);

  // 2 — enrouleur de câble type 20.1 K560 (axe longitudinal) et son motoréducteur
  P('2', group(
    body('reel', group(...[-1, 1].map((s) => group(
      at(ring(REEL.r, REEL.r - 0.04, 0.02, 'grey', { axis: 'x', seg: 64 }), [0, 0, 0]),
      ...Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return at(box(0.015, REEL.r - 0.2, 0.04, 'grey'), [0, Math.cos(a) * (REEL.r + 0.18) / 2, Math.sin(a) * (REEL.r + 0.18) / 2], [a, 0, 0]);
      }),
    ).translateX(REEL.x + s * REEL.w / 2)),
      at(cyl(0.2, REEL.w, 'grey', { axis: 'x', seg: 40 }), [REEL.x, 0, 0]),
      at(cyl(0.36, REEL.w - 0.06, 'black', { axis: 'x', seg: 48 }), [REEL.x, 0, 0]),
      at(cyl(0.035, REEL.w + 0.3, 'steel', { axis: 'x' }), [REEL.x, 0, 0]),
    )),
    at(box(0.18, 0.28, 0.28, 'charcoal', { r: 0.015 }), [REEL_DRIVE, 0, 0]),
    at(cyl(0.09, 0.22, 'blue', { axis: 'z' }), [REEL_DRIVE, 0.04, 0.24]),
    at(enclosure(0.16, 0.14, 0.1, 'grey'), [REEL_DRIVE, 0.22, 0]),
  ).translateY(REEL.y), [0, 0.6, 0]);

  // 4 — support du filtre coalescent (potence sur le flanc droit) ; 1 — filtre coalescent
  P('4', group(
    at(box(0.05, 0.95, 0.05, 'grey'), [REEL.x, FT + 0.475, 0.74]),
    at(box(0.2, 0.02, 0.16, 'grey'), [REEL.x, FT + 0.96, 0.7]),
  ), [0, 0.3, 0.45]);
  P('1', group(
    at(filterCanister(0.07, 0.32, 'grey'), [REEL.x, FT + 0.95, 0.66]),
    at(fitting(0.03, 0.05, 'steel', { axis: 'x' }), [REEL.x + 0.12, FT + 0.92, 0.66]),
  ), [0, 0.55, 0.55]);
  // 5 — support du transformateur (équerre sur le flanc droit, à l'avant)
  P('5', group(
    at(box(0.4, 0.4, 0.02, 'grey'), [X1 - 0.3, (FT + FB) / 2, FZ + 0.025]),
    at(box(0.4, 0.02, 0.14, 'grey'), [X1 - 0.3, FT - 0.01, FZ + 0.09]),
  ), [0, 0, 0.45]);
  return { view: { dir: [-1.1, 0.7, 1.0] } };
}
