// Support à pipewrench 0102806 (Machines Roger International) : assemblage soudé
// en acier 44W, d'après le plan d'assemblage du 2022-11-17 (échelle 1:8).
//
// Cotes inscrites au plan : 25 1/2 × 9 × 28 3/4 po hors tout, montant à
// 2 15/16 po du bout, tube à 2 1/2 po du bout et 2 po de large entre les
// oreilles (bord arrière à 3 1/2 po), goupille à 2 po du bout et 1 1/2 po du
// bord avant, retrait de 1/4 po de la plaque de bout. Les autres dimensions
// sont relevées sur le tracé vectoriel du PDF (précision d'environ 1/64 po).
// Repères = articles de la nomenclature. Le plan ne précise aucun fini : le
// support est peint en rouge, comme sur la photo du support fabriqué.
// P002 à P004 (situation.js) : mises en situation avec une clé à tuyau et une tige NQ.
//
// Repère du plan, en pouces : x le long de la base (0 = bout plié, 25 1/2 =
// plaque de bout), y vers le haut, d = profondeur depuis le bord avant (côté
// goupille). Modèle : X = x centré, Y = y, +Z vers l'avant.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { situation } from './situation.js';

const IN = 0.0254;
const LEN = 25.5, DEPTH = 9;
const M = 'red';

const px = (x) => (x - LEN / 2) * IN;
const pz = (d) => (DEPTH / 2 - d) * IN;
/** Point du plan (x, y, d) en pouces → modèle (m). */
const W = (x, y, d) => [px(x), y * IN, pz(d)];
/** Contour (x, y) du plan en pouces → profil d'extrusion (m). */
const prof = (pts) => pts.map(([x, y]) => [px(x), y * IN]);

const RAD = Math.PI / 180;
/** Points d'un arc de centre (cx, cy), du degré a0 au degré a1. */
function arc(cx, cy, r, a0, a1, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** Contour fermé dont chaque coin [x, y, r] est arrondi au rayon r (0 : coin vif). */
function rounded(corners, n = 8) {
  const out = [];
  const count = corners.length;
  corners.forEach(([x, y, r = 0], i) => {
    if (!r) { out.push([x, y]); return; }
    const [ax, ay] = corners[(i + count - 1) % count], [bx, by] = corners[(i + 1) % count];
    let ux = ax - x, uy = ay - y, vx = bx - x, vy = by - y;
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    ux /= lu; uy /= lu; vx /= lv; vy /= lv;
    const half = Math.acos(ux * vx + uy * vy) / 2;
    const t = r / Math.tan(half), c = r / Math.sin(half);
    const bl = Math.hypot(ux + vx, uy + vy);
    const cx = x + ((ux + vx) / bl) * c, cy = y + ((uy + vy) / bl) * c;
    const a0 = Math.atan2(y + uy * t - cy, x + ux * t - cx);
    let da = Math.atan2(y + vy * t - cy, x + vx * t - cx) - a0;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= n; k++) out.push([cx + r * Math.cos(a0 + (da * k) / n), cy + r * Math.sin(a0 + (da * k) / n)]);
  });
  return out;
}

// ------------------------------------------------------------------ cotes (po)

const T_BASE = 0.5; // base pliée (pièce 1) : rayon extérieur des plis 1 po, hauteur 3 1/2 po
const BASE_L = 25, BASE_H = 3.5, FOLD = 1;
const T_END = 0.5, INSET = 0.25; // plaque de bout (pièce 2), en retrait de 1/4 po

const T_UP = 0.5; // montant (pièce 3), au milieu de la profondeur
const UP = { x0: 2.9375, x1: 22.5625 };
const DISC = { x: 12.75, y: 13.5, r: 5 }; // disque central
const WEB = 0.875; // demi-largeur de l'âme qui porte le disque
const LOGO = { r: 1.375, dx: 2.545, dy: 1.59 }; // trois trous en diagonale, entraxe 3 po

