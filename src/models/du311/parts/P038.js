// P038 — Vérin du déflecteur de roches CX003590 rév. 1 (page 38) :
// « CYLINDER - Ø2.00 X 6.00 ST », alésage 2 po, course 6 po. Vérin compact
// non démontable (2, « CYLINDER - MACHINED ») : tube Ø 2 1/2 po, fond soudé
// portant un œil transversal (bossage Ø 2 1/2 × 2 1/4 po, alésage Ø 1 po pour
// l'axe P036 repère 6/7), deux bossages d'orifice SAE -04 sur le dessus,
// collerette de tête Ø 3 po, tige chromée Ø 1 1/8 po avec méplats de clé et
// queue filetée 7/8-14 ; tête de tige (1) six-pans 2 1/4 po vissée sur la
// queue, percée de part en part (Ø 1 po) entre deux méplats, petit trou de
// purge au bout, bloquée par une vis sans tête 3/8-16 × 3/4 po (3) dans le
// collet.
// Repère : origine sur l'axe de l'œil de fond, Y le long du vérin vers la
// tige ; Z selon les axes des deux œils (parallèles) ; X en travers, orifices
// vers +X. Vérin rentré : entraxe 14.5 po (0.368 m), sorti 20.5 po (0.521 m).
// Encombrement ≈ 0.076 (X) × 0.400 (Y, de -0.032 à 0.398) × 0.064 (Z) m.
// Cotes : liste (alésage, course, vis 3/8-16 × 3/4) ; tube, œils et tige
// d'après les proportions de l'isométrie (tube ≈ 4,6 diamètres de long).
import { L, u, setScrew } from './_avance_b.js';

export const CYL038 = { retracted: u(14.5), stroke: u(6), eyeW: u(2.25), rodEyeW: u(1.75), portX: u(1.6) };

