// Place de travail en 3D (forage au diamant sous terre), à parcourir à la
// première personne, comme sur place : adresse #plancher-dd.carte, carte en
// tête de la page de l'équipement et bouton du dock. La visite
// (src/ui/features/carte/) reprend le plancher de la procédure PRO-DD-ST-003.
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
        <h3>Place de travail en 3D</h3>
        <p>Parcourez la place de travail à la première personne, comme sur place : galerie, plancher 16 × 32 pi,
        foreuse, barricade, extincteur, refuge et ventilation.</p>
      </div>
      <button type="button" class="btn primary" data-go="${ID}">Visiter en 3D</button>`;
    ctx.ui.equipmentHomeTop.prepend(card);
    ctx.on('equipment', ({ id }) => { card.hidden = id !== EQ; });

    const outil = ctx.ui.addTool({
      id: ID, label: 'Visite 3D', title: 'Place de travail en 3D, à la première personne', icon: 'cube', rank: 85,
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
      ctx.ui.showPage('Place de travail en 3D — forage au diamant sous terre', el, { icon: 'cube', repli: 'apercu', onClose: arreter });
      try {
        jeu = lancer(el);
      } catch (err) {
        console.error(err);
        el.innerHTML = '<p class="carte-erreur">La vue 3D n’a pas pu démarrer (WebGL indisponible ?).</p>';
      }
    });
  },
};
