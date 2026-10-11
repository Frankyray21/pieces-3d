// Cotes et fonctions communes du lot « pont avant » du DU311 sur roues
// (P334 groupe de pompage, P338 / P340 / P346 pompe à eau, P356 / P360
// injection de graisse, P392 raccords du refroidisseur, P214 tôles de
// protection, P216 tuyauterie d'air, P332 couvercle du pont avant).
// Fichier préfixé « _ » : pas un assemblage.
//
// Emplacements dans le repère machine (../layout.js : origine au sol sous
// l'articulation, X vers l'avance, Y vers le haut, Z vers la droite), relevés
// sur les vues des pages 208, 210 et 212 (P208) à l'échelle des pneus et de la
// voie : le groupe de pompage est dans l'axe du châssis avant, pompes vers le
// nez ; la pompe à eau sur une tablette à droite, tête vers l'axe ; le
// réservoir de graisse en console à gauche, derrière la roue avant ; le
// refroidisseur d'huile (à eau) à gauche de la lanterne, son détendeur devant ;
// la conduite d'air de 2 po contre le flanc gauche, sortie au nez.
import { M } from '../layout.js';

export const IN = 0.0254;

// Groupe de pompage P334 : plan de la face C du moteur (x), axe de l'arbre (y, z).
// Pattes du moteur (cadre 364/5TC, hauteur d'axe 9 po) à y = PD.y − 0.2286.
export const PD = { x: 1.1, y: 0.78, z: 0, feet: 0.78 - 9 * IN };

// Pompe à eau P338 : origine du repère local (plan d'appui de la pompe, à
// l'aplomb du milieu du vilebrequin) ; X local = −X machine (vers le moteur
// hydraulique, à l'arrière), Z local = −Z machine (tête vers l'axe).
export const WP = { x: 0.8, y: M.frameTop, z: 0.36 };

// Injection de graisse P356 : dessous du fond du réservoir (repère de P358 =
// P370 du TVK, posé sans rotation), filtre-régulateur-lubrificateur devant.
export const GR = { tank: [0.6, 0.62, -0.82], frl: { y: 0.9, z: -0.61 }, wall: -0.565 };

// Refroidisseur d'huile à eau (fantôme de la page 392, hors liste) : calandre
// d'axe X, plaque à tubes et boîte à eau boulonnée à l'avant (x1), deux
// orifices d'huile 2 NPT sur le dessus, deux orifices d'eau 1 NPT sur la boîte.
export const CO = {
  x0: 0.7, x1: 1.22, y: 0.9, z: -0.29, r: 0.0635,
  oil: [0.8, 1.12], // abscisses des orifices d'huile (dessus)
  water: [0.04, -0.04], // décalage en y des orifices d'eau (haut, bas) sur la boîte à eau
};

// Conduite d'air 2 po (P216) : bride arrière (raccord du flexible à bride
// P208 repère 37) et bride avant au nez (vers la glissière).
export const PIPE = {
  r: (2.375 * IN) / 2, y: 0.85, z: -0.42, zNose: -0.15,
  rear: { pos: [0.41, 0.85, -0.33], dir: [-0.95, 0, 0.31] },
  front: { pos: [M.nose + 0.035, 0.85, -0.15], dir: [1, 0, 0] },
};

