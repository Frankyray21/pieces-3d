// P426 — Porte du dessus du compartiment du compresseur CX008825 rév. 5 (page
// 426) : « TOP COMPARTMENT DOOR ASSEMBLY », repère 1 du capot P422. Porte en
// tôle 12 ga (1) qui couvre le dessus du capot du retour de la porte gauche
// jusqu'à la baie d'évacuation d'air (1,33 m × 1,37 m), bord arrière décroché
// au-dessus de l'aile de la porte gauche ; bords tombés sur tout le pourtour,
// raidisseur oméga longitudinal au milieu et raidisseur transversal à 0,41 m
// du bord arrière (ligne des serrures). Charnières (2, deux) au chant avant ;
// deux serrures rotatives gauches (3) sur platines, reliées par une barre de
// manœuvre (4 + 5 : cinq guides, barre avec biellettes et tirette dépassant
// dans la baie ouverte) que rappelle un ressort de traction Ø 7/16 × 2 3/4 po
// (7) ; deux plaques extérieures (6) au droit des serrures ; trois panneaux de
// mousse acoustique (8 à 10) et ruban de mylar (11). Pattes des vérins à gaz
// (P422 rep. 14) soudées sous la peau à 0,30 m du chant avant.
// Repère : origine sur l'axe des charnières (le long de Z ; x = CAN.hx =
// -2.782, y = CAN.hy = 1.941 dans la machine), axes parallèles au repère
// machine porte posée à plat : la porte s'étend vers -X, sa peau dessus en
// y = +0.034, de z = -0.91 à +0.42 ; P422 l'incline de CAN.slope (4,8°)
// autour de Z (bord arrière vers le bas).
// Encombrement 1.37 (X) × 0.13 (Y) × 1.33 (Z) m.
// Cotes : vues de la page 426 à l'échelle du capot (largeur 1,33 m) —
// serrures à 0,41 m du bord arrière et à z = -0.42 / +0.23, plaques de
// 0,10 × 0,14 m, charnières à z = -0.75 / +0.27 ; ressort d'après la liste.

import {
  CAN, I, area2, inset, rrect, sheetGeo, sweepGeo, xform, meshOf, flangeProfile, hatProfile,
  topFrame, basis, cross, neg, hinge, rotaryLatch, foamGeo, tapeGeo, carriage, circ,
} from './_reara.js';

const L = CAN.L, t = CAN.t, ro = CAN.ro;
const [Z0, Z1] = CAN.topZ;
const US = L - 0.41; // ligne des serrures (raidisseur transversal)
const LATCHES = [-0.42, 0.23], WPIN = 0.085;
const UBAR = US - 0.045, WBAR = 0.05;

