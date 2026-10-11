// P380 — Réservoir hydraulique CX032480 rév. 0 (page 380) : « ASSY, HYDRAULIC
// OIL TANK », repère 5 de P378. Caisson mécano-soudé (1, CX009878) en tôle de
// 3/16 po, profil en trapèze : paroi arrière verticale, dessus horizontal,
// face avant inclinée vers le fond ; deux semelles de fixation sous le fond.
// Dessus ouvert sur un cadre taraudé : couvercle avant (4, percé pour le filtre
// de retour et les piquages) et couvercle arrière (6, poignée tubulaire) posés
// sur un joint commun (5), 26 vis H 5/16 × 3/4 (7) et rondelles Nord-Lock (9).
// Chaque petite face porte une trappe de visite (3, plaque à bossages
// d'aspiration : bride SAE 4 vis et orifice taraudé) sur joint (2), fixée par
// 14 vis H 3/8 × 1 (8) et rondelles Nord-Lock (10).
// Les pièces optionnelles A, B, C (plaque du coffret électrique) ne font pas
// partie de la liste.
// Repère : origine au centre du dessous du fond, Y vers le haut, X selon la
// longueur (trappe à voyants vers −X), Z en travers : paroi arrière verticale
// à z = ZB, face inclinée vers +Z (le dessus déborde jusqu'à z = ZT).
// Caisson 0.75 (X) × 0.55 (Y) × 0.50 (Z au dessus ; 0.32 au fond) m ≈ 170 L ;
// encombrement 0.80 × 0.60 × 0.50 m (trappes, couvercles et poignée compris).
// Cotes estimées d'après les proportions des vues des pages 378 et 380.
import { IN, kit } from './_porteur.js';

export const HT = {
  L: 0.75, H: 0.55, ZB: -0.16, ZT: 0.34, ZF: 0.16, // fond de z = ZB à ZF
  t: 0.1875 * IN,
  seam: 0.09, // jonction des deux couvercles (z)
  open: { x: 0.33, z0: -0.13, z1: 0.31 }, // bords du joint / des couvercles
  lid: 0.375 * IN, // épaisseur des couvercles
  cover: { w: 0.24, h: 0.16, y: 0.19, z: 0.0 }, // trappes : largeur (Z), hauteur (Y), centre
  // Perçages du couvercle avant [x, z, r] : filtre de retour, reniflard,
  // sonde de niveau / température, prise avant (P378).
  holes: { filter: [-0.17, 0.2, 0.055], vent: [0.24, 0.17, 0.021], level: [0.29, 0.235, 0.012], front: [-0.02, 0.285, 0.007] },
  glass: { z: 0.0, y: [0.34, 0.41, 0.48] }, // bossages 1 1/4 NPT des voyants (face −X)
};

