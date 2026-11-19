// Forme d'une clé mixte (fourche et œil 12 pans) à la grandeur voulue, à partir de la clé de Poly Haven
// (mesh.js). La clé de base est une 1 po : fourche de 25,50 mm, œil de 25,85 mm sur plats, 337 mm de long.
// Chaque grandeur est ajustée aux cotes publiées par Gray Tools pour ses clés mixtes 12 pans SAE à œil
// incliné de 15°, fini chrome miroir (n° 3108 à 3140) : longueur hors tout, largeur et épaisseur de la
// tête à fourche, largeur et épaisseur de l'œil, poids.
//   - fourche : tête mise à l'échelle de l'ouverture nominale (mêmes proportions de gorge) ; les mâchoires
//     sont ensuite épaissies ou amincies pour que la tête ait la largeur publiée ;
//   - œil : 12 pans à l'échelle de la grandeur nominale, paroi réglée sur la largeur publiée, épaisseur
//     publiée, inclinaison portée de 10° (modèle d'origine) à 15° (donnée du fabricant) ;
//   - manche : allongé pour la longueur hors tout ; sa section (non publiée) reçoit un seul facteur, en
//     largeur et en épaisseur, pour que la masse calculée (acier, 7,85 g/cm³) rejoigne le poids publié.
// Le jeu des ouvertures est celui de la fourche du modèle d'origine (+0,4 %). C'est la même clé déformée
// par zones : les détails propres à chaque grandeur (profil du manche, marquage) ne sont pas reproduits.
// Repère : X largeur, Y épaisseur (œil relevé vers +Y), Z longueur (fourche vers −Z), en mètres.
import MESH from './mesh.js';

export const IN = 0.0254;
const LB = 0.45359237, RHO_ACIER = 7850;
/** Inclinaison de l'œil annoncée par le fabricant (rad). */
export const TILT = (15 * Math.PI) / 180;

/**
 * Grandeur (po) → n° de catalogue Gray Tools, longueur hors tout L, tête à fourche W × T, œil Wb × Tb (po),
 * poids (lb). Valeurs du tableau du fabricant, telles que publiées.
 */
export const SPECS = {
  '1/4': { pn: '3108', L: 5.0, W: 0.6, T: 0.17, Wb: 0.42, Tb: 0.23, lb: 0.06 },
  '5/16': { pn: '3110', L: 5.5, W: 0.7, T: 0.18, Wb: 0.54, Tb: 0.25, lb: 0.06 },
  '3/8': { pn: '3112', L: 6.0, W: 0.79, T: 0.2, Wb: 0.59, Tb: 0.3, lb: 0.08 },
  '7/16': { pn: '3114', L: 6.5, W: 0.92, T: 0.23, Wb: 0.69, Tb: 0.33, lb: 0.12 },
  '1/2': { pn: '3116', L: 7.0, W: 1.09, T: 0.25, Wb: 0.76, Tb: 0.36, lb: 0.16 },
  '9/16': { pn: '3118', L: 7.5, W: 1.2, T: 0.28, Wb: 0.84, Tb: 0.35, lb: 0.21 },
  '5/8': { pn: '3120', L: 8.06, W: 1.32, T: 0.29, Wb: 0.93, Tb: 0.41, lb: 0.25 },
  '11/16': { pn: '3122', L: 8.87, W: 1.45, T: 0.31, Wb: 1.03, Tb: 0.42, lb: 0.33 },
  '3/4': { pn: '3124', L: 9.75, W: 1.57, T: 0.33, Wb: 1.09, Tb: 0.45, lb: 0.41 },
  '13/16': { pn: '3126', L: 10.62, W: 1.68, T: 0.35, Wb: 1.19, Tb: 0.46, lb: 0.56 },
  '7/8': { pn: '3128', L: 11.5, W: 1.79, T: 0.38, Wb: 1.31, Tb: 0.48, lb: 0.67 },
  '15/16': { pn: '3130', L: 12.37, W: 1.9, T: 0.41, Wb: 1.39, Tb: 0.51, lb: 0.75 },
  '1': { pn: '3132', L: 13.25, W: 2.01, T: 0.44, Wb: 1.5, Tb: 0.55, lb: 0.92 },
  '1 1/16': { pn: '3134', L: 14.12, W: 2.14, T: 0.47, Wb: 1.61, Tb: 0.58, lb: 1.14 },
  '1 1/8': { pn: '3136', L: 15.37, W: 2.26, T: 0.5, Wb: 1.69, Tb: 0.61, lb: 1.23 },
  '1 1/4': { pn: '3140', L: 16.75, W: 2.51, T: 0.48, Wb: 1.86, Tb: 0.7, lb: 1.7 },
};
/** Grandeur nominale en pouces : « 1 1/16 » → 1,0625. */
export const nominal = (size) => String(size).trim().split(/\s+/).reduce((a, t) => { const [n, d] = t.split('/'); return a + (d ? n / d : +n); }, 0);
/** Grandeurs de la plus petite à la plus grande (la clé « 1 » d'un objet passe en tête : on trie). */
export const SIZES = Object.keys(SPECS).sort((a, b) => nominal(a) - nominal(b));

