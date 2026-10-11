// P324 — Vanne 3 voies d'eau : CX036954 rév. 0 « ASSY, WATER 3-WAY VALVE »
// (page 324), repère 28 de P186. Vanne à boisseau sphérique 3 voies 1/2 NPT
// (1) suspendue sous l'aile haute de son support en C (2, tôle 1/4 po pliée,
// grand trou de l'écrou de panneau), levier au-dessus ; support fixé par deux
// vis H 1/2-13 × 1 1/2 po (7) à rondelles (8) au travers de son aile basse.
// Raccords (vue assemblée du bas de la page) : orifice -X → coude de
// tuyauterie 90° FNPT-MNPT 1/2 (6) ouvert vers le bas, coude 90° NPT 1/2 →
// JIC -06 (5) vers -X « TO PRESSURE WASH HOSE REEL » ; orifice du bas → coude
// 90° NPT 1/2 → JIC -08 (4) vers +Z « TO WATER PUMP » ; orifice +X → coude 45°
// NPT 1/2 → JIC -08 (3) vers le bas « TO ON/OFF PIPING CHECK VALVE ».
// Repère : origine au centre de la face inférieure de l'aile basse du support
// (face d'appui sur le châssis), Y vers le haut, âme du support à l'arrière
// (-Z), ailes vers +Z, X selon les orifices latéraux de la vanne.
// Support 150 (X) × 130 (Y) × 100 (Z) mm d'après les proportions du dessin.
// Encombrement ≈ 0.22 × 0.21 × 0.12 m.
import { IN, ballValve3, nptFitting, orient, orientPoint } from './_chassis.js';

export default function P324(api) {
  const { S, THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = 0.25 * IN, W = 0.15, H = 0.13, D = 0.1;
  const zc = -D / 2 + 0.055; // axe de la vanne et des vis

  // 2 — support en C : âme à -Z, ailes haute et basse vers +Z, plis R = T.
  const R = T * 1.5;
  const zb = -D / 2;
  const arcPts = (cz, cy, r, a0, a1, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cz + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // Trous : écrou de panneau (aile haute) et vis (aile basse) — perçages vrais.
  const top = S.plate(W, D - R, T, 'grey', { holes: [[0, zc - (R / 2), 0.0165]] });
  top.position.set(0, H - T / 2, R / 2);
  const bot = S.plate(W, D - R, T, 'grey', { holes: [[-0.05, zc - R / 2, 0.0071], [0.05, zc - R / 2, 0.0071]] });
  bot.position.set(0, T / 2, R / 2);
  // Âme et plis (profil extrudé limité aux plis et à l'âme).
  const web = S.extrude([...arcPts(zb + R, R, R, -Math.PI / 2, -Math.PI), ...arcPts(zb + R, H - R, R, Math.PI, Math.PI / 2),
    ...arcPts(zb + R, H - R, R - T, Math.PI / 2, Math.PI), ...arcPts(zb + R, R, R - T, -Math.PI, -Math.PI / 2)], W, 'grey');
  web.rotation.y = -Math.PI / 2;
  P('2', S.merged([top, bot, web], 'grey'), [0, 0, -0.08]);

  // 1 — vanne 3 voies, centre 42 mm sous l'aile haute ; écrou de panneau sur l'aile.
  const yv = H - T - 0.042;
  const v = ballValve3(api, 8, { stem: 0.042 - 0.024 + T + 0.012 });
  v.obj.add(S.nut(0.036, 0.008, 'brass', { pos: [0, 0.042 + T + 0.004, 0] }));
  P('1', S.at(v.obj, [0, yv, zc]), [0, 0.1, 0]);
  const vp = (k) => v.ports[k].map((c, i) => c + [0, yv, zc][i]);

  // Raccords : construits selon +Y (queue NPT sous y = 0), orientés vers la sortie.
  const put = (ref, f, pos, dir, side, e) => P(ref, orient(api, f.obj, pos, dir, side), e);
  const f6 = nptFitting(api, { npt: 8, angle: 90, end: 'fnpt' });
  put('6', f6, vp('-x'), [-1, 0, 0], [0, -1, 0], [-0.05, 0, 0]);
  const o6 = orientPoint(api, f6.out, vp('-x'), [-1, 0, 0], [0, -1, 0]);
  const f5 = nptFitting(api, { npt: 8, jic: 6, angle: 90 });
  put('5', f5, o6, [0, -1, 0], [-1, 0, 0], [-0.07, -0.04, 0]);
  const f4 = nptFitting(api, { npt: 8, jic: 8, angle: 90 });
  put('4', f4, vp('-y'), [0, -1, 0], [0, 0, 1], [0, -0.03, 0.06]);
  const f3 = nptFitting(api, { npt: 8, jic: 8, angle: 45 });
  put('3', f3, vp('+x'), [1, 0, 0], [0, -1, 0], [0.06, 0, 0]);

  // 7, 8 — vis H 1/2 × 1 1/2 po et rondelles, têtes sur l'aile basse.
  for (const x of [-0.05, 0.05]) {
    P('8', S.at(S.washer(0.53 * IN, 0.27 * IN, 0.1 * IN, 'zinc'), [x, T + 0.05 * IN, zc]), [0, 0.05, 0]);
    P('7', S.bolt(0.5 * IN, 1.5 * IN, 'zinc', { pos: [x, T + 0.1 * IN, zc] }), [0, 0.09, 0]);
  }
  void THREE;
  return { view: { dir: [0.9, 0.7, 1.1] } };
}
