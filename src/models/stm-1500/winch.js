// P042 — Treuil de câble 10 000 pi (3 048 m) UM-032-100A (section 8 du manuel :
// couverture P037, cotes 8.0, étapes 8.1 à 8.4, réglage des bras P043/P044).
// Bâti UM-032-101A en tubes 2 × 4 po (813 × 699 mm) : longerons supérieurs
// débordants (appui sur les longerons du traîneau), plaques d'appui des deux
// paliers à semelle HCPE211-32, montants avant (support du moteur), barre et
// axes des bras. Tambour UM-032-102A à flasques Ø 490 mm sur arbre Ø 2 po,
// câble enroulé (couche extérieure visible entre les flasques). Transmission
// par chaîne 80 (50 po) : moteur hydraulique White RE12 (noir) sur son support
// UM-041-208F, pignon 80B14, pignon 80B28 sur l'arbre du tambour, carter
// UM-032-104B. Cadre pivotant autour de l'axe du tambour sur les supports
// UM-032-131FB (étape 3, page 8.3) : capot arrière UM-032-105A (flancs, tôle de
// dessus percée au droit du graisseur, paroi arrière, fond, bande des
// charnières) portant la vis-mère 10 000 pi sur deux paliers PFL206 et le
// guide-câble UM-041-014F (bloc à goupille dans la double hélice, cadre à
// quatre rouleaux), capot avant UM-032-108A à charnières (logo UM ajouré,
// ouverture de contrôle du câble), bras réglables 115F/116F. Chaîne 35 (46 1/2 po, étape
// 2) du tambour à la vis-mère (35B11 → 35B70) sous le carter UM-032-103A,
// volant à ressort (étape 1). Côté −Z : transmissions, carters et volant, comme
// sur la foreuse (page 1.01). Les listes valent pour les versions gauche et
// droite (UM-032-100A_L et _R) : une machine porte un seul tambour, une seule
// transmission et un seul moteur (quantités dessinées : qty3d dans data.json).
// Le cadre « option underground » de la page 8.0 (hors liste) n'est pas monté.
// Repère : origine au sol sous le centre du bâti, X vers l'avant (moteur,
// montants), Y vers le haut, Z le long de l'axe du tambour. Options : capot
// (angle de la vis-mère au-dessus de l'horizontale, vers l'arrière, en degrés ;
// 42° = position haute de la page 8.0, 642 mm), guide (position du guide-câble
// le long de la vis, Z ; 0 = au milieu, sous le trou de graissage, comme à la
// page 8.0), cable (false : sans le bout de câble sorti du guide,
// la foreuse trace le câble jusqu'à la poulie double).
import { lister, each } from './layout.js';

// Bâti (page 8.0) : longueur 813, largeur 699 ; tubes du bas 2 × 4 po ; longerons supérieurs
// 3 1/2 × 2 1/2 po débordant vers l'extérieur (Z 301 à 389 mm), jusqu'à 297 mm devant le centre.
export const BASE = { L: 0.813, W: 0.699, h: 0.1016, t: 0.0508, upH: 0.0635, upZ: [0.301, 0.389], upX1: 0.297 };
export const UP_TOP = BASE.h + BASE.upH; // dessus des longerons supérieurs (appui sur le traîneau)
export const AXE = [-0.1415, 0.2475]; // axe du tambour : 548 mm de l'avant, 247 mm du sol (page 8.0)
export const R_PACK = 0.2, R_CABLE = 0.004; // axe du câble de la couche extérieure ; câble Ø 8 mm
export const CAPOT_HAUT = 42; // position haute de la page 8.0 (642 mm hors tout)
export const PAD = 0.184; // dessus des plaques d'appui des paliers (crapauds arrière de la foreuse)
const FL = { r: 0.245, t: 0.025, z: [-0.208, 0.263] }; // flasques Ø 490, faces intérieures
const R_FUT = 0.089; // fût Ø 7 po
const VIS = 0.39; // entraxe tambour → vis-mère (chaîne 35 de 46 1/2 po, pages 8.0 et 1.01)
const MOT = [0.22, 0.161]; // axe du moteur White (vues de dessus et de face, page 8.0)
// Bouts des raccords 6400-12-12 (dessus du bloc des orifices du moteur, sortie +Y) : branchement des boyaux.
export const MOTOR_PORTS = [0.2, 0.245].map((x) => [x, MOT[1] + 0.104, -0.1955]);
const Z80 = -0.274; // plan de la chaîne 80, dans le carter 104B
const Z35 = -0.449; // plan de la chaîne 35, dans le carter 103A
const ZP = 0.347; // paliers HCPE211-32
const Z131 = [0.38, 0.392]; // supports pivotants 131FB
const R_MOYEU = 0.0381; // alésage Ø 3 po du moyeu des 131FB (bague 236F, anneau intérieur SPN-R3000)
const Z105 = [0.393, 0.405]; // flancs du capot arrière
const Z103 = [-0.425, -0.473]; // carter de la chaîne 35
const POST = { x: [0.304, 0.355], z: [0.247, 0.298], h: 0.228 }; // montants avant
const PIV = [0.155, 0.188]; // axe bas des bras (sur le bâti)
const BAR = [0.115, 0.19]; // barre transversale à goupilles (oreilles sur les longerons supérieurs)
const ARM_TOP = [0.286, 0.15]; // axe haut des bras (cadre pivotant)
const ARM_L = 0.36; // longueur du bras supérieur 116F (trou de réglage à 0,33 de l'axe haut)
// Bras inférieur 115F (page 8.3, détail B) : dix trous de réglage au pas de 1 po, du n° 10 (64 mm de l'axe bas)
// au n° 1 (293 mm) ; longueur propre au 115F.
const L_115F = 0.32;
const TROUS_115F = Array.from({ length: 10 }, (_, k) => 0.0638 + k * 0.0254); // distance à l'axe bas
// Repère « position haute » (capot à CAPOT_HAUT) : origine sur l'axe de la vis-mère, X vers l'avant, Y vers
// le haut. La tôle de dessus du capot arrière et le guide-câble y sont dessinés, puis tournent avec le cadre.
const H0 = (CAPOT_HAUT * Math.PI) / 180;
/** Point (x, y) du repère « position haute » → point (a, b) du cadre pivotant. */
const fromHaut = ([x, y]) => [VIS - x * Math.cos(H0) + y * Math.sin(H0), x * Math.sin(H0) + y * Math.cos(H0)];
// Tôle de dessus du capot arrière (page 8.0, vue de dessus) : horizontale en position haute, de 495 à 376 mm
// derrière le centre du bâti, dessus à 584 mm (sous le rebord du capot avant, vue de face), 5 mm.
const TOLE = { x: [-0.064, 0.055], y: 0.0755, t: 0.005 };
// Guide-câble UM-041-014F (repère « position haute ») : semelle du cadre à rouleaux posée sur le dessus du bloc
// (lumière au passage du câble) ; dessus, devant le bord de la tôle, deux joues triangulaires portant les
// rouleaux d'axe Z (page 8.0, vues de côté, de face et de dessus) : rouleau d'enroulement au sommet, côté bloc
// (642 mm hors tout), rouleau de retenue au pied, en avant ; rayon des rouleaux.
const SEMELLE = { x: [-0.035, 0.142], y: [0.035, 0.045], z: 0.05 };
const ROUL_HAUT = { enroulement: [0.081, 0.1155], retenue: [0.116, 0.0765], r: 0.018 };
const ROLL_IN = fromHaut(ROUL_HAUT.enroulement); // (a, b) du cadre pivotant
const ROLL_OUT = fromHaut(ROUL_HAUT.retenue);
// Rouleaux d'axe X du guide-câble (repère « position haute ») : sous la semelle, à l'entrée du câble qui monte du
// tambour (le capot pivote autour de l'axe du tambour : ce brin est fixe dans le cadre), de part et d'autre du
// câble ; joues de dessous (paliers) à ± half.
const VR = { x: 0.0964, y: -0.008, half: 0.036 };

