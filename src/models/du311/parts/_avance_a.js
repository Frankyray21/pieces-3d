// Bibliothèque partagée du groupe « avance-a » (avance V30, P032) : raccords
// hydrauliques JIC / ORB / NPT, flexibles sertis à longueur de catalogue,
// boulonnerie (vis H, écrous, rondelles Nord-Lock et fendues), clapet de
// charge double CP47573 et clapet d'équilibrage CX000252. Fichier préfixé
// « _ » : pas un assemblage, non inscrit dans parts/index.js.
//
// Raccords : chaque fonction construit la pièce dans un repère local où
// l'origine est la face d'appui sur le composant qui la reçoit (orifice,
// tôle de traversée…), le bout fileté A entrant selon −Y ; le bout libre B
// sort selon +Y (droit), +X (coude 90°) ou à 45° dans le plan XY. Les sièges
// libres (bout du cône JIC, où vient s'appuyer l'écrou tournant d'un flexible)
// sont notés dans userData.ports : [{ p: Vector3, d: Vector3 }] (repère local,
// d vers l'extérieur) ; seat(obj, i) les donne dans le repère du parent une
// fois l'objet placé (place()).
import * as THREE from 'three';
import * as S from '../../../viewer/shapes.js';

export const IN = 0.0254;
const v3 = (a) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(...a));

// Cotes par taille (n° « dash » = seizièmes de pouce), en pouces : filetage
// JIC (diamètre), six pans d'adaptateur, filetage NPT (diamètre ext.), écrou
// tournant de flexible, Ø ext. du flexible (deux tresses compact).
const SZ = {
  4: { jic: 0.4375, hex: 0.5625, npt: 0.54, nut: 0.5625, hose: 0.56 },
  6: { jic: 0.5625, hex: 0.6875, npt: 0.675, nut: 0.75, hose: 0.75 },
  8: { jic: 0.75, hex: 0.875, npt: 0.84, nut: 0.875, hose: 0.88 },
  10: { jic: 0.875, hex: 1.0, npt: 1.05, nut: 1.0, hose: 1.0 },
  12: { jic: 1.0625, hex: 1.25, npt: 1.05, nut: 1.25, hose: 1.2 },
  16: { jic: 1.3125, hex: 1.5, npt: 1.315, nut: 1.5, hose: 1.5 },
  32: { jic: 2.5, hex: 2.75, npt: 2.375, nut: 2.75, hose: 2.6 },
};
export const size = (n) => {
  const s = SZ[n];
  return { jic: s.jic * IN, hex: s.hex * IN, npt: s.npt * IN, nut: s.nut * IN, hose: s.hose * IN };
};

// ------------------------------------------------------------------ placement

/** Oriente obj : son +Y local selon y, son +X local au plus près de x ; position pos. */
export function place(obj, pos, y = [0, 1, 0], x = null) {
  const Y = v3(y).normalize();
  let X = x ? v3(x) : new THREE.Vector3(Math.abs(Y.x) < 0.9 ? 1 : 0, Math.abs(Y.x) < 0.9 ? 0 : 1, 0);
  X.addScaledVector(Y, -X.dot(Y));
  if (X.lengthSq() < 1e-9) X = new THREE.Vector3(0, 0, 1).addScaledVector(Y, -Y.z);
  X.normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  const g = obj.isGroup && !obj.userData.placed ? obj : S.group(obj);
  g.userData.placed = true;
  if (obj.userData.ports && g !== obj) g.userData.ports = obj.userData.ports;
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  g.position.copy(v3(pos));
  g.updateMatrixWorld(true);
  return g;
}

/** Siège n° i d'un raccord placé, dans le repère du parent : { p, d }. */
export function seat(obj, i = 0) {
  obj.updateMatrix();
  const q = obj.ports || obj.userData.ports;
  const pt = q[i];
  const m = obj.matrix;
  return { p: pt.p.clone().applyMatrix4(m), d: pt.d.clone().transformDirection(m) };
}

// ------------------------------------------------------------------ profils

// Profil construit bout en bas (y = 0) puis retourné : bout en +Y.
const flip = (prof, y1) => prof.map(([r, y]) => [r, y1 - y]).reverse();

/** Mâle JIC 37° de filetage d, de y0 (épaulement) au bout en y0 + len(d). */
function jicLen(d) { return d * 0.95 + 0.004; }
function jicProfile(d, y0) {
  const r = d / 2, L = jicLen(d);
  // Bout en bas : cône 37°, filet, dégagement.
  const p = [
    [0, 0.0015], [r * 0.42, 0.0015], [r * 0.42, 0], [r * 0.7, 0], [r * 0.86, L * 0.2],
    ...S.thread(r, L * 0.24, L * 0.8, { pitch: d * 0.11, maxTurns: 6, chamferBottom: false }),
    [r * 0.8, L * 0.84], [r * 0.8, L],
  ];
  return flip(p, L).map(([rr, y]) => [rr, y + y0]);
}
/** Mâle ORB (filet droit + joint torique contre l'épaulement), bout en y0 − len. */
function orbProfile(d, y0) {
  const r = d / 2, L = d * 0.85 + 0.003;
  return [
    [r * 0.45, y0 - L], [r * 0.85, y0 - L],
    ...S.thread(r, y0 - L + 0.0006, y0 - L * 0.28, { pitch: d * 0.11, maxTurns: 7 }),
    [r * 0.82, y0 - L * 0.24], [r * 0.82, y0],
  ];
}
/** Mâle NPT conique (r à la base, −6 %), bout en y0 − len. */
function nptProfile(d, y0) {
  const r = d / 2, L = d * 0.75 + 0.004;
  return [
    [r * 0.55, y0 - L],
    ...S.thread(r * 0.94, y0 - L, y0 - L * 0.08, { r1: r, pitch: d * 0.13, maxTurns: 8 }),
    [r * 0.9, y0 - L * 0.04], [r * 0.9, y0],
  ];
}

