// P262 — Distributeur de translation CP006625 rév. 1 (page 262) : « TRAM
// VALVE - 5 SECTION - AMP », repère 23 de P246. Distributeur proportionnel
// PVG 32 à cinq sections (85 lb) : plaque d'extrémité à orifice LX et pattes
// de fixation (2) en bas, sections (de bas en haut) 6, 6, 4 (section de
// translation, bouchon de clapet supplémentaire), 7, 5, couvercle d'entrée
// P / T avec orifice de manomètre (9) en haut. Côté −X : embases de commande
// manuelle sans levier (1, quatre) et commande à poignée courte (8) sur la
// section du bas ; côté +X : électrovannes PVE à connecteur AMP (10 sur les
// trois sections du haut, 11 sur les deux du bas). Tirants et écrous : fournis
// avec la trousse de joints (3, note 1 du dessin), dessinés sous ce repère.
// Repère (commun aux PVG 32, voir ../../du311/parts/_chassis.js) : origine au
// centre de la face inférieure de la plaque d'extrémité, Y vers le haut le
// long de l'empilage, X selon les tiroirs (commandes manuelles vers −X,
// électrovannes vers +X), +Z = face des orifices A / B et P / T.
// Encombrement ≈ 0.40 (X) × 0.33 (Y) × 0.11 (Z) m.
import { pvgValve, PVG, capScrew } from '../../du311/parts/_chassis.js';

export default function P262(api) {
  const { S } = api;
  const { H, ys } = pvgValve(api, {
    end: ['2', 'lx'],
    sections: [
      { ref: '6', handle: '8', pve: '11' },
      { ref: '6', pve: '11' },
      { ref: '4', pve: '10', tram: true },
      { ref: '7', pve: '10' },
      { ref: '5', pve: '10' },
    ],
    inlet: '9',
    kit: '3',
  });
  void H;

  // 1 — embase de commande manuelle (sans levier) : semelle alu contre la
  // face −X, boîtier du ressort de centrage, deux poussoirs d'essai
  // (boutons noirs) et quatre vis CHC.
  const { w, sec } = PVG;
  const base = () => {
    const alu = [
      S.box(0.008, sec * 0.92, 0.07, 'castAlu', { r: 0.002, pos: [-0.004, 0, 0] }),
      S.box(0.03, sec * 0.72, 0.054, 'castAlu', { r: 0.005, pos: [-0.023, 0, 0] }),
      S.cyl(0.013, 0.012, 'castAlu', { axis: 'x', seg: 20, pos: [-0.044, 0, 0] }),
    ];
    const screws = [];
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) screws.push(S.at(capScrew(api, 0.005, 0.01), [-0.008, sy * sec * 0.36, sz * 0.03], [0, 0, Math.PI / 2]));
    const knobs = [-1, 1].map((s) => S.cyl(0.0045, 0.006, 'plastic', { axis: 'x', seg: 12, pos: [-0.053, 0, s * 0.008] }));
    return S.group(S.merged(alu, 'castAlu'), S.merged(screws, 'steel'), S.merged(knobs, 'plastic'));
  };
  ys.slice(1).forEach((y, i) => api.part('1', S.at(base(), [-w / 2, y, 0]), [-0.09, (i + 2) * 0.035, 0]));
  return { view: { dir: [-0.7, 0.6, 1.1] } };
}
