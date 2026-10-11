// P090 — Guides de tiges Ø 3 1/2 po (89 mm) × 17 tiges CX036797-350 rév. 0
// (page 90) : « OPTION, PIPE GUIDES - Ø3.5" (89MM) X 17 PIPE », repère 14 de
// l'avance P028. Deux diviseurs (3, CX036799) en tôle de 3/4 po serrés sur
// des brides de l'axe central du carrousel (P108, non dessiné ici) : étoile à
// 17 encoches en U (tige Ø 3 1/2, encoche de 3.6 po centrée sur le cercle des
// alvéoles), dix-sept lumières d'allègement entre moyeu et encoches, alésage
// de l'axe et huit trous Ø 13/16 sur Ø 7 ; une fente d'orientation radiale
// (« orientation hole », alignée d'un diviseur à l'autre) fermée dessus et
// dessous par une plaque couvre-fente (1, CX036620) tenue par deux vis H
// 1/2-13 × 1 1/4 entièrement filetées (4) et rondelles Nord-Lock (6). Sous
// chaque diviseur, deux demi-entretoises (2, CX036786) entre le diviseur et
// la bride de l'axe ; huit vis H 3/4-10 × 4 1/2 (5) par diviseur, rondelle
// Nord-Lock (7) sous la tête et sous l'écrou (8) — la bride de l'axe (1 po
// supposé) est entre l'entretoise et la rondelle basse.
// Repère : celui de l'avance (placé à l'identité par P028) ; diviseurs
// centrés sur l'axe du carrousel (FEED.car.x, FEED.car.z), plan médian aux
// hauteurs des guides de ../feed.js (1,30 et 2,05 m), encoches sur les
// alvéoles (première au point de transfert, FEED.pocketA0) ; rayon extérieur
// FEED.car.r. Encombrement ≈ 0.68 × 0.84 × 0.68 m.
// Simulation : toutes les pièces tournent avec le carrousel (corps « carousel »).
import { FEED } from '../feed.js';
import { body } from '../layout.js';
import { u, along, hhcs, hexNut, nordLock } from '../../du311/parts/_avance_b.js';
import { sheet, arc, nlT } from './_feedcent.js';

const N = 17;
const T = 0.75; // tôle des diviseurs (po)
const RS = 1.8 * 0.0254; // demi-largeur des encoches (m)
const HUB = 2.15 * 0.0254, BC = 3.5 * 0.0254; // alésage, rayon des trous de vis (m)
const SPACER = { ri: 2.2 * 0.0254, ro: 4.6 * 0.0254, h: 1.5 };
const FLANGE = 1.0; // bride de l'axe (po)
const LEVELS = [1.3, 2.05];

