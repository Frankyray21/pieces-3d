// Découpe libre d'un 3 × 8 (P03) : la scie de la page P01, tenue à la
// verticale (lame vers le bas, patin posé sur le dessus de la planche), suit
// un trait tracé par l'utilisateur — droit ou courbe — et le scie.
//
// La planche est en porte-à-faux sur deux cales : on trace dans la partie qui
// dépasse. Un trait qui traverse le bois détache un morceau, qui tombe ; un
// trait qui s'arrête dans le bois laisse une entaille, d'où la scie ressort.
// Le trait est lissé : la lame, large de 19 mm, ne tourne pas dans son trait
// de 1,6 mm en dessous d'un rayon d'environ 70 mm.
//
// Attention : un 3 × 8 brut fait 76 mm d'épaisseur, plus que la capacité de
// 50 mm publiée pour le bois. La scène montre le geste, pas une capacité
// garantie par le fabricant. Cadence et avance sont celles de la lecture à
// l'écran. L'opérateur n'est pas montré.
//
// Repère de la scène, en millimètres : X en travers de la planche (0 à sa
// largeur), Y vers le haut depuis le sol, Z le long de la planche. Le plan du
// dessus se lit en points [x, z]. Modèle en mètres.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { AXE, LAME, PUBLIE, geometrie } from './scie.js';

const MM = 0.001;
const RAD = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (u) => { const t = clamp(u); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ décor (mm)

export const PLANCHE = { ep: 76.2, large: 203.2, z0: -520, z1: 580 }; // 3 × 8 brut (3 × 8 po), 1,10 m
export const CALE = { cote: 140, long: 320, z: [-430, -130] }; // deux bouts de 6 × 6
export const TRAIT = 1.6; // largeur du trait de scie
/** La coupe reste dans le porte-à-faux (z ≥ ZONE) : la lame dépasse sous la planche et passerait dans la cale. */
export const ZONE = -30;
/** Rayon mini du trait : flèche de la lame (19 mm) dans le jeu du trait (1,6 − 0,9 mm). */
export const RAYON = 70;
const Yb = CALE.cote, Yt = Yb + PLANCHE.ep;
const BAS = LAME.haut - LAME.soie / 2; // ligne des dents en avant de l'axe du coulisseau
const ANCRE = [PLANCHE.large / 2, PLANCHE.z0 + 40]; // point du morceau qui reste sur les cales
const AVANT = 10, APRES = 14; // la lame part avant le bord et le dépasse en sortant

// Déroulement à l'écran.
const VITESSE = 34; // avance (mm/s)
const CADENCE = 7; // courses par seconde
const DUREE = { approche: 1.1, lance: 0.65, frein: 0.4, retour: 1.0 };
const REPOS = { p: [-150, 250], haut: 70, t: [1, 0] }; // scie tenue debout derrière la planche : elle ne cache pas le bout où l'on trace

// ------------------------------------------------------------------ plan du dessus (points [x, z])

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const norme = (a) => Math.hypot(a[0], a[1]);
const unite = (a) => { const n = norme(a) || 1; return [a[0] / n, a[1] / n]; };
const vect = (a, b) => a[0] * b[1] - a[1] * b[0];
const longueur = (pts) => pts.reduce((s, p, i) => (i ? s + norme(sub(p, pts[i - 1])) : 0), 0);
const aire = (poly) => poly.reduce((s, p, i) => s + vect(p, poly[(i + 1) % poly.length]), 0) / 2;

/** Le point est-il dans le polygone ? */
export function dedans(poly, [x, z]) {
  let d = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) d = !d;
  }
  return d;
}

/** Croisement des segments ab et cd : positions t (sur ab) et u (sur cd), ou null. */
function croise(a, b, c, d) {
  const r = sub(b, a), s = sub(d, c), den = vect(r, s);
  if (Math.abs(den) < 1e-12) return null;
  const t = vect(sub(c, a), s) / den, u = vect(sub(c, a), r) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { t, u } : null;
}

/** Première traversée du bord du polygone par le segment ab, après la position t0 : { t, i, u, p }. */
function traversee(poly, a, b, t0 = 0) {
  let best = null;
  for (let i = 0; i < poly.length; i++) {
    const x = croise(a, b, poly[i], poly[(i + 1) % poly.length]);
    if (x && x.t > t0 && (!best || x.t < best.t)) best = { ...x, i };
  }
  return best && { ...best, p: add(a, sub(b, a), best.t) };
}