// Bouts filetés vissés dans le composant (vers −Y), en profil à joindre.
function inEnd(kind, n, y0 = 0) {
  const s = size(n);
  if (kind === 'npt') return nptProfile(s.npt, y0);
  if (kind === 'orb') return orbProfile(s.jic, y0);
  return orbProfile(s.jic, y0);
}

// ------------------------------------------------------------------ raccords

const MAT = 'zinc';

/** Six pans de surplat af, hauteur h, centré en y (axe Y). */
const hex = (af, h, y, mat = MAT) => S.nut(af, h, mat, { pos: [0, y, 0] });
/** Joint torique au pied d'un filetage ORB. */
const oring = (n, y = -0.0012) => {
  const r = size(n).jic / 2;
  return S.torus(r * 0.92, Math.max(0.0009, r * 0.1), 'rubber', { pos: [0, y, 0] });
};

/**
 * Adaptateur droit : bout A (kindA, taille nA) vissé selon −Y, six pans,
 * bout B mâle JIC (taille nB) selon +Y. kindA : 'orb' | 'npt' | 'jic'.
 * long : version longue (FA01056). Siège : bout du cône.
 */
export function straight(kindA, nA, nB, { long = false, mat = MAT } = {}) {
  const sa = size(nA), sb = size(nB);
  const af = Math.max(sa.hex, sb.hex, kindA === 'npt' ? sa.npt * 1.15 : 0);
  const hh = af * 0.42;
  const neck = long ? 0.025 : 0.002;
  const yB = hh + neck;
  const body = S.lathe([
    ...inEnd(kindA, nA, 0),
    [af * 0.42, 0], [af * 0.42, hh * 0.1], [sb.jic * 0.42, hh], [sb.jic * 0.4, yB],
    ...jicProfile(sb.jic, yB).slice(1),
  ], mat, { seg: 20 });
  const g = S.group(body, hex(af, hh * 0.86, hh * 0.5, mat));
  if (kindA === 'orb') g.add(oring(nA));
  const tip = yB + jicLen(sb.jic);
  g.userData.ports = [{ p: new THREE.Vector3(0, tip, 0), d: new THREE.Vector3(0, 1, 0) }];
  return g;
}

/**
 * Coude 90° (ou 45° : angle) forgé : bout A vissé selon −Y (ORB avec contre-
 * écrou et rondelle, NPT, ou écrou tournant femelle JIC : 'swivel'), bout B
 * mâle JIC sortant dans le plan XY vers +X (90°) ou à 45°.
 */
export function elbow(kindA, nA, nB, { angle = 90, mat = MAT } = {}) {
  const sa = size(nA), sb = size(nB);
  const rb = Math.max(sa.jic, sb.jic) * 0.55;
  const a = (angle * Math.PI) / 180;
  const dir = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
  const parts = [];
  let yc; // centre du corps
  if (kindA === 'swivel') {
    // Écrou tournant sur le mâle qui le reçoit : le siège est à y = 0.
    const nh = sa.nut * 0.7;
    parts.push(hex(sa.nut, nh, nh * 0.15, mat));
    yc = nh * 0.6 + rb;
  } else if (kindA === 'orb') {
    // Contre-écrou + rondelle d'appui (raccord orientable).
    const nh = sa.hex * 0.42;
    parts.push(S.washer(sa.hex * 0.62, sa.jic * 0.5, 0.0016, mat, { pos: [0, 0.0008, 0] }));
    parts.push(hex(sa.hex, nh, 0.0016 + nh / 2, mat));
    parts.push(S.lathe([...inEnd('orb', nA, 0.0016), [sa.jic * 0.42, 0.0016], [sa.jic * 0.42, 0.0016 + nh + 0.004], [0, 0.0016 + nh + 0.004]], mat, { seg: 18 }));
    parts.push(oring(nA, 0.0004));
    yc = 0.0016 + nh + 0.004 + rb;
  } else {
    parts.push(S.lathe([...inEnd(kindA, nA, 0), [sa.npt * 0.5, 0], [sa.npt * 0.5, 0.004], [0, 0.004]], mat, { seg: 18 }));
    yc = 0.004 + rb * 1.1;
  }
  // Corps forgé : fût vertical arrondi en haut, bras vers B.
  parts.push(S.cyl(rb, yc - (kindA === 'swivel' ? sa.nut * 0.3 : 0), mat, { seg: 18, pos: [0, (yc + (kindA === 'swivel' ? sa.nut * 0.3 : 0)) / 2, 0] }));
  parts.push(S.ball(rb, mat, { pos: [0, yc, 0] }));
  const arm = rb * 1.25;
  const armObj = S.cyl(rb * 0.92, arm, mat, { seg: 18 });
  const g0 = place(armObj, dir.clone().multiplyScalar(arm / 2).add(new THREE.Vector3(0, yc, 0)), dir);
  parts.push(g0);
  const base = dir.clone().multiplyScalar(arm).add(new THREE.Vector3(0, yc, 0));
  // Collerette puis mâle JIC.
  const male = S.lathe([[0, 0], [rb * 0.95, 0], [rb * 0.95, 0.002], [sb.jic * 0.42, 0.002], ...jicProfile(sb.jic, 0.002).slice(1)], mat, { seg: 18 });
  parts.push(place(male, base, dir));
  const tip = base.clone().addScaledVector(dir, 0.002 + jicLen(sb.jic));
  const g = S.group(S.merged(parts.filter((p) => !p.userData?.rubber), mat));
  if (kindA === 'orb') g.add(oring(nA, 0.0004));
  g.userData.ports = [{ p: tip, d: dir.clone() }];
  return g;
}

