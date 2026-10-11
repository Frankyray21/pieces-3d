// P232 — Pose des capots des armoires électriques : CX032871 rév. 1 « INSTALL,
// COVERS, ELEC PANELS » (pages 232 et 234), repère 18 de P186. Capots en tôle
// pliée 12 ga (2,7 mm) posés sur des équipements qui n'appartiennent pas à
// cette liste (armoires, réservoir, coffres de batterie) : capot de l'armoire
// de commande principale (4, dessus + façade + joue, retour arrière pincé par
// la barrette 3), capot de l'armoire de puissance principale (5, façade +
// joues + dessus) accroché à deux équerres (1), capots en U des coffrets de
// commande du moteur (7) et de translation (6) posés sur le réservoir
// hydraulique, capot en U du coffre de batterie (2) sur la marche de
// translation, capots du coffret du sectionneur de batterie (8, U renversé à
// grands rayons, et 9, chapeau à bavette) tenus par deux vis H 3/8-16 × 3/4
// po (10), rondelles plates SAE (11, sous tête et sous écrou) et écrous (12).
// Repère : repère machine de P186 (frame.js) : X vers l'avant, Y vers le
// haut, +Z côté enrouleur, pont à y = DECK = 0.76. Emplacements estimés
// d'après les vues d'ensemble des pages 186, 232 et 234 et les volumes de
// frame.js (réservoir hydraulique à x ≈ -1.75, z ≈ 0.38) ; formats des
// capots d'après les proportions des dessins.

const IN = 0.0254;
const DECK = 0.76;

