// Fiche d'inspection « Foreuse au diamant sous-terre » (formulaire MA4657056
// de Machines Roger International, août 2026) en 3D : une feuille de
// 5 1/2 × 8 1/2 po (format des deux pages du PDF) imprimée des deux côtés.
//
// Page 1 du PDF (recto) : en-tête (nom, date, no de la foreuse, quart, heures),
// légende, VÉRIFICATIONS AVANT DÉMARRAGE (1 à 25) et APRÈS DÉMARRAGE (1 à 4).
// Page 2 (verso) : APRÈS DÉMARRAGE (5 à 10), VÉRIFICATIONS SUPPLÉMENTAIRES
// (1 à 7), consigne des items rouges, signatures, inspection conjointe,
// commentaires.
//
// Les deux faces sont les pages du PDF elles-mêmes (images publiées avec la
// fiche), posées en texture : la fiche se lit telle qu'imprimée. Recto verso
// sur une seule feuille et épaisseur du papier (0,1 mm) : supposés.
//
// Repère : feuille debout face à l'observateur (Z vers lui), Y vers le haut,
// centrée en x, bas de la feuille à y = 0. Modèle en mètres.
import * as THREE from 'three';

const IN = 0.0254;
export const FEUILLE = { w: 5.5 * IN, h: 8.5 * IN, t: 0.0001 };

// Texture chargée après coup : la visionneuse (rendu à la demande) doit redessiner.
const redessiner = () => window.dispatchEvent(new Event('pieces3d:redessiner'));
const cache = new Map();
/** Page du PDF en texture. */
function page(nom) {
  if (cache.has(nom)) return cache.get(nom);
  let tex = null;
  if (typeof document !== 'undefined') {
    const base = (import.meta.env && import.meta.env.BASE_URL) || './';
    tex = new THREE.TextureLoader().load(`${base}equipment/fiche-inspection-dd/pages/${nom}.webp`, redessiner);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }
  cache.set(nom, tex);
  return tex;
}

const papier = (map) => new THREE.MeshStandardMaterial({ color: 0xffffff, map, roughness: 0.85, metalness: 0 });

/**
 * La feuille : deux faces minces, recto (+Z, page 1) et verso (−Z, page 2,
 * retournée pour se lire sans miroir vue de derrière), un matériau par
 * maillage (la visionneuse ne gère pas les maillages à plusieurs matériaux).
 */
function feuille() {
  const { w, h, t } = FEUILLE;
  const g = new THREE.Group();
  const face = (nom, dos) => {
    const geo = new THREE.PlaneGeometry(w, h);
    if (dos) geo.rotateY(Math.PI);
    geo.translate(0, 0, dos ? -t / 2 : t / 2);
    const m = new THREE.Mesh(geo, papier(page(nom)));
    m.name = dos ? 'verso' : 'recto';
    return m;
  };
  g.add(face('P01', false), face('P02', true));
  g.position.y = h / 2;
  return g;
}

/** P01 — Recto : en-tête, vérifications avant démarrage. */
export function P01(api) {
  api.part('1', feuille(), [0, 0, 0.04]);
  return { view: { dir: [0.25, 0.15, 1] } };
}

/** P02 — Verso : fin des vérifications après démarrage, supplémentaires, signatures. */
export function P02(api) {
  const f = feuille();
  // Feuille retournée de côté (demi-tour sur l'axe vertical) : le verso face à soi.
  f.rotation.y = Math.PI;
  api.part('1', f, [0, 0, 0.04]);
  return { view: { dir: [-0.25, 0.15, 1] } };
}

export default { P01, P02 };
