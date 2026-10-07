import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';

// Chenille (F05), maillons (F06) et moteur hydraulique OMS 100 (F07).
// Repère de la chenille : X vers l'avant, Y vers le haut, +Z vers l'extérieur.

export const TRACK = {
  wheelY: 0.31, // hauteur des centres barbotin / roue folle
  pathR: 0.255, // rayon du trajet des axes de maillons autour des roues
  half: 1.05, // demi-entraxe barbotin ↔ roue folle
  shoes: 36,
  width: 0.42,
};

function stadium(s, { half, pathR, wheelY }) {
  // Abscisse curviligne s ∈ [0, L) → position et normale extérieure.
  const straight = 2 * half;
  const arc = Math.PI * pathR;
  const L = 2 * straight + 2 * arc;
  s = ((s % L) + L) % L;
  if (s < straight) return { p: [-half + s, wheelY - pathR], n: [0, -1], t: [1, 0] };
  s -= straight;
  if (s < arc) {
    const a = -Math.PI / 2 + s / pathR;
    return { p: [half + Math.cos(a) * pathR, wheelY + Math.sin(a) * pathR], n: [Math.cos(a), Math.sin(a)], t: [-Math.sin(a), Math.cos(a)] };
  }
  s -= arc;
  if (s < straight) return { p: [half - s, wheelY + pathR], n: [0, 1], t: [-1, 0] };
  s -= straight;
  const a = Math.PI / 2 + s / pathR;
  return { p: [-half + Math.cos(a) * pathR, wheelY + Math.sin(a) * pathR], n: [Math.cos(a), Math.sin(a)], t: [-Math.sin(a), Math.cos(a)] };
}

function shoeGeometry(pitch, width) {
  const parts = [];
  const base = new THREE.BoxGeometry(pitch * 0.94, 0.016, width);
  base.translate(0, 0.008, 0);
  parts.push(base);
  [-0.32, 0.02, 0.34].forEach((k) => {
    const g = new THREE.BoxGeometry(pitch * 0.12, 0.026, width * 0.98);
    g.translate(k * pitch, 0.028, 0);
    parts.push(g);
  });
  return mergeGeometries(parts.map((g) => g.toNonIndexed()));
}

/** Chaîne complète (patins + maillons + axes) en InstancedMesh. */
function chain(api) {
  const { half, pathR, wheelY, shoes, width } = TRACK;
  const L = 4 * half + 2 * Math.PI * pathR;
  const pitch = L / shoes;
  const g = new THREE.Group();
  const shoeGeo = shoeGeometry(pitch, width);
  const linkGeo = new THREE.BoxGeometry(pitch * 1.06, 0.05, 0.028);
  const pinGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.3, 10);
  pinGeo.rotateX(Math.PI / 2);
  const shoesM = new THREE.InstancedMesh(shoeGeo, mat('yellow'), shoes);
  const linksM = new THREE.InstancedMesh(linkGeo, mat('yellow'), shoes * 2);
  const pinsM = new THREE.InstancedMesh(pinGeo, mat('darkSteel'), shoes);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s1 = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < shoes; i++) {
    const { p, n } = stadium((i + 0.5) * pitch, TRACK);
    const ang = Math.atan2(n[1], n[0]) + Math.PI / 2; // normale (0,-1) → angle 0
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang);
    // Patin : face extérieure vers la normale.
    const sp = new THREE.Vector3(p[0] + n[0] * 0.004, p[1] + n[1] * 0.004, 0);
    // Le patin est modélisé « vers le haut » ; on le retourne pour qu'il pointe vers l'extérieur.
    const qs = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
    m.compose(sp, qs, s1);
    shoesM.setMatrixAt(i, m);
    for (const [k, z] of [[0, 0.11], [1, -0.11]]) {
      m.compose(new THREE.Vector3(p[0] - n[0] * 0.03, p[1] - n[1] * 0.03, z), q, s1);
      linksM.setMatrixAt(i * 2 + k, m);
    }
    const pj = stadium(i * pitch, TRACK).p;
    const nj = stadium(i * pitch, TRACK).n;
    m.compose(new THREE.Vector3(pj[0] - nj[0] * 0.03, pj[1] - nj[1] * 0.03, 0), new THREE.Quaternion(), s1);
    pinsM.setMatrixAt(i, m);
  }
  [shoesM, linksM, pinsM].forEach((im) => { im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.computeBoundingBox?.(); });
  g.add(shoesM, linksM, pinsM);
  return g;
}

