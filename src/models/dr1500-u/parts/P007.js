// P007 — Groupe hydraulique (hydraulic power unit), page 7 : 13 repères et renvoi aux panneaux (page 8).
// Repère local : voir GP dans _groupes.js et ROOT dans layout.js (origine au sol sous le centre du cadre, moteur
// vers −X, Z vers le flanc de la boîte électrique). Disposition relevée sur les pages 7 (éclaté, vue du bout
// moteur et du flanc +Z) et 8 (groupe assemblé sans panneaux) : moteur 444TC au ras du bout −X, cloche et deux
// pompes Rexroth en tandem vers +X ; réservoir surélevé au bout +X (jauge sur la face +Z, trappe ronde, valve
// directionnelle et pompe de transfert sur le dessus) ; boîte électrique à deux portes dans le flanc +Z derrière
// l'arceau du bout moteur (prise sur sa face −X) ; transformateur sur une tablette au milieu ; double cooler à
// deux ventilateurs dans le flanc −Z, drain cooler au coin −X/−Z ; filtre de pression sous le dessus.
// Aucune cote au manuel : voir GP (mesures sur les dessins, échelle du moteur NEMA) ; chaque cote ci-dessous dit
// sa source. Ni boyaux ni câbles (non dessinés).
import { GP, slab, arc, rect, faisceau, ventilateur, poignee, charniere } from './_groupes.js';
import { IN } from '../layout.js';

const { x1, z1, H, t, tr, rb, base } = GP;
const XA = GP.xa, ZA = GP.za;

// Moteur 444TC 125 HP (carcasse NEMA 444/5TC) : axe à 11 po au-dessus des pattes [norme], pattes sur la plaque
// moteur (dessus à base + 0,02) ; 2F = 14 1/2 po entre trous le long de l'axe, 2E = 18 po en travers [norme] ;
// carcasse Ø 0,47 (ailettes Ø 0,55), capot de ventilateur Ø 0,53, longueur de la face C au capot ≈ 0,93 m
// [catalogue WEG/Baldor 444TC, ordre de grandeur].
const PLATE = base + 0.02;
const AY = PLATE + 11 * IN; // axe commun moteur-cloche-pompes
const MOT = { fan: -1.15, body: -0.98, end: -0.3, face: -0.22, r: 0.235, fin: 0.275 };
// Cloche #197499 (fonte) de la face C à la bride de la pompe [estimé : 0,2 m] ; pompes Rexroth [catalogue] :
// AA4VG125 (bride SAE D, longueur ≈ 0,40 avec la pompe de gavage) puis A11VLO130 (≈ 0,38).
const BH = { x0: MOT.face, x1: -0.02 };
const PG = { x0: -0.02, x1: 0.38, h: 0.27, w: 0.28, f: 0.25 }; // A4VG125
const PL = { x0: 0.38, x1: 0.76, h: 0.24, w: 0.24, f: 0.21 }; // A11VLO130
// Réservoir PA708 surélevé sur les traverses intermédiaires du bout +X [mesure p. 8].
const RES = { x0: 0.5, x1: 1.15, y0: GP.mid + t / 2, y1: 1.0, z: 0.55 };
// Boîte électrique PA706 dans le flanc +Z, porte au ras du cadre [mesure p. 7 et 8].
const BOX = { x0: -1.08, x1: -0.32, y0: 0.22, y1: 1.08, z0: 0.4, z1: 0.6 };
// Double cooler SBV6 (deux ventilateurs 24 V) dans le flanc −Z entre le poteau x −0,75 et l'arceau du milieu.
const COOL = { x0: -0.725, x1: GP.xMid - tr, y0: 0.22, y1: 1.07, z: -0.52, e: 0.08 };

