// P310 — Moteur hydraulique de translation modifié CX012603 rév. 0 (page 310) :
// moteur à pistons axiaux à axe brisé, cylindrée variable (1, CP000391), bridé
// sur la boîte de transfert (repère 50 de P292). Vue isométrique :
// - bride carrée SAE à 4 trous et centrage, arbre cannelé avec clavette ;
// - carter du palier, carter coudé (barillet incliné) à nervures, couvercle de
//   distribution en bout : orifices A et B à bride 1 1/4 po code 62 (4 taraudages
//   M14 chacun) sur ses deux flancs, régulateur électro-proportionnel sur le
//   dessus (électrovanne et connecteur), capteur de vitesse sur le carter,
//   orifice de drain T (M26 × 1,5) et orifices de pilotage M12 / M14 ;
// - bouchon six-pans creux métrique modifié (2) sur le dessus, près de la bride.
// Repère : origine au centre de la face d'appui de la bride, +X le long de
// l'arbre (sortie, vers la boîte), corps vers -X ; Y vers le haut (régulateur),
// orifices A / B selon ±Z (PORTS310).
// Encombrement 0.38 (X, de -0.32 à +0.06) × 0.27 (Y) × 0.24 (Z) m.
// Cotes : moteur de 107 cm³ de cette famille (bride 4 trous Ø 18 sur entraxe
// 180 mm, centrage Ø 127, arbre Ø 38) ; formes d'après la vue de la page 310.
import { L, put } from './_carrier.js';

const MM = 0.001;
/** Orifices (repère P310, m) : brides A / B, drain T, pilotage X1 / X2, capteur ; trous de la bride. */
export const PORTS310 = {
  A: { pos: [-0.29, 0.0, 0.102], dir: [0, 0, 1] },
  B: { pos: [-0.29, 0.0, -0.102], dir: [0, 0, -1] },
  T: { pos: [-0.215, 0.098, 0.02], dir: [0, 1, 0] },
  X1: { pos: [-0.28, 0.152, 0.035], dir: [0, 0, 1] },
  X2: { pos: [-0.28, 0.152, -0.035], dir: [0, 0, -1] },
  flangeHoles: [[0, 0.09, 0.09], [0, 0.09, -0.09], [0, -0.09, 0.09], [0, -0.09, -0.09]],
};

