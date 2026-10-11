// P392 — Réservoir d'air : CX036963 rév. 0 « ASSY, RECEIVER TANK » (page
// 392), repère 32 de P186 (150 lb). Réservoir 14 po × 30 po, 17 gal (4), axe
// horizontal, tenu par deux colliers à pattes (1) boulonnés au châssis : vis
// H 1/2-13 × 1 1/2 po (16), rondelles dessus et dessous (17, ×8), écrous (18).
// Bout -X : mamelon court 2 po NPT sch. 80 (15), coude femelle 45° 2 po (11) et
// flexible d'air 2 po × 28 po (3) qui remonte en crosse vers -X ; bout +X :
// coude 90° NPT 2 po → JIC -32 (7). Dessus : coude 45° NPT 2 po → JIC -32 (5),
// bouchon 2 po (14), adaptateur NPT 3/4 → JIC -08 (9), bouchon 3/4 (13). Face
// avant (+Z) : coude de tuyauterie 1 po (10) portant la soupape de sûreté
// 450 psi (2) tête en bas, adaptateur NPT 3/4 → JIC -06 (8). Arrière :
// bouchon 1/2 (12) ; dessous : coude 90° NPT 1/2 → JIC -08 (6, purge).
// Repère : origine au milieu du réservoir, sur le plan d'appui des pattes des
// colliers (y = 0) ; X selon l'axe du réservoir (+X côté coude 7), Y vers le
// haut, +Z face avant (soupape). Axe du réservoir à y = 0.19.
// Encombrement ≈ 1.25 (X) × 0.62 (Y) × 0.42 (Z) m.
import { IN, NPT, nptFitting, orient, orientPoint } from './_chassis.js';

