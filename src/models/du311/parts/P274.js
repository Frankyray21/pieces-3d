// P274 — Surpresseur DU311-T CX035826 rév. 0 (pages 274-276) : « ASSY,
// DU311-T BOOSTER », repère 25 du châssis P186. Le compresseur et sa
// tuyauterie de culasses (P280, 10) ; carter de courroies (P278, 3) qui
// descend en biais du côté +Z vers le moteur électrique d'entraînement
// (P186, non listé ici) ; admission d'air de mine (P314, 14) — vanne 3 voies
// sur son équerre (8), actionneur (P310, 12) relié par l'accouplement (2),
// filtres tenus par la cornière (5) et le collier 3,5 po (6), purge manuelle
// (P312, 13) sous le filtre — dont les trois départs alimentent les culasses
// par les flexibles JIC -24 de 34 po (21) ; tuyauterie d'air auxiliaire
// (P308, 11) le long du châssis ; support du remplissage d'huile (9) sous la
// bride de P286, gyrophare rouge (1) sur son support (7, détail B) ; purge
// du séparateur d'eau (détail C) : coude FNPT-MNPT (19), mamelon (20),
// vanne à boisseau 1/2 po (4), coude NPT-NPT (17), mamelon hexagonal
// MNPT-JIC (18) ; coudes MNPT-JIC -12 (16) et bouchon JIC (15) sur les
// prises du filtre 1 micron.
// Repère : repère du bloc compresseur LR (_moteur_surpresseur.js) — origine
// sur l'axe du vilebrequin du surpresseur, au droit du cylindre central ;
// +X vers la poulie, Y haut, +Z = X × Y. Dessous des pattes du compresseur à
// y = LR.footY = −0.165 ; carter de courroies : axe de la poulie du moteur à
// 0.70 m du vilebrequin, à 120° du haut vers +Z ; ligne d'admission P314
// le long de −Z (filtres vers z ≈ −2.2), P308 le long du bas du châssis.
// Intégration dans P186 (frame.js, surpresseur repère 25, vers x ≈ 0.12,
// z ≈ −0.12) : placer ce groupe par at(api.sub('P274'), [0.12, DECK + 0.165
// + 0.075, −0.12], [0, ±π/2, 0]) selon l'orientation retenue du vilebrequin
// (pattes sur un socle de 75 mm, à ajuster sur le châssis repris).
// Encombrement ≈ 1.5 (X) × 1.4 (Y) × 3.9 (Z) m.
// Cotes : liste (flexibles 34 po, collier 3,5 po, vanne 1/2 po) ; dispositions
// estimées d'après les vues des pages 274-276 (non cotées).
import { LR, ACC, IN } from './_moteur_surpresseur.js';
import { GUARD278 } from './P278.js';

