// Fiche d'inspection MA4657056 en 3D (fiche-inspection-dd) : la feuille se
// manipule comme à la main.
//  - Saisir la feuille et glisser : elle tourne (de côté) et s'incline (de haut
//    en bas) autour de son centre ; glisser hors de la feuille fait tourner la
//    vue, comme d'habitude. Un toucher sans glisser sélectionne la pièce.
//  - Boutons du dock : Retourner (demi-tour pour lire l'autre face) et
//    Redresser (feuille remise droite, face à soi).
import * as THREE from 'three';

const EQ = 'fiche-inspection-dd';
const DUREE_RETOURNER = 1100, DUREE_REDRESSER = 650; // ms
const SEUIL = 4; // px avant qu'un appui devienne un geste
const AXE_Y = new THREE.Vector3(0, 1, 0);
const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default {
  id: 'fiche-inspection',
  order: 121,
  init(ctx) {
    const bRetourner = ctx.ui.addTool({
      id: 'fiche-retourner', label: 'Retourner', title: 'Retourner la fiche pour lire l’autre face', icon: 'cube', rank: 13,
      onClick: () => retourner(),
    });
    const bRedresser = ctx.ui.addTool({
      id: 'fiche-redresser', label: 'Redresser', title: 'Remettre la fiche droite, face à soi', icon: 'accueil', rank: 14,
      onClick: () => redresser(),
    });
    const boutons = [bRetourner, bRedresser];
    for (const b of boutons) b.hidden = true;

    let fiche = null; // { root, obj, q0, p0 }
    let anim = 0;

    function arreter() {
      cancelAnimationFrame(anim);
      anim = 0;
      for (const b of boutons) b.disabled = false;
    }
    function jouer(duree, etape) {
      arreter();
      for (const b of boutons) b.disabled = true;
      const t0 = performance.now(), d = reduit() ? 1 : duree;
      const tic = (t) => {
        const p = Math.min(1, (t - t0) / d);
        etape(p);
        ctx.viewer.invalidate();
        if (p < 1) anim = requestAnimationFrame(tic);
        else { arreter(); ctx.viewer.frame(); }
      };
      anim = requestAnimationFrame(tic);
    }

    const centre = () => {
      fiche.root.updateMatrixWorld(true);
      return new THREE.Box3().setFromObject(fiche.root).getCenter(new THREE.Vector3());
    };
    function pivoter(axe, a, c) {
      const { root } = fiche;
      const q = new THREE.Quaternion().setFromAxisAngle(axe, a);
      root.quaternion.premultiply(q);
      root.position.sub(c).applyQuaternion(q).add(c);
    }

    function retourner() {
      if (!fiche) return;
      const { root } = fiche;
      const c = centre(), q0 = root.quaternion.clone(), p0 = root.position.clone();
      jouer(DUREE_RETOURNER, (p) => {
        root.quaternion.copy(q0);
        root.position.copy(p0);
        pivoter(AXE_Y, Math.PI * doux(p), c);
        root.position.y += 0.02 * Math.sin(Math.PI * p); // soulevée pendant le geste
      });
    }

    function redresser() {
      if (!fiche) return;
      const { root } = fiche;
      const q0 = root.quaternion.clone(), p0 = root.position.clone();
      jouer(DUREE_REDRESSER, (p) => {
        const k = doux(p);
        root.quaternion.slerpQuaternions(q0, fiche.q0, k);
        root.position.lerpVectors(p0, fiche.p0, k);
      });
    }

    // ---------------------------------------------------------------- saisie à la main

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let geste = null;

    function touche(e) {
      const canvas = ctx.viewer.canvas, cam = ctx.viewer.camera;
      if (!fiche || !canvas || !cam) return false;
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      return ray.intersectObject(fiche.obj, true).length > 0;
    }

    document.addEventListener('pointerdown', (e) => {
      if (!fiche || e.target !== ctx.viewer.canvas || (e.pointerType === 'mouse' && e.button !== 0) || geste) return;
      if (!touche(e)) return;
      e.stopPropagation();
      e.preventDefault();
      arreter();
      ctx.viewer.canvas.setPointerCapture?.(e.pointerId);
      geste = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, bouge: false, c: centre() };
    }, true);
    document.addEventListener('pointermove', (e) => {
      if (!geste || e.pointerId !== geste.id) return;
      e.stopPropagation();
      if (!geste.bouge && Math.hypot(e.clientX - geste.x0, e.clientY - geste.y0) < SEUIL) return;
      if (!geste.bouge) ctx.viewer.canvas.style.cursor = 'grabbing';
      geste.bouge = true;
      const dx = e.clientX - geste.x, dy = e.clientY - geste.y;
      geste.x = e.clientX; geste.y = e.clientY;
      const droite = new THREE.Vector3().setFromMatrixColumn(ctx.viewer.camera.matrixWorld, 0).normalize();
      pivoter(AXE_Y, dx * 0.01, geste.c);
      pivoter(droite, dy * 0.01, geste.c);
      ctx.viewer.invalidate();
    }, true);
    const relache = (e) => {
      if (!geste || e.pointerId !== geste.id) return;
      e.stopPropagation();
      const g = geste;
      geste = null;
      if (!g.bouge) ctx.viewer.select('1');
    };
    document.addEventListener('pointerup', relache, true);
    document.addEventListener('pointercancel', relache, true);
    document.addEventListener('pointermove', (e) => {
      if (!fiche || geste || e.buttons || e.target !== ctx.viewer.canvas) return;
      if (touche(e)) ctx.viewer.canvas.style.cursor = 'grab';
    });

    ctx.on('assembly', ({ is3d, model, equipment }) => {
      arreter();
      geste = null;
      fiche = null;
      const obj = is3d && equipment?.id === EQ && model ? ctx.viewer.objects('1')[0] : null;
      if (obj) fiche = { root: model.root, obj, q0: model.root.quaternion.clone(), p0: model.root.position.clone() };
      for (const b of boutons) b.hidden = !fiche;
    });
  },
};
