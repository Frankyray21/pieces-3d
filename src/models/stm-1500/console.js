// P078 — Console de commande hydraulique UM-051-300P-FMC-036 (pages 4.1 et
// 4.2) : cadre en tôle découpée, panneaux arrière, latéraux, du dessus et
// avant, pupitre incliné des leviers, contrôleur de sécurité et boîte de
// commande sur le dessus. 31 1/8 × 30 5/8 × 58 29/32 po, 800 lb. Les
// composants hydrauliques (P079 à P081 : manomètres, distributeurs SDS150 et
// SD25, blocs, accumulateurs, vannes) sont posés pour l'aspect, sans repère.
// Couleurs d'après la photo de couverture : tôles blanches et grises, blocs bleus.
// Repère : origine au sol au centre, face des commandes vers +Z, Y vers le haut.
import { lister, each, IN } from './layout.js';

export const CON = { w: 31.125 * IN, d: 30.625 * IN, h: 58.906 * IN };
// Raccords rapides (repère de la console, chaque orifice avec sa normale de sortie) :
// - arrière (côté foreuse, l'opérateur se tient devant les commandes et regarde la
//   foreuse par-dessus la console) : rotation A et B, avance, vérins, eau ;
// - flanc droit (+X) : boyaux du groupe hydraulique (pression, retour, drain) et
//   câble de commande, qui entre en haut du flanc vers le contrôleur de sécurité.
const BACK = -CON.d / 2 - 0.05;
// Arrière, une rangée de gauche à droite vue de dos : rotation A, rotation B, eau (reliée
// au bloc 3 voies du flanc), puis les quatre boyaux du bloc du traîneau.
export const CON_ROT = [[0.24, 0.16, BACK], [0.16, 0.16, BACK]];
export const CON_WATER = [0.08, 0.16, BACK];
export const CON_SLED = [0, -0.08, -0.16, -0.24].map((x) => [x, 0.16, BACK]);
export const CON_BACK_N = [0, 0, -1];
export const CON_PACK = [-0.25, -0.13, -0.01].map((z) => [CON.w / 2 + 0.05, 0.18, z]);
export const CON_CABLE = [CON.w / 2 + 0.03, CON.h - 0.25, -0.33];
export const CON_SIDE_N = [1, 0, 0];

