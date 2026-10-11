// P226 — Joint de jauge CX007427 rév. 0 (page 226) : « GASKET ASSY », repère 9
// du réservoir de carburant P224. Joint épais moulé en caoutchouc nitrile (1),
// Ø 90 × 3/8 po, alésage central Ø 35 mm : six trous de passage Ø 7 mm sur Ø 74
// mm (vis CHC 1/4-20 de P224 dans les taraudages du réservoir) et cinq
// inserts taraudés #10-24 (2) noyés au moulage sur le cercle SAE Ø 54 mm, qui
// reçoivent les cinq vis cruciformes de la jauge VDO (P224 rep. 4).
// Repère : origine au centre de la face inférieure (appui sur le dessus du
// réservoir), Y selon l'axe ; trous et inserts répartis comme la vue de face
// (trou à 90°, inserts tous les 72° à partir de 90°).
// Encombrement Ø 0.090 × 0.0095 m.
import { u } from './_cab.js';

export const GASKET = { R: 0.045, ri: 0.0175, t: u(0.375), rb: 0.037, ri5: 0.027 };

export default function P226(api) {
  const { THREE, S } = api;
  const { lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { R, ri, t, rb, ri5 } = GASKET;

  // ---------------------------------------------------------------- 1 — joint moulé
  // Disque extrudé (trous réels), arêtes adoucies par un léger chanfrein.
  const sh = new THREE.Shape().absarc(0, 0, R, 0, Math.PI * 2, false);
  sh.holes.push(new THREE.Path().absarc(0, 0, ri, 0, Math.PI * 2, true));
  const outer = [];
  for (let k = 0; k < 6; k++) outer.push((Math.PI / 6) + (k * Math.PI) / 3);
  for (const a of outer) sh.holes.push(new THREE.Path().absarc(Math.cos(a) * rb, Math.sin(a) * rb, 0.0035, 0, Math.PI * 2, true));
  const inner = [];
  for (let k = 0; k < 5; k++) inner.push(Math.PI / 2 + (k * 2 * Math.PI) / 5);
  for (const a of inner) sh.holes.push(new THREE.Path().absarc(Math.cos(a) * ri5, Math.sin(a) * ri5, 0.0028, 0, Math.PI * 2, true));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: t - 0.001, bevelEnabled: true, bevelSize: 0.0005, bevelThickness: 0.0005, bevelOffset: -0.0005, bevelSegments: 1, curveSegments: 24 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0.0005, 0);
  P('1', merged([new THREE.Mesh(geo)], 'rubber'), [0, 0.03, 0]);

  // ---------------------------------------------------------------- 2 — inserts #10-24 (×5)
  // Douille laiton moletée Ø 0,30 × 0,30 po, collerette affleurante, taraudage sombre.
  for (const a of inner) {
    const x = Math.cos(a) * ri5, z = -Math.sin(a) * ri5;
    const ins = group(
      merged([
        lathe([[u(0.1), 0], [u(0.15), 0], [u(0.15), u(0.22)], [u(0.17), u(0.25)], [u(0.17), u(0.3)], [u(0.1), u(0.3)], [u(0.1), 0]], 'brass', { seg: 12 }),
      ], 'brass'),
      lathe([[u(0.1), u(0.3) - 0.0002], [0, u(0.3) - 0.0002]], 'blackOxide', { seg: 10 }),
    );
    P('2', at(ins, [x, t - u(0.3), z]), [0, 0.05, 0]);
  }
  return { view: { dir: [0.7, 1.1, 0.9] } };
}
