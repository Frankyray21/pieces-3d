// P036 — Déflecteur de roches V30 CX003192 rév. 4 (page 36) : « V30 ROCK
// DEFLECTOR », repère 2 de l'avance P032. Bac ouvrant sous le pied de mât,
// autour de la tige au-dessus du trou : il arrête les cailloux projetés au
// soufflage et s'ouvre en deux volets pour les vider.
// - 1, caisson principal (mécano-soudé) boulonné sous le pied de mât :
//   semelle de 3/4 po derrière la tige, deux montants de pivot Ø 2 1/2 po
//   (goussets), âme transversale portant les chapes des fonds de vérin et la
//   barre d'appui du chapeau, deux selles à patin percé (vis 13 verticales),
//   deux équerres sous les blocs 9 (vis 13 horizontales) ;
// - 3 / 4, volets gauche / droit (vus de l'avant) : tôles soudées en bac
//   (flasque d'extrémité de 3/8 po à quatre trous de bavette, fond de 1/4 po
//   échancré autour de la tige et percé de quatre trous le long de l'arête
//   avant, paroi arrière abaissée au milieu sous les chapes des vérins, deux
//   tampons de butée), moyeu Ø 4 po bagué enfilé sur le montant, chape de
//   tige de vérin sur la face avant de la paroi arrière ;
// - 8, deux vérins Ø 2 × 6 po (P038), dessinés rentrés (volets fermés) : la
//   tige pousse la chape 0.09 m devant l'axe du volet, la sortie de tige
//   ouvre le volet vers l'extérieur ; axes de fond 6 (Ø 1 po, tête) dans les
//   chapes du caisson, axes de tige 7 (Ø 1 po à patte soudée) bloqués par une
//   vis 3/8 × 1 (10) et une rondelle fendue (16) ;
// - 2, chapeau de retenue : plaque de 1/2 po à caisson arrière, posée à 3 mm
//   au-dessus des moyeux, vissée dans les montants et la barre de l'âme (vis
//   3/4 × 1 3/4, 12, rondelles fendues 17) ; 5, tôle de garde sur quatre
//   entretoises soudées sur 2, une vis 12 (rondelles 17 et 14) dans une
//   entretoise taraudée ;
// - 9, deux blocs sur les flancs du pied de mât (P116 repère 4) : vis
//   1/2 × 4 (11), rondelles Nord-Lock (19, une sous tête et une sous écrou),
//   écrous nylstop (21) ; vis 13 horizontale (rondelles 18 et 15) au travers
//   de l'équerre du caisson, vissée dans le bloc.
// Montage dessiné : option « CX029380 MAST FOOT » de la page 36 pour les
// blocs ; les deux vis 13 verticales traversent la semelle du pied de mât
// (supposée de 1/2 po, non dessinée) et le patin de chaque selle, écrous 20
// dessous (rondelles 15 sous tête, 15 et 18 sous écrou) : la visserie de la
// liste est ainsi toute posée. Écrous 21 et rondelles 19 intérieurs : contre
// le flanc du pied de mât (absent tant que P116 n'est pas inséré).
// Le dessin de la page 36 est schématique (vue éclatée sans cotes) :
// disposition reconstituée d'après les pages 32, 34 et 36.
// Repère : origine sur l'axe de forage, au niveau du dessus de la semelle du
// caisson (1) ; Y vers le haut (le long des tiges) ; +Z vers l'avant de
// l'avance (côté opposé au mât) ; +X à gauche vu de l'arrière (côté du volet
// droit 4, vu de l'avant). Dessous de la semelle du pied de mât à y = 0.17,
// sur les patins des selles. Encombrement ≈ 1.13 (X) × 0.70 (Y, de -0.40 à
// 0.30) × 1.05 (Z, de -0.40 à 0.65) m.
import { L, u, IN, along, hhcs, hexNut, nylocNut, flatWasher, splitWasher, nordLock, bushing } from './_avance_b.js';
import { CYL038 } from './P038.js';

