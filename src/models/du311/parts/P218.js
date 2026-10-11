// P218 — Ensemble injecteurs de graisse : CX029833 rév. 2 « INJECTOR ASSY,
// DU311-TVK » (page 218), repère 12 de P186. Support mécano-soudé (4) : deux
// manchons taraudés 1/2 NPT verticaux reliés par un plat à une platine
// verticale fixée au porteur par deux vis H 3/8-16 × 2 3/4 po (11), rondelles
// fendues (12) et écrous (13) (traversent la platine et un tube support de
// 1 1/2 po de P186). Deux colonnes : injecteur de graisse (2) vissé sur le manchon
// par un mamelon six-pans 1/2 NPT (8), dessous un mamelon de réduction 1/2 →
// 1/4 NPT (9) et un clapet anti-retour en ligne (3). Colonne de l'injecteur de
// la V30 (à gauche) : mamelon 1/4 NPT (7), vanne à bille 1/4 po (1), adaptateur
// NPT → JIC -06 (6). Colonne de l'injecteur standard : clapet et purgeur
// « plug vent » fournis avec la pompe (dessinés avec le té, non comptés), té
// de passage 1/4 NPT (10) avec coude (5) sur la branche, adaptateur (6) en
// bout. Sur chaque injecteur : coude MNPT -04 → JIC -06 (5) à l'orifice
// d'entrée et raccord droit de l'orifice de pilotage (fourni avec l'injecteur).
// Repère : origine au centre de la face extérieure (d'appui) de la platine ;
// Y vers le haut ; -X vers les colonnes (plat du support selon X) ; +Z vers
// les orifices latéraux des injecteurs. Encombrement ≈ 0.20 (X) × 0.42 (Y)
// × 0.07 (Z) m. Cotes des corps estimées d'après les proportions des vues.
import { IN, NPT, nptFitting, orient } from './_chassis.js';

