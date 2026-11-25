// Écrit public/equipment/chaudieres-5-gal/data.json : les cotes viennent du modèle
// (src/models/chaudieres-5-gal/index.js), pour que la fiche et la 3D disent la même chose.
// Usage : node tools/chaudieres_fiche.mjs
import { writeFileSync } from 'node:fs';
import { IN, SEAU, COLLIERS, COUVERCLE, ANSE, COUPE, SAVON, GUENILLE, ETIQUETTE, ECART, HUILE, rayon, dessusCouvercle, volume, horsTout, placesHuile } from '../src/models/chaudieres-5-gal/index.js';

import { HORS_TOUT, PUBLIE, dessusCaillebotis } from '../src/models/bac-retention-100l/index.js';
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const h = horsTout();
const GAL = 3.785411784;
const fond = SEAU.talon + SEAU.paroi;
const litresSavon = volume(fond + SAVON.ep);
const dCoupe = 2 * rayon(COUPE.haut);
const litresHuile = HUILE.nombre * 5 * 3.785411784;
const prof = (() => { const zs = placesHuile().map(([, z]) => z); return Math.max(...zs) - Math.min(...zs) + COUVERCLE.d; })();

const SOURCE = 'Photo du client (P01) et sa description : une chaudière de savon de lin, une chaudière de dégraisseur et une chaudière coupée sur le dessus, où l\'on verse le savon et où l\'on met la guenille qui sert à nettoyer les outils. Aucun plan, aucune mesure';
const COTES = `Cotes usuelles d'un seau de 5 gallons US en polyéthylène, supposées (ni la marque ni le modèle ne se lisent sur la photo) : ${po(SEAU.haut)} de haut (${mm(SEAU.haut)}), Ø ${mm(SEAU.dHaut)} en haut, Ø ${mm(SEAU.dBas)} en bas, paroi de ${mm(SEAU.paroi, 1)}`;

