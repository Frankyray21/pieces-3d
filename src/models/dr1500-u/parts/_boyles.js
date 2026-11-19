// Assistants du lot B2 : mandrin Boyles 12HH (P018, P020) et serre-tiges Boyles 12HH (P021, P023, P024).
//
// Les deux appareils (dessins X-Spec 055A et 055B) ont le même haut : bague de mandrin (chuck bushing), adaptateur
// de chapeau 55-0004, porte-chapeau 55-0003, bol 55-0005, 9 mâchoires coniques à plaquettes (12,5°), entretoises
// 55-0011 et 55-0012, 18 ressorts verts 55-0023, joints radiaux 55-0016, et la même visserie. Le reste diffère :
// carter 55-0006 et piston-cylindre 55-0200 (p. 20) du mandrin, carter à oreille 55-0040 et piston-cylindre 55-0300
// (p. 23) du serre-tiges.
//
// COLONNE : chaque appareil est construit dans un repère « colonne » : axe = Y local, d = profondeur en POUCES
// comptée depuis le dessus de l'adaptateur de chapeau vers le bas (y = −d·IN) ; le haut des dessins (bague de
// mandrin) est vers +Y. Le builder pose la colonne dans son repère (axe le long de X) par une rotation de ∓90° autour
// de Z : sx = −1 pour le serre-tiges (haut vers +X, vers le trou), sx = +1 pour le mandrin et son piston (haut vers
// −X, à l'opposé de la tête). Un angle φ autour de l'axe se mesure dans le repère de l'assemblage, depuis +Y vers +Z :
// le point (r, φ) y est à (y = r cos φ, z = r sin φ). Le plan de coupe du site (z = 0) passe par φ = 0° et 180°.
//
// COTES (pouces) — relevées sur les coupes vectorielles rendues à 300 ppp :
//   p. 20 (piston et cylindre du mandrin, éch. 1:4 contrôlée sur la bague d'usure Ø 10 po : 75 px/po) et p. 23
//   (piston et cylindre du serre-tiges, éch. 1:3,25 : 92,3 px/po, contrôlée sur le Ø 10 po) : cotes [mesure] sûres
//   à ±0,03 po ; p. 21 (coupe du serre-tiges, 75 px/po : Ø 12,1 po du carter = 309 mm, RC.d = 308 dans layout.js) pour le
//   haut commun ; p. 18 (coupe du mandrin, 85,5 px/po, échelle tirée du Ø 12,16 po du cylindre mesuré p. 20).
//   Ce que les coupes ne montrent pas (perçages hors du plan, positions angulaires, longueurs des entretoises,
//   plaquettes) est [estimé] et dit en commentaire. Le dessin du mandrin (2013) et celui de son piston (2019, rév. C)
//   ne concordent pas tout à fait : c'est la page 20 qui fait foi pour le piston, le carter du mandrin s'y adapte.
import * as THREE from 'three';
import { IN } from '../layout.js';
import { mat } from '../../../viewer/materials.js';

const deg = Math.PI / 180;
export { deg, mat };
export const TAN_JAW = Math.tan(12.5 * deg); // demi-angle du cône des mâchoires [manuel : « 12.5DEG »]

