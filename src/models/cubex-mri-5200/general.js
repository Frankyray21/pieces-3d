import * as THREE from 'three';
import { M, G, merge, tf, revolve, axis, circ, rrect, slabXY, slabXZ, prismX, boxG, cylG, hexG, boltHeadG, crease } from './track.js';

// Vue générale (F04) : assemble les sous-assemblages à leur position sur la
// machine. Repère machine : X vers l'avant (mât), Y vers le haut, +Z à droite.

const PI = Math.PI;

/** Courbe passant exactement par une liste de points (un tronçon de tube par point). */
class PolyCurve extends THREE.Curve {
  constructor(pts) { super(); this.pts = pts; }
  getPoint(t, target = new THREE.Vector3()) {
    const n = this.pts.length - 1;
    const f = Math.min(Math.max(t, 0), 1) * n;
    const i = Math.min(Math.floor(f), n - 1);
    return target.copy(this.pts[i]).lerp(this.pts[i + 1], f - i);
  }
}

/** Tube rond cintré suivant une ligne brisée (rayon de cintrage ≈ bend), bouts obturés. */
function pipe(points, r, bend = 0.05, radial = 10) {
  const P = points.map((p) => new THREE.Vector3(...p));
  const out = [P[0]];
  for (let i = 1; i < P.length - 1; i++) {
    const d0 = P[i].clone().sub(P[i - 1]), d1 = P[i + 1].clone().sub(P[i]);
    const b = Math.min(bend, d0.length() / 2, d1.length() / 2);
    const q = new THREE.QuadraticBezierCurve3(
      P[i].clone().addScaledVector(d0.normalize(), -b), P[i].clone(), P[i].clone().addScaledVector(d1.normalize(), b));
    for (let k = 0; k <= 6; k++) out.push(q.getPoint(k / 6));
  }
  out.push(P[P.length - 1]);
  const pts = out.filter((p, i) => i === 0 || p.distanceTo(out[i - 1]) > 1e-6);
  const g = new THREE.TubeGeometry(new PolyCurve(pts), pts.length - 1, r, radial, false);
  const caps = [0, 1].map((e) => {
    const p = e ? pts[pts.length - 1] : pts[0];
    const t = (e ? p.clone().sub(pts[pts.length - 2]) : p.clone().sub(pts[1])).normalize();
    const c = new THREE.CircleGeometry(r, radial);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), t));
    return c.translate(p.x, p.y, p.z);
  });
  g.userData.edgeAngle = 60;
  return merge(g, caps);
}

/**
 * Balayage d'une section ovale (rayon r(t) dans le plan, k·r selon Z) le long d'un arc
 * de centre c et de rayon R, de l'angle a0 à a1 (plan XY). Bouts fermés.
 */
function sweepArc(c, R, a0, a1, r, k = 1, n = 24, radial = 12) {
  const pos = [];
  const ring = (i) => {
    const t = i / n, a = a0 + (a1 - a0) * t, rr = r(t);
    const u = [Math.cos(a), Math.sin(a)];
    return Array.from({ length: radial }, (_, j) => {
      const b = (j / radial) * 2 * PI;
      return [c[0] + u[0] * (R + Math.cos(b) * rr), c[1] + u[1] * (R + Math.cos(b) * rr), Math.sin(b) * rr * k];
    });
  };
  const rings = Array.from({ length: n + 1 }, (_, i) => ring(i));
  const s = Math.sign(a1 - a0);
  const tri = (A, B, C) => (s > 0 ? pos.push(...A, ...B, ...C) : pos.push(...A, ...C, ...B));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < radial; j++) {
      const A = rings[i][j], B = rings[i][(j + 1) % radial], C = rings[i + 1][j], D = rings[i + 1][(j + 1) % radial];
      tri(A, C, B); tri(B, C, D);
    }
  }
  // Bouchons plats aux extrémités.
  for (const [i, f] of [[0, 1], [n, -1]]) {
    const ctr = rings[i].reduce((m, p) => [m[0] + p[0] / radial, m[1] + p[1] / radial, m[2] + p[2] / radial], [0, 0, 0]);
    for (let j = 0; j < radial; j++) {
      const A = rings[i][j], B = rings[i][(j + 1) % radial];
      f > 0 ? tri(ctr, A, B) : tri(ctr, B, A);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return crease(g, 50);
}

/** Barre de section rectangulaire (w × d) entre deux points, arêtes adoucies. */
function bar(a, b, w, d = w, bevel = 0.003) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const g = boxG(w, A.distanceTo(B), d, bevel);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()));
  return g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
}

