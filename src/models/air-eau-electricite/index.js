// Lot air, eau et électricité d'une place de travail ITH Cubex (simulateur SST) : boyaux d'air de 2 po basse
// et haute pression, boyau tressé inox 800 °F, boyau d'eau de 1 po, raccords à joint sphérique (tige, écrou à
// oreilles « stem nut », embout mâle), whip checks, câble 600 V sur crochets au mur, boîte de défaut à la terre
// (ground fault box), console électrique 600 V, arrêt d'urgence, crochets de plastique, bidons et trépieds avec
// banderole DANGER.
//
// Aucun plan : formes et cotes d'après les photos de places de travail du client (console 600 V, boyaux au sol)
// et les grandeurs usuelles de ces articles (diamètres nominaux des boyaux et des raccords). Rendu usé et sale :
// textures dessinées par tools/air_eau_elec_textures.mjs (boue, coulures, éclats, inscriptions), chargées dans le
// navigateur ; dans Node (contrôles, export), couleurs unies du même nom.
//
// Repère : mètres, y vers le haut, sol à y = 0 ; pour l'électricité, le mur est le plan z = 0 (pièces à z > 0).
import * as THREE from 'three';

export const IN = 0.0254;
const V = (a) => (a.isVector3 ? a.clone() : new THREE.Vector3(...a));

// ------------------------------------------------------------------ cotes (m)

/** Boyaux : diamètre intérieur nominal et extérieur (usuels pour ces boyaux de mine). */
export const BOYAU = {
  airBP: { di: 2 * IN, de: 2.84 * IN },
  airHP: { di: 2 * IN, de: 3.0 * IN },
  tresse: { di: 2 * IN, de: 2.6 * IN },
  eau: { di: 1 * IN, de: 1.5 * IN },
};
/** Raccord à joint sphérique (« ground joint ») : rayons pour un boyau de 2 po ; le 1 po est à l'échelle 0,6. */
export const RACCORD = { collet: 0.040, ecrou: 0.047, ecrouL: 0.055, oreille: 0.036, embout: 0.038, collier: 0.014 };
/** Whip check : câble d'acier, boucles à ressort, longueur entre boucles (pour 2 po). */
export const WHIP = { cable: 0.0048, entre: 0.62, ressort: 0.09 };
/** Câble minier 600 V : diamètre, hauteur des crochets, entraxe, flèche entre crochets. */
export const CABLE = { d: 0.048, hautCrochet: 2.1, flèche: 0.14 };
/** Console électrique 600 V : armoire rouge, boîtier inox à porte vitrée. */
export const CONSOLE = { L: 1.3, H: 1.75, P: 0.65, inoxL: 0.56, inoxH: 1.05, inoxP: 0.24 };
/** Boîte de défaut à la terre. */
export const GFB = { L: 0.40, H: 0.50, P: 0.22, y: 1.05 };
/** Trépied de balisage et bidon de 20 L. */
export const TREPIED = { H: 1.1, pied: 0.45, tube: 0.0127 };
export const BIDON = { L: 0.30, H: 0.40, P: 0.18 };
export const BANDEROLE = { large: 0.075 };

// ------------------------------------------------------------------ matériaux

const TEX = 'equipment/air-eau-electricite/textures/';
/**
 * Matériaux : texture (couleur, normales), teinte de repli hors navigateur, rugosité, métal, répétition (m par
 * tuile). Exportés pour scripts/export-air-eau-elec-unreal.mjs.
 */
export const MATERIAUX = {
  'boyau-air-bp': { tex: 'boyau-air-bp', n: 1, teinte: 0xb59a3a, roughness: 0.78, metalness: 0 },
  'boyau-air-hp': { tex: 'boyau-air-hp', n: 1, teinte: 0x2c2b2a, roughness: 0.72, metalness: 0 },
  'boyau-eau': { tex: 'boyau-eau', n: 1, teinte: 0x2c2b2a, roughness: 0.72, metalness: 0 },
  'gaine-600v': { tex: 'gaine-600v', n: 1, teinte: 0x262624, roughness: 0.7, metalness: 0 },
  spirale: { tex: 'spirale', n: 1, teinte: 0x7d7d79, roughness: 0.6, metalness: 0 },
  'tresse-inox': { tex: 'tresse-inox', n: 1, teinte: 0x8e8e8a, roughness: 0.45, metalness: 0.9 },
  'cable-acier': { tex: 'cable-acier', n: 1, teinte: 0x8a8f93, roughness: 0.45, metalness: 0.85 },
  'inox-sale': { tex: 'inox-sale', n: 1, teinte: 0x8d8c86, roughness: 0.42, metalness: 0.85 },
  'rouge-peint': { tex: 'rouge-peint', n: 1, teinte: 0x8a2a22, roughness: 0.62, metalness: 0 },
  'gris-peint': { tex: 'gris-peint', n: 1, teinte: 0x7a7c7c, roughness: 0.6, metalness: 0 },
  'jaune-plastique': { tex: 'jaune-plastique', n: 1, teinte: 0xc0a03a, roughness: 0.55, metalness: 0 },
  'orange-peint': { tex: 'orange-peint', n: 1, teinte: 0xb85a2a, roughness: 0.6, metalness: 0 },
  'orange-plastique': { tex: 'orange-plastique', n: 1, teinte: 0xc2642a, roughness: 0.5, metalness: 0 },
  'acier-zingue': { tex: 'acier-zingue', n: 1, teinte: 0x7a7c79, roughness: 0.55, metalness: 0.75 },
  'rouge-bouton': { tex: 'rouge-bouton', n: 1, teinte: 0xa81a1a, roughness: 0.35, metalness: 0 },
  'noir-plastique': { teinte: 0x1d1d1e, roughness: 0.5, metalness: 0 },
  'fils-rouges': { teinte: 0x9c1e1a, roughness: 0.5, metalness: 0 },
  'fils-noirs': { teinte: 0x1e1e1f, roughness: 0.5, metalness: 0 },
  'fils-bleus': { teinte: 0x2a4ea0, roughness: 0.5, metalness: 0 },
  'fond-blanc': { teinte: 0xc9c8c2, roughness: 0.6, metalness: 0 },
  'cuivre-borne': { teinte: 0xb5915a, roughness: 0.4, metalness: 0.9 },
  'voyant-vert': { teinte: 0x2fbf4a, roughness: 0.3, metalness: 0, emissive: 0x1a8a2a },
  'voyant-rouge': { teinte: 0xc0201a, roughness: 0.3, metalness: 0 },
  vitre: { tex: 'vitre', teinte: 0xb8b8b0, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.42, uvFixe: 1 },
  banderole: { tex: 'banderole', teinte: 0xb5241f, roughness: 0.6, metalness: 0, double: true, uvFixe: 1 },
  'etiquette-danger-600v': { tex: 'danger-600v', teinte: 0xe0dcd4, roughness: 0.5, metalness: 0, uvFixe: 1 },
  'etiquette-danger-transfo': { tex: 'danger-transfo', teinte: 0xd8b830, roughness: 0.7, metalness: 0, uvFixe: 1 },
  'etiquette-gfb': { tex: 'gfb', teinte: 0xe0d8b0, roughness: 0.6, metalness: 0, uvFixe: 1 },
  'etiquette-estop': { tex: 'estop', teinte: 0xd8b020, roughness: 0.5, metalness: 0, uvFixe: 1 },
  'etiquette-contacteur': { tex: 'contacteur', teinte: 0xcfcfca, roughness: 0.5, metalness: 0, uvFixe: 1 },
  'etiquette-cb1': { tex: 'cb1', teinte: 0xf0f0f0, roughness: 0.5, metalness: 0, uvFixe: 1 },
};

