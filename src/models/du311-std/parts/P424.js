// P424 — Porte gauche du compartiment du compresseur CX008818 rév. 7 (page
// 424) : « LEFT COMP DOOR ASSEMBLY », repère 22 du capot P422. Porte en tôle
// 12 ga (1) de toute la longueur du flanc gauche du capot : peau à dessus
// incliné (plus haute à l'avant, coin arrière arrondi), grande découpe en
// « Ω » (cercle Ø 0,66 m débouchant sur le bas par deux congés) autour de la
// grille du volant ventilé du surpresseur, bords tombés sur tout le pourtour,
// aile arrière de 0,5 m repliée à 90° qui ferme le coin arrière gauche du
// capot, raidisseur oméga horizontal au-dessus du cercle. Deux charnières (2)
// sur le chant avant ; serrure rotative droite (3) dans l'angle de l'aile,
// reliée par la tringle (4) à la poignée à palette encastrée (5) et à sa
// plaque (6) ; quatre panneaux de mousse acoustique à pellicule de mylar (7 à
// 10) dont les chants sont fermés au ruban de mylar de 2 po (11).
// Repère : origine sur l'axe vertical des charnières (x = CAN.hx = -2.782,
// z = -CAN.hz = -0.926 dans la machine) au niveau du bas de la porte
// (y = CAN.yb = 1.01) ; axes parallèles au repère machine (X vers l'avant, Y
// vers le haut, Z vers la droite) : la porte s'étend vers -X, sa peau en
// z = -0.034, l'aile arrière vers +Z. P422 la pose par translation.
// Encombrement 1.37 (X) × 0.965 (Y) × 0.50 (Z) m.
// Cotes : vues de la page 424 à l'échelle de la longueur du capot (1,37 m) —
// cercle à 0,60 m du chant avant et 0,32 m au-dessus du bas, ouverture de
// 0,98 m au bas, poignée à 1,12 m du chant avant et 0,18 m du bas, plaque de
// 0,14 × 0,20 m, charnières à 0,19 et 0,69 m du bas ; quincaillerie Eberhard
// d'après les catalogues (palette 4,6 × 3,4 po, serrure 2,1 × 3,4 po).

import {
  CAN, I, arcPts, area2, omega, inset, rrect, sheetGeo, sweepGeo, xform, meshOf, flangeProfile, hatProfile,
  doorFrame, basis, cross, neg, hinge, rotaryLatch, paddleHandle, foamGeo, tapeGeo, carriage,
} from './_reara.js';

const S_ = -1; // côté gauche
const L = CAN.L, vF = CAN.vF, vR = CAN.vR, t = CAN.t, ro = CAN.ro;
const top = (u) => vF - ((vF - vR) * u) / L;
// Découpe en Ω (axe du volant ventilé)
const UC = CAN.xf - CAN.fan.x, VC = 0.32, RC = CAN.fan.r, B = 0.49;
const WING = CAN.leftWing, RT = 0.012; // aile arrière ; rayon du coin arrière supérieur
const HANDLE = [1.12, 0.18], PLATE = [1.28, 0.21, 0.14, 0.2], LATCH = [L - t, 0.22, 0.078];

