// Coffre à outils ITH (Machines Roger International) : modèle 3D d'après le
// dessin 087 « Coffre à outil ITH » (M.R.I. Inc., D. Côté, juin 2011) : plan de
// coupes des tôles, trois vues cotées et détails 1 à 3. L'épaisseur des tôles
// et les pentures ne sont pas détaillées sur le dessin (estimées). La peinture
// (rouge dehors, blanc dedans) et les ajouts du coffre ouvert (tiroir, panier,
// crochets, autocollant) viennent des photos ; le contenu n'est pas modélisé.
// Sur le dessus, à gauche : support de tube D-D du dessin 0102803 (P03) ; sa
// position et son orientation sur le coffre ne figurent sur aucun dessin.
// Sur le côté gauche : boîte à clés du dessin Foresco C16062863 (P04), placée
// d'après une photo du coffre (vers le bas du côté, à mi-profondeur), non cotée.
// Repère : X largeur, Y vers le haut, +Z côté portes.

import epiroc from '../epiroc-ith/index.js';
import { reuse } from '../reuse.js';

// Contenu du coffre (liste de matériel du coffre 629, calibre N) : outils du
// catalogue Epiroc repris tels quels — carottier NU Excore (P076), tête (P077),
// overshot Excore II (P080) et leurs sous-assemblages.
const EPIROC = reuse(epiroc, { E076: 'P076', E077: 'P077', E080: 'P080', E098: 'P098', E100: 'P100', E096: 'P096' });

const IN = 0.0254;
const W = 48 * IN, D = 39.5 * IN; // largeur, profondeur (vue de côté)
const Y0 = 4 * IN; // dessous de la caisse, posée sur les tubes 4 × 4 × 1/4
const H = Y0 + 54 * IN; // dessus de la caisse (derrière de 54 po)
const YK = Y0 + 21 * IN; // haut du devant, bas des portes
const ZT = -D / 2 + 20 * IN; // arête avant du dessus (20 po)
const T = 0.125 * IN; // tôle : épaisseur non indiquée sur le dessin
const RUN = D / 2 - ZT, RISE = H - YK;
const TILT = Math.atan2(RUN, RISE); // inclinaison des portes par rapport à la verticale
const L = Math.hypot(RUN, RISE); // hauteur des portes le long de la pente (38 5/8 po sur le dessin)
const WI = W - 2 * T - 0.002; // largeur intérieure
const ZB = -D / 2 + T; // face intérieure du derrière
const SH_D = 16 * IN, LIP = 4 * IN, DIV_H = 12 * IN; // tablettes : fond, devant, divisions
const YA = H - DIV_H, YB = H - 2 * DIV_H; // dessus des tablettes du haut et du bas
const ROD = 0.375 * IN; // rayon de la tige de 3/4 po

/** Tôle à deux couches : rouge du côté de la normale (axe 0-2, signe), blanc de l'autre. */
function panel(S, size, pos, axis, sign) {
  const out = [...size], inn = [...size], po = [...pos], pi = [...pos];
  out[axis] = inn[axis] = T / 2;
  for (let k = 0; k < 3; k++) if (k !== axis) inn[k] -= 2 * T;
  po[axis] += (sign * T) / 4;
  pi[axis] -= (sign * T) / 4;
  return S.group(S.box(...out, 'red', { pos: po }), S.box(...inn, 'white', { pos: pi }));
}

/** Tôle découpée dans le plan ZY (profil [z, y]), épaisseur selon X. */
function cheek(S, pts, t, material, x, holes = []) {
  const m = S.extrude(pts, t, material, { holes });
  m.rotation.y = -Math.PI / 2;
  m.position.x = x;
  return m;
}

