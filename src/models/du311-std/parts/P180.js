// P180 — Châssis avant de la glissière « SLIDE FRONT FRAME ASSY » CX037661 rév.
// 0 (page 180, isométrique éclatée ; implantation d'après P164, P166 et P168).
// Mécano-soudé (4, « FRONT DECK WELDMENT ») boulonné sur le nez du porteur :
// - paroi arrière 1 1/4 po, percée des douze passages des vis de fixation
//   (P168 rep. 7) et de deux grands trous d'allègement ; au bas de sa face
//   avant, les deux chapes des œils de fond des vérins de basculement (joues
//   1 1/4 po garnies de bagues Connex 250-275-125, 2 ; axes Ø 2 1/2, 1, à
//   plaquette d'arrêt, vis 5 et rondelle Nord-Lock 7) ;
// - deux caissons latéraux (flasques extérieurs percés pour les
//   stabilisateurs avant P194) ;
// - deux bras en col de cygne (deux âmes et une semelle) qui descendent de
//   la paroi arrière jusqu'aux sièges des paliers de l'arbre de basculement,
//   avec les pattes taraudées des vis de poussée ;
// - poutre transversale avant (tube 6 × 4 po) et caisson transversal haut ;
// - deux plats de fixation en dessous, où se boulonne la tôle de protection
//   du réservoir d'air (3 ; vis 6, rondelles Nord-Lock 8, écrous 9).
// Repère : origine au milieu de la face arrière (appui sur le nez du porteur,
// x = M.nose dans la machine), au niveau du dessous du châssis (y = 0.5 dans
// la machine) ; axes de la machine (X vers l'avant, Y vers le haut, Z à
// droite) ; P168 le place en DECK (_slide.js).
// Encombrement ≈ 0.95 (X) × 0.85 (Y) × 1.39 (Z) m.
// Cotes : axes Ø 2 1/2 et bagues (liste) ; axes des vérins de basculement en
// SLIDE.dump.a, sièges des paliers sous SLIDE.pivot ; le reste d'après les
// proportions des vues (largeur hors tout ≈ celle des garde-boue avant).

import { IN, DECK, DECK_BOLTS, SLIDE, slabZ, slabX, slabY, bx, along, hhcs, hexNut, nordLock, arc } from './_slide.js';

