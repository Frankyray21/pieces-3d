// Protection contre les chutes : harnais complet (porté : forme d'un travailleur
// de taille moyenne, sans le corps), longe à absorbeur d'énergie et bloc
// rétractable (enrouleur-dérouleur à câble).
import * as THREE from 'three';
import { IN, RAD, bande, tige, arc } from './geo.js';
import { sangle, plastiqueSale, peintureUsee, uni, imprime, texte } from './textures.js';

// ------------------------------------------------------------------ cotes

export const SANGLE = { w: 1.75 * IN, e: 0.002 };
export const DRING = { w: 2.6 * IN, h: 2.1 * IN, r: 0.17 * IN };
export const LONGE = { long: 6 * 12 * IN, w: 1 * IN, pack: [3 * IN, 6 * IN, 1.5 * IN] };
export const SRL = { d: 9 * IN, ep: 3.6 * IN, cable: (3 / 16) * IN, sortie: 0.45 };
// Silhouette du porteur (m) : demi-largeur a et demi-profondeur b du torse selon la hauteur.
const TORSE = [[0.84, 0.16, 0.11], [0.95, 0.17, 0.11], [1.05, 0.15, 0.1], [1.2, 0.16, 0.105], [1.3, 0.17, 0.11], [1.42, 0.19, 0.095], [1.55, 0.13, 0.08]];
const CUISSE = { x: 0.095, y: 0.79, r: 0.088 };

function torse(y) {
  for (let i = 0; i < TORSE.length - 1; i++) {
    const [y0, a0, b0] = TORSE[i], [y1, a1, b1] = TORSE[i + 1];
    if (y <= y1 || i === TORSE.length - 2) {
      const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
      return [a0 + (a1 - a0) * t, b0 + (b1 - b0) * t];
    }
  }
  return [TORSE[0][1], TORSE[0][2]];
}

/** Normale « vers l'extérieur du corps » au point p (torse elliptique, épaules vers le haut). */
function nTorse(p) {
  const [a, b] = torse(p.y);
  return new THREE.Vector3(p.x / (a * a), Math.max(0, p.y - 1.44) * 90, p.z / (b * b));
}

const nCuisse = (s) => (p) => new THREE.Vector3(p.x - s * CUISSE.x, 0, p.z);

const acier = () => uni('Acier_Forge', { color: 0x9fa4a8, metalness: 1, roughness: 0.35 });
const matSangle = () => sangle('Harnais_Sangle', 0xe8b512, { seed: 171, sale: 0.55, rayure: 0x1e1f21 });

// ------------------------------------------------------------------ pièces de métal

/** Anneau en D forgé : barre droite en bas (y = 0), arrondi vers le haut ; plan XY. */
export function dRing() {
  const { w, h, r } = DRING;
  const R = w / 2;
  const pts = [[-R, 0, 0], [-R, h - R, 0], ...arc([0, h - R, 0], R, 180, 0, 16).slice(1, -1), [R, h - R, 0], [R, 0, 0]];
  return tige(pts, r, acier(), { closed: true, radial: 12, tension: 0.15 });
}

/** Boucle à passant (cadre rectangulaire) de largeur w, plan XY. */
function boucle(w = 2.1 * IN, h = 1.1 * IN, r = 0.09 * IN) {
  const pts = [[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]];
  const g = tige(pts, r, acier(), { closed: true, radial: 8, tension: 0.05 });
  // Barre centrale coulissante.
  g.add(tige([[-w / 2, 0, 0], [w / 2, 0, 0]], r * 0.9, acier(), { radial: 8 }));
  return g;
}

/**
 * Mousqueton à double verrouillage (ou crochet à armature, grand = true), plan XY :
 * œil en bas à l'origine, dos à gauche, bec en haut à droite, doigt de fermeture.
 */
