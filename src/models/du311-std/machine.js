// P010 — Vue générale du DU311 s/n 10703 : porteur sur roues (P208), pont
// arrière (P416), glissière (P164) au nez du porteur, MCP (P156) sur
// l'actionneur rotatif, avance 6 pi à carrousel (P028) dressée à l'avant, face
// tête de rotation vers l'avant, carrousel à gauche ; extinction d'incendie
// (P012) et finition (P020). La roue, la télécommande ERIS sur trépied et le
// câble CAN livrés avec la machine sont posés au sol à droite, comme sur la
// vue de la page 10. Repère machine : voir layout.js.
import { M, WHEEL, wheel, body, flex } from './layout.js';
import { SLIDE, MCP } from './slide.js';
import { FEED } from './feed.js';
import { decal as isoDecal } from './decals.js';

// Position de l'avance : barres de guidage du cadre du carrousel dans les
// patins du MCP, cadre centré sur l'actionneur rotatif, pied du mât à 0,3 m.
const MCP_X = SLIDE.face + MCP.t / 2;
export const FEED_POS = { x: MCP_X + MCP.front + 0.005 - FEED.frame.z1, y: 0.3, z: FEED.frame.xc };

/** Point du repère de l'avance (x, y, z) dans le repère machine. */
export function feedToMachine([x, y, z]) {
  return [FEED_POS.x + z, FEED_POS.y + y, FEED_POS.z - x];
}

export function P010(api) {
  const { box, cyl, torus, tube, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 11 — porteur, 9 — pont arrière, 10 — glissière (tous dans le repère machine)
  P('11', api.sub('P208'), [0, 0, 0]);
  P('9', api.sub('P416'), [-1.4, 0.3, 0]);
  P('10', api.sub('P164'), [0.8, 0.2, 0]);

  // 6 — MCP : face avant vers l'avant (+X), longueur verticale, centré sur l'actionneur
  const mcp = api.sub('P156');
  mcp.rotation.y = Math.PI / 2;
  mcp.position.set(MCP_X, SLIDE.rot.y, 0);
  P('6', body('roll', mcp), [1.2, 0.35, 0]);

  // 8 — avance à carrousel dressée, face tête de rotation vers l'avant
  const feed = api.sub('P028');
  feed.rotation.y = Math.PI / 2;
  feed.position.set(FEED_POS.x, FEED_POS.y, FEED_POS.z);
  P('8', body('ext', feed), [2.0, 0.4, 0]);

  // 7 — extinction d'incendie, 12 — finition (repère machine)
  P('7', api.sub('P012'), [0, 0.9, 0]);
  P('12', api.sub('P020'), [0, 0.6, 0.5]);

  // Livrés avec la machine, posés au sol à droite : 3 roue 12.00-20, 5 télécommande
  // ERIS sur trépied, 4 câble CAN composite 50 pi enroulé
  P('3', at(wheel(api.S, { side: 1 }), [0.55, WHEEL.r, 1.85], [0, 0.35, 0]), [0, 0, 0.8]);
  P('5', group(
    ...[0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      const foot = [1.55 + Math.cos(a) * 0.32, 0, 2.1 + Math.sin(a) * 0.32];
      return tube([foot, [1.55, 0.78, 2.1]], 0.012, 'steel', { sharp: true, seg: 2 });
    }),
    at(box(0.12, 0.04, 0.12, 'darkSteel'), [1.55, 0.8, 2.1]),
    at(box(0.36, 0.22, 0.12, 'safety', { r: 0.02 }), [1.55, 0.95, 2.1], [0.5, 0, 0]),
    at(box(0.26, 0.14, 0.01, 'black'), [1.55, 0.99, 2.17], [0.5, 0, 0]),
    ...[1, -1].map((s) => tube([[1.55 + s * 0.19, 0.86, 2.06], [1.55 + s * 0.22, 1.08, 2.0], [1.55 + s * 0.1, 1.14, 1.98]], 0.01, 'black', { seg: 10 })),
    ...[-0.08, 0.08].map((dx) => at(cyl(0.012, 0.04, 'black'), [1.55 + dx, 1.08, 2.04])),
  ), [0, 0.3, 0.6]);
  P('4', group(
    ...[0, 1, 2, 3, 4, 5].map((i) => at(torus(0.24 - i * 0.004, 0.009, 'black'), [2.2, 0.012 + i * 0.016, 1.75])),
    at(cyl(0.022, 0.08, 'darkSteel', { axis: 'x' }), [2.48, 0.03, 1.72]),
    tube([[2.44, 0.03, 1.75], [2.4, 0.04, 1.73], [2.32, 0.03, 1.62]], 0.009, 'black', { seg: 8 }),
  ), [0.3, 0, 0.6]);
  return { view: { dir: [1.05, 0.55, 1.3] } };
}

