// Assistants du lot B1 (tête XBH P012 et kit d'adaptateur transmission P011) : repère de la tête, cotes
// internes communes aux deux assemblages et formes propres à la tête (roulements ouverts à billes visibles,
// joints à lèvre, pignons à denture de chaîne, chaîne triple à maillons, vis à six pans creux, vis de pression,
// graisseurs, bouchons carrés).
//
// REPÈRE (layout.js, HEAD) : origine sur la face de pose de la table, sous l'axe de la broche ; broche principale
// le long de X à y = SY, z = 0 ; bout des manchons (bague NQ 91-119) vers +X ; mandrin vers −X (face avant du
// mandrin à x = CHUCK.x0 = HEAD.rearX) ; arbre menant 12T (91-104A) à (DRV.y, DRV.z).
// Côté de l'arbre menant : SD = signe de HEAD.drive.dz, +Z comme sur la couverture (p. 1) et la page 11 (au fond,
// à gauche de la face avant quand on regarde la tête depuis le serre-tiges). Tout ce qui dépend du côté est écrit
// avec SD.
import { IN, HEAD } from '../layout.js';

export const SY = HEAD.spindleY;
export const SD = Math.sign(HEAD.drive.dz) || 1;
export const DRV = { y: SY + HEAD.drive.dy, z: HEAD.drive.dz };
export const ENTRAXE = Math.hypot(HEAD.drive.dy, HEAD.drive.dz);

// Chaîne triple 91-116 et pignons 24T / 12T au pas HEAD.chainPitch de 1 po (#80-3) [mesuré sur l'éclaté p. 12 : le
// pignon 12T de l'arbre menant a le même diamètre que son roulement 6213 (Ø 120) ; au pas de 3/4 po il ferait Ø 82,
// au pas de 1 po Ø 110]. Rouleau Ø 15,88, plaques de 24 mm de haut, pas transversal 29,29 mm, largeur des dents
// 13,7 mm [norme ANSI 80-3].
export const PAS = HEAD.chainPitch;
export const CH = { roller: 0.01588, plateH: 0.0241, plateT: 0.0032, pt: 0.02929, tooth: 0.0137, inner: 0.0159 };
export const STRANDS = [-CH.pt, 0, CH.pt]; // brins de la chaîne et dentures des pignons, en x
export const pd = (n) => PAS / Math.sin(Math.PI / n); // diamètre primitif

// Carter mécano-soudé 91-101 [mesuré sur l'éclaté p. 12, échelle tirée du roulement 6213 Ø 120 : 0,19 m le long de
// la broche (HEAD.frontX), ≈ 0,42 m de haut, ≈ 0,68 m de long ; bouts en HEAD.ends, qui suit l'entraxe].
// Parois avant et arrière de 25 mm (portées des roulements), bouts et fond de 19 et 25 mm [estimé].
const R24 = pd(24) / 2, R12 = pd(12) / 2;
export const TIP24 = R24 + 0.0067, TIP12 = R12 + 0.0063; // rayons de tête des dents [norme]
export const CAR = {
  x0: -HEAD.frontX, x1: HEAD.frontX, wall: 0.025, side: 0.019, floor: 0.025,
  y0: 0,
  y1: Math.max(0.42, DRV.y + TIP12 + 0.03), // dessus (appui du couvercle 18)
  zM: HEAD.ends[0], // bout côté broche (poignée, thermomètre, bouchons) [estimé]
  zD: HEAD.ends[1], // bout côté arbre menant (supports de refroidisseur) [estimé]
};
CAR.zLo = Math.min(CAR.zM, CAR.zD);
CAR.zHi = Math.max(CAR.zM, CAR.zD);

/** Plaque verticale (normale X) d'épaisseur t centrée en x ; contour [[z, y], …] ; trous [z, y, r]. */
export function plaqueX(S, x, t, pts, mat, holes = []) {
  return S.at(S.extrude(pts.map(([z, y]) => [-z, y]), t, mat, { holes: holes.map((h) => (Array.isArray(h[0]) ? h.map(([z, y]) => [-z, y]) : [-h[0], h[1], h[2]])) }), [x, 0, 0], [0, Math.PI / 2, 0]);
}
/** Plaque verticale (normale Z) d'épaisseur t centrée en z ; contour [[x, y], …] ; trous [x, y, r]. */
export function plaqueZ(S, z, t, pts, mat, holes = []) {
  return S.at(S.extrude(pts, t, mat, { holes }), [0, 0, z]);
}

/** Anneau de révolution le long de X : profil [[r, x], …] (sens de lathe), posé à (y, z). */
export const tour = (S, prof, mat, y = SY, z = 0, seg = 48) => S.lathe(prof, mat, { axis: 'x', seg, pos: [0, y, z] });

