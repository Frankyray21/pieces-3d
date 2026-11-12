// Poste de premiers soins et d'extincteur, monté sur le grillage de la cage :
// reconstitution d'après une seule photo du poste installé (P01), sans plan.
//
// Aucune cote n'est inscrite sur la photo. L'échelle vient de deux objets de
// taille connue : le ruban réfléchissant (2 po de large) et l'extincteur à
// poudre de 5 lb (cylindre de 4 1/4 po). Toutes les dimensions sont donc
// estimées, à environ 1 po près ; ce que la photo ne montre pas (tôle derrière
// l'armoire, ruban caché, fixations) est signalé dans les notes de la page.
//
// Repère, en pouces : x depuis le bord gauche du cadre, y depuis le bas,
// z vers l'avant (0 = face avant de la tôle). Modèle : X centré, mètres.
import * as THREE from 'three';

const IN = 0.0254;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (po, estimées)

const W = 34, H = 24; // cadre hors tout
const T = 3 / 16; // tôle
const BORD = 2.5; // pourtour plein
const RUBAN = 2; // largeur du ruban réfléchissant

// Panneau de droite, ajouré : ferme en haut (poinçon et deux contrefiches), croix en bas.
const PX0 = 21.5, PX1 = W - BORD; // largeur du panneau ajouré
const MEMBRURE = { y0: 16.25, y1: 17 }; // membrure basse de la ferme
const POINCON = { x: (PX0 + PX1) / 2, w: 1.5 }; // montant central, porte l'extincteur
const DEMI_FERME = 0.4, DEMI_CROIX = 0.5; // demi-largeur des diagonales
const CONGE = 0.25; // coins des découpes

// Armoire blanche à toit incliné.
const ARM = { x0: 3.5, x1: 19.5, y0: 1.5, prof: 8, hDos: 19, hDevant: 15.5, t: 0.25, facade: 3 / 16 };
const TOIT = { w: 20, long: 12.5, t: 3 / 8 };
const PENTE = Math.atan2(ARM.hDos - ARM.hDevant, ARM.prof);
const CROIX = { bras: 9, large: 3 };

// Contenu de l'armoire.
const TROUSSE = { w: 9.5, h: 13.5, d: 3.5, x: 9.1, z: 4.2 };
const FLACON = { r: 1.3, h: 8.6, pos: [[16.3, 5.3], [17.4, 2.5]] };

// Extincteur à poudre de 5 lb, pendu au crochet du poinçon.
const EXT = { x: POINCON.x, y: 2.4, z: 2.3, r: 2.125, droit: 9.6, dome: 1.9, col: 0.72 };
const PATTE_Y = 13.2; // patte d'accrochage, depuis le bas du cylindre
const CROCHET = { w: 1.3, y0: EXT.y + PATTE_Y - 0.2, y1: 18.6, t: 0.12 };

// Grillage de la cage, derrière le cadre.
const GRILLE = { x0: -3, x1: 37, y0: -3, y1: 27, pas: 2, fil: 0.075 };

// ------------------------------------------------------------------ outils

const px = (x) => (x - W / 2) * IN;
/** Point du repère (po) → modèle (m). */
const P = (x, y, z = 0) => [px(x), y * IN, z * IN];

/** Points d'un arc de centre (cx, cy), du degré a0 au degré a1. */
function arc(cx, cy, r, a0, a1, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** Contour fermé convexe dont chaque coin est arrondi au rayon r. */
function arrondi(pts, r, n = 5) {
  const out = [];
  const count = pts.length;
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[(i + count - 1) % count], [bx, by] = pts[(i + 1) % count];
    let ux = ax - x, uy = ay - y, vx = bx - x, vy = by - y;
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    ux /= lu; uy /= lu; vx /= lv; vy /= lv;
    const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy))) / 2;
    const t = Math.min(r / Math.tan(half), lu * 0.45, lv * 0.45), rr = t * Math.tan(half), c = rr / Math.sin(half);
    const bl = Math.hypot(ux + vx, uy + vy);
    const cx = x + ((ux + vx) / bl) * c, cy = y + ((uy + vy) / bl) * c;
    const a0 = Math.atan2(y + uy * t - cy, x + ux * t - cx);
    let da = Math.atan2(y + vy * t - cy, x + vx * t - cx) - a0;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= n; k++) out.push([cx + rr * Math.cos(a0 + (da * k) / n), cy + rr * Math.sin(a0 + (da * k) / n)]);
  });
  return out;
}

