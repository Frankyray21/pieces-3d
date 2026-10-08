// Repère machine du DU311 s/n 10703, commun au porteur (P208), au pont arrière
// (P416), à la glissière (P164) et aux options (P012, P020) : origine au sol
// sous l'axe de l'articulation centrale, X vers l'avant (avance), Y vers le
// haut, +Z à droite (côté cabine).
// Le manuel ne cote pas la machine : longueurs et largeurs sont mesurées sur
// les vues de dessus et de dessous (pages 12 et 212) à l'échelle des pneus
// 12.00-20 (Ø 1,12 m), les hauteurs estimées sur la vue générale (page 10).

export const WHEEL = { r: 0.56, w: 0.31, z: 0.86 };
export const AXLE = { front: 1.65, rear: -1.63, y: WHEEL.r };

export const M = {
  frameZ: 0.48, // flancs des châssis avant et arrière
  frameBot: 0.42,
  frameTop: 1.0,
  fender: 1.2, // dessus des garde-boue avant
  nose: 2.2, // nez du châssis avant (appui de la glissière)
  cab: { x0: -1.05, x1: -0.15, z0: -0.38, z1: 0.98, top: 2.22 },
  engine: { x0: -2.75, x1: -1.1, top: 1.95 },
  rear: -4.4, // arrière du pont arrière
  jackX: -2.5, // vérins de stabilisation arrière
};

// Roue 12.00-20 : pneu à crampons, jante, voile et goujons ; axe selon Z.
export function wheel(S, { side = 1 } = {}) {
  const { cyl, torus, box, ring, at, group, merged } = S;
  const { r: R, w: W } = WHEEL;
  const n = 22;
  const lugs = [];
  for (let i = 0; i < n; i++) {
    for (const s of [1, -1]) {
      const a = ((i + (s > 0 ? 0 : 0.5)) / n) * Math.PI * 2;
      lugs.push(at(box(0.075, 0.04, W * 0.4, 'rubber'), [Math.cos(a) * (R - 0.02), Math.sin(a) * (R - 0.02), s * W * 0.24], [0, 0, a + Math.PI / 2]));
    }
  }
  return group(
    at(cyl(R - 0.035, W * 0.8, 'rubber', { axis: 'z', seg: 56 }), [0, 0, 0]),
    at(torus(R - 0.17, 0.14, 'rubber', { axis: 'z' }), [0, 0, 0]),
    merged(lugs, 'rubber'),
    at(cyl(0.29, W * 0.84, 'lightGrey', { axis: 'z', seg: 40 }), [0, 0, 0]),
    at(ring(0.3, 0.27, 0.02, 'lightGrey', { axis: 'z', seg: 40 }), [0, 0, side * W * 0.43]),
    at(cyl(0.22, 0.03, 'lightGrey', { axis: 'z', seg: 36 }), [0, 0, side * W * 0.36]),
    at(cyl(0.11, 0.08, 'darkSteel', { axis: 'z', seg: 28 }), [0, 0, side * W * 0.42]),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return at(cyl(0.012, 0.05, 'steel', { axis: 'z', seg: 6 }), [Math.cos(a) * 0.15, Math.sin(a) * 0.15, side * W * 0.39]);
    }),
  );
}

// Étiquettes de simulation (sans effet sur le rendu du site) : corps mobile
// auquel appartient un objet, vérin entre deux corps, flexible dont chaque point
// suit un corps. Les noms de corps sont ceux de src/sim/du311-std.js ; un objet
// sans étiquette suit son parent (le châssis arrière par défaut).
export function body(name, obj) {
  obj.userData.body = name;
  return obj;
}

export function ram(id, a, b, obj) {
  obj.userData.ram = { id, a, b };
  return obj;
}

export function flex(S, points, bodies, r, material, opts = {}) {
  const m = S.tube(points, r, material, opts);
  m.userData.flex = { points, bodies, r, material, opts };
  return m;
}
