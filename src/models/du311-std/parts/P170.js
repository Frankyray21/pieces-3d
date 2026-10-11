// P170 — Glissière « SLIDEOVER ASSEMBLY » CX000423 rév. 9 (pages 170 et 172 :
// vue éclatée, isométriques et détails A, B, C des raccords de traversée).
// Cadre dressé mécano-soudé (17) : deux colonnes en caisson aux bouts, poutre
// arrière haute en tube carré, tôle arrière à grande fenêtre, trois blocs bas
// où s'attellent les tiges des vérins de basculement (axes 21 Ø 2 1/2 × 9.31,
// bagues 18, vis d'arrêt 23 et rondelles 26) ; le bas de chaque colonne
// descend en oreille jusqu'à l'arbre de basculement (8) claveté (19) et tenu
// par deux chapeaux de retenue (10, vis 24, rondelles 28). Deux barres de
// glissement Ø 4 po (6, barres soudées à collerette côté −Z, chapeaux de
// retenue 10 côté +Z) traversent les colonnes.
// Chariot : plaques porte-actionneur LH (3, côté −Z) et RH (4, côté +Z)
// boulonnées sur les faces du carter de l'actionneur rotatif (9, P174) par
// huit vis H 5/8 UNF × 1 3/4 chacune (25, rondelles 27), centrées par une
// goupille (11, vis 22, rondelle 26) ; bossages des barres garnis de bagues
// Garlock 4 × 4 1/2 × 6 po (12), racleurs (13) et chapeaux (5, quatre vis 22
// et rondelles 26) ; à l'arrière de chaque plaque, une barrette de traversée
// porte les raccords des flexibles (30 à 39 : traversées droites -6, -8, -12
// et leurs coudes NPT, unions coudées de traversée, réductions -8 → -6).
// Deux vérins de translation Ø 3 1/4 × 30 (20, P178) au-dessus et au-dessous
// du cadre, de même sens : œil de fond dans une chape sur la colonne −Z (axe
// 1, bagues 14, goupille élastique 16), œil de tige dans une chape des bras de
// la plaque RH (axe 2, bagues 15, entretoises 7, goupille 16) ; coudes 90° ORB
// → JIC (29) sur les orifices du bloc des valves.
// Repère : origine au centre du carter de l'actionneur (AC de _slide.js, sur
// l'axe de rotation SLIDE.rot à 0.297 m en arrière de la face SLIDE.face) ;
// axes de la machine (X vers l'avant, Y vers le haut, Z à droite), cadre
// dressé. Barres à x = 0.13, y = ±0.36 ; colonnes à z = ±0.77 ; arbre de
// basculement en (−0.163, −0.52) ; axes des tiges de basculement en
// (−0.243, −0.30, ±0.42) ; vérins de translation à y = ±0.51 ; bride de
// sortie de l'actionneur (appui du MCP) à x = 0.297.
// Encombrement ≈ 0.95 (X) × 1.42 (Y) × 1.80 (Z) m. Chariot au milieu de sa
// course, vérins sortis de 0.267 m (entraxe 1.27 m).
// Simulation : cadre, barres, arbre, chapes et axes de fond → « tilt » ;
// plaques, bagues, chapeaux, bras et raccords de traversée → « shift » ;
// vérins de translation détaillés « shift » / « shift2 » (tilt → shift).
// Cotes : liste (bagues, axes, visserie, raccords), dessins à l'échelle des
// barres Ø 4 po et de la bride de l'actionneur ; le reste estimé.

import { body, ramDetailed } from '../layout.js';
import {
  IN, u, G, frame, arc, slabZ, slabX, tubeZ, bx, along, hexScrew, washerD, nordLock, splitWasher,
  bulkhead, nptElbow, bulkheadElbow, jicReducer, jicElbow, hhcs, L,
} from './_slide.js';
import { CYL178 } from './P178.js';

