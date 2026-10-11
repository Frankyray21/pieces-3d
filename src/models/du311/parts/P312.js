// P312 — Purge manuelle du filtre d'admission d'air CX034671 rév. 0 (page
// 312) : « ASS'Y, MANUAL DRAIN - AIR INLET FILTER », repère 13 du surpresseur
// P274 (au pied des filtres d'admission de l'ensemble P314). Équerre en tôle
// (2) : platine verticale à deux boutonnières (fixation sur le support des
// filtres), patte horizontale arrondie percée Ø 1 1/16 po ; traversée de
// cloison MNPT-JIC -12 avec écrou (4) dans la patte, cône JIC vers le bas
// (boyau d'évacuation) ; vanne à bille 3/4 po (1) vissée dessus, tige vers
// -Z, levier tourné vers -X (vanne fermée, comme au dessin) ; coude 90°
// MNPT-JIC -12 (3) en tête, sortie vers -X (boyau venant du bol du filtre).
// Repère : origine au centre du trou de la patte, sur sa face supérieure ;
// Y vers le haut (axe de la vanne), +Z vers la platine verticale (face
// arrière de la platine = face d'appui à z = 0.030) ; vue de la page 312
// prise du côté -Z (la droite du dessin est -X).
// Encombrement ≈ 0.17 (X, de -0.03 au bout du levier à 0.14) × 0.24 (Y, de
// -0.12 à 0.12) × 0.06 (Z) m.
// Cotes : raccords et vanne d'après la liste ; équerre estimée d'après les
// proportions du dessin (rien n'est coté).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const T = I(0.1875); // équerre 3/16 po
const ZP = I(1.0); // face avant de la platine verticale (côté vanne)
const VB = I(1.35); // demi-longueur du corps de vanne

export default function P312(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, weld, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);

  // ------------------------------------------------------------ 2 — équerre
  // Patte horizontale (bout arrondi R 7/8 autour du trou), pli à 90° vers le
  // bas, platine 1 3/4 × 4 1/2 po à bord inférieur biseauté, deux boutonnières.
  const tab = new THREE.Shape();
  const R = I(0.875);
  tab.moveTo(-R, ZP);
  tab.lineTo(-R, 0);
  tab.absarc(0, 0, R, Math.PI, 0, false);
  tab.lineTo(R, ZP);
  tab.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, I(0.53), 0, Math.PI * 2, true); tab.holes.push(hole);
  const tg = new THREE.ExtrudeGeometry(tab, { depth: T, bevelEnabled: false, curveSegments: 20 });
  tg.rotateX(Math.PI / 2); // plan XZ, épaisseur vers -Y
  const W = I(1.75), Hp = I(4.5);
  const pl = new THREE.Shape([[-W / 2, 0], [W / 2, 0], [W / 2, -Hp], [-W / 2 + I(0.6), -Hp], [-W / 2, -Hp + I(1.2)]].map(([x, y]) => new THREE.Vector2(x, y)));
  for (const yc of [-I(1.6), -I(3.4)]) {
    const sl = new THREE.Path();
    sl.absarc(0, yc + I(0.45), I(0.2), 0, Math.PI, false);
    sl.absarc(0, yc - I(0.45), I(0.2), Math.PI, Math.PI * 2, false);
    sl.closePath();
    pl.holes.push(sl);
  }
  const pg = new THREE.ExtrudeGeometry(pl, { depth: T, bevelEnabled: false, curveSegments: 10 });
  pg.translate(0, 0, ZP);
  const bracket = merged([new THREE.Mesh(S.creaseNormals(tg)), new THREE.Mesh(S.creaseNormals(pg))], 'grey');
  P('2', group(bracket, weld([[-W / 2 + I(0.1), -T, ZP - I(0.04)], [W / 2 - I(0.1), -T, ZP - I(0.04)]], I(0.14), 'grey')), [0, 0, 0]);

  // ------------------------------------------------------------ 4 — traversée de cloison MNPT-JIC -12
  // Six-pans sous la patte, écrou de blocage dessus, mâle 3/4 NPT vers la vanne.
  P('4', O(ACC.bulkhead(S, { a: 12, b: 12, through: T }), [0, -T, 0], [0, -1, 0], [1, 0, 0]), [0, -0.1, 0]);

  // ------------------------------------------------------------ 1 — vanne à bille 3/4 po
  // Corps acier six-pans 1 1/4 aux deux bouts, boisseau Ø 1 5/8, tige et
  // écrou, levier plat 5 po tourné vers +X, gaine vinyle rouge au bout.
  const yv = I(0.95); // bas du corps (engagement de la traversée)
  const vb = group(
    merged([
      lathe([[I(0.4), 0], [I(0.72), 0], [I(0.72), I(0.6)], [I(0.45), I(0.62)], [0, I(0.62)]], 'steel', { seg: 6 }),
      lathe([[0, I(0.6)], [I(0.8), I(0.62)], [I(0.82), VB], [I(0.8), 2 * VB - I(0.62)], [0, 2 * VB - I(0.6)]], 'steel', { seg: 24 }),
      lathe([[0, 2 * VB - I(0.62)], [I(0.72), 2 * VB - I(0.62)], [I(0.72), 2 * VB], [I(0.4), 2 * VB], [I(0.4), 2 * VB - I(0.3)], [0, 2 * VB - I(0.3)]], 'steel', { seg: 6 }),
      lathe([[0, 0], [I(0.3), 0], [I(0.3), I(0.45)], [0, I(0.45)]], 'steel', { seg: 16, axis: 'z', pos: [0, VB, I(0.75)] }),
    ], 'steel'),
    merged([
      lathe([[0, 0], [I(0.12), 0], [I(0.12), I(0.25)], [0, I(0.25)]], 'zinc', { seg: 10, axis: 'z', pos: [0, VB, I(1.25)] }),
      at(S.nut(I(0.375), I(0.18), 'zinc', { axis: 'z' }), [0, VB, I(1.42)]),
    ], 'zinc'),
    merged([
      box(I(3.4), I(0.42), I(0.1), 'zinc', { pos: [I(1.55), VB, I(1.3)] }),
      box(I(1.6), I(0.42), I(0.1), 'zinc', { pos: [I(3.95), VB + I(0.28), I(1.3)], rot: [0, 0, 0.38] }),
    ], 'zinc'),
    box(I(1.3), I(0.56), I(0.3), 'red', { r: I(0.12), pos: [I(4.25), VB + I(0.4), I(1.3)], rot: [0, 0, 0.38] }),
  );
  P('1', at(vb, [0, yv, 0], [0, Math.PI, 0]), [0, 0.05, 0]);

  // ------------------------------------------------------------ 3 — coude 90° MNPT-JIC -12
  P('3', O(ACC.elbow(S, { a: 12, b: 12 }), [0, yv + 2 * VB, 0], [0, 1, 0], [-1, 0, 0]), [0, 0.1, 0]);

  return { view: { dir: [-0.6, 0.5, -1.2] } };
}
