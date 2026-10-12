// P288 — Auvent ROPS/FOPS CX011697 rév. 5 (page 288) : « CANOPY, ROPS/FOPS »,
// repère 1 de P286. Embase mécano-soudée (2) logée à l'extrémité +Z du
// caisson de la cabine : deux fourreaux carrés de 4 1/4 po reliés par deux
// tôles de 1/4 po (face −Z ajourée de quatre trous Ø 3 po et d'une échancrure
// en U), semelle de 1/2 po (trois vis 1 po de P286), quatre cales d'appui
// latérales (deux vis 1 po × 3 1/2 chacune, P286) sur lesquelles sont pointées
// les cales de 1/16 (7) et 1/8 po (8) ajustées au montage ; deux montants
// carrés de 3 1/2 po (3) coulissant dans les fourreaux (hauteur réglable par
// les vérins CX001596 logés dessous, P278 rep. 19) : tête à platine et quatre
// goussets, perçages de réglage ; axes de verrouillage Ø 1 1/4 × 6 1/4 (9) et
// goupilles doubles (1), axes d'œil de tige Ø 1 × 4,94 (6), axes de pied de
// vérin Ø 1 × 6 (5) et épingles (11), cales d'usure des fourreaux (10, une
// trousse par fourreau, détail B). Toit (4) en tôle pliée de 3/16 po en porte-
// à-faux vers −Z : bord −X tombé, visière arrondie côté +X, retours d'extrémité,
// nervures tubulaires dessous, platines d'appui des montants, quatre oreilles
// de levage et plaque de certification ; fixé sur chaque tête de montant par
// six vis H 3/4-10 × 4 (12, rondelles à collet haut 14) et deux vis H 1-8 × 2 1/2
// gr. 8 (13, rondelles Grower 15).
// Repère : origine au centre du dessous de l'embase, axes du repère machine
// (X avant, Y haut, Z droite) ; l'auvent s'étend vers −Z depuis l'embase,
// dessus à y = canopyTopLocal() (2,22 m dans la machine).
// Encombrement 0.95 (X) × 1.17 (Y) × 1.30 (Z) m ; embase 21 × 27 1/2 × 5 1/2 po
// (proportions des vues de face, de côté et des coupes A-A, C-C de la page
// 288, à l'échelle des axes de 6 1/4 po).
import { u, cabHw, CANOPY, canopyTopLocal, prism } from './_cab.js';
import { pin } from '../../du311/parts/_avance_b.js';

