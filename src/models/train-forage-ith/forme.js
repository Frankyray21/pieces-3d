// Train de forage ITH des foreuses Cubex : géométrie de chaque pièce, sans three.js, pour qu'elle serve
// à la fois au site (index.js) et à l'export glTF pour Unreal Engine (scripts/export-train-ith-unreal.mjs).
//
// Sources (voir aussi la fiche, public/equipment/train-forage-ith/data.json) :
//  - PRO-OP-ITH-016 (manipulation des marteaux) : masses des marteaux de 3, 4 et 6 po (60, 89 et 211 lb,
//    « Sources : Sandvik et Epiroc ») ; driver sub, saver sub, anneaux de retenue, casse-bit dans la slip
//    plate, chariot de transport à chaîne de sûreté ; photos du chariot, du casse-bit, des anneaux.
//  - PRO-OP-ITH-001 (changement de bit) : bits de 3 5/8 à 5 1/8 po, bit de 6 po pour casing, bits de
//    6 1/2, 8 et 10 po ; photos du bit avec ses anneaux de retenue (jaunes) et son tube de pied (blanc).
//  - PRO-OP-ITH-004 (forage long-trou) : 7 pi 6 po entre la slip plate et le bout des taillants.
//  - Manuel de la Cubex MRI 5200 (F15) : slip plates pour tiges de 3 1/2 po et de 5 1/2 po.
//  - Fiches techniques Epiroc (COP 32, COP 44, catalogue DTH) : les masses de la procédure sont celles
//    des COP 32 HD (26 kg), COP 44 Gold (40,5 kg) et COP 64 Gold (96 kg) ; diamètres, longueurs et
//    filets de raccord viennent de ces fiches.
//  - Photos de chantier du client : tiges jaunes et tiges noires, bouts d'acier nu à entailles plates,
//    protecteurs de filets jaunes.
// Le reste (proportions des têtes de bit, cannelures, chariot) est relevé sur les photos ou supposé ;
// chaque constante le dit.
//
// Unités : millimètres dans ce fichier ; les géométries sortent en mètres. Pièces debout, axe vertical Y,
// origine au centre de la face du bas (là où la pièce repose).
//
// Une géométrie est un ensemble de « surfaces » : { zone, pos, nor, uv, idx, wear } (tableaux plats, mètres).
// La zone désigne la finition (peinture jaune, acier nu, filet graissé…) ; wear (0 à 1 par sommet) dit où
// l'usure est la plus forte (arêtes, bouts). Les pièces tournées ont des UV uniques (u autour de l'axe,
// v le long du profil) : la texture d'usure de chaque pièce lui est propre. Les autres (chariot, chaîne)
// ont des UV en mètres / TUILE, pour des textures répétées.

export const IN = 25.4;
const MM = 0.001;
/** Côté d'une tuile de texture répétée (mm) : UV = longueur / TUILE. */
export const TUILE = 500;

// ------------------------------------------------------------------ cotes (mm)

/** Filets API REG (pas de 5 filets au pouce, conicité de 1/6 sur le diamètre). */
export const API_REG = {
  '2 3/8': { grand: 2.688 * IN, long: 3 * IN, pas: IN / 5, prof: 3.1 },
  '3 1/2': { grand: 3.75 * IN, long: 3.75 * IN, pas: IN / 4, prof: 3.6 },
};

/**
 * Tiges de forage : Ø 3 1/2 po (slip plate « FOR 3 1/2" ROD » du manuel de la Cubex), longueurs de 4, 5 et
 * 6 pi d'épaulement à épaulement. Filet mâle en haut (il se visse dans le saver sub), femelle en bas (il
 * reçoit le marteau, dont le raccord est mâle selon Epiroc). Paroi de 1/4 po supposée : 13 kg/m de tube,
 * environ 15 kg/m avec les bouts, comme les 15 kg/m qu'Epiroc donne pour une tige de 89 mm.
 * Entailles plates (prise de clé) : deux méplats opposés à 3 po l'un de l'autre, sur les bouts d'acier
 * nu ; leur position et leur longueur sont relevées sur les photos du rack, leur largeur est supposée.
 */
export const TIGE = {
  d: 3.5 * IN,
  paroi: 0.25 * IN,
  longueurs: { 4: 48 * IN, 5: 60 * IN, 6: 72 * IN },
  filet: '2 3/8',
  boutBas: 165, // bout femelle (acier nu)
  boutHaut: 140, // bout mâle (acier nu)
  alesageBout: 1.5 * IN,
  plats: { entre: 3 * IN, long: 100, recul: 22 },
  couleurs: ['jaune', 'noire'],
};

/**
 * Tiges de 5 1/2 po (slip plate « FOR 5 1/2" ROD » du manuel de la Cubex), pour le marteau de 6 po : mêmes
 * longueurs et mêmes couleurs que les tiges de 3 1/2 po (demande du client). Filet 3 1/2 API REG, celui du raccord
 * de tête du marteau de 6 po. Paroi de 3/8 po, alésage des bouts de 2 1/4 po, méplats à 4 1/2 po : supposés.
 */
export const TIGE_55 = {
  ...TIGE,
  d: 5.5 * IN,
  paroi: 0.375 * IN,
  filet: '3 1/2',
  boutBas: 210,
  boutHaut: 185,
  alesageBout: 2.25 * IN,
  plats: { entre: 4.5 * IN, long: 130, recul: 26 },
};
/** Tiges par diamètre. */
export const TIGES = { '3-1-2': TIGE, '5-1-2': TIGE_55 };

/**
 * Marteaux fond-de-trou (masses de PRO-OP-ITH-016 ; cotes Epiroc des modèles de même masse) :
 * d diamètre du fourreau, long longueur sans bit (raccord mâle exclu), kg masse publiée sans bit.
 * Les proportions internes (épaisseur du fourreau, longueur du raccord de tête) sont supposées.
 */
export const MARTEAUX = {
  3: { nom: '3 po', ref: 'COP 32 HD', d: 82, long: 925, kg: 60 * 0.45359237, filet: '2 3/8', cannelures: 8 },
  4: { nom: '4 po', ref: 'COP 44 Gold', d: 100, long: 1037.5, kg: 89 * 0.45359237, filet: '2 3/8', cannelures: 8 },
  6: { nom: '6 po', ref: 'COP 64 Gold', d: 142, long: 1258, kg: 211 * 0.45359237, filet: '3 1/2', cannelures: 12 },
};

/** Proportions communes d'un marteau, en fraction de son diamètre (supposées, d'après les photos). */
const PROP = {
  alesage: 0.72, // Ø intérieur du fourreau
  teteLong: 1.15, // raccord de tête (backhead), du haut du fourreau à l'épaulement
  platsEntre: 0.8, platsLong: 0.55,
  driverVisible: 0.95, // driver sub sous le fourreau
  driverFilet: 0.5, // driver sub vissé dans le fourreau
  queue: 0.69, // Ø de la queue du bit
};

