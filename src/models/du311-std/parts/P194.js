// P194 — Stabilisateurs avant CX037699 rév. 0 (page 194) : « ASSY, FRONT
// OUTRIGGER ». Deux stabilisateurs à jambe télescopique boulonnés de part et
// d'autre du caisson d'appui de la glissière (au nez du porteur) :
// - montage gauche (5, P316) à droite de la machine et montage droit (6,
//   P324) à gauche, chacun fixé par 14 vis 5/8-11 × 1 1/2 (8) sur rondelles
//   Nord-Lock (9) dans le caisson (trous taraudés) ;
// - écrans des détecteurs de proximité (3 gauche, 4 droit) et supports des
//   projecteurs à DEL (1 droit, 2 gauche) serrés sous ces vis, projecteurs
//   (dessinés en tireté au manuel) posés sur les supports, visés vers l'avant ;
// - raccords droits ORB -6 → JIC -6 (7) dans les orifices R et E des blocs
//   d'équilibrage.
// Repère machine (../layout.js), posé à l'identité par P164 : stabilisateurs
// en x = 2,62 m, z = ±0,80 m (CAR.frontOut), dessus des fûts à 0,93 m, patins
// au sol (jambes sorties de 0,322 m) ; faces d'appui des platines sur le
// caisson en z = ±0,7175 m (de x = 2,506 à 2,734 m, y = 0,62 à 0,99 m).
// Pièces mobiles : fûts, écrans, supports, vis sur le châssis avant (corps
// « front »), jambes et patins « outL » / « outR » (levée selon +Y).
// Encombrement 0.33 (X) × 1.02 (Y) × 1.81 (Z) m.
import { u, put, bolted, ST, CAR, stTop, stPlateHoles, stPorts, stShield, stLightBracket, SHIELD_T, SHIELD_HOLES, BRACKET_T, BRACKET_HOLES, jicStraight } from './_carrier.js';
import { body } from '../layout.js';
import { workLight } from '../lights.js';

export const FRONT_OUT = { ...CAR.frontOut, face: CAR.frontOut.z - u(ST.barrel.ro + ST.plate.t) };

export default function P194(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = CAR.frontOut;
  const ext = F.top - stTop(0);

  for (const s of [1, -1]) {
    const pz = -s; // platine côté châssis
    const O = [F.x, F.top, s * F.z];
    const g = (obj) => body('front', obj);
    // 5 / 6 — stabilisateurs (jambe : corps outR / outL)
    const sub = api.sub(s > 0 ? 'P316' : 'P324', { ext, body: s > 0 ? 'outR' : 'outL' });
    P(s > 0 ? '5' : '6', g(S.at(sub, O)), [0, 0, s * 0.35]);
    // 3 / 4 — écrans des détecteurs ; 1 / 2 — supports des projecteurs
    const shield = stShield(api, pz);
    P(s > 0 ? '3' : '4', g(S.at(shield, O)), [-0.12, 0, s * 0.2]);
    const br = stLightBracket(api, pz, workLight(S));
    P(s > 0 ? '1' : '2', g(S.at(br, O)), [0.15, -0.05, s * 0.2]);
    // 8 / 9 — vis et rondelles Nord-Lock de la platine (têtes côté fût)
    stPlateHoles().forEach(([x, y], i) => {
      const k = i % 7, col = i < 7 ? -1 : 1;
      const extra = col < 0 && SHIELD_HOLES.includes(k) ? SHIELD_T : col > 0 && BRACKET_HOLES.includes(k) ? BRACKET_T : 0;
      const grip = u(ST.plate.t + extra);
      const pos = [O[0] + x, O[1] + y, O[2] + pz * u(ST.barrel.ro) - pz * u(extra)];
      bolted(api, { pos, dir: [0, 0, -pz], grip, d: 0.625, len: 1.5, ref: '8', head: [['9', 'nl']], k: 0.06 })
        .forEach((o) => body('front', o));
    });
    // 7 — raccords droits -6 dans les orifices R et E
    for (const { pos, dir } of stPorts(pz)) {
      P('7', body('front', put(THREE, jicStraight(S, THREE, 6), [O[0] + pos[0], O[1] + pos[1], O[2] + pos[2]], dir)), dir.map((v) => v * 0.08));
    }
  }
  return { view: { dir: [1, 0.55, 0.9] } };
}