/** Bague simple le long de X de x0 à x1, rayons ri..ro. */
export const bague = (S, ri, ro, x0, x1, mat, y = SY, z = 0, seg = 48) => tour(S, [[ri, x0], [ro, x0], [ro, x1], [ri, x1], [ri, x0]], mat, y, z, seg);

/** Sphère basse résolution (billes de roulement) en géométrie. */
function sphereGeo(THREE, r) { return new THREE.SphereGeometry(r, 10, 7); }

/**
 * Roulement à billes ouvert le long de X (bagues usinées à chemin de roulement, billes chromées, cage laiton) :
 * visible en coupe. rangs = 2 : deux rangées de billes (3222, contact oblique double rangée).
 */
export function roulement(api, { ri, ro, w, x, y = SY, z = 0, rangs = 1 }) {
  const { S, THREE } = api;
  const e = (ro - ri) * 0.3; // épaisseur des bagues
  const rb = Math.min((ro - ri) * 0.19, (w / rangs) * 0.36); // rayon des billes
  const rm = (ri + ro) / 2;
  const h = w / 2, c = Math.min(0.0015, e * 0.15);
  const rows = rangs === 2 ? [-w / 4, w / 4] : [0];
  // Bague extérieure : alésage creusé d'une gorge par rangée.
  const out = [[ro - e, -h], [ro - c, -h], [ro, -h + c], [ro, h - c], [ro - c, h], [ro - e, h]];
  const inn = [[ri, -h], [ri + e - c, -h], [ri + e, -h + c]];
  const gorge = (r0, sgn, dx) => { const pts = []; for (let k = 1; k < 6; k++) { const a = (k / 6) * Math.PI; pts.push([r0 + sgn * rb * 0.35 * Math.sin(a), dx - rb * 0.9 * Math.cos(a)]); } return pts; };
  for (const dx of [...rows].reverse()) out.push(...gorge(ro - e, 1, dx).reverse());
  out.push([ro - e, -h]);
  for (const dx of rows) inn.push(...gorge(ri + e, -1, dx));
  inn.push([ri + e, h - c], [ri + e - c, h], [ri, h], [ri, -h]);
  const g = S.group(
    S.lathe(out, 'steel', { axis: 'x', seg: 56 }),
    S.lathe(inn, 'steel', { axis: 'x', seg: 56 }),
  );
  const balls = [];
  const n = Math.max(8, Math.floor((2 * Math.PI * rm) / (rb * 2.25)));
  for (const dx of rows) for (let i = 0; i < n; i++) {
    const a = ((i + (dx > 0 ? 0.5 : 0)) / n) * 2 * Math.PI;
    const m = new THREE.Mesh(sphereGeo(THREE, rb));
    m.position.set(dx, rm * Math.cos(a), rm * Math.sin(a));
    balls.push(m);
  }
  g.add(S.merged(balls, 'chrome'));
  for (const dx of rows) g.add(S.ring(rm + rb * 0.55, rm - rb * 0.55, rb * 0.5, 'brass', { axis: 'x', seg: 48, pos: [dx, 0, 0] }));
  return S.at(g, [x + 0, y, z]);
}

/** Joint à lèvre (bague d'étanchéité radiale) le long de X : armature d'acier et lèvre caoutchouc ; lèvre côté sgn. */
export function joint(api, { ri, ro, w, x, y = SY, z = 0, sgn = 1 }) {
  const { S } = api;
  const h = w / 2, t = Math.min(0.0015, (ro - ri) * 0.12);
  const s = sgn;
  const arm = [[ro - t, -h], [ro, -h], [ro, h], [ri + (ro - ri) * 0.45, h], [ri + (ro - ri) * 0.45, h - t], [ro - t, h - t], [ro - t, -h]];
  const caou = [[ri + (ro - ri) * 0.35, -h], [ro - t, -h], [ro - t, h - t], [ri + (ro - ri) * 0.45, h - t], [ri + (ro - ri) * 0.3, h * 0.2], [ri, -h * 0.3], [ri, -h * 0.6], [ri + (ro - ri) * 0.35, -h]];
  const flip = (p) => p.map(([r, xx]) => [r, s * xx]);
  const fix = (p) => (s > 0 ? p : flip(p).reverse());
  return S.at(S.group(S.lathe(fix(arm), 'steel', { axis: 'x', seg: 48 }), S.lathe(fix(caou), 'rubber', { axis: 'x', seg: 48 })), [x, y, z]);
}

/**
 * Contour d'un pignon à denture de chaîne (ANSI) : N dents au pas PAS, creux en arc de rayon du rouleau, dents à
 * flancs droits et sommet arrondi. Renvoie [[u, v], …] dans le plan du pignon.
 */
