// Scénario de la vidéo de formation « Fabrication d'un plancher pour foreuse
// aux diamants sous terre » (PRO-DD-ST-003, révision juillet 2026).
//
// Un segment par partie de la procédure. Chaque segment donne :
//   band     : le bandeau sous la 3D (numéro, titre, consigne = texte exact de
//              la procédure, détail = repères en gris) ;
//   why      : encadré « Pourquoi » (texte de la procédure quand elle le donne) ;
//   lines    : la narration, dialogue à deux voix pour ElevenLabs
//              (orateur 1 = formateur, voix d'homme ; 2 = travailleuse, voix de femme) ;
//   reveal   : pièces qui apparaissent, par « cue » (voir plancher-video.js),
//              à une fraction du segment (at) et étalées sur une fraction (span) ;
//   show     : objets propres à la vidéo (laser, niveau, coins de serrage) ;
//   cams     : images clés de la caméra (t en fraction du segment) ; la caméra
//              part de la fin du segment précédent.
// La durée d'un segment vient de sa narration (débit d'environ 2,5 mots/s,
// celui de la vidéo du mandrin), avec un minimum pour l'action.

import { tourCams, tourEnd } from './plancher-materiel.js';

// Tour des outils (gros plans à 360°) après la narration du matériel.
const TOUR_V0 = 39.0;
const L = 9.7536, SEC = 4.8768, W = 4.8768, DECK = 0.2286;

const C = {
  ov: { pos: [L / 2 + 6.2, 5.0, 8.4], tgt: [L / 2, -0.15, -0.4] },
  entr: { pos: [L + 6.6, 1.45, 1.1], tgt: [L + 4.3, 1.3, 0] },
  cab: { pos: [L + 5.9, 1.6, 0.5], tgt: [L + 3.3, 0.5, 2.2] },
  mat: { pos: [L + 8.3, 2.5, 0.9], tgt: [L + 6.0, 0.0, -0.5] },
  tools1: { pos: [L + 8.1, 1.6, -0.2], tgt: [L + 5.9, 0.0, 0.6] },
  tools2: { pos: [L + 8.1, 1.7, 0.6], tgt: [L + 6.0, 0.0, 1.6] },
  wall: { pos: [3.4, 1.65, 0.9], tgt: [-0.95, 1.5, 0.1] },
  line: { pos: [-2.6, 2.0, 0.9], tgt: [3.2, -0.15, -2.35] },
  high: { pos: [-1.9, 1.45, 1.4], tgt: [0.9, -0.05, -1.7] },
  s1: { pos: [SEC / 2 + 4.0, 3.1, 5.8], tgt: [SEC / 2, -0.05, -0.2] },
  s1low: { pos: [2.4, 1.35, 3.7], tgt: [2.2, -0.05, 0.0] },
  joint: { pos: [SEC + 1.5, 0.75, 3.5], tgt: [SEC, -0.05, 1.5] },
  deck1: { pos: [-1.9, 3.5, 4.6], tgt: [SEC * 0.62, 0, 0] },
  tight: { pos: [2.3, 2.1, W / 2 + 1.7], tgt: [1.5, 0.1, 0.5] },
  tight2: { pos: [2.1, 1.6, W / 2 + 1.2], tgt: [1.5, 0.12, 0.8] },
  s2: { pos: [SEC * 1.5 + 4.6, 2.7, 5.6], tgt: [SEC * 1.5, -0.2, 0] },
  s2low: { pos: [L + 1.7, 0.45, 4.1], tgt: [L - 1.6, -0.25, 1.0] },
  crib: { pos: [10.7, 0.55, 3.7], tgt: [8.8, -0.35, 1.55] },
  cageA: { pos: [7.15, 0.25, 0.65], tgt: [8.88, -0.52, 1.57] },
  cageB: { pos: [7.3, 0.45, 2.95], tgt: [8.88, -0.54, 1.6] },
  cageC: { pos: [7.85, 0.75, 3.35], tgt: [8.92, -0.5, 1.62] },
  deck2: { pos: [L + 3.0, 3.4, 4.8], tgt: [SEC * 1.45, 0, 0] },
  edge: { pos: [4.6, 0.8, 3.9], tgt: [6.4, 0.16, 2.44] },
  stairs: { pos: [L + 3.4, 1.45, 2.15], tgt: [L + 0.3, 0.02, 0.96] },
  guards: { pos: [L + 4.6, 2.7, 5.2], tgt: [L - 2.2, 0.6, 0.4] },
  grille: { pos: [6.3, 1.9, -1.2], tgt: [6.6, 0.0, -2.75] },
  second: { pos: [3.3, 1.9, 2.5], tgt: [0.9, 0.35, 0.3] },
  end: { pos: [-3.6, 4.3, 6.7], tgt: [L / 2, 0, 0] },
};

