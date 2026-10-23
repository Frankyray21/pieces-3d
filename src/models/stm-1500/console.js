// P078 — Console de commande hydraulique UM-051-300P-FMC-036 (pages 4.1 et
// 4.2) : cadre soudé en tôle découpée (flasques latérales à oreilles de levage,
// tôle avant basse à deux arches, face haute, traverses), panneaux arrière,
// latéraux, du dessus et avant (pupitre incliné et sa jupe, petite plaque basse),
// contrôleur de sécurité et poste de commande sur le dessus. Corps de 28 po sur
// 30 5/8 po (712 × 778 mm) : la cote de 31 1/8 po (790,58 mm) de la page 4.1 est
// un hors-tout qui comprend le bloc d'eau 3 voies et ses vannes, en saillie de
// 79 mm sur le flanc droit. 58 29/32 po de haut hors tout (haut du panneau du
// contrôleur de sécurité ; dessus du corps à 48 po), 800 lb.
// P079 — Composants hydrauliques de la console UM-051-FMC-036-5 (page 4.3) :
// manomètres, distributeurs SDS150 et SD25, blocs, accumulateurs, vannes, chacun
// avec son repère ; inséré dans P078 (ligne 17) comme sous-assemblage.
// Couleurs d'après la photo de couverture : tôles blanches et grises, blocs bleus.
// Repère : origine au sol au centre, face des commandes vers +Z, Y vers le haut.
import { lister, each, IN } from './layout.js';

// w : largeur du corps (flancs) ; h : hauteur hors tout (haut du panneau UM-051-703P du contrôleur) ; H : dessus du corps.
export const CON = { w: 0.712, d: 30.625 * IN, h: 58.906 * IN, H: 48 * IN };
const z0 = -CON.d / 2, z1 = CON.d / 2;
// Pupitre incliné à 45° (page 4.1, vue de côté) : de 0,666 m à l'avant jusqu'à 0,866 m, face haute 0,2 m en retrait.
const slope = { y0: 0.666, y1: 0.866, z: z1 - 0.2 };
const fz = slope.z; // face avant de la face haute, où sont posés blocs, boutons et plaques
const s2 = Math.SQRT1_2;
const nrm = [0, s2, s2], up = [0, s2, -s2]; // normale du pupitre (avant-haut) et sa pente (vers le haut et l'arrière)
const add = (pt, v, k) => pt.map((c, i) => c + v[i] * k);

// Raccords (repère de la console, chaque orifice avec sa normale de sortie). Boyaux : traversées
// d'une plaque intérieure gris foncé (page 4.3), en bas à l'arrière, dont les embouts arrivent au
// ras du panneau arrière UM-051-714P (percé à leur droit, plaque CA9 en face) : une rangée de
// 9 orifices à 0,17 m du sol, normale CON_BACK_N. De +X vers -X (vu de face) : pression, retour
// et drain du groupe (CON_PACK, de -X vers +X : drain, retour, pression 1 po), rotation A et B,
// puis les quatre boyaux du bloc du traîneau.
// - eau : bout arrière (adaptateur 2404-16-16) de la vanne haute du bloc 3 voies du flanc droit ;
// - câble de commande du groupe : hypothèse (le manuel ne dessine aucune entrée de câble sur la
//   caisse) : presse-étoupe au bout du capot du connecteur HDC 10B, sur le flanc +X du
//   contrôleur SECFOR, sortie vers +X (CON_SIDE_N).
const BACK = z0 - 0.0005;
const PORT_Y = 0.17;
export const CON_PACK = [0.165, 0.225, 0.29].map((x) => [x, PORT_Y, BACK]);
export const CON_ROT = [[0.095, PORT_Y, BACK], [0.03, PORT_Y, BACK]];
export const CON_SLED = [-0.1, -0.16, -0.22, -0.28].map((x) => [x, PORT_Y, BACK]);
export const CON_WATER = [0.3785, 0.54, 0.205];
export const CON_BACK_N = [0, 0, -1];
export const CON_CABLE = [0.312, 1.3945, 0.1705];
// Tracés imposés pour P002 (du sol jusqu'au raccord, sol à 0,025 m sous l'axe du boyau) :
// - groupe (CON_PACK) : chaque boyau sort droit vers l'arrière, tourne vers +X (la pression la première, le
//   drain le plus loin) et descend au sol au-delà du flanc +X, en deçà de la chute du câble de commande (x ≈ 0,86), voies imbriquées sans croisement ;
// - eau : le boyau longe le flanc +X vers l'arrière au-dessus des traversées, passe derrière la console et
//   descend au sol entre les boyaux de rotation et ceux du traîneau.
const PACK_R = [0.017, 0.017, 0.022];
export const CON_PACK_VIA = CON_PACK.map((p, j) => {
  const k = 2 - j, fy = 0.025 + PACK_R[j], zt = BACK - 0.12 - k * 0.08;
  return [[0.6 + k * 0.1, fy, zt - 0.08], [0.45 + k * 0.1, fy + 0.03, zt - 0.06], [p[0] + 0.1, 0.13, zt - 0.02], [p[0], PORT_Y, zt + 0.04],
    [p[0], PORT_Y, BACK - 0.05], [p[0], PORT_Y, BACK - 0.015], p];
});
export const CON_WATER_VIA = [[-0.035, 0.045, -0.79], [-0.035, 0.12, -0.76], [0, 0.3, -0.68], [0.3, 0.46, -0.54], [0.41, 0.5, -0.34],
  [0.4, 0.53, -0.02], [0.3785, 0.54, 0.13], [0.3785, 0.54, 0.17], CON_WATER];
export const CON_HOOK = [0.292, CON.H + 0.048, -0.105]; // centre du fond de l'encoche de 717P (Ø 37, ouverte vers -X), câble selon Z
export const CON_SIDE_N = [1, 0, 0];

// Distributeurs couchés sous le pupitre (pages 4.1 à 4.4) : repère local (x, u le long de la pente depuis
// l'arête basse du pupitre, n selon sa normale). Pivots des leviers au bout bas, sous l'arête ; leviers
// normaux à la pente. SDS150 : leviers AL01_M10X200 à x -0,265 / -0,215 / -0,165, pivots à y 0,60 et
// z1 - 0,06, pommeaux à 0,75 m et 9,3 cm devant la face ; corps de -0,275 à -0,105 (3 sections de 50 mm et
// couvercle d'entrée). SD25 : manette AL17/M12X250 puis 2 leviers AL01_M12X250 au pas de 66 mm (x 0,062 /
// 0,128 / 0,194), pivots à y 0,595 et z1 - 0,02, pointes à 0,805–0,81 m et 19–19,7 cm devant (hors tout
// avec leviers 975,38 mm).
const toUN = (y, z) => [((y - slope.y0) - (z - z1)) * s2, ((y - slope.y0) + (z - z1)) * s2];
const BANKS = {
  sds: { pv: toUN(0.60, z1 - 0.06), u: [0.006, 0.12], n: [-0.119, -0.059], x: [-0.275, -0.225, -0.175, -0.125], cover: -0.105,
    levers: [-0.265, -0.215, -0.165], shelf: [-0.333, -0.09], shelfU: [0.016, 0.14] },
  sd: { pv: toUN(0.595, z1 - 0.02), u: [-0.022, 0.125], n: [-0.1, -0.03], x: [0.051, 0.115, 0.179, 0.243], cover: 0.249,
    levers: [0.062, 0.128, 0.194], shelf: [-0.02, 0.333], shelfU: [-0.01, 0.14] },
};
const SHELF_T = 0.006;