/** Côté : tôle de 40 × 54 po, coupée à 21 po au devant et à 20 po au dessus. */
function side(S, s) {
  const prof = [[-D / 2, Y0], [D / 2, Y0], [D / 2, YK], [ZT, H], [-D / 2, H]];
  const e = T;
  const profIn = [[-D / 2 + e, Y0 + e], [D / 2 - e, Y0 + e], [D / 2 - e, YK], [ZT, H - e], [-D / 2 + e, H - e]];
  return S.group(cheek(S, prof, T / 2, 'red', s * (W / 2 - T / 4)), cheek(S, profIn, T / 2, 'white', s * (W / 2 - (3 * T) / 4)));
}

/**
 * Tube de base 4 × 4 × 1/4 po, d'avant en arrière, soudé sous le fond. Bouts
 * ouverts pour y glisser les fourches (le dessin 087 demande de les fermer).
 */
function baseTube(S) {
  const a = Y0, t = 0.25 * IN, o = (a - t) / 2;
  const tube = S.merged([
    S.box(a, t, D, 'red', { pos: [0, t / 2, 0] }), S.box(a, t, D, 'red', { pos: [0, a - t / 2, 0] }),
    S.box(t, a - 2 * t, D, 'red', { pos: [o, a / 2, 0] }), S.box(t, a - 2 * t, D, 'red', { pos: [-o, a / 2, 0] }),
  ], 'red');
  // Cordons de soudure le long des deux arêtes du haut, contre le fond de la caisse.
  const z = D / 2 - 0.02;
  return S.group(tube, ...[-1, 1].map((s) => S.weld([[s * (a / 2 + 0.002), a - 0.003, -z], [s * (a / 2 + 0.002), a - 0.003, z]], 0.006, 'red')));
}

/** Oreille de levage (détail 1) : plaque de 6 × 4 po, rond de 3 1/2 po, trou de 2 1/2 po. */
function liftLug(S) {
  const r = 1.75 * IN, cy = 4 * IN - r, bx = 3 * IN;
  const d = Math.hypot(bx, cy), a0 = Math.atan2(-cy, bx) + Math.acos(r / d);
  const pts = [[-bx, 0], [bx, 0]];
  for (let i = 0; i <= 16; i++) { const a = a0 + (i / 16) * (Math.PI - 2 * a0); pts.push([r * Math.cos(a), cy + r * Math.sin(a)]); }
  return cheek(S, pts, 0.375 * IN, 'red', 0, [[0, cy, 1.25 * IN]]);
}

/** Tige pliée en U : pattes en a = 0 et a = len, hauteur h, coins arrondis ; map place le point (a, b) du profil. */
function uRod(S, len, h, map, material = 'red') {
  const rc = 1 * IN, pts = [[0, 0]];
  for (let i = 0; i <= 6; i++) { const a = Math.PI - (i / 6) * (Math.PI / 2); pts.push([rc + rc * Math.cos(a), h - rc + rc * Math.sin(a)]); }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 - (i / 6) * (Math.PI / 2); pts.push([len - rc + rc * Math.cos(a), h - rc + rc * Math.sin(a)]); }
  pts.push([len, 0]);
  return S.tube(pts.map(([a, b]) => map(a, b)), ROD, material, { sharp: true, seg: 90, radial: 12 });
}

/** Repère d'une porte : origine au bas de sa ligne de pentures, Y le long de la pente, Z vers l'extérieur. */
export function doorFrame(THREE, s, angle) {
  const m = new THREE.Matrix4().makeTranslation(0, YK, D / 2);
  m.multiply(new THREE.Matrix4().makeRotationX(-TILT));
  m.multiply(new THREE.Matrix4().makeTranslation((s * W) / 2, 0, 0));
  return m.multiply(new THREE.Matrix4().makeRotationY(s * angle));
}

const DW = W / 2 - 0.0015; // largeur d'une porte (24 po, jeu au joint)

/** Porte : tôle de 24 × 39 po. */
function door(S, s) {
  const x = (-s * DW) / 2;
  return S.group(
    S.box(DW, L, T / 2, 'red', { pos: [x, L / 2, (3 * T) / 4] }),
    S.box(DW - 0.004, L - 0.004, T / 2, 'white', { pos: [x, L / 2, T / 4] }),
  );
}

