// P010 — Vue générale du DU311 s/n 10703 : porteur sur roues (P208), pont
// arrière (P416), glissière (P164) au nez du porteur, MCP (P156) sur
// l'actionneur rotatif, avance 6 pi à carrousel (P028) dressée à l'avant, face
// tête de rotation vers l'avant, carrousel à gauche ; extinction d'incendie
// (P012) et finition (P020). La roue, la télécommande ERIS sur trépied et le
// câble CAN livrés avec la machine sont posés au sol à droite, comme sur la
// vue de la page 10. Repère machine : voir layout.js.
import { M, WHEEL, wheel } from './layout.js';
import { SLIDE, MCP } from './slide.js';
import { FEED } from './feed.js';

// Position de l'avance : barres de guidage du cadre du carrousel dans les
// patins du MCP, cadre centré sur l'actionneur rotatif, pied du mât à 0,3 m.
const MCP_X = SLIDE.face + MCP.t / 2;
const FEED_POS = { x: MCP_X + MCP.front + 0.005 - FEED.frame.z1, y: 0.3, z: FEED.frame.xc };

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
  P('6', mcp, [1.2, 0.35, 0]);

  // 8 — avance à carrousel dressée, face tête de rotation vers l'avant
  const feed = api.sub('P028');
  feed.rotation.y = Math.PI / 2;
  feed.position.set(FEED_POS.x, FEED_POS.y, FEED_POS.z);
  P('8', feed, [2.0, 0.4, 0]);

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

