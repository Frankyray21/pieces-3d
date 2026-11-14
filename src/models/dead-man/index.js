// Poignée d'homme mort (« dead man », interrupteur de validation à 3 positions)
// Tormach 51213, « Hold-to-Run Safety Switch » du robot ZA6 : reconstitution
// d'après deux photos du produit (P01 : poignée tenue en main ; P02 : poignée
// de côté, câble lové et connecteur), sans plan ni cote.
//
// Seules deux données sont publiées par Tormach : le câble de 4 m et le
// connecteur M12. Tout le reste est estimé : la longueur du boîtier (environ
// 150 mm) vient de la main de la photo P01 (les quatre doigts couvrent un peu
// plus de la moitié du boîtier) et de l'écrou du connecteur M12 de la photo
// P02 ; les autres dimensions sont relevées en proportion sur la vue de côté
// P02. Précision : environ 15 %.
//
// Repère de la poignée, en millimètres : Y du bas du boîtier vers la tête,
// Z vers l'avant (côté des doigts, coque noire), X vers le flanc qui porte
// l'étiquette ; z = 0 est le plan de joint des deux coques. Modèle : poignée
// couchée sur une table (Y = 0), tête vers −X, étiquette vers le haut, mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (mm, estimées)

export const L = 150; // boîtier, du bas de la coque jaune au faîte de la tête
export const LARGEUR = { tete: 40, prise: 32, base: 40 };
export const JAUNE = { base: 29, prise: 24, tete: 28, pente: 20 }; // profondeur derrière le joint ; pente du dessus (degrés)
export const NOIR = { flanc: 8.4, nez: 23.2, garde: 26, pied: 14, piedZ0: 4.5 }; // avancée devant le joint ; le pied commence à 4,5 mm du joint
export const BOUTON = { y0: 55, y1: 121, large: 18, saillie: 20.5 }; // barre du bouton : saillie mesurée depuis le joint
const NERVURES = [60, 72, 84, 96, 108]; // nervures des flancs, tous les 12 mm
const ETIQUETTE = { y0: 15, y1: 42, z0: -8, z1: -25.5 };
// Empreintes du flanc de la coque jaune [y, z, long, large, angle°].
const EMPREINTES = [[137, -19.6, 7, 3.5, -30], [62.8, -14.4, 3, 4, 0], [14, -5.5, 4, 2, 0]];
const VIS = { y: [4, -2.5], z0: NOIR.pied, long: 7.5, r: 2.25 };

// Presse-étoupe et sortie de câble, dans l'axe z = −11 de la coque jaune.
const AXE_Z = -11;
export const PRESSE = { plats: 24, long: 27 }; // six-pans de 24 mm sur plats (taille M20 estimée)
export const SPIRALE = { long: 53, tours: 6.5, r0: 8.3, r1: 4.7, fil0: 2.2, fil1: 1.8 }; // Ø 21 mm au presse-étoupe, 13 mm au bout
export const CABLE = { d: 5.5, long: 4000 }; // 4 m : donnée publiée
const LOVE = { pas: 6.6, tours: 5, cx: 140, couche: 5.6, queue: 100 }; // câble lové en deux couches
export const M12 = { long: 44, r: 7.25, ecrou: 7.5 }; // rayon du corps et de l'écrou moleté

const COUCHE = LARGEUR.base / 2; // la poignée repose sur son flanc : axe à 20 mm de la table

// ------------------------------------------------------------------ outils

const S01 = (t) => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };
/** Valeur interpolée en douceur entre des paliers [[y, v], ...] rangés par y. */
function palier(cles, y) {
  if (y <= cles[0][0]) return cles[0][1];
  for (let i = 1; i < cles.length; i++) {
    const [y0, v0] = cles[i - 1], [y1, v1] = cles[i];
    if (y <= y1) return v0 + (v1 - v0) * S01((y - y0) / (y1 - y0));
  }
  return cles[cles.length - 1][1];
}

