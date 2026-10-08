import * as THREE from 'three';

// Cinématique d'un modèle procédural (simulation, hors site).
//
// Le modèle reste tel que le construit buildProcedural : mêmes objets, même
// hiérarchie (la visionneuse garde sélection, repères et éclaté). Chaque objet
// étiqueté userData.body suit un corps mobile ; le rig calcule à chaque mise à
// jour la transformation de chaque corps (relative au châssis, c'est-à-dire à
// la racine du modèle) et repositionne les objets étiquetés dans leur parent.
//
// Corps : { name, parent, type: 'rev' | 'pri', axis, origin, min, max }, définis
// au repos dans le repère de la racine. Un corps « mixte » [a, b, w] (étiquette
// d'objet ou point de flexible) prend la rotation de a et une position
// interpolée entre a et b (boucle de boyaux entre l'avance et la tête).
//
// Vérins (userData.ram = { id, a, b } sur un hydCylinder placé) : l'œil arrière
// suit le corps a, l'œil de tige le corps b. Le vérin statique est masqué et
// remplacé par un vérin dont le fût et la tige sont dimensionnés sur les
// longueurs extrêmes entre axes (balayage des débattements).
//
// Flexibles (userData.flex) : chaque point de passage suit un corps, le tube est
// reconstruit quand un point bouge.

const _m = new THREE.Matrix4();
const _m2 = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();

export class Rig {
  constructor(root, { bodies, rules = [] }, S) {
    this.root = root;
    this.S = S;
    this.bodies = new Map([['chassis', { name: 'chassis', parent: null, type: 'fixed', value: 0, J: new THREE.Matrix4() }]]);
    for (const b of bodies) {
      this.bodies.set(b.name, {
        ...b,
        axis: new THREE.Vector3(...b.axis).normalize(),
        origin: new THREE.Vector3(...(b.origin || [0, 0, 0])),
        value: b.value ?? 0,
        J: new THREE.Matrix4(),
      });
    }
    for (const b of this.bodies.values()) {
      if (b.parent && !this.bodies.has(b.parent)) throw new Error(`Corps parent inconnu : ${b.parent} (pour ${b.name})`);
    }
    this.order = this._order();
    this._applyRules(rules);
    this._bind();
    this.computeJ();
  }

  // ---------------------------------------------------------------- liaisons

  /** Ordre de calcul : chaque corps après son parent. */
  _order() {
    const out = [];
    const seen = new Set();
    const visit = (b) => {
      if (seen.has(b.name)) return;
      if (b.parent) visit(this.bodies.get(b.parent));
      seen.add(b.name);
      out.push(b);
    };
    this.bodies.forEach(visit);
    return out;
  }

  get(name) { return this.bodies.get(name).value; }

  set(name, value) {
    const b = this.bodies.get(name);
    if (!b) throw new Error(`Corps inconnu : ${name}`);
    const v = b.min !== undefined ? Math.min(b.max, Math.max(b.min, value)) : value;
    if (v !== b.value) { b.value = v; this.dirty = true; }
    return v;
  }

  /** Transformations des corps (repère de la racine) pour les valeurs courantes. */
  computeJ() {
    for (const b of this.order) {
      if (!b.parent) { b.J.identity(); continue; }
      const local = jointMatrix(b, b.value, _m);
      b.J.multiplyMatrices(this.bodies.get(b.parent).J, local);
    }
  }

  /** Matrice d'un corps simple ou mixte [a, b, w]. */
  bodyMatrix(spec, out = new THREE.Matrix4()) {
    if (Array.isArray(spec)) {
      const [a, b, w] = spec;
      const Ja = this.bodies.get(a).J, Jb = this.bodies.get(b).J;
      out.copy(Ja);
      for (const i of [12, 13, 14]) out.elements[i] = Ja.elements[i] * (1 - w) + Jb.elements[i] * w;
      return out;
    }
    const b = this.bodies.get(spec);
    if (!b) throw new Error(`Corps inconnu : ${spec}`);
    return out.copy(b.J);
  }

  bodyNames(spec) { return Array.isArray(spec) ? spec.slice(0, 2) : [spec]; }

  // ---------------------------------------------------------------- liaison au modèle

  /** Étiquettes posées par chemin de repères (pièces d'un sous-assemblage réutilisé). */
  _applyRules(rules) {
    for (const { path, body } of rules) {
      let nodes = [this.root];
      for (const ref of path) {
        nodes = nodes.flatMap((n) => (n.userData.parts || []).filter((p) => p.userData.partRef === String(ref)));
      }
      if (!nodes.length) throw new Error(`Chemin introuvable : ${path.join(' > ')}`);
      nodes.forEach((n) => { n.userData.body = body; });
    }
  }

