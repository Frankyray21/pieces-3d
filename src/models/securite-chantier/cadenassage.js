// Cadenassage : boîte de cadenassage de groupe, pince multi-lock (moraillon),
// cadenas personnels et étiquettes « DANGER — CADENASSÉ ».
import * as THREE from 'three';
import { IN, RAD, tige, arc, plaque, rectArrondi } from './geo.js';
import { peintureUsee, plastiqueSale, imprime, uni, texte } from './textures.js';

// ------------------------------------------------------------------ cotes

export const BOITE = { w: 12 * IN, h: 9 * IN, d: 4 * IN, t: 0.06 * IN, patte: 1.5 * IN, trous: 12, dTrou: 0.4 * IN, pas: 0.85 * IN, fenetre: [7 * IN, 3.5 * IN] };
export const CADENAS = { w: 1.5 * IN, h: 1.75 * IN, d: 0.75 * IN, anse: 0.25 * IN, ouverture: 0.75 * IN, degagement: 1.5 * IN };
export const PINCE = { jaw: 1 * IN, tige: 0.25 * IN, poignee: [1.6 * IN, 2.3 * IN], ep: 0.12 * IN, trou: 0.42 * IN };
export const ETIQ = { w: 3 * IN, h: 5.75 * IN, t: 0.02 * IN };

const zinc = () => uni('Acier_Zingue', { color: 0xbfc3c6, metalness: 1, roughness: 0.38 });
const anseMat = () => uni('Acier_Anse', { color: 0xc9ccce, metalness: 1, roughness: 0.25 });

// ------------------------------------------------------------------ boîte

/**
 * Boîte de cadenassage de groupe, acier peint rouge : les clés des cadenas de
 * l'équipement y sont enfermées, chaque travailleur met son cadenas sur la patte.
 * Origine : bas du dos, au centre ; face vers +Z.
 */
export function boite() {
  const g = new THREE.Group();
  const { w, h, d, t, patte, trous, dTrou, pas, fenetre } = BOITE;
  const rouge = peintureUsee('Boite_Cadenassage', 0xb8141b, { usure: 0.28, boue: 0.35, seed: 110 });
  const facade = imprime('Boite_Cadenassage_Facade', 0xb8141b, [512, 384], (x, cw, ch) => {
    x.fillStyle = '#b5141b'; x.fillRect(0, 0, cw, ch);
    texte(x, 'CADENASSAGE', cw / 2, ch * 0.1, cw * 0.8, 40, { couleur: '#fff' });
    texte(x, 'DE GROUPE', cw / 2, ch * 0.2, cw * 0.6, 30, { couleur: '#fff' });
    // Emplacement de la fenêtre (le vrai vitrage est un maillage à part).
    x.fillStyle = '#5c0a0e'; x.fillRect(cw * 0.2, ch * 0.32, cw * 0.6, ch * 0.42);
    texte(x, 'Clés à l’intérieur — ne pas ouvrir', cw / 2, ch * 0.86, cw * 0.86, 20, { poids: 700, couleur: '#fff', police: 'Arial, sans-serif' });
  }, { sale: 0.35, seed: 112 });
  // Caisson (dos, côtés, fond, dessus), tôle repliée.
  const parois = [
    [w, h, t, 0, h / 2, t / 2],
    [t, h, d, -w / 2 + t / 2, h / 2, d / 2], [t, h, d, w / 2 - t / 2, h / 2, d / 2],
    [w, t, d, 0, t / 2, d / 2], [w, t, d, 0, h - t / 2, d / 2],
  ];
  for (const [a, b, c, x, y, z] of parois) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), rouge);
    m.position.set(x, y, z);
    g.add(m);
  }
  // Fente du dessus pour glisser les clés.
  const fente = new THREE.Mesh(new THREE.BoxGeometry(3 * IN, 0.002, 0.3 * IN), uni('Noir_Fente', { color: 0x080808, roughness: 0.9 }));
  fente.position.set(0, h + 0.0005, d * 0.45);
  g.add(fente);
  // Couvercle de façade (charnière à gauche), avec la fenêtre de polycarbonate.
  const couv = new THREE.Mesh(new THREE.BoxGeometry(w + 0.004, h + 0.004, t), [rouge, rouge, rouge, rouge, facade, rouge]);
  couv.position.set(0, h / 2, d + t / 2);
  g.add(couv);
  const vitre = new THREE.Mesh(new THREE.BoxGeometry(fenetre[0], fenetre[1], 0.003), uni('Polycarbonate', { color: 0xd8e2e6, roughness: 0.15, transparent: true, opacity: 0.35 }));
  vitre.position.set(0, h * 0.47, d + t + 0.0016);
  g.add(vitre);
  // Charnière piano à gauche.
  g.add(tige([[-w / 2 - 0.003, 0.2 * IN, d + t / 2], [-w / 2 - 0.003, h - 0.2 * IN, d + t / 2]], 0.004, zinc(), { radial: 10 }));
  // Pattes de cadenassage : celle du caisson (derrière) et celle du couvercle (devant) descendent
  // sous la boîte, trous en face : un cadenas dans un trou empêche d'ouvrir. Boîte montée au mur.
  const yP = -patte / 2 + 0.1 * IN, yT = -patte * 0.18;
  const tr = Array.from({ length: trous }, (_, i) => ({ x: (i - (trous - 1) / 2) * pas, y: yT, r: dTrou / 2 }));
  for (const z of [d - 0.0013, d + 0.0013]) {
    const p = plaque(rectArrondi(w - 0.4 * IN, patte, 0.15 * IN), 0.0025, rouge, tr);
    p.position.set(0, yP, z);
    g.add(p);
  }
  g.userData.trou = (i) => [(i - (trous - 1) / 2) * pas, yP + yT, d];
  return g;
}

