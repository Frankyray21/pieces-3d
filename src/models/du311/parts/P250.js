// P250 — Réservoir de carburant CX030719 rév. 1 (page 250) : « FUEL TANK
// ASSEMBLY », repère 7 de l'ensemble moteur diesel P242. Caisson soudé (5) en
// tôle, quatre pattes de fixation percées au pied des joues d'extrémité ; sur
// le dessus : piquage de remplissage 2 po coiffé du coude 2 po (8), d'où part
// le boyau de remplissage 2 po × 43 1/2 po (9) vers le goulot déporté (support
// P242 rep. 12, non dessiné) que ferme le bouchon (1) ; piquage 2 po fermé par
// la réduction 2 × 3/8 NPT (12) portant le raccord cannelé (13) du boyau
// d'évent 3/8 × 48 po (2) ; bride annulaire soudée sous la plaque de
// visite (4) — joint (6), huit vis 1/4-20 × 1/2 (14) et rondelles plates (15)
// — qui porte la jauge VDO 0-99 Ω à tube (3), le tube plongeur 3/8 po
// d'aspiration (7) sous le raccord 3/8 NPT-JIC -06 (11) et le retour
// 1/4 NPT-JIC -06 (10).
// Repère : origine au centre de la face inférieure du réservoir (face d'appui
// des pattes sur le châssis) ; X le long du réservoir (+X vers la plaque de
// visite, -X vers le coude de remplissage), Y vers le haut, +Z vers la grande
// face visible de la page 250. Dessus du réservoir à y = 0.483.
// Encombrement ≈ 1.07 (X, de -0.70 au bout du boyau 9 à 0.43) × 0.95 (Y,
// jusqu'au bouchon) × 0.43 (Z) m ; caisson seul 0.813 × 0.483 × 0.432 m.
// Cotes : visserie, boyaux (diamètre, longueur) et raccords d'après la liste ;
// caisson (32 × 19 × 17 po, ≈ 170 L) et positions des piquages estimés d'après
// les proportions de la page 250 (rien n'est coté). Le goulot et son support
// (P242 rep. 12) ne sont pas représentés : le boyau 9 et le bouchon 1 sont
// tracés jusqu'à un goulot supposé à 0.27 m au-delà du bout -X, 0.95 m de haut ;
// boyaux 2 et 9 sans dessin : tracés estimés, longueurs de la liste.

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const L = I(32), H = I(19), W = I(17), T = I(0.1345); // caisson, tôle 10 ga
// Piquages du dessus (x, z) : remplissage (coude 8), évent (réduction 12), plaque de visite.
const FILL = [-0.32, 0], VENT = [-0.18, -0.045], COVER = [0.2, -0.02];
const RC = I(3.75); // rayon extérieur de la plaque de visite (Ø 7 1/2 po)
const BC = I(3.25); // cercle des vis 1/4-20
const NECK = [-0.67, 0.95, 0]; // bout du goulot de remplissage déporté (estimé)

export const TANK250 = { size: [L, H, W], fill: FILL, cover: COVER, neck: NECK };

