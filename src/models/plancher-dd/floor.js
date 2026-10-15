// Builders du plancher principal (PRO-DD-ST-003) : structure de base et
// recouvrement des deux sections, cage de bois, marches, garde-corps,
// plancher secondaire. Toutes les pièces sont posées dans le repère de
// plan.js, si bien qu'un sous-assemblage s'insère tel quel dans la vue
// d'ensemble. Chaque objet porte userData.step (étape de la procédure).
import {
  IN, FT, B66, P3, P8, S24, R24, W, L, SEC, DECK, joistZ, GAL, JOINT_X, SUPPORTS_S1, SUPPORTS_S2,
  stack, sleeperLines, ground, over12, deckHeight, STAIR, DRILL, WEDGE,
} from './plan.js';
import { lumber, between, wedge, lagScrews, placeStack, labeler } from './lumber.js';
import { wireMesh, groundPatch } from './site.js';

// Sous-assemblage vu seul : le sol de la galerie sous l'emprise (absent dans la vue d'ensemble).
function soil(api, opts, x0, x1, z0, z1) {
  if (!opts.inPlace) api.part('G', groundPatch(api.S, x0, x1, z0, z1), [0, 0, 0], { noLabel: true });
}

const PLANKS = Math.round(L / P8); // 48 planches de 3 × 8 sur 32 pi
const PER_SEC = PLANKS / 2;
const plankX = (i) => (i + 0.5) * P8;
const screwZ = W / 2 - B66 / 2; // tire-fonds dans les madriers de rive

// ------------------------------------------------------------------ section 1

/** Structure de base, section 1 (16 × 16 pi), étapes 2 à 5. */
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
  // Blocages et coins sous chaque madrier (au moins 6 par madrier).
  for (const z of joistZ) {
    for (const x of SUPPORTS_S1) {
      placeStack(api, stack(x, z, 0, 'z'), { refs: { b38: '3', b66: '4', crib: '4', wedge: '5' }, labeled, step: 5, explode: { wedge: [0, 0.28, 0], b38: [0, 0.12, 0] } });
    }
    // Blocage de jonction : il porte aussi le bout des madriers de la section 2.
    placeStack(api, stack(JOINT_X, z, 0, 'z', { forceTop38: true }), { labeled, step: 5, group: { ref: '6', explode: [0.25, 0.12, 0] } });
  }
  return { view: { dir: [0.9, 0.75, 1.15] } };
}