export const SEGMENTS = [
  {
    id: 'titre', min: 9, card: 'title',
    band: { n: '', title: 'Fabrication d’un plancher pour foreuse aux diamants sous terre', text: 'PRO-DD-ST-003 · Machines Roger International', detail: 'Procédure de travail, révision juillet 2026' },
    lines: [
      [1, 'Aujourd\'hui, on bâtit un plancher de foreuse au diamant sous terre : seize pieds par trente-deux.'],
      [2, 'Le plancher complet, celui des trous de cinq cents mètres et plus ?'],
      [1, 'Exactement. On suit la procédure PRO-DD-ST-003, étape par étape.'],
    ],
    cams: [{ t: 0, ...C.end }, { t: 1, ...C.ov }],
  },
  {
    id: 'materiel', min: 10,
    band: { n: '', title: 'Matériel nécessaire et ÉPI', text: 'Barricade travaux en cours avec flasher orange · Armoire (trousse de premier soin et lave-yeux 2x) · Extincteur · Bois 2\'\'X4\'\' planés (ou bruts) · Bois brut de 6\'\'X6\'\' et de 3\'\'X8\'\' · Coins de bois · Tire-fonds 6\'\' · Lame à bois pour scie', detail: 'Outils : pied de biche, masse, marteau, sciotte, pinces à billots, niveau au laser Bosch, niveau de 48\'\', barres d’écaillage de 6\', 8\' et 10\', pingouin, scie va-et-vient · ÉPI : équipement de base obligatoire' },
    why: 'TOUJOURS TRANSPORTER LES GROSSES PIÈCES DE BOIS À DEUX.',
    lines: [
      [1, 'Avant de commencer : la barricade travaux en cours avec son flasher orange, l\'armoire avec la trousse de premiers soins pis les deux lave-yeux, l\'extincteur.'],
      [2, 'Pis le bois : du six par six brut, du trois par huit brut, des coins pis des tire-fonds de six pouces.'],
      [1, 'Une règle qui change pas : les grosses pièces de bois, on les transporte toujours à deux.'],
    ],
    reveal: [{ cue: 'barricade', v: 19.0, vspan: 1.2 }, { cue: 'cabinet', v: 22.4, vspan: 0 }, { cue: 'ext', v: 25.6, vspan: 0 }],
    // Bois, quincaillerie, outils et ÉPI étalés derrière la barricade ; les outils (que la voix
    // ne nomme pas) défilent à la fin de la partie, avec leurs étiquettes.
    show: [{ obj: 'materiel', vfrom: 26.6 }],
    cams: [{ v: 18.2, ...C.entr }, { v: 21.4, ...C.entr }, { v: 22.6, ...C.cab }, { v: 26.2, ...C.cab }, { v: 27.6, ...C.mat }, { v: 38.6, ...C.mat }, ...tourCams(TOUR_V0), { v: tourEnd(TOUR_V0) + 1.2, ...C.mat }],
  },
  {
    id: 'inspection', min: 9,
    band: { n: '0', title: 'Inspection des lieux', text: 'Le superviseur doit d’abord avoir fait une inspection des lieux avant de déplacer les équipements à l’endroit de forage.', detail: 'Il doit s’assurer que : le plancher est exempt de débris · le plancher est plat · les fonds de trous ont été trouvés et marqués' },
    lines: [
      [1, 'Le superviseur inspecte les lieux avant d\'amener l\'équipement : un sol sans débris, plat, pis les fonds de trous trouvés et marqués sur le mur.'],
    ],
    cams: [{ t: 0.35, ...C.wall }, { t: 1, pos: [2.4, 1.55, 0.3], tgt: [-0.95, 1.55, 0.2] }],
  },
  {
    id: 'e1', min: 9,
    band: { n: '1', title: 'Marquer la position du plancher', text: 'Avec le plan de forage en main, déterminez le positionnement exact du futur plancher en vous fiant à la position prévue de la foreuse selon le plan de forage et marquer la position du futur plancher avec de la peinture.', detail: 'Pour vous guider avec la galerie afin de prévoir une construction droite sur toute sa longueur de 16\'X32\'' },
    lines: [
      [1, 'Étape un : plan de forage en main, on place le plancher d\'après la position prévue de la foreuse. On trace la ligne à la peinture, bien droite sur toute la longueur : seize par trente-deux.'],
    ],
    reveal: [{ cue: 'line', at: 0.2, span: 0.4 }],
    cams: [{ t: 0.25, ...C.line }, { t: 1, pos: [-2.2, 3.0, 2.6], tgt: [4.2, -0.15, -1.6] }],
  },
  {
    id: 'e2', min: 9,
    band: { n: '2', title: 'Trouver le point le plus haut', text: 'Déterminer l’endroit le plus surélevé de l’emplacement où le plancher sera construit avec l’aide du niveau au laser Bosch pour définir à quel endroit vous devrez placer votre premier madrier directement sur le sol.', detail: 'Ce point est le repère pour mettre les autres madriers de votre plancher de niveau' },
    lines: [
      [1, 'Étape deux : avec le niveau au laser Bosch, on trouve le point le plus haut du sol. Le premier madrier repose directement là, sur le sol : c\'est le repère de niveau pour tout le reste.'],
    ],
    show: [{ obj: 'laser', from: 0.1, to: 1 }, { obj: 'highMark', from: 0.45, to: 1 }],
    cams: [{ t: 0.3, ...C.high }, { t: 1, pos: [-1.4, 2.4, 3.2], tgt: [2.4, -0.1, -0.6] }],
  },
  {
    id: 'e3', min: 10,
    band: { n: '3', title: 'Placer la structure de base', text: 'Placer la structure de base en 6\'\'X6\'\' dans le sens contraire du forage de façon que les patins de la foreuse croisent les 6\'\'X6\'\', selon le plan et devis (azimut du forage).', detail: 'Sauf en cas d’avis contraire selon le superviseur' },
    why: 'Évite de faire un plancher surélevé inutilement : moins de blocage, moins de manipulation de bois, moins de perte de temps.',
    lines: [
      [1, 'Étape trois : la structure de base en six par six, dans le sens contraire du forage. Les patins de la foreuse vont croiser les madriers.'],
      [2, 'Pis en partant du point haut, on monte pas plus haut qu\'il faut.'],
      [1, 'C\'est ça : moins de blocage, moins de bois à forcer, moins de temps perdu.'],
    ],
    show: [{ obj: 'laser', from: 0, to: 0.3 }],
    reveal: [{ cue: 'joist1', at: 0.15, span: 0.05 }],
    cams: [{ t: 0.3, ...C.s1 }, { t: 1, pos: [SEC / 2 + 3.4, 2.6, 5.0], tgt: [SEC / 2, -0.05, -0.6] }],
  },
  {
    id: 'e4', min: 10,
    band: { n: '4', title: 'Cadrage de 16\' X 16\'', text: 'Placer votre premier madrier sur votre ligne de référence en peinture de l’étape (1) ensuite positionner un 6\'\'X6\'\' à 16\' de votre premier pour avoir un cadrage de 16\' X 16\' bien droit.', detail: 'Ensuite positionner les autres 6\'\'X6\'\' à une distance de 32\'\' « centre » chacun' },
    lines: [
      [1, 'Étape quatre : un six par six à seize pieds du premier, pour un cadrage de seize par seize bien droit. Les autres entre les deux, à trente-deux pouces centre.'],
    ],
    reveal: [{ cue: 'joistFar', at: 0.08, span: 0.05 }, { cue: 'joists1', at: 0.3, span: 0.45 }],
    cams: [{ t: 0.4, ...C.s1 }, { t: 1, pos: [SEC / 2 + 2.6, 4.2, 4.6], tgt: [SEC / 2, -0.05, 0] }],
  },
  {
    id: 'e5', min: 14,
    band: { n: '5', title: 'Mettre la structure de niveau', text: 'Placer le plancher au niveau en utilisant un niveau de 48\'\' et un morceau de 3\'\'X 8\'\' de 8 pieds minimum. Positionner les blocages et les coins de bois dans le sens contraire des madriers.', detail: 'Blocages en 3\'\'X8\'\' et/ou 6\'\'X6\'\' · minimum de 6 pour soutenir chaque 6\'\'X6\'\' · coins de bois pour ajuster le niveau' },
    lines: [
      [1, 'Étape cinq : la mise de niveau. Un niveau de quarante-huit pouces sur un trois par huit d\'au moins huit pieds, pour avoir de la portée.'],
      [1, 'Sous chaque madrier : des blocages dans le sens contraire, pis des coins de bois pour ajuster. Au moins six appuis par six par six.'],
    ],
    show: [{ obj: 'level', from: 0.05, to: 0.5 }],
    reveal: [{ cue: 'support1', at: 0.35, span: 0.55 }],
    cams: [{ t: 0.15, pos: [4.4, 1.4, -0.4], tgt: [2.3, 0.15, -0.4] }, { t: 0.45, ...C.s1low }, { t: 1, pos: [3.0, 1.15, 3.5], tgt: [2.4, -0.05, 0.2] }],
  },
  {
    id: 'e5b', min: 9,
    band: { n: '5', title: 'Blocage pour la section suivante', text: 'Lorsque vous mettez de niveau l’extrémité des 6\'\'X6\'\' de votre première section 16\'X16\' (celle qui se retrouvera au centre de votre plancher) placer votre blocage pour pouvoir supporter les 6\'\'X6\'\' de la section suivante.', detail: 'Cette méthode vous permettra de sauver du temps et vous assurera d’avoir 2 sections de plancher parfaitement égales' },
    lines: [
      [1, 'Au bout de la première section, on met tout de suite le blocage qui va porter aussi les madriers de la deuxième. Les deux sections vont être parfaitement égales.'],
    ],
    reveal: [{ cue: 'joint1', at: 0.15, span: 0.5 }],
    cams: [{ t: 0.3, ...C.joint }, { t: 1, pos: [SEC + 1.0, 0.95, 3.0], tgt: [SEC, -0.05, 0.4] }],
  },
  {
    id: 'e6', min: 14,
    band: { n: '6', title: 'Couvrir en 3\'\'X8\'\'', text: 'Une fois la base au niveau et complétée, mettre les 3\'\'X8\'\' de bois brut en les disposant dans le sens contraire des 6\'\'X6\'\', en commençant du début en vissant la première planche avec des tire-fond à chaque extrémité.', detail: 'Vous devez toujours commencer à couvrir le plancher dans le sens où vous pouvez marcher sur la surface revêtue' },
    why: 'Pour des raisons de sécurité : marcher sur la surface revêtue de 3\'\'X8\'\' pour ne pas devoir enjamber les madriers de 6\'\'x6\'\' de la construction de base.',
    lines: [
      [1, 'Étape six : on couvre avec du trois par huit brut, dans le sens contraire des six par six. La première planche est vissée avec des tire-fonds à chaque bout, pis on avance.'],
      [2, 'On part de quel bord ?'],
      [1, 'Du bord où tu peux marcher sur ce qui est déjà couvert. On enjambe jamais les six par six : c\'est là qu\'on trébuche.'],
    ],
    // Planches posées une à une, sans serrage : de petits écarts restent entre elles.
    reveal: [{ cue: 'deck1', from: 0, to: 1, at: 0.08, span: 0 }, { cue: 'screws1', at: 0.16, span: 0 }, { cue: 'deck1', from: 1, to: 11, at: 0.25, span: 0.7 }],
    cams: [{ t: 0.25, ...C.deck1 }, { t: 1, pos: [-0.8, 2.6, 4.0], tgt: [SEC * 0.5, 0, 0] }],
  },
  {
    id: 'e7', min: 13,
    band: { n: '7', title: 'Resserrer les planches', text: 'Après avoir couvert environ 50 % de la surface d’une section, vous pouvez resserrer vos planches avec des coins de bois pour le rendre plus solide et éviter que des écarts se forment à long terme.', detail: 'Vissez le dernier 3x8 · insérez des coins de bois et enfoncez-les pour créer une tension · vissez la planche devant les coins · retirez les tire-fonds du dernier 3x8' },
    lines: [
      [1, 'Étape sept : rendu à la moitié, on resserre. On visse la dernière planche, on enfonce des coins pour mettre les planches en tension, on visse la planche devant les coins, pis on retire les tire-fonds pour libérer les coins.'],
      [2, 'Sinon, à la longue, ça ouvre.'],
    ],
    // Serrage : dernier 3 × 8 vissé (temporaire), coins enfoncés entre lui et les
    // planches posées, écarts qui se ferment, planche devant les coins vissée,
    // tire-fonds du dernier 3 × 8 retirés, coins enlevés.
    tighten: { anchor: 145.0, anchorScrews: 146.4, wedgesIn: 147.4, drive: [148.2, 150.6], frontScrews: 151.0, unscrew: 153.2, wedgesOut: 154.2, back: [154.6, 155.4] },
    reveal: [{ cue: 'anchor', v: 145.0, vspan: 0 }, { cue: 'screwsT', v: 151.0, vspan: 0 }, { cue: 'deck1b', v: 155.8, vspan: 2.4 }],
    cams: [{ v: 143.0, ...C.tight }, { v: 150.8, ...C.tight2 }, { v: 155.6, ...C.tight2 }, { v: 158.6, ...C.deck1 }],
  },
  {
    id: 'e8', min: 8,
    band: { n: '8', title: 'Laisser deux planches libres', text: 'Lorsque la première section de 16\'X16\' sera couverte, laissez un espace d’environ 2 planches libres pour vous permettre de commencer la structure de base de votre deuxième section.', detail: 'À la fin, vous aurez l’espace pour visser avec des tire-fonds pour jointer les sections ensemble de chaque côté de votre plancher' },
    lines: [
      [1, 'Étape huit : on laisse environ deux planches libres au bout. Ça donne la place pour partir la deuxième section ; on les visse à la fin pour joindre les deux.'],
    ],
    cams: [{ t: 0.35, ...C.joint }, { t: 1, pos: [SEC + 2.4, 2.4, 2.6], tgt: [SEC - 0.6, 0.05, -0.2] }],
  },
  {
    id: 'e9', min: 8,
    band: { n: '9', title: 'Section 2 : hauteur au laser', text: 'Commencez la deuxième section 16\'X16\' de la structure de base. Pour déterminer la hauteur requise, utilisez le niveau au laser Bosch et positionnez le faisceau du laser.', detail: 'Le faisceau donne la hauteur requise pour soutenir le dessous de vos 6\'\'X6\'\'' },
    lines: [
      [1, 'Étape neuf : la deuxième section. Le laser donne la hauteur à soutenir sous les six par six. Ici, le sol descend : il faut monter.'],
    ],
    show: [{ obj: 'laser2', from: 0.1, to: 1 }],
    cams: [{ t: 0.35, ...C.s2low }, { t: 1, ...C.s2 }],
  },
  {
    id: 'e10', min: 12,
    band: { n: '10', title: 'Madrier guide et soutiens', text: 'Positionner un madrier à 16 pieds de votre première section : cela vous donnera la hauteur nécessaire pour surélever votre structure de base. Lorsque la hauteur le permet, utiliser des 6\'\'X6\'\' de 16\' comme soutien en les positionnant dans le sens contraire.', detail: 'Une structure stable, qui permet de placer vos 6\'\'X6\'\' sur le dessus pour joindre la première section' },
    lines: [
      [1, 'Étape dix : un madrier à seize pieds de la première section sert de guide. Quand la hauteur le permet, des six par six de seize pieds en dessous, dans le sens contraire.'],
      [2, 'Ça fait une base stable pour poser les madriers dessus.'],
    ],
    show: [{ obj: 'laser2', from: 0, to: 0.4 }],
    reveal: [{ cue: 'support2', v: 179.6, vspan: 2.0 }, { cue: 'guide', v: 181.2, vspan: 0 }, { cue: 'sleepers', v: 186.0, vspan: 2.6 }],
    cams: [{ t: 0.3, ...C.s2 }, { t: 1, pos: [SEC * 1.5 + 3.6, 1.6, 5.2], tgt: [SEC * 1.5, -0.25, 0.3] }],
  },
  {
    id: 'e11', min: 14,
    band: { n: '11', title: 'Madriers de la section 2', text: 'Après avoir positionné vos 6\'\'X6\'\' de niveau à 32\'\' centre, utiliser des coins de bois pour égaliser la structure de base. Toujours enligner vos soutiens vis-à-vis le croisement de vos 6X6 pour s’assurer d’un soutien solide.', detail: 'Cas spéciaux : construction de cage en 3\'\'X8\'\' et/ou 6\'\'X6\'\' de 24 à 36\'\' de long, empilés' },
    why: 'Toujours enligner vos soutiens vis-à-vis le croisement de vos 6X6 pour s’assurer d’un soutien solide.',
    lines: [
      [1, 'Étape onze : les madriers à trente-deux pouces centre, à la même hauteur que la première section. Les soutiens, toujours vis-à-vis le croisement des six par six.'],
      [1, 'Dans un creux comme celui-là, on monte une cage : des bouts de vingt-quatre à trente-six pouces, empilés croisés.'],
    ],
    // Cage (cas spécial) : gros plan, plancher en transparence, montée couche par couche.
    reveal: [{ cue: 'joists2', v: 194.4, vspan: 3.6 }, { cue: 'jointBlocks', v: 199.0, vspan: 2.0 }, { cue: 'cribFocus', v: 204.0, vspan: 9.6 }, { cue: 'cribOther', v: 214.4, vspan: 1.6 }],
    ghost: { vfrom: 203.2, vto: 230 },
    cams: [{ v: 194.0, ...C.s2 }, { v: 202.6, pos: [SEC * 1.5 + 3.4, 1.5, 4.4], tgt: [SEC * 1.5 + 0.6, -0.3, 0.9] }, { v: 205.2, ...C.cageA }, { v: 212.5, ...C.cageB }, { v: 217.6, ...C.cageC }],
  },
  {
    id: 'e12', min: 10,
    band: { n: '12', title: 'Couvrir la section 2', text: 'Une fois la structure de base de la deuxième section de plancher complétée, poursuivre en couvrant avec des 3\'\'X8\'\' en répétant les étapes 6 et 7 précédentes.', detail: 'Les 2 planches laissées libres (étape 8) sont vissées pour jointer les sections' },
    lines: [
      [1, 'Étape douze : on couvre la deuxième section en répétant les étapes six pis sept. Les deux planches de jonction sont vissées à la fin.'],
    ],
    reveal: [{ cue: 'deck2', at: 0.05, span: 0.6 }, { cue: 'screws2', at: 0.68, span: 0.08 }, { cue: 'joinPlanks', at: 0.78, span: 0.08 }, { cue: 'joinScrews', at: 0.9, span: 0 }],
    cams: [{ t: 0.3, ...C.deck2 }, { t: 1, pos: [L + 2.4, 2.6, 4.2], tgt: [SEC, 0, 0] }],
  },
  {
    id: 'e13', min: 9,
    band: { n: '13', title: 'Couper au ras', text: 'Lorsque vous aurez complété la surface totale du plancher, vérifier à ce qu’aucun morceau de bois 6\'\'X6\'\' ou 3X8 ne dépasse : ils doivent être coupés de manière carrée et égale avec le bord du plancher.', detail: 'Pour ne pas trébucher sur des morceaux inégaux' },
    lines: [
      [1, 'Étape treize : rien ne dépasse. Les bouts de six par six pis de trois par huit sont coupés carrés, égal avec le bord. Un bout qui dépasse, c\'est une chute.'],
    ],
    cams: [{ t: 0.35, ...C.edge }, { t: 1, pos: [3.8, 0.9, 3.9], tgt: [5.6, 0.16, 2.44] }],
  },
  {
    id: 'e14', min: 12,
    band: { n: '14', title: 'Marches', text: 'Si le plancher est plus haut que 12 pouces, une construction de marches devra être faite. Elles devront avoir une profondeur de 16\'\' minimum (2 madriers de 3\'\'X8\'\'), une largeur de 36\'\' minimum, un maximum de 60\'\' de largeur et une hauteur maximum de 12 pouces.', detail: 'Exemple : marches superposées en 3\'\'X8\'\', ajustées à 9\'\' du plancher, mises de niveau' },
    lines: [
      [1, 'Étape quatorze : ici, le plancher dépasse douze pouces. Il faut des marches : seize pouces de profondeur, entre trente-six pis soixante pouces de large, douze pouces de haut au maximum. On vise neuf.'],
    ],
    reveal: [{ cue: 'stairs', at: 0.1, span: 0.6 }],
    cams: [{ t: 0.3, ...C.stairs }, { t: 1, pos: [L + 2.6, 1.0, 2.1], tgt: [L + 0.3, 0.0, 0.96] }],
  },
  {
    id: 'e15', min: 15,
    band: { n: '15', title: 'Garde-corps (RSST, art. 12)', text: 'Si le plancher est plus haut que 12 pouces, des garde-corps devront être installés et respecter l’article 12 du RSST. Une lisse inférieure doit être ajoutée pour les endroits sur le plancher où les travailleurs ont accès.', detail: 'Ici : au bout du plancher, côté galerie (vide) ; le long des parois, le grillage ferme l’écart · lisse supérieure 1 m à 1,2 m · lisse intermédiaire · plinthe d’au moins 90 mm' },
    lines: [
      [1, 'Étape quinze : plus de douze pouces de haut pis un vide, des garde-corps selon l\'article douze du RSST. La lisse du haut entre un mètre pis un mètre vingt, une lisse à mi-hauteur, pis une plinthe d\'au moins quatre-vingt-dix millimètres.'],
    ],
    reveal: [{ cue: 'guards', at: 0.08, span: 0.6 }],
    cams: [{ t: 0.3, ...C.guards }, { t: 1, pos: [L + 3.4, 1.9, 4.4], tgt: [L - 1.4, 0.7, 1.0] }],
  },
  {
    id: 'e16', min: 7,
    band: { n: '16', title: 'Mains courantes', text: 'S’il y a plus d’une marche, il devra y avoir des mains courantes.', detail: 'Ici : deux marches, une main courante de chaque côté' },
    lines: [
      [1, 'Étape seize : plus d\'une marche, des mains courantes des deux bords.'],
    ],
    reveal: [{ cue: 'handrails', at: 0.15, span: 0.3 }],
    cams: [{ t: 0.4, ...C.stairs }, { t: 1, pos: [L + 3.0, 1.7, 2.2], tgt: [L + 0.3, 0.3, 0.96] }],
  },
  {
    id: 'e17', min: 9,
    band: { n: '17', title: 'Grillage au bas du mur', text: 'Si un écart entre votre plancher et le mur est de 12\'\' et moins, ajouter un grillage de 24\'\' de haut fixé au bas du mur.', detail: 'Celui-ci vous évitera de mettre le pied dans l’écart et annulera le risque de blessure' },
    lines: [
      [1, 'Étape dix-sept : entre le plancher pis le mur, douze pouces ou moins ? Un grillage de vingt-quatre pouces au bas du mur. Le pied passe pas dans le trou.'],
    ],
    reveal: [{ cue: 'grille', at: 0.12, span: 0.3 }],
    cams: [{ t: 0.35, ...C.grille }, { t: 1, pos: [7.4, 1.8, -1.1], tgt: [6.4, 0.0, -2.75] }],
  },
  {
    id: 'sec', min: 16,
    band: { n: '18', title: 'Plancher secondaire', text: 'Minimum de 32\'\' de largeur par 72\'\' de long et maximum de 12\'\' de hauteur. Aucun morceau en porte-à-faux. Les 2 dernières planches les plus près de la foreuse vissées à l’aide de tire-fonds ; la dernière planche à au moins 3 pouces de la tour.', detail: 'À chaque changement d’azimut, de degrés ou d’angle de forage, les 2 dernières planches et les garde-corps sont ajustés · l’ajout de bois plané sur les planchers n’est pas toléré' },
    lines: [
      [1, 'À côté de la tour de la foreuse, le plancher secondaire : au moins trente-deux par soixante-douze pouces, douze pouces de haut au maximum, rien en porte-à-faux.'],
      [1, 'Les deux planches les plus proches sont vissées, la dernière arrive à trois pouces de la tour. À chaque changement d\'angle, on les ajuste. Pis pas de bois plané sur les planchers.'],
    ],
    reveal: [{ cue: 'secondary', at: 0.15, span: 0.45 }],
    cams: [{ t: 0.2, ...C.ov }, { t: 0.5, ...C.second }, { t: 1, pos: [2.9, 1.5, 1.9], tgt: [0.8, 0.4, 0.2] }],
  },
  {
    id: 'demont', min: 12,
    band: { n: '', title: 'Démantèlement', text: 'Démanteler d’abord le plancher secondaire, ensuite le plancher principal en commençant toujours par les planches du fond ; toujours enlever les clous et tire-fonds à mesure que les planches sont enlevées.', detail: 'Après la fin du démantèlement : installer une clôture orange et une carte de ruban rouge : trou non arpenté et non cimenté · date de l’installation · nom du superviseur' },
    lines: [
      [1, 'Au démantèlement, c\'est l\'inverse : le plancher secondaire d\'abord, le principal en commençant par les planches du fond, les tire-fonds enlevés à mesure.'],
      [1, 'À la fin : clôture orange pis carte de ruban rouge. Trou non arpenté et non cimenté, la date, le nom du superviseur.'],
    ],
    cams: [{ t: 0.4, ...C.end }, { t: 1, pos: [-2.6, 3.4, 5.6], tgt: [L / 2, 0.2, 0] }],
  },
  {
    id: 'fin', min: 10, card: 'end',
    band: { n: '', title: 'À retenir', text: '', detail: '' },
    lines: [
      [1, 'À retenir : le premier madrier au point le plus haut, six appuis minimum par six par six, enlignés aux croisements.'],
      [1, 'Plus de douze pouces : marches, garde-corps pis mains courantes. Pis le gros bois, toujours à deux.'],
      [2, 'Compris. On est prêts à bâtir.'],
    ],
    cams: [{ t: 0.5, ...C.ov }, { t: 1, ...C.ov }],
  },
];

