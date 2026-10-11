// P220 — Panneau de manomètres : CX030344 rév. 0 « GAUGE PANEL ASSY, DU311-TK
// NO RC » (page 220), repère 13 de P186. Support (1) en tôle pliée 10 ga :
// panneau avant 3 3/4 × 15 po, retour latéral de 1 1/4 po (côté -X) fixé au
// porteur par trois vis H 3/8-16 × 1 po filetées jusqu'à la tête (11),
// rondelles fendues (13) et écrous (15) ; deux pattes d'appui pliées vers
// l'arrière au pied, grand passe-fil Ø 1 1/2 po et deux petits trous en bas.
// De haut en bas (vue de face, page 220) : limiteur de pression du couple de
// rotation avant (2, bouton de réglage en façade, bride fixée par quatre vis
// 1/4-20 × 3/4 po (10), rondelles fendues (12) et écrous (14) ; adaptateur
// droit NPT → JIC -06 (8) au dos, coude 45° (7) dessous), manomètres Ø 2 po à
// montage arrière : pression de rotation 0-5000 psi (3), réservoir d'air
// 0-400 psi (5), air de la mine 0-160 psi (6), huile du compresseur 0-100 psi
// (4), système hydraulique 0-5000 psi (3) ; chacun reçoit au dos un coude
// FNPT → JIC -06 (9) tourné vers le bas.
// Repère : origine au milieu du bord inférieur de la face avant du panneau ;
// Y vers le haut ; +Z = face des cadrans ; retour latéral à -X.
// Encombrement ≈ 0.12 (X) × 0.38 (Y) × 0.12 (Z) m. Hauteur et largeur du
// panneau estimées d'après la vue de face (cadrans Ø 2 po pour l'échelle).
import { IN, nptFitting, orient } from './_chassis.js';