// P020 — Finition (repère machine) : autocollants de danger et trousse d'autocollants ISO,
// boyau d'air 1,5 po x 170 po vers le pied de l'avance, boutons, sangles, colliers et
// gaine de boyaux sur les boyaux de l'avance, autocollant des commandes de conduite,
// tube porte-documents.
export function P020(api) {
  const { THREE } = api;
  const { box, cyl, tube, torus, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const C = M.cab;
  const F = feedToMachine;

  // 1 — danger poussière, 2 — danger émissions diesel (85 x 140 mm, bilingues, côté droit
  // du capot moteur) : bandeau rouge « DANGER », pictogramme, texte
  P('1', at(isoDecal(api.S, 'D', 'air', 0.085, 0.14), [-1.45, 1.6, 0.9805]), [0, 0, 0.3]);
  P('2', at(isoDecal(api.S, 'D', 'flame', 0.085, 0.14), [-1.6, 1.6, 0.9805]), [0, 0, 0.3]);
  // 9 — trousse d'autocollants ISO (P022) : pictogrammes posés sur la machine
  P('9', api.sub('P022'), [0, 0, 0]);
  // 10 — autocollant des commandes de conduite (pupitre de la cabine)
  P('10', at(box(0.12, 0.003, 0.18, 'white'), [-0.3, M.frameTop + 0.752, 0.45]), [0, 0.3, 0]);
  // 4 — boutons en plastique (verrous des portes du capot moteur)
  for (const x of [-2.6, -2.2, -1.8, -1.4]) {
    P('4', group(
      at(cyl(0.02, 0.012, 'black', { axis: 'z', seg: 12 }), [x, 1.3, -0.998]),
      at(cyl(0.012, 0.014, 'black', { axis: 'z', seg: 12 }), [x, 1.3, -0.985]),
    ), [0, 0, -0.35]);
  }
  // 11 — tube porte-documents (taille « D ») sur la paroi arrière de la cabine
  P('11', group(
    at(cyl(0.035, 0.32, 'black'), [C.x0 + 0.04, M.frameTop + 0.65, 0.8]),
    at(cyl(0.04, 0.03, 'black'), [C.x0 + 0.04, M.frameTop + 0.83, 0.8]),
  ), [-0.3, 0.2, 0]);

  // 3 — boyau d'air 1,5 po x 170 po : du réservoir tampon de la glissière au pied de l'avance
  const dthFoot = F([FEED.dth[6][0], FEED.dth[6][1] - 0.05, FEED.dth[6][2]]);
  P('3', flex(api.S, [[2.6, 1.34, 0.39], [2.62, 1.45, 0.7], [3.1, 1.0, 1.0], [3.55, 0.6, 0.95], [dthFoot[0], dthFoot[1] - 0.06, dthFoot[2]]],
    ['front', 'front', 'front', ['front', 'ext', 0.6], 'ext'], 0.026, 'black', { seg: 48 }), [0.3, -0.2, 0.4]);
  // 8 — gaine de protection sur le boyau DTH, près de l'émerillon
  const tdTop = F(FEED.dth[0]);
  const sockEnd = F(FEED.dth[1]);
  P('8', body('feed', tube([[tdTop[0], tdTop[1] + 0.06, tdTop[2]], sockEnd], 0.042, 'charcoal', { sharp: true, seg: 2 })), [0.3, 0.3, 0]);
  // 5 / 6 — sangles 8 po (18) et 20 po (18), 7 — colliers de boyaux (25), répartis le long
  // des boyaux : corps mobile interpolé entre « ext » et « feed » comme le boyau qu'ils serrent
  const wOf = (b) => (b === 'feed' ? 1 : b === 'ext' ? 0 : b[2]);
  const bOf = (w) => (w > 0.995 ? 'feed' : w < 0.005 ? 'ext' : ['ext', 'feed', w]);
  const spread = (pts, bodies, n, t0 = 0, t1 = 1) => {
    const seg = pts.slice(1).map((p, i) => Math.hypot(...p.map((v, k) => v - pts[i][k])));
    const total = seg.reduce((a, l) => a + l, 0);
    return Array.from({ length: n }, (_, j) => {
      let d = (t0 + ((t1 - t0) * (j + 0.5)) / n) * total, i = 0;
      while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
      const t = d / seg[i], a = pts[i], b = pts[i + 1];
      const w = wOf(bodies[i]) + (wOf(bodies[i + 1]) - wOf(bodies[i])) * t;
      return { p: a.map((v, k) => v + (b[k] - v) * t), d: b.map((v, k) => v - a[k]), b: bOf(w) };
    });
  };
  // sangle auto-agrippante : boucle à plat autour du faisceau, patte et boucle de serrage
  const strap = ({ p, d, b }, r, w) => {
    const g = group(
      torus(r, 0.0035, 'black', { axis: 'y' }),
      at(box(0.022, 0.006, w, 'black'), [r + 0.008, 0, 0]),
      at(box(0.012, 0.008, w * 0.8, 'charcoal'), [r + 0.002, 0, 0]),
    );
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...F(d).map((v, k) => v - F([0, 0, 0])[k])).normalize());
    g.position.set(...F(p));
    return body(b, g);
  };
  const L = FEED.loop, LB = FEED.loopBodies, H = FEED.dth, HB = FEED.dthBodies;
  // 5 — 8 po : faisceau des quatre boyaux de la boucle de l'avance
  spread(L, LB, 18, 0.03, 0.97).forEach((c) => P('5', strap(c, 0.042, 0.02), [0.2, 0, 0.3]));
  // 6 — 20 po : boyau DTH (doublée autour du boyau et de son fourreau)
  spread(H, HB, 18, 0.04, 0.96).forEach((c) => P('6', strap(c, 0.05, 0.025), [0.2, 0, 0.45]));
  // 7 — colliers de boyaux : bas du boyau DTH (8, sur le mât), flexibles hydrauliques le long
  // des flancs du châssis avant (2 × 7, collier en « P » vissé), boyau d'air 1,5 po (3)
  const pclip = (r, mat = 'steel') => group(
    torus(r, 0.005, mat, { axis: 'x' }),
    at(box(0.004, 0.012, 0.035, mat), [0, -r - 0.004, r * 0.5]),
    at(cyl(0.005, 0.008, 'zinc', { axis: 'y', seg: 8 }), [0, -r - 0.012, r * 0.5 + 0.008]),
  );
  spread(H.slice(4), HB.slice(4), 8).forEach(({ p, d }) => {
    const g = pclip(0.036);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(...F(d).map((v, k) => v - F([0, 0, 0])[k])).normalize());
    g.position.set(...F(p));
    P('7', body('ext', g), [0.2, 0, 0.55]);
  });
  for (const zs of [1, -1]) {
    for (let k = 0; k < 7; k++) {
      const g = pclip(0.03);
      g.position.set(0.3 + k * 0.28, 0.9, zs * (M.frameZ + 0.035));
      if (zs < 0) g.rotateX(Math.PI);
      P('7', body('front', g), [0, 0, zs * 0.3]);
    }
  }
  for (const p of [[2.6, 1.34, 0.39], [2.61, 1.39, 0.55], [2.62, 1.45, 0.7]]) {
    P('7', body('front', at(pclip(0.03), p)), [0.2, 0.2, 0.3]);
  }
  return { view: { dir: [1.1, 0.6, 1.2] } };
}
