// Étui en cuir pour clé à molette, porté à la ceinture du mineur : reconstitution d'après une seule photo,
// très petite (44 × 96 pixels), où la clé est rangée mâchoires vers le haut. Aucun plan, aucune cote.
//
// Échelle de la photo : la clé, prise pour une 12 po (304,8 mm sur 74,5 pixels, soit 4,1 mm par pixel).
// Relevé, à environ 8 mm près (deux pixels) : étui de 127 mm de haut, 78 mm de large en haut et 63 mm en
// bas, deux rivets brillants aux coins du bas à 55 mm l'un de l'autre ; la tête de la clé dépasse de 59 mm
// au-dessus, le manche de 119 mm au-dessous. Ces cotes sont arrondies au demi-pouce.
//
// Supposé, parce que caché ou illisible sur la photo : le dos et le passant de ceinture (dos replié par-dessus
// la ceinture et repris par les rivets du bas), les deux rivets du haut, l'épaisseur du cuir, la couleur, et
// la profondeur (1 1/2 po, celle d'un étui de mineur du commerce).
//
// Repère de l'étui, en millimètres : X largeur, Y vers le haut depuis le bord du bas, Z vers l'extérieur
// (z = 0 : face avant du dos, contre laquelle la clé repose). Modèle en mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';
import { base as baseCle, dims as dimsCle, pieces as piecesCle } from '../cle-a-molette/index.js';

const MM = 0.001, IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

export const H = 5 * IN; // hauteur (relevée : 127 ± 8)
export const LARGEUR = { haut: 3 * IN, bas: 2.5 * IN }; // relevées : 78 et 63 ± 8
export const PROFONDEUR = 1.5 * IN; // supposée (étui de mineur du commerce : 4 × 2 1/2 × 1 1/2 po)
export const CUIR = 3.5; // épaisseur du cuir, supposée
export const PASSANT = 6; // jour entre les deux épaisseurs du dos, pour la ceinture (supposé)
export const AILE = 9.5; // aile du fourreau rivetée sur le dos
export const RIVET = { d: 9, y: [11, H - 13] }; // tête de 9 mm ; rivets du bas vus sur la photo, ceux du haut supposés
export const CEINTURE = { large: 2.5 * IN, epais: 5, long: 330 }; // ceinture de mineur : largeur supposée
const FOND = 20; // sous cette hauteur, les deux épaisseurs du dos se rejoignent (serrées par les rivets du bas)

/** Largeur hors tout de l'étui à la hauteur y. */
export const largeur = (y) => LARGEUR.bas + ((LARGEUR.haut - LARGEUR.bas) * y) / H;
/** Avancée du devant du fourreau, depuis la face avant du dos. */
export const AVANT = PROFONDEUR - (2 * CUIR + PASSANT);
/** Largeur intérieure de la gueule du fourreau (en haut) et de sa sortie (en bas). */
export const INTERIEUR = { haut: LARGEUR.haut - 2 * (AILE + CUIR), bas: LARGEUR.bas - 2 * (AILE + CUIR) };

// ------------------------------------------------------------------ matériaux (hors palette, créés une fois)

const perso = new Map();
function teinte(nom, params, finition) {
  let m = perso.get(nom);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ metalness: 0, ...params });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    withFinish(m, finition);
    perso.set(nom, m);
  }
  return m;
}
// Cuir brun (couleur supposée : la photo, sombre, le montre gris) et cuir noir de la ceinture.
const cuir = () => teinte('etui-cuir', { color: 0x5a3b24, roughness: 0.8 }, 'cast');
const cuirNoir = () => teinte('etui-ceinture', { color: 0x221f1d, roughness: 0.84 }, 'cast');

// ------------------------------------------------------------------ géométrie