export function F05(api, opts = {}) {
  const { box, cyl, ring, gear, spring, nut, bolt, at, group, extrude, plate, fitting } = api.S;
  const { wheelY, half } = TRACK;
  const P = (ref, obj, e, o) => api.part(ref, obj, e, o);

  // 1 — Chaîne / patins
  P('1', chain(api), [0, 0, 0.95]);

  // 18 — Cadre de chenille (caisson ouvert)
  const frame = group(
    at(box(1.95, 0.02, 0.24, 'black'), [0, 0.46, 0]),
    at(box(1.85, 0.27, 0.016, 'black'), [0, 0.32, 0.11]),
    at(box(1.85, 0.27, 0.016, 'black'), [0, 0.32, -0.11]),
    at(box(0.05, 0.27, 0.22, 'black'), [-0.9, 0.32, 0]),
    at(box(0.2, 0.18, 0.26, 'black'), [0.92, 0.33, 0]),
    ...[-0.7, -0.35, 0, 0.35, 0.7].map((x) => at(box(0.12, 0.03, 0.24, 'black'), [x, 0.2, 0])),
  );
  P('18', frame, [0, 0, 0]);

  // 17 — Roue folle (headler) + 16 plaques de palier
  const idler = group(
    cyl(0.232, 0.24, 'black', { axis: 'z', seg: 40 }),
    cyl(0.255, 0.05, 'black', { axis: 'z', seg: 40 }),
    cyl(0.06, 0.3, 'darkSteel', { axis: 'z' }),
    at(ring(0.2, 0.08, 0.02, 'darkSteel', { axis: 'z' }), [0, 0, 0.125]),
  );
  P('17', at(idler, [half, wheelY, 0]), [0.8, 0, 0]);
  for (const z of [0.17, -0.17]) {
    P('16', at(box(0.14, 0.12, 0.03, 'black', { r: 0.01 }), [half, wheelY, z]), [0.8, 0, z > 0 ? 0.3 : -0.3]);
  }

  // Tendeur : 15 fourche, 14 vérin, 13 graisseur, 12 ressort, 11 entretoise, 10-8 écrou/rondelle/boulon
  P('15', group(
    at(cyl(0.025, 0.42, 'black', { axis: 'x' }), [0.7, 0, 0]),
    at(box(0.06, 0.1, 0.16, 'black'), [0.92, 0, 0]),
    at(box(0.14, 0.08, 0.02, 'black'), [1.0, 0, 0.07]),
    at(box(0.14, 0.08, 0.02, 'black'), [1.0, 0, -0.07]),
  ).translateY(wheelY), [0.45, 0.4, 0]);
  P('14', group(
    at(cyl(0.045, 0.26, 'black', { axis: 'x' }), [0.35, 0, 0]),
    at(ring(0.07, 0.03, 0.025, 'black', { axis: 'x' }), [0.48, 0, 0]),
  ).translateY(wheelY), [0.25, 0.55, 0]);
  P('13', at(fitting(0.012, 0.035, 'brass'), [0.33, wheelY + 0.06, 0]), [0.25, 0.8, 0]);
  P('12', spring(0.07, 0.013, 0.34, 6, 'black', { axis: 'x', pos: [0.03, wheelY, 0] }), [0, 0.65, 0]);
  P('11', cyl(0.06, 0.06, 'black', { axis: 'x', pos: [-0.17, wheelY, 0] }), [-0.15, 0.65, 0]);
  P('10', nut(0.05, 0.03, 'darkSteel', { axis: 'x', pos: [-0.215, wheelY, 0] }), [-0.28, 0.65, 0]);
  P('9', ring(0.035, 0.016, 0.006, 'steel', { axis: 'x', pos: [-0.235, wheelY, 0] }), [-0.36, 0.65, 0]);
  P('8', bolt(0.03, 0.12, 'darkSteel', { axis: '-x', pos: [-0.24, wheelY, 0] }), [-0.48, 0.65, 0]);
  P('20', at(box(0.06, 0.1, 0.12, 'darkSteel'), [-0.3, wheelY, 0]), [-0.25, 0.4, 0]);

  // 2 — Garde de roue folle, 3 — couvercle d'accès, 4 — garde (toit du cadre)
  P('2', at(box(0.32, 0.015, 0.26, 'black'), [0.78, 0.5, 0], [0, 0, 0.18]), [0.2, 0.6, 0]);
  P('3', group(
    at(box(0.26, 0.015, 0.22, 'black'), [0, 0.06, 0]),
    at(box(0.26, 0.06, 0.015, 'black'), [0, 0.03, 0.105]),
    at(box(0.26, 0.06, 0.015, 'black'), [0, 0.03, -0.105]),
  ).translateX(0.25).translateY(0.43), [0, 0.75, 0]);
  const gp = [[-0.85, 0], [0.62, 0], [0.62, 0.012], [-0.85, 0.012]];
  P('4', group(
    at(extrude(gp, 0.15, 'black'), [0, 0.475, 0.06], [0.22, 0, 0]),
    at(extrude(gp, 0.15, 'black'), [0, 0.475, -0.06], [-0.22, 0, 0]),
  ), [0, 0.5, 0]);

  // 22 — Galets inférieurs (5 par chenille)
  for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) {
    P('22', group(
      cyl(0.05, 0.19, 'black', { axis: 'z' }),
      at(cyl(0.066, 0.025, 'black', { axis: 'z' }), [0, 0, 0.07]),
      at(cyl(0.066, 0.025, 'black', { axis: 'z' }), [0, 0, -0.07]),
      at(box(0.08, 0.05, 0.22, 'darkSteel'), [0, 0.04, 0]),
    ).translateX(x).translateY(0.155), [0, -0.38, 0]);
  }

  // Entraînement arrière : 6 barbotin, 7 réducteur, 27 accouplement, 28 frein, 29 plaque, 30 moteur
  const sx = -half;
  P('6', gear(0.232, 0.272, 20, 0.05, 'black', { axis: 'z', hole: 0.09, pos: [sx, wheelY, 0] }), [-0.45, 0, 0.4]);
  P('7', group(
    cyl(0.14, 0.17, 'black', { axis: 'z' }),
    at(ring(0.165, 0.09, 0.025, 'black', { axis: 'z' }), [0, 0, 0.07]),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return at(cyl(0.012, 0.02, 'steel', { axis: 'z' }), [Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.09]);
    }),
  ).translateX(sx).translateY(wheelY).translateZ(-0.1), [-0.45, 0, -0.12]);
  P('27', cyl(0.032, 0.07, 'steel', { axis: 'z', pos: [sx, wheelY, -0.22] }), [-0.45, 0, -0.32]);
  P('28', group(
    cyl(0.085, 0.11, 'black', { axis: 'z' }),
    at(ring(0.1, 0.03, 0.02, 'black', { axis: 'z' }), [0, 0, 0.05]),
  ).translateX(sx).translateY(wheelY).translateZ(-0.31), [-0.45, 0, -0.52]);
  P('29', at(plate(0.19, 0.19, 0.015, 'black', { holes: [[0, 0, 0.03], [0.065, 0.065, 0.01], [-0.065, 0.065, 0.01], [0.065, -0.065, 0.01], [-0.065, -0.065, 0.01]] }), [sx, wheelY, -0.375], [Math.PI / 2, 0, 0]), [-0.45, 0, -0.72]);
  if (!opts.noMotor) {
    const motor = api.sub('F07', { noPlate: true });
    motor.rotation.y = -Math.PI / 2;
    motor.position.set(sx, wheelY, -0.5);
    P('30', motor, [-0.45, 0, -0.98]);
  }

  // Plaques de fixation au châssis (côté intérieur) : 25 arrière, 23 avant
  P('25', group(
    at(extrude([[-0.28, -0.2], [0.24, -0.2], [0.24, 0.2], [-0.28, 0.2]], 0.025, 'black', { holes: [[-0.15, 0, 0.11]] }), [0, 0, 0]),
    at(box(0.16, 0.14, 0.08, 'black'), [0.12, 0, -0.05]),
  ).translateX(sx + 0.15).translateY(wheelY + 0.02).translateZ(-0.2), [0.1, -0.12, -0.55]);
  P('23', group(
    at(box(0.3, 0.3, 0.025, 'black'), [0, 0, 0]),
    at(box(0.14, 0.16, 0.12, 'black'), [0, 0.02, -0.07]),
  ).translateX(0.55).translateY(0.34).translateZ(-0.16), [0, -0.12, -0.55]);

  return { view: { dir: [0.75, 0.55, 1.15] } };
}

