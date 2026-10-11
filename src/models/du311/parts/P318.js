// P318 — Graissage manuel (option) CX036413 rév. 0 « MANUAL GREASING UNIT,
// OPTIONAL » (page 318), repère 26 de P186. Monté sur la marche de
// translation du DU311-T (cadre tubulaire en tirets, hors liste) :
// - support de seau (4) : semelle carrée percée de 4 trous (vis H 3/8-16 ×
//   1 po filetées sur toute la longueur, 10, et rondelles Grower, 13),
//   ceinture carrée à mi-hauteur, dosseret ajouré ; pompe à graisse (1) :
//   seau de graisse à nervures, couvercle, tête de pompe, poignée en tube ;
//   sur la tête (détail A) : coude de tuyauterie 1/4 NPT mâle-mâle (9), robinet
//   à boisseau sphérique 1/4 FPT (2) et adaptateur droit 1/4 NPT → JIC -06
//   (8) ; sortie avant de la pompe : coude 1/4 NPT → JIC -06 (6) ;
// - support d'enrouleur (3) : âme verticale à pattes haute et basse
//   enserrant un tube de 2 po du cadre, serrée par deux vis H 1-8 × 4 po
//   (12), rondelles Grower (14, ×4) et écrous (16) ; enrouleur de graissage
//   (5 = P320) boulonné par sa semelle sur l'âme (vis H 1/2-13 × 1 po, 11,
//   et rondelles Grower, 15, ×4), tambour d'axe horizontal (Z), guide en
//   haut ; coude 1/2 NPT → JIC -06 (7) sur le joint tournant de l'enrouleur.
// Le flexible de 50 pi (fourni avec P320) et la buse ne sont pas dessinés
// (notes 1 et 2 du dessin) ; le flexible pompe → enrouleur n'est pas listé.
// Repère : origine au centre de la face inférieure de la semelle du support
// de seau ; Y vers le haut ; dosseret du support vers -Z (côté cadre) ;
// support d'enrouleur à x = -0.6 (tube du cadre d'axe Z à x = -0.55,
// y = 0.62). Encombrement ≈ 1.35 (X) × 0.92 (Y) × 0.55 (Z) m.
// Cotes : visserie d'après la liste ; seau (Ø 12 po), supports et tube du
// cadre estimés d'après les proportions de la page 318.
// Dans P186 : à l'arrière, côté enrouleur de câble (+Z), à l'emplacement du
// repère 26 de frame.js (seau vers x ≈ -2.0, z ≈ 0.42 ; enrouleur vers
// x ≈ -0.4, z ≈ 1.08) — les deux parties sont ici regroupées autour de la
// marche ; position à confirmer avec le porteur P328.
import { IN, nptFitting, orient, orientPoint } from './_chassis.js';
import { PTS320 } from './P320.js';

