// P464 — Électrovanne d'eau CX027466 « SOLENOID VALVE ASSEMBLY 1" 2-
// POSITION 2-WAY 24VDC » (page 464), repère 6 de P462. Électrovanne 2/2
// pilotée 1 po (1, CP18015-5, « water pump ») : corps laiton à orifices
// 1 NPT en ligne (entrée en haut, sortie en bas, sens de l'eau de la page
// 462), chapeau vissé et tube culasse sur la face +Z, bobine surmoulée et son
// écrou ; sortie de câble de la bobine (taraudage 1/2 NPT) sur sa face +X :
// joint d'étanchéité 1/2 NPT (3), raccord de gaine 1/2 po (2), gaine annelée
// 3/8 po de 12 po (4, un objet par pouce), gaine thermorétractable noire
// 3/4 po de 2 po (7, un objet par pouce) sur la jonction avec le connecteur
// femelle à manchon thermorétractable (5) et ses deux broches (6).
// Repère : origine au centre du corps ; Y selon le passage (orifice d'entrée
// en haut, faces à y = ±SV.port), bobine vers +Z, câble sortant vers +X
// puis remontant (+Y) par un coude de 60 mm de rayon.
// Encombrement ≈ 0.15 (X) × 0.33 (Y) × 0.14 (Z) m. Cotes : orifices 1 NPT,
// entrée de câble 1/2 NPT, gaine 3/8 po (liste) ; corps et bobine aux
// proportions de la page 464.
import { I, IN, pipeR, hexProf } from './_rearb.js';

export const SV = { port: 0.05 }; // faces des orifices 1 NPT à y = ±port

