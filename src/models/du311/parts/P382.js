// P382 — Trousse de télésurveillance CX033975 rév. 0 (page 382), repère 40 de
// P328 : coffret DCU (4, P384) vissé par 4 vis H 1/4 × 1/2 (5) et rondelles (7)
// sur son support en Z (3, tôle 3/16 pliée : platine, âme, aile d'attache),
// lui-même boulonné sur le montant avant gauche du marchepied de translation
// par 2 vis H 5/16 × 3/4 (6) et rondelles Nord-Lock (8). Antenne omnidirec-
// tionnelle 3 dBi (1) sur le toit de la garde des vannes de translation (P372,
// perçage Ø 16 en x 0.16, z −0.06 de son repère), reliée à la traversée N du
// coffret par le câble d'antenne N / N de 4 m (2) : tracé le long du montant,
// mou lové en 3 spires (rayon ajusté pour que le câble fasse 4 m).
// Repère : origine sur la face arrière de l'aile d'attache du support (face
// d'appui contre le montant du marchepied), au milieu de ses deux trous ;
// Y vers le haut, +Z vers l'avant (côté coffret, à l'opposé du montant), la
// platine et le coffret vers −X. Aile x ±0.02, trous Ø 9 en (0, ±0.15) ;
// platine z 0.045 → 0.050, x −0.025 → −0.275 ; coffret P384 en
// (−0.15, 0, 0.0498), sans rotation. Antenne : base posée en ANT (dessus du
// toit de P372) = [0.15, 1.0, −0.3] par défaut (position estimée sur la vue
// isométrique) ; le parent peut la fixer : api.sub('P382', { ant: [x, y, z] })
// (le câble est retracé et garde 4 m). Encombrement par défaut 0.43 (X) ×
// 1.38 (Y) × 0.51 (Z) m, du bas des connecteurs du coffret (y −0.30) au haut de
// l'antenne (1.08).
import { IN, kit } from './_porteur.js';
import { DCU } from './P384.js';

const T = 0.1875 * IN; // tôle 3/16
const ZP = 0.045; // face arrière de la platine
export const KIT382 = {
  ANT: [0.15, 1.0, -0.3], // base de l'antenne (dessus du toit de la garde P372), par défaut
  dcu: [-0.15, 0, ZP + T], // origine de P384 (centre du dos du coffret)
  holes: [[0, 0.15], [0, -0.15]], // trous de l'aile d'attache (z = 0)
  cable: 4.0, // longueur du câble d'antenne (m)
  roofT: T, // épaisseur du toit de P372 (sous la base de l'antenne)
};