// Outils de construction communs (tôles découpées, poses).
function outils(api) {
  const { group, at, cyl, merged, creaseNormals } = api.S;
  const THREE = api.THREE;
  const PI = Math.PI;
  // Tôle découpée : contour et trous (listes de points) dans le plan XY local, épaisseur t centrée sur Z.
  const sheet = (outline, holes, t, mat) => {
    const V2 = (p) => new THREE.Vector2(p[0], p[1]);
    let o = outline.map(V2);
    if (THREE.ShapeUtils.isClockWise(o)) o = o.reverse();
    const shape = new THREE.Shape(o);
    for (const hl of holes) {
      const q = hl.map(V2);
      const p = new THREE.Path();
      p.setFromPoints(THREE.ShapeUtils.isClockWise(q) ? q : q.reverse());
      shape.holes.push(p);
    }
    const mb = Math.min(t * 0.16, 0.0016);
    const geo = mb >= 0.0005
      ? new THREE.ExtrudeGeometry(shape, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 12 })
      : new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
    geo.translate(0, 0, mb >= 0.0005 ? -(t - 2 * mb) / 2 : -t / 2);
    return merged([new THREE.Mesh(creaseNormals(geo))], mat);
  };
  // Pose d'un objet construit dans son plan local : X local → X, Y local → Y, épaisseur selon X × Y.
  const place = (obj, X, Y, pos) => {
    const a = new THREE.Vector3(...X), b = new THREE.Vector3(...Y);
    const g = group(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(a, b, new THREE.Vector3().crossVectors(a, b)));
    g.position.set(...pos);
    return g;
  };
  const arc = (cx, cy, r, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const rrect = (x0, y0, x1, y1, r) => [...arc(x1 - r, y0 + r, r, -PI / 2, 0, 4), ...arc(x1 - r, y1 - r, r, 0, PI / 2, 4),
    ...arc(x0 + r, y1 - r, r, PI / 2, PI, 4), ...arc(x0 + r, y0 + r, r, PI, 1.5 * PI, 4)];
  const slot = (cx, cy, L, ht) => [...arc(cx + L / 2 - ht / 2, cy, ht / 2, -PI / 2, PI / 2, 10), ...arc(cx - L / 2 + ht / 2, cy, ht / 2, PI / 2, 1.5 * PI, 10)];
  const circle = (cx, cy, r, n = 20) => arc(cx, cy, r, 0, (2 * PI * (n - 1)) / n, n - 1);
  // Plaque d'identification UM-064-CA… de forme quelconque (alu blanc, rivets), posée sur le plan z = 0 local.
  const caPlate = (outline, holes, rivets) => group(sheet(outline, holes, 0.0012, 'white'),
    ...rivets.map(([x, y]) => at(cyl(0.0024, 0.0012, 'steel', { axis: 'z', seg: 8 }), [x, y, 0.0012])));
  // Pièce dans le repère du pupitre : X → X, Y local → pente (up), Z local → normale (nrm), origine à l'arête basse.
  const onDesk = (obj, pos = [0, 0, 0]) => place(obj, [1, 0, 0], up, add(add([pos[0], slope.y0, z1], up, pos[1]), nrm, pos[2]));
  // Patte plate horizontale (épaisseur t selon Y, largeur w) d'un point à l'autre dans le plan XZ.
  const strap = (a, b, w, t, mat = 'grey') => {
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz);
    return at(api.S.box(L, t, w, mat), [(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2], [0, -Math.atan2(dz, dx), 0]);
  };
  return { sheet, place, arc, rect, rrect, slot, circle, caPlate, onDesk, strap };
}

// Bloc 3 voies 3/4 NPT (eau, UM-020-643P) : corps bleu de 45 × 100 × 79 mm contre le flanc droit (page 4.1 :
// y 0,406–0,507, z 0,268–0,347), sur une entretoise du cadre, dans l'encoche de 702P. Ses vannes et raccords
// sont dans P079 (détail C).
function blocEau(api) {
  const { box, group, at } = api.S;
  return group(
    at(box(0.045, 0.101, 0.079, 'umBlue', { r: 0.003 }), [CON.w / 2 + 0.0225, 0.4565, 0.3075]),
    at(box(0.005, 0.09, 0.045, 'grey'), [CON.w / 2 - 0.0025, 0.4565, 0.3225]), // entretoise sur la flasque du cadre
  );
}

// Poste de commande spécial 10250H (page 4.1) : boîtier noir 80 × 165 × 80 mm, marche noire en haut (y 1,338),
// arrêt rouge dessous (y 1,297), petite étiquette au-dessus ; presse-étoupe gris sous le boîtier, posé sur le dessus.
const SW = { x: -0.2, z: 0.1589 }; // centre du boîtier, dos contre son panneau UM-051-713P
function poste10250H(api) {
  const { box, cyl, group, at, nut, lathe, nameplate } = api.S;
  const H = CON.H, zf = SW.z + 0.04;
  return group(
    at(box(0.08, 0.165, 0.08, 'black', { r: 0.01 }), [SW.x, H + 0.0975, SW.z]),
    at(cyl(0.016, 0.008, 'darkSteel', { axis: 'z' }), [SW.x, H + 0.119, zf + 0.004]),
    at(cyl(0.012, 0.006, 'black', { axis: 'z' }), [SW.x, H + 0.119, zf + 0.011]),
    at(cyl(0.016, 0.008, 'darkSteel', { axis: 'z' }), [SW.x, H + 0.078, zf + 0.004]),
    at(cyl(0.013, 0.008, 'red', { axis: 'z' }), [SW.x, H + 0.078, zf + 0.012]),
    at(nameplate(0.034, 0.014, { material: 'white' }), [SW.x, H + 0.15, zf]),
    // Presse-étoupe sous le boîtier (six-pans et dôme), sur le bord du panneau du dessus.
    at(nut(0.02, 0.006, 'grey'), [SW.x, H + 0.012, 0.1315]),
    at(lathe([[0, 0], [0.008, 0], [0.008, 0.004], [0.006, 0.0085], [0, 0.0095]], 'grey', { seg: 16 }), [SW.x, H + 0.0095, 0.1315], [Math.PI, 0, 0]),
  );
}

// Contrôleur de sécurité SECFOR UM-CIT-SC-UG (pages 4.1, 4.6 et 4.7) : boîte grise 210 × 155 × 94 mm à couvercle
// vissé (sans charnière ni serrure), face à z 0,220, dos sur son panneau 703P. Arrêt d'urgence ZB4BT4 à tête
// champignon Ø 43 (saillie 33 mm), réarmement jaune ZB4BA9 affleurant, 5 voyants (GUARD 1, GUARD 2, SPEED 1,
// au-dessus de RESET, près d'EMERGENCY STOP). Dessous : 2 fiches MS3106A-14S (embases C016 bouchées) et 2 pattes
// en L. Flanc +X : embase HDC 10B (HDC-1205000000) et son capot (HDC-1665230000), étriers et cordon ; câble vers le
// flanc du poste 10250H.
const SC = { x: 0.14, y: 1.393, zp: 0.124, zb: 0.1265, zf: 0.22 };
function secfor(api) {
  const { box, cyl, group, at, lathe, tube, nut } = api.S;
  const zc = (SC.zb + SC.zf) / 2, bw = 0.21, bh = 0.155;
  const g = [
    at(box(bw, bh, SC.zf - 0.006 - SC.zb, 'lightGrey', { r: 0.008 }), [SC.x, SC.y, (SC.zb + SC.zf - 0.006) / 2]),
    at(box(bw - 0.008, bh - 0.008, 0.006, 'lightGrey', { r: 0.004 }), [SC.x, SC.y, SC.zf - 0.003]), // couvercle
    // Arrêt d'urgence : collerette, tête champignon rouge.
    at(cyl(0.014, 0.022, 'black', { axis: 'z', seg: 20 }), [0.196, 1.376, SC.zf + 0.011]),
    at(lathe([[0, 0], [0.0215, 0], [0.0215, 0.006], [0.017, 0.011], [0, 0.011]], 'red', { axis: 'z', seg: 24 }), [0.196, 1.376, SC.zf + 0.022]),
    // Réarmement jaune affleurant dans sa lunette.
    at(cyl(0.015, 0.003, 'black', { axis: 'z', seg: 20 }), [0.097, 1.379, SC.zf + 0.0015]),
    at(cyl(0.011, 0.004, 'yellow', { axis: 'z', seg: 20 }), [0.097, 1.379, SC.zf + 0.002]),
    // Voyants.
    ...[[0.063, 1.444], [0.116, 1.444], [0.198, 1.444], [0.097, 1.402], [0.196, 1.404]].map(([x, y]) => at(cyl(0.003, 0.003, 'lamp', { axis: 'z', seg: 10 }), [x, y, SC.zf + 0.0015])),
    // Dessous : fiches MS3106A-14S sur leurs embases C016, pattes en L vissées au panneau 703P.
    ...[0.08, 0.18].flatMap((x) => [
      at(box(0.03, 0.004, 0.03, 'castIron'), [x, SC.y - bh / 2 - 0.002, 0.172]),
      at(cyl(0.015, 0.03, 'castIron', { seg: 18 }), [x, SC.y - bh / 2 - 0.019, 0.172]),
    ]),
    ...[0.05, 0.23].flatMap((x) => [
      at(box(0.02, 0.003, 0.035, 'grey'), [x, SC.y - bh / 2 - 0.0015, SC.zb + 0.0175]),
      at(box(0.02, 0.03, 0.003, 'grey'), [x, SC.y - bh / 2 - 0.015, SC.zb + 0.0015]),
    ]),
    // Câble vers le flanc droit du poste 10250H, presse-étoupe à chaque bout.
    tube([[SC.x - bw / 2, 1.37, zc], [SC.x - bw / 2 - 0.035, 1.37, zc], [-0.06, 1.33, zc - 0.01], [SW.x + 0.075, 1.31, SW.z], [SW.x + 0.04, 1.31, SW.z]],
      0.006, 'black', { seg: 24, ends: 'gland', endMaterial: 'black', radial: 8 }),
  ];
  // Connecteur HDC 10B sur le flanc +X : embase à tenons, capot fermé à deux étriers, petit cordon ; presse-étoupe du
  // câble du groupe au bout du capot (CON_CABLE, hypothèse).
  const x0 = SC.x + bw / 2, cy = CON_CABLE[1], cz = CON_CABLE[2];
  const clip = (s) => tube([[x0 + 0.024, cy + s * 0.05, cz + 0.022], [x0 + 0.026, cy + s * 0.052, cz + 0.027], [x0 + 0.04, cy + s * 0.047, cz + 0.027],
    [x0 + 0.044, cy + s * 0.04, cz + 0.026]], 0.0022, 'steel', { seg: 16, radial: 6 });
  g.push(
    at(box(0.02, 0.105, 0.055, 'grey', { r: 0.003 }), [x0 + 0.01, cy, cz]),
    ...[-1, 1].map((s) => at(cyl(0.004, 0.004, 'steel', { axis: 'x', seg: 10 }), [x0 + 0.022, cy + s * 0.05, cz + 0.022])),
    at(box(0.027, 0.09, 0.05, 'grey', { r: 0.005 }), [x0 + 0.0335, cy, cz]),
    clip(1), clip(-1),
    tube([[x0 + 0.02, cy - 0.045, cz - 0.026], [x0 + 0.03, cy - 0.058, cz - 0.03], [x0 + 0.04, cy - 0.05, cz - 0.026]], 0.0012, 'black', { seg: 10, radial: 5 }),
    at(nut(0.02, 0.006, 'black', { axis: 'x' }), [x0 + 0.05, cy, cz]),
    at(cyl(0.009, CON_CABLE[0] - x0 - 0.053, 'black', { axis: 'x', seg: 16 }), [(CON_CABLE[0] + x0 + 0.053) / 2, cy, cz]),
  );
  return group(g);
}

