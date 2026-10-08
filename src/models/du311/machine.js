// Vue générale (P010) : la machine complète. Châssis (P186) et avance V30
// (P032) modélisés ; glissière (P168), plaque de liaison du mât (P024),
// options (P400) et finition (P012) en formes simplifiées d'après les vues
// des pages 10, 24 et 168.
// Repère machine (voir frame.js) : X vers l'avant, Y vers le haut, +Z côté
// enrouleur. Le mât est dressé à l'avant, face tête de rotation vers +X.

const FEED = { x: 2.83, y: 0.6 }; // pied du mât (dos du mât à x = 2.62)

export function P010(api) {
  const { box, cyl, ring, shell, torus, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 4 — châssis complet
  P('4', api.sub('P186'), [0, 0, 0]);

  // 3 — glissière (chariot à tubes, actionneur rotatif, vérins d'inclinaison,
  // bloc de graissage, support du laser d'alignement) et ses appuis sur le porteur
  P('3', group(
    ...[0.85, 1.45].map((y) => at(cyl(0.06, 1.1, 'grey', { axis: 'z' }), [2.42, y, 0])),
    ...[1, -1].map((s) => at(box(0.25, 0.8, 0.04, 'grey'), [2.38, 1.15, s * 0.55])),
    ...[1, -1].map((s) => at(box(0.4, 0.14, 0.12, 'grey'), [2.07, 0.6, s * 0.35])),
    at(cyl(0.2, 0.08, 'darkSteel', { axis: 'x', seg: 40 }), [2.54, 1.15, 0]),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return at(cyl(0.012, 0.02, 'steel', { axis: 'x' }), [2.585, 1.15 + Math.sin(a) * 0.16, Math.cos(a) * 0.16]);
    }),
    ...[1, -1].map((s) => group(
      at(shell(0.05, 0.04, 0.42, 'black'), [0, 0, 0]),
      at(cyl(0.028, 0.25, 'chrome'), [0, 0.3, 0]),
    ).translateX(2.3).translateY(0.82).translateZ(s * 0.22).rotateZ(0.6)),
    at(box(0.06, 0.1, 0.05, 'steel'), [2.4, 1.15, 0.6]),
    at(box(0.08, 0.08, 0.06, 'black'), [2.42, 1.6, -0.55]),
  ), [0.65, 0, 0]);

  // 1 — plaque de liaison du mât et ses deux vérins d'extension (Ø3 x 54 po)
  P('1', group(
    at(box(0.04, 1.5, 0.5, 'grey'), [2.6, 1.5, 0]),
    at(cyl(0.09, 0.045, 'black', { axis: 'x' }), [2.6, 1.5, 0]),
    ...[1, -1].map((s) => group(
      at(shell(0.045, 0.036, 1.0, 'black'), [0, 1.25, 0]),
      at(cyl(0.025, 0.55, 'chrome'), [0, 2.0, 0]),
      at(cyl(0.03, 0.06, 'darkSteel', { axis: 'x' }), [0, 0.72, 0]),
    ).translateX(2.6).translateZ(s * 0.31)),
  ), [0.95, 0.15, 0]);

  // 2 — avance V30 : mât dressé, face avant (+Z local) tournée vers l'avant (+X)
  const feed = api.sub('P032');
  feed.rotation.y = Math.PI / 2;
  feed.position.set(FEED.x, FEED.y, 0);
  P('2', feed, [1.5, 0.35, 0]);

  // 5 — options : extincteur (système d'extinction), coffre à outils, clé de
  // débrayage et chaîne
  // (un objet par élément : le repère se pose sur le premier, le coffre)
  P('5', group(
    at(box(0.6, 0.3, 0.3, 'red', { r: 0.02 }), [1.68, 0.7, 0.86]),
    at(box(1.05, 0.04, 0.06, 'darkSteel'), [1.68, 0.88, 0.86]),
    at(box(0.12, 0.08, 0.14, 'darkSteel'), [2.14, 0.89, 0.86]),
    ...[0, 1, 2, 3].map((i) => at(torus(0.022, 0.006, 'steel', { axis: i % 2 ? 'x' : 'z' }), [1.3 + i * 0.035, 0.9, 0.92])),
  ), [0, 0.45, 0.4]);
  P('5', group(
    at(box(0.12, 0.2, 0.06, 'grey'), [-1.0, 0.95, -0.67]),
    at(cyl(0.1, 0.55, 'red', { seg: 28 }), [-1.0, 1.05, -0.8]),
    at(cyl(0.035, 0.08, 'black'), [-1.0, 1.36, -0.8]),
  ), [0, 0.45, -0.4]);

  // 6 — finition : autocollants de sécurité, étiquettes et sangles
  P('6', group(
    at(box(0.14, 0.085, 0.004, 'safety'), [1.05, 1.5, 0.657]),
    at(box(0.2, 0.12, 0.004, 'white'), [0.75, 1.2, 0.657]),
  ), [0, 0.3, 0.45]);
  P('6', at(box(0.3, 0.08, 0.004, 'safety'), [0.0, 0.66, 0.685]), [0, 0, 0.4]);
  P('6', at(box(0.3, 0.08, 0.004, 'safety'), [-1.0, 0.66, -0.685]), [0, 0, -0.4]);
  P('6', at(box(0.004, 0.12, 0.2, 'white'), [2.252, 1.15, 0.45]), [-0.3, 0, 0.3]);
  P('6', group(...[-0.31, 0.31].map((z) => at(ring(0.052, 0.045, 0.025, 'black'), [2.6, 1.15, z]))), [0.4, 0, 0]);
  return { view: { dir: [1.1, 0.55, 1.3] } };
}
