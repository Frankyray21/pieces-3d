// P368 — Ensemble réservoir de graisse CX030924 rév. 0 (page 368), repère 33
// de P328 : réservoir de 32 L (1, P370) et pompe d'injection de graisse
// pneumatique (2, CP17054-4) accrochée sous son fond. La pompe : moteur à air
// (fût Ø 4 po entre deux flasques carrés et quatre tirants) à −X, corps en fonte
// au centre, bride d'aspiration tournée vers le haut contre le fond du
// réservoir (joint P370 repère 4), tirant central traversant le réservoir et
// serré sur le dessus par l'écrou de pompe (« GREASE PUMP NUT ») ; tube de
// pompage, clapet de refoulement six-pans à +X. Bouchon à six-pans creux noyé
// (3) sur le flanc du corps ; trois coudes 90° 1/4 NPT × JIC -06 (4) : entrée
// d'air sur le flasque arrière, refoulement au bout du clapet, purge sous le
// corps.
// Repère : celui de P370 (origine au centre du dessous du fond du réservoir,
// Y vers le haut, couvercle vers −X) ; la pompe pend sous le fond, axe selon X
// à y = −0.069. Encombrement 0.51 (X) × 0.49 (Y, de −0.13 à 0.36) × 0.27 (Z) m.
// Le réservoir est posé par ses pattes (y = 0) sur une console du porteur
// échancrée pour la pompe.
import { IN, kit } from './_porteur.js';
import { PUMP } from './P370.js';

const YA = -0.069; // axe de la pompe
const RC = 2 * IN; // fût du moteur à air (Ø 4 po)

export default function P368(api) {
  const { THREE, S } = api;
  const { lathe, box, cyl, fitting, merged, group, at } = S;
  const T = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);

  P('1', api.sub('P370'), [0, 0.18, 0]);

  // ---------------------------------------------------------------- 2 — pompe
  const x0 = PUMP.x, z0 = PUMP.z;
  // Moteur à air : flasques carrés, fût, tirants et écrous.
  const xF1 = x0 - 0.045, xF0 = x0 - 0.185; // flasque avant (corps), flasque arrière
  const castParts = [
    box(0.018, 0.115, 0.115, 'blackCast', { r: 0.008, pos: [xF1 - 0.009, YA, z0] }),
    box(0.018, 0.115, 0.115, 'blackCast', { r: 0.008, pos: [xF0 + 0.009, YA, z0] }),
    // Corps : bloc central, bride d'aspiration annulaire vers le haut.
    box(0.09, 0.075, 0.085, 'blackCast', { r: 0.008, pos: [x0, YA - 0.005, z0] }),
    lathe([[PUMP.r - 0.004, YA + 0.02], [PUMP.r + 0.016, YA + 0.03], [PUMP.r + 0.016, -0.009], [PUMP.r - 0.004, -0.009]], 'blackCast', { seg: 24, pos: [x0, 0, z0] }),
    // Tube de pompage (−) et porte-clapet.
    at(cyl(0.022, 0.03, 'blackCast', { axis: 'x', seg: 16 }), [x0 + 0.06, YA, z0]),
  ];
  const barrel = at(cyl(RC, xF1 - xF0 - 0.036, 'grey', { axis: 'x', seg: 28 }), [(xF0 + xF1) / 2, YA, z0]);
  const steel = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    steel.push(S.rod([xF0 - 0.006, YA + sy * 0.047, z0 + sz * 0.047], [xF1 + 0.002, YA + sy * 0.047, z0 + sz * 0.047], 0.0032, 'zinc', 6));
    steel.push(T.hex(0.011, 0.006, 'zinc', { axis: '-x', pos: [xF0 - 0.003, YA + sy * 0.047, z0 + sz * 0.047] }));
  }
  steel.push(at(cyl(0.012, 0.055, 'chrome', { axis: 'x', seg: 14 }), [x0 + 0.1, YA, z0]));
  steel.push(T.hex(0.032, 0.03, 'zinc', { axis: 'x', pos: [x0 + 0.142, YA, z0] }));
  steel.push(at(cyl(0.009, 0.012, 'zinc', { axis: 'x', seg: 10 }), [x0 + 0.163, YA, z0]));
  // Tirant central (traverse le réservoir) et écrou de pompe sur le dessus.
  steel.push(at(cyl(0.008, 0.315 + 0.009, 'zinc', { seg: 10 }), [x0, (0.308 - 0.009) / 2 + 0.0, z0]));
  steel.push(T.hex(0.024, 0.012, 'zinc', { pos: [x0, 0.308 + 0.006, z0] }));
  P('2', group(merged(castParts, 'blackCast'), barrel, merged(steel, 'zinc')), [0, -0.12, 0]);

  // 3 — bouchon à six-pans creux noyé, flanc +Z du corps
  const plug = lathe([[0.004, 0.0005], [0.0085, 0.0005], [0.0088, -0.011], [0, -0.011], [0, -0.003], [0.004, -0.003]], 'darkSteel', { seg: 6 });
  P('3', T.toward(plug, [0, 0, 1], [x0, YA - 0.005, z0 + 0.0425]), [0, -0.12, 0.06]);

  // 4 — coudes 90° 1/4 NPT × -06 (×3)
  const elbow = (dir, pos, rot) => {
    const e = T.toward(fitting(0.014, 0.034, 'zinc', { elbow: true }), dir, pos);
    if (rot) e.rotateY(rot);
    return e;
  };
  P('4', elbow([-1, 0, 0], [xF0 - 0.001, YA + 0.02, z0]), [-0.08, -0.12, 0]);
  P('4', elbow([1, 0, 0], [x0 + 0.169, YA, z0]), [0.08, -0.12, 0]);
  P('4', elbow([0, -1, 0], [x0 - 0.02, YA - 0.0425, z0 + 0.02]), [0, -0.2, 0]);

  return { view: { dir: [-0.9, 0.5, 1.2] } };
}
