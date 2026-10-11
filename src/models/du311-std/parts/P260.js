// P260 — Collecteur de translation CP000393 (page 260) : « TRAMMING
// MANIFOLD », repère 4 de P246. Bloc usiné en fonte (1) portant les
// cartouches vissées : éléments logiques à ouverture pilotée (2 sur les deux
// flancs, 9 sur le flanc +X), éléments logiques à fermeture pilotée (6, face
// avant), distributeur 2 positions 3 voies à électro-aimant (3, sur le dessus
// à l'angle avant gauche), limiteurs de pression (4) et réducteur de pression
// (5) sur le dessus, clapet (7) et sélecteur de circuit (8) en façade, valves
// d'équilibrage (13, CBCV-1 / CBCV-2) en façade ; bouchons à six-pans creux
// et joint torique SAE-8 (10), SAE-6 (11) et SAE-4 (12) sur les orifices
// d'usinage. Quatre portées de brides SAE 1 po code 62 (1A, 1B, A, B) sous le
// bloc (brides : P246 rep. 74).
// Repère : origine au centre de la face arrière (face de fixation contre le
// support), +Z vers la face avant, Y vers le haut, X selon la longueur.
// Bloc 0.30 (X) × 0.17 (Y) × 0.18 (Z) m, d'après les portées de brides code
// 62 de la vue de dessous ; encombrement avec cartouches ≈ 0.32 × 0.27 × 0.23 m.
import { IN, MM } from './_engine.js';

