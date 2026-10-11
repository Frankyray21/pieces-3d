// P088 — Mâchoires des bras de serrage du carrousel Ø 3 1/2 po (89 mm)
// CX036781-350 rév. 0 (page 88) : « OPTION, CAROUSEL CLAMP ARM JAWS - Ø3.5"
// (89MM) », repère 13 de l'avance P028. Sur chacun des deux bras de serrage
// du carrousel (P108, non dessinés ici) : un insert « pouce » (2, CX036593)
// au fond de la gueule, côté arbre des bras, à face en V à 120° tangente à la
// tige, tenu par deux vis H 1/2-13 × 2 1/4 (3) passées depuis l'âme du bras ;
// un insert « doigt » (1, CX036592) au bout du doigt, à face cylindrique
// R 1.78 po et talon d'appui en haut, tenu par deux vis H 1/2-13 × 2 3/4 (4)
// passées depuis l'extérieur du doigt ; rondelles Nord-Lock (5) sous chaque
// tête. Marquages « CX03659x Ø3.5"/Ø89mm » non dessinés.
// Repère : celui de l'avance (placé à l'identité par P028) ; bras en position
// « à l'axe de forage » : jeux centrés sur l'axe de forage (x = 0, z = AX)
// aux hauteurs des deux bras FEED.clamp.arms, alignés sur la droite qui joint
// l'arbre des bras (FEED.clamp) à l'axe ; pouce côté arbre (+X), doigt de
// l'autre côté. L'âme des bras (3/4 po supposés) est entre les têtes de vis
// et les inserts. Encombrement ≈ 0.25 (X) × 0.98 (Y) × 0.08 (Z) m.
// Simulation : toutes les pièces suivent le corps « clamp » (rotation des
// bras autour de l'arbre FEED.clamp).
import { FEED } from '../feed.js';
import { body } from '../layout.js';
import { u, along, hhcs, nordLock } from '../../du311/parts/_avance_b.js';
import { basis, slabY, nlT } from './_feedcent.js';

const TH = { x0: 2.02, x1: 4.0, w: 3.0, h: 3.0 }; // pouce : sommet du V, dos, largeur, hauteur (po)
const FI = { r: 1.78, x1: -3.7, w: 3.0, h: 3.0, heel: 0.6 }; // doigt : face R, dos, largeur, hauteur, talon
const WEB = 0.75; // âme du bras (po)

export default function P088(api) {
  const { THREE, S } = api;
  const { merged, at } = S;
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const K = FEED.clamp, AX = FEED.AX;
  // Repère d'un jeu : origine sur l'axe de la tige, X vers l'arbre des bras.
  const X = new THREE.Vector3(K.x, 0, K.z - AX).normalize();
  const P = (ref, obj, y, e) => api.part(ref, body('clamp', basis(THREE, obj, X.toArray(), [0, 1, 0], [0, y, AX])), [X.x * e[0], e[1], X.z * e[0]]);
  // Extrusion d'un contour [x, z] (po) selon Y sur la hauteur h, centrée.
  const prism = (pts, h, mat = 'steel') => slabY(S, pts.map(([x, z]) => [u(x), u(z)]), -u(h / 2), u(h / 2), mat);

  // 2 — pouce : bloc, face en V (120°) vers la tige, arêtes abattues.
  const t30 = Math.tan(Math.PI / 6), hw = TH.w / 2;
  const thumb = merged([
    prism([[TH.x0 + hw * t30, -hw], [TH.x1 - 0.12, -hw], [TH.x1, -hw + 0.12], [TH.x1, hw - 0.12], [TH.x1 - 0.12, hw], [TH.x0 + hw * t30, hw], [TH.x0, 0]].reverse(), TH.h),
  ], 'steel');
  // 1 — doigt : face cylindrique R 1.78 vers la tige, talon d'appui sur le
  // dessus contre le bout du doigt, dos plat.
  const arc = [];
  const fa = Math.asin(FI.w / 2 / FI.r * 0.98);
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - fa + (2 * fa * i) / 16;
    arc.push([FI.r * Math.cos(a), FI.r * Math.sin(a)]);
  }
  const fingerPts = [[FI.x1 + 0.12, -FI.w / 2], ...arc.slice().reverse().map(([x, z]) => [x, z < 0 ? Math.max(z, -FI.w / 2) : Math.min(z, FI.w / 2)]), [FI.x1 + 0.12, FI.w / 2], [FI.x1, FI.w / 2 - 0.12], [FI.x1, -FI.w / 2 + 0.12]];
  const finger = merged([
    prism(fingerPts, FI.h),
    at(prism([[FI.x1, -FI.w / 2 + 0.12], [FI.x1 + 1.0, -FI.w / 2 + 0.12], [FI.x1 + 1.0, FI.w / 2 - 0.12], [FI.x1, FI.w / 2 - 0.12]], FI.heel), v(0, FI.h / 2 + FI.heel / 2, 0)),
  ], 'steel');

  for (const y of FEED.clamp.arms) {
    P('2', thumb.clone(), y, [0.08, 0.04]);
    P('1', finger.clone(), y, [-0.08, 0.04]);
    for (const dy of [-0.75, 0.75]) {
      // Pouce : vis par l'âme du bras, côté arbre (+X), tête sur l'âme.
      const xt = TH.x1 + WEB;
      P('5', along(THREE, nordLock(S, THREE, 0.5), [1, 0, 0], v(xt, dy, 0)), y, [0.14, 0]);
      P('3', along(THREE, hhcs(S, THREE, 0.5, 2.25), [1, 0, 0], v(xt + nlT(0.5), dy, 0)), y, [0.2, 0]);
      // Doigt : vis par l'extérieur du doigt (-X).
      const xf = FI.x1 - WEB;
      P('5', along(THREE, nordLock(S, THREE, 0.5), [-1, 0, 0], v(xf, dy, 0)), y, [-0.14, 0]);
      P('4', along(THREE, hhcs(S, THREE, 0.5, 2.75), [-1, 0, 0], v(xf - nlT(0.5), dy, 0)), y, [-0.2, 0]);
    }
  }
  return { view: { dir: [0.4, 0.5, 1.2] } };
}
