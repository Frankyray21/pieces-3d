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

  P('6', api.sub('P282'), [0, 0, 0]);

  // ---------------------------------------------------------------- aspiration (+X)
  const XB = XF + 0.045; // face extérieure du bloc 9
  for (let i = 0; i < 3; i++) {
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
    P('1', onCyl(i, at(torus(0.0175, 0.0018, 'rubber', { axis: 'x' }), [X8 - 0.0012, YP, 0])), [-0.15, ...out(i, 0.12).slice(1)]);
    tips.push(T(i, [X8 - fit.children[0].userData.tip, YP, 0]));
  }

  // ---------------------------------------------------------------- croix, sortie
  const R2 = ACC.pipeOD(32) / 2;
  const cross = ACC.pipeTee(S, 32, { cross: true });
  const A = cross.userData.a;
  const XC = tips[1][0] - A + 0.01; // croix emboîtée sur le raccord 11
  const C = [XC, YP, 0];
  P('4', ACC.orient(api, cross, C, [-1, 0, 0], [0, 0, 1]), [-0.3, 0.05, 0]);
  // 15 et 12 — réductions et coudes des branches ±Z, embouts JIC vers le haut.
  const elbTips = [];
  for (const s of [-1, 1]) {
    const pz = s * A;
    P('15', ACC.orient(api, ACC.hexBushing(S, 32, 24), [XC, YP, pz], [0, 0, s], [1, 0, 0]), [-0.3, 0.05, s * 0.12]);
    const e = ACC.elbow(S, { a: 24, b: 24 });
    P('12', ACC.orient(api, e, [XC, YP, pz + s * 0.012], [0, 0, s], [0, 1, 0]), [-0.3, 0.12, s * 0.2]);
    elbTips.push([XC, YP + e.userData.out[0], pz + s * (0.012 + e.userData.out[1])]);
  }
  // 18, 17, 14, 2, 3 — mamelon, té et thermomètre.
  const L18 = 0.075;
  P('18', ACC.orient(api, ACC.nipple(S, 32, L18, 'darkSteel', { sch: 80 }), [XC - A + 0.018, YP, 0], [-1, 0, 0], [0, 1, 0]), [-0.4, 0.05, 0]);
  const tee = ACC.pipeTee(S, 32);
  const XT = XC - A - L18 + 0.036 - tee.userData.a;
  P('17', ACC.orient(api, tee, [XT, YP, 0], [-1, 0, 0], [0, 1, 0]), [-0.5, 0.05, 0]);
  const yB = YP + tee.userData.a;
  P('14', at(ACC.hexBushing(S, 32, 8), [XT, yB, 0]), [-0.5, 0.15, 0]);
  P('2', group(
    lathe([[0, -0.064], [0.0055, -0.064], [0.0065, -0.06], [0.0065, -0.01], [0.009, -0.006], [0.009, 0], [0.012, 0], [0.012, 0.012], [0.006, 0.016], [0, 0.016]], 'steel', { seg: 16, pos: [XT, yB + 0.011, 0] }),
  ), [-0.5, 0.22, 0]);
  P('3', group(
    at(cyl(0.004, 0.03, 'steel', { seg: 10 }), [XT, yB + 0.042, 0]),
    at(gauge(0.032, { axis: '-x' }), [XT - 0.0, yB + 0.09, 0]),
  ), [-0.5, 0.3, 0]);
  P('18', ACC.orient(api, ACC.nipple(S, 32, L18, 'darkSteel', { sch: 80 }), [XT - tee.userData.a + 0.018, YP, 0], [-1, 0, 0], [0, 1, 0]), [-0.6, 0.05, 0]);
  // 16, 15, 13 — coude 90° vers le bas, réduction, adaptateur de sortie -32.
  const el16 = ACC.pipeElbow(S, 32, { forged: true });
  const XE = XT - tee.userData.a - L18 + 0.036 - el16.userData.a;
  P('16', ACC.orient(api, el16, [XE, YP, 0], [1, 0, 0], [0, -1, 0]), [-0.7, 0, 0]);
  const yO = YP - el16.userData.a;
  P('15', ACC.orient(api, ACC.hexBushing(S, 32, 24), [XE, yO, 0], [0, -1, 0], [1, 0, 0]), [-0.7, -0.08, 0]);
  P('13', ACC.orient(api, ACC.straight(S, { a: 24, b: 32 }), [XE, yO - 0.012, 0], [0, -1, 0], [1, 0, 0]), [-0.7, -0.15, 0]);

  // ---------------------------------------------------------------- 19 — flexibles JIC 34 po
  // Des raccords 7 des culasses latérales aux coudes 12 de la croix, en
  // boucle au-dessus (vue de face de la page 280).
  [[0, 0], [2, 1]].forEach(([i, k]) => {
    const a = tips[i], b = elbTips[k];
    const s = k === 0 ? -1 : 1;
    const pts = [
      a, [a[0] - 0.05, a[1] + 0.01, a[2]], [a[0] - 0.12, a[1] + 0.12, a[2] + s * 0.02],
      [b[0] - 0.04, b[1] + 0.2, b[2] + s * 0.05], [b[0], b[1] + 0.09, b[2]], b,
    ];
    P('19', hose(pts, 0.019), [-0.25, 0.3, s * 0.15]);
  });

  void plate; void merged;
  return { view: { dir: [-1.0, 0.75, 1.1] } };
}
