// P074 — Clapet de charge CX036361 rév. 0 (page 74) : « LOAD CHECK VALVE
// ASSY », repère 10 de l'avance P028. Clapet double CP47573 (1, bloc alu
// 2 1/2 × 1 1/2 × 2 po, cuvette gravée VALVE 1 / VALVE 2 / CYL 1 / CYL 2),
// posé à plat sur le flanc −X du mât près du pied, vissé par deux vis H
// 5/16-18 × 2 (4) à rondelle Nord-Lock (5) aux coins opposés ; coudes 90°
// 1/4 NPT / JIC-06 (3) sur les orifices VALVE (face arrière), sorties vers
// l'extérieur ; coudes 45° (2) sur les orifices CYL (face avant). Même bloc
// que le clapet de la plaque à coins du DU311-TVK (fonction loadCheckValve
// de ../../du311/parts/_avance_a.js).
// Repère : celui de l'avance (FEED, placé à l'identité dans P028) : face
// d'appui du bloc sur le flanc −X (x = −0.2), centre à y = 0.32, z = 0.075 ;
// bloc le long de Y, orifices VALVE vers −Z, CYL vers +Z, bouchon de réglage
// vers le bas. Encombrement ≈ 0.07 × 0.08 × 0.12 m.
import { IN, LCV, loadCheckValve, elbowLite, place, seat, hhcs, nordLock, MAST } from './_feed.js';

const C = [-MAST.hw, 0.32, 0.075];

export default function P074(api) {
  const { THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // repère du bloc : Y local → −X (hors du flanc), X local → +Y, Z local → +Z
  const M4 = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1)).setPosition(...C);
  const tp = (p) => p.clone().applyMatrix4(M4);
  const td = (d) => d.clone().transformDirection(M4);
  const v = loadCheckValve();
  v.matrix.copy(M4); v.matrix.decompose(v.position, v.quaternion, v.scale);
  P('1', v, [-0.1, 0, 0]);
  const pt = v.userData.ports;
  for (const k of ['VALVE1', 'VALVE2']) {
    const { p, d } = pt[k];
    P('3', place(elbowLite('npt', 4, 6), tp(p), td(d), [-1, 0, 0]), [-0.06, 0, -0.08]);
  }
  for (const k of ['CYL1', 'CYL2']) {
    const { p, d } = pt[k];
    P('2', place(elbowLite('npt', 4, 6, { angle: 45 }), tp(p), td(d), [-1, 0, 0]), [-0.06, 0, 0.08]);
  }
  const d5 = 0.3125 * IN, nl = 2 * Math.max(0.0008, d5 * 0.09) * 1.1;
  for (const h of v.userData.holes) {
    const top = tp(new THREE.Vector3(h.x, LCV.y, h.z));
    P('5', nordLock(d5, [top.x - nl / 2, top.y, top.z], [-1, 0, 0]), [-0.12, 0, 0]);
    P('4', hhcs(d5, 2 * IN, [top.x - nl, top.y, top.z], [-1, 0, 0]), [-0.2, 0, 0]);
  }
  void seat;
  return { view: { dir: [-1, 0.5, 0.8] } };
}