export function mousqueton(grand = false) {
  const g = new THREE.Group();
  const L = grand ? 9.5 * IN : 4.3 * IN, W = grand ? 3.2 * IN : 1.6 * IN, r = grand ? 0.22 * IN : 0.16 * IN;
  const m = grand ? uni('Alu_Crochet', { color: 0xb7bbbf, metalness: 1, roughness: 0.4 }) : acier();
  const R = W / 2, yA = L * 0.72;
  // Corps : du bas de l'œil, le dos monte, l'arc du crochet, le bec redescend.
  const corps = [[0.2 * W, 0.12 * L, 0], [0, 0.25 * L, 0], [0, yA, 0], ...arc([R, yA, 0], R, 180, 0, 14).slice(1, -1), [W, yA, 0], [W, yA - 0.12 * L, 0]];
  g.add(tige(corps, r, m, { radial: 10, tension: 0.3 }));
  // Doigt (gâchette) : du bec jusqu'au pivot près de l'œil.
  g.add(tige([[W * 0.98, yA - 0.13 * L, 0], [W * 0.45, 0.16 * L, 0]], r * 0.75, m, { radial: 8 }));
  // Levier du second verrou le long du dos (crochet à armature) ou petit poussoir.
  if (grand) g.add(tige([[-0.02 * W, 0.2 * L, 0.004], [-0.12 * W, 0.45 * L, 0.004], [-0.05 * W, 0.62 * L, 0.004]], r * 0.8, uni('Noir_Levier', { color: 0x222326, roughness: 0.5 }), { radial: 8 }));
  // Œil d'attache (tournant) en bas.
  const oe = new THREE.Mesh(new THREE.TorusGeometry(0.17 * W, r * 0.85, 8, 20), m);
  oe.position.set(0.22 * W, 0.02 * L, 0);
  g.add(oe);
  g.userData.oeil = [0.22 * W, 0.02 * L - 0.17 * W, 0];
  g.userData.bec = [R, yA + R - r, 0];
  return g;
}

// ------------------------------------------------------------------ harnais

/** Sangle du harnais le long des points (normale du torse par défaut). */
function brin(points, normale = nTorse, opts = {}) {
  return bande(points, SANGLE.w, SANGLE.e, matSangle(), { normale, periode: SANGLE.w * 2, tension: 0.4, ...opts });
}

/**
 * Harnais complet, porté (forme du porteur sans le corps), origine au sol entre les pieds,
 * face vers +Z. Renvoie { sangles, dRing, boucles, plaque } pour l'enregistrer par repères.
 */
export function harnais() {
  const sangles = new THREE.Group(), boucles = new THREE.Group();
  for (const s of [1, -1]) {
    const X = (x) => s * x;
    // Bretelle : poitrine, épaule, dos en croix jusqu'à la fesse opposée.
    sangles.add(brin([[X(0.085), 1.27, 0.118], [X(0.1), 1.38, 0.1], [X(0.115), 1.5, 0.045], [X(0.11), 1.52, -0.02], [X(0.08), 1.47, -0.085], [X(0.025), 1.4, -0.106], [X(-0.045), 1.26, -0.112], [X(-0.1), 1.1, -0.108], [X(-0.12), 0.96, -0.115], [X(-0.1), 0.87, -0.11]]));
    // Brin avant : poitrine → hanche → avant de la cuisse.
    sangles.add(brin([[X(0.085), 1.27, 0.118], [X(0.105), 1.15, 0.105], [X(0.125), 1.02, 0.108], [X(0.12), 0.92, 0.108], [X(0.105), 0.85, 0.09]]));
    // Tour de cuisse, légèrement incliné.
    const tour = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      tour.push([s * CUISSE.x + Math.sin(a) * CUISSE.r * 1.05 * s, CUISSE.y + Math.cos(a) * 0.025, Math.cos(a) * CUISSE.r]);
    }
    sangles.add(brin(tour, nCuisse(s), { closed: true }));
    // Boucle du tour de cuisse, à l'avant.
    const b = boucle();
    b.position.set(s * (CUISSE.x - 0.005), CUISSE.y + 0.024, CUISSE.r + 0.006);
    b.rotation.z = 90 * RAD;
    boucles.add(b);
    // Bout libre de la sangle de cuisse qui pend.
    sangles.add(brin([[s * (CUISSE.x - 0.005), CUISSE.y + 0.02, CUISSE.r + 0.012], [s * (CUISSE.x + 0.01), CUISSE.y - 0.05, CUISSE.r + 0.02], [s * (CUISSE.x + 0.02), CUISSE.y - 0.12, CUISSE.r + 0.005]], () => new THREE.Vector3(0, 0, 1)));
  }
  // Sangle sous-fessière : relie les deux bretelles du dos sous les fesses.
  sangles.add(brin([[0.1, 0.87, -0.11], [0.05, 0.84, -0.125], [-0.05, 0.84, -0.125], [-0.1, 0.87, -0.11]]));
  // Sangle de poitrine et sa boucle.
  sangles.add(brin([[-0.085, 1.27, 0.122], [-0.04, 1.275, 0.13], [0.04, 1.275, 0.13], [0.085, 1.27, 0.122]], () => new THREE.Vector3(0, 0, 1)));
  const bp = boucle(2.2 * IN, 1.2 * IN);
  bp.position.set(0.012, 1.275, 0.135);
  bp.rotation.set(0, 0, 90 * RAD);
  boucles.add(bp);
  // Plaque dorsale (plastique noir) au croisement des bretelles, porte-anneau.
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.8 * IN, 4.2 * IN, 0.25 * IN, 2, 2, 1), plastiqueSale('Harnais_Plaque', 0x1c1d1f, { boue: 0.3, seed: 175, rough: 0.6 }));
  plaque.position.set(0, 1.385, -0.122);
  plaque.rotation.x = -8 * RAD;
  // Anneau dorsal, relevé contre le dos.
  const d = dRing();
  d.position.set(0, 1.4, -0.132);
  d.rotation.x = -15 * RAD;
  return { sangles, boucles, plaque, dRing: d, ancrage: new THREE.Vector3(0, 1.4 + DRING.h * Math.cos(15 * RAD), -0.132 - DRING.h * Math.sin(15 * RAD)) };
}

