// P010 — Foreuse STM-1500 complète FBRA-002-100AS (page 1.0), avance à 0° comme sur la page 1.01.
// Traîneau FBRA-002-150BM (P011) de 3,32 m : longerons en tube 7 × 5 po sur semelle (1 067 mm hors tout),
// dessous chanfreiné aux deux bouts, deux passages de fourche par longeron (7 1/2 × 3 1/2 po, entraxe 31 1/2 po),
// oreilles avant, oreilles de remorquage arrière, bossages tubulaires, caisson central entre les passages de
// fourche, plat transversal sous les bouts arrière ; quatre poteaux coiffés de paliers fendus (brides UM-064-108B,
// vis B750-3000 et rondelles LC750, graisseurs Z250NF, chaînettes), traverse entre les poteaux avant,
// contrefiches, oreilles d'ancrage des jambes (face avant des poteaux avant, chapes des bras des poteaux
// arrière) ; deux sélecteurs mât / treuil DF10-6B-12L posés sur le caisson contre les poteaux avant (raccords
// 6400-8-8 dans leurs six orifices ; sur celui de gauche, côté −Z, les deux vannes à bille BKH-12NPT de l'avance
// sur 6505-8-8) ; bandes de roulement à l'arrière des longerons et quatre crapauds FMC-014-303D (vis B625-2750,
// rondelles W625, chaînettes) sur les longerons supérieurs du treuil. Support d'avance FBRA-002-600BB (P012) :
// cadre de deux HSS 5 × 3 po couchés (plats d'usure 218B) sur deux tubes de pivot 3 po sch. 80 posés dans les
// paliers, cornières 207B, plaque centrale 201B, quatre brides 211B sur barres 204B (chaînettes) contre la semelle
// de la poutre, quatre pattes de vérin (détail B), chapes 213B du vérin de relevage sur la plaque 220B. Poutre
// d'avance (P013) posée sur les plats d'usure, pied 181 mm derrière la pointe du traîneau, boîte et serre-tiges
// Boyles 12HH, plaque d'extrémité (mast end plate) portant la rallonge rentrée : connecteur, raccord de mât, pivot
// de poulie et poulie pivotante (P015, P017), guide de tiges (P016) ; table (P018) et tête Boyles (P048), vérin
// d'avance double logé dans la poutre (P021). Vérins de bascule HBU-3010 (P019) de la chape du longeron à la patte
// avant du support, avec bloc YEJ, deux clapets d'équilibrage, support 505Z, colliers et tube 507Z ; vérin de
// relevage HBU 2536 couché entre les HSS du support, des chapes 213B à une patte sous la poutre (il fait coulisser la
// poutre), avec son bloc YEJ côté fond ; émerillon d'eau (P029). Les jambes et l'attelage (P020) ne sont pas posés
// à 0° (page 1.01). Treuil de câble 10 000 pi (P042) posé sur l'arrière du traîneau (pages 1.00 et 1.01) : bâti
// entre les longerons, longerons supérieurs sur les bandes de roulement, tenus par les crapauds, axe du tambour
// à 355 mm devant l'œil de remorquage arrière, capot en position haute (42°, bras boulonnés dans le trou n° 4 du
// 115F, pages 8.3 et P043), volant sous la poutre ; transmission, carters et volant du côté console (−Z). Câble :
// couche extérieure du tambour, rouleaux du guide-câble, presque à plat sous la poutre jusqu'au réa bas de la
// poulie, réa haut, rouleau du guide de tiges. Boyaux : console → raccords avant des deux sélecteurs ; sélecteur
// gauche → vannes de l'avance (tiges creuses du vérin d'avance) et moteur White du treuil ; sélecteur droit → blocs
// YEJ des vérins de bascule (le second branchement d'un vérin à l'autre) et du vérin de relevage. Sans le
// garde-corps grillagé (P023) ni le vérin supérieur (P022, P028). Tout en rouge comme le groupe hydraulique, vérins
// et moteurs hydrauliques noirs. Repère : layout.js.
import { lister, SLED, AXIS_Y, BEAM, PIVOT } from './layout.js';
import { SPY, HEAD_PORTS as HEAD_LOCAL } from './head.js';
import { BASE as WB, AXE as W_AXE, UP_TOP as W_UP, PAD as W_PAD, MOTOR_PORTS, CAPOT_HAUT, cableGuide, tangente, arcPts, hull, circle } from './winch.js';

const HEAD_X = BEAM.x1 - 2.18; // table (centre de la tête) le long de l'avance
const SW_X = HEAD_X - 0.55; // nez de l'émerillon d'eau, abouté au bout arrière de la broche (x = −0,55 dans la tête)
const by0 = BEAM.top - BEAM.h; // dessous de la poutre (semelle)

// Traîneau (page 1.01, vue à 0° ; X = 1,660 − S, S depuis la pointe de l'oreille avant).
const RAIL_Z = SLED.w / 2 - SLED.railW / 2; // axe des longerons (±0,444)
const RZ = [RAIL_Z - SLED.railW / 2, RAIL_Z + SLED.railW / 2]; // faces intérieure et extérieure (0,355 ; 0,533)
const RT = SLED.railH; // dessus des longerons
const BANDE = { x: [-1.537, -0.056], t: 0.018 }; // bandes de roulement, de la face arrière des poteaux arrière au bout
const BT = RT + BANDE.t; // dessus des bandes, appui des longerons supérieurs du treuil
const FENETRES = [[0.688, 0.879], [0.079, 0.269]]; // passages de fourche (7 1/2 po, entraxe 31 1/2 po)
const FEN_Y = [0.029, 0.117]; // 3 1/2 po
const POTEAU = { w: 0.102, z: [0.36, 0.434], top: 0.531 }; // poteaux (axes en X : PIVOT.x) ; 34 po hors tout
const PZ = (POTEAU.z[0] + POTEAU.z[1]) / 2;
const PALIER = { w: 0.159, y1: 0.66, r: 0.0452, z: [0.37, 0.434] }; // paliers fendus (moitié haute : bride UM-064-108B),
// à l'extérieur des HSS du support d'avance
const PLZ = (PALIER.z[0] + PALIER.z[1]) / 2;
const OEIL_AR = [-1.6, 0.089]; // œil des oreilles de remorquage arrière
// Sélecteurs mât / treuil DF10-6B-12L sur le caisson, contre les poteaux avant (page 1.01, vue de bout : corps à
// |z| 0,19–0,35) : corps gris d'axe Z, orifices deux à deux (±0,035 du milieu) dessus, devant et derrière.
const DF = { x: 0.83, y: [0.135, 0.185], z: 0.27, hz: 0.08, hx: 0.035, p: 0.035 };
const DF_TOP = DF.y[1] + 0.03, DF_MID = (DF.y[0] + DF.y[1]) / 2; // bout des raccords 6400-8-8 du dessus ; axe des orifices avant et arrière
const BKH_TOP = DF_TOP + 0.083; // dessus des vannes à bille de l'avance (6505-8-8 et BKH-12NPT sur les 6400-8-8)
const dfZ = (s, k) => s * (DF.z + (k ? DF.p : -DF.p)); // orifice intérieur (k = 0) ou extérieur (k = 1)

