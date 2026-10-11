// P286 — Pose de l'auvent FOPS CX024925 rév. 2 (page 286) : « FOPS CANOPY
// INSTALLATION », repère 41 de la cabine P278. Caisson de la cabine (2,
// CX011749 « CAB, WELDMENT ») en tôle de 1/4 po : plancher, paroi arrière
// haute (ouverture de visite fermée par P278 rep. 27, lèvre pliée en tête,
// oreilles de levage), paroi d'extrémité +Z à rive inclinée, montant d'accès
// −Z à poignée découpée, palier d'accès surélevé côté −Z (contremarche),
// pupitre avant en chevron face à l'articulation (face avant ouverte pour le
// panneau 21, dessus fermé par le couvercle 22, dessous par la plaque 25),
// cloison du pupitre, chapes de l'axe de basculement et du vérin de
// basculement sous le plancher, cordons de soudure. L'auvent ROPS/FOPS (1,
// P288) est posé dans l'extrémité +Z : semelle vissée au plancher par trois
// vis H 1-8 × 2 (3), cales latérales serrées contre la paroi arrière et la
// cloison du pupitre par huit vis H 1-8 × 3 1/2 (4) ; onze rondelles Grower
// 1 po (5).
// Repère : axes du repère machine, origine au centre du dessous du caisson
// principal (CAB.o = (−0.75, 1.04, 0.115) dans la machine, voir _cab.js) :
// paroi arrière à x = −0.35, pupitre jusqu'à x = +0.60, extrémités à z = ±0.835.
// Encombrement 0.95 (X) × 1.21 (Y, auvent compris) × 1.67 (Z) m.
import { CAB, CANOPY, cabHw, prism, rrect } from './_cab.js';

