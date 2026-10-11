// P106 — Tube de centreur CM45362 rév. 2 (page 106) : « CENTRALIZER TUBES ».
// Profilé en C de tôle de 1/2 po (âme et deux ailes, angles pliés) ouvert
// vers l'axe de forage, qui coulisse dans le châssis du centreur fendu (P102)
// et reçoit une mâchoire (P146 repère 2) entre ses ailes. Les ailes sont
// échancrées en demi-cercle R 2.9 po côté tige ; l'aile haute a une
// encoche de 3.9 × 2.2 po côté âme (l'âme y est abaissée au niveau de la
// mâchoire). Trou de l'axe de mâchoire Ø 1 1/4 dans chaque aile, garni d'une
// bague roulée : P108 (1, 0.370 po) dans l'aile basse, CP10017 (2, 1/2 po)
// dans l'aile haute (coupe A-A).
// Repère (commun avec P104 et P146) : origine sur l'axe de forage, mâchoires
// fermées, au niveau du dessus de l'aile basse (= dessous de la mâchoire) ;
// +X de l'axe vers l'âme (sens d'ouverture), Y vers le haut, Z selon la
// longueur du profilé. Encombrement 0.175 (X, de 0.005 à 0.180) × 0.085 (Y,
// de -0.0127 à 0.0724) × 0.222 (Z) m.
// Cotes : vue de face de la page 106 (bague Ø 1 1/4 pour l'échelle :
// largeur 8 3/4, profondeur 6.9, échancrure R 2.9, axe à 3.7 po de l'axe de
// forage), section A-A (hauteur intérieure 2.35 po = mâchoire de 2 1/4).
import { u } from './_avance_b.js';

export const TUBE106 = {
  x0: u(0.2), x1: u(7.1), len: u(8.75), t: u(0.5), gap: u(2.35), pinX: u(3.7),
  notch: { w: u(3.9), x: u(4.9) }, arcR: u(2.9),
};

export default function P106(api) {
  const { THREE, S } = api;
  const { extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = 0.5, X0 = 0.2, X1 = 7.1, Z = 8.75 / 2, R = 2.9, GAP = 2.35, PX = 3.7, NW = 3.9 / 2, NX = 4.9;
  const arc = (n = 20) => {
    const a0 = Math.acos(X0 / R);
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = -a0 + (2 * a0 * i) / n; // de -Z vers +Z, côté +X
      return [R * Math.cos(a), R * Math.sin(a)];
    });
  };
  // Aile horizontale (contour (x, z) en po), de y0 à y0 + T ; trou de bague.
  const flange = (pts, y0) => {
    const m = extrude(pts.map(([x, z]) => [u(x), -u(z)]), u(T), 'grey', { holes: [[u(PX), 0, u(0.627)]] });
    m.rotation.x = -Math.PI / 2;
    m.position.y = u(y0 + T / 2);
    return m;
  };
  // Échancrure : du bord avant (x = X0) en demi-cercle autour de la tige.
  const lower = [[X0, -Z], [X1 - T, -Z], [X1 - T, Z], [X0, Z], ...arc().reverse()];
  const upper = [[X0, -Z], [X1 - T, -Z], [X1 - T, -NW], [NX, -NW], [NX, NW], [X1 - T, NW], [X1 - T, Z], [X0, Z], ...arc().reverse()];
  // Âme (plan YZ) entre les ailes ; angles pliés : quart de rond extérieur
  // de rayon T (le pli de l'aile haute s'interrompt à l'encoche).
  const web = extrude([[-Z, 0], [Z, 0], [Z, GAP], [-Z, GAP]].map(([z, y]) => [u(z), u(y)]), u(T), 'grey');
  web.rotation.y = -Math.PI / 2;
  web.position.x = u(X1 - T / 2);
  const bend = (yc, sgn, z0, z1) => {
    const pts = [[0, 0]];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI / 2;
      pts.push([T * Math.sin(a), sgn * T * Math.cos(a)]);
    }
    const m = extrude((sgn > 0 ? pts.slice().reverse() : pts).map(([x, yy]) => [u(x), u(yy)]), u(z1 - z0), 'grey');
    m.position.set(u(X1 - T), u(yc), u((z0 + z1) / 2));
    return m;
  };
  const tube = merged([
    flange(lower, -T),
    flange(upper, GAP),
    web,
    bend(0, -1, -Z, Z),
    bend(GAP, 1, -Z, -NW),
    bend(GAP, 1, NW, Z),
  ], 'grey');

  // Bagues roulées dans les trous de l'axe.
  const sub = api.sub('P108');
  P('1', at(sub, [u(PX), -u(0.37) / 2, 0]), [0, -0.04, 0]);
  // 2 — bague 1 × 1 1/4 × 1/2 po (même construction que P108, longueur 1/2).
  const ro = u(0.625), ri = u(0.5), h = u(0.25);
  const w = u(0.012) / ro, e = u(0.008);
  const b2 = S.slotted(ro, ri, -h, h, [
    { a: 0, w, y0: -h, y1: e }, { a: 0.16, w: 0.32 + w, y0: -e, y1: e }, { a: 0.32, w, y0: -e, y1: h },
  ], 'brass', { seg: 48 });
  const b2g = P('2', at(group(b2), [u(PX), u(GAP + T / 2), 0]), [0, 0.04, 0]);
  // Le profilé est l'assemblage lui-même (CM45362, sans ligne dans sa liste) :
  // posé dans la racine du modèle, hors repères, il reste fixe à l'éclaté.
  b2g.parent.add(tube);

  return { view: { dir: [1, 0.8, 1.1] } };
}