/**
 * Té : bout A selon −Y ('swivel' écrou tournant femelle, 'orb', 'npt' ou
 * 'jic' mâle, siège en y = 0), taille nA ; passage mâle JIC selon +Y,
 * branche mâle JIC selon +X, taille n. ports : passage, branche (, A si 'jic').
 */
export function tee(kindA, nA, n = nA, { mat = MAT } = {}) {
  const s = size(n), sa = size(nA);
  const bw = s.jic * 1.15; // corps forgé carré
  const parts = [];
  let y0 = 0;
  if (kindA === 'swivel') {
    const nh = s.nut * 0.7;
    parts.push(hex(s.nut, nh, nh * 0.15, mat));
    y0 = nh * 0.65;
  } else if (kindA === 'jic') {
    // Mâle JIC vers −Y, bout (siège) à y = 0.
    const L = jicLen(s.jic);
    const m = S.lathe(jicProfile(s.jic, 0), mat, { seg: 18 });
    m.rotation.x = Math.PI; m.position.y = L + 0.0015;
    parts.push(m);
    y0 = L + 0.0015;
  } else {
    parts.push(S.lathe([...inEnd(kindA, nA, 0), [sa.jic * 0.5, 0], [sa.jic * 0.5, 0.003], [0, 0.003]], mat, { seg: 18 }));
    if (kindA === 'orb') parts.push(hex(sa.hex, sa.hex * 0.4, 0.003 + sa.hex * 0.2, mat));
    y0 = kindA === 'orb' ? 0.003 + sa.hex * 0.4 : 0.003;
  }
  const yc = y0 + bw / 2;
  parts.push(S.box(bw, bw, bw, mat, { pos: [0, yc, 0] }));
  const runM = S.lathe([[0, 0], [s.jic * 0.42, 0], ...jicProfile(s.jic, 0.0015)], mat, { seg: 18 });
  parts.push(place(runM, [0, yc + bw / 2, 0], [0, 1, 0]));
  const brM = S.lathe([[0, 0], [s.jic * 0.42, 0], ...jicProfile(s.jic, 0.0015)], mat, { seg: 18 });
  parts.push(place(brM, [bw / 2, yc, 0], [1, 0, 0]));
  const g = S.group(S.merged(parts, mat));
  if (kindA === 'orb') g.add(oring(nA, 0.0004));
  const tr = yc + bw / 2 + 0.0015 + jicLen(s.jic);
  const tb = bw / 2 + 0.0015 + jicLen(s.jic);
  g.userData.ports = [
    { p: new THREE.Vector3(0, tr, 0), d: new THREE.Vector3(0, 1, 0) },
    { p: new THREE.Vector3(tb, yc, 0), d: new THREE.Vector3(1, 0, 0) },
  ];
  if (kindA === 'jic') g.userData.ports.push({ p: new THREE.Vector3(0, 0, 0), d: new THREE.Vector3(0, -1, 0) });
  return g;
}

/**
 * Union droite mâle JIC / mâle JIC (six pans au milieu), centrée sur
 * l'origine, axe Y : sièges en ±Y. Traversée (bulkhead) : corps fileté long
 * et contre-écrou ; la tôle (épaisseur t) est en y ∈ [0, t] et le six pans
 * appuie dessous (y < 0).
 */
