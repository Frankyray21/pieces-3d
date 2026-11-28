// Train de forage ITH des foreuses Cubex (PRO-OP-ITH-001, 004 et 016) : tiges, marteaux, bits, driver subs,
// saver subs, anneaux de retenue, casse-bits et chariot à marteau. La géométrie est dans forme.js (elle sert
// aussi à l'export pour Unreal Engine) ; ici, les matériaux usés du site et les vues par famille.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';
import {
  TIGE, MARTEAUX, BITS, CASSE_BITS, SAVER_SUBS,
  tige, marteau, driverSub, saverSub, anneaux, bit, bitAvecChuck, casseBit, chariot, cotesMarteau, placer, rot,
} from './forme.js';

// ------------------------------------------------------------------ matériaux

/**
 * Finitions par zone. Pièces de chantier qui ont servi : peinture partie aux arêtes et sur les bouts,
 * rayée par les mâchoires, acier nu piqué de rouille, filets graissés, poussière de roche sombre.
 */
const ZONES = {
  'peinture-jaune': () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0xc49a2c, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5 }), 'paint', { tint: 0.22, rough: 0.3, rust: 0.07, rs: 78, wear: 0.55 }),
  'peinture-noire': () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0x1f2022, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.45 }), 'paintDark', { tint: 0.12, rough: 0.28, rust: 0.06, rs: 78, wear: 0.5 }),
  acier: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x8d8880, metalness: 0.9, roughness: 0.45 }), 'machined', { rust: 0.08, rs: 110 }),
  filet: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x57493a, metalness: 0.75, roughness: 0.32 }), 'machined', { rust: 0.08, rs: 104 }),
  interieur: () => new THREE.MeshStandardMaterial({ color: 0x232120, metalness: 0.4, roughness: 0.85 }),
  // Fourreau et raccord de tête : acier nu beige-brun taché de boue claire (vidéos de chantier).
  fourreau: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x86725a, metalness: 0.7, roughness: 0.55 }), 'cast', { rust: 0.1, rs: 57 }),
  tete: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x73624c, metalness: 0.7, roughness: 0.55 }), 'cast', { rust: 0.15, rs: 62 }),
  bleu: () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0x24508f, roughness: 0.5, clearcoat: 0.3 }), 'paint', { tint: 0.15, rust: 0.05, rs: 67, wear: 0.5 }),
  // Bit usé : brun rouille clair, poussière de roche grise.
  bit: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x7a6650, metalness: 0.6, roughness: 0.62 }), 'cast', { rust: 0.3, rs: 67 }),
  queue: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x7c766e, metalness: 0.85, roughness: 0.42 }), 'machined', { rust: 0.14, rs: 88 }),
  carbure: () => new THREE.MeshStandardMaterial({ color: 0x8c8e90, metalness: 0.65, roughness: 0.28 }),
  plastique: () => withFinish(new THREE.MeshStandardMaterial({ color: 0xe6e2d6, roughness: 0.6 }), 'plastic'),
  anneau: () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0xd9b01c, roughness: 0.5, clearcoat: 0.3 }), 'paint', { tint: 0.2, rust: 0.07, rs: 104, wear: 0.6 }),
  casse: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x6a4b35, metalness: 0.6, roughness: 0.7 }), 'cast', { rust: 0.33, rs: 46 }),
  rouge: () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0xb3161b, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.25 }), 'paint', { tint: 0.14, rust: 0.07, rs: 57, wear: 0.4 }),
  'acier-chariot': () => withFinish(new THREE.MeshStandardMaterial({ color: 0x9a9893, metalness: 0.85, roughness: 0.45 }), 'machined', { rust: 0.17, rs: 78 }),
  gaine: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x9c9c96, roughness: 0.8 }), 'rubber'),
  pneu: () => withFinish(new THREE.MeshStandardMaterial({ color: 0x1c1c1d, roughness: 0.85 }), 'rubber'),
  chaine: () => withFinish(new THREE.MeshPhysicalMaterial({ color: 0xb51a1c, roughness: 0.45, clearcoat: 0.4 }), 'paint', { tint: 0.12, rust: 0.1, rs: 104, wear: 0.5 }),
};
const cache = new Map();
function matiere(zone) {
  if (!cache.has(zone)) {
    const m = (ZONES[zone] || ZONES.acier)();
    m.name = `train-ith-${zone}`;
    cache.set(zone, m);
  }
  return cache.get(zone);
}

