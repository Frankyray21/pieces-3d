// P010 — Vue générale « GENERAL ARRANGEMENT DU311-TVK 10680 » (page 10) : la
// machine complète, chaque repère étant son assemblage détaillé.
// Repère machine (frame.js) : X vers l'avant (côté avance), Y vers le haut,
// +Z côté enrouleur ; pont du porteur à y = 0.76.
//   1 MCP (P024) : modélisée à plat (Y = normale de la plaque, +Z vers les
//     oreilles) ; dressée contre la bride de sortie de l'actionneur rotatif de
//     la glissière (x = 2.577, axe à y = 1.2), normale vers l'avant, tiges des
//     vérins d'extension vers le haut.
//   2 avance V30 (P032) : mât dressé devant la MCP, ses barres de guidage dans
//     les rainures des patins de P026.
//   3 glissière (P168), 5 options (P400), 6 finition (P012) : déjà dans le
//     repère machine (insérés à l'origine).
//   4 châssis complet (P186) : à l'origine.

const SLIDE_FLANGE = { x: 2.577, y: 1.2 }; // face d'appui de la MCP, axe de l'actionneur (P168)
const FEED = { x: 2.86, y: 0.6 }; // pied du mât (barres de guidage dans les patins de la MCP)

export default function P010(api) {
  const { THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  P('4', api.sub('P186'), [0, 0, 0]);
  P('3', api.sub('P168'), [0.65, 0, 0]);

  const mcp = api.sub('P024');
  mcp.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 0, 1), // X de P024 (en travers) → +Z machine
    new THREE.Vector3(1, 0, 0), // Y de P024 (vers le mât) → +X machine
    new THREE.Vector3(0, 1, 0), // Z de P024 (vers les oreilles, tiges) → +Y machine
  ));
  mcp.position.set(SLIDE_FLANGE.x, SLIDE_FLANGE.y, 0);
  P('1', mcp, [0.95, 0.15, 0]);

  const feed = api.sub('P032');
  feed.rotation.y = Math.PI / 2; // face avant de l'avance (+Z local) vers l'avant (+X)
  feed.position.set(FEED.x, FEED.y, 0);
  P('2', feed, [1.5, 0.35, 0]);

  P('5', api.sub('P400'), [0, 0.45, 0.4]);
  P('6', api.sub('P012'), [0, 0.3, 0.45]);
  return { view: { dir: [1.1, 0.55, 1.3] } };
}
