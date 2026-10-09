// Circuit hydraulique (simulation, hors site) : pompes à détection de charge (LS),
// distributeurs proportionnels à compensation de pression, vérins et moteurs.
//
// Chaque fonction est une section de distributeur : son tiroir donne un débit
// maximal (L/min) ; l'ouverture commandée s ∈ [-1, 1] fixe le débit demandé
// (compensation de pression : indépendant de la charge tant que la pompe suit).
// La pompe débite à la pression de la charge la plus forte plus une marge, au plus
// à sa pression maximale ; au-delà, l'actionneur cale (pression maximale, débit
// nul). Si les débits demandés dépassent la cylindrée × régime, ou la puissance du
// moteur d'entraînement, toutes les sections de la pompe ralentissent dans la même
// proportion (partage de débit).
//
// Vitesse d'une liaison : débit / (section × g), où g = variation de longueur du
// vérin par unité de la liaison (m/m, m/rad), mesurée sur la géométrie du rig ; un
// moteur a une cylindrée par unité de la liaison (m³/rad, m³/m) et g = 1.
// Charge : force généralisée qui s'oppose au mouvement (gravité par travail virtuel
// sur les masses des corps et des objets portés, plus les efforts extérieurs).
import * as THREE from 'three';

export const LPM = 1 / 60000; // L/min → m³/s
export const BAR = 1e5;
export const PSI = 6894.757;
export const IN = 0.0254;
const G = 9.81;
const EFF = 0.88; // rendement global pompe (puissance hydraulique / puissance à l'arbre)
const DELTA = 1e-4; // pas des dérivées numériques (m ou rad)

const disc = (d) => (Math.PI / 4) * d * d;

/** Sections utiles d'un actionneur : sortie de tige (ext) et rentrée (ret), en m² (ou m³/unité pour un moteur). */
export function actuatorAreas(act) {
  if (act.type === 'mot') return { ext: act.disp, ret: act.disp };
  const n = act.n || 1;
  const cap = disc(act.bore), rod = disc(act.bore) - disc(act.rod);
  if (act.crossed) return { ext: cap + rod, ret: cap + rod }; // paire de vérins montés en opposition (direction)
  if (act.ported) return { ext: n * rod, ret: n * rod }; // vérin à tiges creuses : même section dans les deux sens
  return { ext: n * cap, ret: n * rod };
}

export class Hydraulics {
  /**
   * def : { drivers, pumps, functions, masses } (voir du311-std.js).
   * Le rig doit être au repos : les centres des masses des corps sont pris sur les
   * boîtes des objets étiquetés à ce moment.
   */
  constructor(def, rig) {
    this.def = def;
    this.rig = rig;
    this.drivers = new Map(def.drivers.map((d) => [d.id, { ...d, on: d.on ?? true, P: 0 }]));
    this.pumps = new Map(def.pumps.map((p) => [p.id, { ...p, p: 0, Q: 0, sat: 1 }]));
    this.functions = new Map(def.functions.map((f) => [f.id, { ...f, areas: actuatorAreas(f.act) }]));
    this.state = new Map(); // dernier résultat par fonction
    this.masses = this._centroids(def.masses || {});
    this.idle();
  }

  /** Centre de masse de chaque corps lesté (repère de la racine, au repos). */
  _centroids(masses) {
    const boxes = new Map();
    this.rig.root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(this.rig.root.matrixWorld).invert();
    for (const o of this.rig.objects) {
      const name = Array.isArray(o.body) ? o.body[0] : o.body;
      if (!masses[name]) continue;
      const b = boxes.get(name) || new THREE.Box3();
      b.expandByObject(o.obj);
      boxes.set(name, b);
    }
    return [...boxes].map(([body, box]) => ({ body, m: masses[body], c: box.getCenter(new THREE.Vector3()).applyMatrix4(inv) }));
  }

  /** Énergie potentielle (J) des masses des corps et des masses portées (extra : [{ body, m, c }]). */
  _energy(extra) {
    let E = 0;
    for (const list of [this.masses, extra]) {
      for (const { body, m, c } of list) {
        const e = this.rig.bodies.get(body).J.elements;
        E += m * G * (e[1] * c.x + e[5] * c.y + e[9] * c.z + e[13]);
      }
    }
    return E;
  }

  /**
   * Rapport g (longueur de vérin par unité de liaison) et dérivée de l'énergie
   * potentielle par rapport à la liaison de f, mesurés en déplaçant la liaison de ±DELTA.
   */
  _probe(f, extra) {
    const rig = this.rig;
    if (!f.body) return { g: f.act.g ?? 1, dE: 0 };
    const q0 = rig.get(f.body);
    const ram = f.act.ram ? rig.rams.find((r) => r.id === f.act.ram) : null;
    const wantE = f.gravity !== false;
    if (!ram && !wantE) return { g: f.act.g ?? 1, dE: 0 };
    const at = (q) => {
      const v = rig.set(f.body, q);
      rig.computeJ();
      return { v, L: ram ? rig.ramState(ram).L : 0, E: wantE ? this._energy(extra) : 0 };
    };
    const a = at(q0 - DELTA), b = at(q0 + DELTA);
    rig.set(f.body, q0);
    rig.computeJ();
    const dq = b.v - a.v;
    if (Math.abs(dq) < 1e-9) return { g: f.act.g ?? 1, dE: 0 };
    return { g: ram ? (b.L - a.L) / dq : (f.act.g ?? 1), dE: (b.E - a.E) / dq };
  }

