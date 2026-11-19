// Assistants du lot D (groupe hydraulique P007, panneaux P008, waterpack P009, pompe à eau P010).
// Tôles découpées, tôles pliées, ventilateurs et faisceaux de refroidisseurs, poignées et charnières.

/** Arc de cercle en points [x, y], de l'angle a0 à a1 (radians). */
export const arc = (x, y, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [x + r * Math.cos(a), y + r * Math.sin(a)];
});

/** Rectangle [[x, y] ×4] de centre (x, y), largeur w, hauteur h (contour de trou ou de tôle). */
export const rect = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];

/** Rectangle à coins arrondis (rayons par coin : [bas-gauche, bas-droit, haut-droit, haut-gauche]). */
export function rrect(x0, y0, x1, y1, r = [0, 0, 0, 0]) {
  const R = typeof r === 'number' ? [r, r, r, r] : r;
  const out = [];
  out.push(...(R[0] ? arc(x0 + R[0], y0 + R[0], R[0], Math.PI, 1.5 * Math.PI, 6) : [[x0, y0]]));
  out.push(...(R[1] ? arc(x1 - R[1], y0 + R[1], R[1], 1.5 * Math.PI, 2 * Math.PI, 6) : [[x1, y0]]));
  out.push(...(R[2] ? arc(x1 - R[2], y1 - R[2], R[2], 0, Math.PI / 2, 6) : [[x1, y1]]));
  out.push(...(R[3] ? arc(x0 + R[3], y1 - R[3], R[3], Math.PI / 2, Math.PI, 6) : [[x0, y1]]));
  return out;
}

/**
 * Tôle découpée : contour [[x, y], ...] dans le plan XY, trous (contours ou cercles [x, y, r]),
 * épaisseur th centrée sur z = 0.
 */
export function slab(api, outline, holes, th, mat) {
  const { THREE, S } = api;
  const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  let out = V(outline);
  if (THREE.ShapeUtils.isClockWise(out)) out = out.reverse();
  const shape = new THREE.Shape(out);
  for (const h of holes) {
    const p = new THREE.Path();
    if (typeof h[0] === 'number') p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    else {
      let q = V(h);
      if (!THREE.ShapeUtils.isClockWise(q)) q = q.reverse();
      p.setFromPoints(q);
    }
    shape.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 10 });
  geo.translate(0, 0, -th / 2);
  return S.merged([new THREE.Mesh(S.creaseNormals(geo))], mat);
}

/**
 * Tôle pliée : ligne moyenne du profil [[u, v], ...] (plan de la section), épaisseur t, extrudée sur len
 * selon la troisième direction (z local, centrée). Les plis se donnent en points d'arc (voir arc()).
 */
export function bent(api, line, t, len, mat) {
  const off = (k) => line.map((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    return [p[0] - dy * k, p[1] + dx * k];
  });
  const outline = [...off(t / 2), ...off(-t / 2).reverse()];
  return slab(api, outline, [], len, mat);
}

/** Tôle perforée (ouïes carrées en quinconce) : rectangle w × h centré, zone perforée [x0, y0, x1, y1]. */
export function perforee(api, outline, zone, pas, cote, th, mat, autres = []) {
  const holes = [...autres];
  const [x0, y0, x1, y1] = zone;
  let row = 0;
  for (let y = y0 + pas / 2; y < y1 - pas / 4; y += pas * 0.87, row++) {
    for (let x = x0 + pas / 2 + (row % 2 ? pas / 2 : 0); x < x1 - pas / 4; x += pas) holes.push(rect(x, y, cote, cote));
  }
  return slab(api, outline, holes, th, mat);
}

/**
 * Ventilateur axial (refroidisseurs 24 V) : virole, moyeu moteur, pales, grille de protection ;
 * axe selon +Z (soufflage vers +Z), diamètre d.
 */
export function ventilateur(api, d, mat = 'black') {
  const { S } = api, { at, ring, cyl, box, group, merged, torus } = S;
  const r = d / 2;
  const pales = [];
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    pales.push(at(box(r * 0.62, r * 0.32, 0.004, mat, { r: 0.01 }), [Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0], [0.45, 0, a]));
  }
  const grille = [];
  for (const k of [0.35, 0.6, 0.85]) grille.push(at(torus(r * k, 0.0018, 'black', { axis: 'z' }), [0, 0, 0.045]));
  for (let k = 0; k < 4; k++) grille.push(at(box(d * 0.95, 0.004, 0.004, 'black'), [0, 0, 0.045], [0, 0, (k * Math.PI) / 4]));
  return group(
    at(ring(r + 0.012, r, 0.06, mat, { axis: 'z', seg: 40 }), [0, 0, 0.015]),
    at(cyl(r * 0.28, 0.07, mat, { axis: 'z', seg: 28 }), [0, 0, -0.005]),
    merged(pales, mat),
    merged(grille, 'black'),
  );
}

