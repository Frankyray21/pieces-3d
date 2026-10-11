// P160 — Trousse de raccords rapides Ø 1/4 po CX036910 rév. 1 (page 160) :
// « QUICK DISCONNECT KIT - Ø1/4" », repère 40 de l'avance P032. Deux
// coupleurs complets à clapets (type ISO 7241-1 A, 1/4 NPT) : douille femelle
// (4, CX000530) à bague de verrouillage et billes, embout mâle (3, CX000529)
// à gorge de billes et clapet ; chaque moitié porte son obturateur en
// plastique noir sur une attache souple dont l'anneau entoure le col sous le
// six pans : bouchon de douille (2, CP001821, disque et téton) et capuchon
// d'embout (1, CP001820, godet sur disque).
// Comme la page 160 : à gauche, douille (embouchure en bas) au-dessus de
// l'embout (nez en haut) ; à droite, la paire retournée (embout en haut, nez
// en bas, douille dessous) ; attaches tendues vers l'extérieur. Vue assemblée :
// les deux coupleurs accouplés (nez engagé de 12 mm, billes dans la gorge) ;
// vue éclatée : désaccouplés dans l'axe, obturateurs dégagés du col.
// Repère : origine à mi-chemin des deux coupleurs, dans le plan de
// l'embouchure des douilles ; Y vers le haut (axes des coupleurs verticaux en
// x = ±0.045), X de gauche à droite de la page, Z vers l'observateur.
// Encombrement ≈ 0.28 (X) × 0.10 (Y, de −0.05 à +0.05) × 0.09 (Z) m.
// Cotes : série 1/4 ISO A de catalogue (douille Ø 24 × 41 mm, six pans 3/4 po ;
// embout six pans 11/16 po, nez Ø 12.6 mm, 1/4 NPT) ; attaches d'après les
// proportions du dessin (≈ 75 mm entre anneau et obturateur). Emplacement sur
// l'avance non dessiné : trousse en vrac, P032 la place à sa convenance.
// qdKit() sert aussi à P162 (Ø 3/8 po).

const IN = 0.0254;

/**
 * Trousse de deux coupleurs rapides avec obturateurs attachés.
 * o : { k (échelle des profils, 1 = série 1/4), hexF / hexM (surplats, m),
 *       tether (entraxe anneau → obturateur, m), dx (demi-écart des paires, m),
 *       ref: { female, male, plug, cap } }.
 */
