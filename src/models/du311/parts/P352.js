// P352 — Filtre haute pression CX001670 rév. 0 (page 352) : « HIGH PRESSURE
// FILTER » (Argo), repère 2 de P350 (deux exemplaires). Tête en fonte
// d'aluminium (sans repère dans la liste, dessinée pour situer les pièces) :
// orifices SAE -20 (1 5/8-12) sur les deux flancs ±X, deux bossages de
// fixation taraudés sur la face arrière, plot de l'indicateur de colmatage
// sur le dessus. Cuve vissée par dessous (1, cuve avec son filet), bague
// d'appui (2) et joint torique (3) au haut de la cuve, élément filtrant (4),
// indicateur visuel de colmatage (5) et son joint (6).
// Repère : origine sur la face d'appui des deux bossages de fixation (plan
// de la platine de P350), à mi-chemin entre eux ; Y vers le haut (cuve vers
// −Y), +Z vers l'avant (la tête est en avant de la platine, bossages vers −Z),
// X selon l'axe des orifices. Encombrement 0.11 (X) × 0.39 (Y, de −0.31 à
// +0.08) × 0.11 (Z, de 0 à 0.11) m. Cotes estimées : tête 110 × 75 × 90 mm,
// cuve Ø 76 mm, longueur sous la tête 0.27 m (proportions des pages 350 et 352).
import { racBlock } from './_porteur.js';

const MM = 0.001;
const HW = 110 * MM, HH = 75 * MM, HD = 90 * MM; // tête
const BOSS = 18 * MM; // saillie des bossages de fixation
const ZC = BOSS + HD / 2; // axe de la cuve
const YH0 = -30 * MM; // dessous de la tête (les bossages sont à 30 mm au-dessus)
const RB = 38 * MM; // rayon extérieur de la cuve
const LB = 270 * MM; // longueur de la cuve sous la tête