const NAVIGATEUR = typeof document !== 'undefined';
const CACHE = new Map();
const redessiner = () => window.dispatchEvent(new Event('pieces3d:redessiner'));
let chargeur = null;
function texture(nom, srgb, repete) {
  const cle = `${nom}|${srgb}|${repete}`;
  if (CACHE.has(cle)) return CACHE.get(cle);
  chargeur ||= new THREE.TextureLoader();
  const base = (import.meta.env && import.meta.env.BASE_URL) || './';
  const t = chargeur.load(`${base}${TEX}${nom}.jpg`, redessiner);
  t.flipY = false; // UV du glTF : v = 0 en haut de l'image
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repete) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  CACHE.set(cle, t);
  return t;
}

/** Matériau du lot, partagé, nommé M_AEE_<nom>. */
export function M(nom) {
  const cle = `mat:${nom}`;
  if (CACHE.has(cle)) return CACHE.get(cle);
  const d = MATERIAUX[nom];
  if (!d) throw new Error(`Matériau inconnu : ${nom}`);
  const p = { color: d.teinte, roughness: d.roughness, metalness: d.metalness };
  if (d.emissive) { p.emissive = d.emissive; p.emissiveIntensity = 0.8; }
  if (d.transparent) { p.transparent = true; p.opacity = d.opacity; p.depthWrite = false; }
  if (d.double || d.transparent) p.side = THREE.DoubleSide;
  if (NAVIGATEUR && d.tex) {
    p.color = 0xffffff;
    p.map = texture(d.tex, true, !d.uvFixe);
    if (d.n) { p.normalMap = texture(`${d.tex}-n`, false, true); p.normalScale = new THREE.Vector2(1, -1); }
  }
  const m = new THREE.MeshStandardMaterial(p);
  m.name = `M_AEE_${nom}`;
  m.userData.aee = nom;
  m.polygonOffset = true;
  m.polygonOffsetFactor = 1;
  m.polygonOffsetUnits = 1;
  CACHE.set(cle, m);
  return m;
}

// ------------------------------------------------------------------ UV

/**
 * UV projetées en boîte (axe dominant de la normale), en mètres / tuile : la texture garde la même échelle sur
 * toutes les faces, sans étirement. Les maillages à UV propres (boyaux, étiquettes) sont marqués userData.uvFixe.
 */
export function projeter(racine, tuile = 1) {
  racine.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(racine.matrixWorld).invert();
  const p = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
  racine.traverse((o) => {
    if (!o.isMesh || o.userData.uvFixe || MATERIAUX[o.material?.userData?.aee]?.uvFixe) return;
    let g = o.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    g = o.geometry = g.clone(); // géométries partagées par la bibliothèque de formes
    const rel = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    nm.getNormalMatrix(rel);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(rel);
      n.fromBufferAttribute(nor, i).applyMatrix3(nm);
      const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      let u, v;
      if (ax >= ay && ax >= az) { u = p.z * Math.sign(n.x || 1); v = -p.y; } else if (ay >= az) { u = p.x; v = p.z; } else { u = -p.x * Math.sign(n.z || 1); v = -p.y; }
      uv[i * 2] = u / tuile; uv[i * 2 + 1] = v / tuile;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  return racine;
}

/** Plan d'étiquette (largeur w, hauteur h), face vers +z, UV du glTF (v = 0 en haut). */
function etiquette(nom, w, h) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  const m = new THREE.Mesh(g, M(nom));
  m.userData.uvFixe = true;
  return m;
}

// ------------------------------------------------------------------ formes de base

function boite(w, h, d, nom, pos = [0, 0, 0], r = 0) {
  let g;
  if (r > 0) {
    const s = new THREE.Shape(), x = w / 2 - r, y = h / 2 - r;
    s.moveTo(-x, -h / 2); s.lineTo(x, -h / 2); s.absarc(x, -y, r, -Math.PI / 2, 0); s.lineTo(w / 2, y); s.absarc(x, y, r, 0, Math.PI / 2);
    s.lineTo(-x, h / 2); s.absarc(-x, y, r, Math.PI / 2, Math.PI); s.lineTo(-w / 2, -y); s.absarc(-x, -y, r, Math.PI, 1.5 * Math.PI);
    g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * Math.min(r, d / 3) * 0.5, bevelEnabled: true, bevelThickness: Math.min(r, d / 3) * 0.5, bevelSize: Math.min(r, d / 3) * 0.5, bevelSegments: 3, curveSegments: 6 });
    g.center();
    g.computeVertexNormals();
  } else g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, M(nom));
  m.position.set(...pos);
  return m;
}
function cylindre(r, l, nom, { axe = 'y', pos = [0, 0, 0], seg = 32, r2 = r, ouvert = false } = {}) {
  const g = new THREE.CylinderGeometry(r2, r, l, seg, 1, ouvert);
  if (axe === 'x') g.rotateZ(-Math.PI / 2);
  if (axe === 'z') g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, M(nom));
  m.position.set(...pos);
  return m;
}
/** Tube le long d'une courbe, UV en mètres le long (u) et sur le tour (v). */
function tubeCourbe(courbe, r, nom, { tuile = 1, radial = 20, pas = null } = {}) {
  const L = courbe.getLength();
  const n = Math.max(8, Math.min(600, Math.round(L / (pas || Math.max(r * 1.2, 0.012)))));
  const g = new THREE.TubeGeometry(courbe, n, r, radial, false);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * L) / tuile);
  const m = new THREE.Mesh(g, M(nom));
  m.userData.uvFixe = true;
  return m;
}
function courbe(points, tension = 0.5) {
  return new THREE.CatmullRomCurve3(points.map(V), false, 'centripetal', tension);
}
/** Tore autour de l'axe donné. */
function tore(R, r, nom, axe = new THREE.Vector3(1, 0, 0), pos = [0, 0, 0]) {
  const g = new THREE.TorusGeometry(R, r, 10, 32);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), axe.clone().normalize()));
  const m = new THREE.Mesh(g, M(nom));
  m.position.set(...(Array.isArray(pos) ? pos : pos.toArray()));
  return m;
}
/** Oriente un groupe : son axe local +X suit la direction donnée (horizontale de préférence). */
function orienter(obj, dir, pos) {
  const d = V(dir).normalize();
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d);
  obj.position.copy(V(pos));
  return obj;
}

// ------------------------------------------------------------------ raccords à joint sphérique

/**
 * Bout de boyau : tige (collet) et collier de serrage à deux boulons, dans le repère du bout (x sortant du boyau,
 * x = 0 au bout du boyau). k : échelle (1 pour 2 po, 0,6 pour 1 po). rBoyau : rayon extérieur du boyau.
 */
