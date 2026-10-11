// P468 — Refroidisseur final CX002018 « AFTERCOOLER ASSEMBLY » (page 468),
// repère 5 de P466. Échangeur à plaques brasées inox air / eau (4, CP001164,
// même échangeur que TVK P222) : paquet de plaques embouties entre deux
// plaques de couverture épaisses, quatre piquages mâles 2 NPT sur la face
// avant (F1 entrée d'air en haut à droite, F2 sortie d'eau en bas à droite,
// F3 entrée d'eau en bas à gauche, F4 sortie d'air en haut à gauche, vue
// côté piquages, page 466). Platine en Z (1, tôle 1/4 po : âme percée des
// quatre passages de piquages, aile haute repliée vers l'arrière, aile basse
// vers l'avant) ; isolant antivibratoire découpé (5) entre la platine et
// l'échangeur, tampon isolant (3) au dos ; bride de serrage en U (2) tirée
// contre la platine par huit vis H 1/2-13 × 4 po gr. 8 (7) qui longent
// l'échangeur au-dessus et au-dessous, rondelles plates (10) et écrous
// freins (8) au dos de la bride. Quatre vis H 3/8-16 × 2 1/4 po (6) et
// rondelles Grower (9) aux coins de l'âme : fixation au cadre du capot.
// Repère : origine au centre de la face avant de l'âme de la platine ; X
// selon la longueur de l'échangeur (F1 / F2 vers +X), Y vers le haut, +Z
// vers l'avant (côté piquages, face des têtes de vis 7) ; l'échangeur est
// derrière la platine (z < 0). Bouts des piquages à z = AC.zP.
// Encombrement ≈ 0.62 (X) × 0.30 (Y) × 0.17 (Z) m. Cotes : visserie de la
// liste ; échangeur 0.50 × 0.20 m (proportions de la page 466, piquages
// 2 NPT pour l'échelle), épaisseur réglée sur la longueur des vis de 4 po.
import { I, pipeR } from './_rearb.js';

const T = I(0.25), G = I(3 / 16); // tôles, isolants
const BL = 0.5, BH = 0.2, BD = 0.065; // échangeur
const PW = 0.62, PH = 0.3; // âme de la platine
export const AC = {
  T, zF: -T - G, // face avant de l'échangeur
  zP: 0.03, // bout des piquages (filet mâle 2 NPT)
  ports: { F1: [0.2, 0.05], F2: [0.2, -0.05], F3: [-0.2, -0.05], F4: [-0.2, 0.05] },
  PW, PH,
};

