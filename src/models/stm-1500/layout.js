// Repères et cotes communes du STM-1500 (Usinage Marcotte, s/n STM-1500-128).
//
// Repère foreuse (P010) : origine au sol sous le centre du traîneau, X vers
// l'avant (pied de l'avance, côté trou), Y vers le haut, Z vers la droite.
// Avance à 0° (horizontale) comme sur la page 1.01 : longueur 4 202 mm,
// hauteur 1 731 mm, axe de la broche à 1 235 mm du sol, traîneau de 864 mm.
// Le manuel identifie les pièces par leur numéro (bulles des dessins) : les
// repères 1, 2, 3… sont les rangs des lignes dans la liste (refs.js, généré).
import REFS from './refs.js';

export const IN = 0.0254;

export const SLED = { len: 2.9, w: 0.864, railW: 0.102, railH: 0.152 };
export const AXIS_Y = 1.235; // axe de la broche (avance à 0°)
export const BEAM = { x0: -2.25, x1: 1.86, w: 0.3, h: 0.28, top: 0.905 }; // poutre d'avance (feed frame)
export const PIVOT = { x: 0.45, y: 0.62 }; // axe de bascule sur le support d'avance

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