export default function P382(api, opts = {}) {
  const { THREE, S } = api;
  const { lathe, merged, group, at, tube } = S;
  const K = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ANT = opts.ant || KIT382.ANT;
  const [XC, , ZE] = KIT382.dcu;
  const ED = 0.25; // éclaté du coffret (+Z)

  // ------------------------------------------------- 3 — support du coffret
  const xw = -0.02; // âme (face extérieure) ; platine vers −X
  const pw = 0.25, ph = 0.37;
  const xp = xw - T - pw / 2; // milieu de la platine
  const holesP = DCU.tabs.map(([x, y]) => [XC + x - xp, -y, 0.0036]);
  const mount = merged([
    at(K.plate(0.04, 0.36, T, 'black', { holes: KIT382.holes.map(([x, y]) => [x, -y, 0.0048]), seg: 5 }), [0, 0, T / 2], [Math.PI / 2, 0, 0]),
    at(K.plate(ZP + T, ph, T, 'black'), [xw - T / 2, 0, (ZP + T) / 2], [Math.PI / 2, 0, Math.PI / 2]),
    at(K.plate(pw, ph, T, 'black', { holes: holesP, seg: 5 }), [xp, 0, ZP + T / 2], [Math.PI / 2, 0, 0]),
  ], 'black');
  P('3', mount, [0, 0, 0.1]);

  // ---------------------------------------------------- 4 — coffret DCU P384
  P('4', at(api.sub('P384'), KIT382.dcu), [0, 0, ED]);

  // 5 — vis H 1/4 × 1/2 et 7 — rondelles, dans les pattes du coffret.
  const zt = ZE + 0.0025; // face avant des pattes
  for (const [x, y] of DCU.tabs) {
    const p = [XC + x, y, zt];
    P('7', K.washer(0.25 * IN, 'zinc', { pos: p, axis: 'z', seg: 6 }), [0, 0, ED + 0.04]);
    P('5', K.screw(0.25 * IN, 0.5 * IN, 'zinc', { pos: [p[0], p[1], zt + 0.0016], axis: 'z', seg: 6 }), [0, 0, ED + 0.08]);
  }
  // 6 — vis H 5/16 × 3/4 et 8 — rondelles Nord-Lock (paire), dans l'aile d'attache.
  for (const [x, y] of KIT382.holes) {
    const nl = K.band(0.0085, 0.0043, 0, 0.0034, 'zinc', 6); // paire collée
    P('8', K.place(nl, { pos: [x, y, T], axis: 'z' }), [0, 0, 0.16]);
    P('6', K.screw(0.3125 * IN, 0.75 * IN, 'zinc', { pos: [x, y, T + 0.0034], axis: 'z', seg: 6 }), [0, 0, 0.22]);
  }

  // ------------------------------------------- 1 — antenne omni 3 dBi (N)
  // Repère local : origine sur le dessus du toit, +Y vers le haut.
  const tr = KIT382.roofT;
  const ant = group(
    lathe([[0, 0], [0.018, 0], [0.018, 0.006], [0.0135, 0.011], [0.0135, 0.07], [0.011, 0.078], [0.006, 0.0815], [0, 0.0825]], 'black', { seg: 8 }),
    merged([
      lathe([[0, -tr - 0.024], [0.0075, -tr - 0.024], [0.0075, -tr], [0.006, -tr], [0, -tr]], 'steel', { seg: 6 }),
      at(K.hex(0.022, 0.005), [0, -tr - 0.0025, 0]), // contre-écrou sous le toit
    ], 'steel'),
  );
  P('1', at(ant, ANT), [0, 0.15, 0]);

  // ------------------------------------- 2 — câble d'antenne N / N, 4 m
  // Fiches N mâles aux deux bouts (écrou moleté, manchon), câble Ø 10 mm.
  const plug = () => merged([
    lathe([[0, 0], [0.0105, 0], [0.0105, 0.02], [0.0075, 0.023], [0.0068, 0.04], [0, 0.04]], 'steel', { seg: 6 }),
  ], 'steel');
  const jack = [XC + DCU.nJack[0], DCU.nJack[1], ZE + DCU.nJack[2]]; // bout de la traversée N du coffret
  const a0 = [jack[0], jack[1] + 0.012, jack[2]]; // fiche : de a0 vers le bas
  const top = [ANT[0], ANT[1] - tr - 0.024 - 0.012, ANT[2]]; // fiche sous l'antenne : de top vers le bas
  const R = 0.005;
  const xr = 0.045, zr = -0.03; // descente le long du montant (côté +X, en retrait)
  const route = (rc, n) => {
    const pts = [
      [a0[0], a0[1] - 0.04, a0[2]], [a0[0], a0[1] - 0.09, a0[2]], [a0[0] + 0.06, -0.34, a0[2] - 0.02],
      [xr, -0.33, 0.01], [xr, -0.2, zr], [xr, 0.2, zr],
    ];
    // Spires dans le plan YZ, entrée et sortie vers +Y en z = zr.
    const cy = 0.32, cz = zr - rc, pitch = 0.014, k = 14;
    for (let i = 0; i <= n * k; i++) {
      const th = Math.PI / 2 + (i / k) * Math.PI * 2;
      pts.push([xr + (pitch * i) / k, cy - rc * Math.cos(th), cz + rc * Math.sin(th)]);
    }
    const xe = xr + pitch * n;
    pts.push([xe, 0.6, zr], [xe, top[1] - 0.25, zr], [(xe + top[0]) / 2, top[1] - 0.1, (zr + top[2]) / 2], [top[0], top[1] - 0.09, top[2]], [top[0], top[1] - 0.04, top[2]]);
    return pts;
  };
  const lenOf = (p) => new THREE.CatmullRomCurve3(p.map((a) => new THREE.Vector3(...a)), false, 'catmullrom', 0.5).getLength();
  const want = KIT382.cable - 2 * 0.045; // câble libre (fiches et manchons déduits)
  const L0 = lenOf(route(0.0001, 0));
  const n = Math.max(0, Math.min(4, Math.round((want - L0) / (2 * Math.PI * 0.11))));
  let lo = 0.03, hi = 0.2;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (lenOf(route(m, n)) < want) lo = m; else hi = m;
  }
  const pts = route(n ? (lo + hi) / 2 : 0.0001, n);
  const plugs = merged([K.toward(plug(), [0, -1, 0], a0), K.toward(plug(), [0, -1, 0], top)], 'steel');
  P('2', group(tube(pts, R, 'black', { seg: 60, radial: 4, ends: 'none' }), plugs), [0.12, 0, 0]);

  return { view: { dir: [0.9, 0.45, 1] } };
}