/**
 * Bits (taillants à boutons) : Ø de 3 5/8 à 10 po (PRO-OP-ITH-001). Marteau porteur d'après les plages
 * d'Epiroc et la procédure (bits de 6, 8 et 10 po sur le marteau de 6 po, PRO-OP-ITH-016).
 */
export const BITS = [
  { id: '3-5-8', nom: '3 5/8 po', d: 3.625 * IN, marteau: 3 },
  { id: '4-1-2', nom: '4 1/2 po', d: 4.5 * IN, marteau: 4 },
  { id: '5-1-8', nom: '5 1/8 po', d: 5.125 * IN, marteau: 4 },
  { id: '6', nom: '6 po (casing)', d: 6 * IN, marteau: 6 },
  { id: '6-1-2', nom: '6 1/2 po', d: 6.5 * IN, marteau: 6 },
  { id: '8', nom: '8 po', d: 8 * IN, marteau: 6 },
  { id: '10', nom: '10 po', d: 10 * IN, marteau: 6 },
];

/** Casse-bits (bits de 6, 6 1/2, 8 et 10 po, PRO-OP-ITH-016) : cuvette octogonale sur un fût qui entre dans la slip plate. */
export const CASSE_BITS = [6, 6.5, 8, 10].map((po) => ({
  id: String(po).replace('.5', '-1-2'),
  nom: po === 6.5 ? '6 1/2 po' : `${po} po`,
  bit: po * IN,
  // Fût : Ø 5 1/2 po, l'ouverture de la slip plate « FOR 5 1/2" ROD » (supposé).
  fut: 5.5 * IN,
  futLong: 170,
  oct: po * IN + 52, // sur plats (relevé sur les photos : rebord d'environ 1 po autour du bit)
  octHaut: 95,
  poche: 72,
}));

/** Saver subs : un par filet de marteau (2 3/8 et 3 1/2 API REG). Forme du manuel de la Cubex (F18, 2216208), cotes supposées. */
export const SAVER_SUBS = [
  { id: '2-3-8', nom: '2 3/8 API REG', filet: '2 3/8', corps: 120, hex: 110 },
  { id: '3-1-2', nom: '3 1/2 API REG', filet: '3 1/2', corps: 146, hex: 130 },
];

/**
 * Chariot à marteau (photo de PRO-OP-ITH-016) : diable à bouteille rouge, deux montants tubulaires,
 * poignées gainées de gris, berceau cintré, pied plat, deux roues à pneus, chaîne de sûreté rouge.
 * Cotes relevées sur la photo à l'échelle du marteau de 6 po (Ø 142 mm) : à 10 % près.
 */
export const CHARIOT = {
  haut: 1150, // pied au bout des poignées
  entraxe: 330, // entre les axes des montants
  tube: 25.4, // Ø des montants
  pied: { larg: 300, prof: 210, ep: 6 },
  roue: { d: 254, larg: 70, moyeu: 90 },
  essieu: 127, // hauteur de l'essieu (rayon de la roue : roues et pied au sol)
  recul: 175, // montants en retrait de l'axe du marteau
  chaine: { fil: 6, maille: 22, haut: 620 },
};

// ------------------------------------------------------------------ outils de maillage

/**
 * Tourne un profil autour de l'axe Y. profil : points [r, y, opts] parcourus dans le sens
 * trigonométrique (vu avec r vers la droite et y vers le haut) : face du bas vers l'extérieur, flanc
 * extérieur vers le haut, face du haut vers l'axe, alésage vers le bas. opts : { z: zone à partir de ce
 * point, m: modificateur angulaire (clé de mods), lisse: arête adoucie }. mods[clé](theta, r) rend le
 * rayon modifié (méplats, cannelures). Rend { surfaces, S, aretes } : S longueur développée du profil,
 * aretes positions (le long du profil) des arêtes vives, pour la texture.
 */
export function tour(profil, { seg = 64, mods = {}, zone = 'acier', ferme = false } = {}) {
  const pts = profil.map(([r, y, o = {}]) => ({ r, y, o }));
  if (ferme) pts.push({ ...pts[0], o: { ...pts[0].o, z: undefined } });
  // Abscisse curviligne (rayons non modifiés).
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i].r - pts[i - 1].r, pts[i].y - pts[i - 1].y));
  const S = s[s.length - 1] || 1;
  const rayon = (p, t) => (p.o.m ? mods[p.o.m](t, p.r) : p.r);
  // Arêtes vives : changement de direction de plus de 25° entre deux segments non nuls.
  const dir = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dr = pts[i + 1].r - pts[i].r, dy = pts[i + 1].y - pts[i].y, l = Math.hypot(dr, dy);
    dir.push(l > 1e-9 ? [dr / l, dy / l] : null);
  }
  const aretes = [];
  for (let i = 1; i < pts.length - 1; i++) {
    let a = i - 1; while (a >= 0 && !dir[a]) a--;
    const b = dir[i];
    if (a < 0 || !b) { if (a >= 0 && !b) aretes.push(s[i]); continue; }
    const c = dir[a][0] * b[0] + dir[a][1] * b[1];
    if (c < Math.cos((25 * Math.PI) / 180) || pts[i].o.m !== pts[i - 1].o.m) aretes.push(s[i]);
  }
  const usure = (si) => {
    let w = 0;
    for (const a of aretes) w = Math.max(w, Math.exp(-Math.abs(si - a) / 6));
    return w;
  };
  const out = new Map();
  const surf = (z) => {
    if (!out.has(z)) out.set(z, { zone: z, pos: [], nor: [], uv: [], idx: [], wear: [] });
    return out.get(z);
  };
  let z = zone;
  const N = seg;
  const bandes = []; // zone de chaque tronçon du profil, le long du profil (pour la texture)
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i].o.z) z = pts[i].o.z;
    bandes.push({ s0: s[i], s1: s[i + 1], zone: z });
    const A = pts[i], B = pts[i + 1];
    // Direction 2D voisine pour adoucir les arêtes marquées « lisse ».
    const d0 = dir[i] || [0, 0];
    const lisseA = A.o.lisse && i > 0 && dir[i - 1] ? norm2([dir[i - 1][0] + d0[0], dir[i - 1][1] + d0[1]]) : null;
    const lisseB = B.o.lisse && dir[i + 1] ? norm2([dir[i + 1][0] + d0[0], dir[i + 1][1] + d0[1]]) : null;
    const S0 = surf(z);
    const base = S0.pos.length / 3;
    for (const [P, sP, lisse] of [[A, s[i], lisseA], [B, s[i + 1], lisseB]]) {
      for (let k = 0; k <= N; k++) {
        const t = (k / N) * Math.PI * 2;
        const r = rayon(P, t);
        S0.pos.push(r * Math.sin(t) * MM, P.y * MM, r * Math.cos(t) * MM);
        // Normale : dérivée angulaire (méplats) × direction du segment à cet angle.
        const h = 1e-3;
        const dr = (rayon(P, t + h) - rayon(P, t - h)) / (2 * h);
        const rA = rayon(A, t), rB = rayon(B, t);
        let dR = rB - rA, dY = B.y - A.y;
        if (lisse) { dR = lisse[0]; dY = lisse[1]; }
        if (Math.hypot(dR, dY) < 1e-9) { dR = B.r - A.r; dY = B.y - A.y; }
        if (Math.hypot(dR, dY) < 1e-9) { dR = 0; dY = 1; }
        const tq = [dr * Math.sin(t) + r * Math.cos(t), 0, dr * Math.cos(t) - r * Math.sin(t)];
        const tl = [dR * Math.sin(t), dY, dR * Math.cos(t)];
        let n = cross(tq, tl);
        if (r < 1e-6) n = [0, -Math.sign(dR) || 1, 0];
        n = norm3(n);
        S0.nor.push(...n);
        S0.uv.push(k / N, sP / S);
        S0.wear.push(usure(sP));
      }
    }
    for (let k = 0; k < N; k++) {
      const a = base + k, b = base + k + 1, c = base + N + 1 + k + 1, d = base + N + 1 + k;
      S0.idx.push(a, c, d, a, b, c);
    }
  }
  // Rayon et hauteur aux extrémités de chaque tronçon : la texture situe le bas, le haut et les arêtes.
  bandes.forEach((b, i) => { b.y0 = pts[i].y; b.y1 = pts[i + 1].y; b.r = Math.max(pts[i].r, pts[i + 1].r); });
  return { surfaces: [...out.values()], S, aretes, bandes, rmax: Math.max(...pts.map((p) => p.r)) };
}

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const norm2 = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

