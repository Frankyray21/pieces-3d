// Porte assemblée 1801020 (Machines Roger International), d'après les plans 1801020 (porte
// assemblée) et 15250402 (trépied) : cotes dans plan.js.
//
// La porte est faite de trois corps, étiquetés userData.body, pour l'animer (site, Unreal Engine) :
//   Cadre   : cadre, trépied, plaques de butée, moitié basse des pentures, tête d'interverrouillage ;
//   Battant : battant grillagé, poignée, moitié haute des pentures, socle de la barrure ;
//   Verrou  : barre coulissante de la barrure, son bouton et sa languette.
// Le battant tourne autour de l'axe des pentures, vers l'avant ; le verrou coulisse le long du
// battant (cinematique.js). userData.lot nomme la section de matériau à l'export ;
// userData.kVolume ramène le volume d'un maillage plein à celui de la pièce (tube creux, fil rond).
// Repère du modèle : X largeur (0 au milieu de la porte, pentures du côté +X), Y vers le haut
// (0 au plancher), +Z vers l'avant ; le plan milieu du cadre est à Z = 0.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { IN, L, H, TREPIED, CADRE, FACE, ANNEAU, PATTE, BATTANT, BUTEE, PENTURE, BARRURE, BOULON, tauxCreux } from './plan.js';
import { balayer, carreArrondi, cercle, arrondir, ovale, tauxPolygone } from './formes.js';
import { poser, OUVERTURE } from './cinematique.js';

const X = (x) => (x - L / 2) * IN; // x du plan (po) → mètres, modèle centré
const P = (x, y, z) => new THREE.Vector3(X(x), y * IN, z * IN);
const pos = (x, y, z) => [X(x), y * IN, z * IN];
const Zp = new THREE.Vector3(0, 0, 1);
// Peinture noire sur tout ce qui est soudé (cadre, battant, grillage, trépied, butées, pentures) : couleur
// demandée pour le modèle, les plans n'en précisent pas. Visserie zinguée et barrure gardent leur fini.
const PEINTURE = 'black';

/** Étiquette un objet : corps mobile et section de matériau. */
function tag(obj, body, lot) {
  if (body) obj.userData.body = body;
  if (lot) obj.userData.lot = lot;
  return obj;
}

/** Nomme un maillage (repéré par le contrôle chiffré et gardé à l'export). */
const nom = (obj, n) => { obj.name = n; return obj; };

/** Tube carré le long d'un tracé [x, y] du plan, à la profondeur z ; maillage plein, volume de tube creux. */
function tube(trace, profil, z, material, ferme = false) {
  const geo = balayer(trace.map(([x, y]) => P(x, y, z)), carreArrondi(profil.tube * IN, profil.rayon * IN), Zp, { ferme });
  const m = new THREE.Mesh(geo, mat(material));
  m.userData.kVolume = tauxCreux(profil);
  return m;
}

/** Rond plein le long d'un tracé de points 3D (m), dans un plan de normale B. */
function rond(points, d, B, material, { ferme = false, n = 10 } = {}) {
  const m = new THREE.Mesh(balayer(points, cercle((d / 2) * IN, n), B, { ferme }), mat(material));
  m.userData.kVolume = 1 / tauxPolygone(n);
  return m;
}

