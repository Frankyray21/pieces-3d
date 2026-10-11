// P034 — Logement du racleur et entonnoir dévieur CM45278 rév. 2 (page 34) :
// « WIPER DIVERTOR ASSEMBLY », repère 1 du centreur fixe P032, sous le
// caisson. Mécano-soudure (1, CM45278-1) : plaque supérieure en U (fond
// arrondi R 6.45 po, côtés droits vers l'avant) percée du passage de la tige
// et des quatre logements des vis FHC de P032 (repère 15), paroi en U de
// 1/4 po, fond percé Ø 7.9, entonnoir de tôle 3/16 po évasé jusqu'à Ø 13 po à
// bord roulé, sortie latérale Ø 4 1/2 po vers -X (évacuation des déblais,
// bourrelet de collier) ; deux chapes de goupille soudées à l'avant des
// côtés. L'avant du logement est ouvert pour changer les racleurs : porte
// (2, CM45278-2) à poignée, tenue par deux goupilles à billes Ø 1/2 × 4 po
// (4, CP19637) passées dans ses oreilles et les chapes ; deux butées
// rivetées (5, CM45276-4) au bord avant retiennent les disques. Dans le
// logement, sur le fond : disque dévieur (3, CM45265) sous la plaque
// racleuse et le joint racleur du jeu de mâchoires (P048) ; dans le passage
// de la plaque supérieure, le racleur supérieur en deux moitiés (6 et 7,
// « UPPER WIPER », suivant le diamètre de tige du jeu monté, voir le dessin
// d'ensemble).
// Repère : origine au centre du dessus de la plaque supérieure (contre le
// dessous du caisson du centreur), Y vers le haut le long de l'axe de forage,
// +Z vers la porte (avant de l'avance), sortie des déblais vers -X.
// Encombrement ≈ 0.44 (X, de la sortie à la goupille droite) × 0.26 (Y, de
// -0.258 à +0.003) × 0.37 (Z, du fond à la poignée) m.
// Cotes : coupe A-A et vue de dessus de la page 34 à l'échelle de la plaque
// (Ø 12.9 po, logement des racleurs Ø 12 1/4 de P048) : logement 2.9 po,
// entonnoir 7 po, sortie Ø 4 1/2 à 6.4 po sous le dessus, 8.6 po de l'axe ;
// côtés droits prolongés jusqu'à la porte (les disques entrent par l'avant).
import { L, u } from '../../du311/parts/_avance_b.js';
import { slabX, slabY, slabZ, sheet, arc } from './_feedcent.js';

const R = 6.45, RI = 6.2, FRONT = 6.25, TP = 0.375; // plaque et paroi (po)
const YB = -2.9, TB = 0.25; // fond du logement (dessus), épaisseur
const CONE = { r0: 3.95, r1: 6.5, h: 7.0, t: 0.1875 };
const OUT = { y: -6.4, ro: 2.25, ri: 2.013, x0: 4.4, x1: 8.6 };
const FH = [[4.6, 1.6], [-4.6, 1.6], [3.6, -3.8], [-3.6, -3.8]]; // vis FHC de P032
const LUG = { x: 7.05, z: 5.5, y0: -2.45, y1: -1.45, ro: 0.5, ri: 0.27 };

