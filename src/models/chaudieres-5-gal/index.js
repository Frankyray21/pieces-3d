// Chaudières de 5 gallons du poste de nettoyage des outils, d'après une photo
// du client (P01) et sa description : une chaudière de savon de lin, une
// chaudière de dégraisseur, et, posée sur la seconde, une chaudière coupée (le
// bas d'une chaudière dont on a coupé le dessus) où l'on verse le savon et où
// l'on met la guenille qui sert à nettoyer les outils. Aucun plan, aucune
// mesure.
//
// Cotes : celles, usuelles, d'un seau de 5 gallons US en polyéthylène (14 1/2 po
// de haut, Ø 11,9 po en haut, Ø 10,3 po en bas, paroi de 90 mil). Ni la marque
// ni le modèle des chaudières ne se lisent sur la photo : ces cotes sont
// supposées, pas mesurées. Relevé sur la photo, par proportion avec la hauteur
// de la chaudière : la hauteur de la chaudière coupée (environ 115 mm), sa
// coupe irrégulière faite à la main, l'anse rabattue vers l'avant, la place des
// étiquettes.
//
// Repère, en millimètres : y vers le haut (0 au sol), x vers la droite de la
// photo, z vers l'observateur. Chaudière de savon de lin à gauche (−x),
// chaudière de dégraisseur à droite (+x). Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';
import { bac, caillebotis, affiche, dessusCaillebotis, HORS_TOUT, CAILLEBOTIS } from '../bac-retention-100l/index.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Seau de 5 gallons US : cotes usuelles (supposées). Fond en retrait sur un talon. */
export const SEAU = { haut: 14.5 * IN, dHaut: 11.91 * IN, dBas: 10.33 * IN, paroi: 2.3, talon: 5 };
/** Colliers de renfort sous le bord : hauteur de leur dessous depuis le sol, saillie, épaisseur. */
export const COLLIERS = { y: [303, 332], saillie: 9, ep: 3 };
/** Bourrelet du bord, où s'agrafe le couvercle. */
export const BORD = { saillie: 3.5, haut: 9 };
/** Couvercle à jupe, enfoncé sur le bord. */
export const COUVERCLE = { d: 12.3 * IN, jupe: 22, ep: 2.5, dessus: 7, creux: 4, rCreux: 128 };
/** Anse : fil d'acier de Ø 4 mm, pivots entre les deux colliers, poignée de plastique. */
export const ANSE = { fil: 4, y: 319, demi: 166, fleche: 190, poignee: { d: 24, long: 110 } };
/** Chaudière coupée : hauteur relevée sur la photo, ondulation de la coupe faite à la main. */
export const COUPE = { haut: 115, onde: 3 };
/** Savon de lin versé dans la chaudière coupée : épaisseur supposée. */
export const SAVON = { ep: 35 };
/** Guenille d'atelier : carré de coton, taille et couleur supposées. */
export const GUENILLE = { cote: 330 };
/** Étiquettes : largeur le long de la paroi, hauteur, hauteur du bas depuis le sol (relevées sur la photo, à 20 % près). */
export const ETIQUETTE = { large: 190, haut: 125, y: 55 };
/** Écart entre les deux chaudières (les couvercles ne se touchent pas). */
export const ECART = 20;

/** Rayon extérieur de la paroi à la hauteur y. */
export const rayon = (y) => SEAU.dBas / 2 + ((SEAU.dHaut - SEAU.dBas) / 2) * (y / SEAU.haut);
/** Hauteur du dessus du couvercle (là où repose la chaudière coupée). */
export const dessusCouvercle = () => SEAU.haut + COUVERCLE.dessus - COUVERCLE.creux;
/** Demi-entraxe des deux chaudières. */
export const demiEntraxe = () => (COUVERCLE.d + ECART) / 2;
/** Volume intérieur (litres) d'un seau jusqu'à la hauteur y (tronc de cône). */
export function volume(y = SEAU.haut) {
  const y0 = SEAU.talon + SEAU.paroi, r0 = rayon(y0) - SEAU.paroi, r1 = rayon(y) - SEAU.paroi;
  return (Math.PI * (y - y0) * (r0 * r0 + r0 * r1 + r1 * r1)) / 3 / 1e6;
}
/** Encombrement du modèle (mm) : largeur, hauteur, profondeur. */
export function horsTout() {
  return { large: 2 * demiEntraxe() + COUVERCLE.d, haut: dessusCouvercle() + COUPE.haut + COUPE.onde * 1.5, prof: COUVERCLE.d };
}

