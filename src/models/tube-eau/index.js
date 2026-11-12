// Tube à l'eau 1524010812 (Machines Roger International) : bac à eau ouvert,
// assemblage soudé en tôle de 3/16 po, d'après le plan du 2024-01-02 (une page,
// échelle 1:15 ; coupe A-A et détail B à l'échelle 1:2).
// Cotes du plan : 45 3/8 × 35 1/4 po, 33 15/16 po de haut, pieds à 3 po des
// bouts, traverse à 6 po du rebord du bout droit, raccords de 1 po qui
// dépassent de 3/4 po. Ce que le plan ne cote pas (épaisseur, plis, rebords,
// traverse, ajours, position des raccords) est relevé sur son tracé vectoriel.
// Flotte 152042600 « FLOTTE STM-1500 TOBE A L'EAU » (plan du 2022-04-26) : le
// plan n'a qu'une vue en perspective dimétrique, sans cote ; ses dimensions sont
// relevées sur cette image, à l'échelle 1:3 que donnent les têtes des boulons
// de 3/8 po (le cartouche inscrit 1:8, échelle de la feuille).
// Contrôle : scripts/check-tube-eau.mjs.
// Repère : X le long du bac (0 à la face extérieure du bout gauche, celui des
// raccords de 1 po ; modèle centré), Y vers le haut (0 sous les pieds), Z en
// travers (+Z vers l'avant de la vue de face du plan).

const IN = 0.0254;

export const T = 3 / 16; // épaisseur de toutes les tôles (détail B)
export const RI = 3 / 16; // rayon intérieur des plis (rayon extérieur de 3/8 po)
export const L = 45.375, D = 35.25; // hors tout du bac (cotes du plan)
export const PIED = { w: 8, h: 3.75, x: [3, 34.375] }; // pieds en U (plaque 6), à 3 po des bouts
export const HB = 33.9375 - PIED.h; // hauteur du bac seul : 30 3/16 po
// Rebord du haut des plaques 1, 2 et 3 : replié de 2 3/16 po vers l'intérieur,
// puis retombée de 1 3/16 po (détail B).
export const REBORD = { w: 2.1875, h: 1.1875 };
// Traverse en oméga (plaque 4) : U de 15 7/16 po ouvert vers le haut, 2 3/16 po
// de creux, ailes de 1 po à plat au niveau du dessus du bac ; son aile droite
// est à 6 po de la retombée du bout droit (cote du plan).
export const TRAV = { w: 17.4375, creux: 2.1875, aile: 1, x1: L - REBORD.w - 6 };
TRAV.xc = TRAV.x1 - TRAV.w / 2;
// Ajours du fond de la traverse : croix de bandes de 1 po dans un rectangle de
// 12 3/16 × 24 7/8 po, bande du milieu de 1 po, coins de 1/4 po ; six trous de
// Ø 2 po au pas de 5 po, à 2 11/16 po des faces du bac.
export const AJOUR = { a: 6.09375, b: 12.4375, bande: 1, r: 0.25, trou: { d: 2, pas: 5, bord: 2.6875 } };
// Barres (plaque 5) : plat de 1 × 3/16 po à bouts ronds, trous de 5/16 po.
export const BARRE = { len: 17.375, w: 1, z: [7.5625, D - 7.5625], trou: { d: 5 / 16, bout: 0.375 } };
// Demi-manchons 1 po FNPT (12641) sur le bout gauche : Ø 1 1/2 po, 3/4 po de saillie.
export const MANCHON = { od: 1.5, id: 1.15, len: 0.75, z: [26.5625, 31.5625], sousHaut: 4 };
// Brides à souder 2 po NPT (0700200), une par bout : Ø 3 11/16 po, 5/16 po de saillie.
export const BRIDE = { od: 3.6875, id: 2.23, len: 0.3125, trou: 2.5, z: 2.6875, y: 1.6875 };

