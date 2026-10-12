// P418 — Transmission par courroies CX026563 rév. 0 (page 418) : « BELT
// DRIVE 10.3" SHEAVE, 2 3/8" SHAFT », repère 6 du pont arrière P416. Poulie
// en fonte de 10,3 po de diamètre extérieur à quatre gorges 5V (1) montée sur
// le bout d'arbre de 2 3/8 po du moteur électrique 75 HP par un moyeu amovible
// QD type E (2, fendu, bride Ø 6 po serrée par trois vis H 1/2-13 × 2 3/4 po
// sur un cercle de 5 po) ; courroie jumelée 5VP « Predator » de 100 po à
// quatre brins (3) qui remonte vers la poulie 5VP Ø 16 po du surpresseur Le
// Roi (LR.sheaveR, P434 = P282 du TVK).
// Repère : origine sur l'axe de l'arbre moteur, dans le plan médian des
// gorges ; axes parallèles au repère machine (X vers l'avant, Y vers le haut,
// Z vers la droite) ; arbre selon Z, moteur côté +Z, bride du moyeu côté -Z
// (extérieur gauche de la machine). Axe de la poulie du surpresseur en
// (0, C, 0), C = DRIVE.yComp - DRIVE.yMotor (../reardeck.js). Placement dans
// la machine : at(api.sub('P418'), SHEAVE_AT) — axe du corps mobile « sheave »
// de la simulation.
// Encombrement ≈ 0.42 (X) × 0.95 (Y) × 0.12 (Z) m avec la courroie.
// Cotes : poulie 10,3 po, quatre gorges 5V au pas de 11/16 po (largeur 3 1/16
// po, gorges à 38°), moyeu QD E (bride Ø 6 × 7/8 po, fût conique Ø 3,83 po
// sur 1 3/4 po, alésage 2 3/8 po), courroie 5VP (dos de 0,12 po, brins de
// 5/8 po en tête, 17/32 po de haut) ; voile plein et moyeu d'après la vue
// isométrique de la page 418.

import { body } from '../layout.js';
import { DRIVE } from '../reardeck.js';
import { LR } from '../../du311/parts/_moteur_surpresseur.js';
import { I, sweepGeo, meshOf, arcPts } from './_reara.js';

export const SHEAVE_AT = [DRIVE.x, DRIVE.yMotor, DRIVE.z];
const C = DRIVE.yComp - DRIVE.yMotor;

// Poulie (cotes en mètres, axe local Y du profil = Z de la pièce)
const RO = I(10.3) / 2;
const F = I(3.0625); // largeur de jante : 3 × 11/16 + 2 × 1/2 po
const PITCH = I(0.6875);
const GT = I(0.62), GD = I(0.6); // gorge 5V : largeur en tête, profondeur
const GB = GT - 2 * GD * Math.tan(19 * Math.PI / 180); // largeur au fond (38°)
const RRI = RO - I(0.95); // intérieur de jante
const RH = I(3.0); // moyeu Ø 6 po
const WEB = I(0.75); // voile plein
const RB0 = I(3.834) / 2, RB1 = RB0 - I(1.75) * (0.75 / 12) / 2; // alésage conique QD E
// Moyeu QD E
const FL = I(0.875), RF = I(3.0), BAR = I(1.75), RS = I(2.375) / 2;