// ---------------------------------------------------------------------------------------------------------
// Cotes du haut commun (d, r en pouces) [mesure p. 21, sauf mention].
export const H = {
  // Bague de mandrin (chuck bushing) NWL/NQ 55-0048 (tableau p. 19) : alésage Ø 2,90 (tige NQ Ø 2,75 [norme]),
  // collerette Ø 5,5 noyée dans l'adaptateur, fût Ø 3,94.
  bush: { ri: 1.45, rf: 2.75, rs: 1.95, d0: 0.17, d1: 0.83, d2: 1.25 },
  // Adaptateur de chapeau 55-0004 : Ø 8,3 sur 0,63 (d 0,33 à 0,96), col Ø 6,7 jusqu'à d 1,85 (appui des mâchoires),
  // alésage Ø 3,94, lamage Ø 5,56 de la collerette de la bague.
  cap: { d0: 0.33, d1: 0.96, d2: 1.85, ro: 4.15, rn: 3.35, ri: 1.97, rc: 2.78 },
  // Porte-chapeau 55-0003 : bride Ø 12,2 (d 1,33 à 2,42) et couronne Ø 10 (d 0,96 à 1,95) autour du col de
  // l'adaptateur ; dessous plat (le dessin le montre conique, sur le dessus du bol : simplifié).
  hold: { d0: 0.96, d1: 1.33, d2: 1.95, d3: 2.42, ri: 3.35, rm: 5.0, ro: 6.1 },
  // Bol 55-0005 : cône des mâchoires de r 3,17 (d 1,96) à r 2,27 (d 6,0) au demi-angle de 12,5° (mesuré : 11,8°) ;
  // Ø 8,5 extérieur, glisse dans l'alésage Ø 8,56 du carter.
  bowl: { d0: 1.96, d1: 2.17, d2: 2.45, d3: 6.0, ro: 4.25 },
  // Mâchoires : 9 secteurs de 34° (jeu de 6°) de d 1,9 à 6,15 ; face intérieure à r 1,62, plaquettes de carbure
  // de 0,2 po en trois rangs jusqu'à r 1,42 (tige NQ r 1,375) [estimé : répartition des plaquettes du dessin].
  jaw: { d0: 1.9, d1: 6.15, ri: 1.42, rb: 1.62, half: 17, rows: [[2.0, 2.85], [3.55, 4.4], [5.1, 5.95]] },
  // Carter (55-0006 / 55-0040) : dessus à d 2,42, Ø 12,14 (p. 20 : bride du cylindre de même Ø), alésage Ø 8,56
  // du bol jusqu'à d 6,2 ; 18 logements de ressort Ø 1,56 sur r 5,08, fond à d 7,75 ; plancher percé pour les
  // entretoises du bas.
  hsg: { d0: 2.42, dB: 6.2, dP: 7.75, ro: 6.07, rb: 4.28, rp: 5.08, ph: 0.78 },
  // Ressorts 55-0023 (verts, ressorts de matrice à fil rectangulaire) : Ø 1,5 ext., 12 spires, fil 0,32 × 0,3,
  // de d 2,45 à 7,72 (5,3 po sous charge ; 5,07 mesurés p. 21 entre spires extrêmes).
  spr: { d0: 2.45, d1: 7.72, rm: 0.59, w: 0.32, h: 0.3, turns: 12 },
  // Entretoises du bas 55-0012 (9) : Ø 0,6, sous le bol (d 6,0) jusqu'au manchon (mandrin) ou au piston
  // (serre-tiges) à d 7,84, sur r 3,4 (trous du manchon 55-0001, p. 20 : 9 × Ø 0,4 sur r 3,4), à φ = 40k.
  post: { r: 3.4, rr: 0.3, d0: 6.0, d1: 7.84 },
  // Joints radiaux 55-0016 (9) : dans le plancher autour des entretoises, Ø 1,0 × 0,25 [estimé].
  seal: { ro: 0.5, d0: 6.2, d1: 6.45 },
  // Boulons de liaison bol → piston, sur r 3,82 à φ = 20° + 40k : 6 × 1/2-13 × 6 1/2 (têtes lamées dans le bol,
  // d 2,45) et 3 × 1/2-13 × 8 (φ = 60°, 180°, 300°) dont la tête porte sur une entretoise du haut 55-0011
  // (tube Ø 0,75 de d 0,33 à 2,17, au travers de l'adaptateur et du porte-chapeau) [p. 18 : tête au-dessus de
  // l'adaptateur, entretoise en traits cachés ; positions angulaires estimées].
  tie: { r: 3.82 },
  // Boulons 3/4-10 × 1 1/2 (3) adaptateur → porte-chapeau sur r 3,75 à φ = 0°, 120°, 240° ; boulons 1/2-13 × 2 1/4
  // (9) porte-chapeau → carter sur r 5,55 à φ = 10° + 40k (entre les ressorts) ; boulons 1/2-13 × 1 1/2 (3) de la
  // bague sur r 2,3 à φ = 30°, 150°, 270° [estimé].
  b34: { r: 3.75 }, bHold: { r: 5.55 }, bBush: { r: 2.3 },
};

export const PHI = {
  posts: Array.from({ length: 9 }, (_, k) => 40 * k * deg),
  jaws: Array.from({ length: 9 }, (_, k) => (10 + 40 * k) * deg),
  ties: Array.from({ length: 9 }, (_, k) => (20 + 40 * k) * deg),
  long: [60, 180, 300].map((a) => a * deg), // boulons de 8 po et entretoises du haut
  short: [20, 100, 140, 220, 260, 340].map((a) => a * deg), // boulons de 6 1/2 po
  b34: [0, 120, 240].map((a) => a * deg),
  hold: Array.from({ length: 9 }, (_, k) => (10 + 40 * k) * deg),
  bush: [30, 150, 270].map((a) => a * deg),
  springs: Array.from({ length: 18 }, (_, k) => 20 * k * deg),
};

