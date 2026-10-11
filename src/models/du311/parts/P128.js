// P128 — Bloc de distribution du pivotement du centreur CX032821 rév. 0
// (page 128) : « ASSY, MANIFOLDBLOCK, CENTRALIZER SWING ». Bloc d'acier
// zingué 7 × 4 1/2 × 5 po (4, CX032822) usiné pour cartouches Sun : deux
// valves de séquence à retour libre T-11A (1, SCCA / SCCA1) en bout -X, vis
// de réglage et contre-écrou en saillie ; quatre clapets pilotés T-163A (2,
// CKBD à CKBD3, chapeaux ronds) et le diviseur de débit T-31A (3, FSCS,
// six-pans affleurant) sur la face +Y. Orifices SAE 6 (schéma de la page) :
// T, CLP, CLR sur la face avant (+Z), PA / PB sur la face arrière (-Z), CSR1,
// CSR2, CSP en bout +X ; bouchons à six-pans creux (et deux bouchons six-pans)
// sur les orifices de perçage ; deux trous de fixation Ø 13/32 traversants
// selon Y aux coins opposés (vis 3/8 × 5 1/4 de P126).
// Repère : origine au centre de la face d'appui (-Y), X selon la longueur
// (valves de séquence vers -X), Y vers la face des cartouches, Z vers la face
// avant (T, CLP, CLR). Encombrement ≈ 0.244 (X, valves comprises) × 0.152 (Y,
// cartouches comprises) × 0.127 (Z) m.
// Cotes : liste (types de cavités Sun du schéma) ; bloc d'après les
// proportions des vues (7 : 4,4 : 5 sur l'isométrie de P126), cartouches à
// l'échelle de leurs six-pans (7/8 à 1 1/4 po).
import { L, u, along, hexPrism } from './_avance_b.js';

const BX = 7, BY = 4.5, BZ = 5; // bloc (po)
// Orifices (po) : face, position dans la face, rayon de perçage.
export const MAN128 = {
  size: [u(BX), u(BY), u(BZ)],
  // Centres des orifices SAE 6 (m, repère du bloc) et normale de sortie.
  ports: {
    T: { p: [-2.4, 1.1, BZ / 2], n: [0, 0, 1] },
    CLP: { p: [-0.9, 2.1, BZ / 2], n: [0, 0, 1] },
    CLR: { p: [0.7, 1.6, BZ / 2], n: [0, 0, 1] },
    PA: { p: [-1.7, 1.6, -BZ / 2], n: [0, 0, -1] },
    PB: { p: [-1.7, 3.0, -BZ / 2], n: [0, 0, -1] },
    CSR1: { p: [BX / 2, 3.2, -1.3], n: [1, 0, 0] },
    CSR2: { p: [BX / 2, 3.2, 0.1], n: [1, 0, 0] },
    CSP: { p: [BX / 2, 1.4, 0.8], n: [1, 0, 0] },
  },
  bolts: [[-3.1, -2.05], [3.1, 2.05]], // (x, z) des trous traversants (po)
};

