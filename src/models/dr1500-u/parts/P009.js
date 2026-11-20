// P009 — Waterpack PA701 (page 9, 9 repères) : cadre à couvercle, réservoir d'eau, pompe à eau sur son support
// (P010), trois couvercles du réservoir, débitmètre électromagnétique, réducteur de pression, flotteur.
// Repère local (layout.js, ROOT.WATER) : origine au sol sous le centre du cadre ; X le long du cadre ; Y vers le
// haut ; Z vers la face avant (fourreaux de fourche, trou rond, ouverture du haut ; couvercle à charnières à l'arrière).
// Aucune cote au manuel : proportions mesurées sur la page 9 (cadre ≈ 1,3 : 0,8 : 1,05 en longueur, profondeur,
// hauteur), échelle tirée de la pompe Pratissoli KF40 (≈ 0,42 m de culasse à carter, catalogue) posée dans le
// compartiment du haut [mesure, ±10 %] ; même famille que le waterpack du STM-1500 [STM, ordre de grandeur].
// Cadre peint au rouge Machines Roger (demande du client ; le manuel est en noir et blanc) ; réservoir d'eau en acier gris.
import { slab, bent, arc, rect, poignee } from './_groupes.js';

// Cadre PA701 [mesure p. 9].
const WP = { x1: 0.65, z1: 0.4, H: 1.05, base: 0.12, t: 0.005, rail: 0.63 };
// Réservoir PA715 dans le compartiment du bas, couvercles au ras de son cadre du dessus [mesure p. 9].
const TK = { x0: -0.58, x1: 0.58, z0: -0.33, z1: 0.27, y0: WP.base + 0.005, y1: 0.6, f: 0.04 };
// Support de la pompe (P010) posé sur les longerons intérieurs à z = ±0,22 [mesure ; voir SUP dans P010.js].
const PUMP = [-0.08, WP.rail + 0.02, 0];

