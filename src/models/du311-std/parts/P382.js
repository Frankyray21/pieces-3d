// P382 — Bloc des capteurs de pression : CX036415 rév. 0 « ASSY, TRANSDUCER
// BLOCK, DU311 » (page 382), repère 27 du porteur P208. Barre d'aluminium à
// 8 voies (2, CX019696 : 368 × 38 × 38 mm, pas des voies 46,6 mm, lamages
// ORB -04 de 7/8 po pour l'échelle) ; chaque voie traverse la barre : orifice
// en façade, orifice dessus et orifice dessous. De gauche à droite sur
// l'élévation : voie 1 libre (trois bouchons), réservoir d'air (capteur
// 0-200 psi P384, 3), eau de mine basse pression (0-1000 psi P386, 4), air de
// forage (0-1000 psi P386, 4), rotation (0-5000 psi P388, 5), voie 6 libre
// (trois bouchons), poussée (5) et retenue (5). Les capteurs sont vissés sous
// la barre ; l'arrivée de chaque voie se fait par un coude ORB -04 → JIC -06
// (9) : en façade tourné vers le bas (voies 2, 3, 7, 8), dessus tourné vers
// l'extérieur (voies 4 et 5, renvois vers le tableau de manomètres). Voie 5 :
// le clapet navette 1/4 NPT (1, CP17024) sélectionne la plus haute des deux
// pressions de rotation ; il pend devant la barre, tenu par l'adaptateur droit
// ORB -04 → JIC -04 (10) vissé en façade, l'adaptateur tournant NPT / JIC -04
// (8) et le coude de tuyauterie FNPT / MNPT 1/4 (11) vissé dans sa sortie ;
// coudes MNPT -04 → JIC -06 (7) sur ses deux entrées, tournés vers le bas.
// Tés à écrou tournant -06 (6) sous le coude d'entrée gauche du clapet et sous
// les coudes des voies 7 et 8, branches vers +X. Onze bouchons ORB -04 à tête
// six-pans (12) : voies 1 et 6 (dessus, façade, dessous), dessus des voies 2,
// 3, 7, 8 et façade de la voie 4. Deux vis H 1/4-20 × 2 po (13) et rondelles
// Grower (14) traversent la barre de la façade vers le flanc.
// Repère machine (layout.js), posé à l'identité par P208 : barre vissée sur la
// face extérieure du flanc droit du châssis avant (dos à z = 0.495), de
// x = 0.55 à 0.918, milieu à y = 0.78, capteurs pendants (FB.transducers de
// _frontb.js ; repère 27 de carrier.js). Châssis avant : corps « front ».
import { FB, IN, orbAdapter, orbElbow, nptFitting, orient, orientPoint, orbPlugHex, spotFace, boltAt, swivelRunTee, shuttle17024, SH17, front } from './_frontb.js';

const LB = 0.368, HB = 1.5 * IN; // barre (X) et section carrée
const XS = Array.from({ length: 8 }, (_, i) => -0.163 + i * 0.04657);

