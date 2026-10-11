// P202 — Ensemble de galets de câble : CX008048 rév. 0 « CABLE ROLLER ASSY »
// (page 202), repère 7 de P200 (enrouleur de câble). Mécano-soudé (10) :
// plaque d'appui verticale à coins chanfreinés percée aux quatre coins, flanc
// gauche soudé à l'équerre qui porte en porte-à-faux les deux galets à gorge
// (1) sur vis à épaulement 5/8-11 × Ø 3/4 × 4 po (4) : tête à six-pans creux
// à l'extérieur du flanc, rondelles 3/4 po (7) de part et d'autre du galet,
// rondelle 5/8 po (8) et écrou 5/8-11 (11) au bout. Support en U (9) à ailes
// horizontales chanfreinées, plaqué sur la face avant de la plaque d'appui
// par quatre vis H 1/2-13 × 4 po gr. 8 (12) qui traversent aussi la ferrure
// porteuse (non fournie) : rondelles fendues (6) et écrous (5) derrière.
// Entre ses ailes, deux rouleaux verticaux (3) sur axes Ø 3/4 po à bouts
// filetés 1/2-13 (2), chacun serré par deux écrous (5) et rondelles fendues
// (6) : 4 + 4 = 8 écrous et 8 rondelles fendues.
// Repère : origine au centre de la face arrière (d'appui) de la plaque 10,
// Y vers le haut, X selon la largeur de la plaque (flanc à -X), +Z vers
// l'avant (côté rouleaux). Encombrement ≈ 0.27 (X) × 0.42 (Y) × 0.14 (Z) m,
// vis 12 dépassant de 0.07 m derrière la plaque. Les cotes non données par
// la liste sont estimées d'après les proportions de la vue isométrique.

const IN = 0.0254;

