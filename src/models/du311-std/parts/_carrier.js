// Assistants du lot « porteur » du DU311 s/n 10703 (P292 et ses composants,
// P194) : quincaillerie légère en pouces (vis H, écrous, rondelles plates,
// fendues et Nord-Lock), raccords JIC / ORB allégés, croisillons de cardan
// série 1410, roue 12.00-20, et le stabilisateur à jambe télescopique commun
// aux montages gauche (P316) et droit (P324). Fichier préfixé « _ » : non
// inscrit comme assemblage.
// Pièces construites le long de +Y local (tête de vis en haut, dessous de tête
// à y = 0), placées ensuite par put() ; cotes en pouces converties en mètres.
// Quincaillerie Gr 8 zinguée (« ZNC ») en 'zinc'.
import { AXLE, WHEEL, M } from '../layout.js';

export const IN = 0.0254;
export const u = (v) => v * IN;
const Y = [0, 1, 0];

/** Profil de révolution en pouces [r, y] → lathe en mètres. */
export function L(S, pts, mat = 'steel', seg = 24, opts = {}) {
  return S.lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
}

/** Oriente l'objet (son +Y local sur dir) et le place en pos (m). */
export function put(THREE, obj, pos, dir = Y, spin = 0) {
  const d = new THREE.Vector3(...dir).normalize();
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  if (spin) obj.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin));
  obj.position.set(...pos);
  return obj;
}

/** Objet enveloppé dans un groupe orienté (+Y sur dir) et placé. */
export function along(THREE, obj, pos, dir = Y, spin = 0) {
  const g = new THREE.Group();
  g.add(obj);
  return put(THREE, g, pos, dir, spin);
}

// Surplats (po) des têtes H et écrous.
const AF = { 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.4375: 0.625, 0.5: 0.75, 0.5625: 0.875, 0.625: 0.9375, 0.75: 1.125, 1: 1.5, 1.5: 2.25 };
export const af = (d) => AF[d] ?? d * 1.5;

/** Prisme hexagonal (po) de y0 à y0 + h, surplat a, chanfrein 30° du dessus, percé r0. */
function hexLathe(S, a, h, y0, r0, mat) {
  const R = a / 2 / Math.cos(Math.PI / 6);
  const c = Math.min(a * 0.06, h * 0.25);
  const side = [[R, y0], [R, y0 + h - c * 0.6], [R - c, y0 + h]];
  const m = L(S, r0 > 0 ? [[r0, y0], ...side, [r0, y0 + h], [r0, y0]] : [[0, y0], ...side, [0, y0 + h]], mat, 6);
  m.children[0].rotation.y = Math.PI / 6;
  return m;
}

/**
 * Vis à tête hexagonale (po) : tête vers +Y, dessous de tête à y = 0, tige
 * jusqu'à -len, deux sillons de filet suggérés au bout. Un seul maillage.
 */
export function hb(S, d, len, mat = 'zinc', seg = 8) {
  const r = d / 2, a = af(d), hh = d * 0.64;
  const t = Math.min(len * 0.45, d * 1.6);
  const prof = [[0, -len], [r * 0.82, -len], [r, -len + r * 0.18]];
  for (let k = 1; k <= 2; k++) { const y = -len + (t * k) / 3; prof.push([r, y - d * 0.05], [r * 0.9, y], [r, y + d * 0.05]); }
  prof.push([r, 0], [0, 0]);
  return S.merged([
    hexLathe(S, a, hh, d * 0.04, 0, mat),
    L(S, [[0, 0], [a * 0.47, 0], [a * 0.47, d * 0.04], [0, d * 0.04]], mat, 12),
    L(S, prof, mat, seg),
  ], mat);
}

/** Vis H métrique (mm) : même construction que hb. */
export function hbm(S, dmm, lenmm, mat = 'zinc') {
  const AFm = { 12: 18, 14: 22, 16: 24 };
  const k = 1 / 25.4;
  const d = dmm * k, len = lenmm * k, a = (AFm[dmm] ?? dmm * 1.5) * k;
  const r = d / 2, hh = d * 0.64;
  return S.merged([
    hexLathe(S, a, hh, d * 0.04, 0, mat),
    L(S, [[0, 0], [a * 0.47, 0], [a * 0.47, d * 0.04], [0, d * 0.04]], mat, 12),
    L(S, [[0, -len], [r * 0.82, -len], [r, -len + r * 0.18], [r, -len * 0.55], [r * 0.9, -len * 0.5], [r, -len * 0.45], [r, 0], [0, 0]], mat, 8),
  ], mat);
}

/** Écrou H (po) de y = 0 à h (jam : contre-écrou mince). */
export function nt(S, d, { mat = 'zinc', jam = false, h } = {}) {
  return S.merged([hexLathe(S, af(d), h ?? d * (jam ? 0.56 : 0.86), 0, d * 0.42, mat)], mat);
}

