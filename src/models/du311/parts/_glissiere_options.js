// Aides partagées du groupe « glissière-options » (DU311-TVK).
// Chaque section est indépendante ; n'ajouter que des exports nouveaux.

// ---------------------------------------------------------------- Étiquettes
// Fabrique d'étiquettes et de décalques (P012, P014, P020) : plaque mince à
// la taille réelle, fond coloré, bord imprimé, pictogrammes ISO 3864
// (triangle d'avertissement jaune, rond bleu d'obligation, rond rouge
// d'interdiction, carré d'information) et lignes de « texte » suggérées en
// relief de 0,3 mm (barres, pas de vrai texte). Chaque étiquette est un groupe
// de quelques maillages fusionnés par matériau.
// Repère d'une étiquette : centrée en X / Y (largeur w selon X, hauteur h
// selon Y), dos à z = 0, face imprimée vers +Z.
// stick() la pose à plat sur une surface : pos = point de la surface, n =
// normale sortante ; le haut de l'étiquette suit `up` (projeté sur la surface).

const R = 0.0003; // relief de l'encre (0,3 mm par couche)

// Pictogrammes en coordonnées unitaires (carré −1…1) :
// ['p', [[x, y], …]] polygone, ['r', x, y, w, h, a] rectangle (angle a),
// ['c', x, y, r] disque, ['o', x, y, rExt, rInt] anneau.
const GLYPHS = {
  exclam: [['r', 0, 0.2, 0.2, 0.9], ['r', 0, -0.62, 0.2, 0.2]],
  bolt: [['p', [[-0.15, 1], [0.4, 1], [0.08, 0.15], [0.45, 0.15], [-0.3, -1], [-0.05, -0.12], [-0.42, -0.12]]]],
  flame: [['p', [[0, 1], [0.38, 0.35], [0.5, -0.35], [0.28, -0.9], [-0.28, -0.9], [-0.5, -0.35], [-0.32, 0.15], [-0.12, 0.05]]]],
  drop: [['p', [[0, 1], [0.48, -0.15], [0.42, -0.65], [0, -0.92], [-0.42, -0.65], [-0.48, -0.15]]]],
  hand: [['r', 0.05, -0.45, 0.8, 0.9], ['r', -0.28, 0.35, 0.16, 0.75], ['r', -0.05, 0.42, 0.16, 0.85], ['r', 0.18, 0.38, 0.16, 0.8], ['r', 0.4, 0.25, 0.15, 0.6], ['r', -0.52, -0.28, 0.16, 0.6, 0.6]],
  gear: 'gear',
  person: [['c', 0, 0.72, 0.22], ['p', [[-0.3, 0.42], [0.3, 0.42], [0.42, -0.1], [0.2, -0.1], [0.22, -1], [0.02, -1], [0, -0.35], [-0.02, -1], [-0.22, -1], [-0.2, -0.1], [-0.42, -0.1]]]],
  waves: [['p', [[-0.6, -0.9], [-0.45, -0.9], [-0.3, -0.3], [-0.45, 0.3], [-0.3, 0.9], [-0.45, 0.9], [-0.6, 0.3], [-0.45, -0.3]]],
    ['p', [[-0.08, -0.9], [0.07, -0.9], [0.22, -0.3], [0.07, 0.3], [0.22, 0.9], [0.07, 0.9], [-0.08, 0.3], [0.07, -0.3]]],
    ['p', [[0.44, -0.9], [0.59, -0.9], [0.74, -0.3], [0.59, 0.3], [0.74, 0.9], [0.59, 0.9], [0.44, 0.3], [0.59, -0.3]]]],
  jet: [['r', -0.55, 0, 0.6, 0.35], ['r', 0.35, 0.3, 0.7, 0.1, 0.4], ['r', 0.4, 0, 0.8, 0.1], ['r', 0.35, -0.3, 0.7, 0.1, -0.4]],
  air: [['c', -0.4, -0.2, 0.32], ['c', 0.1, 0.15, 0.4], ['c', 0.5, -0.25, 0.3], ['r', 0.05, -0.45, 1.1, 0.2]],
  laser: [['c', 0, 0, 0.25], ['r', 0, 0, 1.8, 0.1], ['r', 0, 0, 0.1, 1.8], ['r', 0, 0, 1.3, 0.1, 0.785], ['r', 0, 0, 1.3, 0.1, -0.785]],
  rollers: [['o', -0.45, -0.25, 0.42, 0.3], ['o', 0.45, -0.25, 0.42, 0.3], ['r', 0, 0.45, 0.25, 0.6], ['r', 0, 0.85, 0.5, 0.2]],
  ear: [['o', 0, 0.1, 0.6, 0.38], ['r', -0.2, -0.65, 0.2, 0.5], ['c', 0.05, 0.1, 0.15]],
  spray: [['r', -0.35, 0.1, 0.7, 0.3], ['r', -0.5, -0.35, 0.2, 0.6], ['r', 0.3, 0.32, 0.6, 0.08, 0.5], ['r', 0.38, 0.1, 0.7, 0.08], ['r', 0.3, -0.12, 0.6, 0.08, -0.5]],
  battery: [['r', 0, 0.62, 1.5, 0.12], ['r', 0, -0.7, 1.5, 0.12], ['r', -0.7, -0.04, 0.12, 1.2], ['r', 0.7, -0.04, 0.12, 1.2], ['r', -0.4, 0.75, 0.25, 0.2], ['r', 0.4, 0.75, 0.25, 0.2], ['r', -0.35, 0, 0.35, 0.1], ['r', 0.35, 0, 0.35, 0.1], ['r', 0.35, 0, 0.1, 0.35]],
  fuel: [['r', -0.2, -0.1, 0.8, 1.5], ['r', 0.45, 0.2, 0.15, 0.9], ['r', 0.4, 0.68, 0.3, 0.12], ['r', -0.65, -0.9, 1.5, 0.15]],
  can: [['r', -0.2, -0.2, 1.0, 0.8], ['p', [[0.25, 0.05], [0.9, 0.55], [0.95, 0.42], [0.3, -0.2]]], ['r', -0.45, 0.32, 0.3, 0.25], ['c', 0.9, -0.15, 0.12]],
  book: [['p', [[-0.9, -0.6], [-0.05, -0.75], [-0.05, 0.65], [-0.9, 0.8]]], ['p', [[0.05, -0.75], [0.9, -0.6], [0.9, 0.8], [0.05, 0.65]]]],
  crush: [['r', 0, 0.55, 1.6, 0.25], ['r', 0, 0.25, 0.25, 0.4], ['r', 0, -0.85, 1.6, 0.15], ['c', 0, -0.35, 0.2], ['r', 0, -0.45, 0.12, 0.1]],
  slope: [['p', [[-0.9, -0.7], [0.9, -0.7], [0.9, 0.5]]], ['r', -0.2, 0.25, 0.5, 0.25, 0.6]],
  mask: [['c', 0, 0.35, 0.45], ['p', [[-0.35, -0.05], [0.35, -0.05], [0.25, -0.45], [-0.25, -0.45]]], ['r', 0, -0.75, 0.9, 0.3]],
  estop: [['c', 0, 0, 0.55]],
  arrows: [['p', [[-0.9, 0], [-0.55, 0.45], [-0.55, -0.45]]], ['p', [[0.9, 0], [0.55, 0.45], [0.55, -0.45]]]],
};

