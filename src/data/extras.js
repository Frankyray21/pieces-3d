// Données complémentaires des équipements : public/equipment/<id>/<nom>.json
// (bulles : positions des bulles des dessins ; donnees : données techniques ;
// entretien : points d'entretien ; procedures : procédures pas à pas ; consignes : consignes des dessins ;
// schemas : schémas en couleur par circuit ; utilisation : manuel de l'utilisateur ; prise-en-main : prise en
// main de la console).
//
// Site publié : lues à la demande, une fois, au chargement d'un équipement dont
// l'index (public/equipment/index.json, champ « extras ») déclare les fichiers —
// aucune requête pour un équipement qui n'en a pas (donc aucune erreur 404), et
// rien de plus dans le module des autres équipements. Publication en Artifact :
// inscrites dans la page (<script type="application/json" id="extras">,
// scripts/build-artifact.mjs), sans fichier à publier ni requête.
// Les fonctions les lisent ensuite sans attendre (ctx.equipmentData).

const BY = new Map(); // « <id>/<nom> » → données

/** Données inscrites dans la page (publication en Artifact) : { « <id>/<nom> » : données }. */
const INLINE = (() => {
  try { return JSON.parse(document.getElementById('extras')?.textContent || 'null') || {}; } catch { return {}; }
})();

/**
 * Charge les données complémentaires « names » de l'équipement « id » (une fois). Un fichier absent ou illisible
 * est signalé dans la console : la fonction qui en dépend n'apparaît pas.
 */
export async function loadExtras(id, names = []) {
  await Promise.all(names.map(async (name) => {
    const key = `${id}/${name}`;
    if (BY.has(key)) return;
    if (key in INLINE) { BY.set(key, INLINE[key]); return; }
    try {
      const res = await fetch(`equipment/${id}/${name}.json`);
      if (!res.ok) throw new Error(String(res.status));
      BY.set(key, await res.json());
    } catch (err) {
      BY.set(key, null);
      console.warn(`[données] ${key}.json non chargé`, err);
    }
  }));
}

/** Données « name » de l'équipement « id » (chargées par loadExtras), ou null s'il n'en a pas. */
export function equipmentData(id, name) {
  return (id && BY.get(`${id}/${name}`)) ?? null;
}