export default function P352(api) {
  const { S, THREE } = api;
  const { lathe, at, group, merged, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- tête (sans repère)
  const r20 = (1.625 * 0.0254) / 2;
  const block = racBlock(S, THREE, HW, HH, HD, [
    { p: [-HW / 2, 0, 0], n: '-x', r: r20, spot: r20 + 6 * MM },
    { p: [HW / 2, 0, 0], n: '+x', r: r20, spot: r20 + 6 * MM },
  ], { material: 'castAlu', seg: 10 });
  block.position.set(0, YH0 + HH / 2, ZC);
  const cast = merged([
    // Collerette de la cuve, plot de l'indicateur, bossages de fixation.
    lathe([[0, YH0 - 22 * MM], [RB + 4 * MM, YH0 - 22 * MM], [RB + 6 * MM, YH0 - 18 * MM], [RB + 6 * MM, YH0 + 0.001], [0, YH0 + 0.001]], 'castAlu', { seg: 10, pos: [0, 0, ZC] }),
    lathe([[0, 0], [12 * MM, 0], [12 * MM, 7 * MM], [0, 7 * MM]], 'castAlu', { seg: 8, pos: [0, YH0 + HH - 0.001, ZC - 10 * MM] }),
    ...[-1, 1].map((s) => lathe([[0, 0], [11 * MM, 0], [11 * MM, BOSS + 0.002], [0, BOSS + 0.002]], 'castAlu', { axis: 'z', seg: 12, pos: [s * 30 * MM, 0, 0] })),
  ], 'castAlu');
  const taps = merged([-1, 1].map((s) => lathe([[4.2 * MM, -0.0003], [0, -0.0003]], 'blackOxide', { axis: 'z', seg: 10, pos: [s * 30 * MM, 0, 0] })), 'blackOxide');
  taps.rotation.y = Math.PI; // disques tournés vers −Z (face d'appui)
  const head = group(block, cast, taps);

  // ---------------------------------------------------------------- 1 — cuve
  // Fût lisse, épaulement, filet (bandes) jusqu'à la collerette, fond bombé
  // avec six-pans de démontage.
  const y0 = YH0 - 22 * MM, yb = YH0 - LB;
  const bowl = group(
    lathe([
      [0, yb], [14 * MM, yb], [RB * 0.8, yb + 6 * MM], [RB, yb + 18 * MM], [RB, y0 - 30 * MM],
      [RB - 3 * MM, y0 - 26 * MM], [RB - 3 * MM, y0 - 18 * MM], [RB - 4.5 * MM, y0 - 14 * MM],
      [RB - 3 * MM, y0 - 10 * MM], [RB - 4.5 * MM, y0 - 6 * MM], [RB - 3 * MM, y0 - 2 * MM],
      [RB - 4 * MM, y0], [RB - 7 * MM, y0], [RB - 7 * MM, y0 - 30 * MM], [0, y0 - 30 * MM],
    ], 'black', { seg: 12 }),
    lathe([[0, yb - 8 * MM], [14 * MM, yb - 8 * MM], [14 * MM, yb + 0.001], [0, yb + 0.001]], 'black', { seg: 6 }),
  );
  bowl.position.z = ZC;
  P('1', bowl, [0, -0.24, 0]).parent.add(head);

  // 2 — bague d'appui (PTFE) et 3 — joint torique, logés au haut du filet de la cuve.
  P('2', lathe([[RB - 7 * MM, 0], [RB - 4.5 * MM, 0], [RB - 4.5 * MM, 1.4 * MM], [RB - 7 * MM, 1.4 * MM]], 'white', { seg: 16, pos: [0, y0 - 6 * MM, ZC] }), [0, -0.08, 0]);
  P('3', lathe([[RB - 7.4 * MM, -1.3 * MM], [RB - 4.6 * MM, -1.3 * MM], [RB - 4.6 * MM, 1.3 * MM], [RB - 7.4 * MM, 1.3 * MM]], 'rubber', { seg: 16, pos: [0, y0 - 3 * MM, ZC] }), [0, -0.055, 0]);

  // 4 — élément filtrant : flasques d'acier, média plissé (cannelures en
  // relief), tube central perforé suggéré par l'alésage sombre.
  const ye0 = yb + 20 * MM, ye1 = YH0 - 6 * MM, re = 27 * MM;
  // Média plissé : étoile de 12 plis extrudée le long de Y (sans biseau).
  const star = new THREE.Shape();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, rr = i % 2 ? re - 4 * MM : re - 1 * MM;
    if (i) star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const media = new THREE.ExtrudeGeometry(star, { depth: ye1 - ye0 - 12 * MM, bevelEnabled: false, curveSegments: 1 });
  media.rotateX(-Math.PI / 2);
  media.translate(0, ye0 + 6 * MM, 0);
  const element = group(
    merged([new THREE.Mesh(media)], 'cream'),
    merged([
      lathe([[0, ye0], [re, ye0], [re, ye0 + 6 * MM], [0, ye0 + 6 * MM]], 'zinc', { seg: 10 }),
      lathe([[12 * MM, ye1 - 6 * MM], [re, ye1 - 6 * MM], [re, ye1], [12 * MM, ye1], [12 * MM, ye1 - 6 * MM]], 'zinc', { seg: 10 }),
    ], 'zinc'),
    lathe([[12 * MM, ye1 - 0.0003], [0, ye1 - 0.0003]], 'blackOxide', { seg: 10 }),
  );
  element.position.z = ZC;
  P('4', element, [0, -0.1, 0.12]);

  // 5 — indicateur visuel : queue filetée, six-pans 22 mm, capot et bouton rouge.
  const yi = YH0 + HH + 7 * MM;
  const ind = group(
    merged([
      lathe([[0, -9 * MM], [6.5 * MM, -9 * MM], [6.5 * MM, 0.001], [0, 0.001]], 'zinc', { seg: 8 }),
      lathe([[0, 0], [12.7 * MM, 0], [12.7 * MM, 9 * MM], [11 * MM, 10 * MM], [0, 10 * MM]], 'zinc', { seg: 6 }),
      lathe([[0, 10 * MM], [8 * MM, 10 * MM], [8 * MM, 22 * MM], [6 * MM, 24 * MM], [0, 24 * MM]], 'zinc', { seg: 10 }),
    ], 'zinc'),
    lathe([[0, 24 * MM], [5 * MM, 24 * MM], [5 * MM, 29 * MM], [3.5 * MM, 31 * MM], [0, 31 * MM]], 'red', { seg: 10 }),
  );
  ind.position.set(0, yi, ZC - 10 * MM);
  P('5', ind, [0, 0.07, 0]);
  P('6', lathe([[6.4 * MM, -0.9 * MM], [8.2 * MM, -0.9 * MM], [8.2 * MM, 0.9 * MM], [6.4 * MM, 0.9 * MM]], 'rubber', { seg: 10, pos: [0, yi + 1 * MM, ZC - 10 * MM] }), [0, 0.035, 0]);

  return { view: { dir: [0.9, 0.5, 1.2] } };
}
