// Fonctions et cotes communes du lot « centreur, plaque à coins, cadre du
// carrousel, arrêt d'urgence » de l'avance du DU311 sur roues (P032 à P102).
// Fichier préfixé « _ » : non inscrit comme assemblage.
//
// Repère de l'avance (../feed.js) : pied du mât à y = 0, axe du mât +Y, face
// (côté axe de forage) +Z, carrousel côté +X ; axe de forage en x = 0,
// z = FEED.AX. Le centreur fixe (P032), la plaque à coins (P046) et les
// mâchoires (P048) se décrivent dans le « repère du centreur » : mêmes axes,
// origine sur l'axe de forage au niveau du dessus du caisson (face de
// glissement de la plaque à coins), cotes en pouces ; cp() le ramène dans le
// repère de l'avance.
import { FEED } from '../feed.js';
import { u, IN } from '../../du311/parts/_avance_b.js';

// Dessus du caisson du centreur : plaque à coins de 1 1/4 po posée dessus
// (dessus à y = 0,127, sous le manchon de la tige tenue, JOINT = 0,3 dans la
// simulation), centreur et logement du racleur dessous, entonnoir jusqu'à
// y = -0,29 (le taillant du marteau rangé à HAMMER_STOW = -0,2 y loge).
const TOP = 0.095;

export const CENT = {
  top: TOP, // m (repère de l'avance)
  AX: FEED.AX,
  // caisson (po) : demi-largeur aux faces des flasques d'about, dessous,
  // demi-profondeur, tôles
  box: { x: 13.1, xi: 12.35, y0: -5.2, z: 6.0, t: 0.5 },
  jawY: 7.82 - 12.0, // dessous des mâchoires, mâchoires fermées (repère de P036 / P048)
  cylY: 9.3 - 12.0, // axe des vérins de centrage (au droit de la poche des mâchoires)
  pivotX: 17.1, // axe d'articulation des supports P042 (+X) et P044 (-X)
  // moyeux arrière (axes 2 po × 9 1/4 dans les chapes du pied de mât), po
  boss: { x: 11.5, z: -11.75, ro: 1.875, ri: 1.015 },
  // plateau arrière sous le pied du mât (po) : dessous, dessus, bord arrière
  deck: { y0: -4.49, y1: -3.74, z1: -23.4 },
};
// Logement du racleur (P034) : dessus contre le dessous du caisson ; plaque
// supérieure de 3/8 po, puis (de haut en bas) joint racleur (P048 repère 3,
// 1 3/4 po), plaque racleuse (P048 repère 1, 3/8 po) et disque dévieur (P034
// repère 3, 1/4 po) posé sur le fond du logement, 2,9 po sous le dessus.
CENT.wiperTop = CENT.box.y0 - 0.525;

/** Point du repère du centreur (po) → repère de l'avance (m). */
export const cp = (x, y, z) => [u(x), TOP + u(y), FEED.AX + u(z)];

// Plaque à coins (P046) : repère de la plaque (comme P044 du TVK) — origine
// sur l'axe de forage au fond de la fente, Y = 0 sous la plaque, +Z vers les
// chapes — tourné de -90° autour de Y (chapes vers -X de l'avance). Axes de
// chape à ±XC de l'axe, ZL du fond de fente, YB au-dessus du dessous.
export const SLIP = {
  T: 1.25 * IN, XC: 0.0905, ZL: 0.071, YB: (1.25 + 0.875) * IN,
  LT: 0.5 * IN, GAP: 0.9 * IN,
  stroke: 4.0 * IN, // course des vérins de coins CX077208 (P032 repère 9) : la fente de 3 po dégage la tige Ø 3 1/2
};
/** Axe de la chape s (-1 : côté -Z, +1 : côté +Z) de la plaque à coins fermée, repère de l'avance. */
export const slipClevis = (s) => [-SLIP.ZL, TOP + SLIP.YB, FEED.AX + s * SLIP.XC];

