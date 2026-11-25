// Mode « Lire » de la carte de travail MA4657078 : la carte vient devant soi,
// tenue comme dans les mains (vue à la première personne, légèrement inclinée,
// fond assombri), assez grande pour lire le texte. On tourne la page, on la
// retourne, on rapproche une partie, puis on la referme.
//
// Commandes : ← → tourner la page · R retourner · molette, pincement ou + − :
// rapprocher · toucher le texte : rapprocher à cet endroit (encore : revenir) ·
// glisser : examiner la carte (de près : se déplacer sur la carte) · Échap ou
// Retour : fermer.
import * as THREE from 'three';
import { buildProcedural } from '../../../viewer/assembly.js';
import modeles, { poser, ANGLE, VOLET } from '../../../models/carte-forage-dd/index.js';

const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TACTILE = matchMedia('(pointer: coarse)').matches;

/** Ce qu'on a sous les yeux, selon la page (ouverte ou fermée) et le côté. */
function nomVue(ouverte, retournee) {
  if (!ouverte) return retournee ? 'Dos — description du travail, rapport journalier, types de risques' : 'Couverture — date, quart, foreuse, tâches à accomplir';
  return retournee ? 'Extérieur déplié — description du travail et couverture' : 'Intérieur — inspection, planification, décision';
}

/**
 * Ouvre la lecture dans l'élément el (vidé). ouverte : la carte arrive ouverte.
 * Retourne { dispose() }.
 */