// ------------------------------------------------------------------ matériaux

const perso = new Map();
function teinte(nom, creer) {
  let m = perso.get(nom);
  if (!m) {
    m = creer();
    if (m.isMaterial) {
      m.polygonOffset = true;
      m.polygonOffsetFactor = 1;
      m.polygonOffsetUnits = 1;
      m.name = nom;
    }
    perso.set(nom, m);
  }
  return m;
}

/** Polyéthylène blanc des seaux et des couvercles : satiné, légèrement cassé. */
const pehd = () => teinte('chaudiere-pehd', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xe7e4d9, metalness: 0, roughness: 0.46, clearcoat: 0.2, clearcoatRoughness: 0.5,
}), 'plastic'));
/** Poignée de l'anse : plastique blanc. */
const poigneeBlanche = () => teinte('chaudiere-poignee', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xf1efe8, metalness: 0, roughness: 0.5,
}), 'plastic'));
/** Savon de lin : pâte ambrée, luisante. */
const savonDeLin = () => teinte('chaudiere-savon', () => new THREE.MeshPhysicalMaterial({
  color: 0x9a6a1f, metalness: 0, roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.25,
}));
/** Guenille : coton rouge d'atelier (couleur supposée), vue des deux côtés. */
const coton = () => teinte('chaudiere-guenille', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xa8281f, metalness: 0, roughness: 0.95, side: THREE.DoubleSide,
}), 'rubber'));

/**
 * Étiquette dessinée sur un canevas : fond, bandeau de couleur, nom du produit
 * en français. Sur la photo, les étiquettes ne se lisent pas en entier : elles
 * sont redessinées, sans marque. Sans navigateur (contrôles dans Node), papier uni.
 */
function papier(cle, { fond, bandeau, encre, titre, sousTitre }) {
  let map = null;
  if (typeof document !== 'undefined') {
    map = teinte(`img:etiquette-${cle}`, () => {
      const k = 6; // pixels par mm
      const c = document.createElement('canvas');
      c.width = ETIQUETTE.large * k;
      c.height = ETIQUETTE.haut * k;
      const g = c.getContext('2d');
      g.fillStyle = fond;
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = bandeau;
      g.fillRect(0, 0, c.width, c.height * 0.2);
      g.fillRect(0, c.height * 0.9, c.width, c.height * 0.1);
      g.fillStyle = encre;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const police = '"Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif';
      let corps = c.height * 0.24;
      g.font = `900 ${corps}px ${police}`;
      const w = g.measureText(titre).width;
      if (w > c.width * 0.88) { corps *= (c.width * 0.88) / w; g.font = `900 ${corps}px ${police}`; }
      g.fillText(titre, c.width / 2, c.height * 0.47);
      g.font = `600 ${c.height * 0.085}px ${police}`;
      g.fillText(sousTitre, c.width / 2, c.height * 0.72);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    });
  }
  return teinte(`chaudiere-etiquette-${cle}`, () => new THREE.MeshStandardMaterial(
    map ? { map, metalness: 0, roughness: 0.7 } : { color: fond, metalness: 0, roughness: 0.7 },
  ));
}

const ETIQUETTES = {
  savon: { fond: '#f3f0e4', bandeau: '#7a5a1c', encre: '#2a2418', titre: 'SAVON DE LIN', sousTitre: '5 gallons US · 18,9 L' },
  degraisseur: { fond: '#dfe6cf', bandeau: '#c8401c', encre: '#1f2a1c', titre: 'DÉGRAISSEUR', sousTitre: '5 gallons US · 18,9 L' },
  huile: { fond: '#f1efe6', bandeau: '#b8860b', encre: '#1d1a14', titre: 'HUILE HYDRAULIQUE', sousTitre: '5 gallons US · 18,9 L' },
};

// ------------------------------------------------------------------ pièces

