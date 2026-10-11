// P204 — Bloc de vannes du système d'avance : CX026130 rév. 0 « FEED SYSTEM
// VALVE ASSY-HH-W/DSL » (pages 204 et 206), repère 7 de P186. Platine
// mécano-soudée (8) : plaque verticale percée de trois trous de fixation en
// haut et nervure perpendiculaire soudée côté avant. Sur la nervure, côté
// gauche : sélecteur de pilotage (3, sur cale 7, vis 3 po 15) et verrouillage
// de retenue (3, vis 1 1/2 po 13) ; côté droit : sélecteur load sense (3, vis
// 13). Derrière la plaque : inversion de forage (3, vis 1 3/4 po 14). Devant
// la plaque : à gauche le verrouillage de descente rapide (2, distributeur à
// électroaimant, vis 14), au centre la navette (4) puis, sur la cale 6, les
// deux limiteurs de pression de descente et de retenue (1, cartouches
// pendantes) liés par deux vis 5 po (16) qui traversent les deux blocs, à
// droite le sélecteur 3 voies (5, bobine ronde, vis 14). Rondelles (17) sous
// les 14 têtes de vis. Raccords -06 : coudes MORB-MJIC (10, ×13) sur les
// orifices 2 / 3 des électrovannes, du distributeur 2 et du sélecteur 5,
// adaptateurs droits (12, ×7) sur les orifices 1 et sur la navette, coudes
// MORB -08 → JIC -06 (11, ×4) sur les limiteurs, deux tés tournants (9) en
// chaîne devant les limiteurs (feuille 206 : schéma et désignations).
// Repère : origine au milieu du bord inférieur de la face avant de la plaque,
// Y vers le haut, X le long de la plaque (sélecteur 5 vers +X), +Z vers
// l'avant (côté nervure). Encombrement ≈ 0.56 (X) × 0.30 (Y) × 0.40 (Z) m.
// Cotes des corps de vannes estimées d'après les proportions des vues
// isométriques (vis 1/4-20 de la liste pour l'échelle).
import { IN, orbAdapter, orbElbow, jicTee, orient } from './_chassis.js';

