// Contenu du formulaire MA4657078 « Forage au diamant sous-terre » (Machines
// Roger International) repris tel quel : questions de l'analyse de risque sur le
// terrain (section INSPECTION), types de risques et moyens de contrôle.
//
// « ombre » : réponse dont la case est ombrée sur le formulaire, celle qui
// demande de noter le risque et son moyen de contrôle dans la PLANIFICATION
// (#T / #R / type de risque / moyen de contrôle). Questions 18 et 19 : un
// endroit, pas un oui ou non.

export const SOURCE = 'Formulaire MA4657078 — Forage au diamant sous-terre (Machines Roger International)';

export const QUESTIONS = {
  1: { texte: 'Est-ce que j’ai besoin de délimiter ma zone de travail?', ombre: 'oui' },
  2: { texte: 'Est-ce que j’ai besoin d’aide?', ombre: 'oui' },
  3: { texte: 'Ai-je besoin d’avertir quelqu’un avant d’accomplir ma tâche?', ombre: 'oui' },
  4: { texte: 'Est-ce que je suis exposé à une chute?', ombre: 'oui' },
  5: { texte: 'Est-ce qu’il y a un risque d’incendie?', ombre: 'oui' },
  6: { texte: 'Y a-t-il quelque chose de différent aujourd’hui? (État d’esprit, changement de quart, nouveau collègue, etc.)', ombre: 'oui' },
  7: { texte: 'Est-ce que j’ai les outils / équipements / élingues / échelles / EPI appropriés et sont-ils en bon état?', ombre: 'non' },
  8: { texte: 'Est-ce que j’ai besoin de contrôler des sources d’énergie? (électrique, pneumatique, hydraulique, résiduelle, etc.)', ombre: 'oui' },
  9: { texte: 'Mes mains sont-elles à risque d’être écrasées, coupées, coincées?', ombre: 'oui' },
  10: { texte: 'Est-ce que l’état et la propreté des lieux sont satisfaisants?', ombre: 'non' },
  11: { texte: 'Puis-je m’attendre à des efforts excessifs / positions dangereuses?', ombre: 'oui' },
  12: { texte: 'Est-ce que les accès et la place de travail sont conformes?', ombre: 'non' },
  13: { texte: 'Je suis bien positionné afin d’éviter d’être dans la ligne de tir?', ombre: 'non' },
  14: { texte: 'Est-ce que les conditions de terrain sont conformes? (absence de support de terrain endommagé, absence de roche branlante, etc.)', ombre: 'non' },
  15: { texte: 'Est-ce que la ventilation est conforme? (débit suffisant, conduite de ventilation en bon état, absence de gaz, poussières.)', ombre: 'non' },
  16: { texte: 'Est-ce que j’ai fait l’inspection de mon équipement mobile et de la foreuse et complété la carte d’inspection avant utilisation?', ombre: 'non' },
  17: { texte: 'Suis-je formé pour la tâche et je connais bien la ou les procédures?', ombre: 'non' },
  18: { texte: 'Quel est l’endroit du refuge le plus près?', endroit: true },
  19: { texte: 'Quel est l’endroit de l’extincteur le plus près?', endroit: true },
  20: { texte: 'Est-ce qu’il y a d’autres risques?', ombre: 'oui' },
  21: { texte: 'Est-ce que j’ai validé les plans et devis?', ombre: 'non' },
};

export const RISQUES = [
  'Chute de hauteur', 'Chute d’objet', 'Chute de roches', 'Visibilité réduite', 'Glissade', 'Coupure',
  'Effondrement d’échafaudage', 'Écrasé par', 'Frappé par', 'Contrainte thermique', 'Choc électrique',
  'Heurté contre', 'Explosion', 'Projection', 'Plancher secondaire', 'Coincé', 'Incendie', 'Efforts excessifs',
  'Énergie résiduelle', 'Collision', 'Intoxication',
];

export const CONTROLES = [
  'Cadenassage d’équipement', 'Élimination de l’énergie résiduelle', 'Permis de travail à chaud',
  'Épandage d’abrasif', 'Travail d’équipe', 'Permis d’espace clos', 'Protection contre les chutes',
  'Périmètre de sécurité', 'Entretien, ménager', 'Écaillage', 'Adaptation de la conduite (ex : vitesse)',
  'Retrait des matières combustibles', 'Déneigement', 'Moyens d’extinction à proximité',
  'EPI spécifique (ex : masque, visière, etc.)', 'Mesure ergonomique', 'Permis d’excavation',
];

/**
 * Points d'inspection de la carte, dans l'ordre de la tournée. pos : [x, z] (le
 * jeu les place après la construction de la scène) ; questions : numéros #R ;
 * risques / controles : suggestions tirées des listes du formulaire, offertes
 * quand la réponse tombe sur une case ombrée.
 */
export const POINTS = [
  {
    id: 'refuge', titre: 'Refuge', icone: 'R', couleur: '#22d36b',
    consigne: 'Repère le refuge le plus près de ta place de travail.',
    questions: [18], risques: [], controles: [],
  },
  {
    id: 'barricade', titre: 'Barricade de la place de travail', icone: 'B', couleur: '#ffd23f',
    consigne: 'Va à la barricade, à l’entrée de la place de travail.',
    questions: [1, 3], risques: ['Frappé par', 'Collision'], controles: ['Périmètre de sécurité', 'Travail d’équipe'],
  },
  {
    id: 'extincteur', titre: 'Extincteur', icone: 'E', couleur: '#ff4d4d',
    consigne: 'Trouve l’extincteur le plus près.',
    questions: [19, 5], risques: ['Incendie', 'Explosion'], controles: ['Moyens d’extinction à proximité', 'Retrait des matières combustibles', 'Permis de travail à chaud'],
  },
  {
    id: 'acces', titre: 'Escalier et garde-corps', icone: 'A', couleur: '#4dc3ff',
    consigne: 'Vérifie l’accès au plancher : marches, mains courantes et garde-corps.',
    questions: [12, 4], risques: ['Chute de hauteur', 'Glissade', 'Heurté contre'], controles: ['Protection contre les chutes', 'Entretien, ménager'],
  },
  {
    id: 'foreuse', titre: 'Foreuse', icone: 'F', couleur: '#ff8a3d',
    consigne: 'Monte sur le plancher et inspecte la foreuse.',
    questions: [16, 8, 13], risques: ['Énergie résiduelle', 'Coincé', 'Projection', 'Frappé par'], controles: ['Cadenassage d’équipement', 'Élimination de l’énergie résiduelle', 'EPI spécifique (ex : masque, visière, etc.)'],
  },
  {
    id: 'ventilation', titre: 'Conduite de ventilation', icone: 'V', couleur: '#ffe066',
    consigne: 'Vérifie la sortie de la conduite de ventilation, près du front.',
    questions: [15], risques: ['Intoxication', 'Visibilité réduite'], controles: ['EPI spécifique (ex : masque, visière, etc.)'],
  },
  {
    id: 'terrain', titre: 'Conditions de terrain', icone: 'T', couleur: '#c08bff',
    consigne: 'Lève les yeux : support de terrain (boulons, grillage) et roche branlante.',
    questions: [14], risques: ['Chute de roches'], controles: ['Écaillage'], regarderHaut: true,
  },
];
