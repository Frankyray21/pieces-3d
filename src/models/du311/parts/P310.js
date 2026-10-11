// P310 — Actionneur de la vanne d'air de mine CX030923 rév. 0 (page 310) :
// « ASSEMBLY, ACTUATOR, MINE AIR », repère 12 du surpresseur P274.
// Actionneur pneumatique quart de tour à crémaillère (1, CP17212, livré avec
// son arbre d'accouplement) : corps carré en aluminium, deux flasques
// d'extrémité vissés (quatre vis CHC chacun), arbre de sortie Ø 3/4 po à
// méplat et flèche de rotation sur le dessus, plaque signalétique en façade.
// Deux orifices 1/4 NPT sur chaque flasque reçoivent les quatre coudes
// 90° MNPT 1/4 - JIC -06 (2), tournés vers le bas ; les deux coudes du flasque
// +X portent les tés tournants SFJIC-JIC/JIC -06 (3), branche vers +X.
// Repère : origine sur l'axe de l'arbre, au centre de la face supérieure du
// corps (face d'appui sous le support de vanne P274 rep. 8, comme au détail A
// de la page 274 : l'actionneur pend sous le support, l'arbre monte vers la
// vanne 3 voies de P314) ; Y vers le haut (axe de l'arbre), X le long du
// corps (crémaillères, flasques), +Z vers la façade (plaque signalétique).
// Encombrement ≈ 0.25 (X, de -0.095 au bout des tés à 0.16) × 0.18 (Y, de
// -0.145 à 0.038) × 0.09 (Z) m.
// Cotes : raccords d'après la liste ; actionneur estimé d'après les
// proportions de la page 310 (rien n'est coté). Les deux vues de la page
// montrent le même actionneur ; le raccord droit en façade de la vue basse
// n'est pas dans la liste et n'est pas dessiné.

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const BX = I(5.0), BY = I(3.4), BZ = I(3.4); // corps
const CAP = I(0.55); // flasques (deux plaques : couvercle + porte-orifices)
const PY = -I(1.0), PZ = [-I(0.55), I(0.55)]; // orifices des flasques (y, z)

export const ACT310 = { body: [BX, BY, BZ], shaftTop: I(1.5) };

export default function P310(api) {
  const { S } = api;
  const { box, lathe, cyl, merged, at, group, nameplate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);

  // ------------------------------------------------------------ 1 — actionneur
  const yc = -BY / 2;
  const alu = [box(BX, BY, BZ, 'castAlu', { r: I(0.12), pos: [0, yc, 0] })];
  const caps = [];
  const screws = [];
  for (const s of [-1, 1]) {
    // Flasque en deux plaques (couvercle de piston, plaque porte-orifices).
    caps.push(box(CAP * 0.45, BY * 1.04, BZ * 1.04, 'castAlu', { r: I(0.08), pos: [s * (BX / 2 + CAP * 0.225), yc, 0] }));
    caps.push(box(CAP * 0.55, BY * 0.86, BZ * 0.86, 'castAlu', { r: I(0.06), pos: [s * (BX / 2 + CAP * 0.45 + CAP * 0.275), yc, 0] }));
    for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
      screws.push(at(cyl(I(0.16), I(0.18), 'blackOxide', { axis: 'x', seg: 12 }), [s * (BX / 2 + CAP * 0.45 + I(0.09)), yc + dy * BY * 0.43, dz * BZ * 0.43]));
    }
  }
  // Arbre d'accouplement : Ø 3/4 po, méplat (clavette) et chanfrein ; bague de sortie.
  const shaft = merged([
    lathe([[0, 0], [I(0.62), 0], [I(0.62), I(0.12)], [0, I(0.12)]], 'steel', { seg: 28 }),
    lathe([[0, I(0.1)], [I(0.375), I(0.1)], [I(0.375), I(1.42)], [I(0.33), I(1.5)], [0, I(1.5)]], 'steel', { seg: 24 }),
  ], 'steel');
  const key = box(I(0.19), I(1.0), I(0.08), 'blackOxide', { pos: [0, I(0.95), I(0.36)] });
  // Trous de fixation (ISO 5211 F05) et flèche de rotation sur le dessus.
  const marks = [];
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) marks.push(at(cyl(I(0.13), 0.0008, 'blackOxide', { seg: 10 }), [x * I(0.97), 0.0004, z * I(0.97)]));
  const arrow = [];
  for (let i = 0; i < 9; i++) {
    const a = -0.9 + (i / 8) * 1.8;
    arrow.push(box(I(0.12), 0.0006, I(0.04), 'black', { pos: [Math.sin(a) * I(0.95), 0.0003, Math.cos(a) * I(0.95)], rot: [0, a, 0] }));
  }
  arrow.push(box(I(0.2), 0.0006, I(0.05), 'black', { pos: [Math.sin(0.9) * I(0.95) - I(0.04), 0.0003, Math.cos(0.9) * I(0.95) + I(0.06)], rot: [0, 0.2, 0] }));
  const plateN = at(nameplate(I(2.6), I(1.5)), [-I(0.6), yc - I(0.2), BZ / 2]);
  P('1', group(merged([...alu, ...caps], 'castAlu'), merged(screws, 'blackOxide'), shaft, key, merged(marks, 'blackOxide'), merged(arrow, 'black'), plateN), [0, 0, 0]);

  // ------------------------------------------------------------ 2 — coudes 90° MNPT 1/4 - JIC -06 ; 3 — tés tournants
  const xf = BX / 2 + CAP; // face des flasques
  for (const s of [-1, 1]) {
    for (const z of PZ) {
      const port = [s * xf, PY, z];
      const yl = [s, 0, 0], xl = [0, -1, 0];
      const el = ACC.elbow(S, { a: 4, b: 6 });
      P('2', O(el, port, yl, xl), [s * 0.05, 0, 0]);
      if (s > 0) {
        const tip = ACC.local(port, yl, xl, ...el.userData.out);
        P('3', O(ACC.swivelTee(S, 6), tip, [0, -1, 0], [1, 0, 0]), [0.07, -0.05, 0]);
      }
    }
  }

  return { view: { dir: [0.9, 0.7, 1.2] } };
}