export const RETENIR = [
  'Premier madrier au point le plus haut du sol, sur la ligne de peinture',
  'Au moins 6 appuis par 6\'\'X6\'\', enlignés vis-à-vis les croisements',
  'Couvrir en avançant sur la surface revêtue, sans enjamber les 6\'\'X6\'\'',
  'Plus de 12 po : marches, garde-corps (RSST art. 12) et mains courantes',
  'Grosses pièces de bois : toujours à deux',
];

// ------------------------------------------------------------------ cartons d'étape

/** Carton affiché au début d'une partie (grand titre au centre), ou null. */
export const STEP_CARD = { dur: 2.0, rect: { x: 250, y: 185, w: 780, h: 170 } };
export function stepCard(seg) {
  const b = seg.band;
  if (seg.card || seg.id === 'e5b') return null;
  if (seg.id === 'materiel') return { big: 'Avant de commencer', small: 'Matériel et ÉPI' };
  if (seg.id === 'inspection') return { big: 'Inspection', small: 'Inspection des lieux par le superviseur' };
  if (seg.id === 'demont') return { big: 'Démantèlement', small: '' };
  if (b.n === '18') return { big: 'Plancher secondaire', small: 'À côté de la foreuse' };
  if (b.n === '') return null;
  return { big: `Étape ${b.n}`, small: b.title };
}