export default function P310(api) {
  const { THREE, S } = api;
  const { merged, group, box, cyl } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const mm = (v) => v * MM;

  // 1 — moteur : bride, palier, carter coudé, couvercle de distribution, régulateur
  const flHoles = [[mm(90), mm(90), mm(9)], [mm(-90), mm(90), mm(9)], [mm(90), mm(-90), mm(9)], [mm(-90), mm(-90), mm(9)]];
  const flange = S.extrude([[-mm(110), -mm(110)], [mm(110), -mm(110)], [mm(110), mm(110)], [-mm(110), mm(110)]].map(([y, z]) => [y, z]), mm(22), 'castIron', { holes: flHoles.map(([y, z, r]) => [y, z, r]) });
  flange.rotation.y = Math.PI / 2; // épaisseur selon X
  flange.position.x = -mm(11);
  // carter coudé : cylindre incliné de 12° vers le haut, prolongé jusqu'au couvercle
  const tilt = 0.21;
  const yokeHousing = S.lathe([[0, 0], [mm(86), 0], [mm(92), mm(10)], [mm(92), mm(190)], [mm(84), mm(200)], [0, mm(200)]], 'castIron', { seg: 36 });
  const yh = group(yokeHousing);
  yh.rotation.z = Math.PI / 2 - tilt; // axe +Y → vers -X, incliné
  yh.position.set(-mm(70), 0, 0);
  const ribs = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const b = box(mm(140), mm(14), mm(14), 'castIron');
    const g = group(b);
    b.position.set(-mm(80), Math.cos(a) * mm(92), Math.sin(a) * mm(92));
    g.rotation.z = -tilt;
    g.position.set(-mm(70), 0, 0);
    return g;
  });
  const coverY = Math.sin(tilt) * mm(200);
  const cover = box(mm(62), mm(190), mm(176), 'castIron', { r: mm(10) });
  cover.position.set(-mm(285), coverY * 0.5, 0);
  const portPads = [-1, 1].map((s) => { const b = box(mm(60), mm(70), mm(20), 'castIron', { r: mm(4) }); b.position.set(-mm(290), 0, s * mm(92)); return b; });
  P('1', group(
    merged([
      flange,
      S.lathe([[0, mm(-8)], [mm(63.5), mm(-8)], [mm(63.5), 0], [0, 0]], 'castIron', { axis: 'x', seg: 40 }),
      S.lathe([[0, -mm(75)], [mm(78), -mm(75)], [mm(80), -mm(68)], [mm(80), -mm(20)], [mm(88), -mm(12)], [mm(88), 0], [0, 0]], 'castIron', { axis: 'x', seg: 40 }),
      yh, ...ribs, cover, ...portPads,
      // bossage du capteur de vitesse et du drain
      S.lathe([[0, 0], [mm(16), 0], [mm(16), mm(18)], [0, mm(18)]], 'castIron', { pos: [-mm(150), mm(92), 0], seg: 16 }),
      S.lathe([[0, 0], [mm(22), 0], [mm(22), mm(12)], [0, mm(12)]], 'castIron', { pos: [-mm(215), mm(86), mm(20)], seg: 16 }),
    ], 'castIron'),
    // faces usinées des brides A / B (4 taraudages M14 sombres)
    merged([-1, 1].flatMap((s) => [
      S.lathe([[0, 0], [mm(17), 0], [mm(17), mm(1)], [0, mm(1)]], 'darkSteel', { axis: s > 0 ? 'z' : '-z', pos: [-mm(290), 0, s * mm(102)], seg: 20 }),
      ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => S.lathe([[0, 0], [mm(6), 0], [mm(6), mm(1.2)], [0, mm(1.2)]], 'darkSteel', { axis: s > 0 ? 'z' : '-z', pos: [-mm(290) + a * mm(22), b * mm(29), s * mm(102)], seg: 8 })),
    ]), 'darkSteel'),
    // arbre cannelé Ø 38 et clavette
    S.lathe([[0, 0], [mm(19), 0], [mm(19), mm(52)], [mm(17), mm(58)], [0, mm(58)]], 'steel', { axis: 'x', seg: 24 }),
    S.gear(mm(17.5), mm(19.6), 22, mm(40), 'steel', { axis: 'x', pos: [mm(32), 0, 0] }),
    // régulateur électro-proportionnel : bloc, électrovanne, connecteur
    box(mm(80), mm(46), mm(96), 'castAlu', { r: mm(4), pos: [-mm(270), mm(120), 0] }),
    cyl(mm(17), mm(62), 'black', { axis: 'z', pos: [-mm(270), mm(124), mm(76)] }),
    box(mm(26), mm(30), mm(22), 'black', { r: mm(4), pos: [-mm(270), mm(124), mm(118)] }),
    // capteur de vitesse (corps et connecteur)
    cyl(mm(11), mm(36), 'black', { pos: [-mm(150), mm(128), 0] }),
    box(mm(18), mm(20), mm(24), 'black', { r: mm(3), pos: [-mm(150), mm(152), mm(8)] }),
    // vis du couvercle
    merged([[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => put(THREE, S.merged([L(S, [[0, 0], [0.32, 0], [0.32, 0.38], [0, 0.38]], 'blackOxide', 10)], 'blackOxide'), [-mm(316), coverY * 0.5 + a * mm(78), b * mm(72)], [-1, 0, 0])), 'blackOxide'),
  ), [0, 0, 0]);

  // 2 — bouchon six-pans creux métrique modifié, sur le dessus près de la bride
  P('2', put(THREE, group(
    S.lathe([[mm(4), mm(5)], [mm(4), mm(9)], [mm(12), mm(9)], [mm(13), mm(8)], [mm(13), 0], [0, 0], [0, mm(5)]].reverse(), 'zinc', { seg: 16 }),
    S.lathe([[0, -mm(14)], [mm(9), -mm(14)], [mm(9), 0], [0, 0]], 'zinc', { seg: 10 }),
  ), [-mm(40), mm(88), mm(30)], [0, 1, 0]), [0, 0.08, 0]);

  return { view: { dir: [-0.8, 0.6, 1.1] } };
}
