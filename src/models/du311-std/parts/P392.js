// P392 — Raccords du refroidisseur hydraulique CX037232 rév. 0 « ASSY,
// HYDRAULIC COOLER » (page 392), repère 29 de P208. La liste ne comprend que
// la robinetterie autour du refroidisseur d'huile à eau, dessiné en fantôme
// (« HYDRAULIC OIL COOLER », sans repère : oilCooler() de ./_fronta.js, à
// poser par P208). Huile : réductions six-pans 2 NPT × 1 NPT (10) dans les
// deux bossages du dessus et coudes 1 NPT → JIC -16 (4). Eau, sur la boîte à
// eau avant : sortie par l'adaptateur 1 NPT → JIC -16 (6) de l'orifice haut ;
// orifice bas : té de passage 1 po (11) dont le bout femelle reçoit le coude
// 1 NPT → JIC -08 (5) et la réduction tournante JIC -08 → -06 (2) (purge),
// et dont la dérivation reçoit l'adaptateur NPT → écrou tournant -16 (8) ;
// coude à écrou tournant -16 (3) jusqu'à l'adaptateur (6) de la sortie du
// détendeur-filtre 1 po (1 : corps bronze, chapeau de tamis, cloche à
// ressort, vis de réglage, raccord union de sortie) ; à l'entrée du
// détendeur, second té (11) : arrivée d'eau par l'adaptateur (6), sur la
// dérivation coude mâle-femelle 1 po (9) et adaptateur 1 NPT → JIC -08 (7).
// Repère machine (P208 le place à l'identité) : refroidisseur à gauche de la
// lanterne du groupe de pompage, calandre d'axe X (CO de ./_fronta.js :
// x = 0.70 à 1.22, y = 0.90, z = −0.29), orifices d'eau sur la face avant
// (x = 1.22, y = 0.90 ± 0.04), détendeur devant, au-dessus des pompes (axe à
// y ≈ 0.97). L'étiquette 29 de la page 208 désigne ce détendeur sur le pont
// avant (et non à gauche de la cabine comme dans le porteur simplifié).
// Tout l'ensemble est sur le châssis avant (corps « front »).
import { body } from '../layout.js';
import { nptFitting, orient, orientPoint } from '../../du311/parts/_chassis.js';
import { racFactory } from '../../du311/parts/_porteur.js';
import { IN, CO, pose, posePoint, runTee, hexBushing, pipeElbow, nptThread } from './_fronta.js';

