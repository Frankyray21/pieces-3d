// P342 — Indicateur de niveau bas de graisse CX012502 rév. 2 (page 342) :
// « LOW LEVEL LUBRICANT INDICATOR », repère 12 de P328. Détecteur à palette
// (1, CP000981) vissé par le dessus dans la cuve de graisse : boîtier cylindrique
// à couvercle en plastique noir (repère d'orientation en relief), presse-étoupe
// latéral, câble 4 conducteurs (rouge, vert, noir, blanc) gainé, connecteur
// étanche à 4 broches et verrou ; sous le boîtier, col six-pans 1 1/16 po,
// queue filetée 3/4 NPT, tige et palette souple qui plonge dans la graisse.
// Les schémas de câblage de la page (ancien / nouveau style) ne sont pas des
// pièces.
// Repère : origine sur l'axe de la queue filetée, au plan d'appui du six-pans
// (face du bossage de la cuve), Y vers le haut (boîtier), palette vers −Y ;
// câble sortant vers +X. Encombrement 0.30 (X, jusqu'au connecteur) × 0.17
// (Y, de −0.085 à 0.09) × 0.065 (Z) m.
// Cotes d'après les proportions du dessin, échelle prise sur la queue 3/4 NPT
// (Ø 26,7 mm).

const IN = 0.0254;

export default function P342(api) {
  const { THREE, S } = api;
  const { lathe, box, cyl, cable, merged, group, at } = S;

  // Six-pans 1 1/16 po (hauteur 9 mm) et queue filetée conique 3/4 NPT.
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0155, 0.009, 6));
  hex.position.y = 0.0045;
  hex.rotation.y = Math.PI / 6;
  const shank = lathe([
    [0, -0.026], [0.0122, -0.026], ...S.thread(0.0133, -0.024, -0.002, { r1: 0.0127, pitch: 0.0018 }), [0.0134, 0], [0, 0],
  ], 'zinc', { seg: 12 });
  // Col au-dessus du six-pans, puis boîtier Ø 64 avec couvercle.
  const neck = lathe([[0, 0.009], [0.012, 0.009], [0.012, 0.024], [0, 0.024]], 'zinc', { seg: 12 });
  const steel = merged([hex, shank, neck], 'zinc');
  const body = lathe([
    [0, 0.024], [0.026, 0.024], [0.029, 0.028], [0.029, 0.058], [0, 0.058],
  ], 'castAlu', { seg: 24 });
  const lid = lathe([
    [0, 0.058], [0.032, 0.058], [0.032, 0.074], [0.03, 0.078], [0.026, 0.08], [0, 0.08],
  ], 'plastic', { seg: 24 });
  const rib = box(0.03, 0.004, 0.006, 'plastic', { pos: [0.006, 0.082, 0] });
  // Tige et palette souple (deux lames ondulées) sous la queue.
  const stem = cyl(0.0045, 0.03, 'steel', { seg: 10, pos: [0, -0.04, 0] });
  const paddle = new THREE.Shape();
  const pts = [[-0.009, 0], [0.009, 0], [0.011, -0.012], [0.008, -0.024], [0.01, -0.034], [0.006, -0.042], [-0.006, -0.042], [-0.01, -0.034], [-0.008, -0.024], [-0.011, -0.012]];
  pts.forEach(([x, y], i) => (i ? paddle.lineTo(x, y) : paddle.moveTo(x, y)));
  paddle.closePath();
  const pg = new THREE.ExtrudeGeometry(paddle, { depth: 0.003, bevelEnabled: false });
  pg.translate(0, -0.054, -0.0015);
  const blade = new THREE.Mesh(pg);
  const blades = merged([blade, at(new THREE.Mesh(pg.clone()), [0, 0, 0], [0, Math.PI / 2, 0])], 'rubber');
  // Presse-étoupe latéral (+X), câble gainé et connecteur 4 broches.
  const gland = group(
    at(cyl(0.011, 0.012, 'black', { axis: 'x', seg: 6 }), [0.034, 0.045, 0]),
    at(cyl(0.008, 0.012, 'black', { axis: 'x', r2: 0.0055, seg: 12 }), [0.046, 0.045, 0]),
  );
  const lead = cable([[0.05, 0.045, 0], [0.12, 0.043, 0.004], [0.2, 0.04, 0], [0.24, 0.041, 0]], 0.0035, { seg: 24 });
  const plug = group(
    at(cyl(0.0085, 0.022, 'plastic', { axis: 'x', r2: 0.0045, seg: 12 }), [0.252, 0.041, 0]),
    at(box(0.036, 0.022, 0.024, 'plastic', { r: 0.003 }), [0.281, 0.041, 0]),
    at(box(0.012, 0.004, 0.012, 'plastic'), [0.287, 0.054, 0]),
  );
  api.part('1', group(steel, body, lid, rib, stem, blades, gland, lead, plug), [0, 0.12, 0]);

  return { view: { dir: [0.6, 0.45, 1] } };
}
