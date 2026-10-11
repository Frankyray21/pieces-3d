// P084 — Trousse de boyaux du bras de tige à axe unique V30 : CX032913 rév. 2
// « HOSE KIT, V30 SAPA » (pages 84 et 86), repère 19 de l'avance P032.
// Raccords zingués JIC 37° -06 : quatre unions droites mâle / mâle (1, détail
// A : bouts des quatre lignes d'alimentation, raccords-unions où viennent les
// boyaux de P090), trois coudes tournants 90° (2) et trois tés union mâles (3)
// vissés deux à deux (coude sur le mâle inférieur du té : détails B et C) ;
// treize flexibles -06 (3/8 po, deux tresses compact, Ø 19 mm, embouts sertis
// à écrou tournant) : HA06000-L droit / droit, HA06002-L droit / coude 90° ;
// L = longueur hors tout en pouces.
// Circuit supposé (vues des pages 84 et 86, sans schéma) :
//   · alimentation : 4 (62 po × 2, rotation A / B) et 12 (69 po × 2, pince
//     A / B), des unions pendues hors du cadre (détail A), remontée le long du
//     montant extérieur, passage en crosse par-dessus le cadre (vues 4 et 12),
//     descente vers les coudes des tés du détail B (rotation) et vers les
//     orifices VALVE du clapet de charge du bras (P070 repère 4) (pince) ;
//   · rotation : deux groupes coude + té (détail B, « le long du vérin
//     stinger » +X) ; passage du té → 6 (23 po × 2) vers les vérins rotatifs
//     du bras haut, branche → 7 (36 po) et 8 (46 po) vers ceux du bras bas ;
//   · pince : CYL 1 du clapet → 5 (16 po) → groupe coude + té du détail C sur
//     le cadre, puis 11 (27 po, coude 90°) vers le vérin de pince haut et 10
//     (23 po, coude 90°) vers le vérin bas ; CYL 2 (té tournant de P070) → 9
//     (50 po) vers le vérin haut et 5 (16 po) vers le vérin bas (vue 9 : deux
//     puis trois boyaux tenus par colliers le long de l'arbre).
// Repère : celui de P032 (feed.js) — axe du mât selon +Y (pied à y = 0),
// face avant vers +Z ; P032 insère la trousse à l'origine. Bras de tige (P070,
// non modélisé) d'après feed.js : arbre vertical en (0.33, ·, 0.42), bras de
// pince à y = 0.9 et 1.45 dirigés vers l'axe de forage (z = 0.565). Poses
// estimées des pièces de P070 qui reçoivent les boyaux (exportées : KIT084) :
// cadre support vertical à x ≈ 0.45 (z 0.25 … 0.45, haut à y = 1.75) ; vérins
// rotatifs debout entre moyeu et cadre, axe (0.40, ·, 0.33), orifices face −Z ;
// orifices des vérins de pince sur le dessus des bras, près du moyeu ; clapet
// de charge sur le cadre à y ≈ 0.78. Détail B sur la face avant du fût du
// vérin stinger +X (x 0.4, z 0.1) à y ≈ 1.25.
// Écarts : P070 n'a pas de modèle ; la répartition des boyaux entre rotation
// et pince est déduite des longueurs et des vues ; la descente de CYL 2
// passe par le té tournant de P070 (non dessiné ici).
// Encombrement ≈ 0.40 (X, de 0.22 à 0.62) × 1.10 (Y, de 0.75 à 1.86) × 0.36
// (Z, de 0.13 à 0.49) m.
import { place, seat, union, tee, elbow } from './_avance_a.js';
import { v3, ahead, addHose } from './_avance_a_hk2.js';

const SHAFT = { x: 0.33, z: 0.42 };
const ARMS = [0.9, 1.45];
const FRAME = { x: 0.45, z0: 0.25, z1: 0.45, top: 1.75 };
const ROT = { x: 0.4, z: 0.33, r: 0.045 }; // vérins rotatifs
const UNIONS = { x: 0.56, y: 1.28, z: [0.24, 0.27, 0.3, 0.33] };
const B = { y: 1.25, z: 0.182, x: [0.383, 0.428] };
const C = [0.47, 1.1, 0.4];

export const KIT084 = {
  shaft: SHAFT, arms: ARMS, frame: FRAME, rotary: ROT,
  // Sièges inférieurs des unions (bouts libres pour P090), repère de P032.
  unions: UNIONS,
};