// ------------------------------------------------------------------ voix

/** Narration enregistrée (ElevenLabs, voix « Germain »), lue d'un trait. */
export const VOICE_FILE = 'video/plancher/voix-germain.mp3';
// Début de chaque partie dans l'enregistrement (s), repéré par transcription.
const VOICE_AT = {
  titre: 0, materiel: 17.92, inspection: 38.93, e1: 47.68, e2: 59.43, e3: 70.84, e4: 87.22, e5: 97.54,
  e5b: 113.77, e6: 122.36, e7: 141.46, e8: 158.22, e9: 168.02, e10: 178.88, e11: 192.82, e12: 211.2,
  e13: 220.36, e14: 231.79, e15: 246.25, e16: 260.6, e17: 265.34, sec: 274.97, demont: 296.75, fin: 315.48,
};
const VOICE_END = 332.59;
// Silences ajoutés dans la voix : [instant dans l'enregistrement, durée] (ex. cage, étape 11).
const GAPS = { e11: [[203.45, 2.4]] };
// Temps laissé après la voix (s) ; par défaut 0,4.
const TAIL = { e11: 7.5, titre: 0.2, fin: 1.2, e15: 0.2, e7: 1.6, materiel: +(tourEnd(TOUR_V0) + 1.4 - 38.93).toFixed(2) };
const LEAD = 0.3; // la voix démarre 0,3 s après le début de la partie
const r24 = (x) => Math.round(x * 24) / 24;

