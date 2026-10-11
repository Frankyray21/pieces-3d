// P180 — Support du laser d'alignement CX015937 rév. 2 (page 180) : deux
// disques de support (1) Ø 140 × 1/2 po, un sur la face extérieure de chaque
// colonne du châssis de glissière, chacun tenu par trois vis H 3/8 × 1 po (3)
// à rondelles plates (4) passées dans trois boutonnières en arc (réglage en
// rotation du faisceau) ; au centre, un moyeu tourné porte la tôle de 1/4 po
// où se serre le laser d'alignement (2, P182) ; au dos, trois plots
// d'appui et un pion de centrage dans la colonne.
// Repère : celui de la glissière P170 (origine au centre de l'actionneur
// rotatif, X vers l'avant de la machine, Y vers le haut, +Z côté enrouleur) :
// disques posés sur les faces extérieures des colonnes (z = ±0.67), centrés
// à x = -0.17, y = 0 ; faisceaux dirigés vers l'extérieur (±Z).
// Encombrement ≈ 0.14 (X) × 0.14 (Y) × 1.98 (Z, des embases des lasers) m.

import { SLIDE170 } from './P170.js';
import { hexScrew, washerD, pose } from './P172.js';

const IN = 0.0254;

export const LASER180 = { x: -0.17, y: 0, z: SLIDE170.colZ + 0.05 };

export default function P180(api) {
  const { THREE, S } = api;
  const { lathe, extrude, merged, creaseNormals, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => pose(THREE, obj, p, dir);
  const T = 0.5 * IN, R = 0.07, RS = 0.05; // épaisseur, rayon, rayon des boutonnières
  const { x: X0, y: Y0, z: Z0 } = LASER180;

  // Disque (repère local : dos à y = 0, face vers +Y) : trois boutonnières
  // en arc de 40°, trois trous de pion, alésage central du moyeu.
  const disc = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, R, 0, Math.PI * 2, false);
    for (let i = 0; i < 3; i++) {
      const a0 = Math.PI / 2 + (i * 2 * Math.PI) / 3 - 0.35, a1 = a0 + 0.7, w = 0.0058;
      const p = new THREE.Path();
      p.absarc(0, 0, RS + w, a0, a1, false);
      p.absarc(RS * Math.cos(a1), RS * Math.sin(a1), w, a1, a1 + Math.PI, false);
      p.absarc(0, 0, RS - w, a1, a0, true);
      p.absarc(RS * Math.cos(a0), RS * Math.sin(a0), w, a0 + Math.PI, a0 + 2 * Math.PI, false);
      shape.holes.push(p);
      const h = new THREE.Path();
      const b = a0 + 0.7 + Math.PI / 3 - 0.35;
      h.absarc(0.035 * Math.cos(b), 0.035 * Math.sin(b), 0.004, 0, Math.PI * 2, true);
      shape.holes.push(h);
    }
    const c = new THREE.Path();
    c.absarc(0, 0, 0.012, 0, Math.PI * 2, true);
    shape.holes.push(c);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 8 });
    geo.rotateX(-Math.PI / 2);
    const plate = new THREE.Mesh(creaseNormals(geo));
    // moyeu Ø 45 de 20 mm, tôle 1/4 po du laser en bout ; plots et pion au dos
    const hub = lathe([[0.012, T], [0.0225, T], [0.0225, T + 0.016], [0.02, T + 0.02], [0.0065, T + 0.02], [0.0065, T], [0.012, T]], 'grey', { seg: 28 });
    const studs = [];
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + Math.PI / 3 + (i * 2 * Math.PI) / 3;
      studs.push(at(lathe([[0, -0.012], [0.006, -0.012], [0.006, 0], [0, 0]], 'grey', { seg: 12 }), [0.06 * Math.cos(a), 0, 0.06 * Math.sin(a)]));
    }
    studs.push(lathe([[0, -0.01], [0.009, -0.01], [0.009, 0], [0, 0]], 'grey', { seg: 16 }));
    return merged([plate, hub, ...studs], 'grey');
  };

  for (const s of [-1, 1]) {
    const n = [0, 0, s];
    const c = [X0, Y0, s * Z0];
    P('1', put(disc(), c, n), [0, 0, s * 0.18]);
    // 2 — laser : faisceau (+X de P182) vers l'extérieur, câble vers l'intérieur
    // par l'alésage du moyeu (il traverse aussi la colonne).
    const face = s * (Z0 + T + 0.02);
    const laser = api.sub('P182');
    const g = group(laser);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, 0, s), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-s, 0, 0)));
    g.position.set(X0, Y0, face);
    P('2', g, [0, 0, s * 0.42]);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
      // dans l'axe des boutonnières (le disque côté -Z est vu en miroir selon Y)
      const p = [X0 + RS * Math.cos(a), Y0 + s * RS * Math.sin(a), s * (Z0 + T)];
      P('4', put(washerD(S, 0.375 * IN, 'zinc', { od: 0.81 * IN, t: 0.065 * IN }), p, n), [0, 0, s * 0.28]);
      P('3', put(hexScrew(S, 0.375 * IN, 1.0 * IN), [p[0], p[1], p[2] + s * 0.065 * IN], n), [0, 0, s * 0.34]);
    }
  }
  return { view: { dir: [0.5, 0.45, 1.2] } };
}
