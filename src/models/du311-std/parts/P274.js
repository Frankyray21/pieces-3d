// P274 — Tuyauteries CAC et refroidissement CX009590 rév. 4 (page 274) :
// « CAC & COOLANT PIPING ASSY », repère 35 de P246.
// Admission d'air (figure 2) : filtre à air (7) couché sur le support du
// sélecteur de translation et du filtre (28) par deux bandes Ø 11 po (8) ;
// entrée verticale vers la prise d'air du toit par la durite à bosse 6 × 5 po
// (15, collier à tourillon Ø 5 1/2 po 10) ; sortie axiale : durite à bosse
// 4 1/2 × 4 po (2, colliers Ø 5 po 9 et 4 1/2 po 16), tuyau d'entrée d'air (18,
// second collier 16), coude cobra 4 × 2 3/4 po (3, collier Ø 3 1/4 po 12) sur
// l'entrée du compresseur.
// Air de suralimentation (figure 3) : adaptateur sur la sortie du turbo (19,
// joint torique CP001195 et collier en V CP001212 dessinés avec lui), manchons
// Ø 3 po (4, deux) et coudes Ø 3 po (5, deux), huit colliers Ø 3 1/4 po (11),
// tuyau chaud vers le bas du faisceau CAC (20), tuyau froid du haut du
// faisceau vers la tubulure d'admission (21) tenu par l'équerre (22) et la
// bride en U 3 po (17), adaptateur d'entrée moteur (23, joint CP001196 et
// collier en V CP001212).
// Refroidissement (figure 1) : tuyau du thermostat (24), tuyaux de pompe
// (25, 26), raccords de tuyau Ø 2 po (27, trois), durites à bosse Ø 2 po (6,
// deux), dix colliers 2 3/8 po (1) ; durite 1 po × 3 pi (13) de remplissage
// statique sur l'embout 3/4 NPT × 1 po (29) du haut du radiateur, durite
// 3/8 po × 4 pi (14) de dégazage depuis le coude à olive 1/4 NPT (30) du
// boîtier de thermostat.
// Repère : REPÈRE MACHINE (celui de P246, qui le pose à l'identité) ; points
// d'attache sur le moteur (ENG), le radiateur (RAD) et le filtre (AIR) de
// _engine.js. Encombrement ≈ 1.25 (X) × 0.93 (Y) × 1.33 (Z) m.
import { ENG, RAD, AIR, STAND, e2m, radToM, IN, tBoltClamp, wormClamp, vBandClamp, uBolt, pose, offset } from './_engine.js';

