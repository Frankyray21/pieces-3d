// P208 — Porteur « CLTR ASSY, FRAME DU311 10703 » CX038459 (pages 208 à
// 213) : porteur Pegasus (7 : P220, avec le boîtier de raccordement P330) et
// équipements du pont avant, tous dessinés dans le repère machine
// (../layout.js) et posés à l'identité : tôles de protection (3, P214),
// tuyauterie d'air de la glissière (4, P216), indicateur de bas niveau de
// graisse (5, P218 = TVK P342, sur le réservoir de graisse), couvercle du pont
// avant (8, P332), groupe de pompage 60 HP (9, P334), pompe à eau (11, P338),
// panneau de manomètres (12, P348), adaptateurs d'aspiration (13, P350 ; 24,
// P380), électrovannes d'air (14, P352), injection de graisse (15, P356),
// électrovanne de détection de charge (16, P362), collecteurs de pression et
// de retour (17, P364 ; 18, P366), filtres haute pression (20, P368),
// télésurveillance (21, P372), adaptateurs de refoulement (22, P376 = TVK
// P272, repère du groupe de pompage), traversée DA101 / DA201 (23, P378 = TVK
// P388), bloc de capteurs (27, P382), raccords rapides 3/8 (28, P390 = TVK
// P162), refroidisseur hydraulique (29, P392, avec le faisceau dessiné par
// oilCooler), bancs de distributeurs avance, mise en place et forage (30, 31,
// 32 : P394, P398, P402), sélecteur (33, P408) et graissage centralisé du
// porteur (34, P410).
// Pièces propres : 2 console du réservoir et de la pompe de graisse (flanc
// gauche du châssis avant, plateau sous les pattes du réservoir, face
// d'appui à z = −0.565) ; 6 support du boîtier de commande de la pompe de
// remplissage ; 10 bouton-poussoir de la pompe de remplissage ; 19 support du
// panneau ERIS (sur le capot moteur) ; 25 / 26 tôles de recouvrement des bancs
// de 10 et 12 sections (dessus des bancs, lumières des leviers) ; 1, 36, 35, 37
// sortie de la tuyauterie d'air arrière (P314, collet F2) : adaptateur bride
// code 61 → 2 po NPTF, mamelon, coude 45° et flexible à bride qui passe
// l'articulation jusqu'au collet arrière de P216.
// La tuyauterie avant du porteur (P292 rep. 67, P312) porte les mêmes tubes que
// P216 : elle est retirée ici pour ne pas les dessiner deux fois (elle reste
// dans P292 vu seul). Les supports qu'aucune liste ne donne (platines des
// bancs et du panneau de manomètres, tablettes des collecteurs, des filtres,
// de la pompe à eau et des électrovannes d'air) sont dessinés avec le
// porteur (7).
// Simulation : tout ce qui est en avant de l'articulation suit « front ».
import { M, body, flex } from '../layout.js';
import { GR, PIPE, oilCooler } from './_fronta.js';
import { PIPE314 } from './P314.js';

const IN = 0.0254;
const FT = M.frameTop, FZ = M.frameZ;
const SO = FZ + 0.015; // face extérieure des flancs du châssis avant (±0.495)

