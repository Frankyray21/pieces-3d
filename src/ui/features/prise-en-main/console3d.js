// Console ERIS en 3D, manipulable (figures du manuel de l'utilisateur DU311, pages 121 et 122).
//
// Formes simplifiées d'après les figures : bac orange avec deux blocs porte-manette et pare-chocs noirs, poignée
// avant, boîtier d'écran incliné à coins noirs, bandeau jaune, bouton d'arrêt d'urgence, actionneur du système
// extincteur, interrupteur marche/arrêt sur le côté droit, deux manettes (soufflet, plaque, poignée courbe, tête à
// boutons jaunes, rouges et blanc ; touche Mode sur le côté extérieur de la manette gauche, repère 1 p. 122).
// Dimensions estimées sur les figures (le manuel ne les donne pas), sauf l'écran, volontairement agrandi (avec son
// boîtier, les manettes écartées d'autant) pour que son texte se lise : la lisibilité passe avant les proportions.
//
// L'écran est l'écran ERIS du simulateur (HTML, ecran.js) posé dans le boîtier (CSS3DRenderer) : ses listes se
// touchent comme les boutons correspondants. Interactions : glisser une manette l'incline (fonction de l'axe à
// l'écran), toucher sa tête la recentre ; toucher la touche Mode, l'arrêt d'urgence (tourner pour le relâcher),
// l'interrupteur, l'actionneur de l'extincteur ; glisser ailleurs fait tourner la vue. Les boutons des têtes de
// manette font ce que leur nom indique à l'écran : correspondance relevée sur les vignettes de manette des copies
// d'écran (eris.js, BOUTON) ; le bouton de la couche ou de la fonction active s'allume en orange.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { T, POSITION } from './eris.js';
import { creerCommandes, margeCote } from './commandes3d.js';

const ORANGE = 0xe2531a;
const NOIR = 0x1d1f22;
const ACIER = 0x8a9097;
const INCLINAISON = THREE.MathUtils.degToRad(-24); // boîtier d'écran penché vers l'arrière
const ECRAN = { w: 0.84, h: 0.525, px: 960 }; // écran 16:10 agrandi ; largeur de l'élément HTML en px
const XM = 0.56; // écart des manettes (et de leurs blocs) par rapport à l'axe de la console
const TILT = 0.32; // inclinaison maximale d'une manette (rad)

/** Zone de saisie invisible, plus large que la pièce (manettes fines, utilisation au doigt). */
const PRISE = new THREE.MeshBasicMaterial({ visible: false });
const prise = (geo, cible, parent, cibles, pos = [0, 0, 0]) => {
  const m = new THREE.Mesh(geo, PRISE);
  m.position.set(...pos);
  m.userData.cible = cible;
  parent.add(m);
  cibles.push(m);
  return m;
};

/** Matériau standard. */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...o });

/** Soufflet de manette (profil de révolution en accordéon). */
function soufflet() {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const y = i * 0.0075;
    const r = (i % 2 ? 0.034 : 0.042) - i * 0.0018;
    pts.push(new THREE.Vector2(r, y));
  }
  pts.push(new THREE.Vector2(0.012, 0.078));
  return new THREE.LatheGeometry(pts, 28);
}

