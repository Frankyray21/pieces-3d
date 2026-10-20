// P010 — Foreuse STM-1500 complète FBRA-002-100AS (page 1.0), avance à 0°
// comme sur la page 1.01 : traîneau (P011) sur patins relevés, support
// d'avance à chevalets (P012) et axe de bascule, poutre d'avance (P013) avec
// pied, boîte et serre-tiges Boyles 12HH, plaque d'extrémité (mast end plate)
// portant la rallonge, la poulie double (P015 à P017) et le guide de tiges,
// table (P018) et tête Boyles (P048), vérin d'avance double logé dans la
// poutre (P021), vérins de bascule et de relevage (P019), jambes et attelage
// (P020), émerillon d'eau (P029), treuil de câble (P042) posé à côté du
// traîneau. Blocs de raccords sur les deux longerons : côté console, les boyaux
// de la console, les deux vannes à bille de l'avance (boyaux d'avance et de
// recul vers les tiges creuses du vérin d'avance, dans la poutre), les boyaux
// du vérin de bascule gauche et du vérin de relevage ; côté droit, ceux des
// deux moteurs du treuil (deux par moteur) et du vérin de bascule droit ; tubes
// de liaison sous le traîneau. Câble du treuil : tambour, guide-câble à
// vis-mère, poulie double, rouleau du guide de tiges. Sans le garde-corps
// grillagé (P023) ni le vérin supérieur (P022, P028). Tout en rouge comme le
// groupe hydraulique, vérins noirs. Repère : layout.js.
import { lister, SLED, AXIS_Y, BEAM, PIVOT, IN } from './layout.js';
import { SPY, HEAD_PORTS as HEAD_LOCAL } from './head.js';

const HEAD_X = -0.32; // table (centre de la tête) le long de l'avance
const RAIL_Z = SLED.w / 2 - SLED.railW / 2;
const SW_X = HEAD_X - 0.55; // nez de l'émerillon d'eau, abouté au bout arrière de la broche (x = −0,55 dans la tête)
// Orifices de branchement (repère de la foreuse) : bouts des raccords laiton du bloc du
// traîneau (sortie −Z, côté console), du moteur de la tête (rotation A et B, sortie −Z) et
// de l'entrée d'eau de l'émerillon (sortie +Y, sur le dessus).
// Bloc de raccords plaqué sur l'âme du longeron gauche (face extérieure z = −0,432).
const BLOCK = { x0: -0.96, x1: -0.34, y0: 0.036, y1: 0.116, d: 0.08 };
export const SLED_PORTS = [-0.4, -0.55, -0.75, -0.9].map((x) => [x, 0.076, -RAIL_Z - 0.051 - BLOCK.d - 0.05]);
export const HEAD_PORTS = HEAD_LOCAL.map(([x, y, z]) => [HEAD_X + x, AXIS_Y - SPY + y, z]);
export const SWIVEL_PORT = [SW_X - 0.1, AXIS_Y + 0.135, 0];
const RIGHT_PORTS_Z = RAIL_Z + 0.051 + BLOCK.d + 0.05; // bouts des raccords du treuil, face +Z du bloc droit

// Treuil de câble (P042) à côté du traîneau, côté droit : centre du bâti, tambours, moteurs White.
const WINCH = { x: -0.55, z: SLED.w / 2 + 0.8 };
const DRUM_Y = 0.35, PACK_R = 0.165; // axe des tambours, rayon du câble enroulé
const MOTOR = { dx: 0.36, y: 0.3, dz: -0.505 }; // moteur White par tambour (repère du treuil)
const NUT_DZ = -0.25; // position du chariot du guide-câble sur sa vis-mère
const EYE = [WINCH.x - 0.42, 0.745, WINCH.z + NUT_DZ]; // œil du guide-câble, sur le chariot
// Rallonge (P013) : poulie double au bout, réas dans le plan z = 0 ; tube, montant et pivot
// décalés vers −Z pour laisser descendre le câble jusqu'au guide de tiges.
const EX1 = BEAM.x0 - 0.62, PY = AXIS_Y + 0.62, EXT_DZ = -0.075;
const SHEAVE_R = 0.112; // rayon du centre du câble posé dans la gorge en V des réas (fond 0,1)
const ROLLER = [BEAM.x0 - 0.07, AXIS_Y - 0.06]; // axe du rouleau diabolo du guide de tiges