const rad = (deg) => (deg * Math.PI) / 180;
function options(opts = {}) {
  return { capot: opts.capot ?? CAPOT_HAUT, th: rad(opts.capot ?? CAPOT_HAUT), zg: opts.guide ?? 0 };
}

/** Point (a, b) du cadre pivotant → repère du treuil, pour un angle th (rad) de la vis-mère. */
export function cadre(th, a, b) {
  const c = Math.cos(th), s = Math.sin(th);
  return [AXE[0] - a * c + b * s, AXE[1] + a * s + b * c];
}

/**
 * Passage du câble (repère du treuil, plan XY) pour un angle de capot donné (degrés) : couche
 * extérieure du tambour (cercle, enroulement horaire vu de +Z), rouleau de retenue du guide-câble (le
 * câble passe derrière, sens horaire), rouleau d'enroulement (le câble l'enveloppe dans le sens
 * trigonométrique avant de partir vers l'arrière), direction nominale de sortie (horizontale vers
 * l'arrière en position haute, elle tourne avec le capot).
 */
export function guideCable(capot = CAPOT_HAUT) {
  const d = H0 - rad(capot);
  return {
    pack: AXE.slice(), rPack: R_PACK, retenue: cadre(rad(capot), ...ROLL_OUT), roller: cadre(rad(capot), ...ROLL_IN),
    rRoller: ROUL_HAUT.r + R_CABLE, out: [-Math.cos(d), -Math.sin(d)],
  };
}

/**
 * Câble du tambour jusqu'au départ du rouleau d'enroulement (repère du treuil, plan XY), tangent au
 * cercle suivant (centre c, rayon r, sens s ; r = 0 et s = 0 pour un point) : renvoie les points et le
 * point de tangence q sur le cercle suivant.
 */
export function cableGuide(capot, c, r, s) {
  const g = guideCable(capot);
  const t1 = tangente(g.pack, g.rPack, -1, g.retenue, g.rRoller, -1); // couche extérieure → derrière la retenue
  const t2 = tangente(g.retenue, g.rRoller, -1, g.roller, g.rRoller, 1); // retenue → rouleau d'enroulement
  const t3 = tangente(g.roller, g.rRoller, 1, c, r, s);
  return {
    pts: [t1.p, ...arcPts(g.retenue, g.rRoller, t1.q, t2.p, -1, 0.004), ...arcPts(g.roller, g.rRoller, t2.q, t3.p, 1, 0.004)],
    q: t3.q,
  };
}

/**
 * Tangente commune au trajet d'un câble ou d'une chaîne qui va du cercle A au cercle B (plan XY) ;
 * sa, sb : sens d'enroulement sur chaque cercle (+1 trigonométrique, −1 horaire, 0 pour un point).
 * Renvoie les points de tangence p (sur A) et q (sur B).
 */
export function tangente(A, ra, sa, B, rb, sb) {
  const dx = B[0] - A[0], dy = B[1] - A[1], D = Math.hypot(dx, dy);
  const g = Math.atan2(dy, dx) - Math.asin((sb * rb - sa * ra) / D);
  const L = [-Math.sin(g), Math.cos(g)];
  return { p: [A[0] - sa * ra * L[0], A[1] - sa * ra * L[1]], q: [B[0] - sb * rb * L[0], B[1] - sb * rb * L[1]] };
}

/** Arc du cercle (c, r) de p0 à p1 dans le sens s (+1 trigo, −1 horaire), pas d'environ step. */
export function arcPts(c, r, p0, p1, s, step = 0.01) {
  const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
  let a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
  if (s > 0) { while (a1 < a0) a1 += 2 * Math.PI; } else { while (a1 > a0) a1 -= 2 * Math.PI; }
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / step));
  const out = [];
  for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return out;
}

/** Boucle fermée d'une chaîne sur deux pignons (rayons primitifs), sens trigonométrique, plan z. */
function chainLoop(A, ra, B, rb, z) {
  const t1 = tangente(A, ra, 1, B, rb, 1), t2 = tangente(B, rb, 1, A, ra, 1);
  const pts = [...arcPts(A, ra, t2.q, t1.p, 1, 0.006), ...arcPts(B, rb, t1.q, t2.p, 1, 0.006).slice(0, -1)];
  return pts.map(([x, y]) => [x, y, z]);
}

/** Enveloppe convexe (chaîne monotone) d'une liste de points 2D. */
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
export const circle = (c, r, n = 28) => Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos((k / n) * 2 * Math.PI), c[1] + r * Math.sin((k / n) * 2 * Math.PI)]);
/** Contour décalé vers l'intérieur (polygone convexe) : chaque sommet recule de d le long de sa bissectrice. */
function inset(poly, d) {
  const c = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
  return poly.map(([x, y]) => { const l = Math.hypot(x - c[0], y - c[1]); return [x - ((x - c[0]) / l) * d, y - ((y - c[1]) / l) * d]; });
}

/** Outils communs des builders : pose dans le cadre pivotant, carters creux, barres. */
function kit(api, th) {
  const S = api.S, T = api.THREE;
  return {
    // Objets modelés dans le plan du cadre en coordonnées (a, −b, z) → posés autour de l'axe du tambour.
    frame(...objs) {
      const g = S.group(...objs);
      g.position.set(AXE[0], AXE[1], 0);
      g.rotation.z = Math.PI - th;
      return g;
    },
    // Objets dessinés dans le repère « position haute » (axe de la vis-mère) → plan du cadre (à passer à frame).
    haut(...objs) {
      const g = S.group(...objs);
      g.position.set(VIS, 0, 0);
      g.rotation.z = H0 - Math.PI;
      return g;
    },
    // Tôle extrudée dans le plan local XY (épaisseur selon Z) à partir d'un contour et de trous polygonaux.
    sheet(outline, holes, depth, mat, z) {
      const sh = new T.Shape(outline.map(([x, y]) => new T.Vector2(x, y)));
      for (const h of holes) {
        if (h.length === 3 && !Array.isArray(h[0])) { const p = new T.Path(); p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true); sh.holes.push(p); } else sh.holes.push(new T.Path(h.map(([x, y]) => new T.Vector2(x, y))));
      }
      const geo = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 24 });
      geo.translate(0, 0, z - depth / 2);
      return S.merged([new T.Mesh(geo)], mat);
    },
    // Barre plate de a à b (plan XY), largeur w, épaisseur t, bouts arrondis, trous [distance depuis a].
    bar(a, b, w, t, z, mat, holes = [], rh = 0.0065) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const out = [...circle([0, 0], w / 2, 24).filter(([x]) => x <= 0), ...circle([L, 0], w / 2, 24).filter(([x]) => x >= L)];
      out.sort((p, q) => Math.atan2(p[1], p[0] - L / 2) - Math.atan2(q[1], q[0] - L / 2));
      const m = this.sheet(out, holes.map((d) => [d, 0, rh]), t, mat, 0);
      const g = S.group(m);
      g.position.set(a[0], a[1], z);
      g.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return g;
    },
    // Bande de tôle (plan du cadre) de p à q, épaisseur t, largeur selon Z de z0 à z1.
    strip(p, q, t, z0, z1, mat = 'red') {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const m = S.box(L, t, z1 - z0, mat, { r: 0.002 });
      m.position.set((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (z0 + z1) / 2);
      m.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]);
      return m;
    },
    // Carter creux : deux tôles (contour, trous) et une ceinture (sauf ceinture = false : chants ouverts),
    // de z0 à z1 (z0 > z1 ou non).
    guard(outline, holesIn, holesOut, z0, z1, mat = 'red', t = 0.004, ceinture = true) {
      const lo = Math.min(z0, z1), hi = Math.max(z0, z1), s = Math.sign(z1 - z0) || 1;
      return S.group(
        this.sheet(outline, holesIn, t, mat, z0 + (s * t) / 2),
        this.sheet(outline, holesOut, t, mat, z1 - (s * t) / 2),
        ...(ceinture ? [this.sheet(outline, [inset(outline, t)], hi - lo - 2 * t, mat, (lo + hi) / 2)] : []),
      );
    },
  };
}

