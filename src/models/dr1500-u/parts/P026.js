// P026 — Console de commande de la DR1500-U : AJOUT HORS MANUEL, d'après une seule photo du client
// (public/equipment/dr1500-u/pages/P026.webp, 407 × 686 px, vue de trois quarts avant droit, en plongée).
// Le manuel de pièces n'a aucune page sur les commandes : ni plan, ni cote, ni numéro de pièce.
//
// Ce que la photo montre et qui est modélisé :
//   - le pied : plaque de base au sol à bords tombés, montant carré en tôle pliée, deux goussets triangulaires
//     (acier clair, galvanisé ou inox : « zinc ») ;
//   - le boîtier gris clair défraîchi : caisson du bas et tête à face inclinée vers l'arrière (joint visible entre
//     les deux sur le flanc droit), grande fenêtre vitrée dans un cadre tenu par quatre vis dorées aux coins, trois
//     autocollants (rond orange en haut à gauche, bleu en haut à droite, rond rouge et blanc en bas à droite) et deux
//     étiquettes de papier en haut — tous illisibles : pastilles de couleur sans inscription ;
//   - devant le boîtier, la télécommande à leviers (émetteur de type pupitre ventral) : coque noire et bandeau
//     arqué à l'arrière, pare-chocs rouges de chaque côté, huit leviers à palette sur le pont du haut, voyants et
//     logo au centre du bandeau (illisibles : barres claires et pastille jaune et blanche sans lettres), sur le pont
//     du bas un arrêt d'urgence coup-de-poing rouge sur embase jaune, un bouton vert, un bouton rond noir, cinq
//     interrupteurs à manette, et l'arceau avant en tôle inox avec trois autocollants (illisibles) ;
//   - sur le flanc droit : un presse-étoupe et son câble vers un second appareil noir (afficheur et colonne de
//     sept touches, vu en partie : la photo le coupe), tenu par une patte, d'où descendent deux câbles noirs ;
//   - le gros câble noir qui arrive par l'arrière, en haut à gauche (tronçon visible seulement).
// Non vu et fermé au plus simple (signalé dans data.json) : dos, flanc gauche et dessous du boîtier, dessus de la tête
// (supposé fuyant vers l'arrière : la photo n'en montre aucune surface), fixation du boîtier sur le montant (platine
// supposée), tablette qui porte la télécommande (supposée : la télécommande cache tout ce qui la tient), dessous de
// la télécommande, partie droite et dos de l'appareil de droite, bouts des câbles.
// Pas modélisé : le manche entouré de ruban rouge et la barre rouge derrière la télécommande, le siège ou pneu noir,
// le grillage, les madriers et le plancher (pas de la console, ou rien ne dit qu'ils en soient).
//
// ÉCHELLE (aucune cote donnée ; précision de l'ordre de 15 à 20 %) : le coup-de-poing de l'arrêt d'urgence, pris à
// Ø 40 mm (taille courante), fait 26 px sur la photo ; il donne les huit leviers au pas de 39 mm et une télécommande
// d'environ 0,45 m de large hors pare-chocs (ordre de grandeur d'un émetteur ventral à 6-8 leviers). Le boîtier est
// de la largeur de la télécommande (0,46 m) ; sa fenêtre de 0,355 × 0,235 m est celle d'un écran de 15 po environ.
// Hauteurs et places : caméra du photographe retrouvée sur les quatre coins de la face inclinée, le coin avant gauche
// de la plaque et le pied du montant (sténopé sans roulis, champ vertical imposé à 45° : la photo est sans doute
// recadrée ; écart moyen ≈ 12 px), puis rendu comparé à la photo à la même vue : boîtier de 0,50 à 1,0 m du sol,
// télécommande à environ 0,56 m, 0,3 m devant le boîtier, tournée de 15° et penchée de 30° vers l'opérateur.
// Vue du photographe (repère local) : œil à [0,875 ; 1,36 ; 1,586], visée [0,27 ; 0,772 ; 0,733], champ 45°.
// Reste douteux : la profondeur de la plaque et la place du montant sous le boîtier (le rendu le met ≈ 15 px à
// gauche de la photo), la pente et le lacet de la télécommande.
//
// REPÈRE LOCAL : origine au sol, sous le centre du montant (dessous de la plaque de base) ; X vers la droite de
// l'opérateur (largeur du boîtier) ; Y vers le haut ; Z VERS L'OPÉRATEUR : fenêtre, télécommande et commandes sont
// tournées vers +Z. Pose dans la racine : ROOT.CONSOLE de layout.js.
import * as THREE from 'three';
import { mat, withFinish } from '../../../viewer/materials.js';
import { creaseNormals } from '../../../viewer/shapes.js';

const deg = Math.PI / 180;

