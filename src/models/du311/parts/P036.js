// P036 — Déflecteur de roches V30 CX003192 rév. 4 (page 36) : « V30 ROCK
// DEFLECTOR », repère 2 de l'avance P032. Caisson ouvrant sous le pied de mât,
// autour de la tige au-dessus du trou : il arrête les cailloux projetés au
// soufflage et s'ouvre en deux volets pour les vider.
// - 1, caisson principal (mécano-soudé) : semelle de 3/4 po échancrée autour de
//   la tige, deux montants de pivot Ø 2 1/2 po, tour centrale portant les
//   chapes des fonds de vérin, deux équerres arrière boulonnées aux blocs 9 ;
// - 3 / 4, volets gauche / droit : tôles pliées en L (paroi latérale de 3/8 po
//   percée de quatre trous en bout pour la bavette, fond de 1/4 po échancré
//   autour de la tige, paroi arrière), moyeu Ø 4 po bagué enfilé sur le
//   montant, chape de tige de vérin ;
// - 8, deux vérins Ø 2 × 6 po (P038) couchés derrière les volets ; axes de
//   fond 6 (Ø 1 po, tête et goupille) dans la tour, axes de tige 7 (Ø 1 po à
//   patte soudée) bloqués par une vis 3/8 × 1 (10) et rondelle fendue (16) ;
// - 2, chapeau de retenue : plaque de 1/2 po à caisson avant posée sur les
//   montants et la tour, vis 3/4 × 1 3/4 (12) et rondelles fendues (17) ;
//   5, tôle de garde au-dessus, quatre bossages, une vis 12 avec rondelle
//   plate 14 ;
// - 9, deux blocs de fixation sur les flancs du pied de mât (P116 repère 4) :
//   vis 1/2 × 4 (11), rondelles Nord-Lock (19, deux par vis), écrous nylstop
//   (21) ; le caisson y est boulonné par quatre vis 1 × 2 1/2 (13) : deux
//   verticales vissées dans les blocs (rondelles 15 et 18), deux horizontales
//   au travers des équerres et des blocs, écrous 20 (rondelles 15 et 18).
// Le dessin de la page 36 est schématique (vue éclatée sans cotes) :
// disposition reconstituée d'après les pages 32, 34 et 36, volets dessinés
// fermés ; P036 reste lisible même si le pied de mât P116 n'est pas inséré.
// Repère : origine sur l'axe de forage, au niveau du dessus de la semelle du
// caisson (1) ; Y vers le haut (le long des tiges) ; +Z vers l'avant de
// l'avance (côté opposé au mât) ; +X à gauche vu de l'arrière (côté du volet
// droit 4, vu de l'avant). Encombrement ≈ 1.14 (X) × 0.66 (Y, de -0.405 à
// 0.255) × 0.94 (Z, de -0.40 à 0.54) m.
import { L, u, IN, along, hhcs, hexNut, nylocNut, flatWasher, splitWasher, nordLock, bushing } from './_avance_b.js';
import { CYL038 } from './P038.js';

// Implantation (m).
const POST = { x: 0.28, z: -0.12, r: u(1.25), top: 0.205 }; // montants de pivot
const WALL = { x: 0.56, z0: -0.22, z1: 0.54, y0: -0.40, t: u(0.375) }; // parois latérales
const FLOOR = { y: -0.40, t: u(0.25), notch: 0.10 }; // fonds échancrés autour de la tige
const BOSS = { r: u(2), y0: 0.03, y1: 0.13 }; // moyeux des volets
const CYL = { y: 0.08, z: -0.29, x0: 0.05 }; // vérins : axe de l'œil de fond
const PLATE = { x: 0.37, z0: -0.40, z1: -0.02, t: u(0.75) }; // semelle du caisson
const RET = { y: POST.top, t: u(0.5) }; // chapeau de retenue
const BLOCK = { x: 0.33, y: 0.215, z: -0.36, w: u(2), h: u(2), d: u(3) }; // blocs 9

export const DEFL036 = { post: POST, plateTop: 0, retTop: RET.y + RET.t };

