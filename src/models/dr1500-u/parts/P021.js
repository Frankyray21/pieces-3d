// P021 — Serre-tiges Boyles 12HH, 055B (dessin X-Spec B1686, pages 21 et 22 : éclaté, coupe, liste de 33 repères ;
// ligne « p. 24 » : plaque support et bague de guidage, P024).
//
// REPÈRE LOCAL (layout.js, RC) : origine sur l'axe de forage au milieu du corps (carter 55-0040 + cylindre + chapeau
// de cylindre, d 2,42 à 12,5 : milieu à d = DM = 7,46) ; X le long de l'axe, +X = dessus du serre-tiges (adaptateur de
// chapeau, plaque support P024, vers le trou) ; oreille du carter côté +Z, sur la pin de la base, sous l'axe
// (RC.earZ, RC.earY) ; patte à deux lumières des boulons à œil et poignée côté −Z. Construit en « colonne »
// (_boyles.js, sx = −1) : d (pouces) compté depuis le dessus de l'adaptateur de chapeau, x = (DM − d)·IN.
// Angles φ depuis +Y vers +Z ; le plan de coupe du site (z = 0, φ = 0° et 180°) coupe deux ressorts, une mâchoire,
// un boulon 3/4, une entretoise du bas, un boulon de 8 po et son entretoise du haut, comme la coupe du manuel.
//
// EMPILEMENT (d, pouces) [mesure p. 21 à 75 px/po, et p. 23] : haut commun (_boyles.js : bague 0,17, adaptateur
// 0,33–1,85, porte-chapeau 0,96–2,42, bol 1,96–6,0, mâchoires 1,9–6,15) · carter 2,42–8,47 avec son tube central
// (alésage Ø 3,94, Ø ext. 5,2) jusqu'à 12,5 · piston et cylindre 55-0300 (P023, u = d − 7,85) 7,85–11,85 · chapeau
// de cylindre 55-0044 11,85–12,5 · bague de serrage (clamp bushing B, 55-0052 NQ, hors liste) dans le bout du tube,
// tenue par la retenue 55-0043 et 4 vis 5/16 · plaque support (P024) sur l'adaptateur de chapeau. Longueur hors tout
// 13,6 po (0,345 m : RC.bottom à RC.top dans layout.js).
import { IN, RC } from '../layout.js';
import * as B from './_boyles.js';
import { SHCS4, SHCS2 } from './P023.js';

const { H, PHI, deg } = B;
export const DM = 7.46; // milieu du corps, en d
export const U0 = 7.85; // d du dessus du piston (origine de P023)