export default function P038(api) {
  const { THREE, S } = api;
  const { weldRing, slotted, roundHole, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const TUBE = 1.25, BORE = 1.0, ROD = 0.5625;
  const Y = { capBot: 0.95, tubeBot: 1.45, tubeTop: 11.0, collarTop: 11.45, rodFlat: 12.05, flatTop: 12.45, stubTop: 13.55, eye: 14.5 };
  const PORTS = [2.4, 9.3];

  // ------------------------------------------------ 2 — vérin usiné (une pièce)
  // Œil de fond : bossage cylindrique selon Z, alésage Ø 1 po chanfreiné.
  const eyeR = 1.25, eyeW = 2.25;
  const eye = L(S, [[0.5, -eyeW / 2], [eyeR - 0.06, -eyeW / 2], [eyeR, -eyeW / 2 + 0.06], [eyeR, eyeW / 2 - 0.06], [eyeR - 0.06, eyeW / 2], [0.5, eyeW / 2], [0.56, eyeW / 2 - 0.06], [0.5, eyeW / 2 - 0.08], [0.5, -eyeW / 2 + 0.08], [0.56, -eyeW / 2 + 0.06], [0.5, -eyeW / 2]], 'grey', 40, { axis: 'z' });
  // Fond tourné : col entre l'œil et le tube.
  const cap = L(S, [[0, 0.6], [1.0, 0.6], [1.18, Y.capBot], [TUBE, Y.capBot + 0.05], [TUBE, Y.tubeBot], [0, Y.tubeBot]], 'grey', 48);
  const holes = PORTS.flatMap((y) => roundHole(Math.PI / 2, u(y), u(0.16), u(TUBE), { steps: 6 }));
  const tube = slotted(u(TUBE), u(BORE), u(Y.tubeBot), u(Y.tubeTop), holes, 'grey', { seg: 48 });
  // Tête : collerette Ø 3 po, arêtes cassées, alésage de tige.
  const head = L(S, [[ROD + 0.02, Y.tubeTop], [1.5, Y.tubeTop], [1.5, Y.collarTop - 0.06], [1.44, Y.collarTop], [0.78, Y.collarTop], [0.74, Y.collarTop - 0.05], [ROD + 0.02, Y.collarTop - 0.05], [ROD + 0.02, Y.tubeTop]], 'grey', 56);
  // Bossages d'orifice SAE -04 (Ø 7/8 po) sur le dessus (+X), lamage du joint.
  const boss = (y) => L(S, [[0.22, 1.0], [0.44, 1.0], [0.44, 1.56], [0.4, 1.6], [0.3, 1.6], [0.26, 1.56], [0.22, 1.5], [0.22, 1.0]], 'grey', 28, { axis: 'x', pos: [0, u(y), 0] });
  const welds = [
    weldRing(u(TUBE + 0.02), u(0.16), 'grey', { pos: [0, u(Y.tubeBot), 0] }),
    weldRing(u(TUBE + 0.02), u(0.14), 'grey', { pos: [0, u(Y.tubeTop + 0.02), 0] }),
    ...PORTS.map((y) => weldRing(u(0.46), u(0.1), 'grey', { axis: 'x', pos: [u(1.1), u(y), 0] })),
  ];
  const body = merged([eye, cap, tube, head, ...PORTS.map(boss)], 'grey');
  body.userData.hasInterior = true;
  // Tige chromée Ø 1 1/8 sortant de la tête, méplats de clé, queue 7/8-14.
  const rod = L(S, [[0, Y.collarTop - 0.4], [ROD, Y.collarTop - 0.4], [ROD, Y.rodFlat], [0, Y.rodFlat]], 'chrome', 32);
  const flats = L(S, [[0, Y.rodFlat], [0.6, Y.rodFlat], [0.6, Y.flatTop - 0.04], [0.56, Y.flatTop], [0, Y.flatTop]], 'chrome', 6);
  const stub = L(S, [[0, Y.flatTop], [0.4375, Y.flatTop], ...S.thread(0.4375, Y.flatTop + 0.1, Y.stubTop - 0.06, { pitch: 1 / 14, maxTurns: 12, chamferBottom: false }), [0.38, Y.stubTop], [0, Y.stubTop]].map(([r, y], i) => (i === 0 ? [0, y] : [r, y])), 'chrome', 20);
  // Racleur (lèvre noire) à la sortie de la tête.
  const wiper = L(S, [[ROD + 0.005, Y.collarTop - 0.05], [0.74, Y.collarTop - 0.05], [0.74, Y.collarTop + 0.02], [ROD + 0.005, Y.collarTop + 0.06], [ROD + 0.005, Y.collarTop - 0.05]], 'rubber', 32);
  P('2', group(body, merged(welds, 'grey'), merged([rod, flats, stub], 'chrome'), wiper), [0, 0, 0]);

  // ------------------------------------------------ 1 — tête de tige six-pans
  // Six-pans 2 1/4 po sur 2 po, sommets selon ±X (méplats percés selon Z),
  // collet Ø 1 1/2 côté tige (taraudage 7/8-14 et trou de la vis 3), trou de
  // purge Ø 1/4 au bout.
  // Six-pans en trois prismes : âme centrale entre les deux méplats percés
  // (extrudée selon Z, alésage Ø 1 po), et deux coins triangulaires (±X)
  // extrudés selon Y ; arêtes cassées par extrude().
  const HX = 2.25, hR = HX / 2 / Math.cos(Math.PI / 6), y0 = 13.5, y1 = 15.5;
  const a2 = hR / 2;
  const core = S.extrude([[-a2, y0], [a2, y0], [a2, y1], [-a2, y1]].map(([x, y]) => [u(x), u(y)]), u(HX), 'grey', { holes: [[0, u(Y.eye), u(0.5)]] });
  const wedge = (s) => {
    const m = S.extrude([[s * a2, -HX / 2], [s * hR, 0], [s * a2, HX / 2]].map(([x, z]) => [u(x), -u(z)]), u(y1 - y0), 'grey');
    m.rotation.x = -Math.PI / 2;
    m.position.y = u((y0 + y1) / 2);
    return m;
  };
  const hexMesh = merged([core, wedge(1), wedge(-1)], 'grey');
  const neck = L(S, [[0.4375, 12.95], [0.75, 12.95], [0.75, y0], [0.4375, y0], [0.4375, 12.95]], 'grey', 32);
  const eyeHead = group(
    merged([hexMesh, neck], 'grey'),
    // Trou de purge au bout (pastille sombre) et entrée de la vis 3 sur le collet.
    L(S, [[0, y1 + 0.001], [0.12, y1 + 0.001], [0.12, y1 + 0.004], [0, y1 + 0.004]], 'blackOxide', 16),
    at(L(S, [[0, 0.751], [0.19, 0.751], [0.19, 0.755], [0, 0.755]], 'blackOxide', 16), [0, u(13.22), 0], [0, 0, -Math.PI / 2]),
  );
  P('1', eyeHead, [0, 0.13, 0]);

  // ------------------------------------------------ 3 — vis sans tête 3/8-16 × 3/4
  // Radiale dans le collet (+X), bout cuvette sur la queue de tige.
  P('3', at(setScrew(S, THREE, 0.375, 0.75), [u(0.75), u(13.22), 0], [0, 0, -Math.PI / 2]), [0.08, 0.1, 0]);

  return { view: { dir: [0.9, 0.5, 1.0] } };
}