export default function P218(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const T = 0.375 * IN;
  const XB = -0.045, XA = XB - 0.068; // colonnes : injecteur standard (B) et V30 (A)
  const SL = 2 * IN; // manchons, centrés sur y = 0

  // ---------------------------------------------------------------- 4 — support
  {
    const parts = [];
    for (const x of [XA, XB]) parts.push(S.shell(0.625 * IN, (NPT[8] * IN) / 2 * 0.92, SL, 'grey', { pos: [x, 0, 0], seg: 28 }));
    parts.push(S.box(-T - XA - 0.012, 1 * IN, 0.25 * IN, 'grey', { r: 0.001, pos: [(XA + 0.012 - T) / 2, 0, 0] }));
    const pl = S.extrude([[-0.019, -0.06], [0.019, -0.06], [0.019, 0.06], [-0.019, 0.06]], T, 'grey', {
      holes: [[0, 0.035, (0.41 * IN) / 2], [0, -0.035, (0.41 * IN) / 2]],
    });
    pl.rotation.y = Math.PI / 2;
    pl.position.x = -T / 2;
    parts.push(pl);
    const wb = S.merged([
      ...[XA, XB].map((x) => S.weldRing(0.625 * IN + 0.002, 0.004, 'grey', { pos: [x, 0, 0] })),
    ], 'grey');
    wb.geometry.userData.edgeAngle = 75;
    P('4', S.group(S.merged(parts, 'grey'), wb), [0.06, 0, 0]);
  }

  // ---------------------------------------------------------------- 11, 12, 13 — fixation
  for (const y of [0.035, -0.035]) {
    const head = 1.5 * IN + 0.004; // au-delà du tube support de 1 1/2 po
    P('11', orient(api, S.bolt(0.375 * IN, 2.75 * IN, 'zinc'), [head, y, 0], [1, 0, 0]), [0.12, 0, 0]);
    P('12', S.washer(0.34 * IN, 0.2 * IN, 0.094 * IN, 'zinc', { axis: 'x', pos: [-T - 0.0012, y, 0] }), [0.0, 0, 0]);
    P('13', S.nut(0.5625 * IN, 0.328 * IN, 'zinc', { axis: 'x', pos: [-T - 0.0024 - 0.00417, y, 0] }), [-0.03, 0, 0]);
  }

  // ---------------------------------------------------------------- pièces NPT
  // Mamelon six-pans : filet mâle conique na (bas, vers -Y) et nb (haut), six-pans af × hh centré en y = 0.
  const hexNipple = (na, nb, af, hh) => {
    const ra = (NPT[na] * IN) / 2, rb = (NPT[nb] * IN) / 2;
    const la = ra * 1.6, lb = rb * 1.6;
    const bot = S.thread(ra * 0.94, -hh / 2 - la, -hh / 2, { r1: ra, pitch: ra * 0.2, maxTurns: 6 });
    const top = S.thread(rb * 0.94, hh / 2, hh / 2 + lb, { r1: rb, pitch: rb * 0.2, maxTurns: 6 }).map(([r, y]) => [r, hh + lb - y]).reverse();
    const bore = Math.min(ra, rb) * 0.62;
    return S.group(S.merged([
      S.lathe([[bore, -hh / 2 - la], ...bot, [ra, -hh / 2], [bore, -hh / 2], [bore, -hh / 2 - la]], 'zinc', { seg: 18 }),
      S.lathe([[bore, hh / 2], [rb, hh / 2], ...top, [bore, hh / 2 + lb], [bore, hh / 2]], 'zinc', { seg: 18 }),
      S.nut(af, hh, 'zinc'),
    ], 'zinc'));
  };
  // Clapet en ligne : barre six-pans 7/8 po × 2 1/2 po, embouts six-pans tournés, taraudé 1/4 NPT.
  const checkValve = () => {
    const L = 2.5 * IN, af = 0.875 * IN;
    return S.merged([
      S.nut(af, L * 0.62, 'steel'),
      S.nut(af * 1.02, L * 0.16, 'steel', { pos: [0, -L * 0.42, 0] }),
      S.cyl(af * 0.42, L * 0.06, 'steel', { seg: 20, pos: [0, L * 0.34, 0] }),
      S.nut(af * 0.9, L * 0.12, 'steel', { pos: [0, L * 0.43, 0] }),
    ], 'steel');
  };
  const CK = 2.5 * IN;

  // ---------------------------------------------------------------- colonnes
  const injector = () => {
    // Injecteur : six-pans de pied 2 1/4 po, corps Ø 1 3/4 po, collerette six-pans, tige de réglage.
    const af = 2.25 * IN;
    const parts = [
      S.nut(af, 1.0 * IN, 'steel', { pos: [0, 0.5 * IN, 0] }),
      S.cyl(0.875 * IN, 5.2 * IN, 'steel', { seg: 36, pos: [0, 1.0 * IN + 2.6 * IN, 0] }),
      S.nut(af, 0.35 * IN, 'steel', { pos: [0, 6.2 * IN + 0.175 * IN, 0] }),
      S.cyl(0.55 * IN, 0.2 * IN, 'steel', { seg: 24, pos: [0, 6.65 * IN, 0] }),
      S.cyl(0.28 * IN, 1.2 * IN, 'zinc', { seg: 16, pos: [0, 7.3 * IN, 0] }),
      S.nut(0.75 * IN, 0.22 * IN, 'zinc', { pos: [0, 6.9 * IN, 0] }),
      S.nut(0.75 * IN, 0.4 * IN, 'zinc', { pos: [0, 8.0 * IN, 0] }),
    ];
    // Orifice de pilotage (raccord droit fourni) sur la face +Z, en haut du corps.
    const pf = nptFitting(api, { npt: 2, jic: 4 });
    parts.push(orient(api, pf.obj, [0, 4.9 * IN, 0.875 * IN], [0, 0, 1]));
    return S.merged(parts, 'steel');
  };
  const yNip = SL / 2 + 0.006; // six-pans des mamelons 8 au-dessus des manchons
  const yInj = yNip + 0.006;
  const yLow = -SL / 2 - 0.006; // six-pans des mamelons 9
  for (const [x, std] of [[XA, false], [XB, true]]) {
    P('2', S.at(injector(), [x, yInj, 0]), [0, 0.2, 0]);
    // Coude d'entrée (5) sur la face +Z, sortie vers le bas.
    const e5 = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
    P('5', orient(api, e5.obj, [x, yInj + 4.0 * IN, 0.875 * IN], [0, 0, 1], [0, -1, 0]), [0, 0.2, 0.06]);
    P('8', S.at(hexNipple(8, 8, 0.875 * IN, 0.3 * IN), [x, yNip, 0]), [0, 0.1, 0]);
    P('9', S.at(hexNipple(4, 8, 0.875 * IN, 0.3 * IN), [x, yLow, 0]), [0, -0.06, 0]);
    const yCk = yLow - 0.004 - CK / 2 - 0.004;
    if (!std) {
      P('3', S.at(checkValve(), [x, yCk, 0]), [0, -0.12, 0]);
      const y7 = yCk - CK / 2 - 0.006;
      P('7', S.at(hexNipple(4, 4, 0.5625 * IN, 0.25 * IN), [x, y7, 0]), [0, -0.17, 0]);
      // 1 — vanne à bille 1/4 po, passage vertical, levier vers +Z et le bas.
      const yBv = y7 - 0.008 - 0.034;
      const bv = S.ballValve(0.028, 'zinc', { axis: 'y', handle: 'red' });
      P('1', S.at(S.group(S.at(bv, [0, 0, 0], [0, -Math.PI / 2, 0])), [x, yBv, 0], [Math.PI, 0, 0]), [0, -0.23, 0]);
      const a6 = nptFitting(api, { npt: 4, jic: 6 });
      P('6', orient(api, a6.obj, [x, yBv - 0.03, 0], [0, -1, 0]), [0, -0.3, 0]);
    } else {
      // Clapet et purgeur fournis avec la pompe (dessinés avec le té 10).
      const yT = yCk - CK / 2 - 0.006 - 0.016;
      const s = 0.62 * IN;
      const tee = S.group(
        S.merged([
          S.box(s, s * 1.4, s, 'zinc', { r: 0.0015, pos: [0, 0, 0] }),
          S.cyl(s * 0.42, 0.012, 'zinc', { seg: 18, pos: [0, s * 0.7 + 0.006, 0] }),
          S.cyl(s * 0.5, 0.006, 'zinc', { axis: 'z', seg: 18, pos: [0, 0, s / 2 + 0.003] }),
        ], 'zinc'),
        S.at(checkValve(), [0, yCk - yT, 0]),
        // Purgeur : corps six-pans, bouton de purge latéral, queue mâle en haut.
        S.merged([
          S.nut(0.75 * IN, 0.9 * IN, 'steel', { pos: [0, -s * 0.7 - 0.016, 0] }),
          S.cyl(0.18 * IN, 0.35 * IN, 'steel', { axis: 'z', seg: 14, pos: [0, -s * 0.7 - 0.016, -0.014] }),
          S.cyl(0.3 * IN, 0.12 * IN, 'steel', { axis: 'z', seg: 18, pos: [0, -s * 0.7 - 0.016, -0.0195] }),
        ], 'steel'),
      );
      P('10', S.at(tee, [x, yT, 0]), [0, -0.16, 0]);
      const e5b = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
      P('5', orient(api, e5b.obj, [x, yT, s / 2 + 0.006], [0, 0, 1], [1, 0, 0]), [0, -0.16, 0.06]);
      const a6 = nptFitting(api, { npt: 4, jic: 6 });
      P('6', orient(api, a6.obj, [x, yT - s * 0.7 - 0.016 - 0.0115, 0], [0, -1, 0]), [0, -0.26, 0]);
    }
  }

  return { view: { dir: [0.55, 0.45, 1.1] } };
}