/** Écrou à freinage nylon (po) : six-pans puis bague blanche, de y = 0 à 1,05 d. */
export function nyloc(S, THREE, d, { mat = 'zinc' } = {}) {
  const a = af(d), h1 = d * 0.72, h = d * 1.05;
  const g = new THREE.Group();
  g.add(S.merged([
    hexLathe(S, a, h1, 0, d * 0.42, mat),
    L(S, [[d * 0.42, h1], [a * 0.47, h1], [a * 0.44, h - d * 0.05], [a * 0.38, h], [d * 0.42, h], [d * 0.42, h1]], mat, 12),
  ], mat));
  g.add(L(S, [[d * 0.43, h1 + d * 0.03], [a * 0.36, h1 + d * 0.03], [a * 0.36, h - d * 0.03], [d * 0.43, h - d * 0.03], [d * 0.43, h1 + d * 0.03]], 'white', 12));
  return g;
}

/** Épaisseurs (po) des rondelles. */
export const T_FW = (d) => (d <= 0.25 ? 0.065 : d <= 0.375 ? 0.065 : d <= 0.625 ? 0.095 : 0.134);
export const T_SW = (d) => Math.max(0.062, d * 0.25);
export const T_NL = (d) => Math.max(0.06, d * 0.13) * 2;

/** Rondelle plate SAE (po) de y = 0 à t. */
export function fw(S, d, { mat = 'zinc', od, t, seg = 14 } = {}) {
  const ro = (od ?? d * 2.0) / 2, th = t ?? T_FW(d);
  return L(S, [[d * 0.54, 0], [ro, 0], [ro, th], [d * 0.54, th], [d * 0.54, 0]], mat, seg);
}

/** Rondelle fendue (Grower, po) : coupure en biais, de y = 0 à t. */
export function sw(S, d, { mat = 'zinc' } = {}) {
  const t = u(T_SW(d));
  return S.slotted(u(d * 0.86), u(d * 0.53), 0, t, [{ a: 0.4, w: 0.12, y0: 0, y1: t }], mat, { seg: 14 });
}

/** Paire de rondelles autobloquantes à cames (Nord-Lock, po), de y = 0 à 2 t. */
export function nl(S, d, { mat = 'zinc' } = {}) {
  const t = T_NL(d) / 2, ro = d * 0.82, ri = d * 0.53;
  const g = [L(S, [[ri, 0], [ro, 0], [ro, t * 0.92], [ri, t * 0.92], [ri, 0]], mat, 14),
    L(S, [[ri, t * 1.04], [ro, t * 1.04], [ro, 2 * t], [ri, 2 * t], [ri, t * 1.04]], mat, 14)];
  return S.merged(g, mat);
}

/** Bouchon ORB à six-pans creux (po, n° de taille dash) : tête de y = 0 à +Y, queue vers -Y, torique. */
export function orbPlug(S, THREE, dash = 6, { mat = 'zinc' } = {}) {
  const r = { 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531, 16: 0.656 }[dash] ?? dash / 32;
  const R = r * 1.5, h = r * 0.62, hx = r * 0.55 / Math.cos(Math.PI / 6);
  const g = new THREE.Group();
  g.add(S.merged([
    L(S, [[hx, h * 0.3], [hx, h], [R - 0.02, h], [R, h - 0.02], [R, 0], [0, 0], [0, h * 0.3]].reverse(), mat, 14),
    L(S, [[0, h * 0.3], [hx, h * 0.3], [hx, h], [0, h]].reverse(), mat, 6),
    L(S, [[0, -r * 1.3], [r * 0.85, -r * 1.3], [r, -r * 1.15], [r, -0.1], [r * 0.9, -0.08], [r * 0.9, 0], [0, 0]], mat, 10),
  ], mat));
  g.add(L(S, [[r * 0.92, -0.075], [r * 1.08, -0.075], [r * 1.08, -0.01], [r * 0.92, -0.01], [r * 0.92, -0.075]], 'rubber', 12));
  return g;
}

const RJ = { 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531, 16: 0.656 };

/** Nez JIC 37° (po) de y0 vers +Y : gorge, filet, cône. */
function jicNose(S, rj, y0, mat, seg = 10) {
  return L(S, [[0, y0], [rj * 0.8, y0], [rj * 0.8, y0 + 0.06], [rj, y0 + 0.1], [rj, y0 + rj * 0.7], [rj * 0.93, y0 + rj * 0.85], [rj, y0 + rj], [rj, y0 + rj * 1.5],
    [rj * 0.7, y0 + rj * 1.9], [rj * 0.45, y0 + rj * 1.9], [0, y0 + rj * 1.9]], mat, seg);
}