/** Tôle larmée : plaque + reliefs croisés (lignes alternées à ±45°). */
function checkerPlate(x0, x1, z0, z1, y) {
  const geos = [slabXZ([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y - 0.006, y)];
  const L = 0.009, W = 0.0025, H = 0.0018;
  const v = [[-L, 0, -W], [L, 0, -W], [L, 0, W], [-L, 0, W], [-L + W, H, 0], [L - W, H, 0]];
  const tri = [[0, 4, 5], [0, 5, 1], [3, 2, 5], [3, 5, 4], [0, 3, 4], [1, 5, 2]];
  const base = [];
  for (const t of tri) for (const k of t) base.push(...v[k]);
  const step = 0.03;
  for (let i = 0, x = x0 + step / 2; x < x1 - 0.01; x += step, i++) {
    for (let j = 0, z = z0 + step / 2; z < z1 - 0.01; z += step, j++) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
      g.computeVertexNormals();
      g.rotateY((i + j) % 2 ? PI / 4 : -PI / 4);
      geos.push(g.translate(x, y, z));
    }
  }
  const out = merge(geos);
  out.userData.edgeAngle = 85;
  return out;
}

// Écran couleur de la console (dalle allumée, reflet vitré).
let screenMat = null;
function screen() {
  if (!screenMat) {
    screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b1118, emissive: 0x15324a, emissiveIntensity: 0.9, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
    });
    screenMat.name = 'screen';
  }
  return screenMat;
}

export function F04(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Chenilles droite et gauche (la gauche est le miroir de la droite)
  const rh = api.sub('F05');
  rh.position.set(-0.15, 0, 0.68);
  P('F05', rh, [0, 0, 1.15]);
  const lh = api.sub('F05');
  lh.position.set(-0.15, 0, -0.68);
  lh.scale.z = -1;
  P('F05', lh, [0, 0, -1.15]);

  P('5', api.sub('F08'), [0, 0, 0]);
  P('4', place(api.sub('F09'), [-0.21, 0.975, 0]), [0, 1.05, 0]);
  P('3', place(api.sub('F11'), [-1.78, 0.95, 0]), [-0.75, 1.05, 0]);
  P('F13', place(api.sub('F13'), [-0.21, 0.975, 0]), [0, 2.3, 0]);

  // Mât : axe local X → vertical, face tête de rotation (local +Y) → avant (+X)
  const mast = api.sub('F14');
  mast.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1),
  ));
  mast.position.set(2.05, 0.42, 0);
  P('F14', mast, [1.5, 0.35, 0]);

  P('2', basket(), [-1.5, 0.45, 0]);
  // Attelage écarté au-delà du panier (à gauche du panier sur la feuille, pas caché derrière).
  P('1', pintleHitch(), [-2.45, 1.35, 0.55]);

  // 6 — Support de console (tabouret) ; 7 — Console IP67 (bulles 6 / 7 inversées sur le dessin)
  const sx = 0.45, sz = 1.95, sh = 0.85;
  P('6', place(stool(sh), [sx, 0, sz]), [-1.9, 0, 0.9]);
  P('7', place(consoleIP67(sh), [sx, sh, sz]), [-1.9, 0.45, 0.9]);

  // La console posée à côté élargit la boîte : le plan par défaut passe par l'axe de la machine.
  return { view: { dir: [1, 0.55, 1.15], section: { axis: 'z', pos: 0.29 } } };
}

function place(obj, pos) {
  obj.position.set(...pos);
  return obj;
}

// ------------------------------------------------------------ 2 — panier arrière

const BK = { x0: -2.86, x1: -2.27, z: 0.66, y0: 0.42, y1: 1.5, t: 0.05 };

