// P356 — Pompe électrique de remplissage d'huile 24 V CP17316 rév. 0 (page
// 356), repère 1 de P354. La liste ne détaille que l'élément filtrant (1,
// CP17316-018) logé dans le pot de filtre vertical ; le groupe (moteur 24 V à
// courant continu, bride carrée, corps de pompe à engrenages en fonte
// d'aluminium, pot de filtre à bouchon six-pans, anse de manutention, bossages
// d'aspiration et de refoulement fléchés) est dessiné sans repère pour situer
// l'élément, d'après la vue isométrique de la page.
// Repère : origine au centre de la face de la bride carrée côté moteur (face
// d'appui du support P354 repère 3), Y vers le haut, +Z le long de l'axe du
// moteur vers son fond (bornes), corps de pompe et pot de filtre vers −Z,
// X horizontal. Encombrement ≈ 0.12 (X) × 0.16 (Y, de −0.07 à +0.09) × 0.33
// (Z, de −0.10 à +0.23) m. Cotes estimées (bride 95 mm, moteur Ø 80 mm).
const MM = 0.001;
export const P356_FLANGE = 95 * MM; // bride carrée
export const P356_SCREW = 38 * MM; // vis de bride à ±38 mm (en X et en Y)

export default function P356(api) {
  const { S } = api;
  const { lathe, box, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- groupe (sans repère)
  // Moteur : centrage, carcasse, flasque arrière bombé, bornes, presse-étoupe.
  const motor = merged([
    lathe([[0, 0], [44 * MM, 0], [44 * MM, 8 * MM], [40 * MM, 9 * MM], [40 * MM, 190 * MM], [37 * MM, 198 * MM], [28 * MM, 202 * MM], [0, 202 * MM]], 'black', { axis: 'z', seg: 12 }),
    lathe([[0, 0], [8 * MM, 0], [8 * MM, 10 * MM], [0, 10 * MM]], 'black', { axis: 'x', seg: 10, pos: [38 * MM, 0, 125 * MM] }),
  ], 'black');
  const terms = merged([
    ...[[-12, 34], [12, 34]].map(([x, y]) => lathe([[0, 0], [3 * MM, 0], [3 * MM, 12 * MM], [2 * MM, 13 * MM], [0, 13 * MM]], 'brass', { axis: 'z', seg: 8, pos: [x * MM, y * MM * 0.4, 200 * MM] })),
    ...[[-12, 34], [12, 34]].map(([x, y]) => lathe([[4.6 * MM, 0], [4.6 * MM, 3 * MM], [2 * MM, 3 * MM]], 'brass', { axis: 'z', seg: 6, pos: [x * MM, y * MM * 0.4, 204 * MM] })),
  ], 'brass');
  // Bride carrée, corps de pompe, pot de filtre, bossages fléchés.
  const cast = merged([
    box(P356_FLANGE, P356_FLANGE, 10 * MM, 'castAlu', { pos: [0, 0, -5 * MM] }),
    box(72 * MM, 52 * MM, 50 * MM, 'castAlu', { pos: [0, -38 * MM, -45 * MM] }),
    lathe([[0, -30 * MM], [38 * MM, -30 * MM], [38 * MM, 72 * MM], [40 * MM, 74 * MM], [40 * MM, 84 * MM], [31 * MM, 84 * MM], [31 * MM, 78 * MM], [0, 78 * MM]], 'castAlu', { seg: 12, pos: [0, 0, -52 * MM] }),
    ...[-1, 1].map((s) => lathe([[0, 0], [14 * MM, 0], [14 * MM, 26 * MM], [0, 26 * MM]], 'castAlu', { axis: s > 0 ? 'x' : '-x', seg: 10, pos: [s * 34 * MM, -52 * MM, -60 * MM] })),
  ], 'castAlu');
  const ports = merged([-1, 1].map((s) => lathe([[8 * MM, 0.0003], [0, 0.0003]], 'blackOxide', { axis: s > 0 ? 'x' : '-x', seg: 10, pos: [s * 60 * MM, -52 * MM, -60 * MM] })), 'blackOxide');
  // Trous des vis de bride (vis remplacées par celles de P354).
  const holes = merged([-1, 1].flatMap((sx) => [-1, 1].map((sy) => lathe([[3.5 * MM, 0.0003], [0, 0.0003]], 'blackOxide', { axis: 'z', seg: 8, pos: [sx * P356_SCREW, sy * P356_SCREW, 0] }))), 'blackOxide');
  // Bouchon six-pans du pot de filtre.
  const cap = merged([lathe([[0, 84 * MM], [12 * MM, 84 * MM], [12 * MM, 96 * MM], [10 * MM, 98 * MM], [0, 98 * MM]], 'zinc', { seg: 6, pos: [0, 0, -52 * MM] })], 'zinc');
  // Anse de manutention (fer plat) le long du flanc +X, du haut de la bride à l'arrière.
  const handle = merged([
    box(10 * MM, 8 * MM, 125 * MM, 'black', { pos: [52 * MM, 50 * MM, -55 * MM] }),
    box(10 * MM, 30 * MM, 8 * MM, 'black', { pos: [52 * MM, 37 * MM, -4 * MM] }),
    box(10 * MM, 40 * MM, 8 * MM, 'black', { pos: [52 * MM, 32 * MM, -114 * MM] }),
  ], 'black');
  const body = group(motor, terms, cast, ports, holes, cap, handle);

  // ---------------------------------------------------------------- 1 — élément filtrant
  // Média plissé (cylindre crème), flasques d'acier, logé dans le pot.
  const el = group(
    lathe([[24 * MM, 2 * MM], [24 * MM, 68 * MM]], 'cream', { seg: 14 }),
    merged([
      lathe([[0, 0], [26 * MM, 0], [26 * MM, 3 * MM], [0, 3 * MM]], 'zinc', { seg: 14 }),
      lathe([[9 * MM, 67 * MM], [26 * MM, 67 * MM], [26 * MM, 70 * MM], [9 * MM, 70 * MM]], 'zinc', { seg: 14 }),
    ], 'zinc'),
    lathe([[9 * MM, 69.7 * MM], [0, 69.7 * MM]], 'blackOxide', { seg: 10 }),
  );
  el.position.set(0, 6 * MM, -52 * MM);
  P('1', el, [0, 0.16, 0]).parent.add(body);

  return { view: { dir: [1, 0.7, 0.9] } };
}
