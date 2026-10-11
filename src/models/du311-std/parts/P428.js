// P428 — Porte droite du compartiment du compresseur CX008831 rév. 6 (page
// 428) : « RIGHT COMP DOOR ASSEMBLY », repère 23 du capot P422. Porte en tôle
// 12 ga (1) de toute la longueur du flanc droit : peau à dessus incliné (coin
// arrière arrondi), grille « brique » de 97 trous oblongs en quinconce côté
// charnières (prise d'air du refroidisseur), échancrure au bas du chant
// arrière ; large retour supérieur de 0,2 m qui couvre le dessus du capot
// côté droit et se prolonge, par le coin arrondi, en aile arrière sur les
// deux tiers supérieurs ; bords tombés sur le reste du pourtour ; raidisseurs
// oméga vertical (entre la grille et la serrure) et horizontal (au-dessus de
// la grille). Deux charnières (2) au chant avant ; serrure rotative droite (3)
// sur une platine au milieu du bas, tringle (4) vers la poignée à palette
// encastrée (5), plaque extérieure (6) ; mousse acoustique (7 à 10) et ruban
// de mylar de 2 po (11).
// Repère : origine sur l'axe vertical des charnières (x = CAN.hx = -2.782,
// z = +CAN.hz = 0.926 dans la machine) au niveau du bas de la porte
// (y = CAN.yb = 1.01) ; axes parallèles au repère machine : la porte s'étend
// vers -X, sa peau en z = +0.034, retours et aile vers -Z. P422 la pose par
// translation. Encombrement 1.37 (X) × 0.965 (Y) × 0.20 (Z) m.
// Cotes : vues de la page 428 à l'échelle de la longueur du capot (1,37 m) —
// grille de 0,64 × 0,54 m à 0,07 m du chant avant et 0,107 m du bas (trous
// 85 × 28 mm au pas de 91 × 42,5 mm), échancrure de 0,126 × 0,37 m, poignée à
// 0,96 m du chant avant et 0,175 m du bas, plaque de 0,14 × 0,21 m, serrure à
// 0,83 m, charnières à 0,19 et 0,68 m du bas, aile arrière jusqu'à 0,37 m du bas.

import {
  CAN, I, arcPts, area2, inset, rrect, bricks, sheetGeo, sweepGeo, xform, meshOf, flangeProfile, hatProfile,
  doorFrame, basis, cross, neg, hinge, rotaryLatch, paddleHandle, foamGeo, tapeGeo, carriage,
} from './_reara.js';

const S_ = 1; // côté droit
const L = CAN.L, vF = CAN.vF, vR = CAN.vR, t = CAN.t, ro = CAN.ro;
const top = (u) => vF - ((vF - vR) * u) / L;
const WT = CAN.rightTop, RT = 0.04, NU = 0.126, NV = 0.37;
const HANDLE = [0.96, 0.175], PLATE = [0.79, 0.215, 0.14, 0.21], LATCH = [0.83, 0.155, 0.08];

