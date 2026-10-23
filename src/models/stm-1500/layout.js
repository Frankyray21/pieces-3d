// Repères et cotes communes du STM-1500 (Usinage Marcotte, s/n STM-1500-128).
//
// Repère foreuse (P010) : origine au sol sous le centre du traîneau, X vers
// l'avant (pied de l'avance, côté trou), Y vers le haut, Z vers la droite.
// Avance à 0° (horizontale) comme sur la page 1.01 : longueur 4 202 mm (de la
// pointe de l'oreille avant du traîneau au dos de la poulie rentrée), hauteur
// 1 731 mm, axe de la broche à 1 235 mm du sol, traîneau de 3 321 mm sur
// 1 067 mm (la cote de 34 po, 864 mm, est celle des poteaux et des paliers).
// Le manuel identifie les pièces par leur numéro (bulles des dessins) : les
// repères 1, 2, 3… sont les rangs des lignes dans la liste (refs.js, généré).
import REFS from './refs.js';

export const IN = 0.0254;

// Traîneau (page 1.01, vues à 0° et de bout ; page 1.1) : 3,32 m entre les pointes des oreilles avant et arrière,
// longerons en tube 7 × 5 po sur une semelle de 11 mm (178 × 137 mm), axés à ±0,444 m (1 067 mm hors tout, vide de
// 711 mm entre eux : le bâti du treuil, 699 mm, page 8.0, s'y loge et s'appuie sur les bandes de roulement par ses
// longerons supérieurs).
export const SLED = { len: 3.32, w: 1.067, railW: 0.178, railH: 0.137 };
export const AXIS_Y = 1.235; // axe de la broche (avance à 0°)
// Poutre d'avance FBRA-002-300BB (pages 1.01, 1.03 et 1.3) : deux longerons-caissons de 110 mm (z ±0,167 à ±0,277,
// 554 mm hors tout), dessous à 715 mm du sol sur les plats d'usure du support, dessus à 964 mm ; fond ouvert à
// traverses et diagonales. x1 : avant de la poutre (flasque avant de la plateforme), 180 mm derrière la face avant de
// la plaque de pied, elle-même 181 mm derrière la pointe de l'oreille avant du traîneau ; x0 : face arrière de la plaque
// d'extrémité (mast end plate), 3,08 m derrière l'avant de la poutre (page 1.01, vue à 0°).
export const BEAM = { x0: -1.781, x1: 1.299, w: 0.554, h: 0.249, top: 0.964 };
export const FOOT_X = BEAM.x1 + 0.18; // face avant de la plaque de pied FBRA-002-305BB
// Axes de bascule : tubes de pivot du support d'avance dans les paliers fendus des poteaux avant et arrière du
// traîneau (page 1.01 : 700 et 1 665 mm de la pointe avant, 598 mm du sol). La poutre bascule sur l'un ou l'autre
// (45° vers le bas sur l'avant, 45° vers le haut sur l'arrière).
export const PIVOT = { x: [0.961, -0.004], y: 0.598 };

/** Groupe de pose des pièces d'une liste : P(n° de pièce, objet, éclaté) → repère de la ligne. */
export function lister(api, id) {
  const refs = REFS[id] || {};
  return (pn, obj, explode = null, opts) => {
    const ref = refs[pn];
    if (!ref) throw new Error(`${id} : n° ${pn} absent de la liste`);
    return api.part(ref, obj, explode, opts);
  };
}

/** Plusieurs objets identiques d'une même ligne (vis, rondelles…). */
export function each(P, pn, objs, explode) {
  objs.forEach((o, i) => P(pn, o, typeof explode === 'function' ? explode(i) : explode));
}

/** Grillage (fils croisés au pas step) dans un rectangle w × h du plan XY local. */
export function grid(S, w, h, step, mat = 'black', r = 0.0025) {
  const parts = [];
  for (let x = -w / 2 + step; x < w / 2 - step / 2; x += step) parts.push(S.rod([x, -h / 2, 0], [x, h / 2, 0], r, mat, 4));
  for (let y = -h / 2 + step; y < h / 2 - step / 2; y += step) parts.push(S.rod([-w / 2, y, 0], [w / 2, y, 0], r, mat, 4));
  return S.merged(parts, mat);
}
