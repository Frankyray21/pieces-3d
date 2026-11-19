// P018 — Mandrin Boyles 12HH, 055A (dessin X-Spec B0489, pages 18 et 19 : éclaté, coupe, liste de 31 repères).
//
// REPÈRE LOCAL = repère de la tête P012 (posé à l'identité) : axe de la broche le long de X à y = HEAD.spindleY,
// z = 0 ; face avant du mandrin (dessous de l'adaptateur 55-0008, appui sur la tête) à x = CHUCK.x0 ; le mandrin
// s'étend vers −X (bague de mandrin au bout, côté opposé à la tête). Construit en « colonne » (_boyles.js, sx = +1) :
// d (pouces) depuis le dessus de l'adaptateur de chapeau, x = CHUCK.x0 − (DF − d)·IN, DF = 13,06 (face avant).
// Angles φ depuis +Y vers +Z ; le plan de coupe du site (z = 0) passe par φ = 0° et 180° : il coupe, comme la
// coupe du manuel, deux ressorts, une mâchoire, un boulon 3/4, une entretoise du bas, un boulon de 8 po et son
// entretoise du haut, deux boulons du cylindre et une clavette.
//
// EMPILEMENT (d, pouces) : bague de mandrin 0,17–1,25 · adaptateur de chapeau 55-0004 0,33–1,85 · porte-chapeau
// 55-0003 0,96–2,42 · mâchoires 1,9–6,15 dans le bol 55-0005 1,96–6,0 · carter 55-0006 2,42–8,55 (18 ressorts,
// plancher 6,2–7,5 percé pour les 9 entretoises du bas et leurs joints radiaux) · piston et cylindre 55-0200 (P020,
// u = d − 7,72) 8,17–12,1 · adaptateur de mandrin 55-0008 11,45–13,06 (bride Ø 14,6 [mesure p. 18], écrous des
// boulons du cylindre noyés dessous). Longueur hors tout 12,9 po (0,328 m) ; CHUCK.len de layout.js (0,261 m, [STM])
// ne compte que le tambour : signalé.
// Mécanisme (coupe p. 18) : les ressorts poussent le bol vers la bague, son cône serre les mâchoires ; l'huile
// (raccord de P020) tire le piston vers la tête, qui tire le bol par les 9 boulons de liaison et desserre ; le piston
// pousse aussi le manchon d'actionnement par la butée, qui pousse les entretoises du bas.
//
// Jaw set (jeu de 9 mâchoires 30-16-02 pour NQ, note C) et bague de mandrin (55-0048 NQ) n'ont pas de ligne (leur
// numéro dépend du calibre, tableau p. 19) : montrés comme sur le dessin, hors liste (api.add, sans éclaté).
import { IN, HEAD, CHUCK } from '../layout.js';
import * as B from './_boyles.js';

const { H, PHI, deg } = B;
export const DF = 13.06; // face avant (dessous de l'adaptateur 55-0008), en d
export const U0 = 7.72; // d de l'origine de P020 (u = 0)