/** Garde la partie d'un polygone convexe située à au moins h du côté s (±1) de la droite AB. */
function rogne(poly, [ax, ay], [bx, by], s, h) {
  const l = Math.hypot(bx - ax, by - ay);
  const f = ([x, y]) => (s * (-(by - ay) * (x - ax) + (bx - ax) * (y - ay))) / l - h;
  const out = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const fp = f(p), fq = f(q);
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) {
      const k = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]);
    }
  });
  return out;
}

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const m2 = (pts) => pts.map(([x, y]) => [px(x), y * IN]);

// Matériaux hors palette (ruban, autocollants, plastiques), créés une fois.
const perso = new Map();
function teinte(nom, params) {
  let m = perso.get(nom);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.55, ...params });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    perso.set(nom, m);
  }
  return m;
}

/** Image dessinée sur un canevas (aucune hors navigateur : la couleur unie reste). */
function image(nom, w, h, dessin) {
  if (typeof document === 'undefined') return null;
  if (perso.has(`img:${nom}`)) return perso.get(`img:${nom}`);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  perso.set(`img:${nom}`, t);
  return t;
}

/** Matériau d'un autocollant : son image, ou sa couleur de fond hors navigateur. */
function imprime(nom, fond, w, h, dessin) {
  if (perso.has(nom)) return perso.get(nom);
  const map = image(nom, w, h, dessin);
  return teinte(nom, map ? { map, roughness: 0.6 } : { color: fond, roughness: 0.6 });
}

/** Autocollant plat (w × h po), face vers +Z, posé à 0,01 po de son support. */
function autocollant(w, h, materiau) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w * IN, h * IN), materiau);
  p.position.z = 0.01 * IN;
  return p;
}

/** Lignes de texte suggérées : rangées de traits de longueurs variées. */
function lignes(x, x0, y0, largeur, n, pas, epais, couleur = '#333') {
  x.fillStyle = couleur;
  let s = 7;
  for (let i = 0; i < n; i++) {
    let cx = x0;
    const fin = x0 + largeur * (0.7 + ((i * 37) % 30) / 100);
    while (cx < fin) {
      s = (s * 16807) % 2147483647;
      const l = Math.min(largeur * (0.06 + ((s % 1000) / 1000) * 0.16), fin - cx);
      x.fillRect(cx, y0 + i * pas, l, epais);
      cx += l + epais * 1.6;
    }
  }
}

// ------------------------------------------------------------------ cadre

/** Découpes du panneau de droite : quatre triangles de la ferme, quatre de la croix. */
function decoupes() {
  const out = [];
  // Ferme : de chaque côté du poinçon, une contrefiche descend du haut du poinçon vers le bout de la membrure.
  const haut = H - BORD;
  const gauche = rect(PX0, MEMBRURE.y1, POINCON.x - POINCON.w / 2, haut);
  const droite = rect(POINCON.x + POINCON.w / 2, MEMBRURE.y1, PX1, haut);
  for (const s of [1, -1]) {
    out.push(rogne(gauche, gauche[0], gauche[2], s, DEMI_FERME));
    out.push(rogne(droite, droite[1], droite[3], s, DEMI_FERME));
  }
  // Croix : deux diagonales d'un coin à l'autre, sous la membrure.
  const bas = rect(PX0, BORD, PX1, MEMBRURE.y0);
  for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    out.push(rogne(rogne(bas, bas[0], bas[2], s1, DEMI_CROIX), bas[1], bas[3], s2, DEMI_CROIX));
  }
  return out.map((p) => arrondi(p, CONGE));
}

/** Repère 1 : tôle découpée d'une seule pièce (pleine derrière l'armoire, ajourée à droite). */
function cadre(S) {
  const contour = arrondi(rect(0, 0, W, H), 0.5, 6);
  const tole = S.extrude(m2(contour), T * IN, 'castAlu', { holes: decoupes().map(m2), center: false });
  tole.position.z = -T * IN;
  return S.group(tole);
}

