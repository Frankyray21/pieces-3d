// P010 — Foreuse STM-1500 complète FBRA-002-100AS (page 1.0), avance à 0°
// comme sur la page 1.01 : traîneau (P011) à longerons 6 × 3 po sur patins
// relevés, crapauds du treuil, support d'avance à chevalets (P012) et axe de
// bascule, poutre d'avance (P013) avec pied, boîte et serre-tiges Boyles 12HH,
// plaque d'extrémité (mast end plate) portant la rallonge rentrée : connecteur,
// raccord de mât, pivot de poulie et poulie pivotante (P015, P017), guide de
// tiges (P016) ; table (P018) et tête Boyles (P048), vérin d'avance double logé
// dans la poutre (P021), vérins de bascule (P019) dans le support d'avance, à
// l'extérieur des longerons, vérin de relevage entre le support et le treuil,
// jambes et attelage (P020), émerillon d'eau (P029).
// Treuil de câble 10 000 pi (P042) posé sur le traîneau au bout arrière, sous le
// dernier mètre de la poutre : bâti entre les longerons, appuyé dessus par ses
// longerons supérieurs et tenu par les crapauds, capot en position haute (42°,
// bras boulonnés dans le trou n° 4 du 115F, pages 8.3 et P043), volant juste
// sous la poutre comme à la page 1.01 ; transmission, carters et volant du côté
// console (−Z). Câble : couche extérieure du tambour, rouleaux du guide-câble,
// presque à plat sous la poutre jusqu'au réa bas de la poulie, réa haut, rouleau
// du guide de tiges. Blocs de raccords sur les deux
// longerons : côté console, les boyaux de la console, les deux vannes à bille
// de l'avance (boyaux d'avance et de recul vers les tiges creuses du vérin
// d'avance, dans la poutre), le sélecteur mât / treuil avec les deux boyaux du
// moteur White (raccords 6400-12-12) et ceux du vérin de bascule gauche ; côté
// droit, ceux du vérin de bascule droit et du vérin de relevage ; tubes de
// liaison sous le traîneau. Sans le garde-corps grillagé (P023) ni le vérin
// supérieur (P022, P028). Tout en rouge comme le groupe hydraulique, vérins et
// moteurs hydrauliques noirs. Repère : layout.js.
import { lister, SLED, AXIS_Y, BEAM, PIVOT, IN } from './layout.js';
import { SPY, HEAD_PORTS as HEAD_LOCAL } from './head.js';
import { BASE as WB, UP_TOP as W_UP, MOTOR_PORTS, CAPOT_HAUT, cableGuide, tangente, arcPts, hull, circle } from './winch.js';

const HEAD_X = -0.32; // table (centre de la tête) le long de l'avance
const RAIL_Z = SLED.w / 2 - SLED.railW / 2;
const ZO = SLED.w / 2; // face extérieure des longerons
const SW_X = HEAD_X - 0.55; // nez de l'émerillon d'eau, abouté au bout arrière de la broche (x = −0,55 dans la tête)
// Orifices de branchement (repère de la foreuse) : bouts des raccords laiton du bloc du
// traîneau (sortie −Z, côté console), du moteur de la tête (rotation A et B, sortie −Z) et
// de l'entrée d'eau de l'émerillon (sortie +Y, sur le dessus).
// Blocs de raccords plaqués sur l'âme des longerons (faces extérieures z = ±0,432), de l'arrière du
// treuil jusque devant lui (raccords des vérins de bascule et de relevage).
const BLOCK = { x0: -0.96, x1: -0.065, y0: 0.036, y1: 0.116, d: 0.08 };
export const SLED_PORTS = [-0.4, -0.55, -0.75, -0.9].map((x) => [x, 0.076, -ZO - BLOCK.d - 0.05]);
export const HEAD_PORTS = HEAD_LOCAL.map(([x, y, z]) => [HEAD_X + x, AXIS_Y - SPY + y, z]);
export const SWIVEL_PORT = [SW_X - 0.1, AXIS_Y + 0.135, 0];

// Treuil de câble (P042) sur le traîneau, au bout arrière (pages 1.00 et 1.01) : bâti entre les
// longerons, longerons supérieurs posés sur la tôle du dessus des longerons du traîneau, arrière du bâti
// à 1,13 m du centre (avant la remontée des patins) ; capot en position haute comme à la page 1.01 (bras
// boulonnés dans le trou n° 4 du 115F, volant juste sous la poutre), guide-câble au milieu de la vis, dans
// le plan des réas de la poulie (z = 0).
const WINCH = { x: -1.13 + WB.L / 2, y: SLED.railH + 0.012 - WB.h, capot: CAPOT_HAUT, guide: 0 };
const by0 = BEAM.top - BEAM.h;
// Vérins de bascule (P019, page 1.01) dans l'emprise du support d'avance, à l'extérieur des longerons et
// inclinés vers l'avant : axe du pied (chape sur le longeron) au milieu du support, axe de la tige (oreille
// sous la poutre) près du montant avant ; fût en bas, orifices tournés vers l'extérieur. a, b : bouts du
// vérin (hydCylinder), à 27 mm des axes (yeux du fond et de la tige).
const TILT = (() => {
  const foot = [PIVOT.x, 0.215], head = [PIVOT.x + 0.33, by0 - 0.065];
  const L = Math.hypot(head[0] - foot[0], head[1] - foot[1]), d = [(head[0] - foot[0]) / L, (head[1] - foot[1]) / L];
  return { foot, head, a: [foot[0] + 0.027 * d[0], foot[1] + 0.027 * d[1]], b: [head[0] - 0.027 * d[0], head[1] - 0.027 * d[1]], z: 0.457, bore: 0.09, ext: 0.4 };
})();
// Vérin de relevage (P019) entre le support d'avance et le treuil : fût en bas, orifices vers +Z.
const DUMP = { a: [-0.05, 0.2], b: [-0.45, by0 - 0.05], bore: 0.065, ext: 0.35 };
// Rallonge (P013), rentrée comme à la page 1.01 (4 202 mm hors tout ; la rallonge réglable UM-064-116C et sa
// broche ne servent qu'à la cote « with extension » de 5 608 mm) : connecteur UM-064-150C boulonné sur la plaque
// d'extrémité, douille dans l'axe de la poutre, joues du guide de tiges ; raccord de mât UM-064-160C (tube
// carré rentré à fond dans la douille, plaque du bout contre les joues) ; pivot de poulie UM-064-1000DD (P015) et
// poulie pivotante UM-064-180C (P017) : cadre long incliné à 64°, réa haut à l'arrière (3,91 m du pied), réa bas
// 0,52 m plus bas et plus en avant ; guide de tiges UM-064-200C (P016) serré entre les joues du connecteur et
// les guides UM-064-195C, rouleau diabolo sous l'axe des tiges. Cotes relevées sur la vue à 0° de la page 1.01.
const EXT_Y = 0.85; // axe de la douille et du tube carré (page 1.01 : 0,78 à 0,92)
const CON = { x0: BEAM.x0 - 0.15, xg: BEAM.x0 - 0.257 }; // bout de la douille, bout des joues du connecteur
const ROLLER = [BEAM.x0 - 0.206, 1.177]; // axe du rouleau diabolo du guide de tiges
const RR = 0.034; // centre du câble posé sur le col du rouleau (rayon 0,03)
const PIN = [BEAM.x0 - 0.296, 0.637]; // axe de la charnière du pivot de poulie (plaque mobile)
const A64 = (64 * Math.PI) / 180;
const D64 = [-Math.cos(A64), Math.sin(A64)], N64 = [D64[1], -D64[0]]; // le long du cadre de poulie, normale côté pivot
const SHEAVE_R = 0.079; // rayon du centre du câble posé au fond de la gorge des réas (fond 0,075, jante 0,1)
const SHEAVE_E = 0.52; // entraxe des réas
/** Point (s le long du cadre depuis le réa bas, n vers le pivot) → repère de la foreuse. */
const fr = (s, n) => [PIN[0] + 0.0085 * D64[0] - 0.129 * N64[0] + s * D64[0] + n * N64[0], PIN[1] + 0.0085 * D64[1] - 0.129 * N64[1] + s * D64[1] + n * N64[1]];
const SHEAVES = [fr(0, 0), fr(SHEAVE_E, 0)]; // réa bas, réa haut