  /** Vitesse de la liaison de f à pleine ouverture (sans partage de débit), dans le sens dir. */
  fullSpeed(fid, dir = 1, extra = []) {
    const f = this.functions.get(fid);
    const { g } = this._probe({ ...f, gravity: false }, extra);
    const A = dir * g >= 0 ? f.areas.ext : f.areas.ret;
    return Math.abs(g) < 1e-6 ? 0 : (f.spool * LPM) / (A * Math.abs(g));
  }

  /** Aucun mouvement : pompes en attente (pression de veille), débits nuls. */
  idle() {
    this.state.clear();
    for (const p of this.pumps.values()) {
      const on = this.drivers.get(p.driver).on;
      Object.assign(p, { p: on ? p.standby : 0, Q: 0, sat: 1 });
    }
    for (const d of this.drivers.values()) d.P = 0;
  }

  /**
   * Résout le circuit pour une liste de demandes :
   *   { fn, s }        ouverture du tiroir (-1 à 1) ;
   *   { fn, v }        vitesse imposée de la liaison (forage, vissage, rotation) ;
   *   ext              effort extérieur qui s'oppose au sens commandé (N ou N·m sur la liaison) ;
   *   blocked          actionneur en appui (contact au sol) : il cale à la pression maximale.
   * extra : masses portées [{ body, m, c }] (tiges, marteau).
   * Retourne une Map fn → { qdot, Q (L/min), p (bar), hold (bar), stall, why }.
   */
  solve(demands, extra = []) {
    this.idle();
    const rows = [];
    for (const d of demands) {
      const f = this.functions.get(d.fn);
      if (!f) throw new Error(`Fonction hydraulique inconnue : ${d.fn}`);
      const pump = this.pumps.get(f.pump);
      const cmd = d.s ?? d.v ?? 0;
      const dir = Math.sign(cmd);
      const row = { d, f, pump, dir, qdot: 0, Q: 0, p: 0, hold: 0, stall: false, why: '' };
      rows.push(row);
      if (!dir) continue;
      if (!this.drivers.get(pump.driver).on) { row.why = 'off'; continue; }
      const { g, dE } = this._probe(f, extra);
      const ag = Math.abs(g);
      if (ag < 1e-6) { row.why = 'singular'; continue; }
      const A = dir * g >= 0 ? f.areas.ext : f.areas.ret;
      const Aother = dir * g >= 0 ? f.areas.ret : f.areas.ext;
      // effort résistant sur la liaison : gravité dans le sens commandé + effort extérieur
      const resist = dir * dE + (d.ext || 0);
      row.p = (f.pFric || 8) + Math.max(0, resist) / (A * ag) / BAR;
      row.hold = Math.max(0, -resist) / (Aother * ag) / BAR; // côté retenue (valve d'équilibrage)
      if (d.blocked || row.p > pump.pMax) { row.stall = true; row.p = pump.pMax; row.why = d.blocked ? 'contact' : 'relief'; continue; }
      const Qmax = f.spool * LPM;
      row.Qd = d.v !== undefined ? Math.min(Qmax, Math.abs(d.v) * A * ag) : Math.min(1, Math.abs(d.s)) * Qmax;
      row.k = 1 / (A * ag); // vitesse de la liaison par m³/s
    }
    // pression de chaque pompe : charge la plus forte + marge (détection de charge)
    for (const p of this.pumps.values()) {
      const mine = rows.filter((r) => r.pump === p && r.dir && r.why !== 'off' && r.why !== 'singular');
      if (!mine.length) continue;
      p.p = Math.min(p.pMax, Math.max(...mine.map((r) => r.p)) + p.margin);
      const Qd = mine.reduce((s, r) => s + (r.Qd || 0), 0);
      const cap = p.cc * 1e-6 * (this.drivers.get(p.driver).rpm / 60);
      p.sat = Qd > cap ? cap / Qd : 1;
      p.Q = Math.min(Qd, cap);
    }
    // limite de puissance du moteur d'entraînement : les pompes réduisent leur débit
    for (const drv of this.drivers.values()) {
      const mine = [...this.pumps.values()].filter((p) => p.driver === drv.id);
      const P = mine.reduce((s, p) => s + (p.p * BAR * p.Q) / EFF, 0);
      const k = P > drv.kW * 1000 ? (drv.kW * 1000) / P : 1;
      if (k < 1) mine.forEach((p) => { p.sat *= k; p.Q *= k; });
      drv.P = Math.min(P, drv.kW * 1000);
    }
    const out = new Map();
    for (const r of rows) {
      if (r.Qd) {
        const Q = r.Qd * r.pump.sat;
        r.Q = Q / LPM;
        r.qdot = r.dir * Q * r.k;
      }
      const res = { qdot: r.qdot, Q: r.Q, p: r.dir ? r.p : 0, hold: r.hold, stall: r.stall, why: r.why, dir: r.dir, s: r.d.s ?? (r.Qd ? (r.Qd / (r.f.spool * LPM)) * r.dir : 0) };
      out.set(r.f.id, res);
      this.state.set(r.f.id, res);
    }
    return out;
  }
}
