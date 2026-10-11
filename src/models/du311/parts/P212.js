// P212 — Trousse d'adaptateurs d'aspiration CX026540 rév. 0 « KIT, SUCTION
// ADAPTERS » (page 212), repère 10 de P186. Trois conduites d'aspiration
// entre le réservoir hydraulique (porteur P328) et les pompes :
// - réservoir (paroi latérale) → coude 90° 2 1/2 po (1) → flexible 2 1/2 po →
//   coude 45° 2 1/2 po (3) sur l'aspiration de la pompe 100 cm³ de P208 ;
// - réservoir (fond incliné) → deux coudes 90° bride 2 1/2 po code 61 /
//   douille cannelée 2 po (5, ×2) → flexibles 2 po → coude 90° 2 po (2) sur
//   l'aspiration de la pompe 74 cm³ de P208, et adaptateur droit 2 po (4) sur
//   la pompe 74 cm³ entraînée par le diesel (P242) ;
// colliers à boulon en T : 7 (×2, flexible 2 1/2 po) aux deux bouts de la
// conduite 2 1/2 po, 6 (×4, flexibles 2 po) aux bouts des deux conduites 2 po ;
// trousses de demi-brides J518 code 61 avec vis et rondelles : 9 (2 1/2 po,
// ×4) sur 1, 3 et les deux 5 ; 8 (2 po, ×2) sur 2 et 4.
// Les flexibles d'aspiration ne font pas partie de la trousse (non dessinés).
// Repère : celui de P208 (origine sur l'axe de l'arbre au plan de la face C
// du moteur, +X vers les pompes, Y vers le haut, +Z côté refoulement de la
// pompe 1) ; P212 se place dans P186 exactement comme P208. Les adaptateurs
// 3 et 2 sont sur les orifices PUMPS.s1 et PUMPS.s2 de P208 ; ceux du
// réservoir (1, 5) sont posés sur la face du réservoir tournée vers les
// pompes, estimée à z = -0.45 (réservoir de frame.js à x ≈ -1.75, z ≈ 0.38
// dans le repère machine) ; l'adaptateur 4 est posé à l'emplacement estimé de
// la pompe du diesel (x ≈ -0.25, z ≈ -0.45), à confirmer avec P242.
// Encombrement ≈ 1.2 (X) × 0.3 (Y) × 0.6 (Z) m.
import { IN, j518, flangeHead, splitFlange, orient } from './_chassis.js';
import { PUMPS } from './P208.js';