// Polices à segments (lettrage découpé : logos, n° de modèle) : a haut,
// b haut droit, c bas droit, d bas, e bas gauche, f haut gauche, g milieu.
const SEG = {
  A: 'abcefg', D: 'bcdeg', U: 'bcdef', S: 'acdfg', N: 'ceg', V: 'bcdef', I: 'bc', K: 'bcefg',
  T: 'defg', 1: 'bc', 3: 'abcdg', '-': 'g', ' ': '',
};

export function etiquettes(api) {
  const { THREE, S } = api;

  // Collecteur de géométries par matériau.
  const bag = () => {
    const m = new Map();
    return {
      add(mat, geo) { if (!m.has(mat)) m.set(mat, []); m.get(mat).push(geo); },
      build() {
        const g = new THREE.Group();
        for (const [mat, geos] of m) g.add(S.merged(geos.map((x) => new THREE.Mesh(x)), mat));
        return g;
      },
    };
  };
  const rect = (w, h, d, x, y, z, a = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (a) g.rotateZ(a);
    return g.translate(x, y, z + d / 2);
  };
  const shapeGeo = (shape, d, z) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, z);
  const polyShape = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const circPts = (cx, cy, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const disc = (r, d, x, y, z, seg = 20) => new THREE.CylinderGeometry(r, r, d, seg).rotateX(Math.PI / 2).translate(x, y, z + d / 2);
  const ringGeo = (ro, ri, d, x, y, z, seg = 24) => {
    const s = polyShape(circPts(x, y, ro, seg));
    s.holes.push(new THREE.Path(circPts(x, y, ri, seg).reverse().map(([a, b]) => new THREE.Vector2(a, b))));
    return shapeGeo(s, d, z);
  };
  const triPts = (cx, cy, s) => {
    // Triangle équilatéral pointe en haut, inscrit dans un carré de côté s.
    const h = s * 0.87;
    return [[cx - s / 2, cy - h / 2], [cx + s / 2, cy - h / 2], [cx, cy + h / 2]];
  };

  // Pictogramme unitaire mis à l'échelle (demi-côté k), centré en (cx, cy).
  function glyph(B, name, mat, cx, cy, k, z) {
    const def = GLYPHS[name];
    if (def === 'gear') {
      const pts = [];
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const r = (i % 4 < 2 ? 0.85 : 0.62) * k;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      const s = polyShape(pts);
      s.holes.push(new THREE.Path(circPts(cx, cy, 0.25 * k, 12).reverse().map(([a, b]) => new THREE.Vector2(a, b))));
      B.add(mat, shapeGeo(s, R, z));
      return;
    }
    for (const p of def) {
      if (p[0] === 'p') B.add(mat, shapeGeo(polyShape(p[1].map(([x, y]) => [cx + x * k, cy + y * k])), R, z));
      else if (p[0] === 'r') B.add(mat, rect(p[3] * k, p[4] * k, R, cx + p[1] * k, cy + p[2] * k, z, p[5] || 0));
      else if (p[0] === 'c') B.add(mat, disc(p[3] * k, R, cx + p[1] * k, cy + p[2] * k, z, 16));
      else if (p[0] === 'o') B.add(mat, ringGeo(p[3] * k, p[4] * k, R, cx + p[1] * k, cy + p[2] * k, z, p[5] || 20));
    }
  }

  // Cadre de pictogramme dans un carré de côté s centré en (cx, cy) sur la face z.
  // kind : 'warn' (triangle jaune bordé de noir), 'must' (rond bleu, pictogramme
  // blanc), 'no' (rond barré rouge), 'info' (carré jaune bordé de noir),
  // 'plain' (pictogramme seul à l'encre).
  function picto(B, kind, name, cx, cy, s, z, ink) {
    if (kind === 'warn') {
      B.add('black', shapeGeo(polyShape(triPts(cx, cy, s)), R, z));
      B.add('yellow', shapeGeo(polyShape(triPts(cx, cy - s * 0.035, s * 0.78)), R, z + R));
      if (name) glyph(B, name, 'black', cx, cy - s * 0.12, s * 0.2, z + 2 * R);
    } else if (kind === 'must') {
      B.add('blue', disc(s * 0.46, R, cx, cy, z, 28));
      if (name) glyph(B, name, 'white', cx, cy, s * 0.28, z + R);
    } else if (kind === 'no') {
      if (name) glyph(B, name, 'black', cx, cy, s * 0.26, z);
      B.add('red', ringGeo(s * 0.46, s * 0.38, R * 2, cx, cy, z, 28));
      B.add('red', rect(s * 0.78, s * 0.075, R * 2, cx, cy, z, -Math.PI / 4));
    } else if (kind === 'info') {
      B.add('black', rect(s * 0.92, s * 0.92, R, cx, cy, z));
      B.add('yellow', rect(s * 0.82, s * 0.82, R, cx, cy, z + R));
      if (name) glyph(B, name, 'black', cx, cy, s * 0.3, z + 2 * R);
    } else if (kind === 'estop') {
      B.add('yellow', disc(s * 0.46, R, cx, cy, z, 28));
      B.add('red', disc(s * 0.27, R, cx, cy, z + R, 24));
    } else if (name) glyph(B, name, ink, cx, cy, s * 0.4, z);
  }

  // Lignes de texte suggérées : mots de longueurs pseudo-aléatoires dans la zone.
  function text(B, mat, x0, x1, y0, y1, n, z, seed = 7, { center = false } = {}) {
    if (n <= 0 || x1 <= x0 || y1 <= y0) return;
    const step = (y1 - y0) / n;
    const th = Math.min(step * 0.55, 0.012);
    let s = seed * 9973 + 17;
    for (let i = 0; i < n; i++) {
      const y = y1 - step * (i + 0.5);
      const hh = i === 0 ? th * 1.15 : th;
      const full = x1 - x0;
      const lineW = full * (i === 0 || n === 1 ? 0.9 : 0.55 + ((i * 37 + seed * 11) % 40) / 100);
      let x = center ? (x0 + x1) / 2 - lineW / 2 : x0;
      const xe = x + lineW;
      while (x < xe - hh) {
        s = (s * 16807) % 2147483647;
        const ww = Math.min(full * (0.1 + ((s % 1000) / 1000) * 0.22), xe - x);
        B.add(mat, rect(ww, hh, R, x + ww / 2, y, z));
        x += ww + hh * 0.9;
      }
    }
  }

  /**
   * Étiquette ou décalque. Options :
   *  w, h — taille (m) ; t — épaisseur (1 mm étiquette rigide, 0,4 mm adhésif)
   *  bg / ink — fond et encre ; border — couleur du filet de bord (null : aucun)
   *  header — bandeau 'danger' (noir, ovale rouge), 'warning' (orange),
   *           'caution' (jaune), 'notice' (bleu)
   *  pics — [[cadre, pictogramme], …] (voir picto) ; lines — lignes de texte
   *  arrows — flèches de commande aux deux bouts (étiquettes de levier)
   *  layout — 'v' (pictos empilés au-dessus du texte) ou 'h' (pictos à gauche)
   *  seed — variation du texte
   */
  function label({ w, h, t = 0.0008, bg = 'black', ink = 'white', border = null, header = null, pics = [], lines = 1, arrows = false, layout, seed = 1, panel = null } = {}) {
    const B = bag();
    const z = t;
    B.add(bg, rect(w, h, t, 0, 0, 0));
    const m = Math.min(w, h) * 0.07;
    if (border) {
      const b = Math.max(0.0008, Math.min(w, h) * 0.025);
      B.add(border, rect(w - 2 * m, b, R, 0, h / 2 - m - b / 2, z));
      B.add(border, rect(w - 2 * m, b, R, 0, -h / 2 + m + b / 2, z));
      B.add(border, rect(b, h - 2 * m - 2 * b, R, -w / 2 + m + b / 2, 0, z));
      B.add(border, rect(b, h - 2 * m - 2 * b, R, w / 2 - m - b / 2, 0, z));
    }
    let x0 = -w / 2 + m * 1.6, x1 = w / 2 - m * 1.6, y0 = -h / 2 + m * 1.6, y1 = h / 2 - m * 1.6;
    if (header) {
      const hh = Math.min(h * 0.2, w * 0.3);
      const yc = h / 2 - m - hh / 2;
      const col = { danger: 'black', warning: 'orange', caution: 'yellow', notice: 'blue' }[header];
      B.add(col, rect(w - 2 * m, hh, R, 0, yc, z));
      if (header === 'danger') {
        B.add('red', rect(w * 0.62, hh * 0.68, R, 0, yc, z + R));
        text(B, 'white', -w * 0.26, w * 0.26, yc - hh * 0.3, yc + hh * 0.3, 1, z + 2 * R, seed, { center: true });
      } else {
        const tc = header === 'caution' ? 'black' : 'white';
        text(B, tc, -w * 0.3, w * 0.3, yc - hh * 0.35, yc + hh * 0.35, 1, z + R, seed, { center: true });
      }
      y1 = yc - hh / 2 - m;
    }
    if (panel) {
      // Fond clair sous les pictogrammes (étiquettes à deux plages).
      B.add(panel, rect(x1 - x0 + m, y1 - y0 + m, R, (x0 + x1) / 2, (y0 + y1) / 2, z));
    }
    const zp = panel ? z + R : z;
    const n = pics.length;
    const lay = layout || (w > h * 1.25 ? 'h' : 'v');
    if (n) {
      if (lay === 'v') {
        const s = Math.min(x1 - x0, ((y1 - y0) * (lines ? 0.72 : 1)) / n);
        pics.forEach(([k, g], i) => picto(B, k, g, 0, y1 - s * (i + 0.5), s * 0.96, zp, ink));
        y1 -= s * n + m * 0.5;
      } else {
        const s = Math.min(y1 - y0, ((x1 - x0) * (lines ? 0.5 : 1)) / n);
        pics.forEach(([k, g], i) => picto(B, k, g, x0 + s * (i + 0.5), (y0 + y1) / 2, s * 0.96, zp, ink));
        x0 += s * n + m;
      }
    }
    if (arrows) {
      const k = Math.min((y1 - y0) * 0.3, (x1 - x0) * 0.08);
      glyph(B, 'arrows', ink, (x0 + x1) / 2, (y0 + y1) / 2, k * 0.5, zp);
      B.add(ink, rect(k * 0.9, k * 0.25, R, x0 + k * 0.6, (y0 + y1) / 2, zp));
      B.add(ink, rect(k * 0.9, k * 0.25, R, x1 - k * 0.6, (y0 + y1) / 2, zp));
      x0 += k * 1.3; x1 -= k * 1.3;
    }
    text(B, ink, x0, x1, y0, y1, lines, zp, seed, { center: lay === 'v' || arrows });
    return B.build();
  }

  /**
   * Lettrage découpé (sans support) : caractères à segments de hauteur h,
   * épaisseur de trait k·h, en relief de 0,4 mm ; centré, face +Z.
   */
  function lettering(str, h, mat, { k = 0.16, gap = 0.3 } = {}) {
    const B = bag();
    const cw = h * 0.55, tw = h * k, step = cw + h * gap;
    const n = str.length;
    str.split('').forEach((ch, i) => {
      const cx = -((n - 1) * step) / 2 + i * step;
      const segs = SEG[ch] ?? '';
      const half = h / 2;
      const put = (x, y, ww, hh) => B.add(mat, rect(ww, hh, 0.0004, cx + x, y, 0));
      for (const sgm of segs) {
        if (sgm === 'a') put(0, half - tw / 2, cw, tw);
        if (sgm === 'd') put(0, -half + tw / 2, cw, tw);
        if (sgm === 'g') put(0, 0, cw, tw);
        if (sgm === 'b') put(cw / 2 - tw / 2, half / 2, tw, half + tw / 2);
        if (sgm === 'c') put(cw / 2 - tw / 2, -half / 2, tw, half + tw / 2);
        if (sgm === 'f') put(-cw / 2 + tw / 2, half / 2, tw, half + tw / 2);
        if (sgm === 'e') put(-cw / 2 + tw / 2, -half / 2, tw, half + tw / 2);
      }
    });
    return B.build();
  }

  /**
   * Pose à plat : dos de l'objet (z = 0) au point pos de la surface, face
   * selon la normale n ; haut selon up (projeté), puis rotation spin autour de n.
   * Décalage de 0,2 mm pour ne pas se confondre avec la surface.
   */
  function stick(obj, pos, n, { up = [0, 1, 0], spin = 0 } = {}) {
    const N = new THREE.Vector3(...n).normalize();
    let U = new THREE.Vector3(...up);
    if (Math.abs(U.clone().normalize().dot(N)) > 0.99) U = new THREE.Vector3(1, 0, 0);
    const X = new THREE.Vector3().crossVectors(U, N).normalize();
    const Y = new THREE.Vector3().crossVectors(N, X);
    const g = new THREE.Group();
    g.add(obj);
    if (spin) obj.rotation.z = spin;
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, N));
    g.position.copy(new THREE.Vector3(...pos).addScaledVector(N, 0.0002));
    return g;
  }

  return { label, lettering, stick };
}
