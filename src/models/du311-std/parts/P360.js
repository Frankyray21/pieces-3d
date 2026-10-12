// P360 — Électrovanne d'air 4 voies CX027463 rév. 0 « SOLENOID VALVE
// ASSEMBLY » (page 360), repère 9 de P356 (commande d'air de la pompe à
// graisse). Distributeur 4 voies à tiroir (1, CP17054-2) : corps en alu
// anodisé, deux orifices d'utilisation 1/4 NPT repérés (A en haut, B en bas)
// sur la face −X, alimentation P dessous, échappement E dessus, deux trous de
// fixation traversants (selon Z), opérateur à tube d'armature et bobine
// surmoulée côté +X avec commande manuelle ; faisceau de la bobine (2 à 7,
// solenoidHarness de ./_fronta.js, même liste que P346 et que P228 du TVK) :
// joint 1/2 NPT (3), raccord de gaine (2), gaine annelée 3/8 po de 12 po (4),
// thermorétractable 3/4 po de 2 po (7), connecteur (5) et broches (6).
// Repère : origine au centre du corps ; X : face des orifices A / B vers −X,
// bobine vers +X ; Y vers le haut ; Z selon les trous de fixation.
// Encombrement ≈ 0.20 (X) × 0.40 (Y, de −0.33 à 0.06) × 0.05 (Z) m (gaine
// retombante). Corps d'environ 36 × 70 × 34 mm d'après le dessin.
import { IN, solenoidHarness } from './_fronta.js';

export const SOL4 = {
  A: { pos: [-0.018, 0.015, 0], dir: [-1, 0, 0] },
  B: { pos: [-0.018, -0.015, 0], dir: [-1, 0, 0] },
  P: { pos: [0, -0.035, 0], dir: [0, -1, 0] },
  E: { pos: [0, 0.035, 0], dir: [0, 1, 0] },
  holes: [[0, 0.026], [0, -0.026]], // trous de fixation (x, y), axe Z
};

export default function P360(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (0.54 * IN) / 2; // 1/4 NPT

  // ---------------------------------------------------------------- 1 — distributeur
  const shape = new THREE.Shape();
  const w = 0.036, h = 0.07, c = 0.003;
  shape.moveTo(-w / 2 + c, -h / 2); shape.lineTo(w / 2 - c, -h / 2); shape.lineTo(w / 2, -h / 2 + c); shape.lineTo(w / 2, h / 2 - c);
  shape.lineTo(w / 2 - c, h / 2); shape.lineTo(-w / 2 + c, h / 2); shape.lineTo(-w / 2, h / 2 - c); shape.lineTo(-w / 2, -h / 2 + c); shape.closePath();
  for (const [x, y] of SOL4.holes) { const p = new THREE.Path(); p.absarc(x, y, 0.0028, 0, Math.PI * 2, true); shape.holes.push(p); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.034, bevelEnabled: false, curveSegments: 12 });
  geo.translate(0, 0, -0.017);
  S.creaseNormals(geo);
  const alu = [new THREE.Mesh(geo)];
  // Bossages d'orifices (vrais taraudages) et repères gravés A / B.
  for (const k of ['A', 'B', 'P', 'E']) {
    const { pos, dir } = SOL4[k];
    const axis = dir[0] < 0 ? '-x' : dir[1] < 0 ? '-y' : 'y';
    const b = S.lathe([[rn * 0.95, 0], [rn * 1.5, 0], [rn * 1.5, 0.0025], [rn * 0.95, 0.0025]], 'castAlu', { axis, seg: 20 });
    b.position.set(...pos.map((v, i) => v - dir[i] * 0.0025));
    alu.push(b);
  }
  // Tête de l'opérateur (embase carrée) côté +X.
  alu.push(S.box(0.012, 0.034, 0.034, 'castAlu', { r: 0.003, pos: [w / 2 + 0.006, 0, 0] }));
  const steel = [
    S.cyl(0.0075, 0.05, 'steel', { axis: 'x', seg: 18, pos: [w / 2 + 0.035, 0, 0] }),
    S.nut(0.015, 0.006, 'steel', { axis: 'x', pos: [w / 2 + 0.063, 0, 0] }),
    S.cyl(0.003, 0.006, 'steel', { axis: 'x', seg: 10, pos: [w / 2 + 0.069, 0, 0] }),
  ];
  // Commande manuelle (poussoir rouge) sur l'embase.
  const red = S.cyl(0.0035, 0.004, 'red', { seg: 12, pos: [w / 2 + 0.006, 0.019, 0] });
  const coil = S.group(
    S.box(0.042, 0.046, 0.04, 'plastic', { r: 0.004, pos: [w / 2 + 0.037, 0, 0] }),
    S.lathe([[0.0105, 0], [0.0135, 0], [0.0135, 0.012], [0.0105, 0.012]], 'plastic', { axis: 'z', seg: 24, pos: [w / 2 + 0.037, 0, 0.02] }),
  );
  const marks = S.merged([
    S.box(0.006, 0.0008, 0.0006, 'white', { pos: [-w / 2 - 0.0003, 0.026, 0.01], rot: [0, Math.PI / 2, 0] }),
    S.box(0.006, 0.0008, 0.0006, 'white', { pos: [-w / 2 - 0.0003, -0.026, 0.01], rot: [0, Math.PI / 2, 0] }),
  ], 'white');
  P('1', S.group(S.merged(alu, 'castAlu'), S.merged(steel, 'steel'), red, coil, marks,
    S.at(S.nameplate(0.03, 0.02), [w / 2 + 0.037, 0.0, -0.0208], [0, Math.PI, 0])), [0, 0, 0]);

  // ---------------------------------------------------------------- 2 à 7 — faisceau de la bobine (sortie vers +Z puis vers le bas)
  solenoidHarness(api, { pos: [w / 2 + 0.037, 0, 0.032], dir: [0, 0, 1] }, { bend: 0.04, explode: [0.02, -0.04, 0.04] });

  return { view: { dir: [-0.9, 0.5, 1.1] } };
}