export default function P021(api) {
  const { S } = api;
  const C = B.colonne(api, -1);
  const W = (obj) => S.at(S.group(obj), [DM * IN, 0, 0], [0, 0, -Math.PI / 2]);
  const P = (ref, obj, ex) => api.part(ref, W(obj), ex);
  const X = (k, f = null, r = 0) => (f == null ? [k, 0, 0] : [k, r * Math.cos(f), r * Math.sin(f)]);
  /** Point du repère colonne depuis le repère de l'assemblage : y, z (pouces), profondeur d. */
  const loc = (y, z, d) => [C.sx * y * IN, -d * IN, z * IN];

  // --- Haut commun.
  api.add(W(S.group(B.bagueMandrin(C), ...B.machoires(C))));
  P('10', B.adaptateurChapeau(C), X(0.2));
  P('9', B.porteChapeau(C, 'yellow'), X(0.1));
  P('11', B.bol(C), X(0));
  B.entretoisesHaut(C).forEach((o) => P('12', o, X(0.17)));
  const v = B.visserieHaut(C);
  v.bague.forEach((o) => P('1', o, X(0.06)));
  v.b34.forEach((o) => P('5', o, X(0.27)));
  v.porte.forEach((o) => P('2', o, X(0.14)));
  const t = B.boulonsLiaison(C);
  t.court.forEach((o, i) => P('3', o, X(-0.02, PHI.short[i], 0.17)));
  t.long.forEach((o, i) => P('4', o, X(0.06, PHI.long[i], 0.22)));
  B.ressorts(C).forEach((o) => P('19', o, X(-0.13)));
  B.entretoisesBas(C).forEach((o) => P('13', o, X(-0.21)));
  B.jointsRadiaux(C).forEach((o) => P('14', o, X(-0.17)));

  // --- 22 — Carter 55-0040 : tranches percées comme celles du mandrin, tube central (guide du piston, logement de la
  // bague de serrage), taraudages des vis du cylindre ; oreille d'articulation (+Z), patte des boulons à œil et
  // poignée (−Z) [p. 21 : éclaté ; p. 24 : patte à deux lumières ouvertes vers l'extérieur].
  const g = H.hsg;
  const ear = { y: RC.earY / IN, z: RC.earZ / IN, d0: 3.45, d1: 7.45, w: 1.15, rb: 0.625 };
  const eu = [ear.y, ear.z].map((c) => c / Math.hypot(ear.y, ear.z)); // direction axe → pin
  const pts = [];
  pts.push([4.6 * eu[0] - ear.w * eu[1], 4.6 * eu[1] + ear.w * eu[0]]);
  for (let k = 0; k <= 12; k++) {
    const a = Math.atan2(-eu[0], eu[1]) + (k * Math.PI) / 12; // demi-cercle autour de la pin, côté extérieur
    pts.push([ear.y + ear.w * Math.cos(a), ear.z + ear.w * Math.sin(a)]);
  }
  pts.push([4.6 * eu[0] + ear.w * eu[1], 4.6 * eu[1] - ear.w * eu[0]]);
  // Oreille en chape : deux branches de part et d'autre de l'oreille centrale de la base (P025, 2 po d'épaisseur au
  // milieu de la base, sur laquelle l'oreille est centrée : RC.dx).
  const em = (ear.d0 + ear.d1) / 2, eg = 1.0;
  const oreille = S.group(...[[ear.d0, em - eg], [em + eg, ear.d1]].map(([d0, d1]) => C.plan(pts.map(([y, z]) => [C.sx * y * IN, z * IN]), d0, d1, 'yellow', [[C.sx * ear.y * IN, ear.z * IN, ear.rb * IN]])));
  // Patte : bloc sous le flanc −Z, deux lumières verticales (largeur 0,72 po, 1,4 po de profond) à d 4,2 et 6,7.
  const lug = { ...RC.lug, z0: -7.4, z1: -2.6, zs: -6.0 };
  const bloc = (d0, d1, zo) => C.plan([[lug.y0, lug.z1], [lug.y1, lug.z1], [lug.y1, zo], [lug.y0, zo]].map(([y, z]) => [C.sx * y * IN, z * IN]), d0, d1, 'yellow');
  const patte = S.group(bloc(3.2, 3.84, lug.z0), bloc(3.84, 4.56, lug.zs), bloc(4.56, 6.34, lug.z0), bloc(6.34, 7.06, lug.zs), bloc(7.06, 7.7, lug.z0));
  // Poignée en U (rond Ø 3/4) au-dessus de la patte.
  const pg = [[-1.6, -5.6], [-1.6, -7.6], [1.8, -7.6], [1.8, -5.5]].map(([y, z]) => loc(y, z, 5.45));
  const poignee = S.group(
    ...pg.slice(1).map((p, i) => S.rod(pg[i], p, 0.375 * IN, 'yellow', 14)),
    ...pg.slice(1, 3).map((p) => S.at(S.ball(0.375 * IN, 'yellow'), p)),
  );
  P('22', S.group(
    C.slab(g.ro, g.rb, g.d0, 3.6, B.trousCarterHaut(), 'yellow', 96),
    C.slab(g.ro, g.rb, 3.6, g.dP, PHI.springs.map((f) => [g.rp, f, g.ph]), 'yellow', 96),
    C.slab(g.rb + 0.005, 2.6, g.dB, 6.45, B.trousPlancher(true), 'yellow'),
    C.slab(g.rb + 0.005, 2.6, 6.45, 7.85, B.trousPlancher(false), 'yellow'),
    C.slab(g.ro, 4.2, g.dP, 8.47, SHCS4.map((f) => [5.6, f, 0.21]), 'yellow', 96),
    C.L([[1.97, g.dB], [2.6, g.dB], [2.6, 12.5], [2.15, 12.5], [2.15, 12.35], [1.97, 12.35]], 'yellow'),
    oreille, patte, poignee,
  ), X(-0.4));
  // 27 — Bagues 55-0045 (2) aux bouts de l'alésage de l'oreille : Ø 1,25 × Ø 1,0 × 1,0.
  const eR = Math.hypot(ear.y, ear.z), eF = Math.atan2(ear.z, ear.y);
  [ear.d0, ear.d1 - 1.0].forEach((d) => P('27', C.put(C.L([[0.5, 0], [0.625, 0], [0.625, 1.0], [0.5, 1.0]], 'brass', 24), eR, eF, d), X(-0.4, eF, 0.1)));
  // 20 — Graisseur 1/4-28 sur le flanc du carter.
  P('20', C.radial(B.zerk(S), g.ro, 45 * deg, 4.6), X(-0.4, 45 * deg, 0.06));

  // --- 23 — Piston et cylindre 55-0300 (page 23) ; lignes 15 à 18, 24 et 31 : même objet.
  const sub = api.sub('P023');
  sub.position.set((DM - U0) * IN, 0, 0);
  api.part('23', sub, X(-0.62));
  // 8 — Vis 1/2-13 × 4 (9) : cylindre → carter, têtes lamées sous le cylindre (u 3,4).
  SHCS4.forEach((f) => P('8', B.shcs(C, 0.5, 4, 5.6, f, U0 + 3.4, { up: true }), X(-0.82)));
  // 29 — Joint torique entre carter et cylindre ; 30 — entre cylindre et chapeau ; 28 — chapeau sur le tube.
  P('29', B.oRing(C, 4.47, 0.1, 8.47), X(-0.52));
  P('30', B.oRing(C, 5.25, 0.1, 11.85), X(-0.9));
  P('28', B.oRing(C, 2.65, 0.1, 12.17), X(-0.66));

  // --- 26 — Chapeau de cylindre 55-0044 : anneau percé des 9 vis 1/2-13 × 2 (7) et taraudé pour le reniflard.
  P('26', C.slab(g.ro, 2.62, 11.85, 12.5, [...SHCS2.map((f) => [5.6, f, 0.28]), [4.0, 180 * deg, 0.15]], 'yellow', 96), X(-0.95));
  // 21 — Reniflard 1/8 NPT sous le chapeau.
  const ren = S.group(S.cyl(0.004, 0.006, 'brass', { pos: [0, -0.003, 0], seg: 12 }), S.at(S.nut(0.0111, 0.005, 'brass'), [0, 0.0025, 0]),
    S.cyl(0.0055, 0.008, 'brass', { pos: [0, 0.009, 0], seg: 16 }), S.at(S.ball(0.0055, 'brass'), [0, 0.013, 0]));
  ren.rotation.x = Math.PI; // vers le bas de la colonne (−X)
  P('21', C.put(ren, 4.0, 180 * deg, 12.5), X(-0.95));
  // 7 — Vis 1/2-13 × 2 (9) et 33 — rondelles Grower 1/2 (9) sous le chapeau.
  SHCS2.forEach((f) => P('33', B.lockWasher(C, 0.44, 0.26, 0.1, 5.6, f, 12.55), X(-1.01)));
  SHCS2.forEach((f) => P('7', B.shcs(C, 0.5, 2, 5.6, f, 12.6, { up: true }), X(-1.07)));

  // --- Bague de serrage B (clamp bushing NQ 55-0052, hors liste) dans le bout du tube ; 25 — retenue 55-0043 ;
  // 6 — vis 5/16-18 × 1 (4) et 32 — rondelles Grower 5/16 (4), sur r 2,3 à φ = 45° + 90k.
  api.add(W(C.L([[1.45, 10.4], [1.95, 10.4], [1.95, 12.35], [2.13, 12.35], [2.13, 12.5], [1.45, 12.5]], 'steel')));
  const r4 = [45, 135, 225, 315].map((a) => a * deg);
  P('25', C.slab(2.6, 1.6, 12.5, 12.8, r4.map((f) => [2.3, f, 0.17]), 'steel'), X(-1.13));
  r4.forEach((f) => P('32', B.lockWasher(C, 0.29, 0.17, 0.08, 2.3, f, 12.84), X(-1.17)));
  r4.forEach((f) => P('6', B.shcs(C, 0.3125, 1, 2.3, f, 12.88, { up: true }), X(-1.21)));

  // --- p. 24 — Plaque support et bague de guidage, sur l'adaptateur de chapeau.
  const p24 = api.sub('P024');
  p24.position.set((DM - H.cap.d0) * IN, 0, 0);
  api.part('p24', p24, X(0.34));
}
