// Niveau à degrés (équipement « niveau-a-degres ») : l'outil fonctionne dans la vue 3D.
//
// - La surface mesurée se penche (curseur) : l'outil, posé dessus par sa règle de base,
//   pivote avec elle ; une bande orange translucide montre la surface.
// - La molette bleue ou la fiole se tirent dans la vue 3D (souris ou doigt), ou se règlent
//   au curseur : le tambour tourne, l'aiguille rouge suit sur le cadran, la molette est
//   entraînée.
// - La bulle glisse dans la fiole vers le bout le plus haut et bute au bout ; entre les
//   traits, l'angle lu sous l'aiguille est la pente de la surface. « Centrer la bulle »
//   tourne la molette à la place de l'utilisateur.
// - Sur un téléphone, « Suivre le téléphone » lit ses capteurs d'inclinaison : le téléphone
//   tenu debout remplace l'outil, sa tranche du bas tient lieu de règle de base.
// - Usage indiqué par le client : vérifier l'angle du rack à tiges, entre 75° et 80°
//   (procédure PRO-DD-ST-008 du support de tiges de forage, étape 5). Panneau ouvert, la
//   plage est en vert sur le cadran (repère visuel, absent de l'outil) et le panneau dit si
//   l'angle lu convient ; « Poser sur le rack » penche la surface comme le support de la
//   scène d'installation. L'outil est aimanté : il tient seul contre l'acier du rack.
//
// Les cotes, la place de la bulle et l'angle lu viennent du modèle
// (src/models/niveau-a-degres/index.js) ; ce module ne fait que l'interface.
import * as THREE from 'three';
import './niveau-degres.css';
import { L, T, CADRAN, MOLETTE, FIOLE, RAPPORT, RACK, lecture, bulle, placerBulle, regler, mobiles, verdictRack } from '../../models/niveau-a-degres/index.js';

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
    let surface = null; // bande de la surface mesurée
    let zone = null; // plage du rack à tiges, en vert sur le cadran
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
        <span class="nvd-rack" data-nvd="rack"></span>
      </div>
      <div class="nvd-champ" data-nvd="champ-pente">
        <label for="nvd-pente">Pente de la surface mesurée</label>
        <div class="nvd-ligne">
          <input type="range" id="nvd-pente" min="-90" max="90" step="0.5" value="0">
          <input type="number" class="mono" min="-90" max="90" step="0.5" value="0" aria-label="Pente de la surface, en degrés" data-nvd="pente-n"><span>°</span>
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
        <button type="button" class="btn" data-nvd="poser" title="Pencher la surface à ${RACK.pose}°, comme le support de tiges installé">Poser sur le rack à tiges</button>
        <button type="button" class="btn" data-nvd="zero">Remettre à zéro</button>
      </div>
      <div class="nvd-capteur" data-nvd="zone-capteur" hidden>
        <button type="button" class="btn" data-nvd="capteur" aria-pressed="false">Suivre le téléphone</button>
        <p data-nvd="capteur-note">Tenez le téléphone debout, sa tranche du bas posée sur la surface : il remplace la règle de base.</p>
      </div>
      <ol class="nvd-emploi">
        <li>Posez la règle de base sur le poteau du rack à tiges : elle est aimantée, l'outil tient seul contre l'acier et les deux mains restent libres. Ici, penchez la surface ou choisissez « Poser sur le rack à tiges ».</li>
        <li>Tournez la molette bleue jusqu'à ce que la bulle soit entre les deux paires de traits. Dans la vue 3D, tirez la molette ou la fiole.</li>
        <li>Lisez l'angle sous l'aiguille rouge : degrés au-dedans (ANGLE), pouces par pied au-dehors (PITCH). 0 : de niveau ; 90, « PLUMB » : d'aplomb.</li>
        <li>Rack à tiges : l'aiguille doit être dans la zone verte, entre ${RACK.min}° et ${RACK.max}° (graduations aux 2° : ${RACK.min} se lit entre 74 et 76).</li>
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
        : centree ? `Bulle entre les traits : la surface est à ${fr(l.deg)}°.`
          : `Bulle ${Math.abs(b.x) >= b.course - 0.01 ? 'en butée' : 'décentrée'} : tournez la molette (écart de ${fr(Math.abs(b.ecart))}°).`;
      // Rack à tiges : l'angle ne vaut que bulle entre les traits.
      const rack = $('rack');
      // Loin de la plage (outil à l'horizontale, autre mesure) : pas d'alerte, l'outil n'est pas sur le rack.
      const v = !centree || plat ? 'attente' : l.deg < LOIN ? 'loin' : verdictRack(l.deg);
      rack.dataset.etat = v;
      rack.textContent = `Rack à tiges, ${PLAGE} : ${{
        attente: 'centrez la bulle pour vérifier',
        loin: 'posez l\'outil sur le poteau du rack',
        conforme: `conforme (${fr(l.deg)}°)`,
        couche: `trop couché (${fr(l.deg)}°, moins de ${RACK.min}°)`,
        debout: `trop debout (${fr(l.deg)}°, plus de ${RACK.max}°)`,
      }[v]}.`;
      if (document.activeElement !== cPente) cPente.value = String(etat.pente);
      if (document.activeElement !== nPente) nPente.value = String(Math.round(etat.pente * 10) / 10);
      if (document.activeElement !== cCadran) cCadran.value = String(etat.cadran);
      $('cadran-n').textContent = `${fr(etat.cadran)}°`;
      cPente.disabled = nPente.disabled = etat.capteur;
      $('champ-pente').classList.toggle('nvd-inactif', etat.capteur);
    }

    // ---------------------------------------------------------------- modèle
    /** Bande translucide sous la règle de base : la surface mesurée (repère visuel, pas une pièce). */
    function creerSurface() {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry((L + 90) * MM, 1.2 * MM, (T + 50) * MM),
        new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false }),
      );
      m.position.set((L / 2) * MM, -0.7 * MM, 0);
      m.userData.stepOnly = true; // hors du cadrage du modèle
      m.raycast = () => {}; // ni survol ni clic
      return m;
    }

    /**
     * Plage du rack à tiges sur le cadran : secteurs verts translucides aux quatre endroits où
     * l'aiguille lit de 75° à 80° (de part et d'autre de chaque « PLUMB »), bordés de rouge pâle
     * (trop couché, trop debout). Repère visuel posé sur le couvercle, absent de l'outil ;
     * montré tant que le panneau de mesure est ouvert.
     */
    function creerZone() {
      const g = new THREE.Group();
      const teinte = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      const vert = teinte(0x1fb85a, 0.5), rouge = teinte(0xe03a2e, 0.2);
      const r0 = (CADRAN.rTrou + 0.4) * MM, r1 = (CADRAN.rArc + 4.6) * MM;
      /** Secteurs où l'aiguille lit de v0 à v1 : la lecture v est à l'angle polaire 90 − v et à ses trois symétriques. */
      const secteurs = (v0, v1, mat) => {
        for (const debut of [90 - v1, 90 + v0, 270 - v1, 270 + v0]) {
          const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 12, 1, debut * RAD, (v1 - v0) * RAD), mat);
          m.raycast = () => {}; // ni survol ni clic
          g.add(m);
        }
      };
      // Comme dans la scène d'installation du rack : permis en vert, trop couché et trop debout en rouge pâle.
      secteurs(RACK.min, RACK.max, vert);
      secteurs(RACK.min - 10, RACK.min, rouge);
      secteurs(RACK.max, 90, rouge);
      const c = CADRAN.couvercle;
      g.position.set(CADRAN.x * MM, CADRAN.y * MM, (T / 2 + c.jour + c.ep + 0.15) * MM);
      g.userData.stepOnly = true; // hors du cadrage du modèle
      g.visible = false;
      return g;
    }
    const montrerZone = () => {
      if (!zone) return;
      const v = ctx.ui.sidePanel.has(ID);
      if (zone.visible !== v) { zone.visible = v; ctx.viewer.invalidate(); }
    };

    /** Pose le modèle selon l'état ; la bulle suit en glissant (boucle). */
    function poser({ sec = false } = {}) {
      if (!actif()) return;
      regler(racine, { pente: etat.capteur ? 0 : etat.pente, cadran: etat.cadran });
      if (surface) surface.visible = !etat.capteur && Math.abs(etat.pente) > 0.05;
      const b = bulle(haut(), etat.cadran);
      if (sec || reduit.matches) bx = b.x;
      placerBulle(pieces.bulle, { ...b, x: bx });
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
        regler(racine, { pente: etat.capteur ? 0 : etat.pente, cadran: etat.cadran });
      }
      const b = bulle(haut(), etat.cadran);
      bx += (b.x - bx) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(b.x - bx) < 0.01) bx = b.x;
      placerBulle(pieces.bulle, { ...b, x: bx });
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
      const r = (CADRAN.rCouvercle + 6) * MM;
      ctx.viewer.frame(new THREE.Box3(new THREE.Vector3(c.x - r, c.y - r, c.z - T * MM), new THREE.Vector3(c.x + r, c.y + r, c.z)));
    }

    function attacher(model) {
      racine = model.root;
      pieces = mobiles(racine);
      if (!pieces.tambour || !pieces.fiole || !pieces.bulle) { racine = null; return; }
      surface = creerSurface();
      zone = creerZone();
      racine.add(surface, zone);
      montrerZone();
      poser({ sec: true });
    }

    function detacher() {
      if (image) cancelAnimationFrame(image);
      image = 0;
      anim = null;
      racine = pieces = surface = zone = null;
      capteur(false);
    }

    // ---------------------------------------------------------------- commandes du panneau
    const regPente = (v) => {
      if (!Number.isFinite(v)) return;
      etat.pente = Math.max(-90, Math.min(90, v));
      poser();
    };
    cPente.addEventListener('input', () => regPente(Number(cPente.value)));
    nPente.addEventListener('input', () => regPente(Number(nPente.value)));
    // Curseur relâché : l'outil penché est ramené dans le cadre.
    for (const c of [cPente, nPente]) c.addEventListener('change', () => { if (actif()) ctx.viewer.frame(); });
    cCadran.addEventListener('input', () => { anim = null; etat.cadran = Number(cCadran.value); poser(); });
    $('centrer').addEventListener('click', centrer);
    $('face').addEventListener('click', face);
    // Rack à tiges : la surface penchée comme le support installé ; il reste à centrer la bulle et à lire.
    $('poser').addEventListener('click', () => {
      anim = null;
      if (etat.capteur) capteur(false);
      etat.pente = RACK.pose;
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
    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === ID) bouton.setAttribute('aria-pressed', String(open));
      // Panneau ouvert, replié, recouvert par la fiche ou repris par un autre mode : la zone verte suit.
      montrerZone();
    });
    ctx.on('view-state', ({ explode }) => { eclate = explode || 0; });
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
