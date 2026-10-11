// P316 — Stabilisateur, montage gauche CX037680 rév. 2 (page 316) :
// « OUTRIGGER, LEFT MOUNT ». Vérin-jambe télescopique vertical : fût soudé à
// sa platine de fixation (2 × 7 trous, gousset, bossage du détecteur de
// proximité), tige creuse et piston fixes, jambe mobile à patin Ø 8 po, bloc
// d'équilibrage double sur le dessus. La liste ne donne que ses trousses :
// valves d'équilibrage (1, P318), bloc de valves (2, P320) et jambe (3, P322,
// avec le corps du stabilisateur qu'elle équipe : fût, tige, jambe).
// Posé à droite de la machine (vue B de la page 298, repère 5 de P194) :
// stabilisateur arrière droit de P292 (repère 69) et avant droit de P194.
// Repère ST (_carrier.js) : origine sur l'axe, face supérieure du fût (dessous
// du bloc), Y vers le haut ; platine du côté -Z (face d'appui en z = -3,25 po,
// côté châssis), largeur selon X ; orifices R / E vers +Z, bossage du détecteur
// vers -X. Options : { ext } sortie de la jambe (m, 0 : rentrée comme dessinée ;
// patin au sol pour ext = hauteur du dessus du fût − 0,608 m), { body } corps
// de simulation de la jambe et du patin.
// Encombrement (rentré) 0.229 (X) × 0.69 (Y, de -0.608 à +0.081) × 0.21 (Z) m.
import { outriggerMount } from './_carrier.js';

export default function P316(api, opts = {}) {
  return outriggerMount(api, -1, opts);
}