export default function P424(api) {
  const { THREE, S } = api;
  const { at, group, merged } = S;
  const P_ = (ref, obj, e) => api.part(ref, obj, e);
  const F = doorFrame(THREE, S_);
  const E = (du, dv, dw) => [0, 1, 2].map((k) => F.D.u[k] * du + F.D.v[k] * dv + F.D.w[k] * dw);
  const place = (obj, u, v, w, y, z) => { // axe local Y selon y, Z selon z (directions machine)
    const x = cross(y, z);
    const g = new THREE.Group(); g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z)));
    g.position.set(...F.P(u, v, w));
    return g;
  };
  const D = (g) => xform(g, F.m);

  // ---------------------------------------------------------------- 1 — porte soudée
  // Contour de la peau (u, v), sens trigonométrique : bas avant, Ω, bas arrière,
  // chant arrière, coin arrondi, dessus incliné, chant avant.
  const al = Math.atan2(vF - vR, L);
  const cv = vR + RT * Math.tan(al) - RT / Math.cos(al);
  const om = omega(UC, VC, RC, B);
  const out = [[0, 0]];
  const iLF = out.length; out.push(...om);
  const iRF = out.length - 1;
  out.push([L, 0]); const iBR = out.length - 1;
  const arc = arcPts(L - RT, cv, RT, 0, Math.PI / 2 - al, 4);
  out.push(...arc); const iA0 = iBR + 1;
  out.push([0, vF]); const iFT = out.length - 1;
  if (area2(out) <= 0) throw new Error('P424 : contour à l\'envers');
  // Découpe de la cuvette de la poignée.
  const cup = rrect(I(4.6 - 0.7), I(3.4 - 0.7), I(0.25), 4, HANDLE[0], HANDLE[1]);
  const skin = sheetGeo(THREE, inset(out, ro), [cup], t, { bevel: false });
  const fl = (i0, i1, prof) => sweepGeo(THREE, out, prof, { i0, i1, loop: true });
  const R = flangeProfile(t, ro, CAN.ret);
  const geos = [
    skin,
    fl(0, iLF, R),
    fl(iLF, iRF, flangeProfile(t, ro, 0.02)),
    fl(iRF, iBR, R),
    fl(iBR, iA0, flangeProfile(t, ro, WING, { lip: 0.025 })), // aile arrière
    fl(iA0, iFT, flangeProfile(t, ro, CAN.leftTop, { lip: 0.02 })), // retour supérieur
    fl(iFT, 0, R),
  ];
  // Fermeture du haut de l'aile (retour de 30 mm vers l'avant).
  geos.push(xform(sheetGeo(THREE, [[CAN.leftTop, -0.03], [WING, -0.03], [WING, 0], [CAN.leftTop, 0]], [], t, { z0: 0 }), basis(THREE, [L - t, cv, 0], [0, 0, 1], [1, 0, 0], [0, -1, 0])));
  // Raidisseur oméga 14 ga au-dessus du cercle, de l'avant à l'aile.
  const VS = 0.72;
  geos.push(sweepGeo(THREE, [[0.03, VS], [L - 0.012, VS]], hatProfile(0.025, 0.018, 0.015, 0.0019).map(([a, z]) => [a, z + t])));
  // Patte du ressort de maintien (P422 rep. 19) : équerre soudée sous le raidisseur.
  geos.push(xform(sheetGeo(THREE, rrect(0.04, 0.05, 0.004, 2), [], I(3 / 16)), basis(THREE, [0.37, 0.82, t], [1, 0, 0], [0, 1, 0], [0, 0, 1])));
  geos.push(xform(sheetGeo(THREE, rrect(0.04, 0.03, 0.004, 2), [], I(3 / 16)), basis(THREE, [0.37, 0.82 - 0.025, t + 0.015], [1, 0, 0], [0, 0, 1], [0, -1, 0])));
  // Platine de la serrure soudée dans l'angle de l'aile (tôle 3/16 po).
  geos.push(xform(sheetGeo(THREE, rrect(0.11, 0.13, 0.006, 2), [], I(3 / 16)), basis(THREE, [L - t, LATCH[1] - 0.03, 0.06], [0, 0, 1], [0, 1, 0], [-1, 0, 0])));
  const doorMesh = meshOf(api, geos.map(D), 'lightGrey', 0.35);
  P_('1', group(doorMesh), [0, 0, -0.25]);

  // ---------------------------------------------------------------- 2 — charnières (deux)
  // Aile A sur la face avant du montant 10 (en retrait de 5 mm), aile B sur le
  // retour avant de la porte ; nœud devant la face avant du capot.
  for (const v of [0.19, 0.69]) {
    P_('2', at(hinge(api, { dA: -0.005, nutsA: false, sz: 1 }), [0, v, 0]), [0.09, 0, 0]);
  }

  // ---------------------------------------------------------------- 3 — serrure rotative droite
  // Sur la platine de l'aile, fente ouverte vers l'intérieur du capot (+w),
  // boîtier vers l'avant : la gâche du montant arrière 4 (P422) y entre.
  P_('3', place(rotaryLatch(api, 1), LATCH[0] - I(3 / 16), LATCH[1], LATCH[2], F.D.w, neg(F.D.u)), E(-0.08, 0, 0.12));

  // ---------------------------------------------------------------- 5 — poignée à palette
  // Collerette sur la peau, cuvette vers l'intérieur ; X local le long de la porte.
  const handle = paddleHandle(api);
  const hx = F.D.u, hz = neg(F.D.w); // X local = +u, Z local = vers l'extérieur
  const hy = cross(hz, hx);
  const hg = new THREE.Group(); hg.add(handle);
  hg.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...hx), new THREE.Vector3(...hy), new THREE.Vector3(...hz)));
  hg.position.set(...F.P(HANDLE[0], HANDLE[1], 0));
  P_('5', hg, E(0, 0, -0.15));

  // ---------------------------------------------------------------- 4 — tringle de la palette
  // Tige Ø 1/4 po coudée : levier de la poignée → levier de déclenchement de la serrure.
  const a0 = F.P(HANDLE[0] + I(2.1), HANDLE[1] + I(0.3), I(1.55));
  const a1 = F.P(HANDLE[0] + 0.1, HANDLE[1] + I(0.3), 0.05);
  const a2 = F.P(LATCH[0] - 0.035, LATCH[1] - I(1.53), 0.05);
  const a3 = F.P(LATCH[0] - 0.035, LATCH[1] - I(1.53), LATCH[2] + I(1.4));
  const rod = S.tube([a0, a1, a2, a3], I(0.125), 'zinc', { sharp: true, seg: 3, radial: 10, ends: 'none' });
  const eyes = [a0, a3].map((p) => at(S.ring(I(0.3), I(0.14), I(0.12), 'zinc', { axis: 'x', seg: 14 }), p));
  P_('4', group(rod, merged(eyes, 'zinc')), E(0, -0.06, 0.1));

  // ---------------------------------------------------------------- 6 — plaque extérieure
  // Tôle 10 ga aux coins arrondis, quatre boulons de carrosserie 1/4 po.
  const [pu, pv, pw, ph] = PLATE;
  const plate = meshOf(api, [D(sheetGeo(THREE, rrect(pw, ph, 0.012, 4, pu, pv), [], I(0.135), { z0: -I(0.135) }))], 'lightGrey');
  const heads = [];
  for (const du of [-1, 1]) for (const dv of [-1, 1]) {
    heads.push(place(carriage(S, 0.25, 0.75), pu + du * (pw / 2 - 0.016), pv + dv * (ph / 2 - 0.016), -I(0.135), neg(F.D.w), F.D.u));
  }
  P_('6', group(plate, merged(heads, 'zinc')), E(0, 0, -0.1));

  // ---------------------------------------------------------------- 7 à 10 — mousse ; 11 — ruban de mylar
  const d = 0.025, ft = I(1);
  const f7 = [[0.03, d], ...omega(UC, VC, RC, B, d), [L - 0.2, d], [L - 0.2, 0.3], [L - 0.03, 0.3], [L - 0.03, 0.69], [0.03, 0.69]];
  const f8 = [[0.03, 0.76], [L - 0.04, 0.76], [L - 0.04, top(L - 0.04) - 0.03], [0.03, vF - 0.03]];
  const h8 = [rrect(0.08, 0.06, 0.008, 2, 0.37, 0.82)];
  // Mousse de l'aile, dans son plan (x = w, y = v), épaisseur vers l'avant (-u).
  const wingM = basis(THREE, [L - t, 0, 0], [0, 0, 1], [0, 1, 0], [-1, 0, 0]);
  const f9 = [[0.11, 0.03], [WING - 0.03, 0.03], [WING - 0.03, 0.37], [0.11, 0.37]];
  const f10 = rrect(WING - 0.09, vR - 0.47, 0.03, 4, 0.06 + (WING - 0.09) / 2, 0.42 + (vR - 0.47) / 2);
  const foam = (o, h, M = null) => meshOf(api, [D(M ? xform(foamGeo(THREE, o, h, 0, ft), M) : foamGeo(THREE, o, h, t, ft))], 'castAlu', 0.3);
  P_('7', group(foam(f7, [])), E(0, 0, 0.18));
  P_('8', group(foam(f8, h8)), E(0, 0.05, 0.18));
  P_('9', group(foam(f9, [], wingM)), E(-0.15, 0, 0.1));
  P_('10', group(foam(f10, [], wingM)), E(-0.15, 0.05, 0.1));
  const tapes = [tapeGeo(THREE, f7, t, ft), tapeGeo(THREE, f8, t, ft), ...h8.map((h) => tapeGeo(THREE, h, t, ft, { hole: true })),
    xform(tapeGeo(THREE, f9, 0, ft), wingM), xform(tapeGeo(THREE, f10, 0, ft), wingM)];
  P_('11', group(meshOf(api, tapes.map(D), 'zinc', 0.3)), E(0, 0, 0.24));

  return { view: { dir: [-0.6, 0.45, -1.2] } };
}
