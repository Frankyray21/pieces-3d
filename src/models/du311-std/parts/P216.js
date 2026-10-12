// P216 — Tuyauterie d'air de la glissière CX012212 rév. 2 « PIPE ASSY,
// SINGLE SLIDEOVER » (page 216 : vue de dessus du porteur, coupes A-A et
// B-B), repère 4 de P208. Conduite 2 po (tube Ø 2 3/8 po, schedule 80)
// soudée, peinte, en deux tronçons le long du flanc gauche du châssis avant :
// tronçon arrière (4) qui part de l'articulation (bride carrée à souder
// code 61 tournée vers l'arrière et l'axe, raccord du flexible à bride P208
// repère 37), coude de 18° puis ligne droite jusqu'à son collet à bride ;
// tronçon avant (5) : bride carrée à souder, ligne droite le long du flanc,
// deux coudes à souder 90° grand rayon qui ramènent la conduite vers l'axe,
// traversée du nez et bride carrée de sortie sur la face avant (vers la
// glissière). Trois trousses de demi-brides 2 po code 61 (6 : deux
// demi-brides, quatre vis H 1/2-13, rondelles Grower, joint torique) aux deux
// bouts et à la jonction. Deux colliers (coupe A-A) contre la face intérieure
// du flanc : embase soudée (1) à deux taraudages, collier en deux coquilles
// de polypropylène (2) avec ses deux vis, plaque de serrage (3).
// Repère machine (P208 le place à l'identité) : axe de la conduite à
// y = PIPE.y = 0.85, ligne droite à z = −0.42 (0,045 m du flanc gauche des
// châssis de layout.js), sortie au nez à z = −0.15 ; bride arrière à
// x = 0.41 (PIPE.rear exporté par ../_fronta.js pour le flexible de P208).
// Tout l'ensemble est sur le châssis avant (corps « front »).
import { M, body } from '../layout.js';
import { portedBlock, flangeHead, splitFlange, j518 } from '../../du311/parts/_chassis.js';
import { IN, PIPE, pose } from './_fronta.js';

const RO = PIPE.r, Y = PIPE.y, ZS = PIPE.z, ZN = PIPE.zNose;
const RB = 3 * IN; // rayon de cintrage des coudes à souder (1,5 D)
const XJ = 0.96; // plan de jonction des deux tronçons (face de la bride carrée du tronçon 5)
const TB = 0.035; // épaisseur des brides carrées à souder

