// P328 — Porteur sur chenilles du DU311-T CX036960 rév. 0 (pages 328 et 330) :
// « ASSY, DU311-T CARRIER », repère 30 du châssis P186. Poutre-châssis
// mécano-soudée de 39 × 162 po (47) sur deux trains de chenilles (7, P336 à
// droite et sa copie en miroir à gauche, raccords des moteurs P344), quatre
// stabilisateurs (2, P332) aux angles, plateau supérieur (19) sur la zone des
// chenilles ; à l'arrière, plateforme de conduite (16, marche de translation,
// chaîne de sécurité 24 / P348), réservoir hydraulique équipé (38, P378) coiffé
// de la garde des vannes de translation (35, P372), réservoir de graisse (33,
// P368) et son indicateur de niveau (12, P342), commandes d'air de la pompe de
// graisse (29, P360), arrivée d'eau (32, P366), réducteur de pression des freins
// (36, P374), télésurveillance (40, P382) sur la tôle de coffret (34) ; vers
// les stabilisateurs arrière : vannes de translation droite / gauche (30, P362 ;
// 31, P364), clapet navette de translation (28, P358), filtres haute pression
// (27, P350) ; sur le plateau : collecteurs de pression (20, P346) et de retour
// (37, P376), clapet navette LS (41, P386), traversée DA101 / DA201 (46, P388),
// supports de bancs de distributeurs 1, 2, 6 et 8 sections (3, 4, 5, 6) et
// leurs plaques de fermeture (42 à 45), appuis de mât (13, 18), plaque du logo
// (39), supports de refroidisseurs (15, 22), de moteur électrique (21), de
// buses (25, 26), de manomètres (23 avec 9 et 10), de phare (14), quatre phares
// à DEL (1), valve de décharge manuelle (11), quatre bagues d'articulation (8)
// du pied de mât et, au pied des stabilisateurs avant (détail B), les brides
// de réglage : 4 vis H 1 × 6 (48), 4 vis de pression 1 × 4 (49), 8 rondelles
// (50), 4 écrous (51), 4 contre-écrous (52).
// Repère (repère machine, celui de frame.js) : origine au sol sous le milieu de
// la poutre-châssis, X vers l'avant (côté stabilisateurs avant et pied de mât ;
// la plateforme est à l'arrière, −X), Y vers le haut, +Z à gauche. Poutre de
// x = −2.06 à +2.06 (162 po), longerons à z = ±0.455 (39 po hors tout), dessous
// des longerons à y = 0.47 (appui sur les consoles des chenilles), plateau à
// y = DECK = 0.69. Chenilles centrées en x = XT = 0.64, z = ∓0.60 (voie 1.20).
// Stabilisateurs (rentrés, pied à 0.09 du sol) en x = −0.79 et +1.90, z =
// ±0.69. Encombrement ≈ 4.15 (X) × 1.80 (Y, gyrophare compris) × 1.56 (Z) m.
// Cotes : longueur et largeur de la poutre d'après sa désignation, le reste
// d'après la vue de dessus et la vue de côté de la page 330 (échelle prise sur
// la poutre de 162 po) ; implantations des équipements d'après les deux vues
// isométriques de la page 328 (positions estimées, non cotées au manuel).
import { IN, kit, TRACK } from './_porteur.js';
import { ZP } from './P332.js';

export const DECK = 0.69;
export const XT = 0.64; // milieu des chenilles
const XF = 2.06; // demi-longueur de la poutre
const ZR = 0.455; // axe des longerons
const YR0 = 0.47, YR1 = 0.67; // dessous / dessus des longerons
const OUT = { xr: -0.79, xf: 1.9, z: 0.69, y: 0.09 }; // stabilisateurs
const PLAT = { x0: -XF, x1: -1.63, y: 0.36, z: 0.46, h: 1.62 }; // plateforme
const TANKX = -1.25; // axe de la paroi arrière + 0.16 (réservoir hydraulique)