export default function P468(api) {
  const { S } = api;
  const { box, cyl, extrude, plate, bolt, washer, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const zF = AC.zF, zB = zF - BD; // faces avant / arrière de l'échangeur
  const r2 = pipeR(32);
  const bolts7 = [];
  for (const y of [BH / 2 + 0.022, -BH / 2 - 0.022]) for (const x of [-0.21, -0.07, 0.07, 0.21]) bolts7.push([x, y]);
  const bolts6 = [[-0.285, 0.115], [0.285, 0.115], [-0.285, -0.115], [0.285, -0.115]];
  const rr = (w, h, r, n = 5) => {
    const pts = [];
    for (const [cx, cy, a0] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, 1.5 * Math.PI]]) {
      for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    }
    return pts;
  };

  // ---------------------------------------------------------------- 1 — platine en Z
  {
    const web = extrude([[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [PW / 2, PH / 2], [-PW / 2, PH / 2]], T, 'grey', {
      holes: [...Object.values(AC.ports).map(([x, y]) => [x, y, I(1.375)]), ...bolts7.map(([x, y]) => [x, y, I(0.53) / 2]), ...bolts6.map(([x, y]) => [x, y, I(0.41) / 2])],
    });
    web.position.z = -T / 2;
    const top = plate(PW, 0.06, T, 'grey');
    top.position.set(0, PH / 2 - T / 2, -T - 0.03);
    const bot = plate(PW, 0.06, T, 'grey');
    bot.position.set(0, -PH / 2 + T / 2, 0.03);
    const bends = [cyl(T, PW, 'grey', { axis: 'x', seg: 10, pos: [0, PH / 2 - T, -T] }), cyl(T, PW, 'grey', { axis: 'x', seg: 10, pos: [0, -PH / 2 + T, 0] })];
    P('1', merged([web, top, bot, ...bends], 'grey'), [0, 0, 0.12]);
  }

  // ---------------------------------------------------------------- 5 — isolant avant ; 3 — tampon arrière
  {
    const pad = extrude(rr(BL - 0.01, BH - 0.01, 0.035), G, 'rubber', { holes: Object.values(AC.ports).map(([x, y]) => [x, y, I(1.3)]) });
    pad.position.z = -T - G / 2;
    P('5', pad, [0, 0, 0.06]);
    const back = extrude(rr(BL - 0.04, BH - 0.03, 0.03), G, 'rubber');
    back.position.z = zB - G / 2;
    P('3', back, [0, 0, -0.16]);
  }

  // ---------------------------------------------------------------- 4 — échangeur à plaques brasées
  {
    const plates = [];
    const n = 18, pt = (BD - 0.016) / n;
    const cover = (z) => { const m = extrude(rr(BL, BH, 0.04), 0.008, 'steel'); m.position.z = z; return m; };
    plates.push(cover(zF - 0.004), cover(zB + 0.004));
    for (let i = 0; i < n; i++) {
      const inset = i % 2 ? 0.0012 : 0;
      const m = extrude(rr(BL - 2 * inset, BH - 2 * inset, 0.04 - inset), pt * 0.98, 'steel');
      m.position.z = zF - 0.008 - pt * (i + 0.5);
      plates.push(m);
    }
    // Piquages : collet brasé, tube et filet mâle 2 NPT jusqu'à zP ; goujons de fixation arrière.
    const nip = [];
    const Lt = AC.zP - zF - 0.014;
    for (const [x, y] of Object.values(AC.ports)) {
      nip.push(cyl(r2 * 1.25, 0.014, 'steel', { axis: 'z', seg: 28, pos: [x, y, zF + 0.007] }));
      nip.push(at(lathe([[r2 * 0.8, 0], ...S.thread(r2 * 0.94, 0, Lt, { r1: r2, pitch: I(1 / 11.5), maxTurns: 8 }).map(([r, y2]) => [r, Lt - y2]).reverse(), [r2 * 0.8, Lt], [r2 * 0.8, 0]], 'steel', { seg: 28 }), [x, y, zF + 0.014], [Math.PI / 2, 0, 0]));
    }
    // Plaque signalétique sur la couverture arrière.
    const tag = at(S.nameplate(0.08, 0.04), [0.1, 0, zB - 0.0002], [0, Math.PI, 0]);
    P('4', group(merged([...plates, ...nip], 'steel'), tag), [0, 0, -0.06]);
  }

  // ---------------------------------------------------------------- 2 — bride de serrage en U
  {
    const zW = zB - G; // face avant de l'âme de la bride
    const H = BH + 0.075;
    const web = extrude([[-BL / 2, -H / 2], [BL / 2, -H / 2], [BL / 2, H / 2], [-BL / 2, H / 2]], T, 'grey', { holes: bolts7.map(([x, y]) => [x, y, I(0.53) / 2]) });
    web.position.z = zW - T / 2;
    const fl = [1, -1].map((s) => box(BL, T, 0.03, 'grey', { pos: [0, s * (H / 2 - T / 2), zW + 0.015 - 0.0005] }));
    P('2', merged([web, ...fl], 'grey'), [0, 0, -0.26]);
  }

  // ---------------------------------------------------------------- 7, 10, 8 — vis 1/2-13 × 4, rondelles, écrous freins
  const zN = zB - G - T; // dos de la bride
  for (const [x, y] of bolts7) {
    P('7', bolt(I(0.5), I(4), 'zinc', { axis: 'z', pos: [x, y, 0] }), [0, 0, 0.3]);
    P('10', washer(I(0.53), I(0.27), I(0.097), 'zinc', { axis: 'z', pos: [x, y, zN - I(0.0485)] }), [0, 0, -0.36]);
    P('8', group(
      S.nut(I(0.75), I(0.45), 'zinc', { axis: 'z', pos: [x, y, zN - I(0.097) - I(0.225)] }),
      S.ring(I(0.36), I(0.22), I(0.14), 'blue', { axis: 'z', seg: 18, pos: [x, y, zN - I(0.097) - I(0.45) - I(0.07)] }),
    ), [0, 0, -0.42]);
  }

  // ---------------------------------------------------------------- 9, 6 — Grower et vis 3/8-16 × 2 1/4 aux coins
  for (const [x, y] of bolts6) {
    P('9', at(S.slotted(I(0.33), I(0.2), 0, I(0.094), [{ a: 0.6, w: 0.12, y0: -1, y1: 1 }], 'zinc', { seg: 18 }), [x, y, 0], [Math.PI / 2, 0, 0]), [0, 0, 0.18]);
    P('6', bolt(I(0.375), I(2.25), 'zinc', { axis: 'z', pos: [x, y, I(0.094)] }), [0, 0, 0.24]);
  }

  void box;
  return { view: { dir: [0.9, 0.5, 1.1] } };
}
