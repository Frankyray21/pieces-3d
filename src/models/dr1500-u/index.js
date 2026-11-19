import parts from './parts/index.js';

// DR Fabrication DR1500-U (manuel de pièces MRI, 25 pages ; dessins de la tête, du treuil, du mandrin et du
// serre-tiges : Usinage X-Spec). Listes : public/equipment/dr1500-u/data.json ; pages : pages/P001 à P025.
// Repère commun, cotes d'interface et sources des cotes : layout.js (à lire avant tout).
//
// LES 20 ASSEMBLAGES SONT EN 3D, un fichier par assemblage dans parts/ (export par défaut `function Pxxx(api, opts)`,
// Pxxx = identifiant de l'assemblage dans data.json = première page de son dessin ; `node scripts/parts-index.mjs
// dr1500-u` régénère parts/index.js) :
//   P001 racine (foreuse, groupe hydraulique et waterpack posés au sol, ROOT) ; P002 foreuse assemblée comme sur la
//   couverture (p. 1), éclatée comme la p. 2, sous-assemblages à facettes allégées ;
//   structure : P003 assise, P004 mât et vérin d'avance, P005 table, P006 kit de poulie bascule, P025 base du
//   serre-tiges, et parts/ensemble-pieces.js (frame skud, bloc I/O, pattes d'extension, plaque d'ancrage, vérins de
//   tilt et leurs pins : pièces de P002 sans page) ;
//   tête et serrage : P011 kit d'adaptateur transmission, P012 tête XBH, P018 mandrin Boyles 12HH, P020 son piston
//   et cylindre, P021 serre-tiges Boyles 12HH, P023 son piston et cylindre, P024 plaque support et bague de guidage ;
//   treuil : P014 Hoist XW-2100, P016 vis d'enroulement ;
//   groupes : P007 groupe hydraulique, P008 panneaux, P009 waterpack, P010 pompe à eau.
// Assistants communs à plusieurs fichiers : parts/_structure.js, _tete.js, _boyles.js, _treuil.js, _groupes.js.
// Règles : chaque ligne de la liste a son objet 3D (api.part(repère, objet, éclaté)), autant d'objets que la
// quantité ; une ligne « same » désigne l'objet d'une autre ligne ; une ligne « no3d » n'en a pas ; une ligne
// « link » se pose avec api.sub('Pyyy') ; lignes « p. 8 », « p. 11 », « p. 18 », « p. 24 » (pseudo) : renvoi à un
// assemblage sans ligne dans la liste, posé de même. Seul ce que le manuel montre est modélisé.
//
// COULEURS (choix du site, à valider par le client : le manuel est en noir et blanc, sa seule couleur est le jaune et
// noir du logo DR) : un seul jaune (« yellow ») pour tous les mécano-soudés et carters peints — frame skud, assise,
// mât, table, kit de poulie, base, carter de tête, mandrin, serre-tiges, groupe, waterpack ; noir pour les vérins ;
// acier, bronze, laiton et téflon naturels pour le reste ; fonte noire des moteurs et pompes du commerce.
//
// Contrôles : node scripts/check-models.mjs --eq dr1500-u --qty --max-tris 150000
export default {
  ...parts,
};