// ------------------------------------------------------------------ cotes (m, estimées)
// Pied : plaque à bords tombés, montant carré, goussets dans le plan de la largeur, de part et d'autre du montant.
export const PIED = {
  plaque: { w: 0.62, z0: -0.24, z1: 0.24, t: 0.006, pli: 0.03 }, // dessus de la plaque à y = pli
  montant: { a: 0.09, t: 0.003, y1: 0.5 }, // tube carré 90 × 90 en tôle de 3 mm, jusque sous le boîtier
  gousset: { w: 0.13, h: 0.17, t: 0.008 },
};
// Boîtier : caisson du bas et tête ; profil de la tête dans le plan (z, y).
export const BOITIER = {
  w: 0.46, y0: 0.5, yJ: 0.7, z0: -0.15, z1: 0.15, // caisson ; yJ : joint caisson / tête
  levre: [0.18, 0.735], // bas de la face inclinée (z, y) : lèvre de 35 mm qui déborde de 30 mm sur le caisson
  haut: [0.02, 1.0], // haut de la face inclinée (31° sur la verticale)
  dos: [-0.15, 0.9], // arête du dos : dessus fuyant vers l'arrière (non vu)
  cadre: 0.016, // épaisseur du cadre de la fenêtre (profondeur de la fenêtre)
  // Fenêtre dans le plan de la face (u le long de la largeur, depuis le milieu ; v depuis le bas de la face).
  fen: { u0: -0.185, u1: 0.17, v0: 0.03, v1: 0.265 },
};
// Télécommande, dans son repère : origine sous le milieu de la coque, X largeur, Y haut, Z vers l'opérateur.
export const TELEC = {
  w: 0.38, d: 0.22, hArr: 0.06, hAv: 0.045, // coque : pont du haut (arrière) et pont du bas (avant)
  pas: 0.039, n: 8, zLev: -0.05, // leviers à palette
  pos: [0.05, 0.56, 0.46], pente: 30 * deg, lacet: -15 * deg, // pose dans le repère de la console (pente : avant plus bas)
};
// Appareil de droite (vu en partie) : boîtier noir, face vers l'avant droit.
export const APPAREIL = { w: 0.17, h: 0.25, e: 0.05, pos: [0.31, 0.705, 0.11], lacet: 32 * deg, recul: 12 * deg };

// ------------------------------------------------------------------ matériaux hors palette (créés une fois)
const MATS = {};
function m(nom) {
  if (MATS[nom]) return MATS[nom];
  const def = {
    gris: [0xb6b8b2, 'paintSatin', { tint: 0.16, fine: 0.04, wave: 0.012 }], // gris clair défraîchi du boîtier
    ecran: [0x2b3340, 'plastic', null], // fond de la fenêtre
    orange: [0xd8742a, 'paint', null],
    bleu: [0x2848a8, 'paint', null],
    rouge: [0xc8242a, 'paint', null],
    blanc: [0xe8e4d8, 'paint', null],
    papier: [0xd9d2bc, 'rubber', null],
    brun: [0x8a5a3a, 'paint', null],
    violet: [0x5a3a7a, 'paint', null],
    beige: [0xd8c8a0, 'paint', null],
    kaki: [0x8f8a68, 'paintSatin', null], // patte de l'appareil (teinte relevée sur la photo)
  }[nom];
  const mm = new THREE.MeshPhysicalMaterial({ color: def[0], roughness: 0.55, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.5 });
  mm.polygonOffset = true; mm.polygonOffsetFactor = 1; mm.polygonOffsetUnits = 1;
  mm.name = `console-${nom}`;
  if (def[1]) withFinish(mm, def[1], def[2]);
  return (MATS[nom] = mm);
}

// ------------------------------------------------------------------ outils

/** Volume fermé passant par des sections (polygones fermés [[x, y, z], …] de même nombre de points). */
function loftGeo(sections, crease = 35 * deg) {
  const n = sections[0].length;
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  for (let i = 0; i < sections.length - 1; i++) {
    const A = sections[i], B = sections[i + 1];
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      tri(A[j], A[k], B[k]);
      tri(A[j], B[k], B[j]);
    }
  }
  const bouche = (ring, sens) => {
    const c = [0, 0, 0];
    ring.forEach((p) => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      if (sens) tri(c, ring[k], ring[j]); else tri(c, ring[j], ring[k]);
    }
  };
  bouche(sections[0], true);
  bouche(sections[sections.length - 1], false);
  let vol = 0;
  for (let i = 0; i < pos.length; i += 9) {
    vol += pos[i] * (pos[i + 4] * pos[i + 8] - pos[i + 5] * pos[i + 7])
      - pos[i + 1] * (pos[i + 3] * pos[i + 8] - pos[i + 5] * pos[i + 6])
      + pos[i + 2] * (pos[i + 3] * pos[i + 7] - pos[i + 4] * pos[i + 6]);
  }
  if (vol < 0) for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return creaseNormals(geo, crease);
}
const loft = (sections, matiere, crease) => new THREE.Mesh(loftGeo(sections, crease), mat(matiere));

/** Points d'une courbe plane (x, z) lissée, n points répartis à pas égal. */
function chemin(pts, n) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  return c.getSpacedPoints(n - 1).map((p, i, a) => {
    const t = c.getTangentAt(i / (a.length - 1));
    return { x: p.x, z: p.z, nx: t.z, nz: -t.x, t: i / (a.length - 1) }; // normale à droite du sens de parcours
  });
}

