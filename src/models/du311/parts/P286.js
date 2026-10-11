// P286 — Remplissage déporté et jauge d'huile du compresseur surpresseur
// Le Roi : CM48001-0700M « FILL CAP - DIP STICK » (page 286 ; ligne 3 de
// P282). Bride-tube de jauge mécano-soudée (2) posée sur son joint (3) sur la
// joue +Z du carter (P296), sous le cylindre à +60° (trou Ø 11/16 po percé
// dans le carter à travers la bride, d'après la note du dessin) : semelle
// rectangulaire, bloc, tube de jauge incliné vers le haut et l'extérieur ;
// jauge (8) à poignée en T, lame plongeant dans le carter. Sur la face +Z du
// bloc : raccord de boyau 1 po (6), boyau de remplissage (5) tenu par deux
// colliers à vis (7), qui monte vers la bride de remplissage (4) déportée en
// haut à +Z, coiffée du reniflard à clapet et couvercle articulé (1, même
// ensemble que P296 rep. 6 ; une ligne = l'ensemble).
// Repère du bloc (_moteur_surpresseur.js, inséré à l'origine par P282) :
// origine sur l'axe du vilebrequin au droit du cylindre central, +X vers la
// poulie, Y vers le haut, +Z = X × Y. Bride sur la joue z = LR.halfW = 0.125,
// centrée x = −0.075, y = −0.075 ; bride de remplissage à (−0.075, 0.30,
// 0.42), dessus du reniflard à y ≈ 0.345 (vues de P282).
// Encombrement ≈ 0.04 (X) × 0.49 (y −0.145 au bout de la lame → 0.345) ×
// 0.33 (z 0.10 → 0.43) m. Longueur du boyau « variable selon l'application »
// (dessin) : tracé estimé d'après la vue de bout de P282.

import { LR, IN, MM, lrPrism, lrRoundRect, lrCircle } from './_moteur_surpresseur.js';