export function lire(el, { ouverte = false } = {}) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.classList.add('cf-lire');
  el.innerHTML = `
    <canvas class="cf-lire-vue" tabindex="0" aria-label="Carte de travail tenue devant soi"></canvas>
    <p class="cf-lire-titre" aria-live="polite"></p>
    <div class="cf-lire-barre" role="toolbar" aria-label="Commandes de lecture">
      <button type="button" class="btn" data-a="prec" title="Page précédente (flèche gauche)" aria-label="Page précédente">◀<span class="cf-mot"> Page</span></button>
      <button type="button" class="btn" data-a="suiv" title="Page suivante (flèche droite)" aria-label="Page suivante"><span class="cf-mot">Page </span>▶</button>
      <button type="button" class="btn" data-a="retourner" title="Retourner la carte (R)">Retourner</button>
      <button type="button" class="btn" data-a="plus" title="Rapprocher (+ ou molette)" aria-label="Rapprocher">+</button>
      <button type="button" class="btn" data-a="moins" title="Éloigner (− ou molette)" aria-label="Éloigner">−</button>
    </div>
    <p class="cf-lire-aide">${TACTILE
      ? 'Toucher le texte : rapprocher · pincer : zoomer · glisser : examiner ou se déplacer'
      : '<kbd>←</kbd> <kbd>→</kbd> tourner la page · <kbd>R</kbd> retourner · clic sur le texte ou molette : rapprocher · glisser : examiner · <kbd>Échap</kbd> fermer'}</p>`;
  const $ = (s) => el.querySelector(s);
  const canvas = $('.cf-lire-vue');

  // ---------------------------------------------------------------- scène

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x50483e, 1.5));
  const lumiere = new THREE.DirectionalLight(0xfff3e0, 1.5);
  lumiere.position.set(-0.4, 0.8, 1);
  scene.add(lumiere);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 10);

  // Carte : support (tenue, balancement) → retourneur (demi-tour) → centreur → modèle.
  const modele = buildProcedural(modeles, ouverte ? 'P02' : 'P01');
  const pli = modele.root.children.find((o) => o.userData.partRef === '1');
  const support = new THREE.Group(), retourneur = new THREE.Group(), centreur = new THREE.Group();
  modele.root.position.y = -VOLET.h / 2; // le modèle a le bas de la carte à y = 0
  centreur.add(modele.root);
  retourneur.add(centreur);
  support.add(retourneur);
  scene.add(support);

  const etat = {
    angle: ouverte ? ANGLE.ouverte : ANGLE.fermee,
    cote: 0, // 0 : recto, π : retournée
    zoom: 1, pan: new THREE.Vector2(), // zoom et point visé (dans le plan de la carte)
    examen: new THREE.Vector2(), // inclinaison donnée à la main (glisser, au zoom 1)
    occupe: false, t: 0,
  };
  const ouverteMaintenant = () => etat.angle < Math.PI / 2;

  /** Centre la carte : fermée, elle occupe x de 0 à w ; ouverte, de −w à w. */
  function poserCarte(courbure = 0) {
    poser(pli, etat.angle, courbure);
    const o = clamp((ANGLE.fermee - etat.angle) / (ANGLE.fermee - ANGLE.ouverte), 0, 1);
    centreur.position.x = -(VOLET.w / 2) * (1 - o);
    retourneur.rotation.y = etat.cote;
  }

  // ---------------------------------------------------------------- caméra

  let distance = 0.6, decalage = 0;
  /**
   * Distance qui fait tenir la carte ouverte (ou fermée) dans l'espace libre entre
   * le titre et les commandes, et décalage vertical qui l'y centre.
   */
  function cadrer() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    const r = el.getBoundingClientRect();
    const titre = $('.cf-lire-titre').getBoundingClientRect(), barre = $('.cf-lire-barre').getBoundingClientRect();
    const haut = Math.max(0, titre.bottom - r.top) + 10, bas = Math.max(0, r.bottom - barre.top) + 10;
    const libre = Math.max(h * 0.4, h - haut - bas);
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const larg = (ouverteMaintenant() ? 2 : 1) * VOLET.w * 1.06;
    distance = Math.max((VOLET.h * 1.04 * h) / (2 * t * libre), larg / (2 * t * (w / h)));
    // Centre de l'espace libre, en mètres dans le plan de la carte (vers le haut : positif).
    decalage = ((bas - haut) / 2) * ((2 * distance * t) / h);
  }
  const vise = new THREE.Vector3();
  function placerCamera(dt) {
    const k = dt == null ? 1 : 1 - Math.exp(-dt * 9);
    const d = distance / etat.zoom;
    // Au zoom 1, la carte est au milieu de l'espace libre ; de près, au point visé.
    vise.set(etat.pan.x, etat.pan.y - decalage / etat.zoom, 0);
    const cible = new THREE.Vector3(vise.x, vise.y, d);
    camera.position.lerp(cible, k);
    camera.lookAt(camera.position.x, camera.position.y, 0);
  }

  // ---------------------------------------------------------------- animations

  let tween = null;
  function animer(duree, etape) {
    return new Promise((fin) => {
      const t0 = performance.now(), d = reduit ? 1 : duree;
      tween = (t) => {
        const p = Math.min(1, (t - t0) / d);
        etape(p);
        if (p >= 1) { tween = null; fin(); }
      };
    });
  }
  async function tournerPage(vers = !ouverteMaintenant()) {
    if (etat.occupe || vers === ouverteMaintenant()) return;
    etat.occupe = true;
    const a0 = etat.angle, a1 = vers ? ANGLE.ouverte : ANGLE.fermee, sens = Math.sign(a1 - a0);
    zoomer(1 / etat.zoom); // on reprend la carte entière pour tourner la page
    await animer(1000, (p) => { etat.angle = a0 + (a1 - a0) * doux(p); poserCarte(sens * Math.sin(Math.PI * p)); });
    cadrer();
    etat.occupe = false;
    majTitre();
  }
  async function retourner() {
    if (etat.occupe) return;
    etat.occupe = true;
    zoomer(1 / etat.zoom);
    const c0 = etat.cote, c1 = etat.cote ? 0 : Math.PI;
    await animer(1100, (p) => {
      etat.cote = c0 + (c1 - c0) * doux(p);
      support.position.z = 0.04 * Math.sin(Math.PI * p); // rapprochée pendant le geste
      poserCarte();
    });
    etat.cote = c1;
    etat.occupe = false;
    majTitre();
  }
  /** Page suivante / précédente, comme on feuillette : couverture → intérieur → dos. */
  function suivante() {
    if (!ouverteMaintenant() && !etat.cote) tournerPage(true);
    else if (ouverteMaintenant() && !etat.cote) tournerPage(false).then(retourner);
    else if (etat.cote && ouverteMaintenant()) tournerPage(false);
  }
  function precedente() {
    if (etat.cote && !ouverteMaintenant()) retourner().then(() => tournerPage(true));
    else if (ouverteMaintenant() && !etat.cote) tournerPage(false);
    else if (etat.cote && ouverteMaintenant()) tournerPage(false);
  }

  function majTitre() {
    $('.cf-lire-titre').textContent = nomVue(ouverteMaintenant(), !!etat.cote);
  }

  // ---------------------------------------------------------------- zoom et déplacement

  /** Point de la carte (plan z = 0) sous un point de l'écran. */
  const ray = new THREE.Raycaster();
  const plan = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  function pointSous(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(plan, p) ? p : null;
  }
  function borner() {
    const lx = (ouverteMaintenant() ? VOLET.w : VOLET.w / 2), ly = VOLET.h / 2;
    const k = 1 - 1 / etat.zoom;
    etat.pan.x = clamp(etat.pan.x, -lx * k, lx * k);
    etat.pan.y = clamp(etat.pan.y, -ly * k, ly * k);
  }
  /** Zoom d'un facteur f, vers un point de l'écran (le point reste sous le pointeur). */
  function zoomer(f, cx, cy) {
    const z0 = etat.zoom, z1 = clamp(z0 * f, 1, 5);
    const p = cx != null ? pointSous(cx, cy) : null;
    if (p) {
      const k = 1 - z0 / z1;
      etat.pan.x += (p.x - etat.pan.x) * k;
      etat.pan.y += (p.y - etat.pan.y) * k;
    }
    etat.zoom = z1;
    borner();
  }

  // ---------------------------------------------------------------- commandes

  const surTouche = (e) => {
    if (e.target.closest?.('input, textarea')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); suivante(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); precedente(); }
    else if (k === 'r' || k === 'R') retourner();
    else if (k === '+' || k === '=') zoomer(1.4);
    else if (k === '-' || k === '_') zoomer(1 / 1.4);
    else if (k === '0') zoomer(1 / etat.zoom);
  };
  window.addEventListener('keydown', surTouche);
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'suiv') suivante();
    else if (a === 'prec') precedente();
    else if (a === 'retourner') retourner();
    else if (a === 'plus') zoomer(1.4);
    else if (a === 'moins') zoomer(1 / 1.4);
  });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomer(Math.pow(0.998, e.deltaY), e.clientX, e.clientY); }, { passive: false });

  // Glisser : examiner (incliner la carte dans la main) au zoom 1, se déplacer de près ;
  // toucher sans glisser : rapprocher à cet endroit (ou revenir) ; deux doigts : zoom.
  const doigts = new Map();
  let geste = null;
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture?.(e.pointerId);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (doigts.size === 1) geste = { x0: e.clientX, y0: e.clientY, bouge: 0, ecart: 0 };
    else if (doigts.size === 2) { const [a, b] = [...doigts.values()]; geste = { ...geste, bouge: 99, ecart: Math.hypot(a[0] - b[0], a[1] - b[1]) }; }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!doigts.has(e.pointerId) || !geste) return;
    const [px, py] = doigts.get(e.pointerId);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (doigts.size === 2) {
      const [a, b] = [...doigts.values()];
      const ec = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (geste.ecart) zoomer(ec / geste.ecart, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      geste.ecart = ec;
      return;
    }
    const dx = e.clientX - px, dy = e.clientY - py;
    geste.bouge += Math.abs(dx) + Math.abs(dy);
    if (geste.bouge < 5) return;
    if (etat.zoom > 1.05) {
      const k = (2 * (distance / etat.zoom) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / (canvas.clientHeight || 1);
      etat.pan.x -= dx * k;
      etat.pan.y += dy * k;
      borner();
    } else {
      etat.examen.x = clamp(etat.examen.x + dy * 0.006, -0.7, 0.7);
      etat.examen.y = clamp(etat.examen.y + dx * 0.006, -0.9, 0.9);
    }
  });
  const leve = (e) => {
    if (!doigts.has(e.pointerId)) return;
    doigts.delete(e.pointerId);
    if (doigts.size || !geste) return;
    if (geste.bouge < 5 && e.type === 'pointerup') {
      if (etat.zoom > 1.05) zoomer(1 / etat.zoom);
      else zoomer(2.6, e.clientX, e.clientY);
    }
    geste = null;
  };
  canvas.addEventListener('pointerup', leve);
  canvas.addEventListener('pointercancel', leve);

  // ---------------------------------------------------------------- image

  let raf = 0, avant = performance.now();
  function boucle(t) {
    raf = requestAnimationFrame(boucle);
    const dt = Math.min(0.05, (t - avant) / 1000);
    avant = t;
    etat.t += dt;
    tween?.(t);
    // Tenue dans les mains : légère inclinaison vers soi et léger balancement
    // (immobile de près, pour lire). L'examen revient doucement en place au relâcher.
    if (!geste) etat.examen.multiplyScalar(Math.exp(-dt * 3));
    const vie = reduit || etat.zoom > 1.4 ? 0 : 1;
    support.rotation.x = -0.1 + etat.examen.x + vie * 0.006 * Math.sin(etat.t * 0.9);
    support.rotation.y = etat.examen.y + vie * 0.006 * Math.sin(etat.t * 0.6 + 1);
    support.rotation.z = vie * 0.006 * Math.sin(etat.t * 0.7);
    support.position.y = vie * 0.002 * Math.sin(etat.t * 1.1);
    placerCamera(dt);
    renderer.render(scene, camera);
  }

  function taille() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    cadrer();
  }
  const ro = new ResizeObserver(taille);
  ro.observe(el);
  poserCarte();
  taille();
  placerCamera();
  majTitre();
  canvas.focus({ preventScroll: true });
  raf = requestAnimationFrame(boucle);

  return {
    etat,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', surTouche);
      // Géométries et matériaux de cette copie de la carte ; les textures (pages du
      // PDF) sont partagées avec la vue 3D du site et restent chargées.
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material && !Array.isArray(o.material)) o.material.dispose(); });
      renderer.dispose();
    },
  };
}
