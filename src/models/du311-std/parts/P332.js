// P332 — Couvercle du pont avant CX027295 rév. 2 « COVER ASSEMBLY - FRONT
// DECK » (page 332 : deux vues éclatées, châssis avant en fantôme), repère 8
// de P208. Tôle pliée (8, 3/16 po) posée sur les garde-boue au-dessus du
// groupe de pompage : coins avant échancrés, deux passe-flexibles et deux
// poignées oblongues au bord arrière, bord avant tombé, quatre pattes
// pliées percées où passent les goupilles à poignée en T (1, à billes)
// engagées dans les chapes du châssis. Bavette en caoutchouc (6) pendue au
// bord avant tombé, serrée par le plat (3, rivets aveugles) ; tapis en
// caoutchouc découpé en croix (5) posé sur le nez du châssis et le caisson
// de la glissière, maintenu par deux plaques (4) enfilées sur quatre goujons
// filetés (7) et arrêtées par des goupilles bêta doubles (2).
// Repère machine (P208 le place à l'identité) : tôle 8 de x = 1.20 à 1.90 et
// z = ±0.73, dessous à y = 1.2125 (dessus des garde-boue de layout.js) ;
// bavette 6 au plan x = 1.90 jusqu'à y ≈ 1.0 ; tapis 5 de x = 1.97 à 2.97,
// drapé du dessus du nez (y = 1.0) au dessus du caisson de la glissière
// (y = 1.10, SLIDE.base de ../slide.js). Cotes relevées sur la vue de dessus
// de la page 212 (tapis : languette arrière 0,56 m, partie large 0,95 m,
// languette avant 0,53 m).
// Tout l'ensemble est sur le châssis avant (corps « front »).
import { M, body } from '../layout.js';
import { IN, slab } from './_fronta.js';

const T8 = 0.1875 * IN; // tôle 8
const Y8 = M.fender + 0.0125; // dessous de la tôle 8 (dessus des garde-boue)
const X0 = 1.2, X1 = 1.9, ZW = 0.73;
const TR = 0.375 * IN; // tapis 5
const YN = M.frameTop, YS = 1.1; // dessus du nez, dessus du caisson de la glissière

