// P060 — Barre de guidage 6 pi CX036192 rév. 1 (page 60) : « ASSY, GUIDE BAR
// - 6FT », repère 5 de l'avance 6 pi P058 (deux exemplaires, sur les lèvres
// avant du mât, de part et d'autre de la fente) : les glissières en V et les
// patins d'usure de la plaque porte-tête (P062) y coulissent. Plat d'acier
// (1, CX036190) de 1 × 2 3/4 po sur 2.76 m, chanfreins à 45° des deux arêtes
// avant (le crochet des glissières prend l'arête extérieure, qui déborde du
// flanc du mât de 1/2 po), entrées biseautées aux deux bouts (« TOP OF MAST »
// en haut). Treize vis H 5/8-11 viennent de l'intérieur du mât au travers de
// la lèvre et se vissent dans des taraudages borgnes de la barre, rondelle
// Nord-Lock (2) sous la tête : vis de 1 1/4 po (4) au travers de la lèvre de
// 1/2 po (détail A), vis de 1 1/2 po (3) là où une fourrure de 1/4 po double
// la lèvre (détail B) ; de haut en bas 4 3 3 4 4 3 3 4 4 4 3 3 4, au pas de
// 9 1/2 po, les deux dernières rapprochées (relevé de la vue de profil).
// Repère : barre le long de +Y, de y = 0 (bout bas) à y = 2.76 m ; largeur
// selon X centrée en x = 0 ; face d'appui sur la lèvre en z = 0, face de
// guidage en z = +1 po ; têtes de vis du côté −Z (dans le mât). Dans P058 :
// at(api.sub('P060'), [±BAR.xc, BAR.y0, BAR.z0]) (profil symétrique : même
// pose des deux côtés). Encombrement ≈ 0.07 (X) × 2.76 (Y) × 0.07 (Z) m.
import { IN, u, BAR, hhcs, nordLock } from './_feed.js';

const T = 1.0, W = 2.75, CH = 0.35, END = 0.5; // épaisseur, largeur, chanfrein d'arête, biseau des bouts (po)
// Vis de haut en bas (fraction de la longueur depuis le haut, repère).
const SEQ = [
  [0.0386, '4'], [0.125, '3'], [0.2116, '3'], [0.298, '4'], [0.385, '4'], [0.471, '3'], [0.558, '3'],
  [0.644, '4'], [0.731, '4'], [0.817, '4'], [0.904, '3'], [0.9587, '3'], [0.977, '4'],
];

export default function P060(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = BAR.L;

  // 1 — barre : section (x, z) extrudée selon Y, puis biseaux des bouts (la
  // face de guidage recule de END po sur les 4 premiers et derniers pouces).
  const w = u(W) / 2, t = u(T), c = u(CH);
  const sec = [[-w, 0], [w, 0], [w, t - c], [w - c, t], [-w + c, t], [-w, t - c]];
  const shape = new THREE.Shape(sec.map(([x, z]) => new THREE.Vector2(x, z)));
  const ramp = u(4), drop = u(END) * 0.5;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, steps: Math.round(L / ramp) });
  // extrusion selon +Z local → −Y puis décalée ; profil (x, y) → (x, z).
  geo.rotateX(Math.PI / 2);
  geo.translate(0, L, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), z = pos.getZ(i);
    if (z < t * 0.5) continue;
    const k = Math.max(0, 1 - Math.min(y, L - y) / ramp);
    pos.setZ(i, z - drop * k * 2 * (z / t - 0.5));
  }
  geo.computeVertexNormals();
  const bar = S.merged([new THREE.Mesh(geo)], 'steel');
  bar.geometry.computeVertexNormals();
  P('1', bar, [0, 0, 0.12]);

  // 3 / 4 — vis H 5/8, tête côté −Z sous la lèvre ; 2 — Nord-Lock.
  const d = 0.625 * IN;
  const nl = 2 * Math.max(0.0008, d * 0.09) * 1.1;
  for (const [f, ref] of SEQ) {
    const y = L * (1 - f);
    const wall = ref === '3' ? 0.75 : 0.5; // lèvre (+ fourrure)
    const len = ref === '3' ? 1.5 : 1.25;
    const zh = -u(wall);
    P('2', nordLock(d, [0, y, zh - nl / 2], [0, 0, -1]), [0, 0, -0.06]);
    P(ref, hhcs(d, u(len), [0, y, zh - nl], [0, 0, -1]), [0, 0, -0.12]);
  }
  return { view: { dir: [0.8, 0.3, 1] } };
}
