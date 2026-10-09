// Cycle de forage du DU311 (simulation, hors site) : 17 tiges Ø 3,5 po x 6 pi dans
// le carrousel, marteau fond-de-trou et taillant, train de tiges, trou dans le sol.
//
// Chaque tige suit un corps du rig : le carrousel (dans son alvéole), les bras de
// serrage (tenue par les mâchoires), la broche de la tête de rotation (vissée) ou
// l'avance (tenue par la plaque à coins ou le centreur). Le cycle est une suite
// d'étapes (mouvements, vissage, forage, prise et dépose), dans un ordre sûr par
// construction. Les mouvements passent par le circuit hydraulique (plant.js) :
// vitesses selon les débits, pressions selon les charges (poids du train porté
// par la tête, poussée sur l'outil, couple de vissage et de forage).
//
// Hauteurs dans le repère de l'avance (pied du mât à y = 0) :
//   - tige au carrousel : pointe du filet sur la rampe, épaulement à SHOULDER ;
//   - haut du train tenu par la plaque à coins : JOINT ;
//   - épaulement du raccord d'usure de la tête : SAVER + course ;
//   - marteau rangé dans le centreur : bas du taillant à HAMMER_STOW.
import * as THREE from 'three';
import { FEED } from '../models/du311-std/feed.js';
import { feedToMachine as fm } from '../models/du311-std/machine.js';
import { carouselAngle, CLAMP_STROKE, HAMMER_STOW } from './du311-std.js';

const IN = 0.0254;
export const PIPE = { L: 72 * IN, pin: 0.06, r: 1.75 * IN, box: 0.0525, boxL: 0.12 };
export const HAMMER = { L: 1.1, r: 0.05, bit: 0.06, bitL: 0.1 };
const C = FEED.car;
const N = 17;
const STORE = C.y0 + 0.0375; // dessus de la rampe : pointe du filet d'une tige au carrousel
const SHOULDER = STORE + PIPE.pin;
const JOINT = 0.3;
const SAVER = FEED.tdY - 0.37;
const feedAt = (h) => h - SAVER; // course qui met l'épaulement du raccord d'usure à la hauteur h
export const ROP = 0.6 / 60; // pénétration (m/s), ordre de grandeur d'un marteau fond-de-trou
const RPM = { drill: 50, thread: 30 };
const THREAD = 0.03; // m/s : avance de la tête pendant le vissage
// Ordres de grandeur (estimés) : masse d'une tige de 6 pi, du marteau et de son
// taillant ; poussée sur l'outil ; couples de forage, de serrage et de desserrage.
export const PIPE_MASS = 30;
export const HAMMER_MASS = 48;
export const BIT_LOAD = 8000; // N
const TORQUE = { drill: 600, perMetre: 60, run: 300, makeUp: 2000, breakOut: 2500 }; // N·m
const STEP = (2 * Math.PI) / N;
// Trou : la scène n'a pas de sol opaque, la paroi se voit à travers le sol (terre
// translucide) ; déblais autour de l'orifice.
const SOIL = new THREE.MeshStandardMaterial({ color: 0x6b5434, roughness: 1, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
const CUTTINGS = new THREE.MeshStandardMaterial({ color: 0x8c8170, roughness: 1 });
const COLLAR_GAP = 0.5; // hauteur maximale du taillant au-dessus du sol pour enfoncer le marteau

/** Tige : corps, manchon (haut), filet conique (bas), bande peinte (montre la rotation). */
function pipeMesh(S) {
  const { L, pin, r, box, boxL } = PIPE;
  return S.group(
    S.at(S.cyl(r, L - boxL, 'charcoal', { seg: 20 }), [0, (L - boxL) / 2, 0]),
    S.at(S.cyl(box, boxL, 'steel', { seg: 20 }), [0, L - boxL / 2, 0]),
    S.at(S.cyl(r * 0.6, pin, 'steel', { r2: r * 0.85, seg: 16 }), [0, -pin / 2, 0]),
    S.at(S.box(0.01, L * 0.7, 0.004, 'safety'), [0, L * 0.45, r + 0.001]),
  );
}

/** Marteau fond-de-trou et taillant à boutons (repère : bas du taillant à y = 0). */
function hammerMesh(S) {
  const { L, r, bit, bitL } = HAMMER;
  return S.group(
    S.at(S.cyl(r, L - bitL - PIPE.boxL, 'darkSteel', { seg: 24 }), [0, bitL + (L - bitL - PIPE.boxL) / 2, 0]),
    S.at(S.cyl(PIPE.box, PIPE.boxL, 'steel', { seg: 20 }), [0, L - PIPE.boxL / 2, 0]),
    S.at(S.cyl(bit, bitL, 'steel', { seg: 24 }), [0, bitL / 2, 0]),
    ...Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return S.at(S.cyl(0.008, 0.012, 'darkSteel', { seg: 8 }), [Math.cos(a) * bit * 0.65, -0.004, Math.sin(a) * bit * 0.65]);
    }),
    S.at(S.box(0.01, 0.5, 0.004, 'safety'), [0, L * 0.5, r + 0.001]),
  );
}