const SEG = 96; // facettes sur le tour

/** Profil [r, y] (mm) d'un seau coupé à la hauteur `haut` ; colliers et bourrelet si le seau est entier. */
function profilSeau(haut, entier) {
  const t = SEAU.paroi, p = [[0, SEAU.talon], [rayon(0) - 7, SEAU.talon], [rayon(0) - 7, 0], [rayon(0), 0]];
  if (entier) {
    for (const y of COLLIERS.y) {
      p.push([rayon(y), y], [rayon(y) + COLLIERS.saillie, y], [rayon(y + COLLIERS.ep) + COLLIERS.saillie, y + COLLIERS.ep], [rayon(y + COLLIERS.ep), y + COLLIERS.ep]);
    }
    p.push([rayon(haut - BORD.haut), haut - BORD.haut], [rayon(haut - BORD.haut) + BORD.saillie, haut - BORD.haut + 2], [rayon(haut) + BORD.saillie, haut - 2], [rayon(haut), haut]);
  } else {
    p.push([rayon(haut), haut]);
  }
  p.push([rayon(haut) - t, haut], [rayon(SEAU.talon + t) - t, SEAU.talon + t], [0, SEAU.talon + t]);
  return p.map(([r, y]) => [r * MM, y * MM]);
}

/** Étiquette collée sur la paroi, face à +z (suit le cône de la paroi). */
function etiquette(cle) {
  const n = 24, pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    for (const [j, y] of [[0, ETIQUETTE.y], [1, ETIQUETTE.y + ETIQUETTE.haut]]) {
      const r = rayon(y) + 0.4, a = ((i / n - 0.5) * ETIQUETTE.large) / rayon(ETIQUETTE.y + ETIQUETTE.haut / 2);
      pos.push(r * Math.sin(a) * MM, y * MM, r * Math.cos(a) * MM);
      uv.push(i / n, j);
    }
    if (i > 0) { const b = 2 * i; idx.push(b - 2, b, b + 1, b - 2, b + 1, b - 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, papier(cle, ETIQUETTES[cle]));
  m.userData.noEdges = true;
  return m;
}

/** Repères 1 et 2 : seau entier, ses deux oreilles d'anse et son étiquette. */
function seau(S, cle) {
  const corps = S.lathe(profilSeau(SEAU.haut, true), pehd(), { seg: SEG });
  corps.userData.hasInterior = true;
  const g = S.group(corps);
  for (const s of [1, -1]) {
    g.add(S.cyl(11 * MM, 12 * MM, pehd(), { axis: 'x', pos: [s * (rayon(ANSE.y) + 5) * MM, ANSE.y * MM, 0] }));
  }
  g.add(etiquette(cle));
  return g;
}

/** Repère 3 : couvercle à jupe, dessus en creux. */
function couvercle(S) {
  const C = COUVERCLE, R = C.d / 2, y0 = SEAU.haut - C.jupe, y1 = SEAU.haut + C.dessus, yc = y1 - C.creux;
  const profil = [
    [0, yc - C.ep], [C.rCreux + 2, yc - C.ep], [C.rCreux + 6, SEAU.haut + 0.2], [R - C.ep, SEAU.haut + 0.2], [R - C.ep, y0], [R, y0],
    [R, y1 - 2], [R - 2, y1], [C.rCreux + 8, y1], [C.rCreux, yc], [0, yc],
  ];
  return S.lathe(profil.map(([r, y]) => [r * MM, y * MM]), pehd(), { seg: SEG });
}

/** Repère 4 : anse de fil d'acier rabattue vers l'avant, contre la paroi, et sa poignée. */
function anse(S) {
  const A = ANSE;
  // Inclinaison : la poignée touche la paroi (cherchée par approximations successives).
  let inc = 0.9;
  for (let k = 0; k < 8; k++) inc = Math.asin(Math.min(1, (rayon(A.y - A.fleche * Math.cos(inc)) + A.poignee.d / 2 + 1) / A.fleche));
  const P = (x, f) => [x * MM, (A.y - f * Math.cos(inc)) * MM, f * Math.sin(inc) * MM];
  const d = A.demi, f = A.fleche, pl = A.poignee.long / 2 + 8;
  const moitie = [[d, 0], [d * 0.985, f * 0.3], [d * 0.9, f * 0.62], [d * 0.68, f * 0.9], [pl, f]];
  // Le tronçon du bas est droit (il porte la poignée) : le fil passe par −pl puis +pl.
  const pts = [[d - 14, 0], ...moitie, [-pl, f], ...moitie.slice(0, -1).reverse().map(([x, y]) => [-x, y]), [-(d - 14), 0]];
  const g = S.group(S.tube(pts.map(([x, y]) => P(x, y)), (A.fil / 2) * MM, 'zinc', { seg: 96, tension: 0.5, ends: 'none', radial: 10 }));
  g.add(S.cyl((A.poignee.d / 2) * MM, A.poignee.long * MM, poigneeBlanche(), { axis: 'x', pos: P(0, f) }));
  g.userData.poignee = P(0, f);
  return g;
}

/** Repère 5 : chaudière coupée — le bas d'un seau, coupe ondulée faite à la main. */
function chaudiereCoupee(S) {
  const g = S.lathe(profilSeau(COUPE.haut, false), pehd(), { seg: SEG });
  g.userData.hasInterior = true;
  g.traverse((o) => {
    const p = o.geometry?.attributes.position;
    if (!p) return;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) < (COUPE.haut - 0.01) * MM) continue;
      const a = Math.atan2(p.getZ(i), p.getX(i));
      p.setY(i, p.getY(i) + COUPE.onde * (0.5 + 0.6 * Math.sin(3 * a + 1) + 0.4 * Math.sin(7 * a + 2.2)) * MM);
    }
    p.needsUpdate = true;
    o.geometry.computeBoundingBox();
    o.geometry.computeBoundingSphere();
  });
  return g;
}

