// P172 — Actionneur rotatif « ROTARY ACTUATOR LARGE » CM44400 rév. 23 (dessins
// pages 172 et 174, identiques : coupe B-B dans l'axe de l'arbre, coupe A-A
// dans le plan des crémaillères, élévation). Actionneur à pignon et double
// crémaillère : un carter cubique (6) traversé par deux alésages parallèles ;
// dans chacun coulisse une crémaillère (8) à deux pistons (10), guidée sur
// son dos par une réglette de portée (9) que serrent trois vis de réglage
// (5, contre-écrou 36, entretoise 1, joint torique 2). De chaque côté du
// carter, deux tubes de vérin (11) jumelés, tenus par des brides (12) à
// clavettes fendues (15) ; au bout, les fonds RH (13) et LH (14) portent
// chacun une valve d'équilibrage (23). L'arbre (7), pignon taillé dans la
// masse, tourne sur deux roulements à rouleaux coniques (cônes 24, cuvettes
// 28) entre le fond fermé (16) et le couvercle ouvert (17) ; au-dessus, la
// bague de serrage fendue (31 moitié taraudée, 32 moitié alésée, deux vis
// CHC 38) et la bride de fixation (30) clavetée (33), serrées sur le cône de
// l'arbre par la rondelle d'arrêt (18) et ses trois vis CHC 1 po (39).
// Repère : origine au centre du carter (sur l'axe de l'arbre, à mi-chemin des
// deux alésages) ; +Y le long de l'arbre vers la bride de fixation 30 (face
// de sortie, contre la plaque de l'actionneur de P170), X le long des
// crémaillères et des tubes, Z entre les deux alésages (crémaillère « haute »
// de la coupe A-A vers +Z). Axes des tubes à z = ±0.083 m ; face de la bride
// 30 à y = 0.297 m ; fond fermé à y = -0.16 m.
// Encombrement ≈ 1.42 (X, des fonds) × 0.53 (Y, de -0.175 aux vis de la
// rondelle d'arrêt à 0.355) × 0.37 (Z, valves d'équilibrage comprises) m.
// Cotes : visserie d'après la liste (5/8 UNF, 3/4 UNC, 1 UNC, clavette carrée
// 1 1/4 × 5 1/4 po) ; le reste d'après les proportions des trois vues
// (tubes Ø 5 po, alésage 4 1/4 po, carter 0.33 × 0.285 × 0.32 m).

const IN = 0.0254;

// Cotes exportées pour l'assemblage dans P170.
export const ACT172 = {
  tubeZ: 0.083, // axes des deux alésages (±Z)
  capX: 0.71, // face extérieure des fonds (±X)
  body: [0.33, 0.285, 0.32], // carter (X, Y, Z)
  flangeY: 0.297, // face de la bride de fixation 30
  flangeR: 0.16, // rayon de la bride 30
  boltR: 0.135, // cercle des vis 37
  bottomY: -0.16, // dessous du fond fermé 16
};

// ---------------------------------------------------------------- visserie
// Fabriques légères (tête vers +Y, dessous de tête à y = 0, tige vers -Y),
// exportées pour les assemblages voisins (P170).

/** Vis à tête hexagonale (H) Ø d × len, chanfrein de tête, bout chanfreiné. */
export function hexScrew(S, d, len, mat = 'zinc') {
  const R = (0.75 * d) / Math.cos(Math.PI / 6), h = 0.64 * d, r = d / 2, c = d * 0.12;
  return S.merged([
    S.lathe([[0, 0], [R, 0], [R, h - c], [R - c * 1.2, h], [0, h]], mat, { seg: 6 }),
    S.lathe([[0, -len], [r * 0.8, -len], [r, -len + r * 0.2], [r, 0.0005], [0, 0.0005]], mat, { seg: 10 }),
  ], mat);
}