// Flotte 152042605 : cylindre de Ø 6 × 12 po entre deux joues de 1/8 po en goutte
// (cercle de Ø 6 1/4 po et arrondi de 1 po autour du bras), bras en tube carré de
// 1 po × 20 po dont l'axe est à 4 po de celui du cylindre (2 1/2 et 3 1/8 po
// selon ses faces). Repère de la pièce : X et Y selon les faces du bras, Z le
// long de l'axe (0 à la face avant, côté capuchon ; le bras sort vers −Z).
export const FLOTTE = {
  cyl: { d: 6, len: 12, t: 0.06 }, // tôle de calibre 16 (d'après la masse du cartouche)
  joue: { d: 6.25, t: 1 / 8, r: 1 },
  bras: { w: 1, t: 1 / 8, r: 1 / 8, len: 20, x: 2.5, y: 3.125, avant: 1 / 8 },
  boulon: { d: 3 / 8, len: 1.25, bout: [0.625, 2.5] }, // depuis le bout du bras
  capuchon: { af: 9 / 16, len: 0.9 },
};
// Pose de la flotte dans le bac (aucun des deux plans ne la donne) : bras à l'horizontale à
// la hauteur et vis-à-vis du premier raccord de 1 po, boulons à l'horizontale, bout du bras
// à 3 po du bout gauche.
export const POSE_FLOTTE = { bout: 3, z: 26.5625 };

const SOUDURE = 3 / 16; // symboles du plan (typique)
const PEINT = 'black'; // peinture du bac et du corps de la flotte (demande du client)

/** Marque un cordon de soudure (hors cotes et hors masse dans scripts/check-tube-eau.mjs). */
function cordon(obj) {
  obj.traverse((o) => { o.userData.soudure = true; });
  return obj;
}

const m = (pts) => pts.map(([x, y]) => [x * IN, y * IN]);

/** Arc de cercle en points [x, y], de l'angle a0 à a1 (degrés). */
function arc(cx, cy, r, a0, a1, n = 6) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * Profil d'une tôle pliée : fibre moyenne en sommets vifs [x, y] ; chaque pli
 * est arrondi au rayon intérieur ri, la tôle garde son épaisseur t partout.
 */
function profilTole(P, t = T, ri = RI, n = 8) {
  const rm = ri + t / 2;
  const g = [], d = [];
  const pousse = (x, y, nx, ny) => {
    g.push([x + (nx * t) / 2, y + (ny * t) / 2]);
    d.push([x - (nx * t) / 2, y - (ny * t) / 2]);
  };
  const unite = (a, b) => { const x = b[0] - a[0], y = b[1] - a[1], l = Math.hypot(x, y); return [x / l, y / l]; };
  const dernier = P.length - 1;
  for (let i = 0; i <= dernier; i++) {
    const p = P[i];
    if (i === 0 || i === dernier) {
      const u = i === 0 ? unite(p, P[1]) : unite(P[i - 1], p);
      pousse(p[0], p[1], -u[1], u[0]);
      continue;
    }
    const u1 = unite(P[i - 1], p), u2 = unite(p, P[i + 1]);
    const s = Math.sign(u1[0] * u2[1] - u1[1] * u2[0]);
    const ang = Math.acos(Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]));
    const dt = rm * Math.tan(ang / 2);
    const cx = p[0] - u1[0] * dt - s * u1[1] * rm, cy = p[1] - u1[1] * dt + s * u1[0] * rm;
    for (let k = 0; k <= n; k++) {
      const a = (s * ang * k) / n, c = Math.cos(a), si = Math.sin(a);
      const nx = -(u1[0] * si + u1[1] * c), ny = u1[0] * c - u1[1] * si; // normale à gauche
      pousse(cx - s * nx * rm, cy - s * ny * rm, nx, ny);
    }
  }
  // Points confondus (pli qui commence au bout du profil) retirés.
  const out = [];
  for (const q of [...g, ...d.reverse()]) {
    const o = out[out.length - 1];
    if (!o || Math.hypot(q[0] - o[0], q[1] - o[1]) > 1e-6) out.push(q);
  }
  return out;
}

