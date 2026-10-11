// P108 — Bague CM10045 rév. 0 (page 108) : « BUSHING 1.00IDX1.25ODX.370LG ».
// Bague roulée 1 × 1 1/4 po, recoupée à 0.370 po dans une bague du commerce
// 1.0 × 1.25 × 0.50 po (1, CP10017). Elle garnit un des deux trous de l'axe
// transversal du tube de centreur (P106 repère 1 ; l'autre trou reçoit la
// bague entière de 1/2 po, P106 repère 2). Joint de roulage agrafé en
// créneau, comme sur le dessin.
// Repère : origine au centre de la bague, Y selon son axe (radial au tube de
// centreur dans P106), joint agrafé vers +Z. Encombrement Ø 0.032 × 0.0094 m.
// Cotes : désignation (Ø int. 1.00, Ø ext. 1.25, longueur 0.370 po).
import { u } from './_avance_b.js';

export const BUSH108 = { ri: u(0.5), ro: u(0.625), len: u(0.37) };

export default function P108(api) {
  const { S } = api;
  const ro = u(0.625), ri = u(0.5), h = u(0.37) / 2;
  // Joint agrafé : fente du bas jusqu'au milieu, créneau, fente du milieu au haut.
  const w = u(0.012) / ro, s1 = 0, s2 = 0.32, e = u(0.008);
  const windows = [
    { a: s1, w, y0: -h, y1: e },
    { a: (s1 + s2) / 2, w: s2 - s1 + w, y0: -e, y1: e },
    { a: s2, w, y0: -e, y1: h },
  ];
  const ring = S.slotted(ro, ri, -h, h, windows, 'brass', { seg: 48 });
  api.part('1', ring, [0, 0.02, 0]);
  return { view: { dir: [0.8, 0.9, 1.2] } };
}