/** Largeur du boîtier à la hauteur y : base et tête larges, prise plus étroite. */
export const largeur = (y) => palier([[42, LARGEUR.base], [54, LARGEUR.prise], [112, LARGEUR.prise], [122, LARGEUR.tete]], y);
/** Profondeur de la coque jaune derrière le joint. */
export const profondeurJaune = (y) => palier([[42, JAUNE.base], [52, JAUNE.prise], [100, JAUNE.prise], [116, JAUNE.tete]], y);

/**
 * Section en D dans le plan XZ : à plat sur z = z0, bombée jusqu'à z0 + s·d,
 * coins extérieurs arrondis au rayon r. Toujours 2n + 4 points.
 */
function sectionD(w, d, r, s, z0 = 0, n = 6) {
  const h = w / 2;
  r = Math.max(0.02, Math.min(r, h, d));
  const pts = [[h, 0]];
  for (let i = 0; i <= n; i++) { const a = (i / n) * 90 * RAD; pts.push([h - r + r * Math.cos(a), d - r + r * Math.sin(a)]); }
  for (let i = 0; i <= n; i++) { const a = (90 + (i / n) * 90) * RAD; pts.push([-h + r + r * Math.cos(a), d - r + r * Math.sin(a)]); }
  pts.push([-h, 0]);
  return pts.map(([x, z]) => [x, z0 + s * z]);
}

/**
 * Volume fermé passant par des sections [{ y, pts: [[x, z], ...], dy(z) }] de
 * même nombre de points ; dy décale chaque point le long de Y (dessus en pente).
 * Arêtes de moins de 30° lissées, les autres vives.
 */
function gabarit(sections) {
  const n = sections[0].pts.length;
  const rings = sections.map(({ y, pts, dy }) => pts.map(([x, z]) => [x * MM, (y + (dy ? dy(z) : 0)) * MM, z * MM]));
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1];
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      tri(A[j], A[k], B[k]);
      tri(A[j], B[k], B[j]);
    }
  }
  const bouche = (ring, sens) => {
    const c = [0, 0, 0];
    ring.forEach((p) => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      if (sens) tri(c, ring[k], ring[j]); else tri(c, ring[j], ring[k]);
    }
  };
  bouche(rings[0], true);
  bouche(rings[rings.length - 1], false);
  // Faces tournées vers l'extérieur : volume signé positif, sinon triangles retournés.
  let vol = 0;
  for (let i = 0; i < pos.length; i += 9) {
    vol += pos[i] * (pos[i + 4] * pos[i + 8] - pos[i + 5] * pos[i + 7])
      - pos[i + 1] * (pos[i + 3] * pos[i + 8] - pos[i + 5] * pos[i + 6])
      + pos[i + 2] * (pos[i + 3] * pos[i + 7] - pos[i + 4] * pos[i + 6]);
  }
  if (vol < 0) for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return creaseNormals(geo, 30 * RAD);
}

/** Bout arrondi au rayon rr : sections rentrées de y0 (bout) vers l'intérieur ; sens = +1 vers +Y. */
function bout(y0, rr, sens, section) {
  const out = [];
  for (let k = 0; k <= 4; k++) {
    const a = (k / 4) * 90 * RAD;
    out.push({ y: y0 + sens * rr * (1 - Math.cos(a)), ...section(rr * (1 - Math.sin(a))) });
  }
  return sens > 0 ? out : out.reverse();
}

