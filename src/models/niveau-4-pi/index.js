// Niveau à bulle de 4 pi (48 po), profilé caisson en aluminium, trois fioles :
// type Stabila 196-2 (n° 37448 en Amérique du Nord, 122 cm en Europe). Aucun
// plan ni photo fournis : reconstitution d'après les données publiées par le
// fabricant et ses détaillants, le reste supposé et signalé.
//
// Données publiées, reprises telles quelles : longueur de 48 po, profilé
// caisson en aluminium (« extra rigide »), une fiole horizontale et deux
// fioles d'aplomb, deux poignées (trous de main), embouts amortisseurs,
// précision de 0,5 mm/m (0,029°), masse d'environ 1,2 kg (contrôle, voir
// masse()). Section du profilé : environ 60 × 30 mm d'après les fiches des
// détaillants (valeurs arrondies au centimètre).
//
// Supposé : épaisseurs des parois et des semelles, âme centrale, place et
// taille des fenêtres de fiole et des trous de main, forme des fioles, embouts
// noirs. Les semelles du haut et du bas (faces de mesure) sont fraisées et
// laissées en aluminium nu ; les flancs sont peints en jaune.
//
// Repère du niveau, en millimètres : x le long du niveau (0 au milieu), y vers
// le haut (0 sous la face de mesure du bas), z en travers (0 au milieu).
// Modèle : niveau couché sur le sol, face de mesure en bas, mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

export const L = 48 * IN; // longueur hors tout, embouts compris : donnée publiée
/** Section du profilé : hauteur (entre faces de mesure) et largeur, d'après les détaillants. */
export const H = 60;
export const B = 30;
/** Épaisseurs supposées : flancs, semelles fraisées (faces de mesure), âme centrale. */
export const EP = { flanc: 2, semelle: 2.5, ame: 1.5 };
/** Embouts amortisseurs, creux, emboîtés sur les bouts : longueur, retrait sur les faces de mesure, débord sur les flancs, arrondi, paroi. */
export const EMBOUT = { long: 25, retrait: 0.5, debord: 1, r: 3, paroi: 3 };
/** Longueur du profilé d'aluminium, entre les embouts. */
export const LP = L - 2 * EMBOUT.long;
/** Fenêtres traversantes des flancs (x du centre, longueur, hauteur, rayon des coins), toutes à mi-hauteur. */
export const FENETRES = {
  centre: { x: 0, long: 96, haut: 34, r: 6 },
  aplomb: { x: LP / 2 - 62, long: 46, haut: 40, r: 6 },
  poignee: { x: 300, long: 120, haut: 32, r: 16 },
};
/** Doublures des fenêtres (cadres de fiole, poignées) : paroi, rebord sur les flancs. */
export const DOUBLURE = { paroi: 2, rebord: 2.5, saillie: 0.8 };
/** Fiole : diamètre, longueur, repères de lecture à ±e du centre ; plaque d'acrylique qui la tient (épaisseur). */
export const FIOLE = { d: 13, long: 50, repere: 8.5, plaque: 6 };
/** Masses volumiques (kg/m³) pour le contrôle de la masse. */
export const RHO = { alu: 2700, caoutchouc: 1200, acrylique: 1190, pp: 950 };

const Y0 = H / 2; // axe des fenêtres
const P = (x, y, z) => [x * MM, y * MM, z * MM];

// ------------------------------------------------------------------ matériaux

const perso = new Map();
function teinte(nom, creer) {
  let m = perso.get(nom);
  if (!m) {
    m = creer();
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    perso.set(nom, m);
  }
  return m;
}
/** Jaune des flancs (peinture poudre satinée). */
const jaune = () => teinte('niveau-jaune', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xf2bf0a, metalness: 0, roughness: 0.48, specularIntensity: 1, clearcoat: 0.4, clearcoatRoughness: 0.3,
}), 'paintSatin'));
/** Aluminium fraisé des faces de mesure, stries le long du niveau. */
const aluFraise = () => teinte('niveau-alu-fraise', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xc9cdd1, metalness: 1, roughness: 0.3,
}), 'machined'));
/** Aluminium brut d'extrusion (âme, visible par les fenêtres et en coupe). */
const aluBrut = () => teinte('niveau-alu-brut', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xaeb2b6, metalness: 0.9, roughness: 0.45,
}), 'cast'));
/** Liquide des fioles : vert-jaune translucide, comme sur les niveaux de chantier. */
const liquide = () => teinte('niveau-liquide', () => new THREE.MeshPhysicalMaterial({
  color: 0xc6e23a, emissive: 0x3a4a00, emissiveIntensity: 0.6, roughness: 0.15, transparent: true, opacity: 0.6, depthWrite: false,
}));
/** Bulle d'air. */
const bulle = () => teinte('niveau-bulle', () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, emissive: 0xe8f0d8, emissiveIntensity: 0.55, roughness: 0.1,
}));

