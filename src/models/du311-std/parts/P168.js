// P168 — Glissière « SLIDEOVER ARRANGEMENT » CX012628 rév. 7 (page 168 :
// isométrique d'ensemble et vue éclatée ; implantation d'après P164 et P166).
// Le châssis avant (5, P180) est boulonné sur le nez du porteur par douze
// vis H 1 po × 3 1/2 (7) et rondelles Nord-Lock (10) passées depuis
// l'intérieur dans sa paroi arrière. Sur ses sièges avant, deux paliers à
// semelle en fonte (1) portent l'arbre de basculement de la glissière (2,
// P170) : deux vis H 1 po UNF × 5 1/2 (8), rondelles Nord-Lock SP (11) et
// écrous (13) chacun, réglage longitudinal par deux vis carrées de poussée
// 1 po × 3 (9) et leurs contre-écrous (12) ; deux bagues d'arrêt fendues (4)
// sur l'arbre, côté intérieur des paliers. Deux vérins de basculement (3,
// CX000675, sans liste propre : dessinés ici pièce par pièce) relient les
// chapes basses de la paroi arrière de P180 aux blocs bas du cadre de la
// glissière ; coudes 90° ORB → JIC (6) sur leurs orifices.
// Vérin de basculement : alésage 4 po, tige Ø 2 po, course 15 po, entraxe
// rentré 27 po (0.686 m) ; œils Ø 4 × 2 po alésés Ø 2 1/2 (axes P180 rep. 1
// et P170 rep. 21), tube Ø 4 3/4, fond soudé, tête vissée à racleur,
// orifices ORB -6 côté fond et côté tête sur le dessus, tube d'huile Ø 3/8
// de l'orifice de tête jusqu'au collier près du fond, graisseurs aux œils.
// Dessiné sorti de 0.325 m (cadre dressé : entraxe 1.010 m entre
// SLIDE.dump.a et SLIDE.dump.b).
// Repère : celui de la machine (../layout.js : X vers l'avant, Y vers le
// haut, Z à droite), placé à l'identité par P164. P170 est posé en AC
// (centre du carter de l'actionneur), P180 en DECK (_slide.js) ; arbre de
// basculement sur SLIDE.pivot ; paliers à z = ±0.62, bagues d'arrêt à ±0.535.
// Encombrement ≈ 1.40 (X, de 2.2 à 3.6) × 1.75 (Y) × 1.80 (Z) m.
// Simulation : châssis avant, paliers, visserie et coudes → « front » ; bagues
// d'arrêt → « tilt » ; vérins détaillés « dumpR » (z > 0) et « dumpL »
// (front → tilt), axes de leurs œils en SLIDE.dump.a / SLIDE.dump.b.

import { body, ramDetailed, rodSide } from '../layout.js';
import { IN, u, AC, DECK, DECK_BOLTS, SLIDE, frame, along, hhcs, sqss, hexNut, nordLock, socketScrew, jicElbow, zerk, slabY, arc } from './_slide.js';

// Vérin de basculement (po) : cotes axiales depuis l'axe de l'œil de fond, vérin rentré.
const DC = {
  eyeR: 2.0, eyeT: 2.0, pin: 1.25,
  capFace: 2.1, capIn: 3.25, tubeEnd: 22.8, glandIn: 20.6, glandTop: 23.8,
  piston: [3.25, 5.25], rodEnd: 24.7, eye: 27.0, stroke: 15,
  tubeR: 2.375, bore: 2.0, rodR: 1.0,
  ports: [4.3, 21.5],
};