// ---------------------------------------------------------------------------------------------------------
// Géométries propres au lot.

/** Aire signée d'un polygone [[x, y], …]. */
function area(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length];
    s += x0 * y1 - x1 * y0;
  }
  return s / 2;
}

/**
 * Secteur de révolution (mâchoire, jonc fendu) : profil fermé [[r, y], …] en mètres, tourné de φ0 à φ1 (angles de
 * l'assemblage, voir COLONNE) autour de Y, faces de bout planes. Solide fermé (capuchon de coupe correct).
 */
export function sectorGeo(prof, f0, f1, seg, sx) {
  let p = prof.slice();
  if (p.length > 2 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p.pop();
  if (area(p) < 0) p.reverse();
  // Paramétrage de revolveGeo (x = r sin t, z = r cos t) : t décroît quand φ croît pour sx = +1.
  const tOf = (f) => (sx > 0 ? Math.PI / 2 - f : f - Math.PI / 2);
  let t0 = tOf(f0), t1 = tOf(f1);
  if (t1 < t0) [t0, t1] = [t1, t0];
  const pos = [], nor = [];
  const P = (r, y, t) => [r * Math.sin(t), y, r * Math.cos(t)];
  const tri = (a, b, c, na, nb, nc, n) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * n[0] + cy * n[1] + cz * n[2] < 0) { [b, c] = [c, b]; [nb, nc] = [nc, nb]; }
    pos.push(...a, ...b, ...c);
    nor.push(...na, ...nb, ...nc);
  };
  for (let i = 0; i < p.length; i++) {
    const [r0, y0] = p[i], [r1, y1] = p[(i + 1) % p.length];
    const l = Math.hypot(r1 - r0, y1 - y0);
    if (l < 1e-9) continue;
    const nr = (y1 - y0) / l, ny = -(r1 - r0) / l;
    const N = (t) => [nr * Math.sin(t), ny, nr * Math.cos(t)];
    for (let j = 0; j < seg; j++) {
      const ta = t0 + ((t1 - t0) * j) / seg, tb = t0 + ((t1 - t0) * (j + 1)) / seg, tm = (ta + tb) / 2;
      const a = P(r0, y0, ta), b = P(r0, y0, tb), c = P(r1, y1, tb), d = P(r1, y1, ta);
      tri(a, b, c, N(ta), N(tb), N(tb), N(tm));
      tri(a, c, d, N(ta), N(tb), N(ta), N(tm));
    }
  }
  const idx = THREE.ShapeUtils.triangulateShape(p.map(([r, y]) => new THREE.Vector2(r, y)), []);
  for (const [t, s] of [[t0, -1], [t1, 1]]) {
    const n = [s * Math.cos(t), 0, -s * Math.sin(t)];
    for (const [i, j, k] of idx) tri(P(...p[i], t), P(...p[j], t), P(...p[k], t), n, n, n, n);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  return geo;
}

/**
 * Ressort de matrice (fil rectangulaire à arêtes abattues) le long de Y, centré : rayon moyen R, fil w (radial) ×
 * h (axial), longueur len, n spires ; extrémités fermées par une face plane.
 */
export function dieSpringGeo(R, w, h, len, turns, perTurn = 14) {
  const c = Math.min(w, h) * 0.3;
  const sec = [[w / 2, -h / 2 + c], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c], [-w / 2 + c, -h / 2], [w / 2 - c, -h / 2]];
  const n = Math.round(turns * perTurn), m = sec.length;
  const pos = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * turns * Math.PI * 2;
    // Spire morte d'un demi-tour à chaque bout (appui à plat), pas constant entre les deux.
    const s = t * turns;
    const yc = s < 0.5 ? h / 2 + (s / 0.5) * 0.15 * h : s > turns - 0.5 ? len - h / 2 - ((turns - s) / 0.5) * 0.15 * h
      : h / 2 + 0.15 * h + ((s - 0.5) / (turns - 1)) * (len - h - 0.3 * h);
    for (const [dr, dy] of sec) pos.push((R + dr) * Math.cos(a), yc + dy - len / 2, (R + dr) * Math.sin(a));
  }
  const idx = [];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < m; k++) {
      const a = i * m + k, b = i * m + ((k + 1) % m), cc = a + m, d = b + m;
      idx.push(a, cc, b, b, cc, d);
    }
  }
  // Faces de bout.
  for (const i of [0, n]) {
    const base = i * m;
    for (let k = 1; k < m - 1; k++) idx.push(...(i === 0 ? [base, base + k, base + k + 1] : [base, base + k + 1, base + k]));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.userData.edgeAngle = 60;
  return geo;
}

