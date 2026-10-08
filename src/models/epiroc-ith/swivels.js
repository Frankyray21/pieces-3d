import * as THREE from 'three';
import { SIDE, layout, prof } from './common.js';
import { mat } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

// Émerillons d'eau (water swivels) de surface et souterrains, presse-étoupe
// (stuffing boxes) de pompage au câble. Outils verticaux posés à l'horizontale :
// bout côté tige (filetage de tige) à x = 0, anse ou entrée d'eau vers +X.
// Cotes réelles en millimètres, tirées des fiches techniques et des dessins du
// catalogue, converties en mètres. Vue éclatée comme les dessins : corps et
// pièces principales sur la rangée A, roulements, garnitures et joints sur la
// rangée B (dessous), raccords au-dessus (rangée C ou à côté de leur pièce).

const PI = Math.PI;
const MM = 0.001;
const COS30 = Math.cos(PI / 6);

// ---------------------------------------------------------------- formes communes

function mk(geo, m, interior = false) {
  const me = new THREE.Mesh(geo, mat(m));
  me.castShadow = true;
  me.receiveShadow = true;
  const g = new THREE.Group();
  g.add(me);
  if (interior) g.userData.hasInterior = true;
  return g;
}

/**
 * Pièce tournée à méplats : profil [[r, x, f], ...] en mm (sens de lathe())
 * dont la section est rognée à |z| ≤ f (plane 'z') ou |y| ≤ f (plane 'y').
 * f absent : section ronde. Deux points de même cote et de f différents
 * donnent l'épaulement d'un méplat de clé ; f variable, une face taillée
 * (align : échantillons de chaque cercle calés sur le bord de la face, sans
 * dents de scie).
 */