/** Repère transporté le long d'une ligne brisée : tangente, normale et binormale en chaque point. */
function reperes(pts) {
  const n = pts.length;
  const T = pts.map((p, i) => pts[Math.min(n - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  const N = [], B = [];
  let nrm = new THREE.Vector3(0, 1, 0);
  if (Math.abs(T[0].dot(nrm)) > 0.9) nrm = new THREE.Vector3(0, 0, 1);
  nrm.sub(T[0].clone().multiplyScalar(nrm.dot(T[0]))).normalize();
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const axe = T[i - 1].clone().cross(T[i]);
      const s = axe.length();
      if (s > 1e-9) nrm = nrm.clone().applyAxisAngle(axe.normalize(), Math.asin(Math.min(1, s)));
      nrm.sub(T[i].clone().multiplyScalar(nrm.dot(T[i]))).normalize();
    }
    N.push(nrm.clone());
    B.push(T[i].clone().cross(nrm).normalize());
  }
  return { T, N, B };
}

/** Tube de rayon r (nombre ou fonction du rang) le long d'une ligne brisée serrée, bouts fermés. */
function tuyau(pts, r, radial = 10) {
  const { T, N, B } = reperes(pts);
  const rayon = typeof r === 'function' ? r : () => r;
  const pos = [], nor = [], idx = [];
  pts.forEach((p, i) => {
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * 2 * Math.PI;
      const d = N[i].clone().multiplyScalar(Math.cos(a)).add(B[i].clone().multiplyScalar(Math.sin(a)));
      pos.push(p.x + d.x * rayon(i), p.y + d.y * rayon(i), p.z + d.z * rayon(i));
      nor.push(d.x, d.y, d.z);
    }
  });
  for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
    idx.push(a, b, d, a, d, c);
  }
  // Bouts : disque fermé, normale le long de la tangente.
  for (const [i, s] of [[0, -1], [pts.length - 1, 1]]) {
    const base = pos.length / 3;
    pos.push(pts[i].x, pts[i].y, pts[i].z);
    nor.push(T[i].x * s, T[i].y * s, T[i].z * s);
    for (let j = 0; j < radial; j++) {
      const k = i * radial + j;
      pos.push(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]);
      nor.push(T[i].x * s, T[i].y * s, T[i].z * s);
    }
    for (let j = 0; j < radial; j++) {
      const a = base + 1 + j, b = base + 1 + ((j + 1) % radial);
      if (s > 0) idx.push(base, a, b); else idx.push(base, b, a);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  geo.userData.edgeAngle = 70; // pas de contours le long du tube
  return geo;
}

// Matériaux hors palette, créés une fois.
const perso = new Map();
function teinte(nom, params, finition = null) {
  let m = perso.get(nom);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.55, ...params });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    if (finition) withFinish(m, finition);
    perso.set(nom, m);
  }
  return m;
}
// Jaune de sécurité du boîtier (plastique moulé) et teinte plus sombre des empreintes.
const jaune = () => teinte('dead-man-jaune', { color: 0xe6b417, roughness: 0.48 }, 'plastic');
const jauneOmbre = () => teinte('dead-man-jaune-ombre', { color: 0x9c7a0c, roughness: 0.7 });

/** Image dessinée sur un canevas (aucune hors navigateur : la couleur unie reste). */
function image(nom, w, h, dessin) {
  if (typeof document === 'undefined') return null;
  if (perso.has(`img:${nom}`)) return perso.get(`img:${nom}`);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  perso.set(`img:${nom}`, t);
  return t;
}

// ------------------------------------------------------------------ boîtier (repère de la poignée)

/** Repère 1 : coque arrière jaune, côté paume ; dessus en pente vers l'arrière. */
function coqueJaune() {
  const pente = Math.tan(JAUNE.pente * RAD);
  const dy = (y) => (z) => -S01((y - 125) / (L - 125)) * Math.abs(z) * pente;
  const sec = (y, rentre = 0) => ({ pts: sectionD(largeur(y) - 2 * rentre, profondeurJaune(y) - rentre, 4 - rentre, -1), dy: dy(y) });
  const sections = [...bout(0, 2.5, 1, (e) => sec(2.5, e))];
  for (let y = 4; y <= L - 3; y += 2) sections.push({ y, ...sec(y) });
  sections.push(...bout(L, 3, -1, (e) => sec(L, e)));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(gabarit(sections), jaune()));
  // Empreintes des flancs : relevées sur le flanc de l'étiquette, supposées symétriques.
  for (const cote of [1, -1]) for (const [y, z, long, large, angle] of EMPREINTES) {
    const e = new THREE.Mesh(new THREE.PlaneGeometry(long * MM, large * MM), jauneOmbre());
    e.rotation.set(0, (cote * Math.PI) / 2, angle * RAD * cote, 'YXZ'); // tournée dans son plan, puis vers le flanc
    e.position.set(cote * (largeur(y) / 2 + 0.03) * MM, y * MM, z * MM);
    g.add(e);
  }
  return g;
}