/** Surfaces de forme.js → groupe three.js (un maillage par zone). */
export function objet(surfaces) {
  const g = new THREE.Group();
  for (const s of surfaces) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(s.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(s.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(s.uv, 2));
    geo.setAttribute('aWear', new THREE.Float32BufferAttribute(s.wear, 1));
    geo.setIndex(s.idx);
    const m = new THREE.Mesh(geo, matiere(s.zone));
    m.name = s.zone;
    g.add(m);
  }
  return g;
}
const pose = (o, p, r = null) => { o.position.set(...p); if (r) o.rotation.set(...r); return o; };

// ------------------------------------------------------------------ pièces (objets three.js)

export const pieces = {
  tige: (pieds, couleur, diam) => objet(tige(pieds, couleur, diam).surfaces),
  marteau: (t) => objet(marteau(t).surfaces),
  driver: (t) => objet(driverSub(t).surfaces),
  saver: (i) => objet(saverSub(i).surfaces),
  anneau: (t, cote) => objet(anneaux(t)[cote]),
  bit: (b) => { const x = bit(b); return objet([...x.corps.surfaces, ...x.boutons, ...x.tube]); },
  bitChuck: (b) => {
    const a = bitAvecChuck(b), g = objet([...a.bit.corps.surfaces, ...a.bit.boutons, ...a.bit.tube]);
    g.add(objet(a.driver.surfaces), objet(a.anneaux));
    return g;
  },
  casse: (i) => { const c = casseBit(i); return objet([...c.corps.surfaces, ...c.ergots]); },
};

// ------------------------------------------------------------------ assemblages

/** P01 — vue d'ensemble : chaque famille sur sa page. */
export function P01(api) {
  const place = (o, x, z = 0) => pose(o, [x, 0, z]);
  api.part('1', place(api.sub('P02'), -1.35, 0), [-0.4, 0, 0]);
  api.part('2', place(api.sub('P03'), -0.55, 0), [-0.15, 0, 0]);
  api.part('3', place(api.sub('P04'), 0.25, 0.55), [0, 0, 0.3]);
  api.part('4', place(api.sub('P05'), 0.25, -0.35), [0, 0, -0.2]);
  api.part('5', place(api.sub('P06'), 1.6, 0.5), [0.3, 0, 0.2]);
  api.part('6', place(api.sub('P07'), 1.35, -0.45), [0.4, 0, -0.2]);
  api.part('7', place(api.sub('P08'), -0.2, -0.85), [0, 0, -0.3]);
  return { view: { dir: [0.35, 0.45, 1] } };
}

/** P02 — tiges de 4, 5 et 6 pi, jaunes et noires, debout, filet mâle en haut : 3 1/2 po devant, 5 1/2 po derrière. */
export function P02(api) {
  let k = 0;
  for (const [diam, z, pas] of [['3-1-2', 0.12, 0.16], ['5-1-2', -0.14, 0.22]]) {
    let n = 0;
    for (const pieds of [4, 5, 6]) {
      for (const couleur of TIGE.couleurs) {
        const x = (n - 2.5) * pas;
        api.part(String(k + 1), pose(pieces.tige(pieds, couleur, diam), [x, 0, z]), [0, 0, (z > 0 ? 1 : -1) * 0.12]);
        k++; n++;
      }
    }
  }
  return { view: { dir: [0.25, 0.3, 1] } };
}

