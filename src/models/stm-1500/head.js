// P048 — Tête de forage souterraine Boyles UM-012-100UG (page 2.2) : boîte à
// chaîne triple (pignon menant sur la sortie de la transmission, pignon mené
// sur la broche creuse), transmission Funk 4 vitesses HMD-2355, moteur
// hydraulique Rexroth A6VM160 à l'arrière de la transmission, mandrin Boyles
// H (bleu) à l'avant de la broche, pompe de lubrification, filtre, levier de
// vitesses à boule rouge. Cotes : page 2.1 (770 × 725 mm de face, 742 mm
// boîte et mandrin, 1 182 mm avec le moteur).
// Repère : origine sur la table (face d'appui), à l'aplomb de l'axe de la
// broche ; X le long de la broche vers l'avant (mandrin), Y vers le haut,
// axe de la broche à y = SPY ; la transmission et le moteur sont côté −Z.
import { lister, each, IN } from './layout.js';

export const SPY = 0.29; // hauteur de l'axe de la broche au-dessus de la table
const BOX = { x0: -0.17, x1: 0.13, z0: -0.5, z1: 0.17, y0: 0.03, y1: 0.5 };
const TZ = -0.33; // axe de la transmission et du moteur
// Bouts des raccords laiton du moteur (rotation A en haut, B en bas), sortie vers −Z : branchement des boyaux de la console.
export const HEAD_PORTS = [1, -1].map((s) => [BOX.x0 - 0.4 - 0.44, SPY + s * 0.12, TZ - 0.31]);