function clipLathe(pts, m, { seg = 72, plane = 'z', align = false, nFlat = 4 } = {}) {
  if (pts[0][0] > 0 && (pts[0][0] !== pts.at(-1)[0] || pts[0][1] !== pts.at(-1)[1])) pts = [...pts, pts[0]];
  const pos = [];
  // Rotation propre : le rognage porte toujours sur s, tourné vers Z (ou Y).
  const P = ([r, x, f], t) => {
    const c = r * Math.cos(t);
    let s = r * Math.sin(t);
    if (f != null) s = Math.max(-f, Math.min(f, s));
    return plane === 'z' ? [x * MM, c * MM, s * MM] : [x * MM, s * MM, -c * MM];
  };
  const nCyl = Math.round(seg / 2) - nFlat;
  const angles = ([r, , f]) => {
    if (!align) return Array.from({ length: seg + 1 }, (_, j) => (j / seg) * 2 * PI);
    const tb = f != null && f < r ? Math.asin(f / r) : PI / 2, a = [];
    for (const [t0, w, n] of [[-tb, 2 * tb, nCyl], [tb, PI - 2 * tb, nFlat], [PI - tb, 2 * tb, nCyl], [PI + tb, PI - 2 * tb, nFlat]]) {
      for (let k = 0; k < n; k++) a.push(t0 + (w * k) / n);
    }
    a.push(a[0] + 2 * PI);
    return a;
  };
  const u = new THREE.Vector3(), v = new THREE.Vector3();
  const tri = (a, b, c) => {
    u.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    v.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    if (u.cross(v).lengthSq() < 1e-20) return;
    pos.push(...a, ...b, ...c);
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const A = angles(pts[i]), B = angles(pts[i + 1]);
    for (let j = 0; j < A.length - 1; j++) {
      const a = P(pts[i], A[j]), b = P(pts[i], A[j + 1]), c = P(pts[i + 1], B[j]), d = P(pts[i + 1], B[j + 1]);
      tri(a, b, c);
      tri(b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  return mk(creaseNormals(geo, 0.45), m, true);
}

/** Arc de cercle (mm) de a0 à a1, n segments. */
const arc = (cx, cy, r, a0, a1, n = 20) => Array.from({ length: n + 1 }, (_, k) => {
  const a = a0 + ((a1 - a0) * k) / n;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

/**
 * Plaque profilée (œil d'anse, bossage) : contour et trous [[x, y], ...] en mm
 * dans le plan XY, épaisseur t selon Z, centrée. warpR : rogne la plaque au
 * rond de barre de ce rayon (œil taillé dans le corps cylindrique).
 */
function plate(outline, holes, t, m, { bevel = 0, steps = 1, warpR = 0 } = {}) {
  const v2 = (p) => p.map(([x, y]) => new THREE.Vector2(x * MM, y * MM));
  const sh = new THREE.Shape(v2(outline));
  holes.forEach((h) => sh.holes.push(new THREE.Path(v2(h))));
  const depth = (t - 2 * bevel) * MM;
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth, steps, curveSegments: 24, bevelEnabled: bevel > 0, bevelSize: bevel * MM, bevelThickness: bevel * MM, bevelSegments: 3,
  });
  geo.translate(0, 0, -depth / 2);
  if (warpR) {
    const p = geo.attributes.position, R = warpR * MM;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), z = p.getZ(i);
      if (y * y + z * z > R * R) p.setY(i, Math.sign(y) * Math.sqrt(Math.max(R * R - z * z, 0)));
    }
  }
  return mk(creaseNormals(geo, 0.5), m);
}

/** Boîte à outils : cotes en mm, axe X ; D (mm) : diamètre de référence de la vue éclatée. */
function kit(api, D, lo) {
  const S = api.S;
  const L0 = layout(api, D * MM, lo), objs = [];
  const L = { add: (ref, obj, o) => { objs.push(obj); return L0.add(ref, obj, o); }, done: () => L0.done() };
  // Vue de côté ; plan de coupe sur l'axe de l'outil (les raccords latéraux décentrent la boîte).
  const view = () => {
    const b = new THREE.Box3();
    objs.forEach((o) => b.expandByObject(o));
    return { ...SIDE, section: { ...SIDE.section, pos: -b.min.z / (b.max.z - b.min.z) } };
  };
  const X = (x, y = 0, z = 0) => [x * MM, y * MM, z * MM];
  const lat = (pts, m, o = {}) => S.lathe(prof(MM, pts), m, { axis: 'x', seg: 40, ...o });
  const th = (r, a, b, pitch = 2, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 14, ...o });
  // Filet rond profond (filet de tige, filet « rope » des adaptateurs).
  const rope = (r, a, b, pitch, depth) => {
    const n = Math.max(1, Math.round((b - a) / pitch)), p = (b - a) / n, out = [];
    for (let i = 0; i < n; i++) for (let k = 0; k < 6; k++) out.push([r - depth * (0.5 - 0.5 * Math.cos((2 * PI * k) / 6)), a + p * (i + k / 6)]);
    out.push([r, b]);
    return out;
  };
  // Bague (rondelle, garniture, joint plat) de x0 à x1, arêtes chanfreinées.
  const ring = (rO, rI, x0, x1, m, c = 0.4) => lat([[rI, x0], [rO - c, x0], [rO, x0 + c], [rO, x1 - c], [rO - c, x1], [rI, x1]], m);
  const oring = (R, r, x, m = 'black') => S.torus(R * MM, r * MM, m, { axis: 'x', pos: X(x) });
  // Six-pans (surplat af) de u0 à u1 sur un noyau tourné de rayon core.
  const hexAt = (af, u0, u1, core, m, axis = 'x') => {
    const R = af / 2 / COS30, c = Math.min(R * 0.1, (u1 - u0) * 0.2);
    return S.lathe(prof(MM, [[core - 0.4, u0], [R - c, u0], [R, u0 + c * 0.6], [R, u1 - c * 0.6], [R - c, u1], [core - 0.4, u1]]), m, { axis, seg: 6 });
  };
  // Raccord droit : queue filetée (rt × lt) vissée dans la pièce, six-pans af × h, nez fileté rn × ln à cône 37°.
  const fit = (u0, { rt, lt, af, h, rn, ln, rb }, m, axis = 'x') => {
    const u1 = u0 + lt, u2 = u1 + h, u3 = u2 + ln, core = af * 0.45;
    return S.group(
      S.lathe(prof(MM, [[rb, u0], ...th(rt, u0, u1, 1.8, { r1: rt * 1.04 }), [core, u1], [core, u2], [rn * 0.88, u2], [rn * 0.88, u2 + ln * 0.12],
        ...th(rn, u2 + ln * 0.12, u3 - ln * 0.25, 1.6, { chamferBottom: false }), [rn * 0.92, u3 - ln * 0.2], [rn * 0.68, u3], [rb, u3]]), m, { axis, seg: 32 }),
      hexAt(af, u1, u2, core, m, axis),
    );
  };
  // Raccord coudé à 45° : queue filetée dans l'orifice selon +Y local, six-pans, coude vers +X, nez JIC.
  const elbow = ({ rt, lt, rb, rk, af, rn, ln }, m) => {
    const k = rk * 1.25, rc = rk * 0.92;
    const g = S.group(
      S.lathe(prof(MM, [[rb, -lt], ...th(rt, -lt, -1, 2, { r1: rt * 1.04 }), [rc, -1], [rc, k], [rb, k]]), m, { seg: 32 }),
      hexAt(af, 0, rk * 0.9, rc, m, 'y'),
      S.ball(rc * MM, m, { pos: X(0, k) }),
    );
    const n0 = rk * 0.95 + 1, n1 = rk + ln;
    const nose = S.lathe(prof(MM, [[rb, 0], [rc, 0], [rc, rk * 0.9], [rn * 0.9, rk * 0.95], ...th(rn, n0, n1, 1.7, { chamferBottom: false }), [rn * 0.92, n1 + 1], [rn * 0.68, n1 + 4], [rb, n1 + 4]]), m, { seg: 32 });
    nose.position.set(0, k * MM, 0);
    nose.rotation.z = -PI / 4;
    g.add(nose);
    return g;
  };
  // Anneau élastique plat (circlip) d'épaisseur t selon X ; oreilles percées vers l'extérieur
  // (arbre) ou l'intérieur (alésage), ouverture tournée de rot autour de X.
  const circlip = (rO, rI, t, x, m, { inner = false, rot = PI / 2 } = {}) => {
    const g0 = 0.24, n = 36, w = rO - rI, pts = [];
    for (let k = 0; k <= n; k++) { const a = g0 + (k / n) * (2 * PI - 2 * g0); pts.push([Math.cos(a) * rO * MM, Math.sin(a) * rO * MM]); }
    for (let k = n; k >= 0; k--) { const a = g0 + (k / n) * (2 * PI - 2 * g0); pts.push([Math.cos(a) * rI * MM, Math.sin(a) * rI * MM]); }
    const lug = (s) => {
      const rc = (rO + rI) / 2 + (inner ? -0.55 : 0.55) * w, a = s * (g0 + (0.55 * w) / rc);
      const cx = Math.cos(a) * rc * MM, cy = Math.sin(a) * rc * MM, rl = 0.8 * w * MM;
      return S.extrude(arc(0, 0, 1, 0, 2 * PI, 16).slice(0, -1).map(([px, py]) => [cx + px * rl, cy + py * rl]), t * MM, m, { holes: [[cx, cy, rl * 0.42]] });
    };
    const inner3 = S.group(S.extrude(pts, t * MM, m), lug(1), lug(-1));
    inner3.rotation.y = PI / 2;
    const g = S.group(inner3);
    g.rotation.x = rot;
    g.position.set(x * MM, 0, 0);
    return g;
  };
  // Roulement ouvert (billes visibles), une ou deux rangées.
  const openBearing = (rO, rI, w, x, m, rows = 1) => {
    const t = (rO - rI) * 0.24, rm = (rO + rI) / 2, rb = Math.min((rO - rI) * 0.28, (w / rows) * 0.36);
    const n = Math.floor((2 * PI * rm) / (rb * 2.5)), balls = [];
    const sph = new THREE.SphereGeometry(rb * MM, 12, 8);
    for (let k = 0; k < rows; k++) {
      const xb = x + (rows > 1 ? (k - (rows - 1) / 2) * (w / rows) : 0);
      for (let i = 0; i < n; i++) {
        const a = ((i + k * 0.5) / n) * 2 * PI;
        const b = new THREE.Mesh(sph);
        b.position.set(xb * MM, Math.cos(a) * rm * MM, Math.sin(a) * rm * MM);
        balls.push(b);
      }
    }
    return S.group(ring(rO, rO - t, x - w / 2, x + w / 2, m), ring(rI + t, rI, x - w / 2, x + w / 2, m), S.merged(balls, 'chrome'));
  };
  return { S, L, X, view, lat, th, rope, ring, oring, hexAt, fit, elbow, circlip, openBearing };
}

