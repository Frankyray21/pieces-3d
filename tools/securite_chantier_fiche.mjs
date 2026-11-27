// Écrit public/equipment/securite-chantier/data.json : les cotes viennent du modèle
// (src/models/securite-chantier/), pour que la fiche et la 3D disent la même chose.
// Usage : node tools/securite_chantier_fiche.mjs
import { writeFileSync } from 'node:fs';
import { RUBAN, AFFICHE, CARTE, FIL } from '../src/models/securite-chantier/signalisation.js';
import { CONE, CASING, COUVERCLE, MONTERIE } from '../src/models/securite-chantier/sol.js';
import { BOITE, CADENAS, PINCE, ETIQ } from '../src/models/securite-chantier/cadenassage.js';
import { SANGLE, DRING, LONGE, SRL } from '../src/models/securite-chantier/antichute.js';

const IN = 0.0254;
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (m, n = 0) => `${fr(m * 1000, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (m) => { const q = Math.round((m / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };

const SOURCE = 'Six photos de places de travail fournies par le client (PH1 à PH6). Aucune fiche de fabricant : cotes des articles courants du commerce, ou relevées à l\'œil sur les photos';
const PHOTOS = ['PH1', 'PH2', 'PH3', 'PH4', 'PH5', 'PH6'];

const data = {
  id: 'securite-chantier',
  name: 'Lot de sécurité de la place de travail (poste ITH Cubex)',
  manufacturer: 'Articles courants du commerce (fabricants non identifiés)',
  category: 'Signalisation, cadenassage et protection contre les chutes',
  serial: '',
  document: { title: 'Photos de places de travail du client (aucun plan)', reference: 'Photos', preparedBy: '', date: '', sheets: 6, pagePattern: 'pages/{sheet}.webp' },
  specs: [
    ['Source', SOURCE],
    ['Unités', 'Mètres, Y vers le haut, sol à y = 0 (comme les fichiers GLB pour Unreal)'],
    ['Usure', 'Textures procédurales : peinture écaillée sur acier rouillé, rouille franche, boue, éraflures, sangles poussiéreuses ; exportées avec les GLB'],
    ['Barricade', `Ruban rouge « DANGER » de ${po(RUBAN.large)} tendu sur ${fr(RUBAN.portee, 1)} m à ${fr(RUBAN.haut, 1)} m du sol, flèche de ${mm(RUBAN.fleche)} ; noué à deux fils du grillage ; carte d'identification de ${po(CARTE.w)} × ${po(CARTE.h)}`],
    ['Affiches', `Aluminium de ${po(AFFICHE.w)} × ${po(AFFICHE.h)} : « Accès interdit », « Forage en cours », « Forage à distance », pendues au ruban par des attaches`],
    ['Cône de collet', `Cône rouge de ${po(CONE.h)}, base carrée noire de ${po(CONE.base)}`],
    ['Casings', `Tube d'acier de ${po(CASING.de)} (paroi de ${po(CASING.ep)}) peint rouge, 100 à 200 mm hors sol, modélisé sur ${mm(CASING.enfoui)} sous le sol`],
    ['Couvercle de trou', `Disque d'acier de Ø ${po(COUVERCLE.d)} × ${po(COUVERCLE.t)}, peinture rouge presque partie, rouillé, ${COUVERCLE.trous.length} trous`],
    ['Couvercle de monterie', `Tôle larmée de ${po(MONTERIE.w)} × ${po(MONTERIE.w)} × ${po(MONTERIE.t)}, jaune usé, rebord de ${po(MONTERIE.rebord)} dessous, quatre oreilles de levage (supposé : aucune photo)`],
    ['Cadenassage', `Boîte de groupe de ${po(BOITE.w)} × ${po(BOITE.h)} × ${po(BOITE.d)}, ${BOITE.trous} trous de cadenassage ; pince multi-lock de ${po(PINCE.jaw)} à 6 trous ; cadenas de ${po(CADENAS.w)} × ${po(CADENAS.h)}, anse de ${po(CADENAS.anse)} ; étiquettes de ${po(ETIQ.w)} × ${po(ETIQ.h)}`],
    ['Antichute', `Harnais complet à sangles de ${po(SANGLE.w)}, anneau dorsal ; longe de 6 pi à absorbeur ; bloc rétractable de Ø ${po(SRL.d)} à câble de ${po(SRL.cable)}`],
    ['Repris', 'Extincteur à poudre de 5 lb et trousse de premiers soins : les modèles du poste de secours (équipement « poste-secours »)'],
  ],
  weights: [],
  sheetTitles: {
    PH1: 'Place de travail : casings rouges au sol, couvercle de trou rouge, câbles',
    PH2: 'Foreuse sur sa grille, galerie grillagée',
    PH3: 'Place de travail : casings rouges, ruban de barricade, console',
    PH4: 'Armoire électrique : affiche « DANGER 600 VOLTS » (style des affiches)',
    PH5: 'Pied du mât : tiges, chevalet, outils',
    PH6: 'Foreuse au collet : casings dans le cadre de bois, couvercle rouillé, barrière jaune et noire',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'WORKPLACE SAFETY KIT', titleFr: 'Lot de sécurité de la place de travail', pn: '', sheets: PHOTOS,
      note: 'Le lot complet disposé comme sur une place de travail, d\'après les six photos du client : barricade et affiches au fond, cône, casings et couvercles au sol, boîte de cadenassage au mur, extincteur et trousse, protection antichute. Les supports (grillage, mur, ancrage du bloc rétractable, porteur du harnais) ne sont pas modélisés. Chaque article s\'ouvre sur sa page ; le fichier GLB de chacun, en mètres, est dans le dossier unreal/ de l\'équipement.',
      parts: [
        ['1', '', 1, 'BARRICADE : ruban, nœuds, carte d\'identification', { link: 'P02' }],
        ['2', '', 3, 'AFFICHE pendue au ruban', { link: 'P03', qty3d: 1 }],
        ['3', '', 1, 'CÔNE ROUGE de collet', { link: 'P04' }],
        ['4', '', 3, 'CASING rouge de collet', { link: 'P05' }],
        ['5', '', 1, 'COUVERCLE DE TROU en acier rouillé', { link: 'P06' }],
        ['6', '', 1, 'COUVERCLE DE MONTERIE', { link: 'P07' }],
        ['7', '', 1, 'CADENASSAGE : boîte, pince, cadenas, étiquettes', { link: 'P08' }],
        ['8', '', 1, 'PROTECTION CONTRE LES CHUTES : harnais, longe, bloc rétractable', { link: 'P09' }],
        ['9', '', 1, 'EXTINCTEUR à poudre de 5 lb', { note: 'Modèle repris du poste de secours, posé debout au sol.' }],
        ['10', '', 1, 'TROUSSE DE PREMIERS SOINS', { note: 'Modèle repris du poste de secours, couchée.' }],
      ],
    },
    P02: {
      title: 'BARRICADE', titleFr: 'Barricade (ruban rouge)', pn: '', sheets: ['PH3', 'PH6'],
      note: `Ruban de barricade rouge imprimé « DANGER » en blanc, ${po(RUBAN.large)} de large (largeur courante), tendu sur ${fr(RUBAN.portee, 1)} m à ${fr(RUBAN.haut, 1)} m du sol avec une flèche de ${mm(RUBAN.fleche)} et un léger vrillage. Sur la photo PH3, le ruban traverse la place à hauteur de genou ; ici il est montré à hauteur de taille. Chaque bout est noué à un fil du grillage, les deux bouts libres pendent. La carte d'identification (qui a posé la barricade, quand, pourquoi) est pendue au ruban par une attache. Les fils de grillage ne servent qu'à situer les nœuds.`,
      parts: [
        ['1', '', 1, `RUBAN DE BARRICADE rouge « DANGER », ${po(RUBAN.large)}`, { note: `${fr(RUBAN.portee, 1)} m entre les nœuds ; motif répété tous les ${mm(RUBAN.motif)}.` }],
        ['2', '', 2, 'NŒUD du ruban et bouts pendants', {}],
        ['3', '', 1, `CARTE D'IDENTIFICATION DE LA BARRICADE, ${po(CARTE.w)} × ${po(CARTE.h)}`, { note: 'Champs Nom, Date, Heure, Raison ; écriture au crayon-feutre volontairement illisible.' }],
        ['4', '', 2, `FIL DE GRILLAGE (support, Ø ${mm(FIL.d)})`, { note: 'Montré pour situer les nœuds ; ne fait pas partie du lot.', pseudo: true }],
      ],
    },
    P03: {
      title: 'SIGNS', titleFr: 'Affiches', pn: '', sheets: ['PH4'],
      note: `Trois affiches d'aluminium de ${po(AFFICHE.w)} × ${po(AFFICHE.h)}, coins arrondis, quatre trous de ${po(AFFICHE.trou * 2)}. En-tête à la manière de l'affiche « DANGER 600 VOLTS » de la photo PH4 (ovale rouge sur bandeau noir) ; « ATTENTION » noir sur jaune pour « Forage en cours ». Textes : ACCÈS INTERDIT (Personnel autorisé seulement), FORAGE EN COURS (Avisez le foreur avant d'entrer), FORAGE À DISTANCE (Foreuse en marche sans opérateur). Les petites lignes sont supposées : à remplacer par le texte des affiches de la mine. Salissures, éclaboussures de boue, éraflures et un coin plié.`,
      parts: [
        ['1', '', 1, 'AFFICHE « DANGER — ACCÈS INTERDIT »', {}],
        ['2', '', 1, 'AFFICHE « ATTENTION — FORAGE EN COURS »', {}],
        ['3', '', 1, 'AFFICHE « DANGER — FORAGE À DISTANCE »', {}],
      ],
    },
    P04: {
      title: 'COLLAR CONE', titleFr: 'Cône rouge de collet', pn: '', sheets: ['PH1'],
      note: `Cône de signalisation rouge de ${po(CONE.h)} (format courant), base carrée noire de ${po(CONE.base)} à coins coupés, posé sur le collet d'un trou. Plastique rayé, boue sur le bas. Le format exact du cône utilisé à la mine n'est pas connu : à confirmer.`,
      parts: [['1', '', 1, `CÔNE ROUGE de ${po(CONE.h)}, base noire`, {}]],
    },
    P05: {
      title: 'COLLAR CASINGS', titleFr: 'Casings rouges de collet', pn: '', sheets: ['PH1', 'PH3', 'PH6'],
      note: `Bouts de tube d'acier peints rouge, enfoncés au collet des trous (photos PH1, PH3 et PH6). Pris de ${po(CASING.de)} de diamètre extérieur (tube de 8 po, paroi de ${po(CASING.ep)}) d'après leur taille sur les photos : à mesurer. Sortie de 100 à 200 mm hors sol ; le tube est modélisé sur ${mm(CASING.enfoui)} sous le sol (à enfoncer dans le plancher dans Unreal) ; bout du haut coupé au chalumeau, peinture écaillée, rouille et boue. Le dedans est rouillé, l'eau boueuse est à 120 mm sous le sol.`,
      parts: [['1', '', 3, `CASING, tube d'acier de ${po(CASING.de)} peint rouge`, { note: 'Trois sorties différentes : 100, 150 et 200 mm.' }]],
    },
    P06: {
      title: 'HOLE COVER', titleFr: 'Couvercle de trou en acier rouillé', pn: '', sheets: ['PH1', 'PH6'],
      note: `Disque d'acier coupé au chalumeau, Ø ${po(COUVERCLE.d)} × ${po(COUVERCLE.t)} (estimé sur PH1, à côté des casings), percé de trous (deux de 1 1/2 po pour le crochet, quatre de 1 po). Peinture rouge presque partie (PH1), rouille franche et acier lustré aux endroits où l'on marche (PH6). Légèrement voilé.`,
      parts: [['1', '', 1, `COUVERCLE DE TROU, disque d'acier Ø ${po(COUVERCLE.d)}`, {}]],
    },
    P07: {
      title: 'RAISE COVER', titleFr: 'Couvercle de monterie', pn: '', sheets: [],
      note: `Aucune photo du couvercle de monterie : modèle supposé, à corriger d'après une photo. Tôle larmée de ${po(MONTERIE.w)} × ${po(MONTERIE.w)} × ${po(MONTERIE.t)} peinte jaune (usée, larmes frottées), rebord de cornière de ${po(MONTERIE.rebord)} dessous en retrait de 3 po qui la garde centrée sur l'ouverture, quatre oreilles de levage soudées à 6 po des coins (trou de ${po(MONTERIE.oreille.trou)} pour la manille).`,
      parts: [['1', '', 1, `COUVERCLE DE MONTERIE, tôle larmée de ${po(MONTERIE.w)}`, { note: 'Forme supposée.' }]],
    },
    P08: {
      title: 'LOCKOUT', titleFr: 'Cadenassage', pn: '', sheets: [],
      note: `Boîte de cadenassage de groupe en acier peint rouge, ${po(BOITE.w)} × ${po(BOITE.h)} × ${po(BOITE.d)}, montée au mur (bas à 0,9 m) : fente sur le dessus pour les clés de l'équipement, couvercle à charnière avec fenêtre, deux pattes de ${po(BOITE.patte)} sous la boîte, percées de ${BOITE.trous} trous de ${po(BOITE.dTrou)} en face l'un de l'autre. Un cadenas dans un trou empêche d'ouvrir. Dans le trou 3, une pince multi-lock (moraillon) de ${po(PINCE.jaw)}, poignée enrobée de vinyle rouge à six trous, porte trois cadenas personnels rouges ; un cadenas bleu est dans le trou 8. Chaque cadenas a son étiquette « DANGER — CADENASSÉ — NE PAS FAIRE FONCTIONNER » (nom illisible). Formats courants du commerce ; pas de photo du client.`,
      parts: [
        ['1', '', 1, `BOÎTE DE CADENASSAGE DE GROUPE, ${po(BOITE.w)} × ${po(BOITE.h)} × ${po(BOITE.d)}`, {}],
        ['2', '', 1, `PINCE MULTI-LOCK de ${po(PINCE.jaw)}, six trous`, {}],
        ['3', '', 4, `CADENAS DE SÉCURITÉ, corps de nylon ${po(CADENAS.w)} × ${po(CADENAS.h)}, anse d'acier de ${po(CADENAS.anse)}`, { note: 'Trois rouges (personnels), un bleu.' }],
        ['4', '', 4, `ÉTIQUETTE DE CADENASSAGE, ${po(ETIQ.w)} × ${po(ETIQ.h)}`, {}],
      ],
    },
    P09: {
      title: 'FALL PROTECTION', titleFr: 'Protection contre les chutes', pn: '', sheets: [],
      note: `Harnais complet montré porté (forme d'un travailleur de taille moyenne, sans le corps) : sangles de polyester jaune à bande noire de ${po(SANGLE.w)}, bretelles croisées au dos sur une plaque dorsale, anneau en D dorsal forgé de ${po(DRING.w)}, sangle de poitrine, tours de cuisse et sangle sous-fessière, boucles à passant. Longe de 6 pi à absorbeur d'énergie accrochée à l'anneau dorsal : mousqueton à double verrouillage, absorbeur dans sa housse, sangle tubulaire qui pend et repose au sol, crochet à armature au bout. Bloc rétractable (enrouleur-dérouleur) de Ø ${po(SRL.d)} : carter, émerillon et mousqueton d'ancrage en haut, câble galvanisé de ${po(SRL.cable)} sorti de ${mm(SRL.sortie)}, butée et mousqueton. Point d'ancrage non modélisé. Formats courants ; pas de photo du client.`,
      parts: [
        ['1', '', 1, `HARNAIS COMPLET, sangles de ${po(SANGLE.w)}`, {}],
        ['2', '', 1, 'ANNEAU EN D dorsal, acier forgé', {}],
        ['3', '', 3, 'BOUCLE À PASSANT (poitrine, cuisses)', { qty3d: 1 }],
        ['4', '', 1, 'PLAQUE DORSALE', {}],
        ['5', '', 1, 'LONGE DE 6 PI À ABSORBEUR, mousqueton et crochet à armature', {}],
        ['6', '', 1, `BLOC RÉTRACTABLE à câble de ${po(SRL.cable)}`, {}],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/securite-chantier/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log('data.json écrit');