  /** Matrice d'un objet dans le repère de la racine (d'après les transformations locales courantes). */
  rootMatrix(obj, out = new THREE.Matrix4()) {
    out.identity();
    for (let o = obj; o && o !== this.root; o = o.parent) {
      o.updateMatrix();
      out.premultiply(o.matrix);
    }
    return out;
  }

  _bind() {
    this.objects = [];
    this.rams = [];
    this.flexes = [];
    const depth = (o) => { let d = 0; for (let p = o; p && p !== this.root; p = p.parent) d++; return d; };
    this.root.traverse((o) => {
      if (o === this.root) return;
      const u = o.userData;
      if (u.body !== undefined) {
        this.bodyNames(u.body).forEach((n) => { if (!this.bodies.has(n)) throw new Error(`Corps inconnu : ${n}`); });
        this.objects.push({ obj: o, body: u.body, rest: this.rootMatrix(o), depth: depth(o) });
      }
      if (u.ram) this.rams.push(this._bindRam(o));
      if (u.flex) this.flexes.push(this._bindFlex(o));
    });
    this.objects.sort((a, b) => a.depth - b.depth);
  }

  _bindRam(obj) {
    let core = null;
    obj.traverse((c) => { if (!core && c.userData.cylinder) core = c; });
    if (!core) throw new Error(`Vérin ${obj.userData.ram.id} : hydCylinder introuvable`);
    const { rear, pin, bore, rodR } = core.userData.cylinder;
    const coreRest = this.rootMatrix(core);
    const A = new THREE.Vector3(rear, 0, 0).applyMatrix4(coreRest);
    const B = new THREE.Vector3(pin, 0, 0).applyMatrix4(coreRest);
    const q = new THREE.Quaternion();
    coreRest.decompose(_v, q, _s);
    return { ...obj.userData.ram, obj, A, B, L0: A.distanceTo(B), dir: B.clone().sub(A).normalize(), q, bore, rodR, L: A.distanceTo(B) };
  }

  _bindFlex(mesh) {
    const f = mesh.userData.flex;
    if (f.points.length !== f.bodies.length) throw new Error('Flexible : un corps par point de passage');
    f.bodies.forEach((spec) => this.bodyNames(spec).forEach((n) => { if (!this.bodies.has(n)) throw new Error(`Corps inconnu : ${n}`); }));
    const rest = this.rootMatrix(mesh);
    return { mesh, ...f, rest: f.points.map((p) => new THREE.Vector3(...p).applyMatrix4(rest)), last: null };
  }

  // ---------------------------------------------------------------- mise à jour

  /** Positions des vérins (axes A et B courants, longueur entre axes). */
  ramState(r) {
    const A = r.A.clone().applyMatrix4(this.bodyMatrix(r.a, _m));
    const B = r.B.clone().applyMatrix4(this.bodyMatrix(r.b, _m));
    return { A, B, L: A.distanceTo(B) };
  }

  /** Repositionne objets, vérins et flexibles pour les valeurs courantes. */
  apply() {
    this.computeJ();
    for (const e of this.objects) {
      const target = this.bodyMatrix(e.body, _m).multiply(e.rest);
      const parent = this.rootMatrix(e.obj.parent, _m2).invert();
      parent.multiply(target).decompose(e.obj.position, e.obj.quaternion, e.obj.scale);
    }
    for (const r of this.rams) this._applyRam(r);
    for (const f of this.flexes) this._applyFlex(f);
    this.dirty = false;
  }

  _applyRam(r) {
    const { A, B, L } = this.ramState(r);
    r.L = L;
    if (!r.visual) return;
    const qa = new THREE.Quaternion();
    this.bodyMatrix(r.a, _m).decompose(_v, qa, _s);
    const q = qa.clone().multiply(r.q); // orientation de repos entraînée par le corps a
    const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const dir = B.clone().sub(A).normalize();
    q.premultiply(_q.setFromUnitVectors(axis, dir)); // puis alignée sur les axes courants
    const parent = this.rootMatrix(r.visual.parent, _m2).invert();
    _m.compose(A, q, _s.set(1, 1, 1));
    parent.multiply(_m).decompose(r.visual.position, r.visual.quaternion, r.visual.scale);
    r.rod.position.x = L;
  }