/** Méplats : n faces planes à `entre` mm l'une de l'autre (sur plats), la première tournée vers l'angle a0. */
export function meplats(n, entre, a0 = 0) {
  const pas = (2 * Math.PI) / n, ap = entre / 2;
  return (t, r) => {
    const f = t - a0 - Math.round((t - a0) / pas) * pas;
    return Math.min(r, ap / Math.cos(f));
  };
}

/** Rainures droites : n gorges de `prof` mm, chacune large de l'angle `larg` (radians), flancs adoucis. */
export function rainures(n, prof, larg) {
  return (t, r) => {
    const f = Math.abs(((t * n) / (2 * Math.PI)) % 1 - 0.5) * ((2 * Math.PI) / n); // angle au milieu de la gorge
    const w = Math.max(0, Math.min(1, (larg / 2 - f) / (0.25 * larg) + 0.5));
    return r - prof * w;
  };
}

/** Cannelures droites : n dents, creux de `prof` mm, la dent occupe la moitié du pas (flancs adoucis). */
export function cannelures(n, prof, interieur = false) {
  return (t, r) => {
    const f = ((t * n) / (2 * Math.PI)) % 1;
    const w = Math.max(0, Math.min(1, (Math.abs(f - 0.5) - 0.2) / 0.08)); // 1 sur la dent, 0 au creux
    return interieur ? r + prof * (1 - w) : r - prof * (1 - w);
  };
}

/**
 * Filet suggéré (gorges annulaires en dents de scie) de (rA, yA) à (rB, yB) : rA, rB rayons de crête ;
 * creux vers l'axe (filet mâle) ou vers l'extérieur (femelle). Points intermédiaires, sans les bouts.
 */
export function filet(rA, yA, rB, yB, pas, prof, femelle = false) {
  const L = yB - yA, n = Math.max(1, Math.floor(Math.abs(L) / pas));
  const out = [];
  const sg = femelle ? 1 : -1;
  for (let i = 0; i < n; i++) {
    for (const [f, creux] of [[0.12, 0], [0.42, 1], [0.58, 1], [0.88, 0]]) {
      const t = (i + f) / n;
      out.push([rA + (rB - rA) * t + sg * prof * creux, yA + L * t, creux ? {} : { lisse: false }]);
    }
  }
  return out;
}

/** Ajoute à une liste de surfaces (fusion par zone). */
export function fusion(...listes) {
  const m = new Map();
  for (const s of listes.flat()) {
    if (!m.has(s.zone)) m.set(s.zone, { zone: s.zone, pos: [], nor: [], uv: [], idx: [], wear: [] });
    const d = m.get(s.zone), base = d.pos.length / 3;
    d.pos.push(...s.pos); d.nor.push(...s.nor); d.uv.push(...s.uv); d.wear.push(...s.wear);
    for (const i of s.idx) d.idx.push(i + base);
  }
  return [...m.values()];
}

/** Déplace / tourne des surfaces : matrice 3×3 (lignes) et translation en mm. */
export function placer(surfaces, { rot = null, t = [0, 0, 0] } = {}) {
  return surfaces.map((s) => {
    const pos = [], nor = [];
    for (let i = 0; i < s.pos.length; i += 3) {
      const p = [s.pos[i], s.pos[i + 1], s.pos[i + 2]], n = [s.nor[i], s.nor[i + 1], s.nor[i + 2]];
      const P = rot ? mul(rot, p) : p, Nn = rot ? mul(rot, n) : n;
      pos.push(P[0] + t[0] * MM, P[1] + t[1] * MM, P[2] + t[2] * MM);
      nor.push(...Nn);
    }
    return { ...s, pos, nor };
  });
}
const mul = (m, v) => [0, 1, 2].map((i) => m[i][0] * v[0] + m[i][1] * v[1] + m[i][2] * v[2]);
/** Matrice de rotation d'angle a autour de l'axe 'x', 'y' ou 'z'. */
export function rot(axe, a) {
  const c = Math.cos(a), s = Math.sin(a);
  if (axe === 'x') return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axe === 'y') return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}
export const rots = (...ms) => ms.reduce((a, b) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j])));

/**
 * Tube balayé le long d'un chemin (points en mm) : cercle de rayon r, repères transportés.
 * UV en tuiles (u autour, v le long). ferme : chemin bouclé (maille de chaîne).
 */
