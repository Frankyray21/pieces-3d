// Clés à molette (« Westcott ») de 6 à 24 po : la clé du « Tool Pack 1 » d'OpenGameArt (CC0,
// https://opengameart.org/content/tool-pack-1, LonesomeDucky), chromée et piquée de rouille, mise à l'échelle
// de chaque grandeur (voir forme.js). Trois pièces : corps, mâchoire mobile et molette. La marque
// « 12" - 300mm » de la texture reste la même sur toutes les grandeurs.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { base, dims, SIZES, IN } from './forme.js';

export { base, dims, SIZES, IN };

let MATERIAL = null;
/** Matériau texturé partagé (couleur, normales, rugosité et métal) ; palette simple hors navigateur. */
function material() {
  if (MATERIAL) return MATERIAL;
  if (typeof document === 'undefined') return (MATERIAL = mat('zinc'));
  const loader = new THREE.TextureLoader();
  const redraw = () => window.dispatchEvent(new Event('pieces3d:redessiner'));
  const tex = (name, srgb = false) => {
    const t = loader.load(`equipment/cle-a-molette/textures/${name}.webp`, redraw);
    t.flipY = false; // UV du glTF
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const mr = tex('mr'); // vert : rugosité ; bleu : métal
  // Deux faces, comme le matériau d'origine : le bout de la tige de la mâchoire est ouvert.
  MATERIAL = new THREE.MeshStandardMaterial({ map: tex('diff', true), normalMap: tex('nor'), roughnessMap: mr, metalnessMap: mr, metalness: 1, roughness: 1, side: THREE.DoubleSide });
  MATERIAL.polygonOffset = true;
  MATERIAL.polygonOffsetFactor = 1;
  MATERIAL.polygonOffsetUnits = 1;
  MATERIAL.name = 'cle_a_molette';
  return MATERIAL;
}

const GEO = new Map();
/** Géométrie d'une pièce du modèle d'origine (partagée par toutes les grandeurs, mises à l'échelle par le maillage). */
function geometrie(nom) {
  if (GEO.has(nom)) return GEO.get(nom);
  const p = base().pieces[nom], geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p.P, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(p.N, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(p.uv, 2));
  geo.setIndex(new THREE.BufferAttribute(p.I, 1));
  geo.userData.edgeAngle = 60; // pas de contours sur les arrondis du maillage allégé
  GEO.set(nom, geo);
  return geo;
}

/**
 * Pièces d'une clé de grandeur « size » (po), dans le repère du corps (à plat, manche le long de Z, tête vers
 * −Z, épaisseur le long de Y). ouverture : écart des mâchoires en mètres (null : comme le modèle d'origine).
 */
export function pieces(size, ouverture = null) {
  const b = base(), d = dims(size), out = { d };
  for (const nom of ['corps', 'machoire', 'molette']) {
    const p = b.pieces[nom], m = new THREE.Mesh(geometrie(nom), material());
    m.name = `cle_a_molette_${size}po_${nom}`;
    m.scale.setScalar(d.s);
    m.position.set(p.t[0] * d.s, p.t[1] * d.s, p.t[2] * d.s);
    m.quaternion.set(...p.q);
    out[nom] = m;
  }
  if (ouverture != null) out.machoire.position.addScaledVector(new THREE.Vector3(...b.ouvre), ouverture - d.ouverture);
  return out;
}

/** Les sept grandeurs couchées à plat, bouts de manche alignés, de la plus petite à la plus grande. */
export function P001(api) {
  let x = 0;
  SIZES.forEach((size, k) => {
    const p = pieces(size), d = p.d;
    const g = api.S.group(p.corps, p.machoire, p.molette);
    g.position.set(x - d.min[0], d.T / 2, -d.max[2]);
    x += d.max[0] - d.min[0] + 0.03;
    api.part(String(k + 1), g, [0, 0, 0], { caption: `${size} po` });
  });
  return { view: { dir: [0.35, 1, 0.75] } };
}

/** La clé de 12 po, celle que le modèle d'origine représente : vue éclatée de ses trois pièces. */
export function P002(api) {
  const p = pieces(12), d = p.d, o = base().ouvre;
  // Clé tournée d'un quart de tour : manche le long de X, tête à gauche, mâchoires vers l'avant.
  const pose = (obj) => { const g = api.S.group(obj); g.rotation.y = Math.PI / 2; g.position.y = d.T / 2; return g; };
  const sens = (v, k) => [v[2] * k, v[1] * k, -v[0] * k]; // vecteur du repère du corps, une fois la clé tournée
  api.part('1', pose(p.corps), [0, 0, 0]);
  api.part('2', pose(p.machoire), sens(o, 0.8 * d.W));
  api.part('3', pose(p.molette), [0, 0.75 * d.W, 0]);
  return { view: { dir: [0.25, 1, 0.8], section: { axis: 'y', pos: 0.5 } } };
}

export default { P001, P002 };
