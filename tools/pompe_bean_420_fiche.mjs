// Écrit public/equipment/pompe-bean-420/data.json : les cotes viennent du modèle
// (src/models/pompe-bean-420/index.js), pour que la fiche et la 3D disent la même chose.
// Les listes reprennent le tableau 4 du manuel American Manufacturing AL0918B (repères 1 à 62) ;
// la colonne « FMC » de chaque ligne donne le repère de la même pièce sur la vue éclatée
// FMC L09-420 du catalogue TIME Ltd (pages PU4 et PU5).
// Usage : node tools/pompe_bean_420_fiche.mjs
import { writeFileSync } from 'node:fs';
import { COTE, RELEVE, DENTURE, BIELLE } from '../src/models/pompe-bean-420/index.js';

/** Nombre à la française, zéros de fin retirés. */
const fr = (v, n = 3) => { let t = v.toFixed(n); if (t.includes('.')) t = t.replace(/0+$/, '').replace(/\.$/, ''); return t.replace('.', ','); };
const po = (v, n = 3) => `${fr(v, n)} po`;
const mm = (v) => `${Math.round(v * 25.4)} mm`;
const pomm = (v, n = 3) => `${po(v, n)} (${mm(v)})`;
const entraxe = DENTURE.pignon + DENTURE.roue;

/** Ligne de liste : [repère, numéro, quantité, désignation (traduction), { note, … }]. fmc : repère de la vue éclatée FMC. */
const L = (ref, pn, qty, en, frTxt, note = '', fmc = '', extra = {}) => {
  const n = [note, fmc ? `Vue éclatée FMC (page P01) : repère ${fmc}.` : ''].filter(Boolean).join(' ');
  return [String(ref), `PPFMC ${pn}`, qty, `${en} (${frTxt})`, { ...(n ? { note: n } : {}), ...extra }];
};

