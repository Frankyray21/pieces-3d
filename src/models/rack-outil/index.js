// Rack à outils 15083000 (Machines Roger International) : assemblage soudé,
// d'après le plan d'assemblage du 2021-08-31 (échelle 1:4, une page).
// Cotes du plan ; ce que le plan ne cote pas (épaisseurs, rayons, largeur des
// montants, profil des crochets) est relevé à l'échelle sur ses tracés
// vectoriels. Contrôle (scripts/check-rack-outil.mjs) : le volume d'acier du
// modèle donne 11,1 lb, pour 11,2 lb au cartouche.
// Repère : X largeur (0 au bord gauche du plan, modèle centré), Y vers le
// haut (0 au bas de la plaque), +Z vers l'avant (côté des tubes) ; la face
// avant de la plaque est à Z = 0.

const IN = 0.0254;

// Plaque 15083001.
const W = 30, H = 14.5; // hors tout
const T = 3 / 16; // épaisseur (relevée)
const ARM = 2.5; // largeur des montants et hauteur de la traverse (relevées)
const R_IN = 3; // rayon intérieur du U (relevé)
const R_BAS = 1 + 3 / 16; // coins du bas (relevé)
const R_HAUT = 1 / 8; // coins du haut (relevé)
// Fentes des tenons des crochets d'accrochage : 1/4 × 3/16 po.
const FENTE = { w: 1 / 4, y0: 14.125, y1: 14.3125, x: [1 / 8, 2 + 1 / 8, 27 + 5 / 8, 29 + 5 / 8] };

// Tubes ronds 15083002 : debout, tangents à la face avant.
const TUBE = { od: 2.875, id: 2.5, h: 2.5, x: [1 + 7 / 16, 5 + 1 / 16] };
// Tuyau noir 1,900 × 0,109 (15083004) : couché, perpendiculaire à la plaque.
const T4 = { od: 1.9, wall: 0.109, len: 2.25, x: 28.75, y: 1.25 };
// Tuyau noir 1,050 × 0,113 (15083005) : debout, à 1 11/16 po du dernier crochet.
const T5 = { od: 1.05, wall: 0.113, h: 2.5, x: 23.75 + 1.05 / 2 };
// Crochets en L 15083006 : plaque de 3/8 po, 2 po de saillie, pas de 2 1/4 po.
const CROCHET = { t: 3 / 8, len: 2, y0: 1 + 1 / 16, h: 1, x0: 8 + 3 / 16, pas: 2.25, n: 7 };
// Crochets d'accrochage 15083003 : plaque de 1/4 po, 3 po de haut, fente de 1/4 po.
const ACCROCHE = { t: 1 / 4, h: 3, jeu: 1 / 4 };

const SOUDURE = 3 / 16; // cordons du plan

/** Arc de cercle en points [x, y], de l'angle a0 à a1 (degrés), n segments. */
function arc(cx, cy, r, a0, a1, n = 16) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

const m = (pts) => pts.map(([x, y]) => [x * IN, y * IN]);

/** Marque un cordon de soudure (hors cotes et hors masse dans scripts/check-rack-outil.mjs). */
function cordon(obj) {
  obj.traverse((o) => { o.userData.soudure = true; });
  return obj;
}

/** Plaque en U découpée, avec les quatre fentes des tenons. */
function plaque(S, material) {
  const r = R_HAUT, yi = ARM + R_IN;
  const profil = [
    ...arc(W - R_BAS, R_BAS, R_BAS, -90, 0, 14),
    ...arc(W - r, H - r, r, 0, 90, 6),
    ...arc(W - ARM + r, H - r, r, 90, 180, 6),
    ...arc(W - ARM - R_IN, yi, R_IN, 0, -90, 28),
    ...arc(ARM + R_IN, yi, R_IN, -90, -180, 28),
    ...arc(ARM - r, H - r, r, 0, 90, 6),
    ...arc(r, H - r, r, 90, 180, 6),
    ...arc(R_BAS, R_BAS, R_BAS, 180, 270, 14),
  ];
  const fentes = FENTE.x.map((x) => m([[x, FENTE.y0], [x, FENTE.y1], [x + FENTE.w, FENTE.y1], [x + FENTE.w, FENTE.y0]]));
  const p = S.extrude(m(profil), T * IN, material, { holes: fentes, center: false });
  p.position.set((-W / 2) * IN, 0, -T * IN);
  return S.group(p);
}

/** Tube debout tangent à la plaque, avec ses deux cordons le long de la ligne de contact. */
function tubeDebout(S, od, id, h, x, material) {
  const R = od / 2, r = SOUDURE / 2;
  // Les cordons se logent où le jeu entre le tube et la plaque vaut à peu près leur taille.
  const dx = Math.sqrt(2 * R * r * 0.7);
  const g = S.group(S.shell(R * IN, (id / 2) * IN, h * IN, material, { seg: 48, pos: [0, (h / 2) * IN, R * IN] }));
  for (const s of [-1, 1]) {
    g.add(cordon(S.weld([[s * dx * IN, 0.15 * IN, r * 0.55 * IN], [s * dx * IN, (h - 0.15) * IN, r * 0.55 * IN]], SOUDURE * IN, material)));
  }
  return S.at(g, [(x - W / 2) * IN, 0, 0]);
}

