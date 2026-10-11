// P372 — Garde des vannes de translation CX032477 rév. 3 (page 372), repère 35
// de P328 : capot en tôle pliée (2) au-dessus du banc des vannes de translation,
// à l'arrière de la plateforme de conduite. Toit à bavette avant rabattue à 45°
// et bord arrière tombé ; deux jambages en cornière (joue latérale et aile avant
// percée) terminés par une semelle pliée vers l'intérieur, boulonnée au châssis
// par 4 vis H 1/2 × 1 1/4 (7) et rondelles (9). Gyrophare orange (1) sur le
// toit. En façade, entre les ailes des jambages : plaque haute (3, sélecteur
// régime moteur haut / bas, actionneur électrique manuel, câble d'accélérateur,
// lumières de passage) et plaque basse (4, étiquette des vannes : L.F. JACK,
// R.F. JACK, L.R. JACK, R.R. JACK, LEFT TRAM, RIGHT TRAM), fixées par 8 vis H
// 1/4 × 1 (6), dont 4 avec écrous (10), et rondelles (8). Les deux coffrets
// (commande de translation à −X, commande moteur à +X) se vissent sur les joues
// par 8 vis H 1/4 × 3/4 (5) et rondelles (8) : coffrets, sélecteur, actionneur,
// afficheur Checkfire 210 et antenne DCU (P382) ne sont pas de cette liste et ne
// sont pas dessinés ici ; leurs perçages le sont.
// Repère : origine au milieu entre les semelles, sous elles (face d'appui sur le
// châssis), Y vers le haut, X en travers (joues à x = ±0.23), +Z vers l'avant
// (face des plaques, côté conducteur). Encombrement 0.46 (X) × 0.72 (Y, gyrophare
// compris) × 0.31 (Z) m. Cotes estimées d'après la vue isométrique (vis 1/2 ×
// 1 1/4 et 1/4 po pour l'échelle).
import { IN, kit } from './_porteur.js';

const XJ = 0.23; // face extérieure des joues
const T = 0.1875 * IN; // tôle 3/16
const TF = 0.25 * IN; // semelles 1/4
const YR = 0.6; // dessus du toit
const ZF = 0.08; // face arrière des ailes avant
const ZB = -0.02; // bord arrière des joues
const ROOF = { z0: -0.13, z1: 0.14 };
const PL = { y3: [0.4, 0.58], y4: [0.22, 0.4] }; // plaques de façade (bas, haut)

