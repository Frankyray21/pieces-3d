// P012 — Finition CX036924 rév. 0 « CLTR ASSY, FINISHING DU311-TVK 10680 »
// (page 12 : « NO ILLUSTRATION AVAILABLE »), repère 6 de la vue générale
// P010. Décalques de sécurité, trousses d'étiquettes (3 → P014) et de
// décalques ISO (7 → P020), sangles des faisceaux de boyaux.
// Repère : celui de la machine P010 (frame.js, machine.js) — X vers l'avant
// (côté avance), Y vers le haut, +Z côté enrouleur ; pont du porteur à
// y = 0.76, mât dressé de x = 2.62 à 3.04 (pied à y = 0.6). P010 insère P012
// à l'origine, sans rotation : at(api.sub('P012'), [0, 0, 0]) ; P014 et P020
// sont insérés ici de même.
// Encombrement (avec P014 et P020) : x −2.04 à 3.49, y 0.58 à 3.95,
// z −0.70 à 0.74.
// Faute de dessin, les emplacements sont estimés :
//  1 — danger poussières (85 × 140 mm, bandeau DANGER) : flanc +Z du mât, en bas,
//      près du centreur et du dépoussiérage ;
//  2 — émissions diesel : face +Z du moteur ;
//  8 — aptitude en pente : longeron +Z, à l'arrière, près du banc de translation ;
//  9 — procédure d'essai des freins : face +Z du réservoir hydraulique, sous
//      le banc de translation ;
//  4 / 5 / 6 — sangles (8 po ×12, 20 po ×12, sangles caoutchouc ×15) : sur
//      les boyaux de l'avance tels que feed.js les trace (repère P032 placé
//      par machine.js : pied du mât en (2.83, 0.6, 0), +Z du mât vers +X) —
//      boucle de boyaux de la tête (39, Ø 32 mm) pour les 8 po, boyaux d'air
//      2 po (45, 46, 47, Ø 66 mm) pour les 20 po et les sangles caoutchouc,
//      en alternance. Écart : à reprendre si les boyaux de l'avance changent
//      de tracé (P032 non encore repris dans parts/).

import { etiquettes } from './_glissiere_options.js';

const DECK = 0.76;
const FEED = { x: 2.83, y: 0.6 }; // pied du mât (machine.js)
// Repère du mât (feed.js) → repère machine : rotation de +90° autour de Y.
const toM = ([x, y, z]) => [FEED.x + z, FEED.y + y, -x];

// Tracés des boyaux de l'avance (feed.js, repère du mât) : points, rayon.
const AX = 0.565, yAir = 2.42 + 0.147 + 0.305, BK = [0.46, 2.72, 0.4];
const HOSES = {
  h39: [[[-0.38, 2.3, AX + 0.04], [-0.5, 1.82, AX + 0.05], [-0.45, 1.2, 0.4], [-0.3, 0.9, 0.3]], 0.016],
  h45: [[[0.14, yAir, AX + 0.03], [0.3, yAir + 0.02, AX + 0.02], [BK[0], BK[1] + 0.02, BK[2] + 0.06]], 0.033],
  h47: [[[BK[0] + 0.05, BK[1], BK[2] - 0.06], [0.6, 3.25, 0.15], [0.58, 3.2, -0.25], [0.52, 2.6, -0.32]], 0.033],
  h46: [[[0.52, 2.6, -0.32], [0.6, 1.6, -0.4], [0.45, 0.4, -0.45], [0.1, 0.02, -0.5]], 0.033],
};