// ---------------------------------------------------------------- émerillons de surface

/**
 * Émerillon d'eau de surface (pages 56 à 59) : anse jaune vissée sur le corps
 * noir, axe tournant sur roulement(s), garniture (cage, tresses, fouloir et
 * ressort) logée dans l'alésage de l'anse, raccord coudé à 45° sur l'entrée
 * d'eau. Peu profond (shallow) : œil plat sur un bloc, rallonge d'axe
 * vissée ; profond (deep) : œil taillé dans le rond de Ø 98,5, butée à billes.
 * R : rôle → repère de la liste.
 */
export function waterSwivel(api, { deep = false, R }) {
  const K = kit(api, deep ? 98.5 : 76, { gap: 0.3, rows: { A: 0, B: deep ? -1.35 : -1.45, C: 1.4 } });
  const { S, L, X, view, lat, th, ring, oring, hexAt, elbow, circlip, openBearing } = K;
  const has = (role) => R[role] != null;
  const add = (role, obj, o = {}) => { if (has(role)) L.add(R[role], obj, o); return obj; };
  const small = { row: 'B', gap: 0.18 };

  if (!deep) {
    // Rallonge d'axe : boîte de tige AW en bas, taraudage de l'axe en haut.
    add('extension', lat([[19.5, 0], [20.5, 0], [21.5, 1], [21.5, 79], [20.5, 80], [16.2, 80], [16.2, 77.5], [15, 77.5], [15, 62], [8, 62], [8, 40], [18, 40],
      ...th(18, 1.5, 40, 4, { chamferBottom: false }).reverse()], 'black'), { row: 'A' });
    // Corps : lèvre et joint en bas, roulement, chambre du six-pans, siège de la cage, taraudage de l'anse.
    add('body', lat([[26.5, 67], [33, 67], [38, 72], [38, 136.5], [36.5, 138], [33, 138], [33, 116], [28, 116], [28, 110], [25, 110], [25, 98], [31, 98], [31, 82], [23, 82], [23, 73], [26.5, 73]], 'black'), { row: 'A' });
    add('grease', S.at(S.fitting(7 * MM, 14 * MM, 'brass'), X(90, 37.6)), { follow: R.body, extra: [0, 0.75, 0] });
    add('seal', ring(26.4, 21.6, 67.5, 73, 'black', 0.8), small);
    add('bearing', S.bearing(31 * MM, 15 * MM, 16 * MM, 'steel', { axis: 'x', pos: X(90) }), small);
    add('spindleRing', oring(16.3, 1.2, 81), small);
    add('spindle', S.group(
      lat([[8, 62], ...th(15, 62, 80, 2), [15, 98], [18, 98], [18, 108], [13, 108], [13, 149.5], [12.5, 150], [8, 150]], 'charcoal'),
      hexAt(40, 98, 108, 18, 'charcoal'),
    ), small);
    // Garniture : cage à collerette, trois tresses, fouloir, joint, ressort et siège.
    add('cage', lat([[13.5, 110], [27.5, 110], [28, 110.5], [28, 115.5], [27.5, 116], [22, 116], [22, 149.5], [21.5, 150], [18.2, 150], [18.2, 113], [13.5, 113]], 'copper'), small);
    for (let k = 0; k < 3; k++) add('packing', ring(18.1, 13.2, 113 + 9 * k, 122 + 9 * k - 0.2, 'charcoal'), small);
    add('gland', ring(18.1, 13.2, 140, 147, 'copper'), small);
    add('cageRing', oring(23, 1.5, 144), small);
    add('spring', S.spring(15 * MM, 1.5 * MM, 25 * MM, 5, 'steel', { axis: 'x', pos: X(159.5) }), small);
    add('springSeat', lat([[16.2, 172], [19, 172], [19, 180], [10, 180], [10, 176.5], [16.2, 176.5]], 'copper'), small);
    // Anse : filet mâle vissé dans le corps, collet, bloc d'entrée d'eau, œil plat.
    if (has('bale')) {
      const eye = plate([[149, -31], ...arc(246, 0, 31, -PI / 2, PI / 2, 24), [149, 31]], [[[200, -16], ...arc(246, 0, 16, -PI / 2, PI / 2, 16), [200, 16]]], 24, 'safety', { bevel: 2 });
      const g = S.group(
        lat([[0, 180], [19.5, 180], [19.5, 150], [23.5, 150], [23.5, 116], ...th(33, 116, 136, 2.5), [33, 138], [37, 138], [37, 149], [24, 149], [24, 183], [0, 183]], 'safety'),
        S.box(56 * MM, 56 * MM, 50 * MM, 'safety', { r: 7 * MM, pos: X(177) }),
        eye,
        S.cyl(11 * MM, 1 * MM, 'black', { axis: 'z', pos: X(172, 0, 25.1) }),
      );
      g.userData.hasInterior = true;
      add('bale', g, { row: 'A' });
    }
    if (has('connector')) {
      const c = elbow({ rt: 16.5, lt: 14, rb: 12, rk: 19, af: 40, rn: 16.7, ln: 18 }, 'brass');
      c.rotation.x = PI / 2;
      c.position.set(...X(172, 0, 25));
      add('connector', c, { row: 'C' });
    }
  } else {
    // Axe : bout de tige en bas, portée de butée, collerette, portée du roulement, tube de garniture.
    add('spindle', lat([[15, 0], [21.5, 0], [23.5, 2], [23.5, 7], [22.5, 8], [22.5, 9.5], [25, 10.5], [25, 77], [34.5, 77], [36, 78.5], [36, 85.5], [34.5, 87],
      [20, 87], [20, 117], [19, 117.5], [19, 118.5], [18, 118.5], [18, 120], [19, 120], [19, 171.5], [18.5, 172], [15, 172]], 'black'), small);
    // Corps : fond percé (joint torique), alésage des roulements, filet mâle de l'anse.
    add('body', lat([[25.6, 47], [44, 47], [49.25, 52.25], [49.25, 99.5], [47.75, 101], [45, 101], ...th(45, 101, 137, 3, { chamferBottom: false }), [43, 139], [43, 145],
      [40.5, 145], [40.5, 55], [25.6, 55], [25.6, 52.5], [27.6, 52.5], [27.6, 49.5], [25.6, 49.5]], 'black'), { row: 'A' });
    add('grease', S.at(S.fitting(7 * MM, 14 * MM, 'brass', { axis: 'z' }), X(66, 0, 48.5)), { follow: R.body, extra: [0, 0, 0.6] });
    add('spindleRing', oring(26.3, 1.25, 51), small);
    add('thrust', S.bearing(39 * MM, 25.3 * MM, 22 * MM, 'steel', { thrust: true, axis: 'x', pos: X(66) }), small);
    add('bearing', openBearing(40, 20, 30, 102, 'steel', 2), small);
    add('retainingRing', circlip(22, 18.1, 1.5, 119.25, 'steel'), small);
    add('cage', lat([[20, 145], [42.5, 145], [43, 145.5], [43, 149.5], [42.5, 150], [33, 150], [33, 163.5], [30.5, 163.5], [30.5, 168.5], [33, 168.5], [33, 173.5], [32.5, 174], [28.2, 174], [28.2, 150], [20, 150]], 'copper'), small);
    for (let k = 0; k < 3; k++) add('packing', ring(28.1, 19.3, 150 + 6 * k, 156 + 6 * k - 0.15, 'charcoal'), small);
    add('gland', ring(28.1, 19.3, 168, 175, 'copper'), small);
    add('cageRing', oring(32.5, 2.67, 166), small);
    add('spring', S.spring(23 * MM, 2.2 * MM, 11 * MM, 3.5, 'steel', { axis: 'x', pos: X(180.5) }), small);
    // Vis de blocage de l'anse sur le filet du corps (trois à 120°).
    if (has('setScrews')) {
      for (let k = 0; k < 3; k++) {
        const a = PI / 2 + (k * 2 * PI) / 3;
        const g = S.group(S.cyl(3.2 * MM, 8 * MM, 'black', { axis: 'y', pos: X(0, 45.4) }));
        g.rotation.x = a;
        g.position.x = 112 * MM;
        L.add(R.setScrews, g, { follow: R.body, extra: [0, Math.cos(a) * 0.45, Math.sin(a) * 0.45] });
      }
    }
    // Anse : rond de Ø 98,5 taillé en œil (faces creusées par une fraise de profil),
    // taraudée en bas sur le corps, chambre de garniture et du ressort.
    if (has('bale')) {
      const f = (x) => (x >= 228 ? 20 : 20 + 68.6 - Math.sqrt(68.6 ** 2 - (228 - x) ** 2));
      const scallop = [];
      for (let x = 174; x <= 228; x += 2) scallop.push([49.25, x, f(x)]);
      const body = clipLathe([[0, 186], [29, 186], [29, 174], [35, 174], [35, 150], [43.5, 150], [43.5, 138], [45, 138], ...th(45, 101.5, 138, 3, { chamferBottom: false }).reverse(),
        [45, 101], [47.5, 101], [49.25, 102.75], [49.25, 172], ...scallop, [49.25, 230, 20], [0, 230, 20]], 'safety', { seg: 112, align: true });
      const eye = plate([[225, -49.25], [247.55, -49.25], ...arc(247.55, 0, 49.25, -PI / 2, PI / 2, 32), [225, 49.25]], [arc(248, 0, 18.5, 0, 2 * PI, 40).slice(0, -1)], 40, 'safety', { steps: 8, warpR: 49.25 });
      const g = S.group(body, eye, S.cyl(12 * MM, 2 * MM, 'black', { axis: 'y', pos: X(182, 48.6) }));
      g.userData.hasInterior = true;
      add('bale', g, { row: 'A' });
    }
    if (has('connector')) add('connector', S.at(elbow({ rt: 21, lt: 16, rb: 15, rk: 23, af: 48, rn: 20.6, ln: 20 }, 'brass'), X(182, 48.4)), { row: 'C' });
  }
  L.done();
  return { view: view() };
}