export default function P168(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, weld, weldRing, extrude, tube, group, at, nut } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (obj) => body('front', obj);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const [PVX, PVY] = [SLIDE.pivot.x, SLIDE.pivot.y];
  const RP = 1.75 * IN; // arbre Ø 3 1/2

  // ================================================================ 2 — glissière, 5 — châssis avant
  P('2', at(api.sub('P170'), AC), [0.35, 0.25, 0]);
  P('5', F(at(api.sub('P180'), DECK)), [-0.25, -0.25, 0]);

  // ================================================================ 7 + 10 — fixation du châssis avant sur le nez du porteur
  for (const p of DECK_BOLTS) {
    P('10', F(put(nordLock(S, THREE, 1.0), p, [1, 0, 0])), [0.18, 0, 0]);
    P('7', F(put(hhcs(S, THREE, 1.0, 3.5), [p[0] + 0.0056, p[1], p[2]], [1, 0, 0])), [0.26, 0, 0]);
  }

  // ================================================================ 1 — paliers à semelle, 8, 11, 13, 9, 12
  // Palier en fonte : semelle 0.36 × 0.035 × 0.10 à deux trous, pied, corps Ø 170 et chapeau
  // à deux vis, roulement à collier de serrage dépassant des deux côtés, graisseur dessus.
  const HB = 0.105; // hauteur d'axe
  const yPad = PVY - HB; // dessus des sièges
  for (const s of [-1, 1]) {
    const zc = s * 0.62;
    const housing = merged([
      slabY(S, [[-0.18, -0.05], [0.18, -0.05], [0.18, 0.05], [-0.18, 0.05]], 0, 0.035, 'castIron', [[-0.14, 0, 0.58 * IN], [0.14, 0, 0.58 * IN]]),
      at(box(0.17, 0.06, 0.095, 'castIron', { r: 0.012 }), [0, 0.058, 0]),
      at(lathe([[0.062, -0.047], [0.085, -0.047], [0.087, -0.044], [0.087, 0.044], [0.085, 0.047], [0.062, 0.047], [0.062, -0.047]], 'castIron', { axis: 'z', seg: 40 }), [0, HB, 0]),
      // pattes du chapeau
      at(box(0.235, 0.03, 0.07, 'castIron', { r: 0.006 }), [0, HB + 0.004, 0]),
    ], 'castIron');
    const insert = merged([
      at(lathe([[RP, -0.062], [0.052, -0.062], [0.052, -0.047], [0.062, -0.047], [0.062, 0.047], [0.052, 0.047], [0.052, 0.062], [RP, 0.062], [RP, -0.062]], 'steel', { axis: 'z', seg: 36 }), [0, HB, 0]),
    ], 'steel');
    const capBolts = merged([-0.1, 0.1].map((x) => at(hhcs(S, THREE, 0.625, 2.5), [x, HB + 0.019, 0])), 'zinc');
    const nipple = at(zerk(S, 1.0), [0, HB + 0.087, 0]);
    // vis de serrage du collier du roulement
    const setScr = merged([0, 1].map((k) => at(lathe([[0, 0], [0.005, 0], [0.005, 0.006], [0, 0.006]], 'blackOxide', { seg: 8 }), [0, HB + 0.052, s * (k ? 0.055 : -0.055)])), 'blackOxide');
    P('1', F(at(group(housing, insert, capBolts, nipple, setScr), [PVX, yPad, zc])), [0, -0.35, s * 0.1]);
    for (const dx of [-0.14, 0.14]) {
      const x = PVX + dx;
      P('11', F(at(nordLock(S, THREE, 1.0), [x, yPad + 0.035, zc])), [0, 0.12, 0]);
      P('8', F(at(hhcs(S, THREE, 1.0, 5.5), [x, yPad + 0.035 + 0.0056, zc])), [0, 0.22, 0]);
      P('11', F(put(nordLock(S, THREE, 1.0), [x, yPad - 0.025, zc], [0, -1, 0])), [0, -0.5, 0]);
      P('13', F(put(hexNut(S, THREE, 1.0), [x, yPad - 0.025 - 0.0056, zc], [0, -1, 0])), [0, -0.58, 0]);
    }
    // vis de poussée dans les pattes du siège, devant et derrière la semelle
    for (const e of [-1, 1]) {
      const xLug = PVX + e * 0.205; // face extérieure de la patte
      const y = yPad + 0.0175;
      P('9', F(put(sqss(S, THREE, 1.0, 3.0), [PVX + e * (0.18 + 3.0 * IN), y, zc], [e, 0, 0])), [e * 0.2, 0, 0]);
      P('12', F(put(hexNut(S, THREE, 1.0, { jam: true }), [xLug, y, zc], [e, 0, 0])), [e * 0.14, 0, 0]);
    }
  }

  // ================================================================ 4 — bagues d'arrêt fendues sur l'arbre
  for (const s of [-1, 1]) {
    const collar = group(
      merged([
        at(S.slotted(0.072, RP, -0.0175, 0.0175, [{ a: Math.PI / 2, w: 0.04, y0: -0.02, y1: 0.02 }], 'blackOxide', { seg: 36 }), [0, 0, 0], [Math.PI / 2, 0, 0]),
        // bossages de la vis de serrage, de part et d'autre de la fente
        ...[-1, 1].map((k) => at(box(0.028, 0.03, 0.035, 'blackOxide', { r: 0.004 }), [k * 0.018, 0.066, 0])),
      ], 'blackOxide'),
      at(socketScrew(S, 0.5 * IN, 1.75 * IN), [0.034, 0.066, 0], [0, 0, -Math.PI / 2]),
    );
    P('4', body('tilt', at(collar, [PVX, PVY, s * 0.535])), [0, 0, -s * 0.15]);
  }

  // ================================================================ 3 — vérins de basculement (détaillés), 6 — coudes
  const [ax, ay] = SLIDE.dump.a, [bx_, by_] = SLIDE.dump.b;
  const L0 = Math.hypot(bx_ - ax, by_ - ay);
  const phi = Math.atan2(by_ - ay, bx_ - ax);
  const ext = L0 - u(DC.eye);
  for (const s of [1, -1]) {
    const z = s * SLIDE.dump.z;
    const cylObj = group(dumpCylinder(ext));
    cylObj.position.set(ax, ay, z);
    cylObj.rotation.z = phi;
    P('3', ramDetailed(s > 0 ? 'dumpR' : 'dumpL', 'front', 'tilt', cylObj, { rear: [0, 0, 0], rod: [L0, 0, 0], stroke: u(DC.stroke), closed: u(DC.eye) }), [0, 0, s * 0.35]);
    // coudes sur les orifices (dessus du vérin, +Y local), nez vers le fond (−X local)
    const c = Math.cos(phi), sn = Math.sin(phi);
    for (const px of DC.ports) {
      const lx = u(px), ly = u(DC.tubeR + 0.55);
      const pos = [ax + lx * c - ly * sn, ay + lx * sn + ly * c, z];
      const ey = [-sn, c, 0], ex = [-c, -sn, 0];
      const ez = [ex[1] * ey[2] - ex[2] * ey[1], ex[2] * ey[0] - ex[0] * ey[2], ex[0] * ey[1] - ex[1] * ey[0]];
      P('6', F(frame(THREE, jicElbow(S, THREE, 6), pos, ex, ey, ez)), [-sn * 0.12, c * 0.12, s * 0.35]);
    }
  }

  // Vérin de basculement le long de +X (repère : œil de fond à l'origine, axes des œils selon Z,
  // orifices vers +Y) ; ext : sortie de tige (m). Les pièces côté tige sont marquées rodSide.
  function dumpCylinder(ext) {
    const L = (pts, mat, seg = 36) => lathe(pts.map(([r, x]) => [u(r), u(x)]), mat, { seg, axis: 'x' });
    const v3 = (x, y, zz = 0) => [u(x), u(y), u(zz)];
    const eye = (cx, dir, foot) => {
      const pts = [];
      for (let i = 0; i <= 18; i++) {
        const a = -Math.PI / 2 + (i / 18) * Math.PI;
        pts.push([cx + dir * DC.eyeR * Math.cos(a), DC.eyeR * Math.sin(a)]);
      }
      pts.push(...foot);
      let area = 0;
      pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; area += x0 * y1 - x1 * y0; });
      if (area < 0) pts.reverse();
      return extrude(pts.map(([x, y]) => [u(x), u(y)]), u(DC.eyeT), 'grey', { holes: [[u(cx), 0, u(DC.pin + 0.12)]] });
    };
    const R = DC.tubeR, B = DC.bore;
    // fût : tube, fond soudé et œil, bossages des orifices, collier du tube d'huile
    const barrel = merged([
      L([[B, DC.capIn], [R - 0.06, DC.capIn], [R, DC.capIn + 0.06], [R, DC.tubeEnd - 0.05], [R - 0.05, DC.tubeEnd], [B, DC.tubeEnd], [B, DC.capIn]], 'grey', 36),
      L([[0, DC.capFace], [R - 0.08, DC.capFace], [R, DC.capFace + 0.08], [R, DC.capIn - 0.1], [R - 0.06, DC.capIn], [0, DC.capIn]], 'grey', 36),
      eye(0, -1, [[DC.capFace + 0.02, DC.eyeR * 0.9], [DC.capFace + 0.02, -DC.eyeR * 0.9]]),
      ...DC.ports.map((px) => at(S.cyl(u(0.55), u(0.6), 'grey', { seg: 16 }), v3(px, R + 0.2))),
      at(box(u(1.2), u(0.5), u(0.8), 'grey', { r: u(0.08) }), v3(7.0, R + 0.2)),
    ], 'grey');
    barrel.userData.hasInterior = true;
    const welds = group(
      weldRing(u(R - 0.03), u(0.2), 'grey', { axis: 'x', pos: v3(DC.capIn + 0.04, 0) }),
      weld([v3(DC.capFace - 0.02, DC.eyeR * 0.9 + 0.05, -DC.eyeT / 2 - 0.05), v3(DC.capFace - 0.02, DC.eyeR * 0.9 + 0.05, DC.eyeT / 2 + 0.05)], u(0.18), 'grey'),
      weld([v3(DC.capFace - 0.02, -DC.eyeR * 0.9 - 0.05, -DC.eyeT / 2 - 0.05), v3(DC.capFace - 0.02, -DC.eyeR * 0.9 - 0.05, DC.eyeT / 2 + 0.05)], u(0.18), 'grey'),
    );
    // bague acier de l'œil de fond, graisseur
    const bushes = merged([at(lathe([[DC.pin, -1], [DC.pin + 0.12, -1], [DC.pin + 0.12, 1], [DC.pin, 1], [DC.pin, -1]].map(([r, zz]) => [u(r), u(zz)]), 'steel', { axis: 'z', seg: 28 }), [0, 0, 0])], 'steel');
    const zk0 = at(zerk(S, 1.0), v3(-DC.eyeR + 0.02, 0), [0, 0, Math.PI / 2]);
    // tête vissée, racleur
    const gland = group(
      L([[DC.rodR + 0.02, DC.glandIn], [B - 0.02, DC.glandIn], ...S.thread(B - 0.02, DC.glandIn + 0.2, DC.tubeEnd - 0.1, { pitch: 1 / 12, maxTurns: 4 }), [B - 0.02, DC.tubeEnd], [R - 0.1, DC.tubeEnd], [R - 0.1, DC.glandTop - 0.06], [R - 0.16, DC.glandTop], [DC.rodR + 0.25, DC.glandTop], [DC.rodR + 0.25, DC.glandTop - 0.2], [DC.rodR + 0.02, DC.glandTop - 0.2], [DC.rodR + 0.02, DC.glandIn]], 'grey', 32),
      L([[DC.rodR + 0.005, DC.glandTop - 0.2], [DC.rodR + 0.24, DC.glandTop - 0.2], [DC.rodR + 0.24, DC.glandTop + 0.03], [DC.rodR + 0.1, DC.glandTop + 0.06], [DC.rodR + 0.005, DC.glandTop + 0.03]], 'rubber', 24),
      // trous de clé à ergots sur la collerette
      merged([0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 2 + Math.PI / 4; return at(S.cyl(u(0.12), u(0.05), 'darkSteel', { axis: 'x', seg: 8 }), v3(DC.glandTop + 0.01, Math.cos(a) * (R - 0.45), Math.sin(a) * (R - 0.45))); }), 'darkSteel'),
    );
    // tube d'huile Ø 3/8 : coude de tête (rep. 6 de P168) → collier près du fond, écrou JIC et union
    const yl = R + 1.1;
    const oil = tube([v3(DC.ports[1] - 1.1, yl), v3(DC.ports[1] - 2.5, yl), v3(10, yl), v3(8.0, yl - 0.1), v3(7.6, yl - 0.25)], u(0.1875), 'steel', { seg: 24, tension: 0.3, radial: 8 });
    const oilFit = merged([
      at(nut(u(0.6875), u(0.45), 'zinc', { axis: 'x' }), v3(DC.ports[1] - 1.3, yl)),
      at(nut(u(0.6875), u(0.45), 'zinc', { axis: 'y' }), v3(7.6, yl - 0.4)),
      at(lathe([[0, 0], [0.24, 0], [0.24, 0.5], [0.18, 0.56], [0, 0.56]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }), v3(7.0, R + 0.45), [Math.PI, 0, 0]),
    ], 'zinc');
    // côté tige : tige chromée, piston et écrou de blocage, œil de tige soudé, bague, graisseur
    const rodG = group(
      L([[0, DC.piston[1]], [DC.rodR - 0.05, DC.piston[1]], [DC.rodR, DC.piston[1] + 0.05], [DC.rodR, DC.rodEnd - 0.1], [DC.rodR - 0.1, DC.rodEnd], [0, DC.rodEnd]], 'chrome', 28),
      L([[0, DC.piston[0]], [B - 0.06, DC.piston[0]], [B - 0.01, DC.piston[0] + 0.06], [B - 0.01, DC.piston[0] + 0.5], [B - 0.15, DC.piston[0] + 0.5], [B - 0.15, DC.piston[0] + 1.2], [B - 0.01, DC.piston[0] + 1.2], [B - 0.01, DC.piston[1] - 0.06], [B - 0.06, DC.piston[1]], [0, DC.piston[1]]], 'steel', 32),
      L([[B - 0.15, DC.piston[0] + 0.5], [B - 0.005, DC.piston[0] + 0.5], [B - 0.005, DC.piston[0] + 1.2], [B - 0.15, DC.piston[0] + 1.2], [B - 0.15, DC.piston[0] + 0.5]], 'blue', 32),
      at(nut(u(2.5), u(0.9), 'steel', { axis: 'x' }), v3(DC.piston[0] - 0.45, 0)),
      eye(DC.eye, 1, [[DC.rodEnd - 0.05, DC.rodR + 0.05], [DC.rodEnd - 0.05, -DC.rodR - 0.05]]),
      weldRing(u(DC.rodR + 0.02), u(0.16), 'grey', { axis: 'x', pos: v3(DC.rodEnd - 0.02, 0) }),
      at(lathe([[DC.pin, -1], [DC.pin + 0.12, -1], [DC.pin + 0.12, 1], [DC.pin, 1], [DC.pin, -1]].map(([r, zz]) => [u(r), u(zz)]), 'steel', { axis: 'z', seg: 28 }), v3(DC.eye, 0)),
      at(zerk(S, 1.0), v3(DC.eye + DC.eyeR - 0.02, 0), [0, 0, -Math.PI / 2]),
    );
    rodG.position.x = ext;
    return group(barrel, welds, bushes, zk0, gland, oil, oilFit, rodSide(rodG));
  }
  void arc;
  return { view: { dir: [1.1, 0.6, 1.0] } };
}
