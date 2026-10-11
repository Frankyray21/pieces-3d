// P282 — Surpresseur Le Roi complet CP48501 rév. 4 (pages 282-284) : « LE ROI
// BOOSTER C/W OIL FILTER », repère 6 de P280. Le bloc nu (P288, 11) avec son
// bouchon de remplissage et sa jauge déportés (P286, 3), sa trousse de
// filtre à huile (P306, 33), une soupape de sûreté (10) et les plaques
// d'obturation d'expédition des brides de culasse (39 aspiration, 40
// refoulement, une par culasse) ; vis de patte 7/8-9 × 2 (42) et sa rondelle
// Grower (43).
// Les autres lignes reprennent des pièces des sous-ensembles (pièces de
// rechange de la liste : pistons, joints, cales, palettes, poulie, carter
// modifié…) : chacune est dessinée à sa place exacte en reprenant la pièce du
// sous-ensemble (même géométrie, même position), grossie de 0,4 % autour de
// son centre pour passer devant la pièce d'origine ; en vue éclatée, ces
// pièces sortent du bloc dans l'axe de leur montage. Correspondances :
//   2 pistons ← P304 rep. 1 (×3) ; 7 carter ← P296 rep. 1 ; 8 bague
//   d'étanchéité ← P296 rep. 2 ; 9 poulie ← P298 rep. 8 ; 12 joints de
//   cylindre ← P300 rep. 3 ; 13 ← P290 rep. 18 ; 14 ← P290 rep. 19 ; 15 ←
//   P290 rep. 16 et 32 ; 16 ← P290 rep. 35 (six à la liste pour un par
//   culasse : le second jeu double le premier) ; 17 ← P290 rep. 36 ; 18 ←
//   P290 rep. 37 ; 19-22 ← P298 rep. 4-7 ; 23 ← P304 rep. 8 ; 24 jeu de
//   segments ← P304 rep. 9 des trois pistons (un objet) ; 25 ← P304 rep. 10 ;
//   26-28 cales ← P302 rep. 4, 3, 2 (trois de chaque, empilées) ; 29, 30 ←
//   P302 rep. 8, 9 ; 31 ← P286 rep. 3 ; 32 ← P296 rep. 26 ; 1, 4, 5, 6,
//   34-37 ← P306 rep. 12, 1, 2, 4, 8, 9, 10, 11.
// Trousses 38 (plomberie) et 41 (boyaux) : sans objet propre.
// Repère : repère du bloc LR (_moteur_surpresseur.js) — origine sur l'axe du
// vilebrequin au droit du cylindre central, +X vers la poulie, Y haut, +Z =
// X × Y ; P288, P286 et P306 insérés à l'origine. Dessous des pattes à y =
// LR.footY = −0.165. Encombrement ≈ 0.48 (X) × 0.8 (Y) × 0.85 (Z) m.
import { LR, IN, MM } from './_moteur_surpresseur.js';

