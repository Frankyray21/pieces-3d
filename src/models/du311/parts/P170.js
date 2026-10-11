// P170 — Glissière « SLIDEOVER ASSEMBLY » CM41470 rév. 15 (page 170, vue
// éclatée ; implantation d'après les isométriques de P168 et la vue générale
// P010). Le châssis mécano-soudé (8) pivote sur l'arbre de basculement (fourni
// avec 8) porté par deux paliers à semelle (14) boulonnés sur le porteur
// (vis 22, rondelles 26) et arrêté par deux bagues d'arrêt (17) ; deux vérins
// de basculement Ø 6 × 23 1/8 (18, P176) le relient au porteur. Ses deux
// colonnes portent les deux barres de glissement Ø 4 po (fournies avec 8,
// disques d'about à trois vis) sur lesquelles coulissent les plaques porte-
// actionneur LH (4) et RH (5) : bossages garnis de bagues Garlock (12),
// racleurs (13) et chapeaux (6). Les plaques prennent en sandwich
// l'actionneur rotatif (9, P172), boulonnées sur ses faces (vis 23,
// rondelles 25) et centrées par une goupille (10). Deux vérins de glissière
// Ø 3 1/4 × 30 (19, P178) poussent l'ensemble le long des barres : œil de fond
// sur la chape d'une colonne (axe 1, bagues 15), œil de tige sur la chape du
// bras de plaque (axe 2, bagues 16, entretoises 7), goupilles fendues (20).
// Les vérins de basculement s'attellent par des axes (3) à plaquette d'arrêt
// (vis 21, rondelles 24) dans des chapes garnies de bagues (11).
// Repère : origine au centre de l'actionneur (origine de P172) ; X vers
// l'avant de la machine (bride de sortie 30 de l'actionneur à x = 0.297, où
// se fixe la plaque de liaison du mât P024), Y vers le haut, +Z côté
// enrouleur (latéral, le long des barres). Barres à x = -0.16, y = ±0.30 ;
// arbre de basculement à x = -0.20, y = -0.64 ; colonnes à z = ±0.62.
// Encombrement ≈ 1.6 (X, des pieds des vérins de basculement à -1.24
// jusqu'à la bride à 0.30) × 1.85 (Y, de -1.12 à +0.73) × 1.42 (Z) m.
// Vérins dessinés rentrés, glissière au milieu de sa course (±0.38 m).
// Cotes : barres Ø 4 po et bagues Garlock 4 × 4 1/2 × 6 po (liste), bagues
// 2 1/2 × 2 3/4 × 1 1/4, 1 1/4 × 1 1/2 × 5/8, 1 3/8 × 1 5/8 × 1 3/4 po, vis
// d'après la liste ; châssis et plaques d'après les proportions des vues.

import { ACT172, hexScrew, socketScrew, washerD, pose } from './P172.js';
import { CYL176 } from './P176.js';
import { CYL178 } from './P178.js';

const IN = 0.0254;

export const SLIDE170 = {
  rodX: -0.16, rodY: 0.3, rodR: 2 * IN, // barres de glissement
  pivot: [-0.2, -0.64], // axe de l'arbre de basculement (x, y)
  colZ: 0.62, // plan médian des colonnes
  flangeX: ACT172.flangeY, // face de la bride 30 (plaque de liaison du mât)
};

