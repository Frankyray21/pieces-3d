import * as THREE from 'three';

// Vue générale (F04) : assemble les sous-assemblages à leur position sur la
// machine. Repère machine : X vers l'avant (mât), Y vers le haut, +Z à droite.

export function F04(api) {
  const { box, cyl, ring, tube, at, group, torus } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Chenilles droite et gauche (la gauche est le miroir de la droite)
  const rh = api.sub('F05');
  rh.position.set(-0.15, 0, 0.68);
  P('F05', rh, [0, -0.2, 1.15]);
  const lh = api.sub('F05');
  lh.position.set(-0.15, 0, -0.68);
  lh.scale.z = -1;
  P('F05', lh, [0, -0.2, -1.15]);

  P('5', api.sub('F08'), [0, 0, 0]);
  P('4', at(api.sub('F09'), [-0.21, 0.975, 0]), [0, 0.95, 0]);
  P('3', at(api.sub('F11'), [-1.78, 0.95, 0]), [-0.75, 1.05, 0]);
  P('F13', at(api.sub('F13'), [-0.21, 0.975, 0]), [0, 2.3, 0]);

  // Mât : axe local X → vertical, face tête de rotation (local +Y) → avant (+X)
  const mast = api.sub('F14');
  mast.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1),
  ));
  mast.position.set(2.05, 0.42, 0);
  P('F14', mast, [1.5, 0.35, 0]);

  // 2 — Panier arrière
  const bx0 = -2.86, bx1 = -2.27, y0 = 0.42, y1 = 1.5, bz = 0.66, r = 0.022;
  const posts = [[bx0, bz], [bx0, -bz], [bx1, bz], [bx1, -bz]];
  P('2', group(
    at(box(bx1 - bx0, 0.025, bz * 2, 'lightGrey'), [(bx0 + bx1) / 2, y0, 0]),
    ...posts.map(([x, z]) => tube([[x, y0, z], [x, y1, z]], r, 'red', { sharp: true, seg: 2 })),
    tube([[bx1, y1, bz], [bx0, y1, bz], [bx0, y1, -bz], [bx1, y1, -bz]], r, 'red', { sharp: true, seg: 6 }),
    tube([[bx1, 0.95, bz], [bx0, 0.95, bz], [bx0, 0.95, -bz], [bx1, 0.95, -bz]], r * 0.8, 'red', { sharp: true, seg: 6 }),
    at(box(bx1 - bx0 - 0.05, 0.5, 0.01, 'lightGrey'), [(bx0 + bx1) / 2, 0.7, bz]),
    at(box(bx1 - bx0 - 0.05, 0.5, 0.01, 'lightGrey'), [(bx0 + bx1) / 2, 0.7, -bz]),
    at(box(0.01, 0.5, 0.6, 'lightGrey'), [bx0, 0.7, -0.3]),
    tube([[bx0 - 0.01, y0 + 0.05, 0.02], [bx0 - 0.01, 1.42, 0.02], [bx0 - 0.01, 1.42, 0.6], [bx0 - 0.01, y0 + 0.05, 0.6], [bx0 - 0.01, y0 + 0.05, 0.02]], r * 0.8, 'red', { sharp: true, seg: 8 }),
    at(box(0.01, 0.5, 0.52, 'lightGrey'), [bx0 - 0.012, 0.75, 0.31]),
    at(box(0.6, 0.08, 0.08, 'red'), [-2.3 + 0.0, 0.36, 0.35]),
    at(box(0.6, 0.08, 0.08, 'red'), [-2.3 + 0.0, 0.36, -0.35]),
  ), [-1.5, 0.45, 0]);

  // 1 — Attelage à crochet 5 tonnes
  P('1', group(
    at(box(0.03, 0.18, 0.22, 'black'), [0, 0, 0]),
    at(box(0.12, 0.08, 0.1, 'black'), [-0.07, 0, 0]),
    at(torus(0.05, 0.016, 'black', { axis: 'z' }), [-0.15, 0.02, 0]),
    at(box(0.04, 0.03, 0.08, 'black'), [-0.17, 0.08, 0]),
  ).translateX(bx0 - 0.03).translateY(0.42), [-2.0, 0.1, 0]);

  // 6 — Support de console (banc) ; 7 — Console IP67 (voir note sur les bulles inversées)
  const sx = 0.45, sz = 1.95, sh = 0.85;
  const legs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  P('6', group(
    at(box(0.42, 0.03, 0.42, 'red'), [0, sh, 0]),
    ...legs.map(([a, b]) => tube([[a * 0.19, sh, b * 0.19], [a * 0.24, 0, b * 0.24]], 0.016, 'red', { sharp: true, seg: 2 })),
    ...[0.3, 0.6].map((y) => {
      const k = 0.24 - (y / sh) * 0.05;
      return tube([[k, y, k], [k, y, -k], [-k, y, -k], [-k, y, k], [k, y, k]], 0.01, 'red', { sharp: true, seg: 8 });
    }),
  ).translateX(sx).translateZ(sz), [0.3, 0, 1.25]);
  const knob = (x) => group(
    at(cyl(0.035, 0.025, 'black'), [x, 0.012, 0.02]),
    at(cyl(0.012, 0.06, 'black'), [x, 0.05, 0.02]),
    at(cyl(0.025, 0.05, 'black'), [x, 0.1, 0.02]),
  );
  P('7', group(
    at(box(0.52, 0.11, 0.34, 'grey', { r: 0.012 }), [0, 0.055, 0]),
    at(box(0.5, 0.004, 0.32, 'lightGrey'), [0, 0.112, 0]),
    at(box(0.15, 0.012, 0.1, 'black'), [-0.02, 0.118, -0.09]),
    at(box(0.13, 0.004, 0.08, 'blue'), [-0.02, 0.125, -0.09]),
    at(box(0.16, 0.01, 0.07, 'black'), [-0.02, 0.118, 0.04]),
    at(box(0.12, 0.01, 0.06, 'black'), [0.0, 0.118, 0.12]),
    at(cyl(0.025, 0.03, 'red'), [0.17, 0.13, -0.11]),
    at(cyl(0.022, 0.03, 'safety'), [0.17, 0.115, -0.11]),
    ...[-0.19, 0.19].map((x) => knob(x).translateY(0.11).translateZ(0.06)),
  ).translateX(sx).translateY(sh + 0.015).translateZ(sz), [0.3, 0.45, 1.25]);

  void ring;
  // La console posée à côté élargit la boîte : le plan par défaut passe par l'axe de la machine.
  return { view: { dir: [1, 0.55, 1.15], section: { axis: 'z', pos: 0.29 } } };
}