/**
 * Faisceau de refroidisseur (ailettes et tubes) : largeur w (x), hauteur h (y), épaisseur e (z),
 * réservoirs d'extrémité en haut et en bas, cadre latéral.
 */
export function faisceau(api, w, h, e, mat = 'black') {
  const { S } = api, { at, box, merged } = S;
  const fins = [];
  const n = Math.max(6, Math.round(w / 0.012));
  for (let i = 0; i < n; i++) fins.push(at(box(0.0015, h - 0.1, e * 0.9), [-w / 2 + 0.03 + ((w - 0.06) * (i + 0.5)) / n, 0, 0]));
  const cadre = [
    at(box(w, 0.05, e, mat, { r: 0.006 }), [0, h / 2 - 0.025, 0]),
    at(box(w, 0.05, e, mat, { r: 0.006 }), [0, -h / 2 + 0.025, 0]),
    at(box(0.03, h, e, mat), [-w / 2 + 0.015, 0, 0]),
    at(box(0.03, h, e, mat), [w / 2 - 0.015, 0, 0]),
  ];
  return S.group(merged(cadre, mat), merged(fins, 'darkSteel'));
}

/** Poignée en U (tige ronde) : entraxe e, saillie s, normale selon +Z ; pieds posés en z = 0. */
export function poignee(api, e, s, r = 0.005, mat = 'steel') {
  const { S } = api;
  return S.tube([[-e / 2, 0, 0], [-e / 2, 0, s], [e / 2, 0, s], [e / 2, 0, 0]], r, mat, { sharp: true, seg: 3 });
}

/** Charnière à nœud : fût vertical (axe y) de longueur l, deux ailes ; posée sur la face z = 0, côté +Z. */
export function charniere(api, l, mat = 'steel') {
  const { S } = api, { at, cyl, box, group } = S;
  return group(at(cyl(0.007, l, mat, { axis: 'y', seg: 12 }), [0, 0, 0.008]), at(box(0.03, l, 0.002, mat), [0, 0, 0.001]));
}

/** Éclair de danger électrique (autocollant) : contour dans le plan XY, hauteur h, centré en (x, y). */
export function eclair(x, y, h) {
  const k = h / 1;
  return [[0.08, 0.5], [-0.18, 0.02], [0.02, 0.02], [-0.12, -0.5], [0.2, 0.08], [0.0, 0.08], [0.2, 0.5]].map(([u, v]) => [x + u * k, y + v * k]);
}

// ---------------------------------------------------------------------------------------------------------
// Groupe hydraulique (P007, et P008 posé à l'identité par P007) — repère local de layout.js (ROOT.PACK) :
// origine au sol sous le centre du cadre, X le long du cadre (moteur vers −X, pompes et réservoir vers +X),
// Y vers le haut, Z vers le flanc de la boîte électrique (porte droite, panneau de la jauge).
// Aucune cote au manuel : proportions mesurées sur les pages 7 et 8 (cadre ≈ 2,07 : 1,1 : 1,0 en longueur,
// largeur, hauteur), échelle tirée du moteur 444TC (hauteur d'axe 11 po [norme NEMA], capot de ventilateur
// Ø ≈ 0,53 m, 0,4 × la largeur du cadre sur la page 8) [mesure] ; même ordre de grandeur que le groupe du
// STM-1500 (2,18 × 1,12 × 1,41 m entre poteaux) [STM].
export const GP = {
  x1: 1.2, // demi-longueur hors tout des arceaux d'extrémité [mesure]
  z1: 0.61, // demi-largeur hors tout (faces extérieures des arceaux) [mesure]
  H: 1.18, // dessus des arceaux et des longerons du haut [mesure]
  t: 0.05, // tube carré 2 po du cadre [estimé]
  tr: 0.024, // arceaux en tube rond Ø 48 mm (noirs sur les dessins) [estimé]
  rb: 0.1, // rayon de cintrage des arceaux [mesure]
  base: 0.1, // dessus des patins et des traverses de la base [estimé]
  mid: 0.62, // axe des longerons et traverses intermédiaires (appui du réservoir et du transformateur) [estimé]
  xMid: -0.15, // arceau du milieu [mesure]
  postZm: [-0.75], // poteau du flanc −Z (joint porte gauche / hood cooler #1) [mesure, p. 8]
  postZp: [-0.28, 0.42], // poteaux du flanc +Z (boîte électrique / porte droite / panneau de la jauge) [mesure, p. 8]
  e: 0.003, // tôle des panneaux (3 mm) [estimé]
  get xa() { return this.x1 - this.tr; }, // axe des arceaux d'extrémité
  get za() { return this.z1 - this.tr; }, // axe des jambes des arceaux
};