/** Objet orienté par sa base locale (X, Y ; Z = X × Y), placé en pos (m). */
export function basis(THREE, obj, X, Y, pos) {
  const x = new THREE.Vector3(...X).normalize();
  const y = new THREE.Vector3(...Y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  g.position.set(...pos);
  return g;
}

// Tôles extrudées : contours en mètres, trous [a, b, r].
/** Contour [x, z] extrudé selon Y de y0 à y1. */
export function slabY(S, pts, y0, y1, mat, holes = []) {
  const m = S.extrude(pts.map(([x, z]) => [x, -z]), y1 - y0, mat, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
  m.rotation.x = -Math.PI / 2;
  m.position.y = (y0 + y1) / 2;
  return m;
}
/** Contour [z, y] extrudé selon X de x0 à x1. */
export function slabX(S, pts, x0, x1, mat, holes = []) {
  const m = S.extrude(pts.map(([z, y]) => [-z, y]), x1 - x0, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
  m.rotation.y = Math.PI / 2;
  m.position.x = (x0 + x1) / 2;
  return m;
}
/** Contour [x, y] extrudé selon Z de z0 à z1. */
export function slabZ(S, pts, z0, z1, mat, holes = []) {
  const m = S.extrude(pts, z1 - z0, mat, { holes });
  m.position.z = (z0 + z1) / 2;
  return m;
}

/**
 * Tôle de contour quelconque (plan XY, m) extrudée selon Z (centrée), arêtes
 * cassées de 1 mm ; trous ronds [x, y, r] ou polygonaux [[x, y], ...].
 */
export function sheet(S, THREE, outline, depth, mat, holes = []) {
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of holes) {
    if (typeof h[0] === 'number') {
      const p = new THREE.Path();
      p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
      shape.holes.push(p);
    } else {
      // Trou polygonal : parcouru en sens inverse du contour.
      const pts = h.map(([x, y]) => new THREE.Vector2(x, y));
      if (!THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
      shape.holes.push(new THREE.Path(pts));
    }
  }
  const b = Math.min(depth * 0.16, 0.0012);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * b, bevelEnabled: b > 0.0004, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 16,
  });
  geo.translate(0, 0, -(depth - 2 * b) / 2);
  const m = new THREE.Mesh(S.creaseNormals(geo));
  return S.merged([m], mat);
}

/** Arc de cercle [x, y] (cx, cy, r, a0 → a1, n segments). */
export function arc(cx, cy, r, a0, a1, n) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

/** Rectangle à coins arrondis [x, y] centré en (cx, cy), rayon r (m). */
export function roundRect(cx, cy, w, h, r, n = 4) {
  const x0 = cx - w / 2 + r, x1 = cx + w / 2 - r, y0 = cy - h / 2 + r, y1 = cy + h / 2 - r;
  return [
    ...arc(x1, y0, r, -Math.PI / 2, 0, n), ...arc(x1, y1, r, 0, Math.PI / 2, n),
    ...arc(x0, y1, r, Math.PI / 2, Math.PI, n), ...arc(x0, y0, r, Math.PI, 1.5 * Math.PI, n),
  ];
}

/**
 * Rondelles Nord-Lock à grand diamètre (« NL SP », d po) : paire de disques à
 * rampes, de y = 0 à 2t, diamètre extérieur 2,1 d.
 */
export function nordLockSP(S, d, { mat = 'zinc' } = {}) {
  const ro = d * 1.05, ri = d * 0.53, t = Math.max(0.05, d * 0.11);
  const P = (pts) => S.lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg: 24 });
  const g = [P([[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]]), P([[ri, t + 0.004], [ro, t + 0.004], [ro, 2 * t], [ri, 2 * t], [ri, t + 0.004]])];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    for (const [y, s] of [[0, -1], [2 * t, 1]]) {
      const b = S.box(u(ro - ri), u(0.012), u(0.035), mat);
      b.position.set(u((ro + ri) / 2) * Math.cos(a), u(y + s * 0.006), -u((ro + ri) / 2) * Math.sin(a));
      b.rotation.y = a;
      g.push(b);
    }
  }
  return S.merged(g, mat);
}
/** Épaisseur (po) d'une paire de rondelles Nord-Lock de diamètre d. */
export const nlT = (d) => 2 * Math.max(0.05, d * 0.11);

/**
 * Bague roulée (ro × ri × len, m) le long de Y, centrée : joint agrafé en
 * créneau à l'angle a, trou de graissage optionnel.
 */
export function rolledBushing(S, ro, ri, len, { a = 0, mat = 'brass', seg = 40, oil = false } = {}) {
  const h = len / 2, w = (0.4e-3) / ro, e = Math.min(0.2e-3 + len * 0.02, h * 0.3);
  const windows = [
    { a, w, y0: -h, y1: e },
    { a: a + 0.175, w: 0.35 + w, y0: -e, y1: e },
    { a: a + 0.35, w, y0: -e, y1: h },
  ];
  if (oil) windows.push(...S.roundHole(a + Math.PI, 0, Math.min(1.6e-3, len * 0.12), ro, { steps: 5 }));
  return S.slotted(ro, ri, -h, h, windows, mat, { seg });
}