export function union(n, { bulkhead = false, t = 0.25 * IN, mat = MAT } = {}) {
  const s = size(n);
  const parts = [];
  let ports;
  if (!bulkhead) {
    const hh = s.hex * 0.45;
    parts.push(hex(s.hex, hh, 0, mat));
    const m1 = S.lathe([[0, 0], [s.jic * 0.4, 0], ...jicProfile(s.jic, hh / 2).slice(0)], mat, { seg: 18 });
    const m2 = S.lathe([[0, 0], [s.jic * 0.4, 0], ...jicProfile(s.jic, hh / 2).slice(0)], mat, { seg: 18 });
    m2.rotation.x = Math.PI;
    parts.push(m1, m2);
    const tip = hh / 2 + jicLen(s.jic);
    ports = [[0, tip, 0, 1], [0, -tip, 0, -1]];
  } else {
    // Six pans sous la tôle, fût fileté au travers, contre-écrou dessus.
    const rb = s.jic * 0.62 + 0.003, hh = s.hex * 0.42, nh = s.hex * 0.38;
    const af = s.hex * 1.15;
    parts.push(hex(af, hh, -hh / 2, mat));
    const len = t + nh + 0.004;
    parts.push(S.lathe([[0, 0], ...S.thread(rb, 0, len, { pitch: rb * 0.25, maxTurns: 10, chamferBottom: false }), [s.jic * 0.4, len + 0.001], [0, len + 0.001]], mat, { seg: 18 }));
    parts.push(hex(af, nh, t + nh / 2, mat));
    const m1 = S.lathe([[0, 0], [s.jic * 0.4, 0], ...jicProfile(s.jic, len + 0.001).slice(0)], mat, { seg: 18 });
    const m2 = S.lathe([[0, 0], [s.jic * 0.4, 0], ...jicProfile(s.jic, hh).slice(0)], mat, { seg: 18 });
    m2.rotation.x = Math.PI;
    parts.push(m1, m2);
    ports = [[0, len + 0.001 + jicLen(s.jic), 0, 1], [0, -hh - jicLen(s.jic), 0, -1]];
  }
  const g = S.group(S.merged(parts, mat));
  g.userData.ports = ports.map(([x, y, z, d]) => ({ p: new THREE.Vector3(x, y, z), d: new THREE.Vector3(0, d, 0) }));
  return g;
}

/**
 * Coude de traversée 90° (FA01001) : fût fileté au travers de la tôle
 * (y ∈ [0, t]), contre-écrou dessus, mâle JIC selon +Y ; sous la tôle, coude
 * forgé dont le mâle JIC sort selon +X.
 */
export function bulkheadElbow(n, { t = 0.25 * IN, mat = MAT } = {}) {
  const s = size(n);
  const rb = s.jic * 0.62 + 0.003, nh = s.hex * 0.38, af = s.hex * 1.15;
  const len = t + nh + 0.004;
  const rc = s.jic * 0.62;
  const parts = [
    S.lathe([[0, -0.003], [rb, -0.003], ...S.thread(rb, 0, len, { pitch: rb * 0.25, maxTurns: 10, chamferBottom: false }), [s.jic * 0.4, len + 0.001], [0, len + 0.001]], mat, { seg: 18 }),
    hex(af, nh, t + nh / 2, mat),
    S.washer(af * 0.55, rb, 0.002, mat, { pos: [0, -0.001, 0] }),
    S.cyl(rc * 1.05, rc * 1.4, mat, { seg: 18, pos: [0, -0.003 - rc * 0.7, 0] }),
    S.ball(rc * 1.05, mat, { pos: [0, -0.003 - rc * 1.4, 0] }),
  ];
  const m1 = S.lathe([[0, 0], [s.jic * 0.4, 0], ...jicProfile(s.jic, len + 0.001).slice(0)], mat, { seg: 18 });
  parts.push(m1);
  const yc = -0.003 - rc * 1.4;
  const arm = S.lathe([[0, 0], [rc, 0], [rc, rc * 1.2], [s.jic * 0.42, rc * 1.2 + 0.002], ...jicProfile(s.jic, rc * 1.2 + 0.002).slice(0)], mat, { seg: 18 });
  parts.push(place(arm, [0, yc, 0], [1, 0, 0]));
  const g = S.group(S.merged(parts, mat));
  g.userData.ports = [
    { p: new THREE.Vector3(0, len + 0.001 + jicLen(s.jic), 0), d: new THREE.Vector3(0, 1, 0) },
    { p: new THREE.Vector3(rc * 1.2 + 0.002 + jicLen(s.jic), yc, 0), d: new THREE.Vector3(1, 0, 0) },
  ];
  return g;
}

/** Bouchon femelle JIC (écrou borgne), siège à l'origine, corps selon +Y. */
export function capNut(n, { mat = MAT } = {}) {
  const s = size(n), h = s.nut * 0.8;
  const g = S.group(S.merged([
    hex(s.nut, h * 0.75, -h * 0.2, mat),
    S.lathe([[0, -h * 0.55], [s.nut * 0.45, -h * 0.55], [s.nut * 0.45, h * 0.35], [s.nut * 0.3, h * 0.5], [0, h * 0.5]], mat, { seg: 18 }),
  ], mat));
  return g;
}

/** Écrou tournant femelle JIC seul (bout de flexible ou raccord tournant), siège à l'origine, selon +Y. */
export function swivelNut(n, mat = MAT) {
  const s = size(n), h = s.nut * 0.75;
  return hex(s.nut, h, h * 0.15, mat);
}

// ------------------------------------------------------------------ flexibles

/** Longueur d'embout serti (siège → bout de la douille), droit / coudé, pour la taille n. */
const endLen = (n) => {
  const d = size(n).hose;
  return { st: 0.03 + d * 1.4, drop: 0.018 + d * 1.0, le: 0.022 + d * 1.25 };
};