export default function P392(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, body('front', obj), e);
  const F = racFactory(S);
  const put = (ref, f, pos, dir, side, e) => { P(ref, orient(api, f.obj, pos, dir, side), e); return f.out ? orientPoint(api, f.out, pos, dir, side) : null; };

  // ---------------------------------------------------------------- huile : 10 réductions, 4 coudes
  for (const x of CO.oil) {
    const yb = CO.y + CO.r + 0.014; // dessus du bossage
    const b = hexBushing(S, 32, 16);
    P('10', S.at(b.obj, [x, yb, CO.z]), [0, 0.12, 0]);
    put('4', nptFitting(api, { npt: 16, jic: 16, angle: 90 }), [x, yb + b.top[1], CO.z], [0, 1, 0], [0, 0, 1], [0, 0.2, 0.04]);
  }

  // ---------------------------------------------------------------- eau : sortie haute (6)
  const XW = CO.x1;
  const yH = CO.y + CO.water[0], yL = CO.y + CO.water[1];
  put('6', nptFitting(api, { npt: 16, jic: 16 }), [XW, yH, CO.z], [1, 0, 0], null, [0.12, 0.05, 0]);

  // ---------------------------------------------------------------- orifice bas : 11 té, 5 coude, 2 réduction, 8 adaptateur
  const t1 = runTee(S, 16);
  P('11', pose(THREE, t1.obj, [XW, yL, CO.z], [1, 0, 0], [0, 1, 0]), [0.1, -0.05, 0]);
  const runEnd = posePoint(THREE, t1.top, [XW, yL, CO.z], [1, 0, 0], [0, 1, 0]);
  const branch = posePoint(THREE, t1.branch, [XW, yL, CO.z], [1, 0, 0], [0, 1, 0]);
  const o5 = put('5', nptFitting(api, { npt: 16, jic: 8, angle: 90 }), runEnd, [1, 0, 0], [0, -1, 0], [0.16, -0.08, 0]);
  {
    const red = F.swivel({ kind: 'reducer', fd: 8, jd: 6 });
    P('2', pose(THREE, red, o5, [0, -1, 0]), [0.16, -0.14, 0]);
  }
  const a8 = F.nptSwivel(16, 16);
  P('8', pose(THREE, a8, branch, [0, 1, 0]), [0.1, 0.06, 0]);
  const e8 = [branch[0], branch[1] + a8.userData.ports[0].p[1] - 0.025, branch[2]]; // nez engagé dans l'écrou de 8

  // ---------------------------------------------------------------- 3 — coude tournant -16 ; 6 — adaptateur de sortie du détendeur
  const el3 = F.swivel({ kind: 'elbow', fd: 16 });
  const p3 = el3.userData.ports[0].p;
  const O3 = [e8[0] + p3[1], e8[1] + p3[0], e8[2]]; // bout du nez de l'adaptateur 6 (vers −X)
  P('3', pose(THREE, el3, O3, [-1, 0, 0], [0, -1, 0]), [0.12, 0.12, 0]);
  const f6 = nptFitting(api, { npt: 16, jic: 16 });
  const xRo = O3[0] + f6.out[1]; // face de sortie du détendeur
  const YR = O3[1], ZR = CO.z;
  put('6', f6, [xRo, YR, ZR], [-1, 0, 0], null, [0.16, 0.14, 0]);

  // ---------------------------------------------------------------- 1 — détendeur-filtre 1 po (bronze)
  const rn = (1.315 * IN) / 2;
  const LR = 0.16; // face à face
  const xc = xRo + LR / 2;
  {
    const br = [
      // Corps : deux moyeux taraudés en ligne (six-pans) et chambre centrale.
      S.at(S.nut(0.048, 0.028, 'brass', { axis: 'x' }), [xRo + LR - 0.014, YR, ZR]),
      S.lathe([[rn * 0.95, 0], [rn * 1.42, 0], [rn * 1.42, 0.004], [rn * 0.95, 0.004]], 'brass', { axis: 'x', seg: 28, pos: [xRo + LR - 0.004, YR, ZR] }),
      S.lathe([[0, -0.03], [0.034, -0.03], [0.038, -0.024], [0.038, 0.024], [0.034, 0.03], [0, 0.03]], 'brass', { axis: 'z', seg: 32, pos: [xc, YR, ZR] }),
      S.cyl(0.024, 0.07, 'brass', { axis: 'x', seg: 28, pos: [xc - 0.012, YR, ZR] }),
      // Raccord union de sortie : écrou six-pans et queue.
      S.at(S.nut(0.054, 0.022, 'brass', { axis: 'x' }), [xRo + 0.024, YR, ZR]),
      S.lathe([[rn * 0.95, 0], [rn * 1.3, 0], [rn * 1.3, 0.013], [rn * 0.95, 0.013]], 'brass', { axis: '-x', seg: 28, pos: [xRo + 0.013, YR, ZR] }),
      // Cloche à ressort sur le dessus, collerette boulonnée.
      S.lathe([[0, 0.028], [0.048, 0.028], [0.048, 0.04], [0.042, 0.044], [0.03, 0.05], [0.027, 0.11], [0.02, 0.122], [0.012, 0.126], [0, 0.126]], 'brass', { seg: 32, pos: [xc, YR, ZR] }),
      // Chapeau de tamis (six-pans) sous le corps.
      S.lathe([[0, 0], [0.026, 0], [0.026, 0.03], [0, 0.03]], 'brass', { axis: '-y', seg: 32, pos: [xc, YR - 0.03, ZR] }),
      S.at(S.nut(0.036, 0.012, 'brass'), [xc, YR - 0.066, ZR]),
    ];
    const st = [];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; st.push(S.at(S.nut(0.011, 0.006, 'steel'), [xc + Math.cos(a) * 0.042, YR + 0.043, ZR + Math.sin(a) * 0.042])); }
    st.push(S.lathe([[0, 0], [0.0075, 0], ...S.thread(0.0075, 0.002, 0.04, { pitch: 0.0018, chamferBottom: false }), [0, 0.04]], 'steel', { seg: 16, pos: [xc, YR + 0.12, ZR] }));
    st.push(S.at(S.nut(0.022, 0.009, 'steel'), [xc, YR + 0.132, ZR]));
    st.push(S.at(S.nut(0.013, 0.008, 'steel'), [xc, YR + 0.164, ZR]));
    // Bouchon de purge du tamis.
    st.push(S.lathe([[0, 0], ...nptThread(S, (0.405 * IN) / 2, 0, 0.008).map(([r, y]) => [r, 0.008 - y]).reverse(), [0.006, 0.008], [0.006, 0.014], [0, 0.014]], 'steel', { axis: '-y', seg: 6, pos: [xc, YR - 0.072, ZR] }));
    P('1', S.group(S.merged(br, 'brass'), S.merged(st, 'steel')), [0.1, 0.25, 0]);
  }

  // ---------------------------------------------------------------- entrée du détendeur : 11 té, 6 adaptateur, 9 coude, 7 adaptateur
  const xIn = xRo + LR;
  const t2 = runTee(S, 16);
  P('11', pose(THREE, t2.obj, [xIn, YR, ZR], [1, 0, 0], [0, 1, 0]), [0.2, 0.15, 0]);
  const end2 = posePoint(THREE, t2.top, [xIn, YR, ZR], [1, 0, 0], [0, 1, 0]);
  const br2 = posePoint(THREE, t2.branch, [xIn, YR, ZR], [1, 0, 0], [0, 1, 0]);
  put('6', nptFitting(api, { npt: 16, jic: 16 }), end2, [1, 0, 0], null, [0.28, 0.15, 0]);
  const e9 = pipeElbow(S, 16, { inEnd: 'male', outEnd: 'female' });
  P('9', pose(THREE, e9.obj, br2, [0, 1, 0], [0, 0, 1]), [0.2, 0.25, 0]);
  const o9 = posePoint(THREE, e9.out, br2, [0, 1, 0], [0, 0, 1]);
  put('7', nptFitting(api, { npt: 16, jic: 8 }), o9, [0, 0, 1], null, [0.2, 0.25, 0.1]);

  return { view: { dir: [1.0, 0.7, -0.9] } };
}