/** Profil de la coque noire [y, largeur, avancée, rayon, départ en z] : pied, garde, flancs, nez et dôme de la tête. */
function profilNoir() {
  const p = [
    [-5, 30, NOIR.pied, 3, NOIR.piedZ0], [11.5, 30, NOIR.pied, 3, NOIR.piedZ0],
    [12, LARGEUR.base, NOIR.garde, 6], [36, LARGEUR.base, NOIR.garde, 6],
  ];
  // Dessus de la garde : pente creuse vers le flanc, de y = 36 à 56.
  for (let k = 1; k <= 10; k++) {
    const y = 36 + 2 * k, t = k / 10;
    const f = NOIR.garde + (NOIR.flanc - NOIR.garde) * (1 - (1 - t) ** 1.7);
    p.push([y, largeur(y), f, 2.5 + 3.5 * (1 - t)]);
  }
  for (let y = 60; y <= 120; y += 4) p.push([y, largeur(y), NOIR.flanc, 2.5]);
  // Dessous du nez, puis dôme jusqu'au faîte.
  p.push([121, largeur(121), NOIR.flanc, 2.5], [121.6, largeur(121.6), 10, 4], [123, 40, 14, 7], [125, 40, 19.5, 9], [128, 40, 22.4, 10]);
  for (let a = 0; a <= 88; a += 8) {
    const f = Math.max(0.6, NOIR.nez * Math.cos(a * RAD));
    p.push([131 + (L - 131) * Math.sin(a * RAD), LARGEUR.tete, f, Math.min(10, f * 0.8)]);
  }
  return p;
}

/** Repère 2 : coque avant noire (tête à nez, flancs nervurés, garde et pied). */
function coqueNoire() {
  const sections = profilNoir().map(([y, w, f, r, z0 = 0]) => ({ y, pts: sectionD(w, f - z0, r, 1, z0) }));
  const corps = gabarit(sections);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(corps, mat('plastic')));
  for (const cote of [1, -1]) for (const y of NERVURES) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.8 * MM, 1.4 * MM, 6.6 * MM), mat('plastic'));
    n.position.set(cote * (largeur(y) / 2 + 0.3) * MM, y * MM, 4.4 * MM);
    g.add(n);
  }
  return g;
}

/** Repère 3 : barre du bouton de validation, sous les doigts ; bouts en biseau. */
function bouton() {
  const { y0, y1, large, saillie } = BOUTON;
  const base = NOIR.flanc - 0.4; // légèrement engagée dans le flanc
  const profil = [[y0, 9], [y0 + 2, 14], [y0 + 5, saillie], [y1 - 11, saillie], [y1 - 6, 16.5], [y1 - 1, 12.5], [y1, 9]];
  const sections = [];
  profil.forEach(([y, f], i) => {
    if (i > 0) {
      // Sections intermédiaires : flancs lisses le long de la barre.
      const [ya, fa] = profil[i - 1];
      const n = Math.max(1, Math.round((y - ya) / 6));
      for (let k = 1; k < n; k++) sections.push({ y: ya + ((y - ya) * k) / n, pts: sectionD(large, fa + ((f - fa) * k) / n - base, 4, 1, base) });
    }
    sections.push({ y, pts: sectionD(large, f - base, 4, 1, base) });
  });
  return new THREE.Mesh(gabarit(sections), mat('rubber'));
}

