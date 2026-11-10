// Scénario de la vidéo « Installer le support de tiges de forage » (procédure
// PRO-DD-ST-008), premier contact d'un travailleur avec la méthode : un
// passage par étape de la procédure, dans son ordre. Pour chaque passage : le
// bandeau (titre court et mots-clés, pas la phrase de la voix), la réplique du
// formateur (une seule voix, qui dit ce que dit l'étape, rien de plus), et les
// plans de caméra, choisis selon ce qui est expliqué (ensemble, gros plan,
// profil pour un angle, plongée pour le quinconce, coupe pour le trou).
//
// Plans (shots) : repère du chantier (mètres : X le long de la paroi, Y vers
// le haut depuis le plancher, +Z vers l'intérieur de la galerie ; paroi à
// Z ≈ −1, pieds du support à Z = 0). Un plan commence à l'instant t du
// passage (s) et dérive lentement de (pos, tgt) à to ; d'un plan au suivant la
// caméra glisse en `glide` secondes (1,4 par défaut), ou coupe net (cut).
// fov : angle de champ (38° par défaut ; plus petit = plus serré). badge :
// pastille affichée pendant le plan (« Vue en coupe »).
//
// step : étape du montage 3D jouée à l'arrivée du passage (null : montage
// fermé, tout est affiché) ; still : affichée sans animation. anim : durées
// des animations de l'étape pour ce passage (ms), calées sur la voix. cues :
// étapes affichées sans animation à l'instant t (rappel des points clés).
// reveal : thèmes de repères montrés à partir de l'instant t (une idée à la
// fois, dans l'ordre de la voix). inset : détail d'une page de la procédure
// incrusté de from à to (crop en fractions de la page, w en pixels). card :
// carton de from à to, dont chaque rangée paraît à son instant t.