/** Boîte entre deux coins du plan (po). */
function boite(S, x0, x1, y0, y1, z0, z1, material, r = 0) {
  return S.box((x1 - x0) * IN, (y1 - y0) * IN, (z1 - z0) * IN, material, { r: r * IN, pos: pos((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2) });
}

/** Plaque découpée dans le plan XY (points du plan, po), de z0 à z1. */
function decoupe(S, points, z0, z1, material) {
  const p = S.extrude(points.map(([x, y]) => [X(x), y * IN]), (z1 - z0) * IN, material, { center: false });
  p.position.z = z0 * IN;
  return p;
}

// ------------------------------------------------------------------ trépied 15250402

/** Gousset : plat de 2 po à 45°, du flanc de la douille au dessus du pied ; s = +1 devant, -1 derrière. */
function gousset(S, x, s, material) {
  const { ep, cote, large } = TREPIED.gousset;
  const y0 = TREPIED.plaque.ep, zf = TREPIED.douille.jeu / 2 + TREPIED.douille.ep;
  const bas = cote - large * Math.SQRT2;
  const profil = [[zf, y0 + bas], [zf, y0 + cote], [zf + cote, y0], [zf + bas, y0]].map(([z, y]) => [s * z * IN, y * IN]);
  const g = S.extrude(profil, ep * IN, material);
  g.rotation.y = -Math.PI / 2; // profil dans le plan ZY, épaisseur selon X
  g.position.x = X(x);
  return S.group(g);
}

export function P02(api) {
  const S = api.S;
  const M = PEINTURE;
  const { plaque, douille } = TREPIED;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, tag(obj, null, 'Trepied'), explode, { noLabel: seen.has(ref) }); seen.add(ref); };
  const axes = [CADRE.tube / 2, L - CADRE.tube / 2]; // axe des montants

  // Deux pieds de 36 po et la traverse entre eux : trois plaques identiques.
  put('1', boite(S, 0, plaque.large, 0, plaque.ep, -plaque.long / 2, plaque.long / 2, M), [-0.12, 0, 0]);
  put('1', boite(S, plaque.large, L - plaque.large, 0, plaque.ep, -plaque.large / 2, plaque.large / 2, M), [0, -0.1, 0]);
  put('1', boite(S, L - plaque.large, L, 0, plaque.ep, -plaque.long / 2, plaque.long / 2, M), [0.12, 0, 0]);
  for (const x of axes) {
    for (const s of [1, -1]) {
      const z0 = s * douille.jeu / 2, z1 = s * (douille.jeu / 2 + douille.ep);
      put('2', boite(S, x - douille.large / 2, x + douille.large / 2, plaque.ep, plaque.ep + douille.haut, Math.min(z0, z1), Math.max(z0, z1), M), [0, 0.1, s * 0.1]);
    }
  }
  for (const x of axes) for (const s of [1, -1]) put('3', gousset(S, x, s, M), [0, 0.04, s * 0.22]);
  return { view: { dir: [-0.7, 0.75, 1] } };
}

// ------------------------------------------------------------------ cadre 15250413

function cadre(S) {
  const M = PEINTURE, a = CADRE.tube / 2;
  const g = S.group(nom(tube([[a, TREPIED.plaque.ep], [a, H - a], [L - a, H - a], [L - a, TREPIED.plaque.ep]], CADRE, 0, M), 'tube'));
  // Anneaux : trois debout sur la traverse du haut, quatre couchés de chaque côté.
  const { rond: d, long, large, haut, cote } = ANNEAU;
  const axe = ovale(long, large, d);
  for (const x of haut) g.add(nom(rond(axe.map(([u, v]) => P(x, H + large / 2 + v, u)), d, new THREE.Vector3(1, 0, 0), M, { ferme: true, n: 8 }), 'anneau'));
  for (const y of cote) {
    g.add(nom(rond(axe.map(([u, v]) => P(-large / 2 - v, y, u)), d, new THREE.Vector3(0, 1, 0), M, { ferme: true, n: 8 }), 'anneau'));
    g.add(nom(rond(axe.map(([u, v]) => P(L + large / 2 + v, y, u)), d, new THREE.Vector3(0, -1, 0), M, { ferme: true, n: 8 }), 'anneau'));
  }
  // Patte du loquet : plaque à coins coupés, soudée au flanc du montant gauche, à fleur de la face avant.
  const { x, y0, y1, chanfrein: c, ep } = PATTE;
  g.add(nom(decoupe(S, [[0, y0], [0, y1], [x, y1 - c], [x, y0 + c]], FACE - ep, FACE, M), 'patte'));
  return tag(g, 'Cadre', 'Cadre');
}

