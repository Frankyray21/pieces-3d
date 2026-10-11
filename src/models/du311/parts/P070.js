// P070 — Bras de tige à axe unique V30 CX032912 rév. 2 (pages 70 à 73) :
// « ASSY, V30 SINGLE AXIS PIPE ARM », 681.79 lb. Bras de manutention des
// tiges Ø 5 po monté sur le flanc de l'avance V30 (18 de P032) :
// - châssis (6) : âme verticale de 65 po bordée de deux ailes (profil en U),
//   trois fenêtres, deux consoles d'actionneur, deux pattes à vis de calage
//   (22 + contre-écrous 29) ; fixé sur l'avance par 8 vis 5/8 × 5 po (21) et
//   rondelles fendues (28) au travers de l'âme ;
// - deux actionneurs rotatifs 180° (1, P080) coaxiaux, pieds sur les consoles
//   (4 vis 3/4 po chacun : 7 × 3 1/4 (24) + 1 × 2 3/4 (23), rondelles 27),
//   bride de sortie en haut pour l'actionneur haut, en bas pour l'actionneur
//   bas ; sur chaque bride une manivelle (8) de 9 po d'entraxe, 8 vis 3/8 × 1
//   1/2 (20) et rondelles Nord-Lock (26), qui porte l'arbre du bras dans sa
//   fente, fermée par une plaque de retenue (5, vis 22 + rondelle 27) ;
// - arbre du bras (7) : tube Ø 3 1/2 po à collets d'arrêt, pattes de réglage
//   des pinces et pattes des colliers de flexibles (2 Ø 1 1/4, 3 Ø 1 1/2
//   caoutchoutés, vis 19 + rondelles 26) ; deux pinces (11, P074) enfilées
//   dessus — la basse retournée (orifices du vérin vers le haut, P076) — et la
//   butée de tige (9) serrée en bas (2 vis 22 + rondelles 27) ;
// - jeu de mâchoires fixes Ø 5 po (10) : quatre mâchoires en V vissées dessus
//   et dessous des fourches ; jeu de remplacement « A » (CX034961-xxx, autres
//   Ø ; la ligne A désigne toutes les tailles) : un jeu rangé posé au sol à
//   côté du châssis (une seule ligne A en 3D, la -500 étant le repère 10) ;
// - clapet anti-retour double (4) sur l'âme du châssis (détail A de P072),
//   2 vis 5/16 × 2 1/4 (18) + Nord-Lock (25), raccords 12 à 15 ; raccords des
//   clapets d'équilibrage des actionneurs : coude ORB (16) et droit ORB (17).
// Repère : origine sur l'axe de rotation (axe commun des actionneurs), y = 0
// au pied du châssis ; Y vers le haut ; +X de l'axe de rotation vers l'arbre
// du bras et les pinces (position dessinée de la vue de face de P072, bras
// déployé) ; châssis côté -X, face d'appui sur l'avance à x = -4.75 po
// (-0.121 m), milieu de l'âme à z = +8.6 po (0.218 m) : les actionneurs sont
// à côté du châssis, sur des consoles soudées à son aile, et l'arbre passe
// devant l'âme en fin de course (180°) ; Z en travers, fourches ouvertes vers +Z. Arbre du bras à
// x = 9 po ; centre de la tige serrée à x = 30 po (0.762 m), z = 0 ; pinces à
// y = 13.8 et 48.1 po (config. 5 pi de P072). Encombrement ≈ 1.02 (X, de
// -0.13 à 0.89) × 1.79 (Y, de -0.12 à 1.67) × 0.40 (Z) m (le jeu « A » rangé
// au sol en plus).
// Dans P032 : bras de tige fixé sur le flanc de l'avance (P034, côté droit de
// la vue), le centre de tige des pinces amené sur l'axe de forage ; le bras
// pivote de 180° autour de l'axe des actionneurs, à 30 po (0.76 m) de l'axe de
// forage quand les pinces y sont.
// Cotes : vis, raccords et quantités de la liste ; hauteurs (châssis 65 po,
// actionneurs, pinces, collets, butée) et entraxe de manivelle 9 po relevés
// sur la vue de face « 5' FEED CONFIGURATION » de P072 (≈ 26 px/po, échelle
// des vis 3/4 po et de l'arbre) ; plaques et châssis d'après l'éclaté de P070.
import { L, u, along, hexNut } from './_avance_b.js';
import { ACT080 } from './P080.js';
import { CLAMP074 } from './P074.js';

