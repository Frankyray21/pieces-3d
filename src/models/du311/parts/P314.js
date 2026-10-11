// P314 — Admission d'air de mine CX035825 rév. 0 (pages 314 et 316, même
// dessin) : « ASSY, MINE AIR INTAKE, DU311-T », repère 14 du surpresseur
// P274. Ligne 3 po qui amène au surpresseur soit l'air du réseau de la mine,
// soit l'air ambiant, au choix de la vanne 3 voies motorisée :
//   · entrée réseau : coude 90° 3 po (39, sortie vers -X) au pied du tube
//     vertical 3 po × 27 po (11) qui porte la patte d'attache du câble
//     anti-fouet (16) ; té 3 po (40) en tête, sortie latérale fermée par la
//     réduction 3 × 1/2 (8) et le coude 1/2 NPT-JIC -06 (27) ;
//   · mamelon court 3 po (41), séparateur d'eau (3) et filtre 1 µm (4) à
//     têtes accolées — joints (19), bride taraudée 3 po (20), deux tiges
//     filetées M12 (18) avec écrous Nylstop M12 (1) et rondelles NL M14 (45)
//     qui serrent bride, têtes et joints ; sous le bol du séparateur, purge à
//     flotteur (2) : adaptateur 1/2 NPT-JIC -12 (31), té tournant de
//     branche -12 (23), coude tournant -12 (21), adaptateur tournant MNPT 1/2
//     -SFJIC -12 (35), coudes 1/2-JIC -12 (28) et 1/4-JIC -06 (26) ;
//   · mamelon court (41), bride 150 lb (13), joint (14) et vanne à bille
//     3 voies 3 po à brides (17), tige vers le bas (accouplement CM17212-4 et
//     actionneur P310, P274 rep. 2 et 12) ; sous le corps, chaîne du
//     pressostat différentiel (7) : adaptateurs -06 (30, ×3), tés tournants
//     -06 (24, ×3), coude tournant -06 (22), adaptateurs FNPT (32, 33), MNPT
//     tournant (34) et robinet 1/4 (6) de prise d'essai ;
//   · voie avant de la vanne (+Z) : bride (13), joint (14), réduction 3 × 2
//     (9), mamelon court 2 po (10), coude 2 po (12) et filtre d'air ambiant
//     (5) à écrou papillon, au-dessus ;
//   · sortie (+X) : bride (13), joint (14), boyau d'air 3 po (15) à embouts
//     NPT sertis qui plonge à 45° vers un raccord à brides (13, 14, 13),
//     mamelon 3 × 7 (42), coude 45° (38), mamelon 3 × 7 (42), croix 3 po (37)
//     et trois réductions 3 × 1 1/2 (36) portant deux coudes 90° -24 (29) et
//     un coude 45° -24 (25), départs des trois boyaux vers les cylindres du
//     surpresseur (P274 rep. 21).
//   Quatre joints à brides : seize vis 5/8-11 × 3 (43), rondelles (44) et
//   écrous (46).
// Repère : origine au centre de la vanne 3 voies (17), sur l'axe de la ligne
// des filtres ; X le long de la ligne (+X vers la sortie au surpresseur, comme
// la vue assemblée de la page 314), Y vers le haut, +Z vers l'observateur de
// cette vue (voie avant de la vanne, filtre 5). Encombrement ≈ 2.27 (X, de
// -0.88 au coude 27 à 1.39 aux coudes 29) × 1.09 (Y, de -0.87 sous le coude
// 39 à 0.22 au filtre 5) × 0.62 (Z, de -0.22 à 0.40) m ; té 40 vers x = -0.80,
// raccord à brides du boyau 15 en (0.76, -0.34, 0), croix 37 vers y = -0.52.
// Cotes : tuyauterie et brides aux cotes normalisées (NPT, ASME B16.5 150 lb),
// longueurs des mamelons d'après la liste ; filtres, vanne, boyau 15 et
// appareils estimés d'après la vue assemblée de la page 314 (brides de 7 1/2
// po pour l'échelle) ; petits raccords disposés de façon plausible autour de
// leurs appareils (les boyaux et tubes de liaison ne sont pas dans la liste).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const G = I(1 / 16); // joint de bride
const E3 = I(1.0), E2 = I(0.7); // engagement des filets 3 po et 2 po
const LV = I(6.35); // vanne 17 : centre → face de bride
const HB = I(3.1); // demi-côté du corps de vanne
const HW = I(7.5), HH = I(6.0), HD = I(7.0); // têtes de filtre (X, Y, Z)
const BOWL = { 3: I(13.5), 4: I(19) }; // longueur des bols
const RB = I(3.25); // rayon des bols

