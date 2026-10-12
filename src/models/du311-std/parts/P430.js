// P430 — Installation du surpresseur CX035392 « ASSY, BOOSTER INSTALLATION »
// (page 430), repère 3 de P420. Sous le capot du pont arrière, entre la grille
// arrière (x = −4.38) et la paroi avant du capot (x = −3.6), l'enrouleur
// (REEL, x = −3.08) restant libre :
//   · module surpresseur (P432, 10) : vilebrequin selon Z sur la ligne
//     (DRIVE.x, DRIVE.yComp), poulie côté gauche dans le plan des courroies
//     z = DRIVE.z (moteur 75 HP et courroies : P416 / P418) ;
//   · admission d'air de mine (P482, 21) à l'arrière droit, ligne 3 po selon
//     Z, croix de distribution au-dessus de l'arrière du surpresseur ; trois
//     flexibles JIC -24 de 27 po (22) vers les coudes d'aspiration des
//     culasses, tenus sous le toit par l'équerre de support (6) et ses
//     colliers doubles ;
//   · refoulement : trois flexibles -24 de 50 po (23) des culasses vers le
//     collecteur (P476, 18), flexible inox double tresse 2 × 10 po (1) à
//     brides code 61 du collecteur à l'entrée F1 du refroidisseur final (P466,
//     14) posé contre la paroi avant ; sortie d'air de forage par le coude -32
//     du refroidisseur et le flexible d'air 2 po × 28 po (3) qui traverse la
//     paroi avant et longe le flanc droit vers l'avant ;
//   · dérivation (P462, 11) : ligne d'air verticale contre le flanc droit,
//     mamelon 21 tenu par le collier Ø 1.66 po (insert 2, plaque de dessus 4,
//     équerre de pied 12) ; électrovanne d'eau sur l'équerre à manchon 1 po
//     (13) boulonnée sur une cornière (9) ;
//   · collecteur boulonné sur la seconde cornière (9) ; arrivée d'eau (P474,
//     17) à travers la plaque pliée (8, manchon de cloison 1 po) fixée à la
//     paroi avant ; collier du tube 3 po d'entrée (7) contre le flanc droit ;
//     petit collier 1/2 po (5) sur l'équerre 12, prévu pour la ligne de
//     pilotage (flexible hors liste) ;
//   · purge automatique (P478, 19), pressostat différentiel (P480, 20),
//     manomètres du panneau arrière (P472, 16) et commande du compresseur sous
//     le plancher (P470, 15).
// Repère machine (../layout.js : X vers l'avant, Y haut, Z à droite), posé à
// l'identité par P420 ; placements des sous-assemblages dans RB (_rearb.js).
// Encombrement ≈ 1.6 (X, de −4.36 à −2.98 avec P470) × 1.0 (Y, de 0.55 à
// 1.93) × 1.9 (Z) m. Flexibles : longueurs de la liste, tracés estimés (la
// page 430 ne les montre pas).
import { ACC, I, RB, xf, put, add, hosePath, stauff, pipeR, hexProf } from './_rearb.js';
import { boostPorts } from './P432.js';
import { afwPorts, afwInletX } from './P482.js';
import { manPorts, MAN } from './P476.js';
import { acPorts } from './P466.js';
import { w462 } from './P462.js';
import { WI } from './P474.js';
import { j518, flangeHead, splitFlange } from '../../du311/parts/_chassis.js';

const R24 = I(1.0); // flexible -24 (Ø ext. ≈ 2 po)