export default function P274(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, plate, bolt, boltSet, hose, ballValve, torus, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(x1 - x0, y1 - y0, z1 - z0, mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });

  // ---------------------------------------------------------------- 10 — compresseur
  P('10', api.sub('P280'), [0, 0.3, 0]);

  // ---------------------------------------------------------------- 3 — carter de courroies
  // Repère de P278 : X du moteur vers le surpresseur, Y haut, Z vers les
  // couvercles. Ici : Z → +X (couvercles côté poulie), X → (0, 0.5, −0.866)
  // (le moteur est en bas côté +Z, à 120°), Y → (0, 0.866, 0.5).
  {
    const Xg = new THREE.Vector3(0, 0.5, -0.866), Yg = new THREE.Vector3(0, 0.866, 0.5), Zg = new THREE.Vector3(1, 0, 0);
    const [ax] = GUARD278.axes ? [GUARD278.axes] : [null];
    void ax;
    const loc = new THREE.Vector3(0.315, 0.24, 0.08); // axe de la poulie du surpresseur, plan des gorges
    const M = new THREE.Matrix4().makeBasis(Xg, Yg, Zg);
    const p = new THREE.Vector3(LR.sheaveX, 0, 0).sub(loc.clone().applyMatrix4(M));
    const g = group(api.sub('P278'));
    g.quaternion.setFromRotationMatrix(M);
    g.position.copy(p);
    P('3', g, [0.35, 0, 0]);
  }

  // ---------------------------------------------------------------- 14 — admission d'air de mine
  // P314 : son +X (vers la sortie) → +Z du bloc, son +Z → −X.
  const POS14 = [0.6, 0.556, -1.36];
  const L14 = ([x, y, z]) => [POS14[0] - z, POS14[1] + y, POS14[2] + x];
  const in14 = (obj, p = [0, 0, 0], r = null) => at(group(at(obj, p, r)), POS14, [0, -Math.PI / 2, 0]);
  P('14', in14(api.sub('P314')), [0.3, 0.1, -0.3]);
  // 8 — équerre de la vanne 3 voies : plateau sous la vanne, deux joues.
  P('8', in14(group(merged([
    bx(-0.07, 0.07, -0.192, -0.186, -0.07, 0.07, 'black'),
    bx(-0.07, 0.07, -0.186, -0.12, 0.064, 0.07, 'black'),
    bx(-0.07, 0.07, -0.186, -0.12, -0.07, -0.064, 'black'),
  ], 'black'), boltSet([[-0.05, -0.186, 0.05], [0.05, -0.186, 0.05], [-0.05, -0.186, -0.05], [0.05, -0.186, -0.05]], 0.008, 0.02, 'zinc'))), [0.3, -0.1, -0.3]);
  // 2 — accouplement de l'arbre de vanne (crabot).
  P('2', in14(group(
    lathe([[0.004, -0.186], [0.016, -0.186], [0.016, -0.14], [0.004, -0.14]], 'steel', { seg: 20 }),
    at(box(0.008, 0.012, 0.034, 'steel'), [0, -0.134, 0]),
  )), [0.3, -0.05, -0.3]);
  // 12 — actionneur sous l'équerre.
  P('12', in14(api.sub('P310'), [0, -0.192, 0]), [0.3, -0.25, -0.3]);
  // 13 — purge manuelle sous le filtre 1 micron (P314 rep. 4).
  P('13', in14(api.sub('P312'), [-0.35, -0.66, -0.03]), [0.3, -0.3, -0.3]);
  // 5, 6 — cornière et collier 3,5 po du séparateur (mamelon vertical P314 rep. 11).
  P('5', in14(group(merged([
    bx(-0.82, -0.68, -0.42, -0.414, -0.12, -0.05, 'black'),
    bx(-0.82, -0.68, -0.62, -0.414, -0.126, -0.12, 'black'),
  ], 'black'), boltSet([[-0.8, -0.58, -0.126], [-0.7, -0.58, -0.126]], 0.01, 0.025, 'zinc', { axis: '-z' }))), [0.3, 0, -0.4]);
  P('6', in14(group(
    lathe([[0.046, -0.02], [0.05, -0.02], [0.05, 0.02], [0.046, 0.02]], 'zinc', { seg: 32, pos: [-0.75, -0.45, 0] }),
    at(box(0.012, 0.03, 0.06, 'zinc'), [-0.75, -0.45, -0.07]),
    boltSet([[-0.75, -0.43, -0.1], [-0.75, -0.47, -0.1]], 0.008, 0.03, 'zinc', { axis: '-z' }),
  )), [0.3, 0, -0.45]);

  // ---------------------------------------------------------------- 21 — flexibles JIC -24 × 34 po
  // Des trois départs de la croix de P314 (coudes 29, 29, 25) aux coudes
  // d'aspiration P280 rep. 10 ; tracés au-dessus du carter de courroies.
  const el10 = ACC.elbow(S, { a: 24, aType: 'orb' }).userData.out;
  const headTip = (i) => {
    const c = [0.074 + 0.045 + el10[1], 0.305 + el10[0], 0.012];
    const { a, x } = LR.cyl[i];
    return [x + c[0], c[1] * Math.cos(a) - c[2] * Math.sin(a), c[1] * Math.sin(a) + c[2] * Math.cos(a)];
  };
  const starts = [L14([1.21, -0.435, -0.2]), L14([1.296, -0.506, 0.15]), L14([1.36, -0.42, 0])]; // vers cyl. 0, 1, 2
  for (let i = 0; i < 3; i++) {
    const a = starts[i], b = headTip(i);
    const d = LR.cyl[i].a;
    const up = [b[0] + 0.02, b[1] + 0.12 * Math.cos(d), b[2] + 0.12 * Math.sin(d)];
    const pts = [a, [a[0], a[1] + 0.1, a[2]], [(a[0] + b[0]) / 2 + 0.2, Math.max(a[1], b[1]) + 0.3, (a[2] + b[2]) / 2], up, b];
    P('21', hose(pts, 0.019), [0.25, 0.25, 0]);
  }

  // ---------------------------------------------------------------- 11 — admission auxiliaire
  P('11', at(api.sub('P308'), [0.75, -0.35, -0.3], [0, Math.PI / 2, 0]), [0.3, -0.2, 0]);

  // ---------------------------------------------------------------- 9, 7, 1 — remplissage d'huile, gyrophare
  // 9 : équerre sous la bride de remplissage de P286 (dessous à y ≈ 0.268),
  // montant jusqu'à la patte +Z avant du carter ; 7 : support du gyrophare
  // boulonné en bout de l'équerre ; 1 : gyrophare rouge.
  const F = [-0.075, 0.268, 0.42];
  P('9', group(merged([
    bx(F[0] - 0.05, F[0] + 0.05, F[1] - 0.006, F[1], F[2] - 0.05, F[2] + 0.05, 'black'),
    bx(F[0] - 0.02, F[0] + 0.02, LR.footY + 0.02, F[1] - 0.006, F[2] + 0.044, F[2] + 0.05, 'black'),
    bx(F[0] - 0.02, F[0] + 0.02, LR.footY + 0.014, LR.footY + 0.02, F[2] - 0.12, F[2] + 0.05, 'black'),
  ], 'black'), boltSet([[F[0] - 0.035, F[1], F[2]], [F[0] + 0.035, F[1], F[2]]], 0.008, 0.02, 'zinc')), [0, 0.1, 0.2]);
  const B = [F[0] + 0.12, F[1] - 0.006, F[2] + 0.02];
  P('7', group(merged([
    bx(F[0] + 0.05, B[0] + 0.05, B[1] - 0.006, B[1], B[2] - 0.04, B[2] + 0.04, 'black'),
    bx(F[0] + 0.05, F[0] + 0.056, B[1] - 0.05, B[1], B[2] - 0.04, B[2] + 0.04, 'black'),
  ], 'black'), boltSet([[F[0] + 0.053, B[1] - 0.03, B[2]]], 0.008, 0.02, 'zinc', { axis: '-x' })), [0.1, 0.15, 0.2]);
  P('1', group(
    lathe([[0, 0], [0.06, 0], [0.06, 0.012], [0.05, 0.02], [0, 0.02]], 'black', { seg: 32, pos: [B[0], B[1], B[2]] }),
    lathe([[0, 0.02], [0.045, 0.02], [0.046, 0.06], [0.04, 0.1], [0.025, 0.12], [0, 0.125]], 'red', { seg: 32, pos: [B[0], B[1], B[2]] }),
    at(cyl(0.012, 0.04, 'lamp', { seg: 16 }), [B[0], B[1] + 0.07, B[2]]),
  ), [0.1, 0.3, 0.2]);

  // ---------------------------------------------------------------- détail C — purge du séparateur
  // Sous le séparateur d'eau (P314 rep. 3, bas à y ≈ −0.45), vers −Z de P314.
  const dc = [-0.54, -0.45, 0];
  P('19', in14(ACC.pipeElbow(S, 12), [dc[0], dc[1] - 0.025, dc[2]], [0, 0, Math.PI]), [0.3, -0.15, -0.3]);
  P('20', in14(ACC.nipple(S, 12, 0.05), [dc[0] - 0.025, dc[1] - 0.05, dc[2]], [0, 0, Math.PI / 2]), [0.3, -0.18, -0.3]);
  P('4', in14(ballValve(0.022, 'brass'), [dc[0] - 0.1, dc[1] - 0.05, dc[2]]), [0.3, -0.22, -0.3]);
  P('17', in14(ACC.pipeElbow(S, 8), [dc[0] - 0.15, dc[1] - 0.05, dc[2]], [0, 0, -Math.PI / 2]), [0.3, -0.26, -0.3]);
  P('18', in14(ACC.straight(S, { a: 8, b: 8 }), [dc[0] - 0.15, dc[1] - 0.085, dc[2]], [Math.PI, 0, 0]), [0.3, -0.3, -0.3]);
  // 16, 15 — coudes -12 sur les prises du filtre 1 micron (P314 rep. 4), bouchon sur l'un.
  const fp = [[-0.35, -0.25, 0.1], [-0.35, -0.35, 0.1]];
  fp.forEach((p, k) => {
    const e = ACC.elbow(S, { a: 12, b: 12 });
    P('16', in14(e, p, [-Math.PI / 2, 0, 0]), [0.3, 0, -0.35]);
    if (k === 0) {
      const tip = [p[0] + e.userData.out[0], p[1], p[2] + e.userData.out[1]];
      P('15', in14(ACC.capNut(S, 12), tip, [0, 0, -Math.PI / 2]), [0.3, 0, -0.4]);
    }
  });

  void cyl; void plate; void bolt; void torus; void IN;
  return { view: { dir: [-1.0, 0.8, 0.9] } };
}
