// P026 — Plaque de liaison du mât, mât HH : CX010249 rév. 1 (dessin page 26,
// liste page 27). Mécano-soudure (4) : tôle de 1 3/8 po allégée (trou central
// lamé, deux lumières trapézoïdales) entre deux barres latérales
// 1 1/2 × 2.4 po relevées en semelles de 3 po aux quatre postes de patins,
// prolongée par une queue de 1 po à deux oreilles (chapes des vérins
// d'extension d'avance, posés par P024). Chaque poste guide un rail arrière du
// mât : patin (2) de 13 po à rainure en V, plaque d'appui (6) en U à panneau
// embouti, boîtier (5) en cornière (âme de 3/4 po percée, aile supérieure de
// 1/2 po qui coiffe le patin, joues triangulaires sous l'aile aux deux bouts)
// boulonné sur la semelle par 5 vis CHC 5/8 × 1 1/2 (7) et rondelles Grower à
// collet (9), rattrapage d'usure par 2 vis de pression à tête carrée
// 3/4 × 1 3/4 (8) et contre-écrous (10).
// Oreilles : bague (1) emmanchée dans l'alésage de l'oreille (dépasse de 1/8 po
// de chaque côté), vis à épaulement 1 × 2 1/4 (3) dont l'épaulement reçoit
// joue de chape 1/2 + bague 1 1/4 + joue 1/2, écrou Nylstop 3/4 (11) dessous.
// Repère : plaque à plat comme au dessin. Origine au centre de la face d'appui
// inférieure (y = 0), sur l'axe du trou central (milieu des quatre postes) ;
// Y vers le mât (côté des boîtiers), +Z le long de la plaque vers les oreilles,
// X en travers (+X = côté arrière du dessin). Postes de patins centrés à
// z = ±0.521 m, faces intérieures des patins à x = ±0.225 m, rainures entre
// y = 0.082 et 0.140 m, dessous des ailes de boîtiers à y = 0.146 m ;
// oreilles à x = ±0.381 m, z = 0.857 m (y de 0 à 0.025), bagues de y = -0.003
// à 0.029, chape des vérins entre y = -0.016 et 0.041 (MCP.clevisGap).
// Encombrement ≈ 0.84 (X, aux oreilles) × 0.21 (Y, de -0.048 au bout des vis
// à épaulement à 0.159 au dessus des boîtiers) × 1.59 (Z) m, de z = -0.692
// à 0.898.

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes en pouces (relevées sur le dessin, échelle prise sur les patins de 13 po
// et la boulonnerie de la liste).
const T_DECK = 1.375; // tôle principale
const T_TAIL = 1.0; // queue à oreilles
const BAR_H = 2.4; // barres latérales (marche de 0.6 po au bout des semelles)
const PAD_H = 3.0; // semelles des postes de patins
const X_IN = 9.25; // face intérieure des barres
const X_OUT = 10.75; // face extérieure des barres (appui des boîtiers)
const X_HS = 11.5; // face extérieure des boîtiers
const ZS = 20.5; // centres des postes de patins (±)
const LEN_H = 13.5; // boîtier avec ses joues
const H_TOP = 5.75; // dessous de l'aile du boîtier (haut de la plaque d'appui)
const LUG = { x: 15, z: 33.75, r: 1.6 };
// Poste de patin (repère local : x vers l'intérieur depuis la face extérieure du
// boîtier, y = hauteur, z = long du patin) : vis CHC [z, y] et vis de pression.
// Le premier exemplaire porte la bulle (une seule au-delà de quatre) : vis CHC
// et vis de pression bullées sur des trous éloignés pour que leurs bulles ne se
// superposent pas dans la vue par défaut.
const SHCS = [[-5.2, 2.0], [-2.6, 0.75], [0, 2.0], [2.6, 0.75], [5.2, 2.0]];
const SET = [[3.3, 4.4], [-3.3, 4.4]];

export const MCP = {
  zEnds: [u(-27.25), u(35.35)],
  stationZ: u(ZS),
  sliderX: u(X_HS - 2.63),
  grooveY: [u(3.21), u(5.52)],
  lugX: u(LUG.x),
  lugZ: u(LUG.z),
  lugTop: u(T_TAIL),
  bushingY: [u(-0.125), u(1.125)],
  // jeu entre les joues de la chape du vérin : dessus de l'écrou → dessous de la tête
  clevisGap: [u(-0.625), u(1.625)],
};

// Arc (po) de a0 à a1 (degrés), points [x, z] inclus.
function arc(cx, cz, r, a0, a1, n = 8) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
}

