// Clés mixtes (fourche et œil 12 pans) de 1/4 à 1 1/4 po, aux cotes publiées des clés Gray Tools 3108 à 3140
// (voir forme.js). Maillage et textures : clé mixte de Poly Haven (CC0, https://polyhaven.com/a/combination_wrench,
// BKS), acier usé et rayé, sans marquage : la grandeur n'est pas frappée sur le manche.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { base, shape, nominal, SPECS, SIZES, IN, TILT } from './forme.js';

export { shape, nominal, SPECS, SIZES, IN, TILT };

let MATERIAL = null;
/** Matériau texturé partagé (couleur, normales, occlusion-rugosité-métal) ; palette simple hors navigateur. */
function material() {
  if (MATERIAL) return MATERIAL;
  if (typeof document === 'undefined') return (MATERIAL = mat('steel'));
  const loader = new THREE.TextureLoader();
  const redraw = () => window.dispatchEvent(new Event('pieces3d:redessiner'));
  const tex = (name, srgb = false) => {
    const t = loader.load(`equipment/cles-mixtes/textures/${name}.webp`, redraw);
    t.flipY = false; // UV du glTF
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const arm = tex('arm');
  // La texture est celle d'un acier poli (rugosité moyenne 0,15) : à plat sur le sol, il ne renvoie que le plafond
  // sombre du studio et sort noir. Rugosité multipliée (fini satiné) et teinte éclaircie pour que la forme se lise.
  MATERIAL = new THREE.MeshStandardMaterial({ map: tex('diff', true), normalMap: tex('nor'), aoMap: arm, roughnessMap: arm, metalnessMap: arm, metalness: 0.55, roughness: 2.6 });
  MATERIAL.color.setScalar(1.3);
  MATERIAL.polygonOffset = true;
  MATERIAL.polygonOffsetFactor = 1;
  MATERIAL.polygonOffsetUnits = 1;
  MATERIAL.name = 'cle_mixte';
  return MATERIAL;
}

/** Clé de grandeur « size » (« 3/4 », « 1 1/16 »…) dans son repère : X largeur, Y épaisseur (œil relevé), Z longueur (fourche vers −Z). */
export function cle(size) {
  const m = base(), w = shape(size);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(w.P, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(w.N, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(m.uv, 2));
  geo.setIndex(new THREE.BufferAttribute(m.I, 1));
  geo.userData.edgeAngle = 60; // pas de contours sur les arrondis ni sur les 12 pans
  const mesh = new THREE.Mesh(geo, material());
  mesh.name = `cle_mixte_${String(size).replace(/[ /]/g, '_')}po`;
  return mesh;
}

/** Les seize grandeurs posées à plat, bouts des fourches alignés, de la plus petite à la plus grande. */
export function P001(api) {
  let x = 0;
  SIZES.forEach((size, k) => {
    const w = shape(size), g = api.S.group(cle(size));
    g.position.set(x - w.min[0], -w.min[1], -w.min[2]);
    x += w.max[0] - w.min[0] + 0.012;
    api.part(String(k + 1), g, [0, 0, 0], { caption: `${size} po` });
  });
  return { view: { dir: [0.45, 1, -0.6] } };
}

export default { P001 };
