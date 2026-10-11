// P174 — Actionneur rotatif « ROTARY ACTUATOR » CM44400 rév. 24 (dessins pages
// 174 et 176 : deux isométriques, coupe A-A dans le plan des crémaillères,
// élévation, coupe B-B dans l'axe de l'arbre). Même actionneur à pignon et
// double crémaillère que celui du DU311-TVK (CM44400 rév. 23, P172 du TVK,
// dont on reprend le modèle détaillé pièce par pièce) ; la révision 24 change
// la valve d'équilibrage (23, CP007725) et ajoute sur chaque fond deux
// orifices équipés d'un gicleur (24, restricteur CP17600) et d'un coude 90°
// ORB → JIC (35, FA01052-06) : huit de chaque. La numérotation de la liste
// est décalée en conséquence (correspondance MAP ci-dessous).
// Carter (6) traversé par deux alésages ; crémaillères (8) à deux pistons
// (10), réglettes de portée (9) serrées par les vis de réglage (5, entretoise
// 1, joint 2, contre-écrou 46) ; quatre tubes (11) tenus par des brides (12)
// à clavettes (15), fonds RH (13) / LH (14) avec valves d'équilibrage (23) ;
// arbre à pignon (7) sur deux roulements coniques (cônes 25, cuvettes 29),
// fond fermé (16) et couvercle ouvert (17) ; bague de serrage fendue (32 /
// 33, vis CHC 38), bride de fixation (31) clavetée (34), rondelle d'arrêt
// (18) et vis CHC 1 po (39).
// Repère (celui de P172 du TVK) : origine au centre du carter, sur l'axe de
// l'arbre ; +Y le long de l'arbre vers la bride de fixation 31 (face d'appui
// du MCP à y = 0.297), X le long des crémaillères et des tubes (fonds à
// x = ±0.71), Z entre les deux alésages (axes des tubes à z = ±0.083).
// Encombrement ≈ 1.42 × 0.53 × 0.37 m (valves comprises).
// Simulation : les pièces de sortie qui tournent avec l'arbre (arbre, cônes
// des roulements, entretoises, bague de serrage, bride 31, clavette 34,
// rondelle d'arrêt 18, leurs vis et rondelles, cale sous la rondelle
// d'arrêt) sont étiquetées « roll » ; le reste suit le chariot (« shift »).

import P172 from '../../du311/parts/P172.js';
import { body } from '../layout.js';
import { IN, u, L, hexPrism, jicElbow } from './_slide.js';

// Repères du TVK (P172) → repères du DU311 sur roues (P174).
const MAP = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12',
  13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20', 21: '21', 22: '22',
  23: '23', 24: '25', 25: '26', 26: '27', 27: '28', 28: '29', 29: '30', 30: '31', 31: '32', 32: '33',
  33: '34', 34: '40', 35: '37', 36: '46', 37: '36', 38: '38', 39: '39', 40: '41', 41: '42', 42: '43',
  43: '44', 44: '45',
};
// Pièces de sortie (repères P174) qui tournent avec l'arbre.
const ROLL = new Set(['7', '25', '19', '20', '31', '32', '33', '34', '18', '36', '38', '39', '42', '43', '45']);

export default function P174(api) {
  const { THREE, S } = api;
  const { merged, group, at } = S;
  let shims = 0;
  // Modèle du TVK, repères renumérotés et étiquettes de simulation.
  P172({
    ...api,
    part(ref, obj, e, o) {
      const r = MAP[ref] ?? String(ref);
      let b = ROLL.has(r) ? 'roll' : 'shift';
      if (r === '21' && ++shims === 3) b = 'roll'; // cale sous la rondelle d'arrêt
      return api.part(r, body(b, obj), e, o);
    },
  });

  // ---------------------------------------------------------------- 24, 35 — gicleurs et coudes des fonds
  // Deux orifices SAE -6 sur la face +Y de chaque fond (bloc 0.045 × 0.19 ×
  // 0.158 centré en x = ±0.6875, z = ±0.083) : gicleur vissé (corps six-pans
  // 3/4 po à orifice calibré, taraudé ORB sur le dessus) et coude 90° ORB →
  // JIC dont le nez regarde le carter.
  const XC = 0.6875, TZ = 0.083, YF = 0.095;
  for (const e of [-1, 1]) {
    for (const s of [-1, 1]) {
      for (const dz of [-0.038, 0.038]) {
        const p = [e * XC, YF, s * TZ + dz];
        const restrictor = merged([
          hexPrism(S, THREE, 0.75, 0.34, 0, 0.2, 'zinc'),
          L(S, [[0, -0.42], ...S.thread(0.281, -0.42, -0.06, { pitch: 0.055, maxTurns: 5 }), [0.26, 0], [0, 0]], 'zinc', 14),
        ], 'zinc');
        api.part('24', body('shift', at(restrictor, p)), [e * 0.1, 0.12, 0]);
        // coude : queue vers −Y (dans le gicleur), nez vers +X local → tourné vers le carter (−e·X)
        const el = jicElbow(S, THREE, 6);
        const g = group(el);
        g.rotation.y = e > 0 ? Math.PI : 0;
        api.part('35', body('shift', at(g, [p[0], p[1] + u(0.34) + u(0.33), p[2]])), [e * 0.12, 0.22, 0]);
      }
    }
  }
  void IN;
  return { view: { dir: [0.9, 0.75, 1.1] } };
}