// Polygone [x, z] à coins arrondis (rayon par sommet, 0 = vif).
function roundPoly(pts, radii, n = 6) {
  const out = [];
  const N = pts.length;
  pts.forEach((P, i) => {
    const r = Array.isArray(radii) ? radii[i] : radii;
    if (!r) { out.push(P); return; }
    const A = pts[(i + N - 1) % N], B = pts[(i + 1) % N];
    const ul = Math.hypot(A[0] - P[0], A[1] - P[1]), vl = Math.hypot(B[0] - P[0], B[1] - P[1]);
    const ux = (A[0] - P[0]) / ul, uz = (A[1] - P[1]) / ul, vx = (B[0] - P[0]) / vl, vz = (B[1] - P[1]) / vl;
    const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uz * vz))) / 2;
    const d = r / Math.tan(half), k = r / Math.sin(half);
    const bl = Math.hypot(ux + vx, uz + vz);
    const C = [P[0] + ((ux + vx) / bl) * k, P[1] + ((uz + vz) / bl) * k];
    const a1 = Math.atan2(P[1] + uz * d - C[1], P[0] + ux * d - C[0]);
    let da = Math.atan2(P[1] + vz * d - C[1], P[0] + vx * d - C[0]) - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let j = 0; j <= n; j++) out.push([C[0] + r * Math.cos(a1 + (da * j) / n), C[1] + r * Math.sin(a1 + (da * j) / n)]);
  });
  return out;
}

const circle = (cx, cz, r, n) => arc(cx, cz, r, 0, 360 - 360 / n, n - 1);

// Contour fermé [[x, y], …] décalé de d vers l'intérieur (d < 0 : vers
// l'extérieur), sommets en onglet ; les points confondus sont retirés.
function inset(pts, d) {
  const P = pts.filter((p, i) => {
    const q = pts[(i + pts.length - 1) % pts.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9;
  });
  const n = P.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1];
  const s = Math.sign(area) * d; // sens trigo : l'intérieur est à gauche de chaque côté
  return P.map((p, i) => {
    const a = P[(i + n - 1) % n], b = P[(i + 1) % n];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const n1 = [-(p[1] - a[1]) / l1, (p[0] - a[0]) / l1], n2 = [-(b[1] - p[1]) / l2, (b[0] - p[0]) / l2];
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const c = Math.max(0.2, (mx * n1[0] + my * n1[1]) / ml);
    return [p[0] + ((mx / ml) * s) / c, p[1] + ((my / ml) * s) / c];
  });
}