/** Ruban réfléchissant : petits prismes suggérés par un quadrillage serré. */
function matRuban(nom, couleur) {
  if (perso.has(nom)) return perso.get(nom);
  const map = image('prismes', 64, 64, (x, w) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, w);
    x.strokeStyle = 'rgba(0,0,0,0.13)'; x.lineWidth = 2;
    for (let i = -w; i <= w * 2; i += 16) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + w, w); x.stroke();
      x.beginPath(); x.moveTo(i, w); x.lineTo(i + w, 0); x.stroke();
    }
  });
  if (map) map.wrapS = map.wrapT = THREE.RepeatWrapping;
  return teinte(nom, { color: couleur, map, roughness: 0.34, metalness: 0.08 });
}

// Tronçons du ruban [x0, y0, x1, y1, rouge ?], relevés sur la photo ; ceux que
// l'armoire cache (bas et gauche) alternent comme les tronçons visibles.
const TRONCONS = [
  // haut, de gauche à droite
  [0, 22, 7, 24, 0], [7, 22, 18.5, 24, 1], [18.5, 22, 25, 24, 0], [25, 22, 34, 24, 1],
  // droite, de haut en bas
  [32, 19.2, 34, 22, 1], [32, 12.9, 34, 19.2, 0], [32, 4.5, 34, 12.9, 1], [32, 0, 34, 4.5, 0],
  // bas, de droite à gauche
  [30.25, 0, 32, 2, 1], [22, 0, 30.25, 2, 0], [11, 0, 22, 2, 1], [4.5, 0, 11, 2, 0], [2, 0, 4.5, 2, 1],
  // gauche, de bas en haut
  [0, 0, 2, 2.5, 0], [0, 2.5, 2, 9.5, 1], [0, 9.5, 2, 16.5, 0], [0, 16.5, 2, 22, 1],
];

/** Repère 2 : ruban réfléchissant rouge et blanc de 2 po sur le pourtour. */
function ruban(S) {
  const g = S.group();
  const ep = 0.02, motif = 0.75; // épaisseur et pas du quadrillage (po)
  for (const [x0, y0, x1, y1, rouge] of TRONCONS) {
    const w = x1 - x0, h = y1 - y0;
    const geo = new THREE.BoxGeometry(w * IN, h * IN, ep * IN);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / motif, (uv.getY(i) * h) / motif);
    const t = new THREE.Mesh(geo, rouge ? matRuban('ruban-rouge', 0xc4121b) : matRuban('ruban-blanc', 0xf2f3f4));
    t.position.set(...P(x0 + w / 2, y0 + h / 2, ep / 2));
    g.add(t);
  }
  return g;
}

/** Repère 12 : grillage soudé de la cage, fils verticaux devant. */
function grillage(S) {
  const { x0, x1, y0, y1, pas, fil } = GRILLE;
  const fils = [];
  for (let x = x0; x <= x1 + 1e-6; x += pas) fils.push(S.rod(P(x, y0, -T - fil), P(x, y1, -T - fil), fil * IN, 'zinc', 8));
  for (let y = y0 + pas / 2; y <= y1; y += pas) fils.push(S.rod(P(x0, y, -T - 3 * fil), P(x1, y, -T - 3 * fil), fil * IN, 'zinc', 8));
  const g = S.merged(fils, 'zinc');
  g.geometry.userData.edgeAngle = 80;
  return S.group(g);
}

// ------------------------------------------------------------------ armoire

/** Repère 3 : caisson blanc (dos, fond et deux côtés en pente), adossé à la tôle. */
function caisson(S) {
  const { x0, x1, y0, prof, hDos, hDevant, t, facade } = ARM;
  const zf = prof - facade; // les côtés s'arrêtent derrière la façade
  const haut = (z) => hDos - ((hDos - hDevant) * z) / prof;
  const g = S.group();
  const w = x1 - x0;
  g.add(S.box((w - 2 * t) * IN, haut(t) * IN, t * IN, 'white', { pos: P((x0 + x1) / 2, y0 + haut(t) / 2, t / 2) }));
  g.add(S.box((w - 2 * t) * IN, t * IN, (zf - t) * IN, 'white', { pos: P((x0 + x1) / 2, y0 + t / 2, (zf + t) / 2) }));
  const profil = [[0, 0], [zf, 0], [zf, haut(zf)], [0, hDos]].map(([z, y]) => [z * IN, y * IN]);
  for (const x of [x0 + t, x1]) {
    const cote = S.extrude(profil, t * IN, 'white', { center: false });
    cote.rotation.y = -Math.PI / 2; // profil dans le plan ZY, épaisseur vers −X
    cote.position.set(px(x), y0 * IN, 0);
    g.add(cote);
  }
  return g;
}

