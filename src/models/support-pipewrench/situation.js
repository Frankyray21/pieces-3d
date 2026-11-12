// Mise en situation du support : une clé à tuyau y est posée en contre-clé, mâchoires vers le haut,
// et une tige de forage NQ est déposée dans les mâchoires (on y visse ensuite l'émerillon d'eau).
// Ni la clé ni la tige ne figurent au plan 0102806 : la pose est calculée, pas relevée.
//   - clé sur le chant dans la traverse, bout du manche vers la butée du haut ;
//   - si la tige tombait sur les oreilles du bas, la clé descend la pente jusqu'à ce que la tige les dégage de 1/4 po ;
//   - angle de repos : celui qui met le centre de gravité le plus bas, la clé touchant la traverse ;
//   - centre de gravité au-delà du dernier appui (clé de 36 po) : la clé basculerait ; elle est montrée
//     tenue dans la chape du haut, là où une goupille passerait dans le trou d'accrochage du manche.
import { cle, shape, IN } from '../cles-a-tuyau/index.js';
import { dessusTraverse, PLAN } from './index.js';

export const NQ = { od: 0.0699, id: 0.0603, len: 1.2 };
const JEU = 0.25; // jeu entre la tige et les oreilles du bas (po)

/** Pose de la clé de grandeur « size » : angle (rad, pente vers le bas positive), origine de la clé et axe de la tige (po, repère du plan). */
export function pose(size) {
  const w = shape(size, NQ.od), P = w.P, n = P.length / 3;
  const rodW = [0.003 * w.sx, w.heelY + NQ.od / 2];
  const place = (phi) => {
    const c = Math.cos(phi), s = Math.sin(phi);
    const at = (xw, yw) => [(yw * c + xw * s) / IN, (-yw * s + xw * c) / IN];
    let minX = 1e9;
    for (let i = 0; i < n; i++) minX = Math.min(minX, at(P[i * 3], P[i * 3 + 1])[0]);
    let ox = PLAN.butee - minX;
    const slid = Math.max(0, PLAN.bout + JEU + NQ.od / 2 / IN - (at(...rodW)[0] + ox));
    ox += slid;
    let oy = -1e9, last = -1e9, endGap = 1e9;
    for (let i = 0; i < n; i++) { const q = at(P[i * 3], P[i * 3 + 1]); oy = Math.max(oy, dessusTraverse(q[0] + ox) - q[1]); }
    for (let i = 0; i < n; i++) {
      const q = at(P[i * 3], P[i * 3 + 1]), gap = q[1] + oy - dessusTraverse(q[0] + ox);
      if (gap < 0.02) last = Math.max(last, q[0] + ox);
      if (P[i * 3 + 1] < w.min[1] + 0.07 * w.sy) endGap = Math.min(endGap, gap);
    }
    const g = at(w.cg[0], w.cg[1]), r = at(...rodW);
    return { phi, ox, oy, slid, last, endGap, cg: [g[0] + ox, g[1] + oy], rod: [r[0] + ox, r[1] + oy] };
  };
  // recherche de l'angle de repos, grossière puis fine
  const deg = Math.PI / 180;
  let best = null;
  const scan = (a, b, step) => { for (let d = a; d <= b + 1e-9; d += step) { const p = place(d * deg); if (!best || p.cg[1] < best.cg[1]) best = p; } };
  scan(-5, 25, 0.5);
  scan(best.phi / deg - 0.5, best.phi / deg + 0.5, 0.02);
  let held = false;
  if (best.cg[0] > best.last + 0.05) {
    held = true;
    for (let d = 25; d >= -5; d -= 0.05) { const p = place(d * deg); if (p.endGap < 0.01) { best = p; break; } }
  }
  return { ...best, held, w };
}

/** Support (P001) + clé de grandeur « size » + tronçon de tige NQ. */
export function situation(api, size) {
  const S = api.S, p = pose(size);
  api.part('1', api.sub('P001'), [0, 0, 0]);
  // Clé : X vers le haut (ouverture des mâchoires), Y du manche vers la tête en descendant la pente, Z vers l'arrière.
  const key = S.group(cle(size, NQ.od));
  const h = Math.PI / 4 - p.phi / 2;
  key.quaternion.set(Math.cos(h), Math.sin(h), 0, 0);
  key.position.set((p.ox - PLAN.milieu) * IN, p.oy * IN, 0);
  api.part('2', key, [0, 0.25, 0]);
  const rod = S.shell(NQ.od / 2, NQ.id / 2, NQ.len, 'rodDull', { axis: 'z', pos: [(p.rod[0] - PLAN.milieu) * IN, p.rod[1] * IN, 0] });
  api.part('3', rod, [0.1, 0.45, 0]);
  return { view: { dir: [0.75, 0.45, 1.2] } };
}
