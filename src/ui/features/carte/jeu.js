// Place de travail en 3D, à parcourir à la première personne, comme sur place :
// la galerie, la baie de forage avec le plancher de la procédure PRO-DD-ST-003,
// la foreuse STM-1500, le refuge, la conduite de ventilation et le support de
// terrain, éclairés par la lampe du casque.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProcedural } from '../../../viewer/assembly.js';
import plancherModeles from '../../../models/plancher-dd/index.js';
import stmModeles from '../../../models/stm-1500/index.js';
import { construireMine, sdf, gradient, marche, voute, segments, XD } from './mine.js';

const R = 0.33; // rayon du marcheur
const OEIL = 1.66; // hauteur des yeux
const MARCHE_MAX = 0.4; // plus haute marche franchie
const V_MARCHE = 1.5, V_RAPIDE = 3.0;
const TACTILE = matchMedia('(pointer: coarse)').matches;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Fusionne les maillages statiques par matériau (bien moins d'appels de dessin). */
function fusionner(racine) {
  racine.updateMatrixWorld(true);
  const lots = new Map();
  racine.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry?.attributes?.position) return;
    for (let p = o; p; p = p.parent) if (p.visible === false) return;
    if (Array.isArray(o.material)) return;
    const g = o.geometry;
    const attrs = Object.keys(g.attributes).sort().map((k) => `${k}${g.attributes[k].itemSize}`).join(',');
    const cle = `${o.material.uuid}|${g.index ? 'i' : 'n'}|${attrs}`;
    if (!lots.has(cle)) lots.set(cle, { m: o.material, geos: [] });
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
    mesh.castShadow = mesh.receiveShadow = true;
    out.add(mesh);
  }
  return out;
}

/** Air qui sort de la conduite de ventilation (fines particules entraînées). */
function souffle(sortie, dir, n = 200) {
  const pos = new Float32Array(n * 3);
  const vie = Float32Array.from({ length: n }, () => Math.random());
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfd8ff, size: 0.03, transparent: true, opacity: 0.35, depthWrite: false }));
  p.frustumCulled = false;
  const graine = Array.from({ length: n }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1]);
  p.userData.maj = (dt) => {
    for (let i = 0; i < n; i++) {
      vie[i] = (vie[i] + dt * 0.45) % 1;
      const t = vie[i], d = t * 6, s = 0.25 + t * 1.6;
      pos[3 * i] = sortie.x + dir.x * d + graine[i][0] * s * 0.6;
      pos[3 * i + 1] = sortie.y + dir.y * d - t * 0.6 + graine[i][1] * s * 0.4;
      pos[3 * i + 2] = sortie.z + dir.z * d + graine[i][1] * s * 0.6;
    }
    g.attributes.position.needsUpdate = true;
  };
  return p;
}

/**
 * Lance la visite dans l'élément el (vidé).
 * Retourne { dispose(), echap() → vrai si Échap a été consommé }.
 */
