// P228 — Électrovanne d'air CX027464 rév. 0 « SOLENOID VALVE ASSEMBLY »
// (page 228), repère 3 de P226. Électrovanne 3 voies 1/4 NPT (1) : corps
// d'aluminium vertical, orifices P (bas) et E (haut) côté +X, utilisation A
// côté -X, deux oreilles de fixation percées sur le dessus (vis de P226),
// tube d'armature et bobine surmoulée côté +Z avec écrou de retenue ;
// sortie de câble de la bobine (taraudage 1/2 NPT) vers le bas : joint
// d'étanchéité 1/2 NPT (3), raccord de gaine 1/2 po (2), gaine annelée 3/8 po
// de 12 po (4), gaine thermorétractable 3/4 po (7, 2 po) sur la jonction avec
// le connecteur femelle de type Deutsch (5) et ses deux broches (6).
// La liste donne la gaine et la gaine thermorétractable en pouces (« uom IN »)
// : un objet par pouce, bout à bout (12 tronçons de gaine, 2 manchons).
// Le dessin de la page 228 montre la bobine au-dessus du corps et la gaine
// à l'horizontale ; ici l'ensemble est dessiné comme posé dans P226 (bobine
// sur le côté, câble vers le bas).
// Repère : origine au centre du corps ; Y vers le haut (axe des vis de
// fixation), +X côté orifices P / E, +Z côté bobine. Encombrement ≈ 0.07 (X)
// × 0.49 (Y, de -0.45 à 0.04) × 0.09 (Z) m.
// Cotes : orifices 1/4 NPT (raccords de P226), entrée de câble 1/2 NPT, gaine
// 3/8 po (liste) ; corps et bobine estimés d'après les vues des pages 226 et
// 228 (bobine ≈ 1,8 po).
import { IN, NPT } from './_chassis.js';

// Orifices (centre de la face du bossage) et oreilles de fixation, repère P228.
export const SOLV = {
  P: { pos: [0.024, -0.018, 0], dir: [1, 0, 0] },
  E: { pos: [0.024, 0.018, 0], dir: [1, 0, 0] },
  A: { pos: [-0.024, -0.018, 0], dir: [-1, 0, 0] },
  lugs: [[-0.011, 0.0375, -0.027], [0.011, 0.0375, -0.027]], // dessus des oreilles (axe des vis)
};