export default function P418(api) {
  const { THREE, S } = api;
  const { lathe, slotted, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- 1 — poulie 10,3 po 4 gorges 5V
  // Profil (r, y) de révolution, y le long de l'arbre (y = -F/2 côté bride du moyeu).
  const h = F / 2, c = I(0.06);
  const prof = [
    [RB0, -h], [RH - c, -h], [RH, -h + c], [RH, -WEB / 2 - I(0.12)], [RH + I(0.12), -WEB / 2],
    [RRI - I(0.12), -WEB / 2], [RRI, -WEB / 2 - I(0.12)], [RRI, -h], [RO - c, -h], [RO, -h + c],
  ];
  for (let k = 0; k < 4; k++) {
    const yc = (k - 1.5) * PITCH;
    prof.push([RO, yc - GT / 2], [RO - GD, yc - GB / 2], [RO - GD, yc + GB / 2], [RO, yc + GT / 2]);
  }
  prof.push([RO, h - c], [RO - c, h], [RRI, h], [RRI, WEB / 2 + I(0.12)], [RRI - I(0.12), WEB / 2],
    [RH + I(0.12), WEB / 2], [RH, WEB / 2 + I(0.12)], [RH, h - c], [RH - c, h], [RB1 + I(0.03), h],
    [RB1, h - I(0.03)], [RB1, -h + BAR], [RB0, -h]);
  const sheave = lathe(prof, 'castIron', { axis: 'z', seg: 64 });
  // Trois taraudages 1/2-13 des vis du moyeu et trois perçages de démontage
  // sur la face du moyeu (côté bride) : fonds de trous en retrait.
  const holes = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    holes.push(at(S.ring(I(0.29), I(0.21), I(0.02), 'castIron', { axis: 'z', seg: 14 }), [Math.cos(a) * I(2.5), Math.sin(a) * I(2.5), -h - I(0.01)]));
  }
  // Marques de coulée : bossage d'équilibrage sur le voile (côté moteur).
  const boss = at(S.cyl(I(0.35), I(0.12), 'castIron', { axis: 'z', seg: 14 }), [0, -(RH + RRI) / 2, WEB / 2 + I(0.06)]);
  P('1', body('sheave', group(sheave, merged([...holes, boss], 'castIron'))), [0, 0, -0.06]);

  // ---------------------------------------------------------------- 2 — moyeu amovible QD E, alésage 2 3/8 po
  // Bride fendue côté extérieur (-Z), fût conique dans l'alésage de la poulie,
  // fente de serrage sur toute la longueur ; trois vis H 1/2-13 × 2 3/4 po à
  // rondelles Grower (dans les trous de passage) et trois taraudages de
  // démontage alternés ; vis de pression sur clavette.
  const split = [{ a: Math.PI / 2, w: I(0.12) / RF, y0: -1, y1: 1 }];
  const flange = slotted(RF, RS, -h - FL, -h, split, 'gunmetal', { axis: 'z', seg: 48 });
  const barrel = slotted((RB0 + RB1) / 2 - I(0.005), RS, -h, -h + BAR, [{ a: Math.PI / 2, w: I(0.12) / RB0, y0: -1, y1: 1 }], 'gunmetal', { axis: 'z', seg: 40 });
  // Chanfrein de la bride (couronne) et rainure de clavette 5/8 po suggérée par la clavette en place.
  const cham = lathe([[RF - I(0.08), -h - FL - I(0.001)], [RF + I(0.0), -h - FL + I(0.08)], [RF, -h - FL + I(0.1)], [RF - I(0.08), -h - FL + I(0.1)]], 'gunmetal', { axis: 'z', seg: 48 });
  const key = S.box(I(0.625), I(0.3125), F + FL, 'steel', { r: 0.0006, pos: [0, RS + I(0.13), -FL / 2] });
  const fast = [], taps = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * I(2.5), y = Math.sin(a) * I(2.5);
    if (k % 2 === 0) {
      fast.push(at(group(S.bolt(I(0.5), I(2.75), 'zinc')), [x, y, -h - FL - I(0.125)], [-Math.PI / 2, 0, 0]));
      fast.push(at(S.ring(I(0.44), I(0.26), I(0.125), 'zinc', { axis: 'z', seg: 16 }), [x, y, -h - FL - I(0.0625)]));
    } else {
      taps.push(at(S.ring(I(0.27), I(0.2), I(0.03), 'gunmetal', { axis: 'z', seg: 14 }), [x, y, -h - FL - I(0.01)]));
    }
  }
  // Vis de pression 3/8-16 sur la clavette, dans la bride (six-pans creux affleurant).
  const set = at(S.cyl(I(0.19), I(0.25), 'blackOxide', { seg: 12 }), [0, RS + I(0.5), -h - FL / 2]);
  P('2', body('sheave', group(merged([flange, barrel, cham, ...taps], 'gunmetal'), key, merged(fast, 'zinc'), set)), [0, 0, -0.16]);

  // ---------------------------------------------------------------- 3 — courroie jumelée 5VP, 4 brins, 100 po
  // Dos de la courroie à 3 mm au-dessus du diamètre extérieur des poulies ;
  // brins trapézoïdaux engagés dans les gorges. Parcours : brin droit,
  // enroulement sur la poulie du surpresseur, brin gauche, enroulement sur la
  // poulie du moteur (sens trigonométrique, intérieur à gauche).
  const r1 = RO + 0.003, r2 = LR.sheaveR + 0.003;
  const phi = Math.asin((r2 - r1) / C);
  const path = [];
  const line = (A, B, n) => { for (let i = 0; i < n; i++) path.push([A[0] + ((B[0] - A[0]) * i) / n, A[1] + ((B[1] - A[1]) * i) / n]); };
  line([r1 * Math.cos(phi), r1 * Math.sin(phi)], [r2 * Math.cos(phi), C + r2 * Math.sin(phi)], 4);
  path.push(...arcPts(0, C, r2, phi, Math.PI - phi, 40).slice(0, -1));
  line([-r2 * Math.cos(phi), C + r2 * Math.sin(phi)], [-r1 * Math.cos(phi), r1 * Math.sin(phi)], 4);
  path.push(...arcPts(0, 0, r1, Math.PI - phi, 2 * Math.PI + phi, 32).slice(0, -1));
  const hw = 0.034, band = 0.003, rib = 0.0135;
  const bp = [[0, -hw], [0, hw], [band, hw]];
  for (let k = 3; k >= 0; k--) {
    const zc = (k - 1.5) * PITCH;
    bp.push([band, zc + 0.0075], [rib, zc + 0.0039], [rib, zc - 0.0039], [band, zc - 0.0075]);
  }
  bp.push([band, -hw]);
  const beltGeo = sweepGeo(THREE, path, bp, { closed: true, loop: true });
  P('3', group(meshOf(api, [beltGeo], 'rubber', 0.6)), [0.14, 0, 0]);

  return { view: { dir: [-1, 0.45, -1.2] } };
}
