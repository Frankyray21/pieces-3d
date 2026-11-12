// Forme d'une clé à tuyau droite à la grandeur voulue, à partir de la clé de Poly Haven (mesh.js,
// 405 × 84 × 34 mm). Chaque grandeur est ajustée aux cotes publiées des clés RIDGID « heavy-duty »
// droites, relevées sur des fiches de détaillants (aucun plan du fabricant) :
//   - longueur fermée L, largeur de tête W, épaisseur à l'écrou T : un facteur par axe ;
//   - la section du manche reçoit un facteur de plus pour que la masse calculée rejoigne celle du
//     catalogue (fonte ductile 7,1 g/cm³ pour le corps, acier 7,85 pour mâchoires et écrou) ;
//   - si cela ne suffit pas, W et T (souvent des cotes d'emballage) sont corrigées ensemble.
// « est » : cotes estimées, faute de donnée publiée. C'est la même clé étirée par zones : les
// détails propres à chaque grandeur (forme de la tête, nervures du manche) ne sont pas reproduits.
import MESH from './mesh.js';

export const IN = 0.0254;
const LB = 0.45359237, RHO_FONTE = 7100, RHO_ACIER = 7850;

/** Grandeur (po) → n° de catalogue, capacité (tuyau, po), L × W × T (po), poids (lb). */
export const SPECS = {
  6: { pn: '31000', cap: '3/4', L: 5.6, W: 1.6, T: 0.65, lb: 0.5, est: 'longueur, largeur et épaisseur' },
  8: { pn: '31005', cap: '1', L: 7.4, W: 2.0, T: 0.85, lb: 0.75, est: 'épaisseur' },
  10: { pn: '31010', cap: '1 1/2', L: 9.8, W: 2.65, T: 1.2, lb: 1.75 },
  14: { pn: '31020', cap: '2', L: 13.0, W: 3.25, T: 1.25, lb: 3.5 },
  18: { pn: '31025', cap: '2 1/2', L: 16.0, W: 3.8, T: 1.8, lb: 5.75 },
  24: { pn: '31030', cap: '3', L: 22.3, W: 4.15, T: 1.95, lb: 9.75 },
  36: { pn: '31035', cap: '5', L: 31.0, W: 6.3, T: 2.5, lb: 19 },
  48: { pn: '31040', cap: '6', L: 41.25, W: 6.5, T: 2.5, lb: 34.25 },
  60: { pn: '31045', cap: '8', L: 51.5, W: 8.5, T: 3.0, lb: 51.25, est: 'longueur' },
};
export const SIZES = Object.keys(SPECS).map(Number);

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
let BASE = null;
/** Maillage de base décodé (une fois) : sommets, normales, UV, triangles, îlots et leurs boîtes. */
export function base() {
  if (BASE) return BASE;
  const P = new Float32Array(bytes(MESH.p).buffer), N = Float32Array.from(new Int8Array(bytes(MESH.n).buffer), (v) => v / 127);
  const uv = new Float32Array(bytes(MESH.uv).buffer), I = new Uint16Array(bytes(MESH.i).buffer), isl = bytes(MESH.isl);
  const n = P.length / 3;
  // boîtes : 0 crochet, 1 corps du manche, 2 écrou, 3 garniture du crochet, 4 garniture du talon, 5 tout
  const box = Array.from({ length: 6 }, () => [1, 1, 1, -1, -1, -1]);
  for (let i = 0; i < n; i++) for (const b of [box[isl[i]], box[5]]) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], P[i * 3 + k]); b[k + 3] = Math.max(b[k + 3], P[i * 3 + k]); }
  BASE = { P, N, uv, I, isl, n, box, size: [0, 1, 2].map((k) => box[5][k + 3] - box[5][k]) };
  return BASE;
}

const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const cache = new Map();

/**
 * Sommets et normales de la clé de grandeur « size » (po), dans son repère : X largeur (ouverture des
 * mâchoires vers +X), Y du bout du manche vers la tête, Z épaisseur. open : ouverture des mâchoires
 * en mètres (null : comme le modèle d'origine, presque fermées).
 */
export function shape(size, open = null) {
  const key = `${size}:${open}`;
  if (cache.has(key)) return cache.get(key);
  const m = base(), s = SPECS[size];
  if (!s) throw new Error(`Grandeur de clé inconnue : ${size}`);
  const sy = (s.L * IN) / m.size[1], sx = (s.W * IN) / m.size[0], sz = (s.T * IN) / m.size[2];
  const gap0 = m.box[3][1] - m.box[4][4];
  const shift = open == null ? 0 : open / sy - gap0;
  const build = (f, g = 1) => {
    const P = new Float32Array(m.P.length), N = new Float32Array(m.P.length);
    for (let i = 0; i < m.n; i++) {
      const moved = m.isl[i] === 0 || m.isl[i] === 3;
      const x = m.P[i * 3], y = m.P[i * 3 + 1] + (moved ? shift : 0), z = m.P[i * 3 + 2];
      const w = smooth(-0.02, 0.04, m.P[i * 3 + 1]); // 0 : manche, 1 : tête
      const kx = sx * g * (f + (1 - f) * w), kz = sz * g * (f + (1 - f) * w);
      P[i * 3] = x * kx; P[i * 3 + 1] = y * sy; P[i * 3 + 2] = z * kz;
      const nx = m.N[i * 3] / kx, ny = m.N[i * 3 + 1] / sy, nz = m.N[i * 3 + 2] / kz, l = Math.hypot(nx, ny, nz) || 1;
      N[i * 3] = nx / l; N[i * 3 + 1] = ny / l; N[i * 3 + 2] = nz / l;
    }
    return { P, N };
  };
  const massOf = (P) => {
    let fonte = 0, acier = 0, V = 0; const C = [0, 0, 0];
    for (let t = 0; t < m.I.length; t += 3) {
      const a = m.I[t] * 3, b = m.I[t + 1] * 3, c = m.I[t + 2] * 3;
      const v = (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
      if (m.isl[m.I[t]] === 1) fonte += v; else acier += v;
      V += v; for (let k = 0; k < 3; k++) C[k] += (v * (P[a + k] + P[b + k] + P[c + k])) / 4;
    }
    return { kg: fonte * RHO_FONTE + acier * RHO_ACIER, cg: C.map((c) => c / V) };
  };
  const target = s.lb * LB;
  let lo = 0.75, hi = 1.3;
  for (let k = 0; k < 24; k++) { const f = (lo + hi) / 2; if (massOf(build(f).P).kg < target) lo = f; else hi = f; }
  const f = (lo + hi) / 2;
  let g = 1;
  if (Math.abs(massOf(build(f).P).kg / target - 1) > 0.01) {
    let a = 0.8, b = 1.25;
    for (let k = 0; k < 24; k++) { g = (a + b) / 2; if (massOf(build(f, g).P).kg < target) a = g; else b = g; }
  }
  const { P, N } = build(f, g), { kg, cg } = massOf(P);
  const ext = (k) => { let a = 1e9, b = -1e9; for (let i = k; i < P.length; i += 3) { a = Math.min(a, P[i]); b = Math.max(b, P[i]); } return [a, b]; };
  const out = {
    P, N, kg, cg, f, g, sx: sx * g, sy, sz: sz * g, spec: s,
    min: [ext(0)[0], ext(1)[0], ext(2)[0]], max: [ext(0)[1], ext(1)[1], ext(2)[1]],
    heelY: m.box[4][4] * sy, // face de la garniture du talon : la tige s'y appuie
  };
  cache.set(key, out);
  return out;
}
