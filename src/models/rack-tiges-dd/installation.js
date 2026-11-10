// Installation du support de tiges selon la procédure PRO-DD-ST-008 (révision
// août 2024), étape par étape : boulon à œil dans un trou de 18 po à ± 5 pi du
// plancher, support incliné entre 75° et 80°, pattes du haut appuyées au mur,
// chaîne d'ancrage passée dans le boulon à œil puis dans les œillets et tendue,
// tiges en quinconce appuyées sur les barres du fond, chaîne de retenue dans
// les crochets fermés.
//
// Chaque pièce porte le numéro de son étape (userData.step). Les outils, les
// travailleurs et les repères de mesure ne sont montrés qu'à leur étape
// (userData.stepOnly) ; un repère peut porter un thème (userData.stepTag) pour
// être montré seul (vidéo : une idée à la fois) ; un thème en « + » n'est
// montré qu'à la demande (vue en coupe du trou). Couleurs des repères :
// orange = mesure, vert = permis, rouge = limite ou interdit, bleu = sens du geste.
import { IN, T2, T15, T25, NQ, SIDE, CLEAR, SPLIT, XP, H_TOP, H_LOW, WALL, FRONT, ANGLE, TILT, SIN, COS, LIFT, W, HOOK, LUG, CHAIN, chainAlong, pathLength } from './support.js';
import { WALL_Z, FT5, rockAt, fromDeck, decor, place, DECK, SEC, DRILL } from './chantier.js';
import { HOLE, BOLT, LEVER, eyeBolt, hole, binder, hammerDrill, tournevis } from './outils.js';
import { cote, pointille, arc, rayon, secteur, fleche, bande, niveau, polar } from './reperes.js';
import { travailleur } from './travailleur.js';

const ROCK_EYE = rockAt(0, FT5); // face de la roche au trou
const EYE = [0, FT5, ROCK_EYE + BOLT.eye]; // centre de l'œil du boulon : centre du support, à ± 5 pi du plancher
const ARM_END = W(0, H_TOP, -WALL); // bout des pattes du haut, à la paroi
const HOOK_MIN = 66 * IN, HOOK_MAX = 72 * IN; // hauteur permise des crochets fermés (procédure)
const smooth = (u) => u * u * (3 - 2 * u);

// Tiges usagées : teinte choisie d'après la place de la tige (toujours la même pour une tige).
const ROD_TONES = ['rodWorn', 'rodRust', 'rodDull', 'rodWorn', 'rodRustDark', 'rodRust', 'rodDull'];
function rodTone(k, c) {
  const h = Math.sin(k * 127.1 + c * 311.7) * 43758.5453;
  return ROD_TONES[Math.floor((h - Math.floor(h)) * ROD_TONES.length)];
}

/**
 * Paquet de tiges en coupe (repère du support : x le long des traverses, z vers
 * les tiges) : centre de chaque tige, rangée par rangée, à partir de la gauche.
 * La rangée du fond s'appuie sur les traverses (la section intérieure, plus
 * mince que le manchon, laisse reculer les tiges de gauche de 6 mm) ; chaque
 * tige des rangées suivantes repose dans le creux des tiges de la rangée
 * précédente : le quinconce.
 */
function packing() {
  const r = NQ.od / 2, R = NQ.od, step = (T2 - T15) / 2;
  const back = (x) => { // recul permis par la section intérieure de la traverse
    const d = SPLIT - x;
    return d <= 0 ? 0 : d >= r ? step : Math.min(step, r - Math.sqrt(r * r - d * d));
  };
  const rows = [];
  for (let k = 0; k < NQ.rows; k++) {
    const row = [];
    for (let c = 0; c < NQ.cols; c++) {
      const x = -CLEAR / 2 + SIDE + r + c * R + (k % 2 ? r : 0);
      if (k === 0) { row.push({ x, z: T2 / 2 + r - back(x) }); continue; }
      // Dans le creux des tiges de la rangée précédente : contre la plus avancée des deux
      // (au droit du changement de section de la traverse, l'autre garde un jeu de quelques millimètres).
      const under = rows[k - 1].filter((q) => Math.abs(q.x - x) < R * 0.75);
      row.push({ x, z: Math.max(...under.map((a) => a.z + Math.sqrt(R * R - (x - a.x) ** 2))) });
    }
    rows.push(row);
  }
  return rows;
}

/** Devant du paquet de tiges (plus un jeu) à la hauteur yw du chantier, au point x. */
const frontAt = (x, yw, off = 0.012) => W(x, (yw - (FRONT + off) * SIN - LIFT) / COS, FRONT + off);
const FOOT_FRONT = [0, frontAt(0, 0, 0)[2]]; // [y, z] du pied de la rangée du devant (sommet de l'angle des tiges)
const PIED = [LIFT, 0]; // [y, z] du pied du support (sommet de l'angle du support)
// Chaîne de retenue : point bas au centre quand elle est lâche (5 pi 2 po) ; sa longueur, l'avance
// du paquet qu'elle permet et l'angle où elle l'arrête sont calculés à la construction (P02).
export const RETENUE = { low: 62 * IN, longueur: 0, avance: 0, arret: 0 };

