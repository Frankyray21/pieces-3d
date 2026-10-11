import * as THREE from 'three';

// Palette d'après la photo de couverture (F01) et les rendus du manuel : rouge
// MRI, chenilles jaunes, moteur bleu, acier, laiton. Chaque matériau a une
// finition physique : peinture vernie (peau d'orange, ondulation de tôle,
// brillance inégale), acier usiné ou brossé, chrome dur, fonte et alu coulés
// (grain), caoutchouc mat, verre. Le relief de surface est calculé en
// projection triplanaire dans le repère de la pièce (échelle réelle en mètres,
// sans dépendre des UV) à partir d'une seule petite texture de bruit partagée.
// Les matériaux sont partagés entre les pièces ; la mise en évidence utilise
// des variantes clonées et mises en cache.

// Finitions : fine = relief fin (peau d'orange, grain), wave = ondulation
// large (tôle, coulée), rough = variation de rugosité, tint = variation de
// teinte (salissure légère), fs / cs = fréquence du relief fin / large (1/m),
// stretch = étirement du relief fin (brossage), env = gain des reflets du
// studio (les métaux reçoivent des réflecteurs, comme en photo produit).
const FIN = {
  // Peinture sur tôle : peau d'orange et ondulation discrètes (une tôle peinte
  // reste lisse en photo ; un relief marqué ferait « peinture martelée »).
  paint: { fine: 0.018, wave: 0.005, rough: 0.16, tint: 0.07, fs: 14, cs: 0.9, env: 1 },
  paintSatin: { fine: 0.026, wave: 0.007, rough: 0.2, tint: 0.09, fs: 14, cs: 0.9, env: 1 },
  // Peinture noire : se lit surtout par ses reflets (réflecteurs renforcés).
  paintDark: { fine: 0.02, wave: 0.005, rough: 0.16, tint: 0.07, fs: 14, cs: 0.9, env: 1.8 },
  machined: { fine: 0.05, wave: 0.006, rough: 0.14, tint: 0.05, fs: 9, cs: 1.6, stretch: 7, env: 2.1 },
  chrome: { fine: 0.006, wave: 0.002, rough: 0.03, tint: 0.02, fs: 9, cs: 1.6, env: 2.4 },
  cast: { fine: 0.13, wave: 0.02, rough: 0.22, tint: 0.1, fs: 26, cs: 1.5, env: 1.6 },
  rubber: { fine: 0.12, wave: 0.02, rough: 0.12, tint: 0.08, fs: 30, cs: 1.2, env: 1.5 },
  plastic: { fine: 0.04, wave: 0.01, rough: 0.12, tint: 0.05, fs: 20, cs: 1.2, env: 1.1 },
  // Acier bruni des outils de forage : grain très fin, reflets renforcés (pièce sombre).
  oxide: { fine: 0.03, wave: 0.004, rough: 0.12, tint: 0.04, fs: 30, cs: 1.6, env: 1.9 },
};

