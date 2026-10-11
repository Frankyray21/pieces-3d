// P460 — Tendeur CX006730 « TURN BUCKLE ASSEMBLY » (page 460), repère 5 du
// module surpresseur P432 : règle la tension des courroies en inclinant le
// berceau du surpresseur. Manchon de tendeur (1) six-pans 1 1/8 po taraudé
// 3/4-10 UNC à droite d'un bout et à gauche de l'autre (rainure de repérage
// côté gauche), deux embouts à rotule à queue filetée 3/4-10 UNC — pas à
// droite (2) et pas à gauche (3, gorge de repérage sur le corps) —, chacun
// bloqué contre le manchon par son contre-écrou mince : 4 (pas à gauche,
// encoches sur les pans) et 5 (pas à droite).
// Repère : origine au centre du manchon, X selon l'axe du tendeur (+X côté
// embout pas à droite 2), axes des rotules selon Z (pivots du berceau) ;
// entraxe des rotules 2 × TB.eye = 0.30 m (réglage moyen).
// Encombrement ≈ 0.35 (X) × 0.045 (Y) × 0.045 (Z) m. Cotes : filetage 3/4-10
// de la liste ; embouts à rotule et manchon aux proportions de la page 460.
import { I } from './_rearb.js';

export const TB = { eye: 0.15, pinR: I(0.25) };

export default function P460(api) {
  const { S } = api;
  const { lathe, ring, nut, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const r = I(0.375), AF = I(1.125), LB = I(4.5);
  const X = (prof, mat, seg = 20) => lathe(prof, mat, { axis: 'x', seg });

  // ---------------------------------------------------------------- 1 — manchon
  {
    const R = AF / 2 / Math.cos(Math.PI / 6), c = I(0.06);
    const h = LB / 2;
    const body = X([[r * 0.85, -h], [R - c, -h], [R, -h + c], [R, h - c], [R - c, h], [r * 0.85, h], [r * 0.85, -h]], 'zinc', 6);
    body.children[0].rotation.x = Math.PI / 6;
    // Collerette tournée de repérage du côté pas à gauche (bague sur les pans).
    const groove = ring(R * 1.0, AF * 0.46, I(0.08), 'zinc', { axis: 'x', seg: 24, pos: [-h + I(0.35), 0, 0] });
    P('1', merged([body, groove], 'zinc'), [0, 0.06, 0]);
  }

  // ---------------------------------------------------------------- 2, 3 — embouts à rotule
  // Corps forgé : œil (bague Ø 1 3/4 po, largeur 0.75 po) et rotule chromée
  // percée 1/2 po, col, six-pans de serrage, queue filetée qui entre dans le manchon.
  const rodEnd = (s, lh) => {
    const xe = s * TB.eye;
    const eyeR = I(0.875), w = I(0.75);
    const x0 = s * I(1.1); // bout de la queue dans le manchon
    const xb = s * (TB.eye - eyeR - I(0.55)); // début du corps
    const shank = lathe([[0, 0], [r * 0.82, 0], ...S.thread(r, 0.002, Math.abs(xb - x0) - 0.004, { pitch: I(0.1), maxTurns: 14 }).slice(1), [r, Math.abs(xb - x0)], [0, Math.abs(xb - x0)]], 'zinc', { seg: 14 });
    const sh = group(shank);
    sh.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    sh.position.x = x0;
    const neckL = Math.abs(xe - xb) - eyeR * 0.85;
    const hexS = group(nut(I(1.0), I(0.45), 'zinc', { axis: 'x', pos: [xb + s * I(0.225), 0, 0] }));
    const col = at(S.cyl(I(0.42), neckL - I(0.45), 'zinc', { axis: 'x', seg: 18, r2: I(0.36) }), [xb + s * (I(0.45) + (neckL - I(0.45)) / 2), 0, 0]);
    if (s < 0) col.rotation.z = Math.PI;
    const eye = S.cyl(eyeR, w, 'zinc', { axis: 'z', seg: 28, pos: [xe, 0, 0] });
    const parts = [sh, hexS, col, eye];
    if (lh) parts.push(ring(I(0.43), I(0.40), I(0.08), 'zinc', { axis: 'x', seg: 18, pos: [xb + s * I(0.6), 0, 0] }));
    const ball = S.lathe([[I(0.25), -w * 0.62], [I(0.5), -w * 0.62], [I(0.66), -w * 0.3], [I(0.68), 0], [I(0.66), w * 0.3], [I(0.5), w * 0.62], [I(0.25), w * 0.62], [I(0.25), -w * 0.62]], 'chrome', { axis: 'z', seg: 24, pos: [xe, 0, 0] });
    return group(merged(parts, 'zinc'), ball);
  };
  P('2', rodEnd(1, false), [0.08, 0, 0]);
  P('3', rodEnd(-1, true), [-0.08, 0, 0]);

  // ---------------------------------------------------------------- 4, 5 — contre-écrous 3/4-10 minces
  // Écrou à gauche : collerette d'appui tournée (repérage du pas à gauche).
  const jam = (s, lh) => {
    const x = s * (LB / 2 + I(0.21) + 0.0005);
    const n = nut(AF, I(0.41), 'zinc', { axis: 'x', pos: [x, 0, 0] });
    if (!lh) return n;
    return merged([n, ring(AF * 0.48, r * 1.05, I(0.05), 'zinc', { axis: 'x', seg: 24, pos: [x + s * I(0.23), 0, 0] })], 'zinc');
  };
  P('5', jam(1, false), [0.04, 0.03, 0]);
  P('4', jam(-1, true), [-0.04, 0.03, 0]);

  return { view: { dir: [0.4, 0.7, 1.0] } };
}