/** Électrovanne complète (repères 1 à 7), commune à P228 et P230. coil : matériau de la bobine. */
export function solenoidValveAssy(api, { coil = 'plastic' } = {}) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (NPT[4] * IN) / 2;

  // ---------------------------------------------------------------- 1 — électrovanne
  const alu = [S.box(0.032, 0.075, 0.04, 'castAlu', { r: 0.003 })];
  // Bossages d'orifices (vrais taraudages 1/4 NPT de 8 mm).
  for (const k of ['P', 'E', 'A']) {
    const { pos, dir } = SOLV[k];
    const b = S.lathe([[rn * 0.95, 0], [0.0115, 0], [0.0115, 0.0065], [0.0105, 0.008], [rn * 0.95, 0.008], [rn * 0.95, 0]], 'castAlu', { axis: dir[0] > 0 ? 'x' : '-x', seg: 24 });
    b.position.set(pos[0] - dir[0] * 0.008, pos[1], pos[2]);
    alu.push(b);
  }
  // Oreilles de fixation (dessus, vers -Z), percées Ø 7 mm.
  for (const [x, y, z] of SOLV.lugs) {
    alu.push(S.lathe([[0.0036, y - 0.012], [0.0075, y - 0.012], [0.0075, y], [0.0036, y], [0.0036, y - 0.012]], 'castAlu', { seg: 20, pos: [x, 0, z] }));
  }
  alu.push(S.box(0.034, 0.012, 0.012, 'castAlu', { r: 0.002, pos: [0, 0.0315, -0.022] }));
  // Tube d'armature, bobine, écrou de retenue (+Z).
  const steel = [
    S.cyl(0.0085, 0.05, 'steel', { axis: 'z', seg: 20, pos: [0, 0.008, 0.045] }),
    S.nut(0.016, 0.006, 'steel', { axis: 'z', pos: [0, 0.008, 0.073] }),
    S.cyl(0.003, 0.006, 'steel', { axis: 'z', seg: 10, pos: [0, 0.008, 0.078] }),
    S.nut(0.022, 0.006, 'steel', { axis: 'z', pos: [0, 0.008, 0.023] }),
  ];
  const coilBody = S.group(
    S.box(0.046, 0.05, 0.036, coil, { r: 0.004, pos: [0, 0.008, 0.046] }),
    // Moyeu de sortie de câble (taraudé 1/2 NPT) sous la bobine.
    S.lathe([[0.0105, 0], [0.0135, 0], [0.0135, 0.014], [0.0105, 0.014], [0.0105, 0]], coil, { seg: 24, pos: [0, -0.031, 0.046] }),
  );
  // Plaque signalétique gravée (face +X de la bobine).
  const tag = S.at(S.nameplate(0.026, 0.018), [0.0235, 0.012, 0.046], [0, Math.PI / 2, 0]);
  P('1', S.group(S.merged(alu, 'castAlu'), S.merged(steel, 'steel'), coilBody, tag), [0, 0, 0]);

  // Axe du câble : x = 0, z = 0.046, vers -Y depuis le dessous du moyeu.
  const cz = 0.046, y0 = -0.031;
  // ---------------------------------------------------------------- 3 — joint 1/2 NPT
  P('3', S.washer(0.0135, 0.0105, 0.0015, 'rubber', { pos: [0, y0 - 0.00075, cz] }), [0, -0.03, 0.03]);
  // ---------------------------------------------------------------- 2 — raccord de gaine 1/2 po
  const y2 = y0 - 0.0015;
  const fit2 = [
    S.nut(0.0254, 0.008, 'plastic', { pos: [0, y2 - 0.004, cz] }),
    S.lathe([[0.0075, y2 - 0.008], [0.0125, y2 - 0.008], [0.0125, y2 - 0.016], [0.0115, y2 - 0.026], [0.0075, y2 - 0.026], [0.0075, y2 - 0.008]].reverse(), 'plastic', { seg: 24 }),
  ];
  fit2[1].position.set(0, 0, cz);
  // Écrou de serrage moleté (pans) sur la gaine.
  fit2.push(S.lathe([[0.0075, y2 - 0.03], [0.013, y2 - 0.03], [0.013, y2 - 0.016], [0.0075, y2 - 0.016], [0.0075, y2 - 0.03]], 'plastic', { seg: 8, pos: [0, 0, cz] }));
  P('2', S.merged(fit2, 'plastic'), [0, -0.06, 0.03]);

  // ---------------------------------------------------------------- 4 — gaine annelée 3/8 po (12 × 1 po)
  const yc0 = y2 - 0.026;
  const seg = (k) => {
    const ya = yc0 - k * IN, prof = [[0.0055, ya]];
    for (let i = 0; i < 8; i++) {
      const y = ya - (i * IN) / 8;
      prof.push([0.0085, y - 0.0003], [0.0085, y - 0.0016], [0.0072, y - 0.0022], [0.0072, y - IN / 8 + 0.0002]);
    }
    prof.push([0.0055, ya - IN]);
    prof.reverse();
    prof.push(prof[0]);
    return S.lathe(prof, 'plastic', { seg: 16, pos: [0, 0, cz] });
  };
  for (let k = 0; k < 12; k++) P('4', seg(k), [0, -0.09, 0.03]);
  const yEnd = yc0 - 12 * IN;

  // ---------------------------------------------------------------- 5 / 6 — connecteur et broches
  const yk = yEnd - 0.008; // haut du connecteur (sous la thermorétractable)
  const con = S.group(
    S.lathe([[0.0062, yk], [0.0085, yk], [0.0085, yk - 0.012], [0.0105, yk - 0.014], [0.0105, yk - 0.04], [0.0088, yk - 0.04], [0.0088, yk - 0.036], [0.0062, yk - 0.036], [0.0062, yk]].reverse(), 'grey', { seg: 24 }),
    S.box(0.006, 0.016, 0.004, 'grey', { r: 0.001, pos: [0.011, yk - 0.026, 0] }),
  );
  con.position.z = cz;
  P('5', con, [0, -0.13, 0.03]);
  for (const sx of [-1, 1]) {
    P('6', S.lathe([[0, 0], [0.0008, 0], [0.0008, 0.011], [0.0005, 0.012], [0, 0.012]], 'brass', { seg: 10, pos: [sx * 0.0028, yk - 0.039, cz] }), [sx * 0.02, -0.17, 0.03]);
  }

  // ---------------------------------------------------------------- 7 — thermorétractable 3/4 po (2 × 1 po)
  for (let k = 0; k < 2; k++) {
    const ya = yEnd + 0.012 - k * IN;
    P('7', S.lathe([[0.0086, ya], [0.0098, ya], [0.0098, ya - IN], [0.0086, ya - IN], [0.0086, ya]].reverse(), 'black', { seg: 20, pos: [0, 0, cz] }), [0.04, -0.12, 0.03]);
  }
}

export default function P228(api) {
  solenoidValveAssy(api, { coil: 'plastic' });
  return { view: { dir: [0.8, 0.4, 1.0] } };
}