/** Rééchantillonne une ligne brisée 3D tous les `step` m (courbe lisse sans boucle). */
function resample(poly, step) {
  const out = [poly[0]];
  let carry = 0;
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1], b = poly[i], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    let s = step - carry;
    while (s < L) { const t = s / L; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); s += step; }
    carry = L - (s - step);
  }
  const last = poly[poly.length - 1], prev = out[out.length - 1];
  if (Math.hypot(last[0] - prev[0], last[1] - prev[1], last[2] - prev[2]) > step * 0.3) out.push(last); else out[out.length - 1] = last;
  return out;
}

/**
 * Câble du treuil (repère de la foreuse, plan z = 0 du guide-câble et des réas) : départ tangent sur la
 * couche extérieure du tambour (côté arrière), derrière le rouleau de retenue du guide-câble, autour du
 * rouleau d'enroulement, puis presque à plat sous la poutre jusqu'au dessous du réa bas de la poulie, par
 * l'arrière des deux réas jusqu'au-dessus du réa haut, et vers l'avant jusqu'au rouleau diabolo du guide de
 * tiges, où il repose sur le col et retombe d'un doigt avant l'embout serti. Renvoie la courbe et le bout
 * (centre de l'embout).
 */
function wirePath() {
  const off = ([x, y]) => [x + WINCH.x, y + WINCH.y];
  const [L, H] = SHEAVES;
  const c = cableGuide(WINCH.capot, [L[0] - WINCH.x, L[1] - WINCH.y], SHEAVE_R, -1); // tambour → guide → réa bas
  const t2 = tangente(L, SHEAVE_R, -1, H, SHEAVE_R, -1); // réa bas → réa haut, côté arrière
  const t3 = tangente(H, SHEAVE_R, -1, ROLLER, RR, -1); // par-dessus le réa haut → rouleau du guide de tiges
  const tip = [ROLLER[0] + RR, ROLLER[1] - 0.018, 0];
  const poly = [
    ...c.pts.map(off),
    ...arcPts(L, SHEAVE_R, off(c.q), t2.p, -1),
    ...arcPts(H, SHEAVE_R, t2.q, t3.p, -1),
    ...arcPts(ROLLER, RR, t3.q, [ROLLER[0] + RR, ROLLER[1]], -1, 0.006),
  ].map(([x, y]) => [x, y, 0]);
  poly.push(tip);
  return { pts: resample(poly, 0.01), tip };
}

/**
 * Orifices d'un vérin hydCylinder posé de a à b dans le plan XY puis tourné sur son axe pour que ses
 * orifices regardent vers ±Z (s) : bouts des raccords (fond, tige), décalage z relatif au vérin.
 */
function cylPortsZ(a, b, bore, ext, s) {
  const r = bore / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], barrel = len * (1 - ext);
  return [r * 1.05, barrel - r * 1.1].map((u) => [a[0] + u * d[0], a[1] + u * d[1], s * r * 1.46]);
}
const TABLE_T = AXIS_Y - BEAM.top - SPY; // épaisseur de la table sous la tête