// ---------------------------------------------------------------- émerillons souterrains

/**
 * Émerillon AWJ téflon et céramique (page 97) : axe à six-pans et filet de
 * tige AWJ, deux roulements étanches arrêtés par anneaux, garniture de trois
 * bagues entre rondelles, écrou de presse-étoupe à orifice 3/4 NPT.
 */
export function awjSwivel(api) {
  const { S, L, X, view, lat, th, ring, hexAt, circlip } = kit(api, 60, { gap: 0.3, rows: { A: 0, B: -1.45, C: 1.4 } });
  const small = { row: 'B', gap: 0.2 };
  // Axe (8) : filet de tige, six-pans, portée des roulements, tube revêtu de téflon (noir).
  L.add('8', S.group(
    lat([[7.9, 0], ...th(16, 0, 32, 3.5, { r1: 17.5 }), [19, 32], [19, 46], [12.5, 46], [12.5, 74.8], [11.6, 74.8], [11.6, 76.7], [12.5, 76.7], [12.5, 78], [13.45, 79], [13.45, 110], [7.9, 110]], 'steel'),
    hexAt(44, 32, 46, 19, 'steel'),
    lat([[7.9, 110], [13.45, 110], [13.45, 165], [12.5, 166], [7.9, 166]], 'black'),
  ), { row: 'A' });
  L.add('7', circlip(24.6, 21, 1.4, 49.2, 'steel', { inner: true }), small);
  for (const x of [56, 68]) L.add('6', S.bearing(23.5 * MM, 12.5 * MM, 12 * MM, 'steel', { axis: 'x', pos: X(x) }), small);
  L.add('5', circlip(15.2, 11.7, 1.4, 75.75, 'steel'), small);
  // Corps (2) : tube lisse, alésage des roulements, épaulement, alésage de garniture, taraudage de l'écrou.
  L.add('2', lat([[23.5, 47], [29, 47], [30, 48], [30, 149], [29, 150], [21, 150], [21, 138], [19.5, 138], [19.5, 84], [15.5, 84], [15.5, 78], [23.5, 78],
    [23.5, 50], [24.6, 50], [24.6, 48.5], [23.5, 48.5]], 'grey'), { row: 'A' });
  L.add('3', ring(19.4, 13.6, 84, 86, 'steel', 0.3), small);
  for (let k = 0; k < 3; k++) L.add('4', ring(19.4, 13.6, 86 + 13.33 * k, 86 + 13.33 * (k + 1) - 0.2, 'lightGrey'), small);
  L.add('3', ring(19.4, 13.6, 126, 128, 'steel', 0.3), small);
  // Écrou de presse-étoupe (1) : queue filetée qui serre la garniture, collet, col taraudé 3/4 NPT.
  L.add('1', lat([[13.6, 128], ...th(20.8, 128, 149.5, 2), [20.8, 150], [27, 150], [28, 151], [28, 169], [27, 170], [17.5, 170], [17.5, 189.5], [16.5, 190.5],
    [13.3, 190.5], [13.3, 168], [13.6, 168]], 'steel'), { row: 'A' });
  L.done();
  return { view: view() };
}

