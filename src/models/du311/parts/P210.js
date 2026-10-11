// P210 — Accouplement élastique à griffes CX016943 rév. 0 « COUPLING ASSEMBLY »
// (page 210), repère 6 de P208 (groupe de pompage 60 HP). Accouplement de
// type cloche : moyeu côté moteur (1) alésé 2 3/8 po avec rainure de clavette
// 5/8 po (bout d'arbre NEMA 365TC), cloche à quatre griffes intérieures ;
// étoile élastique (3) à quatre ergots extérieurs logés entre ces griffes et
// croisillon central ; moyeu côté pompe (2) à cannelures SAE 12/24, 14 dents
// (arbre SAE C 1 1/4 po), quatre griffes arrière qui s'engagent entre les bras
// du croisillon, serrage par fente radiale et vis tangentielle, deux gorges
// sur le fût.
// Repère : origine sur l'axe, au plan de la collerette de l'étoile (jonction
// des deux moyeux) ; +X le long de l'arbre vers la pompe (moyeu 2), Y vers le
// haut (fente de serrage du moyeu 2 en haut). Encombrement Ø 0.128 × 0.170 m
// (X de -0.085 à +0.085).
// Cotes : alésage et clavette d'après la liste et la norme NEMA 365TC ;
// diamètres et longueurs estimés d'après les proportions de la vue éclatée
// (cloche ≈ 2,1 × l'alésage).

const IN = 0.0254;

