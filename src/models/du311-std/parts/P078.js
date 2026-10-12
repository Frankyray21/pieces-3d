// P078 — Capteur de longueur, avance 6 pi : CX036779 rév. 2 (pages 78 à 86,
// installation 6 pi pages 78 à 82) : « OPTION, LENGTH TRANSDUCER - 6FT
// FEED », repère 12 de l'avance P028. Capteur linéaire magnétostrictif (4,
// profilé alu de 28 mm à rainures, tête électronique en haut, prise et câble,
// six pattes de fixation) le long de la face intérieure du flanc +X, devant le
// vérin ; câble ramené vers l'arrière et sorti par un trou du flanc, tenu par
// trois colliers en P 1/2 po (6, vis 3/8 × 5/8 : 8, Nord-Lock 9). L'aimant de
// position (1) court devant le profilé : posé sur sa plaque plastique (5) et
// l'équerre (7, « MOUNT, MAGNET ») par trois vis M4 × 50 inox (2) à écrous
// freinés (3) ; l'équerre est vissée sur le support de tourillon +X de la
// plaque porte-tête (P062) par deux vis 8 (Nord-Lock 9) et suit la tête.
// Simulation : aimant, plaque, équerre et leur visserie suivent la tête
// (corps « feed ») ; capteur et colliers restent sur l'avance.
// Repère : celui de l'avance (FEED, placé à l'identité dans P028), tête en
// haut : profilé en x = 0.16, z = 0.078, de y = 0.50 à 2.82 ; aimant à
// y = 2.63. Encombrement ≈ 0.08 × 2.55 × 0.30 m.
// Cotes : visserie (liste) ; implantation d'après la coupe A-A et la section
// B-B (pages 78 et 80) à l'échelle du mât.
import { body } from '../layout.js';
import { IN, u, MAST, PLATE, hhcs, nordLock, slab, orient, pClamp, M } from './_feed.js';

const SX = 0.16, SZ = 0.078, A = 0.014; // axe et demi-côté du profilé
const Y0 = 0.5, Y1 = 2.82, YM = 2.63; // profilé, aimant (tête en haut)
const XW = MAST.hw - MAST.tw; // face intérieure du flanc +X

