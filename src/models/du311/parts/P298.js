// P298 — Vilebrequin et poulie du compresseur surpresseur Le Roi CP48001 :
// CP48001-CRANKSHAFT « COMPRESSOR CRANKSHAFT AND FLYWHEEL » (page 298).
// Vilebrequin (1) à un seul maneton (les trois bielles côte à côte), deux
// bras à contrepoids, tourillons des deux cônes de roulements à rouleaux
// coniques (3, ×2 ; cuvettes dans le carter P296 rep. 3 et le flasque P302
// rep. 1), bout arrière à clavette qui entraîne le rotor de la pompe à huile
// (P302), bout avant Ø 1 1/4 po à rainure de clavette (4, 1/2 × 1/2 × 3 1/4
// po). Poulie « 5VP » quatre gorges en fonte (8, volant du compresseur) :
// jante Ø 16 po, trois bras courbes, moyeu ; serrée en bout d'arbre par la
// rondelle épaisse (5), la rondelle Grower (6) et la vis H 1/2-13 (7).
// Repère du bloc (_moteur_surpresseur.js) : origine sur l'axe du vilebrequin
// au droit du cylindre central, +X vers la poulie, Y vers le haut. Option
// { crank } : angle du maneton (rad, vu de +X, depuis +Y vers +Z ; défaut
// LR.crank = 0, maneton en haut, PMH du cylindre central) — tout l'ensemble
// tourne de cet angle autour de X.
// Encombrement 0.442 (X, de −0.175 au bout du bout arrière à 0.267 à la tête
// de vis) × 0.406 × 0.406 m (jante Ø 16 po à x = LR.sheaveX = 0.215).
// Cotes estimées (dessin non coté) : maneton Ø 45 mm, tourillons Ø 35 mm,
// course 3 po, gorges 5V (pas 17,5 mm, 38°).

import { LR, IN, MM, lrCircle } from './_moteur_surpresseur.js';

