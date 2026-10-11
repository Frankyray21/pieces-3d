// P270 — Refroidisseur hydraulique CX007804 rév. 1 (page 270) : « HYDRAULIC
// COOLER ASSY », repère 33 de P246. Refroidisseur d'huile modifié (3) :
// faisceau à ailettes entre deux boîtes d'extrémité verticales (orifices
// SAE -16 vers l'intérieur, entrée en haut à −X, sortie en bas à +X), carénage
// à deux ventilateurs électriques Ø 16 po côté intérieur ; suspendu par une
// charnière continue (5) le long de son bord haut, dont l'aile fixe est
// boulonnée sur la cornière de fixation (4, contre la poutre droite du capot) ;
// patte (2) en bout −X portant le pied du vérin à gaz (1) qui retient le
// refroidisseur ouvert (rotation vers le haut et l'extérieur, porte du capot
// ouverte). Boulonnerie 5/16 po : vis H (6, vingt), rondelles plates (7),
// rondelles Grower (8), écrous (9) : six vis charnière / cornière, six vis
// charnière / refroidisseur (taraudées), six vis cornière / poutre, deux vis
// de la patte du vérin, écrous des rotules du vérin.
// Repère : origine sur l'axe de la charnière, à mi-longueur ; X selon la
// longueur (X machine), Y vers le haut, +Z vers l'extérieur (ailettes vers la
// porte droite) ; le refroidisseur pend sous l'axe. Encombrement 1.02 (X) ×
// 0.66 (Y, de −0.63 à 0.03) × 0.33 (Z, de −0.19 à 0.14) m. Cotes d'après les
// vues de la page 270 et la vue de dessus de la page 252 (0,98 × 0,60 m).
import { HC, bolt, nut, washer, washerT, pose, u } from './_engine.js';

