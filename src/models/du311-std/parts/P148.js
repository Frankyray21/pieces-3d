// P148 — Distributeur du carrousel, 3 sections, commande AMP CX038075 rév. 0
// (page 148) : « CAROUSEL VALVE, 3 SECTION - AMP ». Danfoss PVG 32 empilé
// (joints non dessinés sur la page) :
// - couvercle d'entrée (7, PVP à limiteur de pression, orifices P / T SAE -12
//   en façade, prise LS) en haut ;
// - trois corps de section LS à compensation de pression (4), orifices A / B
//   SAE -10 en façade : du haut vers le bas « ARM UNI » 6.6 gal/min, 2200 psi
//   et « CLAMP » 6.6 gal/min, 1500 psi (tiroirs 6.6 MOT-LS, 3), « CAROUSEL
//   ROTATION » 2.6 gal/min, 2800 psi (tiroir 2.6 CYL-LS, 6) ;
// - trois commandes électrohydrauliques tout-ou-rien PVEO à connecteur AMP
//   (5) côté +X, trois bases de poignée (1, sans levier) côté -X ;
// - plaque d'extrémité (2) en bas ; trois tirants et écrous de la trousse de
//   joints PVG 32 (8, ligne de trousse : objets des tirants).
// Repère : origine au centre de la face inférieure de la plaque d'extrémité,
// Y vers le haut le long de l'empilage, X selon les tiroirs (bases de poignée
// vers -X, PVEO vers +X), +Z = face des orifices A / B et P / T (repère du
// PVG 32 des distributeurs du TVK, ../../du311/parts/_chassis.js).
// Encombrement ≈ 0.28 (X) × 0.24 (Y) × 0.10 (Z) m.
// Cotes : section PVG 32 de 48 mm (catalogue) ; corps 116 × 100 mm, couvercle
// d'entrée 62 mm, plaque d'extrémité 30 mm (modèle commun du TVK).
import { portedBlock, orbPlug, socketPlug, capScrew, PVG } from '../../du311/parts/_chassis.js';

export const PVG148 = { ...PVG, H: PVG.end + 3 * PVG.sec + PVG.inlet };