export default function P298(api, opts = {}) {
  const { S } = api;
  const { lathe, extrude, box, bolt, washer, ring, cyl, merged, group, at } = S;
  const crank = opts.crank ?? LR.crank;
  const turn = (obj) => at(group(obj), [0, 0, 0], [crank, 0, 0]);
  const P = (ref, obj, e) => api.part(ref, turn(obj), e);
  const R = LR.crankR;

  // Profil (z, y) extrudé selon X sur l'épaisseur t, centré en x.
  const side = (pts, t, x, mat) => {
    const m = extrude(pts, t, mat);
    m.rotation.y = -Math.PI / 2;
    m.position.x = x;
    return m;
  };
  // Lathe le long de X (profil [r, x]).
  const latheX = (prof, mat, seg = 40) => {
    const m = lathe(prof, mat, { seg });
    m.rotation.z = -Math.PI / 2;
    return m;
  };

  // ---------------------------------------------------------------- 1 — vilebrequin
  const rJ = 17.5 * MM, rF = 0.625 * IN; // tourillons, bout avant Ø 1 1/4
  const xR = -0.175, xF = 0.252;
  const [p0, p1] = LR.pinX;
  const wW = 21 * MM; // épaisseur des bras
  const shaft = latheX([
    [0, xR], [10.5 * MM, xR], [11.5 * MM, xR + 1 * MM], [11.5 * MM, -0.152], [rJ - 1 * MM, -0.15], [rJ, -0.149],
    [rJ, -0.112], [22 * MM, -0.11], [24 * MM, p0 - wW - 1 * MM], [24 * MM, p0 - wW],
    [0, p0 - wW],
  ], 'steel');
  const front = latheX([
    [0, p1 + wW], [24 * MM, p1 + wW], [24 * MM, p1 + wW + 1 * MM], [22 * MM, 0.075], [rJ, 0.077], [rJ, 0.128],
    [rF + 1.5 * MM, 0.13], [rF, 0.134], [rF, xF - 1 * MM], [rF - 1 * MM, xF], [0, xF],
  ], 'steel');
  // Maneton (avec congés) à y = R.
  const pin = latheX([[0, p0 - 1 * MM], [LR.pinR + 1.5 * MM, p0 - 1 * MM], [LR.pinR, p0 + 1.5 * MM], [LR.pinR, p1 - 1.5 * MM],
    [LR.pinR + 1.5 * MM, p1 + 1 * MM], [0, p1 + 1 * MM]], 'steel');
  pin.position.y = R;
  // Bras à contrepoids : bossage du maneton, masse en éventail à l'opposé.
  const web = [];
  for (let k = 0; k <= 12; k++) { const a = (Math.PI * k) / 12; web.push([33 * MM * Math.cos(a), R + 33 * MM * Math.sin(a)]); }
  web.push([-38 * MM, 0]);
  for (let k = 0; k <= 16; k++) { const a = (210 + (120 * k) / 16) * (Math.PI / 180); web.push([70 * MM * Math.cos(a), 70 * MM * Math.sin(a)]); }
  web.push([38 * MM, 0]);
  const webs = [p0 - wW / 2, p1 + wW / 2].map((x) => side(web, wW, x, 'darkSteel'));
  // Rainures de clavette (fond sombre suggéré par une entaille : bloc d'acier
  // bruni affleurant) au bout avant et au bout arrière.
  const kwF = box(0.105, 1 * MM, 0.5 * IN + 0.4 * MM, 'blackOxide', { pos: [xF - 0.0525, rF - 0.2 * MM, 0] });
  const kwR = box(0.02, 1 * MM, 4.2 * MM, 'blackOxide', { pos: [xR + 0.012, 11.5 * MM - 0.2 * MM, 0] });
  // Trou de graissage du maneton et trou taraudé du bout avant.
  const holes = [cyl(2.5 * MM, 1 * MM, 'blackOxide', { pos: [0, R + LR.pinR - 0.3 * MM, 0] }), cyl(5.5 * MM, 1 * MM, 'blackOxide', { axis: 'x', pos: [xF + 0.2 * MM, 0, 0] })];
  api.part('1', turn(group(merged([shaft, front, pin], 'steel'), merged(webs, 'darkSteel'), merged([kwF, kwR, ...holes], 'blackOxide'))), [0, -0.12, 0]);

  // ---------------------------------------------------------------- 3 — cônes de roulements (2)
  // Cône : bague intérieure à grand rebord côté bras, 16 rouleaux coniques,
  // cage en tôle. s = +1 : petit bout vers +X (cône avant), −1 : vers −X.
  const cone = (xc, s) => {
    // Dessiné petit bout vers +X autour de x = 0, puis retourné pour s = −1.
    const w = 20 * MM;
    const xa = -w / 2, xb = w / 2; // grand bout → petit bout
    const race = latheX([[rJ, xa], [28 * MM, xa], [28 * MM, xa + 3 * MM], [25.5 * MM, xa + 3.5 * MM], [23 * MM, xb - 2 * MM],
      [24 * MM, xb - 1.5 * MM], [24 * MM, xb], [rJ, xb], [rJ, xa]], 'steel', 40);
    const rollers = [];
    const n = 16;
    for (let k = 0; k < n; k++) {
      // Rouleau conique d'axe X, incliné de 8° vers l'axe côté petit bout.
      const r = lathe([[0, -7 * MM], [4.2 * MM, -7 * MM], [3.4 * MM, 7 * MM], [0, 7 * MM]], 'chrome', { seg: 7 });
      r.rotation.z = -Math.PI / 2 - 0.14;
      r.position.set(1 * MM, 28.3 * MM, 0);
      const g = group(r);
      g.rotation.set((2 * Math.PI * k) / n, 0, 0);
      rollers.push(g);
    }
    const cage = merged([ring(31.5 * MM, 29.5 * MM, 1.2 * MM, 'darkSteel', { axis: 'x', seg: 40, pos: [xa + 4 * MM, 0, 0] }),
      ring(29 * MM, 26 * MM, 1.2 * MM, 'darkSteel', { axis: 'x', seg: 40, pos: [xb - 1 * MM, 0, 0] })], 'darkSteel');
    return at(group(race, merged(rollers, 'chrome'), cage), [xc, 0, 0], [0, s < 0 ? Math.PI : 0, 0]);
  };
  P('3', cone(LR.bearingX[0], -1), [-0.09, 0, 0]);
  P('3', cone(LR.bearingX[1], 1), [0.06, 0, 0]);

  // ---------------------------------------------------------------- 8 — poulie 5VP quatre gorges
  const xs = LR.sheaveX, hw = LR.sheaveW / 2, Ro = LR.sheaveR;
  const pitch = 17.5 * MM, gd = 15 * MM, tg = Math.tan(19 * Math.PI / 180);
  // Jante : quatre gorges 5V (flancs à 38°), bords chanfreinés, retour par l'intérieur.
  const rim = [[Ro - 0.032, xs - hw], [Ro - 2 * MM, xs - hw], [Ro, xs - hw + 2 * MM]];
  for (let k = 0; k < 4; k++) {
    const c = xs + (k - 1.5) * pitch;
    const top = 6.6 * MM, bot = top - gd * tg * 2 / 2;
    rim.push([Ro, c - top], [Ro - gd, c - Math.max(bot, 1.2 * MM)], [Ro - gd, c + Math.max(bot, 1.2 * MM)], [Ro, c + top]);
  }
  rim.push([Ro, xs + hw - 2 * MM], [Ro - 2 * MM, xs + hw], [Ro - 0.032, xs + hw], [Ro - 0.036, xs + hw - 4 * MM], [Ro - 0.036, xs - hw + 4 * MM], [Ro - 0.032, xs - hw]);
  const rimM = latheX(rim, 'castIron', 72);
  const hub = latheX([[rF + 0.1 * MM, xs - hw + 1 * MM], [36 * MM, xs - hw + 1 * MM], [42 * MM, xs - 0.02], [42 * MM, xs + 0.02], [36 * MM, xs + hw - 1 * MM],
    [rF + 0.1 * MM, xs + hw - 1 * MM], [rF + 0.1 * MM, xs - hw + 1 * MM]], 'castIron', 40);
  // Trois bras courbes en lame (comme une hélice), de la jante au moyeu.
  const arms = [];
  for (let b = 0; b < 3; b++) {
    const a0 = (b * 2 * Math.PI) / 3 + Math.PI / 2;
    const L = [], Rr = [];
    for (let k = 0; k <= 10; k++) {
      const r = 0.036 + ((Ro - 0.031 - 0.036) * k) / 10;
      const a = a0 + 0.38 * (k / 10) ** 1.3;
      const w = (19 - 5 * (k / 10)) * MM / r;
      L.push([r * Math.cos(a - w), r * Math.sin(a - w)]);
      Rr.push([r * Math.cos(a + w), r * Math.sin(a + w)]);
    }
    arms.push(side([...L, ...Rr.reverse()], 0.03, xs - 0.004, 'castIron'));
  }
  // Option { noSheave } : bloc nu P288 (« NO SHEAVE »), poulie posée par P282.
  if (!opts.noSheave) P('8', merged([rimM, hub, ...arms], 'castIron'), [0.16, 0, 0]);

  // ---------------------------------------------------------------- 4 — clavette 1/2 × 1/2 × 3 1/4 po
  const kL = 3.25 * IN, kS = 0.5 * IN;
  P('4', box(kL, kS, kS, 'steel', { r: 0.6 * MM, pos: [xF - 2 * MM - kL / 2, rF - kS / 2 + kS * 0.5, 0] }), [0.08, 0.06, 0]);

  // ---------------------------------------------------------------- 5 / 6 / 7 — rondelle, Grower, vis
  const xH = xs + hw - 1 * MM; // face avant du moyeu
  P('5', washer(28 * MM, 6.8 * MM, 6 * MM, 'steel', { axis: 'x', pos: [xH + 3 * MM, 0, 0] }), [0.26, 0, 0]);
  P('6', washer(11 * MM, 6.8 * MM, 3 * MM, 'blackOxide', { axis: 'x', pos: [xH + 7.5 * MM, 0, 0] }), [0.29, 0, 0]);
  P('7', bolt(0.5 * IN, 1.25 * IN, 'steel', { axis: 'x', pos: [xH + 9 * MM, 0, 0] }), [0.33, 0, 0]);

  return { view: { dir: [1.2, 0.5, 1.0] } };
}
