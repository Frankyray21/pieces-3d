// P340 — Pompe à eau triplex à pistons CP18322-1 rév. 0 « WATER PUMP »
// (pages 340, 342 et 344, même vue éclatée), repère 6 de P338. Carter en
// alliage d'alu (2) à pieds, dessus en pente, bouchon de remplissage d'huile
// à reniflard (5) et son joint (4) ; couvercle arrière (8) sur joint plat (1)
// par six vis (11), voyant d'huile (7) et son joint (6), bouchon de vidange
// (10) et son joint (9) ; vilebrequin à trois manetons à 120° (12) sur deux
// roulements à rouleaux coniques (13) dans les flasques du carter (joints
// toriques 15, bagues d'étanchéité 14 et 16, huit vis 19) ; bout d'arbre
// claveté côté moteur (+X), protecteur conique (18) côté opposé ; trois
// bielles à chapeau (20), axes de pied (22), crosses-tiges de piston (21),
// rondelles (23), bagues d'étanchéité de tige (24), déflecteurs (25),
// chemises céramiques (27) à deux joints toriques (26), bagues d'appui (28),
// porte-joints (29) et joints (30) dans le collecteur d'aspiration (31,
// laiton, orifice 1 NPT dessous) tenu par quatre goujons (3), écrous (53) et
// rondelles Grower (55) ; dans chacun des trois cylindres (41, inox, joints
// toriques 40) : clapet d'aspiration (33), piston (34) et sa coupelle (34B),
// entretoise (35), porte-coupelle (36), rondelle conique (37), écrou à
// créneaux (38) et goupille fendue (39) ; collecteur de refoulement (52,
// laiton, deux orifices 3/4 NPT dessus dont un fermé par le bouchon 54) avec trois
// clapets silencieux (sièges 43, clapets 44, ressorts 45, cages 46, joints
// toriques 42 et bagues d'appui 66), serré par quatre vis de cylindre (47) à
// cales (48, 49, 50) ; rondelle d'arrêt (51) sous le protecteur ; outil
// d'emmanchement des coupelles (67, « non montré ») rangé sur le plan
// d'appui. Trousses (68, 69, 70) sans objet.
// Repère : origine sur le plan d'appui des pieds, à l'aplomb du milieu du
// vilebrequin ; X le long du vilebrequin (+X : bout d'arbre moteur), Y vers
// le haut, +Z vers la tête (axes des pistons selon Z, à y = 0.08 ;
// pistons à x = −0.045, 0, 0.045). Encombrement ≈ 0.33 (X, de −0.16 à
// 0.17) × 0.20 (Y) × 0.29 (Z, de −0.09 à 0.20) m.
// Cotes estimées (pompe triplex 3/4 po d'environ 5 kW, course 24 mm, piston
// Ø 36 mm) d'après les proportions des vues des pages 338 et 340.
// opts.noProtector : P338 pose son propre protecteur (même pièce, repère 4).
import { IN, nptThread } from './_fronta.js';

export const PUMPW = {
  ya: 0.08, // axe du vilebrequin et des pistons
  xs: [-0.045, 0, 0.045], // pistons
  drive: { x: 0.098, len: 0.045, r: 0.012 }, // bout d'arbre côté moteur (+X)
  inlet: [0, 0.08 - 0.06 - 0.011, 0.079], // face de l'orifice d'aspiration 1 NPT (bossage sous le collecteur 31), vers −Y
  outlets: [[-0.04, 0.08 + 0.045, 0.1725], [0.04, 0.08 + 0.045, 0.1725]], // orifices 3/4 NPT du dessus de 52, vers +Y (−X : bouchon 54)
  drain: [0.085, 0.03, -0.05], // face +X du carter, prise BSPP 1/4
};

