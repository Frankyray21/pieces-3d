// P350 — Adaptateurs d'aspiration du réservoir : CX034751 rév. 0 « ASSY,
// SUCTION ADAPTERS, DU311 » (page 350), repère 13 du porteur P208. Deux
// sorties superposées sur la face avant du réservoir hydraulique : en bas,
// adaptateur droit à bride 2 1/2 po code 61 et douille cannelée 2 1/2 po (1,
// flexible d'aspiration de la pompe 100 cm³, collier à boulon en T 3 po, 3) ;
// en haut, adaptateur droit à bride 2 1/2 po code 61 et douille cannelée 2 po
// (4, flexible de la pompe 74 cm³, collier 2 1/2 po, 2). Chaque bride est
// serrée par une trousse de demi-brides J518 code 61 2 1/2 po (5) : deux
// demi-brides, quatre vis H 1/2-13 et rondelles Grower. Les flexibles
// d'aspiration ne font pas partie de l'ensemble (non dessinés).
// Repère machine (layout.js), posé à l'identité par P208 : faces d'appui des
// collets sur la face avant du réservoir hydraulique du pont avant (x = 0.64,
// réservoir de carrier.js), à z = −0.22, collets à y = 1.085 (bas) et 1.205
// (haut), douilles vers l'avant (+X), grand entraxe des demi-brides à
// l'horizontale (FB.tank de _frontb.js). Châssis avant : corps « front ».
import { FB, IN, suctionAdapter, splitFlange, tBoltClamp, orient, orientPoint, front } from './_frontb.js';

export default function P350(api) {
  const { THREE } = api;
  const P = (ref, obj, e) => api.part(ref, front(obj), e);
  const { x, z, y } = FB.tank;
  const fit = (ref, clampRef, yy, hoseIn, rc) => {
    const pos = [x, yy, z], dir = [1, 0, 0], side = [0, 1, 0];
    const a = suctionAdapter(api, 40, 0, hoseIn);
    P(ref, orient(api, a.obj, pos, dir, side), [0.16, 0, 0]);
    P('5', orient(api, splitFlange(api, 40, 61).obj, pos, dir, side), [0.08, 0, 0]);
    const cl = tBoltClamp(api, rc);
    const c = orientPoint(api, a.clamp.toArray(), pos, dir, side);
    const g = orient(api, cl, c, dir, [0, 1, 0]);
    P(clampRef, g, [0.3, 0, 0]);
    void THREE;
  };
  fit('1', '3', y[0], 2.5, (2.5 * IN) / 2 + 0.008);
  fit('4', '2', y[1], 2.0, (2.0 * IN) / 2 + 0.007);
  return { view: { dir: [1, 0.5, 0.9] } };
}