function tige(k, rBoyau) {
  const g = new THREE.Group(), R = RACCORD;
  // Collet de la tige (six pans arrondis) et nez.
  const collet = cylindre(R.collet * k, 0.026 * k, 'acier-zingue', { axe: 'x', pos: [0.013 * k, 0, 0], seg: 6 });
  collet.rotation.x = Math.PI / 6;
  g.add(collet);
  g.add(cylindre(rBoyau * 0.92, 0.012 * k, 'acier-zingue', { axe: 'x', pos: [-0.004 * k, 0, 0] }));
  // Collier : deux demi-coquilles, oreilles et boulons de chaque côté.
  const rc = rBoyau + 0.004 * k, L = 0.042 * k, xc = -0.035 * k;
  const coq = new THREE.CylinderGeometry(rc, rc, L, 28, 1, true);
  coq.rotateZ(-Math.PI / 2);
  const c = new THREE.Mesh(coq, M('acier-zingue'));
  c.position.x = xc;
  g.add(c);
  for (const s of [-1, 1]) g.add(tore(rc, 0.0035 * k, 'acier-zingue', new THREE.Vector3(1, 0, 0), [xc + (s * L) / 2, 0, 0]));
  for (const s of [-1, 1]) {
    g.add(boite(L * 0.8, 0.012 * k, 0.03 * k, 'acier-zingue', [xc, 0, s * (rc + 0.012 * k)]));
    const b = cylindre(0.005 * k, 0.05 * k, 'acier-zingue', { pos: [xc, 0, s * (rc + 0.014 * k)] });
    g.add(b);
    for (const t of [-1, 1]) {
      const e = cylindre(0.0085 * k, 0.008 * k, 'acier-zingue', { pos: [xc, t * 0.012 * k, s * (rc + 0.014 * k)], seg: 6 });
      g.add(e);
    }
  }
  return g;
}
/** Écrou à oreilles (« stem nut »), femelle, sur le collet : 3 oreilles. Même repère que la tige. */
function ecrou(k) {
  const g = new THREE.Group(), R = RACCORD;
  const x0 = 0.018 * k, L = R.ecrouL * k;
  g.add(cylindre(R.ecrou * k, L, 'acier-zingue', { axe: 'x', pos: [x0 + L / 2, 0, 0], seg: 36 }));
  g.add(cylindre(R.ecrou * k * 0.92, 0.006 * k, 'acier-zingue', { axe: 'x', pos: [x0 + L + 0.002 * k, 0, 0], seg: 36 }));
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + 0.3;
    const o = boite(L * 0.82, R.oreille * k, 0.014 * k, 'acier-zingue', [x0 + L / 2, Math.cos(a) * (R.ecrou + R.oreille / 2 - 0.004) * k, Math.sin(a) * (R.ecrou + R.oreille / 2 - 0.004) * k], 0.004 * k);
    o.rotation.x = -a;
    g.add(o);
  }
  return g;
}
/** Embout mâle (« spud ») : collet et nez à portée sphérique, entre dans l'écrou d'en face. */
function embout(k) {
  const g = new THREE.Group(), R = RACCORD;
  g.add(cylindre(R.embout * k, 0.022 * k, 'acier-zingue', { axe: 'x', pos: [0.034 * k, 0, 0], seg: 6 }));
  const nez = new THREE.SphereGeometry(R.embout * k * 0.78, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  nez.rotateZ(-Math.PI / 2);
  const m = new THREE.Mesh(nez, M('acier-zingue'));
  m.position.x = 0.045 * k;
  g.add(m);
  return g;
}

// ------------------------------------------------------------------ boyaux

/**
 * Ligne de boyaux au sol : suite de tronçons reliés par des raccords. tracé : points [x, z] au sol ; joints :
 * indices des points où deux tronçons se raccordent. Retourne les tronçons (courbes) et les raccords (position,
 * direction) pour poser tiges, écrous, embouts et whip checks.
 */
function ligne(trace, joints, rBoyau, k) {
  const y = rBoyau, yJ = RACCORD.ecrou * k; // le boyau repose au sol ; au raccord, l'écrou le soulève
  const bouts = [0, ...joints, trace.length - 1];
  const troncons = [], raccords = [];
  const P = trace.map(([x, z]) => new THREE.Vector3(x, y, z));
  const dirEn = (i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    return new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
  };
  const demi = 0.05 * k; // demi-écart entre les bouts des deux boyaux au raccord (le nez de l'embout entre dans l'écrou)
  for (const j of joints) raccords.push({ p: new THREE.Vector3(P[j].x, yJ, P[j].z), d: dirEn(j) });
  for (let s = 0; s < bouts.length - 1; s++) {
    const i0 = bouts[s], i1 = bouts[s + 1];
    const pts = [];
    const d0 = dirEn(i0), d1 = dirEn(i1);
    const debutJ = s > 0, finJ = s < bouts.length - 2;
    // Départ : au bout du raccord (ou au bout libre), droit sur 0,15 m, puis redescend au sol.
    const a = P[i0].clone(); if (debutJ) { a.addScaledVector(d0, demi); a.y = yJ; }
    const aEnd = s === 0 ? P[i0].clone().setY(yJ) : a;
    pts.push(aEnd, aEnd.clone().addScaledVector(d0, 0.14).setY((yJ + y) / 2 + 0.004), aEnd.clone().addScaledVector(d0, 0.34).setY(y));
    for (let i = i0 + 1; i < i1; i++) pts.push(P[i]);
    const b = P[i1].clone(); if (finJ) { b.addScaledVector(d1, -demi); }
    b.y = yJ;
    pts.push(b.clone().addScaledVector(d1, -0.34).setY(y), b.clone().addScaledVector(d1, -0.14).setY((yJ + y) / 2 + 0.004), b);
    troncons.push({ courbe: courbe(pts, 0.5), debut: { p: aEnd, d: d0.clone().negate() }, fin: { p: b, d: d1.clone() } });
  }
  return { troncons, raccords };
}

/** Whip check posé sur un raccord : deux boucles à ressort autour des boyaux, câble par-dessus le raccord. */
function whipCheck(raccord, rBoyau, k) {
  const g = new THREE.Group(), { p, d } = raccord, W = WHIP;
  const rc = W.cable * Math.max(0.7, k);
  const y0 = rBoyau; // axe des boyaux près des boucles (presque au sol)
  const ecart = (W.entre * Math.max(0.6, k)) / 2;
  const ancres = [-1, 1].map((s) => new THREE.Vector3(p.x, y0 + 0.006, p.z).addScaledVector(d, s * ecart));
  for (const [i, a] of ancres.entries()) {
    const s = i ? 1 : -1;
    // Boucle serrée autour du boyau (légèrement ovale), ferrule d'aluminium et ressort sur la jambe.
    g.add(tore(rBoyau + rc + 0.001, rc, 'cable-acier', d, a));
    const sommet = a.clone().add(new THREE.Vector3(0, rBoyau + rc, 0));
    const fer = cylindre(rc * 2.2, 0.03 * Math.max(0.7, k), 'acier-zingue', { seg: 14 });
    orienter(fer, new THREE.Vector3(0, 1, 0), sommet.clone().addScaledVector(d, -s * 0.03).add(new THREE.Vector3(0, rc * 1.6, 0)));
    fer.rotation.set(0, 0, 0);
    fer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    g.add(fer);
    const res = new THREE.Group();
    const pts = [];
    const n = 9 * 18;
    for (let t = 0; t <= n; t++) { const an = (t / n) * 9 * Math.PI * 2; pts.push(new THREE.Vector3((t / n) * W.ressort * Math.max(0.7, k), Math.cos(an) * rc * 2.4, Math.sin(an) * rc * 2.4)); }
    const r = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, rc * 0.45, 6, false), M('acier-zingue'));
    r.userData.uvFixe = true;
    res.add(r);
    orienter(res, d.clone().multiplyScalar(-s), sommet.clone().addScaledVector(d, -s * 0.05).add(new THREE.Vector3(0, rc * 1.6, 0)));
    g.add(res);
  }
  // Câble : des boucles, par-dessus l'écrou à oreilles, un peu de mou.
  const hJ = p.y + (RACCORD.ecrou + RACCORD.oreille) * k + rc;
  const pts = [
    ancres[0].clone().add(new THREE.Vector3(0, rBoyau + rc * 2.4, 0)),
    ancres[0].clone().lerp(p, 0.45).setY(y0 + rBoyau + rc * 3),
    p.clone().addScaledVector(d, -0.07 * k).setY(hJ),
    p.clone().addScaledVector(d, 0.07 * k).setY(hJ),
    ancres[1].clone().lerp(p, 0.45).setY(y0 + rBoyau + rc * 3),
    ancres[1].clone().add(new THREE.Vector3(0, rBoyau + rc * 2.4, 0)),
  ];
  // Léger déport sur le côté (le câble ne passe jamais pile au milieu).
  const cote = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(0.012);
  pts.forEach((q, i) => { if (i > 0 && i < pts.length - 1) q.add(cote); });
  g.add(tubeCourbe(courbe(pts), rc, 'cable-acier', { tuile: 0.5, radial: 8 }));
  return g;
}