  _applyFlex(f) {
    const pts = f.rest.map((p, i) => {
      const spec = f.bodies[i];
      if (Array.isArray(spec)) {
        const [a, b, w] = spec;
        const pa = p.clone().applyMatrix4(this.bodies.get(a).J);
        const pb = p.clone().applyMatrix4(this.bodies.get(b).J);
        return pa.lerp(pb, w);
      }
      return p.clone().applyMatrix4(this.bodies.get(spec).J);
    });
    const key = pts.map((p) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`).join(';');
    if (key === f.last) return;
    f.last = key;
    const inv = this.rootMatrix(f.mesh, _m2).invert();
    const local = pts.map((p) => p.applyMatrix4(inv).toArray());
    const fresh = this.S.tube(local, f.r, f.material, f.opts);
    if (f.built) f.mesh.geometry.dispose();
    f.mesh.geometry = fresh.geometry;
    f.built = true;
  }

  // ---------------------------------------------------------------- vérins

  /** Corps (avec liaison) entre un corps et la racine. */
  chain(name) {
    const out = [];
    for (let b = this.bodies.get(name); b && b.parent; b = this.bodies.get(b.parent)) out.push(b);
    return out;
  }

  /**
   * Longueurs extrêmes entre axes de chaque vérin sur les débattements des
   * liaisons qui le séparent de l'autre corps (balayage, valeurs remises ensuite).
   */
  sweepRams(steps = 24) {
    const keep = new Map([...this.bodies.values()].map((b) => [b.name, b.value]));
    for (const r of this.rams) {
      const ca = this.bodyNames(r.a).flatMap((n) => this.chain(n));
      const cb = this.bodyNames(r.b).flatMap((n) => this.chain(n));
      const joints = [...new Set([...ca, ...cb])].filter((j) => (ca.includes(j) !== cb.includes(j)) && j.min !== undefined);
      let Lmin = Infinity, Lmax = -Infinity;
      const grid = (i) => {
        if (i === joints.length) {
          this.computeJ();
          const { L } = this.ramState(r);
          Lmin = Math.min(Lmin, L); Lmax = Math.max(Lmax, L);
          return;
        }
        const j = joints[i];
        const n = joints.length > 2 ? 6 : steps;
        for (let k = 0; k <= n; k++) { j.value = j.min + ((j.max - j.min) * k) / n; grid(i + 1); }
        j.value = keep.get(j.name);
      };
      grid(0);
      Object.assign(r, { Lmin, Lmax, joints: joints.map((j) => j.name) });
    }
    keep.forEach((v, n) => { this.bodies.get(n).value = v; });
    this.computeJ();
    return this.rams;
  }

  /**
   * Dimensionne fût et tige de chaque vérin pour sa course (Lmax - Lmin) :
   * piston jamais hors du fût, œil de tige jamais contre le fût. Retourne
   * le jeu restant (négatif : vérin impossible à loger entre ses axes).
   */
  static ramGeometry({ Lmin, Lmax, bore, rodR }) {
    const r = bore / 2, e0 = 0.9 * r, e1 = 1.4 * rodR, margin = 0.01;
    const barrel = Lmax - Lmin + 2 * r + margin;
    const rod = Lmin - e0 - r - margin / 2;
    return { r, e0, e1, barrel, rod, slack: Lmin - e1 - (e0 + barrel) };
  }

  /** Remplace les vérins statiques par des vérins dimensionnés (après sweepRams). */
  buildRams(material = 'black') {
    const { shell, cyl, ring, at, group } = this.S;
    for (const r of this.rams) {
      const g = Rig.ramGeometry(r);
      const visual = group(
        at(shell(g.r, g.r * 0.8, g.barrel, material, { axis: 'x' }), [g.e0 + g.barrel / 2, 0, 0]),
        at(cyl(g.r * 1.12, g.r * 0.5, material, { axis: 'x' }), [g.e0 + g.r * 0.25, 0, 0]),
        at(ring(g.r * 1.12, r.rodR * 1.05, g.r * 0.5, material, { axis: 'x' }), [g.e0 + g.barrel - g.r * 0.25, 0, 0]),
        at(ring(g.r * 0.75, g.r * 0.32, g.r * 0.7, material, { axis: 'z' }), [0, 0, 0]),
      );
      const rod = group(
        at(cyl(r.rodR, g.rod, 'chrome', { axis: 'x' }), [-g.rod / 2, 0, 0]),
        at(cyl(g.r * 0.79, g.r * 0.5, 'darkSteel', { axis: 'x' }), [-g.rod, 0, 0]),
        at(ring(r.rodR * 1.5, r.rodR * 0.6, r.rodR * 1.3, 'darkSteel', { axis: 'z' }), [0, 0, 0]),
      );
      visual.add(rod);
      visual.userData.simRam = r.id;
      r.obj.visible = false;
      this.root.add(visual);
      Object.assign(r, { visual, rod, geo: g });
    }
    this.dirty = true;
  }
}

function jointMatrix(b, q, out) {
  if (b.type === 'rev') {
    const o = b.origin;
    out.makeTranslation(o.x, o.y, o.z);
    out.multiply(new THREE.Matrix4().makeRotationAxis(b.axis, q));
    out.multiply(new THREE.Matrix4().makeTranslation(-o.x, -o.y, -o.z));
    return out;
  }
  if (b.type === 'pri') return out.makeTranslation(b.axis.x * q, b.axis.y * q, b.axis.z * q);
  return out.identity();
}
