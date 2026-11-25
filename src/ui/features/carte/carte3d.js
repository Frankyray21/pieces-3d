// Carte 3D (touche M) : la mine vue du ciel, toit enlevé, comme la carte d'un
// jeu en monde ouvert — on la déplace, la tourne, l'incline et la rapproche ;
// les lieux sont marqués de pastilles qui flottent au-dessus, l'itinéraire est
// tracé au sol, le travailleur est une flèche. Un toucher (ou un clic) sur une
// galerie y place la destination.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cacheTex = new Map();

/** Pastille ronde (couleur, lettre) en texture. */
export function texturePastille(couleur, lettre, { anneau = '#ffffff', taille = 128 } = {}) {
  const cle = `${couleur}|${lettre}|${anneau}|${taille}`;
  if (cacheTex.has(cle)) return cacheTex.get(cle);
  const c = document.createElement('canvas');
  c.width = c.height = taille;
  const x = c.getContext('2d');
  const r = taille / 2;
  x.beginPath();
  x.arc(r, r, r * 0.84, 0, Math.PI * 2);
  x.fillStyle = couleur;
  x.shadowColor = 'rgba(0,0,0,.55)';
  x.shadowBlur = taille * 0.08;
  x.fill();
  x.shadowBlur = 0;
  x.lineWidth = taille * 0.09;
  x.strokeStyle = anneau;
  x.stroke();
  if (lettre) {
    x.fillStyle = '#10151b';
    x.font = `800 ${Math.round(taille * 0.52)}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(lettre, r, r + taille * 0.03);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cacheTex.set(cle, t);
  return t;
}

/** Étiquette de lieu (texte clair à contour sombre). Retourne { texture, ratio }. */
function textureEtiquette(texte) {
  const c = document.createElement('canvas');
  const x = c.getContext('2d');
  const h = 64;
  x.font = `700 ${h * 0.62}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  const w = Math.ceil(x.measureText(texte).width + h * 0.6);
  c.width = w; c.height = h;
  x.font = `700 ${h * 0.62}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  x.lineWidth = h * 0.16;
  x.strokeStyle = 'rgba(10, 14, 20, 0.92)';
  x.strokeText(texte, w / 2, h / 2);
  x.fillStyle = '#eef2f7';
  x.fillText(texte, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { texture: t, ratio: w / h };
}

const sprite = (texture, s, ratio = 1) => {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, sizeAttenuation: false, transparent: true }));
  m.scale.set(s * ratio, s, 1);
  m.renderOrder = 10;
  return m;
};

/**
 * opts : { scene, canvas, mine, bornes, sdf, marche, y0, couleurRoute, etiquettes: [[texte, x, z]], surClic(x, z) }.
 */
export function creerCarte3D(opts) {
  const { scene, canvas, mine, bornes, sdf, marche, y0, couleurRoute, surClic } = opts;
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 500);
  const groupe = new THREE.Group();
  groupe.name = 'carte3d';
  groupe.visible = false;
  scene.add(groupe);

  // Éclairage de la carte : le dessous de la mine éclairé d'en haut, sans brouillard.
  const soleil = new THREE.DirectionalLight(0xfff4e6, 1.7);
  soleil.position.set(30, 80, -40);
  soleil.target.position.set(10, 0, 0);
  const ciel = new THREE.HemisphereLight(0xdfe8ff, 0x3a3127, 1.25);
  groupe.add(soleil, soleil.target, ciel);

  // Étiquettes des lieux.
  for (const [texte, x, z] of opts.etiquettes) {
    const { texture, ratio } = textureEtiquette(texte.toUpperCase());
    const s = sprite(texture, 0.03, ratio);
    s.position.set(x, marche(x, z) + 3.2, z);
    groupe.add(s);
  }

  // Flèche du travailleur, à plat au sol (pointe vers Z négatif avant rotation).
  const forme = new THREE.Shape();
  forme.moveTo(0, 1);
  forme.lineTo(0.72, -0.8);
  forme.lineTo(0, -0.38);
  forme.lineTo(-0.72, -0.8);
  forme.closePath();
  const geoFleche = new THREE.ShapeGeometry(forme).rotateX(-Math.PI / 2);
  const fleche = new THREE.Group();
  const fond = new THREE.Mesh(geoFleche, new THREE.MeshBasicMaterial({ color: 0x10151b, depthTest: false, transparent: true }));
  fond.scale.setScalar(1.25);
  const dessus = new THREE.Mesh(geoFleche, new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true }));
  dessus.position.y = 0.01;
  fond.renderOrder = 11; dessus.renderOrder = 12;
  fleche.add(fond, dessus);
  groupe.add(fleche);

  // Pastilles des lieux et de la destination.
  const pastilles = new THREE.Group();
  groupe.add(pastilles);
  function majPastilles(liste) {
    for (const o of [...pastilles.children]) { pastilles.remove(o); o.material?.dispose(); o.geometry?.dispose(); }
    for (const b of liste) {
      const s = sprite(texturePastille(b.couleur, b.lettre), b.actif ? 0.05 : 0.038);
      const y = marche(b.x, b.z);
      s.position.set(b.x, y + 2.6, b.z);
      pastilles.add(s);
      // Tige jusqu'au sol, pour lire l'endroit exact.
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), new THREE.MeshBasicMaterial({ color: b.couleur, transparent: true, opacity: 0.8 }));
      tige.position.set(b.x, y + 1.3, b.z);
      pastilles.add(tige);
      const pied = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.55, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: b.couleur, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      pied.position.set(b.x, y + 0.05, b.z);
      pastilles.add(pied);
    }
  }

  // Itinéraire au sol.
  let route = null;
  const matRoute = new THREE.MeshBasicMaterial({ color: couleurRoute, transparent: true, opacity: 0.95 });
  function majRoute(pts) {
    if (route) { groupe.remove(route); route.geometry.dispose(); route = null; }
    if (!pts || pts.length < 2) return;
    const v = pts.map(([x, z]) => new THREE.Vector3(x, marche(x, z) + 0.12, z));
    const courbe = new THREE.CatmullRomCurve3(v, false, 'centripetal');
    route = new THREE.Mesh(new THREE.TubeGeometry(courbe, Math.max(8, Math.ceil(courbe.getLength() * 2)), 0.16, 6, false), matRoute);
    route.renderOrder = 5;
    groupe.add(route);
  }

  // ---------------------------------------------------------------- caméra

  const vue = { cible: new THREE.Vector3(), dist: 42, az: Math.PI, el: 1.05 };
  const lisse = { cible: new THREE.Vector3(), dist: 42, az: Math.PI, el: 1.05 };
  function placer(dt) {
    const k = dt == null ? 1 : 1 - Math.exp(-dt * 10);
    lisse.cible.lerp(vue.cible, k);
    lisse.dist += (vue.dist - lisse.dist) * k;
    lisse.az += (vue.az - lisse.az) * k;
    lisse.el += (vue.el - lisse.el) * k;
    const ce = Math.cos(lisse.el);
    camera.position.set(
      lisse.cible.x + Math.sin(lisse.az) * ce * lisse.dist,
      lisse.cible.y + Math.sin(lisse.el) * lisse.dist,
      lisse.cible.z + Math.cos(lisse.az) * ce * lisse.dist,
    );
    camera.lookAt(lisse.cible);
  }
  const borner = () => {
    vue.cible.x = clamp(vue.cible.x, bornes.x0, bornes.x1);
    vue.cible.z = clamp(vue.cible.z, bornes.z0, bornes.z1);
    vue.dist = clamp(vue.dist, 8, 150);
    vue.el = clamp(vue.el, 0.5, 1.52);
  };

  // Point du sol sous un point de l'écran (deux passes : plan, puis hauteur du sol à cet endroit).
  const ray = new THREE.Raycaster();
  function solSous(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    let y = y0;
    const p = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -y), p)) return null;
      y = marche(p.x, p.z);
    }
    return p;
  }

  // ---------------------------------------------------------------- gestes

  let ouverte = false;
  const doigts = new Map();
  let geste = null; // { mode, bouge }
  let ecart0 = 0, angle0 = 0;
  const parPixel = () => (2 * lisse.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / (canvas.clientHeight || 1);
  function deplacer(dx, dy) {
    const k = parPixel();
    const rx = Math.cos(vue.az), rz = -Math.sin(vue.az); // droite de l'écran, au sol
    const fx = -Math.sin(vue.az), fz = -Math.cos(vue.az); // haut de l'écran, au sol
    const kf = k / Math.max(0.35, Math.sin(vue.el));
    vue.cible.x += -dx * k * rx + dy * kf * fx;
    vue.cible.z += -dx * k * rz + dy * kf * fz;
    borner();
  }
  const bas = (e) => {
    if (!ouverte) return;
    canvas.setPointerCapture?.(e.pointerId);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    geste = { mode: e.button === 2 || e.ctrlKey || e.shiftKey ? 'tourner' : 'deplacer', bouge: 0 };
    if (doigts.size === 2) {
      const [a, b] = [...doigts.values()];
      ecart0 = Math.hypot(a[0] - b[0], a[1] - b[1]);
      angle0 = Math.atan2(b[1] - a[1], b[0] - a[0]);
      geste.bouge = 99;
    }
  };
  const bouge = (e) => {
    if (!ouverte || !doigts.has(e.pointerId)) return;
    const [px, py] = doigts.get(e.pointerId);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (doigts.size === 2) {
      // Deux doigts : pincer pour rapprocher, tourner pour pivoter, glisser ensemble pour incliner.
      const [a, b] = [...doigts.values()];
      const ec = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const an = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (ecart0) vue.dist *= ecart0 / ec;
      vue.az -= an - angle0;
      vue.el += (e.clientY - py) * 0.002;
      ecart0 = ec; angle0 = an;
      borner();
      return;
    }
    const dx = e.clientX - px, dy = e.clientY - py;
    geste.bouge += Math.abs(dx) + Math.abs(dy);
    if (geste.bouge < 5) return;
    if (geste.mode === 'tourner') { vue.az -= dx * 0.008; vue.el += dy * 0.006; borner(); }
    else deplacer(dx, dy);
  };
  const haut = (e) => {
    if (!doigts.has(e.pointerId)) return;
    doigts.delete(e.pointerId);
    if (doigts.size === 0 && geste && geste.bouge < 5 && ouverte) {
      const p = solSous(e.clientX, e.clientY);
      if (p && sdf(p.x, p.z) < 0.2) surClic(p.x, p.z);
    }
    if (doigts.size < 2) ecart0 = 0;
    if (doigts.size === 0) geste = null;
  };
  const molette = (e) => {
    if (!ouverte) return;
    e.preventDefault();
    // Rapprocher vers le point sous le pointeur.
    const p = solSous(e.clientX, e.clientY);
    const f = Math.pow(1.0018, e.deltaY);
    const avant = vue.dist;
    vue.dist = clamp(vue.dist * f, 8, 150);
    if (p) vue.cible.lerp(new THREE.Vector3(p.x, vue.cible.y, p.z), 1 - vue.dist / avant);
    borner();
  };
  const menu = (e) => { if (ouverte) e.preventDefault(); };
  canvas.addEventListener('pointerdown', bas);
  canvas.addEventListener('pointermove', bouge);
  canvas.addEventListener('pointerup', haut);
  canvas.addEventListener('pointercancel', haut);
  canvas.addEventListener('wheel', molette, { passive: false });
  canvas.addEventListener('contextmenu', menu);

  // ---------------------------------------------------------------- ouverture

  let garde = null;
  return {
    camera,
    get ouverte() { return ouverte; },
    ouvrir(pos, lacet) {
      ouverte = true;
      garde = { fog: scene.fog, bg: scene.background, env: scene.environmentIntensity };
      scene.fog = null;
      scene.background = new THREE.Color(0x0e1218);
      scene.environmentIntensity = 0.5;
      for (const m of mine.toit) m.visible = false;
      mine.cretes.visible = true;
      groupe.visible = true;
      // Ouverte sur le travailleur, nord en haut, inclinée.
      vue.cible.set(pos.x, y0, pos.z);
      vue.dist = 38; vue.az = Math.PI; vue.el = 0.82;
      lisse.cible.copy(vue.cible).add(new THREE.Vector3(0, 0, -6));
      lisse.dist = 70; lisse.az = lacet ?? Math.PI; lisse.el = 1.35;
      placer();
    },
    fermer() {
      if (!ouverte) return;
      ouverte = false;
      doigts.clear();
      geste = null;
      scene.fog = garde.fog;
      scene.background = garde.bg;
      scene.environmentIntensity = garde.env;
      for (const m of mine.toit) m.visible = true;
      mine.cretes.visible = false;
      groupe.visible = false;
    },
    /** Image : caméra, flèche du travailleur (taille lisible à toute distance). */
    maj(dt, pos, cap) {
      placer(dt);
      fleche.position.set(pos.x, pos.y + 0.08, pos.z);
      fleche.rotation.y = cap;
      fleche.scale.setScalar(clamp(lisse.dist / 30, 0.7, 4));
    },
    majPastilles,
    majRoute,
    zoom(k) { vue.dist *= k; borner(); },
    tourner(a) { vue.az += a; },
    incliner() { vue.el = vue.el > 1.2 ? 0.82 : 1.5; borner(); },
    nord() { vue.az = Math.PI; },
    centrer(pos) { vue.cible.set(pos.x, y0, pos.z); },
    /**
     * Taille de la vue ; panneau : { droite, bas } en px couverts par la légende
     * (le centre de la carte se place au milieu de la partie libre).
     */
    taille(w, h, panneau = {}) {
      const dr = panneau.droite || 0, bs = panneau.bas || 0;
      camera.aspect = (w + dr) / (h + bs);
      if (dr || bs) camera.setViewOffset(w + dr, h + bs, dr, bs, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    },
    dispose() {
      canvas.removeEventListener('pointerdown', bas);
      canvas.removeEventListener('pointermove', bouge);
      canvas.removeEventListener('pointerup', haut);
      canvas.removeEventListener('pointercancel', haut);
      canvas.removeEventListener('wheel', molette);
      canvas.removeEventListener('contextmenu', menu);
      for (const t of cacheTex.values()) t.dispose();
      cacheTex.clear();
    },
  };
}
