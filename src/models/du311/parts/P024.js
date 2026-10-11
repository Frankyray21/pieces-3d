// P024 — Ensemble MCP (plaque de liaison du mât), avance HH 6 pi : CX034929
// rév. 0 (dessin page 24, liste page 25). La plaque de liaison du mât (2,
// P026) porte à plat ses quatre postes de patins ; de part et d'autre, un
// vérin d'extension d'avance Ø 3 × 54 po (3, P028) court le long de la plaque,
// dessiné rentré : chape de tige (fourche) sur l'oreille de la queue de la
// plaque (bague et vis à épaulement de P026), fond tourné vers l'autre bout,
// où sa chape de fond dépasse de la plaque et attend la contre-chape de
// l'avance. Dans cette chape de fond : vis à épaulement 1 × 2 1/4 po (1,
// filet 3/4-10, tête cylindrique Ø 1 1/2 à six-pans creux 1/2 po) posée tête
// en haut, et écrou à freinage nylon 3/4-10 (4) dessous, contre l'épaulement.
// Orifices et bouchons des vérins tournés vers l'extérieur (vers -X pour le
// vérin avant, +X pour le vérin arrière), comme sur l'isométrie.
// Repère (celui de P026, plaque à plat comme au dessin) : origine au centre de
// la face d'appui inférieure de la plaque, sur l'axe du trou central ; Y vers
// le mât (côté des boîtiers de patins), +Z le long de la plaque vers les
// oreilles (bout tige des vérins), X en travers (+X = côté arrière du
// dessin). Axes des vérins à x = ±0.381 m, y = 0.0127 m (milieu de la queue de
// 1 po de la plaque) ; axes des chapes verticaux (Y) ; chapes de tige à
// z = 0.857 m, chapes de fond à z = -0.846 m (entraxe rentré 1.703 m ; sorti,
// la chape de fond descend à z = -2.218 m).
// Encombrement ≈ 0.89 (X, des bouchons d'orifice à ±0.444) × 0.21 (Y, de
// -0.048 au bout des vis à épaulement à 0.159 au-dessus des boîtiers) × 1.77
// (Z, de -0.874 au bout des chapes de fond à 0.898) m.

import { MCP } from './P026.js';
import { CYL028 } from './P028.js';

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes en pouces : vis à épaulement CP006130 (comme dans P026) et chape de
// fond des vérins (fourche de 2 1/4 po hors tout centrée sur l'axe du vérin).
const SB = { headR: 0.75, headH: 0.75, hexAF: 0.5, shoulderR: 0.5, shoulder: 2.25 };
const CYL_Y = (MCP.clevisGap[0] + MCP.clevisGap[1]) / 2; // axe des vérins (milieu de la chape)
const BASE_Z = MCP.lugZ - CYL028.pinRetracted; // axe de la chape de fond (vérin rentré)

// Contour fermé [[x, y], …] décalé de d vers l'intérieur (d < 0 : vers
// l'extérieur), sommets en onglet (même construction que P026).
function inset(pts, d) {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1];
  const s = Math.sign(area) * d;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const n1 = [-(p[1] - a[1]) / l1, (p[0] - a[0]) / l1], n2 = [-(b[1] - p[1]) / l2, (b[0] - p[0]) / l2];
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const c = Math.max(0.2, (mx * n1[0] + my * n1[1]) / ml);
    return [p[0] + ((mx / ml) * s) / c, p[1] + ((my / ml) * s) / c];
  });
}

