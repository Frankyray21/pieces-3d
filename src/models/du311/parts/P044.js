// P044 — Plaque à coins CX031068 rév. 1 (pages 44-45) : « ASSY, SLIP PLATE -
// PIPE WITH 3.75" (95MM) A/F ». Fourche d'acier de 1 1/4 po qui coiffe les
// méplats de 3,75 po (95 mm) des tiges de 5 po pour les retenir au dévissage ;
// elle glisse sur le centreur fendu au pied de l'avance V30 (repère 7 de P032,
// lettre A de P098), tirée par deux vérins de coins (CX077208) attelés à ses
// deux chapes soudées : axes de chape (2), bagues roulées (3) et vis à tête
// fraisée (4) dont la tête bloque la gorge de chaque axe.
// Repère : origine sur l'axe de forage, au centre de l'arrondi du fond de la
// fente (axe de la tige engagée), Y = 0 sous la plaque (face de glissement),
// Y vers le haut (le long des tiges, vers la tête de rotation) ; X en travers
// de la fente, selon les axes de chape ; +Z vers le fond de la fente et les
// chapes : la fente s'ouvre vers -Z, la plaque avance vers -Z pour coiffer la
// tige. Encombrement 0.260 (X) × 0.076 (Y, haut des chapes) × 0.222 (Z, de
// -0.057 à +0.165) m.
// Cotes : fente 3,75 po (liste), bagues 7/8 × 3/4 × 1/2 po (liste), vis 3/8-16
// × 5/8 po (liste) ; plaque, chapes et axes d'après les proportions de la vue
// isométrique de la page 44 (alésage des chapes = Ø 7/8 po pour l'échelle).
// Grandes faces latérales : ligne de jonction à 1/2 po sous le dessus (plaque
// rapportée), qui descend à 45° vers le coin arrière, comme sur le dessin.

const IN = 0.0254;
const MM = 0.001;

// 1 — plaque
const T = 1.25 * IN; // épaisseur
const W2 = 5.125 * IN; // demi-largeur (10 1/4 po)
const ZF = 6.5 * IN; // bord arrière, côté chapes
const ZB = -2.25 * IN; // embouchure de la fente
const S2 = (3.75 * IN) / 2; // demi-largeur de fente : méplats de 3,75 po
const RF = 2.625 * IN; // arrondi du fond (dégage le corps Ø 5 po)
const CH = 1.0 * IN; // chanfreins d'entrée à 45°
// Chapes soudées : oreilles 1/2 × 1 3/4 × 1 3/4 po, alésage 7/8 po (bagues)
const LT = 0.5 * IN, LS = 1.75 * IN, GAP = 0.9 * IN;
const XC = 90.5 * MM; // axe de chaque chape (de part et d'autre de la fente)
const ZL = 71 * MM; // milieu des oreilles
const YB = T + LS / 2; // axe des alésages
const XI = XC - GAP / 2 - LT; // face côté fente de l'oreille intérieure
// Taraudage 3/8-16 (Ø 0,31 po) traversant l'oreille intérieure, sans fraisure,
// en haut vers l'arrière
const DS = 17.8 * MM; // distance à l'axe (0,7 po, à 45° vers +Y et +Z)
const JL = 0.5 * IN; // ligne de jonction des flancs sous le dessus
// 2 — axe de chape Ø 3/4 po, gorge et tête Ø 1 po ; 3 — bague roulée ; 4 — vis FHC
const PR = 9.45 * MM; // rayon de l'axe (jeu dans la bague 3/4 po)
const SL = 50 * MM; // longueur sous la gorge (traverse la chape, dépasse de 1,7 mm)
const RG = 7.5 * MM; // gorge Ø 15 mm sur 6 mm, contre la face de l'oreille
// Tête Ø 1 po, pleine jusqu'à 19 mm de la face de l'oreille (vue assemblée de
// la page 44, chape droite : silhouette du bout à 18,8-19 mm), bout chanfreiné
// à 20,5 mm.
const RH = 0.5 * IN;
const RK = 0.344 * IN; // tête de vis fraisée Ø 0,69 po
const TAN41 = Math.tan((41 * Math.PI) / 180); // tête conique à 82°