/** Recouvrement en 3 × 8 de la section 1, étapes 6 à 8. */
export function P07(api, opts = {}) {
  const S = api.S;
  soil(api, opts, -0.4, SEC + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  const screws = [];
  for (let i = 0; i < PER_SEC; i++) {
    const join = i >= PER_SEC - 2; // deux planches laissées libres puis vissées à la fin (étape 8)
    const p = lumber(S, [P8, P3, W], [plankX(i), B66 + P3 / 2, 0]);
    p.userData.order = i;
    put(join ? '2' : '1', p, [0, join ? 0.75 : 0.45, 0], join ? 12 : 6);
    for (const s of [-1, 1]) screws.push([plankX(i), DECK, s * screwZ]);
  }
  put('3', lagScrews(S, screws), [0, 1.05, 0], 6);
  return { view: { dir: [0.75, 1.0, 1.1] } };
}

// ------------------------------------------------------------------ section 2

/** Structure de base, section 2, étapes 9 à 11. */
export function P10(api, opts = {}) {
  const S = api.S;
  soil(api, opts, SEC - 0.4, L + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  const labeled = new Set();
  const sleepers = new Set(sleeperLines());
  joistZ.forEach((z) => {
    put('1', lumber(S, [SEC, B66, B66], [SEC + SEC / 2, B66 / 2, z]), [0, 0.75, 0], 11);
  });
  // Soutiens 6 × 6 de 16 pi dans le sens contraire, sous les madriers ; le
  // plus éloigné sert de madrier guide (étape 10).
  [...sleepers].sort((a, b) => b - a).forEach((x) => {
    put('2', lumber(S, [B66, B66, W], [x, -B66 / 2, 0]), [0, 0.4, 0], 10);
  });
  for (const x of SUPPORTS_S2) {
    const onSleeper = sleepers.has(x);
    for (const z of joistZ) {
      // Sous un soutien, les blocages s'alignent vis-à-vis le croisement (étape 11).
      const st = onSleeper ? stack(x, z, -B66, 'x') : stack(x, z, 0, 'z');
      const crib = st.pieces.some((p) => p.kind === 'crib');
      if (crib) placeStack(api, st, { labeled, step: 11, group: { ref: '6', explode: [0, 0.1, 0.35] } });
      else placeStack(api, st, { refs: { b38: '3', b66: '4', wedge: '5' }, labeled, step: 11, explode: { wedge: [0, 0.22, 0], b38: [0, 0.1, 0] } });
    }
  }
  return { view: { dir: [-0.85, 0.7, 1.2] } };
}

/** Recouvrement de la section 2 (étape 12), bouts au ras (étape 13). */
export function P13(api, opts = {}) {
  const S = api.S;
  soil(api, opts, SEC - 0.4, L + 0.4, -W / 2 - 0.3, W / 2 + 0.3);
  const put = labeler(api);
  const screws = [];
  for (let i = PER_SEC; i < PLANKS; i++) {
    put('1', lumber(S, [P8, P3, W], [plankX(i), B66 + P3 / 2, 0]), [0, 0.45, 0], 12);
    for (const s of [-1, 1]) screws.push([plankX(i), DECK, s * screwZ]);
  }
  put('2', lagScrews(S, screws), [0, 1.05, 0], 12);
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
  // Hauteur de marche de 12 po au plus (environ 9 po comme l'exemple de la p. 15).
  const n = Math.max(2, Math.ceil(h / (9.5 * IN)));
  return { zc, h, n, rise: h / n };
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
  for (let i = 1; i < n; i++) {
    const top = DECK - i * rise;
    const x0 = L + (i - 1) * T;
    // Giron : deux 3 × 8 (16 po), de 48 po de large.
    for (const k of [0, 1]) put('1', lumber(S, [P8, P3, STAIR.w], [x0 + (k + 0.5) * P8, top - P3 / 2, (z0 + z1) / 2]), [0.25 * i, 0.35, 0], 14);
    // Supports empilés en 3 × 8 (dans le sens de la marche), mis de niveau aux coins.
    for (const z of [z0 + 0.12, (z0 + z1) / 2, z1 - 0.12]) {
      placeStack(api, stack(x0 + T / 2, z, top - P3, 'x', { len38: T }), { refs: { b38: '2', b66: '2', crib: '2', wedge: '3' }, labeled, step: 14, explode: { wedge: [0.25 * i, 0.18, 0] } });
    }
  }
  // Mains courantes (plus d'une marche) : 2 × 4 raboté de chaque côté.
  const xb = L + (n - 1) * T - T / 2;
  for (const z of [z0 - S24.t, z1 + S24.t]) {
    const hb = DECK - (n - 1) * rise;
    const gb = ground(xb, z);
    put('4', lumber(S, [S24.w, hb + 0.9 - gb, S24.t], [xb, (gb + hb + 0.9) / 2, z], 'woodPlaned'), [0.5, 0, Math.sign(z - (z0 + z1) / 2) * 0.3], 16);
    put('5', between(S, [L + S24.t, DECK + 0.9, z], [xb, hb + 0.9, z], S24.t, S24.w), [0.5, 0.25, Math.sign(z - (z0 + z1) / 2) * 0.3], 16);
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

/** Tronçons de garde-corps : bords où le plancher dépasse 12 po de haut. */
export function guardSegments() {
  const segs = [];
  for (const s of [-1, 1]) {
    const x0 = over12(s * W / 2);
    if (x0 != null) segs.push({ axis: 'x', side: s, a: Math.max(0, Math.floor(x0 / FT) * FT), b: L });
  }
  segs.push({ axis: 'z', side: 1, a: -W / 2, b: STAIR.z0 }, { axis: 'z', side: 1, a: STAIR.z0 + STAIR.w, b: W / 2 });
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
      put('1', lumber(S, sz(S24.w, top, S24.t), P(u, postC, top / 2), 'woodPlaned'), ex(1), 15);
      // Jambe de force vers le sol, au bout du plancher (dégagé).
      if (!alongX) {
        const xg = L + 0.75;
        put('5', between(S, [L + S24.t, DECK + 0.75, u], [xg, ground(xg, u) + 0.02, u], S24.w, S24.t), ex(1.4), 15);
      }
    }
    put('2', lumber(S, sz(len, S24.w, S24.t), P(mid, railC, DECK + RAIL_TOP - S24.w / 2), 'woodPlaned'), ex(2), 15);
    put('3', lumber(S, sz(len, S24.w, S24.t), P(mid, railC, DECK + RAIL_TOP / 2), 'woodPlaned'), ex(1.6), 15);
    // Plinthe : 2 × 4 brut sur chant (4 po, plus de 90 mm), posé sur le plancher.
    put('4', lumber(S, sz(len, R24.w, R24.t), P(mid, plinthC, DECK + R24.w / 2), 'wood'), ex(1.2), 15);
  }
  // Grillage de 24 po fixé au bas de chaque mur (écart plancher-mur de 12 po).
  for (const s of [-1, 1]) {
    const m = wireMesh(S, L + 0.6, 24 * IN, 2 * IN);
    m.position.set(L / 2, DECK - 0.3, s * (GAL - 0.04));
    put('6', m, [0, 0, s * 0.5], 17);
  }
  return { view: { dir: [1.2, 0.8, 1.0] } };
}

// ------------------------------------------------------------------ plancher secondaire

/** Emprise du plancher secondaire, à côté de la tour de la foreuse. */
export function secondaryPlan() {
  const x0 = DRILL.x + 0.11 + 3 * IN; // dernière planche à 3 po de la tour
  return { x0, x1: x0 + 32 * IN, z0: -W / 2 + 0.12, z1: -W / 2 + 0.12 + 72 * IN };
}

/** Plancher secondaire (32 × 72 po, 9 po de haut), à côté de la tour. */
export function P17(api) {
  const S = api.S;
  const put = labeler(api);
  const { x0, x1, z0, z1 } = secondaryPlan();
  const xc = (x0 + x1) / 2;
  // Travers 6 × 6 sous les planches : aucun morceau en porte-à-faux.
  for (const z of [z0 + B66 / 2, (z0 + z1) / 2, z1 - B66 / 2]) put('1', lumber(S, [x1 - x0, B66, B66], [xc, DECK + B66 / 2, z]), [0, 0.2, 0], 18);
  const screws = [];
  for (let k = 0; k < 4; k++) {
    const x = x0 + (k + 0.5) * P8;
    put('2', lumber(S, [P8, P3, z1 - z0], [x, DECK + B66 + P3 / 2, (z0 + z1) / 2]), [0, 0.45 + 0.05 * k, 0], 18);
    // Les deux planches les plus près de la foreuse sont vissées.
    if (k < 2) for (const z of [z0 + B66 / 2, z1 - B66 / 2]) screws.push([x, DECK + B66 + P3, z]);
  }
  put('3', lagScrews(S, screws), [0, 0.75, 0], 18);
  return { view: { dir: [1.2, 1.0, -0.6] } };
}

export { P8 };