// ------------------------------------------------------------------ cadenas

/**
 * Cadenas de sécurité à corps de nylon (couleur au choix) et anse d'acier.
 * Origine : centre de l'anse au point où elle passe dans le trou (haut de l'anse) ;
 * le corps pend dessous, face vers +Z.
 */
export function cadenas(couleur = 0xc8161c, seed = 0) {
  const g = new THREE.Group();
  const { w, h, d, anse, ouverture, degagement } = CADENAS;
  const corps = plastiqueSale(`Cadenas_${couleur.toString(16)}`, couleur, { boue: 0.35, rayures: 0.9, seed: 130 + seed, rough: 0.4 });
  const ra = (ouverture + anse) / 2;
  const yb = -(ra + degagement); // haut du corps
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 2, 2, 1), corps);
  body.position.y = yb - h / 2;
  // Coins arrondis : on écrase les sommets vers l'intérieur.
  const p = body.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    if (Math.abs(x) > w / 2 - 1e-6 && Math.abs(y) > h / 2 - 1e-6) { p.setX(i, x * 0.9); p.setY(i, y * 0.95); }
  }
  body.geometry.computeVertexNormals();
  g.add(body);
  // Étiquette blanche « DANGER » de la face, avec le nom (illisible) du travailleur.
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, h * 0.6), imprime('Cadenas_Etiquette', 0xf2f0ea, [128, 128], (x, cw, ch) => {
    x.fillStyle = '#f3f1ea'; x.fillRect(0, 0, cw, ch);
    x.fillStyle = '#c8161c'; x.fillRect(0, 0, cw, ch * 0.32);
    texte(x, 'DANGER', cw / 2, ch * 0.17, cw * 0.86, 24, { couleur: '#fff' });
    x.strokeStyle = '#1b2a6a'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(cw * 0.12, ch * 0.62);
    for (let k = 0; k < 9; k++) x.lineTo(cw * (0.12 + k * 0.095), ch * (0.58 + ((k * 7 + seed) % 5) * 0.03));
    x.stroke();
  }, { sale: 0.5, seed: 140 + seed }));
  lab.position.set(0, yb - h * 0.45, d / 2 + 0.0004);
  g.add(lab);
  // Trou de clé sous le corps.
  const cle = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * IN, 0.11 * IN, 0.001, 16), uni('Laiton_Barillet', { color: 0xb08d4a, metalness: 1, roughness: 0.35 }));
  cle.position.y = yb - h - 0.0003;
  g.add(cle);
  // Anse en U : branche gauche entre dans le corps, droite aussi (fermée).
  const pts = [[-ra, yb - 0.4 * IN, 0], [-ra, -ra, 0], ...arc([0, -ra, 0], ra, 180, 0, 14).slice(1, -1), [ra, -ra, 0], [ra, yb - 0.4 * IN, 0]];
  // arc() part de l'angle 180° (gauche) vers 0° (droite) en passant par le haut (sin > 0).
  g.add(tige(pts, anse / 2, anseMat(), { radial: 12, tension: 0.2 }));
  g.userData.basAnse = yb;
  return g;
}

// ------------------------------------------------------------------ étiquette