/** Repère 4 : toit en pente, débordant sur les côtés et le devant. */
function toit(S) {
  const { w, long, t } = TOIT;
  const c = Math.cos(PENTE), s = Math.sin(PENTE);
  // Dessous du toit posé sur le haut des côtés ; arête arrière basse contre la tôle.
  const y = (t / 2) * c - (long / 2) * s, z = (t / 2) * s + (long / 2) * c;
  const dalle = S.box(w * IN, t * IN, long * IN, 'white');
  dalle.rotation.x = PENTE;
  dalle.position.set(...P((ARM.x0 + ARM.x1) / 2, ARM.y0 + ARM.hDos + y, z));
  return S.group(dalle);
}

/** Repère 5 : façade transparente et sa croix rouge. */
function facade(S) {
  const { x0, x1, y0, prof, hDevant, facade: t } = ARM;
  const g = S.group();
  g.add(S.box((x1 - x0) * IN, hDevant * IN, t * IN, 'glass', { pos: P((x0 + x1) / 2, y0 + hDevant / 2, prof - t / 2) }));
  const a = CROIX.bras / 2, b = CROIX.large / 2;
  const croix = S.extrude(
    [[-a, -b], [-b, -b], [-b, -a], [b, -a], [b, -b], [a, -b], [a, b], [b, b], [b, a], [-b, a], [-b, b], [-a, b]].map(([x, y]) => [x * IN, y * IN]),
    0.02 * IN, teinte('croix-rouge', { color: 0xe2231a, roughness: 0.5 }), { center: false });
  croix.position.set(...P((x0 + x1) / 2 + 0.3, y0 + hDevant / 2 - 0.4, prof));
  g.add(croix);
  return g;
}

/** Repère 6 : trousse de premiers soins en plastique blanc, debout sur son côté. */
function trousse(S) {
  const { w, h, d } = TROUSSE;
  const g = S.group();
  g.add(S.box(w * IN, h * IN, d * IN, 'white', { r: 0.5 * IN }));
  // Joint du couvercle, charnières à droite, fermoirs rouges à gauche.
  g.add(S.box((w + 0.08) * IN, (h + 0.08) * IN, 0.12 * IN, 'lightGrey', { r: 0.5 * IN, pos: [0, 0, 0.45 * IN] }));
  for (const y of [-3.6, 3.6]) {
    g.add(S.box(0.3 * IN, 2.2 * IN, 0.7 * IN, 'white', { r: 0.08 * IN, pos: [(w / 2 + 0.08) * IN, y * IN, 0.45 * IN] }));
    g.add(S.box(0.28 * IN, 1.3 * IN, 1.2 * IN, 'red', { r: 0.08 * IN, pos: [-(w / 2 + 0.1) * IN, y * IN, 0.5 * IN] }));
  }
  const etiquette = autocollant(7, 10.5, imprime('trousse', 0xe6e8eb, 384, 576, (x, cw, ch) => {
    x.fillStyle = '#e9ebee'; x.fillRect(0, 0, cw, ch);
    x.save();
    x.translate(cw * 0.17, ch * 0.5); x.rotate(-Math.PI / 2);
    x.fillStyle = '#2a2d31'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 34px Arial, Helvetica, sans-serif';
    x.fillText('Trousse de premiers soins', 0, 0);
    x.restore();
    x.fillStyle = '#d3201c'; x.fillRect(cw * 0.5, ch * 0.62, cw * 0.16, cw * 0.16);
    x.fillStyle = '#fff';
    x.fillRect(cw * 0.56, ch * 0.62 + cw * 0.025, cw * 0.04, cw * 0.11);
    x.fillRect(cw * 0.525, ch * 0.62 + cw * 0.06, cw * 0.11, cw * 0.04);
  }));
  etiquette.position.z += (d / 2) * IN;
  g.add(etiquette);
  return g;
}