/** Instant de la vidéo (s) où l'on entend l'instant v de l'enregistrement, dans la partie seg. */
export function vt(seg, v) {
  let t = seg.start + LEAD + (v - seg.voice.a);
  for (const [at, d] of seg.voice.gaps) if (v >= at) t += d;
  return t;
}

/**
 * Durées (s) et instants de début, calés sur la voix. Les repères donnés en
 * temps de l'enregistrement (v, vspan, vfrom, vto) sont convertis en fractions
 * de la partie (at, span, from, to, t) pour la vidéo.
 */
export function timeline() {
  const ids = SEGMENTS.map((s) => s.id);
  let t = 0;
  return SEGMENTS.map((s, i) => {
    const a = VOICE_AT[s.id], b = i + 1 < ids.length ? VOICE_AT[ids[i + 1]] : VOICE_END;
    const gaps = GAPS[s.id] || [];
    const dur = r24(LEAD + (b - a) + gaps.reduce((n, g) => n + g[1], 0) + (TAIL[s.id] ?? 0.4));
    const seg = { ...s, start: t, dur, voice: { a, b, gaps } };
    const f = (v) => (vt(seg, v) - seg.start) / dur;
    const fs = (v, d) => (vt(seg, v + d) - vt(seg, v)) / dur;
    seg.reveal = (s.reveal || []).map((r) => (r.v != null ? { ...r, at: f(r.v), span: r.vspan ? fs(r.v, r.vspan) : 0 } : r));
    seg.show = (s.show || []).map((r) => (r.vfrom != null ? { ...r, from: f(r.vfrom), to: r.vto != null ? f(r.vto) : 1 } : r));
    seg.cams = s.cams.map((k) => (k.v != null ? { ...k, t: Math.min(1, f(k.v)) } : k));
    if (s.ghost) seg.ghost = { from: f(s.ghost.vfrom), to: Math.min(1, s.ghost.vto != null ? f(s.ghost.vto) : 1) };
    t += dur;
    return seg;
  });
}

export { DECK };
