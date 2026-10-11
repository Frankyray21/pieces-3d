// P132 — Bras pivotant haut, mécano-soudé CX036649 rév. 0 (page 132) :
// « ASSY, SWING ARM ». Corps du bras pivotant haut P130 :
// - bras (2) : poutre 2 1/2 × 2 po à ventre relevé entre deux moyeux fendus
//   Ø 6 1/2 × 2 1/2 po (chapeaux usinés avec le bras, repère 2 aussi), chape
//   haute à deux joues de 3/4 po près du moyeu du carrousel (œil de fond du
//   vérin P122) et chape basse à joues de 1/2 po près du moyeu de l'arbre
//   (œil de tige du vérin de pivotement P124) ;
// - chapeau du moyeu du carrousel : 4 vis 1/2 × 3 (4), chapeau du moyeu de
//   l'arbre : 4 vis 1/2 × 2 3/4 (3), rondelles Nord-Lock (5) sous tête ;
// - un graisseur droit 1/8 NPT (1) au bout de chaque chapeau.
// Repère : axe du bossage du couvercle haut (axe du carrousel) à l'origine,
// dessous des moyeux à y = 0, Y vers le haut ; +X vers l'arbre du bras de
// tige (entraxe 0.462 m) ; +Z côté mât (chape de P124), chape de P122 côté -Z.
// Encombrement ≈ 0.66 (X) × 0.14 (Y) × 0.27 (Z) m.
// Cotes : vis de la liste ; entraxe imposé par le carrousel et l'arbre du bras
// (repère de l'avance) ; moyeux, poutre et chapes à l'échelle des vis 1/2 po
// sur l'éclaté de P132.
import { swingArmBody, boltStack, place, greaseNipple } from './_carousel.js';

export default function P132(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { body, bolts, nipples } = swingArmBody(api, 'upper');
  P('2', body, [0, 0, 0]);
  for (const b of bolts) {
    const s = boltStack(api, b.pos, b.dir, 0.5, b.len, { washer: 'nord' });
    const e = b.dir.map((v) => v * 0.08);
    P('5', s.washer, e);
    P(b.len === 3.0 ? '4' : '3', s.bolt, e.map((v) => v * 1.8));
  }
  for (const n of nipples) P('1', place(api, greaseNipple(api), n.pos, n.dir), n.dir.map((v) => v * 0.06));
  return { view: { dir: [0.4, 0.8, 1] } };
}
