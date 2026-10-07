import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { applyState, sectionPlane } from './materials.js';
import { disposeObject } from './assembly.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
// Un sous-groupe éclaté prend plus de place : on l'écarte d'autant de son parent.
const SPREAD = 0.9;

/**
 * Visionneuse 3D hiérarchique.
 *
 * Le modèle est un arbre de groupes : chaque assemblage (et chaque
 * sous-assemblage inséré) possède ses pièces, chacune avec un déplacement
 * éclaté. Chaque groupe s'éclate indépendamment, sur place, jusqu'au plus
 * petit ensemble. Une pièce est désignée par son chemin de repères depuis la
 * racine, ex. ['F14', '1', '4'] = vue générale › mât › tête de rotation › moteur.
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
    this.labels = [];
    this.tweens = [];
    this.section = { on: false, axis: 'z', pos: 0.5, flip: false, scope: 'all' };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
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

    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    this.sun = sun;

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    this.ground = ground;
    this.grid = null;

    // Repère visuel du plan de coupe (cadre orange translucide).
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
    this.planeHelper = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.8 }));
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
  }

  /** Exécute fn avec chaque groupe à son état final (fin d'animation). */
  _atTargets(fn, override = null) {
    const keep = this.nodes.map((n) => n.userData.explodeT);
    this.nodes.forEach((n) => { n.userData.explodeT = override ?? n.userData.targetT; });
    this._applyAll();
    this.model.root.updateMatrixWorld(true);
    const out = fn();
    this.nodes.forEach((n, i) => { n.userData.explodeT = keep[i]; });
    this._applyAll();
    this.model.root.updateMatrixWorld(true);
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
    if (this.grid) { this.scene.remove(this.grid); this.grid.geometry.dispose(); }
    const step = span > 12 ? 1 : span > 4 ? 0.5 : 0.1;
    const div = Math.round(span / step);
    this.grid = new THREE.GridHelper(div * step, div, 0x9aa6b2, 0xc4ccd4);
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.35;
    this.grid.position.set(c.x, all.min.y - 0.001, c.z);
    this.scene.add(this.grid);
    const r = size.length() * 0.6 + 0.5;
    const cam = this.sun.shadow.camera;
    cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r;
    cam.near = 0.1; cam.far = r * 6;
    cam.updateProjectionMatrix();
    this.sun.position.set(c.x + r * 0.9, c.y + r * 2, c.z + r * 0.7);
    this.sun.target.position.copy(c);
    this.camera.near = Math.max(0.005, size.length() / 600);
    this.camera.far = size.length() * 30 + 10;
    this.camera.updateProjectionMatrix();
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
      if (mesh.userData.state === 'ghost') continue;
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

  // ------------------------------------------------------------- divers

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick(now) {
    if (this.tweens.length) {
      let exploding = false;
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
