import * as THREE from 'three';

// Palette inspirée des rendus du manuel : rouge MRI, chenilles jaunes,
// moteur bleu pétrole, acier, laiton. Peintures en vernis (clearcoat), métaux
// réfléchissants. Les matériaux sont partagés entre les pièces ; la mise en
// évidence utilise des variantes clonées et mises en cache.
const PAINT = { metalness: 0.05, roughness: 0.45, specularIntensity: 0.8, clearcoat: 0.35, clearcoatRoughness: 0.2 };
const defs = {
  red: { ...PAINT, color: 0xb0121b },
  redDark: { ...PAINT, color: 0x7e0d13, roughness: 0.5 },
  black: { ...PAINT, color: 0x1c1d20, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3 },
  rubber: { color: 0x151516, metalness: 0.0, roughness: 0.88 },
  charcoal: { color: 0x2d3034, metalness: 0.35, roughness: 0.55 },
  yellow: { ...PAINT, color: 0xdcc814 },
  safety: { ...PAINT, color: 0xf2bd00 },
  blue: { ...PAINT, color: 0x17698c, metalness: 0.1 },
  steel: { color: 0xb4b9c0, metalness: 0.9, roughness: 0.34 },
  chrome: { color: 0xeef1f4, metalness: 1.0, roughness: 0.08 },
  darkSteel: { color: 0x5a5f66, metalness: 0.8, roughness: 0.4 },
  brass: { color: 0xd2a447, metalness: 1.0, roughness: 0.3 },
  grey: { ...PAINT, color: 0xa3a8ae, metalness: 0.15, roughness: 0.5, clearcoat: 0.3 },
  lightGrey: { ...PAINT, color: 0xd0d3d7, roughness: 0.55, clearcoat: 0.25 },
  orange: { ...PAINT, color: 0xd4741f },
  cream: { color: 0xe3dca2, metalness: 0.0, roughness: 0.75 },
  green: { ...PAINT, color: 0x2a944a },
  white: { ...PAINT, color: 0xf3f3f1, roughness: 0.35 },
  copper: { color: 0xc17a42, metalness: 1.0, roughness: 0.32 },
  glass: { color: 0xdbeeff, metalness: 0.0, roughness: 0.04, transparent: true, opacity: 0.28, depthWrite: false, clearcoat: 1 },
  lamp: { color: 0xfff6d0, emissive: 0xffe9a0, emissiveIntensity: 0.7, roughness: 0.3 },
};

const cache = new Map();

export function mat(name) {
  if (name instanceof THREE.Material) return name;
  let m = cache.get(name);
  if (!m) {
    const d = defs[name];
    if (!d) throw new Error(`Matériau inconnu : ${name}`);
    m = 'clearcoat' in d ? new THREE.MeshPhysicalMaterial({ ...d }) : new THREE.MeshStandardMaterial({ ...d });
    // Faces légèrement repoussées en profondeur : les contours dessinés
    // exactement sur les arêtes restent nets (pas de scintillement).
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = name;
    cache.set(name, m);
  }
  return m;
}

const variants = new Map();

/** Plan de coupe partagé par toutes les variantes « coupées » (déplacé par la visionneuse). */
export const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

// En coupe, les faces arrière visibles à travers le plan sont peintes d'une
// couleur pleine hachurée, comme une coupe sur un dessin technique. La couleur
// est calculée en linéaire puis passe par le même rendu de tons que le reste.
const CAP = `#include <dithering_fragment>
  if (!gl_FrontFacing) {
    float hatch = step(0.72, fract((gl_FragCoord.x + gl_FragCoord.y) * 0.085));
    vec3 cap = diffuseColor.rgb * 0.55 + 0.02;
    vec4 capColor = vec4(mix(cap, cap * 0.35, hatch), 1.0);
    #if defined( TONE_MAPPING )
      capColor.rgb = toneMapping(capColor.rgb);
    #endif
    gl_FragColor = linearToOutputTexel(capColor);
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

// Contours (arêtes vives) façon dessin du manuel : traits sombres fins.
const EDGE = { base: 0x16181b, opacity: 0.9, ghost: 0.07 };
const edgeVariants = new Map();

/** Matériau de contour selon l'état de la pièce ('ghost' estompé) et la coupe. */
export function edgeMaterial(state = 'base', cut = false) {
  const kind = state === 'ghost' ? 'ghost' : 'base';
  const key = `${kind}:${cut ? 1 : 0}`;
  let m = edgeVariants.get(key);
  if (!m) {
    m = new THREE.LineBasicMaterial({
      color: EDGE.base,
      transparent: true,
      opacity: kind === 'ghost' ? EDGE.ghost : EDGE.opacity,
      depthWrite: false,
    });
    if (cut) m.clippingPlanes = [sectionPlane];
    edgeVariants.set(key, m);
  }
  return m;
}

/** Couleur des contours (thème clair / sombre). */
export function setEdgeColor(hex) {
  for (const m of edgeVariants.values()) m.color.setHex(hex);
  EDGE.base = hex;
}

/**
 * Applique un état visuel ('base' | 'hover' | 'select' | 'ghost') à un objet
 * et ses enfants, avec ou sans plan de coupe.
 */
export function applyState(object, state, cut = false) {
  object.traverse((o) => {
    if (o.userData.isEdges) {
      o.material = edgeMaterial(state, cut);
      return;
    }
    if (!o.isMesh) return;
    if (!o.userData.baseMaterial) {
      o.userData.baseMaterial = o.material;
      o.userData.baseCast = o.castShadow;
    }
    const base = o.userData.baseMaterial;
    o.material = state === 'base' && !cut ? base : variant(base, state, cut);
    // Une pièce estompée ne porte plus d'ombre.
    o.castShadow = state !== 'ghost' && o.userData.baseCast;
    o.userData.state = state;
    o.userData.cut = cut;
  });
}
