import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { applyState, sectionPlane, edgeMaterial, setEdgeColor } from './materials.js';
import { featureEdges } from './shapes.js';
import { disposeObject } from './assembly.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
// Un sous-groupe éclaté prend plus de place : on l'écarte d'autant de son parent.
const SPREAD = 0.9;
// Lumières fixes, orientées d'après la vue par défaut du modèle : clé haute
// à gauche de l'œil (porte l'ombre), débouchage bas à droite. [azimut, élévation] en degrés.
const KEY_AZEL = [40, 57];
const FILL_AZEL = [-45, 24];
const azEl = (az, el) => {
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  return new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
};

/**
 * Studio photo pour les reflets : dôme dégradé (plafond clair, sol sombre)
 * et boîtes à lumière. Donne des reflets nets sur le chrome et le vernis.
 */
function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const R = 30;
  const dome = new THREE.SphereGeometry(R, 48, 24);
  const top = new THREE.Color(1.0, 1.0, 1.02), hor = new THREE.Color(0.74, 0.76, 0.79), low = new THREE.Color(0.46, 0.46, 0.47);
  const col = [];
  const c = new THREE.Color();
  const p = dome.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / R;
    if (y >= 0) c.copy(hor).lerp(top, Math.pow(y, 0.6));
    else c.copy(hor).lerp(low, Math.pow(-y, 0.4));
    col.push(c.r, c.g, c.b);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, k, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(18, 12, 1.9, [0, 24, 2]); // zénithal
  panel(6, 16, 4.0, [-14, 8, 18]); // clé, avant-gauche
  panel(4, 16, 2.4, [22, 6, -6]); // contre-jour droite
  panel(16, 3, 1.5, [10, 2.5, 20]); // bande basse frontale
  panel(5, 14, 2.2, [16, 7, 16]); // bande latérale droite
  panel(14, 4, 1.2, [-12, 1.5, -16]); // réflecteur bas arrière
  panel(20, 20, 0.9, [0, -22, 0]); // sol clair (réflecteur) : dessous des pièces lisible
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  return tex;
}