function crimpEnd(n, kind, mat) {
  // Embout le long de +Y local (siège à l'origine) ; coude : écrou selon +Y,
  // douille selon +X.
  const s = size(n), R = s.hose / 2, E = endLen(n);
  const nutH = s.nut * 0.72;
  const ferrule = (y0, y1) => {
    const prof = [[0, y0], [R * 0.75, y0], [R * 1.12, y0 + 0.002]];
    for (const t of [0.35, 0.65]) {
      const y = y0 + (y1 - y0) * t;
      prof.push([R * 1.12, y - 0.003], [R * 1.05, y - 0.0018], [R * 1.05, y + 0.0018], [R * 1.12, y + 0.003]);
    }
    prof.push([R * 1.12, y1 - 0.003], [R * 1.02, y1], [0, y1]);
    return prof;
  };
  const parts = [hex(s.nut, nutH, nutH * 0.4, mat)];
  if (kind === 'st') {
    parts.push(S.lathe([[0, nutH * 0.8], [s.jic * 0.45, nutH * 0.8], ...ferrule(nutH * 0.8 + 0.003, E.st).slice(1)], mat, { seg: 14 }));
  } else {
    const a = kind === '45' ? Math.PI / 4 : Math.PI / 2;
    const rb = E.drop - nutH;
    const pts = [new THREE.Vector3(0, nutH * 0.7, 0), new THREE.Vector3(0, nutH, 0)];
    for (let i = 1; i <= 6; i++) {
      const t = (i / 6) * a;
      pts.push(new THREE.Vector3(rb - rb * Math.cos(t), nutH + rb * Math.sin(t), 0));
    }
    const bend = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, s.jic * 0.36, 10, false));
    parts.push(bend);
    const end = pts[pts.length - 1];
    const d = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
    parts.push(place(S.lathe(ferrule(0, E.le - rb * 0.2), mat, { seg: 14 }), end, d));
  }
  return S.merged(parts, mat);
}

function hermite(pts, T) {
  const c = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) {
    const h = pts[i].distanceTo(pts[i + 1]) * 0.39;
    c.add(new THREE.CubicBezierCurve3(pts[i], pts[i].clone().addScaledVector(T[i], h),
      pts[i + 1].clone().addScaledVector(T[i + 1], -h), pts[i + 1]));
  }
  return c;
}

/**
 * Flexible serti de longueur hors tout L (po, catalogue), taille n, entre
 * deux sièges : a / b = { p, d, end?: 'st' | '90' | '45', t? } — p siège (bout
 * du cône mâle), d direction de l'écrou vers le flexible (sortie du siège),
 * t pour un embout coudé : direction de sortie de la douille (⊥ d).
 * vias : points de passage ; sag : direction de la flèche (défaut −Y) ; les
 * points de passage (ou le milieu) s'y déplacent pour que la longueur libre
 * égale celle du catalogue. Marquage imprimé le long d'une génératrice.
 */
export function hose(L, n, a, b, { vias = [], sag = [0, -1, 0], mat = 'zinc', tans = null } = {}) {
  const E = endLen(n), R = size(n).hose / 2;
  const fit = (e) => {
    const p = v3(e.p), d = v3(e.d).normalize();
    const kind = e.end || 'st';
    let t = null;
    if (kind !== 'st') {
      t = v3(e.t || [0, 0, 1]); t.addScaledVector(d, -t.dot(d)).normalize();
    }
    const obj = place(crimpEnd(n, kind, mat), p, d, t || undefined);
    if (kind === 'st') return { obj, exit: p.clone().addScaledVector(d, E.st), dir: d, len: E.st };
    const a2 = kind === '45' ? Math.PI / 4 : Math.PI / 2;
    const dir = d.clone().multiplyScalar(Math.cos(a2)).addScaledVector(t, Math.sin(a2)).normalize();
    const rb = E.drop - size(n).nut * 0.72;
    const corner = p.clone().addScaledVector(d, size(n).nut * 0.72 + rb * Math.sin(a2)).addScaledVector(t, rb - rb * Math.cos(a2));
    return { obj, exit: corner.addScaledVector(dir, E.le - rb * 0.2), dir, len: E.drop + E.le * 0.8 };
  };
  const fa = fit(a), fb = fit(b);
  const free = L * IN - fa.len - fb.len;
  const sg = v3(sag).normalize();
  const base = vias.length ? vias.map(v3) : [fa.exit.clone().lerp(fb.exit, 0.5)];
  const nv = base.length;
  const make = (k) => {
    const pts = [fa.exit, ...base.map((p, i) => p.clone().addScaledVector(sg, k * Math.sin((Math.PI * (i + 1)) / (nv + 1)))), fb.exit];
    const T = pts.map((p, i) => {
      if (i === 0) return fa.dir.clone();
      if (i === pts.length - 1) return fb.dir.clone().negate();
      if (tans && tans[i - 1]) return v3(tans[i - 1]).normalize();
      return pts[i + 1].clone().sub(pts[i - 1]).normalize();
    });
    return hermite(pts, T);
  };
  let curve = make(0);
  if (curve.getLength() < free) {
    let lo = 0, hi = Math.max(0.2, free);
    for (let it = 0; it < 36; it++) {
      const k = (lo + hi) / 2;
      if (make(k).getLength() < free) lo = k; else hi = k;
    }
    curve = make((lo + hi) / 2);
  }
  const len = curve.getLength();
  const nSeg = Math.max(8, Math.min(140, Math.round(len / 0.025)));
  const body = S.merged([new THREE.Mesh(new THREE.TubeGeometry(curve, nSeg, R, 10, false))], 'hose');
  body.geometry.userData.edgeAngle = 70;
  const g = S.group(body, S.merged([fa.obj, fb.obj], mat));
  const lay = layline(curve, len, R);
  if (lay) g.add(lay);
  g.userData.hoseCheck = { L, free, len };
  return g;
}

