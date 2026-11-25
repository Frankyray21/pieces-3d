// Carte de travail « Forage au diamant sous-terre » (formulaire MA4657078 de
// Machines Roger International) en 3D : une feuille de format lettre
// (11 × 8 1/2 po) imprimée des deux côtés et pliée en deux, comme le PDF.
//
// Page 1 du PDF : l'extérieur de la carte — à gauche, le volet arrière
// (DESCRIPTION DU TRAVAIL, rapport journalier, vérification de fin de quart,
// types de risques, moyens de contrôle) ; à droite, la couverture (logo, date,
// quart, foreuse, tâches à accomplir, signatures). Page 2 : l'intérieur — à
// gauche, INSPECTION (verso de la couverture) ; à droite, PLANIFICATION,
// DÉCISION, EXÉCUTION 2e visite (verso du volet arrière).
//
// Les deux faces sont les pages du PDF elles-mêmes (images publiées avec la
// fiche), posées en texture : la carte se lit telle qu'imprimée.
//
// Repère : carte debout face à l'observateur (Z vers lui), Y vers le haut, pli
// sur l'axe Y (x = 0). Le volet arrière occupe x de 0 à 5 1/2 po ; la
// couverture tourne autour du pli : 0 = carte ouverte à plat, π = fermée.
// Épaisseur d'un carton de formulaire supposée (0,25 mm). Modèle en mètres.
import * as THREE from 'three';

const IN = 0.0254;
export const VOLET = { w: 5.5 * IN, h: 8.5 * IN, t: 0.00025 };

const cache = new Map();
/** Moitié (0 : gauche, 1 : droite) d'une page du PDF, en texture. */
function demiPage(page, moitie) {
  const cle = `${page}|${moitie}`;
  if (cache.has(cle)) return cache.get(cle);
  let tex = null;
  if (typeof document !== 'undefined') {
    const base = (import.meta.env && import.meta.env.BASE_URL) || './';
    tex = new THREE.TextureLoader().load(`${base}equipment/carte-forage-dd/pages/${page}.webp`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.repeat.set(0.5, 1);
    tex.offset.set(moitie * 0.5, 0);
  }
  cache.set(cle, tex);
  return tex;
}

const papier = (map) => new THREE.MeshStandardMaterial({ color: 0xffffff, map, roughness: 0.82, metalness: 0 });
const tranche = new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.9 });

/**
 * Volet : face avant (+Z) et face arrière (−Z), [page, moitié] chacune.
 * Ordre des faces d'une boîte : +x, −x, +y, −y, +z, −z.
 */
function volet(avant, arriere, segments = 1) {
  const { w, h, t } = VOLET;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t, segments, 1, 1), [tranche, tranche, tranche, tranche, papier(demiPage(...avant)), papier(demiPage(...arriere))]);
  return m;
}

/** Angles du pli : carte ouverte (tenue pour la lire) et fermée (couverture qui bâille de 3°). */
export const ANGLE = { ouverte: 0.32, fermee: Math.PI - 0.055 };
const COURBE = 0.035; // retard du bord libre au plus fort de la page tournée (m)

/**
 * Pose la couverture (animation « tourner la page ») : angle du pli et courbure
 * (−1 à 1 : le bord libre traîne derrière le pli, comme un carton qu'on tourne ;
 * signe = sens du mouvement, 0 = à plat). pli : le repère 1 du modèle.
 */
export function poser(pli, angle, courbure = 0) {
  pli.rotation.y = angle;
  const m = pli.userData.couverture;
  const g = m.geometry, p = g.attributes.position, base = m.userData.base;
  const { w } = VOLET;
  for (let i = 0; i < p.count; i++) {
    const x = base[3 * i];
    const s = (w / 2 - x) / w; // 0 au pli, 1 au bord libre
    p.setXYZ(i, x, base[3 * i + 1], base[3 * i + 2] - courbure * COURBE * s * s);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
}

/** Carte pliée à l'angle donné (0 = ouverte à plat, π = fermée). */
function carte(api, angle) {
  const { w, h, t } = VOLET;
  // 2 — Volet arrière, fixe : intérieur droit (page 2, à droite) devant,
  // DESCRIPTION DU TRAVAIL (page 1, à gauche) derrière.
  const arriere = volet(['P02', 1], ['P01', 0]);
  arriere.position.set(w / 2, h / 2, 0);
  // 1 — Couverture, tournée autour du pli (bord avant du volet arrière) :
  // INSPECTION (page 2, à gauche) devant quand la carte est ouverte,
  // couverture (page 1, à droite) derrière, donc dessus une fois fermée.
  // Couverture découpée en bandes le long de la largeur : elle se courbe en tournant.
  const couverture = volet(['P02', 0], ['P01', 1], 24);
  couverture.userData.base = Float32Array.from(couverture.geometry.attributes.position.array);
  couverture.position.set(-w / 2, 0, -t / 2);
  const pli = new THREE.Group();
  pli.position.set(0, h / 2, t / 2);
  pli.rotation.y = angle;
  pli.add(couverture);
  pli.userData.couverture = couverture;
  const ouverte = angle < Math.PI / 2;
  api.part('1', pli, ouverte ? [-0.03, 0, 0.04] : [0, 0, 0.05]);
  api.part('2', arriere, ouverte ? [0.03, 0, 0] : [0, 0, -0.03]);
}

/** P01 — Carte fermée : couverture dessus, DESCRIPTION DU TRAVAIL au dos. */
export function P01(api) {
  // Un carton plié ne reste pas tout à fait à plat : la couverture bâille de 3°
  // (un peu moins de 8 mm au bord libre).
  carte(api, ANGLE.fermee);
  return { view: { dir: [0.35, 0.25, 1] } };
}

/** P02 — Carte ouverte : INSPECTION à gauche, PLANIFICATION et DÉCISION à droite. */
export function P02(api) {
  // Ouverte comme on la tient pour la lire : couverture un peu rabattue vers soi.
  carte(api, ANGLE.ouverte);
  return { view: { dir: [0.1, 0.15, 1] } };
}

export default { P01, P02 };
