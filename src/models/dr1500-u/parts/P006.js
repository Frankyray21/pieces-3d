// P006 — Kit de poulie bascule MA616 (page 6), repère local de layout.js : origine sur l'axe de la poulie avant
// MP0028 (rep. 2), axes des poulies le long de Z, frame vers −X et vers le bas ; posé en POULIE.pos par P002.
// Frame MA616 (rep. 1) : flasque de 1/2 po du côté +Z des poulies, haut arrondi derrière la poulie avant
// (couverture), descendant derrière la plaque d'about du mât jusqu'à la poulie arrière #2, bossage du pivot (boulon
// 1/2-13 × 5 po, rep. 14, dans les oreilles du mât, P004), fourreau du ressort (rep. 15) et vis de ressort (rep. 16)
// qui appuient sur la plaque d'about (bascule), carter ajouré à trois lumières autour de la poulie arrière (p. 6).
// Poulies en porte-à-faux sur leur arbre, tête de l'arbre contre la face extérieure du flasque, écrou de l'autre côté
// (ordre des pièces de la vue éclatée p. 6) : poulie avant à deux gorges (rep. 2) sur l'arbre MP0059 (rep. 4), deux
// roulements (rep. 6), rondelles MP0298 (rep. 7), rondelle 3/4 (rep. 8), écrou 3/4-10 (rep. 9) ; poulie arrière #2 à
// gorge large (rep. 3) sur l'arbre MP0360 (rep. 5), roulements (rep. 10), rondelles MP0299 (rep. 11), rondelle 3/4
// (rep. 12), écrou 3/4-10 (rep. 13).
// Cotes : layout.js (POULIE) et _structure.js (PF) ; roulements 1411148 et 1411123 supposés 6205 (25 × 52 × 15) et
// 6204 (20 × 47 × 14) [estimé : seule la visserie 3/4 est désignée] ; poulies Ø 250 et Ø 240, fond de gorge
// POULIE.r [estimé]. Éclaté comme la p. 6 : chaque poulie et ses pièces le long de son arbre, arbres vers +Z.
import { IN, MAST, POULIE } from '../layout.js';
import { PF, arc, slot, profilZ, boxAt, strut } from './_structure.js';

// Face arrière de la butée du ressort sur la plaque d'about du mât (butée de 8 mm, P004), repère de P006.
const X_BUTEE = MAST.xRear - 0.008 - POULIE.pos[0];

const R = POULIE.r;
const UP = { w: 0.09, rf: 0.125, rg: 0.015, bore: 0.026, brg: [0.026, 0.0125, 0.015] }; // poulie avant [estimé]
const LO = { w: 0.07, rf: 0.12, rg: 0.024, bore: 0.0235, brg: [0.0235, 0.01, 0.014] }; // poulie arrière #2 [estimé]
const [ZP0, ZP1] = PF.z; // faces du flasque

/** Profil de révolution (r, y) d'une poulie à n gorges de rayon rg, fond à R, flasques rf, largeur w, alésage b. */
function pulleyProfile({ w, rf, rg, bore }, n) {
  const h = w / 2, p = [[bore, -h], [rf - 0.006, -h], [rf, -h + 0.005]];
  const pitch = (w - 0.012) / n;
  for (let k = 0; k < n; k++) {
    const yc = -h + 0.006 + pitch * (k + 0.5);
    const rr = Math.min(rg, pitch / 2 - 0.0005);
    for (let i = 0; i <= 10; i++) {
      const t = -Math.PI / 2 + (Math.PI * i) / 10;
      p.push([R + rr - rr * Math.cos(t), yc + rr * Math.sin(t)]);
    }
  }
  p.push([rf, h - 0.005], [rf - 0.006, h], [bore, h], [bore, -h]);
  return p;
}

