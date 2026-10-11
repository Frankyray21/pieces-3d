// P330 — Boîte de jonction de la pompe hydraulique CX012905 rév. 2 (page 330) :
// « HYDRAULIC PUMP JUNCTION BOX ». Assemblage orphelin (aucun parent dans le
// manuel) : coffret découpé en acier (1, CX016249) 6 × 8 × 4 po à couvercle
// à charnière et deux grenouillères, pattes de fixation haut et bas, étiquette
// « HPJB / HYDRAULIC PUMP JUNCTION BOX » (2) sur le couvercle, deux presse-
// étoupes étanches 1 po droits (3) dessus et dessous (vues de dessus et de
// dessous de la page 330).
// Repère machine (../layout.js), placé à l'identité : fixé sur la face
// intérieure du flanc droit du châssis avant, sous le pont, à côté de la boîte
// à bornes du moteur électrique de 60 HP du groupe de pompage (P208 rep. 9,
// x 0.31–0.93, axe à y = 0.74) ; couvercle tourné vers l'axe de la machine
// (−Z). Corps mobile « front » (pivote avec le châssis avant).
// Encombrement 0.15 (X) × 0.29 (Y, presse-étoupes compris) × 0.11 (Z) m.
import { M, body } from '../layout.js';
import { u } from './_cab.js';

export default function P330(api) {
  const { S } = api;
  const { box, lathe, merged, group, at, nameplate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e);
  const W = u(6), Hh = u(8), D = u(4); // coffret (X × Y × Z)
  const zb = M.frameZ - 0.015; // face intérieure du flanc droit (tôle de 30 mm)
  const x0 = 0.43, y0 = 0.7;
  const zc = zb - D / 2; // centre du coffret
  const zf = zb - D; // face du couvercle

  // ---------------------------------------------------------------- 1 — coffret
  // Caisson plié à bords tombés, fond à pattes haut et bas (deux trous chacune),
  // couvercle à bord tombé et joint, charnière piano côté −X, deux
  // grenouillères côté +X, vis de terre au fond ; quatre vis de fixation.
  const shell = merged([
    box(W, Hh, D - u(0.6), 'grey', { r: 0.003, pos: [0, 0, u(0.3)] }),
    box(W + u(0.1), Hh + u(1.6), u(0.075), 'grey', { r: 0.004, pos: [0, 0, D / 2 - u(0.04)] }), // fond à pattes
  ], 'grey');
  const lid = merged([
    box(W + u(0.12), Hh + u(0.12), u(0.6), 'grey', { r: 0.004, pos: [0, 0, -D / 2 + u(0.3)] }),
  ], 'grey');
  const gasket = box(W - u(0.1), Hh - u(0.1), u(0.06), 'rubber', { pos: [0, 0, -D / 2 + u(0.6) + u(0.03)] });
  const hinge = merged([
    S.cyl(u(0.09), Hh * 0.9, 'zinc', { seg: 10, pos: [-W / 2 - u(0.08), 0, -D / 2 + u(0.45)] }),
  ], 'zinc');
  const latches = merged([-1, 1].flatMap((s) => [
    box(u(0.25), u(0.55), u(0.35), 'zinc', { r: 0.001, pos: [W / 2 + u(0.12), s * Hh * 0.28, -D / 2 + u(0.85)] }),
    box(u(0.1), u(0.4), u(0.5), 'zinc', { pos: [W / 2 + u(0.22), s * Hh * 0.28, -D / 2 + u(0.45)] }),
    box(u(0.3), u(0.08), u(0.12), 'steel', { pos: [W / 2 + u(0.15), s * Hh * 0.28 + u(0.2), -D / 2 + u(0.25)] }),
  ]), 'zinc');
  // Pattes : trous Ø 5/16 (vis de fixation à tête bombée posées dessus).
  const screws = merged([-1, 1].flatMap((sy) => [-1, 1].map((sx) => at(
    lathe([[0, 0], [u(0.25), 0], [u(0.25), u(0.06)], [u(0.18), u(0.14)], [0, u(0.16)]], 'zinc', { seg: 12 }),
    [sx * u(1.9), sy * (Hh / 2 + u(0.5)), D / 2 - u(0.08)], [-Math.PI / 2, 0, 0]))), 'zinc');
  const box1 = group(shell, lid, gasket, hinge, latches, screws);
  box1.position.set(x0, y0, zc);
  F('1', box1, [0, 0, -0.12]);

  // ---------------------------------------------------------------- 2 — étiquette
  const lab = nameplate(u(3.1), u(1.2), { material: 'white', ink: 'black' });
  lab.rotation.y = Math.PI; // face vers −Z
  lab.position.set(x0, y0 + u(1.0), zf - 0.0001);
  F('2', lab, [0, 0, -0.2]);

  // ---------------------------------------------------------------- 3 — presse-étoupes 1 po (×2)
  // Écrou de cloison six-pans 1 7/16, corps six-pans, chapeau moleté et bague
  // d'étanchéité ; dessus et dessous du coffret, dans l'axe.
  const gland = () => group(
    merged([
      lathe([[u(0.6), -u(0.18)], [u(0.83), -u(0.18)], [u(0.83), 0], [u(0.6), 0]], 'zinc', { seg: 6 }),
      lathe([[u(0.55), 0.0005], [u(0.85), 0.0005], [u(0.85), u(0.32)], [u(0.55), u(0.32)]], 'zinc', { seg: 6 }),
    ], 'zinc'),
    merged([
      lathe([[u(0.42), u(0.32)], [u(0.78), u(0.32)], [u(0.8), u(0.38)], [u(0.8), u(0.82)], [u(0.7), u(0.92)], [u(0.42), u(0.92)]], 'plastic', { seg: 20 }),
    ], 'plastic'),
  );
  const g1 = gland();
  g1.position.set(x0 + u(1.2), y0 + Hh / 2, zc - u(0.2));
  F('3', g1, [0, 0.08, 0]);
  const g2 = gland();
  g2.rotation.x = Math.PI;
  g2.position.set(x0, y0 - Hh / 2, zc - u(0.2));
  F('3', g2, [0, -0.08, 0]);
  return { view: { dir: [0.4, 0.5, -1.2] } };
}