/**
 * Pose une ligne : tronçons de boyau (part refBoyau), et à chaque bout une tige (refTige) ; au premier bout de
 * chaque tronçon un écrou à oreilles (refEcrou), au dernier un embout mâle (refEmbout). Raccords : whip check
 * (refWhip) si demandé. rayons : rayon extérieur de chaque tronçon (sinon rBoyau).
 */
function poserLigne(api, L, { k, rBoyau, rayons = [], mats, refs, whip = true, decal = [0, 0, 0] }) {
  const ex = (v) => v.map((c, i) => c + decal[i]);
  L.troncons.forEach((t, i) => {
    const b = new THREE.Group().add(tubeCourbe(t.courbe, rayons[i] || rBoyau, mats[i] || mats[0], { tuile: 1, radial: 24 }));
    api.part(refs.boyau[i] || refs.boyau[0], b, ex([0, 0.12, 0]));
    for (const [bout, type] of [[t.debut, 'ecrou'], [t.fin, 'embout']]) {
      const ti = orienter(projeter(tige(k, rBoyau), 0.25), bout.d, bout.p);
      api.part(refs.tige, ti, ex([bout.d.x * 0.06, 0.05, bout.d.z * 0.06]));
      const e = orienter(projeter(type === 'ecrou' ? ecrou(k) : embout(k), 0.25), bout.d, bout.p);
      api.part(type === 'ecrou' ? refs.ecrou : refs.embout, e, ex([bout.d.x * 0.14, 0.05, bout.d.z * 0.14]));
    }
  });
  if (whip) for (const r of L.raccords) api.part(refs.whip, whipCheck(r, rBoyau, k), ex([0, 0.28, 0]));
}

// ------------------------------------------------------------------ P01 : air comprimé

/** Repère 1 à 8 : deux lignes d'air au sol, raccords à joint sphérique, whip checks. */
export function P01(api) {
  // Ligne A : boyau d'air basse pression jaune de 2 po, deux tronçons de 4 m.
  const rA = BOYAU.airBP.de / 2;
  const A = ligne([[-4.2, 0], [-3.4, 0.12], [-2.4, -0.1], [-1.2, 0.18], [-0.2, 0.05], [0.9, -0.12], [2.0, 0.1], [3.1, -0.05], [4.0, 0.08]], [4], rA, 1);
  poserLigne(api, A, { k: 1, rBoyau: rA, mats: ['boyau-air-bp'], refs: { boyau: ['1'], tige: '5', ecrou: '6', embout: '7', whip: '8' } });
  // Ligne B : boyau tressé inox 800 °F (sortie chaude) raccordé au boyau d'air haute pression de 2 po, gaine
  // spiralée sur le premier mètre du boyau haute pression.
  const rT = BOYAU.tresse.de / 2, rH = BOYAU.airHP.de / 2;
  const tr = [[-4.2, 0.9], [-3.5, 0.98], [-2.6, 0.92], [-1.7, 1.12], [-0.6, 1.0], [0.6, 1.22], [1.8, 1.05], [3.0, 1.18], [4.0, 1.0]];
  const B = ligne(tr, [2], rH, 1);
  // Premier tronçon : tressé (rayon un peu plus petit, même raccords).
  const t0 = B.troncons[0];
  t0.courbe = courbe(t0.courbe.points.map((q) => q.clone().setY(Math.abs(q.y - rH) < 1e-6 ? rT : q.y)));
  poserLigne(api, B, { k: 1, rBoyau: rH, rayons: [rT, rH], mats: ['tresse-inox', 'boyau-air-hp'], refs: { boyau: ['4', '2'], tige: '5', ecrou: '6', embout: '7', whip: '8' } });
  // Gaine spiralée : premier mètre du boyau haute pression, après le raccord.
  const t1 = B.troncons[1], Lc = t1.courbe.getLength(), pts = [];
  for (let q = 0; q <= 40; q++) pts.push(t1.courbe.getPointAt((0.2 + q / 40) / Lc));
  api.part('3', new THREE.Group().add(tubeCourbe(courbe(pts), rH * 1.17, 'spirale', { tuile: 1, radial: 24 })), [0, 0.2, 0]);
  return { view: { dir: [0.35, 0.55, 0.76] } };
}

// ------------------------------------------------------------------ P02 : eau

/** Boyau d'eau de 1 po : deux tronçons au sol, raccords à joint sphérique de 1 po, whip check. */
export function P02(api) {
  const r = BOYAU.eau.de / 2, k = 0.6;
  const L = ligne([[-3.5, 0], [-2.6, 0.2], [-1.6, -0.08], [-0.5, 0.15], [0.3, 0.02], [1.3, -0.15], [2.4, 0.12], [3.5, 0]], [4], r, k);
  poserLigne(api, L, { k, rBoyau: r, mats: ['boyau-eau'], refs: { boyau: ['1'], tige: '2', ecrou: '3', embout: '4', whip: '5' } });
  return { view: { dir: [0.35, 0.6, 0.72] } };
}

// ------------------------------------------------------------------ P03 : électricité

