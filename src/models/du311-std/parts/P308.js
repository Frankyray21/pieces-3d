// P308 — Frein à desserrage hydraulique CX008711 rév. 3 (page 308) : « BRAKE,
// HYD. RELEASE SUB-ASS'Y ». Frein de parc multidisque à ressorts MICO
// 02-560-106 (1), intercalé dans la transmission du porteur entre les deux
// arbres « FRONT/ARTICLT » (repère 43 de P292), sur le châssis avant :
// - carter cylindrique Ø 7 po × 3,8 po, flasque Ø 8 po à 6 vis, orifice de
//   desserrage et purge sur le dessus, patte de fixation en équerre (semelle
//   10 × 3 po à quatre trous Ø 11/16 pour les vis 5/8 de P292) ;
// - arbre cannelé Ø 1 3/4 traversant : de chaque côté une chape à cannelures
//   femelles série 1410 (2) en appui sur une rondelle trempée Ø 1 3/4 × 2 3/4
//   × 1/4 (4) ; côté gauche (-X) contre-écrou freiné 1-8 UNC (3) sur rondelle
//   plate 1 po (5) ; côté droit (+X) vis 5/8-18 × 1 3/4 (7), rondelle plate
//   5/8 Ø 2 1/8 (6) et rondelle fendue (8) dans le bout taraudé de l'arbre.
// Repère : origine sur l'axe de l'arbre au milieu du carter, X le long de
// l'arbre, Y vers le haut (dessous de la semelle en y = -0,127 m) ; oreilles
// des chapes selon ±Z (axe des bols du croisillon côté frein), centres des
// croisillons en x = ±0,128 m (YOKE308).
// Encombrement 0.30 (X) × 0.23 (Y) × 0.25 (Z) m.
// Cotes : liste (rondelles, filets) ; carter, patte et chapes d'après les vues
// de la page 308 à l'échelle des chapes 1410 (envergure 4 3/16 po).
import { u, L, put, hb, nt, fw, sw, yoke1410 } from './_carrier.js';

const HX = 1.9; // demi-longueur du carter (po)
const FOOT = 5.0; // axe → dessous de la semelle (po)
const YE = 2.9; // pied de chape → centre du croisillon (po)
export const YOKE308 = { x: u(HX + 0.25 + YE), footY: -u(FOOT), port: [u(0.6), u(3.85), 0], holes: [[-u(0.9 + 0.65), u(4.0)], [-u(0.9 + 0.65), -u(4.0)], [-u(0.9 - 0.65), u(4.0)], [-u(0.9 - 0.65), -u(4.0)]] };

