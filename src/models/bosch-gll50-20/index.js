// Niveau laser à lignes croisées autonivelant Bosch GLL50-20 (faisceau rouge).
//
// Aucun manuel ni photo n'a pu être consulté (sites du manuel inaccessibles
// depuis l'atelier) : à la demande du client, le modèle est fait d'après les
// seules données publiées par les détaillants, reprises telles quelles —
// environ 4,2 po de long (107 mm), 2,5 po de large (63 mm) et 3,9 po de haut
// (98 mm), 0,77 lb, deux lignes (horizontale et verticale), portée de 50 pi,
// autonivellement de 3,5°, voyant hors niveau qui clignote, classe 2, 630 à
// 650 nm, IP 55, filetage 1/4-20, support aimanté intégré, deux piles AA.
// Les formes et la place des organes (fenêtre, interrupteur, touche, voyants,
// logement des piles, aimants) sont SUPPOSÉES d'après la disposition courante
// des lasers à lignes croisées compacts ; elles sont signalées dans la fiche.
//
// Pas de vue éclatée (demande du client) : toutes les pièces restent en place.
//
// Repère, en millimètres : X la largeur, Y vers le haut (Y = 0 sous les pieds),
// Z vers l'avant (fenêtre de sortie des faisceaux). Modèle en mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (mm)

export const HORS_TOUT = { long: 107, large: 63, haut: 98 }; // données publiées (4,2 × 2,5 × 3,9 po)
const PIED = 1.5; // patins sous le boîtier (supposés)
const CORPS = { haut: 70.5, r: 9 }; // corps bleu, de PIED à 72
const Y_CORPS = PIED + CORPS.haut; // dessus du corps : 72
export const TETE = { large: 54, haut: HORS_TOUT.haut - Y_CORPS, prof: 56, r: 7 }; // tête optique noire, jusqu'à 98
const Y_TETE = Y_CORPS + TETE.haut / 2; // axe des faisceaux : 85
const AVANT = HORS_TOUT.long / 2; // face avant à z = 53,5
const ARRIERE = -HORS_TOUT.long / 2;
const FENETRE = { large: 44, haut: 20 };
export const FAISCEAU = { portee: 0.15, angle: 120 }; // longueur montrée (m) et ouverture supposée (degrés)
export const PILE_AA = { d: 14.5, long: 50.5 }; // pile AA normalisée (IEC LR6)
export const FILETAGE = { d: 6.35, bague: 12 }; // 1/4-20 : Ø 1/4 po
const AIMANT = { d: 16, ep: 1.2, y: [22, 52] };

// ------------------------------------------------------------------ matériaux hors palette

const perso = new Map();
function teinte(nom, fabrique) {
  if (!perso.has(nom)) perso.set(nom, fabrique());
  return perso.get(nom);
}
const standard = (nom, params, finition) => teinte(nom, () => {
  const m = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.5, ...params });
  m.polygonOffset = true;
  m.polygonOffsetFactor = 1;
  m.polygonOffsetUnits = 1;
  m.name = nom;
  if (finition) withFinish(m, finition);
  return m;
});
// Bleu des outils Bosch Professional (teinte supposée, plastique moulé).
const bleu = () => standard('gll-bleu', { color: 0x0f6a8b, roughness: 0.42 }, 'plastic');
// Verre de sortie : rouge sombre, presque opaque vu de biais.
const verre = () => teinte('gll-verre', () => {
  const m = new THREE.MeshPhysicalMaterial({ color: 0x5a0d10, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.72, clearcoat: 1, clearcoatRoughness: 0.03 });
  m.name = 'gll-verre';
  return m;
});
// Plan des faisceaux : rouge translucide, sans éclairage.
const rayon = () => teinte('gll-rayon', () => {
  const m = new THREE.MeshBasicMaterial({ color: 0xff2418, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  m.name = 'gll-rayon';
  return m;
});
const voyant = (nom, couleur) => standard(nom, { color: couleur, emissive: couleur, emissiveIntensity: 0.8, roughness: 0.25 });

/** Étiquette d'avertissement laser dessinée sur un canevas (générique ; aucun texte du fabricant). */
function etiquette() {
  const w = 34, h = 14;
  let map = null;
  if (typeof document !== 'undefined') {
    map = teinte('img:gll-etiquette', () => {
      const c = document.createElement('canvas');
      c.width = 340; c.height = 140;
      const x = c.getContext('2d');
      x.fillStyle = '#f2c400'; x.fillRect(0, 0, 340, 140);
      x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(5, 5, 330, 130);
      // Triangle de danger laser (rayonnement et faisceau stylisés).
      x.beginPath(); x.moveTo(70, 22); x.lineTo(122, 116); x.lineTo(18, 116); x.closePath();
      x.lineWidth = 8; x.stroke();
      x.fillStyle = '#111';
      x.beginPath(); x.arc(70, 88, 9, 0, 7); x.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 2 * Math.PI;
        x.fillRect(70 + Math.cos(a) * 15 - 2, 88 + Math.sin(a) * 15 - 2, 4, 4);
      }
      x.fillRect(70, 86, 46, 4);
      // Lignes de texte suggérées (classe 2, < 5 mW, 630-650 nm).
      x.font = 'bold 34px sans-serif';
      x.fillText('CLASS 2', 150, 58);
      x.font = '22px sans-serif';
      x.fillText('< 5 mW', 150, 90);
      x.fillText('630-650 nm', 150, 118);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    });
  }
  const m = standard(map ? 'gll-etiquette' : 'gll-etiquette-unie', map ? { map, roughness: 0.45 } : { color: 0xf2c400, roughness: 0.45 });
  const e = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), m);
  e.rotation.y = -Math.PI / 2; // face vers −X, texte vers l'avant
  e.position.set(-(HORS_TOUT.large / 2 + 1.6) * MM, 66 * MM, -8 * MM);
  return e;
}

