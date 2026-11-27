// Ce qui se pose au sol de la place de travail : cône rouge de collet, casings
// rouges des trous, couvercle de trou en acier rouillé, couvercle de monterie.
import * as THREE from 'three';
import { IN, RAD, plaque } from './geo.js';
import { peintureUsee, rouille, plastiqueSale, uni } from './textures.js';

// ------------------------------------------------------------------ cotes

export const CONE = { h: 18 * IN, base: 10.5 * IN, baseH: 0.75 * IN, rBas: 4.6 * IN, rHaut: 0.9 * IN, ep: 0.12 * IN };
export const CASING = { de: 8.625 * IN, ep: 0.322 * IN, enfoui: 0.15, sortie: 0.15 };
export const COUVERCLE = { d: 30 * IN, t: 0.5 * IN, trous: [[0.29, 20, 1.5], [0.29, 200, 1.5], [0.16, 95, 1], [0.12, 300, 1], [0.21, 140, 1], [0.05, 30, 1]] };
export const MONTERIE = { w: 48 * IN, t: 0.375 * IN, oreille: { w: 3 * IN, h: 2.5 * IN, t: 0.5 * IN, trou: 0.625 * IN }, rebord: 2 * IN };

/** Retourne une géométrie (faces et normales vers l'autre côté). */
function retourne(geo) {
  const n = geo.attributes.normal, ix = geo.index;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); }
  return geo;
}

// ------------------------------------------------------------------ cône

/** Cône de signalisation rouge de 18 po, base carrée noire. Origine au sol, au centre. */
export function cone() {
  const g = new THREE.Group();
  const { h, base, baseH, rBas, rHaut, ep } = CONE;
  const rouge = plastiqueSale('Cone_Rouge', 0xd2231b, { boue: 0.7, rayures: 0.8, seed: 31, rough: 0.5 });
  const noir = plastiqueSale('Cone_Base', 0x1b1b1c, { boue: 0.9, seed: 33, rough: 0.8 });
  // Corps creux : paroi extérieure, lèvre du haut, paroi intérieure.
  const prof = [[rBas + 0.2 * IN, baseH], [rBas, baseH + 0.4 * IN], [rHaut, h], [rHaut - ep, h], [rBas - ep, baseH + 0.4 * IN], [rBas - ep, baseH]];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48), rouge));
  // Base carrée à coins coupés, trou au centre.
  const c = base / 2, k = 1.2 * IN;
  const contour = [[-c + k, -c], [c - k, -c], [c, -c + k], [c, c - k], [c - k, c], [-c + k, c], [-c, c - k], [-c, -c + k]];
  const b = plaque(contour, baseH, noir, [{ x: 0, y: 0, r: rBas - ep }]);
  b.rotation.x = -Math.PI / 2;
  b.position.y = baseH / 2;
  g.add(b);
  return g;
}

// ------------------------------------------------------------------ casing

/**
 * Casing de collet : tube d'acier de 8 5/8 po peint rouge, enfoncé dans le roc.
 * Origine au niveau du sol, au centre ; la partie enfouie descend sous y = 0.
 * sortie : hauteur hors sol (m) ; seed : usure différente d'un casing à l'autre.
 */
export function casing(sortie = CASING.sortie, seed = 0) {
  const g = new THREE.Group();
  const { de, ep, enfoui } = CASING;
  const ro = de / 2, ri = ro - ep, y0 = -enfoui, L = sortie + enfoui;
  const peint = peintureUsee(`Casing_Rouge_${seed % 3}`, 0xb5161b, { usure: 0.22, boue: 0.5, seed: 70 + seed, taille: [512, 256], echelle: 6 });
  const dedans = rouille('Casing_Dedans', { peinture: 0x3b2a22, reste: 0.05, seed: 77, taille: 512 });
  // Bout du haut coupé au chalumeau : bord légèrement ondulé.
  const onde = (a) => 0.004 * Math.sin(a * 3 + seed) + 0.002 * Math.sin(a * 11 + seed * 2);
  const vague = (geo, yTop) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > yTop - 1e-4) p.setY(i, p.getY(i) + onde(Math.atan2(p.getZ(i), p.getX(i))));
    geo.computeVertexNormals();
  };
  const ext = new THREE.CylinderGeometry(ro, ro, L, 56, 1, true);
  ext.translate(0, y0 + L / 2, 0);
  vague(ext, sortie);
  g.add(new THREE.Mesh(ext, peint));
  const int = new THREE.CylinderGeometry(ri, ri, L, 48, 1, true);
  int.translate(0, y0 + L / 2, 0);
  retourne(int); // faces vers l'intérieur
  vague(int, sortie);
  g.add(new THREE.Mesh(int, dedans));
  const bord = new THREE.RingGeometry(ri, ro, 56, 1);
  bord.rotateX(-Math.PI / 2);
  bord.translate(0, sortie, 0);
  vague(bord, sortie);
  g.add(new THREE.Mesh(bord, uni('Casing_Bord', { color: 0x5a4a40, metalness: 0.8, roughness: 0.55 })));
  // Fond sombre du trou (boue et eau) à 0,12 m sous le sol.
  const fond = new THREE.Mesh(new THREE.CircleGeometry(ri, 32), uni('Boue_Eau', { color: 0x2a2826, roughness: 0.12 }));
  fond.rotation.x = -Math.PI / 2;
  fond.position.y = -0.12;
  g.add(fond);
  return g;
}