export default function P332(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, body('front', obj), e);
  const along = (obj, dir, pos) => { const g = S.group(obj); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()); g.position.set(...pos); return g; };

  // ---------------------------------------------------------------- 8 — tôle pliée
  const tabs = [[X0 + 0.004, -0.44, -1], [X0 + 0.004, 0.44, -1], [X1 - 0.1, -0.44, 1], [X1 - 0.1, 0.44, 1]];
  {
    const pts = [[X0, -ZW], [X0, -0.23], [X0 + 0.02, -0.23], [X0 + 0.02, -0.17], [X0, -0.17], [X0, 0.17], [X0 + 0.02, 0.17], [X0 + 0.02, 0.23], [X0, 0.23], [X0, ZW],
      [X1 - 0.05, ZW], [X1 - 0.05, 0.53], [X1, 0.53], [X1, -0.53], [X1 - 0.05, -0.53], [X1 - 0.05, -ZW]];
    const slot = (x, z) => { const q = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; q.push([x + 0.0175 * Math.sin(a), z + (0.05 + 0.0175) * Math.cos(a) * 0.82]); } return q; };
    const top = slab(api, pts, T8, 'grey', { paths: [slot(X0 + 0.07, -0.42), slot(X0 + 0.07, 0.42)], holes: [[X0 + 0.25, -0.6, 0.02], [X0 + 0.25, 0.6, 0.02]] });
    top.position.y = Y8 + T8 / 2;
    const parts = [top];
    // Bord avant tombé (40 mm), pli arrondi.
    parts.push(S.box(T8, 0.04, 1.06, 'grey', { pos: [X1 - T8 / 2, Y8 - 0.02 + T8, 0] }));
    parts.push(S.cyl(T8 * 1.1, 1.06, 'grey', { axis: 'z', seg: 10, pos: [X1 - T8 * 1.1, Y8 + T8 * 0.9, 0] }));
    // Pattes pliées (plan YZ) percées Ø 14 pour les goupilles.
    for (const [x, z] of tabs) {
      const tab = S.extrude([[-0.025, 0], [0.025, 0], [0.025, -0.05], [0.012, -0.065], [-0.012, -0.065], [-0.025, -0.05]], T8, 'grey', { holes: [[0, -0.042, 0.007]] });
      tab.rotation.y = Math.PI / 2;
      tab.position.set(x, Y8 + 0.001, z);
      parts.push(tab);
    }
    P('8', S.merged(parts, 'grey'), [0, 0.5, 0]);
  }

  // ---------------------------------------------------------------- 1 — goupilles à billes à poignée en T
  for (const [x, z, s] of tabs) {
    const L = 2 * IN, r = 0.25 * IN;
    const y = Y8 - 0.041;
    const pin = S.group(
      S.merged([
        S.lathe([[0, 0], [r * 0.8, 0], [r, r * 0.4], [r, L], [r * 1.5, L], [r * 1.5, L + 0.006], [0, L + 0.006]], 'steel', { seg: 16 }),
        ...[0, Math.PI].map((a) => S.ball(0.0022, 'steel', { pos: [Math.cos(a) * r * 0.9, 0.006, Math.sin(a) * r * 0.9] })),
      ], 'steel'),
      // Poignée en T (corps moulé) et bouton-poussoir.
      S.merged([
        S.lathe([[0, L + 0.006], [0.009, L + 0.006], [0.009, L + 0.03], [0, L + 0.03]], 'black', { seg: 16 }),
        S.box(0.07, 0.014, 0.014, 'black', { r: 0.006, pos: [0, L + 0.038, 0] }),
      ], 'black'),
      S.cyl(0.004, 0.006, 'red', { seg: 12, pos: [0, L + 0.047, 0] }),
      // Câble d'attache et anneau.
      S.torus(0.012, 0.0012, 'zinc', { axis: 'x', pos: [0, L + 0.02, 0.016] }),
    );
    // Engagée selon X : poignée vers l'extérieur de la tôle (avant ou arrière).
    P('1', along(pin, [s, 0, 0], [x - s * 0.03, y, z]), [s * 0.12, 0, 0]);
  }

  // ---------------------------------------------------------------- 6 — bavette en caoutchouc
  const XR = X1 + 0.001, TB6 = 0.25 * IN;
  {
    const pts = [[-0.52, 0], [0.52, 0], [0.52, 0.13], [0.44, 0.13], [0.44, 0.205], [-0.44, 0.205], [-0.44, 0.13], [-0.52, 0.13]];
    const rub = S.extrude(pts.map(([z, d]) => [z, -d]), TB6, 'rubber');
    rub.rotation.y = Math.PI / 2;
    rub.position.set(XR + TB6 / 2, Y8 + T8 - 0.002, 0);
    P('6', S.merged([rub], 'rubber'), [0.12, 0.3, 0]);
  }
  // ---------------------------------------------------------------- 3 — plat de serrage et rivets aveugles
  {
    const xs = XR + TB6;
    const parts = [S.box(0.0064, 0.038, 1.0, 'zinc', { r: 0.0015, pos: [xs + 0.0032, Y8 - 0.012, 0] })];
    const riv = [];
    for (let i = 0; i < 5; i++) {
      const z = -0.44 + i * 0.22;
      riv.push(S.lathe([[0, 0], [0.0055, 0], [0.0052, 0.0012], [0.004, 0.0022], [0.002, 0.0026], [0, 0.0026]], 'steel', { axis: 'x', seg: 14, pos: [xs + 0.0064, Y8 - 0.012, z] }));
    }
    P('3', S.group(S.merged(parts, 'zinc'), S.merged(riv, 'steel')), [0.18, 0.3, 0]);
  }

  // ---------------------------------------------------------------- 5 — tapis en caoutchouc (drapé)
  const XA = 1.97;
  const outline = [
    [XA, -0.28], [XA + 0.09, -0.28], [XA + 0.44, -0.475], [XA + 0.72, -0.475], [XA + 0.72, -0.265], [XA + 1.0, -0.265],
    [XA + 1.0, 0.265], [XA + 0.72, 0.265], [XA + 0.72, 0.475], [XA + 0.44, 0.475], [XA + 0.09, 0.28], [XA, 0.28],
  ];
  // Hauteur du tapis : dessus du nez jusqu'à x = 2.16, rampe, puis caisson de la glissière.
  const yAt = (x) => {
    const t = Math.min(1, Math.max(0, (x - 2.16) / 0.08));
    return YN + (YS - YN) * (t * t * (3 - 2 * t));
  };
  {
    // Contour densifié (pas de 2 cm) pour que la rampe soit suivie par la triangulation.
    const dense = [];
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length];
      const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.02));
      for (let k = 0; k < n; k++) dense.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    const mat = slab(api, dense, TR, 'rubber');
    const g = mat.geometry;
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + yAt(p.getX(i)) + TR / 2);
    g.computeVertexNormals();
    S.creaseNormals(g);
    P('5', S.merged([mat], 'rubber'), [0.3, 0.25, 0]);
  }

  // ---------------------------------------------------------------- 4, 7, 2 — plaques, goujons filetés, goupilles
  const ang = Math.atan2(0.195, 0.35);
  for (const s of [-1, 1]) {
    // Plaque le long du bord biais du tapis, 25 mm en retrait.
    const cx = XA + 0.27, cz = s * (0.28 + 0.195 * (0.18 / 0.35) - 0.03);
    const yTop = YS + TR;
    const dirx = Math.cos(ang), dirz = s * Math.sin(ang);
    const pinsXZ = [-0.05, 0.05].map((u) => [cx + u * dirx, cz + u * dirz]);
    const plate = S.extrude([[-0.075, -0.02], [0.075, -0.02], [0.075, 0.02], [-0.075, 0.02]], 0.25 * IN, 'zinc', { holes: [[-0.05, 0, 0.0075], [0.05, 0, 0.0075]] });
    plate.rotation.set(-Math.PI / 2, 0, 0);
    const pg = S.group(plate);
    pg.rotation.y = -s * ang;
    pg.position.set(cx, yTop + 0.125 * IN, cz);
    P('4', pg, [0, 0.2, s * 0.05]);
    for (const [x, z] of pinsXZ) {
      // 7 — goujon fileté 1/2-13 vissé dans le caisson, trou transversal en tête.
      const r = 0.25 * IN, h = 0.07;
      const stud = S.lathe([[0, -0.025], [r * 0.85, -0.025], ...S.thread(r, -0.022, 0.012, { pitch: 0.002, maxTurns: 8 }), [r * 0.96, 0.012], [r * 0.96, h - 0.003], [r * 0.8, h], [0, h]], 'steel', { seg: 16 });
      P('7', S.at(stud, [x, YS, z]), [0, 0.3, 0]);
      // 2 — goupille bêta double (fil Ø 3 mm) dans le trou transversal.
      const yh = YS + 0.055;
      const w = 0.0015;
      const pts = [[0, yh, -0.012], [0, yh, 0.012], [0, yh + 0.004, 0.02], [0.008, yh + 0.002, 0.02], [0.014, yh - 0.006, 0.01], [0.012, yh - 0.012, -0.004], [0.006, yh - 0.008, -0.016], [0, yh - 0.002, -0.018]];
      const clip = S.tube(pts.map(([u, y, v]) => [x + u * Math.cos(-s * ang) - v * Math.sin(-s * ang), y, z + u * Math.sin(-s * ang) + v * Math.cos(-s * ang)]), w, 'zinc', { seg: 24, radial: 6 });
      P('2', clip, [0, 0.35, s * 0.04]);
    }
  }

  return { view: { dir: [1.0, 0.9, 0.8] } };
}