/** Queue ORB (po) sous y = 0 : filet droit, collet, torique. */
function orbTail(S, ro, mat, seg = 10) {
  return [
    L(S, [[0, -ro * 1.5], [ro * 0.85, -ro * 1.5], [ro, -ro * 1.35], [ro, -ro * 0.7], [ro * 0.93, -ro * 0.6], [ro, -ro * 0.5], [ro, -0.12], [ro * 0.88, -0.1], [ro * 0.88, 0], [0, 0]], mat, seg),
  ];
}

/**
 * Raccord droit ORB mâle → JIC mâle (FA01055) le long de +Y : queue ORB sous
 * y = 0 (torique), six-pans, nez JIC 37°. dash : ORB ; jd : JIC (réduction).
 */
export function jicStraight(S, THREE, dash = 6, jd = dash, { mat = 'zinc', metric } = {}) {
  const rj = RJ[jd] ?? jd / 32, ro = metric ? metric / 50.8 : RJ[dash] ?? dash / 32;
  const a = Math.max(rj, ro) * 2.5 + 0.06, hh = a * 0.45;
  const g = new THREE.Group();
  g.add(S.merged([hexLathe(S, a, hh, 0, 0, mat), jicNose(S, rj, hh, mat), ...orbTail(S, ro, mat)], mat));
  g.add(L(S, [[ro * 0.95, -0.09], [ro * 1.12, -0.09], [ro * 1.12, -0.02], [ro * 0.95, -0.02], [ro * 0.95, -0.09]], 'rubber', 12));
  return g;
}

/**
 * Coude ORB → JIC (FA01052 90°, FA01051 45°) : queue ORB sous y = 0, contre-
 * écrou et bague, corps forgé, nez JIC incliné de angle (rad) vers +X.
 */
export function jicElbow(S, THREE, dash = 12, jd = dash, { mat = 'zinc', angle = Math.PI / 2 } = {}) {
  const rj = RJ[jd] ?? jd / 32, ro = RJ[dash] ?? dash / 32;
  const a = Math.max(rj, ro) * 2.4 + 0.06;
  const B = Math.max(rj, ro) * 1.9 + 0.1; // hauteur du coude
  const parts = [
    hexLathe(S, a * 1.05, a * 0.32, 0, ro * 0.95, mat), // contre-écrou
    L(S, [[0, a * 0.32], [a * 0.42, a * 0.32], [a * 0.42, B], [a * 0.36, B + a * 0.22], [0, B + a * 0.22]], mat, 12),
    ...orbTail(S, ro, mat),
  ];
  const arm = new THREE.Group();
  arm.add(S.merged([L(S, [[0, 0], [a * 0.38, 0], [a * 0.38, a * 0.55], [0, a * 0.55]], mat, 12), jicNose(S, rj, a * 0.55, mat)], mat));
  arm.position.y = u(B);
  arm.rotation.z = -angle;
  parts.push(arm);
  const g = new THREE.Group();
  g.add(S.merged(parts, mat));
  g.add(L(S, [[ro * 0.95, -0.09], [ro * 1.12, -0.09], [ro * 1.12, -0.02], [ro * 0.95, -0.02], [ro * 0.95, -0.09]], 'rubber', 12));
  return g;
}

/**
 * Té JIC : queue (ORB, ou écrou tournant JIC femelle si swivel) sous y = 0,
 * corps forgé, nez JIC vers +Y (sauf branch) et vers ±X (deux sorties latérales
 * si run, une seule si branch).
 */
export function jicTee(S, THREE, dash = 6, { mat = 'zinc', swivel = false, branch = false } = {}) {
  const rj = RJ[dash] ?? dash / 32;
  const a = rj * 2.6 + 0.06, B = rj * 2.2 + 0.1;
  const parts = [L(S, [[0, 0], [a * 0.45, 0], [a * 0.45, B * 1.25], [0, B * 1.25]], mat, 12)];
  if (swivel) parts.push(hexLathe(S, a * 1.1, rj * 1.7, -rj * 1.7, rj * 0.75, mat));
  else parts.push(hexLathe(S, a, a * 0.3, -a * 0.3, 0, mat), ...orbTail(S, rj, mat).map((m) => { m.position.y = -u(a * 0.3); return m; }));
  if (!branch) parts.push(jicNose(S, rj, B * 1.25, mat));
  for (const s of branch ? [1, -1] : [1, -1]) {
    if (branch && s < 0) continue;
    const arm = new THREE.Group();
    arm.add(S.merged([L(S, [[0, 0], [a * 0.4, 0], [a * 0.4, a * 0.5], [0, a * 0.5]], mat, 10), jicNose(S, rj, a * 0.5, mat)], mat));
    arm.position.y = u(B * 0.62);
    arm.rotation.z = -s * Math.PI / 2;
    parts.push(arm);
  }
  if (branch) {
    const arm = new THREE.Group();
    arm.add(S.merged([L(S, [[0, 0], [a * 0.4, 0], [a * 0.4, a * 0.5], [0, a * 0.5]], mat, 10), jicNose(S, rj, a * 0.5, mat)], mat));
    arm.position.y = u(B * 0.62);
    arm.rotation.z = Math.PI / 2;
    parts.push(arm);
  }
  return S.merged(parts, mat);
}