export function P02(api) {
  const S = api.S;
  const put = (ref, obj, explode, step, o = {}) => {
    obj.userData.step = step;
    if (o.seq !== undefined) obj.userData.seq = o.seq;
    if (o.noDrop) obj.userData.noDrop = true;
    return api.part(ref, obj, explode, { noLabel: !!o.noLabel });
  };
  /** Objet montré seulement à ses étapes (outil, travailleur, repère de mesure), avec un thème éventuel. */
  const guide = (obj, steps, tag) => {
    obj.userData.stepOnly = [].concat(steps);
    if (tag) obj.userData.stepTag = tag;
    obj.visible = false; // affiché par le montage par étapes, à son étape
    api.add(obj);
    return obj;
  };

  // ------------------------------------------------------------------ décor
  const { rock, deck, cibles } = decor(api);
  put('M', rock, [0, 0, 0], -1, { noLabel: true });
  put('S', deck, [0, 0, 0], -1, { noLabel: true });

  // ------------------------------------------- étape 1 : choisir l'endroit
  // Lignes de tir des trous de forage (des fonds de trous marqués sur le front
  // de taille, le long de la galerie) et emplacement retenu, près du mur.
  const lanes = S.group();
  for (const dz of [0, 1.3]) {
    lanes.add(S.box(SEC + 0.1, 0.004, 0.5, 'zoneRouge', { pos: [SEC / 2, DECK + 0.006, DRILL.z + dz] }));
    lanes.add(pointille(S, [0, DECK + 0.014, DRILL.z + dz], [SEC, DECK + 0.014, DRILL.z + dz], { material: 'fluoRed', r: 0.008, dash: 0.25, gap: 0.15 }));
  }
  guide(place(S, lanes), [1], 'tir');
  // Cibles rouges des fonds de trous : avec les lignes de tir seulement (ailleurs, le rouge veut dire « limite »).
  guide(cibles, [1], 'tir');
  guide(S.box(2 * XP + 0.5, 0.004, 1.05, 'zoneVerte', { pos: [0, 0.006, 0.1] }), [1], 'mur');

  // ------------------------------------------ étape 2 : percer le trou au mur
  const collar = S.at(hole(S), [0, FT5, ROCK_EYE]);
  collar.userData.step = 2;
  api.add(collar);
  // Foreuse à percussion et travailleur qui la tient : ils avancent de 18 po pendant le perçage.
  const drilling = S.group(hammerDrill(S));
  const drillPart = S.at(S.group(drilling), [0, FT5, ROCK_EYE]);
  drillPart.userData.stepOnly = [2];
  drillPart.visible = false;
  api.part('8', drillPart, [0, 0, 0.6], { noLabel: true });
  const driller = S.group(S.at(travailleur(S, 'perce'), [0.02, -FT5, 1.52]));
  guide(S.at(S.group(driller), [0, FT5, ROCK_EYE]), [2]);
  // Le trou en coupe (voir plus bas) se creuse à mesure que la mèche avance.
  const groove = S.box(0.003, 0.034, HOLE, 'rockFloor');
  drillPart.userData.stepAnim = { step: 2, delay: 900, dur: 5200, update: (k) => {
    drilling.position.z = -HOLE * k + (k > 0 && k < 1 ? 0.004 * Math.sin(k * 260) : 0);
    driller.position.z = -HOLE * k;
    groove.scale.z = Math.max(0.001, k);
    groove.position.set(-0.0015, FT5, ROCK_EYE - (HOLE * k) / 2);
  } };
  // Cotes, dans l'ordre de la procédure : centre du support, 18 po de profond, ± 5 pi du plancher.
  const zc = ROCK_EYE + 0.07;
  const posts = S.group();
  for (const s of [-1, 1]) posts.add(pointille(S, [s * XP, 0.02, zc], [s * XP, FT5 + 0.75, zc], { material: 'repereVert', r: 0.006, dash: 0.1, gap: 0.07 }));
  guide(S.group(
    posts,
    cote(S, [-XP, FT5 + 0.55, zc], [XP, FT5 + 0.55, zc], { side: [0, 1, 0] }),
    pointille(S, [0, FT5 + 0.55, zc], [0, FT5 + 0.06, zc], { material: 'fluoOrange', r: 0.004, dash: 0.05, gap: 0.04 }),
  ), [2], 'centre');
  guide(cote(S, [-0.13, FT5 + 0.1, ROCK_EYE], [-0.13, FT5 + 0.1, ROCK_EYE + HOLE], { side: [0, 1, 0], tick: 0.04 }), [2], 'prof');
  guide(S.group(
    cote(S, [-0.42, 0, zc], [-0.42, FT5, zc], { side: [1, 0, 0] }),
    pointille(S, [-0.42, FT5, zc], [-0.05, FT5, zc], { material: 'fluoOrange', r: 0.004, dash: 0.05, gap: 0.04 }),
  ), [2], 'haut');
  // Vue en coupe du trou (à la demande, étapes 2 et 3) : tranche de roche passant par
  // l'axe du trou, vue de l'intérieur de la roche ; le trou y paraît en sombre.
  guide(S.group(S.box(0.02, 1.5, 1.5, 'rock', { pos: [-0.012, FT5, ROCK_EYE - 0.75 - 0.004] }), groove), [2, 3], '+coupe');
  guide(cote(S, [0.03, FT5 + 0.11, ROCK_EYE - HOLE], [0.03, FT5 + 0.11, ROCK_EYE], { side: [0, 1, 0], tick: 0.05, r: 0.004 }), [2, 3], '+coupe');
  // Étape 3 : espace laissé au fond du trou, au bout de la tige du boulon.
  guide(S.box(0.004, 0.034, HOLE - BOLT.in, 'zoneVerte', { pos: [0.016, FT5, ROCK_EYE - (HOLE + BOLT.in) / 2] }), [3], '+coupe');

  // ------------------------------------- étape 3 : insérer le boulon à œil
  const bolt = eyeBolt(S);
  const boltPart = S.at(S.group(bolt), [0, FT5, ROCK_EYE]);
  put('3', boltPart, [0, 0, 0.35], 3, { noDrop: true });
  boltPart.userData.stepAnim = { step: 3, delay: 600, dur: 2600, update: (k) => { bolt.position.z = (1 - smooth(k)) * 0.44; } };

  // --------------------------- étape 4 : à deux, lever et appuyer le support
  const rack = api.sub('P01', { inPlace: true, loaded: true });
  put('1', rack, [0, 0, 0], 4, { noDrop: true });
  const lifters = S.group([-1, 1].map((s) => S.at(travailleur(S, 'porte'), [s * XP, 0, 0.3])));
  guide(lifters, [4]);
  // Appui des pattes du haut sur la paroi (anneaux verts, quand le support y est).
  const contacts = S.group([-1, 1].map((s) => S.ring(0.075, 0.058, 0.004, 'repereVert', { axis: 'z', pos: [s * XP, ARM_END[1], WALL_Z + 0.02], seg: 28 })));
  guide(contacts, [4], 'appui');
  // Le support, tenu debout à deux, est incliné jusqu'à ce que les pattes du haut s'appuient au mur.
  rack.userData.stepAnim = { step: 4, delay: 700, dur: 3400, update: (k) => {
    const tilt = TILT * smooth(k);
    rack.rotation.x = -tilt;
    rack.position.y = (T25 / 2) * Math.sin(tilt);
    lifters.position.z = 0.3 * (1 - smooth(k));
    contacts.scale.setScalar(k >= 0.97 ? 1 : 0.001);
  } };

  // --------------------------------------------- étape 5 : vérifier l'angle
  // Niveau numérique sur le poteau (photo de la procédure) ; au pied du poteau,
  // zone permise de 75° à 80° en vert, trop couché et trop debout en rouge.
  const lev = niveau(S, `${ANGLE.toFixed(1)}°`);
  lev.rotation.x = -TILT;
  guide(S.at(lev, W(XP, 1.36, T2 / 2 + 0.0005)), [5]);
  const xg = XP + 0.1;
  guide(S.group(
    secteur(S, xg, PIED, 0.3, 1.15, 62, 75, { material: 'zoneRouge' }),
    secteur(S, xg, PIED, 0.3, 1.3, 75, 80),
    secteur(S, xg, PIED, 0.3, 1.15, 80, 90, { material: 'zoneRouge' }),
    rayon(S, xg, PIED, 1.36, 75, { material: 'repereVert' }), rayon(S, xg, PIED, 1.36, 80, { material: 'repereVert' }),
    rayon(S, xg, PIED, 0.85, 0), arc(S, xg, PIED, 0.55, 0, ANGLE),
  ), [5]);

  // ------------------- étapes 6 à 8 : chaîne d'ancrage et tendeur à cliquet
  const lz = -T2 / 2 - 0.055, ly = LUG - 0.01; // trou de l'œillet (repère du support)
  const mid = W(0, ly, lz);
  // Tendue (slack = 0) ou lâche : de l'œil du boulon à l'œillet, puis vers le tendeur au centre.
  const half = (s, slack) => [
    W(s * 0.15, ly, lz), [s * XP * 0.5, mid[1] - 0.16 * slack, mid[2] + 0.02 * slack], W(s * (XP - 0.14), ly, lz), W(s * XP, ly, lz),
    W(s * (XP + 0.07), ly - 0.03, lz - 0.05),
    [s * XP * 0.55, (mid[1] + FT5) / 2 - 0.05 - 0.22 * slack, (mid[2] + EYE[2]) / 2],
  ];
  const chain = (pts) => chainAlong(api, pts, 'chaineOr', CHAIN);
  const LEVELS = 5;
  const tension = Array.from({ length: LEVELS }, (_, i) => {
    const slack = 1 - i / (LEVELS - 1);
    return chain([...half(-1, slack), EYE, ...half(1, slack).reverse()]);
  });
  const LEN = pathLength([...half(-1, 0), EYE, ...half(1, 0).reverse()]); // la même chaîne aux étapes 6 et 7
  // Étape 6 : passée dans le boulon à œil jusqu'à son milieu ; les deux moitiés pendent, le surplus posé sur le plancher.
  const ez = EYE[2], lay = Math.max(0.1, LEN / 2 - FT5);
  const hang = (s) => [[s * (0.06 + lay), 0.016, ez + 0.12], [s * 0.08, 0.018, ez + 0.04], [s * 0.035, 0.35, ez + 0.005], [s * 0.028, FT5 - 0.14, ez]];
  const loop = [0, FT5 - 0.016, ez]; // la chaîne repose au bas de l'œil
  const hanging = chain([...hang(-1), loop, ...hang(1).reverse()]);
  // Étape 7 : chaque bout passé dans son œillet, de l'extérieur vers l'intérieur ; les bouts pendent, pas encore reliés.
  const lugW = W(XP, ly, lz);
  const tail = Math.max(0.2, LEN / 2 - Math.hypot(XP + 0.07, mid[1] - FT5, mid[2] - EYE[2]) - 0.1);
  const thread = (s) => [
    [s * (XP - 0.06), lugW[1] - tail, lugW[2] + 0.02], [s * (XP - 0.055), lugW[1] - 0.12, lugW[2] + 0.005], [s * (XP - 0.03), lugW[1] - 0.005, lugW[2]],
    W(s * (XP + 0.07), ly - 0.03, lz - 0.05), [s * XP * 0.55, (mid[1] + FT5) / 2 - 0.27, (mid[2] + EYE[2]) / 2],
  ];
  const oneSide = chain([...hang(-1), EYE, ...thread(1).reverse()]); // un bout passé, l'autre pend encore
  const threaded = chain([...thread(-1), EYE, ...thread(1).reverse()]);
  const variants = [hanging, oneSide, threaded, ...tension];
  const show = (m) => variants.forEach((v) => { v.visible = v === m; });
  show(tension[LEVELS - 1]);
  const anchor = S.group(variants);
  anchor.userData.stepAnim = { step: 7, delay: 900, dur: 4000, update: (k) => show(k < 0.2 ? hanging : k < 0.7 ? oneSide : threaded) };
  put('4', anchor, [0, 0.35, 0.2], 6, { noDrop: true });
  // Sens du passage dans les œillets : de l'extérieur vers l'intérieur.
  for (const s of [-1, 1]) guide(fleche(S, [s * (XP + 0.32), lugW[1] + 0.09, lugW[2]], [s * (XP + 0.04), lugW[1] + 0.09, lugW[2]], { r: 0.008, head: 0.08 }), [7]);
  // Étape 8 : les bouts sont reliés par le tendeur, le levier du cliquet est pompé et la chaîne se tend.
  const b = binder(S);
  put('5', S.at(S.group(b), mid), [0, 0.6, 0.2], 8);
  const PUMPS = 6;
  b.userData.stepAnim = { step: 8, delay: 1100, dur: 6000, update: (k) => {
    b.userData.lever.rotation.x = LEVER.rest + (k > 0 && k < 1 ? LEVER.travel * (0.5 - 0.5 * Math.cos(k * PUMPS * 2 * Math.PI)) : 0);
    // k = 0 : la chaîne garde l'état de l'étape 7 (animation de la chaîne, jouée avant celle-ci).
    if (k > 0) show(tension[Math.round(k * (LEVELS - 1))]);
  } };

  // ------------------ étapes 9 et 10 : tiges en quinconce, appuyées au fond
  // Par rangée à partir de la gauche, appuyées sur les traverses (et non sur les côtés), pieds au sol.
  const rods = [];
  packing().forEach((row, k) => {
    row.forEach(({ x, z }, c) => {
      const yb = -((z - NQ.od / 2) * SIN + LIFT) / COS; // bas de la tige : son arête touche le sol
      const rod = S.shell(NQ.od / 2, NQ.id / 2, NQ.len, rodTone(k, c), { seg: 14 });
      rod.rotation.x = -TILT;
      S.at(rod, W(x, yb + NQ.len / 2, z));
      put('2', rod, [0, 0, 1.2 + k * 0.05], 9, { seq: k, noLabel: k + c > 0 });
      rods.push({ rod, foot: W(x, yb, z), home: rod.position.clone() });
    });
  });
  // Sens de chargement : de la gauche vers la droite (schéma de la procédure).
  const top = W(0, NQ.len + 0.14, T2 / 2 + NQ.od * 1.5);
  guide(fleche(S, [-0.72, top[1], top[2]], [0.72, top[1], top[2]], { r: 0.012, head: 0.13 }), [9]);
  // Étape 10 : appui sur les barres transversales du fond (vert), pas sur les côtés (rouge).
  const fond = S.group();
  for (const h of [H_TOP, H_LOW]) {
    // Section intérieure (plus mince, à gauche) et manchon : la bande suit la face d'appui de chacune.
    for (const [x0, x1, t] of [[-CLEAR / 2 + 0.03, SPLIT, T15], [SPLIT, CLEAR / 2 - 0.03, T2]]) {
      const st = S.box(x1 - x0, 0.02, 0.004, 'repereVert');
      st.rotation.x = -TILT;
      fond.add(S.at(st, W((x0 + x1) / 2, h + T2 / 2 + 0.014, t / 2 - 0.004)));
    }
  }
  guide(fond, [10], 'fond');
  const cotes = S.group();
  for (const s of [-1, 1]) {
    // Face intérieure de chaque côté (poteau, patte du haut et sa rallonge) : pas d'appui ici.
    const side = S.box(0.004, 0.3, FRONT + 0.12, 'zoneRouge');
    side.rotation.x = -TILT;
    cotes.add(S.at(side, W(s * (CLEAR / 2 - 0.003), H_TOP - 0.02, FRONT / 2)));
  }
  guide(cotes, [10], 'cotes');

  // ------------------------------- étapes 11 à 13 : chaîne de retenue
  // D'un crochet fermé à l'autre, devant les tiges ; lâche, elle ne descend jamais sous 5 pi au centre.
  const hookW = W(XP, HOOK, T2 / 2 + 0.022);
  const yc = hookW[1] - 0.035;
  const corner = (u, y, p = 0, off = 0.018) => { const q = frontAt(u * (XP - 0.03), y, off); return [q[0], q[1], q[2] + p]; };
  const ring = (s) => [s * XP, hookW[1], hookW[2] + 0.01]; // anneau du crochet fermé
  const U = [-1, -0.6, 0, 0.6, 1];
  // Lâche : le long du poteau jusqu'au devant du paquet, puis en travers, avec son mou au centre.
  const restPts = [ring(-1), W(-XP, HOOK - 0.02, T2 / 2 + (FRONT - T2 / 2) * 0.55), ...U.map((u) => corner(u, yc - (yc - RETENUE.low) * (1 - u * u))),
    W(XP, HOOK - 0.02, T2 / 2 + (FRONT - T2 / 2) * 0.55), ring(1)];
  // Tendue par le paquet avancé de p : droite de l'anneau au coin du paquet, droite en travers.
  const tautPts = (p) => {
    const span = U.map((u) => corner(u, yc, p, 0));
    const mid = (a, c) => a.map((v, i) => (v + c[i]) / 2);
    return [ring(-1), mid(ring(-1), span[0]), ...span, mid(ring(1), span[4]), ring(1)];
  };
  // Longueur de la chaîne, et avance du paquet qu'elle permet avant d'être tendue : l'angle où elle l'arrête.
  const curve = (pts) => new api.THREE.CatmullRomCurve3(pts.map((q) => new api.THREE.Vector3(...q)), false, 'centripetal').getLength();
  RETENUE.longueur = curve(restPts);
  let p0 = 0, p1 = 0.5;
  for (let i = 0; i < 40; i++) { const m = (p0 + p1) / 2; if (curve(tautPts(m)) < RETENUE.longueur) p0 = m; else p1 = m; }
  const rad = (d) => (d * Math.PI) / 180;
  RETENUE.avance = p0;
  RETENUE.arret = (Math.acos(Math.cos(rad(ANGLE)) - (p0 * Math.sin(rad(ANGLE))) / yc) * 180) / Math.PI;
  // De la chaîne lâche (au repos) à la chaîne tendue par le paquet qui bascule.
  const NR = 5;
  const retVariants = Array.from({ length: NR }, (_, i) => {
    const u = i / (NR - 1), t = tautPts(p0);
    return chainAlong(api, restPts.map((q, j) => q.map((v, c) => v + (t[j][c] - v) * u)), 'blue', CHAIN);
  });
  const showRet = (i) => retVariants.forEach((v, j) => { v.visible = j === i; });
  showRet(0);
  const retenue = S.group(retVariants);
  put('6', retenue, [0, 0, 1.9], 11, { noDrop: true });

  // Étape 12 : les tiges ne doivent pas pouvoir dépasser 80° en chutant vers un travailleur.
  // Animation : le paquet bascule vers le travailleur, chaque tige sur son pied ; la chaîne
  // se tend et l'arrête avant 80° (RETENUE.arret) ; puis il revient s'appuyer au fond.
  const LIMIT = 80;
  const lean = (k) => (k <= 0 || k >= 1 ? 0 : k < 0.3 ? smooth(k / 0.3) : k < 0.72 ? 1 : 1 - smooth((k - 0.72) / 0.28));
  retenue.userData.stepAnim = { step: 12, delay: 1200, dur: 5000, update: (k) => {
    const u = lean(k), a = rad(ANGLE + (RETENUE.arret - ANGLE) * u);
    for (const r of rods) {
      if (u === 0) { r.rod.position.copy(r.home); r.rod.rotation.x = -TILT; continue; }
      r.rod.position.set(r.foot[0], r.foot[1] + (NQ.len / 2) * Math.sin(a), r.foot[2] - (NQ.len / 2) * Math.cos(a));
      r.rod.rotation.x = a - Math.PI / 2;
    }
    showRet(Math.round(u * (NR - 1)));
  } };
  // Le travailleur vers qui les tiges ne doivent pas tomber.
  const watcher = travailleur(S, 'debout');
  watcher.rotation.y = 0.25;
  guide(S.at(watcher, [0.35, 0, 2.05]), [12]);
  const xr = XP + 0.1;
  const g80 = S.group(
    secteur(S, xr, FOOT_FRONT, 0.3, 2.2, LIMIT, 93, { material: 'zoneRouge' }),
    rayon(S, xr, FOOT_FRONT, 2.75, LIMIT, { material: 'fluoRed', r: 0.007 }),
    arc(S, xr, FOOT_FRONT, 0.5, 0, LIMIT, { material: 'fluoRed', r: 0.004 }),
  );
  guide(g80, [12]);

  // Étape 13 (encadré de la procédure) : crochets entre 66 et 72 po du sol, pour que la
  // chaîne lâche ne soit jamais à moins de 5 pi du sol au centre ; marques à 5 pi.
  const crochets = S.group();
  for (const s of [-1, 1]) {
    const band = bande(S, T2, (HOOK_MAX - HOOK_MIN) / COS);
    band.rotation.x = -TILT;
    crochets.add(S.at(band, W(s * XP, ((HOOK_MIN + HOOK_MAX) / 2 - LIFT) / COS, 0)));
  }
  const zh = W(0, HOOK, T2 / 2 + 0.06)[2];
  const xh = XP + 0.2;
  crochets.add(cote(S, [xh, 0, zh], [xh, HOOK_MAX, zh], { side: [1, 0, 0], tick: 0.07 }), S.rod([xh - 0.07, HOOK_MIN, zh], [xh + 0.07, HOOK_MIN, zh], 0.005, 'fluoOrange', 8));
  guide(crochets, [13], 'crochets');
  const z5 = frontAt(0, FT5, 0.04)[2];
  guide(S.group(
    pointille(S, [-XP - 0.34, FT5, z5], [XP + 0.06, FT5, z5], { material: 'repereVert', r: 0.007, dash: 0.1, gap: 0.06 }),
    cote(S, [-XP - 0.28, 0, z5], [-XP - 0.28, FT5, z5], { side: [1, 0, 0] }),
  ), [13], 'g5');
  // Marques à 5 pi du sol sur les poteaux (photo de la procédure).
  for (const s of [-1, 1]) {
    const m = S.box(T2 + 0.003, 0.03, T2 + 0.003, 'white');
    m.rotation.x = -TILT;
    S.at(m, W(s * XP, (FT5 - LIFT) / COS, 0));
    put('7', m, [0, 0, 0], 13, { noLabel: s > 0, noDrop: true });
  }

  // ---------------------------------------- étape 14 : prendre les tiges
  // Tournevis plat glissé entre deux tiges du devant pour les séparer.
  const driver = tournevis(S);
  driver.rotation.x = -TILT;
  S.at(driver, W(-CLEAR / 2 + SIDE + NQ.od * (NQ.rows % 2 ? 11 : 11.5), 1.25, FRONT - NQ.od * 0.45));
  driver.userData.stepOnly = [14];
  driver.visible = false;
  api.part('9', driver, [0, 0, 1.4], { noLabel: true });

  // Hors du montage par étapes, le modèle est dans son état final : chaque animation à son terme, dans l'ordre des étapes.
  const anims = [];
  for (const o of [drillPart, boltPart, rack, anchor, b, retenue]) anims.push(o.userData.stepAnim);
  anims.sort((x, y) => x.step - y.step).forEach((a) => a.update(1));

  return { view: { dir: [0.95, 0.6, 1.2], steps: STEPS, stepsAuto: true, stepFlash: true, notes: NOTES } }; // video: 'equipment/rack-tiges-dd/video/' (lien remis quand la nouvelle vidéo est publiée)
}

