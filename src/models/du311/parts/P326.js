// P326 — Pompe à eau : CX036955 rév. 0 « ASSY, WATER PUMP » (page 326),
// repère 29 de P186. Pompe triplex à pistons plongeurs (6) entraînée par un
// moteur hydraulique (7) : bride-support du moteur (1) boulonnée sur la
// plaque de la pompe (pointillés, non fournie) par quatre vis H 3/8-16 ×
// 1 1/4 po (20) à rondelles (24) ; moteur fixé par deux vis CHC 1/2-13 ×
// 1 1/4 po (21) à rondelles (22) ; accouplement à mâchoires (8) et clavette
// (5) sous le capot d'accouplement (2, tôle pliée en pont, quatre vis H 1/4-20
// × 3/4 po (19) et rondelles (23)) ; capuchon de bout d'arbre (4) côté opposé.
// Tête de pompe : entrée 1 po par adaptateur NPT → JIC -16 (13, dessous,
// « FROM WATER ON/OFF SOLENOID VALVE »), prise de manomètre NPT 3/4 → JIC -06
// (11, côté -X), bouchon NPT 3/4 trempé (18, devant), refoulement sur le
// dessus : coude de tuyauterie 3/4 (16), té (17), coude NPT 3/4 → 1/2 (10, vers
// la vanne 3 voies), régulateur-déchargeur (3) avec coude NPT 3/4 → JIC -08
// (12) dessous. Vidange du carter (15, BSPP 1/4 → JIC -06). Moteur : deux
// adaptateurs ORB -08 (14) et coudes 45° tournants -08 (9).
// Repère : origine sur le dessus de la plaque d'appui (y = 0), à l'aplomb du
// centre du carter de pompe ; X selon l'arbre (pompe à -X, moteur à +X), Y
// vers le haut, +Z vers la tête de pompe (pistons selon Z). Axe de l'arbre à
// y = 0.08. Cotes estimées d'après les proportions des trois vues.
// Encombrement ≈ 0.62 (X) × 0.24 (Y) × 0.42 (Z) m.
import { IN, nptFitting, orbAdapter, orient, orientPoint, capScrew } from './_chassis.js';

