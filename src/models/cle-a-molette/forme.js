// Clé à molette (« Westcott ») à la grandeur voulue, à partir de la clé du « Tool Pack 1 » d'OpenGameArt
// (CC0, https://opengameart.org/content/tool-pack-1, auteur LonesomeDucky ; mesh.js, 327 × 73 × 19 mm).
//
// Le modèle d'origine est une clé marquée « 12" - 300mm », en trois pièces : corps, mâchoire mobile et
// molette. Chaque grandeur en est une copie à l'échelle, réglée sur sa longueur nominale (un seul facteur pour
// les trois axes : la tête garde son angle de 22 1/2° et la molette reste ronde). Ce n'est la clé d'aucun
// catalogue : largeur de tête, épaisseur et masse sont celles du modèle, pas des cotes publiées, et la marque
// « 12" - 300mm » de la texture reste la même sur toutes les grandeurs.
import MESH from './mesh.js';

export const IN = 0.0254;
const RHO = 7850; // acier, kg/m³

/** Grandeurs nominales (po) : longueur hors tout de la clé. */
export const SIZES = [6, 8, 10, 12, 15, 18, 24];

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const f32 = (b64) => new Float32Array(bytes(b64).buffer);
let BASE = null;

/**
 * Modèle d'origine décodé (une fois). Repère du corps, en mètres : la clé est couchée à plat, manche le long de
 * Z (tête vers −Z), largeur le long de X, épaisseur le long de Y. Les deux autres pièces ont leur repère,
 * tourné de l'angle de tête autour de Y : son axe X est celui de la coulisse (et de la molette).
 */
export function base() {
  if (BASE) return BASE;
  const pieces = {};
  for (const [nom, m] of Object.entries(MESH)) {
    pieces[nom] = { P: f32(m.p), N: f32(m.n), uv: f32(m.uv), I: new Uint16Array(bytes(m.i).buffer), t: m.t, q: m.q };
  }
  const angle = 2 * Math.asin(pieces.machoire.q[1]), c = Math.cos(angle), s = Math.sin(angle);
  // Repère de la mâchoire → repère du corps, et retour (rotation autour de Y).
  const versCorps = (p, t) => [c * p[0] + s * p[2] + t[0], p[1] + t[1], -s * p[0] + c * p[2] + t[2]];
  const versMachoire = (p) => { const x = p[0] - pieces.machoire.t[0], z = p[2] - pieces.machoire.t[2]; return [c * x - s * z, p[1], s * x + c * z]; };
  const points = (P) => Array.from({ length: P.length / 3 }, (_, i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]);
  const boite = (l) => [0, 1, 2].map((k) => [Math.min(...l.map((p) => p[k])), Math.max(...l.map((p) => p[k]))]);
  const corps = points(pieces.corps.P), mach = points(pieces.machoire.P);
  const tout = [...corps, ...mach.map((p) => versCorps(p, pieces.machoire.t)), ...points(pieces.molette.P).map((p) => versCorps(p, pieces.molette.t))];
  const bc = boite(corps), bt = boite(tout), bm = boite(points(pieces.molette.P));
  // Ouverture telle que modélisée : écart entre les faces des deux mâchoires, mesuré le long de la coulisse
  // près des becs (les faces, planes, n'ont de sommets qu'à leurs bouts).
  const bec = Math.min(...mach.map((p) => p[2])), bande = (p) => p[2] < 0.9 * bec;
  const faceMobile = Math.max(...mach.filter(bande).map((p) => p[0]));
  const faceFixe = Math.min(...corps.map(versMachoire).filter(bande).map((p) => p[0]));
  // Volume de chaque pièce (somme des tétraèdres signés ; la mâchoire a quelques arêtes ouvertes : valeur approchée).
  const volume = ({ P, I }) => {
    let v = 0;
    for (let i = 0; i < I.length; i += 3) {
      const a = I[i] * 3, b = I[i + 1] * 3, d = I[i + 2] * 3;
      v += (P[a] * (P[b + 1] * P[d + 2] - P[b + 2] * P[d + 1]) - P[a + 1] * (P[b] * P[d + 2] - P[b + 2] * P[d]) + P[a + 2] * (P[b] * P[d + 1] - P[b + 1] * P[d])) / 6;
    }
    return Math.abs(v);
  };
  BASE = {
    pieces, angle,
    L: bt[2][1] - bt[2][0], // longueur hors tout
    W: bc[0][1] - bc[0][0], // largeur de la tête (corps seul, sans la tige de la mâchoire qui dépasse)
    T: bm[1][1] - bm[1][0], // épaisseur hors tout : diamètre de la molette
    Tcorps: bc[1][1] - bc[1][0],
    boite: bt, bout: bt[2][1], // bout du manche (z)
    ouverture: faceFixe - faceMobile,
    ouvre: [-c, 0, s], // sens d'ouverture de la mâchoire mobile, dans le repère du corps
    volume: { corps: volume(pieces.corps), machoire: volume(pieces.machoire), molette: volume(pieces.molette) },
  };
  return BASE;
}

/** Cotes de la clé de grandeur « size » (po) : facteur d'échelle, longueur, largeur de tête, épaisseurs, ouverture montrée (m) et masse calculée en acier (kg). */
export function dims(size) {
  if (!SIZES.includes(size)) throw new Error(`Grandeur de clé inconnue : ${size}`);
  const b = base(), s = (size * IN) / b.L;
  const kg = (v) => v * s * s * s * RHO;
  return {
    size, s, L: b.L * s, W: b.W * s, T: b.T * s, Tcorps: b.Tcorps * s, ouverture: b.ouverture * s,
    kg: kg(b.volume.corps + b.volume.machoire + b.volume.molette),
    kgPieces: { corps: kg(b.volume.corps), machoire: kg(b.volume.machoire), molette: kg(b.volume.molette) },
    min: b.boite.map((v) => v[0] * s), max: b.boite.map((v) => v[1] * s),
  };
}