/** Oriente un objet construit le long de +Y : +Y vers dir, +X vers side (projeté). */
export function pose(THREE, obj, pos, dir, side = null) {
  const Y = new THREE.Vector3(...dir).normalize();
  let X = side ? new THREE.Vector3(...side) : (Math.abs(Y.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(Y) : new THREE.Vector3(1, 0, 0));
  X.sub(Y.clone().multiplyScalar(X.dot(Y)));
  if (X.lengthSq() < 1e-10) X = new THREE.Vector3(0, 0, 1).cross(Y);
  X.normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  g.position.set(...pos);
  return g;
}

/** Point local [x, y, z] d'un objet posé par pose(pos, dir, side) → repère du parent. */
export function posePoint(THREE, local, pos, dir, side = null) {
  const o = pose(THREE, new THREE.Group(), pos, dir, side);
  o.updateMatrix();
  return new THREE.Vector3(...local).applyMatrix4(o.matrix).toArray();
}

// ------------------------------------------------------------ raccords de tuyauterie NPT
// Ø extérieur du tube NPT (po) par taille « dash » (seizièmes de pouce).
export const NPTD = { 2: 0.405, 4: 0.54, 6: 0.675, 8: 0.84, 12: 1.05, 16: 1.315, 20: 1.66, 24: 1.9, 32: 2.375 };
const rN = (dash) => (NPTD[dash] * IN) / 2;

/** Filet NPT mâle (conique 1:16) de y0 (bout) à y1, rayon r au gros bout, côté droit d'un profil. */
export function nptThread(S, r, y0, y1) {
  return S.thread(r * 0.94, y0, y1, { r1: r, pitch: r * 0.2, maxTurns: 6 });
}

/**
 * Coude de tuyauterie 90° fonte malléable / acier forgé (FA01206 : FNPT-MNPT,
 * FA01205 : MNPT-MNPT) : entrée selon −Y (queue mâle vissée sous y = 0 ou
 * manchon femelle), sortie selon +X. Retourne { obj, out: [x, y, z] du bout,
 * c: centre du coude }.
 */
export function pipeElbow(S, dash, { inEnd = 'male', outEnd = 'female', mat = 'zinc' } = {}) {
  const r = rN(dash), rb = r * 1.32, L = r * 1.9;
  const parts = [];
  // Corps : deux manchons qui se rejoignent dans une rotule (angle arrondi).
  const yc = L;
  parts.push(S.lathe([[r * 0.8, 0], [rb, 0], [rb * 1.06, r * 0.16], [rb * 1.06, r * 0.4], [rb, r * 0.5], [rb, yc], [0, yc]], mat, { seg: 20 }));
  parts.push(S.ball(rb, mat, { pos: [0, yc, 0] }));
  const arm = S.lathe([[0, 0], [rb, 0], [rb, L - r * 0.5], [rb * 1.06, L - r * 0.4], [rb * 1.06, L - r * 0.16], [rb, L], [r * 0.8, L]], mat, { axis: 'x', seg: 20 });
  arm.position.y = yc;
  parts.push(arm);
  if (inEnd === 'male') parts.push(S.lathe([[r * 0.7, -r * 1.5], ...nptThread(S, r, -r * 1.5, 0), [r * 0.8, 0]], mat, { seg: 16 }));
  let outX = L;
  if (outEnd === 'male') {
    const m = S.lathe([[r * 0.7, 0], ...nptThread(S, r, 0, r * 1.5).map(([a, b]) => [a, r * 1.5 - b]).reverse(), [r * 0.7, r * 1.5]], mat, { axis: 'x', seg: 16 });
    m.position.set(L, yc, 0);
    parts.push(m);
    outX += r * 1.5;
  }
  return { obj: S.merged(parts, mat), out: [outX, yc, 0], c: [0, yc, 0] };
}

/**
 * Té de passage (FA01211 « PIPE RUN TEE (MNPT - FNPT/FNPT) ») : queue mâle
 * vissée sous y = 0 (selon −Y), passage selon Y (sortie femelle en haut),
 * branche femelle selon +X. Retourne { obj, top, branch } (faces des femelles).
 */
export function runTee(S, dash, { mat = 'zinc' } = {}) {
  const r = rN(dash), rb = r * 1.32, H = r * 3.6;
  const parts = [
    S.lathe([[r * 0.7, -r * 1.5], ...nptThread(S, r, -r * 1.5, 0), [r * 0.8, 0]], mat, { seg: 16 }),
    S.lathe([[r * 0.8, 0], [rb, 0], [rb, H - r * 0.5], [rb * 1.06, H - r * 0.4], [rb * 1.06, H - r * 0.16], [rb, H], [r * 0.95, H], [r * 0.95, H - r * 1.4], [0, H - r * 1.4]], mat, { seg: 20 }),
  ];
  const br = S.lathe([[0, 0], [rb, 0], [rb, H / 2 - r * 0.5], [rb * 1.06, H / 2 - r * 0.4], [rb * 1.06, H / 2 - r * 0.16], [rb, H / 2], [r * 0.95, H / 2], [r * 0.95, H / 2 - r * 1.2], [0, H / 2 - r * 1.2]], mat, { axis: 'x', seg: 20 });
  br.position.y = H / 2;
  parts.push(br);
  return { obj: S.merged(parts, mat), top: [0, H, 0], branch: [H / 2, H / 2, 0] };
}

/** Réduction six-pans mâle NPT big → femelle NPT small (FA01209), queue sous y = 0 ; retourne { obj, top }. */
export function hexBushing(S, big, small, { mat = 'zinc' } = {}) {
  const R = rN(big), r = rN(small), af = R * 2.25, h = af * 0.32;
  const parts = [
    S.lathe([[r * 0.95, -R * 1.5], ...nptThread(S, R, -R * 1.5, 0), [R * 0.95, 0], [r * 0.95, 0]], mat, { seg: 20 }),
    S.at(S.nut(af, h, mat), [0, h / 2, 0]),
    S.lathe([[r * 0.95, h * 0.02], [r * 1.25, h * 0.02], [r * 1.25, h + 0.0006], [r * 0.95, h + 0.0006]], mat, { seg: 20 }),
  ];
  return { obj: S.merged(parts, mat), top: [0, h, 0] };
}

/** Mamelon six-pans NPT a (queue sous y = 0) → NPT b (mâle vers +Y) ; retourne { obj, top } (bout). */
export function hexNipple(S, a, b = a, { mat = 'zinc' } = {}) {
  const ra = rN(a), rb = rN(b), af = Math.max(ra, rb) * 2.3, h = af * 0.42, bore = Math.min(ra, rb) * 0.6;
  const parts = [
    S.lathe([[bore, -ra * 1.5], ...nptThread(S, ra, -ra * 1.5, 0), [bore, 0]], mat, { seg: 16 }),
    S.at(S.nut(af, h, mat), [0, h / 2, 0]),
    S.lathe([[bore, h], ...nptThread(S, rb, h, h + rb * 1.5).map(([x, y]) => [x, 2 * h + rb * 1.5 - y]).reverse(), [bore, h + rb * 1.5]], mat, { seg: 16 }),
  ];
  return { obj: S.merged(parts, mat), top: [0, h + rb * 1.5, 0] };
}

/** Bouchon NPT à tête carrée pleine (FA16028), queue sous y = 0. */
export function squarePlug(S, dash, { mat = 'zinc' } = {}) {
  const r = rN(dash), a = r * 1.5;
  return S.merged([
    S.lathe([[0, -r * 1.4], ...nptThread(S, r, -r * 1.4, 0), [0, 0]], mat, { seg: 14 }),
    S.box(a, a * 0.9, a, mat, { r: a * 0.08, pos: [0, a * 0.45, 0] }),
  ], mat);
}

/**
 * Manomètre à cadran (boîtier inox embouti, lunette sertie, glace, cadran blanc,
 * graduations, aiguille) Ø 2r, raccord radial sous le boîtier (queue 1/8 ou
 * 1/4 NPT vers −Y depuis y = 0), cadran vers +Z. Centre du cadran à y = r + stem.
 */
export function dialGauge(S, THREE, r, { stem = 0.012, npt = 2 } = {}) {
  const rn = rN(npt), yc = stem + r;
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const t = (-135 + i * 27) * (Math.PI / 180), rr = r * 0.72;
    ticks.push(S.at(new THREE.Mesh(new THREE.BoxGeometry(r * 0.03, r * (i % 5 ? 0.1 : 0.18), 0.0004)), [Math.sin(t) * rr, yc + Math.cos(t) * rr, r * 0.36], [0, 0, -t]));
  }
  return S.group(
    S.lathe([[0, -r * 0.3], [r * 0.94, -r * 0.3], [r, -r * 0.24], [r, r * 0.3], [r * 1.04, r * 0.32], [r * 1.04, r * 0.4], [r * 0.9, r * 0.42], [r * 0.9, r * 0.36], [0, r * 0.36]], 'steel', { axis: 'z', seg: 32, pos: [0, yc, 0] }),
    S.lathe([[r * 0.9, r * 0.35], [0, r * 0.35]], 'white', { axis: 'z', seg: 32, pos: [0, yc, 0] }),
    S.merged(ticks, 'black'),
    S.merged([S.at(new THREE.Mesh(new THREE.BoxGeometry(r * 0.05, r * 0.72, 0.0006)), [Math.sin(0.5) * r * 0.25, yc + Math.cos(0.5) * r * 0.25, r * 0.375], [0, 0, -0.5]),
      S.cyl(r * 0.07, 0.002, 'black', { axis: 'z', seg: 12, pos: [0, yc, r * 0.375] })], 'red'),
    S.lathe([[r * 0.88, r * 0.395], [0, r * 0.395]], 'glass', { axis: 'z', seg: 32, pos: [0, yc, 0] }),
    S.merged([
      S.lathe([[0, -rn * 1.4], ...nptThread(S, rn, -rn * 1.4, 0), [0, 0]], 'brass', { seg: 12 }),
      S.at(S.nut(rn * 2.6, stem * 0.5, 'brass'), [0, stem * 0.3, 0]),
      S.cyl(rn * 0.9, stem, 'brass', { seg: 12, pos: [0, stem * 0.5 + r * 0.05, 0] }),
    ], 'brass'),
  );
}

