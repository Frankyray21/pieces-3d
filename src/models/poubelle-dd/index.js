// Poubelle DD : poubelle 154011700 (Machines Roger International, plan du
// 2024-01-17, échelle 1:5, vue de bout et coupe A-A) et son couvercle 0103001
// « COUVERCLE DE POUBELLE POUR DRUM 50KG » (plan du 2024-12-02, échelle 1:4, vue
// de dessus et coupe A-A).
// Cotes des plans. Poubelle : rayon de 7 1/8 po, 27 po de haut, fond en retrait
// de 3/16 po, soudure d'angle de 1/8 po des deux côtés du fond, tout le tour.
// Couvercle : dessus de Ø 15 po, jupe de Ø int. 14 5/8 po, 1/8 po entre
// l'anneau et le dessus, poignée à 2 1/2 po du bord. Ce que les plans ne cotent
// pas (épaisseurs, encoches, tenons, joint de la virole, hauteur de la jupe,
// anneau, poignée) est relevé à l'échelle sur leurs tracés vectoriels.
// Contrôle : scripts/check-poubelle-dd.mjs (masses du modèle : 47,9 lb et
// 6,9 lb, comme aux cartouches).
// Repère : Y vers le haut (0 au bord du bas de la virole, le fond juste
// au-dessus), tenons du fond sur l'axe X, joint de la virole à l'arrière (−Z).
// Le plan X = 0 est celui des deux coupes A-A ; la poignée du couvercle est du
// côté −X.

const IN = 0.0254;

// Virole 154011701 : plaque de 1/8 po roulée, joint de 1/32 po (relevés).
export const VIROLE = { r: 7 + 1 / 8, t: 1 / 8, h: 27, joint: 1 / 32 };
// Fond 154011702 : disque de 1/8 po (relevé), en retrait de 3/16 po (coté), deux
// tenons de 3/16 po de large qui dépassent la virole de 1/16 po (relevés).
export const FOND = { t: 1 / 8, retrait: 3 / 16, tenon: { w: 3 / 16, saillie: 1 / 16 } };
// Encoches de la virole pour les tenons : 5/16 po de large (relevé), ouvertes au
// bord du bas. Profondeur visible à la coupe : 3/16 po, jusqu'au fond ; le
// tenon s'y loge, donc 5/16 po en tout (supposé, caché par le fond à la coupe).
export const ENCOCHE = { w: 5 / 16, h: FOND.retrait + FOND.t };
export const SOUDURE = 1 / 8; // soudure d'angle des deux côtés du fond, tout le tour (plan)
// Couvercle 0103001, tout en plaque de 1/16 po (relevé ; masse du cartouche à l'appui).
// Anneau 154011703 : Ø 14 5/8 × 13 7/8 po (relevés), posé sur le bord de la poubelle.
// Jupe 154011704 : Ø int. 14 5/8 po (coté), 4 po de haut (relevé), sous le dessus.
// Dessus 154011705 : disque de Ø 15 po (coté), à 1/8 po au-dessus de l'anneau (coté).
// Poignée 154011706 : bande de 1 po pliée en U, 6 po de long et 2 po de haut
// (relevés), à 2 1/2 po du bord et 4 1/2 po des bouts au bord (cotés).
export const COUVERCLE = {
  t: 1 / 16,
  anneau: { od: 14 + 5 / 8, id: 13 + 7 / 8 },
  jupe: { id: 14 + 5 / 8, h: 4 },
  dessus: { d: 15, jeu: 1 / 8 },
  poignee: { w: 1, len: 6, h: 2, bord: 2.5, pli: 1 / 16 },
  soudure: 1 / 16,
};

// Peinture : poubelle et couvercle en noir (demande du client ; les plans ne
// donnent pas de couleur de surface).
const PEINT = 'black';
const SEG = 96; // facettes sur le tour

/** Marque un cordon de soudure (hors cotes et hors masse dans scripts/check-poubelle-dd.mjs). */
function cordon(obj) {
  obj.traverse((o) => { o.userData.soudure = true; });
  return obj;
}

/**
 * Virole : plaque roulée, ouverte au joint (−Z), deux encoches au bord du bas
 * sur l'axe X. Maillage fermé bâti sur une grille (angle, hauteur) : les cases
 * des encoches sont laissées vides.
 */