// ------------------------------------------------------------------ étape 4 : treuil complet

export function P042(api, opts = {}) {
  const { box, cyl, ring, lathe, gear, tube, bolt, washer, nut, group, at, merged } = api.S;
  const P = lister(api, 'P042');
  const o = options(opts);
  const K = kit(api, o.th);
  const { L, W, h, t } = BASE;

  // 8 — Bâti UM-032-101A : cadre du bas (deux tubes de côté, traverses avant et arrière percées de six
  // trous pour le cadre « underground »), longerons supérieurs débordants, plaques d'appui des paliers,
  // montants avant, barre transversale à goupilles et axes bas des bras (entretoises hexagonales).
  const frame = [];
  for (const s of [-1, 1]) {
    frame.push(at(box(L, h, t, 'red', { r: 0.005 }), [0, h / 2, s * (W / 2 - t / 2)]));
    frame.push(at(box(t, h, W - 2 * t, 'red', { r: 0.005 }), [s * (L / 2 - t / 2), h / 2, 0]));
    const zc = s * (BASE.upZ[0] + BASE.upZ[1]) / 2, uw = BASE.upZ[1] - BASE.upZ[0];
    frame.push(at(box(BASE.upX1 + L / 2, BASE.upH, uw, 'red', { r: 0.005 }), [(BASE.upX1 - L / 2) / 2, h + BASE.upH / 2, zc]));
    frame.push(at(box(0.4265, PAD - UP_TOP, uw, 'red', { r: 0.003 }), [-L / 2 + 0.4265 / 2, (UP_TOP + PAD) / 2, zc]));
    frame.push(at(box(POST.x[1] - POST.x[0], POST.h, POST.z[1] - POST.z[0], 'red', { r: 0.004 }), [(POST.x[0] + POST.x[1]) / 2, POST.h / 2, s * (POST.z[0] + POST.z[1]) / 2]));
    // Oreilles de la barre (bord intérieur des longerons supérieurs) et des axes bas des bras (face extérieure).
    frame.push(at(box(0.04, 0.05, 0.008, 'red', { r: 0.002 }), [BAR[0], UP_TOP + 0.022, s * 0.305]));
    frame.push(at(box(0.06, 0.09, 0.008, 'red', { r: 0.003 }), [PIV[0], 0.16, s * 0.393]));
    frame.push(at(cyl(0.0063, 0.045, 'steel', { axis: 'z', seg: 14 }), [PIV[0], PIV[1], s * 0.4115]));
    frame.push(at(cyl(0.013, 0.018, 'darkSteel', { axis: 'z', seg: 6 }), [PIV[0], PIV[1], s * 0.406]));
    frame.push(at(api.S.torus(0.008, 0.0015, 'steel', { axis: 'x' }), [BAR[0], BAR[1], s * 0.322]));
  }
  frame.push(at(cyl(0.009, 0.66, 'black', { axis: 'z', seg: 14 }), [BAR[0], BAR[1], 0]));
  for (const y of [0.026, 0.074]) for (const z of [-0.2, 0, 0.2]) frame.push(at(ring(0.016, 0.009, 0.004, 'darkSteel', { axis: 'x', seg: 20 }), [L / 2 + 0.0015, y, z]));
  P('UM-032-101A', group(frame), [0, -0.25, 0]);

  // 9 — Tambour UM-032-102A : fût, flasques, arbre Ø 2 po ; câble de la couche extérieure (spires
  // jointives, Ø 8 mm) entre les flasques.
  const zm = (FL.z[0] + FL.z[1]) / 2, wz = FL.z[1] - FL.z[0];
  const prof = [[R_FUT + 0.002, FL.z[0]]];
  const nWr = Math.floor(wz / (2 * R_CABLE));
  for (let k = 0; k <= nWr; k++) {
    const z = FL.z[0] + (k * wz) / nWr;
    prof.push([R_PACK + R_CABLE * 0.15, z]);
    if (k < nWr) prof.push([R_PACK + R_CABLE, z + wz / nWr / 2]);
  }
  prof.push([R_FUT + 0.002, FL.z[1]]);
  const drum = group(
    at(cyl(R_FUT, wz, 'red', { axis: 'z', seg: 40 }), [0, 0, zm]),
    ...[FL.z[0] - FL.t / 2, FL.z[1] + FL.t / 2].map((z) => at(lathe([[0.0256, -FL.t / 2], [FL.r - 0.004, -FL.t / 2], [FL.r, -FL.t / 2 + 0.004], [FL.r, FL.t / 2 - 0.004], [FL.r - 0.004, FL.t / 2], [0.0256, FL.t / 2]], 'red', { axis: 'z', seg: 64 }), [0, 0, z])),
    ...[FL.z[0] - FL.t, FL.z[1] + FL.t].map((z) => at(ring(0.06, 0.0256, 0.012, 'red', { axis: 'z', seg: 28 }), [0, 0, z + Math.sign(z) * 0.006])),
    at(cyl(0.0254, 0.83, 'steel', { axis: 'z', seg: 24 }), [0, 0, 0]),
    at(lathe(prof, 'darkSteel', { axis: 'z', seg: 72 }), [0, 0, 0]),
  );
  P('UM-032-102A', at(drum, [AXE[0], AXE[1], 0]), [0, 0.35, 0]);

  // 7 — Paliers à semelle HCPE211-32 sur les plaques d'appui ; 4, 6 — boulons 1/2 po et rondelles.
  for (const s of [-1, 1]) {
    const z = s * ZP;
    P('HCPE211-32', group(
      at(box(0.22, 0.022, 0.05, 'castIron', { r: 0.005 }), [AXE[0], PAD + 0.011, z]),
      at(box(0.11, 0.04, 0.05, 'castIron', { r: 0.008 }), [AXE[0], PAD + 0.042, z]),
      at(ring(0.063, 0.03, 0.06, 'castIron', { axis: 'z', seg: 32 }), [AXE[0], AXE[1], z]),
      at(ring(0.031, 0.0255, 0.064, 'steel', { axis: 'z', seg: 28 }), [AXE[0], AXE[1], z]),
      at(ring(0.04, 0.0255, 0.014, 'steel', { axis: 'z', seg: 28 }), [AXE[0], AXE[1], s * 0.31]),
      at(cyl(0.004, 0.012, 'zinc', { axis: 'y', seg: 8 }), [AXE[0], AXE[1] + 0.07, z]),
    ), [0, 0.12, s * 0.25]);
    each(P, 'B500-1750', [-1, 1].map((u) => at(bolt(0.0127, 0.044, 'steel'), [AXE[0] + u * 0.085, PAD + 0.025, z])), [0, 0.3, s * 0.25]);
    each(P, 'F436-500', [-1, 1].map((u) => at(washer(0.017, 0.007, 0.003), [AXE[0] + u * 0.085, PAD + 0.0235, z])), [0, 0.26, s * 0.25]);
  }

  // 13 — Supports pivotants UM-032-131FB : flasque triangulaire posée sur la plaque d'appui, moyeu
  // Ø 3 1/8 po sur lequel tourne le capot arrière (cadre pivotant), alésé à Ø 3 po : côté transmission,
  // la bague du tambour UM-032-236F y est logée autour de l'arbre (page 8.2).
  for (const s of [-1, 1]) {
    const tri = [[-0.15, PAD - AXE[1]], [0.15, PAD - AXE[1]], [0.06, -0.02], [0.045, 0.03], [0, 0.05], [-0.045, 0.03], [-0.06, -0.02]];
    const zlen = s < 0 ? 0.033 : 0.031;
    P('UM-032-131FB', group(
      at(K.sheet(tri, [[0, 0, R_MOYEU]], Z131[1] - Z131[0], 'red', 0), [AXE[0], AXE[1], s * (Z131[0] + Z131[1]) / 2]),
      at(ring(0.0397, R_MOYEU, zlen, 'steel', { axis: 'z', seg: 32 }), [AXE[0], AXE[1], s * (Z131[0] + zlen / 2)]),
    ), [0, 0.1, s * 0.4]);
  }

  // Transmission (côté −Z) : 18 — moteur White RE12, 1 — raccords 6400-12-12 sur le dessus du bloc des
  // orifices, 3 — boulons de la bride, 17 — support UM-041-208F boulonné au montant (5, 20), 11/12 —
  // pignons 80B14 et 80B28 (clavettes 14/15, vis de pression 21/22), 16 — chaîne 80, 10 — carter.
  const zb = [-0.235, -0.247]; // support du moteur, contre la face intérieure du montant
  P('UMV-10MW-12', group(
    at(cyl(0.062, 0.11, 'blackCast', { axis: 'z', seg: 36 }), [MOT[0], MOT[1], -0.113]),
    ...[-0.075, -0.1, -0.13].map((z) => at(ring(0.064, 0.05, 0.006, 'blackCast', { axis: 'z', seg: 36 }), [MOT[0], MOT[1], z])),
    at(cyl(0.055, 0.012, 'blackCast', { axis: 'z', seg: 32 }), [MOT[0], MOT[1], -0.052]),
    at(box(0.1, 0.12, 0.055, 'blackCast', { r: 0.008 }), [MOT[0], MOT[1], -0.1955]),
    at(box(0.15, 0.15, 0.012, 'blackCast', { r: 0.012 }), [MOT[0], MOT[1], -0.229]),
    at(cyl(0.0127, 0.055, 'steel', { axis: 'z', seg: 16 }), [MOT[0], MOT[1], -0.2625]),
  ), [0.3, 0, 0.3]);
  each(P, '6400-12-12', [0.2, 0.245].map((x) => group(
    at(nut(0.032, 0.012, 'brass'), [x, MOT[1] + 0.066, -0.1955]),
    at(cyl(0.012, 0.032, 'brass', { seg: 16 }), [x, MOT[1] + 0.088, -0.1955]),
  )), [0.35, 0.25, 0.3]);
  each(P, 'B437-1500', [-1, 1].flatMap((u) => [-1, 1].map((v) => at(bolt(0.011, 0.038, 'steel', { axis: 'z' }), [MOT[0] + u * 0.06, MOT[1] + v * 0.06, -0.223]))), [0.3, 0, 0.42]);
  P('UM-041-208F', at(K.sheet([[0.13, 0.085], [0.354, 0.04], [0.354, 0.215], [0.3, 0.24], [0.17, 0.235], [0.135, 0.17]], [[MOT[0], MOT[1], 0.03]], 0.012, 'red', 0), [0, 0, (zb[0] + zb[1]) / 2]), [0.3, 0, -0.1]);
  each(P, 'B750-2500', [0.08, 0.19].map((y) => at(bolt(0.019, 0.063, 'steel', { axis: 'z' }), [0.33, y, zb[0] + 0.003])), [0.3, 0, 0.3]);
  each(P, 'W750', [0.08, 0.19].map((y) => at(washer(0.02, 0.01, 0.003, 'steel', { axis: 'z' }), [0.33, y, zb[0] + 0.0015])), [0.3, 0, 0.26]);
  P('UM-032-111F', group(
    at(gear(0.05, 0.064, 14, 0.018, 'darkSteel', { axis: 'z', hole: 0.0127 }), [MOT[0], MOT[1], Z80]),
    at(ring(0.03, 0.0127, 0.007, 'darkSteel', { axis: 'z', seg: 24 }), [MOT[0], MOT[1], Z80 - 0.0125]),
  ), [0.25, 0, -0.35]);
  P('UM-032-241F', at(box(0.03, 0.008, 0.008, 'steel'), [MOT[0], MOT[1] + 0.0127, Z80 - 0.002], [0, Math.PI / 2, 0]), [0.25, 0.08, -0.38]);
  P('SS313-375', at(cyl(0.004, 0.01, 'blackOxide', { seg: 8 }), [MOT[0], MOT[1] + 0.033, Z80 - 0.0125]), [0.25, 0.15, -0.36]);
  P('UM-032-112F', group(
    at(gear(0.107, 0.122, 28, 0.018, 'darkSteel', { axis: 'z', hole: 0.0254 }), [AXE[0], AXE[1], Z80]),
    at(ring(0.045, 0.0254, 0.007, 'darkSteel', { axis: 'z', seg: 28 }), [AXE[0], AXE[1], Z80 - 0.0125]),
  ), [-0.1, 0.1, -0.38]);
  P('UM-032-225F', at(box(0.03, 0.0127, 0.0127, 'steel'), [AXE[0], AXE[1] + 0.0254, Z80 - 0.002], [0, Math.PI / 2, 0]), [-0.1, 0.2, -0.42]);
  P('SS375-500', at(cyl(0.0048, 0.012, 'blackOxide', { seg: 8 }), [AXE[0], AXE[1] + 0.048, Z80 - 0.0125]), [-0.1, 0.3, -0.4]);
  P('UM-032-C2', merged([tube(chainLoop(MOT, 0.0571, AXE, 0.1134, Z80), 0.008, 'darkSteel', { closed: true, seg: 220, radial: 8 })], 'darkSteel'), [0.1, 0.1, -0.45]);
  // Carter de la chaîne 80 (page 8.4) : deux tôles, chants ouverts, reliées par quatre entretoises tubulaires
  // boulonnées à 15 mm du bord supérieur (page 8.0, vue de côté : têtes en (0,27 ; 0,25), (0,10 ; 0,31) et
  // (−0,07 ; 0,37), la dernière sur le bout arrondi, au-dessus de l'axe du tambour) ; bout côté moteur coupé
  // droit, pattes boulonnées sur le longeron supérieur ; les deux tôles sont percées au passage de la barre
  // transversale du bâti (Ø 22 mm).
  const N80 = [0.333, 0.943], U80 = [N80[1], -N80[0]], E80 = 0.3406; // bord supérieur : N80 · p = E80
  const bord = (t, d) => [(E80 - d) * N80[0] + t * U80[0], (E80 - d) * N80[1] + t * U80[1]]; // à d sous le bord
  const R80 = E80 - (N80[0] * AXE[0] + N80[1] * AXE[1]); // bout arrondi, tangent au bord supérieur
  const g80 = hull([...circle(AXE, R80, 40), bord(0.196, 0), bord(0.196, 0.2)]);
  const barHole = [BAR[0], BAR[1], 0.011];
  const zs = [-0.252, -0.296]; // faces extérieures des deux tôles (4 mm)
  const ent = [...[0.1714, -0.0089, -0.1892].map((t) => bord(t, 0.015)), [AXE[0] + (R80 - 0.015) * Math.cos(rad(112)), AXE[1] + (R80 - 0.015) * Math.sin(rad(112))]];
  P('UM-032-104B', group(
    K.guard(g80, [[MOT[0], MOT[1], 0.016], [AXE[0], AXE[1], 0.03], barHole], [[AXE[0], AXE[1], 0.03], barHole], zs[0], zs[1], 'red', 0.004, false),
    ...[0.06, 0.16].map((x) => at(box(0.03, 0.004, 0.04, 'red', { r: 0.001 }), [x, UP_TOP + 0.002, -0.316])),
    // Entretoises (tube Ø 16 mm entre les tôles), boulons 5/16 po (tête dehors) et écrous dedans.
    ...ent.flatMap(([x, y]) => [
      at(ring(0.008, 0.0045, zs[0] - zs[1] - 0.008, 'darkSteel', { axis: 'z', seg: 16 }), [x, y, (zs[0] + zs[1]) / 2]),
      at(bolt(0.0079, 0.054, 'steel', { axis: '-z' }), [x, y, zs[1]]),
      at(nut(0.0127, 0.007, 'steel', { axis: 'z' }), [x, y, zs[0] + 0.0035]),
    ]),
  ), [0.05, 0.05, -0.6]);
  each(P, 'B375-1000', [0.06, 0.16].map((x) => at(bolt(0.0095, 0.025, 'steel'), [x, UP_TOP + 0.0055, -0.32])), [0.05, 0.15, -0.6]);
  each(P, 'W375', [0.06, 0.16].map((x) => at(washer(0.011, 0.005, 0.0015), [x, UP_TOP + 0.0047, -0.32])), [0.05, 0.12, -0.6]);

  // Étapes 1 à 3 (pages 8.1 à 8.3), dans le même repère.
  const sub = { capot: o.capot, guide: o.zg };
  P('STEP 1', api.sub('P039', sub), [-0.25, 0.15, -0.5]);
  P('STEP 2', api.sub('P040', sub), [-0.15, 0.1, -0.35]);
  P('STEP 3', api.sub('P041', sub), [-0.2, 0.45, 0]);

  // Bout de câble sorti du guide (page du treuil seule) : couche extérieure → derrière le rouleau de retenue →
  // rouleau d'enroulement → 9 cm vers l'arrière, embout serti.
  if (opts.cable !== false) {
    const g = guideCable(o.capot);
    const far = [g.roller[0] + g.out[0] * 0.09 + g.out[1] * g.rRoller, g.roller[1] + g.out[1] * 0.09 - g.out[0] * g.rRoller];
    const c = cableGuide(o.capot, far, 0, 0);
    const pts = [...c.pts, far].map(([x, y]) => [x, y, o.zg]);
    api.add(tube(pts, R_CABLE, 'darkSteel', { seg: 200, tension: 0.2 }));
    api.add(at(cyl(0.007, 0.02, 'darkSteel', { axis: 'x', seg: 12 }), [far[0] + g.out[0] * 0.01, far[1] + g.out[1] * 0.01, o.zg], [0, 0, Math.atan2(g.out[1], g.out[0])]));
  }
  return { view: { dir: [0.9, 0.75, 0.45] } };
}

