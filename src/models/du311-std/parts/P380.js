// P380 — Adaptateurs d'aspiration des pompes : CX035972 rév. 0 « ASSY,
// SUCTION ADAPTERS » (page 380), repère 24 du porteur P208. Sur les orifices
// d'aspiration à bride code 61 des deux pompes du groupe 60 HP (P334 ; « pumps
// are shown for reference only ») : coude 90° à bride 2 1/2 po et douille
// cannelée 2 1/2 po (1) sur la pompe 100 cm³, avec demi-brides J518 2 1/2 po
// (trousse 9 : deux demi-brides, quatre vis H 1/2-13 et rondelles) et collier
// à boulon en T 3 po (4) ; coude 90° à bride 2 po et douille 2 po (2) sur la
// pompe 74 cm³, demi-brides 2 po (trousse 8) et collier 2 1/2 po (3). Coudes
// tournés vers le haut (vers le réservoir). Raccords des pompes : coude 90°
// MORB -12 → JIC -16 (7) sur le drain de carter de la pompe 100 cm³, coude 90°
// MORB -10 → JIC -12 (6) sur celui de la pompe 74 cm³, deux coudes 90° MORB
// -04 → JIC -06 (5) sur les orifices de pilotage LS des régulateurs.
// Repère machine (layout.js), posé à l'identité par P208 : orifices des pompes
// estimés d'après carrier.js (pompes 100 cm³ à x = 1.15 et 74 cm³ à x = 1.335,
// axe y = 0.74, z = 0) : aspirations sur le flanc gauche (z = −0.10 et
// −0.085), drains dessus, pilotages sur le flanc droit (FB.pumps de _frontb.js,
// à recaler sur P334). Châssis avant : corps « front » de la simulation.
import { FB, IN, suctionAdapter, splitFlange, tBoltClamp, orbElbow, orient, orientPoint, front } from './_frontb.js';

export default function P380(api) {
  const P = (ref, obj, e) => api.part(ref, front(obj), e);
  const { s1, s2, d1, d2, x1, x2 } = FB.pumps;
  const fit = (ref, kitRef, clampRef, q, dash, hoseIn, rc) => {
    const side = [0, 1, 0];
    const a = suctionAdapter(api, dash, 90, hoseIn);
    P(ref, orient(api, a.obj, q.p, q.d, side), [0, 0.1, -0.12]);
    P(kitRef, orient(api, splitFlange(api, dash, 61).obj, q.p, q.d, side), [0, 0, -0.07]);
    const c = orientPoint(api, a.clamp.toArray(), q.p, q.d, side);
    const tipDir = [0, 1, 0]; // douille du coude tournée vers le haut
    P(clampRef, orient(api, tBoltClamp(api, rc), c, tipDir, [1, 0, 0]), [0, 0.25, -0.12]);
  };
  fit('1', '9', '4', s1, 40, 2.5, (2.5 * IN) / 2 + 0.008);
  fit('2', '8', '3', s2, 32, 2.0, (2.0 * IN) / 2 + 0.007);
  P('7', orient(api, orbElbow(api, 12, 16).obj, d1.p, d1.d, [-1, 0, 0]), [0, 0.07, 0]);
  P('6', orient(api, orbElbow(api, 10, 12).obj, d2.p, d2.d, [-1, 0, 0]), [0, 0.07, 0]);
  for (const q of [x1, x2]) P('5', orient(api, orbElbow(api, 4, 6).obj, q.p, q.d, [0, -1, 0]), [0, 0, 0.06]);
  return { view: { dir: [0.4, 0.7, -1.1] } };
}