export function P078(api) {
  const { box, cyl, group, at, washer, bolt, nameplate } = api.S;
  const { sheet, place, arc, rect, rrect, slot, circle, caPlate, onDesk } = outils(api);
  const P = lister(api, 'P078');
  const { w, d, h, H } = CON;
  const PI = Math.PI;

  // ---------------------------------------------------------------- cadre (sans repère)
  // Flasques latérales du cadre (page 4.2 : tôles évidées, oreilles de levage dans leur plan) : profil
  // complet du corps, grandes fenêtres, longeron bas de 57 mm visible sous les panneaux, trous Ø 20 aux
  // coins bas (page 4.1, vue de côté). Les panneaux latéraux se vissent par-dessus, en retrait de 13 mm.
  const cf = z1 + slope.y0 - 0.008 * Math.SQRT2; // arête inclinée de la flasque, sous le pupitre
  const cw = cf - 0.08 * Math.SQRT2; // bord incliné de la fenêtre haute
  const frameSide = () => sheet(
    [[z0 + 0.004, 0], [z1 - 0.005, 0], [z1 - 0.005, cf - (z1 - 0.005)], [slope.z - 0.004, cf - (slope.z - 0.004)], [slope.z - 0.004, H], [z0 + 0.004, H]],
    [rect(z0 + 0.04, 0.06, z1 - 0.09, 0.47),
      [[z0 + 0.06, 0.53], [z1 - 0.07, 0.53], [z1 - 0.07, cw - (z1 - 0.07)], [slope.z - 0.06, cw - (slope.z - 0.06)], [slope.z - 0.06, H - 0.06], [z0 + 0.06, H - 0.06]],
      circle(z0 + 0.025, 0.03, 0.01), circle(z1 - 0.03, 0.03, 0.01)],
    0.018, 'grey');
  // Oreilles de levage (page 4.1, vue de côté) : tôle de 11 mm en pierre tombale, base de 0,18 m noyée dans
  // le haut de la flasque, arc R 65 concentrique au trou Ø 62 (bas du trou au ras du dessus), sommet à H + 96 mm,
  // centres à 113 et 443 mm de la face arrière, x = ±0,340.
  const earR = 0.065, earY = H + 0.031, earB = 0.09;
  const earT = Math.atan2(-0.031, earB) + Math.acos(earR / Math.hypot(earB, 0.031)); // point de tangence du flanc
  const ear = (zc) => sheet([[zc - earB, H - 0.03], [zc + earB, H - 0.03], [zc + earB, H], ...arc(zc, earY, earR, earT, PI - earT, 16), [zc - earB, H]],
    [circle(zc, earY, 0.031, 24)], 0.011, 'grey');
  // Tôle avant basse du cadre (page 4.1, vue de face) : deux arches de 75 mm entre trois pieds, fenêtre du bloc
  // bleu de synchronisation, ouverture derrière la plaque UM-051-710P.
  const archL = (xa, xb) => [[xa, 0], [xa, 0.045], ...arc(xa + 0.03, 0.045, 0.03, PI, PI / 2, 6), ...arc(xb - 0.03, 0.045, 0.03, PI / 2, 0, 6), [xb, 0]];
  const frontLow = sheet([[-w / 2, 0], ...archL(-0.277, -0.104), ...archL(0, 0.277), [w / 2, 0], [w / 2, 0.49], [-w / 2, 0.49]],
    [rect(-0.32, 0.203, -0.074, 0.424), rect(0.032, 0.205, 0.322, 0.405),
    ...[[-0.056, 0.33], [0.016, 0.33], [-0.056, 0.252], [0.016, 0.252]].map(([x, y]) => circle(x, y, 0.005, 12))], 0.005, 'grey');
  // Face haute du cadre : tôle grise qui porte le bloc bleu (fenêtre), les plaques CA1, CA2 et CA13, bord haut à
  // 1,11 m plié vers l'arrière (rebord des manomètres) ; au-dessus, bandeau ouvert jusqu'à la traverse haute,
  // gousset à gauche.
  const winUp = rect(-0.28, 0.957, -0.147, 1.097);
  const faceHi = sheet(rect(-0.345, slope.y1, 0.345, 1.11), [winUp], 0.004, 'grey');
  const gusset = sheet([[-0.345, 1.11], [-0.13, 1.11], [-0.13, 1.15], [-0.175, 1.195], [-0.345, 1.195]],
    [circle(-0.29, 1.16, 0.012), circle(-0.215, 1.16, 0.012)], 0.004, 'grey');
  // Tôle support des blocs bas, soudée aux flasques : fenêtre du bloc de synchronisation qui la traverse.
  const lowPlate = sheet(rect(-0.333, 0.18, 0.333, 0.44), [rect(-0.316, 0.208, -0.118, 0.412)], 0.01, 'grey');
  // Plaques inclinées sous le pupitre où sont vissés les distributeurs SDS150 et SD25 (soudées à la flasque) ;
  // celle du SDS150 s'arrête au-dessus des soufflets pour laisser passer les leviers.
  const deskShelf = (b) => onDesk(box(b.shelf[1] - b.shelf[0], b.shelfU[1] - b.shelfU[0], SHELF_T, 'grey'),
    [(b.shelf[0] + b.shelf[1]) / 2, (b.shelfU[0] + b.shelfU[1]) / 2, b.n[1] + SHELF_T / 2]);
  // Étagères pliées du flanc +X (page 4.3) : bloc de sécurité n° 2 (accrochée au montant arrière) et bloc de retour
  // HA250 (de la tôle support des blocs bas vers l'arrière).
  api.add(group(
    ...[-1, 1].map((s) => place(frameSide(), [0, 0, 1], [0, 1, 0], [s * 0.342, 0, 0])),
    ...[-1, 1].flatMap((s) => [z0 + 0.113, z0 + 0.443].map((zc) => place(ear(zc), [0, 0, 1], [0, 1, 0], [s * 0.34, 0, 0]))),
    place(frontLow, [1, 0, 0], [0, 1, 0], [0, 0, z1 - 0.0025]),
    place(faceHi, [1, 0, 0], [0, 1, 0], [0, 0, fz - 0.002]),
    place(gusset, [1, 0, 0], [0, 1, 0], [0, 0, fz - 0.002]),
    at(box(0.66, 0.004, 0.036, 'grey'), [0, 1.108, fz - 0.022]), // rebord des manomètres
    at(box(0.666, 0.02, 0.02, 'grey', { r: 0.002 }), [0, 1.205, 0.125]), // traverse haute avant (sous le bord du dessus)
    at(box(0.666, 0.02, 0.02, 'grey', { r: 0.002 }), [0, 1.205, z0 + 0.014]), // traverse haute arrière
    at(box(0.666, 0.06, 0.006, 'grey'), [0, 0.03, z0 + 0.007]), // traverse basse arrière
    place(lowPlate, [1, 0, 0], [0, 1, 0], [0, 0, 0.295]),
    deskShelf(BANKS.sds), deskShelf(BANKS.sd),
    at(box(0.213, 0.006, 0.18, 'grey'), [0.2265, 0.342, -0.27]), // étagère du bloc de sécurité n° 2
    at(box(0.006, 0.05, 0.18, 'grey'), [0.33, 0.317, -0.27]), // aile pliée contre la flasque
    at(box(0.1, 0.006, 0.49, 'grey'), [0.22, 0.227, 0.045]), // étagère du bloc de retour HA250
  ));

  // ---------------------------------------------------------------- panneaux
  // Panneaux latéraux (page 4.1, vue de côté) : en retrait de 13 mm dans le contour du cadre, de 57 mm du sol à
  // 13 mm sous le dessus, angle avant-haut R 48. Deux lumières oblongues de fourche traversantes 154 × 77 à
  // 0,121 m du sol (à 0,247 m de la face avant et 0,125 m de la face arrière), butée au fond de chacune.
  // UM-051-702P (flanc droit) : encoche ouverte depuis le bord avant pour le bloc d'eau, prolongée par une fente
  // à bout rond (raccord en laiton qui part vers l'arrière).
  const ins = 0.013, zf = z1 - ins, zu = slope.z - ins, yb = 0.057, yt = H - 0.013;
  const cs = z1 + slope.y0 - ins * Math.SQRT2; // arête inclinée du panneau (z + y)
  const notch = [[zf, 0.39], [0.26, 0.39], [0.26, 0.416], [0.19, 0.416], ...arc(0.19, 0.4515, 0.0355, -PI / 2, -1.5 * PI, 10), [0.26, 0.487], [0.26, 0.525], [zf, 0.525]];
  const sideOutline = (right) => [[z0 + ins, yb], [zf, yb], ...(right ? notch : []), [zf, cs - zf], [zu, cs - zu], ...arc(zu - 0.048, yt - 0.048, 0.048, 0, PI / 2, 8), [z0 + ins, yt]];
  const forks = [0.142, -0.264];
  const sidePanel = (s, right) => group(
    place(sheet(sideOutline(right), forks.map((z) => slot(z, 0.121, 0.154, 0.077)), 0.004, 'lightGrey'), [0, 0, 1], [0, 1, 0], [s * (w / 2 - 0.002), 0, 0]),
    ...forks.map((z) => at(box(0.02, 0.014, 0.03, 'grey'), [s * 0.346, 0.082, z])), // butées de fourche
  );
  P('UM-051-397P', sidePanel(-1, false), [-0.35, 0, 0]);
  P('UM-051-702P', sidePanel(1, true), [0.35, 0, 0]);
  // Panneaux arrière (page 4.2) : UM-051-327P en haut, en gradins (partie +X de 0,79 m au dessus, grand trou
  // Ø 0,20 ; partie -X plus courte, de 0,94 à 1,10 m) ; UM-051-714P en bas, plus haut côté -X, grand trou Ø 0,20,
  // percé au droit des 9 traversées des boyaux.
  const ports = [...CON_PACK, ...CON_ROT, ...CON_SLED];
  const portR = (i) => (i === 2 || i === 3 || i === 4 ? 0.028 : 0.023); // passages des boyaux de 1 po (pression, rotation)
  P('UM-051-327P', place(sheet([[-0.34, 0.94], [-0.06, 0.94], [-0.06, 0.79], [0.34, 0.79], [0.34, 1.214], [-0.06, 1.214], [-0.06, 1.1], [-0.34, 1.1]],
    [circle(0.12, 0.96, 0.1, 32)], 0.004, 'lightGrey'), [1, 0, 0], [0, 1, 0], [0, 0, z0 + 0.002]), [0, 0, -0.35]);
  P('UM-051-714P', place(sheet([[-0.34, 0.06], [0.34, 0.06], [0.34, 0.786], [-0.064, 0.786], [-0.064, 0.91], [-0.34, 0.91]],
    [circle(-0.19, 0.6, 0.1, 32), ...ports.map(([x, y], i) => circle(x, y, portR(i), 20))], 0.004, 'lightGrey'), [1, 0, 0], [0, 1, 0], [0, 0, z0 + 0.002]), [0, 0.1, -0.4]);
  // Dessus (page 4.1, vue de dessus) : bord avant à 0,515 m de la face arrière, découpe R 90 qui dégage le gros
  // manomètre ; devant, bandeau ouvert de 6 cm au-dessus des manomètres.
  const zt = 0.126, xn = Math.sqrt(0.09 ** 2 - (0.165 - zt) ** 2);
  const topOutline = [...arc(0.31, z0 + 0.026, 0.02, -PI / 2, 0, 4), ...arc(0.31, zt - 0.02, 0.02, 0, PI / 2, 4),
    ...arc(-0.059, 0.165, 0.09, Math.atan2(zt - 0.165, xn), Math.atan2(zt - 0.165, -xn), 14),
    ...arc(-0.31, zt - 0.02, 0.02, PI / 2, PI, 4), ...arc(-0.31, z0 + 0.026, 0.02, PI, 1.5 * PI, 4)];
  P('UM-051-706P', place(sheet(topOutline, [], 0.004, 'lightGrey'), [1, 0, 0], [0, 0, 1], [0, H - 0.002, 0]), [0, 0.35, 0]);
  // UM-051-708P (page 4.2) : tôle pliée, pupitre incliné (plaques CA3 et CA4, encoche en haut à gauche qui laisse
  // voir l'accumulateur) et jupe verticale jusqu'à 0,49 m, échancrée au droit des distributeurs.
  const sl = (slope.y1 - slope.y0) * Math.SQRT2, sn = (0.79 - slope.y0) * Math.SQRT2;
  const deskO = [0, slope.y0 - s2 * 0.002, z1 - s2 * 0.002]; // bord bas du pupitre, mi-épaisseur
  const desk = (s) => add([0, slope.y0, z1], up, s); // point de la face du pupitre à la distance s du bord bas
  P('UM-051-708P', group(
    place(sheet([[-0.345, 0], [-0.275, 0], [-0.275, 0.025], [-0.105, 0.025], [-0.105, 0], [0.048, 0], [0.048, 0.025], [0.244, 0.025], [0.244, 0], [0.345, 0], [0.345, sl], [-0.14, sl], [-0.14, sn], [-0.25, sn], [-0.25, sl], [-0.345, sl]], [], 0.004, 'lightGrey'), [1, 0, 0], up, deskO),
    place(sheet([[-0.345, 0.49], [0.345, 0.49], [0.345, slope.y0], [0.244, slope.y0], [0.244, 0.59], [0.048, 0.59], [0.048, slope.y0],
      [-0.105, slope.y0], [-0.105, 0.59], [-0.275, 0.59], [-0.275, slope.y0], [-0.345, slope.y0]], [], 0.004, 'lightGrey'), [1, 0, 0], [0, 1, 0], [0, 0, z1 - 0.002]),
  ), [0, 0.1, 0.4]);
  // UM-051-710P (pages 4.1 et 4.2) : plaque inox, lumière ovale des deux cartouches CBIB du bloc d'avance,
  // plaque CA7. Contour de la vue de face : pattes aux quatre coins (trous en serrure des vis BS25-750), bord
  // haut en gradins (deux dégagements de 11 à 18 mm), encoche à gauche où pend la manette de la vanne BKH-3/4.
  const oval = slot(0.177, 0.267, 0.159, 0.071);
  // Trou en serrure : Ø 16 à 16 mm de la vis (direction u), fente de 7 mm jusqu'à la vis.
  const keyhole = (sx, sy, ux, uy) => {
    const R = 0.008, hw = 0.0035, cx = sx + ux * 0.016, cy = sy + uy * 0.016, t = Math.atan2(uy, ux), f = Math.asin(hw / R);
    return [...arc(cx, cy, R, t + PI + f, t + 3 * PI - f, 16), ...arc(sx, sy, hw, t + PI / 2, t + 1.5 * PI, 6)];
  };
  const x0p = -0.064, x1p = 0.352, y0p = 0.175, ytp = 0.434;
  const plate710 = [...arc(x1p - 0.01, y0p + 0.01, 0.01, -PI / 2, 0, 3), ...arc(x1p - 0.008, ytp - 0.008, 0.008, 0, PI / 2, 3),
    [0.3156, ytp], [0.3086, 0.423], [0.2212, 0.423], [0.2142, ytp], [0.105, ytp], [0.098, 0.416], [-0.0008, 0.416], [-0.0078, ytp],
    ...arc(x0p + 0.008, ytp - 0.008, 0.008, PI / 2, PI, 3), ...arc(x0p + 0.008, 0.354, 0.008, PI, 1.5 * PI, 3),
    ...arc(0.0136, 0.338, 0.008, PI / 2, 0, 3), ...arc(0.0136, 0.25, 0.008, 0, -PI / 2, 3),
    ...arc(x0p + 0.008, 0.234, 0.008, PI / 2, PI, 3), ...arc(x0p + 0.01, y0p + 0.01, 0.01, PI, 1.5 * PI, 3)];
  P('UM-051-710P', place(sheet(plate710, [oval, keyhole(-0.05, 0.19, 1, 0), keyhole(-0.05, 0.42, 1, 0), keyhole(0.337, 0.19, -1, 0), keyhole(0.337, 0.42, 0, -1)], 0.004, 'lightGrey'),
    [1, 0, 0], [0, 1, 0], [0, 0, z1 + 0.002]), [0, 0, 0.35]);

  // ---------------------------------------------------------------- plaques d'identification (sans repère)
  // UM-064-CA… (liste des plaques rivetées) : CA1 en L autour du bloc bleu, CA2 (boutons), CA13 sur la face
  // haute ; CA3 et CA4 sur le pupitre ; CA5 et la plaque droite sur la jupe ; CA7 sur 710P ; CA9 (traversées des
  // boyaux, percée à leur droit), CA10, CA11, CA12 et CA14 à l'arrière.
  const deco = [];
  deco.push(at(caPlate([[-0.353, 0.868], [0.032, 0.868], [0.032, 0.955], [-0.084, 0.955], [-0.084, 1.1], [-0.353, 1.1]], [winUp],
    [[-0.345, 0.876], [0.024, 0.876], [-0.345, 1.092], [-0.092, 1.092]]), [0, 0, fz + 0.0006]));
  deco.push(at(caPlate([[0.008, 0.96], [0.235, 0.96], [0.235, 0.868], [0.345, 0.868], [0.345, 1.1], [0.008, 1.1]], [],
    [[0.016, 0.968], [0.337, 0.876], [0.337, 1.092], [0.016, 1.092]]), [0, 0, fz + 0.0006]));
  deco.push(at(nameplate(0.081, 0.062, { material: 'white' }), [-0.0435, 1.077, fz]));
  for (const [x, s, pw, ph] of [[-0.1485, 0.1, 0.347, 0.136], [0.1525, 0.1435, 0.235, 0.219]]) deco.push(place(nameplate(pw, ph, { material: 'white' }), [1, 0, 0], up, add(desk(s), [x, 0, 0], 1)));
  deco.push(at(nameplate(0.234, 0.09, { material: 'white' }), [-0.186, 0.545, z1]));
  deco.push(at(nameplate(0.188, 0.08, { material: 'white' }), [0.243, 0.545, z1]));
  deco.push(at(caPlate(rrect(0.025, 0.198, 0.31, 0.337, 0.006), [oval], [[0.033, 0.206], [0.302, 0.206], [0.033, 0.329], [0.302, 0.329]]), [0, 0, z1 + 0.0046]));
  // Plaque CA9 au dos (vue de dos : x local = -x), percée au droit des traversées.
  deco.push(at(caPlate(rect(-0.33, 0.1, 0.31, 0.33), ports.map(([x, y], i) => circle(-x, y, portR(i), 20)),
    [[-0.322, 0.108], [0.302, 0.108], [-0.322, 0.322], [0.302, 0.322]]), [0, 0, z0], [0, PI, 0]));
  for (const [x, y, pw, ph] of [[-0.2, 0.39, 0.14, 0.06], [0.25, 0.39, 0.12, 0.06], [0.05, 0.39, 0.12, 0.06], [0.2, 0.62, 0.16, 0.08]]) {
    deco.push(at(nameplate(pw, ph, { material: 'white' }), [x, y, z0], [0, PI, 0]));
  }
  api.add(group(deco));

  // 2 — Bloc 3 voies 3/4 NPT (eau) sur le flanc droit (page 4.1 ; page 4.3, détail C).
  P('UM-020-643P', blocEau(api), [0.3, 0, 0]);

  // 11 — Panneau de l'interrupteur, 12 — panneau du contrôleur, 13 — support coulissant, 14 — support de traversée.
  // Sur le dessus (page 4.1) : poste 10250H à gauche, dos contre son panneau UM-051-713P tenu par le
  // support UM-051-716P ; contrôleur SECFOR à droite, vissé sur son panneau vertical UM-051-703P
  // (pied plié sur le dessus, face à 0,124 m) dont le haut fait la cote hors tout de 58 29/32 po.
  P('UM-051-713P', at(box(0.12, 0.2, 0.005, 'lightGrey'), [SW.x, H + 0.102, SW.z - 0.0425]), [0, 0.3, 0]);
  P('UM-051-703P', group(
    at(box(0.24, h - H - 0.002, 0.005, 'lightGrey'), [SC.x, (h + H + 0.002) / 2, SC.zp]),
    at(box(0.24, 0.004, 0.04, 'lightGrey'), [SC.x, H + 0.004, SC.zp - 0.0225]),
  ), [0, 0.3, 0]);
  P('UM-051-716P', at(box(0.05, 0.12, 0.04, 'grey', { r: 0.004 }), [SW.x, H + 0.062, SW.z - 0.065]), [-0.2, 0.3, 0]);
  // Support de traversée (page 4.1 : x de 0,266 à 0,322, lame à 0,105 m derrière le centre, entre les oreilles ;
  // page 4.2 : équerre pliée) : montant de 56 × 76 mm en crochet (encoche ronde du connecteur), pied vissé.
  // Montant en « P » (vue de face agrandie) : lèvre pleine en haut, encoche horizontale Ø 37 ouverte vers -X
  // (bord gauche), fond arrondi côté +X ; plein du dessous de l'encoche jusqu'au pied.
  const bkt = { x: CON_HOOK[0], y: CON_HOOK[1], z: CON_HOOK[2], r: 0.0185 };
  P('UM-051-717P', group(
    place(sheet([[0.266, H], [0.322, H], [0.322, H + 0.076], [0.266, H + 0.076], [0.266, bkt.y + bkt.r], [bkt.x, bkt.y + bkt.r],
      ...arc(bkt.x, bkt.y, bkt.r, PI / 2, -PI / 2, 12), [0.266, bkt.y - bkt.r]],
      [], 0.005, 'grey'), [1, 0, 0], [0, 1, 0], [0, 0, bkt.z]),
    at(box(0.052, 0.005, 0.058, 'grey'), [0.294, H + 0.0025, -0.134]),
  ), [0.2, 0.3, 0]);
  // 15 — Poste de commande spécial, 16 — contrôleur de sécurité SECFOR.
  P('10250H', poste10250H(api), [0, 0.45, 0.1]);
  P('UM-CIT-SC-UG', secfor(api), [0, 0.6, 0.1]);

  // 17 — Composants hydrauliques (page 4.3) : sous-assemblage P079 ; s'il n'est pas inscrit dans l'index des
  // modèles, ses pièces sont posées sans repère.
  let comps = null;
  try {
    comps = api.sub('P079', { dansP078: true });
  } catch (err) {
    if (!/introuvable/.test(err.message)) throw err;
  }
  if (comps) P('UM-051-FMC-036-5', comps, [0, 0, 0.3]);
  else P079({ ...api, part: (ref, obj) => api.add(obj) }, { dansP078: true });

  // 1 — Vis 1/4-20 × 3/4 et 10 — rondelles inox (40) : 7 par flanc aux trous en serrure (page 4.1), 6 par panneau
  // arrière, 4 sur le dessus, 2 au pied du support de traversée 717P, 4 sur la jupe de 708P et 4 aux coins de 710P
  // (page 4.2).
  const pts = [];
  for (const s of [-1, 1]) {
    for (const [z, y] of [[z0 + 0.051, 0.08], [z0 + 0.051, 0.78], [z0 + 0.051, 1.17], [z1 - 0.042, 0.084], [0.172, 0.8], [-0.034, 0.78], [0.119, 1.147]]) pts.push([[s * w / 2, y, z], [s, 0, 0]]);
  }
  for (const [x, y] of [[0.32, 0.81], [0.32, 1.19], [-0.04, 0.81], [-0.04, 1.19], [-0.32, 0.96], [-0.32, 1.08],
    [-0.325, 0.08], [0.325, 0.08], [-0.325, 0.45], [0.325, 0.45], [0.32, 0.76], [-0.32, 0.88]]) pts.push([[x, y, z0], [0, 0, -1]]);
  for (const x of [-0.31, 0.31]) for (const z of [z0 + 0.03, 0.06]) pts.push([[x, H, z], [0, 1, 0]]);
  for (const x of [0.278, 0.31]) pts.push([[x, H + 0.005, -0.145], [0, 1, 0]]);
  for (const x of [-0.33, 0.33]) for (const y of [0.51, 0.645]) pts.push([[x, y, z1], [0, 0, 1]]);
  for (const [x, y] of [[-0.05, 0.19], [-0.05, 0.42], [0.337, 0.19], [0.337, 0.42]]) pts.push([[x, y, z1 + 0.004], [0, 0, 1]]);
  const axisOf = (o) => (o[0] ? (o[0] > 0 ? 'x' : '-x') : o[1] ? 'y' : o[2] > 0 ? 'z' : '-z');
  each(P, 'BS25-750', pts.map(([p, o]) => at(bolt(0.0064, 0.019, 'zinc', { axis: axisOf(o) }), add(p, o, 0.0015))), (i) => pts[i][1].map((c) => c * 0.15));
  each(P, 'WS25', pts.map(([p, o]) => at(washer(0.008, 0.0035, 0.0015, 'zinc', { axis: o[0] ? 'x' : o[1] ? 'y' : 'z' }), add(p, o, 0.00075))), (i) => pts[i][1].map((c) => c * 0.12));

  // Plaque intérieure des traversées (page 4.3 : tôle gris foncé en bas à l'arrière, vissée aux flasques) : 9
  // raccords-traversées d'axe Z, écrou côté intérieur, embout au ras du panneau arrière.
  api.add(group(
    at(box(0.643, 0.14, 0.006, 'charcoal'), [0.0115, PORT_Y, z0 + 0.03]),
    ...ports.flatMap(([x, y], i) => {
      const r = portR(i) - 0.008;
      return [at(cyl(r, z0 + 0.027 - BACK, 'brass', { axis: 'z', seg: 18 }), [x, y, (z0 + 0.027 + BACK) / 2]),
        at(api.S.nut(2 * r + 0.012, 0.01, 'brass', { axis: 'z' }), [x, y, z0 + 0.038]),
        at(cyl(r * 0.8, 0.02, 'brass', { axis: 'z', seg: 16 }), [x, y, z0 + 0.053])];
    }),
  ));
  return { view: { dir: [0.6, 0.45, 1.2] } };
}