export default function P382(api) {
  const { S } = api;
  const T = (obj) => { const g = S.group(obj); g.position.set(...FB.transducers); return front(g); };
  const P = (ref, obj, e) => api.part(ref, T(obj), e);
  const yt = HB / 2, zc = HB / 2, zf = HB;
  const port = { top: (x) => [x, yt, zc], front: (x) => [x, 0, zf], bot: (x) => [x, -yt, zc] };
  const DIR = { top: [0, 1, 0], front: [0, 0, 1], bot: [0, -1, 0] };

  // 2 — barre : lamages de tous les orifices, lamages des deux vis.
  {
    const steel = [];
    for (const x of XS) for (const k of ['top', 'front', 'bot']) steel.push(spotFace(api, 4, port[k](x), DIR[k]));
    for (const x of [-0.14, 0.14]) steel.push(S.ring(0.0062, 0.0036, 0.0005, 'steel', { axis: 'z', seg: 18, pos: [x, 0, zf + 0.00025] }));
    // Numéros de voie frappés sur la face supérieure arrière.
    XS.forEach((x, i) => { for (let k = 0; k <= i % 4; k++) steel.push(S.box(0.0008, 0.0003, 0.004, 'steel', { pos: [x + 0.012 + k * 0.0016, yt + 0.00015, 0.006] })); });
    P('2', S.group(S.merged([S.box(LB, HB, HB, 'castAlu', { r: 0.0015, pos: [0, 0, zc] })], 'castAlu'), S.merged(steel, 'steel')), [0, 0, -0.06]);
  }
  // 12 — bouchons ORB -04 à tête six-pans.
  const plugs = [[0, 'top'], [0, 'front'], [0, 'bot'], [1, 'top'], [2, 'top'], [3, 'front'], [5, 'top'], [5, 'front'], [5, 'bot'], [6, 'top'], [7, 'top']];
  for (const [i, k] of plugs) P('12', orient(api, orbPlugHex(api, 4), port[k](XS[i]), DIR[k]), DIR[k].map((v) => v * 0.05));

  // Capteurs sous la barre (repère des capteurs : queue vers −Y → retournés, cale vers +Z).
  const sensors = [[1, 'P384', '3'], [2, 'P386', '4'], [3, 'P386', '4'], [4, 'P388', '5'], [6, 'P388', '5'], [7, 'P388', '5']];
  for (const [i, id, ref] of sensors) P(ref, S.at(api.sub(id), port.bot(XS[i]), [0, 0, Math.PI]), [0, -0.12, 0]);

  // 9 — coudes d'arrivée : façade vers le bas (2, 3, 7, 8), dessus vers l'extérieur (4, 5).
  const noses = {};
  for (const i of [1, 2, 6, 7]) {
    const e = orbElbow(api, 4, 6);
    P('9', orient(api, e.obj, port.front(XS[i]), [0, 0, 1], [0, -1, 0]), [0, -0.02, 0.06]);
    noses[i] = orientPoint(api, e.out, port.front(XS[i]), [0, 0, 1], [0, -1, 0]);
  }
  for (const i of [3, 4]) P('9', orient(api, orbElbow(api, 4, 6).obj, port.top(XS[i]), [0, 1, 0], [0, 0, 1]), [0, 0.06, 0.02]);

  // 10, 8, 11, 1, 7 — chaîne du clapet navette sur la façade de la voie 5.
  const xc = XS[4];
  const a10 = orbAdapter(api, 4, 4);
  P('10', orient(api, a10.obj, port.front(xc), [0, 0, 1]), [0, 0, 0.05]);
  const f8 = nptFitting(api, { npt: 4, jic: 4, end: 'swivel' });
  const z8 = zf + a10.tip - 0.006 + f8.out[1]; // face d'appui du six-pans de 8 (queue NPT vers +Z)
  P('8', orient(api, f8.obj, [xc, 0, z8], [0, 0, -1]), [0, 0, 0.08]);
  const f11 = nptFitting(api, { npt: 4, angle: 90, end: 'fnpt' });
  const o11 = [xc, -f11.out[1], z8 + f11.out[2]]; // face de sortie du clapet (taraudage FNPT de 11 sur la queue de 8)
  P('11', orient(api, f11.obj, o11, [0, 1, 0], [0, 0, -1]), [0, -0.04, 0.1]);
  const cs = [xc, o11[1] - SH17.C / 2, o11[2]];
  P('1', S.at(shuttle17024(api), cs), [0, -0.08, 0.12]);
  for (const s of [-1, 1]) {
    const e7 = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
    const pos = [xc + s * SH17.L / 2, cs[1], cs[2]];
    P('7', orient(api, e7.obj, pos, [s, 0, 0], [0, -1, 0]), [s * 0.05, -0.08, 0.12]);
    if (s < 0) noses.sh = orientPoint(api, e7.out, pos, [s, 0, 0], [0, -1, 0]);
  }
  // 6 — tés à écrou tournant sous le coude gauche du clapet et sous les coudes des voies 7 et 8.
  for (const k of ['sh', 6, 7]) P('6', orient(api, swivelRunTee(api, 6).obj, noses[k], [0, -1, 0], [1, 0, 0]), [0, -0.07, 0.06]);

  // 13, 14 — vis H 1/4 × 2 po et rondelles Grower, de la façade vers le flanc.
  for (const x of [-0.14, 0.14]) {
    const b = boltAt(api, 0.25, 2.0, [x, 0, zf], [0, 0, 1]);
    P('14', b.washer, [0, 0, 0.05]);
    P('13', b.bolt, [0, 0, 0.1]);
  }
  return { view: { dir: [0.5, 0.2, 1.1] } };
}
