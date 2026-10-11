// P214 — Tôles de protection CX009832 rév. 1 « SKID PLATE ARRANGEMENT »
// (page 214, vue de dessous), repère 3 de P208. Sous le châssis avant : tôle
// entre les roues avant (2, 1/2 po, ouverture Ø 200 mm de vidange) et tôle
// avant mécano-soudée (3, 3/8 po, pans coupés vers l'articulation, ouverture
// oblongue fermée par le couvercle mécano-soudé 6 à collet de centrage) ;
// sous le châssis arrière : tôle arrière (1, nez arrondi autour de
// l'articulation, ouverture oblongue fermée par le couvercle 5 percé d'un
// regard), tôle entre les roues arrière (7, 1/2 po) et plaque arrière (4,
// 3/8 po à ailes relevées, échancrée pour la tôle 7). Vis H 1/2-13 × 1 po (8,
// six, couvercles), × 1 1/2 po (9, vingt, bords des tôles), × 2 po (10, trois,
// recouvrement des tôles 7 et 1), rondelles plates (12) et Grower (14) ; vis
// H 5/8-11 × 2 1/4 po (11) à rondelles (13, 15) dans les ailes de la plaque 4,
// en travers des flancs du châssis arrière.
// Repère machine (P208 le place à l'identité) : tôles sous les flancs des
// châssis (dessus à y = M.frameBot = 0.42), têtes de vis vers le bas.
// Cotes relevées sur la vue de dessous à l'échelle de la voie (1,72 m) et de
// l'empattement (3,28 m) : tôle 2 de x = 0.91 à 1.87, tôle 3 de 0.26 à 0.97,
// tôle 1 de −0.19 à −1.19, tôle 7 de −1.13 à −2.09, plaque 4 de −2.04 à −2.22.
// Les tôles 2, 3, 6 et leur visserie suivent le châssis avant (corps « front »
// de la simulation) ; 1, 4, 5, 7 restent sur le châssis arrière.
import { M, body } from '../layout.js';
import { hhcs, splitWasher, flatWasher, along } from '../../du311/parts/_avance_b.js';
import { IN, slab, stadium } from './_fronta.js';

const FB = M.frameBot;
const T12 = 0.5 * IN, T38 = 0.375 * IN;