export default function P318(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- 4 — support de seau
  const B = 0.36, T = 0.0064, HB = 0.22, ZB = -0.18;
  const holes4 = [[-0.15, -0.15], [-0.15, 0.15], [0.15, -0.15], [0.15, 0.15]];
  const m4 = [];
  const bot = S.plate(B, B, T, 'yellow', { r: 0.02, holes: holes4.map(([x, z]) => [x, z, 0.0055]) });
  bot.position.y = T / 2;
  const ringShape = new THREE.Shape();
  const rr = 0.02, h = B / 2;
  ringShape.moveTo(-h + rr, -h); ringShape.lineTo(h - rr, -h); ringShape.quadraticCurveTo(h, -h, h, -h + rr);
  ringShape.lineTo(h, h - rr); ringShape.quadraticCurveTo(h, h, h - rr, h); ringShape.lineTo(-h + rr, h);
  ringShape.quadraticCurveTo(-h, h, -h, h - rr); ringShape.lineTo(-h, -h + rr); ringShape.quadraticCurveTo(-h, -h, -h + rr, -h);
  const ho = new THREE.Path(); ho.absarc(0, 0, 0.158, 0, Math.PI * 2, true); ringShape.holes.push(ho);
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: T, bevelEnabled: false, curveSegments: 24 });
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo); ring.position.y = HB + T;
  // Dosseret (plan XY à z = ZB) ajouré de deux fenêtres (forme en H).
  const back = S.plate(B, HB + T, T, 'yellow', { r: 0.004, cutouts: [[-0.1, -0.06, 0.11, 0.07], [0.1, -0.06, 0.11, 0.07], [-0.1, 0.06, 0.11, 0.07], [0.1, 0.06, 0.11, 0.07]] });
  back.rotation.x = Math.PI / 2; back.position.set(0, (HB + T) / 2, ZB - T / 2);
  m4.push(bot, ring, back);
  // Plats de liaison latéraux (montants) aux coins arrière.
  for (const sx of [-1, 1]) m4.push(S.box(0.04, HB, T, 'yellow', { pos: [sx * (B / 2 - 0.02), HB / 2 + T, ZB + 0.004] }));
  P('4', S.merged(m4, 'yellow'), [0, 0, -0.15]);

  // 10 / 13 — vis de semelle (par-dessous) et rondelles.
  for (const [x, z] of holes4) {
    P('13', S.washer(0.0085, 0.005, 0.0024, 'zinc', { pos: [x, -0.0012, z] }), [0, -0.06, -0.15]);
    P('10', orient(api, S.bolt(0.375 * IN, 1.0 * IN, 'zinc'), [x, -0.0024, z], [0, -1, 0]), [0, -0.1, -0.15]);
  }

  // ---------------------------------------------------------------- 1 — pompe à graisse (seau + tête)
  const pail = [], head = [];
  const yP = T, HP = 0.37;
  pail.push(S.shell(0.15, 0.148, HP, 'red', { seg: 48, pos: [0, yP + HP / 2, 0] }));
  pail.push(S.cyl(0.149, 0.004, 'red', { seg: 48, pos: [0, yP + 0.002, 0] }));
  for (const y of [HP - 0.07, HP - 0.045, HP - 0.02]) pail.push(S.torus(0.151, 0.004, 'red', { pos: [0, yP + y, 0] }));
  // Couvercle à bord serti et bombé léger.
  const lid = S.lathe([[0, yP + HP], [0.158, yP + HP], [0.158, yP + HP + 0.016], [0.14, yP + HP + 0.02], [0, yP + HP + 0.026]], 'grey', { seg: 48 });
  const yL = yP + HP + 0.026;
  // Tête de pompe : embase ronde, carter trapézoïdal arrondi, bouton de purge.
  head.push(S.cyl(0.03, 0.03, 'darkSteel', { seg: 24, pos: [0, yL + 0.015, 0] }));
  const hb = S.lathe([[0, 0], [0.085, 0], [0.085, 0.02], [0.075, 0.14], [0.06, 0.155], [0, 0.158]], 'black', { seg: 4 });
  hb.children[0].rotation.y = Math.PI / 4;
  hb.position.y = yL + 0.03;
  hb.scale.set(0.95, 1, 0.8);
  head.push(S.cyl(0.006, 0.014, 'steel', { seg: 12, pos: [0, yL + 0.195, 0] }));
  // Poignée en tube coudé derrière la tête.
  const handle = S.tube([[0.1, yL, -0.08], [0.1, yL + 0.1, -0.1], [0.08, yL + 0.18, -0.1], [-0.08, yL + 0.18, -0.1], [-0.1, yL + 0.1, -0.1], [-0.1, yL, -0.08]], 0.007, 'steel', { seg: 40, ends: 'none', radial: 10 });
  P('1', S.group(S.merged(pail, 'red'), lid, S.merged(head, 'darkSteel'), hb, handle), [0, 0.18, 0]);
  const yH = yL + 0.03; // bas du carter de la tête

  // ---------------------------------------------------------------- 6 — coude de sortie (avant de la tête)
  const e6 = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
  P('6', orient(api, e6.obj, [0, yH + 0.025, 0.068], [0, 0, 1], [0, -1, 0]), [0, 0.18, 0.08]);

  // ---------------------------------------------------------------- détail A : 9, 2, 8 sur le flanc -X de la tête
  // Orifice du flanc à x = -0.081, y = yH + 0.06 : coude 9 (mâle-mâle) dont
  // la sortie verticale vers le bas reçoit le robinet 2, puis l'adaptateur 8.
  const portA = [-0.081, yH + 0.06, 0.02];
  const e9 = nptFitting(api, { npt: 4, end: 'npt', angle: 90, material: 'steel' });
  P('9', orient(api, e9.obj, portA, [-1, 0, 0], [0, -1, 0]), [-0.06, 0.18, 0]);
  const o9 = orientPoint(api, e9.out, portA, [-1, 0, 0], [0, -1, 0]);
  const s2 = 0.018; // robinet 1/4 po (boisseau)
  const bv = S.ballValve(s2, 'brass', { axis: 'y' });
  const vTop = o9[1] + 0.008;
  bv.position.set(o9[0], vTop - 1.15 * s2, o9[2]);
  bv.rotation.y = Math.PI / 2;
  P('2', bv, [-0.12, 0.18, 0]);
  const e8 = nptFitting(api, { npt: 4, jic: 6 });
  P('8', orient(api, e8.obj, [o9[0], vTop - 2.3 * s2, o9[2]], [0, -1, 0]), [-0.12, 0.1, 0]);

  // ---------------------------------------------------------------- 3 — support d'enrouleur
  const XW = -0.6, YT = 0.62, TW = 0.0095, tub = 0.0508;
  const m3 = [];
  const web = S.plate(0.3, 0.16, TW, 'yellow', { r: 0.008, holes: PTS320.holes.map(([, z]) => [-z, 0, 0.0071]) });
  web.rotation.z = Math.PI / 2; web.position.set(XW + TW / 2, YT, 0);
  m3.push(web);
  // Ailes de l'âme (vers +X) et pattes enserrant le tube du cadre.
  for (const sz of [-1, 1]) m3.push(S.box(0.05, 0.3, TW, 'yellow', { r: 0.002, pos: [XW + 0.025, YT, sz * (0.08 - TW / 2)] }));
  const tabs = [YT + tub / 2 + TW / 2, YT - tub / 2 - TW / 2];
  for (const y of tabs) {
    const tab = S.plate(0.1, 0.16, TW, 'yellow', { r: 0.01, holes: [[0.0, -0.045, 0.0135], [0.0, 0.045, 0.0135]] });
    tab.position.set(XW + 0.05, y, 0);
    m3.push(tab);
  }
  P('3', S.merged(m3, 'yellow'), [0.12, 0, 0]);

  // 12 / 14 / 16 — vis 1 × 4 po verticales à travers pattes et tube, rondelles, écrous.
  for (const z of [-0.045, 0.045]) {
    const yTop = tabs[0] + TW / 2, yBot = tabs[1] - TW / 2;
    P('14', S.washer(0.0175, 0.0132, 0.0025, 'zinc', { pos: [XW + 0.05, yTop + 0.00125, z] }), [0.12, 0.08, 0]);
    P('12', S.bolt(1.0 * IN, 4.0 * IN, 'zinc', { pos: [XW + 0.05, yTop + 0.0025, z] }), [0.12, 0.16, 0]);
    P('14', S.washer(0.0175, 0.0132, 0.0025, 'zinc', { pos: [XW + 0.05, yBot - 0.00125, z] }), [0.12, -0.08, 0]);
    P('16', S.nut(0.0381, 0.022, 'zinc', { pos: [XW + 0.05, yBot - 0.0025 - 0.011, z] }), [0.12, -0.14, 0]);
  }

  // ---------------------------------------------------------------- 5 — enrouleur (P320)
  // P320 : semelle (y local) contre l'âme côté -X ; axe du tambour (x local)
  // selon +Z ; guide (-z local) vers le haut. Trous de semelle centrés sur l'âme.
  const R5 = [XW, YT, 0.15];
  const dirY = [-1, 0, 0], sideZ = [0, -1, 0];
  P('5', orient(api, api.sub('P320'), R5, dirY, sideZ), [-0.2, 0, 0]);
  // 11 / 15 — vis de semelle (côté enrouleur) et rondelles Grower.
  for (const [hx, hz] of PTS320.holes) {
    const p = orientPoint(api, [hx, 0.008, hz], R5, dirY, sideZ);
    P('15', orient(api, S.washer(0.0119, 0.0067, 0.003, 'zinc'), orientPoint(api, [hx, 0.0095, hz], R5, dirY, sideZ), dirY), [-0.1, 0, 0]);
    P('11', orient(api, S.bolt(0.5 * IN, 1.0 * IN, 'zinc'), orientPoint(api, [hx, 0.011, hz], R5, dirY, sideZ), dirY), [-0.15, 0, 0]);
    void p;
  }
  // 7 — coude 1/2 NPT → JIC -06 sur la sortie du joint tournant de P320
  // (sortie à x = 0.15, y = 0.262, z = 0 du repère P320, vers -Y local).
  const sw = orientPoint(api, [0.15, 0.262, 0], R5, dirY, sideZ);
  const swDir = [1, 0, 0]; // -Y local → +X
  const e7 = nptFitting(api, { npt: 8, jic: 6, angle: 90 });
  P('7', orient(api, e7.obj, sw, swDir, [0, 1, 0]), [0, 0, 0.1]);

  return { view: { dir: [0.8, 0.6, 1.1] } };
}