// Implantation (m).
const POST = { x: 0.28, z: -0.16, r: u(1.25), top: 0.205 }; // montants de pivot
const WALL = { x: 0.56, z0: -0.115, z1: 0.65, t: u(0.375) }; // flasques (z0 : dos de la paroi arrière)
const FLOOR = { y: -0.40, t: u(0.25), notch: 0.10 }; // fonds échancrés autour de la tige
const REAR = { z: -0.11, t: u(0.375), low: 0.05, lowX: 0.16 }; // paroi arrière des volets
const BOSS = { r: u(2), y0: 0.075, y1: 0.202 }; // moyeux des volets
const CYL = { y: 0.12, z: -0.07, x0: 0.09 }; // vérins : œil de fond à x = ±x0
const PLATE = { x: 0.37, z0: -0.40, z1: -0.13, t: u(0.75) }; // semelle du caisson
const WEB = { z: -0.135, x: 0.15, t: u(0.5) }; // âme transversale du caisson
const RET = { y: POST.top, t: u(0.5), z0: -0.26, z1: -0.10, x: 0.33 }; // chapeau de retenue
const BLOCK = { x: 0.33, y: 0.215, z: -0.36, w: u(2), h: u(3), d: u(3) }; // blocs 9
const SAD = { x: 0.06, z: -0.30, top: 0.17, t: u(0.5) }; // selles des vis 13 verticales
const FOOT = u(0.5); // semelle du pied de mât (non dessinée)

export const DEFL036 = { post: POST, plateTop: 0, footY: SAD.top, retTop: RET.y + RET.t };

