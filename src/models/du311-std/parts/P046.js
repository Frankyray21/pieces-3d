// P046 — Plaque à coins CX031066 rév. 1 (page 46) : « ASSY, SLIP PLATE - PIPE
// WITH 3" (76MM) A/F », repère 2 de l'avance P028 (lettre A de P032). Fourche
// d'acier de 1 1/4 po (1, CM15006-10, « SIDE SLIPS ») qui coiffe les méplats
// de 3 po (76 mm) des tiges Ø 3 1/2 po pour les retenir au dévissage ; elle
// glisse sur le caisson du centreur fixe (P032) entre ses glissières, tirée
// par les deux vérins de coins (P032 repère 9) attelés à ses deux chapes
// soudées : axes de chape Ø 3/4 (2, CM77208-003), bagues roulées 3/4 × 7/8 ×
// 1/2 po (3, CP11005) et vis à tête fraisée 3/8-16 × 5/8 (4) dont la tête
// bloque la tête de chaque axe.
// Repère : celui de l'avance (placé à l'identité par P028) ; plaque fermée sur
// la tige, fond de fente sur l'axe de forage, dessous sur le caisson du
// centreur (y = 0,095 m), chapes vers -X, fente ouverte vers +X. Les pièces
// sont dessinées dans le repère propre de la plaque (comme P044 du TVK :
// origine au fond de fente, Y = 0 sous la plaque, +Z vers les chapes) tourné
// de -90° autour de Y. Encombrement 0.222 (X, de -0.165 à +0.051) × 0.076
// (Y) × 0.260 (Z) m.
// Cotes : fente 3 po (liste), fond en arc R 1.85 po (dégage le corps Ø 3 1/2),
// embouchure à 2 po de l'axe : la course de 4 po des vérins de coins dégage la
// tige ; plaque, chapes, axes, bagues et vis comme la plaque de 3,75 po du
// TVK (mêmes CM77208-003, bagues 7/8 × 3/4 × 1/2, vis 3/8-16 × 5/8).
// Simulation : toutes les pièces suivent le corps « slip » (coulissement vers
// -X de l'avance pour ouvrir la fente).
import { body } from '../layout.js';
import { CENT, SLIP } from './_feedcent.js';

const IN = 0.0254;
const MM = 0.001;
const T = SLIP.T; // épaisseur
const W2 = 5.125 * IN; // demi-largeur (10 1/4 po, entre les glissières du centreur)
const ZF = 6.5 * IN; // bord arrière, côté chapes
const ZB = -2.0 * IN; // embouchure de la fente
const S2 = (3.0 * IN) / 2; // demi-largeur de fente : méplats de 3 po
const RF = 1.85 * IN; // fond de fente
const CH = 0.75 * IN; // chanfreins d'entrée
const { LT, GAP, XC, ZL, YB } = SLIP;
const LS = 1.75 * IN; // oreilles 1/2 × 1 3/4 × 1 3/4 po
const XI = XC - GAP / 2 - LT; // face côté fente de l'oreille intérieure
const DS = 17.8 * MM; // taraudage de la vis de blocage, à 45° vers +Y / +Z
const JL = 0.5 * IN; // ligne de jonction des flancs sous le dessus
const PR = 9.45 * MM, SL = 50 * MM, RG = 7.5 * MM, RH = 0.5 * IN; // axe de chape
const RK = 0.344 * IN; // tête de vis fraisée
const TAN41 = Math.tan((41 * Math.PI) / 180);

