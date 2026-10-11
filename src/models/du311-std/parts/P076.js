// P076 — Rampes de tiges Ø 3 1/2 po (89 mm), carrousel 17 tiges
// CX036538-350 rév. 0 (page 76) : « OPTION, PIPE RAMP - Ø3.5" (89MM) - 17
// PIPE », repère 11 de l'avance P028. Deux sabots d'acier (1, CX036540) à
// arêtes verticales arrondies, boulonnés sur la tôle fixe du bas du
// carrousel de part et d'autre de l'alvéole de transfert (celle que
// viennent prendre les bras de serrage) : le bout fileté de la tige glisse
// sur leur dessus en pente douce quand le carrousel tourne, une joue cintrée
// côté extérieur la tient dans l'alvéole. Chaque sabot est tenu par deux vis
// H 3/4-10 × 3 1/2 (2) et leurs rondelles Nord-Lock (3) : l'une par le
// dessus (tête sur le sabot, côté opposé à la tige), l'autre par le dessous
// de la tôle, son bout fileté dépassant du sabot comme un téton.
// Repère : celui de l'avance (placé à l'identité par P028) ; dessus des
// sabots à y = FEED.car.y0 + 0,0375 (hauteur de la pointe des tiges rangées,
// STORE de la simulation), sabots de part et d'autre de FEED.transfer, le
// long de la tangente au cercle des alvéoles. La tôle du carrousel (P108)
// est sous les sabots (3/4 po supposés). Encombrement ≈ 0.27 × 0.15 × 0.12 m.
// Cotes : vis (liste) ; sabots 3 × 2 1/2 × 3 1/2 po, joue de 1/4 po d'après
// les proportions de la page 76 (vis 3/4 po pour l'échelle).
import { FEED } from '../feed.js';
import { u, along, hhcs, nordLock } from '../../du311/parts/_avance_b.js';
import { basis, slabZ, roundRect, nlT, sheet } from './_feedcent.js';

const BLK = { w: 3.0, h: 2.5, d: 3.5, r: 0.45 }; // sabot (po) : le long de la tangente, hauteur, radial
const PLATE = 0.75; // tôle du carrousel sous les sabots (po)

export default function P076(api) {
  const { THREE, S } = api;
  const { merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const C = FEED.car, T = FEED.transfer;
  const top = C.y0 + 0.0375;
  // Repère d'un sabot : origine au centre du dessus, X le long de la tangente
  // (en s'éloignant de la tige), Z radial vers l'extérieur du carrousel, Y haut.
  const rad = new THREE.Vector3(T[0] - C.x, 0, T[1] - C.z).normalize();
  const tan = new THREE.Vector3(-rad.z, 0, rad.x);
  const PIPE_R = 1.75, GAP = 0.25;

  for (const k of [1, -1]) {
    const X = tan.clone().multiplyScalar(k);
    // Z local = X × Y : côté extérieur du carrousel en zs = ±1.
    const zs = Math.sign(new THREE.Vector3().crossVectors(X, new THREE.Vector3(0, 1, 0)).dot(rad));
    const off = u(PIPE_R + GAP + BLK.w / 2);
    const pos = [T[0] + X.x * off, top, T[1] + X.z * off];
    const frame = (obj) => basis(THREE, obj, X.toArray(), [0, 1, 0], pos);
    // Sabot : prisme à arêtes verticales arrondies (contour XZ extrudé selon Y),
    // dessus abattu en pente vers la tige (entrée de la pointe), deux trous.
    const outline = roundRect(0, 0, u(BLK.w), u(BLK.d), u(BLK.r), 4);
    const holes = [[u(0.7), -u(-zs * 0.8), u(0.41)], [u(-0.6), -u(zs * 0.8), u(0.38)]];
    const body = sheet(S, THREE, outline.map(([x, z]) => [x, -z]), u(BLK.h - 0.35), 'grey', holes);
    body.rotation.x = -Math.PI / 2;
    body.position.y = -u(BLK.h - 0.35) / 2 - u(0.35);
    // Pente d'entrée : dessus en coin (0,35 po de haut côté tige, plat côté opposé).
    const ramp = [[-BLK.w / 2 + BLK.r, -0.35], [BLK.w / 2 - 0.2, -0.35], [BLK.w / 2 - 0.2, 0], [-0.2, 0], [-BLK.w / 2, -0.3]].map(([x, y]) => [u(x), u(y)]);
    const wedge = slabZ(S, ramp, -u(BLK.d / 2 - BLK.r), u(BLK.d / 2 - BLK.r), 'grey');
    // Joue cintrée côté extérieur (Z+), soudée sur le flanc, relevée de 1 1/2 po.
    const cheek = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * (Math.PI / 2);
      cheek.push([-BLK.w / 2 + 0.1 + (BLK.w - 0.3) * (i / 10), 1.5 * Math.sin(a) * (1 - i / 14)]);
    }
    const cheekPts = [[-BLK.w / 2 + 0.1, -BLK.h + 0.2], [BLK.w / 2 - 0.2, -BLK.h + 0.2], ...cheek.slice().reverse()].map(([x, y]) => [u(x), u(y)]);
    const zc0 = zs * BLK.d / 2, zc1 = zs * (BLK.d / 2 + 0.25);
    const cheekM = slabZ(S, cheekPts, u(Math.min(zc0, zc1)), u(Math.max(zc0, zc1)), 'grey');
    const bead = S.weld([v(-BLK.w / 2 + 0.2, -BLK.h + 0.3, zs * (BLK.d / 2 + 0.3)), v(BLK.w / 2 - 0.3, -BLK.h + 0.3, zs * (BLK.d / 2 + 0.3))], u(0.18), 'grey');
    const blk = group(merged([body, wedge, cheekM], 'grey'), bead);
    blk.children[0].userData.hasInterior = true;
    P('1', frame(blk), [X.x * 0.08, 0.12, X.z * 0.08]);
    // Vis 1 : par le dessus, tête sur le sabot (côté opposé à la tige).
    P('3', frame(at(nordLock(S, THREE, 0.75), v(0.7, 0, zs * 0.8))), [X.x * 0.08, 0.2, X.z * 0.08]);
    P('2', frame(at(hhcs(S, THREE, 0.75, 3.5), v(0.7, nlT(0.75), zs * 0.8))), [X.x * 0.08, 0.28, X.z * 0.08]);
    // Vis 2 : par le dessous de la tôle, bout fileté dépassant du sabot.
    const yb = -BLK.h - PLATE;
    P('3', frame(along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], v(-0.6, yb, -zs * 0.8))), [X.x * 0.08, -0.12, X.z * 0.08]);
    P('2', frame(along(THREE, hhcs(S, THREE, 0.75, 3.5), [0, -1, 0], v(-0.6, yb - nlT(0.75), -zs * 0.8))), [X.x * 0.08, -0.2, X.z * 0.08]);
  }
  return { view: { dir: [0.6, 0.8, 1.2] } };
}
