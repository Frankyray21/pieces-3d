// P124 — Barre de guidage CX033811 rév. 1 (page 124) : « ASSY, GUIDE BAR -
// HEAVY HOIST ». Barre plate d'acier (1, CM45836) de 1 × 3 po sur 98 po,
// fixée sur un flanc du mât HH 10 pi (P032 repère 29 / P130 repère 5, deux
// exemplaires, aux arêtes arrière du mât) : elle guide la plaque porte-tête.
// Bouts biseautés côté face de guidage (entrée des patins, « TOP OF MAST » en
// haut). Onze vis H 5/8 passent de l'intérieur du mât au travers de la paroi et
// se vissent dans des taraudages borgnes de la barre, Nord-Lock (4) sous la
// tête : vis de 1 1/4 po (3) là où la paroi fait 1/2 po (détail A), vis de
// 1 1/2 po (2) là où elle fait 3/4 po (détail B) ; de haut en bas
// 3 2 3 3 2 3 3 3 3 3 2, au pas de 9 po, première à 4 1/2 po du haut.
// Repère (celui de P136 dans mast.js) : barre le long de +Y, de y = 0 (bout
// inférieur) à y = 2.489 m (haut du mât) ; épaisseur selon X, centrée en
// x = 0 ; −X vers la paroi du mât (face d'appui en x = −0.0127), +X vers
// l'extérieur (face de guidage) ; largeur selon Z, centrée. La paroi du mât
// (non modélisée) occupe x ∈ [−0.0127 − e, −0.0127], e = 1/2 ou 3/4 po ; les
// têtes de vis sont dessous, côté −X. Encombrement ≈ 0.06 (X, des têtes de vis
// à la face de guidage) × 2.489 (Y) × 0.076 (Z) m.
// Cotes : vis et parois d'après la liste et les détails A / B (cotes 1/2 et
// 3/4 po) ; barre, pas et biseaux d'après les proportions de la vue de profil.
import { IN, hhcs, nordLock } from './_avance_a.js';

const u = (v) => v * IN;
const T = 1.0; // épaisseur de la barre
const BW = 3.0; // largeur
const L = 98; // longueur
const CH = 0.5; // biseau des bouts sur la face de guidage
const PITCH = 9;
const TOP = 4.5; // première vis sous le haut
const SEQ = ['3', '2', '3', '3', '2', '3', '3', '3', '3', '3', '2'];

export default function P124(api) {
  const { extrude, merged } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — barre : profil (x, y) extrudé sur la largeur Z ; face d'appui pleine
  // longueur, face de guidage raccourcie par les biseaux des deux bouts.
  const bar = extrude([
    [-T / 2, 0], [T / 2, CH], [T / 2, L - CH], [-T / 2, L],
  ].map(([x, y]) => [u(x), u(y)]), u(BW), 'steel');
  P('1', merged([bar], 'steel'), [0.12, 0, 0]);

  // 2 / 3 — vis H 5/8, tête côté −X sous la paroi du mât ; 4 — Nord-Lock.
  const d = 0.625 * IN;
  const wt = u(0.125);
  SEQ.forEach((ref, i) => {
    const y = u(L - TOP - i * PITCH);
    const wall = ref === '2' ? 0.75 : 0.5;
    const len = ref === '2' ? 1.5 : 1.25;
    const xh = -u(T / 2 + wall); // face intérieure de la paroi
    P(ref, hhcs(d, u(len), [xh - wt, y, 0], [-1, 0, 0]), [-0.11, 0, 0]);
    P('4', nordLock(d, [xh - wt / 2, y, 0], [-1, 0, 0]), [-0.055, 0, 0]);
  });

  return { view: { dir: [-1, 0.3, 0.8] } };
}
