// P078 — Console de commande hydraulique UM-051-300P-FMC-036 (pages 4.1 et
// 4.2) : cadre en tôle découpée, panneaux arrière, latéraux, du dessus et
// avant, pupitre incliné des leviers, contrôleur de sécurité et boîte de
// commande sur le dessus. 31 1/8 × 30 5/8 po, 58 29/32 po de haut hors tout
// (page 4.1 : la cote va jusqu'au haut du panneau du contrôleur de sécurité ;
// le dessus du corps est à 48 po, relevé sur le même dessin), 800 lb. Les
// composants hydrauliques (P079 à P081 : manomètres, distributeurs SDS150 et
// SD25, blocs, accumulateurs, vannes) sont posés pour l'aspect, sans repère.
// Couleurs d'après la photo de couverture : tôles blanches et grises, blocs bleus.
// Repère : origine au sol au centre, face des commandes vers +Z, Y vers le haut.
import { lister, each, IN } from './layout.js';

// h : hauteur hors tout (haut du panneau UM-051-703P du contrôleur) ; H : dessus du corps.
export const CON = { w: 31.125 * IN, d: 30.625 * IN, h: 58.906 * IN, H: 48 * IN };
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
export const CON_CABLE = [CON.w / 2 + 0.03, CON.H - 0.13, -0.33];
export const CON_SIDE_N = [1, 0, 0];