/**
 * Émerillons Pro 18+ et Pro 25+ (pages 98 et 99) : boîtier fixe portant le
 * raccord JIC, joint mécanique au carbure (bague fixe sur ressort de
 * caoutchouc, manchon tournant à six-pans), deux roulements étanches dans le
 * chapeau vissé, raccord d'émerillon vissé sur le manchon (filet de tige).
 */
export function proSwivel(api, { big = false } = {}) {
  const { S, L, X, view, lat, th, ring, oring, hexAt, fit, openBearing } = kit(api, big ? 75 : 55, { gap: 0.3, rows: { A: 0, B: -1.45, C: 1.4 } });
  const small = { row: 'B', gap: 0.25 };
  if (!big) {
    // Raccord (7) : filet mâle de tige, corps, col traversant le chapeau (joint torique).
    L.add('7', S.group(
      lat([[9, 0], ...th(15, 0, 34, 3.5, { r1: 16.5 }), [14.5, 34.5], [14.5, 39.5], [19.75, 40], [21.25, 41.5], [21.25, 78.5], [19.75, 80], [16.5, 80], [16.5, 91.5], [16, 92], [12.7, 92], [12.7, 69], [9, 69]], 'steel'),
      oring(16.4, 1.1, 86),
    ), { row: 'A' });
    // Chapeau (6) à deux méplats de clé.
    L.add('6', clipLathe([[17.2, 82], [30, 82], [31.25, 83.25], [31.25, 146.75], [30, 148], [26, 148], [26, 116], [23.6, 116], [23.6, 92], [17.2, 92]].map(([r, x]) => [r, x, 28.5]), 'chrome', { plane: 'y', seg: 64 }), { row: 'A' });
    for (const x of [98, 110]) L.add('5', S.bearing(23.5 * MM, 12.5 * MM, 12 * MM, 'steel', { axis: 'x', pos: X(x) }), small);
    L.add('4', S.group(lat([[9, 69], ...th(12.2, 69, 90, 1.5), [12.2, 91], [12.5, 92], [12.5, 116], [14, 116], [14, 132], [9, 132]], 'steel'), hexAt(30, 116, 132, 14, 'steel')), small);
    // Boîtier (2) : filet mâle dans le chapeau, corps à méplats, col taraudé du raccord.
    L.add('2', clipLathe([[18, 116], [24.5, 116], ...th(26, 116, 147, 2), [26, 148], [27.25, 148], [27.25, 158], [27.25, 158, 23.5], [27.25, 184, 23.5], [27.25, 184], [27.25, 189],
      [18.25, 195], [18.25, 229], [17.25, 230], [13.3, 230], [13.3, 208], [11.9, 208], [11.9, 134], [18, 134]], 'chrome', { plane: 'y', seg: 64 }), { row: 'A' });
    L.add('3', ring(11.75, 9, 134, 182, 'chrome'), small);
    L.add('1', fit(213, { rt: 13, lt: 17, af: 32, h: 10, rn: 13.5, ln: 22, rb: 7.5 }, 'steel'), { row: 'A' });
  } else {
    // Raccord (7) : boîte de tige large en bas (bande mate), dôme, col dans le chapeau.
    L.add('7', S.group(
      lat([[37, 0], [37.5, 0], [38.5, 1], [38.5, 20], [41, 22], [51, 22], [51, 50], [37, 50]], 'steel'),
      lat([[12.5, 50], [51, 50], [51, 79], [49, 81], [26, 83.5], [22, 86], [22, 114], [21, 115], [15.2, 115], [15.2, 92], [12.5, 92]], 'chrome'),
    ), { row: 'A' });
    // Chapeau (6) : bande moletée en bas, partie polie taraudée en haut.
    L.add('6', S.group(
      lat([[22.5, 104], [34.5, 104], [35.5, 105], [35.5, 131], [27.6, 131], [27.6, 115], [22.5, 115]], 'steel'),
      lat([[27.6, 131], [35.5, 131], [35.5, 172], [34.5, 173], [31.6, 173], [31.6, 141], [27.6, 141]], 'chrome'),
    ), { row: 'A' });
    for (const x of [121.5, 134.5]) L.add('5', openBearing(27.5, 15, 13, x, 'lightGrey'), small);
    L.add('4', S.group(lat([[12.5, 92], ...th(14.7, 92, 113, 1.5), [14.7, 114], [15, 115], [15, 141], [17, 141], [17, 157], [12.5, 157]], 'steel'), hexAt(38, 141, 157, 17, 'darkSteel')), small);
    // Boîtier (2) : filet mâle mat, corps poli, cône et col taraudé du raccord #16.
    L.add('2', S.group(
      lat([[23, 141], [30.5, 141], [31.5, 142], ...th(31.5, 142, 172, 2.5, { chamferBottom: false }), [31.5, 173], [16.8, 173], [16.8, 162], [23, 162]], 'steel'),
      lat([[16.8, 173], [35.5, 173], [35.5, 192], [34, 194], [24, 203], [22.5, 204], [22.5, 245], [21.5, 246], [16.3, 246], [16.3, 222], [16.8, 222]], 'chrome'),
    ), { row: 'A' });
    L.add('3', S.group(ring(16.5, 12.6, 157, 184, 'chrome'), ring(16.5, 12.6, 184, 212, 'rubber')), small);
    L.add('1', fit(226, { rt: 16, lt: 20, af: 38, h: 14, rn: 16.7, ln: 24, rb: 10 }, 'chrome'), { row: 'A' });
  }
  L.done();
  return { view: view() };
}