export function P078(api) {
  const { box, cyl, ring, tube, hose, rod, plate, extrude, bolt, group, at, gauge, valveBank, enclosure, ballValve, torus, lathe, merged, washer } = api.S;
  const P = lister(api, 'P078');
  const { w, d, h } = CON;
  const z0 = -d / 2, z1 = d / 2;
  const slope = { y0: 0.62, y1: 1.0, z: z1 - 0.16 }; // pupitre incliné : de l'avant bas vers le haut en retrait

  // Profil latéral (plan ZY) : avant vertical en bas, pupitre incliné, haut en retrait, oreilles de levage.
  const side = [[z0, 0], [z1, 0], [z1, slope.y0], [slope.z, slope.y1], [slope.z, h - 0.12], [z0 + 0.1, h - 0.12], [z0, h - 0.22]];
  const sidePanel = (x, mat) => {
    const g = extrude(side, 0.004, mat, { holes: [[-0.12, 0.08, 0.0], [0.12, 0.08, 0.0]].filter((o) => o[2] > 0) });
    g.rotation.y = -Math.PI / 2;
    g.position.x = x;
    return g;
  };
  P('UM-051-397P', group(sidePanel(-w / 2, 'lightGrey'),
    // Découpes de fourche (passages du chariot) en bas.
    ...[-0.18, 0.18].map((z) => at(box(0.006, 0.08, 0.2, 'darkSteel', { r: 0.03 }), [-w / 2 - 0.002, 0.07, z]))), [-0.35, 0, 0]);
  P('UM-051-702P', group(sidePanel(w / 2, 'lightGrey'),
    ...[-0.18, 0.18].map((z) => at(box(0.006, 0.08, 0.2, 'darkSteel', { r: 0.03 }), [w / 2 + 0.002, 0.07, z]))), [0.35, 0, 0]);
  // Cadre intérieur (montants) et oreilles de levage.
  api.add(group(
    ...[-1, 1].flatMap((s) => [z0 + 0.03, slope.z - 0.03].map((z) => at(box(0.03, h - 0.15, 0.03, 'grey', { r: 0.003 }), [s * (w / 2 - 0.03), (h - 0.15) / 2, z]))),
    ...[-1, 1].map((s) => at(lathe([[0.025, -0.006], [0.07, -0.006], [0.07, 0.006], [0.025, 0.006]], 'lightGrey', { axis: 'x', seg: 24 }), [s * (w / 2 - 0.06), h - 0.07, z0 + 0.12])),
    ...[-1, 1].map((s) => at(lathe([[0.025, -0.006], [0.07, -0.006], [0.07, 0.006], [0.025, 0.006]], 'lightGrey', { axis: 'x', seg: 24 }), [s * (w / 2 - 0.06), h - 0.07, z0 + 0.38])),
    at(box(w, 0.04, d, 'grey', { r: 0.004 }), [0, 0.02, 0]),
  ));
  P('UM-051-327P', at(box(w - 0.01, h - 0.3, 0.004, 'lightGrey'), [0, (h - 0.3) / 2 + 0.08, z0 + 0.002]), [0, 0, -0.35]);
  P('UM-051-714P', at(box(w - 0.01, 0.2, 0.004, 'lightGrey'), [0, h - 0.24, z0 + 0.002]), [0, 0.1, -0.4]);
  P('UM-051-706P', at(box(w - 0.01, 0.004, slope.z - z0 - 0.1, 'lightGrey'), [0, h - 0.12, (slope.z + z0 + 0.1) / 2]), [0, 0.35, 0]);
  // Panneaux avant blancs : bas (vannes et blocs) et haut (manomètres), pupitre incliné.
  P('UM-051-710P', at(box(w - 0.02, slope.y0 - 0.08, 0.004, 'white'), [0, (slope.y0 + 0.08) / 2, z1 - 0.002]), [0, 0, 0.35]);
  const sl = Math.hypot(z1 - slope.z, slope.y1 - slope.y0), sa = Math.atan2(z1 - slope.z, slope.y1 - slope.y0);
  P('UM-051-708P', group(
    at(box(w - 0.02, sl, 0.004, 'white'), [0, (slope.y0 + slope.y1) / 2, (z1 + slope.z) / 2], [-sa, 0, 0]),
    at(box(w - 0.02, h - 0.12 - slope.y1, 0.004, 'white'), [0, (h - 0.12 + slope.y1) / 2, slope.z]),
  ), [0, 0.1, 0.4]);

  // Manomètres (Stauff, Pitanco) en haut de la face, sélecteurs et vannes ; distributeurs SDS150 et SD25 sur le pupitre.
  const fz = slope.z + 0.004;
  const deco = [];
  deco.push(at(gauge(0.065, { axis: 'z' }), [-w / 2 + 0.15, h - 0.3, fz + 0.03]));
  for (let i = 0; i < 4; i++) deco.push(at(gauge(0.045, { axis: 'z' }), [-0.08 + i * 0.1, h - 0.3, fz + 0.025]));
  for (let i = 0; i < 3; i++) deco.push(at(cyl(0.022, 0.03, 'black', { axis: 'z', seg: 18 }), [0.02 + i * 0.12, h - 0.48, fz + 0.015]));
  deco.push(at(box(0.18, 0.12, 0.05, 'umBlue', { r: 0.006 }), [-w / 2 + 0.17, h - 0.44, fz + 0.025]));
  deco.push(at(box(0.16, 0.05, 0.05, 'black', { r: 0.006 }), [0.0, h - 0.62, fz + 0.03]));
  deco.push(at(cyl(0.03, 0.02, 'umBlue', { axis: 'z' }), [0.0, h - 0.62, fz + 0.06]));
  // Normale du pupitre (vers l'opérateur) : les distributeurs sont posés dessus, leviers perpendiculaires.
  const ny = Math.sin(sa), nz = Math.cos(sa);
  const vy = (slope.y0 + slope.y1) / 2 + ny * 0.05, vz = (z1 + slope.z) / 2 + nz * 0.05;
  const left = valveBank(3, { sw: 0.05, h: 0.12, d: 0.1, material: 'darkSteel' });
  deco.push(at(left, [-w / 2 + 0.17, vy, vz], [-sa, 0, 0]));
  const right = valveBank(3, { sw: 0.055, h: 0.13, d: 0.1, material: 'darkSteel' });
  deco.push(at(right, [0.12, vy, vz], [-sa, 0, 0]));
  // Manette de rotation (joystick) entre les deux bancs.
  deco.push(at(group(at(cyl(0.012, 0.22, 'steel', { axis: 'y', seg: 12 }), [0, 0.11, 0]), at(lathe([[0, 0], [0.018, 0], [0.024, 0.04], [0.02, 0.11], [0, 0.12]], 'black', { axis: 'y', seg: 18 }), [0, 0.22, 0])), [0.0, vy, vz], [-sa + 0.35, 0, 0]));
  // Accumulateur rouge, bloc de sécurité, blocs bleus et poignées en bas de la face.
  deco.push(at(lathe([[0, 0], [0.06, 0.02], [0.065, 0.1], [0.04, 0.16], [0, 0.17]], 'red', { axis: 'y', seg: 24 }), [-w / 2 + 0.2, slope.y1 + 0.05, slope.z - 0.12]));
  deco.push(at(box(0.18, 0.16, 0.1, 'umBlue', { r: 0.006 }), [-w / 2 + 0.16, 0.3, z1 + 0.05]));
  for (const [x, y] of [[-w / 2 + 0.12, 0.33], [-w / 2 + 0.2, 0.28], [-w / 2 + 0.14, 0.25]]) deco.push(at(cyl(0.012, 0.02, 'black', { axis: 'z', seg: 12 }), [x, y, z1 + 0.105]));
  deco.push(at(box(0.24, 0.1, 0.03, 'lightGrey', { r: 0.02 }), [0.12, 0.25, z1 + 0.015]));
  for (const x of [0.07, 0.17]) deco.push(at(ring(0.03, 0.018, 0.02, 'black', { axis: 'z', seg: 20 }), [x, 0.25, z1 + 0.035]));
  for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) {
    deco.push(at(cyl(0.008, 0.16, 'steel', { axis: 'y', seg: 10 }), [x, 0.48, z1 + 0.03], [0.6, 0, 0]));
    deco.push(at(cyl(0.012, 0.04, 'black', { axis: 'y', seg: 12 }), [x, 0.55, z1 + 0.08]));
  }
  // Plaques d'identification (UM-064-CA…) : petites plaques blanches gravées.
  for (const [x, y, s] of [[-0.15, slope.y1 + 0.05, 0.22], [0.15, slope.y1 + 0.05, 0.2], [0.0, 0.1, 0.3]]) deco.push(at(api.S.nameplate(s, 0.06, { material: 'white' }), [x, y, (y > 0.5 ? fz : z1) + 0.003]));
  api.add(group(deco));

  // 2 — Bloc 3 voies 3/4 NPT (eau) sur le flanc droit, vannes à bille.
  P('UM-020-643P', group(
    at(box(0.08, 0.16, 0.06, 'umBlue', { r: 0.005 }), [w / 2 + 0.04, 0.42, z1 - 0.12]),
    at(ballValve(0.04, 'brass', { axis: 'y' }), [w / 2 + 0.04, 0.55, z1 - 0.12]),
    at(ballValve(0.04, 'brass', { axis: 'y' }), [w / 2 + 0.04, 0.29, z1 - 0.12]),
  ), [0.3, 0, 0]);

  // 11 — Panneau de l'interrupteur, 12 — panneau du contrôleur, 13 — support coulissant, 14 — support de traversée.
  const ty = h - 0.12;
  P('UM-051-713P', at(box(0.14, 0.2, 0.005, 'lightGrey'), [-w / 2 + 0.13, ty + 0.1, slope.z - 0.08]), [0, 0.3, 0]);
  P('UM-051-703P', at(box(0.34, 0.26, 0.005, 'lightGrey'), [0.1, ty + 0.13, slope.z - 0.12]), [0, 0.3, 0]);
  P('UM-051-716P', at(box(0.04, 0.12, 0.08, 'grey', { r: 0.004 }), [-w / 2 + 0.06, ty + 0.06, slope.z - 0.04]), [-0.2, 0.3, 0]);
  P('UM-051-717P', at(box(0.1, 0.06, 0.05, 'grey', { r: 0.004 }), [w / 2 - 0.1, ty + 0.03, z0 + 0.1]), [0.2, 0.3, 0]);
  // 15 — Poste de commande spécial (marche / arrêt), 16 — contrôleur de sécurité SECFOR (arrêt d'urgence, réarmement).
  P('10250H', group(
    at(box(0.1, 0.17, 0.09, 'black', { r: 0.01 }), [-w / 2 + 0.13, ty + 0.13, slope.z - 0.03]),
    at(cyl(0.015, 0.012, 'green', { axis: 'z' }), [-w / 2 + 0.13, ty + 0.17, slope.z + 0.02]),
    at(cyl(0.015, 0.012, 'lampRed', { axis: 'z' }), [-w / 2 + 0.13, ty + 0.1, slope.z + 0.02]),
  ), [0, 0.45, 0.1]);
  P('UM-CIT-SC-UG', group(
    at(enclosure(0.3, 0.2, 0.12, 'lightGrey'), [0.1, ty + 0.17, slope.z - 0.05]),
    at(cyl(0.026, 0.03, 'red', { axis: 'z' }), [0.18, ty + 0.17, slope.z + 0.03]),
    at(cyl(0.02, 0.02, 'yellow', { axis: 'z' }), [0.0, ty + 0.15, slope.z + 0.025]),
    // Câble du contrôleur vers le poste de commande 10250H (arrêt d'urgence), au-dessus du panneau.
    tube([[-0.05, ty + 0.12, slope.z - 0.06], [-0.2, ty + 0.12, slope.z - 0.06], [-w / 2 + 0.18, ty + 0.1, slope.z - 0.03]], 0.008, 'black', { seg: 16 }),
  ), [0, 0.6, 0.1]);

  // 1 — Vis 1/4-20 × 3/4 et 10 — rondelles inox (40) au pourtour des panneaux latéraux.
  const pts = [];
  for (const s of [-1, 1]) for (let i = 0; i < 20; i++) {
    const k = i / 19;
    pts.push(i < 10 ? [s * (w / 2 + 0.002), 0.1 + k * 2 * (h - 0.35), z0 + 0.03] : [s * (w / 2 + 0.002), 0.1 + (k - 0.5) * 2 * (slope.y0 - 0.15), z1 - 0.03]);
  }
  each(P, 'BS25-750', pts.map((p) => at(bolt(0.0064, 0.019, 'zinc', { axis: p[0] > 0 ? 'x' : '-x' }), [p[0] + Math.sign(p[0]) * 0.002, p[1], p[2]])), (i) => [i < 20 ? -0.15 : 0.15, 0, 0]);
  each(P, 'WS25', pts.map((p) => at(washer(0.008, 0.0035, 0.0015, 'zinc', { axis: 'x' }), p)), (i) => [i < 20 ? -0.12 : 0.12, 0, 0]);

  // Traversées des boyaux (laiton) : plaque arrière côté foreuse, plaque du flanc droit côté groupe
  // (au-dessus de la découpe de fourche), tube d'eau intérieur du bloc 3 voies à sa traversée,
  // presse-étoupe du câble de commande en haut du flanc et câble intérieur jusque sous le contrôleur.
  const backPorts = [...CON_ROT, CON_WATER, ...CON_SLED];
  api.add(group(
    at(box(0.6, 0.14, 0.01, 'lightGrey'), [0, 0.16, z0 - 0.005]),
    at(box(0.01, 0.1, 0.36, 'lightGrey'), [w / 2 + 0.005, 0.18, -0.13]),
    ...backPorts.map(([x, y, z]) => at(cyl(0.022, 0.05, 'brass', { axis: 'z', seg: 18 }), [x, y, z + 0.025])),
    ...CON_PACK.map(([x, y, z], i) => at(cyl(i === 0 ? 0.024 : 0.019, 0.05, 'brass', { axis: 'x', seg: 18 }), [x - 0.025, y, z])),
    tube([[w / 2 + 0.01, 0.42, z1 - 0.12], [w / 2 - 0.1, 0.36, z1 - 0.14], [w / 2 - 0.12, 0.3, 0.05], [CON_WATER[0], CON_WATER[1], z0 + 0.06], [CON_WATER[0], CON_WATER[1], z0 + 0.005]], 0.01, 'steel', { seg: 24 }),
    at(cyl(0.016, 0.03, 'black', { axis: 'x', seg: 14 }), [CON_CABLE[0] - 0.015, CON_CABLE[1], CON_CABLE[2]]),
    tube([[w / 2 - 0.02, CON_CABLE[1], CON_CABLE[2]], [0.15, h - 0.2, -0.1], [0.1, h - 0.14, slope.z - 0.05], [0.1, h - 0.05, slope.z - 0.05]], 0.008, 'black', { seg: 16 }),
    at(ring(0.018, 0.009, 0.012, 'rubber', { seg: 16 }), [0.1, h - 0.12, slope.z - 0.05]), // passe-fil du panneau du dessus
  ));
  return { view: { dir: [0.6, 0.45, 1.2] } };
}
