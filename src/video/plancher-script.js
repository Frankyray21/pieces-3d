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

const L = 9.7536, SEC = 4.8768, W = 4.8768, DECK = 0.2286;

const C = {
  ov: { pos: [L / 2 + 6.2, 5.0, 8.4], tgt: [L / 2, -0.15, -0.4] },
  entr: { pos: [L + 6.6, 1.45, 1.1], tgt: [L + 4.3, 1.3, 0] },
  wall: { pos: [4.2, 1.7, 1.6], tgt: [3.1, 1.25, -2.7] },
  line: { pos: [-2.6, 2.0, 0.9], tgt: [3.2, -0.15, -2.35] },
  high: { pos: [-1.9, 1.45, 1.4], tgt: [0.9, -0.05, -1.7] },
  s1: { pos: [SEC / 2 + 4.0, 3.1, 5.8], tgt: [SEC / 2, -0.05, -0.2] },
  s1low: { pos: [SEC * 0.78, 0.6, 3.9], tgt: [SEC * 0.42, -0.02, 0.8] },
  joint: { pos: [SEC + 1.5, 0.75, 3.5], tgt: [SEC, -0.05, 1.5] },
  deck1: { pos: [-1.9, 3.5, 4.6], tgt: [SEC * 0.62, 0, 0] },
  tight: { pos: [3.95, 1.45, 3.3], tgt: [2.55, 0.2, 1.1] },
  s2: { pos: [SEC * 1.5 + 4.6, 2.7, 5.6], tgt: [SEC * 1.5, -0.2, 0] },
  s2low: { pos: [L + 1.7, 0.45, 4.1], tgt: [L - 1.6, -0.25, 1.0] },
  crib: { pos: [10.7, 0.55, 3.7], tgt: [8.8, -0.35, 1.55] },
  deck2: { pos: [L + 3.0, 3.4, 4.8], tgt: [SEC * 1.45, 0, 0] },
  edge: { pos: [4.6, 0.8, 3.9], tgt: [6.4, 0.16, 2.44] },
  stairs: { pos: [L + 3.4, 1.45, 2.15], tgt: [L + 0.3, 0.02, 0.96] },
  guards: { pos: [L + 4.6, 2.7, 5.2], tgt: [L - 2.2, 0.6, 0.4] },
  grille: { pos: [6.3, 1.9, -1.2], tgt: [6.6, 0.0, -2.75] },
  second: { pos: [5.6, 2.9, 0.2], tgt: [3.3, 0.45, -1.7] },
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
    band: { n: '', title: 'Matériel nécessaire et ÉPI', text: 'Barricade travaux en cours avec flasher orange · Armoire (trousse de premier soin et lave-yeux 2x) · Extincteur · Bois brut de 6\'\'X 6\'\' et de 3\'\'X 8\'\' · Coin de bois · Tire fond 6\'\'', detail: 'ÉPI : équipement de base obligatoire · Le travailleur applique la procédure, le superviseur voit au bon déroulement' },
    why: 'TOUJOURS TRANSPORTER LES GROSSES PIÈCES DE BOIS À DEUX.',
    lines: [
      [1, 'Avant de commencer : la barricade travaux en cours avec son flasher orange, l\'armoire avec la trousse de premiers soins pis les deux lave-yeux, l\'extincteur.'],
      [2, 'Pis le bois : du six par six brut, du trois par huit brut, des coins pis des tire-fonds de six pouces.'],
      [1, 'Une règle qui change pas : les grosses pièces de bois, on les transporte toujours à deux.'],
    ],
    reveal: [{ cue: 'barricade', at: 0.05, span: 0.1 }, { cue: 'cabinet', at: 0.25, span: 0.1 }, { cue: 'ext', at: 0.35, span: 0.05 }],
    cams: [{ t: 0.3, ...C.entr }, { t: 1, pos: [L + 5.6, 1.5, 2.2], tgt: [L + 3.0, 0.7, 1.2] }],
  },
  {
    id: 'inspection', min: 9,
    band: { n: '0', title: 'Inspection des lieux', text: 'Le superviseur doit d’abord avoir fait une inspection des lieux avant de déplacer les équipements à l’endroit de forage.', detail: 'Il doit s’assurer que : le plancher est exempt de débris · le plancher est plat · les fonds de trous ont été trouvés et marqués' },
    lines: [
      [1, 'Le superviseur inspecte les lieux avant d\'amener l\'équipement : un sol sans débris, plat, pis les fonds de trous trouvés et marqués sur le mur.'],
    ],
    cams: [{ t: 0.35, ...C.wall }, { t: 1, pos: [2.2, 1.5, 1.4], tgt: [3.4, 1.25, -2.7] }],
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
    cams: [{ t: 0.15, pos: [2.9, 1.2, 2.6], tgt: [2.2, 0.15, 0.4] }, { t: 0.45, ...C.s1low }, { t: 1, pos: [SEC * 0.55, 0.45, 3.6], tgt: [SEC * 0.3, -0.02, 0.6] }],
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
    reveal: [{ cue: 'deck1', from: 0, to: 1, at: 0.08, span: 0 }, { cue: 'screws1', at: 0.16, span: 0 }, { cue: 'deck1', from: 1, to: 12, at: 0.25, span: 0.7 }],
    cams: [{ t: 0.25, ...C.deck1 }, { t: 1, pos: [-0.8, 2.6, 4.0], tgt: [SEC * 0.5, 0, 0] }],
  },
  {
    id: 'e7', min: 13,
    band: { n: '7', title: 'Resserrer les planches', text: 'Après avoir couvert environ 50 % de la surface d’une section, vous pouvez resserrer vos planches avec des coins de bois pour le rendre plus solide et éviter que des écarts se forment à long terme.', detail: 'Vissez le dernier 3x8 · insérez des coins de bois et enfoncez-les pour créer une tension · vissez la planche devant les coins · retirez les tire-fonds du dernier 3x8' },
    lines: [
      [1, 'Étape sept : rendu à la moitié, on resserre. On visse la dernière planche, on enfonce des coins pour mettre les planches en tension, on visse la planche devant les coins, pis on retire les tire-fonds pour libérer les coins.'],
      [2, 'Sinon, à la longue, ça ouvre.'],
    ],
    show: [{ obj: 'tightWedges', from: 0.12, to: 0.62 }],
    reveal: [{ cue: 'screwsT', at: 0.4, span: 0 }, { cue: 'deck1', from: 12, to: 22, at: 0.62, span: 0.33 }],
    cams: [{ t: 0.2, ...C.tight }, { t: 0.6, ...C.tight }, { t: 1, ...C.deck1 }],
  },
  {
    id: 'e8', min: 8,
    band: { n: '8', title: 'Laisser deux planches libres', text: 'Lorsque la première section de 16\'X16\' sera couverte, laissez un espace d’environ 2 planches libres pour vous permettre de commencer la structure de base de votre deuxième section.', detail: 'À la fin, vous aurez l’espace pour visser avec des tire-fonds pour jointer les sections ensemble de chaque côté de votre plancher' },
    lines: [
      [1, 'Étape huit : on laisse environ deux planches libres au bout. Ça donne la place pour partir la deuxième section ; on les visse à la fin pour joindre les deux.'],
    ],
    cams: [{ t: 0.35, ...C.joint }, { t: 1, pos: [SEC + 1.8, 1.6, 3.4], tgt: [SEC - 0.3, 0.1, 0.3] }],
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
    reveal: [{ cue: 'support2', at: 0.08, span: 0.5 }, { cue: 'sleepers', at: 0.55, span: 0.35 }],
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
    reveal: [{ cue: 'joists2', at: 0.05, span: 0.35 }, { cue: 'crib', at: 0.6, span: 0.1 }],
    cams: [{ t: 0.25, ...C.s2 }, { t: 0.55, ...C.crib }, { t: 1, pos: [10.3, 0.75, 3.3], tgt: [8.8, -0.3, 1.4] }],
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
      [2, 'Pis ça doit tenir combien ?'],
      [1, 'Neuf cents newtons de côté, quatre cent cinquante vers le bas, sur la lisse du haut.'],
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
    cams: [{ t: 0.2, ...C.ov }, { t: 0.5, ...C.second }, { t: 1, pos: [4.6, 2.0, -0.6], tgt: [3.2, 0.5, -2.0] }],
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

const WORDS_PER_S = 2.5;
const words = (s) => s.split(/\s+/).filter(Boolean).length;

/** Durées (s) et instants de début, calculés d'après la narration. */
export function timeline() {
  let t = 0;
  return SEGMENTS.map((s) => {
    const w = s.lines.reduce((n, [, x]) => n + words(x), 0);
    const pauses = (s.lines.length - 1) * 0.35;
    const dur = Math.max(s.min, Math.round((w / WORDS_PER_S + pauses + 1.6) * 24) / 24);
    const seg = { ...s, words: w, start: t, dur };
    t += dur;
    return seg;
  });
}

export { DECK };