const MECANIQUE = [
  L(1, '5260537', 1, 'Power Frame', 'bâti en fonte : bride avant, berceau des garnitures, glissières des crosses, carter', `Silhouette et parois relevées sur les figures 2B et 7 : bride avant à ${po(RELEVE.bati.x0, 2)} de l'axe des clapets, bride arrière à ${po(RELEVE.bati.x1, 2)}, ${po(2 * RELEVE.bati.z, 2)} de large aux joues. Trous de fixation taraudés 1/2-13 sous les pattes (cotes de la figure 7), non percés dans le modèle. Les formes de fonderie (congés, nervures intérieures, bossages) sont simplifiées.`, '28 (PUMP CASE)'),
  L(2, '1279071', 1, 'Crankshaft', 'vilebrequin : trois manetons excentrés et roue dentée', `Manetons de Ø ${po(COTE.maneton)} excentrés de ${po(COTE.course / 2)} (course de ${po(COTE.course, 2)}, tableau 8), calés à 120°. La roue dentée n'est dessinée sur aucune figure : son diamètre primitif (${po(2 * DENTURE.roue, 2)}) est calculé d'après l'entraxe relevé (${po(entraxe, 2)}) et le rapport publié de 3,6:1 ; ${DENTURE.z2} dents supposées. Sa place entre les cylindres et la forme des flasques sont supposées.`, '35 (ECCENTRIC GEAR ASM)'),
  L(3, '1265098', 1, 'Pinion Shaft', 'arbre d\'entrée à pignon taillé', `Bout de Ø ${po(COTE.arbre.d)} à rainure de clavette de ${po(COTE.arbre.clavette.w, 2)} sur ${po(COTE.arbre.clavette.len)}, qui dépasse de ${po(COTE.arbre.saillie)} du boîtier ; son bout est à ${po(COTE.arbre.bout)} de l'axe de la pompe (cotes de la figure 7 et de la section 2.0). Pignon calculé : Ø primitif de ${po(2 * DENTURE.pignon, 2)}, ${DENTURE.z1} dents supposées. Sens de rotation préféré : le dessus de l'arbre s'éloigne des culasses. L'option à arbre cannelé (page P09) n'est pas montrée.`, '36'),
  L(4, '18710', 3, 'Connecting Rod Assembly', 'bielle avec chapeau et boulons', `Entraxe de ${po(BIELLE, 2)} relevé sur la figure 2B. Boulons de chapeau de 7/16 po, serrés à 45 lb·pi (tableau 7). Bielles et chapeaux sont appariés et numérotés (section 10.2).`, '33'),
  L(5, 'P506697', 3, 'Rod Bearing', 'coussinet de tête de bielle', 'Le catalogue TIME Ltd liste à cet endroit six demi-coussinets (BEARING ECCENTRIC, 39-P510831).', '34'),
  L(6, 'A5006', 3, 'Wrist Pin', 'axe de pied de bielle', `Ø ${po(COTE.axePied)} (alésage de la bague : 1,0005 à 1,0015 po, tableau 8). Longueur relevée.`, '19 (PIN)'),
  L(7, '1250876', 3, 'Crosshead Assembly', 'crosse et tige de piston', `Crosse de Ø ${po(COTE.crosse)} (2,749 à 2,750 po dans une glissière de 2,7515 à 2,7535 po, tableau 8). Tige de 3/4 po et bout fileté 1/2-13 relevés. Les trois crosses sont montrées à leur place pour un vilebrequin calé à 120°, celle du milieu au point mort arrière.`, '15 (CROSSHEAD & ROD)'),
  L(8, '1283601', 3, 'Seal Holder', 'porte-joint de tige', 'Logé dans la cloison entre le berceau et la glissière ; forme relevée sur les figures 2A et 2B.', '32 (SLEEVE)'),
  L(9, '1283603', 6, 'Oil Seal, Piston Rod', 'joint à lèvre de tige', 'Deux par tige, dans le porte-joint.', '37 (PLUNGER ROD SEAL)'),
  L(10, '1283600', 3, 'Seal Retainer Nut', 'écrou de retenue des joints', 'Accessible par le berceau, sous la plaque de visite.', '31 (PACKING NUT)'),
  L(11, '1283602', 3, 'Gasket, Seal Retainer', 'joint plat du porte-joint', '', '27 (PACKING WASHER L09)'),
  L(12, '1279064', 2, 'Bearing Housing, Blind', 'boîtier borgne de palier du vilebrequin', 'Un de chaque côté : bride en triangle à trois vis, sur un cercle de 4,7 po (relevé sur la vue de côté de la figure 7).', '23'),
  L(13, '1257594', 5, 'Shim, Bearing Housing', 'cale de réglage du jeu des roulements', 'Cinq cales au total ; leur répartition (trois d\'un côté, deux de l\'autre) est supposée : elle se règle au montage (section 10.2). Le catalogue TIME Ltd imprime 39-1252594.', '38'),
  L(14, 'A5025', 2, 'Gasket, Bearing Housing', 'joint de boîtier de palier', '', '25'),
  L(15, '1279063', 1, 'Back Cover', 'couvercle arrière en tôle emboutie', `Son bombé donne la longueur hors tout de ${po(COTE.long)} (figure 7) ; profil relevé sur la figure 2B.`, '30 (COVER ASM)'),
  L(16, '1279065', 1, 'Gasket, Back Cover', 'joint du couvercle arrière', '', '29'),
  L(17, 'A5005', 1, 'Pinion Housing, Drive', 'boîtier de l\'arbre d\'entrée, côté entraînement', 'Bride en triangle à trois vis ; l\'arbre en sort de 2,536 po. Ce côté reçoit en option le support de moteur hydraulique SAE C (fiche technique, page P13).', '18 (BEARING CAP)'),
  L(18, '1225769', 1, 'Pinion Housing, Blind', 'boîtier borgne de l\'arbre d\'entrée', '', '39 (BEARING CAP)'),
  L(19, '1187039', 1, 'Petcock', 'robinet de niveau d\'huile, 1/8 po NPT', 'Au bas du couvercle arrière (« PETCOCK OIL LEVEL », figure 7). Hors de la cote de longueur de 23,219 po.', '58'),
  L(20, 'A5026', 2, 'Gasket, Pinion', 'joint de boîtier de l\'arbre d\'entrée', '', '24'),
  L(21, '5277981', 1, 'Nameplate', 'plaque signalétique', 'Sur le dessus du carter (figure 2B) ; position et taille approximatives, texte non reproduit.'),
  L(22, '1100759', 3, 'Lube Fitting', 'graisseur', 'Un par tige, sur le porte-joint, sous la plaque de visite (figure 2B).', '41'),
  L(23, '1101242', 2, 'Bearing Cone, Crank', 'cône de roulement conique du vilebrequin', '', '52'),
  L(24, '1177287', 2, 'Bearing Cup, Crank', 'cuvette de roulement conique du vilebrequin', '', '53'),
  L(25, '1104444', 2, 'Bearing, Pinion', 'roulement à billes de l\'arbre d\'entrée', '', '43'),
  L(26, '1187577', 1, 'Key', 'clavette de l\'arbre d\'entrée', `Carrée de ${po(COTE.arbre.clavette.w, 2)}, dans la rainure de ${po(COTE.arbre.clavette.len)}.`, '59'),
  L(27, '1100068', 12, 'Cap screw, Pinion Bearing', 'vis à tête hexagonale 3/8-16 × 3/4 po', 'Trois par boîtier : deux boîtiers de palier et deux boîtiers d\'arbre d\'entrée. Serrage : 25 lb·pi (tableau 7).', '46'),
  L(28, '1187413', 2, 'Screw', 'vis de la plaque de visite', 'Taille non indiquée ; montrées en nº 10.'),
  L(29, '1106910', 14, 'Cap Screw, Back Cover', 'vis à tête hexagonale 3/8-16 × 1/2 po', 'Serrage : 20 lb·pi (tableau 7). Répartition relevée sur la vue éclatée : quatre en haut, quatre en bas, trois de chaque côté.', '45'),
  L(30, '1103470', 3, 'Set Screw', 'vis de pression 5/16-18 × 1/2 po de l\'axe de pied de bielle', 'Serrage : 10 lb·pi (tableau 7).', '42'),
  L(31, '1214260', 1, 'Plate, Inspection', 'plaque de visite du berceau des garnitures', 'Sur le dessus, à l\'avant du bâti.', '40 (COVER PLATE ASM)'),
  L(32, '1187048', 2, 'Pipe Plug, Power End', 'bouchon de vidange 1/2 po NPT', 'Au bas du carter ; un de chaque côté, position relevée sur la figure 2B.', '48'),
  L(33, 'A5054', 1, 'Filler Cap or Vent', 'bouchon de remplissage à évent', 'Au-dessus du vilebrequin. Carter : 2,25 pintes US d\'huile SAE 30 (fiche technique).', '26 (OIL CAP)'),
  L(34, '1106980', 2, 'Screw', 'vis à tête hexagonale 1/2-13 × 3/4 po, au centre de chaque boîtier de palier', '', '47'),
];