export default function P202(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = 0.375 * IN; // tôles 3/8 po

  // Oriente un objet construit selon +Y vers dir, origine en pos.
  const orient = (obj, pos, dir) => {
    const g = S.group(obj);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
    g.position.set(...pos);
    return g;
  };
  const chamfRect = (w, h, c) => [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c]];

  // ---------------------------------------------------------------- 10 — mécano-soudé
  const PW = 0.25, PH = 0.42; // plaque d'appui
  const XF = -PW / 2; // face extérieure du flanc
  const FD = 0.13; // profondeur du flanc (Z)
  const YR = [0.15, -0.15]; // axes des galets à gorge
  const ZR = 0.072; // profondeur des axes des galets (Z)
  const BOLT12 = [[-0.075, 0.108], [0.085, 0.108], [-0.075, -0.108], [0.085, -0.108]];
  const r12 = (0.53 * IN) / 2;
  const mount = S.extrude(chamfRect(PW, PH, 0.035), T, 'grey', {
    holes: [
      ...[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => [sx * (PW / 2 - 0.028) + (sx < 0 ? 0.018 : 0), sy * (PH / 2 - 0.03), (0.5625 * IN) / 2]),
      ...BOLT12.map(([x, y]) => [x, y, r12]),
    ],
  });
  mount.position.z = T / 2;
  // Flanc (plan YZ) : coins avant chanfreinés, deux perçages Ø 3/4 po pour les vis à épaulement.
  const sideProf = [[T, -PH / 2 + 0.02], [FD - 0.03, -PH / 2 + 0.02], [FD, -PH / 2 + 0.05], [FD, PH / 2 - 0.05], [FD - 0.03, PH / 2 - 0.02], [T, PH / 2 - 0.02]];
  const side = S.extrude(sideProf, T, 'grey', { holes: YR.map((y) => [ZR, y, (0.76 * IN) / 2]) });
  side.rotation.y = -Math.PI / 2;
  side.position.x = XF + T / 2;
  const beads = S.merged([
    S.weld([[XF + T + 0.002, -PH / 2 + 0.025, T + 0.002], [XF + T + 0.002, PH / 2 - 0.025, T + 0.002]], 0.007, 'grey'),
    S.weld([[XF - 0.001, -PH / 2 + 0.025, T + 0.002], [XF - 0.001, PH / 2 - 0.025, T + 0.002]], 0.006, 'grey'),
  ], 'grey');
  beads.geometry.userData.edgeAngle = 75;
  P('10', S.group(S.merged([mount, side], 'grey'), beads), [0, 0, 0]);

  // ---------------------------------------------------------------- 9 — support en U
  const BW = 0.2, BX = 0.005; // largeur et centre (X)
  const BH = 0.25; // hauteur de l'âme
  const YF = 0.085; // plans des ailes (milieu de tôle)
  const FZ = 0.125; // saillie des ailes
  const XRol = [-0.035, 0.06]; // axes des rouleaux
  const ZRol = 0.078;
  const web = S.extrude(chamfRect(BW, BH, 0.012), T, 'grey', { holes: BOLT12.map(([x, y]) => [x - BX, y, r12]) });
  web.position.set(BX, 0, T + T / 2);
  const flange = (y) => {
    // Aile : coins avant chanfreinés à 45°, alésages Ø 0,52 po des axes.
    const pts = [[-BW / 2, 0], [BW / 2, 0], [BW / 2, FZ - 0.035], [BW / 2 - 0.035, FZ], [-BW / 2 + 0.035, FZ], [-BW / 2, FZ - 0.035]];
    const m = S.extrude(pts.map(([x, z]) => [x, -z]), T, 'grey', { holes: XRol.map((x) => [x - BX, -ZRol, (0.52 * IN) / 2]) });
    m.rotation.x = -Math.PI / 2;
    m.position.set(BX, y, 2 * T);
    return m;
  };
  const fBeads = [YF, -YF].flatMap((y) => [y + T / 2 + 0.002, y - T / 2 - 0.002].map((yy) => S.weld([[BX - BW / 2 + 0.004, yy, 2 * T + 0.002], [BX + BW / 2 - 0.004, yy, 2 * T + 0.002]], 0.006, 'grey')));
  const fb = S.merged(fBeads, 'grey');
  fb.geometry.userData.edgeAngle = 75;
  P('9', S.group(S.merged([web, flange(YF), flange(-YF)], 'grey'), fb), [0, 0, 0.16]);

  // ---------------------------------------------------------------- 3 — rouleaux, 2 — axes
  const gap = 2 * YF - T; // entre ailes
  const rollerLen = gap - 0.003;
  const roller = () => S.lathe([
    [(0.77 * IN) / 2, -rollerLen / 2], [0.0275, -rollerLen / 2], [0.0295, -rollerLen / 2 + 0.002], [0.0295, rollerLen / 2 - 0.002],
    [0.0275, rollerLen / 2], [(0.77 * IN) / 2, rollerLen / 2], [(0.77 * IN) / 2, -rollerLen / 2],
  ], 'charcoal', { seg: 32 });
  // Axe Ø 3/4 po, bouts filetés 1/2-13 dépassant des ailes (rondelle fendue + écrou).
  const rs = 0.375 * IN, rt = 0.25 * IN;
  const hs = YF - T / 2; // demi-longueur du corps (épaulement sur la face intérieure des ailes)
  const L2 = YF + T / 2 + 0.019;
  const shaftHalf = () => S.lathe([[0, -L2], ...S.thread(rt, -L2, -hs + 0.0015, { pitch: IN / 13 }), [rt, -hs + 0.0015], [rs, -hs + 0.0045], [rs, 0], [0, 0]], 'zinc', { seg: 18 });
  const shaft = () => S.merged([shaftHalf(), S.at(shaftHalf(), [0, 0, 0], [Math.PI, 0, 0])], 'zinc');
  // Écrou 1/2-13 (6 pans 3/4 po × 7/16) et rondelle fendue 1/2 po le long de +Y.
  const nut12 = () => S.nut(0.75 * IN, 0.4375 * IN, 'zinc', { pos: [0, 0.4375 * IN / 2, 0] });
  const lock12 = () => S.washer((0.869 * IN) / 2, (0.512 * IN) / 2, 0.125 * IN, 'zinc', { pos: [0, 0.0625 * IN, 0] });
  const lw = 0.125 * IN;
  // Les flancs intérieurs des ailes laissent sortir l'axe (les ailes sont percées Ø 0,52 :
  // l'axe Ø 3/4 s'arrête sur l'aile par l'épaulement, le bout 1/2 po traverse).
  XRol.forEach((x) => {
    const z = 2 * T + ZRol;
    P('3', S.at(roller(), [x, 0, z]), [0, 0, 0.3]);
    P('2', S.at(shaft(), [x, 0, z]), [0, -0.25, 0.3]);
    for (const s of [1, -1]) {
      const y0 = s * (YF + T / 2);
      P('6', orient(lock12(), [x, y0, z], [0, s, 0]), [0, s * 0.05 + (s < 0 ? -0.25 : 0), 0.3]);
      P('5', orient(nut12(), [x, y0 + s * lw, z], [0, s, 0]), [0, s * 0.08 + (s < 0 ? -0.25 : 0), 0.3]);
    }
  });
  void THREE;

  // ---------------------------------------------------------------- 12 — vis H 1/2-13 × 4 po
  BOLT12.forEach(([x, y]) => {
    P('12', S.bolt(0.5 * IN, 4 * IN, 'zinc', { axis: 'z', pos: [x, y, 2 * T] }), [0, 0, 0.3]);
    // Derrière la ferrure porteuse (tube de 2 po supposé) : rondelle fendue puis écrou.
    const zb = -2 * IN;
    P('6', orient(lock12(), [x, y, zb], [0, 0, -1]), [0, 0, -0.1]);
    P('5', orient(nut12(), [x, y, zb - lw], [0, 0, -1]), [0, 0, -0.14]);
  });

  // ---------------------------------------------------------------- 1, 4, 7, 8, 11 — galets à gorge
  // Galet : joues Ø 3,5 po, gorge en arc jusqu'à Ø 2 po, alésage Ø 3/4 po, long. 3,34 po.
  const gl = 3.34 * IN, gR = 1.75 * IN, gr = 1.0 * IN, gb = (0.77 * IN) / 2;
  const groove = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI;
    groove.push([gr + (gR - 0.004 - gr) * (1 - Math.sin(a)) ** 0.8, -gl / 2 + 0.008 + ((gl - 0.016) * i) / 14]);
  }
  const spool = () => S.lathe([[gb, -gl / 2], [gR - 0.002, -gl / 2], [gR, -gl / 2 + 0.002], [gR, -gl / 2 + 0.006], ...groove,
    [gR, gl / 2 - 0.006], [gR, gl / 2 - 0.002], [gR - 0.002, gl / 2], [gb, gl / 2], [gb, -gl / 2]], 'darkSteel', { seg: 40 });
  // Vis à épaulement : tête cylindrique Ø 1 1/8 × 3/4 po à six-pans creux 3/8, épaulement
  // Ø 3/4 × 4 po, filet 5/8-11 sur 3/4 po ; construite tête en bas (y = 0 sous la tête), le long de +Y.
  const shoulderBolt = () => {
    const hr = 0.5625 * IN, hh = 0.75 * IN, hx = (0.375 * IN) / 2 / Math.cos(Math.PI / 6);
    const Ls = 4 * IN, Lt = 0.75 * IN;
    return S.group(
      S.lathe([[hx, -hh], [hr - 0.0015, -hh], [hr, -hh + 0.0015], [hr, -0.001], [hr - 0.001, 0], [(0.75 * IN) / 2, 0],
        [(0.75 * IN) / 2, Ls], [0.0066, Ls], ...S.thread((0.625 * IN) / 2, Ls + 0.001, Ls + Lt, { pitch: IN / 11 }).map(([r, y]) => [r, 2 * Ls + Lt + 0.001 - y]).reverse(), [0, Ls + Lt]].filter(Boolean), 'blackOxide', { seg: 22 }),
      S.lathe([[hx, -hh], [hx, -hh + 0.007], [0, -hh + 0.009]], 'blackOxide', { seg: 6 }),
    );
  };
  const w7 = 0.134 * IN, w8 = 0.095 * IN;
  YR.forEach((y) => {
    const z = ZR;
    const ax = [1, 0, 0];
    let x = XF; // face extérieure du flanc ; la vis entre par -X
    P('4', orient(shoulderBolt(), [x, y, z], ax), [-0.16, 0, 0]);
    x += T;
    P('7', orient(S.washer((1.47 * IN) / 2, (0.81 * IN) / 2, w7, 'zinc'), [x + w7 / 2, y, z], ax), [0.18, 0, 0]);
    x += w7;
    P('1', orient(spool(), [x + gl / 2, y, z], ax), [0.27, 0, 0]);
    x += gl;
    P('7', orient(S.washer((1.47 * IN) / 2, (0.81 * IN) / 2, w7, 'zinc'), [x + w7 / 2, y, z], ax), [0.36, 0, 0]);
    x += w7;
    P('8', orient(S.washer((1.31 * IN) / 2, (0.69 * IN) / 2, w8, 'zinc'), [x + w8 / 2, y, z], ax), [0.41, 0, 0]);
    x += w8;
    P('11', orient(S.nut(0.9375 * IN, 0.547 * IN, 'zinc'), [x + 0.547 * IN / 2, y, z], ax), [0.46, 0, 0]);
  });

  return { view: { dir: [-0.9, 0.6, 1.1] } };
}