export default function P464(api) {
  const { S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const r1 = pipeR(16);

  // ---------------------------------------------------------------- 1 — électrovanne
  const cz = 0.068, cx = 0.0; // centre de la bobine (axe selon Z)
  const hubX = 0.026; // face +X de la bobine (sortie de câble)
  {
    const body = [
      box(0.062, 0.07, 0.052, 'brass', { r: 0.004 }),
      lathe([[r1 * 0.98, 0.028], ...hexProf(I(1.75), 0.028, SV.port).slice(1, -1), [r1 * 0.98, SV.port], [r1 * 0.98, 0.028]], 'brass', { seg: 6 }),
      lathe([[r1 * 0.98, -SV.port], ...hexProf(I(1.75), -SV.port, -0.028).slice(1, -1), [r1 * 0.98, -0.028], [r1 * 0.98, -SV.port]], 'brass', { seg: 6 }),
      // Chapeau à six pans vissé sur la face +Z, flèche de sens coulée sur la face −Z.
      cyl(0.022, 0.012, 'brass', { axis: 'z', seg: 6, pos: [0, 0, 0.032] }),
      box(0.004, 0.03, 0.002, 'brass', { pos: [0, 0, -0.027] }),
      at(cyl(0.006, 0.002, 'brass', { r2: 0.0002, seg: 3, axis: 'y' }), [0, -0.018, -0.027]),
    ];
    const tube = cyl(0.008, 0.06, 'steel', { axis: 'z', seg: 16, pos: [0, 0, 0.065] });
    const coilB = merged([
      box(0.052, 0.054, 0.046, 'plastic', { r: 0.004, pos: [cx, 0, cz] }),
      cyl(0.01, 0.006, 'plastic', { axis: 'x', seg: 16, pos: [hubX - 0.003, 0, cz] }),
    ], 'plastic');
    const nutC = S.nut(0.017, 0.007, 'zinc', { axis: 'z', pos: [0, 0, cz + 0.026] });
    P('1', group(merged(body, 'brass'), tube, coilB, nutC), [0, 0, 0.05]);
  }

  // ---------------------------------------------------------------- 3, 2 — joint 1/2 NPT et raccord de gaine
  const rn = pipeR(8);
  P('3', S.ring(rn * 1.35, rn * 1.0, 0.0018, 'rubber', { axis: 'x', seg: 20, pos: [hubX + 0.0009, 0, cz] }), [0.03, 0, 0]);
  const x2 = hubX + 0.0018;
  P('2', group(merged([
    lathe(hexProf(I(1.0), 0, 0.012), 'zinc', { axis: 'x', seg: 6 }),
    lathe([[0, 0.012], [0.0105, 0.012], [0.0105, 0.026], [0.0095, 0.028], [0, 0.028]], 'zinc', { axis: 'x', seg: 18 }),
    lathe(hexProf(I(0.875), 0.016, 0.026), 'zinc', { axis: 'x', seg: 6 }),
  ], 'zinc')).translateX(x2).translateZ(cz), [0.06, 0, 0]);

  // ---------------------------------------------------------------- 4 — gaine annelée 3/8 po, 12 tronçons d'un pouce
  // Tracé : 20 mm selon +X, coude de rayon 60 mm, puis vers le haut (+Y).
  const x4 = x2 + 0.026, RC = 0.06, LS = 0.02;
  const path = (sArc) => {
    if (sArc <= LS) return { p: [x4 + sArc, 0, cz], t: [1, 0, 0] };
    const la = (Math.PI / 2) * RC;
    if (sArc <= LS + la) {
      const a = (sArc - LS) / RC;
      return { p: [x4 + LS + RC * Math.sin(a), RC * (1 - Math.cos(a)), cz], t: [Math.cos(a), Math.sin(a), 0] };
    }
    return { p: [x4 + LS + RC, RC + (sArc - LS - la), cz], t: [0, 1, 0] };
  };
  const along = (obj, s0) => {
    const { p, t } = path(s0);
    const o = group(obj);
    o.quaternion.setFromUnitVectors(new api.THREE.Vector3(0, 1, 0), new api.THREE.Vector3(...t));
    o.position.set(...p);
    return o;
  };
  const ro = 0.0078;
  for (let k = 0; k < 12; k++) {
    const prof = [[ro * 0.75, 0]];
    for (let j = 0; j < 5; j++) {
      const y0 = (j * IN) / 5;
      prof.push([ro * 0.9, y0], [ro, y0 + IN * 0.05], [ro, y0 + IN * 0.15], [ro * 0.9, y0 + IN * 0.2]);
    }
    prof.push([ro * 0.75, IN]);
    P('4', along(lathe(prof, 'plastic', { seg: 14 }), k * IN), [0.04, 0.06 + k * 0.006, 0]);
  }

  // ---------------------------------------------------------------- 7, 5, 6 — thermorétractable, connecteur, broches
  for (let k = 0; k < 2; k++) {
    P('7', along(lathe([[ro * 1.08, 0], [ro * 1.25, 0], [ro * 1.25, IN], [ro * 1.08, IN], [ro * 1.08, 0]], 'black', { seg: 18 }), (11.5 + k) * IN), [0.06, 0.16 + k * 0.02, 0]);
  }
  const s5 = 12.3 * IN;
  P('5', along(merged([
    lathe([[0, 0], [0.0095, 0], [0.0095, 0.03], [0.0125, 0.032], [0.0125, 0.045], [0.0105, 0.047], [0.004, 0.047], [0.004, 0.044], [0, 0.044]], 'plastic', { seg: 20 }),
    box(0.012, 0.006, 0.004, 'plastic', { pos: [0, 0.038, 0.0135] }),
  ], 'plastic'), s5), [0.06, 0.24, 0]);
  for (const sx of [-1, 1]) {
    P('6', along(lathe([[0, 0], [0.0008, 0], [0.0008, 0.011], [0.0005, 0.012], [0, 0.012]], 'brass', { seg: 10, pos: [sx * 0.0035, 0.034, 0] }), s5), [0.06 + sx * 0.02, 0.3, 0]);
  }

  void cx;
  return { view: { dir: [0.4, 0.6, 1.0] } };
}
