// P472 — Manomètres du panneau arrière CX034805 « ASSY, GAUGE PANEL, REAR,
// DU311 » (page 472), repère 16 de P430. Cinq instruments sur le panneau
// soudé du capot (P422 rep. 8, « GAUGE PANEL WELDMENT », dessiné par P422) :
// thermomètre déporté 100-400 °F Ø 4 po (4, « COMPRESSOR DISCHARGE TEMP »,
// en haut au milieu) dont le capillaire armé descend vers le collecteur de
// refoulement (bulbe dans la réduction de P476 rep. 1) ; manomètres Ø 2 1/2
// po à fixation arrière 0-160 psi (2, « MINE AIR FILTER IN » à gauche et
// « MINE AIR FILTER OUT » à droite) et 0-100 psi (1, « COMPRESSOR OIL
// PRESSURE », en bas à gauche) ; manomètre 0-600 psi à collerette avant (3,
// « DRILL AIR PRESSURE », en bas à droite) ; au dos des quatre manomètres,
// adaptateurs droits FNPT 1/4 → JIC -06 (5).
// Repère : origine au centre de la face avant du panneau (plan z = 0, cadrans
// vers +Z), X vers la droite de la vue de face, Y vers le haut. Option
// { capillary: [[x, y, z], …] } : tracé du capillaire dans ce repère (donné
// par P430 jusqu'au collecteur) ; par défaut, boucle de réserve au dos.
// Encombrement ≈ 0.30 (X) × 0.26 (Y) × 0.12 (Z) m sans le capillaire. Cotes :
// cadrans Ø 2 1/2 et 4 po, filetage 1/4 NPT ; disposition de la page 472.
import { ACC, I, ENG, hexProf, pipeR } from './_rearb.js';

export const GP = {
  // Centres des cadrans [x, y] et rayon du boîtier.
  temp: [0, 0.05, I(2.0)],
  fin: [-0.105, 0.0, I(1.25)], fout: [0.105, 0.0, I(1.25)],
  oil: [-0.065, -0.085, I(1.25)], drill: [0.065, -0.085, I(1.25)],
  t: 0.003, // épaisseur supposée du panneau
};