/** Arc de cercle en points [[a, b], ...] (extrémité de départ exclue). */
function arc(c, r, a0, a1, n = 8) {
  const out = [];
  for (let k = 1; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return out;
}

/** Contour fermé d'une bande d'épaisseur t qui suit la ligne « axe » ([[a, b], ...], mm). */
function bande(axe, t) {
  const n = axe.length, g = [], d = [];
  for (let i = 0; i < n; i++) {
    const p = axe[Math.max(0, i - 1)], q = axe[Math.min(n - 1, i + 1)];
    const ux = q[0] - p[0], uy = q[1] - p[1], l = Math.hypot(ux, uy) || 1;
    g.push([axe[i][0] - (uy / l) * (t / 2), axe[i][1] + (ux / l) * (t / 2)]);
    d.push([axe[i][0] + (uy / l) * (t / 2), axe[i][1] - (ux / l) * (t / 2)]);
  }
  return [...g, ...d.reverse()];
}

/**
 * Bande de cuir : contour [[a, b], ...] (mm) extrudé sur « long » (mm), arêtes arrondies sans changer
 * l'encombrement. Géométrie en mètres : a → X, b → Y, extrusion → Z, de 0 à long. deforme(v) retouche
 * chaque sommet (mètres) avant le calcul des normales.
 */
function cuirExtrude(contour, long, deforme = null) {
  const b = 0.8;
  const shape = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  let geo = new THREE.ExtrudeGeometry(shape, { depth: (long - 2 * b) * MM, bevelEnabled: true, bevelSize: b * MM, bevelThickness: b * MM, bevelOffset: -b * MM, bevelSegments: 2, curveSegments: 8 });
  geo.translate(0, 0, b * MM);
  if (deforme) {
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); deforme(v); p.setXYZ(i, v.x, v.y, v.z); }
  }
  geo = creaseNormals(geo, 0.7);
  geo.userData.edgeAngle = 50;
  return geo;
}

/** Repère 1 : dos de l'étui, replié par-dessus la ceinture ; les deux épaisseurs se rejoignent en bas. */
function dos() {
  const t = CUIR, R = (PASSANT + t) / 2, zA = -t / 2, zC = zA - R, yC = H - t / 2 - R;
  // Ligne moyenne dans le plan (z, y) : montée de la face avant, pli du haut, descente de l'arrière.
  const axe = [[zA, 0], [zA, yC], ...arc([zC, yC], R, 0, Math.PI, 10)];
  const zR = zC - R, zJ = zA - t; // arrière écarté par la ceinture, puis plaqué contre l'avant
  for (let y = yC - 6; y > FOND + 16; y -= 12) axe.push([zR, y]);
  for (let k = 0; k <= 8; k++) { const u = k / 8, s = u * u * (3 - 2 * u); axe.push([zR + (zJ - zR) * s, FOND + 16 - 16 * u]); }
  axe.push([zJ, 2]);
  // Extrudé sur la largeur du haut, puis resserré vers le bas ; extrusion → X de l'étui (centrée).
  const geo = cuirExtrude(bande(axe, t), LARGEUR.haut, (v) => { v.z = (v.z - (LARGEUR.haut / 2) * MM) * (largeur(v.y / MM) / LARGEUR.haut); });
  const m = new THREE.Mesh(geo, cuir());
  m.rotation.y = -Math.PI / 2; // (z, y, extrusion) → (X = −extrusion, Y, Z = z)
  return m;
}

/** Repère 2 : fourreau, bande de cuir cintrée en U dont les deux ailes sont rivetées à plat sur le dos. */
function fourreau() {
  const t = CUIR, w = LARGEUR.haut / 2, r = 7, zF = AVANT - t / 2, xP = w - AILE - t / 2, zB = t / 2;
  // Ligne moyenne vue de dessus (x, z) : aile droite, paroi, devant, paroi, aile gauche.
  const moitie = [[w, zB], [xP + 3, zB], ...arc([xP + 3, zB + 3], 3, -Math.PI / 2, -Math.PI, 4), [xP, zF - r], ...arc([xP - r, zF - r], r, 0, Math.PI / 2, 6)];
  const axe = [...moitie, ...moitie.slice().reverse().map(([x, z]) => [-x, z])];
  // Extrudé sur la hauteur ; les deux côtés se rapprochent vers le bas, le devant se resserre d'autant.
  const coeur = xP - r;
  const geo = cuirExtrude(bande(axe, t).map(([x, z]) => [x, -z]), H, (v) => {
    const d = ((LARGEUR.haut - largeur(v.z / MM)) / 2) * MM, c = coeur * MM;
    v.x = Math.abs(v.x) > c ? v.x - Math.sign(v.x) * d : (v.x * (c - d)) / c;
  });
  const m = new THREE.Mesh(geo, cuir());
  m.rotation.x = -Math.PI / 2; // (x, −z, extrusion) → (X, Y = extrusion, Z = z)
  return m;
}

/** Repère 3 : rivet (tête bombée devant, contre-rivure plate derrière) ; bas : traverse aussi l'arrière du dos. */
function rivet(S, cote, bas) {
  const y = bas ? RIVET.y[0] : RIVET.y[1], x = cote * (largeur(y) / 2 - AILE / 2), r = RIVET.d / 2;
  const g = S.group();
  g.add(S.lathe([[0, 0], [r, 0], [r, 0.6], [r * 0.8, 1.6], [r * 0.4, 2.2], [0, 2.3]].map(([a, b]) => [a * MM, b * MM]), 'zinc', { axis: 'z', seg: 20, pos: [0, 0, CUIR * MM] }));
  const derriere = bas ? -2 * CUIR : -CUIR;
  g.add(S.cyl((r - 0.5) * MM, 1 * MM, 'zinc', { axis: 'z', seg: 20, pos: [0, 0, (derriere - 0.5) * MM] }));
  g.position.set(x * MM, y * MM, 0);
  return g;
}

