// Builders du plancher principal (PRO-DD-ST-003) : structure de base et
// recouvrement des deux sections, cage de bois, marches, garde-corps,
// plancher secondaire. Toutes les pièces sont posées dans le repère de
// plan.js, si bien qu'un sous-assemblage s'insère tel quel dans la vue
// d'ensemble. Chaque objet porte userData.step (étape de la procédure).
import {
  IN, FT, B66, P3, P8, S24, R24, W, L, SEC, DECK, joistZ, GAL, JOINT_X, SUPPORTS_X, SLEEPERS_X,
  stack, ground, over12, deckHeight, STAIR, DRILL, WEDGE, plankX, TIGHT, d1, d2,
} from './plan.js';
import { lumber, between, wedge, lagScrews, placeStack, labeler } from './lumber.js';
import { wireMesh, groundPatch } from './site.js';

// Sous-assemblage vu seul : le sol de la galerie sous l'emprise (absent dans la vue d'ensemble).
function soil(api, opts, x0, x1, z0, z1) {
  if (!opts.inPlace) api.part('G', groundPatch(api.S, x0, x1, z0, z1), [0, 0, 0], { noLabel: true });
}

export const PER_SEC = Math.round(SEC / P8); // 24 planches de 3 × 8 sur 16 pi, par section
// Tire-fonds au-dessus du premier et du dernier madrier, planche i (numérotation des deux sections).
const ends = (i) => [joistZ[0], joistZ[joistZ.length - 1]].map((z) => [plankX(i), DECK, z]);

// ------------------------------------------------------------------ section 1

