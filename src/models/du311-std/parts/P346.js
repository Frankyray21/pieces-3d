// P346 — Électrovanne d'eau CX027466 rév. 0 « SOLENOID VALVE ASSEMBLY »
// (page 346), repère 9 de P338 (« 1" 2-POSITION 2-WAY 24VDC »). Électrovanne
// à membrane pilotée 1 NPT (1, CP18015-5) : corps en laiton forgé à deux
// moyeux taraudés en ligne et six-pans d'orifices, chapeau rond vissé par
// quatre vis sur le dessus, tube d'armature et écrou de retenue, bobine
// surmoulée 24 V CC dont le moyeu de sortie de câble (1/2 NPT) est tourné
// vers +Z ; faisceau de la bobine (2 à 7, voir solenoidHarness de
// ./_fronta.js) : joint (3), raccord de gaine (2), gaine annelée 3/8 po de
// 12 po (4) qui retombe, thermorétractable 3/4 po de 2 po (7), connecteur à
// deux voies (5) et broches (6).
// Repère : origine au centre du corps sur l'axe des orifices ; X selon les
// orifices (entrée à −X, sortie à +X, flèche de sens sur le corps), Y vers le
// haut (bobine), +Z côté sortie de câble. Encombrement ≈ 0.13 (X) × 0.52 (Y,
// de −0.42 à 0.10) × 0.13 (Z) m. Corps 1 po d'après les proportions du dessin
// (bobine ≈ 2 1/4 po).
import { IN, solenoidHarness } from './_fronta.js';

export const SOLW = {
  inlet: { pos: [-0.055, 0, 0], dir: [-1, 0, 0] },
  outlet: { pos: [0.055, 0, 0], dir: [1, 0, 0] },
};

export default function P346(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (1.315 * IN) / 2; // 1 NPT

  // ---------------------------------------------------------------- 1 — électrovanne
  const br = [
    S.box(0.07, 0.05, 0.062, 'brass', { r: 0.01, pos: [0, -0.004, 0] }),
    S.cyl(0.03, 0.03, 'brass', { seg: 32, pos: [0, -0.03, 0] }),
  ];
  // Moyeux d'orifices : six-pans 1 7/8 po puis taraudage (vrai alésage) 1 NPT.
  for (const s of [-1, 1]) {
    br.push(S.lathe([[rn * 0.95, 0], [rn * 1.42, 0], [rn * 1.42, 0.004], [rn * 0.95, 0.004]], 'brass', { axis: s > 0 ? 'x' : '-x', seg: 28, pos: [s * 0.051, 0, 0] }));
    br.push(S.at(S.nut(0.0476, 0.016, 'brass', { axis: 'x' }), [s * 0.043, 0, 0]));
  }
  // Chapeau rond (Ø 76) sur le dessus, quatre vis CHC.
  br.push(S.lathe([[0, 0.021], [0.038, 0.021], [0.038, 0.032], [0.034, 0.036], [0.016, 0.038], [0, 0.038]], 'brass', { seg: 32 }));
  const steel = [];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    steel.push(S.lathe([[0, 0], [0.0042, 0], [0.0042, 0.005], [0, 0.005]], 'steel', { seg: 12, pos: [Math.cos(a) * 0.03, 0.033, Math.sin(a) * 0.03] }));
  }
  // Tube d'armature, écrou de retenue en tête, bobine surmoulée.
  steel.push(S.cyl(0.009, 0.07, 'steel', { seg: 20, pos: [0, 0.07, 0] }));
  steel.push(S.nut(0.022, 0.008, 'steel', { pos: [0, 0.042, 0] }));
  steel.push(S.nut(0.016, 0.006, 'steel', { pos: [0, 0.103, 0] }));
  const coil = S.group(
    S.box(0.058, 0.052, 0.05, 'plastic', { r: 0.005, pos: [0, 0.072, 0] }),
    S.lathe([[0.0105, 0], [0.0135, 0], [0.0135, 0.012], [0.0105, 0.012]], 'plastic', { axis: 'z', seg: 24, pos: [0, 0.072, 0.025] }),
  );
  // Flèche de sens moulée sur la face avant du corps.
  const arrow = S.merged([
    S.box(0.026, 0.003, 0.0012, 'brass', { pos: [-0.004, -0.012, 0.0316] }),
    S.box(0.007, 0.003, 0.0012, 'brass', { pos: [0.009, -0.009, 0.0316], rot: [0, 0, -0.7] }),
    S.box(0.007, 0.003, 0.0012, 'brass', { pos: [0.009, -0.015, 0.0316], rot: [0, 0, 0.7] }),
  ], 'brass');
  P('1', S.group(S.merged(br, 'brass'), S.merged(steel, 'steel'), coil, arrow,
    S.at(S.nameplate(0.034, 0.024), [0.0291, 0.072, 0], [0, Math.PI / 2, 0])), [0, 0, 0]);

  // ---------------------------------------------------------------- 2 à 7 — faisceau de la bobine
  solenoidHarness(api, { pos: [0, 0.072, 0.037], dir: [0, 0, 1] }, { bend: 0.05, explode: [0, -0.04, 0.04] });

  return { view: { dir: [0.8, 0.5, 1.1] } };
}
