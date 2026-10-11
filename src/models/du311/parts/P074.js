// P074 — Pince de tige à axe unique V30 CX035968 rév. 0 (pages 74 à 77) :
// « ASSY, SINGLE AXIS PIPE CLAMP - V30 ». Une des deux pinces du bras de tige
// P070, enfilée sur l'arbre du bras (7 de P070, Ø 3 1/2 po) :
// - bras de pince mécano-soudé (8) : deux plaques de 3/4 po (dessus et
//   dessous) en « C » au bout (fourche qui reçoit la tige Ø 5 po et, dessus et
//   dessous, les mâchoires fixes du jeu 10 de P070), âme latérale ajourée,
//   moyeu en deux colliers fendus au plan z = 0 (chapeau côté +Z boulonné
//   par 2 vis 12 + rondelles 15 chacun, têtes sur la face +Z) garnis d'une bague fendue à collerette (1), flasques entre les
//   colliers portant les deux vis carrées de réglage (14 + contre-écrous 16)
//   qui pincent la patte de l'arbre, bossages de l'œil de fond du vérin ;
// - vérin (3, P078), tige presque sortie (mâchoire fermée), en diagonale entre
//   l'œil de fond près du moyeu (côté -Z) et la chape de la mâchoire, de
//   l'autre côté de son pivot ; deux axes verticaux :
//   axe de fond (6) dans les bossages avec deux entretoises (7), axe d'embout
//   (5, Ø 1 × 3 po, goupille élastique 2) dans la chape de la mâchoire avec
//   deux entretoises (7) ; orifices tournés vers le bas (pince haute, P076) et
//   raccords droits ORB -04 → JIC -06 (10) ;
// - mâchoire mobile (9, P082) sur l'axe de pivot (6) avec deux cales (4) ;
//   les deux axes 6 sont arrêtés en bas par une vis CHC 1/4 po (13) qui les
//   traverse ; graisseurs coudés (11) : en tête des trois axes et au centre des
//   deux chapeaux de collier.
// Repère : origine sur l'axe du moyeu (axe de l'arbre du bras), à mi-hauteur
// entre les plaques ; Y vers le haut ; +X le long du bras vers la fourche ;
// la fourche s'ouvre vers +Z (vue de l'ouverture, moyeu à gauche et fourche à
// droite comme sur l'isométrique de P074) ; âme ajourée et bossage de l'œil
// de fond du vérin côté -Z, côté +Z ouvert sur le vérin. Les cotes du code sont « logiques »
// (po, z logique = -Z) : V() et prism() font le miroir. Centre de la tige
// serrée en CLAMP074.pipe (x = 21 po = 0.533 m, z = 0) ; plaques de y = ±2.25
// à ±3 po. Option { portsUp: true } : vérin retourné, orifices vers le haut
// (pince basse, P076).
// Encombrement ≈ 0.80 (X, de -0.098 aux têtes de vis à 0.699) × 0.162 (Y,
// collerettes des bagues) × 0.30 (Z) m.
// Cotes : vis, axes et vérin d'après la liste ; tige Ø 5 po, arbre Ø 3 1/2 ;
// portée de 21 po (centre de tige) et largeurs relevées sur la vue de face de
// P072 (≈ 26 px/po) ; disposition (vérin en diagonale depuis le bossage
// latéral du moyeu jusqu'à la chape de mâchoire) d'après l'éclaté de P074.
import { L, u, along, sqss, hexNut, flatWasher, pin } from './_avance_b.js';
import { CYL078, oring } from './P078.js';
import { JAW082 } from './P082.js';