export default function P326(api) {
  const { S, THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const YA = 0.08; // axe de l'arbre
  const XF = 0.075; // face côté moteur du carter

  // ---------------------------------------------------------------- 6 — pompe
  {
    // Carter alu : plan trapézoïdal (large à l'arrière, -Z), hauteur 0.015 → 0.15.
    const outline = [[-0.075, -0.17], [0.075, -0.17], [0.075, 0.0], [0.06, 0.07], [-0.06, 0.07], [-0.075, 0.0]];
    const body = S.extrude(outline.map(([x, z]) => [x, -z]), 0.135, 'castAlu');
    body.rotation.x = -Math.PI / 2;
    body.position.y = 0.015 + 0.135 / 2;
    const alu = [body];
    // Couvercle arrière nervuré, pattes de fixation, couvercles de roulements.
    alu.push(S.box(0.13, 0.11, 0.012, 'castAlu', { r: 0.004, pos: [0, 0.08, -0.176] }));
    for (const x of [-0.055, 0.055]) alu.push(S.box(0.03, 0.015, 0.2, 'castAlu', { r: 0.002, pos: [x, 0.0075, -0.06] }));
    alu.push(S.cyl(0.045, 0.01, 'castAlu', { axis: 'x', seg: 32, pos: [XF + 0.005, YA, -0.06] }));
    alu.push(S.cyl(0.045, 0.01, 'castAlu', { axis: 'x', seg: 32, pos: [-XF - 0.005, YA, -0.06] }));
    // Bloc des guides de pistons, entre carter et tête.
    alu.push(S.box(0.12, 0.08, 0.02, 'castAlu', { r: 0.003, pos: [0, YA, 0.08] }));
    const steel = [];
    // Arbre claveté côté moteur.
    steel.push(S.cyl(0.012, 0.045, 'steel', { axis: 'x', seg: 20, pos: [XF + 0.0325, YA, -0.06] }));
    steel.push(S.box(0.03, 0.006, 0.006, 'steel', { pos: [XF + 0.035, YA + 0.012, -0.06] }));
    // Vis des couvercles de roulements.
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      steel.push(S.at(capScrew(api, 0.006, 0.012), [s * (XF + 0.01), YA + Math.cos(a) * 0.036, -0.06 + Math.sin(a) * 0.036], [0, 0, -s * Math.PI / 2]));
    }
    // Pistons céramiques / chromés et goujons de tête.
    const chrome = [];
    for (const x of [-0.04, 0, 0.04]) chrome.push(S.cyl(0.0095, 0.04, 'chrome', { axis: 'z', seg: 20, pos: [x, YA, 0.11] }));
    for (const x of [-0.062, 0.062]) for (const y of [YA - 0.034, YA + 0.034]) {
      steel.push(S.cyl(0.005, 0.11, 'steel', { axis: 'z', seg: 12, pos: [x, y, 0.135] }));
      steel.push(S.at(S.nut(0.016, 0.009, 'steel'), [x, y, 0.1945], [Math.PI / 2, 0, 0]));
    }
    // Tête (collecteur) laiton : clapets en façade (bouchons six-pans).
    const brass = [S.box(0.135, 0.075, 0.058, 'brass', { r: 0.006, pos: [0, YA, 0.16] })];
    for (const x of [-0.04, 0, 0.04]) brass.push(S.at(S.nut(0.024, 0.008, 'brass'), [x, YA + 0.0375 + 0.004, 0.16]));
    // Bouchon de remplissage d'huile (six-pans + dôme), voyant.
    const black = [
      S.nut(0.04, 0.012, 'black', { pos: [0, 0.156, -0.05] }),
      S.lathe([[0, 0], [0.018, 0], [0.016, 0.008], [0.008, 0.012], [0, 0.0125]], 'black', { seg: 24, pos: [0, 0.162, -0.05] }),
    ];
    const glass = S.cyl(0.012, 0.004, 'glass', { axis: 'z', seg: 20, pos: [0.03, 0.06, 0.072] });
    P('6', S.group(S.merged(alu, 'castAlu'), S.merged(steel, 'steel'), S.merged(chrome, 'chrome'), S.merged(brass, 'brass'), S.merged(black, 'black'), glass), [0, 0, 0]);
  }
  // 4 — capuchon de bout d'arbre (côté -X).
  P('4', S.lathe([[0, 0], [0.02, 0], [0.02, 0.03], [0.017, 0.036], [0, 0.036]], 'black', { axis: '-x', seg: 24, pos: [-XF - 0.01, YA, -0.06] }), [-0.06, 0, 0]);

  // ---------------------------------------------------------------- raccords de tête
  const head = { bot: [0, YA - 0.0375, 0.16], side: [-0.0675, YA, 0.16], front: [0.04, YA - 0.018, 0.189] };
  const put = (ref, f, pos, dir, side, e) => { P(ref, orient(api, f.obj, pos, dir, side), e); return orientPoint(api, f.out, pos, dir, side); };
  put('13', nptFitting(api, { npt: 16, jic: 16 }), head.bot, [0, -1, 0], null, [0, -0.08, 0]);
  put('11', nptFitting(api, { npt: 12, jic: 6 }), head.side, [-1, 0, 0], null, [-0.06, 0, 0]);
  // 18 — bouchon NPT 3/4 trempé, tête carrée.
  {
    const rn = (1.05 * IN) / 2;
    const plug = S.group(
      S.lathe([[0, -rn * 1.2], ...S.thread(rn * 0.94, -rn * 1.2, 0, { r1: rn, pitch: rn * 0.2, maxTurns: 6 }), [0, 0]], 'darkSteel', { seg: 14 }),
      S.box(rn * 1.3, rn * 0.9, rn * 1.3, 'darkSteel', { r: 0.001, pos: [0, rn * 0.45, 0] }),
    );
    P('18', orient(api, plug, head.front, [0, 0, 1]), [0, 0, 0.06]);
  }
  // Refoulement : coude 16 ouvert vers -X, té 17 (passage selon X, branche vers -Z), 10, 3, 12.
  const o16 = put('16', nptFitting(api, { npt: 12, angle: 90, end: 'fnpt', material: 'zinc' }), [0.0, YA + 0.0375, 0.172], [0, 1, 0], [-1, 0, 0], [0, 0.05, 0]);
  // Té : queue mâle dans 16, corps à -X ; sorties femelles vers -X (passage) et -Z (branche).
  const rn = (1.05 * IN) / 2;
  const teeC = [o16[0] - 0.035, o16[1], o16[2]];
  {
    const T = S.merged([
      S.lathe([[0, 0], ...S.thread(rn * 0.94, 0, rn * 1.5, { r1: rn, pitch: rn * 0.2, maxTurns: 6 }).map(([r, y]) => [r, rn * 1.5 - y]).reverse(), [0, rn * 1.5]], 'zinc', { axis: 'x', seg: 14, pos: [o16[0] - rn * 1.5 + 0.012, o16[1], o16[2]] }),
      S.cyl(rn * 1.35, 0.05, 'zinc', { axis: 'x', seg: 18, pos: teeC }),
      S.lathe([[rn * 0.95, 0.03], [rn * 0.95, 0], [rn * 1.35, 0], [rn * 1.35, 0.03], [rn * 0.95, 0.03]], 'zinc', { axis: '-z', seg: 18, pos: teeC }),
    ], 'zinc');
    P('17', T, [-0.03, 0.06, 0]);
  }
  // 17 : passage vers -X (bout à teeC.x - 0.025), branche vers l'arrière (-Z).
  const runEnd = [teeC[0] - 0.025, teeC[1], teeC[2]];
  const branchEnd = [teeC[0], teeC[1], teeC[2] - 0.03];
  // 10 — coude NPT 3/4 → NPT 1/2 mâle, dans la branche, sortie vers le haut.
  put('10', nptFitting(api, { npt: 12, jic: 8, angle: 90, end: 'npt' }), branchEnd, [0, 0, -1], [0, 1, 0], [0, 0.04, -0.05]);
  // 3 — régulateur-déchargeur : corps laiton en ligne selon -X, poignée en T au bout, sortie dessous.
  {
    const x0 = runEnd[0];
    const g = S.group(
      S.merged([
        S.lathe([[0, 0], [rn, 0], [rn, 0.02], [0, 0.02]], 'brass', { axis: 'x', seg: 18, pos: [x0 - 0.02, 0, 0] }),
        S.cyl(0.018, 0.05, 'brass', { axis: 'x', seg: 24, pos: [x0 - 0.045, 0, 0] }),
        S.cyl(0.016, 0.03, 'brass', { axis: 'y', seg: 24, pos: [x0 - 0.045, -0.018, 0] }),
        S.cyl(0.012, 0.05, 'brass', { axis: 'x', seg: 20, r2: 0.009, pos: [x0 - 0.095, 0, 0] }),
      ], 'brass'),
      S.merged([
        S.at(S.nut(0.03, 0.012, 'brass'), [x0 - 0.008, 0, 0], [0, 0, Math.PI / 2]),
      ], 'brass'),
      S.merged([
        S.cyl(0.003, 0.03, 'steel', { axis: 'x', seg: 10, pos: [x0 - 0.13, 0, 0] }),
        S.cyl(0.0035, 0.05, 'steel', { axis: 'z', seg: 10, pos: [x0 - 0.145, 0, 0] }),
      ], 'steel'),
    );
    g.position.set(0, runEnd[1], runEnd[2]);
    P('3', g, [-0.08, 0, 0]);
    // 12 — sous le déchargeur, sortie JIC -08 vers le bas.
    put('12', nptFitting(api, { npt: 12, jic: 8 }), [x0 - 0.045, runEnd[1] - 0.033, runEnd[2]], [0, -1, 0], null, [-0.08, -0.05, 0]);
  }
  // 15 — vidange du carter (face +X, bas, arrière).
  put('15', nptFitting(api, { npt: 4, jic: 6 }), [XF, 0.03, -0.14], [1, 0, 0], null, [0.05, 0, 0]);

  // ---------------------------------------------------------------- accouplement, bride, moteur
  const XC = 0.155; // milieu de l'accouplement
  // 8 — accouplement à mâchoires : deux moyeux fonte, étoile élastomère.
  {
    const hub = (x) => S.lathe([[0.012, 0], [0.034, 0], [0.034, 0.03], [0.012, 0.03]], 'castIron', { axis: 'x', seg: 28, pos: [x, YA, -0.06] });
    const jaws = [];
    for (let i = 0; i < 3; i++) for (const s of [0, 1]) {
      const a = (i / 3) * Math.PI * 2 + s * Math.PI / 3;
      jaws.push(S.box(0.012, 0.016, 0.016, 'castIron', { pos: [XC + (s ? 0.004 : -0.004), YA + Math.cos(a) * 0.024, -0.06 + Math.sin(a) * 0.024] }));
    }
    P('8', S.group(
      S.merged([hub(XC - 0.036), hub(XC + 0.006), ...jaws], 'castIron'),
      S.cyl(0.033, 0.008, 'orange', { axis: 'x', seg: 28, pos: [XC, YA, -0.06] }),
      S.merged([S.at(S.nut(0.008, 0.004, 'blackOxide'), [XC - 0.02, YA + 0.034, -0.06]), S.at(S.nut(0.008, 0.004, 'blackOxide'), [XC + 0.02, YA + 0.034, -0.06])], 'blackOxide'),
    ), [0.05, 0, 0]);
  }
  // 5 — clavette de l'arbre moteur.
  P('5', S.box(0.032, 0.006, 0.006, 'steel', { pos: [XC + 0.04, YA + 0.0115, -0.06] }), [0.09, 0.03, 0]);
  // 1 — bride-support du moteur : semelle, flasque vertical à grande ouverture, deux joues.
  const XB = 0.205;
  {
    const plateV = S.extrude([[-0.075, 0], [0.075, 0], [0.075, 0.1], [0.05, 0.145], [-0.05, 0.145], [-0.075, 0.1]].map(([z, y]) => [z, y]), 0.016, 'grey', { holes: [[0, YA, 0.038], ...[45, 135, 225, 315].map((d) => [Math.cos(d * Math.PI / 180) * 0.05, YA + Math.sin(d * Math.PI / 180) * 0.05, 0.004])] });
    plateV.rotation.y = Math.PI / 2;
    plateV.position.set(XB, 0.012, -0.06);
    // Le profil (z, y) est extrudé selon X après rotation : z local = -Z monde.
    const base = S.plate(0.11, 0.17, 0.012, 'grey', { holes: [[-0.035, -0.07, 0.005], [0.035, -0.07, 0.005], [-0.035, 0.07, 0.005], [0.035, 0.07, 0.005]] });
    base.position.set(XB + 0.04, 0.006, -0.06);
    const cheeks = [-1, 1].map(() => S.extrude([[0, 0], [0.09, 0], [0, 0.08]], 0.01, 'grey'));
    cheeks.forEach((c, i) => { c.position.set(XB + 0.008, 0.012, -0.06 + (i ? 1 : -1) * 0.08); });
    P('1', S.merged([plateV, base, ...cheeks], 'grey'), [0.12, 0, 0]);
  }
  // 7 — moteur hydraulique : bride à deux oreilles, corps, carter arrière, orifices sur +Z.
  {
    const x0 = XB + 0.016;
    const g = S.group(
      S.merged([
        S.box(0.012, 0.06, 0.15, 'black', { r: 0.008, pos: [x0 + 0.006, YA, -0.06] }),
        S.cyl(0.05, 0.08, 'black', { axis: 'x', seg: 36, pos: [x0 + 0.052, YA, -0.06] }),
        S.cyl(0.05, 0.03, 'black', { axis: 'x', r2: 0.046, seg: 36, pos: [x0 + 0.107, YA, -0.06] }),
        S.box(0.05, 0.05, 0.03, 'black', { r: 0.004, pos: [x0 + 0.05, YA, -0.06 + 0.055] }),
      ], 'black'),
      S.lathe([[0, 0], [0.0125, 0], [0.0125, 0.06], [0.011, 0.062], [0, 0.062]], 'steel', { axis: '-x', seg: 20, pos: [x0, YA, -0.06] }),
    );
    P('7', g, [0.2, 0, 0]);
    // 21, 22 — vis CHC 1/2 × 1 1/4 po (oreilles), têtes côté moteur.
    for (const z of [-0.06 - 0.055, -0.06 + 0.055]) {
      P('22', S.at(S.washer(0.48 * IN, 0.26 * IN, 0.003, 'blackOxide'), [x0 + 0.0135, YA, z], [0, 0, -Math.PI / 2]), [0.25, 0, 0]);
      P('21', S.at(capScrew(api, 0.5 * IN, 1.25 * IN, 'blackOxide'), [x0 + 0.015, YA, z], [0, 0, -Math.PI / 2]), [0.28, 0, 0]);
    }
    // 14 — adaptateurs ORB -08 sur la face +Z du bloc d'orifices ; 9 — coudes 45° tournants.
    for (const x of [x0 + 0.037, x0 + 0.063]) {
      const pos = [x, YA, -0.06 + 0.07];
      const a = orbAdapter(api, 8, 8);
      P('14', orient(api, a.obj, pos, [0, 0, 1]), [0.2, 0, 0.05]);
      const tip = [x, YA, pos[2] + a.tip];
      const n = S.group(
        S.nut((0.875 + 0.0625) * IN, 0.014, 'zinc', { pos: [0, 0.007 - 0.008, 0] }),
        S.cyl(0.009, 0.014, 'zinc', { seg: 16, pos: [0, 0.012, 0] }),
        S.rod([0, 0.016, 0], [0, 0.016 + 0.02 * Math.cos(Math.PI / 4), 0.02 * Math.sin(Math.PI / 4)], 0.009, 'zinc', 16),
        S.at(S.lathe([[0, 0], [0.009, 0], ...S.thread(0.0095, 0.003, 0.016, { pitch: 0.0016, maxTurns: 5, chamferBottom: false }), [0.006, 0.02], [0, 0.02]], 'zinc', { seg: 16 }), [0, 0.016 + 0.02 * Math.cos(Math.PI / 4), 0.02 * Math.sin(Math.PI / 4)], [Math.PI / 4, 0, 0]),
      );
      P('9', orient(api, S.merged([n], 'zinc'), tip, [0, 0, 1], [0, 1, 0]), [0.2, 0.03, 0.1]);
    }
  }
  // 20, 24 — vis H 3/8 × 1 1/4 po et rondelles frein de la semelle de la bride.
  for (const [dx, dz] of [[-0.035, -0.07], [0.035, -0.07], [-0.035, 0.07], [0.035, 0.07]]) {
    const pos = [XB + 0.04 + dx, 0.012, -0.06 + dz];
    P('24', S.at(S.washer(0.34 * IN, 0.2 * IN, 0.09 * IN, 'zinc'), [pos[0], pos[1] + 0.0012, pos[2]]), [0.12, 0.04, 0]);
    P('20', S.bolt(0.375 * IN, 1.25 * IN, 'zinc', { pos: [pos[0], pos[1] + 0.0024, pos[2]] }), [0.12, 0.08, 0]);
  }

  // ---------------------------------------------------------------- 2 — capot d'accouplement
  {
    const X0 = 0.095, X1 = 0.195, H = 0.14, Zl = 0.065, t = 0.003;
    const len = X1 - X0;
    const sheet = [
      S.box(len, t, 2 * Zl + t, 'safety', { pos: [(X0 + X1) / 2, H, -0.06] }),
      ...[-1, 1].map((s) => S.box(len, H, t, 'safety', { pos: [(X0 + X1) / 2, H / 2, -0.06 + s * Zl] })),
      ...[-1, 1].map((s) => S.box(len, t, 0.03, 'safety', { pos: [(X0 + X1) / 2, t / 2, -0.06 + s * (Zl + 0.015)] })),
    ];
    // Trappe de visite ronde vissée sur le dessus.
    const cover = S.cyl(0.028, 0.002, 'safety', { seg: 28, pos: [(X0 + X1) / 2, H + 0.0025, -0.06] });
    const scr = [S.at(S.nut(0.008, 0.003, 'zinc'), [(X0 + X1) / 2 - 0.022, H + 0.005, -0.06]), S.at(S.nut(0.008, 0.003, 'zinc'), [(X0 + X1) / 2 + 0.022, H + 0.005, -0.06])];
    P('2', S.group(S.merged([...sheet, cover], 'safety'), S.merged(scr, 'zinc')), [0, 0.12, 0]);
    // 19, 23 — vis H 1/4 × 3/4 po et rondelles dans les pattes.
    for (const s of [-1, 1]) for (const x of [X0 + 0.02, X1 - 0.02]) {
      const pos = [x, t, -0.06 + s * (Zl + 0.017)];
      P('23', S.at(S.washer(0.3 * IN, 0.14 * IN, 0.065 * IN, 'zinc'), [pos[0], pos[1] + 0.0008, pos[2]]), [0, 0.16, s * 0.03]);
      P('19', S.bolt(0.25 * IN, 0.75 * IN, 'zinc', { pos: [pos[0], pos[1] + 0.0017, pos[2]] }), [0, 0.2, s * 0.03]);
    }
  }
  void THREE;
  return { view: { dir: [0.8, 0.8, 1.1] } };
}