/** Polygone aux coins arrondis au rayon r (sommets vifs [x, y] en entrée). */
function coinsRonds(P, r, n = 6) {
  const out = [];
  const N = P.length;
  for (let i = 0; i < N; i++) {
    const a = P[(i + N - 1) % N], p = P[i], b = P[(i + 1) % N];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const u1 = [(p[0] - a[0]) / l1, (p[1] - a[1]) / l1], u2 = [(b[0] - p[0]) / l2, (b[1] - p[1]) / l2];
    const s = Math.sign(u1[0] * u2[1] - u1[1] * u2[0]);
    const ang = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const dt = r * Math.tan(ang / 2);
    const cx = p[0] - u1[0] * dt - s * u1[1] * r, cy = p[1] - u1[1] * dt + s * u1[0] * r;
    for (let k = 0; k <= n; k++) {
      const t = (s * ang * k) / n, c = Math.cos(t), si = Math.sin(t);
      const nx = -(u1[0] * si + u1[1] * c), ny = u1[0] * c - u1[1] * si;
      out.push([cx - s * nx * r, cy - s * ny * r]);
    }
  }
  return out;
}

/** Profil [x, y] extrudé le long de Z, de z0 à z1 (pouces). bord : arêtes cassées (false aux raccords entre morceaux). */
function selonZ(S, profil, z0, z1, material, { holes = [], bord = true } = {}) {
  const p = S.extrude(m(profil), (z1 - z0) * IN, material, { holes, center: false, bevel: bord ? 0 : 1e-5 });
  p.position.z = z0 * IN;
  return p;
}

/** Profil [z, y] extrudé le long de X, de x0 à x1 (pouces). */
function selonX(S, profil, x0, x1, material, { holes = [], bord = true } = {}) {
  const miroir = (pts) => pts.map(([z, y]) => [-z, y]);
  const trous = holes.map((h) => (Array.isArray(h[0]) ? miroir(h) : [-h[0], h[1], h[2]]));
  const p = S.extrude(m(miroir(profil)), (x1 - x0) * IN, material, {
    holes: trous.map((h) => (Array.isArray(h[0]) ? m(h) : h.map((v) => v * IN))), center: false, bevel: bord ? 0 : 1e-5,
  });
  p.rotation.y = Math.PI / 2;
  p.position.x = x0 * IN;
  return p;
}

/** Profil [x, z] à plat, épaisseur vers le haut de y0 à y1 (pouces). */
function aPlat(S, profil, y0, y1, material, { holes = [], bord = true } = {}) {
  const trous = holes.map((h) => (Array.isArray(h[0]) ? m(h) : h.map((v) => v * IN)));
  const p = S.extrude(m(profil), (y1 - y0) * IN, material, { holes: trous, center: false, bevel: bord ? 0 : 1e-5 });
  p.rotation.x = Math.PI / 2; // profil dans le plan XZ, épaisseur vers le bas
  p.position.y = y1 * IN;
  return p;
}

/**
 * Plaque 1 (1524010806) : fond et deux grandes faces d'un seul pli en U, rebord
 * du haut replié vers l'intérieur avec retombée. 45 po de long, entre les bouts.
 */
function plaque1(S, material) {
  const h = T / 2, r = REBORD;
  const profil = profilTole([
    [r.w - h, HB - r.h], [r.w - h, HB - h], [h, HB - h], [h, h],
    [D - h, h], [D - h, HB - h], [D - r.w + h, HB - h], [D - r.w + h, HB - r.h],
  ]);
  return S.group(selonX(S, profil, T, L - T, material));
}

/**
 * Bout du bac (plaque 2 à droite, plaque 3 à gauche) : tôle à plat découpée au
 * profil intérieur de la plaque 1 (joint d'angle ouvert), oreilles qui ferment
 * les rebords de la plaque 1, rebord du haut replié vers l'intérieur. Construit
 * pour le bout gauche (face extérieure à X = 0) ; trous ronds [z, y, r].
 */
function bout(S, material, trous) {
  const yo = HB - T, yp = HB - T - RI, yf = HB - 2 * RI; // dessus des oreilles, centre de leurs arrondis, ligne de pli
  const zo = 2.125, ze = 1 / 16, yn = HB - 0.4375; // bout de l'oreille, dégagement de pli
  const contour = [
    ...arc(T + RI, T + RI, RI, 180, 270),
    ...arc(D - T - RI, T + RI, RI, 270, 360),
    ...arc(D - T - RI, yp, RI, 0, 90),
    ...arc(D - zo + RI, yp, RI, 90, 180),
    [D - zo, yn], [D - zo - ze, yn], [D - zo - ze, yf],
    [zo + ze, yf], [zo + ze, yn], [zo, yn],
    ...arc(zo - RI, yp, RI, 0, 90),
    ...arc(T + RI, yp, RI, 90, 180),
  ];
  const g = S.group(selonX(S, contour, 0, T, material, { holes: trous }));
  // Rebord : pli de 3/8 po de rayon extérieur, 2 3/16 po de large, retombée de 1 3/16 po.
  const h = T / 2;
  const pli = profilTole([[h, yf], [h, HB - h], [REBORD.w - h, HB - h], [REBORD.w - h, HB - REBORD.h]]);
  g.add(selonZ(S, pli, zo + ze, D - zo - ze, material, { bord: false }));
  return g;
}