/** Grille au sol qui s'estompe avec la distance (traits fins, pas de 1 et 5 unités). */
function gridMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(0x7f8b98) },
      uStep: { value: 0.5 },
      uFade: { value: 5 },
      uCenter: { value: new THREE.Vector2() },
      uOpacity: { value: 0.45 },
    },
    vertexShader: /* glsl */`
      varying vec2 vXZ;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vXZ = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform float uStep;
      uniform float uFade;
      uniform vec2 uCenter;
      uniform float uOpacity;
      varying vec2 vXZ;
      float gridLine(float s) {
        vec2 c = vXZ / s;
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        float a = max(gridLine(uStep) * 0.4, gridLine(uStep * 5.0));
        a *= uOpacity * (1.0 - smoothstep(uFade * 0.3, uFade, length(vXZ - uCenter)));
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
  });
}

// Composition finale : l'occlusion ambiante assombrit les pièces et, sur le
// sol, épaissit l'alpha (contact sur le fond CSS transparent) ; les silhouettes
// (sauts de profondeur) sont tracées en noir comme sur le dessin ; puis rendu
// de tons et sRGB. Les couleurs de la cible sont prémultipliées.
const COMPOSITE = {
  uniforms: {
    tColor: { value: null },
    tAO: { value: null },
    tDepth: { value: null },
    aoStrength: { value: 1 },
    groundAO: { value: 0.6 },
    edgeStrength: { value: 0.85 },
    edgeColor: { value: new THREE.Color(0x16181b) },
    texel: { value: new THREE.Vector2(1, 1) },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    toneMappingExposure: { value: 1 },
  },
  vertexShader: /* glsl */`
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D tColor;
    uniform sampler2D tAO;
    uniform sampler2D tDepth;
    uniform float aoStrength;
    uniform float groundAO;
    uniform float edgeStrength;
    uniform vec3 edgeColor;
    uniform vec2 texel;
    uniform float cameraNear;
    uniform float cameraFar;
    #include <tonemapping_pars_fragment>
    #include <colorspace_pars_fragment>
    varying vec2 vUv;
    // Inverse de la distance de vue : affine à l'écran sur une face plane.
    float invZ(float d) {
      return (cameraFar - (cameraFar - cameraNear) * d) / (cameraNear * cameraFar);
    }
    float silhouette(float d) {
      float c = invZ(d);
      float l = invZ(texture2D(tDepth, vUv - vec2(texel.x, 0.0)).x);
      float r = invZ(texture2D(tDepth, vUv + vec2(texel.x, 0.0)).x);
      float b = invZ(texture2D(tDepth, vUv - vec2(0.0, texel.y)).x);
      float t = invZ(texture2D(tDepth, vUv + vec2(0.0, texel.y)).x);
      // Seul le pixel du côté le plus proche est noirci (pas de halo sur le fond).
      float e = (max(0.0, 2.0 * c - l - r) + max(0.0, 2.0 * c - b - t)) / c;
      return smoothstep(0.012, 0.05, e);
    }
    void main() {
      vec4 c = texture2D(tColor, vUv);
      float depth = texture2D(tDepth, vUv).x;
      float ao = depth < 1.0 ? mix(1.0, texture2D(tAO, vUv).r, aoStrength) : 1.0;
      vec3 rgb = c.a > 0.0001 ? c.rgb / c.a : vec3(0.0);
      rgb = NeutralToneMapping(rgb * ao);
      if (edgeStrength > 0.0 && depth < 1.0 && c.a > 0.9) {
        rgb = mix(rgb, edgeColor, silhouette(depth) * edgeStrength);
      }
      vec4 o = sRGBTransferOETF(vec4(rgb, 1.0));
      float a = clamp(c.a + (1.0 - c.a) * (1.0 - ao) * groundAO, 0.0, 1.0);
      gl_FragColor = vec4(o.rgb * c.a, a);
    }`,
};

/**
 * Visionneuse 3D hiérarchique.
 *
 * Le modèle est un arbre de groupes : chaque assemblage (et chaque
 * sous-assemblage inséré) possède ses pièces, chacune avec un déplacement
 * éclaté. Chaque groupe s'éclate indépendamment, sur place, jusqu'au plus
 * petit ensemble. Une pièce est désignée par son chemin de repères depuis la
 * racine, ex. ['F14', '1', '4'] = vue générale › mât › tête de rotation › moteur.
 *
 * Rendu « produit » : studio (clé / débouchage / contre-jour + reflets),
 * ombres douces calées sur le modèle, occlusion ambiante (GTAO) avec
 * antialiasing MSAA, contours façon dessin technique. L'image n'est
 * recalculée que lorsque quelque chose change ; la qualité baisse d'elle-même
 * sur petit écran ou machine lente (AO coupée en mouvement, puis résolution).
 */
export class Viewer {
  constructor(container, { onHover, onSelect } = {}) {
    this.container = container;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});
    this.model = null;
    this.nodes = [];
    this.hoverKey = null;
    this.selectedKey = null;
    this.hoverObjs = [];
    this.selectedObjs = [];
    this.isolate = false;
    this.labelsVisible = true;
    this.edgesVisible = false;
    this.labels = [];
    this.tweens = [];
    this.section = { on: false, axis: 'z', pos: 0.5, flip: false, scope: 'all' };
    this._edgeQueue = [];
    this._dirty = true;
    this._shadowDirty = true;
    this._lowFrame = false;
    this._lastCam = new THREE.Matrix4();
    this._lastProj = new THREE.Matrix4();
    this._perf = { last: 0, dts: [] };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = false; // aucune ombre portée dans la 3D
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.quality = this._initialQuality();
    renderer.setPixelRatio(this.quality.dpr);

    const labels = new CSS2DRenderer();
    labels.domElement.className = 'label-layer';
    container.appendChild(labels.domElement);
    this.labelRenderer = labels;

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    scene.environmentIntensity = 0.8; // reflets du studio : rendu photo, sans zones noires
    this.scene = scene;

    // Éclairage studio : ciel / sol, clé (ombre), débouchage, contre-jour lié à la caméra.
    this.hemi = new THREE.HemisphereLight(0xf2f5fa, 0x8d8983, 0.3);
    scene.add(this.hemi);
    const key = new THREE.DirectionalLight(0xfff7ee, 1.55);
    key.castShadow = false;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0003;
    key.shadow.radius = 6;
    key.shadow.blurSamples = 12;
    scene.add(key, key.target);
    this.sun = key;
    const fill = new THREE.DirectionalLight(0xe6eeff, 0.5);
    scene.add(fill, fill.target);
    this.fill = fill;
    const rim = new THREE.DirectionalLight(0xffffff, 0.45);
    scene.add(rim, rim.target);
    this.rim = rim;

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.2 }));
    ground.rotation.x = -Math.PI / 2;
    ground.visible = false; // pas d'ombre au sol
    scene.add(ground);
    this.ground = ground;
    this.grid = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), gridMaterial());
    this.grid.rotation.x = -Math.PI / 2;
    this.grid.renderOrder = -1;
    scene.add(this.grid);

    // Repère visuel du plan de coupe (cadre orange translucide).
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
    this.planeHelper = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.8, depthWrite: false }));
    this.planeHelper.add(edge);
    this.planeHelper.visible = false;
    this.planeHelper.renderOrder = 10;
    scene.add(this.planeHelper);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 500);
    camera.position.set(6, 4, 6);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.95;
    this.controls = controls;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._bindPointer();
    this._watchTheme();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    renderer.setAnimationLoop((time) => this._tick(time));
  }

  // ---------------------------------------------------------------- modèle

  setModel(model) {
    if (this.model) {
      this.scene.remove(this.model.root);
      this._clearLabels();
      this._clearEdges();
      disposeObject(this.model.root);
    }
    this.model = model;
    this.nodes = [];
    model.root.traverse((o) => {
      if (o.userData.isAssembly) {
        o.userData.explodeT = 0;
        o.userData.targetT = 0;
        this.nodes.push(o);
      }
    });
    this.hoverKey = this.selectedKey = null;
    this.hoverObjs = [];
    this.selectedObjs = [];
    this.isolate = false;
    this.section.on = false;
    this.planeHelper.visible = false;
    this.tweens = this.tweens.filter((t) => t.kind === 'camera');
    this.scene.add(model.root);
    this._applyAll();
    this._computeEnvironment();
    this._createLabels();
    this._refreshStates();
    this._queueEdges();
    this.frame({ instant: true });
  }

  get explode() {
    return this.model ? this.model.root.userData.explodeT : 0;
  }

  _applyAll() {
    for (const node of this.nodes) {
      const t = node.userData.explodeT;
      for (const p of node.userData.parts) {
        const k = p.userData.isAssembly ? 1 + SPREAD * p.userData.explodeT : 1;
        p.position.copy(p.userData.basePos).addScaledVector(p.userData.explode, t * k);
      }
    }
    this.invalidate(true);
  }

  /** Demande un nouveau rendu (scene = true : la géométrie a bougé, ombres à refaire). */
  invalidate(scene = false) {
    this._dirty = true;
    if (scene) this._shadowDirty = true;
  }

  /** Exécute fn avec chaque groupe à son état final (fin d'animation). */
  _atTargets(fn, override = null) {
    const keep = this.nodes.map((n) => n.userData.explodeT);
    const shadowDirty = this._shadowDirty; // pose rétablie à l'identique : ombres inchangées
    this.nodes.forEach((n) => { n.userData.explodeT = override ?? n.userData.targetT; });
    this._applyAll();
    this.model.root.updateMatrixWorld(true);
    const out = fn();
    this.nodes.forEach((n, i) => { n.userData.explodeT = keep[i]; });
    this._applyAll();
    this.model.root.updateMatrixWorld(true);
    this._shadowDirty = shadowDirty;
    return out;
  }

  _computeEnvironment() {
    const assembled = this._atTargets(() => this._meshCorners(), 0);
    const full = this._atTargets(() => this._meshCorners(), 1);
    const all = new THREE.Box3().setFromPoints(assembled.concat(full));
    const size = all.getSize(new THREE.Vector3());
    const c = all.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.z, size.y) * 2.2;
    this.ground.position.set(c.x, all.min.y - 0.002, c.z);
    this.ground.scale.set(span, span, 1);
    // Grille : pas adapté à la taille, fondu au-delà du modèle.
    const step = span > 12 ? 1 : span > 4 ? 0.5 : span > 1.2 ? 0.1 : 0.05;
    this.grid.position.set(c.x, all.min.y - 0.001, c.z);
    this.grid.scale.set(span * 1.6, span * 1.6, 1);
    const gu = this.grid.material.uniforms;
    gu.uStep.value = step;
    gu.uFade.value = span * 0.75;
    gu.uCenter.value.set(c.x, c.z);
    const asmBox = new THREE.Box3().setFromPoints(assembled);
    this._modelSize = asmBox.getSize(new THREE.Vector3()).length();
    const vd = this.model.view.dir || [1, 0.65, 1.1];
    const viewAz = THREE.MathUtils.radToDeg(Math.atan2(vd[2], vd[0]));
    this._keyDir = azEl(viewAz + KEY_AZEL[0], KEY_AZEL[1]);
    this._fillDir = azEl(viewAz + FILL_AZEL[0], FILL_AZEL[1]);

    this.camera.near = Math.max(0.005, size.length() / 600);
    this.camera.far = size.length() * 30 + 10;
    this.camera.updateProjectionMatrix();
    this.invalidate(true);
  }

  /**
   * Lumières fixes autour du modèle ; caméra d'ombre ajustée au plus près de
   * la pose actuelle (pièces + leur ombre portée au sol) : ombres fines.
   */
  _fitShadow() {
    if (!this.model) return;
    const box = new THREE.Box3().setFromPoints(this._meshCorners());
    if (box.isEmpty()) return;
    const floorY = this.ground.position.y;
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() * 0.5 + 0.1;
    const key = this._keyDir, fill = this._fillDir;
    this.sun.position.copy(c).addScaledVector(key, r * 3);
    this.sun.target.position.copy(c);
    this.fill.position.copy(c).addScaledVector(fill, r * 3);
    this.fill.target.position.copy(c);
    this.sun.updateMatrixWorld();
    this.sun.target.updateMatrixWorld();
    this.fill.target.updateMatrixWorld();
    const cam = this.sun.shadow.camera;
    cam.position.copy(this.sun.position);
    cam.lookAt(c);
    cam.updateMatrixWorld();
    const toLight = cam.matrixWorld.clone().invert();
    const lb = new THREE.Box3();
    const v = new THREE.Vector3();
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      v.set(x, y, z);
      lb.expandByPoint(v.clone().applyMatrix4(toLight));
      // Projection de ce coin sur le sol le long de la lumière.
      v.addScaledVector(key, -(y - floorY) / key.y);
      lb.expandByPoint(v.applyMatrix4(toLight));
    }
    const m = Math.max(lb.max.x - lb.min.x, lb.max.y - lb.min.y) * 0.04;
    cam.left = lb.min.x - m; cam.right = lb.max.x + m;
    cam.bottom = lb.min.y - m; cam.top = lb.max.y + m;
    cam.near = Math.max(0.01, -lb.max.z - m);
    cam.far = -lb.min.z + m;
    cam.updateProjectionMatrix();
    const texel = Math.max(cam.right - cam.left, cam.top - cam.bottom) / this.sun.shadow.mapSize.x;
    this.sun.shadow.normalBias = texel * 1.5;
  }

  // -------------------------------------------------------------- éclaté

  /** Éclatement du niveau principal (l'assemblage affiché). */
  setExplode(t, { animate = true } = {}) {
    if (!this.model) return;
    this._setNodes([this.model.root], t, animate);
  }

  /** Éclate (t=1) ou rassemble (t=0) un groupe sur place. Rassembler referme aussi ses sous-groupes. */
  setGroupExplode(path, t, { animate = true } = {}) {
    let nodes = this.resolve(path).filter((o) => o.userData.isAssembly);
    if (t === 0) {
      const all = [];
      nodes.forEach((n) => n.traverse((o) => { if (o.userData.isAssembly) all.push(o); }));
      nodes = all;
    }
    this._setNodes(nodes, t, animate);
  }

  /** Éclate ou rassemble tous les niveaux. */
  explodeAll(t, { animate = true } = {}) {
    this._setNodes(this.nodes, t, animate);
  }

  _setNodes(nodes, t, animate) {
    t = Math.min(1, Math.max(0, t));
    const now = performance.now();
    for (const node of nodes) {
      node.userData.targetT = t;
      this.tweens = this.tweens.filter((tw) => tw.node !== node);
      if (!animate) { node.userData.explodeT = t; continue; }
      const from = node.userData.explodeT;
      if (from === t) continue;
      this.tweens.push({ kind: 'explode', node, from, to: t, start: now, dur: 650 + Math.abs(t - from) * 450 });
    }
    if (!animate) { this._applyAll(); this._refreshLabels(); }
  }

  isGroup(path) {
    return this.resolve(path).some((o) => o.userData.isAssembly && o.userData.parts.length);
  }

  isExpanded(path) {
    return this.resolve(path).some((o) => o.userData.isAssembly && o.userData.targetT > 0.5);
  }

  /** Chemins de tous les groupes éclatables sous la racine (repères des pièces). */
  groupPaths() {
    const out = new Map();
    const walk = (node, prefix) => {
      for (const p of node.userData.parts) {
        if (!p.userData.isAssembly || !p.userData.parts.length) continue;
        const path = [...prefix, p.userData.partRef];
        out.set(path.join('>'), path);
        walk(p, path);
      }
    };
    if (this.model) walk(this.model.root, []);
    return [...out.values()];
  }

  /** Objets 3D désignés par un chemin de repères (plusieurs si la pièce est présente plusieurs fois). */
  resolve(path) {
    if (!this.model || !path?.length) return [];
    let nodes = [this.model.root];
    for (const ref of path) {
      const next = [];
      for (const n of nodes) for (const p of n.userData.parts || []) if (p.userData.partRef === String(ref)) next.push(p);
      if (!next.length) return [];
      nodes = next;
    }
    return nodes;
  }

  /** Vrai si la pièce a un intérieur à montrer en coupe (vérin, filtre, groupe…). */
  hasInterior(path) {
    return this.resolve(path).some((o) => {
      if (o.userData.isAssembly) return true;
      let found = false;
      o.traverse((c) => { if (c.userData.hasInterior) found = true; });
      return found;
    });
  }

  // ------------------------------------------------------------- caméra

  /** Cadre tout le modèle (état final des animations) ou une boîte donnée. */
  frame({ instant = false, box = null, dir = null } = {}) {
    if (!this.model) return;
    const viewDir = dir
      ? new THREE.Vector3(...dir).normalize()
      : (box ? this.camera.position.clone().sub(this.controls.target).normalize()
        : new THREE.Vector3(...(this.model.view.dir || [1, 0.65, 1.1])).normalize());
    let points;
    if (box) {
      points = [];
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, y, z));
    } else {
      points = this._atTargets(() => this._meshCorners());
    }
    const c0 = new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
    const up = Math.abs(viewDir.y) > 0.98 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, viewDir).normalize();
    const camUp = new THREE.Vector3().crossVectors(viewDir, right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const tanH = tanV * this.camera.aspect;
    const proj = points.map((p) => { const v = p.clone().sub(c0); return [v.dot(right), v.dot(camUp), v.dot(viewDir)]; });
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    proj.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let dist = 0.1;
    proj.forEach(([x, y, z]) => { dist = Math.max(dist, z + Math.abs(x - cx) / tanH, z + Math.abs(y - cy) / tanV); });
    dist *= box ? 1.35 : 1.06;
    const center = c0.addScaledVector(right, cx).addScaledVector(camUp, cy);
    this._moveCamera(center.clone().addScaledVector(viewDir, dist), center, instant);
  }

  /** Cadre une pièce ou un groupe (à son état final si une animation est en cours). */
  focusPath(path) {
    const objs = this.resolve(path);
    if (!objs.length) return;
    const box = this._atTargets(() => {
      const b = new THREE.Box3();
      objs.forEach((o) => b.expandByObject(o));
      return b;
    });
    this.frame({ box });
  }

  _meshCorners(root = this.model.root) {
    const pts = [];
    const b = new THREE.Box3();
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      if (o.isInstancedMesh) {
        if (!o.boundingBox) o.computeBoundingBox();
        b.copy(o.boundingBox);
      } else {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        b.copy(o.geometry.boundingBox);
      }
      b.applyMatrix4(o.matrixWorld);
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z));
    });
    return pts;
  }

  _moveCamera(pos, target, instant) {
    this.tweens = this.tweens.filter((t) => t.kind !== 'camera');
    if (instant) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      this.invalidate();
      return;
    }
    const p0 = this.camera.position.clone();
    const t0 = this.controls.target.clone();
    this.tweens.push({ kind: 'camera', start: performance.now(), dur: 750, step: (k) => {
      const e = ease(k);
      this.camera.position.lerpVectors(p0, pos, e);
      this.controls.target.lerpVectors(t0, target, e);
    } });
  }

  // ---------------------------------------------------------- sélection

  setHover(path) {
    const key = path?.length ? path.join('>') : null;
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    this.hoverObjs = key ? this.resolve(path) : [];
    this._refreshStates();
  }

  setSelected(path) {
    const key = path?.length ? path.join('>') : null;
    this.selectedKey = key;
    this.selectedObjs = key ? this.resolve(path) : [];
    if (this.section.on && this.section.scope === 'selection') this._updatePlane();
    this._refreshStates();
  }

  setIsolate(on) {
    this.isolate = !!on;
    this._refreshStates();
  }

  _refreshStates() {
    if (!this.model) return;
    const sel = this.selectedObjs;
    const sec = this.section;
    const cutSel = sec.on && sec.scope === 'selection' && sel.length;
    const cutAll = sec.on && !cutSel;
    const ghostOthers = (this.isolate && sel.length) || cutSel;
    applyState(this.model.root, ghostOthers ? 'ghost' : 'base', cutAll);
    for (const o of this.hoverObjs) if (!sel.includes(o)) applyState(o, 'hover', cutAll);
    for (const o of sel) applyState(o, cutSel ? 'base' : 'select', cutAll || cutSel);
    this._refreshLabels();
    // Ombres à refaire si la coupe (clipShadows) ou les pièces estompées changent.
    const sig = `${sec.on ? 1 : 0}:${ghostOthers ? this.selectedKey : ''}`;
    this.invalidate(sec.on || sig !== this._shadowSig);
    this._shadowSig = sig;
  }

  _bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointermove', (e) => {
      if (e.buttons) return;
      const path = this._pick(e);
      const key = path ? path.join('>') : null;
      if (key !== this.hoverKey) {
        this.setHover(path);
        this.onHover(path);
      }
      el.style.cursor = path ? 'pointer' : 'grab';
    });
    el.addEventListener('pointerleave', () => { this.setHover(null); this.onHover(null); });
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      this.onSelect(this._pick(e), { double: false });
    });
    el.addEventListener('dblclick', (e) => {
      const path = this._pick(e);
      if (path) this.onSelect(path, { double: true });
    });
  }

  /** Chemin de la pièce la plus profonde sous le curseur (on descend dans les groupes éclatés). */
  _pick(e) {
    if (!this.model) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const root = this.model.root;
    for (const h of this.raycaster.intersectObject(root, true)) {
      const mesh = h.object;
      if (!mesh.isMesh || mesh.userData.state === 'ghost') continue;
      if (mesh.userData.cut && sectionPlane.distanceToPoint(h.point) < 0) continue;
      const chain = [];
      let o = mesh;
      while (o && o !== root) { chain.push(o); o = o.parent; }
      if (o !== root) continue;
      chain.reverse();
      let node = root;
      const path = [];
      for (const obj of chain) {
        if (obj.parent !== node || !node.userData.parts.includes(obj)) continue;
        path.push(obj.userData.partRef);
        if (obj.userData.isAssembly && obj.userData.explodeT > 0.02) node = obj;
        else break;
      }
      if (path.length) return path;
    }
    return null;
  }

  // ------------------------------------------------------------ coupe

  /**
   * Vue en coupe. axis : 'x' (longueur), 'y' (hauteur), 'z' (largeur) ;
   * pos : position du plan de 0 à 1 dans la boîte de la cible ;
   * scope : 'all' (tout le modèle) ou 'selection' (pièce sélectionnée seulement).
   */
  setSection(opts) {
    Object.assign(this.section, opts);
    this.planeHelper.visible = this.section.on;
    if (this.section.on) this._updatePlane();
    this._refreshStates();
  }

  /** Choisit un plan qui coupe la pièce par son milieu, face tournée vers la caméra. */
  autoSection(path) {
    const objs = this.resolve(path);
    if (!objs.length) return null;
    const box = this._atTargets(() => { const b = new THREE.Box3(); objs.forEach((o) => b.expandByObject(o)); return b; });
    const size = box.getSize(new THREE.Vector3());
    const longest = ['x', 'y', 'z'].reduce((a, k) => (size[k] > size[a] ? k : a), 'x');
    const view = this.camera.position.clone().sub(this.controls.target).normalize();
    const axis = ['x', 'y', 'z'].filter((k) => k !== longest).reduce((a, k) => (Math.abs(view[k]) > Math.abs(view[a]) ? k : a));
    return { axis, pos: 0.5, flip: view[axis] < 0 };
  }

  _sectionBox() {
    const objs = this.section.scope === 'selection' && this.selectedObjs.length ? this.selectedObjs : [this.model.root];
    return this._atTargets(() => { const b = new THREE.Box3(); objs.forEach((o) => b.expandByObject(o)); return b; });
  }

  _updatePlane() {
    if (!this.model) return;
    const { axis, pos, flip } = this.section;
    const box = this._sectionBox();
    const a = AXES[axis];
    const point = box.getCenter(new THREE.Vector3());
    point[axis] = box.min[axis] + (box.max[axis] - box.min[axis]) * pos;
    // On retire la moitié côté +axe (côté caméra par défaut) ; « inverser » garde l'autre.
    const normal = a.clone().multiplyScalar(flip ? 1 : -1);
    sectionPlane.setFromNormalAndCoplanarPoint(normal, point);
    const size = box.getSize(new THREE.Vector3()).multiplyScalar(1.15);
    const h = this.planeHelper;
    h.position.copy(point);
    h.rotation.set(0, 0, 0);
    if (axis === 'x') { h.rotation.y = Math.PI / 2; h.scale.set(size.z, size.y, 1); }
    else if (axis === 'y') { h.rotation.x = -Math.PI / 2; h.scale.set(size.x, size.z, 1); }
    else h.scale.set(size.x, size.y, 1);
    this.invalidate(true);
  }

  // ------------------------------------------------------------ repères

  _createLabels() {
    this.labels = [];
    this.model.root.updateMatrixWorld(true);
    const make = (node, prefix, depth) => {
      const seen = new Set();
      for (const obj of node.userData.parts) {
        const ref = obj.userData.partRef;
        const path = [...prefix, ref];
        if (obj.userData.isAssembly) make(obj, path, depth + 1);
        if (seen.has(ref) || obj.userData.noLabel) continue;
        seen.add(ref);
        const key = path.join('>');
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `balloon lvl-${Math.min(depth, 3)}`;
        el.textContent = ref.length > 3 ? '▸' : ref;
        el.title = ref.length > 3 ? `Groupe ${ref}` : `Repère ${ref}`;
        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => { e.stopPropagation(); this.onSelect(path, { double: false }); });
        el.addEventListener('dblclick', (e) => { e.stopPropagation(); this.onSelect(path, { double: true }); });
        el.addEventListener('mouseenter', () => { this.setHover(path); this.onHover(path); });
        el.addEventListener('mouseleave', () => { this.setHover(null); this.onHover(null); });
        const label = new CSS2DObject(el);
        const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
        obj.worldToLocal(c);
        label.position.copy(c);
        obj.add(label);
        this.labels.push({ key, owner: node, label });
      }
    };
    make(this.model.root, [], 0);
    this._refreshLabels();
  }

  _refreshLabels() {
    const root = this.model?.root;
    const dimOthers = (this.isolate || this.section.scope === 'selection') && this.selectedKey;
    for (const { key, owner, label } of this.labels) {
      label.visible = this.labelsVisible && (owner === root || owner.userData.explodeT > 0.05);
      const el = label.element;
      el.classList.toggle('is-selected', key === this.selectedKey);
      el.classList.toggle('is-hover', key === this.hoverKey);
      el.classList.toggle('is-dim', !!dimOthers && key !== this.selectedKey && !key.startsWith(`${this.selectedKey}>`));
    }
    this._dirty = true;
  }

  _clearLabels() {
    for (const { label } of this.labels) {
      label.element.remove();
      label.parent?.remove(label);
    }
    this.labels = [];
  }

  setLabels(on) {
    this.labelsVisible = !!on;
    this._refreshLabels();
    this.labelRenderer.domElement.style.display = on ? '' : 'none';
  }

  // ------------------------------------------------------------ contours

  /** Affiche ou masque les contours (arêtes vives) façon dessin du manuel. */
  setEdges(on) {
    this.edgesVisible = !!on;
    if (this.model) {
      this.model.root.traverse((o) => { if (o.userData.isEdges) o.visible = this.edgesVisible; });
      if (this.edgesVisible && !this.model.root.userData.edgesQueued) this._queueEdges();
    }
    this.invalidate();
  }

  /** Une ligne par pièce feuille (dans son repère : elle suit l'éclaté), construite par tranches. */
  _queueEdges() {
    this._edgeQueue = [];
    if (!this.model || !this.edgesVisible) return;
    this.model.root.userData.edgesQueued = true;
    const walk = (node) => {
      for (const p of node.userData.parts) {
        if (p.userData.isAssembly) walk(p);
        else this._edgeQueue.push(p);
      }
    };
    walk(this.model.root);
  }

  _edgeStep(budget) {
    const t0 = performance.now();
    while (this._edgeQueue.length && performance.now() - t0 < budget) this._buildEdges(this._edgeQueue.shift());
    if (!this._edgeQueue.length) this._refreshStates();
  }

  _buildEdges(part) {
    if (part.children.some((c) => c.userData.isEdges)) return;
    part.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(part.matrixWorld).invert();
    const m = new THREE.Matrix4(), mi = new THREE.Matrix4(), mm = new THREE.Matrix4();
    const chunks = [];
    let total = 0;
    const push = (src, mat) => {
      const out = new Float32Array(src.length);
      const e = mat.elements;
      for (let i = 0; i < src.length; i += 3) {
        const x = src[i], y = src[i + 1], z = src[i + 2];
        out[i] = e[0] * x + e[4] * y + e[8] * z + e[12];
        out[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
        out[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      }
      chunks.push(out);
      total += out.length;
    };
    part.traverse((o) => {
      if (!o.isMesh || !o.visible || o.userData.noEdges || !o.geometry) return;
      const src = featureEdges(o.geometry);
      if (!src.length) return;
      m.multiplyMatrices(inv, o.matrixWorld);
      if (o.isInstancedMesh) {
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, mi);
          if (Math.abs(mi.determinant()) < 1e-12) continue; // instance masquée (échelle nulle)
          push(src, mm.multiplyMatrices(m, mi));
        }
      } else push(src, m);
    });
    if (!total) return;
    const arr = new Float32Array(total);
    let off = 0;
    for (const c of chunks) { arr.set(c, off); off += c.length; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const lines = new THREE.LineSegments(geo, edgeMaterial());
    lines.userData.isEdges = true;
    lines.raycast = () => {}; // jamais sélectionnables
    lines.visible = this.edgesVisible;
    part.add(lines);
  }

  _clearEdges() {
    this._edgeQueue = [];
    if (!this.model) return;
    const list = [];
    this.model.root.traverse((o) => { if (o.userData.isEdges) list.push(o); });
    for (const o of list) { o.geometry.dispose(); o.parent?.remove(o); }
  }

  // ------------------------------------------------------------ rendu

  _initialQuality() {
    const small = Math.min(window.innerWidth, window.innerHeight) < 560 || window.innerWidth < 760;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    const ext = this.renderer.extensions;
    const floatRT = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float');
    const ao = !small && !(coarse && window.innerWidth < 1100) && floatRT;
    const dpr = window.devicePixelRatio || 1;
    // post : passe composée (silhouettes, AO) ; sinon rendu direct à l'écran.
    return { post: floatRT, ao, motionAO: ao, dpr: Math.min(dpr, floatRT ? 1.5 : 2) };
  }

  /** Cibles de rendu et passes d'AO (créées à la demande). */
  _ensurePost() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const w = Math.max(1, size.x), h = Math.max(1, size.y);
    // AO à résolution réduite (≈ pixels CSS), lissée par le débruitage.
    const k = Math.min(1, 1 / this.quality.dpr) * (w * h > 2.5e6 ? 0.6 : 0.75);
    const aw = Math.max(1, Math.round(w * k)), ah = Math.max(1, Math.round(h * k));
    if (!this.post) {
      const depthTexture = new THREE.DepthTexture(w, h);
      depthTexture.type = THREE.UnsignedIntType;
      const samples = Math.min(4, this.renderer.capabilities.maxSamples || 4);
      const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples, depthTexture });
      const gtao = new GTAOPass(this.scene, this.camera, aw, ah);
      gtao.output = GTAOPass.OUTPUT.Off;
      // Profondeur de la passe couleur (MSAA résolue) : respecte coupe, fantômes, capuchons.
      gtao.setGBuffer(depthTexture);
      gtao.updateGtaoMaterial({ radius: 0.25, distanceExponent: 1.4, thickness: 1, distanceFallOff: 1, scale: 2.0, samples: 16 });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 12 });
      const mat = new THREE.RawShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(COMPOSITE.uniforms),
        vertexShader: COMPOSITE.vertexShader,
        fragmentShader: COMPOSITE.fragmentShader,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NoBlending,
      });
      mat.uniforms.tColor.value = rt.texture;
      mat.uniforms.tDepth.value = depthTexture;
      mat.uniforms.tAO.value = gtao.gtaoMap;
      mat.uniforms.edgeColor.value.setHex(this.theme?.edge ?? 0x16181b);
      this.post = { rt, gtao, quad: new FullScreenQuad(mat), w, h, aw, ah };
    } else if (this.post.w !== w || this.post.h !== h || this.post.aw !== aw) {
      this.post.rt.setSize(w, h);
      this.post.gtao.setSize(aw, ah);
      Object.assign(this.post, { w, h, aw, ah });
    }
    return this.post;
  }

  _render(useAO) {
    const r = this.renderer;
    // Contre-jour : derrière le modèle, bas et décalé sur le côté (son reflet
    // sur les faces horizontales ne revient pas vers l'œil).
    const t = this.controls.target;
    const d = this.camera.position.clone().sub(t);
    const dist = d.length();
    const h = new THREE.Vector3(d.x, 0, d.z);
    if (h.lengthSq() < 1e-8) h.set(0, 0, 1);
    h.normalize();
    const side = new THREE.Vector3(-h.z, 0, h.x);
    this.rim.position.copy(t).addScaledVector(h, -dist).addScaledVector(side, dist * 0.6).addScaledVector(this.camera.up, dist * 0.3);
    this.rim.target.position.copy(t);
    this.rim.target.updateMatrixWorld();
    if (this._shadowDirty) {
      this._fitShadow();
      r.shadowMap.needsUpdate = true;
      this._shadowDirty = false;
    }
    if (this.quality.post) {
      const p = this._ensurePost();
      const u = p.quad.material.uniforms;
      u.toneMappingExposure.value = r.toneMappingExposure;
      u.groundAO.value = 0; // pas d'assombrissement au sol
      u.aoStrength.value = useAO ? 0.4 : 0; // creux fins seulement, jamais d'ombrage
      u.edgeStrength.value = this.edgesVisible ? 0.85 : 0;
      u.cameraNear.value = this.camera.near;
      u.cameraFar.value = this.camera.far;
      u.texel.value.set(1 / p.w, 1 / p.h);
      r.setRenderTarget(p.rt);
      r.render(this.scene, this.camera);
      if (useAO) {
        // AO limitée aux creux fins (quelques cm) : jamais d'effet d'ombre.
        const rad = Math.min(0.05, Math.max(0.012, dist * 0.004));
        p.gtao.updateGtaoMaterial({ radius: rad, thickness: rad * 2 });
        p.gtao.render(r, null, p.rt);
      }
      r.setRenderTarget(null);
      p.quad.render(r);
    } else {
      r.setRenderTarget(null);
      r.render(this.scene, this.camera);
    }
    if (this.labelsVisible) this.labelRenderer.render(this.scene, this.camera);
  }

  /** Dégradation progressive si les images en mouvement sont trop lentes. */
  _measure(now, moving) {
    const pf = this._perf;
    if (!moving) { pf.last = 0; return; }
    if (pf.last) {
      const dt = now - pf.last;
      if (dt < 250) pf.dts.push(dt);
    }
    pf.last = now;
    if (pf.dts.length < 30) return;
    // Médiane : insensible aux à-coups ponctuels (compilation de shaders).
    const med = pf.dts.sort((a, b) => a - b)[pf.dts.length >> 1];
    pf.dts = [];
    const q = this.quality;
    if (med <= 40) return;
    if (q.ao && q.motionAO) q.motionAO = false; // AO seulement sur l'image fixe
    else if (q.dpr > 1) {
      q.dpr = 1;
      this.renderer.setPixelRatio(1);
      this.resize();
    }
  }

  // ------------------------------------------------------------ thème

  _watchTheme() {
    this._applyTheme();
    const again = () => { this._applyTheme(); this.invalidate(); };
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', again);
    this._themeObserver = new MutationObserver(again);
    this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  }

  /** Grille, ombre et contours selon le fond CSS (clair ou sombre). */
  _applyTheme() {
    const css = getComputedStyle(this.container);
    const v = (css.getPropertyValue('--stage-b') || css.getPropertyValue('--bg')).trim();
    let lum = 1;
    if (v) {
      try {
        const c = new THREE.Color().setStyle(v);
        lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      } catch { /* couleur non lisible : thème clair */ }
    }
    const dark = lum < 0.35;
    // Fond sombre ou gris moyen (studio) : grille en traits clairs ; fond clair : traits gris.
    this.theme = lum < 0.06
      ? { dark, grid: 0x9fb0c2, gridOpacity: 0.22, shadow: 0.42, groundAO: 0.85, edge: 0x0b0c0e }
      : dark
        ? { dark, grid: 0xdfe5eb, gridOpacity: 0.3, shadow: 0.3, groundAO: 0.7, edge: 0x111316 }
        : { dark, grid: 0x7f8b98, gridOpacity: 0.42, shadow: 0.2, groundAO: 0.6, edge: 0x16181b };
    this.grid.material.uniforms.uColor.value.setHex(this.theme.grid);
    this.grid.material.uniforms.uOpacity.value = this.theme.gridOpacity;
    this.ground.material.opacity = this.theme.shadow;
    setEdgeColor(this.theme.edge);
    this.post?.quad.material.uniforms.edgeColor.value.setHex(this.theme.edge);
  }

  // ------------------------------------------------------------- divers

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }

  _tick(now) {
    let exploding = false;
    if (this.tweens.length) {
      this.tweens = this.tweens.filter((tw) => {
        const k = Math.min(1, (now - tw.start) / tw.dur);
        if (tw.kind === 'explode') {
          tw.node.userData.explodeT = tw.from + (tw.to - tw.from) * ease(k);
          exploding = true;
        } else tw.step(k);
        return k < 1;
      });
      if (exploding) {
        this._applyAll();
        this._refreshLabels();
        // Le plan suit la pièce coupée une fois l'animation terminée.
        if (this.section.on && !this.tweens.some((tw) => tw.kind === 'explode')) this._updatePlane();
      }
    }
    const camMoved = this.controls.update();
    if (this._edgeQueue.length) this._edgeStep(8);
    this.camera.updateMatrixWorld();
    const camChanged = camMoved || !this._lastCam.equals(this.camera.matrixWorld) || !this._lastProj.equals(this.camera.projectionMatrix);
    const moving = camChanged || exploding || this.tweens.length > 0;
    const still = !moving && this._lowFrame;
    if (!moving && !still && !this._dirty) { this._perf.last = 0; return; }
    const useAO = this.quality.ao && (!moving || this.quality.motionAO);
    this._render(useAO);
    this._lowFrame = this.quality.ao && !useAO;
    this._dirty = false;
    this._lastCam.copy(this.camera.matrixWorld);
    this._lastProj.copy(this.camera.projectionMatrix);
    this._measure(now, moving);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this._themeObserver?.disconnect();
    if (this.model) { this._clearEdges(); disposeObject(this.model.root); }
    if (this.post) { this.post.rt.dispose(); this.post.gtao.dispose(); this.post.quad.dispose(); }
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
