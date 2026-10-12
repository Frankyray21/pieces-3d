// P234 — Compartiment de service du DU311 CX030875 rév. 1 (pages 234 à 237) :
// « ASSY., SERVICE COMPARTMENT, DU311 », repère 3 du porteur P220. Coffre en
// tôle (15, « SERVICE CENTRE FRAME ») accroché au flanc droit du châssis
// arrière sous la cabine : angle supérieur arrière chanfreiné, trois portes à
// charnières et serrures quart de tour (dessinées ouvertes : haute gauche,
// haute droite, basse), poche de marchepied entre les portes de gauche,
// platine de montage au fond. Contenu : deux batteries 750 CA (31) au bas sur
// leur plateau (vis 3/8 × 1 1/4 39, rondelles 43, Nord-Lock 46, écrous 47) et
// sous leur barre de maintien (vis 3/8 × 4 40, rondelles 43, écrous freinés
// 49) ; sept électrovannes 3 voies 2 positions (11, vis 1/4 × 3 1/2 35) ;
// bloc de pressostats (14, vis 1/4 × 5 1/4 37) portant trois pressostats
// 250 psi NF (5), 250 psi NO (6), 70 psi NO (7), 1670 psi NF (8) et 1450 psi
// NO (9) ; bloc de prises de pression (13, vis 1/4 × 3 34) à huit prises
// d'essai #4 ORB (2) et huit adaptateurs ORB -4 → JIC -6 (28) ; bloc de
// desserrage du frein de parc (12, vis 34) à orifices NPT 1/4 (coudes 20,
// adaptateurs 21, adaptateurs à écrou tournant 22) ; trois sélecteurs de
// circuit à navette (10, vis 1/4 × 2 1/2 33) ; vanne à bille -6 ORB (1) ;
// limiteur de pression (4, P238, vis 1/4 × 4 1/2 36) ; écrous freinés 1/4
// (48) au dos de la platine ; raccords -6 : coudes ORB (24), tés de passage
// ORB (27), té de branche ORB (23), adaptateurs droits (29), tés tournants
// (18) et écrou borgne (16), bouchon ORB (30) ; raccords -12 : coude ORB
// (25), coudes ORB -12 → -6 (26), réduction tournante -12 → -6 (17) et té
// tournant -12 (19). Hors du coffre : deux accumulateurs (3) horizontaux
// sous colliers sur une platine fixée à la paroi intérieure (rondelles
// 5/16 plates 42 et Grower 45 des vis des colliers, écrous freinés 3/8 49),
// deux potences de boîte de jonction (50 : vis 7/16 × 1 1/4 53, rondelles 51,
// Grower 52, écrous 54 ; vis 1/4 × 1 32, rondelles 41 et Grower 44 en bout).
// Repère machine (../layout.js), placé à l'identité par P220 : coffre de
// x = −0.98 à −0.18, y = 0.40 à 1.02, z = 0.70 (paroi intérieure, au-delà du
// vérin de direction droit) à 0.98 (portes). Châssis arrière (aucune étiquette).
import { u, cabHw, prism, rrect } from './_cab.js';

export const SVC = { x0: -0.98, x1: -0.18, y0: 0.4, y1: 1.02, zi: 0.7, zo: 0.98 };