// P012 — Extinction d'incendie automatique (repère machine, d'après la page 12) :
// 1 trousse automatique (détecteurs linéaires le long du groupe de pompage, du capot
// moteur et du pont arrière), 2 trousse manuelle (réservoir d'agent chimique à
// l'arrière du pont, cartouche de gaz propulseur, six buses et leurs flexibles,
// module de commande, afficheur et trois déclencheurs manuels).
export function P012(api) {
  const { box, cyl, tube, torus, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const FT = M.frameTop;

  // 1 — détecteurs linéaires (20 pi et 5 pi), câble de circuit, passe-fils
  const run1 = [[0.3, FT + 0.02, 0.4], [1.4, FT + 0.02, 0.4], [1.4, FT + 0.02, -0.4], [0.3, FT + 0.02, -0.4]];
  const run2 = [[-4.3, 1.02, 0.78], [-2.8, 1.02, 0.78], [-2.8, 1.02, -0.78], [-4.3, 1.02, -0.78]];
  P('1', group(
    tube(run1, 0.006, 'red', { sharp: true, seg: 6 }),
    tube(run2, 0.006, 'red', { sharp: true, seg: 6 }),
    tube([[-2.7, M.engine.top - 0.02, 0.9], [-1.15, M.engine.top - 0.02, 0.9], [-1.15, M.engine.top - 0.02, -0.9], [-2.7, M.engine.top - 0.02, -0.9]], 0.006, 'red', { sharp: true, seg: 6 }),
    ...[...run1, ...run2].map((p) => at(torus(0.012, 0.004, 'black', { axis: 'x' }), p)),
  ), [0, 0.5, 0]);

  // 2 — trousse manuelle
  const tank = [-4.18, 1.0, 0.68];
  const nozzles = [
    [-3.75, 1.88, 0.55], [-3.75, 1.88, -0.55], // pont arrière, vers le groupe de puissance
    [-2.6, 1.88, 0.6], [-2.6, 1.88, -0.6], // haut arrière du compartiment moteur
    [-0.6, FT - 0.04, -0.2], // sous la cabine, vers l'hydraulique
    [0.95, FT + 0.02, -0.25], // sous le repos du mât, vers le groupe de pompage
  ];
  const tee = [-3.4, 1.05, 0.5];
  P('2', group(
    // réservoir d'agent et support, cartouche de gaz propulseur et son support
    at(cyl(0.12, 0.5, 'red', { seg: 32 }), [tank[0], tank[1] + 0.25, tank[2]]),
    at(cyl(0.12, 0.06, 'red', { r2: 0.06 }), [tank[0], tank[1] + 0.53, tank[2]]),
    at(cyl(0.035, 0.06, 'darkSteel'), [tank[0], tank[1] + 0.59, tank[2]]),
    ...[0.1, 0.4].map((y) => at(torus(0.125, 0.008, 'darkSteel'), [tank[0], tank[1] + y, tank[2]])),
    at(cyl(0.035, 0.3, 'red'), [tank[0] + 0.2, tank[1] + 0.35, tank[2] + 0.1]),
    at(box(0.05, 0.2, 0.08, 'darkSteel'), [tank[0] + 0.2, tank[1] + 0.35, tank[2] + 0.05]),
    // té de distribution et flexibles vers les buses
    at(box(0.06, 0.06, 0.06, 'brass'), tee),
    tube([[tank[0], tank[1] + 0.03, tank[2]], [-3.8, 1.04, 0.6], tee], 0.012, 'black', { seg: 12 }),
    ...nozzles.map((n) => tube([tee, [tee[0], 0.92, 0.3], [n[0], 0.92, 0.3 * Math.sign(n[2])], [n[0], n[1] - 0.04, n[2]]], 0.008, 'black', { sharp: true, seg: 8 })),
    // buses V-1/2 et supports
    ...nozzles.flatMap((n) => [
      at(box(0.05, 0.012, 0.05, 'darkSteel'), [n[0], n[1] + 0.03, n[2]]),
      at(cyl(0.012, 0.05, 'brass', { r2: 0.016 }), [n[0], n[1], n[2]]),
    ]),
    // module de commande (ICM) et afficheur dans la cabine, déclencheurs manuels
    at(box(0.16, 0.12, 0.08, 'red', { r: 0.01 }), [-0.95, FT + 0.6, -0.3]),
    at(box(0.1, 0.07, 0.04, 'black', { r: 0.006 }), [-0.3, FT + 0.85, 0.75]),
    ...[[-4.3, 1.2, -0.99], [-0.32, FT + 0.82, 0.18], [0.82, 1.3, -0.95]].flatMap((p) => [
      at(box(0.06, 0.1, 0.05, 'red', { r: 0.006 }), p),
      at(cyl(0.018, 0.025, 'darkSteel', { axis: 'z' }), [p[0], p[1] + 0.02, p[2] + Math.sign(p[2] || 1) * 0.035]),
    ]),
  ), [0, 0.7, 0.3]);
  return { view: { dir: [0.9, 1.1, 1.0] } };
}

// P020 — Finition (repère machine) : autocollants de danger et trousse d'autocollants ISO,
// boyau d'air 1,5 po x 170 po vers le pied de l'avance, boutons, sangles, colliers et
// gaine de boyaux sur les boyaux de l'avance, autocollant des commandes de conduite,
// tube porte-documents.
export function P020(api) {
  const { box, cyl, tube, torus, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const E = M.engine, C = M.cab;
  const F = feedToMachine;
  const decal = (w, h, mat, pos, axis = 'z') => at(axis === 'z' ? box(w, h, 0.003, mat) : box(0.003, h, w, mat), pos);

  // 1 — danger poussière, 2 — danger émissions diesel (85 x 140 mm, côté droit du capot moteur)
  P('1', decal(0.085, 0.14, 'safety', [-1.45, 1.6, 0.982]), [0, 0, 0.3]);
  P('2', decal(0.085, 0.14, 'safety', [-1.6, 1.6, 0.982]), [0, 0, 0.3]);
  // 9 — trousse d'autocollants ISO : logos et « DU311 » sur les capots, pictogrammes
  P('9', group(
    decal(0.5, 0.1, 'white', [(E.x0 + E.x1) / 2, 1.82, 0.982]),
    decal(0.5, 0.1, 'white', [(E.x0 + E.x1) / 2, 1.82, -0.982]),
    decal(0.32, 0.08, 'black', [-3.2 - 0.8, 1.85, 0.962]),
    decal(0.32, 0.08, 'black', [-3.2 - 0.8, 1.85, -0.962]),
    ...[[-2.4, 1.5], [-2.0, 1.5]].map(([x, y]) => decal(0.08, 0.08, 'safety', [x, y, -0.982])),
    decal(0.08, 0.08, 'safety', [M.nose - 0.25, 0.75, M.frameZ + 0.017]),
  ), [0, 0, 0.4]);
  // 10 — autocollant des commandes de conduite (pupitre de la cabine)
  P('10', at(box(0.12, 0.003, 0.18, 'white'), [-0.3, M.frameTop + 0.752, 0.45]), [0, 0.3, 0]);
  // 4 — boutons en plastique (verrous des portes du capot moteur)
  P('4', group(...[-2.6, -2.2, -1.8, -1.4].map((x) => at(cyl(0.02, 0.025, 'black', { axis: 'z' }), [x, 1.3, -0.992]))), [0, 0, -0.35]);
  // 11 — tube porte-documents (taille « D ») sur la paroi arrière de la cabine
  P('11', group(
    at(cyl(0.035, 0.32, 'black'), [C.x0 + 0.04, M.frameTop + 0.65, 0.8]),
    at(cyl(0.04, 0.03, 'black'), [C.x0 + 0.04, M.frameTop + 0.83, 0.8]),
  ), [-0.3, 0.2, 0]);

  // 3 — boyau d'air 1,5 po x 170 po : du réservoir tampon de la glissière au pied de l'avance
  const dthFoot = F([-0.42, 0.31, -0.14]);
  P('3', tube([[2.6, 1.34, 0.39], [2.62, 1.45, 0.7], [3.1, 1.0, 1.0], [3.55, 0.6, 0.95], [dthFoot[0], dthFoot[1] - 0.06, dthFoot[2]]], 0.026, 'black', { seg: 48 }), [0.3, -0.2, 0.4]);
  // 8 — gaine de protection sur le boyau DTH, près de l'émerillon
  const tdTop = F([0, FEED.tdY + 0.48, FEED.AX]);
  const sockEnd = F([-0.15, FEED.tdY + 0.75, FEED.AX]);
  P('8', tube([[tdTop[0], tdTop[1] + 0.06, tdTop[2]], sockEnd], 0.042, 'charcoal', { sharp: true, seg: 2 }), [0.3, 0.3, 0]);
  // 5 / 6 — sangles 8 po et 20 po, 7 — colliers de boyaux (sur les boyaux de l'avance)
  const ringAt = (p, r, mat, axis = 'y') => at(torus(r, 0.006, mat, { axis }), F(p));
  P('5', group(...[[-0.62, 2.2, 0.15], [-0.55, 1.4, 0.08]].map((p) => ringAt(p, 0.035, 'black'))), [0.2, 0, 0.3]);
  P('6', group(...[[-0.78, 2.6, 0.35], [-0.72, 1.4, 0.2]].map((p) => ringAt(p, 0.045, 'black'))), [0.2, 0, 0.45]);
  P('7', group(
    ...[[-0.5, 0.55, -0.05], [-0.72, 1.9, 0.27]].map((p) => ringAt(p, 0.038, 'steel')),
    at(torus(0.034, 0.006, 'steel', { axis: 'x' }), [1.2, 0.88, M.frameZ + 0.05]),
  ), [0.2, 0, 0.55]);
  return { view: { dir: [1.1, 0.6, 1.2] } };
}