export default function P214(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e, front) => api.part(ref, front ? body('front', obj) : obj, e);
  const at = (o, y) => { o.position.y = y; return o; };

  // Vis 1/2 tête en bas sous une tôle dont le dessous est à y = yb (rondelle plate puis Grower).
  const tP = 0.097 * IN, tG = 0.125 * IN;
  const bolt12 = (ref, len, x, z, yb, front) => {
    P('12', along(THREE, flatWasher(S, THREE, 0.5, { t: 0.097 }), [0, -1, 0], [x, yb, z]), [0, -0.12, 0], front);
    P('14', along(THREE, splitWasher(S, THREE, 0.5), [0, -1, 0], [x, yb - tP, z]), [0, -0.17, 0], front);
    P(ref, along(THREE, hhcs(S, THREE, 0.5, len), [0, -1, 0], [x, yb - tP - tG, z]), [0, -0.26, 0], front);
  };

  // ---------------------------------------------------------------- 3 — tôle avant (mécano-soudée)
  const y3 = FB - T38 / 2;
  {
    const pts = [[0.971, -0.466], [0.971, 0.466], [0.673, 0.466], [0.581, 0.42], [0.26, 0.183], [0.26, -0.183], [0.581, -0.42], [0.673, -0.466]];
    const sl = (x, z) => stadium(x, z, 0.022, 0.011, 4);
    const pl = slab(api, pts, T38, 'grey', {
      paths: [stadium(0.608, 0, 0.44, 0.24), sl(0.951, -0.44), sl(0.951, 0.44)],
      holes: [[0.486, -0.329, 0.0072], [0.486, 0.332, 0.0072], [0.283, -0.128, 0.0072], [0.283, 0.13, 0.0072],
        [0.853, 0, 0.0072], [0.67, -0.145, 0.0072], [0.67, 0.148, 0.0072], [0.948, -0.229, 0.0072], [0.948, 0, 0.0072], [0.948, 0.229, 0.0072]],
    });
    // Raidisseurs soudés sur le dessus (plats 50 × 10) le long des pans coupés, cordons.
    const stiff = [];
    for (const s of [-1, 1]) {
      const a = [0.6, s * 0.4], b = [0.3, s * 0.19];
      const len = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const st = S.box(len, 0.03, 0.01, 'grey', { pos: [(a[0] + b[0]) / 2, T38 / 2 + 0.015, (a[1] + b[1]) / 2] });
      st.rotation.y = -Math.atan2(a[1] - b[1], a[0] - b[0]);
      stiff.push(st);
      stiff.push(S.weld([[b[0], T38 / 2, b[1] - s * 0.006], [a[0], T38 / 2, a[1] - s * 0.006]], 0.005, 'grey'));
    }
    P('3', at(S.group(S.merged([pl], 'grey'), S.merged(stiff, 'grey')), y3), [0, -0.3, 0], true);
  }
  // ---------------------------------------------------------------- 6 — couvercle avant (mécano-soudé)
  {
    const yb6 = FB - T38;
    const pl = slab(api, stadium(0.608, 0, 0.528, 0.328), T38, 'grey', { holes: [[0.853, 0, 0.0072], [0.67, -0.145, 0.0072], [0.67, 0.148, 0.0072]] });
    // Collet de centrage soudé sur le dessus (plat 6 mm) qui entre dans l'ouverture de la tôle 3.
    const ring = slab(api, stadium(0.608, 0, 0.432, 0.232), 0.008, 'grey', { paths: [stadium(0.608, 0, 0.42, 0.22)] });
    ring.position.y = T38 / 2 + 0.004;
    P('6', at(S.group(S.merged([pl, ring], 'grey')), yb6 - T38 / 2), [0, -0.45, 0], true);
    for (const [x, z] of [[0.853, 0], [0.67, -0.145], [0.67, 0.148]]) bolt12('8', 1.0, x, z, yb6 - T38, true);
  }
  // Vis 9 de la tôle 3.
  for (const [x, z] of [[0.486, -0.329], [0.486, 0.332], [0.283, -0.128], [0.283, 0.13]]) bolt12('9', 1.5, x, z, FB - T38, true);

  // ---------------------------------------------------------------- 2 — tôle entre les roues avant (1/2 po)
  {
    const yb = FB - T38 - T12; // sous la tôle 3 au recouvrement
    const pts = [];
    const r = 0.03, x0 = 0.91, x1 = 1.87, w = 0.254;
    for (let i = 0; i <= 4; i++) { const a = Math.PI + (i / 4) * (Math.PI / 2); pts.push([x0 + r + r * Math.cos(a), -w + r + r * Math.sin(a)]); }
    pts.push([x1, -w], [x1, w]);
    for (let i = 0; i <= 4; i++) { const a = Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push([x0 + r + r * Math.cos(a), w - r + r * Math.sin(a)]); }
    const holes = [[1.2, 0, 0.1]];
    const bl = [[1.862, -0.226], [1.862, 0], [1.862, 0.226], [0.948, -0.229], [0.948, 0], [0.948, 0.229]];
    bl.forEach(([x, z]) => holes.push([x, z, 0.0072]));
    // Cales d'épaisseur soudées sur le dessus à l'avant (rattrapent la tôle 3 sous le châssis).
    const shim = slab(api, [[1.84, -0.24], [1.885, -0.24], [1.885, 0.24], [1.84, 0.24]], T38, 'grey');
    shim.position.y = T12 / 2 + T38 / 2;
    P('2', at(S.group(S.merged([slab(api, pts, T12, 'grey', { holes }), shim], 'grey')), yb + T12 / 2), [0, -0.35, 0], true);
    bl.forEach(([x, z]) => bolt12('9', 1.5, x, z, yb, true));
  }

  // ---------------------------------------------------------------- 1 — tôle arrière (3/8 po)
  {
    const pts = [[-1.19, -0.489], [-1.19, 0.489], [-0.70, 0.489], [-0.68, 0.466], [-0.44, 0.466]];
    for (let i = 1; i < 12; i++) {
      // Nez arrondi vers l'articulation : arc par (−0.44, ±0.466) et (−0.19, 0).
      const t = i / 12, z = 0.466 * (1 - 2 * t);
      pts.push([-0.19 - 0.25 * (z / 0.466) ** 2, z]);
    }
    pts.push([-0.44, -0.466], [-0.68, -0.466], [-0.70, -0.489]);
    const bl9 = [[-0.442, -0.42], [-0.442, 0.42], [-1.153, -0.466 + 0.02], [-1.153, 0.466 - 0.02], [-0.29, -0.245], [-0.29, 0.245], [-0.215, 0]];
    const bl8 = [[-0.312, 0], [-0.437, -0.145], [-0.437, 0.148]];
    const bl10 = [[-1.157, -0.157], [-1.157, 0], [-1.157, 0.153]];
    const holes = [...bl9, ...bl8, ...bl10].map(([x, z]) => [x, z, 0.0072]);
    const pl = slab(api, pts, T38, 'grey', { holes, paths: [stadium(-0.69, 0, 0.72, 0.25)] });
    P('1', at(S.group(S.merged([pl], 'grey')), FB - T38 / 2), [0, -0.3, 0]);
    bl9.forEach(([x, z]) => bolt12('9', 1.5, x, z, FB - T38, false));
    // 5 — couvercle arrière (mécano-soudé) : plaque oblongue, collet de centrage, regard Ø 120.
    const yb5 = FB - T38;
    const cv = slab(api, stadium(-0.69, 0, 0.803, 0.336), T38, 'grey', { holes: [...bl8.map(([x, z]) => [x, z, 0.0072]), [-0.48, 0, 0.06]] });
    const ring = slab(api, stadium(-0.69, 0, 0.712, 0.242), 0.008, 'grey', { paths: [stadium(-0.69, 0, 0.7, 0.23)] });
    ring.position.y = T38 / 2 + 0.004;
    const lip = S.weldRing(0.062, 0.004, 'grey', { pos: [-0.48, -T38 / 2, 0] });
    P('5', at(S.group(S.merged([cv, ring], 'grey'), lip), yb5 - T38 / 2), [0, -0.45, 0]);
    bl8.forEach(([x, z]) => bolt12('8', 1.0, x, z, yb5 - T38, false));
    // 7 — tôle entre les roues arrière (1/2 po), sous la tôle 1 au recouvrement.
    const yb7 = FB - T38 - T12;
    const bl9b = [[-2.06, -0.206], [-2.06, 0], [-2.06, 0.209]];
    const h7 = [[-1.375, 0, 0.104], ...[...bl10, ...bl9b].map(([x, z]) => [x, z, 0.0072])];
    const p7 = [[-1.13, -0.256], [-1.13, 0.256], [-2.056, 0.256], [-2.086, 0.226], [-2.086, -0.226], [-2.056, -0.256]];
    const shim = slab(api, [[-2.04, -0.24], [-2.08, -0.24], [-2.08, 0.24], [-2.04, 0.24]], T38, 'grey');
    shim.position.y = T12 / 2 + T38 / 2;
    P('7', at(S.group(S.merged([slab(api, p7, T12, 'grey', { holes: h7 }), shim], 'grey')), yb7 + T12 / 2), [0, -0.35, 0]);
    bl10.forEach(([x, z]) => bolt12('10', 2.0, x, z, yb7, false));
    bl9b.forEach(([x, z]) => bolt12('9', 1.5, x, z, yb7, false));
  }

  // ---------------------------------------------------------------- 4 — plaque arrière à ailes relevées
  {
    const z0 = 0.5165; // plan intérieur des ailes (contre les flancs du châssis, faces à ±0.495)
    const pts = [[-2.04, -z0], [-2.04, -0.275], [-2.115, -0.24], [-2.115, 0.24], [-2.04, 0.275], [-2.04, z0], [-2.22, z0], [-2.22, -z0]];
    const base = slab(api, pts, T38, 'grey');
    base.position.y = FB - T38 / 2;
    const wings = [-1, 1].map((s) => {
      const w = S.extrude([[-2.04, FB - T38], [-2.22, FB - T38], [-2.22, FB + 0.085], [-2.2, FB + 0.095], [-2.06, FB + 0.095], [-2.04, FB + 0.085]], T38, 'grey', {
        holes: [[-2.08, FB + 0.045, 0.0087], [-2.18, FB + 0.045, 0.0087]],
      });
      w.position.z = s * (z0 + T38 / 2);
      return w;
    });
    P('4', S.group(S.merged([base, ...wings], 'grey')), [0, -0.25, 0]);
    // 11, 13, 15 — vis 5/8 × 2 1/4 en travers, têtes vers l'extérieur.
    const t13 = 0.12 * IN, t15 = 0.156 * IN;
    for (const s of [-1, 1]) for (const x of [-2.08, -2.18]) {
      const zf = s * (z0 + T38);
      P('13', along(THREE, flatWasher(S, THREE, 0.625, { t: 0.12 }), [0, 0, s], [x, FB + 0.045, zf]), [0, 0, s * 0.12]);
      P('15', along(THREE, splitWasher(S, THREE, 0.625), [0, 0, s], [x, FB + 0.045, zf + s * t13]), [0, 0, s * 0.17]);
      P('11', along(THREE, hhcs(S, THREE, 0.625, 2.25), [0, 0, s], [x, FB + 0.045, zf + s * (t13 + t15)]), [0, 0, s * 0.26]);
    }
  }

  return { view: { dir: [0.7, -0.9, 0.9] } };
}