const HYDRAULIQUE = [
  L(38, '1255266', 1, 'Fluid Chamber', 'boîte à clapets en fonte', `Bloc des trois cylindres au pas de ${po(RELEVE.pas, 0)}, colonnes de clapets et collecteur de refoulement de ${po(2 * RELEVE.collecteur.z, 1)} de large. Aspiration : trois orifices de 1 1/2 po NPT en dessous ; refoulement : 1 po NPT à chaque bout du collecteur, à ${po(COTE.refoulement)} de la base (figure 7). Formes de fonderie simplifiées ; l'inscription moulée n'est pas reproduite.`, '1 (VALVE CHAMBER)'),
  L(39, '1225327', 6, 'Valve Seat', 'siège de clapet à cage', 'Un à l\'aspiration et un au refoulement par cylindre ; emmanchés sur un cône, sans huile (section 9.2). Cage à quatre doigts relevée sur la figure 3.', '3'),
  L(40, 'A3434N', 3, 'Piston Cup', 'coupelle de piston de 2 1/4 po, néoprène', 'Autres caoutchoucs (page P12) : HSN, PPFMC P513766 ; nitrile carboxylé XNBR, PPFMC 5260052.', '8 (PACKING)'),
  L(41, '8495', 3, 'Piston Holder', 'porte-piston', '', '5 (PACKING CUP)'),
  L(42, '8309', 3, 'Hex Nut', 'écrou six pans 1/2-13 du bout de la tige', 'Serrage : 35 lb·pi (tableau 7).', '9'),
  L(43, 'A5016', 3, 'Nut Retainer', 'écrou de retenue à fentes, 3/4 po', 'Se démonte avec l\'outil à ergots PPFMC A5049. Serrage : 35 lb·pi (tableau 7).', '7 (PLUNGER NUT)'),
  L(44, '1207289', 3, 'Piston Retainer', 'rondelle de retenue de la coupelle', '', '6 (PACKING WASHER)'),
  L(45, '1101176', 3, 'O-Ring, Rod Seal', 'joint torique de tige, 5/8 po ext. × 1/16 po', '', '51'),
  L(46, '1280024', 6, 'Gasket, Fluid Chamber', 'joint de chemise', 'Un à chaque bout de chaque chemise ; à remplacer à chaque démontage (section 9.1). En cuivre ou en fibre selon le catalogue TIME Ltd.', '12 (GASKET CYLINDER)'),
  L(47, 'P501267', 6, 'Plug, Pipe', 'bouchon de tuyau', 'Deux par cylindre, sur la face avant, vis-à-vis des sièges de clapet (figure 3). Taille non indiquée : montrés en 1/4 po NPT.'),
  L(48, '1105105', 2, 'Plug, Suction', 'bouchon d\'aspiration 1 1/2 po NPT', 'Deux des trois orifices d\'aspiration sont bouchés ; le manuel ne dit pas lequel reste ouvert : celui du milieu, ici.', '57'),
  L(49, 'A5003', 3, 'Valve Cover', 'couvercle de clapet', 'Sa tige limite la levée de la bille de refoulement.', '2'),
  L(50, '1280026', 3, 'Gasket, Valve Cover', 'joint de couvercle de clapet', '', '14'),
  L(51, '1271716', 3, 'Clamp, Valve Cover', 'bride de couvercle de clapet', 'Barre le long de la pompe, sur deux goujons. Largeur supposée.', '17'),
  L(52, 'A5012', 6, 'Stud, Valve Cover', 'goujon 1/2-13 de couvercle de clapet', `Leur bout donne la hauteur hors tout de ${po(COTE.haut)} (figure 7).`, '22'),
  L(53, '1121511', 14, 'Hex Nut, Valve Cover', 'écrou six pans 1/2-13', 'Le tableau 4 inscrit 14 écrous sur cette ligne et 8 sur la ligne 61, sous le même numéro ; le catalogue TIME Ltd en compte 14 en tout : 6 sur les brides de couvercle de clapet (montrés ici) et 8 sur les goujons de culasse (repère 61). Serrage : 60 lb·pi (tableau 7).', '49', { qty3d: 6 }),
  L(54, 'A5002', 3, 'Cylinder Cover', 'culasse de cylindre', 'Son corps entre dans la boîte jusqu\'entre les deux clapets.', '11 (CYLINDER HEAD)'),
  L(55, '1280025', 3, 'Gasket, Cylinder Cover', 'joint de culasse', '', '13'),
  L(56, '1272060', 3, 'Cylinder', 'chemise en céramique, alésage de 2 1/4 po', `Serrée entre la boîte à clapets et le bâti. Longueur et diamètre extérieur relevés sur la figure 3.`, '10'),
  L(57, '1271415', 3, 'Clamp, Cylinder', 'bride de culasse', 'Barre en diagonale entre deux goujons voisins (photo du manuel, page P08, et vue de dessous de la figure 7).', '16 (CLAMP CYLINDER HEAD)'),
  L(58, 'A5011', 6, 'Stud, Cylinder Cover', 'goujon 1/2-13 de culasse', `Vissés dans le bâti, ils traversent la boîte à clapets ; grille de ${po(RELEVE.pas, 0)} × ${po(2 * RELEVE.goujon.y, 0)} relevée. Leur bout donne l'avant de la cote de ${po(COTE.long)}.`, '21'),
  L(59, 'A5009', 2, 'Stud', 'goujon d\'angle', 'Aux deux coins opposés : leurs écrous tiennent la boîte à clapets et les chemises sur le bâti quand on retire les brides de culasse (section 9.0, étape 4). Le manuel ne dit pas quels coins : en haut du côté de l\'arbre et en bas de l\'autre côté, ici.', '20 (STUD CYLINDER)'),
  L(60, '1281655', 3, 'Seal Holder', 'bague porte-joint de tige', 'Derrière le porte-piston, avec le joint torique 45.', '44 (non illustré)'),
  L(61, '1121511', 8, 'Hex, Nut, Cylinder', 'écrou six pans 1/2-13 des goujons de culasse', 'Serrage : 75 lb·pi (tableau 7) ; un serrage insuffisant mène à une rupture (section 9.1).', '49'),
  L(62, '1187738', 6, 'Ball', 'bille de clapet de 15/16 po, inox', 'Diamètre donné par le catalogue TIME Ltd.', '4'),
];

