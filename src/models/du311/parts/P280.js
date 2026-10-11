// P280 — Compresseur DU311-TK CX030780 rév. 2 (page 280) : « ASSEMBLY,
// COMPRESSOR, DU311-TK », repère 10 de P274. Le surpresseur Le Roi complet
// (P282, 6) et sa tuyauterie de culasses :
//   · aspiration (bride +X de chaque culasse) : bloc adaptateur (9) tenu par
//     deux vis CHC 1/2 × 3 (21, rondelles 23), coude 90° ORB/JIC -24 (10)
//     tourné vers l'extérieur du cylindre — départ des boyaux 21 de P274 ;
//   · refoulement (bride −X) : joint (5), bride ORB -24 (8) à trois vis CHC
//     3/8 × 1 1/4 (20, rondelles 22) ; culasse centrale : raccord droit ORB /
//     NPT (11) dans la croix 2 po classe 300 (4) ; culasses latérales :
//     raccords droits ORB/JIC (7) et flexibles JIC 34 po (19) jusqu'aux
//     coudes MNPT-JIC -24 (12) vissés dans les réductions 2 × 1 1/2 (15) des
//     branches ±Z de la croix ; joints toriques haute température (1) sous
//     les trois raccords ORB 7 et 11 ;
//   · sortie : mamelon court (18), té 2 po (17) avec réduction 2 × 1/2 (14),
//     doigt de gant inox (2) et thermomètre (3) sur sa branche haute,
//     second mamelon (18), coude femelle 90° 2 po (16) vers le bas, réduction
//     (15) et adaptateur droit -32 (13).
// Sens des orifices d'après la page 280 (croix de refoulement côté opposé à
// la poulie, blocs d'aspiration côté poulie) : les deux brides losangées de
// P290 servent l'une de refoulement (−X), l'autre d'aspiration (+X) ; trois
// vis par bride 8 (deux dans les trous de la bride de culasse, la troisième
// au-dessus, dans le bossage).
// Repère : repère du bloc LR (_moteur_surpresseur.js) — origine sur l'axe du
// vilebrequin au droit du cylindre central, +X vers la poulie, Y haut, +Z =
// X × Y ; P282 inséré à l'origine. Dessous des pattes à y = LR.footY. Sortie
// d'air (adaptateur 13) vers le bas derrière la culasse centrale.
// Encombrement ≈ 0.62 (X) × 0.92 (Y) × 0.85 (Z) m.
import { LR, ACC, IN } from './_moteur_surpresseur.js';

