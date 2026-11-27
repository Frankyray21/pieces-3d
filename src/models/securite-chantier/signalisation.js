// Barricade (ruban et carte d'identification) et affiches de la place de travail.
import * as THREE from 'three';
import { IN, RAD, bande, tige, plaque, rectArrondi } from './geo.js';
import { imprime, uni, texte, plastiqueSale } from './textures.js';

// ------------------------------------------------------------------ cotes

export const RUBAN = { large: 3 * IN, ep: 0.05e-3 * 8, portee: 4.0, haut: 1.2, fleche: 0.14, motif: 0.6 };
export const AFFICHE = { w: 12 * IN, h: 18 * IN, t: 0.04 * IN, r: 0.5 * IN, trou: (3 / 32) * IN, marge: 0.5 * IN };
export const CARTE = { w: 3.25 * IN, h: 5.5 * IN, t: 0.012 * IN };
export const FIL = { d: 0.006, long: 0.36 }; // fil de grillage où le ruban est noué (photo PH3)

// ------------------------------------------------------------------ ruban

/** Matériau du ruban rouge imprimé « DANGER » (motif de 0,6 m répété). */
function matRuban() {
  return imprime('Ruban_Danger', 0xc8141c, [512, 64], (x, w, h) => {
    x.fillStyle = '#c4161d'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4f1ea';
    for (let i = 0; i < 2; i++) texte(x, 'DANGER', w * (0.25 + i * 0.5), h * 0.53, w * 0.36, h * 0.78, { couleur: '#f4f1ea' });
  }, { sale: 0.35, seed: 41, rough: 0.35 });
}

/**
 * Ruban tendu de a vers b, avec une flèche au milieu et un léger vrillage.
 * La largeur du ruban est verticale ; renvoie le Mesh (U = mètres / motif).
 */
export function ruban(a, b, { fleche = RUBAN.fleche, vrille = 12, seed = 0 } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const n = 24, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = A.clone().lerp(B, t);
    p.y -= fleche * 4 * t * (1 - t);
    pts.push(p);
  }
  const span = B.clone().sub(A).setY(0).normalize();
  const cote = new THREE.Vector3(-span.z, 0, span.x);
  const normale = (p, t) => {
    const ang = Math.sin(t * Math.PI * 3 + seed) * vrille * RAD * Math.sin(t * Math.PI);
    return cote.clone().applyAxisAngle(span, ang);
  };
  return bande(pts, RUBAN.large, RUBAN.ep, matRuban(), { normale, periode: RUBAN.motif });
}

/** Nœud du ruban autour d'un fil vertical en (x, y, z) : boucle serrée et deux bouts pendants. */
export function noeud(pos, sens = 1, seed = 0) {
  const g = new THREE.Group();
  const [x, y, z] = pos, r = FIL.d / 2 + 0.004;
  const boucle = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    boucle.push([x + Math.cos(a) * r * 1.6, y + Math.sin(a * 2) * 0.004, z + Math.sin(a) * r * 1.6]);
  }
  g.add(bande(boucle, RUBAN.large * 0.7, RUBAN.ep, matRuban(), { closed: true, normale: (p) => new THREE.Vector3(p.x - x, 0, p.z - z) }));
  // Deux bouts qui pendent, vrillés.
  for (const [k, L] of [[0, 0.22], [1, 0.3]]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([x + sens * (0.012 + t * 0.03 + k * 0.01), y - t * L, z + 0.006 + k * 0.008 + Math.sin(t * 3 + seed) * 0.01]);
    }
    const tw = (k ? 35 : -25) * RAD;
    g.add(bande(pts, RUBAN.large * 0.9, RUBAN.ep, matRuban(), { normale: (p, t) => new THREE.Vector3(Math.sin(tw * t), 0, Math.cos(tw * t)), periode: RUBAN.motif }));
  }
  return g;
}

/** Bout de fil de grillage vertical où le ruban est noué (support montré sur les photos, pas fourni). */
export function fil(pos) {
  return tige([[pos[0], pos[1] - FIL.long / 2, pos[2]], [pos[0], pos[1] + FIL.long / 2, pos[2]]], FIL.d / 2, uni('Fil_Grillage', { color: 0x6b6258, metalness: 0.7, roughness: 0.75 }), { radial: 8 });
}

