// Contrôle chiffré des clés mixtes (src/models/cles-mixtes) : chaque grandeur est mesurée sur son maillage
// final et comparée aux cotes publiées (SPECS de forme.js) — longueur hors tout, largeur et épaisseur de la
// tête à fourche, ouverture de la fourche, largeur, épaisseur, cote sur plats et inclinaison de l'œil, masse.
// Usage : node scripts/check-cles-mixtes.mjs
import { base, shape, nominal, SPECS, SIZES, IN, TILT } from '../src/models/cles-mixtes/forme.js';

const LB = 0.45359237, m = base(), O = m.open, E = m.eye;
const cj = Math.cos(O.jaw), sj = Math.sin(O.jaw), ct = Math.cos(E.tilt), st = Math.sin(E.tilt);
// Sommets repérés sur le maillage de base : plats des mâchoires (face du dessus), pointes des 12 pans, anneau de l'œil.
const plats = [[], []], pointes = [], anneau = [], tete = [];
for (let i = 0; i < m.n; i++) {
  const x = m.P[i * 3], y = m.P[i * 3 + 1], z = m.P[i * 3 + 2];
  if (z < -0.125) tete.push(i);
  const dx = x - O.c[0], dz = z - O.c[1], v = dx * cj - dz * sj, u = dx * sj + dz * cj;
  if (u < 5e-4 && y > O.thick / 2 - 3e-4 && Math.abs(Math.abs(v) - O.opening / 2) < 5e-5) plats[v > 0 ? 0 : 1].push(i);
  const ex = x - E.c[0], ey = y - E.c[1], ez = z - E.c[2], q = ez * ct + ey * st, h = -ez * st + ey * ct, r = Math.hypot(ex, q);
  if (z > 0.12 && r < 0.0141 && Math.abs(h) < 0.012) pointes.push(i);
  if (z > 0.126 && r <= E.rOut + 2e-4) anneau.push(i);
}
if (plats[0].length < 2 || plats[1].length < 2 || pointes.length < 48) throw new Error(`repères introuvables sur le maillage de base (${plats.map((p) => p.length)} plats, ${pointes.length} pointes)`);

let failed = 0, count = 0;
const check = (size, name, got, want, tol, unit) => {
  count++;
  if (Math.abs(got - want) <= tol) return;
  failed++;
  console.log(`✕ ${size} po — ${name} : ${got.toFixed(3)} ${unit}, attendu ${want.toFixed(3)} ± ${tol} ${unit}`);
};
for (const size of SIZES) {
  const s = SPECS[size], w = shape(size), P = w.P, S = nominal(size);
  const ext = (ids, f) => { let a = 1e9, b = -1e9; for (const i of ids) { const v = f(i); a = Math.min(a, v); b = Math.max(b, v); } return b - a; };
  const all = Array.from({ length: m.n }, (_, i) => i);
  check(size, 'longueur hors tout', ext(all, (i) => P[i * 3 + 2]) / IN, s.L, 0.005, 'po');
  check(size, 'largeur de la tête à fourche', ext(tete, (i) => P[i * 3]) / IN, s.W, 0.005, 'po');
  check(size, 'épaisseur de la tête à fourche', ext(tete, (i) => P[i * 3 + 1]) / IN, s.T, 0.005, 'po');
  // ouverture : distance entre les deux plats, mesurée perpendiculairement au premier
  const [a, b] = [plats[0][0], plats[0].reduce((best, i) => (Math.hypot(P[i * 3] - P[plats[0][0] * 3], P[i * 3 + 2] - P[plats[0][0] * 3 + 2]) > Math.hypot(P[best * 3] - P[plats[0][0] * 3], P[best * 3 + 2] - P[plats[0][0] * 3 + 2]) ? i : best), plats[0][0])];
  const tx = P[b * 3] - P[a * 3], tz = P[b * 3 + 2] - P[a * 3 + 2], tl = Math.hypot(tx, tz), nx = tz / tl, nz = -tx / tl;
  const d = (i) => (P[i * 3] - P[a * 3]) * nx + (P[i * 3 + 2] - P[a * 3 + 2]) * nz;
  const ouverture = Math.abs(plats[1].reduce((sum, i) => sum + d(i), 0) / plats[1].length);
  check(size, 'ouverture de la fourche', ouverture / IN, S * m.jeu, 0.002, 'po');
  // les plats du modèle d'origine s'écartent de 0,13 % de l'ouverture d'un bout à l'autre : tolérance de 0,2 %
  check(size, 'parallélisme des mâchoires', (ext(plats[1], d) / ouverture) * 100, 0, 0.2, "% de l'ouverture");
  // œil : plan ajusté aux deux couronnes de pointes, puis rayon autour de leur centre
  const c = [0, 1, 2].map((k) => pointes.reduce((sum, i) => sum + P[i * 3 + k], 0) / pointes.length);
  const c1 = Math.cos(TILT), s1 = Math.sin(TILT);
  const loc = (i) => { const x = P[i * 3] - c[0], y = P[i * 3 + 1] - c[1], z = P[i * 3 + 2] - c[2]; return [x, z * c1 + y * s1, -z * s1 + y * c1]; };
  const rMoy = pointes.reduce((sum, i) => sum + Math.hypot(loc(i)[0], loc(i)[1]), 0) / pointes.length;
  check(size, 'cote sur plats de l\'œil', (2 * Math.cos(Math.PI / 12) * rMoy) / IN, S * m.jeu, 0.002, 'po');
  check(size, 'largeur de l\'œil', ext(anneau, (i) => P[i * 3]) / IN, s.Wb, 0.005, 'po');
  check(size, 'épaisseur de l\'œil (perpendiculaire à l\'anneau)', ext(anneau, (i) => loc(i)[2]) / IN, s.Tb, 0.005, 'po');
  // inclinaison : pente des pointes de la couronne du haut
  const haut = pointes.filter((i) => loc(i)[2] > 0), mz = haut.reduce((sum, i) => sum + P[i * 3 + 2], 0) / haut.length, my = haut.reduce((sum, i) => sum + P[i * 3 + 1], 0) / haut.length;
  let sn = 0, sd = 0; for (const i of haut) { sn += (P[i * 3 + 2] - mz) * (P[i * 3 + 1] - my); sd += (P[i * 3 + 2] - mz) ** 2; }
  check(size, 'inclinaison de l\'œil', (Math.atan(sn / sd) * 180) / Math.PI, 15, 0.1, '°');
  check(size, 'poids', w.kg / LB, s.lb, 0.002, 'lb');
  // manche (section calculée) : pas plus épais que la tête à fourche
  check(size, 'épaisseur du manche, au plus celle de la tête', Math.max(w.manche.tc / IN - s.T, 0), 0, 1e-9, 'po');
}
console.log(failed ? `✕ ${failed} mesure(s) hors tolérance sur ${count}` : `✓ ${SIZES.length} clés, ${count} mesures conformes aux cotes publiées`);
process.exit(failed ? 1 : 0);
