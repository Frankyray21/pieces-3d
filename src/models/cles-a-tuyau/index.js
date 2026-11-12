// Clés à tuyau droites de 6 à 60 po, aux cotes publiées des clés RIDGID « heavy-duty » (voir forme.js).
// Maillage et textures : clé à tuyau de Poly Haven (CC0, https://polyhaven.com/a/pipe_wrench, Will Evarts),
// usée et rouillée ; la marque « 18" » de la texture reste la même sur toutes les grandeurs.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { base, shape, SPECS, SIZES, IN } from './forme.js';

export { shape, SPECS, SIZES, IN };

let MATERIAL = null;
/** Matériau texturé partagé (couleur, normales, occlusion-rugosité-métal) ; palette simple hors navigateur. */
function material() {
  if (MATERIAL) return MATERIAL;
  if (typeof document === 'undefined') return (MATERIAL = mat('redDark'));
  const loader = new THREE.TextureLoader();
  const redraw = () => window.dispatchEvent(new Event('pieces3d:redessiner'));
  const tex = (name, srgb = false) => {
    const t = loader.load(`equipment/cles-a-tuyau/textures/${name}.webp`, redraw);
    t.flipY = false; // UV du glTF
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const arm = tex('arm');
  MATERIAL = new THREE.MeshStandardMaterial({ map: tex('diff', true), normalMap: tex('nor'), aoMap: arm, roughnessMap: arm, metalnessMap: arm, metalness: 1, roughness: 1 });
  MATERIAL.polygonOffset = true;
  MATERIAL.polygonOffsetFactor = 1;
  MATERIAL.polygonOffsetUnits = 1;
  MATERIAL.name = 'cle_a_tuyau';
  return MATERIAL;
}

/** Clé de grandeur « size » (po) dans son repère (X largeur, Y manche → tête, Z épaisseur) ; open : ouverture en mètres. */
export function cle(size, open = null) {
  const m = base(), w = shape(size, open);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(w.P, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(w.N, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(m.uv, 2));
  geo.setIndex(new THREE.BufferAttribute(m.I, 1));
  geo.userData.edgeAngle = 60; // pas de contours sur le relief du moulage
  const mesh = new THREE.Mesh(geo, material());
  mesh.name = `cle_a_tuyau_${size}po`;
  return mesh;
}

/** Les neuf grandeurs couchées à plat, bouts de manche alignés, de la plus petite à la plus grande. */
export function P001(api) {
  let x = 0;
  SIZES.forEach((size, k) => {
    const w = shape(size), mesh = cle(size);
    const g = api.S.group(mesh);
    g.rotation.x = Math.PI / 2; // manche le long de Z, épaisseur à la verticale
    g.position.set(x - w.min[0], w.max[2], -w.min[1]);
    x += w.max[0] - w.min[0] + 0.04;
    api.part(String(k + 1), g, [0, 0, 0], { caption: `${size} po` });
  });
  return { view: { dir: [0.35, 1, -0.75] } };
}

export default { P001 };