// P079 — Composants hydrauliques (page 4.3 ; détails pages 4.4 et 4.4.1 ; page 4.1 pour les cotes). Dans P078
// (opts.dansP078), le bloc d'eau, le poste 10250H et le contrôleur SECFOR, déjà posés par la console (lignes 2,
// 15 et 16), ne sont pas reposés. Le détail B (té 6600-8-8-8, 6505-8-8, 2404-8-8 et la 3e vanne BKH-1/2 sous
// l'accumulateur) ne vaut que pour le modèle 50 Hz : non posé.
export function P079(api, opts = {}) {
  const { box, cyl, ring, group, at, gauge, lathe, nut, rod, nameplate, ball } = api.S;
  const { onDesk, strap } = outils(api);
  const P = lister(api, 'P079');
  const PI = Math.PI;
  const along = (obj, pt) => onDesk(obj, pt); // pièce dans le repère du pupitre (x, u, n)

  if (!opts.dansP078) {
    P('UM-020-643P', blocEau(api), [0.3, 0, 0]);
    P('10250H', poste10250H(api), [0, 0.45, 0.1]);
    P('UM-CIT-SC-UG', secfor(api), [0, 0.6, 0.1]);
  }

  // Manomètres Pitanco (gros) et Stauff SPG-063 (4) au-dessus du bord de la face haute, devant la traverse : la
  // queue filetée traverse le rebord plié, contre-écrou dessus.
  const zg = fz - 0.012;
  const mano = (x, y, r) => group(at(gauge(r, { axis: 'z' }), [x, y, zg]), at(nut(0.011, 0.003, 'steel'), [x, 1.1115, zg]));
  P('UMV-10-C4', mano(-0.059, 1.171, 0.048), [0, 0.15, 0.1]);
  each(P, 'UMV-10-C2', [0.038, 0.121, 0.202, 0.284].map((gx) => mano(gx, 1.15, 0.033)), [0, 0.15, 0.1]);

  // Bloc bleu pompe à eau et malaxeur 2011F03-06744-51 (page 4.1 ; page 4.4.1 : corps 654512) vissé derrière la
  // face haute : corps de 127 × 152 mm, son bossage passe la fenêtre et affleure à 6 mm devant la tôle (z 0,19).
  // Boutons noirs Ø 36 (DMDM-LAN, PRDB, FDBA) jusqu'à z 0,26 ; capuchons gris, bouchon 6408-12, petit raccord ;
  // 3 prises de pression SNK-20 debout sur le dessus.
  {
    const g = [
      at(box(0.127, 0.152, 0.052, 'umBlue', { r: 0.003 }), [-0.2095, 1.023, 0.158]),
      at(box(0.13, 0.138, 0.006, 'umBlue', { r: 0.002 }), [-0.2135, 1.027, 0.187]),
    ];
    for (const [x, y] of [[-0.253, 1.077], [-0.208, 1.075], [-0.253, 1.022], [-0.253, 0.969]]) {
      g.push(at(nut(0.026, 0.008, 'steel', { axis: 'z' }), [x, y, 0.194]));
      g.push(at(lathe([[0, 0], [0.018, 0], [0.018, 0.05], [0.015, 0.062], [0, 0.064]], 'black', { axis: 'z', seg: 18 }), [x, y, 0.196]));
    }
    for (const [x, y] of [[-0.166, 1.073], [-0.166, 0.971]]) g.push(at(cyl(0.0125, 0.04, 'grey', { axis: 'z', seg: 16 }), [x, y, 0.21]));
    g.push(at(nut(0.034, 0.012, 'steel', { axis: 'z' }), [-0.21, 1.004, 0.196]));
    g.push(at(cyl(0.007, 0.02, 'brass', { axis: 'z', seg: 12 }), [-0.19, 1.038, 0.2]));
    for (const x of [-0.25, -0.215, -0.195]) {
      g.push(at(cyl(0.005, 0.022, 'steel', { seg: 12 }), [x, 1.11, 0.14]));
      g.push(at(cyl(0.006, 0.012, 'black', { seg: 12 }), [x, 1.127, 0.14]));
    }
    P('2011F03-06744-51', group(g), [0, 0, 0.15]);
  }

  // Réducteurs PBDB et limiteurs RPGC (page 4.3, détail A) dans des trous lamés de la face haute : corps de
  // cartouche, contre-écrou six-pans, bouton moleté noir Ø 35 ; saillie de 60 mm. De gauche à droite : vitesse de
  // rotation (PBDB-LNN-ECI), vis (PBDB-LNN-ECI_S), couple de rotation et avance rapide (RPGC), et dessous à
  // droite la basse avance (PBDB-LNN-ECI).
  const knob = (x, y) => group(
    at(nut(0.042, 0.01, 'steel', { axis: 'z' }), [x, y, fz + 0.0062]),
    at(cyl(0.011, 0.014, 'steel', { axis: 'z', seg: 16 }), [x, y, fz + 0.019]),
    at(lathe([[0, 0], [0.0175, 0], [0.0175, 0.03], [0.015, 0.034], [0, 0.035]], 'black', { axis: 'z', seg: 12 }), [x, y, fz + 0.025]),
  );
  each(P, 'PBDB-LNN-ECI', [knob(-0.024, 0.984), knob(0.296, 0.906)], [0, 0, 0.1]);
  P('PBDB-LNN-ECI_S', knob(0.0995, 0.998), [0, 0, 0.1]);
  each(P, 'RPGC-LCN-CAL_S', [knob(0.207, 0.998), knob(0.326, 0.998)], [0, 0, 0.1]);

  // Électrovanne D03 SWH-G02-C2D12-20 (page 4.1 : saillie 125 mm, y 0,876–0,942) sur son embase M02-03-B-2 gris
  // olive vissée sur la face haute : corps bleu à plaque signalétique, 2 bobines noires d'axe X, connecteurs DIN
  // tournés vers l'avant.
  const ev = { x: 0.1265, y: 0.909 };
  P('M02-03-B-2', at(box(0.087, 0.066, 0.035, 'castIron', { r: 0.002 }), [ev.x, ev.y, fz + 0.0175]), [0, 0, 0.08]);
  P('SWH-G02-C2D12-20', group(
    at(box(0.066, 0.05, 0.045, 'umBlue', { r: 0.003 }), [ev.x, ev.y, fz + 0.0575]),
    at(nameplate(0.05, 0.03, { material: 'white' }), [ev.x, ev.y, fz + 0.08]),
    ...[-1, 1].flatMap((s) => [
      at(cyl(0.0225, 0.06, 'black', { axis: 'x', seg: 24 }), [ev.x + s * 0.063, ev.y, fz + 0.0575]),
      at(nut(0.018, 0.008, 'steel', { axis: 'x' }), [ev.x + s * 0.097, ev.y, fz + 0.0575]),
      at(box(0.03, 0.036, 0.044, 'castIron', { r: 0.003 }), [ev.x + s * 0.066, ev.y, fz + 0.1015]),
    ]),
  ), [0, 0, 0.15]);
  // Bouchons gris de la face haute et disque gris au fond du trou à droite de l'électrovanne (page 4.1).
  api.add(group(
    ...[[0.083, 1.085], [0.241, 1.085]].map(([x, y]) => at(cyl(0.013, 0.01, 'grey', { axis: 'z', seg: 16 }), [x, y, fz + 0.007])),
    at(cyl(0.025, 0.004, 'grey', { axis: 'z', seg: 24 }), [0.233, 0.935, fz + 0.0032]),
  ));

  // Distributeurs couchés sous le pupitre (BANKS) : sections en fonte, couvercles, chapeaux de rappel au bout
  // haut, chape du levier et soufflet noir au bout bas.
  const bank = (b, sw, leverObjs) => {
    const [u0, u1] = b.u, [n0, n1] = b.n, nc = (n0 + n1) / 2, [up0, np0] = b.pv;
    const g = [];
    for (let i = 0; i < b.x.length - 1; i++) {
      const xa = b.x[i], xb = b.x[i + 1];
      g.push(at(box(xb - xa - 0.002, u1 - u0, n1 - n0, 'castIron', { r: 0.003 }), [(xa + xb) / 2, (u0 + u1) / 2, nc]));
      const lx = b.levers[i];
      g.push(at(cyl(0.012, 0.028, 'darkSteel', { seg: 16 }), [lx, u1 + 0.014, nc])); // chapeau de rappel
      g.push(at(box(0.02, u0 - up0 + 0.012, 0.024, 'castIron'), [lx, (u0 + up0 - 0.012) / 2, np0])); // chape
      g.push(at(lathe([[0, 0], [0.014, 0], [0.014, 0.008], [0.011, 0.012], [0.013, 0.018], [0.01, 0.024], [0.012, 0.03], [0.008, 0.036], [0.006, 0.042], [0, 0.042]],
        'black', { axis: 'z', seg: 16 }), [lx, up0, np0 + 0.012])); // soufflet
    }
    const xe = b.x[b.x.length - 1];
    g.push(at(box(b.cover - xe, u1 - u0, n1 - n0, 'castIron', { r: 0.003 }), [(xe + b.cover) / 2, (u0 + u1) / 2, nc])); // couvercle
    if (sw) g.push(at(box(0.006, u1 - u0, n1 - n0, 'castIron'), [b.x[0] - 0.003, (u0 + u1) / 2, nc]));
    return onDesk(group(g, leverObjs));
  };
  // Leviers (repère du pupitre) : tige du pivot à la poignée, pommeau en bout.
  const leverAt = (b, x, nTip, r, grip, gl) => group(
    rod([x, b.pv[0], b.pv[1] + 0.02], [x, b.pv[0], nTip - gl + 0.002], r, 'steel'),
    at(grip, [x, b.pv[0], nTip - gl]),
  );
  const nTipOf = (y, z) => toUN(y, z)[1];
  const sdsKnob = () => lathe([[0, 0], [0.009, 0], [0.014, 0.012], [0.015, 0.028], [0.011, 0.04], [0, 0.042]], 'black', { axis: 'z', seg: 16 });
  P('SDS150', bank(BANKS.sds, false, BANKS.sds.levers.map((x) => leverAt(BANKS.sds, x, nTipOf(0.75, z1 + 0.093), 0.006, sdsKnob(), 0.042))), [0, 0.1, 0.25]);
  const sdGrip = () => lathe([[0, 0], [0.011, 0], [0.015, 0.012], [0.016, 0.065], [0.012, 0.076], [0, 0.078]], 'black', { axis: 'z', seg: 16 });
  const joyGrip = () => lathe([[0, 0], [0.026, 0], [0.026, 0.008], [0.016, 0.014], [0.02, 0.03], [0.024, 0.06], [0.022, 0.095], [0.026, 0.11], [0.02, 0.122], [0, 0.124]], 'black', { axis: 'z', seg: 20 });
  P('SD25', bank(BANKS.sd, true, [
    leverAt(BANKS.sd, BANKS.sd.levers[0], nTipOf(0.80, z1 + 0.183), 0.008, joyGrip(), 0.124),
    leverAt(BANKS.sd, BANKS.sd.levers[1], nTipOf(0.805, z1 + 0.19), 0.007, sdGrip(), 0.078),
    leverAt(BANKS.sd, BANKS.sd.levers[2], nTipOf(0.805, z1 + 0.19), 0.007, sdGrip(), 0.078),
  ]), [0, 0.1, 0.25]);

  // Régleurs de débit NDRV-10-N (2) traversant le pupitre côté droit (page 4.3, détail A ; page 4.1 : x 0,286,
  // pieds à y 0,722 et 0,818) : écrou six-pans, tige, bouton moleté noir Ø 30 ; saillie de 50 mm.
  const ndrv = (y) => along(group(
    at(nut(0.022, 0.008, 'steel', { axis: 'z' }), [0, 0, 0.004]),
    at(cyl(0.005, 0.012, 'steel', { axis: 'z', seg: 12 }), [0, 0, 0.014]),
    at(lathe([[0, 0], [0.015, 0], [0.015, 0.026], [0.012, 0.03], [0, 0.03]], 'black', { axis: 'z', seg: 12 }), [0, 0, 0.02]),
  ), [0.286, (y - slope.y0) * Math.SQRT2, 0]);
  each(P, 'UMV-10V-NDRV-10-N', [ndrv(0.722), ndrv(0.818)], [0, 0.06, 0.06]);

  // Accumulateur 1 gal AM3051003 (page 4.3 ; page 4.1 : visible par l'encoche du pupitre) : cylindre rouge Ø 150 à
  // dôme hémisphérique, de 0,66 à 1,00 m, valve de gonflage six-pans grise au sommet, orifice en laiton dessous ;
  // collier gris et patte vers la flasque gauche du cadre.
  {
    const c = [-0.19, 0, -0.27], R = 0.075;
    const prof = [[0, 0], [R - 0.01, 0], [R, 0.01]];
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * (PI / 2); prof.push([R * Math.cos(a), 0.265 + R * Math.sin(a)]); }
    prof[prof.length - 1] = [0, 0.34];
    P('AM3051003', group(
      at(lathe(prof, 'red', { seg: 32 }), [c[0], 0.66, c[2]]),
      at(nut(0.024, 0.014, 'grey'), [c[0], 1.006, c[2]]),
      at(cyl(0.006, 0.016, 'steel', { seg: 12 }), [c[0], 1.02, c[2]]),
      at(nut(0.03, 0.012, 'brass'), [c[0], 0.654, c[2]]),
      at(cyl(0.011, 0.02, 'brass', { seg: 14 }), [c[0], 0.638, c[2]]),
      at(ring(R + 0.004, R, 0.025, 'grey', { seg: 32 }), [c[0], 0.86, c[2]]),
      strap([c[0] - (R + 0.006) * s2, 0.86, c[2] - (R + 0.006) * s2], [-0.331, 0.86, -0.36], 0.025, 0.006),
    ), [-0.15, 0.2, -0.2]);
  }
  // Accumulateur 1/2 gal AM-45-250 (page 4.5 : AccuMight 45 po³, 208 × 137 mm, coque noire) : ovoïde vertical,
  // valve six-pans en haut, orifice 1 1/16-12 SAE en laiton dessous ; collier et patte vers la membrure arrière
  // du flanc +X.
  {
    const c = [0.2, 0.75, -0.25], R = 0.0685, hb = 0.0815;
    const prof = [];
    for (let i = 0; i <= 12; i++) { const a = -PI / 2 + (i / 12) * PI; prof.push([R * Math.cos(a), hb * Math.sin(a)]); }
    prof[0] = [0, -hb]; prof[12] = [0, hb];
    P('AM-45-250', group(
      at(lathe(prof, 'black', { seg: 28 }), c),
      at(nut(0.03, 0.016, 'darkSteel'), [c[0], c[1] + hb + 0.006, c[2]]),
      at(cyl(0.006, 0.012, 'steel', { seg: 12 }), [c[0], c[1] + hb + 0.019, c[2]]),
      at(nut(0.03, 0.01, 'brass'), [c[0], c[1] - hb - 0.003, c[2]]),
      at(cyl(0.012, 0.012, 'brass', { seg: 14 }), [c[0], c[1] - hb - 0.014, c[2]]),
      at(ring(R + 0.004, R - 0.0005, 0.022, 'grey', { seg: 28 }), c),
      strap([c[0] + (R + 0.006) * s2, c[1], c[2] - (R + 0.006) * s2], [0.331, c[1], -0.358], 0.025, 0.006),
    ), [0.15, 0.2, -0.2]);
  }
  // Boîte de jonction UM-CE-BDJ (page 4.3) : boîte grise à couvercle vissé, contre la membrure arrière du flanc +X,
  // à côté de l'AM-45-250.
  P('UM-CE-BDJ', group(
    at(box(0.046, 0.06, 0.13, 'grey', { r: 0.004 }), [0.3, 0.84, -0.25]),
    at(box(0.004, 0.054, 0.124, 'lightGrey', { r: 0.002 }), [0.275, 0.84, -0.25]),
    at(box(0.01, 0.06, 0.15, 'grey'), [0.328, 0.84, -0.27]), // patte sur la flasque
  ), [0.2, 0.15, -0.15]);

  // Bloc de sécurité n° 2 UMV-10VS-2009F03 (pages 4.3 et 4.4) : bloc acier de 180 × 130 × 150 mm sur son étagère du
  // flanc +X ; dessus : 2 électro-cartouches DMDA / DTDA (bobines noires 770-214, connecteurs DIN) et 6 cartouches
  // et bouchons six-pans (LOHD, CXAA, FDCB, XAOA) ; orifices lamés sur la face avant.
  {
    const c = [0.22, 0.41, -0.27], top = 0.475;
    const g = [at(box(0.18, 0.13, 0.15, 'grey', { r: 0.003 }), c)];
    for (const x of [0.17, 0.235]) {
      g.push(at(cyl(0.009, 0.012, 'steel', { seg: 14 }), [x, top + 0.006, -0.3]));
      g.push(at(cyl(0.0175, 0.05, 'black', { seg: 20 }), [x, top + 0.037, -0.3]));
      g.push(at(box(0.03, 0.034, 0.03, 'castIron', { r: 0.003 }), [x, top + 0.04, -0.27]));
    }
    for (const [x, z] of [[0.15, -0.23], [0.19, -0.23], [0.23, -0.23], [0.275, -0.23], [0.285, -0.3], [0.275, -0.335]]) {
      g.push(at(nut(0.022, 0.012, 'steel'), [x, top + 0.006, z]));
      g.push(at(cyl(0.006, 0.01, 'steel', { seg: 12 }), [x, top + 0.017, z]));
    }
    for (const [x, y] of [[0.16, 0.44], [0.2, 0.44], [0.24, 0.38], [0.28, 0.38]]) g.push(at(ring(0.012, 0.007, 0.002, 'steel', { axis: 'z', seg: 18 }), [x, y, c[2] + 0.076]));
    P('UMV-10VS-2009F03', group(g), [0.15, 0, -0.15]);
  }
  // Bloc de retour HA250SH9003SFU (page 4.3) : barre grise de 260 mm couchée selon Z sur son étagère basse, 3 gros
  // orifices lamés sur la face +X.
  P('HA250SH9003SFU', group(
    at(box(0.07, 0.06, 0.26, 'grey', { r: 0.003 }), [0.22, 0.26, -0.05]),
    ...[-0.13, -0.05, 0.03].map((z) => at(ring(0.0175, 0.011, 0.003, 'steel', { axis: 'x', seg: 20 }), [0.2565, 0.26, z])),
  ), [0.15, 0, 0]);

  // Bloc d'avance UMV-10BS-01 (page 4.4.1) : bloc gris derrière la plaque 710P, face à z1 - 0,02 ; ses deux cartouches
  // CBIB-LHN (corps Ø 30, six-pans, vis de réglage) sortent par la lumière ovale (x 0,134 et 0,198, saillie 49 mm).
  P('UMV-10BS-01', group(
    at(box(0.16, 0.1, 0.069, 'grey', { r: 0.003 }), [0.166, 0.267, 0.3345]),
    ...[0.134, 0.198].flatMap((x) => [
      at(cyl(0.015, 0.036, 'steel', { axis: 'z', seg: 20 }), [x, 0.269, 0.387]),
      at(nut(0.025, 0.012, 'steel', { axis: 'z' }), [x, 0.269, 0.411]),
      at(cyl(0.007, 0.016, 'steel', { axis: 'z', seg: 12 }), [x, 0.269, 0.425]),
      at(nut(0.013, 0.005, 'steel', { axis: 'z' }), [x, 0.269, 0.4355]),
    ]),
  ), [0, 0, 0.12]);

  // Bloc de synchronisation UMV-10BS-105 (page 4.1 ; page 4.4 : UMV-10BS-03) dans la fenêtre de la tôle avant
  // basse, à deux niveaux : face des 8 cartouches (PRDB, DODS, CXDA, DKDS) en retrait à z1 - 0,06 ; distributeur
  // 4WMM10D03XF (embase bleue, corps noir) au ras de la face, levier horizontal vers l'avant jusqu'à z1 + 0,143,
  // pommeau en poire ; bouton DBAM-LCN.
  {
    const zr = z1 - 0.06;
    const g = [at(box(0.198, 0.204, zr - 0.24, 'umBlue', { r: 0.003 }), [-0.217, 0.31, (zr + 0.24) / 2])];
    g.push(at(box(0.076, 0.155, 0.02, 'umBlue', { r: 0.002 }), [-0.156, 0.3425, zr + 0.01]));
    g.push(at(box(0.07, 0.11, 0.0395, 'black', { r: 0.004 }), [-0.156, 0.335, zr + 0.04]));
    g.push(at(nameplate(0.04, 0.05, { material: 'white' }), [-0.156, 0.325, zr + 0.0595]));
    g.push(at(box(0.03, 0.03, 0.03, 'black', { r: 0.004 }), [-0.156, 0.405, zr + 0.035]));
    g.push(at(cyl(0.004, 0.137, 'steel', { axis: 'z', seg: 10 }), [-0.155, 0.41, zr + 0.05 + 0.0685]));
    g.push(at(lathe([[0, 0], [0.007, 0.004], [0.012, 0.016], [0.01, 0.024], [0, 0.028]], 'black', { axis: 'z', seg: 14 }), [-0.155, 0.41, z1 + 0.115]));
    g.push(at(cyl(0.012, 0.04, 'steel', { axis: 'z', seg: 16 }), [-0.217, 0.313, zr + 0.02]));
    g.push(at(cyl(0.015, 0.03, 'black', { axis: 'z', seg: 16 }), [-0.217, 0.313, zr + 0.055]));
    for (const [x, y] of [[-0.217, 0.383], [-0.234, 0.348], [-0.276, 0.275], [-0.234, 0.271]]) {
      g.push(at(cyl(0.008, 0.03, 'steel', { axis: 'z', seg: 12 }), [x, y, zr + 0.015]));
      g.push(at(nut(0.022, 0.01, 'steel', { axis: 'z' }), [x, y, zr + 0.025]));
    }
    for (const [x, y] of [[-0.257, 0.383], [-0.276, 0.348], [-0.257, 0.241], [-0.217, 0.241]]) {
      g.push(at(cyl(0.008, 0.03, 'steel', { axis: 'z', seg: 12 }), [x, y, zr + 0.015]));
      g.push(at(cyl(0.0115, 0.012, 'black', { axis: 'z', seg: 16 }), [x, y, zr + 0.026]));
    }
    P('UMV-10BS-105', group(g), [0, 0, 0.2]);
  }

  // Vannes à bille BKH-1/2 (UM-10B-TR#8, 2) et BKH-3/4 (UMV-10B-#12) : corps derrière la tôle avant basse,
  // moyeu six-pans et poignée plate en acier à bout rond devant. Les deux BKH-1/2 pendent vers le bas et vers +X
  // (37° de la verticale) ; la BKH-3/4, dans l'encoche de 710P, pend à la verticale.
  const handle = (x, y, zb, L, a) => {
    const c = [Math.cos(a), Math.sin(a)];
    return group(
      at(cyl(0.01, zb - z1, 'steel', { axis: 'z', seg: 14 }), [x, y, (z1 + zb) / 2]),
      at(nut(0.02, 0.006, 'steel', { axis: 'z' }), [x, y, zb + 0.003]),
      at(box(L, 0.012, 0.004, 'steel', { r: 0.0015 }), [x + (c[0] * L) / 2, y + (c[1] * L) / 2, zb + 0.008], [0, 0, a]),
      at(cyl(0.0075, 0.005, 'steel', { axis: 'z', seg: 14 }), [x + c[0] * L, y + c[1] * L, zb + 0.008]),
    );
  };
  const a37 = -PI / 2 + (37 * PI) / 180;
  each(P, 'UM-10B-TR#8', [handle(-0.242, 0.462, z1 + 0.009, 0.1, a37), handle(0.242, 0.462, z1 + 0.009, 0.1, a37)], [0, 0, 0.1]);
  P('UMV-10B-#12', group(handle(-0.022, 0.303, z1 + 0.024, 0.17, -PI / 2), at(ball(0.0075, 'steel'), [-0.022, 0.133, z1 + 0.032])), [0, 0, 0.1]);

  // Bloc d'eau 3 voies (page 4.3, détail C ; page 4.1) : vannes BKH-1 (UM-10B-TR#16) en acier au-dessus et
  // au-dessous du bloc, passage selon Z (corps de z 0,23 à 0,30), tige vers +X, levier plat déporté à 75 mm du flanc,
  // poignée noire vers l'avant (bout à z 0,371) ; coudes 6806 sur les orifices haut et bas ; adaptateurs 2404-16-16
  // au bout arrière des vannes ; à l'arrière du bloc, mamelon 6400, té tournant 6602 et réduction 2406-16-04 qui
  // passent la fente du flanc ; 2 bouchons 5406-P-12 en face avant ; autocollant UM-020-CE7 sur la face extérieure.
  const vx = 0.3785, vy = [0.54, 0.372], by = 0.4565;
  const bkh = (y) => group(
    at(box(0.035, 0.038, 0.05, 'steel', { r: 0.003 }), [vx, y, 0.265]),
    at(nut(0.032, 0.01, 'steel', { axis: 'z' }), [vx, y, 0.235]),
    at(nut(0.032, 0.01, 'steel', { axis: 'z' }), [vx, y, 0.295]),
    at(cyl(0.005, 0.034, 'steel', { axis: 'x', seg: 12 }), [0.4125, y, 0.265]),
    at(nut(0.012, 0.005, 'steel', { axis: 'x' }), [0.4285, y, 0.265]),
    at(box(0.004, 0.012, 0.09, 'steel', { r: 0.0015 }), [0.433, y, 0.3]),
    at(cyl(0.0085, 0.036, 'black', { axis: 'z', seg: 14 }), [0.433, y, 0.353]),
  );
  each(P, 'UM-10B-TR#16', vy.map(bkh), [0.2, 0, 0]);
  each(P, '6806-16-16', vy.map((y) => {
    const s = Math.sign(y - by), yb = by + s * 0.0505, yc = y - s * 0.013;
    return group(at(box(0.026, 0.026, 0.026, 'brass', { r: 0.004 }), [vx, y, 0.313]),
      at(cyl(0.01, Math.abs(yc - yb) + 0.002, 'brass', { seg: 14 }), [vx, (yb + yc) / 2, 0.313]));
  }), [0.2, 0, 0.05]);
  each(P, '2404-16-16', vy.map((y) => group(at(nut(0.028, 0.01, 'brass', { axis: 'z' }), [vx, y, 0.225]),
    at(cyl(0.011, 0.016, 'brass', { axis: 'z', seg: 14 }), [vx, y, 0.213]))), [0.2, 0, -0.05]);
  P('6400-16-16', group(at(nut(0.03, 0.008, 'brass', { axis: 'z' }), [0.372, 0.458, 0.264]), at(cyl(0.012, 0.018, 'brass', { axis: 'z', seg: 16 }), [0.372, 0.458, 0.251])), [0.2, 0, -0.08]);
  P('6602-16-16-16', group(at(box(0.028, 0.028, 0.028, 'brass', { r: 0.004 }), [0.372, 0.458, 0.228]),
    at(cyl(0.009, 0.016, 'brass', { seg: 14 }), [0.372, 0.437, 0.228])), [0.2, 0, -0.1]);
  P('2406-16-04', group(at(nut(0.026, 0.01, 'brass', { axis: 'z' }), [0.372, 0.458, 0.209]),
    at(cyl(0.006, 0.03, 'brass', { axis: 'z', seg: 12 }), [0.372, 0.458, 0.189])), [0.2, 0, -0.12]);
  each(P, '5406-P-12', [0.478, 0.448].map((y) => at(nut(0.02, 0.006, 'steel', { axis: 'z' }), [vx, y, 0.35])), [0.1, 0, 0.1]);
  P('UM-020-CE7', at(nameplate(0.07, 0.09, { material: 'white' }), [CON.w / 2 + 0.045, by, 0.3075], [0, PI / 2, 0]), [0.15, 0, 0]);
  return { view: { dir: [0.9, 0.5, 1.0] } };
}