export default function P012(api) {
  const { THREE, S } = api;
  const L = etiquettes(api);
  const put = (ref, obj, pos, n, d = 0.2, opts) => api.part(ref, L.stick(obj, pos, n, opts), n.map((v) => v * d));

  // ---------------------------------------------------------------- trousses
  api.part('3', api.sub('P014'), [0, 0, 0]);
  api.part('7', api.sub('P020'), [0, 0, 0]);

  // ---------------------------------------------------------------- décalques
  // 1 — DANGER poussières, 85 × 140 mm : flanc +Z du mât (z 0.23), colonne libre x 2.74.
  put('1', L.label({ w: 0.085, h: 0.14, t: 0.0004, bg: 'white', ink: 'black', border: 'black', header: 'danger', pics: [['warn', 'air']], layout: 'v', lines: 4, seed: 1 }),
    [2.74, 1.15, 0.23], [0, 0, 1], 0.25);
  // 2 — émissions diesel : face +Z du moteur (z 0.5).
  put('2', L.label({ w: 0.1, h: 0.15, t: 0.0004, bg: 'white', ink: 'black', border: 'black', header: 'warning', pics: [['warn', 'air']], lines: 5, seed: 2 }),
    [-0.6, DECK + 0.39, 0.5], [0, 0, 1], 0.22);
  // 8 — aptitude en pente : longeron +Z (z 0.68), à l'arrière.
  put('8', L.label({ w: 0.15, h: 0.1, t: 0.0004, bg: 'white', ink: 'black', border: 'black', pics: [['plain', 'slope']], layout: 'h', lines: 4, seed: 8 }),
    [-1.4, 0.665, 0.68], [0, 0, 1], 0.2);
  // 9 — procédure d'essai des freins : face +Z du réservoir hydraulique (z 0.63).
  put('9', L.label({ w: 0.14, h: 0.12, t: 0.0008, bg: 'white', ink: 'black', border: 'black', header: 'notice', lines: 6, seed: 9 }),
    [-1.68, DECK + 0.16, 0.63], [0, 0, 1], 0.2);

  // ---------------------------------------------------------------- sangles
  const Yax = new THREE.Vector3(0, 1, 0);
  // Sangle autour d'un boyau, axe local Y : bande, bout libre et boucle.
  // kind 'cinch' : nylon noir, boucle plastique ; 'rubber' : caoutchouc, bouton champignon.
  const strap = (r, kind, tail) => {
    const cinch = kind === 'cinch';
    const w = cinch ? 0.016 : 0.022, e = cinch ? 0.0012 : 0.003;
    const ro = r + e;
    const band = [S.ring(ro, r + 0.0002, w, 'plastic', { seg: 20 })];
    const tailBox = S.box(tail, w * 0.95, e, cinch ? 'plastic' : 'rubber');
    tailBox.position.set(tail / 2, 0, ro + e / 2);
    band.push(tailBox);
    const g = new THREE.Group();
    g.add(S.merged(band, cinch ? 'plastic' : 'rubber'));
    if (cinch) {
      // Boucle à crochets sur le dessus de la bande.
      g.add(S.box(0.012, w * 1.25, 0.004, 'black', { pos: [0, 0, ro + e + 0.002] }));
    } else {
      // Bouton champignon de la sangle caoutchouc.
      const k = S.cyl(0.006, 0.006, 'rubber', { axis: 'z', seg: 12, pos: [tail * 0.8, 0, ro + e + 0.003] });
      g.add(k);
    }
    return g;
  };
  // Pose la sangle i/n sur le boyau (abscisse u), axe = tangente, éclatement radial au mât.
  const onHose = (key, u, spin) => {
    const [pts, r] = HOSES[key];
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...toM(p))), false, 'catmullrom', 0.5);
    const p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(Yax, t);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(Yax, spin));
    const d = new THREE.Vector3(p.x - FEED.x, 0, p.z);
    if (d.lengthSq() < 1e-4) d.set(1, 0, 0);
    d.normalize().multiplyScalar(0.18);
    return { p, q, r, d: [d.x, d.y + 0.05, d.z] };
  };
  const place = (ref, key, u, kind, tail, spin) => {
    const { p, q, r, d } = onHose(key, u, spin);
    const s = strap(r, kind, tail);
    s.position.copy(p);
    s.quaternion.copy(q);
    api.part(ref, s, d);
  };

  // 4 — sangles 8 po (12) : boucle de boyaux de la tête (39).
  for (let i = 0; i < 12; i++) place('4', 'h39', 0.06 + (i * 0.88) / 11, 'cinch', 0.03, i * 0.9);
  // 5 — sangles 20 po (12) et 6 — sangles caoutchouc (15), en alternance sur les
  // boyaux d'air 2 po : 46 (6 + 7), 47 (4 + 6), 45 (2 + 2).
  const seq = [
    ['h46', 13, (i) => i % 2 === 1],
    ['h47', 10, (i) => [1, 3, 6, 8].includes(i)],
    ['h45', 4, (i) => i % 2 === 0],
  ];
  seq.forEach(([key, n, isLong]) => {
    for (let i = 0; i < n; i++) {
      const u = 0.04 + (i * 0.92) / (n - 1);
      if (isLong(i)) place('5', key, u, 'cinch', 0.07, i * 1.3);
      else place('6', key, u, 'rubber', 0.035, i * 1.3 + 0.6);
    }
  });

  return { view: { dir: [1.0, 0.6, 1.25] } };
}