export default function P328(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, tube, nameplate } = S;
  const K = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const sub = (id, pos, rot, e, scale) => P(REF[id], at(api.sub(id), pos, rot, scale), e);
  const R90 = Math.PI / 2;

  // ================================================================ 47 — poutre-châssis
  const fr = [];
  // Longerons en caisson 3 × 8 po, bouts fermés.
  for (const s of [-1, 1]) fr.push(box(2 * XF, YR1 - YR0, 0.076, 'grey', { pos: [0, (YR0 + YR1) / 2, s * ZR] }));
  // Traverses : arrière (plateforme), poutres des stabilisateurs, milieu, avant.
  for (const x of [-2.0, -1.6, -0.95, 0.0, 1.0, 1.98]) fr.push(box(0.1, 0.16, 2 * ZR - 0.07, 'grey', { pos: [x, YR0 + 0.09, 0] }));
  // Poutres des stabilisateurs (jusqu'aux platines) et chaises boulonnées.
  for (const x of [OUT.xr, OUT.xf]) {
    fr.push(box(0.16, 0.18, 2 * (OUT.z - ZP), 'grey', { pos: [x, YR0 + 0.1, 0] }));
    for (const s of [-1, 1]) {
      // Chaise : platine de 14 × 12 po percée (8 boulons 1 po), contre la platine du stabilisateur.
      const ch = K.plate(0.36, 0.32, 0.025, 'grey', { holes: [-1, 1].flatMap((a) => [0.415, 0.488, 0.56, 0.632].map((y) => [a * 5 * IN, y - (OUT.y + 0.52) + 0.0, 0.015])), seg: 10 });
      ch.rotation.x = R90;
      ch.position.set(x, OUT.y + 0.52, s * (OUT.z - ZP - 0.0125));
      fr.push(ch);
      for (const dx of [-0.16, 0.16]) fr.push(box(0.02, 0.3, OUT.z - ZP - ZR - 0.03, 'grey', { pos: [x + dx, OUT.y + 0.5, s * (ZR + 0.03 + (OUT.z - ZP - ZR - 0.03) / 2)] }));
    }
  }
  // Ventre arrière (berceau du réservoir) : joues, fond, entretoises en croix.
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape([[-1.63, YR0], [-0.95, YR0], [-1.05, 0.3], [-1.55, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.016, bevelEnabled: false });
    g.translate(0, 0, s * ZR - 0.008);
    fr.push(new THREE.Mesh(g));
  }
  fr.push(box(0.5, 0.016, 2 * ZR, 'grey', { pos: [-1.3, 0.308, 0] }));
  // Croix de contreventement sous le plateau (vue de dessus) entre les poutres de stabilisateurs.
  for (const [x0, x1] of [[-0.9, -0.2], [1.1, 1.85]]) {
    const L = Math.hypot(x1 - x0, 2 * ZR), a = Math.atan2(2 * ZR, x1 - x0);
    for (const s of [-1, 1]) fr.push(box(L, 0.08, 0.012, 'grey', { pos: [(x0 + x1) / 2, YR0 + 0.05, 0], rot: [0, s * a, 0] }));
  }
  // Pattes du pied de mât (bagues 8), à l'avant.
  for (const z of [-0.3, 0.3]) for (const dz of [-0.06, 0.06]) {
    fr.push(at(lathe([[0.036, -0.016], [0.07, -0.016], [0.07, 0.016], [0.036, 0.016]], 'grey', { seg: 20 }), [XF - 0.06, DECK + 0.09, z + dz], [R90, 0, 0]));
    fr.push(box(0.12, 0.09, 0.032, 'grey', { pos: [XF - 0.08, DECK + 0.03, z + dz] }));
  }
  P('47', merged(fr, 'grey'), [0, -0.25, 0]);

  // 8 — bagues Connex 2 1/2 × 2 3/4 × 1 1/4 dans les pattes du pied de mât
  for (const z of [-0.3, 0.3]) for (const dz of [-0.06, 0.06]) {
    P('8', at(K.band(1.375 * IN, 1.25 * IN, -0.625 * IN, 0.625 * IN, 'brass', 20), [XF - 0.06, DECK + 0.09, z + dz], [R90, 0, 0]), [0.15, 0.1, dz]);
  }

  // ================================================================ 19 — plateau supérieur
  const deck = K.plate(1.66, 1.55, 0.02, 'grey', {
    cutouts: [[0.22, -0.23, 0.04, 0.4], [0.42, -0.23, 0.04, 0.4]],
    holes: [[-0.1, 0.0, 0.06], [0.6, 0.25, 0.05]],
    r: 0.02, seg: 16,
  });
  deck.position.set(0.63, DECK - 0.01, 0);
  P('19', deck, [0, 0.35, 0]);

  // ================================================================ trains de chenilles, stabilisateurs
  const V = TRACK.gauge;
  P('7', group(at(api.sub('P336'), [XT, 0, -V / 2]), at(api.sub('P336'), [XT, 0, V / 2], null, [1, 1, -1])), [0, -0.4, 0]);
  sub('P344', [XT, 0, 0], null, [0, -0.4, 0]);
  for (const x of [OUT.xr, OUT.xf]) {
    sub('P332', [x, OUT.y, OUT.z], null, [0, -0.2, 0.3]);
    sub('P332', [x, OUT.y, -OUT.z], [0, Math.PI, 0], [0, -0.2, -0.3]);
  }

  // ---------------------------------------------------------------- détail B : brides des stabilisateurs avant
  for (const s of [-1, 1]) {
    const z = s * OUT.z, y = OUT.y + 0.68;
    for (const dx of [-0.07, 0.07]) {
      P('50', K.washer(1 * IN, 'zinc', { pos: [OUT.xf + dx, y + 0.04, z], seg: 10 }), [0, 0.3, 0]);
      P('48', K.screw(1 * IN, 6 * IN, 'zinc', { pos: [OUT.xf + dx, y + 0.044, z], seg: 10 }), [0, 0.4, 0]);
      P('50', K.washer(1 * IN, 'zinc', { axis: '-y', pos: [OUT.xf + dx, y - 0.075, z], seg: 10 }), [0, -0.12, 0]);
      P('51', K.hex(1.5 * IN, 0.86 * IN, 'zinc', { pos: [OUT.xf + dx, y - 0.093, z] }), [0, -0.18, 0]);
    }
    for (const sx of [-1, 1]) {
      const xe = OUT.xf + sx * 0.19;
      P('49', at(group(box(0.022, 0.022, 0.022, 'zinc', { pos: [0, 0.011 + 0.08, 0] }), cyl(0.0127, 0.1, 'zinc', { seg: 10, pos: [0, 0.04, 0] })), [xe, y + 0.02, z], [0, 0, -sx * R90]), [sx * 0.15, 0, 0]);
      P('52', K.hex(1.5 * IN, 0.55 * IN, 'zinc', { axis: sx > 0 ? 'x' : '-x', pos: [xe + sx * 0.012, y + 0.02, z] }), [sx * 0.09, 0, 0]);
    }
  }
  // Barres de bridage (partie de la poutre) : sous les vis 48.
  void 0;

  // ================================================================ arrière : plateforme et équipements
  // 16 — marche de translation (plateforme de 39 po) : cadre, caillebotis, rambardes, poignées.
  const st = [];
  const xm = (PLAT.x0 + PLAT.x1) / 2, dxp = PLAT.x1 - PLAT.x0;
  for (const s of [-1, 1]) {
    st.push(box(dxp, 0.05, 0.05, 'grey', { pos: [xm, PLAT.y - 0.025, s * PLAT.z] }));
    // Montants arrière et avant, lisses haute et intermédiaire.
    for (const x of [PLAT.x0 + 0.025, PLAT.x1 - 0.025]) st.push(box(0.05, PLAT.h - PLAT.y, 0.05, 'grey', { pos: [x, (PLAT.h + PLAT.y) / 2, s * PLAT.z] }));
    for (const y of [PLAT.h - 0.025, 1.05]) st.push(box(dxp, 0.05, 0.05, 'grey', { pos: [xm, y, s * PLAT.z] }));
  }
  for (const x of [PLAT.x0 + 0.025, PLAT.x1 - 0.025]) st.push(box(0.05, 0.05, 2 * PLAT.z, 'grey', { pos: [x, PLAT.y - 0.025, 0] }));
  st.push(box(0.05, 0.05, 2 * PLAT.z, 'grey', { pos: [PLAT.x1 - 0.025, PLAT.h - 0.025, 0] }));
  // Pattes d'accrochage sur la traverse arrière, anneaux de la chaîne.
  for (const s of [-1, 1]) st.push(box(0.4, 0.12, 0.02, 'grey', { pos: [PLAT.x1 + 0.15, YR0 - 0.02, s * (PLAT.z - 0.04)] }));
  const bars = [];
  for (let i = 0; i < 9; i++) bars.push(box(dxp - 0.06, 0.03, 0.005, 'zinc', { pos: [xm, PLAT.y - 0.015, -PLAT.z + 0.05 + (i * (2 * PLAT.z - 0.1)) / 8] }));
  for (let i = 0; i < 5; i++) bars.push(box(0.006, 0.01, 2 * PLAT.z - 0.05, 'zinc', { pos: [PLAT.x0 + 0.05 + i * (dxp - 0.1) / 4, PLAT.y - 0.005, 0] }));
  const grips = [-1, 1].map((s) => tube([[PLAT.x0 - 0.0, 0.6, s * (PLAT.z + 0.05)], [PLAT.x0 - 0.06, 0.65, s * (PLAT.z + 0.05)], [PLAT.x0 - 0.06, 1.2, s * (PLAT.z + 0.05)], [PLAT.x0, 1.25, s * (PLAT.z + 0.05)]], 0.016, 'grey', { seg: 24, radial: 8 }));
  P('16', group(merged(st, 'grey'), merged(bars, 'zinc'), ...grips), [-0.4, 0, 0]);
  // 24 — chaîne de sécurité (P348) en travers de l'accès arrière, à 1 m.
  sub('P348', [PLAT.x0 - 0.03, 1.0, -PLAT.z + 0.04], [0, -R90, 0], [-0.55, 0, 0]);

  // 38 — réservoir hydraulique équipé : voyants vers +Z, face inclinée vers l'avant.
  sub('P378', [TANKX, YR0, 0], [0, R90, 0], [0, 0.5, 0]);
  // 35 — garde des vannes de translation sur le réservoir, façade vers la plateforme.
  sub('P372', [-1.5, 1.06, 0], [0, -R90, 0], [0, 0.9, 0]);
  // 33 — réservoir de graisse sur console, à l'angle arrière gauche (+Z).
  sub('P368', [-1.84, 0.42, PLAT.z + 0.18], null, [-0.2, 0, 0.5]);
  // 12 — indicateur de niveau bas, sur le dessus du réservoir de graisse.
  sub('P342', [-1.86, 0.72 + 0.0048, PLAT.z + 0.1], null, [-0.2, 0.35, 0.5]);

  // ================================================================ phares, manomètres, petites pièces
  // 1 — phares de travail à DEL (×4) : 2 à l'avant (bouts des poutres de stabilisateurs), 2 à l'arrière.
  const led = () => group(
    box(0.11, 0.08, 0.05, 'black', { r: 0.006 }),
    at(box(0.095, 0.065, 0.004, 'glass'), [0, 0, 0.027]),
    at(box(0.02, 0.05, 0.03, 'black'), [0, -0.055, -0.01]),
  );
  P('1', at(led(), [OUT.xf + 0.12, 0.72, 0.5], [0, R90, 0]), [0.25, 0, 0]);
  P('1', at(led(), [OUT.xf + 0.12, 0.72, -0.5], [0, R90, 0]), [0.25, 0, 0]);
  P('1', at(led(), [PLAT.x1 - 0.07, PLAT.h + 0.08, 0.3], [0, -R90, 0]), [-0.2, 0.2, 0]);
  P('1', at(led(), [PLAT.x1 - 0.07, PLAT.h + 0.08, -0.3], [0, -R90, 0]), [-0.2, 0.2, 0]);
  // 14 — support de phare (arrière) : équerre sur la traverse haute de la plateforme.
  P('14', merged([box(0.08, 0.006, 0.7, 'grey', { pos: [PLAT.x1 - 0.06, PLAT.h + 0.003, 0] }), box(0.006, 0.05, 0.7, 'grey', { pos: [PLAT.x1 - 0.1, PLAT.h + 0.025, 0] })], 'grey'), [-0.2, 0.12, 0]);

  // 23 — platines de manomètres (×2) sur le flanc droit, 9 et 10 dessus.
  for (const [x, ref] of [[0.15, '9'], [1.45, '10']]) {
    P('23', at(K.plate(0.12, 0.12, 0.006, 'grey', { holes: [[0, 0, 0.012]], seg: 12 }), [x, DECK + 0.08, -ZR - 0.04], [R90, 0, 0]), [0, 0, -0.15]);
    // Manomètre Ø 2 1/2 po (léger) : boîtier inox, cadran blanc, aiguille, raccord laiton.
    const gg = group(
      lathe([[0, -0.012], [0.03, -0.012], [0.032, -0.008], [0.032, 0.008], [0.029, 0.011], [0, 0.011]], 'chrome', { seg: 16 }),
      at(cyl(0.028, 0.002, 'white', { seg: 16 }), [0, 0.0115, 0]),
      at(box(0.002, 0.001, 0.022, 'red'), [0.004, 0.0128, -0.006], [0, 0.5, 0]),
      at(cyl(0.006, 0.03, 'brass', { seg: 6 }), [0, -0.027, 0]),
    );
    P(ref, at(gg, [x, DECK + 0.08, -ZR - 0.055], [-R90, 0, 0]), [0, 0, -0.25]);
  }
  // 11 — valve de décharge manuelle (sur le dessus du réservoir, côté droit).
  P('11', at(group(box(0.06, 0.05, 0.05, 'zinc', { r: 0.004 }), at(cyl(0.006, 0.05, 'steel', { seg: 10 }), [0, 0.045, 0]), at(cyl(0.02, 0.012, 'black', { seg: 14 }), [0, 0.075, 0])), [-1.0, 1.08, -0.3]), [0, 0.35, 0]);

  // ================================================================ supports et appuis de mât
  // 18 — appui de mât DU311-TK : portique (deux poteaux, traverse, sabots caoutchouc).
  const port = [];
  for (const s of [-1, 1]) port.push(box(0.1, 0.56, 0.1, 'grey', { pos: [0.49, DECK + 0.28, s * 0.42] }), box(0.2, 0.012, 0.2, 'grey', { pos: [0.49, DECK + 0.006, s * 0.42] }));
  port.push(box(0.12, 0.12, 1.0, 'grey', { pos: [0.49, DECK + 0.62, 0] }));
  P('18', group(merged(port, 'grey'), box(0.14, 0.03, 0.36, 'rubber', { pos: [0.49, DECK + 0.695, 0] })), [0, 0.4, 0]);
  // 13 — appui de mât (berceau en V sur poteau, patin caoutchouc).
  const cradle = [box(0.1, 0.3, 0.1, 'grey', { pos: [1.25, DECK + 0.15, 0] }), box(0.2, 0.012, 0.2, 'grey', { pos: [1.25, DECK + 0.006, 0] })];
  for (const s of [-1, 1]) cradle.push(box(0.14, 0.012, 0.16, 'grey', { pos: [1.25, DECK + 0.34, s * 0.07], rot: [s * 0.6, 0, 0] }));
  P('13', group(merged(cradle, 'grey'), box(0.12, 0.012, 0.1, 'rubber', { pos: [1.25, DECK + 0.33, 0] })), [0, 0.35, 0]);
  // 39 — tôle du logo (debout sur le plateau, face −Z).
  P('39', group(merged([box(0.5, 0.2, 0.006, 'grey', { pos: [0.95, DECK + 0.36, -0.2] }), box(0.03, 0.26, 0.03, 'grey', { pos: [0.72, DECK + 0.13, -0.2] }), box(0.03, 0.26, 0.03, 'grey', { pos: [1.18, DECK + 0.13, -0.2] })], 'grey'), at(nameplate(0.44, 0.14, { material: 'white', ink: 'blue' }), [0.95, DECK + 0.36, -0.204], [0, Math.PI, 0])), [0, 0.3, -0.2]);

  // Supports de bancs de distributeurs (3 : 1 section, 4 : 2, 5 : 6, 6 : 8) et
  // plaques de fermeture (42 à 45) : caisson en tôle ouvert, plaque à lumières.
  const VB = [
    ['3', '42', 1, [1.3, -0.42]], ['4', '43', 2, [1.75, 0.5]],
    ['5', '44', 6, [1.0, 0.05]], ['6', '45', 8, [1.62, 0.12]],
  ];
  for (const [rb, rc, n, [x, z]] of VB) {
    const w = 0.08 + n * 0.05, h = 0.36, d = 0.16;
    const br = [box(w, 0.01, d + 0.06, 'grey', { pos: [x, DECK + 0.005, z] }), box(w, h, 0.006, 'grey', { pos: [x, DECK + h / 2, z - d / 2] })];
    for (const s of [-1, 1]) br.push(box(0.006, h, d, 'grey', { pos: [x + s * (w / 2 - 0.003), DECK + h / 2, z] }));
    P(rb, merged(br, 'grey'), [0, 0.25, 0]);
    const cuts = Array.from({ length: n }, (_, i) => [-w / 2 + 0.04 + 0.025 + i * 0.05, 0, 0.016, 0.07]);
    const cv = K.plate(w, 0.12, 0.004, 'grey', { cutouts: cuts });
    cv.position.set(x, DECK + h + 0.002, z);
    P(rc, cv, [0, 0.4, 0]);
  }

  // Supports divers (tôles pliées) : 15 refroidisseur ×2, 21 moteur électrique,
  // 22 refroidisseur d'huile de translation, 25 / 26 buses, 34 coffret électrique.
  const angle = (x, y, z, w, h, d) => merged([box(w, 0.008, d, 'grey', { pos: [x, y + 0.004, z] }), box(w, h, 0.008, 'grey', { pos: [x, y + h / 2, z - d / 2] })], 'grey');
  P('15', angle(-0.3, DECK, 0.62, 0.12, 0.16, 0.1), [0, 0.25, 0.1]);
  P('15', angle(-0.3, DECK, -0.62, 0.12, 0.16, 0.1), [0, 0.25, -0.1]);
  P('21', merged([box(0.4, 0.6, 0.012, 'grey', { pos: [-0.88, YR1 + 0.3, 0.48] }), box(0.4, 0.012, 0.12, 'grey', { pos: [-0.88, YR1 + 0.6, 0.54] })], 'grey'), [0, 0, 0.3]);
  P('22', merged([box(0.06, 0.55, 0.01, 'grey', { pos: [-0.7, DECK + 0.27, 0.3] }), box(0.2, 0.01, 0.06, 'grey', { pos: [-0.75, DECK + 0.55, 0.3] })], 'grey'), [0.2, 0.3, 0]);
  P('25', angle(-0.95, 1.05, 0.35, 0.1, 0.06, 0.08), [0.1, 0.25, 0]);
  P('26', angle(-1.65, 0.75, 0.5, 0.1, 0.06, 0.08), [-0.1, 0.2, 0.15]);
  const elec = K.plate(0.4, 0.45, 0.006, 'grey', { holes: [[-0.15, -0.18, 0.005], [0.15, -0.18, 0.005], [-0.15, 0.18, 0.005], [0.15, 0.18, 0.005]] });
  elec.rotation.x = R90;
  elec.position.set(-1.38, 0.75, -0.5);
  P('34', group(elec, box(0.4, 0.008, 0.06, 'grey', { pos: [-1.38, 0.98, -0.47] })), [0, 0, -0.25]);

  // ================================================================ équipements hydrauliques et divers
  for (const [id, pos, rot, e] of PLACE) sub(id, pos, rot, e);
  // 40 — télésurveillance : support sur le montant avant gauche de la plateforme,
  // antenne sur le toit de la garde P372 (perçage (0.16, 0.60, −0.06) de son repère).
  const o382 = [PLAT.x1 - 0.025, 0.95, PLAT.z + 0.025];
  const ant = [-1.5 + 0.06, 1.06 + 0.6, 0.16].map((v, i) => v - o382[i]);
  P('40', at(api.sub('P382', { ant }), o382), [-0.2, 0, 0.35]);

  void cyl; void IN;
  return { view: { dir: [0.9, 0.75, 1.15] } };
}

