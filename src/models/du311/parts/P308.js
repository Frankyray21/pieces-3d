// P308 — Tuyauterie d'admission d'air auxiliaire CX030851 rév. 0 (page 308) :
// « AUX AIR INLET PIPING DU311-T », repère 11 du surpresseur P274. Ligne
// 2 po NPT acier sch. 80 qui court au pied du châssis : de l'entrée (manchon
// forgé 3000 lb (5) ouvert, côté +X), mamelon 12 po (10), vanne à bille 2 po
// (1), mamelon 5 po (9), manchon (5) et adaptateur droit MNPT-JIC -32 (4) ;
// boyau d'air 2 po × 28 po (3 : écrou tournant JIC à l'entrée, embout mâle
// NPT à la sortie) qui descend en S vers le clapet antiretour à ressort 2 po
// (2), mamelon 4 po (8), coude femelle 45° (6), long mamelon 65 po (11),
// coude femelle 90° (7) et adaptateur droit MNPT-JIC -32 (4) de sortie, d'où
// part le boyau vers le surpresseur (P274).
// Repère : origine au centre du coude 90° (7) ; X le long du mamelon 65 po
// (+X vers l'entrée d'air, ligne haute), Y vers le haut, sortie du coude 7
// vers -Z (bout du cône JIC de l'adaptateur 4 à z = -0.139). La ligne haute
// (entrée) est à y = 0.40, en x de 2.53 (adaptateur 4) à 3.19 (bout du
// manchon d'entrée).
// Encombrement ≈ 3.24 (X, de -0.045 à 3.194) × 0.51 (Y, de -0.045 à 0.463) ×
// 0.18 (Z, de -0.139 à 0.045) m.
// Cotes : diamètres, longueurs des mamelons et du boyau d'après la liste ;
// raccords aux cotes usuelles (coudes et manchons forgés 3000 lb, vanne et
// clapet 2 po) ; cheminement d'après la page 308 (le dessin n'est pas coté :
// ligne supposée dans un plan vertical, coude 7 tourné vers l'arrière).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const E = I(0.55); // engagement des filets NPT 2 po
const HOSE_Y = 0.4; // hauteur de la ligne d'entrée