export function createDrilling({ rig, root, scene, S, setAir, plant }) {
  const pipes = [];
  const _m = new THREE.Matrix4();
  let carried = null; // masses portées (cache, refait quand une tige change de support)
  // Change le support d'une tige : position réelle d'abord (d'après l'ancien support, aux
  // valeurs courantes), puis lien au nouveau corps.
  const holder = (p, body) => {
    rig.computeJ();
    if (p.rel) p.mesh.matrix.multiplyMatrices(rig.bodyMatrix(p.body, _m), p.rel);
    p.body = body;
    p.rel = rig.bodyMatrix(body, _m).clone().invert().multiply(p.mesh.matrix);
    carried = null;
  };
  /** Masses des tiges et du marteau, centre dans le repère de repos de leur support. */
  const masses = () => {
    carried ||= pipes.map((p) => ({
      body: p.body,
      m: p.kind === 'hammer' ? HAMMER_MASS : PIPE_MASS,
      c: new THREE.Vector3(0, (p.kind === 'hammer' ? HAMMER.L : PIPE.L) / 2, 0).applyMatrix4(p.rel),
    }));
    return carried;
  };
  plant.setCarried(masses);
  const placeAt = (p, body, feedLocal) => {
    // tige verticale dans le repère de l'avance, base (épaulement ou bas du taillant) à feedLocal
    rig.computeJ();
    const local = new THREE.Matrix4().makeTranslation(...fm(feedLocal));
    p.mesh.matrix.copy(rig.bodyMatrix(body === 'carousel' ? 'ext' : body, _m)).multiply(local);
    p.mesh.matrix.decompose(p.mesh.position, p.mesh.quaternion, p.mesh.scale);
    p.rel = null;
    holder(p, body);
  };

  // ---------------------------------------------------------------- tiges et marteau
  // alvéole k, carrousel tourné de beta (une rotation autour de +Y ajoute beta à l'angle)
  const pocketXZ = (k, beta = 0) => {
    const a = FEED.pocketA0 + k * STEP + beta;
    return [C.x + C.rp * Math.cos(a), C.z - C.rp * Math.sin(a)];
  };
  const pockets = new Array(N).fill(null);
  for (let k = 0; k < N; k++) {
    const mesh = pipeMesh(S);
    mesh.name = `tige ${k + 1}`;
    root.add(mesh);
    const p = { mesh, kind: 'pipe', id: k + 1, pocket: k };
    pipes.push(p);
    pockets[k] = p;
  }
  const hammer = { mesh: hammerMesh(S), kind: 'hammer', id: 0 };
  hammer.mesh.name = 'marteau fond-de-trou';
  root.add(hammer.mesh);
  pipes.push(hammer);

  const state = {
    steps: [], log: [], running: false, paused: false,
    started: false, // marteau enfoncé : des tiges sont engagées dans le trou
    string: [], // train de tiges, du marteau vers le haut
    rpm: 0, depth: 0, hole: null, holes: [], t0: HAMMER_STOW, time: 0, wait: '',
  };

  /** Hauteur (repère de l'avance) où l'axe de forage coupe le sol, pour la pose courante. */
  function groundOnAxis() {
    rig.computeJ();
    root.updateMatrixWorld(true);
    const J = rig.bodyMatrix('ext', _m).clone().premultiply(root.matrixWorld);
    const a = new THREE.Vector3(...fm([0, 0, FEED.AX])).applyMatrix4(J);
    const b = new THREE.Vector3(...fm([0, 1, FEED.AX])).applyMatrix4(J);
    const dy = b.y - a.y;
    return Math.abs(dy) < 1e-6 ? null : -a.y / dy;
  }

  function reset() {
    state.steps = []; state.running = false; state.paused = false; state.started = false;
    state.string = []; state.rpm = 0; state.depth = 0; state.plan = null; state.time = 0;
    // chaque tige dans son alvéole, carrousel dans sa position courante
    const beta = rig.get('carousel');
    for (let k = 0; k < N; k++) {
      const p = pipes[k];
      p.pocket = k; pockets[k] = p;
      const [x, z] = pocketXZ(k, beta);
      placeAt(p, 'carousel', [x, SHOULDER, z]);
    }
    placeAt(hammer, 'ext', [0, HAMMER_STOW, FEED.AX]);
    state.holes.forEach((h) => scene.remove(h.group));
    state.holes = []; state.hole = null;
    place();
  }

  /** Repositionne chaque tige d'après le corps qui la tient (après rig.apply). */
  function place() {
    rig.computeJ();
    for (const p of pipes) {
      p.mesh.matrix.multiplyMatrices(rig.bodyMatrix(p.body, _m), p.rel);
      p.mesh.matrix.decompose(p.mesh.position, p.mesh.quaternion, p.mesh.scale);
    }
    updateHole();
  }

  // ---------------------------------------------------------------- trou
  function updateHole() {
    if (!state.hole) return;
    root.updateMatrixWorld(true);
    const bit = new THREE.Vector3().applyMatrix4(new THREE.Matrix4().multiplyMatrices(root.matrixWorld, hammer.mesh.matrix));
    const { collar, down } = state.hole;
    const d = Math.max(0, bit.clone().sub(collar).dot(down));
    const h = state.hole;
    h.depth = state.depth = Math.max(state.depth, d);
    const len = Math.max(0.001, state.depth);
    h.tube.scale.set(1, len, 1);
    h.tube.position.copy(collar).addScaledVector(down, len / 2);
    h.pile.scale.set(1 + state.depth * 0.25, 1 + state.depth * 0.6, 1 + state.depth * 0.25);
  }

  function openHole() {
    root.updateMatrixWorld(true);
    const J = new THREE.Matrix4().multiplyMatrices(root.matrixWorld, rig.bodyMatrix('ext', _m));
    const a = new THREE.Vector3(...fm([0, 0, FEED.AX])).applyMatrix4(J);
    const b = new THREE.Vector3(...fm([0, 1, FEED.AX])).applyMatrix4(J);
    const down = a.clone().sub(b).normalize();
    const t = -a.y / (b.y - a.y);
    const collar = a.clone().lerp(b, t);
    const tube = S.cyl(HAMMER.bit + 0.004, 1, SOIL, { seg: 24, open: true });
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), down);
    tube.traverse((o) => { o.castShadow = false; });
    const pile = S.at(S.cyl(0.05, 0.03, CUTTINGS, { r2: 0.16, seg: 24 }), [collar.x, 0.015, collar.z]);
    const ring = S.at(S.ring(0.1, HAMMER.bit + 0.004, 0.004, 'rubber', { seg: 32 }), [collar.x, 0.002, collar.z]);
    const group = S.group(tube, pile, ring);
    group.name = `trou ${state.holes.length + 1}`;
    scene.add(group);
    state.hole = { group, tube, pile, collar, down, depth: 0 };
    state.holes.push(state.hole);
    state.depth = 0;
  }

  // ---------------------------------------------------------------- étapes
  const v = (b) => rig.get(b);
  const RAD = (2 * Math.PI) / 60; // tr/min → rad/s
  const near = (b, t) => Math.abs(v(b) - t) < 1e-6;
  // Résout le circuit pour les demandes de l'étape et déplace les corps ; la broche
  // tourne à la vitesse obtenue. Retourne les résultats par fonction.
  const drive = (demands, dt) => {
    const res = plant.solve(demands);
    state.wait = [...res.values()].some((r) => r.why === 'off') ? 'off' : '';
    for (const d of demands.filter(Boolean)) {
      const r = res.get(d.fn);
      const f = plant.hyd.functions.get(d.fn);
      if (d.fn === 'spin') rig.set('spin', v('spin') + r.qdot * dt);
      else rig.set(f.body, plant.step(f.body, r.qdot, dt, d.target));
    }
    state.rpm = res.has('spin') ? res.get('spin').qdot / RAD : 0;
    return res;
  };
  // Mouvements vers des consignes ([fonction, consigne, ouverture maximale]).
  const move = (label, moves) => ({
    label,
    tick: (dt) => {
      drive(moves.map(([fn, t, full]) => plant.toward(fn, t, full)), dt);
      return moves.every(([fn, t]) => near(plant.hyd.functions.get(fn).body, t));
    },
  });
  const act = (label, fn) => ({ label, tick: () => { fn(); return true; } });
  // Vissage (dir = 1) ou dévissage (dir = -1) : la tête suit le filet, couple qui monte
  // jusqu'au serrage (ou part du desserrage puis retombe).
  const screw = (label, target, dir) => {
    let from = 0;
    return {
      label,
      enter: () => { from = v('feed'); },
      tick: (dt) => {
        const k = 1 - Math.min(1, Math.abs(target - v('feed')) / Math.max(1e-6, Math.abs(target - from)));
        const T = TORQUE.run + (dir > 0 ? TORQUE.makeUp * k ** 4 : TORQUE.breakOut * (1 - k) ** 6);
        drive([
          near('feed', target) ? null : { fn: 'feed', v: Math.sign(target - v('feed')) * THREAD, target },
          { fn: 'spin', v: dir * RPM.thread * RAD, ext: T },
        ], dt);
        return near('feed', target);
      },
    };
  };
  // Forage : rotation, air, poussée sur l'outil ; la tête descend à la vitesse de pénétration.
  const drill = (label, target) => ({
    label,
    tick: (dt) => {
      setAir(true);
      drive([
        near('feed', target) ? null : { fn: 'feed', v: -ROP, ext: BIT_LOAD, target },
        { fn: 'spin', v: RPM.drill * RAD, ext: TORQUE.drill + TORQUE.perMetre * state.depth },
      ], dt);
      return near('feed', target);
    },
  });
  const index = (label, k) => {
    let to = 0;
    return {
      label,
      enter: () => {
        const cur = v('carousel');
        let d = carouselAngle(k) - cur;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        to = cur + d;
      },
      tick: (dt) => move(label, [['carousel', to]]).tick(dt),
    };
  };
  const arms = (label, to) => move(label, [['clamp', to]]);
  const topDrive = (label, to) => move(label, [['feed', to]]);
  const slip = (label, open) => move(label, [['slip', open ? rig.bodies.get('slip').max : 0]]);
  const attachAll = (list, body) => list.forEach((p) => holder(p, body));
  const atTransfer = () => {
    const k = Math.round(-v('carousel') / STEP);
    return ((k % N) + N) % N;
  };
  const nextPocket = (full) => {
    const k0 = atTransfer();
    for (let i = 0; i < N; i++) {
      const k = (k0 + i) % N;
      if (!!pockets[k] === full) return k;
    }
    return -1;
  };

  // Enfoncer le marteau : la tête le visse dans le centreur, le descend au sol et fore
  // jusqu'à ce que son manchon soit à la plaque à coins, qui se referme ; la tête se
  // dévisse et remonte.
  function collarSteps() {
    const top = HAMMER_STOW + HAMMER.L;
    return [
      act('Air de forage : surpresseur en marche', () => setAir(true)),
      slip('Ouverture de la plaque à coins', true),
      arms("Bras de serrage écartés de l'axe", CLAMP_STROKE),
      topDrive('Descente de la tête sur le marteau', feedAt(top + PIPE.pin)),
      screw('Vissage de la tête sur le marteau', feedAt(top), 1),
      act('Marteau lié à la broche', () => { attachAll([hammer], 'spin'); state.string = [hammer]; state.started = true; }),
      move('Descente du taillant au sol', [['feed', feedAt(state.t0 + HAMMER.L), 0.2]]),
      act('Taillant au sol : début du trou', openHole),
      drill('Forage : enfoncement du marteau', feedAt(JOINT)),
      slip('Fermeture de la plaque à coins sur le marteau', false),
      act('Marteau tenu par la plaque à coins', () => attachAll(state.string, 'ext')),
      screw('Dévissage de la tête', feedAt(JOINT + PIPE.pin), -1),
      topDrive('Remontée de la tête', 0),
      arms("Bras de serrage ramenés sur l'axe", 0),
    ];
  }

  // Ajouter une tige : indexage, prise au carrousel, présentation sur l'axe, vissage en
  // haut, dégagement des bras, vissage sur le train, forage, reprise par la plaque à coins.
  function addSteps() {
    const k = nextPocket(true);
    if (k < 0) return null;
    const p = pockets[k];
    const box = SHOULDER + PIPE.L;
    return [
      index(`Indexage du carrousel : alvéole ${k + 1} au transfert`, k),
      arms('Bras de serrage vers le carrousel', CLAMP_STROKE),
      act(`Mâchoires fermées sur la tige ${p.id}`, () => { holder(p, 'clamp'); pockets[k] = null; p.pocket = null; }),
      arms("Tige présentée sur l'axe de forage", 0),
      topDrive('Descente de la tête sur la tige', feedAt(box + PIPE.pin)),
      screw('Vissage de la tête sur la tige', feedAt(box), 1),
      act('Mâchoires ouvertes, tige vissée à la broche', () => holder(p, 'spin')),
      arms("Bras de serrage dégagés de l'axe", CLAMP_STROKE),
      topDrive('Descente de la tige sur le train', feedAt(JOINT + PIPE.pin + PIPE.L)),
      screw('Vissage de la tige sur le train', feedAt(JOINT + PIPE.L), 1),
      act('Train lié à la broche', () => { state.string.push(p); attachAll(state.string, 'spin'); }),
      slip('Ouverture de la plaque à coins', true),
      drill(`Forage de la tige ${p.id}`, feedAt(JOINT)),
      slip('Fermeture de la plaque à coins', false),
      act('Train tenu par la plaque à coins', () => attachAll(state.string, 'ext')),
      screw('Dévissage de la tête', feedAt(JOINT + PIPE.pin), -1),
      topDrive('Remontée de la tête', 0),
      arms("Bras de serrage ramenés sur l'axe", 0),
    ];
  }

  // Retirer une tige : la tête reprend le train, le remonte d'une tige, la plaque à coins
  // le reprend ; dévissage en bas puis en haut, la tige retourne au carrousel.
  function pullSteps() {
    if (state.string.length < 2) return null;
    const k = nextPocket(false);
    if (k < 0) return null;
    const p = state.string[state.string.length - 1];
    return [
      index(`Indexage du carrousel : alvéole vide ${k + 1} au transfert`, k),
      arms("Bras de serrage écartés de l'axe", CLAMP_STROKE),
      topDrive('Descente de la tête sur le train', feedAt(JOINT + PIPE.pin)),
      screw('Vissage de la tête sur le train', feedAt(JOINT), 1),
      act('Train lié à la broche', () => attachAll(state.string, 'spin')),
      slip('Ouverture de la plaque à coins', true),
      topDrive("Remontée du train d'une tige", feedAt(JOINT + PIPE.L)),
      slip('Fermeture de la plaque à coins', false),
      act('Train tenu par la plaque à coins', () => attachAll(state.string.slice(0, -1), 'ext')),
      arms("Bras de serrage sur l'axe", 0),
      screw(`Dévissage de la tige ${p.id} du train`, feedAt(SHOULDER + PIPE.L), -1),
      act(`Mâchoires fermées sur la tige ${p.id}`, () => { state.string.pop(); holder(p, 'clamp'); }),
      screw('Dévissage de la tête', feedAt(SHOULDER + PIPE.L + PIPE.pin), -1),
      topDrive('Remontée de la tête', 0),
      arms('Tige ramenée au carrousel', CLAMP_STROKE),
      act(`Tige ${p.id} déposée dans l'alvéole ${k + 1}`, () => { holder(p, 'carousel'); pockets[k] = p; p.pocket = k; }),
      arms("Bras de serrage ramenés sur l'axe", 0),
    ];
  }

  // Remonter le marteau : la tête le reprend et le ramène au-dessus du sol, dans le centreur.
  function liftSteps() {
    if (state.string.length !== 1) return null;
    return [
      arms("Bras de serrage écartés de l'axe", CLAMP_STROKE),
      topDrive('Descente de la tête sur le marteau', feedAt(JOINT + PIPE.pin)),
      screw('Vissage de la tête sur le marteau', feedAt(JOINT), 1),
      act('Marteau lié à la broche', () => attachAll(state.string, 'spin')),
      slip('Ouverture de la plaque à coins', true),
      topDrive('Remontée du marteau dans le centreur', feedAt(HAMMER_STOW + HAMMER.L)),
      act('Marteau rangé dans le centreur, trou terminé', () => {
        attachAll(state.string, 'ext'); state.string = []; state.started = false; state.hole = null;
      }),
      screw('Dévissage de la tête', feedAt(HAMMER_STOW + HAMMER.L + PIPE.pin), -1),
      topDrive('Remontée de la tête', 0),
      arms("Bras de serrage ramenés sur l'axe", 0),
      slip('Fermeture de la plaque à coins', false),
      act('Air de forage coupé', () => setAir(false)),
    ];
  }

  // ---------------------------------------------------------------- programmes
  /** Lance un programme : 'collar', 'add' (n tiges), 'pull' (toutes), 'lift'. Retourne un message d'erreur ou ''. */
  function start(kind, n = 1) {
    if (state.steps.length) return 'Un cycle est déjà en cours.';
    if (kind === 'collar') {
      if (state.started) return 'Le marteau est déjà enfoncé.';
      const t = groundOnAxis();
      if (t === null || t > HAMMER_STOW + 1e-3) return "L'axe de forage ne descend pas vers le sol : mettre l'avance en position de forage.";
      if (t < HAMMER_STOW - COLLAR_GAP) return `Avance trop haute : le taillant est à ${(HAMMER_STOW - t).toFixed(2)} m du sol (au plus ${COLLAR_GAP} m). Descendre l'avance (extension) avant d'enfoncer le marteau.`;
      state.t0 = t;
      queue(collarSteps());
    } else if (kind === 'add') {
      if (!state.started) return "Enfoncer d'abord le marteau.";
      if (nextPocket(true) < 0) return 'Plus de tige au carrousel.';
      state.plan = { kind, left: n };
      queue(addSteps());
    } else if (kind === 'pull') {
      if (!state.started) return 'Aucune tige dans le trou.';
      state.plan = { kind: 'pull', left: Infinity };
      queue(state.string.length > 1 ? pullSteps() : liftSteps());
    } else if (kind === 'lift') {
      if (state.string.length !== 1) return 'Retirer d’abord les tiges.';
      queue(liftSteps());
    }
    return '';
  }

  function queue(steps) {
    state.steps = steps || [];
    state.running = state.steps.length > 0;
    state.entered = false;
  }

  /** Avance le cycle de dt secondes. Retourne vrai si quelque chose a bougé. */
  function update(dt) {
    let moved = false;
    if (state.running && !state.paused) {
      let budget = dt;
      while (budget > 0 && state.steps.length) {
        const s = state.steps[0];
        if (!state.entered) { s.enter?.(); state.entered = true; }
        const slice = Math.min(budget, 1 / 30);
        budget -= slice;
        state.time += slice;
        moved = true;
        state.rpm = 0;
        if (s.tick(slice)) {
          state.log.push(s.label);
          if (state.log.length > 40) state.log.shift();
          state.steps.shift();
          state.entered = false;
        }
        if (!state.steps.length) next();
      }
    }
    return moved;
  }

  // Enchaîne la tige suivante d'un programme (n tiges à forer, ou toutes à remonter).
  function next() {
    const plan = state.plan;
    state.running = false;
    state.rpm = 0;
    if (!plan) return;
    if (plan.kind === 'add') {
      plan.left -= 1;
      if (plan.left > 0 && nextPocket(true) >= 0) queue(addSteps());
      else state.plan = null;
    } else if (plan.kind === 'pull') {
      if (state.string.length > 1) queue(pullSteps());
      else if (state.string.length === 1) { queue(liftSteps()); state.plan = null; }
      else state.plan = null;
    }
  }

  /** Course la plus basse de la tête en commande manuelle : butée sur le marteau rangé. */
  const feedFloor = () => (hammer.body === 'ext' && !state.started ? feedAt(HAMMER_STOW + HAMMER.L + PIPE.pin) : -Infinity);

  /** Vrai quand le train ou une tige est engagé : commandes manuelles du forage bloquées. */
  const engaged = () => state.started || state.running || pipes.some((p) => p.body === 'clamp' || p.body === 'spin');

  reset();
  return {
    state, pipes, pockets, hammer, start, update, place, reset, engaged, feedFloor, groundOnAxis, masses,
    pause: (on) => { state.paused = on; },
    current: () => state.steps[0]?.label || '',
    inCarousel: () => pockets.filter(Boolean).length,
    inHole: () => state.string.filter((p) => p.kind === 'pipe').length,
    geometry: { STORE, SHOULDER, JOINT, SAVER, feedAt, COLLAR_GAP },
  };
}
