// P270 — Vanne de mise à vide manuelle CX035663 rév. 0 « ASSY, MANUAL UNLOAD
// VALVE » (page 270), repère 23 de P186. Vanne de décharge pilotée (2)
// verticale, montée sur la tôle supérieure du support du distributeur 8
// sections (dessiné en tirets, hors liste) par un adaptateur de traversée
// MNPT → MJIC -06 à contre-écrou (7) ; sous la tôle, coude tournant SFJIC →
// MJIC -06 (3) puis té tournant SFJIC-MJIC/MJIC -06 (4) ; sur le corps en té
// de la vanne : bouchon à six-pans creux fraisé 1/4 NPT (9) côté +Z et
// mamelon six-pans 1/4 NPT (8) côté -X vers le sélecteur de circuit (1),
// bloc carré dont l'autre entrée (-X) reçoit un coude 1/4 NPT → JIC -06 (5)
// et la sortie (dessous) un adaptateur droit 1/4 NPT → JIC -06 (6).
// Repère : origine sur la face supérieure de la tôle du support, à l'axe du
// trou de traversée (axe de la vanne 2) ; Y vers le haut, -X vers le
// sélecteur 1, +Z côté du bouchon 9. Tôle supposée de 1/4 po (y de -0.0064
// à 0). Encombrement ≈ 0.20 (X) × 0.26 (Y, de -0.08 à 0.18) × 0.06 (Z) m.
// Cotes : orifices 1/4 NPT et JIC -06 (liste) ; corps de vanne et bloc du
// sélecteur estimés d'après les proportions de la vue (bloc ≈ 1,4 po).
// Dans P186 : au-dessus du support du distributeur de mise en place (repère
// 2), vers x ≈ 1.3, y ≈ DECK + 0.6, z ≈ 0.12 dans le repère machine.
import { IN, NPT, SAE, nptFitting, swivelElbow, orient, orientPoint, portedBlock } from './_chassis.js';

