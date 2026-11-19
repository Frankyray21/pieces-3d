// Pièces de l'ensemble P002 (page 2) qui n'ont pas de page propre dans le manuel — lot A (structure).
// Hors du motif Pxxx.js : ce fichier n'est pas un builder d'assemblage ; la vue d'ensemble P002 (intégration)
// appelle `ensemblePieces(api)` puis pose chaque objet renvoyé avec son repère de la liste de P002, par exemple :
//   const E = ensemblePieces(api);
//   for (const [ref, objs] of Object.entries(E)) objs.forEach((o, i) => api.part(ref, o, eclate(ref, i)));
//
// Contrat : chaque fonction construit ses objets dans le REPÈRE FOREUSE (layout.js), pose de référence (mât à 0°,
// mât rentré), et renvoie un tableau d'objets (un par exemplaire, dans l'ordre des côtés −Z puis +Z) ; aucun appel
// à api.part ici. Les objets sont déjà à leur place : P002 les ajoute tels quels (pas de pose à appliquer).
//   '1'  bloc I/O MA618 (BLOC_IO)              '8'  pattes d'extension ×2 (PATTE)
//   '9'  plaque d'ancrage MA617 (ANCRAGE)      '12' vérins de tilt HBU3532 ×2 (TILT.cylFrame → TILT.cylAssise)
//   '13' frame skud FA601 (SKID, TILT)         '15' pins GA608 ×2 (TILT.cylFrame)
// Sources : couverture (page 1) et vue éclatée (page 2) seulement ; cotes estimées de layout.js, le reste [estimé]
// en ligne. Les appuis correspondants sont modélisés dans les autres fichiers du lot : tourillons, bushings et chapes
// de vérin de l'assise (P003), oreilles des pattes sous la plaque de pied du mât (P004).
import { IN, SKID, TILT, PATTE, ANCRAGE, BLOC_IO, ASSISE } from '../layout.js';
import { rect, arc, hull, circle, band, profilX, profilZ, boxAt, verin, headPin } from './_structure.js';

// Frame skud : traverses (dessus = SKID.top, appui du treuil), parois de côté (« DR FAB » découpé, couverture),
// consoles des split-blocs sous les tourillons de l'assise. [estimé]
const XMEM = [1.15, 0.55, -0.1, -0.6, TILT.cylFrame[0]]; // traverses (la dernière porte les chapes des vérins de tilt)
const WALL = { z: 0.2475, t: 0.015, top: 0.58 }; // parois de côté (sous l'assise : dessous à 0,62 m)
const BLOCK = { z: [0.312, 0.36], y0: 0.6, cap: 0.775, hw: [0.06, 0.035] }; // split-blocs (avant, arrière ; l'arrière, étroit,
// laisse passer le vérin de tilt devant lui et le treuil P014 derrière son flanc avant)
const EAR = 0.5 * IN; // tôles des chapes [estimé]

/** Lettres pochoir « DR » et « FAB » (polygones de découpe) dans le plan (u vers la droite, v vers le haut). */
function lettres(h) {
  const e = h * 0.2, g = h * 0.06; // épaisseur du trait, pont du pochoir
  const R = (u0, v0, u1, v1) => rect(u0, v0, u1, v1);
  const bowl = (u0, v0, v1) => { const r = (v1 - v0) / 2; return band(arc([u0, v0 + r], r - e / 2, -Math.PI / 2, Math.PI / 2, 10), e); };
  const diag = (a, b) => { const n = [b[1] - a[1], -(b[0] - a[0])], L = Math.hypot(...n); const o = [n[0] / L * e / 2, n[1] / L * e / 2]; return [[a[0] - o[0], a[1] - o[1]], [a[0] + o[0], a[1] + o[1]], [b[0] + o[0], b[1] + o[1]], [b[0] - o[0], b[1] - o[1]]]; };
  const w = h * 0.62;
  return {
    D: (u) => [R(u, 0, u + e, h), bowl(u + e + g, 0, h)],
    R: (u) => [R(u, 0, u + e, h), bowl(u + e + g, h * 0.45, h), diag([u + e + g + h * 0.05, h * 0.42], [u + w, 0])],
    F: (u) => [R(u, 0, u + e, h), R(u + e + g, h - e, u + w, h), R(u + e + g, h * 0.45, u + w * 0.85, h * 0.45 + e)],
    A: (u) => [diag([u + e / 2, 0], [u + w / 2 - g, h]), diag([u + w / 2 + g, h], [u + w - e / 2, 0]), R(u + w * 0.3, h * 0.3, u + w * 0.7, h * 0.3 + e)],
    B: (u) => [R(u, 0, u + e, h), bowl(u + e + g, h * 0.5 + g / 2, h), bowl(u + e + g, 0, h * 0.5 - g / 2)],
    w,
  };
}