// Zones du maillage de base, le long de Z (m) : tête à fourche, col, manche, col, œil.
const Z_FOURCHE = -0.125, Z_MANCHE_A = -0.092, Z_MANCHE_B = 0.1, Z_OEIL = 0.122;
const ANCRE_FOURCHE = -0.1085, ANCRE_OEIL = 0.111; // points de l'axe où tête et manche se raccordent
const R_PANS = 0.0162; // rayon qui englobe les 12 pans et leur chanfrein (œil de base)
/** Section du manche de base (m) : largeur, épaisseur des bouts, épaisseur de la partie centrale. */
export const MANCHE = { w: 0.022, t: 0.0094, tc: 0.0114 };

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
let BASE = null;
/** Maillage de base décodé (une fois) : sommets, normales, UV, triangles et repères de la fourche et de l'œil. */
export function base() {
  if (BASE) return BASE;
  const P = new Float32Array(bytes(MESH.p).buffer), N = Float32Array.from(new Int8Array(bytes(MESH.n).buffer), (v) => v / 127);
  const uv = new Float32Array(bytes(MESH.uv).buffer), I = new Uint16Array(bytes(MESH.i).buffer);
  BASE = { P, N, uv, I, n: P.length / 3, open: MESH.open, eye: MESH.eye, jeu: MESH.open.opening / IN };
  return BASE;
}

const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * Déformation du maillage de base pour la grandeur nominale S (po) : renvoie p → p'.
 * b : facteur des mâchoires (hors ouverture) ; kz : allongement du manche ; f : facteur de section du manche.
 */
function warp(S, spec, { b, kz, f }) {
  const { open: O, eye: E, jeu } = base();
  const cj = Math.cos(O.jaw), sj = Math.sin(O.jaw), hv = O.opening / 2, ty = (spec.T * IN) / O.thick;
  const fourche = (x, y, z, out) => {
    const dx = x - O.c[0], dz = z - O.c[1];
    const v = dx * cj - dz * sj, u = dx * sj + dz * cj, av = Math.abs(v);
    const v2 = av <= hv ? S * v : Math.sign(v) * (S * hv + b * (av - hv)), u2 = S * u;
    out[0] = v2 * cj + u2 * sj; out[1] = ty * y; out[2] = -v2 * sj + u2 * cj;
  };
  const ct = Math.cos(E.tilt), st = Math.sin(E.tilt), c1 = Math.cos(TILT), s1 = Math.sin(TILT);
  const ae = (S * IN * jeu) / E.af, rb = (spec.Wb * IN) / 2, th = (spec.Tb * IN) / E.thick;
  const oeil = (x, y, z, out) => {
    const dx = x - E.c[0], dy = y - E.c[1], dz = z - E.c[2];
    const q = dz * ct + dy * st, h = (-dz * st + dy * ct - E.hMid) * th, r = Math.hypot(dx, q);
    const r2 = r <= R_PANS ? ae * r : r <= E.rOut ? ae * R_PANS + ((r - R_PANS) * (rb - ae * R_PANS)) / (E.rOut - R_PANS) : rb + ((r - E.rOut) * rb) / E.rOut;
    const k = r > 1e-9 ? r2 / r : ae;
    out[0] = dx * k; out[1] = q * k * s1 + h * c1; out[2] = q * k * c1 - h * s1;
  };
  const a0 = [0, 0, 0], b0 = [0, 0, 0], t = [0, 0, 0];
  fourche(0, 0, ANCRE_FOURCHE, a0);
  oeil(0, 0, ANCRE_OEIL, b0);
  return (x, y, z, out) => {
    let X = f * x, Y = f * y, Z = kz * z;
    const wo = 1 - smooth(Z_FOURCHE, Z_MANCHE_A, z), wb = smooth(Z_MANCHE_B, Z_OEIL, z);
    if (wo > 0) {
      fourche(x, y, z, t);
      X += wo * (t[0] - a0[0] - X); Y += wo * (t[1] - a0[1] - Y); Z += wo * (kz * ANCRE_FOURCHE + t[2] - a0[2] - Z);
    } else if (wb > 0) {
      oeil(x, y, z, t);
      X += wb * (t[0] - b0[0] - X); Y += wb * (t[1] - b0[1] - Y); Z += wb * (kz * ANCRE_OEIL + t[2] - b0[2] - Z);
    }
    out[0] = X; out[1] = Y; out[2] = Z;
  };
}