// ------------------------------------------------------------------ carte de barricade

/** Carte d'identification de la barricade (qui l'a posée, quand, pourquoi), pendue au ruban. */
export function carte() {
  const g = new THREE.Group();
  const m = imprime('Carte_Barricade', 0xd9201c, [256, 432], (x, w, h) => {
    x.fillStyle = '#f2efe6'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#c8161c'; x.fillRect(0, 0, w, h * 0.26);
    texte(x, 'DANGER', w / 2, h * 0.09, w * 0.84, 46, { couleur: '#fff' });
    texte(x, 'BARRICADE', w / 2, h * 0.19, w * 0.84, 34, { couleur: '#fff' });
    x.fillStyle = '#222';
    const champs = ['Nom :', 'Date :', 'Heure :', 'Raison :'];
    champs.forEach((c, i) => {
      const y = h * (0.36 + i * 0.13);
      x.font = '700 20px Arial, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      x.fillText(c, w * 0.08, y);
      x.fillRect(w * 0.08, y + 8, w * 0.84, 2);
    });
    // Écriture au crayon-feutre, illisible exprès (gribouillis).
    x.strokeStyle = 'rgba(30,40,90,0.85)'; x.lineWidth = 2.2;
    const r = (s) => { let a = s; return () => ((a = (a * 16807) % 2147483647) / 2147483647); };
    const rd = r(7);
    champs.forEach((_, i) => {
      const y = h * (0.36 + i * 0.13) - 4;
      x.beginPath(); x.moveTo(w * 0.32, y);
      for (let k = 0; k < 14; k++) x.lineTo(w * (0.32 + k * 0.04), y - 8 + rd() * 14);
      x.stroke();
    });
    x.fillStyle = '#c8161c'; x.fillRect(0, h * 0.9, w, h * 0.1);
  }, { sale: 0.6, seed: 52 });
  const pl = plaque(rectArrondi(CARTE.w, CARTE.h, 0.15 * IN), CARTE.t, m, [{ x: 0, y: CARTE.h / 2 - 0.4 * IN, r: 0.12 * IN }]);
  g.add(pl);
  // Œillet de laiton et attache de fil (attache autobloquante noire) jusqu'au ruban.
  const laiton = uni('Laiton_Oeillet', { color: 0xb8964e, metalness: 1, roughness: 0.4 });
  const oe = new THREE.Mesh(new THREE.TorusGeometry(0.17 * IN, 0.05 * IN, 8, 20), laiton);
  oe.position.set(0, CARTE.h / 2 - 0.4 * IN, 0);
  g.add(oe);
  const at = uni('Attache_Noire', { color: 0x1d1e20, roughness: 0.6 });
  g.add(tige([[0, CARTE.h / 2 - 0.4 * IN, 0.003], [0.004, CARTE.h / 2 + 0.3 * IN, 0.004], [0, CARTE.h / 2 + 0.9 * IN, 0], [-0.004, CARTE.h / 2 + 0.3 * IN, -0.004], [0, CARTE.h / 2 - 0.4 * IN, -0.003]], 0.0012, at, { closed: true, radial: 6 }));
  return g;
}

// ------------------------------------------------------------------ affiches

/** Bandeau d'en-tête façon ANSI : ovale rouge « DANGER » sur noir, ou « ATTENTION » noir sur jaune. */
function entete(x, w, h, genre) {
  const hb = h * 0.2;
  if (genre === 'danger') {
    x.fillStyle = '#111'; x.fillRect(w * 0.04, h * 0.03, w * 0.92, hb);
    x.fillStyle = '#d0121b';
    x.beginPath(); x.ellipse(w / 2, h * 0.03 + hb / 2, w * 0.4, hb * 0.38, 0, 0, 7); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = w * 0.008;
    x.beginPath(); x.ellipse(w / 2, h * 0.03 + hb / 2, w * 0.41, hb * 0.41, 0, 0, 7); x.stroke();
    texte(x, 'DANGER', w / 2, h * 0.03 + hb / 2 + 2, w * 0.66, hb * 0.52, { couleur: '#fff' });
  } else {
    x.fillStyle = '#f3c614'; x.fillRect(w * 0.04, h * 0.03, w * 0.92, hb);
    texte(x, 'ATTENTION', w / 2, h * 0.03 + hb / 2 + 2, w * 0.84, hb * 0.55, { couleur: '#111' });
  }
}