// Support d'avance (page 1.01, P012) : HSS de 1 196 mm (X −0,119 à 1,077) à |z| 0,305, dessus sous les plats d'usure.
const SUP = { x: [-0.119, 1.077], z: 0.305, w: 0.127, h: 0.076, top: by0 - 0.016 };
const SUP_BOT = SUP.top - SUP.h;
const PATTES = [0.812, 0.15], PATTE_Y = 0.575; // axes des pattes de vérin (détail B), à |z| TILT.z

// Vérins de bascule HBU-3010 (P019, page 1.01) : fond sur la chape soudée au longeron (axe à 171 mm du sol, 483 mm
// derrière l'axe du palier avant), tige sur la patte avant du support ; entraxe 0,524 m, incliné de 50°, tige presque
// rentrée. Repère du vérin : s le long de l'axe depuis l'axe du fond, t perpendiculaire (côté du bloc YEJ, vers le
// haut et l'arrière). a, b : bouts du hydCylinder (fût à 60 mm de l'axe du fond, au-dessus des joues de la chape ; œil de tige).
const TILT = (() => {
  const foot = [0.478, 0.171], head = [PATTES[0], PATTE_Y];
  const L = Math.hypot(head[0] - foot[0], head[1] - foot[1]), d = [(head[0] - foot[0]) / L, (head[1] - foot[1]) / L];
  const n = [-d[1], d[0]], rodR = 0.019;
  const pt = (s, t) => [foot[0] + s * d[0] + t * n[0], foot[1] + s * d[1] + t * n[1]];
  const len = L - 0.06 - 0.9 * rodR; // fût de s 0,06 (bloc du fond) à 0,44 (presse-étoupe), tige sortie de 84 mm
  return { foot, head, d, n, pt, L, z: 0.455, bore: 0.09, rodR, a: pt(0.06, 0), b: pt(L - 0.9 * rodR, 0), len, ext: 1 - 0.38 / len };
})();
// Bloc YEJ du vérin de bascule (s, t du milieu ; demi-longueur, demi-hauteur) et bouts des raccords 6801F des
// boyaux (face intérieure, coudés vers le bas) : repère de la foreuse, pour le vérin du côté s.
const YEJ = { s: 0.35, t: 0.12, hs: 0.05, ht: 0.025 };
const yejPorts = (s) => [YEJ.s - 0.025, YEJ.s + 0.025].map((u) => { const [x, y] = TILT.pt(u, YEJ.t - 0.01); return [x, y - 0.03, s * (TILT.z - 0.05)]; });
// Vérin de relevage HBU 2536 (P019, page 1.01) : couché entre les HSS du support, fond sur les chapes 213B (derrière le
// tube de pivot avant), fût jusque devant le tube de pivot arrière, tige au-dessus de ce tube puis 0,885 m au-delà du
// bout du cadre jusqu'à la patte sous la poutre ; axe à 672 mm du sol (le fût passe entre les tubes de pivot, la tige
// juste au-dessus du tube arrière, sous la semelle de la poutre). Orifices vers +Z.
const DUMP = (() => {
  const foot = [0.804, 0.672], head = [-1.004, 0.672], bore = 0.076, rodR = 0.018;
  const a = [foot[0] - 0.75 * bore / 2, foot[1]], b = [head[0] + 0.9 * rodR, head[1]]; // fût contre l'œil du fond
  const len = a[0] - b[0];
  return { foot, head, bore, rodR, a, b, len, ext: 1 - (a[0] - 0.06) / len };
})();
const DUMP_PF = DUMP.a[0] - 1.05 * DUMP.bore / 2; // orifice du fond (X)
const DUMP_YEJ = { x: [DUMP_PF - 0.05, DUMP_PF + 0.05], y: [DUMP.foot[1] - 0.025, DUMP.foot[1] + 0.025], z: [0.06, 0.11], ports: [DUMP_PF - 0.025, DUMP_PF + 0.025] };
// Passages des boyaux du vérin d'avance dans la semelle de la poutre (côté −Z, entre la cornière arrière et la
// plaque 201B du support, entre les HSS).
const FEED_EXIT = [0.18, 0.25], FEED_Z = -0.1;

// Orifices de branchement de P002 (repère de la foreuse) : raccords avant des deux sélecteurs (sortie +X ; tracés
// SLED_VIA : du sol, côté −Z, par-dessus le longeron gauche, devant les poteaux avant), moteur de la tête (rotation
// A et B, sortie −Z) et entrée d'eau de l'émerillon (sortie +Y, sur le dessus).
export const SLED_PORTS = [[-1, 0], [-1, 1], [1, 0], [1, 1]].map(([s, k]) => [DF.x + DF.hx + 0.03, DF_MID, dfZ(s, k)]);
export const SLED_VIA = (() => {
  const fl = 0.041; // sol + rayon du boyau
  const [p0, p1, p2, p3] = SLED_PORTS;
  const down = (x, y) => [[x, fl, -0.7], [x, 0.11, -0.645], [x, y - 0.01, -0.575], [x, y, -0.5]];
  return [
    [...down(1.06, 0.2), [1.06, 0.2, -0.36], [1.05, 0.195, -0.28], [1.0, 0.178, -0.24], [0.94, 0.165, p0[2]], p0],
    [...down(1.14, 0.24), [1.14, 0.24, -0.38], [1.08, 0.235, -0.31], [0.98, 0.21, p1[2]], [0.93, 0.172, p1[2]], p1],
    [...down(1.22, 0.28), [1.22, 0.28, 0.2], [1.15, 0.26, 0.235], [0.99, 0.2, p2[2]], [0.93, 0.168, p2[2]], p2],
    [...down(1.3, 0.32), [1.3, 0.32, 0.25], [1.22, 0.3, p3[2]], [1.01, 0.21, p3[2]], [0.93, 0.168, p3[2]], p3],
  ];
})();
export const HEAD_PORTS = HEAD_LOCAL.map(([x, y, z]) => [HEAD_X + x, AXIS_Y - SPY + y, z]);
export const SWIVEL_PORT = [SW_X - 0.1, AXIS_Y + 0.135, 0];

// Treuil de câble (P042) sur l'arrière du traîneau (pages 1.00 et 1.01) : bâti entre les longerons, longerons
// supérieurs posés sur les bandes de roulement, axe du tambour 355 mm devant l'œil arrière (pages 1.01 et 1.02) ;
// capot en position haute comme à la page 1.01 (bras boulonnés dans le trou n° 4 du 115F, volant juste sous la
// poutre), guide-câble au milieu de la vis, dans le plan des réas de la poulie (z = 0).
const WINCH = { x: OEIL_AR[0] + 0.355 - W_AXE[0], y: BT - WB.h, capot: CAPOT_HAUT, guide: 0 };

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