export default function P170(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, weld, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = (obj) => body('tilt', obj);
  const H = (obj) => body('shift', obj);
  const PAINT = 'lightGrey', CPAINT = 'grey';
  const { barX: BXc, barY: BY, colZ: CZ, colW: CW, colTop: CT, colBot: CB, colFront: CF, colRear: CR } = G;
  const [PX, PY] = G.pivot;
  const [DX, DY] = G.dumpPin;
  const DZ = G.dumpZ;
  const ZO = CZ + CW / 2; // faces extérieures des colonnes
  const ZI = CZ - CW / 2; // faces intérieures
  const put = (obj, p, dir) => along(THREE, obj, dir, p);

  // Tube rectangulaire creux (paroi t) le long de Z, de z0 à z1, centré en (x, y).
  const rectTube = (w, h, t, z0, z1, x, y, mat) => {
    const sh = new THREE.Shape([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([a, b]) => new THREE.Vector2(a, b)));
    sh.holes.push(new THREE.Path([[-w / 2 + t, -h / 2 + t], [-w / 2 + t, h / 2 - t], [w / 2 - t, h / 2 - t], [w / 2 - t, -h / 2 + t]].map(([a, b]) => new THREE.Vector2(a, b))));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 4 });
    geo.translate(x, y, z0);
    return new THREE.Mesh(geo);
  };

  // ================================================================ 17 — cadre mécano-soudé
  const fr = [], frW = [];
  // Colonnes : contour latéral (x, y) avec l'oreille basse autour de l'arbre de basculement.
  const colOutline = [
    [CF, CB], [CF, CT], [CR, CT], [CR, -0.40], ...arc(PX, PY, 0.11, Math.PI, 2 * Math.PI, 14), [0.03, CB],
  ];
  for (const s of [-1, 1]) {
    fr.push(slabZ(S, colOutline, s * ZI, s * ZO, PAINT));
    // bossages des barres et de l'arbre sur les deux faces de la colonne
    for (const z of [s * ZO, s * ZI]) {
      const d = Math.sign(z) === s && Math.abs(z) > CZ ? s : -s;
      for (const [x, y, r] of [[BXc, BY, 0.085], [BXc, -BY, 0.085], [PX, PY, 0.105]]) {
        fr.push(at(lathe([[0, 0], [r, 0], [r, 0.006], [r - 0.004, 0.009], [0, 0.009]], PAINT, { axis: 'z', seg: 32 }), [x, y, z], d < 0 ? [0, Math.PI, 0] : null));
      }
    }
    // goussets d'angle intérieurs (colonne / poutre haute)
    fr.push(slabZ(S, [[CR + 0.15, CT - 0.15], [CR + 0.02, CT - 0.15], [CR + 0.15, CT - 0.02]], s * (ZI - 0.012), s * ZI, PAINT));
  }
  // Poutre arrière haute : tube carré 6 × 6 × 3/8 traversant les colonnes (bouts visibles sur les faces).
  fr.push(rectTube(0.1524, 0.1524, 0.0095, -ZO - 0.002, ZO + 0.002, -0.28, 0.368, PAINT));
  // Tôle arrière 3/4 po à grande fenêtre arrondie (on voit le fond de l'actionneur au travers).
  {
    const sh = new THREE.Shape([[-ZI, -0.18], [ZI, -0.18], [ZI, 0.30], [-ZI, 0.30]].map(([a, b]) => new THREE.Vector2(a, b)));
    const w = new THREE.Path();
    const r = 0.09, z0 = -0.44, z1 = 0.44, y0 = -0.12, y1 = 0.22;
    w.moveTo(z0 + r, y0); w.lineTo(z1 - r, y0); w.quadraticCurveTo(z1, y0, z1, y0 + r); w.lineTo(z1, y1 - r); w.quadraticCurveTo(z1, y1, z1 - r, y1);
    w.lineTo(z0 + r, y1); w.quadraticCurveTo(z0, y1, z0, y1 - r); w.lineTo(z0, y0 + r); w.quadraticCurveTo(z0, y0, z0 + r, y0);
    sh.holes.push(w);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.019, bevelEnabled: false, curveSegments: 6 });
    geo.rotateY(Math.PI / 2); // (z, y, épaisseur) → épaisseur selon +X (contour symétrique en z)
    geo.translate(CR, 0, 0);
    fr.push(new THREE.Mesh(geo));
  }
  // Blocs bas : trois caissons (centre et deux latéraux) entre lesquels entrent les œils
  // de tige des vérins de basculement ; arête arrière basse chanfreinée.
  const blockPts = [[-0.12, -0.20], [CR, -0.20], [CR, -0.33], [CR + 0.06, -0.38], [-0.12, -0.38]];
  const gapIn = DZ - 0.03, gapOut = DZ + 0.03;
  fr.push(slabZ(S, blockPts, -gapIn, gapIn, PAINT));
  for (const s of [-1, 1]) fr.push(slabZ(S, blockPts, s * gapOut, s * 0.55, PAINT));
  // Chapes des œils de fond des vérins de translation (colonne −Z, dessus et dessous) :
  // deux joues 5/8 po perpendiculaires à X, axe selon X à (x = 0.13, y = ±0.51).
  const earGap = CYL178.eyeWidth / 2 + 0.004, earT = 0.625 * IN;
  for (const sy of [1, -1]) {
    const yc = sy * G.cylY;
    const pts = [[-CZ - 0.06, sy * (sy > 0 ? CT : -CB) * sy], [-CZ + 0.06, sy * CT * (sy > 0 ? 1 : -1) * sy]];
    void pts;
    const ear = [[-CZ - 0.06, sy * (CT - 0.005)], [-CZ + 0.06, sy * (CT - 0.005)], ...arc(-CZ, yc, 0.042, 0, sy * Math.PI, 12).map(([z, y]) => [z, y])];
    for (const k of [-1, 1]) {
      const xc = G.cylX + k * (earGap + earT / 2);
      fr.push(slabX(S, ear, xc - earT / 2, xc + earT / 2, PAINT, [[-CZ, yc, 0.75 * IN]]));
    }
  }
  // Cordons de soudure : poutre haute / colonnes, blocs / colonnes.
  for (const s of [-1, 1]) {
    const z = s * ZI;
    frW.push(weld([[-0.356, 0.292, z], [-0.204, 0.292, z]], 0.007, PAINT));
    frW.push(weld([[-0.204, 0.292, z], [-0.204, 0.444, z]], 0.007, PAINT));
    frW.push(weld([[CR + 0.02, -0.18, s * (ZI - 0.004)], [CR + 0.02, 0.30, s * (ZI - 0.004)]], 0.006, PAINT));
    frW.push(weld([[-0.12, -0.20, s * 0.552], [CR, -0.20, s * 0.552]], 0.007, PAINT));
  }
  P('17', T(group(merged(fr, PAINT), merged(frW, PAINT))), [-0.6, 0, 0]);

  // ================================================================ 8 — arbre de basculement Ø 3 1/2, 19 — clavettes
  const RP = G.pivotR;
  const ZS = ZO + 0.02; // bouts de l'arbre (dépassent des bossages)
  P('8', T(at(lathe([
    [0, -ZS], [RP - 0.004, -ZS], [RP, -ZS + 0.004], [RP, ZS - 0.004], [RP - 0.004, ZS], [0, ZS],
  ], 'steel', { axis: 'z', seg: 36 }), [PX, PY, 0])), [0, -0.2, 0]);
  for (const s of [-1, 1]) {
    // clavette 1/2 × 1/2 × 3 po dans la rainure, au bout de l'arbre (côté extérieur)
    P('19', T(at(box(0.5 * IN, 0.5 * IN, 3 * IN, 'steel', { r: 0.001 }), [PX, PY + RP - 0.002, s * (ZO + 0.02 - 1.6 * IN)])), [0, 0.06, s * 0.25]);
  }

  // ================================================================ 6 — barres de glissement, 10 — chapeaux de retenue
  for (const y of [BY, -BY]) {
    const bar = merged([
      lathe([[0, -ZO], [G.barR - 0.003, -ZO], [G.barR, -ZO + 0.003], [G.barR, ZO + 0.012 - 0.003], [G.barR - 0.003, ZO + 0.012], [0, ZO + 0.012]], 'chrome', { axis: 'z', seg: 36 }),
    ], 'chrome');
    // collerette soudée (côté −Z) posée sur la face de la colonne, trou de centrage
    const flange = lathe([[0.02, -ZO - 0.022], [0.083, -ZO - 0.022], [0.085, -ZO - 0.02], [0.085, -ZO], [0.02, -ZO], [0.02, -ZO - 0.012], [0, -ZO - 0.012], [0, -ZO - 0.02]].map(([r, z]) => [r, z]), 'steel', { axis: 'z', seg: 36 });
    P('6', T(at(group(bar, flange, S.weldRing(G.barR + 0.002, 0.008, 'steel', { axis: 'z', pos: [0, 0, -ZO - 0.002] })), [BXc, y, 0])), [0, 0, -0.9]);
  }
  // chapeaux de retenue : bouts +Z des barres et deux bouts de l'arbre ; trois vis H 3/4 × 1 1/2 (24), rondelles (28)
  const caps = [[BXc, BY, 1, 0.07, ZO + 0.012], [BXc, -BY, 1, 0.07, ZO + 0.012], [PX, PY, 1, 0.065, ZS], [PX, PY, -1, 0.065, ZS]];
  for (const [x, y, s, r, z] of caps) {
    P('10', T(at(lathe([[0, 0], [r - 0.003, 0], [r, 0.003], [r, 0.016], [r - 0.003, 0.019], [0, 0.019]], 'steel', { axis: 'z', seg: 32 }), [x, y, s * z], s < 0 ? [0, Math.PI, 0] : null)), [0, 0, s * 0.3]);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
      const p = [x + Math.cos(a) * 0.03, y + Math.sin(a) * 0.03, s * (z + 0.019)];
      P('28', T(put(washerD(S, 0.75 * IN, 'zinc', { od: 1.47 * IN, t: 0.134 * IN }), p, [0, 0, s])), [0, 0, s * 0.38]);
      P('24', T(put(hexScrew(S, 0.75 * IN, 1.5 * IN), [p[0], p[1], p[2] + s * 0.134 * IN], [0, 0, s])), [0, 0, s * 0.45]);
    }
  }

  // ================================================================ 21 — axes des tiges de basculement, 18 — bagues, 23 + 26
  for (const s of [-1, 1]) {
    const z0 = s * (DZ - 0.104), z1 = s * 0.552; // 9.31 po
    const len = Math.abs(z1 - z0);
    const pinG = group(
      lathe([[0, 0], [1.25 * IN - 0.003, 0], [1.25 * IN, 0.003], [1.25 * IN, len], [0, len]], 'steel', { seg: 32 }),
      // plaquette d'arrêt soudée en tête
      at(box(0.11, 0.012, 0.05, 'steel', { r: 0.003 }), [0.03, len + 0.006, 0]),
    );
    P('21', T(put(pinG, [DX, DY, z0], [0, 0, s])), [-0.15, 0, s * 0.45]);
    const bp = [DX + 0.065, DY, s * (0.552 + 0.012)];
    P('26', T(put(nordLock(S, THREE, 0.375), bp, [0, 0, s])), [-0.15, 0, s * 0.52]);
    P('23', T(put(hhcs(S, THREE, 0.375, 1.5), [bp[0], bp[1], bp[2] + s * 0.0026], [0, 0, s])), [-0.15, 0, s * 0.58]);
    // bagues 2 1/2 × 2 3/4 × 3.438 dans les deux joues (bloc central, bloc latéral)
    for (const [za, zb] of [[DZ - 0.03 - 0.0873, DZ - 0.03], [DZ + 0.03, DZ + 0.03 + 0.0873]]) {
      P('18', T(tubeZ(S, 1.375 * IN, 1.25 * IN, s * za, s * zb, 'brass', DX, DY, 28)), [-0.15, 0, s * 0.3]);
    }
  }

  // ================================================================ 9 — actionneur rotatif (P174)
  // Axes de P174 : x (tubes) → +Y, y (arbre, bride 31) → +X, z → −Z.
  P('9', frame(THREE, api.sub('P174'), [0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, -1]), [0.7, 0, 0]);

  // ================================================================ 3, 4 — plaques porte-actionneur
  const ZP = G.plateZ, PT = G.plateT, ZB = G.bossL;
  const plateOutline = [
    [0.21, -BY], [0.21, BY], ...arc(BXc, BY, G.bossR, 0, Math.PI, 12).slice(1), [-0.05, 0.2], [-0.27, 0.2], [-0.27, -0.2], [-0.05, -0.2], [BXc - G.bossR, -BY],
    ...arc(BXc, -BY, G.bossR, Math.PI, 2 * Math.PI, 12).slice(1, -1),
  ];
  const tapped = [[0.11, -0.07], [0.11, 0.07], [0.035, -0.11], [0.035, 0.11], [-0.04, -0.11], [-0.04, 0.11], [-0.115, -0.07], [-0.115, 0.07]];
  const strip = { x: -0.27, t: 0.375 * IN, w: 0.1 };
  const rodEyes = [];
  for (const s of [-1, 1]) {
    const ref = s < 0 ? '3' : '4';
    const z0 = s * ZP, z1 = s * (ZP + PT), zb = s * (ZP + ZB);
    const parts = [slabZ(S, plateOutline, z0, z1, CPAINT, [[0, 0, 0.1], [BXc, BY, 2.25 * IN + 0.002], [BXc, -BY, 2.25 * IN + 0.002]])];
    for (const y of [BY, -BY]) parts.push(tubeZ(S, G.bossR, 2.25 * IN + 0.002, Math.min(z0, zb), Math.max(z0, zb), CPAINT, BXc, y, 32));
    // barrette de traversée 3/8 po à l'arrière, perpendiculaire à X
    const zs0 = s * (ZP + PT - 0.002), zs1 = s * (ZP + PT + strip.w);
    parts.push(bx(S, strip.x - strip.t, strip.x, -0.17, 0.17, Math.min(zs0, zs1), Math.max(zs0, zs1), CPAINT, 0.002));
    // goussets de la barrette
    for (const y of [-0.17, 0.17]) parts.push(slabZ(S, [[strip.x, y], [strip.x + 0.06, y], [strip.x, y - Math.sign(y) * 0.06]].map(([x, yy]) => [x, yy]), s * (ZP + PT), s * (ZP + PT + 0.012), CPAINT));
    const welds = [];
    for (const y of [BY, -BY]) welds.push(S.weldRing(G.bossR + 0.002, 0.008, CPAINT, { axis: 'z', pos: [BXc, y, z1] }));
    welds.push(weld([[strip.x, -0.17, z1], [strip.x, 0.17, z1]], 0.006, CPAINT));
    // bras de la plaque RH : chapes des œils de tige des vérins de translation (axe selon X)
    if (s > 0) {
      const eyeW = CYL178.rodEyeWidth, spT = 0.25 * IN, armT = 1.75 * IN;
      for (const sy of [1, -1]) {
        const yc = sy * G.cylY;
        const prof = [[ZP + PT, sy * 0.28], [ZP + PT, sy * 0.468], [0.43, sy * 0.468], ...arc(G.rodZ, yc, 0.045, sy > 0 ? Math.PI * 1.0 : -Math.PI, sy > 0 ? -Math.PI / 2 : Math.PI / 2, 14), [0.36, sy * 0.44]];
        for (const k of [-1, 1]) {
          const xc = G.cylX + k * (eyeW / 2 + spT + armT / 2);
          parts.push(slabX(S, prof, xc - armT / 2, xc + armT / 2, CPAINT, [[G.rodZ, yc, 0.8125 * IN]]));
        }
        rodEyes.push([G.cylX, yc, G.rodZ]);
      }
    }
    P(ref, H(group(merged(parts, CPAINT), merged(welds, CPAINT))), [0, 0, s * 0.45]);

    // 25 + 27 — vis H 5/8 UNF × 1 3/4 et rondelles : plaque sur le carter
    for (const [x, y] of tapped) {
      P('27', H(put(washerD(S, 0.625 * IN, 'zinc', { od: 1.31 * IN, t: 0.095 * IN }), [x, y, z1], [0, 0, s])), [0, 0, s * 0.55]);
      P('25', H(put(hexScrew(S, 0.625 * IN, 1.75 * IN), [x, y, z1 + s * 0.095 * IN], [0, 0, s])), [0, 0, s * 0.62]);
    }
    // 11 — goupille de centrage plaque / carter, tenue par une vis 22 et sa rondelle 26
    P('11', H(put(lathe([[0, -0.03], [0.0095, -0.03], [0.0095, 0.004], [0.016, 0.004], [0.016, 0.01], [0, 0.01]], 'steel', { seg: 16 }), [-0.08, 0.145, z1], [0, 0, s])), [0, 0, s * 0.55]);
    P('26', H(put(splitWasher(S, THREE, 0.375), [-0.105, 0.145, z1 + s * 0.004], [0, 0, s])), [0, 0, s * 0.6]);
    P('22', H(put(hexScrew(S, 0.375 * IN, 1.0 * IN), [-0.105, 0.145, z1 + s * 0.0105], [0, 0, s])), [0, 0, s * 0.66]);

    for (const y of [BY, -BY]) {
      const zIn = Math.min(Math.abs(z0), Math.abs(zb)), zOut = Math.max(Math.abs(z0), Math.abs(zb));
      // 12 — bague Garlock GM6472-96 dans le bossage
      P('12', H(tubeZ(S, 2.25 * IN, 2.02 * IN, s * (zIn + 0.003), s * (zOut - 0.003), 'brass', BXc, y, 32)), [0, 0, s * 0.5]);
      // 13 — racleurs aux deux bouts du bossage (lèvre vers l'extérieur)
      for (const [zz, out] of [[zIn, -1], [zOut, 1]]) {
        const wiper = lathe([[2.01 * IN, 0], [2.4 * IN, 0], [2.4 * IN, 0.008], [2.12 * IN, 0.011], [2.01 * IN, 0.006], [2.01 * IN, 0]], 'rubber', { axis: 'z', seg: 24 });
        const dirZ = s * out; // sens de la lèvre
        P('13', H(at(wiper, [BXc, y, s * zz + (out < 0 ? 0 : 0)], dirZ < 0 ? [0, Math.PI, 0] : null)), [0, 0, s * (out > 0 ? 0.68 : 0.15)]);
      }
      // 5 — chapeau Ø 160 × 12 au bout du bossage (au-dessus du racleur), quatre vis 22 et rondelles 26
      const zc = s * (zOut + 0.006);
      P('5', H(tubeZ(S, G.bossR, 2.08 * IN, zc - 0.006, zc + 0.006, CPAINT, BXc, y, 32)), [0, 0, s * 0.75]);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const p = [BXc + Math.cos(a) * 0.064, y + Math.sin(a) * 0.064, zc + s * 0.006];
        P('26', H(put(splitWasher(S, THREE, 0.375), p, [0, 0, s])), [0, 0, s * 0.8]);
        P('22', H(put(hexScrew(S, 0.375 * IN, 1.0 * IN), [p[0], p[1], p[2] + s * 0.0024], [0, 0, s])), [0, 0, s * 0.86]);
      }
    }
  }

  // ================================================================ raccords de traversée (30 à 39) sur les barrettes
  // Colonne A (z = ±0.215) : traversées droites (30 -6, 33 -8, 37 -12), nez JIC vers l'arrière,
  // coudes NPT femelle → JIC (31, 34, 38) côté avant, nez vers le carter. Colonne B (z = ±0.265) :
  // unions coudées de traversée (32 -6, 35 -8, 39 -12), coude à l'arrière nez vers le haut ;
  // réductions -8 → -6 (36) sur les coudes 34 et 35.
  const XS = strip.x - strip.t; // face arrière des barrettes
  const elbowRefs = { 6: '31', 8: '34', 12: '38' };
  for (const s of [-1, 1]) {
    const nA = s > 0 ? 6 : 5;
    const colA = [...Array(nA).fill(['30', 6]), ['33', 8], ['37', 12]];
    const colB = [...Array(6).fill(['32', 6]), ['35', 8], ['35', 8], ['39', 12]];
    const zA = s * (ZP + PT + 0.03), zB = s * (ZP + PT + 0.075);
    colA.forEach(([ref, dash], i) => {
      const y = -0.13 + (i * 0.26) / (colA.length - 1);
      P(ref, H(frame(THREE, bulkhead(S, THREE, dash, { t: 0.375 }), [XS, y, zA], [0, 0, 1], [-1, 0, 0], [0, -1, 0])), [-0.25, 0, s * 0.1]);
      // coude vissé sur la queue NPT, devant la barrette ; nez vers le carter (−s·Z)
      const yT = strip.x + 0.008 + u(0.2);
      const el = nptElbow(S, THREE, dash);
      P(elbowRefs[dash], H(frame(THREE, el, [yT, y, zA], [0, 0, -s], [1, 0, 0], [0, -s, 0].map((v) => -v))), [0.15, 0, s * 0.1]);
      if (dash === 8) {
        // réduction -8 → -6 sur le nez du coude 34
        const red = group(jicReducer(S, THREE, 8, 6));
        red.rotation.z = -Math.PI / 2;
        red.position.set(u(1.25), u(0.75 * 1.9 * 0.375 + 0.34), 0);
        P('36', H(frame(THREE, red, [yT, y, zA], [0, 0, -s], [1, 0, 0], [0, s, 0])), [0.2, 0, -s * 0.05]);
      }
    });
    colB.forEach(([ref, dash], i) => {
      const y = -0.135 + (i * 0.27) / (colB.length - 1);
      const g = group(bulkheadElbow(S, THREE, dash, { t: 0.375 }));
      if (ref === '35') {
        const red = group(jicReducer(S, THREE, 8, 6));
        red.rotation.z = -Math.PI / 2;
        red.position.set(u(0.95), u(0.375 + 0.75 * 0.7125), 0);
        P('36', H(frame(THREE, red, [XS, y, zB], [0, 0, s], [-1, 0, 0], [0, s, 0].map((v) => -v))), [-0.3, 0.05, s * 0.15]);
      }
      P(ref, H(frame(THREE, g, [XS, y, zB], [0, 0, s], [-1, 0, 0], [0, -s, 0].map((v) => -v))), [-0.3, 0, s * 0.15]);
    });
  }

  // ================================================================ 20 — vérins de translation (P178)
  const L0 = G.rodZ - G.cylZ0; // entraxe au milieu de la course
  const ext = L0 - CYL178.pinRetracted;
  const bushL = 0.625 * IN, armT = 1.75 * IN, spT = 0.25 * IN;
  for (const sy of [1, -1]) {
    const yc = sy * G.cylY;
    const p0 = [G.cylX, yc, G.cylZ0];
    const ex = [0, 0, 1], ey = [0, sy, 0], ez = [-sy, 0, 0];
    const cylObj = frame(THREE, api.sub('P178', { ext }), p0, ex, ey, ez);
    P('20', ramDetailed(sy > 0 ? 'shift' : 'shift2', 'tilt', 'shift', cylObj, { rear: [0, 0, 0], rod: [L0, 0, 0], stroke: CYL178.stroke }), [0, sy * 0.25, 0]);
    // 29 — coudes 90° ORB → JIC sur les orifices 1 du bloc (faces ±Z locales), nez vers le fond
    for (const [px, py, pz] of CYL178.ports) {
      const n = Math.sign(pz);
      const pos = [p0[0] + ez[0] * pz, p0[1] + ey[1] * py, p0[2] + px];
      P('29', T(frame(THREE, jicElbow(S, THREE, 6), pos, [0, 0, -1], ez.map((v) => v * n), [0, -sy * n, 0].map((v) => v))), [0, sy * 0.3, 0]);
    }
    // 1 — axe de l'œil de fond Ø 1 1/4 (selon X), 14 — bagues 1 1/4 × 1 1/2 × 5/8, 16 — goupille élastique
    {
      const xa = G.cylX - (earGap + earT) - 0.004, xb = G.cylX + (earGap + earT) + 0.008;
      const pin1 = lathe([[0, xa - 0.004], [0.625 * IN - 0.002, xa - 0.004], [0.625 * IN, xa - 0.002], [0.625 * IN, xb], [1.0 * IN, xb], [1.0 * IN, xb + 0.008], [0.9 * IN, xb + 0.011], [0, xb + 0.011]], 'steel', { axis: 'x', seg: 20 });
      P('1', T(at(pin1, [0, yc, -CZ])), [0.12, sy * 0.05, 0]);
      for (const k of [-1, 1]) {
        const xc = G.cylX + k * (earGap + earT / 2);
        P('14', T(at(lathe([[0.625 * IN, -bushL / 2], [0.75 * IN, -bushL / 2], [0.75 * IN, bushL / 2], [0.625 * IN, bushL / 2], [0.625 * IN, -bushL / 2]], 'brass', { axis: 'x', seg: 20 }), [xc, yc, -CZ])), [k * 0.06, sy * 0.04, 0]);
      }
      P('16', T(at(lathe([[0, -0.0254], [0.004, -0.0254], [0.004, 0.0254], [0, 0.0254]], 'zinc', { seg: 8 }), [xa + 0.002, yc, -CZ])), [-0.08, sy * 0.06, 0]);
    }
    // 2 — axe de l'œil de tige Ø 1 3/8 (selon X), 15 — bagues 1 3/8 × 1 5/8 × 1 3/4, 7 — entretoises, 16
    {
      const half = CYL178.rodEyeWidth / 2 + spT + armT;
      const xa = G.cylX - half - 0.004, xb = G.cylX + half + 0.004;
      const pin2 = lathe([[0, xa - 0.004], [0.6875 * IN - 0.002, xa - 0.004], [0.6875 * IN, xa - 0.002], [0.6875 * IN, xb], [1.1 * IN, xb], [1.1 * IN, xb + 0.009], [1.0 * IN, xb + 0.012], [0, xb + 0.012]], 'steel', { axis: 'x', seg: 20 });
      P('2', H(at(pin2, [0, yc, G.rodZ])), [0.15, sy * 0.06, 0.05]);
      for (const k of [-1, 1]) {
        const xc = G.cylX + k * (CYL178.rodEyeWidth / 2 + spT + armT / 2);
        P('15', H(at(lathe([[0.6875 * IN, -armT / 2], [0.8125 * IN, -armT / 2], [0.8125 * IN, armT / 2], [0.6875 * IN, armT / 2], [0.6875 * IN, -armT / 2]], 'brass', { axis: 'x', seg: 20 }), [xc, yc, G.rodZ])), [k * 0.1, sy * 0.05, 0.05]);
        const xs = G.cylX + k * (CYL178.rodEyeWidth / 2 + spT / 2);
        P('7', H(at(lathe([[0.6875 * IN + 0.0005, -spT / 2], [1.0 * IN, -spT / 2], [1.0 * IN, spT / 2], [0.6875 * IN + 0.0005, spT / 2], [0.6875 * IN + 0.0005, -spT / 2]], 'zinc', { axis: 'x', seg: 20 }), [xs, yc, G.rodZ])), [k * 0.05, sy * 0.05, 0.05]);
      }
      P('16', H(at(lathe([[0, -0.0254], [0.004, -0.0254], [0.004, 0.0254], [0, 0.0254]], 'zinc', { seg: 8 }), [xa + 0.002, yc, G.rodZ])), [-0.1, sy * 0.07, 0.05]);
    }
  }
  void rodEyes; void cyl; void extrude; void L;

  return { view: { dir: [1.0, 0.55, 0.9] } };
}