/** Repère 4 : étiquette signalétique noire, sur le flanc +X de la base de la coque jaune. */
function etiquette() {
  const { y0, y1, z0, z1 } = ETIQUETTE;
  const w = z0 - z1, h = y1 - y0;
  const map = image('dead-man-etiquette', 320, Math.round((320 * h) / w), (x, cw, ch) => {
    x.fillStyle = '#17181a'; x.fillRect(0, 0, cw, ch);
    x.fillStyle = '#e9e9e6';
    // Deux lignes de texte suggérées (marque et type illisibles sur la photo).
    x.fillRect(cw * 0.08, ch * 0.05, cw * 0.62, ch * 0.045);
    x.fillRect(cw * 0.08, ch * 0.13, cw * 0.8, ch * 0.03);
    // Marquage CE : deux lettres en arcs.
    x.strokeStyle = '#f2f2ef'; x.lineWidth = cw * 0.035;
    const r = cw * 0.12, cy = ch * 0.36;
    x.beginPath(); x.arc(cw * 0.22, cy, r, 0.3 * Math.PI, 1.7 * Math.PI); x.stroke();
    x.beginPath(); x.arc(cw * 0.5, cy, r, 0.3 * Math.PI, 1.7 * Math.PI); x.stroke();
    x.beginPath(); x.moveTo(cw * 0.39, cy); x.lineTo(cw * 0.51, cy); x.stroke();
    // Marques d'organismes : deux ronds, sans logo (illisibles).
    x.lineWidth = cw * 0.02;
    x.beginPath(); x.arc(cw * 0.78, cy, cw * 0.09, 0, 7); x.stroke();
    x.beginPath(); x.arc(cw * 0.24, ch * 0.66, cw * 0.13, 0, 7); x.fill();
    for (let i = 0; i < 5; i++) x.fillRect(cw * 0.46, ch * (0.57 + i * 0.045), cw * (0.4 - (i % 2) * 0.1), ch * 0.018);
    for (let i = 0; i < 2; i++) x.fillRect(cw * 0.08, ch * (0.86 + i * 0.05), cw * (0.8 - i * 0.3), ch * 0.02);
  });
  const m = teinte('dead-man-etiquette', map ? { map, roughness: 0.5 } : { color: 0x17181a, roughness: 0.5 });
  const e = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), m);
  e.rotation.y = Math.PI / 2; // face vers +X, texte vers l'arrière (−Z)
  e.position.set((LARGEUR.base / 2 + 0.05) * MM, ((y0 + y1) / 2) * MM, ((z0 + z1) / 2) * MM);
  return e;
}

/** Repère 5 : vis à tête cylindrique sous la garde (pièce métallique visible sur la photo P02). */
function vis(S, y) {
  const { z0, long, r } = VIS;
  return S.cyl(r * MM, long * MM, 'zinc', { axis: 'z', seg: 20, pos: [0, y * MM, (z0 + long / 2) * MM] });
}

// ------------------------------------------------------------------ câble (repère du modèle, mètres)

/**
 * Axe du câble, du bas du boîtier au connecteur : presse-étoupe et spirale
 * (le câble descend vers la table), cinq tours lovés à plat vers l'intérieur,
 * montée, quatre tours un quart par-dessus vers l'extérieur, puis la queue.
 * rOut : rayon du premier tour (mm). Retourne les points (m) et les abscisses (mm).
 */