export default function P234(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, weld, ballValve } = S;
  const H_ = cabHw(api);
  const R = H_.R;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { x0, x1, y0, y1, zi, zo } = SVC;
  const t = u(0.1345), M = 'lightGrey';
  const zp = zi + t + u(0.25); // face de la platine de montage
  const OUT = [0, 0, 0.25]; // éclaté : vers l'extérieur (+Z)

  // ---------------------------------------------------------------- 15 — coffre, portes ouvertes
  const ch = 0.1; // chanfrein de l'angle supérieur arrière
  const outline = [[x0, y0], [x1, y0], [x1, y1], [x0 + ch, y1], [x0, y1 - ch]];
  const D1 = { x: [-0.95, -0.5], y: [0.745, 0.985] }, D2 = { x: [-0.47, -0.21], y: [0.44, 0.99] }, D3 = { x: [-0.95, -0.5], y: [0.44, 0.62] };
  const POCK = { x: [-0.86, -0.62], y: [0.645, 0.725] };
  const box15 = [
    // Paroi intérieure (contre le châssis), face avant à ouvertures, dessus, fond, bouts.
    prism(S, THREE, outline, t, M, 'xy', zi + t / 2),
    prism(S, THREE, outline, t, M, 'xy', zo - t / 2, { polys: [D1, D2, D3].map((d) => rrect((d.x[0] + d.x[1]) / 2, (d.y[0] + d.y[1]) / 2, d.x[1] - d.x[0], d.y[1] - d.y[0], 0.01)).concat([rrect((POCK.x[0] + POCK.x[1]) / 2, (POCK.y[0] + POCK.y[1]) / 2, POCK.x[1] - POCK.x[0], POCK.y[1] - POCK.y[0], 0.008)]) }),
    box(x1 - x0 - ch, t, zo - zi, M, { pos: [(x0 + ch + x1) / 2, y1 - t / 2, (zi + zo) / 2] }),
    box(x1 - x0, t, zo - zi, M, { pos: [(x0 + x1) / 2, y0 + t / 2, (zi + zo) / 2] }),
    box(t, y1 - y0, zo - zi, M, { pos: [x1 - t / 2, (y0 + y1) / 2, (zi + zo) / 2] }),
    box(t, y1 - ch - y0, zo - zi, M, { pos: [x0 + t / 2, (y0 + y1 - ch) / 2, (zi + zo) / 2] }),
    at(box(ch * Math.SQRT2, t, zo - zi, M), [x0 + ch / 2, y1 - ch / 2, (zi + zo) / 2], [0, 0, Math.PI / 4]),
    // Poche de marchepied (caisson embouti) et barreau d'appui.
    box(POCK.x[1] - POCK.x[0], t, 0.08, M, { pos: [(POCK.x[0] + POCK.x[1]) / 2, POCK.y[0] + t / 2, zo - 0.04] }),
    box(POCK.x[1] - POCK.x[0], POCK.y[1] - POCK.y[0], t, M, { pos: [(POCK.x[0] + POCK.x[1]) / 2, (POCK.y[0] + POCK.y[1]) / 2, zo - 0.08] }),
    // Platine de montage (1/4 po) au fond du compartiment haut ; tablette des batteries.
    box(x1 - x0 - 0.06, 0.34, u(0.25), M, { pos: [(x0 + x1) / 2, 0.83, zi + t + u(0.125)] }),
    box(x1 - x0 - 0.04, u(0.1875), zo - zi - 0.02, M, { pos: [(x0 + x1) / 2, 0.655, (zi + zo) / 2] }),
  ];
  // Portes ouvertes (tôle pliée, joint, charnières, serrure quart de tour à poignée ronde).
  const door = (d, hingeX, ang) => {
    const w = d.x[1] - d.x[0] + 0.02, h = d.y[1] - d.y[0] + 0.02, s = hingeX < (d.x[0] + d.x[1]) / 2 ? 1 : -1;
    const g = group(
      box(w, h, t, M, { r: 0.004, pos: [s * w / 2, 0, t / 2] }),
      box(w - 0.04, h - 0.04, 0.012, M, { r: 0.004, pos: [s * w / 2, 0, -0.006] }),
      merged([[w - 0.05, 0.008, 0, (h - 0.05) / 2], [w - 0.05, 0.008, 0, -(h - 0.05) / 2], [0.008, h - 0.05, (w - 0.05) / 2, 0], [0.008, h - 0.05, -(w - 0.05) / 2, 0]].map(([bw, bh, dx, dy]) => box(bw, bh, 0.006, 'rubber', { pos: [s * w / 2 + dx, dy, -0.015] })), 'rubber'),
      at(lathe([[0, 0], [0.018, 0], [0.018, 0.006], [0.012, 0.016], [0, 0.017]], 'black', { seg: 18 }), [s * (w - 0.035), 0, t], [Math.PI / 2, 0, 0]),
      box(0.004, 0.022, 0.01, 'black', { pos: [s * (w - 0.035), 0, t + 0.02] }),
    );
    g.rotation.y = -s * ang;
    g.position.set(hingeX, (d.y[0] + d.y[1]) / 2, zo);
    const hinges = merged([-1, 1].map((k) => at(cyl(0.006, 0.05, 'zinc', { seg: 10 }), [hingeX, (d.y[0] + d.y[1]) / 2 + k * (h / 2 - 0.04), zo + 0.004])), 'zinc');
    return group(g, hinges);
  };
  const doors = [door(D1, D1.x[0] - 0.01, 1.9), door(D2, D2.x[1] + 0.01, 1.9), door(D3, D3.x[0] - 0.01, 1.7)];
  const beads = merged([
    weld([[x0 + t, y0 + t + 0.002, zi + t + 0.002], [x1 - t, y0 + t + 0.002, zi + t + 0.002]], 0.005, M),
    weld([[x1 - t - 0.002, y0 + t, zi + t + 0.002], [x1 - t - 0.002, y1 - t, zi + t + 0.002]], 0.005, M),
  ], M);
  const g15 = group(beads, ...doors); // coffre enregistré à la fin (platine des accumulateurs comprise)

  // ---------------------------------------------------------------- 31 — batteries ; plateau et barre de maintien (39-40, 43, 46, 47, 49)
  const yB = y0 + t + u(0.25);
  const BAT = { l: u(13), w: u(6.8), h: u(9.4) };
  const zB = (zi + zo) / 2 + 0.01;
  for (const xb of [-0.735, -0.4]) {
    const bat = group(
      box(BAT.l, BAT.h - 0.012, BAT.w, 'black', { r: 0.004, pos: [0, (BAT.h - 0.012) / 2, 0] }),
      box(BAT.l - 0.004, 0.012, BAT.w - 0.004, 'black', { r: 0.003, pos: [0, BAT.h - 0.006, 0] }),
      merged([-1, 1].map((s) => lathe([[0, 0], [0.009, 0], [0.0075, 0.02], [0, 0.02]], 'zinc', { seg: 14, pos: [s * (BAT.l / 2 - 0.035), BAT.h, BAT.w / 2 - 0.03] })), 'zinc'),
      merged([-0.06, 0, 0.06].map((dx) => at(cyl(0.012, 0.006, 'plastic', { seg: 14 }), [dx, BAT.h + 0.003, -0.02])), 'plastic'),
      at(S.nameplate(0.12, 0.06, { material: 'white', ink: 'black' }), [0, BAT.h * 0.55, BAT.w / 2 + 0.0005]),
    );
    bat.position.set(xb, yB, zB);
    P('31', bat, [0, 0, 0.3]);
  }
  // Plateau (tôle 1/4) et ses trois vis 3/8 × 1 1/4 vers le bas, écrous sous le fond.
  const tray = box(0.74, u(0.25), zo - zi - 0.04, M, { pos: [-0.57, y0 + t + u(0.125), (zi + zo) / 2] });
  box15.push(tray);
  const trayPts = [-0.88, -0.57, -0.26];
  for (const x of trayPts) {
    const p = [x, yB, zi + 0.02];
    P('43', H_.washer(0.375, p), OUT);
    P('39', H_.bolt(0.375, 1.25, [x, yB + H_.wT(0.375), zi + 0.02], [0, 1, 0], { light: true }), OUT);
    P('46', H_.washer(0.375, [x, y0, zi + 0.02], [0, -1, 0], 'nl'), [0, -0.08, 0]);
    P('47', H_.nut(0.375, [x, y0 - H_.wT(0.375, 'nl'), zi + 0.02], [0, -1, 0]), [0, -0.12, 0]);
  }
  // Barre de maintien (cornière) sur les deux batteries, deux tiges 3/8 × 4.
  const yBar = yB + BAT.h + 0.004;
  box15.push(box(0.72, 0.03, 0.03, 'black', { pos: [-0.57, yBar + 0.015, zB] }));
  for (const x of [-0.92, -0.22]) {
    const p = [x, yBar + 0.03, zB];
    P('43', H_.washer(0.375, p), OUT);
    P('40', H_.bolt(0.375, 4.0, [x, yBar + 0.03 + H_.wT(0.375), zB], [0, 1, 0], { light: true }), OUT);
  }

  // ---------------------------------------------------------------- 11 — électrovannes (×7) ; 35 — vis ; 29, 24 — raccords -6
  const SV = { y: 0.865, w: u(2), h: u(3), d: u(2) };
  const svX = [-0.9, -0.825, -0.75, -0.675, -0.6, -0.525, -0.45];
  svX.forEach((x, i) => {
    const zc = zp + SV.d / 2;
    const v = group(
      box(SV.w, SV.h, SV.d, 'zinc', { r: 0.002, pos: [x, SV.y, zc] }),
      lathe([[0, 0], [0.011, 0], [0.011, 0.07], [0.006, 0.075], [0, 0.075]], 'steel', { seg: 14, pos: [x, SV.y + SV.h / 2, zc] }),
      lathe([[0.012, 0.004], [0.021, 0.004], [0.022, 0.008], [0.022, 0.05], [0.021, 0.054], [0.012, 0.054]], 'black', { seg: 18, pos: [x, SV.y + SV.h / 2, zc] }),
      box(0.03, 0.03, 0.022, 'black', { r: 0.003, pos: [x, SV.y + SV.h / 2 + 0.03, zc + 0.034] }),
      at(cyl(0.006, 0.012, 'black', { axis: 'z', seg: 10 }), [x, SV.y + SV.h / 2 + 0.03, zc + 0.051]),
    );
    P('11', v, OUT);
    P('35', H_.bolt(0.25, 3.5, [x, SV.y - 0.012, zp + SV.d], [0, 0, 1], { light: true }), [0, 0, 0.35]);
    // Orifices : P en dessous (droit), A et T en façade basse (droit + coude, sauf la dernière : deux coudes).
    P('29', H_.pose(R.straight({ port: 'orb', pd: 6, jd: 6 }), [x, SV.y - SV.h / 2, zc], [0, -1, 0]), [0, -0.1, 0.1]);
    const zf = zp + SV.d;
    if (i < 6) P('29', H_.pose(R.straight({ port: 'orb', pd: 6, jd: 6 }), [x - 0.012, SV.y - 0.03, zf], [0, 0, 1]), [0, 0, 0.3]);
    else P('24', H_.pose(R.elbow({ port: 'orb', pd: 6, jd: 6 }), [x - 0.012, SV.y - 0.03, zf], [0, 0, 1], [0, -1, 0]), [0, 0, 0.3]);
    P('24', H_.pose(R.elbow({ port: 'orb', pd: 6, jd: 6 }), [x + 0.012, SV.y + 0.008, zf], [0, 0, 1], [0, -1, 0]), [0, 0, 0.3]);
  });

  // ---------------------------------------------------------------- 13 — bloc de prises de pression ; 2 — prises d'essai ; 28 — adaptateurs ; 34, 48
  const TB = { x: -0.77, y: 0.69, l: 0.3, h: 0.04, d: 0.05 };
  P('13', group(
    box(TB.l, TB.h, TB.d, 'zinc', { r: 0.002, pos: [TB.x, TB.y, zp + TB.d / 2] }),
    merged(Array.from({ length: 8 }, (_, k) => at(lathe([[0.011, 0.0003], [0.0075, 0.0003]], 'steel', { seg: 12 }), [TB.x - 0.1225 + k * 0.035, TB.y, zp + TB.d], [Math.PI / 2, 0, 0])), 'steel'),
  ), OUT);
  for (let k = 0; k < 8; k++) {
    const x = TB.x - 0.1225 + k * 0.035;
    const tp = group(
      merged([R.hexY(u(0.5625), 0, 0.007), lathe([[0, -0.01], [0.0055, -0.01], [0.0055, 0], [0, 0]], 'zinc', { seg: 10 }), lathe([[0, 0.007], [0.0065, 0.007], [0.0065, 0.024], [0, 0.024]], 'zinc', { seg: 12 })], 'zinc'),
      lathe([[0, 0.018], [0.0085, 0.018], [0.0085, 0.032], [0.006, 0.034], [0, 0.034]], k % 2 ? 'black' : 'red', { seg: 12 }),
    );
    P('2', H_.pose(tp, [x, TB.y, zp + TB.d], [0, 0, 1]), [0, 0, 0.35]);
    P('28', H_.pose(R.straight({ port: 'orb', pd: 4, jd: 6 }), [x, TB.y + TB.h / 2, zp + TB.d / 2], [0, 1, 0]), [0, 0.12, 0.15]);
  }
  for (const x of [TB.x - 0.145, TB.x + 0.145]) {
    P('34', H_.bolt(0.25, 3.0, [x, TB.y, zp + TB.d], [0, 0, 1], { light: true }), [0, 0, 0.35]);
    P('48', H_.nut(0.25, [x, TB.y, zi], [0, 0, -1], 'nyl'), [0, 0, -0.12]);
  }

  // ---------------------------------------------------------------- 12 — bloc de desserrage du frein de parc ; 20, 21, 22 ; 34, 48
  const PB = { x: -0.535, y: 0.7, w: 0.1, h: 0.075, d: 0.05 };
  const pzc = zp + PB.d / 2;
  P('12', group(
    box(PB.w, PB.h, PB.d, 'zinc', { r: 0.002, pos: [PB.x, PB.y, pzc] }),
    at(cyl(0.012, 0.03, 'steel', { axis: 'z', seg: 14 }), [PB.x, PB.y + 0.012, zp + PB.d + 0.015]),
    at(R.hexY(u(0.75), 0, 0.012), [PB.x, PB.y + 0.012, zp + PB.d + 0.03], [Math.PI / 2, 0, 0]),
    at(box(0.06, 0.008, 0.008, 'red'), [PB.x, PB.y + 0.012, zp + PB.d + 0.046]),
  ), OUT);
  const pT = PB.y + PB.h / 2, pBt = PB.y - PB.h / 2;
  P('21', H_.pose(R.straight({ port: 'npt', pd: 4, jd: 6 }), [PB.x - 0.03, pT, pzc], [0, 1, 0]), [0, 0.12, 0]);
  P('21', H_.pose(R.straight({ port: 'npt', pd: 4, jd: 6 }), [PB.x, pT, pzc], [0, 1, 0]), [0, 0.12, 0]);
  P('22', H_.pose(R.nptSwivel(4, 6), [PB.x + 0.03, pT, pzc], [0, 1, 0]), [0, 0.12, 0]);
  P('20', H_.pose(R.elbow({ port: 'npt', pd: 4, jd: 6 }), [PB.x - 0.03, pBt, pzc], [0, -1, 0], [0, 0, 1]), [0, -0.12, 0.1]);
  P('20', H_.pose(R.elbow({ port: 'npt', pd: 4, jd: 6 }), [PB.x, pBt, pzc], [0, -1, 0], [0, 0, 1]), [0, -0.12, 0.1]);
  P('22', H_.pose(R.nptSwivel(4, 6), [PB.x + 0.03, pBt, pzc], [0, -1, 0]), [0, -0.12, 0]);
  P('21', H_.pose(R.straight({ port: 'npt', pd: 4, jd: 6 }), [PB.x - PB.w / 2, PB.y - 0.015, pzc], [-1, 0, 0]), [-0.1, 0, 0.1]);
  P('21', H_.pose(R.straight({ port: 'npt', pd: 4, jd: 6 }), [PB.x + PB.w / 2, PB.y - 0.015, pzc], [1, 0, 0]), [0.1, 0, 0.1]);
  P('22', H_.pose(R.nptSwivel(4, 6), [PB.x + PB.w / 2, PB.y + 0.02, pzc], [1, 0, 0]), [0.1, 0, 0.1]);
  for (const x of [PB.x - 0.035, PB.x + 0.035]) {
    P('34', H_.bolt(0.25, 3.0, [x, PB.y - 0.025, zp + PB.d], [0, 0, 1], { light: true }), [0, 0, 0.35]);
    P('48', H_.nut(0.25, [x, PB.y - 0.025, zi], [0, 0, -1], 'nyl'), [0, 0, -0.12]);
  }

  // ---------------------------------------------------------------- 1 — vanne à bille -6 ; 4 — limiteur (P238) ; 36
  const bv = ballValve(0.025, 'brass', { axis: 'y', handle: 'red' });
  bv.position.set(-0.45, 0.705, zp + 0.03);
  P('1', bv, OUT);
  const rv = api.sub('P238');
  rv.position.set(-0.637, 0.775, zp + u(0.75));
  P('4', rv, OUT);
  P('36', H_.bolt(0.25, 4.5, [-0.637 + u(0.6), 0.775, zp + u(1.5)], [0, 0, 1], { light: true }), [0, 0, 0.35]);

  // ---------------------------------------------------------------- 14 — bloc de pressostats ; 5 à 9 ; 25, 26, 17, 19 ; 37, 48
  const PS = { x: -0.33, y0: 0.66, y1: 0.97, w: 0.05, d: 0.05 };
  const psz = zp + PS.d / 2;
  P('14', box(PS.w, PS.y1 - PS.y0, PS.d, 'zinc', { r: 0.002, pos: [PS.x, (PS.y0 + PS.y1) / 2, psz] }), OUT);
  const swRefs = ['5', '5', '5', '6', '7', '8', '9'];
  swRefs.forEach((ref, k) => {
    const y = PS.y0 + 0.035 + k * 0.04;
    const sw = group(
      merged([R.hexY(u(0.875), 0, 0.01), lathe([[0, -0.01], [0.006, -0.01], [0.006, 0], [0, 0]], 'zinc', { seg: 10 }), lathe([[0, 0.01], [0.011, 0.01], [0.011, 0.04], [0, 0.04]], 'zinc', { seg: 14 })], 'zinc'),
      box(0.026, 0.026, 0.026, ['5', '8'].includes(ref) ? 'black' : 'grey', { r: 0.003, pos: [0, 0.053, 0] }),
      at(cyl(0.005, 0.012, 'black', { seg: 10 }), [0, 0.072, 0]),
    );
    P(ref, H_.pose(sw, [PS.x, y, zp + PS.d], [0, 0, 1], [1, 0, 0]), [0, 0, 0.3]);
  });
  const e25 = H_.pose(R.elbow({ port: 'orb', pd: 12, jd: 12 }), [PS.x, PS.y1, psz], [0, 1, 0], [1, 0, 0]);
  P('25', e25, [0, 0.12, 0]);
  const q25 = H_.port(e25);
  P('17', H_.pose(R.swivel({ kind: 'reducer', fd: 12, jd: 6 }), q25.p, q25.d, [0, 1, 0]), [0.08, 0.12, 0]);
  const e26a = H_.pose(R.elbow({ port: 'orb', pd: 12, jd: 6 }), [PS.x - 0.012, PS.y0, psz], [0, -1, 0], [-1, 0, 0]);
  P('26', e26a, [0, -0.12, 0]);
  const e26b = H_.pose(R.elbow({ port: 'orb', pd: 12, jd: 6 }), [PS.x + 0.012, PS.y0, psz], [0, -1, 0], [1, 0, 0]);
  P('26', e26b, [0, -0.12, 0]);
  void e26a;
  const q26 = H_.port(e26b);
  P('19', H_.pose(R.swivel({ kind: 'tee', fd: 12, jd: 12 }), q26.p, q26.d, [0, -1, 0]), [0.08, -0.12, 0]);
  for (const y of [PS.y0 + 0.015, PS.y1 - 0.015]) {
    P('37', H_.bolt(0.25, 5.25, [PS.x - PS.w / 2 + 0.006, y, zp + PS.d], [0, 0, 1], { light: true }), [0, 0, 0.35]);
    P('48', H_.nut(0.25, [PS.x - PS.w / 2 + 0.006, y, zi], [0, 0, -1], 'nyl'), [0, 0, -0.12]);
  }

  // ---------------------------------------------------------------- 10 — sélecteurs à navette (×3) ; 27, 23, 30, 18, 16 ; 33
  const shY = [0.72, 0.8, 0.88];
  const shX = -0.4, SH = { w: 0.04, h: 0.032, d: 0.035 };
  shY.forEach((y, i) => {
    P('10', box(SH.w, SH.h, SH.d, 'zinc', { r: 0.002, pos: [shX, y, zp + SH.d / 2] }), OUT);
    const zf = zp + SH.d;
    // Deux tés de passage ORB en façade (branche vers le haut).
    for (const dx of [-0.011, 0.011]) {
      const rt = R.straight({ port: 'orb', pd: 6, jd: 6 });
      const br = group(R.sleeve(u(0.28) * 0.85, 0, u(0.3)), R.jicNose(9 / 16, u(0.3)));
      br.position.set(0, u(0.32), 0);
      br.rotation.z = dx < 0 ? Math.PI / 2 : -Math.PI / 2;
      const tee = H_.pose(group(rt, br), [shX + dx, y, zf], [0, 0, 1], [0, 1, 0]);
      P('27', tee, [0, 0, 0.3]);
      if (i < 2 && dx > 0) {
        const q = H_.port(tee);
        const st = H_.pose(R.swivel({ kind: 'tee', fd: 6, jd: 6 }), q.p, q.d, [1, 0, 0]);
        P('18', st, [0, 0, 0.42]);
        if (i === 0) {
          const qb = H_.port(st, 1);
          P('16', H_.pose(group(R.hexY(u(0.75), -0.008, 0.016), lathe([[0, 0.008], [0.009, 0.008], [0.006, 0.014], [0, 0.015]], 'zinc', { seg: 12 })), qb.p, qb.d), [0.08, 0, 0.42]);
        }
      }
    }
    if (i === 0) {
      // Té de branche ORB sur la face −X (deux sorties JIC selon ±Z).
      const bt = group(R.straight({ port: 'orb', pd: 6, jd: 6 }));
      const cross = group(R.sleeve(u(0.28), -u(0.3), u(0.3)), at(R.jicNose(9 / 16, u(0.3)), [0, 0, 0]), at(R.jicNose(9 / 16, u(0.3)), [0, 0, 0], [Math.PI, 0, 0]));
      cross.rotation.x = Math.PI / 2;
      cross.position.y = u(0.62);
      bt.add(cross);
      P('23', H_.pose(bt, [shX - SH.w / 2, y, zp + SH.d / 2], [-1, 0, 0], [0, 1, 0]), [-0.1, 0, 0.1]);
    }
    if (i === 1) P('30', H_.pose(R.orbPlug(6), [shX - SH.w / 2, y, zp + SH.d / 2], [-1, 0, 0]), [-0.1, 0, 0.1]);
  });
  for (const y of [shY[0] - 0.024, shY[2] + 0.024]) P('33', H_.bolt(0.25, 2.5, [shX, y, zp + SH.d], [0, 0, 1], { light: true }), [0, 0, 0.35]);

  // ---------------------------------------------------------------- 3 — accumulateurs (×2) sous colliers ; 42, 45, 49
  const AC = { x: -0.58, len: 0.36, r: 0.045, z: 0.645, ys: [0.47, 0.57] };
  const plateAcc = merged([
    box(0.42, 0.2, u(0.25), M, { pos: [AC.x, 0.52, zi - u(0.125)] }),
    ...[-1, 1].map((s) => box(0.12, 0.2, u(0.25), M, { pos: [AC.x + s * 0.13, 0.52, AC.z + 0.0] }).rotateY(0)),
  ], M);
  const clampBolts = [];
  const accs = [];
  AC.ys.forEach((y) => {
    const acc = group(
      lathe([[0, -AC.len / 2], [AC.r * 0.6, -AC.len / 2], [AC.r * 0.95, -AC.len / 2 + 0.02], [AC.r, -AC.len / 2 + 0.05], [AC.r, AC.len / 2 - 0.05], [AC.r * 0.95, AC.len / 2 - 0.02], [AC.r * 0.6, AC.len / 2], [0, AC.len / 2]], 'black', { seg: 28 }),
      merged([lathe([[0, 0], [0.012, 0], [0.012, 0.02], [0, 0.02]], 'zinc', { seg: 6, pos: [0, AC.len / 2, 0] }), lathe([[0, 0], [0.008, 0], [0.008, 0.025], [0, 0.025]], 'brass', { seg: 10, pos: [0, -AC.len / 2 - 0.025, 0] })], 'zinc'),
      at(S.nameplate(0.08, 0.04, { material: 'white', ink: 'black' }), [0, 0, AC.r + 0.0005]),
    );
    acc.rotation.z = Math.PI / 2;
    acc.position.set(AC.x, y, AC.z);
    accs.push(acc);
    for (const dx of [-0.11, 0.11]) {
      // Colliers (deux demi-coquilles noires) et leurs vis 5/16 (sans repère : ligne 38 à quantité nulle).
      clampBolts.push(at(S.ring(AC.r + 0.006, AC.r, 0.03, 'black', { axis: 'x', seg: 24 }), [AC.x + dx, y, AC.z]));
      for (const s of [-1, 1]) clampBolts.push(at(box(0.03, 0.012, 0.025, 'black'), [AC.x + dx, y + s * (AC.r + 0.006), AC.z - 0.02]));
    }
  });
  accs.forEach((a) => P('3', a, [0, 0, -0.25]));
  const wps = [];
  const dirs = [];
  AC.ys.forEach((y) => [-0.11, 0.11].forEach((dx) => [1, -1].forEach((s) => { wps.push([AC.x + dx, y + s * (AC.r + 0.012), AC.z - 0.02]); dirs.push([0, s, 0]); })));
  dirs.push([0, 0, -1], [0, 0, -1]);
  wps.push([AC.x - 0.19, 0.6, zi - u(0.25)], [AC.x + 0.19, 0.6, zi - u(0.25)]);
  const hidden = [];
  wps.forEach((p, k) => {
    const dir = dirs[k];
    P('42', H_.washer(0.3125, p, dir), [0, 0, -0.3]);
    const p2 = p.map((v, j) => v + dir[j] * H_.wT(0.3125));
    P('45', H_.washer(0.3125, p2, dir, 'split'), [0, 0, -0.32]);
    const p3 = p2.map((v, j) => v + dir[j] * H_.wT(0.3125, 'split'));
    hidden.push(H_.bolt(0.3125, 0.75, p3, dir, { light: true }));
  });
  g15.add(merged(box15, M), plateAcc, merged(clampBolts, 'black'), ...hidden);
  P('15', g15, [0, 0, 0.12]);
  for (const [x, y] of [[AC.x - 0.19, 0.44], [AC.x + 0.19, 0.44], [AC.x - 0.19, 0.6], [AC.x + 0.19, 0.6]]) {
    P('49', H_.nut(0.375, [x, y + (y > 0.5 ? 0.02 : 0), zi + t + (y > 0.5 ? u(0.25) : 0)], [0, 0, 1], 'nyl'), [0, 0, 0.2]);
  }
  for (const x of [-0.92, -0.22]) P('49', H_.nut(0.375, [x, y0 - 0.0, zB], [0, -1, 0], 'nyl'), [0, -0.12, 0]);

  // ---------------------------------------------------------------- 50 — potences de boîte de jonction ; 53, 51, 52, 54 ; 32, 41, 44
  for (const y of [0.9, 0.98]) {
    const arm = merged([
      box(u(1.5), u(0.25), 0.16, M, { pos: [-0.3, y, zi - 0.08] }),
      box(u(1.5), 0.05, u(0.25), M, { pos: [-0.3, y - 0.025 + u(0.125), zi - u(0.125)] }),
    ], M);
    P('50', arm, [0, 0, -0.15]);
    const pb = [-0.3, y + u(0.125), zi - 0.035];
    const pB = [-0.3, y - 0.012, zi - u(0.25)];
    P('51', H_.washer(0.4375, pB, [0, 0, -1]), [0, 0, -0.25]);
    P('52', H_.washer(0.4375, [pB[0], pB[1], pB[2] - H_.wT(0.4375)], [0, 0, -1], 'split'), [0, 0, -0.28]);
    P('53', H_.bolt(0.4375, 1.25, [pB[0], pB[1], pB[2] - H_.wT(0.4375) - H_.wT(0.4375, 'split')], [0, 0, -1], { light: true }), [0, 0, -0.32]);
    P('51', H_.washer(0.4375, [pB[0], pB[1], zi + t], [0, 0, 1]), [0, 0, 0.2]);
    P('54', H_.nut(0.4375, [pB[0], pB[1], zi + t + H_.wT(0.4375)], [0, 0, 1]), [0, 0, 0.22]);
    const pt = [-0.3, y + u(0.125), zi - 0.13];
    P('41', H_.washer(0.25, pt), [0, 0.1, -0.15]);
    P('44', H_.washer(0.25, [pt[0], pt[1] + H_.wT(0.25), pt[2]], [0, 1, 0], 'split'), [0, 0.12, -0.15]);
    P('32', H_.bolt(0.25, 1.0, [pt[0], pt[1] + H_.wT(0.25) + H_.wT(0.25, 'split'), pt[2]], [0, 1, 0], { light: true }), [0, 0.16, -0.15]);
    void pb;
  }
  return { view: { dir: [0.9, 0.6, 1.3] } };
}
