// P128 — Bras pivotant bas CX036636 rév. 1 (page 128) : « ASSY, SWING ARM -
// LOWER ». Relie le bossage du couvercle bas du carrousel (axe du carrousel)
// au pied de l'arbre du bras de tige (P116) :
// - bras mécano-soudé (4, CX036637, sans liste propre : bras, chapeaux
//   usinés avec lui, 8 vis de chapeau 1/2 po et rondelles Nord-Lock, deux
//   graisseurs) : poutre 2 1/2 × 2 po à ventre relevé, moyeux fendus
//   Ø 6 1/2 × 2 1/2 po, chape près du moyeu de l'arbre pour l'œil de tige du
//   vérin de pivotement bas (P124) ;
// - deux bagues à collerette Ø 3 1/2 × 4 po (5) ;
// - axe Ø 1 × 3 po à plaquette (3), vis 3/8 × 3/4 (7) et rondelle (9), deux
//   entretoises (1) de part et d'autre de l'œil ;
// - deux colliers caoutchoutés 1 po (2) sous la poutre, vis 3/8 × 5/8 (6)
//   et rondelles Nord-Lock (8).
// Repère : axe du bossage du couvercle bas (axe du carrousel) à l'origine,
// dessous des moyeux à y = 0, Y vers le haut, +X vers l'arbre du bras
// (entraxe 0.462 m), +Z côté mât (chape du vérin). Encombrement ≈ 0.66 ×
// 0.11 × 0.27 m.
// Cotes : comme P132 (même bras, chape basse seulement, vue de P128).
import { swingArmBody, swingArmKit, boltStack, place, greaseNipple } from './_carousel.js';

export default function P128(api) {
  const { S } = api;
  const { body, bolts, nipples, pins } = swingArmBody(api, 'lower');
  // 4 — bras complet : corps, chapeaux, vis de chapeau et Nord-Lock, graisseurs
  const hw = [];
  for (const b of bolts) {
    const s = boltStack(api, b.pos, b.dir, 0.5, b.len, { washer: 'nord' });
    hw.push(s.washer, s.bolt);
  }
  const nip = nipples.map((n) => place(api, greaseNipple(api), n.pos, n.dir));
  api.part('4', S.group(body, S.merged(hw, 'zinc'), S.merged(nip, 'brass')), [0, 0, 0]);
  swingArmKit(api, 'lower', { bushing: '5', pin: '3', pinBolt: '7', pinWasher: '9', spacer: '1', clamp: '2', clampBolt: '6', clampWasher: '8' }, pins);
  return { view: { dir: [0.4, 0.8, 1] } };
}