function basket() {
  const { x0, x1, z: bz, y0, y1, t } = BK;
  const red = [], grey = [], steel = [], black = [];
  // Cadre du plancher (tubes 50 × 60) et traverses ; tôle larmée.
  red.push(boxG(t, 0.06, 2 * bz, 0.004, [x0 + t / 2, y0 - 0.03, 0]));
  red.push(boxG(t, 0.06, 2 * bz, 0.004, [x1 - t / 2, y0 - 0.03, 0]));
  for (const s of [1, -1]) red.push(boxG(x1 - x0 - 2 * t, 0.06, t, 0.004, [(x0 + x1) / 2, y0 - 0.03, s * (bz - t / 2)]));
  for (const x of [-2.66, -2.47]) red.push(boxG(0.04, 0.04, 2 * bz - 2 * t, 0.003, [x, y0 - 0.026, 0]));
  const floor = checkerPlate(x0 + t, x1 - t, -bz + t, bz - t, y0);

  // Ridelles latérales : cadre en tube carré, treillis soudé, poignées cintrées.
  for (const s of [1, -1]) {
    const zc = s * (bz - t / 2);
    const xa = x0 + t / 2, xb = x1 - t / 2;
    red.push(boxG(t, y1 - y0, t, 0.004, [xa, (y0 + y1) / 2, zc]));
    red.push(boxG(t, y1 - y0, t, 0.004, [xb, (y0 + y1) / 2, zc]));
    red.push(boxG(xb - xa - t, t, t, 0.004, [(xa + xb) / 2, y1 - t / 2, zc]));
    red.push(boxG(xb - xa - t, t, t, 0.004, [(xa + xb) / 2, y0 + t / 2, zc]));
    // Treillis soudé 50 × 50 (fil Ø 5).
    const gx0 = x0 + t, gx1 = x1 - t, gy0 = y0 + t, gy1 = y1 - t;
    for (let x = gx0 + 0.045; x < gx1 - 0.01; x += 0.05) grey.push(tf(cylG(0.0025, gy1 - gy0, 6, 0.0005), [x, (gy0 + gy1) / 2, zc - s * 0.004]));
    for (let y = gy0 + 0.045; y < gy1 - 0.01; y += 0.05) grey.push(tf(axis(cylG(0.0025, gx1 - gx0, 6, 0.0005), 'x'), [(gx0 + gx1) / 2, y, zc + s * 0.0015]));
    if (s > 0) {
      // Ridelle proche (dessin) : montant intérieur et lisse formant une porte à loquet.
      const xi = x0 + 0.29;
      red.push(boxG(0.04, y1 - y0 - 2 * t, 0.04, 0.003, [xi, (y0 + y1) / 2, zc]));
      red.push(boxG(xi - x0 - t - 0.02, 0.04, 0.04, 0.003, [(x0 + t + xi - 0.02) / 2, 1.12, zc]));
      black.push(tf(boxG(0.03, 0.05, 0.02, 0.003), [xi + 0.035, 1.05, zc + 0.03]), tf(axis(cylG(0.006, 0.07, 10), 'x'), [xi + 0.015, 1.05, zc + 0.03]));
    } else {
      // Ridelle éloignée : montant avant prolongé (poteau rond à bouchon).
      red.push(tf(revolve([[0, 0], [0.021, 0], [0.021, 0.15], [0.017, 0.163], [0.008, 0.169], [0, 0.17]], 16, 40), [xb, y1, zc]));
    }
    // Poignée d'accès à l'arrière (tube Ø 33).
    red.push(pipe([[xa, 1.42, zc], [x0 - 0.06, 1.42, zc], [x0 - 0.06, 0.98, zc], [xa, 0.98, zc]], 0.0167, 0.04));
    // Patte de fixation avant sur la face arrière du réservoir (4 vis).
    red.push(boxG(0.058, 0.05, 0.05, 0.003, [x1 + 0.029, 1.2, zc]));
    red.push(slabXY(rrect(0, 0, 0.012, 0.1, 0.002, 1).map(([a, b]) => [a - 2.206, b + 1.2]), zc - 0.045, zc + 0.045));
    for (const [dy, dz] of [[0.033, 0.03], [0.033, -0.03], [-0.033, 0.03], [-0.033, -0.03]]) {
      steel.push(tf(boltHeadG(0.017, 0.008), [-2.212, 1.2 + dy, zc + dz], [0, 0, PI / 2]));
    }
  }

  // Goussets avant sous le plancher (œil d'articulation), chapes boulonnées sur la paroi
  // arrière du châssis, axes à rondelle et goupille.
  const eye = [-2.29, 0.335];
  for (const z of [0.35, -0.35]) {
    for (const dz of [-0.014, 0.014]) {
      red.push(slabXY([[-2.62, y0 - 0.06], [-2.272, y0 - 0.06], ...circ(eye[0], eye[1], 0.024, 8, 0.6, -2.75), [-2.5, 0.345]], z + dz - 0.005, z + dz + 0.005, { holes: [circ(eye[0], eye[1], 0.0115, 14)], bevel: 0.001 }));
    }
    red.push(slabXY(rrect(-2.266, 0.32, 0.012, 0.14, 0.004, 2), z - 0.065, z + 0.065, { bevel: 0.0015 }));
    for (const dz of [-0.04, 0.04]) {
      red.push(slabXY([[-2.272, 0.3], [-2.3, 0.3], [-2.316, 0.322], [-2.316, 0.348], [-2.3, 0.358], [-2.272, 0.358]], z + dz - 0.006, z + dz + 0.006, { holes: [circ(eye[0], eye[1], 0.0115, 14)] }));
    }
    steel.push(tf(axis(cylG(0.0112, 0.11, 14), 'z'), [eye[0], eye[1], z]));
    steel.push(tf(axis(revolve([[0, 0], [0.018, 0], [0.018, 0.004], [0, 0.004]], 14, 40), 'z'), [eye[0], eye[1], z + 0.046]));
    steel.push(tf(new THREE.TorusGeometry(0.008, 0.0016, 5, 12).rotateY(PI / 2), [eye[0], eye[1] + 0.012, z + 0.052]));
    for (const dy of [0.27, 0.37]) for (const dz of [-0.052, 0.052]) steel.push(tf(boltHeadG(0.017, 0.008), [-2.272, dy, z + dz], [0, 0, PI / 2]));
  }
  // Support d'attelage sous la traverse arrière (platine + goussets).
  red.push(boxG(0.012, 0.14, 0.18, 0.002, [x0 + 0.006, 0.29, 0]));
  for (const s of [1, -1]) red.push(slabXY([[x0 + 0.012, 0.22], [x0 + 0.04, 0.36], [x0 + 0.012, 0.36]], s * 0.085 - 0.005, s * 0.085 + 0.005));
  // Treillis galvanisé, plancher en tôle larmée d'aluminium.
  return G(M('red', red), M('zinc', grey), M('castAlu', floor), M('steel', steel), M('black', black));
}