export default function P078(api) {
  const { S } = api;
  const { box, cyl, lathe, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o) => body('feed', o);

  // ============================================================ 4 — capteur linéaire
  // profilé : carré à rainures en queue d'aronde sur trois faces
  const prof = [[-A, -A], [A, -A], [A, -0.003], [A - 0.003, -0.004], [A - 0.003, 0.004], [A, 0.003], [A, A], [0.003, A], [0.004, A - 0.003], [-0.004, A - 0.003], [-0.003, A],
    [-A, A], [-A, 0.003], [-A + 0.003, 0.004], [-A + 0.003, -0.004], [-A, -0.003]];
  const bar = orient(slab(prof, [], Y1 - Y0, 'castAlu'), [1, 0, 0], [0, 0, -1], [SX, (Y0 + Y1) / 2, SZ]);
  const endCap = box(2 * A, 0.012, 2 * A, 'plastic', { r: 0.003, pos: [SX, Y0 - 0.006, SZ] });
  const head = group(
    lathe([[0, Y1], [0.024, Y1], [0.024, Y1 + 0.004], [0.022, Y1 + 0.006], [0.022, Y1 + 0.052], [0.019, Y1 + 0.056], [0, Y1 + 0.056]], 'castAlu', { seg: 28, pos: [SX, 0, SZ] }),
    S.nut(0.036, 0.008, 'castAlu', { pos: [SX, Y1 + 0.008, SZ] }),
  );
  const plug = group(
    lathe([[0, Y1 + 0.056], [0.008, Y1 + 0.056], [0.008, Y1 + 0.066], [0.0095, Y1 + 0.068], [0.0095, Y1 + 0.088], [0.006, Y1 + 0.095], [0, Y1 + 0.095]], 'plastic', { seg: 16, pos: [SX, 0, SZ] }),
  );
  // pattes de fixation : étrier sur le profilé, semelle contre le flanc
  const clips = [0.62, 1.08, 1.54, 2.0, 2.46].map((y) => group(
    box(0.034, 0.025, 0.004, 'zinc', { pos: [SX, y, SZ + A + 0.002] }),
    box(XW - (SX + A), 0.025, 0.004, 'zinc', { pos: [(SX + A + XW) / 2, y, SZ + A + 0.002] }),
    box(0.004, 0.025, 0.03, 'zinc', { pos: [XW - 0.002, y, SZ + 0.002] }),
  ));
  // câble : monte, recule le long du flanc, sort par le trou Ø 1 po (y 2.84, z −0.12)
  const cy = Y1 + 0.095;
  const cable = S.tube([[SX, cy, SZ], [SX, cy + 0.03, SZ], [SX + 0.012, cy + 0.045, SZ - 0.02], [XW - 0.012, cy + 0.045, 0.0], [XW - 0.012, cy + 0.04, -0.07],
    [XW - 0.012, 2.86, -0.112], [XW - 0.004, 2.842, -0.12], [MAST.hw + 0.02, 2.84, -0.12], [MAST.hw + 0.05, 2.78, -0.12], [MAST.hw + 0.055, 2.66, -0.12]], 0.004, 'black', { seg: 64, radial: 8, ends: 'none' });
  P('4', group(M([bar, head], 'castAlu'), M(clips, 'zinc'), endCap, plug, cable), [-0.15, 0, 0]);

  // ============================================================ 6 / 8 / 9 — colliers du câble (fixes)
  // patte contre la face intérieure du flanc, boucle d'axe le long du câble
  const V = (...a) => new api.THREE.Vector3(...a);
  const nl3 = 2 * Math.max(0.0008, 0.375 * IN * 0.09) * 1.1;
  const PC = [[cy + 0.045, 0.06, V(0, 0, 1)], [cy + 0.045, -0.02, V(0, 0, 1)], [2.88, -0.112, V(0, 1, 0)]];
  PC.forEach(([y, z, dir]) => {
    const pc = pClamp(0.5);
    const Yl = V(-1, 0, 0), Xl = Yl.clone().cross(dir);
    pc.quaternion.setFromRotationMatrix(new api.THREE.Matrix4().makeBasis(Xl, Yl, dir));
    pc.position.set(XW, y, z);
    P('6', pc, [-0.08, 0, 0]);
    const hole = V(XW, y, z).addScaledVector(Xl, pc.userData.hole[0]);
    P('9', nordLock(0.375 * IN, [XW - 0.0024 - nl3 / 2, hole.y, hole.z], [-1, 0, 0]), [-0.12, 0, 0]);
    P('8', hhcs(0.375 * IN, u(0.625), [XW - 0.0024 - nl3, hole.y, hole.z], [-1, 0, 0]), [-0.16, 0, 0]);
  });

  // ============================================================ 7 — équerre de l'aimant (sur le support de tourillon +X)
  const xm = PLATE.mountX[1]; // face extérieure du support
  const t7 = u(0.25), zw = SZ + A + 0.003 + 0.008 + 0.003; // dos de l'âme
  const base = box(t7, 0.06, 0.06, 'black', { pos: [xm + t7 / 2, YM, 0.13] });
  const web = box(0.186 - xm, 0.06, t7, 'black', { pos: [(xm + 0.186) / 2, YM, zw + t7 / 2] });
  const knee = orient(slab([[0, 0], [0.025, 0], [0, 0.025]], [], u(0.25), 'black'), [1, 0, 0], [0, 0, 1], [xm + t7, YM, zw + t7]);
  P('7', F(M([base, web, knee], 'black')), [0.12, 0.1, 0.08]);
  P('5', F(box(0.052, 0.05, 0.003, 'white', { pos: [SX, YM, zw - 0.0015] })), [0.12, 0.1, 0.12]);
  // aimant en U (ailes de part et d'autre du profilé, trous des vis M4)
  const mag = group(
    box(0.052, 0.03, 0.008, 'black', { r: 0.002, pos: [SX, YM, zw - 0.003 - 0.004] }),
    lathe([[0.0035, -0.0001], [0.007, -0.0001], [0.007, 0.0002], [0.0035, 0.0002], [0.0035, -0.0001]], 'darkSteel', { seg: 16, axis: 'z', pos: [SX, YM, zw - 0.011] }),
  );
  P('1', F(mag), [0.12, 0.1, 0.16]);
  const BM = [[SX - 0.021, YM - 0.009], [SX - 0.021, YM + 0.009], [SX + 0.021, YM]];
  BM.forEach(([x, y]) => {
    const zh = zw - 0.011; // dessous des têtes (côté profilé, hors de sa largeur)
    P('2', F(hhcs(0.004, 0.05, [x, y, zh], [0, 0, -1], 'steel')), [0.12, 0.1, 0.22]);
    P('3', F(group(S.nut(0.007, 0.0035, 'steel', { axis: 'z', pos: [x, y, zw + t7 + 0.00175] }), S.lathe([[0.002, 0], [0.0032, 0], [0.0032, 0.0016], [0.002, 0.0016], [0.002, 0]], 'white', { seg: 12, axis: 'z', pos: [x, y, zw + t7 + 0.0035] }))), [0.12, 0.1, 0.26]);
  });
  for (const z of [0.112, 0.148]) {
    P('9', F(nordLock(0.375 * IN, [xm + t7 + nl3 / 2, YM, z], [1, 0, 0])), [0.18, 0.1, 0]);
    P('8', F(hhcs(0.375 * IN, u(0.625), [xm + t7 + nl3, YM, z], [1, 0, 0])), [0.24, 0.1, 0]);
  }
  void cyl; void at;
  return { view: { dir: [-1, 0.4, 0.9] } };
}
