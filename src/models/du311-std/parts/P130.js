// P130 — Bras pivotant haut CX036648 rév. 1 (page 130) : « ASSY, SWING ARM -
// UPPER ». Relie le bossage du couvercle haut du carrousel (axe du
// carrousel) au haut de l'arbre du bras de tige (P116) :
// - bras mécano-soudé (5, P132) ;
// - deux bagues à collerette Ø 3 1/2 × 4 po (4), collerette en bas (appui
//   sur le couvercle et sous le bras de pivot) ;
// - deux axes Ø 1 × 3 po à plaquette (3) : chape haute (œil de fond du vérin
//   du bras P122) et chape basse près de l'arbre (œil de tige du vérin de
//   pivotement P124), chacun arrêté par une vis 3/8 × 3/4 (7) et une rondelle
//   (9), avec deux entretoises (1) de part et d'autre de l'œil ;
// - deux colliers caoutchoutés 1 po (2) sur la poutre (flexibles des
//   mâchoires), vis 3/8 × 5/8 (6) et rondelles Nord-Lock (8).
// Repère : celui de P132 (axe du carrousel à l'origine, dessous des moyeux à
// y = 0, +X vers l'arbre du bras, +Z côté mât). Encombrement ≈ 0.66 × 0.17 ×
// 0.27 m.
import { swingArmBody, swingArmKit } from './_carousel.js';

export default function P130(api) {
  api.part('5', api.sub('P132'), [0, 0.1, 0]);
  const { pins } = swingArmBody(api, 'upper'); // positions des axes (le corps est celui de P132)
  swingArmKit(api, 'upper', { bushing: '4', pin: '3', pinBolt: '7', pinWasher: '9', spacer: '1', clamp: '2', clampBolt: '6', clampWasher: '8' }, pins);
  return { view: { dir: [0.4, 0.8, 1] } };
}
