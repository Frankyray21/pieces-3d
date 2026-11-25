// Carte 3D de la place de travail, à parcourir à pied : vue à la 1re personne
// (casque) ou à la 3e personne (travailleur), minicarte qui tourne avec la vue,
// itinéraire GPS vers l'objectif, carte plein écran et tournée d'inspection du
// formulaire MA4657078 (questions de l'analyse de risque sur le terrain).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProcedural } from '../../../viewer/assembly.js';
import plancherModeles from '../../../models/plancher-dd/index.js';
import stmModeles from '../../../models/stm-1500/index.js';
import { L, W, GAL, GAL_X1 } from '../../../models/plancher-dd/plan.js';
import { construireMine, sdf, gradient, marche, voute, segments, BORNES, XD, REFUGE, REFUGE_Z, ESC, Y0 } from './mine.js';
import { creerAvatar } from './avatar.js';
import { grilleChemins } from './chemin.js';
import { imagePlan, pastille, flecheJoueur, trace, PX } from './plan2d.js';
import { creerCarte3D, texturePastille } from './carte3d.js';
import { POINTS, QUESTIONS, RISQUES, CONTROLES, SOURCE } from './formulaire.js';

const R = 0.33; // rayon du travailleur
const OEIL = 1.66; // hauteur des yeux
const MARCHE_MAX = 0.4; // plus haute marche franchie
const V_MARCHE = 1.7, V_COURSE = 3.8;
const BARRICADE_X = L + 4.3;
const TACTILE = matchMedia('(pointer: coarse)').matches;
// Itinéraire : couleur d'accent du site.
const ROUTE = '#ff7c24';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const angleVers = (a, b, t) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * t; };

// ------------------------------------------------------------------ fusion des maillages

/**
 * Fusionne les maillages statiques d'un objet par matériau (quelques dizaines
 * d'appels de dessin au lieu de centaines). Les lignes et contours sont omis.
 */
function fusionner(racine) {
  racine.updateMatrixWorld(true);
  const lots = new Map();
  racine.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.geometry?.attributes?.position) return;
    let vis = true;
    for (let p = o; p; p = p.parent) if (p.visible === false) { vis = false; break; }
    if (!vis) return;
    const m = Array.isArray(o.material) ? null : o.material;
    if (!m) return;
    const g = o.geometry;
    const attrs = Object.keys(g.attributes).sort().map((k) => `${k}${g.attributes[k].itemSize}`).join(',');
    const cle = `${m.uuid}|${g.index ? 'i' : 'n'}|${attrs}`;
    if (!lots.has(cle)) lots.set(cle, { m, geos: [] });
    const c = g.clone();
    c.morphAttributes = {};
    c.applyMatrix4(o.matrixWorld);
    lots.get(cle).geos.push(c);
  });
  const out = new THREE.Group();
  for (const { m, geos } of lots.values()) {
    const g = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!g) continue;
    for (const x of geos) if (x !== g) x.dispose();
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    out.add(mesh);
  }
  return out;
}

// ------------------------------------------------------------------ marqueurs

/** Point à inspecter, dans la vue à pied : anneau au sol et pastille au-dessus. */
function marqueur(couleur, lettre) {
  const g = new THREE.Group();
  const anneau = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.56, 48), new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  anneau.rotation.x = -Math.PI / 2;
  anneau.position.y = 0.03;
  const icone = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturePastille(couleur, lettre), transparent: true, depthWrite: false }));
  icone.scale.set(0.32, 0.32, 1);
  icone.position.y = 1.95;
  g.add(anneau, icone);
  g.userData = { anneau, icone };
  return g;
}

// ------------------------------------------------------------------ poussière dans le faisceau