export const TEXTES = {
  'acces-interdit': { genre: 'danger', lignes: ['ACCÈS', 'INTERDIT'], petit: 'Personnel autorisé seulement', couleur: '#c8121b' },
  'forage-en-cours': { genre: 'attention', lignes: ['FORAGE', 'EN COURS'], petit: 'Avisez le foreur avant d’entrer', couleur: '#111' },
  'forage-distance': { genre: 'danger', lignes: ['FORAGE', 'À DISTANCE'], petit: 'Foreuse en marche sans opérateur', couleur: '#c8121b' },
};

/** Affiche d'aluminium 12 × 18 po, coins arrondis, quatre trous. Origine au centre, face vers +Z. */
export function affiche(id, seed = 0) {
  const d = TEXTES[id];
  const g = new THREE.Group();
  const face = imprime(`Affiche_${id}`, 0xf2f0ea, [512, 768], (x, w, h) => {
    x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#111'; x.lineWidth = w * 0.012;
    x.strokeRect(w * 0.025, h * 0.017, w * 0.95, h * 0.966);
    entete(x, w, h, d.genre);
    d.lignes.forEach((l, i) => texte(x, l, w / 2, h * (0.4 + i * 0.17), w * 0.86, h * 0.15, { couleur: d.couleur }));
    texte(x, d.petit, w / 2, h * 0.82, w * 0.84, h * 0.045, { poids: 700, couleur: '#222', police: 'Arial, Helvetica, sans-serif' });
  }, { sale: 0.55, seed: 60 + seed });
  const dos = uni('Alu_Affiche_Dos', { color: 0xa9adb0, metalness: 0.9, roughness: 0.45 });
  const { w, h, t, r, trou, marge } = AFFICHE;
  const trous = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({ x: a * (w / 2 - marge), y: b * (h / 2 - marge), r: trou }));
  const pl = plaque(rectArrondi(w, h, r), t, [face, dos], trous);
  // Groupes : faces avant (normale +Z) avec l'impression, le reste en aluminium.
  const geo = pl.geometry;
  geo.clearGroups();
  const nrm = geo.attributes.normal, idx = geo.index;
  const tri = idx ? idx.count / 3 : geo.attributes.position.count / 3;
  const avant = [], reste = [];
  for (let i = 0; i < tri; i++) {
    const a = idx ? idx.getX(i * 3) : i * 3;
    (nrm.getZ(a) > 0.9 ? avant : reste).push(i);
  }
  const ordre = [...avant, ...reste], ni = [];
  for (const i of ordre) for (let k = 0; k < 3; k++) ni.push(idx ? idx.getX(i * 3 + k) : i * 3 + k);
  geo.setIndex(ni);
  geo.addGroup(0, avant.length * 3, 0);
  geo.addGroup(avant.length * 3, reste.length * 3, 1);
  // Légère courbure d'une tôle mince qui a vécu : coin du bas plié vers l'avant.
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    const cx = seed % 2 ? w / 2 : -w / 2;
    const k = Math.max(0, 1 - Math.hypot(px - cx, py + h / 2) / 0.09);
    pos.setZ(i, pos.getZ(i) + 0.012 * k * k + 0.0015 * Math.sin(px * 18 + seed) * Math.cos(py * 9));
  }
  geo.computeVertexNormals();
  g.add(pl);
  return g;
}

/** Attache autobloquante noire passée dans un trou d'affiche et autour du ruban (boucle ovale). */
export function attache(pos, h = 0.05) {
  const [x, y, z] = pos;
  const pts = [[x, y, z + 0.003], [x + 0.003, y + h * 0.5, z + 0.006], [x, y + h, z], [x - 0.003, y + h * 0.5, z - 0.006], [x, y, z - 0.003]];
  return tige(pts, 0.0012, uni('Attache_Noire', { color: 0x1d1e20, roughness: 0.6 }), { closed: true, radial: 6 });
}

export { plastiqueSale };