/** Cordons du joint d'angle ouvert d'un bout : le long des deux faces et du fond de la plaque 1. */
function cordonsBout(S, material) {
  const e = T * 0.45, r = 0.375;
  const pts = [
    [e, HB - 0.5, e],
    ...arc(r + e, r + e, r, 180, 270, 5).map(([z, y]) => [e, y, z]),
    ...arc(D - r - e, r + e, r, 270, 360, 5).map(([z, y]) => [e, y, z]),
    [e, HB - 0.5, D - e],
  ].map(([x, y, z]) => [x * IN, y * IN, z * IN]);
  return cordon(S.weld(pts, SOUDURE * 1.3 * IN, material));
}

/** Pied (plaque 6) : U de 8 × 3 3/4 po ouvert vers le haut, sur toute la profondeur du bac. */
function pied(S, material) {
  const h = T / 2;
  const profil = profilTole([[h, PIED.h], [h, h], [PIED.w - h, h], [PIED.w - h, PIED.h]]);
  const g = S.group(selonZ(S, profil, 0, D, material));
  // Soudure d'angle de 3/16 po, des deux côtés de chaque aile (symbole du plan).
  for (const x of [0, T, PIED.w - T, PIED.w]) {
    const s = x === 0 || x === PIED.w - T ? -1 : 1;
    const px = (x + s * SOUDURE * 0.3) * IN, py = (PIED.h - SOUDURE * 0.3) * IN;
    g.add(cordon(S.weld([[px, py, 0.4 * IN], [px, py, (D - 0.4) * IN]], SOUDURE * IN, material)));
  }
  return g;
}

/** Les six ajours triangulaires du fond de la traverse, autour de son centre [x, z]. */
function ajours() {
  const { a, b, bande, r } = AJOUR;
  const h = Math.hypot(a, b), k = bande / 2;
  const pointe = (k * h) / a, base = a - (k * h) / b; // sommets vifs le long de l'axe et de la base
  const cote = (a * k) / b + (k * h) / b; // bout de l'ajour de côté, le long de la bande du milieu
  const out = [];
  for (const s of [-1, 1]) {
    out.push(coinsRonds([[-base, s * b], [base, s * b], [0, s * pointe]], r));
    for (const e of [-1, 1]) out.push(coinsRonds([[e * a, s * k], [e * cote, s * k], [e * a, s * (b - pointe)]], r));
  }
  return out;
}

/**
 * Traverse (plaque 4) : oméga ouvert vers le haut, fond ajouré. Ses ailes
 * s'arrêtent aux retombées de la plaque 1 ; ses flancs se prolongent en pattes
 * arrondies (coins de 1/4 po) qui entrent sous les rebords, jusqu'aux faces du
 * bac (détail B) : on la glisse en place avant de souder la plaque 2.
 */
