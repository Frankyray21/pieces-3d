// P114 — Axe central du carrousel CX036250 rév. 0 (page 114) : « ASSY,
// CAROUSEL CENTER AXLE ». Axe tournant du carrousel en trois tronçons
// boulonnés bride sur bride, tenu en bas dans la bague du cadre bas et en haut
// dans celle du cadre haut (12 de P108) :
// - tronçon haut (2) : tube Ø 3 1/2 po, bride de joint en bas, bride lisse à
//   huit trous (diviseur de tiges haut, option P090) à 1.91 m, portée Ø 2 1/2
//   dans la bague haute et bout cannelé (10 cannelures) qui reçoit l'étoile
//   d'indexage (18 de P108) dans le carter, taraudé pour la vis de bout ;
// - tronçon milieu (3) : tube entre deux brides de joint ;
// - tronçon bas (4) : bride de joint en haut, bride lisse du diviseur bas à
//   0.68 m, collet d'appui sur la bague basse et portée Ø 2 1/2 ;
// - deux cales (5) entre les brides de chaque joint ; joints serrés par 6 vis
//   3/4 × 2 1/2 (7), rondelles Nord-Lock (8) sous tête et sous écrou, écrous
//   (9) ; rondelle de bout (1) et vis 3/4 × 1 1/2 (6) + Nord-Lock (8) sur
//   l'étoile.
// Les brides lisses portent l'ergot qui oriente les diviseurs de tiges.
// Repère : axe du carrousel, y = 0 au pied du mât (repère de l'avance
// translaté en (FEED.car.x, FEED.car.z), mêmes axes) ; P108 le place à
// l'identité au centre du carrousel. Ensemble tournant (corps « carousel »).
// Encombrement ≈ Ø 0.216 (brides) × 2.15 m (y de 0.29 à 2.44).
// Cotes : vis et quantités de la liste ; diamètres et hauteurs des brides
// d'après l'élévation de P108 (≈ 0.8 px/mm), joints aux hauteurs des brides
// boulonnées de l'élévation ; portées dans les bagues du cadre (P136).
import { u, bolt, nut, nordLock, prism, circle, H } from './_carousel.js';

const R = { body: u(1.75), jour: u(1.25), flange: u(4.25), bc: u(3.25), collar: u(1.625) };
const FT = u(0.625); // épaisseur des brides
const SHIM = u(1 / 16);
// Joints (dessus de la bride inférieure) et brides lisses (milieu).
const J = { low: 0.8568, up: 1.4368 };
const PLAIN = [0.68, 1.91];
const Y = {
  jourBot: H.baseTop - u(0.25), // bout de la portée basse dans la bague
  collarBot: H.baseTop + u(1.88) + u(0.1875), // collet sur la collerette de la bague basse
  shoulder: 2.30, // épaulement sous la portée haute
  washer14: H.topTop + u(0.1875), // dessus de la collerette de la bague haute (rondelle 14)
  splineBot: H.topTop + u(0.1875) + u(0.375),
  top: H.topTop + u(0.1875) + u(0.375) + u(1.0), // dessus de l'étoile = bout de l'axe
};
export const AXLE114 = { ...Y, plain: PLAIN, joints: J, flangeR: R.flange, flangeT: FT, bodyR: R.body, jourR: R.jour };