export default function P210(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Prisme de section (plan YZ) extrudé selon X de x0 à x1.
  const prism = (shape, x0, x1, mat) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 12 });
    S.creaseNormals(geo);
    const m = new THREE.Mesh(geo);
    // Shape (u, v) dans le plan XY local → (z = -u, y = v) ; extrusion Z → X.
    m.rotation.y = Math.PI / 2;
    m.position.x = x0;
    return S.merged([m], mat);
  };
  // Secteur annulaire r0..r1 de a0 à a1 (angles dans le plan YZ, depuis +Z vers +Y).
  const sectorShape = (r0, r1, a0, a1, n = 8) => {
    const s = new THREE.Shape();
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      i ? s.lineTo(r1 * Math.cos(a), r1 * Math.sin(a)) : s.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
    }
    for (let i = n; i >= 0; i--) {
      const a = a0 + ((a1 - a0) * i) / n;
      s.lineTo(r0 * Math.cos(a), r0 * Math.sin(a));
    }
    s.closePath();
    return s;
  };
  const circlePath = (r, n = 40, hole = true) => {
    const p = new THREE.Path();
    p.absarc(0, 0, r, 0, Math.PI * 2, hole);
    return p;
  };
  const Q = Math.PI / 2;
  const jawW = 0.62; // largeur angulaire d'une griffe / d'un ergot (rad)

  // ---------------------------------------------------------------- 1 — moyeu moteur
  // Fût arrière Ø 4.1 po, cloche Ø 5.04 po à fond plat, quatre griffes intérieures.
  const rB = (2.375 * IN) / 2; // alésage 2 3/8
  const kw = 0.625 * IN; // clavette 5/8
  const R1 = 0.064, Rc = 0.052; // cloche, fond de cloche
  // Cloche et fût (révolution), alésage de 2 3/8 po à rainure de clavette
  // dans une bague prismatique (vraie rainure de 5/8 × 5/16 po en haut).
  const hub1 = [
    S.lathe([
      [0.034, -0.085], [0.05, -0.085], [0.052, -0.083], [0.052, -0.058], [R1 - 0.002, -0.056], [R1, -0.054],
      [R1, 0.003], [R1 - 0.002, 0.005], [Rc + 0.001, 0.005], [Rc, 0.004], [Rc, -0.026], [0.034, -0.026], [0.034, -0.085],
    ], 'castIron', { axis: 'x', seg: 48 }),
  ];
  const bore = new THREE.Shape();
  bore.absarc(0, 0, 0.0345, 0, Math.PI * 2, false);
  const bp = new THREE.Path();
  const ak = Math.asin(kw / 2 / rB);
  bp.moveTo(rB * Math.cos(Q + ak), rB * Math.sin(Q + ak));
  for (let i = 1; i <= 40; i++) {
    const a = Q + ak + ((2 * Math.PI - 2 * ak) * i) / 40;
    bp.lineTo(rB * Math.cos(a), rB * Math.sin(a));
  }
  bp.lineTo(kw / 2, rB + kw / 2);
  bp.lineTo(-kw / 2, rB + kw / 2);
  bp.closePath();
  bore.holes.push(bp);
  hub1.push(prism(bore, -0.085, -0.026, 'castIron'));
  // Griffes : secteurs de r = 0.036 à la paroi, du fond de cloche à 3 mm sous la face.
  for (let k = 0; k < 4; k++) {
    const a = Q / 2 + k * Q;
    hub1.push(prism(sectorShape(0.0345, Rc + 0.0005, a - jawW / 2, a + jawW / 2), -0.026, 0.002, 'castIron'));
  }
  // Vis de pression sur la clavette (fût arrière, en haut), tête creuse affleurante.
  const set1 = S.lathe([[0, 0], [0.0045, 0], [0.0045, 0.004], [0.0025, 0.004], [0.0025, 0.002], [0, 0.002]], 'blackOxide', { seg: 12, pos: [-0.07, 0.0485, 0] });
  P('1', S.group(S.merged(hub1, 'castIron'), set1), [-0.09, 0, 0]);

  // ---------------------------------------------------------------- 3 — étoile élastique
  const spider = [];
  // Collerette annulaire entre les deux moyeux.
  spider.push(S.lathe([[0.024, 0.0], [0.056, 0.0], [0.057, 0.001], [0.057, 0.006], [0.056, 0.007], [0.024, 0.007], [0.024, 0.0]], 'yellow', { axis: 'x', seg: 40 }));
  // Ergots extérieurs : dans la cloche, entre les griffes (à 0, 90, 180, 270°).
  for (let k = 0; k < 4; k++) {
    const a = k * Q;
    spider.push(prism(sectorShape(0.037, 0.051, a - 0.5, a + 0.5), -0.024, 0.0005, 'yellow'));
  }
  // Croisillon : quatre bras vers le moyeu 2 (à 45°), noyau central percé.
  const cross = new THREE.Shape();
  const arm = 0.0085, rc = 0.044;
  // Contour : bras successifs reliés par le noyau.
  const ordered = [];
  for (let k = 0; k < 4; k++) {
    const a = Q / 2 + k * Q;
    const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
    ordered.push([c * 0.017 - px * arm, s * 0.017 - py * arm]);
    ordered.push([c * rc - px * arm, s * rc - py * arm]);
    ordered.push([c * (rc + 0.001) - px * arm * 0.5, s * (rc + 0.001) - py * arm * 0.5]);
    ordered.push([c * (rc + 0.001) + px * arm * 0.5, s * (rc + 0.001) + py * arm * 0.5]);
    ordered.push([c * rc + px * arm, s * rc + py * arm]);
    ordered.push([c * 0.017 + px * arm, s * 0.017 + py * arm]);
  }
  cross.moveTo(...ordered[0]);
  ordered.slice(1).forEach((p) => cross.lineTo(...p));
  cross.closePath();
  cross.holes.push(circlePath(0.011));
  spider.push(prism(cross, 0.007, 0.03, 'yellow'));
  P('3', S.merged(spider, 'yellow'), [0, 0, 0]);

  // ---------------------------------------------------------------- 2 — moyeu pompe
  const R2 = 0.058;
  const hub2 = [];
  // Fût : face arrière à x = 0.03 (bout des bras), deux gorges ; fente de
  // serrage radiale de 2,4 mm en haut sur la moitié avant (vrai jour).
  const ri2 = 0.0172;
  const slotW = 0.0024 / R2;
  const seg = (x0, x1, r, slit) => S.slotted(r, ri2, x0, x1, slit ? [{ a: -Math.PI / 2, w: slotW * (R2 / r), y0: x0 - 0.001, y1: x1 + 0.001 }] : [], 'steel', { axis: 'x', seg: 48 });
  hub2.push(seg(0.03, 0.05, R2, false), seg(0.05, 0.0535, R2 - 0.0025, false), seg(0.0535, 0.057, R2, true),
    seg(0.057, 0.0605, R2 - 0.0025, true), seg(0.0605, 0.085, R2, true));
  // Griffes arrière (à 0, 90, 180, 270°) entre les bras du croisillon, jusqu'à la collerette.
  for (let k = 0; k < 4; k++) {
    const a = k * Q;
    hub2.push(prism(sectorShape(0.018, 0.046, a - 0.42, a + 0.42), 0.0075, 0.0305, 'steel'));
  }
  // Cannelures intérieures 14 dents (bague dentée dans l'alésage).
  const spl = new THREE.Shape();
  spl.absarc(0, 0, 0.0172, 0, Math.PI * 2, false);
  const sp = new THREE.Path();
  const n = 14, rr = 0.0146, rt = 0.0162;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? rt : rr;
    for (const da of [-0.06, 0.06]) {
      const aa = a + da;
      i === 0 && da < 0 ? sp.moveTo(r * Math.cos(aa), r * Math.sin(aa)) : sp.lineTo(r * Math.cos(aa), r * Math.sin(aa));
    }
  }
  sp.closePath();
  spl.holes.push(sp);
  hub2.push(prism(spl, 0.03, 0.085, 'steel'));
  // Vis de serrage tangentielle CHC à travers la fente (tête côté +Z).
  const screw = S.at(S.group(
    S.cyl(0.0055, 0.006, 'blackOxide', { axis: 'z', seg: 14, pos: [0, 0, 0.04] }),
    S.cyl(0.0032, 0.074, 'blackOxide', { axis: 'z', seg: 10, pos: [0, 0, 0] }),
  ), [0.073, 0.04, 0]);
  P('2', S.group(S.merged(hub2, 'steel'), S.merged([screw], 'blackOxide')), [0.09, 0, 0]);

  return { view: { dir: [0.9, 0.55, 1.2] } };
}
