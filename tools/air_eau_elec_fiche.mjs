// Écrit public/equipment/air-eau-electricite/data.json : les cotes viennent du modèle
// (src/models/air-eau-electricite/index.js), pour que la fiche et la 3D disent la même chose.
// Usage : node tools/air_eau_elec_fiche.mjs
import { writeFileSync } from 'node:fs';
import { IN, BOYAU, CABLE, CONSOLE, GFB, TREPIED, BIDON, BANDEROLE, WHIP } from '../src/models/air-eau-electricite/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v * 1000, n)} mm`;
const m = (v, n = 2) => `${fr(v, n)} m`;
const de = (b) => `Ø ext. ${mm(b.de)} (${fr(b.de / IN, 2)} po)`;

const SOURCE = 'Photos de places de travail ITH Cubex fournies par le client (console électrique 600 V vue de près, boyaux et câbles au sol et au mur). Aucun plan : formes relevées sur les photos, cotes d\'après les grandeurs nominales (diamètre des boyaux, raccords à joint sphérique, câble minier 600 V)';

const data = {
  id: 'air-eau-electricite',
  name: 'Air, eau et électricité de la place de travail ITH Cubex',
  manufacturer: 'Divers (matériel de chantier minier)',
  category: 'Services de la place de travail (simulateur SST)',
  serial: '',
  document: {
    title: 'Photos de places de travail du client (aucun plan)',
    reference: '',
    preparedBy: '',
    date: '',
    sheets: 3,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Rendu', 'Usé et sale : boue au sol et éclaboussures, coulures, peinture écaillée, rouille, inscriptions moulées sur les boyaux et le câble, étiquettes DANGER salies. Textures de 1 024 px (couleur et normales) dessinées par tools/air_eau_elec_textures.mjs'],
    ['Boyau d\'air basse pression', `2 po (ID ${mm(BOYAU.airBP.di)}), ${de(BOYAU.airBP)}, caoutchouc jaune comme sur les photos ; deux tronçons de 4 m`],
    ['Boyau d\'air haute pression', `2 po (ID ${mm(BOYAU.airHP.di)}), ${de(BOYAU.airHP)}, caoutchouc noir à bande rouge (couleur supposée), gaine spiralée grise sur le premier mètre (comme sur les boyaux de la foreuse)`],
    ['Boyau tressé 800 °F', `2 po, tresse d'acier inoxydable, ${de(BOYAU.tresse)}, noirci par la chaleur ; raccordé au boyau haute pression`],
    ['Boyau d\'eau', `1 po (ID ${mm(BOYAU.eau.di)}), ${de(BOYAU.eau)}, caoutchouc noir à bande bleue (couleur supposée) ; deux tronçons`],
    ['Raccords', 'À joint sphérique (« ground joint ») : tige à boyau serrée par un collier à deux boulons, écrou à oreilles (« stem nut ») d\'un côté, embout mâle de l\'autre ; zingués, rouillés. Raccords de 1 po à l\'échelle 0,6'],
    ['Whip checks', `Câble d'acier de Ø ${mm(2 * WHIP.cable, 1)} (2 po), boucles serrées sur les boyaux de chaque côté du raccord, ${m(WHIP.entre)} entre les boucles, ressorts sur les jambes, ferrules ; le câble passe par-dessus l'écrou`],
    ['Câble 600 V', `Câble minier type SHD-GC (supposé), Ø ${mm(CABLE.d)}, gaine noire ; sur crochets au mur à ${m(CABLE.hautCrochet)} de haut, entraxe 1,5 m, ${mm(CABLE.flèche)} de flèche ; de la console à la boîte de défaut à la terre, puis vers l'amont le long du mur`],
    ['Crochets au mur', 'Plaque de 150 × 150 mm sur le bout d\'un boulon d\'ancrage, écrou, tige de Ø 16 mm pliée en J'],
    ['Console 600 V', `Armoire d'acier peinte en rouge, ${m(CONSOLE.L)} × ${m(CONSOLE.H)} × ${m(CONSOLE.P)} (estimées), larmier et rebord ; boîtier inox de ${m(CONSOLE.inoxL)} × ${m(CONSOLE.inoxH)} à porte vitrée (plexiglas sale) : contacteur 100-D140, disjoncteur CB1 dont la poignée sort par un trou rond, bornier, relais jaune et fils, étiquette DANGER 600 VOLTS, deux charnières à droite — comme sur la photo. À droite : coude galvanisé, câble gainé gris, deux câbles armés, transformateur 600 V / 120 V à l'étiquette jaune usée`],
    ['Boîte de défaut à la terre', `Coffret d'acier gris de ${mm(GFB.L)} × ${mm(GFB.H)} × ${mm(GFB.P)} au mur (estimé), porte, voyants vert et rouge, boutons ESSAI (jaune) et RÉARMER (noir), deux presse-étoupes dessous ; étiquette en français`],
    ['Arrêt d\'urgence', 'Boîtier jaune de 110 mm sur plaque murale, champignon rouge de Ø 60 mm, plaque ARRÊT D\'URGENCE ; câble de commande vers la console sur deux crochets de plastique jaunes'],
    ['Balisage', `Deux trépieds orange de ${m(TREPIED.H)} (pattes de Ø 1 po, entretoises, patins, anneau), deux bidons de plastique orange de 20 L (${mm(BIDON.L)} × ${mm(BIDON.H)} × ${mm(BIDON.P)}), banderole DANGER rouge de ${mm(BANDEROLE.large)} nouée aux bidons et passée dans les anneaux`],
    ['Supposé', 'Couleurs des boyaux haute pression et d\'eau ; type exact du câble 600 V ; dimensions de la console, de la boîte de défaut à la terre et du transformateur (estimées sur la photo) ; forme des bidons et des trépieds (aucune photo)'],
    ['Unreal Engine', 'node scripts/export-air-eau-elec-unreal.mjs : un .glb par lot dans public/equipment/air-eau-electricite/unreal/ (mètres, Y vers le haut, textures incorporées) ; voir docs/air-eau-elec-unreal.md'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du client : boyaux et câbles au sol, place de travail ITH Cubex',
    P02: 'Photo du client : boyau au sol devant la foreuse',
    P03: 'Photo du client : console électrique 600 V (DANGER 600 VOLTS, CB1, transformateur)',
  },
  root: 'P00',
  assemblies: {
    P00: {
      title: 'ITH CUBEX WORKPLACE: AIR, WATER AND POWER',
      titleFr: 'Place de travail : air, eau et électricité',
      pn: '',
      sheets: ['P01', 'P02', 'P03'],
      note: 'Les quatre lots posés ensemble : l\'électricité contre le mur, les boyaux d\'air et d\'eau au sol devant, le balisage plus loin. Chaque lot ouvre sa page.',
      parts: [
        ['1', '', 1, 'AIR COMPRIMÉ : boyaux de 2 po, boyau tressé 800 °F, raccords, whip checks', { link: 'P01', pseudo: true }],
        ['2', '', 1, 'EAU : boyau de 1 po, raccords, whip check', { link: 'P02', pseudo: true }],
        ['3', '', 1, 'ÉLECTRICITÉ 600 V : câble, crochets, boîte de défaut à la terre, console, arrêt d\'urgence', { link: 'P03', pseudo: true }],
        ['4', '', 1, 'BALISAGE : trépieds, bidons, banderole DANGER', { link: 'P04', pseudo: true }],
      ],
    },
    P01: {
      title: 'COMPRESSED AIR LINES, 2" LP / HP, 800 °F BRAIDED HOSE',
      titleFr: 'Air comprimé : boyaux de 2 po basse et haute pression, boyau tressé 800 °F',
      pn: '',
      sheets: ['P01'],
      note: 'Deux lignes d\'air au sol. Ligne 1 : boyau basse pression jaune, deux tronçons raccordés. Ligne 2 : boyau tressé inox 800 °F raccordé au boyau haute pression (gaine spiralée sur le premier mètre). Chaque raccord a son whip check. En vue éclatée, les tiges et les écrous sortent du bout des boyaux, les whip checks montent.',
      parts: [
        ['1', '', 2, 'BOYAU D\'AIR BASSE PRESSION 2 po, caoutchouc jaune', { note: '4 m par tronçon.' }],
        ['2', '', 1, 'BOYAU D\'AIR HAUTE PRESSION 2 po, caoutchouc noir à bande rouge', { note: 'Couleur supposée.' }],
        ['3', '', 1, 'GAINE SPIRALÉE de protection, plastique gris', { note: 'Premier mètre du boyau haute pression.' }],
        ['4', '', 1, 'BOYAU TRESSÉ INOX 2 po, 800 °F', { note: 'Sortie chaude de l\'air comprimé.' }],
        ['5', '', 8, 'TIGE À BOYAU 2 po avec collier à deux boulons', { note: 'Un à chaque bout de tronçon.' }],
        ['6', '', 4, 'ÉCROU À OREILLES (STEM NUT) 2 po, joint sphérique', { note: 'Bout femelle.' }],
        ['7', '', 4, 'EMBOUT MÂLE (SPUD) 2 po, joint sphérique', { note: 'Bout mâle, entre dans l\'écrou.' }],
        ['8', '', 2, 'WHIP CHECK 2 po, câble d\'acier', { note: 'Un par raccord entre deux boyaux.' }],
      ],
    },
    P02: {
      title: 'WATER LINE, 1" HOSE',
      titleFr: 'Eau : boyau de 1 po',
      pn: '',
      sheets: ['P02'],
      note: 'Boyau d\'eau de 1 po au sol, deux tronçons raccordés par un joint sphérique de 1 po et retenus par un whip check.',
      parts: [
        ['1', '', 2, 'BOYAU D\'EAU 1 po, caoutchouc noir à bande bleue', { note: 'Couleur supposée.' }],
        ['2', '', 4, 'TIGE À BOYAU 1 po avec collier', {}],
        ['3', '', 2, 'ÉCROU À OREILLES (STEM NUT) 1 po', {}],
        ['4', '', 2, 'EMBOUT MÂLE (SPUD) 1 po', {}],
        ['5', '', 1, 'WHIP CHECK 1 po', {}],
      ],
    },
    P03: {
      title: '600 V POWER: CABLE, WALL HOOKS, GROUND FAULT BOX, CONSOLE, E-STOP',
      titleFr: 'Électricité 600 V : câble, crochets, boîte de défaut à la terre, console, arrêt d\'urgence',
      pn: '',
      sheets: ['P03'],
      note: 'Contre le mur (plan z = 0) : la console électrique 600 V de la photo, le câble 600 V qui monte sur trois crochets puis redescend à la boîte de défaut à la terre, l\'arrêt d\'urgence et son câble de commande sur deux crochets de plastique. En vue éclatée, la porte vitrée et le boîtier inox avancent.',
      parts: [
        ['1', '', 2, 'CÂBLE MINIER 600 V, gaine noire', { note: 'Console → boîte de défaut à la terre, et alimentation de la boîte.' }],
        ['2', '', 3, 'CROCHET AU MUR, plaque et tige en J', {}],
        ['3', '', 1, 'ARMOIRE DE LA CONSOLE 600 V, acier peint rouge', {}],
        ['4', '', 1, 'BOÎTIER INOX avec contacteur 100-D140, disjoncteur CB1, bornier', {}],
        ['5', '', 1, 'PORTE VITRÉE du boîtier, étiquette DANGER 600 VOLTS', {}],
        ['6', '', 1, 'CONDUIT : coude galvanisé, câble gainé, câbles armés', {}],
        ['7', '', 1, 'TRANSFORMATEUR 600 V / 120 V', { note: 'Étiquette jaune usée.' }],
        ['8', '', 1, 'BOÎTE DE DÉFAUT À LA TERRE (GROUND FAULT BOX)', { note: 'Boutons ESSAI et RÉARMER.' }],
        ['9', '', 1, 'ARRÊT D\'URGENCE (E-STOP), champignon rouge', {}],
        ['10', '', 2, 'CROCHET DE PLASTIQUE jaune', {}],
        ['11', '', 1, 'CÂBLE DE COMMANDE de l\'arrêt d\'urgence', {}],
      ],
    },
    P04: {
      title: 'BARRICADE: TRIPODS, JERRY CANS, DANGER TAPE',
      titleFr: 'Balisage : trépieds, bidons et banderole DANGER',
      pn: '',
      sheets: [],
      note: 'Périmètre balisé : bidon, trépied, trépied, bidon, avec la banderole DANGER nouée aux poignées des bidons et passée dans l\'anneau des trépieds. Formes supposées (aucune photo).',
      parts: [
        ['1', '', 2, 'TRÉPIED DE BALISAGE, tube d\'acier peint orange', {}],
        ['2', '', 2, 'BIDON DE PLASTIQUE 20 L, orange', {}],
        ['3', '', 1, 'BANDEROLE DANGER, ruban rouge', {}],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/air-eau-electricite/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log('data.json écrit');
