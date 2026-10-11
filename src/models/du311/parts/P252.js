// P252 — Sélecteur de frein CX032617 rév. 0 (page 252) : « ASSY, BRAKE
// SELECTOR VALVE », repère 8 de l'ensemble moteur diesel P242, posé sur la
// plaque de montage formée (P242 rep. 6) au bout du caisson de batteries.
// Électrovanne 3 voies 2 positions (1) : corps acier 2 × 3 × 2 po à orifices
// SAE -06, cartouche et bobine 24 V à connecteur DIN sur le dessus ; deux
// vis 1/4-20 × 1 3/4 (5) et leurs rondelles (6) traversent le pied du corps
// (dégagement en façade) pour le fixer sur la plaque. Raccords -06 : coude
// 90° ORB-JIC (3) sur la face gauche, coiffé du té tournant SFJIC-JIC/JIC (2)
// (branche vers la gauche, passage vers le bas) ; coude 90° ORB-JIC (3) sur
// la face droite, tourné vers le bas ; adaptateur droit ORB-JIC (4) sous le
// corps.
// Repère : origine au centre de la face arrière du corps (face d'appui sur la
// plaque de montage) ; +Z vers l'avant (sortie des vis), Y vers le haut,
// X vers la droite de la page 252. Corps de x = ±0.0254, y = ±0.038,
// z = 0 à 0.051 ; bobine au-dessus jusqu'à y = 0.115.
// Encombrement ≈ 0.14 (X) × 0.20 (Y, de -0.085 à 0.115) × 0.08 (Z) m.
// Cotes : visserie et raccords d'après la liste ; corps et bobine estimés
// d'après les proportions du dessin (rien n'est coté).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const BX = I(2), BY = I(3), BZ = I(2); // corps
const RB = I(0.5), RD = I(0.6); // dégagement en façade du pied : profondeur, hauteur
const ZC = BZ / 2; // plan des orifices

export const VALVE252 = { body: [BX, BY, BZ] };

export default function P252(api) {
  const { S } = api;
  const { box, lathe, merged, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);

  // ------------------------------------------------------------ 1 — électrovanne
  // Corps : bloc à dégagement en façade au pied (portée des têtes de vis),
  // orifices taraudés (lamages sombres) sur les faces ; cartouche vissée sur
  // le dessus (écrou six-pans 7/8), tube de culasse, bobine Ø 1 7/8 × 2 po,
  // connecteur DIN tourné vers l'avant-droite, écrou de bobine.
  const body = merged([
    box(BX, BY - RD, BZ, 'zinc', { r: I(0.03), pos: [0, RD / 2, BZ / 2] }),
    box(BX, RD, BZ - RB, 'zinc', { r: I(0.03), pos: [0, -BY / 2 + RD / 2, (BZ - RB) / 2] }),
  ], 'zinc');
  const spots = [];
  const spot = (pos, axis) => spots.push(S.ring(I(0.36), I(0.3), I(0.01), 'darkSteel', { pos, axis, seg: 20 }));
  spot([-BX / 2 - I(0.005), I(0.55), ZC], 'x');
  spot([BX / 2 + I(0.005), -I(0.1), ZC], 'x');
  spot([0, -BY / 2 - I(0.005), (BZ - RB) / 2], 'y');
  const yTop = BY / 2;
  const coil = group(
    merged([
      lathe([[0, 0], [I(0.55), 0], [I(0.55), I(0.38)], [0, I(0.38)]], 'steel', { seg: 6, pos: [0, yTop, ZC] }),
      lathe([[0, I(0.38)], [I(0.33), I(0.38)], [I(0.33), I(2.75)], [I(0.2), I(2.95)], [0, I(2.95)]], 'steel', { seg: 18, pos: [0, yTop, ZC] }),
      lathe([[0, 0], [I(0.36), 0], [I(0.36), I(0.3)], [0, I(0.3)]], 'steel', { seg: 6, pos: [0, yTop + I(2.6), ZC] }),
    ], 'steel'),
    merged([
      lathe([[I(0.35), I(0.45)], [I(0.85), I(0.45)], [I(0.94), I(0.55)], [I(0.94), I(2.4)], [I(0.85), I(2.5)], [I(0.35), I(2.5)]], 'black', { seg: 32, pos: [0, yTop, ZC] }),
      // Connecteur DIN 43650 : embase sur la bobine, fiche carrée, presse-étoupe.
      box(I(0.7), I(1.15), I(0.5), 'black', { r: I(0.06), pos: [0, yTop + I(1.5), ZC + I(1.1)] }),
      box(I(1.1), I(1.25), I(0.85), 'black', { r: I(0.1), pos: [0, yTop + I(1.5), ZC + I(1.75)] }),
      lathe([[0, 0], [I(0.3), 0], [I(0.3), I(0.25)], [I(0.22), I(0.4)], [0, I(0.4)]], 'black', { seg: 14, pos: [0, yTop + I(0.88), ZC + I(1.75)], axis: '-y' }),
    ], 'black'),
    S.at(S.cyl(I(0.06), I(0.03), 'steel', { axis: 'z', seg: 10 }), [0, yTop + I(1.5), ZC + I(2.19)]),
  );
  P('1', group(body, merged(spots, 'darkSteel'), coil), [0, 0, 0]);

  // ------------------------------------------------------------ 5, 6 — vis 1/4-20 × 1 3/4 et rondelles
  // Têtes sur le dégagement (z = BZ - RB), filet dans la plaque de montage.
  const nl = I(0.25) * 0.24;
  for (const sx of [-1, 1]) {
    const pos = [sx * I(0.6), -BY / 2 + RD / 2, BZ - RB];
    P('6', O(ACC.nordLock(S, 0.25), pos, [0, 0, 1], [1, 0, 0]), [0, -0.012, 0.045]);
    P('5', O(ACC.hhcs(S, 0.25, 1.75), [pos[0], pos[1], pos[2] + nl], [0, 0, 1], [1, 0, 0]), [0, -0.012, 0.1]);
  }

  // ------------------------------------------------------------ 3 — coude gauche et 2 — té tournant
  const pL = [-BX / 2, I(0.55), ZC], yL = [-1, 0, 0], xL = [0, -1, 0];
  const elL = ACC.elbow(S, { a: 6, b: 6, aType: 'orb' });
  P('3', O(elL, pL, yL, xL), [-0.05, 0, 0]);
  const tipL = ACC.local(pL, yL, xL, ...elL.userData.out);
  P('2', O(ACC.swivelTee(S, 6), tipL, [0, -1, 0], [-1, 0, 0]), [-0.05, -0.045, 0]);

  // ------------------------------------------------------------ 3 — coude droit
  const pR = [BX / 2, -I(0.1), ZC];
  P('3', O(ACC.elbow(S, { a: 6, b: 6, aType: 'orb' }), pR, [1, 0, 0], [0, -1, 0]), [0.05, 0, 0]);

  // ------------------------------------------------------------ 4 — adaptateur droit ORB-JIC sous le corps
  P('4', O(ACC.straight(S, { a: 6, b: 6, aType: 'orb' }), [0, -BY / 2, (BZ - RB) / 2], [0, -1, 0], [1, 0, 0]), [0, -0.045, 0]);

  return { view: { dir: [-0.9, 0.6, 1.3] } };
}
