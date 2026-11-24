// Niveau à degrés (équipement « niveau-a-degres ») : l'outil fonctionne dans la vue 3D.
//
// - La surface mesurée se penche (curseur) : l'outil, collé dessus par sa règle de base
//   aimantée, pivote avec elle. La surface est le poteau du rack à tiges (profilé carré
//   rouge du support, src/models/rack-tiges-dd/support.js), comme sur la photo du client :
//   règle de base contre la face avant du poteau, cadran vers le haut. Le poteau est un
//   repère de la scène, pas une pièce de l'outil.
// - La molette bleue ou la fiole se tirent dans la vue 3D (souris ou doigt), ou se règlent
//   au curseur : le tambour tourne, l'aiguille rouge suit sur le cadran, la molette est
//   entraînée.
// - La bulle glisse dans la fiole vers le bout le plus haut et bute au bout ; entre les
//   traits, l'angle lu sous l'aiguille est la pente de la surface. « Centrer la bulle »
//   tourne la molette à la place de l'utilisateur.
// - Sur un téléphone, « Suivre le téléphone » lit ses capteurs d'inclinaison : le téléphone
//   tenu debout remplace l'outil, sa tranche du bas tient lieu de règle de base.
// - Usage indiqué par le client : vérifier l'angle du rack à tiges, entre 75° et 80°
//   (procédure PRO-DD-ST-008 du support de tiges de forage, étape 5). Les degrés à ne pas
//   dépasser sont clairement en rouge sur le cadran, en permanence (demande du client) :
//   traits rouges épais à 75° et à 80°, zones interdites en rouge, zone permise en vert,
//   étiquette rouge « MIN 75° · MAX 80° » du côté de l'aiguille — repères du site, absents de
//   l'outil. Le panneau rappelle les deux limites en rouge et dit si l'angle lu convient ;
//   « Poser sur le rack » penche la surface comme le support de la scène d'installation.
//   L'outil est aimanté : il tient seul contre l'acier du rack.
//
// Les cotes, la place de la bulle et l'angle lu viennent du modèle
// (src/models/niveau-a-degres/index.js) ; ce module ne fait que l'interface.
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import './niveau-degres.css';
import { L, T, CADRAN, MOLETTE, FIOLE, RAPPORT, RACK, lecture, bulle, placerBulle, regler, mobiles, verdictRack } from '../../models/niveau-a-degres/index.js';
import { T2 } from '../../models/rack-tiges-dd/support.js';
import { mat } from '../../viewer/materials.js';

const ID = 'niveau-degres';
const EQ = 'niveau-a-degres';
/** Équipement et page de la procédure du rack à tiges (étape 5 : vérifier l'angle). */
const RACK_EQ = 'rack-tiges-dd';
const RACK_PAGE = '#rack-tiges-dd.P02';
const PLAGE = `${RACK.min}° à ${RACK.max}°`;
/** Sous cet angle lu (degrés), l'outil n'est manifestement pas sur le rack : le verdict reste neutre. */
const LOIN = 45;
const MM = 0.001;
const RAD = Math.PI / 180;
/** La bulle est entre les traits à moins de cet écart du milieu (mm) : jeu entre la bulle et la paire de traits du dedans. */
const JEU = FIOLE.traits[0] - FIOLE.bulle.long / 2;
/** Temps de réponse de la bulle (s). */
const TAU = 0.16;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const fr = (v, n = 1) => v.toFixed(n).replace('.', ',');
/** Ramène un angle dans ]−180, 180]. */
const tour = (a) => { const r = ((a % 360) + 360) % 360; return r > 180 ? r - 360 : r; };
/** Pente en pouces par pied, au huitième : « 5 1/8 po par pied ». */
const pouces = (v) => {
  if (!Number.isFinite(v) || v > 999) return '—';
  const q = Math.round(v * 8), e = Math.floor(q / 8);
  return `${e || !(q % 8) ? e : ''}${FRACTIONS[q % 8]} po par pied`.trim();
};

