// P080 — Actionneur rotatif 180° CP000151 rév. 0 (page 80) : « ROTARY
// ACTUATOR, 180 DEGREES », vérin rotatif à pignons hélicoïdaux (piston
// annulaire coulissant entre deux cannelures hélicoïdales), dessiné en éclaté
// le long de son axe :
// - carter (1) : tube Ø 5 po à denture hélicoïdale intérieure, deux pieds
//   transversaux percés de deux trous chacun (fixation par 4 vis 3/4 po dans
//   P070), deux orifices bouchés (7, 8) sur le flanc, bossage plat du clapet ;
// - arbre (2) : bride de sortie Ø 4.4 po à 8 taraudages et alésage central,
//   portée de palier, cannelure hélicoïdale, bout cannelé droit ;
// - chemise de piston (3) : denture hélicoïdale extérieure (carter) et
//   intérieure (arbre), joints en T intérieur (11*) et extérieur (12*) ;
// - couvercle (4) à l'autre bout, moyeu lisse dans l'alésage, vissé sur le
//   bout d'arbre (joints statiques 13* et 15* sur l'arbre) et goupillé (9) ; vis sans tête (10) : 2 dans la bride,
//   4 dans le couvercle ;
// - clapet d'équilibrage (19) posé sur le carter, 3 vis (5, une ligne « SCREW »
//   qty 1 : le jeu de 3 vis dessinées est un seul objet) et rondelle (6 : les
//   deux joints toriques d'interface, un objet) ;
// - de chaque côté du piston : joint à lèvres (14*), bague de guidage (17*),
//   rondelle de butée (18*) et joint racleur (16*) (trousses 20 et 21, sans
//   objet propre ; leurs pièces dessinées sont modélisées).
// Repère : origine sur l'axe, au plan de la face d'appui de la bride de
// sortie ; +Y sort de la bride (le corps est en -Y) ; pieds vers -Z, leur face
// d'appui à z = -3.25 po (ACT080.footZ), trous selon Z à x = ±3.35 po et
// y = -1.55 / -7.75 po ; clapet sur le dessus (+Z) ; orifices bouchés sur le
// flanc -X près des deux bouts. Encombrement ≈ 0.197 (X, pieds) × 0.235 (Y, de -0.235
// au couvercle à 0) × 0.182 (Z, de -0.083 à +0.099 au clapet) m.
// Cotes : non cotées au manuel ; carter Ø 5 × 9 po, pieds 7.75 po et entraxes
// de fixation 6.7 × 6.2 po relevés sur la vue de face de P072 (échelle :
// moyeu de P074 et vis 3/4 po) ; détails d'après les proportions de l'éclaté.
import { L, u, along, pin } from './_avance_b.js';
import { oring } from './P078.js';

const R = 2.5; // rayon du carter
const Y = { flange: 0, flangeBot: -0.6, housTop: -0.62, housBot: -8.55, capBot: -8.95 };
const FOOT = { z: -3.25, w: 1.5, x: 3.875, hx: 3.35, ys: [-1.55, -7.75], hole: 0.41 };
const VALVE = { y: -4.6, w: 3.0, d: 2.5, z0: 2.5, h: 1.5 };

export const ACT080 = {
  footZ: u(FOOT.z), // face d'appui des pieds
  footHoles: FOOT.ys.flatMap((y) => [-1, 1].map((s) => [s * u(FOOT.hx), u(y)])), // [x, y] des 4 trous (axe Z)
  flangeR: u(2.2),
  boltCircleR: u(1.55), // 8 taraudages 3/8-16 de la bride
  length: u(-Y.capBot),
  R: u(R),
};