// Marquage imprimé : tirets clairs le long d'une génératrice.
function layline(curve, len, R) {
  const n = Math.max(8, Math.round(len / 0.006));
  const fr = curve.computeFrenetFrames(n, false);
  const r = R + 0.0002, da = 0.0008 / r, a0 = 0.6;
  const pos = [], nor = [];
  const at = (i, a) => {
    const p = curve.getPointAt(i / n), c = Math.cos(a), sn = Math.sin(a);
    const d = fr.normals[i].clone().multiplyScalar(c).addScaledVector(fr.binormals[i], sn);
    return [p.addScaledVector(d, r), d];
  };
  for (let i = 0; i < n; i++) {
    const s0 = (i / n) * len;
    if (s0 < 0.02 || s0 > len - 0.025 || (s0 % 0.042) > 0.03) continue;
    const [p00, d00] = at(i, a0 - da), [p01, d01] = at(i, a0 + da);
    const [p10, d10] = at(i + 1, a0 - da), [p11, d11] = at(i + 1, a0 + da);
    for (const [p, d] of [[p00, d00], [p11, d11], [p10, d10], [p00, d00], [p01, d01], [p11, d11]]) {
      pos.push(p.x, p.y, p.z); nor.push(d.x, d.y, d.z);
    }
  }
  if (!pos.length) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  const m = S.merged([new THREE.Mesh(geo)], 'grey');
  m.userData.noEdges = true;
  return m;
}

// ------------------------------------------------------------------ boulonnerie

/** Vis H (diamètre d, longueur len), tête à pos, tige selon −axis (axis : vecteur). */
export function hhcs(d, len, pos, axis = [0, 1, 0], mat = MAT) {
  return place(S.bolt(d, len, mat), pos, axis);
}
/** Écrou H (ou contre-écrou mince : jam), centré à pos, axe selon axis. */
export function hexNut(d, pos, axis = [0, 1, 0], { jam = false, mat = MAT } = {}) {
  return place(S.nut(d * 1.5, d * (jam ? 0.55 : 0.86), mat), pos, axis);
}
/** Rondelle plate SAE (centrée à pos). */
export function flatWasher(d, pos, axis = [0, 1, 0], mat = MAT) {
  return place(S.washer(d * 1.1, d * 0.54, Math.max(0.0012, d * 0.16), mat), pos, axis);
}
/** Rondelle fendue (Grower) : anneau à section carrée ouvert, extrémités décalées. */
export function splitWasher(d, pos, axis = [0, 1, 0], mat = MAT) {
  const ro = d * 0.92, ri = d * 0.52, t = Math.max(0.0012, d * 0.25);
  const sh = new THREE.Shape();
  const g0 = 0.18;
  sh.absarc(0, 0, ro, g0, Math.PI * 2 - g0 * 0.3, false);
  sh.absarc(0, 0, ri, Math.PI * 2 - g0 * 0.3, g0, true);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 20 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -t / 2, 0);
  return place(S.merged([new THREE.Mesh(geo)], mat), pos, axis);
}
/**
 * Rondelles Nord-Lock (paire à cames radiales) : deux disques minces, le
 * dessus strié (rayons) ; SP = diamètre extérieur majoré. Centrées à pos.
 */
export function nordLock(d, pos, axis = [0, 1, 0], { sp = false, mat = 'zinc' } = {}) {
  const ro = d * (sp ? 1.25 : 0.95), ri = d * 0.54, t = Math.max(0.0008, d * 0.09);
  const parts = [
    S.washer(ro, ri, t, mat, { pos: [0, -t * 0.55, 0] }),
    S.washer(ro, ri, t, mat, { pos: [0, t * 0.55, 0] }),
  ];
  // Cames : petites arêtes radiales sur la face supérieure.
  const nT = 12;
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * Math.PI * 2;
    const rm = (ro + ri) / 2;
    const b = S.box(ro - ri - 0.0006, t * 0.3, 0.0005, mat, { pos: [Math.cos(a) * rm, t * 1.2, Math.sin(a) * rm] });
    b.rotation.y = -a;
    parts.push(b);
  }
  return place(S.merged(parts, mat), pos, axis);
}

// ------------------------------------------------------------------ composants

/**
 * Clapet de charge double CP47573 (« LOAD CHECK DOUBLE CHECK ») : bloc alu
 * 2 1/2 × 1 1/2 × 2 po (X × Y × Z), centre de la face inférieure à
 * l'origine. Dessus : cuvette gravée VALVE 1 / VALVE 2 / CYL 1 / CYL 2 ;
 * orifices 1/4 NPT : VALVE 1 et 2 sur la face −Z, CYL 1 et 2 sur la face +Z ;
 * bouchon de réglage six pans à fente sur la face −X ; deux trous de
 * fixation Ø 11/32 traversants (Y) aux coins (−X, +Z) et (+X, −Z).
 * userData.ports : VALVE1, VALVE2, CYL1, CYL2 (centre de l'orifice, normale
 * sortante) ; userData.holes : axes des trous de fixation.
 */
