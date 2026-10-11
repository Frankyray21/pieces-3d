// P390 — Entraînement du compresseur à pistons : CX036962 rév. 0 « RECIP
// DRIVE - 575V 60HZ 75HP 12" SHV » (page 390), repère 31 de P186 (1872 lb).
// Moteur électrique 75 HP 575 V 60 Hz carcasse NEMA 365T (5) — carcasse
// ventilée à ailettes, boîte à bornes sur le côté +Z, anneau de levage — posé
// sur son socle à glissières (4) par quatre vis H 5/8-11 × 1 1/2 po (8) à
// rondelles (10) ; poulie 12,5 po 4 gorges 5V (1) sur moyeu amovible QD « E »
// alésé 2 3/8 po (2), trois vis H 1/2-13 × 2 3/4 po (7) à rondelles (9) ;
// clavette 5/8 po carrée × 3 1/2 po (6) ; courroie à bande 4 × 5VP de 112 po
// (3) vers la poulie du compresseur (P274, non dessinée ici).
// Cotes NEMA 365T : hauteur d'axe 9 po, bout d'arbre Ø 2 3/8 × 5 7/8 po,
// entraxes des pattes 12 1/4 po (le long de l'arbre) × 14 1/2 po.
// Repère : origine au centre de la face inférieure du socle (appui sur le
// châssis), X selon l'arbre (+X vers la poulie), Y vers le haut, +Z côté
// boîte à bornes. Axe de l'arbre à y = 0.279. La courroie monte de la poulie
// vers -Z (poulie du compresseur supposée Ø 24 po, entraxe 0.70 m calculé
// d'après la longueur de 112 po ; direction estimée, à recaler sur P186).
// Encombrement ≈ 0.88 (X) × 0.95 (Y) × 1.0 (Z) m (courroie comprise).
import { IN } from './_chassis.js';