function traverse(S, material) {
  const h = T / 2, r = REBORD;
  const xa = TRAV.xc - TRAV.w / 2, xb = TRAV.xc + TRAV.w / 2; // bords des ailes
  const xf = xa + TRAV.aile - h, xg = xb - TRAV.aile + h; // fibre moyenne des flancs
  const yb = HB - TRAV.creux + h; // fibre moyenne du fond
  const x0 = xa + TRAV.aile + T + RI, x1 = xb - TRAV.aile - T - RI; // lignes de pli du fond
  const zc = D / 2;
  const g = S.group();
  // Fond à plat, entre les deux lignes de pli, d'une face du bac à l'autre.
  const { trou } = AJOUR;
  const trous = [];
  for (const z of [trou.bord, D - trou.bord]) for (const i of [-1, 0, 1]) trous.push([TRAV.xc + i * trou.pas, z, trou.d / 2]);
  const fenetres = ajours().map((poly) => poly.map(([x, z]) => [TRAV.xc + x, zc + z]));
  g.add(aPlat(S, [[x0, T], [x1, T], [x1, D - T], [x0, D - T]], HB - TRAV.creux, HB - TRAV.creux + T, material, { holes: [...trous, ...fenetres] }));
  for (const [xl, xfl, xbord] of [[x0, xf, xa], [x1, xg, xb]]) {
    // Entre les retombées : pli du fond, flanc, pli du haut et aile.
    g.add(selonZ(S, profilTole([[xl, yb], [xfl, yb], [xfl, HB - h], [xbord, HB - h]]), r.w, D - r.w, material, { bord: false }));
    for (const [z0, z1] of [[T, r.w], [D - r.w, D - T]]) {
      // Sous les rebords : flanc arrêté sous la retombée, et patte jusque sous le rebord.
      g.add(selonZ(S, profilTole([[xl, yb], [xfl, yb], [xfl, HB - r.h]]), z0, z1, material, { bord: false }));
      const za = z0 === T ? T : D - r.w + T, zb = za + r.w - 2 * T; // de la face du bac à la retombée
      const haut = HB - T - 1 / 48; // jeu sous le rebord (détail B)
      const patte = [[za, HB - r.h], [zb, HB - r.h], ...arc(zb - 0.25, haut - 0.25, 0.25, 0, 90), ...arc(za + 0.25, haut - 0.25, 0.25, 90, 180)];
      g.add(selonX(S, patte, xfl - h, xfl + h, material, { bord: false }));
    }
  }
  return g;
}

/** Barre (plaque 5) : plat à bouts ronds posé en travers des ailes de la traverse, un trou à chaque bout. */
function barre(S, material) {
  const a = BARRE.len / 2, r = BARRE.w / 2;
  const contour = [...arc(a - r, 0, r, -90, 90, 14), ...arc(-a + r, 0, r, 90, 270, 14)];
  const e = a - BARRE.trou.bout;
  return S.group(aPlat(S, contour, 0, T, material, { holes: [[-e, 0, BARRE.trou.d / 2], [e, 0, BARRE.trou.d / 2]] }));
}

/** Demi-manchon 1 po FNPT : soudé sur la face du bout, axe selon X, sa face d'appui à X = 0. */
function manchon(S, material, peint) {
  const R = MANCHON.od / 2, ri = MANCHON.id / 2, c = 1 / 32, l = MANCHON.len;
  const corps = S.lathe([
    [ri, 0], [R, 0], [R, l - c], [R - c, l], [ri + c, l], [ri, l - c], [ri, 0],
  ].map(([rr, x]) => [rr * IN, x * IN]), material, { axis: '-x', seg: 40 });
  corps.userData.hasInterior = true;
  return S.group(corps, cordon(S.weldRing((R + SOUDURE * 0.3) * IN, SOUDURE * IN, peint, { axis: 'x', pos: [-SOUDURE * 0.3 * IN, 0, 0] })));
}

/**
 * Bride à souder 2 po NPT : disque de Ø 3 11/16 po et bossage chanfreiné (profil
 * relevé sur les vues), guide de Ø 2,48 po dans le trou de la tôle. Axe selon X,
 * face d'appui à X = 0, saillie vers −X.
 */
function bride(S, material, peint) {
  const R = BRIDE.od / 2, ri = BRIDE.id / 2;
  const corps = S.lathe([
    [ri, -T], [1.24, -T], [1.24, 0], [R, 0], [R, 0.146], [1.583, 0.146], [1.52, 0.208],
    [1.44, 0.28], [1.25, BRIDE.len], [ri + 0.03, BRIDE.len], [ri, BRIDE.len - 0.03], [ri, -T],
  ].map(([rr, x]) => [rr * IN, x * IN]), material, { axis: '-x', seg: 56 });
  corps.userData.hasInterior = true;
  return S.group(corps, cordon(S.weldRing((R + SOUDURE * 0.25) * IN, SOUDURE * IN, peint, { axis: 'x', pos: [-SOUDURE * 0.3 * IN, 0, 0] })));
}