export default function P007(api) {
  const S = api.S, { box, cyl, lathe, at, group, merged, tube, ring, torus, bolt, nut, fitting } = S;
  const ox = (x) => [x, AY, 0];

  // ------------------------------------------------------------------ 1 — Frame powerpack PA713
  // Cadre soudé : deux patins à bouts relevés en biseau (oreille percée à chaque coin), traverses de la base,
  // trois arceaux noirs en tube rond (bouts et milieu, angles cintrés), longerons du haut et intermédiaires,
  // poteaux de joint des panneaux, tablette du transformateur, plaque moteur percée, plaque de pied de cloche,
  // supports de la boîte électrique, du drain cooler et du filtre.
  const Y = [], K = [];
  for (const s of [-1, 1]) {
    // Patin : tube 0,06 × 0,10, bouts en biseau, trou d'élingage près de chaque bout [mesure p. 7].
    const pat = [[-1.1, 0], [1.1, 0], [1.25, base], [-1.25, base]];
    Y.push(at(slab(api, pat, [[-1.17, 0.055, 0.018], [1.17, 0.055, 0.018]], 0.06, 'red'), [0, 0, s * 0.56]));
    // Longeron du haut, longeron intermédiaire (milieu → bout +X).
    Y.push(at(box(2 * XA, t, t, 'red', { r: 0.004 }), [0, H - t / 2, s * (z1 - t / 2)]));
    Y.push(at(box(XA - GP.xMid, t, t, 'red', { r: 0.004 }), [(XA + GP.xMid) / 2, GP.mid, s * (z1 - t / 2)]));
    // Poteaux de joint des panneaux.
    for (const x of s < 0 ? GP.postZm : GP.postZp) Y.push(at(box(t, H - t - base, t, 'red', { r: 0.004 }), [x, (H - t + base) / 2, s * (z1 - t / 2)]));
  }
  // Traverses de la base (entre patins) [mesure p. 7 : bouts, sous la plaque moteur, sous les pompes].
  for (const x of [-1.15, -0.85, -0.42, -0.12, 0.3, 0.8, 1.15]) Y.push(at(box(0.05, 0.08, 1.06, 'red', { r: 0.003 }), [x, base - 0.04, 0]));
  // Traverses intermédiaires : sous la tablette du transformateur (x 0,02 et 0,43) et sous le réservoir.
  for (const x of [0.02, 0.43, 0.6, 1.1]) Y.push(at(box(t, t, 2 * (z1 - t), 'red', { r: 0.003 }), [x, GP.mid, 0]));
  // Tablette du transformateur (tôle 8 mm) [mesure p. 8].
  Y.push(at(S.plate(0.46, 0.5, 0.008, 'red', { holes: [[-0.1, -0.08, 0.006], [0.1, -0.08, 0.006], [-0.1, 0.08, 0.006], [0.1, 0.08, 0.006]] }), [0.225, GP.mid + t / 2 + 0.004, 0.2]));
  // Plaque moteur 3/4 po percée : trous des pattes (2F × 2E) et trous d'allègement [mesure p. 7].
  const feet = [-0.82, -0.452].flatMap((x) => [-1, 1].map((s) => [x, s * 0.2285]));
  Y.push(at(S.plate(0.72, 0.62, 0.02, 'red', { holes: [...feet.map(([x, z]) => [x + 0.63, z, 0.011]), [0, -0.12, 0.03], [0, 0.12, 0.03], [0.22, 0, 0.03], [-0.22, 0, 0.03]] }), [-0.63, base + 0.01, 0]));
  // Plaque de fond sous les pompes (tôle 3/8 po, quatre trous) [mesure p. 7].
  Y.push(at(S.plate(0.95, 0.62, 0.0095, 'red', { holes: [[-0.3, -0.18, 0.012], [-0.3, 0.18, 0.012], [0.3, -0.18, 0.012], [0.3, 0.18, 0.012]] }), [0.3, base + 0.005, 0]));
  // Pied de cloche : plaque verticale de 3/4 po, échancrure en U au pied, dessus en arc sous la cloche [estimé].
  Y.push(at(slab(api, [[-0.16, base + 0.01], ...arc(0, base + 0.01, 0.06, Math.PI, 0, 8), [0.16, base + 0.01], [0.16, AY - 0.17], ...arc(0, AY, 0.17, -0.35, -Math.PI + 0.35, 10), [-0.16, AY - 0.17]], [], 0.019, 'red'), [-0.12, 0, 0], [0, Math.PI / 2, 0]));
  // Support de la boîte électrique : longeron bas du flanc +Z (de l'arceau du bout au poteau x −0,28).
  Y.push(at(box(GP.postZp[0] - t / 2 + XA - tr, t, t, 'red', { r: 0.003 }), [(GP.postZp[0] - t / 2 - XA + tr) / 2, BOX.y0 - t / 2, z1 - t / 2 - 0.01]));
  Y.push(at(box(0.04, BOX.y0 - base, 0.2, 'red'), [-0.7, (BOX.y0 + base) / 2 - t / 2, 0.5]));
  // Pattes du drain cooler (deux plats verticaux sur la traverse du bout).
  for (const z of [-0.52, -0.32]) Y.push(at(box(0.05, 0.2, 0.008, 'red'), [-1.1, base + 0.1, z]));
  // Patte du filtre de pression : plat sous le longeron du haut −Z, en porte-à-faux vers l'intérieur.
  Y.push(at(box(0.14, 0.008, 0.3, 'red'), [0.1, H - t - 0.004, -(z1 - t) + 0.15]));
  Y.push(at(box(0.14, 0.05, 0.008, 'red'), [0.1, H - t - 0.025, -(z1 - t) + 0.004]));
  // Pattes du double cooler sur le poteau x −0,75 et sur l'arceau du milieu (plats à deux trous).
  for (const x of [COOL.x0 - 0.012, COOL.x1 + 0.012]) for (const y of [0.35, 0.95]) Y.push(at(box(0.024, 0.06, 0.09, 'red'), [x, y, -(z1 - t) + 0.02]));

  // Arceaux noirs : jambes à ±ZA de la base au dessus, angles cintrés au rayon rb [mesure p. 7 et 8].
  const hoop = (x) => {
    const yt = H - tr, pts = [[x, base, -ZA], [x, yt - rb - 0.2, -ZA], [x, yt - rb, -ZA]];
    for (const [z, y] of arc(-ZA + rb, yt - rb, rb, Math.PI, Math.PI / 2, 8).slice(1)) pts.push([x, y, z]);
    for (const [z, y] of arc(ZA - rb, yt - rb, rb, Math.PI / 2, 0, 8)) pts.push([x, y, z]);
    pts.push([x, yt - rb - 0.2, ZA], [x, base, ZA]);
    return tube(pts, tr, 'black', { seg: 120, radial: 16, tension: 0 });
  };
  for (const x of [-XA, GP.xMid, XA]) K.push(hoop(x));
  // Platines d'appui des jambes sur les patins.
  for (const x of [-XA, GP.xMid, XA]) for (const s of [-1, 1]) K.push(at(box(0.08, 0.008, 0.08, 'black'), [x, base + 0.004, s * 0.56]));
  api.part('1', group(merged(Y, 'red'), ...K), [0, 0, 0]);

  // ------------------------------------------------------------------ 10 — Moteur électrique 125 HP 444TC
  // Fonte grise : carcasse à ailettes, pattes, bout D et bride C, capot de ventilateur à grille, boîte à bornes
  // sur le flanc +Z (page 7), anneau de levage ; arbre 3 3/8 po dans la cloche [norme 444TC : U = 3,375 po].
  const M = MOT, m = [at(cyl(M.r, M.end - M.body, 'castIron', { axis: 'x', seg: 48 }), ox((M.body + M.end) / 2))];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2, sy = Math.sin(a), cz = Math.cos(a), rr = (M.r + M.fin) / 2;
    if (sy < -0.45 || (cz > 0.6 && Math.abs(sy) < 0.6)) continue; // ni entre les pattes, ni sous la boîte à bornes
    m.push(at(box(M.end - M.body - 0.06, M.fin - M.r + 0.004, 0.011, 'castIron'), [(M.body + M.end) / 2, AY + sy * rr, cz * rr], [Math.PI / 2 - a, 0, 0]));
  }
  m.push(at(lathe([[0, 0], [M.r, 0], [M.r - 0.02, 0.05], [0.21, 0.08], [0.21, M.face - M.end], [0, M.face - M.end]], 'castIron', { axis: 'x', seg: 48 }), ox(M.end)));
  m.push(at(lathe([[0, 0], [0.265, 0], [0.265, 0.13], [0.23, 0.165], [0, M.body - M.fan]], 'castIron', { axis: '-x', seg: 48 }), ox(M.body)));
  [0.2, 0.14, 0.08].forEach((r) => m.push(at(ring(r, r - 0.012, 0.004, 'castIron', { axis: 'x', seg: 40 }), ox(M.fan - 0.001))));
  for (const [x, z] of feet) {
    m.push(at(box(0.1, 0.12, 0.05, 'castIron', { r: 0.004 }), [x, PLATE + 0.06, z]));
    m.push(at(box(0.08, 0.07, 0.12, 'castIron'), [x, PLATE + 0.1, Math.sign(z) * 0.165]));
  }
  const tb = { x: -0.55, z0: 0.225, z1: 0.375 };
  m.push(at(box(0.28, 0.28, 0.08, 'castIron'), [tb.x, AY, tb.z0 - 0.035]));
  m.push(at(box(0.34, 0.34, tb.z1 - tb.z0, 'castIron', { r: 0.02 }), [tb.x, AY, (tb.z0 + tb.z1) / 2]));
  m.push(at(box(0.3, 0.3, 0.012, 'castIron', { r: 0.012 }), [tb.x, AY, tb.z1 + 0.006]));
  api.part('10', group(
    merged(m, 'castIron'),
    S.boltSet([-1, 1].flatMap((a) => [-1, 1].map((b) => [tb.x + a * 0.13, AY + b * 0.13, tb.z1 + 0.012])).map(([x, y, z]) => [x, y, z]), 0.008, 0.015, 'steel', { axis: 'z' }),
    at(cyl(0.02, 0.012, 'steel', { axis: 'y' }), [-0.6, AY + M.fin + 0.004, 0]),
    at(torus(0.03, 0.008, 'steel', { axis: 'z' }), [-0.6, AY + M.fin + 0.04, 0]),
    at(cyl(3.375 * IN / 2, 0.16, 'steel', { axis: 'x', seg: 24 }), ox(M.face + 0.08)),
    ...feet.map(([x, z]) => at(bolt(0.019, 0.07, 'steel', { washer: true }), [x, PLATE + 0.122, z])),
  ), [-2.7, 0, 0.35]);

  // ------------------------------------------------------------------ 11 — Bell housing #197499
  // Fonte noire : bride ronde côté moteur (bride C du 444TC, Ø 0,40), fût Ø 0,28 à fenêtre de visite, bride
  // carrée SAE D côté pompe ; 4 vis côté moteur.
  const bhProf = [[0.13, BH.x0], [0.2, BH.x0], [0.2, BH.x0 + 0.03], [0.14, BH.x0 + 0.06], [0.14, BH.x1 - 0.03], [0.13, BH.x1 - 0.03], [0.13, BH.x0]];
  api.part('11', group(
    at(lathe(bhProf.map(([r, x]) => [r, x]), 'blackCast', { axis: 'x', seg: 48 }), [0, AY, 0]),
    at(slab(api, [[-0.17, -0.17], [0.17, -0.17], [0.17, 0.17], [-0.17, 0.17]], [[0, 0, 0.13], ...[-1, 1].flatMap((a) => [-1, 1].map((b) => [a * 0.13, b * 0.13, 0.011]))], 0.03, 'blackCast'), [BH.x1 - 0.015, AY, 0], [0, Math.PI / 2, 0]),
    at(box(0.1, 0.03, 0.12, 'blackCast', { r: 0.01 }), [(BH.x0 + BH.x1) / 2 + 0.01, AY + 0.14, 0]),
    ...[0, 1, 2, 3].map((k) => at(bolt(0.016, 0.05, 'steel', { axis: '-x' }), [BH.x0 + 0.033, AY + Math.sin(Math.PI / 4 + (k * Math.PI) / 2) * 0.175, Math.cos(Math.PI / 4 + (k * Math.PI) / 2) * 0.175])),
  ), [-2.15, 0, 0.35]);

  // ------------------------------------------------------------------ 12 — Pompe hydrostatique AA4VG125EP4…
  // Fonte noire : bride SAE D carrée, corps à pans, plaque de commande EP4 sur le dessus (deux électro-aimants
  // proportionnels en travers), pompe de gavage et traversée à l'arrière, brides des orifices haute pression A et B
  // sur le flanc +Z, bouchons des limiteurs sur le flanc −Z [catalogue Rexroth A4VG, encombrement].
  const flange = (p, x) => at(slab(api, rect(0, 0, p.f, p.f).map(([u, v]) => [u, v]), [[0, 0, 0.065], ...[-1, 1].flatMap((a) => [-1, 1].map((b) => [a * p.f * 0.38, b * p.f * 0.38, 0.01]))], 0.03, 'blackCast'), ox(x), [0, Math.PI / 2, 0]);
  const xg = (PG.x0 + PG.x1) / 2;
  api.part('12', group(
    flange(PG, PG.x0 + 0.015),
    at(box(0.27, PG.h, PG.w, 'blackCast', { r: 0.04 }), ox(PG.x0 + 0.03 + 0.135)),
    at(cyl(0.12, PG.x1 - PG.x0 - 0.3, 'blackCast', { axis: 'x', seg: 36 }), ox(PG.x0 + 0.3 + (PG.x1 - PG.x0 - 0.3) / 2)),
    at(box(0.18, 0.035, 0.2, 'castAlu', { r: 0.006 }), [xg - 0.03, AY + PG.h / 2 + 0.0175, 0]),
    ...[-1, 1].map((s) => at(cyl(0.025, 0.08, 'black', { axis: 'z', seg: 20 }), [xg - 0.03, AY + PG.h / 2 + 0.04, s * 0.14])),
    ...[-1, 1].map((s) => at(box(0.035, 0.05, 0.03, 'black', { r: 0.004 }), [xg - 0.03, AY + PG.h / 2 + 0.06, s * 0.19])),
    ...[-0.06, 0.06].map((dy) => at(box(0.07, 0.07, 0.025, 'zinc', { r: 0.004 }), [xg + 0.04, AY + dy, PG.w / 2 + 0.0125])),
    ...[-0.06, 0.06].map((dy) => at(nut(0.03, 0.02, 'steel', { axis: 'z' }), [xg + 0.04, AY + dy, -PG.w / 2 - 0.01])),
    at(cyl(0.022, 0.06, 'steel', { axis: 'x', seg: 18 }), ox(PG.x0 - 0.02)),
  ), [-1.85, 0, 0.35]);

  // ------------------------------------------------------------------ 13 — Pompe A11VLO130DRS (ouverte, à gavage)
  // Fonte noire : bride SAE C, corps, couvercle arrière ; régulateur DRS sur le dessus ; aspiration (grosse bride)
  // sur le flanc −Z, refoulement sur le flanc +Z [catalogue Rexroth A11VO, encombrement].
  const xl = (PL.x0 + PL.x1) / 2;
  api.part('13', group(
    flange(PL, PL.x0 + 0.015),
    at(box(0.26, PL.h, PL.w, 'blackCast', { r: 0.035 }), ox(PL.x0 + 0.03 + 0.13)),
    at(box(PL.x1 - PL.x0 - 0.29, 0.2, 0.2, 'blackCast', { r: 0.02 }), ox((PL.x0 + 0.29 + PL.x1) / 2)),
    at(box(0.12, 0.05, 0.09, 'blackCast', { r: 0.008 }), [xl, AY + PL.h / 2 + 0.025, -0.03]),
    at(cyl(0.012, 0.05, 'steel', { axis: 'z', seg: 14 }), [xl + 0.03, AY + PL.h / 2 + 0.03, 0.04]),
    at(box(0.11, 0.11, 0.03, 'zinc', { r: 0.012 }), [xl, AY, -PL.w / 2 - 0.015]),
    at(box(0.06, 0.07, 0.025, 'zinc', { r: 0.006 }), [xl, AY, PL.w / 2 + 0.0125]),
  ), [-1.55, 0, 0.35]);

  // ------------------------------------------------------------------ 2 — Réservoir hydraulique PA708
  // Caisson soudé rouge : trappe de visite ronde boulonnée (Ø 0,36) sur le dessus, bouchon de remplissage et
  // reniflard, jauge de niveau et thermomètre sur la face +Z (côté du panneau PP7172), vanne de vidange sous le
  // fond [mesure p. 7 et 8 ; cotes estimées].
  const rt = RES.y1, rx = (RES.x0 + RES.x1) / 2;
  const hatch = [0.86, 0.15];
  api.part('2', group(
    at(box(RES.x1 - RES.x0, rt - RES.y0, 2 * RES.z, 'red', { r: 0.012 }), [rx, (rt + RES.y0) / 2, 0]),
    at(cyl(0.2, 0.012, 'red', { axis: 'y', seg: 48 }), [hatch[0], rt + 0.006, hatch[1]]),
    at(lathe([[0, 0], [0.18, 0], [0.18, 0.008], [0.14, 0.018], [0, 0.022]], 'red', { seg: 48 }), [hatch[0], rt + 0.012, hatch[1]]),
    S.boltCircle(10, 0.19, 0.008, 0.016, 'steel', { pos: [hatch[0], rt + 0.012, hatch[1]] }),
    // Bouchon de remplissage (Ø 0,09) et reniflard, sur le coin −X/+Z du dessus.
    at(cyl(0.055, 0.02, 'red', { axis: 'y', seg: 28 }), [0.6, rt + 0.01, 0.4]),
    at(lathe([[0, 0], [0.045, 0], [0.045, 0.03], [0.04, 0.04], [0, 0.042]], 'black', { seg: 28 }), [0.6, rt + 0.02, 0.4]),
    at(cyl(0.02, 0.03, 'steel', { axis: 'y', seg: 18 }), [0.6, rt + 0.015, 0.25]),
    at(lathe([[0, 0], [0.03, 0], [0.03, 0.04], [0.022, 0.055], [0, 0.058]], 'black', { seg: 24 }), [0.6, rt + 0.03, 0.25]),
    // Jauge de niveau et thermomètre (face +Z).
    at(box(0.045, 0.24, 0.02, 'darkSteel', { r: 0.004 }), [0.62, (RES.y0 + rt) / 2 + 0.02, RES.z + 0.01]),
    at(box(0.02, 0.19, 0.006, 'glass'), [0.62, (RES.y0 + rt) / 2 + 0.02, RES.z + 0.022]),
    ...[-0.1, 0.14].map((dy) => at(bolt(0.008, 0.02, 'steel', { axis: 'z' }), [0.62, (RES.y0 + rt) / 2 + 0.02 + dy, RES.z + 0.024])),
    // Vidange sous le fond, côté +X.
    at(cyl(0.022, 0.04, 'steel', { axis: 'y', seg: 6 }), [1.05, RES.y0 - 0.02, 0.3]),
    at(S.ballValve(0.035, 'brass', { axis: 'y' }), [1.05, RES.y0 - 0.075, 0.3]),
    // Raccords d'aspiration et de retour sur la face −X (bouchons six-pans, orifices sans boyau au dessin).
    ...[[-0.3, 0.035], [0.25, 0.028]].map(([z, r]) => at(cyl(r, 0.03, 'steel', { axis: 'x', seg: 6 }), [RES.x0 - 0.015, RES.y0 + 0.08, z])),
  ), [0.6, 0, 1.4]);

  // ------------------------------------------------------------------ 5 — Valve directionnelle M4-12-3
  // Distributeur monobloc à trois sections et leviers, sur le dessus du réservoir côté −Z (page 8) ; les leviers
  // sortent par l'ouverture entre le hood filtreur et le hood diesel (P008).
  api.part('5', at(S.valveBank(3, { sw: 0.05, h: 0.12, d: 0.11 }), [0.75, rt + 0.06, -0.33], [0, Math.PI, 0]), [0.6, 0.7, 0]);

  // ------------------------------------------------------------------ 6 — Pompe de transfert FR-152 (Fill-Rite)
  // Pompe 12 V à engrenages : moteur rond, corps de pompe, interrupteur à levier, sortie coudée et pistolet
  // posé sur son support, tels que dessinés sur la page 7 (un bout de flexible dessiné entre pompe et pistolet).
  const fp = [1.0, rt, -0.33];
  api.part('6', group(
    at(box(0.2, 0.012, 0.14, 'blackCast', { r: 0.004 }), [fp[0], rt + 0.006, fp[2]]),
    at(cyl(0.055, 0.15, 'blackCast', { axis: 'x', seg: 28 }), [fp[0] - 0.02, rt + 0.07, fp[2]]),
    at(cyl(0.048, 0.004, 'black', { axis: 'x', seg: 28 }), [fp[0] - 0.097, rt + 0.07, fp[2]]),
    at(box(0.07, 0.11, 0.11, 'blackCast', { r: 0.012 }), [fp[0] + 0.09, rt + 0.065, fp[2]]),
    at(box(0.025, 0.04, 0.02, 'black', { r: 0.004 }), [fp[0] - 0.02, rt + 0.135, fp[2]]),
    at(fitting(0.03, 0.05, 'steel', { elbow: true }), [fp[0] + 0.09, rt + 0.125, fp[2]]),
    tube([[fp[0] + 0.09, rt + 0.155, fp[2] - 0.03], [fp[0] + 0.12, rt + 0.19, fp[2] - 0.1], [fp[0] + 0.04, rt + 0.16, fp[2] - 0.17], [fp[0] - 0.06, rt + 0.1, fp[2] - 0.15]], 0.011, 'hose'),
    at(box(0.14, 0.03, 0.03, 'black', { r: 0.008 }), [fp[0] - 0.12, rt + 0.1, fp[2] - 0.15]),
    at(cyl(0.008, 0.08, 'steel', { axis: 'x', seg: 12 }), [fp[0] - 0.22, rt + 0.1, fp[2] - 0.15]),
  ), [0.8, 0.9, -0.2]);

  // ------------------------------------------------------------------ 4 — Transformateur DX5000QHU (5 kVA)
  // Caisson ventilé gris clair sur la tablette du milieu, couvercle de bornes, pattes boulonnées
  // [catalogue Hammond/Dongan 5 kVA : ≈ 0,30 × 0,36 × 0,28 m].
  const tr0 = GP.mid + t / 2 + 0.008, tx = 0.225, tz = 0.2;
  const louv = [];
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) louv.push(at(box(0.16, 0.006, 0.006, 'lightGrey'), [tx, tr0 + 0.08 + k * 0.025, tz + s * 0.143], [s * 0.6, 0, 0]));
  api.part('4', group(
    at(box(0.3, 0.33, 0.28, 'lightGrey', { r: 0.01 }), [tx, tr0 + 0.015 + 0.165, tz]),
    at(box(0.31, 0.03, 0.29, 'lightGrey', { r: 0.008 }), [tx, tr0 + 0.36, tz]),
    merged(louv, 'lightGrey'),
    ...[-1, 1].map((s) => at(box(0.34, 0.015, 0.05, 'lightGrey'), [tx, tr0 + 0.0075, tz + s * 0.09])),
    ...[-1, 1].flatMap((s) => [-1, 1].map((u) => at(bolt(0.008, 0.02, 'steel', { washer: true }), [tx + u * 0.1, tr0 + 0.016, tz + s * 0.08]))),
    at(cyl(0.012, 0.012, 'black', { axis: 'z', seg: 16 }), [tx + 0.08, tr0 + 0.28, tz + 0.146]),
  ), [0, 1.1, 0]);

  // ------------------------------------------------------------------ 3 — Boîtier électrique PA706
  // Coffret gris à deux portes battantes (poignées au milieu, charnières aux bouts), porte au ras du flanc +Z ;
  // prise d'alimentation ronde (plug) sur la face −X, presse-étoupes dessous [mesure p. 7 et 8].
  const bw = BOX.x1 - BOX.x0, bh = BOX.y1 - BOX.y0, bd = BOX.z1 - BOX.z0, bx = (BOX.x0 + BOX.x1) / 2, by = (BOX.y0 + BOX.y1) / 2;
  const dz = BOX.z1 + 0.004;
  const doors = [-1, 1].map((s) => at(box(bw / 2 - 0.012, bh - 0.03, 0.008, 'grey', { r: 0.004 }), [bx + s * (bw / 4), by, dz]));
  api.part('3', group(
    at(box(bw, bh, bd, 'grey', { r: 0.01 }), [bx, by, (BOX.z0 + BOX.z1) / 2]),
    merged(doors, 'grey'),
    ...[-1, 1].map((s) => at(box(0.02, 0.12, 0.025, 'black', { r: 0.005 }), [bx + s * 0.03, by, dz + 0.016])),
    ...[-1, 1].flatMap((s) => [-0.3, 0.3].map((dy) => at(charniere(api, 0.08), [bx + s * (bw / 2 - 0.01), by + dy, dz + 0.004]))),
    // Prise (plug) ronde : embase carrée, corps, bague de verrouillage, capuchon.
    at(box(0.012, 0.11, 0.11, 'black', { r: 0.006 }), [BOX.x0 - 0.006, 0.88, 0.5]),
    at(cyl(0.038, 0.05, 'black', { axis: 'x', seg: 28 }), [BOX.x0 - 0.037, 0.88, 0.5]),
    at(ring(0.045, 0.036, 0.018, 'darkSteel', { axis: 'x', seg: 28 }), [BOX.x0 - 0.05, 0.88, 0.5]),
    ...[-0.2, 0, 0.2].map((dx) => at(cyl(0.012, 0.025, 'black', { axis: 'y', seg: 14 }), [bx + dx, BOX.y0 - 0.0125, 0.5])),
  ), [0.1, 0, 1.3]);

  // ------------------------------------------------------------------ 7 — Filtre de pression SF070G10BTUBV
  // Tête en fonte d'alu, cuve noire vers le bas, indicateur de colmatage, sous la patte du longeron −Z
  // [catalogue : filtre en ligne Ø ≈ 0,1 × 0,33 m].
  api.part('7', at(S.filterCanister(0.05, 0.33, 'black', { head: 'castAlu' }), [0.1, H - t - 0.008, -0.35], [0, Math.PI / 2, 0]), [0, 0.9, -0.5]);

  // ------------------------------------------------------------------ 8 — Double cooler 24 V SBV6-24S-JE-44
  // Faisceau à ailettes dans le flanc −Z, deux ventilateurs Ø 0,34 côté intérieur soufflant vers −Z (vers les
  // ouïes du hood cooler #1), réservoirs d'extrémité et orifices d'huile, pattes sur le cadre [mesure p. 7 et 8].
  const cw = COOL.x1 - COOL.x0, chh = COOL.y1 - COOL.y0, cx = (COOL.x0 + COOL.x1) / 2, cy = (COOL.y0 + COOL.y1) / 2;
  api.part('8', group(
    at(faisceau(api, cw, chh, COOL.e), [cx, cy, COOL.z]),
    ...[cy - 0.215, cy + 0.215].map((y) => at(ventilateur(api, 0.34), [cx, y, COOL.z + COOL.e / 2 + 0.035], [0, Math.PI, 0])),
    ...[cy - 0.215, cy + 0.215].map((y) => at(box(cw - 0.04, 0.38, 0.006, 'black'), [cx, y, COOL.z + COOL.e / 2 + 0.003])),
    ...[COOL.y1 - 0.025, COOL.y0 + 0.025].map((y) => at(cyl(0.022, 0.04, 'steel', { axis: 'x', seg: 6 }), [COOL.x1 + 0.005, y, COOL.z])),
    ...[COOL.x0, COOL.x1].flatMap((x) => [0.35, 0.95].map((y) => at(bolt(0.01, 0.03, 'steel', { axis: 'z' }), [x + Math.sign(cx - x) * -0.012, y, -(z1 - t) + 0.067]))),
  ), [-0.3, 0.5, -1.0]);

  // ------------------------------------------------------------------ 9 — Drain cooler 24 V 2015K-2P
  // Petit refroidisseur à un ventilateur au coin −X/−Z, face vers −X (pages 7 et 8), sur ses deux pattes.
  const dc = { x: -1.1, y: 0.47, z: -0.42, w: 0.27, h: 0.32 };
  api.part('9', group(
    at(faisceau(api, dc.w, dc.h, 0.06), [dc.x, dc.y, dc.z], [0, Math.PI / 2, 0]),
    at(ventilateur(api, 0.22), [dc.x + 0.055, dc.y, dc.z], [0, Math.PI / 2, 0]),
    at(box(0.006, 0.25, 0.25, 'black'), [dc.x + 0.033, dc.y, dc.z]),
    ...[dc.y + 0.12, dc.y - 0.12].map((y) => at(cyl(0.015, 0.035, 'steel', { axis: 'z', seg: 6 }), [dc.x, y, dc.z + dc.w / 2 + 0.0175])),
  ), [-0.7, 0.1, -0.5]);

  // ------------------------------------------------------------------ p. 8 — Panneaux (sous-assemblage P008)
  api.part('p8', api.sub('P008'), [0, 2.5, -0.8]);

  return { view: { dir: [-0.85, 0.55, 0.75] } };
}