export default function P220(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const T = 0.135 * IN; // tôle 10 ga
  const W = 3.75 * IN, H = 15 * IN, FL = 1.25 * IN;
  const GR = 1.0 * IN; // rayon des boîtiers de manomètre
  const gy = [3.4, 5.5, 7.6, 9.7, 11.8].map((v) => v * IN); // de bas en haut : 3, 4, 6, 5, 3
  const ry = 13.6 * IN; // limiteur 2
  const by = [0.7, 7.5, 14.3].map((v) => v * IN); // vis 11
  const rb = 0.8 * IN; // rayon de la couronne des vis 10
  const relB = [0, 1, 2, 3].map((i) => [Math.cos(Math.PI / 4 + (i * Math.PI) / 2) * rb, ry + Math.sin(Math.PI / 4 + (i * Math.PI) / 2) * rb]);

  // ---------------------------------------------------------------- 1 — support
  {
    const panel = S.extrude([[-W / 2, 0], [W / 2, 0], [W / 2, H], [-W / 2, H]], T, 'lightGrey', {
      holes: [
        ...gy.map((y) => [0, y, GR + 0.0008]),
        [0, ry, 0.6 * IN],
        ...relB.map(([x, y]) => [x, y, 0.14 * IN]),
        [0, 1.5 * IN, 0.75 * IN], [-1.1 * IN, 2.2 * IN, 0.12 * IN], [1.1 * IN, 1.2 * IN, 0.12 * IN],
      ],
    });
    panel.position.z = -T / 2;
    const flange = S.extrude([[-FL, 0], [-T, 0], [-T, H], [-FL, H]], T, 'lightGrey', { holes: by.map((y) => [-FL / 2 - T / 2, y, 0.2 * IN]) });
    flange.rotation.y = -Math.PI / 2;
    flange.position.x = -W / 2 + T / 2;
    // Arête de pliage arrondie (R = épaisseur).
    const bend = S.cyl(T, H, 'lightGrey', { seg: 12, pos: [-W / 2 + T, H / 2, -T] });
    // Pattes d'appui au pied, pliées vers l'arrière, percées Ø 3/8 po.
    const feet = [-0.022, 0.026].map((x, i) => {
      const p = S.plate(0.032, 0.045, T, 'lightGrey', { r: 0.004, holes: [[0, i ? 0.008 : -0.006, (0.39 * IN) / 2]] });
      p.position.set(x, T / 2, -T - 0.0225);
      return p;
    });
    P('1', S.merged([panel, flange, bend, ...feet], 'lightGrey'), [0, 0, -0.1]);
  }

  // ---------------------------------------------------------------- 11, 13, 15 — fixation du retour
  const BRK = 0.25 * IN; // cornière support de P186, contre la face extérieure du retour
  for (const y of by) {
    const z = -FL / 2 - T / 2;
    const xin = -W / 2 + T; // face intérieure du retour
    P('11', orient(api, S.bolt(0.375 * IN, 1 * IN, 'zinc'), [xin, y, z], [1, 0, 0]), [0.06, 0, 0]);
    const xo = -W / 2 - BRK;
    P('13', S.washer(0.34 * IN, 0.2 * IN, 0.094 * IN, 'zinc', { axis: 'x', pos: [xo - 0.0012, y, z] }), [-0.05, 0, 0]);
    P('15', S.nut(0.5625 * IN, 0.328 * IN, 'zinc', { axis: 'x', pos: [xo - 0.0024 - 0.00417, y, z] }), [-0.08, 0, 0]);
  }

  // ---------------------------------------------------------------- manomètres
  // Manomètre à montage arrière : boîtier inox derrière le panneau, collerette
  // et lunette devant, cadran, aiguille, graduations, queue 1/4 NPT au dos.
  const gauge = (scale) => {
    const r = GR, depth = 1.1 * IN;
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const a = (-135 + i * 27) * (Math.PI / 180);
      const l = r * (i % 2 ? 0.07 : 0.14);
      const rr = r * 0.74 - l / 2;
      ticks.push(S.box(r * (i % 2 ? 0.02 : 0.035), l, 0.0004, 'black', { pos: [Math.sin(a) * rr, Math.cos(a) * rr, 0.0062], rot: [0, 0, -a] }));
    }
    // Repère d'échelle : petite plaque d'unités sous l'axe (longueur selon l'échelle).
    ticks.push(S.box(r * (scale > 1000 ? 0.5 : 0.32), r * 0.08, 0.0004, 'black', { pos: [0, -r * 0.35, 0.0062] }));
    const na = -0.6;
    return S.group(
      S.lathe([[0, -depth], [r * 0.95, -depth], [r, -depth + 0.003], [r, 0], [r * 1.18, 0], [r * 1.2, 0.002], [r * 1.12, 0.0075], [r * 1.0, 0.0075], [r * 0.98, 0.0055], [0, 0.0055]], 'chrome', { axis: 'z', seg: 40 }),
      S.cyl(r * 0.96, 0.001, 'white', { axis: 'z', seg: 40, pos: [0, 0, 0.0058] }),
      S.merged([...ticks, S.cyl(r * 0.07, 0.002, 'black', { axis: 'z', seg: 12, pos: [0, 0, 0.0068] })], 'black'),
      S.box(r * 0.04, r * 0.7, 0.0005, 'red', { pos: [Math.sin(na) * r * 0.25, Math.cos(na) * r * 0.25, 0.0072], rot: [0, 0, -na] }),
      S.cyl(r * 0.97, 0.0008, 'glass', { axis: 'z', seg: 40, pos: [0, 0, 0.0071] }),
      S.merged([
        S.nut(0.5625 * IN, 0.22 * IN, 'brass', { axis: 'z', pos: [0, 0, -depth - 0.11 * IN] }),
        S.lathe([[0, 0], ...S.thread(0.255 * IN, 0, 0.4 * IN, { r1: 0.27 * IN, pitch: 0.0014 }).map(([rr, y]) => [rr, 0.4 * IN - y]).reverse(), [0, 0.4 * IN]], 'brass', { axis: '-z', seg: 14, pos: [0, 0, -depth - 0.22 * IN] }),
      ], 'brass'),
    );
  };
  const tail = 1.1 * IN + 0.22 * IN + 0.4 * IN; // dos de la queue (depuis la face du panneau)
  // 9 — coude FNPT → MJIC -06 : six-pans taraudé vissé sur la queue, embout JIC vers le bas.
  const elbow9 = () => {
    const rt = (0.5625 * IN) / 2;
    return S.merged([
      S.nut(0.75 * IN, 0.5 * IN, 'zinc', { pos: [0, 0.25 * IN, 0] }),
      S.box(0.6 * IN, 0.6 * IN, 0.6 * IN, 'zinc', { r: 0.004, pos: [0, 0.8 * IN, 0] }),
      S.at(S.lathe([[0, 0], [rt * 0.85, 0], ...S.thread(rt, 0.002, rt * 1.9, { pitch: rt * 0.22, chamferBottom: false }), [rt * 0.92, rt * 1.95], [rt * 0.62, rt * 2.4], [0, rt * 2.4]], 'zinc', { seg: 16 }), [0, 0.8 * IN, 0.3 * IN], [Math.PI / 2, 0, 0]),
    ], 'zinc');
  };
  [['3', 5000], ['4', 100], ['6', 160], ['5', 400], ['3', 5000]].forEach(([ref, sc], i) => {
    const y = gy[i];
    P(ref, S.at(gauge(sc), [0, y, 0]), [0, 0, 0.12]);
    // Coude au dos de la queue (vissé selon -Z), sortie JIC vers le bas.
    P('9', orient(api, elbow9(), [0, y, -tail + 0.4 * IN * 0.7], [0, 0, -1], [0, -1, 0]), [0, 0, -0.25]);
  });

  // ---------------------------------------------------------------- 2 — limiteur de pression du couple
  {
    const r = 0.875 * IN, L = 2.2 * IN;
    const relief = S.group(
      // Bride devant le panneau, bouton de réglage moleté, contre-écrou.
      S.lathe([[0, 0], [1.05 * IN, 0], [1.05 * IN, 0.18 * IN], [0.95 * IN, 0.24 * IN], [0.55 * IN, 0.3 * IN], [0.5 * IN, 0.55 * IN], [0, 0.55 * IN]], 'castAlu', { axis: 'z', seg: 36 }),
      S.merged([
        S.nut(0.75 * IN, 0.2 * IN, 'zinc', { axis: 'z', pos: [0, 0, 0.65 * IN] }),
        S.cyl(0.18 * IN, 0.4 * IN, 'zinc', { axis: 'z', seg: 14, pos: [0, 0, 0.9 * IN] }),
      ], 'zinc'),
      S.lathe([[0, 0], [0.5 * IN, 0], [0.5 * IN, 0.5 * IN], [0.42 * IN, 0.6 * IN], [0, 0.6 * IN]], 'black', { axis: 'z', seg: 18, pos: [0, 0, 1.0 * IN] }),
      // Corps derrière le panneau.
      S.lathe([[0, 0], [0.55 * IN, 0], [0.6 * IN, 0.1 * IN], [r, 0.2 * IN], [r, L - 0.08 * IN], [r - 0.003, L], [0, L]], 'castAlu', { axis: '-z', seg: 32, pos: [0, 0, -T] }),
    );
    P('2', S.at(relief, [0, ry, 0]), [0, 0, 0.16]);
    // 10 / 12 / 14 : vis à tête devant la bride, rondelle fendue et écrou derrière le panneau.
    relB.forEach(([x, y]) => {
      P('10', S.bolt(0.25 * IN, 0.75 * IN, 'zinc', { axis: 'z', pos: [x, y, 0.18 * IN] }), [0, 0, 0.24]);
      P('12', S.washer(0.24 * IN, 0.13 * IN, 0.062 * IN, 'zinc', { axis: 'z', pos: [x, y, -T - 0.0008] }), [0, 0, -0.16]);
      P('14', S.nut(0.4375 * IN, 0.226 * IN, 'zinc', { axis: 'z', pos: [x, y, -T - 0.0016 - 0.00287] }), [0, 0, -0.2]);
    });
    // 8 — adaptateur droit au dos du corps ; 7 — coude 45° dessous, vers l'arrière et le bas.
    const zb = -T - L;
    const a8 = nptFitting(api, { npt: 4, jic: 6 });
    P('8', orient(api, a8.obj, [0, ry, zb], [0, 0, -1]), [0, 0, -0.25]);
    const e7 = nptFitting(api, { npt: 4, jic: 6, angle: 45 });
    P('7', orient(api, e7.obj, [0, ry - r, -T - L * 0.6], [0, -1, 0], [0, 0, -1]), [0, -0.03, -0.08]);
  }
  void THREE;

  return { view: { dir: [0.75, 0.35, 1.0] } };
}
