import parts from './parts/index.js';

// DR Fabrication DR1500-U (manuel de pièces MRI, 25 pages ; dessins de la tête, du treuil, du mandrin et du
// serre-tiges : Usinage X-Spec). Listes : public/equipment/dr1500-u/data.json ; pages : pages/P001 à P025.
// Repère commun, cotes d'interface et sources des cotes : layout.js (à lire avant tout).
//
// UN FICHIER PAR ASSEMBLAGE : parts/Pxxx.js (export par défaut `function Pxxx(api, opts)`, Pxxx = identifiant de
// l'assemblage dans data.json = première page de son dessin). `node scripts/parts-index.mjs dr1500-u` régénère
// parts/index.js ; un brouillon parts/Pxxx.js non inscrit est déjà chargé par `npm run dev` et par
// `node scripts/check-models.mjs --eq dr1500-u --qty Pxxx`.
// Règles communes : chaque ligne de la liste a son objet 3D (api.part(repère, objet, éclaté)), autant d'objets que
// la quantité ; une ligne « same » désigne l'objet d'une autre ligne (pas d'objet à poser) ; une ligne « no3d »
// n'en a pas ; une ligne « link » se pose avec api.sub('Pyyy') (sous-assemblage) ; lignes « p. 8 », « p. 11 »,
// « p. 18 », « p. 24 » (pseudo) : renvoi à un assemblage sans ligne dans la liste, posé de même. Ne modéliser que
// ce que le manuel montre. Chacun n'écrit QUE ses fichiers ; layout.js, data.json et src/viewer/* ne se modifient
// pas dans un lot : signaler le besoin. Assistants propres à un lot : parts/_<lot>.js (ex. parts/_tete.js).
//
// RÉPARTITION
//   A — structure : P003 assise, P004 mât, P005 table, P006 kit de poulie, P025 base du serre-tiges ; pièces de
//       l'ensemble P002 sans page (frame skud rep. 13, bloc I/O rep. 1, pattes d'extension rep. 8, plaque
//       d'ancrage rep. 9, vérins de tilt rep. 12, pins GA608 rep. 15) dans parts/ensemble-pieces.js (hors du
//       motif Pxxx.js : la vue d'ensemble P002 l'importera à l'intégration).
//   B — tête et serrage : P011 kit d'adaptateur transmission, P012 tête XBH, P018 mandrin 12HH, P020 piston et
//       cylindre du mandrin, P021 serre-tiges 12HH, P023 piston et cylindre du serre-tiges, P024 plaque support et
//       bague de guidage. Réutilisation du STM-1500 : aucun builder à reprendre tel quel (le mandrin est construit
//       dans P048 de src/models/stm-1500/head.js, repère 47, et le serre-tiges dans P010 de drill.js, repère 16 :
//       pas d'assemblage propre, pièce par pièce absente) ; reprendre leurs cotes (CHUCK et RC de layout.js : mêmes
//       numéros Boyles 3506870, 2920455…) et, si utile, leurs profils de révolution (lathe) comme point de départ.
//       Les deux listes Boyles (P018, P021) sont aussi celles des P052 et P032 du STM-1500 (même pièces, autres
//       numéros) : ses listes aident à identifier les pièces, pas à les placer.
//   C — treuil : P014 Hoist XW-2100, P016 vis d'enroulement 206-419.
//   D — groupes : P007 groupe hydraulique, P008 panneaux, P009 waterpack, P010 pompe à eau.
//   Intégration (après les lots) : P001 (racine : foreuse, groupe, waterpack posés au sol, ROOT de layout.js) et
//   P002 (ensemble de la foreuse : sous-assemblages posés aux constantes de layout.js, pièces de
//   parts/ensemble-pieces.js), vignette, README.
//
// Assemblages sans builder : affichés avec les dessins du manuel.
export default {
  ...parts,
};