export default function P006(api) {
  const S = api.S;
  const { at, group, cyl, ring, lathe, nut, bolt, bearing } = S;
  const toZ = [Math.PI / 2, 0, 0]; // axe Y local → +Z
  const [lx, ly] = PF.lower, [px, py] = PF.pivot;

  // 1 — Frame MA616.
  const f = [];
  {
    const out = [
      [0.02, 0.2], ...arc([0, 0], 0.07, 1.2, -0.9, 8).slice(1), [0.032, -0.12], [0.032, -0.555],
      ...arc([px, py], 0.034, Math.PI / 2, -Math.PI / 2, 8), [0.0, -0.7], [-0.04, -0.97],
      ...arc([lx, ly], 0.07, 0.6, -Math.PI, 14), [-0.19, -0.98], [-0.17, -0.72], [-0.12, -0.3], [-0.12, 0.1],
      ...arc([-0.05, 0.14], 0.07, Math.PI, 1.1, 8).slice(1),
    ];
    const holes = [[0, 0, 0.0127], [lx, ly, 0.0105], [px, py, 0.0068], slot([-0.06, -0.2], 0.05, 0.016, -1.45), slot([-0.1, -0.82], 0.07, 0.016, -1.38)];
    f.push(profilZ(api, out, holes, ZP1 - ZP0, (ZP0 + ZP1) / 2));
    // Retour plié le long du bord arrière (vers −Z), qui raidit le flasque (couverture).
    const back = [[-0.12, 0.1], [-0.12, -0.3], [-0.17, -0.72], [-0.19, -0.98]];
    for (let k = 1; k < back.length; k++) {
      const [p0, p1] = [back[k - 1], back[k]], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const n = [(p1[1] - p0[1]) / L, -(p1[0] - p0[0]) / L]; // normale vers l'intérieur du flasque
      const o = (q) => [q[0] - n[0] * 0.0064, q[1] - n[1] * 0.0064];
      f.push(strut(api, o(p0), o(p1), 0.5 * IN, 0.04, ZP0 - 0.02, 'red', 0.003));
    }
    // Bossage du pivot (bague soudée, face −Z) et fourreau du ressort sur la face +Z (le long de X, ouvert vers le mât).
    f.push(at(ring(0.022, 0.0068, ZP0 - PF.ears[0][1] - 0.001, 'red', { axis: 'z', seg: 20 }), [px, py, (ZP0 + PF.ears[0][1] + 0.001) / 2]));
    const zs = ZP1 + 0.022;
    f.push(at(S.shell(0.022, 0.017, 0.07, 'red', { axis: 'x', seg: 24 }), [-0.035, PF.springY, zs]));
    f.push(at(cyl(0.022, 0.008, 'red', { axis: 'x', seg: 24 }), [-0.074, PF.springY, zs]));
    f.push(boxAt(api, [-0.07, PF.springY - 0.012, ZP1], [0, PF.springY + 0.012, zs - 0.016]));
    // Carter ajouré autour de la poulie arrière (côté arrière et dessous) : deux joues en arc et quatre barrettes
    // entre trois lumières, du flasque vers −Z.
    const rc = LO.rf + 0.018, a0 = 1.75, a1 = 4.25, zc0 = -LO.w / 2 - 0.02;
    const sector = [...arc([lx, ly], rc + 0.006, a0, a1, 16), ...arc([lx, ly], rc - 0.006, a1, a0, 16)];
    for (const z of [zc0 + 0.003, ZP0 - 0.003]) f.push(profilZ(api, sector, [], 0.006, z));
    for (const a of [a0 + 0.04, a0 + (a1 - a0) / 3, a0 + (2 * (a1 - a0)) / 3, a1 - 0.04]) {
      f.push(at(S.box(0.03, 0.004, ZP0 - zc0, 'red', { r: 0.001 }), [lx + rc * Math.cos(a), ly + rc * Math.sin(a), (ZP0 + zc0) / 2], [0, 0, a + Math.PI / 2]));
    }
  }
  api.part('1', group(...f), [0, 0, 0]);

  // Poulies et leurs pièces : éclatées le long de −Z (écrou le plus loin), arbre vers +Z.
  const pile = (c, P, refs, w, washerT, brg) => {
    const [rP, rS, rW, rW2, rN, rB] = refs;
    const h = w / 2, zN = -(h + washerT) - 0.0038; // face extérieure de la rondelle 3/4
    api.part(rP, at(lathe(pulleyProfile(P, rP === '2' ? 2 : 1), 'steel', { seg: 40 }), [c[0], c[1], 0], toZ), [0, 0, -0.32]);
    for (const s of [-1, 1]) {
      api.part(rB, at(bearing(brg[0], brg[1], brg[2], 'steel'), [c[0], c[1], s * (h - brg[2] / 2 - 0.004)], toZ), [0, 0, s < 0 ? -0.42 : -0.2]);
      api.part(rW, at(S.washer(0.032, 0.0128, washerT, 'zinc'), [c[0], c[1], s * (h + washerT / 2)], toZ), [0, 0, s < 0 ? -0.5 : -0.12]);
    }
    api.part(rW2, at(S.washer(0.0254, 0.0103, 0.0038, 'zinc'), [c[0], c[1], zN + 0.0019], toZ), [0, 0, -0.58]);
    const nh = 0.64 * IN;
    api.part(rN, at(nut(1.125 * IN, nh, 'zinc'), [c[0], c[1], zN - nh / 2], toZ), [0, 0, -0.66]);
    // Arbre : tête épaulée contre la face +Z du flasque, corps lisse, bout fileté 3/4-10.
    const zT = zN - nh - 0.006, rb = brg[1];
    const shaft = lathe([[0, zT], [0.0089, zT], [0.0095, zT + 0.002], ...S.thread(0.0095, zT + 0.003, zN + 0.004, { pitch: 0.0025, maxTurns: 8 }), [rb, zN + 0.004], [rb, ZP1], [0.026, ZP1], [0.026, ZP1 + 0.012], [0.022, ZP1 + 0.016], [0, ZP1 + 0.016]], 'steel', { seg: 24 });
    api.part(rS, at(shaft, [c[0], c[1], 0], toZ), [0, 0, 0.3]);
  };
  pile([0, 0], UP, ['2', '4', '7', '8', '9', '6'], UP.w, ZP0 - UP.w / 2, UP.brg);
  pile([lx, ly], LO, ['3', '5', '11', '12', '13', '10'], LO.w, ZP0 - LO.w / 2, LO.brg);

  // 14 — Boulon de bascule 1/2-13 × 5 po (tête côté +Z, à travers les oreilles du mât et le flasque).
  api.part('14', bolt(0.5 * IN, 5 * IN, 'zinc', { axis: 'z', pos: [px, py, PF.ears[1][1] + 0.0005] }), [0, 0, 0.3]);
  // 15 — Ressort de la poulie #2 (du fourreau à la plaque d'about du mât) ; 16 — vis de ressort (MP0375) dans le
  // fond du fourreau, tête vers l'arrière, qui règle la précharge.
  const zs = ZP1 + 0.022, xMast = X_BUTEE;
  api.part('15', at(S.spring(0.0135, 0.0028, xMast - 0.0, 7, 'black', { axis: 'x' }), [xMast / 2, PF.springY, zs]), [0.12, 0, 0.08]);
  api.part('16', bolt(0.5 * IN, 0.075, 'zinc', { axis: '-x', pos: [-0.078, PF.springY, zs] }), [-0.25, 0, 0]);
  return { view: { dir: [0.75, 0.55, -1.2] } };
}