// Peinture industrielle vernie (polyuréthane) : base satinée + vernis brillant.
const PAINT = { metalness: 0, roughness: 0.42, specularIntensity: 1, clearcoat: 0.75, clearcoatRoughness: 0.14, fin: 'paint' };
const defs = {
  red: { ...PAINT, color: 0xb5121a },
  redDark: { ...PAINT, color: 0x7a0c12, roughness: 0.46 },
  // Noir : gris très sombre verni ; les reflets du studio dessinent les faces.
  black: { ...PAINT, color: 0x2c2e33, roughness: 0.42, clearcoat: 0.85, clearcoatRoughness: 0.16, fin: 'paintDark' },
  rubber: { color: 0x1f2022, metalness: 0, roughness: 0.78, specularIntensity: 0.55, fin: 'rubber' },
  charcoal: { color: 0x3c3f44, metalness: 0.45, roughness: 0.5, fin: 'cast' },
  yellow: { ...PAINT, color: 0xe0c812 },
  safety: { ...PAINT, color: 0xf0b400 },
  blue: { ...PAINT, color: 0x1b7096 },
  // Acier usiné / brossé (axes, tôles nues, visserie brute).
  steel: { color: 0xb9bdc2, metalness: 1, roughness: 0.3, fin: 'machined' },
  // Chrome dur des tiges de vérin : reflets nets.
  chrome: { color: 0xdadde0, metalness: 1, roughness: 0.045, fin: 'chrome' },
  // Acier bruni / phosphaté.
  darkSteel: { color: 0x4f545a, metalness: 0.85, roughness: 0.42, fin: 'machined' },
  brass: { color: 0xd8b062, metalness: 1, roughness: 0.28, fin: 'machined' },
  grey: { ...PAINT, color: 0x9da2a8, roughness: 0.5, clearcoat: 0.5, fin: 'paintSatin' },
  lightGrey: { ...PAINT, color: 0xcfd2d5, roughness: 0.5, clearcoat: 0.45, fin: 'paintSatin' },
  orange: { ...PAINT, color: 0xd8701c },
  cream: { color: 0xe2d9a4, metalness: 0, roughness: 0.82, fin: 'rubber' },
  green: { ...PAINT, color: 0x258c45 },
  white: { ...PAINT, color: 0xeeeeea, roughness: 0.38 },
  copper: { color: 0xc8805a, metalness: 1, roughness: 0.3, fin: 'machined' },
  glass: { color: 0xdbeeff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.22, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.5 },
  lamp: { color: 0xfff6d0, emissive: 0xffe9a0, emissiveIntensity: 0.9, roughness: 0.25 },
  // Finitions supplémentaires disponibles pour les modèles.
  castIron: { color: 0x5d6166, metalness: 0.6, roughness: 0.68, fin: 'cast' },
  castAlu: { color: 0xb8bcc0, metalness: 0.85, roughness: 0.5, fin: 'cast' },
  zinc: { color: 0xc6ccd2, metalness: 1, roughness: 0.34, fin: 'machined' },
  hose: { color: 0x1c1d1f, metalness: 0, roughness: 0.62, specularIntensity: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.5, fin: 'rubber' },
  plastic: { color: 0x2b2d30, metalness: 0, roughness: 0.5, fin: 'plastic' },
  // Acier bruni / phosphaté des outils de forage (Epiroc) : très sombre mais métallique.
  blackOxide: { color: 0x1e2023, metalness: 0.75, roughness: 0.32, fin: 'oxide' },
  gunmetal: { color: 0x2c2f33, metalness: 0.8, roughness: 0.38, fin: 'oxide' },
  // Fonte / alu peints en noir (carters de pompe, moteurs hydrauliques).
  blackCast: { color: 0x2a2c30, metalness: 0.1, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.35, fin: 'paintDark' },};

// ------------------------------------------------------- relief de surface

let SURF_TEX = null;
/**
 * Texture de bruit périodique 128×128, générée une fois :
 * R, G = pente d'un relief (somme d'octaves), B = taches larges, A = grain fin.
 */
function surfaceTexture() {
  if (SURF_TEX) return SURF_TEX;
  const N = 128;
  let s = 0x2f6b9d;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Bruit de valeur périodique (p cellules par tuile), interpolation quintique.
  const layer = (p) => {
    const lat = new Float32Array(p * p).map(rnd);
    const out = new Float32Array(N * N);
    const q = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const fx = (i / N) * p, fy = (j / N) * p;
        const ix = Math.floor(fx), iy = Math.floor(fy);
        const tx = q(fx - ix), ty = q(fy - iy);
        const x0 = ix % p, x1 = (ix + 1) % p, y0 = iy % p, y1 = (iy + 1) % p;
        const a = lat[y0 * p + x0], b = lat[y0 * p + x1], c = lat[y1 * p + x0], d = lat[y1 * p + x1];
        out[j * N + i] = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
      }
    }
    return out;
  };
  const sum = (specs) => {
    const out = new Float32Array(N * N);
    for (const [p, w] of specs) {
      const l = layer(p);
      for (let k = 0; k < out.length; k++) out[k] += l[k] * w;
    }
    return out;
  };
  const norm = (a) => {
    let lo = Infinity, hi = -Infinity;
    for (const v of a) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return a.map((v) => (v - lo) / (hi - lo || 1));
  };
  const H = sum([[8, 1], [16, 0.55], [32, 0.25]]);
  const B = norm(sum([[2, 1], [4, 0.6], [8, 0.25]]));
  const A = norm(sum([[32, 1], [64, 0.5]]));
  const gx = new Float32Array(N * N), gy = new Float32Array(N * N);
  let gmax = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const k = j * N + i;
      gx[k] = H[j * N + ((i + 1) % N)] - H[j * N + ((i - 1 + N) % N)];
      gy[k] = H[((j + 1) % N) * N + i] - H[((j - 1 + N) % N) * N + i];
      gmax = Math.max(gmax, Math.abs(gx[k]), Math.abs(gy[k]));
    }
  }
  const data = new Uint8Array(N * N * 4);
  for (let k = 0; k < N * N; k++) {
    data[k * 4] = Math.round((gx[k] / gmax * 0.5 + 0.5) * 255);
    data[k * 4 + 1] = Math.round((gy[k] / gmax * 0.5 + 0.5) * 255);
    data[k * 4 + 2] = Math.round(B[k] * 255);
    data[k * 4 + 3] = Math.round(A[k] * 255);
  }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  SURF_TEX = tex;
  return tex;
}