export default function P084(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const H = (ref, L, a, b, opts, e) => addHose(api, ref, L, 6, a, b, opts, e);
  const S = (p, d) => ({ p: v3(p), d: v3(d).normalize() });
  const X = [1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], NZ = [0, 0, -1];

  // ------------------------------------------------ sièges de P070 (estimés)
  // Vérins rotatifs : deux orifices (A en bas, B en haut) face −Z, siège à
  // 30 mm de la face (adaptateur droit de P070).
  const rot = (k, i) => S([ROT.x, ARMS[k] + 0.03 + i * 0.075, ROT.z - ROT.r - 0.03], NZ);
  // Vérins de pince : orifices A (près du moyeu) et B sur le dessus du bras.
  const arm = v3([-0.915, 0, 0.402]);
  const clamp = (k, i) => S(v3([SHAFT.x, ARMS[k] + 0.06, SHAFT.z]).addScaledVector(arm, 0.075 + i * 0.04), Y);
  // Clapet de charge sur le cadre : VALVE vers le bas, CYL vers le haut ; té
  // tournant de P070 sur CYL 2 (passage vers le haut, branche vers −X).
  const LC = { x: FRAME.x - 0.04, y: 0.78, z: 0.35 };
  const valve = [0, 1].map((i) => S([LC.x, LC.y - 0.055, LC.z - 0.015 + i * 0.03], NY));
  const cyl1 = S([LC.x, LC.y + 0.055, LC.z - 0.015], Y);
  const cyl2run = S([LC.x, LC.y + 0.1, LC.z + 0.015], Y);
  const cyl2br = S([LC.x - 0.035, LC.y + 0.072, LC.z + 0.015], [-1, 0, 0]);

  // ------------------------------------------------ 1 — unions pendues (détail A)
  const un = UNIONS.z.map((z, i) => {
    const u = place(union(6), [UNIONS.x + (i % 2) * 0.008, UNIONS.y - i * 0.012, z], Y);
    P('1', u, [0.08, -0.04, 0]);
    return { up: seat(u, 0), down: seat(u, 1) };
  });

  // ------------------------------------------------ 3 / 2 — groupes té + coude
  // Té : mâle A vers le bas (siège à la pose), passage vers le haut, branche
  // selon bx ; coude tournant sur le mâle A, sortie selon ex.
  const group = (p, bx, ex, e) => {
    const t = place(tee('jic', 6, 6), p, Y, bx);
    P('3', t, e);
    const el = place(elbow('swivel', 6, 6), seat(t, 2).p, NY, ex);
    P('2', el, [e[0], e[1] - 0.03, e[2]]);
    return { run: seat(t, 0), br: seat(t, 1), in: seat(el, 0) };
  };
  const tB = B.x.map((x, i) => group([x, B.y - i * 0.04, B.z], [0, 0, 1], X, [0.05, 0, -0.12]));
  const tC = group(C, [-1, 0, 0], [0, 0, -1], [0.1, 0, 0.06]);

  // ------------------------------------------------ alimentation 4 / 12
  // Crosse par-dessus le cadre : sortie des unions vers le haut, sommet à
  // y ≈ 1.82, descente côté arbre.
  const arch = (dz) => [[FRAME.x + 0.12, 1.62, 0.3 + dz], [FRAME.x + 0.03, FRAME.top + 0.08, 0.31 + dz], [FRAME.x - 0.08, 1.62, 0.32 + dz]];
  H('4', 62, un[0].up, tB[0].in, { vias: [...arch(-0.03), [0.36, 1.38, 0.24]], sag: [0, 0, -1] }, [0.12, 0.12, -0.05]);
  H('4', 62, un[1].up, tB[1].in, { vias: [...arch(-0.01), [0.37, 1.36, 0.25]], sag: [0, 0, -1] }, [0.12, 0.16, -0.05]);
  H('12', 69, un[2].up, valve[0], { vias: [...arch(0.01), [LC.x - 0.02, 1.2, 0.29]], sag: [-1, 0, 0] }, [0.16, 0.12, 0.04]);
  H('12', 69, un[3].up, valve[1], { vias: [...arch(0.03), [LC.x - 0.03, 1.15, 0.33]], sag: [-1, 0, 0] }, [0.16, 0.16, 0.04]);

  // ------------------------------------------------ rotation 6 / 7 / 8
  H('6', 23, tB[0].run, rot(1, 0), { sag: [0.4, 0, -1] }, [0.03, 0.1, -0.14]);
  H('6', 23, tB[1].run, rot(1, 1), { sag: [0.4, 0, -1] }, [0.06, 0.12, -0.14]);
  H('7', 36, tB[0].br, rot(0, 0), { vias: [[0.37, 1.1, 0.24]], sag: [0.6, 0, -0.8] }, [0.04, -0.06, -0.14]);
  H('8', 46, tB[1].br, rot(0, 1), { vias: [[0.45, 1.18, 0.22], [0.43, 1.0, 0.24]], sag: [0.6, 0, -0.8] }, [0.08, -0.06, -0.14]);

  // ------------------------------------------------ pince 5 / 9 / 10 / 11
  H('5', 16, cyl1, tC.in, { sag: [1, 0, 0] }, [0.1, 0, 0.12]);
  H('11', 27, tC.run, { ...clamp(1, 0), end: '90', t: X }, { vias: [[0.36, 1.33, 0.44]], sag: [0, 0, 1] }, [0.0, 0.1, 0.12]);
  H('10', 23, tC.br, { ...clamp(0, 0), end: '90', t: X }, { sag: [0, 0, 1] }, [0.0, -0.06, 0.12]);
  H('9', 50, cyl2run, clamp(1, 1), { vias: [[0.29, 1.12, 0.47], [0.24, 1.36, 0.48]], sag: [0, 0, 1] }, [-0.06, 0.06, 0.16]);
  H('5', 16, cyl2br, clamp(0, 1), { sag: [0, 0, 1] }, [-0.06, -0.04, 0.16]);

  void ahead;
  return { view: { dir: [1.1, 0.4, 0.9] } };
}