export default function P286(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, weld } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { hx, hz, nose, noseZ, H, hc, t, land } = CAB;
  const O = CAB.open;
  const M = 'lightGrey';

  // ---------------------------------------------------------------- 1 — auvent ROPS/FOPS (P288)
  const can = api.sub('P288');
  can.position.set(...CANOPY.at);
  P('1', can, [0, 0.6, 0]);

  // ---------------------------------------------------------------- 2 — caisson soudé
  const plates = [];
  // Point de la facette −Z du pupitre à la cote z.
  const facetX = (z) => nose + ((z - noseZ[0]) / (-hz - noseZ[0])) * (hx - nose);
  const xl = facetX(land.z1);
  // Plancher (ouvertures : trappe 28, dessous du pupitre 25).
  plates.push(prism(S, THREE, [[-hx, land.z1], [-hx, hz], [hx, hz], [nose, noseZ[1]], [nose, noseZ[0]], [xl, land.z1]], t, M, 'xz', t / 2, {
    polys: [rrect(O.floor.x, O.floor.z, O.floor.w - 0.06, O.floor.d - 0.06, 0.02), rrect(O.under.x, O.under.z, O.under.w - 0.04, O.under.d - 0.04, 0.01)],
  }));
  // Palier d'accès surélevé et contremarche.
  plates.push(prism(S, THREE, [[-hx, -hz], [-hx, land.z1], [xl, land.z1], [hx, -hz]], t, M, 'xz', land.y - t / 2));
  plates.push(prism(S, THREE, [[-hx, 0], [xl, 0], [xl, land.y], [-hx, land.y]], t, M, 'xy', land.z1 + t / 2));
  // Paroi arrière (plan z-y), ouverture de visite, lèvre pliée en tête.
  plates.push(prism(S, THREE, [[-hz, land.y - t], [land.z1, land.y - t], [land.z1, 0], [hz, 0], [hz, H], [-hz, H]], t, M, 'zy', -hx + t / 2, {
    polys: [rrect(O.rear.z, O.rear.y, O.rear.w, O.rear.h, 0.025)],
  }));
  plates.push(box(0.045, t, 2 * hz - 0.01, M, { pos: [-hx + 0.0225, H - t / 2, 0] }));
  // Paroi d'extrémité +Z (plan x-y) à rive inclinée vers le pupitre.
  plates.push(prism(S, THREE, [[-hx, 0], [hx, 0], [hx, hc], [hx - 0.2, H], [-hx, H]], t, M, 'xy', hz - t / 2));
  // Montant d'accès −Z à poignée découpée (fente oblongue).
  plates.push(prism(S, THREE, [[-hx, land.y - t], [-hx + 0.16, land.y - t], [-hx + 0.16, H - 0.06], [-hx + 0.11, H], [-hx, H]], t, M, 'xy', -hz + t / 2, {
    polys: [rrect(-hx + 0.085, land.y + 0.36, 0.035, 0.3, 0.0175, 4)],
  }));
  // Pupitre : face avant (plan z-y, ouverture du panneau 21), facettes, cloison intérieure.
  plates.push(prism(S, THREE, [[noseZ[0], 0], [noseZ[1], 0], [noseZ[1], hc], [noseZ[0], hc]], t, M, 'zy', nose - t / 2, {
    polys: [rrect(O.front.z, O.front.y, O.front.w, O.front.h, 0.02)],
  }));
  const facet = (xa, za, xb, zb, y0) => {
    const L = Math.hypot(xb - xa, zb - za);
    const m = box(L, hc - y0, t, M);
    m.rotation.y = Math.atan2(-(zb - za), xb - xa);
    const nx = (zb - za) / L, nz = -(xb - xa) / L; // normale (vers l'intérieur du pupitre pour le sens choisi)
    m.position.set((xa + xb) / 2 + nx * t / 2, y0 + (hc - y0) / 2, (za + zb) / 2 + nz * t / 2);
    return m;
  };
  plates.push(facet(hx, hz, nose, noseZ[1], 0));
  plates.push(facet(nose, noseZ[0], hx, -hz, 0));
  plates.push(prism(S, THREE, [[-hz, land.y], [land.z1, land.y], [land.z1, 0], [hz, 0], [hz, hc - 0.03], [-hz, hc - 0.03]], t, M, 'zy', hx + t / 2));
  // Cornières d'appui du couvercle 22 (dessus du pupitre) le long de la face avant et de la cloison.
  plates.push(box(0.03, t, noseZ[1] - noseZ[0], M, { pos: [nose - t - 0.015, hc - 0.012, (noseZ[0] + noseZ[1]) / 2] }));
  plates.push(box(0.03, t, 2 * hz - 0.05, M, { pos: [hx + t + 0.015, hc - 0.042, 0] }));
  // Oreilles de levage (tôle de 1/2 po percée) : têtes de la paroi arrière, angle +Z, coin du pupitre.
  const lug = (x, y, z, ry) => {
    const g = group(prism(S, THREE, [[-0.035, 0], [0.035, 0], [0.035, 0.03], [0, 0.065], [-0.035, 0.03]], 0.0127, M, 'xy', 0, { holes: [[0, 0.036, 0.013]] }));
    g.rotation.y = ry;
    g.position.set(x, y, z);
    return g;
  };
  plates.push(lug(-hx + 0.03, H, -hz + 0.09, Math.PI / 2), lug(-hx + 0.03, H, hz - 0.09, Math.PI / 2));
  plates.push(lug(hx - 0.12, hc + 0.1, hz - t - 0.0064, 0), lug(nose - 0.06, hc, noseZ[0] - 0.02, Math.atan2(-0.82, -0.25)));
  // Chapes de l'axe de basculement (deux pattes sous le plancher) et chape du vérin.
  const hg = CAB.hinge;
  for (const x of [-0.22, 0.22]) {
    plates.push(prism(S, THREE, [[hg.z - 0.05, 0], [hg.z + 0.05, 0], [hg.z + 0.05, hg.y], [hg.z + 0.035, hg.y - 0.034], [hg.z - 0.035, hg.y - 0.034], [hg.z - 0.05, hg.y]], 0.019, M, 'zy', x, { holes: [[hg.z, hg.y, 0.02]] }));
  }
  const cy = CAB.cyl;
  for (const dx of [-0.026, 0.026]) {
    plates.push(prism(S, THREE, [[cy.z1 - 0.045, 0], [cy.z1 + 0.045, 0], [cy.z1 + 0.035, cy.y - 0.03], [cy.z1 - 0.035, cy.y - 0.03]], 0.0127, M, 'zy', cy.x + dx, { holes: [[cy.z1, cy.y, 0.0135]] }));
  }
  // Cordons : arêtes verticales des parois, pied des parois sur le plancher.
  const beads = [
    weld([[-hx + t + 0.002, t, hz - t - 0.002], [-hx + t + 0.002, H - 0.01, hz - t - 0.002]], 0.007, M),
    weld([[hx - 0.002, t, hz - t - 0.002], [hx - 0.002, hc - 0.02, hz - t - 0.002]], 0.007, M),
    weld([[-hx + t + 0.002, t + 0.002, land.z1], [-hx + t + 0.002, t + 0.002, hz - t]], 0.007, M),
    weld([[-hx + t, land.y + 0.002, -hz + t], [-hx + t, land.y + 0.002, land.z1]], 0.007, M),
    weld([[nose - t - 0.002, t + 0.002, noseZ[0] + 0.01], [nose - t - 0.002, t + 0.002, noseZ[1] - 0.01]], 0.007, M),
  ];
  // Taraudages des vis de P278 (amorces sombres) : panneau arrière, panneau avant.
  const taps = [];
  const rearPts = [];
  for (const k of [-2, -1, 0, 1, 2]) for (const s of [-1, 1]) rearPts.push([O.rear.z + k * 0.2, O.rear.y + s * (O.rear.h / 2 + 0.035)]);
  for (const [z, y] of rearPts) taps.push(at(lathe([[0.0035, 0.0003], [0, 0.0003]], 'blackOxide', { seg: 8 }), [-hx - 0.0001, y, z], [0, 0, Math.PI / 2]));
  P('2', group(merged(plates, M), merged(beads, M), merged(taps, 'blackOxide')), [0, -0.3, 0]);

  // ---------------------------------------------------------------- 3, 4, 5 — vis 1 po de l'embase et rondelles Grower
  const [ax, ay, az] = CANOPY.at;
  const wt = H_.wT(1.0, 'split');
  for (const dx of [-0.07, 0, 0.07]) {
    const p = [ax + dx, ay + 0.0127, az];
    P('5', H_.washer(1.0, p, [0, 1, 0], 'split'), [0, 0.15, 0]);
    P('3', H_.bolt(1.0, 2.0, [p[0], p[1] + wt, p[2]], [0, 1, 0], { light: true }), [0, 0.22, 0]);
  }
  for (const s of [-1, 1]) for (const y of [0.17, 0.53]) for (const dz of [-0.035, 0.035]) {
    // Paroi arrière (−X, tête dehors) ; cloison du pupitre (+X, tête dans le pupitre).
    const xw = s < 0 ? -hx : hx + t;
    const p = [xw, ay + y, az + dz];
    P('5', H_.washer(1.0, p, [s, 0, 0], 'split'), [s * 0.12, 0, 0]);
    P('4', H_.bolt(1.0, 3.5, [xw + s * wt, ay + y, az + dz], [s, 0, 0], { light: true }), [s * 0.2, 0, 0]);
  }
  return { view: { dir: [1.1, 0.8, -1.1] } };
}
