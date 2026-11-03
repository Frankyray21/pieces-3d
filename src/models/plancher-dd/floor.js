// Builders du plancher principal (PRO-DD-ST-003) : structure de base et
// recouvrement des deux sections, cage de bois, marches, garde-corps,
// plancher secondaire. Toutes les pièces sont posées dans le repère de
// plan.js, si bien qu'un sous-assemblage s'insère tel quel dans la vue
// d'ensemble. Chaque objet porte userData.step (étape de la procédure).
import {
  IN, FT, B66, P3, P8, S24, R24, W, L, SEC, DECK, joistZ, GAL, JOINT_X, SUPPORTS_X, SLEEPERS_X,
  stack, ground, groundUnder, over12, deckHeight, STAIR, DRILL, STM, WEDGE, plankX, TIGHT, d1, d2,
} from './plan.js';
import { lumber, between, wedge, lagScrews, placeStack, labeler } from './lumber.js';
import { groundPatch } from './site.js';
import { PIVOT, FOOT_X, AXIS_Y } from '../stm-1500/layout.js';

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
 * 3 × 6 de 24 po le long des madriers de rive, comme dans la vidéo (P10, repère 8).
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
 * selon X) portent les deux rangées. Le bout de 3 × 6 de 24 po vissé dans les deux sections
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

/**
 * Variante 8 pi : joints des 6 × 6 de 8 pi jointés comme au centre (jonction des
 * sections) : sur chaque ligne de madriers, un bout de 3 × 6 de 24 po à plat contre le
 * madrier, à cheval sur le joint, vissé avec un tire-fond de 6 po de chaque côté du joint.
 * Sans lui, les coins de serrage des planches (étape 7) écartent les deux 6 × 6 au joint.
 * Madriers de rive : côté intérieur ; les autres : côté Z positif.
 * Joints à 8 pi (section 1) et à 24 pi (section 2).
 */