export function F06(api) {
  const { box, cyl, ring, torus, bolt, nut, at, group, extrude } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const pitch = 0.17;
  const linkProfile = [[-0.12, -0.03], [0.12, -0.03], [0.13, 0.0], [0.12, 0.035], [0.03, 0.04], [-0.03, 0.045], [-0.12, 0.035], [-0.13, 0]];

  const shoe = (material) => group(
    box(pitch * 1.25, 0.018, 0.42, material, { r: 0.004 }),
    ...[-0.06, 0, 0.065].map((x) => at(box(0.022, 0.03, 0.41, material, { r: 0.004 }), [x, 0.022, 0])),
  );
  const boltPos = [[-0.035, 0.07], [0.035, 0.07], [-0.035, -0.07], [0.035, -0.07]];

  // Ensemble standard (à gauche)
  const X = -0.38;
  P('1', at(shoe('yellow'), [X, 0.075, 0]), [0, 0.22, 0]);
  boltPos.forEach(([dx, dz]) => P('2', bolt(0.016, 0.1, 'darkSteel', { head: 'button', pos: [X + dx, 0.12, dz] }), [0, 0.42, 0]));
  boltPos.forEach(([dx, dz]) => P('8', nut(0.026, 0.016, 'darkSteel', { pos: [X + dx, 0.0, dz > 0 ? 0.075 : -0.075] }), [0, -0.2, 0]));
  P('7', at(extrude(linkProfile, 0.03, 'yellow', { holes: [[-0.08, 0, 0.026], [0.08, 0, 0.02]] }), [X, 0.025, 0.075]), [0, 0, 0.2]);
  P('9', at(extrude(linkProfile, 0.03, 'yellow', { holes: [[-0.08, 0, 0.026], [0.08, 0, 0.02]] }), [X, 0.025, -0.075]), [0, 0, -0.2]);
  P('5', cyl(0.019, 0.27, 'yellow', { axis: 'z', pos: [X + 0.08, 0.025, 0] }), [0, 0, 0.42]);
  P('6', cyl(0.027, 0.12, 'yellow', { axis: 'z', pos: [X - 0.08, 0.025, 0] }), [0, -0.05, -0.32]);
  P('16', torus(0.024, 0.004, 'darkSteel', { axis: 'z', pos: [X + 0.08, 0.025, 0.145] }), [0, 0, 0.5]);
  P('15', torus(0.026, 0.005, 'rubber', { axis: 'z', pos: [X + 0.08, 0.025, 0.152] }), [0, 0, 0.56]);
  P('14', group(cyl(0.022, 0.014, 'yellow', { axis: 'z' }), at(cyl(0.012, 0.02, 'yellow', { axis: 'z' }), [0, 0, -0.012])).translateX(X + 0.08).translateY(0.025).translateZ(0.162), [0, 0, 0.64]);

  // Ensemble maître (à droite)
  const Xm = 0.38;
  P('3', at(shoe('yellow'), [Xm, 0.075, 0]), [0, 0.22, 0]);
  boltPos.forEach(([dx, dz]) => P('4', bolt(0.017, 0.11, 'darkSteel', { head: 'button', pos: [Xm + dx, 0.12, dz] }), [0, 0.42, 0]));
  const half = (sign) => [[0, -0.03], [sign * 0.12, -0.03], [sign * 0.13, 0], [sign * 0.12, 0.035], [0, 0.045], [sign * 0.01, 0.02], [-sign * 0.01, 0.0], [sign * 0.01, -0.02]];
  P('10', at(extrude(half(1), 0.03, 'yellow', { holes: [[0.08, 0, 0.02]] }), [Xm, 0.025, 0.075]), [0.06, 0, 0.22]);
  P('13', at(extrude(half(-1), 0.03, 'yellow', { holes: [[-0.08, 0, 0.026]] }), [Xm, 0.025, 0.075]), [-0.06, 0, 0.22]);
  P('11', at(extrude(half(1), 0.03, 'yellow', { holes: [[0.08, 0, 0.02]] }), [Xm, 0.025, -0.075]), [0.06, 0, -0.22]);
  P('12', at(extrude(half(-1), 0.03, 'yellow', { holes: [[-0.08, 0, 0.026]] }), [Xm, 0.025, -0.075]), [-0.06, 0, -0.22]);
  return { view: { dir: [0.6, 0.9, 1.1] } };
}