export default function P286(api) {
  const { S, THREE } = api;
  const { lathe, box, tube, cyl, spring, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const X = -0.075, Yc = -0.075, zW = LR.halfW;
  // Prisme d'axe Z : contour [[x, y], …] de z = za à zb (centré sur X, Yc).
  const prismZ = (outline, holes, za, zb, mat) => {
    const m = lrPrism(api, outline, holes, 0, zb - za, mat);
    // +Y local → +Z ; Z local → −Y.
    m.rotation.x = Math.PI / 2;
    m.position.set(X, Yc, za);
    return m;
  };
  // Les contours de prismZ sont donnés en (x, y) : Z local = −y.
  const xy = (pts) => pts.map(([x, y]) => [x, -y]);
  const slot = [];
  for (let k = 0; k <= 10; k++) { const a = (Math.PI * k) / 10; slot.push([4 * MM * Math.cos(a), 10 * MM + 4 * MM * Math.sin(a)]); }
  for (let k = 0; k <= 10; k++) { const a = Math.PI + (Math.PI * k) / 10; slot.push([4 * MM * Math.cos(a), -10 * MM + 4 * MM * Math.sin(a)]); }
  const holes2 = [lrCircle(3.6 * MM, 10, 0, 28 * MM), lrCircle(3.6 * MM, 10, 0, -28 * MM)];
  const outline = lrRoundRect(0.04, 0.075, 6 * MM, 4);

  // ---------------------------------------------------------------- 3 — joint de bride
  const tG = 0.8 * MM;
  P('3', prismZ(xy(outline), [xy(slot), ...holes2.map(xy)], zW, zW + tG, 'cream'), [0, 0, 0.03]);

  // ---------------------------------------------------------------- 2 — bride-tube de jauge
  const z1 = zW + tG + 6 * MM; // face extérieure de la semelle
  const zB = z1 + 30 * MM; // face +Z du bloc
  // Tube de jauge Ø 1/2 po : du dessus du bloc, incliné vers le haut et l'extérieur.
  const tubePts = [[X, Yc + 22 * MM, z1 + 16 * MM], [X, 0.0, 0.165], [X, 0.07, 0.2], [X, 0.13, 0.222]];
  const weld = group(
    merged([
      prismZ(xy(outline), holes2.map(xy), zW + tG, z1, 'black'),
      box(0.03, 0.045, zB - z1, 'black', { r: 2 * MM, pos: [X, Yc, (z1 + zB) / 2] }),
      tube(tubePts, 0.25 * IN, 'black', { seg: 24, radial: 12, tension: 0.4 }),
    ], 'black'),
  );
  // Collerette du bout de tube, orientée selon la tangente.
  {
    const a = new THREE.Vector3(...tubePts[2]), b = new THREE.Vector3(...tubePts[3]);
    const col = lathe([[0.25 * IN - 0.3 * MM, -6 * MM], [8 * MM, -6 * MM], [8 * MM, 1 * MM], [0.25 * IN - 0.3 * MM, 1 * MM], [0.25 * IN - 0.3 * MM, -6 * MM]], 'black', { seg: 16 });
    col.position.copy(b);
    col.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    weld.add(col);
  }
  P('2', weld, [0, 0, 0.06]);

  // ---------------------------------------------------------------- 8 — jauge
  // Tige dans le tube, poignée en T au bout, lame dans le carter.
  const t3 = new THREE.Vector3(...tubePts[3]), t2 = new THREE.Vector3(...tubePts[2]);
  const dir = t3.clone().sub(t2).normalize();
  const top = t3.clone().add(dir.clone().multiplyScalar(0.012));
  const handle = group(
    lathe([[0, 0], [5 * MM, 0], [5 * MM, 9 * MM], [0, 9 * MM]], 'rubber', { seg: 16 }),
    cyl(4 * MM, 0.04, 'yellow', { axis: 'x', pos: [0, 13 * MM, 0] }),
  );
  handle.position.copy(top);
  handle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const rod = tube([[X, Yc - 70 * MM, zW - 22 * MM], [X, Yc - 10 * MM, zW - 6 * MM], [X, Yc + 8 * MM, z1 + 12 * MM], ...tubePts.slice(1), top.toArray()], 2.2 * MM, 'steel', { seg: 48, radial: 8, tension: 0.3 });
  P('8', group(rod, handle), [0, 0.12, 0.05]);

  // ---------------------------------------------------------------- 6 — raccord de boyau 1 po
  // Filet dans le bloc, six-pans, douille cannelée (le long de +Z).
  const fit = lathe([[0, -8 * MM], [10 * MM, -8 * MM], [10 * MM, 0], [14.5 * MM, 0], [14.5 * MM, 10 * MM], [11 * MM, 11 * MM],
    [11 * MM, 15 * MM], [12.5 * MM, 17 * MM], [11 * MM, 22 * MM], [12.5 * MM, 24 * MM], [11 * MM, 29 * MM], [12.5 * MM, 31 * MM], [10 * MM, 36 * MM], [0, 36 * MM]], 'brass', { seg: 20 });
  // Six-pans : on écrase la bague 0-10 mm en hexagone (seg 6).
  const hex = lathe([[0, 0], [15.5 * MM, 0], [15.5 * MM, 10 * MM], [0, 10 * MM]], 'brass', { seg: 6 });
  const fitting = at(group(fit, hex), [X, Yc, zB], [Math.PI / 2, 0, 0]);
  P('6', fitting, [0, 0, 0.1]);

  // ---------------------------------------------------------------- 5 — boyau de remplissage 1 po
  const zH0 = zB + 12 * MM; // bout du boyau sur la douille
  const yF = 0.30; // dessous de la bride de remplissage 4
  const zF = 0.42;
  const hosePts = [[X, Yc, zH0], [X, Yc, zB + 45 * MM], [X, -0.02, 0.215], [X, 0.06, 0.3], [X, 0.13, 0.4], [X, 0.18, zF], [X, yF - 30 * MM, zF]];
  P('5', tube(hosePts, 17 * MM, 'hose', { seg: 64, radial: 16, tension: 0.4, ends: 'none' }), [0, 0.02, 0.14]);

  // ---------------------------------------------------------------- 7 — colliers à vis (2)
  const clamp = () => group(
    lathe([[17.6 * MM, -6 * MM], [18.6 * MM, -6 * MM], [18.6 * MM, 6 * MM], [17.6 * MM, 6 * MM], [17.6 * MM, -6 * MM]], 'zinc', { seg: 36 }),
    box(8 * MM, 12 * MM, 12 * MM, 'zinc', { pos: [0, 0, 22 * MM] }),
    cyl(3 * MM, 16 * MM, 'zinc', { axis: 'x', pos: [0, 0, 26.5 * MM] }),
  );
  const c1 = clamp();
  c1.rotation.x = Math.PI / 2;
  c1.position.set(X, Yc, zH0 + 14 * MM);
  P('7', c1, [0, 0, 0.18]);
  const c2 = clamp();
  c2.position.set(X, yF - 14 * MM, zF);
  P('7', c2, [0, 0.05, 0.04]);

  // ---------------------------------------------------------------- 4 — bride de remplissage et de reniflard
  P('4', merged([
    lathe([[11 * MM, yF - 32 * MM], [13 * MM, yF - 32 * MM], [14 * MM, yF - 26 * MM], [13 * MM, yF - 20 * MM], [14 * MM, yF - 14 * MM], [13.5 * MM, yF], [36 * MM, yF],
      [36 * MM, yF + 6 * MM], [16 * MM, yF + 6 * MM], [16 * MM, yF + 12 * MM], [11 * MM, yF + 12 * MM], [11 * MM, yF - 32 * MM]], 'castAlu', { seg: 36, pos: [X, 0, zF] }),
    ...[0, 1, 2].map((k) => {
      const a = (k * 2 * Math.PI) / 3 + Math.PI / 6;
      return cyl(3.5 * MM, 6.4 * MM, 'black', { pos: [X + 28 * MM * Math.cos(a), yF + 3 * MM, zF + 28 * MM * Math.sin(a)] });
    }),
  ], 'castAlu'), [0, 0.08, 0]);

  // ---------------------------------------------------------------- 1 — reniflard (ensemble)
  // Corps à queue filetée, clapet, tige et ressort, couvercle bombé articulé.
  const y0 = yF + 12 * MM;
  const br = group(
    merged([
      lathe([[5 * MM, y0 - 10 * MM], [8.3 * MM, y0 - 10 * MM], [8.3 * MM, y0], [15 * MM, y0 + 1 * MM], [16 * MM, y0 + 4 * MM],
        [16 * MM, y0 + 14 * MM], [14.5 * MM, y0 + 14 * MM], [14.5 * MM, y0 + 5 * MM], [9 * MM, y0 + 3 * MM], [5 * MM, y0 + 3 * MM], [5 * MM, y0 - 10 * MM]], 'castAlu', { seg: 28 }),
      lathe([[0, y0 + 14 * MM], [17 * MM, y0 + 14 * MM], [17 * MM, y0 + 17 * MM], [14 * MM, y0 + 20 * MM], [0, y0 + 21 * MM]], 'castAlu', { seg: 28 }),
      box(10 * MM, 7 * MM, 12 * MM, 'castAlu', { r: 2 * MM, pos: [19 * MM, y0 + 15 * MM, 0] }),
    ], 'castAlu'),
    merged([
      lathe([[0, y0 - 4 * MM], [1.5 * MM, y0 - 4 * MM], [1.5 * MM, y0 + 14 * MM], [0, y0 + 14 * MM]], 'steel', { seg: 10 }),
      spring(4 * MM, 0.5 * MM, 7 * MM, 4, 'steel', { pos: [0, y0 + 8 * MM, 0], perTurn: 12, radial: 5 }),
      cyl(1.5 * MM, 16 * MM, 'steel', { axis: 'z', seg: 10, pos: [21 * MM, y0 + 13.5 * MM, 0] }),
    ], 'steel'),
    lathe([[1.6 * MM, y0 + 3 * MM], [12 * MM, y0 + 3 * MM], [12 * MM, y0 + 4.2 * MM], [1.6 * MM, y0 + 4.2 * MM], [1.6 * MM, y0 + 3 * MM]], 'rubber', { seg: 28 }),
  );
  br.position.set(X, 0, zF);
  P('1', br, [0, 0.14, 0]);

  return { view: { dir: [0.4, 0.5, 1.2] } };
}