/** Une manette : plaque, soufflet, pivot (poignée + tête + boutons). side : 'L' ou 'R'. */
function manette(side, materiaux, cibles) {
  const g = new THREE.Group();
  const plaque = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.012, 0.12, 2, 0.006), materiaux.acier);
  plaque.position.y = 0.006;
  g.add(plaque);
  for (const [x, z] of [[-0.048, -0.048], [0.048, -0.048], [-0.048, 0.048], [0.048, 0.048]]) {
    const v = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 10), materiaux.noir);
    v.position.set(x, 0.013, z);
    g.add(v);
  }
  const s = new THREE.Mesh(soufflet(), materiaux.caoutchouc);
  s.position.y = 0.012;
  g.add(s);

  const pivot = new THREE.Group();
  pivot.position.y = 0.06;
  g.add(pivot);
  // Poignée courbe vers l'opérateur puis vers le haut (figure p. 121).
  const sens = side === 'L' ? 1 : -1;
  const courbe = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.06, 0.004), new THREE.Vector3(0.004 * sens, 0.12, 0.018),
    new THREE.Vector3(0.01 * sens, 0.17, 0.045), new THREE.Vector3(0.012 * sens, 0.2, 0.062),
  ]);
  const poignee = new THREE.Mesh(new THREE.TubeGeometry(courbe, 24, 0.019, 14), materiaux.poignee);
  pivot.add(poignee);
  // Tête à boutons, inclinée vers l'opérateur.
  const tete = new THREE.Group();
  tete.position.set(0.012 * sens, 0.215, 0.07);
  tete.rotation.x = 0.75;
  pivot.add(tete);
  const bloc = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.03, 0.075, 3, 0.012), materiaux.poignee);
  tete.add(bloc);
  // Boutons : colonne jaune à gauche, colonne rouge à droite, bouton blanc en dessous (figures p. 121 et 122).
  // Positions des vignettes de manette de l'écran (eris.js, BOUTON) : HG, HD, MG, MD, B ; le bouton blanc du bas est du
  // côté extérieur sur chaque manette (sous la colonne gauche à gauche, sous la colonne droite à droite).
  const boutons = [
    ['HG', -0.014, -0.022, materiaux.jaune], ['HD', 0.014, -0.022, materiaux.rouge],
    ['MG', -0.014, 0.0, materiaux.jaune], ['MD', 0.014, 0.0, materiaux.rouge],
    ['B', side === 'L' ? -0.01 : 0.01, 0.022, materiaux.blanc],
  ];
  const parPos = {};
  for (const [pos, x, z, m] of boutons) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.008, 18), m.clone());
    b.position.set(x, 0.017, z);
    b.userData.cible = { type: 'bouton', side, pos };
    b.userData.base = m.emissive.getHex();
    b.userData.couleur = m.color.getHex();
    tete.add(b);
    cibles.push(b);
    parPos[pos] = b;
  }
  // Touche Mode : bouton extérieur de la manette gauche (repère 1, p. 122).
  // Bouton du côté extérieur : touche Mode à gauche (repère 1, p. 122) ; à droite, Control, Makeup/Breakout, Drill
  // Lock… selon l'écran (vignettes de manette).
  const mode = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 18), materiaux.mode.clone());
  mode.rotation.z = Math.PI / 2;
  mode.position.set(side === 'L' ? -0.033 : 0.033, 0.004, -0.012);
  mode.userData.cible = { type: 'bouton', side, pos: 'C' };
  mode.userData.couleur = mode.material.color.getHex();
  tete.add(mode);
  cibles.push(mode);
  parPos.C = mode;
  const cm = { type: 'manette', side, nom: side === 'L' ? 'Manette gauche (LX, LY) : glisser pour incliner' : 'Manette droite (RX, RY) : glisser pour incliner' };
  for (const m of [poignee, bloc]) { m.userData.cible = cm; cibles.push(m); }
  prise(new THREE.CapsuleGeometry(0.05, 0.2, 4, 10), cm, pivot, cibles, [0.006 * sens, 0.12, 0.03]);
  return { groupe: g, pivot, boutons: parPos };
}

/** Bandeau jaune sous l'écran (pictogrammes d'arrêt d'urgence et d'extincteur, figure p. 122). */
function bandeau() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#f2c200'; x.fillRect(0, 0, 512, 96);
  x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(3, 3, 506, 90);
  x.beginPath(); x.arc(70, 48, 30, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(52, 38); x.lineTo(88, 38); x.lineTo(70, 66); x.closePath(); x.stroke();
  x.fillStyle = '#111'; x.fillRect(440, 30, 22, 52); x.fillRect(446, 18, 10, 14); x.fillRect(456, 20, 22, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t });
}

