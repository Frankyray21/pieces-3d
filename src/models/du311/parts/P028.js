// P028 — Vérin d'extension d'avance CX077202 (dessin page 28, liste page 29) :
// « CYLINDER - Ø3.00 X 54" ST », alésage 3 po, course 54 po, tige Ø 1 3/4 po.
// Vérin soudé à tête vissée, dessiné rentré, demi-coupe à gauche :
// - corps (14) : tube Ø 3 1/2 × 1/4 po soudé sur le fond (15, ensemble tube
//   NSS), chape de fond (16) soudée dessous, deux bossages d'orifice SAE 7/16-20
//   (17) côté -X, chacun fermé par un bouchon à six-pans creux (18) ;
// - tête vissée (1) : collerette au diamètre du tube (deux trous radiaux de
//   clé à ergot), filet dans l'alésage du tube, joint torique (2) et bague
//   anti-extrusion (3, « BACK UP ») dans la gorge extérieure ; dans l'alésage :
//   racleur (5) dans le lamage du haut, joint de tige en U (4), bague de
//   guidage (6) ;
// - tige soudée (12) : tige chromée Ø 1 3/4 po, queue Ø 7/8 filetée 7/8-14 UNF,
//   chape à fourche (13) soudée en bout ; entretoise de course (11) sur la
//   tige, piston (7) à joint « delta » (8 : élément central et deux bagues
//   d'appui dans la gorge étagée), joint torique (9) dans le chanfrein de
//   l'alésage du piston, écrou à freinage nylon 7/8-14 UNF (10).
// Repère : origine sur l'axe de l'œil de la chape de fond (16), Y le long de
// l'axe du vérin vers la tige ; Z selon les axes des deux chapes (axes
// d'articulation parallèles) ; X en travers, orifices et bouchons vers -X
// (côté coupé du dessin). Vérin rentré : entraxe des chapes 1.703 m (67.05 po),
// sorti 3.075 m. Encombrement ≈ 0.108 (X, de -0.063 aux bouchons à +0.045)
// × 1.756 (Y, de -0.028 à 1.728) × 0.089 (Z) m.
// Cotes : liste (alésage, course, écrou 7/8-14), cote de 1/4 po de la paroi
// du tube ; le reste relevé sur le dessin à l'échelle de l'alésage (66,7 px/po
// sur la page). Course = jeu entre l'entretoise et le dessous de la tête.
// Fourches (vues en fourche sur l'isométrie de P024) : le dessin les montre
// dans l'axe de leur alésage ; leur épaisseur selon Z (2 joues de 1/2 po,
// fente de 1 1/4 po, 2 1/4 po hors tout) vient des vis à épaulement
// 1 × 2 1/4 po qui les traversent (P024, P026). Cotes utiles au parent : CYL028.

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes axiales (po), vérin rentré, depuis l'axe de l'œil de fond.
const Y = {
  lugTip: -1.11, // bout arrondi de la chape de fond
  capBot: 2.11, // dessous du fond (pied de la chape 16)
  tubeBot: 2.45, // bout du tube, chanfrein de soudure
  capTop: 2.61, // face intérieure du fond
  rodEnd: 2.68, // bout de la queue de tige
  nutBot: 2.80,
  pistonBot: 3.55,
  pistonTop: 4.60, // épaulement de la tige
  spacerTop: 6.61,
  portA: 3.35, // orifice côté fond
  hpBot: 60.61, // dessous de la tête = spacerTop + course
  portB: 60.58, // orifice côté tige (au pied de la tête)
  tubeTop: 62.53,
  hpTop: 62.95,
  rodCh: 63.62, // début du chanfrein de soudure de la tige
  clevisBot: 63.82,
  eye: 67.05, // axe de l'œil de la chape de tige
  clevisTip: 68.03,
};
const STROKE = 54;
const BORE = 1.5, TUBE = 1.75, ROD = 0.875, PILOT = 0.4375; // rayons (po)
// Jeu radial entre pièces emboîtées (0,5 mm) : surfaces jamais confondues, la
// coupe reste nette (pas de scintillement entre deux parois superposées).
const G = 0.02;
const BOSS = { r: 0.4375, base: 1.55, face: 2.36 }; // bossage d'orifice selon -X
// Fourches : joues de 1/2 po, fente de 1 1/4 po, largeur 2 po, alésage Ø 1.03 po.
const FORK = { W: 2.0, T: 2.25, gap: 1.25, hole: 0.515 };

