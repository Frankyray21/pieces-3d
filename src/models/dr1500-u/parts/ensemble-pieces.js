// Pièces de l'ensemble P002 (page 2) qui n'ont pas de page propre dans le manuel — lot A (structure).
// Hors du motif Pxxx.js : ce fichier n'est pas un builder d'assemblage ; la vue d'ensemble P002 (intégration)
// appelle `ensemblePieces(api)` puis pose chaque objet renvoyé avec son repère de la liste de P002.
//
// Contrat : chaque fonction construit ses objets dans le REPÈRE FOREUSE (layout.js), pose de référence (mât à 0°),
// et renvoie un tableau d'objets (un par exemplaire, dans l'ordre des côtés −Z puis +Z) ; aucun appel à api.part ici.
//   '1'  bloc I/O MA618 (BLOC_IO)              '8'  pattes d'extension ×2 (PATTE)
//   '9'  plaque d'ancrage MA617 (ANCRAGE)      '12' vérins de tilt HBU3532 ×2 (TILT.cylFrame → TILT.cylAssise)
//   '13' frame skud FA601 (SKID, TILT)         '15' pins GA608 ×2 (TILT.cylFrame)
// Sources : couverture (page 1) et vue éclatée (page 2) seulement ; cotes estimées de layout.js.

/** Objets des repères de P002 sans page : { '1': [...], '8': [...], '9': [...], '12': [...], '13': [...], '15': [...] }. */
export function ensemblePieces(api) { // eslint-disable-line no-unused-vars
  // À écrire par le lot A.
  return {};
}