const SURF_VERT_PARS = /* glsl */`#include <common>
varying vec3 vSurfP;
varying vec3 vSurfN;
varying mat3 vSurfM;`;

const SURF_VERT = /* glsl */`#include <begin_vertex>
vSurfP = position;
vSurfN = objectNormal;
vSurfM = normalMatrix;
#ifdef USE_INSTANCING
  vSurfM = normalMatrix * mat3( instanceMatrix );
#endif`;

const SURF_FRAG_PARS = /* glsl */`#include <common>
varying vec3 vSurfP;
varying vec3 vSurfN;
varying mat3 vSurfM;
uniform sampler2D uSurfTex;
uniform vec4 uSurfAmp;   // fin, large, rugosité, teinte
uniform vec3 uSurfFreq;  // fréquence fine, large, étirement
uniform float uSurfEnv;  // gain des reflets du studio
// Pente 3D (repère pièce) d'un échantillon triplanaire : plans YZ, XZ, XY.
vec3 surfGrad(vec4 x, vec4 y, vec4 z, vec3 w) {
  vec2 a = x.rg * 2.0 - 1.0, b = y.rg * 2.0 - 1.0, c = z.rg * 2.0 - 1.0;
  return w.x * vec3(0.0, a.y, a.x) + w.y * vec3(b.x, 0.0, b.y) + w.z * vec3(c.x, c.y, 0.0);
}`;

// Échantillons triplanaires (relief fin étiré pour le brossage, relief large),
// puis teinte, rugosité ; la normale est inclinée après le calcul de base.
const SURF_FRAG = /* glsl */`
vec3 sN = normalize( vSurfN );
vec3 sW = pow( abs( sN ), vec3( 4.0 ) );
sW /= ( sW.x + sW.y + sW.z + 1e-5 );
vec3 sP = vSurfP;
vec2 sF = vec2( uSurfFreq.x * uSurfFreq.z, uSurfFreq.x );
vec4 fX = texture2D( uSurfTex, sP.zy * sF );
vec4 fY = texture2D( uSurfTex, sP.xz * sF );
vec4 fZ = texture2D( uSurfTex, sP.xy * sF );
vec4 cX = texture2D( uSurfTex, sP.zy * uSurfFreq.y + 0.31 );
vec4 cY = texture2D( uSurfTex, sP.xz * uSurfFreq.y + 0.57 );
vec4 cZ = texture2D( uSurfTex, sP.xy * uSurfFreq.y + 0.13 );
float sBlot = dot( sW, vec3( cX.b, cY.b, cZ.b ) ) - 0.5;
float sGrain = dot( sW, vec3( fX.a, fY.a, fZ.a ) ) - 0.5;
vec3 sGradO = surfGrad( fX, fY, fZ, sW ) * uSurfAmp.x + surfGrad( cX, cY, cZ, sW ) * uSurfAmp.y;
sGradO -= sN * dot( sGradO, sN );
vec3 sDelta = vSurfM * ( - sGradO );
diffuseColor.rgb *= 1.0 + uSurfAmp.w * ( sBlot * 1.2 + sGrain * 0.4 );
#include <roughnessmap_fragment>
roughnessFactor = clamp( roughnessFactor * ( 1.0 + uSurfAmp.z * ( sBlot * 1.6 + sGrain * 0.8 ) ), 0.02, 1.0 );`;