/** Structure de base, section 1 (16 × 16 pi), étapes 2 à 5 : madriers le long de la galerie. */
export function P04(api, opts = {}) {
  const S = api.S;
  soil(api, opts, -0.4, SEC + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  const labeled = new Set();
  // Madriers 6 × 6 de 16 pi : le premier sur la ligne de peinture (rive Z négative).
  joistZ.forEach((z, k) => {
    const j = lumber(S, [SEC, B66, B66], [SEC / 2, B66 / 2, z]);
    put(k === 0 ? '1' : '2', j, [0, 0.55, 0], k === 0 ? 3 : 4);
  });
  // Blocages et coins sous chaque madrier (au moins 6 par madrier), en sens contraire.
  for (const x of SUPPORTS_X) {
    for (const z of joistZ) {
      placeStack(api, stack(x, z, 0, 'z', { inFloor: true }), { refs: { b38: '3', b66: '4', crib: '4', wedge: '5' }, labeled, step: 5, explode: { wedge: [0, 0.28, 0], b38: [0, 0.12, 0] } });
    }
  }
  // Jonction (étape 5, p. 6 et 9) : sous le bout des madriers, un 6 × 6 de
  // 16 pi d'un seul bout, en travers (sous les planches), sur ses blocages
  // vis-à-vis chaque madrier ; il portera aussi les madriers de la section 2
  // qui les prolongent (c'est le « dernier 6 × 6 de la première section » de
  // l'étape 10). Les madriers y sont vissés.
  put('7', lumber(S, [B66, B66, W], [JOINT_X, -B66 / 2, 0]), [0, -0.3, 0], 5);
  for (const z of joistZ) {
    placeStack(api, stack(JOINT_X, z, -B66, 'x', { inFloor: true }), { labeled, step: 5, group: { ref: '6', explode: [0, -0.5, 0] } });
  }
  put('8', lagScrews(S, joistZ.map((z) => [JOINT_X - 1.5 * IN, B66, z])), [0, 0.6, 0], 5);
  return { view: { dir: [0.9, 0.75, 1.15] } };
}

/** Recouvrement en 3 × 8 de la section 1 (planches en travers de la galerie), étapes 6 à 8. */
export function P07(api, opts = {}) {
  const S = api.S;
  soil(api, opts, -0.4, SEC + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  for (let i = 0; i < PER_SEC; i++) {
    const join = i >= PER_SEC - 2; // deux planches laissées libres à la jonction, vissées à la fin (étape 8)
    const p = lumber(S, [P8, P3, W], [plankX(i), B66 + P3 / 2, 0]);
    p.userData.order = join ? i : d1(0) - i; // ordre de pose : de la jonction vers le front
    put(join ? '2' : '1', p, [0, join ? 0.75 : 0.45, 0], join ? 12 : 6, { seq: join ? 1 : 0 });
  }
  // Tire-fonds de la procédure seulement : première planche à chaque extrémité
  // (étape 6), planche vissée devant les coins pour retenir la tension (étape 7),
  // planches de jonction, de chaque bout (étape 8).
  put('3', lagScrews(S, ends(d1(0))), [0, 1.05, 0], 6, { seq: 0 });
  put('4', lagScrews(S, ends(d1(TIGHT))), [0, 1.05, 0], 7);
  put('5', lagScrews(S, [...ends(PER_SEC - 2), ...ends(PER_SEC - 1)]), [0, 1.2, 0], 12, { seq: 2 });
  return { view: { dir: [0.75, 1.0, 1.1] } };
}

// ------------------------------------------------------------------ variante : 6 × 6 de 8 pi

/**
 * Variante courante sur le chantier (pas décrite dans la procédure) : chaque
 * madrier de 16 pi de la section 1 fait de deux 6 × 6 de 8 pi bout à bout. Le
 * joint tombe toujours sur un blocage, jamais dans le vide.
 *   joint 'commun' : un blocage centré sous le joint, les deux bouts dessus ;
 *   joint 'double' : un blocage sous chaque bout, côte à côte.
 * Pas de doubleur aux joints des 8 pi : à la jonction des sections, seulement le bout de
 * 6 × 6 de 24 po le long des madriers de rive, comme dans la vidéo (P10, repère 8).
 * Retourne les madriers (deux par ligne) et la rangée d'appuis du joint.
 */
export const JOINT8_X = 8 * FT;
export function variante8(S, { joint = 'commun' } = {}) {
  const madriers = S.group();
  for (const z of joistZ) {
    madriers.add(lumber(S, [8 * FT, B66, B66], [4 * FT, B66 / 2, z]));
    madriers.add(lumber(S, [8 * FT, B66, B66], [12 * FT, B66 / 2, z], 'woodLight'));
  }
  const appuis = S.group();
  const xs = joint === 'double' ? [JOINT8_X - P8 / 2, JOINT8_X + P8 / 2] : [JOINT8_X];
  for (const x of xs) {
    for (const z of joistZ) {
      for (const p of stack(x, z, 0, 'z', { inFloor: true, block: true }).pieces) {
        appuis.add(p.kind === 'wedge' ? wedge(S, p) : lumber(S, p.size, p.pos, p.kind === 'crib' ? 'woodDark' : 'wood'));
      }
    }
  }
  return { madriers, appuis };
}

/**
 * Variante 8 pi, jonction des deux sections (plancher de 16 × 32 pi) : jonction doublée.
 * Le 6 × 6 de jonction en travers (16 pi d'un seul bout avec le bois de 16 pi) devient deux
 * rangées côte à côte, chacune de deux 6 × 6 de 8 pi bout à bout (joint au centre, sous le
 * madrier du milieu, sur son blocage). Les madriers de la section 1 reposent à plein sur la
 * première rangée, ceux de la section 2 sur la deuxième ; les blocages de jonction (24 po,
 * selon X) portent les deux rangées. Le bout de 6 × 6 de 24 po vissé dans les deux sections
 * reste seulement le long des madriers de rive (P10, repère 8).
 */
export function jonction8(S) {
  const g = S.group();
  [JOINT_X - B66 / 2, JOINT_X + B66 / 2].forEach((x, k) => {
    for (const z of [-4 * FT, 4 * FT]) g.add(lumber(S, [B66, B66, 8 * FT], [x, -B66 / 2, z], k ? 'woodLight' : 'wood'));
  });
  return g;
}

/**
 * Variante 8 pi aussi dans la section 2 : madriers en deux 6 × 6 de 8 pi, joint à 24 pi
 * (8 pi après la jonction) ; le soutien le plus proche est placé sous le joint, sur ses
 * blocages (le joint ne tombe jamais dans le vide). Les soutiens en travers (6 × 6 de 16 pi
 * dans la procédure) sont eux aussi faits de deux 8 pi bout à bout, joint au centre, sous le
 * madrier du milieu, sur son blocage.
 */
export const JOINT8_X2 = SEC + 8 * FT;
export const SLEEPER8_X = SLEEPERS_X.map((x) => (Math.abs(x - JOINT8_X2) < 0.2 ? JOINT8_X2 : x));
export function variante8Sec2(S) {
  const madriers = S.group();
  for (const z of joistZ) {
    madriers.add(lumber(S, [8 * FT, B66, B66], [SEC + 4 * FT, B66 / 2, z]));
    madriers.add(lumber(S, [8 * FT, B66, B66], [SEC + 12 * FT, B66 / 2, z], 'woodLight'));
  }
  const soutiens = S.group();
  for (const x of SLEEPER8_X) {
    soutiens.add(lumber(S, [B66, B66, 8 * FT], [x, -B66 / 2, -4 * FT]));
    soutiens.add(lumber(S, [B66, B66, 8 * FT], [x, -B66 / 2, 4 * FT], 'woodLight'));
  }
  // Blocages sous le soutien déplacé sous le joint (les autres restent en place).
  const appuis = S.group();
  for (const z of joistZ) {
    for (const p of stack(JOINT8_X2, z, -B66, 'x', { inFloor: true }).pieces) {
      appuis.add(p.kind === 'wedge' ? wedge(S, p) : lumber(S, p.size, p.pos, p.kind === 'crib' ? 'woodDark' : 'wood'));
    }
  }
  return { madriers, soutiens, appuis };
}

// ------------------------------------------------------------------ section 2

/**
 * Structure de base, section 2, étapes 9 à 11 : madrier guide à 16 pi de la
 * section 1, soutiens 6 × 6 de 16 pi en travers (sens contraire des madriers)
 * jusqu'à lui, puis madriers par-dessus, dans le prolongement de ceux de la
 * section 1.
 */
export function P10(api, opts = {}) {
  const S = api.S;
  soil(api, opts, SEC - 0.4, L + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  const labeled = new Set();
  // Madriers de la section 2 : bout à bout avec ceux de la section 1 (blocage de jonction).
  joistZ.forEach((z) => put('1', lumber(S, [SEC, B66, B66], [SEC * 1.5, B66 / 2, z]), [0, 0.75, 0], 11));
  // Chaque madrier vissé dans le bout de 6 × 6 de jonction, comme celui de la section 1.
  put('7', lagScrews(S, joistZ.map((z) => [JOINT_X + 1.5 * IN, B66, z])), [0, 0.9, 0], 11);
  // Blocage de jonction (p. 6) : un seul bout de 6 × 6 de 24 po, à l'intérieur contre le
  // madrier de rive de chaque côté, à cheval sur le joint, posé sur le 6 × 6 de jonction ;
  // son dessus arrive au ras des madriers, juste sous les planches. Vissé dans le madrier
  // de chaque section (un tire-fond de chaque côté du joint), il tient les deux sections ensemble.
  const half = 12 * IN;
  const sides = [-1, 1];
  const zin = W / 2 - B66; // face intérieure du madrier de rive
  sides.forEach((s) => put('8', lumber(S, [2 * half, B66, B66], [JOINT_X, B66 / 2, s * (zin - B66 / 2)]), [0, 0.6, 0], 11, { seq: 3 }));
  sides.forEach((s) => put('9', S.boltSet([[JOINT_X - 6 * IN, B66 / 2, s * (zin - B66)], [JOINT_X + 6 * IN, B66 / 2, s * (zin - B66)]], 0.375 * IN, 6 * IN, 'zinc', { axis: s > 0 ? '-z' : 'z', washer: true }), [0, 0.9, 0], 11, { seq: 4 }));
  // Soutiens 6 × 6 de 16 pi (selon Z) ; le dernier, à 16 pi de la section 1, est le madrier guide.
  SLEEPERS_X.forEach((x, k) => {
    const guide = k === SLEEPERS_X.length - 1;
    put('2', lumber(S, [B66, B66, W], [x, -B66 / 2, 0]), [0, 0.4, 0], 10, { seq: guide ? 0 : 2 });
  });
  // Blocages sous les soutiens, vis-à-vis chaque croisement de madrier (étape 11) ;
  // cage de bois dans le creux (cas spécial).
  for (const x of SLEEPERS_X) {
    for (const z of joistZ) {
      const st = stack(x, z, -B66, 'x', { inFloor: true });
      const crib = st.pieces.some((p) => p.kind === 'crib');
      if (crib) placeStack(api, st, { labeled, step: 11, group: { ref: '6', explode: [0, 0.1, 0.35] } });
      else placeStack(api, st, { refs: { b38: '3', b66: '4', wedge: '5' }, labeled, step: 10, seq: 1, explode: { wedge: [0, 0.22, 0], b38: [0, 0.1, 0] } });
    }
  }
  return { view: { dir: [-0.85, 0.7, 1.2] } };
}

/** Recouvrement de la section 2 (étape 12), de la jonction vers l'entrée, bouts au ras (étape 13). */
export function P13(api, opts = {}) {
  const S = api.S;
  soil(api, opts, SEC - 0.4, L + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  for (let i = 0; i < PER_SEC; i++) {
    const p = lumber(S, [P8, P3, W], [plankX(d2(i)), B66 + P3 / 2, 0]); // du bout côté galerie (arrivée du bois) vers la jonction
    p.userData.order = i;
    put('1', p, [0, 0.45, 0], 12);
  }
  // Étapes 6 et 7 répétées : première planche de la section, planche devant les coins.
  put('2', lagScrews(S, ends(d2(0))), [0, 1.05, 0], 12);
  put('3', lagScrews(S, ends(d2(TIGHT))), [0, 1.05, 0], 12);
  return { view: { dir: [-0.75, 1.0, 1.1] } };
}

// ------------------------------------------------------------------ cage

/** Cage de bois (étape 11, cas spéciaux) : 3 × 8 et 6 × 6 de 24 à 36 po empilés croisés. */
export function P12(api) {
  const S = api.S;
  const put = labeler(api);
  const len = 30 * IN;
  const off = len / 2 - B66 / 2;
  let y = 0;
  for (let i = 0; i < 4; i++) {
    const alongZ = i % 2 === 0;
    for (const s of [-1, 1]) {
      const size = alongZ ? [B66, B66, len] : [len, B66, B66];
      const pos = alongZ ? [s * off, y + B66 / 2, 0] : [0, y + B66 / 2, s * off];
      put('1', lumber(S, size, pos, 'woodDark'), [alongZ ? s * 0.12 : 0, i * 0.12, alongZ ? 0 : s * 0.12], 11);
    }
    y += B66;
  }
  put('2', lumber(S, [len, P3, P8], [0, y + P3 / 2, 0]), [0, 0.6, 0], 11);
  y += P3;
  put('3', wedge(S, { pos: [0, y, 0], along: 'x', pair: false, thick: WEDGE.t * 0.6 }), [0, 0.8, 0], 11);
  return { view: { dir: [1, 0.7, 1.3] } };
}

// ------------------------------------------------------------------ marches

export function stairPlan() {
  const zc = STAIR.z0 + STAIR.w / 2;
  const h = deckHeight(L + STAIR.tread, zc);
  // Marches ajustées à 9 po du plancher (p. 15) : un module = deux rangs de 3 × 8 et le
  // dessus, 9 po pile ; la dernière hauteur, depuis le sol, prend le reste (12 po au plus).
  const rise = 9 * IN;
  const treads = Math.max(1, Math.floor((h - P3) / rise));
  return { zc, h, n: treads + 1, rise };
}

/** Marches et mains courantes au bout du plancher, étapes 14 et 16. */
export function P14(api, opts = {}) {
  const S = api.S;
  soil(api, opts, L - 0.3, L + 1.6, STAIR.z0 - 0.4, STAIR.z0 + STAIR.w + 0.4);
  const put = labeler(api);
  const labeled = new Set();
  const { n, rise } = stairPlan();
  const T = STAIR.tread;
  const z0 = STAIR.z0, z1 = STAIR.z0 + STAIR.w;
  // Marches superposées (p. 15) : des modules posés l'un sur l'autre. Le module du bas
  // couvre toute la profondeur de l'escalier ; chaque module au-dessus repose sur celui
  // d'en dessous et recule d'une marche (16 po). Un module : trois appuis dans le sens de
  // la marche (côtés et centre) : 3 × 8 à plat au sol pour le module du bas, un seul bout
  // de 6 × 6 pour les autres (pas de bois empilé) ; puis le dessus en 3 × 8 en travers ;
  // la partie avant du dessus est le giron (deux 3 × 8, 16 po), la partie arrière porte
  // le module suivant.
  let base = null; // dessus du module d'en dessous (null : le sol)
  for (let i = n - 1; i >= 1; i--) {
    const top = DECK - i * rise; // dessus du giron i
    const xa = L, xb = L + i * T, depth = xb - xa; // le module i couvre les marches 1 à i
    const seq0 = (n - 1 - i) * 30;
    const under = top - P3; // dessous du dessus du module
    if (base == null) {
      // Module du bas : un rang de 3 × 8 à plat, posé de niveau dans le gravier (pas de vide).
      for (const z of [z0 + P8 / 2, (z0 + z1) / 2, z1 - P8 / 2]) {
        const g = Math.max(ground(xa, z), ground(xb, z));
        const nL = Math.max(1, Math.round((under - g) / P3));
        const yb = under - nL * P3;
        for (let j = 0; j < nL; j++) put('2', lumber(S, [depth, P3, P8], [(xa + xb) / 2, yb + (j + 0.5) * P3, z]), [0.25 * i, 0.12 * j, 0], 14, { seq: seq0 + 1 + j });
        const gap = yb - g;
        if (gap > 0.004) put('3', wedge(S, { pos: [(xa + xb) / 2, g, z], along: 'x', pair: gap > WEDGE.t, thick: gap }), [0.25 * i, -0.1, 0], 14, { seq: seq0 });
      }
    } else {
      // Modules du dessus : un seul bout de 6 × 6 par appui (côtés et centre), jamais de
      // bois empilé ; 6 po de 6 × 6 + 3 po de 3 × 8 = une marche de 9 po.
      for (const z of [z0 + B66 / 2, (z0 + z1) / 2, z1 - B66 / 2]) {
        const yb = under - B66;
        put('6', lumber(S, [depth, B66, B66], [(xa + xb) / 2, yb + B66 / 2, z]), [0.25 * i, 0.12, 0], 14, { seq: seq0 + 1 });
        const gap = yb - base;
        if (gap > 0.004) put('3', wedge(S, { pos: [(xa + xb) / 2, base, z], along: 'x', pair: gap > WEDGE.t, thick: gap }), [0.25 * i, -0.1, 0], 14, { seq: seq0 });
      }
    }
    // Dessus du module : 3 × 8 en travers sur toute la profondeur ; les deux de l'avant forment le giron.
    const np = Math.round(depth / P8);
    for (let k = 0; k < np; k++) put('1', lumber(S, [P8, P3, STAIR.w], [xa + (k + 0.5) * P8, top - P3 / 2, (z0 + z1) / 2]), [0.25 * i, 0.35, 0], 14, { seq: seq0 + 15 + k });
    base = top;
  }
  // Mains courantes (plus d'une marche) : 2 × 4 raboté de chaque côté.
  const xb = L + (n - 1) * T - T / 2;
  for (const z of [z0 - S24.t / 2, z1 + S24.t / 2]) {
    const hb = DECK - (n - 1) * rise;
    const gb = ground(xb, z);
    put('4', lumber(S, [S24.w, hb + 0.9 - gb, S24.t], [xb, (gb + hb + 0.9) / 2, z], 'woodPlaned'), [0.5, 0, Math.sign(z - (z0 + z1) / 2) * 0.3], 16, { seq: 0 });
    put('5', between(S, [L + S24.t, DECK + 0.9, z], [xb, hb + 0.9, z], S24.t, S24.w), [0.5, 0.25, Math.sign(z - (z0 + z1) / 2) * 0.3], 16, { seq: 1 });
  }
  return { view: { dir: [1.3, 0.6, 0.9] } };
}

// ------------------------------------------------------------------ garde-corps

const RAIL_TOP = 1.07; // lisse supérieure au-dessus du plancher (1 à 1,2 m)
const POST_MAX = 1.8;

function postsAlong(a, b) {
  const n = Math.max(1, Math.ceil((b - a) / POST_MAX));
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}

/**
 * Tronçons de garde-corps : bords du plancher de plus de 12 po de haut qui
 * donnent sur un vide. Le long des parois rocheuses (écart de 12 po ou moins),
 * il n'y a pas de vide : le grillage au bas du mur ferme l'écart (étape 17).
 * Reste le bout du plancher, côté galerie, de part et d'autre de l'escalier.
 */
export function guardSegments() {
  const segs = [];
  const sideGap = GAL - W / 2; // écart plancher-paroi
  for (const s of [-1, 1]) {
    const x0 = over12(s * W / 2);
    if (x0 != null && sideGap > 12 * IN + 0.005) segs.push({ axis: 'x', side: s, a: Math.max(0, Math.floor(x0 / FT) * FT), b: L });
  }
  if (deckHeight(L, 0) > 12 * IN) segs.push({ axis: 'z', side: 1, a: -W / 2, b: STAIR.z0 - S24.t - S24.w / 2 }, { axis: 'z', side: 1, a: STAIR.z0 + STAIR.w + S24.t + S24.w / 2, b: W / 2 });
  return segs;
}

/** Garde-corps (RSST art. 12), lisse inférieure et grillage au bas du mur, étapes 15 et 17. */
export function P16(api, opts = {}) {
  const S = api.S;
  soil(api, opts, -0.3, L + 1.2, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  for (const seg of guardSegments()) {
    const alongX = seg.axis === 'x';
    // Poteaux à l'extérieur du plancher, lisses sur leur face intérieure.
    const edge = alongX ? seg.side * W / 2 : L;
    const out = alongX ? [0, 0, seg.side] : [1, 0, 0];
    const postC = edge + (alongX ? seg.side : 1) * S24.t / 2;
    const railC = edge - (alongX ? seg.side : 1) * S24.t / 2;
    const plinthC = edge - (alongX ? seg.side : 1) * R24.t / 2;
    const P = (u, c, y) => (alongX ? [u, y, c] : [c, y, u]);
    const len = seg.b - seg.a;
    const mid = (seg.a + seg.b) / 2;
    const ex = (k) => out.map((v, i) => v * 0.35 * k + (i === 1 ? 0.15 * k : 0));
    const sz = (lu, h, t) => (alongX ? [lu, h, t] : [t, h, lu]);
    for (const u of postsAlong(seg.a, seg.b)) {
      const top = DECK + RAIL_TOP + 0.03;
      put('1', lumber(S, sz(S24.w, top, S24.t), P(u, postC, top / 2), 'woodPlaned'), ex(1), 15, { seq: 0 });
    }
    put('2', lumber(S, sz(len, S24.w, S24.t), P(mid, railC, DECK + RAIL_TOP - S24.w / 2), 'woodPlaned'), ex(2), 15, { seq: 2 });
    put('3', lumber(S, sz(len, S24.w, S24.t), P(mid, railC, DECK + RAIL_TOP / 2), 'woodPlaned'), ex(1.6), 15, { seq: 3 });
    // Plinthe : 2 × 4 brut sur chant (4 po, plus de 90 mm), posé sur le plancher.
    put('4', lumber(S, sz(len, R24.w, R24.t), P(mid, plinthC, DECK + R24.w / 2), 'wood'), ex(1.2), 15, { seq: 4 });
  }
  // Grillage de 24 po fixé au bas de chaque mur (écart plancher-mur de 12 po).
  for (const s of [-1, 1]) {
    const m = wireMesh(S, L + 0.6, 24 * IN, 2 * IN, 'zinc', 0.005);
    m.position.set(L / 2, DECK - 0.3, s * (GAL - 0.04));
    put('6', m, [0, 0, s * 0.5], 17, { noDrop: true });
  }
  return { view: { dir: [1.2, 0.8, 1.0] } };
}

// ------------------------------------------------------------------ plancher secondaire

/** Emprise du plancher secondaire, à côté de la tour de la foreuse (planches selon X). */
export function secondaryPlan() {
  const z0 = DRILL.z + 0.11 + 3 * IN; // dernière planche à 3 po de la tour
  return { x0: 0.12, x1: 0.12 + 72 * IN, z0, z1: z0 + 32 * IN };
}

/** Plancher secondaire (32 × 72 po, 9 po de haut), à côté de la tour. */
export function P17(api) {
  const S = api.S;
  const put = labeler(api);
  const { x0, x1, z0, z1 } = secondaryPlan();
  const zc = (z0 + z1) / 2;
  // Travers 6 × 6 sous les planches : aucun morceau en porte-à-faux.
  for (const x of [x0 + B66 / 2, (x0 + x1) / 2, x1 - B66 / 2]) put('1', lumber(S, [B66, B66, z1 - z0], [x, DECK + B66 / 2, zc]), [0, 0.2, 0], 18, { seq: 1 });
  const screws = [];
  for (let k = 0; k < 4; k++) {
    const z = z0 + (k + 0.5) * P8;
    put('2', lumber(S, [x1 - x0, P3, P8], [(x0 + x1) / 2, DECK + B66 + P3 / 2, z]), [0, 0.45 + 0.05 * k, 0], 18, { seq: 2 });
    // Les deux planches les plus près de la foreuse sont vissées (procédure), et
    // la dernière aussi : un tire-fond à chacun des quatre coins du plancher.
    if (k < 2 || k === 3) for (const x of [x0 + B66 / 2, x1 - B66 / 2]) screws.push([x, DECK + B66 + P3, z]);
  }
  put('3', lagScrews(S, screws), [0, 0.75, 0], 18, { seq: 3 });
  return { view: { dir: [1.2, 1.0, 0.6] } };
}

export { P8 };