export default function P026(api) {
  const S = api.S, { box, cyl, lathe, at, group, extrude, plate, weld, cable, bolt } = S;
  const P = PIED, B = BOITIER, T = TELEC, A = APPAREIL;

  /** Objet construit dans un plan local (x, y ; épaisseur selon z) posé par sa base : X → ax, Y → ay, origine o. */
  const pose = (obj, ax, ay, o) => {
    const a = new THREE.Vector3(...ax).normalize(), b = new THREE.Vector3(...ay).normalize();
    const g = group(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(a, b, new THREE.Vector3().crossVectors(a, b)));
    g.position.set(...o);
    return g;
  };
  const rrect = (w, h, r, n = 4) => { // rectangle à coins arrondis centré
    const pts = [];
    const c = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
    for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) { const a = (a0 + (90 * i) / n) * deg; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  };
  const ovale = (rx, ry, n = 20) => Array.from({ length: n }, (_, i) => [rx * Math.cos((i / n) * 2 * Math.PI), ry * Math.sin((i / n) * 2 * Math.PI)]);
  const pastille = (r, mat1, { bord = null, coeur = null, forme = null } = {}) => { // autocollant mince, face vers +Z
    const g = group();
    const contour = forme || ovale(r, r, 24);
    g.add(extrude(contour, 0.0008, bord ? m(bord) : m(mat1), { center: false }));
    if (bord) g.add(at(extrude(contour.map(([x, y]) => [x * 0.78, y * 0.78]), 0.0008, m(mat1), { center: false }), [0, 0, 0.0004]));
    if (coeur) g.add(at(extrude(contour.map(([x, y]) => [x * 0.38, y * 0.38]), 0.0008, m(coeur), { center: false }), [0, 0, 0.0008]));
    return g;
  };

  // ================================================================== PIED
  const pl = P.plaque, zc = (pl.z0 + pl.z1) / 2, d = pl.z1 - pl.z0;
  // 1 — Plaque de base : tôle à bords tombés de 30 mm sur les quatre côtés (le bord avant clair de la photo), deux
  // trous d'ancrage (un point sombre à gauche du montant sur la photo ; celui de droite est supposé).
  {
    const g = group(at(plate(pl.w, d, pl.t, 'zinc', { holes: [[-0.24, 0, 0.009], [0.24, 0, 0.009]], r: 0.008 }), [0, pl.pli - pl.t / 2, zc]));
    for (const s of [-1, 1]) {
      g.add(box(pl.w, pl.pli - pl.t, pl.t, 'zinc', { pos: [0, (pl.pli - pl.t) / 2, zc + s * (d / 2 - pl.t / 2)] }));
      g.add(box(pl.t, pl.pli - pl.t, d - 2 * pl.t, 'zinc', { pos: [s * (pl.w / 2 - pl.t / 2), (pl.pli - pl.t) / 2, zc] }));
    }
    api.part('1', g, [0, -0.06, 0]);
  }
  // 2 — Montant : tube carré en tôle pliée (coins arrondis des plis), soudé sur la plaque ; platine sous le boîtier
  // (supposée : la photo ne montre pas la fixation).
  const mo = P.montant;
  {
    const ext = rrect(mo.a, mo.a, 0.006), int = rrect(mo.a - 2 * mo.t, mo.a - 2 * mo.t, 0.003);
    const h = mo.y1 - pl.pli - 0.008;
    const tubeM = at(extrude(ext, h, 'zinc', { holes: [int], center: false }), [0, pl.pli, 0], [-Math.PI / 2, 0, 0]);
    const g = group(tubeM, box(0.16, 0.008, 0.16, 'zinc', { r: 0.002, pos: [0, mo.y1 - 0.004, 0] }));
    g.add(weld([[-mo.a / 2, pl.pli, mo.a / 2 + 0.002], [mo.a / 2, pl.pli, mo.a / 2 + 0.002]], 0.005, 'zinc'));
    api.part('2', g, [0, 0.12, 0]);
  }
  // 3 — Goussets triangulaires (×2) dans le plan de la largeur, de part et d'autre du montant, coin intérieur
  // dégagé pour les soudures ; cordons le long du montant et de la plaque.
  for (const s of [-1, 1]) {
    const gu = P.gousset, x0 = mo.a / 2;
    const tri = [[0, 0.012], [0.012, 0], [gu.w, 0], [0.012, gu.h], [0, gu.h]].map(([u, v]) => [s * (x0 + u), pl.pli + v]);
    const g = group(extrude(s > 0 ? tri : tri.slice().reverse(), gu.t, 'zinc'));
    g.add(weld([[s * x0, pl.pli + 0.015, gu.t / 2 + 0.002], [s * x0, pl.pli + gu.h, gu.t / 2 + 0.002]], 0.005, 'zinc'));
    g.add(weld([[s * (x0 + 0.015), pl.pli + 0.002, gu.t / 2 + 0.002], [s * (x0 + gu.w), pl.pli + 0.002, gu.t / 2 + 0.002]], 0.005, 'zinc'));
    api.part('3', g, [s * 0.1, 0.06, 0]);
  }

  // ================================================================== BOÎTIER
  // Repère de la face inclinée : origine au milieu du bas de la face (devant la tête), u le long de X, v vers le
  // haut de la face, n vers l'extérieur (avant-haut).
  const [lz, ly] = B.levre, [hz, hy] = B.haut;
  const L = Math.hypot(hz - lz, hy - ly);
  const vF = [0, (hy - ly) / L, (hz - lz) / L], nF = [0, (lz - hz) / L, (hy - ly) / L];
  const surF = (u, v, n = 0) => [u, ly + v * vF[1] + n * nF[1], lz + v * vF[2] + n * nF[2]];
  const poseF = (obj, u, v, n) => pose(obj, [1, 0, 0], vF, surF(u, v, n));
  const EB = [0, 0.18, 0], ET = [0, 0.34, 0]; // éclatés du caisson et de la tête
  const add3 = (a, b, k = 1) => a.map((c, i) => c + b[i] * k);
  const EF = add3(ET, nF, 0.16); // cadre sorti le long de la normale de la face

  // 4 — Caisson du bas : boîte de tôle grise à arêtes pliées ; dos, flanc gauche et dessous non vus.
  {
    const h = B.yJ - B.y0;
    const g = group(box(B.w, h - 0.004, B.z1 - B.z0, m('gris'), { r: 0.006, pos: [0, B.y0 + h / 2 - 0.002, (B.z0 + B.z1) / 2] }));
    api.part('4', g, EB);
  }
  // 5 — Tête : profil latéral extrudé sur la largeur (lèvre basse, face inclinée, dessus fuyant vers l'arrière),
  // fond de la fenêtre (écran, non vu derrière les reflets de la vitre).
  {
    const prof = [[B.z0, B.yJ], [lz, B.yJ], [lz, ly], [hz - B.cadre * nF[2], hy - B.cadre * nF[1]], [hz - 0.03, hy], [B.dos[0], B.dos[1]]];
    // Profil (z, y) dans le plan local XY, extrudé selon −X après la pose.
    const g = group(pose(extrude(prof.map(([z, y]) => [z, y]), B.w, m('gris'), { bevel: 0.002 }), [0, 0, 1], [0, 1, 0], [0, 0, 0]));
    // La face extrudée est à 16 mm sous le cadre : la face de la tête est reculée de l'épaisseur du cadre.
    const f = B.fen;
    g.add(poseF(box(f.u1 - f.u0, f.v1 - f.v0, 0.004, m('ecran')), (f.u0 + f.u1) / 2, (f.v0 + f.v1) / 2, -B.cadre + 0.001));
    api.part('5', g, ET);
  }
  // 6 — Cadre de la fenêtre : tôle de 16 mm d'épaisseur apparente (bord rabattu), ouverture de 355 × 235 mm.
  {
    const f = B.fen;
    const ext = [[-B.w / 2, 0], [B.w / 2, 0], [B.w / 2, L], [-B.w / 2, L]];
    const trou = rrect(f.u1 - f.u0, f.v1 - f.v0, 0.01).map(([x, y]) => [x + (f.u0 + f.u1) / 2, y + (f.v0 + f.v1) / 2]);
    const g = poseF(extrude(ext, B.cadre, m('gris'), { holes: [trou], center: false, bevel: 0.0015 }), 0, 0, -B.cadre);
    api.part('6', g, EF);
  }
  // 7 — Vis dorées aux quatre coins du cadre (places relevées sur la photo : pas tout à fait symétriques).
  const VIS = [[-0.17, 0.296], [0.19, 0.268], [-0.205, 0.022], [0.088, 0.017]];
  for (const [u, v] of VIS) {
    const t = lathe([[0, 0], [0.0062, 0], [0.0062, 0.0015], [0.0045, 0.0035], [0, 0.0038]], 'brass', { seg: 18 });
    api.part('7', poseF(at(group(t), [0, 0, 0], [Math.PI / 2, 0, 0]), u, v, 0), add3(EF, nF, 0.07));
  }
  // 8 — Vitre de la fenêtre, contre le dos du cadre.
  {
    const f = B.fen;
    api.part('8', poseF(box(f.u1 - f.u0 + 0.016, f.v1 - f.v0 + 0.016, 0.004, 'glass'), (f.u0 + f.u1) / 2, (f.v0 + f.v1) / 2, -B.cadre + 0.004),
      add3(ET, nF, 0.08));
  }
  // 9 à 12 — Autocollants (illisibles : couleurs seulement) et étiquettes de papier, collés sur le cadre.
  const sur = (obj, u, v) => poseF(obj, u, v, 0.0002);
  api.part('9', sur(pastille(0.021, 'orange', { bord: 'blanc', coeur: 'beige' }), -0.207, 0.235), add3(EF, nF, 0.03));
  const ecu = [[0, 0.02], [0.019, 0.011], [0.017, -0.01], [0, -0.02], [-0.017, -0.01], [-0.019, 0.011]];
  api.part('10', sur(pastille(0.02, 'bleu', { bord: 'blanc', forme: ecu }), 0.2, 0.232), add3(EF, nF, 0.03));
  api.part('11', sur(pastille(0.025, 'rouge', { bord: 'blanc', coeur: 'blanc' }), 0.2, 0.045), add3(EF, nF, 0.03));
  for (const [u, v, w] of [[-0.135, 0.298, 0.05], [-0.14, 0.283, 0.06]]) {
    api.part('12', sur(extrude(rrect(w, 0.013, 0.001), 0.0005, m('papier'), { center: false }), u, v), add3(EF, nF, 0.03));
  }
  // 13 — Presse-étoupe du flanc droit du caisson et câble vers l'appareil de droite.
  const GLAND = [B.w / 2, 0.6, 0.07];
  const aPose = (p) => { // point du repère de l'appareil (origine au milieu de son dos, X largeur, Y haut, Z face) → console
    const v = new THREE.Vector3(...p).applyEuler(new THREE.Euler(-A.recul, A.lacet, 0, 'YXZ'));
    return [v.x + A.pos[0], v.y + A.pos[1], v.z + A.pos[2]];
  };
  {
    const pe = lathe([[0, 0], [0.016, 0], [0.016, 0.006], [0.0125, 0.008], [0.0125, 0.02], [0.009, 0.026], [0, 0.026]], 'plastic', { seg: 6 });
    const dest = aPose([-0.06, -A.h / 2 + 0.02, -0.004]);
    const c = cable([[GLAND[0] + 0.026, GLAND[1], GLAND[2]], [GLAND[0] + 0.06, GLAND[1] - 0.02, GLAND[2] + 0.005],
      [dest[0] - 0.02, dest[1] - 0.04, dest[2] - 0.02], dest], 0.0065);
    api.part('13', group(at(pe, GLAND, [0, 0, -Math.PI / 2]), c), add3(EB, [0.08, 0, 0]));
  }
  // 14 — Gros câble noir : entre par le dessus fuyant de la tête, à gauche, et monte vers l'arrière (seul le tronçon
  // de la photo est modélisé : il sort du cadre en haut).
  {
    const e = [-0.15, 0.94, -0.08];
    const pe = lathe([[0, 0], [0.03, 0], [0.03, 0.008], [0.024, 0.012], [0.024, 0.03], [0, 0.03]], 'plastic', { seg: 6 });
    const c = S.tube([e, [-0.155, 1.05, -0.15], [-0.18, 1.25, -0.25], [-0.22, 1.5, -0.31]], 0.018, 'hose', { ends: 'none', radial: 14 });
    api.part('14', group(at(pe, [e[0], e[1] - 0.012, e[2]], [-0.75, 0, 0]), c), add3(ET, [0, 0.12, -0.1]));
  }

  // ================================================================== TÉLÉCOMMANDE
  // Pose : pente vers l'opérateur (avant plus bas), puis lacet. Éclatés : la télécommande sort de sa tablette vers
  // l'opérateur ; ses pièces s'en écartent encore.
  const ET2 = [0, 0.14, 0.4];
  const tPose = (obj) => {
    const inner = group(obj); inner.rotation.x = T.pente;
    const outer = group(inner); outer.rotation.y = T.lacet; outer.position.set(...T.pos);
    return outer;
  };
  const tDir = (v) => new THREE.Vector3(...v).applyEuler(new THREE.Euler(T.pente, T.lacet, 0, 'YXZ')).toArray();
  const zA = -T.d / 2, zV = T.d / 2, zM = -0.005; // arrière, avant, marche entre les deux ponts

  // 15 — Tablette (supposée, non vue) : tôle à bords relevés sous la télécommande, portée par deux bras en tube carré
  // vissés sur la face avant du caisson (la photo ne montre rien de ce qui tient la télécommande).
  {
    const tPt = (p) => add3(T.pos, tDir(p));
    const g = group(tPose(group(box(T.w + 0.03, 0.005, T.d + 0.03, 'zinc', { r: 0.002, pos: [0, -0.0025, 0] }),
      box(T.w + 0.03, 0.02, 0.004, 'zinc', { r: 0.001, pos: [0, 0.005, zA - 0.017] }))));
    for (const x of [-0.13, 0.13]) {
      const a = tPt([x, -0.012, zA + 0.04]);
      const b = [a[0], a[1] + 0.02, B.z1 + 0.004];
      g.add(S.rod(a, b, 0.012, 'zinc', 4));
      g.add(box(0.05, 0.06, 0.006, 'zinc', { r: 0.002, pos: [b[0], b[1], B.z1 + 0.003] }));
      for (const dy of [-0.018, 0.018]) g.add(at(bolt(0.006, 0.012, 'steel', { axis: 'z' }), [b[0], b[1] + dy, B.z1 + 0.006]));
    }
    api.part('15', g, [0, -0.06, 0.18]);
  }
  // 16 — Coque noire : corps à deux ponts (leviers en haut à l'arrière, coup-de-poing et interrupteurs en bas à
  // l'avant), bandeau arqué derrière les leviers qui redescend sur les flancs, filet jaune imprimé le long du bandeau.
  const BANDEAU = chemin([[-0.19, 0.075], [-0.198, -0.02], [-0.17, -0.085], [0, -0.112], [0.17, -0.085], [0.198, -0.02], [0.19, 0.075]], 41);
  const PENCH = 0.035; // le bandeau penche vers l'extérieur de 35 mm à son sommet
  const hBand = (t) => 0.066 + 0.056 * Math.pow(Math.sin(Math.PI * t), 0.5); // dessus du bandeau
  const sectBand = (p, ep = 0.012, y0 = 0.035) => {
    const yt = hBand(p.t), pench = PENCH * Math.sin(Math.PI * p.t); // penché vers l'extérieur en haut
    const ix = p.x, iz = p.z, ox = p.x + p.nx * ep, oz = p.z + p.nz * ep;
    return [[ix, y0, iz], [ix + p.nx * pench, yt, iz + p.nz * pench], [ox + p.nx * pench, yt, oz + p.nz * pench], [ox, y0, oz]];
  };
  // Normale du chemin vers l'extérieur : le chemin tourne dans le sens horaire vu de dessus (x → −z → x).
  BANDEAU.forEach((p) => { const s = (p.x * p.nx + p.z * p.nz) < 0 ? -1 : 1; p.nx *= s; p.nz *= s; });
  {
    const g = group(
      box(T.w, T.hArr, zM - zA, 'plastic', { r: 0.008, pos: [0, T.hArr / 2, (zA + zM) / 2] }),
      box(T.w - 0.01, T.hAv, zV - zM, 'plastic', { r: 0.008, pos: [0, T.hAv / 2, (zM + zV) / 2] }),
      loft(BANDEAU.map((p) => sectBand(p)), 'plastic'),
    );
    // Filet jaune sur la face intérieure du bandeau (deux tronçons de part et d'autre de la fenêtre des voyants).
    for (const side of [-1, 1]) {
      const pts = BANDEAU.filter((p) => side * p.x > 0.06 && side * p.x < 0.185).map((p) => {
        const y = 0.6 * hBand(p.t) + 0.4 * 0.035;
        const k = PENCH * Math.sin(Math.PI * p.t) * ((y - 0.035) / (hBand(p.t) - 0.035)) - 0.0012;
        return [p.x + p.nx * k, y, p.z + p.nz * k];
      });
      g.add(S.tube(pts, 0.0011, 'safety', { ends: 'none', radial: 5, seg: 24 }));
    }
    // Rainures des modules de leviers (plaque de fond du pont du haut).
    g.add(box(T.n * T.pas + 0.01, 0.004, 0.09, 'blackCast', { pos: [0, T.hArr + 0.002, T.zLev - 0.005] }));
    api.part('16', tPose(g), ET2);
  }
  // 17 — Pare-chocs rouges (×2) : aile sur chaque flanc, plus forte vers l'avant, qui revient sous le bord avant
  // jusqu'au milieu.
  for (const s of [-1, 1]) {
    const ch = chemin([[s * 0.2, -0.105], [s * 0.214, -0.02], [s * 0.205, 0.08], [s * 0.15, 0.118], [s * 0.004, 0.122]], 30);
    // Normale vers l'extérieur de la coque.
    ch.forEach((p) => { if (p.x * p.nx + p.z * p.nz < 0) { p.nx *= -1; p.nz *= -1; } });
    const sectO = ch.map((p) => {
      const ep = 0.022 + 0.014 * Math.sin(Math.PI * Math.min(1, p.t * 1.4)) - 0.02 * Math.max(0, p.t - 0.6) / 0.4;
      const y0 = -0.004, y1 = 0.032 + 0.018 * Math.sin(Math.PI * Math.min(1, p.t * 1.3)) - 0.022 * Math.max(0, p.t - 0.6) / 0.4;
      const o = (y, e) => [p.x + p.nx * e, y, p.z + p.nz * e];
      return [o(y0, -0.006), o(y1, -0.006), o(y1, ep * 0.55), o((y0 + y1) / 2 + 0.006, ep), o(y0, ep * 0.75)];
    });
    api.part('17', tPose(loft(sectO, 'red', 50 * deg)), add3(ET2, [s * 0.2, 0, 0]));
  }
  // 18 — Leviers à palette (×8) au pas de 39 mm : module noir à deux voyants ambre, soufflet, palette penchée vers
  // l'arrière à bout élargi.
  for (let i = 0; i < T.n; i++) {
    const x = (i - (T.n - 1) / 2) * T.pas;
    const y0 = T.hArr + 0.004;
    const g = group(box(T.pas - 0.004, 0.012, 0.075, 'blackCast', { r: 0.002, pos: [0, y0 + 0.006, T.zLev + 0.002] }));
    for (const dz of [0.022, 0.032]) g.add(box(0.005, 0.0015, 0.004, 'lampAmber', { pos: [-0.009, y0 + 0.0125, T.zLev + dz] }));
    g.add(box(0.02, 0.012, 0.016, 'rubber', { r: 0.003, pos: [0, y0 + 0.018, T.zLev - 0.012] }));
    const pal = extrude([[-0.011, 0], [0.011, 0], [0.014, 0.04], [0.014, 0.05], [0.01, 0.055], [-0.01, 0.055], [-0.014, 0.05], [-0.014, 0.04]], 0.009, 'plastic', { bevel: 0.0015 });
    const pg = at(group(pal), [0, y0 + 0.02, T.zLev - 0.012], [-14 * deg, 0, 0]);
    g.add(pg);
    at(g, [x, 0, 0]);
    api.part('18', tPose(g), add3(ET2, [0, 0.16, -0.04]));
  }
  // 19 — Fenêtre des voyants au centre du bandeau : plaque sombre vissée, cinq barres de voyants, deux plages
  // ovales, pastille du logo (jaune et blanche : lettres illisibles, non reproduites).
  {
    const pc = BANDEAU[20];
    const yc = (0.035 + hBand(0.5)) / 2 + 0.006;
    const g = group(extrude(rrect(0.1, 0.06, 0.004), 0.003, 'gunmetal', { center: false }));
    for (let k = 0; k < 5; k++) g.add(at(box(0.004, 0.012, 0.0012, 'white'), [-0.012 + k * 0.008, 0.016, 0.003], [0, 0, -25 * deg]));
    for (const [x, y] of [[-0.02, -0.002], [0.012, -0.002], [-0.02, -0.014], [0.012, -0.014]]) g.add(at(extrude(rrect(0.022, 0.007, 0.0035), 0.001, 'charcoal', { center: false }), [x, y, 0.003]));
    const logo = group(at(extrude(ovale(0.006, 0.007, 16).map(([x, y]) => [x - 0.004, y]), 0.001, 'white', { center: false }), [0, 0, 0]),
      at(extrude(ovale(0.006, 0.007, 16).map(([x, y]) => [x + 0.004, y]), 0.001, 'safety', { center: false }), [0, 0, 0.0004]));
    g.add(at(logo, [0.0, -0.028 + 0.003, 0.003]));
    for (const [x, y] of [[-0.045, 0.024], [0.045, 0.024]]) g.add(at(cyl(0.0022, 0.0015, 'steel', { axis: 'z', seg: 10 }), [x, y, 0.0035]));
    // Plaque posée sur la face intérieure du bandeau, penchée comme lui.
    const tilt = Math.atan2(PENCH, hBand(0.5) - 0.035);
    const o = group(g); o.rotation.x = -tilt;
    api.part('19', tPose(at(group(o), [pc.x, yc, pc.z + 0.006 + PENCH * ((yc - 0.035) / (hBand(0.5) - 0.035)) * -1])), add3(ET2, [0, 0.14, -0.1]));
  }
  // Pont du bas : bloc gris de l'arrêt d'urgence (liseré rouge à droite).
  const yB = T.hAv;
  // 20 — Arrêt d'urgence : coup-de-poing rouge Ø 40 mm sur embase jaune (échelle du modèle).
  {
    const g = group(box(0.105, 0.012, 0.075, 'gunmetal', { r: 0.004, pos: [-0.043, yB + 0.006, 0.055] }),
      box(0.004, 0.014, 0.075, 'red', { r: 0.0015, pos: [0.011, yB + 0.007, 0.055] }));
    const e = group(lathe([[0, 0], [0.024, 0], [0.024, 0.004], [0.021, 0.006], [0.018, 0.006], [0.018, 0.016], [0, 0.016]], 'safety', { seg: 28 }),
      at(lathe([[0, 0], [0.012, 0], [0.012, 0.008], [0.02, 0.009], [0.02, 0.013], [0.017, 0.018], [0.009, 0.0205], [0, 0.021]], 'red', { seg: 28 }), [0, 0.014, 0]));
    g.add(at(e, [-0.046, yB + 0.012, 0.058]));
    api.part('20', tPose(g), add3(ET2, [0, 0.21, 0.05]));
  }
  // 21 — Bouton-poussoir vert (à gauche du coup-de-poing).
  api.part('21', tPose(at(group(lathe([[0, 0], [0.011, 0], [0.011, 0.004], [0.008, 0.005], [0.008, 0.011], [0.007, 0.013], [0, 0.013]], 'green', { seg: 20 })),
    [-0.078, yB + 0.012, 0.068])), add3(ET2, [0, 0.18, 0.05]));
  // 22 — Interrupteurs à manette à bouton noir (×5) : deux à gauche, trois à droite.
  for (const [x, z] of [[-0.14, 0.04], [-0.112, 0.072], [0.03, 0.07], [0.062, 0.062], [0.096, 0.055]]) {
    const g = group(cyl(0.008, 0.004, 'steel', { seg: 6, pos: [0, yB + 0.002, 0] }), cyl(0.0022, 0.02, 'steel', { pos: [0, yB + 0.013, 0] }),
      lathe([[0, 0], [0.0075, 0], [0.0075, 0.016], [0.006, 0.019], [0, 0.019]], 'plastic', { seg: 16, pos: [0, yB + 0.019, 0] }));
    api.part('22', tPose(at(g, [x, 0, z])), add3(ET2, [0, 0.18, 0.05]));
  }
  // 23 — Bouton rond noir (à droite du coup-de-poing ; fonction non lisible).
  api.part('23', tPose(at(group(lathe([[0, 0], [0.016, 0], [0.016, 0.003], [0.013, 0.008], [0.007, 0.012], [0, 0.0125]], 'rubber', { seg: 22 })),
    [-0.004, yB + 0.012, 0.07])), add3(ET2, [0, 0.18, 0.05]));
  // 24 — Arceau avant en tôle inox : plaque devant le pont du bas, du bout gauche jusqu'au milieu, deux montants
  // relevés aux bouts (percés ; patte coudée à droite).
  const ARC_Z = zV + 0.024;
  {
    const prof = [[-0.21, -0.012], [0.036, -0.012], [0.036, 0.075], [0.03, 0.085], [0.018, 0.085], [0.012, 0.075], [0.012, 0.045], [-0.186, 0.045],
      [-0.186, 0.088], [-0.192, 0.098], [-0.204, 0.098], [-0.21, 0.088]];
    const g = group(extrude(prof, 0.003, 'steel', { holes: [[-0.198, 0.084, 0.004], [0.024, 0.072, 0.004]] }));
    g.add(at(box(0.012, 0.003, 0.018, 'steel', { r: 0.001 }), [0.024, 0.085, -0.009]));
    const o = group(g); o.rotation.x = -10 * deg;
    api.part('24', tPose(at(group(o), [0, 0, ARC_Z])), add3(ET2, [0, -0.03, 0.2]));
  }
  // 25 — Autocollants de l'arceau (×3, illisibles).
  {
    const L3 = [[-0.168, 0.022, 'brun', 'beige', 0.022, 0.011], [-0.09, 0.016, 'beige', 'violet', 0.016, 0.019], [-0.02, 0.012, 'beige', 'rouge', 0.024, 0.01]];
    for (const [x, y, a, b, rx, ry] of L3) {
      const st = group(extrude(ovale(rx, ry), 0.0006, m(a), { center: false }), at(extrude(ovale(rx * 0.6, ry * 0.55), 0.0006, m(b), { center: false }), [0, 0, 0.0004]));
      const o = group(at(st, [x, y, 0.0016])); o.rotation.x = -10 * deg;
      api.part('25', tPose(at(group(o), [0, 0, ARC_Z])), add3(ET2, [0, -0.03, 0.26]));
    }
  }

  // ================================================================== APPAREIL DE DROITE (vu en partie)
  const EA = add3(EB, [0.28, 0, 0.05]);
  const aObj = (obj) => {
    const g = group(obj);
    g.rotation.set(-A.recul, A.lacet, 0, 'YXZ');
    g.position.set(...A.pos);
    return g;
  };
  // 26 — Boîtier noir à afficheur, colonne de sept touches à gauche (quatre, une plage claire, trois).
  {
    const g = group(box(A.w, A.h, A.e, 'blackCast', { r: 0.006, pos: [0, 0, A.e / 2] }));
    g.add(box(A.w - 0.05, A.h - 0.04, 0.003, m('ecran'), { pos: [0.017, 0, A.e + 0.0005] }));
    const ys = [0.08, 0.06, 0.04, 0.02, -0.035, -0.055, -0.075];
    for (const y of ys) g.add(at(cyl(0.005, 0.004, 'rubber', { axis: 'z', seg: 14 }), [-A.w / 2 + 0.015, y, A.e + 0.001]));
    g.add(box(0.012, 0.022, 0.0012, 'grey', { pos: [-A.w / 2 + 0.015, -0.006, A.e + 0.0005] }));
    // Presse-étoupes des deux câbles, sous l'appareil.
    for (const x of [-0.05, -0.02]) g.add(at(lathe([[0, 0], [0.01, 0], [0.01, 0.008], [0.007, 0.014], [0, 0.014]], 'plastic', { seg: 6 }), [x, -A.h / 2, A.e * 0.45], [Math.PI, 0, 0]));
    api.part('26', aObj(g), EA);
  }
  // 27 — Patte support : fer plat (teinte kaki de la photo) vissé sur le flanc droit du caisson, retour sous l'appareil.
  {
    const p0 = [B.w / 2 + 0.003, 0.66, 0.11];
    const g = group(box(0.006, 0.17, 0.035, m('kaki'), { r: 0.001, pos: p0 }));
    const a = aPose([-A.w / 2 + 0.02, 0, -0.003]);
    g.add(S.rod([p0[0] + 0.003, 0.72, p0[2]], a, 0.006, m('kaki'), 6));
    g.add(S.rod([p0[0] + 0.003, 0.6, p0[2]], aPose([-A.w / 2 + 0.02, -0.07, -0.003]), 0.006, m('kaki'), 6));
    for (const y of [0.6, 0.69]) g.add(at(bolt(0.006, 0.012, 'steel', { axis: 'x' }), [p0[0] + 0.003, y, p0[2]]));
    api.part('27', g, add3(EB, [0.15, 0, 0.03]));
  }
  // 28 — Câbles noirs (×2) qui descendent de l'appareil (tronçons vus ; leur arrivée n'est pas sur la photo).
  [-0.05, -0.02].forEach((x, i) => {
    const a = aPose([x, -A.h / 2 - 0.014, A.e * 0.45]);
    const pts = [a, [a[0] + 0.01, a[1] - 0.08, a[2] - 0.01], [a[0] + 0.05 + i * 0.03, 0.22, a[2] - 0.12 - i * 0.04],
      [a[0] + 0.07 + i * 0.03, 0.03, a[2] - 0.32 - i * 0.05], [a[0] + 0.08 + i * 0.03, 0.009, a[2] - 0.5 - i * 0.05]];
    api.part('28', S.tube(pts, 0.008 + i * 0.002, 'hose', { ends: 'none', radial: 10 }), add3(EA, [0.06, -0.05, 0]));
  });

  return { view: { dir: [0.6, 0.6, 0.85] } }; // à peu près l'angle de la photo
}
