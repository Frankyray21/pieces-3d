// P348 — Chaîne de sécurité de la marche de translation CX030538 rév. 0
// (page 348), repère 24 de P328 : chaîne grade 30 de 3/16 po zinguée (3) dont
// la partie centrale est gainée d'une gaine thermorétractable de 1 po (2),
// mousqueton à virole (1) accroché au dernier maillon. Elle ferme l'accès de
// la plateforme de conduite (marche de translation, repère 16 de P328) :
// maillon d'ancrage côté poteau fixe, mousqueton accroché à l'autre poteau.
// Repère : origine au centre du maillon d'ancrage (anneau soudé du poteau
// fixe), chaîne tendue selon +X avec une flèche de 4 cm vers −Y, mousqueton à
// x ≈ 0.80 m. Encombrement 0.86 (X) × 0.07 (Y) × 0.02 (Z) m.
// Maillons 3/16 po : fil Ø 4,8 mm, pas 21 mm, largeur ext. 16 mm. Sous la gaine
// (Ø 25 mm rétractée sur la chaîne), les maillons sont cachés : seuls les
// maillons apparents des deux bouts sont dessinés (comme au dessin).

const IN = 0.0254;
const WIRE = (3 / 16) * IN / 2; // rayon du fil
const PITCH = 0.021; // pas intérieur
const WIDTH = 0.016; // largeur extérieure
const L = 0.8; // longueur hors tout (jusqu'au mousqueton)
const SAG = 0.04; // flèche
const SLEEVE = [0.1, 0.68]; // gaine : de x à x

export default function P348(api) {
  const { THREE, S } = api;
  const { tube, merged, group, at } = S;
  const yAt = (x) => -SAG * 4 * (x / L) * (1 - x / L);

  // Maillon : ovale (deux droites + deux demi-cercles) dans le plan XY, centré.
  const linkGeo = () => {
    const r = WIDTH / 2 - WIRE, h = PITCH / 2 + WIRE - r;
    const pts = [];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI; pts.push(new THREE.Vector3(h + Math.cos(a) * r, Math.sin(a) * r, 0)); }
    for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 + (i / 6) * Math.PI; pts.push(new THREE.Vector3(-h + Math.cos(a) * r, Math.sin(a) * r, 0)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 12, WIRE, 4, true);
  };
  const proto = linkGeo();
  const links = [];
  const step = PITCH; // entraxe des maillons enchaînés (longueur intérieure)
  for (let i = 0, x = 0; x <= L - 0.06; i++, x += step) {
    if (x > SLEEVE[0] + 0.012 && x < SLEEVE[1] - 0.012) continue;
    const m = new THREE.Mesh(proto);
    const slope = Math.atan2(yAt(x + 0.01) - yAt(x - 0.01), 0.02);
    m.position.set(x, yAt(x), 0);
    // Maillons alternés à plat et sur chant.
    m.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, slope);
    links.push(m);
  }
  api.part('3', merged(links, 'zinc'), [0, -0.05, 0]);

  // 2 — gaine thermorétractable 1 po rétractée : tube noir suivant la chaîne,
  // légères ondulations au droit des maillons, bouts arrondis.
  const pts = [];
  for (let k = 0; k <= 24; k++) {
    const x = SLEEVE[0] + ((SLEEVE[1] - SLEEVE[0]) * k) / 24;
    pts.push([x, yAt(x), 0]);
  }
  const sleeve = tube(pts, 0.0105, 'rubber', { seg: 20, ends: 'none', radial: 8 });
  const caps = [SLEEVE[0], SLEEVE[1]].map((x) => S.lathe([[0, -0.004], [0.006, -0.004], [0.0105, 0], [0, 0]], 'rubber', { axis: x < 0.3 ? '-x' : 'x', seg: 12, pos: [x, yAt(x), 0] }));
  api.part('2', group(sleeve, ...caps), [0, 0.06, 0]);

  // 1 — mousqueton à virole (acier zingué), plan XY, accroché au dernier maillon.
  const xc = L - 0.035;
  const bodyPts = [[-0.03, 0.006], [-0.034, 0], [-0.03, -0.007], [0.022, -0.012], [0.034, -0.006], [0.036, 0.004], [0.028, 0.012], [-0.022, 0.009]];
  const hook = tube(bodyPts.map(([x, y]) => [x, y, 0]), 0.0032, 'zinc', { closed: true, seg: 40, radial: 8 });
  const sleeveNut = at(S.cyl(0.0055, 0.016, 'zinc', { axis: 'x', seg: 10 }), [0.0, 0.0105, 0], [0, 0, -0.06]);
  api.part('1', at(group(hook, sleeveNut), [xc, yAt(L - 0.06) + 0.002, 0]), [0.06, 0, 0]);

  return { view: { dir: [0.2, 0.35, 1] } };
}
