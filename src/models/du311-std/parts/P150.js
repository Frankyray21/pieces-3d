// P150 — Boîte de jonction du distributeur du carrousel CX038093 rév. 0
// (pages 150 à 153) : « CAROUSEL VALVE JUNCTION BOX ». Coffret acier
// 8 × 10 × 4 po posé sur la platine du distributeur (P140), vues de face, de
// côté, de dessous et intérieure :
// - coffret découpé (1) : caisse peinte, porte à charnières à gauche, joint,
//   quatre grenouillères, pattes de fixation haute et basse, fond de montage,
//   rail DIN, deux rangées de six perçages et un grand perçage dessous ;
// - module de multiplexage VMM1615 (2) en haut : connecteurs 12 voies gris A
//   (3), noirs B (4, deux), vert C et brun D (5, la ligne répétée désigne la
//   même pièce : les deux fiches forment l'objet 5), cales (7) ; 58 contacts
//   taille 16 (8) et 22 bouchons d'obturation (9) au dos des fiches ; deux
//   fiches d'alimentation rondes (10) et leurs contacts 8-10 AWG (11) ;
// - bornier sur rail DIN : quatre bornes de passage 45 A (12), couvercle
//   d'extrémité (13) et barrette (14), 28 bornes à étages (15, la plaque
//   d'extrémité de la ligne répétée est jointe à la dernière), barrette 25 A
//   (17), deux butées (18) ; diode 5 A (31) entre deux bornes ;
// - capteur d'inclinaison biaxe 360/180 (20) ; convertisseur analogique →
//   CAN de la position de la tête (32), fiche 6 voies (33) et sa cale (34) ;
//   bus CAN : trois dérivations en Y 3 voies (38), huit fiches DT (37) avec
//   cales orange (40, trois) et bleues (41, cinq), bouchon de terminaison à
//   résistance (39) ;
// - dessous : douze presse-étoupes 3/8 NPT polyamide (25, bague d'étanchéité
//   jointe) et contre-écrous (27) ; presse-étoupe 3/4 NPT (28), bague (29) et
//   contre-écrou (30) du câble composite 16/12C + 18/2C J1939 (23, 3 pi), qui
//   finit sur l'embase 14 broches à serre-câble (21, 14 broches 22) et le
//   boîtier 16 voies à levier (24) ; étiquette « CVJB » (19) sur la porte.
// Repère : origine au centre de la face arrière (face de pose), Z vers
// l'extérieur par la porte, Y vers le haut (presse-étoupes en bas, -Y), X en
// travers (charnières à -X) ; câble composite sorti vers -Y puis descendant vers -Z (vers le bas dans P140).
// Encombrement du coffret ≈ 0.22 × 0.30 (pattes) × 0.11 m.
// Cotes : coffret 8 × 10 × 4 po (proportions des vues de face et de dessous),
// presse-étoupes 3/8 et 3/4 NPT, câble 3 pi (liste) ; implantation
// intérieure d'après la vue intérieure de la page 150.
import { u } from './_carousel.js';

const BOX = { w: u(8), h: u(10), d: u(4), t: 0.0015 };
export const JB150 = { ...BOX, tabs: [[-0.055, BOX.h / 2 + 0.012], [0.055, BOX.h / 2 + 0.012], [-0.055, -BOX.h / 2 - 0.012], [0.055, -BOX.h / 2 - 0.012]] };