export function qdKit(api, o) {
  const { lathe, thread, nut, ring, cyl, box, ball, merged, at, group } = api.S;
  const k = o.k;
  const m = (v) => v * 0.001 * k; // profils en mm à l'échelle de la série
  const L = (pts, mat, seg = 32) => lathe(pts.map(([r, y]) => [m(r), m(y)]), mat, { seg });
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------- douille femelle
  // Embouchure à y = 0 vers −Y ; corps zingué (alésage de la douille, fond
  // et clapet, gradin, col, six pans percé 1/4 NPT), bague de verrouillage
  // en acier à deux gorges de préhension, six billes dans l'embouchure.
  const female = () => {
    const body = merged([
      L([
        [0, 12.5], [7.0, 12.5], [7.0, 0.5], [7.5, 0], [9.0, 0], [9.4, 0.4], [9.4, 22], [10.5, 22.6], [10.5, 26.6],
        [8.0, 27.4], [8.0, 31.5], [5.0, 31.5], [5.0, 20], [0, 20],
      ], 'zinc', 32),
      at(nut(o.hexF, m(10), 'zinc'), [0, m(36.5), 0]),
      // filet intérieur 1/4 NPT suggéré dans le six pans
      L([[5.2, 41.6], ...thread(5.2, 33, 41.6, { pitch: 1.4, maxTurns: 6, chamferBottom: false }).map(([r, y]) => [10.4 - r, y]).reverse(), [5.0, 33]].reverse(), 'zinc', 20),
    ], 'zinc');
    body.userData.hasInterior = true;
    const sleeve = L([
      [9.5, 0.6], [11.4, 0.6], [12, 1.2], [12, 4.5], [11.3, 5.2], [11.3, 6.8], [12, 7.5], [12, 9.5], [11.3, 10.2], [11.3, 11.8],
      [12, 12.5], [12, 20.6], [11.4, 21.6], [9.5, 21.6], [9.5, 0.6],
    ], 'steel', 40);
    const balls = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      balls.push(ball(m(1.4), 'chrome', { pos: [m(7.6) * Math.cos(a), m(3), m(7.6) * Math.sin(a)] }));
    }
    // clapet : face de la soupape en retrait dans l'alésage
    const poppet = L([[0, 9.5], [3.2, 9.5], [3.6, 10.0], [3.6, 12.4], [0, 12.4]], 'steel', 24);
    return group(body, sleeve, merged(balls, 'chrome'), poppet);
  };

  // ---------------------------------------------------- embout mâle
  // Dessus du six pans à y = 0, nez vers +Y : queue 1/4 NPT sous le six pans,
  // collerette, nez à gorge de billes, alésage et tige du clapet.
  const male = () => group(
    merged([
      L([
        [0, -19], ...thread(6.85, -19, -9.5, { r1: 7.1, pitch: 1.4, maxTurns: 7 }), [5.5, -9.5], [5.5, 0.6],
        [7.6, 0.6], [7.6, 2.2], [6.3, 3.0], [6.3, 8.6], [5.3, 9.4], [5.3, 12.4], [6.3, 13.2], [6.3, 18.6], [5.6, 20],
        [3.3, 20], [3.3, 15], [0, 15],
      ], 'zinc', 32),
      at(nut(o.hexM, m(9), 'zinc'), [0, -m(4.5), 0]),
    ], 'zinc'),
    L([[0, 15], [2.3, 15], [2.3, 20.6], [1.9, 21.3], [0, 21.3]], 'steel', 16),
  );

  // ---------------------------------------------------- attaches
  // Anneau (plan XZ, à y), lanière plate selon l'azimut az, obturateur au bout.
  const tether = (rIn, y, az, end) => {
    const t = m(1.5), rOut = rIn + m(3.2), rd = m(12.5), Lt = o.tether;
    const dir = [Math.cos(az), 0, Math.sin(az)];
    const len = Lt - rOut - rd + m(2);
    const strap = box(len, t, m(4.5), 'plastic');
    strap.rotation.y = -az;
    strap.position.set(dir[0] * (rOut + len / 2 - m(1)), y, dir[2] * (rOut + len / 2 - m(1)));
    const c = [dir[0] * Lt, y, dir[2] * Lt];
    return merged([
      ring(rOut, rIn, t, 'plastic', { seg: 32, pos: [0, y, 0] }),
      strap,
      cyl(rd, t, 'plastic', { seg: 32, pos: c }),
      at(end, c),
    ], 'plastic');
  };
  // Bouchon de douille : téton sous le disque, petite prise dessus.
  const plugEnd = () => group(
    L([[0, -9.5], [6.4, -9.5], [6.8, -8.5], [6.8, -2.5], [6.2, -1.6], [6.6, -0.7], [0, -0.7]], 'plastic', 28),
    L([[0, 0.7], [4, 0.7], [4, 2.4], [3.4, 3], [0, 3]], 'plastic', 24),
  );
  // Capuchon d'embout : godet ouvert vers le haut, posé sur le disque.
  const capEnd = () => L([
    [0, 0.7], [9.2, 0.7], [9.6, 1.2], [9.6, 21], [9.0, 22], [7.4, 22], [7.2, 21.4], [7.2, 2.2], [0, 2.2],
  ], 'plastic', 32);

  // ---------------------------------------------------- deux paires
  // Paire gauche dans son repère (douille en haut), paire droite = même
  // paire tournée de 180° autour de Z (éclaté retourné de même).
  const YM = -8; // dessus du six pans de l'embout accouplé (nez engagé de 12 mm)
  for (const s of [-1, 1]) {
    const place = (obj) => (s < 0 ? at(group(obj), [-o.dx, 0, 0]) : at(group(obj), [o.dx, 0, 0], [0, 0, Math.PI]));
    const E = (e) => (s < 0 ? e : [-e[0], -e[1], e[2]]);
    const azF = Math.PI + 0.45, azM = Math.PI - 0.4; // attaches vers l'extérieur (−X local)
    P(o.ref.female, place(female()), E([0, 0.04, 0]));
    P(o.ref.plug, place(tether(m(8.3), m(29.5), azF, plugEnd())), E([0, 0.08, 0]));
    P(o.ref.male, place(at(male(), [0, m(YM), 0])), E([0, -0.035, 0]));
    P(o.ref.cap, place(tether(m(7.9), m(YM + 0.75), azM, capEnd())), E([0, -0.07, 0]));
  }
  return { view: { dir: [0.45, 0.55, 1] } };
}

export default function P160(api) {
  return qdKit(api, {
    k: 1,
    hexF: 0.75 * IN,
    hexM: 0.6875 * IN,
    tether: 0.075,
    dx: 0.045,
    ref: { female: '4', male: '3', plug: '2', cap: '1' },
  });
}
