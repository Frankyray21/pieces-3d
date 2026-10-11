// P242 — Groupe diesel CX035607 rév. 2 (pages 242-244) : « ASSY, DIESEL
// ENGINE », repère 22 du châssis P186. Le moteur équipé Deutz D914L04 (P256,
// 11) sur ses quatre plots antivibratoires (trousses P248, 5) ; pompe
// hydraulique 74 cm³ SAE C (1) en bout de carter de volant, té à brides
// code 61 1 po (2) sur son refoulement, deux clapets anti-retour à brides (3),
// coudes à bride code 61 / JIC (13) tenus par leurs demi-brides (14, détail A) ;
// réservoir de gazole (P250, 7) au-delà du carter de volant, goulot sur son
// équerre (12) ; caisson de deux batteries 750 CA (P246, 4 ; batteries 15)
// devant le refroidisseur, plaque formée (6) qui porte le panneau de coupure
// (P254, 9) au-dessus du caisson et le sélecteur de frein (P252, 8) dessous ;
// support du refroidisseur d'huile (10).
// Repère : repère moteur ENG (_moteur_surpresseur.js) — origine sur l'axe du
// vilebrequin, dans le plan de la face SAE du carter de volant ; +X vers la
// soufflante, Y haut, +Z côté injection. Plan d'appui sur le châssis (dessous
// des embases des plots P248, du réservoir, du caisson et du support 10) :
// y = YS = ENG.mountY − 0.041 = −0.391.
// Intégration dans P186 (frame.js, diesel repère 22) : le moteur y est vers
// x ≈ −0.55, z ≈ 0.25, soufflante vers −X (machine) ; placer ce groupe par
// at(api.sub('P242'), [−0.2, DECK + 0.391, 0.25], [0, Math.PI, 0]) (plan
// d'appui sur le pont), à ajuster sur le châssis repris.
// Encombrement ≈ 3.0 (X, de −1.70 à 1.33) × 1.5 (Y, de −0.39 à 1.1) × 1.0 (Z) m.
// Cotes : liste (pompe SAE C 2 trous, brides code 61 1 po, batteries groupe
// 31) ; positions relatives d'après les vues des pages 242-244.
import { ENG, IN } from './_moteur_surpresseur.js';
import { BOX246 } from './P246.js';
import { TANK250 } from './P250.js';