const T_BAR = 0.25, BAR_W = 2.25; // traverse pliée (pièce 4)
const SLOPE = 9.5 * RAD; // pente de la traverse
const SEAT_L = 26.11, SEAT_R = 23.5; // dessous des sièges du haut et du bas de la pente
const KNEE_L = 4.956; // début de la pente (dessous)
const KNEE_R = KNEE_L + (SEAT_L - SEAT_R) / Math.tan(SLOPE);
const LEG_TOP = 28.36; // haut de la butée et des oreilles du haut
const TAB = { l: [3.933, 4.433], r: [21.567, 22.067] }; // tenons du montant dans les sièges

const T_EAR = 0.25, GAP = 2; // oreilles (pièces 5 et 6) : 2 po entre les deux
const HOLE = 0.28125; // trous de 9/16 po
const EAR_R = { x0: 20.6, top: 28.75 };

const PIN = { x: 23.5, d: 2, r: 0.5, h: 3, round: 0.25 }; // goupille (pièce 7)
const TUBE = { x: 2.5, d: 6.5, ro: 1, ri: 0.75, h: 8 }; // tube (pièce 8)

// ------------------------------------------------------------------ pièces

/**
 * Pièce 1 : base pliée en plaque de 1/2 po. Dessus plat, deux longs bords et
 * le bout gauche rabattus (rayon extérieur 1 po) ; aux coins, les bords sont
 * coupés en onglet, perpendiculairement à la tôle (du coin du plat à 1/2 po du
 * bout). Maillage fermé construit bande par bande.
 */
function base(S) {
  const N = 12, RI = FOLD - T_BASE, Y0 = BASE_H - FOLD;
  // Stations le long d'un bord : pli de 90° puis bas de l'aile. o / i : [retrait
  // depuis la face extérieure, hauteur] ; cut : début du bord le long du coin.
  const st = [];
  for (let j = 0; j <= N; j++) {
    const a = ((j / N) * Math.PI) / 2, s = Math.sin(a), c = Math.cos(a);
    st.push({ o: [FOLD - FOLD * s, Y0 + FOLD * c], i: [FOLD - RI * s, Y0 + RI * c], cut: FOLD - s / 2 });
  }
  st.push({ o: [0, 0], i: [T_BASE, 0], cut: 0.5 });

  const pos = [];
  const quad = (a, b, c, d, hint) => {
    const n = new THREE.Vector3().subVectors(new THREE.Vector3(...b), new THREE.Vector3(...a))
      .cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c), new THREE.Vector3(...a)));
    const tri = n.dot(new THREE.Vector3(...hint)) >= 0 ? [a, b, c, a, c, d] : [a, c, b, a, d, c];
    for (const p of tri) pos.push(...p);
  };
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const neg = (p) => [-p[0], -p[1], -p[2]];

  /** Bord rabattu : at(station, face, t) rend le point 3D ; t0(station) et t1(station) bornent le bord. */
  const flange = (at, t0, t1, hint0, hint1) => {
    for (let j = 0; j < st.length - 1; j++) {
      const a = st[j], b = st[j + 1];
      const ao0 = at(a, 'o', t0(a)), ao1 = at(a, 'o', t1(a)), bo0 = at(b, 'o', t0(b)), bo1 = at(b, 'o', t1(b));
      const ai0 = at(a, 'i', t0(a)), ai1 = at(a, 'i', t1(a)), bi0 = at(b, 'i', t0(b)), bi1 = at(b, 'i', t1(b));
      const out = sub(at(b, 'o', t1(b)), at(b, 'i', t1(b)));
      quad(ao0, ao1, bo1, bo0, out); // face extérieure
      quad(ai0, ai1, bi1, bi0, neg(out)); // face intérieure
      quad(ao0, bo0, bi0, ai0, hint0); // chant du début
      quad(ao1, bo1, bi1, ai1, hint1); // chant de la fin
    }
    const e = st[st.length - 1];
    quad(at(e, 'o', t0(e)), at(e, 'o', t1(e)), at(e, 'i', t1(e)), at(e, 'i', t0(e)), [0, -1, 0]); // dessous de l'aile
  };
  const cut = (s) => s.cut;
  flange((s, f, t) => W(t, s[f][1], s[f][0]), cut, () => BASE_L, [-1, 0, 0], [1, 0, 0]); // bord avant
  flange((s, f, t) => W(t, s[f][1], DEPTH - s[f][0]), cut, () => BASE_L, [-1, 0, 0], [1, 0, 0]); // bord arrière
  flange((s, f, t) => W(s[f][0], s[f][1], t), cut, (s) => DEPTH - s.cut, [0, 0, 1], [0, 0, -1]); // bout gauche
  // Dessus plat et son chant du côté de la plaque de bout.
  const yi = BASE_H - T_BASE;
  quad(W(FOLD, BASE_H, FOLD), W(BASE_L, BASE_H, FOLD), W(BASE_L, BASE_H, DEPTH - FOLD), W(FOLD, BASE_H, DEPTH - FOLD), [0, 1, 0]);
  quad(W(FOLD, yi, FOLD), W(BASE_L, yi, FOLD), W(BASE_L, yi, DEPTH - FOLD), W(FOLD, yi, DEPTH - FOLD), [0, -1, 0]);
  quad(W(BASE_L, BASE_H, FOLD), W(BASE_L, BASE_H, DEPTH - FOLD), W(BASE_L, yi, DEPTH - FOLD), W(BASE_L, yi, FOLD), [1, 0, 0]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Mesh(S.creaseNormals(geo), mat(M));
}