// ------------------------------------------------------------ 1 — attelage à crochet 5 t

function pintleHitch() {
  const x = BK.x0, y = 0.3;
  const geos = [], dark = [], steel = [];
  // Bride carrée 4 trous contre le support, corps forgé, crochet (corne) ouvert vers le haut.
  geos.push(prismX(rrect(0, 0, 0.15, 0.14, 0.012, 2).map(([a, b]) => [a, b + y]), x - 0.022, x, { bevel: 0.002 }));
  geos.push(prismX(rrect(0, 0, 0.08, 0.075, 0.015, 3).map(([a, b]) => [a, b + y - 0.005]), x - 0.135, x - 0.02, { bevel: 0.004 }));
  const hc = [x - 0.165, y - 0.01];
  const deg = PI / 180;
  // Corne forgée : section ovale, épaisse au corps (330°), affinée vers la pointe relevée (126°).
  geos.push(sweepArc(hc, 0.045, 330 * deg, 126 * deg, (t) => 0.0205 - 0.0075 * t * t, 1.3, 28, 12));
  geos.push(new THREE.SphereGeometry(1, 12, 8).scale(0.013, 0.013, 0.017).translate(hc[0] + 0.045 * Math.cos(126 * deg), hc[1] + 0.045 * Math.sin(126 * deg), 0));
  // Linguet (verrou) : lame cintrée articulée sur le corps, posée sur la pointe de la corne.
  dark.push(sweepArc(hc, 0.05, 58 * deg, 111 * deg, () => 0.0065, 2.1, 12, 10));
  dark.push(prismX(rrect(0, 0, 0.042, 0.026, 0.006, 2).map(([a, b]) => [a, b + y + 0.044]), x - 0.14, x - 0.105, { bevel: 0.003 }));
  steel.push(tf(axis(cylG(0.007, 0.05, 12), 'z'), [x - 0.122, y + 0.048, 0]));
  // Goupille de sécurité à chaînette.
  steel.push(tf(axis(cylG(0.003, 0.05, 8), 'z'), [x - 0.1, y + 0.055, 0]));
  steel.push(tf(new THREE.TorusGeometry(0.009, 0.0018, 6, 14), [x - 0.1, y + 0.055, 0.03]));
  for (const [dy, dz] of [[0.045, 0.05], [0.045, -0.05], [-0.045, 0.05], [-0.045, -0.05]]) {
    steel.push(tf(boltHeadG(0.02, 0.01), [x - 0.022, y + dy, dz], [0, 0, PI / 2]));
    steel.push(tf(axis(hexG(0.02, 0.012, 0.007), 'x'), [x + 0.018, y + dy, dz]));
  }
  return G(M('black', geos), M('darkSteel', dark), M('steel', steel));
}