export default function P242(api) {
  const { box, cyl, lathe, shell, plate, bolt, boltSet, nut, washer, fitting, tube, merged, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(x1 - x0, y1 - y0, z1 - z0, mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const YS = ENG.mountY - 0.041;

  // ---------------------------------------------------------------- 11 — moteur équipé
  P('11', api.sub('P256'), [0, 0.35, 0]);
  // 5 — plots antivibratoires sous les supports de pattes (P256 rep. 17).
  for (const [x, z] of ENG.feet) P('5', at(api.sub('P248'), [x, YS, z]), [0, 0, Math.sign(z) * 0.3]);

  // ---------------------------------------------------------------- 1 — pompe hydraulique
  // Cloche d'accouplement (non listée, dessinée avec la pompe) sur la face SAE
  // du carter de volant, pompe à pistons 74 cm³ à bride SAE C deux trous,
  // couvercle arrière, aspiration 2 po sur le flanc −Z, refoulement code 61
  // 1 po dessus.
  const XF = -0.115; // face de bride de la pompe
  {
    const bell = lathe([[0.19, 0], [0.235, 0], [0.235, -0.014], [0.2, -0.02], [0.1, -0.09], [0.1, XF + 0.012], [0.09, XF], [0.07, XF], [0.07, -0.016], [0.19, -0.016]].map(([r, x]) => [r, -x]), 'castIron', { axis: '-x', seg: 48 });
    const flange = bx(XF - 0.016, XF, -0.06, 0.06, -0.09, 0.09, 'castIron', 0.02);
    const body = [
      bx(-0.34, XF - 0.016, -0.065, 0.065, -0.068, 0.068, 'castIron', 0.02),
      bx(-0.37, -0.34, -0.06, 0.06, -0.06, 0.06, 'castIron', 0.012),
      bx(-0.27, -0.21, 0.065, 0.075, -0.03, 0.03, 'castIron', 0.004), // embase de refoulement
      bx(-0.29, -0.19, -0.04, 0.04, -0.08, -0.068, 'castIron', 0.004), // embase d'aspiration
      at(cyl(0.032, 0.05, 'castIron', { axis: 'z' }), [-0.24, 0, -0.1]),
    ];
    const bellBolts = [];
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI * 2;
      bellBolts.push([-0.016, 0.2143 * Math.sin(a), 0.2143 * Math.cos(a)]);
    }
    const bolts = [boltSet(bellBolts, 0.012, 0.04, 'steel', { axis: '-x' }), boltSet([[XF - 0.016, 0, -0.072], [XF - 0.016, 0, 0.072]], 0.016, 0.05, 'steel', { axis: '-x' })];
    P('1', group(merged([bell, flange, ...body], 'castIron'), ...bolts, nameplateAt(api, [-0.26, 0, 0.069])), [-0.35, 0, 0]);
  }
  // 2 — té 4 trous code 61 1 po sur le refoulement ; 3 — clapets anti-retour à
  // brides de part et d'autre ; 14 — demi-brides et vis ; 13 — coudes à bride
  // code 61 / JIC -16 tournés vers le bas.
  const TX = -0.24, TY = 0.075;
  P('2', group(
    bx(TX - 0.04, TX + 0.04, TY, TY + 0.07, -0.04, 0.04, 'steel', 0.004),
    boltSet([[TX - 0.026, TY + 0.07, -0.026], [TX + 0.026, TY + 0.07, -0.026], [TX - 0.026, TY + 0.07, 0.026], [TX + 0.026, TY + 0.07, 0.026]], 0.0095, 0.05, 'steel'),
  ), [0, 0.12, 0]);
  for (const s of [-1, 1]) {
    const zc = s * (0.04 + 0.045);
    P('3', group(
      lathe([[0, -0.045], [0.034, -0.045], [0.034, -0.035], [0.028, -0.03], [0.028, 0.03], [0.034, 0.035], [0.034, 0.045], [0, 0.045]], 'steel', { axis: 'z', seg: 28, pos: [TX, TY + 0.035, zc] }),
      at(box(0.024, 0.01, 0.03, 'steel'), [TX, TY + 0.035 + 0.032, zc]),
    ), [0, 0.12, s * 0.12]);
    const zf = s * (0.04 + 0.09);
    // Demi-brides (deux) et quatre vis du coude sur le clapet.
    P('14', group(
      merged([-1, 1].map((k) => bx(TX - 0.04, TX + 0.04, TY + 0.035 + k * 0.012 - 0.01, TY + 0.035 + k * 0.012 + 0.01, zf, zf + s * 0.014, 'zinc', 0.003)), 'zinc'),
      boltSet([[TX - 0.026, TY + 0.035 - 0.012, zf + s * 0.014], [TX + 0.026, TY + 0.035 - 0.012, zf + s * 0.014], [TX - 0.026, TY + 0.035 + 0.012, zf + s * 0.014], [TX + 0.026, TY + 0.035 + 0.012, zf + s * 0.014]], 0.0095, 0.04, 'steel', { axis: s > 0 ? 'z' : '-z' }),
    ), [0, 0.12, s * 0.2]);
    P('13', group(
      lathe([[0, 0], [0.03, 0], [0.03, 0.012], [0.022, 0.016], [0, 0.016]], 'steel', { axis: s > 0 ? 'z' : '-z', seg: 24, pos: [TX, TY + 0.035, zf] }),
      tube([[TX, TY + 0.035, zf + s * 0.016], [TX, TY + 0.035, zf + s * 0.04], [TX, TY + 0.005, zf + s * 0.045], [TX, TY - 0.02, zf + s * 0.045]], 0.016, 'steel', { seg: 20, radial: 16 }),
      at(fitting(0.032, 0.05, 'steel', { axis: '-y' }), [TX, TY - 0.035, zf + s * 0.045]),
    ), [0, 0.06, s * 0.26]);
  }

  // ---------------------------------------------------------------- 7, 12 — gazole
  // Réservoir au-delà du carter de volant (axe le long de X, plaque de visite
  // vers le moteur) ; équerre du goulot (12) dressée sur le bout −X du caisson.
  const T7 = [-0.95, YS, 0.12];
  P('7', at(api.sub('P250'), T7), [-0.25, 0, 0.2]);
  {
    const [L7] = TANK250.size;
    const nk = TANK250.neck;
    const N = [T7[0] + nk[0], T7[1] + nk[1], T7[2] + nk[2]];
    const xw = T7[0] - L7 / 2; // bout −X du caisson
    const yt = YS + TANK250.size[1];
    P('12', group(
      merged([
        bx(xw - 0.006, xw, yt - 0.12, N[1] - 0.04, T7[2] - 0.03, T7[2] + 0.03, 'black'), // montant contre le bout du caisson
        bx(N[0], xw - 0.006, N[1] - 0.05, N[1] - 0.044, T7[2] - 0.03, T7[2] + 0.03, 'black'), // bras
      ], 'black'),
      at(shell(IN + 0.004, IN + 0.0015, 0.03, 'black'), [N[0], N[1] - 0.047, N[2]]), // collier
      at(shell(IN, IN - 0.002, 0.1, 'zinc'), [N[0], N[1] - 0.05, N[2]]), // goulot 2 po
      boltSet([[xw, yt - 0.08, T7[2]], [xw, N[1] - 0.12, T7[2]]], 0.008, 0.02, 'zinc', { axis: '-x' }),
    ), [-0.2, 0.2, 0]);
  }

  // ---------------------------------------------------------------- batteries (4, 6, 8, 9, 15)
  // Groupe posé devant le refroidisseur, caisson en travers (son X le long de
  // −Z du moteur, façade vers +X) : repère local = repère de P246.
  const BG = { pos: [1.25, YS, 0.0], rot: [0, Math.PI / 2, 0] };
  const local = (obj, p = [0, 0, 0], r = null) => at(group(at(obj, p, r)), BG.pos, BG.rot);
  P('4', local(api.sub('P246')), [0.3, 0, 0]);
  // 15 — batteries groupe 31 (13 × 6,8 × 9,4 po) : bac noir, couvercle,
  // bornes plomb, bouchons.
  const B = BOX246.battery;
  for (const [x, y, z] of BOX246.batteries) {
    const bat = group(
      at(box(B.l, B.h - 0.012, B.w, 'black', { r: 0.004 }), [0, (B.h - 0.012) / 2, 0]),
      at(box(B.l - 0.004, 0.012, B.w - 0.004, 'black', { r: 0.003 }), [0, B.h - 0.006, 0]),
      ...[-1, 1].map((s) => at(lathe([[0, 0], [0.009, 0], [0.0075, 0.02], [0, 0.02]], 'zinc', { seg: 16 }), [s * (B.l / 2 - 0.035), B.h, -B.w / 2 + 0.03])),
      merged([-0.06, 0, 0.06].map((dx) => at(cyl(0.012, 0.006, 'plastic', { seg: 16 }), [dx, B.h + 0.003, 0.02])), 'plastic'),
    );
    P('15', local(bat, [x, y, z]), [0.3, 0.35, 0]);
  }
  // 6 — plaque de montage formée : aile contre la paroi arrière du caisson,
  // tablette au-dessus qui reçoit le panneau P254 ; le sélecteur P252 sur
  // l'aile, sous la tablette.
  const SH = 0.336; // dessus de la tablette (repère P246)
  const ZB = -0.096 - 0.005; // dos de l'aile (contre la paroi arrière)
  P('6', local(group(merged([
    bx(0.15, 0.33, 0.15, SH, ZB, -0.096, 'black'),
    bx(0.15, 0.33, SH - 0.006, SH, ZB, 0.065, 'black'),
    bx(0.15, 0.156, SH - 0.06, SH - 0.006, -0.096, 0.065, 'black'), // gousset
  ], 'black'), boltSet([[0.18, 0.2, -0.096], [0.3, 0.2, -0.096]], 0.008, 0.02, 'zinc', { axis: 'z' }))), [0.3, 0.5, -0.3]);
  P('9', local(api.sub('P254'), [0.24, SH, -0.02]), [0.3, 0.45, 0]);
  P('8', local(api.sub('P252'), [0.24, 0.22, ZB], [0, Math.PI, 0]), [0.6, 0, -0.35]);

  // ---------------------------------------------------------------- 10 — support du refroidisseur
  // Deux montants en U de part et d'autre du faisceau, traverse haute, semelle
  // basse et traverse sous la patte isolante (P256 rep. 18).
  {
    const C = ENG.cooler;
    const zL = C.z - C.w / 2 - 0.04, zR = C.z + C.w / 2 + 0.04, yTop = C.y + C.h / 2 + 0.06;
    const parts = [];
    for (const z of [zL, zR]) {
      parts.push(bx(C.x - 0.04, C.x + 0.04, YS + 0.01, yTop, z - 0.025, z + 0.025, 'black', 0.003));
      parts.push(bx(C.x - 0.08, C.x + 0.08, YS, YS + 0.012, z - 0.05, z + 0.05, 'black', 0.003));
    }
    parts.push(bx(C.x - 0.04, C.x + 0.04, yTop - 0.03, yTop, zL, zR, 'black', 0.003));
    parts.push(bx(C.x - 0.06, C.x + 0.06, ENG.mountY + 0.08, ENG.mountY + 0.092, zL, zR, 'black', 0.003));
    P('10', group(merged(parts, 'black')), [0.35, 0, 0]);
  }

  return { view: { dir: [-0.9, 0.7, 1.1] } };
}

// Plaque signalétique de la pompe, face +Z.
function nameplateAt(api, p) {
  return api.S.at(api.S.nameplate(0.06, 0.035), p);
}
