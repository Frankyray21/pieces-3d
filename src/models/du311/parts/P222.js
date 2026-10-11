// P222 — Refroidisseur final d'air : CX030782 rév. 2 « AFTERCOOLER ASSEMBLY,
// DU311-TK » (page 222), repère 15 de P186. Échangeur à plaques brasées (4,
// CP001164) : paquet de plaques inox 0.50 × 0.20 m, quatre piquages mâles 2
// NPT sur la face avant, qui traversent les quatre grands trous de la platine
// (1, tôle 1/4 po à semelle pliée vers l'arrière). Joint isolant (7) entre la
// platine et l'échangeur, tampon isolant (3) au dos, bride de serrage en U (2)
// tirée contre la platine par huit vis H 1/2-13 × 1 3/4 po (24) au-dessus et
// au-dessous de l'échangeur, rondelles SAE (25) et écrous freins à bague nylon
// (27). Semelle fixée au porteur par quatre vis H 3/8-16 × 3 1/4 po (23) et
// rondelles fendues (26) (taraudages de P186).
// Piquages : en haut à gauche, té 2 po (18) d'où part un flexible d'air 2 po ×
// 28 po (6) vers le haut, réduction six-pans 2 × 1/2 NPT (16) et sonde de
// température (9) au bout du passage ; en bas à gauche, manchon réducteur 2 ×
// 1 po (20), mamelon court 1 po (22), croix en fonte malléable 1 po (21) :
// réduction 1 × 1/2 (19) et sonde (9) en façade, de chaque côté un adaptateur
// droit MNPT -16 (13) et un adaptateur à écrou tournant (15) vers une
// électrovanne 2/2 1 po 24 V CC (8). Côté -X, après l'électrovanne :
// réduction 1 × 1/2 (19), mamelon six-pans MNPT-MJIC -08 (12), coude MNPT-FJIC
// (14), pointeau 1/2 po (5) vertical et coude 90° -08 (11). Côté +X : adaptateur
// droit (13) en sortie. En haut à droite, manchon 2 po (17) et second flexible
// (6) ; en bas à droite, manchon réducteur (20) et coude 45° -16 (10).
// Repère : origine au centre de la face avant de la platine ; Y vers le haut ;
// X selon la longueur de l'échangeur ; +Z vers l'avant (côté piquages).
// Encombrement ≈ 0.64 (X) × 0.92 (Y) × 0.56 (Z) m. Cotes estimées d'après les
// proportions de la page 222 (piquages 2 NPT et flexibles 2 po pour l'échelle).
import { IN, NPT, nptFitting, orient, orientPoint } from './_chassis.js';