export default function P380(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, tube } = S;
  const K = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { L, H, ZB, ZT, ZF, t } = HT;
  const O = HT.open;

  // ---------------------------------------------------------------- 1 — caisson
  // Flancs (petites faces) : trapèze dans le plan YZ, percés pour la trappe.
  const C = HT.cover;
  const side = (x) => {
    const sh = new THREE.Shape([[ZB, 0], [ZF, 0], [ZT, H], [ZB, H]].map(([z, y]) => new THREE.Vector2(z, y)));
    const hole = new THREE.Path();
    hole.moveTo(C.z - C.w / 2 + 0.03, C.y - C.h / 2 + 0.03); hole.lineTo(C.z + C.w / 2 - 0.03, C.y - C.h / 2 + 0.03);
    hole.lineTo(C.z + C.w / 2 - 0.03, C.y + C.h / 2 - 0.03); hole.lineTo(C.z - C.w / 2 + 0.03, C.y + C.h / 2 - 0.03);
    sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    g.translate(x > 0 ? x : x + t, 0, 0);
    return new THREE.Mesh(g);
  };
  const slope = Math.atan2(ZT - ZF, H);
  const slopeLen = Math.hypot(ZT - ZF, H);
  const front = box(L - 2 * t, slopeLen, t, 'grey', { pos: [0, H / 2, (ZF + ZT) / 2 + t / 2], rot: [slope, 0, 0] });
  const tank = [
    side(-L / 2), side(L / 2),
    box(L - 2 * t, t, ZF - ZB, 'grey', { pos: [0, t / 2, (ZB + ZF) / 2] }),
    box(L - 2 * t, H, t, 'grey', { pos: [0, H / 2, ZB + t / 2] }),
    front,
  ];
  // Dessus : bord périphérique (cadre taraudé de 3/8 po) autour de l'ouverture,
  // barre transversale sous la jonction des couvercles.
  const top = K.plate(L, ZT - ZB, 0.375 * IN, 'grey', { cutouts: [[0, (O.z0 + O.z1) / 2 - (ZB + ZT) / 2, 2 * O.x - 0.07, O.z1 - O.z0 - 0.07]] });
  top.position.set(0, H - 0.1875 * IN, (ZB + ZT) / 2);
  tank.push(top, box(2 * O.x - 0.07, 0.375 * IN, 0.05, 'grey', { pos: [0, H - 0.1875 * IN, HT.seam] }));
  // Cadres soudés autour des ouvertures des trappes.
  for (const s of [-1, 1]) {
    const fr = K.plate(C.h + 0.02, C.w + 0.02, 0.25 * IN, 'grey', { cutouts: [[0, 0, C.h - 0.06, C.w - 0.06]] });
    fr.rotation.z = Math.PI / 2;
    fr.position.set(s * (L / 2 + 0.125 * IN), C.y, C.z);
    tank.push(fr);
  }
  // Semelles de fixation sous le fond (cornières), quatre trous.
  for (const z of [ZB + 0.04, ZF - 0.04]) {
    const rail = K.plate(L + 0.06, 0.05, 0.25 * IN, 'grey', { holes: [[-L / 2 - 0.01, 0, 0.007], [L / 2 + 0.01, 0, 0.007]] });
    rail.position.set(0, -0.125 * IN, z);
    tank.push(rail);
  }
  // Bossages des voyants de niveau (face −X).
  for (const y of HT.glass.y) tank.push(at(S.cyl(0.026, 0.008, 'grey', { axis: 'x', seg: 16 }), [-L / 2 - 0.004, y, HT.glass.z]));
  // Bouchon de vidange soudé sous le fond.
  tank.push(lathe([[0, -0.012], [0.016, -0.012], [0.016, 0], [0, 0]], 'grey', { seg: 10, pos: [0.25, 0, 0.0] }));
  P('1', merged(tank, 'grey'), [0, 0, 0]);

  // ---------------------------------------------------------------- 5 — joint du dessus ; 4, 6 — couvercles
  const yG = H + 0.0;
  const zc = (O.z0 + O.z1) / 2;
  const gasket = K.plate(2 * O.x, O.z1 - O.z0, 0.002, 'rubber', { cutouts: [[0, 0, 2 * O.x - 0.05, O.z1 - O.z0 - 0.05]] });
  gasket.position.set(0, yG + 0.001, zc);
  P('5', gasket, [0, 0.12, 0]);
  const yL = yG + 0.002; // dessous des couvercles
  // Vis du dessus : 5 sur le bord extérieur, 4 sur la jonction, 2 par côté et par couvercle.
  const boltsTop = (z0, z1, outer) => {
    const pts = [];
    for (let i = 0; i < 5; i++) pts.push([-O.x + 0.03 + (i * (2 * O.x - 0.06)) / 4, outer]);
    for (let i = 0; i < 4; i++) pts.push([-O.x + 0.1 + (i * (2 * O.x - 0.2)) / 3, z0 + z1 - outer]);
    for (const s of [-1, 1]) for (const k of [0.33, 0.67]) pts.push([s * (O.x - 0.015), z0 + (z1 - z0) * k]);
    return pts;
  };
  const lidPts = boltsTop(HT.seam, O.z1, O.z1 - 0.015);
  const rearPts = boltsTop(O.z0, HT.seam, O.z0 + 0.015);
  // 4 — couvercle avant : trou du filtre de retour, piquages (P378).
  const lid = K.plate(2 * O.x, O.z1 - HT.seam, HT.lid, 'grey', {
    holes: [...lidPts.map(([x, z]) => [x, z - (HT.seam + O.z1) / 2, 0.0045]), ...Object.values(HT.holes).map(([x, z, r]) => [x, z - (HT.seam + O.z1) / 2, r])], seg: 10,
  });
  lid.position.set(0, yL + HT.lid / 2, (HT.seam + O.z1) / 2);
  P('4', lid, [0, 0.24, 0.04]);
  // 6 — couvercle arrière, poignée tubulaire soudée.
  const rear = K.plate(2 * O.x, HT.seam - O.z0, HT.lid, 'grey', {
    holes: rearPts.map(([x, z]) => [x, z - (HT.seam + O.z0) / 2, 0.0045]),
  });
  rear.position.set(0, yL + HT.lid / 2, (HT.seam + O.z0) / 2);
  const yT = yL + HT.lid;
  const handle = tube([[-0.22, yT, -0.06], [-0.22, yT + 0.05, -0.07], [-0.2, yT + 0.065, -0.07], [0.2, yT + 0.065, -0.07], [0.22, yT + 0.05, -0.07], [0.22, yT, -0.06]], 0.0125, 'grey', { seg: 18, radial: 8 });
  P('6', group(rear, handle), [0, 0.3, -0.04]);
  for (const [x, z] of [...lidPts, ...rearPts]) {
    const ex = z > HT.seam ? [0, 0.34, 0.04] : [0, 0.4, -0.04];
    P('9', K.washer(0.3125 * IN, 'zinc', { seg: 6, pos: [x, yT, z] }), ex);
    P('7', K.screw(0.3125 * IN, 0.75 * IN, 'zinc', { pos: [x, yT + 0.05 * IN, z], seg: 6 }), [ex[0], ex[1] + 0.06, ex[2]]);
  }

  // ---------------------------------------------------------------- 2 — joints ; 3 — trappes de visite (×2)
  const cpts = [];
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) cpts.push([C.z - C.w / 2 + 0.02 + (i * (C.w - 0.04)) / 4, C.y + s * (C.h / 2 - 0.012)]);
  for (const s of [-1, 1]) for (const k of [-1, 1]) cpts.push([C.z + s * (C.w / 2 - 0.012), C.y + k * 0.03]);
  for (const s of [-1, 1]) {
    const x0 = s * (L / 2 + 0.25 * IN); // face des cadres
    const gk = K.plate(C.h, C.w, 0.002, 'rubber', { cutouts: [[0, 0, C.h - 0.05, C.w - 0.05]], holes: cpts.map(([z, y]) => [y - C.y, z - C.z, 0.005]), seg: 6 });
    gk.rotation.z = Math.PI / 2;
    gk.position.set(x0 + s * 0.001, C.y, C.z);
    P('2', gk, [s * 0.07, 0, 0]);
    // Plaque de 1/2 po, bride SAE 4 vis (aspiration) et bossage taraudé.
    const tp = 0.5 * IN, xp = x0 + s * (0.002 + tp / 2);
    const pl = K.plate(C.h, C.w, tp, 'grey', { holes: cpts.map(([z, y]) => [y - C.y, z - C.z, 0.0052]), seg: 6 });
    pl.rotation.z = Math.PI / 2;
    pl.position.set(xp, C.y, C.z);
    const xo = x0 + s * (0.002 + tp);
    const pad = box(0.022, 0.07, 0.07, 'grey', { r: 0.004, pos: [xo + s * 0.011, C.y - 0.01, C.z + 0.06] });
    const port = lathe([[0.019, 0], [0, 0]], 'blackOxide', { seg: 12 });
    port.rotation.z = -s * Math.PI / 2;
    port.position.set(xo + s * 0.0222, C.y - 0.01, C.z + 0.06);
    const boss = lathe([[0, 0], [0.022, 0], [0.022, 0.016], [0.013, 0.016], [0.013, 0.012], [0, 0.012]], 'grey', { seg: 14 });
    boss.rotation.z = -s * Math.PI / 2;
    boss.position.set(xo, C.y + 0.01, C.z - 0.065);
    const padBolts = [];
    for (const dy of [-0.025, 0.025]) for (const dz of [-0.025, 0.025]) padBolts.push(at(lathe([[0, 0], [0.004, 0], [0, 0.0005]], 'blackOxide', { seg: 6 }), [xo + s * 0.0222, C.y - 0.01 + dy, C.z + 0.06 + dz], [0, 0, -s * Math.PI / 2]));
    P('3', group(merged([pl, pad, boss], 'grey'), port, merged(padBolts, 'blackOxide')), [s * 0.14, 0, 0]);
    const xb = xo;
    for (const [z, y] of cpts) {
      const ax = s > 0 ? 'x' : '-x';
      P('10', K.washer(0.375 * IN, 'zinc', { seg: 6, axis: ax, pos: [xb, y, z] }), [s * 0.2, 0, 0]);
      P('8', K.screw(0.375 * IN, 1 * IN, 'zinc', { seg: 6, axis: ax, pos: [xb + s * 0.06 * IN, y, z] }), [s * 0.26, 0, 0]);
    }
  }

  return { view: { dir: [-0.8, 0.7, 1.2] } };
}
