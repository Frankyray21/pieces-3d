// Carte de travail MA4657078 en 3D (carte-forage-dd) : la carte se manipule
// comme à la main.
//  - Saisir la couverture par son bord libre et la tirer : la page tourne sur
//    le pli en suivant le pointeur et se courbe selon la vitesse ; relâchée,
//    elle se pose ouverte ou fermée (le plus proche, ou dans le sens du geste).
//  - Saisir la carte ailleurs : elle tourne (glisser de côté) et s'incline
//    (glisser de haut en bas) autour de son centre, comme tenue dans la main.
//  - Boutons du dock : Lire (la carte tenue devant soi, plein écran :
//    carte-forage/lecture.js, adresse #carte-forage-dd.lire), Ouvrir / Fermer
//    (page tournée), Retourner (demi-tour), Redresser (carte remise droite).
// Un toucher sans glisser sélectionne la pièce, comme ailleurs sur le site ;
// glisser hors de la carte fait tourner la vue, comme d'habitude.
import * as THREE from 'three';
import { poser, ANGLE, VOLET } from '../../models/carte-forage-dd/index.js';
import { lire } from './carte-forage/lecture.js';
import './carte-forage.css';

const EQ = 'carte-forage-dd';
const DUREE_PAGE = 1100, DUREE_RETOURNER = 1200, DUREE_POSE = 450, DUREE_REDRESSER = 700; // ms
const SEUIL = 4; // px avant qu'un appui devienne un geste

const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // accélère puis ralentit
const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const AXE_Y = new THREE.Vector3(0, 1, 0);