export default function P222(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);

  const T = 0.25 * IN; // platine, bride
  const PW = 0.62, PH = 0.3; // platine
  const BL = 0.5, BH = 0.2, BD = 0.09; // échangeur
  const G = 0.006; // isolants
  const zF = -T - G; // face avant de l'échangeur
  const ports = { A: [-0.2, 0.05], B: [-0.2, -0.05], C: [0.2, 0.05], D: [0.2, -0.05] };
  const zP = 0.03; // bout des piquages
  const r2 = (NPT[32] * IN) / 2, r1 = (NPT[16] * IN) / 2;
  const boltsXY = [];
  for (const y of [0.125, -0.125]) for (const x of [-0.21, -0.07, 0.07, 0.21]) boltsXY.push([x, y]);
  const rr = (w, h, r, n = 6) => {
    const pts = [];
    for (const [cx, cy, a0] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, 1.5 * Math.PI]]) {
      for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    }
    return pts;
  };

  // ---------------------------------------------------------------- 1 — platine
  {
    const front = S.extrude([[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [PW / 2, PH / 2], [-PW / 2, PH / 2]], T, 'grey', {
      holes: [...Object.values(ports).map(([x, y]) => [x, y, 0.04]), ...boltsXY.map(([x, y]) => [x, y, (0.53 * IN) / 2])],
    });
    front.position.z = -T / 2;
    const foot = S.plate(PW, 0.09, T, 'grey', { holes: [-0.28, -0.1, 0.1, 0.28].map((x) => [x, 0, (0.41 * IN) / 2]) });
    foot.position.set(0, -PH / 2 + T / 2, -T - 0.045);
    const bend = S.cyl(T, PW, 'grey', { axis: 'x', seg: 12, pos: [0, -PH / 2 + T, -T] });
    P('1', S.merged([front, foot, bend], 'grey'), [0, 0, 0.25]);
  }

  // ---------------------------------------------------------------- 7, 3 — isolants ; 4 — échangeur ; 2 — bride
  {
    const strips = [
      S.box(BL - 0.02, 0.015, G, 'rubber', { pos: [0, BH / 2 - 0.0175, -T - G / 2] }),
      S.box(BL - 0.02, 0.015, G, 'rubber', { pos: [0, -BH / 2 + 0.0175, -T - G / 2] }),
      S.box(0.015, BH - 0.05, G, 'rubber', { pos: [-BL / 2 + 0.0175, 0, -T - G / 2] }),
      S.box(0.015, BH - 0.05, G, 'rubber', { pos: [BL / 2 - 0.0175, 0, -T - G / 2] }),
    ];
    P('7', S.merged(strips, 'rubber'), [0, 0, 0.12]);
    P('3', S.box(BL - 0.04, BH - 0.02, G, 'rubber', { r: 0.002, pos: [0, 0, zF - BD - G / 2] }), [0, 0, -0.2]);
    // Échangeur : plaques de couverture épaisses, paquet de plaques embouties (arêtes alternées), piquages.
    const plates = [];
    const n = 22, pt = (BD - 0.016) / n;
    const cover = (z) => { const m = S.extrude(rr(BL, BH, 0.04), 0.008, 'steel'); m.position.z = z; return m; };
    plates.push(cover(zF - 0.004), cover(zF - BD + 0.004));
    for (let i = 0; i < n; i++) {
      const inset = i % 2 ? 0.0012 : 0;
      const m = S.extrude(rr(BL - 2 * inset, BH - 2 * inset, 0.04 - inset), pt * 0.98, 'steel');
      m.position.z = zF - 0.008 - pt * (i + 0.5);
      plates.push(m);
    }
    const nip = [];
    for (const [x, y] of Object.values(ports)) {
      nip.push(S.cyl(r2 * 1.2, 0.012, 'steel', { axis: 'z', seg: 28, pos: [x, y, zF + 0.006] }));
      nip.push(S.at(S.lathe([[r2 * 0.8, 0], ...S.thread(r2 * 0.94, 0, zP - zF - 0.012, { r1: r2, pitch: 0.003, maxTurns: 8 }).map(([r, y]) => [r, zP - zF - 0.012 - y]).reverse(), [r2 * 0.8, zP - zF - 0.012], [r2 * 0.8, 0]], 'steel', { seg: 28 }), [x, y, zF + 0.012], [Math.PI / 2, 0, 0]));
    }
    P('4', S.merged([...plates, ...nip], 'steel'), [0, 0, -0.08]);
    // 2 — bride en U : âme derrière le tampon, ailes vers l'avant, retours percés contre la platine.
    const zW = zF - BD - G;
    const parts = [S.box(BL, BH + 0.02, T, 'grey', { pos: [0, 0, zW - T / 2] })];
    for (const s of [1, -1]) {
      parts.push(S.box(BL, T, -zW - T, 'grey', { pos: [0, s * (BH / 2 + 0.01 + T / 2), (zW - T) / 2] }));
      const ya = s * (BH / 2 + 0.01), yb = s * (BH / 2 + 0.045);
      const lip = S.extrude([[-BL / 2, ya], [BL / 2, ya], [BL / 2, yb], [-BL / 2, yb]], T, 'grey', {
        holes: boltsXY.filter(([, y]) => y * s > 0).map(([x, y]) => [x, y, (0.53 * IN) / 2]),
      });
      lip.position.z = -T - T / 2;
      parts.push(lip);
    }
    P('2', S.merged(parts, 'grey'), [0, 0, -0.32]);
  }

  // ---------------------------------------------------------------- 23, 24, 25, 26, 27 — boulonnerie
  for (const [x, y] of boltsXY) {
    P('24', S.bolt(0.5 * IN, 1.75 * IN, 'zinc', { axis: 'z', pos: [x, y, 0] }), [0, 0, 0.35]);
    const zb = -2 * T;
    P('25', S.washer(0.53 * IN, 0.27 * IN, 0.097 * IN, 'zinc', { axis: 'z', pos: [x, y, zb - 0.0012] }), [0, 0, -0.42]);
    P('27', S.group(
      S.nut(0.75 * IN, 0.45 * IN, 'zinc', { axis: 'z', pos: [x, y, zb - 0.0025 - 0.0057] }),
      S.ring(0.36 * IN, 0.22 * IN, 0.15 * IN, 'plastic', { axis: 'z', seg: 20, pos: [x, y, zb - 0.0025 - 0.0114 - 0.0019] }),
    ), [0, 0, -0.46]);
  }
  for (const x of [-0.28, -0.1, 0.1, 0.28]) {
    const y = -PH / 2 + T, z = -T - 0.045;
    P('26', S.washer(0.34 * IN, 0.2 * IN, 0.094 * IN, 'zinc', { pos: [x, y + 0.0012, z] }), [0, 0.08, 0]);
    P('23', S.bolt(0.375 * IN, 3.25 * IN, 'zinc', { pos: [x, y + 0.0024, z] }), [0, 0.14, 0]);
  }

  // ---------------------------------------------------------------- raccords de tuyauterie
  const z0 = zP - 0.022; // début des pièces femelles vissées sur les piquages
  // Pièce de révolution le long de +Z (profil [r, z] relatif), posée en [x, y, z].
  const turnZ = (prof, mat, pos, seg = 28) => S.lathe(prof, mat, { axis: 'z', seg, pos });
  // Raccord _chassis orienté, avec son bout en coordonnées du repère.
  const fit = (f, pos, dir, side) => ({ obj: orient(api, f.obj, pos, dir, side), out: orientPoint(api, f.out, pos, dir, side) });

  // A — té 2 po (18), flexible (6), réduction (16), sonde (9).
  {
    const [x, y] = ports.A;
    const rb = r2 * 1.32, half = 0.045;
    const zc = z0 + half;
    const tee = S.merged([
      turnZ([[r2 * 0.98, 0], [rb, 0], [rb, 2 * half], [r2 * 0.98, 2 * half], [r2 * 0.98, 0]], 'steel', [x, y, z0]),
      S.at(S.lathe([[r2 * 0.98, 0], [rb, 0], [rb, half], [r2 * 0.98, half], [r2 * 0.98, 0]], 'steel', { seg: 28 }), [x, y, zc]),
      S.ball(rb * 1.02, 'steel', { pos: [x, y, zc] }),
    ], 'steel');
    P('18', tee, [0, 0, 0.12]);
    // Flexible 2 po : embout mâle vissé dans la branche, monte puis part vers l'avant.
    const h0 = [x, y + half - 0.01, zc];
    const hp = [h0, add(h0, [0, 0.18, 0]), add(h0, [0, 0.3, 0.06]), add(h0, [0.02, 0.4, 0.2]), add(h0, [0.04, 0.43, 0.36])];
    P('6', S.hose(hp, 0.03), [0, 0.15, 0.12]);
    // 16 — réduction six-pans 2 × 1/2 NPT au bout du passage ; 9 — sonde.
    const z16 = z0 + 2 * half;
    P('16', S.group(
      turnZ([[r2 * 0.7, -0.02], ...S.thread(r2 * 0.94, -0.02, 0, { r1: r2, pitch: 0.003, maxTurns: 5 }), [r2 * 0.7, 0], [r2 * 0.7, -0.02]], 'steel', [x, y, z16]),
      S.ring(2.75 * IN / Math.sqrt(3), (NPT[8] * IN) / 2, 0.012, 'steel', { axis: 'z', seg: 6, pos: [x, y, z16 + 0.006] }),
    ), [0, 0, 0.2]);
    const sensor = (pos, dir) => {
      const g = S.group(
        S.merged([
          S.nut(0.875 * IN, 0.012, 'steel', { pos: [0, 0.006, 0] }),
          S.cyl(0.011, 0.04, 'steel', { seg: 20, pos: [0, 0.032, 0] }),
        ], 'steel'),
        S.merged([
          S.lathe([[0, 0.052], [0.012, 0.052], [0.012, 0.07], [0.009, 0.074], [0, 0.074]], 'plastic', { seg: 20 }),
          S.box(0.016, 0.016, 0.01, 'plastic', { r: 0.002, pos: [0, 0.063, 0.012] }),
        ], 'plastic'),
      );
      return orient(api, g, pos, dir);
    };
    P('9', sensor([x, y, z16 + 0.012], [0, 0, 1]), [0, 0, 0.28]);
  }

  // B — manchon réducteur (20), mamelon court (22), croix (21) et ses deux branches.
  {
    const [x, y] = ports.B;
    const red = (pos) => turnZ([[r2 * 0.98, 0], [r2 * 1.3, 0], [r2 * 1.3, 0.035], [r1 * 1.35, 0.052], [r1 * 1.35, 0.065], [r1 * 0.98, 0.065], [r1 * 0.98, 0.04], [r2 * 0.98, 0.035], [r2 * 0.98, 0]], 'steel', pos);
    P('20', red([x, y, z0]), [0, 0, 0.1]);
    const z22 = z0 + 0.065 - 0.018;
    P('22', turnZ([[r1 * 0.75, 0], ...S.thread(r1, 0, 0.022, { pitch: 0.0025, chamferBottom: true }), [r1, 0.026], ...S.thread(r1, 0.03, 0.052, { pitch: 0.0025, chamferBottom: false }).map(([r, zz]) => [r, 0.082 - zz]).reverse(), [r1 * 0.75, 0.052], [r1 * 0.75, 0]], 'zinc', [x, y, z22], 20), [0, 0, 0.16]);
    // 21 — croix 1 po : arrivée -Z, sorties +Z, -X, +X ; bourrelets aux bouts.
    const zc = z22 + 0.052 - 0.018 + 0.032;
    const arm = (rot) => S.at(S.lathe([[r1 * 0.98, 0.012], [r1 * 1.3, 0.012], [r1 * 1.3, 0.024], [r1 * 1.42, 0.025], [r1 * 1.42, 0.032], [r1 * 0.98, 0.032], [r1 * 0.98, 0.012]], 'blackCast', { seg: 24 }), [x, y, zc], rot);
    P('21', S.merged([
      S.ball(r1 * 1.4, 'blackCast', { pos: [x, y, zc] }),
      arm([Math.PI / 2, 0, 0]), arm([-Math.PI / 2, 0, 0]), arm([0, 0, Math.PI / 2]), arm([0, 0, -Math.PI / 2]),
    ], 'blackCast'), [0, -0.12, 0.22]);
    // Réduction 1 × 1/2 NPT (19), six-pans 1 1/4 po, filet mâle 1 po ; vers dir depuis pos.
    const bushing = (pos, dir) => orient(api, S.group(
      S.lathe([[r1 * 0.7, -0.02], ...S.thread(r1 * 0.94, -0.02, 0, { r1, pitch: 0.0025, maxTurns: 5 }), [r1 * 0.7, 0], [r1 * 0.7, -0.02]], 'steel', { seg: 20 }),
      S.ring(1.25 * IN / Math.sqrt(3), (NPT[8] * IN) / 2, 0.011, 'steel', { seg: 6, pos: [0, 0.0055, 0] }),
    ), pos, dir);
    // Sortie +Z : 19 + 9.
    const zf = zc + 0.032;
    P('19', bushing([x, y, zf], [0, 0, 1]), [0, -0.12, 0.3]);
    {
      const g = S.group(
        S.merged([S.nut(0.875 * IN, 0.012, 'steel', { pos: [0, 0.006, 0] }), S.cyl(0.011, 0.04, 'steel', { seg: 20, pos: [0, 0.032, 0] })], 'steel'),
        S.merged([S.lathe([[0, 0.052], [0.012, 0.052], [0.012, 0.07], [0.009, 0.074], [0, 0.074]], 'plastic', { seg: 20 }), S.box(0.016, 0.016, 0.01, 'plastic', { r: 0.002, pos: [0, 0.063, 0.012] })], 'plastic'),
      );
      P('9', orient(api, g, [x, y, zf + 0.011], [0, 0, 1]), [0, -0.12, 0.38]);
    }
    // Électrovanne 2/2 1 po : corps laiton taraudé aux deux bouts (selon X), bobine carrée dessus, connecteur DIN.
    const valve8 = (cx) => S.group(
      S.merged([
        S.box(0.09, 0.05, 0.055, 'brass', { r: 0.004, pos: [cx, y, zc] }),
        S.cyl(0.018, 0.016, 'brass', { seg: 20, pos: [cx, y + 0.033, zc] }),
      ], 'brass'),
      S.merged([
        S.box(0.05, 0.05, 0.05, 'black', { r: 0.004, pos: [cx, y + 0.066, zc] }),
        S.box(0.03, 0.032, 0.022, 'black', { r: 0.002, pos: [cx, y + 0.066, zc + 0.035] }),
      ], 'black'),
      S.nut(0.022, 0.008, 'zinc', { pos: [cx, y + 0.095, zc] }),
    );
    // Côtés -X et +X : 13 (adaptateur droit) puis 15 (écrou tournant) puis 8.
    for (const s of [-1, 1]) {
      const dir = [s, 0, 0];
      const a13 = fit(nptFitting(api, { npt: 16, jic: 16 }), [x + s * 0.032, y, zc], dir, [0, 1, 0]);
      P('13', a13.obj, [s * 0.05, -0.12, 0.22]);
      // 15 : écrou tournant sur le bout de 13 (il coiffe le filet), queue mâle vers la vanne.
      const f15 = nptFitting(api, { npt: 16, jic: 16, end: 'swivel' });
      const L15 = f15.out[1];
      const p15 = add(a13.out, dir, L15 - 0.004);
      const back = [-s, 0, 0];
      P('15', orient(api, f15.obj, p15, back, [0, 1, 0]), [s * 0.1, -0.12, 0.22]);
      const cx = p15[0] + s * 0.045;
      P('8', valve8(cx), [s * 0.16, -0.12, 0.22]);
      const xo = cx + s * 0.045; // orifice de sortie
      if (s > 0) {
        P('13', fit(nptFitting(api, { npt: 16, jic: 16 }), [xo, y, zc], dir, [0, 1, 0]).obj, [0.22, -0.12, 0.22]);
      } else {
        P('19', bushing([xo, y, zc], dir), [-0.2, -0.12, 0.22]);
        const a12 = fit(nptFitting(api, { npt: 8, jic: 8 }), [xo - 0.011, y, zc], dir, [0, 1, 0]);
        P('12', a12.obj, [-0.24, -0.12, 0.22]);
        // 14 : coude MNPT-FJIC, écrou tournant sur 12, queue mâle vers le haut (dans le pointeau).
        const f14 = nptFitting(api, { npt: 8, jic: 8, angle: 90, end: 'swivel' });
        const o = f14.out; // [0, oy, oz] local, sortie selon +Z local
        const tip = add(a12.out, [1, 0, 0], 0.004);
        const p14 = [tip[0] - o[2], tip[1] + o[1], tip[2]];
        P('14', orient(api, f14.obj, p14, [0, -1, 0], [1, 0, 0]), [-0.28, -0.08, 0.22]);
        // 5 — pointeau 1/2 po : corps six-pans 1 po vertical, chapeau, tige et volant en croix (vers +Z).
        const yb = p14[1];
        const r8 = (NPT[8] * IN) / 2;
        const needle = S.group(
          S.merged([
            S.nut(1.0 * IN, 0.05, 'brass', { pos: [p14[0], yb + 0.025, p14[2]] }),
            S.nut(0.75 * IN, 0.012, 'brass', { axis: 'z', pos: [p14[0], yb + 0.025, p14[2] + 0.017] }),
            S.cyl(0.006, 0.03, 'steel', { axis: 'z', seg: 12, pos: [p14[0], yb + 0.025, p14[2] + 0.035] }),
          ], 'brass'),
          S.merged([
            S.box(0.05, 0.008, 0.006, 'black', { r: 0.002, pos: [p14[0], yb + 0.025, p14[2] + 0.05] }),
            S.box(0.008, 0.05, 0.006, 'black', { r: 0.002, pos: [p14[0], yb + 0.025, p14[2] + 0.05] }),
          ], 'black'),
        );
        void r8;
        P('5', needle, [-0.28, 0.0, 0.22]);
        const e11 = fit(nptFitting(api, { npt: 8, jic: 8, angle: 90 }), [p14[0], yb + 0.05, p14[2]], [0, 1, 0], [-1, 0, 0]);
        P('11', e11.obj, [-0.28, 0.06, 0.22]);
      }
    }
  }

  // C — manchon 2 po (17) et second flexible (6).
  {
    const [x, y] = ports.C;
    P('17', turnZ([[r2 * 0.98, 0], [r2 * 1.32, 0], [r2 * 1.32, 0.062], [r2 * 0.98, 0.062], [r2 * 0.98, 0]], 'steel', [x, y, z0]), [0, 0, 0.1]);
    const h0 = [x, y, z0 + 0.05];
    const hp = [h0, add(h0, [0, 0, 0.12]), add(h0, [0, 0.08, 0.24]), add(h0, [0, 0.26, 0.3]), add(h0, [0, 0.5, 0.31])];
    P('6', S.hose(hp, 0.03), [0.1, 0.15, 0.16]);
  }

  // D — manchon réducteur (20) et coude 45° -16 (10).
  {
    const [x, y] = ports.D;
    P('20', turnZ([[r2 * 0.98, 0], [r2 * 1.3, 0], [r2 * 1.3, 0.035], [r1 * 1.35, 0.052], [r1 * 1.35, 0.065], [r1 * 0.98, 0.065], [r1 * 0.98, 0.04], [r2 * 0.98, 0.035], [r2 * 0.98, 0]], 'steel', [x, y, z0]), [0, -0.05, 0.1]);
    P('10', fit(nptFitting(api, { npt: 16, jic: 16, angle: 45 }), [x, y, z0 + 0.065], [0, 0, 1], [0, -1, 0]).obj, [0, -0.1, 0.18]);
  }
  void THREE;

  return { view: { dir: [0.75, 0.55, 1.1] } };
}
