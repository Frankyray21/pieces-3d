// P324 — Stabilisateur, montage droit CX037682 rév. 2 (page 324) :
// « OUTRIGGER, RIGHT MOUNT ». Image miroir de P316 (même construction, mêmes
// trousses : valves d'équilibrage 1 = P318, bloc de valves 2 = P320, jambe
// 3 = P322 avec le corps du stabilisateur), quantités non indiquées au
// manuel. Posé à gauche de la machine (repère 6 de P194) : stabilisateur
// arrière gauche de P292 (repère 70) et avant gauche de P194.
// Repère ST (_carrier.js) : origine sur l'axe, face supérieure du fût (dessous
// du bloc), Y vers le haut ; platine du côté +Z (face d'appui en z = +3,25 po,
// côté châssis), largeur selon X ; orifices R / E vers -Z, bossage du détecteur
// vers -X. Options : { ext } sortie de la jambe (m), { body } corps de
// simulation de la jambe et du patin.
// Encombrement (rentré) 0.229 (X) × 0.69 (Y, de -0.608 à +0.081) × 0.21 (Z) m.
import { outriggerMount } from './_carrier.js';

export default function P324(api, opts = {}) {
  return outriggerMount(api, 1, opts);
}
