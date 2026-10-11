// Toit / canopée (F13). Repère : pieds du cadre au niveau du plancher (y = 0),
// dessus du cadre à y = 0,85, X vers l'avant, +Z côté console (droite).
// Comme aux dessins F13 / F04 : cadre en tube carré rouge à décrochement (tôle
// n° 3), deux pieds avant inclinés, un pied intermédiaire côté -Z, pattes de
// fixation à l'arrière ; plaque de manomètres sur le pied avant droit.
import * as THREE from 'three';
import { KIT } from './tank.js';

const { V3, toAxis, xf, aim, box, cyl, ring, revolve, hex, shapeGeo, extY, roundPoly, pipe, weld, bag, bolt, capScrew, buttonHead, hose, nameplate } = KIT;

const T = 0.85, S = 0.05, YC = T - S / 2; // dessus du cadre, section du tube, axe des tubes
const XR = -0.975, XF = 0.835, ZR = 0.625; // axes : traverse arrière, traverse avant, longerons
const XC = 0.15, XN = -0.34, ZN = -0.31; // traverse médiane, décrochement de la tôle 3
const FOOT = [[0.975, 0.655], [0.975, -0.655]]; // pieds avant (x, z) au plancher
const XM = XC, ZM = -0.56; // pied intermédiaire

/** Tube carré entre deux points (section S, arêtes arrondies). */
function bar(B, a, b, s = S, m = 'red') {
  const A = V3(a), Bv = V3(b), L = A.distanceTo(Bv);
  B.add(m, aim(box(s, L, s, 0.008), A.clone().add(Bv).multiplyScalar(0.5), Bv.clone().sub(A)));
}