export default function P180(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, weld, group, at, plate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const PAINT = 'lightGrey';
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const [OX, OY] = DECK;
  const pin = [SLIDE.dump.a[0] - OX, SLIDE.dump.a[1] - OY]; // axes des chapes (local)
  const DZ = SLIDE.dump.z;
  const padY = SLIDE.pivot.y - 0.105 - OY; // dessus des sièges de paliers
  const padX = [SLIDE.pivot.x - 0.18 - OX, SLIDE.pivot.x + 0.18 - OX];
  const WT = 1.25 * IN; // paroi arrière

  // ================================================================ 4 — mécano-soudé
  const w = [], beads = [];
  // Paroi arrière : contour (z, y), échancrure haute au milieu (passage des vérins).
  const wall = [[-0.5, 0], [0.5, 0], [0.5, 0.85], [0.4, 0.85], [0.3, 0.68], [-0.3, 0.68], [-0.4, 0.85], [-0.5, 0.85]];
  const holes = [[-0.12, 0.38, 0.075], [0.12, 0.38, 0.075], ...DECK_BOLTS.map(([, y, z]) => [z, y - OY, 0.53 * IN])];
  w.push(slabX(S, wall, 0, WT, PAINT, holes));
  // Caissons latéraux : âme intérieure, flasque extérieur (trous des stabilisateurs), dessus, dessous, fond avant.
  for (const s of [-1, 1]) {
    const outer = [[WT, 0], [0.7, 0], [0.7, 0.3], [0.6, 0.4], [0.6, 0.5], [WT, 0.5]];
    const ohs = [];
    for (const x of [0.33, 0.51]) for (let k = 0; k < 6; k++) ohs.push([x, 0.06 + k * 0.066, 0.4 * IN]);
    w.push(slabZ(S, outer, s * 0.61, s * 0.626, PAINT, ohs));
    w.push(slabZ(S, outer, s * 0.47, s * 0.486, PAINT));
    w.push(bx(S, WT, 0.6, 0.484, 0.5, Math.min(s * 0.47, s * 0.626), Math.max(s * 0.47, s * 0.626), PAINT));
    w.push(bx(S, WT, 0.7, 0, 0.016, Math.min(s * 0.47, s * 0.626), Math.max(s * 0.47, s * 0.626), PAINT));
    w.push(bx(S, 0.684, 0.7, 0.016, 0.3, Math.min(s * 0.486, s * 0.61), Math.max(s * 0.486, s * 0.61), PAINT));
    // Bras en col de cygne : deux âmes (z ±0.555 et ±0.685) et semelle, du haut de la paroi aux sièges.
    const web = [[WT, 0.5], [padX[1], 0.5], [padX[1], padY], [padX[0], padY], [0.42, 0.66], [0.25, 0.8], [0.2, 0.85], [WT, 0.85]];
    for (const zc of [0.555, 0.685]) w.push(slabZ(S, web, s * (zc - 0.008), s * (zc + 0.008), PAINT));
    // semelle : segments le long du profil haut
    const top = [[WT, 0.85], [0.2, 0.85], [0.25, 0.8], [0.42, 0.66], [padX[0], padY], [padX[1], padY]];
    for (let i = 0; i < top.length - 1; i++) {
      const [x0, y0] = top[i], [x1, y1] = top[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
      const t = i === top.length - 2 ? 0.025 : 0.016; // siège du palier plus épais
      w.push(at(box(len + 0.004, t, 0.146, PAINT), [(x0 + x1) / 2 - Math.sin(a) * t / 2, (y0 + y1) / 2 + Math.cos(a) * t / 2, s * 0.62], [0, 0, a]));
    }
    // pattes taraudées des vis de poussée, devant et derrière le siège
    for (const [x0, x1] of [[padX[0] - 0.025, padX[0]], [padX[1], padX[1] + 0.025]]) {
      w.push(bx(S, x0, x1, padY, padY + 0.075, s * 0.585, s * 0.655, PAINT, 0.003));
    }
    // plats de fixation de la tôle de protection, sous le châssis
    w.push(bx(S, 0.22, 0.78, 0, 0.025, s * 0.36, s * 0.42, PAINT));
    beads.push(weld([[WT, 0.5, s * 0.555], [WT, 0.85, s * 0.555]], 0.008, PAINT));
    beads.push(weld([[WT, 0.0, s * 0.47], [WT, 0.5, s * 0.47]], 0.008, PAINT));
    beads.push(weld([[padX[0], padY, s * 0.547], [padX[1], padY, s * 0.547]], 0.006, PAINT));
  }
  // Poutre transversale avant (tube 6 × 4 po) entre les caissons, plat de renfort devant ;
  // caisson transversal haut derrière le passage des vérins.
  w.push(bx(S, 0.65, 0.8, 0.12, 0.28, -0.47, 0.47, PAINT, 0.004));
  w.push(bx(S, 0.8, 0.812, 0.17, 0.23, -0.3, 0.3, PAINT));
  w.push(bx(S, 0.1, 0.25, 0.65, 0.8, -0.547, 0.547, PAINT, 0.004));
  beads.push(weld([[0.65, 0.28, -0.47], [0.65, 0.28, 0.47]], 0.008, PAINT));
  beads.push(weld([[0.1, 0.65, -0.547], [0.1, 0.65, 0.547]], 0.008, PAINT));
  // Chapes des œils de fond des vérins de basculement : joues 1 1/4 po (perpendiculaires à Z).
  const cheekT = 1.25 * IN, cheekC = 1.0 * IN + 0.003 + cheekT / 2;
  const cheek = [[WT, pin[1] - 0.065], [pin[0], pin[1] - 0.065], ...arc(pin[0], pin[1], 0.065, -Math.PI / 2, Math.PI / 2, 14).slice(1), [WT, pin[1] + 0.065]];
  for (const s of [-1, 1]) {
    for (const k of [-1, 1]) {
      const zc = s * DZ + k * cheekC;
      w.push(slabZ(S, cheek, zc - cheekT / 2, zc + cheekT / 2, PAINT, [[pin[0], pin[1], 1.375 * IN]]));
      beads.push(weld([[WT, pin[1] - 0.06, zc - cheekT / 2 - 0.003], [WT, pin[1] + 0.06, zc - cheekT / 2 - 0.003]], 0.007, PAINT));
    }
  }
  P('4', group(merged(w, PAINT), merged(beads, PAINT)), [0, 0, 0]);

  // ================================================================ 1 — axes Ø 2 1/2, 2 — bagues, 5 + 7
  for (const s of [-1, 1]) {
    const z0 = s * (DZ - cheekC - cheekT / 2 - 0.006), z1 = s * (DZ + cheekC + cheekT / 2 + 0.004);
    const len = Math.abs(z1 - z0);
    const pinG = group(
      lathe([[0, 0], [1.25 * IN - 0.003, 0], [1.25 * IN, 0.003], [1.25 * IN, len], [0, len]], 'steel', { seg: 28 }),
      at(box(0.1, 0.012, 0.045, 'steel', { r: 0.003 }), [0.03, len + 0.006, 0]),
    );
    P('1', put(pinG, [pin[0], pin[1], z0], [0, 0, s]), [0, 0, s * 0.35]);
    const bp = [pin[0] + 0.06, pin[1], z1 + s * 0.012];
    P('7', put(nordLock(S, THREE, 0.375), bp, [0, 0, s]), [0, 0, s * 0.42]);
    P('5', put(hhcs(S, THREE, 0.375, 1.5), [bp[0], bp[1], bp[2] + s * 0.0026], [0, 0, s]), [0, 0, s * 0.48]);
    for (const k of [-1, 1]) {
      const zc = s * DZ + k * cheekC;
      P('2', at(lathe([[1.25 * IN, -cheekT / 2], [1.375 * IN, -cheekT / 2], [1.375 * IN, cheekT / 2], [1.25 * IN, cheekT / 2], [1.25 * IN, -cheekT / 2]], 'brass', { axis: 'z', seg: 28 }), [pin[0], pin[1], zc]), [0, 0, s * 0.2 + k * 0.05]);
    }
  }

  // ================================================================ 3 — tôle de protection du réservoir d'air ; 6, 8, 9
  const G3 = { x0: 0.22, x1: 0.78, z: 0.42, t: 0.1875 * IN };
  const guard = plate(G3.x1 - G3.x0, 2 * G3.z, G3.t, PAINT, { holes: [[0, 0, 0.065], ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * 0.18, sz * 0.39, 0.28 * IN]))], r: 0.03 });
  P('3', at(guard, [(G3.x0 + G3.x1) / 2, -G3.t / 2, 0]), [0, -0.3, 0]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = (G3.x0 + G3.x1) / 2 + sx * 0.18, z = sz * 0.39;
      P('8', at(nordLock(S, THREE, 0.5), [x, 0.025, z]), [0, 0.15, 0]);
      P('6', at(hhcs(S, THREE, 0.5, 2.0), [x, 0.025 + 0.0028, z]), [0, 0.22, 0]);
      P('8', put(nordLock(S, THREE, 0.5), [x, -G3.t, z], [0, -1, 0]), [0, -0.38, 0]);
      P('9', put(hexNut(S, THREE, 0.5), [x, -G3.t - 0.0028, z], [0, -1, 0]), [0, -0.45, 0]);
    }
  }
  void slabY;
  return { view: { dir: [1.0, 0.7, 1.1] } };
}