/** Vis à tête cylindrique à six-pans creux (CHC) Ø d × len. */
export function socketScrew(S, d, len, mat = 'blackOxide') {
  const R = 0.75 * d, h = d, r = d / 2, k = (0.36 * d) / Math.cos(Math.PI / 6);
  return S.merged([
    S.lathe([[0, 0], [R, 0], [R, h], [k, h], [k, h * 0.55], [0, h * 0.45]], mat, { seg: d < 0.018 ? 9 : 12 }),
    S.lathe([[0, -len], [r, -len], [r, 0.0005], [0, 0.0005]], mat, { seg: 7 }),
  ], mat);
}

/** Rondelle (plate, Nord-Lock ou à haut collet) Ø d : couronne de 0 à t. */
export function washerD(S, d, mat = 'zinc', { od = 2 * d, t = 0.16 * d } = {}) {
  const ro = od / 2, ri = d * 0.53;
  return S.lathe([[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]], mat, { seg: d < 0.018 ? 9 : 12 });
}

/** Écrou hexagonal (surplat af, hauteur h) taraudé Ø d, face d'appui à y = 0, vers +Y. */
export function hexNut(S, d, af, h, mat = 'zinc') {
  const R = af / 2 / Math.cos(Math.PI / 6), c = h * 0.15, ri = d * 0.45;
  return S.lathe([[ri, 0], [R - c, 0], [R, c], [R, h - c], [R - c, h], [ri, h], [ri, 0]], mat, { seg: 6 });
}

/** Pose un objet construit le long de +Y en p, son +Y tourné vers dir. */
export function pose(THREE, obj, p, dir = [0, 1, 0]) {
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
  g.position.set(...p);
  return g;
}