export default function P036(api) {
  const { THREE, S } = api;
  const { extrude, merged, group, weld, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Plaques : contour 2D extrudé de t dans un plan.
  // 'xz' : points (x, z), de c à c + t ; 'yz' : points (z, y), centrée en x = c ;
  // 'xy' : points (x, y), centrée en z = c.
  const slab = (plane, pts, t, c, mat, holes = []) => {
    if (plane === 'xz') {
      const m = extrude(pts.map(([x, z]) => [x, -z]), t, mat, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
      m.rotation.x = -Math.PI / 2;
      m.position.y = c + t / 2;
      return m;
    }
    if (plane === 'yz') {
      const m = extrude(pts, t, mat, { holes });
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
  const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  // Chape plate horizontale : du bord z0 jusqu'à l'œil (xc, zc), bout arrondi.
  const lugPts = (xc, zc, z0, r = 0.035) => {
    const s = zc > z0 ? 1 : -1;
    return [[xc - r, z0], [xc + r, z0], [xc + r, zc], ...arcPts(xc, zc, r, 0, s * Math.PI, 10).slice(1, -1), [xc - r, zc]];
  };
  // Vis H (tête en +Y local) placée : dessous de tête en pos, tige selon -dir.
  const screw = (d, len, pos, dir) => along(THREE, hhcs(S, THREE, d, len), dir, pos);
  const wT = (d) => u(Math.max(0.065, d * 0.13)); // épaisseur des rondelles plates
  const sT = (d) => u(Math.max(0.06, d * 0.25)); // rondelles fendues

  // ================================================ 1 — caisson principal
  {
    const parts = [];
    parts.push(slab('xz', [[-PLATE.x, PLATE.z0 + 0.04], [-PLATE.x + 0.04, PLATE.z0], [PLATE.x - 0.04, PLATE.z0], [PLATE.x, PLATE.z0 + 0.04], [PLATE.x, PLATE.z1], [-PLATE.x, PLATE.z1]], PLATE.t, -PLATE.t, 'grey'));
    for (const s of [1, -1]) {
      // Montant de pivot Ø 2 1/2 po, bout chanfreiné (chapeau taraudé).
      parts.push(L(S, [[0, 0], [1.25, 0], [1.25, POST.top / IN - 0.06], [1.19, POST.top / IN], [0, POST.top / IN]], 'grey', 32, { pos: [s * POST.x, 0, POST.z] }));
      // Goussets (sous les moyeux) vers l'arrière et vers l'extérieur.
      parts.push(slab('xy', [[s * (POST.x + POST.r - 0.002), 0], [s * (POST.x + POST.r + 0.05), 0], [s * (POST.x + POST.r - 0.002), 0.06]], u(0.375), POST.z, 'grey'));
      parts.push(slab('yz', [[POST.z - POST.r + 0.002, 0], [POST.z - POST.r - 0.05, 0], [POST.z - POST.r + 0.002, 0.06]], u(0.375), s * POST.x, 'grey'));
      // Chapes des fonds de vérin : plats au-dessus et au-dessous de l'œil, en
      // console sur la face avant de l'âme.
      for (const dy of [-1, 1]) {
        const y = CYL.y + dy * (CYL038.eyeW / 2 + 0.0015 + u(0.25)) - u(0.25);
        parts.push(slab('xz', lugPts(s * CYL.x0, CYL.z, WEB.z + WEB.t / 2), u(0.5), y, 'grey', [[s * CYL.x0, CYL.z, u(0.52)]]));
      }
      // Selle : deux âmes et un patin percé Ø 1 1/16 (vis 13 verticale).
      for (const dx of [-0.035, 0.035]) parts.push(slab('yz', [[SAD.z - 0.04, 0], [SAD.z + 0.04, 0], [SAD.z + 0.04, SAD.top - SAD.t], [SAD.z - 0.04, SAD.top - SAD.t]], u(0.5), s * (SAD.x + dx), 'grey'));
      parts.push(slab('xz', rect(s * SAD.x - 0.045, SAD.z - 0.04, s * SAD.x + 0.045, SAD.z + 0.04), SAD.t, SAD.top - SAD.t, 'grey', [[s * SAD.x, SAD.z, u(0.53)]]));
      // Équerre sous le bloc 9 : plat vertical (plan XY) contre la face avant
      // du bloc, percé pour la vis 13 horizontale ; gousset.
      const zf = BLOCK.z + BLOCK.d / 2 + u(0.25);
      parts.push(slab('xy', [[s * (BLOCK.x - 0.035), 0], [s * (BLOCK.x + 0.035), 0], [s * (BLOCK.x + 0.035), BLOCK.y - 0.005], [s * (BLOCK.x - 0.035), BLOCK.y - 0.005]], u(0.5), zf, 'grey', [[s * BLOCK.x, BLOCK.y - BLOCK.h / 2 + 0.018, u(0.53)]]));
      parts.push(slab('yz', [[zf, 0], [zf + 0.06, 0], [zf, 0.1]], u(0.375), s * BLOCK.x, 'grey'));
    }
    // Âme transversale et barre d'appui du chapeau en tête.
    parts.push(slab('xy', rect(-WEB.x, 0, WEB.x, RET.y - u(1)), WEB.t, WEB.z, 'grey'));
    parts.push(S.box(2 * WEB.x, u(1), u(1.5), 'grey', { pos: [0, RET.y - u(0.5), WEB.z] }));
    const welds = [
      weld([[-WEB.x, 0.003, WEB.z + WEB.t / 2 + 0.003], [WEB.x, 0.003, WEB.z + WEB.t / 2 + 0.003]], 0.007, 'grey'),
      weld([[-WEB.x, 0.003, WEB.z - WEB.t / 2 - 0.003], [WEB.x, 0.003, WEB.z - WEB.t / 2 - 0.003]], 0.007, 'grey'),
    ];
    for (const s of [1, -1]) welds.push(S.weldRing(POST.r + 0.002, 0.007, 'grey', { pos: [s * POST.x, 0.002, POST.z] }));
    P('1', group(merged(parts, 'grey'), merged(welds, 'grey')), [0, -0.12, 0]);
  }

  // ================================================ 3 / 4 — volets
  // Volet côté s (+1 : droit 4, vu de l'avant ; -1 : gauche 3).
  const flap = (s) => {
    const mat = 'lightGrey';
    const parts = [], rubber = [];
    const top = BOSS.y1;
    const xi = s * 0.005, xo = s * (WALL.x - WALL.t / 2);
    // Flasque d'extrémité : bord avant arrondi en haut, quatre trous de bavette.
    const side = [[WALL.z0, FLOOR.y], [WALL.z1 - 0.06, FLOOR.y], [WALL.z1, FLOOR.y + 0.06], [WALL.z1, top - 0.09], [WALL.z1 - 0.09, top], [WALL.z0, top]];
    parts.push(slab('yz', side, WALL.t, s * WALL.x, mat, [0, 1, 2, 3].map((i) => [WALL.z1 - 0.03, FLOOR.y + 0.07 + i * 0.1, u(0.28)])));
    // Fond : de l'axe (jeu de 5 mm) à la flasque, échancré autour de la tige,
    // quatre trous de bavette le long de l'arête avant.
    const nr = FLOOR.notch, xw = WALL.x - WALL.t / 2;
    const notch = arcPts(0, 0, nr, -Math.PI / 2, Math.PI / 2, 12).slice(1, -1);
    const fl = [[0.005, REAR.z], [xw, REAR.z], [xw, WALL.z1 - 0.06], [xw - 0.05, WALL.z1], [0.005, WALL.z1], [0.005, nr], ...notch.reverse().map(([x, z]) => [Math.max(x, 0.005), z]), [0.005, -nr]].map(([x, z]) => [s * x, z]);
    const fh = [0, 1, 2, 3].map((i) => [s * (0.1 + i * 0.11), WALL.z1 - 0.03, u(0.28)]);
    parts.push(slab('xz', s > 0 ? fl : fl.slice().reverse(), FLOOR.t, FLOOR.y, mat, fh));
    // Paroi arrière (plan XY) : abaissée au milieu sous les chapes des vérins.
    const rear = [[xi, FLOOR.y], [xo, FLOOR.y], [xo, top], [s * (POST.x - BOSS.r), top], [s * (POST.x - BOSS.r), BOSS.y0], [s * REAR.lowX, BOSS.y0], [s * REAR.lowX, REAR.low], [xi, REAR.low]];
    parts.push(slab('xy', s > 0 ? rear : rear.slice().reverse(), REAR.t, REAR.z, mat));
    // Bras du moyeu : plat horizontal du moyeu à la paroi arrière.
    parts.push(slab('xz', rect(s * POST.x - BOSS.r * 0.7, POST.z, s * POST.x + BOSS.r * 0.7, REAR.z - REAR.t / 2), u(0.5), BOSS.y0, mat));
    // Moyeu Ø 4 po (alésage de la bague Ø 2 1/2 × 2 3/4).
    parts.push(L(S, [[1.375, BOSS.y0 / IN], [2, BOSS.y0 / IN], [2, BOSS.y1 / IN - 0.06], [1.94, BOSS.y1 / IN], [1.375, BOSS.y1 / IN], [1.375, BOSS.y0 / IN]], mat, 36, { pos: [s * POST.x, 0, POST.z] }));
    // Chape de tige de vérin : deux oreilles sur la face avant de la paroi arrière.
    const xr = s * (CYL.x0 + CYL038.retracted);
    for (const dy of [-1, 1]) {
      const y = CYL.y + dy * (CYL038.rodEyeW / 2 + 0.0015 + u(0.25)) - u(0.25);
      parts.push(slab('xz', lugPts(xr, CYL.z, REAR.z + REAR.t / 2), u(0.5), y, mat, [[xr, CYL.z, u(0.52)]]));
    }
    // Tampons de butée (caoutchouc) au dos de la paroi arrière.
    for (const x of [0.38, 0.5]) rubber.push(L(S, [[0, 0], [0.75, 0], [0.75, 0.9], [0.65, 1.0], [0, 1.0]], 'rubber', 20, { axis: '-z', pos: [s * x, -0.25, REAR.z - REAR.t / 2] }));
    // Bague du moyeu (bronze), visible dans l'alésage.
    const bush = at(bushing(S, THREE, 1.375, 1.25, (BOSS.y1 - BOSS.y0) / IN - 0.04), [s * POST.x, (BOSS.y0 + BOSS.y1) / 2, POST.z]);
    const yb = FLOOR.y + FLOOR.t + 0.003;
    const welds = [
      weld([[s * (WALL.x - WALL.t / 2 - 0.003), yb, REAR.z + REAR.t / 2], [s * (WALL.x - WALL.t / 2 - 0.003), yb, WALL.z1 - 0.06]], 0.007, mat),
      weld([[xi, yb, REAR.z + REAR.t / 2 + 0.003], [xo, yb, REAR.z + REAR.t / 2 + 0.003]], 0.007, mat),
    ];
    return group(merged(parts, mat), merged(welds, mat), merged(rubber, 'rubber'), bush);
  };
  P('4', flap(1), [0.3, 0.05, 0.3]);
  P('3', flap(-1), [-0.3, 0.05, 0.3]);

  // ================================================ 8 — vérins, 6 / 7 — axes
  for (const s of [1, -1]) {
    // P038 : Y le long du vérin, Z selon les œils, orifices +X. Ici le vérin
    // court selon s·X, œils verticaux, orifices vers l'avant (+Z).
    const c = api.sub('P038');
    const g = new THREE.Group();
    g.add(c);
    const Yl = new THREE.Vector3(s, 0, 0), Zl = new THREE.Vector3(0, s, 0);
    const Xl = new THREE.Vector3().crossVectors(Yl, Zl);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xl, Yl, Zl));
    g.position.set(s * CYL.x0, CYL.y, CYL.z);
    P('8', g, [0, 0, 0.12]);
    // 6 — axe de fond Ø 1 × 3 1/2 po, tête Ø 1 1/2, posé tête en haut.
    const yTop = CYL.y + CYL038.eyeW / 2 + 0.0015 + u(0.5);
    P('6', at(L(S, [[0, -3.3], [0.44, -3.3], [0.5, -3.24], [0.5, 0], [0.75, 0], [0.75, 0.3], [0.7, 0.35], [0, 0.35]], 'steel', 20), [s * CYL.x0, yTop, CYL.z]), [0, 0.3, 0]);
    // 7 — axe de tige Ø 1 po à patte soudée (plat 1/4 po percé Ø 13/32), vis
    // 10 (3/8 × 1, filet complet) et rondelle fendue 16 dans l'oreille haute.
    const xr = s * (CYL.x0 + CYL038.retracted);
    const yT = CYL.y + CYL038.rodEyeW / 2 + 0.0015 + u(0.5);
    const tab = [[-0.016, -0.016], [0.06, -0.016], ...arcPts(0.06, 0, 0.016, -Math.PI / 2, Math.PI / 2, 8).slice(1, -1), [0.06, 0.016], [-0.016, 0.016]].map(([x, z]) => [-s * x, z]);
    P('7', at(merged([
      L(S, [[0, -3.0], [0.44, -3.0], [0.5, -2.94], [0.5, 0.25], [0.46, 0.3], [0, 0.3]], 'steel', 20),
      slab('xz', s > 0 ? tab.slice().reverse() : tab, u(0.25), 0, 'steel', [[-s * 0.06, 0, u(0.205)]]),
    ], 'steel'), [xr, yT, CYL.z]), [0, 0.25, 0]);
    P('16', at(splitWasher(S, THREE, 0.375), [xr - s * 0.06, yT + u(0.25), CYL.z]), [0, 0.32, 0]);
    P('10', screw(0.375, 1.0, [xr - s * 0.06, yT + u(0.25) + sT(0.375), CYL.z], [0, 1, 0]), [0, 0.38, 0]);
  }

  // ================================================ 2 — chapeau de retenue
  {
    const y0 = RET.y, t = RET.t;
    const holes = [[POST.x, POST.z, u(0.41)], [-POST.x, POST.z, u(0.41)], [0.07, WEB.z, u(0.41)], [-0.07, WEB.z, u(0.41)]];
    const parts = [slab('xz', rect(-RET.x, RET.z0, RET.x, RET.z1), t, y0, 'grey', holes)];
    // Caisson arrière : tube rectangulaire 2 × 3 po soudé le long du bord.
    parts.push(S.box(0.6, u(2), u(3), 'grey', { pos: [0, y0 + t + u(1), RET.z0 + u(1.5)] }));
    // Entretoises de la tôle de garde (Ø 1 × 2.2 po).
    const STAND = [[-0.22, -0.13], [-0.05, -0.13], [0.12, -0.13], [0.24, -0.13]];
    for (const [x, z] of STAND) parts.push(L(S, [[0, 0], [0.5, 0], [0.5, 2.2], [0, 2.2]], 'grey', 20, { pos: [x, y0 + t, z] }));
    P('2', merged(parts, 'grey'), [0, 0.2, 0]);
    // 12 / 17 — vis 3/4 × 1 3/4 et rondelles fendues dans les montants et la barre.
    holes.forEach(([x, z], i) => {
      P('17', at(splitWasher(S, THREE, 0.75), [x, y0 + t, z]), [0, 0.26 + 0.02 * i, 0]);
      P('12', screw(0.75, 1.75, [x, y0 + t + sT(0.75), z], [0, 1, 0]), [0, 0.32 + 0.02 * i, 0]);
    });

    // ============================================== 5 — tôle de garde
    const y5 = y0 + t + u(2.2);
    const outline = [[-0.3, -0.185], [0.2, -0.185], [0.28, -0.16], [0.28, -0.11], [0.2, -0.095], [-0.24, -0.095], [-0.3, -0.12]];
    const g5 = [slab('xz', outline, u(0.25), y5, 'grey', [[0.24, -0.13, u(0.41)]])];
    for (const [x, z] of [[-0.22, -0.13], [-0.05, -0.13], [0.12, -0.13]]) g5.push(L(S, [[0, 0], [0.6, 0], [0.6, 0.3], [0.54, 0.36], [0, 0.36]], 'grey', 24, { pos: [x, y5 + u(0.25), z] }));
    P('5', merged(g5, 'grey'), [0, 0.45, 0]);
    const yw = y5 + u(0.25);
    P('14', at(flatWasher(S, THREE, 0.75), [0.24, yw, -0.13]), [0, 0.5, 0]);
    P('17', at(splitWasher(S, THREE, 0.75), [0.24, yw + wT(0.75), -0.13]), [0, 0.54, 0]);
    P('12', screw(0.75, 1.75, [0.24, yw + wT(0.75) + sT(0.75), -0.13], [0, 1, 0]), [0, 0.6, 0]);
  }

  // ================================================ 9 — blocs de fixation au pied de mât
  for (const s of [1, -1]) {
    const bx = s * BLOCK.x;
    P('9', S.box(BLOCK.w, BLOCK.h, BLOCK.d, 'grey', { r: 0.003, pos: [bx, BLOCK.y, BLOCK.z] }), [s * 0.1, 0.06, 0]);
    // 11 — vis 1/2 × 4 selon X, du dehors vers le flanc du pied de mât ; 19 —
    // une rondelle Nord-Lock (paire) sous tête et une sous écrou ; 21 — écrou nylstop.
    const yb = BLOCK.y + 0.025;
    const nl = u(2 * Math.max(0.05, 0.5 * 0.11));
    for (const dz of [-0.022, 0.022]) {
      const z = BLOCK.z + dz, xo = bx + s * BLOCK.w / 2;
      P('19', along(THREE, nordLock(S, THREE, 0.5), [s, 0, 0], [xo, yb, z]), [s * 0.16, 0, 0]);
      P('11', screw(0.5, 4, [xo + s * nl, yb, z], [s, 0, 0]), [s * 0.24, 0, 0]);
      const xi = xo + s * nl - s * (u(4) - u(0.75));
      P('19', along(THREE, nordLock(S, THREE, 0.5), [-s, 0, 0], [xi, yb, z]), [-s * 0.05, 0, 0]);
      P('21', along(THREE, nylocNut(S, THREE, 0.5), [-s, 0, 0], [xi - s * nl, yb, z]), [-s * 0.1, 0, 0]);
    }
    // 13 — vis 1 × 2 1/2 selon Z au travers de l'équerre, vissée dans le bloc :
    // rondelle plate 15 contre l'équerre, rondelle fendue 18 sous la tête.
    const zf = BLOCK.z + BLOCK.d / 2 + u(0.5);
    const yh = BLOCK.y - BLOCK.h / 2 + 0.018;
    P('15', along(THREE, flatWasher(S, THREE, 1.0), [0, 0, 1], [bx, yh, zf]), [0, 0, 0.08]);
    P('18', along(THREE, splitWasher(S, THREE, 1.0), [0, 0, 1], [bx, yh, zf + wT(1)]), [0, 0, 0.12]);
    P('13', screw(1.0, 2.5, [bx, yh, zf + wT(1) + sT(1)], [0, 0, 1]), [0, 0, 0.18]);
    // 13 — vis verticale au travers de la semelle du pied de mât et du patin de
    // la selle : 15 sous la tête ; 15, 18 et écrou 20 sous le patin.
    const sx = s * SAD.x, yTop = SAD.top + FOOT;
    P('15', at(flatWasher(S, THREE, 1.0), [sx, yTop, SAD.z]), [0, 0.1, 0]);
    P('13', screw(1.0, 2.5, [sx, yTop + wT(1), SAD.z], [0, 1, 0]), [0, 0.16, 0]);
    const yu = SAD.top - SAD.t;
    P('15', at(flatWasher(S, THREE, 1.0), [sx, yu, SAD.z], [Math.PI, 0, 0]), [0, -0.05, 0]);
    P('18', at(splitWasher(S, THREE, 1.0), [sx, yu - wT(1), SAD.z], [Math.PI, 0, 0]), [0, -0.08, 0]);
    P('20', at(hexNut(S, THREE, 1.0), [sx, yu - wT(1) - sT(1), SAD.z], [Math.PI, 0, 0]), [0, -0.12, 0]);
  }

  return { view: { dir: [0.9, 0.75, 1.1] } };
}