// ------------------------------------------------------------ tôles
/**
 * Tôle plane dans le plan XZ (repère du parent), épaisseur t selon Y centrée
 * sur y = 0 : contour pts = [[x, z], ...], trous ronds holes = [[x, z, r]],
 * découpes quelconques paths = [[[x, z], ...], ...]. Arêtes cassées (≈ 1 mm).
 */
export function slab(api, pts, t, mat, { holes = [], paths = [], curve = 14 } = {}) {
  const { THREE, S } = api;
  const v = (p) => p.map(([x, z]) => new THREE.Vector2(x, -z));
  const shape = new THREE.Shape(v(pts));
  holes.forEach(([x, z, r]) => { const p = new THREE.Path(); p.absarc(x, -z, r, 0, Math.PI * 2, true); shape.holes.push(p); });
  paths.forEach((q) => shape.holes.push(new THREE.Path(v(q))));
  const mb = Math.min(0.0012, t * 0.15);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: curve });
  geo.translate(0, 0, -(t - 2 * mb) / 2);
  geo.rotateX(-Math.PI / 2);
  S.creaseNormals(geo);
  return new THREE.Mesh(geo);
}

/** Contour d'un oblong (stade) centré en (cx, cz), longueur lx selon X, largeur wz selon Z. */
export function stadium(cx, cz, lx, wz, n = 10) {
  const r = Math.min(lx, wz) / 2, along = lx >= wz;
  const h = (Math.max(lx, wz) - 2 * r) / 2;
  const pts = [];
  for (const s of [1, -1]) {
    for (let i = 0; i <= n; i++) {
      const a = (s > 0 ? -Math.PI / 2 : Math.PI / 2) + (i / n) * Math.PI;
      const u = s * h + r * Math.cos(a), w = r * Math.sin(a);
      pts.push(along ? [cx + u, cz + w] : [cx + w, cz + u]);
    }
  }
  return pts;
}

