// P112 — Support de centreur à chapes CX034989 rév. 0 (page 112) : « ASSY,
// CENTRALIZER / SLIP PLATE BRACKET ». Même support que P110 (fond du vérin
// de mâchoire, caisson 4 × 4 po, axe Ø 1 1/4 × 6 7/8 po (1), bagues
// 1 1/4 × 1 1/2 × 7/8 po (3), vis d'arrêt 1/4-20 × 1 3/4 (5), rondelles (7),
// écrou Nyloc (9)), boulonné au bout gauche du châssis (repère 11 de P098),
// axe monté par -X. La mécano-soudure (2, « CENT. BRACKET, SIDE SLIP PLT »)
// porte en plus deux bras plats au-dessus du caisson, terminés par des
// oreilles garnies de bagues 3/4 × 7/8 × 1/2 po (4) : chapes de fond des deux
// vérins de la plaque à coins (CX077208, P098 repère 12, axes repère 5), et
// une patte au-dessus de la semelle pour la quatrième vis H 3/4-10 × 1 3/4
// (6) et sa rondelle Nord-Lock (8).
// Repère : celui de P110 — origine au point d'articulation (axe 1 au milieu
// du caisson), X selon l'axe 1 (collet vers -X), Z selon le caisson, de la
// semelle (face d'appui à z = -4 po) vers l'ouverture (z = +1.75 po), Y vers
// les bras. Oreilles des vérins de coins : axes selon X à y = 2.9, z = 3.0 po,
// x = -2.0 et +4.8 po. Encombrement ≈ 0.343 (X) × 0.254 (Y,
// de -0.095 à +0.159) × 0.214 (Z, de -0.116 au bout des vis à +0.098) m.
// Cotes : liste (axe, bagues, vis) ; bras, oreilles et patte d'après les
// proportions de l'isométrie de la page 112 ; bagues 4 comme celles des
// chapes de la plaque à coins P044 (axes CM77208-003 Ø 3/4 po, mêmes que
// P098 repère 5).
import { u, along, bushing } from './_avance_b.js';
import { centralizerBracket, GEOM110, HOLES110 } from './P110.js';

const { A, Z, PL } = GEOM110;
const ARMS = [-2.0, 4.8]; // x des bras (milieu), po
const ARM = { t: 0.5, lug: [3.0, 2.9], r: 0.85, hole: 0.4375, top: 4.25 }; // oreille [z, y]
const TAB = { x: 4.8, w: 2.0, y: PL.h / 2 + 1.5 }; // patte : trou de vis à (x, y)

export const BRACKET112 = {
  lugAxes: ARMS.map((x) => [u(x), u(ARM.lug[1]), u(ARM.lug[0])]), // axes selon X
  lugT: u(ARM.t),
  boltHoles: [...HOLES110, [TAB.x, TAB.y]].map(([x, y]) => [u(x), u(y)]),
  plateBackZ: u(Z.back),
};

export default function P112(api) {
  const { THREE, S } = api;
  const { extrude, weld } = S;
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

  // Semelle : contour de P110 avec la patte en haut (arrondie, trou de vis).
  const w = PL.w / 2, h = PL.h / 2, c = PL.c;
  const plate = [
    [-w + c, -h], [w - c, -h], [w, -h + c], [w, h - c], [w - c, h],
    [TAB.x + TAB.w / 2, h], ...arc(TAB.x, TAB.y, TAB.w / 2, 0, Math.PI, 12), [TAB.x - TAB.w / 2, h],
    [-w + c, h], [-w, h - c], [-w, -h + c],
  ];

  // Bras : profil [z, y] extrudé selon X — semelle à l'arrière, dessus du
  // caisson dessous, oreille arrondie au bout, dessus en pente.
  const [lz, ly] = ARM.lug;
  const prof = [
    [Z.plate, A], [Z.end, A], [lz, ly - ARM.r], ...arc(lz, ly, ARM.r, -Math.PI / 2, Math.PI * 0.62, 12), [Z.plate, ARM.top],
  ];
  const arms = ARMS.map((x) => {
    const m = extrude(prof.map(([z, y]) => [-u(z), u(y)]).reverse(), u(ARM.t), 'grey', { holes: [[-u(lz), u(ly), u(ARM.hole)]] });
    m.rotation.y = Math.PI / 2;
    m.position.x = u(x);
    return m;
  });
  const beads = ARMS.flatMap((x) => [-1, 1].map((s) => weld([v(x + s * (ARM.t / 2 + 0.07), A + 0.07, Z.plate + 0.3), v(x + s * (ARM.t / 2 + 0.07), A + 0.07, Z.end - 0.2)], u(0.18), 'grey')));

  centralizerBracket(api, { pin: '1', body: '2', bush: '3', pinBolt: '5', bolt: '6', washer: '7', nordLock: '8', nut: '9' }, {
    holes: [...HOLES110, [TAB.x, TAB.y]], plate, extra: arms, extraBeads: beads, hand: -1,
  });

  // 4 — bagues des oreilles, sortent chacune selon l'axe vers l'extérieur.
  for (const [i, x] of ARMS.entries()) {
    const s = i === 0 ? -1 : 1;
    api.part('4', along(THREE, bushing(S, THREE, 0.4375, 0.375, ARM.t), [1, 0, 0], v(x, ly, lz)), [s * 0.07, 0, 0]);
  }
  return { view: { dir: [-1, 0.75, 1.3] } };
}