/** 13 — Frame skud FA601 (un objet). */
export function frameSkud(api) {
  const S = api.S;
  const { at, cyl } = S;
  const f = [];
  const tipY = 0.09; // relevé des skis [mesure couverture]
  for (const s of [-1, 1]) {
    const zc = s * SKID.railZ;
    // Patin : tube 4 × 6 po sur un ski de 1/2 po relevé aux deux bouts, trou d'élingage dans chaque pointe.
    f.push(profilZ(api, [[-1.3, SKID.top], [1.3, SKID.top], [1.3, 0.075], [1.22, 0.0127], [-1.22, 0.0127], [-1.3, 0.075]], [], SKID.railW, zc));
    f.push(profilZ(api, band([[-SKID.x1, tipY], [-1.22, 0], [1.22, 0], [SKID.x1, tipY]], 0.0127), [], SKID.railW + 0.04, zc));
    for (const u of [-1, 1]) f.push(at(cyl(0.018, 0.004, 'black', { seg: 20 }), [u * 1.37, 0.0127 + tipY * (0.15 / 0.23) + 0.001, zc], [0, 0, -u * Math.atan2(tipY, 0.23)]));
    // Oreilles de remorquage (arrière) et d'ancrage (avant) sur les patins.
    f.push(profilZ(api, hull([[-1.3, SKID.top], [-1.02, SKID.top], ...circle([-1.24, 0.3], 0.05, 20)]), [[-1.24, 0.3, 0.03]], 1.0 * IN, zc));
    f.push(profilZ(api, hull([[1.02, SKID.top], [1.3, SKID.top], ...circle([1.24, 0.27], 0.045, 20)]), [[1.24, 0.27, 0.025]], 1.0 * IN, zc));
    // Parois de côté avant (« DR FAB » en pochoir, ouverture basse) et arrière.
    const L = lettres(0.1), L2 = lettres(0.075);
    const text = (word, Lx, u0, v0, x0) => {
      const out = [];
      let u = u0;
      for (const c of word) { out.push(...Lx[c](u).map((poly) => poly.map(([a, b]) => [x0 + s * a, v0 + b]))); u += Lx.w + 0.02; }
      return out.map((poly) => (s < 0 ? poly : [...poly].reverse()));
    };
    const xc = 0.7; // milieu du texte
    const holes = [
      ...text('DR', L, -(2 * L.w + 0.02) / 2, 0.38, xc),
      ...text('FAB', L2, -(3 * L2.w + 0.04) / 2, 0.27, xc),
      rect(0.5, 0.18, 0.95, 0.235).reverse(),
    ];
    f.push(profilZ(api, [[0.3, SKID.top], [1.05, SKID.top], [1.05, 0.5], [0.7, WALL.top], [0.4, WALL.top], [0.3, 0.46]], holes, WALL.t, s * WALL.z));
    f.push(profilZ(api, [[-1.02, SKID.top], [-0.78, SKID.top], [-0.78, WALL.top], [-1.02, WALL.top]], [[-0.9, 0.34, 0.05]], WALL.t, s * WALL.z)); // arrière : s'arrête devant le treuil
    // Consoles et split-blocs (moitié basse soudée, chapeau à quatre vis 1/2-13) sous les tourillons de l'assise.
    TILT.x.forEach((tx, k) => {
      const hw = BLOCK.hw[k], [z0, z1] = BLOCK.z, R = 1.25 * IN; // alésage : diamètre extérieur du bushing C4038
      f.push(boxAt(api, [tx - hw, WALL.top, s * WALL.z], [tx + hw, BLOCK.y0, s * z1]));
      f.push(profilX(api, [[s * (WALL.z + WALL.t / 2), WALL.top], [s * z1, WALL.top], [s * (WALL.z + WALL.t / 2), 0.43]].map(([z, y]) => [z, y]), [], 0.015, tx));
      const lo = [[tx - hw, BLOCK.y0], [tx + hw, BLOCK.y0], [tx + hw, TILT.y], ...arc([tx, TILT.y], R, 0, -Math.PI, 16).slice(1, -1), [tx - hw, TILT.y]];
      const hi = [[tx - hw, TILT.y + 0.001], ...arc([tx, TILT.y], R, Math.PI, 0, 16).slice(1, -1), [tx + hw, TILT.y + 0.001], [tx + hw, BLOCK.cap], [tx - hw, BLOCK.cap]];
      f.push(profilZ(api, lo, [], z1 - z0, s * (z0 + z1) / 2));
      f.push(profilZ(api, hi, [], z1 - z0, s * (z0 + z1) / 2, 'darkSteel'));
      f.push(S.boltSet([-1, 1].flatMap((u) => [z0 + 0.012, z1 - 0.012].map((z) => [tx + u * (hw - 0.016), BLOCK.cap, s * z])), 0.5 * IN, 0.1, 'zinc'));
    });
    // Chape du fond du vérin de tilt sur la traverse arrière (deux tôles, pin GA608).
    const [cx, cy] = TILT.cylFrame;
    for (const d of [-1, 1]) {
      f.push(profilZ(api, hull([[cx - 0.06, SKID.top], [cx + 0.06, SKID.top], ...circle([cx, cy], 0.035, 18)]), [[cx, cy, 0.625 * IN + 0.0005]], EAR, s * (TILT.cylZ + d * 0.0255)));
    }
  }
  // Traverses (tubes 4 × 4 po) entre les patins.
  const zi = SKID.railZ - SKID.railW / 2;
  for (const x of XMEM) f.push(boxAt(api, [x - 0.05, 0.05, -zi], [x + 0.05, SKID.top, zi], 'red', 0.004));
  return [S.group(...f)];
}