export default function P208(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, bolt, merged, extrude, enclosure, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e);
  const bolts = (pts, d, len, axis = 'y', rot) => merged(pts.map((p) => at(bolt(d * IN, len * IN, 'zinc', { axis }), p, rot)), 'zinc');

  // 7 — porteur Pegasus (P220) et boîtier de raccordement (P330), tuyauterie avant P312 retirée
  const carrier = api.sub('P220');
  const p292 = (carrier.userData.parts || []).find((p) => p.userData.partRef === '7');
  if (p292) {
    const list = p292.userData.parts || [];
    const k = list.findIndex((p) => p.userData.partRef === '67');
    if (k >= 0) {
      const pipe = list[k];
      list.splice(k, 1);
      pipe.parent.remove(pipe);
    }
  }
  // supports non listés (tôle 1/4 et 3/8 po), châssis avant
  const t4 = 0.25 * IN, t6 = 0.375 * IN;
  const supports = body('front', group(
    // platine des bancs : deux plats 2 × 3/8 po devant la tôle d'appui (x 0.7337 … 0.74),
    // boulonnés aux montants des fenêtres du repos du mât et à deux montants d'extrémité
    ...[1.395, 1.72].map((y) => at(box(0.0095, 0.05, 1.5, 'lightGrey'), [0.7337 - 0.0048, y, 0.016])),
    ...[-0.77, 0.79].map((z) => at(box(0.05, 1.76 - FT, 0.05, 'lightGrey', { r: 0.004 }), [0.705, (1.76 + FT) / 2, z])),
    // panneau de manomètres : tôle 120 × 470 derrière les cadrans, console sur le garde-boue
    at(box(0.12, 0.47, t4, 'lightGrey', { r: 0.006 }), [0.968, 1.487, 0.93 - t4 / 2 - 0.004]),
    at(box(0.12, M.fender + 0.02 - 1.0, t4, 'lightGrey'), [0.968, (M.fender + 1.27) / 2 - 0.01, 0.92]),
    // tablettes des collecteurs (pression, retour), des filtres et des électrovannes d'air,
    // équerres soudées sur la face extérieure du flanc droit
    at(box(0.24, t6, 0.17, 'lightGrey'), [0.39, 0.905 - t6 / 2, SO + 0.085]),
    at(box(0.21, t6, 0.17, 'lightGrey'), [1.025, 0.489 - t6 / 2, SO + 0.085]),
    at(box(0.5, 0.06, t4, 'lightGrey'), [0.75, 0.97, SO + t4 / 2]),
    at(box(0.3, t4, 0.15, 'lightGrey'), [1.44, 0.545 - t4 / 2, SO + 0.075]),
    // tablette de la pompe à eau (dessus à y = 1.00) et ses deux jambes
    at(box(0.5, t6, 0.38, 'lightGrey'), [0.73, 1.0 - t6 / 2, 0.335]),
    ...[0.52, 0.94].map((x) => at(box(0.04, 0.2, 0.04, 'lightGrey'), [x, 0.89, 0.18])),
    // pattes des goupilles du couvercle du pont (nez)
    ...[1, -1].map((s) => at(extrude([[-0.04, 0], [0.04, 0], [0.03, 0.05], [-0.03, 0.05]], t6, 'lightGrey', { holes: [[0, 0.028, 0.009]] }), [2.08, FT, s * 0.42])),
  ));
  P('7', group(carrier, api.sub('P330'), supports), [0, 0, 0]);

  // 2 — console du réservoir et de la pompe de graisse (flanc gauche avant)
  {
    const yc = GR.tank[1] - 0.25 * IN, x0 = 0.32, x1 = 0.88, z0 = GR.wall, z1 = -0.98;
    F('2', group(
      at(box(x1 - x0, 0.5 * IN, z0 - z1, 'lightGrey'), [(x0 + x1) / 2, yc - 0.25 * IN, (z0 + z1) / 2]),
      at(box(x1 - x0, 0.42, 0.5 * IN, 'lightGrey'), [(x0 + x1) / 2, yc + 0.12, z0 + 0.25 * IN]),
      ...[x0 + 0.02, x1 - 0.02].map((x) => at(extrude([[0, 0], [z0 - z1 - 0.02, 0], [0, 0.3]], 0.5 * IN, 'lightGrey'), [x, yc - 0.5 * IN, z0], [Math.PI / 2, -Math.PI / 2, 0])),
      // entretoises et vis H 1/2 po dans le flanc du châssis
      ...[x0 + 0.06, x1 - 0.06].flatMap((x) => [yc + 0.02, yc + 0.26].map((y) => at(cyl(0.02, -(z0 + 0.5 * IN) - SO, 'lightGrey', { axis: 'z', seg: 16 }), [x, y, (z0 + 0.5 * IN - SO) / 2]))),
      bolts([x0 + 0.06, x1 - 0.06].flatMap((x) => [yc + 0.02, yc + 0.26].map((y) => [x, y, z0 - 0.012])), 0.5, 2.5, 'z', [Math.PI, 0, 0]),
    ), [0, -0.2, -0.5]);
  }

  P('3', api.sub('P214'), [0, -0.45, 0]);
  P('4', api.sub('P216'), [0, 0, -0.45]);
  // 5 — indicateur de bas niveau de graisse vissé dans le dessus du réservoir (TVK P342)
  F('5', at(api.sub('P218'), [GR.tank[0] - 0.02, GR.tank[1] + 0.3048, GR.tank[2] - 0.08]), [0, 0.35, -0.45]);
  // 6 — support du boîtier de commande de la pompe à huile électrique (flanc gauche avant)
  F('6', group(
    at(box(0.24, 0.22, t4, 'lightGrey', { r: 0.008 }), [1.02, 0.72, -SO - 0.07]),
    ...[1, -1].map((s) => at(box(0.02, 0.22, 0.07, 'lightGrey'), [1.02 + s * 0.11, 0.72, -SO - 0.035])),
    bolts([[0.94, 0.65], [1.1, 0.65], [0.94, 0.79], [1.1, 0.79]].map(([x, y]) => [x, y, -SO - 0.073]), 0.3125, 0.75, 'z', [Math.PI, 0, 0]),
  ), [0.1, 0, -0.55]);
  P('8', api.sub('P332'), [0, 0.55, 0]);
  P('9', api.sub('P334'), [0, 0.55, 0]);
  // 10 — bouton-poussoir de la pompe de remplissage d'huile : boîtier IP65, bouton vert, presse-étoupe
  F('10', group(
    at(enclosure(0.08, 0.08, 0.06, 'grey'), [1.02, 0.95, -0.775]),
    at(cyl(0.022, 0.012, 'black', { axis: 'z', seg: 24 }), [1.02, 0.95, -0.811]),
    at(cyl(0.017, 0.016, 'green', { axis: 'z', seg: 24 }), [1.02, 0.95, -0.823]),
    at(cyl(0.008, 0.02, 'black', { seg: 12 }), [1.02, 0.9, -0.775]),
    at(box(0.1, 0.1, t4, 'lightGrey'), [1.02, 0.95, -0.742]),
  ), [0.2, 0.15, -0.45]);
  P('11', api.sub('P338'), [0, 0.4, 0.3]);
  P('12', api.sub('P348'), [0, 0.2, 0.5]);
  P('13', api.sub('P350'), [0, 0.35, -0.2]);
  P('14', api.sub('P352'), [0, 0.15, 0.45]);
  P('15', api.sub('P356'), [0, 0.1, -0.55]);
  P('16', api.sub('P362'), [0, -0.3, 0.5]);
  P('17', api.sub('P364'), [0, 0, 0.5]);
  P('18', api.sub('P366'), [0, -0.1, 0.5]);
  // 19 — support du panneau ERIS : trappe sur le capot moteur, platine sur entretoises
  P('19', group(
    at(box(0.36, t4, 0.28, 'lightGrey', { r: 0.01 }), [-1.73, M.engine.top + t4 / 2, -0.25]),
    at(box(0.28, t4, 0.2, 'darkSteel', { r: 0.006 }), [-1.73, M.engine.top + 0.03, -0.25]),
    ...[[-0.12, -0.08], [0.12, -0.08], [-0.12, 0.08], [0.12, 0.08]].map(([dx, dz]) => at(cyl(0.01, 0.022, 'zinc', { seg: 12 }), [-1.73 + dx, M.engine.top + 0.017, -0.25 + dz])),
    bolts([[-0.15, -0.115], [0.15, -0.115], [-0.15, 0.115], [0.15, 0.115]].map(([dx, dz]) => [-1.73 + dx, M.engine.top + t4, -0.25 + dz]), 0.25, 0.75),
  ), [0, 0.4, 0]);
  P('20', api.sub('P368'), [0.1, 0.1, 0.55]);
  P('21', api.sub('P372'), [0.15, 0.3, -0.4]);
  // 22 — adaptateurs de refoulement (TVK P272 : repère du groupe de pompage, face C à x 1.10)
  F('22', at(api.sub('P376'), [1.1, 0.78, 0]), [0.2, 0.2, 0.35]);
  // 23 — traversée DA101 / DA201 (TVK P388) sur le garde-boue droit, bouchons vers l'extérieur
  F('23', at(api.sub('P378'), [1.55, M.fender, 0.86]), [0.3, 0.2, 0.3]);
  P('24', api.sub('P380'), [0, 0.35, 0.2]);
  // 25 / 26 — tôles de recouvrement des bancs (10 et 12 sections) : dessus des bancs, une
  // lumière par levier, bords tombés devant et derrière
  const cover = (z0, z1, n) => {
    const w = z1 - z0, slots = [];
    for (let i = 0; i < n; i++) slots.push([0, -(w / 2) + (w * (i + 0.5)) / n, 0.0095, 0.05]);
    return group(
      at(S.plate(0.2, w, t4, 'grey', { cutouts: slots.map(([x, z, cw, cd]) => [x + 0.02, z, cw * 2.2, cd * 0.55]), r: 0.006 }), [0.82, 1.765, (z0 + z1) / 2]),
      ...[0.722, 0.918].map((x) => at(box(t4, 0.05, w, 'grey'), [x, 1.742, (z0 + z1) / 2])),
    );
  };
  F('25', cover(0.16, 0.742, 10), [0, 0.8, 0.2]);
  F('26', cover(-0.71, 0.012, 12), [0, 0.8, -0.2]);
  P('27', api.sub('P382'), [-0.2, -0.1, 0.5]);
  // 28 — raccords rapides 3/8 (TVK P162) sous le bloc de capteurs
  F('28', at(api.sub('P390'), [0.62, 0.66, 0.56]), [-0.2, -0.25, 0.5]);
  // 29 — refroidisseur hydraulique : raccords (P392) et faisceau
  F('29', group(api.sub('P392'), oilCooler(api)), [0, 0.5, -0.45]);
  P('30', api.sub('P394'), [0.2, 0.55, 0]);
  P('31', api.sub('P398'), [0.2, 0.5, 0.2]);
  P('32', api.sub('P402'), [0.2, 0.5, -0.2]);
  P('33', api.sub('P408'), [0, -0.15, 0.55]);
  P('34', api.sub('P410'), [0, 0, -0.4]);

  // 1, 36, 35 — sortie de la tuyauterie d'air arrière (collet F2 de P314, vers le haut) :
  // adaptateur bride code 61 → 2 po NPTF à joint torique, mamelon court 2 po sch. 80, coude 45°
  const F2 = PIPE314.F2.pos;
  const y1 = F2[1] + 0.065, y2 = y1 + 0.07;
  P('1', group(
    lathe([[0.03, 0], [0.052, 0], [0.052, 0.022], [0.04, 0.03], [0.04, 0.065], [0.03, 0.065]], 'zinc', { seg: 32 }).translateX(F2[0]).translateY(F2[1]).translateZ(F2[2]),
    at(box(0.071, 0.014, 0.133, 'zinc', { r: 0.004 }), [F2[0], F2[1] + 0.007, F2[2]]),
  ), [-0.1, 0.25, 0.2]);
  P('36', at(cyl(1.1875 * IN, 0.07, 'darkSteel', { seg: 28 }), [F2[0], (y1 + y2) / 2, F2[2]]), [-0.1, 0.35, 0.2]);
  const elbowDir = new THREE.Vector3(0.7071, 0.7071, 0);
  P('35', group(
    at(cyl(0.042, 0.06, 'castIron', { seg: 28 }), [F2[0], y2 + 0.03, F2[2]]),
    at(cyl(0.042, 0.06, 'castIron', { axis: 'x', seg: 28 }), [F2[0] + 0.035, y2 + 0.075, F2[2]], [0, 0, -Math.PI / 4 + Math.PI / 2]),
    at(S.torus(0.04, 0.04, 'castIron', { axis: 'z', seg: 24 }), [F2[0] + 0.04, y2 + 0.06, F2[2]]),
  ), [-0.1, 0.45, 0.2]);
  // 37 — flexible à bride 2 po : du coude, au-dessus de l'articulation, jusqu'au collet arrière de P216
  const e0 = [F2[0] + 0.07 + elbowDir.x * 0.02, y2 + 0.1, F2[2]];
  const R = PIPE.rear;
  const end = R.pos, pre = R.pos.map((v, k) => v + R.dir[k] * 0.16);
  P('37', flex(S, [e0, [e0[0] + 0.15, e0[1] + 0.06, e0[2] - 0.05], [-0.55, 1.08, 0.12], [0, 1.02, -0.12], [pre[0] - 0.15, pre[1] + 0.06, pre[2] - 0.04], pre, end],
    ['chassis', 'chassis', 'chassis', ['chassis', 'front', 0.5], 'front', 'front', 'front'], 1.35 * IN, 'hose', { seg: 48 }), [0, 0.3, 0]);
  return { view: { dir: [1.0, 0.75, 1.25] } };
}