export default function P090(api) {
  const { THREE, S } = api;
  const { at } = S;
  const C = FEED.car;
  const P = (ref, obj, e) => api.part(ref, body('carousel', obj), e);
  const R0 = C.r, rp = C.rp, STEP = (2 * Math.PI) / N;
  // Plan des diviseurs (comme les plaques de ../feed.js) : point (a, b) du plan
  // → avance (C.x + a, y, C.z - b).
  const W = (a, b, y) => [C.x + a, y, C.z - b];
  const pol = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
  const aPk = (k) => FEED.pocketA0 + k * STEP;
  const aSlot = aPk(8) + STEP / 2; // fente d'orientation, entre deux encoches
  const bolts = Array.from({ length: 8 }, (_, i) => aSlot + Math.PI / 8 + (i * Math.PI) / 4);

  // ------------------------------------------------ 3 — diviseur (contour du plan)
  const outline = [];
  const dRim = Math.atan2(RS, Math.sqrt(R0 * R0 - RS * RS));
  const lRim = Math.sqrt(R0 * R0 - RS * RS);
  for (let k = 0; k < N; k++) {
    const a = aPk(k), ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    // côté -n de l'encoche : du bord au fond, demi-cercle intérieur, côté +n.
    outline.push([lRim * ux - RS * nx, lRim * uy - RS * ny]);
    for (let i = 0; i <= 12; i++) {
      const t = a - Math.PI / 2 - (Math.PI * i) / 12;
      outline.push([rp * ux + RS * Math.cos(t), rp * uy + RS * Math.sin(t)]);
    }
    outline.push([lRim * ux + RS * nx, lRim * uy + RS * ny]);
    // bord extérieur jusqu'à l'encoche suivante
    const rim = arc(0, 0, R0, a + dRim, a + STEP - dRim, 5);
    outline.push(...rim.slice(1, -1));
  }
  const holes = [[0, 0, HUB], ...bolts.map((t) => [...pol(BC, t), 0.0103])];
  // Lumières d'allègement entre moyeu et encoches (sauf sur la fente).
  for (let k = 0; k < N; k++) {
    const t = aPk(k) + STEP / 2;
    if (Math.abs(Math.atan2(Math.sin(t - aSlot), Math.cos(t - aSlot))) < 0.01) continue;
    // Lumière en goutte allongée : bout intérieur arrondi, bout extérieur en arc.
    const r1 = 0.118, r2 = 0.19;
    holes.push([...arc(...pol(r1, t), 0.008, t + Math.PI / 2, t + 1.5 * Math.PI, 6), ...arc(0, 0, r2, t - 0.065, t + 0.065, 4)]);
  }
  // Fente d'orientation (3/4 po) du moyeu jusqu'à r = 0,2.
  const ws = 0.0095;
  const sx = Math.cos(aSlot), sy = Math.sin(aSlot), nxs = -sy, nys = sx;
  const slot = [[0.07, -ws], [0.2, -ws], [0.2, ws], [0.07, ws]].map(([r, w]) => [r * sx + w * nxs, r * sy + w * nys]);
  holes.push(slot);
  const mkDivider = () => {
    const m = sheet(S, THREE, outline, u(T), 'grey', holes);
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  // ------------------------------------------------ 1 — plaques couvre-fente
  const cover = (dy) => {
    const r0 = 0.125, r1 = 0.205, hw = 0.0254;
    const pts = [[r0, -hw], [r1, -hw], [r1, hw], [r0, hw]].map(([r, w]) => [r * sx + w * nxs, r * sy + w * nys]);
    const hp = [0.15, 0.18].flatMap((r) => [-1, 1].map((k) => [r * sx + k * 0.016 * nxs, r * sy + k * 0.016 * nys, 0.0071]));
    const m = sheet(S, THREE, pts, u(0.25), 'grey', hp);
    m.rotation.x = -Math.PI / 2;
    m.position.y = dy;
    return m;
  };
  // ------------------------------------------------ 2 — demi-entretoises
  const spacer = (t0, t1) => {
    const pts = [...arc(0, 0, SPACER.ro, t0, t1, 18), ...arc(0, 0, SPACER.ri, t1, t0, 12)];
    const hp = bolts.filter((t) => {
      const d = Math.atan2(Math.sin(t - (t0 + t1) / 2), Math.cos(t - (t0 + t1) / 2));
      return Math.abs(d) < (t1 - t0) / 2;
    }).map((t) => [...pol(BC, t), 0.0103]);
    const m = sheet(S, THREE, pts, u(SPACER.h), 'grey', hp);
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  LEVELS.forEach((yc, li) => {
    const yT = yc + u(T) / 2, yB = yc - u(T) / 2;
    const e = (dy) => [0, dy, 0];
    P('3', at(mkDivider(), [C.x, yc, C.z]), e(li ? 0.25 : -0.25));
    // Plaques couvre-fente dessus et dessous ; vis 4 : celles du dessus aux
    // trous r = 0,15, celles du dessous aux trous r = 0,18.
    for (const [s, r] of [[1, 0.15], [-1, 0.18]]) {
      const y0 = s > 0 ? yT + u(0.125) : yB - u(0.125);
      P('1', at(cover(0), [C.x, y0, C.z]), e(s * 0.08));
      for (const k of [-1, 1]) {
        const a = r * sx + k * 0.016 * nxs, b = r * sy + k * 0.016 * nys;
        const yh = s > 0 ? yT + u(0.25) : yB - u(0.25);
        P('6', along(THREE, nordLock(S, THREE, 0.5), [0, s, 0], W(a, b, yh)), e(s * 0.12));
        P('4', along(THREE, hhcs(S, THREE, 0.5, 1.25), [0, s, 0], W(a, b, yh + s * u(nlT(0.5)))), e(s * 0.16));
      }
    }
    // Demi-entretoises sous le diviseur, coupées au droit de la fente.
    const g = 0.12;
    P('2', at(spacer(aSlot + g, aSlot + Math.PI - g), [C.x, yB - u(SPACER.h) / 2, C.z]), e(-0.14));
    P('2', at(spacer(aSlot + Math.PI + g, aSlot + 2 * Math.PI - g), [C.x, yB - u(SPACER.h) / 2, C.z]), e(-0.14));
    // Vis 5, rondelles 7, écrous 8 : bride de l'axe sous l'entretoise.
    const yN = yB - u(SPACER.h + FLANGE);
    for (const t of bolts) {
      const [a, b] = pol(BC, t);
      P('7', along(THREE, nordLock(S, THREE, 0.75), [0, 1, 0], W(a, b, yT)), e(0.1));
      P('5', along(THREE, hhcs(S, THREE, 0.75, 4.5), [0, 1, 0], W(a, b, yT + u(nlT(0.75)))), e(0.2));
      P('7', along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], W(a, b, yN)), e(-0.24));
      P('8', along(THREE, hexNut(S, THREE, 0.75), [0, -1, 0], W(a, b, yN - u(nlT(0.75)))), e(-0.3));
    }
  });
  return { view: { dir: [1, 0.7, 1.1] } };
}