/** Tôle ou profil extrudé selon Z (épaisseur t, centré) : contour et trous (polygones, ou cercles [x, y, r]). */
function profil(api, outline, holes, t, mat = 'red') {
  const T = api.THREE;
  const sh = new T.Shape(outline.map(([x, y]) => new T.Vector2(x, y)));
  for (const h of holes) {
    const p = new T.Path();
    if (Array.isArray(h[0])) p.setFromPoints(h.map(([x, y]) => new T.Vector2(x, y)));
    else p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    sh.holes.push(p);
  }
  const geo = new T.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 20 });
  geo.translate(0, 0, -t / 2);
  return api.S.merged([new T.Mesh(geo)], mat);
}
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const arc = (c, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / n; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });

export function P010(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, extrude, hydCylinder, bolt, boltSet, group, at, lathe, torus, nut, merged, washer } = api.S;
  const P = lister(api, 'P010');
  const wire = wirePath();
  // Barre de section w × t (t selon Z) d'un point à l'autre du plan XY, bouts prolongés de e (noyés dans les pièces voisines).
  const strut = (p, q, w, t, z, e = 0, mat = 'red') => {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return at(box(L + 2 * e, w, t, mat, { r: 0.003 }), [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z], [0, 0, Math.atan2(q[1] - p[1], q[0] - p[0])]);
  };
  // Chaînette de n maillons (3/16 po) d'un point vers le bas, en un seul maillage léger.
  const chainette = (p, n, dz = 0) => merged(Array.from({ length: n }, (_, k) => {
    const m = new api.THREE.Mesh(new api.THREE.TorusGeometry(0.0045, 0.0013, 4, 10));
    m.scale.set(1, 1.35, 1);
    if (k % 2) m.rotation.y = Math.PI / 2;
    return at(m, [p[0], p[1] - k * 0.0085, p[2] + (dz * k) / n]);
  }), 'zinc');

  // 1 — Traîneau FBRA-002-150BM (page 1.1).
  const sled = [];
  for (const s of [-1, 1]) {
    const zc = s * RAIL_Z;
    // Longeron : dessus droit d'un bout à l'autre, dessous chanfreiné (avant 130 × 94 mm, arrière 131 × 90 mm),
    // deux passages de fourche traversants à cadre ; semelle de 11 mm dessous.
    const fen = FENETRES.map(([x0, x1]) => rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse());
    sled.push(at(profil(api, [[1.617, RT], [-1.537, RT], [-1.537, 0.09], [-1.406, 0], [1.487, 0], [1.617, 0.094]], fen, SLED.railW), [0, 0, zc]));
    sled.push(at(box(2.893, 0.011, SLED.railW + 0.004, 'red'), [0.0405, 0.006, zc]));
    for (const [x0, x1] of FENETRES) {
      sled.push(at(profil(api, rect(x0 - 0.008, FEN_Y[0] - 0.008, x1 + 0.008, FEN_Y[1] + 0.008), [rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse()], 0.006), [0, 0, s * (RZ[1] + 0.003)]));
    }
    // Oreille avant : plaque verticale sur la moitié intérieure du longeron, sommet arrondi à 277 mm, œil Ø 63.
    sled.push(at(profil(api, [[1.353, RT], [1.617, RT], [1.617, 0.1], [1.66, 0.1], ...arc([1.577, 0.195], 0.082, 0, 1.92, 14)], [[1.577, 0.195, 0.0315]], 0.025), [0, 0, s * 0.39]));
    // Oreille de remorquage arrière : plaque soudée dans le bout du tube, bout arrondi, œil Ø 65.
    sled.push(at(profil(api, [[-1.455, 0.025], ...arc(OEIL_AR, 0.064, -Math.PI / 2, -1.5 * Math.PI, 16), [-1.537, 0.153], [-1.537, RT], [-1.455, RT]], [[...OEIL_AR, 0.0325]], 0.025), [0, 0, zc]));
    // Bossages tubulaires Ø 89 / 64 traversant le longeron (deux sous le treuil, un sous la chape du vérin de
    // bascule), petit pied dessous et vis de blocage.
    for (const x of [-0.961, -1.364, TILT.foot[0]]) {
      sled.push(at(ring(0.0445, 0.032, 0.186, 'red', { axis: 'z', seg: 28 }), [x, 0.074, zc]));
      sled.push(at(box(0.05, 0.02, 0.006, 'red'), [x, 0.021, s * (RZ[1] + 0.003)]));
      sled.push(at(bolt(0.0095, 0.02, 'steel'), [x + 0.02, 0.074 + Math.sqrt(0.0445 ** 2 - 0.02 ** 2) + 0.004, s * (RZ[1] + 0.002)]));
    }
    // Fourreau vertical devant le treuil (pages 1.01 et 1.1) : cadre sur la face extérieure du longeron, plaque percée
    // sur la bande de roulement.
    sled.push(at(profil(api, rect(-0.559, 0.015, -0.411, 0.131), [rect(-0.549, 0.025, -0.421, 0.121).reverse()], 0.006), [0, 0, s * (RZ[1] + 0.003)]));
    sled.push(at(box(0.128, 0.096, 0.004, 'red', { r: 0.002 }), [-0.485, 0.073, s * (RZ[1] + 0.002)]));
    sled.push(at(plate(0.148, SLED.railW + 0.012, 0.008, 'red', { r: 0.008, holes: [[0, 0, 0.026]] }), [-0.485, BT + 0.004, zc]));
    // Bande de roulement (appui du treuil), de la face arrière du poteau arrière au bout du tube.
    sled.push(at(box(BANDE.x[1] - BANDE.x[0], BANDE.t, SLED.railW, 'red', { r: 0.002 }), [(BANDE.x[0] + BANDE.x[1]) / 2, RT + BANDE.t / 2, zc]));
    // Chape du fond du vérin de bascule : deux plaques triangulaires sur le longeron, au-dessus du bossage.
    for (const dz of [-0.028, 0.028]) {
      sled.push(at(profil(api, hull([[0.391, RT], [0.569, RT], ...circle(TILT.foot, 0.03, 20)]), [[...TILT.foot, 0.0127]], 0.0127), [0, 0, s * (TILT.z + dz)]));
    }
    // Poteaux, paliers fendus (moitié basse soudée, bride UM-064-108B, deux vis B750-3000 et rondelles LC750,
    // graisseur Z250NF, chaînette) et contrefiches vers le milieu du longeron.
    for (const px of PIVOT.x) {
      sled.push(at(box(POTEAU.w, POTEAU.top - RT, POTEAU.z[1] - POTEAU.z[0], 'red', { r: 0.004 }), [px, (RT + POTEAU.top) / 2, s * PZ]));
      const c = [px, PIVOT.y], hw = PALIER.w / 2, e = 0.02;
      const bas = [[px - hw, POTEAU.top], [px + hw, POTEAU.top], [px + hw, c[1] - 0.001], ...arc(c, PALIER.r, -e, -Math.PI + e, 24), [px - hw, c[1] - 0.001]];
      const haut = [[px - hw, c[1] + 0.001], ...arc(c, PALIER.r, Math.PI - e, e, 24), [px + hw, c[1] + 0.001], [px + hw, PALIER.y1], [px - hw, PALIER.y1]];
      sled.push(at(profil(api, bas, [], PALIER.z[1] - PALIER.z[0]), [0, 0, s * PLZ]));
      sled.push(at(profil(api, haut, [], PALIER.z[1] - PALIER.z[0]), [0, 0, s * PLZ]));
      for (const dx of [-0.055, 0.055]) {
        sled.push(at(washer(0.016, 0.0102, 0.005, 'steel'), [px + dx, PALIER.y1 + 0.0025, s * PLZ]));
        sled.push(at(bolt(0.019, 0.076, 'steel'), [px + dx, PALIER.y1 + 0.005, s * PLZ]));
      }
      sled.push(at(cyl(0.0045, 0.014, 'zinc', { seg: 10 }), [px, PALIER.y1 + 0.007, s * PLZ]));
      sled.push(chainette([px + 0.06, PALIER.y1 - 0.012, s * (POTEAU.z[1] + 0.006)], 4));
    }
    sled.push(strut([0.905, 0.464], [0.586, RT], 0.07, 0.06, s * PZ, 0.05));
    sled.push(strut([0.046, 0.457], [0.374, RT], 0.07, 0.06, s * PZ, 0.05));
    // Oreille d'ancrage de la jambe sur la face avant du poteau avant (axe à 455 mm du sol).
    sled.push(at(profil(api, [[1.011, 0.42], [1.035, 0.42], ...arc([1.035, 0.455], 0.035, -Math.PI / 2, Math.PI / 2), [1.011, 0.49]], [[1.035, 0.455, 0.0105]], 0.02), [0, 0, s * PZ]));
    // Bras du poteau arrière vers l'intérieur, chape d'ancrage de la jambe (axe 71 mm derrière le poteau, à 457 mm
    // du sol) et diagonale jusqu'au pied du poteau.
    sled.push(at(box(0.1, 0.1, POTEAU.z[0] - 0.17, 'red', { r: 0.004 }), [PIVOT.x[1], 0.4, s * (POTEAU.z[0] + 0.17) / 2]));
    for (const dz of [-0.027, 0.027]) {
      sled.push(at(profil(api, hull([[-0.053, 0.4], [-0.053, 0.49], ...circle([-0.075, 0.457], 0.032, 16)]), [[-0.075, 0.457, 0.0105]], 0.012), [0, 0, s * (0.19 + dz)]));
    }
    {
      const p = [0.19, 0.35], q = [0.36, 0.17], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      sled.push(at(box(0.05, L + 0.04, 0.04, 'red', { r: 0.003 }), [PIVOT.x[1], (p[1] + q[1]) / 2, (s * (p[0] + q[0])) / 2], [s * Math.atan2(q[0] - p[0], q[1] - p[1]), 0, 0]));
    }
    // Crapauds FMC-014-303D du treuil (deux par longeron, aux bouts des longerons supérieurs du bâti) : semelle sur la
    // bande, vis B625-2750 et rondelle W625, montant et bec sur le longeron supérieur (à l'arrière, sur la plaque d'appui
    // du palier du tambour), chaînette.
    for (const [x, wTop] of [[WINCH.x + WB.upX1 - 0.035, WINCH.y + W_UP], [WINCH.x - WB.L / 2 + 0.065, WINCH.y + W_PAD]]) {
      sled.push(at(box(0.06, 0.025, 0.06, 'red', { r: 0.004 }), [x, BT + 0.0125, s * 0.44]));
      sled.push(at(box(0.06, wTop + 0.014 - BT, 0.014, 'red', { r: 0.003 }), [x, (wTop + 0.014 + BT) / 2, s * 0.403]));
      sled.push(at(box(0.06, 0.014, 0.034, 'red', { r: 0.003 }), [x, wTop + 0.007, s * 0.38]));
      sled.push(at(bolt(0.0159, 0.07, 'steel', { washer: true }), [x, BT + 0.025, s * 0.448]));
      sled.push(chainette([x + 0.034, BT + 0.006, s * 0.545], 5));
    }
  }
  // Caisson central entre les longerons, d'un passage de fourche à l'autre (les fourches le traversent).
  sled.push(at(profil(api, rect(0.071, 0.02, 0.887, 0.135), FENETRES.map(([x0, x1]) => rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse()), 2 * RZ[0]), [0, 0, 0]));
  // Traverse entre les poteaux avant, juste sous les paliers ; plat transversal sous les bouts arrière.
  sled.push(at(box(POTEAU.w, 0.1, 2 * POTEAU.z[0], 'red', { r: 0.004 }), [PIVOT.x[0], 0.48, 0]));
  sled.push(at(box(0.15, 0.02, 2 * RZ[0], 'red', { r: 0.002 }), [-1.47, 0.01, 0]));
  // Sélecteurs mât / treuil DF10-6B-12L (détail A) : corps gris, couvercle du tiroir côté poteau, levier vertical à
  // poignée noire et poignée en T, bouchon au bout intérieur ; raccords 6400-8-8 dans les six orifices (dessus,
  // avant vers la console, arrière). Sur le sélecteur gauche (−Z), les vannes à bille BKH-12NPT de l'avance sur les
  // orifices du dessus (6400-8-8 et 6505-8-8), levier à boule vers l'avant.
  for (const s of [-1, 1]) {
    const zc = s * DF.z, zo = s * (DF.z + DF.hz);
    sled.push(at(box(2 * DF.hx, DF.y[1] - DF.y[0], 2 * DF.hz, 'grey', { r: 0.006 }), [DF.x, DF_MID, zc]));
    sled.push(at(box(0.06, 0.046, 0.012, 'grey', { r: 0.004 }), [DF.x, DF_MID, zo + s * 0.006]));
    sled.push(at(cyl(0.014, 0.02, 'darkSteel', { axis: 'z', seg: 16 }), [DF.x, DF_MID, s * (DF.z - DF.hz - 0.01)]));
    sled.push(at(box(0.02, 0.025, 0.012, 'darkSteel', { r: 0.003 }), [DF.x + 0.02, DF.y[1] + 0.0125, zo - s * 0.008]));
    sled.push(at(cyl(0.0045, 0.18, 'steel', { seg: 10 }), [DF.x + 0.02, DF.y[1] + 0.115, zo - s * 0.008]));
    sled.push(at(cyl(0.009, 0.055, 'black', { seg: 14 }), [DF.x + 0.02, DF.y[1] + 0.2225, zo - s * 0.008]));
    sled.push(at(cyl(0.008, 0.05, 'black', { axis: 'x', seg: 12 }), [DF.x - DF.hx - 0.02, DF_MID, zo + s * 0.006]));
    for (const k of [0, 1]) {
      const z = dfZ(s, k);
      for (const [p, ax] of [[[DF.x, DF.y[1], z], 'y'], [[DF.x + DF.hx, DF_MID, z], 'x'], [[DF.x - DF.hx, DF_MID, z], '-x']]) {
        const dir = ax === 'y' ? [0, 1, 0] : ax === 'x' ? [1, 0, 0] : [-1, 0, 0];
        const q = (u) => [p[0] + dir[0] * u, p[1] + dir[1] * u, p[2]];
        sled.push(at(nut(0.022, 0.008, 'brass', { axis: ax === 'y' ? 'y' : 'x' }), q(0.004)));
        sled.push(at(cyl(0.008, 0.022, 'brass', { axis: ax === 'y' ? 'y' : 'x', seg: 12 }), q(0.019)));
      }
      if (s < 0) {
        sled.push(at(nut(0.022, 0.01, 'brass'), [DF.x, DF_TOP + 0.005, z]));
        sled.push(at(cyl(0.01, 0.018, 'brass', { seg: 12 }), [DF.x, DF_TOP + 0.019, z]));
        sled.push(at(box(0.034, 0.045, 0.034, 'zinc', { r: 0.004 }), [DF.x, DF_TOP + 0.0505, z]));
        sled.push(at(nut(0.026, 0.01, 'zinc'), [DF.x, DF_TOP + 0.078, z]));
        sled.push(rod([DF.x + 0.017, DF_TOP + 0.055, z], [DF.x + 0.05, DF_TOP + 0.11, z], 0.003, 'steel', 8));
        sled.push(at(api.S.ball(0.007, 'steel'), [DF.x + 0.052, DF_TOP + 0.113, z]));
      }
    }
  }
  P('FBRA-002-150BM', group(sled), [0, -0.35, 0]);

  // 5 — Support d'avance FBRA-002-600BB (page 1 de FBRA-001-200B) : deux HSS 5 × 3 po couchés à |z| 0,305 (plats d'usure
  // 218B sur leur bord intérieur, sous la semelle de la poutre), deux tubes de pivot 3 po sch. 80 dans les paliers,
  // cornières 207B de part et d'autre des tubes, plaque centrale 201B percée, plaque 220B et chapes 213B du vérin de
  // relevage, brides 211B sur barres 204B (5 vis, chaînette de 5 maillons) le long de la semelle de la poutre, pattes des
  // vérins de bascule (détail B : barre 202B sous le HSS, goussets 203B, joues 101B).
  const sup = [];
  const lx = SUP.x[1] - SUP.x[0], sxm = (SUP.x[0] + SUP.x[1]) / 2;
  for (const s of [-1, 1]) {
    const hss = profil(api, rect(-SUP.w / 2, -SUP.h / 2, SUP.w / 2, SUP.h / 2), [rect(-SUP.w / 2 + 0.0064, -SUP.h / 2 + 0.0064, SUP.w / 2 - 0.0064, SUP.h / 2 - 0.0064).reverse()], lx);
    sup.push(at(group(hss), [sxm, SUP.top - SUP.h / 2, s * SUP.z], [0, Math.PI / 2, 0]));
    sup.push(at(box(lx - 0.002, 0.016, 0.038, 'red', { r: 0.002 }), [sxm, SUP.top + 0.008, s * (SUP.z - SUP.w / 2 + 0.019)]));
    for (const xc of [0.9495, 0.0085]) {
      sup.push(at(box(0.241, by0 + 0.016 - SUP.top, 0.076, 'red', { r: 0.003 }), [xc, (by0 + 0.016 + SUP.top) / 2, s * (SUP.z + SUP.w / 2 - 0.038)]));
      sup.push(at(box(0.241, 0.038, 0.114, 'red', { r: 0.004 }), [xc, by0 + 0.035, s * (BEAM.w / 2 + 0.001 + 0.057)]));
      sup.push(boltSet([-0.09, -0.045, 0, 0.045, 0.09].map((dx) => [xc + dx, by0 + 0.054, s * (BEAM.w / 2 + 0.058)]), 0.019, 0.09, 'steel'));
      sup.push(chainette([xc + (xc > 0.5 ? -0.115 : 0.115), by0 + 0.03, s * (BEAM.w / 2 + 0.118)], 5));
    }
    for (const px of PATTES) {
      sup.push(at(box(0.0635, 0.0127, 0.273, 'red', { r: 0.002 }), [px, SUP_BOT - 0.00635, s * 0.3865]));
      for (const dz of [-0.028, 0.028]) sup.push(at(profil(api, rect(px - 0.03175, SUP_BOT - 0.0127 - 0.0635, px + 0.03175, SUP_BOT - 0.0127), [[px, PATTE_Y, 0.0127]], 0.0127), [0, 0, s * (TILT.z + dz)]));
      for (const dx of [-0.025, 0.025]) {
        const g = profil(api, [[0, 0], [0, 0.065], [0.13, 0]], [], 0.0127);
        sup.push(at(group(g), [px + dx, SUP_BOT, s * (SUP.z + SUP.w / 2)], [0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0]));
      }
    }
  }
  for (const px of PIVOT.x) {
    sup.push(at(cyl(0.04445, 0.848, 'red', { axis: 'z', seg: 32 }), [px, PIVOT.y, 0]));
    for (const u of [-1, 1]) {
      const xe = px + u * (0.04445 + 0.0005 + 0.03175);
      sup.push(at(box(0.0635, 0.0127, 0.699, 'red', { r: 0.002 }), [xe, SUP_BOT - 0.00635, 0]));
      sup.push(at(box(0.0127, 0.0635, 0.699, 'red', { r: 0.002 }), [xe + u * 0.02540, SUP_BOT - 0.03175, 0]));
    }
  }
  sup.push(at(plate(0.33, 0.584, 0.019, 'red', { cutouts: [[0, 0, 0.25, 0.1]] }), [0.445, SUP_BOT - 0.0095, 0]));
  sup.push(at(box(0.137, 0.0127, 0.216, 'red', { r: 0.002 }), [0.8485, SUP_BOT + 0.00635, 0]));
  for (const dz of [-0.026, 0.026]) sup.push(at(profil(api, rect(DUMP.foot[0] - 0.0255, SUP_BOT + 0.0127, DUMP.foot[0] + 0.0255, SUP_BOT + 0.0127 + 0.054), [[...DUMP.foot, 0.0127]], 0.019), [0, 0, dz]));
  P('FBRA-002-600BB', group(sup), [0, -0.15, 0.5]);

  // 2 — Poutre d'avance (caisson ouvert) : semelle, deux flancs, glissières de la table, plaque d'extrémité.
  // La semelle est percée au passage des boyaux d'avance et de recul (côté −Z, entre les HSS du support d'avance).
  // Le caisson s'arrête contre la plaque d'extrémité (30 mm, face arrière en BEAM.x0).
  const bx0 = BEAM.x0, EP_T = 0.03, bx1 = BEAM.x1, bl = bx1 - bx0 - EP_T, bxc = (bx0 + EP_T + bx1) / 2;
  const beam = [];
  beam.push(at(plate(bl, BEAM.w, 0.016, 'red', { r: 0.004, cutouts: FEED_EXIT.map((x) => [x - bxc, FEED_Z, 0.045, 0.045]) }), [bxc, by0 + 0.008, 0]));
  for (const s of [-1, 1]) {
    beam.push(at(box(bl, BEAM.h - 0.03, 0.014, 'red', { r: 0.003 }), [bxc, by0 + BEAM.h / 2 - 0.005, s * (BEAM.w / 2 - 0.007)]));
    beam.push(at(box(bl, 0.03, 0.07, 'red', { r: 0.004 }), [bxc, BEAM.top - 0.015, s * (BEAM.w / 2 - 0.035)]));
    beam.push(at(box(bl - 0.2, 0.012, 0.05, 'darkSteel', { r: 0.002 }), [bxc + 0.05, BEAM.top + 0.006, s * (BEAM.w / 2 - 0.035)]));
    // Raidisseurs ajourés des flancs.
    for (let x = bx0 + 0.25; x < bx1 - 0.2; x += 0.45) beam.push(at(box(0.06, BEAM.h - 0.05, 0.02, 'red'), [x, by0 + BEAM.h / 2, s * (BEAM.w / 2 + 0.004)]));
  }
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
  const ROD_END = [bx0 + EP_T + 0.04, bx1 - 1.08]; // blocs des tiges
  const coude = (x, sx) => merged([
    at(cyl(0.013, 0.04, 'brass', { axis: 'z', seg: 14 }), [x, endY, -0.065]),
    at(nut(0.03, 0.01, 'brass', { axis: 'z' }), [x, endY, -0.055]),
    at(box(0.03, 0.03, 0.03, 'brass', { r: 0.006 }), [x, endY, FEED_Z]),
    at(cyl(0.013, 0.035, 'brass', { axis: 'x', seg: 14 }), [x + sx * 0.0175, endY, FEED_Z]),
  ], 'brass');
  P('UM-064-100Z', group(
    at(shell(0.06, 0.045, 1.2, 'black', { axis: 'x' }), [bx1 - 2.26, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [bx1 - 2.86, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [bx1 - 1.66, fcY, 0]),
    at(cyl(0.025, bx1 - 2.86 - ROD_END[0], 'chrome', { axis: 'x' }), [(ROD_END[0] + bx1 - 2.86) / 2, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [bx1 - 1.36, fcY, 0]),
    ...ROD_END.map((x) => at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [x, endY, 0])),
    coude(ROD_END[0], 1), coude(ROD_END[1], -1),
    // Patte du tube central sous la table : le tube entraîne la table, les tiges sont fixées aux bouts de la poutre.
    at(box(0.1, BEAM.top + 0.012 - fcY - 0.05, 0.06, 'black', { r: 0.006 }), [HEAD_X, (fcY + 0.05 + BEAM.top + 0.012) / 2, 0]),
  ), [0, -0.45, 0]);

  // 18 — Vérins de bascule FBRA-002-515ZZ (P019, page 1.01), un par côté au-dessus du longeron : vérin HBU-3010 noir,
  // fond en bloc à tube transversal sur la chape du longeron (axe UM-064-553D, épingle HP1000, graisseur Z125-S),
  // œil de tige dans les joues de la patte avant du support ; orifices dans le plan du vérin, côté haut. Bloc YEJ
  // gris sur l'orifice de la tige (2404-8-8, 6402-8-8), boulonné (B312-2500) sur le support FBRA-002-505Z que serrent
  // sur le fût les colliers J000228-2 et J000228-1 ; deux clapets d'équilibrage CBCA-LHN debout ; tube FBRA-002-507Z
  // du bloc (6801F-8-8) à l'orifice du fond (coude 2501F-08-08) ; deux 6801F-8-8 coudés vers le bas pour les boyaux.
  const angT = Math.atan2(TILT.d[1], TILT.d[0]);
  for (const s of [-1, 1]) {
    const z = s * TILT.z, rr = TILT.rodR;
    const W = (u, t, dz = 0) => [...TILT.pt(u, t), z + dz];
    const R = (obj, u, t, dz = 0) => at(obj, W(u, t, dz), [0, 0, angT]);
    const yejIn = z - s * 0.025; // face intérieure du bloc (50 mm de large, centré sur le vérin)
    const vc = group(
      at(group(hydCylinder(TILT.len, TILT.bore, { material: 'black', rodR: rr, ext: TILT.ext, eyes: 'none' })), [...TILT.a, z], [0, 0, angT]),
      R(box(0.05, 0.06, 0.036, 'black', { r: 0.004 }), 0.037, 0),
      at(ring(0.025, 0.0128, 0.036, 'black', { axis: 'z', seg: 24 }), [...TILT.foot, z]),
      at(cyl(0.0127, 0.09, 'steel', { axis: 'z', seg: 14 }), [...TILT.foot, z]),
      at(torus(0.012, 0.0018, 'steel', { axis: 'z' }), [TILT.foot[0], TILT.foot[1] - 0.012, z + s * 0.042]),
      R(cyl(0.004, 0.012, 'zinc', { seg: 8 }), 0.03, 0.034),
      at(ring(rr * 1.5, rr * 0.68, rr * 1.3, 'darkSteel', { axis: 'z', seg: 24 }), [...TILT.head, z]),
      R(nut(rr * 1.7, rr * 0.45, 'darkSteel', { axis: 'x' }), TILT.L - 0.9 * rr - rr * 0.95, 0),
      at(cyl(0.0127, 0.085, 'steel', { axis: 'z', seg: 14 }), [...TILT.head, z]),
    );
    const yej = group(
      R(box(2 * YEJ.hs, 2 * YEJ.ht, 0.05, 'grey', { r: 0.004 }), YEJ.s, YEJ.t),
      // Adaptateurs 2404-8-8 et 6402-8-8 de l'orifice de la tige au dessous du bloc.
      rod([...TILT.pt(0.3905, 0.064), z], [...TILT.pt(YEJ.s + 0.03, YEJ.t - YEJ.ht), z], 0.009, 'brass', 12),
      // Clapets d'équilibrage CBCA-LHN debout sur le bloc.
      ...[YEJ.s - 0.025, YEJ.s + 0.025].flatMap((u) => [
        R(nut(0.024, 0.012, 'steel'), u, YEJ.t + YEJ.ht + 0.006),
        R(cyl(0.0105, 0.06, 'darkSteel', { seg: 14 }), u, YEJ.t + YEJ.ht + 0.042),
      ]),
      // Support FBRA-002-505Z (tôle rouge à boutonnières) sur la face extérieure du bloc, vis B312-2500 et écrous NFC375.
      R(box(0.12, 0.105, 0.005, 'red', { r: 0.002 }), YEJ.s, 0.0925, s * 0.0275),
      ...[YEJ.s - 0.03, YEJ.s + 0.03].map((u) => R(bolt(0.0079, 0.065, 'steel', { axis: s > 0 ? 'z' : '-z', washer: true }), u, YEJ.t + 0.015, s * 0.03)),
      ...[YEJ.s - 0.03, YEJ.s + 0.03].map((u) => R(nut(0.0143, 0.008, 'steel', { axis: 'z' }), u, YEJ.t + 0.015, -s * 0.029)),
      // Colliers J000228-2 (étrier) et J000228-1 sur le fût.
      at(torus(0.05, 0.004, 'zinc', { axis: 'x' }), W(YEJ.s - 0.075, 0), [0, 0, angT]),
      at(ring(0.0505, 0.0452, 0.016, 'black', { axis: 'x', seg: 32 }), W(YEJ.s - 0.02, 0), [0, 0, angT]),
      // Raccords 6801F-8-8 : un vers le tube (face arrière du bloc), deux coudés vers le bas (face intérieure).
      R(cyl(0.008, 0.014, 'brass', { axis: 'x', seg: 12 }), YEJ.s - YEJ.hs - 0.007, YEJ.t),
      ...yejPorts(s).flatMap(([x, y]) => [
        at(cyl(0.008, 0.02, 'brass', { axis: 'z', seg: 12 }), [x, y + 0.03, yejIn - s * 0.01]),
        at(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), [x, y + 0.03, z - s * 0.05]),
        at(cyl(0.008, 0.024, 'brass', { seg: 12 }), [x, y + 0.012, z - s * 0.05]),
      ]),
      // Coude 2501F-08-08 sur l'orifice du fond et tube FBRA-002-507Z le long du fût.
      R(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), 0.10725, 0.074),
      R(cyl(0.007, 0.022, 'brass', { axis: 'x', seg: 12 }), 0.124, 0.074),
      tube([[0.135, 0.074], [0.17, 0.076], [0.22, 0.08], [0.25, 0.098], [0.27, 0.115], [YEJ.s - YEJ.hs - 0.014, YEJ.t]].map(([u, t]) => W(u, t)), 0.006, 'steel', { seg: 40 }),
    );
    P('FBRA-002-515ZZ', group(vc, yej), [0, 0, s * 0.45]);
  }

  // 12 — Vérin de relevage UM-064-300Z (HBU 2536, P019) : couché entre les HSS du support, fond (axe UM-064-550D) sur les
  // chapes 213B, tige 0,885 m au-delà du bout du cadre jusqu'à la patte sous la poutre (axe UM-064-575D, épingles
  // HP1000) : il fait coulisser la poutre dans le support. Orifices vers +Z ; bloc YEJ côté fond (2404-8-8, 6402-8-8),
  // deux clapets CBCA-LHN, trois 6801F-8-8 (deux coudés vers le bas pour les boyaux, un vers l'orifice de la tige,
  // coude 2501F-08-08).
  {
    const { a, b, bore, rodR, ext } = DUMP, r = bore / 2, len = DUMP.len;
    const c = hydCylinder(len, bore, { material: 'black', rodR, ext, eyes: 'none' });
    c.rotation.x = Math.PI / 2;
    const ey = DUMP.foot[1], Y = DUMP_YEJ, yx = (Y.x[0] + Y.x[1]) / 2, yz = (Y.z[0] + Y.z[1]) / 2;
    const [pf, pt] = cylPortsZ(a, b, bore, ext, 1); // orifices du fond et de la tige
    const vd = group(
      at(group(c), [a[0], a[1], 0], [0, 0, Math.PI]),
      at(ring(r * 0.75, r * 0.34, r * 0.7, 'black', { axis: 'z', seg: 28 }), [...DUMP.foot, 0]),
      at(ring(rodR * 1.5, rodR * 0.71, rodR * 1.3, 'darkSteel', { axis: 'z', seg: 24 }), [...DUMP.head, 0]),
      at(nut(rodR * 1.7, rodR * 0.45, 'darkSteel', { axis: 'x' }), [DUMP.head[0] + 0.9 * rodR + 0.95 * rodR, ey, 0]),
      at(cyl(0.0127, 0.085, 'steel', { axis: 'z', seg: 14 }), [...DUMP.foot, 0]),
      at(cyl(0.0127, 0.062, 'steel', { axis: 'z', seg: 14 }), [...DUMP.head, 0]),
      ...[[DUMP.foot, 0.04], [DUMP.head, 0.028]].map(([p, dz]) => at(torus(0.012, 0.0018, 'steel', { axis: 'z' }), [p[0], p[1] - 0.012, dz])),
      // Patte à chape sous la semelle de la poutre.
      at(box(0.08, 0.01, 0.06, 'red', { r: 0.002 }), [DUMP.head[0], by0 - 0.005, 0]),
      ...[-1, 1].map((u) => at(box(0.05, by0 - 0.01 - (ey - 0.022), 0.008, 'red', { r: 0.002 }), [DUMP.head[0], (by0 - 0.01 + ey - 0.022) / 2, u * 0.019])),
    );
    const yej = group(
      at(box(Y.x[1] - Y.x[0], Y.y[1] - Y.y[0], Y.z[1] - Y.z[0], 'grey', { r: 0.004 }), [yx, ey, yz]),
      at(cyl(0.009, Y.z[0] - pf[2] + 0.002, 'brass', { axis: 'z', seg: 12 }), [pf[0], ey, (Y.z[0] + pf[2]) / 2]),
      ...Y.ports.flatMap((x) => [
        at(nut(0.024, 0.012, 'steel', { axis: 'z' }), [x, ey, Y.z[1] + 0.006]),
        at(cyl(0.0105, 0.055, 'darkSteel', { axis: 'z', seg: 14 }), [x, ey, Y.z[1] + 0.0395]),
        at(cyl(0.008, 0.027, 'brass', { seg: 12 }), [x, Y.y[0] - 0.0135, yz]),
        at(nut(0.02, 0.008, 'brass'), [x, Y.y[0] - 0.006, yz]),
      ]),
      at(cyl(0.008, 0.027, 'brass', { axis: 'x', seg: 12 }), [Y.x[0] - 0.0135, ey, yz]),
      // Coude 2501F-08-08 sur l'orifice de la tige, tourné vers le fond.
      at(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), [pt[0], ey, 0.065]),
      at(cyl(0.007, 0.022, 'brass', { axis: 'x', seg: 12 }), [pt[0] + 0.019, ey, 0.065]),
    );
    P('UM-064-300Z', group(vd, yej), [0, -0.3, 0]);
  }

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

  // 4 — Treuil de câble 10 000 pi (P042) sur l'arrière du traîneau, capot en position haute.
  P('FBRA-002-400HH', at(api.sub('P042', { capot: WINCH.capot, guide: WINCH.guide, cable: false }), [WINCH.x, WINCH.y, 0]), [-0.2, 0.5, 0]);
  // Câble du treuil (tambour → guide-câble → poulie double → rouleau du guide de tiges) et son embout serti.
  api.add(group(
    tube(wire.pts, 0.004, 'darkSteel', { seg: wire.pts.length, tension: 0.5 }),
    at(cyl(0.007, 0.016, 'darkSteel', { axis: 'y', seg: 12 }), [wire.tip[0], wire.tip[1] - 0.008, 0]),
  ));

  // Boyaux de la foreuse, des sélecteurs DF10 aux appareils (les raccords sont décrits avec leurs pièces).
  const [l0, l1] = [0, 1].map((k) => dfZ(-1, k)), [r0, r1] = [0, 1].map((k) => dfZ(1, k));
  const back = DF.x - DF.hx - 0.03; // bout des raccords arrière des sélecteurs
  // Vérin d'avance (vannes à bille du sélecteur gauche) : du coude de chaque tige, le long du flanc −Z à l'intérieur de
  // la poutre, sortie par la semelle entre les HSS du support, puis vers l'avant sous le support jusqu'au-dessus des
  // vannes. Recul (tige arrière) sur la vanne intérieure, avance (tige avant) sur la vanne extérieure.
  const feedRecul = hose([[ROD_END[0] + 0.035, endY, FEED_Z], [ROD_END[0] + 0.12, endY, FEED_Z], [bx1 - 2.76, endY - 0.012, FEED_Z], [bx1 - 2.46, endY - 0.025, FEED_Z],
    [-0.1, by0 + 0.075, FEED_Z], [0.1, by0 + 0.05, FEED_Z], [FEED_EXIT[0], by0 + 0.025, FEED_Z], [FEED_EXIT[0], by0 - 0.055, FEED_Z - 0.005], [0.182, 0.56, -0.13],
    [0.2, 0.46, -0.19], [0.28, 0.41, -0.23], [0.45, 0.4, l0], [0.7, 0.4, l0], [0.79, 0.395, l0], [DF.x, 0.35, l0], [DF.x, BKH_TOP + 0.012, l0], [DF.x, BKH_TOP, l0]], 0.014);
  const feedAvance = hose([[ROD_END[1] - 0.035, endY, FEED_Z], [ROD_END[1] - 0.07, endY - 0.01, FEED_Z], [FEED_EXIT[1] + 0.025, by0 + 0.05, FEED_Z], [FEED_EXIT[1], by0 + 0.025, FEED_Z],
    [FEED_EXIT[1], by0 - 0.055, FEED_Z - 0.005], [0.252, 0.56, -0.16], [0.27, 0.47, -0.25], [0.32, 0.37, -0.3], [0.45, 0.35, l1], [0.7, 0.35, l1], [0.79, 0.345, l1],
    [DF.x, 0.32, l1], [DF.x, BKH_TOP + 0.012, l1], [DF.x, BKH_TOP, l1]], 0.014);
  // Moteur White du treuil (raccords 6400-12-12 sur le dessus) : au-dessus du moteur, vers l'avant par-dessus les
  // montants du bâti, le long du longeron gauche sous les bras des poteaux arrière, sur le caisson, jusqu'aux raccords
  // arrière du sélecteur gauche.
  const [mB, mA] = MOTOR_PORTS.map(([x, y, z]) => [WINCH.x + x, WINCH.y + y, z]); // orifice arrière, orifice avant
  const motorHoses = [
    hose([mA, [mA[0], mA[1] + 0.03, mA[2]], [mA[0] + 0.008, 0.385, -0.205], [-0.75, 0.37, -0.205], [-0.55, 0.33, -0.205], [-0.35, 0.235, -0.205], [-0.1, 0.175, -0.205],
      [0.3, 0.165, -0.205], [0.62, 0.165, -0.215], [0.72, 0.162, l0], [back, DF_MID, l0]], 0.014),
    hose([mB, [mB[0], mB[1] + 0.03, mB[2]], [mB[0] + 0.005, 0.4, -0.22], [mB[0] + 0.05, 0.44, -0.255], [-0.75, 0.42, -0.255], [-0.55, 0.36, -0.255], [-0.35, 0.265, -0.255],
      [-0.1, 0.185, -0.255], [0.3, 0.175, -0.26], [0.62, 0.17, -0.285], [0.72, 0.162, l1], [back, DF_MID, l1]], 0.014),
  ];
  // Vérins de bascule (sélecteur droit) : raccord extérieur du dessus → bloc YEJ droit, raccord intérieur → bloc YEJ
  // gauche (par-dessus le sélecteur gauche) ; le second raccord de chaque bloc relie les deux vérins sous le support.
  const [yr0, yr1] = yejPorts(1), [yl0, yl1] = yejPorts(-1);
  const tiltHoses = [
    hose([[DF.x, DF_TOP, r1], [DF.x, DF_TOP + 0.03, r1], [0.81, 0.31, 0.31], [0.7, 0.37, 0.35], [0.63, 0.4, 0.385], [yr0[0], yr0[1] - 0.04, yr0[2]], yr0], 0.012),
    hose([[DF.x, DF_TOP, r0], [DF.x, DF_TOP + 0.03, r0], [0.835, 0.36, 0.21], [0.825, 0.465, 0.1], [0.8, 0.47, -0.1], [0.74, 0.47, -0.28], [0.65, 0.44, -0.38],
      [yl0[0], yl0[1] - 0.04, yl0[2]], yl0], 0.012),
    hose([yr1, [yr1[0] + 0.002, yr1[1] - 0.035, 0.4], [0.64, 0.465, 0.32], [0.645, 0.47, 0], [0.64, 0.465, -0.32], [yl1[0] + 0.002, yl1[1] - 0.035, -0.4], yl1], 0.012),
  ];
  // Vérin de relevage (sélecteur droit) : raccords arrière → dessous du bloc YEJ ; orifice de la tige → bloc YEJ.
  const ey = DUMP.foot[1], [px0, px1] = DUMP_YEJ.ports, pyz = (DUMP_YEJ.z[0] + DUMP_YEJ.z[1]) / 2, py = DUMP_YEJ.y[0] - 0.027;
  const dumpHoses = [
    hose([[px0, py, pyz], [px0, py - 0.035, pyz], [px0 - 0.012, 0.45, 0.13], [px0 - 0.02, 0.28, 0.2], [0.7, 0.19, r0], [0.73, 0.163, r0], [back, DF_MID, r0]], 0.012),
    hose([[px1, py, pyz], [px1, py - 0.035, pyz + 0.005], [px1 - 0.022, 0.45, 0.18], [px1 - 0.04, 0.3, 0.27], [0.7, 0.2, r1], [0.73, 0.163, r1], [back, DF_MID, r1]], 0.012),
    hose([[0.132, ey, 0.065], [0.2, ey, 0.068], [0.45, ey, 0.08], [DUMP_YEJ.x[0] - 0.06, ey, pyz], [DUMP_YEJ.x[0] - 0.027, ey, pyz]], 0.012),
  ];
  api.add(group(feedRecul, feedAvance, ...motorHoses, ...tiltHoses, ...dumpHoses));
  return { view: { dir: [0.75, 0.5, 1.0] } };
}