export default function P128(api) {
  const { THREE, S } = api;
  const { extrude, merged, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = 0.004; // épaisseur des parois du bloc (m) : coque percée, cavités derrière

  // ------------------------------------------------ 4 — bloc
  // Coque de six faces percées (extrusions) et, derrière chaque trou, une
  // cavité borgne (lathe) : les orifices se voient creux, sans transparence.
  const holes = { px: [], nx: [], py: [], ny: [], pz: [], nz: [] };
  const cups = [], spots = [], plugs = [], hexPlugs = [];
  const faceKey = (n) => (n[0] ? (n[0] > 0 ? 'px' : 'nx') : n[1] ? (n[1] > 0 ? 'py' : 'ny') : n[2] > 0 ? 'pz' : 'nz');
  // Orifice : face (normale n), centre p (po, sur la face), perçage rh,
  // lamage rs, profondeur d ; plug : 'socket' (bouchon à six-pans creux),
  // 'hex' (bouchon six-pans) ou rien.
  const port = (p, n, rh, rs, d, plug) => {
    holes[faceKey(n)].push([p, rh]);
    // Cavité : paroi et fond tournés vers l'ouverture.
    cups.push(along(THREE, L(S, [[0, -d - 0.06], [rh + 0.06, -d - 0.06], [rh + 0.06, -0.02], [rh, -0.02], [rh, -d], [0, -d]], 'zinc', 20), n, p.map(u)));
    // Lamage du joint (portée usinée, 0,1 mm en saillie).
    spots.push(along(THREE, L(S, [[rh, 0], [rs, 0], [rs, 0.004], [rh, 0.004], [rh, 0]], 'steel', 28), n, p.map(u)));
    if (plug === 'socket') {
      const hx = rh * 0.5 / Math.cos(Math.PI / 6);
      plugs.push(along(THREE, merged([
        L(S, [[0, 0.004], [rh + 0.1, 0.004], [rh + 0.1, 0.07], [rh + 0.07, 0.1], [hx, 0.1], [hx, 0.04], [0, 0.04]], 'zinc', 24),
        L(S, [[hx, 0.1], [hx, 0.04], [0, 0.04]], 'zinc', 6),
        L(S, [[0, -0.5], [rh, -0.5], [rh, 0], [0, 0]], 'zinc', 16),
      ], 'zinc'), n, p.map(u)));
    } else if (plug === 'hex') {
      hexPlugs.push(along(THREE, merged([
        L(S, [[0, 0.004], [rh + 0.12, 0.004], [rh + 0.12, 0.08], [0, 0.08]], 'zinc', 24),
        hexPrism(S, THREE, rh * 2 + 0.2, 0.32, 0.08, 0, 'zinc'),
        L(S, [[0, -0.5], [rh, -0.5], [rh, 0], [0, 0]], 'zinc', 16),
      ], 'zinc'), n, p.map(u)));
    }
  };
  const SAE6 = [0.3, 0.52, 0.7]; // perçage 9/16-18, lamage, profondeur (po)
  const SAE4 = [0.22, 0.4, 0.55];
  for (const k of Object.keys(MAN128.ports)) {
    const { p, n } = MAN128.ports[k];
    port(p, n, ...SAE6);
  }
  // Bouchons de perçage : face avant (deux grands), faces arrière, +X, dessous.
  port([-0.2, 3.4, BZ / 2], [0, 0, 1], 0.36, 0.62, 0.6, 'socket');
  port([1.3, 3.3, BZ / 2], [0, 0, 1], 0.36, 0.62, 0.6, 'socket');
  port([-0.2, 3.2, -BZ / 2], [0, 0, -1], 0.3, 0.52, 0.6, 'socket');
  port([1.6, 1.2, -BZ / 2], [0, 0, -1], ...SAE4, 'socket');
  port([BX / 2, 1.4, -1.0], [1, 0, 0], ...SAE4, 'socket');
  port([-1.4, 0, 0.9], [0, -1, 0], ...SAE4, 'socket');
  port([0.6, 0, -0.6], [0, -1, 0], 0.3, 0.52, 0.6, 'socket');
  port([2.2, 0, 0.9], [0, -1, 0], ...SAE4, 'socket');
  port([-2.6, BY, 1.6], [0, 1, 0], 0.36, 0.6, 0.6, 'hex');
  port([2.9, BY, 1.7], [0, 1, 0], ...SAE4, 'socket');
  // Trous de fixation traversants (selon Y) : paroi intérieure complète.
  for (const [x, z] of MAN128.bolts) {
    holes.py.push([[x, BY, z], 0.205]);
    holes.ny.push([[x, 0, z], 0.205]);
    cups.push(L(S, [[0.205, 0.02], [0.27, 0.02], [0.27, BY - 0.02], [0.205, BY - 0.02], [0.205, 0.02]], 'zinc', 20, { pos: [u(x), 0, u(z)] }));
  }

  // Cavités des cartouches (face +Y et bout -X) : alésage étagé.
  const CART2 = [[-1.1, 0.95], [0.25, 0.95], [1.6, 0.95], [0.9, -0.95]]; // (x, z) des T-163A
  const CART3 = [2.4, -0.7];
  const SEQ = [[1.2, 0.9], [3.1, -1.0]]; // (y, z) des T-11A en bout -X
  for (const [x, z] of [...CART2, CART3]) holes.py.push([[x, BY, z], 0.47]);
  for (const [y, z] of SEQ) holes.nx.push([[-BX / 2, y, z], 0.42]);
  for (const [x, z] of [...CART2, CART3]) cups.push(along(THREE, L(S, [[0, -1.0], [0.52, -1.0], [0.52, -0.02], [0.47, -0.02], [0.47, -0.8], [0, -0.8]], 'zinc', 24), [0, 1, 0], [u(x), u(BY), u(z)]));
  for (const [y, z] of SEQ) cups.push(along(THREE, L(S, [[0, -1.0], [0.47, -1.0], [0.47, -0.02], [0.42, -0.02], [0.42, -0.8], [0, -0.8]], 'zinc', 24), [-1, 0, 0], [-u(BX / 2), u(y), u(z)]));

  // Faces : rectangle (coordonnées du plan de la face, po) percé, extrudé de T.
  const rect = (a, b) => [[-a / 2, -b / 2], [a / 2, -b / 2], [a / 2, b / 2], [-a / 2, b / 2]].map(([x, y]) => [u(x), u(y)]);
  const faces = [];
  // ±Z : plan (x, y - BY/2)
  for (const [k, s] of [['pz', 1], ['nz', -1]]) {
    const m = extrude(rect(BX, BY), T, 'zinc', { holes: holes[k].map(([p, r]) => [u(p[0]), u(p[1] - BY / 2), u(r)]) });
    m.position.set(0, u(BY / 2), s * (u(BZ / 2) - T / 2));
    faces.push(m);
  }
  // ±X : plan (-z, y - BY/2), rotation +π/2 autour de Y.
  for (const [k, s] of [['px', 1], ['nx', -1]]) {
    const m = extrude(rect(BZ - 0.02, BY), T, 'zinc', { holes: holes[k].map(([p, r]) => [-u(p[2]), u(p[1] - BY / 2), u(r)]) });
    m.rotation.y = Math.PI / 2;
    m.position.set(s * (u(BX / 2) - T / 2), u(BY / 2), 0);
    faces.push(m);
  }
  // ±Y : plan (x, -z), rotation -π/2 autour de X.
  for (const [k, y] of [['py', BY], ['ny', 0]]) {
    const m = extrude(rect(BX - 0.02, BZ - 0.02), T, 'zinc', { holes: holes[k].map(([p, r]) => [u(p[0]), -u(p[2]), u(r)]) });
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, u(y) + (y ? -T / 2 : T / 2), 0);
    faces.push(m);
  }
  const block = merged([...faces, ...cups], 'zinc');
  block.userData.hasInterior = true;
  P('4', group(block, merged(spots, 'steel'), merged([...plugs, ...hexPlugs], 'zinc')), [0, 0, 0]);

  // ------------------------------------------------ cartouches Sun
  // 1 — valve de séquence T-11A : six-pans 1 1/8, corps Ø 1, contre-écrou
  // 9/16 et vis de réglage à six-pans creux, joint torique au pied.
  const seqValve = () => group(
    merged([
      L(S, [[0, -0.75], [0.4, -0.75], [0.4, 0], [0, 0]], 'steel', 20),
      hexPrism(S, THREE, 1.125, 0.42, 0.0, 0, 'steel'),
      L(S, [[0, 0.42], [0.5, 0.42], [0.5, 1.45], [0.46, 1.5], [0, 1.5]], 'steel', 28),
      hexPrism(S, THREE, 0.5625, 0.22, 1.5, 0.15, 'steel'),
    ], 'steel'),
    L(S, [[0, 1.5], [0.18, 1.5], [0.18, 2.07], [0.15, 2.1], [0.08, 2.1], [0.08, 2.0], [0, 2.0]], 'zinc', 16),
    S.torus(u(0.43), u(0.04), 'rubber', { pos: [0, -u(0.04), 0] }),
  );
  SEQ.forEach(([y, z], i) => P('1', along(THREE, seqValve(), [-1, 0, 0], [-u(BX / 2), u(y), u(z)]), [-0.1 - 0.03 * i, 0, 0]));

  // 2 — clapet piloté T-163A : six-pans 1 1/4, chapeau rond Ø 1 à bout arrondi.
  const poCheck = () => group(
    merged([
      L(S, [[0, -0.8], [0.45, -0.8], [0.45, 0], [0, 0]], 'steel', 20),
      L(S, [[0, 0], [0.62, 0], [0.62, 0.06], [0, 0.06]], 'steel', 28),
      hexPrism(S, THREE, 1.25, 0.5, 0.06, 0, 'steel'),
      L(S, [[0, 0.56], [0.5, 0.56], [0.5, 1.2], [0.47, 1.28], [0.38, 1.33], [0, 1.35]], 'steel', 28),
    ], 'steel'),
    S.torus(u(0.6), u(0.04), 'rubber', { pos: [0, u(0.02), 0] }),
  );
  CART2.forEach(([x, z], i) => P('2', at3(poCheck(), [u(x), u(BY), u(z)]), [0, 0.1 + 0.025 * (i % 2), 0]));

  // 3 — diviseur de débit T-31A : six-pans 1 3/8 presque affleurant, bouchon central.
  P('3', at3(group(
    merged([
      L(S, [[0, -1.0], [0.45, -1.0], [0.45, 0], [0, 0]], 'steel', 20),
      hexPrism(S, THREE, 1.375, 0.45, 0, 0, 'steel'),
      L(S, [[0, 0.45], [0.3, 0.45], [0.3, 0.55], [0.26, 0.6], [0, 0.6]], 'steel', 20),
    ], 'steel'),
    S.torus(u(0.62), u(0.04), 'rubber', { pos: [0, u(0.02), 0] }),
  ), [u(CART3[0]), u(BY), u(CART3[1])]), [0, 0.1, 0]);

  function at3(o, p) { o.position.set(...p); return o; }
  return { view: { dir: [-0.8, 0.9, 1.0] } };
}