export default function P172(api) {
  const { THREE, S } = api;
  const { lathe, box, plate, gear, extrude, merged, creaseNormals, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => pose(THREE, obj, p, dir);
  const [BX, BY, BZ] = ACT172.body;
  const HX = BX / 2, HY = BY / 2, HZ = BZ / 2;
  const TZ = ACT172.tubeZ;
  const PAINT = 'grey';
  // Joint torique léger : section hexagonale révolutionnée (axe y, ou x).
  const oring = (R, r, axis) => lathe(Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [R + r * Math.cos(a), r * Math.sin(a)];
  }), 'rubber', { axis: axis === 'x' ? 'x' : 'y', seg: axis === 'x' ? 24 : 12 });

  // Extrusion selon Y d'un contour [[x, z], …] de y0 à y1 (arêtes cassées).
  const slabY = (pts, y0, y1, mat) => {
    const m = extrude(pts.map(([x, z]) => [x, -z]), y1 - y0, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = (y0 + y1) / 2;
    m.geometry = creaseNormals(m.geometry);
    return m;
  };
  // Bride de tube : plaque 0.19 (Y) × 0.158 (Z) × 0.035 (X), coins abattus,
  // alésage du tube ; extrusion légère selon X.
  const flange = () => {
    const w = 0.095, d = 0.079, c = 0.008;
    const shape = new THREE.Shape([[-w + c, -d], [w - c, -d], [w, -d + c], [w, d - c], [w - c, d], [-w + c, d], [-w, d - c], [-w, -d + c]].map(([y, z]) => new THREE.Vector2(y, z)));
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.0637, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: FT, bevelEnabled: false, curveSegments: 20 });
    geo.translate(0, 0, -FT / 2);
    // (a, b, c) → (x = c, y = a, z = b) : contour dans le plan YZ, épaisseur selon X.
    geo.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
    return merged([new THREE.Mesh(geo)], PAINT);
  };

  // ---------------------------------------------------------------- 6 — carter
  // Bloc usiné 0.33 × 0.285 × 0.32 aux arêtes adoucies ; sur chaque face ±Z,
  // le bossage rond Ø 190 mm des vis de réglage et, en haut à gauche, le
  // bouchon d'orifice (cercle de l'élévation) ; huit taraudages borgnes
  // suggérés par des bouchons affleurants.
  const housing = [box(BX, BY, BZ, PAINT, { r: 0.004 })];
  const plugs = [];
  for (const s of [-1, 1]) {
    housing.push(at(lathe([[0, 0], [0.095, 0], [0.095, 0.004], [0.093, 0.006], [0, 0.006]], PAINT, { seg: 40 }), [0, 0, s * HZ], [s * Math.PI / 2, 0, 0]));
    plugs.push(at(lathe([[0, 0], [0.021, 0], [0.021, 0.004], [0.019, 0.006], [0, 0.006]], 'steel', { seg: 6 }), [-0.098, 0.085, s * HZ], [s * Math.PI / 2, 0, 0]));
    for (const [x, y] of [[-0.07, 0.11], [0.07, 0.11], [-0.11, 0.035], [0.11, 0.035], [-0.11, -0.04], [0.11, -0.04], [-0.07, -0.115], [0.07, -0.115]]) {
      plugs.push(at(lathe([[0, 0], [0.0075, 0], [0.0075, 0.0008], [0, 0.0008]], 'darkSteel', { seg: 10 }), [x, y, s * HZ], [s * Math.PI / 2, 0, 0]));
    }
  }
  P('6', group(merged(housing, PAINT), merged(plugs, 'darkSteel')), [0, 0, 0]);

  // ---------------------------------------------------------------- 7 — arbre à pignon
  // Portées de roulement Ø 100 mm, pignon de 20 dents (Ø de tête 132 mm,
  // largeur 120 mm) taillé dans la masse, cône de serrage (Ø 100 → 92) en
  // sortie, bout plat percé de trois taraudages 1 po pour la rondelle 18.
  const shaft = group(
    lathe([
      [0, -0.138], [0.046, -0.138], [0.05, -0.134], [0.05, 0.16], [0.0495, 0.172],
      [0.046, 0.295], [0.044, 0.297], [0, 0.297],
    ], 'steel', { seg: 36 }),
    gear(0.0525, 0.066, 20, 0.12, 'steel', { axis: 'y', hole: 0.045 }),
  );
  P('7', shaft, [0, 0, 0]);

  // ---------------------------------------------------------------- roulements
  // Cône (24) : bague intérieure à collet et rouleaux coniques ; cuvette (28) :
  // bague extérieure à piste conique, emmanchée dans le carter.
  const cone = (s) => {
    const y0 = s * 0.085, y1 = s * 0.135, l = (a) => y0 + (y1 - y0) * a;
    const ring = lathe(s > 0
      ? [[0.05, l(0)], [0.072, l(0)], [0.072, l(0.12)], [0.066, l(0.15)], [0.062, l(0.9)], [0.066, l(0.9)], [0.066, l(1)], [0.05, l(1)], [0.05, l(0)]]
      : [[0.05, l(1)], [0.066, l(1)], [0.066, l(0.9)], [0.062, l(0.9)], [0.066, l(0.15)], [0.072, l(0.12)], [0.072, l(0)], [0.05, l(0)], [0.05, l(1)]],
    'steel', { seg: 32 });
    const rollers = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, rr = 0.073;
      const m = rod([Math.cos(a) * (rr + 0.003), l(0.18), Math.sin(a) * (rr + 0.003)], [Math.cos(a) * (rr - 0.004), l(0.86), Math.sin(a) * (rr - 0.004)], 0.0072);
      rollers.push(m);
    }
    return group(ring, merged(rollers, 'chrome'));
  };
  const rod = (a, b, r) => S.rod(a, b, r, 'chrome', 10);
  const cup = (s) => {
    const y0 = s * 0.085, y1 = s * 0.135;
    return lathe(s > 0
      ? [[0.081, y0], [0.097, y0], [0.097, y1], [0.075, y1], [0.081, y0]]
      : [[0.075, y1], [0.097, y1], [0.097, y0], [0.081, y0], [0.075, y1]],
    'steel', { seg: 36 });
  };
  for (const s of [1, -1]) {
    P('24', cone(s), [0, s * 0.32, 0]);
    P('28', cup(s), [0, s * 0.24, 0]);
    // 20 — entretoise entre le pignon et le cône
    P('20', lathe(s > 0
      ? [[0.05, 0.061], [0.062, 0.061], [0.062, 0.084], [0.05, 0.084], [0.05, 0.061]]
      : [[0.05, -0.084], [0.062, -0.084], [0.062, -0.061], [0.05, -0.061], [0.05, -0.084]], 'darkSteel', { seg: 28 }), [0, s * 0.4, 0]);
  }
  // 19 — entretoise au-dessus du cône haut ; 26 — joint Polypak dans le couvercle
  P('19', lathe([[0.0502, 0.136], [0.064, 0.136], [0.064, 0.156], [0.0502, 0.156], [0.0502, 0.136]], 'darkSteel', { seg: 28 }), [0, 0.5, 0]);
  P('26', lathe([[0.0498, 0.159], [0.061, 0.159], [0.061, 0.17], [0.056, 0.17], [0.054, 0.166], [0.0498, 0.17], [0.0498, 0.159]], 'blue', { seg: 28 }), [0, 0.58, 0]);

  // ---------------------------------------------------------------- 16, 17 — fond fermé et couvercle ouvert
  const capPts = (() => {
    const pts = [];
    for (const x of [-0.14, -0.047, 0.047, 0.14]) for (const z of [-0.135, 0.135]) pts.push([x, z]);
    for (const x of [-0.14, 0.14]) for (const z of [-0.045, 0.045]) pts.push([x, z]);
    return pts;
  })();
  const yTop = HY + 0.001, yBot = -HY - 0.001; // cales 21 (1 mm) entre carter et couvercles
  const open = at(plate(0.32, 0.31, 0.029, PAINT, { holes: [[0, 0, 0.0625]], r: 0.006 }), [0, yTop + 0.0145, 0]);
  P('17', group(open), [0, 0.42, 0]);
  const closed = at(plate(0.32, 0.31, 0.016, PAINT, { r: 0.006 }), [0, yBot - 0.008, 0]);
  P('16', group(closed), [0, -0.42, 0]);
  // 21 — jeux de cales : sous le couvercle, sur le fond, sous la rondelle d'arrêt
  const shim = (y, ri, ro) => lathe([[ri, y], [ro, y], [ro, y + 0.001], [ri, y + 0.001], [ri, y]], 'zinc', { seg: 36 });
  P('21', shim(HY, 0.063, 0.115), [0, 0.37, 0]);
  P('21', shim(-HY - 0.001, 0.04, 0.115), [0, -0.37, 0]);
  P('21', shim(0.297, 0.03, 0.06), [0, 0.86, 0]);

  // 35 + 43 — vis H 5/8 UNF × 2 1/4 et rondelles du couvercle ouvert
  const yO = yTop + 0.029;
  for (const [x, z] of capPts) {
    P('43', at(washerD(S, 0.625 * IN, 'zinc', { od: 1.31 * IN, t: 0.095 * IN }), [x, yO, z]), [0, 0.5, 0]);
    P('35', at(hexScrew(S, 0.625 * IN, 2.25 * IN), [x, yO + 0.095 * IN, z]), [0, 0.6, 0]);
  }
  // 34 + 40 — vis CHC 5/8 UNF × 1 3/4 et rondelles à haut collet du fond fermé (têtes en bas)
  const yC = yBot - 0.016;
  const hc58 = () => washerD(S, 0.625 * IN, 'darkSteel', { od: 1.07 * IN, t: 0.16 * IN });
  for (const [x, z] of capPts) {
    P('40', put(hc58(), [x, yC, z], [0, -1, 0]), [0, -0.5, 0]);
    P('34', put(socketScrew(S, 0.625 * IN, 1.75 * IN), [x, yC - 0.16 * IN, z], [0, -1, 0]), [0, -0.6, 0]);
  }
  // 3 — graisseurs 1/8 NPT : deux sous le fond, deux sur le couvercle ; 4 — bouchon reniflard au centre du fond
  const nipple = () => merged([
    lathe([[0, 0], [0.0055, 0], [0.0055, 0.006], [0, 0.006]], 'brass', { seg: 6 }),
    lathe([[0, 0.006], [0.0035, 0.006], [0.0035, 0.013], [0.0045, 0.0145], [0.0035, 0.018], [0, 0.0185]], 'brass', { seg: 12 }),
  ], 'brass');
  P('3', put(nipple(), [-0.085, yC, 0], [0, -1, 0]), [0, -0.3, 0]);
  P('3', put(nipple(), [0.085, yC, 0], [0, -1, 0]), [0, -0.3, 0]);
  P('3', at(nipple(), [0, yO, 0.14]), [0, 0.3, 0.05]);
  P('3', at(nipple(), [0, yO, -0.14]), [0, 0.3, -0.05]);
  P('4', put(group(
    lathe([[0, 0], [0.011, 0], [0.011, 0.007], [0, 0.007]], 'zinc', { seg: 6 }),
    lathe([[0, 0.007], [0.012, 0.007], [0.012, 0.011], [0.009, 0.016], [0, 0.017]], 'brass', { seg: 18 }),
  ), [0, yC, 0], [0, -1, 0]), [0, -0.3, 0]);

  // ---------------------------------------------------------------- 8, 9, 10 — crémaillères, réglettes, pistons
  // Crémaillère : barre 0.71 × 0.064 (Y) × 0.067 (Z), 38 dents au pas du
  // pignon (18,5 mm) sur la face tournée vers l'arbre.
  const PITCH = (2 * Math.PI * 0.059) / 20;
  for (const s of [1, -1]) {
    const pts = [];
    const L = 0.355, zt = 0.053, zr = 0.066, zb = 0.12;
    const n = Math.floor((2 * L - 0.04) / PITCH);
    const x0 = -(n * PITCH) / 2;
    pts.push([-L, zb], [-L, zr]);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * PITCH;
      pts.push([x, zr], [x + PITCH * 0.2, zt], [x + PITCH * 0.5, zt], [x + PITCH * 0.7, zr]);
    }
    pts.push([L, zr], [L, zb]);
    // Contour dans le sens trigonométrique en (x, z) ; miroir pour la crémaillère basse.
    const outline = (s > 0 ? pts.slice().reverse() : pts.map(([x, z]) => [x, -z]));
    const rack = slabY(outline, -0.032, 0.032, 'darkSteel');
    P('8', group(rack), [0, 0, s * 0.3]);
    // 9 — réglette de portée bronze sur le dos de la crémaillère, sous les vis de réglage
    P('9', at(box(0.2, 0.06, 0.012, 'brass', { r: 0.002 }), [0, 0, s * 0.127]), [0, 0, s * 0.42]);
    for (const e of [-1, 1]) {
      // 10 — piston au bout de la crémaillère : deux gorges de bague d'usure, gorge de joint au centre
      const xc = e * 0.391;
      const piston = lathe([
        [0, -0.036], [0.0525, -0.036], [0.0535, -0.034], [0.0535, -0.03], [0.05, -0.03], [0.05, -0.02], [0.0535, -0.02],
        [0.0535, -0.008], [0.048, -0.008], [0.048, 0.008], [0.0535, 0.008], [0.0535, 0.02], [0.05, 0.02], [0.05, 0.03],
        [0.0535, 0.03], [0.0535, 0.034], [0.0525, 0.036], [0, 0.036],
      ], 'steel', { axis: 'x', seg: 18 });
      P('10', at(piston, [xc, 0, s * TZ]), [e * 0.12, 0, s * 0.3]);
      // 25 — bagues d'usure ; 22 — joint de piston
      for (const d of [-0.025, 0.025]) {
        P('25', at(lathe([[0.0502, -0.005], [0.054, -0.005], [0.054, 0.005], [0.0502, 0.005], [0.0502, -0.005]], 'cream', { axis: 'x', seg: 18 }), [xc + d * e, 0, s * TZ]), [e * (0.2 + (d * e > 0 ? 0.06 : 0)), 0, s * 0.3]);
      }
      P('22', at(lathe([[0.0482, -0.0078], [0.054, -0.0078], [0.054, 0.0078], [0.0482, 0.0078], [0.0482, -0.0078]], 'rubber', { axis: 'x', seg: 18 }), [xc, 0, s * TZ]), [e * 0.23, 0, s * 0.3]);
      // 29 — goupille élastique 1/4 × 2 po qui lie le piston à la crémaillère
      P('29', at(lathe([[0.0028, -0.0254], [0.0032, -0.0246], [0.0032, 0.0246], [0.0028, 0.0254], [0.0024, 0.0254], [0.0024, -0.0254], [0.0028, -0.0254]], 'steel', { seg: 10 }), [e * 0.345, 0, s * (TZ + 0.025)]), [e * 0.05, 0.12, s * 0.3]);
    }
  }

  // ---------------------------------------------------------------- 5, 1, 2, 36 — vis de réglage des réglettes
  // Trois par face ±Z, en ligne selon X (élévation) : vis à six-pans creux
  // 3/4-16, entretoise à gorge (1), joint torique 2-116 (2), contre-écrou (36).
  const zF = HZ + 0.006; // face du bossage
  for (const s of [1, -1]) {
    for (const x of [-0.06, 0, 0.06]) {
      const p = (z) => [x, 0, s * z];
      const d = [0, 0, s];
      P('5', put(lathe([
        [0, 0.133], [0.0085, 0.133], [0.0095, 0.135], ...S.thread(0.0095, 0.135, 0.19, { pitch: IN / 16, maxTurns: 3 }),
        [0.0085, 0.192], [0.0055, 0.192], [0.0055, 0.184], [0, 0.183],
      ].map(([r, y]) => [r, y - 0.133]), 'steel', { seg: 10 }), p(0.133), d), [0, 0, s * 0.62]);
      P('1', put(washerD(S, 0.75 * IN, 'zinc', { od: 0.035, t: 0.006 }), p(zF), d), [0, 0, s * 0.72]);
      P('2', put(oring(0.0125, 0.0016, 'x0'), p(zF + 0.003), d), [0, 0, s * 0.77]);
      P('36', put(hexNut(S, 0.75 * IN, 1.125 * IN, 0.41 * IN), p(zF + 0.006), d), [0, 0, s * 0.84]);
    }
  }

  // ---------------------------------------------------------------- 11, 12, 15, 27 — tubes, brides, clavettes, joints
  const XI = HX, XO = 0.63; // face extérieure de bride intérieure / intérieure de bride extérieure
  const FT = 0.035; // épaisseur des brides
  const XC = 0.665; // appui des fonds
  const flangePts = [];
  for (const y of [-0.08, 0.08]) for (const dz of [-0.06, -0.02, 0.02, 0.06]) flangePts.push([y, dz]);
  for (const e of [-1, 1]) {
    for (const s of [1, -1]) {
      const z = s * TZ;
      // 11 — tube Ø 5 po × 0.25, engagé dans le carter et dans le fond
      P('11', at(S.shell(0.0635, 0.054, XC - 0.15, PAINT, { axis: 'x' }), [e * (0.15 + XC) / 2, 0, z]), [e * 0.3, 0, 0]);
      // 12 — brides (0.19 × 0.16 × 0.035) intérieure et extérieure
      const fl = (x) => at(flange(), [x, 0, z]);
      P('12', fl(e * (XI + FT / 2 + 0.001)), [e * 0.42, 0, 0]);
      P('12', fl(e * (XO + FT / 2)), [e * 0.48, 0, 0]);
      // 15 — clavettes fendues dans les gorges du tube, contre les brides
      const key = (x) => at(lathe([[0.0605, -0.005], [0.07, -0.005], [0.071, -0.004], [0.071, 0.004], [0.07, 0.005], [0.0605, 0.005], [0.0605, -0.005]], 'darkSteel', { axis: 'x', seg: 18 }), [x, 0, z]);
      P('15', key(e * (XI + FT + 0.0065)), [e * 0.36, 0, s * 0.05]);
      P('15', key(e * (XO - 0.0055)), [e * 0.4, 0, s * 0.05]);
      // 27 — joints toriques des bouts de tube (carter, fond)
      P('27', at(oring(0.06, 0.0022, 'x'), [e * 0.155, 0, z]), [e * 0.2, 0, s * 0.08]);
      P('27', at(oring(0.06, 0.0022, 'x'), [e * 0.66, 0, z]), [e * 0.55, 0, s * 0.08]);
      // 34 + 40 — vis CHC des brides intérieures (vers le carter) et des fonds (vers la bride extérieure)
      for (const [y, dz] of flangePts) {
        const xi = e * (XI + FT + 0.001);
        P('40', put(hc58(), [xi, y, z + dz], [e, 0, 0]), [e * 0.5, 0, 0]);
        P('34', put(socketScrew(S, 0.625 * IN, 1.75 * IN), [xi + e * 0.16 * IN, y, z + dz], [e, 0, 0]), [e * 0.6, 0, 0]);
        const xo = e * (XC + 0.045);
        P('40', put(hc58(), [xo, y, z + dz], [e, 0, 0]), [e * 0.66, 0, 0]);
        P('34', put(socketScrew(S, 0.625 * IN, 1.75 * IN), [xo + e * 0.16 * IN, y, z + dz], [e, 0, 0]), [e * 0.76, 0, 0]);
      }
      // 13 / 14 — fonds : RH en bas à gauche et en haut à droite (coupe A-A), LH à l'opposé
      const ref = (e < 0) === (s < 0) ? '13' : '14';
      const cap = group(
        at(box(0.045, 0.19, 0.158, PAINT, { r: 0.005 }), [0, 0, 0]),
        at(lathe([[0, 0], [0.054, 0], [0.054, 0.012], [0.052, 0.014], [0, 0.014]], PAINT, { axis: 'x', seg: 36 }), [-e * 0.0225 - e * 0.014, 0, 0], e > 0 ? null : [0, 0, Math.PI]),
        // bossage d'orifice SAE sur la face extérieure, bouchon six-pans
        at(lathe([[0, 0], [0.012, 0], [0.012, 0.008], [0.01, 0.01], [0, 0.01]], 'zinc', { seg: 6 }), [0, 0.05, s * 0.079], [s * Math.PI / 2, 0, 0]),
      );
      P(ref, at(cap, [e * (XC + 0.0225), 0, z]), [e * 0.56, 0, 0]);
      // 23 — valve d'équilibrage vissée dans la face ±Z du fond : six-pans 1 1/8, corps, vis de réglage et contre-écrou
      const valve = group(
        merged([
          lathe([[0, 0], [0.0165, 0], [0.0165, 0.016], [0.014, 0.019], [0, 0.019]], 'zinc', { seg: 6 }),
          lathe([[0, 0.019], [0.012, 0.019], [0.012, 0.04], [0.0105, 0.042], [0, 0.042]], 'zinc', { seg: 20 }),
          lathe([[0, 0.042], [0.0095, 0.042], [0.0095, 0.048], [0, 0.048]], 'zinc', { seg: 6 }),
        ], 'zinc'),
        lathe([[0, 0.048], [0.0035, 0.048], [0.0035, 0.06], [0, 0.06]], 'steel', { seg: 10 }),
      );
      P('23', put(valve, [e * (XC + 0.0225), -0.02, z + s * 0.079], [0, 0, s]), [e * 0.56, 0, s * 0.18]);
    }
  }

  // ---------------------------------------------------------------- 31, 32 — bague de serrage fendue
  // Moitiés en D (fente dans le plan x = 0, 1 mm de jour) : col Ø 240 de
  // y = 0.1725 à 0.225, collerette Ø 320 de 0.225 à 0.262 ; serrées par deux
  // vis CHC 3/4 × 2 1/4 (38) tangentes, têtes noyées dans la moitié alésée.
  const halfRing = (ro, ri, side) => {
    const pts = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / n;
      pts.push([side * (0.0005 + Math.cos(a) * ro), Math.sin(a) * ro]);
    }
    for (let i = n; i >= 0; i--) {
      const a = -Math.PI / 2 + (Math.PI * i) / n;
      pts.push([side * (0.0005 + Math.cos(a) * ri), Math.sin(a) * ri]);
    }
    return side > 0 ? pts : pts.reverse();
  };
  const collar = (side) => merged([
    slabY(halfRing(0.12, 0.0475, side), yO, 0.225, PAINT),
    slabY(halfRing(0.16, 0.0465, side), 0.225, 0.262, PAINT),
  ], PAINT);
  P('31', group(collar(1)), [0.28, 0.46, 0]);
  P('32', group(collar(-1)), [-0.28, 0.46, 0]);
  for (const z of [-0.11, 0.11]) {
    P('41', put(washerD(S, 0.75 * IN, 'darkSteel', { od: 1.25 * IN, t: 0.19 * IN }), [-0.035, 0.2435, z], [-1, 0, 0]), [-0.42, 0.46, 0]);
    P('38', put(socketScrew(S, 0.75 * IN, 2.25 * IN), [-0.035 - 0.19 * IN, 0.2435, z], [-1, 0, 0]), [-0.52, 0.46, 0]);
  }
  // 33 — clavette carrée 1 1/4 × 5 1/4 po entre l'arbre, la bague et la bride
  P('33', at(box(1.25 * IN, 5.25 * IN, 1.25 * IN, 'steel', { r: 0.001 }), [0, 0.297 - 2.625 * IN, 0.046 + 0.4 * IN]), [0, 0.62, 0.12]);

  // ---------------------------------------------------------------- 30 — bride de fixation
  // Disque Ø 320 × 35 percé au centre ; douze vis H 3/4 × 2 1/2 (37) et
  // rondelles (44) la serrent sur la collerette de la bague.
  const holes = [[0, 0, 0.047]];
  P('30', group(at(plate(0.32, 0.32, 0.035, PAINT, { holes, r: 0.16 }), [0, 0.2795, 0])), [0, 0.7, 0]);
  const yF = 0.297;
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    const x = Math.cos(a) * ACT172.boltR, z = Math.sin(a) * ACT172.boltR;
    P('44', at(washerD(S, 0.75 * IN, 'zinc', { od: 1.47 * IN, t: 0.134 * IN }), [x, yF, z]), [0, 0.86, 0]);
    P('37', at(hexScrew(S, 0.75 * IN, 2.5 * IN), [x, yF + 0.134 * IN, z]), [0, 0.98, 0]);
  }

  // ---------------------------------------------------------------- 18 — rondelle d'arrêt et ses vis 39 / rondelles 42
  const yR = 0.298;
  P('18', lathe([[0, yR], [0.063, yR], [0.065, yR + 0.002], [0.065, yR + 0.016], [0.063, yR + 0.018], [0, yR + 0.018]], 'steel', { seg: 40 }), [0, 0.95, 0]);
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
    const x = Math.cos(a) * 0.03, z = Math.sin(a) * 0.03;
    P('42', at(washerD(S, 1.0 * IN, 'darkSteel', { od: 1.6 * IN, t: 0.2 * IN }), [x, yR + 0.018, z]), [0, 1.06, 0]);
    P('39', at(socketScrew(S, 1.0 * IN, 2.0 * IN), [x, yR + 0.018 + 0.2 * IN, z]), [0, 1.18, 0]);
  }

  return { view: { dir: [0.9, 0.75, 1.1] } };
}
