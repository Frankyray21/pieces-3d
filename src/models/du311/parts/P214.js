// P214 — Banc de distributeurs de translation : CX028862 rév. 0 « VALVE BANK
// ASSY - 7 SEC TRAM » (page 214), repère 11 de P186. Distributeur PVG 32 à
// 7 sections (1 = P216) couché, empilage horizontal, poignées vers le haut et
// électrovannes PVE vers le bas, comme sur les trois vues de la page 214.
// Raccords des orifices de travail (face +Z) : adaptateurs droits MORB -10 →
// JIC -06 (7, ×10) sur les cinq sections -06, MORB -10 → JIC -12 (8, ×4) sur
// les deux sections de translation (3 de P216) ; sur chaque section l'orifice
// A (haut) reçoit un coude tournant court (2 en -06 ×5, 3 en -12) et l'orifice
// B (bas) un coude à tube cintré long (4 en -06 ×5, 5 en -12), sorties vers le
// haut, en quinconce. Orifices P et T du couvercle d'entrée : adaptateurs
// MORB -12 → JIC -12 (9, ×2), coude court (3) sur P, coude long (5) sur T.
// Orifice LS en bout du couvercle d'entrée : adaptateur MORB -05 → JIC -06
// (6). Quatre vis H 5/16-18 × 5/8 po (10) et rondelles fendues (11) fixent le
// couvercle d'entrée et la plaque d'extrémité à leur support (face -Z).
// Repère : origine = celle de P216 (centre de la face extérieure de la plaque
// d'extrémité) ; P216 tourné de -90° autour de Z : son empilage (Y) suit +X,
// ses poignées (-X) montent selon +Y, ses orifices A / B regardent +Z.
// Encombrement ≈ 0.43 (X) × 0.42 (Y) × 0.25 (Z) m.
import { IN, PVG, orbAdapter, swivelElbow, orient } from './_chassis.js';

export default function P214(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { sec, end, inlet, d } = PVG;
  const H = end + 7 * sec + inlet;
  // Point du repère de P216 (xv, yv, zv) → repère P214.
  const W = ([xv, yv, zv]) => [yv, -xv, zv];

  P('1', S.at(api.sub('P216'), [0, 0, 0], [0, 0, -Math.PI / 2]), [0, 0, -0.12]);

  // Raccords d'un orifice de la face +Z : adaptateur, puis coude tourné vers +Y.
  const port = (pos, orb, jic, refA, refE, long) => {
    const ad = orbAdapter(api, orb, jic);
    P(refA, orient(api, ad.obj, pos, [0, 0, 1], [0, 1, 0]), [0, 0, 0.06]);
    const el = swivelElbow(api, jic, { long });
    P(refE, orient(api, el.obj, [pos[0], pos[1], pos[2] + ad.tip], [0, 0, 1], [0, 1, 0]), [0, long ? 0.05 : 0.03, 0.12]);
  };
  // Sections de bas en haut dans P216 : 5, 3, 3, 6, 6, 6, 6.
  const tram = [false, true, true, false, false, false, false];
  tram.forEach((t, i) => {
    const yv = end + sec * (i + 0.5);
    port(W([-0.024, yv, d / 2]), 10, t ? 12 : 6, t ? '8' : '7', t ? '3' : '2', false);
    port(W([0.024, yv, d / 2]), 10, t ? 12 : 6, t ? '8' : '7', t ? '5' : '4', true);
  });
  // Couvercle d'entrée : P et T.
  const yi = H - inlet / 2 - 0.004;
  port(W([-0.028, yi, d / 2]), 12, 12, '9', '3', false);
  port(W([0.03, yi, d / 2]), 12, 12, '9', '5', true);
  // LS en bout (face +X du banc).
  const ls = orbAdapter(api, 5, 6);
  P('6', orient(api, ls.obj, [H, -0.025, 0.025], [1, 0, 0]), [0.06, 0, 0]);

  // Vis de fixation et rondelles fendues, face -Z du couvercle d'entrée et de la plaque d'extrémité.
  const bolt = () => S.bolt(0.3125 * IN, 0.625 * IN, 'zinc', { axis: 'y' });
  const lockW = () => S.group(S.washer(0.3125 * IN * 0.92, 0.3125 * IN * 0.52, 0.002, 'zinc'));
  const spots = [[end / 2, 0.035], [end / 2, -0.035], [H - inlet / 2, 0.035], [H - inlet / 2, -0.035]];
  spots.forEach(([x, y]) => {
    // Vis depuis l'arrière du support (tôle 1/4 po supposée), tête vers -Z.
    P('11', orient(api, lockW(), [x, y, -d / 2 - 0.0064 - 0.001], [0, 0, -1]), [0, 0, -0.04]);
    P('10', orient(api, bolt(), [x, y, -d / 2 - 0.0064 - 0.002], [0, 0, -1]), [0, 0, -0.07]);
  });
  return { view: { dir: [0.5, 0.8, 1.1] } };
}