export default function P372(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, nameplate } = S;
  const K = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- 2 — capot
  const parts = [];
  // Toit (percé pour le gyrophare et l'antenne), bavette avant à 45°, bord arrière tombé.
  const roof = K.plate(2 * XJ, ROOF.z1 - ROOF.z0, T, 'grey', { holes: [[-0.06, 0, 0.012], [0.16, -0.06, 0.008]] });
  roof.position.set(0, YR - T / 2, (ROOF.z0 + ROOF.z1) / 2);
  parts.push(roof);
  const lip = box(2 * XJ, T, 0.06, 'grey');
  lip.position.set(0, YR - 0.0212, ROOF.z1 + 0.0212);
  lip.rotation.x = Math.PI / 4;
  parts.push(lip);
  parts.push(box(2 * XJ, 0.035, T, 'grey', { pos: [0, YR - 0.0175, ROOF.z0 + T / 2] }));
  // Jambages : joue latérale (plan YZ) + aile avant (plan XY) percées, semelle.
  const holesJ = [];
  for (const s of [-1, 1]) {
    for (const y of [0.15, 0.5]) for (const z of [0.005, 0.055]) holesJ.push([s, y, z]);
    parts.push(box(T, YR - TF, ZF - ZB, 'grey', { pos: [s * (XJ - T / 2), (YR + TF) / 2, (ZF + ZB) / 2] }));
    parts.push(box(0.035, YR - 0.14, T, 'grey', { pos: [s * (XJ - 0.0175), (YR + 0.14) / 2, ZF - T / 2] }));
    const foot = K.plate(0.09, ZF - ZB, TF, 'grey', { holes: [[0, -0.025, 0.007], [0, 0.025, 0.007]] });
    foot.position.set(s * (XJ - 0.045), TF / 2, (ZF + ZB) / 2);
    parts.push(foot);
  }
  // Trous des coffrets (joues) : disques sombres affleurants.
  const dark = holesJ.map(([s, y, z]) => at(S.cyl(0.0035, 0.001, 'blackOxide', { axis: 'x', seg: 8 }), [s * (XJ + 0.0002), y, z]));
  P('2', group(merged(parts, 'grey'), merged(dark, 'blackOxide')), [0, 0.1, -0.12]);

  // 1 — gyrophare orange : embase noire à trois pattes, globe strié.
  const beacon = group(
    lathe([[0, 0], [0.05, 0], [0.05, 0.012], [0.042, 0.022], [0, 0.022]], 'black', { seg: 20 }),
    lathe([[0, 0.022], [0.036, 0.022], [0.036, 0.085], [0.03, 0.105], [0.016, 0.115], [0, 0.117]], 'orange', { seg: 20 }),
  );
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    beacon.add(box(0.03, 0.006, 0.018, 'black', { pos: [Math.cos(a) * 0.058, 0.003, Math.sin(a) * 0.058], rot: [0, -a, 0] }));
  }
  P('1', at(beacon, [-0.06, YR, 0]), [0, 0.22, -0.12]);

  // ---------------------------------------------------------------- 3, 4 — plaques de façade
  const zP = ZF + T / 2; // plan médian des plaques, devant les ailes
  const face = (y0, y1, holes, cuts) => {
    const pl = K.plate(2 * XJ, y1 - y0, T, 'lightGrey', { holes, cutouts: cuts, seg: 20 });
    pl.rotation.x = Math.PI / 2;
    pl.position.set(0, (y0 + y1) / 2, zP);
    return pl;
  };
  const hx = XJ - 0.0175;
  const ym3 = (PL.y3[0] + PL.y3[1]) / 2, ym4 = (PL.y4[0] + PL.y4[1]) / 2;
  // Plaque haute : sélecteur, actionneur, câble d'accélérateur, lumière ovale.
  const p3 = face(...PL.y3, [
    [-hx, -0.045, 0.0035], [hx, -0.045, 0.0035], [-hx, 0.045, 0.0035], [hx, 0.045, 0.0035],
    [-0.11, 0, 0.022], [0.06, 0, 0.016], [0.14, 0, 0.012],
  ], [[-0.165, 0, 0.018, 0.05]]);
  P('3', p3, [0, 0, 0.18]);
  // Plaque basse : étiquette des six vannes.
  const p4 = face(...PL.y4, [[-hx, -0.045, 0.0035], [hx, -0.045, 0.0035], [-hx, 0.045, 0.0035], [hx, 0.045, 0.0035]], []);
  const label = at(nameplate(0.3, 0.05, { material: 'white' }), [-0.02, ym4 + 0.03, ZF + T]);
  P('4', group(p4, label), [0, -0.05, 0.18]);

  // ---------------------------------------------------------------- vis de façade 6, rondelles 8, écrous 10
  const zH = ZF + T; // face avant des plaques
  let nNut = 0;
  for (const ym of [ym3, ym4]) {
    for (const sx of [-1, 1]) for (const dy of [-0.045, 0.045]) {
      const p = [sx * hx, ym + dy, zH];
      P('8', K.washer(0.25 * IN, 'zinc', { axis: 'z', pos: p, seg: 6 }), [0, 0, 0.24]);
      P('6', K.screw(0.25 * IN, 1 * IN, 'zinc', { axis: 'z', pos: [p[0], p[1], zH + 0.04 * IN] }), [0, 0, 0.3]);
      // Écrous derrière les ailes pour la plaque basse.
      if (ym === ym4) {
        P('10', K.hex(0.4375 * IN, 0.22 * IN, 'zinc', { axis: 'z', pos: [p[0], p[1], ZF - T - 0.0028] }), [0, 0, -0.05]);
        nNut++;
      }
    }
  }
  void nNut;
  // Rondelles des écrous (côté intérieur des ailes).
  for (const sx of [-1, 1]) for (const dy of [-0.045, 0.045]) {
    P('8', K.washer(0.25 * IN, 'zinc', { axis: '-z', pos: [sx * hx, ym4 + dy, ZF - T], seg: 6 }), [0, 0, -0.03]);
  }

  // ---------------------------------------------------------------- vis des coffrets 5 et rondelles 8 (joues)
  for (const [s, y, z] of holesJ) {
    const ax = s > 0 ? 'x' : '-x';
    P('8', K.washer(0.25 * IN, 'zinc', { axis: ax, pos: [s * XJ, y, z], seg: 6 }), [s * 0.06, 0, 0]);
    P('5', K.screw(0.25 * IN, 0.75 * IN, 'zinc', { axis: ax, pos: [s * (XJ + 0.04 * IN), y, z] }), [s * 0.11, 0, 0]);
  }

  // ---------------------------------------------------------------- 7, 9 — vis des semelles
  for (const s of [-1, 1]) for (const dz of [-0.025, 0.025]) {
    const p = [s * (XJ - 0.045), TF, (ZF + ZB) / 2 + dz];
    P('9', K.washer(0.5 * IN, 'zinc', { pos: p, seg: 8 }), [0, 0.18, -0.12]);
    P('7', K.screw(0.5 * IN, 1.25 * IN, 'zinc', { pos: [p[0], TF + 0.08 * IN, p[2]] }), [0, 0.26, -0.12]);
  }

  void THREE;
  return { view: { dir: [0.9, 0.7, 1.2] } };
}