/** Pièce 2 : plaque de bout de 1/2 po, au profil de la base en retrait de 1/4 po. */
function endPlate(S) {
  const w = DEPTH / 2 - INSET, h = BASE_H - INSET, r = FOLD - INSET;
  const pts = rounded([[-w, 0], [w, 0], [w, h, r], [-w, h, r]]).map(([z, y]) => [z * IN, y * IN]);
  const plate = S.extrude(pts, T_END * IN, M);
  plate.rotation.y = Math.PI / 2;
  // Filet de 1/4 po sur le pourtour (symbole de soudure de la vue de côté).
  const bead = rounded([[-w, 0], [-w, h, r], [w, h, r], [w, 0]], 6).map(([z, y]) => [-T_END / 2 * IN, y * IN, z * IN]);
  return S.group(plate, S.weld(bead, 0.3 * IN, M));
}

/** Découpe d'un côté du montant (s = −1 à gauche, +1 à droite) : fenêtre à coins de 1 po, échancrée par le disque. */
function windowCut(s) {
  const xw = DISC.x + s * WEB, xo = DISC.x + s * 8.0625, xf = xw + s * 0.25;
  const top = (x) => SEAT_L - (x - KNEE_L) * Math.tan(SLOPE) - 1.75 / Math.cos(SLOPE); // bord du haut, parallèle à la pente, 1 3/4 po dessous
  const h = Math.sqrt((DISC.r + 0.25) ** 2 - (WEB + 0.25) ** 2); // centres des congés de 1/4 po
  const a = Math.atan2(h, WEB + 0.25) / RAD; // angle du point de tangence sur le disque
  const face = s < 0 ? 180 : 0; // direction du disque vers la fenêtre
  return [
    ...rounded([[xw, DISC.y - h], [xw, 6, 1], [xo, 5.36, 1], [xo, top(xo), 1], [xw, top(xw), 1], [xw, DISC.y + h]]),
    ...arc(xf, DISC.y + h, 0.25, 90 + s * 90, 90 + s * 90 + s * a, 4).slice(1),
    ...arc(DISC.x, DISC.y, DISC.r, face + s * a, face - s * a, 28).slice(1),
    ...arc(xf, DISC.y - h, 0.25, 90 + s * 90 - s * a, 90 + s * 90, 4).slice(1, -1),
  ];
}