export default function P150(api) {
  const { S } = api;
  const { group, merged, at, lathe, box, cyl } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { w, h, d, t } = BOX;
  const hw = w / 2, hh = h / 2;

  // ================================================ 1 — coffret
  const body = [
    box(w, h, t, 'lightGrey', { pos: [0, 0, t / 2] }),
    box(t, h, d, 'lightGrey', { pos: [-hw + t / 2, 0, d / 2] }), box(t, h, d, 'lightGrey', { pos: [hw - t / 2, 0, d / 2] }),
    box(w, t, d, 'lightGrey', { pos: [0, hh - t / 2, d / 2] }), box(w, t, d, 'lightGrey', { pos: [0, -hh + t / 2, d / 2] }),
    // porte (panneau à bord tombé) et pattes de fixation haute / basse
    box(w + 0.004, h + 0.004, 0.0025, 'lightGrey', { r: 0.002, pos: [0, 0, d + 0.0045] }),
    ...[-1, 1].map((s) => box(w * 0.5, 0.024, 0.0025, 'lightGrey', { pos: [0, s * (hh + 0.012), 0.00125] })),
  ];
  const rub = [
    box(w - 0.006, 0.004, 0.003, 'rubber', { pos: [0, hh - 0.004, d + 0.0015] }), box(w - 0.006, 0.004, 0.003, 'rubber', { pos: [0, -hh + 0.004, d + 0.0015] }),
    box(0.004, h - 0.006, 0.003, 'rubber', { pos: [-hw + 0.004, 0, d + 0.0015] }), box(0.004, h - 0.006, 0.003, 'rubber', { pos: [hw - 0.004, 0, d + 0.0015] }),
  ];
  const zinc = [
    box(w - 0.02, h - 0.03, 0.002, 'zinc', { pos: [0, 0.003, 0.005] }), // fond de montage
    box(0.19, 0.035, 0.0075, 'zinc', { pos: [0, -0.085, 0.0098] }), // rail DIN 35 × 7.5
    ...[-1, 1].map((s) => cyl(0.0035, 0.04, 'steel', { seg: 10, pos: [-hw - 0.003, s * 0.07, d + 0.003] })), // charnières
  ];
  // grenouillères (deux par côté) et trous de fixation des pattes (lamages sombres)
  const latches = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    latches.push(box(0.008, 0.02, 0.012, 'steel', { r: 0.001, pos: [sx * (hw + 0.004), sy * 0.06, d - 0.004] }));
    latches.push(box(0.004, 0.012, 0.01, 'steel', { pos: [sx * (hw + 0.0075), sy * 0.06, d + 0.004] }));
  }
  const dark = JB150.tabs.map(([x, y]) => cyl(u(0.2), 0.0028, 'darkSteel', { axis: 'z', seg: 12, pos: [x, y, 0.0013] }));
  P('1', group(merged(body, 'lightGrey'), merged(rub, 'rubber'), merged([...zinc, ...latches], 'zinc'), merged(dark, 'darkSteel')), [0, 0, -0.05]);

  // 19 — étiquette de porte
  P('19', at(S.nameplate(0.07, 0.03, { material: 'white' }), [0, 0.03, d + 0.0058]), [0, 0, 0.06]);

  // ================================================ 2 — module VMM1615, fiches et contacts
  const mz0 = 0.006, mz1 = mz0 + 0.035;
  P('2', group(
    box(0.15, 0.1, 0.035, 'plastic', { r: 0.004, pos: [-0.01, 0.06, (mz0 + mz1) / 2] }),
    merged([[-0.08, 0.012], [0.06, 0.012], [-0.08, 0.108], [0.06, 0.108]].map(([x, y]) => cyl(0.004, 0.004, 'zinc', { axis: 'z', seg: 10, pos: [x, y, mz1] })), 'zinc'),
    box(0.04, 0.012, 0.0004, 'white', { pos: [0.0, 0.016, mz1 + 0.0002] }),
  ), [0, 0, 0.08]);
  // fiches 12 voies (2 × 6 alvéoles au pas de 4 × 6 mm), face vers le module
  const plugs = { '3': [[0.042, 0.06, 'grey']], '4': [[-0.015, 0.085, 'black'], [0.012, 0.085, 'black']], '5': [[-0.015, 0.035, 'green'], [0.012, 0.035, 'orange']] };
  const pd = 0.028, pz = mz1 + pd / 2;
  const cav = []; // alvéoles [x, y, z dos]
  const plug12 = (x, y, mat) => {
    const g = box(0.022, 0.03, pd, mat, { r: 0.0015, pos: [x, y, pz] });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) cav.push([x - 0.004 + i * 0.008, y - 0.0125 + j * 0.005, mz1 + pd]);
    return g;
  };
  for (const [ref, list] of Object.entries(plugs)) {
    if (ref === '5') P('5', group(...list.map(([x, y, m]) => plug12(x, y, m))), [0, 0, 0.14]);
    else for (const [x, y, m] of list) P(ref, plug12(x, y, m), [0, 0, 0.14]);
  }
  // 7 — cales des cinq fiches (bande sur le flanc avant)
  for (const [x, y] of [[0.042, 0.06], [-0.015, 0.085], [0.012, 0.085], [-0.015, 0.035], [0.012, 0.035]]) P('7', box(0.023, 0.004, 0.006, 'safety', { pos: [x, y + 0.017, mz1 + 0.004] }), [0, 0.02, 0.14]);
  // 10, 11 — fiches d'alimentation rondes et contacts
  for (const y of [0.085, 0.04]) {
    P('10', lathe([[0, 0], [0.009, 0], [0.009, 0.022], [0.0075, 0.026], [0, 0.026]], 'plastic', { axis: 'z', seg: 18, pos: [-0.062, y, mz1] }), [0, 0, 0.14]);
    P('11', merged([cyl(0.0022, 0.012, 'copper', { axis: 'z', seg: 10, pos: [-0.062, y, mz1 + 0.032] }), cyl(0.0032, 0.03, 'red', { axis: 'z', seg: 10, pos: [-0.062, y, mz1 + 0.05] })], 'copper'), [0, 0, 0.2]);
  }

  // ================================================ bornier sur rail DIN
  const ry = -0.085, rz = 0.0136;
  let x = -0.093;
  const unit = (wd, ht, mat, depth = 0.045) => { const o = box(wd - 0.0003, ht, depth, mat, { r: 0.0006, pos: [x + wd / 2, ry + 0.004, rz + depth / 2] }); x += wd; return o; };
  const screwHeads = (x0, wd, ht, n, depth) => Array.from({ length: n }, (_, i) => cyl(0.0018, 0.001, 'steel', { axis: 'z', seg: 8, pos: [x0 + wd / 2, ry + 0.004 - ht / 2 + ((i + 0.5) * ht) / n, rz + depth + 0.0005] }));
  P('18', unit(0.006, 0.04, 'grey', 0.035), [0, 0, 0.06]);
  const ft = [];
  for (let i = 0; i < 4; i++) { const x0 = x; P('12', group(unit(0.0082, 0.05, 'grey'), merged(screwHeads(x0, 0.0082, 0.05, 2, 0.045), 'steel')), [0, 0, 0.08]); ft.push(x0); }
  P('13', unit(0.0015, 0.05, 'grey'), [0, 0, 0.08]);
  P('14', box(4 * 0.0082 - 0.002, 0.004, 0.003, 'brass', { pos: [ft[0] + 2 * 0.0082, ry + 0.004, rz + 0.047] }), [0, 0, 0.12]);
  const mt = [];
  for (let i = 0; i < 28; i++) {
    const x0 = x;
    const parts = [unit(0.005, 0.064, i % 2 ? 'grey' : 'lightGrey', 0.05), merged(screwHeads(x0, 0.005, 0.064, 3, 0.05), 'steel')];
    if (i === 27) parts.push(unit(0.0015, 0.064, 'grey', 0.05)); // plaque d'extrémité (ligne 15 répétée)
    P('15', group(...parts), [0, 0, 0.08]);
    mt.push(x0);
  }
  P('17', box(10 * 0.005 - 0.002, 0.003, 0.003, 'brass', { pos: [mt[4] + 5 * 0.005, ry + 0.02, rz + 0.052] }), [0, 0, 0.12]);
  P('18', unit(0.006, 0.04, 'grey', 0.035), [0, 0, 0.06]);
  // 31 — diode axiale entre deux bornes de passage
  P('31', group(cyl(0.0027, 0.009, 'black', { axis: 'x', seg: 12, pos: [ft[1] + 0.004, ry + 0.034, rz + 0.04] }), merged([-1, 1].map((s) => cyl(0.0005, 0.006, 'steel', { axis: 'x', seg: 6, pos: [ft[1] + 0.004 + s * 0.0075, ry + 0.034, rz + 0.04] })), 'steel')), [0, 0.03, 0.12]);

  // ================================================ 20 — capteur d'inclinaison, 32 — convertisseur CAN, 33 / 34
  P('20', group(box(0.055, 0.035, 0.026, 'black', { r: 0.003, pos: [0.055, -0.028, 0.006 + 0.013] }), merged([[-1, -1], [1, 1]].map(([sx, sy]) => cyl(0.0025, 0.002, 'zinc', { axis: 'z', seg: 10, pos: [0.055 + sx * 0.022, -0.028 + sy * 0.012, 0.033] })), 'zinc'), cyl(0.005, 0.012, 'black', { axis: 'x', seg: 14, pos: [0.088, -0.028, 0.019] })), [0.06, 0, 0.08]);
  P('32', group(box(0.024, 0.07, 0.024, 'blue', { r: 0.002, pos: [0.081, 0.055, 0.006 + 0.012] }), box(0.012, 0.016, 0.012, 'black', { pos: [0.081, 0.017, 0.018] })), [0.06, 0, 0.08]);
  const c6 = [];
  P('33', (() => { const g = box(0.016, 0.014, 0.022, 'grey', { r: 0.001, pos: [0.081, 0.004, 0.018] }); for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) c6.push([0.077 + i * 0.008, -0.003, 0.012 + j * 0.006, 'y']); return g; })(), [0.06, -0.04, 0.08]);
  P('34', box(0.017, 0.003, 0.006, 'safety', { pos: [0.081, 0.009, 0.026] }), [0.06, -0.04, 0.1]);

  // ================================================ bus CAN : 38 dérivations, 37 fiches, 39 terminaison, 40 / 41 cales
  const yC = -0.03, zC = 0.03;
  const legs = [];
  [-0.07, -0.045, -0.02].forEach((xY) => {
    P('38', merged([
      box(0.012, 0.012, 0.012, 'black', { r: 0.002, pos: [xY, yC, zC] }),
      cyl(0.005, 0.016, 'black', { axis: 'x', seg: 12, pos: [xY - 0.012, yC, zC] }),
      cyl(0.005, 0.016, 'black', { axis: 'x', seg: 12, pos: [xY + 0.012, yC, zC] }),
      cyl(0.005, 0.014, 'black', { seg: 12, pos: [xY, yC + 0.012, zC] }),
    ], 'black'), [0, 0.03, 0.1]);
    legs.push([xY - 0.02, yC, zC, 'x'], [xY + 0.02, yC, zC, 'x'], [xY, yC + 0.022, zC, 'y']);
  });
  // huit fiches DT sur les branches, la neuvième branche reçoit la terminaison
  legs.forEach(([lx, ly, lz, ax], i) => {
    if (i === 8) {
      P('39', group(cyl(0.0065, 0.016, 'grey', { axis: ax, seg: 14, pos: [lx, ly, lz] }), cyl(0.004, 0.004, 'red', { axis: ax, seg: 10, pos: ax === 'x' ? [lx + 0.01, ly, lz] : [lx, ly + 0.01, lz] })), [0, 0.04, 0.12]);
      return;
    }
    P('37', cyl(0.0062, 0.014, 'grey', { axis: ax, seg: 14, pos: [lx, ly, lz] }), [0, 0.04, 0.12]);
    const wd = box(ax === 'x' ? 0.003 : 0.009, ax === 'x' ? 0.009 : 0.003, 0.004, i < 3 ? 'orange' : 'blue', { pos: [lx, ly, lz + 0.0065] });
    P(i < 3 ? '40' : '41', wd, [0, 0.04, 0.14]);
    for (let j = 0; j < 3; j++) c6.push([lx + (ax === 'x' ? 0 : (j - 1) * 0.003), ly + (ax === 'y' ? 0 : (j - 1) * 0.003), lz, ax]);
  });

  // ================================================ 8 — contacts, 9 — bouchons d'obturation
  // 60 alvéoles des fiches 12 voies, 6 de la fiche 6 voies, 24 des fiches DT
  const slots = [...cav.map(([cx, cy, cz]) => ({ p: [cx, cy, cz], ax: 'z' })), ...c6.map(([cx, cy, cz, ax]) => ({ p: [cx, cy, cz], ax }))];
  let nS = 0, nP = 0;
  for (const s of slots) {
    if (nS < 58) {
      const [px, py, pz] = s.p;
      const off = s.ax === 'z' ? [0, 0, 0.004] : s.ax === 'y' ? [0, -0.004, 0] : [0, 0, 0.004];
      P('8', merged([
        cyl(0.0009, 0.006, 'black', { axis: s.ax === 'y' ? 'y' : 'z', seg: 6, pos: [px + off[0], py + off[1], pz + off[2]] }),
        cyl(0.0005, 0.002, 'copper', { axis: s.ax === 'y' ? 'y' : 'z', seg: 6, pos: [px + off[0] * 2, py + off[1] * 2, pz + off[2] * 2] }),
      ], 'black'), [0, 0, 0.2]);
      nS++;
    } else if (nP < 22) {
      P('9', cyl(0.0011, 0.0012, 'white', { axis: s.ax === 'y' ? 'y' : 'z', seg: 8, pos: [s.p[0], s.p[1], s.p[2] + 0.0006] }), [0, 0, 0.2]);
      nP++;
    }
  }

  // ================================================ presse-étoupes dessous
  const by = -hh;
  const gland = (r, af, hgt, mat = 'plastic') => group(
    merged([
      S.nut(af, hgt * 0.35, mat, { pos: [0, -0.0015 - hgt * 0.175, 0] }),
      lathe([[r * 0.45, -0.0015 - hgt * 0.35], [r, -0.0015 - hgt * 0.35], [r * 0.95, -0.0015 - hgt * 0.75], [r * 0.7, -0.0015 - hgt], [r * 0.45, -0.0015 - hgt]], mat, { seg: 16 }),
    ], mat),
    lathe([[r * 0.6, -0.0015], [af * 0.55, -0.0015], [af * 0.55, 0], [r * 0.6, 0]], 'rubber', { seg: 16 }),
  );
  const small = [];
  for (let i = 0; i < 6; i++) for (const zz of [0.03, 0.07]) small.push([-0.045 + i * 0.026, zz]);
  for (const [gx, gz] of small) {
    P('25', at(gland(0.009, 0.022, 0.02), [gx, by, gz]), [0, -0.05, 0]);
    P('27', at(S.nut(0.022, 0.004, 'plastic'), [gx, by + t + 0.002, gz]), [0, 0.03, 0]);
  }
  const big = [-0.08, 0.05];
  P('28', at(gland(0.0145, 0.032, 0.026), [big[0], by - 0.0015, big[1]]), [0, -0.06, 0]);
  P('29', lathe([[0.012, -0.0015], [0.0185, -0.0015], [0.0185, 0], [0.012, 0]], 'rubber', { seg: 20, pos: [big[0], by, big[1]] }), [0, -0.035, 0]);
  P('30', at(S.nut(0.032, 0.005, 'plastic'), [big[0], by + t + 0.0025, big[1]]), [0, 0.035, 0]);

  // ================================================ 23 — câble composite, 21 / 22 — embase 14 broches, 24 — boîtier 16 voies
  // sortie vers -Y puis descente vers -Z (vers le bas une fois le coffret posé à plat dans P140)
  const path = [[big[0], by - 0.026, big[1]], [big[0], by - 0.05, big[1] - 0.005], [big[0], by - 0.063, big[1] - 0.04], [big[0], by - 0.063, big[1] - 0.15], [big[0], by - 0.062, big[1] - 0.26]];
  P('23', S.tube(path, 0.0072, 'black', { seg: 48, radial: 10 }), [0, -0.08, 0]);
  const rc = path[path.length - 1];
  P('21', lathe([[0, 0], [0.009, 0], [0.009, 0.012], [0.012, 0.016], [0.012, 0.034], [0.016, 0.034], [0.016, 0.04], [0.0135, 0.04], [0.0135, 0.05], [0, 0.05]], 'darkSteel', { axis: '-z', seg: 24, pos: rc }), [0, -0.12, 0]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, r = i < 10 ? 0.0085 : 0.004;
    P('22', cyl(0.0006, 0.008, 'brass', { axis: 'z', seg: 6, pos: [rc[0] + r * Math.cos(a), rc[1] + r * Math.sin(a), rc[2] - 0.052] }), [0, -0.15, 0]);
  }
  P('24', group(box(0.036, 0.03, 0.03, 'black', { r: 0.003, pos: [rc[0], rc[1], rc[2] - 0.071] }), cyl(0.0025, 0.04, 'steel', { axis: 'x', seg: 10, pos: [rc[0], rc[1] + 0.017, rc[2] - 0.066] })), [0, -0.2, 0]);

  return { view: { dir: [0.5, 0.3, 1] } };
}
