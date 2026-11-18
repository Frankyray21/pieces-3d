// Découpe libre : sur une vue qui la propose (model.view.decoupe, ex. la scie
// alternative tenue à la verticale sur un 3 × 8), on trace le trait de coupe
// en glissant sur la planche, et la scie le suit — droit ou courbe.
//
// La vue fournit la simulation (src/models/makita-djr183/decoupe.js) :
//   surface   : plan du dessus de la planche { y, x0, x1, z0, z1 } (mètres) où le tracé commence ;
//   apercu(points), couper(points) → { ok, message }, exemple(), neuve() ;
//   avancer(dt) → vrai tant que la scène bouge ; occupe(), message().
// Les points sont ceux du plan du dessus, [x, z] en mètres.
//
// Tant que « Tracer » est enfoncé, glisser sur la planche trace au lieu de
// tourner la vue ; ailleurs dans la scène, la souris tourne la vue comme d'habitude.
import * as THREE from 'three';
import './decoupe.css';

const AIDE = 'Glissez sur le bout de la planche qui dépasse des cales pour tracer la coupe, en partant d\'un bord : la scie, tenue à la verticale, suit le trait, droit ou courbe.';

export default {
  id: 'decoupe',
  order: 130,

  init(ctx) {
    const stage = ctx.ui.stage;
    const bar = document.createElement('div');
    bar.className = 'decoupe-bar';
    bar.hidden = true;
    bar.innerHTML = `
      <div class="decoupe-head">
        <strong>Découpe libre</strong>
        <button type="button" class="tbtn" data-decoupe="tracer" aria-pressed="true" title="Glisser sur la planche trace la coupe (sinon : tourne la vue)">Tracer</button>
        <button type="button" class="tbtn" data-decoupe="exemple" title="Montrer une coupe : en S, coin arrondi, puis en biais">Exemple de coupe</button>
        <button type="button" class="tbtn" data-decoupe="neuve" title="Remettre une planche entière">Nouvelle planche</button>
      </div>
      <p class="decoupe-text" role="status" aria-live="polite"></p>
      <p class="decoupe-note"></p>`;
    stage.appendChild(bar);
    const texte = bar.querySelector('.decoupe-text'), note = bar.querySelector('.decoupe-note');
    const bTracer = bar.querySelector('[data-decoupe="tracer"]');

    let sim = null; // simulation de la vue affichée
    let tracer = true;
    let trait = null; // tracé en cours [[x, z], ...]
    let boucle = 0, dernier = 0;
    const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dire = (t) => { texte.textContent = t || AIDE; };
    const afficher = () => {
      bar.hidden = !sim;
      stage.classList.toggle('decoupe-on', !!sim);
      stage.classList.toggle('decoupe-trace', !!sim && tracer);
      ctx.ui.setInsets('decoupe', sim ? bar : null);
      if (sim) {
        dire(sim.message());
        note.textContent = `Rayon mini du trait : environ ${sim.rayon} mm (le trait est lissé). Un trait qui traverse détache un morceau ; un trait qui s'arrête dans le bois laisse une entaille.`;
      }
    };

    /** Fait vivre la scène tant qu'elle bouge (coupe, chute des morceaux, sciure). */
    const animer = () => {
      if (!sim) return;
      if (reduit()) {
        // Animations réduites : le résultat de la coupe, sans le mouvement.
        for (let i = 0; i < 4000 && sim.avancer(0.05); i++);
        ctx.viewer.invalidate();
        dire(sim.message());
        return;
      }
      if (boucle) return;
      dernier = performance.now();
      const moi = sim;
      const pas = (now) => {
        boucle = 0;
        if (sim !== moi) return;
        const dt = Math.min(0.1, (now - dernier) / 1000); // appareil lent : la scène ralentit plutôt que de sauter
        dernier = now;
        const bouge = sim.avancer(dt);
        ctx.viewer.invalidate();
        if (!sim.occupe()) dire(sim.message());
        if (bouge) boucle = requestAnimationFrame(pas);
      };
      boucle = requestAnimationFrame(pas);
    };

    // Point du plan du dessus de la planche sous le pointeur ([x, z] en mètres), ou null.
    const rayon = new THREE.Raycaster(), ecran = new THREE.Vector2();
    const viser = (e) => {
      const canvas = ctx.viewer.canvas, camera = ctx.viewer.camera;
      if (!canvas || !camera) return null;
      const r = canvas.getBoundingClientRect();
      ecran.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      rayon.setFromCamera(ecran, camera);
      const { origin, direction } = rayon.ray;
      if (Math.abs(direction.y) < 1e-6) return null;
      const t = (sim.surface.y - origin.y) / direction.y;
      return t > 0 ? [origin.x + direction.x * t, origin.z + direction.z * t] : null;
    };
    const surPlanche = ([x, z]) => { const s = sim.surface; return x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1; };

    const bouger = (e) => {
      if (!trait || !sim) return;
      const p = viser(e);
      if (!p) return;
      const d = trait[trait.length - 1];
      if (Math.hypot(p[0] - d[0], p[1] - d[1]) < 0.002) return;
      trait.push(p);
      sim.apercu(trait);
      ctx.viewer.invalidate();
    };
    const finir = (e) => {
      window.removeEventListener('pointermove', bouger);
      window.removeEventListener('pointerup', finir);
      window.removeEventListener('pointercancel', finir);
      const t = trait;
      trait = null;
      if (!sim || !t) return;
      if (e.type === 'pointercancel') { sim.apercu(null); ctx.viewer.invalidate(); return; }
      const res = sim.couper(t);
      dire(res.message);
      ctx.viewer.invalidate();
      if (res.ok) animer();
    };
    // En phase de capture, avant la toile : un appui sur la planche commence le tracé au lieu de tourner la vue.
    stage.addEventListener('pointerdown', (e) => {
      if (!sim || !tracer || trait || sim.occupe() || e.button !== 0 || !e.isPrimary || e.target !== ctx.viewer.canvas) return;
      const p = viser(e);
      if (!p || !surPlanche(p)) return;
      e.stopPropagation();
      e.preventDefault();
      trait = [p];
      dire('Tracez… relâchez pour lancer la coupe.');
      window.addEventListener('pointermove', bouger);
      window.addEventListener('pointerup', finir);
      window.addEventListener('pointercancel', finir);
    }, true);

    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-decoupe]');
      if (!b || !sim) return;
      const act = b.dataset.decoupe;
      if (act === 'tracer') {
        tracer = !tracer;
        bTracer.setAttribute('aria-pressed', String(tracer));
        stage.classList.toggle('decoupe-trace', tracer);
      } else if (act === 'exemple') {
        if (sim.occupe()) return;
        const res = sim.exemple();
        dire(res.message);
        if (res.ok) animer();
      } else if (act === 'neuve') {
        sim.neuve();
        dire('');
        ctx.viewer.invalidate();
      }
    });

    const quitter = () => {
      if (boucle) cancelAnimationFrame(boucle);
      boucle = 0;
      trait = null;
      sim = null;
      afficher();
    };
    ctx.on('view', (v) => { if (v.type !== 'assembly' || !v.is3d) quitter(); });
    ctx.on('assembly', ({ model, is3d }) => {
      quitter();
      sim = (is3d && model?.view?.decoupe) || null;
      afficher();
    });
  },
};