/** Crochet au mur : plaque, écrou du boulon d'ancrage, tige pliée en J (le câble repose sur le fond). */
function crochetMur(x, y) {
  const g = new THREE.Group();
  g.add(boite(0.15, 0.15, 0.008, 'acier-zingue', [0, 0, 0.004]));
  const n = cylindre(0.016, 0.022, 'acier-zingue', { axe: 'z', pos: [0, 0.035, 0.019], seg: 6 });
  g.add(n);
  g.add(cylindre(0.011, 0.05, 'acier-zingue', { axe: 'z', pos: [0, 0.035, 0.03] }));
  const pts = [[0, -0.03, 0.008], [0, -0.03, 0.06], [0, -0.03, 0.11], [0, -0.025, 0.125], [0, -0.005, 0.135], [0, 0.04, 0.14], [0, 0.07, 0.14]];
  g.add(tubeCourbe(courbe(pts, 0.3), 0.008, 'acier-zingue', { tuile: 0.25, radial: 12 }));
  g.position.set(x, y, 0);
  return projeter(g, 0.25);
}
/** Crochet de plastique jaune (câble de commande) : patte vissée et crochet en J. */
function crochetPlastique(x, y) {
  const s = new THREE.Shape();
  s.moveTo(-0.02, 0.05); s.lineTo(0.02, 0.05); s.lineTo(0.02, -0.005); s.quadraticCurveTo(0.02, -0.045, 0.055, -0.045);
  s.quadraticCurveTo(0.085, -0.045, 0.085, -0.015); s.lineTo(0.085, 0.0); s.lineTo(0.07, 0.0); s.lineTo(0.07, -0.015);
  s.quadraticCurveTo(0.07, -0.03, 0.055, -0.03); s.quadraticCurveTo(0.035, -0.03, 0.035, -0.005); s.lineTo(0.035, 0.05); s.lineTo(0.02, 0.05);
  // Le profil se dessine dans le plan (z, y) : la patte contre le mur, le crochet qui sort.
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 8 });
  geo.translate(0.02, 0, -0.009);
  geo.rotateY(-Math.PI / 2);
  const m = new THREE.Mesh(geo, M('jaune-plastique'));
  const g = new THREE.Group().add(m);
  g.add(cylindre(0.006, 0.006, 'acier-zingue', { axe: 'z', pos: [0, 0.03, 0.022] }));
  g.position.set(x, y, 0);
  return projeter(g, 0.25);
}
/** Câble suspendu entre des points d'appui (chaînette approchée par une parabole). */
function chainette(appuis, fleche, n = 16) {
  const pts = [];
  for (let i = 0; i < appuis.length - 1; i++) {
    const a = V(appuis[i]), b = V(appuis[i + 1]);
    for (let k = i ? 1 : 0; k <= n; k++) {
      const t = k / n, q = a.clone().lerp(b, t);
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      if (d > 0.3) q.y -= 4 * fleche * t * (1 - t) * Math.min(1, d / 1.8);
      pts.push(q);
    }
  }
  return pts;
}

/** Boîte de défaut à la terre : coffret gris, porte, voyants, boutons ESSAI / RÉARMER, presse-étoupes. */
function boiteGFB() {
  const G = GFB, g = new THREE.Group();
  g.add(boite(G.L, G.H, G.P - 0.02, 'gris-peint', [0, 0, (G.P - 0.02) / 2], 0.008));
  // Porte (un peu plus petite), charnières à gauche, loquets à droite.
  g.add(boite(G.L - 0.02, G.H - 0.02, 0.02, 'gris-peint', [0, 0, G.P - 0.01], 0.006));
  for (const y of [-0.15, 0.15]) g.add(cylindre(0.008, 0.06, 'acier-zingue', { pos: [-G.L / 2 + 0.002, y, G.P - 0.008] }));
  for (const y of [-0.12, 0.12]) {
    g.add(boite(0.03, 0.05, 0.012, 'noir-plastique', [G.L / 2 - 0.03, y, G.P + 0.006], 0.004));
  }
  // Pattes de fixation au mur.
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) g.add(boite(0.04, 0.03, 0.004, 'gris-peint', [sx * (G.L / 2 + 0.015), sy * (G.H / 2 - 0.03), 0.002]));
  const et = etiquette('etiquette-gfb', 0.24, 0.18);
  et.position.set(-0.02, 0.1, G.P + 0.0005);
  g.add(et);
  // Voyants (vert : sous tension ; rouge : défaut) et boutons.
  g.add(cylindre(0.011, 0.012, 'voyant-vert', { axe: 'z', pos: [-0.1, -0.07, G.P + 0.006] }));
  g.add(cylindre(0.011, 0.012, 'voyant-rouge', { axe: 'z', pos: [-0.04, -0.07, G.P + 0.006] }));
  g.add(cylindre(0.015, 0.015, 'jaune-plastique', { axe: 'z', pos: [0.03, -0.07, G.P + 0.008] }));
  g.add(cylindre(0.015, 0.015, 'noir-plastique', { axe: 'z', pos: [0.09, -0.07, G.P + 0.008] }));
  for (const x of [-0.1, -0.04, 0.03, 0.09]) g.add(cylindre(0.019, 0.004, 'acier-zingue', { axe: 'z', pos: [x, -0.07, G.P + 0.002] }));
  // Presse-étoupes dessous (entrée et sortie du câble 600 V).
  for (const x of [-0.1, 0.1]) {
    g.add(cylindre(0.035, 0.03, 'acier-zingue', { pos: [x, -G.H / 2 - 0.015, G.P / 2], seg: 6 }));
    g.add(cylindre(0.03, 0.025, 'acier-zingue', { pos: [x, -G.H / 2 - 0.042, G.P / 2] }));
  }
  g.position.set(0, GFB.y, 0);
  return projeter(g, 0.6);
}

