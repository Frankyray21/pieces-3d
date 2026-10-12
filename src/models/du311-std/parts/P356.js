// P356 — Injection de graisse CX034753 rév. 1 « ASSY, GREASE INJECTION,
// DU311 » (page 356, support du porteur en fantôme), repère 15 de P208.
// Réservoir de graisse 32 L (1 = P358, repris du TVK P370) posé par ses deux
// pattes sur la console du porteur (P208 repère 2) : quatre vis H 1/2-13 ×
// 1 1/4 po à filetage total (21), écrous (25) et rondelles Grower dessus et
// dessous (24). Pompe d'injection pneumatique (2, CP17054-4) accrochée sous le
// fond : moteur à air (fût Ø 4 po entre deux flasques carrés, quatre tirants),
// corps en fonte à bride d'aspiration contre le fond, tirant central serré par
// l'écrou de pompe sur le dessus, tube de pompage et clapet de refoulement ;
// clapet anti-retour CP18039 et purgeur fournis avec la pompe (dessinés avec
// elle, sous l'injecteur). Commande d'air : équerre de montage modulaire (7)
// vissée sur le montant de la console par deux vis H 1/4-20 × 3/4 po (20),
// rondelles plates (22) et Grower (23) ; détendeur haute pression 0-400 psi à
// volant en T (4) et son manomètre (3) sur coude mâle-femelle 1/4 (14) et
// réduction 1/4 × 1/8 (18), bouchon carré 1/8 (19) à l'arrière ; mamelon
// 3/8 × 1/4 (15) vers le filtre à air (5, cartouche CP18037-004) et le
// lubrificateur (6), coude 3/8 NPT → JIC -06 (12) à la sortie. Électrovanne
// 4 voies (9 = P360) contre le montant : adaptateurs droits 1/4 NPT → JIC -06
// (13) sur A et B, té tournant JIC -06 (10) sur A, coudes 1/4 NPT → JIC -06
// (11) sur P et E. Injecteur de graisse (8) vertical : coude (11) à l'entrée
// latérale, mamelon 1/2 (16), clapet (fourni avec la pompe), mamelon 1/2 ×
// 1/4 (17) et adaptateur (13) en bout. Coudes (11) de la pompe : entrée d'air,
// refoulement, purge.
// Repère machine (P208 le place à l'identité) : réservoir en console à gauche
// du châssis avant, derrière la roue, dessous de son fond en GR.tank =
// (0.60, 0.62, −0.82) (repère de P370 posé sans rotation : couvercle vers
// l'arrière, pompe vers l'axe) ; filtre-détendeur-lubrificateur en ligne
// selon X devant le réservoir (têtes à y = 0.90, z = −0.61), électrovanne et
// injecteur plus en avant contre le montant de la console (z = −0.565).
// Tout l'ensemble est sur le châssis avant (corps « front »).
import { body } from '../layout.js';
import { nptFitting, orient } from '../../du311/parts/_chassis.js';
import { hhcs, hexNut, splitWasher, flatWasher, along } from '../../du311/parts/_avance_b.js';
import { racFactory } from '../../du311/parts/_porteur.js';
import { PUMP } from '../../du311/parts/P370.js';
import { IN, GR, pose, posePoint, hexNipple, hexBushing, squarePlug, dialGauge, pipeElbow } from './_fronta.js';
import { SOL4 } from './P360.js';

const [TX, TY, TZ] = GR.tank;
const U = 0.055; // têtes des unités modulaires
const FY = GR.frl.y, FZ = GR.frl.z;
const XL = 0.86, XF = 0.93; // lubrificateur, filtre
const XR = XF + U / 2 + 0.008 + 0.025; // détendeur (corps 50 mm)

