// Machine pilotée par son circuit hydraulique (simulation, hors site) : relie le
// circuit (hydraulics.js), le rig et les commandes.
//   - toward() : ouverture du tiroir pour rejoindre une consigne (tiroir
//     proportionnel : ralentit à l'approche ; tout-ou-rien : pleine ouverture) ;
//   - solve() : ajoute les efforts extérieurs propres à la machine (stabilisateurs
//     en appui, résistance au roulement) et les masses portées (tiges, marteau) ;
//   - step() : déplace un corps de qdot·dt sans dépasser sa consigne.
import { Hydraulics } from './hydraulics.js';
import { HYDRAULICS, MACHINE_MASS, SUPPORT, ROLLING } from './du311-std.js';

const G = 9.81;
const TAU = 0.3; // s : à pleine vitesse, distance de ralentissement = vitesse × TAU
const S_MIN = 0.04; // ouverture minimale (le tiroir proportionnel finit sa course)

export function createPlant(rig) {
  const hyd = new Hydraulics(HYDRAULICS, rig);
  let carried = () => [];

  /** Demande d'ouverture vers une consigne (null si elle est atteinte). full : ouverture maximale. */
  function toward(fn, target, full = 1) {
    const f = hyd.functions.get(fn);
    const d = target - rig.get(f.body);
    if (Math.abs(d) < 1e-7) return null;
    const dir = Math.sign(d);
    if (!f.prop) return { fn, s: dir, target };
    const v1 = hyd.fullSpeed(fn, dir, carried());
    const s = v1 > 0 ? Math.max(S_MIN, Math.min(full, Math.abs(d) / (v1 * TAU))) : full;
    return { fn, s: dir * s, target };
  }

  /** Efforts extérieurs propres à la machine, dans le sens commandé. */
  function external(d) {
    const f = hyd.functions.get(d.fn);
    const dir = Math.sign(d.s ?? d.v ?? 0);
    if (f.support) {
      // un stabilisateur qui descend porte sa part de la machine dans ses derniers millimètres
      return dir < 0 && rig.get(f.body) <= SUPPORT.contact ? SUPPORT.share[f.id] * MACHINE_MASS * G : 0;
    }
    if (f.id === 'drive') return ROLLING * MACHINE_MASS * G;
    return 0;
  }

  function solve(demands) {
    const list = demands.filter(Boolean).map((d) => ({ ...d, ext: (d.ext || 0) + external(d) }));
    return hyd.solve(list, carried());
  }

  /** Nouvelle valeur d'un corps après dt à la vitesse qdot, sans dépasser target. */
  function step(body, qdot, dt, target) {
    const cur = rig.get(body);
    let nv = cur + qdot * dt;
    if (target !== undefined && (target - cur) * (target - nv) <= 0) nv = target;
    return nv;
  }

  return { hyd, toward, solve, step, setCarried: (fn) => { carried = fn; }, carried: () => carried() };
}
