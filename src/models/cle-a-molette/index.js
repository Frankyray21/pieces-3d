// Clé à molette (« Westcott ») de 12 po : la clé du « Tool Pack 1 » d'OpenGameArt (CC0,
// https://opengameart.org/content/tool-pack-1, LonesomeDucky), chromée et piquée de rouille, ramenée à 12 po
// de long (voir forme.js). Trois pièces : corps, mâchoire mobile et molette.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { base, dims, GRANDEUR, IN } from './forme.js';

export { base, dims, GRANDEUR, IN };

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

/**
 * Les trois pièces de la clé, dans le repère du corps (à plat, manche le long de Z, tête vers −Z, épaisseur le
 * long de Y). ouverture : écart des mâchoires en mètres (null : comme le modèle d'origine).
 */
export function pieces(ouverture = null) {
  const b = base(), d = dims(), out = { d };
  for (const nom of ['corps', 'machoire', 'molette']) {
    const p = b.pieces[nom], geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(p.P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(p.N, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(p.uv, 2));
    geo.setIndex(new THREE.BufferAttribute(p.I, 1));
    geo.userData.edgeAngle = 60; // pas de contours sur les arrondis du maillage allégé
    const m = new THREE.Mesh(geo, material());
    m.name = `cle_a_molette_${nom}`;
    m.scale.setScalar(d.s);
    m.position.set(p.t[0] * d.s, p.t[1] * d.s, p.t[2] * d.s);
    m.quaternion.set(...p.q);
    out[nom] = m;
  }
  if (ouverture != null) out.machoire.position.addScaledVector(new THREE.Vector3(...b.ouvre), ouverture - d.ouverture);
  return out;
}

/** La clé couchée à plat, mâchoires entrouvertes ; vue éclatée de ses trois pièces. */
export function P001(api) {
  const p = pieces(), d = p.d, o = base().ouvre;
  // Clé tournée d'un quart de tour : manche le long de X, tête à gauche, mâchoires vers l'avant.
  const pose = (obj) => { const g = api.S.group(obj); g.rotation.y = Math.PI / 2; g.position.y = d.T / 2; return g; };
  const sens = (v, k) => [v[2] * k, v[1] * k, -v[0] * k]; // vecteur du repère du corps, une fois la clé tournée
  api.part('1', pose(p.corps), [0, 0, 0]);
  api.part('2', pose(p.machoire), sens(o, 0.8 * d.W));
  api.part('3', pose(p.molette), [0, 0.75 * d.W, 0]);
  return { view: { dir: [0.25, 1, 0.8], section: { axis: 'y', pos: 0.5 } } };
}

export default { P001 };