export default function P428(api) {
  const { THREE, S } = api;
  const { at, group, merged } = S;
  const P_ = (ref, obj, e) => api.part(ref, obj, e);
  const F = doorFrame(THREE, S_);
  const E = (du, dv, dw) => [0, 1, 2].map((k) => F.D.u[k] * du + F.D.v[k] * dv + F.D.w[k] * dw);
  const place = (obj, u, v, w, y, z) => {
    const x = cross(y, z);
    const g = new THREE.Group(); g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z)));
    g.position.set(...F.P(u, v, w));
    return g;
  };
  const D = (g) => xform(g, F.m);

  // ---------------------------------------------------------------- 1 — porte soudée
  const al = Math.atan2(vF - vR, L);
  const cv = vR + RT * Math.tan(al) - RT / Math.cos(al);
  const out = [[0, 0], [L - NU, 0], [L - NU, NV], [L, NV]];
  out.push(...arcPts(L - RT, cv, RT, 0, Math.PI / 2 - al, 6));
  out.push([0, vF]);
  const iFT = out.length - 1;
  if (area2(out) <= 0) throw new Error('P428 : contour à l\'envers');
  const cup = rrect(I(4.6 - 0.7), I(3.4 - 0.7), I(0.25), 4, HANDLE[0], HANDLE[1]);
  const grille = bricks(0.07, 0.107, 0.64, 0.54);
  const skin = sheetGeo(THREE, inset(out, ro), [...grille, cup], t, { bevel: false, curve: 4 });
  const fl = (i0, i1, prof) => sweepGeo(THREE, out, prof, { i0, i1, loop: true });
  const R = flangeProfile(t, ro, CAN.ret);
  const geos = [
    skin,
    fl(0, 1, R), fl(1, 2, R), fl(2, 3, R),
    fl(3, iFT, flangeProfile(t, ro, WT, { lip: 0.025 })), // aile arrière, coin arrondi et retour supérieur
    fl(iFT, 0, R),
  ];
  // Raidisseurs oméga 14 ga : vertical entre grille et serrure, horizontal au-dessus de la grille.
  const hat = hatProfile(0.025, 0.018, 0.015, 0.0019).map(([a, z]) => [a, z + t]);
  geos.push(sweepGeo(THREE, [[0.735, 0.03], [0.735, top(0.735) - 0.012]], hat));
  geos.push(sweepGeo(THREE, [[0.03, 0.68], [0.705, 0.68]], hat));
  // Patte du ressort de maintien (P422 rep. 19).
  geos.push(sheetGeo(THREE, rrect(0.04, 0.05, 0.004, 2), [], I(3 / 16), { z0: t }).translate(0.37, 0.82, 0));
  geos.push(xform(sheetGeo(THREE, rrect(0.04, 0.03, 0.004, 2), [], I(3 / 16)), basis(THREE, [0.37, 0.795, t + 0.015], [1, 0, 0], [0, 0, 1], [0, -1, 0])));
  // Platine de la serrure : équerre soudée sur la peau, aile dans le plan (v, w) à u = 0.84.
  geos.push(xform(sheetGeo(THREE, rrect(0.1, 0.12, 0.006, 2), [], I(3 / 16)), basis(THREE, [LATCH[0] + 0.01, LATCH[1] - 0.02, 0.06], [0, 0, 1], [0, 1, 0], [-1, 0, 0])));
  geos.push(sheetGeo(THREE, rrect(0.04, 0.12, 0.004, 2), [], I(3 / 16), { z0: t }).translate(LATCH[0] + 0.03, LATCH[1] - 0.02, 0));
  P_('1', group(meshOf(api, geos.map(D), 'lightGrey', 0.35)), [0, 0, 0.25]);

  // ---------------------------------------------------------------- 2 — charnières (deux)
  for (const v of [0.19, 0.68]) {
    P_('2', at(hinge(api, { dA: -0.005, nutsA: false, sz: -1 }), [0, v, 0]), [0.09, 0, 0]);
  }

  // ---------------------------------------------------------------- 3 — serrure rotative droite
  // Sur la face avant de la platine, fente vers l'intérieur (+w) : la gâche de
  // la tôle pliée 21 de P422 y entre par l'avant.
  P_('3', place(rotaryLatch(api, 1), LATCH[0] + 0.01 - I(3 / 16), LATCH[1], LATCH[2], F.D.w, neg(F.D.u)), E(0, 0, 0.12));

  // ---------------------------------------------------------------- 5 — poignée à palette
  const hx = neg(F.D.u), hz = neg(F.D.w); // X local vers l'avant, Z local vers l'extérieur
  const hy = cross(hz, hx);
  const hg = new THREE.Group(); hg.add(paddleHandle(api));
  hg.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...hx), new THREE.Vector3(...hy), new THREE.Vector3(...hz)));
  hg.position.set(...F.P(HANDLE[0], HANDLE[1], 0));
  P_('5', hg, E(0, 0, -0.15));

  // ---------------------------------------------------------------- 4 — tringle
  const a0 = F.P(HANDLE[0] - I(2.1), HANDLE[1] + I(0.3), I(1.55));
  const a1 = F.P(HANDLE[0] - 0.06, HANDLE[1] + I(0.3), 0.045);
  const a2 = F.P(LATCH[0] + 0.03, LATCH[1] - I(1.53), 0.045);
  const a3 = F.P(LATCH[0] + 0.03, LATCH[1] - I(1.53), LATCH[2] + I(1.4));
  const rod = S.tube([a0, a1, a2, a3], I(0.125), 'zinc', { sharp: true, seg: 3, radial: 10, ends: 'none' });
  const eyes = [a0, a3].map((p) => at(S.ring(I(0.3), I(0.14), I(0.12), 'zinc', { axis: 'x', seg: 14 }), p));
  P_('4', group(rod, merged(eyes, 'zinc')), E(0, -0.06, 0.1));

  // ---------------------------------------------------------------- 6 — plaque extérieure
  const [pu, pv, pw, ph] = PLATE;
  const plate = meshOf(api, [D(sheetGeo(THREE, rrect(pw, ph, 0.012, 4, pu, pv), [], I(0.135), { z0: -I(0.135) }))], 'lightGrey');
  const heads = [];
  for (const du of [-1, 1]) for (const dv of [-1, 1]) {
    heads.push(place(carriage(S, 0.25, 0.75), pu + du * (pw / 2 - 0.016), pv + dv * (ph / 2 - 0.016), -I(0.135), neg(F.D.w), F.D.u));
  }
  P_('6', group(plate, merged(heads, 'zinc')), E(0, 0, -0.1));

  // ---------------------------------------------------------------- 7 à 10 — mousse ; 11 — ruban
  // Pas de mousse sur la grille (passage d'air). 9 au-dessus de la grille
  // (évidement autour de la patte du ressort), 7 en haut à l'arrière, 8 en bas
  // à l'arrière (échancrée autour de la serrure), 10 sur l'aile.
  const ft = I(1);
  const f9 = [[0.04, 0.71], [0.71, 0.71], [0.71, top(0.71) - 0.03], [0.04, top(0.04) - 0.03]];
  const h9 = [rrect(0.08, 0.06, 0.008, 2, 0.37, 0.82)];
  const f7 = [[0.76, 0.4], [L - 0.03, 0.4], [L - 0.03, top(L - 0.03) - 0.04], [0.76, top(0.76) - 0.03]];
  const f8 = [[0.94, 0.03], [L - NU - 0.03, 0.03], [L - NU - 0.03, 0.37], [0.76, 0.37], [0.76, 0.3], [0.94, 0.3]];
  const wingM = basis(THREE, [L - t, 0, 0], [0, 0, 1], [0, 1, 0], [-1, 0, 0]);
  const f10 = [[0.03, NV + 0.03], [WT - 0.03, NV + 0.03], [WT - 0.03, vR - 0.06], [0.03, vR - 0.06]];
  const foam = (o, h, M = null) => meshOf(api, [D(M ? xform(foamGeo(THREE, o, h, 0, ft), M) : foamGeo(THREE, o, h, t, ft))], 'castAlu', 0.3);
  P_('7', group(foam(f7, [])), E(0, 0.05, 0.18));
  P_('8', group(foam(f8, [])), E(0, -0.03, 0.18));
  P_('9', group(foam(f9, h9)), E(0, 0.05, 0.18));
  P_('10', group(foam(f10, [], wingM)), E(-0.15, 0, 0.05));
  const tapes = [tapeGeo(THREE, f7, t, ft), tapeGeo(THREE, f8, t, ft), tapeGeo(THREE, f9, t, ft), ...h9.map((h) => tapeGeo(THREE, h, t, ft, { hole: true })),
    xform(tapeGeo(THREE, f10, 0, ft), wingM)];
  P_('11', group(meshOf(api, tapes.map(D), 'zinc', 0.3)), E(0, 0, 0.24));

  return { view: { dir: [-0.6, 0.45, 1.2] } };
}