/** Repère 7 : bouteille de rince-œil, étiquette verte, bouchon-œillère vert foncé. */
function flacon(S) {
  const { r, h } = FLACON;
  const g = S.group();
  const corps = teinte('flacon', { color: 0xdcebe6, roughness: 0.2, transparent: true, opacity: 0.72 });
  g.add(S.lathe([[0, 0], [r - 0.12, 0], [r, 0.12], [r, 5.5], [0.62, 6.6], [0.62, 7], [0, 7]].map(([a, b]) => [a * IN, b * IN]), corps, { seg: 32 }));
  g.add(S.lathe([[0, 7], [0.8, 7], [0.95, 7.2], [0.95, h - 0.3], [0.8, h], [0, h]].map(([a, b]) => [a * IN, b * IN]),
    teinte('bouchon-vert', { color: 0x1d5c48, roughness: 0.6 }), { seg: 24 }));
  // Étiquette enroulée sur le devant (220°).
  const geo = new THREE.CylinderGeometry((r + 0.012) * IN, (r + 0.012) * IN, 3.6 * IN, 32, 1, true, -110 * RAD, 220 * RAD);
  const etiquette = new THREE.Mesh(geo, imprime('rince-oeil', 0x1f9a6a, 384, 256, (x, cw, ch) => {
    x.fillStyle = '#1f9a6a'; x.fillRect(0, 0, cw, ch);
    x.fillStyle = '#fff';
    x.fillRect(cw * 0.44, ch * 0.08, cw * 0.12, ch * 0.24);
    x.fillRect(cw * 0.4, ch * 0.15, cw * 0.2, ch * 0.1);
    x.fillStyle = '#eaf6f1'; x.fillRect(cw * 0.36, ch * 0.42, cw * 0.28, ch * 0.4);
    lignes(x, cw * 0.38, ch * 0.47, cw * 0.24, 6, ch * 0.055, ch * 0.022, '#1f6f55');
  }));
  etiquette.position.y = 3 * IN;
  g.add(etiquette);
  return g;
}

/** Repère 11 : étiquette blanche à code QR. */
function etiquetteQR(w, h) {
  return autocollant(w, h, imprime(`qr-${w}`, 0xf2f2f0, 256, Math.round((256 * h) / w), (x, cw, ch) => {
    x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, cw, ch);
    lignes(x, cw * 0.08, ch * 0.3, cw * 0.6, 2, ch * 0.28, ch * 0.14);
    // Code QR suggéré : damier irrégulier.
    const c = ch * 0.7, n = 7, q = c / n, ox = cw - c - ch * 0.15, oy = ch * 0.15;
    x.fillStyle = '#222';
    let s = 5;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      s = (s * 16807) % 2147483647;
      if (s % 2) x.fillRect(ox + i * q, oy + j * q, q, q);
    }
  }));
}

// ------------------------------------------------------------------ extincteur