export const INTAKE314 = { valveFace: LV };

export default function P314(api) {
  const { S } = api;
  const { box, cyl, lathe, tube, ring, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const add = (p, d, k = 1) => p.map((v, i) => v + d[i] * k);
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
  const perp = (n) => norm(Math.abs(n[2]) > 0.9 ? cross3(n, [0, 1, 0]) : cross3([0, 0, 1], n));
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1], NZ = [0, 0, -1];

  const fl = ACC.flange150(S, 48);
  const TF = fl.userData.t; // épaisseur de bride (portée comprise)
  const HUB = I(1.19); // longueur totale à travers le moyeu
  const flange = () => ACC.flange150(S, 48);

  // Joint à brides : plan médian c, axe n ; quatre vis 5/8 × 3 tête du côté +n.
  const joint = (c, n, e) => {
    const u = perp(n), v = cross3(n, u);
    const wt = I(0.095);
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      const p = add(add(c, u, Math.cos(a) * I(3)), v, Math.sin(a) * I(3));
      const ph = add(p, n, G / 2 + TF);
      const pn = add(p, n, -(G / 2 + TF));
      const ex = add(e, n, 0.06);
      P('44', O(ACC.flatWasher(S, 0.625), ph, n, u), ex);
      P('43', O(ACC.hhcs(S, 0.625, 3), add(ph, n, wt), n, u), add(ex, n, 0.05));
      P('46', O(ACC.hexNut(S, 0.625), pn, n.map((x) => -x), u), add(e, n, -0.08));
    }
  };

  // ============================================================ 17 — vanne 3 voies 3 po
  // Corps cubique fonte, couvercles boulonnés sur les faces libres, trois
  // brides 150 lb venues de fonderie (-X, +X, +Z), bossage de tige et platine
  // ISO de l'actionneur dessous, ergot d'indication de position dessus.
  const vb = [box(2 * HB, 2 * HB, 2 * HB, 'castIron', { r: I(0.35) })];
  for (const [d, u] of [[NX, Y], [X, Y], [Z, Y]]) {
    vb.push(O(lathe([[I(1.7), 0], [I(2.1), 0], [I(2.2), LV - HB - TF], [I(3.75) - I(0.06), LV - HB - TF], [I(3.75), LV - HB - TF + I(0.06)], [I(3.75), LV - HB - I(0.0625)], [I(2.5), LV - HB - I(0.0625)], [I(2.5), LV - HB], [I(1.7), LV - HB]], 'castIron', { seg: 36 }), add([0, 0, 0], d, HB), d, u));
  }
  vb.push(at(cyl(I(1.0), I(0.9), 'castIron'), [0, -HB - I(0.45), 0]));
  vb.push(box(I(3.6), I(0.4), I(3.6), 'castIron', { r: I(0.1), pos: [0, -HB - I(1.1), 0] }));
  const vbolts = [];
  for (const [d, a, b] of [[Y, X, Z], [NZ, X, Y]]) {
    for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
      vbolts.push(O(S.bolt(I(0.5), I(0.6), 'zinc', { washer: false }), add(add(add([0, 0, 0], d, HB), a, s1 * I(2.2)), b, s2 * I(2.2)), d, a));
    }
  }
  const holes = [];
  for (const [d, u] of [[NX, Y], [X, Y], [Z, Y]]) {
    const v = cross3(d, u);
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      holes.push(O(cyl(I(0.375), TF * 1.02, 'blackOxide', { seg: 10 }), add(add(add([0, 0, 0], d, LV - TF / 2), u, Math.cos(a) * I(3)), v, Math.sin(a) * I(3)), d, u));
    }
  }
  const stem = merged([at(cyl(I(0.4), I(0.9), 'steel', { seg: 16 }), [0, -HB - I(1.6), 0]), at(cyl(I(0.25), I(0.5), 'steel', { seg: 12 }), [0, HB + I(0.25), 0]), box(I(0.9), I(0.15), I(0.2), 'steel', { pos: [0, HB + I(0.45), 0] })], 'steel');
  P('17', group(merged(vb, 'castIron'), merged(vbolts, 'zinc'), merged(holes, 'blackOxide'), stem), [0, 0, 0]);

  // ============================================================ côté filtres (-X)
  // 14 / 13 — joint et bride gauche ; joint boulonné.
  const xg = -LV - G / 2;
  P('14', at(ring(I(2.94), I(1.75), G, 'cream', { axis: 'x', seg: 36 }), [xg, 0, 0]), [-0.05, 0, 0]);
  P('13', O(flange(), [-LV - G, 0, 0], X, Y), [-0.12, 0, 0]);
  joint([xg, 0, 0], NX, [-0.12, 0, 0]);
  // 41 — mamelon court 3 po, vissé dans la bride 13 et dans la bride 20.
  const x41r = -LV - G - HUB + E3;
  const x41l = x41r - I(3);
  P('41', O(ACC.nipple(S, 48, I(3), 'darkSteel'), [x41l, 0, 0], X, Y), [-0.17, 0, 0]);
  // 20 — bride carrée taraudée 3 po NPT (côté filtre), deux oreilles des tiges 18.
  const x20r = x41l + E3, T20 = I(1.25), x20l = x20r - T20;
  const ears = (x0, x1, mat) => [-1, 1].map((s) => box(x1 - x0, I(1.0), I(1.6), mat, { r: I(0.2), pos: [(x0 + x1) / 2, s * I(2.9), -s * I(2.9)], rot: [Math.PI / 4, 0, 0] }));
  P('20', group(merged([
    O(lathe([[ACC.pipeOD(48) / 2 * 0.98, 0], [I(2.6), 0], [I(2.6), T20], [ACC.pipeOD(48) / 2 * 0.98, T20], [ACC.pipeOD(48) / 2 * 0.98, 0]], 'darkSteel', { seg: 4 }), [x20l, 0, 0], X, Y),
    ...ears(x20l, x20r, 'darkSteel'),
  ], 'darkSteel')), [-0.24, 0, 0]);

  // Têtes et bols des filtres 4 (côté vanne) et 3 (séparateur, côté té).
  const filter = (x1, ref, kind, e) => {
    const x0 = x1 - HW, xc = (x0 + x1) / 2;
    const head = [
      box(HW - I(0.4), HH, HD, 'castAlu', { r: I(0.6), pos: [xc, 0, 0] }),
      O(cyl(I(2.4), HW, 'castAlu', { seg: 36 }), [xc, 0, 0], X, Y),
      ...ears(x0 + I(0.3), x1 - I(0.3), 'castAlu'),
      at(cyl(I(3.45), I(1.0), 'castAlu', { seg: 40 }), [xc, -HH / 2 - I(0.4), 0]),
    ];
    const blue = [];
    if (kind === 4) blue.push(at(lathe([[0, 0], [I(0.7), 0], [I(0.7), I(0.6)], [I(0.45), I(0.9)], [0, I(0.95)]], 'red', { seg: 20 }), [xc, HH / 2, 0]));
    else blue.push(box(I(2.2), I(0.4), I(1.6), 'blue', { r: I(0.15), pos: [xc, HH / 2 + I(0.2), 0] }));
    const L = BOWL[kind];
    const bowl = lathe([
      [0, -HH / 2 - I(0.9) - L], [I(1.0), -HH / 2 - I(0.9) - L], [RB - I(0.5), -HH / 2 - I(0.9) - L + I(0.15)], [RB, -HH / 2 - I(0.9) - L + I(0.7)],
      [RB, -HH / 2 - I(1.4)], [I(3.45), -HH / 2 - I(1.2)], [I(3.45), -HH / 2 - I(0.9)], [0, -HH / 2 - I(0.9)],
    ], 'castAlu', { seg: 40, pos: [xc, 0, 0] });
    // Nervures longitudinales du bol.
    const ribs = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ribs.push(box(I(0.25), L - I(1.6), I(0.25), 'castAlu', { pos: [xc + Math.cos(a) * RB, -HH / 2 - I(1.2) - (L - I(1.6)) / 2 - I(0.2), Math.sin(a) * RB], rot: [0, -a, 0] }));
    }
    const yb = -HH / 2 - I(0.9) - L; // dessous du bol
    const boss = at(cyl(I(0.6), I(0.3), 'castAlu', { seg: 16 }), [xc, yb - I(0.15), 0]);
    P(ref, group(merged([...head, bowl, ...ribs, boss], 'castAlu'), merged(blue, blue[0].children?.length ? 'red' : (kind === 4 ? 'red' : 'blue'))), e);
    return { x0, x1, xc, yb: yb - I(0.3) };
  };
  const x19a = x20l - I(0.125);
  P('19', O(lathe([[I(1.8), 0], [I(2.7), 0], [I(2.7), I(0.125)], [I(1.8), I(0.125)], [I(1.8), 0]], 'rubber', { seg: 4 }), [x19a, 0, 0], X, Y), [-0.3, 0.12, 0]);
  const f4 = filter(x19a, '4', 4, [-0.3, 0, 0]);
  const x19b = f4.x0 - I(0.125);
  P('19', O(lathe([[I(1.8), 0], [I(2.7), 0], [I(2.7), I(0.125)], [I(1.8), I(0.125)], [I(1.8), 0]], 'rubber', { seg: 4 }), [x19b, 0, 0], X, Y), [-0.36, 0.12, 0]);
  const f3 = filter(x19b, '3', 3, [-0.42, 0, 0]);

  // 18 — tiges M12 × 1,75 à travers bride 20 et têtes ; 45 — rondelles NL ; 1 — écrous Nylstop.
  const xr0 = f3.x0 - I(0.9), xr1 = x20r + I(0.9);
  for (const s of [-1, 1]) {
    const yz = [0, s * I(2.9), -s * I(2.9)];
    P('18', O(lathe([[0, 0], [0.0058, 0], ...S.thread(0.006, 0.0005, xr1 - xr0 - 0.0005, { pitch: 0.00175, maxTurns: 40 }).slice(1), [0.0058, xr1 - xr0], [0, xr1 - xr0]], 'zinc', { seg: 10 }), [xr0, yz[1], yz[2]], X, Y), [-0.3, s * 0.1, -s * 0.1]);
    for (const [xx, d, e] of [[f3.x0 - I(0.3), NX, -0.5], [x20r, X, -0.1]]) {
      const wt = 0.0028;
      P('45', O(S.washer(0.0125, 0.0068, wt, 'zinc', { pos: [0, wt / 2, 0] }), [xx, yz[1], yz[2]], d, Y), [e, s * 0.1, -s * 0.1]);
      P('1', O(ACC.lockNut(S, 0.5), add([xx, yz[1], yz[2]], d, wt), d, Y), [e + Math.sign(e) * 0.03, s * 0.1, -s * 0.1]);
    }
  }

  // 41 — mamelon court, séparateur → té 40.
  const x41b = f3.x0 + E3 - I(3);
  P('41', O(ACC.nipple(S, 48, I(3), 'darkSteel'), [x41b, 0, 0], X, Y), [-0.5, 0, 0]);
  // 40 — té 3 po : passage selon X, branche vers le bas.
  const tee40 = ACC.pipeTee(S, 48);
  const A40 = tee40.userData.a;
  const c40 = [x41b + E3 - A40, 0, 0];
  P('40', O(tee40, c40, X, NY), [-0.56, 0, 0]);
  // 8 — réduction 3 × 1/2 dans le bout libre du té ; 27 — coude 1/2 NPT-JIC -06.
  const xb8 = c40[0] - A40;
  P('8', O(ACC.hexBushing(S, 48, 8), [xb8, 0, 0], NX, Y), [-0.62, 0, 0]);
  const hh8 = Math.max(I(0.25), ACC.pipeOD(48) / 2 * 0.45);
  P('27', O(ACC.elbow(S, { a: 8, b: 6 }), [xb8 - hh8, 0, 0], NX, Y), [-0.68, 0, 0]);
  // 11 — tube 3 po × 27 po vers le bas ; 39 — coude 90°, sortie vers -X.
  const y11t = -A40 + E3, y11b = y11t - I(27);
  P('11', O(ACC.nipple(S, 48, I(27), 'darkSteel'), [c40[0], y11b, 0], Y, X), [-0.56, -0.08, 0]);
  const el39 = ACC.pipeElbow(S, 48);
  const A39 = el39.userData.a;
  P('39', O(el39, [c40[0], y11b + E3 - A39, 0], NY, NX), [-0.6, -0.16, 0]);
  // 16 — patte d'attache du câble anti-fouet : collier en deux demi-coquilles
  // boulonnées, oreille percée, manille.
  const y16 = y11b + I(3.5);
  const R11 = ACC.pipeOD(48) / 2;
  const clamp = [
    ring(R11 + I(0.19), R11, I(1.25), 'zinc', { seg: 36 }),
    box(I(0.19), I(1.25), I(1.3), 'zinc', { pos: [0, 0, R11 + I(0.75)] }),
    box(I(0.19), I(1.25), I(1.3), 'zinc', { pos: [I(0.25), 0, R11 + I(0.75)] }),
    box(I(2.2), I(0.25), I(1.4), 'zinc', { pos: [-R11 - I(1.0), 0, 0] }),
    S.bolt(I(0.375), I(0.9), 'zinc', { axis: 'x', pos: [I(0.55), 0, R11 + I(0.95)] }),
  ];
  const shackle = merged([tube([[-R11 - I(1.5), -I(0.4), -I(0.5)], [-R11 - I(2.6), -I(0.4), -I(0.3)], [-R11 - I(2.9), -I(0.4), 0], [-R11 - I(2.6), -I(0.4), I(0.3)], [-R11 - I(1.5), -I(0.4), I(0.5)]], I(0.17), 'safety', { ends: 'none', radial: 8, seg: 20 }), at(cyl(I(0.19), I(1.4), 'safety', { seg: 10 }), [-R11 - I(1.5), -I(0.1), 0], [0, 0, 0])], 'safety');
  P('16', at(group(merged(clamp, 'zinc'), shackle), [c40[0], y16, 0]), [-0.56, -0.08, 0.1]);

  // Purge du séparateur 3 (sous son bol) : 31 → 23 → (21 | 35 → 2 → 28, 26).
  const pb = [f3.xc, f3.yb, 0];
  const a31 = ACC.straight(S, { a: 8, b: 12 });
  P('31', O(a31, pb, NY, X), [-0.42, -0.06, 0]);
  const t31 = add(pb, NY, a31.userData.tip);
  const t23 = ACC.swivelTee(S, 12);
  P('23', O(t23, t31, NY, X), [-0.42, -0.1, 0]);
  const br23 = ACC.local(t31, NY, X, ...t23.userData.branch);
  const run23 = ACC.local(t31, NY, X, ...t23.userData.run);
  P('21', O(ACC.swivelTee(S, 12, { elbow: true }), br23, X, NY), [-0.38, -0.1, 0]);
  const s35 = ACC.swivelStraight(S, { a: 12, b: 8 });
  P('35', O(s35, run23, NY, X), [-0.42, -0.14, 0]);
  const top2 = add(run23, NY, s35.userData.tip - E2 * 0.5);
  // 2 — purge à flotteur : corps sphérique Ø 3 1/2, bossage d'entrée 1/2 FNPT
  // en tête, sortie latérale basse, prise d'équilibrage 1/4.
  const R2 = I(1.75);
  const c2 = add(top2, NY, I(0.6) + R2);
  P('2', at(group(merged([
    lathe([[0, -R2], [R2 * 0.6, -R2 * 0.8], [R2, 0], [R2 * 0.6, R2 * 0.8], [0, R2]], 'castAlu', { seg: 28 }),
    at(cyl(I(0.62), I(0.75), 'castAlu', { seg: 6 }), [0, R2 + I(0.2), 0]),
    at(cyl(I(0.5), I(0.6), 'castAlu', { seg: 6, axis: 'x' }), [R2 * 0.85, -R2 * 0.55, 0]),
    at(cyl(I(0.35), I(0.4), 'castAlu', { seg: 6, axis: 'z' }), [0, R2 * 0.35, R2 * 0.95]),
    box(I(1.2), I(0.25), I(1.8), 'castAlu', { pos: [-R2 * 0.7, R2 * 0.55, 0] }),
  ], 'castAlu')), c2), [-0.42, -0.2, 0]);
  P('28', O(ACC.elbow(S, { a: 8, b: 12 }), add(c2, [R2 * 0.85 + I(0.3), -R2 * 0.55, 0]), X, NY), [-0.38, -0.22, 0]);
  P('26', O(ACC.elbow(S, { a: 4, b: 6 }), add(c2, [0, R2 * 0.35, R2 * 0.95 + I(0.2)]), Z, X), [-0.42, -0.2, 0.06]);

  // Chaîne du pressostat différentiel 7, sous le corps de la vanne.
  const p0 = [-I(1.9), -HB, I(1.9)];
  const a30a = ACC.straight(S, { a: 6, b: 6 });
  P('30', O(a30a, p0, NY, X), [0, -0.06, 0.1]);
  const t30a = add(p0, NY, a30a.userData.tip);
  const tA = ACC.swivelTee(S, 6);
  P('24', O(tA, t30a, NY, NX), [0, -0.09, 0.1]);
  const brA = ACC.local(t30a, NY, NX, ...tA.userData.branch);
  const runA = ACC.local(t30a, NY, NX, ...tA.userData.run);
  const s33 = ACC.swivelStraight(S, { a: 6, b: 4, femaleNpt: true });
  P('33', O(s33, brA, NX, Y), [-0.04, -0.09, 0.1]);
  const f33 = add(brA, NX, s33.userData.tip);
  // 7 — pressostat différentiel : boîtier alu 2 1/4 × 2 5/8 × 1 1/2, connecteur
  // DIN noir, prise haute pression mâle 1/4 (vissée dans 33), prise basse en dessous.
  const c7 = add(f33, NX, I(0.45) + I(1.1));
  P('7', at(group(
    merged([box(I(2.2), I(2.6), I(1.5), 'castAlu', { r: I(0.15) }), at(cyl(I(0.2), I(0.5), 'castAlu', { axis: 'x', seg: 10 }), [I(1.3), 0, 0]), at(cyl(I(0.2), I(0.45), 'castAlu', { seg: 10 }), [-I(0.4), -I(1.5), 0])], 'castAlu'),
    merged([box(I(1.1), I(1.2), I(0.9), 'black', { r: I(0.1), pos: [0, I(1.85), 0] }), at(cyl(I(0.25), I(0.4), 'black', { seg: 12 }), [0, I(2.6), 0])], 'black'),
  ), c7), [-0.08, -0.09, 0.1]);
  P('32', O(ACC.elbow(S, { a: 4, b: 6, female: true }), add(c7, [-I(0.4), -I(1.72), 0]), NY, NX), [-0.08, -0.14, 0.1]);
  P('30', O(ACC.straight(S, { a: 4, b: 6 }), add(c7, [0, 0, I(0.75)]), Z, X), [-0.08, -0.09, 0.15]);
  const tB = ACC.swivelTee(S, 6);
  P('24', O(tB, runA, NY, Z), [0, -0.12, 0.1]);
  const brB = ACC.local(runA, NY, Z, ...tB.userData.branch);
  const runB = ACC.local(runA, NY, Z, ...tB.userData.run);
  P('22', O(ACC.swivelTee(S, 6, { elbow: true }), brB, Z, NY), [0, -0.12, 0.14]);
  const tC = ACC.swivelTee(S, 6);
  P('24', O(tC, runB, NY, X), [0, -0.15, 0.1]);
  const runC = ACC.local(runB, NY, X, ...tC.userData.run);
  const s34 = ACC.swivelStraight(S, { a: 6, b: 6 });
  P('34', O(s34, runC, NY, X), [0, -0.18, 0.1]);
  // 6 — robinet à bille 1/4 po (prise d'essai), levier jaune.
  const sv6 = I(0.75);
  const c6 = add(add(runC, NY, s34.userData.tip), NY, 1.15 * sv6 - I(0.3));
  P('6', at(S.ballValve(sv6, 'brass', { axis: 'y' }), c6), [0, -0.2, 0.1]);
  P('30', O(ACC.straight(S, { a: 6, b: 6 }), add(c6, NY, 1.15 * sv6), NY, X), [0, -0.23, 0.1]);

  // ============================================================ voie avant (+Z) : filtre d'air ambiant
  const zg = LV + G / 2;
  P('14', at(ring(I(2.94), I(1.75), G, 'cream', { axis: 'z', seg: 36 }), [0, 0, zg]), [0, 0, 0.05]);
  P('13', O(flange(), [0, 0, LV + G], NZ, X), [0, 0, 0.12]);
  joint([0, 0, zg], Z, [0, 0, 0.12]);
  // 9 — réduction 3 × 2 ; 10 — mamelon court 2 po ; 12 — coude 2 po ; 5 — filtre.
  const z9 = LV + G + HUB;
  P('9', O(ACC.hexBushing(S, 48, 32), [0, 0, z9], Z, X), [0, 0, 0.2]);
  const z10 = z9 + hh8 - E2;
  P('10', O(ACC.nipple(S, 32, I(2.5), 'darkSteel'), [0, 0, z10], Z, X), [0, 0, 0.26]);
  const el12 = ACC.pipeElbow(S, 32);
  const A12 = el12.userData.a;
  const c12 = [0, 0, z10 + I(2.5) - E2 + A12];
  P('12', O(el12, c12, Z, Y), [0, 0, 0.32]);
  // Filtre d'air : embase à mamelon 2 po, cartouche Ø 7 1/2 × 4 3/4 à nervures, couvercle et écrou papillon.
  const y5 = A12 - E2;
  const fil5 = group(
    merged([
      lathe([[0, 0], [I(1.15), 0], [I(1.19), E2 + I(0.3)], [I(1.6), E2 + I(0.3)], [I(1.6), E2 + I(0.8)], [0, E2 + I(0.8)]], 'darkSteel', { seg: 24 }),
    ], 'darkSteel'),
    merged([
      lathe([[0, E2 + I(0.8)], [I(3.6), E2 + I(0.8)], [I(3.75), E2 + I(1.1)], [I(3.75), E2 + I(4.9)], [I(3.6), E2 + I(5.4)], [I(0.5), E2 + I(5.55)], [0, E2 + I(5.55)]], 'black', { seg: 40 }),
      ...[1.8, 2.6, 3.4, 4.2].map((y) => at(S.torus(I(3.76), I(0.06), 'black'), [0, E2 + I(y), 0])),
    ], 'black'),
    merged([
      lathe([[0, E2 + I(5.5)], [I(0.45), E2 + I(5.5)], [I(0.4), E2 + I(5.9)], [0, E2 + I(5.95)]], 'zinc', { seg: 16 }),
      box(I(1.3), I(0.5), I(0.12), 'zinc', { r: I(0.05), pos: [0, E2 + I(6.05), 0] }),
    ], 'zinc'),
  );
  P('5', at(fil5, [0, y5, c12[2]]), [0, 0.15, 0.32]);

  // ============================================================ sortie (+X) : boyau 15 et croix 37
  const xgr = LV + G / 2;
  P('14', at(ring(I(2.94), I(1.75), G, 'cream', { axis: 'x', seg: 36 }), [xgr, 0, 0]), [0.05, 0, 0]);
  P('13', O(flange(), [LV + G, 0, 0], NX, Y), [0.12, 0, 0]);
  joint([xgr, 0, 0], X, [0.12, 0, 0]);
  // Raccord à brides du bout du boyau (à 45° vers le bas) : plan médian pj, axe d.
  const d = norm([1, -1, 0]);
  const pj = [I(30), -I(13.5), 0];
  P('13', O(flange(), add(pj, d, -G / 2), d, Z), [0.3, -0.1, 0]);
  P('14', O(ring(I(2.94), I(1.75), G, 'cream', { seg: 36 }), pj, d, Z), [0.34, -0.14, 0]);
  P('13', O(flange(), add(pj, d, G / 2), d.map((x) => -x), Z), [0.38, -0.18, 0]);
  joint(pj, d, [0.38, -0.18, 0]);

  // 15 — boyau d'air 3 po : embouts mâles NPT sertis (filet engagé dans le
  // moyeu des brides, six-pans, douille à deux sertissages), corps noir.
  const RH = I(2.15);
  const hoseEnd = () => lathe([
    [0, 0], [I(1.6), 0], ...S.thread(I(1.72), 0.0005, I(1.2), { r1: I(1.75), maxTurns: 6 }).slice(1),
    [I(2.05), I(1.2)], [I(2.05), I(2.0)], [I(2.25), I(2.0)], [I(2.25), I(2.9)], [I(2.18), I(3.0)], [I(2.25), I(3.1)], [I(2.25), I(4.2)], [I(2.18), I(4.3)], [I(2.25), I(4.4)], [I(2.25), I(5.5)], [I(1.6), I(5.5)],
  ], 'zinc', { seg: 6 });
  const pA = [LV + G + HUB - E3, 0, 0]; // bout du filet, côté vanne
  const pB = add(pj, d, -(G / 2 + HUB - E3)); // bout du filet, côté raccord
  const sA = add(pA, X, I(5.5)), sB = add(pB, d, -I(5.5));
  const hpts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, u = 1 - t, h = Math.hypot(sB[0] - sA[0], sB[1] - sA[1]) * 0.45;
    const c1 = add(sA, X, h), c2 = add(sB, d, -h);
    hpts.push([0, 1, 2].map((k) => u * u * u * sA[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * sB[k]));
  }
  hpts.unshift(add(sA, X, -I(1.2)));
  hpts.push(add(sB, d, I(1.2)));
  P('15', group(
    tube(hpts, RH, 'hose', { ends: 'none', radial: 24, seg: 70, tension: 0.3 }),
    merged([O(hoseEnd(), pA, NX, Y), O(hoseEnd(), pB, d.map((x) => -x), Z)], 'zinc'),
  ), [0.22, 0.12, 0]);

  // 42 — mamelon 3 × 7 ; 38 — coude 45° ; 42 — mamelon 3 × 7 ; 37 — croix.
  const p42a = add(pj, d, G / 2 + HUB - E3);
  P('42', O(ACC.nipple(S, 48, I(7), 'darkSteel'), p42a, d, Z), [0.44, -0.22, 0]);
  const el38 = ACC.pipeElbow(S, 48, { angle: 45 });
  const A38 = el38.userData.a;
  const c38 = add(p42a, d, I(7) - E3 + A38);
  P('38', O(el38, c38, d, norm([1, 1, 0])), [0.5, -0.26, 0]);
  const p42b = add(c38, X, A38 - E3);
  P('42', O(ACC.nipple(S, 48, I(7), 'darkSteel'), p42b, X, Y), [0.56, -0.26, 0]);
  const cr = ACC.pipeTee(S, 48, { cross: true });
  const A37 = cr.userData.a;
  const c37 = add(p42b, X, I(7) - E3 + A37);
  P('37', O(cr, c37, Z, X), [0.62, -0.26, 0]);
  // 36 — réductions 3 × 1 1/2 sur les trois sorties ; 29 — coudes 90° -24 ; 25 — coude 45° -24.
  const hh36 = hh8;
  const outs = [
    [X, Y, '29', null],
    [Z, X, '29', null],
    [NZ, Y, '25', 45],
  ];
  for (const [dir, br, ref, ang] of outs) {
    const pf = add(c37, dir, A37);
    P('36', O(ACC.hexBushing(S, 48, 24), pf, dir, br), add([0.62, -0.26, 0], dir, 0.06));
    P(ref, O(ACC.elbow(S, { a: 24, b: 24, angle: ang || 90 }), add(pf, dir, hh36), dir, br), add([0.62, -0.26, 0], dir, 0.12));
  }

  return { view: { dir: [0.35, 0.45, 1.2] } };
}
