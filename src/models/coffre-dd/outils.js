// Outils à main de la liste de matériel du coffre 629 (marteau, masses) et
// crochet du côté du coffre. Aucun dessin : formes et dimensions génériques,
// estimées. Chaque outil a son origine au centre de sa tête, manche vers −Y,
// tête le long de Z.

const IN = 0.0254;

/** Manche de bois ovale, du dessous de la tête vers le bas, avec un léger renflement au bout. */
function handle(S, len, r, y0) {
  const m = S.lathe([[0, -len], [r * 1.05, -len], [r * 1.12, -len + 0.02], [r * 0.9, -len * 0.55], [r * 0.82, -0.02], [r * 0.82, 0], [0, 0]], 'woodLight', { seg: 20 });
  m.scale.set(0.78, 1, 1); // section ovale, grand axe le long de la tête
  return S.at(S.group(m), [0, y0, 0]);
}

/** Masse : tête rectangulaire à bouts chanfreinés de côté a et de longueur len, manche de longueur hl. */
export function masse(S, { a, len, hl, hr }) {
  const head = S.group(
    S.box(a, a, len * 0.72, 'darkSteel', { r: a * 0.12 }),
    S.box(a * 0.9, a * 0.9, len, 'darkSteel', { r: a * 0.2 }),
  );
  return S.group(head, handle(S, hl + a, hr, a / 2 + 0.004));
}

/** Marteau de mécanicien à panne ronde : table d'un côté, boule de l'autre. */
export function marteau(S) {
  const r = 0.55 * IN, len = 4.25 * IN;
  const head = S.lathe([
    [0, -len / 2], [r * 0.9, -len / 2], [r, -len / 2 + 0.004], [r, -len * 0.2], [r * 0.72, -len * 0.08], [r * 0.72, len * 0.1],
    [r * 0.6, len * 0.22], [r * 0.82, len * 0.36], [r * 0.7, len * 0.46], [r * 0.35, len / 2], [0, len / 2],
  ], 'darkSteel', { axis: 'z', seg: 24 });
  return S.group(head, handle(S, 12 * IN, 0.6 * IN, r * 0.72 + 0.003));
}

/**
 * Crochet double soudé au côté : plaque de 3 × 4 po et deux tiges de 1/2 po qui
 * sortent de 3 1/2 po, bouts relevés. Repère : dos de la plaque en x = 0, tiges
 * vers −X, origine entre les deux tiges.
 */
export function crochet(S) {
  const r = 0.25 * IN, gap = 2.2 * IN, out = 3.5 * IN, up = 1 * IN, t = 0.25 * IN;
  const g = S.group(S.box(t, 3 * IN, 4 * IN, 'red', { pos: [-t / 2, -0.5 * IN, 0] }));
  for (const s of [-1, 1]) {
    g.add(S.tube([[0, 0, (s * gap) / 2], [-out + 0.012, 0, (s * gap) / 2], [-out, 0.012, (s * gap) / 2], [-out, up, (s * gap) / 2]], r, 'red', { sharp: true, seg: 40, radial: 10 }));
  }
  return g;
}