export default function P308(api) {
  const { S } = api;
  const { lathe, tube, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const OD = ACC.pipeOD(32), r = OD / 2;
  const add = (p, d, k) => p.map((v, i) => v + d[i] * k);
  const X = [1, 0, 0];

  // ------------------------------------------------------------ 7 — coude 90° femelle (acier forgé)
  const el7 = ACC.pipeElbow(S, 32, { forged: true });
  const A = el7.userData.a;
  // Entrée (-Y local) vers +X (mamelon 11), sortie (+X local) vers -Z.
  P('7', O(el7, [0, 0, 0], [-1, 0, 0], [0, 0, -1]), [-0.08, 0, 0]);

  // ------------------------------------------------------------ 4 — adaptateur de sortie MNPT-JIC -32
  const ad = ACC.straight(S, { a: 32, b: 32, mat: 'zinc' });
  P('4', O(ad, [0, 0, -A], [0, 0, -1], [1, 0, 0]), [-0.08, 0, -0.08]);

  // ------------------------------------------------------------ 11 — mamelon 65 po
  const x11 = A - E;
  P('11', O(ACC.nipple(S, 32, I(65), 'darkSteel', { sch: 80 }), [x11, 0, 0], [1, 0, 0], [0, 0, 1]), [0, 0, 0]);

  // ------------------------------------------------------------ 6 — coude 45° femelle
  const el6 = ACC.pipeElbow(S, 32, { angle: 45, forged: true });
  const A6 = el6.userData.a;
  const c6 = [x11 + I(65) - E + A6, 0, 0];
  P('6', O(el6, c6, [1, 0, 0], [0, 1, 0]), [0.05, -0.05, 0]);
  const up = [Math.SQRT1_2, Math.SQRT1_2, 0]; // sortie du coude 6

  // ------------------------------------------------------------ 8 — mamelon 4 po
  const p8 = add(c6, up, A6 - E);
  P('8', O(ACC.nipple(S, 32, I(4), 'darkSteel', { sch: 80 }), p8, up, [0, 0, 1]), [0.04, 0.04, 0]);

  // ------------------------------------------------------------ 2 — clapet antiretour à ressort 2 po
  // Corps laiton femelle × femelle 4 5/8 po : deux six-pans 3 1/8, corps
  // renflé Ø 3 3/8, flèche de sens venue de fonderie.
  const LV = I(4.625);
  const p2 = add(p8, up, I(4) - E);
  const chk = group(
    merged([
      lathe([[r * 0.98, 0], [I(1.8), 0], [I(1.8), I(0.95)], [r * 0.98, I(0.95)], [r * 0.98, 0]], 'brass', { seg: 6 }),
      lathe([[r * 0.98, LV - I(0.95)], [I(1.8), LV - I(0.95)], [I(1.8), LV], [r * 0.98, LV], [r * 0.98, LV - I(0.95)]], 'brass', { seg: 6 }),
      lathe([[0, I(0.95)], [I(1.55), I(0.95)], [I(1.7), I(1.6)], [I(1.7), LV - I(1.6)], [I(1.55), LV - I(0.95)], [0, LV - I(0.95)]], 'brass', { seg: 28 }),
      S.box(I(0.18), I(1.6), I(0.1), 'brass', { pos: [0, LV / 2, I(1.7)] }),
      S.box(I(0.4), I(0.3), I(0.1), 'brass', { pos: [0, LV / 2 + I(0.75), I(1.7)], rot: [0, 0, Math.PI / 4] }),
    ], 'brass'),
  );
  P('2', O(chk, p2, up, [0, 0, 1]), [0.06, 0.08, 0]);

  // ------------------------------------------------------------ 3 — boyau d'air 2 po × 28 po
  // Embout mâle NPT serti vissé dans le clapet, écrou tournant JIC -32 sur
  // l'adaptateur 4 de la ligne haute ; tracé en S, longueur de la liste.
  const p3 = add(p2, up, LV - E); // bout du filet NPT de l'embout
  const ferr = I(4.2); // embout serti (filet + six-pans + douille)
  const s0 = add(p3, up, ferr); // sortie de la douille
  const yE = HOSE_Y;
  const fitLen = (x1) => {
    const q = (t) => {
      // Bézier cubique de s0 (tangente up) à e0 (tangente +X).
      const e0 = [x1, yE, 0];
      const h = Math.hypot(e0[0] - s0[0], e0[1] - s0[1]) * 0.42;
      const c1 = add(s0, up, h), c2 = add(e0, X, -h);
      const u = 1 - t;
      return [0, 1, 2].map((i) => u * u * u * s0[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * e0[i]);
    };
    let L = 0, prev = q(0);
    const pts = [prev];
    for (let i = 1; i <= 40; i++) { const p = q(i / 40); L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p; pts.push(p); }
    return { L, pts };
  };
  let lo = s0[0] + 0.1, hi = s0[0] + 1.0, sol;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; sol = fitLen(m); if (sol.L < I(28) - 2 * ferr) lo = m; else hi = m; }
  const e0 = sol.pts[sol.pts.length - 1];
  // Embouts : douille sertie à empreintes, six-pans ; côté entrée, écrou tournant JIC.
  const sleeve = (len) => lathe([[r * 0.8, 0], [I(1.42), 0], [I(1.42), len * 0.3], [I(1.36), len * 0.36], [I(1.42), len * 0.42], [I(1.42), len * 0.6], [I(1.36), len * 0.66], [I(1.42), len * 0.72], [I(1.42), len], [r * 0.8, len]], 'zinc', { seg: 24 });
  const endA = group(merged([
    sleeve(ferr * 0.55),
    lathe([[0, -ferr * 0.45], [r * 0.92, -ferr * 0.45], ...S.thread(r * 0.97, -ferr * 0.45 + 0.001, -ferr * 0.12, { r1: r, maxTurns: 6 }).slice(1), [0, -ferr * 0.12]], 'zinc', { seg: 20 }),
    lathe([[r * 0.8, -ferr * 0.12], [I(1.5), -ferr * 0.12], [I(1.5), 0], [r * 0.8, 0]], 'zinc', { seg: 6 }),
  ], 'zinc'));
  const endB = group(merged([
    sleeve(ferr * 0.55),
    lathe([[r * 0.8, -ferr * 0.45], [I(1.55), -ferr * 0.45], [I(1.55), 0], [r * 0.8, 0]], 'zinc', { seg: 6 }),
  ], 'zinc'));
  const hoseBody = tube(sol.pts, I(1.32), 'hose', { ends: 'none', radial: 20, seg: 60 });
  const hoseEndA = O(endA, add(s0, up, -ferr * 0.55), up, [0, 0, 1]);
  const hoseEndB = O(endB, [e0[0] + ferr * 0.55, e0[1], 0], [-1, 0, 0], [0, 0, 1]);
  P('3', group(hoseBody, hoseEndA, hoseEndB), [0.05, 0.12, 0]);

  // ------------------------------------------------------------ 4 — adaptateur MNPT-JIC -32 de la ligne haute
  // Cône JIC (bout) au siège de l'écrou tournant du boyau.
  const seat = e0[0] + ferr * 0.55 + ferr * 0.45;
  const ad2 = ACC.straight(S, { a: 32, b: 32, mat: 'zinc' });
  const x4 = seat + ad2.userData.tip; // face du six-pans (entrée du manchon)
  P('4', O(ad2, [x4, yE, 0], [-1, 0, 0], [0, 0, 1]), [0.08, 0.1, 0]);

  // ------------------------------------------------------------ 5 — manchons forgés 2 po, 9 — mamelon 5 po, 1 — vanne, 10 — mamelon 12 po
  const cpl = () => ACC.coupling(S, 32, 'darkSteel');
  const LC = I(0.76) * 2 + I(0.25);
  P('5', O(cpl(), [x4 - E * 0.4, yE, 0], X, [0, 0, 1]), [0.12, 0.1, 0]);
  const x9 = x4 - E * 0.4 + LC - E;
  P('9', O(ACC.nipple(S, 32, I(5), 'darkSteel', { sch: 80 }), [x9, yE, 0], X, [0, 0, 1]), [0.16, 0.1, 0]);
  const sv = I(2.15); // vanne : longueur hors tout ≈ 2,3 × sv
  const xv = x9 + I(5) - E + 1.15 * sv;
  P('1', at(S.ballValve(sv, 'steel'), [xv, yE, 0]), [0.2, 0.1, 0]);
  const x10 = xv + 1.15 * sv - E;
  P('10', O(ACC.nipple(S, 32, I(12), 'darkSteel', { sch: 80 }), [x10, yE, 0], X, [0, 0, 1]), [0.25, 0.1, 0]);
  P('5', O(cpl(), [x10 + I(12) - E, yE, 0], X, [0, 0, 1]), [0.3, 0.1, 0]);

  return { view: { dir: [0.35, 0.55, 1.2] } };
}