export default function P356(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  void IN;
  const P = (ref, obj, e) => api.part(ref, body('front', obj), e);
  const T = (p) => [TX + p[0], TY + p[1], TZ + p[2]]; // repère du réservoir → machine
  const put = (ref, f, pos, dir, side, e) => P(ref, orient(api, f.obj, pos, dir, side), e);

  // ---------------------------------------------------------------- 1 — réservoir (P358 = P370 du TVK)
  P('1', at(api.sub('P358'), [TX, TY, TZ]), [0, 0.25, 0]);

  // ---------------------------------------------------------------- 21, 24, 25 — fixation des pattes
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const [x, , z] = T([sx * 0.2275, 0, sz * 0.065]);
    const yf = TY + 0.25 * IN, yc = TY - 0.25 * IN; // dessus de la patte, dessous de la console
    const tg = 0.125 * IN;
    P('24', at(splitWasher(S, THREE, 0.5), [x, yf, z]), [0, 0.12, 0]);
    P('21', at(hhcs(S, THREE, 0.5, 1.25), [x, yf + tg, z]), [0, 0.18, 0]);
    P('24', along(THREE, splitWasher(S, THREE, 0.5), [0, -1, 0], [x, yc, z]), [0, -0.1, 0]);
    P('25', along(THREE, hexNut(S, THREE, 0.5), [0, -1, 0], [x, yc - tg, z]), [0, -0.15, 0]);
  }

  // ---------------------------------------------------------------- 2 — pompe d'injection (repère du réservoir)
  const YA = -0.069, x0 = PUMP.x, z0 = PUMP.z, RC = 2 * IN;
  const xF1 = x0 - 0.045, xF0 = x0 - 0.185;
  let pumpG;
  {
    const cast = [
      box(0.018, 0.115, 0.115, 'blackCast', { r: 0.008, pos: [xF1 - 0.009, YA, z0] }),
      box(0.018, 0.115, 0.115, 'blackCast', { r: 0.008, pos: [xF0 + 0.009, YA, z0] }),
      box(0.09, 0.075, 0.085, 'blackCast', { r: 0.008, pos: [x0, YA - 0.005, z0] }),
      lathe([[PUMP.r - 0.004, YA + 0.02], [PUMP.r + 0.016, YA + 0.03], [PUMP.r + 0.016, -0.009], [PUMP.r - 0.004, -0.009]], 'blackCast', { seg: 28, pos: [x0, 0, z0] }),
      at(cyl(0.022, 0.03, 'blackCast', { axis: 'x', seg: 18 }), [x0 + 0.06, YA, z0]),
      // Bossages : purge sous le corps, entrée d'air sur le flasque arrière, silencieux d'échappement.
      at(cyl(0.012, 0.01, 'blackCast', { seg: 16 }), [x0 - 0.02, YA - 0.0475, z0 + 0.02]),
      at(cyl(0.012, 0.008, 'blackCast', { axis: 'x', seg: 16 }), [xF0 - 0.004, YA + 0.02, z0]),
    ];
    const barrel = at(cyl(RC, xF1 - xF0 - 0.036, 'grey', { axis: 'x', seg: 32 }), [(xF0 + xF1) / 2, YA, z0]);
    const zinc = [];
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      zinc.push(S.rod([xF0 - 0.006, YA + sy * 0.047, z0 + sz * 0.047], [xF1 + 0.004, YA + sy * 0.047, z0 + sz * 0.047], 0.0032, 'zinc', 8));
      for (const xn of [xF0 - 0.003, xF1 + 0.002]) zinc.push(S.nut(0.011, 0.006, 'zinc', { axis: 'x', pos: [xn, YA + sy * 0.047, z0 + sz * 0.047] }));
    }
    zinc.push(at(cyl(0.012, 0.055, 'chrome', { axis: 'x', seg: 16 }), [x0 + 0.1, YA, z0]));
    zinc.push(S.nut(0.032, 0.03, 'zinc', { axis: 'x', pos: [x0 + 0.142, YA, z0] }));
    zinc.push(at(cyl(0.009, 0.012, 'zinc', { axis: 'x', seg: 12 }), [x0 + 0.163, YA, z0]));
    // Tirant central à travers le réservoir et écrou de pompe sur le dessus.
    zinc.push(at(cyl(0.008, 0.32, 'zinc', { seg: 12 }), [x0, 0.15, z0]));
    zinc.push(S.nut(0.024, 0.012, 'zinc', { pos: [x0, 0.314, z0] }));
    // Silencieux d'échappement (bronze fritté) sous le flasque arrière.
    const muf = lathe([[0, 0], [0.006, 0], [0.006, 0.006], [0.007, 0.008], [0.007, 0.022], [0.005, 0.025], [0, 0.025]], 'brass', { seg: 14, axis: '-y', pos: [xF0 + 0.009, YA - 0.0575, z0 - 0.03] });
    // Clapet anti-retour CP18039 fourni avec la pompe (sous l'injecteur, repère machine).
    pumpG = group(merged(cast, 'blackCast'), barrel, merged(zinc, 'zinc'), muf);
    pumpG.position.set(TX, TY, TZ);
    P('2', pumpG, [0, -0.15, 0]);
  }
  // 11 — coudes de la pompe : entrée d'air (flasque arrière), refoulement (bout du clapet), purge (dessous).
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), T([xF0 - 0.008, YA + 0.02, z0]), [-1, 0, 0], [0, 1, 0], [-0.08, -0.12, 0]);
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), T([x0 + 0.169, YA, z0]), [1, 0, 0], [0, 1, 0], [0.08, -0.12, 0]);
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), T([x0 - 0.02, YA - 0.0525, z0 + 0.02]), [0, -1, 0], [0, 0, 1], [0, -0.2, 0]);

  // ---------------------------------------------------------------- 5, 6 — filtre à air et lubrificateur modulaires
  const unit = (lub) => {
    const alu = [
      box(U, U, U, 'castAlu', { r: 0.004 }),
      // Bossages d'orifices 3/8 NPT (±X).
      ...[-1, 1].map((s) => lathe([[0.0082, 0], [0.0135, 0], [0.0135, 0.002], [0.0082, 0.002]], 'castAlu', { axis: s > 0 ? 'x' : '-x', seg: 20, pos: [s * (U / 2 - 0.0005), 0, 0] })),
      // Bague de cuve à baïonnette et protecteur ajouré.
      lathe([[0, -U / 2 + 0.001], [0.027, -U / 2 + 0.001], [0.027, -U / 2 - 0.008], [0.025, -U / 2 - 0.012], [0, -U / 2 - 0.012]], 'castAlu', { seg: 28 }),
      S.slotted(0.0245, 0.023, -0.145, -U / 2 - 0.012, [{ a: Math.PI, w: 0.9, y0: -0.125, y1: -0.05 }], 'castAlu', { seg: 28 }),
      lathe([[0, -0.15], [0.016, -0.15], [0.022, -0.143], [0.0245, -0.135]], 'castAlu', { seg: 24 }),
    ];
    const g = group(merged(alu, 'castAlu'),
      // Cuve transparente vue par la fenêtre du protecteur.
      lathe([[0, -0.142], [0.018, -0.14], [0.0225, -0.12], [0.0225, -0.045], [0, -0.045]], 'glass', { seg: 24 }),
      // Purge manuelle / bouchon sous la cuve.
      lathe([[0, -0.162], [0.006, -0.162], [0.006, -0.15], [0, -0.15]], 'black', { seg: 10 }));
    if (lub) {
      // Dôme de visée, vis de réglage du débit d'huile, bouchon de remplissage.
      g.add(lathe([[0, U / 2], [0.012, U / 2], [0.012, U / 2 + 0.006], [0.009, U / 2 + 0.014], [0, U / 2 + 0.016]], 'glass', { seg: 20 }));
      g.add(lathe([[0, U / 2 + 0.014], [0.0045, U / 2 + 0.014], [0.0045, U / 2 + 0.026], [0, U / 2 + 0.026]], 'black', { seg: 12 }));
      g.add(lathe([[0, 0], [0.006, 0], [0.006, 0.006], [0, 0.006]], 'black', { seg: 6, pos: [0.016, U / 2, 0.016] }));
    } else {
      // Cartouche visible (élément filtrant CP18037-004) dans la cuve.
      g.add(lathe([[0, -0.115], [0.012, -0.115], [0.012, -0.06], [0, -0.06]], 'white', { seg: 16 }));
    }
    g.add(S.at(S.nameplate(0.03, 0.02), [0, 0.005, -U / 2 - 0.0005], [0, Math.PI, 0]));
    return g;
  };
  P('5', at(unit(false), [XF, FY, FZ]), [0, 0, -0.12]);
  P('6', at(unit(true), [XL, FY, FZ]), [-0.05, 0, -0.12]);

  // ---------------------------------------------------------------- 7 — équerre de montage modulaire ; 20, 22, 23 — fixation
  const XJ = (XF - U / 2 + XL + U / 2) / 2; // plan du raccord modulaire
  const zw = GR.wall, t7 = 0.125 * IN;
  {
    const parts = [
      // Collier du raccord modulaire (entre les deux têtes) et ses deux vis.
      box(XF - XL - U, U * 0.86, U * 0.86, 'zinc', { r: 0.003, pos: [XJ, FY, FZ] }),
      // Aile vers le montant, pli et aile d'appui percée de deux trous.
      box(XF - XL - U, 0.045, zw - (FZ + U * 0.43) - t7, 'zinc', { pos: [XJ, FY, (FZ + U * 0.43 + zw - t7) / 2] }),
    ];
    const leg = S.extrude([[-0.04, -0.0225], [0.04, -0.0225], [0.04, 0.0225], [-0.04, 0.0225]], t7, 'zinc', { holes: [[-0.026, 0, 0.0036], [0.026, 0, 0.0036]] });
    leg.position.set(XJ, FY, zw - t7 / 2);
    parts.push(leg);
    const scr = [-1, 1].map((s) => S.cyl(0.0035, 0.006, 'steel', { axis: 'y', seg: 10, pos: [XJ, FY + s * U * 0.43, FZ] }));
    P('7', group(merged(parts, 'zinc'), merged(scr, 'steel')), [0, 0, 0.06]);
    for (const dx of [-0.026, 0.026]) {
      const p0 = [XJ + dx, FY, zw - t7];
      P('22', along(THREE, flatWasher(S, THREE, 0.25), [0, 0, -1], p0), [0, 0, -0.06]);
      P('23', along(THREE, splitWasher(S, THREE, 0.25), [0, 0, -1], [p0[0], p0[1], p0[2] - 0.065 * IN]), [0, 0, -0.08]);
      P('20', along(THREE, hhcs(S, THREE, 0.25, 0.75), [0, 0, -1], [p0[0], p0[1], p0[2] - 0.065 * IN - 0.0625 * IN]), [0, 0, -0.11]);
    }
  }
  // 12 — coude 3/8 NPT → JIC -06 à la sortie du lubrificateur (vers le haut).
  put('12', nptFitting(api, { npt: 6, jic: 6, angle: 90 }), [XL - U / 2 - 0.0005, FY, FZ], [-1, 0, 0], [0, 1, 0], [-0.1, 0.04, 0]);
  // 15 — mamelon 3/8 × 1/4 du filtre au détendeur.
  {
    const n = hexNipple(S, 6, 4);
    P('15', pose(THREE, n.obj, [XF + U / 2 + 0.0005, FY, FZ], [1, 0, 0]), [0.06, 0, -0.06]);
  }

  // ---------------------------------------------------------------- 4 — détendeur haute pression à volant en T
  const rB = 0.025; // demi-largeur du corps (X)
  {
    const alu = [
      box(0.05, 0.035, 0.05, 'castAlu', { r: 0.004 }),
      ...[-1, 1].map((s) => lathe([[0.0065, 0], [0.011, 0], [0.011, 0.002], [0.0065, 0.002]], 'castAlu', { axis: s > 0 ? 'x' : '-x', seg: 18, pos: [s * rB, 0, 0] })),
      ...[-1, 1].map((s) => lathe([[0.0045, 0], [0.008, 0], [0.008, 0.002], [0.0045, 0.002]], 'castAlu', { axis: s > 0 ? 'z' : '-z', seg: 16, pos: [0, -0.008, s * 0.025] })),
      // Carter de membrane boulonné et chapeau de ressort.
      lathe([[0, 0.0175], [0.04, 0.0175], [0.044, 0.022], [0.044, 0.03], [0.04, 0.034], [0.028, 0.036], [0.028, 0.042], [0.018, 0.09], [0.013, 0.093], [0, 0.093]], 'castAlu', { seg: 28 }),
    ];
    const zn = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; zn.push(S.at(S.nut(0.008, 0.004, 'zinc'), [Math.cos(a) * 0.037, 0.036, Math.sin(a) * 0.037])); }
    zn.push(lathe([[0, 0.093], [0.0045, 0.093], ...S.thread(0.0045, 0.093, 0.118, { pitch: 0.0014, chamferBottom: false }), [0, 0.118]], 'steel', { seg: 12 }));
    zn.push(S.nut(0.013, 0.006, 'steel', { pos: [0, 0.097, 0] }));
    const handle = group(
      lathe([[0, 0.112], [0.007, 0.112], [0.007, 0.13], [0, 0.13]], 'steel', { seg: 12 }),
      S.at(lathe([[0, -0.035], [0.0042, -0.035], [0.0042, 0.035], [0, 0.035]], 'steel', { seg: 10 }), [0, 0.124, 0], [0, 0, Math.PI / 2]),
      ...[-1, 1].map((s) => S.at(lathe([[0, 0], [0.0062, 0], [0.0062, 0.013], [0.004, 0.016], [0, 0.016]], 'black', { seg: 14 }), [s * 0.035, 0.124, 0], [0, 0, -s * Math.PI / 2])),
    );
    P('4', at(group(merged(alu, 'castAlu'), merged(zn, 'steel'), handle), [XR, FY, FZ]), [0.04, 0.1, -0.1]);
  }
  // 11 — coude à l'entrée du détendeur (+X), sortie vers le haut.
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), [XR + rB + 0.002, FY, FZ], [1, 0, 0], [0, 1, 0], [0.1, 0.06, 0]);
  // 19 — bouchon carré 1/8 sur la prise arrière (+Z).
  P('19', pose(THREE, squarePlug(S, 2), [XR, FY - 0.008, FZ + 0.027], [0, 0, 1]), [0, 0, 0.06]);
  // 14 — coude mâle-femelle 1/4 sur la prise avant (−Z), bras vers +X ; 18 — réduction 1/4 × 1/8 ;
  // 3 — manomètre couché (raccord vers −X), cadran vers l'extérieur (−Z).
  {
    const e = pipeElbow(S, 4, { inEnd: 'male', outEnd: 'female' });
    const pos = [XR, FY - 0.008, FZ - 0.027];
    P('14', pose(THREE, e.obj, pos, [0, 0, -1], [1, 0, 0]), [0, 0, -0.08]);
    const out = posePoint(THREE, e.out, pos, [0, 0, -1], [1, 0, 0]);
    const b18 = hexBushing(S, 4, 2);
    P('18', pose(THREE, b18.obj, out, [1, 0, 0]), [0.04, 0, -0.1]);
    const gz = dialGauge(S, THREE, 0.032, { stem: 0.006, npt: 2 });
    gz.rotation.y = Math.PI;
    const gg = group(gz);
    gg.rotation.z = -Math.PI / 2;
    P('3', at(gg, [out[0] + b18.top[1], out[1], out[2]]), [0.08, 0, -0.12]);
  }

  // ---------------------------------------------------------------- 9 — électrovanne 4 voies (P360) contre le montant
  const XV = 1.16, YV = 1.0, ZV = zw - 0.017;
  {
    const v = api.sub('P360');
    v.rotation.y = Math.PI; // orifices A / B vers +X, bobine vers −X, faisceau vers l'extérieur (−Z)
    P('9', at(group(v), [XV, YV, ZV]), [0.05, 0.05, -0.08]);
  }
  const vp = (k) => { const { pos, dir } = SOL4[k]; return { pos: [XV - pos[0], YV + pos[1], ZV - pos[2]], dir: [-dir[0], dir[1], -dir[2]] }; };
  // 13 — adaptateurs droits sur A et B ; 10 — té tournant sur A ; 11 — coudes sur P et E.
  const A = vp('A'), B = vp('B');
  const fA = nptFitting(api, { npt: 4, jic: 6 });
  put('13', fA, A.pos, A.dir, null, [0.08, 0.05, 0]);
  put('13', nptFitting(api, { npt: 4, jic: 6 }), B.pos, B.dir, null, [0.08, 0.03, 0]);
  {
    const tip = posePoint(THREE, fA.out, A.pos, A.dir);
    const F = racFactory(S);
    const tee = F.swivel({ kind: 'tee', fd: 6 });
    P('10', pose(THREE, tee, tip, A.dir, [0, 1, 0]), [0.14, 0.06, 0]);
  }
  const Pp = vp('P'), Ep = vp('E');
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), Pp.pos, Pp.dir, [1, 0, 0], [0, -0.08, 0]);
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), Ep.pos, Ep.dir, [1, 0, 0], [0, 0.08, 0]);

  // ---------------------------------------------------------------- 8 — injecteur de graisse et sa colonne
  const XI = 1.25, ZI = GR.frl.z, YI = 0.98; // centre du corps
  {
    const st = [
      lathe([[0, -0.065], [0.016, -0.065], [0.018, -0.06], [0.018, 0.055], [0.016, 0.06], [0, 0.06]], 'steel', { seg: 28 }),
      S.at(S.nut(0.0381, 0.016, 'steel'), [0, -0.057, 0]),
      S.at(S.nut(0.0381, 0.014, 'steel'), [0, 0.053, 0]),
      // Vis de réglage de la dose, contre-écrou, six-pans de tête.
      lathe([[0, 0.06], [0.0055, 0.06], ...S.thread(0.0055, 0.062, 0.088, { pitch: 0.0016, chamferBottom: false }), [0, 0.088]], 'steel', { seg: 14 }),
      S.at(S.nut(0.017, 0.007, 'steel'), [0, 0.068, 0]),
      S.at(S.nut(0.011, 0.008, 'steel'), [0, 0.092, 0]),
      // Bossages latéraux : entrée de graisse (+X) et pilote d'air (−X), raccord droit fourni.
      ...[-1, 1].map((s) => S.cyl(0.011, 0.012, 'steel', { axis: 'x', seg: 18, pos: [s * 0.022, 0.03, 0] })),
      S.lathe([[0, 0], [0.006, 0], [0.006, 0.008], [0.004, 0.012], [0.004, 0.02], [0, 0.02]], 'zinc', { axis: '-x', seg: 12, pos: [-0.028, 0.03, 0] }),
    ];
    P('8', at(merged(st, 'steel'), [XI, YI, ZI]), [0.06, 0.1, 0]);
  }
  put('11', nptFitting(api, { npt: 4, jic: 6, angle: 90 }), [XI + 0.028, YI + 0.03, ZI], [1, 0, 0], [0, 1, 0], [0.1, 0.12, 0]);
  {
    // 16 — mamelon 1/2 sous l'injecteur ; clapet de la pompe (cf. 2) ; 17 — mamelon 1/2 × 1/4 ; 13 — adaptateur.
    const yB = YI - 0.065;
    const n16 = hexNipple(S, 8, 8);
    P('16', pose(THREE, n16.obj, [XI, yB, ZI], [0, -1, 0]), [0, -0.06, 0]);
    const yc = yB - n16.top[1]; // bout bas du mamelon
    // Clapet anti-retour CP18039 (fourni avec la pompe 2) : barre six-pans 7/8 × 2 1/2 po.
    const L = 2.5 * IN, af = 0.875 * IN;
    const ck = merged([
      S.nut(af, L * 0.62, 'steel', { pos: [0, -L * 0.5, 0] }),
      S.nut(af * 1.02, L * 0.16, 'steel', { pos: [0, -L * 0.92, 0] }),
      S.cyl(af * 0.42, L * 0.06, 'steel', { seg: 18, pos: [0, -L * 0.16, 0] }),
      S.nut(af * 0.9, L * 0.12, 'steel', { pos: [0, -L * 0.06, 0] }),
      // Purgeur (« plug vent ») sur le flanc.
      S.cyl(0.004, 0.012, 'brass', { axis: 'x', seg: 10, pos: [af * 0.5 + 0.004, -L * 0.5, 0] }),
    ], 'steel');
    pumpG.add(at(ck, [XI - TX, yc + 0.012 - TY, ZI - TZ]));
    const yd = yc + 0.012 - L;
    const n17 = hexNipple(S, 8, 4);
    P('17', pose(THREE, n17.obj, [XI, yd, ZI], [0, -1, 0]), [0, -0.12, 0]);
    put('13', nptFitting(api, { npt: 4, jic: 6 }), [XI, yd - n17.top[1] + 0.012, ZI], [0, -1, 0], null, [0, -0.18, 0]);
  }

  return { view: { dir: [0.9, 0.7, -1.1] } };
}