export const CYL028 = {
  pinRetracted: u(Y.eye), // y de l'œil de tige (vérin rentré)
  stroke: u(STROKE),
  bore: u(2 * BORE),
  tubeR: u(TUBE),
  rodR: u(ROD),
  forkGap: u(FORK.gap),
  forkWidth: u(FORK.T),
  portX: -u(BOSS.face),
  portY: [u(Y.portA), u(Y.portB)],
};

export default function P028(api) {
  const { THREE, S } = api;
  const { lathe, thread, torus, slotted, roundHole, weld, weldRing, merged, creaseNormals, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Profil de révolution en pouces [r, y] → lathe en mètres.
  const L = (pts, mat, seg = 40, opts = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
  const circle = (cx, cy, r, n = 28) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

  // Fourche (repère local, po) : œil à l'origine, bout arrondi vers +Y, pied
  // vers -Y ; deux joues percées selon Z au-dessus du fond de fente, bloc plein
  // en dessous. Maillage fermé d'une pièce (pas de paroi interne : coupe nette).
  // tip : bout ; side : fin des flancs droits ; slot : fond de la fente ; base : pied.
  const fork = ({ tip, side, slot, base }, mat) => {
    const { W, T, gap, hole } = FORK;
    const w = W / 2, h = tip - side;
    const R = (w * w + h * h) / (2 * h), cy = tip - R;
    const a0 = Math.atan2(side - cy, w);
    const n = 16;
    const arcPts = Array.from({ length: n - 1 }, (_, i) => {
      const a = a0 + ((Math.PI - 2 * a0) * (i + 1)) / n;
      return [R * Math.cos(a), cy + R * Math.sin(a)];
    });
    // Contours dans le sens trigonométrique : joue (au-dessus de la fente) et pièce entière.
    const upper = [[w, slot], [w, side], ...arcPts, [-w, side], [-w, slot]];
    const outline = [[-w, base], [w, base], ...upper];
    const holePts = circle(0, 0, hole, 28);
    const pos = [];
    const P3 = (x, y, z) => [u(x), u(y), u(z)];
    const tri = (a, b, c, nrm) => {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const d = (uy * vz - uz * vy) * nrm[0] + (uz * vx - ux * vz) * nrm[1] + (ux * vy - uy * vx) * nrm[2];
      pos.push(...a, ...(d < 0 ? c : b), ...(d < 0 ? b : c));
    };
    const quad = (a, b, c, d, nrm) => { tri(a, b, c, nrm); tri(a, c, d, nrm); };
    // Faces planes (normale ±Z) triangulées avec l'alésage.
    const cap = (pts, z, nz) => {
      const v2 = (q) => q.map(([x, y]) => new THREE.Vector2(x, y));
      const all = [...pts, ...holePts];
      for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(v2(pts), [v2(holePts)])) {
        tri(P3(...all[i], z), P3(...all[j], z), P3(...all[k], z), [0, 0, nz]);
      }
    };
    cap(outline, T / 2, 1);
    cap(outline, -T / 2, -1);
    cap(upper, gap / 2, -1);
    cap(upper, -gap / 2, 1);
    const cheeks = [[gap / 2, T / 2], [-T / 2, -gap / 2]];
    // Flancs : sur toute l'épaisseur sous le fond de fente, par joue au-dessus.
    outline.forEach(([x0, y0], i) => {
      const [x1, y1] = outline[(i + 1) % outline.length];
      const spans = Math.max(y0, y1) <= slot + 1e-9 ? [[-T / 2, T / 2]] : cheeks;
      for (const [za, zb] of spans) quad(P3(x0, y0, za), P3(x1, y1, za), P3(x1, y1, zb), P3(x0, y0, zb), [y1 - y0, x0 - x1, 0]);
    });
    // Alésage des joues et fond de la fente.
    holePts.forEach(([x0, y0], i) => {
      const [x1, y1] = holePts[(i + 1) % holePts.length];
      for (const [za, zb] of cheeks) quad(P3(x0, y0, za), P3(x1, y1, za), P3(x1, y1, zb), P3(x0, y0, zb), [-(x0 + x1), -(y0 + y1), 0]);
    });
    quad(P3(-w, slot, -gap / 2), P3(w, slot, -gap / 2), P3(w, slot, gap / 2), P3(-w, slot, gap / 2), [0, 1, 0]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return merged([new THREE.Mesh(creaseNormals(geo))], mat);
  };

  // ================================================ 14 — tube (corps soudé)
  // Paroi percée des deux orifices (côté -X) ; bout bas chanfreiné pour la
  // soudure sur le fond, bout haut chanfreiné (entrée de la tête) ; taraudage
  // de la tête (61.31 à 62.48, pas 1/12) : filets en saillie dans l'alésage,
  // creux au rayon de l'alésage, en phase avec le filet de la tête 1 (jeu
  // radial constant G, ligne en zigzag du dessin). Pas de tranche nouvelle
  // dans la paroi : aucun contour parasite autour du tube.
  const portHoles = [Y.portA, Y.portB].flatMap((y) => roundHole(-Math.PI / 2, u(y), u(0.19), u(TUBE), { steps: 8 }));
  const TAP = { y0: 61.31, y1: 62.48 };
  const barrel = merged([
    slotted(u(TUBE), u(BORE), u(2.60), u(62.50), portHoles, 'grey', { seg: 56 }),
    L([[BORE, Y.tubeBot], [1.55, Y.tubeBot], [TUBE, 2.60], [BORE, 2.60], [BORE, Y.tubeBot]], 'grey', 56),
    L([[BORE, 62.50], [TUBE, 62.50], [TUBE, 62.51], [1.73, Y.tubeTop], [1.53, Y.tubeTop], [BORE, 62.50]], 'grey', 56),
    L([[BORE, TAP.y0], ...thread(BORE, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 14, chamferBottom: false }).reverse()], 'grey', 56),
  ], 'grey');
  barrel.userData.hasInterior = true;
  // Cordon en V tube / fond (bombé, déborde légèrement du tube)
  const capWeld = weldRing(u(1.69), u(0.26), 'grey', { pos: [0, u(Y.tubeBot + 0.02), 0] });
  P('14', group(barrel, capWeld), [0, 0, 0]);

  // 15 — fond : disque Ø 3 1/2 × 1/2 po, chanfrein de soudure et portée dans le tube
  P('15', L([
    [0, Y.capBot], [1.71, Y.capBot], [TUBE, Y.capBot + 0.04], [TUBE, 2.30], [1.55, Y.tubeBot],
    [BORE - G, Y.tubeBot], [BORE - G, Y.capTop - 0.03], [1.45, Y.capTop], [0, Y.capTop],
  ], 'grey', 56), [0, -0.035, 0]);

  // 16 — chape de fond : fourche retournée (bout vers -Y), soudée sous le fond
  const lug = fork({ tip: -Y.lugTip, side: 0.70, slot: -1.25, base: -Y.capBot }, 'grey');
  lug.rotation.z = Math.PI;
  const wx = FORK.W / 2 + 0.06, wz = FORK.T / 2 + 0.06, wy = Y.capBot - 0.06;
  const lugWeld = weld([[-wx, wy, -wz], [wx, wy, -wz], [wx, wy, wz], [-wx, wy, wz]].map(([x, y, z]) => [u(x), u(y), u(z)]), u(0.2), 'grey', { closed: true });
  P('16', group(lug, lugWeld), [0, -0.07, 0]);

  // 17 — bossages d'orifice SAE 7/16-20 (lamage et chanfrein du joint), soudés
  // sur le tube ; 18 — bouchons à six-pans creux (joint torique sous la tête)
  const boss = (y) => L([
    [0.19, BOSS.base], [BOSS.r, BOSS.base], [BOSS.r, BOSS.face - 0.04], [BOSS.r - 0.04, BOSS.face],
    [0.275, BOSS.face], [0.235, BOSS.face - 0.03], [0.219, BOSS.face - 0.06], [0.219, 1.90], [0.19, 1.87], [0.19, BOSS.base],
  ], 'grey', 28, { axis: '-x', pos: [0, u(y), 0] });
  const plug = () => {
    const R = u(0.28), h = u(0.13), af = u(0.1875), b = u(0.015);
    const rh = af / 2 / Math.cos(Math.PI / 6);
    const hex = Array.from({ length: 6 }, (_, i) => new THREE.Vector2(rh * Math.cos((i * Math.PI) / 3), rh * Math.sin((i * Math.PI) / 3)));
    const head = new THREE.Shape();
    head.absarc(0, 0, R, 0, Math.PI * 2, false);
    head.holes.push(new THREE.Path(hex));
    const g1 = new THREE.ExtrudeGeometry(head, {
      depth: h - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 16,
    });
    g1.translate(0, 0, b);
    g1.rotateX(-Math.PI / 2);
    const g2 = new THREE.ExtrudeGeometry(new THREE.Shape(hex), { depth: u(0.04), bevelEnabled: false });
    g2.rotateX(-Math.PI / 2);
    return group(
      merged([
        new THREE.Mesh(creaseNormals(g1)), new THREE.Mesh(g2),
        L([[0, -0.36], ...thread(0.2, -0.36, -0.06, { pitch: 0.05, maxTurns: 6 }), [0.2, 0], [0, 0]], 'zinc', 14),
      ], 'zinc'),
      torus(u(0.248), u(0.032), 'rubber', { pos: [0, -u(0.035), 0] }),
    );
  };
  for (const y of [Y.portA, Y.portB]) {
    P('17', group(
      boss(y),
      weldRing(u(0.47), u(0.13), 'grey', { axis: 'x', pos: [-u(1.71), u(y), 0] }),
    ), [-0.03, 0, 0]);
    P('18', at(plug(), [-u(BOSS.face), u(y), 0], [0, 0, Math.PI / 2]), [-0.1, 0, 0]);
  }

  // ================================================ tête (1) et ses joints
  // Partie tournée (collerette réduite à r 1.45 : la couronne extérieure,
  // percée des trous de clé, est un tube à fenêtres).
  const headTurned = L([
    [0.96, Y.hpBot], [1.43, Y.hpBot], [1.48, Y.hpBot + 0.05], [1.48, 60.89],
    [1.39, 60.89], [1.39, 61.11], [1.48, 61.11], [1.48, 61.24], [1.43, 61.27], [1.43, 61.31],
    ...thread(BORE - G, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 14 }),
    [BORE - G, Y.tubeTop], [1.45, Y.tubeTop], [1.45, Y.hpTop],
    [1.125, Y.hpTop], [1.125, 62.64], [ROD + G, 62.64], // lamage du racleur
    [ROD + G, 62.46], [1.065, 62.46], [1.065, 62.04], [ROD + G, 62.04], // gorge du joint de tige
    [ROD + G, 61.35], [1.005, 61.35], [1.005, 60.84], [ROD + G, 60.84], // gorge de la bague de guidage
    [ROD + G, Y.hpBot + 0.065], [0.96, Y.hpBot],
  ], 'grey', 64);
  // Trous de clé Ø 0.27 en 12 tranches (contour rond en gros plan) ; même
  // découpage angulaire (64) pour les trois pièces : parois confondues à r 1.45.
  const keyHoles = [-Math.PI / 2, Math.PI / 2].flatMap((a) => roundHole(a, u(62.74), u(0.135), u(TUBE), { steps: 12 }));
  const collar = slotted(u(TUBE), u(1.45), u(Y.tubeTop), u(Y.hpTop - 0.05), keyHoles, 'grey', { seg: 64 });
  // arrondi de l'arête extérieure du haut de la collerette
  const collarTop = L([[1.45, Y.hpTop - 0.05], [TUBE, Y.hpTop - 0.05], [1.74, Y.hpTop - 0.02], [1.72, Y.hpTop - 0.005], [1.70, Y.hpTop], [1.45, Y.hpTop], [1.45, Y.hpTop - 0.05]], 'grey', 64);
  const headplate = merged([headTurned, collar, collarTop], 'grey');
  headplate.userData.hasInterior = true;

  // Éclaté : la tête dévissée monte dans l'axe du tube, le torique et la bague
  // anti-extrusion entre le tube et la tête, les joints de l'alésage au-dessus
  // de la tête (dans leur ordre) ; la tige sort de côté (+X) et de 0.3 m vers
  // le haut avec l'entretoise, les pièces du piston s'échelonnent sous le bout
  // de la tige (pas d'environ 0.1 m entre petites pièces) ; les éléments
  // soudés du corps (fond, chape, bossages) s'écartent à peine.
  const DX = 0.17, LIFT = 0.3;
  P('1', headplate, [0, 0.30, 0]);
  // 2 — joint torique extérieur, 3 — bague anti-extrusion (côté basse pression)
  P('2', torus(u(1.4425), u(0.0395), 'rubber', { pos: [0, u(61.005), 0] }), [0, 0.12, 0]);
  P('3', L([[1.405, 61.055], [1.482, 61.055], [1.482, 61.105], [1.405, 61.105], [1.405, 61.055]], 'white', 56), [0, 0.219, 0]);
  // 5 — racleur : talon dans le lamage, lèvre relevée sur la tige
  P('5', L([
    [0.95, 62.64], [1.105, 62.64], [1.105, 62.92], [1.08, Y.hpTop], [0.99, Y.hpTop], [0.915, 63.05],
    [ROD + G, 63.05], [ROD + G, 63.0], [0.935, 62.90], [0.935, 62.70], [0.95, 62.64],
  ], 'rubber', 48), [0, 0.584, 0]);
  // 4 — joint de tige en U, lèvres vers la pression (vers le bas)
  P('4', L([
    [ROD + G, 62.07], [0.935, 62.07], [0.95, 62.25], [0.99, 62.25], [1.005, 62.07], [1.045, 62.07],
    [1.045, 62.45], [ROD + G, 62.45], [ROD + G, 62.07],
  ], 'blue', 48), [0, 0.499, 0]);
  // 6 — bague de guidage
  P('6', L([[ROD + G, 60.85], [0.985, 60.85], [0.985, 61.34], [ROD + G, 61.34], [ROD + G, 60.85]], 'cream', 48), [0, 0.428, 0]);

  // ================================================ tige (12) et chape (13)
  P('12', group(
    // tige chromée Ø 1 3/4, épaulement chanfreiné, chanfrein de soudure sous la chape
    L([[0, Y.pistonTop], [0.80, Y.pistonTop], [ROD, Y.pistonTop + 0.06], [ROD, Y.rodCh], [0.695, Y.clevisBot], [0, Y.clevisBot]], 'chrome', 40),
    // queue Ø 7/8 filetée 7/8-14 UNF
    L([[0, Y.rodEnd], ...thread(PILOT, Y.rodEnd, 3.95, { pitch: 1 / 14, maxTurns: 14 }), [PILOT, Y.pistonTop], [0, Y.pistonTop]], 'steel', 20),
  ), [DX, LIFT, 0]);
  const clevis = fork({ tip: Y.clevisTip - Y.eye, side: 0.59, slot: -1.75, base: Y.clevisBot - Y.eye }, 'grey');
  clevis.position.y = u(Y.eye);
  P('13', group(clevis, weldRing(u(0.79), u(0.2), 'grey', { pos: [0, u(Y.clevisBot - 0.06), 0] })), [DX, LIFT + 0.035, 0]);

  // ================================================ piston et entretoise
  // 11 — entretoise de course Ø 2 1/4 × 2 po sur la tige
  P('11', L([
    [ROD + G, Y.pistonTop], [1.10, Y.pistonTop], [1.125, Y.pistonTop + 0.025], [1.125, Y.spacerTop - 0.06],
    [1.065, Y.spacerTop], [0.93, Y.spacerTop], [ROD + G, Y.spacerTop - 0.035], [ROD + G, Y.pistonTop],
  ], 'steel', 48), [DX, LIFT + 0.1, 0]);
  // 7 — piston : portées en retrait de 0,8 mm dans le tube, gorge étagée du
  // joint delta, chanfrein du torique en haut de l'alésage
  const LAND = BORE - 0.035;
  P('7', L([
    [0.50, Y.pistonBot], [1.41, Y.pistonBot], [LAND, 3.605], [LAND, 3.67], [1.40, 3.67], [1.40, 3.87],
    [1.30, 3.87], [1.30, 4.28], [1.40, 4.28], [1.40, 4.48], [LAND, 4.48], [LAND, 4.545], [1.41, Y.pistonTop],
    [0.59, Y.pistonTop], [PILOT + G, 4.47], [PILOT + G, 3.59], [0.50, Y.pistonBot],
  ], 'steel', 48), [DX, 0.1265, 0]);
  // 8 — joint de piston delta : élément central bombé et deux bagues d'appui
  P('8', group(
    L([[1.32, 3.875], [1.45, 3.875], [BORE - G, 3.95], [BORE - G, 4.205], [1.45, 4.275], [1.32, 4.275], [1.32, 3.875]], 'blue', 56),
    merged([
      L([[1.42, 3.675], [1.45, 3.675], [BORE - G, 3.715], [BORE - G, 3.87], [1.42, 3.87], [1.42, 3.675]], 'cream', 56),
      L([[1.42, 4.285], [BORE - G, 4.285], [BORE - G, 4.44], [1.45, 4.48], [1.42, 4.48], [1.42, 4.285]], 'cream', 56),
    ], 'cream'),
  ), [DX, 0.0264, 0]);
  // 9 — joint torique tige / piston
  P('9', torus(u(0.49), u(0.03), 'rubber', { pos: [0, u(4.552), 0] }), [DX, 0.2144, 0]);
  // 10 — écrou à freinage nylon 7/8-14 UNF (six-pans 1 5/16) : corps, collerette
  // sertie et bague nylon apparente sous l'écrou. Corps : hexagone extrudé
  // (3.05 à 3.55) percé rond à r PILOT + G, au contact du filet de la queue,
  // chanfreins à 30° des deux faces et fraisure du trou (comme S.nut, dont le
  // trou de 0.29 × surplat, r 0.38, mordrait de 1,5 mm dans le filet).
  const nutBody = () => {
    const af = u(1.3125), h = u(Y.pistonBot - 3.05), b = u(0.06), bt = b * Math.tan(Math.PI / 6);
    const rs = (af / 2 - b) / Math.cos(Math.PI / 6);
    const hex = new THREE.Shape(Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      return new THREE.Vector2(rs * Math.cos(a), rs * Math.sin(a));
    }));
    const bore = new THREE.Path();
    bore.absarc(0, 0, u(PILOT + G) + b, 0, Math.PI * 2, true);
    hex.holes.push(bore);
    const geo = new THREE.ExtrudeGeometry(hex, {
      depth: h - 2 * bt, bevelEnabled: true, bevelSize: b, bevelThickness: bt, bevelSegments: 1, curveSegments: 12,
    });
    geo.translate(0, 0, bt);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, u(3.05), 0);
    return new THREE.Mesh(creaseNormals(geo));
  };
  P('10', group(
    merged([
      nutBody(),
      L([[0.50, Y.nutBot], [0.57, Y.nutBot], [0.63, 2.86], [0.655, 2.96], [0.655, 3.05], [0.50, 3.05], [0.50, Y.nutBot]], 'zinc', 28),
    ], 'zinc'),
    L([[PILOT + G, 2.83], [0.50, 2.83], [0.50, 3.0], [PILOT + G, 3.0], [PILOT + G, 2.83]], 'white', 24),
  ), [DX, -0.0506, 0]);

  return { view: { dir: [-0.55, 0.25, 1] } };
}