// ---------------------------------------------------------------------------------------------------------
// Colonne : outils de construction dans le repère local (axe Y, d en pouces vers le bas).

export function colonne(api, sx) {
  const S = api.S;
  const yOf = (d) => -d * IN;
  /** Point (r, φ, d) du repère colonne. */
  const pol = (r, f, d = 0) => [sx * r * IN * Math.cos(f), yOf(d), r * IN * Math.sin(f)];
  /** Pièce tournée : profil [[r, d], …] en pouces, fermé ou non (orientation corrigée). */
  const L = (prof, m, seg = 64) => {
    let p = prof.map(([r, d]) => [r * IN, yOf(d)]);
    if (area(p) < 0) p = p.reverse();
    // Profil fermé : revolveGeo l'accepte tel quel (le dernier point rejoint le premier).
    const f = p[0], l = p[p.length - 1];
    if (f[0] !== l[0] || f[1] !== l[1]) p.push([...f]);
    return S.lathe(p, m, { seg });
  };
  /** Anneau plat de rOut à rIn, de d0 à d1, percé de trous [[r, φ, rh], …] parallèles à l'axe. */
  const slab = (rOut, rIn, d0, d1, holes, m, n = 72) => {
    const pts = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; pts.push([rOut * IN * Math.cos(a), rOut * IN * Math.sin(a)]); }
    const hs = [...(rIn > 0 ? [[0, 0, rIn * IN]] : []), ...holes.map(([r, f, rh]) => [sx * r * IN * Math.cos(f), -r * IN * Math.sin(f), rh * IN])];
    const mesh = S.extrude(pts, (d1 - d0) * IN, m, { holes: hs });
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = yOf((d0 + d1) / 2);
    const g = S.group(mesh);
    g.userData.hasInterior = true;
    return g;
  };
  /** Profil extrudé dans le plan ⟂ à l'axe (contour [[r, φ]] ou [[x, z]] local), de d0 à d1. */
  const plan = (pts, d0, d1, m, holes = []) => {
    const mesh = S.extrude(pts.map(([x, z]) => [x, -z]), (d1 - d0) * IN, m, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = yOf((d0 + d1) / 2);
    return S.group(mesh);
  };
  /** Secteur tourné (profil [[r, d]] pouces) de φ0 à φ1. */
  const sector = (prof, f0, f1, m, seg = 8) => new THREE.Mesh(sectorGeo(prof.map(([r, d]) => [r * IN, yOf(d)]), f0, f1, seg, sx), mat(m));
  /** Oriente un objet construit le long de +Y vers la direction radiale φ et le pose en (r, φ, d). */
  const radial = (obj, r, f, d) => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(sx * Math.cos(f), 0, Math.sin(f)));
    const g = S.group(obj);
    g.quaternion.copy(q);
    g.position.set(...pol(r, f, d));
    return g;
  };
  /** Pose un objet à (r, φ, d) sans rotation. */
  const put = (obj, r, f, d) => S.at(S.group(obj), pol(r, f, d));
  /** Direction radiale (repère de l'assemblage, axe le long de X) d'un angle φ, pour les éclatés. */
  const out = (f, k) => [0, k * Math.cos(f), k * Math.sin(f)];
  return { S, sx, pol, L, slab, plan, sector, radial, put, out, yOf };
}

// ---------------------------------------------------------------------------------------------------------
// Pièces normalisées (pouces → mètres).

/** Boulon à tête hexagonale 1/2-13 ou 3/4-10, tête sur d, tige vers +d (bas) ou vers −d (up = true). */
export function hexBolt(C, dia, len, r, f, d, { up = false, m = 'zinc', washer = false } = {}) {
  const b = C.S.bolt(dia * IN, len * IN, m, { axis: up ? '-y' : 'y', washer });
  return C.put(b, r, f, d);
}