const cache = new Map();

/**
 * Sommets et normales de la clé de grandeur « size » (« 3/4 », « 1 1/16 »…), dans son repère (voir en tête).
 * Renvoie aussi la masse calculée, le centre de gravité, les facteurs retenus et la section du manche.
 */
export function shape(size) {
  const key = String(size);
  if (cache.has(key)) return cache.get(key);
  const m = base(), spec = SPECS[key];
  if (!spec) throw new Error(`Grandeur de clé inconnue : ${size}`);
  const S = nominal(key), o = [0, 0, 0];
  const build = (par) => {
    const w = warp(S, spec, par), P = new Float32Array(m.P.length);
    for (let i = 0; i < m.n; i++) { w(m.P[i * 3], m.P[i * 3 + 1], m.P[i * 3 + 2], o); P[i * 3] = o[0]; P[i * 3 + 1] = o[1]; P[i * 3 + 2] = o[2]; }
    return P;
  };
  const ext = (P, k, keep = null) => { let a = 1e9, b = -1e9; for (let i = 0; i < m.n; i++) { if (keep && !keep(m.P[i * 3 + 2])) continue; a = Math.min(a, P[i * 3 + k]); b = Math.max(b, P[i * 3 + k]); } return [a, b]; };
  const massOf = (P) => {
    let V = 0; const C = [0, 0, 0];
    for (let t = 0; t < m.I.length; t += 3) {
      const a = m.I[t] * 3, b = m.I[t + 1] * 3, c = m.I[t + 2] * 3;
      const v = (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
      V += v; for (let k = 0; k < 3; k++) C[k] += (v * (P[a + k] + P[b + k] + P[c + k])) / 4;
    }
    return { kg: V * RHO_ACIER, cg: C.map((c) => c / V) };
  };
  const solve = (lo, hi, value, target) => { for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (value(mid) < target) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  const par = { b: S, kz: S, f: S };
  // 1. largeur de la tête à fourche ; 2. longueur hors tout ; 3. masse (section du manche)
  par.b = solve(0.02, 3, (b) => { const e = ext(build({ ...par, b }), 0, (z) => z < Z_FOURCHE); return e[1] - e[0]; }, spec.W * IN);
  par.kz = solve(0.02, 4, (kz) => { const e = ext(build({ ...par, kz }), 2); return e[1] - e[0]; }, spec.L * IN);
  const target = spec.lb * LB;
  par.f = solve(0.1, 2, (f) => massOf(build({ ...par, f })).kg, target);

  const P = build(par), { kg, cg } = massOf(P);
  // Normales : image des deux tangentes par la déformation (différences finies).
  const w = warp(S, spec, par), N = new Float32Array(m.P.length), e = 1e-5, p0 = [0, 0, 0], p1 = [0, 0, 0], p2 = [0, 0, 0];
  for (let i = 0; i < m.n; i++) {
    const x = m.P[i * 3], y = m.P[i * 3 + 1], z = m.P[i * 3 + 2], nx = m.N[i * 3], ny = m.N[i * 3 + 1], nz = m.N[i * 3 + 2];
    // t1 ⟂ n, t2 = n × t1
    let ax = 0, ay = 0, az = 0;
    if (Math.abs(nx) < 0.6) ax = 1; else ay = 1;
    let t1x = ny * az - nz * ay, t1y = nz * ax - nx * az, t1z = nx * ay - ny * ax;
    const l1 = Math.hypot(t1x, t1y, t1z) || 1; t1x /= l1; t1y /= l1; t1z /= l1;
    const t2x = ny * t1z - nz * t1y, t2y = nz * t1x - nx * t1z, t2z = nx * t1y - ny * t1x;
    w(x, y, z, p0); w(x + e * t1x, y + e * t1y, z + e * t1z, p1); w(x + e * t2x, y + e * t2y, z + e * t2z, p2);
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    let rx = uy * vz - uz * vy, ry = uz * vx - ux * vz, rz = ux * vy - uy * vx;
    const l = Math.hypot(rx, ry, rz);
    if (l > 0) { rx /= l; ry /= l; rz /= l; } else { rx = nx; ry = ny; rz = nz; }
    N[i * 3] = rx; N[i * 3 + 1] = ry; N[i * 3 + 2] = rz;
  }
  const out = {
    P, N, kg, cg, spec, S, par,
    min: [0, 1, 2].map((k) => ext(P, k)[0]), max: [0, 1, 2].map((k) => ext(P, k)[1]),
    manche: { w: MANCHE.w * par.f, t: MANCHE.t * par.f, tc: MANCHE.tc * par.f },
  };
  cache.set(key, out);
  return out;
}