export const LCV = { x: 2.5 * IN, y: 1.5 * IN, z: 2.0 * IN };
export function loadCheckValve() {
  const { x: X, y: Y, z: Z } = LCV;
  const mat = 'castAlu';
  const hx = X / 2, hz = Z / 2;
  const holes = [[-hx + 0.35 * IN, hz - 0.35 * IN], [hx - 0.35 * IN, -hz + 0.35 * IN]];
  // Bloc : extrusion du contour XZ percé, selon Y.
  const lip = 0.06 * IN, pocket = 0.04 * IN;
  const outline = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]];
  const blk = S.extrude(outline.map(([x, z]) => [x, -z]), Y - pocket, mat, { holes: holes.map(([x, z]) => [x, -z, (11 / 64) * IN]) });
  blk.rotation.x = -Math.PI / 2;
  blk.position.y = (Y - pocket) / 2;
  // Rebord de la cuvette gravée.
  const rim = [];
  const w = lip * 2;
  rim.push(S.box(X, pocket, w, mat, { pos: [0, Y - pocket / 2, -hz + w / 2] }));
  rim.push(S.box(X, pocket, w, mat, { pos: [0, Y - pocket / 2, hz - w / 2] }));
  rim.push(S.box(w, pocket, Z - 2 * w, mat, { pos: [-hx + w / 2, Y - pocket / 2, 0] }));
  rim.push(S.box(w, pocket, Z - 2 * w, mat, { pos: [hx - w / 2, Y - pocket / 2, 0] }));
  // Lettres gravées suggérées : traits fins en relief léger dans la cuvette.
  const ink = [];
  const word = (x0, z0, n, rot) => {
    for (let i = 0; i < n; i++) {
      const b = S.box(0.006, 0.0004, 0.0012, 'darkSteel', { pos: [x0 + Math.cos(rot) * i * 0.0075, Y - pocket + 0.0002, z0 + Math.sin(rot) * i * 0.0075] });
      b.rotation.y = -rot;
      ink.push(b);
    }
  };
  word(-hx + 0.012, -hz + 0.012, 6, 0); word(-hx + 0.012, hz - 0.016, 6, 0);
  word(hx - 0.012, -hz + 0.02, 3, Math.PI / 2);
  const ports = {
    VALVE1: { p: new THREE.Vector3(-0.55 * IN, Y / 2, -hz), d: new THREE.Vector3(0, 0, -1) },
    VALVE2: { p: new THREE.Vector3(0.55 * IN, Y / 2, -hz), d: new THREE.Vector3(0, 0, -1) },
    CYL1: { p: new THREE.Vector3(-0.55 * IN, Y / 2, hz), d: new THREE.Vector3(0, 0, 1) },
    CYL2: { p: new THREE.Vector3(0.55 * IN, Y / 2, hz), d: new THREE.Vector3(0, 0, 1) },
  };
  // Lamages des orifices (anneaux en légère saillie, alésage sombre).
  const spots = Object.values(ports).map(({ p, d }) => place(S.ring(0.3 * IN, 0.2 * IN, 0.0008, mat, { seg: 20 }), p.clone().addScaledVector(d, 0.0004), d));
  const bores = Object.values(ports).map(({ p, d }) => place(S.cyl(0.2 * IN, 0.0012, 'blackOxide', { seg: 16 }), p.clone().addScaledVector(d, -0.0004), d));
  // Bouchon de réglage (face −X) : six pans 3/4 et vis à fente.
  const plug = S.group(
    S.nut(0.75 * IN, 0.008, 'steel', { pos: [0, 0.004, 0] }),
    S.cyl(0.18 * IN, 0.006, 'steel', { seg: 16, pos: [0, 0.009, 0] }),
    S.box(0.36 * IN, 0.0012, 0.0012, 'blackOxide', { pos: [0, 0.0121, 0] }),
  );
  const g = S.group(
    S.merged([blk, ...rim, ...spots], mat), S.merged(bores, 'blackOxide'), S.merged(ink, 'darkSteel'),
    place(plug, [-hx, Y * 0.45, -0.1 * IN], [-1, 0, 0]),
  );
  g.userData.ports = ports;
  g.userData.holes = holes.map(([x, z]) => new THREE.Vector3(x, 0, z));
  return g;
}

/**
 * Clapet d'équilibrage CX000252 (cartouche vissée dans un corps alu) : corps
 * 55 (X) × 64 (Y) × 31.75 (Z, 1 1/4 po) mm, centre du corps à l'origine. Face
 * +Z gravée « 2 » (près de −X), « 1 » (dessous) et « 3 » ; orifices SAE-6 :
 * 1 dessous (−Y), 2 sur la face −X, 3 sur la face +X ; cartouche par le
 * dessus : six pans 1 1/8 po et chapeau cylindrique Ø 1 po ; deux trous Ø 9/32
 * selon Z près du bas (vis d'assemblage des corps empilés). userData.ports :
 * '1', '2', '3' ; userData.holes : axes des trous (z = 0).
 */