function poussiere(n = 900) {
  const pos = new Float32Array(n * 3);
  const graine = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[3 * i] = (Math.random() - 0.5) * 14;
    pos[3 * i + 1] = Math.random() * 4;
    pos[3 * i + 2] = (Math.random() - 0.5) * 14;
    graine[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aGraine', new THREE.BufferAttribute(graine, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uEchelle: { value: 600 }, uCentre: { value: new THREE.Vector3() }, uLampe: { value: new THREE.Vector3() }, uDir: { value: new THREE.Vector3(0, 0, -1) }, uT: { value: 0 } },
    vertexShader: `
      attribute float aGraine; uniform float uEchelle; uniform vec3 uCentre; uniform vec3 uLampe; uniform vec3 uDir; uniform float uT; varying float vA;
      void main(){
        vec3 p = position;
        p.x += sin(uT * 0.3 + aGraine * 40.0) * 0.4; p.y += sin(uT * 0.21 + aGraine * 17.0) * 0.3; p.z += cos(uT * 0.25 + aGraine * 29.0) * 0.4;
        p = uCentre + mod(p - uCentre + 7.0, 14.0) - 7.0; p.y = uCentre.y - 1.6 + mod(position.y + sin(uT*0.1+aGraine*9.0)*0.3, 4.0);
        vec3 d = p - uLampe; float l = length(d);
        float cone = smoothstep(0.82, 0.97, dot(d / l, uDir));
        vA = cone * smoothstep(14.0, 1.0, l) * (0.35 + 0.65 * aGraine);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = min(7.0, (0.006 + aGraine * 0.01) * uEchelle / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: 'varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c, c); if (r > 0.25) discard; gl_FragColor = vec4(vec3(1.0, 0.93, 0.82), vA * (1.0 - r * 4.0) * 0.55); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  return p;
}

/** Air qui sort de la conduite de ventilation (petites particules entraînées). */
function souffle(sortie, dir, n = 220) {
  const pos = new Float32Array(n * 3);
  const vie = new Float32Array(n);
  for (let i = 0; i < n; i++) vie[i] = Math.random();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xbfd8ff, size: 0.035, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  const graine = Array.from({ length: n }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1]);
  p.userData.maj = (dt) => {
    for (let i = 0; i < n; i++) {
      vie[i] += dt * 0.45;
      if (vie[i] > 1) vie[i] -= 1;
      const t = vie[i];
      const d = t * 6;
      const s = 0.25 + t * 1.6;
      pos[3 * i] = sortie.x + dir.x * d + graine[i][0] * s * 0.6;
      pos[3 * i + 1] = sortie.y + dir.y * d - t * 0.6 + graine[i][1] * s * 0.4;
      pos[3 * i + 2] = sortie.z + dir.z * d + graine[i][1] * s * 0.6;
    }
    g.attributes.position.needsUpdate = true;
  };
  return p;
}

// ------------------------------------------------------------------ jeu

/**
 * Lance la carte dans l'élément el (vidé). opts : { toast }.
 * Retourne { dispose(), echap() → vrai si une couche a été fermée }.
 */
export function lancer(el, opts = {}) {
  el.classList.add('carte');
  el.classList.toggle('tactile', TACTILE);
  el.innerHTML = `
    <canvas class="carte-vue" tabindex="0" aria-label="Vue 3D de la mine"></canvas>
    <div class="carte-hud">
      <div class="carte-mini" aria-hidden="true"><canvas></canvas></div>
      <div class="carte-prog"></div>
      <div class="carte-objectif" aria-live="polite"></div>
      <div class="carte-invite" hidden></div>
      <div class="carte-aide"></div>
      <div class="carte-outils">
        <button type="button" class="btn" data-c="vue" title="Changer de vue (V)">Vue <kbd>V</kbd></button>
        <button type="button" class="btn" data-c="plan" title="Carte 3D (M)">Carte <kbd>M</kbd></button>
        <button type="button" class="btn" data-c="plein" title="Plein écran (F)" aria-label="Plein écran">⛶</button>
      </div>
      <div class="carte-tactile" ${TACTILE ? '' : 'hidden'}>
        <div class="carte-manette"><span></span></div>
        <button type="button" class="carte-tbtn" data-c="action">E</button>
        <button type="button" class="carte-tbtn" data-c="course">Courir</button>
      </div>
      <div class="carte-viseur"></div>
    </div>
    <div class="carte-carte" hidden>
      <div class="carte-carte-outils">
        <button type="button" class="btn" data-c="zoom+" aria-label="Rapprocher">+</button>
        <button type="button" class="btn" data-c="zoom-" aria-label="Éloigner">−</button>
        <button type="button" class="btn" data-c="tourner-g" aria-label="Tourner à gauche">⟲</button>
        <button type="button" class="btn" data-c="tourner-d" aria-label="Tourner à droite">⟳</button>
        <button type="button" class="btn" data-c="incliner">Incliner</button>
        <button type="button" class="btn" data-c="nord">Nord</button>
        <button type="button" class="btn" data-c="centrer">Me centrer</button>
      </div>
      <aside class="carte-legende"></aside>
    </div>
    <div class="carte-avis" role="status" aria-live="polite" hidden></div>
    <div class="carte-fiche" hidden role="dialog" aria-modal="true"></div>
    <div class="carte-intro"></div>
    <div class="carte-chargement">Chargement de la mine…</div>
  `;
  const $ = (s) => el.querySelector(s);
  const canvas = $('.carte-vue');

  // ---------------------------------------------------------------- rendu

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !TACTILE, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, TACTILE ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !TACTILE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.FogExp2(0x07090d, 0.052);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.07;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 120);
  scene.add(new THREE.HemisphereLight(0x8fa6c8, 0x2b2118, 0.42));

  // Mine, plancher (sans sa galerie en écorché ni les outils du montage), foreuse.
  const mine = construireMine();
  scene.add(mine.group);

  const p02 = buildProcedural(plancherModeles, 'P02');
  const enlever = [];
  p02.root.traverse((o) => { if (o.userData.stepOnly || o.userData.partRef === 'G') enlever.push(o); });
  for (const o of enlever) o.parent?.remove(o);
  const pieces = new Map();
  for (const p of p02.root.children) if (p.userData.partRef) pieces.set(p.userData.partRef, p);
  p02.root.updateMatrixWorld(true);
  const boiteDe = (o) => new THREE.Box3().setFromObject(o);
  const boites = [];
  for (const ref of ['11', '12']) if (pieces.has(ref)) boites.push(boiteDe(pieces.get(ref)));
  const plancher = fusionner(p02.root);
  scene.add(plancher);

  // Foreuse STM-1500 (Usinage Marcotte) sur la section 1, tournée vers le front
  // (X négatif) ; traîneau dégagé du plancher secondaire, à côté de la tour.
  const stm = buildProcedural(stmModeles, 'P010', { quality: 0.6 });
  const foreuse = new THREE.Group();
  stm.root.rotation.y = Math.PI;
  foreuse.add(stm.root);
  foreuse.position.set(1.78, 0.2286, -0.72);
  scene.add(foreuse);
  foreuse.updateMatrixWorld(true);
  const bForeuse = boiteDe(foreuse);
  boites.push(bForeuse);
  const foreuseFusion = fusionner(foreuse);
  scene.remove(foreuse);
  scene.add(foreuseFusion);

  // Travailleur.
  const av = creerAvatar();
  scene.add(av.group);

  // Lampe frontale (projecteur) et lueur autour du travailleur.
  const lampe = new THREE.SpotLight(0xfff0d6, 34, 38, 0.55, 0.85, 1.2);
  lampe.castShadow = !TACTILE;
  lampe.shadow.mapSize.set(1024, 1024);
  lampe.shadow.camera.near = 0.2;
  lampe.shadow.camera.far = 30;
  lampe.shadow.bias = -0.0006;
  lampe.shadow.normalBias = 0.02;
  scene.add(lampe, lampe.target);
  const lueur = new THREE.PointLight(0xffe6c2, 1.6, 6, 1.6);
  scene.add(lueur);

  const poussieres = poussiere(TACTILE ? 400 : 900);
  scene.add(poussieres);
  const air = souffle(mine.sortieVent, mine.directionVent);
  scene.add(air);

  // Rendu avec halo lumineux (marqueurs, lentilles, gyrophare).
  const composer = new EffectComposer(renderer);
  const rendu = new RenderPass(scene, camera);
  composer.addPass(rendu);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------------------------------------------------------------- collisions

  const segs = segments();
  // Barricade : franchie seulement une fois vérifiée (ou en exploration libre).
  const barricade = { a: [BARRICADE_X, -GAL - 0.3], b: [BARRICADE_X, GAL + 0.3], e: 0.05, barricade: true };
  segs.push(barricade);
  const etat = {
    pos: new THREE.Vector3(XD + 0.4, 0, 41),
    vit: new THREE.Vector3(),
    vy: 0,
    cap: 0, // orientation du travailleur
    lacet: 0, tangage: -0.08, // caméra
    vue: 1, vueCible: 1, // 0 : 1re personne, 1 : 3e personne
    dist: 3.1,
    course: false,
    libre: false, // exploration libre (pas de tournée)
    barricadeOuverte: false,
    etape: 0,
    fini: false,
    reponses: {}, // #R → 'oui' | 'non' | texte
    planif: [], // { T, R, risques: [], controles: [] }
    destination: null, // [x, z] du point ciblé sur la carte
    chemin: null,
    t: 0,
    pause: true,
  };
  etat.pos.y = marche(etat.pos.x, etat.pos.z);

  function pousser(p, pieds) {
    for (let it = 0; it < 4; it++) {
      const d = sdf(p.x, p.z);
      if (d > -R) {
        const [gx, gz] = gradient(p.x, p.z);
        p.x -= gx * (d + R);
        p.z -= gz * (d + R);
      }
      for (const s of segs) {
        if (s.barricade && (etat.barricadeOuverte || etat.libre)) continue;
        const [ax, az] = s.a, [bx, bz] = s.b;
        const dx = bx - ax, dz = bz - az;
        const t = clamp(((p.x - ax) * dx + (p.z - az) * dz) / (dx * dx + dz * dz), 0, 1);
        const qx = ax + dx * t, qz = az + dz * t;
        const ex = p.x - qx, ez = p.z - qz;
        const l = Math.hypot(ex, ez), m = R + s.e;
        if (l < m) {
          if (l < 1e-6) { p.x += m; continue; }
          p.x = qx + (ex / l) * m;
          p.z = qz + (ez / l) * m;
          if (s.barricade && !etat.toucheBarricade) etat.toucheBarricade = true;
        }
      }
      for (const b of boites) {
        if (pieds > b.max.y - 0.3) continue;
        const qx = clamp(p.x, b.min.x, b.max.x), qz = clamp(p.z, b.min.z, b.max.z);
        const ex = p.x - qx, ez = p.z - qz;
        const l = Math.hypot(ex, ez);
        if (l >= R) continue;
        if (l > 1e-6) { p.x = qx + (ex / l) * R; p.z = qz + (ez / l) * R; continue; }
        // Dedans : sortie par le côté le plus proche.
        const o = [[p.x - b.min.x, -1, 0], [b.max.x - p.x, 1, 0], [p.z - b.min.z, 0, -1], [b.max.z - p.z, 0, 1]].sort((u, v) => u[0] - v[0])[0];
        p.x += o[1] * (o[0] + R);
        p.z += o[2] * (o[0] + R);
      }
    }
  }

  /** Position praticable pour l'itinéraire (barricade ignorée, objets et garde-corps pris en compte). */
  const libre = (x, z) => {
    if (sdf(x, z) > -R) return false;
    for (const s of segs) {
      if (s.barricade) continue;
      const [ax, az] = s.a, [bx, bz] = s.b;
      const dx = bx - ax, dz = bz - az;
      const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
      if (Math.hypot(x - ax - dx * t, z - az - dz * t) < R + s.e - 0.05) return false;
    }
    for (const b of boites) {
      if (marche(x, z) > b.max.y - 0.3) continue;
      if (x > b.min.x - R + 0.05 && x < b.max.x + R - 0.05 && z > b.min.z - R + 0.05 && z < b.max.z + R - 0.05) return false;
    }
    return true;
  };
  const gps = grilleChemins(BORNES, libre);

  // ---------------------------------------------------------------- points d'inspection

  const zEsc = (ESC.z0 + ESC.z1) / 2;
  const POS = {
    refuge: [REFUGE.x0 - 1.0, REFUGE_Z],
    barricade: [BARRICADE_X + 1.1, -0.9],
    extincteur: [L + 3.25, 1.35],
    acces: [ESC.x1 + 0.75, zEsc],
    foreuse: [bForeuse.max.x + 0.75, (bForeuse.min.z + bForeuse.max.z) / 2 + 0.2],
    ventilation: [mine.sortieVent.x + 1.4, 1.35],
    terrain: [6.6, -1.1],
  };
  const points = POINTS.map((p) => {
    const [x, z] = POS[p.id];
    const y = marche(x, z);
    const m = marqueur(p.couleur, p.icone);
    m.position.set(x, y, z);
    m.visible = false;
    scene.add(m);
    return { ...p, x, z, y, marqueur: m, fait: false };
  });
  const pointActif = () => (etat.libre || etat.fini ? null : points[etat.etape]);

  // Distance à pied, de l'entrée de la place de travail au refuge (question 18).
  const cheminRefuge = gps.trouver([GAL_X1, 0], POS.refuge);
  const distRefuge = cheminRefuge ? Math.round(gps.longueur(cheminRefuge)) : null;

  // ---------------------------------------------------------------- minicarte (plan 2D)

  const plan = imagePlan(BORNES, sdf, { refuge: { ...REFUGE, zc: REFUGE_Z }, escalier: ESC });
  const mini = $('.carte-mini canvas');
  const miniX = mini.getContext('2d');

  function blips() {
    const out = [];
    const a = pointActif();
    if (a) out.push({ x: a.x, z: a.z, couleur: a.couleur, lettre: a.icone, actif: true });
    // Repères permanents : refuge et extincteur (questions 18 et 19).
    out.push({ x: REFUGE.x0 + 0.5, z: REFUGE_Z, couleur: '#22d36b', lettre: 'R', fixe: true });
    out.push({ x: L + 3.65, z: 2.35, couleur: '#ff4d4d', lettre: 'E', fixe: true });
    if (etat.destination) out.push({ x: etat.destination[0], z: etat.destination[1], couleur: ROUTE, lettre: '', actif: true });
    return out;
  }

  function dessinerMini() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const taille = mini.clientWidth || 180;
    if (mini.width !== Math.round(taille * dpr)) { mini.width = mini.height = Math.round(taille * dpr); }
    const x = miniX;
    const r = mini.width / 2;
    const ech = (r / 21) / PX;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, mini.width, mini.height);
    x.save();
    x.beginPath();
    x.arc(r, r, r - 1, 0, Math.PI * 2);
    x.clip();
    x.fillStyle = '#0e1218';
    x.fillRect(0, 0, mini.width, mini.height);
    const rot = etat.lacet + Math.PI;
    const pu = plan.U(etat.pos.x), pv = plan.V(etat.pos.z);
    x.translate(r, r);
    x.rotate(rot);
    x.scale(ech, ech);
    x.translate(-pu, -pv);
    x.drawImage(plan.canvas, 0, 0);
    if (etat.chemin) trace(x, etat.chemin.map(([wx, wz]) => [plan.U(wx), plan.V(wz)]), (4 * dpr) / ech, ROUTE);
    x.restore();
    // Repères (droits), ramenés au bord s'ils sont hors de la minicarte.
    const versEcran = (wx, wz) => {
      const du = (plan.U(wx) - pu) * ech, dv = (plan.V(wz) - pv) * ech;
      const c = Math.cos(rot), s = Math.sin(rot);
      return [du * c - dv * s, du * s + dv * c];
    };
    for (const b of blips()) {
      let [sx, sy] = versEcran(b.x, b.z);
      const l = Math.hypot(sx, sy), lim = r - 12 * dpr;
      if (l > lim) { sx *= lim / l; sy *= lim / l; }
      pastille(x, r + sx, r + sy, (b.actif ? 8 : 6.5) * dpr, b.couleur, b.lettre);
    }
    flecheJoueur(x, r, r, etat.lacet - etat.cap, 8 * dpr);
    const lim = r - 10 * dpr;
    pastille(x, r + Math.sin(rot) * lim, r - Math.cos(rot) * lim, 7 * dpr, '#e5eaf0', 'N', { anneau: '#10151b' });
  }

  // ---------------------------------------------------------------- carte 3D (touche M)

  const carte3d = creerCarte3D({
    scene, canvas, mine, bornes: BORNES, sdf, marche, y0: Y0, couleurRoute: ROUTE,
    etiquettes: [
      ['Galerie principale', XD, 22],
      ['Place de travail', L / 2 + 2, -GAL - 1.6],
      ['Front de taille', -1.2, 0],
      ['Refuge', REFUGE.x0 + 3, REFUGE_Z - 3.4],
      ['Rampe d\u2019accès', XD - 13, 55],
    ],
    surClic: (x, z) => { etat.destination = [x, z]; majChemin(true); legende(); avis('Destination placée : suivez l\u2019itinéraire'); },
  });
  const planOuvert = () => carte3d.ouverte;
  let renduChemin = null;

  /** Pastilles de la carte 3D : points de la tournée, refuge, extincteur, destination. */
  function pastillesCarte() {
    const l = [];
    if (!etat.libre) for (const p of points) l.push({ x: p.x, z: p.z, couleur: p.fait ? '#7d8597' : p.couleur, lettre: p.fait ? '✓' : p.icone, actif: p === pointActif() });
    if (etat.libre || etat.fini) {
      l.push({ x: REFUGE.x0 + 0.5, z: REFUGE_Z, couleur: '#22d36b', lettre: 'R' });
      l.push({ x: L + 3.65, z: 2.35, couleur: '#ff4d4d', lettre: 'E' });
    }
    if (etat.destination) l.push({ x: etat.destination[0], z: etat.destination[1], couleur: ROUTE, lettre: '', actif: true });
    carte3d.majPastilles(l);
  }

  function legende() {
    const l = $('.carte-legende');
    const ligne = (c, t, d) => `<li><span class="carte-pt" style="--c:${c}">${esc(t)}</span><span>${esc(d)}</span></li>`;
    const aide = TACTILE
      ? 'Glisser : déplacer · pincer : rapprocher · deux doigts : tourner et incliner · toucher une galerie : itinéraire.'
      : 'Glisser : déplacer · clic droit ou Maj + glisser : tourner et incliner · molette : rapprocher · clic sur une galerie : itinéraire.';
    l.innerHTML = `
      <h3>Carte de la mine</h3>
      <p class="carte-petit">${aide}</p>
      <ul>
        ${ligne('#22d36b', 'R', `Refuge${distRefuge ? ` — ${distRefuge} m à pied de la place de travail` : ''}`)}
        ${ligne('#ff4d4d', 'E', 'Extincteur et armoire de premiers soins')}
        ${ligne(ROUTE, '', 'Itinéraire')}
      </ul>
      ${etat.libre ? '' : `<h4>Tournée d\u2019inspection</h4><ol>${points.map((p) => `<li class="${p.fait ? 'fait' : p === pointActif() ? 'actif' : ''}"><span class="carte-pt" style="--c:${p.couleur}">${p.icone}</span>${esc(p.titre)}</li>`).join('')}</ol>`}
      <div class="carte-legende-pied">
        <button type="button" class="btn" data-c="effacer" ${etat.destination ? '' : 'hidden'}>Effacer l\u2019itinéraire</button>
        <button type="button" class="btn primary" data-c="fermer-plan">Retour à pied</button>
      </div>`;
    pastillesCarte();
  }

  function basculerPlan(ouvrir = !planOuvert()) {
    if (ouvrir === planOuvert()) return;
    $('.carte-carte').hidden = !ouvrir;
    $('.carte-hud').hidden = ouvrir;
    if (ouvrir) {
      document.exitPointerLock?.();
      touches.clear();
      carte3d.ouvrir(etat.pos, etat.lacet + Math.PI);
      majChemin(true);
      legende();
      tailleCarte();
    } else {
      carte3d.fermer();
      tailleCarte();
      canvas.focus();
    }
    rendu.camera = ouvrir ? carte3d.camera : camera;
    // Pas de halo sur la carte : les surfaces éclairées d'en haut resteraient éblouissantes.
    bloom.enabled = !ouvrir;
    renduChemin = null;
  }

  // ---------------------------------------------------------------- itinéraire

  let tChemin = 0;
  function majChemin(force = false) {
    const cible = etat.destination || (pointActif() ? [pointActif().x, pointActif().z] : null);
    if (!cible) { etat.chemin = null; return; }
    if (!force && performance.now() - tChemin < 350) return;
    tChemin = performance.now();
    if (Math.hypot(cible[0] - etat.pos.x, cible[1] - etat.pos.z) < 1.2) { etat.chemin = null; return; }
    etat.chemin = gps.trouver([etat.pos.x, etat.pos.z], cible);
    if (etat.destination && Math.hypot(etat.destination[0] - etat.pos.x, etat.destination[1] - etat.pos.z) < 1.5) {
      etat.destination = null;
      avis('Destination atteinte', 1600);
    }
  }

  // ---------------------------------------------------------------- interface

  const objectif = $('.carte-objectif');
  const invite = $('.carte-invite');
  const prog = $('.carte-prog');
  function majObjectif() {
    const a = pointActif();
    if (etat.libre) objectif.innerHTML = `<b>Exploration libre</b> — ouvrez la carte 3D (<kbd>M</kbd>) pour choisir une destination.`;
    else if (etat.fini) objectif.innerHTML = '<b>Tournée terminée</b> — place de travail vérifiée.';
    else if (a) objectif.innerHTML = `<span class="carte-pt" style="--c:${a.couleur}">${a.icone}</span> ${esc(a.consigne)}`;
    const n = points.filter((p) => p.fait).length;
    prog.hidden = etat.libre;
    prog.innerHTML = `<span>Inspection</span><b>${n}/${points.length}</b><i style="--p:${n / points.length}"></i>`;
  }
  let tAvis = 0;
  /** Message bref en bas de la vue. */
  function avis(msg, ms = 2600) {
    const b = $('.carte-avis');
    b.textContent = msg;
    b.hidden = false;
    clearTimeout(tAvis);
    tAvis = setTimeout(() => { b.hidden = true; }, ms);
  }

  const AIDE = TACTILE
    ? 'Manette à gauche : marcher · glisser à droite : regarder · E : inspecter'
    : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> marcher · <kbd>Maj</kbd> courir · souris : regarder · <kbd>V</kbd> vue · <kbd>M</kbd> carte · <kbd>E</kbd> inspecter';
  $('.carte-aide').innerHTML = AIDE;

  // ---------------------------------------------------------------- fiche de question

  const fiche = $('.carte-fiche');
  const ficheOuverte = () => !fiche.hidden;
  function texteEndroit(n) {
    if (n === 18) return `Refuge de la galerie principale, dans la recoupe au sud${distRefuge ? `, à ${distRefuge} m à pied de l’entrée de la place de travail` : ''}`;
    if (n === 19) return 'À l’entrée de la place de travail, au sol à côté de l’armoire de premiers soins (derrière la barricade)';
    return '';
  }

  function ouvrirFiche(p) {
    document.exitPointerLock?.();
    let i = 0;
    const T = POINTS.indexOf(POINTS.find((q) => q.id === p.id)) + 1;
    const rendre = () => {
      if (i >= p.questions.length) {
        fiche.hidden = true;
        p.fait = true;
        p.marqueur.visible = false;
        if (p.id === 'barricade') etat.barricadeOuverte = true;
        etat.etape++;
        if (etat.etape >= points.length) terminer();
        else { avis(`Vérifié : ${p.titre}`); majObjectif(); majChemin(true); }
        canvas.focus();
        return;
      }
      const n = p.questions[i];
      const q = QUESTIONS[n];
      const entete = `<header><span class="carte-pt" style="--c:${p.couleur}">${p.icone}</span><div><small>INSPECTION · analyse de risque sur le terrain</small><h3>${esc(p.titre)}</h3></div><em>${i + 1}/${p.questions.length}</em></header>`;
      if (q.endroit) {
        fiche.innerHTML = `${entete}<div class="carte-q"><span class="carte-num">#R ${n}</span><p>${esc(q.texte)}</p></div>
          <label class="carte-champ">Endroit<textarea rows="2">${esc(texteEndroit(n))}</textarea></label>
          <footer><button type="button" class="btn primary" data-r="noter">Noter</button></footer>`;
        fiche.querySelector('[data-r="noter"]').onclick = () => { etat.reponses[n] = fiche.querySelector('textarea').value.trim() || texteEndroit(n); i++; rendre(); };
      } else {
        const ombre = (r) => (q.ombre === r ? ' ombre' : '');
        fiche.innerHTML = `${entete}<div class="carte-q"><span class="carte-num">#R ${n}</span><p>${esc(q.texte)}</p></div>
          <div class="carte-oui-non"><button type="button" class="carte-rep${ombre('oui')}" data-r="oui">Oui</button><button type="button" class="carte-rep${ombre('non')}" data-r="non">Non</button></div>
          <p class="carte-petit">Case ombrée (comme sur le formulaire) : noter le type de risque et le moyen de contrôle dans la planification.</p>`;
        for (const b of fiche.querySelectorAll('[data-r]')) b.onclick = () => {
          const r = b.dataset.r;
          etat.reponses[n] = r;
          if (q.ombre === r) planifier(n, T, p, () => { i++; rendre(); });
          else { i++; rendre(); }
        };
      }
      fiche.hidden = false;
      fiche.querySelector('button, textarea')?.focus();
    };
    rendre();
  }

  function planifier(n, T, p, suite) {
    const choix = { risques: new Set(), controles: new Set() };
    const puces = (liste, sugg, cle) => {
      const tri = [...sugg, ...liste.filter((x) => !sugg.includes(x))];
      return tri.map((t, k) => `<button type="button" class="carte-puce${k < sugg.length ? ' sugg' : ''}" data-k="${cle}" data-v="${esc(t)}" aria-pressed="false" ${k >= sugg.length ? 'data-plus' : ''} ${k >= sugg.length ? 'hidden' : ''}>${esc(t)}</button>`).join('');
    };
    fiche.innerHTML = `<header class="planif"><div><small>PLANIFICATION · #T ${T} / #R ${n}</small><h3>Risque à contrôler</h3></div></header>
      <p class="carte-q-court">${esc(QUESTIONS[n].texte)} — <b>${esc(etat.reponses[n] === 'oui' ? 'Oui' : 'Non')}</b></p>
      <h4 class="carte-rouge">Types de risques</h4><div class="carte-puces">${puces(RISQUES, p.risques, 'risques')}</div>
      <h4 class="carte-vert">Moyens de contrôle</h4><div class="carte-puces">${puces(CONTROLES, p.controles, 'controles')}</div>
      <footer><button type="button" class="btn" data-a="plus">Toute la liste du formulaire</button><button type="button" class="btn primary" data-a="ok" disabled>Ajouter à la planification</button></footer>`;
    const ok = fiche.querySelector('[data-a="ok"]');
    fiche.querySelector('[data-a="plus"]').onclick = (e) => { for (const b of fiche.querySelectorAll('[data-plus]')) b.hidden = false; e.target.hidden = true; };
    for (const b of fiche.querySelectorAll('.carte-puce')) b.onclick = () => {
      const s = choix[b.dataset.k];
      if (s.has(b.dataset.v)) s.delete(b.dataset.v); else s.add(b.dataset.v);
      b.setAttribute('aria-pressed', s.has(b.dataset.v));
      ok.disabled = !(choix.risques.size && choix.controles.size);
    };
    ok.onclick = () => { etat.planif.push({ T, R: n, risques: [...choix.risques], controles: [...choix.controles] }); suite(); };
  }

  function terminer() {
    etat.fini = true;
    etat.barricadeOuverte = true;
    majObjectif();
    majChemin(true);
    avis('Tournée terminée : place de travail vérifiée', 3000);
    setTimeout(bilan, 900);
  }

  function bilan() {
    document.exitPointerLock?.();
    const nums = Object.keys(etat.reponses).map(Number).sort((a, b) => a - b);
    const heure = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    const lignes = nums.map((n) => {
      const r = etat.reponses[n], q = QUESTIONS[n];
      if (q.endroit) return `<tr><td>${n}</td><td>${esc(q.texte)}</td><td colspan="2" class="carte-endroit">${esc(r)}</td></tr>`;
      const c = (v) => `<td class="${q.ombre === v ? 'ombre' : ''}">${r === v ? '✕' : ''}</td>`;
      return `<tr><td>${n}</td><td>${esc(q.texte)}</td>${c('oui')}${c('non')}</tr>`;
    }).join('');
    const plan = etat.planif.length
      ? etat.planif.map((l) => `<tr><td>${l.T}</td><td>${l.R}</td><td>${esc(l.risques.join(', '))}</td><td>${esc(l.controles.join(', '))}</td></tr>`).join('')
      : '<tr><td colspan="4" class="carte-petit">Aucune réponse sur une case ombrée : rien à planifier.</td></tr>';
    fiche.innerHTML = `<header class="bilan"><div><small>${esc(SOURCE)}</small><h3>Bilan de la tournée</h3></div></header>
      <div class="carte-bilan">
        <p>${etat.nom ? `Travailleur : <b>${esc(etat.nom)}</b> · ` : ''}${etat.foreuse ? `Foreuse : <b>${esc(etat.foreuse)}</b> · ` : ''}Place de travail vérifiée à <b>${heure}</b></p>
        <h4 class="carte-rouge">Inspection — analyse de risque sur le terrain</h4>
        <table><thead><tr><th>#R</th><th>Question</th><th>Oui</th><th>Non</th></tr></thead><tbody>${lignes}</tbody></table>
        <h4 class="carte-bleu">Planification</h4>
        <table><thead><tr><th>#T</th><th>#R</th><th>Type de risques</th><th>Moyen de contrôle</th></tr></thead><tbody>${plan}</tbody></table>
        <p class="carte-petit">Les questions 2, 6, 7, 9, 10, 11, 17, 20 et 21 se répondent avant la tournée, sur le formulaire papier : elles ne dépendent pas d’un endroit de la carte.</p>
      </div>
      <footer><button type="button" class="btn" data-a="copier">Copier le bilan</button><button type="button" class="btn" data-a="refaire">Recommencer</button><button type="button" class="btn primary" data-a="libre">Exploration libre</button></footer>`;
    fiche.hidden = false;
    fiche.querySelector('[data-a="libre"]').onclick = () => { fiche.hidden = true; etat.libre = true; majObjectif(); canvas.focus(); };
    fiche.querySelector('[data-a="refaire"]').onclick = () => { fiche.hidden = true; recommencer(false); };
    fiche.querySelector('[data-a="copier"]').onclick = async (e) => {
      const txt = [`${SOURCE} — bilan de la tournée (${heure})`, ...nums.map((n) => `#R ${n} ${QUESTIONS[n].texte} : ${QUESTIONS[n].endroit ? etat.reponses[n] : etat.reponses[n].toUpperCase()}`),
        ...etat.planif.map((l) => `Planification #T ${l.T} #R ${l.R} — risques : ${l.risques.join(', ')} ; contrôle : ${l.controles.join(', ')}`)].join('\n');
      try { await navigator.clipboard.writeText(txt); e.target.textContent = 'Copié'; } catch { e.target.textContent = 'Copie impossible'; }
    };
  }

  function recommencer(libre) {
    etat.libre = libre;
    etat.fini = false;
    etat.etape = 0;
    etat.reponses = {};
    etat.planif = [];
    etat.destination = null;
    etat.barricadeOuverte = false;
    for (const p of points) { p.fait = false; p.marqueur.visible = false; }
    etat.pos.set(XD + 0.4, 0, 41);
    etat.pos.y = marche(etat.pos.x, etat.pos.z);
    etat.lacet = 0; etat.cap = 0; etat.tangage = -0.08;
    majObjectif();
    majChemin(true);
    if (!libre) avis('Suivez l’itinéraire orange jusqu’à chaque point', 3000);
  }

  // ---------------------------------------------------------------- écran d'accueil

  const intro = $('.carte-intro');
  intro.innerHTML = `
    <div class="carte-intro-boite card-box">
      <h3>Carte 3D de la place de travail</h3>
      <p>Forage au diamant sous terre — tournée d\u2019inspection du formulaire MA4657078 (Machines Roger International).
      Marchez à la 1<sup>re</sup> ou à la 3<sup>e</sup> personne ; la carte 3D (<kbd>M</kbd>) montre la mine vue du ciel.</p>
      <div class="carte-intro-champs">
        <label>Nom du travailleur <input type="text" autocomplete="name" data-i="nom" placeholder="facultatif"></label>
        <label>No. de la foreuse <input type="text" data-i="foreuse" placeholder="facultatif"></label>
      </div>
      <div class="carte-intro-actions">
        <button type="button" class="btn primary" data-a="tournee">Commencer la tournée d\u2019inspection</button>
        <button type="button" class="btn" data-a="libre">Exploration libre</button>
      </div>
      <p class="carte-petit">${AIDE}</p>
    </div>`;
  const demarrer = (libre) => {
    etat.nom = intro.querySelector('[data-i="nom"]').value.trim();
    etat.foreuse = intro.querySelector('[data-i="foreuse"]').value.trim();
    intro.hidden = true;
    etat.pause = false;
    recommencer(libre);
    canvas.focus();
    if (!TACTILE) canvas.requestPointerLock?.();
  };
  intro.querySelector('[data-a="tournee"]').onclick = () => demarrer(false);
  intro.querySelector('[data-a="libre"]').onclick = () => demarrer(true);

  // ---------------------------------------------------------------- commandes

  const touches = new Set();
  const manette = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  let action = false;
  const saisie = (e) => e.target.closest?.('input, textarea');

  function basculerVue() { etat.vueCible = etat.vueCible ? 0 : 1; }
  function pleinEcran() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  }
  const surTouche = (e) => {
    if (saisie(e) || etat.pause) return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (ficheOuverte()) return;
    if (k === 'm') { basculerPlan(); return; }
    if (planOuvert()) {
      if (k === '+' || k === '=') carte3d.zoom(1 / 1.3);
      else if (k === '-') carte3d.zoom(1.3);
      return;
    }
    if (k === 'v') basculerVue();
    else if (k === 'e' || k === 'enter') action = true;
    else if (k === 'f') pleinEcran();
    touches.add(e.code);
  };
  const surRelache = (e) => touches.delete(e.code);
  const perdu = () => touches.clear();
  window.addEventListener('keydown', surTouche);
  window.addEventListener('keyup', surRelache);
  window.addEventListener('blur', perdu);

  // Souris : verrouillage du pointeur au clic (ordinateur), sinon glisser pour regarder.
  let glisse = null;
  // Échap qui vient de libérer le pointeur : ne ferme pas la page en plus.
  let tLibere = 0;
  const surVerrou = () => { if (document.pointerLockElement !== canvas) tLibere = performance.now(); };
  document.addEventListener('pointerlockchange', surVerrou);
  const regarder = (dx, dy, k = 0.0024) => {
    etat.lacet -= dx * k;
    etat.tangage = clamp(etat.tangage - dy * k, -1.25, etat.vue < 0.5 ? 1.3 : 0.75);
  };
  canvas.addEventListener('click', () => { if (!TACTILE && !etat.pause && !ficheOuverte() && !planOuvert()) canvas.requestPointerLock?.(); });
  const surSouris = (e) => { if (document.pointerLockElement === canvas) regarder(e.movementX, e.movementY); };
  document.addEventListener('mousemove', surSouris);
  canvas.addEventListener('wheel', (e) => { if (planOuvert()) return; e.preventDefault(); etat.dist = clamp(etat.dist + e.deltaY * 0.003, 1.8, 6); etat.distReglee = true; }, { passive: false });

  // Tactile : manette à gauche, regard à droite.
  const bouton = $('.carte-manette span');
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || planOuvert()) return;
    const r = canvas.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.42 && manette.id == null) {
      manette.id = e.pointerId; manette.ox = e.clientX; manette.oy = e.clientY;
      const m = $('.carte-manette');
      m.style.left = `${e.clientX - r.left}px`; m.style.top = `${e.clientY - r.top}px`;
      m.classList.add('active');
    } else if (glisse == null) glisse = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (planOuvert()) return;
    if (e.pointerId === manette.id) {
      const dx = e.clientX - manette.ox, dy = e.clientY - manette.oy;
      const l = Math.hypot(dx, dy), max = 48;
      const k = l > max ? max / l : 1;
      manette.x = (dx * k) / max; manette.y = (dy * k) / max;
      bouton.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    } else if (glisse && e.pointerId === glisse.id) {
      regarder(e.clientX - glisse.x, e.clientY - glisse.y, 0.005);
      glisse.x = e.clientX; glisse.y = e.clientY;
    } else if (e.pointerType === 'mouse' && e.buttons && document.pointerLockElement !== canvas) {
      regarder(e.movementX, e.movementY);
    }
  });
  const fin = (e) => {
    if (e.pointerId === manette.id) { manette.id = null; manette.x = manette.y = 0; bouton.style.transform = ''; $('.carte-manette').classList.remove('active'); }
    if (glisse && e.pointerId === glisse.id) glisse = null;
  };
  canvas.addEventListener('pointerup', fin);
  canvas.addEventListener('pointercancel', fin);

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    const c = b.dataset.c;
    if (c === 'vue') basculerVue();
    else if (c === 'plan') basculerPlan();
    else if (c === 'fermer-plan') basculerPlan(false);
    else if (c === 'plein') pleinEcran();
    else if (c === 'action') action = true;
    else if (c === 'course') { etat.course = !etat.course; b.setAttribute('aria-pressed', etat.course); }
    else if (c === 'zoom+') carte3d.zoom(1 / 1.4);
    else if (c === 'zoom-') carte3d.zoom(1.4);
    else if (c === 'tourner-g') carte3d.tourner(-Math.PI / 4);
    else if (c === 'tourner-d') carte3d.tourner(Math.PI / 4);
    else if (c === 'incliner') carte3d.incliner();
    else if (c === 'nord') carte3d.nord();
    else if (c === 'centrer') carte3d.centrer(etat.pos);
    else if (c === 'effacer') { etat.destination = null; majChemin(true); legende(); }
  });

  // ---------------------------------------------------------------- boucle

  const avant = new THREE.Vector3(), droite = new THREE.Vector3(), dir = new THREE.Vector3();
  const tete = new THREE.Vector3(), camTP = new THREE.Vector3(), camFP = new THREE.Vector3(), vise = new THREE.Vector3();
  const lampeMonde = new THREE.Vector3();
  let precedent = performance.now();
  let raf = 0;

  function deplacer(dt) {
    let ix = 0, iy = 0;
    if (touches.has('KeyW') || touches.has('ArrowUp') || touches.has('KeyZ')) iy += 1;
    if (touches.has('KeyS') || touches.has('ArrowDown')) iy -= 1;
    if (touches.has('KeyA') || touches.has('ArrowLeft') || touches.has('KeyQ')) ix -= 1;
    if (touches.has('KeyD') || touches.has('ArrowRight')) ix += 1;
    ix += manette.x; iy -= manette.y;
    const n = Math.hypot(ix, iy);
    if (n > 1) { ix /= n; iy /= n; }
    const court = etat.course || touches.has('ShiftLeft') || touches.has('ShiftRight') || Math.hypot(manette.x, manette.y) > 0.95;
    const v = (court ? V_COURSE : V_MARCHE);
    avant.set(-Math.sin(etat.lacet), 0, -Math.cos(etat.lacet));
    droite.set(Math.cos(etat.lacet), 0, -Math.sin(etat.lacet));
    dir.copy(avant).multiplyScalar(iy).addScaledVector(droite, ix);
    const cible = dir.clone().multiplyScalar(v);
    etat.vit.lerp(cible, 1 - Math.exp(-dt * 10));
    const p0 = etat.pos.clone();
    const essai = (dx, dz) => {
      const p = new THREE.Vector3(p0.x + dx, p0.y, p0.z + dz);
      pousser(p, p0.y);
      const h = marche(p.x, p.z);
      return h - p0.y > MARCHE_MAX ? null : p;
    };
    const dx = etat.vit.x * dt, dz = etat.vit.z * dt;
    const p = essai(dx, dz) || essai(dx, 0) || essai(0, dz) || p0;
    etat.pos.x = p.x; etat.pos.z = p.z;
    // Vertical : marche franchie en douceur, chute avec la gravité.
    const h = marche(etat.pos.x, etat.pos.z);
    if (h >= etat.pos.y) { etat.pos.y += (h - etat.pos.y) * Math.min(1, dt * 16); etat.vy = 0; }
    else {
      etat.vy -= 9.8 * dt;
      etat.pos.y = Math.max(h, etat.pos.y + etat.vy * dt);
      if (etat.pos.y === h) etat.vy = 0;
    }
    const vitesse = Math.hypot(etat.vit.x, etat.vit.z);
    if (etat.vue > 0.5 && vitesse > 0.15) etat.cap = angleVers(etat.cap, Math.atan2(-etat.vit.x, -etat.vit.z), 1 - Math.exp(-dt * 12));
    else if (etat.vue <= 0.5) etat.cap = etat.lacet;
    return vitesse;
  }

  function placerCamera(dt) {
    etat.vue += (etat.vueCible - etat.vue) * (1 - Math.exp(-dt * 7));
    const cp = Math.cos(etat.tangage);
    const regard = new THREE.Vector3(-Math.sin(etat.lacet) * cp, Math.sin(etat.tangage), -Math.cos(etat.lacet) * cp);
    // 1re personne : yeux du travailleur, un peu en avant du visage.
    tete.set(etat.pos.x, etat.pos.y + OEIL + av.group.children[0].position.y, etat.pos.z);
    camFP.copy(tete).addScaledVector(avant.set(-Math.sin(etat.cap), 0, -Math.cos(etat.cap)), 0.1);
    // 3e personne : par-dessus l'épaule droite, recul limité par les parois et la voûte.
    const cible = tete.clone().add(new THREE.Vector3(0, -0.1, 0)).addScaledVector(droite.set(Math.cos(etat.lacet), 0, -Math.sin(etat.lacet)), 0.42);
    let d = 0;
    const pas = 0.08;
    while (d < etat.dist) {
      const q = cible.clone().addScaledVector(regard, -(d + pas));
      if (sdf(q.x, q.z) > -0.22 || q.y > voute(q.x, q.z) - 0.18 || q.y < marche(q.x, q.z) + 0.15) break;
      d += pas;
    }
    camTP.copy(cible).addScaledVector(regard, -d);
    camera.position.lerpVectors(camFP, camTP, etat.vue);
    vise.copy(camera.position).addScaledVector(regard, 10);
    camera.lookAt(vise);
    av.group.visible = etat.vue > 0.28;
    return regard;
  }

  function boucle(t) {
    raf = requestAnimationFrame(boucle);
    const dt = Math.min(0.05, (t - precedent) / 1000);
    precedent = t;
    etat.t += dt;
    const vitesse = etat.pause || ficheOuverte() || planOuvert() ? (etat.vit.set(0, 0, 0), 0) : deplacer(dt);
    av.group.position.copy(etat.pos);
    av.group.rotation.y = etat.cap;
    av.animer(vitesse, dt);
    const regard = placerCamera(dt);

    // Lampe frontale : du casque vers le point visé.
    av.group.updateMatrixWorld(true);
    av.lampe.getWorldPosition(lampeMonde);
    if (etat.vue < 0.5) lampeMonde.copy(camera.position).add(new THREE.Vector3(0, 0.08, 0));
    lampe.position.copy(lampeMonde);
    lampe.target.position.copy(camera.position).addScaledVector(regard, 12);
    lueur.position.copy(lampeMonde).addScaledVector(regard, 0.8);
    const pu = poussieres.material.uniforms;
    pu.uCentre.value.copy(etat.pos);
    pu.uLampe.value.copy(lampeMonde);
    pu.uDir.value.copy(lampe.target.position).sub(lampeMonde).normalize();
    pu.uT.value = etat.t;
    air.userData.maj(dt);

    // Gyrophare du refuge.
    const gy = 0.5 + 0.5 * Math.sin(etat.t * 5.5);
    mine.gyro.light.intensity = 1 + 5 * gy;
    mine.gyro.mesh.material.emissiveIntensity = 1 + 3 * gy;

    // Point à inspecter (vue à pied seulement ; la carte 3D a ses pastilles).
    const a = pointActif();
    for (const p of points) {
      p.marqueur.visible = p === a && !planOuvert();
      if (p === a) p.marqueur.userData.icone.position.y = 1.95 + 0.06 * Math.sin(etat.t * 2);
    }
    // Carte 3D : toit enlevé, lampe et poussière éteintes, le travailleur toujours visible.
    const carte = planOuvert();
    lampe.visible = lueur.visible = poussieres.visible = !carte;
    if (carte) {
      av.group.visible = true;
      carte3d.maj(dt, etat.pos, etat.cap);
      if (renduChemin !== etat.chemin) { renduChemin = etat.chemin; carte3d.majRoute(etat.chemin); }
    }

    // Invite d'inspection.
    let proche = null;
    if (a && !ficheOuverte() && !etat.pause) {
      const d = Math.hypot(a.x - etat.pos.x, a.z - etat.pos.z);
      if (d < 1.5 && Math.abs(a.y - etat.pos.y) < 0.9) proche = a;
    }
    if (proche) {
      const haut = !proche.regarderHaut || etat.tangage > 0.42;
      invite.hidden = false;
      invite.innerHTML = haut
        ? `<kbd>${TACTILE ? 'E' : 'E'}</kbd> Inspecter : <b>${esc(proche.titre)}</b>`
        : 'Regardez vers le haut : support de terrain et roche branlante';
      if (action && haut) ouvrirFiche(proche);
    } else if (etat.toucheBarricade && !etat.barricadeOuverte && !etat.libre) {
      invite.hidden = false;
      invite.innerHTML = 'Barricade : personne autorisée seulement — vérifiez-la d’abord (point B).';
    } else invite.hidden = true;
    etat.toucheBarricade = false;
    action = false;

    if (!etat.pause) majChemin();
    if (!carte) dessinerMini();
    composer.render(dt);
  }

  // ---------------------------------------------------------------- taille

  function taille() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = w < h ? 78 : 68;
    if (!etat.distReglee) etat.dist = w < h ? 3.8 : 3.1;
    camera.updateProjectionMatrix();
    poussieres.material.uniforms.uEchelle.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    tailleCarte();
  }
  /** La carte 3D se centre dans la partie laissée libre par la légende. */
  function tailleCarte() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    const lg = $('.carte-legende');
    const r = planOuvert() && lg ? lg.getBoundingClientRect() : null;
    const etroit = w <= 760;
    carte3d.taille(w, h, !r ? {} : etroit ? { bas: r.height + 12 } : { droite: r.width + 16 });
  }
  const ro = new ResizeObserver(taille);
  ro.observe(el);
  taille();
  majObjectif();
  $('.carte-chargement').remove();
  raf = requestAnimationFrame(boucle);
  if (opts.debut) demarrer(opts.debut === 'libre');

  // ---------------------------------------------------------------- fin

  const api = {
    /** Échap : ferme la carte plein écran ou la fiche ; vrai si une couche a été fermée. */
    echap() {
      if (planOuvert()) { basculerPlan(false); return true; }
      if (ficheOuverte()) return true;
      if (document.pointerLockElement === canvas || performance.now() - tLibere < 400) return true;
      return false;
    },
    etat,
    points,
    info: () => { let n = 0; scene.traverse((o) => { if (o.isMesh || o.isPoints) n++; }); return { maillages: n }; },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', surTouche);
      window.removeEventListener('keyup', surRelache);
      window.removeEventListener('blur', perdu);
      document.removeEventListener('mousemove', surSouris);
      document.removeEventListener('pointerlockchange', surVerrou);
      if (document.pointerLockElement === canvas) document.exitPointerLock?.();
      if (document.fullscreenElement === el) document.exitFullscreen?.();
      clearTimeout(tAvis);
      carte3d.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        // Les matériaux de la palette (nommés) sont partagés avec le reste du site.
        for (const m of ms) if (!m.name) { m.map?.dispose(); m.emissiveMap?.dispose?.(); m.alphaMap?.dispose?.(); m.dispose(); }
      });
      scene.environment?.dispose();
      composer.dispose?.();
      renderer.dispose();
    },
  };
  // Accès pour les essais automatisés (captures d'écran).
  el.carte = api;
  return api;
}