const PASSAGES = [
  {
    id: 'titre', step: null, num: 'PRO-DD-ST-008', title: 'Installer le support de tiges de forage',
    text: 'Procédure de travail · Machines Roger International',
    voix: 'Installer le support de tiges de forage. Procédure de travail PRO-DD-ST-008.',
    shots: [{ t: 0, pos: [-3.2, 2.05, 4.7], tgt: [0, 1.25, -0.1], to: { pos: [-2.6, 1.9, 4.0] } }],
  },
  {
    id: 'etape-00', step: null, num: 'Avant de commencer', title: 'Les responsabilités', text: '',
    voix: "Avant de commencer. Comme travailleur, tu respectes la procédure, surtout la quantité de tiges et l'angle d'empilage dans le support. Le superviseur fait respecter la procédure en tout temps, et fait reprendre toute installation non conforme. Avant de quitter le site, la mine fore des trous de service, pour y introduire des boulons à œil.",
    card: { from: 1.2, to: 24.3, title: 'Qui fait quoi', rows: [
      { t: 0.4, cells: ['Travailleur', 'Quantité de tiges et angle d’empilage'] },
      { t: 7.4, cells: ['Superviseur', 'Fait reprendre toute installation non conforme'] },
      { t: 14.4, cells: ['Mine', 'Fore les trous de service (boulons à œil)'] },
    ] },
    shots: [
      { t: 0, pos: [-2.6, 1.9, 4.0], tgt: [0, 1.25, -0.1], to: { pos: [-0.6, 1.75, 4.3] }, glide: 0.1 },
      { t: 12, pos: [-0.6, 1.75, 4.3], tgt: [0, 1.25, -0.1], to: { pos: [1.7, 1.7, 3.7] }, glide: 0.1 },
    ],
  },
  {
    id: 'etape-01', step: 1, num: 'Étape 1 / 15', title: 'Choisir l’endroit',
    text: 'Près du mur · loin de la ligne de tir des trous de forage',
    voix: 'Étape 1. Choisis un endroit près du mur, et loin de la ligne de tir des trous de forage. La procédure donne des exemples de positionnement.',
    reveal: [{ t: 0, tags: ['mur'] }, { t: 3.6, tags: ['mur', 'tir'] }],
    inset: { page: 'P11', crop: [0.285, 0.112, 0.722, 0.365], from: 8, to: 12.3, caption: 'Exemples de positionnement (procédure, page 5)' },
    shots: [{ t: 0, pos: [2.1, 3.6, 4.0], tgt: [-0.9, 0.3, 0.6], to: { pos: [1.5, 3.0, 3.3] }, cut: true }],
  },
  {
    id: 'etape-02', step: 2, num: 'Étape 2 / 15', title: 'Percer le trou au mur',
    text: 'Au centre du support · 18 po de profond · à ± 5 pi du plancher',
    voix: 'Étape 2. Au mur, situe le centre du support. Avec la foreuse à percussion électrique, perce un trou de 18 pouces de profond, à plus ou moins 5 pieds du plancher.',
    anim: { delay: 5000, dur: 4400 },
    reveal: [{ t: 0, tags: ['centre'] }, { t: 4.2, tags: ['+coupe'] }, { t: 10.2, tags: ['haut'] }],
    shots: [
      { t: 0, pos: [-1.2, 1.7, 3.1], tgt: [0, 1.3, -0.9], to: { pos: [-1.0, 1.68, 2.7] }, glide: 2 },
      { t: 4.2, pos: [1.2, 1.58, -0.9], tgt: [0, 1.5, -0.88], to: { pos: [1.0, 1.57, -1.08], tgt: [0, 1.5, -1.06] }, cut: true, badge: 'Vue en coupe', hide: ['M'] },
      { t: 10.2, pos: [-2.0, 1.3, 1.6], tgt: [-0.3, 0.8, -0.9], to: { pos: [-1.75, 1.28, 1.35] }, cut: true },
    ],
  },
  {
    id: 'etape-03', step: 3, num: 'Étape 3 / 15', title: 'Insérer le boulon à œil',
    text: 'Ne pas l’enfoncer jusqu’au fond du trou',
    voix: "Étape 3. Insère le boulon à œil, mais ne l'enfonce pas jusqu'au fond du trou.",
    anim: { delay: 900, dur: 2400 },
    reveal: [{ t: 0, tags: [] }, { t: 3.8, tags: ['+coupe'] }],
    inset: { page: 'P08', crop: [0.43, 0.172, 0.63, 0.272], w: 300, from: 0.6, to: 3.6, caption: 'Boulon à œil (procédure, page 2)' },
    shots: [
      { t: 0, pos: [0.75, 1.64, -0.2], tgt: [0, 1.52, -0.84], to: { pos: [0.6, 1.62, -0.33] }, cut: true },
      { t: 3.8, pos: [1.0, 1.57, -1.08], tgt: [0, 1.5, -1.06], to: { pos: [0.9, 1.56, -1.12], tgt: [0, 1.5, -1.1] }, cut: true, badge: 'Vue en coupe', hide: ['M'] },
    ],
  },
  {
    id: 'etape-04', step: 4, num: 'Étape 4 / 15', title: 'Lever le support à deux',
    text: 'À deux · pattes du haut bien appuyées au mur',
    voix: "Étape 4. À deux, soulevez le support, et placez les pattes du haut pour qu'elles soient bien appuyées au mur.",
    anim: { delay: 1600, dur: 3600 },
    reveal: [{ t: 0, tags: [] }, { t: 5.2, tags: ['appui'] }],
    shots: [
      { t: 0, pos: [-3.9, 2.25, 1.2], tgt: [-0.2, 1.5, -0.45], to: { pos: [-3.5, 2.2, 1.0] }, cut: true },
      { t: 6, pos: [-2.1, 2.62, 0.05], tgt: [-0.55, 2.28, -0.9], to: { pos: [-1.85, 2.56, -0.1] }, cut: true },
    ],
  },
  {
    id: 'etape-05', step: 5, num: 'Étape 5 / 15', title: 'Vérifier l’angle',
    text: 'Entre 75° et 80°',
    voix: "Étape 5. Assure-toi que l'angle du support est entre 75 et 80 degrés.",
    inset: { page: 'P08', crop: [0.43, 0.38, 0.63, 0.58], w: 230, from: 5.4, to: 8.8, caption: 'Niveau (procédure, page 2)' },
    shots: [
      { t: 0, pos: [3.5, 1.05, -0.25], tgt: [0.9, 0.9, -0.3], to: { pos: [3.1, 1.02, -0.25] }, cut: true },
      { t: 5, pos: [2.2, 1.42, -0.1], tgt: [0.87, 1.36, -0.27], to: { pos: [1.9, 1.4, -0.15] } },
    ],
  },
  {
    id: 'etape-06', step: 6, num: 'Étape 6 / 15', title: 'Chaîne dans le boulon à œil',
    text: 'Jusqu’au milieu de la chaîne',
    voix: "Étape 6. Passe une chaîne dans le boulon à œil, jusqu'à son milieu.",
    shots: [{ t: 0, pos: [1.0, 1.5, 0.35], tgt: [0, 1.0, -0.86], to: { pos: [0.75, 1.42, 0.1] }, cut: true }],
  },
  {
    id: 'etape-07', step: 7, num: 'Étape 7 / 15', title: 'Chaîne dans les œillets',
    text: 'Chaque bout dans son œillet · de l’extérieur vers l’intérieur',
    voix: "Étape 7. Passe chaque bout de la chaîne dans l'œillet du support qui lui est destiné, de l'extérieur vers l'intérieur.",
    anim: { delay: 1800, dur: 6000 },
    shots: [
      { t: 0, pos: [1.75, 2.25, 0.05], tgt: [0.62, 1.95, -0.6], to: { pos: [1.6, 2.2, -0.05] }, glide: 1.6 },
      { t: 5.3, pos: [-1.75, 2.25, 0.05], tgt: [-0.62, 1.95, -0.6], to: { pos: [-1.6, 2.2, -0.05] }, cut: true },
    ],
  },
  {
    id: 'etape-08', step: 8, num: 'Étape 8 / 15', title: 'Tendre la chaîne',
    text: 'Tendeur à cliquet, serré au maximum · ou tendeur « bear trap »',
    voix: 'Étape 8. Relie les deux bouts de la chaîne avec un tendeur à cliquet, et serre-le au maximum. Tu peux aussi utiliser un tendeur de type bear trap.',
    anim: { delay: 2600, dur: 5600 },
    inset: { page: 'P08', crop: [0.25, 0.745, 0.81, 0.915], from: 8.8, to: 13.3, caption: 'Tendeur à cliquet ou « bear trap » (procédure, page 2)' },
    shots: [
      { t: 0, pos: [0.6, 2.42, 0.55], tgt: [0, 2.02, -0.55], to: { pos: [0.42, 2.36, 0.38] }, glide: 1.8 },
      { t: 8.6, pos: [-1.4, 2.0, 1.4], tgt: [0, 1.78, -0.62], to: { pos: [-1.15, 1.96, 1.15] }, glide: 2 },
    ],
  },
  {
    id: 'etape-09', step: 9, num: 'Étape 9 / 15', title: 'Placer les tiges en quinconce',
    text: 'Par rangée · à partir de la gauche',
    voix: 'Étape 9. Place les tiges dans le support en quinconce, rangée par rangée, en partant de la gauche.',
    shots: [
      { t: 0, pos: [0, 9.5, 0.9], tgt: [0, 2.9, -0.3], fov: 14, cut: true },
      { t: 10.5, pos: [-2.5, 1.75, 3.3], tgt: [0, 1.5, 0], to: { pos: [-2.1, 1.72, 2.9] }, cut: true },
    ],
  },
  {
    id: 'etape-10', step: 10, num: 'Étape 10 / 15', title: 'Appuyer les tiges au fond',
    text: 'Sur la barre transversale du fond · pas sur les côtés',
    voix: 'Étape 10. Appuie les tiges sur la barre transversale du fond, et non sur les côtés.',
    reveal: [{ t: 0, tags: ['fond'] }, { t: 4.6, tags: ['fond', 'cotes'] }],
    shots: [
      { t: 0, pos: [0.1, 3.25, -0.92], tgt: [0, 2.45, -0.35], to: { pos: [0.35, 3.2, -0.9] }, cut: true },
      { t: 4.6, pos: [1.35, 3.1, -0.78], tgt: [0.62, 2.45, -0.3], to: { pos: [1.22, 3.02, -0.8] }, glide: 1.6 },
    ],
  },
  {
    id: 'etape-11', step: 11, num: 'Étape 11 / 15', title: 'Placer la chaîne de retenue',
    text: 'Accrochée solidement dans les 2 crochets fermés',
    voix: 'Étape 11. Place la chaîne de retenue des tiges. Accroche-la solidement dans les 2 crochets fermés, de chaque côté du support.',
    shots: [
      { t: 0, pos: [-2.2, 1.75, 2.6], tgt: [0, 1.6, 0], to: { pos: [-1.8, 1.75, 2.2] }, cut: true },
      { t: 5.6, pos: [1.6, 1.92, 0.4], tgt: [0.87, 1.76, -0.3], to: { pos: [1.45, 1.87, 0.28] }, cut: true },
    ],
  },
  {
    id: 'etape-12', step: 12, num: 'Étape 12 / 15', title: 'Ajuster la chaîne',
    text: 'Si les tiges chutent vers un travailleur : jamais plus de 80°',
    voix: 'Étape 12. Ajuste la chaîne pour que les tiges ne puissent pas dépasser 80 degrés si elles chutent vers un travailleur.',
    anim: { delay: 3200, dur: 6000 },
    shots: [{ t: 0, pos: [4.6, 1.6, 0.3], tgt: [0.9, 1.45, 0.12], to: { pos: [4.1, 1.58, 0.3] }, cut: true }],
  },
  {
    id: 'etape-13', step: 13, num: 'Étape 13 / 15', title: 'La chaîne, en tout temps',
    text: 'Crochets : 66 à 72 po du sol · chaîne : jamais à moins de 5 pi du sol au centre',
    voix: "Étape 13. La chaîne de retenue est utilisée en tout temps, sauf pendant l'ajout et le retrait des tiges en continu. Les crochets sont à 66 pouces au minimum, et à 72 pouces au maximum du sol. Ainsi, même lousse, la chaîne n'est jamais à moins de 5 pieds du sol au centre.",
    reveal: [{ t: 0, tags: [] }, { t: 8.7, tags: ['crochets'] }, { t: 15.6, tags: ['g5'] }],
    inset: { page: 'P09', crop: [0.36, 0.565, 0.89, 0.9], w: 360, from: 17.5, to: 23.6, caption: 'Marques à 5 pieds du sol (procédure, page 3)' },
    shots: [
      { t: 0, pos: [-1.9, 1.72, 2.6], tgt: [0, 1.6, 0.1], to: { pos: [-1.2, 1.7, 2.1] }, cut: true },
      { t: 8.7, pos: [4.0, 1.3, 2.7], tgt: [1.0, 0.85, -0.1], to: { pos: [3.7, 1.3, 2.5] }, cut: true },
      { t: 15.6, pos: [-3.0, 1.45, 2.9], tgt: [-0.25, 1.2, 0.1], to: { pos: [-2.6, 1.45, 2.5] }, cut: true },
    ],
  },
  {
    id: 'etape-14', step: 14, num: 'Étape 14 / 15', title: 'Prendre les tiges',
    text: 'Tiges graissées : un tournevis plat pour les séparer',
    voix: "Étape 14. Quand tu prends les tiges, la graisse peut les rendre difficiles à saisir. Sers-toi d'un tournevis plat pour les séparer et t'aider à les prendre.",
    inset: { page: 'P10', crop: [0.37, 0.17, 0.685, 0.49], w: 270, from: 5.2, to: 12, caption: 'Procédure, page 4' },
    shots: [{ t: 0, pos: [-0.75, 1.52, 1.4], tgt: [-0.05, 1.33, 0.3], to: { pos: [-0.45, 1.45, 0.98] }, cut: true }],
  },
  {
    id: 'etape-15', step: 15, num: 'Étape 15 / 15', title: 'Capacité maximale',
    text: 'Selon la résistance du support',
    voix: 'Étape 15. Respecte la capacité maximale du support : 108 tiges HQ, 184 tiges NQ, ou 240 tiges BQ.',
    card: { from: 2.6, to: 10.8, title: 'Capacité maximale du support', rows: [
      { t: 0.6, cells: ['HQ', '108 tiges', '324 m'] },
      { t: 2.6, cells: ['NQ', '184 tiges', '552 m'] },
      { t: 4.6, cells: ['BQ', '240 tiges', '720 m'] },
    ] },
    shots: [
      { t: 0, pos: [0, 9.5, 0.9], tgt: [0, 2.9, -0.3], fov: 14, cut: true },
      { t: 6.2, pos: [-2.9, 1.95, 4.1], tgt: [0, 1.35, 0], to: { pos: [-2.4, 1.85, 3.5] }, cut: true },
    ],
  },
  {
    id: 'fin', step: 5, still: true, num: 'À retenir', title: 'Incliné, ancré, retenu', text: '',
    voix: "À retenir. Le support est incliné entre 75 et 80 degrés, et ancré par une chaîne serrée au maximum. Les tiges sont en quinconce, appuyées sur la barre du fond. Et la chaîne de retenue est utilisée en tout temps, sauf pendant l'ajout et le retrait des tiges en continu.",
    cues: [{ t: 5.4, step: 8 }, { t: 9, step: 10 }, { t: 13.6, step: null }],
    card: { from: 0.8, to: 99, title: 'À retenir', rows: [
      { t: 0.5, cells: ['1', 'Support incliné : 75° à 80°'] },
      { t: 4.8, cells: ['2', 'Ancré : chaîne serrée au maximum'] },
      { t: 8.4, cells: ['3', 'Tiges en quinconce, appuyées au fond'] },
      { t: 13, cells: ['4', 'Chaîne de retenue en tout temps'] },
    ] },
    shots: [
      { t: 0, pos: [3.5, 1.05, -0.25], tgt: [0.9, 0.9, -0.3], to: { pos: [3.2, 1.03, -0.25] }, cut: true },
      { t: 5.4, pos: [-1.5, 2.0, 1.5], tgt: [0, 1.78, -0.62], to: { pos: [-1.25, 1.96, 1.25] }, cut: true },
      { t: 9, pos: [0.25, 3.3, -0.95], tgt: [0, 2.45, -0.35], to: { pos: [-0.2, 3.25, -0.95] }, cut: true },
      { t: 13.6, pos: [-1.9, 1.75, 2.7], tgt: [0, 1.5, 0.1], to: { pos: [-2.9, 2.0, 4.4], tgt: [0, 1.3, -0.1] }, cut: true },
    ],
  },
];

