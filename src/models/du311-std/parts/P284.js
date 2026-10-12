// P284 — Collecteur d'huile hydraulique 10 gal CX010054 rév. 6 (page 284) :
// « HYD. OIL MANIFOLD, 10 GAL », repère 24 de la cabine P278 : bâche
// secondaire (réservoir arrière) qui reçoit les drains et l'aspiration des
// pompes du moteur diesel. Caisson soudé (4) en tôle de 3/16 po, cadre de
// bride de 1/2 po sur le bout +X, fermé par le couvercle (5) sur joint (3) :
// 24 vis H 3/8-16 × 1 filetées sur toute la longueur (17) et rondelles
// Grower (18), bouchon fraisé 1 po NPT (16) au centre du couvercle.
// Dessus : brides SAE code 61 de 1 po (13, adaptateur droit 9 vers JIC -16 :
// alimentation de la pompe du ventilateur), 1 1/4 po (14, coude 45° 10 :
// pompe de gavage hydrostatique) et 2 po (15, coude d'aspiration 2 po 2 :
// pompe 60 cm³), drain du moteur hydrostatique #16 (8) et réserve #16
// bouchée (12). Face +Z, rangée haute : quatre adaptateurs #16 (8 : liaison
// au réservoir principal, retour du filtre, drains des pompes hydrostatique
// et 60 cm³) ; rangée basse : sonde de niveau et de température 1 1/4 NPT
// (1), drain de l'accumulateur de frein #12 (7), désaération #6 (6) et
// réserve #12 bouchée (11). Dessous : vidange #16 bouchée (12). Quatre
// pattes de fixation percées (haut et bas, aux deux bouts).
// Repère : origine au centre du dessous du caisson, X selon la longueur
// (couvercle vers +X), Y vers le haut, Z en travers (orifices vers +Z).
// Caisson 0.60 × 0.35 × 0.18 m (≈ 37,8 L = 10 gal US) d'après les
// proportions des vues de face, de dessus et de côté de la page 284 ;
// encombrement 0.66 × 0.50 × 0.30 m.
import { u, cabHw, MANIF } from './_cab.js';
import { splitFlange, flangeHead, orbAdapter, orbPlug, j518 } from '../../du311/parts/_chassis.js';