/**
 * Pose une vis dans un trou et l'empile : pos = point de la face côté tête,
 * dir = normale sortante côté tête, grip = épaisseur serrée (m) ; head =
 * rondelles sous la tête [[repère, sorte]], tail = rondelles puis écrou côté
 * opposé. Sortes : 'fw' plate, 'sw' fendue, 'nl' Nord-Lock, 'nut', 'jam',
 * 'nyloc'. Chaque pièce est enregistrée sous son repère, éclatée dans l'axe.
 */
export function bolted(api, { pos, dir, grip = 0, d, len, ref, metric, head = [], tail = [], k = 0.05, spin = 0, mat = 'zinc' }) {
  const { THREE, S } = api;
  const n = new THREE.Vector3(...dir).normalize();
  const p0 = new THREE.Vector3(...pos);
  const at = (s) => p0.clone().addScaledVector(n, s).toArray();
  const ex = (s) => n.clone().multiplyScalar(s).toArray();
  const thick = (kind) => u(kind === 'fw' ? T_FW(d) : kind === 'sw' ? T_SW(d) : kind === 'nl' ? T_NL(d) : 0);
  const make = (kind) => (kind === 'fw' ? fw(S, d) : kind === 'sw' ? sw(S, d) : kind === 'nl' ? nl(S, d)
    : kind === 'nyloc' ? nyloc(S, THREE, d) : nt(S, d, { jam: kind === 'jam' }));
  let s = 0;
  const out = [];
  head.forEach(([r, kind], i) => {
    out.push(api.part(r, put(THREE, make(kind), at(s), dir, spin), ex(k * (1.3 + i * 0.2))));
    s += thick(kind);
  });
  if (ref) out.push(api.part(ref, put(THREE, metric ? hbm(S, metric[0], metric[1], mat) : hb(S, d, len, mat), at(s), dir, spin), ex(k * 1.8)));
  const nd = n.clone().negate().toArray();
  let t = -grip;
  tail.forEach(([r, kind], i) => {
    const obj = make(kind);
    out.push(api.part(r, put(THREE, obj, at(t), nd, spin), ex(-k * (1.3 + i * 0.25))));
    t -= kind === 'nut' || kind === 'jam' ? u(d * 0.86) : kind === 'nyloc' ? u(d * 1.05) : thick(kind);
  });
  return out;
}

// ------------------------------------------------------------------ cardans série 1410

/** Cardan 1410 : croisillon (axes ±X et ±Z dans le plan perpendiculaire à Y), bols Ø 1 3/16 po, envergure 4 3/16 po. */
export const UJ = { cap: 1.1875, span: 4.1875, tube: 3.5 };
export function cross1410(S, THREE, { mat = 'steel' } = {}) {
  const g = [];
  const half = UJ.span / 2, rc = UJ.cap / 2;
  for (const [ax, sg] of [['x', 1], ['x', -1], ['z', 1], ['z', -1]]) {
    const cap = L(S, [[0, half - 0.62], [rc, half - 0.62], [rc, half - 0.05], [rc - 0.05, half], [0, half]], 'steel', 14);
    const obj = new THREE.Group();
    obj.add(cap);
    if (ax === 'x') obj.rotation.z = -sg * Math.PI / 2; else obj.rotation.x = sg * Math.PI / 2;
    g.push(obj);
  }
  const body = S.merged([
    L(S, [[0, -half + 0.6], [0.42, -half + 0.6], [0.42, half - 0.6], [0, half - 0.6]], mat, 10, { axis: 'x' }),
    L(S, [[0, -half + 0.6], [0.42, -half + 0.6], [0.42, half - 0.6], [0, half - 0.6]], mat, 10, { axis: 'z' }),
    S.box(u(1.05), u(1.05), u(1.05), mat),
  ], mat);
  return group2(THREE, [S.merged(g, 'steel'), body]);
}

function group2(THREE, list) {
  const g = new THREE.Group();
  list.forEach((o) => g.add(o));
  return g;
}

/**
 * Chape de cardan 1410 (po) le long de +Y : moyeu (Ø hub) de y = 0 à yb, deux
 * oreilles dont les alésages (axe X) sont centrés en y = ye. Oreilles en ±X.
 */