export function eclisses8(S, xs = [JOINT8_X, JOINT8_X2]) {
  const g = S.group();
  const half = 12 * IN;
  joistZ.forEach((z, k) => {
    const s = k === joistZ.length - 1 ? -1 : 1; // côté du 3 × 6 (vers l'intérieur pour les rives)
    const zf = z + s * B66 / 2; // face du madrier
    for (const x of xs) {
      g.add(lumber(S, [2 * half, B66, P3], [x, B66 / 2, zf + s * P3 / 2], 'woodLight'));
      // Tête contre la face extérieure du 3 × 6, tige vers le madrier (comme au joint du centre).
      g.add(S.boltSet([[x - 6 * IN, B66 / 2, zf + s * P3], [x + 6 * IN, B66 / 2, zf + s * P3]], 0.375 * IN, 6 * IN, 'zinc', { axis: s > 0 ? 'z' : '-z', washer: true }));
    }
  });
  return g;
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
  // Bois de jonction (p. 6) : un bout de 3 × 6 de 24 po, à plat contre la face intérieure
  // du madrier de rive de chaque côté, à cheval sur le joint, posé sur le 6 × 6 de jonction ;
  // son dessus (6 po) arrive au ras des madriers, juste sous les planches. Vissé dans le
  // madrier de chaque section (un tire-fond de chaque côté du joint), il tient les deux
  // sections ensemble. Un 3 × 6 et non un 6 × 6 : le tire-fond de 6 po traverse les 3 po
  // du bois de jonction et mord 3 po dans le madrier ; dans un 6 × 6, il n'atteindrait pas
  // le madrier.
  const half = 12 * IN;
  const sides = [-1, 1];
  const zin = W / 2 - B66; // face intérieure du madrier de rive
  sides.forEach((s) => put('8', lumber(S, [2 * half, B66, P3], [JOINT_X, B66 / 2, s * (zin - P3 / 2)]), [0, 0.6, 0], 11, { seq: 3 }));
  sides.forEach((s) => put('9', S.boltSet([[JOINT_X - 6 * IN, B66 / 2, s * (zin - P3)], [JOINT_X + 6 * IN, B66 / 2, s * (zin - P3)]], 0.375 * IN, 6 * IN, 'zinc', { axis: s > 0 ? '-z' : 'z', washer: true }), [0, 0.9, 0], 11, { seq: 4 }));
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
  // d'en dessous et recule d'une marche (16 po). Un module : deux appuis dans le sens de
  // la marche (les côtés, pas d'appui au milieu, comme dans la procédure p. 15) : 3 × 8 à plat au sol pour le module du bas, un seul bout
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
      for (const z of [z0 + P8 / 2, z1 - P8 / 2]) {
        const g = Math.max(ground(xa, z), ground(xb, z));
        const nL = Math.max(1, Math.round((under - g) / P3));
        const yb = under - nL * P3;
        for (let j = 0; j < nL; j++) put('2', lumber(S, [depth, P3, P8], [(xa + xb) / 2, yb + (j + 0.5) * P3, z]), [0.25 * i, 0.12 * j, 0], 14, { seq: seq0 + 1 + j });
        const gap = yb - g;
        if (gap > 0.004) put('3', wedge(S, { pos: [(xa + xb) / 2, g, z], along: 'x', pair: gap > WEDGE.t, thick: gap }), [0.25 * i, -0.1, 0], 14, { seq: seq0 });
      }
    } else {
      // Modules du dessus : un seul bout de 6 × 6 par appui (les deux côtés), jamais de
      // bois empilé ; 6 po de 6 × 6 + 3 po de 3 × 8 = une marche de 9 po.
      for (const z of [z0 + B66 / 2, z1 - B66 / 2]) {
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
  // Mains courantes (plus d'une marche), de chaque côté de l'escalier, comme sur le chantier :
  // un montant 2 × 4 en haut (au bord du plancher) et un en bas (au nez de la dernière marche),
  // du sol jusqu'à la main courante ; sur la face des montants côté escalier, deux 2 × 4 droits
  // parallèles à la ligne des nez de marche : la main courante à 36 po au-dessus des nez et une
  // lisse intermédiaire à mi-hauteur. Les montants sont juste à l'extérieur de l'escalier : les
  // 2 × 4 arrivent au bord des marches sans les rétrécir.
  const HR = 36 * IN;
  const nez = (x) => DECK - ((x - L) / T) * rise; // ligne des nez de marche
  const xh = L + R24.w / 2, xbas = L + (n - 1) * T - R24.w / 2;
  for (const [z, s] of [[z0 - 1.5 * R24.t, -1], [z1 + 1.5 * R24.t, 1]]) {
    for (const x of [xh, xbas]) {
      const g = ground(x, z), top = nez(x) + HR + R24.w / 2;
      put('4', lumber(S, [R24.w, top - g, R24.t], [x, (g + top) / 2, z], 'wood'), [0.5, 0, s * 0.3], 16, { seq: 0 });
    }
    const zr = z - s * R24.t; // face côté escalier
    for (const [ref, h, seq] of [['5', HR, 1], ['7', HR / 2, 2]]) {
      put(ref, between(S, [xh - R24.w / 2, nez(xh - R24.w / 2) + h, zr], [xbas + R24.w / 2, nez(xbas + R24.w / 2) + h, zr], R24.t, R24.w, 'wood'), [0.5, 0.25, s * 0.3], 16, { seq });
    }
  }
  return { view: { dir: [1.3, 0.6, 0.9] } };
}

/**
 * Cas de marches à montrer (outil 3D de l'app) : escalier de n marches de 9 po, le
 * plancher (bout de plancher en 3 × 8 sur deux madriers 6 × 6) à n × 9 po du sol, posé
 * sur un sol plat à (x, y, z), l'escalier descendant vers X positif. Modules superposés
 * comme à l'étape 14 : deux appuis par module (les côtés), 3 × 8 à plat pour le module
 * du bas, bouts de 6 × 6 au-dessus ; empilables et récupérables au démantèlement.
 */
export function marchesCas(S, n, [x, y, z]) {
  const g = S.group();
  const rise = 9 * IN, T = STAIR.tread, w = STAIR.w;
  const z0 = z - w / 2, z1 = z + w / 2;
  const H = n * rise;
  // userData.plancher : bout de plancher (décor du cas) ; userData.module : rang de pose
  // des modules de marche, de bas en haut (1 = module du bas).
  const base = (o) => { o.userData.plancher = true; g.add(o); };
  const pose = (o, m) => { o.userData.module = m; g.add(o); };
  // Bout de plancher : planches 3 × 8 en travers sur deux madriers, appuyés sur des 6 × 6 debout.
  const xa = x - 0.7;
  for (const zz of [z0 + B66 / 2, z1 - B66 / 2]) {
    base(lumber(S, [0.7, B66, B66], [(xa + x) / 2, y + H - P3 - B66 / 2, zz]));
    const hp = H - P3 - B66;
    for (const xx of [xa + B66 / 2, x - B66 / 2]) base(lumber(S, [B66, hp, B66], [xx, y + hp / 2, zz], 'woodDark'));
  }
  for (let k = 0; k < 3; k++) base(lumber(S, [P8, P3, w + 0.3], [x - (k + 0.5) * P8, y + H - P3 / 2, z]));
  // Modules : le module i (du haut, i = 1, au bas, i = n - 1) couvre les marches 1 à i.
  for (let i = n - 1; i >= 1; i--) {
    const top = y + H - i * rise, depth = i * T, xm = x + depth / 2;
    const under = top - P3;
    for (const zz of [z0 + P8 / 2, z1 - P8 / 2]) {
      if (i === n - 1) {
        // Module du bas : 3 × 8 à plat, empilés jusqu'à 9 po moins le dessus.
        const nL = Math.max(1, Math.round((under - y) / P3));
        for (let j = 0; j < nL; j++) pose(lumber(S, [depth, P3, P8], [xm, under - (nL - j - 0.5) * P3, zz]), n - i);
      } else pose(lumber(S, [depth, B66, B66], [xm, under - B66 / 2, zz]), n - i);
    }
    const np = Math.round(depth / P8);
    for (let k = 0; k < np; k++) pose(lumber(S, [P8, P3, w], [x + (k + 0.5) * P8, top - P3 / 2, z]), n - i + 0.5);
  }
  return g;
}


// ------------------------------------------------------------------ garde-corps

const RAIL_TOP = 1.07; // lisse supérieure au-dessus du plancher (1 à 1,2 m)
// Sections de garde-corps de 8 pi : avec quatre 2 × 4 de 8 pi, un coupé en deux pour les deux
// montants (48 po chacun, la bonne hauteur sans mesurer), et trois gardés entiers : la lisse
// supérieure, la lisse intermédiaire et la lisse inférieure.
const POST_MAX = 8 * FT;
const POST_LEN = 48 * IN;

// Montants d'un tronçon : des sections pleines de 8 pi à partir du coin du plancher (« depuis »,
// le bout a ou b), les lisses de 8 pi allant d'un bord extérieur de montant à l'autre ; seule la
// dernière section, au bout, est plus courte (lisses coupées à la longueur qui reste).
function postsAlong(a, b, depuis = 'a') {
  const pas = POST_MAX - S24.w;
  const us = [];
  if (depuis === 'a') { for (let u = a; u < b - 0.15; u += pas) us.push(u); us.push(b); }
  else { for (let u = b; u > a + 0.15; u -= pas) us.push(u); us.push(a); us.reverse(); }
  return us;
}

/**
 * Tronçons de garde-corps : bords du plancher de plus de 12 po de haut qui
 * donnent sur un vide. Le long des parois rocheuses, le plancher est près du roc
 * (écart de 12 po ou moins) : pas de garde-corps ; s'il y a plus de 12 po, un
 * garde-corps (étape 17). Reste le bout du plancher, côté galerie, de part et
 * d'autre de l'escalier.
 */
export function guardSegments() {
  const segs = [];
  const sideGap = GAL - W / 2; // écart plancher-paroi
  for (const s of [-1, 1]) {
    const x0 = over12(s * W / 2);
    if (x0 != null && sideGap > 12 * IN + 0.005) segs.push({ axis: 'x', side: s, a: Math.max(0, Math.floor(x0 / FT) * FT), b: L, depuis: 'b' });
  }
  if (deckHeight(L, 0) > 12 * IN) segs.push({ axis: 'z', side: 1, a: -W / 2, b: STAIR.z0 - S24.t - S24.w / 2, depuis: 'a' }, { axis: 'z', side: 1, a: STAIR.z0 + STAIR.w + S24.t + S24.w / 2, b: W / 2, depuis: 'b' });
  return segs;
}

/** Garde-corps (RSST art. 12) et lisse inférieure, étape 15 (et étape 17 : côtés à plus de 12 po de la paroi). */
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
    // Montants de 48 po (un 2 × 4 de 8 pi coupé en deux) vissés contre le bord du
    // plancher : le haut à la lisse supérieure, le bas sous le dessus du plancher.
    const us = postsAlong(seg.a, seg.b, seg.depuis);
    // Un montant au milieu de chaque section de plus de 5 pi (tous les 4 pi dans une section de
    // 8 pi : pas de grand vide sans montant) ; les lisses de la section passent par-dessus, entières.
    const milieux = [];
    for (let k = 0; k + 1 < us.length; k++) if (us[k + 1] - us[k] > 5 * FT) milieux.push((us[k] + us[k + 1]) / 2);
    for (const u of [...us, ...milieux]) {
      const top = DECK + RAIL_TOP;
      put('1', lumber(S, sz(S24.w, POST_LEN, S24.t), P(u, postC, top - POST_LEN / 2), 'woodPlaned'), ex(1), 15, { seq: 0 });
    }
    // Une section par paire de montants : lisses de la longueur de la section (8 pi au plus).
    for (let k = 0; k + 1 < us.length; k++) {
      const a = us[k] - S24.w / 2, b = us[k + 1] + S24.w / 2, lk = b - a, mk = (a + b) / 2;
      put('2', lumber(S, sz(lk, S24.w, S24.t), P(mk, railC, DECK + RAIL_TOP - S24.w / 2), 'woodPlaned'), ex(2), 15, { seq: 2 });
      put('3', lumber(S, sz(lk, S24.w, S24.t), P(mk, railC, DECK + RAIL_TOP / 2), 'woodPlaned'), ex(1.6), 15, { seq: 3 });
      // Lisse inférieure (coup de pied) : 2 × 4 brut sur chant (4 po, plus de 90 mm), au ras du plancher.
      put('4', lumber(S, sz(lk, R24.w, R24.t), P(mk, plinthC, DECK + R24.w / 2), 'wood'), ex(1.2), 15, { seq: 4 });
    }
    void len; void mid;
  }
  return { view: { dir: [1.2, 0.8, 1.0] } };
}