export default function P114(api) {
  const { S } = api;
  const { lathe, group, merged, at, weldRing } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const DIV = 8, JB = 6; // trous des brides lisses, vis des joints

  // Bride (prisme percé) de y0 à y0 + FT : trous au cercle R.bc, ergot optionnel.
  const flange = (y0, n, key = false, mat = 'grey') => {
    const outline = circle(0, 0, R.flange, 48);
    const holes = Array.from({ length: n }, (_, i) => {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      return [R.bc * Math.cos(a), R.bc * Math.sin(a), u(13 / 32)];
    });
    const parts = [prism(api, outline, y0, y0 + FT, mat, holes)];
    if (key) parts.push(S.box(u(1.0), FT, u(0.75), mat, { pos: [R.flange + u(0.3), y0 + FT / 2, 0], r: 0.001 }));
    return merged(parts, mat);
  };
  const tube = (y0, y1) => lathe([[0, y0], [R.body, y0], [R.body, y1], [0, y1]], 'grey', { seg: 32 });

  // ================================================ 4 — tronçon bas
  P('4', group(
    lathe([[0, Y.jourBot], [R.jour - 0.002, Y.jourBot], [R.jour, Y.jourBot + 0.002], [R.jour, Y.collarBot], [R.collar, Y.collarBot], [R.collar, Y.collarBot + u(0.5)], [R.body, Y.collarBot + u(0.5)], [0, Y.collarBot + u(0.5)]], 'steel', { seg: 32 }),
    tube(Y.collarBot + u(0.5), J.low - FT),
    flange(PLAIN[0] - FT / 2, DIV, true),
    flange(J.low - FT, JB),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, PLAIN[0] - FT / 2 - 0.003, 0] }),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, PLAIN[0] + FT / 2 + 0.003, 0] }),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, J.low - FT - 0.003, 0] }),
  ), [0, -0.25, 0]);

  // ================================================ 3 — tronçon milieu
  const m0 = J.low + 2 * SHIM, m1 = J.up;
  P('3', group(
    flange(m0, JB), tube(m0 + FT, m1 - FT), flange(m1 - FT, JB),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, m0 + FT + 0.003, 0] }),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, m1 - FT - 0.003, 0] }),
  ), [0.25, 0, 0]);

  // ================================================ 2 — tronçon haut
  const u0 = J.up + 2 * SHIM;
  // cannelures : profil denté de la portée haute
  const spl = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, w = (Math.PI * 2) / 10;
    for (const [k, r] of [[0.05, R.jour - u(0.12)], [0.15, R.jour], [0.55, R.jour], [0.65, R.jour - u(0.12)]]) spl.push([r * Math.cos(a + k * w), r * Math.sin(a + k * w)]);
  }
  P('2', group(
    flange(u0, JB), tube(u0 + FT, Y.shoulder),
    flange(PLAIN[1] - FT / 2, DIV, true),
    lathe([[0, Y.shoulder], [R.body, Y.shoulder], [R.body - 0.003, Y.shoulder + 0.003], [R.jour + 0.003, Y.shoulder + 0.003], [R.jour, Y.shoulder + 0.006], [R.jour, Y.splineBot], [0, Y.splineBot]], 'steel', { seg: 32 }),
    prism(api, spl, Y.splineBot, Y.top, 'steel', [[0, 0, u(0.4)]]),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, u0 + FT + 0.003, 0] }),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, PLAIN[1] - FT / 2 - 0.003, 0] }),
    weldRing(R.body + 0.002, 0.007, 'grey', { pos: [0, PLAIN[1] + FT / 2 + 0.003, 0] }),
  ), [0, 0.3, 0]);

  // ================================================ 5 — cales des joints
  const shim = (y0) => prism(api, circle(0, 0, R.flange - 0.002, 40), y0, y0 + SHIM, 'darkSteel', [
    [0, 0, R.body + 0.002],
    ...Array.from({ length: JB }, (_, i) => { const a = ((i + 0.5) / JB) * Math.PI * 2; return [R.bc * Math.cos(a), R.bc * Math.sin(a), u(13 / 32)]; }),
  ]);
  for (const j of [J.low, J.up]) for (let k = 0; k < 2; k++) P('5', shim(j + k * SHIM), [0.12 + k * 0.05, 0, 0]);

  // ================================================ 7, 8, 9 — boulonnerie des joints
  // vis tête en haut sur la bride supérieure, Nord-Lock sous tête et sous écrou
  const nlT = u(2 * Math.max(0.05, 0.75 * 0.11));
  for (const j of [J.low, J.up]) {
    const top = j + 2 * SHIM + FT, bot = j - FT;
    for (let i = 0; i < JB; i++) {
      const a = ((i + 0.5) / JB) * Math.PI * 2, x = R.bc * Math.cos(a), z = R.bc * Math.sin(a);
      const e = [Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05];
      P('8', at(nordLock(api, 0.75), [x, top, z]), [e[0], 0.05, e[2]]);
      P('7', at(bolt(api, 0.75, 2.5), [x, top + nlT, z]), [e[0], 0.11, e[2]]);
      P('8', at(nordLock(api, 0.75), [x, bot, z], [Math.PI, 0, 0]), [e[0], -0.05, e[2]]);
      P('9', at(nut(api, 0.75), [x, bot - nlT, z], [Math.PI, 0, 0]), [e[0], -0.1, e[2]]);
    }
  }

  // ================================================ 1, 6, 8 — rondelle et vis de bout
  P('1', lathe([[u(0.41), Y.top], [u(1.75), Y.top], [u(1.75), Y.top + u(0.3125)], [u(0.41), Y.top + u(0.3125)], [u(0.41), Y.top]], 'zinc', { seg: 32 }), [0, 0.12, 0]);
  P('8', at(nordLock(api, 0.75), [0, Y.top + u(0.3125), 0]), [0, 0.17, 0]);
  P('6', at(bolt(api, 0.75, 1.5), [0, Y.top + u(0.3125) + nlT, 0]), [0, 0.24, 0]);

  return { view: { dir: [1, 0.35, 1.1] } };
}
