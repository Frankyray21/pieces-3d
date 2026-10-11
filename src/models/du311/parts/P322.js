// P322 — Tuyauterie de marche / arrêt de l'air : CX036915 rév. 0 « ASSY, AIR
// ON/OFF PIPING » (page 322), repère 27 de P186. Ligne d'air 2 po NPT, de la
// bride code 61 (amont) vers le flexible : demi-brides (21, trousse) sur
// l'adaptateur de bride 2 po NPTF (4), mamelon court (26), support d'élingue
// anti-fouet (11), coude femelle 90° (22) vers le bas, mamelon (26), coude
// (22) vers -X, collecteur de refoulement (12), té femelle (24) bouché d'un
// bouchon à tête carrée (23), mamelon (26), clapet anti-retour à ressort (8),
// mamelon (26), vanne à boisseau 2 po (5), mamelon 2 po × 4 po (25), coude
// (22) vers le bas, flexible d'air 2 po × 28 po (9). Vanne motorisée par un
// vérin pneumatique quart de tour (6) sous la vanne : support (2) vissé sous
// la vanne par deux vis M8 × 14 (1) à rondelles (29), vérin vissé sous le
// support par quatre vis H 5/16-18 × 3/4 po (27) à rondelles (28), axe
// d'accouplement (3) ; coudes 90° NPT 1/4 → JIC -06 (15) sur les deux orifices
// d'air du vérin. Sous le collecteur, quatre piquages : adaptateur NPT 3/8 →
// JIC -06 (16) ; bouchon fraisé 3/8 (20) ; adaptateur 16, adaptateur tournant
// (18), clapet 1/4 (10), coude 45° (13) ; mamelon six-pans NPT 1/2 → JIC -08
// (17), adaptateur tournant (19), clapet 1/2 (7), coude 45° (14).
// Repère : origine au centre de la face de la bride code 61 de 4 (face
// d'appui des demi-brides), +X sortant de la bride ; la ligne court vers -X,
// Y vers le haut, +Z côté bouchon 23 du té. Cotes NPT 2 po : Ø 2,375 po,
// engagement des filets 19 mm, coudes et té forgés classe 3000 (axe-face
// 57 mm), mamelon court 2 5/8 po.
// Encombrement ≈ 1.15 (X) × 0.75 (Y) × 0.2 (Z) m.
import { IN, NPT, nptFitting, inlineCheck, orient, orientPoint } from './_chassis.js';

