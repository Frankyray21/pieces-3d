// P098 — Centreur fendu V30 CX030900 rév. 2 (pages 98-100) : « ASSY, SPLIT
// CENTRALIZER V30 », repère 3 de P092. Sur le châssis fendu (8, P102), deux
// fourreaux de mâchoires (9, P104) coulissent dans leurs glissières, poussés
// vers l'axe de forage par deux vérins de centrage (4, CM47360) dont le fond
// est articulé dans les supports boulonnés aux deux bouts du châssis (10,
// P110 à droite ; 11, P112 à gauche) ; la tige de chaque vérin est attelée
// dans la poche de la mâchoire par l'axe du fourreau. Au-dessus des
// fourreaux, la plaque à coins (A, P044) est tirée par deux vérins de coins
// (12, CX077208) articulés sur les oreilles de P112 (axes 5, vis de blocage
// 21). Sous le caisson : verrou de fermeture (13, P114, vis CHC 20 et
// rondelles Nord-Lock 23, adaptateurs 16), joint racleur et plaque racleuse
// des mâchoires (B, P146) logés dans le demi-couvercle (2) et la demi-bague
// (3) vissés sous le caisson (vis 19, rondelles 24), entonnoir de déviation
// des déblais (1) à sortie latérale ouverte ; bouchon 17 sur le caisson. Aux chapes basses
// du châssis : axes 7 des vérins de pivotement (entretoises 6, vis 18,
// rondelles 22, écrous 25). Raccords : sur chaque vérin 4, un coude 14 et un
// adaptateur 15, orifices vers le bas ; sur chaque vérin 12, deux coudes 14.
// Lignes A / B (plaques à coins et jeux de mâchoires selon le diamètre de
// tige) : le jeu monté est celui des tiges Ø 5 po (CX031068 = P044,
// CX034953-500 = P146) ; les autres options n'ont pas d'objet.
// Repère : celui du châssis P102 — origine au milieu des deux axes de pivot,
// sous les moyeux bas (appui sur le pied de mât P116), Y vers le haut, X
// selon la ligne des pivots (axes à x = ±11 po), +Z vers l'axe de forage
// (z = 20.4 po = 0.518 m). Mâchoires fermées : fourreaux et mâchoires
// glissés dans le caisson par ses flancs ouverts (dessous des mâchoires à
// y = 7.82 po), vérins de centrage sortis (axe à y = 9.3 po) ; plaque à coins
// posée sur le caisson (y = 12 po) entre ses glissières.
// Disposition d'après les isométries des pages 98 et 100 ; vérins 4 et 12
// (sans page propre) d'après leurs proportions sur ces vues. Les supports 10
// et 11 sont centrés sur l'axe des vérins de centrage : leur semelle dépasse
// un peu sous le caisson.
import { L, u, IN, along, shcs, fhcs, hhcs, nordLock, flatWasher, nylocNut, jicAdapter, jicElbow } from './_avance_b.js';
import { FRAME102 } from './P102.js';
import { TUBE106 } from './P106.js';
import { BRACKET112 } from './P112.js';
import { LOCK114 } from './P114.js';
import { CYL094 } from './P094.js';

const DZ = 20.4; // axe de forage (po)
const TY = 6.8 + 0.5 + 0.52; // dessous des mâchoires = dessus de la tôle basse des fourreaux, posés dans le caisson (po)
const CY = 9.3; // axe des vérins de centrage, au droit de la poche des mâchoires (po)
const BX = 17.1; // axe du support (point d'articulation) : semelle contre le flanc x = ±13.1
const SY = 12.0; // dessous de la plaque à coins, posée sur le caisson entre ses glissières (po)

export const CENT098 = { drillZ: u(DZ), jawY: u(TY), slipY: u(SY) };