export default function P430(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, bolt, washer, weld, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const T = (k) => xf(api, RB[k]);
  const deck = RB.deckY;

  // ---------------------------------------------------------------- sous-assemblages
  P('10', put(S, api.sub('P432'), RB.boost), [0, 0.35, -0.3]);
  P('21', put(S, api.sub('P482'), RB.afw), [-0.25, 0.3, 0.35]);
  P('14', put(S, api.sub('P466'), RB.ac), [0.3, 0.1, 0.2]);
  P('18', put(S, api.sub('P476'), RB.man), [0, 0.2, 0.15]);
  P('11', put(S, api.sub('P462'), RB.byp), [0.1, 0.1, 0.4]);
  P('15', put(S, api.sub('P470'), RB.ctl), [0, -0.2, 0.3]);
  P('16', put(S, api.sub('P472'), RB.gp), [-0.3, 0.1, -0.2]);
  P('17', put(S, api.sub('P474'), RB.wi), [0.25, 0.2, 0.3]);
  P('19', put(S, api.sub('P478'), RB.adv), [-0.3, -0.1, 0.2]);
  P('20', put(S, api.sub('P480'), RB.pds), [0, 0.3, 0.1]);

  // ---------------------------------------------------------------- 22 — flexibles d'aspiration -24 × 27 po
  // Des trois départs de la croix (P482) aux coudes d'aspiration des culasses,
  // en passant par les colliers de l'équerre 6 sous le toit.
  const bp = boostPorts(S), tb = T('boost');
  const suction = bp.suction.map(({ tip, dir }) => ({ tip: tb.pt(tip), dir: tb.dir(dir) }));
  const discharge = bp.discharge.map(({ tip, dir }) => ({ tip: tb.pt(tip), dir: tb.dir(dir) }));
  const ta = T('afw');
  const cross = afwPorts(S).map(({ tip, dir }) => ({ tip: ta.pt(tip), dir: ta.dir(dir) }));
  const YS = 1.865, ZS = -0.33; // axe des colliers de l'équerre 6
  const clampX = [-4.17, -3.95, -3.73];
  // Croix : bras haut → culasse −60° (arrière), bout → culasse centrale, bras bas → culasse +60° (avant).
  [[1, 0], [0, 1], [2, 2]].forEach(([k, i]) => {
    const a = cross[k], b = suction[i];
    const cp = [clampX[i], YS, ZS];
    const pts = [
      a.tip, add(a.tip, a.dir, 0.07), add(cp, [0, 0, 1], 0.09), cp, add(cp, [0, 0, -1], 0.08),
      add(b.tip, b.dir, 0.07), add(b.tip, b.dir, 0.015), b.tip,
    ];
    P('22', S.hose(pts, R24), [0, 0.25, 0]);
  });

  // ---------------------------------------------------------------- 6 — équerre de support des flexibles d'aspiration
  // Plat 3 × 3/8 po selon X sous le toit du capot, bouts relevés et percés
  // (fixation au cadre du toit), trois colliers doubles serrés dessous.
  {
    const yb = YS + R24 + 0.018, t = I(0.375), w = I(3), x0 = -4.33, x1 = -3.64;
    const bar = [box(x1 - x0, t, w, 'grey', { pos: [(x0 + x1) / 2, yb + t / 2, ZS] })];
    for (const x of [x0, x1]) {
      const s = x === x0 ? 1 : -1;
      bar.push(at(box(t, 1.945 - yb, w, 'grey', { r: 0.002 }), [x + s * (t / 2), (yb + 1.945) / 2, ZS]));
    }
    const holes = [x0, x1].flatMap((x) => [-1, 1].map((s) => at(cyl(I(0.22), I(0.4), 'blackOxide', { axis: 'x', seg: 10 }), [x + (x === x0 ? 1 : -1) * I(0.19), 1.935, ZS + s * 0.022])));
    const clamps = clampX.map((x) => at(stauff(S, R24), [x, YS, ZS], [0, 0, Math.PI]));
    P('6', group(merged(bar, 'grey'), merged(holes, 'blackOxide'), ...clamps), [0, 0.15, 0]);
  }

  // ---------------------------------------------------------------- 23 — flexibles de refoulement -24 × 50 po
  const tm = T('man');
  const inlets = manPorts(S).map(({ tip, dir }) => ({ tip: tm.pt(tip), dir: tm.dir(dir) }));
  // Culasse −60° → arrivée la plus proche du fond bombé ; centrale → seconde ; +60° → coude 45°.
  [[0, 0, [0.5, 1, 0.1]], [1, 1, [0.4, 1, 0.25]], [2, 2, [0.1, 1, 0.4]]].forEach(([i, k, sag]) => {
    const a = discharge[i], b = inlets[k];
    P('23', S.hose(hosePath(api, a.tip, a.dir, b.tip, b.dir, 50 * I(1), { sag, lead: 0.1 }), R24), [0, 0.2, 0.25]);
  });

  // ---------------------------------------------------------------- 1 — flexible inox 2 po × 10 po à brides code 61
  {
    const pm = tm.pt([MAN.flangeX, 0, 0]), nm = tm.dir([1, 0, 0]);
    const tc = T('ac'), ap = acPorts(S);
    const pf = tc.pt(ap.f1.pos), nf = tc.dir(ap.f1.dir);
    const f = j518(32, 61);
    const end = (p, n) => {
      const side = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const head = O(flangeHead(api, 32, 61, 0.03, 'steel'), p, n, side);
      const sf = O(splitFlange(api, 32, 61, { material: 'zinc' }).obj, p, n, side);
      return { objs: [head, sf], start: add(p, n, f.hc + 0.03) };
    };
    const e1 = end(pm, nm), e2 = end(pf, nf);
    const pts = [e1.start, add(e1.start, nm, 0.06), add(e2.start, nf, 0.06), e2.start];
    const braid = S.hose(pts, I(1.3), { material: 'steel', endMaterial: 'steel' });
    P('1', group(braid, ...e1.objs, ...e2.objs), [0.05, 0.15, 0.1]);
  }

  // ---------------------------------------------------------------- 3 — flexible d'air 2 po × 28 po vers l'avant
  {
    const tc = T('ac'), o9 = acPorts(S).out9;
    const a = tc.pt(o9.pos), da = tc.dir(o9.dir);
    // Traverse la paroi avant du capot puis longe le flanc droit du pont vers l'avant (au-delà de l'enrouleur).
    const pts = [a, add(a, da, 0.06), [-3.6, 1.49, 0.3], [-3.42, 1.43, 0.52], [-3.26, 1.37, 0.6]];
    P('3', S.hose(pts, I(1.3)), [0.15, 0.15, 0]);
  }

  // ---------------------------------------------------------------- 12, 2, 4, 5 — collier du mamelon 21 (P462)
  {
    const tbp = T('byp'), w = w462(S);
    const c = tbp.pt(w.n21), r = I(0.83);
    const zW = c[2] + r + 0.017; // face de la plaque à souder (côté flanc)
    const W = 0.07, D = 0.03, t = 0.014;
    // 2 — insert : deux demi-coquilles moulées (polypropylène noir) autour du tube.
    const halves = [-1, 1].flatMap((s) => [
      box(W, D, t, 'black', { r: 0.003, pos: [c[0], c[1], c[2] + s * (r + t / 2 - 0.003)] }),
      ...[-1, 1].map((sx) => box((W - 2 * r) / 2 - 0.002, D, r - 0.002, 'black', { r: 0.002, pos: [c[0] + sx * (r + (W - 2 * r) / 4), c[1], c[2] + s * (r / 2 + 0.001)] })),
    ]);
    P('2', group(merged(halves, 'black')), [0.02, 0, -0.05]);
    // 4 — plaque de dessus (côté libre −Z) et ses deux vis CHC.
    const zc = c[2] - r - t - 0.002;
    P('4', group(
      box(W * 1.02, D * 0.85, 0.004, 'zinc', { pos: [c[0], c[1], zc] }),
      merged([-1, 1].map((s) => at(bolt(0.008, 0.06, 'zinc', { axis: '-z', head: 'socket' }), [c[0] + s * (r + 0.013), c[1], zc - 0.002])), 'zinc'),
    ), [0, 0, -0.08]);
    // 12 — équerre de pied : plaque à souder du collier, montant plié, semelle boulonnée au pont.
    const ym = c[1] - D / 2 - 0.01;
    const br = merged([
      box(W * 1.05, D * 1.05, 0.005, 'grey', { pos: [c[0], c[1], zW + 0.0025] }),
      box(0.06, c[1] + D / 2 - deck, I(0.25), 'grey', { pos: [c[0], (c[1] + D / 2 + deck) / 2, zW + 0.005 + I(0.125)] }),
      box(0.06, I(0.25), 0.07, 'grey', { pos: [c[0], deck + I(0.125), zW + 0.005 - 0.035 + I(0.25)] }),
    ], 'grey');
    const bb = merged([-1, 1].map((s) => at(bolt(I(0.375), I(1.0), 'zinc', { washer: true }), [c[0] + s * 0.018, deck + I(0.25), zW - 0.025])), 'zinc');
    P('12', group(br, bb, weld([[c[0] - 0.03, ym, zW + 0.005], [c[0] + 0.03, ym, zW + 0.005]], 0.005, 'grey')), [0, -0.05, 0.08]);
    // 5 — collier simple 1/2 po sur le montant, au-dessus (ligne de pilotage).
    const c5 = [c[0] + 0.03 + I(0.25) + 0.012 + 0.005, deck + 0.06, zW + 0.005 + I(0.125)];
    P('5', O(stauff(S, I(0.25)), c5, [1, 0, 0], [0, 0, 1]), [0.06, 0, 0.04]);
  }

  // ---------------------------------------------------------------- 13, 9 — équerre à manchon 1 po (P462, ligne d'eau) et sa cornière
  // Cornière 6 × 4 × 1/4 po, longueur 0.2 m (rep. 9) : arête extérieure en p,
  // longueur selon uL, aile A (6 po) selon uA, aile B (4 po) selon uB, épaisseurs
  // vers l'intérieur ; cordon de soudure au pied de l'aile posée sur le pont.
  const angle9 = (p, uL, uA, uB, foot) => {
    const L = 0.2, a = I(6), b = I(4), t = I(0.25);
    const ctr = (ka, kb) => add(add(add(p, uL, L / 2), uA, ka), uB, kb);
    const A = O(box(t, L, a, 'grey'), ctr(a / 2, t / 2), uL, uB);
    const B = O(box(b, L, t, 'grey'), ctr(t / 2, b / 2), uL, uB);
    const parts = [group(merged([A, B], 'grey'))];
    if (foot) parts.push(weld(foot, 0.006, 'grey'));
    return group(...parts);
  };
  {
    const tbp = T('byp'), w = w462(S);
    const top = tbp.pt(w.cpl);
    const rc = ACC.pipeOD(16) / 2 * 1.28;
    const cpl = at(ACC.coupling(S, 16, 'darkSteel'), [top[0], top[1] - w.L, top[2]]);
    const yA = top[1] - w.L + 0.006, xA = -3.96;
    const arm = box(xA - top[0], I(0.25), I(2), 'grey', { pos: [(top[0] + xA) / 2 - I(0.125), yA, top[2]] });
    const tab = box(I(0.25), 0.055, I(2), 'grey', { pos: [xA - I(0.125), yA - 0.026, top[2]] });
    const bolts = merged([-1, 1].map((s) => at(bolt(I(0.375), I(1.0), 'zinc', { axis: '-x', washer: true }), [xA - I(0.25), yA - 0.03, top[2] + s * 0.014])), 'zinc');
    P('13', group(cpl, merged([arm, tab], 'grey'), bolts, S.weldRing(rc, 0.005, 'grey', { pos: [top[0], yA + I(0.125), top[2]] })), [0, 0, -0.12]);
    const p9 = [xA + I(0.25), deck, top[2] + 0.076 + 0.05];
    P('9', angle9(p9, [0, 1, 0], [0, 0, -1], [-1, 0, 0], [[xA, deck + 0.003, p9[2]], [xA, deck + 0.003, p9[2] - I(6)]]), [0.08, -0.05, 0]);
  }
  // Seconde cornière : appui de la patte du collecteur (vis P476 rep. 8).
  {
    // Couchée selon Z sous la patte horizontale : aile de 6 po debout sur le pont, aile de 4 po dessous la patte.
    const yTop = tm.pt([0, 0, MAN.tabZ - I(0.25)])[1];
    const z0 = tm.pt([MAN.tabX[0], 0, 0])[2] - 0.01;
    const p9 = [RB.man.pos[0] - 0.04, yTop, z0];
    P('9', angle9(p9, [0, 0, 1], [0, -1, 0], [-1, 0, 0], [[p9[0] - I(0.25), deck + 0.003, z0], [p9[0] - I(0.25), deck + 0.003, z0 + 0.2]]), [-0.08, -0.05, 0]);
  }

  // ---------------------------------------------------------------- 8 — plaque pliée de cloison (P474) ; 7 — collier 3 1/2 po
  {
    const tw = T('wi');
    const c = tw.pt([0, 0, 0]), nx = tw.dir([1, 0, 0]);
    const L = WI.cpl, t = I(0.25);
    const rc = ACC.pipeOD(16) / 2 * 1.28;
    // Aile porte-manchon dans le plan normal à l'axe de la ligne haute, aile de fixation contre la paroi avant.
    const web = O(box(0.13, 0.1, t, 'grey', { r: 0.002 }), add(c, [1, 0, 0], 0.015), nx, [0, 1, 0]);
    const xw = -3.6 - t / 2 - 0.002;
    const flange = box(t, 0.1, 0.07, 'grey', { pos: [xw, c[1], c[2] + nx[2] * 0.035] });
    const cpl = O(ACC.coupling(S, 16, 'darkSteel'), add(c, nx, -L / 2), nx, [0, 1, 0]);
    const bolts = merged([-1, 1].map((s) => at(bolt(I(0.375), I(0.75), 'zinc', { axis: 'x', washer: true }), [xw - t / 2, c[1] + s * 0.03, c[2] + nx[2] * 0.035])), 'zinc');
    P('8', group(merged([web, flange], 'grey'), cpl, bolts, O(S.weldRing(rc, 0.005, 'grey'), add(c, nx, -t / 2), nx, [0, 1, 0])), [0.08, 0.05, 0]);
    void L;
  }
  {
    // Collier lourd du tube 3 po d'entrée (P482 rep. 8), plaque à souder contre le flanc droit du capot.
    const c = ta.pt([afwInletX(S), -0.2, 0]);
    P('7', O(stauff(S, ACC.pipeOD(48) / 2), c, [0, 0, -1], [1, 0, 0]), [0, 0, 0.12]);
  }

  void THREE; void lathe; void washer; void pipeR; void hexProf;
  return { view: { dir: [-1.0, 0.6, 1.1] } };
}
