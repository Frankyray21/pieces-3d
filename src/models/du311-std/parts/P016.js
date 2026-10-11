// P016 — Trousse d'extinction manuelle « MANUAL FIRE SUPPRESSION KIT, DU311 »
// CX037389 (pages 16 et 18) : système Ansul Checkfire 210 à poudre.
// Le dessin est un schéma de câblage et de tuyauterie, non à l'échelle ; ses
// notes situent chaque organe :
// - module d'affichage (1) sur son support (2) dans la cabine, à côté de
//   l'actionneur manuel ; module de commande ICM (3) et sa pile (4) dans la
//   cabine ; câbles d'affichage, de relais et de détection (5 à 11, 14, 15),
//   dérivation à 3 branches (11) près de l'ICM, dispositif de fin de ligne (16) ;
// - trois actionneurs électriques manuels (12), deux sur support (13) : dans la
//   cabine à côté de l'affichage, au tableau de manomètres arrière, et au
//   distributeur hydraulique avant droit ;
// - cartouche de gaz propulseur (21) et son support (20) à l'avant du pont
//   arrière, coiffée de l'actionneur électropneumatique (19) et du dispositif
//   d'actionnement à poussoir (18), câble de déclenchement (17) ; raccord (22),
//   flexible 1/4 po (23) et coude (24) vers le réservoir ;
// - réservoir de poudre et son support (25) à l'arrière du pont arrière,
//   raccords 3/4 (26), flexible 3/4 po (27), té de distribution (28),
//   mamelons (29), flexibles 1/2 po (30 à 38), tés union (39), coudes (40) ;
// - six buses V-1/2 (43) sur support (42), deux rondelles frein chacune (41) :
//   haut arrière du compartiment moteur (vers le bas, vers le moteur ; en
//   travers), avant du pont arrière (vers le groupe de puissance), sous la
//   cabine (vers l'hydraulique), sous le repos du mât (vers le moteur de pompe,
//   vers le bas et en travers) ;
// - pochette d'étiquettes (44), passe-fils à 3 trous (45) le long des lignes.
// Repère machine (layout.js) ; les organes du châssis avant suivent le corps
// « front » (simulation), le flexible qui passe l'articulation est souple.
import { M, body, flex } from '../layout.js';
import { jicAdapter, jicElbow, splitWasher } from '../../du311/parts/_avance_b.js';
import { EOL } from './P014.js';

const FT = M.frameTop;

// Emplacements (repère machine) ; f : sur le châssis avant.
const CAB = { display: [-0.27, 1.86, 0.78], icm: [-0.985, 1.55, -0.22], actuator: [-0.27, 1.86, 0.9] };
const ACT = [
  { p: CAB.actuator, n: [-1, 0, 0], bracket: false }, // cabine, à côté de l'affichage
  { p: [-4.34, 1.24, -0.92], n: [-1, 0, 0], bracket: true }, // tableau de manomètres arrière
  { p: [0.86, 1.33, 0.975], n: [0, 0, 1], bracket: true, f: true }, // distributeur hydraulique avant droit
];
const TANK = [-4.12, FT, 0.6]; // pied du réservoir de poudre
const CART = [-2.92, FT + 0.01, 0.74]; // pied de la cartouche de gaz
const TEE = [-3.32, 1.1, 0.46]; // té de distribution
// Tés union : avant (châssis avant), milieu (sous la cabine), arrière (compartiment moteur).
const UT = { front: [0.36, 0.93, -0.3], mid: [-0.85, 0.93, 0.3], rear: [-2.62, 1.5, 0.35] };
// Buses : position, direction du jet, té qui l'alimente, châssis avant.
const NOZ = [
  { p: [-2.66, 1.86, -0.55], d: [0, -1, 0], t: 'rear' },
  { p: [-2.66, 1.86, 0.62], d: [0, -0.4, -1], t: 'rear' },
  { p: [-3.02, 1.74, 0.74], d: [-1, -0.3, 0], t: 'mid' },
  { p: [-0.6, 0.94, -0.18], d: [0, -1, 0], t: 'mid' },
  { p: [0.62, 0.99, -0.3], d: [0, -1, 0], t: 'front', f: true },
  { p: [1.02, 0.95, -0.42], d: [0, -0.2, 1], t: 'front', f: true },
];