/** Cordons autour de l'about d'un tube carré (axe dir, centre c) contre une face. */
function weldRing(B, c, dir, s = S) {
  const D = V3(dir).normalize();
  const U = Math.abs(D.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const R = new THREE.Vector3().crossVectors(D, U).normalize(), W = new THREE.Vector3().crossVectors(R, D).normalize();
  const C = V3(c), h = s / 2 + 0.002;
  for (const [p, q] of [[R, W], [W, R]]) {
    for (const sg of [-1, 1]) {
      const m = C.clone().addScaledVector(p, sg * h);
      if (m.y > T - 0.006) continue; // pas de cordon sous les tôles
      B.soft('red', weld(m.clone().addScaledVector(q, -s / 2 + 0.006), m.clone().addScaledVector(q, s / 2 - 0.006), 0.0032));
    }
  }
}

/** Manomètre encastré (face +Z) : boîtier inox, lunette, cadran, aiguille, raccord arrière. */
function panelGauge(B, [x, y, z], r) {
  const at = (geo, dz = 0) => xf(toAxis(geo, 'z'), [x, y, z + dz]);
  B.add('chrome', at(revolve([[0, -0.034], [r * 0.9, -0.034], [r * 0.94, -0.03], [r * 0.94, -0.004], [r * 1.12, -0.003],
    [r * 1.12, 0.004], [r * 1.05, 0.009], [r * 0.9, 0.009], [r * 0.9, 0.005], [0, 0.005]], 28)));
  B.add('white', at(cyl(r * 0.9, 0.002, { seg: 28 }), 0.005));
  for (let i = 0; i <= 10; i++) {
    const a = ((-135 + i * 27) * Math.PI) / 180, major = i % 2 === 0, l = r * (major ? 0.16 : 0.09), rr = r * 0.74 - l / 2;
    B.add('black', xf(box(r * (major ? 0.04 : 0.022), l, 0.0008), [x + Math.sin(a) * rr, y + Math.cos(a) * rr, z + 0.0064], [0, 0, -a]));
  }
  const na = -0.9 + (x * 7 + y * 13) % 1.2; // aiguilles à des positions variées
  B.add('red', xf(box(r * 0.05, r * 0.72, 0.0008), [x + Math.sin(na) * r * 0.27, y + Math.cos(na) * r * 0.27, z + 0.0072], [0, 0, -na]));
  B.add('black', at(cyl(r * 0.08, 0.002, { seg: 12 }), 0.0075));
  B.add('glass', at(cyl(r * 0.9, 0.0015, { seg: 28 }), 0.0085));
  B.add('brass', xf(toAxis(hex(0.014, 0.008), '-z'), [x, y, z - 0.038]));
  B.add('brass', xf(toAxis(cyl(0.004, 0.012, { seg: 10 }), '-z'), [x, y, z - 0.048]));
}

export function F13(api) {
  const P = (ref, g, e) => api.part(ref, g, e);

  // 1 — Cadre de canopée : longerons, traverses, décrochement, pieds, pattes, soudures.
  {
    const B = bag();
    for (const z of [ZR, -ZR]) bar(B, [-1.0, YC, z], [0.86, YC, z]);
    for (const x of [XR, XF, XC]) bar(B, [x, YC, -ZR + S / 2], [x, YC, ZR - S / 2]);
    bar(B, [XN, YC, -ZR + S / 2], [XN, YC, ZN + S / 2]);
    bar(B, [XN - S / 2, YC, ZN], [XC - S / 2, YC, ZN]);
    for (const x of [XR, XF, XC]) for (const s of [1, -1]) weldRing(B, [x, YC, s * (ZR - S / 2)], [0, 0, s]);
    weldRing(B, [XN, YC, -ZR + S / 2], [0, 0, -1]);
    weldRing(B, [XC - S / 2, YC, ZN], [1, 0, 0]);
    // Pieds avant inclinés (vers l'avant), semelles boulonnées au plancher.
    for (const [fx, fz] of FOOT) {
      const s = Math.sign(fz), top = [XF, YC - S / 2, s * ZR], foot = [fx, 0.012, fz];
      bar(B, top, foot);
      weldRing(B, top, V3(foot).sub(V3(top)));
      B.add('red', xf(extY(roundPoly([[-0.075, -0.05], [0.075, -0.05], [0.075, 0.05], [-0.075, 0.05]], 0.01, 2), 0.012, { holes: [[-0.05, 0, 0.008], [0.05, 0, 0.008]] }), [fx, 0.006, fz]));
      weldRing(B, [fx, 0.012 + S / 2 * 0.2, fz], [0, 1, 0]);
      for (const dx of [-0.05, 0.05]) B.add('steel', bolt([fx + dx, 0.012, fz], [0, 1, 0], 0.012));
    }
    // Pied intermédiaire (côté -Z) avec gousset sous la traverse médiane.
    bar(B, [XM, YC - S / 2, ZM], [XM, 0.012, ZM]);
    weldRing(B, [XM, YC - S / 2, ZM], [0, -1, 0]);
    B.add('red', xf(shapeGeo([[ZM + S / 2, YC - S / 2], [ZM + 0.2, YC - S / 2], [ZM + S / 2, YC - S / 2 - 0.17]], 0.008).rotateY(-Math.PI / 2), [XM, 0, 0]));
    B.add('red', xf(extY(roundPoly([[-0.05, -0.075], [0.05, -0.075], [0.05, 0.075], [-0.05, 0.075]], 0.01, 2), 0.012, { holes: [[0, -0.05, 0.008], [0, 0.05, 0.008]] }), [XM, 0.006, ZM]));
    weldRing(B, [XM, 0.017, ZM], [0, 1, 0]);
    for (const dz of [-0.05, 0.05]) B.add('steel', bolt([XM, 0.012, ZM + dz], [0, 1, 0], 0.012));
    // Pattes de fixation arrière (plats coudés percés).
    for (const z of [0.5, -0.5]) {
      const a = [XR - S / 2 - 0.004, YC - 0.01, z], b = [XR - S / 2 - 0.05, YC - 0.19, z];
      B.add('red', aim(shapeGeo([[-0.025, -0.095], [0.025, -0.095], [0.025, 0.095], [-0.025, 0.095]], 0.008, { holes: [[0, 0.04, 0.007], [0, -0.03, 0.007]] }).rotateY(Math.PI / 2), V3(a).add(V3(b)).multiplyScalar(0.5), V3(a).sub(V3(b))));
      B.add('red', xf(shapeGeo([[-0.03, -0.025], [0.03, -0.025], [0.03, 0.025], [-0.03, 0.025]], 0.008, { holes: [[0, 0, 0.007]] }).rotateX(Math.PI / 2), [b[0] - 0.024, b[1] - 0.004, z]));
    }
    // Patte du support des filtres HP (sous la traverse médiane), pattes de la plaque de manomètres.
    B.add('red', xf(box(0.008, 0.06, 0.32, 0.002), [XC + S / 2 + 0.004, YC - 0.035, 0.255]));
    B.add('red', xf(box(0.08, 0.04, 0.008, 0.002), [0.74, YC - S / 2 - 0.02, ZR + S / 2 + 0.004]));
    B.add('red', xf(box(0.15, 0.035, 0.008, 0.002), [0.855, 0.3, ZR + S / 2 + 0.024]));
    P('1', B.group(), [0, 0, 0]);
  }

  // Tôles de couverture (noires, bords tombés, vis à tête bombée) :
  // 2 — grande tôle à trappe ronde, 3 — bande du décrochement, 4 — tôle avant.
  const X0 = -1.012, X1 = 0.872, Z0 = 0.662, G = 0.002, TH = 0.003, Y = T + TH / 2;
  const cover = (B, poly, flanges, screws, holes = []) => {
    B.add('black', xf(extY(poly, TH, { holes }), [0, Y, 0]));
    for (const [a, b] of flanges) {
      const A = V3([a[0], Y - 0.012, a[1]]), Bv = V3([b[0], Y - 0.012, b[1]]), L = A.distanceTo(Bv);
      const d = Bv.clone().sub(A).normalize(), n = new THREE.Vector3(-d.z, 0, d.x);
      const g = box(L, 0.025, TH, 0.0008);
      g.applyMatrix4(new THREE.Matrix4().makeBasis(d, new THREE.Vector3(0, 1, 0), n));
      B.add('black', g.translate(...A.add(Bv).multiplyScalar(0.5).toArray()));
    }
    for (const [x, z] of screws) B.add('steel', buttonHead([x, T + TH, z], [0, 1, 0], 0.007));
  };
  {
    const B = bag();
    const poly = [[X0, -Z0], [XN - G, -Z0], [XN - G, ZN + G], [XC - G, ZN + G], [XC - G, Z0], [X0, Z0]];
    cover(B, poly, [[[X0, Z0], [X0, -Z0]], [[X0 + 0.0015, Z0], [XC - G, Z0]], [[X0 + 0.0015, -Z0], [XN - G, -Z0]]],
      [[-0.975, 0.625], [-0.975, -0.625], [-0.975, 0], [XC - 0.025, 0.625], [XC - 0.025, -0.25], [-0.42, 0.625], [-0.42, -0.625], [XN, ZN + 0.025], [XC - 0.025, 0.2]],
      [[-0.85, 0.32, 0.085]]);
    // Trappe ronde : couvercle à poignée et oreilles de verrouillage.
    B.add('black', xf(revolve([[0, 0], [0.1, 0], [0.1, 0.004], [0.096, 0.006], [0, 0.006]], 32), [-0.85, T + TH, 0.32]));
    B.add('black', xf(box(0.06, 0.016, 0.022, 0.005), [-0.85, T + TH + 0.014, 0.32]));
    for (const s of [-1, 1]) {
      B.add('black', xf(box(0.03, 0.004, 0.026, 0.002), [-0.85 + s * 0.11, T + TH + 0.002, 0.32]));
      B.add('steel', buttonHead([-0.85 + s * 0.115, T + TH + 0.004, 0.32], [0, 1, 0], 0.006));
    }
    P('2', B.group(), [-0.08, 0.55, 0]);
  }
  {
    const B = bag();
    const poly = [[XN + G, -Z0], [XC - G, -Z0], [XC - G, ZN - G], [XN + G, ZN - G]];
    cover(B, poly, [[[XN + G, -Z0], [XC - G, -Z0]]], [[XN + 0.03, -0.625], [XC - 0.03, -0.625], [-0.1, -0.625], [XN + 0.03, ZN], [XC - 0.03, ZN]]);
    P('3', B.group(), [0, 0.72, -0.42]);
  }
  {
    const B = bag();
    const poly = [[XC + G, -Z0], [X1, -Z0], [X1, Z0], [XC + G, Z0]];
    cover(B, poly, [[[X1, -Z0], [X1, Z0]], [[XC + G, Z0], [X1 - 0.0015, Z0]], [[XC + G, -Z0], [X1 - 0.0015, -Z0]]],
      [[XC + 0.025, 0.625], [XC + 0.025, -0.625], [0.835, 0.625], [0.835, -0.625], [0.835, 0], [0.5, 0.625], [0.5, -0.625], [XC + 0.025, 0]]);
    P('4', B.group(), [0.16, 0.55, 0]);
  }

  // 9 — Plaque de manomètres (sur le pied avant droit), capillaires vers le bloc 5.
  const GX = 0.74, GZ = ZR + S / 2 + 0.012, GY = [0.69, 0.6, 0.51, 0.42, 0.33, 0.24]; // trous des manomètres 15 → 10
  const BY = 0.18, BZ = 0.628; // bloc transmetteurs (derrière le bas de la plaque)
  {
    const B = bag();
    // Sept trous égaux comme au dessin : six manomètres et, en haut, un bouchon obturateur.
    const holes = [0.78, ...GY].map((y) => [0, y - 0.45, 0.033]);
    B.add('grey', xf(shapeGeo(roundPoly([[-0.055, -0.34], [0.055, -0.34], [0.055, 0.385], [-0.055, 0.385]], 0.008, 2), 0.008, { holes }), [GX, 0.45, GZ + 0.004]));
    for (const y of [0.818, 0.135]) for (const s of [-1, 1]) B.add('steel', bolt([GX + s * 0.042, y, GZ + 0.008], [0, 0, 1], 0.007));
    B.add('plastic', xf(toAxis(revolve([[0, -0.012], [0.031, -0.012], [0.031, 0], [0.037, 0], [0.037, 0.005], [0.033, 0.009, true], [0.022, 0.016, true], [0, 0.019]], 24), 'z'), [GX, 0.78, GZ + 0.008]));
    // Capillaires (boyaux fins) des manomètres jusqu'au bloc transmetteur.
    GY.forEach((y, i) => {
      const px = 0.675 + i * 0.026;
      hose(B, [GX, y, GZ - 0.046], [0, 0, -1], [px, BY + 0.038, BZ - 0.016], [0, 1, 0], [[GX - 0.02 + i * 0.008, y - 0.05, GZ - 0.095 - i * 0.004], [px, 0.3, BZ - 0.03]], 0.0042);
    });
    P('9', B.group(), [0, 0, 0.3]);
  }
  ['15', '14', '13', '12', '11', '10'].forEach((ref, i) => {
    const B = bag();
    panelGauge(B, [GX, GY[i], GZ + 0.008], 0.034);
    P(ref, B.group(), [0, 0, 0.55]);
  });

  // 5 — Bloc transmetteurs de pression (rouge) derrière la plaque, 6 — raccord coudé et boyau
  // d'alimentation, 7 — clapet navette, 8 — valve de décharge auto, 16 — valve de couple de rotation.
  {
    const B = bag();
    B.add('red', xf(box(0.17, 0.06, 0.06, 0.004), [GX, BY, BZ]));
    for (let i = 0; i < 6; i++) {
      const x = 0.675 + i * 0.026;
      B.add('steel', xf(hex(0.014, 0.008), [x, BY + 0.034, BZ - 0.016]));
    }
    for (const s of [-1, 1]) B.add('steel', capScrew([GX + s * 0.06, BY, BZ - 0.03], [0, 0, -1], 0.007));
    nameplate(B, [GX, BY - 0.01, BZ - 0.03], [0, 0, -1], [0, 1, 0], 0.05, 0.022);
    P('5', B.group(), [0.2, 0.1, 0.35]);
  }
  {
    const B = bag();
    B.add('steel', xf(toAxis(hex(0.022, 0.012), 'x'), [GX + 0.091, BY, BZ]));
    B.add('steel', pipe([[GX + 0.096, BY, BZ], [GX + 0.12, BY, BZ], [GX + 0.12, BY - 0.03, BZ]], 0.008, 0.012, 12));
    hose(B, [GX + 0.12, BY - 0.035, BZ], [0, -1, 0], [GX + 0.02, 0.02, BZ - 0.12], [0, 1, 0], [[GX + 0.1, 0.07, BZ - 0.05]], 0.0075);
    B.add('rubber', xf(ring(0.022, 0.012, 0.01, 18), [GX + 0.02, 0.005, BZ - 0.12]));
    P('6', B.group(), [0.35, 0.1, 0.35]);
  }
  {
    const B = bag();
    B.add('brass', xf(box(0.05, 0.026, 0.026, 0.003), [0.7, BY + 0.06, BZ + 0.015]));
    for (const s of [-1, 1]) B.add('brass', xf(toAxis(hex(0.016, 0.008), s > 0 ? 'x' : '-x'), [0.7 + s * 0.029, BY + 0.06, BZ + 0.015]));
    B.add('brass', xf(hex(0.016, 0.018), [0.7, BY + 0.039, BZ + 0.015]));
    P('7', B.group(), [0.2, 0.3, 0.35]);
  }
  {
    const B = bag();
    B.add('brass', xf(hex(0.02, 0.012), [0.79, BY + 0.036, BZ + 0.015]));
    B.add('steel', xf(cyl(0.013, 0.05, { seg: 20 }), [0.79, BY + 0.067, BZ + 0.015]));
    B.add('safety', xf(revolve([[0, 0], [0.015, 0], [0.015, 0.018], [0.011, 0.024, true], [0, 0.026]], 20), [0.79, BY + 0.092, BZ + 0.015]));
    B.add('brass', xf(toAxis(hex(0.014, 0.01), 'x'), [0.79 + 0.016, BY + 0.06, BZ + 0.015]));
    P('8', B.group(), [0, 0.3, 0.4]);
  }
  {
    const B = bag(), x = GX - 0.085 - 0.032;
    B.add('darkSteel', xf(box(0.064, 0.064, 0.06, 0.005), [x, BY, BZ]));
    B.add('steel', xf(toAxis(hex(0.024, 0.012), '-x'), [x - 0.038, BY + 0.008, BZ]));
    B.add('steel', xf(toAxis(cyl(0.006, 0.03, { seg: 12 }), '-x'), [x - 0.058, BY + 0.008, BZ]));
    B.add('red', xf(toAxis(revolve([[0, 0], [0.014, 0], [0.015, 0.012], [0.012, 0.018, true], [0, 0.02]], 16), '-x'), [x - 0.07, BY + 0.008, BZ]));
    for (const s of [-1, 1]) B.add('steel', xf(toAxis(hex(0.018, 0.01), s > 0 ? 'z' : '-z'), [x, BY - 0.012, BZ + s * 0.035]));
    for (const [dy, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) B.add('darkSteel', capScrew([x + 0.012 * dy, BY + 0.032, BZ + dz * 0.02], [0, 1, 0], 0.005));
    P('16', B.group(), [0.3, 0.25, 0.25]);
  }

  // 17 — Filtres haute pression (×2) suspendus à la traverse médiane, 18 — éléments.
  [0.17, 0.34].forEach((z) => {
    const fx = XC + S / 2 + 0.008 + 0.045, top = YC - 0.005;
    const B = bag();
    // Tête usinée boulonnée sur la patte, orifices avant / arrière, indicateur de colmatage.
    B.add('black', xf(box(0.09, 0.06, 0.08, 0.008), [fx, top - 0.03, z]));
    for (const s of [-1, 1]) B.add('darkSteel', capScrew([XC + S / 2, top - 0.03 + s * 0.017, z + s * 0.02], [-1, 0, 0], 0.006));
    B.add('steel', xf(toAxis(hex(0.03, 0.014), 'x'), [fx + 0.052, top - 0.03, z]));
    B.add('steel', xf(toAxis(cyl(0.01, 0.016, { seg: 12 }), 'x'), [fx + 0.066, top - 0.03, z]));
    B.add('red', xf(toAxis(cyl(0.008, 0.012, { seg: 12 }), 'z'), [fx + 0.02, top - 0.02, z + 0.045]));
    // Cuve creuse (visible en coupe), méplats de serrage, bouchon de purge.
    const r = 0.045, y0 = top - 0.06, yb = y0 - 0.3;
    B.add('black', revolve([[0, yb], [r * 0.6, yb, true], [r * 0.92, yb + 0.012, true], [r, yb + 0.03], [r, y0], [r * 1.08, y0], [r * 1.08, y0 - 0.012],
      [r * 0.88, y0 - 0.012], [r * 0.88, yb + 0.03], [r * 0.82, yb + 0.014, true], [r * 0.5, yb + 0.006, true], [0, yb + 0.006]].map(([a, b, c]) => [a, b, c]), 32).translate(fx, 0, z));
    B.add('black', xf(hex(0.094, 0.03), [fx, y0 - 0.03, z]));
    B.add('steel', xf(hex(0.016, 0.01), [fx, yb - 0.004, z]));
    const g = B.group({ interior: true });
    P('17', g, [0, -0.12, 0]);
    const E = bag(), ey = y0 - 0.16;
    const pts = [];
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, rr = i % 2 ? 0.026 : 0.031; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    E.add('cream', xf(extY(pts, 0.2, { holes: [[0, 0, 0.014]] }), [fx, ey, z]));
    for (const s of [-1, 1]) E.add('darkSteel', xf(ring(0.033, 0.012, 0.008, 24), [fx, ey + s * 0.104, z]));
    E.add('steel', xf(cyl(0.013, 0.2, { seg: 14 }), [fx, ey, z]));
    P('18', E.group(), [0, -0.42, 0]);
  });

  return { view: { dir: [1.0, 0.4, 1.1], section: { axis: 'y', pos: 0.75 } } };
}