export const CBV = { x: 0.055, y: 0.064, z: 1.25 * IN };
export function counterbalanceValve() {
  const { x: X, y: Y, z: Z } = CBV;
  const mat = 'castAlu';
  const holes = [[-0.019, -0.022], [0.019, -0.022]];
  const blk = S.extrude([[-X / 2, -Y / 2], [X / 2, -Y / 2], [X / 2, Y / 2], [-X / 2, Y / 2]], Z, mat, { holes: holes.map(([x, y]) => [x, y, (9 / 64) * IN]) });
  const ports = {
    1: { p: new THREE.Vector3(0, -Y / 2, 0.002), d: new THREE.Vector3(0, -1, 0) },
    2: { p: new THREE.Vector3(-X / 2, 0.004, 0), d: new THREE.Vector3(-1, 0, 0) },
    3: { p: new THREE.Vector3(X / 2, 0.004, 0), d: new THREE.Vector3(1, 0, 0) },
  };
  const spots = Object.values(ports).map(({ p, d }) => place(S.ring(0.4 * IN, 0.28 * IN, 0.0008, mat, { seg: 20 }), p.clone().addScaledVector(d, 0.0004), d));
  // Chiffres gravés (traits en léger relief) sur la face +Z.
  const ink = [];
  const digit = (x, y, strokes) => strokes.forEach(([dx, dy, w, h]) => ink.push(S.box(w, h, 0.0005, 'darkSteel', { pos: [x + dx, y + dy, Z / 2 + 0.0002] })));
  digit(0, -0.019, [[0, 0, 0.0011, 0.008]]);
  digit(-0.02, 0.0, [[0, 0.0035, 0.005, 0.0011], [0.0019, 0.0018, 0.0011, 0.0035], [0, 0, 0.005, 0.0011], [-0.0019, -0.0018, 0.0011, 0.0035], [0, -0.0035, 0.005, 0.0011]]);
  digit(0.02, 0.0, [[0, 0.0035, 0.005, 0.0011], [0.0019, 0, 0.0011, 0.008], [0, 0, 0.004, 0.0011], [0, -0.0035, 0.005, 0.0011]]);
  const cart = S.group(
    S.nut(1.125 * IN, 0.016, 'steel', { pos: [0, 0.008, 0] }),
    S.lathe([[0, 0.016], [0.0125, 0.016], [0.0128, 0.018], [0.0128, 0.074], [0.0115, 0.076], [0, 0.076]], 'steel', { seg: 28 }),
  );
  const g = S.group(S.merged([blk, ...spots], mat), S.merged(ink, 'darkSteel'), at(cart, [0, Y / 2, 0]));
  g.userData.ports = ports;
  g.userData.holes = holes.map(([x, y]) => new THREE.Vector3(x, y, 0));
  return g;
}

function at(obj, pos) { obj.position.set(...pos); return obj; }

/**
 * Deux clapets CX000252 empilés selon −Z (corps L de z = 0 à −CBV.z, corps U
 * derrière), centres à la hauteur y0, faces gravées vers −Z, orifices 2 vers
 * +X, 3 vers −X, 1 dessous. Retourne [{ obj, ports: { 1, 2, 3 : { p, d } },
 * holes: [Vector3] }] dans le repère du parent.
 */
export function cbvStack(y0 = 0) {
  return [0, 1].map((k) => {
    const v = counterbalanceValve();
    const g = place(v, [0, y0, -CBV.z * (k + 0.5)], [0, 1, 0], [-1, 0, 0]);
    const tr = (pt) => ({ p: pt.p.clone().applyQuaternion(g.quaternion).add(g.position), d: pt.d.clone().applyQuaternion(g.quaternion) });
    const ports = {};
    for (const n of ['1', '2', '3']) ports[n] = tr(v.userData.ports[n]);
    return { obj: g, ports, holes: v.userData.holes.map((h) => h.clone().applyQuaternion(g.quaternion).add(g.position)) };
  });
}

/**
 * Platine d'attache anti-fouet 2 po (CX030490, « ASSY, WHIP CHECK MOUNT
 * 2.0" ») : tôle 1/4 po en goutte percée Ø 2 3/8 po (enfilée sur le filetage
 * 2 po), deux oreilles et leurs manilles. Plan XY, trou centré à l'origine,
 * oreilles vers +Y, épaisseur selon Z (centrée).
 */
export function whipCheckMount() {
  const r2 = (2.375 * IN) / 2;
  const pts = [];
  for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI; pts.push([Math.cos(a) * 0.055, Math.sin(a) * 0.055]); }
  pts.push([0.055, 0.03], [0.04, 0.085], [0.015, 0.085], [0.01, 0.06], [-0.01, 0.06], [-0.015, 0.085], [-0.04, 0.085], [-0.055, 0.03]);
  const parts = [S.extrude(pts, 0.25 * IN, 'zinc', { holes: [[0, 0, r2 + 0.001], [0.0275, 0.073, 0.005], [-0.0275, 0.073, 0.005]] })];
  for (const x of [-0.0275, 0.0275]) {
    parts.push(at(S.torus(0.012, 0.0028, 'zinc', { axis: 'x' }), [x, 0.085, 0]));
    parts.push(at(S.cyl(0.003, 0.03, 'zinc', { axis: 'z', seg: 10 }), [x, 0.075, 0]));
    parts.push(at(S.cyl(0.0045, 0.004, 'zinc', { axis: 'z', seg: 10 }), [x, 0.075, 0.015]));
  }
  return S.group(S.merged(parts, 'zinc'));
}