export default function P288(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, weld, tube, nameplate } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { w, h, d } = CANOPY.base;
  const { a, x: px, rec } = CANOPY.post;
  const t = u(0.25);
  const yT = canopyTopLocal();
  const cx = CANOPY.cx;
  const z0 = 0.1, z1 = -1.2; // bouts du toit
  const tp = u(0.1875);

  // ---------------------------------------------------------------- 2 — embase
  const base = [];
  // Fourreaux carrés (quatre parois) et colliers de tête.
  for (const s of [-1, 1]) {
    const xc = s * px;
    for (const [dx, dz, ww, dd] of [[-(rec - t) / 2, 0, t, rec], [(rec - t) / 2, 0, t, rec], [0, -(rec - t) / 2, rec - 2 * t, t], [0, (rec - t) / 2, rec - 2 * t, t]]) {
      base.push(box(ww, h - 0.0127, dd, 'lightGrey', { pos: [xc + dx, 0.0127 + (h - 0.0127) / 2, dz] }));
    }
    base.push(box(rec + 0.014, 0.025, rec + 0.014, 'lightGrey', { r: 0.002, pos: [xc, h - 0.0125, 0] }));
    // Cales d'appui latérales (deux hauteurs) côté extérieur.
    for (const y of [0.17, 0.53]) base.push(box(0.09, 0.1, 0.12, 'lightGrey', { r: 0.002, pos: [s * (px + rec / 2 + 0.045), y, 0] }));
  }
  // Tôles avant (ajourée, échancrure en U) et arrière entre les fourreaux.
  const xi = px - rec / 2; // face intérieure des fourreaux
  const front = prism(S, THREE, [[-xi, 0.0127], [xi, 0.0127], [xi, h], [0.07, h], [0.07, h - 0.2], [0.05, h - 0.22], [-0.05, h - 0.22], [-0.07, h - 0.2], [-0.07, h], [-xi, h]], t, 'lightGrey', 'xy', -d / 2 + t / 2,
    { holes: [[-0.065, 0.147, 0.04], [0.065, 0.147, 0.04], [-0.065, 0.29, 0.04], [0.065, 0.29, 0.04]] });
  const back = prism(S, THREE, [[-xi, 0.0127], [xi, 0.0127], [xi, h], [-xi, h]], t, 'lightGrey', 'xy', d / 2 - t / 2, { holes: [[-0.065, 0.22, 0.04], [0.065, 0.22, 0.04]] });
  // Semelle de 1/2 po à trois trous.
  const foot = H_.K.plate(w, d, 0.0127, 'lightGrey', { holes: [[-0.07, 0, 0.0135], [0, 0, 0.0135], [0.07, 0, 0.0135]], r: 0.004, seg: 10 });
  foot.position.y = 0.0064;
  const beads = [];
  for (const s of [-1, 1]) for (const zz of [-d / 2 + t, d / 2 - t]) beads.push(weld([[s * xi, 0.02, zz + Math.sign(zz) * 0.002], [s * xi, h - 0.03, zz + Math.sign(zz) * 0.002]], 0.006, 'lightGrey'));
  for (const s of [-1, 1]) beads.push(weld([[s * (px - rec / 2), 0.014, -d / 2 - 0.002], [s * (px + rec / 2), 0.014, -d / 2 - 0.002]], 0.006, 'lightGrey'));
  // Perçages (amorces sombres) : axes 5 et 9 dans les fourreaux, trous des vis des cales.
  const dots = [];
  for (const s of [-1, 1]) {
    for (const [y, r] of [[CANOPY.pin5, u(0.52)], [CANOPY.pin9, u(0.65)]]) for (const zs of [-1, 1]) dots.push(at(lathe([[r, 0.0004], [0, 0.0004]], 'blackOxide', { seg: 12 }), [s * px, y, zs * (rec / 2 + (y > 0.5 ? 0.007 : 0))], [zs * Math.PI / 2, 0, 0]));
    for (const y of [0.17, 0.53]) for (const zz of [-0.035, 0.035]) dots.push(at(lathe([[u(0.53), 0.0004], [0, 0.0004]], 'blackOxide', { seg: 12 }), [s * (px + rec / 2 + 0.09), y, zz], [0, 0, -s * Math.PI / 2]));
  }
  P('2', group(merged([...base, front, back, foot], 'lightGrey'), merged(beads, 'lightGrey'), merged(dots, 'blackOxide')), [0, -0.15, 0.1]);

  // ---------------------------------------------------------------- 7, 8 — cales des appuis latéraux (au montage)
  for (const s of [-1, 1]) for (const y of [0.17, 0.53]) {
    const th = s < 0 ? u(0.0625) : u(0.125);
    const sh = H_.K.plate(0.1, 0.12, th, 'steel', { holes: [[0, -0.035, u(0.53)], [0, 0.035, u(0.53)]], seg: 8 });
    sh.rotation.z = Math.PI / 2;
    sh.position.set(s * (px + rec / 2 + 0.09 + th / 2), y, 0);
    P(s < 0 ? '7' : '8', sh, [s * 0.1, 0, 0]);
  }

  // ---------------------------------------------------------------- 3 — montants (×2)
  const capTop = yT - tp - 0.076 - 0.019; // dessous des platines du toit
  const capT = 0.0127, capW = 0.152;
  const yb = CANOPY.pin6 - 0.05; // pied des montants (dans les fourreaux)
  for (const s of [-1, 1]) {
    const xc = s * px;
    const walls = [];
    for (const [dx, dz, ww, dd] of [[-(a - t) / 2, 0, t, a], [(a - t) / 2, 0, t, a], [0, -(a - t) / 2, a - 2 * t, t], [0, (a - t) / 2, a - 2 * t, t]]) {
      walls.push(box(ww, capTop - capT - yb, dd, 'lightGrey', { pos: [xc + dx, (yb + capTop - capT) / 2, dz] }));
    }
    walls.push(box(capW, capT, capW, 'lightGrey', { r: 0.002, pos: [xc, capTop - capT / 2, 0] }));
    // Goussets triangulaires sous la platine (quatre faces).
    for (const [rx, ry] of [[0, 0], [0, Math.PI / 2], [0, Math.PI], [0, -Math.PI / 2]]) {
      const g = prism(S, THREE, [[a / 2, capTop - capT], [capW / 2 - 0.004, capTop - capT], [a / 2, capTop - capT - 0.07]], u(0.375), 'lightGrey', 'xy', 0);
      const gg = group(g);
      gg.rotation.set(rx, ry, 0);
      gg.position.x = xc;
      walls.push(gg);
    }
    const holes = [];
    for (const y of [0.74, 0.8, 0.86, CANOPY.pin9, CANOPY.pin6]) for (const zs of [-1, 1]) holes.push(at(lathe([[u(0.66), 0.0004], [0, 0.0004]], 'blackOxide', { seg: 12 }), [xc, y, zs * a / 2], [zs * Math.PI / 2, 0, 0]));
    const pw = merged([weld([[xc - a / 2, capTop - capT - 0.002, -a / 2 - 0.002], [xc + a / 2, capTop - capT - 0.002, -a / 2 - 0.002]], 0.005, 'lightGrey'), weld([[xc - a / 2, capTop - capT - 0.002, a / 2 + 0.002], [xc + a / 2, capTop - capT - 0.002, a / 2 + 0.002]], 0.005, 'lightGrey')], 'lightGrey');
    P('3', group(merged(walls, 'lightGrey'), pw, merged(holes, 'blackOxide')), [0, 0.25, 0]);
  }

  // ---------------------------------------------------------------- 10 — cales d'usure des fourreaux (trousse, ×2)
  for (const s of [-1, 1]) {
    P('10', box(0.004, 0.05, a * 0.9, 'steel', { pos: [s * px - s * (a / 2 + 0.003), h - 0.03, 0] }), [0, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 4 — toit
  const W2 = CANOPY.wid / 2;
  const prof = [
    [-W2, yT - 0.1], [-W2, yT - 0.012], [-W2 + 0.012, yT], [0.25, yT - 0.008], [0.34, yT - 0.022], [0.41, yT - 0.05], [0.455, yT - 0.09], [W2, yT - 0.14],
    [W2 - tp, yT - 0.14], [0.449, yT - 0.093], [0.405, yT - 0.055], [0.336, yT - 0.028], [0.25, yT - 0.014], [-W2 + 0.014, yT - tp], [-W2 + tp, yT - 0.014], [-W2 + tp, yT - 0.1],
  ].map(([x, y]) => [x + cx, y]);
  const roof = [prism(S, THREE, prof, z0 - z1, 'lightGrey', 'xy', (z0 + z1) / 2)];
  // Retours d'extrémité (avant −Z plus haut, arrière +Z).
  const endPlate = (dep, zz) => {
    const top = prof.slice(0, 8);
    const pts = [...top, [W2 + cx, yT - dep], [-W2 + cx, yT - dep]];
    return prism(S, THREE, pts.filter((p, i) => i === 0 || p[1] >= yT - dep), tp, 'lightGrey', 'xy', zz);
  };
  roof.push(endPlate(0.13, z1 + tp / 2), endPlate(0.09, z0 - tp / 2));
  // Nervures dessous : trois tubes transversaux, deux longitudinaux ; platines des montants.
  const yr = yT - tp - 0.038;
  for (const zz of [0, -0.6, -1.12]) roof.push(box(W2 + 0.32 - tp, 0.076, 0.05, 'lightGrey', { r: 0.003, pos: [cx + (0.32 - W2 + tp) / 2, yr, zz] }));
  for (const xx of [-0.2, 0.2]) roof.push(box(0.05, 0.06, z0 - z1 - 0.04, 'lightGrey', { r: 0.003, pos: [cx + xx, yT - tp - 0.03, (z0 + z1) / 2] }));
  for (const s of [-1, 1]) roof.push(box(0.17, 0.019, 0.17, 'lightGrey', { r: 0.002, pos: [s * px, capTop + 0.0095, 0] }));
  // Oreilles de levage (tôle percée) aux quatre coins.
  for (const [xx, zz] of [[-W2 - 0.01, z1 + 0.06], [-W2 - 0.01, z0 - 0.06], [W2 + 0.004, z1 + 0.06], [W2 + 0.004, z0 - 0.06]]) {
    const lug = prism(S, THREE, [[-0.035, 0], [0.035, 0], [0.035, -0.03], [0, -0.06], [-0.035, -0.03]], u(0.5), 'lightGrey', 'xy', 0, { holes: [[0, -0.032, 0.012]] });
    const lg = group(lug);
    lg.rotation.y = Math.PI / 2;
    lg.position.set(cx + xx, yT - (xx > 0 ? 0.11 : 0.07), zz);
    roof.push(lg);
  }
  const roofWelds = merged([
    weld([[cx - W2 + 0.02, yT - tp - 0.002, z1 + tp + 0.002], [cx + 0.3, yT - tp - 0.012, z1 + tp + 0.002]], 0.006, 'lightGrey'),
    weld([[cx - W2 + 0.02, yT - tp - 0.002, z0 - tp - 0.002], [cx + 0.3, yT - tp - 0.012, z0 - tp - 0.002]], 0.006, 'lightGrey'),
  ], 'lightGrey');
  const plate = nameplate(0.1, 0.06, { material: 'zinc' });
  plate.rotation.y = -Math.PI / 2;
  plate.position.set(cx - W2 - 0.001, yT - 0.055, -0.5);
  P('4', group(merged(roof, 'lightGrey'), roofWelds, plate), [0, 0.45, 0]);

  // ---------------------------------------------------------------- 12/14, 13/15 — vis des têtes de montant
  const yCb = capTop - capT; // dessous de la platine
  for (const s of [-1, 1]) {
    const xc = s * px;
    for (const zz of [-0.062, 0.062]) for (const dx of [-0.055, 0, 0.055]) {
      const p = [xc + dx, yCb, zz];
      P('14', H_.washer(0.75, p, [0, -1, 0], 'hc'), [0, -0.12, 0]);
      P('12', H_.bolt(0.75, 4, [xc + dx, yCb - H_.wT(0.75, 'hc'), zz], [0, -1, 0], { light: true }), [0, -0.18, 0]);
    }
    for (const dx of [-0.035, 0.035]) {
      P('15', H_.washer(1.0, [xc + dx, yCb, 0], [0, -1, 0], 'split'), [0, -0.12, 0]);
      P('13', H_.bolt(1.0, 2.5, [xc + dx, yCb - H_.wT(1.0, 'split'), 0], [0, -1, 0]), [0, -0.2, 0]);
    }
  }

  // ---------------------------------------------------------------- axes et goupilles
  // pin() : axe le long de Y centré (po) → couché selon Z.
  const pinZ = (dIn, lenIn, headR, x, y, zc) => {
    const g = group(pin(S, THREE, dIn, lenIn, { head: { r: headR, h: 0.25 } }));
    g.rotation.x = -Math.PI / 2; // +Y → −Z (tête vers −Z)
    g.position.set(x, y, zc);
    return g;
  };
  const wire = (pts, r) => tube(pts, r, 'zinc', { seg: 24, radial: 6, ends: 'none' });
  for (const s of [-1, 1]) {
    const xc = s * px;
    // 9 — verrouillage Ø 1 1/4 × 6 1/4 au travers des colliers ; 1 — goupille double (pince en R).
    const z9 = -u(6.25) / 2 + u(1.0);
    P('9', pinZ(1.25, 6.25, 0.9, xc, CANOPY.pin9, z9), [0, 0, -0.15]);
    const ze = z9 + u(3.125) - 0.004;
    P('1', wire([[xc, CANOPY.pin9 + 0.012, ze], [xc, CANOPY.pin9 - 0.012, ze], [xc + 0.008, CANOPY.pin9 - 0.03, ze + 0.004], [xc + 0.03, CANOPY.pin9 - 0.035, ze + 0.008], [xc + 0.04, CANOPY.pin9 - 0.01, ze + 0.01], [xc + 0.03, CANOPY.pin9 + 0.02, ze + 0.008], [xc + 0.014, CANOPY.pin9 + 0.03, ze + 0.004]], u(0.07)), [0, 0, 0.15]);
    // 6 — œil de tige Ø 1 × 4,94 au pied du montant (dans le fourreau).
    P('6', pinZ(1.0, 4.94, 0.72, xc, CANOPY.pin6, -u(4.94) / 2 + u(1.6)), [0, 0, -0.12]);
    // 5 — pied du vérin Ø 1 × 6 au travers du fourreau ; 11 — épingle.
    const z5 = -u(6) / 2 + u(0.95);
    P('5', pinZ(1.0, 6.0, 0.72, xc, CANOPY.pin5, z5), [0, 0, -0.15]);
    const z11 = z5 + u(3) - 0.006;
    P('11', wire([[xc - 0.05, CANOPY.pin5 + 0.008, z11], [xc + 0.04, CANOPY.pin5 + 0.008, z11], [xc + 0.054, CANOPY.pin5, z11 + 0.004], [xc + 0.04, CANOPY.pin5 - 0.012, z11 + 0.008], [xc + 0.01, CANOPY.pin5 - 0.016, z11 + 0.008], [xc - 0.02, CANOPY.pin5 - 0.01, z11 + 0.008], [xc - 0.05, CANOPY.pin5 - 0.014, z11 + 0.008]], u(0.09)), [0, 0, 0.15]);
  }
  return { view: { dir: [1, 0.55, -1.2] } };
}