export function contourPignon(N) {
  const R = pd(N) / 2, rs = CH.roller * 0.505, tip = R + PAS * (N > 15 ? 0.27 : 0.25);
  const pts = [];
  const step = (2 * Math.PI) / N;
  for (let i = 0; i < N; i++) {
    const a = i * step; // creux de la dent i
    const cx = R * Math.cos(a), cy = R * Math.sin(a);
    // arc du creux (face à l'axe), ±70°
    for (let k = 0; k <= 6; k++) {
      const t = a + Math.PI + (-70 + (140 * k) / 6) * (Math.PI / 180);
      pts.push([cx + rs * Math.cos(t), cy + rs * Math.sin(t)]);
    }
    // sommet de la dent (entre deux creux)
    const am = a + step / 2;
    pts.push([tip * Math.cos(am - step * 0.12), tip * Math.sin(am - step * 0.12)]);
    pts.push([tip * Math.cos(am + step * 0.12), tip * Math.sin(am + step * 0.12)]);
  }
  // l'arc du creux est parcouru dans le sens inverse : remettre dans l'ordre croissant d'angle
  const out = [];
  for (let i = 0; i < N; i++) {
    const blk = pts.slice(i * 9, i * 9 + 9);
    const arc = blk.slice(0, 7);
    // l'arc va de t = a+π−70° à a+π+70° : vu de l'axe, il tourne dans le sens horaire ; on l'inverse.
    out.push(...arc.reverse(), blk[7], blk[8]);
  }
  return out;
}

/** Denture triple d'un pignon le long de X : trois couronnes de N dents aux brins de la chaîne, alésage rAl. */
export function denture(api, N, rAl, mat = 'darkSteel') {
  const { S } = api;
  const pts = contourPignon(N);
  return S.group(...STRANDS.map((dx) => S.at(S.extrude(pts, CH.tooth, mat, { holes: rAl ? [[0, 0, rAl]] : [] }), [dx, 0, 0], [0, Math.PI / 2, 0])));
}

/**
 * Chaîne triple à rouleaux sur la boucle fermée loop [[z, y], …] (sens quelconque), axe du brin du milieu à x = 0 :
 * plaques intérieures et extérieures en huit (alternées), rouleaux, axes traversants ; maille d'accouplement
 * (agrafe) au rang `attache`. Renvoie { obj, n } (n : nombre de pas posés).
 */
export function chaine(api, loop, { attache = 0 } = {}) {
  const { S, THREE } = api;
  const len = [0];
  for (let i = 1; i <= loop.length; i++) len.push(len[i - 1] + Math.hypot(loop[i % loop.length][0] - loop[i - 1][0], loop[i % loop.length][1] - loop[i - 1][1]));
  const L = len[len.length - 1], n = Math.round(L / PAS), step = L / n;
  const at = (s) => {
    s = ((s % L) + L) % L;
    let k = 1;
    while (len[k] < s) k++;
    const a = loop[k - 1], b = loop[k % loop.length], t = (s - len[k - 1]) / (len[k] - len[k - 1] || 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  // Plaque en huit : deux demi-cercles de rayon plateH/2 reliés par une taille (dans le plan u le long du pas, v).
  const plaque = (h) => {
    const sh = new THREE.Shape();
    const r = h / 2, w = h * 0.36;
    const P = [];
    for (let k = 0; k <= 6; k++) { const a = Math.PI / 2 + (k / 6) * Math.PI; P.push([r * Math.cos(a), r * Math.sin(a)]); }
    P.push([PAS / 2, -w]);
    for (let k = 0; k <= 6; k++) { const a = -Math.PI / 2 + (k / 6) * Math.PI; P.push([PAS + r * Math.cos(a), r * Math.sin(a)]); }
    P.push([PAS / 2, w]);
    P.forEach(([u, v], i) => (i ? sh.lineTo(u, v) : sh.moveTo(u, v)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: CH.plateT, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -CH.plateT / 2);
    return g;
  };
  const gIn = plaque(CH.plateH * 0.94), gOut = plaque(CH.plateH);
  const plates = [], rollers = [], pins = [], clip = [];
  const rollG = new THREE.CylinderGeometry(CH.roller / 2, CH.roller / 2, CH.inner * 0.98, 12, 1);
  rollG.rotateZ(Math.PI / 2);
  const pinW = 2 * CH.pt + CH.inner + 4 * CH.plateT + 0.004;
  const pinG = new THREE.CylinderGeometry(0.00278, 0.00278, pinW, 8, 1);
  pinG.rotateZ(Math.PI / 2);
  for (let i = 0; i < n; i++) {
    const [z0, y0] = at(i * step), [z1, y1] = at((i + 1) * step);
    // Plaque : u le long du pas (de (z0,y0) vers (z1,y1)), v dans le plan, épaisseur selon X.
    const ang = Math.atan2(y1 - y0, z1 - z0);
    // Base directe : u → (0, sin, cos) en (x, y, z) ; v → (0, −cos, sin) ; épaisseur → +x.
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, Math.sin(ang), Math.cos(ang)),
      new THREE.Vector3(0, -Math.cos(ang), Math.sin(ang)),
      new THREE.Vector3(1, 0, 0),
    ));
    const inner = i % 2 === 0; // maillon intérieur (à rouleaux) ou extérieur (à axes)
    const off = inner ? CH.inner / 2 + CH.plateT / 2 : CH.inner / 2 + CH.plateT * 1.5;
    for (const dx of STRANDS) for (const s of [-1, 1]) {
      const m = new THREE.Mesh(inner ? gIn : gOut);
      m.quaternion.copy(q);
      m.position.set(dx + s * off, y0, z0);
      (i === attache && !inner ? clip : plates).push(m);
    }
    for (const dx of STRANDS) { const m = new THREE.Mesh(rollG); m.position.set(dx, y0, z0); rollers.push(m); }
    const p = new THREE.Mesh(pinG); p.position.set(0, y0, z0); pins.push(p);
  }
  const g = S.group(S.merged(plates, 'darkSteel'), S.merged(rollers, 'steel'), S.merged(pins, 'chrome'));
  if (clip.length) g.add(S.merged(clip, 'blackOxide')); // maille d'accouplement (plaques d'attache noires et agrafe)
  return { obj: g, n };
}