export function yoke1410(S, THREE, { hub = 2.6, yb = 1.4, ye = 2.6, mat = 'steel', flange = 0 } = {}) {
  const half = UJ.span / 2;
  const ear = (sx) => {
    const pts = [[-0.95, 0], [0.95, 0], [0.95, 0.9], [0.62, 1.55], [0, 1.85], [-0.62, 1.55], [-0.95, 0.9]];
    const m = S.extrude(pts.map(([x, y]) => [u(x), u(y)]), u(0.55), mat, { holes: [[0, u(1.0), u(UJ.cap / 2)]] });
    const o = new THREE.Group();
    o.add(m);
    o.rotation.y = Math.PI / 2;
    o.position.set(sx * u(half - 0.42), u(ye - 1.0), 0);
    return o;
  };
  const list = [L(S, [[0, 0], [hub / 2, 0], [hub / 2, yb], [half - 0.15, yb + 0.25], [half - 0.15, yb + 0.55], [0, yb + 0.55]], mat, 18), ear(1), ear(-1)];
  if (flange) list.push(L(S, [[0, 0], [flange / 2, 0], [flange / 2, 0.45], [0, 0.45]], mat, 20));
  return S.merged(list, mat);
}

// ------------------------------------------------------------------ roue 12.00-20

/**
 * Pneu 12.00-20 à crampons en chevrons sur jante 20 po à cercle de verrouillage,
 * voile à 10 trous de goujon (écrous sur les goujons du moyeu) et valve. Axe
 * selon Z, centre de la roue à l'origine ; side = +1 : voile côté -Z (la roue
 * droite a son voile vers l'intérieur, -Z), -1 : côté +Z.
 */
export function wheel1200(api, { side = 1 } = {}) {
  const { THREE, S } = api;
  const R = WHEEL.r, W = WHEEL.w;
  const g = new THREE.Group();
  // Carcasse : flancs bombés, épaulements arrondis, bande de roulement
  const h = W / 2, rb = 0.262;
  const prof = [[rb, -0.092], [0.29, -0.118], [0.34, -0.143], [0.4, -h], [0.46, -h * 0.98], [0.5, -h * 0.9], [0.518, -h * 0.77], [0.528, -h * 0.58]];
  const full = [...prof, ...prof.slice().reverse().map(([r, z]) => [r, -z])];
  g.add(S.lathe([[rb - 0.004, -0.092], ...full, [rb - 0.004, 0.092], [rb - 0.004, -0.092]], 'rubber', { axis: 'z', seg: 56 }));
  // Crampons en chevrons : deux rangées décalées, inclinées de ±28°, hauts de 32 mm
  const lugs = [];
  const n = 22, hl = R - 0.522;
  const lugShape = new THREE.Shape();
  const lw = 0.05, ll = 0.15;
  lugShape.moveTo(-lw / 2, 0); lugShape.lineTo(lw / 2, 0); lugShape.lineTo(lw / 2 + 0.035, ll); lugShape.lineTo(-lw / 2 + 0.035, ll); lugShape.closePath();
  const lugGeo = new THREE.ExtrudeGeometry(lugShape, { depth: hl, bevelEnabled: false });
  for (let i = 0; i < n; i++) {
    for (const s of [1, -1]) {
      const a = ((i + (s > 0 ? 0 : 0.5)) / n) * Math.PI * 2;
      const m = new THREE.Mesh(lugGeo);
      // forme dans le plan (tangentiel, axial), extrudée radialement
      const o = new THREE.Group();
      m.rotation.set(-Math.PI / 2, 0, 0); // extrusion (Z) → +Y radial
      m.position.set(0, 0.522, 0);
      const inner = new THREE.Group();
      inner.add(m);
      inner.scale.set(1, 1, s);
      inner.position.z = -s * 0.006;
      o.add(inner);
      o.rotation.z = a - Math.PI / 2;
      lugs.push(o);
    }
  }
  g.add(S.merged(lugs, 'rubber'));
  // Jante : talons, sièges, base creuse, rebords ; cercle de verrouillage côté extérieur
  const rr = 0.2665, wr = 0.108;
  g.add(S.lathe([
    [0.236, -wr + 0.012], [rr - 0.004, -wr], [rr + 0.03, -wr - 0.004], [rr + 0.034, -wr + 0.008], [rr + 0.006, -wr + 0.016],
    [rr - 0.004, -wr + 0.04], [0.238, -wr + 0.05], [0.238, wr - 0.03], [rr - 0.004, wr - 0.02], [rr + 0.006, wr - 0.012],
    [rr + 0.034, wr - 0.008], [rr + 0.03, wr + 0.004], [rr - 0.004, wr], [0.236, wr - 0.012], [0.232, wr - 0.03], [0.232, -wr + 0.03], [0.236, -wr + 0.012],
  ], 'lightGrey', { axis: 'z', seg: 48 }));
  g.add(at2(S.lathe([[rr - 0.006, -0.006], [rr + 0.008, -0.006], [rr + 0.008, 0.006], [rr - 0.006, 0.006], [rr - 0.006, -0.006]], 'lightGrey', { axis: 'z', seg: 40 }), [0, 0, side * (wr - 0.022)]));
  // Voile : disque embouti à 10 trous de goujon Ø 26 mm (cercle 335 mm), 6 aérations, alésage central
  const zd = -side * 0.055;
  const holes = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; holes.push([Math.cos(a) * 0.1675, Math.sin(a) * 0.1675, 0.013]); }
  for (let i = 0; i < 6; i++) { const a = ((i + 0.5) / 6) * Math.PI * 2; holes.push([Math.cos(a) * 0.205, Math.sin(a) * 0.205, 0.024]); }
  const disc = S.extrude(ring2D(0.236, 64), 0.016, 'lightGrey', { holes: [[0, 0, 0.11], ...holes] });
  disc.position.z = zd;
  g.add(disc);
  // goujons et écrous de roue (côté extérieur du voile), valve de gonflage
  const nuts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const nut = S.merged([hexLathe(S, 1.25, 0.95, 0.31, 0, 'zinc'), L(S, [[0, 0], [0.63, 0], [0.6, 0.31], [0, 0.31]], 'zinc', 10), L(S, [[0, 1.26], [0.3, 1.26], [0.3, 1.65], [0.24, 1.72], [0, 1.72]], 'zinc', 8)], 'zinc');
    put(THREE, nut, [Math.cos(a) * 0.1675, Math.sin(a) * 0.1675, zd + side * 0.008], [0, 0, side]);
    nuts.push(nut);
  }
  g.add(S.merged(nuts, 'zinc'));
  const valve = S.merged([L(S, [[0, 0], [0.2, 0], [0.2, 0.9], [0.14, 1.0], [0.14, 1.3], [0, 1.3]], 'brass', 8)], 'brass');
  put(THREE, valve, [0, 0.236, side * 0.02], [0, -0.3, side]);
  g.add(valve);
  return g;
}

