// Carte 3D de la place de travail (forage au diamant sous terre), à parcourir
// à la 1re ou à la 3e personne : adresse #plancher-dd.carte, carte en tête de
// la page de l'équipement et bouton du dock. Le jeu (src/ui/features/carte/)
// reprend le plancher de la procédure PRO-DD-ST-003 et la tournée d'inspection
// du formulaire MA4657078.
import './carte.css';
import { lancer } from './carte/jeu.js';

const ID = 'carte';
const EQ = 'plancher-dd';

export default {
  id: ID,
  order: 130,
  init(ctx) {
    // Carte en tête de la page de l'équipement.
    const card = document.createElement('section');
    card.className = 'card-box carte-accueil';
    card.hidden = true;
    card.innerHTML = `
      <div class="carte-accueil-texte">
        <h3>Carte 3D de la place de travail</h3>
        <p>Marchez dans la mine à la 1<sup>re</sup> ou à la 3<sup>e</sup> personne : galerie, plancher 16 × 32 pi,
        foreuse, refuge et ventilation, minicarte et itinéraire. Tournée d’inspection du formulaire
        MA4657078 « Forage au diamant sous-terre ».</p>
      </div>
      <button type="button" class="btn primary" data-go="${ID}">Entrer dans la mine</button>`;
    ctx.ui.equipmentHomeTop.prepend(card);
    ctx.on('equipment', ({ id }) => { card.hidden = id !== EQ; });

    const outil = ctx.ui.addTool({
      id: ID, label: 'Carte 3D', title: 'Carte 3D de la place de travail (1re et 3e personne)', icon: 'cube', rank: 85,
      onClick: () => ctx.go(ID),
    });
    outil.hidden = true;
    ctx.on('view', () => { outil.hidden = ctx.equipment?.id !== EQ; });

    let jeu = null;
    const arreter = () => { jeu?.dispose(); jeu = null; };
    ctx.ui.onEscape(() => !!jeu?.echap(), 90);
    ctx.registerRoute(ID, () => {
      if (ctx.equipment?.id !== EQ) { ctx.go(`#${EQ}.${ID}`); return; }
      arreter();
      const el = document.createElement('div');
      ctx.ui.showPage('Carte 3D — forage au diamant sous terre', el, { icon: 'cube', repli: 'apercu', onClose: arreter });
      try {
        jeu = lancer(el, { toast: ctx.toast });
      } catch (err) {
        console.error(err);
        el.innerHTML = '<p class="carte-erreur">La carte 3D n’a pas pu démarrer (WebGL indisponible ?).</p>';
      }
    });
  },
};