export default function P036(api) {
  const { THREE, S } = api;
  const { extrude, merged, group, weld, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Plaques : contour 2D extrudé de t dans un plan.
  // 'xz' : points (x, z), de y0 à y0 + t ; 'yz' : points (z, y), centrée en x0 ;
  // 'xy' : points (x, y), centrée en z0.
  const slab = (plane, pts, t, c, mat, holes = []) => {
    if (plane === 'xz') {
      const m = extrude(pts.map(([x, z]) => [x, -z]), t, mat, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
      m.rotation.x = -Math.PI / 2;
      m.position.y = c + t / 2;
      return m;
    }
    if (plane === 'yz') {
      const m = extrude(pts.map(([z, y]) => [z, y]), t, mat, { holes });
      m.rotation.y = -Math.PI / 2;
      m.position.x = c;
      return m;
    }
    const m = extrude(pts, t, mat, { holes });
    m.position.z = c;
    return m;
  };
  const arcPts = (cx, cz, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  // Six-pans d'une vis vue de dessus : objet hhcs posé tête en +Y local.
  const screw = (d, len, pos, dir, opts) => along(THREE, hhcs(S, THREE, d, len, opts), dir, pos);

  // ================================================ 1 — caisson principal
  {
    const parts = [];
    // Semelle : échancrure Ø 8 po autour de la tige ouverte vers l'avant,
    // coins arrière abattus ; deux trous de montants.
    const R = 0.105;
    const a0 = Math.asin(PLATE.z1 / R);
    const outline = [
      [-PLATE.x, PLATE.z0 + 0.04], [-PLATE.x + 0.04, PLATE.z0], [PLATE.x - 0.04, PLATE.z0], [PLATE.x, PLATE.z0 + 0.04],
      [PLATE.x, PLATE.z1], [R * Math.cos(a0), PLATE.z1],
      ...arcPts(0, 0, R, a0, -Math.PI - a0, 20).slice(1, -1),
      [-R * Math.cos(a0), PLATE.z1], [-PLATE.x, PLATE.z1],
    ];
    parts.push(slab('xz', outline, PLATE.t, -PLATE.t, 'grey'));
    // Montants de pivot : tubes Ø 2 1/2 po, chapeau taraudé.
    for (const s of [1, -1]) {
      parts.push(L(S, [[0, 0], [1.25, 0], [1.25, POST.top / IN - 0.06], [1.19, POST.top / IN], [0, POST.top / IN]], 'grey', 32, { pos: [s * POST.x, 0, POST.z] }));
      // Goussets triangulaires vers l'arrière et vers l'extérieur.
      parts.push(slab('xy', [[s * (POST.x + POST.r - 0.002), 0], [s * (POST.x + POST.r + 0.06), 0], [s * (POST.x + POST.r - 0.002), 0.07]], u(0.375), POST.z, 'grey'));
      parts.push(slab('yz', [[POST.z - POST.r + 0.002, 0], [POST.z - POST.r - 0.06, 0], [POST.z - POST.r + 0.002, 0.07]], u(0.375), s * POST.x, 'grey'));
    }
    // Tour centrale arrière : âme verticale (plan XY) de 1/2 po, barre
    // d'appui du chapeau en tête, chapes des fonds de vérin (plats percés
    // au-dessus et au-dessous de l'œil de chaque vérin, en saillie vers l'avant).
    const TZ = -0.36;
    parts.push(slab('xy', [[-0.11, 0], [0.11, 0], [0.11, RET.y], [-0.11, RET.y]], u(0.5), TZ, 'grey'));
    parts.push(S.box(0.22, u(1), u(1.5), 'grey', { pos: [0, RET.y - u(0.5), TZ + u(0.5)] }));
    for (const dy of [-1, 1]) {
      const y = CYL.y + dy * (CYL038.eyeW / 2 + u(0.06) + u(0.25)) - u(0.25);
      for (const s of [1, -1]) {
        const xc = s * CYL.x0;
        const cl = [[xc - 0.035, TZ], [xc + 0.035, TZ], [xc + 0.035, CYL.z], ...arcPts(xc, CYL.z, 0.035, 0, Math.PI, 10).slice(1, -1), [xc - 0.035, CYL.z]];
        parts.push(slab('xz', cl, u(0.5), y, 'grey', [[xc, CYL.z, u(0.52)]]));
      }
    }
    // Équerres arrière sous les blocs 9 : aile horizontale (vis 13 verticales)
    // et âme verticale (vis 13 horizontales).
    for (const s of [1, -1]) {
      parts.push(slab('xz', [[s * (BLOCK.x - 0.04), BLOCK.z - 0.045], [s * (BLOCK.x + 0.04), BLOCK.z - 0.045], [s * (BLOCK.x + 0.04), BLOCK.z + 0.045], [s * (BLOCK.x - 0.04), BLOCK.z + 0.045]], u(0.5), BLOCK.y - BLOCK.h / 2 - u(0.5), 'grey', [[s * BLOCK.x, BLOCK.z, u(0.53)]]));
      parts.push(slab('yz', [[BLOCK.z - 0.045, 0], [BLOCK.z + 0.045, 0], [BLOCK.z + 0.045, BLOCK.y - BLOCK.h / 2], [BLOCK.z - 0.045, BLOCK.y - BLOCK.h / 2]], u(0.5), s * (BLOCK.x + 0.04 + u(0.25)), 'grey'));
      parts.push(slab('yz', [[BLOCK.z - 0.045, BLOCK.y - BLOCK.h / 2], [BLOCK.z + 0.045, BLOCK.y - BLOCK.h / 2], [BLOCK.z + 0.045, BLOCK.y + 0.06], [BLOCK.z - 0.045, BLOCK.y + 0.06]], u(0.5), s * (BLOCK.x + BLOCK.w / 2 + u(0.25)), 'grey', [[BLOCK.z, BLOCK.y + 0.02, u(0.53)]]));
    }
    const welds = [weld([[-0.11, 0.003, TZ + u(0.25) + 0.003], [0.11, 0.003, TZ + u(0.25) + 0.003]], 0.007, 'grey')];
    for (const s of [1, -1]) welds.push(S.weldRing(POST.r + 0.002, 0.007, 'grey', { pos: [s * POST.x, 0.002, POST.z] }));
    P('1', group(merged(parts, 'grey'), merged(welds, 'grey')), [0, -0.12, 0]);
  }

  // ================================================ 3 / 4 — volets
  // Volet côté s (+1 : droit 4, vu de l'avant ; -1 : gauche 3) : paroi
  // latérale, fond, paroi arrière, moyeu sur le montant, chape de tige.
  const flap = (s) => {
    const mat = 'lightGrey';
    const parts = [];
    const xw = s * WALL.x;
    // Paroi latérale : bord avant arrondi en haut, quatre trous de bavette.
    const top = BOSS.y1;
    const side = [[WALL.z0, WALL.y0], [WALL.z1 - 0.06, WALL.y0], [WALL.z1, WALL.y0 + 0.06], [WALL.z1, top - 0.09], [WALL.z1 - 0.09, top], [WALL.z0, top]];
    const holes = [0, 1, 2, 3].map((i) => [WALL.z1 - 0.03, WALL.y0 + 0.07 + i * 0.1, u(0.28)]);
    parts.push(slab('yz', side, WALL.t, xw, mat, holes));
    // Fond : de l'axe (jeu de 5 mm) à la paroi, échancré autour de la tige.
    const nr = FLOOR.notch;
    const fl = s > 0
      ? [[0.005, WALL.z0], [WALL.x - WALL.t / 2, WALL.z0], [WALL.x - WALL.t / 2, WALL.z1 - 0.06], [WALL.x - WALL.t / 2 - 0.05, WALL.z1], [0.005, WALL.z1], [0.005, nr], ...arcPts(0, 0, nr, Math.PI / 2, -Math.PI / 2, 12).map(([x, z]) => [Math.max(x, 0.005), z]).slice(1, -1), [0.005, -nr]]
      : [[-0.005, WALL.z0], [-0.005, -nr], ...arcPts(0, 0, nr, -Math.PI / 2, -Math.PI * 1.5, 12).map(([x, z]) => [Math.min(x, -0.005), z]).slice(1, -1), [-0.005, nr], [-0.005, WALL.z1], [-(WALL.x - WALL.t / 2 - 0.05), WALL.z1], [-(WALL.x - WALL.t / 2), WALL.z1 - 0.06], [-(WALL.x - WALL.t / 2), WALL.z0]];
    parts.push(slab('xz', fl, FLOOR.t, FLOOR.y, mat));
    // Paroi arrière (plan XY) de l'axe à la paroi latérale, jusqu'au moyeu.
    const xa = s * 0.005, xb = s * (WALL.x - WALL.t / 2);
    const rear = [[xa, FLOOR.y], [xb, FLOOR.y], [xb, top], [s * (POST.x + BOSS.r), top], [s * (POST.x + BOSS.r), BOSS.y0], [s * (POST.x - BOSS.r), BOSS.y0], [s * (POST.x - BOSS.r), top - 0.02], [xa, top - 0.12]];
    parts.push(slab('xy', s > 0 ? rear : rear.slice().reverse(), u(0.375), WALL.z0 + u(0.1875), mat));
    // Bras du moyeu : plat horizontal du moyeu à la paroi arrière.
    parts.push(slab('xz', [[s * (POST.x - BOSS.r * 0.7), POST.z], [s * (POST.x + BOSS.r * 0.7), POST.z], [s * (POST.x + BOSS.r * 0.7), WALL.z0 + 0.01], [s * (POST.x - BOSS.r * 0.7), WALL.z0 + 0.01]], u(0.5), BOSS.y0, mat));
    // Moyeu Ø 4 po (alésage de la bague Ø 2 1/2 × 2 3/4).
    parts.push(L(S, [[1.375, BOSS.y0 / IN], [2, BOSS.y0 / IN], [2, BOSS.y1 / IN - 0.06], [1.94, BOSS.y1 / IN], [1.375, BOSS.y1 / IN], [1.375, BOSS.y0 / IN]], mat, 36, { pos: [s * POST.x, 0, POST.z] }));
    // Chape de tige de vérin derrière la paroi arrière : deux oreilles.
    const xr = s * (CYL.x0 + CYL038.retracted);
    for (const dy of [-1, 1]) {
      const y = CYL.y + dy * (CYL038.rodEyeW / 2 + u(0.06) + u(0.25)) - u(0.25);
      parts.push(slab('xz', [[xr - 0.035, CYL.z], ...arcPts(xr, CYL.z, 0.035, Math.PI, 2 * Math.PI, 10).slice(1, -1), [xr + 0.035, CYL.z], [xr + 0.035, WALL.z0 + 0.002], [xr - 0.035, WALL.z0 + 0.002]].map(([x, z]) => [x, z]), u(0.5), y, mat, [[xr, CYL.z, u(0.52)]]));
    }
    // Bague du moyeu (bronze), visible dans l'alésage.
    const bush = at(bushing(S, THREE, 1.375, 1.25, (BOSS.y1 - BOSS.y0) / IN - 0.04), [s * POST.x, (BOSS.y0 + BOSS.y1) / 2, POST.z]);
    const welds = [
      weld([[xw - s * WALL.t / 2, FLOOR.y + FLOOR.t + 0.003, WALL.z0], [xw - s * WALL.t / 2, FLOOR.y + FLOOR.t + 0.003, WALL.z1 - 0.06]], 0.007, mat),
      weld([[xa, FLOOR.y + FLOOR.t + 0.003, WALL.z0 + u(0.375) + 0.002], [xb, FLOOR.y + FLOOR.t + 0.003, WALL.z0 + u(0.375) + 0.002]], 0.007, mat),
    ];
    return group(merged(parts, mat), merged(welds, mat), bush);
  };
  P('4', flap(1), [0.3, 0.05, 0.25]);
  P('3', flap(-1), [-0.3, 0.05, 0.25]);

  // ================================================ 8 — vérins, 6 / 7 — axes
  for (const s of [1, -1]) {
    // P038 : Y le long du vérin, Z selon les œils, orifices +X. Ici le vérin
    // court selon s·X, œils verticaux, orifices vers l'arrière (-Z).
    const c = api.sub('P038');
    const g = new THREE.Group();
    g.add(c);
    const Yl = new THREE.Vector3(s, 0, 0), Zl = new THREE.Vector3(0, s > 0 ? -1 : 1, 0);
    const Xl = new THREE.Vector3().crossVectors(Yl, Zl);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xl, Yl, Zl));
    g.position.set(s * CYL.x0, CYL.y, CYL.z);
    P('8', g, [s * 0.1, 0.08, -0.32]);
    // 6 — axe de fond Ø 1 × 3 1/2 po : tête Ø 1 1/2, trou de goupille en bas.
    const yTop = CYL.y + CYL038.eyeW / 2 + u(0.25) + u(0.5);
    P('6', at(L(S, [[0, -3.3], [0.44, -3.3], [0.5, -3.24], [0.5, 0], [0.75, 0], [0.75, 0.3], [0.7, 0.35], [0, 0.35]], 'steel', 20), [s * CYL.x0, yTop, CYL.z]), [0, 0.3, -0.32]);
    // 7 — axe de tige Ø 1 po à patte soudée (plat 1/4 po percé Ø 13/32), vis
    // 10 (3/8 × 1, filet complet) et rondelle fendue 16 dans l'oreille.
    const xr = s * (CYL.x0 + CYL038.retracted);
    const yT = CYL.y + CYL038.rodEyeW / 2 + u(0.06) + u(0.5);
    P('7', at(group(
      merged([
        L(S, [[0, -3.0], [0.44, -3.0], [0.5, -2.94], [0.5, 0.25], [0.46, 0.3], [0, 0.3]], 'steel', 20),
        slab('xz', [[-0.016, -0.016], [0.06, -0.016], ...arcPts(0.06, 0, 0.016, -Math.PI / 2, Math.PI / 2, 8).slice(1, -1), [0.06, 0.016], [-0.016, 0.016]].map(([x, z]) => [x * s, z]), u(0.25), 0, 'steel', [[s * 0.06, 0, u(0.205)]]),
      ], 'steel'),
    ), [xr, yT, CYL.z]), [s * 0.1, 0.3, -0.32]);
    P('16', at(splitWasher(S, THREE, 0.375), [xr + s * 0.06, yT + u(0.25), CYL.z]), [s * 0.1, 0.37, -0.32]);
    P('10', screw(0.375, 1.0, [xr + s * 0.06, yT + u(0.25) + u(0.094), CYL.z], [0, 1, 0]), [s * 0.1, 0.44, -0.32]);
  }

  // ================================================ 2 — chapeau de retenue
  {
    const y0 = RET.y, t = RET.t;
    // Plaque en T : ailes sur les montants, queue sur la barre de la tour
    // (entre les blocs 9).
    const x1 = POST.x + 0.045, xt = 0.11;
    const outline = [[-xt, -0.385], [xt, -0.385], [xt, -0.19], [x1, -0.17], [x1, -0.05], [-x1, -0.05], [-x1, -0.17], [-xt, -0.19]];
    const holes = [[POST.x, POST.z, u(0.41)], [-POST.x, POST.z, u(0.41)], [0.065, -0.36 + u(0.5), u(0.41)], [-0.065, -0.36 + u(0.5), u(0.41)]];
    const parts = [slab('xz', outline, t, y0, 'grey', holes)];
    // Caisson avant : tube rectangulaire 2 × 3 po le long du bord avant.
    parts.push(S.box(2 * x1, u(2), u(3), 'grey', { pos: [0, y0 + t + u(1), -0.05 - u(1.5)] }));
    P('2', merged(parts, 'grey'), [0, 0.2, 0]);
    // 12 / 17 — vis 3/4 × 1 3/4 et rondelles fendues dans les montants et la tour.
    holes.forEach(([x, z], i) => {
      P('17', at(splitWasher(S, THREE, 0.75), [x, y0 + t, z]), [0, 0.26 + 0.02 * i, 0]);
      P('12', screw(0.75, 1.75, [x, y0 + t + u(0.19), z], [0, 1, 0]), [0, 0.32 + 0.02 * i, 0]);
    });
  }

  // ================================================ 5 — tôle de garde
  {
    const y0 = RET.y + RET.t + u(2) + 0.004;
    const outline = [[-0.3, -0.26], [0.18, -0.26], [0.26, -0.2], [0.26, -0.12], [0.18, -0.1], [0.12, -0.06], [-0.24, -0.06], [-0.3, -0.12]];
    const parts = [slab('xz', outline, u(0.25), y0, 'grey', [[0.2, -0.17, u(0.41)]])];
    for (const [x, z] of [[-0.24, -0.22], [0.0, -0.17], [-0.12, -0.11], [0.12, -0.22]]) parts.push(L(S, [[0, 0], [0.6, 0], [0.6, 0.3], [0.54, 0.36], [0, 0.36]], 'grey', 24, { pos: [x, y0 + u(0.25), z] }));
    P('5', merged(parts, 'grey'), [0, 0.45, 0]);
    P('14', at(flatWasher(S, THREE, 0.75), [0.2, y0 + u(0.25), -0.17]), [0, 0.5, 0]);
    P('17', at(splitWasher(S, THREE, 0.75), [0.2, y0 + u(0.25) + u(0.1), -0.17]), [0, 0.53, 0]);
    P('12', screw(0.75, 1.75, [0.2, y0 + u(0.25) + u(0.1) + u(0.19), -0.17], [0, 1, 0]), [0, 0.58, 0]);
  }

  // ================================================ 9 — blocs de fixation au pied de mât
  for (const s of [1, -1]) {
    const bx = s * BLOCK.x;
    P('9', S.box(BLOCK.w, BLOCK.h, BLOCK.d, 'grey', { r: 0.003, pos: [bx, BLOCK.y, BLOCK.z] }), [s * 0.1, 0.06, -0.05]);
    // 11 — vis 1/2 × 4 selon X, de l'extérieur vers le pied de mât ; 19 —
    // rondelles Nord-Lock sous tête et sous écrou ; 21 — écrous nylstop.
    for (const dz of [-0.022, 0.022]) {
      const z = BLOCK.z + dz, xo = bx + s * BLOCK.w / 2;
      P('19', along(THREE, nordLock(S, THREE, 0.5), [s, 0, 0], [xo, BLOCK.y, z]), [s * 0.16, 0.06, 0]);
      P('11', screw(0.5, 4, [xo + s * u(0.22), BLOCK.y, z], [s, 0, 0]), [s * 0.22, 0.06, 0]);
      const xi = xo - s * (u(4) - u(0.22) - u(0.75));
      P('19', along(THREE, nordLock(S, THREE, 0.5), [-s, 0, 0], [xi, BLOCK.y, z]), [-s * 0.04, 0.06, 0]);
      P('21', along(THREE, nylocNut(S, THREE, 0.5), [-s, 0, 0], [xi - s * u(0.22), BLOCK.y, z]), [-s * 0.08, 0.06, 0]);
    }
    // 13 — vis 1 × 2 1/2 : verticale sous l'aile de l'équerre, vissée dans le
    // bloc (15 + 18) ; horizontale au travers de l'âme et du bloc, écrou 20.
    const yb = BLOCK.y - BLOCK.h / 2 - u(0.5);
    P('18', at(splitWasher(S, THREE, 1.0), [bx, yb - u(0.25), BLOCK.z], [Math.PI, 0, 0]), [0, -0.1, 0]);
    P('15', at(flatWasher(S, THREE, 1.0), [bx, yb - u(0.25), BLOCK.z], [Math.PI, 0, 0]), [0, -0.14, 0]);
    P('13', screw(1.0, 2.5, [bx, yb - u(0.25) - u(0.13) - u(0.25), BLOCK.z], [0, -1, 0]), [0, -0.2, 0]);
    const xw = s * (BLOCK.x + BLOCK.w / 2 + u(0.5));
    const yh = BLOCK.y + 0.02;
    P('15', along(THREE, flatWasher(S, THREE, 1.0), [s, 0, 0], [xw, yh, BLOCK.z]), [s * 0.12, 0, 0]);
    P('18', along(THREE, splitWasher(S, THREE, 1.0), [s, 0, 0], [xw + s * u(0.13), yh, BLOCK.z]), [s * 0.15, 0, 0]);
    P('13', screw(1.0, 2.5, [xw + s * (u(0.13) + u(0.25)), yh, BLOCK.z], [s, 0, 0]), [s * 0.2, 0, 0]);
    const xn = s * (BLOCK.x - BLOCK.w / 2);
    P('15', along(THREE, flatWasher(S, THREE, 1.0), [-s, 0, 0], [xn, yh, BLOCK.z]), [-s * 0.06, 0, 0]);
    P('20', along(THREE, hexNut(S, THREE, 1.0), [-s, 0, 0], [xn - s * u(0.13), yh, BLOCK.z]), [-s * 0.1, 0, 0]);
  }

  return { view: { dir: [0.9, 0.75, 1.1] } };
}