export default {
  id: ID,
  order: 85,

  init(ctx) {
    const reduit = matchMedia('(prefers-reduced-motion: reduce)');
    /** Pente de la surface et rotation du tambour (degrés), verticale lue par le téléphone ([x, y, z], repère de l'outil). */
    const etat = { pente: 0, cadran: 0, capteur: false, haut: null };
    let racine = null; // modèle affiché (racine), ou null hors de la page du niveau
    let pieces = null; // pièces mobiles : { tambour, fiole, molette, bulle }
    let surface = null; // surface mesurée : le poteau du rack à tiges
    let zone = null; // plage du rack à tiges sur le cadran : permis en vert, limites et interdit en rouge
    let coupe = false; // vue en coupe : la plage, posée sur le couvercle, est masquée
    let retour = 0; // délai avant de remontrer la plage, le temps que le couvercle revienne de la vue éclatée
    let eclate = 0;
    let bx = 0; // place affichée de la bulle le long de la fiole (mm)
    let image = 0; // requestAnimationFrame en cours
    let dernier = 0;
    let anim = null; // rotation animée du tambour : { de, a, t0, duree }
    let ouvertDOffice = false;

    const actif = () => !!racine && ctx.viewer.model?.root === racine;
    /** Verticale dans le repère de l'outil : celle du téléphone, sinon celle de la surface penchée. */
    const haut = () => (etat.capteur && etat.haut) ? etat.haut : [Math.sin(etat.pente * RAD), Math.cos(etat.pente * RAD), 0];
    /** Inclinaison de l'outil dans son plan (degrés), d'après la verticale. */
    const inclinaison = () => { const h = haut(); return Math.atan2(h[0], h[1]) / RAD; };

    // ---------------------------------------------------------------- panneau
    const el = document.createElement('div');
    el.className = 'nvd';
    el.innerHTML = `
      <div class="nvd-lecture">
        <span class="nvd-titre">Lu sous l'aiguille rouge</span>
        <b class="nvd-deg mono" data-nvd="deg">0,0°</b>
        <span class="nvd-pente" data-nvd="pente"></span>
        <span class="nvd-bulle" data-nvd="bulle" role="status"></span>
        <span class="nvd-rack" data-nvd="rack">
          <span class="nvd-limites" title="Rack à tiges : limites à ne pas dépasser"><b class="nvd-min">MIN ${RACK.min}°</b><b class="nvd-max">MAX ${RACK.max}°</b></span>
          <span data-nvd="rack-txt" role="status"></span>
        </span>
      </div>
      <div class="nvd-champ" data-nvd="champ-pente">
        <label for="nvd-pente">Angle du poteau du rack (surface mesurée)</label>
        <div class="nvd-ligne">
          <input type="range" id="nvd-pente" min="-90" max="90" step="0.5" value="0">
          <input type="number" class="mono" min="-90" max="90" step="0.5" value="0" aria-label="Angle du poteau, en degrés" data-nvd="pente-n"><span>°</span>
        </div>
      </div>
      <div class="nvd-champ">
        <label for="nvd-cadran">Molette : rotation de la fiole</label>
        <div class="nvd-ligne">
          <input type="range" id="nvd-cadran" min="-180" max="180" step="0.5" value="0">
          <output class="mono" data-nvd="cadran-n" for="nvd-cadran">0,0°</output>
        </div>
      </div>
      <div class="nvd-actions">
        <button type="button" class="btn primary" data-nvd="centrer">Centrer la bulle</button>
        <button type="button" class="btn" data-nvd="face">Cadran de face</button>
        <button type="button" class="btn" data-nvd="poser" title="Coller l'outil au poteau du rack penché à ${RACK.pose}°, cadran en haut, comme sur la photo">Poser sur le rack à tiges</button>
        <button type="button" class="btn" data-nvd="zero">Remettre à zéro</button>
      </div>
      <div class="nvd-capteur" data-nvd="zone-capteur" hidden>
        <button type="button" class="btn" data-nvd="capteur" aria-pressed="false">Suivre le téléphone</button>
        <p data-nvd="capteur-note">Tenez le téléphone debout, sa tranche du bas posée sur la surface : il remplace la règle de base.</p>
      </div>
      <ol class="nvd-emploi">
        <li>Collez la règle de base sur la face avant du poteau du rack à tiges, cadran vers le haut : elle est aimantée, l'outil tient seul contre l'acier et les deux mains restent libres. Ici, choisissez « Poser sur le rack à tiges » ou penchez le poteau.</li>
        <li>Tournez la molette bleue jusqu'à ce que la bulle soit entre les deux paires de traits. Dans la vue 3D, tirez la molette ou la fiole.</li>
        <li>Lisez l'angle sous l'aiguille rouge : degrés au-dedans (ANGLE), pouces par pied au-dehors (PITCH). 0 : de niveau ; 90, « PLUMB » : d'aplomb.</li>
        <li>Rack à tiges : l'aiguille doit être dans la zone verte, entre les deux traits rouges. <b class="nvd-rouge">Ne pas dépasser ${RACK.max}° ; pas moins de ${RACK.min}°.</b> Graduations aux 2° : ${RACK.min} se lit entre 74 et 76.</li>
      </ol>
      <p class="nvd-source" data-nvd="source">Plage de ${PLAGE} : procédure du support de tiges de forage, étape 5. <button type="button" class="nvd-lien" data-nvd="procedure">Voir la procédure du rack à tiges ›</button></p>`;
    const $ = (nom) => el.querySelector(`[data-nvd="${nom}"]`);
    const cPente = el.querySelector('#nvd-pente');
    const cCadran = el.querySelector('#nvd-cadran');
    const nPente = $('pente-n');
    const bCapteur = $('capteur');

    /** Texte de la lecture et de l'état de la bulle. */
    function afficher() {
      const l = lecture(etat.cadran);
      const b = bulle(haut(), etat.cadran);
      $('deg').textContent = `${fr(l.deg)}°`;
      $('pente').textContent = l.deg >= 89.75 ? 'd\'aplomb (PLUMB)' : l.deg < 0.25 ? 'de niveau' : `${pouces(l.pente)} · ${fr(l.pourcent)} %`;
      const centree = Math.abs(b.x) <= JEU + 1e-6;
      const plat = Math.hypot(haut()[0], haut()[1]) < 0.34;
      const etatBulle = $('bulle');
      etatBulle.dataset.etat = centree && !plat ? 'ok' : 'non';
      etatBulle.textContent = plat ? 'Outil à plat : redressez-le pour mesurer une pente.'
        : centree ? `Bulle entre les traits : ${Math.abs(etat.pente) > 0.05 && !etat.capteur ? 'le poteau' : 'la surface'} est à ${fr(l.deg)}°.`
          : `Bulle ${Math.abs(b.x) >= b.course - 0.01 ? 'en butée' : 'décentrée'} : tournez la molette (écart de ${fr(Math.abs(b.ecart))}°).`;
      // Rack à tiges : l'angle ne vaut que bulle entre les traits.
      const rack = $('rack');
      // Loin de la plage (outil à l'horizontale, autre mesure) : pas d'alerte, l'outil n'est pas sur le rack.
      const v = !centree || plat ? 'attente' : l.deg < LOIN ? 'loin' : verdictRack(l.deg);
      rack.dataset.etat = v;
      $('rack-txt').textContent = `Rack à tiges : ${{
        attente: 'centrez la bulle pour vérifier',
        loin: 'posez l\'outil sur le poteau du rack',
        conforme: `conforme (${fr(l.deg)}°)`,
        couche: `trop couché (${fr(l.deg)}°), sous le minimum de ${RACK.min}°`,
        debout: `trop debout (${fr(l.deg)}°), au-delà du maximum de ${RACK.max}°`,
      }[v]}.`;
      // Curseur : angle positif pour le poteau penché comme sur la photo (cadran en haut), d'où le signe.
      if (document.activeElement !== cPente) cPente.value = String(-etat.pente || 0);
      if (document.activeElement !== nPente) nPente.value = String(Math.round(-etat.pente * 10) / 10 || 0);
      if (document.activeElement !== cCadran) cCadran.value = String(etat.cadran);
      $('cadran-n').textContent = `${fr(etat.cadran)}°`;
      cPente.disabled = nPente.disabled = etat.capteur;
      $('champ-pente').classList.toggle('nvd-inactif', etat.capteur);
    }

    // ---------------------------------------------------------------- modèle
    /**
     * Surface mesurée : un bout du poteau du rack à tiges, profilé carré creux de 2 po peint en
     * rouge comme le support, sous la règle de base — l'outil y tient par sa bande aimantée,
     * comme sur la photo du client. Repère de la scène, pas une pièce de l'outil.
     */
    function creerSurface() {
      const g = new THREE.Group();
      const a = T2, long = (L + 360) * MM, ep = 0.0048, o = (a - ep) / 2;
      const rouge = mat('red');
      for (const [w, h, y, z] of [[a, ep, o, 0], [a, ep, -o, 0], [ep, a - 2 * ep, 0, o], [ep, a - 2 * ep, 0, -o]]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(long, h, w), rouge);
        m.position.set(0, y, z);
        m.raycast = () => {}; // ni survol ni clic
        g.add(m);
      }
      // Face avant du poteau au ras de la face de mesure (un cheveu dessous, pour ne pas se confondre avec elle).
      g.position.set((L / 2) * MM, -a / 2 - 0.0002, 0);
      g.userData.stepOnly = true; // hors du cadrage du modèle
      return g;
    }
    const boite = new THREE.Box3();
    /** Règle le modèle ; outil sur le poteau : l'ensemble est relevé pour que le bas du poteau ne passe pas sous le sol. */
    function regle() {
      regler(racine, { pente: etat.capteur ? 0 : etat.pente, cadran: etat.cadran });
      if (!surface) return;
      surface.visible = !etat.capteur && Math.abs(etat.pente) > 0.05;
      if (!surface.visible) return;
      const bas = boite.setFromObject(surface).min.y;
      if (bas < 0) { racine.position.y -= bas; racine.updateMatrixWorld(true); }
    }

    /**
     * Plage du rack à tiges sur le cadran, montrée en permanence (demande du client : les degrés à
     * ne pas dépasser clairement en rouge). Aux quatre endroits où l'aiguille lit de 75° à 80°, de
     * part et d'autre de chaque « PLUMB » : zone permise en vert, zones interdites en rouge (trop
     * couché, trop debout), trait rouge épais à chaque limite ; et une étiquette rouge
     * « MIN 75° · MAX 80° » du côté où se trouve l'aiguille. Repères du site posés sur le
     * couvercle, absents de l'outil ; masqués en vue éclatée et en coupe.
     */
    function creerZone() {
      const g = new THREE.Group();
      const teinte = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      const vert = teinte(0x1fb85a, 0.5), rouge = teinte(0xe0221c, 0.5);
      const trait = new THREE.MeshBasicMaterial({ color: 0xd8141c, toneMapped: false, side: THREE.DoubleSide });
      const r0 = (CADRAN.rTrou + 0.4) * MM, r1 = (CADRAN.rArc + 4.6) * MM;
      const muet = (m) => { m.raycast = () => {}; return m; }; // ni survol ni clic
      /** Angles polaires (degrés) où l'aiguille lit v : 90 − v et ses trois symétriques. */
      const ou = (v) => [90 - v, 90 + v, 270 - v, 270 + v];
      /** Secteurs où l'aiguille lit de v0 à v1. */
      const secteurs = (v0, v1, mat) => {
        for (const debut of [90 - v1, 90 + v0, 270 - v1, 270 + v0]) g.add(muet(new THREE.Mesh(new THREE.RingGeometry(r0, r1, 12, 1, debut * RAD, (v1 - v0) * RAD), mat)));
      };
      secteurs(RACK.min, RACK.max, vert);
      secteurs(RACK.min - 10, RACK.min, rouge);
      secteurs(RACK.max, 90, rouge);
      // Limites : trait rouge plein, des chiffres du cadran jusqu'au bord du couvercle.
      const t0 = CADRAN.rChiffres + 1.9, t1 = CADRAN.rCouvercle - 2.2;
      for (const v of [RACK.min, RACK.max]) for (const a of ou(v)) {
        const m = muet(new THREE.Mesh(new THREE.PlaneGeometry((t1 - t0) * MM, 0.75 * MM), trait));
        m.position.set(((t0 + t1) / 2) * MM * Math.cos(a * RAD), ((t0 + t1) / 2) * MM * Math.sin(a * RAD), 0.05 * MM);
        m.rotation.z = a * RAD;
        g.add(m);
      }
      // Étiquette des limites : toujours lisible, quel que soit le zoom ; cachée quand le cadran est vu de dos.
      const el = document.createElement('div');
      el.className = 'nvd-etiquette';
      el.innerHTML = `<b>MIN ${RACK.min}°</b><b>MAX ${RACK.max}°</b>`;
      el.title = `Rack à tiges : ne pas dépasser ${RACK.max}°, pas moins de ${RACK.min}°`;
      const etiquette = new CSS2DObject(el);
      const n = new THREE.Vector3(), o = new THREE.Vector3();
      etiquette.onBeforeRender = (_r, _s, camera) => {
        n.set(0, 0, 1).transformDirection(etiquette.matrixWorld);
        o.setFromMatrixPosition(etiquette.matrixWorld);
        el.style.visibility = n.dot(o.sub(camera.position)) < 0 ? '' : 'hidden';
      };
      g.add(etiquette);
      g.userData.etiquette = etiquette;
      const c = CADRAN.couvercle;
      g.position.set(CADRAN.x * MM, CADRAN.y * MM, (T / 2 + c.jour + c.ep + 0.15) * MM);
      g.userData.stepOnly = true; // hors du cadrage du modèle
      return g;
    }
    /** L'étiquette des limites se tient près de la plage la plus proche de l'aiguille (à égalité : en haut à droite). */
    function placerEtiquette() {
      if (!zone) return;
      const milieu = 90 - (RACK.min + RACK.max) / 2;
      const aiguille = 90 + etat.cadran;
      let mieux = milieu, ecart = Infinity;
      for (const a of [milieu, 180 - milieu, 180 + milieu, 360 - milieu]) {
        const d = Math.abs(tour(a - aiguille));
        if (d < ecart - 1e-6) { ecart = d; mieux = a; }
      }
      const r = (CADRAN.rCouvercle + 10) * MM;
      zone.userData.etiquette.position.set(r * Math.cos(mieux * RAD), r * Math.sin(mieux * RAD), 0);
    }
    const montrerZone = () => {
      if (!zone) return;
      clearTimeout(retour);
      const v = eclate <= 0.02 && !coupe;
      if (zone.visible === v) return;
      // Retour de la vue éclatée : la plage attend que le couvercle soit revenu à sa place.
      if (v) retour = setTimeout(() => { if (zone && eclate <= 0.02 && !coupe) { zone.visible = true; ctx.viewer.invalidate(); } }, reduit.matches ? 0 : 700);
      else { zone.visible = false; ctx.viewer.invalidate(); }
    };

    /** Pose le modèle selon l'état ; la bulle suit en glissant (boucle). */
    function poser({ sec = false } = {}) {
      if (!actif()) return;
      regle();
      const b = bulle(haut(), etat.cadran);
      if (sec || reduit.matches) bx = b.x;
      placerBulle(pieces.bulle, { ...b, x: bx });
      placerEtiquette();
      afficher();
      ctx.viewer.invalidate();
      if (Math.abs(b.x - bx) > 0.01 || anim) lancer();
    }

    function lancer() {
      if (image) return;
      dernier = performance.now();
      image = requestAnimationFrame(pas);
    }

    function pas(t) {
      image = 0;
      if (!actif()) return;
      const dt = Math.min(0.1, (t - dernier) / 1000);
      dernier = t;
      if (anim) {
        const k = Math.min(1, (t - anim.t0) / anim.duree);
        etat.cadran = tour(anim.de + (anim.a - anim.de) * (k * k * (3 - 2 * k)));
        if (k >= 1) anim = null;
        regle();
      }
      const b = bulle(haut(), etat.cadran);
      bx += (b.x - bx) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(b.x - bx) < 0.01) bx = b.x;
      placerBulle(pieces.bulle, { ...b, x: bx });
      placerEtiquette();
      afficher();
      ctx.viewer.invalidate();
      if (anim || bx !== b.x) image = requestAnimationFrame(pas);
    }

    /** Tourne le tambour jusqu'à mettre la bulle entre les traits, par le plus court chemin. */
    function centrer() {
      let ecart = -inclinaison() - etat.cadran;
      ecart -= 180 * Math.round(ecart / 180);
      if (Math.abs(ecart) < 0.01) return;
      if (reduit.matches) { etat.cadran = tour(etat.cadran + ecart); poser({ sec: true }); return; }
      anim = { de: etat.cadran, a: etat.cadran + ecart, t0: performance.now(), duree: 350 + Math.abs(ecart) * 9 };
      lancer();
    }

    /** Caméra en face du cadran, pour le lire. */
    function face() {
      if (!actif()) return;
      racine.updateMatrixWorld(true);
      const c = racine.localToWorld(new THREE.Vector3(CADRAN.x * MM, CADRAN.y * MM, (T / 2) * MM));
      // De face, puis cadré dans la partie de la scène que le panneau laisse libre.
      ctx.viewer.lookAt([c.x, c.y, c.z + 0.4], [c.x, c.y, c.z], { instant: true });
      // Marge autour du couvercle : l'étiquette des limites du rack, posée juste dehors, reste dans le cadre.
      const r = (CADRAN.rCouvercle + 23) * MM;
      ctx.viewer.frame(new THREE.Box3(new THREE.Vector3(c.x - r, c.y - r, c.z - T * MM), new THREE.Vector3(c.x + r, c.y + r, c.z)));
    }

    function attacher(model) {
      racine = model.root;
      pieces = mobiles(racine);
      if (!pieces.tambour || !pieces.fiole || !pieces.bulle) { racine = null; return; }
      surface = creerSurface();
      zone = creerZone();
      zone.visible = eclate <= 0.02 && !coupe;
      racine.add(surface, zone);
      poser({ sec: true });
    }

    function detacher() {
      if (image) cancelAnimationFrame(image);
      image = 0;
      anim = null;
      clearTimeout(retour);
      racine = pieces = surface = zone = null;
      capteur(false);
    }

    // ---------------------------------------------------------------- commandes du panneau
    const regPente = (v) => {
      if (!Number.isFinite(v)) return;
      etat.pente = -Math.max(-90, Math.min(90, v)) || 0;
      poser();
    };
    cPente.addEventListener('input', () => regPente(Number(cPente.value)));
    nPente.addEventListener('input', () => regPente(Number(nPente.value)));
    // Curseur relâché : l'outil penché est ramené dans le cadre.
    for (const c of [cPente, nPente]) c.addEventListener('change', () => { if (actif()) ctx.viewer.frame(); });
    cCadran.addEventListener('input', () => { anim = null; etat.cadran = Number(cCadran.value); poser(); });
    $('centrer').addEventListener('click', centrer);
    $('face').addEventListener('click', face);
    // Rack à tiges : le poteau penché comme le support installé, l'outil collé dessus cadran en haut,
    // comme sur la photo du client ; il reste à centrer la bulle et à lire.
    $('poser').addEventListener('click', () => {
      anim = null;
      if (etat.capteur) capteur(false);
      etat.pente = -RACK.pose;
      poser();
      if (actif()) ctx.viewer.frame();
    });
    $('procedure').addEventListener('click', () => ctx.go(RACK_PAGE));
    $('zero').addEventListener('click', () => {
      anim = null;
      etat.pente = 0;
      etat.cadran = 0;
      poser();
    });

    // ---------------------------------------------------------------- molette et fiole tirées dans la vue 3D
    const rayon = new THREE.Raycaster();
    const souris = new THREE.Vector2();
    const plan = new THREE.Plane();
    let prise = null; // { quoi, centre, a0, c0, x, y, bouge, id }

    const viser = (e) => {
      const r = ctx.viewer.canvas.getBoundingClientRect();
      souris.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      rayon.setFromCamera(souris, ctx.viewer.camera);
    };
    /** Angle (degrés) du pointeur autour d'un axe de l'outil, dans le plan de la face ; null si le plan est vu par la tranche. */
    const angleAutour = (e, centre) => {
      viser(e);
      racine.updateMatrixWorld(true);
      const n = new THREE.Vector3(0, 0, 1).transformDirection(racine.matrixWorld);
      plan.setFromNormalAndCoplanarPoint(n, racine.localToWorld(new THREE.Vector3(centre[0] * MM, centre[1] * MM, (T / 2) * MM)));
      const p = rayon.ray.intersectPlane(plan, new THREE.Vector3());
      if (!p) return null;
      racine.worldToLocal(p);
      return Math.atan2(p.y - centre[1] * MM, p.x - centre[0] * MM) / RAD;
    };
    const sous = (e) => {
      viser(e);
      const cibles = [['molette', pieces.molette], ['fiole', pieces.fiole], ['fiole', pieces.tambour]];
      let mieux = null;
      for (const [quoi, obj] of cibles) {
        const h = rayon.intersectObject(obj, true)[0];
        if (h && (!mieux || h.distance < mieux.distance)) mieux = { quoi, distance: h.distance, ref: obj.userData.partRef };
      }
      if (!mieux) return null;
      // Une autre pièce devant (couvercle, boîtier vu de dos) : ce n'est pas la molette ni la fiole qu'on touche.
      const devant = rayon.intersectObject(racine, true).find((h) => h.object.visible && h.object !== surface);
      return devant && devant.distance < mieux.distance - 1e-4 ? null : mieux;
    };

    ctx.ui.stage.addEventListener('pointerdown', (e) => {
      if (!actif() || e.target !== ctx.viewer.canvas || e.button !== 0 || !e.isPrimary || eclate > 0.02) return;
      const t = sous(e);
      if (!t) return;
      const centre = t.quoi === 'molette' ? [MOLETTE.x, MOLETTE.y] : [CADRAN.x, CADRAN.y];
      const a0 = angleAutour(e, centre);
      if (a0 == null) return;
      // La vue ne tourne pas pendant qu'on tient la molette ou la fiole.
      e.stopPropagation();
      e.preventDefault();
      anim = null;
      prise = { ...t, centre, a0, c0: etat.cadran, x: e.clientX, y: e.clientY, bouge: false, id: e.pointerId };
      ctx.viewer.canvas.style.cursor = 'grabbing';
    }, true);
    window.addEventListener('pointermove', (e) => {
      if (!prise || e.pointerId !== prise.id || !actif()) return;
      if (!prise.bouge && Math.hypot(e.clientX - prise.x, e.clientY - prise.y) < 4) return;
      prise.bouge = true;
      const a = angleAutour(e, prise.centre);
      if (a == null) return;
      const d = tour(a - prise.a0);
      // Suivi de proche en proche : plusieurs tours de molette s'enchaînent sans saut.
      prise.a0 = a;
      prise.c0 = tour(prise.c0 + (prise.quoi === 'molette' ? -d / RAPPORT : d));
      etat.cadran = Math.round(prise.c0 * 10) / 10;
      poser();
    });
    const lacher = (e) => {
      if (!prise || e.pointerId !== prise.id) return;
      const p = prise;
      prise = null;
      if (ctx.viewer.canvas) ctx.viewer.canvas.style.cursor = '';
      // Simple clic : la pièce est sélectionnée, comme partout ailleurs.
      if (!p.bouge && e.type === 'pointerup' && actif()) ctx.viewer.select(p.ref);
    };
    window.addEventListener('pointerup', lacher);
    window.addEventListener('pointercancel', lacher);

    // ---------------------------------------------------------------- capteurs du téléphone
    let silence = 0;
    /** Verticale du téléphone ramenée à l'écran : x à droite, y en haut, z vers l'utilisateur. */
    function surOrientation(e) {
      if (e.beta == null || e.gamma == null) return;
      clearTimeout(silence);
      silence = 0;
      const b = e.beta * RAD, g = e.gamma * RAD;
      const ux = -Math.cos(b) * Math.sin(g), uy = Math.sin(b), uz = Math.cos(b) * Math.cos(g);
      const o = (screen.orientation?.angle ?? window.orientation ?? 0) * RAD;
      const cible = [ux * Math.cos(o) - uy * Math.sin(o), ux * Math.sin(o) + uy * Math.cos(o), uz];
      // Filtre passe-bas : les capteurs tremblent.
      const h = etat.haut || cible;
      const v = h.map((x, i) => x + (cible[i] - x) * 0.25);
      const n = Math.hypot(...v) || 1;
      etat.haut = v.map((x) => x / n);
      if (actif()) lancer();
    }
    async function capteur(marche) {
      if (marche === etat.capteur) return;
      if (!marche) {
        window.removeEventListener('deviceorientation', surOrientation);
        clearTimeout(silence);
        etat.capteur = false;
        etat.haut = null;
        bCapteur.setAttribute('aria-pressed', 'false');
        bCapteur.textContent = 'Suivre le téléphone';
        poser();
        return;
      }
      try {
        // iOS : l'accès aux capteurs se demande, sur un geste de l'utilisateur.
        const demande = window.DeviceOrientationEvent?.requestPermission;
        if (typeof demande === 'function' && (await demande.call(window.DeviceOrientationEvent)) !== 'granted') {
          ctx.toast('Accès aux capteurs d\'inclinaison refusé.');
          return;
        }
      } catch {
        ctx.toast('Capteurs d\'inclinaison indisponibles.');
        return;
      }
      etat.capteur = true;
      bCapteur.setAttribute('aria-pressed', 'true');
      bCapteur.textContent = 'Arrêter le suivi du téléphone';
      window.addEventListener('deviceorientation', surOrientation);
      // Aucun capteur (ordinateur, appareil sans gyroscope) : on le dit et on revient au curseur.
      silence = setTimeout(() => { ctx.toast('Cet appareil ne donne pas son inclinaison.'); capteur(false); }, 2500);
      poser();
    }
    bCapteur.addEventListener('click', () => capteur(!etat.capteur));
    $('zone-capteur').hidden = !('DeviceOrientationEvent' in window) || !matchMedia('(pointer: coarse)').matches;

    // ---------------------------------------------------------------- outil de la vue 3D
    const ouvrir = () => {
      ctx.ui.sidePanel.open({ owner: ID, title: 'Mesurer un angle', icon: 'engrenage', content: el, className: 'nvd-panneau' });
      // L'outil est ramené dans la partie de la scène que le panneau (ou le volet du téléphone) laisse libre.
      requestAnimationFrame(() => { if (actif() && ctx.ui.sidePanel.owner === ID) ctx.viewer.frame(); });
    };
    const bouton = ctx.ui.addTool({
      id: ID,
      label: 'Mesurer',
      icon: 'engrenage',
      title: 'Mesurer un angle : pencher la surface, tourner la molette, lire le cadran',
      pressed: false,
      rank: 15,
      onClick: () => (ctx.ui.sidePanel.owner === ID ? ctx.ui.sidePanel.close() : ouvrir()),
    });
    bouton.hidden = true;
    ctx.on('sidepanel', ({ open, owner }) => { if (owner === ID) bouton.setAttribute('aria-pressed', String(open)); });
    ctx.on('view-state', ({ explode, section }) => {
      eclate = explode || 0;
      coupe = !!section?.on;
      montrerZone();
    });
    ctx.on('equipment', ({ id }) => {
      // Le lien vers la procédure n'est offert que si le rack à tiges est au catalogue.
      $('source').hidden = !ctx.index.some((e) => e.id === RACK_EQ);
      if (id === EQ) return;
      etat.pente = 0;
      etat.cadran = 0;
      ouvertDOffice = false;
    });
    ctx.on('view', ({ type }) => {
      // Schéma, contrôle des listes : plus de modèle du niveau à l'écran.
      if (type !== 'assembly' && racine) { detacher(); bouton.hidden = true; ctx.ui.sidePanel.release(ID); }
    });
    ctx.on('assembly', ({ is3d, home, model, equipment }) => {
      const ici = equipment?.id === EQ && is3d && !home && !!model;
      if (racine && (!ici || model.root !== racine)) detacher();
      bouton.hidden = !ici;
      if (!ici) { ctx.ui.sidePanel.release(ID); return; }
      if (!racine) attacher(model);
      // Grand écran : le panneau s'ouvre de lui-même à la première visite de l'outil.
      if (racine && !ouvertDOffice && !ctx.compact()) { ouvertDOffice = true; ouvrir(); }
    });
  },
};
