import * as THREE from 'three';

// Palette inspirée des rendus du manuel : rouge MRI, chenilles jaunes,
// moteur bleu pétrole, acier, laiton. Peintures en vernis (clearcoat), métaux
// réfléchissants. Les matériaux sont partagés entre les pièces ; la mise en
// évidence utilise des variantes clonées et mises en cache.
const PAINT = { metalness: 0.05, roughness: 0.45, specularIntensity: 0.8, clearcoat: 0.35, clearcoatRoughness: 0.2 };
const defs = {
  red: { ...PAINT, color: 0xb0121b },
  redDark: { ...PAINT, color: 0x7e0d13, roughness: 0.5 },
  black: { ...PAINT, color: 0x24262a, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3 },
  rubber: { color: 0x151516, metalness: 0.0, roughness: 0.88 },
  charcoal: { color: 0x3b3f45, metalness: 0.35, roughness: 0.52 },
  yellow: { ...PAINT, color: 0xdcc814 },
  safety: { ...PAINT, color: 0xf2bd00 },
  blue: { ...PAINT, color: 0x17698c, metalness: 0.1 },
  steel: { color: 0xb4b9c0, metalness: 0.9, roughness: 0.34 },
  chrome: { color: 0xeef1f4, metalness: 1.0, roughness: 0.08 },
  darkSteel: { color: 0x5a5f66, metalness: 0.8, roughness: 0.4 },
  // Acier bruni / phosphaté des outils de forage : très sombre mais métallique.
  blackOxide: { color: 0x1e2023, metalness: 0.75, roughness: 0.32 },
  gunmetal: { color: 0x2c2f33, metalness: 0.8, roughness: 0.38 },
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

// Grain de surface (rendu photo) : légère variation de rugosité et de teinte,
// et micro-relief (peau d'orange de la peinture, grain de fonderie) qui casse
// les reflets ; calculés dans le shader à partir de la position sur la pièce,
// sans texture. Le vernis (clearcoat) reste lisse par-dessus.
// [variation de rugosité, variation de teinte, fréquence (1/m), pente du relief]
const GRAIN = {
  paint: [0.22, 0.03, 45, 0.018],
  cast: [0.35, 0.05, 70, 0.03],
  rubber: [0.3, 0.05, 90, 0.04],
  metal: [0.25, 0.015, 120, 0.008],
  metalFine: [0.12, 0.015, 600, 0.006],
};
const GRAIN_OF = {
  red: 'paint', redDark: 'paint', black: 'paint', yellow: 'paint', safety: 'paint', blue: 'paint',
  grey: 'paint', lightGrey: 'paint', orange: 'paint', green: 'paint', white: 'paint',
  charcoal: 'cast', darkSteel: 'cast', rubber: 'rubber', steel: 'metal', brass: 'metal', copper: 'metal',
  blackOxide: 'metalFine', gunmetal: 'metalFine',
};
const NOISE = `
varying vec3 vGrainPos;
uniform vec4 uGrain;
float grainHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float grainNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(grainHash(i), grainHash(i + vec3(1, 0, 0)), f.x), mix(grainHash(i + vec3(0, 1, 0)), grainHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(grainHash(i + vec3(0, 0, 1)), grainHash(i + vec3(1, 0, 1)), f.x), mix(grainHash(i + vec3(0, 1, 1)), grainHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float grainFbm(vec3 p) { return 0.6 * grainNoise(p) + 0.4 * grainNoise(p * 2.7 + 11.0); }`;

// Micro-relief : la normale est inclinée selon le gradient écran d'une hauteur
// de bruit (pente donnée), estompé quand le motif devient plus fin qu'un pixel.
const BUMP = `
  {
    vec3 gp = vGrainPos * uGrain.z * 2.2;
    float fade = 1.0 - smoothstep(0.35, 0.9, length(fwidth(gp)));
    if (fade > 0.0) {
      float h = grainFbm(gp) * uGrain.w / (uGrain.z * 2.2) * fade;
      vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition);
      vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
      float det = dot(dpx, r1);
      vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
      normal = normalize(abs(det) * normal - grad);
    }
  }`;

function addGrain(m, [rough, tint, freq, bump]) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uGrain = { value: new THREE.Vector4(rough, tint, freq, bump) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGrainPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGrainPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${NOISE}`)
      .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb *= 1.0 + uGrain.y * (grainFbm(vGrainPos * uGrain.z * 0.35 + 7.0) - 0.5) * 2.0;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor * (1.0 + uGrain.x * (grainFbm(vGrainPos * uGrain.z) - 0.5) * 2.0), 0.03, 1.0);')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${BUMP}`);
  };
  m.customProgramCacheKey = () => `grain-${rough}-${tint}-${freq}-${bump}`;
}

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
    if (GRAIN_OF[name]) addGrain(m, GRAIN[GRAIN_OF[name]]);
    m.name = name;
    cache.set(name, m);
  }
  return m;
}

const variants = new Map();

/** Plan de coupe partagé par toutes les variantes « coupées » (déplacé par la visionneuse). */
export const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

// En coupe, les faces arrière visibles à travers le plan sont peintes d'une
// couleur pleine hachurée, comme une coupe sur un dessin technique : teinte de
// la pièce éclaircie (les aciers sombres restent lisibles), hachures à 45° dont
// le sens alterne d'un matériau à l'autre pour séparer les pièces voisines. La
// couleur est calculée en linéaire puis passe par le même rendu de tons.
const capShader = (dir) => `#include <dithering_fragment>
  if (!gl_FrontFacing) {
    float hatch = step(0.72, fract((gl_FragCoord.x ${dir > 0 ? '+' : '-'} gl_FragCoord.y) * 0.12));
    vec3 cap = mix(diffuseColor.rgb, vec3(1.0), 0.45);
    vec4 capColor = vec4(mix(cap, cap * 0.4, hatch), 1.0);
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
      const dir = base.id % 2 ? 1 : -1;
      const grain = v.onBeforeCompile;
      v.onBeforeCompile = (shader, r) => {
        if (grain) grain(shader, r);
        shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', capShader(dir));
      };
      const key = base.customProgramCacheKey?.() || '';
      v.customProgramCacheKey = () => `${key}-section-cap-${dir}`;
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