// ------------------------------------------------------------------ étape 1 : volant et carter de la chaîne 35

export function P039(api, opts = {}) {
  const { lathe, bolt, washer, cyl, ring, group, at, merged } = api.S;
  const P = lister(api, 'P039');
  const o = options(opts);
  const K = kit(api, o.th);
  const F = (a, b, z) => [a, -b, z];
  // 6 — Carter de chaîne UM-032-103A : enveloppe effilée du pignon 35B11 (axe du tambour) au pignon
  // 35B70 (vis-mère), creux, entretoisé sur le flanc du capot arrière par trois boulons 3 1/2 po (2) : deux
  // près du volant, de part et d'autre de l'axe du carter, un seul près du tambour (pages 1.01 et 8.0).
  const g35 = hull([...circle([0, 0], 0.065), ...circle([VIS, 0], 0.125, 48)]).map(([a, b]) => [a, -b]);
  P('UM-032-103A', K.frame(K.guard(g35, [[0, 0, 0.014], [VIS, 0, 0.03]], [[VIS, 0, 0.018]], Z103[0], Z103[1])), [-0.1, 0.1, -0.45]);
  const spacers = [[0.27, 0.03], [0.27, -0.03], [0.11, 0]];
  each(P, 'B375-3500', spacers.map(([a, b]) => K.frame(group(
    at(bolt(0.0095, 0.08, 'steel', { axis: '-z' }), F(a, b, Z103[1])),
    at(ring(0.01, 0.005, Math.abs(Z103[0] + Z105[1]), 'red', { axis: 'z', seg: 16 }), F(a, b, (Z103[0] - Z105[1]) / 2)),
  ))), [-0.1, 0.1, -0.55]);
  // 8 — Volant UM-032-169F au bout de la vis-mère, 5 — ressort, 7 — rondelle spéciale, 1 — vis du bout
  // (seul boulon 1 1/4 po dessiné à la page 8.1).
  const zw = [Z103[1], -0.53];
  P('UM-032-169F', K.frame(at(lathe([[0.03, zw[1]], [0.09, zw[1]], [0.095, zw[1] + 0.005], [0.095, -0.51], [0.09, -0.505], [0.035, -0.505], [0.035, zw[0]], [0.0165, zw[0]], [0.0165, -0.515], [0.03, -0.515], [0.03, zw[1]]], 'red', { axis: 'z', seg: 48 }), F(VIS, 0, 0))), [-0.2, 0.25, -0.65]);
  P('UM-032-102F', K.frame(at(merged([api.S.spring(0.021, 0.0025, 0.0175, 4, 'steel', { axis: 'z' })], 'steel'), F(VIS, 0, -0.5265))), [-0.2, 0.25, -0.75]);
  P('UM-032-163F', K.frame(at(washer(0.028, 0.0055, 0.004, 'red', { axis: 'z' }), F(VIS, 0, -0.5405))), [-0.2, 0.25, -0.8]);
  P('B375-1250', K.frame(at(bolt(0.0095, 0.032, 'steel', { axis: '-z' }), F(VIS, 0, -0.544))), [-0.2, 0.25, -0.9]);
  // 9 — Rondelles : sous les têtes des trois boulons du carter et sous la vis du bout.
  each(P, 'W375', [
    ...spacers.map(([a, b]) => K.frame(at(washer(0.011, 0.005, 0.0015, 'steel', { axis: 'z' }), F(a, b, Z103[1] - 0.0008)))),
    K.frame(at(washer(0.011, 0.005, 0.0015, 'steel', { axis: 'z' }), F(VIS, 0, -0.5433))),
  ], (i) => (i < 3 ? [-0.1, 0.1, -0.58] : [-0.2, 0.25, -0.85]));
  // 3 — Goupilles élastiques (moyeu du volant, adaptateur du 35B11), 4 — goupille du moyeu du 35B70.
  each(P, 'SP250-1250', [F(VIS, 0, -0.49), F(0, 0, -0.437)].map((p) => K.frame(at(cyl(0.0032, 0.032, 'blackOxide', { seg: 8 }), p))), [-0.15, 0.3, -0.7]);
  P('SP375-3000', K.frame(at(cyl(0.0048, 0.06, 'blackOxide', { seg: 8 }), F(VIS, 0, -0.461))), [-0.2, 0.35, -0.55]);
  return { view: { dir: [0.4, 0.5, -1] } };
}