export default function P390(api) {
  const { S, THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const HB = 2 * IN; // hauteur du socle
  const YA = HB + 9 * IN; // axe de l'arbre
  const XD = 0.2; // face du flasque côté entraînement
  const RF = 0.215; // rayon de la carcasse (hors ailettes)

  // ---------------------------------------------------------------- 4 — socle
  {
    const L = 0.5, W = 0.52, t = 0.25 * IN;
    // Dessus percé de quatre lumières (réglage de tension), bords tombés sur les quatre côtés.
    const top = S.plate(L, W, t, 'grey', { cutouts: [[-0.155, -0.184, 0.12, 0.022], [0.155, -0.184, 0.12, 0.022], [-0.155, 0.184, 0.12, 0.022], [0.155, 0.184, 0.12, 0.022]] });
    top.position.y = HB - t / 2;
    const sides = [
      S.box(L, HB - t, t, 'grey', { pos: [0, (HB - t) / 2, W / 2 - t / 2] }),
      S.box(L, HB - t, t, 'grey', { pos: [0, (HB - t) / 2, -W / 2 + t / 2] }),
      S.box(t, HB - t, W - 2 * t, 'grey', { pos: [L / 2 - t / 2, (HB - t) / 2, 0] }),
      S.box(t, HB - t, W - 2 * t, 'grey', { pos: [-L / 2 + t / 2, (HB - t) / 2, 0] }),
    ];
    // Vis de poussée de réglage aux deux bouts (côté -X), écrous soudés.
    const steel = [];
    for (const z of [-0.184, 0.184]) {
      steel.push(S.box(0.025, 0.025, 0.025, 'grey', { pos: [-L / 2 + 0.03, HB + 0.0125, z] }));
      steel.push(S.bolt(0.5 * IN, 3 * IN, 'zinc', { axis: 'x', pos: [-L / 2 + 0.005, HB + 0.0125, z] }));
    }
    P('4', S.group(S.merged([top, ...sides, steel[0], steel[2]], 'grey'), S.merged([steel[1], steel[3]], 'zinc')), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 5 — moteur
  {
    const blue = []; // peinture du moteur (bleu ardoise) — carcasse, flasques, pattes
    // Carcasse à ailettes longitudinales : tube + 28 ailettes.
    blue.push(S.cyl(RF, 0.36, 'blue', { axis: 'x', seg: 48, pos: [-0.01, YA, 0] }));
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      if (Math.sin(a) < -0.75) continue; // dégagement des pattes
      const fin = S.box(0.34, 0.03, 0.006, 'blue', { pos: [-0.01, YA + Math.sin(a) * (RF + 0.012), Math.cos(a) * (RF + 0.012)] });
      fin.rotation.x = -a + Math.PI / 2;
      blue.push(fin);
    }
    // Flasques avant / arrière (bombés), pattes, boîte à bornes, anneau de levage.
    blue.push(S.cyl(RF + 0.02, 0.03, 'blue', { axis: 'x', seg: 48, pos: [XD - 0.015, YA, 0] }));
    blue.push(S.cyl(RF * 0.55, 0.03, 'blue', { axis: 'x', seg: 36, r2: RF * 0.45, pos: [XD + 0.0, YA, 0] }));
    blue.push(S.cyl(RF + 0.02, 0.03, 'blue', { axis: 'x', seg: 48, pos: [-0.205, YA, 0] }));
    for (const x of [-0.155, 0.155]) for (const z of [-0.184, 0.184]) {
      blue.push(S.box(0.07, 0.03, 0.06, 'blue', { r: 0.004, pos: [x, HB + 0.015, z] }));
      blue.push(S.box(0.06, YA - HB - 0.12, 0.03, 'blue', { pos: [x, HB + (YA - HB - 0.12) / 2 + 0.02, z * 0.75] }));
    }
    blue.push(S.box(0.16, 0.2, 0.12, 'blue', { r: 0.01, pos: [0.04, YA + 0.07, RF + 0.07] }));
    blue.push(S.box(0.18, 0.22, 0.012, 'blue', { r: 0.006, pos: [0.04, YA + 0.07, RF + 0.136] }));
    const eye = S.torus(0.028, 0.008, 'darkSteel', { axis: 'z', pos: [0.02, YA + RF + 0.05, 0] });
    // Capot de ventilateur tôle, grille d'aspiration à rayons.
    const fan = [
      S.shell(RF + 0.01, RF + 0.006, 0.15, 'blue', { axis: 'x', seg: 48, pos: [-0.295, YA, 0] }),
    ];
    const grille = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      grille.push(S.rod([-0.37, YA + Math.sin(a) * 0.04, Math.cos(a) * 0.04], [-0.37, YA + Math.sin(a) * RF, Math.cos(a) * RF], 0.004, 'blue', 6));
    }
    for (const r of [0.08, 0.13, 0.18]) grille.push(S.torus(r, 0.004, 'blue', { axis: 'x', pos: [-0.37, YA, 0] }));
    grille.push(S.cyl(0.04, 0.006, 'blue', { axis: 'x', pos: [-0.37, YA, 0] }));
    // Arbre Ø 2 3/8 po, rainure de clavette, chanfrein.
    const shaft = S.lathe([[0, 0], [1.1875 * IN, 0], [1.1875 * IN, 5.875 * IN - 0.003], [1.1875 * IN - 0.003, 5.875 * IN], [0, 5.875 * IN]], 'steel', { axis: 'x', seg: 32, pos: [XD, YA, 0] });
    // Plaque signalétique sur la boîte à bornes.
    const plate = S.nameplate(0.1, 0.06);
    plate.position.set(0.04, YA + 0.07, RF + 0.1425);
    P('5', S.group(S.merged([...blue, ...fan, ...grille], 'blue'), eye, shaft, plate), [0, 0.12, 0]);
  }
  // 8, 10 — vis des pattes et rondelles.
  for (const x of [-0.155, 0.155]) for (const z of [-0.184, 0.184]) {
    P('10', S.at(S.washer(0.66 * IN, 0.34 * IN, 0.12 * IN, 'zinc'), [x, HB + 0.03 + 0.0015, z]), [0, 0.06, Math.sign(z) * 0.2]);
    P('8', S.bolt(0.625 * IN, 1.5 * IN, 'zinc', { pos: [x, HB + 0.03 + 0.003, z] }), [0, 0.12, Math.sign(z) * 0.2]);
  }

  // ---------------------------------------------------------------- poulie, moyeu, clavette
  const X0 = XD + 0.025; // face intérieure de la poulie
  const GW = 0.6875 * IN, NG = 4, WS = NG * GW + 0.75 * IN; // largeur de jante
  const RO = 6.25 * IN, RP = 6.05 * IN;
  // 6 — clavette 5/8 po carrée × 3 1/2 po.
  P('6', S.box(3.5 * IN, 0.625 * IN, 0.625 * IN, 'steel', { r: 0.0008, pos: [X0 + 1.75 * IN, YA + 1.1875 * IN, 0] }), [0.12, 0.1, 0]);
  // 1 — poulie fonte 4 gorges 5V : jante profilée, voile à lumières, alésage conique du moyeu.
  {
    const prof = [[1.5 * IN, 0], [RO - 0.004, 0], [RO, 0.004]];
    for (let g = 0; g < NG; g++) {
      const c = 0.375 * IN + GW * (g + 0.5);
      prof.push([RO, c - GW * 0.45], [RO - 0.6 * IN, c - GW * 0.15], [RO - 0.6 * IN, c + GW * 0.15], [RO, c + GW * 0.45]);
    }
    prof.push([RO, WS - 0.004], [RO - 0.004, WS], [RO - 0.9 * IN, WS], [RO - 0.9 * IN, WS * 0.62], [3.4 * IN, WS * 0.62], [3.4 * IN, WS], [1.5 * IN, WS], [1.5 * IN, 0]);
    const sheave = S.lathe(prof, 'castIron', { axis: 'x', seg: 64, pos: [X0, YA, 0] });
    P('1', sheave, [0.24, 0, 0]);
  }
  // 2 — moyeu QD « E » : collerette Ø 6 po côté extérieur, fût conique dans la poulie.
  {
    const bush = S.group(
      S.lathe([[1.1875 * IN, -0.6 * IN], [3.0 * IN, -0.6 * IN], [3.0 * IN, 0], [2.4 * IN, 0], [2.1 * IN, WS - 0.3 * IN], [1.1875 * IN, WS - 0.3 * IN]], 'darkSteel', { axis: 'x', seg: 40 }),
    );
    bush.position.set(X0 + WS + 0.6 * IN, YA, 0);
    bush.rotation.y = Math.PI; // collerette vers +X
    P('2', bush, [0.36, 0, 0]);
  }
  // 7, 9 — trois vis 1/2 × 2 3/4 po et rondelles sur Ø 5 po, depuis la collerette.
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const y = YA + Math.sin(a) * 2.5 * IN, z = Math.cos(a) * 2.5 * IN;
    const xf = X0 + WS + 0.6 * IN;
    P('9', S.at(S.washer(0.53 * IN, 0.27 * IN, 0.1 * IN, 'zinc', { axis: 'x' }), [xf + 0.00127, y, z]), [0.46, 0, 0]);
    P('7', S.bolt(0.5 * IN, 2.75 * IN, 'zinc', { axis: 'x', pos: [xf + 0.0026, y, z] }), [0.54, 0, 0]);
  }
  // 3 — courroie à bande 4 × 5VP, 112 po : boucle autour de la poulie (rayon
  // primitif 6.05 po) et de la poulie du compresseur (Ø 24 po supposé).
  {
    const R2 = 12 * IN;
    const c1 = new THREE.Vector2(0, YA), c2 = new THREE.Vector2(-0.6, YA + 0.36);
    const d = c2.clone().sub(c1), C = d.length(), u = d.clone().normalize();
    const n = new THREE.Vector2(-u.y, u.x);
    const beta = Math.asin((R2 - RP) / C);
    // Points tangents et arcs (dans le plan Z-Y, coordonnée « x » du Vector2 = Z).
    const pts = [];
    const arc = (c, r, a0, a1, k) => { for (let i = 0; i <= k; i++) { const a = a0 + ((a1 - a0) * i) / k; pts.push(new THREE.Vector3(0, c.y + r * Math.sin(a), c.x + r * Math.cos(a))); } };
    // Brin tendu côté +n (point de contact à φ + β), brin mou côté -n.
    const phi = Math.atan2(n.y, n.x);
    arc(c1, RP, phi + beta, phi + Math.PI - beta, 40);
    arc(c2, R2, phi + Math.PI - beta, phi + 2 * Math.PI + beta, 60);
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    const w = NG * GW, th = 0.55 * IN;
    const shape = new THREE.Shape([new THREE.Vector2(-th * 0.15, -w / 2), new THREE.Vector2(th * 0.85, -w / 2), new THREE.Vector2(th * 0.85, w / 2), new THREE.Vector2(-th * 0.15, w / 2)]);
    const geo = new THREE.ExtrudeGeometry(shape, { steps: 220, extrudePath: curve, bevelEnabled: false });
    const belt = S.merged([new THREE.Mesh(geo)], 'rubber');
    belt.position.x = X0 + 0.375 * IN + w / 2;
    P('3', belt, [0.66, 0.2, -0.2]);
  }
  return { view: { dir: [1, 0.55, 0.9] } };
}