/** Arc de cercle (centre c, rayon r) de l'angle a0 à a1 (radians), n pas, dans le plan z. */
function arc(c, r, a0, a1, n, z = 0) {
  const pts = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * (k / n); pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), z]); }
  return pts;
}
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
 * Câble du treuil (repère de la foreuse) : départ tangent au-dessus du câble enroulé sur le
 * tambour gauche, œil du guide-câble, brin montant jusqu'au réa gauche (il entre dans la gorge
 * en douceur : l'écart en z croît comme le carré de la distance sur les 15 premiers cm),
 * enroulement par-dessus les deux réas, brin de sortie jusqu'au rouleau diabolo du guide de
 * tiges, où il repose dans la gorge et retombe d'un doigt avant l'embout serti.
 * Renvoie la courbe et le bout (centre de l'embout).
 */
function wirePath() {
  const cd = [WINCH.x - 0.18, DRUM_Y], e = EYE;
  // Tangente tambour → œil, par-dessus le câble enroulé.
  const de = Math.hypot(e[0] - cd[0], e[1] - cd[1]);
  const aT = Math.atan2(e[1] - cd[1], e[0] - cd[0]) - Math.acos(PACK_R / de);
  const T = [cd[0] + PACK_R * Math.cos(aT), cd[1] + PACK_R * Math.sin(aT), e[2]];
  // Tangente œil → réa gauche (arrivée par le bas, enroulement horaire par la gauche).
  const L = [EX1 - 0.13, PY], R = [EX1 + 0.13, PY];
  const dl = Math.hypot(e[0] - L[0], e[1] - L[1]);
  const aP = Math.atan2(e[1] - L[1], e[0] - L[0]) - Math.acos(SHEAVE_R / dl);
  const P = [L[0] + SHEAVE_R * Math.cos(aP), L[1] + SHEAVE_R * Math.sin(aP)];
  const S = Math.hypot(e[0] - P[0], e[1] - P[1]), s0 = 0.15, k = e[2] / (s0 * (2 * S - s0));
  const zAt = (s) => (s <= s0 ? k * s * s : k * s0 * s0 + 2 * k * s0 * (s - s0));
  const rise = [];
  for (let i = 0; i <= 60; i++) {
    const s = S * (1 - i / 60) ** 2; // points resserrés près du réa
    rise.push([P[0] + (e[0] - P[0]) * (s / S), P[1] + (e[1] - P[1]) * (s / S), zAt(s)]);
  }
  // Tangente extérieure réa droit → rouleau (les deux enroulements sont horaires).
  const D = [ROLLER[0] - R[0], ROLLER[1] - R[1]], dd = Math.hypot(...D);
  const RR = 0.0365; // centre du câble posé dans la gorge du rouleau (fond 0,032)
  const phi = Math.atan2(D[1], D[0]) - Math.acos((RR - SHEAVE_R) / dd); // normale à droite du brin
  const aOut = phi + Math.PI; // angle du point de sortie sur le réa droit et d'arrivée sur le rouleau
  const tip = [ROLLER[0] + RR, ROLLER[1] - 0.018, 0];
  const poly = [
    T, e, ...rise.slice(1),
    ...arc(L, SHEAVE_R, aP + 2 * Math.PI, Math.PI / 2, 24).slice(1),
    ...arc(R, SHEAVE_R, Math.PI / 2, aOut, 10),
    ...arc(ROLLER, RR, aOut, 0, 6),
    tip,
  ];
  return { pts: resample(poly, 0.01), tip };
}

/**
 * Orifices d'un vérin hydCylinder posé de a à b dans le plan XY (comme les vérins de P010) :
 * bouts des raccords (fond, tige) et normale de sortie (génératrice +Y du vérin tournée).
 */
function cylPorts(a, b, bore, ext) {
  const r = bore / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const barrel = len * (1 - ext), h = r * 1.46;
  const n = [-Math.sin(ang), Math.cos(ang)];
  return [r * 1.05, barrel - r * 1.1].map((u) => ({ p: [a[0] + u * Math.cos(ang) + h * n[0], a[1] + u * Math.sin(ang) + h * n[1]], n }));
}
/** Enveloppe convexe d'une liste de points 2D (chaîne monotone), sens trigonométrique. */
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const TABLE_T = AXIS_Y - BEAM.top - SPY; // épaisseur de la table sous la tête

export function P010(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, extrude, hydCylinder, bolt, boltSet, group, at, lathe, torus, nut, gear, merged, ballValve, washer } = api.S;
  const P = lister(api, 'P010');
  const railZ = SLED.w / 2 - SLED.railW / 2;
  const ry = SLED.railH / 2;
  const bz = RAIL_Z + 0.051 + BLOCK.d / 2; // milieu des blocs de raccords en z (valeur absolue)
  const VALVE_Z = -0.488; // axe des vannes à bille de l'avance sur le bloc gauche

  // 1 — Traîneau : deux longerons en tube 6 × 4 po, nez relevés, traverses, plancher central, oreilles de levage.
  const sled = [];
  for (const z of [-railZ, railZ]) {
    sled.push(at(box(SLED.len - 0.3, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [0, ry, z]));
    for (const s of [-1, 1]) sled.push(at(box(0.36, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [s * (SLED.len / 2 - 0.13), ry + 0.06, z], [0, 0, s * 0.42]));
    sled.push(at(box(SLED.len - 0.45, 0.012, SLED.railW + 0.03, 'red'), [0, SLED.railH + 0.006, z]));
  }
  for (const x of [-1.25, -0.55, 0.15, 0.85, 1.25]) sled.push(at(box(0.1, 0.1, SLED.w - 2 * SLED.railW, 'red', { r: 0.005 }), [x, 0.07, 0]));
  sled.push(at(plate(1.2, SLED.w - 2 * SLED.railW, 0.012, 'red', { cutouts: [[0.25, 0, 0.3, 0.3]] }), [-0.6, 0.126, 0]));
  for (const x of [-1.38, 1.38]) for (const z of [-railZ, railZ]) {
    sled.push(at(ring(0.05, 0.026, 0.025, 'red', { axis: 'z' }), [x, 0.2, z + Math.sign(z) * 0.065]));
  }
  // Vannes à bille de l'avance (BKH-12NPT), debout sur le bloc gauche, côté extérieur (hors de la
  // tôle du dessus du longeron) : orifice du bas vissé dans le bloc, orifice du haut au boyau du vérin
  // d'avance ; levier tourné vers l'extérieur (−Z). Sélecteur mât / treuil à côté.
  for (const x of [-0.85, -0.7]) sled.push(at(ballValve(0.05, 'brass', { axis: 'x' }), [x, BLOCK.y1 + 0.0575, VALVE_Z], [0, -Math.PI / 2, Math.PI / 2]));
  sled.push(at(box(0.1, 0.08, 0.06, 'darkSteel', { r: 0.006 }), [-0.5, BLOCK.y1 + 0.04, -railZ - 0.051 - 0.058]));
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
  const bx0 = BEAM.x0, bx1 = BEAM.x1, bl = bx1 - bx0, bxc = (bx0 + bx1) / 2;
  const by0 = BEAM.top - BEAM.h;
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
  // Plaque d'extrémité (mast end plate UM-064-120C) : du dessous de la poutre jusqu'au-dessus du tube
  // de rallonge, percée au passage des tiges et du tube ; porte le guide de tiges et la rallonge.
  {
    const top = AXIS_Y + 0.38, hw = (BEAM.w + 0.06) / 2;
    // Profil dans le plan XY local, tourné de 90° autour de Y : x local = −z.
    const ep = extrude([[-hw, by0], [hw, by0], [hw, top - 0.04], [hw - 0.04, top], [-hw + 0.04, top], [-hw, top - 0.04]], 0.04, 'red',
      { holes: [[0, AXIS_Y, 0.07], [-EXT_DZ, AXIS_Y + 0.3, 0.075]] });
    ep.rotation.y = Math.PI / 2;
    ep.position.x = bx0 + 0.02;
    beam.push(ep);
  }
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
  const fcY = by0 + 0.12, endY = fcY + 0.02;
  const ROD_END = [-1.88, 0.78];
  const coude = (x, sx) => merged([
    at(cyl(0.013, 0.04, 'brass', { axis: 'z', seg: 14 }), [x, endY, -0.065]),
    at(nut(0.03, 0.01, 'brass', { axis: 'z' }), [x, endY, -0.055]),
    at(box(0.03, 0.03, 0.03, 'brass', { r: 0.006 }), [x, endY, FEED_Z]),
    at(cyl(0.013, 0.035, 'brass', { axis: 'x', seg: 14 }), [x + sx * 0.0175, endY, FEED_Z]),
  ], 'brass');
  P('UM-064-100Z', group(
    at(shell(0.06, 0.045, 1.5, 'black', { axis: 'x' }), [-0.55, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [-1.3, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [0.2, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [-1.6, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [0.5, fcY, 0]),
    ...ROD_END.map((x) => at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [x, endY, 0])),
    coude(ROD_END[0], 1), coude(ROD_END[1], -1),
    // Patte du tube central sous la table : le tube entraîne la table, les tiges sont fixées aux bouts de la poutre.
    at(box(0.1, BEAM.top + 0.012 - fcY - 0.05, 0.06, 'black', { r: 0.006 }), [HEAD_X, (fcY + 0.05 + BEAM.top + 0.012) / 2, 0]),
  ), [0, -0.45, 0]);

  // 18 — Vérins de bascule HBU-3010 (2) : du traîneau à la poutre, côté arrière.
  for (const z of [-0.34, 0.34]) {
    const a = [-1.15, 0.2, z], b = [-1.0, by0 - 0.03, z];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = hydCylinder(len, 0.09, { material: 'black', rodR: 0.03, ext: 0.4 });
    c.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    P('FBRA-002-515ZZ', at(group(c), a), [0, 0, z > 0 ? 0.45 : -0.45]);
  }
  // 12 — Vérin de relevage (HBU 2536) : du traîneau vers l'arrière de la poutre.
  {
    const a = [0.05, 0.2, 0], b = [-1.75, by0 - 0.02, 0];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = hydCylinder(len, 0.065, { material: 'black', rodR: 0.022, ext: 0.35 });
    c.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    P('UM-064-300Z', at(group(c), a), [0, -0.3, 0]);
  }

  // 14 — Jambes télescopiques (2) sous l'arrière de la poutre : section centrale, inférieure, vis de réglage
  // (du patin à la section inférieure) et patin.
  for (const z of [-0.1, 0.1]) {
    const x = bx0 + 0.3;
    P('UM-064-400D', group(
      at(box(0.076, 0.32, 0.076, 'red', { r: 0.004 }), [x, by0 - 0.16, z]),
      at(box(0.064, 0.22, 0.064, 'red', { r: 0.004 }), [x, by0 - 0.38, z]),
      at(cyl(0.02, by0 - 0.49 - 0.02, 'steel', { axis: 'y', seg: 14 }), [x, (by0 - 0.49 + 0.02) / 2, z]),
      at(box(0.14, 0.02, 0.14, 'red', { r: 0.004 }), [x, 0.01, z]),
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

  // 10 — Rallonge à l'arrière de l'avance (P013) : tube carré réglable qui coulisse dans la plaque
  // d'extrémité, montant, pivot à ressort (P015), poulie double (P017 : deux flasques boulonnés sur la
  // plaque du pivot, deux réas à gorge sur roulements, axes et écrous) et guide de tiges à rouleau
  // diabolo (P016). Tube, montant et pivot sont décalés vers −Z : le brin de sortie du câble descend
  // à côté du tube jusqu'au rouleau du guide de tiges.
  const ex1 = EX1, ey = AXIS_Y + 0.3, py = PY, dz = EXT_DZ;
  const plY = py - 0.145; // plaque du pivot (dessus en py − 0,135, sous la jante du réa droit)
  const sheave = (x) => group(
    at(lathe([[0.03, -0.022], [0.118, -0.022], [0.128, -0.016], [0.128, -0.01], [0.1, 0], [0.128, 0.01], [0.128, 0.016], [0.118, 0.022], [0.03, 0.022]], 'red', { axis: 'z', seg: 48 }), [x, py, 0]),
    at(ring(0.045, 0.02, 0.05, 'steel', { axis: 'z', seg: 24 }), [x, py, 0]),
    ...[0, 1, 2, 3, 4].map((k) => at(cyl(0.012, 0.012, 'red', { axis: 'z', seg: 12 }), [x + Math.cos(k * 1.257) * 0.07, py + Math.sin(k * 1.257) * 0.07, 0.022])),
  );
  // Flasques de la poulie avec leur patte d'appui sur la plaque du pivot.
  const flasque = (z) => at(extrude([[-0.13, -0.035], [-0.01, -0.035], [0.0, plY + 0.01 - py], [0.11, plY + 0.01 - py], [0.13, -0.035], [0.16, 0], [0.13, 0.035], [-0.13, 0.035], [-0.16, 0]], 0.012, 'red', { holes: [[-0.13, 0, 0.0125], [0.13, 0, 0.0125]] }), [ex1, py, z]);
  const wire = wirePath();
  const springTop = plY - 0.01, springLen = 0.075, springY = springTop - springLen / 2 - 0.004;
  const seatY = springTop - springLen - 0.008 - 0.0015; // rondelle d'appui sous le ressort
  P('UM-064-200C', group(
    at(box(0.72, 0.1, 0.1, 'red', { r: 0.008 }), [ex1 + 0.36, ey, dz]),
    ...[-1, 1].map((s) => at(box(0.14, 0.02, 0.1, 'red', { r: 0.004 }), [bx0 + 0.11, ey + s * 0.06, dz])),
    boltSet([[bx0 + 0.08, ey + 0.071, dz], [bx0 + 0.14, ey + 0.071, dz]], 0.016, 0.05, 'steel'),
    at(box(0.1, plY - 0.01 - ey, 0.1, 'red', { r: 0.008 }), [ex1 + 0.05, (plY - 0.01 + ey) / 2, dz]),
    // Pivot à ressort : plaque du pivot (sous les flasques), axe, tige de réglage, ressort entre la plaque
    // et une rondelle tenue par un écrou au bout de la tige.
    at(box(0.16, 0.02, 0.218, 'red', { r: 0.004 }), [ex1 + 0.05, plY, dz + 0.009]),
    at(cyl(0.016, 0.22, 'steel', { axis: 'z', seg: 16 }), [ex1 - 0.02, plY + 0.01 + 0.016, dz]),
    at(api.S.spring(0.018, 0.004, springLen, 7, 'red'), [ex1 + 0.05, springY, dz - 0.077]),
    at(cyl(0.011, plY + 0.01 - (seatY - 0.025), 'steel', { axis: 'y', seg: 12 }), [ex1 + 0.05, (plY + 0.01 + seatY - 0.025) / 2, dz - 0.077]),
    at(washer(0.024, 0.0115, 0.003), [ex1 + 0.05, seatY, dz - 0.077]),
    at(nut(0.028, 0.012, 'steel'), [ex1 + 0.05, seatY - 0.0075, dz - 0.077]),
    // Poulie double : deux flasques, deux réas, axes et écrous.
    flasque(-0.036), flasque(0.036),
    sheave(ex1 - 0.13), sheave(ex1 + 0.13),
    ...[-0.13, 0.13].map((dx) => at(cyl(0.0125, 0.1, 'steel', { axis: 'z', seg: 16 }), [ex1 + dx, py, 0])),
    ...[-0.13, 0.13].flatMap((dx) => [-1, 1].map((sz) => at(nut(0.032, 0.014, 'steel', { axis: 'z' }), [ex1 + dx, py, sz * 0.05]))),
    // Guide de tiges : cadre en U à boutonnières, axe et rouleau diabolo en caoutchouc.
    ...[-1, 1].map((s) => at(box(0.14, 0.2, 0.012, 'red', { r: 0.004 }), [bx0 - 0.07, AXIS_Y, s * 0.085])),
    at(box(0.14, 0.012, 0.18, 'red', { r: 0.003 }), [bx0 - 0.07, AXIS_Y - 0.1, 0]),
    at(cyl(0.012, 0.2, 'steel', { axis: 'z', seg: 14 }), [ROLLER[0], ROLLER[1], 0]),
    at(lathe([[0.014, -0.075], [0.052, -0.075], [0.056, -0.06], [0.032, 0], [0.056, 0.06], [0.052, 0.075], [0.014, 0.075]], 'rubber', { axis: 'z', seg: 32 }), [ROLLER[0], ROLLER[1], 0]),
  ), [-0.6, 0.3, 0]);

  // 20 — Émerillon d'eau au bout arrière de la broche : nez abouté contre la broche (rayon 0,049 à 0,07).
  P('UM-106-100AA', group(
    at(lathe([[0.02, 0], [0.055, 0], [0.065, 0.03], [0.065, 0.15], [0.06, 0.17], [0.06, 0.19], [0.02, 0.19]], 'red', { axis: 'x', seg: 28 }), [SW_X - 0.19, AXIS_Y, 0]),
    at(cyl(0.02, 0.07, 'brass', { axis: 'y', seg: 14 }), [SWIVEL_PORT[0], SWIVEL_PORT[1] - 0.035, 0]),
  ), [-0.4, 0.2, 0]);

  // 4 — Treuil de câble 10 000 pi posé à côté du traîneau, côté droit (P042) : bâti tubulaire, deux
  // tambours sur leur arbre (palier à semelle HCPE211-32 côté traîneau, support à roulement
  // UM-032-131FB de l'autre côté), câble enroulé, carters de chaîne, moteurs White sur leurs
  // consoles UM-041-208F avec deux raccords 6400-12-12 chacun, guide-câble à vis-mère et volants.
  const wz = WINCH.z, wx = WINCH.x;
  const w = [];
  for (const z of [-0.33, 0.33]) {
    w.push(at(box(0.97, 0.1, 0.06, 'red', { r: 0.006 }), [wx, 0.05, wz + z]));
    w.push(at(box(0.06, 0.52, 0.06, 'red', { r: 0.006 }), [wx - 0.42, 0.33, wz + z]));
    w.push(at(box(0.06, 0.52, 0.06, 'red', { r: 0.006 }), [wx + 0.42, 0.33, wz + z]));
  }
  for (const x of [-0.42, 0.42]) w.push(at(box(0.06, 0.06, 0.72, 'red', { r: 0.006 }), [wx + x, 0.6, wz]));
  for (const s of [-1, 1]) {
    const xd = wx + s * 0.18, xm = wx + s * MOTOR.dx;
    // Tambour : fût rouge, câble enroulé jusqu'aux flasques, flasques, arbre.
    w.push(at(cyl(0.12, 0.56, 'red', { axis: 'z', seg: 36 }), [xd, DRUM_Y, wz]));
    w.push(at(cyl(PACK_R, 0.56, 'darkSteel', { axis: 'z', seg: 40 }), [xd, DRUM_Y, wz]));
    for (const z of [-0.29, 0.29]) w.push(at(cyl(0.21, 0.02, 'red', { axis: 'z', seg: 36 }), [xd, DRUM_Y, wz + z]));
    w.push(at(cyl(0.025, 0.76, 'steel', { axis: 'z', seg: 16 }), [xd, DRUM_Y, wz - 0.02]));
    // Côté traîneau : socle sur le longeron du bâti et palier à semelle (2 boulons B500-1750).
    w.push(at(box(0.12, DRUM_Y - 0.08 - 0.1, 0.05, 'red', { r: 0.004 }), [xd, (DRUM_Y - 0.08 + 0.1) / 2, wz - 0.33]));
    w.push(at(box(0.2, 0.03, 0.05, 'blackCast', { r: 0.006 }), [xd, DRUM_Y - 0.065, wz - 0.33]));
    w.push(at(ring(0.065, 0.025, 0.05, 'blackCast', { axis: 'z', seg: 28 }), [xd, DRUM_Y, wz - 0.33]));
    w.push(boltSet([[xd - 0.075, DRUM_Y - 0.05, wz - 0.33], [xd + 0.075, DRUM_Y - 0.05, wz - 0.33]], 0.0127, 0.044, 'steel'));
    // Autre côté : support à roulement boulonné sur le longeron.
    w.push(at(extrude([[-0.1, 0.1], [0.1, 0.1], [0.06, DRUM_Y + 0.06], [-0.06, DRUM_Y + 0.06]], 0.02, 'red', { holes: [[0, DRUM_Y, 0.026]] }), [xd, 0, wz + 0.33]));
    w.push(at(ring(0.05, 0.025, 0.04, 'steel', { axis: 'z', seg: 24 }), [xd, DRUM_Y, wz + 0.33]));
    // Carter de chaîne (enveloppe des pignons 80B28 du tambour et 80B14 du moteur), console et moteur.
    const outline = hull([...arc([xd, DRUM_Y], 0.14, 0, 2 * Math.PI, 24), ...arc([xm, MOTOR.y], 0.09, 0, 2 * Math.PI, 20)].map(([x, y]) => [x - xd, y]));
    w.push(at(extrude(outline, 0.06, 'red'), [xd, 0, wz - 0.39]));
    w.push(at(box(0.16, 0.18, 0.01, 'red', { r: 0.003 }), [xm, MOTOR.y, wz - 0.425]));
    w.push(at(cyl(0.06, 0.15, 'blackCast', { axis: 'z', seg: 28 }), [xm, MOTOR.y, wz + MOTOR.dz]));
    for (const d of [-0.03, 0.03]) w.push(at(cyl(0.013, 0.05, 'brass', { axis: 'y', seg: 14 }), [xm + d, MOTOR.y - 0.07, wz + MOTOR.dz]));
  }
  // Guide-câble : vis-mère sur deux paliers posés sur la traverse arrière, chariot et œil, volants à moyeu.
  const gx = EYE[0], gy = 0.665;
  w.push(at(cyl(0.02, 0.82, 'steel', { axis: 'z', seg: 14 }), [gx, gy, wz]));
  for (const z of [-0.33, 0.33]) w.push(at(box(0.05, 0.05, 0.04, 'darkSteel', { r: 0.005 }), [gx, 0.655, wz + z]));
  w.push(at(box(0.08, 0.06, 0.08, 'darkSteel', { r: 0.006 }), [gx, gy, EYE[2]]));
  w.push(at(cyl(0.005, EYE[1] - 0.023 - (gy + 0.03) + 0.002, 'steel', { axis: 'y', seg: 10 }), [gx, (EYE[1] - 0.023 + gy + 0.03) / 2, EYE[2]]));
  w.push(at(torus(0.018, 0.005, 'steel', { axis: 'x' }), EYE));
  for (const z of [-0.4, 0.4]) {
    w.push(at(torus(0.07, 0.008, 'black', { axis: 'z' }), [gx, gy, wz + z]));
    w.push(at(cyl(0.028, 0.03, 'black', { axis: 'z', seg: 16 }), [gx, gy, wz + z]));
    for (let k = 0; k < 3; k++) { const a = k * (2 * Math.PI / 3) + 0.5; w.push(rod([gx + 0.026 * Math.cos(a), gy + 0.026 * Math.sin(a), wz + z], [gx + 0.064 * Math.cos(a), gy + 0.064 * Math.sin(a), wz + z], 0.005, 'black', 8)); }
  }
  // Câble du treuil (tambour → guide-câble → poulie double → rouleau du guide de tiges) et son embout serti.
  w.push(tube(wire.pts, 0.004, 'darkSteel', { seg: wire.pts.length, tension: 0.5 }));
  w.push(at(cyl(0.007, 0.016, 'darkSteel', { axis: 'y', seg: 12 }), [wire.tip[0], wire.tip[1] - 0.008, 0]));
  // Boyaux des moteurs White (deux par moteur) : des raccords de la face +Z du bloc du longeron droit,
  // au sol, puis remontée dans les raccords du dessous des moteurs.
  const portY = MOTOR.y - 0.095, portZ = wz + MOTOR.dz;
  const WINCH_PORTS_X = [-1, 1].flatMap((s) => [-0.03, 0.03].map((d) => wx + s * MOTOR.dx + d));
  const winchHose = (x) => hose([[x, 0.076, RIGHT_PORTS_Z], [x, 0.076, RIGHT_PORTS_Z + 0.05], [x, 0.084, portZ - 0.06], [x, 0.11, portZ - 0.02], [x, 0.15, portZ], [x, portY, portZ]], 0.014);
  P('FBRA-002-400HH', group(w, ...WINCH_PORTS_X.map(winchHose)), [0, 0, 0.7]);

  // Blocs de raccords des longerons et boyaux des vérins. Gauche (côté console) : raccords des boyaux de
  // la console (face −Z), vannes à bille de l'avance et sélecteur (dessus), raccords du vérin de bascule
  // gauche (bout −X) et du vérin de relevage (dessus) ; droit : raccords des moteurs du treuil (face +Z)
  // et du vérin de bascule droit (bout −X) ; deux tubes de liaison sous le traîneau, à travers l'âme des
  // longerons. Les boyaux arrivent dans l'axe des orifices des vérins.
  const zo = RAIL_Z + 0.051; // face extérieure des longerons
  const by = (BLOCK.y0 + BLOCK.y1) / 2;
  const RB = { x0: BLOCK.x0, x1: -0.12 }; // bloc droit, jusqu'aux raccords du moteur avant
  const endFit = (z) => at(cyl(0.012, 0.05, 'brass', { axis: 'x', seg: 14 }), [BLOCK.x0 - 0.025, by, z]);
  const topFit = (x, z) => at(cyl(0.012, 0.05, 'brass', { axis: 'y', seg: 14 }), [x, BLOCK.y1 + 0.025, z]);
  const tilt = cylPorts([-1.15, 0.2], [-1.0, BEAM.top - BEAM.h - 0.03], 0.09, 0.4);
  const dump = cylPorts([0.05, 0.2], [-1.75, by0 - 0.02], 0.065, 0.35);
  const P3 = ([x, y], z) => [x, y, z];
  const near = ({ p, n }, d, z) => [p[0] + n[0] * d, p[1] + n[1] * d, z];
  const tiltHoses = (s) => [ // s = −1 : gauche, +1 : droit
    hose([[BLOCK.x0 - 0.05, by, s * 0.49], [BLOCK.x0 - 0.09, 0.08, s * 0.49], [-1.3, 0.2, s * 0.47], [-1.32, 0.27, s * 0.38], near(tilt[0], 0.06, s * 0.34), P3(tilt[0].p, s * 0.34)], 0.012),
    hose([[BLOCK.x0 - 0.05, by, s * 0.455], [BLOCK.x0 - 0.1, 0.09, s * 0.455], [-1.25, 0.3, s * 0.5], [-1.28, 0.43, s * 0.42], near(tilt[1], 0.06, s * 0.34), P3(tilt[1].p, s * 0.34)], 0.012),
  ];
  // Boyaux du vérin d'avance : du coude de chaque tige, le long du flanc −Z à l'intérieur de la poutre,
  // sortie par la semelle devant l'axe de bascule, puis descente jusqu'au dessus des vannes à bille.
  const vTop = BLOCK.y1 + 0.115, vz = VALVE_Z;
  const feedRecul = hose([[ROD_END[0] + 0.035, endY, FEED_Z], [-1.7, endY, FEED_Z], [-1.2, endY - 0.01, FEED_Z], [-0.6, endY - 0.025, FEED_Z], [-0.1, 0.72, FEED_Z],
    [0.13, 0.69, FEED_Z], [FEED_EXIT[0], 0.65, FEED_Z], [FEED_EXIT[0], 0.57, FEED_Z - 0.005], [0.1, 0.52, -0.2], [-0.3, 0.52, -0.35], [-0.68, 0.5, -0.44], [-0.85, 0.42, vz], [-0.85, 0.32, vz], [-0.85, vTop, vz]], 0.014);
  const feedAvance = hose([[ROD_END[1] - 0.035, endY, FEED_Z], [0.62, endY, FEED_Z], [0.4, 0.72, FEED_Z], [0.31, 0.69, FEED_Z], [FEED_EXIT[1], 0.65, FEED_Z],
    [FEED_EXIT[1], 0.57, FEED_Z - 0.005], [0.15, 0.47, -0.22], [-0.2, 0.42, -0.36], [-0.55, 0.4, -0.45], [-0.7, 0.34, vz], [-0.7, 0.29, vz], [-0.7, vTop, vz]], 0.014);
  api.add(group(
    at(box(BLOCK.x1 - BLOCK.x0, BLOCK.y1 - BLOCK.y0, BLOCK.d, 'castAlu', { r: 0.006 }), [(BLOCK.x0 + BLOCK.x1) / 2, by, -bz]),
    at(box(RB.x1 - RB.x0, BLOCK.y1 - BLOCK.y0, BLOCK.d, 'castAlu', { r: 0.006 }), [(RB.x0 + RB.x1) / 2, by, bz]),
    ...SLED_PORTS.map(([x, y, z]) => at(cyl(0.017, 0.05, 'brass', { axis: 'z', seg: 16 }), [x, y, z + 0.025])),
    ...WINCH_PORTS_X.map((x) => at(cyl(0.014, 0.05, 'brass', { axis: 'z', seg: 14 }), [x, by, RIGHT_PORTS_Z - 0.025])),
    ...[0.49, 0.455].flatMap((z) => [endFit(-z), endFit(z)]),
    topFit(-0.58, -0.47), topFit(-0.4, -0.47),
    ...[-0.9, -0.82].map((x) => rod([x, 0.06, -zo], [x, 0.06, zo], 0.01, 'steel', 12)),
    ...tiltHoses(-1), ...tiltHoses(1),
    feedRecul, feedAvance,
    // Vérin de relevage : orifices tournés vers le bas, boyaux vers les raccords du dessus du bloc gauche.
    hose([[dump[0].p[0], dump[0].p[1], 0], near(dump[0], 0.02, 0), [0.03, 0.175, -0.08], [0.02, 0.23, -0.3], [-0.3, 0.24, -0.47], [-0.4, 0.21, -0.47], [-0.4, 0.18, -0.47], [-0.4, BLOCK.y1 + 0.05, -0.47]], 0.012),
    hose([[dump[1].p[0], dump[1].p[1], 0], near(dump[1], 0.04, 0), [-1.06, 0.29, -0.1], [-0.85, 0.26, -0.27], [-0.62, 0.27, -0.4], [-0.58, 0.22, -0.47], [-0.58, 0.18, -0.47], [-0.58, BLOCK.y1 + 0.05, -0.47]], 0.012),
  ));
  return { view: { dir: [0.75, 0.5, 1.0] } };
}
