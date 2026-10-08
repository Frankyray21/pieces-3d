// Page d'accueil du catalogue (table des matières, P002) : présentoir d'un
// exemplaire de chaque famille d'outils, rangés comme sur un panneau mural.
// Chaque outil est le sous-assemblage de sa page ; son repère est le numéro de
// page de la table des matières (double-clic : vue éclatée de l'outil).

const ROWS = [
  ['P030'],
  ['P032'],
  ['P019', 'P022'],
  ['P025', 'P027'],
  ['P074', 'P079'],
  ['P056', 'P058', 'P097', 'P098', 'P099'],
  ['P100', 'P102', 'P061', 'P094-LI'],
  ['P060', 'P105', 'P094', 'P094-NH'],
];
// Les carottiers complets (3 à 4 m) et la trousse à rouleaux (2,5 m) écraseraient
// le présentoir : on les ouvre depuis la liste.

/** Repère de la table des matières : numéro de page (« 94n » pour P094-NH). */
export const tocRef = (id) => {
  const [p, suffix] = id.split('-');
  return String(parseInt(p.slice(1), 10)) + (suffix ? { NH: 'n', LI: 'i' }[suffix] : '');
};

export function P002(api) {
  const { THREE } = api;
  const gapX = 0.14, gapY = 0.09;
  // Un outil pas encore modélisé est simplement omis du présentoir.
  const tryBuild = (id) => { try { return api.sub(id); } catch { return null; } };
  const rows = ROWS.map((ids) => ids.map((id) => {
    const g = tryBuild(id);
    if (!g) return null;
    g.updateMatrixWorld(true);
    return { id, g, box: new THREE.Box3().setFromObject(g) };
  }).filter(Boolean)).filter((r) => r.length);
  const width = Math.max(...rows.map((r) => r.reduce((w, it) => w + (it.box.max.x - it.box.min.x), 0) + gapX * (r.length - 1)));
  let y = 0;
  rows.forEach((row, i) => {
    const h = Math.max(...row.map((it) => it.box.max.y - it.box.min.y));
    const rowW = row.reduce((w, it) => w + (it.box.max.x - it.box.min.x), 0) + gapX * (row.length - 1);
    // Rangées longues étalées sur toute la largeur, les autres centrées.
    const spare = row.length > 1 ? (width - rowW) / (row.length - 1) : 0;
    let x = row.length > 1 ? -width / 2 : -rowW / 2;
    y -= h / 2;
    row.forEach((it, j) => {
      const c = it.box.getCenter(new THREE.Vector3());
      it.g.position.set(x - it.box.min.x, y - c.y, -c.z);
      x += it.box.max.x - it.box.min.x + gapX + spare;
      // Vue éclatée du présentoir : les outils s'écartent un peu.
      api.part(tocRef(it.id), it.g, [(j - (row.length - 1) / 2) * 0.12, -i * 0.05, 0]);
    });
    y -= h / 2 + gapY;
  });
  return { view: { dir: [0.05, 0.22, 1] } };
}