/** Console électrique 600 V (photo du client) : armoire rouge, boîtier inox à porte vitrée, CB1, contacteur. */
function consoleElec() {
  const C = CONSOLE, g = { armoire: new THREE.Group(), inox: new THREE.Group(), porte: new THREE.Group(), conduit: new THREE.Group(), transfo: new THREE.Group() };
  // Armoire rouge : caisse, larmier en haut, joints des panneaux.
  const a = g.armoire;
  a.add(boite(C.L, C.H, C.P, 'rouge-peint', [0, C.H / 2, C.P / 2], 0.01));
  a.add(boite(C.L + 0.04, 0.03, C.P + 0.04, 'rouge-peint', [0, C.H + 0.015, C.P / 2], 0.006));
  a.add(boite(C.L - 0.06, 0.05, 0.05, 'rouge-peint', [0, C.H - 0.12, C.P + 0.02], 0.004)); // rebord de la photo
  for (const x of [-C.L / 6, C.L / 6]) a.add(boite(0.004, C.H - 0.1, 0.003, 'noir-plastique', [x + 0.25, C.H / 2, C.P + 0.0015]));
  for (const y of [0.25, 0.9, 1.45]) {
    a.add(cylindre(0.012, 0.01, 'acier-zingue', { axe: 'z', pos: [C.L / 2 - 0.06, y, C.P + 0.005], seg: 6 }));
  }
  // Presse-étoupes du câble 600 V sur le dessus.
  a.add(cylindre(0.042, 0.04, 'acier-zingue', { pos: [C.L / 2 - 0.2, C.H + 0.05, 0.22], seg: 6 }));
  a.add(cylindre(0.034, 0.03, 'acier-zingue', { pos: [C.L / 2 - 0.2, C.H + 0.085, 0.22] }));
  projeter(a, 1);

  // Boîtier inox sur la face avant, à gauche.
  const xi = -C.L / 2 + 0.06 + C.inoxL / 2, yi = 0.42 + C.inoxH / 2, zi = C.P;
  const b = g.inox;
  // Caisse ouverte devant (on voit l'intérieur par la fenêtre de la porte) : fond et quatre côtés.
  const ep = 0.003;
  b.add(boite(C.inoxL, C.inoxH, ep, 'inox-sale', [0, 0, ep / 2]));
  for (const s of [-1, 1]) {
    b.add(boite(ep, C.inoxH, C.inoxP, 'inox-sale', [s * (C.inoxL / 2 - ep / 2), 0, C.inoxP / 2]));
    b.add(boite(C.inoxL, ep, C.inoxP, 'inox-sale', [0, s * (C.inoxH / 2 - ep / 2), C.inoxP / 2]));
  }
  // Fond intérieur visible par la fenêtre : plaque de montage, contacteur, disjoncteur, bornier, relais, fils.
  b.add(boite(C.inoxL - 0.06, C.inoxH - 0.08, 0.004, 'fond-blanc', [0, 0, C.inoxP - 0.09]));
  const ct = boite(0.13, 0.17, 0.09, 'fond-blanc', [0.03, -0.2, C.inoxP - 0.045], 0.006);
  b.add(ct);
  const fc = etiquette('etiquette-contacteur', 0.13, 0.17);
  fc.position.set(0.03, -0.2, C.inoxP - 0.0005);
  b.add(fc);
  for (let i = 0; i < 3; i++) {
    b.add(boite(0.03, 0.035, 0.03, 'cuivre-borne', [-0.01 + i * 0.04, -0.33, C.inoxP - 0.06]));
    b.add(cylindre(0.007, 0.012, 'acier-zingue', { axe: 'z', pos: [-0.01 + i * 0.04, -0.33, C.inoxP - 0.04], seg: 6 }));
  }
  b.add(boite(0.14, 0.2, 0.08, 'fond-blanc', [0.06, 0.22, C.inoxP - 0.05], 0.004)); // disjoncteur CB1
  b.add(boite(0.07, 0.09, 0.05, 'jaune-plastique', [-0.2, 0.32, C.inoxP - 0.06], 0.004)); // relais (jaune, photo)
  b.add(boite(0.045, 0.3, 0.06, 'fond-blanc', [-0.22, 0.0, C.inoxP - 0.06]));
  for (let i = 0; i < 9; i++) b.add(boite(0.04, 0.02, 0.012, i % 3 ? 'fils-bleus' : 'fils-noirs', [-0.22, -0.12 + i * 0.03, C.inoxP - 0.025]));
  const fils = ['fils-bleus', 'fils-noirs', 'fils-rouges', 'fils-bleus', 'fils-noirs'];
  fils.forEach((f, i) => {
    const pts = [[-0.22 + 0.025, -0.12 + i * 0.05, C.inoxP - 0.03], [-0.15, -0.1 + i * 0.03, C.inoxP - 0.05], [-0.05, -0.06 + i * 0.02, C.inoxP - 0.06], [0.0 + i * 0.012, -0.11, C.inoxP - 0.05]];
    b.add(tubeCourbe(courbe(pts), 0.003, f, { radial: 6 }));
  });
  for (let i = 0; i < 3; i++) {
    const pts = [[-0.01 + i * 0.04, -0.35, C.inoxP - 0.05], [-0.01 + i * 0.04, -0.42, C.inoxP - 0.06], [-0.01 + i * 0.03, -0.5, C.inoxP - 0.07]];
    b.add(tubeCourbe(courbe(pts), 0.007, 'fils-noirs', { radial: 8 }));
  }
  projeter(b, 0.6);
  b.position.set(xi, yi, zi);

  // Porte : cadre inox, fenêtre de plexiglas sale, trou rond où passe la poignée de CB1, étiquette DANGER 600 VOLTS,
  // deux charnières à droite (vis et pattes) comme sur la photo.
  const p = g.porte, e = 0.025, zp = C.inoxP + 0.012;
  p.add(boite(C.inoxL + 0.01, e, 0.012, 'inox-sale', [0, C.inoxH / 2 - e / 2, zp]));
  p.add(boite(C.inoxL + 0.01, e, 0.012, 'inox-sale', [0, -C.inoxH / 2 + e / 2, zp]));
  for (const s of [-1, 1]) p.add(boite(e, C.inoxH, 0.012, 'inox-sale', [s * (C.inoxL / 2 - e / 2 + 0.005), 0, zp]));
  const vs = new THREE.Shape();
  const vw = C.inoxL - 2 * e + 0.01, vh = C.inoxH - 2 * e;
  vs.moveTo(-vw / 2, -vh / 2); vs.lineTo(vw / 2, -vh / 2); vs.lineTo(vw / 2, vh / 2); vs.lineTo(-vw / 2, vh / 2);
  const trou = new THREE.Path(); trou.absarc(0.06, 0.24, 0.07, 0, Math.PI * 2, true); vs.holes.push(trou);
  const vg = new THREE.ShapeGeometry(vs, 24);
  const vuv = vg.attributes.uv, vp = vg.attributes.position;
  for (let i = 0; i < vuv.count; i++) vuv.setXY(i, (vp.getX(i) + vw / 2) / vw, 1 - (vp.getY(i) + vh / 2) / vh);
  const vit = new THREE.Mesh(vg, M('vitre'));
  vit.userData.uvFixe = true;
  vit.position.z = zp + 0.004;
  vit.renderOrder = 2;
  p.add(vit);
  const dg = etiquette('etiquette-danger-600v', 0.15, 0.17);
  dg.position.set(-0.05, 0.03, zp + 0.0065);
  p.add(dg);
  // Poignée rotative de CB1 dans le trou : moyeu, levier, étiquette CB1.
  p.add(cylindre(0.03, 0.05, 'fond-blanc', { axe: 'z', pos: [0.06, 0.24, zp - 0.005] }));
  const lev = boite(0.025, 0.11, 0.025, 'fond-blanc', [0.06, 0.26, zp + 0.018], 0.006);
  lev.rotation.z = 0.25;
  p.add(lev);
  const cb = etiquette('etiquette-cb1', 0.035, 0.018);
  cb.position.set(0.035, 0.195, zp + 0.008);
  p.add(cb);
  for (const y of [0.32, -0.32]) {
    p.add(boite(0.045, 0.07, 0.006, 'inox-sale', [C.inoxL / 2 + 0.018, y, zp - 0.002]));
    p.add(cylindre(0.007, 0.08, 'inox-sale', { pos: [C.inoxL / 2 + 0.006, y, zp] }));
    p.add(cylindre(0.007, 0.005, 'acier-zingue', { axe: 'z', pos: [C.inoxL / 2 + 0.025, y, zp + 0.003] }));
  }
  projeter(p, 0.6);
  p.position.set(xi, yi, zi);

  // Conduit : coude galvanisé, câble gainé gris qui descend, deux câbles armés (BX) noirs.
  const c = g.conduit, xc = xi + C.inoxL / 2 + 0.12, yt = yi + C.inoxH / 2 - 0.05;
  const coude = new THREE.Group();
  const tor = new THREE.TorusGeometry(0.05, 0.034, 16, 24, Math.PI / 2);
  const cm = new THREE.Mesh(tor, M('acier-zingue'));
  coude.add(cm);
  coude.add(cylindre(0.042, 0.035, 'acier-zingue', { pos: [0.05, -0.012, 0], seg: 6 }));
  coude.position.set(xc - 0.05, yt, zi + 0.06);
  c.add(projeter(coude, 0.25));
  const pts = [[xc, yt - 0.03, zi + 0.06], [xc, yt - 0.3, zi + 0.065], [xc + 0.01, 0.75, zi + 0.07], [xc + 0.03, 0.42, zi + 0.07]];
  c.add(tubeCourbe(courbe(pts), 0.032, 'gris-peint', { tuile: 0.6, radial: 18 }));
  for (const [i, dx] of [0.07, 0.1].entries()) {
    const q = [[xc + dx, yt - 0.25 - i * 0.05, zi + 0.01], [xc + dx + 0.03, yt - 0.4, zi + 0.05], [xc + dx + 0.01, 0.9, zi + 0.05 + i * 0.01], [xc + dx + 0.02 + i * 0.04, 0.42, zi + 0.05]];
    c.add(tubeCourbe(courbe(q), 0.011, 'spirale', { tuile: 0.4, radial: 10 }));
  }
  // Transformateur 600 V / 120 V sous le conduit, étiquette jaune usée.
  const t = g.transfo;
  t.add(boite(0.36, 0.3, 0.26, 'gris-peint', [0, 0, 0.13], 0.006));
  t.add(cylindre(0.012, 0.01, 'acier-zingue', { axe: 'z', pos: [-0.14, 0.11, 0.265], seg: 6 }));
  const lt = etiquette('etiquette-danger-transfo', 0.2, 0.12);
  lt.position.set(0.06, -0.04, 0.2605);
  t.add(lt);
  projeter(t, 0.6);
  t.position.set(xc + 0.13, 0.27, zi);
  return g;
}