function axeCable(rOut) {
  const { pas, tours, cx, couche, queue } = LOVE;
  const r = CABLE.d / 2, y1 = r + couche;
  const cz = AXE_Z - rOut;
  const pts = [];
  const add = (x, y, z) => pts.push(new THREE.Vector3(x * MM, y * MM, z * MM));
  // Presse-étoupe (droit), puis descente vers la table jusqu'à l'entrée du lovage.
  for (let x = 0; x < PRESSE.long; x += 3) add(x, COUCHE, AXE_Z);
  for (let x = PRESSE.long; x < cx; x += 2) {
    const t = (x - PRESSE.long) / (cx - PRESSE.long);
    add(x, COUCHE - (COUCHE - r) * t * t * t * (t * (6 * t - 15) + 10), AXE_Z);
  }
  // Lovage : angle a depuis le point le plus proche de la poignée, sens antihoraire vu de dessus.
  const pose = (a, rr, y) => add(cx + rr * Math.sin(a), y, cz + rr * Math.cos(a));
  const da = 5 * RAD, a1 = tours * 2 * Math.PI, a2 = a1 + Math.PI / 2, a3 = (2 * tours + 9) * Math.PI;
  const rBas = (a) => rOut - (pas * a) / (2 * Math.PI);
  for (let a = 0; a < a1; a += da) pose(a, rBas(a), r);
  for (let a = a1; a < a2; a += da) pose(a, rBas(a), r + couche * S01((a - a1) / (a2 - a1)));
  const rHaut = (a) => rBas(a2) + (pas * (a - a2)) / (2 * Math.PI);
  for (let a = a2; a < a3; a += da) pose(a, rHaut(a), y1);
  // Queue : quitte le dernier tour en tangente vers −X et se pose à la hauteur du connecteur.
  const R1 = rHaut(a3);
  for (let d = 0; d <= queue; d += 4) add(cx - d, y1 + (M12.ecrou - y1) * S01((d - 40) / (queue - 40)), cz - R1);
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + pts[i].distanceTo(pts[i - 1]) / MM);
  return { pts, s, fin: [cx - queue, M12.ecrou, cz - R1] };
}

let TRAJET = null;
/** Axe du câble dont la longueur développée vaut les 4 m publiés (rayon du lovage ajusté). */
export function trajet() {
  if (TRAJET) return TRAJET;
  let a = 60, b = 110;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2, t = axeCable(m);
    if (t.s[t.s.length - 1] < CABLE.long) a = m; else b = m;
  }
  const rOut = (a + b) / 2;
  TRAJET = { rOut, ...axeCable(rOut) };
  return TRAJET;
}

/** Repère 6 : presse-étoupe en plastique noir (deux six-pans et dôme), dans l'axe du câble. */
function presseEtoupe(S) {
  const rc = PRESSE.plats / 2 / Math.cos(30 * RAD) * MM; // rayon sur angles
  const g = S.group();
  g.add(S.cyl(rc, 6 * MM, 'plastic', { axis: 'x', seg: 6, pos: [3 * MM, 0, 0] }));
  g.add(S.cyl(11 * MM, 1 * MM, 'plastic', { axis: 'x', seg: 28, pos: [6.5 * MM, 0, 0] }));
  g.add(S.cyl(rc, 12 * MM, 'plastic', { axis: 'x', seg: 6, pos: [13 * MM, 0, 0] }));
  g.add(S.lathe([[0, 19], [11, 19], [11, 20.5], [9.6, 24.5], [8, PRESSE.long], [0, PRESSE.long]].map(([rr, y]) => [rr * MM, y * MM]), 'plastic', { axis: 'x', seg: 28 }));
  g.position.set(0, COUCHE * MM, AXE_Z * MM);
  return g;
}

