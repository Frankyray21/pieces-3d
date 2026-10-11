// P110 — Support de centreur CX034988 rév. 0 (page 110) : « ASSY,
// CENTRALIZER BRACKET ». Support du fond d'un vérin de mâchoire (CM47360,
// P098 repère 4), boulonné au bout droit du châssis du centreur (repère 10
// de P098, au bout des glissières des mâchoires) : le corps du vérin passe
// par la fenêtre de la semelle et son œil de fond est pris dans le caisson.
// Mécano-soudure (2) : semelle de 1 po à coins abattus, caisson en tube
// carré 4 × 4 × 3/8 po en saillie, deux bossages latéraux garnis de bagues
// 1 1/4 × 1 1/2 × 7/8 po (3), deux goussets ; axe Ø 1 1/4 × 6 7/8 po à
// collet (1), arrêté au bout opposé par une vis H 1/4-20 × 1 3/4 (4) en
// travers, deux rondelles plates (6) et un écrou à freinage nylon (8) ; trois
// vis H 3/4-10 × 1 3/4 (5) et leurs rondelles Nord-Lock (7, « WASHER »
// SH10030 = série des rondelles autobloquantes de P098) fixent la semelle
// dans les taraudages du châssis.
// Repère : origine au point d'articulation (axe de l'axe 1 au milieu du
// caisson), X selon l'axe 1 (collet vers +X), Z selon le caisson, de la
// semelle (face d'appui arrière à z = -4 po) vers l'ouverture du caisson
// (z = +1.75 po) ; Y complète le trièdre (haut du dessin). Encombrement ≈
// 0.343 (X) × 0.191 (Y) × 0.162 (Z) m.
// Cotes : liste (axe, bagues, vis) ; caisson, semelle et goussets d'après
// les proportions de l'isométrie (diamètre de l'axe pour l'échelle) :
// semelle 13 1/2 × 7 1/2 po. La fonction centralizerBracket() sert aussi
// au support à chapes du côté de la plaque à coins (P112).
import { L, u, along, hhcs, nylocNut, flatWasher, nordLock, bushing, pin } from './_avance_b.js';

const A = 2.0, WALL = 0.375; // caisson (demi-côté, paroi), po
const Z = { back: -4.0, plate: -3.0, end: 1.75 };
const PL = { w: 13.5, h: 7.5, c: 1.25 }; // semelle
const BOSS = { x0: A - WALL, x1: 2.5, r: 1.125, rb: 0.75 };
const PIN = { d: 1.25, len: 6.875, head: { r: 0.875, h: 0.25 }, hole: -3.55 };
export const GEOM110 = { A, WALL, Z, PL }; // cotes du corps (po), pour P112
export const HOLES110 = [[5.3, 2.3], [-5.3, -2.3], [-0.6, -2.95]]; // vis 3/4 (x, y)

export const BRACKET110 = {
  pinAxis: [0, 0, 0], // axe selon X
  pinD: u(PIN.d),
  plateBackZ: u(Z.back), // face d'appui (contre le châssis)
  boxEndZ: u(Z.end),
  boltHoles: HOLES110.map(([x, y]) => [u(x), u(y)]),
  window: u(2 * (A - WALL)), // fenêtre carrée de la semelle (vérin)
};

/**
 * Corps et garnitures communs aux supports P110 et P112. refs : repères
 * { pin, body, bush, pinBolt, bolt, washer, nordLock, nut } ; holes : trous
 * des vis 3/4 dans la semelle ; plate : contour [x, y] de la semelle (po,
 * sens trigonométrique) ; extra : pièces soudées en plus (fusionnées au
 * corps) et extraBeads (cordons) ; hand = -1 : axe monté par -X (support
 * de gauche, P112), collet vers -X et vis d'arrêt côté +X.
 */