// ------------------------------------------------------------ 6 — tabouret de console

function stool(sh) {
  const red = [], black = [];
  const top = 0.23, foot = 0.255; // demi-largeurs en haut / au sol (pieds évasés)
  const k = (y) => foot - ((foot - top) * y) / sh;
  // Plateau embouti à rebord relevé.
  red.push(slabXZ(rrect(0, 0, 2 * top + 0.02, 2 * top + 0.02, 0.012, 2), sh - 0.004, sh, { bevel: 0.0012 }));
  for (const s of [1, -1]) {
    red.push(boxG(2 * top + 0.02, 0.022, 0.003, 0.001, [0, sh + 0.011, s * (top + 0.0085)]));
    red.push(boxG(0.003, 0.022, 2 * top + 0.02, 0.001, [s * (top + 0.0085), sh + 0.011, 0]));
  }
  // Pieds en tube carré 30 × 30, ceinture sous plateau, un seul rang de barreaux ronds
  // à mi-hauteur, dépassant aux angles (dessin F04 et photo F01).
  const legs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [a, b] of legs) {
    red.push(bar([a * k(0.012), 0.012, b * k(0.012)], [a * top, sh - 0.004, b * top], 0.03));
    black.push(boxG(0.036, 0.012, 0.036, 0.003, [a * k(0.006), 0.006, b * k(0.006)]));
  }
  const ya = sh - 0.03;
  for (const s of [1, -1]) {
    red.push(boxG(2 * k(ya), 0.025, 0.02, 0.002, [0, ya, s * k(ya)]));
    red.push(boxG(0.02, 0.025, 2 * k(ya), 0.002, [s * k(ya), ya, 0]));
  }
  {
    const y = 0.37, w = k(y);
    for (const s of [1, -1]) {
      red.push(tf(axis(cylG(0.009, 2 * w + 0.05, 12), 'x'), [0, y, s * w]));
      red.push(tf(axis(cylG(0.009, 2 * w + 0.05, 12), 'z'), [s * w, y, 0]));
    }
    // Cordons de soudure des barreaux sur les pieds.
    for (const [a, b] of legs) {
      for (const along of ['x', 'z']) {
        const ring = new THREE.TorusGeometry(0.0105, 0.0022, 4, 12);
        if (along === 'x') ring.rotateY(PI / 2);
        const off = 0.0165;
        red.push(ring.translate(a * w - (along === 'x' ? a * off : 0), y, b * w - (along === 'z' ? b * off : 0)));
      }
    }
  }
  // Embase du câble de console (bridée sur le pied arrière) et câble déroulé au sol.
  const yR = 0.45, xR = -k(yR) - 0.035, zR = k(yR);
  const metal = [
    tf(revolve([[0, -0.0225], [0.017, -0.0225], [0.017, 0.018], [0.0195, 0.0195], [0.0195, 0.0225], [0, 0.0225]], 18, 35), [xR, yR, zR]),
    boxG(0.02, 0.05, 0.036, 0.002, [xR + 0.022, yR, zR]),
    ...[-0.015, 0.015].map((dy) => tf(new THREE.TorusGeometry(0.023, 0.0018, 5, 16).rotateX(PI / 2), [-k(yR + dy), yR + dy, zR])),
  ];
  const cable = pipe([
    [xR, yR - 0.03, zR], [xR - 0.005, 0.25, zR + 0.01], [xR - 0.02, 0.06, zR + 0.03], [xR - 0.07, 0.0075, zR - 0.04],
    [-0.45, 0.0075, 0.05], [-0.6, 0.0075, -0.02], [-0.75, 0.0075, 0.04], [-0.85, 0.0075, 0.04],
  ], 0.0075, 0.08, 10);
  // Connecteur rond au bout du câble (corps, bague moletée, manchon).
  metal.push(tf(axis(revolve([[0, 0], [0.009, 0], [0.012, 0.012], [0.015, 0.02], [0.015, 0.045], [0.0165, 0.047], [0.0165, 0.062], [0.014, 0.065], [0, 0.065]], 18, 35), '-x'), [-0.845, 0.016, 0.04]));
  return G(M('red', red), M('rubber', black), M('rubber', cable), M('darkSteel', metal));
}