export default function P270(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (NPT[4] * IN) / 2; // 1/4 NPT
  const j6 = SAE[6], rt = (j6.t * IN) / 2;
  const tPl = 0.25 * IN;

  // Embout JIC mâle 37° le long de +Y, de y0 à y0 + len.
  const jicMale = (y0, len) => {
    const yc = y0 + len - rt * 0.55;
    return [
      [0, y0], [rt * 0.85, y0], ...S.thread(rt, y0 + 0.001, yc, { pitch: rt * 0.22, maxTurns: 6, chamferBottom: false }),
      [rt * 0.92, yc + rt * 0.05], [rt * 0.62, y0 + len], [rt * 0.42, y0 + len], [rt * 0.42, y0 + len - 0.002], [0, y0 + len - 0.002],
    ];
  };

  // ---------------------------------------------------------------- 7 — adaptateur de traversée
  // Le long de -Y depuis le dessus de la tôle : queue MNPT vers le haut (dans
  // la vanne), six-pans posé sur la tôle, fût fileté traversant, contre-écrou
  // sous la tôle, embout JIC -06 en bas.
  const bh = [];
  bh.push(S.lathe([[0, 0.012], ...S.thread(rn, 0.012, 0.026, { r1: rn * 0.94, pitch: rn * 0.2, chamferBottom: false }), [0, 0.026]], 'zinc', { seg: 14 }));
  bh.push(S.nut(0.0254, 0.012, 'zinc', { pos: [0, 0.006, 0] }));
  bh.push(S.lathe([[0, -0.024], [0.0095, -0.024], ...S.thread(0.0095, -0.024, 0, { pitch: 0.0014, maxTurns: 10, chamferBottom: false }), [0, 0]], 'zinc', { seg: 16 }));
  bh.push(S.lathe(jicMale(0, 0.016).map(([r, y]) => [r, -0.024 - y]).reverse(), 'zinc', { seg: 16 }));
  // Contre-écrou de traversée (fourni avec 7), sous la tôle.
  bh.push(S.nut(0.0254, 0.008, 'zinc', { pos: [0, -tPl - 0.004, 0] }));
  P('7', S.merged(bh, 'zinc'), [0, -0.05, 0]);
  const tip7 = -0.024 - 0.016;

  // ---------------------------------------------------------------- 2 — vanne de décharge pilotée
  const yT = 0.085; // axe des orifices latéraux du corps en té
  const v = [];
  v.push(S.nut(0.03, 0.014, 'steel', { pos: [0, 0.019, 0] }));
  v.push(S.lathe([[0, 0.026], [0.0165, 0.026], [0.0165, 0.06], [0.0175, 0.062], [0.0175, 0.104], [0.0165, 0.106], [0, 0.106]], 'steel', { seg: 28 }));
  // Bossages latéraux (-X vers 8, +Z bouchon 9), taraudés 1/4 NPT (vrais trous).
  const bX = S.group(portedBlock(api, 0.024, 0.024, 0.016, 'steel', [[0, 0, rn * 0.95, 0.012]], { spot: 0 }));
  bX.rotation.y = -Math.PI / 2; bX.position.set(-0.022, yT, 0);
  const bZ = S.group(portedBlock(api, 0.024, 0.024, 0.016, 'steel', [[0, 0, rn * 0.95, 0.012]], { spot: 0 }));
  bZ.position.set(0, yT, 0.022);
  v.push(bX, bZ);
  // Tête de réglage : contre-écrou, écrou de corps, fût, chapeau six-pans.
  v.push(S.nut(0.034, 0.013, 'steel', { pos: [0, 0.1125, 0] }));
  v.push(S.nut(0.032, 0.012, 'steel', { pos: [0, 0.125, 0] }));
  v.push(S.lathe([[0, 0.131], [0.0145, 0.131], [0.0145, 0.158], [0, 0.158]], 'steel', { seg: 24 }));
  v.push(S.nut(0.026, 0.018, 'darkSteel', { pos: [0, 0.167, 0] }));
  P('2', S.merged(v, 'steel'), [0, 0.06, 0]);

  // ---------------------------------------------------------------- 9 — bouchon fraisé à six-pans creux
  const hexR = 0.003 / Math.cos(Math.PI / 6);
  const plug = S.lathe([
    [0, -0.011], ...S.thread(rn * 0.95, -0.011, -0.001, { r1: rn * 0.99, pitch: rn * 0.2 }), [rn * 1.02, 0], [hexR, 0], [hexR, -0.004], [0, -0.004],
  ], 'steel', { seg: 16 });
  P('9', orient(api, plug, [0, yT, 0.03 - 0.0015], [0, 0, 1]), [0, 0, 0.05]);

  // ---------------------------------------------------------------- 8 — mamelon six-pans 1/4 NPT
  const nip = nptFitting(api, { npt: 4, end: 'npt', material: 'steel' });
  P('8', orient(api, nip.obj, [-0.03, yT, 0], [-1, 0, 0]), [-0.04, 0, 0]);
  const nipTip = orientPoint(api, nip.out, [-0.03, yT, 0], [-1, 0, 0]);

  // ---------------------------------------------------------------- 1 — sélecteur de circuit
  // Bloc 1.4 × 1.4 × 1.9 po, entrées ±X, sortie dessous (vrais orifices taraudés).
  const bw = 0.048, bs = 0.036;
  const xb = nipTip[0] + 0.009 - bw / 2;
  const blk = S.group(
    S.at(S.group(portedBlock(api, bs, bs, bw, 'zinc', [[0, 0, rn * 0.95, 0.012]], { spot: 0 })), [0, 0, 0], [0, Math.PI / 2, 0]),
  );
  // Orifices -X et dessous : petits blocs creux affleurants (taraudages vrais).
  const hm = S.group(portedBlock(api, bs * 0.6, bs * 0.6, 0.002, 'zinc', [[0, 0, rn * 0.95, 0.0015]], { spot: 0 }));
  hm.rotation.y = -Math.PI / 2; hm.position.x = -bw / 2 - 0.001;
  const hb = S.group(portedBlock(api, bs * 0.6, bs * 0.6, 0.002, 'zinc', [[0, 0, rn * 0.95, 0.0015]], { spot: 0 }));
  hb.rotation.x = Math.PI / 2; hb.position.y = -bs / 2 - 0.001;
  // Gros six-pans du siège côté +X (bouchon de cartouche).
  const seat = S.nut(0.03, 0.01, 'zinc', { axis: 'x', pos: [bw / 2 + 0.005, 0, 0] });
  blk.add(hm, hb, seat);
  blk.position.set(xb - 0.01, yT, 0);
  P('1', blk, [-0.1, 0, 0]);

  // ---------------------------------------------------------------- 5 — coude 1/4 NPT → JIC -06 (-X du sélecteur), sortie vers le bas
  const el5 = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
  P('5', orient(api, el5.obj, [xb - 0.01 - bw / 2 - 0.002, yT, 0], [-1, 0, 0], [0, -1, 0]), [-0.16, 0, 0]);
  // ---------------------------------------------------------------- 6 — adaptateur droit 1/4 NPT → JIC -06 (dessous du sélecteur)
  const st6 = nptFitting(api, { npt: 4, jic: 6 });
  P('6', orient(api, st6.obj, [xb - 0.01, yT - bs / 2 - 0.002, 0], [0, -1, 0]), [-0.1, -0.06, 0]);

  // ---------------------------------------------------------------- 3 — coude tournant sous la traversée, sortie vers +X
  const el3 = swivelElbow(api, 6);
  P('3', orient(api, el3.obj, [0, tip7, 0], [0, -1, 0], [1, 0, 0]), [0, -0.12, 0]);
  const out3 = orientPoint(api, el3.out, [0, tip7, 0], [0, -1, 0], [1, 0, 0]);

  // ---------------------------------------------------------------- 4 — té tournant SFJIC-MJIC/MJIC -06
  // Le long de +Y : écrou tournant sur le bout mâle (origine), corps, embout
  // mâle de passage, branche mâle selon +Z.
  const nh = rt * 1.5, s = j6.hex * IN;
  const tee = [
    S.nut((j6.hex + 0.0625) * IN, nh, 'zinc', { pos: [0, nh * 0.4 - nh / 2 + 0.002, 0] }),
    S.box(s, s * 1.1, s, 'zinc', { r: s * 0.12, pos: [0, nh * 0.4 + 0.002 + s * 0.55, 0] }),
  ];
  const yc = nh * 0.4 + 0.002 + s * 0.55;
  tee.push(S.lathe(jicMale(yc + s * 0.55, rt * 2.4), 'zinc', { seg: 16 }));
  tee.push(S.at(S.lathe(jicMale(s * 0.5, rt * 2.4), 'zinc', { seg: 16 }), [0, yc, 0], [Math.PI / 2, 0, 0]));
  P('4', orient(api, S.merged(tee, 'zinc'), out3, [1, 0, 0], [0, -1, 0]), [0.08, -0.12, 0]);

  void THREE;
  return { view: { dir: [0.7, 0.5, 1.1] } };
}
