// P240 — Lance de lavage CP18323 rév. 0 « WASHWAND ASSEMBLY » (page 240),
// repère 6 de P238. Pistolet à gâchette (3) : corps moulé à poignée inclinée,
// pontet, gâchette, raccord d'entrée 1/4 po tournant sous la poignée,
// mamelon de sortie à l'avant ; lance (2) : poignée isolante octogonale à
// viroles, tube d'acier zingué cintré au bout, porte-buse à coupelle de
// protection et douille à raccord rapide ; buse à raccord rapide 1/4 po (1).
// Repère : origine au centre de la face de sortie du pistolet (raccord de la
// lance) ; +X le long de la lance vers la buse, Y vers le haut (poignée du
// pistolet vers -Y), Z latéral. Encombrement ≈ 1.10 (X, de -0.21 à 0.89)
// × 0.19 (Y) × 0.05 (Z) m.
// Cotes estimées d'après les proportions de la page 240 (lance ≈ 36 po, grip
// ≈ 10 po, pistolet ≈ 8 po de long).

const IN = 0.0254;

export default function P240(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Prisme d'épaisseur t selon Z d'un contour [x, y] avec trous polygonaux.
  const slab = (pts, t, mat, holes = []) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t - 0.004, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelOffset: -0.0015, bevelSegments: 2, curveSegments: 8 });
    geo.translate(0, 0, -(t - 0.004) / 2);
    S.creaseNormals(geo, 0.7);
    return S.merged([new THREE.Mesh(geo)], mat);
  };

  // ---------------------------------------------------------------- 3 — pistolet
  // Silhouette (plan XY) : canon horizontal, nez avant, poignée inclinée vers
  // l'arrière, pontet bouclant sous la gâchette ; ouverture de la main.
  const body = [
    [-0.003, 0.022], [-0.003, -0.022], [-0.03, -0.03], [-0.045, -0.06], [-0.07, -0.115], [-0.09, -0.128],
    [-0.15, -0.128], [-0.172, -0.118], [-0.205, -0.07], [-0.205, -0.05], [-0.19, -0.04], [-0.18, -0.02],
    [-0.195, 0.012], [-0.19, 0.03], [-0.17, 0.038], [-0.03, 0.038], [-0.01, 0.032],
  ];
  const hand = [
    [-0.06, -0.035], [-0.078, -0.1], [-0.095, -0.112], [-0.142, -0.112], [-0.155, -0.1], [-0.172, -0.06], [-0.165, -0.035],
  ].reverse();
  const gun = [slab(body, 0.032, 'plastic', [hand])];
  // Gâchette (dans l'ouverture), pivot en haut.
  const trig = slab([[-0.07, -0.03], [-0.085, -0.03], [-0.105, -0.09], [-0.097, -0.098], [-0.088, -0.09]], 0.018, 'safety');
  // Raccord d'entrée tournant 1/4 po sous la poignée (dans l'axe de la poignée).
  const inlet = S.group(
    S.cyl(0.008, 0.02, 'brass', { seg: 16, pos: [0, -0.01, 0] }),
    S.nut(0.019, 0.012, 'brass', { pos: [0, -0.026, 0] }),
  );
  inlet.position.set(-0.19, -0.1, 0);
  inlet.rotation.z = -0.5;
  // Mamelon de sortie (six-pans + filet) à l'avant du canon.
  const outlet = S.group(
    S.nut(0.019, 0.01, 'brass', { axis: 'x', pos: [-0.004, 0, 0] }),
  );
  P('3', S.group(...gun, trig, inlet, outlet), [-0.12, 0, 0]);

  // ---------------------------------------------------------------- 2 — lance
  const ra = 0.019; // demi-largeur de la poignée octogonale
  const lance = [];
  // Embout fileté et écrou côté pistolet.
  lance.push(S.lathe([[0, 0], [0.006, 0], [0.006, 0.012], [0, 0.012]], 'brass', { axis: 'x', seg: 14 }));
  lance.push(S.nut(0.019, 0.01, 'brass', { axis: 'x', pos: [0.017, 0, 0] }));
  // Poignée isolante octogonale (révolution à 8 pans) entre deux viroles.
  const grip = S.lathe([[0, 0.025], [ra * 0.85, 0.025], [ra, 0.035], [ra, 0.27], [ra * 0.85, 0.28], [0, 0.28]], 'plastic', { axis: 'x', seg: 8 });
  const ferr = [
    S.lathe([[0, 0.02], [0.011, 0.02], [0.013, 0.023], [0.013, 0.03], [0, 0.03]], 'zinc', { axis: 'x', seg: 20 }),
    S.lathe([[0, 0.278], [0.013, 0.278], [0.013, 0.29], [0.008, 0.295], [0, 0.295]], 'zinc', { axis: 'x', seg: 20 }),
  ];
  // Tube cintré : droit jusqu'à x = 0.74 puis courbe de 20° vers le bas.
  const R = 0.25, a1 = (20 * Math.PI) / 180;
  const pts = [[0.29, 0, 0], [0.74, 0, 0]];
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * a1;
    pts.push([0.74 + Math.sin(a) * R, -(R - Math.cos(a) * R), 0]);
  }
  const end = new THREE.Vector3(...pts[pts.length - 1]);
  const dir = new THREE.Vector3(Math.cos(a1), -Math.sin(a1), 0);
  pts.push(end.clone().addScaledVector(dir, 0.04).toArray());
  const tube = S.tube(pts, 0.0055, 'zinc', { seg: 40, ends: 'none', radial: 14, sharp: false });
  // Porte-buse : virole, coupelle de protection, douille de raccord rapide.
  const tip = end.clone().addScaledVector(dir, 0.04);
  const holder = S.group(
    S.lathe([[0.0055, 0], [0.011, 0], [0.011, 0.022], [0.009, 0.026], [0.0055, 0.026], [0.0055, 0]], 'brass', { seg: 20 }),
    S.lathe([[0.008, 0.026], [0.012, 0.026], [0.022, 0.05], [0.02, 0.052], [0.008, 0.03], [0.008, 0.026]], 'plastic', { seg: 28 }),
    S.lathe([[0.004, 0.03], [0.0075, 0.03], [0.0075, 0.046], [0.004, 0.046], [0.004, 0.03]], 'steel', { seg: 18 }),
  );
  holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  holder.position.copy(tip);
  P('2', S.group(S.merged([...lance], 'brass'), grip, S.merged(ferr, 'zinc'), tube, holder), [0, 0, 0]);

  // ---------------------------------------------------------------- 1 — buse à raccord rapide 1/4 po
  const nz = S.group(
    S.lathe([[0, 0], [0.0039, 0], [0.0039, 0.012], [0.0034, 0.013], [0.0034, 0.015], [0, 0.015]], 'steel', { seg: 16 }),
    S.nut(0.011, 0.006, 'steel', { pos: [0, 0.018, 0] }),
    S.lathe([[0.0008, 0.021], [0.004, 0.021], [0.0035, 0.025], [0.0008, 0.025], [0.0008, 0.021]], 'green', { seg: 16 }),
  );
  nz.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  nz.position.copy(tip.clone().addScaledVector(dir, 0.034));
  P('1', nz, dir.clone().multiplyScalar(0.08).toArray());
  void IN;
  return { view: { dir: [0.3, 0.55, 1.2] } };
}