// ------------------------------------------------------------------ couvercle de trou

/** Couvercle de trou : disque d'acier de 30 po × 1/2 po, peinture rouge presque partie, rouillé. Origine au sol, au centre. */
export function couvercle() {
  const { d, t, trous } = COUVERCLE;
  const R = d / 2, n = 96;
  const contour = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    // Bord coupé au chalumeau : faux-rond de quelques millimètres.
    const r = R + 0.003 * Math.sin(a * 3) + 0.0015 * Math.sin(a * 13);
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const h = trous.map(([f, a, dp]) => ({ x: (f / 0.38) * R * 0.8 * Math.cos(a * RAD), y: (f / 0.38) * R * 0.8 * Math.sin(a * RAD), r: (dp * IN) / 2 }));
  const m = plaque(contour, t, rouille('Couvercle_Trou', { reste: 0.35, seed: 5 }), h);
  m.rotation.x = -Math.PI / 2;
  // Plat légèrement voilé (une plaque qu'on a échappée souvent).
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) + 0.006 * (1 - (x * x + y * y) / (R * R)) + 0.003 * (x / R));
  }
  m.geometry.computeVertexNormals();
  m.position.y = t / 2;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

// ------------------------------------------------------------------ couvercle de monterie

/** Couvercle de monterie : tôle larmée de 48 × 48 po × 3/8 po, quatre oreilles de levage, rebord soudé dessous. */
export function monterie() {
  const g = new THREE.Group();
  const { w, t, oreille: o, rebord } = MONTERIE;
  const jaune = peintureUsee('Monterie_Jaune', 0xe3b51a, { usure: 0.12, boue: 0.4, seed: 90, taille: 1024, larme: 40, echelle: 10 });
  const dessous = peintureUsee('Monterie_Dessous', 0x8a6a1c, { usure: 0.8, boue: 0.3, seed: 93, taille: 256 });
  const tole = new THREE.Mesh(new THREE.BoxGeometry(w, t, w), [dessous, dessous, jaune, dessous, dessous, dessous]);
  tole.position.y = rebord + t / 2;
  g.add(tole);
  // Rebord de cornière dessous, en retrait de 3 po : il garde le couvercle centré sur le trou.
  const ret = 3 * IN, l = w - 2 * ret;
  for (const [x, z, rx] of [[0, w / 2 - ret, 0], [0, -(w / 2 - ret), 0], [w / 2 - ret, 0, 1], [-(w / 2 - ret), 0, 1]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(rx ? t : l, rebord, rx ? l : t), dessous);
    b.position.set(x, rebord / 2, z);
    g.add(b);
  }
  // Oreilles de levage soudées sur le dessus, à 6 po des coins, trou pour la manille.
  const oreilleGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(-o.w / 2, 0); s.lineTo(o.w / 2, 0); s.lineTo(o.w / 2, o.h - o.w / 2);
    s.absarc(0, o.h - o.w / 2, o.w / 2, 0, Math.PI, false);
    s.lineTo(-o.w / 2, 0);
    const p = new THREE.Path(); p.absarc(0, o.h - o.w / 2, o.trou / 2, 0, Math.PI * 2, true); s.holes.push(p);
    const geo = new THREE.ExtrudeGeometry(s, { depth: o.t, bevelEnabled: false, curveSegments: 20 });
    geo.translate(0, 0, -o.t / 2);
    return geo;
  })();
  const c = w / 2 - 6 * IN;
  for (const [x, z] of [[c, c], [-c, c], [-c, -c], [c, -c]]) {
    const e = new THREE.Mesh(oreilleGeo, jaune);
    e.position.set(x, rebord + t, z);
    e.rotation.y = Math.atan2(x, z) + Math.PI / 2;
    g.add(e);
  }
  return g;
}