/** Contour d'une joue de la flotte : enveloppe du cercle du cylindre et de l'arrondi autour du bras. */
function contourJoue() {
  const R = FLOTTE.joue.d / 2, r = FLOTTE.joue.r, { x, y } = FLOTTE.bras;
  const dist = Math.hypot(x, y), a0 = (Math.atan2(y, x) * 180) / Math.PI;
  const b = (Math.acos((R - r) / dist) * 180) / Math.PI; // points de tangence, de part et d'autre de l'axe de la goutte
  return [...arc(0, 0, R, a0 + b, a0 - b + 360, 56), ...arc(x, y, r, a0 - b, a0 + b, 12)];
}

/** Carré aux coins arrondis, centré en [x, y]. */
function carre(x, y, w, r) {
  const h = w / 2;
  return coinsRonds([[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]], r, 4);
}

/**
 * Flotte soudée 152042605, dans le repère de la pièce : cylindre, deux joues, bras
 * et raccord du capuchon au centre de la joue avant.
 */
function corpsFlotte(S, material) {
  const { cyl, joue, bras } = FLOTTE;
  const g = S.group();
  const z1 = -joue.t, z0 = z1 - cyl.len; // faces intérieures des joues
  g.add(S.shell((cyl.d / 2) * IN, (cyl.d / 2 - cyl.t) * IN, cyl.len * IN, material, { axis: 'z', seg: 64, pos: [0, 0, ((z0 + z1) / 2) * IN] }));
  const passage = carre(bras.x, bras.y, bras.w, bras.r);
  g.add(selonZ(S, contourJoue(), z1, 0, material, { holes: [m(passage), [0, 0, 0.22 * IN]] }));
  g.add(selonZ(S, contourJoue(), z0 - joue.t, z0, material, { holes: [m(passage)] }));
  // Bras : tube carré de 1 po, paroi de 1/8 po ; dépasse de 1/8 po de la joue avant.
  const creux = carre(bras.x, bras.y, bras.w - 2 * bras.t, bras.r / 2);
  g.add(selonZ(S, passage, bras.avant - bras.len, bras.avant, material, { holes: [m(creux)] }));
  // Raccord du capuchon : six-pans soudé au centre de la joue avant.
  const R = FLOTTE.capuchon.af / 2 / Math.cos(Math.PI / 6);
  g.add(S.lathe([[0.1, 0], [R, 0], [R, 0.28], [0.19, 0.28], [0.19, 0.4], [0.1, 0.4], [0.1, 0]].map(([rr, z]) => [rr * IN, z * IN]), material, { axis: 'z', seg: 6 }));
  return g;
}

/** Capuchon 210292-4S : écrou six pans à bout bombé, vissé sur le raccord de la joue avant. */
function capuchon(S, material) {
  const R = FLOTTE.capuchon.af / 2 / Math.cos(Math.PI / 6), l = FLOTTE.capuchon.len;
  const dome = [];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    dome.push([0.25 * Math.cos(a), l - 0.22 + 0.22 * Math.sin(a)]);
  }
  return S.group(
    S.lathe([[0, 0.3], [R, 0.3], [R, l - 0.24], [0, l - 0.24]].map(([rr, z]) => [rr * IN, z * IN]), material, { axis: 'z', seg: 6 }),
    S.lathe([[0, l - 0.24], [0.25, l - 0.24], ...dome].map(([rr, z]) => [rr * IN, z * IN]), material, { axis: 'z', seg: 28 }),
  );
}

/** Boulons 3/8-16 × 1 1/4 po : en travers du bout du bras, têtes du côté +Y de la pièce. */
function boulonsFlotte(S, material) {
  const { bras, boulon } = FLOTTE;
  const z0 = bras.avant - bras.len;
  return boulon.bout.map((d) => S.bolt(boulon.d * IN, boulon.len * IN, material, {
    axis: 'y', pos: [bras.x * IN, (bras.y + bras.w / 2) * IN, (z0 + d) * IN],
  }));
}

/**
 * Flotte 152042600, posée comme sur la vue du plan : axe du cylindre selon X
 * (capuchon vers +X, bras vers −X), faces du bras à 45° de la verticale.
 */