const IN = 0.0254;
const C = 9.0; // entraxe manivelle : axe de rotation → arbre du bras
const ACT = { up: 62.0, low: 4.6 }; // faces des brides de sortie (haut : vers +Y ; bas : vers -Y)
const CRANK_T = 1.0;
const CLAMPS = [48.1, 13.8]; // milieux des pinces (haute, basse)
const FR = { x0: -4.75, x1: -4.25, z: 4.5, h: 65.0, flange: 2.5 }; // âme : faces arrière / avant
const FZ = 8.6; // milieu du châssis en Z : les actionneurs sont à côté de l'âme (vue de côté de P072)
const SHAFT = { R: 1.75, y0: -1.5, y1: ACT.up + CRANK_T };

export default function P070(api) {
  const { THREE, S } = api;
  const { merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (x, y, z) => [u(x), u(y), u(z)];

  // ------------------------------------------------ quincaillerie légère
  // (12 à 40 vis par repère : six-pans à 6 facettes, tige à 10)
  const hex = (af, h, y0, mat = 'zinc') => {
    const R = af / 2 / Math.cos(Math.PI / 6), c = af * 0.06;
    const m = L(S, [[0, y0], [R - c * 1.6, y0], [R, y0 + c], [R, y0 + h - c], [R - c * 1.6, y0 + h], [0, y0 + h]], mat, 6);
    m.children[0].rotation.y = Math.PI / 6;
    return m;
  };
  // Vis H d × len (po), dessous de tête à y = 0, tête vers +Y, filet suggéré.
  const bolt = (d, len, mat = 'zinc') => {
    const r = d / 2, AF = { 0.3125: 0.5, 0.375: 0.5625, 0.625: 0.9375, 0.75: 1.125 }[d] ?? d * 1.5;
    return merged([
      hex(AF, d * 0.62, 0.02, mat),
      L(S, [[0, 0], [AF * 0.47, 0], [AF * 0.47, 0.03], [0, 0.03]], mat, 12),
      L(S, [[0, -len], [r * 0.8, -len], [r, -len + r * 0.25], [r * 0.94, -len + r * 1.2], [r, -len + r * 2.2], [r, 0], [0, 0]], mat, 10),
    ], mat);
  };
  const ringW = (ri, ro, t, mat = 'zinc', seg = 16) => L(S, [[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]], mat, seg);
  // Rondelles Nord-Lock (paire) légères : deux disques fendus d'un trait.
  const nord = (d) => merged([ringW(d * 0.53, d * 0.9, d * 0.11, 'zinc', 12), at(ringW(d * 0.53, d * 0.9, d * 0.11, 'zinc', 12), [0, u(d * 0.12), 0])], 'zinc');
  // Rondelle plate et rondelle fendue légères (épaisseur selon +Y depuis y = 0).
  const washer = (d, t = 0.148, od = d * 1.95) => ringW(d * 0.53, od / 2, t, 'zinc', 16);
  const lockW = (d) => ringW(d * 0.53, d * 0.85, d * 0.25, 'zinc', 12);
  // Raccords hydrauliques légers (-06 JIC) : droit (queue NPT ou ORB) le long
  // de +Y, coude (nez vers +X), té (nez vers ±X), écrou tournant optionnel.
  const nose = (y0) => L(S, [[0, y0], [0.24, y0], [0.24, y0 + 0.08], [0.281, y0 + 0.1], [0.27, y0 + 0.2], [0.281, y0 + 0.3], [0.27, y0 + 0.4], [0.2, y0 + 0.52], [0, y0 + 0.52]], 'zinc', 10);
  const fitStraight = (npt) => merged([
    L(S, npt ? [[0, -0.5], [0.2, -0.5], [0.24, -0.25], [0.26, 0], [0, 0]] : [[0, -0.4], [0.2, -0.4], [0.22, -0.1], [0.19, 0], [0, 0]], 'zinc', 10),
    hex(0.75, 0.3, 0), nose(0.3),
  ], 'zinc');
  const fitElbow = ({ tee = false, swivel = false, npt = false } = {}) => {
    const g = [L(S, [[0, 0], [0.34, 0], [0.34, 0.6], [0.28, 0.72], [0, 0.72]], 'zinc', 10)];
    for (const s of tee ? [1, -1] : [1]) {
      const arm = L(S, [[0, 0], [0.3, 0], [0.3, 0.45], [0, 0.45]], 'zinc', 10, { axis: s > 0 ? 'x' : '-x' });
      arm.position.y = u(0.42);
      const n = nose(0.45);
      const ng = group(n);
      ng.rotation.z = -s * Math.PI / 2;
      ng.position.y = u(0.42);
      g.push(arm, ng);
    }
    if (swivel) g.push(hex(0.875, 0.5, -0.5));
    else g.push(hex(0.75, 0.25, -0.25), L(S, npt ? [[0, -0.7], [0.2, -0.7], [0.25, -0.25], [0, -0.25]] : [[0, -0.6], [0.21, -0.6], [0.21, -0.25], [0, -0.25]], 'zinc', 10));
    return merged(g, 'zinc');
  };

  // Prisme d'un contour [[a, b], …] (po) : plan X-Z extrudé selon Y de c0 à c1
  // ('xz'), plan Y-Z extrudé selon X ('yz'), plan X-Y extrudé selon Z ('xy') ;
  // trous ronds [a, b, r] ou contours. Arêtes cassées ≈ 1 mm.
  const circ = (cx, cz, r, n = 18) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cz + r * Math.sin((i / n) * 2 * Math.PI)]);
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  const rrect = (a0, b0, a1, b1, r, n = 4) => [
    ...arc(a1 - r, b0 + r, r, -90, 0, n), ...arc(a1 - r, b1 - r, r, 0, 90, n), ...arc(a0 + r, b1 - r, r, 90, 180, n), ...arc(a0 + r, b0 + r, r, 180, 270, n),
  ];
  const prism = (pts, holes, c0, c1, plane = 'xz') => {
    const map = plane === 'xz' ? ([a, b]) => new THREE.Vector2(u(a), -u(b)) : ([a, b]) => new THREE.Vector2(u(a), u(b));
    const shape = new THREE.Shape(pts.map(map));
    for (const h of holes) shape.holes.push(new THREE.Path((typeof h[0] === 'number' ? circ(h[0], h[1], h[2]) : h).map(map)));
    const t = u(c1 - c0), b = 0.0012;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 12 });
    geo.translate(0, 0, b + u(c0));
    if (plane === 'xz') geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(S.creaseNormals(geo), undefined);
  };
  const slabYZ = (pts, holes, x0, x1) => {
    // contour (z, y) → épaisseur selon X de x0 à x1
    const map = ([z, y]) => new THREE.Vector2(-u(z), u(y));
    const shape = new THREE.Shape(pts.map(map));
    for (const h of holes) shape.holes.push(new THREE.Path((typeof h[0] === 'number' ? circ(h[0], h[1], h[2]) : h).map(map)));
    const t = u(x1 - x0), b = 0.0012;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 12 });
    geo.translate(0, 0, b);
    // (-z, y, e) → (x0 + e, y, z) : quart de tour autour de Y
    geo.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, u(x0), 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
    return new THREE.Mesh(S.creaseNormals(geo), undefined);
  };

  // ================================================ 6 — châssis
  // Âme 9 × 1/2 po (face arrière sur l'avance), ailes de 2 1/2 po, trois
  // fenêtres, consoles d'actionneur (1 po), pattes des vis de calage.
  const brk = [[ACT.up - 8.8, ACT.up - 0.6], [ACT.low + 0.6, ACT.low + 8.8]];
  const boltRows = [64.0, 54.6, 9.0, 1.1];
  const boltZ = [-3.4, 3.4];
  const webHoles = [
    rrect(-2.1, 19.8, 2.1, 28.0, 1.0), rrect(-2.1, 35.9, 2.1, 44.2, 1.0), rrect(-2.1, 45.5, 2.1, 53.7, 1.0),
    ...boltRows.flatMap((y) => boltZ.map((z) => [z, y, 0.34])),
  ];
  const frameParts = [
    slabYZ([[-FR.z, 0], [FR.z, 0], [FR.z, FR.h], [-FR.z, FR.h]], webHoles, FR.x0, FR.x1),
    ...[-1, 1].map((s) => slabYZ([[s > 0 ? FR.z - 0.5 : -FR.z, 0], [s > 0 ? FR.z : -FR.z + 0.5, 0], [s > 0 ? FR.z : -FR.z + 0.5, FR.h], [s > 0 ? FR.z - 0.5 : -FR.z, FR.h]], [], FR.x1, FR.x1 + FR.flange)),
    // pattes des vis de calage (haut et bas, au milieu de l'âme)
    ...[[FR.h - 1.0, FR.h], [0, 1.0]].map(([y0, y1]) => slabYZ([[-1.0, y0], [1.0, y0], [1.0, y1], [-1.0, y1]], [], FR.x1, -2.75)),
  ];
  const frameG = group(merged(frameParts, 'grey'));
  frameG.position.z = u(FZ);
  // Consoles d'actionneur : plaques de 1 po soudées sur l'aile côté
  // actionneurs (z = FZ - 4.5), en saillie jusque sous les pieds des actionneurs.
  const zc = FZ - FR.z + 0.5;
  const consoles = merged(brk.map(([y0, y1]) => slabYZ([[-3.95, y0], [zc, y0], [zc, y1], [-3.95, y1]], [], FR.x1, -3.25)), 'grey');
  const frameBeads = brk.flatMap(([y0, y1]) => [weld([V(FR.x1 + 0.05, y0 - 0.05, -3.9), V(FR.x1 + 0.05, y0 - 0.05, zc)], u(0.25), 'grey'), weld([V(FR.x1 + 0.05, y1 + 0.05, -3.9), V(FR.x1 + 0.05, y1 + 0.05, zc)], u(0.25), 'grey')]);
  P('6', group(frameG, consoles, ...frameBeads), [-0.25, 0, 0]);

  // 21 / 28 — vis de fixation du châssis sur l'avance (têtes devant l'âme)
  for (const y of boltRows) {
    for (const z of boltZ) {
      P('28', along(THREE, lockW(0.625), [1, 0, 0], V(FR.x1, y, FZ + z)), [-0.25 + 0.08, 0, 0]);
      P('21', along(THREE, bolt(0.625, 5.0), [1, 0, 0], V(FR.x1 + 0.16, y, FZ + z)), [-0.25 + 0.2, 0, 0]);
    }
  }
  // 22 / 29 — vis de calage (contre-écrou contre la patte), pointe vers l'avance
  for (const y of [FR.h - 0.5, 0.5]) {
    P('29', along(THREE, hexNut(S, THREE, 0.75, { jam: true }), [1, 0, 0], V(-2.75, y, FZ)), [-0.25 + 0.12, 0, 0]);
    P('22', along(THREE, bolt(0.75, 2.5), [1, 0, 0], V(-2.75 + 0.45, y, FZ)), [-0.25 + 0.24, 0, 0]);
  }

  // ================================================ 1 — actionneurs (P080)
  // P080 : axe selon Y (bride à y = 0, corps en -Y), pieds vers -Z local →
  // ici vers -X (consoles du châssis), clapet vers +X.
  const actQ = [
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))),
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0))),
  ];
  const actY = [ACT.up, ACT.low];
  const AE = [0.08, 0, 0.42]; // éclaté des actionneurs : de côté
  actQ.forEach((q, k) => {
    const a = api.sub('P080');
    a.quaternion.copy(q);
    a.position.set(0, u(actY[k]), 0);
    P('1', a, AE);
    const toW = (x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(new THREE.Vector3(0, u(actY[k]), 0));
    // 23 / 24 / 27 — vis des pieds : 3/4 × 3 1/4 (une 3/4 × 2 3/4 sur
    // l'actionneur bas), rondelle sous tête, vers -X
    ACT080.footHoles.forEach(([fx, fy], i) => {
      const p = toW(fx, fy, ACT080.footZ + u(1.6));
      const ref = k === 1 && i === 3 ? '23' : '24';
      P('27', along(THREE, washer(0.75, 0.148, 1.47), [1, 0, 0], p.toArray()), [AE[0] + 0.06, 0, AE[2]]);
      P(ref, along(THREE, bolt(0.75, ref === '23' ? 2.75 : 3.25), [1, 0, 0], [p.x + u(0.148), p.y, p.z]), [AE[0] + 0.14, 0, AE[2]]);
    });
    // 16 / 17 — coude et raccord droit ORB → JIC sur les flancs du clapet
    // d'équilibrage (repère local de P080 : clapet en +Z, 2.5 po de large)
    const vy = -4.6, vz = 3.25;
    const p16 = toW(-u(1.25), u(vy + 0.6), u(vz));
    const d16 = new THREE.Vector3(-1, 0, 0).applyQuaternion(q);
    P('16', along(THREE, fitElbow(), d16.toArray(), p16.toArray()), [AE[0] + d16.x * 0.08, d16.y * 0.08, AE[2] + d16.z * 0.08]);
    const p17 = toW(u(1.25), u(vy + 0.6), u(vz));
    const d17 = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    P('17', along(THREE, fitStraight(false), d17.toArray(), p17.toArray()), [AE[0] + d17.x * 0.08, d17.y * 0.08, AE[2] + d17.z * 0.08]);
  });

  // ================================================ 8 — manivelles
  // Plaque de 1 po : moyeu Ø 5.2 percé de 8 trous (cercle Ø 3.1) et d'un
  // alésage Ø 0.8 sur la bride, bras jusqu'à l'arbre, fente en U Ø 3.56
  // ouverte vers +X où se loge l'arbre du bras ; 2 trous de la plaque 5.
  const crankOutline = [
    ...arc(0, 0, 2.6, 90, 270, 16), [C, -2.6], [C + 2.45, -2.6], [C + 2.6, -2.45], [C + 2.6, -1.78], [C, -1.78],
    ...arc(C, 0, 1.78, 270, 90, 12).slice(1, -1), [C, 1.78], [C + 2.6, 1.78], [C + 2.6, 2.45], [C + 2.45, 2.6], [C, 2.6],
  ];
  const flangeHoles = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 + 22.5) * Math.PI) / 180;
    return [1.55 * Math.cos(a), 1.55 * Math.sin(a)];
  });
  // + trous de la plaque de retenue 5 (vis 22 et ergot), au droit de l'oreille de l'arbre
  const crankHoles = [[0, 0, 0.4], ...flangeHoles.map(([x, z]) => [x, z, 0.21]), [C + 2.2, 2.2, 0.41], [C + 2.2, -2.2, 0.32]];
  const cranks = [[ACT.up, ACT.up + CRANK_T, 1], [ACT.low - CRANK_T, ACT.low, -1]];
  for (const [y0, y1, s] of cranks) {
    P('8', merged([prism(crankOutline, crankHoles, y0, y1)], 'grey'), [0, s * 0.3, 0]);
    // 20 / 26 — vis 3/8 × 1 1/2 et Nord-Lock, têtes sur la face extérieure
    const face = s > 0 ? y1 : y0;
    for (const [x, z] of flangeHoles) {
      P('26', along(THREE, nord(0.375), [0, s, 0], V(x, face, z)), [0, s * 0.42, 0]);
      P('20', along(THREE, bolt(0.375, 1.5), [0, s, 0], V(x, face + s * 0.09, z)), [0, s * 0.52, 0]);
    }
    // 5 — plaque de retenue sur la fente (3/8 po), vis 22 + rondelle 27,
    // ergot qui s'engage dans le trou de la manivelle
    const ry0 = s > 0 ? y1 : y0 - 0.375;
    const plate5 = merged([
      prism(rrect(C + 1.8, -2.6, C + 2.6, 2.6, 0.2), [[C + 2.2, 2.2, 0.41]], ry0, ry0 + 0.375),
      L(S, [[0, 0], [0.3, 0], [0.3, 0.6], [0.25, 0.65], [0, 0.65]], 'grey', 12, { axis: s > 0 ? '-y' : 'y', pos: V(C + 2.2, s > 0 ? ry0 : ry0 + 0.375, -2.2) }),
    ], 'grey');
    P('5', plate5, [0.45, s * 0.38, 0]);
    const rf = s > 0 ? ry0 + 0.375 : ry0;
    P('27', along(THREE, washer(0.75, 0.148, 1.47), [0, s, 0], V(C + 2.2, rf, 2.2)), [0.45, s * 0.46, 0]);
    P('22', along(THREE, bolt(0.75, 2.5), [0, s, 0], V(C + 2.2, rf + s * 0.148, 2.2)), [0.45, s * 0.56, 0]);
  }

  // ================================================ 7 — arbre du bras
  // Tube Ø 3 1/2 × 1/2 po, collets d'arrêt Ø 4 3/4 × 1/2 de part et d'autre
  // des pinces et sous les manivelles, pattes de réglage (pincées par les vis
  // 14 de P074), pattes des colliers de flexibles côté +Z.
  const SE = [0.42, 0, 0];
  const collarsY = [59.6, 51.4, 44.3, 17.1, 10.0, 5.8];
  const tabs = CLAMPS.map((y) => S.box(u(1.6), u(2.0), u(1.0), 'grey', { pos: [u(C) + CLAMP074.tabX + u(0.05), u(y), 0] }));
  const clipTabs = [42.0, 28.0].map((y) => S.box(u(0.9), u(1.2), u(0.6), 'grey', { pos: [u(C), u(y), u(SHAFT.R + 0.25)] }));
  P('7', group(
    merged([
      L(S, [[1.25, SHAFT.y0], [SHAFT.R - 0.06, SHAFT.y0], [SHAFT.R, SHAFT.y0 + 0.06], [SHAFT.R, SHAFT.y1 - 0.06], [SHAFT.R - 0.06, SHAFT.y1], [1.25, SHAFT.y1], [1.25, SHAFT.y0]], 'grey', 32, { pos: V(C, 0, 0) }),
      ...collarsY.map((y) => L(S, [[SHAFT.R, y], [2.33, y], [2.375, y + 0.04], [2.375, y + 0.46], [2.33, y + 0.5], [SHAFT.R, y + 0.5]], 'grey', 32, { pos: V(C, 0, 0) })),
      ...tabs, ...clipTabs,
      // Oreilles d'appui des manivelles (1 po) : sous la manivelle haute, sur
      // la manivelle basse ; taraudage 3/4 de la vis 22 et trou de l'ergot de 5.
      ...[[ACT.up - 1.0, ACT.up], [ACT.low, ACT.low + 1.0]].map(([y0, y1]) => prism(rrect(C - 2.4, -2.6, C + 2.6, 2.6, 0.4), [[C, 0, SHAFT.R + 0.01], [C + 2.2, 2.2, 0.33], [C + 2.2, -2.2, 0.32]], y0, y1)),
    ], 'grey'),
  ), SE);

  // ================================================ 11 — pinces (P074)
  const CLE = [0.85, 0, 0];
  CLAMPS.forEach((y, k) => {
    const c = api.sub('P074', { portsUp: k === 1 });
    c.position.set(u(C), u(y), 0);
    P('11', c, CLE);
  });

  // ================================================ 10 — mâchoires fixes Ø 5 po (et jeu A)
  // Mâchoire en V : plaque de 3/4 po qui épouse le fond de fourche (dessus de
  // la plaque haute, dessous de la plaque basse), dégagement en V pour la tige,
  // quatre vis à tête H 3/8 po (têtes dessus).
  const [pcx] = CLAMP074.pipe;
  const PCX = pcx / IN; // centre de tige, repère de P074 (po)
  const liner = (apex = 2.95, rin = 2.55) => {
    // bord extérieur : arc R 4.25 de -195° à +15° autour du centre de tige
    // (fond de fourche côté -Z) ; bord intérieur en V, sommet à -90°
    const outer = arc(PCX, 0, 4.25, -195, 15, 20);
    const inner = [[12, rin], [-50, rin], [-75, apex * 0.97], [-90, apex], [-105, apex * 0.97], [-130, rin], [-192, rin]].map(([a, r]) => [PCX + r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)]);
    return [...outer, ...inner];
  };
  const linerHoles = CLAMP074.linerHoles.map(([x, z]) => [x / IN, z / IN]);
  const linerSet = (apex, rin, place, heads = true) => {
    const out = [];
    for (const [cx, cy, cz, flip] of place) {
      const m = prism(liner(apex, rin), heads ? [] : linerHoles.map(([x, z]) => [x, z, 0.2]), 0, 0.75, 'xz');
      // têtes de vis H 3/8 (et rondelle) des vis de mâchoire
      const g = group(m, ...(heads ? linerHoles.map(([x, z]) => at(merged([hex(0.5625, 0.24, 0.06), ringW(0.2, 0.4, 0.06, 'zinc', 12)], 'zinc'), V(x, 0.75, z))) : []));
      g.position.set(u(cx), u(cy), u(cz));
      if (flip) g.scale.y = -1;
      g.updateMatrixWorld(true); // merged() lit la matrice monde des enfants
      out.push(g);
    }
    return out;
  };
  const jawPlaces = CLAMPS.flatMap((y) => [[C, y + 3.0, 0, false], [C, y - 3.0, 0, true]]);
  const jaws = linerSet(2.95, 2.55, jawPlaces);
  P('10', group(merged(jaws.map((g) => g.children[0]), 'steel'), merged(jaws.flatMap((g) => g.children.slice(1)), 'zinc')), [CLE[0], 0.12, 0]);
  // A — jeu de remplacement rangé (autre Ø, V plus profond) : quatre mâchoires
  // empilées au sol à côté du châssis.
  const stowX = -16 - PCX, stowZ = 10;
  const stowed = linerSet(3.5, 1.65, [0, 1, 2, 3].map((i) => [stowX, -4.5 + i * 0.8, stowZ, false]), false);
  P('A', merged(stowed.map((g) => g.children[0]), 'steel'), [-0.1, 0, 0.2]);

  // ================================================ 9 — butée de tige
  // Collier fendu sur le bas de l'arbre (2 vis 22 + rondelles 27 selon Z),
  // bras plié qui descend sous la tige, patin plat sous le centre de tige.
  const PS = { y0: SHAFT.y0, y1: SHAFT.y0 + 2.5 };
  const stopCollar = prism([[C - 2.6, -2.4], [C + 2.6, -2.4], [C + 2.6, 2.4], [C - 2.6, 2.4]], [[C, 0, SHAFT.R + 0.01], [[C - 2.45, -0.06], [C - SHAFT.R, -0.06], [C - SHAFT.R, 0.06], [C - 2.45, 0.06]]], PS.y0, PS.y1);
  // bras : plaque de 1/2 po dans le plan X-Y (z = ±0.25), profil plié
  const arm = prism([[C + 2.4, PS.y1], [C + 2.4, PS.y0], [C + 11.0, -4.0], [C + 27.0, -4.0], [C + 28.0, -4.5], [C + 9.5, -4.5], [C + 2.0, PS.y0 - 0.6], [C + 1.8, PS.y1]], [], -0.25, 0.25, 'xy');
  const pad = prism(rrect(C + 13.0, -3.0, C + 27.5, 3.0, 0.8), [], -5.0, -4.5);
  P('9', group(merged([stopCollar, arm, pad], 'grey'), weld([V(C + 13.2, -4.5, -0.3), V(C + 27.2, -4.5, -0.3)], u(0.2), 'grey')), [0.42, -0.3, 0]);
  for (const [x, y] of [[C - 2.15, PS.y0 + 0.75], [C - 2.15, PS.y1 - 0.75]]) {
    P('27', along(THREE, washer(0.75, 0.148, 1.47), [0, 0, 1], V(x, y, 2.4)), [0.42, -0.3, 0.1]);
    P('22', along(THREE, bolt(0.75, 2.5), [0, 0, 1], V(x, y, 2.4 + 0.148)), [0.42, -0.3, 0.2]);
  }

  // ================================================ 2 / 3 — colliers de flexibles sur l'arbre
  // Collier à bande et garniture caoutchouc (3) ou nu (2), vis 3/8 × 3/4 (19)
  // et Nord-Lock (26) dans la patte de l'arbre (côté +Z).
  // Repère local du collier : oreilles (deux épaisseurs de bande) centrées
  // sur la vis, de z = 0 (contre la patte) à 0.16 ; boucle d'axe vertical à côté (+X).
  const clip = (rin, rubber) => {
    const t = rubber ? 0.12 : 0, r0 = rin + t, r1 = r0 + 0.08;
    const band = L(S, [[r0, -0.3], [r1, -0.3], [r1, 0.3], [r0, 0.3], [r0, -0.3]], 'zinc', 20, { pos: V(0.45 + r1, 0, r1) });
    const ears = S.box(u(0.9), u(0.6), u(0.16), 'zinc', { pos: V(0, 0, 0.08) });
    const g = group(merged([band, ears], 'zinc'));
    if (rubber) g.add(L(S, [[rin, -0.32], [r0, -0.32], [r0, 0.32], [rin, 0.32], [rin, -0.32]], 'rubber', 20, { pos: V(0.45 + r1, 0, r1) }));
    return g;
  };
  const ZT = SHAFT.R + 0.55; // face de la patte
  [[2, 42.0, 0.625, false], [3, 28.0, 0.75, true]].forEach(([ref, y, rin, rubber]) => {
    P(String(ref), at(clip(rin, rubber), V(C, y, ZT)), [SE[0], 0, 0.12]);
    P('26', along(THREE, nord(0.375), [0, 0, 1], V(C, y, ZT + 0.16)), [SE[0], 0, 0.18]);
    P('19', along(THREE, bolt(0.375, 0.75), [0, 0, 1], V(C, y, ZT + 0.25)), [SE[0], 0, 0.24]);
  });

  // ================================================ 4 — clapet anti-retour double (détail A)
  // Bloc 1.5 × 3 × 1 1/4 po sur l'âme du châssis (z = +2.6), 2 vis 5/16 × 2 1/4
  // (18) + Nord-Lock (25) selon X ; raccords : dessus 15 + coude 12 et coude
  // NPT 14 ; dessous 15 + té 13 et 15 + coude 12.
  const VB = { x0: FR.x1, x1: FR.x1 + 1.25, y0: 45.8, y1: 48.8, z: FZ - 2.6 };
  const VE = [0.2, 0, 0];
  const vblock = S.box(u(1.25), u(3.0), u(1.5), 'zinc', { r: u(0.05), pos: [u((VB.x0 + VB.x1) / 2), u((VB.y0 + VB.y1) / 2), u(VB.z)] });
  const vports = [[VB.y1, 1], [VB.y0, -1]].flatMap(([y, s]) => [-0.4, 0.4].map((dz) => L(S, [[0, 0], [0.24, 0], [0.24, 0.01], [0, 0.01]], 'darkSteel', 12, { axis: s > 0 ? 'y' : '-y', pos: V((VB.x0 + VB.x1) / 2, y, VB.z + dz) })));
  P('4', group(vblock, merged(vports, 'darkSteel'), ...[-0.6, 0.6].map((dz) => L(S, [[0, 0], [0.35, 0], [0.35, 0.3], [0.3, 0.35], [0, 0.35]], 'steel', 6, { axis: 'x', pos: V(VB.x1, (VB.y0 + VB.y1) / 2, VB.z + dz) }))), VE);
  for (const y of [VB.y0 + 0.5, VB.y1 - 0.5]) {
    P('25', along(THREE, nord(0.3125), [1, 0, 0], V(VB.x1, y, VB.z - 0.45)), [VE[0] + 0.06, 0, 0]);
    P('18', along(THREE, bolt(0.3125, 2.25), [1, 0, 0], V(VB.x1 + 0.08, y, VB.z - 0.45)), [VE[0] + 0.12, 0, 0]);
  }
  const vx = (VB.x0 + VB.x1) / 2;
  const fUp = (z) => V(vx, VB.y1, VB.z + z), fDn = (z) => V(vx, VB.y0, VB.z + z);
  P('15', along(THREE, fitStraight(true), [0, 1, 0], fUp(-0.4)), [VE[0], 0.08, 0]);
  P('12', at(fitElbow({ swivel: true }), V(vx, VB.y1 + 0.82 + 0.5, VB.z - 0.4), [0, -Math.PI / 2, 0]), [VE[0], 0.16, 0]);
  P('14', at(fitElbow({ npt: true }), V(vx, VB.y1 + 0.25, VB.z + 0.4), [0, Math.PI / 2, 0]), [VE[0], 0.1, 0]);
  P('15', along(THREE, fitStraight(true), [0, -1, 0], fDn(-0.4)), [VE[0], -0.08, 0]);
  P('13', at(fitElbow({ swivel: true, tee: true }), V(vx, VB.y0 - 0.82 - 0.5, VB.z - 0.4), [Math.PI, 0, 0]), [VE[0], -0.16, 0]);
  P('15', along(THREE, fitStraight(true), [0, -1, 0], fDn(0.4)), [VE[0], -0.08, 0]);
  P('12', at(fitElbow({ swivel: true }), V(vx, VB.y0 - 0.82 - 0.5, VB.z + 0.4), [Math.PI, Math.PI / 2, 0]), [VE[0], -0.16, 0]);

  return { view: { dir: [0.9, 0.35, 1] } };
}
