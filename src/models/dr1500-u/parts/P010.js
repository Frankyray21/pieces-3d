// P010 — Pompe à eau (page 10, 7 repères) : support PA037, pompe triplex Pratissoli KF40, garde des moyeux,
// accouplement à chaîne (deux moyeux-pignons et chaîne double), moteur hydraulique Rexroth HA-028.
// Repère local : origine au sol du support (dessous de ses ailes), au milieu ; X le long de l'arbre de la pompe,
// vers le moteur ; Y vers le haut ; Z vers les têtes de la pompe (culasse à trois têtes). Posé par P009 sur ses
// longerons intérieurs (ligne 3 de P009, sous-assemblage PA037).
// Cotes : pompe et moteur à l'encombrement de catalogue [catalogue Pratissoli KF40 : arbre Ø 40 mm clavette 12 mm
// (désignation du moyeu 18179943), carter ≈ 0,31 × 0,26 m, culasse ≈ 0,30 × 0,22 m ; moteur Rexroth : arbre
// 1 1/4 po clavette 5/16 po (moyeu 18179941), bride carrée ≈ 0,11 m, corps Ø ≈ 0,13 m] ; accouplement à chaîne
// au pas 5/8 po (série 50, désignations 5015 et 5016) [norme ANSI 50] ; support et garde proportionnés au dessin
// de la page 10 [mesure].
// Coquille probable du manuel : les deux moyeux d'un accouplement à chaîne ont le même nombre de dents ; « 5015 »
// (15 dents) face à « 5016 » (16 dents) : modélisés tels que listés (15 et 16 dents).
import { slab, rect, arc } from './_groupes.js';
import { IN } from '../layout.js';

// Support PA037 : tôle pliée 1/2 po (dessus et deux ailes), plaque verticale du moteur et gousset [mesure p. 10].
export const SUP = { x0: -0.27, x1: 0.25, z: 0.22, h: 0.0877, t: 0.0127 };
const AY = SUP.h + 0.122; // axe de l'arbre de la pompe au-dessus du sol du support [catalogue KF40 : ≈ 122 mm sous pattes]
const ZS = -0.08; // axe de l'arbre en Z (carter vers −Z, têtes vers +Z)
const XP = SUP.x1; // face −X de la plaque du moteur
const P50 = 0.625 * IN; // pas de la chaîne série 50
const pd = (n) => P50 / Math.sin(Math.PI / n) / 2; // rayon primitif d'un pignon à n dents