export default function P426(api) {
  const { THREE, S } = api;
  const { at, group, merged } = S;
  const P_ = (ref, obj, e) => api.part(ref, obj, e);
  const F = topFrame(THREE);
  const E = (du, dv, dw) => [0, 1, 2].map((k) => F.D.u[k] * du + F.D.v[k] * dv + F.D.w[k] * dw);
  const place = (obj, u, v, w, y, z) => {
    const x = cross(y, z);
    const g = new THREE.Group(); g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z)));
    g.position.set(...F.P(u, v, w));
    return g;
  };
  const D = (g) => xform(g, F.m);
  const tb = I(3 / 16);

  // ---------------------------------------------------------------- 1 — porte soudée
  const out = [[0, Z0], [L, Z0], [L, -0.44], [L - 0.03, -0.44], [L - 0.03, Z1], [0, Z1]];
  if (area2(out) <= 0) throw new Error('P426 : contour à l\'envers');
  const geos = [sheetGeo(THREE, inset(out, ro), [], t, { bevel: false })];
  geos.push(sweepGeo(THREE, out, flangeProfile(t, ro, CAN.ret), { closed: true, loop: true }));
  // Raidisseurs oméga : longitudinal (14 ga) au milieu, transversal (12 ga, plus haut) aux serrures.
  geos.push(sweepGeo(THREE, [[0.04, -0.245], [US - 0.03, -0.245]], hatProfile(0.025, 0.018, 0.015, 0.0019).map(([a, z]) => [a, z + t])));
  geos.push(sweepGeo(THREE, [[US, Z0 + 0.03], [US, Z1 - 0.03]], hatProfile(0.04, 0.035, 0.018, t).map(([a, z]) => [a, z + t])));
  // Platines des serrures (plan (v, w)) sur l'âme arrière du raidisseur transversal.
  for (const v of LATCHES) {
    geos.push(xform(sheetGeo(THREE, rrect(0.11, 0.1, 0.006, 2, 0, 0.05 + t), [circ(0.04, 0.047, 0.005, 10)], tb), basis(THREE, [US + 0.022, v, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0])));
  }
  // Pattes des vérins à gaz : plaques verticales (plan (u, w)) percées pour la rotule.
  for (const v of [-0.86, 0.36]) {
    geos.push(xform(sheetGeo(THREE, rrect(0.05, 0.045, 0.006, 2, 0, 0.0225 + t), [circ(0, 0.032 + t, 0.0052, 12)], tb), basis(THREE, [0.3, v - tb / 2, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0])));
  }
  P_('1', group(meshOf(api, geos.map(D), 'lightGrey', 0.35)), [0, 0.3, 0]);

  // ---------------------------------------------------------------- 2 — charnières (deux)
  // Axe le long de Z, ailes dans le plan de la face avant : aile A vers le bas
  // sur la traverse avant (en retrait de 5 mm), aile B sur le retour avant.
  for (const v of [-0.75, 0.27]) {
    const g = new THREE.Group(); g.add(hinge(api, { dA: -0.005, nutsA: false }));
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0)));
    g.position.set(0, 0, v);
    P_('2', g, [0.09, 0, 0]);
  }

  // ---------------------------------------------------------------- 3 — serrures rotatives gauches (deux)
  // Fente vers le bas (+w), boîtier vers l'arrière ; les gâches de la tôle
  // pliée 5 de P422 y entrent par l'arrière quand la porte se ferme.
  for (const v of LATCHES) P_('3', place(rotaryLatch(api, -1), US + 0.022 + tb, v, WPIN, F.D.w, F.D.u), E(0.06, 0, 0.14));

  // ---------------------------------------------------------------- 4 — guides de la barre (cinq)
  // Équerres zinguées vissées sur l'âme avant du raidisseur, lumière oblongue
  // dans l'aile horizontale où coulisse la barre.
  const guides = [-0.8, -0.52, -0.16, 0.1, 0.36];
  for (const v of guides) {
    const up = meshOf(api, [xform(sheetGeo(THREE, rrect(0.035, 0.028, 0.003, 2, 0, t + 0.04), [], I(0.105)), basis(THREE, [US - 0.0219 - I(0.105), v, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0]))].map(D), 'zinc');
    const foot = meshOf(api, [sheetGeo(THREE, rrect(0.05, 0.035, 0.003, 2, US - 0.022 - 0.025, v), [], I(0.105), { z0: WBAR + 0.004 })].map(D), 'zinc');
    const screws = [-1, 1].map((k) => place(carriage(S, 0.19, 0.5), US - 0.0219 - I(0.105), v + k * 0.01, t + 0.032, neg(F.D.u), F.D.v));
    P_('4', group(up, foot, merged(screws, 'zinc')), E(-0.05, 0, 0.1));
  }

  // ---------------------------------------------------------------- 5 — barre de manœuvre
  // Plat 1 × 3/16 po le long de Z sous le raidisseur, deux biellettes Ø 1/4 po
  // vers les leviers des serrures, tirette coudée qui dépasse dans la baie.
  const bar = S.box(0.0254, tb, Z1 + 0.04 - (-0.82), 'zinc', { r: 0.001 });
  const barG = place(bar, UBAR, (-0.82 + Z1 + 0.04) / 2, WBAR + 0.004 - tb / 2, neg(F.D.w), F.D.v);
  const links = LATCHES.map((v) => S.tube([F.P(UBAR, v + 0.06, WBAR), F.P(US + 0.04, v + 0.06, WBAR)], I(0.125), 'zinc', { sharp: true, seg: 2, radial: 10, ends: 'none' }));
  const pull = S.tube([F.P(UBAR, Z1 + 0.035, WBAR), F.P(UBAR, Z1 + 0.06, WBAR + 0.01), F.P(UBAR, Z1 + 0.07, WBAR + 0.04)], I(0.19), 'zinc', { seg: 12, radial: 10, ends: 'none' });
  const knob = at(S.ball(0.011, 'black'), F.P(UBAR, Z1 + 0.07, WBAR + 0.05));
  P_('5', group(merged([barG, ...links, pull], 'zinc'), knob), E(0, 0, 0.2));

  // ---------------------------------------------------------------- 7 — ressort de traction Ø 7/16 × 2 3/4 po, fil 0,048 po
  // Corps à spires jointives centré, crochets aux deux bouts (entre la patte du
  // premier guide et l'arrêt de la barre).
  const sp = S.spring(I(7 / 32) - I(0.024), I(0.024), I(2.2), 36, 'steel', { axis: 'y', perTurn: 10, radial: 6 });
  const hooks = [-1, 1].map((k) => at(S.torus(I(0.16), I(0.024), 'steel', { axis: 'x' }), [0, k * (I(1.1) + I(0.16)), 0]));
  P_('7', place(group(sp, ...hooks), UBAR, -0.86 + I(1.4), WBAR + 0.012, F.D.v, F.D.w), E(0, -0.05, 0.15));

  // ---------------------------------------------------------------- 6 — plaques extérieures (deux)
  for (const v of LATCHES) {
    const pl = meshOf(api, [D(sheetGeo(THREE, rrect(0.1, 0.14, 0.01, 4, US, v), [], I(0.135), { z0: -I(0.135) }))], 'lightGrey');
    const heads = [];
    for (const du of [-1, 1]) for (const dv of [-1, 1]) heads.push(place(carriage(S, 0.25, 0.75), US + du * 0.036, v + dv * 0.056, -I(0.135), neg(F.D.w), F.D.u));
    P_('6', group(pl, merged(heads, 'zinc')), [0, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 8 à 10 — mousse ; 11 — ruban
  const ft = I(1);
  const f9 = [[0.04, -0.83], [US - 0.035, -0.83], [US - 0.035, -0.275], [0.04, -0.275]];
  const f8 = [[0.04, -0.215], [US - 0.035, -0.215], [US - 0.035, 0.33], [0.04, 0.33]];
  const f10 = [[US + 0.05, Z0 + 0.03], [L - 0.065, Z0 + 0.03], [L - 0.065, Z1 - 0.03], [US + 0.05, Z1 - 0.03]];
  const foam = (o) => meshOf(api, [D(foamGeo(THREE, o, [], t, ft))], 'castAlu', 0.3);
  P_('8', group(foam(f8)), [0, -0.2, 0.05]);
  P_('9', group(foam(f9)), [0, -0.2, -0.05]);
  P_('10', group(foam(f10)), [-0.05, -0.2, 0]);
  P_('11', group(meshOf(api, [f8, f9, f10].map((o) => D(tapeGeo(THREE, o, t, ft))), 'zinc', 0.3)), [0, -0.26, 0]);

  return { view: { dir: [-0.8, -0.7, 1.0] } };
}