export default function P282(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, bolt, washer, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const crank = LR.crank;

  // Transformation d'un sous-ensemble de cylindre i dans le repère du bloc.
  const cylX = (i) => ({ pos: [LR.cyl[i].x, 0, 0], rot: [LR.cyl[i].a, 0, 0] });
  // Reprend les pièces `ref` du sous-ensemble `id` (options `opts`), placées
  // par `x` (repère du bloc) ; chacune est grossie de 0,4 % autour de son centre.
  const pick = (id, ref, opts = {}, x = null) => {
    const root = api.sub(id, opts);
    root.updateMatrixWorld(true);
    const out = [];
    for (const p of [...root.userData.parts]) {
      if (p.userData.partRef !== ref) continue;
      const c = new THREE.Box3().setFromObject(p).getCenter(new THREE.Vector3());
      // c dans le repère du sous-ensemble (racine à l'identité).
      const inner = group(p);
      inner.position.set(-c.x, -c.y, -c.z);
      const mid = group(inner);
      mid.scale.setScalar(1.004);
      mid.position.copy(c);
      const outer = group(mid);
      if (x) at(outer, x.pos, x.rot);
      out.push(outer);
    }
    return out;
  };
  // Direction d'éclatement le long de l'axe d'un cylindre.
  const along = (i, d) => [0, d * Math.cos(LR.cyl[i].a), d * Math.sin(LR.cyl[i].a)];

  // ---------------------------------------------------------------- sous-assemblages
  P('11', api.sub('P288'), [0, 0, 0]);
  P('3', api.sub('P286'), [0, 0.1, 0.25]);
  P('33', api.sub('P306'), [0, 0.15, -0.25]);

  // ---------------------------------------------------------------- pièces de rechange
  for (let i = 0; i < 3; i++) {
    const o = { crank, i };
    for (const p of pick('P304', '1', o, cylX(i))) P('2', p, along(i, 0.55));
    for (const p of pick('P304', '8', o, cylX(i))) P('23', p, along(i, 0.4));
    for (const p of pick('P304', '10', o, cylX(i))) P('25', p, [0.25, ...along(i, 0.2).slice(1)]);
    for (const p of pick('P300', '3', {}, cylX(i))) P('12', p, along(i, 0.42));
    for (const p of pick('P290', '18', {}, cylX(i))) P('13', p, along(i, 0.75));
    for (const p of pick('P290', '19', {}, cylX(i))) P('14', p, along(i, 0.7));
    for (const r of ['16', '32']) for (const p of pick('P290', r, {}, cylX(i))) P('15', p, along(i, 0.62));
    for (let k = 0; k < 2; k++) for (const p of pick('P290', '35', {}, cylX(i))) P('16', p, along(i, 0.8 + k * 0.04));
    for (const p of pick('P290', '36', {}, cylX(i))) P('17', p, along(i, 0.85));
    for (const p of pick('P290', '37', {}, cylX(i))) P('18', p, along(i, 0.5));
  }
  // 24 — jeu de segments haute pression : les segments des trois pistons.
  P('24', group([0, 1, 2].flatMap((i) => pick('P304', '9', { crank, i }, cylX(i)))), [0, 0.6, 0]);
  P('7', pick('P296', '1')[0], [0, -0.25, 0]);
  P('8', pick('P296', '2')[0], [0.3, 0, 0]);
  P('32', pick('P296', '26')[0], [0.26, 0, 0]);
  P('9', pick('P298', '8', { crank })[0], [0.42, 0, 0]);
  [['4', '19', [0.3, 0.12, 0]], ['5', '20', [0.48, 0, 0]], ['6', '21', [0.52, 0, 0]], ['7', '22', [0.56, 0, 0]]]
    .forEach(([src, ref, e]) => P(ref, pick('P298', src, { crank })[0], e));
  // 26-28 — cales de précharge : trois de chaque épaisseur, empilées contre
  // la cale d'origine du flasque arrière (P302).
  [['4', '26', 0.005], ['3', '27', 0.0075], ['2', '28', 0.02]].forEach(([src, ref, th], j) => {
    for (let k = 0; k < 3; k++) {
      const p = pick('P302', src, { crank })[0];
      p.position.x -= k * th * IN;
      P(ref, p, [-0.3 - j * 0.04 - k * 0.012, 0, 0]);
    }
  });
  for (const p of pick('P302', '8', { crank })) P('29', p, [-0.42, 0, 0]);
  for (const p of pick('P302', '9', { crank })) P('30', p, [-0.46, 0, 0]);
  P('31', pick('P286', '3')[0], [0, 0.05, 0.3]);
  [['12', '1'], ['1', '4'], ['2', '5'], ['4', '6'], ['8', '34'], ['9', '35'], ['10', '36'], ['11', '37']]
    .forEach(([src, ref]) => pick('P306', src).forEach((o) => P(ref, o, [0, 0.25, -0.3])));

  // ---------------------------------------------------------------- 10 — soupape de sûreté
  // Soupape à ressort laiton 1/2 NPT, anneau de manœuvre, vissée dans le
  // bossage avant du dessus du carter (côté −Z, entre poulie et cylindre −60°).
  {
    const [x, y, z] = [0.085, 0.14, -0.075];
    P('10', group(
      lathe([[0, 0], [0.01, 0], [0.01, 0.012], [0.016, 0.014], [0.016, 0.022], [0.013, 0.026], [0.013, 0.05], [0.009, 0.056], [0.004, 0.06], [0, 0.06]], 'brass', { seg: 20, pos: [x, y, z] }),
      at(S.nut(0.022, 0.008, 'brass'), [x, y + 0.018, z]),
      at(S.torus(0.008, 0.0015, 'steel', { axis: 'x' }), [x, y + 0.07, z]),
    ), [0.12, 0.15, -0.1]);
  }

  // ---------------------------------------------------------------- 39, 40 — plaques d'expédition
  // Plaques losangées en acier sur les brides de raccord des culasses (face
  // extérieure à ±0.074 du repère de cylindre, y = 0.305), deux vis chacune.
  const shipPlate = (sx) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) { const a = Math.PI / 2 * 0 + (k / 12) * Math.PI; pts.push([0.016 * Math.cos(a - Math.PI / 2 * sx * 0 + Math.PI / 2), 0.025 + 0.016 * Math.sin(a)]); }
    const shape = new THREE.Shape();
    shape.moveTo(-0.017, 0.025); shape.absarc(0, 0.025, 0.017, Math.PI, 0, true);
    shape.lineTo(0.022, 0); shape.absarc(0, -0.025, 0.017, 0, -Math.PI, true); shape.lineTo(-0.022, 0); shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.003, bevelEnabled: false, curveSegments: 6 });
    g.rotateY(sx * Math.PI / 2);
    const m = new THREE.Mesh(g, box(0.01, 0.01, 0.01, 'red').material);
    m.position.set(sx * 0.074, 0.305, 0);
    void pts;
    const bolts = [-1, 1].map((s) => at(bolt(0.008, 0.016, 'zinc', { axis: sx > 0 ? 'x' : '-x' }), [sx * 0.077, 0.305, s * 0.025]));
    return group(m, ...bolts);
  };
  for (let i = 0; i < 3; i++) {
    P('39', at(group(shipPlate(-1)), cylX(i).pos, cylX(i).rot), [-0.12, ...along(i, 0.3).slice(1)]);
    P('40', at(group(shipPlate(1)), cylX(i).pos, cylX(i).rot), [0.12, ...along(i, 0.3).slice(1)]);
  }

  // ---------------------------------------------------------------- 42, 43 — vis de patte 7/8 po
  {
    const [x, z] = [LR.feetX[1], LR.feetZ];
    const yt = LR.footY + 0.02;
    P('43', at(washer(0.875 * IN * 0.95, 0.875 * IN * 0.53, 0.875 * IN * 0.25, 'zinc'), [x, yt + 0.0027, z]), [0, 0.1, 0.05]);
    P('42', at(bolt(0.875 * IN, 2 * IN, 'zinc'), [x, yt + 0.0055, z]), [0, 0.16, 0.05]);
  }

  void cyl; void merged; void MM;
  return { view: { dir: [1.0, 0.7, 1.15] } };
}