const IN = 0.0254;
const PL = { t: 0.75, gap: 2.25 }; // plaques : épaisseur, demi-écart intérieur
const JP = [16.0, -3.6]; // axe de pivot de la mâchoire (x, z)
const PC = [JP[0] + JAW082.pipe[0], JP[1] + JAW082.pipe[1]]; // centre de la tige
const RP = [JP[0] + JAW082.pin[0], JP[1] + JAW082.pin[1]]; // axe d'embout du vérin
// Vérin dessiné presque sorti (mâchoire fermée sur la tige) : de la chape de
// la mâchoire vers l'œil de fond, près du moyeu côté -Z (vue de face de P072,
// éclaté de P074, vue 2 de P076).
const LEN = (CYL078.retracted + CYL078.stroke) / IN; // entraxe, tige sortie
const DB = (() => { const v = [-12.8, 7.3], n = Math.hypot(...v); return [v[0] / n, v[1] / n]; })();
const BP = [RP[0] + LEN * DB[0], RP[1] + LEN * DB[1]]; // axe de fond du vérin
const D = [-DB[0], -DB[1]]; // direction du vérin (fond → tige)
const HUB = { R: 3.25, bore: 2.0, y0: 1.25, y1: 3.0 }; // colliers : demi-largeur, alésage, hauteur
const THROAT = 3.0; // rayon du fond de la fourche

export const CLAMP074 = {
  pipe: [u(PC[0]), u(PC[1])], // centre de la tige (x, z)
  plateY: u(PL.gap + PL.t), // faces extérieures des plaques (±)
  throatR: u(THROAT),
  // trous des mâchoires fixes (jeu 10 de P070) dans chaque plaque : x, z
  linerHoles: [10, 60, 120, 170].map((a) => [u(PC[0] + 3.45 * Math.cos((a * Math.PI) / 180)), -u(PC[1] + 3.45 * Math.sin((a * Math.PI) / 180))]),
  hubY: [u(HUB.y0), u(HUB.y1)], // colliers (± ces hauteurs)
  boreR: u(HUB.bore),
  tabX: -u(2.4), // patte de l'arbre pincée par les vis 14 (x), à y = 0
};