export function P010(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, extrude, hydCylinder, bolt, boltSet, group, at, lathe, torus, nut, merged, ballValve, washer } = api.S;
  const P = lister(api, 'P010');
  const railZ = RAIL_Z;
  const ry = SLED.railH / 2;
  const bz = ZO + BLOCK.d / 2; // milieu des blocs de raccords en z (valeur absolue)
  const VALVE_Z = -0.488; // axe des vannes à bille de l'avance sur le bloc gauche
  const VALVE_X = [-0.74, -0.62]; // vannes de recul et d'avance (devant le carter de la chaîne 35 du treuil)
  const SEL = { x: -0.5, z: -ZO - 0.058, fit: [-0.53, -0.47] }; // sélecteur mât / treuil et raccords du moteur
  const wire = wirePath();

  // Vérin (hydCylinder de a à b, plan XY à la cote z) tourné sur son axe pour que ses orifices regardent
  // vers ±Z (s) ; ses yeux (fond et tige) restent d'axe Z, comme les axes d'articulation.
  const cylinder = (a, b, z, bore, o, s) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), r = bore / 2, rr = o.rodR;
    const c = hydCylinder(len, bore, { ...o, eyes: 'none' });
    c.rotation.x = (s * Math.PI) / 2;
    const g = group(c,
      at(ring(r * 0.75, r * 0.32, r * 0.7, o.material, { axis: 'z', seg: 28 }), [-r * 0.6, 0, 0]),
      at(ring(r * 0.33, r * 0.22, r * 0.72, 'darkSteel', { axis: 'z', seg: 20 }), [-r * 0.6, 0, 0]),
      at(ring(rr * 1.5, rr * 0.6, rr * 1.3, 'darkSteel', { axis: 'z', seg: 28 }), [len + rr * 0.9, 0, 0]),
      at(ring(rr * 0.62, rr * 0.42, rr * 1.34, 'steel', { axis: 'z', seg: 20 }), [len + rr * 0.9, 0, 0]),
      at(nut(rr * 1.7, rr * 0.45, 'darkSteel', { axis: 'x' }), [len - rr * 0.95, 0, 0]),
    );
    g.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return at(group(g), [a[0], a[1], z]);
  };

  // 1 — Traîneau : deux longerons en tube 6 × 3 po, nez relevés, tôles du dessus, traverses (celle de
  // l'arrière derrière le treuil, celle du pied du vérin de relevage), oreilles de levage, crapauds
  // FMC-014-303D du treuil (sur la tôle du dessus, nez sur le longeron supérieur du bâti) et chapes des
  // vérins de bascule et de relevage. L'arrière reste ouvert : le bâti du treuil s'y loge (page 1.1).
  const sled = [];
  for (const z of [-railZ, railZ]) {
    const s = Math.sign(z);
    sled.push(at(box(SLED.len - 0.3, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [0, ry, z]));
    for (const u of [-1, 1]) sled.push(at(box(0.36, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [u * (SLED.len / 2 - 0.13), ry + 0.06, z], [0, 0, u * 0.42]));
    sled.push(at(box(SLED.len - 0.45, 0.012, SLED.railW + 0.012, 'red'), [0, SLED.railH + 0.006, z + s * 0.006]));
    // Crapauds du treuil : semelle boulonnée (B625-2750) et nez sur le longeron supérieur du bâti.
    for (const [xl, top] of [[-0.36, 0.184], [0.25, W_UP]]) {
      const x = WINCH.x + xl, yN = WINCH.y + top, yT = SLED.railH + 0.012;
      sled.push(at(box(0.06, 0.03, 0.05, 'red', { r: 0.003 }), [x, yT + 0.015, s * 0.42]));
      sled.push(at(box(0.06, yN + 0.02 - yT, 0.012, 'red', { r: 0.002 }), [x, (yN + 0.02 + yT) / 2, s * 0.401]));
      sled.push(at(box(0.06, 0.016, 0.034, 'red', { r: 0.002 }), [x, yN + 0.012, s * 0.384]));
      sled.push(at(bolt(0.0159, 0.07, 'steel', { washer: true }), [x, yT + 0.03, s * 0.43]));
    }
    // Chape du pied du vérin de bascule sur le longeron, au milieu du support d'avance : semelle sur la tôle
    // du dessus débordant vers l'extérieur, raidisseur contre l'âme, deux joues et l'axe.
    const [fx, fy] = TILT.foot, yT = SLED.railH + 0.012;
    sled.push(at(box(0.08, 0.012, 0.07, 'red', { r: 0.002 }), [fx, yT + 0.006, s * 0.467]));
    sled.push(at(box(0.06, SLED.railH - 0.04, 0.012, 'red', { r: 0.002 }), [fx, (SLED.railH + 0.04) / 2, s * (ZO + 0.006)]));
    for (const dz of [-0.0255, 0.0255]) sled.push(at(box(0.044, fy + 0.013 - yT - 0.012, 0.008, 'red', { r: 0.002 }), [fx, (fy + 0.013 + yT + 0.012) / 2, s * (TILT.z + dz)]));
    sled.push(at(cyl(0.0095, 0.07, 'steel', { axis: 'z', seg: 12 }), [fx, fy, s * TILT.z]));
  }
  for (const x of [-1.25, -0.05, 0.15, 0.85, 1.25]) sled.push(at(box(0.1, 0.1, SLED.w - 2 * SLED.railW, 'red', { r: 0.005 }), [x, 0.07, 0]));
  // Chape du pied du vérin de relevage sur la traverse.
  {
    const d = [(DUMP.b[0] - DUMP.a[0]), (DUMP.b[1] - DUMP.a[1])], l = Math.hypot(...d), e = [DUMP.a[0] - (0.0195 * d[0]) / l, DUMP.a[1] - (0.0195 * d[1]) / l];
    for (const s of [-1, 1]) sled.push(at(box(0.06, e[1] + 0.03 - 0.12, 0.008, 'red', { r: 0.002 }), [e[0], (e[1] + 0.03 + 0.12) / 2, s * 0.0165]));
    sled.push(at(cyl(0.009, 0.045, 'steel', { axis: 'z', seg: 12 }), [e[0], e[1], 0]));
  }
  for (const x of [-1.38, 1.38]) for (const z of [-railZ, railZ]) {
    sled.push(at(ring(0.05, 0.026, 0.025, 'red', { axis: 'z' }), [x, 0.2, Math.sign(z) * (ZO + 0.014)]));
  }
  // Vannes à bille de l'avance (BKH-12NPT), debout sur le bloc gauche, côté extérieur (hors de la
  // tôle du dessus du longeron) : orifice du bas vissé dans le bloc, orifice du haut au boyau du vérin
  // d'avance ; levier tourné vers l'extérieur (−Z). Sélecteur mât / treuil à côté, avec les deux
  // raccords des boyaux du moteur du treuil sur le dessus.
  for (const x of VALVE_X) sled.push(at(ballValve(0.05, 'brass', { axis: 'x' }), [x, BLOCK.y1 + 0.0575, VALVE_Z], [0, -Math.PI / 2, Math.PI / 2]));
  sled.push(at(box(0.1, 0.08, 0.06, 'darkSteel', { r: 0.006 }), [SEL.x, BLOCK.y1 + 0.04, SEL.z]));
  for (const x of SEL.fit) sled.push(at(cyl(0.012, 0.04, 'brass', { seg: 14 }), [x, BLOCK.y1 + 0.1, SEL.z]));
  P('FBRA-002-150BM', group(sled), [0, -0.35, 0]);

  // 5 — Support d'avance : deux chevalets en HSS 5 × 3 po et axe de bascule Ø 3 po (tube sch. 80).
  const sup = [];
  for (const z of [-0.36, 0.36]) {
    sup.push(rod([PIVOT.x - 0.42, 0.16, z], [PIVOT.x, PIVOT.y, z], 0.045, 'red', 4));
    sup.push(rod([PIVOT.x + 0.42, 0.16, z], [PIVOT.x, PIVOT.y, z], 0.045, 'red', 4));
    sup.push(at(box(1.0, 0.03, 0.14, 'red', { r: 0.004 }), [PIVOT.x, 0.168, z]));
    sup.push(at(cyl(0.075, 0.12, 'red', { axis: 'z' }), [PIVOT.x, PIVOT.y, z]));
    // Blocs de serrage sur les longerons (4) et chaînettes.
    for (const s of [-1, 1]) sup.push(at(box(0.11, 0.04, 0.24, 'darkSteel', { r: 0.004 }), [PIVOT.x + s * 0.45, 0.17, z * 1.05]));
  }
  sup.push(at(cyl(IN * 1.75, 0.86, 'steel', { axis: 'z' }), [PIVOT.x, PIVOT.y, 0]));
  sup.push(at(box(0.08, 0.3, 0.72, 'red', { r: 0.006 }), [PIVOT.x, 0.38, 0]));
  P('FBRA-002-600BB', group(sup), [0, -0.15, 0.5]);

  // 2 — Poutre d'avance (caisson ouvert) : semelle, deux flancs, glissières de la table, plaque d'extrémité.
  // La semelle est percée au passage des boyaux d'avance et de recul (côté −Z, devant l'axe de bascule).
  // Le caisson s'arrête contre la plaque d'extrémité (30 mm, face arrière en BEAM.x0).
  const bx0 = BEAM.x0, EP_T = 0.03, bx1 = BEAM.x1, bl = bx1 - bx0 - EP_T, bxc = (bx0 + EP_T + bx1) / 2;
  const FEED_EXIT = [0.2, 0.27], FEED_Z = -0.1; // passages des boyaux du vérin d'avance dans la semelle
  const beam = [];
  beam.push(at(plate(bl, BEAM.w, 0.016, 'red', { r: 0.004, cutouts: FEED_EXIT.map((x) => [x - bxc, FEED_Z, 0.045, 0.045]) }), [bxc, by0 + 0.008, 0]));
  for (const s of [-1, 1]) {
    beam.push(at(box(bl, BEAM.h - 0.03, 0.014, 'red', { r: 0.003 }), [bxc, by0 + BEAM.h / 2 - 0.005, s * (BEAM.w / 2 - 0.007)]));
    beam.push(at(box(bl, 0.03, 0.07, 'red', { r: 0.004 }), [bxc, BEAM.top - 0.015, s * (BEAM.w / 2 - 0.035)]));
    beam.push(at(box(bl - 0.2, 0.012, 0.05, 'darkSteel', { r: 0.002 }), [bxc + 0.05, BEAM.top + 0.006, s * (BEAM.w / 2 - 0.035)]));
    // Raidisseurs ajourés des flancs.
    for (let x = bx0 + 0.25; x < bx1 - 0.2; x += 0.45) beam.push(at(box(0.06, BEAM.h - 0.05, 0.02, 'red'), [x, by0 + BEAM.h / 2, s * (BEAM.w / 2 + 0.004)]));
  }
  // Paliers de bascule sous la poutre.
  for (const z of [-0.26, 0.26]) beam.push(at(box(0.18, by0 - PIVOT.y + 0.1, 0.05, 'red', { r: 0.006 }), [PIVOT.x, (by0 + PIVOT.y) / 2, z]));
  // Plaque d'extrémité (mast end plate UM-064-120C, page 1.01 : de 0,74 à 1,02 m du sol) : plaque
  // rectangulaire au bout du caisson, portant le connecteur de la rallonge.
  beam.push(at(box(EP_T, 1.02 - by0, BEAM.w + 0.06, 'red', { r: 0.004 }), [bx0 + EP_T / 2, (1.02 + by0) / 2, 0]));
  P('FBRA-002-300BB', group(beam), [0, 0.35, 0]);

  // 11 — Table de la tête : plaque coulissante sur les glissières, blocs et serres de dessous.
  const tableY = BEAM.top + 0.012;
  P('UM-064-200DS', group(
    at(box(0.72, TABLE_T - 0.012, BEAM.w + 0.1, 'red', { r: 0.006 }), [HEAD_X, tableY + (TABLE_T - 0.012) / 2, 0]),
    ...[-1, 1].map((s) => at(box(0.72, 0.05, 0.03, 'black', { r: 0.004 }), [HEAD_X, BEAM.top - 0.02, s * (BEAM.w / 2 + 0.03)])),
    ...[-1, 1].flatMap((s) => [-0.3, 0.3].map((dx) => at(box(0.08, 0.04, 0.05, 'darkSteel', { r: 0.004 }), [HEAD_X + dx, BEAM.top + TABLE_T + 0.02, s * 0.22]))),
  ), [0, 0.25, 0]);

  // 9 — Tête de forage Boyles sur la table, broche dans l'axe de l'avance.
  P('UM-012-100UG', at(api.sub('P048'), [HEAD_X, BEAM.top + TABLE_T, 0]), [0, 0.7, 0]);

  // 3 — Pied de l'avance (plaque avant percée au passage des tiges), 7 — boîte du serre-tiges, 16 — serre-tiges Boyles 12HH.
  // Boîte et serre-tiges plaqués contre le pied ; le serre-tiges porte dans la boîte par ses deux
  // bagues, la boîte repose sur les joues de la table de serrage (15).
  const fx = bx1 + 0.015;
  P('FBRA-002-305BB', group(
    at(plate(0.78, 0.68, 0.03, 'red', { holes: [[AXIS_Y - 1.18, 0, 0.07]], r: 0.03 }), [fx, 1.18, 0], [0, 0, Math.PI / 2]),
    ...[-1, 1].map((s) => at(box(0.12, 0.78, 0.025, 'red', { r: 0.004 }), [fx - 0.07, 1.18, s * 0.33])),
  ), [0.45, 0, 0]);
  const hx = fx - 0.015 - 0.17; // milieu de la boîte et du serre-tiges (face arrière du pied en fx − 0,015)
  const HB = 0.16; // demi-ouverture intérieure de la boîte
  P('FTD-148-300TF', group(
    at(box(0.34, 0.03, 2 * HB + 0.06, 'red', { r: 0.004 }), [hx, AXIS_Y + HB + 0.015, 0]),
    at(box(0.34, 0.03, 2 * HB + 0.06, 'red', { r: 0.004 }), [hx, AXIS_Y - HB - 0.015, 0]),
    ...[-1, 1].map((s) => at(box(0.34, 2 * HB, 0.03, 'red', { r: 0.004 }), [hx, AXIS_Y, s * (HB + 0.015)])),
    boltSet([-0.1, 0, 0.1].flatMap((dx) => [-0.13, 0.13].map((dz) => [hx + dx, AXIS_Y + HB + 0.03, dz])), 0.0127, 0.07, 'steel'),
  ), [0.25, 0.4, 0]);
  P('UM-079-100A-12', group(
    at(lathe([[0.049, 0], [0.13, 0], [0.155, 0.02], [0.155, 0.32], [0.13, 0.34], [0.049, 0.34]], 'red', { axis: 'x', seg: 40 }), [hx - 0.17, AXIS_Y, 0]),
    at(ring(HB, 0.13, 0.025, 'steel', { axis: 'x', seg: 40 }), [hx - 0.06, AXIS_Y, 0]),
    at(ring(HB, 0.13, 0.025, 'steel', { axis: 'x', seg: 40 }), [hx + 0.06, AXIS_Y, 0]),
  ), [0.35, 0.6, 0]);
  // 15 — Pivot du serre-tiges (table de serrage à joues, axe et boulons à œil) sur la poutre.
  const cheekH = AXIS_Y - HB - 0.03 - (BEAM.top + 0.04); // des joues de la table jusqu'au dessous de la boîte
  P('UM-064-800B', group(
    at(box(0.36, 0.04, 0.4, 'red', { r: 0.005 }), [hx, BEAM.top + 0.02, 0]),
    ...[-1, 1].map((s) => at(box(0.3, cheekH, 0.03, 'red', { r: 0.004 }), [hx, BEAM.top + 0.04 + cheekH / 2, s * 0.13])),
    at(cyl(0.0127, 0.46, 'steel', { axis: 'z', seg: 16 }), [hx - 0.12, BEAM.top + 0.07, 0]),
    ...[-1, 1].map((s) => at(torus(0.022, 0.006, 'steel', { axis: 'x' }), [hx + 0.12, BEAM.top + 0.067, s * 0.172])),
  ), [0.2, 0.3, 0]);
  // Entretoises (braces) du pied vers la poutre.
  api.add(group(...[-1, 1].map((s) => rod([fx - 0.03, 1.5, s * 0.28], [bx1 - 0.7, BEAM.top, s * (BEAM.w / 2 - 0.02)], 0.016, 'red', 10))));

  // 17 — Vérin d'avance double (tube central, deux tiges creuses opposées), logé dans la poutre entre ses
  // flancs. Les tiges sont fixées aux bouts de la poutre ; l'huile passe par elles : coude 6801-12-12
  // sur le bloc d'extrémité de chaque tige (recul à l'arrière, avance à l'avant), sortie côté −Z.
  // Le vérin supérieur « bazooka » (6) et sa console (8) ne sont pas montés sur cette foreuse.
  const fcY = by0 + 0.1, endY = fcY + 0.02; // tube central au milieu de la hauteur de la poutre
  const ROD_END = [bx0 + EP_T + 0.04, 0.78]; // blocs des tiges, contre les bouts de la poutre
  const coude = (x, sx) => merged([
    at(cyl(0.013, 0.04, 'brass', { axis: 'z', seg: 14 }), [x, endY, -0.065]),
    at(nut(0.03, 0.01, 'brass', { axis: 'z' }), [x, endY, -0.055]),
    at(box(0.03, 0.03, 0.03, 'brass', { r: 0.006 }), [x, endY, FEED_Z]),
    at(cyl(0.013, 0.035, 'brass', { axis: 'x', seg: 14 }), [x + sx * 0.0175, endY, FEED_Z]),
  ], 'brass');
  P('UM-064-100Z', group(
    at(shell(0.06, 0.045, 1.2, 'black', { axis: 'x' }), [-0.4, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [-1.0, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [0.2, fcY, 0]),
    at(cyl(0.025, -1.0 - ROD_END[0], 'chrome', { axis: 'x' }), [(ROD_END[0] - 1.0) / 2, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [0.5, fcY, 0]),
    ...ROD_END.map((x) => at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [x, endY, 0])),
    coude(ROD_END[0], 1), coude(ROD_END[1], -1),
    // Patte du tube central sous la table : le tube entraîne la table, les tiges sont fixées aux bouts de la poutre.
    at(box(0.1, BEAM.top + 0.012 - fcY - 0.05, 0.06, 'black', { r: 0.006 }), [HEAD_X, (fcY + 0.05 + BEAM.top + 0.012) / 2, 0]),
  ), [0, -0.45, 0]);

  // 18 — Vérins de bascule HBU-3010 (2), dans l'emprise du support d'avance, à l'extérieur des longerons
  // (page 1.01) : du pied (chape sur le longeron, au milieu du support) à une oreille sous la poutre près du
  // montant avant (support FBRA-002-505Z : traverse sous la semelle et deux joues), inclinés vers l'avant ;
  // orifices vers l'extérieur, boyaux le long du traîneau jusqu'au dessus des blocs de raccords.
  for (const s of [-1, 1]) {
    const z = s * TILT.z, [hx, hy] = TILT.head;
    const c = cylinder(TILT.a, TILT.b, z, TILT.bore, { material: 'black', rodR: 0.03, ext: TILT.ext }, s);
    const ear = group(
      at(box(0.07, 0.012, 0.39, 'red', { r: 0.002 }), [hx, by0 - 0.006, s * 0.295]),
      ...[-0.0255, 0.0255].map((dz) => at(box(0.06, by0 - 0.012 - (hy - 0.03), 0.008, 'red', { r: 0.002 }), [hx, (by0 - 0.012 + hy - 0.03) / 2, z + s * dz])),
      at(cyl(0.012, 0.07, 'steel', { axis: 'z', seg: 12 }), [hx, hy, z]),
    );
    P('FBRA-002-515ZZ', group(c, ear), [0, 0, z > 0 ? 0.45 : -0.45]);
  }
  // 12 — Vérin de relevage (HBU 2536) : de la traverse du traîneau à une chape sous la poutre, devant le
  // treuil ; orifices vers +Z.
  {
    const c = cylinder(DUMP.a, DUMP.b, 0, DUMP.bore, { material: 'black', rodR: 0.022, ext: DUMP.ext }, 1);
    const d = [DUMP.b[0] - DUMP.a[0], DUMP.b[1] - DUMP.a[1]], l = Math.hypot(...d), eye = [DUMP.b[0] + (0.0198 * d[0]) / l, DUMP.b[1] + (0.0198 * d[1]) / l];
    const clevis = group(
      ...[-1, 1].map((s) => at(box(0.05, by0 - eye[1] + 0.02, 0.008, 'red', { r: 0.002 }), [eye[0], (by0 + eye[1] - 0.02) / 2, s * 0.019])),
      at(cyl(0.008, 0.045, 'steel', { axis: 'z', seg: 12 }), [eye[0], eye[1], 0]),
    );
    P('UM-064-300Z', group(c, clevis), [0, -0.3, 0]);
  }

  // 14 — Jambes télescopiques (2) sous le bout arrière de la poutre, derrière le treuil (de part et d'autre du
  // câble) : section centrale, inférieure, vis de réglage (du patin à la section inférieure) et patin, posé au sol
  // derrière la traverse arrière du traîneau.
  for (const z of [-0.1, 0.1]) {
    const x = bx0 + 0.04;
    P('UM-064-400D', group(
      at(box(0.076, 0.32, 0.076, 'red', { r: 0.004 }), [x, by0 - 0.16, z]),
      at(box(0.064, 0.22, 0.064, 'red', { r: 0.004 }), [x, by0 - 0.38, z]),
      at(cyl(0.02, by0 - 0.49 - 0.02, 'steel', { axis: 'y', seg: 14 }), [x, (by0 - 0.49 + 0.02) / 2, z]),
      at(box(0.1, 0.02, 0.12, 'red', { r: 0.004 }), [x - 0.02, 0.01, z]),
      at(cyl(0.0095, 0.12, 'steel', { axis: 'z', seg: 10 }), [x, by0 - 0.3, z]),
    ), [0, -0.2, z > 0 ? 0.25 : -0.25]);
  }

  // 13 — Attelage amovible à l'arrière du traîneau (cadre en V, anneau).
  const hx0 = -SLED.len / 2 + 0.02;
  P('UM-064-351D', group(
    rod([hx0, 0.12, -railZ], [hx0 - 0.42, 0.12, 0], 0.03, 'red', 4),
    rod([hx0, 0.12, railZ], [hx0 - 0.42, 0.12, 0], 0.03, 'red', 4),
    at(ring(0.055, 0.03, 0.03, 'red'), [hx0 - 0.47, 0.12, 0]),
    ...[-1, 1].map((s) => at(box(0.08, 0.1, 0.12, 'red', { r: 0.005 }), [hx0 + 0.02, 0.1, s * railZ])),
  ), [-0.4, 0, 0]);

  // 10 — Rallonge rentrée (P013, page 1.01) : connecteur UM-064-150C (plaque boulonnée sur la plaque
  // d'extrémité, douille dans l'axe de la poutre, deux joues à l'arrière), raccord de mât UM-064-160C (tube carré
  // de 4 po dans la douille, plaque du bout contre les joues) ; guide de tiges UM-064-200C (P016 : deux montants
  // à bout arrondi serrés entre les joues et les guides UM-064-195C par les boulons B750-2000, traverse, axe à
  // graisseur et goupille, rouleau diabolo) ; pivot de poulie UM-064-1000DD (P015 : plaque de base vissée sur la
  // plaque du raccord de mât, tube du ressort et tige de réglage vers l'avant sous la douille, charnière en bas,
  // plaque mobile inclinée à 64°) ; poulie pivotante UM-064-180C (P017 : deux flasques longs sur la plaque
  // mobile, deux réas à gorge sur axes boulonnés, quatre entretoises qui retiennent le câble dans les gorges).
  const ang = Math.atan2(D64[1], D64[0]);
  const yg = [0.78, 1.05]; // joues du connecteur et guides 195C (page 1.01)
  const xm = (CON.xg + CON.x0) / 2; // milieu des joues (et des montants du guide de tiges)
  const legPts = [[-0.037, 0.775], [0.037, 0.775], [0.037, 1.325],
    ...Array.from({ length: 7 }, (_, k) => [0.037 * Math.cos(((k + 1) * Math.PI) / 8), 1.325 + 0.037 * Math.sin(((k + 1) * Math.PI) / 8)]), [-0.037, 1.325]];
  const SPC = [[-0.11, -0.016], [-0.004, -0.113], [SHEAVE_E + 0.004, -0.113], [SHEAVE_E + 0.11, -0.016]]; // entretoises (s, n)
  const flasque = hull([...circle([0, 0], 0.06, 24), ...circle([SHEAVE_E, 0], 0.06, 24), ...SPC.flatMap((c) => circle(c, 0.022, 12)), [0.06, 0.092], [0.28, 0.092]]).map(([s, n]) => fr(s, n));
  const trous = [...[0, SHEAVE_E].map((s) => [...fr(s, 0), 0.0225]), ...SPC.map((c) => [...fr(...c), 0.0065])];
  const sheave = ([x, y]) => group(
    at(lathe([[0.0425, -0.025], [0.09, -0.025], [0.1, -0.02], [0.1, -0.012], [0.075, 0], [0.1, 0.012], [0.1, 0.02], [0.09, 0.025], [0.0425, 0.025]], 'red', { axis: 'z', seg: 48 }), [x, y, 0]),
    at(ring(0.0425, 0.0225, 0.038, 'steel', { axis: 'z', seg: 24 }), [x, y, 0]),
    at(cyl(0.0225, 0.088, 'steel', { axis: 'z', seg: 16 }), [x, y, 0]),
    at(cyl(0.03, 0.006, 'steel', { axis: 'z', seg: 20 }), [x, y, 0.047]),
    at(washer(0.035, 0.01, 0.004, 'steel', { axis: 'z' }), [x, y, -0.046]),
    at(bolt(0.019, 0.057, 'steel', { axis: '-z' }), [x, y, -0.048]),
  );
  P('UM-064-200C', group(
    // Connecteur : plaque, douille, joues, boulons sur la plaque d'extrémité.
    at(box(0.016, 0.18, 0.25, 'red', { r: 0.003 }), [bx0 - 0.008, EXT_Y, 0]),
    at(box(bx0 - 0.016 - CON.x0, 0.14, 0.174, 'red', { r: 0.004 }), [(CON.x0 + bx0 - 0.016) / 2, EXT_Y, 0]),
    ...[-1, 1].map((s) => at(box(CON.x0 - CON.xg, yg[1] - yg[0], 0.012, 'red', { r: 0.002 }), [xm, (yg[0] + yg[1]) / 2, s * 0.081])),
    boltSet([0.785, 0.915].flatMap((y) => [-0.106, 0.106].map((z) => [bx0 - 0.016, y, z])), 0.019, 0.05, 'steel', { axis: '-x' }),
    // Raccord de mât rentré : tube carré et plaque du bout.
    at(box(CON.x0 + 0.03 - CON.xg + 0.001, 0.1016, 0.1016, 'red', { r: 0.004 }), [(CON.x0 + 0.03 + CON.xg - 0.001) / 2, EXT_Y, 0]),
    at(box(0.02, 0.18, 0.2, 'red', { r: 0.003 }), [CON.xg - 0.011, EXT_Y, 0]),
    // Guide de tiges : guides 195C et boulons, montants, traverse, axe, goupille, graisseur, rouleau diabolo.
    ...[-1, 1].map((s) => at(box(CON.x0 - CON.xg - 0.003, yg[1] - yg[0], 0.012, 'red', { r: 0.002 }), [xm, (yg[0] + yg[1]) / 2, s * 0.106])),
    ...[0.806, 0.896].flatMap((y) => [-1, 1].map((s) => at(bolt(0.019, 0.05, 'steel', { axis: s > 0 ? 'z' : '-z', washer: true }), [ROLLER[0], y, s * 0.112]))),
    ...[-1, 1].map((s) => at(extrude(legPts, 0.013, 'red', { holes: [[0, ROLLER[1], 0.0127]] }), [ROLLER[0], 0, s * 0.0935])),
    at(box(0.074, 0.013, 0.174, 'red', { r: 0.002 }), [ROLLER[0], 1.066, 0]),
    at(cyl(0.0125, 0.232, 'steel', { axis: 'z', seg: 14 }), [ROLLER[0], ROLLER[1], 0]),
    at(torus(0.011, 0.0015, 'steel', { axis: 'x' }), [ROLLER[0], ROLLER[1], -0.112]),
    at(cyl(0.004, 0.01, 'zinc', { axis: 'z', seg: 8 }), [ROLLER[0], ROLLER[1], 0.121]),
    at(lathe([[0.0125, -0.084], [0.048, -0.084], [0.052, -0.076], [0.03, 0], [0.052, 0.076], [0.048, 0.084], [0.0125, 0.084]], 'rubber', { axis: 'z', seg: 32 }), [ROLLER[0], ROLLER[1], 0]),
    // Pivot de poulie : plaque de base et ses vis, tube du ressort, tige de réglage et écrous, oreilles de
    // la charnière, axe (graisseur, goupille), plaque mobile et ses charnons.
    at(box(0.02, 0.94 - 0.655, 0.2, 'red', { r: 0.003 }), [CON.xg - 0.031, (0.94 + 0.655) / 2, 0]),
    ...[0.79, 0.91].flatMap((y) => [-0.07, 0.07].map((z) => at(cyl(0.0125, 0.002, 'darkSteel', { axis: 'x', seg: 16 }), [CON.xg - 0.0415, y, z]))),
    at(cyl(0.03, 0.106, 'red', { axis: 'x', seg: 24 }), [CON.xg + 0.032, 0.72, 0]),
    at(nut(0.06, 0.037, 'red', { axis: 'x' }), [CON.xg + 0.1035, 0.72, 0]),
    at(cyl(0.012, 0.256, 'steel', { axis: 'x', seg: 14 }), [CON.xg + 0.047, 0.72, 0]),
    at(nut(0.03, 0.012, 'steel', { axis: 'x' }), [CON.xg + 0.167, 0.72, 0]),
    ...[-1, 1].map((s) => at(cyl(0.022, 0.03, 'red', { axis: 'z', seg: 20 }), [PIN[0], PIN[1], s * 0.08])),
    at(cyl(0.0095, 0.21, 'steel', { axis: 'z', seg: 14 }), [PIN[0], PIN[1], 0]),
    at(cyl(0.016, 0.006, 'steel', { axis: 'z', seg: 16 }), [PIN[0], PIN[1], 0.108]),
    at(cyl(0.004, 0.01, 'zinc', { axis: 'z', seg: 8 }), [PIN[0], PIN[1], 0.116]),
    at(torus(0.012, 0.0015, 'steel', { axis: 'x' }), [PIN[0], PIN[1], -0.11]),
    at(box(0.2985, 0.02, 0.2, 'red', { r: 0.003 }), [...fr(0.1408, 0.117), 0], [0, 0, ang]),
    ...[-1, 1].map((s) => at(cyl(0.022, 0.04, 'red', { axis: 'z', seg: 20 }), [PIN[0], PIN[1], s * 0.04])),
    // Poulie pivotante : semelle sur la plaque mobile, deux flasques, réas sur axes boulonnés, entretoises.
    at(box(0.22, 0.015, 0.2, 'red', { r: 0.003 }), [...fr(0.17, 0.0995), 0], [0, 0, ang]),
    ...[-1, 1].map((s) => at(extrude(flasque, 0.012, 'red', { holes: trous }), [0, 0, s * 0.038])),
    ...SHEAVES.map(sheave),
    ...SPC.flatMap((c) => [
      at(ring(0.0125, 0.0068, 0.064, 'red', { axis: 'z', seg: 16 }), [...fr(...c), 0]),
      at(bolt(0.0127, 0.1016, 'steel', { axis: 'z' }), [...fr(...c), 0.044]),
      at(nut(0.019, 0.011, 'steel', { axis: 'z' }), [...fr(...c), -0.0495]),
    ]),
  ), [-0.6, 0.3, 0]);

  // 20 — Émerillon d'eau au bout arrière de la broche : nez abouté contre la broche (rayon 0,049 à 0,07).
  P('UM-106-100AA', group(
    at(lathe([[0.02, 0], [0.055, 0], [0.065, 0.03], [0.065, 0.15], [0.06, 0.17], [0.06, 0.19], [0.02, 0.19]], 'red', { axis: 'x', seg: 28 }), [SW_X - 0.19, AXIS_Y, 0]),
    at(cyl(0.02, 0.07, 'brass', { axis: 'y', seg: 14 }), [SWIVEL_PORT[0], SWIVEL_PORT[1] - 0.035, 0]),
  ), [-0.4, 0.2, 0]);

  // 4 — Treuil de câble 10 000 pi (P042) sur le traîneau, au bout arrière, capot en position haute.
  P('FBRA-002-400HH', at(api.sub('P042', { capot: WINCH.capot, guide: WINCH.guide, cable: false }), [WINCH.x, WINCH.y, 0]), [-0.2, 0.5, 0]);
  // Câble du treuil (tambour → guide-câble → poulie double → rouleau du guide de tiges) et son embout serti.
  api.add(group(
    tube(wire.pts, 0.004, 'darkSteel', { seg: wire.pts.length, tension: 0.5 }),
    at(cyl(0.007, 0.016, 'darkSteel', { axis: 'y', seg: 12 }), [wire.tip[0], wire.tip[1] - 0.008, 0]),
  ));

  // Blocs de raccords des longerons et boyaux. Gauche (côté console) : raccords des boyaux de la console
  // (face −Z), vannes à bille de l'avance et sélecteur mât / treuil (dessus), raccords du vérin de
  // bascule gauche (dessus, au bout avant du bloc) ; droit : raccords du vérin de bascule droit et du vérin
  // de relevage (dessus) ; deux tubes de liaison sous le traîneau, à travers l'âme des longerons, sous le
  // bâti du treuil. Les boyaux partent dans l'axe des orifices et descendent sur les raccords.
  const by = (BLOCK.y1 + BLOCK.y0) / 2, fitTop = BLOCK.y1 + 0.05;
  const topFit = (x, z) => at(cyl(0.012, 0.05, 'brass', { axis: 'y', seg: 14 }), [x, BLOCK.y1 + 0.025, z]);
  const tiltPorts = (s) => cylPortsZ(TILT.a, TILT.b, TILT.bore, TILT.ext, s).map(([x, y, z]) => [x, y, s * TILT.z + z]);
  const dumpPorts = cylPortsZ(DUMP.a, DUMP.b, DUMP.bore, DUMP.ext, 1);
  const FZ = 0.47; // raccords du dessus des blocs (|z|)
  // Vérins de bascule : de l'orifice vers l'extérieur, en bas le long du traîneau (à l'extérieur des blocs de
  // serrage du support d'avance), vers l'arrière jusqu'au bout avant du bloc de raccords, puis sur le
  // raccord du dessus. Orifice du fond (bas) : raccord avant, boyau à hauteur 0,25 ; orifice de la tige :
  // raccord arrière, boyau plus haut et plus à l'extérieur.
  const TILT_FIT = [-0.15, -0.22];
  const tiltHoses = (s) => tiltPorts(s).map(([x, y, z], i) => {
    const xf = TILT_FIT[i], ym = i ? 0.295 : 0.25, zh = i ? 0.6 : 0.56;
    return hose([[x, y, z], [x, y, s * 0.545], [x - 0.03, y - 0.025, s * zh], [x - 0.1, ym, s * zh], [xf + 0.07, ym, s * zh], [xf + 0.02, ym - 0.04, s * 0.53],
      [xf, fitTop + 0.035, s * FZ], [xf, fitTop + 0.012, s * FZ], [xf, fitTop, s * FZ]], 0.012);
  });
  // Vérin de relevage : orifice du fond devant le treuil, orifice de la tige au-dessus de l'avant du treuil.
  const [d1, d2] = dumpPorts;
  const dumpX = [-0.09, -0.3];
  const dumpHoses = [
    hose([d1, [d1[0], d1[1], 0.08], [-0.076, 0.245, 0.2], [-0.078, 0.255, 0.4], [-0.086, 0.23, FZ], [dumpX[0], 0.2, FZ], [dumpX[0], fitTop + 0.012, FZ], [dumpX[0], fitTop, FZ]], 0.012),
    hose([d2, [d2[0], d2[1], 0.09], [d2[0] - 0.004, d2[1] + 0.006, 0.25], [d2[0] - 0.014, d2[1] - 0.019, 0.42], [dumpX[1], d2[1] - 0.089, FZ], [dumpX[1], 0.22, FZ],
      [dumpX[1], fitTop + 0.012, FZ], [dumpX[1], fitTop, FZ]], 0.012),
  ];
  // Boyaux du vérin d'avance : du coude de chaque tige, le long du flanc −Z à l'intérieur de la poutre,
  // sortie par la semelle devant l'axe de bascule, puis derrière le support d'avance, à côté du vérin de
  // relevage, vers l'extérieur et le long du treuil jusqu'au-dessus des vannes.
  const vTop = BLOCK.y1 + 0.115, vz = VALVE_Z;
  const feedRecul = hose([[ROD_END[0] + 0.035, endY, FEED_Z], [ROD_END[0] + 0.12, endY, FEED_Z], [-0.9, endY - 0.012, FEED_Z], [-0.6, endY - 0.025, FEED_Z], [-0.1, by0 + 0.075, FEED_Z],
    [0.13, by0 + 0.05, FEED_Z], [FEED_EXIT[0], by0 + 0.025, FEED_Z], [FEED_EXIT[0], by0 - 0.055, FEED_Z - 0.005], [0.15, by0 - 0.15, -0.15], [-0.05, 0.5, -0.18], [-0.24, 0.49, -0.2],
    [-0.34, 0.49, -0.31], [-0.42, 0.485, -0.43], [-0.6, 0.48, -0.47], [-0.7, 0.45, vz], [VALVE_X[0], 0.38, vz], [VALVE_X[0], 0.3, vz], [VALVE_X[0], vTop, vz]], 0.014);
  const feedAvance = hose([[ROD_END[1] - 0.035, endY, FEED_Z], [0.62, endY, FEED_Z], [0.4, by0 + 0.075, FEED_Z], [0.31, by0 + 0.05, FEED_Z], [FEED_EXIT[1], by0 + 0.025, FEED_Z],
    [FEED_EXIT[1], by0 - 0.055, FEED_Z - 0.005], [0.2, by0 - 0.17, -0.19], [0.05, 0.47, -0.21], [-0.05, 0.45, -0.22], [-0.22, 0.445, -0.235], [-0.31, 0.445, -0.33], [-0.4, 0.44, -0.445],
    [-0.52, 0.43, -0.48], [-0.59, 0.39, vz], [VALVE_X[1], 0.32, vz], [VALVE_X[1], vTop, vz]], 0.014);
  // Moteur White du treuil : des raccords 6400-12-12 (dessus du moteur), par-dessus le carter de la chaîne 80
  // et le longeron, jusqu'aux raccords du sélecteur mât / treuil.
  const motorHoses = MOTOR_PORTS.map(([x, y, z], i) => {
    const p = [WINCH.x + x, WINCH.y + y, z], xs = SEL.fit[i];
    return hose([p, [p[0], p[1] + 0.03, z], [p[0], 0.39, -0.26], [(p[0] + xs) / 2, 0.385, -0.4], [xs, 0.34, -0.475], [xs, 0.28, SEL.z], [xs, BLOCK.y1 + 0.12 + 0.012, SEL.z], [xs, BLOCK.y1 + 0.12, SEL.z]], 0.014);
  });
  api.add(group(
    at(box(BLOCK.x1 - BLOCK.x0, BLOCK.y1 - BLOCK.y0, BLOCK.d, 'castAlu', { r: 0.006 }), [(BLOCK.x0 + BLOCK.x1) / 2, by, -bz]),
    at(box(BLOCK.x1 - BLOCK.x0, BLOCK.y1 - BLOCK.y0, BLOCK.d, 'castAlu', { r: 0.006 }), [(BLOCK.x0 + BLOCK.x1) / 2, by, bz]),
    ...SLED_PORTS.map(([x, y, z]) => at(cyl(0.017, 0.05, 'brass', { axis: 'z', seg: 16 }), [x, y, z + 0.025])),
    ...[-1, 1].flatMap((s) => TILT_FIT.map((x) => topFit(x, s * FZ))),
    ...dumpX.map((x) => topFit(x, FZ)),
    ...[-0.9, -0.82].map((x) => rod([x, 0.045, -ZO], [x, 0.045, ZO], 0.01, 'steel', 12)),
    ...tiltHoses(-1), ...tiltHoses(1), ...dumpHoses,
    feedRecul, feedAvance, ...motorHoses,
  ));
  return { view: { dir: [0.75, 0.5, 1.0] } };
}