export default function P392(api) {
  const { S, THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const R = 7 * IN, YC = 0.19, L = 30 * IN;
  const HD = 0.085; // profondeur des fonds bombés

  // ---------------------------------------------------------------- 4 — réservoir
  const ports = [
    // [x, angle autour de X depuis +Y vers +Z (rad), dash NPT]
    { k: '5', x: -0.08, a: 0, npt: 32 },
    { k: '14', x: 0.13, a: 0, npt: 32 },
    { k: '9', x: 0.03, a: 0, npt: 12 },
    { k: '13', x: -0.17, a: 0.35, npt: 12 },
    { k: '10', x: -0.05, a: 1.1, npt: 16 },
    { k: '8', x: 0.07, a: 1.35, npt: 12 },
    { k: '12', x: -0.12, a: -1.2, npt: 8 },
    { k: '6', x: -0.04, a: Math.PI, npt: 8 },
  ];
  const BOSS = 0.014;
  const portPos = (p) => [p.x, YC + Math.cos(p.a) * (R + BOSS), Math.sin(p.a) * (R + BOSS)];
  const portDir = (p) => [0, Math.cos(p.a), Math.sin(p.a)];
  {
    const half = L / 2 - HD;
    // Virole + fonds elliptiques (profil de révolution selon X), soudures circulaires.
    const prof = [[0, -L / 2]];
    for (let i = 1; i <= 10; i++) { const t = (i / 10) * (Math.PI / 2); prof.push([R * Math.sin(t), -half - HD * Math.cos(t)]); }
    prof.push([R, half]);
    for (let i = 1; i <= 10; i++) { const t = (i / 10) * (Math.PI / 2); prof.push([R * Math.cos(t), half + HD * Math.sin(t)]); }
    const body = [S.lathe(prof, 'lightGrey', { axis: 'x', seg: 56, pos: [0, YC, 0] })];
    for (const s of [-1, 1]) body.push(S.weldRing(R + 0.001, 0.006, 'lightGrey', { axis: 'x', pos: [s * (half - 0.02), YC, 0] }));
    // Manchons des bouts (2 po) et manchons soudés de la virole.
    for (const s of [-1, 1]) body.push(S.cyl((NPT[32] * IN) / 2 * 1.3, 0.03, 'lightGrey', { axis: 'x', seg: 28, pos: [s * (L / 2 + 0.012), YC, 0] }));
    for (const p of ports) {
      const rb = (NPT[p.npt] * IN) / 2 * 1.35;
      const c = [p.x, YC + Math.cos(p.a) * (R + BOSS / 2 - 0.004), Math.sin(p.a) * (R + BOSS / 2 - 0.004)];
      body.push(orient(api, S.cyl(rb, BOSS + 0.008, 'lightGrey', { seg: 24 }), c, portDir(p)));
    }
    // Plaque de construction (face +Z de nameplate couchée sur +Y local) sur la virole avant-haute.
    const plate = S.group(S.at(S.nameplate(0.09, 0.055), [0, 0, 0], [-Math.PI / 2, 0, 0]));
    P('4', S.group(S.merged(body, 'lightGrey'), orient(api, plate, [0.2, YC + Math.cos(0.9) * (R + 0.0005), Math.sin(0.9) * (R + 0.0005)], [0, Math.cos(0.9), Math.sin(0.9)], [1, 0, 0])), [0, 0, 0]);
  }

  // ---------------------------------------------------------------- 1, 16, 17, 18 — colliers
  const XB = 0.24, BW = 2 * IN, BT = 0.25 * IN;
  const ZF = R + 0.035; // axe des trous des pattes
  for (const s of [-1, 1]) {
    const x = s * XB;
    const parts = [S.shell(R + BT, R, BW, 'grey', { axis: 'x', seg: 56, pos: [x, YC, 0] })];
    // Pattes : jambes tangentes jusqu'au plan d'appui, semelles percées.
    for (const z of [-1, 1]) {
      parts.push(S.box(BW, YC - 0.02, BT, 'grey', { pos: [x, (YC - 0.02) / 2 + 0.01, z * (R + BT / 2)] }));
      parts.push(S.plate(BW, 0.05, BT, 'grey', { holes: [[0, z * 0.01, 0.0072]] }));
      parts[parts.length - 1].position.set(x, BT / 2, z * (R + 0.025));
    }
    P('1', S.merged(parts, 'grey'), [0, 0, 0]);
    for (const z of [-1, 1]) {
      const pz = z * ZF;
      P('17', S.at(S.washer(0.53 * IN, 0.27 * IN, 0.1 * IN, 'zinc'), [x, BT + 0.00127, pz]), [0, 0.06, 0]);
      P('16', S.bolt(0.5 * IN, 1.5 * IN, 'zinc', { pos: [x, BT + 0.0026, pz] }), [0, 0.12, 0]);
      // Dessous du châssis (tôle 3/8 po supposée) : rondelle et écrou.
      P('17', S.at(S.washer(0.53 * IN, 0.27 * IN, 0.1 * IN, 'zinc'), [x, -0.0095 - 0.00127, pz]), [0, -0.06, 0]);
      P('18', S.nut(0.75 * IN, 0.44 * IN, 'zinc', { pos: [x, -0.0095 - 0.0026 - 0.0056, pz] }), [0, -0.1, 0]);
    }
  }

  // ---------------------------------------------------------------- raccords
  const put = (ref, f, pos, dir, side, e) => { P(ref, orient(api, f.obj, pos, dir, side), e); return orientPoint(api, f.out, pos, dir, side); };
  const byK = Object.fromEntries(ports.map((p) => [p.k, p]));
  put('5', nptFitting(api, { npt: 32, jic: 32, angle: 45 }), portPos(byK['5']), portDir(byK['5']), [-1, 0, 0], [0, 0.1, 0]);
  put('9', nptFitting(api, { npt: 12, jic: 8 }), portPos(byK['9']), portDir(byK['9']), null, [0, 0.08, 0]);
  put('8', nptFitting(api, { npt: 12, jic: 6 }), portPos(byK['8']), portDir(byK['8']), null, [0, 0.03, 0.08]);
  put('6', nptFitting(api, { npt: 8, jic: 8, angle: 90 }), portPos(byK['6']), portDir(byK['6']), [0, 0, 1], [0, -0.08, 0]);
  // Bouchons pleins à tête six-pans (12, 13, 14).
  const plug = (npt) => {
    const rn = (NPT[npt] * IN) / 2, h = rn * 0.9;
    return S.merged([
      S.lathe([[0, -rn * 1.2], ...S.thread(rn * 0.94, -rn * 1.2, 0, { r1: rn, pitch: rn * 0.2, maxTurns: 6 }), [0, 0]], 'darkSteel', { seg: 16 }),
      S.nut(rn * 2.1, h, 'darkSteel', { pos: [0, h / 2, 0] }),
    ], 'darkSteel');
  };
  for (const k of ['12', '13', '14']) P(k, orient(api, plug(byK[k].npt), portPos(byK[k]), portDir(byK[k])), portDir(byK[k]).map((v) => v * 0.07));
  // 10 — coude de tuyauterie 1 po sur la face avant, ouverture vers le bas ; 2 — soupape.
  const o10 = put('10', nptFitting(api, { npt: 16, angle: 90, end: 'fnpt' }), portPos(byK['10']), portDir(byK['10']), [0, -1, 0], [0, 0, 0.08]);
  {
    const rn = (NPT[16] * IN) / 2;
    const g = S.group(
      S.merged([
        S.lathe([[0, -rn * 1.4], ...S.thread(rn * 0.94, -rn * 1.4, 0, { r1: rn, pitch: rn * 0.2, maxTurns: 6 }), [0, 0]], 'brass', { seg: 18 }),
        S.nut(rn * 2.3, 0.012, 'brass', { pos: [0, 0.006, 0] }),
        S.cyl(rn * 1.05, 0.05, 'brass', { seg: 24, pos: [0, 0.037, 0] }),
        S.cyl(rn * 0.75, 0.03, 'brass', { seg: 20, r2: rn * 0.5, pos: [0, 0.077, 0] }),
      ], 'brass'),
      S.merged([S.cyl(0.0025, 0.02, 'steel', { seg: 8, pos: [0, 0.1, 0] }), S.torus(0.012, 0.002, 'steel', { axis: 'z', pos: [0, 0.122, 0] })], 'steel'),
    );
    // Lumières d'échappement : quatre fenêtres creusées dans le fût (vraies ouvertures).
    g.add(S.slotted(rn * 1.07, rn * 0.9, 0.022, 0.034, [0, 1, 2, 3].map((i) => ({ a: (i * Math.PI) / 2, w: 0.6, y0: 0.024, y1: 0.032 })), 'brass', { seg: 24 }));
    P('2', orient(api, g, o10, [0, -1, 0]), [0, -0.1, 0.08]);
  }
  // Bout -X : 15 mamelon court 2 po, 11 coude femelle 45°, 3 flexible 2 po.
  const rn2 = (NPT[32] * IN) / 2;
  const xe = -L / 2 - 0.027;
  {
    const t1 = S.thread(rn2 * 0.95, 0, 0.03, { r1: rn2, pitch: rn2 * 0.15, maxTurns: 6 });
    const t2 = t1.map(([r, y]) => [r, 0.068 - y]).reverse();
    P('15', S.lathe([[0, 0], ...t1, ...t2, [0, 0.068]], 'steel', { axis: '-x', seg: 28, pos: [xe + 0.034, YC, 0] }), [-0.06, 0, 0]);
  }
  const x11 = xe - 0.034 + 0.02;
  const dir11 = new THREE.Vector3(-Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0);
  {
    // Coude femelle 45° : deux manchons taraudés réunis par un coude rond.
    const ro = rn2 * 1.32, ri = rn2 * 0.96, Lm = 0.045;
    const g = S.group(
      S.at(S.shell(ro, ri, Lm, 'darkSteel', { axis: 'x', seg: 28 }), [-Lm / 2 + 0.012, 0, 0]),
      S.ball(ro, 'darkSteel', { pos: [-Lm + 0.012, 0, 0] }),
      orient(api, S.shell(ro, ri, Lm, 'darkSteel', { seg: 28 }), [-Lm + 0.012 + dir11.x * Lm / 2, dir11.y * Lm / 2, 0], dir11.toArray()),
    );
    g.position.set(x11, YC, 0);
    P('11', g, [-0.12, 0.04, 0]);
  }
  {
    const s = new THREE.Vector3(x11 - 0.045 + 0.012, YC, 0).addScaledVector(dir11, 0.045);
    const p = (k) => s.clone().addScaledVector(dir11, k).toArray();
    const a = p(0.02), b = p(0.16);
    // Crosse : monte à 45°, passe au sommet et redescend vers -X (28 po ≈ 0.71 m).
    P('3', S.hose([a, b, [b[0] - 0.12, b[1] + 0.13, 0], [b[0] - 0.3, b[1] + 0.1, 0], [b[0] - 0.36, b[1] - 0.04, 0]], 0.03), [-0.2, 0.12, 0]);
  }
  // Bout +X : 7 coude 90° NPT 2 po → JIC -32, sortie vers +Z.
  put('7', nptFitting(api, { npt: 32, jic: 32, angle: 90 }), [L / 2 + 0.027, YC, 0], [1, 0, 0], [0, 0, 1], [0.1, 0, 0]);
  return { view: { dir: [0.9, 0.6, 1.1] } };
}