export default function P080(api) {
  const { THREE, S } = api;
  const { extrude, slotted, merged, group } = S;
  // Vis sans tête légère (d × len po, six-pans creux en +Y, y = 0 au ras) et
  // vis CHC légère (tête Ø 1.5 d, dessous à y = 0) : petites vis à 10 facettes.
  const grub = (d, len) => L(S, [[0, -len], [d * 0.4, -len], [d / 2, -len + d * 0.1], [d / 2, 0], [d * 0.25, 0], [d * 0.25, -d * 0.3], [0, -d * 0.3]], 'blackOxide', 10);
  const capScrew = (d, len) => merged([
    L(S, [[0, -len], [d * 0.42, -len], [d / 2, -len + d * 0.1], [d / 2, 0], [d * 0.75, 0], [d * 0.75, d * 0.92], [d * 0.7, d], [d * 0.3, d], [d * 0.3, d * 0.5], [0, d * 0.5]], 'blackOxide', 12),
  ], 'blackOxide');
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ring = (ro, ri, ya, yb, mat, seg = 40) => {
    const y0 = Math.min(ya, yb), y1 = Math.max(ya, yb);
    return L(S, [[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, seg);
  };
  const OUT = 0.16; // pièces côté bride : +Y ; côté couvercle : -Y

  // ================================================ 1 — carter
  // Tube Ø 5 creux (denture intérieure suggérée par des bandes), lèvres
  // d'extrémité, deux pieds transversaux soudés-usinés, bossage du clapet,
  // bossages des orifices.
  const hous = slotted(u(R), u(2.1), u(Y.housBot), u(Y.housTop), [], 'black', { seg: 40 });
  const lips = [
    L(S, [[2.1, Y.housTop - 0.05], [R - 0.06, Y.housTop - 0.05], [R, Y.housTop - 0.11], [R, Y.housTop - 0.2], [2.1, Y.housTop - 0.2]].reverse(), 'black', 48),
  ];
  // Pied : semelle 7.75 × 1.5 × 1.05 po percée de deux trous selon Z (vis
  // 3/4 po), sous le tube (sans entrer dans l'alésage), deux joues
  // extérieures qui remontent le long du tube.
  const foot = (y) => {
    const sole = extrude([[-FOOT.x, -FOOT.w / 2], [FOOT.x, -FOOT.w / 2], [FOOT.x, FOOT.w / 2], [-FOOT.x, FOOT.w / 2]].map(([x, yy]) => [u(x), u(yy)]),
      u(1.05), 'black', { holes: [-1, 1].map((s) => [u(s * FOOT.hx), 0, u(FOOT.hole)]) });
    sole.position.set(0, u(y), u(FOOT.z + 0.525));
    const cheeks = [-1, 1].map((sx) => S.box(u(0.7), u(FOOT.w), u(1.0), 'black', { pos: [u(sx * 2.45), u(y), u(-1.7)] }));
    return [sole, ...cheeks];
  };
  // bossage plat du clapet : méplat à z = VALVE.z0 (tangent au tube)
  const pad = S.box(u(VALVE.d + 0.3), u(VALVE.w + 0.3), u(0.55), 'black', { pos: [0, u(VALVE.y), u(VALVE.z0 - 0.275)] });
  const PORTS = [-1.45, -7.75];
  // Bossages des orifices sur le flanc -X, au-dessus des pieds (z = -1).
  const bosses = PORTS.map((y) => L(S, [[0.25, 2.2], [0.45, 2.2], [0.45, 2.62], [0.41, 2.66], [0.25, 2.66], [0.25, 2.2]], 'black', 20, { axis: '-x', pos: [0, u(y), u(-1)] }));
  P('1', merged([hous, ...lips, ...foot(FOOT.ys[0]), ...foot(FOOT.ys[1]), pad, ...bosses], 'black'), [0, 0, -0.06]);

  // 7, 8 — bouchons d'orifice (six-pans creux, collerette)
  const portPlug = () => group(merged([
    L(S, [[0.1, 0.12], [0.1, 0.25], [0.29, 0.25], [0.31, 0.23], [0.31, 0.02], [0.29, 0], [0, 0], [0, 0.12]].reverse(), 'zinc', 20),
    L(S, [[0, -0.3], ...S.thread(0.22, -0.3, -0.03, { pitch: 0.05, maxTurns: 5 }), [0.2, 0], [0, 0]], 'zinc', 12),
  ], 'zinc'));
  P('7', along(THREE, portPlug(), [-1, 0, 0], [-u(2.66), u(PORTS[0]), u(-1)]), [-0.08, 0, 0]);
  P('8', along(THREE, portPlug(), [-1, 0, 0], [-u(2.66), u(PORTS[1]), u(-1)]), [-0.08, 0, 0]);

  // ================================================ 2 — arbre
  // Bride de sortie (8 taraudages Ø 3/8 sur Ø 3.1, alésage central Ø 0.8),
  // portée Ø 3.5, cannelure hélicoïdale Ø 2.6 (bandes inclinées suggérées),
  // bout cannelé droit Ø 2.0 engagé dans le couvercle.
  const flangeHoles = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return [u(1.55 * Math.cos(a)), u(1.55 * Math.sin(a)), u(0.19)];
  });
  const flange = extrude(circle(2.2, 36), u(0.6), 'steel', { holes: [[0, 0, u(0.4)], ...flangeHoles] });
  flange.rotation.x = Math.PI / 2;
  flange.position.y = u(-0.3);
  const shaftBody = L(S, [
    [0, -8.5], [0.9, -8.5], [1.0, -8.4], [1.0, -6.2], [1.3, -6.1], [1.3, -1.9], [1.75, -1.8], [1.75, -0.65], [1.9, -0.6], [0, -0.6],
  ], 'steel', 24);
  const splines = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    // Barrette inclinée dans le plan tangent (hélice), autour de l'axe radial.
    const b = S.box(u(0.16), u(4.0), u(0.14), 'steel');
    b.position.set(u(1.3 * Math.cos(a)), u(-4.0), u(1.3 * Math.sin(a)));
    b.rotation.set(0.2, -a, 0, 'YXZ');
    splines.push(b);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const b = S.box(u(0.12), u(2.0), u(0.12), 'steel');
    b.position.set(u(1.02 * Math.cos(a)), u(-7.3), u(1.02 * Math.sin(a)));
    b.rotation.y = -a;
    splines.push(b);
  }
  P('2', merged([flange, shaftBody, ...splines], 'steel'), [0, 0.42, 0]);

  // ================================================ 3 — chemise de piston
  // Denture hélicoïdale extérieure (nervures inclinées), alésage cannelé,
  // joints en T 12* (extérieur) et 11* (intérieur) dans leurs gorges côté bride.
  const sleeve = [L(S, [[1.32, -5.2], [1.95, -5.2], [1.95, -2.9], [2.08, -2.9], [2.08, -2.2], [1.32, -2.2], [1.32, -5.2]], 'steel', 40)];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const b = S.box(u(0.14), u(2.3), u(0.12), 'steel');
    b.position.set(u(1.95 * Math.cos(a)), u(-4.05), u(1.95 * Math.sin(a)));
    b.rotation.set(-0.25, -a, 0, 'YXZ');
    sleeve.push(b);
  }
  // Éclaté : la chemise sort par le bout couvercle (-Y), ses joints devant elle.
  P('3', merged(sleeve, 'steel'), [0, -0.30, 0]);
  P('12*', oring(S, 2.03, 0.06, -2.55), [0, -0.27, 0]);
  P('11*', oring(S, 1.36, 0.055, -2.55), [0, -0.24, 0]);

  // ================================================ 4 — couvercle
  // Collerette au Ø du carter, moyeu lisse Ø 3.5 dans l'alésage (appui des
  // joints côté couvercle), alésage Ø 2 sur le bout d'arbre (cannelé, visible
  // au centre) ; 4 + 2 trous (vis 10, goupilles 9).
  P('4', merged([
    L(S, [[1.02, Y.capBot], [R - 0.08, Y.capBot], [R - 0.02, Y.capBot + 0.06], [R - 0.02, Y.housBot], [1.75, Y.housBot],
      [1.75, -7.04], [1.71, -7.0], [1.02, -7.0], [1.02, Y.capBot]], 'black', 36),
  ], 'black'), [0, -0.66, 0]);
  // 13*, 15* : joint torique et bague anti-extrusion entre couvercle et bout d'arbre.
  P('13*', oring(S, 1.05, 0.05, -8.3), [0, -0.72, 0]);
  P('15*', ring(1.12, 1.0, -8.42, -8.36, 'cream'), [0, -0.76, 0]);

  // 9 — goupilles d'arrêt du couvercle ; 10 — vis sans tête (2 bride, 4 couvercle)
  for (const a of [0.3, 0.3 + Math.PI]) {
    P('9', along(THREE, pin(S, THREE, 0.1875, 0.5), [0, -1, 0], [u(2.28 * Math.cos(a)), u(Y.capBot + 0.2), u(2.28 * Math.sin(a))]), [0, -0.82, 0]);
  }
  for (const a of [Math.PI / 4, Math.PI * 1.25]) {
    P('10', along(THREE, grub(0.25, 0.375), [0, 1, 0], [u(1.95 * Math.cos(a)), u(0.002), u(1.95 * Math.sin(a))]), [0, 0.52, 0]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    P('10', along(THREE, grub(0.25, 0.375), [0, -1, 0], [u(1.75 * Math.cos(a)), u(Y.capBot - 0.002), u(1.75 * Math.sin(a))]), [0, -0.82, 0]);
  }

  // ================================================ joints et bagues des deux bouts
  // Côté bride (+Y) : 16 racleur, 18 rondelle de butée, 14 joint à lèvres,
  // 17 bague de guidage ; côté couvercle (-Y) : 17, 14, 18, 16 (ordre du dessin).
  const seals = (s, y0) => {
    // s = +1 côté bride, -1 côté couvercle ; y0 : face d'extrémité du carter.
    // Éclaté côté couvercle : après la chemise (-0.30), avant le couvercle (-0.66).
    const ex = (k) => (s > 0 ? [0, OUT + k, 0] : [0, -(0.35 + k * 0.6), 0]);
    P('16*', oring(S, 2.0, 0.06, y0 - s * 0.07), ex(0.33));
    P('18*', ring(2.05, 1.78, y0 - s * 0.02, y0 - s * 0.1, 'brass'), ex(0.24));
    // joint à lèvres : talon côté extrémité, deux lèvres vers le piston
    const ya = Math.min(y0 - s * 0.14, y0 - s * 0.32), yb = Math.max(y0 - s * 0.14, y0 - s * 0.32);
    const mid = (ya + yb) / 2;
    const prof = s > 0
      ? [[1.76, ya], [1.82, ya], [1.86, mid], [1.9, ya], [1.98, ya], [1.98, yb], [1.76, yb], [1.76, ya]]
      : [[1.76, ya], [1.98, ya], [1.98, yb], [1.9, yb], [1.86, mid], [1.82, yb], [1.76, yb], [1.76, ya]];
    P('14*', L(S, prof, 'blue', 40), ex(0.15));
    P('17*', ring(1.98, 1.77, y0 - s * 0.36, y0 - s * 0.9, 'cream'), ex(0.06));
  };
  seals(1, Y.housTop);
  seals(-1, -7.9);

  // ================================================ 19 — clapet d'équilibrage
  // Bloc usiné sur le dessus : cartouche vissée en bout (six-pans et capuchon),
  // orifices de travail ; 5 — ses 3 vis CHC ; 6 — joints d'interface.
  const vb = S.box(u(VALVE.d), u(VALVE.w), u(VALVE.h), 'zinc', { r: u(0.06), pos: [0, u(VALVE.y), u(VALVE.z0 + VALVE.h / 2)] });
  const cart = L(S, [[0, 0], [0.42, 0], [0.42, 0.35], [0.36, 0.4], [0.3, 0.4], [0.3, 0.9], [0.24, 1.0], [0, 1.0]], 'steel', 6, { axis: 'y', pos: [u(0.3), u(VALVE.y + VALVE.w / 2), u(VALVE.z0 + 0.75)] });
  const vPorts = [-0.6, 0.6].map((x) => L(S, [[0, 0], [0.2, 0], [0.2, 0.02], [0, 0.02]], 'darkSteel', 14, { axis: 'z', pos: [u(x), u(VALVE.y - 0.6), u(VALVE.z0 + VALVE.h)] }));
  P('19', group(merged([vb], 'zinc'), cart, merged(vPorts, 'darkSteel')), [0, 0, 0.32]);
  const screwPos = [-0.75, 0, 0.75].map((dy) => [0, u(VALVE.y + dy), u(VALVE.z0 + VALVE.h)]);
  P('5', group(screwPos.map((p) => along(THREE, capScrew(0.25, 1.75), [0, 0, 1], p))), [0, 0, 0.48]);
  P('6', merged([-0.5, 0.5].map((dy) => { const o = oring(S, 0.16, 0.035, 0, 'rubber', 16); o.rotation.x = Math.PI / 2; o.position.set(u(0.6), u(VALVE.y + dy), u(VALVE.z0 + 0.02)); return o; }), 'rubber'), [0, 0, 0.2]);

  return { view: { dir: [1.2, 0.6, 0.55] } };

  function circle(r, n) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [u(r * Math.cos(a)), u(r * Math.sin(a))];
    });
  }
}
