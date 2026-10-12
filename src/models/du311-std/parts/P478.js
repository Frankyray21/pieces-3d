// P478 — Purge automatique CX034811 « ASSY, AUTO DRAIN VALVE, DU311 »
// (page 478), repère 19 de P430 : vidange périodique du bol du séparateur
// d'eau d'admission (P482 rep. 3). Vanne à boisseau 2 voies à commande
// pneumatique (2, CP003066) : corps inox à passage vertical 3/8 NPT, petit
// vérin rotatif en alu et son électrovanne de pilotage à bobine ; trois
// adaptateurs 1/4 NPT → JIC -06 (7) sur les orifices de pilotage. En haut
// et en bas du corps : mamelon six-pans 3/8 po (9), manchon 3/8 NPT acier
// (10) serré dans un collier 3/4 po (1) contre le support, adaptateur droit
// 3/8 NPT → JIC -06 (8). Filtre d'air de pilotage (3, CP18037-001, élément
// CP18037-004) à côté, plus bas : coude 90° 3/8 NPT → JIC -06 (6) coiffé du
// coude 45° à écrou tournant (4) sur l'entrée, mamelon (9), manchon (10) et
// collier (1), adaptateur (8) et té tournant (5) sur la sortie.
// Repère : origine au centre du corps de la vanne 2 ; Y vers le haut (axe
// du passage), X vers le filtre (−X) / l'actionneur (−X aussi, en arrière
// du corps), +Z côté colliers et support (dos de la vue de la page 478).
// Filtre centré en ADV.filter.
// Encombrement ≈ 0.26 (X) × 0.30 (Y) × 0.12 (Z) m. Cotes : raccords 3/8 et
// 1/4 NPT, collier 3/4 po (liste) ; appareils aux proportions de la page 478.
import { ACC, I, ENG, hexNipple, hexProf, pipeR, stauff, add, cross3 } from './_rearb.js';

const E6 = ENG(6);
export const ADV = { filter: [-0.15, -0.07, 0], port: 0.028 };

