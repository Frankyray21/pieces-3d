// P048 — Trousse de graissage centralisé du bras de tige V30 SAPA : CX031686
// rév. 0 « M.GREASE LINE KIT, V30SAPA » (page 48), repère 10 de l'avance P032
// (détail A : sur l'arbre vertical du bras de tige à axe unique, entre les
// deux pinces). Bloc de graissage en acier zingué (1) de 1 1/4 × 1 × 7.8 po :
// dix graisseurs droits 1/8 NPT (2) sur la face avant, un par point graissé
// PA1 à PA10 (orifices de sortie 1/8 NPT sur le flanc +X, vers les boyaux de
// graissage des paliers) ; deux vis H 3/8-16 × 1 3/4 (3) et rondelles fendues
// (4) au travers du bloc, à la 2e et à la 11e des douze positions.
// Repère : origine au centre de la face d'appui du bloc (face arrière, contre
// le bossage de l'arbre), Y vers le haut le long du bloc (PA1 en haut), +Z
// vers l'avant (graisseurs, têtes de vis), +X vers les orifices PA.
// Encombrement ≈ 0.032 (X) × 0.198 (Y) × 0.042 (Z) m.
import { IN, hhcs, splitWasher } from './_avance_a.js';

const W = 1.25 * IN, D = 1.0 * IN, H = 7.8 * IN;
const PITCH = H / 12; // douze positions : graisseur, vis, 8 graisseurs, vis, graisseur
const yAt = (i) => H / 2 - PITCH * (i + 0.5);

export default function P048(api) {
  const { S } = api;
  const { box, lathe, nut, cyl, merged, group, at, place: _p } = S;
  void _p;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — bloc : barre usinée, arêtes cassées ; orifices PA1-PA10 sur le flanc
  // +X (lamage et taraudage sombre), passages des vis.
  const ports = [];
  const graisseurs = [];
  for (let i = 0; i < 12; i++) if (i !== 1 && i !== 10) graisseurs.push(i);
  graisseurs.forEach((i) => {
    ports.push(at(cyl(0.0058, 0.001, 'zinc', { axis: 'x', seg: 16 }), [W / 2 + 0.0004, yAt(i), D / 2]));
    ports.push(at(cyl(0.0042, 0.0012, 'blackOxide', { axis: 'x', seg: 14 }), [W / 2 + 0.0006, yAt(i), D / 2]));
  });
  P('1', group(
    merged([box(W, H, D, 'zinc', { pos: [0, 0, D / 2] }), ...ports.filter((_, k) => k % 2 === 0)], 'zinc'),
    merged(ports.filter((_, k) => k % 2 === 1), 'blackOxide'),
  ), [0, 0, 0]);

  // 2 — graisseurs droits 1/8-27 NPT : six pans 7/16, col, tête sphérique.
  const zerk = () => group(
    lathe([[0, -0.007], [0.0048, -0.007], ...S.thread(0.0052, -0.0068, -0.0005, { r1: 0.0054, pitch: 0.0009, maxTurns: 6 }), [0.0054, 0], [0, 0]], 'zinc', { seg: 14 }),
    nut(0.4375 * IN, 0.006, 'zinc', { pos: [0, 0.003, 0] }),
    lathe([[0, 0.006], [0.0035, 0.006], [0.0035, 0.009], [0.0028, 0.0105], [0.0036, 0.0118], [0.0036, 0.0132], [0.0022, 0.0148], [0, 0.0148]], 'brass', { seg: 14 }),
  );
  graisseurs.forEach((i, k) => {
    const g = zerk();
    g.rotation.x = Math.PI / 2;
    g.position.set(0, yAt(i), D);
    P('2', g, [0, 0, 0.04 + (k % 2) * 0.015]);
  });

  // 3 / 4 — vis au travers du bloc, rondelle fendue sous la tête.
  for (const i of [1, 10]) {
    const y = yAt(i);
    P('4', splitWasher(0.375 * IN, [0, y, D + 0.0012], [0, 0, 1]), [0, 0, 0.05]);
    P('3', hhcs(0.375 * IN, 1.75 * IN, [0, y, D + 0.0024], [0, 0, 1]), [0, 0, 0.08]);
  }
  return { view: { dir: [0.8, 0.35, 1.1] } };
}