export default function P170(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, creaseNormals, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => pose(THREE, obj, p, dir);
  const PAINT = 'grey';
  const { rodX: RX, rodY: RY, colZ: CZ } = SLIDE170;
  const [PX, PY] = SLIDE170.pivot;

  // Pose un objet dont les axes locaux (x, y, z) deviennent ex, ey, ez.
  const frame = (obj, p, ex, ey, ez) => {
    const g = group(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...ex), new THREE.Vector3(...ey), new THREE.Vector3(...ez)));
    g.position.set(...p);
    return g;
  };
  // Extrusion selon Z d'un contour [[x, y], …] de z0 à z1, trous [x, y, r].
  const slabZ = (pts, z0, z1, mat, holes = []) => {
    const m = extrude(pts, z1 - z0, mat, { holes });
    m.position.z = (z0 + z1) / 2;
    m.geometry = creaseNormals(m.geometry);
    return m;
  };
  const arc = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // Tube creux le long de Z (bossage, bague) de z0 à z1.
  const tubeZ = (ro, ri, z0, z1, mat, x = 0, y = 0, seg = 32) =>
    at(lathe([[ri, z0], [ro, z0], [ro, z1], [ri, z1], [ri, z0]], mat, { axis: 'z', seg }), [x, y, 0]);

  // ---------------------------------------------------------------- 8 — châssis mécano-soudé
  // Deux colonnes en caisson (0.26 × 0.10, chanfreinées en haut), bossages
  // des barres, oreille basse et bossage de l'arbre de basculement ; deux
  // traverses en tube rectangulaire 6 × 4 po à l'arrière ; chapes des vérins
  // de basculement sous la traverse basse, chapes des vérins de glissière sur
  // les colonnes. Fournis avec 8 : barres Ø 4 po, arbre de basculement Ø 3 1/2,
  // disques d'about (trois vis H 1/2 po) et clavette de l'arbre.
  const frameParts = [], frameSteel = [];
  const colOutline = [
    [-0.04, 0.47], [-0.09, 0.52], [-0.25, 0.52], [-0.30, 0.47], [-0.30, -0.50],
    ...arc(PX, PY, 0.1, Math.PI, 2 * Math.PI, 14), [-0.04, -0.52],
  ];
  for (const s of [-1, 1]) {
    const z0 = s * CZ - 0.05, z1 = s * CZ + 0.05;
    frameParts.push(slabZ(colOutline, z0, z1, PAINT));
    for (const y of [-RY, RY]) frameParts.push(tubeZ(0.09, 2.02 * IN, z0 - 0.012, z1 + 0.012, PAINT, RX, y, 24));
    frameParts.push(tubeZ(0.1, 1.77 * IN, z0 - 0.012, z1 + 0.012, PAINT, PX, PY, 24));
  }
  // Traverses (tube rectangulaire creux, paroi 3/8 po) entre les colonnes.
  for (const y of [0.12, -0.38]) {
    const L = 2 * CZ - 0.1;
    frameParts.push(at(shellBox(0.1, 0.15, L, 0.0095), [-0.3, y, 0]));
  }
  function shellBox(w, h, L, t) {
    const outer = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    const m = extrude(outer, L, PAINT, { holes: [] });
    // Section creuse : contour intérieur en trou rectangulaire (Path).
    const shape = new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x, y)));
    const hole = new THREE.Path([[-w / 2 + t, -h / 2 + t], [-w / 2 + t, h / 2 - t], [w / 2 - t, h / 2 - t], [w / 2 - t, -h / 2 + t]].map(([x, y]) => new THREE.Vector2(x, y)));
    shape.holes.push(hole);
    m.geometry.dispose();
    m.geometry = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelOffset: -0.0015, bevelSegments: 1 });
    m.geometry.translate(0, 0, -L / 2);
    return m;
  }
  // Chapes des vérins de basculement : deux joues 1 1/4 po sous la traverse
  // basse, de part et d'autre de l'œil de tige (axe à x = -0.43, y = -0.47).
  const DUMP = { x: -0.43, y: -0.47, z: 0.22, ang: (35 * Math.PI) / 180 };
  const cheekGap = CYL176.eyeWidth / 2 + 0.004, cheekT = 1.25 * IN;
  const lug = (x, y, r, h, a = 0) => [...arc(x, y, r, a - Math.PI / 2, a + Math.PI / 2, 10), [x + h * Math.cos(a + Math.PI) - r * Math.sin(a), y + h * Math.sin(a + Math.PI) + r * Math.cos(a)], [x + h * Math.cos(a + Math.PI) + r * Math.sin(a), y + h * Math.sin(a + Math.PI) - r * Math.cos(a)]];
  for (const s of [-1, 1]) {
    for (const k of [-1, 1]) {
      const zc = s * DUMP.z + k * (cheekGap + cheekT / 2);
      // joue : œil Ø 5 1/2 tourné vers l'arrière-bas, pied soudé sous la traverse
      const pts = [[-0.25, -0.455], [-0.35, -0.455], ...arc(DUMP.x, DUMP.y, 0.07, Math.PI * 0.5, Math.PI * 1.45, 10), [-0.26, -0.53]];
      frameParts.push(slabZ(pts.reverse(), zc - cheekT / 2, zc + cheekT / 2, PAINT, [[DUMP.x, DUMP.y, 1.38 * IN]]));
    }
  }
  // Chapes des vérins de glissière : deux joues horizontales sur la face
  // intérieure de la colonne +Z (une en haut, une en bas), axe vertical : les
  // deux vérins, parallèles et de même sens, partent de cette colonne.
  const SL = { y: 0.44, eyeZ: 0.53 };
  const slCheek = CYL178.eyeWidth / 2 + 0.0035 + 0.003;
  for (const s of [1, -1]) {
    const y = s * SL.y, zEye = SL.eyeZ;
    for (const k of [-1, 1]) {
      const yc = y + k * (slCheek + 0.008);
      const pts = [[RX - 0.045, CZ - 0.05], [RX + 0.045, CZ - 0.05], [RX + 0.045, zEye], ...arc(RX, zEye, 0.045, 0, -Math.PI, 10).slice(1)].map(([x, z]) => [x, -z]);
      const m = extrude(pts, 0.016, PAINT, { holes: [[RX, -zEye, 0.75 * IN]] });
      m.rotation.x = -Math.PI / 2;
      m.position.y = yc;
      frameParts.push(m);
    }
  }
  // Barres de glissement Ø 4 po chromées, arbre de basculement Ø 3 1/2.
  const ZR = CZ + 0.062;
  for (const y of [-RY, RY]) frameSteel.push(cyl(2 * IN, 2 * ZR, 'chrome', { axis: 'z', seg: 28, pos: [RX, y, 0] }));
  const ZP = CZ + 0.062;
  frameSteel.push(cyl(1.75 * IN, 2 * ZP, 'steel', { axis: 'z', seg: 24, pos: [PX, PY, 0] }));
  // Disques d'about Ø 130 × 12 et leurs trois vis H 1/2 po ; clavette de l'arbre.
  const discs = [], discBolts = [];
  for (const s of [-1, 1]) {
    for (const [x, y] of [[RX, RY], [RX, -RY], [PX, PY]]) {
      discs.push(at(lathe([[0, 0], [0.065, 0], [0.065, 0.01], [0.062, 0.013], [0, 0.013]], PAINT, { axis: 'z', seg: 20 }), [x, y, s * ZR], s < 0 ? [0, Math.PI, 0] : null));
      for (let i = 0; i < 3; i++) {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
        discBolts.push(put(hexScrew(S, 0.5 * IN, 1.25 * IN), [x + Math.cos(a) * 0.032, y + Math.sin(a) * 0.032, s * (ZR + 0.013)], [0, 0, s]));
      }
    }
  }
  frameSteel.push(at(box(0.5 * IN, 0.5 * IN, 2 * IN, 'steel'), [PX, PY + 1.75 * IN, -(ZP - 0.06)]));
  P('8', group(merged([...frameParts, ...discs], PAINT), merged(frameSteel.filter((o) => true), 'chrome'), merged(discBolts, 'zinc')), [0, 0, 0]);

  // ---------------------------------------------------------------- 9 — actionneur rotatif (P172)
  // Axes de P172 : x (tubes) → +Y, y (arbre, bride 30) → +X, z → -Z.
  P('9', frame(api.sub('P172'), [0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, -1]), [0.55, 0, 0]);

  // ---------------------------------------------------------------- 4, 5 — plaques porte-actionneur
  // Plaque 1 po : enveloppe du carter (x ±0.14) et des deux bossages des
  // barres ; découpe Ø 200 autour du bossage et des vis de réglage ; bossage
  // tubulaire Ø 160 × 6 po côté extérieur ; bras à chape pour l'œil de tige du
  // vérin de glissière (plaque LH en haut vers -Z, plaque RH en bas vers +Z).
  const ZPL = ACT172.body[2] / 2 + 0.006; // face intérieure des plaques (bossage du carter)
  const PT = 1.0 * IN;
  const BOSS_L = 6 * IN;
  const plateOutline = [
    [0.14, -0.2], [0.14, 0.2], [0.1, 0.24],
    ...arc(RX, RY, 0.085, Math.PI * 0.25, Math.PI, 10), [RX - 0.085, -RY],
    ...arc(RX, -RY, 0.085, Math.PI, Math.PI * 1.75, 10), [0.1, -0.24],
  ];
  // Taraudages du carter (repère P172 (x, y) → P170 (y, x)).
  const tapped = [[-0.07, 0.11], [0.07, 0.11], [-0.11, 0.035], [0.11, 0.035], [-0.11, -0.04], [0.11, -0.04], [-0.07, -0.115], [0.07, -0.115]].map(([x, y]) => [y, x]);
  for (const s of [-1, 1]) {
    // Plaque RH (5) côté -Z, à deux bras ; plaque LH (4) côté +Z, simple bielle.
    const ref = s < 0 ? '5' : '4';
    const z0 = s * ZPL, z1 = s * (ZPL + PT);
    const zb = s * (ZPL + BOSS_L);
    const parts = [slabZ(plateOutline, Math.min(z0, z1), Math.max(z0, z1), PAINT, [[0, 0, 0.1], [RX, RY, 2.25 * IN + 0.002], [RX, -RY, 2.25 * IN + 0.002]])];
    for (const y of [-RY, RY]) parts.push(tubeZ(0.08, 2.25 * IN + 0.002, Math.min(z0, zb), Math.max(z0, zb), PAINT, RX, y));
    // bras et chapes (plaque RH seulement) : au-dessus de la barre haute et
    // au-dessous de la barre basse, jusqu'aux yeux de tige des deux vérins
    const zTip = SL.eyeZ - CYL178.pinRetracted; // œil de tige des vérins
    const zArm0 = z1, zArm1 = zTip;
    for (const ya of s < 0 ? [SL.y, -SL.y] : []) for (const k of [-1, 1]) {
      const yc = ya + k * (slCheek + 0.008);
      const zA = Math.min(zArm0, zArm1), zB = Math.max(zArm0, zArm1);
      const pts = (s < 0
        ? [[RX - 0.045, zB], [RX + 0.045, zB], [RX + 0.045, zA], ...arc(RX, zA, 0.045, 0, -Math.PI, 10).slice(1)]
        : [[RX + 0.045, zA], [RX - 0.045, zA], [RX - 0.045, zB], ...arc(RX, zB, 0.045, Math.PI, 0, 10).slice(1)]).map(([x, z]) => [x, -z]);
      const m = extrude(pts.reverse(), 0.016, PAINT, { holes: [[RX, -(s < 0 ? zA : zB), 0.82 * IN]] });
      m.rotation.x = -Math.PI / 2;
      m.position.y = yc;
      parts.push(m);
    }
    // âmes reliant les chapes aux bossages des barres
    if (s < 0) for (const ya of [SL.y, -SL.y]) parts.push(at(box(0.09, 0.1, 0.03, PAINT, { r: 0.004 }), [RX, Math.sign(ya) * 0.415, z1 + s * 0.015]));
    P(ref, group(merged(parts, PAINT)), [0, 0, s * 0.3]);

    // 23 + 25 — vis H 5/8 UNF × 1 1/2 et rondelles : plaque sur le carter
    for (const [x, y] of tapped) {
      P('25', put(washerD(S, 0.625 * IN, 'zinc', { od: 1.31 * IN, t: 0.095 * IN }), [x, y, z1], [0, 0, s]), [0, 0, s * 0.45]);
      P('23', put(hexScrew(S, 0.625 * IN, 1.5 * IN), [x, y, z1 + s * 0.095 * IN], [0, 0, s]), [0, 0, s * 0.55]);
    }
    // 10 — goupille de centrage plaque / carter (tenue par une vis 21)
    P('10', put(lathe([[0, -0.03], [0.0095, -0.03], [0.0095, 0.004], [0.016, 0.004], [0.016, 0.012], [0, 0.012]], 'steel', { seg: 16 }), [0.11, 0.13, z1], [0, 0, s]), [0, 0, s * 0.5]);
    P('24', put(washerD(S, 0.375 * IN, 'zinc', { od: 0.6 * IN, t: 0.09 * IN }), [0.11, 0.155, z1], [0, 0, s]), [0, 0.04, s * 0.5]);
    P('21', put(hexScrew(S, 0.375 * IN, 1.0 * IN), [0.11, 0.155, z1 + s * 0.09 * IN], [0, 0, s]), [0, 0.04, s * 0.58]);

    for (const y of [-RY, RY]) {
      // 12 — bague Garlock GM6472-96 (4 × 4 1/2 × 6 po) dans le bossage
      P('12', tubeZ(2.25 * IN, 2.02 * IN, Math.min(z0, zb) + 0.003, Math.max(z0, zb) - 0.003, 'brass', RX, y, 24), [0, 0, s * 0.45]);
      // 13 — racleurs de tige aux deux bouts du bossage
      for (const [zz, dz] of [[z0, -1], [zb, 1]]) {
        const zw = zz + (dz * s > 0 ? s * 0.012 : -s * 0.002);
        P('13', at(lathe([[2.01 * IN, -0.006], [2.4 * IN, -0.006], [2.4 * IN, 0.004], [2.1 * IN, 0.006], [2.01 * IN, 0.002], [2.01 * IN, -0.006]], 'rubber', { axis: 'z', seg: 18 }), [RX, y, zw], dz * s > 0 ? (s > 0 ? null : [0, Math.PI, 0]) : (s > 0 ? [0, Math.PI, 0] : null)), [0, 0, s * (dz * s > 0 ? 0.62 : 0.12)]);
      }
      // 6 — chapeau Ø 150 × 12 sur le bout du bossage, quatre vis 21 et rondelles 24
      const zc = zb + s * 0.006;
      P('6', tubeZ(0.075, 2.08 * IN, zc - 0.006, zc + 0.006, PAINT, RX, y, 24), [0, 0, s * 0.55]);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const p = [RX + Math.cos(a) * 0.064, y + Math.sin(a) * 0.064, zc + s * 0.006];
        P('24', put(washerD(S, 0.375 * IN, 'zinc', { od: 0.6 * IN, t: 0.09 * IN }), p, [0, 0, s]), [0, 0, s * 0.62]);
        P('21', put(hexScrew(S, 0.375 * IN, 1.0 * IN), [p[0], p[1], p[2] + s * 0.09 * IN], [0, 0, s]), [0, 0, s * 0.68]);
      }
    }
  }

  // ---------------------------------------------------------------- 19 — vérins de glissière (P178)
  // Deux vérins parallèles de même sens : œil de fond sur les chapes de la
  // colonne +Z, tige vers -Z jusqu'aux bras de la plaque RH. Axes des yeux
  // verticaux, bloc des valves vers l'arrière (-X).
  for (const s of [1, -1]) {
    const y = s * SL.y, zF = SL.eyeZ, zT = zF - CYL178.pinRetracted;
    P('19', frame(api.sub('P178'), [RX, y, zF], [0, 0, -1], [-1, 0, 0], [0, 1, 0]), [0, s * 0.35, 0]);
    // 1 — axe de l'œil de fond (Ø 1 1/4), tête en haut, goupille fendue dessous ;
    // 15 — bagues 1 1/4 × 1 1/2 × 5/8 dans les joues de la chape.
    // 2 — axe de l'œil de tige (Ø 1 3/8) ; 16 — bagues 1 3/8 × 1 5/8 × 1 3/4 ;
    // 7 — entretoises entre l'œil et les joues.
    for (const [zp, ref, r, bushRef, bro, bri, bl] of [
      [zF, '1', 0.625 * IN, '15', 0.75 * IN, 0.625 * IN, 0.625 * IN],
      [zT, '2', 0.6875 * IN, '16', 0.8125 * IN, 0.6875 * IN, 1.75 * IN],
    ]) {
      const top = y + slCheek + 0.016 + 0.003;
      const bot = y - slCheek - 0.016 - 0.012;
      const pin = lathe([
        [0, bot - 0.006], [r * 0.85, bot - 0.006], [r, bot], [r, top], [r * 1.6, top], [r * 1.6, top + 0.008], [r * 1.45, top + 0.011], [0, top + 0.011],
      ], 'steel', { seg: 20 });
      P(ref, at(pin, [RX, 0, zp]), [0, 0.18, 0]);
      P('20', put(group(
        lathe([[0, -0.028], [0.0032, -0.028], [0.0032, 0.0], [0, 0.0]], 'zinc', { seg: 8 }),
        at(lathe([[0.0034, -0.0016], [0.0066, -0.0016], [0.0066, 0.0016], [0.0034, 0.0016], [0.0034, -0.0016]], 'zinc', { axis: 'z', seg: 10 }), [0, 0.004, 0]),
      ), [RX + 0.014, bot + 0.004 - 0.008, zp], [-1, 0, 0]), [-0.1, -0.12, 0]);
      for (const k of [-1, 1]) {
        const yb = y + k * (slCheek + 0.008);
        P(bushRef, at(lathe([[bri, -bl / 2], [bro, -bl / 2], [bro, bl / 2], [bri, bl / 2], [bri, -bl / 2]], 'brass', { seg: 24 }), [RX, yb, zp]), [0, k * 0.1, 0]);
        if (ref === '2') {
          // entretoise entre la joue et l'œil de tige
          const yc = y + k * (CYL178.eyeWidth / 2 + 0.003);
          P('7', at(lathe([[r + 0.0005, -0.003], [0.024, -0.003], [0.024, 0.003], [r + 0.0005, 0.003], [r + 0.0005, -0.003]], 'zinc', { seg: 24 }), [RX, yc, zp]), [0, k * 0.06, 0]);
        }
      }
    }
  }

  // ---------------------------------------------------------------- 18 — vérins de basculement (P176)
  // Œil de tige dans la chape sous la traverse basse, fond vers l'arrière et
  // le bas (35° sous l'horizontale ; P168 suggère plutôt 45°, ce qui mettrait les pieds au sol avec la hauteur retenue) vers les chapes du porteur.
  const dir = [Math.cos(DUMP.ang), Math.sin(DUMP.ang), 0];
  for (const s of [-1, 1]) {
    const zc = s * DUMP.z;
    const base = [DUMP.x - dir[0] * CYL176.pinRetracted, DUMP.y - dir[1] * CYL176.pinRetracted, zc];
    P('18', frame(api.sub('P176'), base, dir, [-dir[1], dir[0], 0], [0, 0, 1]), [-0.35, -0.2, s * 0.15]);
    // 3 — axes Ø 2 1/2 à plaquette d'arrêt (en haut et au pied) ; vis 21, rondelles 24
    for (const [p, e] of [[[DUMP.x, DUMP.y], [-0.12, 0, s * 0.42]], [[base[0], base[1]], [-0.5, -0.2, s * 0.42]]]) {
      const half = cheekGap + cheekT + 0.01;
      const z0 = zc - s * half, z1 = zc + s * half;
      const pin = group(
        lathe([[0, -0.006], [1.15 * IN, -0.006], [1.25 * IN, 0], [1.25 * IN, 2 * half], [1.25 * IN - 0.003, 2 * half + 0.003], [0, 2 * half + 0.003]], 'steel', { seg: 28 }),
        at(box(0.11, 0.012, 0.05, 'steel', { r: 0.003 }), [0.025, -0.012, 0]),
      );
      P('3', put(pin, [p[0], p[1], z1 + s * 0.006], [0, 0, -s]), e);
      const bp = [p[0] + 0.06, p[1], z1 + s * 0.012];
      P('24', put(washerD(S, 0.375 * IN, 'zinc', { od: 0.6 * IN, t: 0.09 * IN }), bp, [0, 0, s]), [e[0], e[1], e[2] + s * 0.08]);
      P('21', put(hexScrew(S, 0.375 * IN, 1.0 * IN), [bp[0], bp[1], bp[2] + s * 0.09 * IN], [0, 0, s]), [e[0], e[1], e[2] + s * 0.14]);
    }
    // 11 — bagues 2 1/2 × 2 3/4 × 1 1/4 dans les deux joues de la chape haute
    for (const k of [-1, 1]) {
      P('11', tubeZ(1.375 * IN, 1.25 * IN, zc + k * (cheekGap + cheekT / 2) - cheekT / 2, zc + k * (cheekGap + cheekT / 2) + cheekT / 2, 'brass', DUMP.x, DUMP.y, 28), [-0.12, 0, s * 0.3 + k * 0.05]);
    }
  }

  // ---------------------------------------------------------------- 14 — paliers à semelle de l'arbre de basculement
  // Palier en fonte : semelle 0.36 × 0.05 × 0.10 à deux trous oblongs, corps
  // rond Ø 0.2, chapeau ; deux vis H 1 po × 3 3/4 (22) et rondelles Nord-Lock (26).
  const ZB = 0.49;
  for (const s of [-1, 1]) {
    const zc = s * ZB;
    const yb = PY - 0.13; // dessous de la semelle
    const body = group(
      merged([
        at(box(0.36, 0.05, 0.1, 'castIron', { r: 0.008 }), [0, 0.025, 0]),
        at(box(0.16, 0.09, 0.1, 'castIron', { r: 0.01 }), [0, 0.07, 0]),
        tubeZ(0.1, 1.76 * IN, -0.05, 0.05, 'castIron', 0, 0.13, 36),
      ], 'castIron'),
      at(cyl(0.012, 0.012, 'brass', { seg: 10 }), [0, 0.236, 0]),
    );
    P('14', at(body, [PX, yb, zc]), [0, -0.3, 0]);
    for (const dx of [-0.14, 0.14]) {
      const p = [PX + dx, yb + 0.05, zc];
      P('26', at(washerD(S, 1.0 * IN, 'zinc', { od: 1.6 * IN, t: 0.24 * IN }), p), [0, 0.12, 0]);
      P('22', at(hexScrew(S, 1.0 * IN, 3.75 * IN), [p[0], p[1] + 0.24 * IN, p[2]]), [0, 0.22, 0]);
    }
    // 17 — bague d'arrêt fendue sur l'arbre, côté intérieur du palier, et sa vis de serrage
    const zcol = zc - s * 0.075;
    const collar = group(
      tubeZ(0.065, 1.75 * IN, -0.02, 0.02, 'blackOxide', 0, 0, 36),
      at(socketScrew(S, 0.5 * IN, 1.5 * IN, 'blackOxide'), [0.045, 0.055, 0]),
    );
    P('17', at(collar, [PX, PY, zcol]), [0, 0, -s * 0.12]);
  }

  return { view: { dir: [1.0, 0.55, 0.9] } };
}