export function P078(api) {
  const { box, cyl, ring, tube, plate, extrude, bolt, group, at, gauge, valveBank, enclosure, ballValve, lathe, washer, nut } = api.S;
  const P = lister(api, 'P078');
  const { w, d, h, H } = CON;
  const z0 = -d / 2, z1 = d / 2;
  // Pupitre incliné à 45° (page 4.1, vue de côté) : de 0,66 m à l'avant jusqu'à 0,86 m, 0,205 m en retrait.
  const slope = { y0: 0.66, y1: 0.86, z: z1 - 0.205 };

  // Profil latéral (plan ZY) : avant vertical en bas, pupitre incliné, haut en retrait, dessus plat.
  const side = [[z0, 0], [z1, 0], [z1, slope.y0], [slope.z, slope.y1], [slope.z, H], [z0, H]];
  const sidePanel = (x, mat) => {
    const g = extrude(side, 0.004, mat);
    g.rotation.y = -Math.PI / 2;
    g.position.x = x;
    return g;
  };
  P('UM-051-397P', group(sidePanel(-w / 2, 'lightGrey'),
    // Découpes de fourche (passages du chariot) en bas.
    ...[-0.18, 0.18].map((z) => at(box(0.006, 0.08, 0.2, 'darkSteel', { r: 0.03 }), [-w / 2 - 0.002, 0.07, z]))), [-0.35, 0, 0]);
  P('UM-051-702P', group(sidePanel(w / 2, 'lightGrey'),
    ...[-0.18, 0.18].map((z) => at(box(0.006, 0.08, 0.2, 'darkSteel', { r: 0.03 }), [w / 2 + 0.002, 0.07, z]))), [0.35, 0, 0]);
  // Cadre intérieur (montants) et oreilles de levage (page 4.1 : deux par côté, haut à 1,31 m).
  const ear = () => lathe([[0.022, -0.006], [0.055, -0.006], [0.055, 0.006], [0.022, 0.006]], 'lightGrey', { axis: 'x', seg: 24 });
  api.add(group(
    ...[-1, 1].flatMap((s) => [z0 + 0.03, slope.z - 0.03].map((z) => at(box(0.03, H - 0.044, 0.03, 'grey', { r: 0.003 }), [s * (w / 2 - 0.03), 0.04 + (H - 0.044) / 2, z]))),
    ...[-1, 1].flatMap((s) => [z0 + 0.11, z0 + 0.44].map((z) => at(ear(), [s * (w / 2 - 0.06), H + 0.035, z]))),
    at(box(w, 0.04, d, 'grey', { r: 0.004 }), [0, 0.02, 0]),
  ));
  P('UM-051-327P', at(box(w - 0.01, H - 0.28, 0.004, 'lightGrey'), [0, (H - 0.28) / 2 + 0.08, z0 + 0.002]), [0, 0, -0.35]);
  P('UM-051-714P', at(box(w - 0.01, 0.198, 0.004, 'lightGrey'), [0, H - 0.101, z0 + 0.002]), [0, 0.1, -0.4]);
  // Dessus, percé pour le câble qui monte au contrôleur de sécurité (passe-fil plus bas).
  const topZ = (z0 + slope.z) / 2;
  const sc = { x: 0.14, y: 1.393, zp: slope.z - 0.08 }; // contrôleur SECFOR : centre, panneau UM-051-703P
  const ze = sc.zp + 0.0025 + 0.05; // caisson de 0,1 m de profondeur, dos contre son panneau
  const cab = { x: sc.x + 0.035, z: ze }; // presse-étoupe droit sous le caisson
  P('UM-051-706P', at(plate(w - 0.01, slope.z - z0, 0.004, 'lightGrey', { holes: [[cab.x, cab.z - topZ, 0.008]] }), [0, H, topZ]), [0, 0.35, 0]);
  // Panneaux avant blancs : bas (vannes et blocs) et haut (manomètres), pupitre incliné.
  P('UM-051-710P', at(box(w - 0.02, slope.y0 - 0.08, 0.004, 'white'), [0, (slope.y0 + 0.08) / 2, z1 - 0.002]), [0, 0, 0.35]);
  const sl = Math.hypot(z1 - slope.z, slope.y1 - slope.y0), sa = Math.atan2(z1 - slope.z, slope.y1 - slope.y0);
  P('UM-051-708P', group(
    at(box(w - 0.02, sl, 0.004, 'white'), [0, (slope.y0 + slope.y1) / 2, (z1 + slope.z) / 2], [-sa, 0, 0]),
    at(box(w - 0.02, H - slope.y1, 0.004, 'white'), [0, (H + slope.y1) / 2, slope.z]),
  ), [0, 0.1, 0.4]);

  // Face du haut (page 4.1, vue de face) : manomètres en rangée sous le dessus, bloc bleu à gauche,
  // sélecteurs et électrovanne à droite. fz : face avant du panneau vertical, où tout est posé.
  const fz = slope.z + 0.002;
  const deco = [];
  // Manomètres Pitanco (gros) et Stauff SPG-063 (4), dos contre le panneau : la queue du raccord
  // inférieur reçoit une courte conduite qui entre dans le panneau par un écrou de traversée.
  for (const [x, y, r] of [[-0.06, 1.16, 0.055], ...[0.04, 0.12, 0.2, 0.28].map((gx) => [gx, 1.152, 0.034])]) {
    const zc = fz + r * 0.275, yb = y - r * 1.4, ye = yb - 0.015;
    deco.push(at(gauge(r, { axis: 'z' }), [x, y, zc]));
    deco.push(tube([[x, yb + 0.002, zc], [x, yb - 0.006, zc], [x, ye + 0.002, zc - 0.004], [x, ye, fz + 0.001], [x, ye, fz - 0.012]], 0.003, 'steel', { seg: 20, radial: 10 }));
    deco.push(at(nut(0.011, 0.003, 'steel', { axis: 'z' }), [x, ye, fz + 0.0015]));
  }
  // Bloc bleu des réducteurs de pression et ses cartouches, sélecteurs, électrovanne.
  deco.push(at(box(0.13, 0.15, 0.05, 'umBlue', { r: 0.006 }), [-0.21, 1.012, fz + 0.025]));
  for (const [x, y] of [[-0.25, 1.06], [-0.25, 1.015], [-0.25, 0.965], [-0.175, 1.035]]) deco.push(at(cyl(0.013, 0.02, 'black', { axis: 'z', seg: 16 }), [x, y, fz + 0.058]));
  for (const [x, y] of [[-0.03, 0.98], [0.1, 0.995], [0.205, 0.995], [0.32, 1.0], [0.29, 0.905]]) deco.push(at(cyl(0.022, 0.03, 'black', { axis: 'z', seg: 18 }), [x, y, fz + 0.015]));
  deco.push(at(box(0.2, 0.055, 0.05, 'black', { r: 0.006 }), [0.13, 0.905, fz + 0.025]));
  deco.push(at(box(0.06, 0.06, 0.052, 'umBlue', { r: 0.004 }), [0.13, 0.905, fz + 0.026]));
  // Distributeurs SDS150 (3 leviers) et SD25 (manette de rotation et 2 leviers) : corps sous la tôle
  // du pupitre, leviers perpendiculaires qui en sortent (page 4.1, vue de côté).
  const ny = Math.sin(sa), nz = Math.cos(sa);
  const tl = 0.35; // sortie des leviers le long du pupitre, depuis le bas
  const py = slope.y0 + tl * (slope.y1 - slope.y0), pz = z1 - tl * (z1 - slope.z);
  const under = (o, x, hb) => at(o, [x, py - ny * (hb / 2 + 0.012), pz - nz * (hb / 2 + 0.012)], [Math.PI / 2 - sa, 0, 0]);
  deco.push(under(valveBank(3, { sw: 0.05, h: 0.12, d: 0.1, material: 'darkSteel' }), -0.215, 0.12));
  deco.push(under(valveBank(2, { sw: 0.06, h: 0.13, d: 0.1, material: 'darkSteel' }), 0.175, 0.13));
  // Manette de rotation : corps sous la tôle, soufflet sur le pupitre, levier et poignée.
  deco.push(at(group(
    at(box(0.045, 0.1, 0.08, 'darkSteel', { r: 0.004 }), [0, -0.064, 0]),
    at(lathe([[0, 0], [0.03, 0], [0.027, 0.012], [0.016, 0.04], [0.011, 0.055], [0, 0.055]], 'black', { axis: 'y', seg: 20 }), [0, 0.002, 0]),
    at(group(
      at(cyl(0.008, 0.15, 'steel', { axis: 'y', seg: 12 }), [0, 0.11, 0]),
      at(lathe([[0, 0], [0.018, 0], [0.024, 0.04], [0.02, 0.11], [0, 0.12]], 'black', { axis: 'y', seg: 18 }), [0, 0.18, 0]),
    ), [0, 0.002, 0], [-0.15, 0, 0]),
  ), [0.04, py, pz], [Math.PI / 2 - sa, 0, 0]));
  // Accumulateur rouge (collier et patte vissée derrière le panneau du haut), bloc de sécurité,
  // blocs bleus et poignées en bas de la face.
  const acc = [-w / 2 + 0.2, slope.y1 + 0.05, slope.z - 0.12];
  deco.push(at(lathe([[0, 0], [0.06, 0.02], [0.065, 0.1], [0.04, 0.16], [0, 0.17]], 'red', { axis: 'y', seg: 24 }), acc));
  deco.push(at(ring(0.0685, 0.0625, 0.02, 'grey', { seg: 28 }), [acc[0], acc[1] + 0.06, acc[2]]));
  deco.push(at(box(0.04, 0.02, slope.z - 0.002 - (acc[2] + 0.066), 'grey'), [acc[0], acc[1] + 0.06, (slope.z - 0.002 + acc[2] + 0.066) / 2]));
  deco.push(at(box(0.18, 0.16, 0.1, 'umBlue', { r: 0.006 }), [-w / 2 + 0.16, 0.3, z1 + 0.05]));
  for (const [x, y] of [[-w / 2 + 0.12, 0.33], [-w / 2 + 0.2, 0.28], [-w / 2 + 0.14, 0.25]]) deco.push(at(cyl(0.012, 0.02, 'black', { axis: 'z', seg: 12 }), [x, y, z1 + 0.105]));
  deco.push(at(box(0.24, 0.1, 0.03, 'lightGrey', { r: 0.02 }), [0.12, 0.25, z1 + 0.015]));
  for (const x of [0.07, 0.17]) deco.push(at(ring(0.03, 0.018, 0.02, 'black', { axis: 'z', seg: 20 }), [x, 0.25, z1 + 0.035]));
  for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) {
    deco.push(at(cyl(0.008, 0.16, 'steel', { axis: 'y', seg: 10 }), [x, 0.48, z1 + 0.03], [0.6, 0, 0]));
    deco.push(at(cyl(0.012, 0.04, 'black', { axis: 'y', seg: 12 }), [x, 0.55, z1 + 0.08]));
  }
  // Plaques d'identification (UM-064-CA…) : petites plaques blanches gravées, collées sur leur tôle
  // (sous le bloc bleu, sous le pupitre et en bas de la face).
  for (const [x, y, s, t, z] of [[-0.21, 0.9, 0.14, 0.05, fz], [0, 0.6, 0.2, 0.06, z1], [0, 0.12, 0.3, 0.06, z1]]) deco.push(at(api.S.nameplate(s, t, { material: 'white' }), [x, y, z]));
  api.add(group(deco));

  // 2 — Bloc 3 voies 3/4 NPT (eau) sur le flanc droit, vannes à bille.
  P('UM-020-643P', group(
    at(box(0.08, 0.16, 0.06, 'umBlue', { r: 0.005 }), [w / 2 + 0.04, 0.42, z1 - 0.12]),
    at(ballValve(0.04, 'brass', { axis: 'y' }), [w / 2 + 0.04, 0.55, z1 - 0.12]),
    at(ballValve(0.04, 'brass', { axis: 'y' }), [w / 2 + 0.04, 0.29, z1 - 0.12]),
  ), [0.3, 0, 0]);

  // 11 — Panneau de l'interrupteur, 12 — panneau du contrôleur, 13 — support coulissant, 14 — support de traversée.
  // Sur le dessus (page 4.1) : poste 10250H à gauche, dos contre son panneau UM-051-713P tenu par le
  // support UM-051-716P ; contrôleur SECFOR à droite, vissé sur son panneau vertical UM-051-703P
  // (pied plié sur le dessus) dont le haut fait la cote hors tout de 58 29/32 po.
  const sw = { x: -0.2, z: slope.z - 0.035 }; // poste 10250H (0,08 × 0,165 × 0,07), face au ras du panneau avant
  P('UM-051-713P', at(box(0.12, 0.2, 0.005, 'lightGrey'), [sw.x, H + 0.102, sw.z - 0.0375]), [0, 0.3, 0]);
  P('UM-051-703P', group(
    at(box(0.24, h - H - 0.002, 0.005, 'lightGrey'), [sc.x, (h + H + 0.002) / 2, sc.zp]),
    at(box(0.24, 0.004, 0.04, 'lightGrey'), [sc.x, H + 0.004, sc.zp - 0.0225]),
  ), [0, 0.3, 0]);
  P('UM-051-716P', at(box(0.05, 0.12, 0.04, 'grey', { r: 0.004 }), [sw.x, H + 0.062, sw.z - 0.06]), [-0.2, 0.3, 0]);
  P('UM-051-717P', at(box(0.1, 0.06, 0.05, 'grey', { r: 0.004 }), [w / 2 - 0.12, H + 0.032, z0 + 0.1]), [0.2, 0.3, 0]);
  // 15 — Poste de commande spécial (marche / arrêt), 16 — contrôleur de sécurité SECFOR (arrêt d'urgence, réarmement).
  P('10250H', group(
    at(box(0.08, 0.165, 0.07, 'black', { r: 0.01 }), [sw.x, H + 0.0975, sw.z]),
    at(cyl(0.015, 0.012, 'green', { axis: 'z' }), [sw.x, H + 0.135, sw.z + 0.039]),
    at(cyl(0.015, 0.012, 'lampRed', { axis: 'z' }), [sw.x, H + 0.07, sw.z + 0.039]),
  ), [0, 0.45, 0.1]);
  P('UM-CIT-SC-UG', group(
    at(enclosure(0.21, 0.155, 0.1, 'lightGrey'), [sc.x, sc.y, ze]),
    at(cyl(0.022, 0.03, 'red', { axis: 'z' }), [sc.x + 0.05, sc.y - 0.022, ze + 0.065]),
    at(cyl(0.014, 0.02, 'yellow', { axis: 'z' }), [sc.x - 0.05, sc.y - 0.022, ze + 0.062]),
    // Câble du contrôleur vers le flanc du poste de commande 10250H (arrêt d'urgence), presse-étoupe à chaque bout.
    tube([[sc.x - 0.104, 1.37, ze], [sc.x - 0.14, 1.37, ze], [-0.06, 1.335, ze - 0.01], [sw.x + 0.075, 1.31, sw.z], [sw.x + 0.039, 1.31, sw.z]], 0.006, 'black', { seg: 24, ends: 'gland', endMaterial: 'black', radial: 8 }),
  ), [0, 0.6, 0.1]);

  // 1 — Vis 1/4-20 × 3/4 et 10 — rondelles inox (40) au pourtour des panneaux latéraux.
  const pts = [];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 10; i++) pts.push([s * (w / 2 + 0.002), 0.1 + (i / 9) * (H - 0.2), z0 + 0.03]);
    for (let i = 0; i < 10; i++) pts.push([s * (w / 2 + 0.002), 0.1 + (i / 9) * (slope.y0 - 0.18), z1 - 0.03]);
  }
  each(P, 'BS25-750', pts.map((p) => at(bolt(0.0064, 0.019, 'zinc', { axis: p[0] > 0 ? 'x' : '-x' }), [p[0] + Math.sign(p[0]) * 0.002, p[1], p[2]])), (i) => [i < 20 ? -0.15 : 0.15, 0, 0]);
  each(P, 'WS25', pts.map((p) => at(washer(0.008, 0.0035, 0.0015, 'zinc', { axis: 'x' }), p)), (i) => [i < 20 ? -0.12 : 0.12, 0, 0]);

  // Traversées des boyaux (laiton) : plaque arrière côté foreuse, plaque du flanc droit côté groupe
  // (au-dessus de la découpe de fourche), tube d'eau intérieur du bloc 3 voies à sa traversée,
  // presse-étoupe du câble de commande en haut du flanc et câble intérieur qui monte par le passe-fil
  // du dessus jusqu'au presse-étoupe sous le contrôleur.
  const backPorts = [...CON_ROT, CON_WATER, ...CON_SLED];
  api.add(group(
    at(box(0.6, 0.14, 0.01, 'lightGrey'), [0, 0.16, z0 - 0.005]),
    at(box(0.01, 0.1, 0.36, 'lightGrey'), [w / 2 + 0.005, 0.18, -0.13]),
    ...backPorts.map(([x, y, z]) => at(cyl(0.022, 0.05, 'brass', { axis: 'z', seg: 18 }), [x, y, z + 0.025])),
    ...CON_PACK.map(([x, y, z], i) => at(cyl(i === 0 ? 0.024 : 0.019, 0.05, 'brass', { axis: 'x', seg: 18 }), [x - 0.025, y, z])),
    tube([[w / 2 + 0.01, 0.42, z1 - 0.12], [w / 2 - 0.1, 0.36, z1 - 0.14], [w / 2 - 0.12, 0.3, 0.05], [CON_WATER[0], CON_WATER[1], z0 + 0.06], [CON_WATER[0], CON_WATER[1], z0 + 0.005]], 0.01, 'steel', { seg: 24 }),
    at(cyl(0.016, 0.03, 'black', { axis: 'x', seg: 14 }), [CON_CABLE[0] - 0.015, CON_CABLE[1], CON_CABLE[2]]),
    tube([[w / 2 + 0.005, CON_CABLE[1], CON_CABLE[2]], [w / 2 - 0.03, CON_CABLE[1], CON_CABLE[2]], [0.3, CON_CABLE[1] + 0.02, -0.2], [0.21, H - 0.1, slope.z - 0.08],
      [cab.x, H - 0.06, cab.z], [cab.x, H - 0.03, cab.z], [cab.x, H + 0.03, cab.z], [cab.x, sc.y - 0.0885, cab.z]], 0.005, 'black', { seg: 24 }),
    at(ring(0.014, 0.0055, 0.01, 'rubber', { seg: 16 }), [cab.x, H, cab.z]), // passe-fil du panneau du dessus
  ));
  return { view: { dir: [0.6, 0.45, 1.2] } };
}