// ------------------------------------------------------------------ plancher secondaire

/**
 * Plancher secondaire à côté de la tour de la STM-1500 (STM, plan.js). Il sert à travailler dans une
 * position ergonomique à l'arrière de la tête de forage : ajouter les tiges et sortir le tube carotier.
 * Sa hauteur suit l'angle de forage (SECONDAIRES) :
 *   - forage à l'horizontale : pas de plancher secondaire ;
 *   - forage montant (10°) : plancher secondaire de 9 po, sans marche ;
 *   - forage montant (15°) : plancher à 18 po, 2 marches (la 1re de 16 po × 9 po) et garde-corps
 *     aux bouts sans marche.
 * Au-delà de 20° (forage ascendant) : plus de 2 marches (pas montré).
 * 32 × 72 po, le long côté parallèle à la tour, planches 3 × 8 dans le sens de la tour ; il épouse
 * la foreuse : la planche la plus près est à 1 po de la face extérieure du patin (moins de 3 po :
 * le pied ne passe pas), les poteaux des paliers à environ 3 po. Placé vis-à-vis de l'arrière de
 * la tête, sans dépasser le plancher principal. Les 2 planches les plus près de la foreuse sont vissées.
 */
const PATIN_Z = 0.533;     // demi-largeur hors tout du traîneau (face extérieure des patins)
// Pour lever l'avance, le support bascule sur l'axe arrière (tubes de pivot dans les paliers des
// poteaux arrière du traîneau, PIVOT de stm-1500/layout.js, 45° vers le haut au plus) ; au-delà de
// 10°, la poutre est d'abord avancée sur le support (vérin de relevage, glisse en m) pour que son
// arrière (poulie) ne touche pas le plancher, et la foreuse recule pour garder l'avance à 1 pi de
// la paroi. z : milieu du traîneau ; travail : hauteur de l'arrière de la tête au-dessus du plancher principal.
// Les travailleurs se tiennent à l'arrière de la tête de forage (nez de l'émerillon, 1,624 m derrière
// la face du pied le long de l'avance) : c'est là qu'on ajoute les tiges et qu'on sort le tube carotier.
const arriereTete = (angle, glisse, z) => {
  const t = (angle * Math.PI) / 180, dx = FOOT_X - 1.074 - 0.55 + glisse - PIVOT.x[1], dy = AXIS_Y - PIVOT.y;
  return { zs: z + STM.sens * (PIVOT.x[1] + dx * Math.cos(t) - dy * Math.sin(t)), travail: PIVOT.y + dx * Math.sin(t) + dy * Math.cos(t) };
};
const cfg = (n, angle, H, glisse, z) => {
  const { zs, travail } = arriereTete(angle, glisse, z);
  const zc = Math.min(Math.max(zs, -W / 2 + 0.06 + 36 * IN), W / 2 - 0.06 - 36 * IN);   // vis-à-vis de l'arrière de la tête
  return { n, angle, H, glisse, z, zc, travail };
};
export const SECONDAIRES = [
  cfg(1, 0, 0, 0, STM.z),
  cfg(2, 10, 9 * IN, 0, STM.z),
  cfg(3, 15, 18 * IN, 0.9, -0.091),
];
export function secondaryPlan(H = 18 * IN, zc = STM.z + STM.sens * 0.4) {
  const x0 = STM.x + PATIN_Z + 1 * IN;         // à 1 po du patin : le plancher épouse la foreuse
  return { x0, x1: x0 + 32 * IN, z0: zc - 36 * IN, z1: zc + 36 * IN, H, patin: STM.x + PATIN_Z };
}