/** Plaque de butée triangulaire ; haut : coin du haut (sinon coin du bas), côté loquet. */
function butee(S, haut) {
  const { cote: a, coin: c, ep, retrait, bas } = BUTEE;
  const x = CADRE.tube, y = haut ? H - CADRE.tube : bas, s = haut ? -1 : 1;
  const z0 = -FACE + retrait; // à 1/4 po de la face arrière du cadre, contre le dos du battant
  return tag(S.group(decoupe(S, [[x + c, y], [x + a, y], [x, y + s * a], [x, y + s * c]], z0, z0 + ep, PEINTURE)), 'Cadre', 'Cadre');
}

// ------------------------------------------------------------------ battant 15250400

function battant(S) {
  const B = BATTANT, t = B.tube / 2, z = FACE - t, M = PEINTURE;
  const g = S.group(
    nom(tube([[B.x0 + t, B.y0 + t], [B.x1 - t, B.y0 + t], [B.x1 - t, B.y1 - t], [B.x0 + t, B.y1 - t]], B, z, M, true), 'tube'),
    nom(tube([[B.x0 + B.tube, B.traverse], [B.x1 - B.tube, B.traverse]], B, z, M), 'traverse'),
  );
  // Grillage : fils verticaux par panneau, fils horizontaux d'un montant à l'autre, en un maillage.
  const n = 10, r = (B.fil / 2) * IN, fils = [];
  const panneaux = [[B.y0 + B.tube, B.traverse - t, B.filBas], [B.traverse + t, B.y1 - B.tube, B.filHaut]];
  for (const [y0, y1, [h0, h1]] of panneaux) {
    for (let x = B.filX[0]; x <= B.filX[1] + 1e-6; x += B.pas) fils.push(S.cyl(r, (y1 - y0) * IN, PEINTURE, { seg: n, pos: pos(x, (y0 + y1) / 2, z) }));
    for (let y = h0; y <= h1 + 1e-6; y += B.pas) fils.push(S.cyl(r, (B.x1 - B.x0 - 2 * B.tube) * IN, PEINTURE, { axis: 'x', seg: n, pos: pos((B.x0 + B.x1) / 2, y, z) }));
  }
  const grillage = nom(tag(S.merged(fils, PEINTURE), null, 'Grillage'), 'grillage');
  grillage.userData.kVolume = 1 / tauxPolygone(n);
  g.add(grillage);
  // Plaque du loquet, à fleur de la face avant.
  const p = B.plaque;
  g.add(nom(boite(S, p.x0, p.x1, p.y0, p.y1, FACE - p.ep, FACE, M), 'plaque'));
  // Poignée : rond de 1/2 po en U, du montant vers l'avant.
  const h = B.poignee, zf = FACE - 0.05, zg = FACE + h.saillie;
  const trace = arrondir([[zf, h.y0], [zg, h.y0], [zg, h.y1], [zf, h.y1]], h.coude);
  g.add(nom(rond(trace.map(([zz, y]) => P(h.x, y, zz)), h.rond, new THREE.Vector3(1, 0, 0), M), 'poignee'));
  return tag(g, 'Battant', 'Battant');
}

// ------------------------------------------------------------------ pentures 0105233

/** Penture à souder : moitié basse sur le cadre, moitié haute (graisseur) sur le battant. */
function penture(S, joint) {
  const { r, demi } = PENTURE, M = PEINTURE, k = IN;
  const bas = S.lathe([[0, (-demi - 0.33) * k], [0.2 * k, (-demi - 0.29) * k], [0.34 * k, (-demi - 0.14) * k], [r * k, -demi * k], [r * k, 0], [0, 0]], M, { seg: 20 });
  const haut = S.group(
    S.lathe([[0, 0], [r * k, 0], [r * k, demi * k], [0.24 * k, (demi + 0.37) * k], [0, (demi + 0.37) * k]], M, { seg: 20 }),
    S.cyl(0.14 * k, 0.09 * k, 'zinc', { seg: 6, pos: [0, (demi + 0.415) * k, 0] }),
    S.cyl(0.07 * k, 0.2 * k, 'zinc', { seg: 10, pos: [0, (demi + 0.56) * k, 0] }),
  );
  const o = pos(PENTURE.x, joint, PENTURE.z);
  return S.group(nom(tag(S.group(S.at(bas, o)), 'Cadre', 'Pentures'), 'demi-basse'), nom(tag(S.group(S.at(haut, o)), 'Battant', 'Pentures'), 'demi-haute'));
}