export default function P212(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Douille cannelée pour flexible (rayon intérieur du flexible rh) le long de +Y, de 0 à len.
  const barbProfile = (rh, rb, len) => {
    const pr = [[rb, 0], [rh * 0.98, 0]];
    const n = 4, p = (len * 0.8) / n;
    for (let i = 0; i < n; i++) {
      const y = len * 0.15 + i * p;
      pr.push([rh * 0.98, y], [rh * 1.06, y + p * 0.15], [rh * 0.96, y + p * 0.95]);
    }
    pr.push([rh * 0.96, len - 0.003], [rh * 0.9, len], [rb, len], [rb, 0]);
    return pr;
  };

  /**
   * Adaptateur d'aspiration : collet J518 (dash, code 61) sur y = 0, col, coude
   * de angle degrés (de +Y vers +Z, rayon de cintrage 1.4 Ø) puis douille
   * cannelée pour un flexible de diamètre intérieur hoseIn (po). Retourne
   * { obj, tip (bout de la douille), dir, clamp (milieu de la zone de collier) }.
   */
  const adapter = (dash, angle, hoseIn, { straight = 0.03 } = {}) => {
    const f = j518(dash, 61);
    const rh = (hoseIn * IN) / 2;
    const rt = Math.max(rh * 0.98, f.rn * 0.9); // tube du coude
    const wall = 0.004;
    const parts = [flangeHead(api, dash, 61, 0.012, 'steel')];
    const y0 = f.hc + 0.012;
    // Cône de raccordement col → tube.
    parts.push(S.lathe([[f.rb, y0], [f.rn, y0], [rt, y0 + 0.01], [rt, y0 + straight], [rt - wall, y0 + straight], [f.rb, y0]], 'steel', { seg: 32 }));
    let c = new THREE.Vector3(0, y0 + straight, 0);
    let dir = new THREE.Vector3(0, 1, 0);
    if (angle) {
      const a = (angle * Math.PI) / 180, R = rt * 2.8;
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const t = (i / 16) * a;
        pts.push([0, c.y + Math.sin(t) * R, R - Math.cos(t) * R]);
      }
      // Coude : tube à paroi pleine (bord intérieur visible aux bouts).
      parts.push(S.tube(pts, rt, 'steel', { seg: 24, ends: 'none', radial: 24 }));
      c = new THREE.Vector3(...pts[16]);
      dir = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
    }
    // Douille cannelée et sa butée.
    const len = hoseIn * IN * 1.2;
    const barb = S.lathe([[rh * 0.85, -0.004], [rt * 1.12, -0.004], [rt * 1.12, 0.004], [rh * 0.85, 0.004], [rh * 0.85, -0.004]], 'steel', { seg: 32 });
    const b2 = S.lathe(barbProfile(rh, rh - wall, len), 'steel', { seg: 32 });
    b2.position.y = 0.004;
    const tail = S.group(barb, b2);
    tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    tail.position.copy(c);
    parts.push(tail);
    const tip = c.clone().addScaledVector(dir, len + 0.004);
    const clamp = c.clone().addScaledVector(dir, len * 0.55);
    return { obj: S.merged(parts, 'steel'), tip, dir, clamp, rh };
  };

  // Collier à boulon en T autour du flexible (rayon int. du collier rc), axe +Y, centré.
  const tclamp = (rc, w = 0.019) => {
    const band = S.shell(rc + 0.0012, rc, w, 'zinc', { seg: 40 });
    const blk = [
      S.box(0.022, w * 0.8, 0.012, 'zinc', { r: 0.002, pos: [0.006, 0, rc + 0.007] }),
      S.box(0.022, w * 0.8, 0.012, 'zinc', { r: 0.002, pos: [-0.018, 0, rc + 0.007] }),
    ];
    const bolt = S.cyl(0.0032, 0.06, 'zinc', { axis: 'x', seg: 10, pos: [-0.004, 0, rc + 0.012] });
    const head = S.box(0.004, 0.012, 0.014, 'zinc', { pos: [-0.033, 0, rc + 0.012] });
    const nut = S.nut(0.011, 0.007, 'zinc', { axis: 'x', pos: [0.022, 0, rc + 0.012] });
    return S.merged([band, ...blk, bolt, head, nut], 'zinc');
  };

  // Pose : adaptateur + demi-brides + collier sur un orifice (pos, dir) ;
  // side = sens du coude. Les demi-brides gardent leur grand entraxe selon Y
  // (plots des pompes de P208 : grand axe vertical).
  const fit = (ref, kitRef, pos, dir, side, dash, angle, hoseIn, clampRef, clampR) => {
    const a = adapter(dash, angle, hoseIn);
    const ex = (k) => dir.map((v) => v * k);
    P(ref, orient(api, a.obj, pos, dir, side), ex(0.14));
    const sf = splitFlange(api, dash, 61);
    P(kitRef, orient(api, sf.obj, pos, dir, [1, 0, 0]), ex(0.07));
    const cl = tclamp(clampR);
    cl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.dir);
    cl.position.copy(a.clamp);
    const dw = orient(api, S.group(cl), pos, dir, side);
    // Éclaté du collier : dans l'axe de la douille, au-delà de son bout.
    const tipDir = new THREE.Vector3().copy(a.dir).applyQuaternion(dw.quaternion);
    P(clampRef, dw, ex(0.14).map((v, i) => v + tipDir.getComponent(i) * 0.12));
  };

  const R7 = (2.5 * IN) / 2 + 0.008; // collier 3 po sur flexible 2 1/2 po (paroi 8 mm)
  const R6 = (2.0 * IN) / 2 + 0.007; // collier 2 1/2 po sur flexible 2 po

  // Côté pompes (P208).
  fit('3', '9', PUMPS.s1.pos, PUMPS.s1.dir, [1, 0, 0], 40, 45, 2.5, '7', R7);
  fit('2', '8', PUMPS.s2.pos, PUMPS.s2.dir, [0, -1, 0], 32, 90, 2.0, '6', R6);
  // Pompe du diesel (emplacement estimé) : adaptateur droit 2 po.
  fit('4', '8', [-0.25, -0.05, -0.45], [0, 0, -1], [1, 0, 0], 32, 0, 2.0, '6', R6);
  // Côté réservoir (face z = -0.45, sorties vers +Z).
  fit('1', '9', [0.62, -0.06, -0.45], [0, 0, 1], [0, -1, 0], 40, 90, 2.5, '7', R7);
  fit('5', '9', [0.78, -0.15, -0.45], [0, 0, 1], [1, 0, 0], 40, 90, 2.0, '6', R6);
  fit('5', '9', [0.93, -0.15, -0.45], [0, 0, 1], [1, 0, 0], 40, 90, 2.0, '6', R6);

  return { view: { dir: [0.6, 0.7, 1.1] } };
}