// ------------------------------------------------------------------ étape 2 : pignons et chaîne 35, guide du tambour

export function P040(api, opts = {}) {
  const { gear, ring, cyl, box, tube, group, at, merged } = api.S;
  const P = lister(api, 'P040');
  const o = options(opts);
  const K = kit(api, o.th);
  const F = (a, b, z) => [a, -b, z];
  // 7 — Bague du tambour UM-032-236F logée dans l'alésage Ø 3 po du moyeu du support pivotant (côté −Z),
  // autour de l'arbre, 1 — retenue par l'anneau intérieur SPN-R3000-X237 (pour alésage de 3 po).
  P('UM-032-236F', at(ring(R_MOYEU - 0.0002, 0.0256, 0.012, 'darkSteel', { axis: 'z', seg: 32 }), [AXE[0], AXE[1], -0.4]), [0, 0, -0.25]);
  P('SPN-R3000-X237', at(ring(R_MOYEU - 0.0002, 0.032, 0.0015, 'darkSteel', { axis: 'z', seg: 32 }), [AXE[0], AXE[1], -0.4075]), [0, 0, -0.3]);
  // 4 — Adaptateur UM-032-162F (bride vissée au bout de l'arbre, bout d'arbre), 2 — pignon 35B11, 6 — clavette.
  P('UM-032-162F', K.frame(group(
    at(cyl(0.025, 0.008, 'steel', { axis: 'z', seg: 24 }), F(0, 0, -0.419)),
    at(cyl(0.0095, 0.039, 'steel', { axis: 'z', seg: 16 }), F(0, 0, -0.4425)),
  )), [0, 0, -0.35]);
  P('UM-032-109F', K.frame(at(gear(0.0145, 0.021, 11, 0.006, 'darkSteel', { axis: 'z', hole: 0.0095 }), F(0, 0, Z35))), [0, 0, -0.42]);
  // 3 — Pignon 35B70 sur la vis-mère, 5 — bague de laiton.
  P('UM-032-110F', K.frame(group(
    at(gear(0.1, 0.112, 70, 0.006, 'darkSteel', { axis: 'z', hole: 0.022 }), F(VIS, 0, Z35)),
    at(ring(0.03, 0.022, 0.012, 'darkSteel', { axis: 'z', seg: 24 }), F(VIS, 0, Z35 - 0.008)),
  )), [-0.05, 0.1, -0.42]);
  P('UM-032-165F', K.frame(at(ring(0.022, 0.0159, 0.022, 'brass', { axis: 'z', seg: 24 }), F(VIS, 0, Z35 - 0.003))), [-0.05, 0.1, -0.5]);
  P('UM-032-224F', K.frame(at(box(0.012, 0.0048, 0.0048, 'steel'), F(0, -0.0095, Z35), [0, Math.PI / 2, 0])), [0, 0.05, -0.48]);
  // 8 — Chaîne 35 (46 1/2 po) : rayons primitifs 17 et 106 mm.
  const loop = chainLoop([0, 0], 0.017, [VIS, 0], 0.106, Z35).map(([a, b, z]) => [a, -b, z]);
  P('UM-032-C1', K.frame(merged([tube(loop, 0.0042, 'darkSteel', { closed: true, seg: 260, radial: 6 })], 'darkSteel')), [0, 0.05, -0.55]);
  return { view: { dir: [0.4, 0.5, -1] } };
}