export default function P284(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, weld, cyl } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { L, H, D } = MANIF;
  const t = u(0.1875);
  const FL = { w: 0.25, h: 0.42, t: u(0.5) }; // cadre de bride (Z × Y × X)
  const xF = L / 2; // face du caisson côté couvercle

  // ---------------------------------------------------------------- 4 — caisson soudé
  const shellParts = [
    box(L, H, D, 'lightGrey', { r: 0.004, pos: [0, H / 2, 0] }),
    // Cadre de bride (1/2 po) autour de l'ouverture +X.
    box(FL.t, FL.h, FL.w, 'lightGrey', { r: 0.003, pos: [xF + FL.t / 2, H / 2, 0] }),
    // Bout −X : tôle débordante (bord tombé).
    box(t * 2, H + 0.012, D + 0.012, 'lightGrey', { r: 0.002, pos: [-L / 2 - t, H / 2, 0] }),
    // Face −Z : disque de renfort (bossage de nettoyage), Ø 130.
    at(cyl(0.065, 0.006, 'lightGrey', { axis: 'z', seg: 40 }), [-0.03, H * 0.52, -D / 2 - 0.003]),
  ];
  // Pattes de fixation (plat 2 × 1/4 po) au haut et au bas, aux deux bouts, dans le plan −Z.
  const tabs = [];
  for (const x of [-L / 2 + 0.07, L / 2 - 0.09]) for (const [y, s] of [[H, 1], [0, -1]]) {
    tabs.push([x, y + s * 0.022, -D / 2 + 0.004]);
    shellParts.push(H_.K.plate(0.05, 0.045, u(0.25), 'lightGrey', { holes: [[0, 0.005 * s, 0.0055]], r: 0.012 }));
    const tb = shellParts[shellParts.length - 1];
    tb.rotation.x = Math.PI / 2;
    tb.position.set(x, y + s * 0.022, -D / 2 + 0.004);
  }
  // Bossages soudés des orifices (anneaux) : dessus, face +Z, dessous.
  const topPorts = { spare: -0.2, motor: -0.13, fan: -0.04, charge: 0.05, suction: 0.17 };
  const faceHi = [-0.17, -0.06, 0.05, 0.16];
  const faceLo = { level: -0.19, acc: -0.08, deair: 0.0, spare: 0.09 };
  const yHi = 0.25, yLo = 0.11;
  const boss = (r, h, pos, axis) => at(cyl(r, h, 'lightGrey', { axis, seg: 24 }), pos);
  for (const k of ['spare', 'motor']) shellParts.push(boss(0.022, 0.008, [topPorts[k], H + 0.004, 0], 'y'));
  for (const [k, dash] of [['fan', 16], ['charge', 20], ['suction', 32]]) {
    const f = j518(dash);
    shellParts.push(box(f.L + f.d * 2.4, 0.012, f.W + f.d * 2.4, 'lightGrey', { r: 0.003, pos: [topPorts[k], H + 0.006, 0] }));
  }
  for (const x of faceHi) shellParts.push(boss(0.022, 0.008, [x, yHi, D / 2 + 0.004], 'z'));
  for (const [k, r] of [['level', 0.028], ['acc', 0.019], ['deair', 0.013], ['spare', 0.019]]) shellParts.push(boss(r, 0.008, [faceLo[k], yLo, D / 2 + 0.004], 'z'));
  shellParts.push(boss(0.022, 0.008, [0.05, -0.004, 0], 'y'));
  const beads = merged([
    weld([[xF, 0.002, -D / 2 - 0.001], [xF, H - 0.002, -D / 2 - 0.001]], 0.006, 'lightGrey'),
    weld([[xF, 0.002, D / 2 + 0.001], [xF, H - 0.002, D / 2 + 0.001]], 0.006, 'lightGrey'),
    weld([[xF, H + 0.001, -D / 2], [xF, H + 0.001, D / 2]], 0.006, 'lightGrey'),
    weld([[-L / 2, H + 0.001, -D / 2], [-L / 2, H + 0.001, D / 2]], 0.006, 'lightGrey'),
  ], 'lightGrey');
  // Taraudages 3/8-16 du cadre (amorces sombres).
  const boltPts = [];
  const zs = FL.w / 2 - 0.016, ys = FL.h / 2 - 0.016;
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) boltPts.push([H / 2 - ys + (i * 2 * ys) / 7, s * zs]);
  for (let i = 1; i <= 4; i++) for (const s of [-1, 1]) boltPts.push([H / 2 + s * ys, -zs + (i * 2 * zs) / 5]);
  const taps = merged(boltPts.map(([y, z]) => at(lathe([[u(0.19), 0], [0, 0]], 'blackOxide', { seg: 8 }), [xF + FL.t + 0.0003, y, z], [0, 0, -Math.PI / 2])), 'blackOxide');
  P('4', group(merged(shellParts, 'lightGrey'), beads, taps), [0, 0, 0]);

  // ---------------------------------------------------------------- 3 — joint ; 5 — couvercle ; 16 — bouchon
  const xg = xF + FL.t;
  const tg = u(0.0625), tc = u(0.375);
  const plateYZ = (th, mat, holes, cut) => {
    const m = H_.K.plate(FL.h, FL.w, th, mat, { holes, cutouts: cut, r: 0.012, seg: 6 });
    m.rotation.z = Math.PI / 2; // plaque XZ → plan YZ (épaisseur selon X)
    return m;
  };
  const holesYZ = boltPts.map(([y, z]) => [y - H / 2, z, u(0.21)]);
  const gk = plateYZ(tg, 'rubber', holesYZ, [[0, 0, FL.h - 0.07, FL.w - 0.07]]);
  gk.position.set(xg + tg / 2, H / 2, 0);
  P('3', gk, [0.06, 0, 0]);
  const cv = plateYZ(tc, 'lightGrey', [...holesYZ, [0, 0, u(0.65)]], []);
  cv.position.set(xg + tg + tc / 2, H / 2, 0);
  const xc = xg + tg + tc; // face extérieure du couvercle
  const cvBoss = at(cyl(0.03, 0.012, 'lightGrey', { axis: 'x', seg: 28 }), [xc + 0.006, H / 2, 0]);
  P('5', group(cv, cvBoss), [0.12, 0, 0]);
  // 16 — bouchon fraisé 1 po NPT à six-pans creux, affleurant au bossage.
  const plug = group(
    lathe([[u(0.32), 0.0004], [u(0.66), 0.0004], [u(0.62), -0.004], [u(0.32), -0.004]], 'blackCast', { seg: 20 }),
    lathe([[0, -0.006], [u(0.32), -0.006], [u(0.32), 0.0004], [0, 0.0004]], 'blackCast', { seg: 6 }),
  );
  plug.rotation.z = -Math.PI / 2;
  plug.position.set(xc + 0.012, H / 2, 0);
  P('16', plug, [0.2, 0, 0]);

  // ---------------------------------------------------------------- 17 — vis 3/8 × 1 ; 18 — rondelles Grower
  const wt = H_.wT(0.375, 'split');
  for (const [y, z] of boltPts) {
    P('18', H_.washer(0.375, [xc, y, z], [1, 0, 0], 'split'), [0.18, 0, 0]);
    P('17', H_.bolt(0.375, 1.0, [xc + wt, y, z], [1, 0, 0], { light: true }), [0.24, 0, 0]);
  }

  // ---------------------------------------------------------------- dessus : brides code 61 et raccords
  const yT = H + 0.012;
  // 13 / 9 — bride 1 po et adaptateur droit FL61 → JIC -16.
  const sf13 = splitFlange(api, 16, 61);
  P('13', at(sf13.obj, [topPorts.fan, yT, 0]), [0, 0.12, 0]);
  const f16 = j518(16);
  const ad9 = group(flangeHead(api, 16, 61, 0.016, 'zinc'),
    merged([H_.R.hexY(u(1.5), f16.hc + 0.016, u(0.55)), H_.R.jicNose(1 + 5 / 16, f16.hc + 0.016 + u(0.55))], 'zinc'));
  P('9', at(ad9, [topPorts.fan, yT, 0]), [0, 0.2, 0]);
  // 14 / 10 — bride 1 1/4 po et coude 45° FL61 → JIC -20.
  P('14', at(splitFlange(api, 20, 61).obj, [topPorts.charge, yT, 0]), [0, 0.12, 0]);
  const f20 = j518(20);
  const el45 = group(flangeHead(api, 20, 61, 0.01, 'zinc'));
  const bend = S.group(
    lathe([[0, 0], [f20.rn, 0], [f20.rn, 0.03], [0, 0.03]], 'zinc', { seg: 18 }),
    merged([H_.R.hexY(u(1.875), 0.03, u(0.5)), H_.R.jicNose(1 + 5 / 8, 0.03 + u(0.5))], 'zinc'),
  );
  bend.rotation.z = -Math.PI / 4;
  bend.position.y = f20.hc + 0.01;
  el45.add(bend, at(S.ball(f20.rn, 'zinc'), [0, f20.hc + 0.01, 0]));
  P('10', at(el45, [topPorts.charge, yT, 0], [0, Math.PI / 2, 0]), [0, 0.2, 0.05]);
  // 15 / 2 — bride 2 po et coude d'aspiration 2 po (90°, embout cannelé pour boyau 2 po).
  P('15', at(splitFlange(api, 32, 61).obj, [topPorts.suction, yT, 0]), [0, 0.12, 0]);
  const f32 = j518(32);
  const r2 = u(2.375) / 2;
  const elb = group(
    flangeHead(api, 32, 61, 0.012, 'zinc'),
    S.tube([[0, f32.hc + 0.01, 0], [0, f32.hc + 0.045, 0], [0, f32.hc + 0.07, 0.012], [0, f32.hc + 0.082, 0.04], [0, f32.hc + 0.084, 0.06]], r2, 'zinc', { seg: 18, radial: 18, ends: 'none' }),
    at(lathe([[r2 * 0.8, 0], [r2 * 1.04, 0], [r2 * 1.06, 0.01], [r2 * 0.98, 0.014], [r2 * 1.06, 0.026], [r2 * 0.98, 0.03], [r2 * 1.06, 0.042], [r2 * 0.95, 0.05], [r2 * 0.8, 0.05]], 'zinc', { seg: 20 }), [0, f32.hc + 0.084, 0.06], [Math.PI / 2, 0, 0]),
  );
  P('2', at(elb, [topPorts.suction, yT, 0]), [0, 0.22, 0.08]);
  // 8 — drain du moteur hydrostatique (#16) sur le dessus.
  const yTB = H + 0.008;
  P('8', at(orbAdapter(api, 16, 16).obj, [topPorts.motor, yTB, 0]), [0, 0.14, 0]);
  // 12 — réserve #16 bouchée (dessus) et vidange #16 (dessous).
  P('12', at(orbPlug(api, u(1.5)), [topPorts.spare, yTB, 0]), [0, 0.12, 0]);
  P('12', at(orbPlug(api, u(1.5)), [0.05, -0.008, 0], [Math.PI, 0, 0]), [0, -0.12, 0]);

  // ---------------------------------------------------------------- face +Z
  const zF = D / 2 + 0.008;
  const onFace = (obj) => { const g = group(obj); g.rotation.x = Math.PI / 2; return g; }; // +Y local → +Z
  for (const x of faceHi) P('8', at(onFace(orbAdapter(api, 16, 16).obj), [x, yHi, zF]), [0, 0, 0.14]);
  P('7', at(onFace(orbAdapter(api, 12, 12).obj), [faceLo.acc, yLo, zF]), [0, 0, 0.14]);
  P('6', at(onFace(orbAdapter(api, 6, 6).obj), [faceLo.deair, yLo, zF]), [0, 0, 0.14]);
  P('11', at(onFace(orbPlug(api, u(1.25))), [faceLo.spare, yLo, zF]), [0, 0, 0.12]);
  // 1 — sonde de niveau et de température : corps six-pans 1 1/4 NPT, tête et connecteur DIN.
  const probe = group(
    merged([
      lathe([[0, -0.03], [u(0.8), -0.03], [u(0.83), 0], [0, 0]], 'zinc', { seg: 14 }),
      H_.R.hexY(u(1.75), 0, u(0.5)),
      lathe([[0, u(0.5)], [u(0.55), u(0.5)], [u(0.55), u(1.4)], [u(0.45), u(1.5)], [0, u(1.5)]], 'zinc', { seg: 18 }),
    ], 'zinc'),
    merged([
      box(u(1.1), u(0.9), u(1.1), 'plastic', { r: 0.003, pos: [0, u(1.95), 0] }),
      box(u(0.5), u(0.3), u(0.5), 'plastic', { pos: [0, u(2.5), 0] }),
    ], 'plastic'),
    lathe([[0, 0], [u(0.25), 0], [u(0.25), -0.15], [u(0.2), -0.152], [0, -0.152]], 'steel', { seg: 10 }),
  );
  P('1', at(onFace(probe), [faceLo.level, yLo, zF]), [0, 0, 0.16]);
  void THREE;
  return { view: { dir: [0.9, 0.8, 1.3] } };
}