// ---------------------------------------------------------------- presse-étoupe

/**
 * Presse-étoupe standard (pages 100 et 101) : adaptateur d'émerillon à filet
 * rond (tourne avec la tige) sur la queue du boîtier fixe (circlip et rondelle
 * en bas) ; entrée d'eau latérale (mamelon G 3/4) sous le piston ; le câble
 * de 5 mm passe dans les guides et les trois joints que la pression pousse
 * contre la vis de tête.
 */
export function stuffingBox(api) {
  const { S, L, X, view, lat, th, rope, ring, oring, fit, circlip } = kit(api, 70, { gap: 0.3, rows: { A: 0, B: -1.2, C: 1.3 } });
  const small = { row: 'B', gap: 0.22 };
  L.add('11', lat([[17.5, 0], [31.5, 0], ...rope(35, 1, 44, 11, 3.5), [34, 44.5], [34, 62.3], [33.3, 63], [14.2, 63], [14.2, 59], [15.6, 59], [15.6, 56], [14.2, 56], [14.2, 6], [17.5, 6]], 'grey'), { row: 'A' });
  L.add('10', S.at(S.fitting(6 * MM, 12 * MM, 'steel'), X(53, 33.6)), { follow: '11', extra: [0, 0.55, 0] });
  L.add('14', circlip(16.3, 12.85, 1.5, 3.75, 'steel'), small);
  L.add('13', S.washer(17 * MM, 13.95 * MM, 1.5 * MM, 'steel', { axis: 'x', pos: X(5.25) }), small);
  L.add('12', oring(14.9, 1.1, 57.5, 'yellow'), small);
  // Boîtier (7) : queue à gorge de circlip, collets, bossage de l'entrée d'eau, filet de la vis de tête.
  L.add('7', S.group(
    lat([[6.5, 1.5], [12.8, 1.5], [13.85, 2.5], [13.85, 3], [12.8, 3], [12.8, 4.5], [13.85, 4.5], [13.85, 63], [22.5, 63], [24, 64.5], [24, 69], [19, 70], [19, 137.5], [24, 138.5],
      [24, 143.5], [22.5, 145], [16, 145], ...th(16, 145, 177, 1.75, { chamferBottom: false }), [15, 178], [13, 178], [13, 105], [6.5, 105]], 'grey'),
    S.cyl(15 * MM, 12 * MM, 'grey', { axis: 'y', pos: X(92, 16) }),
    S.cyl(10 * MM, 1 * MM, 'black', { axis: 'y', pos: X(92, 22.1) }),
  ), { row: 'A' });
  L.add('9', S.group(
    S.washer(17.5 * MM, 14.5 * MM, 2 * MM, 'steel', { axis: 'y', pos: X(92, 23) }),
    S.washer(14.6 * MM, 13.3 * MM, 2.3 * MM, 'black', { axis: 'y', pos: X(92, 23) }),
  ), { follow: '7', extra: [0, 0.55, 0] });
  L.add('8', S.at(fit(8, { rt: 13.2, lt: 16, af: 32, h: 10, rn: 13.2, ln: 22, rb: 9 }, 'steel', 'y'), X(92)), { follow: '7', extra: [0, 1.0, 0] });
  // Piston et joint torique, trois joints, guides du câble, vis de tête.
  L.add('5', lat([[2.7, 105], [12.9, 105], [12.9, 108.5], [11.4, 108.5], [11.4, 111.5], [12.9, 111.5], [12.9, 115], [2.7, 115]], 'grey'), small);
  L.add('6', oring(12.2, 1.15, 110, 'yellow'), small);
  for (let k = 0; k < 3; k++) L.add('4', ring(12.9, 2.6, 115 + 8.33 * k, 115 + 8.33 * (k + 1) - 0.15, 'yellow'), small);
  L.add('3', lat([[2.8, 140], [12.9, 140], [12.9, 178], [5, 178], [2.8, 175]], 'grey'), small);
  L.add('2', lat([[16, 155], [23, 155], [24, 156], [24, 189], [23, 190], [10.5, 190], [10.5, 184.2], [16.2, 184.2], [16.2, 177], [16, 177]], 'grey'), { row: 'A' });
  L.add('1', lat([[2.8, 178], [15, 178], [15.5, 178.5], [15.5, 184], [10, 184], [6.5, 197], [5.5, 199], [2.8, 199]], 'grey'), { row: 'A' });
  L.done();
  return { view: view() };
}