/** Pièce 3 : montant découpé de 1/2 po, avec ses filets de 1/2 po sur la base. */
function upright(S) {
  const e = 0.012; // tenons à fleur du dessus des sièges
  const outline = [
    [UP.x0, BASE_H], [UP.x1, BASE_H], [UP.x1, SEAT_R],
    [TAB.r[1], SEAT_R], [TAB.r[1], SEAT_R + T_BAR + e], [TAB.r[0], SEAT_R + T_BAR + e], [TAB.r[0], SEAT_R],
    [KNEE_R, SEAT_R], [KNEE_L, SEAT_L],
    [TAB.l[1], SEAT_L], [TAB.l[1], SEAT_L + T_BAR + e], [TAB.l[0], SEAT_L + T_BAR + e], [TAB.l[0], SEAT_L],
    [UP.x0, SEAT_L],
  ];
  const holes = [
    prof(windowCut(-1)), prof(windowCut(1)),
    ...[-1, 0, 1].map((k) => [px(DISC.x + k * LOGO.dx), (DISC.y + k * LOGO.dy) * IN, LOGO.r * IN]),
  ];
  const g = S.group(S.extrude(prof(outline), T_UP * IN, M, { holes }));
  for (const s of [-1, 1]) {
    const z = s * (T_UP / 2) * IN;
    g.add(S.weld([[px(UP.x0), BASE_H * IN, z], [px(UP.x1), BASE_H * IN, z]], 0.6 * IN, M));
  }
  return g;
}

/** Pièce 4 : traverse pliée de 1/4 po (butée relevée, siège du haut, pente, siège du bas). */
function crossbar(S) {
  const xb = UP.x0 + T_BAR, yb = SEAT_L + 2 * T_BAR; // centre du pli de la butée
  const k = T_BAR * Math.tan(SLOPE / 2); // décalage des plis de la pente sur le dessus
  const pts = [
    [UP.x0 - T_BAR, LEG_TOP],
    ...arc(xb, yb, 2 * T_BAR, 180, 270),
    [KNEE_L, SEAT_L], [KNEE_R, SEAT_R], [UP.x1, SEAT_R], [UP.x1, SEAT_R + T_BAR],
    [KNEE_R + k, SEAT_R + T_BAR], [KNEE_L + k, SEAT_L + T_BAR],
    ...arc(xb, yb, T_BAR, 270, 180),
    [UP.x0, LEG_TOP],
  ];
  const g = S.group(S.extrude(prof(pts), BAR_W * IN, M));
  // Filets de 1/4 po sous la traverse, de chaque côté du montant.
  for (const s of [-1, 1]) {
    const z = s * (T_UP / 2) * IN;
    g.add(S.weld([[px(UP.x0), SEAT_L * IN, z], [px(KNEE_L), SEAT_L * IN, z], [px(KNEE_R), SEAT_R * IN, z], [px(UP.x1), SEAT_R * IN, z]], 0.3 * IN, M));
  }
  return g;
}

/** Bas d'une oreille posée sur le chant du siège : bord à la hauteur y, ergot de 1/8 po entre x0 et x1. */
const earFoot = (y, x0, x1) => [[x0, y], [x0, y - T_BAR / 2], [x1, y - T_BAR / 2], [x1, y]];

/** Oreille avec son filet de 1/4 po contre le chant du siège ; side = +1 à l'avant, −1 à l'arrière. */
function ear(S, pts, hole, y, xa, xb, side) {
  const g = S.group(S.extrude(prof(pts), T_EAR * IN, M, { holes: [[px(hole[0]), hole[1] * IN, HOLE * IN]] }));
  g.add(S.weld([[px(xa), y * IN, 0], [px(xb), y * IN, 0]], 0.3 * IN, M));
  g.position.z = side * ((GAP + T_EAR) / 2) * IN;
  return g;
}

/** Pièce 5 : oreille du haut (2 × 2 po), appuyée contre la butée. */
function earTop(S, side) {
  const y = SEAT_L + T_BAR, xr = 4.911;
  const pts = [
    [UP.x0 + T_BAR, y], ...earFoot(y, 3.867, 4.233), [xr, y],
    ...arc(xr - 0.25, LEG_TOP - 0.25, 0.25, 0, 90, 6),
    [UP.x0, LEG_TOP],
    ...arc(UP.x0 + T_BAR, y + T_BAR, T_BAR, 180, 270, 6).slice(0, -1),
  ];
  return ear(S, pts, [3.936, 27.364], y, UP.x0 + T_BAR, xr, side);
}