// ------------------------------------------------------------ 7 — console IP67

// Disposition de la face d'après la photo F22 (pixels de l'image affichée, 820 × 560 px).
const KF = 0.000494; // mètres par pixel

function consoleIP67() {
  const D = 0.32, W = 0.42, hB = 0.15, hF = 0.06, bev = 0.004;
  const g = G();
  // Coffret à face inclinée (plus haut à l'arrière, côté machine) : caisson, joint
  // noir et couvercle débordant de 3 mm qui porte la façade.
  const lidT = 0.0083; // couvercle + joint, mesurés selon la verticale
  g.add(M('lightGrey', slabXY([[-D / 2, 0], [D / 2, 0], [D / 2, hF - lidT], [-D / 2, hB - lidT]], -W / 2, W / 2, { bevel: bev, deg: 40 })));
  // Repère de la face : x → droite de la photo (-Z), y → normale, z → bas de la photo (vers l'avant).
  const dx = D, dy = hF - hB, L = Math.hypot(dx, dy);
  const down = new THREE.Vector3(dx / L, dy / L, 0);
  const n = new THREE.Vector3(-dy / L, dx / L, 0);
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), n, down).setPosition(0, (hB + hF) / 2 + bev, 0);
  const F = {};
  const add = (m, geo) => { (F[m] = F[m] || []).push(geo); };
  add('lightGrey', tf(boxG(W + 0.006 - 0.003, 0.0065 - 0.003, L + 0.014, 0.0015), [0, -0.00325, 0]));
  add('rubber', tf(boxG(W - 0.002, 0.0012, L + 0.006, 0.0002), [0, -0.0072, 0]));
  const at = (px, py, h = 0) => [(px - 495) * KF, h, (py - 405) * KF];
  const plate = (m, px, py, w, h, th, h0 = 0.0015, r = 0.003) => add(m, tf(boxG(w * KF, th, h * KF, Math.min(r, th / 2.5)), at(px, py, h0 + th / 2)));
  // Film de façade (polyester blanc) et zones imprimées.
  add('white', tf(boxG(0.405, 0.0015, 0.278, 0.0006), [0, 0.00075, 0]));
  plate('lightGrey', 497, 385, 295, 150, 0.0008);
  plate('lightGrey', 492, 567, 345, 195, 0.0008);
  plate('red', 535, 450, 160, 16, 0.0006, 0.0023);
  plate('green', 580, 322, 40, 20, 0.0006, 0.0023);
  plate('red', 492, 485, 300, 22, 0.0006, 0.0023);
  plate('red', 492, 652, 300, 20, 0.0006, 0.0023);
  for (const [px, py] of [[215, 490], [795, 490], [215, 636], [795, 636]]) {
    plate('white', px, py, 135, 22, 0.0008);
    for (const dx2 of [-30, 10]) plate('red', px + dx2, py, 22, 16, 0.0005, 0.0023);
  }
  // Potentiomètres « Hold back » / « Pull-down » : platine sombre, bouton moleté.
  for (const py of [212, 377]) {
    plate('charcoal', 225, py, 180, 125, 0.0015, 0.0015, 0.004);
    add('white', tf(new THREE.TorusGeometry(0.03, 0.0012, 4, 28, PI * 1.5).rotateX(-PI / 2).rotateY(PI * 0.25), at(225, py, 0.0032)));
    // Bouton : jupe noire moletée, disque central alu (photo F22).
    add('black', tf(revolve([[0, 0], [0.024, 0], [0.024, 0.008], [0.0225, 0.0115], [0.0175, 0.0125], [0.0175, 0.011], [0, 0.011]], 24, 30), at(225, py, 0.003)));
    add('steel', tf(revolve([[0, 0], [0.0172, 0], [0.0172, 0.0012], [0.016, 0.0018], [0, 0.0018]], 24, 30), at(225, py, 0.0138)));
    add('white', tf(boxG(0.0022, 0.0006, 0.004, 0.0002), at(225, py - 41, 0.0151)));
  }
  // Afficheur couleur : lunette noire en relief, dalle, 4 touches.
  add('black', tf(slabXZ(rrect(0, 0, 227 * KF, 165 * KF, 0.008, 3), 0, 0.012, { holes: [rrect(0, -8 * KF, 197 * KF, 108 * KF, 0.002, 1)], bevel: 0.0015 }), at(491, 222, 0.0015)));
  add('charcoal', tf(boxG(200 * KF, 0.004, 112 * KF, 0.0005), at(491, 214, 0.0035)));
  for (const px of [432, 472, 512, 552]) add('charcoal', tf(boxG(0.014, 0.004, 0.008, 0.0012), at(px, 284, 0.0135)));
  // Plaque signalétique vierge (emplacement du logo).
  plate('charcoal', 760, 192, 260, 95, 0.002, 0.0015, 0.003);
  plate('lightGrey', 760, 192, 236, 72, 0.0008, 0.0035, 0.002);
  // Arrêt d'urgence (collerette jaune, champignon rouge) et commutateur « feu ».
  plate('black', 772, 290, 205, 80, 0.003, 0.0015, 0.004);
  add('safety', tf(revolve([[0, 0], [0.021, 0], [0.021, 0.004], [0.018, 0.007], [0, 0.007]], 24, 35), at(835, 290, 0.0045)));
  add('red', tf(revolve([[0, 0], [0.011, 0], [0.011, 0.012], [0.017, 0.013], [0.0185, 0.017], [0.016, 0.022], [0.008, 0.025], [0, 0.0255]], 24, 35), at(835, 290, 0.0115)));
  add('charcoal', tf(boxG(0.022, 0.006, 0.026, 0.002), at(725, 290, 0.0075)));
  add('steel', tf(cylG(0.0075, 0.008, 16, 0.001), at(725, 290, 0.0145)));
  add('black', tf(boxG(0.004, 0.006, 0.012, 0.001), at(725, 290, 0.021)));
  // Sélecteur 3 positions (TRAM / SET-UP / DRILLING) : étiquette, collerette, manette.
  plate('white', 718, 385, 80, 60, 0.0008);
  plate('red', 714, 385, 62, 12, 0.0005, 0.0023);
  add('black', tf(revolve([[0, 0], [0.016, 0], [0.016, 0.004], [0.013, 0.007], [0, 0.007]], 20, 35), at(778, 385, 0.0015)));
  add('black', tf(boxG(0.007, 0.016, 0.03, 0.002), at(778, 385, 0.016)));
  // Claviers 8 et 12 touches (touches blanches bombées).
  const keypad = (cx, cy, w, h, xs, ys) => {
    plate('black', cx, cy, w, h, 0.006, 0.0023, 0.003);
    for (const px of xs) for (const py of ys) add('white', tf(revolve([[0, 0], [0.0085, 0], [0.0085, 0.0015], [0.006, 0.0035], [0, 0.004]], 14, 35), at(px, py, 0.0083)));
  };
  keypad(495, 385, 240, 100, [420, 472, 524, 576], [365, 405]);
  keypad(495, 575, 300, 110, [390, 435, 480, 525, 570, 615], [553, 598]);
  // Manipulateurs : platine vissée, soufflet caoutchouc, poignée ergonomique.
  // Manipulateurs (photo F22) : collerette claire vissée, gros soufflet noir, poignée noire
  // (pommeau en T à gauche, levier coudé à droite), pas de bouton de couleur.
  for (const px of [215, 795]) {
    add('lightGrey', tf(revolve([[0, 0], [0.036, 0], [0.036, 0.0022], [0.0345, 0.0032], [0, 0.0032]], 28, 40), at(px, 570, 0.0015)));
    for (const [ox, oy] of [[-58, -55], [58, -55], [-58, 55], [58, 55]]) add('steel', tf(revolve([[0, 0], [0.0045, 0], [0.004, 0.0015], [0, 0.0022]], 10, 40), at(px + ox, 570 + oy, 0.0015)));
    add('rubber', tf(revolve([[0, 0], [0.033, 0], [0.033, 0.006], [0.028, 0.01], [0.023, 0.015], [0.018, 0.022], [0.013, 0.03], [0.009, 0.032], [0, 0.032]], 24, 45), at(px, 570, 0.0047)));
    add('black', tf(revolve([[0, 0], [0.012, 0], [0.0135, 0.015], [0.0158, 0.04], [0.0162, 0.055], [0.0145, 0.067], [0.009, 0.0735], [0, 0.075]], 20, 40), at(px, 570, 0.034)));
  }
  // Pommeau en T (gauche) et levier déporté vers l'extérieur (droite).
  add('black', tf(axis(cylG(0.011, 0.05, 16, 0.004), 'x'), at(215, 570, 0.1)));
  add('black', tf(axis(cylG(0.0105, 0.058, 16, 0.004), 'x'), at(795 + 52, 570, 0.097)));
  // Vis du couvercle.
  for (const [px, py] of [[95, 135], [895, 135], [95, 675], [895, 675], [495, 135], [495, 675]]) add('steel', tf(revolve([[0, 0], [0.004, 0], [0.0035, 0.0015], [0, 0.002]], 10, 40), at(px, py, 0.0015)));
  for (const [m, list] of Object.entries(F)) {
    const geo = merge(list);
    geo.applyMatrix4(basis);
    g.add(M(m, geo));
  }
  // Écran (matériau propre, légèrement lumineux).
  const disp = tf(boxG(190 * KF, 0.0012, 100 * KF, 0.0004), at(491, 214, 0.006));
  disp.applyMatrix4(basis);
  g.add(new THREE.Mesh(disp, screen()));
  // Presse-étoupe arrière, câble court et fiche enfichée dans l'embase du tabouret.
  const gz = 0.12, gy = 0.08;
  g.add(M('grey', tf(axis(merge(hexG(0.03, 0.012), tf(revolve([[0, 0], [0.013, 0], [0.012, 0.012], [0.008, 0.02], [0, 0.02]], 16, 40), [0, 0.006, 0])), '-x'), [-D / 2 - bev - 0.006, gy, gz])));
  // Embase du tabouret : y = 0.45, x = -0.277, z = 0.242 (repère du tabouret) ; dessus à 0.4725.
  const plug = [-0.277, 0.4725 - 0.85, 0.242];
  g.add(M('rubber', pipe([[-D / 2 - 0.03, gy, gz], [-0.25, gy - 0.005, gz + 0.01], [-0.29, 0.02, 0.17], [-0.29, -0.1, 0.22], [plug[0], plug[1] + 0.12, plug[2]], [plug[0], plug[1] + 0.06, plug[2]]], 0.0075, 0.05, 10)));
  g.add(M('darkSteel', tf(revolve([[0, 0], [0.0165, 0], [0.0165, 0.016], [0.0155, 0.018], [0.0155, 0.04], [0.012, 0.05], [0.0095, 0.062], [0, 0.062]], 18, 35), plug)));
  return g;
}
