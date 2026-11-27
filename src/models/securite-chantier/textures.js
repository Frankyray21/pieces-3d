// Textures procédurales d'usure du lot de sécurité : peinture écaillée sur acier
// rouillé, rouille franche, plastique sali de boue, sangle tissée, affiches.
//
// Tout est dessiné sur des canevas (navigateur seulement) : couleur, rugosité et
// relief (carte de normales calculée depuis une carte de hauteur). Les textures
// suivent le matériau à l'export glTF (scripts/export-securite-unreal.mjs) : le
// rendu usé passe tel quel dans Unreal. Hors navigateur (contrôles dans Node),
// les matériaux gardent leur couleur unie.
import * as THREE from 'three';

const ENV = typeof document !== 'undefined';
const cache = new Map();

// ------------------------------------------------------------------ bruit

/** Générateur pseudo-aléatoire reproductible (mulberry32). */
export function alea(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bruit de valeur périodique (période p cellules), lissé. */
function bruit(seed, p) {
  const r = alea(seed), g = new Float32Array(p * p);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const s = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = s(x - xi), fy = s(y - yi);
    const x0 = ((xi % p) + p) % p, y0 = ((yi % p) + p) % p, x1 = (x0 + 1) % p, y1 = (y0 + 1) % p;
    const a = g[y0 * p + x0], b = g[y0 * p + x1], c = g[y1 * p + x0], d = g[y1 * p + x1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** Bruit fractal raccordable (u, v dans [0, 1)), valeur dans [0, 1]. */
function fbm(seed, base = 4, oct = 5) {
  const n = Array.from({ length: oct }, (_, i) => bruit(seed + i * 101, base << i));
  return (u, v) => {
    let s = 0, amp = 0.5, tot = 0;
    for (let i = 0; i < oct; i++) {
      const f = base << i;
      s += amp * n[i](u * f, v * f);
      tot += amp;
      amp *= 0.5;
    }
    return s / tot;
  };
}

const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hex = (c) => { const v = new THREE.Color(c); return [v.r * 255, v.g * 255, v.b * 255].map((x) => Math.round(Math.pow(x / 255, 1 / 2.2) * 255)); };
const melange = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ------------------------------------------------------------------ canevas → textures

function canevas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function texture(c, srgb, repeat) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  // Export glTF : images en JPEG (bien plus légères que le PNG pour du bruit).
  t.userData.mimeType = 'image/jpeg';
  return t;
}

/** Carte de normales (convention OpenGL, comme glTF) depuis une carte de hauteur. */
function normales(hauteur, w, h, force) {
  const c = canevas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h);
  const H = (i, j) => hauteur[((j + h) % h) * w + ((i + w) % w)];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (H(i + 1, j) - H(i - 1, j)) * force, dy = (H(i, j + 1) - H(i, j - 1)) * force;
    const l = Math.hypot(dx, dy, 1), k = (j * w + i) * 4;
    img.data[k] = (-dx / l * 0.5 + 0.5) * 255;
    img.data[k + 1] = (dy / l * 0.5 + 0.5) * 255;
    img.data[k + 2] = (1 / l * 0.5 + 0.5) * 255;
    img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

/**
 * Remplit couleur, rugosité et hauteur pixel par pixel : fn(u, v) → { c: [r, g, b], r: 0..1, h: 0..1 }.
 * Retourne { map, roughnessMap, normalMap } (textures three.js).
 */
function peindre(nom, taille, fn, { relief = 3, repeat } = {}) {
  const [w, h] = Array.isArray(taille) ? taille : [taille, taille];
  const cc = canevas(w, h), cr = canevas(w, h);
  const ic = cc.getContext('2d').createImageData(w, h), ir = cr.getContext('2d').createImageData(w, h);
  const haut = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const p = fn(i / w, j / h), k = (j * w + i) * 4;
    ic.data[k] = p.c[0]; ic.data[k + 1] = p.c[1]; ic.data[k + 2] = p.c[2]; ic.data[k + 3] = 255;
    // glTF : rugosité dans le canal vert (le bleu porte le métal, laissé à 255 : le facteur décide).
    const rg = Math.round(Math.min(1, Math.max(0, p.r)) * 255);
    ir.data[k] = 255; ir.data[k + 1] = rg; ir.data[k + 2] = Math.round((p.m ?? 1) * 255); ir.data[k + 3] = 255;
    haut[j * w + i] = p.h;
  }
  cc.getContext('2d').putImageData(ic, 0, 0);
  cr.getContext('2d').putImageData(ir, 0, 0);
  const out = { map: texture(cc, true, repeat), roughnessMap: texture(cr, false, repeat), normalMap: texture(normales(haut, w, h, relief), false, repeat) };
  for (const [k, t] of Object.entries(out)) t.name = `T_${nom}_${k}`;
  return out;
}

// ------------------------------------------------------------------ matériaux

/** Matériau texturé mis en cache ; hors navigateur : couleur unie. */
function materiau(nom, params, cartes) {
  if (cache.has(nom)) return cache.get(nom);
  const tex = ENV && cartes ? cartes() : null;
  const m = new THREE.MeshStandardMaterial({ ...params, ...(tex || {}) });
  if (tex) {
    // Les cartes portent la couleur : facteur blanc ; la rugosité de la carte est multipliée par 1.
    m.color.set(0xffffff);
    m.roughness = 1;
    if (tex.normalMap) m.normalScale.set(1, 1);
    // Le métal vient du canal bleu de la carte de rugosité (même image, comme en glTF).
    if (params.metalness > 0) { m.metalnessMap = tex.roughnessMap; m.metalness = 1; }
  }
  m.polygonOffset = true;
  m.polygonOffsetFactor = 1;
  m.polygonOffsetUnits = 1;
  m.name = nom;
  cache.set(nom, m);
  return m;
}

/**
 * Acier peint usé : la peinture (couleur) s'écaille par plaques, l'acier rouillé
 * apparaît dessous, coulures de rouille et salissures de boue grise.
 * usure : 0 (presque neuf) à 1 (peinture presque partie).
 */
export function peintureUsee(nom, couleur, { usure = 0.4, boue = 0.3, seed = 1, taille = 512, repeat, larme = 0, echelle = 4 } = {}) {
  return materiau(`M_${nom}`, { color: couleur, roughness: 0.6, metalness: 0.3 }, () => {
    const C = hex(couleur), ROUILLE = [118, 62, 34], ROUILLE2 = [74, 40, 24], ACIER = [92, 88, 84], BOUE = [96, 94, 90];
    const ecaille = fbm(seed, echelle, 6), grain = fbm(seed + 7, 32, 3), tache = fbm(seed + 13, Math.max(3, echelle - 1), 5), coul = fbm(seed + 21, 2, 4);
    const seuil = 0.68 - usure * 0.3;
    return peindre(nom, taille, (u, v) => {
      const e = ecaille(u, v), g = grain(u, v);
      // Coulures verticales : bruit étiré en v.
      const cl = coul(u * 6, v * 0.5);
      const nu = lisse(seuil - 0.02, seuil + 0.02, e + cl * 0.08); // 1 : acier nu
      const rouille = melange(ROUILLE, ROUILLE2, lisse(0.3, 0.7, g));
      const nuC = melange(ACIER, rouille, lisse(0.35, 0.6, tache(u, v)) * 0.8 + 0.2);
      let c = melange(C.map((x) => x * (0.86 + g * 0.22)), nuC, nu);
      // Halo de rouille sous la peinture au bord des écailles.
      const bord = lisse(seuil - 0.08, seuil - 0.02, e) * (1 - nu);
      c = melange(c, ROUILLE, bord * 0.45);
      const b = lisse(0.55 - boue * 0.25, 0.85, tache(u + 0.3, v * 0.7 + 0.2)) * boue * 1.6;
      // Tôle larmée : larmes en losange, orientées à ±45° une case sur deux ; le dessus des larmes est frotté.
      let lr = 0;
      if (larme) {
        const X = u * larme, Y = v * larme, ci = Math.floor(X), cj = Math.floor(Y);
        const fx = X - ci - 0.5, fy = Y - cj - 0.5, s = (ci + cj) % 2 ? 1 : -1;
        const a = (fx + s * fy) * Math.SQRT1_2, bb = (fx - s * fy) * Math.SQRT1_2;
        lr = lisse(1, 0.7, Math.hypot(a / 0.36, bb / 0.09));
        c = melange(c, melange(ACIER, [150, 146, 140], 0.5), lr * lisse(0.45, 0.7, tache(u * 3, v * 3)) * 0.8);
      }
      c = melange(c, BOUE, Math.min(0.85, b * (1 - lr * 0.5)));
      return { c, r: 0.48 + nu * 0.4 + b * 0.25 + g * 0.08 - lr * 0.15, m: nu * 0.6, h: (1 - nu) * 0.6 + g * 0.25 + b * 0.15 + lr * 2.2 };
    }, { relief: 2.5, repeat });
  });
}

/** Acier franchement rouillé (couvercle de trou) : rouille feuilletée, piqûres, restes de peinture. */
export function rouille(nom, { peinture = 0xa3241c, reste = 0.25, seed = 3, taille = 1024 } = {}) {
  return materiau(`M_${nom}`, { color: 0x6e3f26, roughness: 0.85, metalness: 0.2 }, () => {
    const P = hex(peinture), R1 = [126, 66, 32], R2 = [78, 42, 26], R3 = [150, 92, 50], ACIER = [80, 76, 72], BOUE = [88, 86, 82];
    const a = fbm(seed, 4, 6), b = fbm(seed + 5, 16, 4), pq = fbm(seed + 9, 64, 2), r = fbm(seed + 17, 3, 5);
    return peindre(nom, taille, (u, v) => {
      const x = a(u, v), y = b(u, v), z = pq(u, v);
      let c = melange(R2, R1, lisse(0.3, 0.7, y));
      c = melange(c, R3, lisse(0.62, 0.8, x) * 0.6);
      // Lustre d'acier aux endroits frottés (pas de pied).
      const frotte = lisse(0.7, 0.85, r(u, v));
      c = melange(c, ACIER, frotte * 0.7);
      // Restes de peinture rouge.
      const p = lisse(1 - reste - 0.02, 1 - reste + 0.02, a(u + 0.5, v + 0.5)) * (1 - frotte);
      c = melange(c, P.map((k) => k * (0.75 + y * 0.3)), p);
      const bo = lisse(0.6, 0.85, r(u + 0.4, v + 0.1));
      c = melange(c, BOUE, bo * 0.6);
      const piq = lisse(0.68, 0.74, z);
      return { c: c.map((k) => k * (1 - piq * 0.4)), r: 0.82 - frotte * 0.35 - p * 0.25, m: frotte * 0.8, h: y * 0.5 + x * 0.4 - piq * 0.5 + p * 0.2 };
    }, { relief: 4 });
  });
}

/** Plastique ou caoutchouc teint, sali de boue au bas (v = 0 en bas sur les objets tournés). */
export function plastiqueSale(nom, couleur, { boue = 0.5, rayures = 0.4, seed = 5, taille = 512, rough = 0.55, repeat } = {}) {
  return materiau(`M_${nom}`, { color: couleur, roughness: rough, metalness: 0 }, () => {
    const C = hex(couleur), BOUE = [92, 90, 86], BOUE2 = [62, 60, 57];
    const t = fbm(seed, 4, 5), g = fbm(seed + 3, 48, 2), ray = bruit(seed + 11, 256);
    return peindre(nom, taille, (u, v) => {
      const n = t(u, v), gr = g(u, v);
      let c = C.map((k) => k * (0.9 + gr * 0.16));
      // Rayures fines : lignes obliques clairsemées.
      const rr = ray(u * 512 + v * 120, v * 6) > 0.985 - rayures * 0.01 ? 1 : 0;
      c = melange(c, [210, 205, 200], rr * 0.35 * rayures);
      // Boue : plus forte vers le bas (v petit), bords déchiquetés.
      const bas = lisse(0.45, 0.05, v + (n - 0.5) * 0.35);
      const bo = Math.min(1, bas * boue * 1.5 + lisse(0.7, 0.9, n) * boue * 0.5);
      c = melange(c, melange(BOUE, BOUE2, gr), bo * 0.9);
      return { c, r: rough + bo * 0.35 + gr * 0.05, m: 0, h: gr * 0.3 + bo * 0.5 };
    }, { relief: 1.6, repeat });
  });
}

/** Sangle de polyester tissée (sergé), teinte, poussiéreuse. u le long de la sangle, v en travers. */
export function sangle(nom, couleur, { seed = 8, sale = 0.4, rayure = null } = {}) {
  return materiau(`M_${nom}`, { color: couleur, roughness: 0.85, metalness: 0 }, () => {
    const C = hex(couleur), BOUE = [104, 100, 92], R = rayure ? hex(rayure) : null;
    const t = fbm(seed, 2, 5), g = fbm(seed + 4, 32, 2);
    return peindre(nom, [256, 128], (u, v) => {
      // Sergé : fils en diagonale, 32 passes.
      const fil = 0.5 + 0.5 * Math.sin((u * 64 + v * 16) * Math.PI * 2);
      const trame = 0.5 + 0.5 * Math.sin(v * 48 * Math.PI * 2);
      let c = C.map((k) => k * (0.78 + fil * 0.18 + trame * 0.06));
      if (R && Math.abs(v - 0.5) < 0.09) c = R.map((k) => k * (0.8 + fil * 0.2));
      // Bords plus usés (lisière) et poussière.
      const lis = lisse(0.06, 0, Math.min(v, 1 - v));
      const s = lisse(0.45, 0.85, t(u, v)) * sale;
      c = melange(c, BOUE, Math.min(0.75, s + lis * 0.3) + g(u, v) * 0.08 * sale);
      return { c, r: 0.82 + s * 0.1, m: 0, h: fil * 0.6 + trame * 0.3 };
    }, { relief: 2.2, repeat: [1, 1] });
  });
}

/**
 * Affiche ou autocollant imprimé : dessin(ctx, w, h) puis salissures (poussière,
 * éclaboussures de boue, éraflures) par-dessus. fond : couleur unie hors navigateur.
 */
export function imprime(nom, fond, [w, h], dessin, { sale = 0.4, seed = 12, rough = 0.5 } = {}) {
  return materiau(`M_${nom}`, { color: fond, roughness: rough, metalness: 0 }, () => {
    const c = canevas(w, h), x = c.getContext('2d');
    dessin(x, w, h);
    // Usure par-dessus l'impression.
    const r = alea(seed), img = x.getImageData(0, 0, w, h), d = img.data;
    const t = fbm(seed, 3, 5), g = fbm(seed + 2, 64, 2);
    const haut = new Float32Array(w * h), cr = canevas(w, h), ir = cr.getContext('2d').createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = i / w, v = j / h, k = (j * w + i) * 4;
      const p = lisse(0.5, 0.9, t(u, v)) * sale + lisse(0.35, 0, Math.min(u, 1 - u, v, 1 - v)) * sale * 0.6;
      const gr = g(u, v);
      const a = Math.min(0.75, p * 0.8 + gr * 0.05);
      d[k] = d[k] + (98 - d[k]) * a; d[k + 1] = d[k + 1] + (95 - d[k + 1]) * a; d[k + 2] = d[k + 2] + (90 - d[k + 2]) * a;
      const rg = Math.round(Math.min(1, rough + p * 0.4) * 255);
      ir.data[k] = 255; ir.data[k + 1] = rg; ir.data[k + 2] = 0; ir.data[k + 3] = 255;
      haut[j * w + i] = gr * 0.3 + p * 0.3;
    }
    x.putImageData(img, 0, 0);
    // Éclaboussures de boue : gouttes sombres.
    for (let n = 0; n < 60 * sale; n++) {
      const cx = r() * w, cy = h * (0.55 + r() * 0.45), rad = (0.002 + r() * r() * 0.012) * w;
      x.fillStyle = `rgba(70,68,64,${0.35 + r() * 0.5})`;
      x.beginPath(); x.ellipse(cx, cy, rad, rad * (0.6 + r() * 0.6), r() * 3, 0, 7); x.fill();
    }
    // Éraflures : traits clairs fins.
    x.strokeStyle = 'rgba(235,235,230,0.45)';
    for (let n = 0; n < 14 * sale; n++) {
      const x0 = r() * w, y0 = r() * h, l = (0.03 + r() * 0.12) * w, a = r() * Math.PI;
      x.lineWidth = 0.6 + r() * 1.2;
      x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); x.stroke();
    }
    cr.getContext('2d').putImageData(ir, 0, 0);
    const out = { map: texture(c, true), roughnessMap: texture(cr, false), normalMap: texture(normales(haut, w, h, 1.2), false) };
    for (const [k, tx] of Object.entries(out)) { tx.name = `T_${nom}_${k}`; tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; }
    return out;
  });
}

/** Matériau uni, non texturé, mis en cache (métal nu, plastique noir…). */
export function uni(nom, params) {
  return materiau(`M_${nom}`, { roughness: 0.5, metalness: 0, ...params }, null);
}

/** Texte centré qui tient dans la largeur maxW (police réduite au besoin). */
export function texte(x, s, cx, cy, maxW, taille, { poids = 900, couleur = '#111', police = '"Arial Black", Arial, Helvetica, sans-serif' } = {}) {
  let t = taille;
  x.font = `${poids} ${t}px ${police}`;
  while (x.measureText(s).width > maxW && t > 8) { t -= 2; x.font = `${poids} ${t}px ${police}`; }
  x.fillStyle = couleur;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(s, cx, cy);
}