/** Poignée de porte (détail 2) : tige de 3/4 po, 12 × 4 po, à 3 po du joint et à 12 po du bas. */
function handle(S, s) {
  // Longueur le long de la pente, pattes vers l'extérieur.
  return S.at(S.group(uRod(S, 12 * IN, 4 * IN, (a, b) => [0, a, b])), [-s * (W / 2 - 3 * IN), 12 * IN, T]);
}

const BAR_Y = L - 12 * IN, BAR_T = 0.375 * IN; // barre du détail 3, à 12 po du haut des portes

const PAD = 0.25 * IN; // plaque de 1/4 po sous le bout de la barre
const BAR_PIVOT = [W / 2 - 5.75 * IN, BAR_Y, T]; // axe du pivot, dans le repère de la porte gauche

/**
 * Barre de verrouillage (détail 3) : plat de 13 × 1 1/2 × 3/8 po à fente, poignée de 6 × 3 po.
 * Elle tourne à plat sur la porte gauche autour du boulon de son bout gauche :
 * fermée (angle 0), elle chevauche le joint ; tournée de 180° par le haut, elle
 * repose en entier sur la porte gauche et libère les portes.
 * Repère de la porte gauche, origine du groupe sur l'axe du pivot.
 */
function latchBar(S, angle) {
  const bar = S.plate(13 * IN, 1.5 * IN, BAR_T, 'red', { cutouts: [[2.5 * IN, 0, 6 * IN, 0.5 * IN]], holes: [[-5.75 * IN, 0, 0.1875 * IN]], r: 0.002 });
  bar.rotation.x = Math.PI / 2;
  const u = uRod(S, 6 * IN, 3 * IN, (a, b) => [a, 0, b]);
  const g = S.group(S.at(S.group(bar, S.at(u, [-0.5 * IN, 0, BAR_T / 2])), [5.75 * IN, 0, PAD + BAR_T / 2]));
  g.rotation.z = angle;
  return S.at(g, BAR_PIVOT);
}

/** Plaque de 1/4 po percée à 3/8 po (repères 2 et 3 du détail 3), à plat sur l'axe du pivot, à la hauteur z. */
function pivotPlate(S, h, z) {
  const m = S.plate(1.5 * IN, h, 0.25 * IN, 'red', { holes: [[0, 0, 0.1875 * IN]] });
  m.rotation.x = Math.PI / 2;
  return S.at(S.group(m), [BAR_PIVOT[0], BAR_Y, T + z + 0.125 * IN]);
}

/** Boulon de 3/8 po du pivot de la barre : tige à travers les plaques et la barre, tête hexagonale. */
function pivotBolt(S) {
  const len = 2 * PAD + BAR_T + 0.002;
  return S.at(S.group(
    S.cyl(0.1875 * IN - 0.0004, len, 'red', { axis: 'z', pos: [0, 0, len / 2], seg: 12 }),
    S.cyl(0.33 * IN, 0.006, 'red', { axis: 'z', pos: [0, 0, len + 0.003], seg: 6 }),
  ), BAR_PIVOT);
}

/** Fer angle de 1/4 po, 2 × 2 po, aile de 3/4 po (repère 1 du détail 3) : appui sous la barre fermée, sur la porte gauche à 3 po du joint. */
function angleRest(S) {
  const t = 0.25 * IN;
  return S.at(S.group(
    S.box(2 * IN, 2 * IN, t, 'red', { pos: [0, -1 * IN, t / 2] }),
    S.box(2 * IN, t, 0.75 * IN, 'red', { pos: [0, -t / 2, 0.375 * IN] }),
  ), [W / 2 - 3 * IN, BAR_Y - 0.75 * IN - 0.001, T]);
}