/** Points espacés de pas le long de la ligne (le dernier est gardé). */
function espacer(pts, pas) {
  const out = [pts[0]];
  let reste = pas;
  for (let i = 1; i < pts.length; i++) {
    let a = pts[i - 1];
    const b = pts[i];
    let d = norme(sub(b, a));
    while (d >= reste) {
      a = add(a, unite(sub(b, a)), reste);
      out.push(a);
      d -= reste;
      reste = pas;
    }
    reste -= d;
  }
  const fin = pts[pts.length - 1];
  if (norme(sub(fin, out[out.length - 1])) > pas * 0.3) out.push(fin); else out[out.length - 1] = fin;
  return out;
}

/** Trait lissé : tremblé de la main effacé, puis courbure ramenée sous 1 / rayon (bouts gardés). */
export function lisser(pts, rayon = RAYON) {
  let p = espacer(pts, 3);
  const adoucir = () => { p = p.map((q, i) => (i === 0 || i === p.length - 1 ? q : [0.25 * p[i - 1][0] + 0.5 * q[0] + 0.25 * p[i + 1][0], 0.25 * p[i - 1][1] + 0.5 * q[1] + 0.25 * p[i + 1][1]])); };
  const courbure = () => {
    let k = 0;
    for (let i = 2; i < p.length - 2; i++) {
      const a = unite(sub(p[i], p[i - 2])), b = unite(sub(p[i + 2], p[i]));
      k = Math.max(k, Math.abs(Math.asin(clamp(vect(a, b), -1, 1))) / (norme(sub(p[i + 2], p[i - 2])) / 2));
    }
    return k;
  };
  for (let i = 0; i < 6; i++) adoucir();
  for (let i = 0; i < 400 && courbure() > 1 / rayon; i++) { adoucir(); if (i % 8 === 7) p = espacer(p, 3); }
  return espacer(p, 3);
}

/**
 * Coupe possible dans le morceau poly le long du trait : la partie du trait
 * qui est dans le bois, de son entrée par un bord à sa sortie (coupe
 * traversante) ou à sa fin (entaille). Retourne { chemin, entree, sortie } ou
 * { erreur }.
 */
export function planifier(poly, trait) {
  if (trait.length < 2 || longueur(trait) < 12) return { erreur: 'Trait trop court : glissez sur la planche pour tracer la coupe.' };
  let q = lisser(trait);
  // La lame ne plonge pas dans le bois : un trait qui commence dans la planche est prolongé en arrière jusqu'au bord.
  if (dedans(poly, q[0])) {
    const dir = unite(sub(q[0], q[Math.min(6, q.length - 1)]));
    const avant = [];
    for (let d = 3; d <= 900; d += 3) {
      avant.unshift(add(q[0], dir, d));
      if (!dedans(poly, avant[0])) break;
    }
    if (dedans(poly, avant[0])) return { erreur: 'Le trait ne rejoint aucun bord de la planche.' };
    q = [...avant, ...q];
  }
  let entree = null, k0 = 0;
  for (let i = 0; i < q.length - 1 && !entree; i++) { entree = traversee(poly, q[i], q[i + 1]); k0 = i; }
  if (!entree) return { erreur: 'Le trait ne touche pas la planche.' };
  if (entree.p[1] < ZONE) return { erreur: 'Tracez dans la partie en porte-à-faux, à l\'écart des cales : la lame dépasse sous la planche.' };
  const chemin = [entree.p];
  let sortie = null;
  boucle: for (let i = k0; i < q.length - 1; i++) {
    const a = chemin[chemin.length - 1];
    let b = q[i + 1];
    if (norme(sub(b, a)) < 1e-6) continue;
    // La coupe s'arrête avant les cales…
    let stop = false;
    if (b[1] < ZONE) { b = add(a, sub(b, a), (a[1] - ZONE) / (a[1] - b[1])); stop = true; }
    // … et avant de recouper son propre trait (un morceau détaché au milieu du bois n'est pas géré).
    for (let j = 0; j < chemin.length - 4; j++) {
      const x = croise(a, b, chemin[j], chemin[j + 1]);
      if (x) { chemin.push(add(a, sub(b, a), Math.max(0, x.t - 3 / norme(sub(b, a))))); break boucle; }
    }
    const x = traversee(poly, a, b, 1e-7);
    if (x) { sortie = x; chemin.push(x.p); break; }
    chemin.push(b);
    if (stop) break;
  }
  if (longueur(chemin) < 8) return { erreur: 'Trait trop court dans le bois.' };
  return { chemin: espacer(chemin, 3), entree: { i: entree.i, u: entree.u }, sortie: sortie && { i: sortie.i, u: sortie.u } };
}