/** P03 — marteaux de 3, 4 et 6 po, debout, sans driver sub. */
export function P03(api) {
  [3, 4, 6].forEach((t, k) => api.part(String(k + 1), pose(pieces.marteau(t), [(k - 1) * 0.24, 0, 0]), [(k - 1) * 0.08, 0, 0]));
  return { view: { dir: [0.3, 0.35, 1] } };
}

/** P04 — bits, face de coupe en bas, queue vers le haut, du plus petit au plus grand. */
export function P04(api) {
  let x = -0.62;
  BITS.forEach((b, k) => {
    x += b.d / 2000 + 0.03;
    api.part(String(k + 1), pose(pieces.bit(b), [x, 0, 0]), [0, 0.1, 0]);
    x += b.d / 2000;
  });
  return { view: { dir: [0.3, 0.6, 1] } };
}

/** P08 — bits avec leur chuck (driver sub) et leurs anneaux, tels qu'on les manipule au changement de bit. */
export function P08(api) {
  let x = -0.62;
  BITS.forEach((b, k) => {
    x += b.d / 2000 + 0.03;
    api.part(String(k + 1), pose(pieces.bitChuck(b), [x, 0, 0]), [0, 0.1, 0]);
    x += b.d / 2000;
  });
  return { view: { dir: [0.3, 0.35, 1] } };
}

/** P05 — driver subs, anneaux de retenue (paires), saver subs. */
export function P05(api) {
  [3, 4, 6].forEach((t, k) => api.part(String(k + 1), pose(pieces.driver(t), [(k - 1) * 0.2, 0, 0.16]), [0, 0.08, 0.05]));
  [3, 4, 6].forEach((t, k) => {
    const x = (k - 1) * 0.2;
    api.part(String(k + 4), pose(pieces.anneau(t, 'gauche'), [x - 0.004, 0, -0.04]), [-0.03, 0, 0]);
    api.part(String(k + 4), pose(pieces.anneau(t, 'droite'), [x + 0.004, 0, -0.04]), [0.03, 0, 0]);
  });
  SAVER_SUBS.forEach((s, k) => api.part(String(k + 7), pose(pieces.saver(k), [(k - 0.5) * 0.26, 0, -0.26]), [0, 0.1, -0.05]));
  return { view: { dir: [0.3, 0.7, 1] } };
}

/** P06 — casse-bits pour les bits de 6, 6 1/2, 8 et 10 po. */
export function P06(api) {
  let x = -0.55;
  CASSE_BITS.forEach((c, k) => {
    x += c.oct / 2000 + 0.04;
    api.part(String(k + 1), pose(pieces.casse(k), [x, 0, 0]), [0, 0.1, 0]);
    x += c.oct / 2000;
  });
  return { view: { dir: [0.3, 0.8, 1] } };
}

/** P07 — chariot à marteau, avec le marteau de 6 po debout sur le pied, driver sub en bas, chaîne mise. */
export function P07(api) {
  const c = chariot();
  api.part('1', objet(c.cadre), [0, 0, -0.1]);
  c.roues.forEach((r, k) => api.part('2', objet(r), [k ? 0.15 : -0.15, 0, -0.1]));
  c.poignees.forEach((p) => api.part('3', objet(p), [0, 0.1, -0.1]));
  api.part('4', objet(c.chaine), [0, 0, 0.2]);
  const m = cotesMarteau(6);
  // Le marteau repose sur le pied par son driver sub (installé en tout temps lors de la manipulation).
  const ep = 6;
  api.part('5', pose(pieces.marteau(6), [0, (ep + m.driverVisible) / 1000, 0]), [0, 0.25, 0.25]);
  api.part('6', pose(pieces.driver(6), [0, ep / 1000, 0]), [0, -0.05, 0.25]);
  return { view: { dir: [0.6, 0.35, 1] } };
}

export default { P01, P02, P03, P04, P05, P06, P07, P08 };
export { MARTEAUX, placer, rot };