// ------------------------------------------------------------------ mise en situation

/** Section du corps de la clé (mm, repère de la clé) à la cote z le long du manche : étendue en largeur. */
function sectionCle(z) {
  const p = baseCle().pieces.corps, s = dimsCle().s * 1000;
  let x0 = Infinity, x1 = -Infinity;
  for (let i = 0; i < p.I.length; i += 3) {
    for (let e = 0; e < 3; e++) {
      const a = p.I[i + e] * 3, c = p.I[i + ((e + 1) % 3)] * 3, za = p.P[a + 2] * s, zc = p.P[c + 2] * s;
      if ((za - z) * (zc - z) > 0 || za === zc) continue;
      const x = (p.P[a] + ((p.P[c] - p.P[a]) * (z - za)) / (zc - za)) * s;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    }
  }
  return [x0, x1];
}

let POSE = null;
/**
 * Place de la clé de 12 po dans l'étui : elle descend, manche le premier, jusqu'à ce que les épaules de sa tête
 * touchent la gueule du fourreau. Retourne la cote z de la clé à la gueule, son décalage en X, et ce qui dépasse
 * en haut et en bas de l'étui (mm).
 */
export function pose() {
  if (POSE) return POSE;
  const d = dimsCle(), bec = d.min[2] * 1000, bout = d.max[2] * 1000;
  // Du manche vers la tête : première section aussi large que la gueule.
  let z = -80;
  while (z > bec && sectionCle(z)[1] - sectionCle(z)[0] < INTERIEUR.haut) z -= 0.25;
  const [x0, x1] = sectionCle(z);
  POSE = { z, x: -(x0 + x1) / 2, dessus: z - bec, dessous: bout - z - H };
  return POSE;
}

/** Clé de 12 po rangée : mâchoires fermées, vers le haut, à plat contre le dos. */
function cleRangee(S) {
  const p = piecesCle(0), q = pose();
  const g = S.group(p.corps, p.machoire, p.molette);
  g.rotation.x = Math.PI / 2; // (x, y, z) de la clé → (X, Y = −z, Z = y) de l'étui
  g.position.set(q.x * MM, (H + q.z) * MM, ((AVANT - CUIR) / 2) * MM);
  return g;
}

/** Tronçon de ceinture passé dans le dos de l'étui : droit dans le passant, cintré autour de la taille au-delà. */
function ceinture() {
  const t = CEINTURE.epais, z0 = -CUIR - PASSANT / 2, droit = 46, R = 150, demi = CEINTURE.long / 2;
  const a1 = (demi - droit) / R, cote = (s) => arc([s * droit, z0 - R], R, Math.PI / 2, Math.PI / 2 - s * a1, 10);
  const axe = [...cote(-1).reverse(), [-droit, z0], [droit, z0], ...cote(1)];
  const geo = cuirExtrude(bande(axe, t).map(([x, z]) => [x, -z]), CEINTURE.large);
  const m = new THREE.Mesh(geo, cuirNoir());
  m.rotation.x = -Math.PI / 2;
  m.position.y = (H - CUIR - 1 - CEINTURE.large) * MM; // l'étui pend sur le dessus de la ceinture
  return m;
}

// ------------------------------------------------------------------ pages

/** L'étui seul : dos replié en passant, fourreau, quatre rivets. */
export function P001(api) {
  const S = api.S;
  api.part('1', S.group(dos()), [0, 0, -0.05]);
  api.part('2', S.group(fourreau()), [0, 0, 0.05]);
  let vu = false;
  for (const bas of [true, false]) for (const cote of [1, -1]) { api.part('3', rivet(S, cote, bas), [0, 0, 0.1], { noLabel: vu }); vu = true; }
  return { view: { dir: [0.55, 0.35, 1], section: { axis: 'x', pos: 0.5 } } };
}

/** L'étui porté à la ceinture, clé de 12 po rangée. */
export function P002(api) {
  const S = api.S;
  api.part('1', api.sub('P001'), [0, 0, 0]);
  api.part('2', cleRangee(S), [0, 0.2, 0]);
  api.part('3', S.group(ceinture()), [0, 0, -0.08]);
  return { view: { dir: [0.6, 0.3, 1] } };
}

export default { P001, P002 };
