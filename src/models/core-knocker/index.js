// Core knocker NQ 15222420 (Machines Roger International) : outil qui sert à
// frapper les bouts de carotte coincés dans le ressort à carotte (core spring)
// du tube carottier. D'après trois plans du 2022-02-28 : l'assemblage 15222420
// (coupe A-A, échelle 1:3), le corps soudé 15222405 (échelle 1:3) et le ressort
// 3760014504 (échelle 1:1).
// Cotes des plans ; ce qu'ils ne cotent pas (diamètre intérieur du tube, tige,
// bague, collet, fil du ressort, rayons de la poignée) est relevé à l'échelle
// sur leurs tracés vectoriels. Contrôle : scripts/check-core-knocker.mjs.
// Repère : X le long de l'axe (0 au bout ouvert du tube, la plaque à l'autre
// bout), Y vers le haut (0 au bas de la plaque, poignée en haut), Z en travers ;
// le plan Z = 0 est celui de la coupe A-A.

const IN = 0.0254;

export const AXE = 2; // hauteur de l'axe : rayon de la plaque

// Corps 15222405 : tube 15222402 et poignée 15222403.
// Le plan cote Ø 2 11/16 po, arrondi au 1/16 : le tracé donne 2,715 po (69 mm).
export const TUBE = { od: 2.715, id: 2.375, len: 16.25 };
// Poignée : rond de 3/8 po plié en U, jambes à 4 15/16 po du bout ouvert (face
// extérieure), 6 po d'entraxe, axe du dessus à 2 3/4 po au-dessus du tube.
export const BRAS = { d: 3 / 8, x0: 4 + 15 / 16, entraxe: 6, haut: 2.75, pli: 9 / 16 };
// Tige 15222410 : Ø 1 po × 6 po, son bout dépasse de 1 1/2 po du bout du tube.
// Collet Ø 1 1/2 × 1/8 po appuyé sur la plaque (rondelle sans repère au plan).
export const TIGE = { d: 1, len: 6, sortie: 1.5, collet: { d: 1.5, t: 1 / 8 } };
// Plaque 15222413 : Ø 4 po, 1/4 po d'épais, alésage de 1 1/32 po.
export const PLAQUE = { d: 4, t: 1 / 4, trou: 1 + 1 / 32 };
// Bague 15222415 : fond de 1/8 po (Ø 2 1/4, alésage 1 1/32) et manchon de
// 2 1/2 po (Ø 2 3/8 × 2,067 po), du fond jusqu'à la plaque.
export const BAGUE = { fond: { d: 2.25, t: 1 / 8, trou: 1 + 1 / 32 }, od: 2.375, id: 2.067, len: 2.5 };
// Ressort 3760014504 : fil de 0,113 po, Ø ext. 1,46 po, 2 1/2 po libre ; monté
// entre le fond de la bague et le collet (2 3/8 po). Bouts rapprochés.
export const RESSORT = { fil: 0.113, od: 1.459, actives: 5 };

// Peinture : rouge Machines Roger sur le corps soudé et la plaque, avec un peu de rouille où la
// peinture a sauté (demandes du client ; les plans ne donnent pas de couleur de surface). La
// tige, le ressort et la bague restent en acier nu.
const PEINT = 'redRust';

const SOUDURE_BRAS = 1 / 8; // tout le tour de chaque jambe (plan du corps)
const SOUDURE_PLAQUE = 1 / 4; // tout le tour, plaque sur tube (plan d'assemblage)

const X_PLAQUE = TUBE.len; // face intérieure de la plaque, au bout du tube
const X_FOND = X_PLAQUE - BAGUE.len; // face du fond de la bague, côté ressort
const X_COLLET = X_PLAQUE - TIGE.collet.t;

/** Marque un cordon de soudure (hors cotes et hors masse dans scripts/check-core-knocker.mjs). */
function cordon(obj) {
  obj.traverse((o) => { o.userData.soudure = true; });
  return obj;
}

/** Pièce de révolution autour de l'axe X : profil [rayon, x] en pouces. */
function tourne(S, profil, material, seg = 48) {
  return S.lathe(profil.map(([r, x]) => [r * IN, x * IN]), material, { axis: 'x', seg });
}

/** Barre ronde pleine le long d'une suite de points [x, y, z] (pouces), bouts fermés. */
function barre(api, points, r, material, { seg = 160, radial = 16 } = {}) {
  const { THREE, S } = api;
  const pts = points.map(([x, y, z]) => new THREE.Vector3(x * IN, y * IN, z * IN));
  const chemin = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) chemin.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  const geo = new THREE.TubeGeometry(chemin, seg, r * IN, radial, false);
  geo.userData.edgeAngle = 60; // pas de contours le long de la barre
  const bout = (p, vers) => {
    const d = new THREE.Mesh(new THREE.CircleGeometry(r * IN, radial));
    d.position.copy(p);
    d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), vers.clone().normalize());
    return d;
  };
  const n = pts.length;
  const m = S.merged([
    new THREE.Mesh(geo),
    bout(pts[0], pts[0].clone().sub(pts[1])),
    bout(pts[n - 1], pts[n - 1].clone().sub(pts[n - 2])),
  ], material);
  m.geometry.userData.edgeAngle = 60;
  return m;
}

/** Arc de cercle dans le plan XY, de l'angle a0 à a1 (degrés). */
function arc(cx, cy, r, a0, a1, n = 14) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), 0]);
  }
  return pts;
}

/** Tube 15222402 : du bout ouvert (X = 0) au bout de la plaque. */
function tube(S, material) {
  return S.shell((TUBE.od / 2) * IN, (TUBE.id / 2) * IN, TUBE.len * IN, material, {
    axis: 'x', seg: 64, pos: [(TUBE.len / 2) * IN, AXE * IN, 0],
  });
}