export default function P216(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, body('front', obj), e);
  const V = (a) => new THREE.Vector3(...a);
  const f = j518(32, 61);

  // Ligne brisée à congés de rayon R (arcs vrais) → tube peint.
  const pipe = (pts, R) => {
    const path = new THREE.CurvePath();
    const P3 = pts.map(V);
    let cur = P3[0].clone();
    for (let i = 1; i < P3.length - 1; i++) {
      const a = P3[i - 1], b = P3[i], c = P3[i + 1];
      const u = b.clone().sub(a).normalize(), w = c.clone().sub(b).normalize();
      const ang = Math.acos(Math.min(1, Math.max(-1, u.dot(w))));
      const t = R * Math.tan(ang / 2);
      const p0 = b.clone().addScaledVector(u, -t), p1 = b.clone().addScaledVector(w, t);
      path.add(new THREE.LineCurve3(cur, p0));
      // Arc : centre sur la bissectrice.
      const n = w.clone().sub(u).normalize();
      const ctr = b.clone().addScaledVector(n, R / Math.cos(ang / 2));
      const pts2 = [];
      for (let k = 0; k <= 10; k++) {
        const q0 = p0.clone().sub(ctr), q1 = p1.clone().sub(ctr);
        pts2.push(ctr.clone().add(q0.multiplyScalar(Math.sin((1 - k / 10) * ang)).add(q1.multiplyScalar(Math.sin((k / 10) * ang))).divideScalar(Math.sin(ang))));
      }
      for (let k = 0; k < 10; k++) path.add(new THREE.LineCurve3(pts2[k], pts2[k + 1]));
      cur = p1;
    }
    path.add(new THREE.LineCurve3(cur, P3[P3.length - 1]));
    const n = Math.max(8, path.curves.length * 2);
    return S.merged([new THREE.Mesh(new THREE.TubeGeometry(path, n, RO, 24, false))], 'grey');
  };
  // Cordon de soudure circulaire autour du tube au point pos, axe dir.
  const weldAt = (pos, dir, r = RO + 0.0015) => pose(THREE, S.weldRing(r, 0.006, 'grey'), pos, dir);
  // Bride carrée à souder 2 po code 61 : face d'appui en pos, normale sortante dir ; 4 taraudages 1/2-13.
  const squareFlange = (pos, dir, side) => {
    const holes = [[0, 0, f.rb, TB * 2]];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) holes.push([sx * f.L / 2, sy * f.W / 2, f.d * 0.42, 0.022]);
    const b = portedBlock(api, f.L + f.d * 2.6, f.W + f.d * 2.6, TB, 'grey', holes, { spot: 0, machined: 'steel' });
    b.position.z = -TB / 2;
    b.rotation.set(0, 0, 0);
    const g = S.group(b);
    g.rotation.x = -Math.PI / 2; // face +Z → +Y
    return pose(THREE, S.group(g), pos, dir, side);
  };

  // ---------------------------------------------------------------- 4 — tronçon arrière
  {
    const R0 = V(PIPE.rear.pos), d = V(PIPE.rear.dir).normalize();
    const A0 = R0.clone().addScaledVector(d, -TB);
    // Coin où la direction arrière rejoint la ligne droite z = ZS.
    const t = (A0.z - ZS) / d.z;
    const C1 = A0.clone().addScaledVector(d, -t);
    const xEnd = XJ - f.hc - 0.02; // pied du collet à bride
    const g = S.group(
      pipe([A0.toArray(), C1.toArray(), [xEnd, Y, ZS]], RB * 1.2),
      squareFlange(PIPE.rear.pos, PIPE.rear.dir, [0, 1, 0]),
      pose(THREE, flangeHead(api, 32, 61, 0.02, 'grey'), [XJ, Y, ZS], [-1, 0, 0]),
      weldAt(A0.toArray(), d.toArray()),
      weldAt([xEnd, Y, ZS], [1, 0, 0]),
    );
    P('4', g, [-0.12, 0.1, -0.05]);
  }

  // ---------------------------------------------------------------- 5 — tronçon avant
  {
    const xb = XJ + TB; // dos de la bride carrée de jonction
    const XF = PIPE.front.pos[0]; // face de la bride de sortie
    const xc = 1.8; // coudes vers l'axe
    const pts = [[xb, Y, ZS], [xc, Y, ZS], [xc, Y, ZN], [XF - TB, Y, ZN]];
    const g = S.group(
      pipe(pts, RB),
      squareFlange([XJ, Y, ZS], [-1, 0, 0], [0, 1, 0]),
      squareFlange(PIPE.front.pos, [1, 0, 0], [0, 1, 0]),
      weldAt([xb, Y, ZS], [1, 0, 0]),
      // Soudures bout à bout des deux coudes (quatre cordons).
      weldAt([xc - RB, Y, ZS], [1, 0, 0]), weldAt([xc, Y, ZS + RB], [0, 0, 1]),
      weldAt([xc, Y, ZN - RB], [0, 0, 1]), weldAt([xc + RB, Y, ZN], [1, 0, 0]),
      weldAt([XF - TB, Y, ZN], [1, 0, 0]),
    );
    P('5', g, [0.1, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 6 — trousses de demi-brides 2 po code 61
  const kit = (pos, dir, e) => {
    const sf = splitFlange(api, 32, 61);
    const o = S.group(sf.obj, S.torus((f.rb + f.rh) / 2 - 0.001, 0.0018, 'rubber', { pos: [0, 0.0006, 0] }));
    P('6', pose(THREE, o, pos, dir, [0, 1, 0]), e);
  };
  kit(PIPE.rear.pos, PIPE.rear.dir, [-0.12, 0.05, 0.04]);
  kit([XJ, Y, ZS], [-1, 0, 0], [-0.08, 0.06, 0]);
  kit(PIPE.front.pos, PIPE.front.dir, [0.12, 0.05, 0]);

  // ---------------------------------------------------------------- 1, 2, 3 — colliers contre le flanc gauche
  const zw = -(M.frameZ - 0.015); // face intérieure du flanc gauche
  for (const x of [1.25, 1.7]) {
    // 1 — embase soudée (plat 90 × 130 × 10) à deux taraudages, cordons d'angle.
    const base = S.group(
      S.box(0.04, 0.13, 0.01, 'grey', { r: 0.002, pos: [x, Y, zw + 0.005] }),
      S.weld([[x - 0.02, Y - 0.065, zw + 0.001], [x - 0.02, Y + 0.065, zw + 0.001]], 0.005, 'grey'),
      S.weld([[x + 0.02, Y - 0.065, zw + 0.001], [x + 0.02, Y + 0.065, zw + 0.001]], 0.005, 'grey'),
    );
    P('1', base, [0, 0, 0.06]);
    // 2 — collier : deux coquilles (alésage Ø 60,3) et deux vis CHC M10 à travers la plaque.
    const zc = ZS, zA = zw + 0.01, zB = zc + (zc - zA);
    const half = (za, zb) => {
      const shape = new THREE.Shape();
      const w = 0.03, h = 0.115;
      shape.moveTo(-h / 2, 0);
      shape.lineTo(-RO - 0.0005, 0);
      for (let i = 0; i <= 16; i++) { const a = Math.PI - (i / 16) * Math.PI; shape.lineTo((RO + 0.0005) * Math.cos(a), (RO + 0.0005) * Math.sin(a)); }
      shape.lineTo(h / 2, 0);
      shape.lineTo(h / 2, Math.abs(zb - za) - 0.003);
      shape.lineTo(h / 2 - 0.003, Math.abs(zb - za));
      shape.lineTo(-h / 2 + 0.003, Math.abs(zb - za));
      shape.lineTo(-h / 2, Math.abs(zb - za) - 0.003);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false, curveSegments: 8 });
      geo.translate(0, 0, -w / 2);
      S.creaseNormals(geo);
      // (u, v, w) → (Y, ±Z, ±X) : v vers la coquille (zb > za : +Z), base directe.
      const m = new THREE.Mesh(geo);
      const sg = zb > za ? 1 : -1;
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V([0, 1, 0]), V([0, 0, sg]), V([sg, 0, 0])));
      m.position.set(x, Y, zc);
      return m;
    };
    const screws = [];
    for (const s of [-1, 1]) {
      screws.push(S.cyl(0.005, zB + 0.006 - zA + 0.008, 'zinc', { axis: 'z', seg: 10, pos: [x, Y + s * 0.045, (zA + zB + 0.006) / 2 - 0.004] }));
      screws.push(S.at(S.nut(0.016, 0.0065, 'zinc', { axis: 'z' }), [x, Y + s * 0.045, zB + 0.006 + 0.0033]));
    }
    P('2', S.group(S.merged([half(zc, zA), half(zc, zB)], 'black'), S.merged(screws, 'zinc')), [0, 0, 0.1]);
    // 3 — plaque de serrage (tôle 6 mm) sur la coquille extérieure.
    P('3', S.box(0.032, 0.115, 0.006, 'zinc', { r: 0.002, pos: [x, Y, zB + 0.003] }), [0, 0, 0.15]);
  }

  return { view: { dir: [0.6, 0.8, -1.0] } };
}
