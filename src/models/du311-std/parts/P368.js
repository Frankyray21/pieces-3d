// P368 — Filtres haute pression : CX034831 rév. 0 « ASSY, HIGH PRESSURE
// FILTERS, DU311 » (page 368), repère 20 du porteur P208. Deux filtres Argo
// (1, P264 = filtre CX001670 du TVK) alignés selon l'axe de leurs orifices
// -20, têtes en haut, cuves pendantes ; flèches de sens d'écoulement vers
// l'extérieur. Filtre A (arrière) : entrée côté +X par un coude 90° MORB -20 →
// JIC -16 (6) tourné vers le haut, sortie côté −X par un coude 6 tourné vers le
// bas, le té à écrou tournant -16 (4, branche vers l'extérieur) et la
// réduction FJIC -16 → MJIC -12 (2) au bout du passage. Filtre B (avant) :
// entrée côté −X par un coude 6 tourné vers le bas, sortie côté +X par le
// coude 90° MORB -20 → JIC -12 (5) tourné vers le bas et le té à écrou
// tournant -12 (3, branche vers l'avant). Fixation : quatre vis H 7/16-14 ×
// 1 1/4 po (8) à rondelles Grower (9) vissées par l'arrière dans les bossages
// des têtes au travers de la console (tôle 1/4 po du porteur, non dessinée),
// quatre vis H 7/16-14 × 1 po filetées jusqu'à la tête (7) et rondelles
// Grower (9) fixant les deux pattes de la console sur le flanc.
// Repère machine (layout.js), posé à l'identité par P208 : filtres sur le côté
// droit du châssis avant, au-dessus du tuyau d'air ; origines de P264 (face
// d'appui des bossages, voir l'en-tête de P352 du TVK) en (0.62, 0.945, 0.60)
// et (0.86, 0.945, 0.60), sans rotation (orifices selon X, têtes vers +Z) ;
// pattes de la console contre le flanc (z = 0.495) à x = 0.52 et 0.96
// (FB.filters de _frontb.js ; repère 20 de carrier.js). Châssis avant : corps
// « front » de la simulation.
import { FB, orbElbow, orient, orientPoint, swivelRunTee, jicReducer, boltAt, front } from './_frontb.js';

const MM = 0.001;
const PORT = { x: 55 * MM, y: 7.5 * MM, z: 63 * MM }; // orifices -20 dans le repère de P352 (TVK)

export default function P368(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, front(obj), e);
  FB.filters.forEach((o, i) => {
    const T = (obj) => { const g = S.group(obj); g.position.set(...o); return g; };
    P('1', T(api.sub('P264')), [0, 0.05, 0.25]);
    const L = [-PORT.x, PORT.y, PORT.z], R = [PORT.x, PORT.y, PORT.z];
    if (i === 0) {
      // Sortie (−X) : coude vers le bas, té -16, réduction -16 → -12.
      const e = orbElbow(api, 20, 16);
      P('6', T(orient(api, e.obj, L, [-1, 0, 0], [0, -1, 0])), [-0.07, 0, 0]);
      const n = orientPoint(api, e.out, L, [-1, 0, 0], [0, -1, 0]);
      const t = swivelRunTee(api, 16);
      P('4', T(orient(api, t.obj, n, [0, -1, 0], [0, 0, 1])), [-0.07, -0.08, 0]);
      const r = orientPoint(api, t.run, n, [0, -1, 0], [0, 0, 1]);
      P('2', T(orient(api, jicReducer(api, 16, 12).obj, r, [0, -1, 0])), [-0.07, -0.15, 0]);
      // Entrée (+X) : coude vers le haut.
      P('6', T(orient(api, orbElbow(api, 20, 16).obj, R, [1, 0, 0], [0, 1, 0])), [0.05, 0.06, 0]);
    } else {
      P('6', T(orient(api, orbElbow(api, 20, 16).obj, L, [-1, 0, 0], [0, -1, 0])), [-0.05, -0.06, 0]);
      const e = orbElbow(api, 20, 12);
      P('5', T(orient(api, e.obj, R, [1, 0, 0], [0, -1, 0])), [0.07, 0, 0]);
      const n = orientPoint(api, e.out, R, [1, 0, 0], [0, -1, 0]);
      P('3', T(orient(api, swivelRunTee(api, 12).obj, n, [0, -1, 0], [1, 0, 0])), [0.07, -0.08, 0]);
    }
    // 8, 9 — vis des bossages, par l'arrière de la console (tôle 1/4 po).
    for (const s of [-1, 1]) {
      const b = boltAt(api, 0.4375, 1.25, [s * 30 * MM, 0, -0.00635], [0, 0, -1]);
      P('9', T(b.washer), [0, 0, -0.05]);
      P('8', T(b.bolt), [0, 0, -0.09]);
    }
  });
  // 7, 9 — vis des pattes de la console sur le flanc (pattes en tôle 1/4 po).
  for (const x of [0.52, 0.96]) for (const y of [0.935, 0.972]) {
    const b = boltAt(api, 0.4375, 1.0, [x, y, FB.side + 0.00635], [0, 0, 1], { full: true });
    P('9', b.washer, [0, 0, 0.05]);
    P('7', b.bolt, [0, 0, 0.09]);
  }
  return { view: { dir: [0.8, 0.5, 1.1] } };
}