/** Injecte le relief de surface dans un shader standard / physique. */
function injectSurface(shader, fin) {
  shader.uniforms.uSurfTex = { value: surfaceTexture() };
  shader.uniforms.uSurfAmp = { value: new THREE.Vector4(fin.fine, fin.wave, fin.rough, fin.tint) };
  shader.uniforms.uSurfFreq = { value: new THREE.Vector3(fin.fs, fin.cs, fin.stretch || 1) };
  shader.uniforms.uSurfEnv = { value: fin.env ?? 1 };
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', SURF_VERT_PARS)
    .replace('#include <begin_vertex>', SURF_VERT);
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', SURF_FRAG_PARS)
    .replace('#include <roughnessmap_fragment>', SURF_FRAG)
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
normal = normalize( normal + faceDirection * sDelta );`)
    .replace('#include <clearcoat_normal_fragment_begin>', `#include <clearcoat_normal_fragment_begin>
#ifdef USE_CLEARCOAT
  clearcoatNormal = normalize( clearcoatNormal + faceDirection * sDelta * 1.3 );
#endif`)
    .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
#if defined( RE_IndirectSpecular )
  radiance *= uSurfEnv;
#endif`)
    .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
  material.clearcoatRoughness = clamp( material.clearcoatRoughness * ( 1.0 + uSurfAmp.z * 2.5 * sBlot ), 0.02, 1.0 );
#endif`);
}

/** Paramètres de finition (nom de FIN ou objet) d'un matériau, ou null. */
function finOf(m) {
  const f = m.userData.fin;
  return f ? (typeof f === 'string' ? FIN[f] : f) : null;
}

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

/** Programme du matériau : relief de surface (si finition) et capuchon de coupe (sens des hachures dir). */
function setupProgram(m, cap, dir = 1) {
  const fin = finOf(m);
  if (!fin && !cap) return;
  m.onBeforeCompile = (shader) => {
    if (fin) injectSurface(shader, fin);
    if (cap) shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', capShader(dir));
  };
  const key = `${fin ? 'surf' : ''}${cap ? `-section-cap-${dir}` : ''}`;
  m.customProgramCacheKey = () => key;
}

const cache = new Map();

export function mat(name) {
  if (name instanceof THREE.Material) return name;
  let m = cache.get(name);
  if (!m) {
    const d = defs[name];
    if (!d) throw new Error(`Matériau inconnu : ${name}`);
    const { fin, ...p } = d;
    const physical = ['clearcoat', 'ior', 'specularIntensity'].some((k) => k in p);
    m = physical ? new THREE.MeshPhysicalMaterial(p) : new THREE.MeshStandardMaterial(p);
    // Faces légèrement repoussées en profondeur : les contours dessinés
    // exactement sur les arêtes restent nets (pas de scintillement).
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = name;
    if (fin) m.userData.fin = fin;
    setupProgram(m, false);
    cache.set(name, m);
  }
  return m;
}

/**
 * Donne une finition réaliste (relief, rugosité inégale) à un matériau créé
 * hors palette. preset : 'paint' | 'paintSatin' | 'machined' | 'chrome' |
 * 'cast' | 'rubber' | 'plastic'. Retourne le matériau.
 */
export function withFinish(material, preset = 'paint') {
  if (!FIN[preset]) throw new Error(`Finition inconnue : ${preset}`);
  material.userData.fin = preset;
  setupProgram(material, false);
  material.needsUpdate = true;
  return material;
}

const variants = new Map();

/** Plan de coupe partagé par toutes les variantes « coupées » (déplacé par la visionneuse). */
export const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

function variant(base, kind, cut) {
  const key = `${base.uuid}:${kind}:${cut ? 1 : 0}`;
  let v = variants.get(key);
  if (v) return v;
  v = base.clone();
  if (kind === 'hover') {
    v.emissive = new THREE.Color(0x2b7bd6);
    v.emissiveIntensity = 0.5;
  } else if (kind === 'select') {
    v.emissive = new THREE.Color(0xff8a00);
    v.emissiveIntensity = 0.7;
  } else if (kind === 'ghost') {
    v.transparent = true;
    v.opacity = 0.1;
    v.depthWrite = false;
  }
  if (cut) {
    v.clippingPlanes = [sectionPlane];
    v.side = THREE.DoubleSide;
  }
  // Fantôme : pas de relief (inutile à 10 % d'opacité) ; sinon relief et capuchon.
  if (kind === 'ghost') {
    v.userData.fin = null;
    v.onBeforeCompile = () => {};
    v.customProgramCacheKey = () => '';
  } else {
    setupProgram(v, cut);  }
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
    if (!o.userData.baseMaterial) o.userData.baseMaterial = o.material;
    const base = o.userData.baseMaterial;
    o.material = state === 'base' && !cut ? base : variant(base, state, cut);
    o.userData.state = state;
    o.userData.cut = cut;
  });
}