/** Boucle de la chaîne autour de deux pignons (centres c1, c2 [z, y], rayons primitifs r1 > r2). */
export function boucle(c1, r1, c2, r2) {
  const d = [c2[0] - c1[0], c2[1] - c1[1]], Lc = Math.hypot(...d), phi = Math.atan2(d[1], d[0]), beta = Math.acos((r1 - r2) / Lc);
  const pts = [];
  const arc = (c, r, a0, a1) => { const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.06)); for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } };
  arc(c1, r1, phi + beta, phi + 2 * Math.PI - beta);
  arc(c2, r2, phi - beta, phi + beta);
  return pts;
}

/** Vis à tête cylindrique à six pans creux (SHCS) le long de ±X : tête à l'origine côté s (+1 : tête vers +X). */
export function vchc(api, d, len, s = 1, mat = 'blackOxide') {
  const { S } = api;
  const H = d, R = d * 0.75, k = d * 0.36;
  const prof = [[0, -len], [d / 2, -len], [d / 2, 0], [R, 0], [R, H - 0.0006], [R - 0.0006, H], [k, H], [k, H - d * 0.5], [0, H - d * 0.5]];
  return S.lathe(s > 0 ? prof : prof.map(([r, x]) => [r, -x]).reverse(), mat, { axis: 'x', seg: 14 });
}

/** Vis de pression à six pans creux, bout cuvette, le long de X : de x = 0 (bout cuvette) à x = s·len. */
export function vpression(api, d, len, s = 1, mat = 'blackOxide') {
  const { S } = api;
  const r = d / 2, k = d * 0.25;
  const prof = [[r * 0.5, 0], [r * 0.85, 0], [r, len * 0.08], [r, len], [k, len], [k, len * 0.6], [0, len * 0.6], [0, len * 0.05], [r * 0.5, 0]];
  return S.lathe(s > 0 ? prof : prof.map(([rr, x]) => [rr, -x]).reverse(), mat, { axis: 'x', seg: 12 });
}

/** Graisseur droit 1/8 NPT à bille (six-pans, corps, tête sphérique) le long de +axe. */
export function graisseur(api, axis = 'y') {
  const { S } = api;
  return S.group(S.nut(0.011, 0.007, 'zinc', { axis }), S.cyl(0.0035, 0.012, 'zinc', { axis, pos: axisPt(axis, 0.009) }), S.at(S.ball(0.0045, 'zinc'), axisPt(axis, 0.016)), S.cyl(0.0045, 0.008, 'zinc', { axis, pos: axisPt(axis, -0.006) }));
}
export const axisPt = (axis, t) => {
  const s = axis.startsWith('-') ? -t : t;
  const a = axis.replace('-', '');
  return a === 'x' ? [s, 0, 0] : a === 'y' ? [0, s, 0] : [0, 0, s];
};

/** Bouchon de tuyau carré plein 1/2 NPT (tête carrée de 14 mm, filet conique) le long de +axe. */
export function bouchonCarre(api, axis = 'z') {
  const { S } = api;
  const head = S.box(0.014, 0.014, 0.014, 'zinc', { r: 0.0015 });
  const g = S.group(S.at(head, axisPt(axis, 0.007)), S.cyl(0.0105, 0.012, 'zinc', { axis, pos: axisPt(axis, -0.006), r2: 0.0095 }));
  return g;
}