export default function P270(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, ring, at, group, merged, extrude } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = HC.L, Hh = 0.56; // longueur, hauteur du faisceau
  const yC = -0.02 - Hh / 2; // milieu du faisceau
  const zO = 0.115; // face extérieure des ailettes
  const zS = 0.05; // face intérieure du faisceau / face du carénage

  // ---------------------------------------------------------------- 3 — refroidisseur
  const core = [], tank = [], blk = [], fan = [], stl = [];
  // Faisceau : bloc, ailettes (lames horizontales sur la face extérieure),
  // tubes plats suggérés côté carénage.
  core.push(box(L - 0.1, Hh, zO - zS, 'darkSteel', { pos: [0, yC, (zO + zS) / 2] }));
  for (let y = yC - Hh / 2 + 0.006; y < yC + Hh / 2 - 0.004; y += 0.009) core.push(box(L - 0.104, 0.0028, 0.003, 'black', { pos: [0, y, zO + 0.0014] }));
  // Boîtes d'extrémité (fonte d'alu) à bossages d'orifices, plaques de joues haut et bas.
  for (const s of [-1, 1]) {
    tank.push(box(0.05, Hh + 0.04, zO - zS + 0.012, 'castAlu', { r: 0.008, pos: [s * (L / 2 - 0.025), yC, (zO + zS) / 2] }));
    tank.push(at(cyl(0.024, 0.016, 'castAlu', { axis: 'z', seg: 20 }), [s * (L / 2 - 0.025), s < 0 ? yC + Hh / 2 - 0.035 : yC - Hh / 2 + 0.035, zS - 0.004]));
  }
  for (const y of [yC - Hh / 2 - 0.01, yC + Hh / 2 + 0.01]) blk.push(box(L - 0.1, 0.02, zO - zS + 0.004, 'black', { pos: [0, y, (zO + zS) / 2] }));
  // Orifices SAE -16 (bouchons de transport) côté intérieur.
  for (const s of [-1, 1]) stl.push(at(S.nut(0.038, 0.012, 'zinc', { axis: 'z' }), [s * (L / 2 - 0.025), s < 0 ? yC + Hh / 2 - 0.035 : yC - Hh / 2 + 0.035, zS - 0.018]));
  // Carénage des ventilateurs : tôle percée de deux viroles, rebords.
  const fr = 0.205, fxs = [-0.235, 0.235];
  const hw = (L - 0.12) / 2, hh = Hh / 2;
  const sh = extrude([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], 0.003, 'black', { holes: fxs.map((x) => [x, 0, fr + 0.01]) });
  sh.position.set(0, yC, zS - 0.04);
  blk.push(sh);
  for (const y of [yC - hh, yC + hh]) blk.push(box(L - 0.12, 0.003, 0.04, 'black', { pos: [0, y, zS - 0.02] }));
  for (const x of [-hw, hw]) blk.push(box(0.003, Hh, 0.04, 'black', { pos: [x, yC, zS - 0.02] }));
  // Ventilateurs : virole, moteur électrique sur trois bras, pales, câble.
  for (const x of fxs) {
    blk.push(at(S.shell(fr + 0.01, fr + 0.007, 0.035, 'black', { axis: 'z', seg: 40 }), [x, yC, zS - 0.055]));
    fan.push(at(lathe([[0, 0], [0.055, 0], [0.058, 0.008], [0.058, 0.06], [0.05, 0.068], [0, 0.07]], 'black', { axis: '-z', seg: 28 }), [x, yC, zS - 0.045]));
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
      const m = box(0.012, fr - 0.04, 0.004, 'black');
      m.position.set(x + Math.cos(a) * (fr + 0.05) / 2, yC + Math.sin(a) * (fr + 0.05) / 2, zS - 0.07);
      m.rotation.z = a - Math.PI / 2;
      fan.push(m);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const b = box(fr - 0.05, 0.06, 0.003, 'black', { r: 0.01 });
      const g = group(b);
      b.position.x = (fr + 0.04) / 2;
      b.rotation.x = 0.5;
      g.rotation.z = a;
      g.position.set(x, yC, zS - 0.03);
      fan.push(g);
    }
  }
  const wire = S.cable([[fxs[0], yC - 0.03, zS - 0.11], [0, yC - 0.08, zS - 0.08], [fxs[1], yC - 0.03, zS - 0.11]], 0.004);
  const plate = at(S.nameplate(0.05, 0.03), [L / 2 - 0.025, yC, zO + 0.008]);
  P('3', group(merged(core, 'darkSteel'), merged(tank, 'castAlu'), merged(blk, 'black'), merged(fan, 'black'), merged(stl, 'zinc'), wire, plate), [0, 0, 0.3]);

  // ---------------------------------------------------------------- 5 — charnière continue
  // Deux ailes (fixe vers −Z, mobile vers le bas sur le carénage), nœuds et axe.
  const hl = L - 0.08;
  const knuckles = [];
  for (let i = 0; i < 12; i++) {
    const x0 = -hl / 2 + (i * hl) / 12;
    knuckles.push(cyl(0.0065, hl / 12 - 0.002, 'zinc', { axis: 'x', seg: 12, pos: [x0 + hl / 24, 0, 0] }));
  }
  P('5', group(merged([
    box(hl, 0.0025, 0.035, 'zinc', { pos: [0, 0.0055, -0.018] }),
    box(hl, 0.035, 0.0025, 'zinc', { pos: [0, -0.02, 0.0055] }),
    ...knuckles,
    cyl(0.003, hl + 0.006, 'steel', { axis: 'x', seg: 8 }),
  ], 'zinc')), [0, 0.12, 0]);

  // ---------------------------------------------------------------- 4 — cornière de fixation
  // Cornière 2 × 2 po : aile horizontale sous la charnière, aile verticale contre la poutre du capot (−Z).
  const zB = -0.04; // face de l'aile verticale (côté refroidisseur)
  P('4', group(merged([
    box(L - 0.04, 0.0064, 0.05, 'black', { pos: [0, 0.0102, -0.025] }),
    box(L - 0.04, 0.05, 0.0064, 'black', { pos: [0, -0.012, zB - 0.0032] }),
    ...[-1, 1].map((s) => box(0.006, 0.045, 0.045, 'black', { pos: [s * (L / 2 - 0.023), -0.008, -0.022] })),
  ], 'black')), [0, 0.18, -0.08]);

  // ---------------------------------------------------------------- 2 — patte du vérin à gaz
  const xp = -L / 2 + 0.01;
  P('2', group(merged([
    box(0.006, 0.07, 0.05, 'black', { pos: [xp - 0.003, yC - 0.18, zS - 0.02] }),
    box(0.04, 0.006, 0.05, 'black', { pos: [xp - 0.023, yC - 0.212, zS - 0.02] }),
  ], 'black')), [-0.15, 0, 0]);

  // ---------------------------------------------------------------- 1 — vérin à gaz
  // Du pied (patte 2) à la tête (bout −X de la cornière 4), fermé : corps,
  // tige chromée, rotules à rotule sphérique.
  const pA = [xp - 0.03, yC - 0.2, zS - 0.02], pB = [xp - 0.03, -0.02, -0.03];
  const dir = pB.map((v, i) => v - pA[i]);
  const len = Math.hypot(...dir);
  const gs = group(
    cyl(0.011, len * 0.58, 'black', { seg: 16, pos: [0, 0.03 + len * 0.29, 0] }),
    cyl(0.004, len * 0.36, 'chrome', { seg: 12, pos: [0, len * 0.6 + len * 0.18 - 0.01, 0] }),
    merged([0.012, len - 0.012].map((y) => S.ball(0.008, 'steel', { pos: [0, y, 0] })), 'steel'),
    merged([0.024, len - 0.024].map((y) => cyl(0.006, 0.016, 'black', { seg: 10, pos: [0, y, 0] })), 'black'),
  );
  P('1', pose(THREE, gs, pA, dir), [-0.1, 0.05, -0.1]);

  // ---------------------------------------------------------------- boulonnerie 5/16 po
  const D = 0.3125;
  const tS = washerT(D, 'split'), tF = washerT(D, 'flat');
  const hingeX = Array.from({ length: 6 }, (_, i) => -hl / 2 + 0.04 + (i * (hl - 0.08)) / 5);
  // Charnière / cornière : vis vers le bas au travers de l'aile fixe et de la
  // cornière, Grower et écrou dessous.
  for (const x of hingeX) {
    P('6', pose(THREE, bolt(S, D, 0.75), [x, 0.0134, -0.025]), [0, 0.06, 0]);
    P('8', pose(THREE, washer(S, D, 'split'), [x, 0.0043 - tS, -0.025]), [0, -0.04, 0]);
    P('9', pose(THREE, nut(S, D), [x, 0.0043 - tS, -0.025], [0, -1, 0]), [0, -0.06, 0]);
  }
  // Charnière / refroidisseur : vis horizontales dans le cadre du carénage.
  for (const x of hingeX) {
    P('6', pose(THREE, bolt(S, D, 0.75), [x, -0.025, 0.0067 + tS], [0, 0, 1]), [0, 0, 0.06]);
    P('8', pose(THREE, washer(S, D, 'split'), [x, -0.025, 0.0067], [0, 0, 1]), [0, 0, 0.04]);
  }
  // Cornière / poutre du capot : vis vers −Z, rondelle plate et Grower, écrou derrière la poutre.
  const beamX = [-0.42, -0.25, -0.08, 0.08, 0.25, 0.42];
  for (const x of beamX) {
    const z0 = zB - 0.0064;
    P('6', pose(THREE, bolt(S, D, 0.75), [x, -0.02, zB + tF + tS], [0, 0, 1]), [0, 0, 0.07]);
    P('7', pose(THREE, washer(S, D, 'flat'), [x, -0.02, zB], [0, 0, 1]), [0, 0, 0.05]);
    P('8', pose(THREE, washer(S, D, 'split'), [x, -0.02, zB + tF], [0, 0, 1]), [0, 0, 0.06]);
    P('9', pose(THREE, nut(S, D), [x, -0.02, z0 - 0.0045], [0, 0, -1]), [0, 0, -0.06]);
  }
  // Patte du vérin : deux vis dans la boîte d'extrémité, rondelles plate + Grower.
  for (const y of [yC - 0.165, yC - 0.195]) {
    P('6', pose(THREE, bolt(S, D, 0.75), [xp - 0.006 - tF - tS, y, zS - 0.02], [-1, 0, 0]), [-0.07, 0, 0]);
    P('7', pose(THREE, washer(S, D, 'flat'), [xp - 0.006 - tF, y, zS - 0.02], [-1, 0, 0]), [-0.05, 0, 0]);
    P('8', pose(THREE, washer(S, D, 'split'), [xp - 0.006 - tF - tS, y, zS - 0.02], [-1, 0, 0]), [-0.06, 0, 0]);
  }
  // Rotules du vérin : goujons à écrou et rondelle plate ; Grower sous l'écrou du pied.
  for (const [k, p] of [[pA[0] + 0.016, pA[1], pA[2]], [pB[0] + 0.016, pB[1], pB[2]]].entries()) {
    const n = [1, 0, 0];
    P('7', pose(THREE, washer(S, D, 'flat'), p, n), [0.05, 0, 0]);
    if (k === 0) P('8', pose(THREE, washer(S, D, 'split'), [p[0] + tF, p[1], p[2]], n), [0.06, 0, 0]);
    P('9', pose(THREE, nut(S, D), [p[0] + tF + (k === 0 ? tS : 0), p[1], p[2]], n), [0.07, 0, 0]);
  }
  void u;
  void ring;
  return { view: { dir: [0.6, 0.5, 1.2] } };
}
