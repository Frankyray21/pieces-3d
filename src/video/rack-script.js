// Scénario de la vidéo « Installation du support de tiges de forage » :
// un passage par étape de la procédure PRO-DD-ST-008, avec la réplique du
// formateur (voix hors champ). Les titres et les textes à l'écran viennent du
// montage par étapes du modèle (STEPS) ; la voix dit la même chose, tutoyée.
import { STEPS } from '../models/rack-tiges-dd/index.js';

const VOIX = [
  "Avant de commencer. La mine fore les trous de service pour les boulons à œil. Comme travailleur, tu respectes la procédure, surtout la quantité de tiges et l'angle d'empilage dans le support. Le superviseur fait reprendre toute installation non conforme.",
  "Étape 1. Choisis un endroit près du mur, et loin de la ligne de tir des trous de forage.",
  "Étape 2. Au mur, situe le centre du support. Avec la foreuse à percussion électrique, fais un trou de 18 pouces de profond, à environ 5 pieds du plancher.",
  "Étape 3. Insère le boulon à œil, mais ne l'enfonce pas jusqu'au fond du trou.",
  "Étape 4. À deux, soulevez le support, et placez les pattes du haut pour qu'elles soient bien appuyées au mur.",
  "Étape 5. Vérifie l'angle du support : il doit être entre 75 et 80 degrés.",
  "Étape 6. Passe une chaîne dans le boulon à œil, jusqu'à son milieu.",
  "Étape 7. Passe chaque bout de la chaîne dans l'œillet du support qui lui est destiné, de l'extérieur vers l'intérieur.",
  "Étape 8. Relie les deux bouts de chaîne avec un tendeur à cliquet, et serre le tendeur au maximum. Tu peux aussi prendre un tendeur de type bear trap.",
  "Étape 9. Place les tiges dans le support en quinconce, rangée par rangée, en partant de la gauche.",
  "Étape 10. Appuie les tiges sur la barre transversale du fond, et non sur les côtés.",
  "Étape 11. Place la chaîne de retenue des tiges, accrochée solidement dans les 2 crochets fermés, de chaque côté du support.",
  "Étape 12. Ajuste la chaîne pour que les tiges ne puissent pas dépasser 80 degrés si elles chutent vers un travailleur. Les crochets sont à 66 pouces au minimum et à 72 pouces au maximum du sol : même lousse, la chaîne n'est jamais à moins de 5 pieds du sol au centre.",
  "Étape 13. La chaîne de retenue est utilisée en tout temps, sauf pendant l'ajout et le retrait des tiges en continu.",
  "Étape 14. Quand tu prends les tiges, la graisse peut les rendre difficiles à saisir. Sers-toi d'un tournevis plat pour les séparer.",
  "Étape 15. Respecte la capacité maximale du support : 108 tiges HQ, 184 tiges NQ, ou 240 tiges BQ.",
];

// Durée minimale de la pose à l'écran (s) : 184 tiges posées une à une à l'étape 9.
const POSE = { 9: 16 };
const words = (s) => s.split(/\s+/).filter(Boolean).length;
/** Durée d'un passage : débit de 2,4 mots par seconde, plus une respiration. */
const dur = (voix, min = 0) => Math.max(min, Math.ceil((words(voix) / 2.4 + 1.6) * 2) / 2);

/** Passages de la vidéo, dans l'ordre : { id, step, num, title, text, voix, start, dur }. */
export function timeline() {
  const segs = [{
    id: 'titre', step: null, num: 'PRO-DD-ST-008', title: 'Installation du support de tiges de forage',
    text: 'Procédure de travail de Machines Roger International',
    voix: 'Procédure de travail PRO-DD-ST-008 : installation du support de tiges de forage.',
  }];
  STEPS.forEach((s, i) => segs.push({
    id: `etape-${String(i).padStart(2, '0')}`, step: i, num: i === 0 ? 'Avant' : `Étape ${i} / ${STEPS.length - 1}`,
    title: s.title, text: s.text, voix: VOIX[i], min: POSE[i],
  }));
  segs.push({
    id: 'fin', step: null, num: 'À retenir', title: 'Ancré, incliné, retenu',
    text: 'Angle de 75° à 80° · chaîne d’ancrage tendue · tiges en quinconce, appuyées au fond · chaîne de retenue en tout temps',
    voix: "À retenir. Un support incliné entre 75 et 80 degrés, ancré au boulon à œil par une chaîne bien tendue. Des tiges en quinconce, appuyées au fond. Et la chaîne de retenue, en tout temps.",
  });
  let t = 0;
  for (const s of segs) { s.start = t; s.dur = dur(s.voix, s.min || 0); t += s.dur; }
  return segs;
}
