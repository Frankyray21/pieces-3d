// P058 — Avance 6 pi de base CX036191 rév. 1 (page 58) : « ASSY, FEED - 6FT
// BASIC », repère 5 de l'avance P028. Poutre d'avance mécano-soudée (4,
// « FEED BEAM - 6FT ») : deux profilés en C à âme de 1/2 po dont les ailes
// avant forment les lèvres de la fente où loge le vérin d'avance (P070), tôle
// de dos 3/8 po percée pour le cadre du carrousel (P098), cinq traverses
// intérieures, plaque de tête de 1 1/2 po fendue à l'avant (bride du vérin,
// quatre vis 13), pied : semelle de 1 1/2 po, bloc avant, goussets, deux
// bossages d'articulation garnis de bagues (1), doublures intérieures des
// fixations du support latéral (P100) et de la boucle de boyaux (P104),
// fourrures de 1/4 po sous les vis longues des barres de guidage.
// Deux barres de guidage (5, P060) sur les lèvres avant (« LAY STRAIGHT EDGE
// OVER BOTH SURFACES » : faces de guidage coplanaires). Onze tubes 3/8 po (3)
// traversent le mât derrière le vérin, d'un coude de traversée -06 (7) du
// flanc +X à son vis-à-vis du flanc −X ; les 22 coudes reçoivent un bouchon
// JIC (9) en attente des trousses de boyaux ; un coude de traversée -08 (8)
// au-dessus. Deux colliers caoutchoutés 3/8 po (2) tiennent deux tubes contre
// la tôle de dos (vis 10, Nord-Lock 15). Vis 11 (Nord-Lock SP 18) : points de
// fixation des colliers de câblage (« CHOOSE SUITABLE P-CLIPS »). Vis 12 du
// bloc bas du vérin (sous la semelle) et 13 de sa bride haute, Nord-Lock 16 ;
// capot de vérin (6) en tôle pliée sur la tête du mât, vis 14, Nord-Lock 17.
// Repère : celui de l'avance (FEED de ../feed.js, placé à l'identité dans
// P028) : pied du mât à y = 0, axe +Y, fente avant vers +Z, carrousel côté
// +X ; mât 0.40 × 0.32 × 3.0 m (capot jusqu'à y = 3.11).
// Cotes : visserie et raccords (liste), section A-A (page 58) et vues des
// pages 78 à 82 mises à l'échelle de FEED ; positions des coudes de traversée
// relevées sur la vue de profil (flanc +X).
import {
  IN, u, MAST, BAR, CYL, CYL_BOLTS, BLOCK_BOLTS, place, seat, bulkElbow, capNut, swivelNut,
  hhcs, nordLock, slab, orient, rrect, obround, bentTube, pClamp, welds, M,
} from './_feed.js';
import { SEQ as BAR_BOLTS } from './P060.js';

const { hw, hd, tw, lip, tl, tb, yBase, yTop, baseX } = MAST;
// Coudes de traversée -06 (hauteurs, mêmes sur les deux flancs) et -08.
export const BULK_Y = [0.21, 0.255, 0.3, ...Array.from({ length: 8 }, (_, k) => 0.77 + k * 0.0457)];
export const BULK8_Y = 1.25;
const ZT = -hd + tb + 0.0078; // nappe des tubes contre la tôle de dos
// Vis du support latéral P100 (flanc −X) et du support bas de la boucle P104.
export const SIDE_BOLTS = [[1.12, -0.03], [1.2, -0.13], [1.28, -0.03], [2.45, -0.13], [2.53, -0.03], [2.61, -0.13]];
export const LOOP_BOLTS = [[1.85, 0.06], [1.85, 0.125]];
const RUNGS = [1.45, 1.9, 2.35, 2.8];