/** Étiquette de cadenassage « DANGER — CADENASSÉ — NE PAS FAIRE FONCTIONNER ». Origine : centre de l'œillet, face +Z. */
export function etiquette(seed = 0) {
  const g = new THREE.Group();
  const { w, h, t } = ETIQ;
  const m = imprime('Etiquette_Cadenassage', 0xc8161c, [256, 490], (x, cw, ch) => {
    x.fillStyle = '#f3f1ea'; x.fillRect(0, 0, cw, ch);
    x.fillStyle = '#111'; x.fillRect(0, ch * 0.1, cw, ch * 0.2);
    x.fillStyle = '#d0121b';
    x.beginPath(); x.ellipse(cw / 2, ch * 0.2, cw * 0.42, ch * 0.075, 0, 0, 7); x.fill();
    texte(x, 'DANGER', cw / 2, ch * 0.205, cw * 0.62, 44, { couleur: '#fff' });
    texte(x, 'CADENASSÉ', cw / 2, ch * 0.4, cw * 0.88, 40, { couleur: '#c8121b' });
    texte(x, 'NE PAS FAIRE', cw / 2, ch * 0.5, cw * 0.88, 28, { couleur: '#111' });
    texte(x, 'FONCTIONNER', cw / 2, ch * 0.57, cw * 0.88, 28, { couleur: '#111' });
    x.font = '700 15px Arial, sans-serif'; x.textAlign = 'left'; x.fillStyle = '#222';
    ['Nom :', 'Service :', 'Date :'].forEach((c, i) => {
      const y = ch * (0.68 + i * 0.09);
      x.fillText(c, cw * 0.08, y); x.fillRect(cw * 0.36, y + 2, cw * 0.56, 1.5);
    });
    x.strokeStyle = 'rgba(20,30,90,0.9)'; x.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const y = ch * (0.68 + i * 0.09) - 3;
      x.beginPath(); x.moveTo(cw * 0.38, y);
      for (let k = 0; k < 10; k++) x.lineTo(cw * (0.38 + k * 0.055), y - 6 + ((k * 13 + seed * 5 + i * 3) % 9));
      x.stroke();
    }
  }, { sale: 0.5, seed: 150 + seed });
  const pl = plaque(rectArrondi(w, h, 0.2 * IN), t, m, [{ x: 0, y: h / 2 - 0.45 * IN, r: 0.14 * IN }]);
  pl.position.y = -(h / 2 - 0.45 * IN);
  g.add(pl);
  const oe = new THREE.Mesh(new THREE.TorusGeometry(0.19 * IN, 0.05 * IN, 8, 20), uni('Laiton_Oeillet', { color: 0xb8964e, metalness: 1, roughness: 0.4 }));
  g.add(oe);
  return g;
}

// ------------------------------------------------------------------ pince multi-lock

/**
 * Pince multi-lock (moraillon de cadenassage) : mâchoires d'acier de 1 po,
 * poignée enrobée de vinyle rouge à six trous (trois rangées de deux).
 * Origine : centre de la mâchoire ; la poignée pend dessous, à plat dans le plan XY.
 */
export function pince() {
  const g = new THREE.Group();
  const { jaw, tige: dt, poignee: [pw, ph], ep, trou } = PINCE;
  const R = (jaw + dt) / 2, rr = dt / 2;
  const acier = zinc();
  const vinyle = plastiqueSale('Pince_Vinyle', 0xc0141a, { boue: 0.3, rayures: 0.6, seed: 160, rough: 0.45 });
  // Deux moitiés de mâchoire, décalées en épaisseur ; chacune : demi-cercle + tige qui descend dans sa plaque.
  const yJ = -R - 0.15 * IN; // haut de la poignée
  for (const [s, z] of [[-1, -ep * 0.6], [1, ep * 0.6]]) {
    const pts = [[s * R * 0.35, yJ - 0.1 * IN, z], [s * R * 0.9, -R * 0.75, z], ...arc([0, 0, z], R, s > 0 ? -50 : 230, s > 0 ? 175 : 5, 16)];
    g.add(tige(pts, rr, acier, { radial: 10, tension: 0.3 }));
  }
  // Poignée : deux plaques d'acier enrobées, six trous.
  const trous = [];
  for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) trous.push({ x: sx * pw * 0.22, y: -ph * (0.27 + i * 0.25), r: trou / 2 });
  const contour = [[-pw / 2, -ph], [pw / 2, -ph], [pw / 2, -0.25 * IN], [pw * 0.18, 0], [-pw * 0.18, 0], [-pw / 2, -0.25 * IN]];
  for (const z of [-ep * 0.6, ep * 0.6]) {
    const p = plaque(contour, ep, vinyle, trous);
    p.position.set(0, yJ, z);
    g.add(p);
  }
  // Rivet de l'articulation.
  const riv = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * IN, 0.1 * IN, ep * 2.6, 14), acier);
  riv.rotation.x = Math.PI / 2;
  riv.position.set(0, yJ - 0.08 * IN, 0);
  g.add(riv);
  g.userData.trou = (i) => [trous[i].x, yJ + trous[i].y, 0];
  g.userData.yJ = yJ;
  return g;
}