// ------------------------------------------------------------------ pièces

const p = (x, y, z) => [x * MM, y * MM, z * MM];

/** Repère 1 : corps bleu (logement des piles et du pendule), arêtes arrondies. */
function corps(S) {
  return S.box(HORS_TOUT.large * MM, CORPS.haut * MM, HORS_TOUT.long * MM, bleu(), { r: CORPS.r * MM, pos: p(0, PIED + CORPS.haut / 2, 0) });
}

/** Repère 2 : surmoulages en caoutchouc noir des deux flancs (prise en main). */
function surmoulage(S, cote) {
  return S.box(2 * MM, 46 * MM, 72 * MM, 'rubber', { r: 1 * MM, pos: p(cote * (HORS_TOUT.large / 2 + 0.6), 34, -8) });
}

/** Repère 3 : tête optique noire, à l'avant du dessus, qui loge les diodes. */
function tete(S) {
  return S.box(TETE.large * MM, (TETE.haut + 2) * MM, TETE.prof * MM, 'plastic', { r: TETE.r * MM, pos: p(0, Y_TETE - 1, AVANT - TETE.prof / 2) });
}

/** Repère 4 : fenêtre de sortie des faisceaux, verre rouge sur la face avant de la tête. */
function fenetre(S) {
  const g = S.group();
  g.add(S.box((FENETRE.large + 4) * MM, (FENETRE.haut + 4) * MM, 1 * MM, 'rubber', { r: 1.5 * MM, pos: p(0, Y_TETE, AVANT + 0.2) }));
  g.add(S.box(FENETRE.large * MM, FENETRE.haut * MM, 1.2 * MM, verre(), { r: 1 * MM, pos: p(0, Y_TETE, AVANT + 0.9) }));
  return g;
}

/** Repère 5 : modules laser (diode et lentille cylindrique) des lignes horizontale et verticale, derrière le verre. */
function module(S, x) {
  const g = S.group();
  g.add(S.cyl(4 * MM, 8 * MM, 'darkSteel', { axis: 'z', pos: p(x, Y_TETE, AVANT - 5) }));
  g.add(S.cyl(2.6 * MM, 1 * MM, 'glass', { axis: 'z', pos: p(x, Y_TETE, AVANT - 0.6) }));
  return g;
}

/** Repère 6 : interrupteur de marche et de blocage du pendule, curseur sur le flanc droit (+X). */
function interrupteur(S) {
  const x = HORS_TOUT.large / 2;
  const g = S.group();
  g.add(S.box(1 * MM, 11 * MM, 34 * MM, 'plastic', { r: 0.4 * MM, pos: p(x + 0.3, 63, 22) })); // glissière
  g.add(S.box(4.5 * MM, 9 * MM, 13 * MM, 'rubber', { r: 1.5 * MM, pos: p(x + 1.8, 63, 32) })); // curseur, à l'avant : marche, pendule libre
  for (let k = -1; k <= 1; k++) g.add(S.box(1 * MM, 7 * MM, 1 * MM, 'plastic', { pos: p(x + 4.2, 63, 32 + 3 * k) })); // stries
  return g;
}

/** Repère 7 : clavier du dessus (membrane) et touche de choix des lignes. */
function clavier(S) {
  const g = S.group();
  g.add(S.box(40 * MM, 1 * MM, 38 * MM, 'rubber', { r: 3 * MM, pos: p(0, Y_CORPS + 0.3, -28) }));
  g.add(S.cyl(7 * MM, 2.5 * MM, 'rubber', { pos: p(0, Y_CORPS + 1.6, -22) }));
  g.add(S.cyl(4.5 * MM, 0.4 * MM, 'plastic', { pos: p(0, Y_CORPS + 3, -22) })); // pictogramme suggéré
  return g;
}

