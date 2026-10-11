// P272 — Adaptateurs des conduites de refoulement CX035664 rév. 0 « ASSY,
// PRESSURE LINE ADAPTERS » (page 272), repère 24 de P186. Sur le refoulement
// de chaque pompe de P208 : clapet anti-retour à brides en sandwich (bloc
// d'acier percé, vissé sur le plot de la pompe par 4 vis CHC aux coins, face
// de sortie taraudée au même gabarit J518), puis coude 90° à collet J518 →
// JIC mâle -16 (1 5/16-12) tenu par une paire de demi-brides :
// - pompe 100 cm³ (orifice PUMPS.b1, 1 1/4 po code 62, côté +Z) : clapet
//   1 1/4 po (2), coude FL62 -20 → MJIC -16 (4), demi-brides code 62 (6) ;
// - pompe 74 cm³ (orifice PUMPS.b2, 1 po code 61, côté -Z) : clapet 1 po
//   code 61 (1), coude FL61 -16 → MJIC -16 (3), demi-brides code 61 (5).
// Comme sur la page 272, les deux refoulements partent de côtés opposés ;
// les coudes sont tournés vers le haut (+Y).
// Repère : celui de P208 (origine sur l'axe de l'arbre au plan de la face C
// du moteur, +X vers les pompes, Y vers le haut) ; P272 se place dans P186
// exactement comme P208. Encombrement ≈ 0.3 (X) × 0.2 (Y) × 0.5 (Z) m.
// Cotes : gabarits SAE J518 (_chassis.js) ; épaisseur des clapets estimée
// d'après la vue éclatée (≈ 0,6 × la largeur du bloc).
import { IN, j518, flangeHead, splitFlange, orient, portedBlock, capScrew, SAE } from './_chassis.js';
import { PUMPS } from './P208.js';

export default function P272(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Clapet en sandwich le long de +Y, face d'entrée sur y = 0 ; grand entraxe selon X.
  const checkBlock = (dash, code) => {
    const f = j518(dash, code);
    const w = f.L + f.d * 2.6 + 0.024, d = f.W + f.d * 2.6 + 0.012, t = Math.max(0.05, w * 0.55);
    const holes = [[0, 0, f.rb * 0.95, t - 0.0005]];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) holes.push([sx * f.L / 2, sz * f.W / 2, f.d * 0.42, 0.016]);
    // Lamages des vis CHC aux quatre coins (vrais trous).
    const cx = w / 2 - 0.009, cz = d / 2 - 0.008;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) holes.push([sx * cx, sz * cz, 0.0068, 0.008]);
    // portedBlock perce sa face +Z : bloc w (X) × d (Y) × t (Z), puis on bascule Z → Y.
    const blk = portedBlock(api, w, d, t, 'steel', holes.map(([x, z, r, p]) => [x, z, r, p]), { spot: 1.3 });
    const g = S.group(blk);
    // Vis CHC de fixation au fond des lamages.
    const screws = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      screws.push(S.at(capScrew(api, 0.008, t), [sx * cx, sz * cz, t / 2 - 0.008], [Math.PI / 2, 0, 0]));
    }
    g.add(S.merged(screws, 'blackOxide'));
    // Bouchon du siège (côté, flèche de sens d'écoulement en relief).
    g.add(S.box(0.004, 0.022, 0.004, 'steel', { pos: [w / 2 + 0.001, 0, 0] }));
    const wrap = S.group(g);
    g.rotation.x = -Math.PI / 2; // face +Z (sortie) → +Y
    g.position.y = t / 2;
    return { obj: wrap, t };
  };

  // Profil JIC mâle 37° (rayon de filet rt) de y0 à y0 + len.
  const jicMale = (rt, y0, len) => {
    const yc = y0 + len - rt * 0.55;
    return [
      [0, y0], [rt * 0.85, y0],
      ...S.thread(rt, y0 + 0.002, yc, { pitch: rt * 0.22, maxTurns: 6, chamferBottom: false }),
      [rt * 0.92, yc + rt * 0.05], [rt * 0.62, y0 + len], [rt * 0.42, y0 + len], [rt * 0.42, y0 + len - 0.002], [0, y0 + len - 0.002],
    ];
  };
  // Coude 90° collet J518 → JIC mâle, le long de +Y puis sortie selon +Z.
  const elbow = (dash, code, jic) => {
    const f = j518(dash, code);
    const rt = (SAE[jic].t * IN) / 2, hex = SAE[jic].hex * IN;
    const neck = 0.01;
    const y0 = f.hc + neck;
    const rb = f.rn * 1.02, R = rb * 1.2;
    const parts = [flangeHead(api, dash, code, neck, 'zinc')];
    // Corps forgé : col droit, coude, collet de sortie.
    parts.push(S.cyl(rb, 0.012, 'zinc', { seg: 24, pos: [0, y0 + 0.006, 0] }));
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * (Math.PI / 2);
      pts.push([0, y0 + 0.012 + Math.sin(a) * R, R - Math.cos(a) * R]);
    }
    parts.push(S.tube(pts, rb, 'zinc', { seg: 16, ends: 'none', radial: 20 }));
    const yo = y0 + 0.012 + R, zo = R;
    parts.push(S.at(S.nut(hex, 0.012, 'zinc'), [0, yo, zo + 0.006], [Math.PI / 2, 0, 0]));
    parts.push(S.at(S.lathe(jicMale(rt, 0, rt * 2.6), 'zinc', { seg: 18 }), [0, yo, zo + 0.012], [Math.PI / 2, 0, 0]));
    return S.merged(parts, 'zinc');
  };

  const line = (port, refCV, refEl, refKit) => {
    const { pos, dir, dash, code } = port;
    const cv = checkBlock(dash, code);
    const ex = (k) => dir.map((v) => v * k);
    // Grand axe J518 vertical (plots de P208) : X local du bloc → Y machine.
    P(refCV, orient(api, cv.obj, pos, dir, [1, 0, 0]), ex(0.08));
    const out = pos.map((v, i) => v + dir[i] * cv.t);
    // Coude : grand axe du collet selon Y ; sortie tournée vers le haut.
    P(refEl, orient(api, elbow(dash, code, 16), out, dir, [0, 1, 0]), ex(0.24));
    const sf = splitFlange(api, dash, code);
    P(refKit, orient(api, sf.obj, out, dir, [1, 0, 0]), ex(0.16));
  };
  line(PUMPS.b1, '2', '4', '6');
  line(PUMPS.b2, '1', '3', '5');
  void THREE;
  return { view: { dir: [0.9, 0.6, 1.0] } };
}