// ------------------------------------------------------------------ longe

/**
 * Longe de 6 pi à absorbeur d'énergie, accrochée à l'anneau dorsal (point haut) :
 * petit mousqueton, absorbeur dans sa housse, sangle tubulaire qui pend puis repose au sol,
 * crochet à armature au bout. haut : point d'accrochage (Vector3).
 */
export function longe(haut) {
  const g = new THREE.Group();
  const [pw, ph, pd] = LONGE.pack;
  const m1 = mousqueton(false);
  // Mousqueton pendu dans l'anneau : plan du crochet perpendiculaire à l'anneau,
  // la barre de l'anneau au fond de l'arc du crochet ; la housse pend sous son œil.
  m1.rotation.y = 90 * RAD;
  m1.updateMatrix();
  const W1 = 1.6 * IN, L1 = 4.3 * IN;
  const fondArc = new THREE.Vector3(W1 / 2, L1 * 0.72 + W1 * 0.35, 0).applyMatrix4(m1.matrix);
  m1.position.copy(haut).sub(fondArc);
  m1.updateMatrix();
  g.add(m1);
  const oeil = new THREE.Vector3(...m1.userData.oeil).applyMatrix4(m1.matrix);
  const yPack = oeil.y - 0.004;
  haut = new THREE.Vector3(oeil.x, haut.y, oeil.z + 0.04);
  // Housse de l'absorbeur (sangle repliée dedans), noire, usée.
  const pack = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd, 3, 4, 2), plastiqueSale('Longe_Housse', 0x202123, { boue: 0.6, rayures: 0.5, seed: 181, rough: 0.8 }));
  const p = pack.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    // Housse bombée et arrondie.
    const x = p.getX(i) / (pw / 2), y = p.getY(i) / (ph / 2), z = p.getZ(i);
    p.setZ(i, z * (1 - 0.3 * x * x) * (1 - 0.15 * y * y));
    p.setX(i, p.getX(i) * (1 - 0.08 * y * y));
  }
  pack.geometry.computeVertexNormals();
  pack.position.set(haut.x, yPack - ph / 2, haut.z - 0.04);
  g.add(pack);
  // Étiquette cousue sur la housse.
  const et = new THREE.Mesh(new THREE.PlaneGeometry(pw * 0.7, ph * 0.45), imprime('Longe_Etiquette', 0xf0eee8, [128, 192], (x, w, h) => {
    x.fillStyle = '#f0eee6'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d6a412'; x.fillRect(0, 0, w, h * 0.2);
    texte(x, 'ABSORBEUR', w / 2, h * 0.1, w * 0.9, 18, { couleur: '#111' });
    x.fillStyle = '#444'; for (let i = 0; i < 9; i++) x.fillRect(w * 0.1, h * (0.3 + i * 0.07), w * (0.5 + ((i * 37) % 30) / 100), 3);
  }, { sale: 0.7, seed: 183 }));
  et.position.set(haut.x, yPack - ph * 0.45, haut.z - 0.04 - pd / 2 * 0.98 - 0.0005);
  et.rotation.y = Math.PI;
  g.add(et);
  // Sangle tubulaire : sort du bas de la housse, pend, se couche au sol.
  const y0 = yPack - ph, z0 = haut.z - 0.04;
  const pts = [[haut.x, y0, z0], [haut.x, y0 - 0.3, z0 - 0.02], [haut.x + 0.01, 0.35, z0 - 0.05], [haut.x + 0.03, 0.05, z0 - 0.14], [haut.x + 0.06, 0.012, z0 - 0.35], [haut.x + 0.02, 0.012, z0 - 0.62]];
  const s = bande(pts, LONGE.w, 0.004, sangle('Longe_Sangle', 0x2c2d30, { seed: 185, sale: 0.7, rayure: 0xc9a21a }), {
    normale: (q) => (q.y > 0.06 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0)), periode: LONGE.w * 2, tension: 0.35,
  });
  g.add(s);
  // Crochet à armature au bout, couché au sol.
  const m2 = mousqueton(true);
  m2.rotation.set(-90 * RAD, 0, 180 * RAD);
  m2.position.set(haut.x + 0.02 + 0.6 * IN, 0.006, z0 - 0.62);
  g.add(m2);
  return g;
}