/** Arrêt d'urgence : boîtier jaune sur plaque, champignon rouge, plaque ARRÊT D'URGENCE. */
function arretUrgence() {
  const g = new THREE.Group();
  g.add(boite(0.16, 0.2, 0.006, 'acier-zingue', [0, 0, 0.003]));
  g.add(boite(0.11, 0.11, 0.085, 'jaune-plastique', [0, 0, 0.006 + 0.0425], 0.008));
  const et = etiquette('etiquette-estop', 0.1, 0.1);
  et.position.set(0, 0, 0.0915);
  g.add(et);
  g.add(cylindre(0.017, 0.02, 'noir-plastique', { axe: 'z', pos: [0, 0, 0.1] }));
  const champ = new THREE.SphereGeometry(0.03, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4);
  champ.scale(1, 0.55, 1);
  champ.rotateX(Math.PI / 2);
  const ch = new THREE.Mesh(champ, M('rouge-bouton'));
  ch.position.z = 0.108;
  g.add(ch);
  g.add(cylindre(0.03, 0.006, 'rouge-bouton', { axe: 'z', pos: [0, 0, 0.111] }));
  // Presse-étoupe dessous.
  g.add(cylindre(0.012, 0.018, 'noir-plastique', { pos: [0, -0.064, 0.05], seg: 6 }));
  for (const sy of [-1, 1]) g.add(cylindre(0.006, 0.006, 'acier-zingue', { axe: 'z', pos: [0, sy * 0.085, 0.008], seg: 6 }));
  return projeter(g, 0.3);
}

/** Repères 1 à 11 : câble 600 V sur crochets au mur, boîte de défaut à la terre, console, arrêt d'urgence. */
export function P03(api) {
  const C = CONSOLE, xCon = -2.4;
  // Console contre le mur.
  const con = consoleElec();
  for (const [k, o] of Object.entries(con)) o.position.x += xCon;
  api.part('3', con.armoire, [0, 0, 0.35]);
  api.part('4', con.inox, [0, 0, 0.55]);
  api.part('5', con.porte, [0.3, 0, 0.75]);
  api.part('6', con.conduit, [0, 0, 0.6]);
  api.part('7', con.transfo, [0, 0, 0.7]);
  // Boîte de défaut à la terre au mur, à droite.
  const xG = 3.2;
  const gf = boiteGFB();
  gf.position.x = xG;
  api.part('8', gf, [0, 0, 0.4]);
  // Crochets au mur et câble 600 V : du presse-étoupe de la console aux crochets, puis à la boîte.
  const R = CABLE.d / 2, xs = [-1.2, 0.3, 1.8];
  xs.forEach((x) => api.part('2', crochetMur(x, CABLE.hautCrochet), [0, 0, 0.25]));
  const appui = (x) => [x, CABLE.hautCrochet - 0.03 + 0.008 + R, 0.07];
  const depart = [xCon + C.L / 2 - 0.2, C.H + 0.1, 0.22];
  const arrivee = [xG + 0.1, GFB.y - GFB.H / 2 - 0.055, GFB.P / 2];
  const pts = [
    depart, [depart[0], depart[1] + 0.2, 0.2], [depart[0] + 0.2, CABLE.hautCrochet - 0.05, 0.12],
    ...chainette(xs.map(appui), CABLE.flèche),
    [xs[2] + 0.5, CABLE.hautCrochet - 0.3, 0.1], [xG + 0.45, GFB.y - 0.4, 0.14], [xG + 0.3, arrivee[1] - 0.25, 0.13], [arrivee[0] + 0.02, arrivee[1] - 0.12, arrivee[2]], arrivee,
  ];
  api.part('1', new THREE.Group().add(tubeCourbe(courbe(pts, 0.5), R, 'gaine-600v', { tuile: 1, radial: 20 })), [0, 0, 0.5]);
  // Câble d'alimentation de la boîte (vers l'amont) : sort à gauche dessous et file au sol le long du mur.
  const amont = [[xG - 0.1, arrivee[1], GFB.P / 2], [xG - 0.12, arrivee[1] - 0.15, 0.12], [xG - 0.3, 0.3, 0.1], [xG - 0.2, R, 0.12], [xG + 0.6, R, 0.1], [xG + 1.2, R, 0.12]];
  api.part('1', new THREE.Group().add(tubeCourbe(courbe(amont, 0.5), R, 'gaine-600v', { tuile: 1, radial: 20 })), [0, 0, 0.5]);
  // Arrêt d'urgence au mur, câble de commande sur deux crochets de plastique jusqu'à la console.
  const xE = -0.4, yE = 1.45;
  const es = arretUrgence();
  es.position.set(xE, yE, 0);
  api.part('9', es, [0, 0, 0.3]);
  const hooks = [-0.9, -1.4];
  hooks.forEach((x) => api.part('10', crochetPlastique(x, 1.3), [0, 0, 0.2]));
  const rc = 0.0065;
  const cpts = [[xE, yE - 0.075, 0.05], [xE, yE - 0.16, 0.055], [xE - 0.2, 1.3 - 0.035 + rc, 0.055],
    ...chainette(hooks.map((x) => [x, 1.3 - 0.038 + rc, 0.052]), 0.04, 8),
    [xCon + C.L / 2 + 0.05, 1.25, 0.1], [xCon + C.L / 2 + 0.01, 1.2, 0.25]];
  api.part('11', new THREE.Group().add(tubeCourbe(courbe(cpts, 0.5), rc, 'noir-plastique', { tuile: 0.5, radial: 10 })), [0, 0, 0.35]);
  return { view: { dir: [0.25, 0.3, 0.92] } };
}