export default function P024(api) {
  const { THREE, S } = api;
  const { lathe, thread, merged, creaseNormals, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Profil de révolution en pouces [r, y] → lathe en mètres.
  const L = (pts, mat, seg = 24) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg });
  const ring = (r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [r * Math.cos(a0 + (2 * Math.PI * i) / n), r * Math.sin(a0 + (2 * Math.PI * i) / n)]);

  // Prisme (m) d'un contour [x, y] percé de trous, de y = 0 à depth une fois
  // couché (extrusion selon +Y), arêtes cassées de mb.
  const prism = (outline, holes, depth, mb) => {
    const v = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
    const shape = new THREE.Shape(v(inset(outline, mb)));
    holes.forEach((h) => shape.holes.push(new THREE.Path(v(inset(h, -mb)))));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: 0, bevelSegments: 1,
    });
    geo.translate(0, 0, mb);
    geo.rotateX(-Math.PI / 2);
    return creaseNormals(geo);
  };

  // ------------------------------------------------ 1 — vis à épaulement
  // Repère local : dessous de tête à y = 0, tête vers +Y, tige vers -Y.
  // Tête cylindrique Ø 1 1/2 × 3/4, arête haute chanfreinée, six-pans creux
  // 1/2 po (profondeur 0.41) ; épaulement Ø 1 rectifié de 2 1/4 (petit
  // congé sous tête), gorge de dégagement Ø 0.66 puis
  // filet 3/4-10 sur 1.1 po, bout chanfreiné.
  // Segments sobres (tête 28, tige 16 ; écrou 16) : P024 partage son budget
  // de 150 000 triangles avec P026 (≈ 54 000) et deux P028 (≈ 81 000).
  const shoulderBolt = () => {
    const R = u(SB.headR), hh = u(SB.headH);
    const rh = u(SB.hexAF) / 2 / Math.cos(Math.PI / 6);
    const hex = ring(rh, 6);
    const head = prism(ring(R, 28), [hex], hh, u(0.06));
    const socketDepth = hh * 0.55;
    const floor = new THREE.ExtrudeGeometry(new THREE.Shape(hex.map(([x, y]) => new THREE.Vector2(x, y))), { depth: hh - socketDepth, bevelEnabled: false });
    floor.rotateX(-Math.PI / 2);
    return merged([
      new THREE.Mesh(head), new THREE.Mesh(floor),
      L([
        [0, -3.5], ...thread(0.375, -3.5, -2.4, { pitch: 0.1, maxTurns: 11 }),
        [0.33, -2.37], [0.33, -2.3], [0.47, -2.25], [SB.shoulderR, -2.22], [SB.shoulderR, -0.06],
        [0.53, -0.02], [0.56, 0], [0, 0],
      ], 'blackOxide', 16),
    ], 'blackOxide');
  };

  // ------------------------------------------------ 4 — écrou Nylstop 3/4-10
  // Repère local : face d'appui en y = 0, écrou vers -Y. Six-pans 1 1/8 de
  // 0.56 po (chanfreins 30° des deux faces), collerette sertie bombée et
  // bague nylon apparente au fond (même pièce que le repère 11 de P026).
  const lockNut = () => {
    const af = u(1.125), h = u(0.56), b = u(0.05), bt = b * Math.tan(Math.PI / 6);
    const rs = (af / 2 - b) / Math.cos(Math.PI / 6);
    const hexShape = new THREE.Shape(ring(rs, 6, Math.PI / 6).map(([x, y]) => new THREE.Vector2(x, y)));
    const bore = new THREE.Path();
    bore.absarc(0, 0, u(0.385) + b, 0, Math.PI * 2, true);
    hexShape.holes.push(bore);
    const g = new THREE.ExtrudeGeometry(hexShape, {
      depth: h - 2 * bt, bevelEnabled: true, bevelSize: b, bevelThickness: bt, bevelSegments: 1, curveSegments: 12,
    });
    g.translate(0, 0, bt);
    g.rotateX(Math.PI / 2); // de y = 0 à -h
    return group(
      merged([
        new THREE.Mesh(creaseNormals(g)),
        // collerette sertie : portée ronde sous le six-pans, dôme roulé vers l'axe
        L([[0.44, -0.8], [0.47, -0.81], [0.51, -0.77], [0.53, -0.62], [0.53, -0.56], [0.44, -0.56], [0.44, -0.8]], 'zinc', 16),
      ], 'zinc'),
      // bague nylon apparente dans la collerette
      L([[0.375, -0.795], [0.44, -0.795], [0.44, -0.6], [0.375, -0.6], [0.375, -0.795]], 'cream', 16),
    );
  };

  // ------------------------------------------------ 2 — plaque de liaison du mât
  // Sous-ensemble complet (mécano-soudure, patins, boîtiers, boulonnerie,
  // bagues et vis à épaulement des oreilles) : il sert de référence et ne
  // bouge pas dans l'éclaté.
  P('2', api.sub('P026'), [0, 0, 0]);

  // ------------------------------------------------ 3 — vérins d'extension
  // P028 a son axe selon Y (fond à l'origine, tige vers +Y) et ses axes de
  // chapes selon Z : couché le long de +Z (fond côté -Z, tige vers les
  // oreilles), axes de chapes verticaux. Vérin avant (-X) : quart de tour
  // autour de X, orifices (-X de P028) vers l'extérieur ; vérin arrière (+X) :
  // retourné en plus d'un demi-tour autour de son axe pour garder ses orifices
  // vers l'extérieur.
  // Éclaté : chaque vérin s'écarte de la plaque vers l'extérieur (sa chape de
  // tige quitte l'oreille par le côté ouvert), sa boulonnerie de fond suit
  // et sort dans l'axe de la chape (vis vers le haut, écrou vers le bas).
  // La vis et l'écrou de l'oreille (3 et 11 de P026) restent en place : P026
  // est fixe à ce niveau, ils sortent dans son propre éclaté. Le trajet éclaté
  // étant rectiligne (position = base + t × déplacement), aucun déplacement du
  // vérin n'évite que l'œil fermé de la fourche croise leur fût en début
  // d'animation (≈ 4 cm de course) ; d'où l'éclaté latéral simple.
  const OUT = 0.3;
  for (const s of [-1, 1]) {
    const x = s * MCP.lugX;
    const rot = s < 0 ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, Math.PI];
    P('3', at(api.sub('P028'), [x, CYL_Y, BASE_Z], rot), [s * OUT, 0, 0]);
    // 1 — vis à épaulement, tête sur la joue haute de la chape de fond
    P('1', at(shoulderBolt(), [x, MCP.clevisGap[1], BASE_Z]), [s * OUT, 0.2, 0]);
    // 4 — écrou Nylstop sous la joue basse, serré sur l'épaulement
    P('4', at(lockNut(), [x, MCP.clevisGap[0], BASE_Z]), [s * OUT, -0.15, 0]);
  }

  return { view: { dir: [-1.05, 0.95, 1] } };
}