// ------------------------------------------------------------------ étape 3 : capots, bras, vis-mère et guide-câble

export function P041(api, opts = {}) {
  const { box, cyl, ring, plate, bolt, washer, nut, group, at, merged, tube } = api.S;
  const P = lister(api, 'P041');
  const o = options(opts);
  const K = kit(api, o.th);
  const F = (a, b, z) => [a, -b, z];
  const zg = o.zg;

  // 1 — Capot arrière UM-032-105A : deux flancs (pivot sur les supports 131FB, paliers de la vis-mère),
  // tôle de dessus pleine au-dessus de la vis (horizontale en position haute, percée au droit du graisseur
  // du guide-câble, pages 8.0 et 8.3), paroi arrière, fond replié sous la vis, bande des charnières. La vis et
  // le guide ne se voient que sous le bord avant de la tôle de dessus.
  const zi = Z105[0] - 0.003; // tôles entre les flancs
  const tRear = fromHaut([TOLE.x[0] - 0.0005, TOLE.y]), tFront = fromHaut([TOLE.x[1] + 0.0005, TOLE.y]);
  const side = [[-0.07, -0.06], [-0.02, -0.082], [0.2, -0.1], [0.372, -0.115], [0.455, -0.062], tRear, tFront, [0.285, 0.198], [0.23, 0.178], [0.06, 0.1], [-0.03, 0.07], [-0.078, 0.03]].map(([a, b]) => [a, -b]);
  const sideHoles = [[0, 0, 0.0405], [VIS, 0, 0.032], [ARM_TOP[0], -ARM_TOP[1], 0.0065]];
  const wallY = [-0.088, TOLE.y - TOLE.t]; // paroi arrière (repère « position haute »), du fond à la tôle de dessus
  const tx = (TOLE.x[0] + TOLE.x[1]) / 2;
  P('UM-032-105A', K.frame(group(
    ...[-1, 1].map((s) => K.sheet(side, sideHoles, Z105[1] - Z105[0], 'red', s * (Z105[0] + Z105[1]) / 2)),
    K.haut(
      at(plate(TOLE.x[1] - TOLE.x[0], 2 * zi, TOLE.t, 'red', { holes: [[-tx, 0, 0.0125]] }), [tx, TOLE.y - TOLE.t / 2, 0]),
      at(box(0.006, wallY[1] - wallY[0], 2 * zi, 'red', { r: 0.002 }), [TOLE.x[0] + 0.003, (wallY[0] + wallY[1]) / 2, 0]),
    ),
    K.strip(F(...fromHaut([TOLE.x[0] + 0.003, wallY[0]])), F(0.24, -0.095), 0.006, -zi, zi),
    K.strip(F(0.29, 0.183), F(0.325, 0.143), 0.006, -zi, zi),
  )), [-0.2, 0.3, 0]);

  // 2 — Capot avant UM-032-108A, à charnières : dessus (logo UM découpé dans la tôle, ouverture de contrôle
  // du câble), rebord avant, joues latérales ; deux charnières sur la bande du capot arrière.
  const H = [0.297, 0.175], T = [0.0506, 0.303], B3 = [-0.06, 0.255];
  const len = Math.hypot(T[0] - H[0], T[1] - H[1]), ang = Math.atan2(-(T[1] - H[1]), T[0] - H[0]);
  const zc = 0.405, ct = 0.005;
  // Lettres UM inclinées (ajourées), lisibles depuis l'avant : haut des lettres vers la charnière. Contours dans
  // le plan de la tôle (x le long du capot, y = −z).
  const U = [[0, 1], [0.18, 1], [0.18, 0.3], [0.25, 0.18], [0.45, 0.18], [0.52, 0.3], [0.52, 1], [0.7, 1], [0.7, 0.25], [0.58, 0.05], [0.45, 0], [0.25, 0], [0.12, 0.05], [0, 0.25]];
  const M = [[0, 0], [0.18, 0], [0.18, 0.65], [0.4, 0.25], [0.52, 0.25], [0.74, 0.65], [0.74, 0], [0.92, 0], [0.92, 1], [0.74, 1], [0.46, 0.5], [0.18, 1], [0, 1]];
  const hl = 0.08, x0 = -0.296 * len;
  const letter = (pts, du) => pts.map(([u, v]) => [x0 + hl / 2 - v * hl, (u + 0.25 * v + du) * hl - 0.08]);
  const cx = len / 2 - 0.2955 * len, cw = 0.353 * len / 2, cd = 0.178; // ouverture de contrôle du câble
  const top = K.sheet([[-len / 2, -zc], [len / 2, -zc], [len / 2, zc], [-len / 2, zc]],
    [[[cx - cw, -cd], [cx - cw, cd], [cx + cw, cd], [cx + cw, -cd]], letter(U, 0), letter(M, 0.85)], ct, 'red', 0);
  top.rotation.x = -Math.PI / 2;
  const topG = group(top);
  topG.position.set((H[0] + T[0]) / 2, -(H[1] + T[1]) / 2, 0);
  topG.rotation.z = ang;
  const knuckles = [[0.178, 0.328], [-0.33, -0.177]].map(([z0, z1]) => at(cyl(0.011, z1 - z0, 'steel', { axis: 'z', seg: 16 }), F(H[0] + 0.004, H[1] + 0.006, (z0 + z1) / 2)));
  P('UM-032-108A', K.frame(group(
    at(group(topG), [0, 0, 0]),
    K.strip(F(...T), F(...B3), ct, -zc, zc),
    ...[-1, 1].map((s) => K.sheet([H, T, B3].map(([a, b]) => [a, -b]), [], 0.006, 'red', s * (zc + 0.003))),
    ...knuckles,
  )), [0.1, 0.5, 0]);
  // Visserie des capots : boulons 3/8 po des charnières (sur le capot avant) et « boulon n° 1 » de
  // blocage de chaque joue sur le flanc (page 8.3, réglage).
  const hingeBolts = [0.21, 0.3, -0.21, -0.3].map((z) => {
    const p = [H[0] + (T[0] - H[0]) * 0.07, H[1] + (T[1] - H[1]) * 0.07];
    const g = group(bolt(0.0095, 0.02, 'steel'));
    g.position.set(p[0] - Math.sin(ang) * (ct / 2), -p[1] + Math.cos(ang) * (ct / 2), z);
    g.rotation.z = ang; // tête sur le dessus du capot, tige vers l'intérieur
    return K.frame(g);
  });
  const lockBolts = [-1, 1].map((s) => K.frame(at(bolt(0.0095, 0.03, 'steel', { axis: s > 0 ? 'z' : '-z' }), F(0.27, 0.186, s * (zc + 0.006)))));

  // 5 — Vis-mère 10 000 pi : double hélice (filets croisés) sur la course du guide, bout côté volant.
  const vz0 = -0.51, vz1 = 0.425;
  const helix = (hand) => {
    const pts = [];
    const n = 320, pitch = 0.05;
    for (let k = 0; k <= n; k++) {
      const z = -0.31 + (0.62 * k) / n, a = (hand * 2 * Math.PI * (z + 0.31)) / pitch;
      pts.push([VIS + 0.0163 * Math.cos(a), -0.0163 * Math.sin(a), z]);
    }
    return tube(pts, 0.0024, 'darkSteel', { seg: n, radial: 6 });
  };
  P('UM-032-226F', K.frame(group(
    at(cyl(0.0159, vz1 - vz0, 'steel', { axis: 'z', seg: 24 }), F(VIS, 0, (vz0 + vz1) / 2)),
    merged([helix(1), helix(-1)], 'darkSteel'),
  )), [-0.3, 0.45, 0]);
  // 13/14 — Paliers PFL206 (deux flasques embouties de part et d'autre du flanc) et roulements SB206-20 ;
  // 9, 7, 11 — boulons, rondelles et écrous de blocage.
  const pfl = (z, out) => group(
    K.sheet(hull([...circle([0, 0.045], 0.016, 16), ...circle([0, -0.045], 0.016, 16), ...circle([0, 0], 0.038, 24)]), [[0, 0, 0.0165]], 0.003, 'steel', 0),
    at(ring(0.034, 0.02, 0.009, 'steel', { axis: 'z', seg: 24 }), [0, 0, out * 0.006]),
  );
  each(P, 'PFL206', [-1, 1].flatMap((s) => [[Z105[0] - 0.0015, -1], [Z105[1] + 0.0015, 1]].map(([z, out]) => K.frame(at(pfl(0, out * s), F(VIS, 0, s * z))))), (i) => [-0.3, 0.3, i < 2 ? -0.3 : 0.3]);
  each(P, 'SB206-20', [-1, 1].map((s) => K.frame(at(ring(0.03, 0.0159, 0.03, 'steel', { axis: 'z', seg: 28 }), F(VIS, 0, s * (Z105[0] + Z105[1]) / 2)))), (i) => [-0.35, 0.35, i ? 0.35 : -0.35]);
  const pb = [-1, 1].flatMap((s) => [-1, 1].map((u) => [s, u]));
  // Boulons des paliers, des charnières (sur le capot avant) et de blocage des joues : 10 boulons 3/8 po.
  each(P, 'B375-1250', [
    ...pb.map(([s, u]) => K.frame(at(bolt(0.0095, 0.032, 'steel', { axis: s > 0 ? 'z' : '-z' }), F(VIS, u * 0.045, s * (Z105[1] + 0.0045))))),
    ...hingeBolts, ...lockBolts,
  ], (i) => (i < 4 ? [-0.3, 0.35, pb[i][0] * 0.4] : [0.1, 0.55, 0]));
  each(P, 'W375', pb.flatMap(([s, u]) => [Z105[1] + 0.0038, Z105[0] - 0.0038].map((z) => K.frame(at(washer(0.011, 0.005, 0.0015, 'steel', { axis: 'z' }), F(VIS, u * 0.045, s * z))))), (i) => [-0.3, 0.32, i < 4 ? -0.38 : 0.38]);
  each(P, 'LN375NF', pb.map(([s, u]) => K.frame(at(nut(0.0143, 0.009, 'steel', { axis: 'z' }), F(VIS, u * 0.045, s * (Z105[0] - 0.009))))), (i) => [-0.3, 0.3, i < 2 ? -0.2 : 0.2]);
  // 15 — Anneaux extérieurs sur les moyeux des supports pivotants (retenue des flancs).
  each(P, 'SPN-R3100-300', [-0.41, 0.41].map((z) => at(ring(0.0445, 0.0397, 0.002, 'darkSteel', { axis: 'z', seg: 28 }), [AXE[0], AXE[1], z])), (i) => [0, 0, i ? 0.3 : -0.3]);

  // 3/4 — Bras inférieurs UM-032-115F (axe bas sur le bâti, dix trous de réglage) et supérieurs 116F
  // (axe haut sur le flanc) ; 10, 12, 8 — boulon de réglage (trou fixe du 116F dans un trou du 115F,
  // page 8.3, détail B), écrou et rondelles ; le 115F passe à l'extérieur du 116F (détail B de la page P043 et
  // page 1.01 : tous ses trous restent visibles). Trous du 115F au pas de 1 po : le boulon tombe dans un trou
  // pour les angles de capot 18°, 32°, 42° (position haute : trou n° 4, le 7e depuis l'axe bas, comme à la
  // page 1.01), 51°, 59°, 66° et 73°.
  const P1 = cadre(o.th, ...ARM_TOP);
  const D = Math.hypot(P1[0] - PIV[0], P1[1] - PIV[1]);
  const u = [(P1[0] - PIV[0]) / D, (P1[1] - PIV[1]) / D];
  const at0 = (d) => [PIV[0] + u[0] * d, PIV[1] + u[1] * d];
  const dB = D - (ARM_L - 0.03); // boulon de réglage : trou bas du bras supérieur
  const lower = [], upper = [], w500 = [], adj = [], nuts = [];
  for (const s of [-1, 1]) {
    lower.push(K.bar(PIV, at0(L_115F), 0.038, 0.01, s * 0.42, 'red', [0, ...TROUS_115F]));
    upper.push(K.bar(P1, at0(D - ARM_L), 0.038, 0.01, s * 0.41, 'red', [0, ARM_L - 0.03]));
    const pB = at0(dB);
    adj.push(at(bolt(0.0127, 0.038, 'steel', { axis: s > 0 ? 'z' : '-z' }), [pB[0], pB[1], s * 0.4275]));
    nuts.push(at(nut(0.019, 0.011, 'steel', { axis: 'z' }), [pB[0], pB[1], s * 0.3955]));
    w500.push(at(washer(0.014, 0.0068, 0.0025, 'steel', { axis: 'z' }), [pB[0], pB[1], s * 0.4262]));
    w500.push(at(washer(0.014, 0.0068, 0.0025, 'steel', { axis: 'z' }), [pB[0], pB[1], s * 0.4025]));
    w500.push(at(washer(0.014, 0.0068, 0.0025, 'steel', { axis: 'z' }), [PIV[0], PIV[1], s * 0.4263]));
    w500.push(at(washer(0.014, 0.0068, 0.0025, 'steel', { axis: 'z' }), [P1[0], P1[1], s * 0.4163]));
  }
  each(P, 'UM-032-115F', lower, (i) => [0.15, 0.1, i ? 0.3 : -0.3]);
  each(P, 'UM-032-116F', upper, (i) => [0.15, 0.25, i ? 0.35 : -0.35]);
  each(P, 'B500-1500', adj, (i) => [0.15, 0.2, i ? 0.45 : -0.45]);
  each(P, 'NC500', nuts, (i) => [0.15, 0.2, i ? 0.2 : -0.2]);
  each(P, 'W500', w500, (i) => [0.15, 0.2, i < 4 ? -0.4 : 0.4]);
  // Axes hauts des bras supérieurs (dans le flanc).
  api.add(group(...[-1, 1].map((s) => at(cyl(0.0065, 0.024, 'steel', { axis: 'z', seg: 12 }), [P1[0], P1[1], s * 0.408]))));

  // 6 — Guide-câble UM-041-014F (détail de la page 8.3), à la position zg de la vis, dessiné en position
  // haute (faces du bloc d'aplomb) : 17 — bloc alésé, bagues de laiton (16) affleurantes dans l'alésage ;
  // 18 — goupille engagée dans la double hélice par le dessus du bloc, tête logée dans la semelle du cadre ;
  // graisseur (21) au-dessus, à travers la semelle, au droit du trou de la tôle de dessus du capot arrière ;
  // 20 — cadre à rouleaux : semelle posée sur le dessus du bloc, vissée par quatre boulons verticaux (19) ;
  // dessus, devant le bord avant de la tôle, deux joues triangulaires portant les rouleaux d'axe Z (22 :
  // enroulement au sommet, côté bloc ; retenue au pied, en avant) ; dessous, deux joues portant les rouleaux
  // d'axe X à l'entrée du câble ; axes (23), goupilles fendues (24). Le câble monte du tambour entre les
  // rouleaux d'axe X, par la lumière de la semelle, passe derrière le rouleau de retenue, enveloppe le
  // rouleau d'enroulement et part vers l'arrière, au-dessus de la tôle.
  P('UM-041-106F', K.frame(K.haut(K.sheet([[-0.03, -0.035], [0.03, -0.035], [0.03, 0.035], [-0.03, 0.035]], [[0, 0, 0.0224]], 0.09, 'red', zg))), [-0.1, 0.4, 0]);
  each(P, 'UM-041-164F', [-1, 1].map((s) => K.frame(at(ring(0.0222, 0.019, 0.008, 'brass', { axis: 'z', seg: 24 }), F(VIS, 0, zg + s * 0.041)))), (i) => [-0.1, 0.4, i ? 0.15 : -0.15]);
  const [sy0, sy1] = SEMELLE.y;
  P('UM-041-155F', K.frame(K.haut(
    at(cyl(0.008, sy1 - 0.016, 'steel', { seg: 14 }), [0, (sy1 + 0.016) / 2, zg]),
    at(nut(0.022, sy1 - sy0, 'steel'), [0, (sy0 + sy1) / 2, zg]),
  )), [-0.2, 0.3, 0]);
  P('', K.frame(K.haut(at(cyl(0.004, 0.012, 'zinc', { seg: 8 }), [0, sy1 + 0.006, zg]))), [-0.25, 0.3, 0]);
  // Cadre à rouleaux (repère « position haute ») : semelle percée au passage de la tête de la goupille et de la
  // lumière du câble ; joues triangulaires (pied sur la semelle, sommet arrondi autour de l'axe du rouleau
  // d'enroulement) ; joues de dessous, paliers des rouleaux d'axe X.
  const [ex, ey] = ROUL_HAUT.enroulement;
  const apex = Array.from({ length: 9 }, (_, k) => rad(35 + (k * 130) / 8)).map((a) => [ex + 0.0185 * Math.cos(a), ey + 0.0185 * Math.sin(a)]);
  const cheek = [[0.058, sy1], [0.138, sy1], [0.138, 0.07], ...apex, [0.058, 0.1]]; // devant la tôle, derrière la bande des charnières
  const sx = (SEMELLE.x[0] + SEMELLE.x[1]) / 2, xc = VR.x - 0.0014; // lumière du câble (centre)
  const vx = [-1, 1].map((k) => VR.x + k * VR.half); // joues de dessous (paliers des rouleaux d'axe X)
  P('UM-041-020F', K.frame(K.haut(
    at(plate(SEMELLE.x[1] - SEMELLE.x[0], 2 * SEMELLE.z, sy1 - sy0, 'red', { holes: [[-sx, 0, 0.0135]], cutouts: [[xc - sx, 0, 0.032, 0.03]] }), [sx, (sy0 + sy1) / 2, zg]),
    ...[-1, 1].map((s) => K.sheet(cheek, [], 0.006, 'red', zg + s * 0.046)),
    ...vx.map((x) => at(box(0.006, sy0 - (VR.y - 0.02), 2 * 0.045, 'red', { r: 0.001 }), [x, (sy0 + VR.y - 0.02) / 2, zg])),
  )), [-0.1, 0.55, 0]);
  each(P, 'B375-1500', [-1, 1].flatMap((ux) => [-1, 1].map((uz) => K.frame(K.haut(at(bolt(0.0095, 0.038, 'steel'), [ux * 0.022, sy1, zg + uz * 0.03]))))), [-0.1, 0.6, 0]);
  const zv = ROUL_HAUT.r + 0.006; // rouleaux d'axe X de part et d'autre du câble
  each(P, 'UM-041-176F', [
    ...[ROLL_IN, ROLL_OUT].map(([a, b]) => K.frame(at(cyl(ROUL_HAUT.r, 0.08, 'white', { axis: 'z', seg: 24 }), F(a, b, zg)))),
    ...[-1, 1].map((s) => K.frame(K.haut(at(cyl(ROUL_HAUT.r, 0.05, 'white', { axis: 'x', seg: 24 }), [VR.x, VR.y, zg + s * zv])))),
  ], [-0.1, 0.65, 0]);
  each(P, 'UM-041-174F', [
    ...[ROLL_IN, ROLL_OUT].map(([a, b]) => K.frame(at(cyl(0.006, 0.098, 'steel', { axis: 'z', seg: 12 }), F(a, b, zg)))),
    ...[-1, 1].map((s) => K.frame(K.haut(at(cyl(0.006, 2 * VR.half + 0.012, 'steel', { axis: 'x', seg: 12 }), [VR.x, VR.y, zg + s * zv])))),
  ], [-0.1, 0.7, 0]);
  each(P, 'CTP-125-2250', [-1, 1].map((s) => K.frame(K.haut(at(cyl(0.0016, 0.03, 'steel', { seg: 6 }), [VR.x + VR.half + 0.0045, VR.y, zg + s * zv])))), [-0.1, 0.75, 0]);
  return { view: { dir: [0.5, 0.9, 0.6] } };
}