export default function P472(api, opts = {}) {
  const { S } = api;
  const { box, cyl, lathe, tube, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const NZ = [0, 0, -1], X = [1, 0, 0];
  const E4 = ENG(4);

  // Instrument à boîtier inox : cadran blanc, graduations, aiguille, lunette sertie ;
  // corps derrière le panneau (z < 0), lunette (ou collerette, flange) devant.
  const dial = (r, { flange = false, back = true } = {}) => {
    const d = r * 1.1; // profondeur du boîtier
    const g = group();
    // Lunette avant et boîtier arrière.
    g.add(merged([
      lathe([[0, -d], [r * 0.92, -d], [r * 0.98, -d + r * 0.08], [r * 0.98, -GP.t], [0, -GP.t]], 'chrome', { axis: 'z', seg: 32 }),
      lathe([[r * 0.86, 0], [r * (flange ? 1.32 : 1.06), 0], [r * (flange ? 1.32 : 1.06), 0.003], [r * 1.02, r * 0.14], [r * 0.9, r * 0.16], [r * 0.86, r * 0.12]], 'chrome', { axis: 'z', seg: 32 }),
    ], 'chrome'));
    if (flange) for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (k * 2 * Math.PI) / 3;
      g.add(at(S.bolt(0.004, 0.012, 'zinc', { axis: 'z' }), [Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2, 0.004]));
    }
    g.add(at(cyl(r * 0.86, 0.002, 'white', { axis: 'z', seg: 32 }), [0, 0, r * 0.06]));
    const ticks = [];
    for (let i = 0; i <= 20; i++) {
      const a = (-135 + i * 13.5) * (Math.PI / 180), major = i % 4 === 0, l = r * (major ? 0.16 : 0.08), rr = r * 0.74 - l / 2;
      ticks.push(box(r * (major ? 0.035 : 0.016), l, 0.0006, 'black', { pos: [Math.sin(a) * rr, Math.cos(a) * rr, r * 0.06 + 0.0013], rot: [0, 0, -a] }));
    }
    ticks.push(cyl(r * 0.07, 0.002, 'black', { axis: 'z', seg: 14, pos: [0, 0, r * 0.06 + 0.002] }));
    g.add(merged(ticks, 'black'));
    g.add(box(r * 0.04, r * 0.68, 0.0006, 'red', { pos: [Math.sin(-0.9) * r * 0.24, Math.cos(-0.9) * r * 0.24, r * 0.06 + 0.0025], rot: [0, 0, 0.9] }));
    g.add(at(cyl(r * 0.86, 0.0015, 'glass', { axis: 'z', seg: 32 }), [0, 0, r * 0.12]));
    // Raccord arrière : six-pans et queue mâle 1/4 NPT selon −Z.
    if (back) g.add(merged([
      at(lathe(hexProf(I(0.5625), 0, 0.009), 'brass', { seg: 6 }), [0, 0, -d], [-Math.PI / 2, 0, 0]),
      at(lathe([[0, 0], [pipeR(4) * 0.96, 0], [pipeR(4), 0.013], [0, 0.013]], 'brass', { seg: 14 }), [0, 0, -d - 0.009], [-Math.PI / 2, 0, 0]),
    ], 'brass'));
    g.userData.back = -d - 0.009 - 0.013; // bout de la queue
    return g;
  };
  // Adaptateur 5 vissé sur la queue d'un manomètre : face femelle à 1 filet du bout.
  const adapter = (x, y, back) => P('5', O(femJic5(), [x, y, back + E4], NZ, X), [0, 0, -0.08]);
  const femJic5 = () => {
    const rn = pipeR(4), af = I(0.75), L = I(0.55);
    return merged([
      lathe([[rn * 0.98, 0], ...hexProf(af, 0, L).slice(1, -1), [rn * 0.98, L], [rn * 0.98, 0]], 'zinc', { seg: 6 }),
      lathe([[I(9 / 32) * 0.82, L], [I(9 / 32), L + 0.003], [I(9 / 32), L + 0.009], [I(9 / 32) * 0.6, L + 0.012], [0, L + 0.012]], 'zinc', { seg: 14 }),
    ], 'zinc');
  };

  // ---------------------------------------------------------------- 4 — thermomètre déporté (capillaire armé)
  {
    const [x, y, r] = GP.temp;
    const g = dial(r, { back: false });
    const d = r * 1.1;
    // Sortie du capillaire au dos : presse-étoupe, capillaire armé inox, bulbe fileté au bout.
    const start = [x, y - r * 0.5, -d];
    const pts = opts.capillary ? [start, ...opts.capillary] : [start, [x, y - r * 0.5, -d - 0.05], [x + 0.06, -0.12, -0.1], [x - 0.06, -0.14, -0.09], [x + 0.03, -0.1, -0.08]];
    const cap = tube(pts, 0.0022, 'steel', { seg: Math.max(48, pts.length * 24), radial: 8, tension: 0.4 });
    const gl = merged([lathe(hexProf(0.012, 0, 0.007), 'brass', { seg: 6, pos: [0, 0, 0] })], 'brass');
    const glG = at(group(gl), start, [-Math.PI / 2, 0, 0]);
    const end = pts[pts.length - 1];
    const bulb = merged([
      lathe(hexProf(I(0.875), 0, 0.01), 'brass', { seg: 6 }),
      lathe([[0, 0.01], [0.006, 0.01], [0.006, 0.03], [0, 0.03]], 'brass', { seg: 12 }),
    ], 'brass');
    // Bulbe : écrou union posé au bout du tracé (axe vertical).
    const bl = at(group(bulb), end, [Math.PI, 0, 0]);
    P('4', group(at(g, [x, y, 0]), cap, glG, bl), [0, 0.06, 0.12]);
  }
  // ---------------------------------------------------------------- 2, 1, 3 — manomètres ; 5 — adaptateurs
  for (const [k, ref] of [['fin', '2'], ['fout', '2'], ['oil', '1'], ['drill', '3']]) {
    const [x, y, r] = GP[k];
    const g = dial(r, { flange: ref === '3' });
    P(ref, at(g, [x, y, 0]), [x * 0.4, y * 0.4, 0.12]);
    adapter(x, y, g.userData.back);
  }

  return { view: { dir: [0.4, 0.3, 1.0] } };
}