export default function P058(api) {
  const { S } = api;
  const { box, lathe, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ============================================================ 4 — poutre d'avance
  const H = yTop - yBase, yM = (yBase + yTop) / 2;
  const wallHoles = (sx) => {
    const h = [];
    // perçages courants : colonne de trous Ø 1 po près du dos, paires Ø 1/2 po
    for (let y = 0.42; y < yTop - 0.1; y += 0.22) h.push([0.12 * sx, y, u(0.5)]);
    for (let y = 1.5; y < yTop - 0.1; y += 0.29) { h.push([-0.039 * sx, y, u(0.25)]); h.push([0.035 * sx, y, u(0.25)]); }
    BULK_Y.forEach((y) => h.push([0, y, u(0.44)]));
    if (sx > 0) h.push([0, BULK8_Y, u(0.53)]);
    return h;
  };
  // Flancs (âmes) : plan (−z·s, y) ; épaisseur selon ±X.
  const walls = [1, -1].map((s) => {
    const sl = slab([[-hd, yBase], [hd, yBase], [hd, yTop], [-hd, yTop]], wallHoles(s).map(([a, y, r]) => [a, y, r]), tw, 'lightGrey');
    return orient(sl, [0, 0, -s], [0, 1, 0], [s * (hw - tw / 2), 0, 0]);
  });
  // Lèvres avant (ailes des C).
  const lips = [1, -1].map((s) => box(lip - tw, H, tl, 'lightGrey', { pos: [s * (hw - tw - (lip - tw) / 2), yM, hd - tl / 2] }));
  // Tôle de dos percée (2 × 13 trous Ø 11/16 po pour le cadre du carrousel).
  const backHoles = [];
  for (let i = 0; i < 13; i++) for (const x of [-0.12, 0.12]) backHoles.push([x, 0.4 + i * 0.2, u(0.344)]);
  for (const x of [-0.06, 0.06]) backHoles.push([x, 2.2, u(0.17)]);
  backHoles.push([-0.09, 0.62, u(0.14)], [0.09, 0.62, u(0.14)]);
  const back = orient(slab([[-(hw - tw), yBase], [hw - tw, yBase], [hw - tw, yTop], [-(hw - tw), yTop]], backHoles, tb, 'lightGrey'), [1, 0, 0], [0, 1, 0], [0, 0, -hd + tb / 2]);
  // Traverses intérieures (cornières 1/4 po au dos, au-dessus des tubes).
  const rungs = RUNGS.flatMap((y) => [
    box(2 * (hw - tw), u(0.25), 0.06, 'lightGrey', { pos: [0, y, -hd + tb + 0.03] }),
    box(2 * (hw - tw), 0.05, u(0.25), 'lightGrey', { pos: [0, y + 0.025, -hd + tb + 0.06] }),
  ]);
  // Plaque de tête : chanfreins, fente avant (Ø 3 1/8 po, bride du vérin).
  const c = 0.02, sw = 0.0395;
  const arc = [];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arc.push([sw * Math.cos(a), CYL.z - sw * Math.sin(a)]); }
  const topXZ = [[-hw + c, -hd], [hw - c, -hd], [hw, -hd + c], [hw, hd - c], [hw - c, hd], [sw, hd], ...arc, [-sw, hd], [-hw + c, hd], [-hw, hd - c], [-hw, -hd + c]];
  const topPlate = orient(slab(topXZ.map(([x, z]) => [x, -z]), [], u(1.5), 'lightGrey'), [1, 0, 0], [0, 0, -1], [0, yTop + u(0.75), 0]);
  // Pied : semelle, bloc avant, goussets, bossages d'articulation.
  const bc = 0.025;
  const [bz0, bz1] = MAST.baseZ;
  const base = orient(slab([[-baseX + bc, bz0], [baseX - bc, bz0], [baseX, bz0 + bc], [baseX, bz1 - bc], [baseX - bc, bz1], [-baseX + bc, bz1], [-baseX, bz1 - bc], [-baseX, bz0 + bc]].map(([x, z]) => [x, -z]),
    BLOCK_BOLTS.map(([dx, dz]) => [dx, -(CYL.z + dz), u(0.34)]), yBase, 'lightGrey'), [1, 0, 0], [0, 0, -1], [0, yBase / 2, 0]);
  const front = box(2 * hw, 0.09, bz1 - hd, 'lightGrey', { r: 0.003, pos: [0, yBase + 0.045, (hd + bz1) / 2] });
  const gusset = (s, z) => orient(slab([[0, 0], [baseX - hw - 0.004, 0], [0, 0.16]], [], u(0.5), 'lightGrey'), [s, 0, 0], [0, 1, 0], [s * hw, yBase, z]);
  const gussets = [1, -1].flatMap((s) => [gusset(s, -0.13), gusset(s, 0.13)]);
  const EYES = [[-0.215, 0.205], [0.215, 0.205]];
  const eyes = EYES.map(([x, z]) => lathe([[u(1.03), 0], [0.036, 0], [0.036, 0.062], [u(1.03), 0.062], [u(1.03), 0]], 'lightGrey', { seg: 32, pos: [x, 0, z] }));
  // Doublures intérieures (vis du support P100 et de la boucle P104), flanc −X.
  const dbl = [...SIDE_BOLTS, ...LOOP_BOLTS].map(([y, z]) => box(0.047, 0.045, 0.045, 'lightGrey', { pos: [-(hw - tw) + 0.0235, y, z] }));
  // Cordons : pied des flancs, goussets, tête, lèvres (angle intérieur).
  const bead = welds([
    ...[1, -1].flatMap((s) => [[[s * hw, yBase, -hd], [s * hw, yBase, hd]], [[s * hw, yTop, -hd], [s * hw, yTop, hd]],
      [[s * (hw - tw), yBase + 0.004, -hd + tb], [s * (hw - tw), yBase + 0.004, hd - tl]],
      [[s * (hw - tw), yBase + 0.08, hd - tl], [s * (hw - tw), yTop - 0.004, hd - tl]]]),
    ...[1, -1].flatMap((s) => [-0.13, 0.13].flatMap((z) => [[[s * hw, yBase, z + 0.0064], [s * baseX, yBase, z + 0.0064]], [[s * hw, yBase, z + 0.0064], [s * hw, yBase + 0.16, z + 0.0064]]])),
    [[-hw, yBase, bz1 - 0.002], [hw, yBase, bz1 - 0.002]],
  ], 0.008, 'lightGrey');
  // Fourrures 1/4 po sous les lèvres, au droit des vis longues des barres de guidage (P060, repère 3).
  const furs = BAR_BOLTS.filter(([, r]) => r === '3').flatMap(([f]) => [-1, 1].map((s) => box(0.045, 0.045, u(0.25), 'lightGrey', { pos: [s * BAR.xc, BAR.y0 + BAR.L * (1 - f), hd - tl - u(0.125)] })));
  P('4', group(M([...walls, ...lips, back, ...rungs, topPlate, base, front, ...gussets, ...eyes, ...dbl, ...furs], 'lightGrey'), bead), [0, 0, -0.55]);

  // ============================================================ 1 — bagues des bossages
  EYES.forEach(([x, z]) => P('1', lathe([[u(0.75), 0.001], [u(1.0), 0.001], [u(1.0), 0.061], [u(0.75), 0.061], [u(0.75), 0.001]], 'brass', { seg: 28, pos: [x, 0, z] }), [x * 0.6, -0.12, 0.1]));

  // ============================================================ 5 — barres de guidage
  for (const s of [-1, 1]) P('5', at(api.sub('P060'), [s * BAR.xc, BAR.y0, BAR.z0]), [s * 0.12, 0, 0.3]);

  // ============================================================ 7 / 8 / 9 — traversées
  const seats = { 1: [], [-1]: [] };
  for (const s of [1, -1]) {
    BULK_Y.forEach((y) => {
      const e = place(bulkElbow(6, { t: tw }), [s * (hw - tw), y, 0], [s, 0, 0], [0, 0, -1]);
      P('7', e, [s * 0.1, 0, 0]);
      seats[s].push(seat(e, 1));
      const o = seat(e, 0);
      P('9', place(capNut(6), o.p, o.d), [s * 0.16, 0, 0]);
    });
  }
  P('8', place(bulkElbow(8, { t: tw }), [hw - tw, BULK8_Y, 0], [1, 0, 0], [0, 0, -1]), [0.1, 0, 0]);

  // ============================================================ 3 — tubes 3/8 po
  BULK_Y.forEach((y, i) => {
    const a = seats[1][i], b = seats[-1][i];
    const A = a.p.clone().addScaledVector(a.d, 0.013), B = b.p.clone().addScaledVector(b.d, 0.013);
    const t = bentTube([A.toArray(), [A.x, y, ZT], [B.x, y, ZT], B.toArray()], u(0.375) / 2, 0.028, 'steel');
    const nuts = M([place(swivelNut(6), a.p, a.d), place(swivelNut(6), b.p, b.d)], 'zinc');
    P('3', group(t, nuts), [0, 0, -0.25]);
  });

  // ============================================================ 2 / 10 / 15 — colliers des tubes
  // Patte vissée dans la tôle de dos (vis vers −Z), boucle autour du tube du milieu du groupe bas.
  [[-0.09, BULK_Y[1]], [0.09, BULK_Y[1]]].forEach(([x, y]) => {
    const pc = pClamp(0.375);
    const zf = -hd + tb; // face intérieure de la tôle de dos
    // boucle : centre sur le tube (axe X), patte vers +Y contre la tôle
    const g = place(pc, [x, y, zf], [0, 0, 1], [0, 1, 0]);
    P('2', g, [0, 0, 0.12]);
    const ph = [x, y + pc.userData.hole[0], zf];
    const nl = 2 * Math.max(0.0008, 0.3125 * IN * 0.09) * 1.1;
    P('15', nordLock(0.3125 * IN, [ph[0], ph[1], zf + 0.0024 + nl / 2], [0, 0, 1]), [0, 0, 0.16]);
    P('10', hhcs(0.3125 * IN, u(0.75), [ph[0], ph[1], zf + 0.0024 + nl], [0, 0, 1]), [0, 0, 0.2]);
  });

  // ============================================================ 11 / 18 — points de câblage
  for (const x of [-0.06, 0.06]) {
    const zf = -hd + tb;
    const t = 2 * Math.max(0.0008, 0.375 * IN * 0.09) * 1.1;
    P('18', nordLock(0.375 * IN, [x, 2.2, zf + t / 2], [0, 0, 1], { sp: true }), [0, 0, 0.12]);
    P('11', hhcs(0.375 * IN, u(0.5), [x, 2.2, zf + t], [0, 0, 1]), [0, 0, 0.18]);
  }

  // ============================================================ 12 / 13 / 16 — vis du vérin
  const nl5 = 2 * Math.max(0.0008, 0.625 * IN * 0.09) * 1.1;
  BLOCK_BOLTS.forEach(([dx, dz]) => {
    P('16', nordLock(0.625 * IN, [dx, -nl5 / 2, CYL.z + dz], [0, -1, 0]), [0, -0.1, 0]);
    P('12', hhcs(0.625 * IN, u(2.25), [dx, -nl5, CYL.z + dz], [0, -1, 0]), [0, -0.2, 0]);
  });
  CYL_BOLTS.forEach(([dx, dz]) => {
    const y = CYL.yFlange + u(1.0);
    P('16', nordLock(0.625 * IN, [dx, y + nl5 / 2, CYL.z + dz], [0, 1, 0]), [0, 0.15, 0]);
    P('13', hhcs(0.625 * IN, u(2.5), [dx, y + nl5, CYL.z + dz], [0, 1, 0]), [0, 0.25, 0]);
  });

  // ============================================================ 6 — capot du vérin
  // Tôle 3/16 po pliée en chapeau : dessus chanfreiné à deux boutonnières,
  // jupes avant / arrière / latérales (échancrure arrière pour le boyau du
  // coude haut), pattes d'angle vissées sur la plaque de tête.
  const tg = u(0.1875), gh = 0.105, gx = 0.185, gz = 0.15, y0g = FEEDTOP();
  const topG = orient(slab(rrect(0, 0, 2 * gx, 2 * gz, 0.02), [obround(-0.05, 0.03, 0.06, 0.008, 'x'), obround(0.06, -0.04, 0.06, 0.008, 'x')], tg, 'lightGrey'), [1, 0, 0], [0, 0, -1], [0, y0g + gh - tg / 2, 0]);
  const skirts = [
    box(2 * gx - 0.03, gh - tg, tg, 'lightGrey', { pos: [0, y0g + (gh - tg) / 2, gz - tg / 2] }),
    box(0.11, gh - tg, tg, 'lightGrey', { pos: [-gx + 0.055 + 0.015, y0g + (gh - tg) / 2, -gz + tg / 2] }),
    box(0.11, gh - tg, tg, 'lightGrey', { pos: [gx - 0.055 - 0.015, y0g + (gh - tg) / 2, -gz + tg / 2] }),
    box(2 * gx - 0.25, 0.03, tg, 'lightGrey', { pos: [0, y0g + gh - tg - 0.015, -gz + tg / 2] }),
    ...[1, -1].map((s) => box(tg, gh - tg, 2 * gz - 0.03, 'lightGrey', { pos: [s * (gx - tg / 2), y0g + (gh - tg) / 2, 0] })),
  ];
  const GB = [[-0.165, -0.13], [0.165, -0.13], [-0.165, 0.13], [0.165, 0.13]];
  const tabs = GB.map(([x, z]) => box(0.045, tg, 0.045, 'lightGrey', { r: 0.004, pos: [x, y0g + tg / 2, z] }));
  P('6', M([topG, ...skirts, ...tabs], 'lightGrey'), [0, 0.35, 0]);
  const nl7 = 2 * Math.max(0.0008, 0.75 * IN * 0.09) * 1.1;
  GB.forEach(([x, z]) => {
    P('17', nordLock(0.75 * IN, [x, y0g + tg + nl7 / 2, z], [0, 1, 0]), [0, 0.42, 0]);
    P('14', hhcs(0.75 * IN, u(1.75), [x, y0g + tg + nl7, z], [0, 1, 0]), [0, 0.5, 0]);
  });

  return { view: { dir: [1, 0.55, 1.15] } };
}

function FEEDTOP() { return MAST.L; }