/** Direction du chemin au point i (moyenne des segments voisins). */
const tangente = (c, i) => unite(sub(c[Math.min(c.length - 1, i + 1)], c[Math.max(0, i - 1)]));

/** Point sur un bord du polygone, décalé de la demi-largeur du trait le long du bord (sens = ±1). */
function auBord(poly, i, p, dir, sens) {
  const e = unite(sub(poly[(i + 1) % poly.length], poly[i]));
  return add(p, e, (sens * (TRAIT / 2)) / Math.max(0.35, Math.abs(vect(e, dir))));
}

/** Sommets du bord, dans le sens du polygone, du bord i1 (après u1) au bord i2 (avant u2). */
function bordEntre(poly, i1, u1, i2, u2) {
  if (i1 === i2 && u2 > u1) return [];
  const out = [];
  for (let i = (i1 + 1) % poly.length; ; i = (i + 1) % poly.length) { out.push(poly[i]); if (i === i2) break; }
  return out;
}

/** Parois du trait : chemin décalé à gauche (g) et à droite (d) d'une demi-largeur. */
function parois(chemin) {
  const g = [], d = [];
  chemin.forEach((p, i) => {
    const t = tangente(chemin, i);
    g.push(add(p, [-t[1], t[0]], TRAIT / 2));
    d.push(add(p, [t[1], -t[0]], TRAIT / 2));
  });
  return { g, d };
}

/** Morceau entaillé : le polygone, avec le trait ouvert de l'entrée au bout du chemin. */
export function entailler(poly, chemin, entree) {
  if (chemin.length < 2) return poly;
  const { g, d } = parois(chemin), n = poly.length, dir = tangente(chemin, 0);
  g[0] = auBord(poly, entree.i, chemin[0], dir, -1);
  d[0] = auBord(poly, entree.i, chemin[0], dir, 1);
  return [...poly.slice(0, entree.i + 1), ...g, ...d.reverse(), ...poly.slice(entree.i + 1, n)];
}

/** Coupe traversante : les deux morceaux, de part et d'autre du trait (droite, puis gauche du chemin). */
export function separer(poly, chemin, entree, sortie) {
  const { g, d } = parois(chemin), m = chemin.length - 1;
  const de = tangente(chemin, 0), ds = tangente(chemin, m);
  g[0] = auBord(poly, entree.i, chemin[0], de, -1);
  d[0] = auBord(poly, entree.i, chemin[0], de, 1);
  g[m] = auBord(poly, sortie.i, chemin[m], ds, 1);
  d[m] = auBord(poly, sortie.i, chemin[m], ds, -1);
  const droite = [...bordEntre(poly, entree.i, entree.u, sortie.i, sortie.u), ...d.reverse()];
  const gauche = [...g, ...bordEntre(poly, sortie.i, sortie.u, entree.i, entree.u)];
  return [droite, gauche];
}

// ------------------------------------------------------------------ géométrie

/** Prisme (triangles en mm) d'un morceau : polygone [x, z] entre les hauteurs y0 et y1, autour du centre c. */
function prisme(poly, y0, y1, c = [0, 0]) {
  const pts = poly.map(([x, z]) => new THREE.Vector2(x - c[0], z - c[1]));
  const t = [];
  const tri = (a, b, d) => t.push(...a, ...b, ...d);
  const P = (i, y) => [pts[i].x, y, pts[i].y];
  for (const [a, b, d] of THREE.ShapeUtils.triangulateShape(pts, [])) {
    // Sens des sommets : normale vers le haut pour le dessus, vers le bas pour le dessous.
    const haut = (pts[b].y - pts[a].y) * (pts[d].x - pts[a].x) - (pts[b].x - pts[a].x) * (pts[d].y - pts[a].y) > 0;
    if (haut) { tri(P(a, y1), P(b, y1), P(d, y1)); tri(P(a, y0), P(d, y0), P(b, y0)); } else { tri(P(a, y1), P(d, y1), P(b, y1)); tri(P(a, y0), P(b, y0), P(d, y0)); }
  }
  // Chants : normale vers l'extérieur, selon le sens de parcours du polygone.
  const direct = aire(poly) > 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    if (direct) { tri(P(i, y1), P(j, y0), P(i, y0)); tri(P(i, y1), P(j, y1), P(j, y0)); } else { tri(P(i, y1), P(i, y0), P(j, y0)); tri(P(i, y1), P(j, y0), P(j, y1)); }
  }
  return t;
}