/**
 * Pièces d'un plancher secondaire de hauteur H : [{ ref, obj, module }] (module : rang de pose).
 * Appuis : rien à 9 po (travers sur le plancher), 3 × 8 à plat et bout de 6 × 6 à 18 po, 6 × 6
 * debout au-delà ; marches de 16 po de profondeur, une tous les 9 po, sur le côté libre.
 */
export function plancherSecondaire(S, H, zc) {
  const out = [];
  const add = (ref, obj, module) => out.push({ ref, obj, module });
  const { x0, x1, z0, z1 } = secondaryPlan(H, zc);
  const zm = (z0 + z1) / 2, y0 = DECK, yt = y0 + H - P3; // dessous des planches
  const zs = [z0 + B66 / 2, zm, z1 - B66 / 2];
  const sous = H - P3 - B66;                    // hauteur des appuis sous les travers
  for (const z of zs) for (const x of [x0 + P8 / 2, x1 - P8 / 2]) {   // appuis sans toucher au patin
    if (sous < 0.01) continue;
    if (Math.abs(sous - (P3 + B66)) < 0.01) {
      add('4', lumber(S, [P8, P3, 24 * IN], [x, y0 + P3 / 2, z]), 1);
      add('4', lumber(S, [B66, B66, 24 * IN], [x, y0 + P3 + B66 / 2, z]), 1.5);
    } else add('4', lumber(S, [B66, sous, B66], [x, y0 + sous / 2, z], 'woodDark'), 1);
  }
  for (const z of zs) add('1', lumber(S, [x1 - x0, B66, B66], [(x0 + x1) / 2, yt - B66 / 2, z]), 2);
  const vis = [];
  for (let k = 0; k < 4; k++) {
    const x = x0 + (k + 0.5) * P8;
    add('2', lumber(S, [P8, P3, z1 - z0], [x, yt + P3 / 2, zm]), 3 + 0.1 * k);
    if (k < 2) for (const z of [zs[0], zs[2]]) vis.push([x, yt + P3, z]);
  }
  add('3', lagScrews(S, vis), 3.6);
  // Marches sur le côté libre : la j-ième (j = 1 contre le plancher) a son dessus à H − 9j po.
  const nM = Math.round(H / (9 * IN)) - 1;
  for (let j = 1; j <= nM; j++) {
    const top = H - 9 * IN * j, xa = x1 + (j - 1) * 16 * IN, xm = xa + 8 * IN, h = top - P3;
    for (const z of zs) add('5', lumber(S, [16 * IN, h, B66], [xm, y0 + h / 2, z], h > B66 + 0.01 ? 'woodDark' : 'wood'), 4 + 0.1 * j);
    for (let k = 0; k < 2; k++) add('5', lumber(S, [P8, P3, z1 - z0], [xa + (k + 0.5) * P8, y0 + h + P3 / 2, zm]), 4.5 + 0.1 * j);
  }
  // Garde-corps aux deux bouts sans marche (plancher à plus de 9 po).
  if (H > 9 * IN + 0.01) {
    const top = y0 + H + RAIL_TOP;
    for (const [z, s] of [[z0, -1], [z1, 1]]) {
      for (const x of [x0 + S24.w / 2, x1 - S24.w / 2]) add('6', lumber(S, [S24.w, POST_LEN, S24.t], [x, top - POST_LEN / 2, z + s * S24.t / 2], 'woodPlaned'), 5);
      add('7', lumber(S, [x1 - x0, S24.w, S24.t], [(x0 + x1) / 2, top - S24.w / 2, z - s * S24.t / 2], 'woodPlaned'), 5.5);
      add('7', lumber(S, [x1 - x0, S24.w, S24.t], [(x0 + x1) / 2, y0 + H + RAIL_TOP / 2, z - s * S24.t / 2], 'woodPlaned'), 5.6);
      add('8', lumber(S, [x1 - x0, R24.w, R24.t], [(x0 + x1) / 2, y0 + H + R24.w / 2, z - s * R24.t / 2], 'wood'), 5.7);
    }
  }
  return out;
}

