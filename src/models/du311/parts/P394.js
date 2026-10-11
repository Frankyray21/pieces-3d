// P394 — Bloc des capteurs de pression : CX036964 rév. 0 « ASSY, TRANSDUCER
// BLOCK » (page 394), repère 33 de P186 (16 lb). Barre usinée à 10 orifices
// (5) portant neuf capteurs, de gauche à droite sur l'élévation : retenue,
// tirage, rotation, eau de mine, air de mine, huile du compresseur, réservoir,
// translation, air de forage. Capteurs 0-5000 psi (4) aux voies 1, 2, 3, 8 ;
// 0-200 psi (2) aux voies 4, 5, 6 ; 0-1000 psi (3) aux voies 7 et 9.
// Chaque voie : orifice ORB -04 en façade, coude ORB -04 → JIC -06 (9) tourné
// vers le bas, capteur suspendu dessous ; voies 2 et 6 : té tournant (6) entre
// coude et capteur (branche vers -X sur la voie 2, vers +Z sur la voie 6) ;
// voie 3 (rotation) : capteur sous l'orifice inférieur par l'adaptateur ORB
// -04 → JIC -04 (10) et l'adaptateur tournant NPT -04 (8). Sélecteur de
// circuit (1) en façade, au-dessus de la voie 3, coudes NPT 1/4 → JIC -06 (7)
// à ses deux bouts tournés vers le bas. Douze bouchons ORB -04 (11) : dix sur
// le dessus, un en façade et un dessous au bout -X. Deux vis H 1/4-20 × 2 po
// (12) et rondelles (13) traversent la barre de l'avant vers la tôle support.
// Repère : origine au centre de la face arrière de la barre (face d'appui),
// X le long de la barre (voie 1 à -X), Y vers le haut, +Z vers l'avant.
// Barre 420 × 38 × 38 mm, pas des voies 44 mm (proportions de l'élévation).
// Encombrement ≈ 0.42 (X) × 0.16 (Y) × 0.09 (Z) m.
import { IN, nptFitting, orbAdapter, orient, orientPoint, capScrew } from './_chassis.js';

