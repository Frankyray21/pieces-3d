// P094 — Bloc d'équilibrage / diviseur de débit CX036768 rév. 3 (page 94) :
// « COUNTERBALANCE/FLOW DIVIDER VALVE », repère 1 du collecteur des
// centreurs P092. Bloc d'aluminium usiné (4, CX036769) 6 × 3 1/2 × 2 3/4 po :
// face des orifices (six SAE-6 lamés : R1, PB, R2 sur une rangée, E1, PA, E2
// sur l'autre, et deux prises de pression SAE-4 entre les colonnes), deux
// coins abattus en gradin pour les vis de fixation (P092 repère 3) ; quatre
// clapets d'équilibrage 3000 psi à cartouche (2, CP007566), deux par grande
// face latérale, vis de réglage et contre-écrou ; cartouche du diviseur de
// débit (1, CP006723) vissée dans une extrémité ; cinq bouchons SAE-4 à
// joint torique (5, FA01280-04) : deux sur la face des orifices, deux sur
// l'extrémité de la cartouche, un sur une face latérale ; six bouchons de
// transport en plastique dans les orifices SAE-6 (3, CP007762), retirés au
// montage (P092 les remplace par ses coudes : option { fitted: true }).
// Repère : origine au centre de la face d'appui (contre le mât), +Z de la
// face d'appui vers la face des orifices, X le long du bloc (cartouche du
// diviseur côté +X), Y vers le haut (faces des clapets). Encombrement ≈
// 0.18 (X) × 0.17 (Y, clapets compris) × 0.085 (Z) m.
// Cotes : schéma et vues de la page 94 (orifices SAE 6, clapets 3000 psi) ;
// bloc d'après les proportions des orifices (lamage Ø 1 po des SAE-6).
import { L, u, orbPlug, hexPrism } from '../../du311/parts/_avance_b.js';
import { slabZ, sheet } from './_feedcent.js';

export const BLOCK094 = {
  L: 6.0, W: 3.5, H: 2.75, step: 0.75, // po
  ports: { R1: [-1.8, 0.8], PB: [0, 0.8], R2: [1.8, 0.8], E1: [-1.8, -0.8], PA: [0, -0.8], E2: [1.8, -0.8] },
  bolts: [[-2.45, -1.2], [2.45, 1.2]], // vis de fixation (x, y), dans les gradins
};

export default function P094(api, opts = {}) {
  const { THREE, S } = api;
  const { merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const { L: BL, W: BW, H: BH, step } = BLOCK094;
  const hx = BL / 2, hy = BW / 2, zs = BH - step;
  const ports = Object.values(BLOCK094.ports);

  // ================================================ 4 — bloc
  // Couche basse pleine (trous des vis), couche haute avec les deux gradins
  // d'angle et les orifices (le fond des orifices est le dessus de la couche basse).
  const c = 0.06;
  const outline = [[-hx + c, -hy], [hx - c, -hy], [hx, -hy + c], [hx, hy - c], [hx - c, hy], [-hx + c, hy], [-hx, hy - c], [-hx, -hy + c]];
  const n = 1.1; // gradins (po)
  const upper = [[-hx + n, -hy], [hx - c, -hy], [hx, -hy + c], [hx, hy - n], [hx - n, hy - n], [hx - n, hy], [-hx + c, hy], [-hx, hy - c], [-hx, -hy + n], [-hx + n, -hy + n]];
  const U = (pts) => pts.map(([x, y]) => [u(x), u(y)]);
  const low = sheet(S, THREE, U(outline), u(zs), 'castAlu', BLOCK094.bolts.map(([x, y]) => [u(x), u(y), u(0.2)]));
  low.position.z = u(zs / 2);
  const portHoles = [...ports.map(([x, y]) => [u(x), u(y), u(0.3)]), ...[[-0.9, 0], [0.9, 0]].map(([x, y]) => [u(x), u(y), u(0.22)])];
  const high = sheet(S, THREE, U(upper), u(step), 'castAlu', portHoles);
  high.position.z = u(zs + step / 2);
  const block = merged([low, high], 'castAlu');
  block.userData.hasInterior = true;
  P('4', block, [0, 0, 0]);

  // ================================================ 2 — clapets d'équilibrage (cartouches)
  // Six pans 1 1/8, corps Ø 1, vis de réglage à six pans creux et contre-écrou.
  const cbv = () => group(
    merged([
      hexPrism(S, THREE, 1.125, 0.45, 0, 0, 'steel'),
      L(S, [[0, 0.45], [0.5, 0.45], [0.5, 1.25], [0.45, 1.3], [0, 1.3]], 'steel', 24),
      hexPrism(S, THREE, 0.5625, 0.25, 1.3, 0.16, 'steel'),
      L(S, [[0, 1.3], [0.15, 1.3], [0.15, 1.85], [0.12, 1.88], [0.06, 1.88], [0.06, 1.8], [0, 1.8]], 'zinc', 12),
    ], 'steel'),
  );
  const zc = zs / 2;
  for (const s of [1, -1]) {
    for (const x of [-1.4, 1.4]) {
      const g = at(cbv(), v(x, s * hy, zc), [0, 0, s > 0 ? 0 : Math.PI]);
      P('2', g, [0, s * 0.06, 0]);
    }
  }

  // ================================================ 1 — cartouche du diviseur de débit
  P('1', at(group(merged([
    hexPrism(S, THREE, 1.25, 0.4, 0, 0, 'steel'),
    L(S, [[0, 0.4], [0.42, 0.4], [0.42, 0.62], [0.36, 0.68], [0, 0.68]], 'steel', 24),
  ], 'steel')), v(hx, 0, zc + 0.15), [0, 0, -Math.PI / 2]), [0.08, 0, 0]);

  // ================================================ 5 — bouchons SAE-4
  const plugs = [
    [v(-0.9, 0, BH), [Math.PI / 2, 0, 0]], [v(0.9, 0, BH), [Math.PI / 2, 0, 0]],
    [v(hx, 1.05, zc + 0.15), [0, 0, -Math.PI / 2]], [v(hx, -1.05, zc + 0.15), [0, 0, -Math.PI / 2]],
    [v(-0.2, -hy, zc), [0, 0, Math.PI]],
  ];
  plugs.forEach(([p, r]) => P('5', at(group(orbPlug(S, THREE, 4)), p, r), [0, 0, 0.05]));

  // ================================================ 3 — bouchons de transport (SAE-6)
  if (!opts.fitted) {
    for (const [x, y] of ports) {
      const plug = merged([
        L(S, [[0, BH - 0.45], [0.27, BH - 0.45], [0.29, BH - 0.1], [0.29, BH], [0.46, BH], [0.46, BH + 0.1], [0.42, BH + 0.14], [0, BH + 0.14]], 'plastic', 20, { axis: 'z', pos: v(x, y, 0) }),
        slabZ(S, U([[x - 0.06, y - 0.3], [x + 0.06, y - 0.3], [x + 0.06, y + 0.3], [x - 0.06, y + 0.3]]), u(BH + 0.14), u(BH + 0.34), 'plastic'),
      ], 'plastic');
      P('3', plug, [0, 0, 0.08]);
    }
  }
  return { view: { dir: [0.8, 0.9, 1.2] } };
}