export default function P260(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, at, group, merged, ring } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const BW = 0.3, BH = 0.17, BD = 0.18;

  // Pose d'un objet construit le long de +Y sur une face : n = normale sortante.
  const onFace = (obj, n, p) => {
    const g = group(obj);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n));
    g.position.set(...p);
    return g;
  };
  const F = {
    top: (x, z) => [[0, 1, 0], [x, BH / 2, z]],
    bot: (x, z) => [[0, -1, 0], [x, -BH / 2, z]],
    front: (x, y) => [[0, 0, 1], [x, y, BD]],
    left: (z, y) => [[-1, 0, 0], [-BW / 2, y, z]],
    right: (z, y) => [[1, 0, 0], [BW / 2, y, z]],
  };

  // ---------------------------------------------------------------- 1 — corps
  // Bloc à arêtes cassées, lamages usinés des cavités et des orifices,
  // portées de brides surfacées dessous, taraudages de fixation au dos,
  // marquage des orifices (pastilles) et plaque de repérage.
  const spots = [];
  const spot = (face, a, b, r) => {
    const [n, p] = F[face](a, b);
    spots.push(onFace(ring(r, r * 0.62, 0.0008, 'steel', { seg: 20 }), n, p.map((v, i) => v + n[i] * 0.0004)));
    spots.push(onFace(cyl(r * 0.62, 0.0006, 'darkSteel', { seg: 14 }), n, p.map((v, i) => v + n[i] * 0.0003)));
  };
  const flanges = [[-0.04, 0.13], [0.027, 0.13], [-0.04, 0.05], [0.027, 0.05]];
  const body = [box(BW, BH, BD, 'castIron', { r: 0.003, pos: [0, 0, BD / 2] })];
  const pads = [];
  for (const [x, z] of flanges) {
    pads.push(box(0.05, 0.0012, 0.072, 'steel', { pos: [x, -BH / 2 - 0.0006, z] }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) pads.push(cyl(0.0045, 0.0014, 'darkSteel', { seg: 10, pos: [x + sx * 0.0139, -BH / 2 - 0.0008, z + sz * 0.0286] }));
    pads.push(cyl(0.0125, 0.0014, 'darkSteel', { seg: 18, pos: [x, -BH / 2 - 0.0008, z] }));
  }
  for (const [x, y] of [[-0.11, 0.05], [0.11, 0.05], [-0.11, -0.05], [0.11, -0.05]]) {
    pads.push(at(cyl(0.0052, 0.0008, 'darkSteel', { axis: 'z', seg: 10 }), [x, y, -0.0003]));
  }
  // Plaque de repérage rivetée en façade.
  const tag = at(S.nameplate(0.06, 0.025), [-0.035, 0.065, BD + 0.0005]);
  P('1', group(merged(body, 'castIron'), merged(pads, 'steel'), tag), [0, 0, 0]);

  // ---------------------------------------------------------------- cartouches
  const hex = (af, h, y0, mat) => {
    const R = af / 2 / Math.cos(Math.PI / 6), c = Math.min(af * 0.06, h * 0.25);
    const m = lathe([[0, y0], [R, y0], [R, y0 + h - c], [R - c * 1.7, y0 + h], [0, y0 + h]], mat, { seg: 6 });
    m.children[0].rotation.y = Math.PI / 6;
    return m;
  };
  // Limiteur / réducteur de pression : six-pans de vissage, corps, contre-écrou,
  // vis de réglage et capuchon plastique.
  const relief = (af = 1.0 * IN) => group(
    merged([
      hex(af, 0.012, 0, 'zinc'),
      cyl(0.011, 0.028, 'zinc', { seg: 16, pos: [0, 0.026, 0] }),
      hex(0.019, 0.007, 0.04, 'zinc'),
      cyl(0.0045, 0.016, 'zinc', { seg: 10, pos: [0, 0.052, 0] }),
    ], 'zinc'),
    lathe([[0, 0.054], [0.0085, 0.054], [0.0085, 0.066], [0.006, 0.07], [0, 0.07]], 'plastic', { seg: 14 }),
  );
  // Élément logique : bouchon six-pans de grande cavité, épaulement, téton du pilote.
  const logic = (af = 1.25 * IN) => merged([
    hex(af, 0.013, 0.0005, 'zinc'),
    lathe([[0, 0], [af * 0.56, 0], [af * 0.56, 0.0008], [0, 0.0008]], 'zinc', { seg: 18 }),
    cyl(0.006, 0.006, 'zinc', { seg: 10, pos: [0, 0.016, 0] }),
  ], 'zinc');
  // Clapet / sélecteur : bouchon six-pans bas.
  const plugHex = (af) => merged([hex(af, 0.01, 0.0005, 'zinc'), lathe([[0, 0], [af * 0.55, 0], [af * 0.55, 0.0008], [0, 0.0008]], 'zinc', { seg: 16 })], 'zinc');
  // Valve d'équilibrage : six-pans, corps, vis de réglage et contre-écrou.
  const cbv = () => merged([
    hex(1.0 * IN, 0.012, 0, 'zinc'),
    cyl(0.0105, 0.02, 'zinc', { seg: 16, pos: [0, 0.022, 0] }),
    hex(0.016, 0.006, 0.032, 'zinc'),
    cyl(0.004, 0.014, 'zinc', { seg: 10, pos: [0, 0.042, 0] }),
  ], 'zinc');
  // Distributeur à électro-aimant : six-pans, tube polaire, bobine, écrou, connecteur DIN.
  const solenoid = () => group(
    merged([
      hex(0.875 * IN, 0.011, 0, 'zinc'),
      cyl(0.008, 0.06, 'zinc', { seg: 14, pos: [0, 0.04, 0] }),
      hex(0.014, 0.006, 0.07, 'zinc'),
    ], 'zinc'),
    merged([
      lathe([[0.0085, 0.014], [0.021, 0.014], [0.022, 0.016], [0.022, 0.064], [0.021, 0.066], [0.0085, 0.066]], 'black', { seg: 24 }),
      box(0.022, 0.03, 0.028, 'black', { r: 0.003, pos: [0.03, 0.04, 0] }),
      box(0.006, 0.02, 0.02, 'black', { r: 0.001, pos: [0.044, 0.04, 0] }),
    ], 'black'),
  );
  // Bouchon à six-pans creux et joint torique : collerette mince et empreinte.
  const plug = (r) => group(
    lathe([[r * 0.55, 0.0025], [r * 1.25, 0.0025], [r * 1.38, 0.0012], [r * 1.38, 0], [r * 0.55, 0]], 'zinc', { seg: 14 }),
    lathe([[0, -0.001], [r * 0.55, -0.001], [r * 0.55, 0.0025]], 'blackOxide', { seg: 6 }),
    S.torus(r * 1.15, r * 0.1, 'rubber', { pos: [0, 0.0003, 0] }),
  );

  const R4 = (7 / 16 * IN) / 2, R6 = (9 / 16 * IN) / 2, R8 = (3 / 4 * IN) / 2;
  const put = (ref, face, a, b, obj, sp, e) => {
    const [n, p] = F[face](a, b);
    if (sp) spot(face, a, b, sp);
    P(ref, onFace(obj, n, p), e ?? n.map((v) => v * 0.12));
  };

  // 2 — éléments logiques à ouverture pilotée, flancs ±X (bas).
  put('2', 'left', 0.06, -0.045, logic(), 0.021);
  put('2', 'right', 0.07, -0.045, logic(), 0.021);
  // 9 — élément logique à ouverture pilotée, flanc +X (haut, arrière).
  put('9', 'right', 0.035, 0.055, logic(1.0 * IN), 0.017);
  // 6 — éléments logiques à fermeture pilotée, façade.
  put('6', 'front', -0.042, -0.035, logic(), 0.021);
  put('6', 'front', 0.03, -0.035, logic(), 0.021);
  // 7 — clapet, 8 — sélecteur de circuit, façade.
  put('7', 'front', -0.006, -0.008, plugHex(0.875 * IN), 0.015);
  put('8', 'front', 0.105, 0.05, plugHex(0.75 * IN), 0.013);
  // 13 — valves d'équilibrage CBCV-1 / CBCV-2, façade.
  put('13', 'front', -0.092, 0.0, cbv(), 0.017);
  put('13', 'front', 0.075, 0.0, cbv(), 0.017);
  // 4 — limiteurs, 5 — réducteur de pression, dessus.
  put('4', 'top', -0.07, 0.05, relief(), 0.017);
  put('4', 'top', 0.07, 0.1, relief(), 0.017);
  put('5', 'top', 0.0, 0.11, relief(0.875 * IN), 0.016);
  // 3 — distributeur à électro-aimant, dessus à l'angle avant gauche.
  put('3', 'top', -0.115, 0.15, solenoid(), 0.015, [-0.05, 0.12, 0.05]);

  // 10 — bouchons SAE-8 (dessus arrière droit, flanc −X).
  put('10', 'top', 0.085, 0.03, plug(R8));
  put('10', 'top', 0.11, 0.055, plug(R8));
  put('10', 'left', 0.125, 0.04, plug(R8));
  put('10', 'left', 0.03, 0.05, plug(R8));
  // 11 — bouchons SAE-6 (quatorze).
  for (const [face, a, b] of [
    ['top', -0.09, 0.085],
    ['front', -0.125, 0.04], ['front', -0.095, 0.05], ['front', -0.05, 0.045], ['front', 0.115, 0.02], ['front', 0.12, -0.05],
    ['left', 0.02, 0.0], ['left', 0.1, 0.06], ['left', 0.15, 0.025],
    ['right', 0.12, 0.06], ['right', 0.15, 0.03], ['right', 0.02, 0.0],
    ['bot', -0.12, 0.09], ['bot', 0.11, 0.09],
  ]) put('11', face, a, b, plug(R6));
  // 12 — bouchons SAE-4 (dix).
  for (const [face, a, b] of [
    ['top', -0.06, 0.155], ['top', -0.03, 0.16], ['top', 0.0, 0.16], ['top', 0.03, 0.155],
    ['front', -0.13, 0.07], ['front', -0.06, 0.07],
    ['bot', -0.13, 0.04], ['bot', 0.13, 0.04],
    ['right', 0.1, -0.02], ['left', 0.105, -0.075],
  ]) put('12', face, a, b, plug(R4));

  return { view: { dir: [0.9, 0.8, 1.2] } };
}
void MM;