// ------------------------------------------------------------------ barrure 2210300

function barrure(S) {
  const R = BARRURE, k = IN, y = R.y, z = R.z;
  const CORPS = 'castAlu', ACIER = 'steel', NOIR = 'blackOxide';
  // Sur le cadre : tête (où entre la languette) et boîtier de l'interverrouillage, sur la patte.
  const t = R.tete, b = R.boitier, zi = FACE + R.prof;
  const fixe = S.group(
    nom(boite(S, t.x0, t.x1, t.y0, t.y1, FACE, zi, CORPS, 0.06), 'tete'),
    nom(boite(S, b.x0, b.x1, b.y0, b.y1, FACE, zi, CORPS, 0.06), 'boitier'),
    // Vis du couvercle, voyant et serrure du boîtier, bouton de la tête (formes du dessin).
    S.boltSet([[-0.63, 47.29], [0.51, 47.29], [-0.63, 50.04], [0.51, 50.04]].map(([x, yy]) => pos(x, yy, zi)), 0.16 * k, 0.02 * k, 'zinc', { axis: 'z', washer: false }),
    S.cyl(0.25 * k, 0.06 * k, 'zinc', { axis: 'z', seg: 20, pos: pos(-0.06, 49.39, zi + 0.03) }),
    boite(S, -0.42, 0.3, 48.42, 48.74, zi - 0.02, zi + 0.02, NOIR, 0.08),
    S.cyl(0.28 * k, 0.06 * k, 'zinc', { axis: 'z', seg: 20, pos: pos(1.05, 45.54, zi + 0.03) }),
  );
  // Sur le battant : socle à coins coupés et les deux glissières de la barre.
  const s = R.socle, c = s.chanfrein, zs = FACE + s.ep, br = R.barre;
  const socle = S.group(
    decoupe(S, [[s.x0 + c, s.y0], [s.x1 - c, s.y0], [s.x1, s.y0 + c], [s.x1, s.y1 - c], [s.x1 - c, s.y1], [s.x0 + c, s.y1], [s.x0, s.y1 - c], [s.x0, s.y0 + c]], FACE, zs, CORPS),
    boite(S, 7.45, 11.05, y + br.haut / 2 + 0.2, s.y1 - 0.15, zs, zs + br.ep, CORPS, 0.04),
    boite(S, 7.45, 11.05, s.y0 + 0.15, y - br.haut / 2 - 0.2, zs, zs + br.ep, CORPS, 0.04),
  );
  // Mobile : barre, bouton champignon, bloc de la languette et languette.
  const bt = R.bouton, bl = R.bloc, lg = R.languette, zb = zs + br.ep;
  const fond = (bt.bout - 0.53) * k, bout = bt.bout * k, rb = bt.r * k;
  const mobile = S.group(
    nom(boite(S, br.x0, br.x1, y - br.haut / 2, y + br.haut / 2, zs, zb, ACIER, 0.05), 'barre'),
    S.cyl(0.3 * k, 0.25 * k, ACIER, { axis: 'x', seg: 16, pos: pos(br.x1 + 0.1, y, (zs + zb) / 2) }),
    tag(S.at(S.lathe([[0, zb * k], [0.55 * k, zb * k], [0.55 * k, (zb + 0.64) * k], [bt.tige * k, (zb + 0.64) * k], [bt.tige * k, fond], [rb * 0.93, fond], [rb, fond + 0.12 * k], [rb, bout - 0.2 * k], [rb * 0.8, bout - 0.04 * k], [0, bout]], NOIR, { axis: 'z', seg: 28 }), pos(bt.x, y, 0)), null, 'Bouton'),
    boite(S, bl.x0, bl.x1, bl.y0, bl.y1, z - bl.ep / 2, z + bl.ep / 2, CORPS, 0.08),
    nom(decoupe(S, [[bl.x0, y - 0.4], [bl.x0, y + 0.4], [1.95, y + 0.14], [lg.x, y + 0.14], [lg.x, y - 0.14], [1.95, y - 0.14]], z - lg.ep / 2, z + lg.ep / 2, ACIER), 'languette'),
  );
  return S.group(tag(fixe, 'Cadre', 'Barrure'), tag(socle, 'Battant', 'Barrure'), tag(mobile, 'Verrou', 'Barrure'));
}