/** Repère 7 : protecteur de courbure en spirale, enroulé sur le câble à la sortie du presse-étoupe. */
function spirale() {
  const { pts, s } = trajet();
  const { long, tours, r0, r1, fil0, fil1 } = SPIRALE;
  const i0 = s.findIndex((v) => v >= PRESSE.long - 1), i1 = s.findIndex((v) => v >= PRESSE.long + long);
  const axe = pts.slice(i0, i1 + 1), sa = s.slice(i0, i1 + 1);
  const { N, B } = reperes(axe);
  const helice = [], rangs = [];
  const n = Math.round(tours * 28);
  for (let k = 0; k <= n; k++) {
    const t = k / n, u = sa[0] + t * (sa[sa.length - 1] - sa[0]);
    let i = 0;
    while (i < sa.length - 2 && sa[i + 1] < u) i++;
    const f = (u - sa[i]) / (sa[i + 1] - sa[i] || 1);
    const p = axe[i].clone().lerp(axe[i + 1], f), nn = N[i].clone().lerp(N[i + 1], f).normalize(), bb = B[i].clone().lerp(B[i + 1], f).normalize();
    const a = t * tours * 2 * Math.PI, rr = (r0 + (r1 - r0) * t) * MM;
    helice.push(p.add(nn.multiplyScalar(Math.cos(a) * rr)).add(bb.multiplyScalar(Math.sin(a) * rr)));
    rangs.push((fil0 + (fil1 - fil0) * t) * MM);
  }
  return new THREE.Mesh(tuyau(helice, (i) => rangs[i], 8), mat('plastic'));
}

/** Repère 8 : câble de 4 m, lové sur la table à côté de la poignée. */
function cable() {
  const { pts } = trajet();
  return new THREE.Mesh(tuyau(pts, (CABLE.d / 2) * MM, 10), mat('hose'));
}

/** Repère 9 : connecteur M12 (corps surmoulé noir, écrou moleté), au bout du câble, tourné vers −X. */
function connecteur(S) {
  const g = S.group();
  const m = (p) => p.map(([rr, y]) => [rr * MM, y * MM]);
  // Corps surmoulé : manchon de sortie, puis fût.
  g.add(S.lathe(m([[0, 0], [3.6, 0], [4.2, 3], [5, 10], [M12.r, 12], [M12.r, 32], [6, 33], [0, 33]]), 'plastic', { seg: 28 }));
  // Écrou moleté et portée filetée.
  g.add(S.gear(7.0 * MM, M12.ecrou * MM, 30, 9 * MM, 'zinc', { axis: 'y', pos: [0, 37.5 * MM, 0] }));
  g.add(S.lathe(m([[0, 42], [6, 42], [6, M12.long], [4.7, M12.long], [4.7, 43], [0, 43]]), 'zinc', { seg: 28 }));
  g.add(S.cyl(4.7 * MM, 0.6 * MM, 'plastic', { pos: [0, 43.2 * MM, 0], seg: 24 }));
  const [x, y, z] = trajet().fin;
  g.rotation.z = Math.PI / 2; // axe du connecteur le long de −X
  g.position.set(x * MM, y * MM, z * MM);
  return g;
}

// ------------------------------------------------------------------ assemblage

/** Pose une pièce du boîtier (repère de la poignée) sur la table : tête vers −X, étiquette vers le haut. */
function couche(S, obj) {
  const g = S.group(obj);
  g.rotation.z = Math.PI / 2;
  g.position.y = COUCHE * MM;
  return g;
}

export function P01(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  put('1', couche(S, coqueJaune()), [0, 0, -0.05]);
  put('2', couche(S, coqueNoire()), [0, 0, 0.035]);
  put('3', couche(S, bouton()), [0, 0, 0.08]);
  put('4', couche(S, etiquette()), [0, 0.04, -0.05]);
  VIS.y.forEach((y) => put('5', couche(S, vis(S, y)), [0, 0, 0.07]));
  put('6', presseEtoupe(S), [0.035, 0, 0]);
  put('7', spirale(), [0.075, 0, 0]);
  put('8', cable(), [0.115, 0, 0]);
  put('9', connecteur(S), [0.075, 0, -0.03]);

  // Coupe proposée : à mi-largeur de la poignée (plan horizontal du modèle couché).
  return { view: { dir: [-0.25, 0.75, 1], section: { axis: 'y', pos: 0.5 } } };
}

export default { P01 };