function at2(o, p) { o.position.set(...p); return o; }

/** Contour circulaire (pour extrude). */
export function ring2D(r, n = 48) {
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });
}

// ------------------------------------------------------------------ stabilisateur (P316 / P324)

/**
 * Stabilisateur à jambe télescopique (montages gauche P316 et droit P324),
 * relevé sur la coupe de la trousse de jambe (page 322, échelle de la tige
 * Ø 2 po), la vue isométrique (page 316) et la coupe A-A (page 194) :
 * fût Ø 5 × 4 1/2 po soudé tangent à une platine 9 × 14 5/8 × 3/4 po (deux
 * colonnes de 7 trous Ø 11/16 au pas de 2,21 po pour 14 vis 5/8-11), gousset,
 * bossage du détecteur de proximité, bouchon de purge et graisseur ; tige
 * creuse fixe Ø 2 po (tube central d'alimentation) et piston fixe en bas ;
 * jambe mobile Ø 4 1/2 × 4 po (presse-étoupe en haut, fond et patin Ø 8 po
 * à trois ergots en bas). Course 15 po.
 * Repère commun (ST) : origine sur l'axe, face supérieure du fût (dessous du
 * bloc de valves), Y vers le haut ; platine du côté pz (−1 : -Z, montage
 * gauche P316 posé à droite de la machine ; +1 : +Z, montage droit P324),
 * largeur de la platine selon X ; bossage du détecteur vers -X.
 */
export const ST = {
  barrel: { ro: 2.5, ri: 2.25, y0: -21.8, y1: -0.45 }, // po
  plate: { w: 9, t: 0.75, y0: -12.15, y1: 2.45, hx: 3.72, hy0: 1.82, pitch: 2.21 },
  leg: { ro: 2.25, ri: 2.0, top: -1.5, bot: -23.2 },
  pad: { r: 4.0, t: 0.75 },
  rod: 1.0, // rayon de la tige
  stroke: 15,
  sensorY: -4.2,
  block: 3.2, // hauteur du bloc de valves (P320)
};
/** Bas du patin (m), jambe rentrée, dans le repère ST. */
export const ST_PAD_BOTTOM = u(ST.leg.bot - ST.pad.t);
/** Trous de la platine (m) : [x, y] ; la face d'appui est en z = pz·(2,5 + 0,75) po. */
export function stPlateHoles() {
  const out = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 7; k++) out.push([sx * u(ST.plate.hx), u(ST.plate.hy0 - k * ST.plate.pitch)]);
  return out;
}
/** Orifices R et E du bloc de valves (repère ST, côté opposé à la platine) : positions et direction. */
export function stPorts(pz) {
  return [-0.7, 0.7].map((x) => ({ pos: [u(x), u(1.55), -pz * u(1.5)], dir: [0, 0, -pz] }));
}
/** Hauteur (m) du dessus du fût au-dessus du sol, patin au sol, jambe sortie de ext (m). */
export const stTop = (ext) => -ST_PAD_BOTTOM + ext;

/**
 * Corps du stabilisateur (repère ST) : renvoie { barrel, rod, leg } (fût soudé
 * et platine fixes, tige et piston fixes, jambe mobile sortie de ext m), sans
 * les joints (P322) ni le bloc de valves (P320 / P318).
 */