// Durée minimale à l'écran (s) : animations d'étape (pose des 184 tiges) et temps de lecture des repères.
const MIN = { 'etape-05': 9, 'etape-09': 17, 'etape-12': 11.5, 'etape-15': 11 };
const words = (s) => s.split(/\s+/).filter(Boolean).length;
/** Durée d'un passage : débit de 2,4 mots par seconde, plus une respiration. */
const dur = (voix, min = 0) => Math.max(min, Math.ceil((words(voix) / 2.4 + 1.6) * 2) / 2);

/** Passages de la vidéo, dans l'ordre, avec leur début et leur durée (s). */
export function timeline() {
  let t = 0;
  return PASSAGES.map((p) => {
    const s = { ...p, start: t, dur: dur(p.voix, MIN[p.id] || 0) };
    t += s.dur;
    return s;
  });
}

const FOV = 38; // angle de champ de la visionneuse (degrés) ; un plan peut le resserrer (fov)
const lerp = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
const smooth = (u) => u * u * (3 - 2 * u);
/** Caméra d'un plan à l'instant t : dérive régulière du début à la fin du plan. */
function drift(shot, end, t) {
  const u = Math.min(1, Math.max(0, (t - shot.t) / Math.max(0.001, end - shot.t)));
  const to = shot.to || shot;
  const f0 = shot.fov || FOV, f1 = to.fov || f0;
  return { pos: lerp(shot.pos, to.pos || shot.pos, u), tgt: lerp(shot.tgt, to.tgt || shot.tgt, u), fov: f0 + (f1 - f0) * u };
}