// ------------------------------------------------------------------ contours

/** Rectangle aux coins arrondis [x, y] (mm), centré en (cx, cy), parcouru dans le sens trigonométrique. */
function rectRond(cx, cy, w, h, r, n = 6) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const coins = [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]];
  for (const [ox, oy, a0] of coins) for (let k = 0; k <= n; k++) {
    const a = a0 + (k / n) * (Math.PI / 2);
    pts.push([cx + ox + r * Math.cos(a), cy + oy + r * Math.sin(a)]);
  }
  return pts;
}
const mm = (pts) => pts.map(([x, y]) => [x * MM, y * MM]);

/** Toutes les fenêtres des flancs : [{ nom, x, long, haut, r }], de gauche à droite. */
export function fenetres() {
  const f = FENETRES;
  return [
    { nom: 'aplomb', ...f.aplomb, x: -f.aplomb.x },
    { nom: 'poignee', ...f.poignee, x: -f.poignee.x },
    { nom: 'centre', ...f.centre },
    { nom: 'poignee', ...f.poignee },
    { nom: 'aplomb', ...f.aplomb },
  ];
}

// ------------------------------------------------------------------ profilé (repère 1)

/** Profilé caisson : deux flancs jaunes percés, semelles fraisées, âme centrale coupée aux fenêtres. */
function profile(S) {
  const g = S.group();
  const yb = EP.semelle, yh = H - EP.semelle;
  // Flancs : de semelle à semelle, percés des cinq fenêtres.
  const contour = rectRond(0, (yb + yh) / 2, LP, yh - yb, 0, 1);
  const trous = fenetres().map((w) => mm(rectRond(w.x, Y0, w.long, w.haut, w.r)));
  for (const s of [-1, 1]) {
    const flanc = S.extrude(mm(contour), EP.flanc * MM, jaune(), { holes: trous });
    flanc.position.z = s * (B / 2 - EP.flanc / 2) * MM;
    g.add(flanc);
  }
  // Semelles du bas et du haut : faces de mesure fraisées, sur toute la largeur.
  for (const y of [EP.semelle / 2, H - EP.semelle / 2]) {
    g.add(S.box(LP * MM, EP.semelle * MM, B * MM, aluFraise(), { pos: P(0, y, 0) }));
  }
  // Âme centrale, entre les flancs, interrompue par les doublures des fenêtres.
  const largeur = B - 2 * EP.flanc;
  let x0 = -LP / 2;
  for (const w of [...fenetres(), { x: LP / 2, long: 0 }]) {
    const x1 = w.x - w.long / 2;
    if (x1 - x0 > 1) g.add(S.box((x1 - x0) * MM, EP.ame * MM, largeur * MM, aluBrut(), { pos: P((x0 + x1) / 2, Y0, 0) }));
    x0 = w.x + w.long / 2;
  }
  return g;
}

// ------------------------------------------------------------------ doublures et fioles

/**
 * Doublure d'une fenêtre (dans le repère de la fenêtre, axe z en travers) :
 * manchon qui traverse le profilé et rebords appliqués sur les deux flancs.
 */
function doublure(S, w, matiere) {
  const g = S.group();
  const dedans = rectRond(0, 0, w.long - 2 * DOUBLURE.paroi, w.haut - 2 * DOUBLURE.paroi, Math.max(0, w.r - DOUBLURE.paroi));
  const manchon = S.extrude(mm(rectRond(0, 0, w.long, w.haut, w.r)), B * MM, matiere, { holes: [mm(dedans)] });
  g.add(manchon);
  const rb = DOUBLURE.rebord;
  for (const s of [-1, 1]) {
    const rebord = S.extrude(mm(rectRond(0, 0, w.long + 2 * rb, w.haut + 2 * rb, w.r + rb)), DOUBLURE.saillie * MM, matiere, { holes: [mm(dedans)] });
    rebord.position.z = s * (B / 2 + DOUBLURE.saillie / 2) * MM;
    g.add(rebord);
  }
  return g;
}

/**
 * Fiole le long de x (mm), centrée : tube de liquide, deux bagues de lecture,
 * bulle décalée de `decale` mm vers +x. aplomb : fiole debout une fois posée,
 * la bulle est une lentille sur l'axe, au bout du haut ; sinon elle est
 * allongée et plaquée sous la paroi du haut.
 */
function fiole(S, long, decale = 0, aplomb = false) {
  const g = S.group();
  const r = FIOLE.d / 2;
  g.add(S.cyl(r * MM, long * MM, liquide(), { axis: 'x', seg: 28 }));
  for (const s of [-1, 1]) {
    g.add(S.cyl((r + 0.25) * MM, 0.8 * MM, 'plastic', { axis: 'x', seg: 28, pos: P(s * FIOLE.repere, 0, 0) }));
  }
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), bulle());
  if (aplomb) {
    b.scale.set(2.2 * MM, (r - 1) * MM, (r - 1) * MM);
    b.position.set(decale * MM, 0, 0);
  } else {
    b.scale.set(6.5 * MM, 2.4 * MM, 3.6 * MM);
    b.position.set(decale * MM, (r - 2.2) * MM, 0);
  }
  g.add(b);
  return g;
}