function virole(api, material) {
  const { THREE, S } = api;
  const Ro = VIROLE.r, Ri = Ro - VIROLE.t, Rm = (Ro + Ri) / 2;
  const dj = VIROLE.joint / 2 / Rm, de = ENCOCHE.w / 2 / Rm; // demi-angles du joint et d'une encoche
  const bornes = [-Math.PI / 2 + dj, -de, de, Math.PI - de, Math.PI + de, 1.5 * Math.PI - dj];
  const cols = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const a0 = bornes[i], a1 = bornes[i + 1], encoche = i % 2 === 1;
    const n = encoche ? 1 : Math.ceil((a1 - a0) / ((2 * Math.PI) / SEG));
    for (let k = 0; k < n; k++) cols.push({ a0: a0 + ((a1 - a0) * k) / n, a1: a0 + ((a1 - a0) * (k + 1)) / n, encoche });
  }
  const rangs = [[0, ENCOCHE.h], [ENCOCHE.h, VIROLE.h]];
  const plein = (c, r) => c >= 0 && c < cols.length && r >= 0 && r < rangs.length && !(cols[c].encoche && r === 0);
  const pos = [];
  const P = (a, y, r) => new THREE.Vector3(r * Math.cos(a) * IN, y * IN, r * Math.sin(a) * IN);
  /** Face à quatre coins, orientée selon la normale n. */
  const face = (p0, p1, p2, p3, n) => {
    const droit = p1.clone().sub(p0).cross(p2.clone().sub(p0)).dot(n) >= 0;
    for (const p of droit ? [p0, p1, p2, p0, p2, p3] : [p0, p2, p1, p0, p3, p2]) pos.push(p.x, p.y, p.z);
  };
  const radial = (a) => new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  const tangent = (a) => new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
  const haut = new THREE.Vector3(0, 1, 0);
  cols.forEach(({ a0, a1 }, c) => {
    rangs.forEach(([y0, y1], r) => {
      if (!plein(c, r)) return;
      const am = (a0 + a1) / 2;
      face(P(a0, y0, Ro), P(a1, y0, Ro), P(a1, y1, Ro), P(a0, y1, Ro), radial(am));
      face(P(a0, y0, Ri), P(a1, y0, Ri), P(a1, y1, Ri), P(a0, y1, Ri), radial(am).negate());
      if (!plein(c, r - 1)) face(P(a0, y0, Ri), P(a1, y0, Ri), P(a1, y0, Ro), P(a0, y0, Ro), haut.clone().negate());
      if (!plein(c, r + 1)) face(P(a0, y1, Ri), P(a1, y1, Ri), P(a1, y1, Ro), P(a0, y1, Ro), haut);
      if (!plein(c - 1, r)) face(P(a0, y0, Ri), P(a0, y0, Ro), P(a0, y1, Ro), P(a0, y1, Ri), tangent(a0).negate());
      if (!plein(c + 1, r)) face(P(a1, y0, Ri), P(a1, y0, Ro), P(a1, y1, Ro), P(a1, y1, Ri), tangent(a1));
    });
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = S.merged([new THREE.Mesh(S.creaseNormals(geo))], material);
  m.userData.hasInterior = true;
  return m;
}

/** Fond : disque au diamètre intérieur de la virole, deux tenons sur l'axe X, et ses deux cordons. */
function fond(S, material) {
  const R = VIROLE.r - VIROLE.t, w = FOND.tenon.w / 2, Rt = VIROLE.r + FOND.tenon.saillie;
  const a0 = Math.asin(w / R), n = SEG / 2;
  const pts = [];
  for (const s of [1, -1]) {
    pts.push([s * Rt, -s * w], [s * Rt, s * w]);
    for (let i = 0; i <= n; i++) {
      const a = (s > 0 ? 0 : Math.PI) + a0 + ((Math.PI - 2 * a0) * i) / n;
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
  }
  const disque = S.extrude(pts.map(([x, y]) => [x * IN, y * IN]), FOND.t * IN, material);
  disque.rotation.x = -Math.PI / 2; // à plat : épaisseur selon Y
  disque.position.y = (FOND.retrait + FOND.t / 2) * IN;
  const g = S.group(disque);
  const r = (R - SOUDURE * 0.3) * IN;
  for (const y of [FOND.retrait - SOUDURE * 0.3, FOND.retrait + FOND.t + SOUDURE * 0.3]) {
    g.add(cordon(S.weldRing(r, SOUDURE * IN, material, { pos: [0, y * IN, 0] })));
  }
  return g;
}

/** Poubelle 154011700 : virole roulée et fond soudé. */
export function P02(api) {
  const S = api.S;
  api.part('1', virole(api, PEINT), [0, 0, 0]);
  api.part('2', fond(S, PEINT), [0, -0.3, 0]);
  // Coupe du site : le plan X = 0, celui de la coupe A-A (par le joint, encoche au milieu du bord).
  return { view: { dir: [0.8, 0.75, 1.1], section: { axis: 'x' } } };
}

/** Arc de cercle dans le plan du profil, de l'angle a0 à a1 (degrés). */
function arc(cx, cy, r, a0, a1, n = 6) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// Couvercle, repère local : Y = 0 sous l'anneau (appui sur le bord de la poubelle).
const Y_DESSUS = COUVERCLE.t + COUVERCLE.dessus.jeu; // dessous du disque du dessus

/** Pièce de révolution autour de Y : profil fermé [rayon, y] en pouces. */
function tourne(S, profil, material) {
  return S.lathe(profil.map(([r, y]) => [r * IN, y * IN]), material, { seg: SEG });
}

/** Anneau d'appui, avec son cordon de 1/16 po contre la jupe (dessous). */
function anneau(S, material) {
  const { t, anneau: a, soudure: s } = COUVERCLE;
  const g = S.group(tourne(S, [[a.id / 2, 0], [a.od / 2, 0], [a.od / 2, t], [a.id / 2, t], [a.id / 2, 0]], material));
  g.add(cordon(S.weldRing((a.od / 2 - s * 0.3) * IN, s * IN, material, { pos: [0, -s * 0.3 * IN, 0] })));
  return g;
}

/** Jupe : virole de 4 po sous le disque du dessus, autour du haut de la poubelle. */
function jupe(S, material) {
  const { t, jupe: j } = COUVERCLE;
  const ri = j.id / 2, ro = ri + t, y1 = Y_DESSUS, y0 = y1 - j.h;
  const m = tourne(S, [[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], material);
  m.userData.hasInterior = true;
  return m;
}

/** Dessus : disque plein de Ø 15 po. */
function dessus(S, material) {
  const R = COUVERCLE.dessus.d / 2;
  return tourne(S, [[0, Y_DESSUS], [R, Y_DESSUS], [R, Y_DESSUS + COUVERCLE.t], [0, Y_DESSUS + COUVERCLE.t]], material);
}

/** Poignée : bande pliée en U, pieds soudés sur le dessus (1/16 po des deux côtés de chaque pied). */
function poignee(S, material) {
  const { t, poignee: p, soudure: s } = COUVERCLE;
  const L = p.len / 2, ri = p.pli, ro = p.pli + t;
  // Profil dans le plan (longueur, hauteur) : extérieur puis intérieur.
  const profil = [
    [-L, 0], ...arc(-L + ro, p.h - ro, ro, 180, 90), ...arc(L - ro, p.h - ro, ro, 90, 0), [L, 0],
    [L - t, 0], ...arc(L - ro, p.h - ro, ri, 0, 90), ...arc(-L + ro, p.h - ro, ri, 90, 180), [-L + t, 0],
  ];
  const bande = S.extrude(profil.map(([x, y]) => [x * IN, y * IN]), p.w * IN, material);
  bande.rotation.y = -Math.PI / 2; // longueur selon Z, largeur selon X
  const g = S.group(bande);
  for (const z of [-L - s * 0.3, -L + t + s * 0.3, L - t - s * 0.3, L + s * 0.3]) {
    g.add(cordon(S.weld([[(-p.w / 2) * IN, s * 0.3 * IN, z * IN], [(p.w / 2) * IN, s * 0.3 * IN, z * IN]], s * IN, material)));
  }
  const x = -(COUVERCLE.dessus.d / 2 - p.bord - p.w / 2); // axe de la poignée, à 4 1/2 po du centre
  return S.at(g, [x * IN, (Y_DESSUS + t) * IN, 0]);
}

/** Couvercle 0103001 : anneau d'appui, jupe, dessus et poignée. */
export function P03(api) {
  const S = api.S;
  api.part('3', dessus(S, PEINT), [0, 0.1, 0]);
  api.part('4', poignee(S, PEINT), [0, 0.2, 0]);
  api.part('1', anneau(S, PEINT), [0, -0.08, 0]);
  api.part('2', jupe(S, PEINT), [0, -0.22, 0]);
  return { view: { dir: [0.8, 0.75, 1.1], section: { axis: 'x' } } };
}

/** Poubelle DD : la poubelle et son couvercle, l'anneau posé sur le bord de la virole. */
export function P01(api) {
  const S = api.S;
  api.part('1', api.sub('P02'), [0, 0, 0]);
  api.part('2', S.at(api.sub('P03'), [0, VIROLE.h * IN, 0]), [0, 0.3, 0]);
  return { view: { dir: [0.8, 0.7, 1.1], section: { axis: 'x' } } };
}

export default { P01, P02, P03 };