/** Indice du plan en cours à l'instant t du passage. */
const shotIndex = (seg, t) => {
  let k = 0;
  while (k + 1 < seg.shots.length && seg.shots[k + 1].t <= t) k++;
  return k;
};
/** Plan en cours à l'instant t du passage. */
export const shotAt = (seg, t) => seg.shots[shotIndex(seg, t)];

/** Caméra { pos, tgt, fov } du passage i à l'instant t (secondes depuis le début du passage). */
export function cameraAt(segs, i, t) {
  const seg = segs[i], shots = seg.shots, k = shotIndex(seg, t);
  const s = shots[k], end = k + 1 < shots.length ? shots[k + 1].t : seg.dur;
  const cur = drift(s, end, t);
  if (s.cut || (k === 0 && i === 0)) return cur;
  // Glissement depuis la fin du plan précédent (du passage précédent pour le premier plan).
  const g = s.glide ?? 1.4;
  if (t - s.t >= g) return cur;
  const prev = k > 0 ? drift(shots[k - 1], s.t, s.t) : cameraAt(segs, i - 1, segs[i - 1].dur);
  const u = smooth((t - s.t) / g);
  return { pos: lerp(prev.pos, cur.pos, u), tgt: lerp(prev.tgt, cur.tgt, u), fov: prev.fov + (cur.fov - prev.fov) * u };
}

/** Étape du montage affichée à l'instant t du passage (rappels : cues). */
export function stepAt(seg, t) {
  let step = seg.step;
  for (const c of seg.cues || []) if (t >= c.t) step = c.step;
  return step;
}

/** Thèmes de repères affichés à l'instant t du passage (null : tous, comme sur le site). */
export function tagsAt(seg, t) {
  let tags = null;
  for (const r of seg.reveal || []) if (t >= r.t) tags = r.tags;
  return tags;
}