// Caméras du montage par étapes du site (reculées de 55 % par l'interface).
const CAM = {
  wide: { pos: [-2.2, 1.9, 3.0], tgt: [0, 1.3, -0.3] },
  site: { pos: [1.6, 2.6, 3.2], tgt: [-0.9, 0.6, 0.5] },
  wall: { pos: [-1.3, 1.7, 1.3], tgt: [-0.05, 1.3, WALL_Z] },
  bolt: { pos: [0.75, 1.65, -0.2], tgt: [0, FT5, WALL_Z] },
  side: { pos: [3.4, 1.2, -0.2], tgt: [0.8, 1.05, -0.35] },
  anchor: { pos: [0.9, 2.5, 0.9], tgt: [0, 1.85, -0.65] },
  top: { pos: [0.3, 5.2, 1.3], tgt: [0, 2.6, -0.3] },
  front: { pos: [-1.6, 1.75, 2.5], tgt: [0, 1.45, 0.2] },
  profile: { pos: [3.6, 1.5, 0.3], tgt: [0.9, 1.4, 0.15] },
};

// Étapes de la procédure PRO-DD-ST-008 (l'indice est le numéro de l'étape).
export const STEPS = [
  { n: 0, cam: CAM.wide, page: 'P07', title: 'Avant de commencer', text: "Le travailleur respecte la procédure, particulièrement la quantité et l'angle d'empilage dans le support. Le superviseur fait respecter la procédure en tout temps et fait reprendre toute installation non conforme. La mine fore des trous de service, à l'aide de son équipement de forage pour le soutènement, avant de quitter le site de forage au diamant, pour y introduire des boulons à œil." },
  { n: 1, cam: CAM.site, page: 'P07', title: "Choisir l'endroit", text: 'Opter pour un endroit près du mur et loin de la ligne de tir des trous de forage (voir les exemples de positionnement, page P11).' },
  { n: 2, cam: CAM.wall, page: 'P08', title: 'Percer le trou au mur', text: 'Au mur, situer le centre du support et faire un trou de 18 po de profond avec la foreuse à percussion électrique, à ± 5 pi du plancher.' },
  { n: 3, cam: CAM.bolt, page: 'P08', title: 'Insérer le boulon à œil', text: "Insérer le boulon à œil (eye bolt), mais ne pas l'enfoncer jusqu'au fond du trou." },
  { n: 4, cam: CAM.wide, page: 'P08', title: 'Lever le support à deux', text: "À deux, soulever le support et positionner adéquatement les pattes du haut pour qu'elles soient bien appuyées au mur." },
  { n: 5, cam: CAM.side, page: 'P08', title: "Vérifier l'angle", text: "S'assurer d'avoir un angle entre 75° et 80°." },
  { n: 6, cam: CAM.anchor, page: 'P08', title: 'Passer la chaîne dans le boulon à œil', text: "Passer une chaîne dans le boulon à œil jusqu'à son milieu." },
  { n: 7, cam: CAM.anchor, page: 'P08', title: 'Passer la chaîne dans les œillets', text: "Passer chaque bout de chaîne dans l'œillet du support qui lui est destiné, de l'extérieur vers l'intérieur." },
  { n: 8, cam: CAM.anchor, page: 'P08', title: 'Tendre la chaîne', text: 'Relier les deux bouts de chaîne avec un tendeur à cliquet de chaîne et serrer le tendeur au maximum, ou avec un tendeur de type « bear trap ».' },
  { n: 9, cam: CAM.top, page: 'P09', title: 'Placer les tiges en quinconce', text: 'Placer les tiges dans le support en quinconce, par rangée, à partir de la gauche.' },
  { n: 10, cam: CAM.top, page: 'P09', title: 'Appuyer les tiges au fond', text: "S'assurer d'appuyer les tiges sur la barre transversale du fond, et non sur les côtés." },
  { n: 11, cam: CAM.front, page: 'P09', title: 'Placer la chaîne de retenue', text: 'Placer une chaîne de retenue de tiges, accrochée solidement dans les 2 crochets fermés de chaque côté du support.' },
  { n: 12, cam: CAM.profile, page: 'P09', title: 'Ajuster la chaîne', text: 'La chaîne doit être ajustée de façon que les tiges ne puissent dépasser 80° si elles chutent vers un travailleur.' },
  { n: 13, cam: CAM.front, page: 'P09', title: 'La chaîne, en tout temps', text: "La chaîne de retenue doit être utilisée en tout temps, sauf pendant l'ajout et le retrait des tiges en continu. Les crochets doivent être à 72 po au maximum et à 66 po au minimum du sol, pour s'assurer que la chaîne lâche (« lousse ») ne soit jamais à moins de 5 pi du sol au centre." },
  { n: 14, cam: CAM.front, page: 'P10', title: 'Prendre les tiges', text: 'La graisse sur les tiges peut les rendre difficiles à prendre : un tournevis plat est préconisé pour les séparer et aider à les prendre.' },
  { n: 15, cam: CAM.wide, page: 'P10', title: 'Capacité maximale', text: 'Selon la résistance du support — HQ : 108 tiges (324 m). NQ : 184 tiges (552 m). BQ : 240 tiges (720 m).' },
];

