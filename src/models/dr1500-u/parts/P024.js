// P024 — Plaque support de la bague d'usure et bague de guidage du serre-tiges (dessin X-Spec 055B / B6279, page 24).
//
// REPÈRE LOCAL : axe de forage le long de X, origine sur l'axe au dessus de l'adaptateur de chapeau du serre-tiges
// (là où la plaque se pose) ; +X = vers le trou (au-dessus de la plaque). Posé par P021 (ligne « p. 24 »).
// Colonne sx = −1 (_boyles.js) : d (pouces) compté vers −X depuis l'origine (d < 0 : au-dessus de l'adaptateur).
//
// Pièces (page 24) : plaque 55-0029 en appui sur l'adaptateur, deux oreilles à lumière ouverte (φ = 90° et 270°,
// entre les têtes des boulons 3/4 de l'adaptateur) tenues par deux boulons 1/2-13 × 1 1/4 ; roulement 6018-2RS
// (Ø 90 × 140 × 24 mm [norme]) dans un lamage du dessous de la plaque ; jonc extérieur 5100-354 (arbre de 3,54 po =
// alésage du 6018) sous le roulement, sur la bague de guidage ; bague de guidage N W/L 55-0032 (sans ligne : son
// numéro dépend du calibre, tableau p. 24) au travers du roulement, collerette au-dessus de la plaque.
// Cotes [estimé d'après la vue p. 24, à l'échelle du roulement] : plaque de 1,6 po (oreilles de 0,5 po), Ø 6,3 ;
// bague de guidage : alésage Ø 2,84, portée Ø 3,54, collerette Ø 4,6.
import { IN, BEARINGS } from '../layout.js';
import { colonne, hexBolt, sectorGeo, mat, deg } from './_boyles.js';

export default function P024(api) {
  const { S, THREE } = api;
  const C = colonne(api, -1);
  const W = (obj) => S.at(S.group(obj), [0, 0, 0], [0, 0, -Math.PI / 2]);
  const P = (ref, obj, ex) => api.part(ref, W(obj), ex);
  const X = (k) => [k, 0, 0];
  const [bi, bo, bw] = BEARINGS['6018'];
  const BW = bw / IN; // 0,94 po
  const dB = -0.25, dT = -1.6; // dessous du roulement, dessus de la plaque

  // Bague de guidage (hors liste) : portée du roulement, gorge du jonc, collerette.
  api.add(W(C.L([[1.42, -0.18], [1.77, -0.18], [1.77, dT - 0.05], [2.3, dT - 0.05], [2.3, -2.45], [1.5, -2.45], [1.42, -2.37]], 'steel')));

  // 1 — Plaque support 55-0029 : corps tourné (lamage du roulement), deux oreilles à lumière.
  const oreille = (f) => {
    const pts = [[2.9, -0.8], [4.45, -0.8], [4.45, -0.28], [3.75, -0.28]];
    for (let k = 1; k < 12; k++) { const a = -Math.PI / 2 - (k * Math.PI) / 12; pts.push([3.75 + 0.28 * Math.cos(a), 0.28 * Math.sin(a)]); }
    pts.push([3.75, 0.28], [4.45, 0.28], [4.45, 0.8], [2.9, 0.8]);
    return C.plan(pts.map(([p, t]) => [C.sx * (p * Math.cos(f) - t * Math.sin(f)) * IN, (p * Math.sin(f) + t * Math.cos(f)) * IN]), -0.5, 0, 'red');
  };
  P('1', S.group(
    C.L([[1.85, dT], [3.15, dT], [3.15, 0], [2.78, 0], [2.78, dB - BW - 0.02], [1.85, dB - BW - 0.02]], 'red'),
    oreille(90 * deg), oreille(270 * deg),
  ), X(-0.08));

  // 2 — Roulement 6018-2RS ; 3 — jonc extérieur (à oreilles) sous le roulement.
  P('2', C.put(S.bearing(bo / 2, bi / 2, bw, 'steel'), 0, 0, dB - BW / 2), X(-0.12));
  P('3', S.group(
    C.put(new THREE.Mesh(sectorGeo([[1.72 * IN, -0.04 * IN], [2.05 * IN, -0.04 * IN], [2.05 * IN, 0.04 * IN], [1.72 * IN, 0.04 * IN]], 20 * deg, 340 * deg, 40, -1), mat('blackOxide')), 0, 0, -0.21),
    ...[14, -14].map((a) => C.put(S.box(0.25 * IN, 0.08 * IN, 0.2 * IN, 'blackOxide'), 2.0, a * deg, -0.21)),
  ), X(-0.15));

  // 4 — Boulons 1/2-13 × 1 1/4 (2) dans les lumières, vissés dans l'adaptateur de chapeau.
  [90, 270].forEach((a) => P('4', hexBolt(C, 0.5, 1.25, 3.75, a * deg, -0.5, { washer: true }), X(0.08)));
}