/** Poignée 15222403 : rond plié en U, jambes soudées sur le dessus du tube. */
function bras(api, material) {
  const S = api.S;
  const r = BRAS.d / 2, R = TUBE.od / 2;
  const xa = BRAS.x0 + r, xb = xa + BRAS.entraxe; // axes des jambes
  const pied = AXE + R, haut = pied + BRAS.haut; // dessus du tube, axe du dessus
  // Les jambes entrent de 1/32 po dans la paroi : le bout plat suit le rond du tube.
  const chemin = [
    [xa, pied - 1 / 32, 0],
    ...arc(xa + BRAS.pli, haut - BRAS.pli, BRAS.pli, 180, 90),
    ...arc(xb - BRAS.pli, haut - BRAS.pli, BRAS.pli, 90, 0),
    [xb, pied - 1 / 32, 0],
  ];
  const g = S.group(barre(api, chemin, r, material));
  for (const x of [xa, xb]) {
    g.add(cordon(S.weldRing((r + SOUDURE_BRAS * 0.3) * IN, SOUDURE_BRAS * IN, material, {
      pos: [x * IN, (pied + SOUDURE_BRAS * 0.2) * IN, 0],
    })));
  }
  return g;
}

/** Tige 15222410 : rond de 1 po, collet de 1 1/2 po qui s'appuie sur la plaque. */
function tige(S, material) {
  const r = TIGE.d / 2, rc = TIGE.collet.d / 2, c = 1 / 32;
  const x1 = X_PLAQUE + TIGE.sortie, x0 = x1 - TIGE.len;
  return tourne(S, [
    [0, x0], [r - c, x0], [r, x0 + c],
    [r, X_COLLET], [rc, X_COLLET], [rc, X_PLAQUE], [r, X_PLAQUE],
    [r, x1 - c], [r - c, x1], [0, x1],
  ], material, 40);
}

/** Plaque 15222413, avec son cordon de 1/4 po tout le tour du tube. */
function plaque(S, material) {
  const R = PLAQUE.d / 2, ri = PLAQUE.trou / 2, c = 1 / 64;
  const x0 = X_PLAQUE, x1 = X_PLAQUE + PLAQUE.t;
  const g = S.group(tourne(S, [
    [ri, x0], [R - c, x0], [R, x0 + c], [R, x1 - c], [R - c, x1], [ri, x1], [ri, x0],
  ], material, 64));
  g.add(cordon(S.weldRing((TUBE.od / 2 + SOUDURE_PLAQUE * 0.3) * IN, SOUDURE_PLAQUE * IN, material, {
    axis: 'x', pos: [(x0 - SOUDURE_PLAQUE * 0.3) * IN, 0, 0],
  })));
  return g;
}

/** Bague 15222415 : fond percé (siège du ressort) et manchon jusqu'à la plaque. */
function bague(S, material) {
  const f = BAGUE.fond;
  const xf = X_FOND - f.t;
  const g = tourne(S, [
    [f.trou / 2, xf], [f.d / 2, xf], [f.d / 2, X_FOND],
    [BAGUE.od / 2, X_FOND], [BAGUE.od / 2, X_PLAQUE], [BAGUE.id / 2, X_PLAQUE],
    [BAGUE.id / 2, X_FOND], [f.trou / 2, X_FOND], [f.trou / 2, xf],
  ], material, 56);
  g.userData.hasInterior = true;
  return g;
}

/** Ressort 3760014504 : spires actives au pas de 0,4 po, une spire rapprochée à chaque bout. */
function ressort(api, material) {
  const w = RESSORT.fil, R = (RESSORT.od - w) / 2;
  const x0 = X_FOND + w / 2, x1 = X_COLLET - w / 2;
  const pas = (x1 - x0 - 2 * w) / RESSORT.actives;
  const tours = RESSORT.actives + 2;
  // Avance le long de l'axe selon le tour : pas du fil aux deux bouts, pas libre au milieu.
  const avance = (t) => Math.min(t, 1) * w + Math.min(Math.max(t - 1, 0), RESSORT.actives) * pas + Math.max(t - 1 - RESSORT.actives, 0) * w;
  const pts = [];
  const n = tours * 28;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * tours, a = t * Math.PI * 2;
    pts.push([x0 + avance(t), R * Math.cos(a), R * Math.sin(a)]);
  }
  return barre(api, pts, w / 2, material, { seg: n, radial: 10 });
}

/** Corps NQ 15222405 : tube et poignée soudée. */
export function P02(api) {
  const S = api.S;
  api.part('1', tube(S, PEINT), [0, 0, 0]);
  api.part('2', bras(api, PEINT), [0, 0.09, 0]);
  return { view: { dir: [0.75, 0.5, 1] } };
}

/** Core knocker NQ 15222420 : corps, tige, plaque, ressort et bague. */
export function P01(api) {
  const S = api.S;
  const axe = (obj) => S.at(S.group(obj), [0, AXE * IN, 0]);
  api.part('1', api.sub('P02'), [0, 0, 0]);
  api.part('5', axe(bague(S, 'zinc')), [0.1, 0, 0]);
  api.part('4', axe(ressort(api, 'blackOxide')), [0.19, 0, 0]);
  api.part('2', axe(tige(S, 'steel')), [0.31, 0, 0]);
  api.part('3', axe(plaque(S, PEINT)), [0.37, 0, 0]);
  return { view: { dir: [0.75, 0.5, 1] } };
}

export default { P01, P02 };