// Étiquettes posées dans la scène, à leur étape. kind : 'ok' (permis, vert), 'no' (limite ou interdit, rouge) ; tag : thème.
const zHook = W(0, HOOK, T2 / 2 + 0.06)[2];
const NOTES = [
  { steps: [1], tag: 'mur', pos: [0, 0.35, 0.1], text: 'Près du mur', kind: 'ok' },
  { steps: [1], tag: 'tir', pos: fromDeck(SEC * 0.42, DECK + 0.3, DRILL.z), text: 'Ligne de tir', kind: 'no' },
  { steps: [2], tag: 'centre', pos: [0, FT5 + 0.8, ROCK_EYE + 0.07], text: 'Centre du support' },
  { steps: [2], tag: 'prof', pos: [-0.13, FT5 + 0.32, ROCK_EYE + HOLE * 0.5], text: '18 po de profond' },
  { steps: [2], tag: 'haut', pos: [-0.42, FT5 * 0.5, ROCK_EYE + 0.07], text: '± 5 pi du plancher' },
  { steps: [2, 3], tag: '+coupe', pos: [0.03, FT5 + 0.17, ROCK_EYE - HOLE / 2], text: 'Trou : 18 po de profond' },
  { steps: [3], tag: '+coupe', pos: [0.03, FT5 - 0.07, ROCK_EYE - (HOLE + BOLT.in) / 2], text: 'Pas jusqu’au fond', kind: 'ok' },
  { steps: [3], tag: 'boulon', pos: [0, FT5 + 0.24, EYE[2]], text: 'Pas jusqu’au fond du trou' },
  { steps: [4], tag: 'appui', pos: [0, ARM_END[1] + 0.02, WALL_Z + 0.06], text: 'Pattes du haut bien appuyées au mur', kind: 'ok' },
  { steps: [5], pos: polar(XP + 0.1, PIED, 0.7, 40), text: `${ANGLE}°` },
  { steps: [5], pos: polar(XP + 0.1, PIED, 1.46, 73.2), text: '75°', kind: 'ok' },
  { steps: [5], pos: polar(XP + 0.1, PIED, 1.46, 81.8), text: '80°', kind: 'ok' },
  { steps: [6], pos: [0, FT5 + 0.26, EYE[2]], text: 'Jusqu’au milieu de la chaîne' },
  { steps: [7], pos: [XP + 0.2, W(0, LUG, 0)[1] + 0.2, W(0, LUG, -0.08)[2]], text: "De l'extérieur vers l'intérieur" },
  { steps: [7], pos: [-XP - 0.2, W(0, LUG, 0)[1] + 0.2, W(0, LUG, -0.08)[2]], text: "De l'extérieur vers l'intérieur" },
  { steps: [8], pos: [0, W(0, LUG, 0)[1] + 0.46, W(0, LUG, -0.08)[2]], text: 'Serrer au maximum' },
  { steps: [9], pos: [0, W(0, NQ.len, 0)[1] + 0.42, W(0, NQ.len, 0.12)[2]], text: 'À partir de la gauche · 23 tiges NQ par rangée' },
  { steps: [10], tag: 'fond', pos: [0, W(0, H_TOP, 0)[1] + 0.3, W(0, H_TOP, 0)[2] - 0.05], text: 'Appui : barre du fond', kind: 'ok' },
  { steps: [10], tag: 'cotes', pos: W(XP - 0.02, H_TOP + 0.28, T2 / 2 + FRONT * 0.75), text: 'Pas sur les côtés', kind: 'no' },
  { steps: [11], pos: [XP, HOOK * COS + 0.2, zHook], text: 'Crochet fermé' },
  { steps: [11], pos: [-XP, HOOK * COS + 0.2, zHook], text: 'Crochet fermé' },
  { steps: [12], pos: polar(XP + 0.1, FOOT_FRONT, 2.05, 81.5), text: 'Limite : 80°', kind: 'no' },
  { steps: [13], tag: 'crochets', pos: [XP + 0.55, HOOK_MAX + 0.07, zHook], text: '72 po au maximum', kind: 'ok' },
  { steps: [13], tag: 'crochets', pos: [XP + 0.55, HOOK_MIN - 0.01, zHook], text: '66 po au minimum', kind: 'ok' },
  { steps: [13], tag: 'g5', pos: [0, FT5 - 0.1, frontAt(0, FT5, 0.04)[2]], text: 'Au centre : jamais à moins de 5 pi du sol', kind: 'ok' },
  { steps: [14], pos: W(0, 1.52, FRONT + 0.25), text: 'Tournevis plat pour séparer les tiges' },
  { steps: [15], pos: [0, W(0, NQ.len, 0)[1] + 0.42, W(0, NQ.len, 0.12)[2]], text: '8 rangées × 23 tiges = 184 tiges NQ' },
];