export default function P034(api) {
  const { THREE, S } = api;
  const { merged, group, at, weld, weldRing, torus } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const W = (pts, size = 0.18) => weld(pts.map(([x, y, z]) => v(x, y, z)), u(size), 'grey');
  // Contour en U [x, z] (po) : fond arrondi côté -Z, côtés droits jusqu'à z = front.
  const U = (r, front, n = 28) => [[r, front], ...arc(0, 0, r, 0, -Math.PI, n), [-r, front]];
  const sY = (pts, y0, y1, holes = [], mat = 'grey') => slabY(S, pts.map(([x, z]) => [u(x), u(z)]), u(y0), u(y1), mat, holes.map(([x, z, r]) => [u(x), u(z), u(r)]));

  // ================================================ 1 — logement et entonnoir
  const parts = [], beads = [];
  // Plaque supérieure : passage Ø 6 (racleur supérieur) ; logements Ø 1 des
  // têtes fraisées des vis de P032 (les têtes affleurent le dessous).
  parts.push(sY(U(R, FRONT).reverse(), -TP, 0, [[0, 0, 3.0], ...FH.map(([x, z]) => [x, z, 0.5])]));
  // Paroi en U (1/4 po), ouverte à l'avant ; fond (1/4 po) percé Ø 7.9.
  parts.push(sY([...U(R, FRONT), ...U(RI, FRONT).reverse()], YB - TB, -TP));
  parts.push(sY(U(R, FRONT).reverse(), YB - TB, YB, [[0, 0, CONE.r0]]));
  // Entonnoir : tôle 3/16 roulée, bord inférieur roulé.
  const yc0 = YB - TB, yc1 = yc0 - CONE.h;
  parts.push(L(S, [[CONE.r0, yc0], [CONE.r0 + CONE.t, yc0], [CONE.r1 + CONE.t, yc1], [CONE.r1, yc1], [CONE.r0, yc0]].reverse(), 'grey', 56));
  parts.push(at(torus(u(CONE.r1 + 0.1), u(0.16), 'grey'), v(0, yc1 + 0.08, 0)));
  // Sortie latérale : tube Ø 4 1/2 × 0,237 vers -X, bourrelet de collier au bout.
  parts.push(L(S, [[OUT.ri, OUT.x0], [OUT.ro, OUT.x0], [OUT.ro, OUT.x1 - 0.5], [OUT.ro + 0.12, OUT.x1 - 0.38], [OUT.ro + 0.12, OUT.x1 - 0.18], [OUT.ro, OUT.x1], [OUT.ri, OUT.x1], [OUT.ri, OUT.x0]], 'grey', 40, { axis: '-x', pos: v(0, OUT.y, 0) }));
  // Chapes des goupilles : douille Ø 1 sur gousset, à l'avant des deux côtés.
  for (const s of [1, -1]) {
    parts.push(L(S, [[LUG.ri, LUG.y0], [LUG.ro, LUG.y0], [LUG.ro, LUG.y1], [LUG.ri, LUG.y1], [LUG.ri, LUG.y0]], 'grey', 20, { pos: v(s * LUG.x, 0, LUG.z) }));
    const gus = [[s * R, LUG.y0], [s * (LUG.x - 0.35), LUG.y0], [s * (LUG.x - 0.35), LUG.y1], [s * R, LUG.y1]];
    parts.push(slabZ(S, (s > 0 ? gus : gus.slice().reverse()).map(([x, y]) => [u(x), u(y)]), u(LUG.z - 0.125), u(LUG.z + 0.125), 'grey'));
    beads.push(W([[s * (R + 0.06), LUG.y0 - 0.05, LUG.z + 0.2], [s * (R + 0.06), LUG.y1 + 0.05, LUG.z + 0.2]]));
  }
  // Cordons : plaque / paroi, fond / paroi, entonnoir / fond, sortie / entonnoir.
  const ring = (y, r) => [[r, y, FRONT - 0.1], ...arc(0, 0, r, 0, -Math.PI, 24).map(([x, z]) => [x, y, z]), [-r, y, FRONT - 0.1]];
  beads.push(W(ring(-TP - 0.06, R + 0.04)));
  beads.push(W(ring(YB - TB + 0.06, R + 0.04)));
  beads.push(at(weldRing(u(CONE.r0 + CONE.t + 0.06), u(0.2), 'grey'), v(0, yc0 - 0.06, 0)));
  const rc = CONE.r0 + (CONE.r1 - CONE.r0) * ((yc0 - OUT.y) / CONE.h) + 0.1;
  beads.push(at(weldRing(u(OUT.ro + 0.05), u(0.2), 'grey', { axis: 'x' }), v(-rc, OUT.y, 0)));
  const body = merged(parts, 'grey');
  body.userData.hasInterior = true;
  const bm = merged(beads, 'grey');
  bm.geometry.userData.edgeAngle = 75;
  P('1', group(body, bm), [0, 0, 0]);

  // ================================================ 2 — porte du logement
  // Tôle 1/4 po devant l'ouverture, poignée en rond Ø 1/2 cintré, deux oreilles
  // (au-dessus des chapes) percées pour les goupilles.
  const zd = FRONT + 0.03, ye = LUG.y1 + 0.02;
  const door = [
    slabZ(S, [[-6.7, YB - TB], [6.7, YB - TB], [6.7, -TP - 0.05], [-6.7, -TP - 0.05]].map(([x, y]) => [u(x), u(y)]), u(zd), u(zd + 0.25), 'grey'),
  ];
  for (const s of [1, -1]) {
    const ear = [[s * 6.5, zd + 0.25], [s * 6.5, LUG.z - 0.6], ...arc(s * LUG.x, LUG.z, 0.6, -Math.PI / 2, s > 0 ? Math.PI / 2 : -1.5 * Math.PI, 10), [s * LUG.x, zd + 0.25]];
    door.push(sY(s > 0 ? ear.reverse() : ear, ye, ye + 0.25, [[s * LUG.x, LUG.z, 0.27]]));
  }
  const yh = (YB - TB - TP) / 2;
  const handle = S.tube([v(-2.0, yh, zd + 0.25), v(-2.0, yh, zd + 1.3), v(-1.6, yh, zd + 1.7), v(1.6, yh, zd + 1.7), v(2.0, yh, zd + 1.3), v(2.0, yh, zd + 0.25)], u(0.25), 'grey', { seg: 40, tension: 0.2 });
  const doorBeads = [-2, 2].map((x) => at(weldRing(u(0.3), u(0.12), 'grey', { axis: 'z' }), v(x, yh, zd + 0.3)));
  P('2', group(merged([...door, handle], 'grey'), merged(doorBeads, 'grey')), [0, 0, 0.14]);

  // ================================================ 4 — goupilles à billes Ø 1/2 × 4 po
  // Corps zingué, poignée en T à bouton-poussoir, anneau de traction, deux
  // billes de verrouillage sous la chape.
  for (const s of [1, -1]) {
    const yTop = ye + 0.25;
    const g = group(
      merged([
        L(S, [[0, yTop - 4.0], [0.2, yTop - 4.0], [0.25, yTop - 3.92], [0.25, yTop], [0.0, yTop]], 'zinc', 18),
        L(S, [[0, yTop], [0.42, yTop], [0.45, yTop + 0.06], [0.45, yTop + 0.55], [0.38, yTop + 0.62], [0, yTop + 0.62]], 'zinc', 20),
        at(torus(u(0.55), u(0.07), 'zinc'), v(0.95, yTop + 0.32, 0), [Math.PI / 2, 0, 0]),
      ], 'zinc'),
      L(S, [[0, yTop + 0.62], [0.18, yTop + 0.62], [0.18, yTop + 0.78], [0.14, yTop + 0.82], [0, yTop + 0.82]], 'red', 16),
      merged([-1, 1].map((k) => S.ball(u(0.07), 'chrome', { pos: v(k * 0.24, LUG.y0 - 0.25, 0) })), 'chrome'),
    );
    P('4', at(g, v(s * LUG.x, 0, LUG.z), s < 0 ? [0, Math.PI, 0] : null), [0, 0.12, 0]);
  }

  // ================================================ 5 — butées des disques
  // Plats rivetés au bord avant de la paroi (deux rivets à tête ronde).
  for (const s of [1, -1]) {
    const stop = sY([[s * 3.6, FRONT - 0.45], [s * RI, FRONT - 0.45], [s * RI, FRONT - 0.05], [s * 3.6, FRONT - 0.05]], YB, YB + 0.75);
    const rivets = [5.0, 5.8].map((x) => L(S, [[0, 0], [0.16, 0], [0.16, 0.03], [0.1, 0.09], [0, 0.1]], 'zinc', 12, { axis: 'z', pos: v(s * x, YB + 0.4, FRONT - 0.05) }));
    P('5', group(stop, merged(rivets, 'zinc')), [s * 0.03, 0, 0.12]);
  }

  // ================================================ 3 — disque dévieur (sur le fond)
  // Caoutchouc Ø 12 1/4 × 1/4 po, passage Ø 4 1/2.
  const dm = sheet(S, THREE, arc(0, 0, u(6.1), 0, Math.PI * 2, 64).slice(0, -1), u(0.25), 'rubber', [[0, 0, u(2.25)]]);
  dm.rotation.x = -Math.PI / 2;
  dm.position.y = u(YB + 0.125);
  P('3', dm, [0, -0.06, 0.3]);

  // ================================================ 6 / 7 — racleur supérieur (deux moitiés)
  // Polyuréthane dans le passage Ø 6 de la plaque : collerette dans le
  // passage du caisson, lèvre Ø 3.4 sur la tige ; fendu selon le plan x = 0.
  const prof = [[1.7, -0.3], [2.3, -TP], [3.0, -TP], [3.0, 0], [3.4, 0], [3.4, 0.12], [2.2, 0.12], [1.7, -0.05], [1.7, -0.3]];
  const halfWiper = (s) => {
    const pts = prof.map(([r, y]) => new THREE.Vector2(u(r), u(y)));
    const geo = new THREE.LatheGeometry(pts, 24, s > 0 ? 0 : Math.PI, Math.PI);
    const caps = [1, -1].map((k) => slabX(S, prof.slice(0, -1).map(([r, y]) => [k * u(r), u(y)]), s > 0 ? 0 : -0.0006, s > 0 ? 0.0006 : 0, 'rubber'));
    return merged([new THREE.Mesh(geo), ...caps], 'rubber');
  };
  P('6', halfWiper(-1), [-0.08, 0.1, 0]);
  P('7', halfWiper(1), [0.08, 0.1, 0]);

  return { view: { dir: [-1, 0.5, 1.2] } };
}
