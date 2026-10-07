import * as THREE from 'three';

// Palette inspirée des rendus du manuel : rouge MRI, chenilles jaunes,
// moteur bleu, acier, laiton. Les matériaux sont partagés entre les pièces ;
// la mise en évidence utilise des variantes clonées et mises en cache.
const defs = {
  red: { color: 0xb5121b, metalness: 0.25, roughness: 0.45 },
  redDark: { color: 0x8a0f15, metalness: 0.25, roughness: 0.5 },
  black: { color: 0x1d1e20, metalness: 0.35, roughness: 0.55 },
  rubber: { color: 0x121212, metalness: 0.0, roughness: 0.9 },
  charcoal: { color: 0x2c2e31, metalness: 0.3, roughness: 0.6 },
  yellow: { color: 0xe0cb1c, metalness: 0.2, roughness: 0.5 },
  safety: { color: 0xf2c200, metalness: 0.1, roughness: 0.5 },
  blue: { color: 0x1d7db3, metalness: 0.3, roughness: 0.45 },
  steel: { color: 0xb7bcc3, metalness: 0.85, roughness: 0.32 },
  chrome: { color: 0xe4e8ed, metalness: 1.0, roughness: 0.14 },
  darkSteel: { color: 0x5a5e64, metalness: 0.75, roughness: 0.4 },
  brass: { color: 0xc9a038, metalness: 0.85, roughness: 0.3 },
  grey: { color: 0xa6aab0, metalness: 0.25, roughness: 0.55 },
  lightGrey: { color: 0xd3d5d8, metalness: 0.15, roughness: 0.6 },
  orange: { color: 0xd47a26, metalness: 0.05, roughness: 0.6 },
  cream: { color: 0xe6e0aa, metalness: 0.05, roughness: 0.7 },
  green: { color: 0x2f9a47, metalness: 0.2, roughness: 0.5 },
  white: { color: 0xf3f3f1, metalness: 0.0, roughness: 0.4 },
  copper: { color: 0xb8733a, metalness: 0.8, roughness: 0.35 },
  glass: { color: 0xcfe6ff, metalness: 0.0, roughness: 0.05, transparent: true, opacity: 0.35 },
  lamp: { color: 0xfff6d0, emissive: 0xffe9a0, emissiveIntensity: 0.6, roughness: 0.3 },
};

const cache = new Map();

export function mat(name) {
  if (name instanceof THREE.Material) return name;
  let m = cache.get(name);
  if (!m) {
    const d = defs[name];
    if (!d) throw new Error(`Matériau inconnu : ${name}`);
    m = new THREE.MeshStandardMaterial({ ...d });
    m.name = name;
    cache.set(name, m);
  }
  return m;
}

const variants = new Map();

/** Plan de coupe partagé par toutes les variantes « coupées » (déplacé par la visionneuse). */
export const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

// En coupe, les faces arrière visibles à travers le plan sont peintes d'une
// couleur pleine hachurée, comme une coupe sur un dessin technique.
const CAP = `#include <dithering_fragment>
  if (!gl_FrontFacing) {
    float hatch = step(0.72, fract((gl_FragCoord.x + gl_FragCoord.y) * 0.085));
    vec3 cap = diffuseColor.rgb * 0.62 + 0.06;
    gl_FragColor = vec4(mix(cap, cap * 0.42, hatch), 1.0);
  }`;

function variant(base, kind, cut) {
  const key = `${base.uuid}:${kind}:${cut ? 1 : 0}`;
  let v = variants.get(key);
  if (v) return v;
  v = base.clone();
  if (kind === 'hover') {
    v.emissive = new THREE.Color(0x2b7bd6);
    v.emissiveIntensity = 0.55;
  } else if (kind === 'select') {
    v.emissive = new THREE.Color(0xff8a00);
    v.emissiveIntensity = 0.75;
  } else if (kind === 'ghost') {
    v.transparent = true;
    v.opacity = 0.1;
    v.depthWrite = false;
  }
  if (cut) {
    v.clippingPlanes = [sectionPlane];
    v.clipShadows = true;
    v.side = THREE.DoubleSide;
    if (kind !== 'ghost') {
      v.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', CAP);
      };
      v.customProgramCacheKey = () => 'section-cap';
    }
  }
  variants.set(key, v);
  return v;
}

/**
 * Applique un état visuel ('base' | 'hover' | 'select' | 'ghost') à un objet
 * et ses enfants, avec ou sans plan de coupe.
 */
export function applyState(object, state, cut = false) {
  object.traverse((o) => {
    if (!o.isMesh) return;
    if (!o.userData.baseMaterial) o.userData.baseMaterial = o.material;
    const base = o.userData.baseMaterial;
    o.material = state === 'base' && !cut ? base : variant(base, state, cut);
    o.userData.state = state;
    o.userData.cut = cut;
  });
}