/** Penture : gond et patte soudés au côté, patte de la porte (qui suit l'ouverture). */
function hinge(S, s, y, angle) {
  const leaf = S.group(S.box(0.045, 0.07, 0.004, 'red', { pos: [-s * 0.03, 0, T + 0.002] }));
  leaf.rotation.y = s * angle;
  return S.at(S.group(
    S.cyl(0.011, 3 * IN, 'red', { pos: [s * 0.006, 0, 0.011], seg: 14 }),
    S.box(0.004, 0.07, 0.045, 'red', { pos: [s * 0.002, 0, -0.02] }),
    leaf,
  ), [0, y, 0]);
}

/** Support à crochets, à l'intérieur de la porte gauche (photo). */
function hookPlate(S) {
  const x0 = 0.3, y = 0.6;
  const g = S.group(S.box(0.26, 0.07, 0.003, 'white', { pos: [x0, y, -0.0015] }));
  for (let i = 0; i < 4; i++) {
    const x = x0 - 0.09 + i * 0.06;
    g.add(S.box(0.014, 0.004, 0.035, 'white', { pos: [x, y - 0.02, -0.0175] }), S.box(0.014, 0.022, 0.004, 'white', { pos: [x, y - 0.011, -0.035] }));
  }
  return g;
}

const DRAWER = { x: -0.1, w: 0.58, h: 0.1, d: 0.38, zf: ZB + SH_D };