/** 1 — Bloc I/O MA618 : bloc de raccordement sur console, six raccords vers −Z, plaque d'identification. */
export function blocIO(api) {
  const S = api.S;
  const [x, y, z] = BLOC_IO.pos;
  const zs = -ASSISE.w / 2; // face de la tôle de côté de l'assise
  const g = [
    boxAt(api, [x - 0.08, y - 0.08, zs - 0.006], [x + 0.08, y + 0.06, zs - 0.0005], 'red'),
    boxAt(api, [x - 0.06, y - 0.045, z - 0.03], [x + 0.06, y - 0.035, zs - 0.006], 'red'),
    boxAt(api, [x - 0.055, y - 0.035, z - 0.03], [x + 0.055, y + 0.045, zs - 0.006], 'castAlu', 0.003),
  ];
  for (const dx of [-0.035, 0, 0.035]) for (const dy of [-0.012, 0.025]) {
    g.push(S.at(S.nut(0.022, 0.01, 'steel', { axis: 'z' }), [x + dx, y + dy, z - 0.035]));
    g.push(S.at(S.cyl(0.0075, 0.02, 'steel', { axis: 'z', seg: 12 }), [x + dx, y + dy, z - 0.05]));
  }
  g.push(S.at(S.nameplate(0.09, 0.045), [x, y - 0.055, zs - 0.0065], [0, Math.PI, 0]));
  return [S.group(...g)];
}

/** Bouts des pattes (repère foreuse, plan XY) : œil haut (oreilles du mât) et œil bas (chape de la plaque d'ancrage). */
export const PATTE_EYES = { top: PATTE.top, foot: [PATTE.foot[0], ANCRAGE.t + 0.04] };