export default function P044(api) {
  const { THREE, S } = api;
  const { lathe, slotted, roundHole, weld, merged, extrude, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Extrusion selon Y (plaque) d'un contour [[x, z], ...] de y0 à y1.
  const slabY = (pts, y0, y1, mat) => {
    const m = extrude(pts.map(([x, z]) => [x, -z]), y1 - y0, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = (y0 + y1) / 2;
    return m;
  };
  // Extrusion selon X (oreille) d'un contour [[z, y], ...] de x0 à x1, trous [z, y, r].
  // Contour remis dans le sens trigonométrique après le miroir en z : three.js
  // retourne alors les trous à contresens du contour, et l'arête cassée des
  // alésages s'ouvre vers la face (sinon elle forme une lèvre R - 1,6 mm qui
  // recouvre la face de la bague et la fait scintiller).
  const slabX = (pts, x0, x1, holes, mat) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]).reverse(), x1 - x0, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = (x0 + x1) / 2;
    return m;
  };

  // ---------------------------------------------------------------- 1 — plaque à coins
  // Contour : rectangle, fente ouverte vers -Z (chanfreins d'entrée, flancs
  // parallèles = méplats, fond en arc de R 2 5/8 po centré sur l'axe de forage).
  const a0 = Math.acos(S2 / RF);
  const arc = [];
  for (let i = 0; i <= 24; i++) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / 24;
    arc.push([RF * Math.cos(a), RF * Math.sin(a)]);
  }
  const outline = [
    [-W2, ZF], [-W2, ZB], [-S2 - CH, ZB], [-S2, ZB + CH],
    ...arc.slice().reverse(),
    [S2, ZB + CH], [S2 + CH, ZB], [W2, ZB], [W2, ZF],
  ];
  // Oreilles : arêtes supérieures chanfreinées, alésage Ø 7/8 ; l'oreille
  // intérieure (côté fente) porte le taraudage de la vis de blocage.
  const c = 3 * MM, h = LS / 2;
  const ear = [[-h, -h], [h, -h], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c]].map(([z, y]) => [ZL + z, YB + y]);
  // Alésage Ø 7/8 po majoré de 0,2 mm au rayon : extrude() le trace en
  // polygone inscrit ; la bague (R 11,11) doit y rester entière, sans dents.
  const bore = [ZL, YB, (0.875 * IN) / 2 + 0.2 * MM];
  const tap = [ZL + DS / Math.SQRT2, YB + DS / Math.SQRT2, 3.97 * MM];
  const ears = [], welds = [];
  for (const s of [-1, 1]) {
    for (const [x0, inner] of [[XI, true], [XC + GAP / 2, false]]) {
      const xa = s * x0, xb = s * (x0 + LT);
      ears.push(slabX(ear, Math.min(xa, xb), Math.max(xa, xb), inner ? [bore, tap] : [bore], 'grey'));
      // Cordon d'angle tout autour du pied de l'oreille.
      const e = 1 * MM, y = T + 0.6 * MM;
      const X0 = Math.min(xa, xb) - e, X1 = Math.max(xa, xb) + e, Z0 = ZL - h - e, Z1 = ZL + h + e;
      welds.push(weld([[X0, y, Z0], [X1, y, Z0], [X1, y, Z1], [X0, y, Z1]], 5.5 * MM, 'grey', { closed: true }));
    }
  }
  // Ligne de jonction des grands flancs (X = ±W2) : fin cordon à 1/2 po sous
  // le dessus, à 45° jusqu'au coin arrière, puis arête verticale jusqu'au
  // dessous ; arrêté aux chanfreins (1,6 mm) des arêtes de la plaque.
  const mb = 1.6 * MM;
  for (const s of [-1, 1]) {
    const x = s * W2;
    welds.push(weld([[x, T - JL, ZB], [x, T - JL, ZF - JL], [x, T - mb, ZF - mb]], 1.5 * MM, 'grey'));
    welds.push(weld([[x, T - JL, ZF - JL], [x, mb, ZF - JL]], 1.5 * MM, 'grey'));
  }
  const beads = merged(welds, 'grey');
  beads.geometry.userData.edgeAngle = 75;
  P('1', group(merged([slabY(outline, 0, T, 'grey'), ...ears], 'grey'), beads), [0, 0, 0]);

  // ---------------------------------------------------------------- pièces de chape
  // Repère local d'une chape : origine sur l'axe, contre la face côté fente de
  // l'oreille intérieure ; +Y local = vers la fente (sortie de l'axe), +Z local
  // = vers la vis de blocage (diagonale +Y / +Z du repère de la plaque).
  const frame = (obj, s) => {
    const Yw = new THREE.Vector3(-s, 0, 0);
    const Zw = new THREE.Vector3(0, 1, 1).normalize();
    const Xw = new THREE.Vector3().crossVectors(Yw, Zw);
    const g = group(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xw, Yw, Zw));
    g.position.set(s * XI, YB, ZL);
    return g;
  };

  // 2 — axe de chape, tout de révolution : fût Ø 3/4 chanfreiné au bout,
  // gorge Ø 15 mm sur 6 mm contre la face de l'oreille, tête Ø 1 po
  // chanfreinée. La tête de la vis 4, en saillie, se loge dans la gorge.
  const pin = () => lathe([
    [0, -SL], [PR - 1.2 * MM, -SL], [PR, -SL + 1.2 * MM], [PR, 0],
    [RG, 0.6 * MM], [RG, 6 * MM], [RH - 0.6 * MM, 6 * MM], [RH, 6.6 * MM],
    [RH, 19 * MM], [RH - 1.5 * MM, 20.5 * MM], [0, 20.5 * MM],
  ], 'steel', { seg: 24 });

  // 4 — vis à tête fraisée 3/8-16 × 5/8 po, six-pans creux 7/32, acier bruni.
  const screw = () => {
    const rs = 0.1875 * IN, L = 0.625 * IN, top = 0.4 * MM;
    const hh = (RK - rs) / TAN41;
    const hexR = (7 / 32) * IN / 2 / Math.cos(Math.PI / 6);
    const body = lathe([[0, -L], ...S.thread(rs, -L, -top - hh, { pitch: IN / 16 }), [RK, -top], [hexR, -top]], 'blackOxide', { seg: 20 });
    const socket = lathe([[hexR, -top], [hexR, -3 * MM], [0, -3.6 * MM]], 'blackOxide', { seg: 6 });
    // Dessus de tête percé du six-pans (coins alignés sur ceux de l'empreinte).
    const ring = (r, n) => Array.from({ length: n }, (_, j) => {
      const t = (j / n) * Math.PI * 2;
      return new THREE.Vector2(r * Math.sin(t), -r * Math.cos(t));
    });
    const shape = new THREE.Shape(ring(RK, 20));
    shape.holes.push(new THREE.Path(ring(hexR, 6)));
    const disc = new THREE.ExtrudeGeometry(shape, { depth: top, bevelEnabled: false });
    disc.rotateX(-Math.PI / 2);
    disc.translate(0, -top, 0);
    return merged([body, socket, new THREE.Mesh(disc)], 'blackOxide');
  };

  // 3 — bague roulée bronze 3/4 × 7/8 × 1/2 po : joint agrafé en Z sur le
  // dessus, trou de graissage côté arrière ; emmanchée affleurante dans l'oreille.
  const bushing = (x) => {
    const ro = (0.875 * IN) / 2, ri = (0.75 * IN) / 2, hb = LT / 2;
    const w = (0.4 * MM) / ro, s1 = (3 * Math.PI) / 2, s2 = s1 + 0.35, e = 0.2 * MM;
    const windows = [
      { a: s1, w, y0: -hb, y1: e },
      { a: (s1 + s2) / 2, w: s2 - s1 + w, y0: -e, y1: e },
      { a: s2, w, y0: -e, y1: hb },
      ...roundHole(0, 0, 1.6 * MM, ro, { steps: 5 }),
    ];
    return slotted(ro, ri, -hb, hb, windows, 'brass', { axis: 'x', seg: 40, pos: [x, YB, ZL] });
  };

  for (const s of [-1, 1]) {
    // Bagues : celle de l'oreille extérieure sort vers l'extérieur, celle de
    // l'oreille intérieure vers la fente (5 mm de jour, laissant place à la vis).
    P('3', bushing(s * (XC + GAP / 2 + LT / 2)), [s * 0.05, 0, 0]);
    P('3', bushing(s * (XI + LT / 2)), [-s * 0.018, 0, 0]);
    // Axe : sort côté fente puis décalé vers l'arrière de la plaque, comme la
    // ligne brisée du dessin.
    P('2', frame(pin(), s), [-s * 0.03, 0, 0.075]);
    // Vis de blocage : tête en saillie sur la face de l'oreille (cône dès la
    // face, dessus à 5 mm, sous l'épaulement de la gorge à 6 mm) ; son bord
    // (R 8,7 à 17,8 mm) passe à 9,1 mm de l'axe, entre la gorge (R 7,5) et la
    // tête (R 12,7) : l'axe est bloqué dans les deux sens. Filet engagé de
    // 10,9 mm dans l'oreille de 12,7 mm. Sort de son taraudage, vers la fente,
    // assez loin pour dégager la bague intérieure (bout du filet à 23 mm de
    // celle-ci, sinon la vis, décalée de 17,8 mm, se dessine sur la bague) ;
    // les deux vis ont les mêmes Y et Z : dessus de tête à 9,4 mm du milieu de
    // la fente (au-delà de 61 mm de course, elles se croiseraient).
    P('4', frame(at(screw(), [0, 5 * MM, DS]), s), [-s * 0.052, 0, 0]);
  }

  return { view: { dir: [1, 0.85, 1.05] } };
}