export function outriggerBody(api, { pz = -1, ext = 0 } = {}) {
  const { THREE, S } = api;
  const B = ST.barrel, Pl = ST.plate, Lg = ST.leg;
  const zP = pz * (B.ro + Pl.t / 2); // milieu de la platine
  // fût soudé : tube, chapeau, platine percée, gousset, bossage du détecteur, purge, graisseur
  const holes = stPlateHoles().map(([x, y]) => [x, y - u((Pl.y0 + Pl.y1) / 2), u(11 / 32)]);
  const plate = S.extrude([[-u(Pl.w / 2), -u((Pl.y1 - Pl.y0) / 2)], [u(Pl.w / 2), -u((Pl.y1 - Pl.y0) / 2)], [u(Pl.w / 2), u((Pl.y1 - Pl.y0) / 2)], [-u(Pl.w / 2), u((Pl.y1 - Pl.y0) / 2)]], u(Pl.t), 'lightGrey', { holes });
  plate.position.set(0, u((Pl.y0 + Pl.y1) / 2), u(zP));
  const tube = S.shell(u(B.ro), u(B.ri), u(B.y1 - B.y0), 'lightGrey', { seg: 40 });
  tube.position.y = u((B.y0 + B.y1) / 2);
  const cap = L(S, [[1.02, -0.95], [B.ri, -0.95], [B.ri, B.y1], [B.ro, B.y1], [B.ro, -0.06], [B.ro - 0.06, 0], [1.02, 0], [1.02, -0.95]], 'lightGrey', 40);
  const bot = L(S, [[Lg.ro + 0.02, B.y0 - 0.3], [B.ro + 0.06, B.y0 - 0.3], [B.ro + 0.06, B.y0 + 0.45], [B.ro, B.y0 + 0.5], [Lg.ro + 0.02, B.y0 + 0.5], [Lg.ro + 0.02, B.y0 - 0.3]], 'lightGrey', 40);
  const gx = -2.1, gz0 = pz * Math.sqrt(B.ro * B.ro - gx * gx) * 0.98, gz1 = pz * B.ro;
  const gus = S.box(u(0.5), u(8.8), u(Math.abs(gz1 - gz0) + 0.05), 'lightGrey');
  gus.position.set(u(gx), u(-8.0), u((gz0 + gz1) / 2));
  const boss = L(S, [[0.5, 0], [0.8, 0], [0.8, 0.55], [0.74, 0.62], [0.5, 0.62], [0.5, 0]], 'lightGrey', 20);
  const bossG = along(THREE, boss, [-u(B.ro - 0.15), u(ST.sensorY), 0], [-1, 0, 0]);
  // cordons fût / platine (de part et d'autre de la génératrice tangente) et gousset
  const welds = [-1, 1].map((sx) => S.weld([[u(sx * 0.62), u(Pl.y0 + 0.3), u(pz * (B.ro - 0.03))], [u(sx * 0.62), u(-0.6), u(pz * (B.ro - 0.03))]], 0.008, 'lightGrey'));
  welds.push(S.weld([[u(gx + 0.3), u(-12.4), u(gz1 - pz * 0.05)], [u(gx + 0.3), u(-3.6), u(gz1 - pz * 0.05)]], 0.006, 'lightGrey'));
  const purge = along(THREE, S.merged([hexLathe(S, 0.5625, 0.3, 0, 0, 'zinc'), L(S, [[0, -0.3], [0.19, -0.3], [0.19, 0], [0, 0]], 'zinc', 8)], 'zinc'),
    [u(B.ro * 0.72), u(-1.8), u(-pz * B.ro * 0.69)], [0.72, 0, -pz * 0.69]);
  const grease = along(THREE, S.merged([hexLathe(S, 0.4375, 0.2, 0, 0, 'brass'), L(S, [[0, 0.2], [0.09, 0.2], [0.09, 0.33], [0.13, 0.36], [0.13, 0.43], [0.06, 0.47], [0, 0.47]], 'brass', 10)], 'brass'),
    [u(B.ro * 0.72), u(B.y0 + 2.2), u(-pz * B.ro * 0.69)], [0.72, 0, -pz * 0.69]);
  const barrel = new THREE.Group();
  barrel.add(S.merged([tube, cap, bot, plate, gus, bossG, ...welds], 'lightGrey'), purge, grease);
  // bossage : alésage fileté (sombre) du détecteur
  barrel.add(along(THREE, L(S, [[0, 0], [0.5, 0], [0.5, 0.05], [0, 0.05]], 'darkSteel', 16), [-u(B.ro + 0.05), u(ST.sensorY), 0], [-1, 0, 0]));

  // tige creuse Ø 2 po fixe, tube central, piston fixe en bas (vis d'arrêt : P322)
  const rod = new THREE.Group();
  rod.add(L(S, [[0.55, -21.0], [1.0, -21.0], [1.0, 0.25], [0.875, 0.4], [0.875, 1.95], [0.82, 2.0], [0.55, 2.0], [0.55, -21.0]], 'chrome', 28));
  rod.add(L(S, [[0.285, -21.2], [0.375, -21.2], [0.375, 2.0], [0.285, 2.0], [0.285, -21.2]], 'steel', 12));
  rod.add(L(S, [[1.0, -21.1], [Lg.ri - 0.01, -21.1], [Lg.ri - 0.01, -19.3], [1.0, -19.3], [1.0, -21.1]], 'steel', 32));
  // entretoise de butée sur la tige, sous le chapeau
  rod.add(L(S, [[1.0, -1.4], [1.75, -1.4], [1.75, -1.0], [1.0, -1.0], [1.0, -1.4]], 'steel', 28));
  // jambe mobile : tube, presse-étoupe, fond, patin à ergots
  const e = ext / IN;
  const legTube = S.shell(u(Lg.ro), u(Lg.ri), u(Lg.top - Lg.bot - 0.6), 'lightGrey', { seg: 36 });
  legTube.position.y = u((Lg.top + Lg.bot + 0.6) / 2 - e);
  const gland = L(S, [[1.02, -4.8 - e], [Lg.ri, -4.8 - e], [Lg.ri, -1.75 - e], [Lg.ro, -1.75 - e], [Lg.ro, -1.5 - e], [1.02, -1.5 - e], [1.02, -4.8 - e]], 'steel', 32);
  const foot = L(S, [[0, Lg.bot - ST.pad.t - e], [ST.pad.r - 0.25, Lg.bot - ST.pad.t - e], [ST.pad.r, Lg.bot - ST.pad.t + 0.25 - e], [ST.pad.r, Lg.bot - 0.1 - e],
    [ST.pad.r - 0.3, Lg.bot - e], [Lg.ro + 0.3, Lg.bot - e], [Lg.ro, Lg.bot + 0.6 - e], [0, Lg.bot + 0.6 - e]], 'lightGrey', 40);
  const lugs = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const b = S.box(u(0.7), u(0.55), u(0.45), 'lightGrey');
    b.position.set(Math.cos(a) * u(ST.pad.r - 0.15), u(Lg.bot - ST.pad.t + 0.28 - e), Math.sin(a) * u(ST.pad.r - 0.15));
    b.rotation.y = -a;
    return b;
  });
  const legWeld = S.weldRing(u(Lg.ro + 0.05), 0.006, 'lightGrey', { pos: [0, u(Lg.bot + 0.05 - e), 0] });
  const leg = new THREE.Group();
  leg.add(S.merged([legTube, foot, ...lugs, legWeld], 'lightGrey'), gland);
  return { barrel, rod, leg };
}