export function P048(api) {
  const { box, cyl, ring, shell, lathe, bolt, boltCircle, gear, filterCanister, hose, tube, plate, group, at, washer, torus } = api.S;
  const P = lister(api, 'P048');
  const bx = (BOX.x0 + BOX.x1) / 2, bz = (BOX.z0 + BOX.z1) / 2, by = (BOX.y0 + BOX.y1) / 2;
  const L = BOX.x1 - BOX.x0, W = BOX.z1 - BOX.z0, H = BOX.y1 - BOX.y0;

  // Boîte (carter soudé, ouverte sur le dessus) et son couvercle boulonné.
  P('UM-012-104A', group(
    at(box(L, H - 0.02, W, 'red', { r: 0.008 }), [bx, by - 0.01, bz]),
    at(box(L + 0.04, 0.025, W + 0.04, 'red', { r: 0.004 }), [bx, BOX.y0 + 0.012, bz]), // semelle
    at(cyl(0.155, 0.03, 'red', { axis: 'x' }), [BOX.x1 + 0.015, SPY, 0]), // bossage de broche
    at(cyl(0.12, 0.03, 'red', { axis: 'x' }), [BOX.x0 - 0.015, SPY, TZ]), // bride de transmission
  ), [0, 0, 0]);
  P('UM-012-113A', group(
    at(box(L + 0.03, 0.022, W + 0.03, 'red', { r: 0.006 }), [bx, BOX.y1 + 0.011, bz]),
    at(box(0.16, 0.05, 0.22, 'red', { r: 0.01 }), [bx, BOX.y1 + 0.045, TZ + 0.05]),
  ), [0, 0.25, 0]);
  each(P, 'B375-1000', [-1, 1].flatMap((s) => [1, 2, 3, 4, 5, 6, 7, 8].map((t) => at(bolt(0.0095, 0.025, 'steel', { washer: false }), [bx + s * (L / 2 - 0.006), BOX.y1 + 0.03, BOX.z0 + t * W / 9]))), [0, 0.32, 0]);
  each(P, 'W375', [-1, 1].flatMap((s) => [1, 2, 3, 4, 5, 6, 7, 8].map((t) => at(washer(0.011, 0.005, 0.002), [bx + s * (L / 2 - 0.006), BOX.y1 + 0.023, BOX.z0 + t * W / 9]))), [0, 0.3, 0]);

  // Broche creuse Boyles, roulements, joints, écrous de serrage.
  P('UM-012-101', at(lathe([[0.049, -0.55], [0.07, -0.55], [0.07, -0.2], [0.085, -0.2], [0.085, 0.2], [0.07, 0.2], [0.07, 0.42], [0.049, 0.42]], 'steel', { axis: 'x' }), [0, SPY, 0]), [0, 0, 0.45]);
  each(P, 'UM-012-122', [1, -1].map((s) => at(box(0.12, 0.016, 0.016, 'darkSteel'), [0, SPY + s * 0.088, 0])), [0, 0.2, 0.45]);
  P('UM-012-102', at(gear(0.13, 0.15, 42, 0.07, 'darkSteel', { axis: 'x', hole: 0.085 }), [bx, SPY, 0]), [0, 0.6, 0]);
  P('UM-012-128', at(ring(0.13, 0.085, 0.045, 'steel', { axis: 'x' }), [BOX.x1 - 0.02, SPY, 0]), [0.3, 0, 0.45]);
  P('UM-012-129', at(ring(0.13, 0.085, 0.045, 'steel', { axis: 'x' }), [BOX.x0 + 0.02, SPY, 0]), [-0.3, 0, 0.45]);
  P('UM-012-107', at(shell(0.09, 0.07, 0.12, 'darkSteel', { axis: 'x' }), [BOX.x1 + 0.09, SPY, 0]), [0.4, 0, 0.45]);
  each(P, 'UM-012-124', [0, 1].map((i) => at(ring(0.105, 0.086, 0.012, 'rubber', { axis: 'x' }), [BOX.x1 + 0.035 + i * 0.015, SPY, 0])), [0.35, 0, 0.3]);
  each(P, 'UM-012-126', [0, 1].map((i) => at(ring(0.105, 0.086, 0.012, 'rubber', { axis: 'x' }), [BOX.x0 - 0.035 - i * 0.015, SPY, 0])), [-0.35, 0, 0.3]);
  P('UM-012-121', at(ring(0.16, 0.09, 0.025, 'red', { axis: 'x' }), [BOX.x1 + 0.043, SPY, 0]), [0.45, 0, 0.2]);
  P('UM-012-120', at(ring(0.16, 0.1, 0.03, 'red', { axis: 'x' }), [BOX.x1 + 0.072, SPY, 0]), [0.55, 0, 0.2]);
  P('UM-012-106', at(ring(0.115, 0.075, 0.05, 'steel', { axis: 'x' }), [BOX.x1 + 0.11, SPY, 0]), [0.62, 0, 0.2]);
  P('UM-012-119', at(ring(0.09, 0.072, 0.04, 'steel', { axis: 'x' }), [BOX.x0 - 0.07, SPY, 0]), [-0.5, 0, 0.3]);
  P('UM-012-117', at(ring(0.1, 0.072, 0.012, 'darkSteel', { axis: 'x' }), [BOX.x0 - 0.1, SPY, 0]), [-0.58, 0, 0.3]);
  P('UM-012-118', at(ring(0.1, 0.072, 0.03, 'steel', { axis: 'x' }), [BOX.x0 - 0.125, SPY, 0]), [-0.65, 0, 0.3]);
  P('UM-012-115', at(ring(0.098, 0.072, 0.025, 'darkSteel', { axis: 'x' }), [BOX.x0 - 0.155, SPY, 0]), [-0.72, 0, 0.3]);
  P('UM-012-108', at(shell(0.07, 0.049, 0.08, 'brass', { axis: 'x' }), [BOX.x0 - 0.21, SPY, 0]), [-0.85, 0, 0.3]);
  P('UM-012-110', at(shell(0.066, 0.049, 0.06, 'brass', { axis: 'x' }), [BOX.x0 - 0.28, SPY, 0]), [-0.95, 0, 0.3]);
  P('UM-012-116', at(ring(0.098, 0.05, 0.02, 'red', { axis: 'x' }), [BOX.x0 - 0.33, SPY, 0]), [-1.05, 0, 0.3]);
  P('UM-012-114', at(ring(0.16, 0.09, 0.025, 'red', { axis: 'x' }), [BOX.x0 - 0.0125, SPY, 0]), [-0.4, 0, 0.2]);
  P('UM-012-123', at(ring(0.11, 0.09, 0.015, 'steel', { axis: 'x' }), [BOX.x0 - 0.05, SPY, 0]), [-0.45, 0, 0.35]);
  each(P, 'SS75-1250', Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return at(cyl(0.0095, 0.03, 'darkSteel', { axis: 'x', seg: 10 }), [BOX.x1 + 0.13, SPY + Math.cos(a) * 0.105, Math.sin(a) * 0.105]);
  }), [0.7, 0, 0.2]);

  // Mandrin Boyles H (page 2.5–2.7) : tambour bleu Ø 12 1/8 po × 13 5/16 po, passage Ø 3 7/8 po.
  const chuckX = BOX.x1 + 0.15;
  P('UM-012-142', group(
    at(lathe([[0.049, 0], [0.13, 0], [0.154, 0.02], [0.154, 0.3], [0.13, 0.338], [0.049, 0.338]], 'umBlue', { axis: 'x', seg: 40 }), [chuckX, SPY, 0]),
    at(ring(0.158, 0.12, 0.02, 'steel', { axis: 'x', seg: 40 }), [chuckX + 0.12, SPY, 0]),
    at(ring(0.158, 0.12, 0.02, 'steel', { axis: 'x', seg: 40 }), [chuckX + 0.2, SPY, 0]),
    boltCircle(12, 0.12, 0.012, 0.03, 'blackOxide', { axis: 'x', pos: [chuckX + 0.338, SPY, 0], washer: false }),
    at(ring(0.06, 0.049, 0.01, 'steel', { axis: 'x' }), [chuckX + 0.342, SPY, 0]),
  ), [0.95, 0, 0]);
  each(P, 'UM-012-189', [0, 1, 2].map((i) => at(box(0.05, 0.012, 0.012, 'darkSteel'), [chuckX + 0.36, SPY + Math.cos(i * 2.1) * 0.08, Math.sin(i * 2.1) * 0.08])), [1.2, 0, 0]);
  P('UM-012-192', at(torus(0.05, 0.0025, 'darkSteel', { axis: 'x' }), [chuckX + 0.36, SPY, 0]), [1.3, 0, 0]);

  // Chaîne triple sur les pignons (menant sur la transmission, mené sur la broche).
  P('UM-012-103', at(gear(0.06, 0.075, 21, 0.07, 'darkSteel', { axis: 'x', hole: 0.03 }), [bx, SPY, TZ]), [0, 0.6, -0.2]);
  each(P, 'UM-012-127', [-1, 1].map((s) => at(ring(0.055, 0.03, 0.025, 'steel', { axis: 'x' }), [bx + s * 0.11, SPY, TZ])), (i) => [i ? 0.25 : -0.25, 0.5, -0.2]);
  const chainPath = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = Math.PI / 2 + t * Math.PI;
    if (t < 0.5) chainPath.push([0, SPY + Math.sin(a + Math.PI / 2) * 0.155, Math.cos(a + Math.PI / 2) * 0.155]);
  }
  each(P, 'UM-012-130', [-0.022, 0, 0.022].map((dx) => group(
    tube([[bx + dx, SPY + 0.15, 0], [bx + dx, SPY + 0.075, TZ]], 0.008, 'darkSteel', { sharp: true, seg: 2 }),
    tube([[bx + dx, SPY - 0.15, 0], [bx + dx, SPY - 0.075, TZ]], 0.008, 'darkSteel', { sharp: true, seg: 2 }),
    at(torus(0.153, 0.008, 'darkSteel', { axis: 'x' }), [bx + dx, SPY, 0]),
    at(torus(0.078, 0.008, 'darkSteel', { axis: 'x' }), [bx + dx, SPY, TZ]),
  )), [0, 0.75, -0.1]);

  // Transmission Funk 4 vitesses (page 2.2 « 4 SPEED TRANSMISSION FUNK ») et accouplement.
  const tx0 = BOX.x0 - 0.03;
  P('UM-012-143', group(
    at(box(0.26, 0.3, 0.24, 'red', { r: 0.02 }), [tx0 - 0.13, SPY - 0.02, TZ]),
    at(box(0.16, 0.08, 0.16, 'red', { r: 0.02 }), [tx0 - 0.15, SPY + 0.16, TZ]),
    at(cyl(0.012, 0.32, 'red', { axis: 'y' }), [tx0 - 0.15, SPY + 0.36, TZ + 0.03]),
    at(api.S.ball ? api.S.ball(0.035, 'red') : cyl(0.035, 0.05, 'red'), [tx0 - 0.15, SPY + 0.53, TZ + 0.03]),
    at(box(0.03, 0.26, 0.26, 'blackCast', { r: 0.01 }), [tx0 - 0.275, SPY - 0.02, TZ]),
    at(box(0.12, 0.03, 0.26, 'red'), [tx0 - 0.13, SPY - 0.185, TZ]),
  ), [-0.3, 0.2, -0.3]);
  P('UM-012-170', at(cyl(0.05, 0.08, 'steel', { axis: 'x' }), [tx0 - 0.33, SPY, TZ]), [-0.55, 0, -0.3]);
  P('UM-012-125', at(ring(0.06, 0.03, 0.012, 'rubber', { axis: 'x' }), [BOX.x0 - 0.02, SPY, TZ]), [-0.3, 0, -0.5]);

  // Moteur hydraulique Rexroth A6VM160 (noir) à l'arrière de la transmission, brides SAE et coudes.
  const mx = tx0 - 0.37;
  P('AA6VM', group(
    at(cyl(0.11, 0.3, 'blackCast', { axis: 'x', seg: 36 }), [mx - 0.15, SPY, TZ]),
    at(box(0.03, 0.24, 0.24, 'blackCast', { r: 0.01 }), [mx, SPY, TZ]),
    at(box(0.14, 0.2, 0.22, 'blackCast', { r: 0.015 }), [mx - 0.37, SPY, TZ]),
    at(box(0.06, 0.06, 0.12, 'blackCast', { r: 0.008 }), [mx - 0.3, SPY + 0.13, TZ]),
  ), [-0.8, 0, -0.3]);
  each(P, 'B750-2000', [-1, 1].flatMap((s) => [-1, 1].map((t) => at(bolt(0.019, 0.05, 'steel', { axis: 'x', washer: false }), [mx + 0.025, SPY + s * 0.09, TZ + t * 0.09]))), [-0.65, 0, -0.3]);
  each(P, 'W750', [-1, 1].flatMap((s) => [-1, 1].flatMap((t) => [0, 1].map((k) => at(washer(0.02, 0.01, 0.003, 'steel', { axis: 'x' }), [mx + 0.018 - k * 0.004, SPY + s * 0.09, TZ + t * 0.09])))), [-0.6, 0, -0.3]);
  each(P, 'UM-063-289T', [-1, 1].flatMap((s) => [-1, 1].map((u) => at(box(0.03, 0.05, 0.045, 'blackOxide', { r: 0.006 }), [mx - 0.37 + u * 0.025, SPY + s * 0.12, TZ - 0.13]))), [-0.9, 0, -0.5]);
  each(P, 'UM-063-290T', [-1, 1].map((s) => tube([[mx - 0.37, SPY + s * 0.12, TZ - 0.15], [mx - 0.37, SPY + s * 0.12, TZ - 0.22], [mx - 0.44, SPY + s * 0.12, TZ - 0.24]], 0.022, 'brass', { seg: 12 })), [-1.0, 0, -0.6]);
  each(P, 'B437-1500', Array.from({ length: 13 }, (_, i) => at(bolt(0.011, 0.038, 'steel', { axis: 'x', washer: false }), [tx0 - 0.003, SPY + Math.cos(i * 0.48) * 0.115, TZ + Math.sin(i * 0.48) * 0.115])), [-0.25, 0, -0.45]);
  each(P, 'W437', Array.from({ length: 12 }, (_, i) => at(washer(0.012, 0.006, 0.002, 'steel', { axis: 'x' }), [tx0, SPY + Math.cos(i * 0.48) * 0.115, TZ + Math.sin(i * 0.48) * 0.115])), [-0.22, 0, -0.45]);
  each(P, 'UM-012-208', [0, 1].map((i) => at(torus(0.03, 0.003, 'rubber'), [mx - 0.37, SPY + (i ? 0.12 : -0.12), TZ - 0.115])), [-0.9, 0, -0.4]);

  // Pompe de lubrification sur la face arrière de la boîte (moteur hydraulique 139, couvercle 111, clavette 169).
  const pz = 0.0, py = SPY - 0.15;
  P('UM-012-139', at(cyl(0.045, 0.1, 'blackCast', { axis: 'x' }), [BOX.x0 - 0.07, py, pz - 0.16]), [-0.4, -0.2, 0]);
  P('UM-012-111', at(cyl(0.06, 0.02, 'red', { axis: 'x' }), [BOX.x0 - 0.01, py, pz - 0.16]), [-0.25, -0.2, 0]);
  P('UM-012-169', at(box(0.025, 0.006, 0.006, 'darkSteel'), [BOX.x0 - 0.03, py + 0.012, pz - 0.16]), [-0.3, -0.3, 0]);
  each(P, 'B250-750', Array.from({ length: 6 }, (_, i) => at(bolt(0.0064, 0.019, 'steel', { axis: 'x', washer: false }), [BOX.x0 - 0.022, py + Math.cos(i * 1.05) * 0.048, pz - 0.16 + Math.sin(i * 1.05) * 0.048])), [-0.32, -0.2, 0]);
  each(P, 'W250', Array.from({ length: 6 }, (_, i) => at(washer(0.007, 0.0033, 0.0015, 'steel', { axis: 'x' }), [BOX.x0 - 0.021, py + Math.cos(i * 1.05) * 0.048, pz - 0.16 + Math.sin(i * 1.05) * 0.048])), [-0.3, -0.2, 0]);

  // Filtre de tête (support 177 + cartouche 178) et bouchons de vidange / remplissage.
  P('UM-012-177', at(box(0.09, 0.05, 0.08, 'castAlu', { r: 0.008 }), [bx, BOX.y1 - 0.02, BOX.z0 - 0.045]), [0, 0.2, -0.3]);
  P('UM-012-178', at(cyl(0.045, 0.12, 'white', { axis: 'y' }), [bx, BOX.y1 - 0.1, BOX.z0 - 0.045]), [0, -0.1, -0.35]);
  each(P, 'UM-012-131', [0, 1].map((i) => at(api.S.nut(0.035, 0.02, 'steel', { axis: 'z' }), [bx + (i ? 0.08 : -0.08), BOX.y0 + 0.06, BOX.z1 + 0.01])), [0, 0, 0.25]);
  each(P, 'UM-102-132', [0, 1].map((i) => at(api.S.nut(0.02, 0.014, 'steel', { axis: 'z' }), [bx + (i ? 0.08 : -0.08), BOX.y1 - 0.05, BOX.z1 + 0.008])), [0, 0, 0.3]);
  P('UM-012-167', at(torus(0.04, 0.003, 'rubber', { axis: 'z' }), [bx, BOX.y1 - 0.12, BOX.z1 + 0.005]), [0, 0, 0.4]);
  P('UM-1214-121P', at(cyl(0.045, 0.012, 'red', { axis: 'z' }), [bx, BOX.y1 - 0.12, BOX.z1 + 0.012]), [0, 0, 0.5]);
  each(P, 'SHCS312-1500', Array.from({ length: 6 }, (_, i) => at(bolt(0.008, 0.06, 'blackOxide', { axis: 'z', head: 'socket', washer: false }), [bx + Math.cos(i * 1.05) * 0.035, BOX.y1 - 0.12 + Math.sin(i * 1.05) * 0.035, BOX.z1 + 0.02])), [0, 0, 0.6]);
  each(P, 'W312', Array.from({ length: 6 }, (_, i) => at(washer(0.009, 0.004, 0.0016, 'steel', { axis: 'z' }), [bx - 0.12 + i * 0.048, BOX.y0 + 0.02, BOX.z1 + 0.003])), [0, -0.1, 0.3]);
  each(P, 'B312-1000', Array.from({ length: 6 }, (_, i) => at(bolt(0.008, 0.025, 'steel', { axis: 'z', washer: false }), [bx - 0.12 + i * 0.048, BOX.y0 + 0.02, BOX.z1 + 0.008])), [0, -0.1, 0.35]);

  // Axe d'articulation sur la table (105A), goupille, bagues de dureté (171) dans les oreilles.
  P('UM-012-105A', at(cyl(0.0125, 0.62, 'steel', { axis: 'z', seg: 16 }), [bx, BOX.y0 - 0.025, bz]), [0, -0.15, 0]);
  P('HP1000', at(torus(0.02, 0.003, 'steel', { axis: 'x' }), [bx, BOX.y0 - 0.025, bz + 0.33]), [0, -0.15, 0.3]);
  each(P, 'UM-012-171', [0, 1, 2, 3].map((i) => at(ring(0.022, 0.013, 0.04, 'darkSteel', { axis: 'z' }), [bx, BOX.y0 - 0.025, BOX.z0 + 0.05 + i * (W - 0.1) / 3])), [0, -0.25, 0]);
  each(P, 'B500-1750', Array.from({ length: 10 }, (_, i) => at(bolt(0.0127, 0.044, 'steel', { washer: false, axis: 'y' }), [bx + (i % 2 ? 0.12 : -0.12), BOX.y0 + 0.03, BOX.z0 + 0.04 + Math.floor(i / 2) * (W - 0.08) / 4])), [0, 0.3, 0]);
  each(P, 'W500', Array.from({ length: 20 }, (_, i) => at(washer(0.014, 0.0068, 0.0025, 'steel'), [bx + (i % 2 ? 0.12 : -0.12), BOX.y0 + 0.026 + (i >= 10 ? 0.003 : 0), BOX.z0 + 0.04 + Math.floor((i % 10) / 2) * (W - 0.08) / 4])), [0, 0.28, 0]);
  each(P, 'SHC500-4000', Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return at(bolt(0.0127, 0.1, 'blackOxide', { axis: 'x', head: 'socket', washer: false }), [BOX.x1 + 0.06, SPY + Math.cos(a) * 0.135, Math.sin(a) * 0.135]);
  }), [0.5, 0, 0.1]);

  // Boyaux de la tête (page 2.3, détail à part) : pression, retour, drain, lubrification.
  api.add(group(
    at(cyl(0.024, 0.06, 'brass', { axis: 'z', seg: 16 }), [mx - 0.44, SPY + 0.12, TZ - 0.28]),
    at(cyl(0.024, 0.06, 'brass', { axis: 'z', seg: 16 }), [mx - 0.44, SPY - 0.12, TZ - 0.28]),
    tube([[BOX.x0 - 0.12, py, -0.16], [BOX.x0 - 0.15, BOX.y1, -0.2], [bx, BOX.y1 + 0.05, BOX.z0 + 0.0]], 0.006, 'steel', { seg: 24 }),
    tube([[bx + 0.04, BOX.y1, BOX.z0 - 0.045], [bx + 0.1, BOX.y1 + 0.08, -0.1], [BOX.x1 + 0.02, BOX.y1 - 0.02, 0.05]], 0.006, 'steel', { seg: 24 }),
  ));
  return { view: { dir: [0.9, 0.55, 1.1] } };
}