// ------------------------------------------------------------------ assemblage 1801020

function assemblage(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); };
  const axes = [CADRE.tube / 2, L - CADRE.tube / 2];
  const zd = TREPIED.douille.jeu / 2 + TREPIED.douille.ep; // face des douilles

  put('1', S.group(battant(S)), [0, 0, 0.35]);
  put('2', tag(S.group(api.sub('P02')), 'Cadre'), [0, -0.3, 0]);
  put('3', S.group(cadre(S)), [0, 0, -0.3]);
  put('4', S.group(butee(S, true)), [-0.1, 0.12, -0.5]);
  put('4', S.group(butee(S, false)), [-0.1, -0.02, -0.5]);
  put('5', barrure(S), [-0.25, 0, 0.6]);
  for (const j of PENTURE.joints) put('6', penture(S, j), [0.25, 0, 0.2]);
  for (const x of axes) {
    put('7', S.group(tag(S.nut(0.75 * IN, BOULON.ecrou * IN, 'zinc', { axis: 'z', pos: pos(x, BOULON.y, -zd - BOULON.ecrou / 2) }), 'Cadre', 'Visserie')), [0, -0.3, -0.3]);
    put('8', S.group(tag(S.bolt(BOULON.d * IN, BOULON.long * IN, 'zinc', { axis: 'z', pos: pos(x, BOULON.y, zd) }), 'Cadre', 'Visserie')), [0, -0.3, 0.3]);
  }
  const zs = FACE + BARRURE.socle.ep;
  for (const x of BARRURE.vis.x) for (const y of BARRURE.vis.y) {
    put('9', S.group(tag(S.bolt((5 / 16) * IN, 0.75 * IN, 'zinc', { axis: 'z', pos: pos(x, y, zs) }), 'Battant', 'Visserie')), [-0.25, 0, 0.8]);
  }
}

export function P01(api) {
  assemblage(api);
  return { view: { dir: [-0.75, 0.3, 1] } };
}

// Fonctionnement : la même porte, en trois temps (verrou engagé, verrou tiré, battant ouvert).
const smooth = (u) => u * u * (3 - 2 * u);
const STEPS = [
  { label: 'Départ', title: 'Porte fermée, verrou engagé', text: 'La languette de la barre est dans la tête d\'interverrouillage du cadre : le battant ne peut pas tourner.' },
  { title: 'Tirer le verrou', text: `La barre coulisse de ${BARRURE.course} po vers les pentures (course estimée sur le plan) : la languette sort de la tête.` },
  { title: 'Ouvrir le battant', text: `Le battant tourne vers l'avant autour de l'axe des trois pentures, ici de ${OUVERTURE.usage}° ; il bute sur le gousset du trépied vers ${Math.floor(OUVERTURE.max)}°.` },
];

export function P03(api) {
  assemblage(api);
  const root = api.S.group();
  root.userData.stepAnim = { step: 1, delay: 300, dur: 1200, update: (k) => poser(root.parent, 0, smooth(k) * BARRURE.course) };
  const battu = api.S.group();
  battu.userData.stepAnim = { step: 2, delay: 300, dur: 3200, update: (k) => { if (k > 0) poser(battu.parent, smooth(k) * OUVERTURE.usage, BARRURE.course); } };
  api.add(root);
  api.add(battu);
  return { view: { dir: [-0.9, 0.55, 1], steps: STEPS, stepsAuto: true } };
}

export default { P01, P02, P03 };
