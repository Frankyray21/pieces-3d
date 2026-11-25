// Écrit public/equipment/boite-lunch-mineur/data.json : les cotes viennent du modèle
// (src/models/boite-lunch-mineur/index.js), pour que la fiche et la 3D disent la même chose.
// Usage : node tools/boite_lunch_fiche.mjs
import { writeFileSync } from 'node:fs';
import { IN, BOITE, TOLE, CAISSON, COUVERCLE, POIGNEE, PATTE, FERMOIR, RIVET, CHARNIERE, hautCouvercle, pan, volume, hautAvecPoignee } from '../src/models/boite-lunch-mineur/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const p = pan();
const v = volume();

const SOURCE = 'Photo du client (P01) : la boîte vue de face, avec ses cotes hors tout écrites dessus — 12" L × 4 1/2" W × 7 1/4" H — et le logo « Canada Tuff — Lifetime Guarantee — 1956 » en filigrane. Aucun plan';
const RELEVE = 'Relevé sur la photo, à l\'échelle des 12 po de long (environ 1,83 pixel par millimètre, à 5 % près)';

const data = {
  id: 'boite-lunch-mineur',
  name: 'Boîte à lunch de mineur en acier galvanisé, 12 × 4 1/2 × 7 1/4 po',
  manufacturer: 'Canada Tuff (logo sur la photo)',
  category: 'Effets personnels du mineur',
  serial: '',
  document: {
    title: 'Photo du client avec les cotes hors tout (aucun plan)',
    reference: '',
    preparedBy: '',
    date: '',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Hors tout', `${po(BOITE.L)} de long × ${po(BOITE.P)} de large × ${po(BOITE.H)} de haut (${mm(BOITE.L, 1)} × ${mm(BOITE.P, 1)} × ${mm(BOITE.H, 1)}), cotes écrites sur la photo ; ${mm(hautAvecPoignee())} de haut avec la poignée levée (relevé)`],
    ['Tôle', `Acier galvanisé, ${mm(TOLE.ep, 1)} d'épaisseur (calibre 24, supposé), arêtes pliées`],
    ['Caisson', `${mm(CAISSON.haut)} de haut jusqu'au joint (${po(CAISSON.haut)}). ${RELEVE}`],
    ['Couvercle', `${mm(hautCouvercle())} de haut : jupe droite de ${mm(COUVERCLE.jupe)} (relevée), pans inclinés devant et derrière de ${mm(p.montee)} de montée (relevée) et ${mm(p.avancee)} d'avancée, soit ${fr(p.angle)}° sur l'horizontale ; dessus plat de ${mm(COUVERCLE.dessus)} de large (supposé : la photo est prise de face) ; flancs en pentagone`],
    ['Contenance', `${fr(v.total, 1)} L, calculée sur le modèle (caisson ${fr(v.caisson, 1)} L, couvercle ${fr(v.couvercle, 1)} L)`],
    ['Poignée', `Tige d'acier chromée de Ø ${mm(POIGNEE.d)} (relevé), cintrée : barre du haut de ${mm(2 * POIGNEE.barre)} à ${mm(POIGNEE.haut)} au-dessus du couvercle, pieds couchés écartés de ${mm(2 * POIGNEE.montee)} ; ses bouts tournent dans deux pattes`],
    ['Pattes de poignée', `Feuillard nickelé en selle sur la tige, ${mm(PATTE.long)} × ${mm(PATTE.large)}, entraxe ${mm(2 * PATTE.x)} (relevé) ; deux rivets chacune (supposés)`],
    ['Fermoirs', `Deux fermoirs à levier nickelés, entraxe ${mm(2 * FERMOIR.x)} (relevé) : gâche en ogive de ${mm(FERMOIR.large)} × ${mm(FERMOIR.gache)} sur la jupe du couvercle, platine de ${mm(FERMOIR.large)} × ${mm(FERMOIR.platine)} sur le caisson, levier jusqu'à ${mm(FERMOIR.levier)} sous le joint ; deux rivets par platine, boucle de fil qui prend le crochet de la gâche. Formes simplifiées d'après la photo`],
    ['Rivets du couvercle', `Deux têtes de rivet de Ø ${mm(RIVET.d)} sur la jupe, à ${mm(RIVET.y)} du dessous et à ${mm(RIVET.x, 1)} du milieu (relevés) ; ce qu'ils tiennent dedans ne se voit pas`],
    ['Charnière', `Charnière continue de ${mm(CHARNIERE.long)} au dos, nœud de Ø ${mm(CHARNIERE.d)}, ailes de ${mm(CHARNIERE.aile)} rivetées (supposée : le dos ne se voit pas sur la photo)`],
    ['Non modélisé', 'Le marquage estampé de la jupe du couvercle (illisible sur la photo), le dedans de la boîte (rien n\'en paraît sur la photo), l\'ouverture du couvercle'],
  ],
  weights: [],
  sheetTitles: { P01: 'Photo du client : boîte à lunch de face, cotes hors tout' },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'MINER\'S LUNCH BOX, GALVANIZED STEEL, 12" × 4 1/2" × 7 1/4"',
      titleFr: 'Boîte à lunch de mineur en acier galvanisé',
      pn: '',
      sheets: ['P01'],
      note: `Reconstitution 3D d'après la photo du client (P01), vue de face, et les cotes hors tout écrites dessus : ${po(BOITE.L)} × ${po(BOITE.P)} × ${po(BOITE.H)}. ${RELEVE} : hauteur du caisson (${mm(CAISSON.haut)}) et de la jupe du couvercle (${mm(COUVERCLE.jupe)}), pans inclinés, poignée, pattes, fermoirs et rivets. Supposé : la largeur du dessus plat, l'épaisseur de la tôle, la charnière du dos. En vue éclatée, le couvercle et sa gâche montent, la poignée et ses pattes au-dessus, les fermoirs avancent, la charnière recule ; la coupe proposée passe en travers, par le milieu de la boîte.`,
      parts: [
        ['1', '', 1, 'CAISSON, tôle d\'acier galvanisé', { note: `Fond et quatre côtés, ${mm(CAISSON.haut)} de haut.` }],
        ['2', '', 1, 'COUVERCLE à pans, tôle d\'acier galvanisé', { note: `Jupe de ${mm(COUVERCLE.jupe)}, pans à ${fr(p.angle)}°, dessus plat de ${mm(COUVERCLE.dessus)} (supposé).` }],
        ['3', '', 1, `POIGNÉE, tige d'acier chromée Ø ${mm(POIGNEE.d)}`, { note: `Cintrée, ${mm(POIGNEE.haut)} au-dessus du couvercle.` }],
        ['4', '', 2, 'PATTE DE POIGNÉE, feuillard nickelé', { note: 'En selle sur le bout de la poignée, rivetée sur le dessus du couvercle.' }],
        ['5', '', 1, 'CHARNIÈRE continue', { note: `${mm(CHARNIERE.long)}, au dos (supposée).` }],
        ['6', '', 2, 'FERMOIR À LEVIER, nickelé', { note: 'Platine rivetée sur le caisson, levier et boucle de fil.' }],
        ['7', '', 2, 'GÂCHE de fermoir, nickelée', { note: 'Platine en ogive rivetée sur la jupe du couvercle, crochet embouti.' }],
        ['8', '', 2, `RIVET, tête de Ø ${mm(RIVET.d)}`, { note: 'Sur la jupe du couvercle, au-dessus des fermoirs ; fonction non visible.' }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/boite-lunch-mineur/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; couvercle ${fr(hautCouvercle(), 1)} mm, pans à ${fr(p.angle, 1)}°, ${fr(v.total, 2)} L, ${fr(hautAvecPoignee(), 1)} mm avec la poignée`);
