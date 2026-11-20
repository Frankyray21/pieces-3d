// P014 — Treuil Hoist XW-2100 206-400 (dessin X-Spec C6712 rév. B, page 14 : éclaté à 1:7 ; liste de 36 repères
// page 15 ; 477,18 lb). Vis d'enroulement 206-419 : P016 (repère 6).
//
// REPÈRE LOCAL (HOIST de layout.js) : origine au sol du treuil (dessous du fond 206-414), sous l'axe du tambour ;
// X vers l'avant de la foreuse, Y vers le haut, Z le long de l'axe du tambour, plaque droite 206-415 côté +Z.
// Axe du tambour à y = HOIST.drumY. Couleurs : fond, plaques de côté, tambour, support de moteur, gardes et
// plaques 18-19 au rouge Machines Roger (mêmes familles que le treuil du STM-1500 ; le gris de la p. 14 est la teinte
// par défaut du logiciel de CAO) ; volant, doublure, acier, laiton et zingage inchangés. La vis d'enroulement est parallèle au tambour, en bas, du côté −X (vers
// l'arrière, côté poulie du mât) : sur l'éclaté (vue depuis −X, +Y, +Z) elle est devant, à gauche, et la plaque
// droite à droite. Transmission côté +Z, sous le carter 206-422 : pignon 40BS14 (14 dents) sur le bout du
// tambour, chaîne RS40 de 43 po, pignon 206-033 sur la vis, tendeur Rosta SE15 et son pignon N0.500-10S, volant
// 206-018 au bout de la vis (ressort, rondelle 206-004, boulon à épaulement). Côté −Z : palier, bague d'encodeur
// 206-028 et support de moteur 206-027 (le manuel ne liste pas de moteur : aucun n'est dessiné).
//
// CHAÎNE (note de la page 14, sans ligne dans la liste : objet ajouté par api.add, sans repère) : RS40-1-RP de
// 43 po = 86 pas de 1/2 po, dont une maille patente (maillon d'attache à agrafe) et une demi-maille (maillon
// coudé). L'entraxe tambour / vis est CALCULÉ pour que la boucle (14 dents, 52 dents et pignon tendeur poussant
// le brin du bas de 0,35 po) fasse exactement 43 po : ≈ 12,9 po.
//
// COTES (pouces) — sources :
//   [manuel] chaîne 43 po RS40 (pas 1/2), pignon 40BS14 alésage 1 po, paliers MFC-2 (4 boulons), visserie
//            désignée (3/8-16, 1/2-13, M8 × 40, goupille 5/16 × 2, jonc pour arbre de 1 po, boulon à épaulement
//            1/2 × 1 1/4), tôle de doublure 0,250 po.
//   [norme]  pignons ANSI 40 : rayon primitif = p / (2 sin(π/N)) ; maillons RS40 (rouleau Ø 0,312 × 0,312,
//            plaques 0,06 × 0,47) ; Rosta SE15 (corps carré ≈ 40 mm, bras 80 mm, vis M8).
//   [mesure, p. 14, ≈ 44 px/po à 300 dpi] joues du tambour Ø ≈ 16,4 (mesuré sur deux ellipses), fût Ø 8,
//            largeur entre joues ≈ 18 1/2, pignon 206-033 ≈ 52 dents (dents comptées sur 250° environ),
//            volant Ø ≈ 6 1/2, forme des plaques de côté (tête en demi-cercle, gradin, prolongement bas vers la
//            vis), quatre entretoises 206-420 (trois en haut côté +X, une côté −X), carters.
//   [estimé] épaisseurs (plaques 1/2, fond 1/2, gardes 14 ga), places des trous, du tendeur, des pattes de
//            fixation des gardes ; hauteur de l'axe HOIST.drumY (0,20 m, d'après les paliers de la p. 14 : les joues
//            descendent dans la fenêtre du fond).
import { IN, HOIST } from '../layout.js';
import { p3, kit, chainPath, tangente, resample, circle, arc, slot, perfs, hull, offsetConvex } from './_treuil.js';
import { VIS } from './P016.js';

const rp = (n) => 0.5 / (2 * Math.sin(Math.PI / n)); // rayon primitif ANSI 40, pouces [norme]
const N_TAMBOUR = 14, N_VIS = 52, N_TENDEUR = 10;
const HA = HOIST.drumY / IN; // axe du tambour (pouces)
const YS = 0.5 - VIS.holder.y[0]; // axe de la vis : pied des porte-roulements posé sur le fond (dessus à 1/2 po) → 5 po
const PUSH = 0.35; // enfoncement du brin du bas par le pignon tendeur [estimé]
const ZC = 13.0; // plan de la chaîne (côté +Z) [estimé : palier, moyeu, jeu]
const ZP = [10.5, 11.0]; // faces intérieure et extérieure des plaques de côté (±) [estimé : jeu aux joues du tambour]
const R_PL = 10.75; // tête des plaques en demi-cercle autour de l'axe [mesure]
const X_AR = -16.4; // bout arrière (−X) des plaques et du fond [mesure]
const ROSTA = [-1.0, 4.4]; // axe du Rosta SE15 sur la plaque droite [estimé]