export default function P394(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = 0.42, H = 0.038, D = 0.038;
  const XS = [-0.15, -0.106, -0.062, -0.018, 0.026, 0.07, 0.114, 0.158, 0.2].map((x) => x - 0.0105);
  const XEND = -0.196;
  const YC = 0; // milieu de la barre en hauteur
  const ZF = D; // face avant

  // 5 — barre : bossages lamés des orifices de façade, chanfreins.
  {
    const body = [S.box(L, H, D, 'castAlu', { r: 0.0015, pos: [0, YC, D / 2] })];
    const spots = [];
    for (const x of [...XS, XEND]) spots.push(S.ring(0.009, 0.0045, 0.0006, 'steel', { axis: 'z', seg: 24, pos: [x, YC, ZF + 0.0003] }));
    for (const x of [XEND, ...XS]) spots.push(S.ring(0.009, 0.0045, 0.0006, 'steel', { seg: 24, pos: [x, YC + H / 2 + 0.0003, D / 2] }));
    P('5', S.group(S.merged(body, 'castAlu'), S.merged(spots, 'steel')), [0, 0, -0.05]);
  }
  // 11 — bouchons ORB -04 : dix dessus, un en façade et un dessous au bout -X.
  const plug = () => S.group(
    S.merged([S.nut(0.0143, 0.006, 'zinc', { pos: [0, 0.0038, 0] }), S.cyl(0.0075, 0.0008, 'zinc', { seg: 18, pos: [0, 0.0004, 0] })], 'zinc'),
    S.torus(0.0058, 0.0007, 'rubber', { pos: [0, 0.0004, 0] }),
  );
  for (const x of [XEND, ...XS]) P('11', S.at(plug(), [x, YC + H / 2, D / 2]), [0, 0.05, 0]);
  P('11', orient(api, plug(), [XEND, YC, ZF], [0, 0, 1]), [0, 0, 0.05]);
  P('11', orient(api, plug(), [XEND, YC - H / 2, D / 2], [0, -1, 0]), [0, -0.05, 0]);

  // Capteur de pression : six-pans de raccordement en haut (y = 0), corps
  // inox, embase et connecteur carré (Packard) en bas ; le long de -Y.
  const transducer = () => S.group(
    S.merged([
      S.nut(0.0222, 0.009, 'steel', { pos: [0, -0.0045, 0] }),
      S.cyl(0.0095, 0.042, 'steel', { seg: 24, pos: [0, -0.03, 0] }),
      S.cyl(0.0105, 0.006, 'steel', { seg: 24, pos: [0, -0.054, 0] }),
    ], 'steel'),
    S.merged([
      S.box(0.017, 0.016, 0.017, 'plastic', { r: 0.0015, pos: [0, -0.065, 0] }),
      S.box(0.012, 0.012, 0.004, 'plastic', { pos: [0, -0.07, 0.0095] }),
    ], 'plastic'),
  );
  const RANGE = ['4', '4', '4', '2', '2', '2', '3', '4', '3'];
  const put = (ref, f, pos, dir, side, e) => { P(ref, orient(api, f.obj, pos, dir, side), e); return orientPoint(api, f.out, pos, dir, side); };

  XS.forEach((x, i) => {
    const ch = i + 1;
    if (ch === 3) {
      // Voie 3 : orifice inférieur, 10 puis 8, capteur.
      const a = orbAdapter(api, 4, 4);
      P('10', orient(api, a.obj, [x, YC - H / 2, D / 2], [0, -1, 0]), [0, -0.04, 0]);
      const y8 = YC - H / 2 - a.tip + 0.004;
      const f8 = nptFitting(api, { npt: 4, jic: 4, end: 'swivel' });
      // 8 : écrou tournant en haut (sur 10), queue NPT vers le bas dans le capteur.
      P('8', orient(api, f8.obj, [x, y8 - f8.out[1], D / 2], [0, 1, 0]), [0, -0.07, 0]);
      P(RANGE[i], S.at(transducer(), [x, y8 - f8.out[1], D / 2]), [0, -0.11, 0]);
      return;
    }
    // Coude 9 : queue dans l'orifice de façade, sortie JIC -06 vers le bas.
    const out = put('9', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), [x, YC, ZF], [0, 0, 1], [0, -1, 0], [0, 0, 0.05]);
    let yt = out[1] - 0.012; // haut du capteur : six-pans vissé sur tout le filet de l'embout
    if (ch === 2 || ch === 6) {
      // 6 — té tournant : écrou en haut, passage vers le bas, branche latérale.
      const sn = (0.6875 + 0.0625) * IN;
      const tee = S.merged([
        S.nut(sn, 0.011, 'zinc', { pos: [0, -0.0055, 0] }),
        S.box(0.016, 0.02, 0.016, 'zinc', { r: 0.002, pos: [0, -0.021, 0] }),
        S.lathe([[0, 0], [0.0071, 0], ...S.thread(0.0071, 0.002, 0.012, { pitch: 0.0014, maxTurns: 5, chamferBottom: false }), [0.005, 0.016], [0, 0.016]], 'zinc', { seg: 14, pos: [0, -0.031, 0] }).rotateX(Math.PI),
        S.at(S.lathe([[0, 0], [0.0071, 0], ...S.thread(0.0071, 0.002, 0.012, { pitch: 0.0014, maxTurns: 5, chamferBottom: false }), [0.005, 0.016], [0, 0.016]], 'zinc', { seg: 14 }), [0, -0.021, 0.008], [Math.PI / 2, 0, 0]),
      ], 'zinc');
      const g = S.group(tee);
      g.position.set(x, out[1] - 0.008, out[2]);
      if (ch === 2) g.rotation.y = -Math.PI / 2; // branche vers -X
      P('6', g, [0, -0.05, 0.03]);
      yt = out[1] - 0.008 - 0.047 + 0.004;
    }
    P(RANGE[i], S.at(transducer(), [x, yt, out[2]]), [0, -0.1, 0.03]);
  });

  // 1 — sélecteur de circuit (valve navette) en façade au-dessus de la voie 3, 7 — coudes.
  {
    const xc = XS[2], yc = YC + 0.006, zc = ZF + 0.03;
    const body = S.merged([
      S.box(0.05, 0.024, 0.022, 'brass', { r: 0.002, pos: [xc, yc, zc] }),
      ...[-1, 1].map((s) => S.at(S.nut(0.019, 0.008, 'brass'), [xc + s * 0.029, yc, zc], [0, 0, Math.PI / 2])),
    ], 'brass');
    P('1', body, [0, 0.03, 0.06]);
    for (const s of [-1, 1]) put('7', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), [xc + s * 0.033, yc, zc], [s, 0, 0], [0, -1, 0], [s * 0.04, 0.03, 0.06]);
  }
  // 12, 13 — vis H 1/4 × 2 po et rondelles, de l'avant vers la tôle support.
  for (const x of [-0.131, 0.132]) {
    P('13', orient(api, S.washer(0.3 * IN, 0.14 * IN, 0.065 * IN, 'zinc'), [x, YC, ZF + 0.0008], [0, 0, 1]), [0, 0, 0.05]);
    P('12', orient(api, S.bolt(0.25 * IN, 2 * IN, 'zinc'), [x, YC, ZF + 0.0017], [0, 0, 1]), [0, 0, 0.09]);
  }
  void capScrew;
  return { view: { dir: [0.3, 0.3, 1] } };
}