export default function P250(api) {
  const { THREE, S } = api;
  const { box, cyl, plate, lathe, thread, tube, ring, weld, weldRing, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ------------------------------------------------------------ 5 — caisson soudé
  // Dessus et fond rapportés sur une enveloppe pliée ; joues d'extrémité ;
  // cordons sur les arêtes verticales ; pattes 2 × 3 po percées Ø 9/16 au pied
  // des joues, aux quatre coins ; trois piquages soudés sur le dessus.
  const shellParts = [
    box(L, H - 2 * T, W, 'grey', { r: I(0.25), pos: [0, H / 2, 0] }),
    at(plate(L + I(0.12), W + I(0.12), T, 'grey'), [0, H - T / 2, 0]),
    at(plate(L + I(0.12), W + I(0.12), T, 'grey'), [0, T / 2, 0]),
  ];
  const beads = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // Patte : plat 3 × 2 × 1/4 po soudé sur la joue, dépassant de 1 1/2 po.
    const x = sx * (L / 2 + I(0.75)), z = sz * (W / 2 - I(1.6));
    shellParts.push(at(plate(I(1.5) + I(0.6), I(2), I(0.25), 'grey', { holes: [[sx * I(0.25), 0, I(0.28)]], r: I(0.3) }), [x - sx * I(0.3), I(0.125), z]));
    shellParts.push(box(I(0.25), I(1.6), I(2), 'grey', { pos: [sx * (L / 2 + I(0.125)), I(0.8), z] }));
    beads.push(weld([[sx * (L / 2 + I(0.25)), I(0.27), z - I(1)], [sx * (L / 2 + I(0.25)), I(0.27), z + I(1)]], I(0.18), 'grey'));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    beads.push(weld([[sx * (L / 2 + I(0.03)), T * 1.5, sz * (W / 2 + I(0.03))], [sx * (L / 2 + I(0.03)), H - T * 1.5, sz * (W / 2 + I(0.03))]], I(0.16), 'grey'));
  }
  // Piquages : demi-manchons 2 po (remplissage, évent) et bride annulaire de la visite.
  const od2 = ACC.pipeOD(32);
  for (const [x, z] of [FILL, VENT]) {
    shellParts.push(lathe([[od2 / 2 * 0.98, H], [od2 / 2 * 1.28, H], [od2 / 2 * 1.28, H + I(1.0)], [od2 / 2 * 0.98, H + I(1.0)], [od2 / 2 * 0.98, H]], 'grey', { seg: 28, pos: [x, 0, z] }));
    beads.push(weldRing(od2 / 2 * 1.3, I(0.18), 'grey', { pos: [x, H + I(0.05), z] }));
  }
  const ringT = I(0.375), yR = H + ringT; // dessus de la bride (appui du joint)
  shellParts.push(at(ring(RC, I(2.5), ringT, 'grey', { seg: 48 }), [COVER[0], H + ringT / 2, COVER[1]]));
  // Taraudages 1/4-20 de la bride (amorces sombres).
  const taps = [];
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + (k * Math.PI) / 4;
    taps.push(at(cyl(I(0.11), 0.001, 'blackOxide', { seg: 10 }), [COVER[0] + Math.cos(a) * BC, yR + 0.0002, COVER[1] + Math.sin(a) * BC]));
  }
  beads.push(weldRing(RC + I(0.03), I(0.16), 'grey', { pos: [COVER[0], H + I(0.05), COVER[1]] }));
  P('5', group(merged(shellParts, 'grey'), merged(beads, 'grey'), merged(taps, 'blackOxide')), [0, 0, 0]);

  // ------------------------------------------------------------ 6 — joint de la plaque de visite
  const tg = I(0.0625);
  const gHoles = [];
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; gHoles.push([Math.cos(a) * BC, Math.sin(a) * BC, I(0.14)]); }
  P('6', at(plate(RC * 2, RC * 2, tg, 'rubber', { r: RC, holes: [...gHoles, [0, 0, I(2.5)]] }), [COVER[0], yR + tg / 2, COVER[1]]), [0, 0.1, 0]);

  // ------------------------------------------------------------ 4 — plaque de visite
  // Disque Ø 7 1/2 × 1/4 po : alésage Ø 2 1/8 de la jauge (cinq trous de vis
  // de sa bride), deux bossages taraudés 3/8 et 1/4 NPT ; écrou JIC soudé
  // dessous au droit du bossage 3/8 pour le tube plongeur.
  const tp = I(0.25), yP = yR + tg; // dessous de la plaque
  const pHoles = [...gHoles, [0, 0, I(1.06)]];
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + Math.PI / 2; pHoles.push([Math.cos(a) * I(1.42), Math.sin(a) * I(1.42), I(0.09)]); }
  const PORT11 = [-I(0.75), I(1.75)], PORT10 = [I(0.75), I(1.75)]; // (x, z) locaux sur la plaque
  const cover = [at(plate(RC * 2, RC * 2, tp, 'grey', { r: RC, holes: pHoles }), [0, tp / 2, 0])];
  for (const [[x, z], d] of [[PORT11, 6], [PORT10, 4]]) {
    const r = ACC.pipeOD(d) / 2 * 1.35;
    cover.push(lathe([[r * 0.7, tp], [r, tp], [r, tp + I(0.5)], [r * 0.7, tp + I(0.5)], [r * 0.7, tp]], 'grey', { seg: 20, pos: [x, 0, z] }));
  }
  cover.push(at(cyl(I(0.3), I(0.4), 'grey', { seg: 6 }), [PORT11[0], -I(0.2), PORT11[1]]));
  P('4', at(group(merged(cover, 'grey')), [COVER[0], yP, COVER[1]]), [0, 0.2, 0]);

  // ------------------------------------------------------------ 3 — jauge VDO (tube)
  // Bride Ø 2 7/8 à cinq vis cruciformes, capuchon et cosses en tête, tube
  // Ø 1 po qui descend à 1 po du fond.
  const yT = yP + tp; // dessus de la plaque
  const sender = group(
    merged([
      lathe([[0, 0], [I(1.44), 0], [I(1.44), I(0.08)], [I(1.2), I(0.16)], [I(0.9), I(0.22)], [I(0.9), I(0.55)], [I(0.75), I(0.62)], [0, I(0.62)]], 'zinc', { seg: 36 }),
      lathe([[I(0.47), -(yT - I(1))], [I(0.5), -(yT - I(1))], [I(0.5), 0], [I(0.47), 0]], 'zinc', { seg: 20 }),
    ], 'zinc'),
    merged(Array.from({ length: 5 }, (_, k) => { const a = (k / 5) * Math.PI * 2 + Math.PI / 2; return at(cyl(I(0.15), I(0.08), 'steel', { seg: 10 }), [Math.cos(a) * I(1.42), I(0.11), -Math.sin(a) * I(1.42)]); }), 'steel'),
    merged([box(I(0.55), I(0.3), I(0.35), 'plastic', { pos: [0, I(0.77), 0] }), box(I(0.08), I(0.25), I(0.3), 'plastic', { pos: [I(0.18), I(1.0), 0] })], 'plastic'),
    merged([at(cyl(I(0.06), I(0.3), 'brass', { seg: 8 }), [-I(0.12), I(1.0), 0])], 'brass'),
  );
  P('3', at(sender, [COVER[0], yT, COVER[1]]), [0, 0.45, 0]);

  // ------------------------------------------------------------ 14, 15 — vis 1/4-20 × 1/2 et rondelles
  const tw = I(0.05);
  for (const [x, z] of gHoles) {
    P('15', at(ACC.flatWasher(S, 0.25), [COVER[0] + x, yT, COVER[1] + z]), [0, 0.25, 0]);
    P('14', at(ACC.hhcs(S, 0.25, 0.5), [COVER[0] + x, yT + tw, COVER[1] + z]), [0, 0.3, 0]);
  }

  // ------------------------------------------------------------ 11, 10 — adaptateurs NPT-JIC -06
  P('11', at(ACC.straight(S, { a: 6, b: 6 }), [COVER[0] + PORT11[0], yT + I(0.5), COVER[1] + PORT11[1]]), [0, 0.32, 0]);
  P('10', at(ACC.straight(S, { a: 4, b: 6 }), [COVER[0] + PORT10[0], yT + I(0.5), COVER[1] + PORT10[1]]), [0, 0.32, 0]);

  // ------------------------------------------------------------ 7 — tube plongeur 3/8 po
  // Tube acier 3/8 × 0.035 po, écrou JIC -06 et manchon en tête (vissé sous la
  // plaque), extrémité coupée en biais à 1 1/2 po du fond.
  const yTop7 = yP - I(0.4);
  const r7 = I(0.375) / 2;
  P('7', at(group(
    merged([
      lathe([[r7 * 0.75, I(1.5) - yTop7], [r7, I(1.5) - yTop7], [r7, 0], [r7 * 0.75, 0]], 'steel', { seg: 12 }),
    ], 'steel'),
    merged([lathe([[r7 * 1.02, -I(0.35)], [I(0.3), -I(0.3)], [I(0.3), 0], [r7 * 1.02, 0]], 'zinc', { seg: 6 })], 'zinc'),
  ), [COVER[0] + PORT11[0], yTop7, COVER[1] + PORT11[1]]), [0, 0.1, 0]);

  // ------------------------------------------------------------ 12, 13 — réduction 2 × 3/8 et raccord cannelé
  const yV = H + I(1.0);
  P('12', at(ACC.hexBushing(S, 32, 6, 'zinc'), [VENT[0], yV, VENT[1]]), [0, 0.12, 0]);
  // 13 — mâle 3/8 NPT, six-pans 11/16, cannelure pour boyau 3/8 (trois crans).
  const yB = yV + I(0.45);
  const barb = merged([
    lathe([[0, -I(0.4)], [I(0.3), -I(0.4)], ...thread(I(0.31), -I(0.38), 0, { r1: I(0.335), maxTurns: 5 }).slice(1), [0, 0]], 'brass', { seg: 14 }),
    lathe([[0, 0], [I(0.397), 0], [I(0.397), I(0.3)], [0, I(0.3)]], 'brass', { seg: 6 }),
    lathe([[I(0.12), I(0.3)], [I(0.2), I(0.3)], [I(0.2), I(0.36)], [I(0.24), I(0.5)], [I(0.18), I(0.52)], [I(0.24), I(0.68)], [I(0.18), I(0.7)], [I(0.24), I(0.86)], [I(0.16), I(0.9)], [I(0.12), I(0.9)]], 'brass', { seg: 14 }),
  ], 'brass');
  P('13', at(barb, [VENT[0], yB, VENT[1]]), [0, 0.2, 0]);

  // ------------------------------------------------------------ 2 — boyau d'évent 3/8 × 48 po
  // Monte le long du boyau de remplissage jusqu'au goulot, bout libre
  // recourbé vers le bas (col de cygne) ; longueur de la liste ajustée par la
  // flèche du tracé.
  const ventPath = (k) => [
    [VENT[0], yB + I(0.75), VENT[1]], [VENT[0], yB + I(2.5), VENT[1]], [VENT[0] - 0.08, H + 0.12, VENT[1] - 0.03 - k],
    [NECK[0] + 0.2, NECK[1] - 0.25, -0.06 - k * 0.5], [NECK[0] + 0.06, NECK[1] - 0.04, -0.06], [NECK[0] + 0.02, NECK[1] + 0.02, -0.06], [NECK[0] - 0.01, NECK[1] - 0.04, -0.06],
  ];
  const fit = (mk, len) => {
    let lo = 0, hi = 0.5;
    for (let i = 0; i < 30; i++) {
      const k = (lo + hi) / 2;
      const c = new THREE.CatmullRomCurve3(mk(k).map((p) => new THREE.Vector3(...p)), false, 'centripetal');
      if (c.getLength() < len) lo = k; else hi = k;
    }
    return mk(lo);
  };
  P('2', tube(fit(ventPath, I(48)), I(0.33), 'hose', { ends: 'none', radial: 10, seg: 80 }), [0, 0.12, -0.12]);

  // ------------------------------------------------------------ 8 — coude 2 po
  // Coude coulé : fût Ø 2 3/8 vissé dans le piquage, corps cintré, sortie
  // vers -X à bourrelet pour le boyau 9.
  const yF = H + I(1.0);
  const R8 = od2 / 2;
  const elbowY = I(2.6); // axe de la sortie, au-dessus du piquage
  const elbow = merged([
    lathe([[R8 * 0.6, -I(0.8)], [R8 * 0.97, -I(0.8)], ...thread(R8 * 0.97, -I(0.78), 0, { r1: R8, maxTurns: 6 }).slice(1), [R8 * 1.1, 0], [R8 * 1.1, I(1.0)], [R8 * 0.85, I(1.0)]], 'castIron', { seg: 28 }),
    tube([[0, I(0.9), 0], [0, elbowY - R8 * 1.2, 0], [-R8 * 0.35, elbowY - R8 * 0.35, 0], [-R8 * 1.2, elbowY, 0], [-R8 * 1.2 - I(1.6), elbowY, 0]], R8 * 1.08, 'castIron', { seg: 24, radial: 20, ends: 'none', tension: 0.2 }),
    lathe([[R8 * 0.85, 0], [R8 * 1.04, 0], [R8 * 1.1, I(0.25)], [R8 * 0.98, I(0.4)], [R8 * 0.98, I(1.2)], [R8 * 0.85, I(1.2)]], 'castIron', { seg: 28, axis: '-x', pos: [-R8 * 1.2 - I(1.6), elbowY, 0] }),
  ], 'castIron');
  P('8', at(elbow, [FILL[0], yF, FILL[1]]), [0, 0.18, 0]);
  const out8 = [FILL[0] - R8 * 1.2 - I(1.6) - I(0.9), yF + I(2.6), FILL[1]];

  // ------------------------------------------------------------ 9 — boyau de remplissage 2 po × 43 1/2 po
  // Enfilé sur la sortie du coude, il s'éloigne vers -X puis remonte au
  // goulot déporté ; bouts renforcés (bagues de la toile).
  const rh = I(1.0) + I(0.25); // Ø ext. 2 1/2 po
  const fillPath = (k) => [
    [out8[0] + I(0.5), out8[1], out8[2]], [out8[0] - 0.08, out8[1], out8[2]], [out8[0] - 0.22 - k * 0.3, out8[1] + 0.06, 0.02 + k * 0.4],
    [NECK[0] + 0.02, NECK[1] - 0.3, 0.01], [NECK[0], NECK[1] - 0.12, 0], [NECK[0], NECK[1] - I(0.5), 0],
  ];
  const fp = fit(fillPath, I(43.5));
  const hoseFill = tube(fp, rh, 'hose', { ends: 'none', radial: 18, seg: 90 });
  P('9', group(hoseFill), [-0.08, 0.15, 0.12]);

  // ------------------------------------------------------------ 1 — bouchon de remplissage
  // Bouchon à baïonnette Ø 3 1/4 po, poignée en pont, chaînette d'attache
  // repliée ; posé sur le goulot (bout du boyau 9).
  const cap = group(
    merged([
      lathe([[0, 0], [I(1.45), 0], [I(1.62), I(0.12)], [I(1.62), I(0.55)], [I(1.5), I(0.68)], [0, I(0.7)]], 'black', { seg: 36 }),
      box(I(2.4), I(0.55), I(0.45), 'black', { r: I(0.15), pos: [0, I(0.95), 0] }),
    ], 'black'),
    merged([lathe([[I(1.2), -I(0.6)], [I(1.3), -I(0.6)], [I(1.3), 0], [I(1.2), 0]], 'zinc', { seg: 28 }), tube([[I(1.62), I(0.3), 0], [I(1.9), I(0.1), 0], [I(2.0), -I(0.5), I(0.2)]], I(0.04), 'zinc', { ends: 'none', radial: 6, seg: 8 })], 'zinc'),
  );
  P('1', at(cap, [NECK[0], NECK[1], 0]), [0, 0.12, 0]);

  return { view: { dir: [0.8, 0.7, 1.2] } };
}