/** Plancher secondaire (étape 18) : le montage à 2 marches (forage montant à 15°). */
export function P17(api) {
  const put = labeler(api);
  const ex = { 1: [0, 0.3, 0], 2: [0, 0.45, 0], 3: [0, 0.75, 0], 4: [0, 0.15, 0], 5: [0.3, 0.15, 0], 6: [0, 0.3, 0.3], 7: [0, 0.35, 0.3], 8: [0, 0.35, 0.3] };
  const c = SECONDAIRES[2];
  for (const { ref, obj, module } of plancherSecondaire(api.S, c.H, c.zc)) put(ref, obj, ex[ref], 18, { seq: Math.round(module * 10) });
  return { view: { dir: [1.2, 1.0, 0.6] } };
}

export { P8 };

// ------------------------------------------------------------------ appuis profonds

/**
 * Appuis d'un plancher plus haut que le sol (cas de marches de l'app : sol plus creux sous le
 * même plancher, voir setFond). Montage de la section 2 (étapes 10 et 11), jamais de bois
 * empilé dans le même sens ni de cage : sous les madriers, sur chaque ligne d'appui, un 6 × 6
 * de 16 pi en travers (soutien) là où un blocage et des coins ne suffisent plus ; si c'est encore
 * trop creux, des 6 × 6 croisés dessous : un rang dans le sens des madriers (vis-à-vis de chaque
 * madrier), puis un rang en travers, etc. Un 6 × 6 dans le sens des madriers fait 16 pi s'il
 * passe partout au-dessus du sol, sinon 8 pi, sans dépasser du plancher. Sous le dernier rang,
 * à chaque croisement : un seul blocage et des coins (stack). Lignes d'appui du plancher :
 * SUPPORTS_X, la jonction, SLEEPERS_X (la jonction et la section 2 ont toujours leur soutien).
 * Un creux local qu'un 6 × 6 ne peut pas atteindre garde sa cage (étape 11, cas spéciaux).
 * Retourne un groupe de pièces (bois et coins), chacune avec userData.kind.
 */