export function balayage(chemin, r, { zone = 'rouge', radial = 12, ferme = false, bouts = true } = {}) {
  const P = ferme ? [...chemin, chemin[0]] : chemin;
  const n = P.length;
  const T = P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    if (ferme && (i === 0 || i === n - 1)) { const a2 = P[n - 2], b2 = P[1]; d = [b2[0] - a2[0], b2[1] - a2[1], b2[2] - a2[2]]; }
    return norm3(d);
  });
  // Repère initial perpendiculaire, transporté.
  let ref = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let U = norm3(cross(T[0], ref));
  const frames = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const V = cross(T[i - 1], T[i]), sn = Math.hypot(...V);
      if (sn > 1e-9) {
        const ax = V.map((x) => x / sn), ang = Math.asin(Math.min(1, sn)) * (T[i - 1][0] * T[i][0] + T[i - 1][1] * T[i][1] + T[i - 1][2] * T[i][2] < 0 ? -1 : 1);
        U = rodrigues(U, ax, Math.atan2(sn, T[i - 1][0] * T[i][0] + T[i - 1][1] * T[i][1] + T[i - 1][2] * T[i][2]));
        void ang;
      }
      U = norm3(sub(U, scal(T[i], dot(U, T[i]))));
    }
    frames.push([U, cross(T[i], U)]);
  }
  const s = { zone, pos: [], nor: [], uv: [], idx: [], wear: [] };
  let L = 0;
  for (let i = 0; i < n; i++) {
    if (i) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]);
    const [U2, W] = frames[i];
    for (let k = 0; k <= radial; k++) {
      const a = (k / radial) * Math.PI * 2;
      const nn = [0, 1, 2].map((j) => U2[j] * Math.cos(a) + W[j] * Math.sin(a));
      s.pos.push(...[0, 1, 2].map((j) => (P[i][j] + nn[j] * r) * MM));
      s.nor.push(...nn);
      s.uv.push((a * r) / TUILE, L / TUILE);
      s.wear.push(0.15);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < radial; k++) {
      const a = i * (radial + 1) + k, b = a + 1, c = a + radial + 2, d = a + radial + 1;
      s.idx.push(a, b, c, a, c, d);
    }
  }
  const out = [s];
  if (bouts && !ferme) {
    for (const [i, sg] of [[0, -1], [n - 1, 1]]) {
      const c = { zone, pos: [], nor: [], uv: [], idx: [], wear: [] };
      const [U2, W] = frames[i];
      const nn = T[i].map((x) => x * sg);
      c.pos.push(...P[i].map((x) => x * MM)); c.nor.push(...nn); c.uv.push(0, 0); c.wear.push(0.6);
      for (let k = 0; k <= radial; k++) {
        const a = (k / radial) * Math.PI * 2;
        const q = [0, 1, 2].map((j) => U2[j] * Math.cos(a) + W[j] * Math.sin(a));
        c.pos.push(...[0, 1, 2].map((j) => (P[i][j] + q[j] * r) * MM)); c.nor.push(...nn);
        c.uv.push((q[0] * r) / TUILE, (q[1] * r) / TUILE); c.wear.push(0.6);
      }
      for (let k = 1; k <= radial; k++) sg > 0 ? c.idx.push(0, k, k + 1) : c.idx.push(0, k + 1, k);
      out.push(c);
    }
  }
  return out;
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scal = (a, k) => a.map((x) => x * k);
function rodrigues(v, k, a) {
  const c = Math.cos(a), s = Math.sin(a), kv = cross(k, v), kd = dot(k, v);
  return [0, 1, 2].map((i) => v[i] * c + kv[i] * s + k[i] * kd * (1 - c));
}

/** Boîte (mm) centrée en c, côtés w (x), h (y), d (z) ; UV en tuiles par face. */
export function boite(w, h, d, c = [0, 0, 0], zone = 'rouge') {
  const s = { zone, pos: [], nor: [], uv: [], idx: [], wear: [] };
  const faces = [
    [[1, 0, 0], [0, 0, -1], [0, 1, 0], w, d, h], [[-1, 0, 0], [0, 0, 1], [0, 1, 0], w, d, h],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1], h, w, d], [[0, -1, 0], [1, 0, 0], [0, 0, 1], h, w, d],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0], d, w, h], [[0, 0, -1], [-1, 0, 0], [0, 1, 0], d, w, h],
  ];
  for (const [n, u, v, ep, lu, lv] of faces) {
    const base = s.pos.length / 3;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = [0, 1, 2].map((j) => c[j] + (n[j] * ep) / 2 + (u[j] * a * lu) / 2 + (v[j] * b * lv) / 2);
      s.pos.push(...p.map((x) => x * MM)); s.nor.push(...n);
      s.uv.push(((a + 1) * lu) / 2 / TUILE, ((b + 1) * lv) / 2 / TUILE); s.wear.push(0.5);
    }
    s.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return [s];
}