export function lancer(el) {
  el.classList.add('carte');
  el.classList.toggle('tactile', TACTILE);
  el.innerHTML = `
    <canvas class="carte-vue" tabindex="0" aria-label="Place de travail en 3D, vue à la première personne"></canvas>
    <div class="carte-viseur" aria-hidden="true"></div>
    <div class="carte-aide"></div>
    <div class="carte-outils"><button type="button" class="btn" data-c="plein" title="Plein écran (F)">Plein écran</button></div>
    <div class="carte-tactile" ${TACTILE ? '' : 'hidden'}><div class="carte-manette"><span></span></div></div>
    <div class="carte-intro">
      <div class="carte-intro-boite card-box">
        <h3>Place de travail en 3D</h3>
        <p>Vous êtes à l’entrée de la place de travail de forage au diamant. Marchez dans la galerie et sur le plancher comme sur place.</p>
        <p class="carte-petit"></p>
        <div><button type="button" class="btn primary" data-c="entrer">Entrer</button></div>
      </div>
    </div>
    <div class="carte-chargement">Chargement…</div>`;
  const $ = (s) => el.querySelector(s);
  const canvas = $('.carte-vue');
  const AIDE = TACTILE
    ? 'Pouce gauche : marcher · glisser à droite : regarder autour'
    : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou flèches : marcher · <kbd>Maj</kbd> : plus vite · souris : regarder · <kbd>Échap</kbd> : libérer la souris';
  $('.carte-aide').innerHTML = AIDE;
  $('.carte-intro .carte-petit').innerHTML = AIDE;

  // ---------------------------------------------------------------- scène

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, TACTILE ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = !TACTILE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.FogExp2(0x07090d, 0.05);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.07;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0x8fa6c8, 0x2b2118, 0.42));
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 120);

  const mine = construireMine();
  scene.add(mine.group);

  // Plancher complet (P02) sans sa galerie en écorché ni les outils du montage.
  const p02 = buildProcedural(plancherModeles, 'P02');
  const enlever = [];
  p02.root.traverse((o) => { if (o.userData.stepOnly || o.userData.partRef === 'G') enlever.push(o); });
  for (const o of enlever) o.parent?.remove(o);
  p02.root.updateMatrixWorld(true);
  const boites = [];
  for (const p of p02.root.children) if (['11', '12'].includes(p.userData.partRef)) boites.push(new THREE.Box3().setFromObject(p));
  scene.add(fusionner(p02.root));

  // Foreuse STM-1500 sur la section 1, tournée vers le front de taille.
  const stm = buildProcedural(stmModeles, 'P010', { quality: 0.6 });
  const foreuse = new THREE.Group();
  stm.root.rotation.y = Math.PI;
  foreuse.add(stm.root);
  foreuse.position.set(1.78, 0.2286, -0.72);
  foreuse.updateMatrixWorld(true);
  boites.push(new THREE.Box3().setFromObject(foreuse));
  scene.add(fusionner(foreuse));

  // Lampe du casque.
  const lampe = new THREE.SpotLight(0xfff0d6, 34, 38, 0.55, 0.85, 1.2);
  lampe.castShadow = !TACTILE;
  lampe.shadow.mapSize.set(1024, 1024);
  lampe.shadow.camera.near = 0.2;
  lampe.shadow.camera.far = 30;
  lampe.shadow.bias = -0.0006;
  lampe.shadow.normalBias = 0.02;
  const lueur = new THREE.PointLight(0xffe6c2, 1.4, 6, 1.6);
  scene.add(lampe, lampe.target, lueur);

  const air = souffle(mine.sortieVent, mine.directionVent);
  scene.add(air);

  // ---------------------------------------------------------------- déplacement

  const segs = segments();
  // Départ : dans la galerie principale, à l'entrée de la place de travail, face au front.
  const etat = { pos: new THREE.Vector3(XD + 0.8, 0, 0), vit: new THREE.Vector3(), vy: 0, lacet: Math.PI / 2, tangage: -0.05, t: 0, actif: false, pas: 0 };
  etat.pos.y = marche(etat.pos.x, etat.pos.z);

  function pousser(p, pieds) {
    for (let it = 0; it < 4; it++) {
      const d = sdf(p.x, p.z);
      if (d > -R) { const [gx, gz] = gradient(p.x, p.z); p.x -= gx * (d + R); p.z -= gz * (d + R); }
      for (const s of segs) {
        const [ax, az] = s.a, [bx, bz] = s.b;
        const dx = bx - ax, dz = bz - az;
        const t = clamp(((p.x - ax) * dx + (p.z - az) * dz) / (dx * dx + dz * dz), 0, 1);
        const qx = ax + dx * t, qz = az + dz * t, ex = p.x - qx, ez = p.z - qz;
        const l = Math.hypot(ex, ez), m = R + s.e;
        if (l < m && l > 1e-6) { p.x = qx + (ex / l) * m; p.z = qz + (ez / l) * m; }
      }
      for (const b of boites) {
        if (pieds > b.max.y - 0.3) continue;
        const qx = clamp(p.x, b.min.x, b.max.x), qz = clamp(p.z, b.min.z, b.max.z);
        const ex = p.x - qx, ez = p.z - qz, l = Math.hypot(ex, ez);
        if (l >= R) continue;
        if (l > 1e-6) { p.x = qx + (ex / l) * R; p.z = qz + (ez / l) * R; continue; }
        const o = [[p.x - b.min.x, -1, 0], [b.max.x - p.x, 1, 0], [p.z - b.min.z, 0, -1], [b.max.z - p.z, 0, 1]].sort((u, v) => u[0] - v[0])[0];
        p.x += o[1] * (o[0] + R); p.z += o[2] * (o[0] + R);
      }
    }
  }

  const touches = new Set();
  const manette = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  const avant = new THREE.Vector3(), droite = new THREE.Vector3();

  function deplacer(dt) {
    let ix = 0, iy = 0;
    if (touches.has('KeyW') || touches.has('KeyZ') || touches.has('ArrowUp')) iy += 1;
    if (touches.has('KeyS') || touches.has('ArrowDown')) iy -= 1;
    if (touches.has('KeyA') || touches.has('KeyQ') || touches.has('ArrowLeft')) ix -= 1;
    if (touches.has('KeyD') || touches.has('ArrowRight')) ix += 1;
    ix += manette.x; iy -= manette.y;
    const n = Math.hypot(ix, iy);
    if (n > 1) { ix /= n; iy /= n; }
    const v = touches.has('ShiftLeft') || touches.has('ShiftRight') ? V_RAPIDE : V_MARCHE;
    avant.set(-Math.sin(etat.lacet), 0, -Math.cos(etat.lacet));
    droite.set(Math.cos(etat.lacet), 0, -Math.sin(etat.lacet));
    const cible = avant.clone().multiplyScalar(iy * v).addScaledVector(droite, ix * v);
    etat.vit.lerp(cible, 1 - Math.exp(-dt * 10));
    const p0 = etat.pos.clone();
    const essai = (dx, dz) => {
      const p = new THREE.Vector3(p0.x + dx, p0.y, p0.z + dz);
      pousser(p, p0.y);
      return marche(p.x, p.z) - p0.y > MARCHE_MAX ? null : p;
    };
    const dx = etat.vit.x * dt, dz = etat.vit.z * dt;
    const p = essai(dx, dz) || essai(dx, 0) || essai(0, dz) || p0;
    etat.pos.x = p.x; etat.pos.z = p.z;
    // Marches montées en douceur, descente avec la gravité.
    const h = marche(etat.pos.x, etat.pos.z);
    if (h >= etat.pos.y) { etat.pos.y += (h - etat.pos.y) * Math.min(1, dt * 16); etat.vy = 0; }
    else { etat.vy -= 9.8 * dt; etat.pos.y = Math.max(h, etat.pos.y + etat.vy * dt); if (etat.pos.y === h) etat.vy = 0; }
    const vitesse = Math.hypot(etat.vit.x, etat.vit.z);
    etat.pas += dt * vitesse * 4.2;
    return vitesse;
  }

  const regarder = (dx, dy, k = 0.0024) => {
    etat.lacet -= dx * k;
    etat.tangage = clamp(etat.tangage - dy * k, -1.35, 1.35);
  };

  // ---------------------------------------------------------------- commandes

  const saisie = (e) => e.target.closest?.('input, textarea');
  const surTouche = (e) => {
    if (!etat.actif || saisie(e)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.key.toLowerCase() === 'f') pleinEcran();
    touches.add(e.code);
  };
  const surRelache = (e) => touches.delete(e.code);
  const perdu = () => touches.clear();
  window.addEventListener('keydown', surTouche);
  window.addEventListener('keyup', surRelache);
  window.addEventListener('blur', perdu);

  function pleinEcran() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  }
  function entrer() {
    $('.carte-intro').hidden = true;
    etat.actif = true;
    canvas.focus();
    if (!TACTILE) canvas.requestPointerLock?.();
  }

  // Souris : pointeur verrouillé au clic ; sinon, glisser pour regarder.
  let tLibere = 0;
  const surVerrou = () => { if (document.pointerLockElement !== canvas) tLibere = performance.now(); };
  document.addEventListener('pointerlockchange', surVerrou);
  const surSouris = (e) => { if (document.pointerLockElement === canvas) regarder(e.movementX, e.movementY); };
  document.addEventListener('mousemove', surSouris);
  canvas.addEventListener('click', () => { if (etat.actif && !TACTILE) canvas.requestPointerLock?.(); });

  // Tactile : manette au pouce gauche, regard en glissant à droite.
  let glisse = null;
  const bouton = $('.carte-manette span');
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !etat.actif) return;
    const r = canvas.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.42 && manette.id == null) {
      Object.assign(manette, { id: e.pointerId, ox: e.clientX, oy: e.clientY });
      const m = $('.carte-manette');
      m.style.left = `${e.clientX - r.left}px`; m.style.top = `${e.clientY - r.top}px`;
      m.classList.add('active');
    } else if (glisse == null) glisse = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId === manette.id) {
      const dx = e.clientX - manette.ox, dy = e.clientY - manette.oy;
      const l = Math.hypot(dx, dy), max = 48, k = l > max ? max / l : 1;
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
    const c = e.target.closest('[data-c]')?.dataset.c;
    if (c === 'plein') pleinEcran();
    else if (c === 'entrer') entrer();
  });

  // ---------------------------------------------------------------- image

  const regard = new THREE.Vector3();
  let precedent = performance.now();
  let raf = 0;
  function boucle(t) {
    raf = requestAnimationFrame(boucle);
    const dt = Math.min(0.05, (t - precedent) / 1000);
    precedent = t;
    etat.t += dt;
    const vitesse = etat.actif ? deplacer(dt) : 0;
    const cp = Math.cos(etat.tangage);
    regard.set(-Math.sin(etat.lacet) * cp, Math.sin(etat.tangage), -Math.cos(etat.lacet) * cp);
    // Yeux à hauteur d'homme, léger balancement de la marche ; jamais dans la voûte.
    const balance = Math.min(1, vitesse / V_MARCHE) * 0.025 * Math.sin(etat.pas * 2);
    const y = Math.min(etat.pos.y + OEIL + balance, voute(etat.pos.x, etat.pos.z) - 0.15);
    camera.position.set(etat.pos.x, y, etat.pos.z);
    camera.lookAt(camera.position.x + regard.x, camera.position.y + regard.y, camera.position.z + regard.z);
    lampe.position.copy(camera.position).add(new THREE.Vector3(0, 0.1, 0));
    lampe.target.position.copy(camera.position).addScaledVector(regard, 12);
    lueur.position.copy(camera.position).addScaledVector(regard, 0.8);
    air.userData.maj(dt);
    const gy = 0.5 + 0.5 * Math.sin(etat.t * 5.5);
    mine.gyro.light.intensity = 1 + 5 * gy;
    mine.gyro.mesh.material.emissiveIntensity = 1 + 3 * gy;
    renderer.render(scene, camera);
  }

  function taille() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 80 : 70;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(taille);
  ro.observe(el);
  taille();
  $('.carte-chargement').remove();
  raf = requestAnimationFrame(boucle);

  const api = {
    etat,
    entrer,
    /** Échap : celui qui vient de libérer la souris ne ferme pas la page. */
    echap() {
      return document.pointerLockElement === canvas || performance.now() - tLibere < 400;
    },
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
      scene.traverse((o) => {
        o.geometry?.dispose();
        const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        // Les matériaux de la palette (nommés) sont partagés avec le reste du site.
        for (const m of ms) if (!m.name) { m.map?.dispose(); m.emissiveMap?.dispose?.(); m.alphaMap?.dispose?.(); m.dispose(); }
      });
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
  // Accès pour les essais automatisés (captures d'écran).
  el.carte = api;
  return api;
}