export default function P026(api) {
  const { THREE, S } = api;
  const { box, extrude, lathe, thread, weld, merged, creaseNormals, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Prisme (m) d'un contour [x, y] percé de trous, épaisseur selon +Z de 0 à
  // depth, arêtes cassées de mb. Le contour est d'abord rentré de mb (trous
  // agrandis) puis biseauté vers l'extérieur avec un décalage nul : les faces
  // sont triangulées sur leurs propres sommets, sans les longs traits parasites
  // qu'un biseau à décalage négatif laisse en mode « Contours ».
  const prism = (outline, holes, depth, mb) => {
    const v = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
    const shape = new THREE.Shape(v(inset(outline, mb)));
    holes.forEach((h) => shape.holes.push(new THREE.Path(v(inset(h, -mb)))));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: 0, bevelSegments: 1,
    });
    geo.translate(0, 0, mb);
    return creaseNormals(geo);
  };
  const ring = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)]);

  // Tôle à plat (contour et lumières [x, z] en po), épaisseur t selon +Y depuis y = 0,
  // arêtes cassées d'environ 1,5 mm comme une tôle oxycoupée ébavurée.
  const slab = (outline, holes, t, material) => {
    const v = ([x, z]) => [u(x), -u(z)];
    const geo = prism(outline.map(v), holes.map((h) => h.map(v)), u(t), 0.0015);
    geo.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(geo)], material);
  };

  // Plaque w × d × t (m) centrée, épaisseur selon Y, percée de trous ronds
  // [x, z, r] et de découpes [x, z, largeur, longueur] (conventions de S.plate).
  const holedPlate = (w, d, t, material, { holes = [], cutouts = [] } = {}) => {
    const hs = [
      ...holes.map(([x, z, r]) => ring(x, -z, r, 20)),
      ...cutouts.map(([x, z, cw, cd]) => [[x - cw / 2, -z - cd / 2], [x + cw / 2, -z - cd / 2], [x + cw / 2, -z + cd / 2], [x - cw / 2, -z + cd / 2]]),
    ];
    const geo = prism([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], hs, t, Math.min(t * 0.16, 0.0016));
    geo.translate(0, 0, -t / 2);
    geo.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(geo)], material);
  };

  // Vis à tête cylindrique et six-pans creux, tête vers +Y (y de 0 à hh), corps
  // (profil de révolution sous y = 0) vers -Y. Cotes en mètres.
  const capScrew = (R, hh, hexAF, body, material, seg = 14) => {
    const rh = hexAF / 2 / Math.cos(Math.PI / 6);
    const hex = ring(0, 0, rh, 6);
    const b = Math.min(R * 0.1, hh * 0.12);
    const g1 = prism(ring(0, 0, R, 2 * seg), [hex], hh, b);
    g1.rotateX(-Math.PI / 2);
    // fond de l'empreinte
    const g2 = new THREE.ExtrudeGeometry(new THREE.Shape(hex.map(([x, y]) => new THREE.Vector2(x, y))), { depth: hh * 0.45, bevelEnabled: false });
    g2.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(g1), new THREE.Mesh(g2), lathe(body, material, { seg: 12 })], material);
  };

  // Poste de patin : objet construit dans le repère local du poste (x vers
  // l'intérieur depuis la face extérieure du boîtier), placé côté avant (-X)
  // ou arrière (+X, retourné d'un demi-tour) au centre zc.
  const station = (obj, side, zc) => {
    const g = group(obj);
    g.position.set(side * u(X_HS), 0, u(zc));
    if (side > 0) g.rotation.y = Math.PI;
    return g;
  };
  const posts = [[-1, -ZS], [1, -ZS], [-1, ZS], [1, ZS]];

  // ------------------------------------------------ 4 — mécano-soudure
  // Tôle principale entre les barres : bout côté -Z en retrait (congés vers les
  // barres), bout côté queue en arc de 3 1/4 po rejoignant les barres. Les
  // pointes où les arcs deviennent tangents aux barres sont arasées à 0.3 po de
  // large (Z_CUT), comme une tôle oxycoupée (et sans contour en rebroussement).
  const Z_CUT = [-24.85 + 1.5 * 0.6, 26 - 3.25 * Math.sin((25 * Math.PI) / 180)];
  const deck = [
    [-X_IN, Z_CUT[0]],
    ...arc(-7.75, -24.85, 1.5, 143.13, 90, 5),
    ...arc(7.75, -24.85, 1.5, 90, 36.87, 5),
    [X_IN, Z_CUT[0]], [X_IN, Z_CUT[1]],
    ...arc(6, 26, 3.25, -25, -90, 9),
    ...arc(-6, 26, 3.25, -90, -155, 9),
    [-X_IN, Z_CUT[1]],
  ];
  const deckHoles = [
    circle(0, 0, 3.77, 48), // paroi du lamage (Ø 7.54)
    roundPoly([[-6.4, -18.75], [6.4, -18.75], [3.8, -12], [-3.8, -12]], 1.25),
    roundPoly([[-3.8, 12], [3.8, 12], [6.4, 18.75], [-6.4, 18.75]], 1.25),
  ];
  // Queue à oreilles : épouse le bout de la tôle principale et des barres, côtés
  // évasés puis congés concaves vers les oreilles (Ø 3.2 po, alésage Ø 1.52 de
  // la bague).
  const tail = [
    [X_IN, 27.25], [X_OUT, 27.25], [11.6, 28.9], [12.2, 30.3], [12.75, 31.4], [13.45, 32.0],
    ...arc(LUG.x, LUG.z, LUG.r, -118, 90, 14),
    ...arc(-LUG.x, LUG.z, LUG.r, 90, 298, 14),
    [-13.45, 32.0], [-12.75, 31.4], [-12.2, 30.3], [-11.6, 28.9], [-X_OUT, 27.25], [-X_IN, 27.25],
    [-X_IN, Z_CUT[1]],
    ...arc(-6, 26, 3.25, 205, 270, 9),
    ...arc(6, 26, 3.25, 270, 335, 9),
    [X_IN, Z_CUT[1]],
  ];
  const tailHoles = [
    circle(LUG.x, LUG.z, 0.76, 28),
    circle(-LUG.x, LUG.z, 0.76, 28),
    roundPoly([[-5, 26], [5, 26], [6.4, 30.6], [0, 32], [-6.4, 30.6]], [1.4, 1.4, 1.6, 6, 1.6]),
  ];
  // Semelle d'un poste : face extérieure taraudée (trous borgnes des vis CHC,
  // au diamètre du filet plus un jeu : la tige reste visible en coupe).
  const pad = () => group(
    at(holedPlate(u(PAD_H), u(LEN_H), u(0.6), 'grey', { holes: SHCS.map(([s, y]) => [u(y - PAD_H / 2), u(s), u(0.33)]) }),
      [u(1.05), u(PAD_H / 2), 0], [0, 0, Math.PI / 2]),
    box(u(0.9), u(PAD_H), u(LEN_H), 'grey', { pos: [u(1.8), u(PAD_H / 2), 0] }),
  );
  const steel = merged([
    slab(deck, deckHoles, T_DECK, 'grey'),
    slab(tail, tailHoles, T_TAIL, 'grey'),
    // lamage du trou central : paroi Ø 7.54 sur 0.4 po (alésage de la tôle),
    // petit chanfrein jusqu'à Ø 7.3 à 0.5 po de profondeur, fond plat, alésage Ø 6.6
    lathe([[3.3, 0], [3.79, 0], [3.79, T_DECK - 0.38], [3.65, T_DECK - 0.5], [3.3, T_DECK - 0.5], [3.3, 0]].map(([r, y]) => [u(r), u(y)]), 'grey', { seg: 48 }),
    // barres latérales entre les postes
    ...[-1, 1].map((s) => box(u(X_OUT - X_IN), u(BAR_H), u(2 * ZS - LEN_H), 'grey', { pos: [s * u((X_IN + X_OUT) / 2), u(BAR_H / 2), 0] })),
    ...posts.map(([s, z]) => station(pad(), s, z)),
  ], 'grey');
  // Cordons : tôle / barres (bornés sur la longueur de la tôle à x = ±X_IN),
  // bout de tôle et bouts de barres sur la queue. Le joint barre / plat des
  // postes (trait du dessin sur la face d'appui des boîtiers) est arasé sous
  // l'âme du boîtier : pas de cordon en relief.
  const seam = [[-X_IN, Z_CUT[1]], ...arc(-6, 26, 3.25, 205, 270, 8), ...arc(6, 26, 3.25, 270, 335, 8), [X_IN, Z_CUT[1]]];
  const welds = merged([
    ...[-1, 1].map((s) => weld([[s * u(X_IN), u(T_DECK), u(Z_CUT[0] + 0.15)], [s * u(X_IN), u(T_DECK), u(Z_CUT[1] - 0.15)]], u(0.3), 'grey')),
    weld(seam.map(([x, z]) => [u(x), u(T_TAIL), u(z)]), u(0.3), 'grey'),
    ...[-1, 1].map((s) => weld([[s * u(X_IN + 0.1), u(T_TAIL), u(27.25)], [s * u(X_OUT - 0.1), u(T_TAIL), u(27.25)]], u(0.25), 'grey')),
  ], 'grey');
  welds.geometry.userData.edgeAngle = 75;
  P('4', group(steel, welds), [0, 0, 0]);

  // ------------------------------------------------ postes de patins
  const holes5 = [
    ...SHCS.map(([s, y]) => [u(y - 3.125), u(s), u(0.34)]),
    ...SET.map(([s, y]) => [u(y - 3.125), u(s), u(0.39)]),
  ];
  // 5 — boîtier en cornière : âme de 3/4 po percée (x 0 → 0.75), aile
  // supérieure de 1/2 po sur toute la longueur (x 0.75 → 2.6, y 5.75 → 6.25),
  // joues triangulaires de 1/4 po sous l'aile aux deux bouts.
  const housing = () => {
    const tri = [[0.75, H_TOP], [2.55, H_TOP], [0.75, 3.4]].map(([x, y]) => [u(x), u(y)]);
    const w = merged([
      weld([[u(0.75), u(H_TOP), -u(LEN_H / 2 - 0.25)], [u(0.75), u(H_TOP), u(LEN_H / 2 - 0.25)]], u(0.18), 'grey'),
      ...[-1, 1].map((k) => weld([[u(0.75), u(3.6), k * u(LEN_H / 2 - 0.25)], [u(0.75), u(5.6), k * u(LEN_H / 2 - 0.25)]], u(0.18), 'grey')),
    ], 'grey');
    w.geometry.userData.edgeAngle = 75;
    return group(
      merged([
        at(holedPlate(u(6.25), u(LEN_H), u(0.75), 'grey', { holes: holes5 }), [u(0.375), u(3.125), 0], [0, 0, Math.PI / 2]),
        box(u(1.85), u(0.5), u(LEN_H), 'grey', { pos: [u(1.675), u(H_TOP + 0.25), 0] }),
        ...[-1, 1].map((k) => at(extrude(tri, u(0.25), 'grey'), [0, 0, k * u(LEN_H / 2 - 0.125)])),
      ], 'grey'),
      w,
    );
  };
  // 6 — plaque d'appui : U de 1/8 po (y 3.0 → 5.75, ailes de 1 po, plis
  // arrondis), âme à panneau embouti (appui des vis de pression).
  const BK = { y0: PAD_H, y1: H_TOP, x0: 0.75, t: 0.13, x1: 1.75, r: 0.2 };
  const backing = () => {
    const { y0, y1, x0, t, x1, r } = BK;
    // aile et pli : profil [x, y] (po) de l'aile du bas, retourné pour celle du haut
    const bend = (k) => {
      const yb = k > 0 ? y0 : y1, s = k; // s : sens vers l'intérieur du U
      const pts = [];
      for (let i = 0; i <= 6; i++) { const a = (Math.PI / 2) * (i / 6); pts.push([x0 + r - r * Math.cos(a), yb + s * (r - r * Math.sin(a))]); }
      pts.push([x1, yb], [x1, yb + s * t]);
      for (let i = 6; i >= 0; i--) { const a = (Math.PI / 2) * (i / 6); pts.push([x0 + r - (r - t) * Math.cos(a), yb + s * (r - (r - t) * Math.sin(a))]); }
      const g = prism(pts.map(([x, y]) => [u(x), u(y)]), [], u(13), 0.0005);
      g.translate(0, 0, -u(6.5));
      return new THREE.Mesh(g);
    };
    const hWeb = y1 - y0 - 2 * r;
    return merged([
      at(holedPlate(u(hWeb), u(13), u(t), 'zinc', { cutouts: [[0, 0, u(1.9), u(11.5)]] }), [u(x0 + t / 2), u((y0 + y1) / 2), 0], [0, 0, Math.PI / 2]),
      box(u(0.08), u(1.9), u(11.5), 'zinc', { pos: [u(x0 + t - 0.04), u((y0 + y1) / 2), 0] }),
      bend(1), bend(-1),
    ], 'zinc');
  };
  // 2 — patin 13 po (polyéthylène, ≈ 2 1/2 po de haut entre les ailes du U) :
  // rainure en V à deux flancs, dégagement 0.38 × 0.43 po au fond (flanc bas
  // ≈ 48° jusqu'à l'arête basse intérieure, flanc haut jusqu'à l'arête haute) ;
  // angles chanfreinés côté U et aux deux arêtes intérieures.
  const slider = () => extrude([
    [0.96, 3.13], [2.55, 3.13], [2.63, 3.21], [1.88, 4.05], [1.50, 4.05], [1.50, 4.48], [1.88, 4.48],
    [2.63, 5.52], [2.63, 5.54], [2.55, 5.62], [0.96, 5.62], [0.88, 5.54], [0.88, 3.21],
  ].map(([x, y]) => [u(x), u(y)]), u(13), 'cream');
  // 7 — vis CHC 5/8-11 × 1 1/2 brunie (tête Ø 15/16, six-pans 1/2), tête à 12 segments
  const shcs = () => capScrew(u(0.469), u(0.625), u(0.5),
    [[0, -u(1.5)], ...thread(u(0.3125), -u(1.5), -u(0.1), { pitch: u(0.1), maxTurns: 8 }), [u(0.3125), 0], [0, 0]], 'blackOxide', 6);
  // 9 — rondelle Grower à collet 5/8 (fendue)
  const lockWasher = () => {
    const ro = u(0.44), ri = u(0.32), gap = 0.2, n = 12;
    const a = (i) => gap / 2 + ((2 * Math.PI - gap) * i) / n;
    const pts = [
      ...Array.from({ length: n + 1 }, (_, i) => [ro * Math.cos(a(i)), ro * Math.sin(a(i))]),
      ...Array.from({ length: n + 1 }, (_, i) => [ri * Math.cos(a(n - i)), ri * Math.sin(a(n - i))]),
    ];
    const g = prism(pts, [], u(0.2), 0.0008);
    g.translate(0, 0, -u(0.1));
    return merged([new THREE.Mesh(g)], 'darkSteel');
  };
  // 8 — vis de pression 3/4-10 × 1 3/4 à tête carrée (plat 3/4), bout cuvette
  const sqss = () => merged([
    at(lathe([[0, 0], [u(0.53), 0], [u(0.53), u(0.4)], [u(0.38), u(0.5625)], [0, u(0.5625)]], 'darkSteel', { seg: 4 }), [0, 0, 0], [0, Math.PI / 4, 0]),
    lathe([[0, -u(1.67)], [u(0.2), -u(1.75)], ...thread(u(0.375), -u(1.75), 0, { pitch: u(0.1), maxTurns: 10 }), [0, 0]], 'darkSteel', { seg: 10 }),
  ], 'darkSteel');
  // 10, 11 — six-pans 3/4 (plat 1 1/8) de hauteur h, de y = 0 à h, percé au
  // rayon du filet plus un jeu (Ø 0.77) : la vis reste visible en coupe ;
  // plats dessus / dessous.
  const hexNut = (h) => {
    const R = u(1.125) / Math.sqrt(3);
    const hex = Array.from({ length: 6 }, (_, i) => [R * Math.cos(Math.PI / 6 + (i * Math.PI) / 3), R * Math.sin(Math.PI / 6 + (i * Math.PI) / 3)]);
    const g = prism(hex, [ring(0, 0, u(0.385), 20)], u(h), 0.0008);
    g.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(g)], 'zinc');
  };

  // Éclaté : patin, plaque d'appui et boîtier sortent vers l'extérieur ; la
  // boulonnerie s'étage dans l'axe de ses trous (rondelles, contre-écrous, vis
  // CHC, vis de pression) pour que les bulles ne se chevauchent pas.
  const toX = [0, 0, Math.PI / 2]; // axe Y de la pièce → -x local (tête vers l'extérieur)
  for (const [side, zc] of posts) {
    const out = (d) => [side * d, 0, 0];
    P('2', station(slider(), side, zc), out(0.1));
    P('6', station(backing(), side, zc), out(0.17));
    P('5', station(housing(), side, zc), out(0.25));
    for (const [s, y] of SHCS) {
      P('9', station(at(lockWasher(), [u(-0.1), u(y), u(s)], [0, Math.PI / 2, 0]), side, zc), out(0.30));
      P('7', station(at(shcs(), [u(-0.2), u(y), u(s)], toX), side, zc), out(0.42));
    }
    for (const [s, y] of SET) {
      // contre-écrou contre l'âme du boîtier, de x = 0 à -0.42 po
      P('10', station(at(hexNut(0.42), [0, u(y), u(s)], toX), side, zc), out(0.36));
      P('8', station(at(sqss(), [u(-0.95), u(y), u(s)], toX), side, zc), out(0.50));
    }
  }

  // ------------------------------------------------ oreilles des vérins
  // Empilage sur l'axe : écrou | joue basse de la chape (1/2) | bague dans
  // l'oreille (1 1/4, oreille de 1 po) | joue haute (1/2) | tête de vis.
  for (const s of [-1, 1]) {
    const x = s * u(LUG.x), z = u(LUG.z);
    // 1 — bague Ø 1 1/2 × 1 1/4, centrée dans l'oreille (dépasse de 1/8 po de chaque côté)
    P('1', lathe([[0.51, 0.03], [0.54, 0], [0.69, 0], [0.75, 0.06], [0.75, 1.19], [0.69, 1.25], [0.54, 1.25], [0.51, 1.22], [0.51, 0.03]].map(([r, y]) => [u(r), u(y)]),
      'steel', { seg: 28, pos: [x, u(-0.125), z] }), [0, 0.2, 0]);
    // 3 — vis à épaulement Ø 1 × 2 1/4, filet 3/4-10 (tête Ø 1 1/2, six-pans 1/2) ;
    // dessous de tête à 1/2 po au-dessus de la bague (joue haute de la chape)
    P('3', at(capScrew(u(0.75), u(0.75), u(0.5), [
      [0, -u(3.5)], ...thread(u(0.375), -u(3.5), -u(2.4), { pitch: u(0.1), maxTurns: 8 }),
      [u(0.33), -u(2.37)], [u(0.33), -u(2.3)], [u(0.47), -u(2.25)], [u(0.5), -u(2.22)], [u(0.5), -u(0.03)], [u(0.53), 0], [0, 0],
    ], 'blackOxide', 20), [x, u(1.625), z]), [0, 0.32, 0]);
    // 11 — écrou Nylstop 3/4-10 en bout d'épaulement, 1/2 po sous la bague
    // (joue basse de la chape), bague nylon apparente
    P('11', at(group(
      merged([
        at(hexNut(0.56), [0, -u(0.56), 0]), // y = -0.625 à -1.185 po
        lathe([[0.44, -0.8], [0.47, -0.81], [0.51, -0.77], [0.53, -0.56], [0.44, -0.56], [0.44, -0.8]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 24 }),
      ], 'zinc'),
      lathe([[0.375, -0.795], [0.44, -0.795], [0.44, -0.6], [0.375, -0.6], [0.375, -0.795]].map(([r, y]) => [u(r), u(y)]), 'cream', { seg: 24 }),
    ), [x, u(-0.625), z]), [0, -0.14, 0]);
  }

  return { view: { dir: [-1.05, 1, 1] } };
}
