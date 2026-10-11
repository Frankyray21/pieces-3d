// P288 — Bloc compresseur surpresseur Le Roi CP48001 « BOOSTER COMPRESSOR »
// (page 288). Trois cylindres en W sur un seul maneton : carter (3, P296),
// vilebrequin et poulie 5VP (5, P298), flasque de palier arrière et pompe à
// huile (7, P302), couvercle de pompe (2, P294) ; par cylindre : cylindre à
// ailettes (6, P300), bielle et piston (8, P304), culasse à deux clapets (1,
// P290). La liste donne chaque ensemble en quantité 1 alors que le bloc a
// trois cylindres (« 3 HEADS / CYLINDERS REQUIRED ») : chacune des lignes 1, 6
// et 8 est UN objet qui groupe les trois exemplaires. Trousse de joints (4) :
// sans objet (ses joints sont dessinés dans les sous-ensembles).
// Embiellage dessiné maneton en haut (LR.crank = 0) : piston du cylindre
// central au PMH, les deux autres à ±60° de manivelle (pistons plus bas,
// bielles inclinées, têtes côte à côte sur le maneton commun).
// Repère du bloc (_moteur_surpresseur.js) : origine sur l'axe du vilebrequin
// au droit du cylindre central ; +X le long du vilebrequin vers la poulie ;
// Y vers le haut ; +Z = X × Y. Cylindres à −60° (côté −Z, x = −0.03), 0 (x =
// 0) et +60° (côté +Z, x = +0.03) autour de X. Dessous des quatre pattes à
// y = LR.footY = −0.165, trous Ø 13 mm à x = −0.112 / 0.082, z = ±0.145.
// Poulie Ø 16 po (0.406) à x = 0.215 ; couvercle de pompe à x = −0.215.
// Encombrement ≈ 0.48 (X, −0.215 → 0.267) × 0.53 (y −0.165 → 0.36 au dessus
// des bouchons du cylindre central) × 0.62 (Z, culasses latérales) m.

import { LR } from './_moteur_surpresseur.js';

export default function P288(api) {
  const { S } = api;
  const { at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const crank = LR.crank;
  // Sous-ensemble d'un cylindre placé dans le repère du bloc.
  const onCyl = (id, i, opts) => at(group(api.sub(id, opts)), [LR.cyl[i].x, 0, 0], [LR.cyl[i].a, 0, 0]);
  const three = (id, opts = () => ({})) => group([0, 1, 2].map((i) => onCyl(id, i, opts(i))));

  P('3', api.sub('P296'), [0, 0, 0]);
  P('5', api.sub('P298', { crank }), [0.36, 0, 0]);
  P('7', api.sub('P302', { crank }), [-0.2, 0, 0]);
  P('2', api.sub('P294'), [-0.32, 0, 0]);
  P('8', three('P304', (i) => ({ crank, i })), [0, 0.16, 0]);
  P('6', three('P300'), [0, 0.3, 0]);
  P('1', three('P290', () => ({ lite: true })), [0, 0.45, 0]);

  return { view: { dir: [-1.0, 0.75, 1.15] } };
}