export default function P016(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, hose, cable, nameplate, torus, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o, f) => (f ? body('front', o) : o);
  const q = (n) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n).normalize());
  const along = (obj, n, p) => { obj.quaternion.copy(q(n)); obj.position.set(...p); return obj; };

  // 1, 2 — module d'affichage Checkfire 210 sur son support (écran vers l'arrière de la cabine)
  const display = group(
    box(0.045, 0.075, 0.1, 'plastic', { r: 0.006 }),
    at(box(0.004, 0.034, 0.06, 'glass'), [-0.0235, 0.012, 0]),
    ...[-0.026, 0, 0.026].map((z) => at(cyl(0.005, 0.004, 'red', { axis: 'x', seg: 12 }), [-0.0235, -0.022, z])),
    at(cyl(0.006, 0.012, 'black', { seg: 10 }), [0.006, -0.043, 0.03]),
  );
  P('1', at(display, CAB.display), [-0.15, 0, 0]);
  P('2', at(group(
    box(0.004, 0.05, 0.08, 'black'),
    at(box(0.04, 0.004, 0.08, 'black'), [-0.018, -0.025, 0]),
    at(S.boltSet([[0, 0.015, -0.03], [0, 0.015, 0.03]], 0.005, 0.012, 'zinc', { axis: 'x' }), [0.002, 0, 0]),
  ), [CAB.display[0] + 0.0245, CAB.display[1], CAB.display[2]]), [-0.08, 0, 0]);

  // 3, 4 — module de commande (ICM) contre la paroi arrière de la cabine, pile au flanc
  const icm = group(
    box(0.07, 0.16, 0.2, 'red', { r: 0.01 }),
    at(box(0.004, 0.13, 0.17, 'red', { r: 0.006 }), [0.037, 0, 0]),
    ...[[-0.06, 0.05], [0.06, 0.05], [-0.06, -0.05], [0.06, -0.05]].map(([y, z]) => at(cyl(0.006, 0.004, 'zinc', { axis: 'x', seg: 10 }), [0.04, y * 1.1, z * 1.4])),
    ...[-0.06, -0.02, 0.02, 0.06].map((z) => at(cyl(0.008, 0.02, 'black', { seg: 12 }), [0, -0.09, z])),
    nameplate(0.08, 0.04).translateX(0.04).rotateY(Math.PI / 2).translateY(0.035),
  );
  P('3', at(icm, CAB.icm), [0.1, 0, 0]);
  P('4', at(group(box(0.05, 0.11, 0.05, 'black', { r: 0.006 }), at(box(0.052, 0.03, 0.052, 'yellow', { r: 0.004 }), [0, 0.02, 0])), [CAB.icm[0], CAB.icm[1] - 0.02, CAB.icm[2] - 0.13]), [0.1, 0, -0.1]);

  // Câbles (presse-étoupe à chaque bout) : affichage, relais, détection, déclenchement.
  const C = (pts, f, r = 0.0035, mat = 'black') => F(cable(pts, r, { material: mat }), f);
  const icmOut = (z) => [CAB.icm[0], CAB.icm[1] - 0.1, CAB.icm[2] + z];
  const branch = [-0.95, 1.18, 0.0]; // dérivation à 3 branches sous l'ICM
  P('5', C([icmOut(-0.06), [-0.96, 1.2, 0.1], [-0.6, 1.2, 0.85], [-0.3, 1.55, 0.86], [CAB.display[0] + 0.01, CAB.display[1] - 0.05, CAB.display[2] + 0.03]]), [0, -0.1, 0.1]);
  P('6', C([icmOut(-0.02), [-0.97, 1.15, -0.1], [-1.06, 1.0, -0.3], [-1.3, 0.96, -0.42]], false), [0, -0.1, -0.1]);
  P('7', C([icmOut(0.02), [-0.98, 1.3, -0.33], [-1.07, 1.3, -0.36]], false), [0, -0.05, -0.1]);
  P('8', C([icmOut(0.06), branch]), [0, -0.1, 0]);
  P('9', C([[-0.98, 1.62, -0.33], [-1.05, 1.62, -0.36], [-1.08, 1.4, -0.38]]), [-0.1, 0.05, -0.1]);
  // 10 — câbles de détection 2 pi (trois) : de la dérivation vers les actionneurs et la fin de ligne
  P('10', C([branch, [-0.8, 1.2, 0.3], [CAB.actuator[0] + 0.03, CAB.actuator[1] - 0.06, CAB.actuator[2]]]), [0, -0.1, 0.1]);
  P('10', C([branch, [-1.0, 1.1, -0.05], [-1.06, 0.98, 0.0]]), [0, -0.1, 0]);
  P('10', C([branch, [-0.9, 1.1, -0.15], [-0.75, 0.98, -0.25]]), [0, -0.1, -0.1]);
  P('11', at(group(box(0.06, 0.03, 0.03, 'black', { r: 0.005 }), ...[-1, 0, 1].map((k) => at(cyl(0.007, 0.018, 'black', { axis: 'x', seg: 10 }), [0.035, 0, k * 0.01]))), branch), [0, -0.15, 0]);
  // 14 — câbles de détection 20 pi (deux) : vers le pont arrière (tableau de manomètres, cartouche)
  P('14', C([[-1.06, 0.98, 0.0], [-1.5, 0.95, -0.5], [-2.8, 0.97, -0.62], [-3.9, 1.02, -0.8], [ACT[1].p[0] + 0.03, ACT[1].p[1] - 0.07, ACT[1].p[2]]]), [0, -0.1, -0.15]);
  P('14', C([[-0.75, 0.98, -0.25], [-1.5, 0.95, 0.45], [-2.6, 0.97, 0.66], [CART[0] + 0.02, CART[1] + 0.42, CART[2]]]), [0, -0.1, 0.15]);
  // 15 — câble de détection 10 pi vers l'actionneur du distributeur avant (passe l'articulation)
  P('15', flex(S, [[-0.85, 0.96, 0.2], [-0.2, 0.92, 0.25], [0.3, 0.92, 0.5], [ACT[2].p[0] - 0.03, ACT[2].p[1] - 0.07, ACT[2].p[2] - 0.01]],
    ['chassis', 'chassis', 'front', 'front'], 0.0035, 'black', { seg: 32 }), [0, -0.1, 0.1]);
  // 16 — dispositif de fin de ligne : au bout du détecteur linéaire 20 pi (P014)
  P('16', at(group(cyl(0.01, 0.04, 'black', { axis: 'x', seg: 12 }), at(cyl(0.012, 0.012, 'red', { axis: 'x', seg: 12 }), [0.026, 0, 0])), [EOL[0] + 0.005, EOL[1], EOL[2]]), [0.1, 0, 0]);

  // 12, 13 — actionneurs électriques manuels (boîtier rouge, bouton sous capot, goupille et
  // scellé) ; deux sur équerre
  ACT.forEach((a) => {
    const act = group(
      box(0.05, 0.1, 0.06, 'red', { r: 0.006 }),
      at(cyl(0.017, 0.012, 'yellow', { seg: 16 }), [0, 0.02, 0]).rotateX(0),
      at(cyl(0.012, 0.01, 'red', { seg: 16 }), [0, 0.03, 0]),
      at(torus(0.012, 0.0015, 'steel'), [0, 0.03, 0.03]),
      at(cyl(0.0015, 0.04, 'steel', { axis: 'z', seg: 6 }), [0, 0.03, 0.015]),
      at(cyl(0.007, 0.016, 'black', { seg: 10 }), [0, -0.058, 0]),
    );
    // bouton vers la face de l'opérateur (normale n)
    act.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...a.n)));
    act.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
    act.position.set(...a.p);
    P('12', F(group(act), a.f), a.n.map((v) => v * 0.15));
    if (a.bracket) {
      const n = new THREE.Vector3(...a.n);
      const br = group(
        box(0.004, 0.12, 0.08, 'zinc'),
        at(box(0.06, 0.004, 0.08, 'zinc'), [0.028, -0.058, 0]),
        S.boltSet([[0.001, 0.035, -0.025], [0.001, 0.035, 0.025]], 0.006, 0.014, 'zinc', { axis: 'x' }),
      );
      br.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 0, 0), n));
      br.position.set(a.p[0] - n.x * 0.032, a.p[1], a.p[2] - n.z * 0.032);
      P('13', F(br, a.f), a.n.map((v) => v * 0.1));
    }
  });

  // 20, 21 — cartouche de gaz propulseur dans son support (avant du pont arrière)
  const cy = CART[1];
  P('21', at(lathe([[0, 0], [0.03, 0], [0.033, 0.012], [0.033, 0.3], [0.024, 0.34], [0.012, 0.35], [0.012, 0.37], [0, 0.37]], 'red', { seg: 28 }), CART), [0, 0.3, 0]);
  P('20', group(
    at(box(0.12, 0.006, 0.12, 'zinc'), [CART[0], cy + 0.003, CART[2]]),
    at(box(0.006, 0.34, 0.07, 'zinc'), [CART[0] + 0.045, cy + 0.17, CART[2]]),
    ...[0.08, 0.26].map((y) => at(torus(0.036, 0.004, 'zinc'), [CART[0], cy + y, CART[2]])),
    S.boltSet([[CART[0] - 0.045, cy + 0.006, CART[2] - 0.045], [CART[0] + 0.045, cy + 0.006, CART[2] + 0.045]], 0.008, 0.016, 'zinc'),
  ), [0, 0.15, 0]);
  // 19 — actionneur électropneumatique vissé sur la cartouche ; 18 — dispositif à poussoir
  P('19', at(group(
    lathe([[0, 0], [0.026, 0], [0.026, 0.05], [0.02, 0.06], [0.02, 0.075], [0, 0.075]], 'red', { seg: 24 }),
    at(box(0.04, 0.03, 0.03, 'black', { r: 0.004 }), [0.03, 0.035, 0]),
  ), [CART[0], cy + 0.37, CART[2]]), [0, 0.25, 0]);
  P('18', at(group(cyl(0.012, 0.035, 'steel', { seg: 16 }), at(cyl(0.016, 0.008, 'red', { seg: 16 }), [0, 0.02, 0])), [CART[0], cy + 0.465, CART[2]]), [0, 0.3, 0]);
  P('17', C([[CART[0] + 0.05, cy + 0.405, CART[2]], [CART[0] + 0.12, cy + 0.42, CART[2] - 0.05], [-2.75, 1.1, 0.6], [-1.5, 0.97, 0.5], [-1.06, 0.98, 0.0]]), [0, 0.1, 0]);
  // 22, 23, 24 — raccord, flexible 1/4 po et coude : gaz de la cartouche vers le réservoir
  const gIn = [TANK[0] + 0.13, TANK[1] + 0.52, TANK[2]];
  P('22', along(jicAdapter(S, THREE, 4, { npt: true }), [1, 0, 0], [CART[0] - 0.035, cy + 0.395, CART[2]]).rotateZ(Math.PI), [-0.05, 0.1, 0]);
  P('23', hose([[CART[0] - 0.06, cy + 0.395, CART[2]], [CART[0] - 0.3, cy + 0.5, CART[2] - 0.05], [-3.6, 1.62, 0.66], [gIn[0] + 0.12, gIn[1] + 0.05, gIn[2]], [gIn[0] + 0.03, gIn[1], gIn[2]]], 0.006), [0, 0.12, 0]);
  P('24', along(jicElbow(S, THREE, 4), [-1, 0, 0], [gIn[0] + 0.012, gIn[1], gIn[2]]), [0.06, 0.06, 0]);

  // 25 — réservoir de poudre (fond bombé, bouchon de remplissage, sortie au pied) et son support
  const tk = lathe([[0, 0.02], [0.08, 0.02], [0.115, 0.05], [0.125, 0.09], [0.125, 0.5], [0.115, 0.55], [0.08, 0.585], [0.045, 0.6], [0.045, 0.63], [0.055, 0.63], [0.055, 0.665], [0, 0.665]], 'red', { seg: 40 });
  P('25', group(
    at(tk, TANK),
    at(box(0.3, 0.008, 0.3, 'zinc'), [TANK[0], TANK[1] + 0.004, TANK[2]]),
    at(box(0.008, 0.6, 0.18, 'zinc'), [TANK[0] - 0.13, TANK[1] + 0.3, TANK[2]]),
    ...[0.16, 0.44].map((y) => at(torus(0.128, 0.006, 'zinc'), [TANK[0], TANK[1] + y, TANK[2]])),
    ...[0.16, 0.44].map((y) => at(S.boltSet([[0, 0, -0.03], [0, 0, 0.03]], 0.008, 0.03, 'zinc', { axis: 'x' }), [TANK[0] - 0.14, TANK[1] + y, TANK[2]])),
    at(cyl(0.02, 0.03, 'zinc', { seg: 16 }), [gIn[0] - 0.01, gIn[1], gIn[2]]).rotateZ(Math.PI / 2),
    at(cyl(0.024, 0.04, 'zinc', { seg: 16 }), [TANK[0] + 0.12, TANK[1] + 0.06, TANK[2]]).rotateZ(Math.PI / 2),
  ), [0, 0.35, 0]);
  // 44 — pochette d'étiquettes : plaques sur le réservoir et sur l'ICM
  P('44', group(
    at(nameplate(0.12, 0.09, { material: 'white' }), [TANK[0], TANK[1] + 0.33, TANK[2] + 0.1265]),
    at(nameplate(0.07, 0.05, { material: 'white' }), [CART[0], cy + 0.2, CART[2] + 0.0335]),
  ), [0, 0, 0.15]);

  // 26, 27 — raccords 3/4 et flexible 3/4 po : sortie du réservoir vers le té de distribution
  const tOut = [TANK[0] + 0.15, TANK[1] + 0.06, TANK[2]];
  P('26', along(jicAdapter(S, THREE, 12, { npt: true }), [1, 0, 0], tOut), [0.08, 0, 0]);
  P('26', along(jicAdapter(S, THREE, 12, { npt: true }), [1, 0, 0], [TEE[0] - 0.07, TEE[1], TEE[2]]), [-0.08, 0, 0]);
  P('27', hose([[tOut[0] + 0.06, tOut[1], tOut[2]], [-3.9, 1.04, 0.58], [-3.6, 1.06, 0.5], [TEE[0] - 0.11, TEE[1], TEE[2]]], 0.014), [0, 0.1, 0]);
  // 28 — té de distribution ; 29 — mamelons hexagonaux (trois sorties)
  P('28', at(group(box(0.05, 0.05, 0.05, 'brass', { r: 0.004 }), at(cyl(0.018, 0.08, 'brass', { axis: 'x', seg: 16 }), [0, 0, 0])), TEE), [0, 0.15, 0]);
  const teeOuts = [[1, 0, 0], [0, 0, -1], [0, 1, 0]];
  teeOuts.forEach((d) => P('29', along(jicAdapter(S, THREE, 8, { npt: true }), d, [TEE[0] + d[0] * 0.03, TEE[1] + d[1] * 0.03, TEE[2] + d[2] * 0.03]), d.map((v) => v * 0.1)));

  // 39 — tés union JIC (avant, milieu, arrière)
  const ut = (k, f) => F(at(jicElbow(S, THREE, 8, { tee: true }), UT[k]), f);
  P('39', ut('front', true), [0, -0.1, 0]);
  P('39', ut('mid', false), [0, -0.1, 0]);
  P('39', ut('rear', false), [0, 0.1, 0]);

  // 30–38 — flexibles 1/2 po : du té de distribution aux tés union (30 à 32), des tés aux buses (33 à 38)
  const H = (pts) => hose(pts, 0.0095);
  const out = (d) => [TEE[0] + d[0] * 0.06, TEE[1] + d[1] * 0.06, TEE[2] + d[2] * 0.06];
  P('30', H([out(teeOuts[1]), [-3.3, 1.02, 0.2], [-2.0, 0.96, 0.35], [UT.mid[0] - 0.05, UT.mid[1], UT.mid[2]]]), [0, -0.1, 0]);
  // 31 — vers le té avant : passe l'articulation (flexible souple)
  P('31', flex(S, [out(teeOuts[0]), [-2.5, 0.96, 0.1], [-0.9, 0.92, -0.2], [0.0, 0.9, -0.3], [UT.front[0] - 0.05, UT.front[1], UT.front[2]]],
    ['chassis', 'chassis', 'chassis', 'front', 'front'], 0.0095, 'hose', { seg: 48 }), [0, -0.1, 0]);
  P('32', H([out(teeOuts[2]), [-3.2, 1.35, 0.45], [-2.9, 1.5, 0.4], [UT.rear[0] - 0.05, UT.rear[1], UT.rear[2]]]), [0, 0.1, 0]);
  const toNozzle = (n) => {
    const t = UT[n.t];
    const e = [n.p[0] - n.d[0] * 0.05, n.p[1] - n.d[1] * 0.05, n.p[2] - n.d[2] * 0.05];
    const mid = [(t[0] + e[0]) / 2, Math.max(t[1], e[1]) + 0.04, (t[2] + e[2]) / 2];
    return F(H([[t[0] + 0.04, t[1], t[2]], mid, e]), n.f);
  };
  const order = [[4, '33'], [5, '34'], [2, '35'], [3, '36'], [0, '37'], [1, '38']];
  order.forEach(([i, ref]) => P(ref, toNozzle(NOZ[i]), [0, 0.08, 0]));

  // 40 — coudes 90° FNPT-JIC ; 42 — supports de buse ; 41 — rondelles frein ; 43 — buses V-1/2
  NOZ.forEach((n) => {
    const d = new THREE.Vector3(...n.d).normalize();
    const p = new THREE.Vector3(...n.p);
    const e = p.clone().addScaledVector(d, -0.035);
    P('40', F(along(jicElbow(S, THREE, 8), n.d.map((v) => -v), e.toArray()), n.f), n.d.map((v) => -v * 0.08));
    // support : équerre percée, fixée au châssis ou au capot
    const br = group(box(0.05, 0.004, 0.05, 'zinc'), at(box(0.004, 0.05, 0.05, 'zinc'), [-0.025, -0.025, 0]));
    br.quaternion.copy(q(n.d));
    br.position.copy(p.clone().addScaledVector(d, -0.012));
    P('42', F(br, n.f), n.d.map((v) => -v * 0.12));
    for (const s of [-1, 1]) {
      const w = splitWasher(S, THREE, 0.5);
      w.quaternion.copy(q(n.d));
      w.position.copy(p.clone().addScaledVector(d, s * 0.006 - 0.004));
      P('41', F(w, n.f), n.d.map((v) => v * 0.05 * s));
    }
    const nz = lathe([[0, 0], [0.011, 0], [0.011, 0.012], [0.016, 0.012], [0.016, 0.024], [0.012, 0.03], [0.0085, 0.038], [0.0085, 0.044], [0.004, 0.044], [0, 0.044]], 'brass', { seg: 18 });
    nz.quaternion.copy(q(n.d));
    nz.position.copy(p.clone().addScaledVector(d, -0.01));
    // capuchon anti-poussière en caoutchouc rouge
    const cap = lathe([[0, 0], [0.0105, 0], [0.0105, 0.008], [0, 0.009]], 'red', { seg: 14 });
    cap.quaternion.copy(q(n.d));
    cap.position.copy(p.clone().addScaledVector(d, 0.034));
    P('43', F(group(nz, cap), n.f), n.d.map((v) => v * 0.1));
  });

  // 45 — passe-fils à 3 trous (35) : aux traversées de tôle des câbles et flexibles
  const grom = (p, f) => F(at(group(lathe([[0.006, -0.004], [0.016, -0.004], [0.016, 0.004], [0.006, 0.004]], 'rubber', { seg: 16 }),
    ...[0, 1, 2].map((k) => at(cyl(0.003, 0.009, 'black', { seg: 8 }), [Math.cos(k * 2.1) * 0.006, 0, Math.sin(k * 2.1) * 0.006]))), p), f);
  const gp = [];
  const along3 = (a, b, n) => { for (let i = 1; i <= n; i++) gp.push({ p: a.map((v, k) => v + ((b[k] - v) * i) / (n + 1)) }); };
  along3([-3.9, 1.03, 0.58], [-3.35, 1.1, 0.46], 2);
  along3([-3.3, 1.02, 0.2], [-0.9, 0.93, 0.3], 6);
  along3([-3.2, 1.35, 0.45], [-2.62, 1.5, 0.35], 2);
  along3([-1.5, 0.95, -0.5], [-4.2, 1.02, -0.85], 7);
  along3([-1.5, 0.95, 0.45], [-2.95, 1.1, 0.72], 5);
  along3([-0.95, 0.96, 0.2], [-0.25, 0.92, 0.25], 2);
  along3([-0.6, 1.2, 0.85], [-0.3, 1.55, 0.86], 2);
  along3([-2.5, 0.96, 0.1], [-0.9, 0.92, -0.2], 4);
  along3([-3.6, 1.15, -0.9], [-3.0, 1.15, -0.9], 2);
  gp.push({ p: [0.1, 0.9, -0.3], f: true }, { p: [0.25, 0.92, 0.5], f: true }, { p: [0.75, 1.1, 0.8], f: true });
  gp.slice(0, 35).forEach((g) => P('45*', grom(g.p, g.f), [0, -0.05, 0]));
  return { view: { dir: [0.9, 0.7, 1.1] } };
}