/** Boucle de la chaîne pour une abscisse xs de la vis : pignons (rayons primitifs) et tendeur. */
function boucle(xs) {
  const A = [0, HA], B = [xs, YS];
  const rA = rp(N_TAMBOUR), rB = rp(N_VIS), rC = rp(N_TENDEUR);
  const t = tangente(B, rB, 1, A, rA, 1); // brin du bas (de la vis vers le tambour)
  const m = [(t.p[0] + t.q[0]) / 2, (t.p[1] + t.q[1]) / 2];
  const d = [t.q[0] - t.p[0], t.q[1] - t.p[1]], L = Math.hypot(d[0], d[1]);
  const n = [d[1] / L, -d[0] / L]; // vers l'extérieur de la boucle (dessous)
  const C = [m[0] + n[0] * (rC - PUSH), m[1] + n[1] * (rC - PUSH)];
  const wheels = [{ c: B, r: rB, s: 1, N: N_VIS }, { c: C, r: rC, s: -1, N: N_TENDEUR }, { c: A, r: rA, s: 1, N: N_TAMBOUR }];
  return { A, B, C, wheels, ...chainPath(wheels) };
}

/** Abscisse de la vis pour une chaîne de 43 po (bissection). */
function entraxe() {
  let lo = -30, hi = -6;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (boucle(mid).len > HOIST.chainLen / IN) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
const XS = entraxe();
/** Pose de la vis d'enroulement P016 dans le repère du treuil (mètres). */
export const HOIST_SCREW = [XS * IN, YS * IN, 0];

export default function P014(api, opts = {}) {
  const S = api.S, T = api.THREE;
  const { box, cyl, ring, lathe, bolt, washer, nut, group, at, merged, gear, torus } = S;
  const K = kit(api);
  const P = (ref, obj, ex) => api.part(ref, obj, ex && ex.map((v) => v * IN));
  const each = (ref, objs, ex) => objs.forEach((o, i) => P(ref, o, typeof ex === 'function' ? ex(i) : ex));
  const m = (pts) => pts.map(([x, y]) => [x * IN, y * IN]);
  const mh = (holes) => holes.map((h) => (Array.isArray(h[0]) ? m(h) : [h[0] * IN, h[1] * IN, h[2] * IN]));
  /** Tôle plane dans le plan XY (pouces), épaisseur t selon Z, centrée sur z. */
  const tole = (outline, holes, t, mat, z, seg = 20) => K.sheet(m(outline), mh(holes), t * IN, mat, z * IN, seg);
  const A = [0, HA], B = [XS, YS];
  const ch = boucle(XS);
  const C = ch.C;

  // ---------------------------------------------------------------- 1 — fond mécano-soudé 206-414
  // Plaque 1/2 po entre les plaques de côté, trois fenêtres (sous le tambour et sous la vis), quatre taquets
  // taraudés (deux par côté) où se vissent les plaques de côté (rep. 25), trous des pieds des porte-roulements de
  // la vis (rep. 30) et trous de fixation sur la foreuse aux quatre coins.
  const zIn = ZP[0] - 0.05;
  const feet = [1, -1].flatMap((s) => VIS.feet.map(([x, dz]) => [XS + x, s * (VIS.zFoot + dz)]));
  const fond = S.plate((10.5 - X_AR) * IN, 2 * zIn * IN, 0.5 * IN, 'red', {
    holes: [
      ...feet.map(([x, z]) => [(x - (10.5 + X_AR) / 2) * IN, z * IN, 0.21 * IN]),
      ...[[-15.6, 8.6], [-15.6, -8.6], [9.6, 8.6], [9.6, -8.6]].map(([x, z]) => [(x - (10.5 + X_AR) / 2) * IN, z * IN, 0.34 * IN]),
    ],
    cutouts: [
      [-0.5, -4.4, 13, 7.2], [-0.5, 4.4, 13, 7.2], [-11.3, 0, 5.6, 12.5],
    ].map(([x, z, w, d]) => [(x - (10.5 + X_AR) / 2) * IN, z * IN, w * IN, d * IN]),
  });
  const taquets = [-15.2, 5.5].flatMap((x) => [1, -1].map((s) => at(box(2.0 * IN, 2.0 * IN, 1.0 * IN, 'red', { r: 0.002 }), p3(x, 1.5, s * (zIn - 0.5)))));
  P('1', group(at(fond, p3((10.5 + X_AR) / 2, 0.25, 0)), ...taquets), [0, -9, 0]);

  // ---------------------------------------------------------------- 2, 3 — plaques de côté 206-415 (droite, +Z) et 206-416 (gauche, −Z)
  // Tête en demi-cercle autour du tambour, bord avant droit, gradin côté −X puis prolongement bas jusqu'au bout
  // arrière (porte-roulements de la vis derrière, garde 206-423 entre les deux). Trous : alésage de centrage du
  // palier MFC-2 et ses quatre boulons, bouts des entretoises, taquets du fond, pattes des gardes ; droite :
  // passage du bout de la vis, Rosta, carter ; gauche : support de moteur, garde latérale.
  const plOutline = [[X_AR, 0], [R_PL, 0], ...arc(A, R_PL, 0, 128, 40), [-9.0, 11.3], [X_AR, 11.3]];
  const RODS = [15, 45, 75, 140].map((a) => [8.9 * Math.cos((a * Math.PI) / 180), HA + 8.9 * Math.sin((a * Math.PI) / 180)]);
  const BRG = [45, 135, 225, 315].map((a) => [2.2 * Math.cos((a * Math.PI) / 180), HA + 2.2 * Math.sin((a * Math.PI) / 180)]);
  const BLOCK_BOLTS = [[-15.7, 1.5], [-14.7, 1.5], [5.0, 1.5], [6.0, 1.5]];
  // Garde du tambour 206-424 : profil (repère de l'axe) et pattes boulonnées aux plaques.
  const G15 = [[-5.85, 8.36], [-0.89, 10.16], [5.1, 8.83], [8.83, 5.1], [10.3, 1.5], [10.3, -3.0]].map(([x, y]) => [x, HA + y]);
  const G15_TABS = [[-3.0, HA + 8.6], [9.5, HA - 1.5]];
  const G14_TABS = [[-15.4, 10.2], [-15.4, 2.2]];
  const commun = [[A[0], A[1], 1.6], ...BRG.map(([x, y]) => [x, y, 0.28]), ...RODS.map(([x, y]) => [x, y, 0.2]), ...BLOCK_BOLTS.map(([x, y]) => [x, y, 0.27]),
    ...G15_TABS.map(([x, y]) => [x, y, 0.2]), ...G14_TABS.map(([x, y]) => [x, y, 0.2]),
    // petits trous de la tête (pattes de garde, levage), comme sur le dessin
    ...[20, 60, 100].map((a) => [9.8 * Math.cos((a * Math.PI) / 180), HA + 9.8 * Math.sin((a * Math.PI) / 180), 0.17]),
    [8.5, 1.8, 0.4], [-3.0, 1.6, 0.4]];
  // Carter 206-422 : contour (enveloppe des deux pignons, du tendeur et du palier) et pattes.
  const g13 = hull([...circle(A, 3.1, 28), ...circle(B, 4.75, 40), ...circle(ROSTA, 1.4, 12), ...circle(C, 1.15, 12)]);
  const G13_TABS = [[-14.9, 7.6], [-7.0, 0.9], [2.6, 13.9], [1.6, 7.0]];
  const MM_BOLTS = [0, 60, 120, 180, 240, 300].map((a) => [4.6 * Math.cos(((a + 30) * Math.PI) / 180), HA + 4.6 * Math.sin(((a + 30) * Math.PI) / 180)]);
  const G17_BOLTS = [[-15.8, 1.2], [-15.8, 10.7], [-7.6, 1.2]], G17_TOP = [-5.0, 15.6];
  const G18_BOLTS = [[-12.0, 10.6], [-9.6, 10.6]];
  const droite = tole(plOutline, [...commun, [B[0], B[1], 0.8], [ROSTA[0], ROSTA[1], 0.17], ...G13_TABS.map(([x, y]) => [x, y, 0.2]), ...G18_BOLTS.map(([x, y]) => [x, y, 0.2])], ZP[1] - ZP[0], 'red', (ZP[0] + ZP[1]) / 2, 24);
  const gauche = tole(plOutline, [...commun, [B[0], B[1], 0.5], ...MM_BOLTS.map(([x, y]) => [x, y, 0.2]), ...G17_BOLTS.map(([x, y]) => [x, y, 0.2]), [...G17_TOP, 0.2]], ZP[1] - ZP[0], 'red', -(ZP[0] + ZP[1]) / 2, 24);
  P('2', droite, [0, 0, 12]);
  P('3', gauche, [0, 3, -16]);

  // ---------------------------------------------------------------- 4 — tambour 206-417
  // Fût Ø 8 × 1/2 entre deux joues Ø 16,4 × 1/2 (arêtes cassées, moyeux), arbre Ø 2 po : portées des MFC-2,
  // bout gauche Ø 1 1/2 (bague d'encodeur), bout droit Ø 1 po claveté (pignon 40BS14).
  const RF = 8.2, ZF = [9.25, 9.75];
  const tambour = group(
    lathe([[3.5, -ZF[0]], [4.0, -ZF[0]], [4.0, ZF[0]], [3.5, ZF[0]]].map(([r, z]) => [r * IN, z * IN]), 'red', { axis: 'z', seg: 64 }),
    lathe([[1.0, ZF[0]], [RF - 0.08, ZF[0]], [RF, ZF[0] + 0.08], [RF, ZF[1] - 0.08], [RF - 0.08, ZF[1]], [1.0, ZF[1]]].map(([r, z]) => [r * IN, z * IN]), 'red', { axis: 'z', seg: 72 }),
    lathe([[1.0, -ZF[1]], [RF - 0.08, -ZF[1]], [RF, -ZF[1] + 0.08], [RF, -ZF[0] - 0.08], [RF - 0.08, -ZF[0]], [1.0, -ZF[0]]].map(([r, z]) => [r * IN, z * IN]), 'red', { axis: 'z', seg: 72 }),
    // Moyeux soudés sur les joues (côté extérieur) et voiles intérieurs.
    ...[1, -1].map((s) => at(ring(1.9 * IN, 1.0 * IN, 0.5 * IN, 'red', { axis: 'z', seg: 32 }), p3(0, 0, s * (ZF[1] + 0.25)))),
    ...[1, -1].map((s) => at(ring(3.5 * IN, 1.0 * IN, 0.375 * IN, 'red', { axis: 'z', seg: 32 }), p3(0, 0, s * (ZF[0] - 0.19)))),
    // Arbre.
    lathe([[0, -13.35], [0.7, -13.35], [0.75, -13.3], [0.75, -12.45], [1.0, -12.4], [1.0, 12.4], [0.5, 12.45], [0.5, 13.4], [0.46, 13.45], [0, 13.45]].map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 32 }),
    at(box(0.25 * IN, 0.2 * IN, 0.9 * IN, 'steel'), p3(0, 0.5, 12.95)), // clavette 1/4 du pignon 40BS14
    // Trou d'ancrage du câble dans la joue droite (pastille sombre).
    at(cyl(0.3 * IN, 0.52 * IN, 'blackOxide', { axis: 'z', seg: 16 }), p3(4.6 * Math.cos(2.4), 4.6 * Math.sin(2.4), ZF[0] + 0.25)),
  );
  P('4', at(tambour, p3(0, HA, 0)), [0, 3, 0]);

  // 22 — arbres 206-029 (×2) : tétons Ø 3/4 sur la face extérieure de chaque joue (dessin : l'un au droit du grand
  // trou de la plaque gauche, l'autre sur la joue droite).
  for (const [s, a] of [[1, 200], [-1, -20]]) {
    const ar = (a * Math.PI) / 180;
    P('22', at(cyl(0.375 * IN, 0.6 * IN, 'steel', { axis: 'z', seg: 20 }), p3(6.5 * Math.cos(ar), HA + 6.5 * Math.sin(ar), s * (ZF[1] + 0.3))), [0, 3, s * 7]);
  }

  // ---------------------------------------------------------------- 8 — entretoises 206-420 (Ø 1 po) entre les plaques ; 24 — vis 3/8 × 1 aux bouts
  for (const [x, y] of RODS) P('8', at(lathe([[0, -ZP[0]], [0.46, -ZP[0]], [0.5, -ZP[0] + 0.04], [0.5, ZP[0] - 0.04], [0.46, ZP[0]], [0, ZP[0]]].map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 24 }), p3(x, y, 0)), [x * 0.3, 9, 0]);
  const rodBolts = RODS.flatMap(([x, y]) => [1, -1].map((s) => ({ s, o: at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: s > 0 ? 'z' : '-z' }), p3(x, y, s * ZP[1])) })));
  each('24', rodBolts.map((b) => b.o), (i) => [RODS[i >> 1][0] * 0.3, 9, rodBolts[i].s * 8]);

  // ---------------------------------------------------------------- 9 — paliers à bride pilotés MFC-2 (4 boulons), sur les faces extérieures
  // Bride ronde Ø 5 3/8, centrage dans l'alésage Ø 3 1/4, corps Ø 4, insert à collier de blocage (2 vis).
  // Modelé côté +Z ; celui de gauche est le même tourné d'un demi-tour autour de Y.
  const palier = () => group(
    lathe([[1.0, 0], [1.6, 0], [1.6, 0.25], [2.69, 0.25], [2.69, 0.75], [2.0, 0.85], [2.0, 1.35], [1.0, 1.35]]
      .map(([r, z]) => [r * IN, (ZP[1] - 0.25 + z) * IN]), 'charcoal', { axis: 'z', seg: 40 }),
    at(ring(1.4 * IN, 1.0 * IN, 0.4 * IN, 'steel', { axis: 'z', seg: 32 }), p3(0, 0, ZP[1] + 1.3)),
    at(cyl(0.12 * IN, 0.2 * IN, 'blackOxide', { axis: 'y', seg: 6 }), p3(0, 1.45, ZP[1] + 1.3)),
    at(cyl(0.09 * IN, 0.15 * IN, 'zinc', { axis: 'y', seg: 8 }), p3(0, 2.05, ZP[1] + 0.9)), // graisseur
  );
  P('9', at(palier(), p3(0, HA, 0)), [0, 0, 16]);
  P('9', at(palier(), p3(0, HA, 0), [0, Math.PI, 0]), [0, 5, -24]);
  // 25 — vis à embase 1/2-13 × 1 1/4 : 4 par palier, 2 par taquet du fond (16).
  const hf = (x, y, z, s) => group(at(bolt(0.5 * IN, 1.25 * IN, 'zinc', { axis: s > 0 ? 'z' : '-z' }), p3(x, y, z + s * 0.08)), at(cyl(0.5 * IN, 0.08 * IN, 'zinc', { axis: 'z', seg: 24 }), p3(x, y, z + s * 0.04)));
  each('25', BRG.map(([x, y]) => hf(x, y, ZP[1] + 0.5, 1)), [0, 0, 20]);
  each('25', BRG.map(([x, y]) => hf(x, y, -ZP[1] - 0.5, -1)), [0, 5, -28]);
  each('25', [1, -1].flatMap((s) => BLOCK_BOLTS.map(([x, y]) => hf(x, y, s * ZP[1], s))), (i) => [0, -5, i < 4 ? 15 : -19]);

  // ---------------------------------------------------------------- côté −Z : 21 — bague d'encodeur 206-028, 20 — support de moteur 206-027, 36 — vis de pression
  // Bague : disque Ø 4 1/2 × 1/4 à quatre encoches (cibles du capteur), moyeu Ø 2 sur le bout Ø 1 1/2 de l'arbre.
  const notches = [0, 90, 180, 270].map((a) => {
    const ar = (a * Math.PI) / 180, c = Math.cos(ar), s = Math.sin(ar);
    return [[-0.3, 1.85], [0.3, 1.85], [0.3, 2.4], [-0.3, 2.4]].map(([u, v]) => [u * c - v * s, u * s + v * c]);
  });
  const discPts = circle([0, 0], 2.25, 64);
  const encodeur = group(
    tole(discPts, [[0, 0, 0.75], ...notches], 0.25, 'darkSteel', 0, 24),
    at(ring(1.0 * IN, 0.75 * IN, 0.45 * IN, 'darkSteel', { axis: 'z', seg: 28 }), p3(0, 0, -0.35)),
  );
  P('21', at(encodeur, p3(0, HA, -12.75)), [0, 6, -30]);
  // Support : bride Ø 10 × 1/2 sur la plaque gauche (6 vis rep. 29), fût Ø 8 1/2 / 6 1/2 à deux fenêtres (accès à
  // l'accouplement), bride de bout Ø 8 1/2 à alésage de centrage Ø 5 et quatre trous taraudés (moteur non listé).
  const z20 = [-ZP[1], -14.75];
  const mmHoles = MM_BOLTS.map(([x, y]) => [x, y - HA, 0.2]);
  const support = group(
    tole(circle([0, 0], 5.0, 64), [[0, 0, 3.25], ...mmHoles], 0.5, 'red', z20[0] - 0.25),
    S.slotted(4.25 * IN, 3.25 * IN, 0, 2.75 * IN, [{ a: Math.PI / 2, w: 1.1, y0: 0.6 * IN, y1: 2.15 * IN }, { a: -Math.PI / 2, w: 1.1, y0: 0.6 * IN, y1: 2.15 * IN }], 'red', { axis: '-z', pos: p3(0, 0, z20[0] - 0.5) }),
    tole(circle([0, 0], 4.25, 64), [[0, 0, 2.5], ...[45, 135, 225, 315].map((a) => [3.4 * Math.cos((a * Math.PI) / 180), 3.4 * Math.sin((a * Math.PI) / 180), 0.25])], 0.5, 'red', z20[1] + 0.25),
  );
  P('20', at(support, p3(0, HA, 0)), [0, 8, -38]);
  each('29', MM_BOLTS.map(([x, y]) => at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: '-z' }), p3(x, y, -ZP[1] - 0.5))), [0, 8, -44]);
  // 36 — vis de pression 5/16-18 × 3/4 : moyeu de la bague d'encodeur et fût du support (dessin).
  P('36', at(cyl(0.156 * IN, 0.75 * IN, 'blackOxide', { axis: 'y', seg: 6 }), p3(0, HA + 1.05, -13.35)), [0, 9, -30]);
  P('36', at(cyl(0.156 * IN, 0.75 * IN, 'blackOxide', { axis: 'y', seg: 6 }), p3(0, HA + 4.05, -14.4)), [0, 12, -38]);

  // ---------------------------------------------------------------- 6 — vis d'enroulement 206-419 (P016)
  const vis = api.sub('P016', { suiveur: opts.suiveur });
  vis.position.set(...HOIST_SCREW);
  P('6', vis, [-11, -2, 0]);
  // 30 — vis 3/8-16 × 1 3/4 des pieds des porte-roulements (tête dessus) ; 28 — écrous Nylstop sous le fond.
  each('30', feet.map(([x, z]) => at(bolt(0.375 * IN, 1.75 * IN, 'brass'), p3(x, 1.0, z))), [-11, 5, 0]);
  each('28', feet.map(([x, z]) => at(nut(0.5625 * IN, 0.33 * IN, 'zinc'), p3(x, -0.165, z))), [-11, -10, 0]);

  // ---------------------------------------------------------------- transmission (côté +Z)
  // Pignons calés sur la chaîne : un creux de denture au droit d'un axe de maillon.
  const pins = resample(ch.pts, 86);
  const phase = (c, r, N) => {
    let best = null;
    for (const q of pins) { const d = Math.abs(Math.hypot(q[0] - c[0], q[1] - c[1]) - r); if (!best || d < best.d) best = { d, q }; }
    const step = (2 * Math.PI) / N;
    return Math.atan2(best.q[1] - c[1], best.q[0] - c[0]) - 0.85 * step;
  };
  const pignon = (c, N, t, mat, hole) => {
    const r = rp(N);
    const g = gear((r - 0.156) * IN, (r + (N > 20 ? 0.13 : 0.12)) * IN, N, t * IN, mat, { axis: 'z', hole: hole * IN });
    g.rotation.z = phase(c, r, N);
    return g;
  };
  // 7 — pignon 206-033 (52 dents, noir) et sa bague (verte sur le dessin) sur le bout Ø 1 po de la vis ; 34 — goupille.
  P('7', group(
    at(pignon(B, N_VIS, 0.284, 'black', 1.0), p3(B[0], B[1], ZC)),
    at(ring(1.0 * IN, 0.5 * IN, 0.86 * IN, 'black', { axis: 'z', seg: 32 }), p3(B[0], B[1], ZC - 0.57)),
    at(ring(0.72 * IN, 0.5 * IN, 0.08 * IN, 'green', { axis: 'z', seg: 28 }), p3(B[0], B[1], ZC + 0.18)),
  ), [0, 0, 20]);
  P('34', at(cyl(0.156 * IN, 2.0 * IN, 'steel', { axis: 'y', seg: 10 }), p3(B[0], B[1], ZC - 0.55)), [0, 5, 20]);
  // 32 — jonc extérieur pour arbre de 1 po, contre le roulement du porte-roulement droit.
  P('32', at(torus(0.53 * IN, 0.04 * IN, 'blackOxide', { axis: 'z' }), p3(B[0], B[1], 9.895)), [0, 0, 14]);
  // 23 — pignon 40BS14 alésage 1 po (moyeu côté palier, vis de pression) sur le bout de l'arbre du tambour.
  P('23', group(
    at(pignon(A, N_TAMBOUR, 0.284, 'darkSteel', 0.5), p3(0, HA, ZC)),
    at(ring(0.875 * IN, 0.5 * IN, 0.5 * IN, 'darkSteel', { axis: 'z', seg: 28 }), p3(0, HA, ZC - 0.39)),
    at(cyl(0.125 * IN, 0.15 * IN, 'blackOxide', { axis: 'y', seg: 6 }), p3(0, HA - 0.88, ZC - 0.39)),
  ), [0, 0, 22]);
  // 33 — tendeur Rosta SE15 : corps carré sur la plaque, bras de 80 mm vers le pignon tendeur ; 35 — vis M8 × 40.
  const armAng = Math.atan2(C[1] - ROSTA[1], C[0] - ROSTA[0]), armL = Math.hypot(C[0] - ROSTA[0], C[1] - ROSTA[1]);
  const bras = group(at(box((armL + 0.9) * IN, 0.9 * IN, 0.2 * IN, 'darkSteel', { r: 0.004 }), p3(armL / 2, 0, 0)));
  bras.rotation.z = armAng;
  bras.position.set(ROSTA[0] * IN, ROSTA[1] * IN, 12.35 * IN);
  P('33', group(
    at(box(1.6 * IN, 1.6 * IN, 1.25 * IN, 'safety', { r: 0.003 }), p3(ROSTA[0], ROSTA[1], ZP[1] + 0.625), [0, 0, 0.3]),
    at(box(1.1 * IN, 1.1 * IN, 1.3 * IN, 'rubber', { r: 0.004 }), p3(ROSTA[0], ROSTA[1], ZP[1] + 0.63), [0, 0, 0.3 + Math.PI / 4]),
    bras,
  ), [0, -4, 20]);
  P('35', at(bolt(8 / 25.4 * IN, 40 / 25.4 * IN, 'zinc', { axis: 'z' }), p3(ROSTA[0], ROSTA[1], 12.45)), [0, -4, 26]);
  // 12 — pignon tendeur N0.500-10S (10 dents) sur son axe, roulement et entretoise, au bout du bras.
  P('12', group(
    at(pignon(C, N_TENDEUR, 0.284, 'darkSteel', 0.0), p3(C[0], C[1], ZC)),
    at(ring(0.5 * IN, 0.25 * IN, 0.45 * IN, 'steel', { axis: 'z', seg: 20 }), p3(C[0], C[1], ZC - 0.37)),
    at(bolt(0.375 * IN, 1.1 * IN, 'zinc', { axis: 'z' }), p3(C[0], C[1], ZC + 0.14)),
    at(nut(0.5625 * IN, 0.33 * IN, 'zinc', { axis: 'z' }), p3(C[0], C[1], 12.25 - 0.165)),
  ), [0, -4, 24]);

  // Chaîne RS40-1-RP, 86 pas (note de la page 14 : pas de ligne dans la liste → objet sans repère).
  // Maillons intérieurs et extérieurs alternés, rouleaux ; maille patente (agrafe) et demi-maille (plaques coudées).
  const p = 0.5, hp = 0.235, tPl = 0.06;
  const plOut = [...arc([0, 0], hp, 90, 270, 8), ...arc([p, 0], hp, -90, 90, 8)]; // plaque de maillon (oblong)
  const maillons = [], rouleaux = [], speciales = [];
  for (let i = 0; i < pins.length; i++) {
    const a = pins[i], b = pins[(i + 1) % pins.length];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const inner = i % 2 === 0;
    const zz = inner ? 0.156 + tPl / 2 + 0.005 : 0.156 + tPl * 1.5 + 0.015;
    const demi = i === pins.length - 1, patente = i === 1;
    for (const s of [1, -1]) {
      const g = group(tole(plOut, [], tPl, 'darkSteel', 0, 6)); // axes : têtes de goupilles ci-dessous
      g.position.set(a[0] * IN, a[1] * IN, (ZC + s * zz) * IN);
      g.rotation.z = ang;
      if (demi) g.rotation.y = s * Math.atan2(0.09, p); // plaques coudées de la demi-maille
      (patente || demi ? speciales : maillons).push(g);
    }
    rouleaux.push(at(cyl(0.156 * IN, 0.31 * IN, 'darkSteel', { axis: 'z', seg: 10 }), p3(a[0], a[1], ZC)));
    if (!inner || demi) rouleaux.push(at(cyl(0.08 * IN, 0.62 * IN, 'steel', { axis: 'z', seg: 8 }), p3(a[0], a[1], ZC)));
    if (patente) { // agrafe à ressort sur les deux axes de la maille patente
      const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const cl = at(box(0.62 * IN, 0.2 * IN, 0.03 * IN, 'steel', { r: 0.0008 }), p3(c[0], c[1], ZC + 0.31), [0, 0, ang]);
      speciales.push(cl);
    }
  }
  api.add(group(merged(maillons, 'darkSteel'), merged(rouleaux, 'darkSteel'), merged(speciales, 'steel')));

  // ---------------------------------------------------------------- 5 — volant 206-018 au bout de la vis ; 11 — ressort ; 10 — rondelle 206-004 ; 31 — boulon à épaulement
  // Volant embouti Ø 6 1/2 à jante ronde, moyeu sur le bout Ø 1 po (14,1 à 14,84 po) puis sur l'épaulement du
  // boulon ; le ressort 9657K338 pousse le volant contre le bout de l'arbre (volant débrayable).
  const zH = 14.1;
  P('5', at(group(
    lathe([[0.5, zH], [0.9, zH], [0.9, zH + 0.3], [2.75, zH + 0.12], [2.9, zH + 0.12], [2.9, zH + 0.26], [2.75, zH + 0.26], [1.05, zH + 0.48], [0.9, zH + 0.9], [0.25, zH + 0.9], [0.25, zH + 0.74], [0.5, zH + 0.74]]
      .map(([r, z]) => [r * IN, z * IN]), 'lightGrey', { axis: 'z', seg: 48 }),
    at(torus(3.05 * IN, 0.3 * IN, 'lightGrey', { axis: 'z' }), p3(0, 0, zH + 0.2)),
  ), p3(B[0], B[1], 0)), [0, 0, 28]);
  P('11', at(merged([S.spring(0.42 * IN, 0.07 * IN, 0.85 * IN, 5, 'steel', { axis: 'z' })], 'steel'), p3(B[0], B[1], zH + 0.9 + 0.425)), [0, 0, 32]);
  P('10', at(ring(0.875 * IN, 0.265 * IN, 0.19 * IN, 'steel', { axis: 'z', seg: 32 }), p3(B[0], B[1], zH + 1.75 + 0.095)), [0, 0, 35]);
  P('31', at(group(
    at(cyl(0.375 * IN, 0.31 * IN, 'blackOxide', { axis: 'z', seg: 24 }), p3(0, 0, 0.155)),
    at(cyl(0.125 * IN, 0.02 * IN, 'gunmetal', { axis: 'z', seg: 6 }), p3(0, 0, 0.31)),
    at(cyl(0.25 * IN, 1.25 * IN, 'blackOxide', { axis: 'z', seg: 16 }), p3(0, 0, -0.625)),
    at(cyl(0.1875 * IN, 0.6 * IN, 'blackOxide', { axis: 'z', seg: 12 }), p3(0, 0, -1.55)),
  ), p3(B[0], B[1], zH + 1.94)), [0, 0, 38]);

  // ---------------------------------------------------------------- 13 — carter de chaîne 206-422 (garde du treuil)
  // Boîte en tôle 14 ga de la plaque droite (z 11) au plan 14 : ceinture et face, enveloppe des deux pignons, du
  // tendeur et du palier ; trou du moyeu du volant ; quatre pattes pliées sur la plaque (rep. 29 et rondelles 27).
  const t14 = 0.075;
  const zg13 = [ZP[1], 14.0];
  P('13', group(
    tole(g13, [[B[0], B[1], 0.95]], t14, 'red', zg13[1] - t14 / 2, 24),
    tole(g13, [offsetConvex(g13, t14)], zg13[1] - zg13[0] - t14, 'red', (zg13[0] + zg13[1] - t14) / 2, 24),
    ...G13_TABS.map(([x, y]) => at(box(1.1 * IN, 1.1 * IN, t14 * IN, 'red', { r: 0.003 }), p3(x, y, zg13[0] + t14 / 2))),
  ), [0, 6, 32]);
  each('27', G13_TABS.map(([x, y]) => at(washer(0.406 * IN, 0.2 * IN, 0.065 * IN, 'zinc', { axis: 'z' }), p3(x, y, zg13[0] + t14 + 0.0325))), [0, 6, 36]);
  each('29', G13_TABS.map(([x, y]) => at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: 'z' }), p3(x, y, zg13[0] + t14 + 0.065))), [0, 6, 40]);

  // ---------------------------------------------------------------- 15 — garde du tambour 206-424 (tôle perforée pliée)
  // Cinq pans en travers du tambour entre les plaques (rayon ≈ 10 po, sous la tête des plaques), perforés en
  // quinconce sauf le dernier ; deux pattes à chaque bout, vissées aux plaques (rep. 26).
  const pans15 = [];
  for (let i = 0; i < G15.length - 1; i++) {
    const a = G15[i], b = G15[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const holes = i < 4 ? perfs(0.6, L - 0.6, -zIn + 0.9, zIn - 0.9, 0.17, 0.6).map(m) : [];
    pans15.push(K.panel(m([a])[0], m([b])[0], -zIn * IN, zIn * IN, t14 * IN, 'red', holes, 1));
  }
  const tabs15 = [1, -1].flatMap((s) => G15_TABS.map(([x, y]) => at(box(1.2 * IN, 1.2 * IN, t14 * IN, 'red', { r: 0.003 }), p3(x, y, s * (zIn - t14 / 2)))));
  P('15', group(...pans15, ...tabs15), [4, 18, 0]);
  each('26', [1, -1].flatMap((s) => G15_TABS.map(([x, y]) => at(bolt(0.375 * IN, 0.75 * IN, 'brass', { axis: s > 0 ? 'z' : '-z' }), p3(x, y, s * ZP[1])))), (i) => [4, 18, i < 2 ? 8 : -8]);

  // ---------------------------------------------------------------- 14 — garde 206-423 de la vis (tôle perforée) ; 16 — doublure 0,250 po de la fente
  // Face arrière (−X) du fond jusqu'au dessus, fente oblongue à la hauteur du câble (sortie vers la poulie du
  // mât), dessus jusqu'au bord des joues du tambour ; pattes pliées sur les plaques (rep. 29) ; perforations sur le
  // dessus et sous la fente. Doublure en UHMW noir autour de la fente, côté intérieur.
  const xF = -16.0, yTop = 11.0, xTopEnd = -8.6;
  const yC = YS + 2.0 + 1.6 + 0.625 + 0.125; // hauteur du câble sur les rouleaux horizontaux (P016)
  const slotPoly = slot([0, yC], 18.5, 1.0, 0); // dans le repère (u = z, v = y) de la face
  const faceHoles = [slotPoly.map(([u, v]) => [u, v])]
    .concat(perfs(-zIn + 0.9, zIn - 0.9, 1.6, yC - 1.4, 0.17, 0.6).map((h) => h));
  // Face −X : tôle dans le plan YZ (u = z, v = y), extrudée selon X.
  const faceG = group(K.sheet(m([[-zIn, 0.55], [zIn, 0.55], [zIn, yTop], [-zIn, yTop]]), faceHoles.map(m), t14 * IN, 'red', 0, 12));
  faceG.rotation.y = -Math.PI / 2; // u (x local) → +Z, épaisseur (z local) → +X
  faceG.position.set((xF + t14 / 2) * IN, 0, 0);
  const top14 = K.panel(m([[xF, yTop]])[0], m([[xTopEnd, yTop]])[0], -zIn * IN, zIn * IN, t14 * IN, 'red',
    perfs(0.7, xTopEnd - xF - 0.6, -zIn + 0.9, zIn - 0.9, 0.17, 0.6).map(m), -1);
  const foot14 = K.panel(m([[xF, 0.55]])[0], m([[xF + 1.0, 0.55]])[0], -zIn * IN, zIn * IN, t14 * IN, 'red', [], -1);
  const tabs14 = [1, -1].flatMap((s) => G14_TABS.map(([x, y]) => at(box(1.2 * IN, 1.2 * IN, t14 * IN, 'red', { r: 0.003 }), p3(x, y, s * (zIn - t14 / 2)))));
  P('14', group(faceG, top14, foot14, ...tabs14), [-16, 0, 0]);
  each('29', [1, -1].flatMap((s) => G14_TABS.map(([x, y]) => at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: s > 0 ? 'z' : '-z' }), p3(x, y, s * ZP[1])))), (i) => [-16, 0, i < 2 ? 8 : -8]);
  const liner = group(K.sheet(m(slot([0, yC], 20.0, 2.4, 0)), [m(slotPoly)], 0.25 * IN, 'plastic', 0, 12));
  liner.rotation.y = -Math.PI / 2;
  liner.position.set((xF + t14 + 0.125) * IN, 0, 0);
  P('16', liner, [-22, 0, 0]);

  // ---------------------------------------------------------------- 19 — plaque C5214-PL : cornière sous la fente (dehors) ; 18 — plaque C5213-PL : fermeture du bout +Z de la garde, contre la plaque droite
  const ang19 = group(
    at(box(0.125 * IN, 1.5 * IN, 16.0 * IN, 'red', { r: 0.001 }), p3(xF - 0.0625, yC - 1.4, 0)),
    at(box(1.5 * IN, 0.125 * IN, 16.0 * IN, 'red', { r: 0.001 }), p3(xF - 0.75, yC - 2.1, 0)),
  );
  P('19', ang19, [-24, -3, 0]);
  each('26', [-5, 5].map((z) => at(bolt(0.375 * IN, 0.75 * IN, 'brass', { axis: 'x' }), p3(xF - 0.125, yC - 1.0, z))), [-26, -3, 0]);
  P('18', tole([[-15.9, 9.2], [-8.8, 9.2], [-8.8, 10.95], [-15.9, 10.95]], [...G18_BOLTS.map(([x, y]) => [x, y, 0.2])], 0.125, 'red', zIn - 0.0625), [-6, 4, 6]);
  each('26', G18_BOLTS.map(([x, y]) => at(bolt(0.375 * IN, 0.75 * IN, 'brass', { axis: 'z' }), p3(x, y, ZP[1]))), [-6, 4, 12]);

  // ---------------------------------------------------------------- 17 — garde latérale 206-431 (gauche, sur la plaque 206-416)
  // Tôle 14 ga : échancrure en arc autour du support de moteur, fenêtre, zone perforée au-dessus de la vis.
  const g17 = [[X_AR, 0.6], [-7.0, 0.6], [-7.0, 6.2], [-1.2, 6.2], ...arc(A, 5.6, -102.2, -235, 24), [-7.6, 16.4], [-9.0, 11.3], [X_AR, 11.3]];
  const g17Holes = [[[-14.6, 1.8], [-8.2, 1.8], [-8.2, 5.4], [-14.6, 5.4]], ...G17_BOLTS.map(([x, y]) => [x, y, 0.2]), [...G17_TOP, 0.2],
    ...perfs(-15.4, -9.6, 6.2, 10.6, 0.17, 0.6)];
  P('17', tole(g17, g17Holes, t14, 'red', -ZP[1] - t14 / 2), [-4, 6, -26]);
  each('26', G17_BOLTS.map(([x, y]) => at(bolt(0.375 * IN, 0.75 * IN, 'brass', { axis: '-z' }), p3(x, y, -ZP[1] - t14))), [-4, 6, -30]);
  P('24', at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: '-z' }), p3(G17_TOP[0], G17_TOP[1], -ZP[1] - t14)), [-4, 6, -30]);

  return { view: { dir: [-1, 0.75, 1.05] } };
}