/** Pièce 6 : oreille du bas de la pente (2 × 5 po, bout arrondi au rayon de 1/2 po). */
function earLow(S, side) {
  const y = SEAT_R + T_BAR;
  const pts = [
    [EAR_R.x0, y], ...earFoot(y, 21.389, 21.767), [UP.x1, y],
    ...arc(UP.x1 - 0.5, EAR_R.top - 0.5, 0.5, 0, 90),
    ...arc(EAR_R.x0 + 0.5, EAR_R.top - 0.5, 0.5, 90, 180),
  ];
  return ear(S, pts, [21.6, 28.125], y, EAR_R.x0, UP.x1, side);
}

/** Pièce 7 : goupille en barre ronde de 1 po, dessus arrondi au rayon de 1/4 po. */
function pin(S) {
  const pts = [[0, 0], [PIN.r, 0], ...arc(PIN.r - PIN.round, PIN.h - PIN.round, PIN.round, 0, 90), [0, PIN.h]];
  const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * IN, y * IN)), 32);
  return S.group(new THREE.Mesh(S.creaseNormals(geo), mat(M)), S.weldRing(PIN.r * IN, 0.3 * IN, M));
}

/** Pièce 8 : tube rond de 2 po (paroi de 1/4 po), debout sur la base. */
function tube(S) {
  return S.group(
    S.shell(TUBE.ro * IN, TUBE.ri * IN, TUBE.h * IN, M, { pos: [0, (TUBE.h / 2) * IN, 0] }),
    S.weldRing(TUBE.ro * IN, 0.3 * IN, M),
  );
}

// ------------------------------------------------------------------ assemblage

export function P001(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, pos, explode) => {
    if (pos) obj.position.add(new THREE.Vector3(...pos));
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  put('1', base(S), null, [0, -0.1, 0]);
  put('2', endPlate(S), W(BASE_L + T_END / 2, 0, DEPTH / 2), [0.16, -0.1, 0]);
  put('3', upright(S), null, [0, 0.1, 0]);
  put('4', crossbar(S), null, [0, 0.3, 0]);
  for (const side of [1, -1]) {
    put('5', earTop(S, side), null, [0, 0.38, side * 0.13]);
    put('6', earLow(S, side), null, [0, 0.38, side * 0.13]);
  }
  put('7', pin(S), W(PIN.x, BASE_H, PIN.d), [0.05, 0.14, 0.12]);
  put('8', tube(S), W(TUBE.x, BASE_H, TUBE.d), [-0.2, 0.1, -0.02]);
  return { view: { dir: [0.95, 0.55, 1.15] } };
}

/** Dessus de la traverse (po) à l'abscisse x du plan : la clé s'y pose. Hors de la traverse : 99 derrière la butée, −99 au-delà du bout. */
export function dessusTraverse(x) {
  const k = T_BAR * Math.tan(SLOPE / 2);
  if (x < UP.x0 - 1e-4) return 99;
  if (x < UP.x0 + T_BAR) return SEAT_L + 2 * T_BAR - Math.sqrt(Math.max(0, T_BAR ** 2 - Math.min(T_BAR, UP.x0 + T_BAR - x) ** 2));
  if (x <= KNEE_L + k) return SEAT_L + T_BAR;
  if (x <= KNEE_R + k) return SEAT_L + T_BAR - (x - KNEE_L - k) * Math.tan(SLOPE);
  return x <= UP.x1 ? SEAT_R + T_BAR : -99;
}
/** Cotes du plan utiles à la pose de la clé (po). */
export const PLAN = { butee: UP.x0, bout: UP.x1, milieu: LEN / 2 };

const P002 = (api) => situation(api, 18);
const P003 = (api) => situation(api, 24);
const P004 = (api) => situation(api, 36);

export default { P001, P002, P003, P004 };