/** Vis à tête cylindrique à six pans creux (SHCS) : tête Ø 1,5 d, hauteur d, empreinte ; tige vers +d ou vers −d. */
export function shcs(C, dia, len, r, f, d, { up = false, m = 'blackOxide' } = {}) {
  const R = (dia / 2) * IN, D = dia * IN, l = len * IN;
  const prof = [[0, -l], [R * 0.85, -l], [R, -l + R * 0.2], [R, 0], [0.75 * D, 0], [0.75 * D, D * 0.9], [0.7 * D, D], [0.42 * D, D], [0.42 * D, D * 0.45], [0, D * 0.45]];
  const g = C.S.lathe(prof, m, { seg: 20 });
  if (up) g.rotation.x = Math.PI;
  return C.put(g, r, f, d);
}

/** Écrou hexagonal (surplat af, hauteur h) posé d'aplomb, centre à d. */
export function hexNut(C, af, h, r, f, d, m = 'zinc') {
  return C.put(C.S.nut(af * IN, h * IN, m), r, f, d);
}

/** Rondelle Grower (fendue, vrillée suggérée) : rayons ext./int. et épaisseur en pouces, centre à d. */
export function lockWasher(C, ro, ri, t, r, f, d, m = 'blackOxide') {
  const geo = sectorGeo([[ri * IN, -t * IN / 2], [ro * IN, -t * IN / 2], [ro * IN, t * IN / 2], [ri * IN, t * IN / 2]], 8 * deg, 352 * deg, 18, 1);
  return C.put(new THREE.Mesh(geo, mat(m)), r, f, d);
}

/** Graisseur droit 1/4-28 (six pans 7/16, tête à bille), le long de +Y depuis sa base. */
export function zerk(S) {
  return S.group(
    S.cyl(0.0032, 0.006, 'brass', { pos: [0, 0.003, 0], seg: 12 }),
    S.at(S.nut(0.0111, 0.0055, 'brass'), [0, 0.0085, 0]),
    S.cyl(0.0035, 0.007, 'brass', { pos: [0, 0.0145, 0], seg: 12 }),
    S.at(S.ball(0.0042, 'brass'), [0, 0.0195, 0]),
  );
}

/**
 * Raccord coudé à 90° M-JIC #6 / M-NPT #4 (2501-0604), le long de +Y depuis la face où il se visse, sortie
 * coudée vers +X local ; bouchon femelle JIC #6 (0304C-06) en option.
 */