/** Repère 6 : savon de lin versé au fond de la chaudière coupée. */
function savon(S) {
  const y0 = SEAU.talon + SEAU.paroi, y1 = y0 + SAVON.ep, r = (y) => rayon(y) - SEAU.paroi - 0.3;
  return S.lathe([[0, y0], [r(y0), y0], [r(y1), y1], [0, y1]].map(([a, b]) => [a * MM, b * MM]), savonDeLin(), { seg: SEG });
}

/** Repère 7 : guenille froissée, posée sur le savon. */
function guenille() {
  // Un carré de coton froissé n'occupe qu'une partie de sa surface à plat : tassé à 45 %.
  const cote = GUENILLE.cote * 0.45, n = 40;
  const geo = new THREE.PlaneGeometry(cote * MM, cote * MM, n, n);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, base = SEAU.talon + SEAU.paroi + SAVON.ep;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / MM, z = p.getZ(i) / MM;
    const plis = Math.sin(x * 0.11 + 1.6 * Math.sin(z * 0.05)) * Math.sin(z * 0.09 + 1.1 * Math.sin(x * 0.06 + 2)) + 0.55 * Math.sin((x + z) * 0.21);
    const bord = Math.max(Math.abs(x), Math.abs(z)) / (cote / 2); // les bords retombent sur le savon
    const y = base + 2 + 13 * (plis + 1.55) * (1 - bord ** 4 * 0.85);
    p.setXYZ(i, (x + 5 * Math.sin(z * 0.13)) * MM, y * MM, (z + 5 * Math.sin(x * 0.12 + 1)) * MM);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, coton());
  m.rotation.y = 0.45;
  m.userData.noEdges = true;
  return new THREE.Group().add(m);
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const { S } = api;
  const e = demiEntraxe() * MM, yc = dessusCouvercle() * MM, rc = rayon(ANSE.y) * MM;
  const pose = (o, x, y = 0) => { o.position.set(x, y, 0); return o; };

  api.part('1', pose(seau(S, 'savon'), -e), [0, 0, 0], { labelAt: [-rayon(150) * MM, 150 * MM, 0] });
  api.part('2', pose(seau(S, 'degraisseur'), e), [0, 0, 0], { labelAt: [rayon(150) * MM, 150 * MM, 0] });
  for (const x of [-e, e]) {
    api.part('3', pose(couvercle(S), x), [0, 0.14, 0], { labelAt: [0, yc, x < 0 ? 0 : (COUVERCLE.d / 2 - 12) * MM] });
    const a = anse(S);
    api.part('4', pose(a, x), [0, 0, 0.14], { labelAt: [rc * 0.9, a.userData.poignee[1] + 0.07, a.userData.poignee[2] * 0.6] });
  }
  // La chaudière coupée repose sur le couvercle de la chaudière de dégraisseur, comme sur la photo.
  api.part('5', pose(chaudiereCoupee(S), e, yc), [0, 0.3, 0], { labelAt: [0, 60 * MM, rayon(60) * MM] });
  api.part('6', pose(savon(S), e, yc), [0, 0.42, 0], { labelAt: [-70 * MM, (SEAU.talon + SEAU.paroi + SAVON.ep) * MM, 60 * MM] });
  api.part('7', pose(guenille(), e, yc), [0, 0.56, 0], { labelAt: [0, (SEAU.talon + SEAU.paroi + SAVON.ep + 30) * MM, 0] });
  // Vue de la photo : de face, un peu au-dessus. Coupe proposée : par l'axe des deux chaudières.
  return { view: { dir: [0.28, 0.42, 0.86], section: { axis: 'z', pos: 0.5 } } };
}