/** Calotte sphérique (bouton de carbure) de rayon r, dépassant de h, posée en c selon la normale n (mm). */
export function calotte(r, h, c, n, zone = 'carbure', seg = 12, rings = 4) {
  const s = { zone, pos: [], nor: [], uv: [], idx: [], wear: [] };
  const N = norm3(n);
  const ref = Math.abs(N[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const U = norm3(cross(N, ref)), W = cross(N, U);
  const a0 = Math.acos(Math.max(-1, Math.min(1, (r - h) / r))); // demi-angle de la calotte
  const centre = c.map((x, j) => x - N[j] * (r - h));
  for (let i = 0; i <= rings + 1; i++) {
    const phi = i <= rings ? (i / rings) * a0 : a0;
    for (let k = 0; k <= seg; k++) {
      const t = (k / seg) * Math.PI * 2;
      const d = [0, 1, 2].map((j) => N[j] * Math.cos(phi) + (U[j] * Math.cos(t) + W[j] * Math.sin(t)) * Math.sin(phi));
      // Dernier anneau : enfoncé de 2 mm dans la face (pas de jour sous le bouton).
      const q = i === rings + 1 ? [0, 1, 2].map((j) => centre[j] + d[j] * r - N[j] * 2) : [0, 1, 2].map((j) => centre[j] + d[j] * r);
      s.pos.push(...q.map((x) => x * MM)); s.nor.push(...d);
      s.uv.push(k / seg, i / (rings + 1)); s.wear.push(i / rings);
    }
  }
  for (let i = 0; i <= rings; i++) {
    for (let k = 0; k < seg; k++) {
      const a = i * (seg + 1) + k, b = a + 1, cc = a + seg + 2, d = a + seg + 1;
      s.idx.push(a, d, cc, a, cc, b);
    }
  }
  return [s];
}

// ------------------------------------------------------------------ pièces

/** Profil d'un bout mâle (de bas en haut, flanc extérieur puis face puis alésage) au-dessus de y0. */
function boutMale(y0, Rext, f, alesage) {
  const F = API_REG[f];
  const rG = F.grand / 2, rP = rG - F.long / 12; // conicité 1/6 sur le diamètre
  const deg = 5; // dégagement au pied du filet
  return [
    [Rext - 3, y0 + 0, { z: 'acier' }], [Rext - 3 - 2, y0], [rG - 2.5, y0, { z: 'filet' }], [rG - 2.5, y0 + deg],
    [rG, y0 + deg + 1.5],
    ...filet(rG, y0 + deg + 1.5, rP + 1.5, y0 + F.long - 3, F.pas, F.prof),
    [rP + 1.5, y0 + F.long - 3], [rP - 1.5, y0 + F.long], [alesage + 2, y0 + F.long, { z: 'interieur' }], [alesage, y0 + F.long - 2],
  ];
}

/** Profil d'un bout femelle (de haut en bas dans l'alésage) dont la face est en y0 (vers le bas). */
function boutFemelle(y0, f, alesage) {
  const F = API_REG[f];
  const rG = F.grand / 2 + 0.6, rP = rG - F.long / 12;
  const lamage = 14;
  return [
    [alesage, y0 + F.long + lamage + 8, { z: 'filet' }], [rP - 2, y0 + F.long + lamage + 2], [rP, y0 + F.long + lamage],
    ...filet(rP, y0 + F.long + lamage, rG, y0 + lamage + 2, F.pas, F.prof, true),
    [rG, y0 + lamage + 2], [rG + 1.5, y0 + lamage], [rG + 1.5, y0 + 2], [rG + 3.5, y0],
  ];
}

/** Tige de forage de 4, 5 ou 6 pi, Ø 3 1/2 ou 5 1/2 po (diam : '3-1-2' ou '5-1-2'), peinte en jaune ou en noir. */
export function tige(pieds, couleur = 'jaune', diam = '3-1-2') {
  const TIGE = TIGES[diam];
  const L = TIGE.longueurs[pieds], R = TIGE.d / 2, r = R - TIGE.paroi, ra = TIGE.alesageBout / 2;
  const P = TIGE.plats;
  const peint = couleur === 'noire' ? 'peinture-noire' : 'peinture-jaune';
  const profil = [
    // Face du bas (bout femelle) vers l'extérieur
    ...[[API_REG[TIGE.filet].grand / 2 + 4.1, 0, { z: 'acier' }], [R - 3, 0], [R, 3, { lisse: true }]],
    [R, P.recul], [R, P.recul, { m: 'plats' }], [R, P.recul + P.long, { m: 'plats' }], [R, P.recul + P.long],
    [R, TIGE.boutBas, { z: peint }],
    [R, L - TIGE.boutHaut, { z: 'acier' }],
    [R, L - P.recul - P.long], [R, L - P.recul - P.long, { m: 'plats' }], [R, L - P.recul, { m: 'plats' }], [R, L - P.recul],
    [R, L - 3, { lisse: true }],
    ...boutMale(L, R, TIGE.filet, ra),
    // Alésage : bout mâle, tube, bout femelle
    [ra, L - TIGE.boutHaut + 20], [r, L - TIGE.boutHaut - 10], [r, TIGE.boutBas + 10], [ra, TIGE.boutBas - 20],
    ...boutFemelle(0, TIGE.filet, ra),
  ];
  return tour(profil, { seg: 96, mods: { plats: meplats(2, P.entre) } });
}

/** Marteau fond-de-trou (fourreau et raccord de tête), sans driver sub ni bit ; origine au bas du fourreau. */
export function marteau(taille) {
  const M = MARTEAUX[taille], D = M.d, R = D / 2, ri = (D * PROP.alesage) / 2;
  const H = M.long - D * PROP.driverVisible; // du bas du fourreau à l'épaulement du raccord de tête
  const hT = D * PROP.teteLong;
  const F = API_REG[M.filet];
  const aT = F.grand / 2 - 12; // alésage du raccord de tête
  const pl0 = H - hT + 0.18 * D, pl1 = pl0 + D * PROP.platsLong;
  const fil = D * PROP.driverFilet;
  const profil = [
    // Face du bas du fourreau (bout fileté femelle qui reçoit le driver sub)
    [ri + 3, 0, { z: 'acier' }], [R - 2.5, 0], [R, 2.5, { lisse: true }],
    [R, 25, { z: 'fourreau' }],
    // Joint fourreau / raccord de tête : léger gradin
    [R, H - hT, { z: 'tete' }], [R - 1.5, H - hT], [R - 1.5, pl0],
    [R - 1.5, pl0, { m: 'plats' }], [R - 1.5, pl1, { m: 'plats' }], [R - 1.5, pl1],
    [R - 1.5, H - 4, { lisse: true }],
    ...boutMale(H, R - 1.5, M.filet, aT),
    [aT, H - 0.6 * D, { z: 'interieur' }],
    // Fond de l'alésage du raccord de tête, puis cylindre du fourreau vu par le bas jusqu'au cylindre
    // intérieur (pièces internes non modélisées : la masse du modèle est plus faible que la masse publiée).
    [0, H - 0.6 * D], [0, H - 0.6 * D - 20], [ri - 3, H - 0.6 * D - 20], [ri, H - 0.6 * D - 23],
    [ri, fil + 6, { z: 'filet' }],
    ...filet(ri, fil + 6, ri + 0.5, 8, 6, 2.2, true),
    [ri + 0.5, 8], [ri + 3, 0],
  ];
  return tour(profil, { seg: 72, mods: { plats: meplats(2, D * PROP.platsEntre) } });
}

/** Dimensions dérivées d'un marteau (queue de bit, driver sub). */
export function cotesMarteau(taille) {
  const M = MARTEAUX[taille], D = M.d;
  const queue = D * PROP.queue;
  return {
    D, queue,
    queueLong: 2.7 * queue,
    driverLong: D * (PROP.driverVisible + PROP.driverFilet),
    driverVisible: D * PROP.driverVisible,
    driverFilet: D * PROP.driverFilet,
    alesage: D * PROP.alesage,
    cou: queue - 10, // gorge des anneaux de retenue
    anneauHaut: 0.32 * queue,
  };
}

/** Driver sub (douille d'entraînement) : filet mâle en haut, cannelures intérieures ; origine en bas. */
export function driverSub(taille) {
  const M = MARTEAUX[taille], c = cotesMarteau(taille);
  const R = c.D / 2 - 1.5, rf = c.alesage / 2, ri = c.queue / 2 + 0.8;
  const L = c.driverLong, V = c.driverVisible;
  const profil = [
    [ri + 3, 0, { z: 'acier' }], [R - 3, 0], [R, 3, { lisse: true }], [R, V - 6], [R - 3, V],
    [rf - 0.3, V, { z: 'filet' }],
    ...filet(rf - 0.3, V + 4, rf - 0.3, L - 6, 6, 2.2),
    [rf - 2.5, L], [ri + 3, L, { z: 'acier' }], [ri, L - 3],
    [ri, L - 3, { m: 'cann', z: 'interieur' }], [ri, 3, { m: 'cann' }], [ri, 3],
  ];
  return tour(profil, { seg: 96, mods: { cann: cannelures(M.cannelures, 0.08 * c.queue, true) }, ferme: true });
}

/** Saver sub : filet mâle en haut (vers la tête de rotation), six pans, collet, bout femelle en bas. */
export function saverSub(i) {
  const S = SAVER_SUBS[i], R = S.corps / 2, F = API_REG[S.filet];
  const ra = F.grand / 2 - 14;
  const yHex0 = 120, yHex1 = 185, yCol = 205;
  const profil = [
    [F.grand / 2 + 4.1, 0, { z: 'acier' }], [R - 3, 0], [R, 3, { lisse: true }], [R, yHex0 - 8],
    [S.hex / Math.cos(Math.PI / 6) / 2, yHex0], [S.hex / Math.cos(Math.PI / 6) / 2, yHex0, { m: 'hex' }], [S.hex / Math.cos(Math.PI / 6) / 2, yHex1, { m: 'hex' }],
    [R + 12, yHex1 + 4], [R + 12, yCol], [R + 6, yCol + 6],
    ...boutMale(yCol + 6, R + 6, S.filet, ra),
    [ra, F.long + 30],
    ...boutFemelle(0, S.filet, ra),
  ];
  return tour(profil, { seg: 96, mods: { hex: meplats(6, S.hex) } });
}

/** Paire d'anneaux de retenue (deux demi-anneaux jaunes, fendus) à monter sur le cou de la queue du bit. */
export function anneaux(taille) {
  const c = cotesMarteau(taille);
  const ri = c.cou / 2 + 0.3, re = c.queue / 2 + 3, h = c.anneauHaut;
  const demi = (sens) => {
    // Demi-anneau : profil tourné sur 180° moins le jeu de la fente.
    const jeu = 0.035;
    const t0 = sens > 0 ? jeu : Math.PI + jeu, t1 = t0 + Math.PI - 2 * jeu;
    const out = tourPartiel([[ri, 0], [re - 1.5, 0], [re, 1.5], [re, h - 1.5], [re - 1.5, h], [ri, h], [ri, 0]], t0, t1, 'anneau');
    return out;
  };
  return { gauche: demi(1), droite: demi(-1), h, re };
}

/** Révolution partielle d'un profil fermé (de t0 à t1) avec ses deux faces de coupe. */
function tourPartiel(profil, t0, t1, zone, seg = 40) {
  const s = { zone, pos: [], nor: [], uv: [], idx: [], wear: [] };
  const n = profil.length;
  let L = 0;
  for (let i = 0; i < n - 1; i++) {
    const [ra, ya] = profil[i], [rb, yb] = profil[i + 1];
    const d = norm2([rb - ra, yb - ya]), nr = d[1], ny = -d[0];
    const base = s.pos.length / 3;
    const l = Math.hypot(rb - ra, yb - ya);
    for (const [r, y, v] of [[ra, ya, L], [rb, yb, L + l]]) {
      for (let k = 0; k <= seg; k++) {
        const t = t0 + ((t1 - t0) * k) / seg;
        s.pos.push(r * Math.sin(t) * MM, y * MM, r * Math.cos(t) * MM);
        s.nor.push(nr * Math.sin(t), ny, nr * Math.cos(t));
        s.uv.push((t * r) / TUILE, v / TUILE); s.wear.push(0.3);
      }
    }
    L += l;
    for (let k = 0; k < seg; k++) {
      const a = base + k, b = a + 1, c = a + seg + 2, d = a + seg + 1;
      s.idx.push(a, c, d, a, b, c);
    }
  }
  // Faces de coupe (profil plan, polygone convexe ou presque : éventail).
  for (const [t, sg] of [[t0, -1], [t1, 1]]) {
    const nn = [sg * Math.cos(t), 0, -sg * Math.sin(t)];
    const base = s.pos.length / 3;
    for (const [r, y] of profil.slice(0, -1)) {
      s.pos.push(r * Math.sin(t) * MM, y * MM, r * Math.cos(t) * MM); s.nor.push(...nn);
      s.uv.push(r / TUILE, y / TUILE); s.wear.push(0.8);
    }
    for (let k = 1; k < n - 2; k++) sg > 0 ? s.idx.push(base, base + k, base + k + 1) : s.idx.push(base, base + k + 1, base + k);
  }
  return [s];
}

/** Dimensions dérivées d'un bit. */
export function cotesBit(b) {
  const c = cotesMarteau(b.marteau);
  const D = b.d, R = D / 2;
  const tete = Math.max(80, 0.42 * D + 50); // hauteur de la tête (supposée)
  const bg = Math.max(11, Math.min(19, 0.12 * D)); // Ø des boutons de calibre
  const bf = bg * 0.9; // Ø des boutons de face
  return { ...c, D, R, tete, bg, bf, chanfrein: Math.min(0.11 * D, 20) };
}

/**
 * Bit à boutons : tête (face plate à chanfrein de calibre, rainures d'évacuation), queue cannelée,
 * cou des anneaux de retenue, tête de queue, tube de pied en plastique blanc. Origine : face de coupe
 * en bas (y = 0 au sommet des boutons de face), queue vers le haut (bit tel qu'on le pose dans le casse-bit).
 */
export function bit(b) {
  const c = cotesBit(b), M = MARTEAUX[b.marteau];
  const R = c.R, rq = c.queue / 2, ch = c.chanfrein;
  const y0 = 4; // face de la tête (les boutons dépassent jusqu'à y ≈ 0)
  const yT = y0 + c.tete; // dessus de la tête
  const yC = yT + 0.55 * c.queueLong; // fin des cannelures
  const yA0 = yC + 6, yA1 = yA0 + c.anneauHaut + 4; // cou des anneaux
  const yQ = yT + c.queueLong; // bout de la queue
  // Rainures d'évacuation des déblais : 2 à 4 gorges droites le long de la tête (supposées).
  const nRain = c.D < 125 ? 2 : c.D < 180 ? 3 : 4;
  const lRain = Math.max(16, 0.13 * c.D), pRain = Math.max(5, 0.045 * c.D);
  const ra = 0.22 * c.queue; // trou d'air central
  const profil = [
    // Face (bas), du trou central vers l'extérieur, chanfrein de calibre, flanc de tête
    [ra, y0, { z: 'bit' }], [R - ch * 1.4, y0], [R - 1, y0 + ch, { lisse: false }], [R, y0 + ch + 2],
    [R, y0 + ch + 2, { m: 'rain' }], [R, yT - 18, { m: 'rain' }],
    [R - 6, yT - 6, { m: 'rain' }], [R - 6, yT - 6],
    [rq + 10, yT], [rq, yT + 6],
    // Queue cannelée
    [rq, yT + 10, { m: 'cann', z: 'queue' }], [rq, yC, { m: 'cann' }], [rq, yC],
    [c.cou / 2, yA0], [c.cou / 2, yA1], [rq - 1, yA1 + 3, { lisse: true }], [rq - 1, yQ - 4], [rq - 4, yQ],
    [ra + 6, yQ, { z: 'interieur' }], [ra, yQ - 6], [ra, y0 + 20], [ra, y0],
  ];
  const corps = tour(profil, { seg: 96, mods: { rain: rainures(nRain, pRain, lRain / R), cann: cannelures(M.cannelures, 0.06 * c.queue) }, ferme: true });
  // Boutons : rangée de calibre sur le chanfrein, rangées de face.
  const boutons = [];
  const nG = Math.max(6, Math.round((Math.PI * c.D * 0.8) / (c.bg * 2.1)));
  const angG = (35 * Math.PI) / 180; // normale des boutons de calibre, inclinée vers l'extérieur
  for (let k = 0; k < nG; k++) {
    const t = ((k + 0.5) / nG) * Math.PI * 2;
    const rr = R - ch * 0.55;
    boutons.push(...calotte(c.bg / 2, c.bg * 0.36, [rr * Math.sin(t), y0 + ch * 0.45, rr * Math.cos(t)], [Math.sin(angG) * Math.sin(t), -Math.cos(angG), Math.sin(angG) * Math.cos(t)]));
  }
  let rr = R - ch * 1.4 - c.bf * 0.9;
  let rang = 0;
  while (rr > ra + c.bf * 0.8) {
    const n = Math.max(3, Math.floor((2 * Math.PI * rr) / (c.bf * 2.3)));
    for (let k = 0; k < n; k++) {
      const t = ((k + (rang % 2) * 0.5) / n) * Math.PI * 2;
      boutons.push(...calotte(c.bf / 2, c.bf * 0.38, [rr * Math.sin(t), y0, rr * Math.cos(t)], [0, -1, 0]));
    }
    rr -= c.bf * 1.6;
    rang++;
  }
  // Trous de soufflage sur la face : disques sombres affleurants.
  const trous = [];
  for (let k = 0; k < 2; k++) {
    const t = (k + 0.25) * Math.PI, rt = ra + (R - ch * 1.4 - ra) * 0.45;
    trous.push(...calotte(0.07 * c.D, 0.2, [rt * Math.sin(t), y0, rt * Math.cos(t)], [0, -1, 0], 'interieur', 12, 1));
  }
  // Tube de pied (foot valve), plastique blanc, dans le haut de la queue.
  const ht = 0.32 * c.queue, rv = ra - 0.5; // dépasse de la queue (photo de PRO-OP-ITH-001)
  const tv = tour([[rv - 3.5, yQ - 10, { z: 'plastique' }], [rv, yQ - 10], [rv, yQ + ht - 1.5], [rv - 1.5, yQ + ht], [rv - 3.5, yQ + ht], [rv - 3.5, yQ - 10]], { seg: 32, ferme: true });
  return { corps, boutons: fusion(boutons, trous), tube: tv.surfaces, cotes: { ...c, yT, yC, yA0, yA1, yQ } };
}

/** Casse-bit : cuvette octogonale qui tient la tête du bit, sur un fût qui entre dans la slip plate. */
export function casseBit(i) {
  const C = CASSE_BITS[i];
  const rf = C.fut / 2, ro = C.oct / Math.cos(Math.PI / 8) / 2, rp = C.bit / 2 + 4;
  const H = C.futLong + C.octHaut;
  const profil = [
    [0, 0, { z: 'casse' }], [rf - 5, 0], [rf, 5, { lisse: true }], [rf, C.futLong - 10], [rf + 10, C.futLong],
    [ro, C.futLong], [ro, C.futLong, { m: 'oct' }], [ro, H - 4, { m: 'oct' }], [ro - 4, H, { m: 'oct' }],
    [rp + 4, H], [rp, H - 4], [rp, H - C.poche + 6], [rp - 6, H - C.poche],
    [0, H - C.poche],
  ];
  const corps = tour(profil, { seg: 64, mods: { oct: meplats(8, C.oct, Math.PI / 8) } });
  // Ergots dans la poche : prennent les rainures d'évacuation du bit (4, supposés).
  const ergots = [];
  for (let k = 0; k < 4; k++) {
    const t = (k / 4) * Math.PI * 2;
    ergots.push(...placer(boite(24, C.poche - 10, 18, [0, H - C.poche + (C.poche - 10) / 2, rp - 7], 'casse'), { rot: rot('y', t) }));
  }
  return { corps, ergots, H };
}

// ------------------------------------------------------------------ chariot

/** Chariot à marteau : cadre (montants, traverses, berceau, poignées), pied, roues, chaîne de sûreté. */
export function chariot() {
  const C = CHARIOT, rt = C.tube / 2;
  const xm = C.entraxe / 2, zb = -C.recul; // montants derrière le marteau (axe du marteau en x = z = 0)
  const cadre = [];
  // Montants : du pied (penché vers l'arrière) aux poignées recourbées.
  for (const sx of [-1, 1]) {
    const x = sx * xm;
    const chemin = [
      [x * 0.62, 10, zb + 95], [x * 0.75, 60, zb + 40], [x, 160, zb + 5], [x, 420, zb], [x, 900, zb], [x, C.haut - 150, zb - 10],
      [x * 0.97, C.haut - 70, zb - 35], [x * 0.93, C.haut - 20, zb - 80], [x * 0.9, C.haut, zb - 125],
    ];
    cadre.push(...balayage(chemin, rt, { zone: 'rouge', radial: 14 }));
  }
  // Traverses (droites) et berceau cintré autour du marteau à la hauteur de la chaîne.
  for (const y of [300, 520, 860]) cadre.push(...balayage([[-xm, y, zb], [xm, y, zb]], rt * 0.75, { zone: 'rouge' }));
  for (const [y, R] of [[C.chaine.haut - 10, 95]]) {
    const arc = [];
    for (let k = 0; k <= 16; k++) {
      const a = Math.PI + (k / 16) * Math.PI; // demi-cercle arrière du marteau
      arc.push([R * Math.cos(a), y, R * Math.sin(a) * 0.9]);
    }
    cadre.push(...balayage([[-xm, y, zb], [-R, y, -40], ...arc.slice(1, -1).filter((p) => p[2] < -40), [R, y, -40], [xm, y, zb]], rt * 0.7, { zone: 'rouge' }));
    // Pattes de la chaîne (oreilles soudées en bout du berceau).
    cadre.push(...boite(8, 40, 30, [-R - 6, y, 10], 'rouge'), ...boite(8, 40, 30, [R + 6, y, 10], 'rouge'));
  }
  // Pied (plaque relevée vers l'arrière) et goussets.
  cadre.push(...boite(C.pied.larg, C.pied.ep, C.pied.prof, [0, C.pied.ep / 2, -C.pied.prof / 2 + 95], 'rouge'));
  cadre.push(...boite(C.pied.larg - 60, 60, C.pied.ep, [0, 30, zb + 100], 'rouge'));
  // Essieu
  cadre.push(...balayage([[-xm - 55, C.essieu, zb - 30], [xm + 55, C.essieu, zb - 30]], 10, { zone: 'acier-chariot', radial: 12 }));
  for (const sx of [-1, 1]) cadre.push(...balayage([[sx * xm, 250, zb], [sx * xm, C.essieu + 15, zb - 28]], rt * 0.7, { zone: 'rouge' }));
  // Poignées gainées de caoutchouc gris.
  const poignees = [];
  for (const sx of [-1, 1]) {
    const x = sx * xm;
    poignees.push(fusion(balayage([[x * 0.93, C.haut - 22, zb - 80], [x * 0.9, C.haut + 2, zb - 128]], rt + 3, { zone: 'gaine', radial: 14 })));
  }
  // Roues : pneu, jante rouge, moyeu.
  const roues = [];
  for (const sx of [-1, 1]) {
    const roue = [];
    const W = C.roue.larg, Rr = C.roue.d / 2;
    const pneu = tour([
      [Rr - 45, -W / 2 + 6, { z: 'pneu' }], [Rr - 20, -W / 2], [Rr - 6, -W / 2 + 4, { lisse: true }], [Rr, -W / 2 + 16, { lisse: true }],
      [Rr, W / 2 - 16, { lisse: true }], [Rr - 6, W / 2 - 4, { lisse: true }], [Rr - 20, W / 2], [Rr - 45, W / 2 - 6],
      [Rr - 45, W / 2 - 14, { z: 'rouge' }], [C.roue.moyeu / 2, W / 2 - 18], [C.roue.moyeu / 2 - 10, W / 2 - 4, { z: 'acier-chariot' }], [12, W / 2 - 4],
      [12, -W / 2 + 4], [C.roue.moyeu / 2 - 10, -W / 2 + 4, { z: 'rouge' }], [C.roue.moyeu / 2, -W / 2 + 18], [Rr - 45, -W / 2 + 14],
    ], { seg: 48, ferme: true });
    roue.push(...placer(tuileUV(pneu.surfaces, Math.PI * C.roue.d), { rot: rot('z', -Math.PI / 2), t: [sx * (xm + 55 + W / 2 - 10), C.essieu, zb - 30] }));
    roues.push(fusion(roue));
  }
  // Chaîne de sûreté : passe devant le marteau, d'une patte à l'autre, et pend du côté droit.
  const chaine = [];
  const ch = C.chaine;
  const pts = [];
  const Rch = 82; // le tour avant du marteau de 6 po (Ø 142) avec du mou
  for (let k = 0; k <= 40; k++) {
    const a = (k / 40) * Math.PI;
    pts.push([-(Rch + 22) * Math.cos(a), ch.haut - 28 * Math.sin(a), 10 + Rch * 1.05 * Math.sin(a)]);
  }
  for (let k = 1; k <= 12; k++) pts.push([Rch + 30 + 6 * Math.sin(k / 3), ch.haut - k * 14, 12 - k]);
  chaine.push(...mailles(pts, ch.maille, ch.fil));
  return { cadre: fusion(cadre), poignees, roues, chaine: fusion(chaine) };
}

/** Passe les UV d'une pièce tournée (u 0..1 autour) en tuiles : circonférence `circ` en mm. */
function tuileUV(surfaces, circ) {
  return surfaces.map((s) => ({ ...s, uv: s.uv.map((x, i) => (i % 2 ? x * 0.3 : x * circ) / TUILE) }));
}

/** Mailles de chaîne le long d'un chemin (mm) : longueur intérieure `maille`, fil de Ø `fil`, alternées à 90°. */
export function mailles(chemin, maille, fil) {
  // Points régulièrement espacés d'un pas de maille.
  const pas = maille - fil * 0.4;
  const out = [];
  const longs = [0];
  for (let i = 1; i < chemin.length; i++) longs.push(longs[i - 1] + Math.hypot(...[0, 1, 2].map((j) => chemin[i][j] - chemin[i - 1][j])));
  const at = (l) => {
    let i = 1; while (i < chemin.length - 1 && longs[i] < l) i++;
    const t = (l - longs[i - 1]) / (longs[i] - longs[i - 1] || 1);
    return [0, 1, 2].map((j) => chemin[i - 1][j] + (chemin[i][j] - chemin[i - 1][j]) * t);
  };
  const L = longs[longs.length - 1];
  const w = fil * 2.6; // largeur intérieure + fil
  for (let k = 0, l = pas / 2; l < L - pas / 2; k++, l += pas) {
    const c = at(l), a = at(Math.max(0, l - 1)), b = at(Math.min(L, l + 1));
    const T = norm3(sub(b, a));
    let up = Math.abs(T[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let U = norm3(cross(T, up));
    if (k % 2) U = cross(T, U);
    // Maille en stade : deux demi-cercles et deux droites, dans le plan (T, U).
    const r0 = (w - fil) / 2, h = (maille - (w - fil)) / 2 + fil * 0.2;
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const a2 = (i / 24) * Math.PI * 2;
      const sx = Math.cos(a2) >= 0 ? 1 : -1;
      const p = [r0 * Math.sin(a2), h * sx + r0 * Math.cos(a2)];
      pts.push([0, 1, 2].map((j) => c[j] + U[j] * p[0] + T[j] * p[1]));
    }
    out.push(...balayage(pts, fil / 2, { zone: 'chaine', radial: 8, ferme: true }));
  }
  return out;
}

// ------------------------------------------------------------------ contrôles

/** Volume (m³) fermé d'un ensemble de surfaces (somme des tétraèdres signés). */
export function volume(surfaces) {
  let v = 0;
  for (const s of surfaces) {
    const p = s.pos;
    for (let i = 0; i < s.idx.length; i += 3) {
      const a = s.idx[i] * 3, b = s.idx[i + 1] * 3, c = s.idx[i + 2] * 3;
      v += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
    }
  }
  return v;
}

/** Boîte englobante (m) d'un ensemble de surfaces. */
export function boiteEnglobante(surfaces) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const s of surfaces) for (let i = 0; i < s.pos.length; i++) { mn[i % 3] = Math.min(mn[i % 3], s.pos[i]); mx[i % 3] = Math.max(mx[i % 3], s.pos[i]); }
  return { min: mn, max: mx, taille: mx.map((x, i) => x - mn[i]) };
}