// ------------------------------------------------------------------ cotes du porteur

/**
 * Cotes du porteur (repère machine, m) partagées par P292 et ses composants :
 * articulation (moyeux des rotules 24, axe vertical à l'origine), vérins de
 * direction (axes des œils, mesurés sur la vue de dessus de la page 296 :
 * ±35° de braquage pour 0,32 m de course balayée), transmission (hauteur des
 * arbres), stabilisateurs (dessus des fûts, patins au sol jambe sortie).
 */
export const CAR = {
  hub: { top: 0.88, bot: 0.44, t: u(3.3) },
  steer: { rear: [-0.96, 0.62, 0.38], rod: [0.09, 0.62, 0.27] },
  drive: { y: 0.6, rearPinion: -1.29, boxRear: -0.62, boxFront: -0.3, brake: 0.48, frontPinion: 1.26 },
  jack: { x: M.jackX, z: 0.85, top: 0.93 },
  frontOut: { x: 2.62, z: 0.8, top: 0.93 },
  axleF: AXLE.front,
  axleR: AXLE.rear,
};

/**
 * Montage d'un stabilisateur (P316 / P324) : corps (repère 3 : fût soudé, tige
 * et piston, jambe mobile et la trousse de jambe P322), bloc de valves (2 :
 * P320) et ses cartouches et bouchons (1 : P318), dans le repère ST.
 * Options : ext (sortie de jambe, m), body (corps de simulation de la jambe).
 */
export function outriggerMount(api, pz, opts = {}) {
  const ext = opts.ext ?? 0;
  const tag = (o) => { if (opts.body) o.userData.body = opts.body; return o; };
  const { barrel, rod, leg } = outriggerBody(api, { pz, ext });
  api.part('3', barrel, [0, 0, pz * 0.12]);
  api.part('3', rod, [0, 0.3, 0]);
  api.part('3', tag(leg), [0, -0.3, 0]);
  api.part('3', api.sub('P322', { ext, body: opts.body }), [0.25, -0.05, 0]);
  api.part('2', api.sub('P320', { pz }), [0, 0.2, 0]);
  api.part('1', api.sub('P318', { pz }), [0, 0.35, 0]);
  return { view: { dir: [-1, 0.5, -pz * 1.1] } };
}