// ------------------------------------------------------------------ bloc rétractable

/**
 * Bloc rétractable à câble (enrouleur-dérouleur) : carter de Ø 9 po, émerillon et
 * mousqueton d'ancrage en haut, câble d'acier galvanisé de 3/16 po sorti de 0,45 m,
 * indicateur de chute et mousqueton au bout. Origine : centre du carter ; face vers +Z.
 */
export function blocRetractable() {
  const g = new THREE.Group();
  const { d, ep, cable, sortie } = SRL;
  const R = d / 2;
  const carter = peintureUsee('Bloc_Carter', 0x2d3135, { usure: 0.15, boue: 0.45, seed: 190 });
  const etiq = imprime('Bloc_Etiquette', 0xe0b11a, [384, 384], (x, w, h) => {
    x.fillStyle = '#2c3034'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e3b41a';
    x.beginPath(); x.arc(w / 2, h / 2, w * 0.42, 0, 7); x.fill();
    texte(x, 'BLOC', w / 2, h * 0.4, w * 0.6, 54, { couleur: '#111' });
    texte(x, 'RÉTRACTABLE', w / 2, h * 0.52, w * 0.7, 40, { couleur: '#111' });
    texte(x, 'Inspecter avant usage', w / 2, h * 0.64, w * 0.66, 22, { poids: 700, couleur: '#222', police: 'Arial, sans-serif' });
  }, { sale: 0.45, seed: 192 });
  // Carter : disque bombé (profil tourné autour de Z), étiquette ronde sur chaque face.
  const prof = [[0, -ep / 2], [R * 0.82, -ep / 2], [R * 0.97, -ep * 0.38], [R, 0], [R * 0.97, ep * 0.38], [R * 0.82, ep / 2], [0, ep / 2]];
  const lat = new THREE.LatheGeometry(prof.map(([r, z]) => new THREE.Vector2(r, z)), 48);
  lat.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(lat, carter));
  for (const s of [1, -1]) {
    const f = new THREE.Mesh(new THREE.CircleGeometry(R * 0.78, 40), etiq);
    f.position.z = s * (ep / 2 + 0.0004);
    if (s < 0) f.rotation.y = Math.PI;
    g.add(f);
  }
  // Poignée-ancrage moulée en haut, émerillon et mousqueton d'ancrage.
  const anse = tige([[-R * 0.35, R * 0.85, 0], [-R * 0.3, R * 1.18, 0], [R * 0.3, R * 1.18, 0], [R * 0.35, R * 0.85, 0]], 0.35 * IN, carter, { radial: 10, tension: 0.3 });
  g.add(anse);
  const em = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * IN, 0.4 * IN, 0.9 * IN, 16), acier());
  em.position.y = R * 1.18 + 0.45 * IN + 0.25 * IN;
  g.add(em);
  const oe = new THREE.Mesh(new THREE.TorusGeometry(0.55 * IN, 0.16 * IN, 8, 20), acier());
  oe.position.y = em.position.y + 0.45 * IN + 0.5 * IN;
  oe.rotation.y = Math.PI / 2;
  g.add(oe);
  const mq = mousqueton(false);
  mq.rotation.z = Math.PI;
  mq.position.set(0.8 * IN, oe.position.y + 0.55 * IN + 4.3 * IN * 0.9, 0);
  g.add(mq);
  // Guide de câble en bas, câble, butée de caoutchouc, indicateur de chute, mousqueton.
  const yG = -R - 0.4 * IN;
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45 * IN, 0.6 * IN, 0.8 * IN, 16), uni('Caoutchouc', { color: 0x1a1a1b, roughness: 0.85 })).translateY(yG));
  const yC = yG - sortie;
  g.add(tige([[0, yG, 0], [0.004, (yG + yC) / 2, 0.003], [0, yC, 0]], cable / 2, uni('Cable_Galva', { color: 0x9da2a4, metalness: 1, roughness: 0.5 }), { radial: 8 }));
  const butee = new THREE.Mesh(new THREE.SphereGeometry(0.55 * IN, 16, 12), uni('Butee_Rouge', { color: 0xb3171d, roughness: 0.6 }));
  butee.scale.set(1, 1.3, 1);
  butee.position.y = yC - 0.3 * IN;
  g.add(butee);
  const mb = mousqueton(false);
  mb.rotation.z = Math.PI;
  mb.position.set(0.8 * IN - 0.22 * 1.6 * IN * 0 , yC - 0.6 * IN, 0);
  g.add(mb);
  return g;
}
