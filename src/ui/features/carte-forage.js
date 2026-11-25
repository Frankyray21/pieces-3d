// Carte de travail MA4657078 en 3D (carte-forage-dd) : animations « tourner la
// page » (la couverture pivote sur le pli et se courbe en tournant) et
// « retourner » (la carte fait un demi-tour sur elle-même pour montrer l'autre
// face). Deux boutons dans le dock de la vue 3D, sur les assemblages P01 et P02.
import * as THREE from 'three';
import { poser, ANGLE } from '../../models/carte-forage-dd/index.js';

const EQ = 'carte-forage-dd';
const DUREE_PAGE = 1100, DUREE_RETOURNER = 1200; // ms

const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // accélère puis ralentit
const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default {
  id: 'carte-forage',
  order: 120,
  init(ctx) {
    const bPage = ctx.ui.addTool({
      id: 'carte-page', label: 'Ouvrir', title: 'Tourner la page : ouvrir ou fermer la carte', icon: 'page', rank: 12,
      onClick: () => tournerPage(),
    });
    const bRetourner = ctx.ui.addTool({
      id: 'carte-retourner', label: 'Retourner', title: 'Retourner la carte pour voir l’autre face', icon: 'cube', rank: 13,
      onClick: () => retourner(),
    });
    bPage.hidden = bRetourner.hidden = true;

    let carte = null; // { root, pli }
    let anim = 0;
    const libelle = (b, t) => { const s = b.querySelector('span'); if (s) s.textContent = t; };
    const fermee = () => carte.pli.rotation.y > Math.PI / 2;
    const majBoutons = () => { if (carte) libelle(bPage, fermee() ? 'Ouvrir' : 'Fermer'); };

    function arreter() {
      cancelAnimationFrame(anim);
      anim = 0;
      bPage.disabled = bRetourner.disabled = false;
    }

    /** Joue une animation : etape(p) avec p de 0 à 1, puis fin(). */
    function jouer(duree, etape, fin) {
      arreter();
      bPage.disabled = bRetourner.disabled = true;
      const t0 = performance.now();
      const d = reduit() ? 1 : duree;
      const tic = (t) => {
        const p = Math.min(1, (t - t0) / d);
        etape(p);
        ctx.viewer.invalidate();
        if (p < 1) anim = requestAnimationFrame(tic);
        else { arreter(); fin?.(); ctx.viewer.frame(); }
      };
      anim = requestAnimationFrame(tic);
    }

    function tournerPage() {
      if (!carte) return;
      const a0 = carte.pli.rotation.y;
      const a1 = fermee() ? ANGLE.ouverte : ANGLE.fermee;
      const sens = Math.sign(a1 - a0);
      jouer(DUREE_PAGE, (p) => {
        poser(carte.pli, a0 + (a1 - a0) * doux(p), sens * Math.sin(Math.PI * p));
      }, majBoutons);
    }

    function retourner() {
      if (!carte) return;
      const { root } = carte;
      // Demi-tour autour de l'axe vertical qui passe par le centre de la carte.
      root.updateMatrixWorld(true);
      const c = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
      const p0 = root.position.clone(), r0 = root.rotation.y;
      const v = p0.clone().sub(c);
      jouer(DUREE_RETOURNER, (p) => {
        const phi = Math.PI * doux(p);
        root.rotation.y = r0 + phi;
        const w = v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), phi);
        root.position.copy(c).add(w);
        // Soulevée un peu pendant le geste, comme une carte qu'on retourne dans la main.
        root.position.y += 0.03 * Math.sin(Math.PI * p);
      });
    }

    ctx.on('assembly', ({ is3d, model, equipment }) => {
      arreter();
      carte = null;
      const pli = is3d && equipment?.id === EQ && model ? ctx.viewer.objects('1')[0] : null;
      if (pli?.userData.couverture) {
        carte = { root: model.root, pli };
        poser(pli, pli.rotation.y, 0);
        majBoutons();
      }
      bPage.hidden = bRetourner.hidden = !carte;
    });
  },
};
