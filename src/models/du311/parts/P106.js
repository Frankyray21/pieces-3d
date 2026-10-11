// P106 — Tube de centreur CM45362 rév. 2 (page 106) : « CENTRALIZER TUBES ».
// Fourreau mécano-soudé qui coulisse dans le châssis du centreur fendu (P102)
// et porte une mâchoire (P146 repère 2) : deux tôles de 0.52 po (dessus et
// dessous) écartées de 3.1 po, réunies par deux flancs aux angles pliés ;
// côté tige, les deux tôles sont échancrées en demi-cercle R 3.45 po centré
// sur l'axe de forage ; côté extérieur, encoche de 5.05 × 2.85 po (passage de
// la tige du vérin du centreur, attelée dans la poche de la mâchoire). Trou
// de l'axe de mâchoire dans chaque tôle, garni d'une bague roulée Ø 1 × 1 1/4
// po : P108 (1, 0.370 po) dans la tôle basse, CP10017 (2, 1/2 po) dans la
// tôle haute (coupe A-A).
// Repère (commun avec P104 et P146) : origine sur l'axe de forage, mâchoires
// fermées, au niveau du dessus de la tôle basse (dessous de la mâchoire) ;
// +X de l'axe de forage vers l'extérieur (sens d'ouverture, le long du
// fourreau), Y vers le haut, Z en travers. Encombrement 0.224 (X, de 0.005 à
// 0.229) × 0.105 (Y, de -0.013 à 0.092) × 0.263 (Z) m.
// Cotes : vue de face et coupe A-A de la page 106, à l'échelle de l'alésage
// des bagues (Ø 1 po = 100 px) : largeur 10.35, longueur 8.8, tôles 0.52,
// jour 3.1, échancrure R 3.45 (centre à 0.2 po du bout), axe à 4.32 po du
// bout côté tige.
import { u } from './_avance_b.js';

const T = 0.52, GAP = 3.1, W = 10.35, X0 = 0.2, X1 = 9.0, R = 3.45, PX = 4.52;
const NW = 5.05 / 2, NX = X1 - 2.85;

export const TUBE106 = {
  x0: u(X0), x1: u(X1), width: u(W), t: u(T), gap: u(GAP), pinX: u(PX),
  notch: { w: u(2 * NW), x: u(NX) }, arcR: u(R),
};

export default function P106(api) {
  const { S } = api;
  const { extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const Z = W / 2, RB = T; // rayon extérieur des plis
  const zi = Z - RB; // les tôles s'arrêtent aux plis
  const arc = (n = 24) => {
    const a0 = Math.acos(X0 / R);
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 - (2 * a0 * i) / n; // de +Z vers -Z, côté +X
      return [R * Math.cos(a), R * Math.sin(a)];
    });
  };
  // Tôle horizontale (contour (x, z) en po), de y0 à y0 + T ; trou de bague.
  const sheet = (y0) => {
    const pts = [[X0, -zi], [X1, -zi], [X1, -NW], [NX, -NW], [NX, NW], [X1, NW], [X1, zi], [X0, zi], ...arc().slice(1, -1)];
    const m = extrude(pts.map(([x, z]) => [u(x), -u(z)]), u(T), 'grey', { holes: [[u(PX), 0, u(0.627)]] });
    m.rotation.x = -Math.PI / 2;
    m.position.y = u(y0 + T / 2);
    return m;
  };
  // Flancs (plan XY) entre les plis, sur toute la longueur.
  const flank = (s) => {
    const m = extrude([[X0, 0], [X1, 0], [X1, GAP], [X0, GAP]].map(([x, y]) => [u(x), u(y)]), u(T), 'grey');
    m.position.z = s * u(Z - T / 2);
    return m;
  };
  // Plis : quart de rond de rayon RB (dans le plan ZY) extrudé selon X.
  const bend = (yc, sy, sz) => {
    const pts = [[0, 0]];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI / 2;
      pts.push([RB * Math.sin(a), sy * RB * Math.cos(a)]);
    }
    // Plan local (a, y) avec a = -z après rotation de +π/2 autour de Y.
    const m = extrude(pts.map(([a, y]) => [-sz * u(a), u(y)]), u(X1 - X0), 'grey');
    m.rotation.y = Math.PI / 2;
    m.position.set(u((X0 + X1) / 2), u(yc), sz * u(zi));
    return m;
  };
  const tube = merged([
    sheet(-T), sheet(GAP),
    flank(1), flank(-1),
    bend(0, -1, 1), bend(0, -1, -1), bend(GAP, 1, 1), bend(GAP, 1, -1),
  ], 'grey');

  // 1 — bague P108 (0.370 po) affleurant le dessus de la tôle basse.
  P('1', at(api.sub('P108'), [u(PX), -u(0.37) / 2, 0]), [0, -0.05, 0]);
  // 2 — bague 1 × 1 1/4 × 1/2 po (roulée, joint agrafé), affleurant le dessous
  // de la tôle haute.
  const ro = u(0.625), ri = u(0.5), h = u(0.25);
  const w = u(0.012) / ro, e = u(0.008);
  const b2 = S.slotted(ro, ri, -h, h, [
    { a: 0, w, y0: -h, y1: e }, { a: 0.16, w: 0.32 + w, y0: -e, y1: e }, { a: 0.32, w, y0: -e, y1: h },
  ], 'brass', { seg: 48 });
  const b2g = P('2', at(group(b2), [u(PX), u(GAP + 0.25), 0]), [0, 0.05, 0]);
  // Le fourreau est l'assemblage lui-même (CM45362, sans ligne dans sa
  // liste) : posé dans la racine du modèle, hors repères, il reste fixe à
  // l'éclaté.
  b2g.parent.add(tube);

  return { view: { dir: [1, 0.8, 1.1] } };
}