/**
 * Fiole et son bloc : doublure-cadre noire, plaque d'acrylique clair qui tient la
 * fiole, fiole. aplomb : fiole tournée en travers du niveau (verticale quand le
 * niveau est couché : sa bulle monte au bout du haut).
 */
function blocFiole(S, w, aplomb) {
  const g = S.group(doublure(S, w, 'plastic'));
  const li = w.long - 2 * DOUBLURE.paroi, hi = w.haut - 2 * DOUBLURE.paroi;
  // Plaque d'acrylique clair au milieu de l'épaisseur, que la fiole traverse.
  g.add(S.extrude(mm(rectRond(0, 0, li, hi, Math.max(0, w.r - DOUBLURE.paroi))), FIOLE.plaque * MM, 'glass'));
  if (aplomb) {
    const lg = Math.min(FIOLE.long, hi - 4);
    const f = fiole(S, lg, lg / 2 - 3.5, true);
    f.rotation.z = Math.PI / 2;
    g.add(f);
  } else {
    g.add(fiole(S, Math.min(FIOLE.long, li - 8), 0));
  }
  return g;
}

/** Embout amortisseur en caoutchouc (creux, emboîté sur le profilé : seul l'extérieur est modélisé), au bout +x (sens = 1) ou −x (sens = −1). */
function embout(S, sens) {
  const e = EMBOUT;
  const m = S.box(e.long * MM, (H - 2 * e.retrait) * MM, (B + 2 * e.debord) * MM, 'rubber', { r: e.r * MM });
  m.position.set(sens * (L / 2 - e.long / 2) * MM, Y0 * MM, 0);
  return m;
}

// ------------------------------------------------------------------ contrôle

/**
 * Volume et masse du modèle, calculés sur les cotes (les arrondis des fenêtres
 * sont comptés comme des rectangles : moins de 1 g d'écart). Retourne les
 * volumes en cm³ et la masse en kg, à comparer à 1,2 kg publié.
 */
export function masse() {
  const cm3 = (v) => v / 1000;
  const fen = fenetres();
  const trous = fen.reduce((t, w) => t + w.long * w.haut, 0);
  const flancs = 2 * EP.flanc * (LP * (H - 2 * EP.semelle) - trous);
  const semelles = 2 * EP.semelle * LP * B;
  const ame = EP.ame * (B - 2 * EP.flanc) * (LP - fen.reduce((t, w) => t + w.long, 0));
  const alu = cm3(flancs + semelles + ame);
  const e = EMBOUT, plein = (d) => (e.long - d) * (H - 2 * e.retrait - 2 * d) * (B + 2 * e.debord - 2 * d);
  const caoutchouc = cm3(2 * (plein(0) - plein(e.paroi)));
  const doublures = cm3(fen.reduce((t, w) => {
    const p = DOUBLURE.paroi, rb = DOUBLURE.rebord;
    const manchon = (w.long * w.haut - (w.long - 2 * p) * (w.haut - 2 * p)) * B;
    const rebords = 2 * ((w.long + 2 * rb) * (w.haut + 2 * rb) - (w.long - 2 * p) * (w.haut - 2 * p)) * DOUBLURE.saillie;
    return t + manchon + rebords;
  }, 0));
  const blocs = cm3(fen.filter((w) => w.nom !== 'poignee').reduce((t, w) => t + (w.long - 4) * (w.haut - 4) * FIOLE.plaque, 0));
  const kg = (alu * RHO.alu + caoutchouc * RHO.caoutchouc + doublures * RHO.pp + blocs * RHO.acrylique) / 1e6;
  return { alu, caoutchouc, doublures, blocs, kg, lb: kg / 0.45359237 };
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const place = (o, x) => { o.position.set(x * MM, Y0 * MM, 0); return o; };
  const f = FENETRES;
  api.part('1', profile(S), [0, 0, 0]);
  api.part('2', place(blocFiole(S, f.centre, false), 0), [0, 0.11, 0]);
  for (const s of [-1, 1]) api.part('3', place(blocFiole(S, f.aplomb, true), s * f.aplomb.x), [0, 0.11, 0]);
  for (const s of [-1, 1]) api.part('4', place(doublure(S, f.poignee, 'plastic'), s * f.poignee.x), [0, 0, 0.09]);
  for (const s of [-1, 1]) api.part('5', embout(S, s), [s * 0.09, 0, 0]);
  // Coupe proposée : en travers du profilé, entre la fiole du centre et une poignée (caisson et âme).
  return { view: { dir: [-0.35, 0.45, 1], section: { axis: 'x', pos: 0.42 } } };
}

export default { P01 };
