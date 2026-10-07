import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { applyState } from './materials.js';
import { disposeObject } from './assembly.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Visionneuse 3D : affichage d'un assemblage, vue éclatée animée,
 * sélection de pièces au survol / clic, bulles de repères, isolement.
 */
export class Viewer {
  constructor(container, { onHover, onSelect } = {}) {
    this.container = container;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});
    this.model = null;
    this.explode = 0;
    this.hoverRef = null;
    this.selectedRef = null;
    this.isolate = false;
    this.labelsVisible = true;
    this.tweens = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const labels = new CSS2DRenderer();
    labels.domElement.className = 'label-layer';
    container.appendChild(labels.domElement);
    this.labelRenderer = labels;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    this.scene = scene;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 0.6);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    this.sun = sun;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    this.ground = ground;
    this.grid = null;

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
      disposeObject(this.model.root);
    }
    this.model = model;
    this.hoverRef = null;
    this.selectedRef = null;
    this.isolate = false;
    this.tweens = this.tweens.filter((t) => t.kind !== 'explode');
    this.scene.add(model.root);
    this._applyExplode(this.explode);
    this._computeBounds();
    this._createLabels();
    this._refreshStates();
    this.frame({ instant: true });
  }

  _computeBounds() {
    const { root, parts } = this.model;
    const keep = this.explode;
    this._applyExplode(0);
    const assembled = new THREE.Box3().setFromObject(root);
    const ptsAssembled = this._meshCorners();
    this._applyExplode(1);
    const exploded = new THREE.Box3().setFromObject(root);
    const ptsExploded = this._meshCorners();
    this._applyExplode(keep);
    this.bounds = {
      assembled, exploded, all: assembled.clone().union(exploded),
      ptsAssembled, ptsAll: ptsAssembled.concat(ptsExploded),
    };
    const all = this.bounds.all;
    const size = all.getSize(new THREE.Vector3());
    const c = all.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.z, size.y) * 2.2;

    this.ground.position.set(c.x, all.min.y - 0.002, c.z);
    this.ground.scale.set(span, span, 1);
    if (this.grid) { this.scene.remove(this.grid); this.grid.geometry.dispose(); }
    const step = span > 12 ? 1 : span > 4 ? 0.5 : 0.1;
    const div = Math.round(span / step);
    this.grid = new THREE.GridHelper(div * step, div, 0x9aa6b2, 0xc4ccd4);
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.35;
    this.grid.position.set(c.x, all.min.y - 0.001, c.z);
    this.scene.add(this.grid);

    const r = size.length() * 0.75 + 0.5;
    const cam = this.sun.shadow.camera;
    cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r;
    cam.near = 0.1; cam.far = r * 6;
    cam.updateProjectionMatrix();
    this.sun.position.set(c.x + r * 0.9, c.y + r * 2, c.z + r * 0.7);
    this.sun.target.position.copy(c);
    this.camera.near = Math.max(0.005, size.length() / 500);
    this.camera.far = size.length() * 30 + 10;
    this.camera.updateProjectionMatrix();
    this._partCount = parts.length;
  }

  // -------------------------------------------------------------- éclaté

  setExplode(t, { animate = true } = {}) {
    t = Math.min(1, Math.max(0, t));
    this.tweens = this.tweens.filter((tw) => tw.kind !== 'explode');
    if (!animate) {
      this._applyExplode(t);
      return;
    }
    const from = this.explode;
    this.tweens.push({ kind: 'explode', start: performance.now(), dur: 650 + Math.abs(t - from) * 500,
      step: (k) => this._applyExplode(from + (t - from) * ease(k)) });
  }

  _applyExplode(t) {
    this.explode = t;
    if (!this.model) return;
    for (const p of this.model.parts) {
      p.position.copy(p.userData.basePos).addScaledVector(p.userData.explode, t);
    }
  }

  // ------------------------------------------------------------- caméra

  /** Cadre l'assemblage (ou une boîte donnée) dans la vue. */
  frame({ instant = false, box = null, dir = null, exploded = null } = {}) {
    if (!this.model) return;
    const useAll = exploded ?? this.explode > 0.3;
    const target = box || (useAll ? this.bounds.all : this.bounds.assembled);
    const viewDir = dir
      ? new THREE.Vector3(...dir).normalize()
      : (box ? this.camera.position.clone().sub(this.controls.target).normalize()
        : new THREE.Vector3(...(this.model.view.dir || [1, 0.65, 1.1])).normalize());
    // Points à cadrer : coins des boîtes de chaque maillage (plus serré qu'une
    // seule boîte englobante), ou les 8 coins de la boîte demandée.
    let points;
    if (box) {
      points = [];
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, y, z));
    } else {
      points = useAll ? this.bounds.ptsAll : this.bounds.ptsAssembled;
    }
    const c0 = target.getCenter(new THREE.Vector3());
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
    dist *= box ? 2.6 : 1.06;
    const center = c0.addScaledVector(right, cx).addScaledVector(camUp, cy);
    const pos = center.clone().addScaledVector(viewDir, dist);
    this._moveCamera(pos, center, instant);
  }

  _meshCorners() {
    const pts = [];
    const b = new THREE.Box3();
    this.model.root.updateMatrixWorld(true);
    this.model.root.traverse((o) => {
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

  focusRef(ref) {
    const objs = this.model?.refs.get(String(ref));
    if (!objs) return;
    const box = new THREE.Box3();
    objs.forEach((o) => box.expandByObject(o));
    this.frame({ box });
  }

  setView(name) {
    const dirs = { iso: null, front: [1, 0.08, 0], side: [0, 0.08, 1], top: [0.001, 1, 0.0005], back: [-1, 0.25, -0.6] };
    this.frame({ dir: dirs[name] || null });
  }

  // ---------------------------------------------------------- sélection

  setHover(ref) {
    ref = ref == null ? null : String(ref);
    if (ref === this.hoverRef) return;
    this.hoverRef = ref;
    this._refreshStates();
  }

  setSelected(ref) {
    this.selectedRef = ref == null ? null : String(ref);
    this._refreshStates();
  }

  setIsolate(on) {
    this.isolate = !!on;
    this._refreshStates();
  }

  hasRef(ref) {
    return !!this.model?.refs.has(String(ref));
  }

  _refreshStates() {
    if (!this.model) return;
    for (const p of this.model.parts) {
      const r = p.userData.partRef;
      let state = 'base';
      if (r === this.selectedRef) state = 'select';
      else if (r === this.hoverRef) state = 'hover';
      else if (this.isolate && this.selectedRef) state = 'ghost';
      applyState(p, state);
      p.userData.ghost = state === 'ghost';
    }
    for (const [ref, label] of this.labels || []) {
      const el = label.element;
      el.classList.toggle('is-selected', ref === this.selectedRef);
      el.classList.toggle('is-hover', ref === this.hoverRef);
      el.classList.toggle('is-dim', this.isolate && this.selectedRef && ref !== this.selectedRef);
    }
  }

  _bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointermove', (e) => {
      if (e.buttons) return;
      const ref = this._pick(e);
      if (ref !== this.hoverRef) {
        this.setHover(ref);
        this.onHover(ref);
      }
      el.style.cursor = ref ? 'pointer' : 'grab';
    });
    el.addEventListener('pointerleave', () => { this.setHover(null); this.onHover(null); });
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const ref = this._pick(e);
      this.onSelect(ref, { double: false });
    });
    el.addEventListener('dblclick', (e) => {
      const ref = this._pick(e);
      if (ref) this.onSelect(ref, { double: true });
    });
  }

  _pick(e) {
    if (!this.model) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.model.root, true);
    for (const h of hits) {
      let o = h.object;
      while (o && o.parent !== this.model.root) o = o.parent;
      if (o && !o.userData.ghost) return o.userData.partRef;
    }
    return null;
  }

  // ------------------------------------------------------------ repères

  _createLabels() {
    this.labels = new Map();
    for (const [ref, objs] of this.model.refs) {
      const obj = objs.find((o) => !o.userData.noLabel);
      if (!obj) continue;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'balloon';
      el.textContent = ref.length > 3 ? '→' : ref;
      el.title = ref.length > 3 ? `Sous-assemblage ${ref}` : `Repère ${ref}`;
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => { e.stopPropagation(); this.onSelect(ref, { double: false }); });
      el.addEventListener('mouseenter', () => { this.setHover(ref); this.onHover(ref); });
      el.addEventListener('mouseleave', () => { this.setHover(null); this.onHover(null); });
      const label = new CSS2DObject(el);
      // Ancre au centre de la boîte englobante de la pièce (repère local).
      const keep = obj.position.clone();
      obj.position.copy(obj.userData.basePos);
      obj.updateMatrixWorld(true);
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      obj.worldToLocal(c);
      obj.position.copy(keep);
      label.position.copy(c);
      label.visible = this.labelsVisible;
      obj.add(label);
      this.labels.set(ref, label);
    }
  }

  _clearLabels() {
    for (const [, label] of this.labels || []) {
      label.element.remove();
      label.parent?.remove(label);
    }
    this.labels = new Map();
  }

  setLabels(on) {
    this.labelsVisible = !!on;
    for (const [, l] of this.labels || []) l.visible = this.labelsVisible;
    this.labelRenderer.domElement.style.display = on ? '' : 'none';
  }

  // ------------------------------------------------------------- divers

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  _tick(now) {
    if (this.tweens.length) {
      this.tweens = this.tweens.filter((tw) => {
        const k = Math.min(1, (now - tw.start) / tw.dur);
        tw.step(k);
        return k < 1;
      });
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    if (this.labelsVisible) this.labelRenderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    if (this.model) disposeObject(this.model.root);
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