export function F07(api, opts = {}) {
  const { box, cyl, ring, nut, fitting, at, group, plate } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Moteur OMS 100 : arbre selon +X.
  P('2', group(
    at(box(0.15, 0.13, 0.13, 'black', { r: 0.012 }), [-0.06, 0, 0]),
    at(box(0.035, 0.16, 0.16, 'black', { r: 0.01 }), [0.035, 0, 0]),
    at(cyl(0.05, 0.03, 'black', { axis: 'x' }), [0.065, 0, 0]),
    at(cyl(0.016, 0.055, 'darkSteel', { axis: 'x' }), [0.1, 0, 0]),
    ...[[0.05, 0.05], [-0.05, 0.05], [0.05, -0.05], [-0.05, -0.05]].map(([y, z]) => at(nut(0.022, 0.015, 'black', { axis: 'x' }), [-0.14, y, z])),
    at(nut(0.026, 0.02, 'black'), [-0.03, 0.075, 0.03]),
    at(nut(0.026, 0.02, 'black'), [-0.09, 0.075, -0.03]),
  ), [0, 0, 0]);
  if (!opts.noPlate) {
    P('1', at(plate(0.2, 0.2, 0.018, 'black', { holes: [[0, 0, 0.03], [0.07, 0.07, 0.011], [-0.07, 0.07, 0.011], [0.07, -0.07, 0.011], [-0.07, -0.07, 0.011]] }), [0.07, 0, 0], [0, 0, Math.PI / 2]), [0.28, 0, 0]);
  }
  P('3', at(fitting(0.018, 0.04, 'steel'), [-0.03, 0.1, 0.03]), [0, 0.1, 0.04]);
  P('3', at(fitting(0.018, 0.04, 'steel'), [-0.09, 0.1, -0.03]), [0, 0.1, -0.04]);
  P('4', at(fitting(0.016, 0.045, 'steel', { tee: true }), [-0.03, 0.14, 0.03]), [0, 0.18, 0.06]);
  P('4', at(fitting(0.016, 0.045, 'steel', { elbow: true }), [-0.09, 0.14, -0.03]), [0, 0.18, -0.06]);
  P('5', at(fitting(0.015, 0.04, 'steel', { axis: 'x' }), [0.02, 0.185, 0.0]), [0.05, 0.27, 0]);
  P('6', group(box(0.07, 0.035, 0.035, 'brass', { r: 0.004 }), at(nut(0.022, 0.012, 'steel', { axis: 'x' }), [0.04, 0, 0])).translateX(-0.06).translateY(0.19), [0, 0.36, 0]);
  P('7', at(fitting(0.014, 0.04, 'steel', { axis: 'x' }), [-0.12, 0.19, 0]), [-0.05, 0.45, 0]);
  return { view: { dir: [0.9, 0.7, 1.1] } };
}