// Repère de chaque sous-assemblage dans la liste.
const REF = {
  P332: '2', P336: '7', P342: '12', P344: '17', P346: '20', P348: '24', P350: '27', P358: '28', P360: '29',
  P362: '30', P364: '31', P366: '32', P368: '33', P372: '35', P374: '36', P376: '37', P378: '38', P382: '40',
  P386: '41', P388: '46',
};
const R = Math.PI / 2;
// Implantation des équipements hydrauliques : [assemblage, position, rotation, éclaté].
const PLACE = [
  ['P346', [0.58, DECK, -0.18], null, [0, 0.3, 0]],
  ['P376', [0.3, DECK, 0.12], [0, R, 0], [0, 0.3, 0]],
  // Filtres HP sur la poutre des stabilisateurs arrière, entrées vers +Z.
  ['P350', [-0.8, YR1, 0.22], null, [0, 0.45, 0.25]],
  // Clapets navettes sur la traverse entre les vannes de translation.
  ['P358', [-0.95, YR0 + 0.17, -0.05], null, [0, 0.3, 0]],
  ['P386', [-0.95, YR0 + 0.17, 0.12], null, [0, 0.3, 0]],
  // Vannes de translation contre les faces intérieures des longerons.
  ['P362', [-0.6, 0.57, ZR - 0.038], [0, Math.PI, 0], [0, 0.25, -0.15]],
  ['P364', [-0.6, 0.57, -ZR + 0.038], null, [0, 0.25, 0.15]],
  ['P360', [-1.6, 1.1, PLAT.z + 0.03], null, [0, 0.2, 0.3]],
  ['P366', [-1.95, 0.22, -0.3], null, [-0.3, -0.1, 0]],
  ['P374', [-2.0, 0.62, 0.25], [0, -R, 0], [-0.3, 0, 0]],
  ['P388', [1.3, DECK + 0.364, -0.42], null, [0, 0.45, 0]],
];
