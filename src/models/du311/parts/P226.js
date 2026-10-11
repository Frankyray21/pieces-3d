// P226 — Électrovannes d'air CX030859 rév. 2 « ASSEMBLY, SOLENOID VALVES,
// AIR » (page 226), repère 17 de P186. Deux électrovannes 3 voies côte à
// côte, même orientation : P228 (3) à gauche, P230 (4, mise à vide) à droite,
// chacune fixée par ses deux oreilles supérieures (vis H 1/4-20 × 5/8 po, 7,
// et rondelles Grower, 8, deux par vanne) sur un support du porteur (hors
// liste). Sur chaque vanne : silencieux 1/4 NPT (1) sur l'échappement E,
// coudes 1/4 NPT → JIC -06 (5) sur P et sur A, tournés vers le bas. Sous la
// vanne 4 : adaptateur droit MNPT → écrou tournant JIC -06 (6) vissé dans
// l'entrée haute du sélecteur de circuit (2, même bloc que P270), dont
// l'entrée basse et la sortie latérale portent deux coudes 5.
// Repère : origine au centre du corps de la vanne 3 (repère de P228 : Y vers
// le haut selon les vis, +X côté orifices P / E, +Z côté bobines) ; vanne 4
// décalée de 0.14 m selon +X. Dessus des oreilles à y = 0.0375 (appui sur le
// support à y = 0.0255). Encombrement ≈ 0.24 (X) × 0.5 (Y, gaines comprises)
// × 0.12 (Z) m.
// Dans P186 : emplacement du repère 17 de frame.js, vers x ≈ 0.65,
// y ≈ DECK + 0.88, z ≈ 0.12 du repère machine.
import { IN, NPT, nptFitting, orient, orientPoint, portedBlock } from './_chassis.js';
import { SOLV } from './P228.js';

export default function P226(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (NPT[4] * IN) / 2;
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const DX = 0.14;

  // 3 et 4 — électrovannes (P228, P230).
  P('3', api.sub('P228'), [0, 0.08, 0]);
  P('4', S.at(api.sub('P230'), [DX, 0, 0]), [0, 0.08, 0]);

  for (const x0 of [0, DX]) {
    const o = [x0, 0, 0];
    // 7 / 8 — vis et rondelles Grower sur les oreilles.
    for (const l of SOLV.lugs) {
      const p = add(o, l);
      P('8', S.washer(0.0062, 0.0034, 0.0016, 'zinc', { pos: [p[0], p[1] + 0.0008, p[2]] }), [0, 0.11, 0]);
      P('7', S.bolt(0.25 * IN, 0.625 * IN, 'zinc', { pos: [p[0], p[1] + 0.0016, p[2]] }), [0, 0.14, 0]);
    }
    // 1 — silencieux sur E : queue 1/4 NPT, six-pans, cartouche frittée à bout arrondi.
    const e = add(o, SOLV.E.pos);
    const sil = S.group(
      S.merged([
        S.lathe([[0, -0.009], ...S.thread(rn * 0.95, -0.009, 0, { r1: rn, pitch: rn * 0.2 }), [0, 0]], 'brass', { seg: 14 }),
        S.nut(0.0175, 0.006, 'brass', { pos: [0, 0.003, 0] }),
      ], 'brass'),
      S.lathe([[0, 0.006], [0.0105, 0.006], [0.0105, 0.044], [0.008, 0.05], [0, 0.051]], 'castAlu', { seg: 24 }),
    );
    P('1', orient(api, sil, e, SOLV.E.dir), [0.06, 0, 0]);
    // 5 — coudes sur P (+X) et A (-X), sorties vers le bas.
    for (const k of ['P', 'A']) {
      const { pos, dir } = SOLV[k];
      const el = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
      const at = add(o, pos);
      P('5', orient(api, el.obj, at, dir, [0, -1, 0]), dir.map((v) => v * 0.05));
      if (x0 === DX && k === 'A') {
        // Sortie mâle du coude A de la vanne 4 → adaptateur 6 → sélecteur 2.
        const out = orientPoint(api, el.out, at, dir, [0, -1, 0]);
        const a6 = nptFitting(api, { npt: 4, jic: 6, end: 'swivel' });
        const top = out[1] + 0.008 - a6.out[1]; // dessus du sélecteur (écrou coiffant 8 mm du bout mâle)
        P('6', orient(api, a6.obj, [out[0], top, out[2]], [0, 1, 0]), [0, -0.05, 0]);
        shuttle([out[0], top, out[2]]);
      }
    }
  }

  // 2 — sélecteur de circuit (CP17024) : bloc 1.4 × 1.9 × 1.4 po long axe
  // vertical, entrées en haut (6) et en bas, sortie côté -X ; coudes 5 en bas
  // et sur la sortie.
  function shuttle(topCenter) {
    const bw = 0.048, bs = 0.036;
    const c = [topCenter[0], topCenter[1] - bw / 2, topCenter[2]];
    const blk = S.group(portedBlock(api, bs, bs, bw, 'zinc', [[0, 0, rn * 0.95, 0.012]], { spot: 0 }));
    blk.rotation.x = -Math.PI / 2; // face percée +Z → +Y (entrée haute)
    // Orifices bas et -X : collerettes taraudées affleurantes.
    const ring = (axis) => S.lathe([[rn * 0.95, 0], [0.0105, 0], [0.0105, 0.002], [rn * 0.95, 0.002], [rn * 0.95, 0]], 'zinc', { axis, seg: 20 });
    const rb = ring('-y'); rb.position.y = -bw / 2;
    const rx = ring('-x'); rx.position.set(-bs / 2, 0.006, 0);
    const seat = S.nut(0.03, 0.008, 'zinc', { axis: 'x', pos: [bs / 2 + 0.004, 0.006, 0] });
    P('2', S.at(S.group(blk, rb, rx, seat), c), [0, -0.12, 0]);
    const eb = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
    P('5', orient(api, eb.obj, [c[0], c[1] - bw / 2 - 0.002, c[2]], [0, -1, 0], [1, 0, 0]), [0, -0.17, 0]);
    const ex = nptFitting(api, { npt: 4, jic: 6, angle: 90 });
    P('5', orient(api, ex.obj, [c[0] - bs / 2 - 0.002, c[1] + 0.006, c[2]], [-1, 0, 0], [0, -1, 0]), [-0.05, -0.12, 0]);
  }

  return { view: { dir: [0.7, 0.45, 1.1] } };
}