export function appuisProfonds(S) {
  const g = S.group();
  const add = (o, kind) => { o.userData.kind = kind; g.add(o); };
  // Trop creux : un blocage et des coins ne suffisent plus (stack ferait une cage).
  const cage = (c) => stack(c.x, c.z, c.top, c.along, { inFloor: true }).pieces.some((p) => p.kind === 'crib');
  const sol = (x, z) => groundUnder(x, z, 0.05, B66 / 2);
  // Un 6 × 6 dans le sens des madriers (z, de xa à xb) ou en travers (x), dessous à « bas » : au-dessus du sol partout.
  const libreX = (z, xa, xb, bas) => { for (let x = xa; x <= xb + 1e-6; x += 0.1) if (sol(x, z) > bas - 0.006) return false; return true; };
  const libreZ = (x, bas) => { for (let z = -W / 2; z <= W / 2 + 1e-6; z += 0.1) if (groundUnder(x, z, B66 / 2, 0.05) > bas - 0.006) return false; return true; };
  const lignes = SUPPORTS_X.map((x) => ({ x, soutien: false }))
    .concat([{ x: JOINT_X, soutien: true }], SLEEPERS_X.map((x) => ({ x, soutien: true })));
  const fin = [];       // croisements qui reçoivent un blocage et des coins
  let C = [];           // croisements sous le rang du dessous, en attente
  for (const l of lignes) {
    const sous = (top, along) => joistZ.map((z) => ({ x: l.x, z, top, along }));
    if (!l.soutien) l.soutien = sous(0, 'z').some(cage);
    if (l.soutien) {
      add(lumber(S, [B66, B66, W], [l.x, -B66 / 2, 0]), 'soutien');
      C.push(...sous(-B66, 'x'));
    } else fin.push(...sous(0, 'z'));
  }
  let sensX = true;
  for (let rang = 0; rang < 8 && C.length; rang++) {
    const deep = C.filter(cage);
    fin.push(...C.filter((c) => !deep.includes(c)));
    if (!deep.length) { C = []; break; }
    const suite = [];
    if (sensX) {
      // Sous des croisements trop creux, vis-à-vis d'un même madrier : 6 × 6 dans le sens des madriers.
      for (const z of [...new Set(deep.map((c) => c.z))]) {
        let reste = deep.filter((c) => c.z === z).sort((a, b) => a.x - b.x);
        const top = reste[0].top, bas = top - B66;
        while (reste.length) {
          let best = null;
          for (const len of [SEC, SEC / 2]) {
            const essais = [L - len];   // collé au bout du plancher, puis tous les 5 cm
            for (let xa = 0; xa < L - len; xa += 0.05) essais.push(xa);
            for (const xa of essais) {
              const pris = reste.filter((c) => c.x - B66 / 2 >= xa - 1e-6 && c.x + B66 / 2 <= xa + len + 1e-6);
              if (!pris.length || !pris.some((c) => c === reste[0])) continue;
              if (!libreX(z, xa, xa + len, bas)) continue;
              if (!best || pris.length > best.pris.length) best = { len, xa, pris };
            }
            if (best && best.pris.length === reste.length) break;
          }
          if (!best) { fin.push(reste.shift()); continue; }
          add(lumber(S, [best.len, B66, B66], [best.xa + best.len / 2, top - B66 / 2, z]), 'soutien');
          for (const c of best.pris) suite.push({ x: c.x, z, top: bas, along: 'z' });
          reste = reste.filter((c) => !best.pris.includes(c));
        }
      }
    } else {
      // Sous des croisements trop creux d'une même ligne : 6 × 6 de 16 pi en travers.
      for (const x of [...new Set(deep.map((c) => c.x))]) {
        const ici = deep.filter((c) => c.x === x), top = ici[0].top, bas = top - B66;
        if (!libreZ(x, bas)) { fin.push(...ici); continue; }
        add(lumber(S, [B66, B66, W], [x, top - B66 / 2, 0]), 'soutien');
        for (const c of ici) suite.push({ x, z: c.z, top: bas, along: 'x' });
      }
    }
    C = suite;
    sensX = !sensX;
  }
  fin.push(...C);
  for (const c of fin) {
    const st = stack(c.x, c.z, c.top, c.along, { inFloor: true });
    for (const p of st.pieces) add(p.kind === 'wedge' ? wedge(S, p) : lumber(S, p.size, p.pos), p.kind);
  }
  return g;
}
