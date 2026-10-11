// P164 — Vérin « stinger » 50/50 CX077007 rév. 2 (page 164) : « CYLINDER
// 50/50 - Ø03.50 X 48.00 ». Vérin double tige de l'avance V30 (P032 repère
// 42, deux vérins de part et d'autre du mât) : un corps central (4, ensemble
// soudé) porte deux demi-vérins opposés d'alésage 3 1/2 po, tige Ø 3 po
// (trousse de joints 10 « 3.5X3.0 »), course 24 po de chaque côté (48 po au
// total). Le corps 4 comprend le bloc central rond Ø 4 po (méplat usiné côté
// orifices, orifices C et A), les deux tubes Ø 4 × 1/4 po soudés au bloc, les
// bossages d'orifice D (haut) et B (bas) sous les têtes et deux bagues
// d'appui des colliers. Clapets d'équilibrage intégrés (2, cartouches CP004070)
// vissés radialement dans le bloc, à la hauteur de C (côté +X) et de A (côté
// −X), comme sur l'élévation. Dans chaque demi-vérin, du bloc vers la tête :
// écrou 1-12 UNF tout métal (1) logé dans le lamage du piston, piston étagé (6)
// à gorges de joint et de bague de guidage, tige chromée (5) à queue Ø 1 po,
// entretoise de course (8) sur la tige, tête vissée (7) sur l'extérieur du
// tube, bloquée par une vis de pression 1/4-28 à bout nylon (3) ; capuchon
// d'usure strié (9) emmanché dans le lamage du bout de tige. Vérin dessiné
// rentré (pistons contre le bloc), comme la coupe A-A.
// Repère : origine au centre du bloc central, sur l'axe ; Y le long de l'axe
// (tête « haute » vers +Y, orifice D) ; orifices C, A, D, B tournés vers −Z ;
// clapet de C vers +X, de A vers −X. Dans P032 : at(api.sub('P164'),
// [±0.4, 1.45, 0.1]) (voir STINGER) — fût de y = 0.6 à 2.3 (faces des têtes),
// orifices D / C / A / B à y = 2.21 / 1.495 / 1.405 / 0.69 du repère de
// P032, C à 14 mm du côté +X de l'axe, A du côté −X (cohérent avec P054).
// Encombrement ≈ 0.12 (X, cartouches) × 1.848 (Y, de −0.924 à +0.924, bouts
// des capuchons) × 0.12 (Z) m.
// Cotes : liste (alésage, course, filets 1-12 UNF et 1/4-28, joints 3.5 × 3.0),
// fût Ø 4 po (P054) ; le reste relevé sur l'élévation et la coupe à l'échelle
// du tube (≈ 74 px/po sur l'agrandissement) : tête Ø 4 1/2 × 2.9 po, bloc 5 po,
// piston 1.7 po, sortie de tige 2.44 po + capuchon 0.47 po. L'entretoise est
// longue de 2.7 po pour laisser 24 po de course entre elle et la tête.

const IN = 0.0254;
const u = (v) => v * IN;
const G = 0.02; // jeu radial entre pièces emboîtées (po)

// Cotes axiales (po) depuis le centre du bloc, demi-vérin haut (+Y).
const Y = {
  block: 2.5, // face du bloc (soudure du tube)
  flat: 2.27, // bout du méplat usiné
  pistonIn: 2.56, // face du piston côté bloc
  nutIn: 2.62, // face de l'écrou (bout de la queue de tige)
  cbore: 3.42, // fond du lamage de l'écrou
  pistonOut: 4.26, // épaulement de la tige
  spacerOut: 6.98,
  pilot: 31.0, // bas du nez de la tête dans le tube (course = 31.0 − 6.98 = 24)
  hpIn: 30.56, // bas de la jupe de la tête
  tubeEnd: 31.66,
  hpOut: 33.46, // face extérieure de la tête (y = 2.3 dans P032)
  rodStep: 34.9, // portée réduite du bout de tige
  rodEnd: 35.9,
  capTop: 36.37,
  portD: 29.92, // orifice D (B en bas)
  portC: 1.77, // orifice C (A en bas, −1.77)
  band: 23.1, // bague d'appui de collier
  setScrew: 30.9,
  spanner: 32.0,
};
const R = { tube: 2.0, bore: 1.75, rod: 1.5, hp: 2.25, pin: 0.5 };
const DXP = 0.55; // décalage latéral des orifices C (+X) et A (−X), 14 mm