/**
 * Crée la console dans `conteneur`. sim : createSim() ; opts.agir(evt) : appelé après une action (pour redessiner
 * le reste de la page) ; opts.info(texte) : nom de la commande survolée ; opts.surCible(cible) : remplace l'action
 * des commandes touchées (découverte de la console) ; opts.plein : élément mis en plein écran (par défaut, la vue) ;
 * opts.reserve() : hauteur en px, en bas de la vue, couverte par des panneaux posés dessus (la console se cadre au-dessus) ;
 * opts.commandes : flèches et étiquettes des manettes posées sur la vue (commandes3d.js), place gardée sur les côtés.
 * Retourne { ecran (élément HTML de l'écran), positionBouton(), recentrer(), recadrer(), arreter() }.
 */
export function creerConsole3D(conteneur, sim, { agir = () => {}, info = () => {}, surCible = null, plein = conteneur, reserve = () => 0, commandes = false } = {}) {
  const materiaux = {
    orange: mat(ORANGE, { roughness: 0.45 }), noir: mat(NOIR, { roughness: 0.8 }), caoutchouc: mat(0x151515, { roughness: 0.9 }),
    poignee: mat(0x202226, { roughness: 0.6 }), acier: mat(ACIER, { metalness: 0.6, roughness: 0.4 }),
    jaune: mat(0xf2c200, { emissive: 0x2a2000 }), rouge: mat(0xd01818, { emissive: 0x200000 }), blanc: mat(0xeeeeee),
    mode: mat(0xf2c200, { emissive: 0x000000 }), vitre: mat(0x0b0c0d, { roughness: 0.2 }),
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 20);
  camera.position.set(0, 0.78, 1.3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'c3-gl';
  const css = new CSS3DRenderer();
  css.domElement.className = 'c3-css';
  conteneur.append(renderer.domElement, css.domElement);
  // Plein écran : API du navigateur, sinon (iPhone) l'élément couvre la fenêtre (classe c3-plein).
  const btnPlein = document.createElement('button');
  btnPlein.type = 'button';
  btnPlein.className = 'btn c3-plein-btn';
  const natif = () => document.fullscreenElement === plein || document.webkitFullscreenElement === plein;
  const estPlein = () => natif() || plein.classList.contains('c3-plein');
  const majPlein = () => {
    btnPlein.textContent = estPlein() ? '✕ Quitter le plein écran' : '⛶ Plein écran';
    btnPlein.setAttribute('aria-pressed', String(estPlein()));
    document.documentElement.classList.toggle('c3-plein-ouvert', plein.classList.contains('c3-plein'));
  };
  const basculer = async () => {
    if (estPlein()) {
      if (natif()) await (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      plein.classList.remove('c3-plein');
    } else {
      const req = plein.requestFullscreen || plein.webkitRequestFullscreen;
      try { if (req) await req.call(plein, { navigationUI: 'hide' }); else throw new Error('non pris en charge'); } catch { plein.classList.add('c3-plein'); }
    }
    majPlein();
  };
  btnPlein.addEventListener('click', basculer);
  const surChangement = () => majPlein();
  document.addEventListener('fullscreenchange', surChangement);
  document.addEventListener('webkitfullscreenchange', surChangement);
  const echap = (ev) => { if (ev.key === 'Escape' && plein.classList.contains('c3-plein')) { ev.stopPropagation(); basculer(); } };
  document.addEventListener('keydown', echap, true);
  conteneur.appendChild(btnPlein);
  majPlein();

  const bulle = document.createElement('div');
  bulle.className = 'c3-tip';
  bulle.hidden = true;
  conteneur.appendChild(bulle);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x404048, 1.6));
  const soleil = new THREE.DirectionalLight(0xffffff, 1.6);
  soleil.position.set(0.6, 1.4, 1.2);
  scene.add(soleil);
  const contre = new THREE.DirectionalLight(0xffffff, 0.5);
  contre.position.set(-1, 0.6, -1);
  scene.add(contre);

  const cibles = [];
  const racine = new THREE.Group();
  scene.add(racine);
  const box = (w, h, d, m, r = 0.012) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), m);

  // Bac et blocs porte-manette.
  const bac = box(2 * XM + 0.2, 0.07, 0.36, materiaux.orange, 0.025);
  bac.position.set(0, 0.035, 0.02);
  racine.add(bac);
  for (const sx of [-1, 1]) {
    const bloc = box(0.2, 0.1, 0.3, materiaux.orange, 0.03);
    bloc.position.set(sx * XM, 0.1, 0.05);
    racine.add(bloc);
    const pc = box(0.21, 0.17, 0.08, materiaux.noir, 0.025);
    pc.position.set(sx * XM, 0.085, 0.22);
    racine.add(pc);
    for (const y of [0.05, 0.12]) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 12), materiaux.acier);
      v.rotation.x = Math.PI / 2;
      v.position.set(sx * XM + sx * 0.06, y, 0.262);
      racine.add(v);
    }
  }
  // Poignée avant (tube orange entre les blocs).
  const barre = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2 * XM - 0.2, 16), materiaux.orange);
  barre.rotation.z = Math.PI / 2;
  barre.position.set(0, 0.06, 0.25);
  racine.add(barre);
  for (const sx of [-1, 1]) {
    const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12), materiaux.orange);
    pied.rotation.x = Math.PI / 2;
    pied.position.set(sx * (XM - 0.13), 0.06, 0.22);
    racine.add(pied);
  }

  // Boîtier d'écran incliné.
  const boitier = new THREE.Group();
  boitier.position.set(0, 0.07, -0.1);
  boitier.rotation.x = INCLINAISON;
  racine.add(boitier);
  const YE = 0.1125 + ECRAN.h / 2; // hauteur du centre de l’écran dans le boîtier (au-dessus du bandeau jaune)
  const coque = box(ECRAN.w + 0.16, ECRAN.h + 0.19, 0.13, materiaux.orange, 0.035);
  coque.position.set(0, (ECRAN.h + 0.19) / 2, 0);
  boitier.add(coque);
  const cadre = box(ECRAN.w + 0.04, ECRAN.h + 0.035, 0.01, materiaux.noir, 0.008);
  cadre.position.set(0, YE, 0.066);
  boitier.add(cadre);
  for (const sx of [-1, 1]) {
    const coin = box(0.12, 0.08, 0.15, materiaux.noir, 0.03);
    coin.position.set(sx * (ECRAN.w / 2 + 0.04), ECRAN.h + 0.17, 0);
    boitier.add(coin);
  }
  const jaune = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.05), bandeau());
  jaune.position.set(0, 0.055, 0.0661);
  boitier.add(jaune);
  // Écran : élément HTML de l'écran ERIS, à l'échelle de la vitre.
  const ecranEl = document.createElement('div');
  ecranEl.className = 'c3-ecran';
  ecranEl.style.width = `${ECRAN.px}px`;
  const ecranObj = new CSS3DObject(ecranEl);
  ecranObj.scale.setScalar(ECRAN.w / ECRAN.px);
  ecranObj.position.set(0, YE, 0.0725);
  boitier.add(ecranObj);
  // Fond noir derrière l'écran (visible pendant le chargement et sous le HTML).
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(ECRAN.w, ECRAN.h), materiaux.vitre);
  vitre.position.set(0, YE, 0.0715);
  boitier.add(vitre);

  // Arrêt d'urgence (bouton rouge sur socle jaune) et actionneur de l'extincteur, au centre du bac.
  const estop = new THREE.Group();
  estop.position.set(-0.08, 0.07, 0.07);
  racine.add(estop);
  const socle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.018, 28), materiaux.acier);
  socle.position.y = 0.009;
  estop.add(socle);
  const champi = new THREE.Group();
  champi.position.y = 0.03;
  estop.add(champi);
  const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 16), materiaux.noir);
  champi.add(tige);
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.036, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), materiaux.rouge);
  tete.scale.y = 0.55;
  tete.position.y = 0.006;
  champi.add(tete);
  const ce = { type: 'estop', nom: 'Bouton d’arrêt d’urgence' };
  for (const m of [tete, tige, socle]) { m.userData.cible = ce; cibles.push(m); }
  prise(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 16), ce, estop, cibles, [0, 0.03, 0]);

  const ext = new THREE.Group();
  ext.position.set(0.06, 0.07, 0.06);
  racine.add(ext);
  const extBase = box(0.03, 0.03, 0.04, materiaux.noir, 0.004);
  extBase.position.y = 0.015;
  ext.add(extBase);
  const extLevier = box(0.026, 0.05, 0.016, materiaux.rouge, 0.004);
  extLevier.position.set(0, 0.05, -0.006);
  ext.add(extLevier);
  const cx = { type: 'ext', nom: 'Actionneur du système extincteur automatique' };
  for (const m of [extBase, extLevier]) { m.userData.cible = cx; cibles.push(m); }
  prise(new THREE.BoxGeometry(0.06, 0.09, 0.06), cx, ext, cibles, [0, 0.04, 0]);

  // Interrupteur marche/arrêt : côté droit du bloc droit (repère 1, p. 121).
  const inter = new THREE.Group();
  inter.position.set(XM + 0.102, 0.1, 0.12);
  racine.add(inter);
  const interCorps = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 20), materiaux.acier);
  interCorps.rotation.z = Math.PI / 2;
  inter.add(interCorps);
  const interLevier = box(0.012, 0.03, 0.008, materiaux.noir, 0.003);
  interLevier.position.x = 0.01;
  inter.add(interLevier);
  const voyant = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 8), mat(0x1f9d55, { emissive: 0x000000 }));
  voyant.position.set(0.008, 0.024, 0);
  inter.add(voyant);
  const ci = { type: 'power', nom: 'Interrupteur marche/arrêt' };
  for (const m of [interCorps, interLevier]) { m.userData.cible = ci; cibles.push(m); }
  prise(new THREE.SphereGeometry(0.04, 12, 8), ci, inter, cibles, [0.01, 0, 0]);

  // Manettes.
  const mg = manette('L', materiaux, cibles);
  mg.groupe.position.set(-XM, 0.15, 0.03);
  racine.add(mg.groupe);
  const md = manette('R', materiaux, cibles);
  md.groupe.position.set(XM, 0.15, 0.03);
  racine.add(md.groupe);
  const pivots = { L: mg.pivot, R: md.pivot };

  // Vue : rotation limitée devant la console. L'écran HTML (CSS3D) est toujours dessiné par-dessus la 3D : au-delà de
  // ±0,3 rad, en vue reculée et basse, il recouvrirait les boutons de la manette la plus proche et capterait leurs
  // clics (mesuré : aucun recouvrement à ±0,3 pour toutes les distances et inclinaisons permises).
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.17, -0.02);
  controls.enableDamping = true;
  controls.minAzimuthAngle = -0.3; controls.maxAzimuthAngle = 0.3;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.35;
  controls.minDistance = 0.55; controls.maxDistance = 2.2;
  controls.enablePan = false;
  controls.update();

  // ------------------------------------------------------------------ interactions
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const viser = (ev) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    // Toute la console est testée : une commande cachée derrière une pièce (pare-chocs, coque, bac) n'est pas touchée.
    // Parmi les commandes devant la première pièce opaque (à 1 cm près), une pièce visible (bouton, touche Mode) passe
    // avant une zone de saisie invisible.
    const hits = ray.intersectObject(racine, true);
    const opaque = hits.find((h) => h.object.material !== PRISE);
    const limite = opaque ? opaque.distance + 0.01 : Infinity;
    const devant = hits.filter((h) => h.object.userData.cible && h.distance <= limite);
    const hit = devant.find((h) => h.object.material !== PRISE) || devant[0];
    return hit ? hit.object.userData.cible : null;
  };
  let drag = null; // { side, x0, y0, moved }
  const quantifier = (v) => (v > 0.35 ? 1 : v < -0.35 ? -1 : 0);
  const onDown = (ev) => {
    const c = viser(ev);
    if (!c) return;
    ev.preventDefault();
    ev.stopPropagation();
    // Mode découverte (étape « La console ») : la commande touchée est seulement signalée, sans action.
    if (surCible) { surCible(c); return; }
    controls.enabled = false;
    if (c.type === 'manette') {
      drag = { side: c.side, pointerId: ev.pointerId, x0: ev.clientX, y0: ev.clientY, moved: false, pos0: { ...sim.s[c.side] } };
      renderer.domElement.setPointerCapture?.(ev.pointerId);
      return;
    }
    if (c.type === 'estop') sim.estop(!sim.s.estop);
    else if (c.type === 'power') sim.power();
    else if (c.type === 'ext') {
      sim.s.message = { texte: 'Actionneur du système extincteur automatique : à n’utiliser qu’en cas d’incendie. Une fois déployé, l’unité de forage s’arrête (alarme 2). Non déclenché dans le simulateur.', ton: 'warn', page: 131, t: Date.now() };
    } else if (c.type === 'bouton') {
      sim.appuyer(c.side, c.pos);
    }
    controls.enabled = true;
    agir();
  };
  const onMove = (ev) => {
    if (drag && ev.pointerId !== drag.pointerId) return; // un autre doigt ne déplace pas la manette tenue
    if (drag) {
      const dx = (ev.clientX - drag.x0) / 70;
      const dy = (ev.clientY - drag.y0) / 70;
      if (Math.abs(dx) + Math.abs(dy) > 0.15) drag.moved = true;
      // Position visée : celle de la manette au début du geste, plus le déplacement. Reprendre une manette déjà
      // inclinée ne la fait pas repasser par le centre (ce qui vaudrait un relâchement, ex. après Drill Lock).
      const x = quantifier(drag.pos0.x + dx);
      const y = quantifier(drag.pos0.y - dy);
      const cur = sim.s[drag.side];
      if (drag.moved && (x !== cur.x || y !== cur.y)) { sim.stick(drag.side, x, y); agir(); }
      return;
    }
    if (ev.buttons) return;
    const c = viser(ev);
    renderer.domElement.style.cursor = c ? (c.type === 'manette' ? 'grab' : 'pointer') : '';
    if (c) {
      const r = conteneur.getBoundingClientRect();
      let nom = c.nom;
      if (c.type === 'bouton') {
        const id = c.side === 'L' && c.pos === 'C' ? null : sim.fonctionBouton(c.side, c.pos);
        nom = c.side === 'L' && c.pos === 'C' ? 'Touche Mode (maintenir + manette gauche à gauche/droite)'
          : `Manette ${c.side === 'L' ? 'gauche' : 'droite'}, bouton ${POSITION[c.pos]} : ${id ? `${T[id][0]} (${T[id][1]})` : 'aucune fonction dans cet écran'}`;
      }
      bulle.textContent = nom;
      bulle.style.left = `${ev.clientX - r.left + 14}px`;
      bulle.style.top = `${ev.clientY - r.top + 14}px`;
      bulle.hidden = false;
      info(nom);
    } else bulle.hidden = true;
  };
  const onUp = (ev) => {
    if (drag && ev.pointerId !== drag.pointerId) return; // seul le doigt qui tient la manette termine le geste
    if (drag) {
      // Toucher sans glisser : recentrer la manette ; sinon elle reste où on l'a laissée (comme les flèches).
      if (!drag.moved) { sim.stick(drag.side, 0, 0); agir(); }
      drag = null;
    }
    controls.enabled = true;
  };
  renderer.domElement.addEventListener('pointerdown', onDown, { capture: true });
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerleave', () => { bulle.hidden = true; });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ------------------------------------------------------------------ taille et boucle
  const taille = () => {
    const w = conteneur.clientWidth;
    const h = conteneur.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    // Console entière dans le cadre, même en portrait.
    camera.fov = w / h < 1 ? 32 / Math.max(0.55, w / h) : 32;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    css.setSize(w, h);
    if (!vueModifiee) cadrer();
    else decaler();
  };
  // Cadrage au plus près : la caméra garde sa direction de vue (de face, en surplomb) et recule juste assez pour que
  // toute la console tienne dans le cadre, quelle que soit la forme de la vue. Refait à chaque changement de taille
  // tant qu'on n'a pas tourné ou zoomé la vue soi-même (« Recentrer » y revient).
  const boite = new THREE.Box3().setFromObject(racine);
  const centre = boite.getCenter(new THREE.Vector3());
  const DIRECTION = new THREE.Vector3(0, 0.61, 1.32).normalize();
  // Coins de la boîte de chaque pièce visible (bien plus près de la silhouette que les coins de la boîte d'ensemble,
  // qui débordent loin de la console une fois projetés : écran haut à l'arrière, bac profond à l'avant).
  const coins = [];
  racine.updateMatrixWorld(true);
  racine.traverse((o) => {
    if (!o.isMesh || o.material === PRISE) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) coins.push(new THREE.Vector3(x, y, z).applyMatrix4(o.matrixWorld));
  });
  const MARGE = 0.94; // part de la vue occupée par la console (le reste : marge autour)
  let vueModifiee = false;
  function cadrer() {
    // Bande du bas couverte par les panneaux (part r de la hauteur) : la console tient dans le reste, décalée vers le
    // haut par un décalage de vue (setViewOffset, suivi aussi par l'écran HTML en CSS3D).
    const r = partReservee();
    const c = cote();
    camera.clearViewOffset();
    const cible = centre.clone();
    const droite = new THREE.Vector3();
    const haut = new THREE.Vector3();
    const p = new THREE.Vector3();
    let d = 1.2;
    // La silhouette n'est pas symétrique autour du centre de la boîte : à chaque passe, la cible se recentre sur
    // l'étendue projetée et la distance s'ajuste pour que cette étendue remplisse la place disponible.
    for (let k = 0; k < 8; k++) {
      camera.position.copy(cible).addScaledVector(DIRECTION, d);
      camera.lookAt(cible);
      camera.updateMatrixWorld();
      let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
      for (const q of coins) { p.copy(q).project(camera); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
      const demiH = d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      droite.setFromMatrixColumn(camera.matrixWorld, 0);
      haut.setFromMatrixColumn(camera.matrixWorld, 1);
      cible.addScaledVector(droite, ((x0 + x1) / 2) * demiH * camera.aspect).addScaledVector(haut, ((y0 + y1) / 2) * demiH);
      d *= Math.max((x1 - x0) / 2 / (1 - 2 * c), (y1 - y0) / 2 / (1 - r)) / MARGE;
      d = Math.min(controls.maxDistance, Math.max(controls.minDistance, d));
    }
    controls.target.copy(cible);
    camera.position.copy(cible).addScaledVector(DIRECTION, d);
    decaler();
    controls.update();
  }
  /** Part de la largeur gardée de chaque côté pour les étiquettes des commandes posées sur la vue. */
  function cote() {
    return cmd ? margeCote(conteneur.clientWidth, conteneur.clientHeight) : 0;
  }
  /** Part de la hauteur de la vue couverte par les panneaux du bas (0 à 0,5). */
  function partReservee() {
    const h = conteneur.clientHeight;
    return h ? Math.min(0.5, Math.max(0, (Number(reserve()) || 0) / h)) : 0;
  }
  /** Décalage de vue vers le haut de la moitié de la bande réservée (sans bouger la caméra). */
  function decaler() {
    const w = conteneur.clientWidth;
    const h = conteneur.clientHeight;
    const r = partReservee();
    if (r > 0 && w && h) camera.setViewOffset(w, h, 0, (r * h) / 2, w, h);
    else camera.clearViewOffset();
  }
  controls.addEventListener('start', () => { vueModifiee = true; });
  // Commandes posées sur la vue : positions à l'écran des boutons, du soufflet et de la tête de chaque manette.
  const ecranPx = (vec) => { const q = vec.project(camera); return { x: (q.x + 1) / 2 * conteneur.clientWidth, y: (1 - q.y) / 2 * conteneur.clientHeight }; };
  const cmd = commandes ? creerCommandes(conteneur, sim, {
    bouton: (side, pos) => { const b = (side === 'L' ? mg : md).boutons[pos]; return b ? ecranPx(b.getWorldPosition(new THREE.Vector3())) : null; },
    base: (side) => ecranPx((side === 'L' ? mg : md).groupe.localToWorld(new THREE.Vector3(0, 0.05, 0))),
    tete: (side) => { const bs = (side === 'L' ? mg : md).boutons; const p = new THREE.Vector3(); for (const k of ['HG', 'HD', 'MG', 'MD']) p.add(bs[k].getWorldPosition(new THREE.Vector3())); return ecranPx(p.multiplyScalar(0.25)); },
  }, { agir: () => agir() }) : null;
  const ro = new ResizeObserver(taille);
  ro.observe(conteneur);
  taille();

  const v = new THREE.Vector3();
  const normale = new THREE.Vector3();
  let raf = 0;
  const boucle = () => {
    controls.update();
    const s = sim.s;
    for (const side of ['L', 'R']) {
      const p = pivots[side];
      const { x, y } = side === 'L' && s.modeKey ? s.L : s[side];
      p.rotation.x += (-y * TILT - p.rotation.x) * 0.25; // pousser : la tête part vers l'avant (-z)
      p.rotation.z += (-x * TILT - p.rotation.z) * 0.25;
    }
    champi.position.y += ((s.estop ? 0.018 : 0.03) - champi.position.y) * 0.3;
    interLevier.rotation.z = s.power ? -0.5 : 0.5;
    voyant.material.emissive.setHex(s.power ? 0x1f9d55 : 0x000000);
    // Bouton de la couche ou de la fonction active allumé (comme en orange sur la vignette de l'écran).
    for (const [side, m] of [['L', mg], ['R', md]]) {
      for (const [pos, b] of Object.entries(m.boutons)) {
        const id = side === 'L' && pos === 'C' ? null : sim.fonctionBouton(side, pos);
        const on = s.power && (side === 'L' && pos === 'C' ? s.modeKey : id && (side === 'L' ? id === sim.couche() || sim.actif(id) : sim.actif(id)));
        b.material.color.setHex(on ? 0xff7a00 : b.userData.couleur);
        b.material.emissive.setHex(on ? 0xff5a00 : b.userData.base || 0);
        b.material.emissiveIntensity = on ? 0.8 : 1;
      }
    }
    // Écran caché quand on le regarde par la tranche ou par derrière (le HTML ne serait pas masqué par la 3D).
    ecranObj.getWorldPosition(v);
    normale.set(0, 0, 1).applyQuaternion(boitier.getWorldQuaternion(new THREE.Quaternion()));
    ecranEl.style.visibility = camera.position.clone().sub(v).normalize().dot(normale) > 0.12 ? '' : 'hidden';
    renderer.render(scene, camera);
    css.render(scene, camera);
    cmd?.maj();
    raf = requestAnimationFrame(boucle);
  };
  raf = requestAnimationFrame(boucle);

  const api = {
    ecran: ecranEl,
    /** Position à l'écran (px, dans le conteneur) d'un bouton de manette : contrôles automatiques et aides. */
    positionBouton(side, pos) {
      const b = (side === 'L' ? mg : md).boutons[pos];
      if (!b) return null;
      const w = b.getWorldPosition(new THREE.Vector3()).project(camera);
      return { x: (w.x + 1) / 2 * conteneur.clientWidth, y: (1 - w.y) / 2 * conteneur.clientHeight };
    },
    recentrer() { vueModifiee = false; cadrer(); cmd?.replacer(); },
    /** Recadre (panneaux posés sur la vue changés de taille), sauf si l'on a tourné ou zoomé la vue soi-même. */
    recadrer() { if (!vueModifiee) cadrer(); else decaler(); },
    arreter() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cmd?.detruire();
      if (natif()) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      plein.classList.remove('c3-plein');
      document.documentElement.classList.remove('c3-plein-ouvert');
      document.removeEventListener('fullscreenchange', surChangement);
      document.removeEventListener('webkitfullscreenchange', surChangement);
      document.removeEventListener('keydown', echap, true);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      controls.dispose();
      // OrbitControls retire son écouteur keydown du « document » du canevas : canevas déjà détaché de la page, il
      // resterait sur le vrai document (et garderait le contexte WebGL en vie).
      document.removeEventListener('keydown', controls._interceptControlDown, { capture: true });
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material === PRISE) return;
        const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of ms) { m.map?.dispose(); m.dispose(); }
      });
      renderer.dispose();
      renderer.forceContextLoss(); // libère le contexte WebGL tout de suite (limite du navigateur)
      conteneur.replaceChildren();
      delete conteneur.c3;
    },
  };
  conteneur.c3 = api;
  return api;
}