export default function P308(api) {
  const { THREE, S } = api;
  const { merged, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — frein MICO : carter, flasque et vis, patte en équerre, arbre cannelé, orifices
  const holes = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) holes.push([sx * u(0.65), sz * u(4.0), u(11 / 32)]);
  const footPlate = S.plate(u(2.6), u(10), u(0.5), 'black', { holes: holes.map(([x, z, r]) => [x, z, r]), r: u(0.4) });
  footPlate.position.set(-u(0.9), -u(FOOT - 0.25), 0);
  const web = S.extrude([[-u(4.6), -u(FOOT - 0.5)], [u(4.6), -u(FOOT - 0.5)], [u(3.2), -u(1.2)], [u(2.2), u(0.4)], [-u(2.2), u(0.4)], [-u(3.2), -u(1.2)]], u(0.6), 'black');
  web.rotation.y = Math.PI / 2;
  web.position.x = -u(HX + 0.3);
  const ribs = [-1, 1].map((s) => { const b = S.box(u(1.6), u(2.6), u(0.45), 'black'); b.position.set(-u(HX - 0.6), -u(FOOT - 1.8), s * u(3.2)); return b; });
  const body = group(
    merged([
      L(S, [[1.0, -HX], [3.3, -HX], [3.5, -HX + 0.2], [3.5, HX - 0.35], [3.3, HX - 0.15], [1.2, HX - 0.15], [1.2, HX], [1.0, HX]], 'black', 44, { axis: 'x' }),
      L(S, [[1.0, -HX - 0.3], [4.0, -HX - 0.3], [4.0, -HX + 0.25], [1.0, -HX + 0.25]], 'black', 44, { axis: 'x' }),
      footPlate, web, ...ribs,
      // bossage de l'orifice de desserrage et de la purge, sur le dessus
      L(S, [[0, 2.8], [0.45, 2.8], [0.45, 3.85], [0, 3.85]], 'black', 14, { pos: [u(0.6), 0, 0] }),
      L(S, [[0, 2.8], [0.32, 2.8], [0.32, 3.75], [0, 3.75]], 'black', 12, { pos: [-u(0.9), 0, 0] }),
    ], 'black'),
    // vis du flasque, taraudage de l'orifice de desserrage (raccord de P292), vis de purge
    merged(Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return put(THREE, hb(S, 0.375, 0.75), [-u(HX + 0.3), Math.sin(a) * u(3.55), Math.cos(a) * u(3.55)], [-1, 0, 0]);
    }), 'zinc'),
    // arbre cannelé (dépasse des deux côtés, cannelures suggérées)
    L(S, [[0, -HX - 2.2], [0.875, -HX - 2.2], [0.875, HX + 2.2], [0, HX + 2.2]], 'steel', 20, { axis: 'x' }),
    S.gear(u(0.8), u(0.9), 16, u(3.4), 'steel', { axis: 'x', pos: [-u(HX + 1.4), 0, 0] }),
    S.gear(u(0.8), u(0.9), 16, u(3.4), 'steel', { axis: 'x', pos: [u(HX + 1.4), 0, 0] }),
    put(THREE, L(S, [[0, 0], [0.22, 0], [0.22, 0.02], [0, 0.02]], 'darkSteel', 12), [u(0.6), u(3.85), 0], [0, 1, 0]),
    put(THREE, S.merged([L(S, [[0, 0], [0.25, 0], [0.25, 0.18], [0.12, 0.18], [0.12, 0.4], [0, 0.4]], 'zinc', 6)], 'zinc'), [-u(0.9), u(3.75), 0], [0, 1, 0]),
  );
  P('1', body, [0, 0, 0]);

  // 4 — rondelles trempées contre les roulements ; 2 — chapes à cannelures femelles
  for (const s of [-1, 1]) {
    P('4', put(THREE, fw(S, 1.75, { od: 2.75, t: 0.25, seg: 24 }), [s * u(HX), 0, 0], [s, 0, 0]), [s * 0.04, 0, 0]);
    const yk = yoke1410(S, THREE, { hub: 3.0, yb: 1.4, ye: YE, mat: 'steel' });
    P('2', put(THREE, yk, [s * u(HX + 0.25), 0, 0], [s, 0, 0], Math.PI / 2), [s * 0.1, 0, 0]);
  }
  // côté gauche : rondelle plate 1 po (5) et contre-écrou freiné 1-8 (3) au fond de la chape
  const xl = -u(HX + 0.25 + 1.4 + 0.12);
  P('5', put(THREE, fw(S, 1.0, { od: 2.125, t: 0.1875, seg: 20 }), [xl, 0, 0], [-1, 0, 0]), [-0.16, 0, 0]);
  P('3', put(THREE, group(nt(S, 1.0, { jam: true }), L(S, [[0.42, 0.56], [0.7, 0.56], [0.66, 0.68], [0.42, 0.68], [0.42, 0.56]], 'white', 14)), [xl - u(0.1875), 0, 0], [-1, 0, 0]), [-0.2, 0, 0]);
  // côté droit : rondelle 5/8 Ø 2 1/8 (6), rondelle fendue (8), vis 5/8-18 × 1 3/4 (7)
  const xr = u(HX + 0.25 + 1.4 + 0.12);
  P('6', put(THREE, fw(S, 0.625, { od: 2.125, t: 0.1875, seg: 20 }), [xr, 0, 0], [1, 0, 0]), [0.16, 0, 0]);
  P('8', put(THREE, sw(S, 0.625), [xr + u(0.1875), 0, 0], [1, 0, 0]), [0.19, 0, 0]);
  P('7', put(THREE, hb(S, 0.625, 1.75), [xr + u(0.1875 + 0.156), 0, 0], [1, 0, 0]), [0.23, 0, 0]);

  return { view: { dir: [0.9, 0.6, 1.1] } };
}
