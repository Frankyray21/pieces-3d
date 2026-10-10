// Page d'accueil du catalogue (table des matières, P002) : présentoir des
// outils souterrains (un exemplaire de chaque famille, taille NU), rangés comme
// sur un panneau mural. Chaque outil est le sous-assemblage de sa page, avec
// son nom en légende ; un clic (ou un toucher) ouvre la page de l'outil, il n'y
// a pas de vue éclatée sur cette page. Les carottiers complets s'ouvrent
// depuis la liste.

const ROWS = [
  ['P079', 'P080'], // overshots Arrow 3S et Excore II
  ['P074', 'P077'], // têtes DiscovOre et Excore
  ['P081', 'P105'], // tête OWL L-Latch, tête du carottier 48TT
  ['P097', 'P098', 'P099', 'P100', 'P102'], // émerillons et presse-étoupes
  ['P094', 'P094-NH', 'P094-LI', 'P096'], // outils de chargement, extracteur, raccords
];

// Écran en hauteur (téléphone) : un outil long par rangée, les petits par
// deux ou trois, pour que chaque outil reste assez grand à toucher.
const ROWS_PORTRAIT = [
  ['P079'], ['P080'], ['P074'], ['P077'], ['P081', 'P105'],
  ['P097', 'P098', 'P099'], ['P100', 'P102'], ['P094', 'P094-NH'], ['P094-LI', 'P096'],
];

// Légendes courtes (les outils exposés sont tous de taille NU).
const NAMES = {
  P079: 'Overshot Arrow 3S',
  P080: 'Overshot Excore II',
  P074: 'Tête DiscovOre',
  P077: 'Tête Excore',
  P081: 'Tête OWL L\u2011Latch', // trait d'union insécable : pas de coupure à « L- »
  P105: 'Tête 48TT',
  P097: 'Émerillon AWJ',
  P098: 'Émerillon Pro 18+',
  P099: 'Émerillon Pro 25+',
  P100: 'Presse-étoupe',
  P102: 'Presse-étoupe RPT',
  P094: 'Outil de chargement B',
  'P094-NH': 'Outil de chargement NH',
  'P094-LI': 'Extracteur de bague',
  P096: 'Raccords de verrouillage',
};

/** Repère de la table des matières : numéro de page (« 94n » pour P094-NH). */
export const tocRef = (id) => {
  const [p, suffix] = id.split('-');
  return String(parseInt(p.slice(1), 10)) + (suffix ? { NH: 'n', LI: 'i' }[suffix] : '');
};

export function P002(api, { portrait = false } = {}) {
  const { THREE } = api;
  const gapX = 0.14;
  // Écart entre rangées : place pour la légende sous chaque outil.
  const gapY = portrait ? 0.12 : 0.1;
  // Un outil pas encore modélisé est simplement omis du présentoir.
  const tryBuild = (id) => { try { return api.sub(id); } catch { return null; } };
  const rows = (portrait ? ROWS_PORTRAIT : ROWS).map((ids) => ids.map((id) => {
    const g = tryBuild(id);
    if (!g) return null;
    g.updateMatrixWorld(true);
    return { id, g, box: new THREE.Box3().setFromObject(g) };
  }).filter(Boolean)).filter((r) => r.length);
  let y = 0;
  rows.forEach((row) => {
    const h = Math.max(...row.map((it) => it.box.max.y - it.box.min.y));
    const rowW = row.reduce((w, it) => w + (it.box.max.x - it.box.min.x), 0) + gapX * (row.length - 1);
    let x = -rowW / 2; // rangées centrées
    y -= h / 2;
    row.forEach((it) => {
      const c = it.box.getCenter(new THREE.Vector3());
      it.g.position.set(x - it.box.min.x, y - c.y, -c.z);
      x += it.box.max.x - it.box.min.x + gapX;
      api.part(tocRef(it.id), it.g, null, { caption: NAMES[it.id] });
    });
    y -= h / 2 + gapY;
  });
  return { view: { dir: [0.05, 0.22, 1], home: true } };
}
P002.responsive = true;