export default function P018(api) {
  const { S, THREE } = api;
  const C = B.colonne(api, 1);
  const X0 = CHUCK.x0 - DF * IN;
  const SPY = HEAD.spindleY;
  const W = (obj) => S.at(S.group(obj), [X0, SPY, 0], [0, 0, Math.PI / 2]);
  const P = (ref, obj, ex) => api.part(ref, W(obj), ex);
  const X = (k, f = null, r = 0) => (f == null ? [k, 0, 0] : [k, r * Math.cos(f), r * Math.sin(f)]);

  // --- Haut commun : bague, adaptateur de chapeau, porte-chapeau, bol, mâchoires.
  api.add(W(S.group(B.bagueMandrin(C), ...B.machoires(C))));
  P('10', B.adaptateurChapeau(C), X(-0.2));
  P('9', B.porteChapeau(C, 'yellow'), X(-0.1));
  P('11', B.bol(C), X(0));
  B.entretoisesHaut(C).forEach((o) => P('17', o, X(-0.17)));
  const v = B.visserieHaut(C);
  v.bague.forEach((o) => P('2', o, X(-0.06)));
  v.b34.forEach((o) => P('7', o, X(-0.27)));
  v.porte.forEach((o) => P('3', o, X(-0.14)));
  const t = B.boulonsLiaison(C);
  t.court.forEach((o, i) => P('5', o, X(0.02, PHI.short[i], 0.17)));
  t.long.forEach((o, i) => P('6', o, X(-0.06, PHI.long[i], 0.22)));
  B.ressorts(C).forEach((o) => P('28', o, X(0.13)));
  B.entretoisesBas(C).forEach((o) => P('18', o, X(0.2)));
  B.jointsRadiaux(C).forEach((o) => P('22', o, X(0.22)));

  // --- 12 — Carter 55-0006 : tranches percées (logements des ressorts, taraudages du porte-chapeau, plancher des
  // entretoises), fond lamé pour le centrage du cylindre (Ø 10,72) et les têtes des boulons du cylindre.
  const g = H.hsg;
  const cyl10 = Array.from({ length: 10 }, (_, k) => 36 * k * deg);
  P('12', S.group(
    C.slab(g.ro, g.rb, g.d0, 3.6, B.trousCarterHaut(), 'yellow', 96),
    C.slab(g.ro, g.rb, 3.6, g.dP, PHI.springs.map((f) => [g.rp, f, g.ph]), 'yellow', 96),
    C.slab(g.rb + 0.005, 2.95, g.dB, 6.45, B.trousPlancher(true), 'yellow'),
    C.slab(g.rb + 0.005, 2.95, 6.45, 7.5, B.trousPlancher(false), 'yellow'),
    C.slab(g.ro, 4.18, g.dP, 8.12, [], 'yellow', 96),
    C.slab(g.ro, 5.36, 8.12, 8.55, cyl10.map((f) => [5.68, f, 0.34]), 'yellow', 96),
  ), X(0.33));
  // 30 — Graisseur droit 1/4-28 sur le flanc du carter (éclaté p. 18), à hauteur du bol.
  P('30', C.radial(B.zerk(S), g.ro, 90 * deg, 4.6), X(0.33, 90 * deg, 0.06));

  // --- 13 — Piston et cylindre 55-0200 (page 20) ; lignes 8, 15, 16, 20, 23 à 27, 29 et 31 : même objet.
  const sub = api.sub('P020');
  sub.position.set(X0 + U0 * IN, SPY, 0);
  api.part('13', sub, X(0.52));

  // 4 — Boulons 1/2-13 × 4 1/2 (10) : tête sur la bride du cylindre (dans le fond du carter), au travers de
  // l'adaptateur ; 1 — écrous 1/2-13 (10) noyés sous l'adaptateur.
  cyl10.forEach((f) => P('4', B.hexBolt(C, 0.5, 4.5, 5.6, f, 8.55), X(0.7)));
  cyl10.forEach((f) => P('1', B.hexNut(C, 0.75, 0.44, 5.6, f, 12.82), X(0.95)));

  // 14 — Adaptateur de mandrin 55-0008 : bride Ø 14,6 sur la tête (6 trous de fixation sur Ø 13,5 [estimé]), trous
  // des boulons du cylindre et lamages des écrous, logements des 4 goupilles du piston, moyeu Ø 7,4.
  P('14', S.group(
    C.slab(7.3, 3.7, 11.45, 12.6, [...cyl10.map((f) => [5.6, f, 0.28]), ...[30, 90, 150, 210, 270, 330].map((a) => [6.75, a * deg, 0.28]),
      ...[45, 135, 225, 315].map((a) => [4.0, a * deg, 0.2])], 'yellow', 120),
    C.slab(7.3, 3.7, 12.6, DF, [...cyl10.map((f) => [5.6, f, 0.5]), ...[30, 90, 150, 210, 270, 330].map((a) => [6.75, a * deg, 0.28])], 'yellow', 120),
    C.L([[3.1, 11.8], [3.7, 11.8], [3.7, DF], [3.18, DF], [3.1, DF - 0.08]], 'yellow'),
  ), X(0.86));

  // 21 — Clavettes 55-0015 (3) dans l'alésage du manchon, à φ = 0°, 120°, 240° ; 19 — ressort de verrouillage
  // 55-0013 (jonc en fil qui les retient en tête).
  [0, 120, 240].forEach((a) => P('21', C.put(S.box(0.5 * IN, 4.5 * IN, 0.45 * IN, 'darkSteel'), 2.37, a * deg, 9.85), X(1.08)));
  const jonc = new THREE.Mesh(new THREE.TorusGeometry(2.32 * IN, 0.07 * IN, 8, 64, 330 * deg), B.mat('steel'));
  jonc.rotation.x = Math.PI / 2;
  P('19', C.put(jonc, 0, 0, 7.72), X(1.0));

  return { view: { dir: [-1, 0.6, 0.95] } };
}