export default function P204(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Repère local d'une vanne : origine sur la face d'appui, +Z sortant, +Y vers le haut.
  const frame = (o, n, up = [0, 1, 0]) => {
    const Z = new THREE.Vector3(...n).normalize();
    const Y = new THREE.Vector3(...up).normalize();
    const X = new THREE.Vector3().crossVectors(Y, Z);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    const O = new THREE.Vector3(...o);
    return {
      put: (obj) => { const g = S.group(obj); g.quaternion.copy(q); g.position.copy(O); return g; },
      v: (v) => new THREE.Vector3(...v).applyQuaternion(q).toArray(),
      p: (p) => new THREE.Vector3(...p).applyQuaternion(q).add(O).toArray(),
    };
  };
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);

  // ---------------------------------------------------------------- 8 — platine
  const T = 0.375 * IN;
  const L = 0.56, H = 0.23;
  const XF = -0.07, FD = 0.2; // nervure : position (X), saillie (Z)
  const plate = S.extrude([[-L / 2, 0], [L / 2, 0], [L / 2, H], [-L / 2, H]], T, 'grey', {
    holes: [-0.2, 0.0, 0.2].map((x) => [x, H - 0.022, (0.53 * IN) / 2]),
  });
  plate.position.z = -T / 2;
  const fin = S.extrude([[0, 0], [FD - 0.025, 0], [FD, 0.025], [FD, H - 0.04], [FD - 0.04, H], [0, H]], T, 'grey');
  fin.rotation.y = -Math.PI / 2;
  fin.position.x = XF;
  const fw = S.merged([-1, 1].map((s) => S.weld([[XF + s * (T / 2 + 0.002), 0.004, 0.002], [XF + s * (T / 2 + 0.002), H - 0.004, 0.002]], 0.006, 'grey')), 'grey');
  fw.geometry.userData.edgeAngle = 75;
  P('8', S.group(S.merged([plate, fin], 'grey'), fw), [0, 0, -0.12]);

  // ---------------------------------------------------------------- corps de vannes
  const body = (w, h, d, mat = 'castAlu') => S.box(w, h, d, mat, { r: 0.0015, pos: [0, h / 2, d / 2] });
  // Bobine carrée (connecteur DIN en façade +Z, écrou de bobine dessus), tube de culasse.
  const squareCoil = (y0, d) => {
    const c = 0.04;
    return S.group(
      S.cyl(0.009, 0.008, 'zinc', { seg: 16, pos: [0, y0 + 0.004, d / 2] }),
      S.box(c, c, c, 'black', { r: 0.003, pos: [0, y0 + 0.008 + c / 2, d / 2] }),
      S.box(0.03, 0.03, 0.016, 'black', { r: 0.002, pos: [0, y0 + 0.008 + c / 2, d / 2 + c / 2 + 0.008] }),
      S.ring(0.009, 0.0065, 0.004, 'charcoal', { axis: 'z', seg: 4, pos: [0, y0 + 0.008 + c / 2, d / 2 + c / 2 + 0.017] }),
      S.nut(0.022, 0.009, 'zinc', { pos: [0, y0 + 0.008 + c + 0.0045, d / 2] }),
    );
  };
  // Électrovanne 3 voies à cartouche (3) : corps 1 3/4 × 2 1/4 × 1 3/4 po.
  const V3 = { w: 1.75 * IN, h: 2.25 * IN, d: 1.75 * IN };
  const valve3 = () => S.group(body(V3.w, V3.h, V3.d), squareCoil(V3.h, V3.d));
  // Distributeur à électroaimant (2) : corps 2 × 2 1/2 × 2 po.
  const V2 = { w: 2 * IN, h: 2.5 * IN, d: 2 * IN };
  const valve2 = () => S.group(body(V2.w, V2.h, V2.d), squareCoil(V2.h, V2.d));
  // Sélecteur 3 voies (5) : bobine ronde sur tube, connecteur latéral.
  const V5 = { w: 1.75 * IN, h: 2.0 * IN, d: 1.75 * IN };
  const valve5 = () => S.group(
    body(V5.w, V5.h, V5.d),
    S.cyl(0.019, 0.05, 'black', { seg: 28, pos: [0, V5.h + 0.03, V5.d / 2] }),
    S.cyl(0.01, 0.006, 'zinc', { seg: 16, pos: [0, V5.h + 0.003, V5.d / 2] }),
    S.lathe([[0, 0], [0.012, 0], [0.012, 0.008], [0.004, 0.01], [0, 0.01]], 'zinc', { seg: 18, pos: [0, V5.h + 0.055, V5.d / 2] }),
    S.box(0.03, 0.03, 0.02, 'black', { r: 0.002, pos: [0.026, V5.h + 0.03, V5.d / 2] }),
  );

  // Vis 1/4-20 (13 / 14 / 15 / 16) et rondelles (17) : tête sur la face libre, tige vers -Z local.
  const Q = 0.25 * IN;
  const screw = (fr, ref, len, p, ex) => {
    const wt = 0.065 * IN;
    P('17', fr.put(S.washer(0.3125 * IN, 0.14 * IN, wt, 'zinc', { axis: 'z', pos: [p[0], p[1], p[2] + wt / 2] })), add(ex, fr.v([0, 0, 1]), 0.05));
    P(ref, fr.put(S.bolt(Q, len, 'zinc', { axis: 'z', pos: [p[0], p[1], p[2] + wt] })), add(ex, fr.v([0, 0, 1]), 0.1));
  };

  // Raccords : coude (10 / 11) ou droit (12) sur un orifice ; dir = normale, side = sortie du coude.
  const elbow = (ref, orb, jic, pos, dir, side, ex) => P(ref, orient(api, orbElbow(api, orb, jic).obj, pos, dir, side), add(ex, dir, 0.06));
  const straight = (ref, pos, dir, ex) => P(ref, orient(api, orbAdapter(api, 6, 6).obj, pos, dir), add(ex, dir, 0.06));

  // Électrovanne 3 complète sur un repère : corps, vis, raccords des orifices 1 / 2 / 3.
  const mount3 = (fr, ref, spacer, ex) => {
    const base = spacer ? 0.75 * IN : 0;
    const exV = fr.v([0, 0, 0.1]);
    if (spacer) P(spacer, fr.put(S.box(V3.w + 0.006, V3.h - 0.004, base, 'grey', { r: 0.001, pos: [0, V3.h / 2, base / 2] })), fr.v([0, 0, 0.05]));
    P('3', fr.put(S.at(valve3(), [0, 0, base])), add(ex, exV));
    const len = spacer ? 3 * IN : 1.5 * IN;
    for (const [x, y] of [[-V3.w / 2 + 0.007, V3.h - 0.008], [V3.w / 2 - 0.007, 0.008]]) screw(fr, ref, len, [x, y, base + V3.d], add(ex, exV));
    const y1 = 0.02;
    straight('12', fr.p([0, 0, base + V3.d / 2]), fr.v([0, -1, 0]), add(ex, exV));
    elbow('10', 6, 6, fr.p([V3.w / 2, y1 + 0.012, base + V3.d / 2]), fr.v([1, 0, 0]), fr.v([0, -1, 0]), add(ex, exV));
    elbow('10', 6, 6, fr.p([-V3.w / 2, y1 + 0.03, base + V3.d / 2]), fr.v([-1, 0, 0]), fr.v([0, -1, 0]), add(ex, exV));
  };

  // Nervure, face -X : sélecteur de pilotage sur cale 7 (vis 15) et verrouillage de retenue (vis 13).
  mount3(frame([XF - T / 2, 0.03, 0.05], [-1, 0, 0]), '15', '7', [-0.05, 0, 0]);
  mount3(frame([XF - T / 2, 0.03, 0.15], [-1, 0, 0]), '13', null, [-0.02, 0, 0.06]);
  // Nervure, face +X : sélecteur load sense (vis 13).
  mount3(frame([XF + T / 2, 0.06, 0.12], [1, 0, 0]), '13', null, [0, 0, 0.05]);
  // Dos de la plaque : inversion de forage (vis 14).
  mount3(frame([-0.19, 0.1, -T], [0, 0, -1]), '14', null, [0, 0, 0]);

  // Devant, à gauche : distributeur 2 (vis 14), orifices bas (12) et latéraux (10).
  {
    const fr = frame([-0.215, 0.025, 0], [0, 0, 1]);
    const exV = fr.v([0, 0, 0.12]);
    P('2', fr.put(valve2()), exV);
    for (const [x, y] of [[-V2.w / 2 + 0.008, 0.01], [V2.w / 2 - 0.008, V2.h - 0.01]]) screw(fr, '14', 1.75 * IN, [x, y, V2.d], exV);
    straight('12', fr.p([-0.008, 0, V2.d / 2]), fr.v([0, -1, 0]), exV);
    elbow('10', 6, 6, fr.p([0.014, 0, V2.d / 2]), fr.v([0, -1, 0]), fr.v([0, 0, 1]), exV);
    elbow('10', 6, 6, fr.p([V2.w / 2, 0.025, V2.d / 2]), fr.v([1, 0, 0]), fr.v([0, -1, 0]), exV);
  }

  // Centre : navette 4 (bloc 1 1/2 × 2 × 2 po, bouchon six-pans dessus, deux adaptateurs droits côté -X).
  {
    const sx = -0.03, sy = 0.15;
    const w = 1.5 * IN, h = 2 * IN, d = 2 * IN;
    const fr = frame([sx, sy, 0], [0, 0, 1]);
    const exV = [0, 0.12, 0.08];
    P('4', fr.put(S.group(body(w, h, d, 'steel'), S.nut(0.028, 0.012, 'zinc', { pos: [0, h + 0.006, d * 0.55] }), S.cyl(0.015, 0.003, 'zinc', { seg: 20, pos: [0, h + 0.0015, d * 0.55] }))), exV);
    straight('12', fr.p([-w / 2, h * 0.3, d * 0.35]), [-1, 0, 0], exV);
    straight('12', fr.p([-w / 2, h * 0.72, d * 0.7]), [-1, 0, 0], exV);
  }

  // Limiteurs de pression 1 sur la cale 6 : blocs 2 1/2 po, cartouches pendantes.
  const RB = 2.5 * IN, C6 = 1.0 * IN;
  const rx = [0.012 + RB / 2, 0.012 + RB * 1.5 + 0.002];
  const ry = 0.13;
  P('6', S.box(2 * RB + 0.012, RB + 0.006, C6, 'grey', { r: 0.0015, pos: [(rx[0] + rx[1]) / 2, ry + RB / 2, C6 / 2] }), [0, 0, 0.06]);
  const relief = () => S.group(
    S.box(RB, RB, RB, 'steel', { r: 0.0015, pos: [0, RB / 2, 0] }),
    // Cartouche : six-pans 1 1/4 po, corps Ø 1 1/2 po × 4 po, contre-écrou et vis de réglage.
    S.merged([
      S.nut(1.25 * IN, 0.012, 'zinc', { pos: [0, -0.006, 0] }),
      S.cyl(0.019, 0.1, 'zinc', { seg: 28, pos: [0, -0.012 - 0.05, 0] }),
      S.lathe([[0, -0.112], [0.019, -0.112], [0.016, -0.118], [0, -0.118]], 'zinc', { seg: 24 }),
      S.nut(0.019, 0.007, 'zinc', { pos: [0, -0.122, 0] }),
      S.cyl(0.0065, 0.03, 'zinc', { seg: 14, pos: [0, -0.14, 0] }),
    ], 'zinc'),
  );
  rx.forEach((x, i) => {
    const z = C6 + RB / 2;
    const exV = [0, -0.05 - i * 0.02, 0.2];
    P('1', S.at(relief(), [x, ry, z]), exV);
    // Coudes -08 → -06 : un sur le dessus, un en façade (vers le bas).
    elbow('11', 8, 6, [x, ry + RB, z], [0, 1, 0], i ? [0, 0, 1] : [-1, 0, 0], exV);
    elbow('11', 8, 6, [x, ry + RB * 0.45, z + RB / 2], [0, 0, 1], [0, -1, 0], exV);
  });
  // Vis 16 traversant les deux blocs selon X (têtes côté -X), rondelles 17.
  for (const [y, z] of [[ry + RB * 0.82, C6 + RB * 0.2], [ry + RB * 0.18, C6 + RB * 0.8]]) {
    screw(frame([rx[0] - RB / 2, y, z], [-1, 0, 0], [0, 1, 0]), '16', 5 * IN, [0, 0, 0], [-0.02, 0, 0.2]);
  }
  // Tés tournants 9 en chaîne sous le coude façade du premier limiteur.
  {
    const e1 = orbElbow(api, 8, 6);
    const x = rx[0], z = C6 + RB / 2 + RB / 2;
    const tip = [x, ry + RB * 0.45 - e1.out[2], z + e1.out[1]];
    const tee = jicTee(api, 6);
    const teeObj = () => S.group(tee.obj, S.nut((0.6875 + 0.0625) * IN, 0.016, 'zinc', { pos: [0, -tee.reach + 0.006, 0] }));
    // Premier té : passage vertical, écrou tournant en haut sur le coude.
    const t1 = [tip[0], tip[1] - tee.reach - 0.004, tip[2]];
    P('9', orient(api, teeObj(), t1, [0, -1, 0], [1, 0, 0]), [0.04, -0.12, 0.25]);
    const t2 = [t1[0] + tee.reach * 2 + 0.006, t1[1], t1[2]];
    P('9', orient(api, teeObj(), t2, [1, 0, 0], [0, 0, 1]), [0.08, -0.14, 0.25]);
  }

  // Droite : sélecteur 5 (vis 14), coudes 10 ×3.
  {
    const fr = frame([0.22, 0.1, 0], [0, 0, 1]);
    const exV = fr.v([0, 0.05, 0.12]);
    P('5', fr.put(valve5()), exV);
    for (const [x, y] of [[-V5.w / 2 + 0.007, 0.008], [V5.w / 2 - 0.007, V5.h - 0.008]]) screw(fr, '14', 1.75 * IN, [x, y, V5.d], exV);
    elbow('10', 6, 6, fr.p([-V5.w / 2, 0.02, V5.d / 2]), [-1, 0, 0], [0, -1, 0], exV);
    elbow('10', 6, 6, fr.p([V5.w / 2, 0.016, V5.d / 2]), [1, 0, 0], [0, -1, 0], exV);
    elbow('10', 6, 6, fr.p([0, 0, V5.d / 2]), [0, -1, 0], [0, 0, 1], exV);
  }

  return { view: { dir: [0.55, 0.6, 1.1] } };
}