export default function P478(api) {
  const { S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1], NZ = [0, 0, -1];
  const r6 = pipeR(6);
  const hn = hexNipple(S, 6).userData;
  const cplR = r6 * 1.28, cplL = ACC.NPT[6][1] * 2 * 0.0254 + I(0.25);

  // Chaîne mamelon 9 → manchon 10 (+ collier 1) → adaptateur 8 depuis la face d'un orifice p, direction d.
  const chain = (p, d, e) => {
    const up = d[1] !== 0 ? X : Y;
    const c9 = add(p, d, hn.ya - E6);
    P('9', O(hexNipple(S, 6), c9, d.map((v) => -v), up), e);
    const c10 = add(c9, d, hn.yb - E6);
    P('10', O(ACC.coupling(S, 6), c10, d, up), add(e, d, 0.03));
    const mid = add(c10, d, cplL / 2);
    P('1', O(stauff(S, cplR), mid, NZ, cross3(NZ, d)), add(add(e, d, 0.03), Z, 0.06));
    const p8 = add(c10, d, cplL - E6 + ACC.NPT[6][1] * 0.0254);
    const a8 = ACC.straight(S, { a: 6, b: 6 });
    P('8', O(a8, add(c10, d, cplL), d, up), add(e, d, 0.07));
    void p8;
    return add(add(c10, d, cplL), d, a8.userData.tip);
  };

  // ---------------------------------------------------------------- 2 — vanne pneumatique 2 voies
  {
    const P0 = ADV.port;
    const hp = (y0, y1) => lathe([[r6 * 0.98, y0], ...hexProf(I(0.875), y0, y1).slice(1, -1), [r6 * 0.98, y1], [r6 * 0.98, y0]], 'steel', { seg: 6 });
    const body = merged([
      box(0.034, 0.034, 0.034, 'steel', { r: 0.004 }),
      hp(0.017, P0), hp(-P0, -0.017),
      cyl(0.008, 0.016, 'steel', { axis: 'x', seg: 14, pos: [-0.024, 0, 0] }),
    ], 'steel');
    // Vérin rotatif : bloc alu à deux flasques, platine de liaison, électrovanne et bobine dessus.
    const act = merged([
      box(0.075, 0.044, 0.042, 'castAlu', { r: 0.004, pos: [-0.072, 0, 0] }),
      box(0.006, 0.05, 0.048, 'castAlu', { r: 0.002, pos: [-0.112, 0, 0] }),
      box(0.006, 0.05, 0.048, 'castAlu', { r: 0.002, pos: [-0.032, 0, 0] }),
      box(0.05, 0.026, 0.03, 'castAlu', { r: 0.003, pos: [-0.072, 0.035, -0.004] }),
    ], 'castAlu');
    const coilB = merged([
      box(0.028, 0.03, 0.03, 'plastic', { r: 0.003, pos: [-0.092, 0.064, -0.004] }),
      box(0.02, 0.022, 0.01, 'plastic', { r: 0.002, pos: [-0.092, 0.064, -0.024] }),
    ], 'plastic');
    const steel = merged([
      S.nut(0.012, 0.005, 'zinc', { pos: [-0.092, 0.081, -0.004] }),
      ...[[-0.105, 0.016], [-0.105, -0.016], [-0.039, 0.016], [-0.039, -0.016]].map(([x, y]) => at(S.bolt(0.004, 0.012, 'zinc', { axis: '-z' }), [x, y, -0.024])),
    ], 'zinc');
    P('2', group(body, act, coilB, steel), [0, 0, -0.06]);
    // 7 — adaptateurs 1/4 NPT → JIC -06 sur la face −Z de l'électrovanne de pilotage.
    for (const x of [-0.085, -0.069, -0.053]) P('7', O(ACC.straight(S, { a: 4, b: 6 }), [x, 0.035, -0.019], NZ, Y), [-0.02, 0.02, -0.1]);
    chain([0, P0, 0], Y, [0, 0.06, 0]);
    chain([0, -P0, 0], NY, [0, -0.06, 0]);
  }

  // ---------------------------------------------------------------- 3 — filtre d'air de pilotage
  {
    const [fx, fy, fz] = ADV.filter;
    const head = merged([
      box(0.05, 0.045, 0.048, 'castAlu', { r: 0.004, pos: [fx, fy, fz] }),
      cyl(0.012, 0.056, 'castAlu', { axis: 'x', seg: 16, pos: [fx, fy, fz] }),
      lathe([[0, 0], [0.028, 0], [0.028, 0.008], [0, 0.008]], 'castAlu', { seg: 32, pos: [fx, fy - 0.0305, fz] }),
    ], 'castAlu');
    const bowl = merged([
      lathe([[0, -0.11], [0.008, -0.11], [0.02, -0.1], [0.023, -0.085], [0.023, -0.03], [0.026, -0.026], [0.026, -0.0225], [0, -0.0225]], 'castAlu', { seg: 28, pos: [fx, fy, fz] }),
      // Voyant de niveau sur la face −Z.
      box(0.008, 0.045, 0.004, 'castAlu', { pos: [fx, fy - 0.065, fz - 0.0225] }),
    ], 'castAlu');
    const glass = box(0.005, 0.04, 0.002, 'glass', { pos: [fx, fy - 0.065, fz - 0.0248] });
    const drain = merged([cyl(0.004, 0.012, 'brass', { seg: 10, pos: [fx, fy - 0.116, fz] }), box(0.018, 0.004, 0.004, 'brass', { pos: [fx, fy - 0.122, fz] })], 'brass');
    P('3', group(head, bowl, glass, drain), [-0.06, -0.08, 0]);
    // Entrée (−X) : coude 6 vers le haut, coude 45° tournant 4 sur son cône.
    const pin = [fx - 0.028, fy, fz];
    const e6 = ACC.elbow(S, { a: 6, b: 6 });
    P('6', O(e6, pin, NX, Y), [-0.12, -0.04, 0]);
    const t6 = [pin[0] - e6.userData.out[1], pin[1] + e6.userData.out[0], pin[2]];
    {
      const T = I(9 / 16), af = I(11 / 16), h = T * 0.75, rb = T * 0.5;
      const nut = lathe([[T * 0.5, -T * 0.35], ...hexProf(af, -T * 0.35, -T * 0.35 + h).slice(1, -1), [T * 0.3, -T * 0.35 + h], [T * 0.5, -T * 0.35]], 'zinc', { seg: 6 });
      const yc = h + T * 0.1;
      const leg = at(group(lathe([[0, 0], [rb, 0], [rb, T * 0.8], [T * 0.41, T * 0.8], [T * 0.41, T * 1.5], [T * 0.3, T * 1.6], [0, T * 1.6]], 'zinc', { seg: 14 })), [0, yc, 0], [0, 0, -Math.PI / 4]);
      const el45 = merged([nut, S.cyl(T * 0.32, yc + T * 0.35, 'zinc', { seg: 14, pos: [0, (yc - T * 0.35) / 2, 0] }), at(S.ball(rb * 1.05, 'zinc'), [0, yc, 0]), leg], 'zinc');
      P('4', O(el45, t6, Y, NX), [-0.14, 0.02, 0]);
    }
    // Sortie (+X) : chaîne 9-10-1-8 puis té tournant 5.
    const tip = chain([fx + 0.028, fy, fz], X, [-0.02, -0.08, 0]);
    P('5', O(ACC.swivelTee(S, 6), tip, X, Y), [0.04, -0.08, 0]);
  }

  return { view: { dir: [0.6, 0.5, -1.0] } };
}