export default function P280(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, plate, bolt, washer, torus, hose, gauge, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const YP = 0.305, XF = 0.074; // brides de culasse (repère de cylindre)

  // Repère de cylindre i → repère du bloc.
  const T = (i, [x, y, z]) => {
    const { a, x: cx } = LR.cyl[i];
    return [cx + x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  };
  const D = (i, v) => { const p = T(i, v); return [p[0] - LR.cyl[i].x, p[1], p[2]]; };
  const onCyl = (i, obj) => at(group(obj), [LR.cyl[i].x, 0, 0], [LR.cyl[i].a, 0, 0]);
  const out = (i, d) => { const u = D(i, [0, 1, 0]); return [u[0] * d, u[1] * d, u[2] * d]; };

  P('6', api.sub('P282', { noShipping: true }), [0, 0, 0]);

  // ---------------------------------------------------------------- aspiration (+X)
  const XB = XF + 0.045; // face extérieure du bloc 9
  for (let i = 0; i < 3; i++) {
    // 1 — joint torique haute température entre la bride d'aspiration et le bloc 9.
    P('1', onCyl(i, at(torus(0.0175, 0.0018, 'rubber', { axis: 'x' }), [XF + 0.0008, YP, 0])), [0.08, ...out(i, 0.12).slice(1)]);
    P('9', onCyl(i, group(
      box(XB - XF, 0.07, 0.078, 'darkSteel', { r: 0.004, pos: [(XF + XB) / 2, YP, 0] }),
      at(cyl(0.017, 0.003, 'blackOxide', { axis: 'x', seg: 20 }), [XB + 0.0012, YP, 0]),
    )), [0.12, ...out(i, 0.08).slice(1)]);
    for (const z of [-0.025, 0.025]) {
      P('23', onCyl(i, at(washer(0.0135, 0.007, 0.0025, 'blackOxide', { axis: 'x' }), [XB + 0.00125, YP, z])), [0.16, ...out(i, 0.08).slice(1)]);
      P('21', onCyl(i, at(bolt(0.5 * IN, 3 * IN, 'blackOxide', { axis: 'x', head: 'socket' }), [XB + 0.0025, YP, z])), [0.22, ...out(i, 0.08).slice(1)]);
    }
    // 10 — coude 90° ORB/JIC -24 vissé dans la face +X du bloc, embout vers +Y du cylindre.
    const el = ACC.orient(api, ACC.elbow(S, { a: 24, aType: 'orb' }), [XB, YP, 0.012], [1, 0, 0], [0, 1, 0]);
    P('10', onCyl(i, el), [0.2, ...out(i, 0.16).slice(1)]);
  }

  // ---------------------------------------------------------------- refoulement (−X)
  const XG = -XF - 0.0015, X8 = XG - 0.016; // joint, face extérieure de la bride 8
  const lozenge = () => {
    const s = new THREE.Shape();
    s.moveTo(-0.017, 0.025); s.absarc(0, 0.025, 0.017, Math.PI, 0, true);
    s.lineTo(0.024, 0); s.absarc(0, -0.025, 0.017, 0, -Math.PI, true); s.lineTo(-0.024, 0); s.closePath();
    const h = new THREE.Path(); h.absarc(0, 0, 0.0185, 0, Math.PI * 2, true); s.holes.push(h);
    return s;
  };
  const flat = (shape, x0, x1, mat) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 8 });
    g.rotateY(-Math.PI / 2);
    g.translate(x1, YP, 0);
    return new THREE.Mesh(g, box(0.01, 0.01, 0.01, mat).material);
  };
  const tips = [];
  for (let i = 0; i < 3; i++) {
    P('5', onCyl(i, flat(lozenge(), XG, -XF, 'cream')), [-0.06, ...out(i, 0.05).slice(1)]);
    // 8 — bride ORB -24 : carré à trois oreilles, orifice taraudé.
    const fl = new THREE.Shape();
    fl.moveTo(-0.035, -0.035); fl.lineTo(0.035, -0.035); fl.lineTo(0.035, 0.035); fl.lineTo(0.012, 0.055); fl.lineTo(-0.012, 0.055); fl.lineTo(-0.035, 0.035); fl.closePath();
    const hh = new THREE.Path(); hh.absarc(0, 0, 0.019, 0, Math.PI * 2, true); fl.holes.push(hh);
    // Forme dessinée dans le plan (z, y) : la rotation de flat() met x → −z.
    P('8', onCyl(i, flat(fl, X8, XG, 'darkSteel')), [-0.1, ...out(i, 0.05).slice(1)]);
    for (const [y, z] of [[YP, -0.025], [YP, 0.025], [YP + 0.044, 0]]) {
      P('22', onCyl(i, at(washer(0.0105, 0.0055, 0.002, 'blackOxide', { axis: '-x' }), [X8 - 0.001, y, z])), [-0.14, ...out(i, 0.05).slice(1)]);
      P('20', onCyl(i, at(bolt(0.375 * IN, 1.25 * IN, 'blackOxide', { axis: '-x', head: 'socket' }), [X8 - 0.002, y, z])), [-0.2, ...out(i, 0.05).slice(1)]);
    }
    // Raccord ORB dans la bride (11 au centre vers la croix, 7 sur les latéraux).
    const fit = ACC.orient(api, ACC.straight(S, { a: 24, b: i === 1 ? 32 : 24, aType: 'orb' }), [X8, YP, 0], [-1, 0, 0], [0, 1, 0]);
    P(i === 1 ? '11' : '7', onCyl(i, fit), [-0.18, ...out(i, 0.1).slice(1)]);
    tips.push(T(i, [X8 - fit.children[0].userData.tip, YP, 0]));
  }

  // ---------------------------------------------------------------- refoulement central, croix, sortie
  // Page 280 : raccord 11 → réduction 15 → coude 16 qui descend → mamelon 18
  // vertical → croix 4 (bras ±Y, ±Z) ; bras bas et −Z : réductions 15 et
  // coudes 12 (vers −X) qui reçoivent les flexibles 19 ; bras +Z : mamelon
  // 18, té 17 dans l'axe, réduction 14 + doigt de gant 2 + thermomètre 3 en
  // bout, adaptateur de sortie 13 sur la branche du té, vers −X.
  const E3 = 0.012; // engagement d'un filet NPT
  const el16 = ACC.pipeElbow(S, 32, { forged: true });
  const A16 = el16.userData.a;
  const XC = tips[1][0] - 0.02 - A16; // axe vertical de la descente
  P('15', ACC.orient(api, ACC.hexBushing(S, 32, 24), [tips[1][0] - 0.02 + 0.006, YP, 0], [1, 0, 0], [0, 1, 0]), [-0.25, 0.08, 0]);
  P('16', ACC.orient(api, el16, [XC, YP, 0], [-1, 0, 0], [0, -1, 0]), [-0.3, 0.05, 0]);
  const L18 = 0.075;
  const y18 = YP - A16 + E3;
  P('18', ACC.orient(api, ACC.nipple(S, 32, L18, 'darkSteel', { sch: 80 }), [XC, y18, 0], [0, -1, 0], [1, 0, 0]), [-0.3, -0.02, 0]);
  const cross = ACC.pipeTee(S, 32, { cross: true });
  const A4 = cross.userData.a;
  const YC = y18 - L18 + E3 - A4;
  P('4', ACC.orient(api, cross, [XC, YC, 0], [0, 1, 0], [0, 0, 1]), [-0.3, -0.1, 0]);
  const elbTips = [];
  for (const d of [[0, -1, 0], [0, 0, -1]]) {
    const pf = [XC + d[0] * A4, YC + d[1] * A4, d[2] * A4];
    P('15', ACC.orient(api, ACC.hexBushing(S, 32, 24), pf, d, [1, 0, 0]), [-0.3, -0.1 + d[1] * 0.1, d[2] * 0.12]);
    const e = ACC.elbow(S, { a: 24, b: 24 });
    const pe = [pf[0], pf[1] + d[1] * E3, pf[2] + d[2] * E3];
    P('12', ACC.orient(api, e, pe, d, [-1, 0, 0]), [-0.35, -0.1 + d[1] * 0.18, d[2] * 0.2]);
    const [ox, oy] = e.userData.out;
    elbTips.push([pe[0] - ox, pe[1] + d[1] * oy, pe[2] + d[2] * oy]);
  }
  const z18 = A4 - E3;
  P('18', ACC.orient(api, ACC.nipple(S, 32, L18, 'darkSteel', { sch: 80 }), [XC, YC, z18], [0, 0, 1], [1, 0, 0]), [-0.3, -0.1, 0.12]);
  const tee = ACC.pipeTee(S, 32);
  const A17 = tee.userData.a;
  const ZT = z18 + L18 - E3 + A17;
  P('17', ACC.orient(api, tee, [XC, YC, ZT], [0, 0, 1], [-1, 0, 0]), [-0.3, -0.1, 0.2]);
  const zB = ZT + A17;
  P('14', ACC.orient(api, ACC.hexBushing(S, 32, 8), [XC, YC, zB], [0, 0, 1], [1, 0, 0]), [-0.3, -0.1, 0.28]);
  P('2', ACC.orient(api, lathe([[0, -0.064], [0.0055, -0.064], [0.0065, -0.06], [0.0065, -0.01], [0.009, -0.006], [0.009, 0], [0.012, 0], [0.012, 0.012], [0.006, 0.016], [0, 0.016]], 'steel', { seg: 16 }), [XC, YC, zB + 0.011], [0, 0, 1], [1, 0, 0]), [-0.3, -0.1, 0.36]);
  P('3', group(
    at(cyl(0.004, 0.03, 'steel', { axis: 'z', seg: 10 }), [XC, YC, zB + 0.04]),
    at(gauge(0.032, { axis: 'z' }), [XC, YC + 0.032, zB + 0.06]),
  ), [-0.3, -0.1, 0.45]);
  P('13', ACC.orient(api, ACC.straight(S, { a: 32, b: 32 }), [XC - A17, YC, ZT], [-1, 0, 0], [0, 1, 0]), [-0.45, -0.1, 0.2]);

  // ---------------------------------------------------------------- 19 — flexibles JIC 34 po
  // Boucles en U à peu près horizontales, à la hauteur des brides : des
  // raccords 7 des culasses latérales vers −X, au-delà de la croix, puis
  // retour sur les coudes 12 (bras −Z de la croix pour le cylindre −60°,
  // bras bas pour le cylindre +60°).
  [[0, 1], [2, 0]].forEach(([i, k]) => {
    const a = tips[i], b = elbTips[k];
    const xm = XC - 0.25;
    const pts = [
      a, [a[0] - 0.06, a[1], a[2]], [xm, (a[1] + b[1]) / 2 + 0.02, a[2] * 0.8],
      [xm - 0.04, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [b[0] - 0.12, b[1], b[2]], [b[0] - 0.05, b[1], b[2]], b,
    ];
    P('19', hose(pts, 0.019), [-0.3, 0.05, (i === 0 ? -1 : 1) * 0.2]);
  });

  void plate; void merged;
  return { view: { dir: [-1.0, 0.75, 1.1] } };
}
