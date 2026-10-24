// Données complémentaires des équipements : public/equipment/<id>/<nom>.json
// (bulles : positions des bulles des dessins ; donnees : données techniques ;
// entretien : points d'entretien ; procedures : procédures pas à pas).
// Lues à la construction du site : aucune requête au chargement (donc aucune
// erreur 404 pour un équipement qui n'en a pas), et disponibles aussi dans la
// publication en Artifact. Les fichiers restent copiés avec le site (dist/),
// mais la publication en Artifact ne les reprend pas (scripts/build-artifact.mjs) :
// ils sont déjà dans le module et ne comptent pas dans sa limite de fichiers.
const FILES = import.meta.glob('../../public/equipment/*/{bulles,donnees,entretien,procedures}.json', { eager: true, import: 'default' });

const BY = new Map(); // « <id>/<nom> » → données
for (const [file, data] of Object.entries(FILES)) {
  const [id, name] = file.split('/').slice(-2);
  BY.set(`${id}/${name.replace(/\.json$/, '')}`, data);
}

/** Données « name » de l'équipement « id », ou null s'il n'en a pas. */
export function equipmentData(id, name) {
  return (id && BY.get(`${id}/${name}`)) ?? null;
}