export default function P322(api) {
  const { S, THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const R2 = (NPT[32] * IN) / 2; // rayon du tube 2 po
  const E = 0.019; // engagement des filets
  const A = 0.057; // axe-face des coudes / té
  const RO = 0.0375, RI = R2 * 0.97; // corps forgés

  // ---------------------------------------------------------------- éléments génériques (selon +Y)
  const nipple = (L, mat = 'darkSteel') => {
    const t = Math.min(0.03, L * 0.45);
    const t1 = S.thread(R2 * 0.95, 0, t, { r1: R2, pitch: R2 * 0.15, maxTurns: 6 });
    const t2 = t1.map(([r, y]) => [r, L - y]).reverse();
    return S.group(
      S.lathe([[RI * 0.82, L], [RI * 0.82, 0], ...t1, ...t2.map(([r, y]) => [r, y]), [RI * 0.82, L]], mat, { seg: 32 }),
    );
  };
  // Coude femelle 90° : centre à l'origine, manchons selon +Y et +Z.
  const elbow = () => S.group(S.merged([
    S.shell(RO, RI, A, 'darkSteel', { seg: 32, pos: [0, A / 2, 0] }),
    S.shell(RO, RI, A, 'darkSteel', { axis: 'z', seg: 32, pos: [0, 0, A / 2] }),
    S.ball(RO, 'darkSteel'),
    S.ring(RO + 0.002, RI, 0.008, 'darkSteel', { seg: 32, pos: [0, A - 0.004, 0] }),
    S.ring(RO + 0.002, RI, 0.008, 'darkSteel', { axis: 'z', seg: 32, pos: [0, 0, A - 0.004] }),
  ], 'darkSteel'));
  const put = (ref, f, pos, dir, side, e) => { P(ref, orient(api, f.obj, pos, dir, side), e); return orientPoint(api, f.out, pos, dir, side); };

  // ---------------------------------------------------------------- 21, 4 — bride code 61
  {
    // 4 : tête de bride code 61 (Ø 2,88 po × 0,6 po, gorge de joint), corps six-pans femelle NPTF 2 po.
    const g = S.group(
      S.lathe([[RI, -0.068], [0.045, -0.068], [0.045, -0.024], [0.034, -0.024], [0.034, -0.016], [RI, -0.016], [RI, -0.068]], 'steel', { axis: 'x', seg: 6 }),
      S.lathe([[RI, -0.016], [0.0366, -0.016], [0.0366, -0.0015], [0.035, 0], [RI, 0], [RI, -0.016]], 'steel', { axis: 'x', seg: 36 }),
    );
    P('4', g, [0.12, 0, 0]);
    // 21 : deux demi-brides (2 po code 61 : entraxes 3,06 × 1,69 po) et quatre vis 1/2-13.
    const half = (s) => {
      // Demi-bride : profil en U qui coiffe la tête de 4, oreilles percées des vis.
      const p = S.extrude([[-0.052, 0.016], [-0.03, 0.016], [-0.03, 0.037], [0.03, 0.037], [0.03, 0.016], [0.052, 0.016], [0.052, 0.05], [-0.052, 0.05]], 0.014, 'darkSteel', { holes: [[-0.0389, 0.0375, 0.0072], [0.0389, 0.0375, 0.0072]] });
      const grp = S.group(p);
      grp.rotation.set(s > 0 ? 0 : Math.PI, Math.PI / 2, 0);
      grp.position.set(-0.009, 0, 0);
      return grp;
    };
    const bolts = [];
    for (const z of [-0.0389, 0.0389]) for (const y of [-0.0375, 0.0375]) bolts.push(S.bolt(0.5 * IN, 1.75 * IN, 'zinc', { axis: 'x', pos: [-0.019, y, z] }));
    // Les vis traversent les demi-brides et se vissent dans la bride amont (+X) : têtes côté -X.
    bolts.forEach((b) => { b.rotation.y = Math.PI; b.position.x = -0.019; });
    P('21', S.group(half(1), half(-1), S.merged(bolts, 'zinc')), [0.2, 0, 0]);
  }
  // ---------------------------------------------------------------- ligne principale
  let x = -0.068; // fond de la douille femelle de 4 (ouverture vers -X)
  // 26a, 11, 22a
  const N = 2.625 * IN;
  P('26', orient(api, nipple(N), [x + E, 0, 0], [-1, 0, 0]), [0.06, 0, 0]);
  x = x + E - N;
  {
    // 11 — support d'élingue anti-fouet : tôle en goutte percée Ø 2,5 po, deux brides à œil.
    const pl = S.extrude([[-0.045, -0.04], [0.045, -0.04], [0.045, 0.03], [0.02, 0.1], [-0.02, 0.1], [-0.045, 0.03]], 0.006, 'zinc', { holes: [[0, 0, 0.031]] });
    const eye = [0.055, 0.085].map((y) => S.group(S.torus(0.009, 0.0025, 'zinc', { axis: 'x', pos: [0, y, 0.0] }), S.cyl(0.003, 0.02, 'zinc', { axis: 'x', seg: 10, pos: [0.0, y - 0.012, 0] })));
    const g = S.group(pl, ...eye);
    g.rotation.y = Math.PI / 2;
    g.position.set(-0.068 - 0.012, 0, 0);
    P('11', S.group(S.merged([g], 'zinc')), [0.0, 0.1, 0.12]);
  }
  let c = [x + E - A, 0, 0];
  P('22', orient(api, elbow(), c, [1, 0, 0], [0, -1, 0]), [0, 0.04, 0.12]);
  // 26b vertical, 22b
  let y = -A + E;
  P('26', orient(api, nipple(N), [c[0], y, 0], [0, -1, 0]), [0, -0.02, 0.12]);
  y = y - N + E;
  c = [c[0], y - A, 0];
  P('22', orient(api, elbow(), c, [0, 1, 0], [-1, 0, 0]), [0, -0.05, 0.12]);
  const YL = c[1];
  x = c[0] - A + E;
  // 12 — collecteur : tube 2 po fileté aux deux bouts, quatre bossages dessous.
  const LM = 0.3;
  const XP = [x - 0.085, x - 0.13, x - 0.175, x - 0.22];
  {
    const parts = [nipple(LM)];
    const g = orient(api, S.group(...parts), [x, YL, 0], [-1, 0, 0]);
    const boss = XP.map((px) => S.cyl(0.014, 0.012, 'darkSteel', { seg: 20, pos: [px, YL - R2 - 0.004, 0] }));
    P('12', S.group(g, S.merged(boss, 'darkSteel')), [0, -0.06, 0]);
  }
  x -= LM;
  // 24 — té femelle, 23 bouchon à tête carrée dans la branche +Z.
  c = [x + E - A, YL, 0];
  {
    const g = S.group(S.merged([
      S.shell(RO, RI, 2 * A, 'darkSteel', { axis: 'x', seg: 32 }),
      S.shell(RO, RI, A - RO * 0.5, 'darkSteel', { axis: 'z', seg: 32, pos: [0, 0, RO * 0.5 + (A - RO * 0.5) / 2] }),
      ...[[A - 0.004, 0, 0], [-A + 0.004, 0, 0]].map((p) => S.ring(RO + 0.002, RI, 0.008, 'darkSteel', { axis: 'x', seg: 32, pos: p })),
      S.ring(RO + 0.002, RI, 0.008, 'darkSteel', { axis: 'z', seg: 32, pos: [0, 0, A - 0.004] }),
    ], 'darkSteel'));
    g.position.set(...c);
    P('24', g, [0, 0, 0]);
    const plug = S.group(
      S.lathe([[0, -0.03], ...S.thread(R2 * 0.95, -0.03, 0, { r1: R2, pitch: R2 * 0.15, maxTurns: 6 }), [0, 0]], 'darkSteel', { seg: 28 }),
      S.box(0.045, 0.03, 0.045, 'darkSteel', { r: 0.003, pos: [0, 0.015, 0] }),
      S.cyl(0.03, 0.006, 'darkSteel', { seg: 24, pos: [0, 0.003, 0] }),
    );
    P('23', orient(api, plug, [c[0], YL, A - E + 0.012], [0, 0, 1]), [0, 0, 0.1]);
  }
  x = c[0] - A;
  // 26c, 8, 26d, 5, 25, 22c
  P('26', orient(api, nipple(N), [x + E, YL, 0], [-1, 0, 0]), [-0.03, 0, 0]);
  x = x + E - N;
  const LC = 0.14;
  {
    // 8 — clapet anti-retour à ressort : corps laiton, deux six-pans, flèche du sens.
    const g = S.merged([
      S.lathe([[RI, 0], [0.042, 0], [0.042, 0.03], [0.048, 0.04], [0.048, LC - 0.04], [0.042, LC - 0.03], [0.042, LC], [RI, LC], [RI, 0]], 'brass', { seg: 6 }),
      S.lathe([[0.046, 0.045], [0.05, 0.05], [0.05, LC - 0.05], [0.046, LC - 0.045]], 'brass', { seg: 40 }),
    ], 'brass');
    P('8', orient(api, g, [x + E, YL, 0], [-1, 0, 0]), [-0.06, 0, 0]);
  }
  x = x + E - LC;
  P('26', orient(api, nipple(N), [x + E, YL, 0], [-1, 0, 0]), [-0.09, 0, 0]);
  x = x + E - N;
  const LV = 0.15;
  const xv = x + E - LV / 2; // centre de la vanne
  {
    // 5 — vanne à boisseau 2 po deux pièces : corps, embout vissé six-pans, platine ISO dessous.
    const body = S.merged([
      S.lathe([[RI, 0], [0.045, 0], [0.045, 0.025], [0.058, 0.035], [0.058, LV - 0.05], [0.05, LV - 0.045], [RI, LV - 0.045], [RI, 0]], 'steel', { seg: 40 }),
      S.lathe([[RI, LV - 0.05], [0.048, LV - 0.05], [0.048, LV], [RI, LV], [RI, LV - 0.05]], 'steel', { seg: 6 }),
      S.lathe([[RI, 0], [0.046, 0], [0.046, 0.022], [RI, 0.022], [RI, 0]], 'steel', { seg: 6 }),
    ], 'steel');
    const pad = S.group(S.cyl(0.014, 0.03, 'steel', { seg: 20, pos: [xv, -0.068, 0] }), S.box(0.06, 0.008, 0.06, 'steel', { r: 0.004, pos: [xv, -0.085, 0] }));
    const g = S.group(orient(api, body, [xv + LV / 2, 0, 0], [-1, 0, 0]), pad);
    g.position.y = YL;
    P('5', g, [-0.12, 0.05, 0]);
  }
  // Commande : 1, 29 (vis M8 sous la platine), 2 support, 3 axe, 27, 28, 6 vérin, 15 coudes.
  {
    const yp = YL - 0.089; // dessous de la platine ISO
    for (const s of [-1, 1]) {
      P('29', S.at(S.washer(0.0085, 0.0043, 0.002, 'zinc'), [xv + s * 0.021, yp - 0.006 - 0.001, 0]), [-0.12, -0.03, 0]);
      P('1', S.at(S.bolt(0.008, 0.014, 'zinc'), [xv + s * 0.021, yp - 0.006 - 0.002, 0], [Math.PI, 0, 0]), [-0.12, -0.06, 0]);
    }
    // 2 — support en U renversé : plaque haute (sous la platine), deux joues, plaque basse.
    const t = 0.006, Hs = 0.07;
    const sup = S.merged([
      S.plate(0.075, 0.06, t, 'grey', { holes: [[0, 0, 0.012], [-0.021, 0, 0.0045], [0.021, 0, 0.0045]] }),
      S.box(t, Hs, 0.06, 'grey', { pos: [-0.0375 + t / 2, -Hs / 2, 0] }),
      S.box(t, Hs, 0.06, 'grey', { pos: [0.0375 - t / 2, -Hs / 2, 0] }),
      S.at(S.plate(0.075, 0.08, t, 'grey', { holes: [[0, 0, 0.012], ...[[-0.025, -0.025], [0.025, -0.025], [-0.025, 0.025], [0.025, 0.025]].map(([a, b]) => [a, b, 0.0045])] }), [0, -Hs, 0]),
    ], 'grey');
    sup.position.set(xv, yp - t / 2 - 0.0005, 0);
    P('2', sup, [-0.12, -0.1, 0]);
    // 3 — axe d'accouplement à bouts carrés.
    P('3', S.group(S.merged([
      S.box(0.011, 0.016, 0.011, 'steel', { pos: [xv, yp - 0.008, 0] }),
      S.cyl(0.0095, Hs - 0.02, 'steel', { seg: 20, pos: [xv, yp - Hs / 2, 0] }),
      S.box(0.014, 0.016, 0.014, 'steel', { pos: [xv, yp - Hs + 0.004, 0] }),
    ], 'steel')), [-0.12, -0.13, 0.12]);
    // 6 — vérin pneumatique quart de tour : corps cubique alu, embase NAMUR, carrés de sortie.
    const yb = yp - Hs - t - 0.001; // dessus du vérin
    const g6 = S.group(
      S.merged([
        S.box(0.1, 0.085, 0.1, 'castAlu', { r: 0.006, pos: [xv, yb - 0.0425, 0] }),
        S.cyl(0.014, 0.012, 'castAlu', { seg: 20, pos: [xv, yb + 0.004, 0] }),
      ], 'castAlu'),
      S.merged([S.box(0.035, 0.05, 0.004, 'black', { pos: [xv - 0.01, yb - 0.04, 0.052] })], 'black'),
      S.merged([S.box(0.014, 0.03, 0.03, 'castAlu', { r: 0.002, pos: [xv + 0.057, yb - 0.04, 0] })], 'castAlu'),
    );
    P('6', g6, [-0.12, -0.2, 0]);
    for (const [dx, dz] of [[-0.025, -0.025], [0.025, -0.025], [-0.025, 0.025], [0.025, 0.025]]) {
      P('28', S.at(S.washer(0.34 * IN * 0.9, 0.17 * IN, 0.0018, 'zinc'), [xv + dx, yp - Hs + 0.001 + 0.0009, dz]), [-0.12, -0.04, 0]);
      P('27', S.bolt(0.3125 * IN, 0.75 * IN, 'zinc', { pos: [xv + dx, yp - Hs + 0.0028, dz] }), [-0.12, 0.0, 0]);
    }
    // 15 — coudes 90° NPT 1/4 → JIC -06 dans les deux orifices d'air de l'embase NAMUR (+X).
    for (const yy of [yb - 0.028, yb - 0.052]) put('15', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), [xv + 0.064, yy, 0.008 * (yy > yb - 0.04 ? 1 : -1)], [1, 0, 0], [0, 0, 1], [-0.06, -0.2, 0.08]);
  }
  x = x + E - LV;
  P('25', orient(api, nipple(4 * IN), [x + E, YL, 0], [-1, 0, 0]), [-0.16, 0, 0]);
  x = x + E - 4 * IN;
  c = [x + E - A, YL, 0];
  P('22', orient(api, elbow(), c, [1, 0, 0], [0, -1, 0]), [-0.2, 0.04, 0]);
  // 9 — flexible d'air 2 po × 28 po : embout mâle dans le coude, descend puis part vers +X.
  {
    const y0 = YL - A + E - 0.01;
    P('9', S.hose([[c[0], y0, 0], [c[0], y0 - 0.22, 0], [c[0] + 0.05, y0 - 0.42, 0], [c[0] + 0.22, y0 - 0.52, 0]], 0.031), [-0.22, -0.05, 0]);
  }

  // ---------------------------------------------------------------- piquages sous le collecteur
  const yb = YL - R2 - 0.01; // face des bossages
  put('16', nptFitting(api, { npt: 6, jic: 6 }), [XP[0], yb, 0], [0, -1, 0], null, [0, -0.06, 0.1]);
  {
    const rn = (NPT[6] * IN) / 2;
    const plug = S.group(
      S.lathe([[0.003, 0], [rn, 0], ...S.thread(rn * 0.95, -0.012, 0, { r1: rn, pitch: rn * 0.2, maxTurns: 4 }).reverse(), [0, -0.012], [0, -0.004], [0.003, -0.004]], 'zinc', { seg: 18 }),
      S.lathe([[0, -0.004], [0.0035, -0.004], [0.0035, 0]], 'zinc', { seg: 6 }),
    );
    P('20', S.at(plug, [XP[1], yb + 0.0005, 0], [Math.PI, 0, 0]), [0, -0.04, 0.1]);
  }
  // Chaîne 1/4 : 16, 18, 10, 13.
  {
    const o16 = put('16', nptFitting(api, { npt: 6, jic: 6 }), [XP[2], yb, 0], [0, -1, 0], null, [0, -0.06, 0.1]);
    const f18 = nptFitting(api, { npt: 4, jic: 6, end: 'swivel' });
    const o18 = o16[1] + 0.006 - f18.out[1]; // origine de 18 (six-pans) sous son écrou
    P('18', orient(api, f18.obj, [XP[2], o18, 0], [0, 1, 0]), [0, -0.09, 0.1]);
    const Lc = 0.05;
    P('10', S.at(inlineCheck(api, 4, Lc, 0.75 * IN, 'steel'), [XP[2], o18 - Lc / 2, 0]), [0, -0.12, 0.1]);
    put('13', nptFitting(api, { npt: 4, jic: 6, angle: 45 }), [XP[2], o18 - Lc, 0], [0, -1, 0], [-1, 0, 0], [0, -0.15, 0.1]);
  }
  // Chaîne 1/2 : 17, 19, 7, 14.
  {
    const o17 = put('17', nptFitting(api, { npt: 8, jic: 8 }), [XP[3], yb, 0], [0, -1, 0], null, [0, -0.06, 0.1]);
    const f19 = nptFitting(api, { npt: 8, jic: 8, end: 'swivel' });
    const o19 = o17[1] + 0.008 - f19.out[1];
    P('19', orient(api, f19.obj, [XP[3], o19, 0], [0, 1, 0]), [0, -0.09, 0.1]);
    const Lc = 0.07;
    P('7', S.at(inlineCheck(api, 8, Lc, 1.125 * IN, 'brass'), [XP[3], o19 - Lc / 2, 0]), [0, -0.12, 0.1]);
    put('14', nptFitting(api, { npt: 8, jic: 8, angle: 45 }), [XP[3], o19 - Lc, 0], [0, -1, 0], [1, 0, 0], [0, -0.15, 0.1]);
  }
  void THREE;
  return { view: { dir: [0.7, 0.6, 1.1] } };
}