// ------------------------------------------------------------------ P04 : balisage

/** Trépied de balisage : tête, trois pattes tubulaires, patins, anneau où passe la banderole. */
function trepied() {
  const T = TREPIED, g = new THREE.Group();
  g.add(cylindre(0.028, 0.08, 'orange-peint', { pos: [0, T.H - 0.04, 0] }));
  g.add(cylindre(0.012, 0.03, 'acier-zingue', { pos: [0, T.H + 0.015, 0] }));
  g.add(tore(0.025, 0.005, 'acier-zingue', new THREE.Vector3(1, 0, 0), [0, T.H + 0.05, 0]));
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + 0.4;
    const haut = new THREE.Vector3(Math.cos(a) * 0.03, T.H - 0.06, Math.sin(a) * 0.03), bas = new THREE.Vector3(Math.cos(a) * T.pied, 0.012, Math.sin(a) * T.pied);
    const m = tubeCourbe(new THREE.LineCurve3(haut, bas), T.tube, 'orange-peint', { tuile: 1, radial: 12, pas: 0.1 });
    g.add(m);
    const pat = cylindre(0.022, 0.014, 'noir-plastique', { pos: [bas.x, 0.007, bas.z] });
    g.add(pat);
    // Entretoise à mi-hauteur vers la patte suivante.
    const b = (((i + 1) * 2 * Math.PI) / 3) + 0.4, f = 0.45;
    const p1 = haut.clone().lerp(bas, f), p2 = new THREE.Vector3(Math.cos(b) * 0.03, T.H - 0.06, Math.sin(b) * 0.03).lerp(new THREE.Vector3(Math.cos(b) * T.pied, 0.012, Math.sin(b) * T.pied), f);
    g.add(tubeCourbe(new THREE.LineCurve3(p1, p2), 0.006, 'orange-peint', { tuile: 1, radial: 8, pas: 0.1 }));
  }
  return projeter(g, 0.5);
}
/** Bidon de plastique de 20 L : corps arrondi, poignée moulée, bouchon. */
function bidon() {
  const B = BIDON, g = new THREE.Group();
  g.add(boite(B.L, B.H - 0.04, B.P, 'orange-plastique', [0, (B.H - 0.04) / 2, 0], 0.03));
  // Épaule et poignée : un pont moulé sur le dessus, ajouré.
  const s = new THREE.Shape();
  s.moveTo(-B.L / 2 + 0.03, 0); s.lineTo(B.L / 2 - 0.03, 0); s.lineTo(B.L / 2 - 0.05, 0.07); s.lineTo(-B.L / 2 + 0.11, 0.07); s.lineTo(-B.L / 2 + 0.03, 0.0);
  const h = new THREE.Path(); h.moveTo(-0.06, 0.018); h.lineTo(0.09, 0.018); h.lineTo(0.08, 0.05); h.lineTo(-0.05, 0.05); h.lineTo(-0.06, 0.018); s.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 });
  geo.translate(0, 0, -0.02);
  const m = new THREE.Mesh(geo, M('orange-plastique'));
  m.position.y = B.H - 0.05;
  g.add(m);
  g.add(cylindre(0.026, 0.03, 'noir-plastique', { pos: [-B.L / 2 + 0.06, B.H - 0.025, 0], seg: 24 }));
  return projeter(g, 0.5);
}
/** Ruban plat le long d'une courbe (banderole), deux faces, UV en mètres. */
function ruban(points, large) {
  const c = courbe(points, 0.5), L = c.getLength(), n = Math.max(20, Math.round(L / 0.03));
  const pos = [], uv = [], idx = [], up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = c.getPointAt(t), d = c.getTangentAt(t);
    const cote = new THREE.Vector3().crossVectors(d, up).normalize();
    const vrille = Math.sin(t * Math.PI * 3) * 0.5; // le ruban se vrille un peu
    const h = up.clone().applyAxisAngle(d, vrille).multiplyScalar(large / 2);
    void cote;
    pos.push(...p.clone().add(h).toArray(), ...p.clone().sub(h).toArray());
    uv.push(t * L, 0, t * L, 1);
    if (i < n) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, M('banderole'));
  m.userData.uvFixe = true;
  return m;
}

/** Repères 1 à 3 : périmètre de balisage, bidon – trépied – trépied – bidon, banderole DANGER. */
export function P04(api) {
  const T = TREPIED, B = BIDON;
  const xs = [-2.4, -0.8, 0.8, 2.4];
  const bid = [bidon(), bidon()];
  bid[0].position.set(xs[0], 0, 0); bid[0].rotation.y = 0.2;
  bid[1].position.set(xs[3], 0, 0.05); bid[1].rotation.y = Math.PI - 0.15;
  api.part('2', bid[0], [0, 0, 0.3]);
  for (const x of [xs[1], xs[2]]) { const t = trepied(); t.position.set(x, 0, 0); api.part('1', t, [0, 0.15, 0.3]); }
  api.part('2', bid[1], [0, 0, 0.3]);
  // Banderole : nouée à la poignée du premier bidon, passe dans l'anneau des trépieds, nouée au second bidon.
  const ap = [[xs[0] + 0.02, B.H + 0.005, 0], [xs[1], T.H + 0.05, 0], [xs[2], T.H + 0.05, 0], [xs[3] - 0.02, B.H + 0.005, 0.05]];
  const pts = chainette(ap, 0.22, 14);
  api.part('3', new THREE.Group().add(ruban(pts, BANDEROLE.large)), [0, 0.3, 0.3]);
  return { view: { dir: [0.3, 0.35, 0.89] } };
}

// ------------------------------------------------------------------ P00 : la place de travail

/**
 * Vue d'ensemble : les quatre lots posés ensemble comme sur une place de travail — l'électricité contre le mur
 * (z = 0), les boyaux d'air et d'eau au sol devant, le balisage plus loin. Chaque lot ouvre sa page.
 */
export const POSE = { P03: [0, 0, 0], P01: [0, 0, 1.3], P02: [0, 0, 3.1], P04: [0.4, 0, 4.4] };
export function P00(api) {
  const poser = (ref, id) => {
    const g = api.sub(id);
    g.position.set(...POSE[id]);
    api.part(ref, g, null);
  };
  poser('1', 'P01');
  poser('2', 'P02');
  poser('3', 'P03');
  poser('4', 'P04');
  return { view: { dir: [0.45, 0.6, 0.66] } };
}

export default { P00, P01, P02, P03, P04 };