export default function P009(api) {
  const S = api.S, { box, cyl, lathe, at, group, merged, tube, ring, fitting, rod } = S;
  const { x1, z1, H, base, t } = WP;
  const Y = [];

  // ------------------------------------------------------------------ 1 — Water pack PA701 (cadre)
  // Base : jupe de 0,12 m, deux fourreaux de fourche traversants (face avant et arrière), plancher, quatre oreilles
  // d'arrimage percées aux coins ; cornières d'angle, pattes de levage percées au-dessus des coins ; faces :
  // avant basse percée d'un trou rond (regard du thermomètre du réservoir) et avant médiane, flancs à poignées en
  // goutte, dos plein ; cadre du dessus, barre avant, longerons intérieurs de la pompe ; couvercle à charnières
  // (bord avant roulé, poignée) ouvert comme sur la page 9, tenu par deux vérins à gaz.
  const fork = (x) => rect(x, 0.055, 0.24, 0.075);
  for (const s of [-1, 1]) {
    // Jupe avant/arrière (fenêtres des fourreaux) et flancs.
    Y.push(at(slab(api, [[-x1, 0], [x1, 0], [x1, base], [-x1, base]], [fork(-0.38), fork(0.38)], t, 'red'), [0, 0, s * (z1 - t / 2)]));
    Y.push(at(box(t, base, 2 * z1, 'red'), [s * (x1 - t / 2), base / 2, 0]));
    // Fourreaux de fourche (tube 0,25 × 0,085, traversants).
    for (const x of [-0.38, 0.38]) {
      Y.push(at(box(0.25, 0.006, 2 * z1, 'red'), [x, 0.055 + 0.0405 + 0.003, 0]));
      Y.push(at(box(0.25, 0.006, 2 * z1, 'red'), [x, 0.055 - 0.0405 - 0.003, 0]));
      Y.push(at(box(0.006, 0.087, 2 * z1, 'red'), [x + s * 0.122, 0.055, 0]));
    }
    // Oreilles d'arrimage aux coins (au ras du sol, vers ±X).
    for (const u of [-1, 1]) {
      Y.push(at(slab(api, [[x1, 0], [x1 + 0.05, 0], ...arc(x1 + 0.05, 0.045, 0.045, -Math.PI / 2, Math.PI / 2, 8), [x1, 0.09]].map(([x, y]) => [s * x, y]),
        [[s * (x1 + 0.05), 0.045, 0.016]], 0.016, 'red'), [0, 0, u * (z1 - 0.04)]));
      // Cornières d'angle et pattes de levage (plaque YZ au-dessus du coin, trou en haut).
      Y.push(at(box(0.05, H - base, 0.005, 'red'), [s * (x1 - 0.025), (H + base) / 2, u * (z1 - 0.0025)]));
      Y.push(at(box(0.005, H - base, 0.05, 'red'), [s * (x1 - 0.0025), (H + base) / 2, u * (z1 - 0.025)]));
      Y.push(at(slab(api, [[-0.025, H - 0.25], [0.025, H - 0.25], [0.025, H + 0.07], ...arc(0, H + 0.07, 0.025, 0, Math.PI, 6), [-0.025, H + 0.07]],
        [[0, H + 0.07, 0.011]], 0.012, 'red'), [s * (x1 + 0.006), 0, u * (z1 - 0.06)], [0, Math.PI / 2, 0]));
    }
    // Flancs pleins à deux poignées en goutte, de la base au cadre du dessus.
    const goutte = (zc) => [...arc(0, 0.86, 0.022, Math.PI, 0, 6), [0.022, 0.77], ...arc(0, 0.77, 0.022, 0, -Math.PI, 6)].map(([u, v]) => [u + zc, v]);
    Y.push(at(slab(api, [[-z1, base], [z1, base], [z1, H - 0.04], [-z1, H - 0.04]], [goutte(-0.15), goutte(0.15)], t, 'red'), [s * (x1 - t / 2), 0, 0], [0, Math.PI / 2, 0]));
    // Cadre du dessus (tube 0,04) avant/arrière et flancs.
    Y.push(at(box(2 * x1, 0.04, 0.04, 'red', { r: 0.003 }), [0, H - 0.02, s * (z1 - 0.02)]));
    Y.push(at(box(0.04, 0.04, 2 * z1, 'red', { r: 0.003 }), [s * (x1 - 0.02), H - 0.02, 0]));
    // Longerons intérieurs de la pompe (appui des ailes du support PA037).
    Y.push(at(box(2 * x1 - 0.01, 0.04, 0.04, 'red', { r: 0.003 }), [0, WP.rail, s * 0.22]));
  }
  // Plancher, dos plein, faces avant basse (trou rond) et médiane avec rebord, barre avant ronde.
  Y.push(at(box(2 * x1 - 2 * t, 0.006, 2 * z1 - 2 * t, 'red'), [0, base + 0.003 - 0.006, 0]));
  Y.push(at(box(2 * x1, H - 0.04 - base, t, 'red'), [0, (H - 0.04 + base) / 2, -(z1 - t / 2)]));
  Y.push(at(slab(api, [[-x1, base], [x1, base], [x1, 0.36], [-x1, 0.36]], [[-0.38, 0.24, 0.065]], t, 'red'), [0, 0, z1 - t / 2]));
  Y.push(at(box(2 * x1, 0.62 - 0.36, t, 'red'), [0, 0.49, z1 - t / 2]));
  Y.push(at(box(2 * x1 - 0.1, 0.006, 0.03, 'red'), [0, 0.62, z1 - 0.015]));
  Y.push(at(cyl(0.018, 2 * x1 - 0.02, 'red', { axis: 'x', seg: 18 }), [0, 0.86, z1 - 0.02]));
  // Pattes de retenue du réservoir sur le rebord avant (trois, percées) [mesure p. 9].
  for (const x of [-0.4, 0, 0.4]) Y.push(at(slab(api, [[-0.025, 0], [0.025, 0], ...arc(0, 0.03, 0.025, 0, Math.PI, 6)], [[0, 0.03, 0.008]], 0.006, 'red'), [x, 0.62, z1 - 0.032], [-Math.PI / 2, 0, 0]));
  // Couvercle : tôle avec bord avant roulé, poignée ; charnières sur le cadre arrière ; ouvert à 100°.
  const lidA = -100 * (Math.PI / 180);
  const lidL = 2 * z1 - 0.01;
  const lid = group(
    // Section (z, y) du couvercle : tôle plane, bord avant roulé vers le bas ; extrudée le long de X.
    at(bent(api, [[0, 0.002], [lidL - 0.02, 0.002], ...arc(lidL - 0.02, -0.018, 0.02, Math.PI / 2, -Math.PI / 2, 8)].map(([zz, y]) => [-zz, y]), 0.004, 2 * x1, 'red'), [0, 0, 0], [0, Math.PI / 2, 0]),
    at(poignee(api, 0.12, 0.03, 0.006, 'black'), [0, 0.004, lidL - 0.06], [-Math.PI / 2, 0, 0]),
  );
  const lidPose = at(group(lid), [0, H, -z1 + 0.005], [lidA, 0, 0]);
  const hinges = [-0.45, 0.45].map((x) => at(cyl(0.008, 0.12, 'steel', { axis: 'x', seg: 12 }), [x, H + 0.004, -z1 + 0.005]));
  // Vérins à gaz : du flanc intérieur (z −0,2, y 0,82) au couvercle (à 0,3 m de la charnière).
  const lidPt = (d) => [0, H + d * Math.sin(-lidA) * 1, -z1 + 0.005 + d * Math.cos(-lidA)];
  const struts = [-1, 1].flatMap((s) => {
    const A = [s * (x1 - 0.04), 0.82, -0.2], Bp = lidPt(0.3), B = [s * (x1 - 0.04), Bp[1], Bp[2]];
    const M = A.map((c, i) => c + (B[i] - c) * 0.55);
    return [rod(A, M, 0.011, 'black', 14), rod(M, B, 0.005, 'chrome', 10), at(box(0.02, 0.04, 0.03, 'steel'), A)];
  });
  api.part('1', group(merged(Y, 'red'), lidPose, merged(hinges, 'steel'), ...struts), [0, 0, 0]);

  // ------------------------------------------------------------------ 2 — Réservoir eau PA715
  // Caisson soudé : cadre du dessus (rebord et deux traverses qui séparent les trois trappes), fentes d'aération
  // sur le rebord avant, bride de sortie boulonnée sur la face +X, trop-plein coudé au coin +X du haut, thermomètre à
  // cadran sur la face avant (derrière le trou rond du cadre), raccord au coin −X du dessus.
  const { x0: a0, x1: a1, z0: b0, z1: b1, y0: c0, y1: c1, f } = TK;
  const tx = (a0 + a1) / 2, tz = (b0 + b1) / 2;
  const cut = (x) => rect(x, 0, 0.06, 0.01);
  const xc = [-0.19, 0.19]; // traverses entre les trappes
  api.part('2', group(
    at(box(a1 - a0, c1 - c0 - 0.006, b1 - b0, 'grey', { r: 0.006 }), [tx, (c0 + c1 - 0.006) / 2, tz]),
    // Cadre du dessus : rebords et traverses (tôle 6 mm).
    at(slab(api, [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([x, z]) => [x, -z]),
      [[[a0 + f, b0 + f], [xc[0] - 0.02, b0 + f], [xc[0] - 0.02, b1 - f], [a0 + f, b1 - f]], [[xc[0] + 0.02, b0 + f], [xc[1] - 0.02, b0 + f], [xc[1] - 0.02, b1 - f], [xc[0] + 0.02, b1 - f]],
        [[xc[1] + 0.02, b0 + f], [a1 - f, b0 + f], [a1 - f, b1 - f], [xc[1] + 0.02, b1 - f]]].map((h) => h.map(([x, z]) => [x, -z])), 0.006, 'grey'), [0, c1 - 0.003, 0], [-Math.PI / 2, 0, 0]),
    ...[-0.45, -0.3, 0.3, 0.45].map((x) => at(box(0.06, 0.004, 0.012, 'darkSteel'), [x, c1 + 0.001, b1 - f / 2])),
    // Bride de sortie (face +X) et trop-plein coudé.
    at(cyl(0.06, 0.016, 'grey', { axis: 'x', seg: 32 }), [a1 + 0.008, 0.36, -0.08]),
    S.boltCircle(6, 0.048, 0.008, 0.012, 'steel', { axis: 'x', pos: [a1 + 0.016, 0.36, -0.08] }),
    tube([[a1 - 0.01, c1 - 0.04, b1 - 0.05], [a1 + 0.04, c1 - 0.04, b1 - 0.05], [a1 + 0.04, c1 - 0.2, b1 - 0.05]], 0.016, 'grey', { sharp: true, seg: 3 }),
    // Thermomètre à cadran derrière le trou rond de la face avant du cadre.
    at(S.gauge(0.03, { axis: 'z' }), [-0.38, 0.24, b1 + 0.02]),
    at(fitting(0.02, 0.04, 'steel', { elbow: true }), [a0 + 0.04, c1 + 0.01, b0 + 0.04]),
  ), [-1.5, -0.05, 0]);

  // ------------------------------------------------------------------ 4, 5, 6 — Couverts du réservoir à eau
  // Trois tôles de 3 mm posées sur le cadre du dessus du réservoir, poignée en U au milieu de chacune (page 9) :
  // #2 (PP7129) au bout −X, #1 (PP7128) au milieu, #3 (PP7131) au bout +X.
  const couvert = (xa, xb) => group(
    at(box(xb - xa, 0.003, b1 - b0 - 0.01, 'grey'), [(xa + xb) / 2, c1 + 0.0015, tz]),
    at(poignee(api, 0.09, 0.028, 0.005, 'steel'), [(xa + xb) / 2, c1 + 0.003, tz], [-Math.PI / 2, 0, 0]),
  );
  api.part('4', couvert(a0 + 0.005, xc[0] - 0.003), [-1.6, 0.75, 0]);
  api.part('5', couvert(xc[0] + 0.003, xc[1] - 0.003), [-1.5, 0.75, 0]);
  api.part('6', couvert(xc[1] + 0.003, a1 - 0.005), [-1.4, 0.75, 0]);

  // ------------------------------------------------------------------ 3 — Support pompe à eau PA037 (P010)
  api.part('3', at(api.sub('P010'), PUMP), [-1.0, 1.15, -0.3]);

  // ------------------------------------------------------------------ 9 — Flotteur série 21 A-060
  // Robinet à flotteur sur la face avant du réservoir : corps horizontal à bride, coude et tube de chute vers le bas
  // (page 9) [estimé : corps Ø 70 mm].
  const fx = 0.15, fy = 0.45;
  api.part('9', group(
    at(cyl(0.05, 0.012, 'grey', { axis: 'z', seg: 28 }), [fx, fy, b1 + 0.006]),
    at(cyl(0.035, 0.065, 'brass', { axis: 'z', seg: 28 }), [fx, fy, b1 + 0.045]),
    at(ring(0.04, 0.035, 0.01, 'brass', { axis: 'z', seg: 28 }), [fx, fy, b1 + 0.05]),
    at(S.ball(0.034, 'brass'), [fx, fy, b1 + 0.078]),
    at(cyl(0.025, 0.14, 'brass', { axis: 'y', seg: 20 }), [fx, fy - 0.07, b1 + 0.078]),
  ), [-1.5, -0.25, 0.4]);

  // ------------------------------------------------------------------ 7 — Débitmètre électromagnétique MIK-L34360A
  // Tube de mesure à brides et tête électronique, raccords aux deux bouts (coude au bout +X), contre le dos du cadre
  // dans le compartiment du haut, deux colliers ; flexible tel que dessiné page 9 (pend vers le réservoir).
  const my = 0.93, mz = -z1 + 0.05, mxa = 0.2, mxb = 0.55;
  api.part('7', group(
    at(cyl(0.017, mxb - mxa, 'steel', { axis: 'x', seg: 18 }), [(mxa + mxb) / 2, my, mz]),
    at(box(0.08, 0.06, 0.06, 'darkSteel', { r: 0.006 }), [(mxa + mxb) / 2, my, mz]),
    at(box(0.07, 0.05, 0.05, 'black', { r: 0.008 }), [(mxa + mxb) / 2, my + 0.055, mz]),
    ...[mxa + 0.07, mxb - 0.07].map((x) => at(ring(0.032, 0.017, 0.012, 'steel', { axis: 'x', seg: 6 }), [x, my, mz])),
    at(fitting(0.03, 0.045, 'steel', { elbow: true }), [mxb + 0.01, my, mz], [0, 0, -Math.PI / 2]),
    ...[mxa + 0.04, mxb - 0.04].map((x) => at(box(0.02, 0.05, 0.045, 'steel'), [x, my, mz - 0.0225])),
    S.hose([[mxa, my, mz], [mxa - 0.12, my + 0.05, mz + 0.02], [mxa - 0.35, my - 0.05, mz + 0.05], [mxa - 0.55, 0.72, mz + 0.06], [mxa - 0.62, 0.64, mz + 0.06]], 0.016),
  ), [0.3, 1.0, 0]);

  // ------------------------------------------------------------------ 8 — Réducteurs de pression LF 25AUB Z3
  // Réducteur de pression d'eau en laiton (corps à raccords 1 po, cloche du ressort, vis de réglage), vissé par un
  // mamelon dans le flanc +X du cadre, en bas [mesure p. 9].
  const rx = x1 + 0.006, ry = 0.25, rz = 0.22;
  api.part('8', group(
    at(cyl(0.016, 0.04, 'brass', { axis: 'x', seg: 6 }), [rx + 0.02, ry, rz]),
    at(box(0.06, 0.05, 0.11, 'brass', { r: 0.012 }), [rx + 0.07, ry, rz]),
    ...[-1, 1].map((s) => at(cyl(0.02, 0.025, 'brass', { axis: 'z', seg: 6 }), [rx + 0.07, ry, rz + s * 0.065])),
    at(lathe([[0, 0], [0.032, 0], [0.032, 0.05], [0.02, 0.07], [0, 0.07]], 'brass', { seg: 24 }), [rx + 0.07, ry + 0.025, rz]),
    at(cyl(0.006, 0.03, 'steel', { axis: 'y', seg: 10 }), [rx + 0.07, ry + 0.105, rz]),
    at(cyl(0.01, 0.006, 'steel', { axis: 'y', seg: 6 }), [rx + 0.07, ry + 0.098, rz]),
  ), [0.6, 0, 0.25]);

  return { view: { dir: [0.45, 0.5, 1] } };
}