const data = {
  id: 'pompe-bean-420',
  name: 'Pompe à pistons Bean 420 (FMC L0918 / American AL0918B)',
  manufacturer: 'American Manufacturing (interchangeable avec la FMC Bean L0918)',
  category: 'Pompe triplex à pistons',
  serial: '',
  document: {
    title: 'American Manufacturing — Pump AL0918B, Operation And Maintenance Manual (48 pages) ; fiche « AL0918 Piston Pump Data » ; vue éclatée FMC L09-420 du catalogue TIME Ltd',
    reference: 'AL0918B',
    preparedBy: 'American Manufacturing, St. Joseph (Minnesota) ; TIME Ltd pour la vue éclatée',
    date: '2011-08-30',
    sheets: 13,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', 'Manuel d\'entretien et de pièces de la pompe AL0918B d\'American Manufacturing, publié par Ranger Mining (rangermining.ca) : la pompe est interchangeable avec la FMC Bean L0918, dite « 420 », et ses numéros de pièces reprennent ceux de FMC sous le préfixe PPFMC. Version à clapets à billes. Le PDF porte la date du 2011-08-30'],
    ['Type', 'Pompe triplex horizontale à pistons, réducteur à engrenages dans le carter'],
    ['Alésage et course', `${pomm(COTE.alesage, 2)} × ${pomm(COTE.course, 2)} ; cylindrée de 0,0323 gal US (0,122 L) par tour de l'arbre d'entrée`],
    ['Débit', '11,3 gal US/min (43 L/min) à 350 tr/min ; 20,2 (76) à 625 ; 22,6 (86) à 700 ; 24,2 (92) à 750 ; 28,7 (109) à 890 tr/min à l\'arbre d\'entrée'],
    ['Pression maximale', '700 lb/po² (49,2 kg/cm²)'],
    ['Puissance', '11,6 HP en service continu, 13,8 HP en service intermittent'],
    ['Vitesse de l\'arbre d\'entrée', '360 tr/min au minimum ; 750 en continu, 890 en intermittent ; 625 tr/min au maximum avec les clapets à billes'],
    ['Réducteur', `3,6:1 ; entraxe de ${po(entraxe, 2)} relevé (pignon et roue calculés, non dessinés au manuel)`],
    ['Arbre d\'entrée', `Ø ${pomm(COTE.arbre.d)}, clavette de ${po(COTE.arbre.clavette.w, 2)} ; option : arbre cannelé femelle à 14 dents 12/24 (ANSI B92.1) et bride de moteur hydraulique SAE C à 4 trous`],
    ['Sens de rotation', 'Le dessus de l\'arbre s\'éloigne des culasses (« Top of shaft away from head »)'],
    ['Encombrement', `${pomm(COTE.long)} de long, ${pomm(COTE.large, 0)} de large, ${pomm(COTE.haut)} de haut (figure 7) ; le robinet de niveau dépasse à l'arrière`],
    ['Aspiration', 'Trois orifices de 1 1/2 po NPT sous la boîte à clapets, dont deux bouchés'],
    ['Refoulement', `1 po NPT à chaque bout du collecteur, à ${pomm(COTE.refoulement)} de la base`],
    ['Arbre d\'entrée, position', `À ${pomm(COTE.arbre.y)} de la base et à ${pomm(COTE.arbre.x)} de l'axe des clapets ; son bout est à ${pomm(COTE.arbre.bout)} de l'axe de la pompe`],
    ['Fixation', `Quatre trous taraudés 1/2-13 de 5/8 po de profond sous les pattes, à ${po(COTE.fixation.avant.x, 2)} et ${po(COTE.fixation.arriere.x)} de l'axe des clapets, entraxes de ${po(2 * COTE.fixation.avant.z)} à l'avant et de 8,563 po à l'arrière ; un cinquième, de 3/4 po de profond, au milieu de l'arrière ; deux lamages de Ø 7/8 × 13/64 po`],
    ['Axe des cylindres', `À ${pomm(RELEVE.axeCyl, 2)} de la base, cylindres au pas de ${pomm(RELEVE.pas, 0)} (relevés sur les figures)`],
    ['Lubrification', 'Par barbotage ; 2,25 pintes US (2,1 L) d\'huile SAE 30'],
    ['Température du fluide', '0 à 140 °F (−18 à 60 °C)'],
    ['Charge du bâti', '2 800 lb (1 270 kg) sur la tige'],
    ['Extrémité hydraulique', 'Fonte ; chemises en céramique, coupelles de piston de 2 1/4 po, clapets à billes de 15/16 po'],
    ['Couples de serrage (tableau 7)', 'Écrous des goujons de culasse 75 lb·pi (102 N·m) ; écrous de couvercle de clapet 60 (81) ; boulons de bielle 45 (61) ; écrou de tige et écrou de piston 35 (47) ; vis des boîtiers 25 (34) ; vis du couvercle arrière 20 (27) ; vis de pression de crosse 10 (14)'],
    ['Jeux (tableau 8)', 'Bielle sur maneton : 0,003 po au plus ; crosse dans sa glissière : 0,0045 po ; axe de pied de bielle : 0,002 po ; usure admise : 0,002 po de plus au diamètre'],
    ['Couleur', 'Bleu, d\'après les photos du manuel'],
  ],
  weights: [['Pompe (fiche technique AL0918)', '200 lb (90,7 kg)']],
  sheetTitles: {
    P01: 'Vue éclatée de la FMC L09-420 (catalogue TIME Ltd, page PU4), repères 1 à 59 et A à D',
    P02: 'Figure 2A : extrémité mécanique, coupe vue de dessus (manuel, page 17)',
    P03: 'Figure 3 : extrémité hydraulique, coupe par l\'axe d\'un cylindre (manuel, page 19)',
    P04: 'Figure 2B : extrémité mécanique, coupe vue de côté (manuel, page 18)',
    P05: 'Tableau 4 : liste des pièces, repères 1 à 62 (manuel, page 20)',
    P06: 'Figure 7 : plan coté et gabarit de fixation (manuel, page 44)',
    P07: 'Liste des pièces de la FMC L0918BCD (catalogue TIME Ltd, page PU5)',
    P08: 'Figure 1 : photo de la pompe et sens de rotation (manuel, page 7)',
    P09: 'Figure 4 et tableau 5 : option à arbre cannelé (manuel, page 21)',
    P10: 'Tableau 7 : couples de serrage (manuel, page 36)',
    P11: 'Tableau 8 : jeux critiques (manuel, page 37)',
    P12: 'Figure 6 et tableau 9 : accessoires de montage et coupelles de rechange (manuel, page 43)',
    P13: 'Fiche technique AL0918 : caractéristiques et tableau de débit',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'AL0918B Pump Assembly',
      titleFr: 'Pompe Bean 420 complète',
      pn: 'AL0918B',
      sheets: ['P01', 'P06', 'P08', 'P13', 'P07', 'P12'],
      note: `Pompe triplex à pistons Bean 420 (FMC L0918), dans sa version American Manufacturing AL0918B à clapets à billes. Le manuel ne contient pas de vue éclatée : il donne trois coupes repérées (figures 2A, 2B et 3), une liste de 62 repères (tableau 4) et un plan coté (figure 7). La vue éclatée de cette page vient du catalogue TIME Ltd et montre la pompe FMC d'origine ; ses repères ne sont pas ceux du manuel, et chaque ligne des listes donne la correspondance. Cotes inscrites au manuel et reprises telles quelles : ${po(COTE.long)} × ${po(COTE.large, 0)} × ${po(COTE.haut)} hors tout, refoulement à ${po(COTE.refoulement)} de la base, arbre d'entrée à ${po(COTE.arbre.y)} de la base et à ${po(COTE.arbre.x)} de l'axe des clapets, gabarit de fixation, alésage et course de ${po(COTE.alesage, 2)}, diamètres du maneton, de la crosse et de l'axe de pied de bielle. Tout le reste est relevé sur le tracé vectoriel des figures, à l'échelle que donnent ces cotes : axe des cylindres à ${po(RELEVE.axeCyl, 2)} de la base, cylindres au pas de ${po(RELEVE.pas, 0)}, goujons de culasse sur une grille de 3 × 3 po, vilebrequin à ${po(RELEVE.vilebrequin - COTE.arbre.x, 2)} derrière l'arbre d'entrée. La denture du réducteur n'est dessinée nulle part : elle est calculée d'après l'entraxe relevé et le rapport de 3,6:1. Les pièces de fonderie (bâti, boîte à clapets) sont simplifiées. Les accessoires de la figure 6 (amortisseurs de pulsations, manomètre, soupape de sûreté) ne font pas partie de la pompe et ne sont pas modélisés.`,
      parts: [
        ['A', '', 1, 'POWER END (extrémité mécanique : bâti, vilebrequin, arbre d\'entrée, bielles et crosses)', { link: 'P02', pnText: 'Figures 2A et 2B', note: 'Repères 1 à 34 du tableau 4.' }],
        ['B', '', 1, 'FLUID END (extrémité hydraulique : boîte à clapets, clapets, culasses, chemises et pistons)', { link: 'P03', pnText: 'Figure 3', note: 'Repères 38 à 62 du tableau 4. Les goujons de culasse, vissés dans le bâti, tiennent les deux extrémités ensemble.' }],
      ],
    },
    P02: {
      title: 'Power End Components',
      titleFr: 'Extrémité mécanique',
      pn: 'AL0918B',
      sheets: ['P02', 'P04', 'P05', 'P09', 'P10', 'P11'],
      note: `Repères 1 à 34 du tableau 4 (figures 2A et 2B). L'arbre d'entrée, sur roulements à billes, porte un pignon qui entraîne la roue du vilebrequin (rapport de 3,6:1) ; le vilebrequin, sur deux roulements coniques réglés par cales, a trois manetons excentrés calés à 120° ; chaque bielle pousse une crosse de Ø ${po(COTE.crosse)} dont la tige traverse une garniture à deux joints à lèvre avant d'entrer dans le cylindre. Le modèle montre le cylindre du milieu au point mort arrière. Sur la figure 2B, le vilebrequin est dessiné hors de l'axe de ses paliers : le modèle le place sur cet axe, à la hauteur de l'axe des cylindres. La roue dentée, les flasques du vilebrequin et la répartition des cales ne figurent sur aucune vue : ils sont calculés ou supposés (voir les notes des lignes).`,
      parts: MECANIQUE,
    },
    P03: {
      title: 'Fluid End Components',
      titleFr: 'Extrémité hydraulique',
      pn: 'AL0918B',
      sheets: ['P03', 'P05', 'P10', 'P12'],
      note: `Repères 38 à 62 du tableau 4 (figure 3). Chaque cylindre a un clapet d'aspiration en bas et un clapet de refoulement en haut, tous deux à bille de 15/16 po sur un siège conique à cage ; la culasse, serrée par une bride en diagonale, entre dans la boîte jusqu'entre les deux clapets ; la chemise en céramique est serrée entre la boîte et le bâti. Huit goujons 1/2-13 vissés dans le bâti traversent la boîte : six portent les brides de culasse, deux (aux coins opposés) la tiennent seuls. Pour sortir un piston : retirer les six écrous des brides et les culasses, puis l'écrou 1/2-13 de la tige, et tirer le piston par l'avant avec l'outil à ergots (section 9.0) ; il faut 2 pi de dégagement devant les culasses.`,
      parts: HYDRAULIQUE,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/pompe-bean-420/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
const n = (a) => a.reduce((s, r) => s + r[2], 0);
console.log(`data.json écrit : ${MECANIQUE.length} lignes (${n(MECANIQUE)} pièces) et ${HYDRAULIQUE.length} lignes (${n(HYDRAULIQUE)} pièces).`);