export default function P098(api) {
  const { THREE, S } = api;
  const { merged, group, at, extrude } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const pin = (x, y, z) => [u(x), u(y), u(z)];
  // Objet orienté par sa base locale (X, Y ; Z = X × Y), placé en pos (m).
  const frame = (obj, X, Y, pos) => {
    const x = X.clone().normalize(), y = Y.clone().normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    const g = new THREE.Group();
    g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    g.position.set(...pos);
    return g;
  };

  // ================================================ 8 — châssis
  P('8', api.sub('P102'), [0, 0, 0]);

  // ================================================ 9 — fourreaux, B — mâchoires
  for (const s of [1, -1]) {
    const t = at(api.sub('P104'), pin(0, TY, DZ), s < 0 ? [0, Math.PI, 0] : null);
    P('9', t, [s * 0.16, 0.12, 0]);
  }
  P('B', at(api.sub('P146'), pin(0, TY, DZ)), [0, 0.3, 0]);

  // ================================================ 10 / 11 — supports des vérins
  // Repère des supports : X selon l'axe d'articulation, Z de la semelle vers
  // l'ouverture du caisson (vers l'extérieur du châssis), Y vers le haut.
  P('10', frame(api.sub('P110'), V(0, 0, -1), V(0, 1, 0), pin(BX, CY, DZ)), [0.2, 0, 0]);
  P('11', frame(api.sub('P112'), V(0, 0, 1), V(0, 1, 0), pin(-BX, CY, DZ)), [-0.2, 0, 0]);

  // ================================================ 4 — vérins de centrage
  // Le long de +Y local, de l'œil de fond (axe selon X local = axe du support,
  // horizontal) à l'œil de tige (axe selon Z local = vertical, axe du fourreau).
  // Alésage 3 po (tube Ø 3 1/2), tige Ø 1 1/2, deux orifices vers +Z local.
  const elbows = [];
  const centCyl = (len) => {
    const body = [
      L(S, [[0.64, -1.45], [1.12, -1.45], [1.12, 1.45], [0.64, 1.45], [0.64, -1.45]], 'grey', 32, { axis: 'x' }),
      L(S, [[0, 0.9], [1.6, 0.9], [1.75, 1.05], [1.75, 1.6], [0, 1.6]], 'grey', 40),
      S.shell(u(1.75), u(1.5), u(5.9), 'grey', { seg: 40, pos: [0, u(4.55), 0] }),
      L(S, [[0.78, 7.5], [1.8, 7.5], [1.8, 8.1], [1.72, 8.2], [0.78, 8.2], [0.78, 7.5]], 'grey', 40),
      S.box(u(0.7), u(0.8), u(1.6), 'grey', { pos: [0, u(0.45), 0] }),
    ];
    for (const y of [2.3, 6.9]) body.push(L(S, [[0.2, 1.5], [0.42, 1.5], [0.42, 2.0], [0.2, 2.0], [0.2, 1.5]], 'grey', 20, { axis: 'z', pos: [0, u(y), 0] }));
    const rodEye = [
      L(S, [[0.5, -0.375], [1.0, -0.375], [1.0, 0.375], [0.5, 0.375], [0.5, -0.375]], 'grey', 32, { axis: 'z', pos: [0, u(len), 0] }),
      L(S, [[0, len - 2.0], [0.6, len - 2.0], [0.62, len - 0.95], [0, len - 0.95]], 'grey', 24),
    ];
    const g = group(
      merged([...body, ...rodEye], 'grey'),
      L(S, [[0, 7.0], [0.75, 7.0], [0.75, len - 2.05], [0, len - 2.05]], 'chrome', 28),
      L(S, [[0.76, 8.2], [0.95, 8.2], [0.95, 8.3], [0.76, 8.35], [0.76, 8.2]], 'rubber', 28),
    );
    return g;
  };
  for (const s of [1, -1]) {
    const len = BX - 4.52; // axe du support → axe du fourreau
    const c = frame(centCyl(len), V(0, 0, s), V(-s, 0, 0), pin(s * BX, CY, DZ));
    P('4', c, [s * 0.1, 0.22, 0]);
    // Orifices vers le bas : coude 14 côté fond, adaptateur droit 15 côté tige.
    elbows.push({ pos: pin(s * (BX - 2.3), CY - 2.0, DZ), dir: [0, -1, 0], nose: [0, 0, s], e: [s * 0.1, -0.15, 0] });
    P('15', along(THREE, jicAdapter(S, THREE, 4, { jicDash: 4 }), [0, -1, 0], pin(s * (BX - 6.9), CY - 2.0, DZ)), [s * 0.1, -0.15, 0]);
  }

  // ================================================ A — plaque à coins
  // P044 : +Z local (chapes) vers -X ; fente ouverte vers +X, coiffant la tige.
  P('A', at(api.sub('P044'), pin(0, SY, DZ), [0, -Math.PI / 2, 0]), [0, 0.4, 0]);

  // ================================================ 12 — vérins de coins, 5 — axes, 21 — vis
  // Oreilles de P112 (repère du support : X → +Z, Y → Y, Z → -X).
  const lugs = BRACKET112.lugAxes.map(([x, y, z]) => [-u(BX) - z, u(CY) + y, u(DZ) + x]);
  // Chapes de la plaque à coins (P044 : axes à ±90.5 mm, 71 mm du fond de
  // fente, 2 1/8 po au-dessus de son dessous).
  const clev = [-1, 1].map((sz) => [-0.071, u(SY + 2.125), u(DZ) + sz * 0.0905]);
  const slipCyl = (len) => {
    // Fourche de fond (autour de l'oreille, axe selon X local), corps Ø 2 1/2,
    // tige Ø 1, œil de tige (axe X local) dans la chape de la plaque.
    const lt = BRACKET112.lugT / IN + 0.08;
    const fork = [];
    for (const s of [-1, 1]) fork.push(L(S, [[0, -0.375 / 2], [0.7, -0.375 / 2], [0.7, 0.375 / 2], [0, 0.375 / 2]], 'grey', 28, { axis: 'x', pos: [u(s * (lt / 2 + 0.19)), 0, 0] }));
    fork.push(S.box(u(lt + 0.75), u(0.9), u(1.4), 'grey', { pos: [0, u(0.95), 0] }));
    const body = [
      ...fork,
      L(S, [[0, 1.3], [1.25, 1.3], [1.25, len * 0.58], [1.3, len * 0.58], [1.3, len * 0.58 + 0.5], [0.55, len * 0.58 + 0.5], [0, len * 0.58 + 0.5]], 'grey', 36),
      L(S, [[0.39, -0.36], [0.75, -0.36], [0.75, 0.36], [0.39, 0.36], [0.39, -0.36]], 'grey', 28, { axis: 'x', pos: [0, u(len), 0] }),
      L(S, [[0, len - 1.6], [0.55, len - 1.6], [0.55, len - 0.7], [0, len - 0.7]], 'grey', 20),
      L(S, [[0.2, 1.25], [0.38, 1.25], [0.38, 1.6], [0.2, 1.6], [0.2, 1.25]], 'grey', 16, { axis: 'z', pos: [0, u(2.4), 0] }),
      L(S, [[0.2, 1.25], [0.38, 1.25], [0.38, 1.6], [0.2, 1.6], [0.2, 1.25]], 'grey', 16, { axis: 'z', pos: [0, u(len * 0.58 - 0.6), 0] }),
    ];
    return group(merged(body, 'grey'), L(S, [[0, len * 0.58 + 0.4], [0.5, len * 0.58 + 0.4], [0.5, len - 1.55], [0, len - 1.55]], 'chrome', 24));
  };
  lugs.forEach((lp, i) => {
    const cp = clev[i];
    const d = V(cp[0] - lp[0], cp[1] - lp[1], cp[2] - lp[2]);
    const len = d.length() / IN;
    const Y = d.clone().normalize();
    const X = V(0, 0, 1).addScaledVector(Y, -Y.z).normalize();
    const c = frame(slipCyl(len), X, Y, lp);
    P('12', c, [-0.08, 0.3, 0]);
    // Orifices vers +Z local (vers le haut) : deux coudes 14.
    const Zl = new THREE.Vector3().crossVectors(X, Y);
    const port = (y) => V(...lp).addScaledVector(Y, u(y)).addScaledVector(Zl, u(1.6));
    const p1 = port(2.4), p2 = port(len * 0.58 - 0.6);
    elbows.push({ pos: p1.toArray(), dir: Zl.toArray(), nose: Y.toArray(), e: [-0.08, 0.36, 0] });
    elbows.push({ pos: p2.toArray(), dir: Zl.toArray(), nose: Y.clone().negate().toArray(), e: [-0.08, 0.36, 0] });
    // 5 — axe de chape Ø 3/4 × 2 1/4 po (selon Z), tête Ø 1 po côté +Z ;
    // 21 — vis FHC 3/8 × 5/8 dans la joue de la fourche, tête sur la gorge.
    const lt = BRACKET112.lugT / IN + 0.08;
    const half = lt / 2 + 0.375 + 0.05;
    const pinObj = L(S, [[0, -half], [0.33, -half], [0.375, -half + 0.05], [0.375, half], [0.5, half], [0.5, half + 0.2], [0.46, half + 0.24], [0, half + 0.24]], 'steel', 20, { axis: 'z' });
    P('5', at(pinObj, lp), [0, 0, 0.12]);
    P('21', along(THREE, fhcs(S, THREE, 0.375, 0.625), [0, 0, 1], [lp[0], lp[1] + u(0.62), lp[2] + u(half)]), [0, 0, 0.16]);
  });

  // ================================================ 14 — coudes (vérins 4 et 12)
  elbows.forEach(({ pos, dir, nose, e }) => {
    P('14', frame(jicElbow(S, THREE, 4), V(...nose), V(...dir), pos), e);
  });

  // ================================================ 13 — verrou, 20 / 23, 16
  const [lx, lz] = FRAME102.lockPin;
  const ly = u(6.8); // dessous du caisson
  P('13', at(api.sub('P114'), [lx, ly, lz]), [0, -0.15, 0]);
  const tNL = u(2 * Math.max(0.05, 0.375 * 0.11));
  LOCK114.boltHoles.forEach(([x, z]) => {
    const yb = ly - LOCK114.flangeT;
    P('23', at(nordLock(S, THREE, 0.375), [lx + x, yb - tNL, lz + z]), [0, -0.2, 0]);
    P('20', at(shcs(S, THREE, 0.375, 1.25), [lx + x, yb - tNL, lz + z], [Math.PI, 0, 0]), [0, -0.26, 0]);
  });
  LOCK114.ports.forEach(([x, y]) => P('16', along(THREE, jicAdapter(S, THREE, 6), [1, 0, 0], [lx + x, ly + y, lz]), [0.06, -0.15, 0]));

  // ================================================ 7 — axes des vérins de pivotement
  // Aux chapes basses de P102 (x = ±14.8 po) : axe Ø 1 po à tête, entretoises
  // 6 de part et d'autre de l'œil de fond de P094, vis 18 en travers au bas,
  // rondelles 22 et écrou 25.
  {
    const { lug } = FRAME102;
    const yTop = lug.y[1] + lug.t; // dessus de la chape haute
    const yBot = lug.y[0]; // dessous de la chape basse
    const gap = lug.y[1] - (lug.y[0] + lug.t);
    const t6 = (gap - CYL094.capEyeW) / 2 - 0.0008;
    for (const s of [1, -1]) {
      const x = s * lug.x;
      const len = (yTop - yBot) / IN + 0.7;
      // Bout percé en travers (Ø 0.28 po, selon Z) pour la vis 18.
      const yh0 = -(yTop - yBot) / IN - 0.35;
      const p7 = merged([
        L(S, [[0, -len + 0.7], [0.5, -len + 0.7], [0.5, 0], [0.75, 0], [0.75, 0.25], [0.7, 0.3], [0, 0.3]], 'steel', 24),
        S.slotted(u(0.5), u(0.02), u(-len), u(-len + 0.7), S.roundHole(0, u(yh0), u(0.14), u(0.5), { through: true, steps: 6 }), 'steel', { seg: 24 }),
      ], 'steel');
      P('7', at(p7, [x, yTop, 0]), [0, 0.2, 0]);
      for (const y of [lug.y[0] + lug.t, lug.y[1] - t6]) P('6', at(L(S, [[0.52, 0], [0.875, 0], [0.875, t6 / IN], [0.52, t6 / IN], [0.52, 0]], 'zinc', 28), [x, y, 0]), [s * 0.08, 0, 0]);
      const yh = yBot - u(0.35);
      P('22', along(THREE, flatWasher(S, THREE, 0.25), [0, 0, 1], [x, yh, u(0.5)]), [0, -0.05, 0.06]);
      P('18', along(THREE, hhcs(S, THREE, 0.25, 2.25), [0, 0, 1], [x, yh, u(0.5) + u(0.065)]), [0, -0.05, 0.1]);
      P('22', along(THREE, flatWasher(S, THREE, 0.25), [0, 0, -1], [x, yh, -u(0.5)]), [0, -0.05, -0.06]);
      P('25', along(THREE, nylocNut(S, THREE, 0.25), [0, 0, -1], [x, yh, -u(0.5) - u(0.065)]), [0, -0.05, -0.1]);
    }
  }

  // ================================================ 2 / 3 — demi-couvercle et demi-bague du racleur
  // Logement annulaire sous le caisson autour de l'axe de forage : paroi
  // Ø 11 1/4 × 1/4 po, rebord bas intérieur (appui de la plaque racleuse),
  // pattes vissées sous le caisson (vis 19 et rondelles 24).
  const yC0 = 4.1, yC1 = 6.8;
  const halfRing = (front) => {
    const a0 = front ? 0 : Math.PI;
    const n = 24, Ro = 5.75, Ri = 5.5;
    const arc = (r) => Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + (Math.PI * i) / n;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    // Paroi demi-cylindrique : extrusion d'une couronne d'arc selon Y.
    const ring = [...arc(Ro), ...arc(Ri).reverse()];
    const wall = extrude(ring.map(([x, z]) => [u(x), -u(z)]), u(yC1 - yC0), 'grey');
    wall.rotation.x = -Math.PI / 2;
    wall.position.set(0, u((yC0 + yC1) / 2), u(DZ));
    const lip = [...arc(Ri), ...arc(4.6).reverse()];
    const lipM = extrude(lip.map(([x, z]) => [u(x), -u(z)]), u(0.25), 'grey');
    lipM.rotation.x = -Math.PI / 2;
    lipM.position.set(0, u(yC0 + 0.125), u(DZ));
    const tabs = [];
    for (const sx of [1, -1]) {
      const tb = extrude([[5.6, -0.8], [7.4, -0.8], [7.4, 0.8], [5.6, 0.8]].map(([x, z]) => [u(sx * x), -u(z)]), u(0.375), 'grey', { holes: [[u(sx * 6.7), 0, u(0.28)]] });
      tb.rotation.x = -Math.PI / 2;
      tb.position.set(0, u(yC1 - 0.19), u(DZ + (front ? 0.85 : -0.85)));
      tabs.push(tb);
    }
    return merged([wall, lipM, ...tabs], 'grey');
  };
  P('2', halfRing(true), [0, -0.12, 0.12]);
  P('3', halfRing(false), [0, -0.12, -0.12]);
  for (const front of [true, false]) {
    for (const sx of [1, -1]) {
      const p = [u(sx * 6.7), u(yC1 - 0.375), u(DZ + (front ? 0.85 : -0.85))];
      P('24', at(nordLock(S, THREE, 0.5), [p[0], p[1] - u(0.11), p[2]]), [0, -0.16, front ? 0.12 : -0.12]);
      P('19', at(hhcs(S, THREE, 0.5, 1.0), [p[0], p[1] - u(0.11), p[2]], [Math.PI, 0, 0]), [0, -0.22, front ? 0.12 : -0.12]);
    }
  }

  // ================================================ 1 — entonnoir de déviation
  // Collerette Ø 12 1/2 percée (fixée sous la plaque racleuse), cône de tôle
  // 3/16 po s'évasant vers le bas, sortie latérale Ø 4 po ouverte vers +X
  // (évacuation des déblais).
  {
    const y0 = yC0 - 0.4;
    const t = 0.1875;
    const parts = [
      L(S, [[4.6, y0], [6.25, y0], [6.25, y0 + 0.375], [4.6, y0 + 0.375], [4.6, y0]], 'grey', 48, { pos: [0, 0, u(DZ)] }),
      L(S, [[4.6, y0], [4.6 + t, y0], [9.0 + t, y0 - 10.5], [9.0, y0 - 10.5], [4.6, y0]], 'grey', 48, { pos: [0, 0, u(DZ)] }),
      // Sortie latérale : manchon Ø 4 po soudé sur le cône, bout ouvert.
      L(S, [[1.8, 0], [2.0, 0], [2.0, 4.6], [1.8, 4.6], [1.8, 0]], 'grey', 32, { axis: 'x', pos: [u(5.5), u(y0 - 4.5), u(DZ)] }),
    ];
    const funnel = merged(parts, 'grey');
    funnel.userData.hasInterior = true;
    P('1', at(group(funnel), [0, 0, 0]), [0, -0.35, 0]);
    // 17 — bouchon 3/4 NPT à six-pans creux, affleurant le dessus du caisson
    // au droit du moyeu du verrou (graissage / purge du pêne).
    const hx = 0.3125 / Math.cos(Math.PI / 6);
    const plug = merged([
      L(S, [[0, -0.7], ...S.thread(0.51, -0.7, -0.05, { r1: 0.525, pitch: 0.07, maxTurns: 5 }), [0.525, 0], [hx, 0], [hx, -0.35], [0, -0.4]], 'blackOxide', 20),
    ], 'blackOxide');
    P('17', along(THREE, plug, [0, 1, 0], [FRAME102.lockPin[0], FRAME102.top + 0.0005, FRAME102.lockPin[1]]), [0, 0.15, 0]);
  }

  return { view: { dir: [1, 0.8, 1.15] } };
}