/**
 * Presse-étoupe rotatif à pompage (RPT, pages 102 et 103) : corps fixe à
 * entrée d'eau, écrou de presse-étoupe à six-pans (passage de câble de 16 mm,
 * épissures comprises) serrant deux garnitures ; queue du corps fixe tenue
 * dans le corps tournant par rondelle de butée en laiton, écrous à encoches
 * et rondelle-frein ; sous-adaptateur noir vissé (filet de tige).
 */
export function rptStuffingBox(api) {
  const D = 69, G = 0.35;
  const { S, L, X, view, lat, th, rope, ring, oring, hexAt } = kit(api, D, { gap: G, rows: { A: 0, B: -1.3, C: 1.3 } });
  const small = { row: 'B', gap: 0.22 };
  const lockNut = (x0, x1) => S.group(
    ring(23.5, 19.5, x0, x1, 'steel', 0.3),
    S.slotted(27 * MM, 23.4 * MM, x0 * MM, x1 * MM, [0, 1, 2, 3].map((k) => ({ a: (k * PI) / 2 + PI / 4, w: 0.22, y0: x0 * MM, y1: x1 * MM })), 'steel', { axis: 'x', seg: 40 }),
  );
  L.add('12', lat([[9, 0], [19.5, 0], [21.5, 1.5], ...rope(21.5, 1.5, 39, 7.5, 2.4), [28, 39], [34.5, 45.5], [34.5, 130.3], [33.8, 131], [30, 131], [30, 111], [28, 111], [28, 70], [9, 70]], 'black'), { row: 'A' });
  L.add('10', lockNut(90.5, 98.5), small);
  L.add('11', S.washer(26.5 * MM, 19.6 * MM, 1.5 * MM, 'darkSteel', { axis: 'x', pos: X(99.25) }), small);
  L.add('10', lockNut(100, 108), small);
  L.add('9', ring(28, 19.8, 108, 111, 'brass', 0.3), small);
  L.add('8', oring(27.6, 1.3, 114.5), small);
  // Corps tournant (7) : filet mâle dans le sous-adaptateur, lamage du joint en haut, graisseur.
  // Écart après lui : place du corps fixe (4), rangé entre lui et l'écrou de presse-étoupe.
  L.add('7', lat([[19.8, 111], [26.5, 111], [27, 111.5], [27, 118], [30, 118], ...th(30, 118, 130.5, 2, { chamferBottom: false }), [30, 131], [34, 131], [34.5, 131.5], [34.5, 175.5], [34, 176],
    [22, 176], [22, 172.5], [19.8, 172.5]], 'steel'), { row: 'A', gap: 198 / D + 2 * G });
  L.add('6', S.at(S.fitting(6 * MM, 12 * MM, 'steel'), X(156, 34.2)), { follow: '7', extra: [0, 0.7, 0] });
  L.add('5', oring(21, 1.4, 174.2), small);
  // Corps fixe (4) : queue filetée à rainure de rondelle-frein, corps à bossage d'entrée d'eau, chambre des garnitures.
  const port = S.group(
    plate([[190, -15], [220, -15], [220, 15], [190, 15]], [arc(205, 0, 13, 0, 2 * PI, 32).slice(0, -1)], 12, 'steel', { bevel: 1.5 }),
  );
  port.position.z = 27 * MM;
  L.add('4', S.group(
    S.slotted(19.5 * MM, 9 * MM, 88 * MM, 104 * MM, [{ a: 0, w: 0.3, y0: 88 * MM, y1: 100 * MM }], 'steel', { axis: 'x', seg: 40 }),
    lat([[9, 104], [19.5, 104], [19.5, 176], [29, 176], [30, 177], [30, 285], [29, 286], [21.5, 286], [21.5, 274], [20.6, 274], [20.6, 226], [9, 226]], 'steel'),
    port,
    S.cyl(11.5 * MM, 0.6 * MM, 'black', { axis: 'z', pos: X(205, 0, 30.3) }),
  ), { follow: '1', extra: [-(12 / D) - G, 0, 0] });
  L.add('3', ring(20.5, 8.5, 226, 229, 'steel', 0.3), small);
  L.add('2', ring(20.5, 8.2, 229, 251.3, 'cream'), small);
  L.add('2', ring(20.5, 8.2, 251.5, 273.8, 'cream'), small);
  // Écrou de presse-étoupe (1) : queue filetée bruni, tête à six-pans.
  L.add('1', S.group(
    lat([[8, 274], ...th(21.5, 274, 325, 2, { maxTurns: 22 }), [21.5, 325], [8, 325]], 'charcoal'),
    lat([[8, 325], [26, 325], [26, 344], [8, 344]], 'steel'),
    hexAt(61, 325, 344, 26, 'steel'),
  ), { row: 'A' });
  L.done();
  return { view: view() };
}

// ---------------------------------------------------------------- pages du catalogue

// Émerillon peu profond : 1 anse … 15 joint ; profond : 1 anse … 15 vis de blocage.
export const P056 = (api) => waterSwivel(api, {
  R: { bale: '1', connector: '2', springSeat: '3', spring: '4', cageRing: '5', gland: '6', packing: '7', cage: '8', spindle: '9', bearing: '10', spindleRing: '11', extension: '12', body: '13', grease: '14', seal: '15' },
});
export const P058 = (api) => waterSwivel(api, {
  deep: true,
  R: { bale: '1', connector: '2', spring: '3', cageRing: '4', gland: '5', packing: '6', cage: '7', retainingRing: '8', bearing: '9', spindle: '10', thrust: '11', spindleRing: '12', body: '13', grease: '14', setScrews: '15' },
});
export const P097 = awjSwivel;
export const P098 = (api) => proSwivel(api);
export const P099 = (api) => proSwivel(api, { big: true });
export const P100 = stuffingBox;
export const P102 = rptStuffingBox;