export default function P074(api, opts = {}) {
  const { THREE, S } = api;
  const { merged, group, at, weld, weldRing } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Vis CHC légère (d × len po) : tête Ø 1.5 d à six-pans creux, dessous à y = 0.
  const capScrew = (d, len) => L(S, [[0, -len], [d * 0.42, -len], [d / 2, -len + d * 0.1], [d / 2, 0], [d * 0.75, 0], [d * 0.75, d * 0.92], [d * 0.7, d], [d * 0.3, d], [d * 0.3, d * 0.5], [0, d * 0.5]], 'blackOxide', 12);
  // Vis H légère d × len (po) : six-pans 1.5 d, dessous de tête à y = 0, tête vers +Y.
  const hexBolt = (d, len) => {
    const r = d / 2, af = d * 1.5, R = af / 2 / Math.cos(Math.PI / 6), c = af * 0.06, h = d * 0.62;
    const head = L(S, [[0, 0.02], [R - c * 1.6, 0.02], [R, 0.02 + c], [R, 0.02 + h - c], [R - c * 1.6, 0.02 + h], [0, 0.02 + h]], 'zinc', 6);
    head.children[0].rotation.y = Math.PI / 6;
    return merged([head, L(S, [[0, -len], [r * 0.8, -len], [r, -len + r * 0.25], [r * 0.94, -len + r * 1.2], [r, -len + r * 2.2], [r, 0.02], [af * 0.47, 0.02], [af * 0.47, 0.03], [0, 0.03]], 'zinc', 12)], 'zinc');
  };
  const V = (x, y, z) => [u(x), u(y), -u(z)]; // cotes logiques (po) → repère (z miroir)

  // Prisme d'un contour [[a, b], …] (po) percé de trous (contours ou
  // [a, b, r]) : plan X-Z extrudé selon Y de y0 à y1 (plane 'xz'), ou plan
  // X-Y extrudé selon Z de z0 à z1 (plane 'xy'). Arêtes cassées ≈ 1 mm.
  const circ = (cx, cz, r, n = 20) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cz + r * Math.sin((i / n) * 2 * Math.PI)]);
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  const slot = (x0, z0, x1, z1, w, n = 8) => {
    const a = (Math.atan2(z1 - z0, x1 - x0) * 180) / Math.PI;
    return [...arc(x1, z1, w, a - 90, a + 90, n), ...arc(x0, z0, w, a + 90, a + 270, n)];
  };
  const prism = (pts, holes, c0, c1, plane = 'xz') => {
    const s = 1; // plan X-Z : z du contour → -Z (miroir, comme V)
    const shape = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(u(a), s * u(b))));
    for (const h of holes) {
      const p = new THREE.Path((h.length === 3 && typeof h[0] === 'number' ? circ(h[0], h[1], h[2]) : h).map(([a, b]) => new THREE.Vector2(u(a), s * u(b))));
      shape.holes.push(p);
    }
    const t = u(c1 - c0), b = 0.0012;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 16 });
    geo.translate(0, 0, b + u(c0));
    if (plane === 'xz') geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(S.creaseNormals(geo));
  };

  // ================================================ 8 — bras de pince (mécano-soudé)
  // Contour des plaques : moyeu arrondi, élargi vers +Z autour des bossages
  // du vérin, poutre, fourche en « C » ouverte vers -Z (fond R 3 autour de la
  // tige), becs arrondis.
  const outline = [
    [0, -HUB.R], [12.8, -HUB.R], [14.2, -4.6], [17.4, -4.6], ...arc(17.4, -4.0, 0.6, -90, 0, 3).slice(1), [18.0, 0],
    ...arc(PC[0], PC[1], THROAT, 180, 0, 18).slice(1),
    [24.0, -4.0], ...arc(24.6, -4.0, 0.6, 180, 270, 3).slice(1), [26.9, -4.6], ...arc(26.9, -3.9, 0.7, -90, 0, 3).slice(1),
    [27.6, 3.8], ...arc(26.8, 3.8, 0.8, 0, 90, 3).slice(1), [14.5, 4.6], [8.0, 6.3], [BP[0] + 1.1, 6.3],
    ...arc(BP[0], BP[1], 1.75, 50, 180, 8), [BP[0] - 1.75, 3.6],
    ...arc(0, 0, HUB.R, 125, 270, 12).slice(1, -1),
  ];
  const plateHoles = [
    [JP[0], JP[1], 0.64], [BP[0], BP[1], 0.64], [0, 0, HUB.bore],
    ...CLAMP074.linerHoles.map(([x, z]) => [x / IN, -z / IN, 0.21]),
    slot(4.6, -1.5, 10.6, -1.5, 0.8), slot(9.0, 2.4, 13.4, 1.0, 0.65),
  ];
  const yT = PL.gap, yB = -PL.gap - PL.t;
  const plates = [prism(outline, plateHoles, yT, yT + PL.t), prism(outline, plateHoles, yB, yB + PL.t)];
  // Colliers du moyeu : moitié fixe (côté -Z) et chapeau boulonné (côté +Z,
  // ouverture de fourche), blocs 6 1/2 po fendus au plan z = 0 (jeu 1/8 po).
  const half = (sz) => {
    const z0 = 0.06, b = HUB.bore, c = 0.4, X = 3.25, Z = HUB.R;
    const pts = [[-X, z0], [-b, z0], ...arc(0, 0, b, 178, 2, 12).slice(1, -1), [b, z0], [X, z0], [X, Z - c], [X - c, Z], [-X + c, Z], [-X, Z - c]];
    return pts.map(([x, z]) => [x, sz * z]);
  };
  const collars = [];
  for (const [y0, y1] of [[HUB.y0, HUB.y1], [-HUB.y1, -HUB.y0]]) {
    collars.push(prism(half(1), [], y0, y1), prism(half(-1), [], y0, y1));
  }
  // Flasques entre les colliers (vis de réglage 14), âme latérale ajourée,
  // bossages de l'œil de fond.
  const flanks = [-1, 1].map((s) => prism([[-3.25, s > 0 ? 2.75 : -3.25], [3.25, s > 0 ? 2.75 : -3.25], [3.25, s > 0 ? 3.25 : -2.75], [-3.25, s > 0 ? 3.25 : -2.75]], [], -HUB.y0, HUB.y0));
  // Âme ajourée côté -Z (côté œil de fond), au bord élargi des plaques ; le
  // côté +Z reste ouvert sur le vérin et ses orifices.
  const web = prism([[1.6, -PL.gap], [7.8, -PL.gap], [7.8, PL.gap], [1.6, PL.gap]], [slot(3.2, 0, 4.4, 0, 0.9), slot(5.6, 0, 6.6, 0, 0.9)], -6.3, -5.8, 'xy');
  const bosses = [[1.25, 2.25], [-2.25, -1.25]].map(([y0, y1]) => L(S, [[0.64, y0], [1.25, y0], [1.25, y1], [0.64, y1], [0.64, y0]], 'grey', 32, { pos: [u(BP[0]), 0, -u(BP[1])] }));
  const beads = [
    ...[PL.gap, -PL.gap].map((y) => weld([V(1.7, y, 5.7), V(7.7, y, 5.7)], u(0.22), 'grey')),
    ...[PL.gap, -PL.gap].map((y) => weldRing(u(1.28), u(0.2), 'grey', { pos: [u(BP[0]), u(y - Math.sign(y) * 0.06), -u(BP[1])] })),
  ];
  P('8', group(merged([...plates, ...collars, ...flanks, web, ...bosses], 'grey'), ...beads), [0, 0, 0]);

  // ================================================ 1 — bagues fendues à collerette
  // Ø 3 1/2 int. × 4 ext., collerette Ø 4 3/4 sur la face extérieure du collier.
  for (const s of [1, -1]) {
    const y0 = HUB.y0, y1 = HUB.y1;
    const prof = [[1.75, y0], [2.0, y0], [2.0, y1], [2.375, y1], [2.375, y1 + 0.19], [1.75, y1 + 0.19], [1.75, y0]];
    const b = L(S, prof, 'brass', 48);
    const obj = group(b);
    if (s < 0) obj.scale.y = -1;
    P('1', obj, [0, s * 0.18, 0]);
  }

  // ================================================ 12 / 15 — vis des chapeaux
  // HHCS 3/4-10 × 4 Gr 8 selon -Z, têtes et rondelles sur la face +Z des
  // chapeaux, de part et d'autre de l'alésage.
  const W15 = 0.148;
  for (const y of [2.125, -2.125]) {
    for (const x of [2.65, -2.65]) {
      P('15', along(THREE, flatWasher(S, THREE, 0.75, { t: W15, od: 1.47 }), [0, 0, 1], V(x, y, -HUB.R)), [0, 0, 0.16]);
      P('12', along(THREE, hexBolt(0.75, 4.0), [0, 0, 1], V(x, y, -HUB.R - W15)), [0, 0, 0.26]);
    }
  }

  // ================================================ 14 / 16 — vis carrées de réglage
  // SQSS 3/4-10 × 2 3/4 à bout pointu dans les flasques (selon Z), pointes
  // vers la patte de l'arbre ; contre-écrous H 3/4 contre les flasques.
  for (const s of [1, -1]) {
    const nutH = 0.75 * 0.6;
    P('16', along(THREE, hexNut(S, THREE, 0.75, { jam: true }), [0, 0, s], V(-2.4, 0, s * 3.25)), [0, 0, s * 0.12]);
    P('14', along(THREE, sqss(S, THREE, 0.75, 2.75), [0, 0, s], V(-2.4, 0, s * (3.25 + nutH))), [0, 0, s * 0.2]);
  }

  // ================================================ 3 — vérin (P078)
  // Axe du vérin dans le plan horizontal (fond en BP, embout en RP), axes des
  // œils verticaux (X local de P078 → ±Y) ; orifices vers le bas (pince
  // haute) ou vers le haut (option portsUp).
  const up = opts.portsUp ? -1 : 1;
  const ex = new THREE.Vector3(0, up, 0); // X local (orifices vers -X local)
  const ey = new THREE.Vector3(D[0], 0, -D[1]);
  const ez = new THREE.Vector3().crossVectors(ex, ey);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, ey, ez));
  const cyl = api.sub('P078', { rodEye: 'x', extended: true });
  cyl.quaternion.copy(q);
  cyl.position.set(u(BP[0]), 0, -u(BP[1]));
  const CE = [0, 0.12, -0.45];
  P('3', cyl, CE);
  // 10 — raccords droits ORB -04 → JIC -06 dans les deux orifices
  for (const py of CYL078.portY) {
    const pos = new THREE.Vector3(CYL078.portX, py, 0).applyQuaternion(q).add(new THREE.Vector3(u(BP[0]), 0, -u(BP[1])));
    const dir = new THREE.Vector3(-1, 0, 0).applyQuaternion(q);
    const a = S.group(jicStraight());
    P('10', along(THREE, a, dir.toArray(), pos.toArray()), [CE[0], -up * 0.1, CE[2]]);
  }
  function jicStraight() {
    // ORB 7/16-20 → JIC 9/16-18 : six-pans 3/4, nez conique, torique
    const g = new THREE.Group();
    g.add(merged([
      L(S, [[0, -0.36], ...S.thread(0.2185, -0.36, -0.1, { pitch: 0.05, maxTurns: 3 }), [0.19, -0.1], [0.19, 0], [0, 0]], 'zinc', 10),
      hexPrismY(0.75, 0.3, 0),
      L(S, [[0, 0.3], [0.24, 0.3], [0.24, 0.38], ...S.thread(0.281, 0.38, 0.78, { pitch: 0.055, maxTurns: 4, chamferBottom: false }), [0.2, 0.9], [0, 0.9]], 'zinc', 10),
    ], 'zinc'));
    g.add(oring(S, 0.21, 0.032, -0.06, 'rubber', 14));
    return g;
  }
  function hexPrismY(af, h, y0) {
    const R = af / 2 / Math.cos(Math.PI / 6), c = af * 0.06;
    const m = L(S, [[0, y0], [R - c * 1.6, y0], [R, y0 + c], [R, y0 + h - c], [R - c * 1.6, y0 + h], [0, y0 + h]], 'zinc', 6);
    m.children[0].rotation.y = Math.PI / 6;
    return m;
  }

  // ================================================ 9 — mâchoire mobile (P082)
  const JE = [0, 0, 0.34];
  P('9', at(api.sub('P082'), V(JP[0], 0, JP[1])), JE);

  // 4 — cales (rondelles de calage) au-dessus et au-dessous du tube de pivot
  const tH = JAW082.tubeH / 2;
  for (const s of [1, -1]) {
    const w = L(S, [[0.64, 0], [1.125, 0], [1.125, 0.0625], [0.64, 0.0625], [0.64, 0]], 'steel', 32);
    w.position.set(u(JP[0]), u(s > 0 ? tH : -tH - 0.0625), -u(JP[1]));
    P('4', w, [0, s * 0.08, JE[2]]);
  }

  // 7 — entretoises : deux à l'œil de fond (entre bossages et œil), deux dans
  // la chape de la mâchoire (de part et d'autre de l'embout)
  const eyeH = CYL078.eyeW / IN / 2;
  for (const s of [1, -1]) {
    const sp = L(S, [[0.64, eyeH], [1.0, eyeH], [1.0, HUB.y0], [0.64, HUB.y0], [0.64, eyeH]], 'zinc', 28);
    if (s < 0) sp.scale.y = -1;
    sp.position.set(u(BP[0]), 0, -u(BP[1]));
    P('7', sp, [CE[0], s * 0.07, CE[2]]);
  }
  for (const s of [1, -1]) {
    const sp = L(S, [[0.51, eyeH], [0.9, eyeH], [0.9, JAW082.slot], [0.51, JAW082.slot], [0.51, eyeH]], 'zinc', 28);
    if (s < 0) sp.scale.y = -1;
    sp.position.set(u(RP[0]), 0, -u(RP[1]));
    P('7', sp, [JE[0], s * 0.06, JE[2]]);
  }

  // ================================================ axes et arrêts
  // 6 — axes Ø 1 1/4 de la mâchoire et du fond de vérin, posés par le bas ;
  // trou transversal en bas pour la vis 13.
  const PIN6 = { y0: -PL.gap - PL.t - 0.65, y1: PL.gap + PL.t + 0.25 };
  for (const [x, z] of [JP, BP]) {
    const len = PIN6.y1 - PIN6.y0;
    const p6 = pin(S, THREE, 1.25, len);
    p6.position.set(u(x), u((PIN6.y0 + PIN6.y1) / 2), -u(z));
    P('6', p6, [0, -0.3, 0]);
    // 13 — vis CHC 1/4-20 × 2 au travers du bas de l'axe (selon X)
    P('13', along(THREE, capScrew(0.25, 2.0), [-1, 0, 0], V(x - 0.75, PIN6.y0 + 0.3, z)), [-0.08, -0.3, 0]);
  }
  // 5 — axe Ø 1 × 3 dans la chape de la mâchoire ; 2 — goupille élastique
  // Ø 1/4 × 2 au travers de la joue basse et de l'axe
  const p5 = pin(S, THREE, 1.0, 3.0);
  p5.position.set(u(RP[0]), 0, -u(RP[1]));
  P('5', p5, [JE[0], -0.16, JE[2]]);
  const rp = S.slotted(u(0.125), u(0.09), -u(1.0), u(1.0), [{ a: 0, w: 0.25, y0: -u(1.0), y1: u(1.0) }], 'blackOxide', { seg: 14 });
  P('2', along(THREE, rp, [D[0], 0, -D[1]], V(RP[0], -1.2, RP[1])), [JE[0] + 0.08 * D[0], -0.16, JE[2] - 0.08 * D[1]]);

  // ================================================ 11 — graisseurs coudés tournants
  // En tête des trois axes (6, 6, 5) et au centre des deux chapeaux.
  const elbow = () => {
    const g = [
      hexPrismY(0.4375, 0.18, 0),
      L(S, [[0, -0.25], [0.18, -0.25], [0.2, -0.2], [0.2, 0], [0, 0]], 'zinc', 8),
      L(S, [[0, 0.18], [0.16, 0.18], [0.16, 0.5], [0.12, 0.56], [0, 0.56]], 'zinc', 8),
    ];
    const arm = L(S, [[0, 0], [0.14, 0], [0.14, 0.32], [0.1, 0.36], [0.1, 0.42], [0.13, 0.45], [0.13, 0.52], [0.07, 0.56], [0, 0.56]], 'zinc', 8, { axis: 'x' });
    arm.position.y = u(0.4);
    g.push(arm);
    return merged(g, 'zinc');
  };
  for (const [x, z] of [JP, BP]) P('11', at(elbow(), V(x, PIN6.y1, z), [0, Math.PI / 2, 0]), [0, 0.12, 0]);
  P('11', at(elbow(), V(RP[0], 1.5, RP[1]), [0, Math.PI, 0]), [JE[0], 0.1, JE[2]]);
  for (const y of [2.125, -2.125]) {
    const e = along(THREE, elbow(), [0, 0, 1], V(-1.0, y, -HUB.R));
    P('11', e, [0, 0, 0.14]);
  }

  return { view: { dir: [-0.6, 0.9, 1] } };
}