export default function P148(api) {
  const { S } = api;
  const { group, merged, at, lathe } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { w, d, sec, inlet, end, rods } = PVG;
  const H = PVG148.H;
  const ys = [0, 1, 2].map((i) => end + sec * (i + 0.5)); // milieux des sections (bas → haut)
  const ey = (i) => (i + 1) * 0.035; // éclaté de l'empilage

  // 2 — plaque d'extrémité (couvercle plein, prise de mesure en façade)
  P('2', group(S.box(w, end, d, 'castIron', { r: 0.0015, pos: [0, end / 2, 0] }), at(socketPlug(api, 0.006), [0.03, end / 2, d / 2], [Math.PI / 2, 0, 0])), [0, 0, 0]);

  // 4 — corps de section : orifices A / B (7/8-14), bouchons des clapets de
  // section, bouchons LS au dos, bout de tiroir et ressort côté -X
  const ra = 0.0111;
  ys.forEach((y, i) => {
    const g = portedBlock(api, w, sec, d, 'castIron', [[-0.024, 0, ra, 0.022], [0.024, 0, ra, 0.022]]);
    const plugs = [-1, 1].map((sx) => at(orbPlug(api, 0.016), [sx * 0.049, 0, d / 2], [Math.PI / 2, 0, 0]));
    for (const sx of [-1, 1]) plugs.push(at(socketPlug(api, 0.006), [sx * 0.03, 0, -d / 2], [-Math.PI / 2, 0, 0]));
    g.add(merged(plugs, 'steel'));
    g.add(S.spring(0.011, 0.0014, 0.012, 4, 'steel', { axis: 'x', pos: [-w / 2 - 0.006, 0, 0], perTurn: 12, radial: 5 }));
    // plaque d'identification estampée sur la face supérieure arrière
    g.add(S.box(0.05, 0.0005, 0.016, 'zinc', { pos: [0.02, sec / 2 + 0.00025, -0.03] }));
    P('4', at(g, [0, y, 0]), [0, ey(i), 0]);
  });

  // 3, 6 — tiroirs (chromés, gorges et portées), dans l'axe X de chaque corps
  const spool = (lands) => {
    const pts = [[0, -0.075]];
    let x = -0.075;
    for (const [len, r] of lands) { pts.push([r, x], [r, x + len]); x += len; }
    pts.push([0, x]);
    return lathe(pts, 'chrome', { axis: 'x', seg: 18 });
  };
  const mot = [[0.012, 0.007], [0.022, 0.008], [0.01, 0.006], [0.022, 0.008], [0.01, 0.006], [0.022, 0.008], [0.012, 0.006], [0.02, 0.0045]];
  const cyl = [[0.012, 0.007], [0.018, 0.008], [0.016, 0.0058], [0.018, 0.008], [0.016, 0.0058], [0.018, 0.008], [0.014, 0.006], [0.018, 0.0045]];
  P('6', at(spool(cyl), [0, ys[0], 0]), [0, ey(0), 0.15]);
  P('3', at(spool(mot), [0, ys[1], 0]), [0, ey(1), 0.15]);
  P('3', at(spool(mot), [0, ys[2], 0]), [0, ey(2), 0.15]);

  // 7 — couvercle d'entrée : P / T (1 1/16-12), prise de manomètre dessus, LS sur +X, limiteur côté -X
  {
    const rp = 0.0135;
    const g = portedBlock(api, w, inlet, d, 'castIron', [[-0.028, -0.004, rp, 0.026], [0.03, -0.004, rp, 0.026], [0, 0.016, 0.0055, 0.012]]);
    g.add(merged([
      at(orbPlug(api, 0.017), [-0.015, inlet / 2, -0.03]),
      at(orbPlug(api, 0.017), [w / 2, 0.01, -0.02], [0, 0, -Math.PI / 2]),
      at(orbPlug(api, 0.022), [-w / 2, 0, 0], [0, 0, Math.PI / 2]),
      S.box(0.07, 0.0008, 0.05, 'steel', { pos: [0.012, inlet / 2 + 0.0004, 0.012] }),
    ], 'steel'));
    // vis de réglage du limiteur (côté -X) et contre-écrou
    g.add(merged([
      lathe([[0, 0], [0.006, 0], [0.006, 0.022], [0, 0.022]], 'steel', { axis: '-x', seg: 12, pos: [-w / 2 - 0.01, 0, 0] }),
      S.nut(0.013, 0.005, 'zinc', { axis: 'x', pos: [-w / 2 - 0.016, 0, 0] }),
    ], 'steel'));
    P('7', at(g, [0, H - inlet / 2, 0]), [0, ey(3), 0]);
  }

  // 1 — bases de poignée PVM (sans levier) contre la face -X
  const handleBase = () => {
    const alu = merged([
      S.box(0.008, sec * 0.92, 0.07, 'castAlu', { r: 0.002, pos: [-0.004, 0, 0] }),
      S.box(0.03, sec * 0.7, 0.05, 'castAlu', { r: 0.004, pos: [-0.021, 0, 0] }),
      lathe([[0, 0], [0.013, 0], [0.013, 0.012], [0.009, 0.016], [0, 0.016]], 'castAlu', { axis: '-x', seg: 20, pos: [-0.036, 0.004, 0] }),
    ], 'castAlu');
    const screws = [];
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) screws.push(at(capScrew(api, 0.005, 0.01), [-0.008, sy * sec * 0.36, sz * 0.03], [0, 0, Math.PI / 2]));
    const sock = lathe([[0, -0.001], [0.0055, -0.001], [0.0055, 0.0005], [0, 0.0005]], 'blackOxide', { axis: '-x', seg: 6, pos: [-0.052, 0.004, 0] });
    return group(alu, merged(screws, 'steel'), sock);
  };
  ys.forEach((y, i) => P('1', at(handleBase(), [-w / 2, y, 0]), [-0.09, ey(i), 0]));

  // 5 — commandes PVEO (embase alu, boîtier noir à ailettes, connecteur AMP, voyant)
  const pveo = () => {
    const h = sec * 0.94;
    const base = S.box(0.022, h, d * 0.94, 'castAlu', { r: 0.002, pos: [0.011, 0, 0] });
    const body = S.extrude([[0, -h / 2], [0.082, -h / 2], [0.082, h / 2 - 0.004], [0.06, h / 2 + 0.006], [0.012, h / 2 + 0.006], [0, h / 2 - 0.004]], d * 0.82, 'plastic');
    body.position.set(0.022, 0, 0);
    const fins = [0, 1, 2, 3, 4].map((i) => S.box(0.012, 0.0035, d * 0.78, 'plastic', { r: 0.001, pos: [0.106, -h * 0.36 + i * h * 0.18, 0] }));
    const conn = S.box(0.022, 0.016, 0.03, 'plastic', { r: 0.002, pos: [0.116, -h * 0.08, 0.014] });
    const latch = S.box(0.012, 0.004, 0.014, 'plastic', { pos: [0.12, -h * 0.08 + 0.01, 0.014] });
    const screws = [];
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) screws.push(at(capScrew(api, 0.005, 0.02), [0.023, sy * h * 0.36, sz * d * 0.42], [0, 0, -Math.PI / 2]));
    const led = S.cyl(0.0035, 0.002, 'lampAmber', { pos: [0.05, h / 2 + 0.0065, -0.02], seg: 12 });
    return group(base, merged([body, ...fins, conn, latch], 'plastic'), merged(screws, 'steel'), led);
  };
  ys.forEach((y, i) => P('5', at(pveo(), [w / 2, y, 0]), [0.1, ey(i), 0]));

  // 8 — tirants et écrous (trousse de joints et boulonnerie PVG 32)
  for (const [x, z] of rods) {
    P('8', merged([
      S.cyl(0.004, H + 0.012, 'zinc', { seg: 12, pos: [x, H / 2, z] }),
      S.nut(0.013, 0.0065, 'zinc', { pos: [x, -0.0033, z] }),
      S.nut(0.013, 0.0065, 'zinc', { pos: [x, H + 0.0033, z] }),
    ], 'zinc'), [0, -0.6 * H - 0.06, 0]);
  }
  return { view: { dir: [1, 0.6, 1.2] } };
}