// ------------------------------------------------------------ électrovannes : faisceau de la bobine
/**
 * Repères 2 à 7 communs aux électrovannes P346 et P360 (même liste que P228
 * du TVK) : joint 1/2 NPT (3) sur le moyeu de sortie de câble de la bobine,
 * raccord de gaine 1/2 po (2), gaine annelée 3/8 po (4, douze tronçons d'un
 * pouce, liste en pouces) qui part selon dir puis s'incurve vers le bas (rayon
 * bend), gaine thermorétractable 3/4 po (7, deux tronçons d'un pouce) sur la
 * jonction avec le connecteur femelle à deux voies (5) et ses broches (6).
 * hub : { pos, dir } (face du moyeu, axe sortant, repère de la vanne), dir
 * horizontal. Les pièces sont enregistrées par api.part dans ce repère.
 */
export function solenoidHarness(api, hub, { bend = 0.07, explode = [0, -0.05, 0] } = {}) {
  const { THREE, S } = api;
  const P = (ref, obj, k) => api.part(ref, obj, explode.map((v) => v * k));
  const d = new THREE.Vector3(...hub.dir).normalize();
  const down = new THREE.Vector3(0, -1, 0);
  const at = (o, p, dir) => pose(THREE, o, p.toArray ? p.toArray() : p, dir.toArray ? dir.toArray() : dir);
  let p = new THREE.Vector3(...hub.pos);
  // 3 — joint 1/2 NPT ; 2 — raccord de gaine (six-pans 1 po, corps conique, écrou moleté à pans).
  P('3', at(S.washer(0.0135, 0.0105, 0.0015, 'rubber', { pos: [0, 0.00075, 0] }), p, d), 0.6);
  p = p.clone().addScaledVector(d, 0.0015);
  P('2', at(S.merged([
    S.nut(0.0254, 0.008, 'plastic', { pos: [0, 0.004, 0] }),
    S.lathe([[0.0075, 0.008], [0.0125, 0.008], [0.0125, 0.016], [0.0115, 0.026], [0.0075, 0.026], [0.0075, 0.008]], 'plastic', { seg: 24 }),
    S.lathe([[0.0075, 0.016], [0.013, 0.016], [0.013, 0.03], [0.0075, 0.03], [0.0075, 0.016]], 'plastic', { seg: 8 }),
  ], 'plastic'), p, d), 1);
  p = p.clone().addScaledVector(d, 0.026);
  // 4 — gaine annelée : 12 tronçons d'un pouce le long d'un quart de cercle puis vers le bas.
  const segGeo = () => {
    const prof = [[0.0055, 0]];
    for (let i = 0; i < 8; i++) {
      const y = (i * IN) / 8;
      prof.push([0.0085, y + 0.0003], [0.0085, y + 0.0016], [0.0072, y + 0.0022], [0.0072, y + IN / 8 - 0.0002]);
    }
    prof.push([0.0055, IN], [0.0055, 0]);
    return S.lathe(prof, 'plastic', { seg: 16 });
  };
  const arcLen = (bend * Math.PI) / 2;
  const pointAt = (s) => {
    if (s <= arcLen) {
      const a = s / bend;
      return { p: p.clone().addScaledVector(d, Math.sin(a) * bend).addScaledVector(down, (1 - Math.cos(a)) * bend), t: d.clone().multiplyScalar(Math.cos(a)).addScaledVector(down, Math.sin(a)) };
    }
    return { p: p.clone().addScaledVector(d, bend).addScaledVector(down, bend + (s - arcLen)), t: down.clone() };
  };
  for (let k = 0; k < 12; k++) {
    const a = pointAt(k * IN), b = pointAt((k + 1) * IN);
    P('4', at(segGeo(), a.p, b.p.clone().sub(a.p)), 1.5);
  }
  const end = pointAt(12 * IN);
  // 5 — connecteur femelle (corps, verrou) ; 6 — broches ; 7 — thermorétractable sur la jonction.
  const yk = end.p.clone().addScaledVector(end.t, -0.008);
  const con = S.group(
    S.lathe([[0.0062, 0], [0.0085, 0], [0.0085, 0.012], [0.0105, 0.014], [0.0105, 0.04], [0.0088, 0.04], [0.0088, 0.036], [0.0062, 0.036], [0.0062, 0]], 'grey', { seg: 24 }),
    S.box(0.006, 0.016, 0.004, 'grey', { r: 0.001, pos: [0.011, 0.026, 0] }),
  );
  P('5', at(con, yk, end.t), 2.2);
  for (const sx of [-1, 1]) {
    const pin = S.lathe([[0, 0], [0.0008, 0], [0.0008, 0.011], [0.0005, 0.012], [0, 0.012]], 'brass', { seg: 10, pos: [sx * 0.0028, 0.027, 0] });
    P('6', at(pin, yk, end.t), 2.8);
  }
  for (let k = 0; k < 2; k++) {
    const q = pointAt(12 * IN - 0.012 + k * IN);
    P('7', at(S.lathe([[0.0086, 0], [0.0098, 0], [0.0098, IN], [0.0086, IN], [0.0086, 0]], 'black', { seg: 20 }), q.p, q.t), 2);
  }
}