export function coudeJIC(S, cap = false) {
  const g = S.group(
    S.cyl(0.0085, 0.012, 'steel', { pos: [0, 0.006, 0], seg: 14 }), // filet NPT 1/4
    S.at(S.nut(0.0175, 0.009, 'steel'), [0, 0.0165, 0]),
    S.cyl(0.0085, 0.016, 'steel', { pos: [0, 0.029, 0], seg: 14 }),
    S.at(S.box(0.019, 0.019, 0.019, 'steel', { r: 0.004 }), [0, 0.04, 0]),
    S.cyl(0.0072, 0.03, 'steel', { axis: 'x', pos: [0.022, 0.04, 0], seg: 14 }), // embout JIC 9/16-18
  );
  if (cap) g.add(S.at(S.group(S.nut(0.0175, 0.012, 'steel'), S.cyl(0.0085, 0.003, 'steel', { pos: [0, 0.0065, 0], seg: 14 })), [0.036, 0.04, 0], [0, 0, -Math.PI / 2]));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// Joints (profils dans leur gorge, pouces).

/** Joint en U (U-cup) dans une gorge r a..b, d c..e ; lèvres ouvertes vers d croissant (open = 1) ou décroissant. */
export function uCup(C, a, b, c, e, open = 1, m = 'rubber') {
  const w = b - a, h = e - c;
  const [dh, dl] = open > 0 ? [c, e] : [e, c]; // talon, bout des lèvres
  const s = open > 0 ? 1 : -1;
  return C.L([[a, dh], [b, dh], [b, dl], [b - 0.18 * w, dl], [a + 0.5 * w, dl - s * 0.55 * h], [a + 0.18 * w, dl], [a, dl]], m, 72);
}

/** Bague d'usure (wear ring) : bande rectangulaire r a..b, d c..e. */
export function wearRing(C, a, b, c, e, m = 'blue') {
  return C.L([[a, c], [b, c], [b, e], [a, e]], m, 72);
}

/** Joint torique de section Ø t (pouces), rayon moyen R, centre à d. */
export function oRing(C, R, t, d) {
  return C.S.torus(R * IN, (t / 2) * IN, 'rubber', { pos: [0, -d * IN, 0] });
}

// ---------------------------------------------------------------------------------------------------------
// Pièces du haut commun (H), dans la colonne C. Chaque fonction renvoie l'objet (ou la liste d'objets) d'une ligne.

/** Bague de mandrin (chuck bushing A) : collerette percée des 3 boulons, fût dans l'adaptateur. */
export function bagueMandrin(C) {
  const b = H.bush;
  return C.S.group(
    C.slab(b.rf, b.ri, b.d0, b.d1, PHI.bush.map((f) => [H.bBush.r, f, 0.28]), 'steel'),
    C.L([[b.ri, b.d1], [b.rs, b.d1], [b.rs, b.d2 - 0.06], [b.rs - 0.06, b.d2], [b.ri, b.d2]], 'steel'),
  );
}

/** Adaptateur de chapeau 55-0004 : bride percée (boulons 3/4, entretoises du haut, vis de la plaque p. 24), col. */
export function adaptateurChapeau(C, m = 'steel') {
  const c = H.cap;
  const holes = [
    ...PHI.b34.map((f) => [H.b34.r, f, 0.41]),
    ...PHI.long.map((f) => [H.tie.r, f, 0.39]),
    ...[90, 270].map((a) => [H.b34.r, a * deg, 0.21]), // taraudages 1/2-13 des vis de la plaque support (p. 24)
  ];
  return C.S.group(
    C.slab(c.ro, c.rc, c.d0, c.d1, holes, m),
    // Col : fond du lamage de la bague (d 0,83), alésage, appui des mâchoires (d 1,85).
    C.L([[c.ri, H.bush.d1], [c.rc, H.bush.d1], [c.rc, c.d1], [c.rn, c.d1], [c.rn, c.d2], [c.ri + 0.08, c.d2], [c.ri, c.d2 - 0.08]], m),
  );
}

/** Porte-chapeau 55-0003 : couronne autour du col de l'adaptateur et bride des 9 boulons sur le carter. */
export function porteChapeau(C, m = 'steel') {
  const h = H.hold;
  return C.S.group(
    C.slab(h.rm, h.ri, h.d0, h.d2, [...PHI.b34.map((f) => [H.b34.r, f, 0.33]), ...PHI.long.map((f) => [H.tie.r, f, 0.39])], m),
    C.slab(h.ro, h.rm - 0.01, h.d1, h.d3, PHI.hold.map((f) => [H.bHold.r, f, 0.28]), m),
  );
}

/** Bol 55-0005 : cône des mâchoires, dessus conique, lamages des 6 boulons de 6 1/2 et passages des 3 de 8 po. */
export function bol(C, m = 'steel') {
  const b = H.bowl, rc = (d) => 3.17 - (d - b.d0) * TAN_JAW;
  const rIn = 3.5;
  return C.S.group(
    // Partie intérieure tournée : cône, dessus conique (parallèle au dessous du porte-chapeau), fond.
    C.L([[rc(b.d0), b.d0], [rIn, b.d0 + 0.07], [rIn, b.d3], [rc(b.d3), b.d3]], m),
    // Couronne percée.
    C.slab(b.ro, rIn - 0.005, b.d1, b.d2, [...PHI.short.map((f) => [H.tie.r, f, 0.44]), ...PHI.long.map((f) => [H.tie.r, f, 0.28])], m),
    C.slab(b.ro, rIn - 0.005, b.d2, b.d3 - 0.06, PHI.ties.map((f) => [H.tie.r, f, 0.28]), m),
    C.L([[rIn - 0.005, b.d3 - 0.06], [b.ro, b.d3 - 0.06], [b.ro - 0.06, b.d3], [rIn - 0.005, b.d3]], m),
  );
}

/** Mâchoires (9 objets) : secteurs coniques à plaquettes de carbure, à φ = 10° + 40k. */
export function machoires(C) {
  const j = H.jaw, rc = (d) => 3.17 - (d - H.bowl.d0) * TAN_JAW - 0.005;
  const half = j.half * deg;
  return PHI.jaws.map((fc) => {
    const g = C.S.group(C.sector([[j.rb, j.d0], [rc(j.d0), j.d0], [rc(j.d1), j.d1], [j.rb, j.d1]], fc - half, fc + half, 'darkSteel', 8));
    // Rainure de la face intérieure (dégagement entre les deux colonnes de plaquettes) et plaquettes.
    for (const [a, b] of j.rows) {
      for (const s of [-1, 1]) {
        const f0 = fc + s * 2.5 * deg, f1 = fc + s * (half - 2 * deg);
        g.add(C.sector([[j.ri, a], [j.rb + 0.01, a], [j.rb + 0.01, b], [j.ri, b]], Math.min(f0, f1), Math.max(f0, f1), 'gunmetal', 4));
      }
    }
    return g;
  });
}

/** Ressorts 55-0023 (18 objets), verts, dans les logements du carter. */
export function ressorts(C) {
  const s = H.spr;
  const geo = dieSpringGeo(s.rm * IN, s.w * IN, s.h * IN, (s.d1 - s.d0) * IN, s.turns);
  return PHI.springs.map((f) => C.put(new THREE.Mesh(geo, mat('green')), H.hsg.rp, f, (s.d0 + s.d1) / 2));
}

/** Entretoises du bas 55-0012 (9 objets) : tiges Ø 0,6 chanfreinées. */
export function entretoisesBas(C) {
  const p = H.post, l = p.d1 - p.d0;
  return PHI.posts.map((f) => C.put(C.L([[0, 0], [p.rr - 0.04, 0], [p.rr, 0.04], [p.rr, l - 0.04], [p.rr - 0.04, l], [0, l]], 'steel', 20), p.r, f, p.d0));
}

/** Entretoises du haut 55-0011 (3 objets) : tubes Ø 0,75 × Ø 0,53 de d 0,33 à 2,17. */
export function entretoisesHaut(C) {
  return PHI.long.map((f) => C.put(C.L([[0.27, 0], [0.375, 0], [0.375, H.bowl.d1 - H.cap.d0], [0.27, H.bowl.d1 - H.cap.d0]], 'steel', 20), H.tie.r, f, H.cap.d0));
}

/** Joints radiaux 55-0016 (9 objets) : bague à lèvre autour de chaque entretoise du bas, dans le plancher. */
export function jointsRadiaux(C) {
  const s = H.seal, ri = H.post.rr;
  return PHI.posts.map((f) => C.put(C.S.group(
    C.L([[ri + 0.12, 0], [s.ro, 0], [s.ro, s.d1 - s.d0], [ri + 0.12, s.d1 - s.d0]], 'steel', 24),
    C.L([[ri, 0.03], [ri + 0.12, 0.0], [ri + 0.12, s.d1 - s.d0 - 0.02], [ri + 0.03, s.d1 - s.d0 - 0.02], [ri, 0.12]], 'rubber', 24),
  ), H.post.r, f, s.d0));
}

/** Boulons de liaison bol → piston : [6 × 6 1/2 po, 3 × 8 po]. */
export function boulonsLiaison(C) {
  return {
    court: PHI.short.map((f) => hexBolt(C, 0.5, 6.5, H.tie.r, f, H.bowl.d2)),
    long: PHI.long.map((f) => hexBolt(C, 0.5, 8, H.tie.r, f, H.cap.d0)),
  };
}

/** Visserie du haut : 3 boulons de la bague, 3 boulons 3/4 de l'adaptateur, 9 boulons du porte-chapeau. */
export function visserieHaut(C) {
  return {
    bague: PHI.bush.map((f) => hexBolt(C, 0.5, 1.5, H.bBush.r, f, H.bush.d0)),
    b34: PHI.b34.map((f) => hexBolt(C, 0.75, 1.5, H.b34.r, f, H.cap.d0)),
    porte: PHI.hold.map((f) => hexBolt(C, 0.5, 2.25, H.bHold.r, f, H.hold.d1)),
  };
}

/** Logements des ressorts et taraudages du porte-chapeau (pour la tranche haute du carter). */
export function trousCarterHaut() {
  return [...PHI.springs.map((f) => [H.hsg.rp, f, H.hsg.ph]), ...PHI.hold.map((f) => [H.bHold.r, f, 0.21])];
}
/** Trous du plancher : entretoises (lamage des joints en haut), boulons de liaison. */
export function trousPlancher(lamage) {
  return [...PHI.posts.map((f) => [H.post.r, f, lamage ? H.seal.ro : H.post.rr + 0.02]), ...PHI.ties.map((f) => [H.tie.r, f, 0.28])];
}