export default function P046(api) {
  const { THREE, S } = api;
  const { lathe, slotted, roundHole, weld, merged, extrude, group, at } = S;
  // Pièce de la plaque portée dans le repère de l'avance, corps « slip ».
  const place = (obj, ref, e) => api.part(ref, body('slip', at(group(obj), [0, CENT.top, CENT.AX], [0, -Math.PI / 2, 0])), e);
  // Extrusions dans le repère de la plaque.
  const slabY = (pts, y0, y1, mat) => {
    const m = extrude(pts.map(([x, z]) => [x, -z]), y1 - y0, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = (y0 + y1) / 2;
    return m;
  };
  const slabX = (pts, x0, x1, holes, mat) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]).reverse(), x1 - x0, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = (x0 + x1) / 2;
    return m;
  };
  // Éclaté : déplacement donné dans le repère de l'avance.

  // ---------------------------------------------------------------- 1 — plaque
  const a0 = Math.acos(S2 / RF);
  const arcPts = [];
  for (let i = 0; i <= 24; i++) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / 24;
    arcPts.push([RF * Math.cos(a), RF * Math.sin(a)]);
  }
  const outline = [
    [-W2, ZF], [-W2, ZB], [-S2 - CH, ZB], [-S2, ZB + CH],
    ...arcPts.slice().reverse(),
    [S2, ZB + CH], [S2 + CH, ZB], [W2, ZB], [W2, ZF],
  ];
  const c = 3 * MM, h = LS / 2;
  const ear = [[-h, -h], [h, -h], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c]].map(([z, y]) => [ZL + z, YB + y]);
  const bore = [ZL, YB, (0.875 * IN) / 2 + 0.2 * MM];
  const tap = [ZL + DS / Math.SQRT2, YB + DS / Math.SQRT2, 3.97 * MM];
  const ears = [], welds = [];
  for (const s of [-1, 1]) {
    for (const [x0, inner] of [[XI, true], [XC + GAP / 2, false]]) {
      const xa = s * x0, xb = s * (x0 + LT);
      ears.push(slabX(ear, Math.min(xa, xb), Math.max(xa, xb), inner ? [bore, tap] : [bore], 'grey'));
      const e = 1 * MM, y = T + 0.6 * MM;
      const X0 = Math.min(xa, xb) - e, X1 = Math.max(xa, xb) + e, Z0 = ZL - h - e, Z1 = ZL + h + e;
      welds.push(weld([[X0, y, Z0], [X1, y, Z0], [X1, y, Z1], [X0, y, Z1]], 5.5 * MM, 'grey', { closed: true }));
    }
  }
  // Ligne de jonction des grands flancs (plaque rapportée), comme sur le dessin.
  const mb = 1.6 * MM;
  for (const s of [-1, 1]) {
    const x = s * W2;
    welds.push(weld([[x, T - JL, ZB], [x, T - JL, ZF - JL], [x, T - mb, ZF - mb]], 1.5 * MM, 'grey'));
    welds.push(weld([[x, T - JL, ZF - JL], [x, mb, ZF - JL]], 1.5 * MM, 'grey'));
  }
  const beads = merged(welds, 'grey');
  beads.geometry.userData.edgeAngle = 75;
  place(group(merged([slabY(outline, 0, T, 'grey'), ...ears], 'grey'), beads), '1', [0, 0.35, 0]);

  // ---------------------------------------------------------------- pièces de chape
  // Repère local d'une chape : origine sur l'axe, contre la face côté fente de
  // l'oreille intérieure ; +Y local vers la fente, +Z local vers la vis.
  const frame = (obj, s) => {
    const Yw = new THREE.Vector3(-s, 0, 0);
    const Zw = new THREE.Vector3(0, 1, 1).normalize();
    const Xw = new THREE.Vector3().crossVectors(Yw, Zw);
    const g = group(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xw, Yw, Zw));
    g.position.set(s * XI, YB, ZL);
    return g;
  };
  // 2 — axe de chape : fût Ø 3/4 chanfreiné, gorge Ø 15 mm, tête Ø 1 po.
  const pin = () => lathe([
    [0, -SL], [PR - 1.2 * MM, -SL], [PR, -SL + 1.2 * MM], [PR, 0],
    [RG, 0.6 * MM], [RG, 6 * MM], [RH - 0.6 * MM, 6 * MM], [RH, 6.6 * MM],
    [RH, 19 * MM], [RH - 1.5 * MM, 20.5 * MM], [0, 20.5 * MM],
  ], 'steel', { seg: 24 });
  // 4 — vis FHC 3/8-16 × 5/8, six-pans creux 7/32, acier bruni.
  const screw = () => {
    const rs = 0.1875 * IN, Ls = 0.625 * IN, top = 0.4 * MM;
    const hh = (RK - rs) / TAN41;
    const hexR = (7 / 32) * IN / 2 / Math.cos(Math.PI / 6);
    const bodyM = lathe([[0, -Ls], ...S.thread(rs, -Ls, -top - hh, { pitch: IN / 16 }), [RK, -top], [hexR, -top]], 'blackOxide', { seg: 20 });
    const socket = lathe([[hexR, -top], [hexR, -3 * MM], [0, -3.6 * MM]], 'blackOxide', { seg: 6 });
    const ringPts = (r, n) => Array.from({ length: n }, (_, j) => {
      const t = (j / n) * Math.PI * 2;
      return new THREE.Vector2(r * Math.sin(t), -r * Math.cos(t));
    });
    const shape = new THREE.Shape(ringPts(RK, 20));
    shape.holes.push(new THREE.Path(ringPts(hexR, 6)));
    const disc = new THREE.ExtrudeGeometry(shape, { depth: top, bevelEnabled: false });
    disc.rotateX(-Math.PI / 2);
    disc.translate(0, -top, 0);
    return merged([bodyM, socket, new THREE.Mesh(disc)], 'blackOxide');
  };
  // 3 — bague roulée bronze 3/4 × 7/8 × 1/2 po, joint agrafé, trou de graissage.
  const bushing = (x) => {
    const ro = (0.875 * IN) / 2, ri = (0.75 * IN) / 2, hb = LT / 2;
    const w = (0.4 * MM) / ro, s1 = (3 * Math.PI) / 2, s2 = s1 + 0.35, e = 0.2 * MM;
    const windows = [
      { a: s1, w, y0: -hb, y1: e },
      { a: (s1 + s2) / 2, w: s2 - s1 + w, y0: -e, y1: e },
      { a: s2, w, y0: -e, y1: hb },
      ...roundHole(0, 0, 1.6 * MM, ro, { steps: 5 }),
    ];
    return slotted(ro, ri, -hb, hb, windows, 'brass', { axis: 'x', seg: 40, pos: [x, YB, ZL] });
  };
  for (const s of [-1, 1]) {
    // Éclaté : repère de la plaque (x, z) → avance (z, -x).
    const E = (dx, dy, dz) => [-dz, dy + 0.35, dx];
    place(bushing(s * (XC + GAP / 2 + LT / 2)), '3', E(s * 0.05, 0, 0));
    place(bushing(s * (XI + LT / 2)), '3', E(-s * 0.018, 0, 0));
    place(frame(pin(), s), '2', E(-s * 0.03, 0, 0.075));
    place(frame(at(screw(), [0, 5 * MM, DS]), s), '4', E(-s * 0.052, 0, 0));
  }
  return { view: { dir: [1, 0.85, 1.05] } };
}