/** Repère 8 : extincteur portatif à poudre de 5 lb. Origine : centre du fond du cylindre. */
function extincteur(S) {
  const { r, droit, dome, col } = EXT;
  const g = S.group();
  const m = (pts) => pts.map(([a, b]) => [a * IN, b * IN]);
  // Cylindre : fond rentré, virole droite, dôme, col.
  const aDome = Math.acos(col / r) / RAD;
  const yDome = droit + dome * Math.sin(aDome * RAD);
  const profil = [
    [0, 0.3], [1.5, 0.3], [1.7, 0], ...arc(r - 0.3, 0.3, 0.3, -90, 0, 5),
    ...arc(0, 0, 1, 0, aDome, 12).map(([c, s]) => [r * c, droit + dome * s]),
    [col, yDome + 0.3], [0, yDome + 0.3],
  ];
  g.add(S.lathe(m(profil), 'red', { seg: 40 }));
  const yCol = yDome + 0.3;
  g.add(S.cyl(0.85 * IN, 0.3 * IN, 'zinc', { seg: 6, pos: [0, (yCol + 0.15) * IN, 0] }));
  // Robinet : corps en aluminium, bloc du haut, manomètre devant.
  const y0 = yCol + 0.3, hv = 1.6, rv = 0.62;
  g.add(S.cyl(rv * IN, hv * IN, 'castAlu', { pos: [0, (y0 + hv / 2) * IN, 0] }));
  g.add(S.box(1 * IN, 0.4 * IN, 0.9 * IN, 'castAlu', { r: 0.05 * IN, pos: [0, (y0 + hv + 0.15) * IN, 0] }));
  const yg = y0 + 0.7;
  g.add(S.cyl(0.52 * IN, 0.36 * IN, 'chrome', { axis: 'z', pos: [0, yg * IN, (rv + 0.16) * IN] }));
  const cadran = new THREE.Mesh(new THREE.CircleGeometry(0.43 * IN, 28), imprime('manometre', 0xb8322a, 128, 128, (x, w) => {
    x.fillStyle = '#b8322a'; x.beginPath(); x.arc(w / 2, w / 2, w / 2, 0, 7); x.fill();
    x.strokeStyle = '#2f9b4a'; x.lineWidth = w * 0.16;
    x.beginPath(); x.arc(w / 2, w / 2, w * 0.36, -2.0, -1.14); x.stroke();
    x.strokeStyle = '#f4f1e6'; x.lineWidth = w * 0.05;
    x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w * 0.52, w * 0.16); x.stroke();
  }));
  cadran.position.set(0, yg * IN, (rv + 0.35) * IN);
  g.add(cadran);
  // Poignée de transport (inclinée vers le bas, comme sur la photo) et levier de décharge, vers la droite.
  const yl = y0 + hv + 0.5;
  g.add(S.box(4.6 * IN, 0.22 * IN, 0.85 * IN, 'black', { r: 0.06 * IN, pos: [1.9 * IN, yl * IN, 0] }));
  const a = 28 * RAD;
  g.add(S.box(3.6 * IN, 0.2 * IN, 0.8 * IN, 'black', { r: 0.06 * IN, pos: [(0.5 + 1.8 * Math.cos(a)) * IN, (y0 + hv - 0.1 - 1.8 * Math.sin(a)) * IN, 0], rot: [0, 0, -a] }));
  // Goupille de sécurité, son anneau et le scellé bleu.
  const yp = y0 + hv + 0.15;
  g.add(S.rod([0.38 * IN, yp * IN, -0.6 * IN], [0.38 * IN, yp * IN, 0.66 * IN], 0.05 * IN, 'chrome', 10));
  g.add(S.torus(0.42 * IN, 0.045 * IN, 'chrome', { axis: 'z', pos: [0.72 * IN, (yp - 0.42) * IN, 0.66 * IN] }));
  g.add(S.tube(m3([[0.38, yp, 0.62], [1.0, yp + 0.25, 0.7], [1.9, yp - 0.3, 0.5], [2.5, yp - 0.6, 0.2]]), 0.02 * IN, 'blue', { ends: 'none', radial: 6, seg: 16 }));
  // Boyau : sort à gauche du robinet, descend le long du cylindre jusqu'à la sangle.
  const ys = 6.4, rb = 0.3;
  g.add(S.hose(m3([[-rv, y0 + 0.9, 0], [-1.4, y0 + 0.95, 0.05], [-2.3, y0 + 0.5, 0.2], [-2.65, y0 - 0.8, 0.35], [-2.47, droit - 0.4, 0.45], [-2.45, ys + 0.2, 0.45]]), rb * IN));
  g.add(S.cyl(0.36 * IN, 1.4 * IN, 'black', { r2: 0.42 * IN, pos: [-2.45 * IN, (ys - 0.5) * IN, 0.45 * IN] }));
  g.add(S.ring((r + 0.07) * IN, r * IN, 0.55 * IN, 'black', { seg: 40, pos: [0, ys * IN, 0] }));
  g.add(S.box(0.45 * IN, 0.8 * IN, 1 * IN, 'black', { r: 0.05 * IN, pos: [-(r + 0.2) * IN, ys * IN, 0.45 * IN] }));
  // Patte d'accrochage derrière le robinet : la fente reçoit le bec du crochet.
  const zp0 = 0.3 - EXT.z, zp1 = -rv + 0.1;
  const patte = S.plate(1 * IN, (zp1 - zp0) * IN, 0.1 * IN, 'zinc', { cutouts: [[0, (0.82 - EXT.z - (zp0 + zp1) / 2) * IN, 0.6 * IN, 0.4 * IN]] });
  patte.position.set(0, PATTE_Y * IN, ((zp0 + zp1) / 2) * IN);
  g.add(patte);
  // Étiquettes du cylindre : mode d'emploi (blanc bordé de jaune) et marque du fabricant.
  const pose = (y, h, a0, a1, mat) => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry((r + 0.012) * IN, (r + 0.012) * IN, h * IN, 40, 1, true, a0 * RAD, (a1 - a0) * RAD), mat);
    e.position.y = y * IN;
    return e;
  };
  g.add(pose(7, 4.8, -105, 105, imprime('mode-emploi', 0xf1f1ee, 768, 480, (x, w, h) => {
    x.fillStyle = '#f3f3f0'; x.fillRect(0, 0, w, h);
    lignes(x, w * 0.04, h * 0.08, w * 0.27, 14, h * 0.045, h * 0.016, '#555');
    // Volet du mode d'emploi : cadre jaune, bandeau, trois étapes illustrées.
    x.strokeStyle = '#f0d51c'; x.lineWidth = h * 0.03;
    x.strokeRect(w * 0.36, h * 0.04, w * 0.6, h * 0.6);
    x.fillStyle = '#f0d51c'; x.fillRect(w * 0.36, h * 0.04, w * 0.6, h * 0.11);
    x.fillStyle = '#222'; x.font = `900 ${Math.round(h * 0.08)}px Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('MODE D’EMPLOI', w * 0.66, h * 0.1);
    for (let i = 0; i < 3; i++) {
      const y = h * (0.2 + i * 0.145);
      x.fillStyle = '#222'; x.font = `900 ${Math.round(h * 0.07)}px Arial, sans-serif`; x.fillText(String(i + 1), w * 0.41, y + h * 0.045);
      lignes(x, w * 0.45, y + h * 0.015, w * 0.2, 2, h * 0.045, h * 0.018, '#444');
      x.fillStyle = '#c8201c'; x.fillRect(w * 0.76, y, w * 0.13, h * 0.09);
    }
    // Bande des classes de feu et pictogrammes.
    x.strokeRect(w * 0.36, h * 0.68, w * 0.6, h * 0.28);
    for (let i = 0; i < 3; i++) {
      x.fillStyle = '#fff'; x.strokeStyle = '#222'; x.lineWidth = h * 0.012;
      x.fillRect(w * (0.42 + i * 0.18), h * 0.74, w * 0.11, h * 0.16);
      x.strokeRect(w * (0.42 + i * 0.18), h * 0.74, w * 0.11, h * 0.16);
      x.fillStyle = '#222'; x.font = `900 ${Math.round(h * 0.1)}px Arial, sans-serif`;
      x.fillText('ABC'[i], w * (0.475 + i * 0.18), h * 0.825);
      x.strokeStyle = '#f0d51c'; x.lineWidth = h * 0.03;
    }
  })));
  g.add(pose(2.5, 1.6, -8, 30, imprime('marque', 0xf1f1ee, 128, 150, (x, w, h) => {
    x.fillStyle = '#f3f3f0'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#c8201c'; x.fillRect(w * 0.2, h * 0.12, w * 0.6, h * 0.5);
    lignes(x, w * 0.14, h * 0.72, w * 0.72, 2, h * 0.1, h * 0.05, '#333');
  })));
  return g;
}

const m3 = (pts) => pts.map(([x, y, z]) => [x * IN, y * IN, z * IN]);

/** Repère 9 : crochet mural de l'extincteur, boulonné sur le poinçon. */
function crochet(S) {
  const { w, y0, y1, t } = CROCHET;
  const g = S.group();
  g.add(S.box(w * IN, (y1 - y0) * IN, t * IN, 'zinc', { pos: P(POINCON.x, (y0 + y1) / 2, t / 2) }));
  // Bec relevé au bas de la patte.
  const bec = S.extrude([[t, 0], [0.92, 0], [0.92, 0.7], [0.8, 0.7], [0.8, 0.12], [t, 0.12]].map(([z, y]) => [z * IN, y * IN]), 0.5 * IN, 'zinc');
  bec.rotation.y = -Math.PI / 2;
  bec.position.set(...P(POINCON.x, y0, 0));
  g.add(bec);
  // Boulon du haut (seul visible sur la photo).
  g.add(S.cyl(0.3 * IN, 0.2 * IN, 'steel', { axis: 'z', seg: 6, pos: P(POINCON.x, y1 - 0.7, t + 0.1) }));
  return g;
}

/** Repère 10 : étiquette d'inspection en carton, pendue au col. bleue : grande ; jaune : petite, par-dessus. */
function etiquetteInspection(S, jaune) {
  const [w, h] = jaune ? [2.4, 3] : [3.1, 5.3];
  const fond = jaune ? 0xf2d21f : 0x5b9bd8;
  const g = S.group(S.box(w * IN, h * IN, 0.02 * IN, teinte(jaune ? 'carton-jaune' : 'carton-bleu', { color: fond, roughness: 0.8 })));
  const face = autocollant(w, h, imprime(jaune ? 'inspection-jaune' : 'inspection-bleue', fond, 256, Math.round((256 * h) / w), (x, cw, ch) => {
    x.fillStyle = jaune ? '#f2d21f' : '#5b9bd8'; x.fillRect(0, 0, cw, ch);
    x.strokeStyle = jaune ? '#222' : '#27507e'; x.lineWidth = 2;
    // Grille des inspections mensuelles.
    const [gx, gy, gw, gh] = jaune ? [0.08, 0.14, 0.84, 0.8] : [0.08, 0.62, 0.84, 0.32];
    const rangs = jaune ? 12 : 5;
    for (let i = 0; i <= rangs; i++) {
      const y = ch * (gy + (gh * i) / rangs);
      x.beginPath(); x.moveTo(cw * gx, y); x.lineTo(cw * (gx + gw), y); x.stroke();
    }
    for (const k of [0, 0.3, 0.65, 1]) {
      x.beginPath(); x.moveTo(cw * (gx + gw * k), ch * gy); x.lineTo(cw * (gx + gw * k), ch * (gy + gh)); x.stroke();
    }
    lignes(x, cw * 0.1, ch * 0.05, cw * 0.7, 1, 0, ch * 0.03, jaune ? '#222' : '#27507e');
  }));
  face.position.z = 0.012 * IN;
  g.add(face);
  // Œillet.
  g.add(S.ring(0.13 * IN, 0.07 * IN, 0.03 * IN, 'zinc', { axis: 'z', seg: 16, pos: [0, (h / 2 - 0.3) * IN, 0] }));
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  put('12', grillage(S), [0, 0, -0.16]);
  put('1', cadre(S), [0, 0, 0]);
  put('2', ruban(S), [0, 0, 0.07]);

  put('3', caisson(S), [-0.06, 0, 0.14]);
  put('4', toit(S), [-0.06, 0.2, 0.2]);
  put('5', facade(S), [-0.06, 0, 0.72]);
  const yFond = ARM.y0 + ARM.t;
  put('6', S.at(trousse(S), P(TROUSSE.x, yFond + TROUSSE.h / 2, TROUSSE.z)), [-0.16, 0, 0.46]);
  FLACON.pos.forEach(([x, z], i) => put('7', S.at(flacon(S), P(x, yFond, z), [0, (i ? -0.5 : 0.25), 0]), [0.02 + i * 0.1, 0, 0.46]));
  put('11', S.at(etiquetteQR(3.2, 1.1), P((ARM.x0 + ARM.x1) / 2 + 0.2, ARM.y0 + ARM.hDevant - 0.95, ARM.prof + 0.012)), [-0.06, 0.06, 0.78]);
  put('11', S.at(etiquetteQR(2.9, 0.6), P(18.2, 21.5, 0.012)), [0, 0.1, 0.1]);

  put('9', crochet(S), [0, 0.06, 0.12]);
  put('8', S.at(extincteur(S), P(EXT.x, EXT.y, EXT.z)), [0.14, -0.02, 0.34]);
  // Étiquettes d'inspection devant le haut du cylindre, un peu de travers, la jaune sur la bleue.
  const zEt = EXT.z + EXT.r + 0.15;
  put('10', S.at(etiquetteInspection(S, false), P(EXT.x + 0.75, EXT.y + 9.6, zEt), [0, 0, -6 * RAD]), [0.3, 0, 0.5]);
  put('10', S.at(etiquetteInspection(S, true), P(EXT.x + 0.5, EXT.y + 10.7, zEt + 0.05), [0, 0, -4 * RAD]), [0.36, 0.06, 0.58]);

  return { view: { dir: [-0.45, 0.4, 1] } };
}

export default { P01 };