/** Tiroir suspendu sous la tablette du bas, avec poignée et loquet (photo). */
function drawer(S) {
  const { w, h, d } = DRAWER, t = 0.003;
  return S.group(
    S.box(w, t, d, 'white', { pos: [0, t / 2, -d / 2] }),
    S.box(w, h, t, 'white', { pos: [0, h / 2, -t / 2] }),
    S.box(w, h - 0.01, t, 'white', { pos: [0, h / 2, -d + t / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [w / 2 - t / 2, h / 2, -d / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [-w / 2 + t / 2, h / 2, -d / 2] }),
    S.tube([[-0.075, h / 2, 0], [-0.075, h / 2, 0.035], [0.075, h / 2, 0.035], [0.075, h / 2, 0]], 0.006, 'white', { sharp: true, radial: 8 }),
    S.box(0.02, 0.05, 0.006, 'white', { pos: [-w / 2 + 0.03, h - 0.02, 0.003] }),
    S.cyl(0.006, 0.014, 'white', { axis: 'z', pos: [-w / 2 + 0.03, h - 0.005, 0.008], seg: 10 }),
  );
}

/** Glissière du tiroir : cornière pendue sous la tablette (photo). */
function slide(S, s) {
  const { h, d } = DRAWER, t = 0.004;
  return S.group(
    S.box(t, h + 0.012, d, 'white', { pos: [0, -(h + 0.012) / 2, 0] }),
    S.box(0.022, t, d, 'white', { pos: [-s * 0.011, -(h + 0.012) + t / 2, 0] }),
  );
}

/** Métal déployé : losanges en feuillards croisés, dans le plan XY, de 0 à w et de 0 à h. */
function expanded(S, w, h, pitch = 0.024) {
  const bars = [];
  for (const dir of [1, -1]) {
    for (let c = -h + pitch / 2; c < w; c += pitch) {
      const x0 = Math.max(c, 0), x1 = Math.min(w, c + h), len = (x1 - x0) * Math.SQRT2;
      if (len < 0.008) continue;
      const xm = (x0 + x1) / 2, ym = xm - c;
      const b = S.box(len, 0.003, 0.002, 'white', { pos: [dir > 0 ? xm : w - xm, ym, 0] });
      b.rotation.z = (dir * Math.PI) / 4;
      bars.push(b);
    }
  }
  return S.merged(bars, 'white');
}

/** Panier au bas à droite : caisson ouvert sur le dessus, bas en métal déployé. */
function basket(S) {
  const w = 0.2, d = 0.28, h = 0.4, band = 0.14, t = 0.003, hm = h - band;
  const g = S.group(
    S.box(w, t, d, 'white', { pos: [0, t / 2, 0] }),
    // Bandeau plein du haut (quatre faces).
    S.box(w, band, t, 'white', { pos: [0, h - band / 2, d / 2] }), S.box(w, band, t, 'white', { pos: [0, h - band / 2, -d / 2] }),
    S.box(t, band, d, 'white', { pos: [-w / 2, h - band / 2, 0] }), S.box(t, band, d, 'white', { pos: [w / 2, h - band / 2, 0] }),
  );
  // Montants d'angle.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(S.box(0.02, hm, 0.02, 'white', { pos: [sx * (w / 2 - 0.01), hm / 2, sz * (d / 2 - 0.01)] }));
  g.add(S.at(expanded(S, w, hm), [-w / 2, 0, d / 2]));
  const side = expanded(S, d, hm);
  side.rotation.y = Math.PI / 2;
  g.add(S.at(side, [-w / 2, 0, d / 2]));
  return g;
}

const LOGO_W = 20 * IN, LOGO_H = (LOGO_W * 109) / 277; // proportions du logo du cartouche (dessin 0102803)
let logoMaterial = null;

/** Logo Machines Roger International : image du cartouche du dessin 0102803, sur un autocollant à fond noir. */
function decal(api) {
  const { S, THREE } = api;
  const g = S.group(S.box(LOGO_W + 0.02, LOGO_H + 0.02, 0.001, 'black', { r: 0.008, pos: [0, 0, 0.0005] }));
  if (!logoMaterial) {
    logoMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0 });
    logoMaterial.name = 'logo';
    // Hors navigateur (contrôle et export dans Node), l'image n'est pas chargée ici :
    // l'export pour moteur de jeu l'incorpore lui-même (scripts/export-coffre-jeu.mjs).
    if (typeof document !== 'undefined') {
      logoMaterial.map = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}equipment/coffre-dd/logo.png`);
      logoMaterial.map.colorSpace = THREE.SRGBColorSpace;
      logoMaterial.map.anisotropy = 8;
    } else logoMaterial.color.set(0x111111);
  }
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LOGO_W, LOGO_H), logoMaterial);
  face.position.z = 0.002;
  g.add(face);
  return g;
}

/**
 * Support de tube D-D (dessin 0102803) : berceau en Y de 3/4 po, base de
 * 8 × 3 × 1/2 po à quatre trous, gousset de 1/2 po ; 17 1/2 po de haut.
 * Repère : plaque du berceau dans le plan XY, base posée en y = 0, gousset vers +Z.
 * Le rayon du berceau (4 po) et les trous de la base sont mesurés sur le dessin à l'échelle.
 */
function P03(api) {
  const S = api.S;
  const cy = 16.5, ro = 6, ri = 4, hw = 1.5, tb = 0.5, tp = 0.75;
  const pts = [[-hw, tb], [hw, tb]];
  const arc = (cx, r, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  const a = Math.asin(hw / ro); // raccord du montant de 3 po au rayon extérieur
  arc(0, ro, -Math.PI / 2 + a, 0, 20);
  arc(5, 1, 0, Math.PI, 10);
  arc(0, ri, 0, -Math.PI, 36);
  arc(-5, 1, 0, Math.PI, 10);
  arc(0, ro, Math.PI, Math.PI * 1.5 - a, 20);
  const zp = -1.5 + tp / 2; // la plaque affleure le bord arrière de la base
  const fork = S.at(S.extrude(pts.map(([x, y]) => [x * IN, y * IN]), tp * IN, 'red'), [0, 0, zp * IN]);
  const holes = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) holes.push([sx * 3.5 * IN, sz * 1 * IN, 0.28 * IN]);
  const base = S.at(S.plate(8 * IN, 3 * IN, tb * IN, 'red', { holes, r: 0.25 * IN }), [0, (tb / 2) * IN, 0]);
  const z0 = zp + tp / 2;
  const gusset = cheek(S, [[z0, tb], [1.5, tb], [1.5, tb + 0.1], [z0 + 0.25, 11.5], [z0, 11.5]].map(([z, y]) => [z * IN, y * IN]), 0.5 * IN, 'red', 0);
  api.part('1', fork, [0, 0.12, -0.2]);
  api.part('2', base, [0, -0.15, 0]);
  api.part('3', gusset, [0, 0.05, 0.25]);
  return { view: { dir: [0.9, 0.4, 1.2] } };
}

/**
 * Boîte à clés (dessin Foresco C16062863 « BOITE CLE ») : plaque en trapèze de
 * 9 3/16 po au haut et 4 po de haut, deux cornières en V qui forment avec elle
 * deux glissières inclinées ; 2 1/4 po de profond hors tout.
 * Repère : plaque dans le plan XY, dos en z = 0, haut en y = 0.
 * L'épaisseur (1/4 po), la largeur du bas et l'angle sont mesurés sur le dessin à l'échelle.
 */
function P04(api) {
  const S = api.S;
  const top = 9.1875 / 2, bot = 2.285, hgt = 4, t = 0.25, y0 = -0.5625, deep = 2;
  const k = (top - bot) / hgt; // pente des bords
  const xo = (y) => -(top + y * k); // bord gauche de la plaque à la hauteur y
  const mm = (pts) => pts.map(([x, y]) => [x * IN, y * IN]);
  api.part('1', S.at(S.extrude(mm([[-top, 0], [top, 0], [bot, -hgt], [-bot, -hgt]]), t * IN, 'red'), [0, 0, (t / 2) * IN]), [0, 0, -0.08]);
  const th = t * Math.hypot(1, k), face = -xo(-hgt); // épaisseur et largeur de face mesurées à l'horizontale
  for (const [ref, s] of [['2', 1], ['3', -1]]) {
    const wall = [[xo(y0), y0], [xo(y0) + th, y0], [xo(-hgt) + th, -hgt], [xo(-hgt), -hgt]];
    const front = [[xo(y0), y0], [xo(y0) + face, y0], [xo(-hgt) + face, -hgt], [xo(-hgt), -hgt]];
    const sx = (pts) => mm(pts.map(([x, y]) => [s * x, y]));
    const g = S.group(
      S.at(S.extrude(sx(wall), (deep - t) * IN, 'red'), [0, 0, (t + (deep - t) / 2) * IN]),
      S.at(S.extrude(sx(front), t * IN, 'red'), [0, 0, (deep + t / 2) * IN]),
    );
    api.part(ref, g, [s * -0.07, 0, 0.08]);
  }
  return { view: { dir: [0.7, 0.5, 1.2] } };
}

/**
 * Coffre complet. open : angle d'ouverture des portes [gauche, droite] en
 * radians ; extras : ajouts visibles sur la photo du coffre ouvert.
 */
export function build(api, open, extras) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  const n = [0, Math.sin(TILT), Math.cos(TILT)]; // normale des portes
  const out = (k, dx = 0) => [dx, n[1] * k, n[2] * k];
  /** Pièce posée dans le repère d'une porte. */
  const onDoor = (obj, s, angle) => {
    const g = S.group(obj);
    g.applyMatrix4(doorFrame(api.THREE, s, angle));
    return g;
  };

  // Tôles du plan de coupes.
  put('1', panel(S, [W, H - Y0, T], [0, (H + Y0) / 2, -D / 2 + T / 2], 2, -1), [0, 0, -0.55]);
  put('2', panel(S, [W, T, D], [0, Y0 + T / 2, 0], 1, -1), [0, -0.3, 0]);
  for (const s of [-1, 1]) put('3', side(S, s), [s * 0.55, 0, 0]);
  put('4', panel(S, [W, T, ZT + D / 2], [0, H - T / 2, (ZT - D / 2) / 2], 1, 1), [0, 0.5, 0]);
  put('5', panel(S, [W, YK - Y0, T], [0, (YK + Y0) / 2, D / 2 - T / 2], 2, 1), [0, 0, 0.6]);

  // Tablettes : fond de 16 po, devant de 4 po, divisions de 16 × 12 po (cases de 16 po).
  const t = T / 2, zf = ZB + SH_D;
  for (const [k, y] of [[0, YA], [1, YB]]) {
    put('7', S.box(WI, t, SH_D, 'white', { pos: [0, y - t / 2, ZB + SH_D / 2] }), [0, k ? -0.12 : 0.02, 0.05]);
    put('8', S.box(WI, LIP, t, 'white', { pos: [0, y + LIP / 2, zf + t / 2] }), [0, k ? -0.12 : 0.02, 0.4]);
    for (const sx of [-1, 1]) {
      put('9', S.box(t, DIV_H - t - 0.001, SH_D, 'white', { pos: [sx * 8 * IN, y + (DIV_H - t) / 2, ZB + SH_D / 2] }), [0, k ? 0.02 : 0.16, 0.05]);
    }
  }

  for (const s of [-1, 1]) put('10', S.at(baseTube(S), [s * 18 * IN, 0, 0]), [0, -0.55, 0]);
  for (const s of [-1, 1]) put('12', S.at(liftLug(S), [s * (W / 2 - 0.1875 * IN), H, ZT - 3 * IN]), [0, 0.8, 0]);

  for (const s of [-1, 1]) {
    const a = open[s < 0 ? 0 : 1];
    const dx = s * (0.3 + 0.3 * Math.sin(a));
    put('6', onDoor(door(S, s), s, a), out(0.7, dx));
    put('13', onDoor(handle(S, s), s, a), out(1.0, dx));
    for (const y of [5 * IN, L - 5 * IN]) put('11', onDoor(hinge(S, s, y, a), s, 0), [s * 0.8, 0, 0]);
  }
  // Détail 3 : la barre tourne à plat sur la porte gauche autour du boulon de
  // son bout gauche. Portes ouvertes, elle est montrée tournée de 180°.
  const aG = open[0], aD = open[1];
  const dxG = -(0.3 + 0.3 * Math.sin(aG));
  put('14', onDoor(latchBar(S, aG > 0 ? Math.PI : 0), -1, aG), out(1.3, dxG));
  put('15', onDoor(angleRest(S), -1, aG), out(0.95, dxG));
  put('16', onDoor(pivotPlate(S, 1.5 * IN, PAD + BAR_T), -1, aG), out(1.5, dxG - 0.12));
  put('17', onDoor(pivotPlate(S, 2 * IN, 0), -1, aG), out(0.9, dxG - 0.12));
  put('24', onDoor(pivotBolt(S), -1, aG), out(1.7, dxG - 0.12));

  // Support de tube D-D sur le dessus, à gauche : berceau en travers du coffre
  // (tube couché dans la largeur), gousset vers le centre.
  const sup = api.sub('P03', { inPlace: true });
  sup.rotation.y = Math.PI / 2;
  put('23', S.at(sup, [-W / 2 + 3 * IN, H, -D / 2 + 8 * IN]), [-0.25, 0.9, 0]);

  // Boîte à clés sur le côté gauche du coffre, vers le bas (d'après la photo), glissières ouvertes vers le haut.
  const box = api.sub('P04', { inPlace: true });
  box.rotation.y = -Math.PI / 2;
  put('25', S.at(box, [-W / 2, Y0 + 20 * IN, 2 * IN]), [-0.5, 0, 0]);

  put('18', S.at(decal(api), [0, Y0 + (YK - Y0) / 2, D / 2]), [0, 0, 0.9]);
  if (!extras) return;
  put('19', S.at(drawer(S), [DRAWER.x, YB - t - DRAWER.h - 0.006, DRAWER.zf]), [0, -0.12, 0.9]);
  for (const s of [-1, 1]) {
    put('20', S.at(slide(S, s), [DRAWER.x + s * (DRAWER.w / 2 + 0.004), YB - t, DRAWER.zf - DRAWER.d / 2]), [s * 0.1, -0.12, 0.45]);
  }
  put('21', S.at(basket(S), [W / 2 - T - 0.105, Y0 + T, D / 2 - T - 0.15]), [0, 0.15, 1.2]);
  put('22', onDoor(hookPlate(S), -1, aG), out(0.4, dxG));
  contents(api, put);
}

/**
 * Premières pièces de la liste de matériel du coffre 629 (calibre N), posées
 * dans le coffre. L'emplacement de chaque pièce n'est pas documenté : têtes et
 * overshot couchés sur le fond, petites pièces dans les cases de la tablette du bas.
 */
function contents(api, put) {
  const { S, THREE } = api;
  /** Pose un objet centré en x et z, appuyé en y ; debout : son axe (X) mis à la verticale. */
  const place = (obj, [x, y, z], debout = false) => {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    const g = S.group(obj);
    obj.position.sub(c);
    if (debout) g.rotation.z = Math.PI / 2;
    g.position.set(x, y + (debout ? size.x : size.y) / 2, z);
    return g;
  };
  const floor = Y0 + T, shelf = YB;
  // Deux têtes Excore complètes et l'overshot pump-in, couchés sur le fond.
  put('30', place(api.sub('E077', { quality: 0.5 }), [-0.14, floor, -0.02]), [0, 0.1, 1.5]);
  put('30', place(api.sub('E077', { quality: 0.5 }), [-0.14, floor, 0.1]), [0, 0.25, 1.5]);
  put('31', place(api.sub('E080', { quality: 0.5 }), [-0.14, floor, 0.24]), [0, 0.4, 1.5]);
  // Petites pièces du carottier NU Excore, tirées de son modèle (repères de la page P076).
  const barrel = api.sub('E076', { quality: 0.5 });
  const piece = (ref) => barrel.userData.parts.find((o) => o.userData.partRef === ref);
  const row = (ref, src, n, x0, z, dx) => {
    for (let i = 0; i < n; i++) put(ref, place(i ? piece(src).clone() : piece(src), [x0 + i * dx, shelf, z], true), [0, 0.1, 0.9]);
  };
  const zc = ZB + SH_D / 2;
  row('32', '14', 4, -0.12, zc + 0.06, 0.08); // core lifters
  row('33', '15', 2, -0.08, zc - 0.07, 0.16); // core lifter cases
  row('34', '13', 2, 0.29, zc + 0.06, 0.1); // stop rings
  row('35', '9', 1, 0.34, zc - 0.07, 0); // landing ring
}

/** Coffre fermé, tôle par tôle (dessin 087). */
function P01(api) {
  build(api, [0, 0], false);
  return { view: { dir: [0.75, 0.5, 1.25] } };
}

/** Coffre ouvert : tablettes du dessin et ajouts visibles sur la photo. */
function P02(api) {
  build(api, [1.95, 1.7], true);
  return { view: { dir: [0.35, 0.45, 1.3] } };
}

/** Cotes utiles à l'export pour moteur de jeu (pivots et courses). */
export const RIG = {
  barPivot: BAR_PIVOT, // axe du pivot de la barre, dans le repère de la porte gauche
  drawer: [DRAWER.x, YB - T / 2 - DRAWER.h - 0.006, DRAWER.zf], // origine du tiroir (façade)
  drawerTravel: DRAWER.d - 0.05,
  support: [-W / 2 + 3 * IN, H, -D / 2 + 8 * IN],
  keyBox: [-W / 2, Y0 + 20 * IN, 2 * IN],
  size: { W, D, H, Y0, YK, ZT, T, L, TILT },
};

export default { P01, P02, P03, P04, ...EPIROC };
