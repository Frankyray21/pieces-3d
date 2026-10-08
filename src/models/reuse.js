/**
 * Réutilise les builders 3D d'un autre équipement (variante d'une même
 * machine) pour les assemblages de même numéro de pièce et de même liste.
 * map : { feuilleCible: feuilleSource }. Les sous-assemblages que le builder
 * insère (api.sub) sont traduits vers les feuilles de l'équipement cible ;
 * ils doivent donc figurer eux aussi dans map.
 */
export function reuse(source, map) {
  const toTarget = Object.fromEntries(Object.entries(map).map(([target, src]) => [src, target]));
  const out = {};
  for (const [target, src] of Object.entries(map)) {
    if (!source[src]) throw new Error(`Builder source introuvable : ${src}`);
    out[target] = (api, opts) => source[src]({
      ...api,
      sub(id, o) {
        if (!toTarget[id]) throw new Error(`Sous-assemblage ${id} non repris dans la variante`);
        return api.sub(toTarget[id], o);
      },
    }, opts);
  }
  return out;
}