export default function P340(api, opts = {}) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const YA = PUMPW.ya, XS = PUMPW.xs;
  const ZF = 0.055; // face avant du carter
  const Z31 = [0.058, 0.1], Z41 = [0.1, 0.15], Z52 = [0.15, 0.195];
  const rC = 0.022, rP = 0.018; // cylindre (ext.), piston

  // ---------------------------------------------------------------- 2 — carter (avec flasques de roulements)
  {
    const prof = [[-0.075, 0.015], [ZF, 0.015], [ZF, 0.15], [0.03, 0.165], [-0.058, 0.165], [-0.075, 0.148]];
    const body = S.extrude(prof.map(([z, y]) => [z, y]), 0.17, 'castAlu', { holes: [] });
    body.rotation.y = -Math.PI / 2; // (z, y) extrudé selon X
    const alu = [body];
    // Pieds : deux semelles longitudinales à trous oblongs, voiles de raccord.
    for (const z of [-0.062, 0.042]) {
      const foot = S.plate(0.23, 0.032, 0.012, 'castAlu', { r: 0.004, cutouts: [[-0.092, 0, 0.022, 0.011], [0.092, 0, 0.022, 0.011]] });
      foot.position.set(0, 0.006, z);
      alu.push(foot, S.box(0.17, 0.012, 0.02, 'castAlu', { r: 0.003, pos: [0, 0.018, z + (z < 0 ? 0.006 : -0.006)] }));
    }
    // Bossages des roulements et flasques (couvercles de roulements vissés).
    for (const s of [-1, 1]) {
      alu.push(S.cyl(0.05, 0.006, 'castAlu', { axis: 'x', seg: 36, pos: [s * 0.088, YA, -0.01] }));
      alu.push(S.lathe([[0.013, 0], [0.047, 0], [0.047, 0.008], [0.03, 0.012], [0.03, 0.02], [0.013, 0.02]], 'castAlu', { axis: s > 0 ? 'x' : '-x', seg: 32, pos: [s * 0.091, YA, -0.01] }));
    }
    // Bossage du remplissage (dessus), nervures du dessus, bossages des goujons en façade.
    alu.push(S.cyl(0.024, 0.008, 'castAlu', { seg: 28, pos: [0, 0.166, -0.02] }));
    for (const x of [-0.06, 0.06]) alu.push(S.box(0.008, 0.01, 0.08, 'castAlu', { r: 0.003, pos: [x, 0.166, -0.02] }));
    for (const x of XS) alu.push(S.cyl(0.016, 0.006, 'castAlu', { axis: 'z', seg: 24, pos: [x, YA, ZF + 0.003] }));
    // Plaque signalétique sur la face arrière gauche.
    P('2', S.group(S.merged(alu, 'castAlu'), S.at(S.nameplate(0.05, 0.03), [-0.05, 0.11, -0.0755], [0, Math.PI, 0])), [0, 0, 0]);
  }

  // ---------------------------------------------------------------- 1 — joint plat ; 8 — couvercle arrière ; 11 — vis
  P('1', S.box(0.15, 0.125, 0.0012, 'cream', { pos: [0, 0.088, -0.0756] }), [0, 0, -0.05]);
  {
    const cv = [S.box(0.155, 0.13, 0.008, 'castAlu', { r: 0.006, pos: [0, 0.088, -0.0802] })];
    for (const y of [0.06, 0.115]) cv.push(S.box(0.13, 0.008, 0.008, 'castAlu', { r: 0.003, pos: [0, y, -0.088] }));
    cv.push(S.cyl(0.02, 0.006, 'castAlu', { axis: 'z', seg: 28, pos: [0, 0.088, -0.087] }));
    cv.push(S.cyl(0.011, 0.006, 'castAlu', { axis: 'z', seg: 20, pos: [0.05, 0.03, -0.087] }));
    P('8', S.merged(cv, 'castAlu'), [0, 0, -0.1]);
  }
  const coverScrews = [[-0.068, 0.033], [0, 0.033], [0.068, 0.033], [-0.068, 0.143], [0, 0.148], [0.068, 0.143]];
  for (const [x, y] of coverScrews) {
    P('11', S.at(S.group(S.merged([
      S.lathe([[0, -0.016], [0.0028, -0.016], [0.003, 0], [0.0055, 0], [0.0055, 0.004], [0.004, 0.0055], [0, 0.0055]], 'zinc', { seg: 12 }),
      S.lathe([[0, 0.0055], [0.0018, 0.0055], [0.0018, 0.0035], [0, 0.0035]], 'zinc', { seg: 6 }),
    ], 'zinc')), [x, y, -0.0842], [-Math.PI / 2, 0, 0]), [0, 0, -0.14]);
  }
  // 6, 7 — joint et voyant d'huile (vitre, lunette six-pans, repère de niveau).
  P('6', S.torus(0.013, 0.0012, 'rubber', { axis: 'z', pos: [0, 0.088, -0.0902] }), [0, 0, -0.16]);
  P('7', S.group(
    S.merged([S.at(S.nut(0.032, 0.006, 'brass', { axis: 'z' }), [0, 0.088, -0.0935]), S.lathe([[0.0105, 0], [0.0125, 0], [0.0125, 0.003], [0.0105, 0.003]], 'brass', { axis: '-z', seg: 24, pos: [0, 0.088, -0.0965] })], 'brass'),
    S.cyl(0.0105, 0.002, 'glass', { axis: 'z', seg: 24, pos: [0, 0.088, -0.097] }),
    S.box(0.016, 0.0012, 0.0006, 'red', { pos: [0, 0.088, -0.0975] }),
  ), [0, 0, -0.2]);
  // 9, 10 — joint et bouchon de vidange (bas du couvercle).
  P('9', S.torus(0.0085, 0.0011, 'rubber', { axis: 'z', pos: [0.05, 0.03, -0.0902] }), [0, 0, -0.16]);
  P('10', S.at(S.group(S.merged([S.nut(0.016, 0.006, 'steel', { axis: 'z' }), S.cyl(0.009, 0.0015, 'steel', { axis: 'z', seg: 16, pos: [0, 0, 0.003] })], 'steel')), [0.05, 0.03, -0.0942]), [0, 0, -0.2]);

  // ---------------------------------------------------------------- 4, 5 — joint et bouchon de remplissage à reniflard
  P('4', S.torus(0.017, 0.0014, 'rubber', { pos: [0, 0.1702, -0.02] }), [0, 0.06, 0]);
  P('5', S.at(S.group(
    S.merged([
      S.lathe([[0, 0], [0.022, 0], [0.022, 0.006], [0.02, 0.008], [0.017, 0.008], [0.016, 0.016], [0.011, 0.022], [0, 0.023]], 'black', { seg: 28 }),
      ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return S.box(0.003, 0.007, 0.004, 'black', { pos: [Math.cos(a) * 0.022, 0.004, Math.sin(a) * 0.022], rot: [0, -a, 0] }); }),
    ], 'black'),
    S.lathe([[0, -0.03], [0.002, -0.03], [0.002, 0], [0, 0]], 'steel', { seg: 8 }),
  ), [0, 0.171, -0.02]), [0, 0.1, 0]);

  // ---------------------------------------------------------------- 12 — vilebrequin (trois manetons à 120°, course 24 mm)
  const ex = 0.012; // excentricité
  const pinAt = (i) => { const a = (i * 2 * Math.PI) / 3; return [YA + Math.cos(a) * ex, Math.sin(a) * ex]; }; // [y, z] du maneton i
  {
    const st = [];
    st.push(S.cyl(0.0175, 0.17, 'steel', { axis: 'x', seg: 24, pos: [0, YA, 0] }));
    // Bouts d'arbre : côté moteur Ø 24 claveté, côté protecteur Ø 24.
    st.push(S.lathe([[0, 0.085], [0.012, 0.085], [0.012, 0.14], [0.011, 0.142], [0, 0.142]], 'steel', { axis: 'x', seg: 24, pos: [0, YA, 0] }));
    st.push(S.box(0.03, 0.002, 0.008, 'steel', { pos: [0.125, YA + 0.0115, 0] }));
    st.push(S.lathe([[0, 0.085], [0.012, 0.085], [0.012, 0.118], [0.011, 0.12], [0, 0.12]], 'steel', { axis: '-x', seg: 24, pos: [0, YA, 0] }));
    // Manetons et flasques (contrepoids).
    XS.forEach((x, i) => {
      const [y, z] = pinAt(i);
      st.push(S.cyl(0.0135, 0.02, 'steel', { axis: 'x', seg: 20, pos: [x, y, z] }));
      for (const s of [-1, 1]) st.push(S.cyl(0.026, 0.006, 'steel', { axis: 'x', seg: 24, pos: [x + s * 0.013, YA + (y - YA) * 0.4, z * 0.4] }));
    });
    P('12', S.merged(st, 'steel'), [0, 0.14, 0]);
  }
  // 13 — roulements à rouleaux coniques ; 15 — joints toriques ; 14, 16 — bagues d'étanchéité ; 19 — vis des flasques
  for (const s of [-1, 1]) {
    P('13', S.bearing(0.031, 0.0175, 0.016, 'steel', { axis: 'x', pos: [s * 0.075, YA, 0] }), [s * 0.12, 0.14, 0]);
    P('15', S.torus(0.045, 0.0014, 'rubber', { axis: 'x', pos: [s * 0.0915, YA, -0.01] }), [s * 0.16, 0, 0]);
    P('14', S.lathe([[0.0122, 0], [0.02, 0], [0.02, 0.007], [0.0135, 0.007], [0.0122, 0.004]], 'rubber', { axis: s > 0 ? 'x' : '-x', seg: 24, pos: [s * 0.1045, YA, 0] }), [s * 0.2, 0, 0]);
    P('16', S.lathe([[0.0122, 0], [0.016, 0], [0.016, 0.004], [0.0122, 0.004]], 'rubber', { axis: s > 0 ? 'x' : '-x', seg: 20, pos: [s * 0.1115, YA, 0] }), [s * 0.24, 0, 0]);
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      const head = S.group(S.merged([
        S.lathe([[0, -0.018], [0.0028, -0.018], [0.003, 0], [0, 0]], 'zinc', { seg: 10 }),
        S.at(S.nut(0.008, 0.0045, 'zinc'), [0, 0.00225, 0]),
      ], 'zinc'));
      head.rotation.z = -s * Math.PI / 2;
      head.position.set(s * 0.099, YA + Math.sin(a) * 0.038, -0.01 + Math.cos(a) * 0.038);
      P('19', head, [s * 0.18, 0, 0]);
    }
  }
  // 18 — protecteur conique du bout d'arbre (côté −X) ; 51 — rondelle d'arrêt dessous.
  P('51', S.washer(0.016, 0.0125, 0.0015, 'steel', { axis: 'x', pos: [-0.1155, YA, 0] }), [-0.25, 0, 0]);
  if (!opts.noProtector) {
    P('18', S.lathe([[0.018, 0], [0.034, 0], [0.034, 0.008], [0.028, 0.012], [0.014, 0.055], [0.01, 0.062], [0, 0.063]], 'black', { axis: '-x', seg: 32, pos: [-0.112, YA, 0] }), [-0.3, 0, 0]);
  }

  // ---------------------------------------------------------------- équipage mobile (×3)
  XS.forEach((x, i) => {
    const [yp, zp] = pinAt(i);
    const zx = 0.03 + (zp - 0) * 0; // axe de pied de bielle
    // 20 — bielle : tête à chapeau et deux vis, corps en I, pied.
    const ang = Math.atan2(yp - YA, zx - zp);
    const len = Math.hypot(yp - YA, zx - zp);
    const rod = S.group(
      S.merged([
        S.cyl(0.02, 0.014, 'castAlu', { axis: 'x', seg: 20, pos: [x, yp, zp] }),
        S.box(0.012, 0.012, len, 'castAlu', { r: 0.003, pos: [x, (yp + YA) / 2, (zp + zx) / 2], rot: [ang, 0, 0] }),
        S.cyl(0.011, 0.014, 'castAlu', { axis: 'x', seg: 18, pos: [x, YA, zx] }),
      ], 'castAlu'),
      S.merged([-1, 1].map((sx) => S.cyl(0.003, 0.03, 'steel', { seg: 8, pos: [x + sx * 0.0045, yp, zp - 0.012] })), 'steel'),
    );
    P('20', rod, [0, 0.1, 0]);
    // 22 — axe de pied ; 23 — rondelle.
    P('22', S.cyl(0.007, 0.026, 'steel', { axis: 'x', seg: 14, pos: [x, YA, zx] }), [0.03, 0.06, 0]);
    P('23', S.washer(0.0125, 0.0085, 0.0015, 'steel', { axis: 'z', pos: [x, YA, ZF - 0.006] }), [0, 0.04, 0.05]);
    // 21 — crosse et tige de piston (de la crosse au piston).
    const zT = Z41[0] + 0.03; // bout de tige (dans le cylindre)
    P('21', S.group(S.merged([
      S.cyl(0.0125, 0.026, 'steel', { axis: 'z', seg: 20, pos: [x, YA, zx + 0.005] }),
      S.lathe([[0, zx + 0.018], [0.008, zx + 0.018], [0.008, zT - 0.006], [0.006, zT - 0.006], [0.006, zT + 0.012], [0, zT + 0.012]], 'steel', { axis: 'z', seg: 16, pos: [x, YA, 0] }),
    ], 'steel')), [0, 0, 0.12]);
    // 24 — bague d'étanchéité de tige (face avant du carter) ; 25 — déflecteur.
    P('24', S.lathe([[0.008, 0], [0.0135, 0], [0.0135, 0.005], [0.009, 0.005]], 'rubber', { axis: 'z', seg: 20, pos: [x, YA, ZF - 0.004] }), [0, 0, 0.06]);
    P('25', S.lathe([[0.008, 0], [0.012, 0], [0.012, 0.0015], [0.0095, 0.0015], [0.0095, 0.004], [0.008, 0.004]], 'rubber', { axis: 'z', seg: 20, pos: [x, YA, ZF + 0.0015] }), [0, 0, 0.08]);
    // 27 — chemise céramique sur la tige ; 26 — ses deux joints toriques.
    P('27', S.lathe([[0.0081, 0], [0.0098, 0], [0.0098, 0.06], [0.0081, 0.06]], 'white', { axis: 'z', seg: 20, pos: [x, YA, ZF + 0.006] }), [0, 0, 0.16]);
    for (const dz of [0.007, 0.065]) P('26', S.torus(0.0082, 0.0007, 'rubber', { axis: 'z', pos: [x, YA, ZF + dz] }), [0, 0, 0.17]);
    // 28 — bague d'appui ; 29 — porte-joint ; 30 — joint (logés à l'arrière du collecteur 31).
    P('28', S.washer(0.014, 0.0099, 0.0015, 'white', { axis: 'z', pos: [x, YA, Z31[0] + 0.004] }), [0, 0.02, 0.1]);
    P('29', S.lathe([[0.0099, 0], [0.016, 0], [0.016, 0.008], [0.0125, 0.01], [0.0099, 0.01]], 'brass', { axis: 'z', seg: 20, pos: [x, YA, Z31[0] + 0.005] }), [0, 0.03, 0.12]);
    P('30', S.lathe([[0.0099, 0], [0.0135, 0], [0.0135, 0.006], [0.0099, 0.005]], 'black', { axis: 'z', seg: 20, pos: [x, YA, Z31[0] + 0.015] }), [0, 0.04, 0.14]);
    // 33 — clapet d'aspiration (disque et cage à l'avant du collecteur, autour de la tige).
    P('33', S.lathe([[0.0062, 0], [0.0165, 0], [0.0165, 0.002], [0.012, 0.004], [0.012, 0.007], [0.0062, 0.007]], 'steel', { axis: 'z', seg: 20, pos: [x, YA, Z31[1] - 0.012] }), [0, 0.05, 0.16]);
    // Piston : 35 entretoise, 34 piston, 34B coupelle, 36 porte-coupelle, 37 rondelle conique, 38 écrou à créneaux, 39 goupille.
    const z0 = Z41[0] + 0.012;
    P('35', S.lathe([[0.0061, 0], [0.011, 0], [0.011, 0.006], [0.0061, 0.006]], 'steel', { axis: 'z', seg: 18, pos: [x, YA, z0] }), [0, 0.06, 0.2]);
    P('34', S.lathe([[0.0061, 0], [rP - 0.003, 0], [rP - 0.003, 0.004], [rP - 0.006, 0.006], [rP - 0.006, 0.012], [0.0061, 0.012]], 'brass', { axis: 'z', seg: 24, pos: [x, YA, z0 + 0.006] }), [0, 0.07, 0.22]);
    P('34B', S.lathe([[rP - 0.006, 0], [rP, 0], [rP, 0.002], [rP - 0.0015, 0.009], [rP - 0.006, 0.01]], 'black', { axis: 'z', seg: 24, pos: [x, YA, z0 + 0.008] }), [0, 0.08, 0.24]);
    P('36', S.lathe([[0.0061, 0], [rP - 0.004, 0], [rP - 0.004, 0.003], [0.0061, 0.003]], 'brass', { axis: 'z', seg: 22, pos: [x, YA, z0 + 0.018] }), [0, 0.09, 0.26]);
    P('37', S.lathe([[0.0061, 0], [0.011, 0.0015], [0.011, 0.0025], [0.0061, 0.001]], 'steel', { axis: 'z', seg: 18, pos: [x, YA, z0 + 0.021] }), [0, 0.1, 0.28]);
    P('38', S.group(S.merged([
      S.at(S.nut(0.016, 0.006, 'steel', { axis: 'z' }), [x, YA, z0 + 0.0265]),
      ...[0, 1, 2].map((k) => S.box(0.0025, 0.017, 0.003, 'steel', { pos: [x, YA, z0 + 0.0305], rot: [0, 0, (k * Math.PI) / 3] })),
    ], 'steel')), [0, 0.11, 0.3]);
    P('39', S.group(S.merged([
      S.cyl(0.0008, 0.02, 'steel', { seg: 6, pos: [x, YA, z0 + 0.0305] }),
      S.torus(0.0018, 0.0008, 'steel', { axis: 'x', pos: [x, YA + 0.0115, z0 + 0.0305] }),
    ], 'steel')), [0, 0.13, 0.3]);
    // 40 — joints toriques des cylindres (deux) ; 41 — cylindre inox.
    for (const z of [Z41[0] + 0.002, Z41[1] - 0.002]) P('40', S.torus(rC - 0.002, 0.0013, 'rubber', { axis: 'z', pos: [x, YA, z] }), [0, 0, z > 0.12 ? 0.2 : 0.06]);
    P('41', S.group(S.merged([
      S.lathe([[rP, 0], [rC, 0], [rC, Z41[1] - Z41[0]], [rP, Z41[1] - Z41[0]], [rP, 0]], 'steel', { axis: 'z', seg: 28, pos: [x, YA, Z41[0]] }),
    ], 'steel')), [0, 0, 0.14]);
    // Clapet de refoulement silencieux : 42 joint torique, 66 bague d'appui, 43 siège, 44 clapet, 45 ressort, 46 cage.
    const zv = Z52[0] + 0.004;
    P('42', S.torus(0.0135, 0.0011, 'rubber', { axis: 'z', pos: [x, YA, zv] }), [0, 0.04, 0.3]);
    P('66', S.washer(0.0145, 0.0125, 0.0012, 'white', { axis: 'z', pos: [x, YA, zv + 0.0025] }), [0, 0.05, 0.32]);
    P('43', S.lathe([[0.007, 0], [0.0125, 0], [0.0125, 0.006], [0.009, 0.008], [0.007, 0.008]], 'steel', { axis: 'z', seg: 20, pos: [x, YA, zv + 0.003] }), [0, 0.06, 0.34]);
    P('44', S.lathe([[0, 0], [0.0095, 0], [0.0095, 0.0015], [0.004, 0.004], [0, 0.004]], 'steel', { axis: 'z', seg: 18, pos: [x, YA, zv + 0.011] }), [0, 0.07, 0.36]);
    P('45', S.spring(0.006, 0.0007, 0.012, 4, 'steel', { axis: 'z', pos: [x, YA, zv + 0.021] }), [0, 0.08, 0.38]);
    P('46', S.slotted(0.011, 0.0095, zv + 0.013, zv + 0.03, [0, 1, 2].map((k) => ({ a: (k * 2 * Math.PI) / 3, w: 1.0, y0: zv + 0.016, y1: zv + 0.026 })), 'brass', { axis: 'z', seg: 20, pos: [x, YA, 0] }), [0, 0.09, 0.4]);
  });

  // ---------------------------------------------------------------- 31 — collecteur d'aspiration (laiton)
  const studs = [[-0.0225, YA + 0.051], [0.0225, YA + 0.051], [-0.0225, YA - 0.051], [0.0225, YA - 0.051]];
  const cylBolts = [[-0.079, YA - 0.03], [0.079, YA - 0.03], [-0.079, YA + 0.03], [0.079, YA + 0.03]];
  {
    const br = [S.box(0.18, 0.12, Z31[1] - Z31[0], 'brass', { r: 0.006, pos: [0, YA, (Z31[0] + Z31[1]) / 2] })];
    // Orifice 1 NPT : bossage dessous (vrai taraudage).
    const rn = (1.315 * IN) / 2;
    br.push(S.lathe([[rn * 0.95, 0], [rn * 1.45, 0], [rn * 1.45, 0.008], [rn * 1.38, 0.011], [rn * 0.95, 0.011]], 'brass', { axis: '-y', seg: 28, pos: [0, YA - 0.06, (Z31[0] + Z31[1]) / 2] }));
    for (const x of XS) br.push(S.cyl(rC + 0.003, 0.004, 'brass', { axis: 'z', seg: 24, pos: [x, YA, Z31[1] + 0.002] }));
    P('31', S.merged(br, 'brass'), [0, -0.05, 0.12]);
  }
  // 3 — goujons du collecteur (vissés dans le carter) ; 55 — rondelles Grower ; 53 — écrous.
  for (const [x, y] of studs) {
    P('3', S.lathe([[0, ZF - 0.012], [0.0039, ZF - 0.012], ...S.thread(0.004, ZF - 0.01, Z31[1] + 0.014, { pitch: 0.0012, maxTurns: 14 }), [0.0035, Z31[1] + 0.016], [0, Z31[1] + 0.016]], 'steel', { axis: 'z', seg: 12, pos: [x, y, 0] }), [0, 0, 0.1]);
    P('55', S.slotted(0.0072, 0.0042, Z31[1], Z31[1] + 0.002, [{ a: 0, w: 0.15, y0: Z31[1] - 0.001, y1: Z31[1] + 0.003 }], 'zinc', { axis: 'z', seg: 16, pos: [x, y, 0] }), [0, 0, 0.18]);
    P('53', S.nut(0.013, 0.0065, 'zinc', { axis: 'z', pos: [x, y, Z31[1] + 0.002 + 0.00325] }), [0, 0, 0.22]);
  }

  // ---------------------------------------------------------------- 52 — collecteur de refoulement (laiton) ; 54 — bouchon
  {
    const br = [S.box(0.18, 0.09, Z52[1] - Z52[0], 'brass', { r: 0.008, pos: [0, YA, (Z52[0] + Z52[1]) / 2] })];
    const rn = (1.05 * IN) / 2;
    for (const [x, y, z] of PUMPW.outlets) br.push(S.lathe([[rn * 0.95, -0.006], [rn * 1.5, -0.006], [rn * 1.5, 0], [rn * 0.95, 0]], 'brass', { seg: 28, pos: [x, y, z] }));
    // Bouchons des clapets (trois six-pans en façade).
    for (const x of XS) br.push(S.at(S.nut(0.03, 0.008, 'brass', { axis: 'z' }), [x, YA, Z52[1] + 0.004]));
    P('52', S.merged(br, 'brass'), [0, 0, 0.3]);
    // 54 — bouchon 3/4 NPT à six-pans creux dans le second orifice du dessus (côté −X).
    const [xo, yo, zo] = PUMPW.outlets[0];
    P('54', S.at(S.group(S.merged([
      S.lathe([[0, -0.016], ...nptThread(S, rn, -0.016, 0), [rn * 1.02, 0], [rn * 1.02, 0.002], [0.005, 0.002], [0.005, -0.004], [0, -0.004]], 'steel', { seg: 16 }),
    ], 'steel')), [xo, yo, zo]), [0, 0.08, 0.2]);
  }
  // 47 — vis de cylindre (tête H en façade) ; 48, 49, 50 — cales 0.060, 0.020 et 0.012 po sous la tête.
  for (const [x, y] of cylBolts) {
    const zf = Z52[1];
    const t48 = 0.06 * IN, t49 = 0.02 * IN, t50 = 0.012 * IN;
    P('48', S.washer(0.0075, 0.0042, t48, 'steel', { axis: 'z', pos: [x, y, zf + t48 / 2] }), [0, 0, 0.36]);
    P('49', S.washer(0.0075, 0.0042, t49, 'steel', { axis: 'z', pos: [x, y, zf + t48 + t49 / 2] }), [0, 0, 0.38]);
    P('50', S.washer(0.0075, 0.0042, t50, 'steel', { axis: 'z', pos: [x, y, zf + t48 + t49 + t50 / 2] }), [0, 0, 0.4]);
    const zh = zf + t48 + t49 + t50;
    P('47', S.lathe([[0, Z31[0] + 0.01], [0.0038, Z31[0] + 0.01], ...S.thread(0.004, Z31[0] + 0.012, Z31[1] - 0.002, { pitch: 0.0012, maxTurns: 10 }), [0.004, zh], [0.0075, zh], [0.0075, zh + 0.0045], [0.0062, zh + 0.0055], [0, zh + 0.0055]], 'steel', { axis: 'z', seg: 6, pos: [x, y, 0] }), [0, 0, 0.44]);
  }

  // ---------------------------------------------------------------- 67 — outil d'emmanchement des coupelles (rangé)
  P('67', S.lathe([[rP - 0.003, 0], [rP + 0.002, 0], [rP + 0.003, 0.045], [rP - 0.002, 0.05], [rP - 0.0045, 0.05], [rP - 0.003, 0]], 'steel', { axis: 'x', seg: 24, pos: [-0.02, rP + 0.003, -0.12] }), [0, 0.05, -0.08]);

  return { view: { dir: [0.9, 0.7, 1.1] } };
}