const data = {
  id: 'chaudieres-5-gal',
  name: 'Chaudières de 5 gallons : savon de lin, dégraisseur et chaudière coupée pour la guenille ; chaudières d\'huile sur bac de rétention',
  manufacturer: 'Fabricant non identifié',
  category: 'Poste de nettoyage des outils',
  serial: '',
  document: {
    title: 'Photo du client (aucun plan) ; cotes usuelles d\'un seau de 5 gallons, supposées',
    reference: '',
    preparedBy: '',
    date: '',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Usage', 'On verse du savon de lin dans la chaudière coupée, on y met la guenille, et l\'on s\'en sert pour nettoyer les outils. Les deux chaudières pleines sont la réserve de savon de lin et de dégraisseur'],
    ['Chaudière', COTES],
    ['Contenance', `5 gallons US (${fr(5 * GAL, 1)} L) nominaux ; ${fr(volume(), 1)} L à ras bord, calculés sur le modèle`],
    ['Couvercle', `À jupe, Ø ${mm(COUVERCLE.d)} (supposé), jupe de ${mm(COUVERCLE.jupe)}, dessus en creux`],
    ['Anse', `Fil d'acier de Ø ${mm(ANSE.fil)} et poignée de plastique blanc de Ø ${mm(ANSE.poignee.d)} × ${mm(ANSE.poignee.long)} (supposés), pivots entre les deux colliers de renfort, à ${mm(ANSE.y)} du sol ; rabattue vers l'avant, contre la paroi, comme sur la photo`],
    ['Colliers de renfort', `Deux, à ${COLLIERS.y.map((y) => mm(y)).join(' et ')} du sol, saillie de ${mm(COLLIERS.saillie)} (supposés)`],
    ['Chaudière coupée', `Bas d'une chaudière de 5 gallons coupée à environ ${mm(COUPE.haut)} du sol (${po(COUPE.haut)}), hauteur relevée sur la photo par proportion avec la chaudière, à 15 % près ; Ø ${mm(dCoupe)} à la coupe ; coupe irrégulière, faite à la main (ondulation de ${mm(COUPE.onde)}). Posée sur le couvercle de la chaudière de dégraisseur, comme sur la photo`],
    ['Savon de lin', `Dans la chaudière coupée : ${mm(SAVON.ep)} d'épaisseur, soit ${fr(litresSavon, 1)} L — quantité supposée, le dedans ne se voit pas sur la photo`],
    ['Guenille', `Carré de coton d'environ ${mm(GUENILLE.cote)} de côté, froissé, posé sur le savon. Taille et couleur (rouge d'atelier) supposées : la guenille ne se voit pas sur la photo, elle vient de la description du client`],
    ['Étiquettes', `Environ ${mm(ETIQUETTE.large)} × ${mm(ETIQUETTE.haut)}, à ${mm(ETIQUETTE.y)} du sol (taille relevée sur la photo, à 20 % près ; placées plus bas que sur la photo, sous la poignée de l'anse, pour rester lisibles). Sur la photo, on lit seulement « …D SOAP » et « Lin… » sur la chaudière de gauche ; les étiquettes sont redessinées en français, sans marque : « SAVON DE LIN » et « DÉGRAISSEUR »`],
    ['Encombrement', `${mm(h.large)} de large × ${mm(h.haut)} de haut × ${mm(h.prof)} de profond ; ${mm(ECART)} entre les deux couvercles`],
    ['Chaudières d\'huile (P02)', `Demande du client : un bac de rétention avec au plus ${HUILE.nombre} chaudières d'huile de 5 gallons. Même seau que P01, fermé, étiquette « HUILE HYDRAULIQUE » redessinée (aucune photo : marque, couleur et contenu exact supposés). Posées sur le bac de rétention 100 L (modèle bac-retention-100l) : 3 au fond, 2 devant, en quinconce, couvercles à ${mm(HUILE.jeu)} l'un de l'autre ; ${HUILE.nombre} × 18,9 L = ${fr(litresHuile, 1)} L, sous les ${PUBLIE.retention} L publiés du bac (affiche « MAX ${PUBLIE.retention} LITRES ») ; environ ${fr(HUILE.nombre * 19)} kg pleines, sous la charge publiée de ${PUBLIE.charge} kg. Encombrement : ${mm(HORS_TOUT.L)} × ${mm(HORS_TOUT.P)} (le bac), ${mm(dessusCaillebotis() + dessusCouvercle())} de haut ; les couvercles débordent du caillebotis, pas du bac (${mm(prof)} de profond)`],
    ['Non modélisé', 'Le contenu des deux chaudières pleines (niveau inconnu), la saleté des chaudières, la marque et le texte des étiquettes d\'origine, la tablette de bois où elles sont posées'],
  ],
  weights: [],
  sheetTitles: { P01: 'Photo du client : chaudières de savon de lin et de dégraisseur, chaudière coupée posée dessus' },
  root: 'P01',
  assemblies: {
    P01: {
      title: '5 GALLON PAILS: LINSEED SOAP, DEGREASER, CUT PAIL FOR RAG',
      titleFr: 'Chaudières de 5 gallons : savon de lin, dégraisseur et chaudière coupée',
      pn: '',
      sheets: ['P01'],
      note: `Reconstitution 3D d'après la photo du client (P01) et sa description. ${COTES}. Relevé sur la photo : la hauteur de la chaudière coupée (environ ${mm(COUPE.haut)}), sa coupe irrégulière, l'anse rabattue vers l'avant, la place des étiquettes. La chaudière coupée repose sur le couvercle de la chaudière de dégraisseur ; on y verse le savon de lin et l'on y met la guenille qui sert à nettoyer les outils. En vue éclatée, les couvercles, la chaudière coupée, le savon et la guenille montent ; la coupe proposée passe par l'axe des deux chaudières.`,
      parts: [
        ['1', '', 1, 'CHAUDIÈRE de 5 gallons, SAVON DE LIN', { note: `Seau de polyéthylène blanc, ${po(SEAU.haut)} de haut, Ø ${mm(SEAU.dHaut)} en haut ; étiquette redessinée. Contenu non représenté.` }],
        ['2', '', 1, 'CHAUDIÈRE de 5 gallons, DÉGRAISSEUR', { note: 'Même seau ; étiquette redessinée. Contenu non représenté. Porte la chaudière coupée.' }],
        ['3', '', 2, `COUVERCLE de chaudière, Ø ${mm(COUVERCLE.d)}`, { note: 'À jupe, enfoncé sur le bord du seau.' }],
        ['4', '', 2, 'ANSE de fil d\'acier, poignée de plastique', { note: `Fil de Ø ${mm(ANSE.fil)}, rabattue vers l'avant.` }],
        ['5', '', 1, `CHAUDIÈRE COUPÉE (bac à savon), ${mm(COUPE.haut)} de haut`, { note: `Bas d'une chaudière de 5 gallons dont on a coupé le dessus ; Ø ${mm(dCoupe)} à la coupe. Reçoit le savon et la guenille.` }],
        ['6', '', 1, 'SAVON DE LIN, dans la chaudière coupée', { note: `${mm(SAVON.ep)} d'épaisseur, ${fr(litresSavon, 1)} L (supposé).` }],
        ['7', '', 1, 'GUENILLE de coton, pour nettoyer les outils', { note: `Environ ${mm(GUENILLE.cote)} de côté, froissée (taille et couleur supposées).` }],
      ],
    },
    P02: {
      title: '5 GALLON OIL PAILS ON 100 L SPILL PALLET',
      titleFr: `Chaudières d'huile de 5 gallons (${HUILE.nombre} au plus) sur le bac de rétention 100 L`,
      pn: '',
      sheets: ['P01'],
      note: `Demande du client : « bac de rétention avec max ${HUILE.nombre} chaudières d'huile 5 gallons ». Seau de P01 (cotes usuelles supposées), fermé, étiquette « HUILE HYDRAULIQUE » redessinée, sans marque ; aucune photo des chaudières d'huile. Bac : le mini bac de rétention 100 L avec caillebotis (fiche bac-retention-100l). ${HUILE.nombre} chaudières × 18,9 L = ${fr(litresHuile, 1)} L, sous les ${PUBLIE.retention} L de l'affiche ; d'où le maximum de ${HUILE.nombre}. Rangées en quinconce (3 au fond, 2 devant) ; anses rabattues vers l'extérieur, étiquettes vers l'avant. En vue éclatée, les chaudières, les couvercles et les anses montent.`,
      parts: [
        ['8', 'PFCP100006F', 1, 'BAC DE RÉTENTION 100 L, PEHD jaune', { note: `${mm(HORS_TOUT.L)} × ${mm(HORS_TOUT.P)} × ${mm(HORS_TOUT.H)} ; charge publiée ${PUBLIE.charge} kg. Voir la fiche bac-retention-100l.` }],
        ['9', '', 1, 'CAILLEBOTIS du bac, noir', { pseudo: true, note: 'Porte les chaudières.' }],
        ['10', '', 1, `AFFICHE « MAX ${PUBLIE.retention} LITRES »`, { pseudo: true, note: 'Collée sur la ceinture avant du bac.' }],
        ['11', '', HUILE.nombre, 'CHAUDIÈRE de 5 gallons, HUILE HYDRAULIQUE', { note: `Même seau que P01, ${po(SEAU.haut)} de haut, Ø ${mm(SEAU.dHaut)} en haut ; étiquette redessinée. Contenu non représenté.` }],
        ['3', '', HUILE.nombre, `COUVERCLE de chaudière, Ø ${mm(COUVERCLE.d)}`, { note: 'À jupe, enfoncé sur le bord du seau.' }],
        ['4', '', HUILE.nombre, 'ANSE de fil d\'acier, poignée de plastique', { note: 'Rabattue vers l\'extérieur du bac.' }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/chaudieres-5-gal/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; ${fr(volume(), 1)} L à ras bord, coupe à Ø ${fr(dCoupe, 1)} mm, dessus du couvercle à ${fr(dessusCouvercle(), 1)} mm, encombrement ${fr(h.large)} × ${fr(h.haut)} × ${fr(h.prof)} mm`);