/** Tuyau couché, soudé tout le tour à la face avant. */
function tuyauCouche(S, material) {
  const R = T4.od / 2;
  const g = S.group(
    S.shell(R * IN, (R - T4.wall) * IN, T4.len * IN, material, { axis: 'z', seg: 40, pos: [0, 0, (T4.len / 2) * IN] }),
    cordon(S.weldRing((R + SOUDURE * 0.3) * IN, SOUDURE * IN, material, { axis: 'z', pos: [0, 0, SOUDURE * 0.3 * IN] })),
  );
  return S.at(g, [(T4.x - W / 2) * IN, T4.y * IN, 0]);
}

/** Crochet en L : bras de 3/8 po, bout relevé à sommet rond, coin extérieur arrondi. */
function crochet(S, material) {
  const { t, len, y0, h } = CROCHET;
  const ya = y0 + t; // dessus du bras
  const rf = 1 / 8; // congé intérieur (estimé sur la vue isométrique)
  const profil = [
    [0, y0],
    ...arc(len - t, ya, t, -90, 0, 12),
    ...arc(len - t / 2, y0 + h - t / 2, t / 2, 0, 180, 14),
    ...arc(len - t - rf, ya + rf, rf, 0, -90, 6),
    [0, ya],
  ];
  const p = S.extrude(m(profil), t * IN, material, { center: false });
  p.rotation.y = -Math.PI / 2; // profil dans le plan ZY, épaisseur selon X
  p.position.x = t * IN;
  const g = S.group(p);
  // Soudure d'angle des deux côtés du bras : cordon bombé de 3/16 po, sur la hauteur du bras.
  for (const s of [-1, 1]) {
    const bombe = arc(0, 0, SOUDURE, 0, 90, 5).map(([x, z]) => [s * x, z]);
    const c = S.extrude(m([[0, 0], ...bombe]), t * IN, material, { center: false, bevel: 0.0003 });
    c.rotation.x = Math.PI / 2; // profil dans le plan XZ, longueur vers le bas
    c.position.set((s > 0 ? t : 0) * IN, ya * IN, 0);
    g.add(cordon(c));
  }
  return g;
}

/** Crochet d'accrochage : tenon dans la fente de la plaque, pont et patte de 3 po derrière. */
function accroche(S, material) {
  const { t, h, jeu } = ACCROCHE;
  const zi = T + jeu, zo = zi + t; // faces de la patte, mesurées depuis la face avant (vers l'arrière)
  const profil = [
    [0, FENTE.y0],
    [T + 3 / 16, FENTE.y0],
    ...arc(T + 3 / 16, FENTE.y0 - 1 / 16, 1 / 16, 90, 0, 5),
    ...arc(zi + 1 / 8, H - h + 1 / 8, 1 / 8, 180, 270, 6),
    [zo, H - h],
    ...arc(zo - 1 / 8, H - 1 / 8, 1 / 8, 0, 90, 6),
    [T, H],
    [T, FENTE.y1],
    [0, FENTE.y1],
  ];
  const p = S.extrude(m(profil), t * IN, material, { center: false });
  p.rotation.y = Math.PI / 2; // profil dans le plan ZY, vers l'arrière ; épaisseur selon X
  return S.group(p);
}

export function P01(api) {
  const S = api.S;
  // Peinture : tout le rack en rouge Machines Roger (demande du client ; le plan ne donne pas de
  // couleur de surface). Les « tuyaux noirs » de la nomenclature sont peints comme le reste.
  const TOLE = 'red', NOIR = 'red';
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  put('1', plaque(S, TOLE), [0, 0, 0]);
  for (const x of TUBE.x) put('2', tubeDebout(S, TUBE.od, TUBE.id, TUBE.h, x, TOLE), [-0.04, 0, 0.16]);
  for (const x of FENTE.x) put('3', S.at(accroche(S, TOLE), [(x - W / 2) * IN, 0, 0]), [0, 0.03, -0.12]);
  put('4', tuyauCouche(S, NOIR), [0.04, 0, 0.16]);
  put('5', tubeDebout(S, T5.od, T5.od - 2 * T5.wall, T5.h, T5.x, NOIR), [0, 0, 0.2]);
  for (let i = 0; i < CROCHET.n; i++) {
    put('6', S.at(crochet(S, TOLE), [(CROCHET.x0 + i * CROCHET.pas - W / 2) * IN, 0, 0]), [0, 0, 0.12]);
  }
  return { view: { dir: [-0.7, 0.55, 1] } };
}

export default { P01 };