// Repère et orifices pour P032 / P054 (mètres, repère de P032 pour abs*).
export const STINGER = {
  x: 0.4, y: 1.45, z: 0.1, // centre du bloc dans P032 (vérins en x = ±0.4)
  barrelR: u(R.tube),
  headR: u(R.hp),
  faces: [-u(Y.hpOut), u(Y.hpOut)], // faces des têtes (local)
  ends: [-u(Y.capTop), u(Y.capTop)], // bouts des capuchons (rentré)
  stroke: u(24),
  ports: { // local : centre de la face du bossage / lamage, normale −Z
    D: [0, u(Y.portD), -u(2.35)],
    C: [u(DXP), u(Y.portC), -u(1.732)],
    A: [-u(DXP), -u(Y.portC), -u(1.732)],
    B: [0, -u(Y.portD), -u(2.35)],
  },
};

export default function P164(api) {
  const { THREE, S } = api;
  const { lathe, thread, slotted, roundHole, weldRing, extrude, merged, nut, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = (pts, mat, seg = 48, opts = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
  // Demi-vérin bas : même pièce tournée de 180° autour de Z (les détails
  // tournés vers −Z restent vers −Z) ; éclaté retourné de même.
  const half = (obj, s) => (s > 0 ? obj : at(group(obj), [0, 0, 0], [0, 0, Math.PI]));
  const E = (e, s) => (s > 0 ? e : [-e[0], -e[1], e[2]]);

  // ================================================ 4 — corps soudé
  // Bloc central : méplat côté −Z (largeur 2 po) sur y ∈ ±FLAT, bouts ronds.
  const ZF = Math.sqrt(R.tube * R.tube - 1); // 1.732 : profondeur du méplat
  const arc = [];
  const a0 = -Math.PI / 3, a1 = (4 * Math.PI) / 3;
  for (let i = 0; i <= 40; i++) {
    const a = a0 + ((a1 - a0) * i) / 40;
    arc.push([u(R.tube * Math.cos(a)), -u(R.tube * Math.sin(a))]);
  }
  // Méplat : semelle percée des orifices (plaque de 1/2 po logée dans une
  // encoche du profil rond), pour que les alésages soient de vrais trous.
  const ZN = ZF - 0.5;
  const mid = extrude([...arc, [-u(1), u(ZN)], [u(1), u(ZN)]], u(2 * Y.flat), 'black');
  mid.rotation.x = -Math.PI / 2;
  const PORTS = [[DXP, Y.portC], [-DXP, -Y.portC]];
  const pad = S.plate(u(2), u(2 * Y.flat), u(0.5), 'black', { holes: PORTS.map(([x, y]) => [u(x), -u(y), u(0.28)]) });
  pad.rotation.x = Math.PI / 2;
  pad.position.z = -u(ZF - 0.25);
  const blockEnds = [1, -1].map((s) => half(L([
    [0, Y.flat], [R.tube, Y.flat], [R.tube, Y.block - 0.06], [R.tube - 0.1, Y.block],
    [R.bore - G, Y.block], [R.bore - G, Y.block + 0.35], [0, Y.block + 0.35],
  ], 'black', 56), s));
  // Lamages en saillie autour des orifices SAE-6 ; alésages taraudés (paroi
  // tournée vers l'intérieur, fond plat) en acier usiné.
  const spots = PORTS.map(([x, y]) => at(L([[0.28, 0], [0.42, 0], [0.42, 0.025], [0.28, 0.025], [0.28, 0]], 'black', 24, { axis: '-z' }), [u(x), u(y), -u(ZF)]));
  const bores = PORTS.map(([x, y]) => at(L([
    [0.28, 0.02], ...thread(0.27, -0.42, 0, { pitch: 1 / 18, maxTurns: 7, chamferBottom: false }).reverse(), [0.27, -0.45], [0, -0.45],
  ], 'steel', 20, { axis: '-z' }), [u(x), u(y), -u(ZF)]));
  // Tubes Ø 4 × 1/4 po, bossages D / B, bagues d'appui, cordons.
  const tube = (s) => half(group(
    lathe([[u(R.bore), u(Y.block)], [u(R.tube - 0.08), u(Y.block)], [u(R.tube), u(Y.block + 0.1)], [u(R.tube), u(Y.tubeEnd - 0.06)],
      [u(R.tube - 0.06), u(Y.tubeEnd)], [u(R.bore + 0.04), u(Y.tubeEnd)], [u(R.bore), u(Y.tubeEnd - 0.04)], [u(R.bore), u(Y.block)]], 'black', { seg: 56 }),
    // Bossage d'orifice soudé (SAE-8), face à 2.35 po de l'axe, vers −Z.
    at(L([[0.32, 1.86], [0.55, 1.86], [0.55, 2.31], [0.51, 2.35], [0.42, 2.35], [0.42, 2.32], [0.32, 2.32], [0.32, 1.86]], 'black', 28, { axis: '-z' }), [0, u(Y.portD), 0]),
    at(L([[0, 1.95], ...thread(0.33, 1.95, 2.3, { pitch: 1 / 16, maxTurns: 6 }).map(([r, yy]) => [r - 0.01, yy]), [0, 2.3]], 'black', 18, { axis: '-z' }), [0, u(Y.portD), 0]),
    // Bague d'appui Ø 4 1/2 × 1/2 po.
    L([[R.tube, Y.band - 0.25], [R.hp - 0.04, Y.band - 0.25], [R.hp, Y.band - 0.21], [R.hp, Y.band + 0.21], [R.hp - 0.04, Y.band + 0.25], [R.tube, Y.band + 0.25]], 'black', 56),
  ), s);
  const welds = [
    weldRing(u(R.tube), u(0.17), 'black', { pos: [0, u(Y.block), 0] }),
    weldRing(u(R.tube), u(0.17), 'black', { pos: [0, -u(Y.block), 0] }),
    ...[1, -1].map((s) => weldRing(u(0.57), u(0.12), 'black', { axis: 'z', pos: [0, s * u(Y.portD), -u(1.93)] })),
    ...[1, -1].flatMap((s) => [-1, 1].map((k) => weldRing(u(R.tube + 0.03), u(0.1), 'black', { pos: [0, s * u(Y.band + k * 0.27), 0] }))),
  ];
  const beads = merged(welds, 'black');
  beads.geometry.userData.edgeAngle = 75;
  const body = merged([mid, pad, ...blockEnds, ...spots, tube(1), tube(-1)], 'black');
  body.userData.hasInterior = true;
  P('4', group(body, merged(bores, 'steel'), beads), [0, 0, 0]);

  // ================================================ 2 — clapets d'équilibrage
  // Cartouche vissée selon l'axe local +Y : corps fileté dans le bloc,
  // collerette, six pans 3/4, tige de réglage, contre-écrou, bout à fente.
  const valve = () => group(
    merged([
      L([[0, -1.1], ...thread(0.4, -1.1, -0.15, { pitch: 1 / 20, maxTurns: 10 }), [0.4, 0], [0.55, 0], [0.58, 0.03], [0.58, 0.17], [0.55, 0.2], [0, 0.2]], 'zinc', 28),
      at(nut(u(0.75), u(0.24), 'zinc'), [0, u(0.32), 0]),
      L([[0, 0.44], [0.3, 0.44], [0.3, 0.5], [0.22, 0.52], [0, 0.52]], 'zinc', 24),
    ], 'zinc'),
    merged([
      L([[0, 0.5], ...thread(0.16, 0.5, 0.92, { pitch: 1 / 24, maxTurns: 9, chamferBottom: false }), [0.16, 0.94], [0.13, 0.97], [0, 0.97]], 'steel', 18),
      at(nut(u(0.4375), u(0.16), 'steel'), [0, u(0.62), 0]),
    ], 'steel'),
    // fente de réglage
    at(S.box(u(0.26), u(0.05), u(0.04), 'blackOxide'), [0, u(0.955), 0]),
  );
  const xb = Math.sqrt(R.tube * R.tube - 0.3 * 0.3) - 0.02; // collerette posée sur le flanc rond
  P('2', at(valve(), [u(xb), u(Y.portC), 0], [0, 0, -Math.PI / 2]), [0.09, 0, 0]);
  P('2', at(valve(), [-u(xb), -u(Y.portC), 0], [0, 0, Math.PI / 2]), [-0.09, 0, 0]);

  // ================================================ têtes, tiges et pistons
  const DX = 0.16, LIFT = 0.3;
  const spannerHoles = [0, Math.PI].flatMap((a) => roundHole(a, u(Y.spanner), u(0.14), u(R.hp), { steps: 8 }));
  const setHole = roundHole(Math.PI, u(Y.setScrew), u(0.125), u(R.hp), { steps: 8 });
  for (const s of [1, -1]) {
    // 7 — tête : jupe taraudée sur le tube (couronne à trous de clé et trou de
    // la vis de pression), nez dans le tube, gorges de bague de guidage, de
    // joint de tige et lamage du racleur dans l'alésage.
    const collar = slotted(u(R.hp), u(R.tube + G), u(Y.hpIn + 0.05), u(Y.hpOut - 0.05), [...spannerHoles, ...setHole], 'black', { seg: 64 });
    const turned = L([
      [R.rod + G, Y.pilot], [R.bore - G, Y.pilot], [R.bore - G, Y.tubeEnd], [R.tube + G, Y.tubeEnd], [R.tube + G, Y.hpOut - 0.05],
      [R.hp, Y.hpOut - 0.05], [R.hp - 0.04, Y.hpOut], [1.78, Y.hpOut], [1.78, Y.hpOut - 0.28], [R.rod + G, Y.hpOut - 0.28],
      [R.rod + G, 32.6], [1.68, 32.6], [1.68, 32.1], [R.rod + G, 32.1],
      [R.rod + G, 31.9], [1.62, 31.9], [1.62, 31.45], [R.rod + G, 31.45], [R.rod + G, Y.pilot],
    ], 'black', 64);
    const skirt = L([[R.tube + G, Y.hpIn], [R.hp - 0.04, Y.hpIn], [R.hp, Y.hpIn + 0.04], [R.hp, Y.hpIn + 0.05], [R.tube + G, Y.hpIn + 0.05], [R.tube + G, Y.hpIn]], 'black', 64);
    const hp = merged([collar, turned, skirt], 'black');
    hp.userData.hasInterior = true;
    P('7', half(hp, s), E([DX, LIFT + 0.12, 0], s));

    // 3 — vis de pression 1/4-28 × 5/16 à six pans creux, bout nylon, vers −Z
    const ss = group(
      L([[0, 0.02], [0.1, 0.02], ...thread(0.125, 0.02, 0.3125, { pitch: 1 / 28, maxTurns: 7, chamferBottom: false }).slice(1),
        [0.07, 0.3125], [0.07, 0.2], [0, 0.2]], 'blackOxide', 12),
      L([[0, 0], [0.07, 0], [0.08, 0.01], [0.08, 0.03], [0, 0.03]], 'white', 12),
    );
    P('3', half(at(ss, [0, u(Y.setScrew), -u(2.24 - 0.3125)], [-Math.PI / 2, 0, 0]), s), E([DX, LIFT + 0.12, -0.05], s));

    // 5 — tige chromée Ø 3 po : queue Ø 1 po filetée 1-12 UNF, épaulement,
    // portée réduite et lamage du capuchon en bout (fond conique de foret).
    const shaft = group(
      L([
        [0, Y.cbore - 0.25], [R.pin, Y.cbore - 0.25], [R.pin, Y.pistonOut], [R.rod - 0.05, Y.pistonOut], [R.rod, Y.pistonOut + 0.05],
        [R.rod, Y.rodStep - 0.05], [1.42, Y.rodStep], [1.42, Y.rodEnd - 0.04], [1.38, Y.rodEnd], [0.72, Y.rodEnd],
        [0.72, Y.rodEnd - 1.0], [0.6, Y.rodEnd - 1.0], [0, Y.rodEnd - 1.35],
      ], 'chrome', 56),
      L([[0, Y.nutIn], ...thread(R.pin, Y.nutIn, Y.cbore - 0.25, { pitch: 1 / 12, maxTurns: 10 }), [0, Y.cbore - 0.25]], 'steel', 20),
    );
    P('5', half(shaft, s), E([DX, LIFT, 0], s));

    // 9 — capuchon d'usure : disque Ø 3 po strié en couronnes, queue Ø 1.4 po
    const kn = [];
    for (let i = 0; i < 9; i++) {
      const r0 = 1.5 - i * 0.16;
      kn.push([r0, Y.capTop - 0.03], [r0 - 0.08, Y.capTop]);
    }
    P('9', half(L([
      [0, Y.rodEnd - 0.9], [0.66, Y.rodEnd - 0.9], [0.7, Y.rodEnd - 0.86], [0.7, Y.rodEnd + 0.04], [1.46, Y.rodEnd + 0.04], [1.5, Y.rodEnd + 0.08],
      ...kn, [0, Y.capTop],
    ], 'darkSteel', 48), s), E([DX, LIFT + 0.2, 0], s));

    // 8 — entretoise de course sur la tige
    P('8', half(L([
      [R.rod + G, Y.pistonOut + 0.02], [1.66, Y.pistonOut + 0.02], [1.69, Y.pistonOut + 0.05], [1.69, Y.spacerOut - 0.03],
      [1.66, Y.spacerOut], [R.rod + G, Y.spacerOut], [R.rod + G, Y.pistonOut + 0.02],
    ], 'steel', 56), s), E([DX, LIFT + 0.06, 0], s));

    // 6 — piston étagé : portée large côté bloc (gorge de bague de guidage et
    // gorge du joint), gradin côté tige, lamage de l'écrou côté bloc, gorge
    // du joint torique dans l'alésage.
    const LAND = R.bore - 0.03;
    P('6', half(L([
      [0.9, Y.pistonIn], [LAND - 0.04, Y.pistonIn], [LAND, Y.pistonIn + 0.04], [LAND, 2.8], [1.62, 2.8], [1.62, 3.1], [LAND, 3.1],
      [LAND, 3.2], [1.45, 3.2], [1.45, 3.62], [LAND, 3.62], [LAND, 3.82], [1.6, 3.86], [1.6, Y.pistonOut - 0.04], [1.56, Y.pistonOut],
      [R.pin + G, Y.pistonOut], [R.pin + G, 3.95], [0.6, 3.95], [0.6, 3.82], [R.pin + G, 3.82], [R.pin + G, Y.cbore],
      [0.9, Y.cbore], [0.9, Y.pistonIn],
    ], 'steel', 56), s), E([DX, LIFT - 0.08, 0], s));

    // 1 — écrou 1-12 UNF tout métal (six pans 1 1/2 po, collerette déformée)
    P('1', half(group(merged([
      at(nut(u(1.5), u(0.62), 'zinc'), [0, u(Y.cbore - 0.31), 0]),
      L([[0.56, Y.nutIn], [0.68, Y.nutIn], [0.72, Y.nutIn + 0.18], [0.56, Y.nutIn + 0.18], [0.56, Y.nutIn]], 'zinc', 24),
    ], 'zinc')), s), E([DX, LIFT - 0.16, 0], s));
  }
  // 10 — trousse de joints : sans objet.
  return { view: { dir: [0.35, 0.15, -1] } };
}