export default function P232(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const t = 0.105 * IN; // 12 ga
  const MAT = 'grey';

  // Profil plié (plan XY) : âme de largeur w à y = 0, ailes descendant de hL
  // (à -x) et hR (à +x) ; 0 = pas d'aile. Rayon intérieur de pliage r.
  const bent = (w, hL, hR, r) => {
    r = Math.max(r, t * 1.5);
    const pts = [];
    const arc = (cx, cy, R, a0, a1) => { for (let i = 0; i <= 6; i++) { const a = a0 + ((a1 - a0) * i) / 6; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } };
    if (hL) { pts.push([-w / 2, -hL]); arc(-w / 2 + r, -r, r, Math.PI, Math.PI / 2); } else pts.push([-w / 2, 0]);
    if (hR) { arc(w / 2 - r, -r, r, Math.PI / 2, 0); pts.push([w / 2, -hR], [w / 2 - t, -hR]); arc(w / 2 - r, -r, r - t, 0, Math.PI / 2); } else pts.push([w / 2, 0], [w / 2, -t]);
    if (hL) { arc(-w / 2 + r, -r, r - t, Math.PI / 2, Math.PI); pts.push([-w / 2 + t, -hL]); } else pts.push([-w / 2, -t]);
    return pts;
  };
  // Extrusion d'un profil plié de longueur len, placée par une base (colonnes X, Y, Z locales → machine).
  const sheet = (pts, len, cols, pos, holes = []) => {
    const m = S.extrude(pts, len, MAT, { holes });
    const g = S.group(m);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(...cols.map((c) => new THREE.Vector3(...c))));
    g.position.set(...pos);
    return g;
  };
  const plateXZ = (w, d, pos, holes = [], r = 0.004) => {
    const p = S.plate(w, d, t, MAT, { r, holes });
    p.position.set(...pos);
    return p;
  };

  // ---------------------------------------------------------------- 4, 3 — armoire de commande principale
  {
    const W = 0.75, D = 0.4, H = 0.85, x0 = 1.05, zf = 0.68, yt = DECK + 0.95;
    // Profil (Z, Y) : dessus de profondeur D, façade H côté +Z, retour arrière 30 mm ; extrudé selon X.
    const prof = bent(D, 0.03, H, 0.008);
    const body = sheet(prof, W, [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [x0, yt, zf - D / 2]);
    // Joue d'extrémité (+X) soudée au dessus et à la façade.
    const end = S.box(t, H - 0.01, D - 0.01, MAT, { pos: [x0 + W / 2 - t / 2, yt - H / 2 - 0.005, zf - D / 2 + 0.005] });
    P('4', S.group(S.merged([body, end], MAT)), [0, 0.35, 0.3]);
    // 3 — barrette de serrage le long du retour arrière (plat 1 × 1/4 po, trois boutonnières suggérées).
    const clamp = S.extrude([[-W / 2 + 0.02, -0.0127], [W / 2 - 0.02, -0.0127], [W / 2 - 0.02, 0.0127], [-W / 2 + 0.02, 0.0127]], 0.25 * IN, 'zinc', {
      holes: [-0.3, 0, 0.3].map((x) => [x, 0, 0.0045]),
    });
    clamp.position.set(x0, yt - 0.016, zf - D - 0.25 * IN / 2);
    P('3', clamp, [0, 0.45, -0.15]);
  }

  // ---------------------------------------------------------------- 5, 1 — armoire de puissance principale
  {
    const Wz = 0.45, Dx = 0.3, H = 0.6, x0 = -1.42, zc = -0.25, y0 = DECK + 0.02;
    // U vertical : façade (normale +X) et deux joues vers -X ; extrudé selon Y.
    const prof = bent(Wz, Dx, Dx, 0.008);
    const u = sheet(prof, H, [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [x0, y0 + H / 2, zc]);
    const top = plateXZ(Dx + t, Wz, [x0 - Dx / 2, y0 + H + t / 2, zc], [], 0.003);
    P('5', S.group(S.merged([u, top], MAT)), [0.35, 0.2, 0]);
    // 1 — équerres d'accrochage (cornière pliée 1 1/2 × 1 po) en haut, de part et d'autre.
    for (const s of [-1, 1]) {
      const prof1 = bent(1.0 * IN, 0, 1.5 * IN, 0.004);
      const z = zc + s * (Wz / 2 - 0.05);
      P('1', sheet(prof1, 0.06, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [x0 - Dx + 0.5 * IN + 0.01, y0 + H - t, z]), [0.15, 0.32, s * 0.08]);
    }
  }

  // ---------------------------------------------------------------- 6, 7 — coffrets sur le réservoir
  for (const [ref, z] of [['7', 0.25], ['6', 0.52]]) {
    const w = 0.2, d = 0.12, h = 0.17, x0 = -2.03, y0 = DECK + 0.62;
    const prof = bent(w, d, d, 0.006);
    // Façade normale -X, joues vers +X, extrudé selon Y.
    P(ref, sheet(prof, h, [[0, 0, -1], [-1, 0, 0], [0, 1, 0]], [x0, y0 + h / 2, z]), [-0.3, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 2 — coffre de batterie (marche de translation)
  {
    const prof = bent(0.2, 0.11, 0.11, 0.008);
    // Âme en haut, ailes vers le bas, extrudé selon X.
    P('2', sheet(prof, 0.52, [[0, 0, -1], [0, 1, 0], [1, 0, 0]], [-2.35, DECK + 0.1, -0.35]), [-0.1, 0.35, 0]);
  }

  // ---------------------------------------------------------------- 8, 9, 10, 11, 12 — sectionneur de batterie
  {
    const xc = -2.35, zc = 0.05, yb = DECK + 0.35, L = 0.22, w8 = 0.26;
    // 8 — U renversé à grands rayons, extrudé selon Z (ouvert devant et derrière).
    const p8 = bent(w8, 0.2, 0.2, 0.05);
    P('8', sheet(p8, L, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [xc, yb, zc]), [0, 0.22, 0]);
    // 9 — chapeau : dessus, bavette avant (côté -X) de 0.18, retour arrière court ; coiffe 8.
    const p9 = bent(w8 + 2 * t + 0.002, 0.18, 0.025, 0.05 + t);
    P('9', sheet(p9, L * 0.8, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [xc, yb + t + 0.001, zc]), [0, 0.45, 0]);
    // Vis : une sur le dessus (traverse 9 et 8), une sur la joue +X de 8 (traverse le coffret).
    const fix = [
      { head: [xc + 0.06, yb + 2 * t + 0.001, zc], dir: [0, 1, 0], ex: [0, 0.62, 0], grip: 2 * t + 0.001 },
      { head: [xc + w8 / 2, yb - 0.12, zc], dir: [1, 0, 0], ex: [0.18, 0, 0], grip: t + 0.0025 },
    ];
    const wt = 0.083 * IN;
    for (const f of fix) {
      const d = f.dir;
      const at = (p, k) => p.map((v, i) => v + d[i] * k);
      const o = (obj, pos) => { const g = S.group(obj); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d)); g.position.set(...pos); return g; };
      P('11', o(S.washer(0.367 * IN, 0.203 * IN, wt, 'zinc'), at(f.head, wt / 2)), f.ex.map((v) => v * 0.8));
      P('10', o(S.bolt(0.375 * IN, 0.75 * IN, 'zinc'), at(f.head, wt)), f.ex);
      P('11', o(S.washer(0.367 * IN, 0.203 * IN, wt, 'zinc'), at(f.head, -f.grip - wt / 2)), f.ex.map((v) => -v * 0.5));
      P('12', o(S.nut(0.5625 * IN, 0.328 * IN, 'zinc'), at(f.head, -f.grip - wt - 0.00417)), f.ex.map((v) => -v * 0.8));
    }
  }

  return { view: { dir: [-0.9, 0.7, 1.0] } };
}