/** Repère 8 : voyant sur le clavier — marche (vert, à gauche) ou hors niveau (rouge, à droite). */
function voyant8(S, x, nom, couleur) {
  return S.cyl(1.8 * MM, 1.2 * MM, voyant(nom, couleur), { pos: p(x, Y_CORPS + 1.2, -38) });
}

/** Repère 9 : couvercle du logement des piles, sous l'arrière, avec son loquet. */
function couvercle(S) {
  return S.group(
    S.box(42 * MM, 1.2 * MM, 56 * MM, bleu(), { r: 0.5 * MM, pos: p(0, PIED - 0.2, -24) }),
    S.box(14 * MM, 1.6 * MM, 4 * MM, 'plastic', { r: 0.6 * MM, pos: p(0, PIED - 0.6, -50) }),
  );
}

/** Repère 10 : pile AA, couchée dans son logement (cachée ; visible en coupe). */
function pile(S, x) {
  const { d, long } = PILE_AA;
  const g = S.group();
  g.add(S.cyl((d / 2) * MM, (long - 1.5) * MM, 'red', { axis: 'z', pos: p(x, PIED + 3 + d / 2, -24 - 0.75) }));
  g.add(S.cyl(2.7 * MM, 1.5 * MM, 'zinc', { axis: 'z', pos: p(x, PIED + 3 + d / 2, -24 + long / 2 - 0.75) })); // borne +
  return g;
}

/** Repère 11 : écrou fileté 1/4-20 sous la tête optique, pour trépied. */
function filetage(S) {
  const { d, bague } = FILETAGE;
  return S.lathe([[d / 2, 0], [bague / 2, 0], [bague / 2, 6], [d / 2, 6]].map(([r, y]) => [r * MM, y * MM]), 'brass', { seg: 28, pos: p(0, PIED - 0.3, 26) });
}

/** Repère 12 : aimant du support intégré, encastré dans la face arrière. */
function aimant(S, y) {
  return S.cyl((AIMANT.d / 2) * MM, AIMANT.ep * MM, 'darkSteel', { axis: 'z', pos: p(0, y, ARRIERE - AIMANT.ep / 2 + 0.4) });
}

/** Repère 13 : patin en caoutchouc sous le boîtier. */
function patin(S, x, z) {
  return S.cyl(5 * MM, PIED * MM, 'rubber', { pos: p(x, PIED / 2, z) });
}

/** Repère 15 : plans des deux faisceaux laser (ligne horizontale, ligne verticale), sortant de la fenêtre. */
function faisceaux(S) {
  const R = FAISCEAU.portee, a = FAISCEAU.angle * RAD;
  const plan = (rot, debut, ouverture) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(R, 48, debut, ouverture), rayon());
    m.userData.noEdges = true;
    m.rotation.copy(rot);
    return m;
  };
  // Cercle de three.js dans le plan XY, angle compté depuis +X ; on le tourne pour que l'axe de l'éventail soit +Z.
  // Ligne horizontale : éventail centré sur −Y du plan, donc +Z après la rotation autour de X.
  const h = plan(new THREE.Euler(-Math.PI / 2, 0, 0), -Math.PI / 2 - a / 2, a);
  // Ligne verticale : centrée sur −X du plan, donc +Z après la rotation autour de Y ; θ < π monte.
  // Le bas de l'éventail s'arrête au sol (rayon de longueur R qui touche Y = 0).
  const bas = Math.asin(Math.min(1, (Y_TETE * MM) / R));
  const v = plan(new THREE.Euler(0, Math.PI / 2, 0), Math.PI - a / 2, a / 2 + Math.min(bas, a / 2));
  const g = S.group(h, v);
  g.position.set(0, Y_TETE * MM, (AVANT + 1.5) * MM);
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const seen = new Set();
  const SUR_PLACE = [0, 0, 0]; // pas d'éclatement (demande du client)
  const put = (ref, obj) => {
    api.part(ref, obj, SUR_PLACE, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  put('1', corps(S));
  put('2', surmoulage(S, 1));
  put('2', surmoulage(S, -1));
  put('3', tete(S));
  put('4', fenetre(S));
  put('5', module(S, -9));
  put('5', module(S, 9));
  put('6', interrupteur(S));
  put('7', clavier(S));
  put('8', voyant8(S, -8, 'gll-voyant-vert', 0x22c45a));
  put('8', voyant8(S, 8, 'gll-voyant-rouge', 0xe0201a));
  put('9', couvercle(S));
  put('10', pile(S, -8));
  put('10', pile(S, 8));
  put('11', filetage(S));
  AIMANT.y.forEach((y) => put('12', aimant(S, y)));
  for (const x of [-22, 22]) for (const z of [-42, 42]) put('13', patin(S, x, z));
  put('14', etiquette());
  put('15', faisceaux(S));

  // Vue de trois quarts avant ; coupe proposée dans le plan médian (piles et pendule).
  return { view: { dir: [0.9, 0.6, 1], section: { axis: 'x', pos: 0.5 } } };
}

export default { P01 };