export default function P010(api) {
  const S = api.S, { box, cyl, lathe, at, group, merged, ring, bolt, nut, gear } = S;
  const ox = (x) => [x, AY, ZS];
  const { x0, x1, z, h, t } = SUP;

  // ------------------------------------------------------------------ 1 — Support pompe à eau PA037
  // Dessus percé (pattes de la pompe, trous d'allègement), ailes pliées à trous de fixation aux bouts et
  // dégagement au milieu, plaque verticale du moteur (alésage de centrage et 4 trous), gousset.
  const aile = slab(api, [[x0, 0], [-0.09, 0], ...arc(0, 0, 0.09, Math.PI, 0, 10).map(([u, v]) => [u, v * 0.45]), [x1, 0], [x1, h - t], [x0, h - t]],
    [[x0 + 0.04, h / 2 - 0.006, 0.012], [x1 - 0.04, h / 2 - 0.006, 0.012]], t, 'red');
  const pied = [-0.17, 0.03].flatMap((x) => [-1, 1].map((s) => [x, ZS + s * 0.09]));
  const dessus = at(S.plate(x1 - x0, 2 * z, t, 'red', { r: 0.008, holes: [...pied.map(([x, zz]) => [x - (x0 + x1) / 2, zz, 0.008]), [0.12 - (x0 + x1) / 2, 0.12, 0.012], [-0.24 - (x0 + x1) / 2 + 0.05, 0.15, 0.012], [0.05, 0.15, 0.008]] }), [(x0 + x1) / 2, h - t / 2, 0]);
  const pw = 0.17, ph = AY + 0.1;
  const plaque = at(slab(api, [[ZS - pw / 2, h], [ZS + pw / 2, h], [ZS + pw / 2, ph - 0.02], [ZS + pw / 2 - 0.02, ph], [ZS - pw / 2 + 0.02, ph], [ZS - pw / 2, ph - 0.02]].map(([u, v]) => [-u, v]),
    [[-ZS, AY, 0.045], ...[-1, 1].flatMap((a) => [-1, 1].map((b) => [-(ZS + a * 0.045), AY + b * 0.045, 0.0065]))], t, 'red'), [XP + t / 2, 0, 0], [0, Math.PI / 2, 0]);
  const gousset = at(slab(api, [[XP + t, h], [XP + t + 0.1, h], [XP + t, AY + 0.04]], [], t, 'red'), [0, 0, ZS - pw / 2 + t / 2]);
  api.part('1', group(merged([dessus, at(aile, [0, 0, z - t / 2]), at(aile.clone(), [0, 0, -z + t / 2]), plaque, gousset], 'red')), [0, 0, 0]);

  // ------------------------------------------------------------------ 2 — Pompe Pratissoli KF40
  // Carter en fonte gris foncé (bouchon de remplissage d'huile jaune, couvercles de paliers boulonnés, regard), arbre
  // Ø 40 à clavette vers +X ; corps de plongeurs et culasse en laiton nickelé (gris clair) vers +Z : trois têtes de
  // clapets en bulbe sur la face avant (refoulement) et trois dessus (aspiration), collecteurs bouchonnés.
  const cc = { x0: -0.21, x1: 0.1, y0: h, y1: h + 0.26, z0: ZS - 0.11, z1: ZS + 0.11 };
  const hc = { x0: -0.2, x1: 0.09, y0: h + 0.025, y1: h + 0.235, z0: ZS + 0.17, z1: ZS + 0.3 };
  const xs = [-0.155, -0.055, 0.045]; // axes des trois plongeurs
  const bulbe = (r, l) => lathe([[0, 0], [r, 0], [r * 1.05, l * 0.35], [r * 0.85, l * 0.8], [r * 0.4, l], [0, l]], 'zinc', { seg: 20 });
  api.part('2', group(
    at(box(cc.x1 - cc.x0, cc.y1 - cc.y0 - 0.03, cc.z1 - cc.z0, 'castIron', { r: 0.03 }), [(cc.x0 + cc.x1) / 2, (cc.y0 + cc.y1 + 0.03) / 2, ZS]),
    ...pied.map(([x, zz]) => at(box(0.06, 0.03, 0.05, 'castIron', { r: 0.005 }), [x, h + 0.015, zz])),
    ...pied.map(([x, zz]) => at(bolt(0.014, 0.05, 'steel', { washer: true }), [x, h + 0.03, zz])),
    // Couvercles de paliers et arbre.
    at(lathe([[0, 0], [0.1, 0], [0.1, 0.012], [0.07, 0.03], [0, 0.03]], 'castIron', { axis: 'x', seg: 36 }), ox(cc.x1)),
    at(lathe([[0, 0], [0.1, 0], [0.1, 0.012], [0.07, 0.025], [0, 0.025]], 'castIron', { axis: '-x', seg: 36 }), ox(cc.x0)),
    S.boltCircle(6, 0.088, 0.008, 0.012, 'steel', { axis: 'x', pos: ox(cc.x1 + 0.012) }),
    at(cyl(0.02, 0.04, 'steel', { axis: 'x', seg: 24 }), ox(cc.x1 + 0.05)),
    at(box(0.03, 0.006, 0.012, 'steel'), [cc.x1 + 0.05, AY + 0.021, ZS]),
    // Bouchon de remplissage d'huile (jaune) et regard de niveau.
    at(lathe([[0, 0], [0.025, 0], [0.025, 0.03], [0.018, 0.04], [0, 0.04]], 'safety', { seg: 20 }), [-0.06, cc.y1, ZS - 0.04]),
    at(ring(0.022, 0.015, 0.006, 'steel', { axis: 'z', seg: 24 }), [-0.06, AY - 0.04, cc.z0 - 0.002]),
    at(cyl(0.015, 0.004, 'glass', { axis: 'z', seg: 24 }), [-0.06, AY - 0.04, cc.z0 - 0.002]),
    // Corps des plongeurs entre carter et culasse.
    at(box(cc.x1 - cc.x0 - 0.04, 0.17, hc.z0 - cc.z1, 'castIron', { r: 0.01 }), [(cc.x0 + cc.x1) / 2 - 0.005, AY + 0.01, (cc.z1 + hc.z0) / 2]),
    // Culasse : bloc, bulbes des clapets (refoulement en face +Z, aspiration dessus), collecteurs latéraux.
    at(box(hc.x1 - hc.x0, hc.y1 - hc.y0, hc.z1 - hc.z0, 'zinc', { r: 0.015 }), [(hc.x0 + hc.x1) / 2, (hc.y0 + hc.y1) / 2, (hc.z0 + hc.z1) / 2]),
    ...xs.map((x) => at(bulbe(0.035, 0.05), [x, AY - 0.02, hc.z1], [Math.PI / 2, 0, 0])),
    ...xs.map((x) => at(bulbe(0.032, 0.045), [x, hc.y1, (hc.z0 + hc.z1) / 2])),
    ...xs.map((x) => at(cyl(0.012, 0.012, 'steel', { axis: 'z', seg: 6 }), [x, AY + 0.06, hc.z1 + 0.006])),
    ...[hc.x0, hc.x1].map((x) => at(cyl(0.03, 0.03, 'zinc', { axis: 'x', seg: 6 }), [x + Math.sign(x) * 0.015, AY - 0.02, (hc.z0 + hc.z1) / 2])),
    ...[-1, 1].flatMap((s) => [-1, 1].map((u) => at(bolt(0.012, 0.03, 'steel', { axis: 'z' }), [(hc.x0 + hc.x1) / 2 + s * 0.13, (hc.y0 + hc.y1) / 2 + u * 0.085, hc.z1 + 0.002]))),
  ), [-0.15, 0.5, 0.1]);

  // ------------------------------------------------------------------ Accouplement à chaîne (série 50)
  // 4 — moyeu-pignon 15 dents alésage 40 mm sur l'arbre de la pompe ; 6 — moyeu-pignon 16 dents alésage 1 1/4 po sur
  // l'arbre du moteur ; 5 — chaîne double qui les enveloppe (rouleaux et plaques).
  const sw = 0.0145; // largeur d'une denture (une rangée de chaîne 50) [norme]
  const xa = 0.155, xb = xa + 2 * sw + 0.006; // dentures côte à côte, jeu de 6 mm
  const hub = (n, xT, xH, dir, bore, L) => group(
    at(gear(pd(n) - 0.0055, pd(n) + 0.0045, n, sw, 'steel', { axis: 'x', hole: bore / 2 }), ox(xT)),
    at(lathe([[bore / 2, 0], [0.034, 0], [0.034, L], [bore / 2, L]], 'steel', { axis: dir, seg: 28 }), ox(xH)),
    at(cyl(0.004, 0.012, 'blackOxide', { axis: 'y', seg: 8 }), [xH + (dir === 'x' ? L / 2 : -L / 2), AY + 0.034, ZS]),
  );
  api.part('4', hub(15, xa + sw / 2, xa, '-x', 0.04, 0.024), [0.3, 0, 0]);
  api.part('6', hub(16, xa + 1.5 * sw + 0.006, xb, 'x', 1.25 * IN, 0.035), [0.5, 0, 0]);
  const rouleaux = [];
  const rc = pd(16);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    rouleaux.push(at(cyl(0.005, 2 * sw + 0.006, 'steel', { axis: 'x', seg: 10 }), [(xa + xb) / 2, AY + Math.sin(a) * rc, ZS + Math.cos(a) * rc]));
  }
  api.part('5', group(
    merged(rouleaux, 'steel'),
    ...[xa - 0.002, (xa + xb) / 2, xb + 0.002].map((x) => at(ring(rc + 0.009, rc - 0.008, 0.0025, 'darkSteel', { axis: 'x', seg: 32 }), ox(x))),
  ), [0.4, 0.15, 0]);

  // ------------------------------------------------------------------ 3 — Garde des moyeux PP0210
  // Tôle pliée en U renversé au-dessus de l'accouplement (dessus, deux joues dont une ajourée en U), pattes du bas
  // vissées sur le dessus du support [mesure p. 10].
  const gx0 = 0.135, gx1 = XP - 0.003, gz = 0.075, gy = AY + 0.075, gw = gx1 - gx0;
  const joue = (s, jour) => at(slab(api, [[gx0, h], [gx1, h], [gx1, gy], [gx0, gy]], jour ? [[[gx0 + 0.02, h + 0.04], [gx1 - 0.02, h + 0.04], [gx1 - 0.02, gy - 0.03], [gx0 + 0.055, gy - 0.03], [gx0 + 0.055, AY - 0.02], [gx0 + 0.02, AY - 0.02]]] : [], 0.003, 'red'), [0, 0, ZS + s * gz]);
  api.part('3', group(
    at(box(gw, 0.003, 2 * gz + 0.003, 'red'), [(gx0 + gx1) / 2, gy + 0.0015, ZS]),
    joue(1, true), joue(-1, false),
    ...[-1, 1].map((s) => at(box(gw, 0.003, 0.03, 'red'), [(gx0 + gx1) / 2, h + 0.0015, ZS + s * (gz + 0.015)])),
    ...[-1, 1].map((s) => at(bolt(0.008, 0.02, 'steel', { washer: true }), [(gx0 + gx1) / 2, h + 0.003, ZS + s * (gz + 0.017)])),
  ), [0.05, 0.45, 0]);

  // ------------------------------------------------------------------ 7 — Moteur hydraulique Rexroth HA-028
  // Bride carrée à quatre trous contre la plaque du support, corps rond, couvercle arrière bombé, bloc des deux
  // orifices sur le flanc, arbre 1 1/4 po vers la pompe (au travers de la plaque).
  const mx = XP + t; // face de la bride
  api.part('7', group(
    at(slab(api, rect(0, 0, 0.115, 0.115), [...[-1, 1].flatMap((a) => [-1, 1].map((b) => [a * 0.045, b * 0.045, 0.0065]))], 0.018, 'blackCast'), [mx + 0.009, AY, ZS], [0, Math.PI / 2, 0]),
    at(lathe([[0, 0], [0.04, 0], [0.04, -0.012], [0, -0.012]], 'blackCast', { axis: 'x', seg: 28 }), ox(mx)),
    at(cyl(0.066, 0.13, 'blackCast', { axis: 'x', seg: 40 }), ox(mx + 0.018 + 0.065)),
    at(lathe([[0, 0], [0.068, 0], [0.068, 0.012], [0.05, 0.03], [0, 0.034]], 'blackCast', { axis: 'x', seg: 40 }), ox(mx + 0.148)),
    at(box(0.07, 0.05, 0.08, 'blackCast', { r: 0.008 }), [mx + 0.11, AY, ZS + 0.07]),
    ...[-0.022, 0.022].map((dx) => at(cyl(0.012, 0.012, 'steel', { axis: 'z', seg: 6 }), [mx + 0.11 + dx, AY, ZS + 0.116])),
    at(cyl(1.25 * IN / 2, mx - (xb - 0.002), 'steel', { axis: 'x', seg: 20 }), ox((mx + xb - 0.002) / 2)),
    ...[-1, 1].flatMap((a) => [-1, 1].map((b) => at(bolt(0.0127, 0.05, 'steel', { axis: 'x', washer: true }), [mx + 0.018, AY + b * 0.045, ZS + a * 0.045]))),
    ...[-1, 1].flatMap((a) => [-1, 1].map((b) => at(nut(0.019, 0.011, 'steel', { axis: 'x' }), [XP - 0.0055, AY + b * 0.045, ZS + a * 0.045]))),
  ), [0.7, 0, 0]);

  return { view: { dir: [0.35, 0.55, 1] } };
}