const hasard = (a, b, c) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };

/** Nuage de points de sciure (positions en mètres, n points au plus). */
function nuage(n, taille) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
  geo.setDrawRange(0, 0);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdcc296, size: taille, sizeAttenuation: true }));
  pts.frustumCulled = false;
  pts.raycast = () => {};
  return pts;
}

// ------------------------------------------------------------------ scène

export function P03(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); return obj; };

  // Scie : l'assemblage P01, posé et animé d'un bloc ; ses pièces mobiles sont animées dans son repère.
  const scie = put('1', api.sub('P01'), [0.15, 0.12, 0]);
  const de = (ref) => scie.userData.parts.filter((p) => p.userData.partRef === ref);
  const mobiles = ['1', '4', '5'].flatMap(de); // lame, manchon du serre-lame, coulisseau
  const [gachette] = de('13'), [bouton] = de('14');
  const feu = mat('lamp').clone();
  feu.name = 'djr183-lampe';
  de('7').forEach((p) => p.traverse((o) => { if (o.isMesh && o.material?.name === 'lamp') o.material = feu; }));
  const repos = new Map([...mobiles, gachette, bouton].map((p) => [p, p.userData.basePos || p.position.clone()]));

  // Planche : un maillage par morceau, refait quand le trait avance.
  const planche = put('2', S.group(), [0, 0, 0.1]);
  const bois = mat('wood');
  const morceau = (poly, c = null) => {
    const m = new THREE.Mesh(geometrie(prisme(poly, c ? -PLANCHE.ep / 2 : Yb, c ? PLANCHE.ep / 2 : Yt, c || [0, 0])), bois);
    m.userData.noEdges = true; // forme changeante : pas de contour figé
    planche.add(m);
    return m;
  };
  const refaire = (m, poly) => { m.geometry.dispose(); m.geometry = geometrie(prisme(poly, Yb, Yt)); };
  // Trait tracé : ruban sombre posé sur le dessus de la planche.
  const vide = () => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
  // Matériau standard : les états de survol et de sélection de la visionneuse lui donnent une émission.
  const crayon = new THREE.Mesh(vide(), Object.assign(new THREE.MeshStandardMaterial({ color: 0x2a1f1a, roughness: 1, metalness: 0, side: THREE.DoubleSide }), { name: 'djr183-crayon' }));
  crayon.userData.noEdges = true;
  crayon.raycast = () => {};
  crayon.frustumCulled = false;
  crayon.visible = false;
  planche.add(crayon);
  const ruban = (pts) => {
    crayon.visible = pts.length > 1;
    if (!crayon.visible) return;
    const pos = [];
    pts.forEach((p, i) => {
      const t = tangente(pts, i);
      for (const s of [1, -1]) pos.push((p[0] - t[1] * s) * MM, (Yt + 0.4) * MM, (p[1] + t[0] * s) * MM);
    });
    const idx = [];
    for (let i = 0; i < pts.length - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    crayon.geometry.dispose();
    crayon.geometry = new THREE.BufferGeometry();
    crayon.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    crayon.geometry.setIndex(idx);
  };

  for (const z of CALE.z) put('3', S.box(CALE.long * MM, CALE.cote * MM, CALE.cote * MM, 'wood', { pos: [(PLANCHE.large / 2) * MM, (CALE.cote / 2) * MM, z * MM] }), [0, -0.08, 0]);
  const grains = nuage(420, 0.003), depot = nuage(2400, 0.0026);
  put('4', S.group(grains, depot), [0, -0.05, 0.1]);

  // ---------------------------------------------------------------- état

  const etat = {
    poly: null, // morceau qui reste sur les cales
    maille: null,
    tombes: [], // morceaux détachés : { maille, t, ... }
    coupe: null, // coupe en cours
    horloge: 0,
    phase: 0, // phase de la lame (rad)
    regime: 0,
    presse: 0, // gâchette
    journal: [], // [instant, avance, régime] : d'où part chaque grain de sciure
    depots: 0,
    pose: null,
    message: '',
  };

  /** Pose de la scie debout : dents au point p du plan, tournées vers t ; haut : patin au-dessus de la planche (mm). */
  const debout = (p, t, haut = 0.5) => ({ p: [p[0], p[1]], t: unite(t), haut });
  const melange = (a, b, k) => {
    // Rotation par le plus court chemin entre les deux directions.
    const aa = Math.atan2(a.t[1], a.t[0]);
    let d = Math.atan2(b.t[1], b.t[0]) - aa;
    d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
    const ang = aa + d * k;
    return { p: [a.p[0] + (b.p[0] - a.p[0]) * k, a.p[1] + (b.p[1] - a.p[1]) * k], t: [Math.cos(ang), Math.sin(ang)], haut: a.haut + (b.haut - a.haut) * k + 45 * Math.sin(Math.PI * k) };
  };
  const U = new THREE.Vector3(0, 1, 0), base = new THREE.Matrix4(), q = new THREE.Quaternion(), bascule = new THREE.Quaternion();
  /** Place la scie : axe vertical, dents (en avant de l'axe) au point de la pose. */
  const placer = (pose) => {
    const [tx, tz] = pose.t, w = etat.regime, h = etat.horloge;
    const V = new THREE.Vector3(-tx, 0, -tz), W = new THREE.Vector3().crossVectors(U, V);
    q.setFromRotationMatrix(base.makeBasis(U, V, W));
    // En marche : léger balancement d'avant en arrière et vibrations.
    bascule.setFromAxisAngle(W, (1.6 * Math.sin(2 * Math.PI * 0.9 * h) + 0.12 * Math.sin(2 * Math.PI * 17 * h)) * w * RAD);
    scie.quaternion.copy(bascule).multiply(q);
    const o = new THREE.Vector3((pose.p[0] - BAS * tx) * MM, (Yt + pose.haut + 0.3 * w * Math.sin(2 * Math.PI * 23 * h)) * MM, (pose.p[1] - BAS * tz) * MM);
    scie.position.copy(o).sub(new THREE.Vector3(0, AXE * MM, 0).applyQuaternion(scie.quaternion));
    const recul = PUBLIE.course * (0.5 - 0.5 * Math.cos(etat.phase));
    for (const p of mobiles) p.position.copy(repos.get(p)).x += recul * MM;
    gachette.position.copy(repos.get(gachette)).add(new THREE.Vector3(0.0012, 0.0034, 0).multiplyScalar(etat.presse));
    bouton.position.copy(repos.get(bouton)).z -= 0.0025 * smooth(etat.presse * 2);
    feu.emissiveIntensity = 0.06 + 1.9 * smooth(etat.presse * 3);
    etat.pose = pose;
  };

  /** Point et direction du chemin à l'avance s (mm) ; prolongé tout droit avant l'entrée et après la sortie. */
  const enS = (c, s) => {
    const L = c.long;
    if (s <= 0) return { p: add(c.chemin[0], c.t0, s), t: c.t0 };
    if (s >= L) return { p: add(c.chemin[c.chemin.length - 1], c.t1, s - L), t: c.t1 };
    const i = Math.min(c.chemin.length - 2, Math.floor(s / c.pas)), f = s / c.pas - i;
    const a = tangente(c.chemin, i), b = tangente(c.chemin, i + 1);
    return { p: add(c.chemin[i], sub(c.chemin[i + 1], c.chemin[i]), f), t: unite([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]) };
  };

  const neuve = () => {
    for (const t of etat.tombes) { planche.remove(t.maille); t.maille.geometry.dispose(); }
    if (etat.maille) { planche.remove(etat.maille); etat.maille.geometry.dispose(); }
    Object.assign(etat, { tombes: [], coupe: null, regime: 0, presse: 0, phase: 0, journal: [], depots: 0 });
    etat.poly = [[0, PLANCHE.z0], [PLANCHE.large, PLANCHE.z0], [PLANCHE.large, PLANCHE.z1], [0, PLANCHE.z1]];
    etat.maille = morceau(etat.poly);
    grains.geometry.setDrawRange(0, 0);
    depot.geometry.setDrawRange(0, 0);
    ruban([]);
    placer(debout(REPOS.p, REPOS.t, REPOS.haut));
    etat.message = '';
  };

  /** Lâche un morceau détaché : il tombe à plat sous la planche, en s'écartant du morceau qui reste. */
  const lacher = (poly, c) => {
    const n = poly.length, centre = poly.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
    const milieu = c.chemin[Math.floor(c.chemin.length / 2)];
    const dir = unite(sub(centre, milieu));
    const portee = Math.max(...poly.map((p) => Math.abs((p[0] - centre[0]) * dir[0] + (p[1] - centre[1]) * dir[1])));
    const boite = (g) => { const xs = poly.map((p) => p[0] + g[0]), zs = poly.map((p) => p[1] + g[1]); return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]; };
    const glisse = [dir[0] * 28, dir[1] * 28], b = boite(glisse);
    // Il se pose sur les morceaux déjà tombés qu'il recouvre.
    const sous = Math.max(0, ...etat.tombes.filter((o) => o.boite[0] < b[1] && o.boite[1] > b[0] && o.boite[2] < b[3] && o.boite[3] > b[2]).map((o) => o.dessus));
    const k = etat.tombes.length;
    etat.tombes.push({
      maille: morceau(poly, centre), t: 0, centre, dir, glisse, portee, boite: b,
      sol: sous + PLANCHE.ep / 2, dessus: sous + PLANCHE.ep,
      lacet: (hasard(k, 1, 2) - 0.5) * 16, pique: 10 + 8 * hasard(k, 3, 4),
    });
  };
  const axe = new THREE.Vector3(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  /** Pose d'un morceau tombé, t secondes après qu'il est détaché ; retourne vrai tant qu'il bouge. */
  const tomber = (o) => {
    const y0 = (Yb + Yt) / 2, chute = Math.sqrt((2 * (y0 - o.sol)) / 9810), rebond = chute + 0.36;
    const pose = (a) => o.sol - PLANCHE.ep / 2 + (PLANCHE.ep / 2) * Math.cos(a * RAD) + o.portee * Math.sin(a * RAD);
    let y, a, g, l;
    if (o.t < chute) {
      a = o.pique * (o.t / chute) ** 1.5; g = 0.25 * (o.t / chute); l = 0;
      y = Math.max(y0 - 4905 * o.t * o.t, pose(a));
    } else {
      const s = clamp((o.t - chute) / (rebond - chute));
      a = o.pique * (1 - smooth(s)); g = 0.25 + 0.75 * smooth(s); l = o.lacet * smooth(s);
      y = pose(a) + 14 * 4 * s * (1 - s);
    }
    // Il pique du côté opposé au trait : rotation autour de l'axe horizontal perpendiculaire à sa fuite.
    axe.set(o.dir[1], 0, -o.dir[0]);
    o.maille.quaternion.copy(qa.setFromAxisAngle(U, l * RAD)).multiply(qb.setFromAxisAngle(axe, -a * RAD));
    o.maille.position.set((o.centre[0] + o.glisse[0] * g) * MM, y * MM, (o.centre[1] + o.glisse[1] * g) * MM);
    return o.t < rebond;
  };

  /** Lance la coupe le long d'un trait (points [x, z] en mm). Retourne { ok, message }. */
  const couper = (trait) => {
    if (etat.coupe) return { ok: false, message: 'Coupe en cours.' };
    const plan = planifier(etat.poly, trait);
    if (plan.erreur) { ruban([]); etat.message = plan.erreur; return { ok: false, message: plan.erreur }; }
    const c = plan.chemin, m = c.length - 1;
    etat.coupe = {
      ...plan, long: longueur(c), pas: longueur(c) / m, t0: tangente(c, 0), t1: tangente(c, m),
      etape: 'approche', t: 0, s: -AVANT, depart: etat.pose, vu: -1,
    };
    ruban(c);
    etat.message = plan.sortie
      ? `Coupe traversante de ${Math.round(etat.coupe.long)} mm : le morceau détaché tombera.`
      : `Entaille de ${Math.round(etat.coupe.long)} mm : la scie ressortira par son trait.`;
    return { ok: true, message: etat.message };
  };

  /** Sciure : grains nés au front de coupe (dessus : rejetés vers l'arrière ; dessous : ils tombent), dépôt au sol. */
  const sciure = () => {
    const pos = grains.geometry.attributes.position.array, n = pos.length / 3, VIE = 0.8, G = 5000, J = etat.journal;
    let k = 0, j0 = J.length - 1;
    for (let j = 0; j < n && J.length; j++) {
      const dec = ((j * 0.61803) % 1) * VIE, tour = Math.floor((etat.horloge - dec) / VIE), age = etat.horloge - dec - tour * VIE, ne = etat.horloge - age;
      while (j0 > 0 && J[j0][0] > ne) j0--;
      let i = j0;
      while (i < J.length - 1 && J[i + 1][0] <= ne) i++;
      const [tn, sn, wn, cn] = J[i];
      if (Math.abs(tn - ne) > 0.12 || wn < 0.3 || sn < 0 || sn > cn.long) continue;
      const r = (x) => hasard(j, tour, x), { p, t } = enS(cn, sn), lat = [-t[1], t[0]];
      let x, y, z;
      if (r(0) < 0.5) {
        const v = 40 + 230 * r(2), l = (r(4) - 0.5) * 260;
        x = p[0] - t[0] * v * age + lat[0] * l * age; z = p[1] - t[1] * v * age + lat[1] * l * age;
        y = Yt + 1 + (300 + 450 * r(3)) * age - 0.5 * G * age * age;
        y = Math.max(y, dedans(etat.poly, [x, z]) ? Yt + 0.8 : 0.8);
      } else {
        const v = (r(2) - 0.5) * 220, l = (r(4) - 0.5) * 150;
        x = p[0] + t[0] * v * age + lat[0] * l * age; z = p[1] + t[1] * v * age + lat[1] * l * age;
        y = Math.max(0.8, Yb - 2 - (250 + 400 * r(3)) * age - 0.5 * G * age * age);
      }
      pos[k++] = x * MM; pos[k++] = y * MM; pos[k++] = z * MM;
    }
    grains.geometry.setDrawRange(0, k / 3);
    grains.geometry.attributes.position.needsUpdate = true;
  };
  const deposer = (c) => {
    const pos = depot.geometry.attributes.position.array, n = pos.length / 3;
    const cran = Math.floor(clamp(c.s, 0, c.long) / 4);
    for (; c.vu < cran; c.vu++) {
      const { p, t } = enS(c, (c.vu + 1) * 4);
      for (let g = 0; g < 4; g++) {
        const i = etat.depots++ % n, a = hasard(etat.depots, g, 1) * 2 * Math.PI, d = 34 * Math.sqrt(hasard(etat.depots, g, 2));
        pos[i * 3] = (p[0] + Math.cos(a) * d + t[0] * 4) * MM; pos[i * 3 + 1] = 0.0008; pos[i * 3 + 2] = (p[1] + Math.sin(a) * d) * MM;
      }
    }
    depot.geometry.setDrawRange(0, Math.min(n, etat.depots));
    depot.geometry.attributes.position.needsUpdate = true;
  };

  /** Fait avancer la scène de dt secondes. Retourne vrai tant que quelque chose bouge. */
  const avancer = (dt) => {
    etat.horloge += dt;
    let bouge = false;
    const c = etat.coupe;
    if (c) {
      bouge = true;
      c.t += dt;
      const entree = debout(enS(c, -AVANT).p, c.t0);
      if (c.etape === 'approche') {
        placer(melange(c.depart, entree, smooth(c.t / DUREE.approche)));
        if (c.t >= DUREE.approche) { c.etape = 'lance'; c.t = 0; }
      } else if (c.etape === 'lance') {
        etat.presse = smooth(c.t / 0.3);
        etat.regime = smooth((c.t - 0.25) / (DUREE.lance - 0.25));
        placer(entree);
        if (c.t >= DUREE.lance) { c.etape = 'coupe'; c.t = 0; }
      } else if (c.etape === 'coupe') {
        const fin = c.long + (c.sortie ? APRES : 0);
        c.s = Math.min(fin, c.s + VITESSE * dt);
        const front = clamp(c.s, 0, c.long);
        // Le trait suit les dents : morceau refait avec l'entaille jusqu'au front.
        const i = Math.floor(front / c.pas), reste = front - i * c.pas;
        const fait = c.chemin.slice(0, i + 1);
        if (reste > 0.3 && i < c.chemin.length - 1) fait.push(enS(c, front).p);
        if (c.sortie && front >= c.long) {
          if (!c.separe) {
            const [droite, gauche] = separer(etat.poly, c.chemin, c.entree, c.sortie);
            const garde = dedans(droite, ANCRE) ? droite : gauche, part = garde === droite ? gauche : droite;
            etat.poly = garde;
            refaire(etat.maille, garde);
            if (Math.abs(aire(part)) > 20) lacher(part, c);
            c.separe = true;
            ruban([]);
          }
        } else {
          refaire(etat.maille, entailler(etat.poly, fait, c.entree));
          ruban(c.chemin.slice(Math.min(c.chemin.length - 1, i + 1)));
        }
        deposer(c);
        placer(debout(enS(c, c.s).p, enS(c, c.s).t));
        if (c.s >= fin) {
          if (!c.sortie) etat.poly = entailler(etat.poly, c.chemin, c.entree);
          c.etape = 'frein'; c.t = 0;
        }
      } else if (c.etape === 'frein') {
        etat.presse = 1 - smooth(c.t / 0.2);
        etat.regime = 1 - smooth(c.t / DUREE.frein);
        if (c.t >= DUREE.frein) { c.etape = c.sortie ? 'retour' : 'recul'; c.t = 0; c.depart = etat.pose; ruban([]); }
        else placer(etat.pose);
      } else if (c.etape === 'recul') {
        // Entaille : la scie, arrêtée, ressort par son trait.
        c.s = Math.max(-AVANT, c.s - 110 * dt);
        placer(debout(enS(c, c.s).p, enS(c, c.s).t));
        if (c.s <= -AVANT) { c.etape = 'retour'; c.t = 0; c.depart = etat.pose; }
      } else {
        placer(melange(c.depart, debout(REPOS.p, REPOS.t, REPOS.haut), smooth(c.t / DUREE.retour)));
        if (c.t >= DUREE.retour) { etat.coupe = null; etat.message = c.sortie ? 'Coupe terminée. Tracez un autre trait, ou prenez une nouvelle planche.' : 'Entaille terminée. Tracez un autre trait, ou prenez une nouvelle planche.'; }
      }
      etat.phase += 2 * Math.PI * CADENCE * etat.regime * dt;
      etat.journal.push([etat.horloge, c.s, c.etape === 'coupe' ? etat.regime : 0, c]);
      if (etat.journal.length > 400) etat.journal.splice(0, 100);
    }
    for (const o of etat.tombes) { if (o.fini) continue; o.t += dt; if (tomber(o)) bouge = true; else o.fini = true; }
    // Les derniers grains finissent de tomber.
    const dernier = etat.journal[etat.journal.length - 1];
    if (dernier && etat.horloge - dernier[0] < 1) bouge = true;
    sciure();
    return bouge;
  };

  // Exemples de traits (mm), placés d'après le bout libre de la planche (zf) : en S en travers, coin arrondi, biais.
  const W = PLANCHE.large;
  const EXEMPLES = [
    (zf) => Array.from({ length: 60 }, (_, i) => { const x = -25 + ((W + 50) * i) / 59; return [x, zf - 240 + 24 * Math.sin((2 * Math.PI * x) / 260)]; }),
    (zf) => Array.from({ length: 40 }, (_, i) => { const a = -0.25 + 2.05 * (i / 39); return [W + 12 - 150 * Math.cos(a), zf + 12 - 150 * Math.sin(a)]; }),
    (zf) => [[-20, zf - 110], [W + 20, zf - 200]],
  ];
  let exemple = 0;
  /** Coupe d'exemple suivante ; sur une planche trop courte, une planche entière est remise d'abord. */
  const montrer = () => {
    if (etat.coupe) return { ok: false, message: 'Coupe en cours.' };
    // Bout libre : là où la planche a encore toute sa largeur, en venant de son extrémité.
    const bout = () => {
      for (let z = PLANCHE.z1; z > ZONE; z -= 5) if ([0.1, 0.5, 0.9].every((f) => dedans(etat.poly, [W * f, z - 2]))) return z;
      return ZONE;
    };
    if (bout() - ZONE < 330) neuve();
    return couper(EXEMPLES[exemple++ % EXEMPLES.length](bout()));
  };

  neuve();

  const view = {
    dir: [0.9, 0.6, 1],
    // Découpe libre (fonction « decoupe » de l'interface) : points du plan du dessus en mètres [x, z].
    decoupe: {
      surface: { y: Yt * MM, x0: -0.06, x1: (W + 60) * MM, z0: (ZONE - 20) * MM, z1: (PLANCHE.z1 + 60) * MM },
      rayon: RAYON,
      occupe: () => !!etat.coupe,
      message: () => etat.message,
      apercu: (pts) => ruban((pts || []).map(([x, z]) => [x / MM, z / MM])),
      couper: (pts) => couper(pts.map(([x, z]) => [x / MM, z / MM])),
      exemple: montrer,
      avancer,
      neuve,
    },
  };
  return { view };
}