/** 8 — Pattes d'extension (×2, côtés −Z puis +Z) : tube extérieur, tube intérieur percé de réglage, broche, yeux. */
export function pattesExtension(api) {
  const S = api.S;
  const { top: T, foot: F } = PATTE_EYES;
  const L = Math.hypot(F[0] - T[0], F[1] - T[1]), d = [(F[0] - T[0]) / L, (F[1] - T[1]) / L];
  const p = (s) => [T[0] + d[0] * s, T[1] + d[1] * s];
  return [-1, 1].map((sz) => {
    const z = sz * PATTE.z, g = [];
    const seg = (a, b, r, mat) => { const A = p(a), B = p(b); return S.rod([A[0], A[1], z], [B[0], B[1], z], r, mat, 20); };
    g.push(seg(0.03, 0.5, 0.03, 'red'), seg(0.45, L - 0.03, 0.024, 'red'));
    g.push(S.at(S.ring(0.034, 0.0165, 0.04, 'red', { axis: 'z', seg: 24 }), [T[0], T[1], z]));
    g.push(S.at(S.ring(0.034, 0.0165, 0.04, 'red', { axis: 'z', seg: 24 }), [F[0], F[1], z]));
    g.push(seg(0.49, 0.53, 0.036, 'red')); // collet du tube extérieur
    const [bx, by] = p(0.515);
    g.push(S.at(S.cyl(0.008, 0.1, 'zinc', { axis: 'z', seg: 12 }), [bx, by, z])); // broche de réglage
    for (const s of [0.6, 0.66, 0.72]) { const [hx, hy] = p(s); g.push(S.at(S.cyl(0.0085, 0.0485, 'black', { axis: 'z', seg: 10 }), [hx, hy, z])); }
    return S.group(...g);
  });
}

/** 9 — Plaque d'ancrage MA617 : plaque au sol en travers, quatre trous d'ancrage, chapes des pattes. */
export function plaqueAncrage(api) {
  const S = api.S;
  const [x, , ] = ANCRAGE.pos, t = ANCRAGE.t, F = PATTE_EYES.foot;
  const g = [S.at(S.plate(ANCRAGE.w, ANCRAGE.len, t, 'red', { r: 0.01, holes: [-0.38, -0.1, 0.1, 0.38].map((z) => [0, z, 0.014]) }), [x, t / 2, 0])];
  for (const s of [-1, 1]) for (const d of [-1, 1]) {
    g.push(profilZ(api, hull([[F[0] - 0.06, t], [F[0] + 0.06, t], ...circle(F, 0.034, 18)]), [[F[0], F[1], 0.0165]], EAR, s * (PATTE.z + d * 0.0255)));
  }
  return [S.group(...g)];
}

/** 12 — Vérins de tilt HBU3532 (×2, côtés −Z puis +Z) : fond sur la chape du frame, tige sur la chape de l'assise. */
export function verinsTilt(api) {
  return [-1, 1].map((s) => verin(api, TILT.cylFrame, TILT.cylAssise, s * TILT.cylZ, 3.5 * IN, { rodR: 0.875 * IN, rod: 0.35 }));
}

/** 15 — Pins GA608 (×2, côtés −Z puis +Z) : Ø 1 1/4 po dans la chape du frame, tête à l'extérieur, trou de goupille. */
export function pinsTilt(api) {
  const [cx, cy] = TILT.cylFrame, zo = TILT.cylZ + 0.0255 + EAR / 2;
  return [-1, 1].map((s) => api.S.at(headPin(api, TILT.cylPin / 2, 2 * (0.0255 + EAR / 2) + 0.008, 'steel', { headR: 0.022, headT: 0.008 }), [cx, cy, s * zo], [s * Math.PI / 2, 0, 0]));
}

/** Objets des repères de P002 sans page : { '1': [...], '8': [...], '9': [...], '12': [...], '13': [...], '15': [...] }. */
export function ensemblePieces(api) {
  return {
    '1': blocIO(api),
    '8': pattesExtension(api),
    '9': plaqueAncrage(api),
    '12': verinsTilt(api),
    '13': frameSkud(api),
    '15': pinsTilt(api),
  };
}

/** Éclatés proposés pour P002 (sens de la vue éclatée p. 2), par repère et rang de l'exemplaire (0 : −Z, 1 : +Z). */
export function eclate(ref, i = 0) {
  const s = i ? 1 : -1;
  switch (ref) {
    case '1': return [0.3, 0.6, -0.5];
    case '8': return [0.7, 0.35, s * 0.25];
    case '9': return [0.9, -0.05, 0];
    case '12': return [0.1, -0.25, s * 0.55];
    case '13': return [0, -0.7, 0];
    case '15': return [0.1, -0.3, s * 0.85];
    default: return null;
  }
}