/**
 * P02 : chaudières d'huile sur le bac de rétention 100 L (demande du client :
 * « bac de rétention avec max 5 chaudières d'huile 5 gallons »). Même seau que
 * P01, fermé, étiquette « HUILE HYDRAULIQUE » (redessinée, sans marque). Le bac
 * est le modèle bac-retention-100l (P01), avec son caillebotis et son affiche
 * « MAX 100 LITRES » : 5 chaudières × 18,9 L = 94,6 L, sous les 100 L publiés.
 * Rangées en quinconce : 3 au fond, 2 devant, couvercles à HUILE.jeu l'un de
 * l'autre ; les anses du fond sont rabattues vers l'arrière, celles de devant
 * vers l'avant, les étiquettes regardent toutes vers l'avant (+z).
 */
export const HUILE = { nombre: 5, jeu: 3 };
/** Centres (mm) des chaudières sur le bac : x, z (fond : z < 0). */
export function placesHuile() {
  const pas = COUVERCLE.d + HUILE.jeu, dz = Math.sqrt(pas * pas - (pas / 2) ** 2) / 2;
  return [[-pas, -dz], [0, -dz], [pas, -dz], [-pas / 2, dz], [pas / 2, dz]].slice(0, HUILE.nombre);
}

export function P02(api) {
  const { S } = api;
  const y0 = dessusCaillebotis() * MM, yc = y0 + dessusCouvercle() * MM;
  api.part('8', bac(S), [0, 0, 0], { labelAt: [(-HORS_TOUT.L / 2 + 40) * MM, 60 * MM, (HORS_TOUT.P / 2) * MM] });
  api.part('9', caillebotis(S), [0, 0.12, 0], { labelAt: [(-CAILLEBOTIS.L / 2 + 30) * MM, y0, 0] });
  api.part('10', affiche(), [0, 0, 0.1], { labelAt: [0, 115 * MM, (HORS_TOUT.P / 2) * MM] });
  for (const [x, z] of placesHuile()) {
    const s = seau(S, 'huile');
    s.position.set(x * MM, y0, z * MM);
    api.part('11', s, [0, 0.25, 0], { labelAt: [x * MM, y0 + 150 * MM, (z + rayon(150)) * MM] });
    const c = couvercle(S);
    c.position.set(x * MM, y0, z * MM);
    api.part('3', c, [0, 0.4, 0], { labelAt: [x * MM, yc, z * MM] });
    const a = anse(S);
    a.position.set(x * MM, y0, z * MM);
    if (z < 0) a.rotation.y = Math.PI;
    api.part('4', a, [0, 0.25, z < 0 ? -0.1 : 0.1], { labelAt: [x * MM, y0 + a.userData.poignee[1], (z + (z < 0 ? -1 : 1) * a.userData.poignee[2] / MM) * MM] });
  }
  return { view: { dir: [0.4, 0.55, 0.75], section: { axis: 'z', pos: 0.5 } } };
}

export default { P01, P02 };