export default function P274(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, tube, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (a) => new THREE.Vector3(...a);
  const unit = (d) => { const n = Math.hypot(...d); return d.map((v) => v / n); };

  // Objet construit selon +Y posé en p, axe dir.
  const ax = (obj, p, dir) => pose(THREE, obj, p, dir);
  // Manchon droit souple (r intérieur ≈ tuyau) de a vers b ; bosse centrale si hump.
  const sleeve = (a, b, r, { hump = false, mat = 'rubber' } = {}) => {
    const d = b.map((v, i) => v - a[i]), L = Math.hypot(...d);
    const parts = [cyl(r + 0.004, L, mat, { seg: 24, pos: [0, L / 2, 0] })];
    if (hump) parts.push(S.torus(r + 0.006, 0.008, mat, { pos: [0, L / 2, 0] }));
    for (const y of [0.004, L - 0.004]) parts.push(cyl(r + 0.005, 0.008, mat, { seg: 24, pos: [0, y, 0] }));
    return ax(merged(parts, mat), a, d);
  };
  // Collier sur un manchon, à k m du point a vers b.
  const clampAt = (fn, a, b, k, D) => {
    const d = b.map((v, i) => v - a[i]);
    return ax(group(fn(S, D)), offset(a, d, k), d);
  };
  // Tuyau rigide (tube suivant des points), bourrelets de retenue aux bouts.
  const pipe = (pts, r, mat, beads = true) => {
    const parts = [tube(pts, r, mat, { seg: Math.max(16, pts.length * 10), radial: 18 })];
    if (beads) {
      for (const [p, q] of [[pts[0], pts[1]], [pts.at(-1), pts.at(-2)]]) {
        parts.push(ax(S.torus(r, 0.0025, mat), offset(p, q.map((v, i) => v - p[i]), 0.022), q.map((v, i) => v - p[i])));
      }
    }
    return merged(parts, mat);
  };

  // ================================================================ admission d'air
  const A = AIR;
  const inTop = [A.x, A.y + A.r + 0.045, A.inZ]; // bout du piquage d'entrée (Ø 5 po)
  // ---------------------------------------------------------------- 7 — filtre à air
  // Corps tôle, bourrelets, couvercle à trois agrafes et soupape d'évacuation
  // des poussières, piquages d'entrée et de sortie, indicateur de colmatage.
  const fil = [
    cyl(A.r, A.z1 - A.z0 + 0.0, 'black', { axis: 'z', seg: 40, pos: [A.x, A.y, (A.z0 + A.z1) / 2] }),
    ...[A.z0 + 0.02, A.z1 - 0.02].map((z) => at(S.torus(A.r, 0.004, 'black', { axis: 'z' }), [A.x, A.y, z])),
    at(lathe([[0, 0], [A.r + 0.006, 0], [A.r + 0.006, 0.03], [A.r - 0.01, 0.055], [0.05, 0.065], [0, 0.066]], 'black', { axis: '-z', seg: 40 }), [A.x, A.y, A.z1]),
    at(lathe([[0, 0], [A.r - 0.02, 0], [A.r - 0.03, 0.02], [0.06, 0.03], [0, 0.03]], 'black', { axis: 'z', seg: 32 }), [A.x, A.y, A.z0]),
    cyl(2.25 * IN, 0.06, 'black', { axis: 'z', seg: 28, pos: [A.x, A.y, A.z0 + 0.03] }),
    cyl(A.inR, 0.05, 'black', { seg: 28, pos: [A.x, A.y + A.r + 0.02, A.inZ] }),
  ];
  const clips = [];
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    clips.push(box(0.014, 0.008, 0.05, 'zinc', { pos: [A.x + Math.cos(a) * (A.r + 0.009), A.y + Math.sin(a) * (A.r + 0.009), A.z1 - 0.012], rot: [0, 0, a] }));
  }
  const duck = lathe([[0, 0], [0.02, 0], [0.018, -0.02], [0.012, -0.045], [0, -0.05]], 'rubber', { seg: 16, pos: [A.x, A.y - A.r - 0.01, A.z1 - 0.035] });
  const indic = group(
    cyl(0.012, 0.03, 'zinc', { seg: 12, pos: [A.x, A.y + 0.07, A.z0 + 0.045] }),
    cyl(0.016, 0.045, 'glass', { seg: 16, pos: [A.x, A.y + 0.105, A.z0 + 0.045] }),
    cyl(0.012, 0.012, 'red', { seg: 14, pos: [A.x, A.y + 0.1, A.z0 + 0.045] }),
  );
  const fTag = at(S.nameplate(0.08, 0.05), [A.x + A.r + 0.0008, A.y, (A.z0 + A.z1) / 2]);
  fTag.rotation.y = Math.PI / 2;
  P('7', group(merged(fil, 'black'), merged(clips, 'zinc'), duck, indic, fTag), [0, 0, -0.35]);

  // ---------------------------------------------------------------- 8 — bandes Ø 11 po (deux)
  for (const z of [A.z0 + 0.08, A.z1 - 0.1]) {
    P('8', group(merged([
      at(S.ring(A.r + 0.004, A.r, 0.032, 'black', { axis: 'z', seg: 40 }), [A.x, A.y, z]),
      box(0.12, 0.005, 0.032, 'black', { pos: [A.x, A.y - A.r - 0.006, z] }),
      ...[-1, 1].map((s) => box(0.005, 0.03, 0.032, 'black', { pos: [A.x + s * 0.03, A.y - A.r + 0.008, z] })),
      ...[-1, 1].map((s) => at(S.bolt(0.008, 0.03, 'zinc', { axis: 'x' }), [A.x + s * 0.034, A.y - A.r + 0.012, z])),
    ], 'black')), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 28 — support du sélecteur et du filtre
  // Deux montants en cornière sur le longeron gauche, berceau sous le filtre,
  // tôle verticale de fixation du collecteur P260, goussets, semelles.
  const sx = [STAND.x0 + 0.03, STAND.x1 - 0.03], zR = -0.48, yB = A.y - A.r - 0.012;
  const st = [];
  for (const x of sx) {
    st.push(box(0.05, yB - 1.0, 0.005, 'black', { pos: [x, (yB + 1.0) / 2, zR + 0.02] }));
    st.push(box(0.005, yB - 1.0, 0.05, 'black', { pos: [x - 0.0225, (yB + 1.0) / 2, zR] }));
    st.push(box(0.09, 0.008, 0.07, 'black', { pos: [x, 1.004, zR] }));
    st.push(at(S.bolt(0.012, 0.025, 'zinc'), [x + 0.025, 1.008, zR + 0.02]));
  }
  st.push(box(STAND.x1 - STAND.x0, 0.006, 0.42, 'black', { pos: [(STAND.x0 + STAND.x1) / 2, yB - 0.003, (A.z0 + A.z1) / 2] }));
  st.push(box(STAND.x1 - STAND.x0 - 0.14, 0.26, 0.01, 'black', { pos: [(STAND.x0 + STAND.x1) / 2 - 0.01, 1.33, STAND.zPlate - 0.005] }));
  for (const x of sx) st.push(box(0.008, 0.2, 0.1, 'black', { pos: [x, 1.33, (zR + STAND.zPlate) / 2] }));
  P('28', group(merged(st, 'black')), [0, -0.3, -0.2]);

  // ---------------------------------------------------------------- 15 — durite à bosse 6 × 5 po, 10 — collier Ø 5 1/2 po
  const roof = [A.x, 1.915, A.inZ];
  P('15', sleeve([inTop[0], inTop[1] - 0.04, inTop[2]], roof, A.inR + 0.004, { hump: true }), [0, 0.15, 0]);
  P('10', clampAt(tBoltClamp, [inTop[0], inTop[1] - 0.04, inTop[2]], roof, 0.02, 5.5 * IN), [0, 0.1, 0]);

  // ---------------------------------------------------------------- 2 — durite à bosse 4 1/2 × 4 po, 9 et 16 — colliers
  const h2a = [A.x, A.y, A.z0 + 0.025], h2b = [A.x, A.y, A.z0 + 0.13];
  P('2', sleeve(h2a, h2b, 2.25 * IN, { hump: true }), [0, 0, 0.1]);
  P('9', clampAt(tBoltClamp, h2a, h2b, 0.015, 5.0 * IN), [0, 0, 0.06]);
  P('16', clampAt(tBoltClamp, h2a, h2b, 0.09, 4.5 * IN), [0, 0, 0.14]);

  // ---------------------------------------------------------------- 18 — tuyau d'entrée d'air Ø 4 po
  const cIn = e2m([ENG.compIn.x, ENG.compIn.y, ENG.compIn.z]); // entrée du compresseur (vers −Z)
  const cob1 = [cIn[0] - 0.12, cIn[1] + 0.02, cIn[2] - 0.075]; // bout du coude cobra côté 4 po (vers −X)
  const p18 = [[A.x, A.y, A.z0 + 0.11], [A.x, A.y, A.z0 + 0.17], [A.x + 0.04, A.y - 0.005, A.z0 + 0.195], [cob1[0] - 0.06, cob1[1], cob1[2]], [cob1[0] + 0.01, cob1[1], cob1[2]]];
  P('18', pipe(p18, 2.0 * IN, 'castAlu'), [0.05, 0.1, 0.1]);
  P('16', clampAt(tBoltClamp, cob1, [cob1[0] + 0.1, cob1[1], cob1[2]], 0.025, 4.5 * IN), [0.06, 0.1, 0.1]);
  // ---------------------------------------------------------------- 3 — coude cobra 4 × 2 3/4 po, 12 — collier Ø 3 1/4 po
  const cobra = new THREE.CatmullRomCurve3([V([cob1[0] - 0.005, cob1[1], cob1[2]]), V([cob1[0] + 0.07, cob1[1] - 0.005, cob1[2] + 0.005]), V([cIn[0], cIn[1], cIn[2] - 0.06]), V([cIn[0], cIn[1], cIn[2] + 0.002])]);
  const cob = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, p = cobra.getPointAt(t), d = cobra.getTangentAt(t);
    const r = 2.0 * IN + 0.006 - t * (0.625 * IN);
    const c = cyl(r, cobra.getLength() / 10 + 0.002, 'rubber', { seg: 24 });
    c.quaternion.setFromUnitVectors(V([0, 1, 0]), d);
    c.position.copy(p);
    cob.push(c);
  }
  P('3', group(merged(cob, 'rubber')), [0.1, 0.1, 0.05]);
  P('12', clampAt(tBoltClamp, [cIn[0], cIn[1], cIn[2] - 0.04], cIn, 0.018, 3.25 * IN), [0.1, 0.12, 0.05]);

  // ================================================================ air de suralimentation
  const r3 = 1.5 * IN;
  const cOut = e2m([ENG.compOut.x, ENG.compOut.y, ENG.compOut.z]); // sortie du compresseur (vers +Y)
  // ---------------------------------------------------------------- 19 — adaptateur sur le turbo
  const a19 = [cOut[0] - 0.1, cOut[1] + 0.08, cOut[2]]; // bout (vers −X)
  P('19', group(
    pipe([cOut, [cOut[0], cOut[1] + 0.05, cOut[2]], [cOut[0] - 0.04, cOut[1] + 0.08, cOut[2]], a19], 1.25 * IN, 'castAlu', false),
    ax(group(vBandClamp(S, 0.085)), [cOut[0], cOut[1] + 0.008, cOut[2]], [0, 1, 0]),
    ax(S.torus(0.036, 0.0025, 'rubber'), [cOut[0], cOut[1] + 0.002, cOut[2]], [0, 1, 0]),
  ), [0, 0.12, 0]);
  // ---------------------------------------------------------------- 4 — manchon chaud, 11 — colliers
  const s4a = a19, s4b = [a19[0] - 0.08, a19[1], a19[2]];
  P('4', sleeve([s4a[0] + 0.03, s4a[1], s4a[2]], s4b, r3), [-0.05, 0.1, 0]);
  P('11', clampAt(wormClamp, s4a, s4b, 0.012, 3.25 * IN), [-0.05, 0.12, 0]);
  P('11', clampAt(wormClamp, s4a, s4b, 0.07, 3.25 * IN), [-0.07, 0.12, 0]);
  // ---------------------------------------------------------------- 20 — tuyau chaud vers le bas du faisceau CAC
  const cacIn = radToM(RAD.cacIn), cacInEnd = [cacIn[0] + 0.06, cacIn[1], cacIn[2]];
  const e5b = [cacInEnd[0] + 0.1, cacIn[1] + 0.1, cacIn[2]]; // départ du coude bas (vers +Y)
  const p20 = [[s4b[0] + 0.03, s4b[1], s4b[2]], [s4b[0] - 0.06, s4b[1] - 0.01, s4b[2] - 0.02], [-2.36, 1.62, -0.22], [e5b[0], 1.45, e5b[2]], [e5b[0], e5b[1] + 0.02, e5b[2]]];
  P('20', pipe(p20, r3, 'castAlu'), [-0.15, 0, -0.1]);
  // ---------------------------------------------------------------- 5 — coude bas (vers le piquage CAC)
  const elbow = (a, da, b) => {
    // Coude souple : de a (direction da) jusqu'à b (sur le piquage).
    const c = new THREE.CatmullRomCurve3([V(a), V(offset(a, da, 0.04)), V(offset(b, [b[0] - a[0], 0, b[2] - a[2]], -0.03)), V(b)]);
    return group(tube(c.getPoints(16).map((v) => v.toArray()), r3 + 0.005, 'rubber', { seg: 20, radial: 20, ends: 'none' }));
  };
  const e5bEnd = [cacInEnd[0] - 0.03, cacIn[1], cacIn[2]];
  P('5', elbow([e5b[0], e5b[1] + 0.03, e5b[2]], [0, -1, 0], e5bEnd), [-0.1, -0.05, 0]);
  P('11', clampAt(wormClamp, [e5b[0], e5b[1] + 0.03, e5b[2]], [e5b[0], e5b[1] + 0.1, e5b[2]], 0.012, 3.25 * IN), [-0.1, -0.03, 0]);
  P('11', clampAt(wormClamp, e5bEnd, [e5bEnd[0] + 0.1, e5bEnd[1], e5bEnd[2]], 0.015, 3.25 * IN), [-0.12, -0.05, 0]);

  // ---------------------------------------------------------------- 23 — adaptateur d'entrée moteur
  const iIn = e2m([ENG.intake.x, ENG.intake.y, ENG.intake.z]); // entrée de tubulure (vers +Y)
  const a23 = [iIn[0] - 0.08, iIn[1] + 0.075, iIn[2]];
  P('23', group(
    pipe([iIn, [iIn[0], iIn[1] + 0.045, iIn[2]], [iIn[0] - 0.035, iIn[1] + 0.075, iIn[2]], a23], r3, 'castAlu', false),
    ax(group(vBandClamp(S, 0.09)), [iIn[0], iIn[1] + 0.008, iIn[2]], [0, 1, 0]),
    ax(S.torus(0.04, 0.0025, 'rubber'), [iIn[0], iIn[1] + 0.002, iIn[2]], [0, 1, 0]),
  ), [0.05, 0.15, 0]);
  // ---------------------------------------------------------------- 4 — manchon froid, 11 — colliers
  const t4a = a23, t4b = [a23[0] - 0.08, a23[1], a23[2]];
  P('4', sleeve([t4a[0] + 0.03, t4a[1], t4a[2]], t4b, r3), [0.05, 0.12, 0]);
  P('11', clampAt(wormClamp, t4a, t4b, 0.012, 3.25 * IN), [0.05, 0.14, 0]);
  P('11', clampAt(wormClamp, t4a, t4b, 0.07, 3.25 * IN), [0.04, 0.14, 0]);
  // ---------------------------------------------------------------- 21 — tuyau froid au-dessus du carter de volant
  const cacOut = radToM(RAD.cacOut), cacOutEnd = [cacOut[0] + 0.06, cacOut[1], cacOut[2]];
  const e5t = [-2.4, cacOut[1] + 0.005, cacOut[2] + 0.07]; // départ du coude haut (vers −Z)
  const p21 = [[t4b[0] + 0.03, t4b[1], t4b[2]], [-1.9, t4b[1], t4b[2]], [-2.3, t4b[1], t4b[2] - 0.01], [e5t[0], e5t[1], e5t[2] + 0.06], [e5t[0], e5t[1], e5t[2] - 0.02]];
  P('21', pipe(p21, r3, 'castAlu'), [0, 0.15, 0]);
  // ---------------------------------------------------------------- 5 — coude haut
  const e5tEnd = [cacOutEnd[0] - 0.03, cacOut[1], cacOut[2]];
  P('5', elbow([e5t[0], e5t[1], e5t[2] - 0.03], [0, 0, -1], e5tEnd), [-0.1, 0.1, 0]);
  P('11', clampAt(wormClamp, [e5t[0], e5t[1], e5t[2] - 0.03], [e5t[0], e5t[1], e5t[2] + 0.05], 0.012, 3.25 * IN), [-0.1, 0.12, 0]);
  P('11', clampAt(wormClamp, e5tEnd, [e5tEnd[0] + 0.1, e5tEnd[1], e5tEnd[2]], 0.015, 3.25 * IN), [-0.12, 0.12, 0]);
  // ---------------------------------------------------------------- 22 — équerre CAC, 17 — bride en U 3 po
  // Pied vissé sur le dessus du carter de volant, montant jusque sous le tuyau froid.
  const xb = -1.86, yTop = t4b[1] - r3 - 0.004, zb = t4b[2];
  const yFoot = ENG.y + ENG.sae.outR - 0.008;
  P('22', group(merged([
    box(0.06, yTop - yFoot, 0.006, 'black', { pos: [xb, (yTop + yFoot) / 2, zb - 0.02] }),
    box(0.06, 0.006, 0.05, 'black', { pos: [xb, yTop - 0.003, zb] }),
    box(0.06, 0.006, 0.05, 'black', { pos: [xb, yFoot + 0.003, zb - 0.045] }),
    at(S.bolt(0.01, 0.025, 'zinc'), [xb, yFoot + 0.006, zb - 0.05]),
  ], 'black')), [0, 0.1, -0.05]);
  {
    const ub = group(uBolt(S, THREE, 2 * r3, 0.008, { leg: 0.03, base: 0.006 }));
    ub.rotation.y = Math.PI / 2; // tube selon X
    ub.position.set(xb, t4b[1], zb);
    P('17', group(ub), [0, 0.08, 0]);
  }

  // ================================================================ refroidissement
  const r2 = 1.0 * IN;
  const th = e2m([ENG.thermo.x, ENG.thermo.y, ENG.thermo.z]); // sortie du thermostat (vers −X)
  const pi = e2m([ENG.pumpIn.x, ENG.pumpIn.y, ENG.pumpIn.z]); // entrée de pompe (vers −X)
  const wIn = radToM(RAD.waterIn), wInEnd = [wIn[0] + 0.06, wIn[1], wIn[2]];
  const wOut = radToM(RAD.waterOut), wOutEnd = [wOut[0] + 0.06, wOut[1], wOut[2]];
  const cl = (a, b, k, ref = '1', e = [0, 0.05, 0]) => P(ref, clampAt(wormClamp, a, b, k, 2.375 * IN), e);
  // ---------------------------------------------------------------- 27 — raccord du thermostat, 24 — tuyau du thermostat
  const k1a = th, k1b = [th[0] - 0.07, th[1], th[2]];
  P('27', sleeve([k1a[0] + 0.01, k1a[1], k1a[2]], k1b, r2), [0, 0.06, 0.05]);
  cl(k1a, k1b, 0.012); cl(k1a, k1b, 0.06);
  const h6a = [wInEnd[0] + 0.09, wIn[1], wIn[2]];
  const p24 = [[k1b[0] + 0.03, k1b[1], k1b[2]], [k1b[0] - 0.1, k1b[1] + 0.03, k1b[2] - 0.01], [h6a[0] + 0.12, h6a[1] + 0.005, h6a[2]], [h6a[0] - 0.03, h6a[1], h6a[2]]];
  P('24', pipe(p24, r2, 'black'), [0, 0.1, 0.05]);
  // ---------------------------------------------------------------- 6 — durite à bosse haute
  P('6', sleeve([wInEnd[0] - 0.035, wIn[1], wIn[2]], h6a, r2, { hump: true }), [-0.08, 0.05, 0]);
  cl([wInEnd[0] - 0.035, wIn[1], wIn[2]], h6a, 0.018, '1', [-0.08, 0.07, 0]);
  cl([wInEnd[0] - 0.035, wIn[1], wIn[2]], h6a, 0.11, '1', [-0.06, 0.07, 0]);
  // ---------------------------------------------------------------- 6 — durite à bosse basse, 26 — tuyau de pompe
  const h6b = [wOutEnd[0] + 0.09, wOut[1], wOut[2]];
  P('6', sleeve([wOutEnd[0] - 0.035, wOut[1], wOut[2]], h6b, r2, { hump: true }), [-0.08, -0.05, 0]);
  cl([wOutEnd[0] - 0.035, wOut[1], wOut[2]], h6b, 0.018, '1', [-0.08, -0.07, 0]);
  cl([wOutEnd[0] - 0.035, wOut[1], wOut[2]], h6b, 0.11, '1', [-0.06, -0.07, 0]);
  const k2 = [-2.08, 1.16, wOut[2] + 0.02];
  const p26 = [[h6b[0] - 0.03, h6b[1], h6b[2]], [-2.25, h6b[1] + 0.005, h6b[2] + 0.01], [k2[0] - 0.05, k2[1] - 0.03, k2[2]], [k2[0] + 0.01, k2[1], k2[2]]];
  P('26', pipe(p26, r2, 'black'), [-0.05, -0.1, 0.05]);
  // ---------------------------------------------------------------- 27 — raccord intermédiaire, 25 — tuyau de pompe
  const k2b = [k2[0] + 0.07, k2[1] + 0.02, k2[2]];
  P('27', sleeve([k2[0] - 0.01, k2[1], k2[2]], k2b, r2), [0, -0.08, 0.06]);
  cl([k2[0] - 0.01, k2[1], k2[2]], k2b, 0.012, '1', [0, -0.08, 0.08]); cl([k2[0] - 0.01, k2[1], k2[2]], k2b, 0.06, '1', [0, -0.08, 0.08]);
  const k3 = [pi[0] - 0.07, pi[1], pi[2]];
  const p25 = [[k2b[0] - 0.03, k2b[1] - 0.006, k2b[2]], [k2b[0] + 0.08, k2b[1] + 0.06, k2b[2]], [k3[0] - 0.08, k3[1] - 0.02, k3[2]], [k3[0] + 0.03, k3[1], k3[2]]];
  P('25', pipe(p25, r2, 'black'), [0.05, -0.05, 0.08]);
  // ---------------------------------------------------------------- 27 — raccord de la pompe
  P('27', sleeve([k3[0] - 0.01, k3[1], k3[2]], [pi[0] + 0.005, pi[1], pi[2]], r2), [0.04, -0.05, 0.1]);
  cl([k3[0] - 0.01, k3[1], k3[2]], pi, 0.012, '1', [0.04, -0.06, 0.12]); cl([k3[0] - 0.01, k3[1], k3[2]], pi, 0.06, '1', [0.04, -0.06, 0.12]);
  // ---------------------------------------------------------------- 29 — embout 3/4 NPT × 1 po sur le haut du radiateur, 13 — durite 1 po
  const top29 = radToM([-RAD.core / 2, RAD.tankY[3], 0.2]);
  P('29', group(merged([
    S.nut(0.035, 0.012, 'brass', { pos: [top29[0], top29[1] + 0.006, top29[2]] }),
    cyl(0.017, 0.04, 'brass', { seg: 14, pos: [top29[0], top29[1] + 0.032, top29[2]] }),
    ...[0.02, 0.032, 0.044].map((y) => S.lathe([[0.017, 0], [0.021, 0.004], [0.017, 0.008]], 'brass', { seg: 14, pos: [top29[0], top29[1] + y, top29[2]] })),
  ], 'brass')), [0, 0.08, 0]);
  const tap25 = [k2b[0] + 0.08, k2b[1] + 0.06 + r2, k2b[2]];
  P('13', S.hose([[top29[0], top29[1] + 0.05, top29[2]], [top29[0] + 0.02, top29[1] + 0.065, top29[2] + 0.04], [-2.5, 1.89, 0.3], [-2.35, 1.6, 0.45], [-2.05, 1.3, 0.42], [tap25[0], tap25[1] + 0.04, tap25[2]]], 0.0165, { endMaterial: 'zinc' }), [0, 0.05, 0.1]);
  // ---------------------------------------------------------------- 30 — coude à olive 1/4 NPT × 3/8 po, 14 — durite 3/8 po
  const tv = e2m([ENG.thermo.x - 0.03, ENG.thermo.y + 0.05, ENG.thermo.z - 0.04]);
  P('30', group(merged([
    S.nut(0.016, 0.007, 'brass', { pos: [tv[0], tv[1] + 0.0035, tv[2]] }),
    cyl(0.007, 0.018, 'brass', { seg: 12, pos: [tv[0], tv[1] + 0.016, tv[2]] }),
    cyl(0.006, 0.03, 'brass', { axis: 'x', seg: 12, pos: [tv[0] - 0.015, tv[1] + 0.024, tv[2]] }),
  ], 'brass')), [0, 0.06, 0]);
  const vent = radToM([-RAD.core / 2 + 0.065, RAD.tankY[3] + 0.022, 0.4]);
  P('14', S.hose([[tv[0] - 0.03, tv[1] + 0.024, tv[2]], [tv[0] - 0.2, tv[1] + 0.06, tv[2] + 0.02], [-2.1, 1.9, 0.44], [-2.4, 1.9, 0.42], [vent[0] + 0.01, vent[1], vent[2]]], 0.0085, { endMaterial: 'zinc' }), [0, 0.1, 0.06]);
  void unit; void ENG;
  return { view: { dir: [0.8, 0.9, 1.1] } };
}