export default {
  id: 'carte-forage',
  order: 120,
  init(ctx) {
    const bLire = ctx.ui.addTool({
      id: 'carte-lire', label: 'Lire', title: 'Lire la carte : tenue devant soi, en plein écran', icon: 'page', rank: 11,
      onClick: () => ctx.go('lire'),
    });
    const bPage = ctx.ui.addTool({
      id: 'carte-page', label: 'Ouvrir', title: 'Tourner la page : ouvrir ou fermer la carte (ou tirer la couverture)', icon: 'page', rank: 12,
      onClick: () => tournerPage(),
    });
    const bRetourner = ctx.ui.addTool({
      id: 'carte-retourner', label: 'Retourner', title: 'Retourner la carte pour voir l’autre face', icon: 'cube', rank: 13,
      onClick: () => retourner(),
    });
    const bRedresser = ctx.ui.addTool({
      id: 'carte-redresser', label: 'Redresser', title: 'Remettre la carte droite, face à soi', icon: 'accueil', rank: 14,
      onClick: () => redresser(),
    });
    const boutons = [bLire, bPage, bRetourner, bRedresser];
    for (const b of boutons) b.hidden = true;

    let carte = null; // { root, pli, arriere }
    let anim = 0;
    const libelle = (b, t) => { const s = b.querySelector('span'); if (s) s.textContent = t; };
    const fermee = () => carte.pli.rotation.y > Math.PI / 2;
    const majBoutons = () => { if (carte) { libelle(bPage, fermee() ? 'Ouvrir' : 'Fermer'); ouverteVue = !fermee(); } };

    function arreter() {
      cancelAnimationFrame(anim);
      anim = 0;
      for (const b of boutons) b.disabled = false;
    }

    /** Joue une animation : etape(p) avec p de 0 à 1, puis fin(). */
    function jouer(duree, etape, fin, { recadrer = true } = {}) {
      arreter();
      for (const b of boutons) b.disabled = true;
      const t0 = performance.now();
      const d = reduit() ? 1 : duree;
      const tic = (t) => {
        const p = Math.min(1, (t - t0) / d);
        etape(p);
        ctx.viewer.invalidate();
        if (p < 1) anim = requestAnimationFrame(tic);
        else { arreter(); fin?.(); if (recadrer) ctx.viewer.frame(); }
      };
      anim = requestAnimationFrame(tic);
    }

    /** Couverture vers un angle, en se courbant dans le sens du mouvement. */
    function amenerPage(a1, duree, courbure0 = 0) {
      const a0 = carte.pli.rotation.y;
      const sens = Math.sign(a1 - a0);
      jouer(duree, (p) => {
        const c = courbure0 * (1 - p) + sens * Math.sin(Math.PI * p) * Math.min(1, Math.abs(a1 - a0) / 1.5);
        poser(carte.pli, a0 + (a1 - a0) * doux(p), clamp(c, -1, 1));
      }, majBoutons);
    }

    function tournerPage() {
      if (!carte) return;
      amenerPage(fermee() ? ANGLE.ouverte : ANGLE.fermee, DUREE_PAGE);
    }

    /** Centre de la carte, dans la scène. */
    const centre = () => {
      carte.root.updateMatrixWorld(true);
      return new THREE.Box3().setFromObject(carte.root).getCenter(new THREE.Vector3());
    };
    /** Tourne la carte de l'angle a autour d'un axe (de la scène) passant par c. */
    function pivoter(axe, a, c) {
      const { root } = carte;
      const q = new THREE.Quaternion().setFromAxisAngle(axe, a);
      root.quaternion.premultiply(q);
      root.position.sub(c).applyQuaternion(q).add(c);
    }

    function retourner() {
      if (!carte) return;
      const { root } = carte;
      const c = centre();
      const q0 = root.quaternion.clone(), p0 = root.position.clone();
      jouer(DUREE_RETOURNER, (p) => {
        root.quaternion.copy(q0);
        root.position.copy(p0);
        pivoter(AXE_Y, Math.PI * doux(p), c);
        // Soulevée un peu pendant le geste, comme une carte qu'on retourne dans la main.
        root.position.y += 0.03 * Math.sin(Math.PI * p);
      });
    }

    function redresser() {
      if (!carte) return;
      const { root } = carte;
      const q0 = root.quaternion.clone(), p0 = root.position.clone();
      const q1 = new THREE.Quaternion(), p1 = new THREE.Vector3();
      jouer(DUREE_REDRESSER, (p) => {
        const k = doux(p);
        root.quaternion.slerpQuaternions(q0, q1, k);
        root.position.lerpVectors(p0, p1, k);
      });
    }

    // ---------------------------------------------------------------- saisie à la main

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let geste = null;

    /** Volet sous le pointeur : 'page' (couverture), 'carte' (volet arrière) ou null. */
    function saisi(e) {
      const canvas = ctx.viewer.canvas, cam = ctx.viewer.camera;
      if (!carte || !canvas || !cam) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const couverture = carte.pli.userData.couverture;
      const h = ray.intersectObjects([couverture, carte.arriere], true)[0];
      if (!h) return null;
      const surCouverture = h.object.parent === couverture;
      // Comme à la main : on tourne la page par son bord libre (les 45 % de la largeur
      // les plus loin du pli) ; ailleurs, on tient la carte entière.
      let s = 0;
      if (surCouverture) s = VOLET.w / 2 - couverture.worldToLocal(h.point.clone()).x;
      const page = surCouverture && s > VOLET.w * 0.55;
      return { quoi: page ? 'page' : 'carte', point: h.point, ref: surCouverture ? '1' : '2', s };
    }

    /** Point de la couverture à la distance s du pli, à l'angle a, projeté à l'écran (px). */
    function ecranPage(a, s) {
      const { pli, root } = carte;
      const v = new THREE.Vector3(-s * Math.cos(a), 0, s * Math.sin(a)).add(pli.position);
      root.updateMatrixWorld(true);
      v.applyMatrix4(root.matrixWorld).project(ctx.viewer.camera);
      const r = ctx.viewer.canvas.getBoundingClientRect();
      return [(v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height];
    }

    const surAppui = (e) => {
      if (!carte || e.target !== ctx.viewer.canvas || (e.pointerType === 'mouse' && e.button !== 0) || geste) return;
      const h = saisi(e);
      if (!h) return; // hors de la carte : la vue tourne, comme d'habitude
      // La carte est saisie : la visionneuse ne fait pas tourner la vue.
      e.stopPropagation();
      e.preventDefault();
      arreter();
      ctx.viewer.canvas.setPointerCapture?.(e.pointerId);
      // Distance du point saisi au pli (couverture).
      const s = clamp(h.s, 0.02, VOLET.w);
      geste = { id: e.pointerId, quoi: h.quoi, ref: h.ref, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, bouge: false, s, vit: 0, courbure: 0, t: performance.now(), c: centre() };
    };
    const surDeplacement = (e) => {
      if (!geste || e.pointerId !== geste.id) return;
      e.stopPropagation();
      const dx = e.clientX - geste.x, dy = e.clientY - geste.y;
      if (!geste.bouge && Math.hypot(e.clientX - geste.x0, e.clientY - geste.y0) < SEUIL) return;
      if (!geste.bouge) ctx.viewer.canvas.style.cursor = 'grabbing';
      geste.bouge = true;
      geste.x = e.clientX; geste.y = e.clientY;
      const now = performance.now(), dt = Math.max(1, now - geste.t);
      geste.t = now;
      if (geste.quoi === 'page') {
        // La page suit le pointeur : variation d'angle qui déplace le point saisi
        // d'autant, à l'écran, que le pointeur (dérivée numérique).
        const a = carte.pli.rotation.y, eps = 0.01;
        const [x0, y0] = ecranPage(a, geste.s), [x1, y1] = ecranPage(a + eps, geste.s);
        const jx = x1 - x0, jy = y1 - y0, j2 = jx * jx + jy * jy;
        const da = j2 > 1e-4 ? clamp(((dx * jx + dy * jy) / j2) * eps, -0.25, 0.25) : 0;
        const a1 = clamp(a + da, 0, ANGLE.fermee);
        // Courbure selon la vitesse angulaire, lissée.
        geste.vit = geste.vit * 0.7 + ((a1 - a) / dt) * 1000 * 0.3;
        geste.courbure = clamp(geste.vit / 4, -1, 1);
        poser(carte.pli, a1, geste.courbure);
      } else {
        // Tourner (glisser de côté) et incliner (glisser de haut en bas) autour du centre.
        const cam = ctx.viewer.camera;
        const droite = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).normalize();
        pivoter(AXE_Y, dx * 0.01, geste.c);
        pivoter(droite, dy * 0.01, geste.c);
      }
      ctx.viewer.invalidate();
    };
    const surRelache = (e) => {
      if (!geste || e.pointerId !== geste.id) return;
      e.stopPropagation();
      const g = geste;
      geste = null;
      if (!g.bouge) {
        // Simple toucher : sélection de la pièce, comme un clic ailleurs sur le site.
        ctx.viewer.select(g.ref);
        return;
      }
      if (g.quoi === 'page') {
        // Relâchée : la page se pose du côté où elle allait (ou du plus proche).
        const a = carte.pli.rotation.y;
        const versFermee = Math.abs(g.vit) > 1.2 ? g.vit > 0 : a > Math.PI / 2;
        amenerPage(versFermee ? ANGLE.fermee : ANGLE.ouverte, DUREE_POSE, g.courbure);
      }
    };
    // Écoute avant la visionneuse (phase de capture) : la carte saisie ne fait pas tourner la vue.
    document.addEventListener('pointerdown', surAppui, true);
    document.addEventListener('pointermove', surDeplacement, true);
    document.addEventListener('pointerup', surRelache, true);
    document.addEventListener('pointercancel', surRelache, true);

    // Curseur : une main au-dessus de la carte.
    document.addEventListener('pointermove', (e) => {
      if (!carte || geste || e.buttons || e.target !== ctx.viewer.canvas) return;
      const h = saisi(e);
      if (h) ctx.viewer.canvas.style.cursor = h.quoi === 'page' ? 'ew-resize' : 'grab';
    });

    // Mode « Lire » : page plein écran liée à l'adresse #carte-forage-dd.lire.
    let lecture = null;
    let ouverteVue = false; // la carte affichée dans la vue 3D est-elle ouverte ?
    ctx.registerRoute('lire', () => {
      if (ctx.equipment?.id !== EQ) { ctx.go(`#${EQ}.lire`); return; }
      lecture?.dispose();
      const el = document.createElement('div');
      ctx.ui.showPage('Lire la carte de travail — MA4657078', el, {
        icon: 'page', repli: 'P01',
        onClose: () => { lecture?.dispose(); lecture = null; },
      });
      try {
        lecture = lire(el, { ouverte: ouverteVue });
      } catch (err) {
        console.error(err);
        el.innerHTML = '<p>La lecture en 3D n\u2019a pas pu démarrer (WebGL indisponible ?).</p>';
      }
    });

    ctx.on('assembly', ({ is3d, model, equipment }) => {
      arreter();
      geste = null;
      carte = null;
      const pli = is3d && equipment?.id === EQ && model ? ctx.viewer.objects('1')[0] : null;
      const arriere = pli ? ctx.viewer.objects('2')[0] : null;
      if (pli?.userData.couverture && arriere) {
        carte = { root: model.root, pli, arriere };
        poser(pli, pli.rotation.y, 0);
        majBoutons();
        ouverteVue = !fermee();
      }
      for (const b of boutons) b.hidden = !carte;
    });
  },
};