export function centralizerBracket(api, refs, { holes = HOLES110, plate, extra = [], extraBeads = [], hand = 1 } = {}) {
  const { THREE, S } = api;
  const { box, merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];

  // Semelle : contour à coins abattus, fenêtre carrée (passage du vérin),
  // trous des vis ; extrudée selon Z de Z.back à Z.plate.
  const c = PL.c, w = PL.w / 2, h = PL.h / 2;
  const outline = plate ?? [[-w + c, -h], [w - c, -h], [w, -h + c], [w, h - c], [w - c, h], [-w + c, h], [-w, h - c], [-w, -h + c]];
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(u(x), u(y))));
  const wi = A - WALL;
  shape.holes.push(new THREE.Path([[-wi, -wi], [-wi, wi], [wi, wi], [wi, -wi]].map(([x, y]) => new THREE.Vector2(u(x), u(y)))));
  for (const [x, y] of holes) {
    const p = new THREE.Path();
    p.absarc(u(x), u(y), u(0.406), 0, Math.PI * 2, true);
    shape.holes.push(p);
  }
  const b = 0.0012, t = u(Z.plate - Z.back);
  const pg = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 16 });
  pg.translate(0, 0, u(Z.back) + b);
  const plateMesh = new THREE.Mesh(pg);

  // Caisson : parois haute et basse pleine largeur, flancs percés pour les bossages.
  const len = Z.end - Z.plate, zc = (Z.end + Z.plate) / 2;
  const walls = [-1, 1].map((s) => box(u(2 * A), u(WALL), u(len), 'grey', { r: u(0.06), pos: v(0, s * (A - WALL / 2), zc) }));
  for (const s of [-1, 1]) {
    const side = S.extrude([[Z.plate, -wi], [Z.end, -wi], [Z.end, wi], [Z.plate, wi]].map(([z, y]) => [-u(z), u(y)]).reverse(), u(WALL), 'grey', { holes: [[0, 0, u(BOSS.rb)]] });
    side.rotation.y = Math.PI / 2;
    side.position.x = u(s * (A - WALL / 2));
    walls.push(side);
  }
  // Bossages (tournés selon X) : de la face intérieure du flanc à x = ±2.5.
  const bosses = [-1, 1].map((s) => L(S, [[BOSS.rb, BOSS.x0], [BOSS.r, BOSS.x0], [BOSS.r, BOSS.x1 - 0.06], [BOSS.r - 0.06, BOSS.x1], [BOSS.rb, BOSS.x1], [BOSS.rb, BOSS.x0]], 'grey', 32, { axis: s > 0 ? 'x' : '-x' }));
  // Goussets horizontaux de part et d'autre du caisson.
  const gussets = [-1, 1].map((s) => {
    const m = S.extrude([[A, Z.plate], [A + 3.4, Z.plate], [A + 0.15, -1.45], [A, -1.45]].map(([x, z]) => [u(s * x), -u(z)]), u(0.5), 'grey');
    m.rotation.x = -Math.PI / 2;
    return m;
  });
  const body = merged([plateMesh, ...walls, ...bosses, ...gussets, ...extra], 'grey');
  body.userData.hasInterior = true;
  const beads = [];
  for (const s of [-1, 1]) {
    // Caisson / semelle (quatre côtés), bossages / flancs.
    beads.push(weld([v(-A - 0.08, s * (A + 0.08), Z.plate + 0.08), v(A + 0.08, s * (A + 0.08), Z.plate + 0.08)], u(0.22), 'grey'));
    beads.push(weld([v(s * (A + 0.08), -A, Z.plate + 0.08), v(s * (A + 0.08), A, Z.plate + 0.08)], u(0.22), 'grey'));
    beads.push(at(S.weldRing(u(BOSS.r + 0.04), u(0.18), 'grey', { axis: 'x' }), v(s * (A + 0.05), 0, 0)));
  }
  const bm = merged([...beads, ...extraBeads], 'grey');
  bm.geometry.userData.edgeAngle = 75;
  P(refs.body, group(body, bm), [0, 0, 0]);

  // 1 — axe à collet (collet vers +X sur le bossage), sort selon +X.
  const shank = PIN.len - PIN.head.h;
  const xc = hand * (BOSS.x1 + 0.02 - shank / 2);
  P(refs.pin, along(THREE, pin(S, THREE, PIN.d, shank, { head: PIN.head }), [hand, 0, 0], v(xc, 0, 0)), [hand * 0.2, 0, 0]);
  // 3 — bagues dans les bossages, sortent chacune de son côté.
  for (const s of [-1, 1]) {
    P(refs.bush, along(THREE, bushing(S, THREE, 0.75, 0.625, 0.875), [1, 0, 0], v(s * (BOSS.x0 + BOSS.x1) / 2, 0, 0)), [s * 0.09, 0, 0]);
  }
  // Vis d'arrêt 1/4-20 en travers du bout de l'axe (selon Y), rondelles, écrou
  // Nyloc ; à l'éclaté elles s'écartent de part et d'autre du trou de l'axe.
  const r = PIN.d / 2, wt = 0.065, xh = hand * PIN.hole;
  P(refs.washer, at(flatWasher(S, THREE, 0.25), v(xh, r, 0)), [0, 0.04, 0]);
  P(refs.pinBolt, at(hhcs(S, THREE, 0.25, 1.75), v(xh, r + wt, 0)), [0, 0.09, 0]);
  P(refs.washer, along(THREE, flatWasher(S, THREE, 0.25), [0, -1, 0], v(xh, -r, 0)), [0, -0.04, 0]);
  P(refs.nut, along(THREE, nylocNut(S, THREE, 0.25), [0, -1, 0], v(xh, -r - wt, 0)), [0, -0.07, 0]);
  // Vis 3/4-10 × 1 3/4 et rondelles Nord-Lock sur la face avant de la semelle.
  const nl = 2 * Math.max(0.05, 0.75 * 0.11); // paire Nord-Lock
  for (const [x, y] of holes) {
    P(refs.nordLock, along(THREE, nordLock(S, THREE, 0.75), [0, 0, 1], v(x, y, Z.plate)), [0, 0, 0.06]);
    P(refs.bolt, along(THREE, hhcs(S, THREE, 0.75, 1.75), [0, 0, 1], v(x, y, Z.plate + nl)), [0, 0, 0.13]);
  }
}

export default function P110(api) {
  centralizerBracket(api, { pin: '1', body: '2', bush: '3', pinBolt: '4', bolt: '5', washer: '6', nordLock: '7', nut: '8' });
  return { view: { dir: [1, 0.7, 1.3] } };
}