export function P02(api) {
  const { S, THREE } = api;
  const k = Math.SQRT1_2;
  // Repère de la pièce → repère de la page : X pièce = (0, k, −k), Y pièce = (0, k, k), Z pièce = +X.
  const q = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(new THREE.Vector3(0, k, -k), new THREE.Vector3(0, k, k), new THREE.Vector3(1, 0, 0)),
  );
  const pose = (obj) => { const g = S.group(obj); g.quaternion.copy(q); return g; };
  // Corps soudé peint en noir comme le bac (demande du client) ; boulons et capuchon zingués.
  api.part('1', pose(corpsFlotte(S, PEINT)), [0, 0, 0]);
  boulonsFlotte(S, 'zinc').forEach((b, i) => api.part('2', pose(b), [0, 0.07, 0.07], { noLabel: i > 0 }));
  api.part('3', pose(capuchon(S, 'zinc')), [0.1, 0, 0]);
  return { view: { dir: [0.8, 0.55, 1] } };
}

/** Tube à l'eau 1524010812 : bac, bouts, traverse, barres, pieds et raccords ; flotte 152042600 posée dedans. */
export function P01(api) {
  const S = api.S;
  // Peinture : tout le bac en noir, brides soudées comprises (demande du client ; le cartouche ne
  // donne pas de couleur de surface). Les demi-manchons en inox gardent leur fini.
  const TOLE = PEINT, INOX = 'steel', ACIER = PEINT;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  // Pose : X centré, bac sur ses pieds, Z centré.
  const pose = (obj, x = 0, y = PIED.h, z = 0) => S.at(S.group(obj), [(x - L / 2) * IN, y * IN, (z - D / 2) * IN]);
  // Bout droit : la même pièce tournée d'un demi-tour autour de la verticale (trous placés en conséquence).
  const droite = (obj) => S.at(S.group(obj), [L * IN, 0, D * IN], [0, Math.PI, 0]);

  put('1', pose(plaque1(S, TOLE)), [0, 0, 0]);
  const trouBride = [BRIDE.z, BRIDE.y, BRIDE.trou / 2];
  const yManchon = HB - MANCHON.sousHaut;
  put('2', pose(droite(S.group(bout(S, TOLE, [[D - BRIDE.z, BRIDE.y, BRIDE.trou / 2]]), cordonsBout(S, TOLE)))), [0.32, 0, 0]);
  put('3', pose(S.group(
    bout(S, TOLE, [trouBride, ...MANCHON.z.map((z) => [z, yManchon, MANCHON.id / 2])]),
    cordonsBout(S, TOLE),
  )), [-0.32, 0, 0]);
  put('4', pose(traverse(S, TOLE)), [0, 0.3, 0]);
  for (const z of BARRE.z) put('5', pose(barre(S, TOLE), TRAV.xc, PIED.h + HB, z), [0, 0.45, 0]);
  for (const x of PIED.x) put('6', pose(pied(S, TOLE), x, 0), [0, -0.22, 0]);
  for (const z of MANCHON.z) put('7', pose(manchon(S, INOX, TOLE), 0, PIED.h + yManchon, z), [-0.5, 0, 0]);
  put('8', pose(bride(S, ACIER, TOLE), 0, PIED.h + BRIDE.y, BRIDE.z), [-0.5, 0, 0]);
  put('8', pose(S.at(S.group(bride(S, ACIER, TOLE)), [L * IN, 0, 0], [0, Math.PI, 0]), 0, PIED.h + BRIDE.y, BRIDE.z), [0.5, 0, 0]);
  // Flotte : tournée de 45° autour de son axe (bras au-dessus du cylindre, boulons selon Z),
  // bras vis-à-vis du premier raccord de 1 po. Position supposée : voir POSE_FLOTTE.
  const { bras } = FLOTTE;
  const xf = T + POSE_FLOTTE.bout + bras.len - bras.avant; // face avant de la flotte
  const flotte = S.at(S.group(api.sub('P02')), [0, 0, 0], [Math.PI / 4, 0, 0]);
  put('10', pose(flotte, xf, PIED.h + yManchon - bras.x, POSE_FLOTTE.z - bras.y), [-0.25, 0.5, 0.4]);
  return { view: { dir: [-0.75, 0.8, 1] } };
}

export default { P01, P02 };
