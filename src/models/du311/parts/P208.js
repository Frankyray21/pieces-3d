// P208 — Groupe de pompage hydraulique CX026332 rév. 0 « PUMP DRIVE - 60HP,
// 575V, 60HZ » (page 208), repère 9 de P186. Moteur électrique 60 HP à pattes,
// carcasse NEMA 365TC (4) à ailettes, boîte à bornes sur le dessus, anneau de
// levage, capot de ventilateur ; clavette 5/8 po carrée × 2 1/2 po (7) dans la
// rainure du bout d'arbre Ø 2 3/8 po ; accouplement à griffes (6 = P210) ;
// lanterne d'accouplement (5) : bride NEMA C (Ø 12,5 po, 4 trous sur Ø 11 po),
// fût à deux fenêtres de visite, bride SAE C 4 trous côté pompe ; pompe à
// pistons axiaux 100 cm³ à gauche (1), bride SAE C, régulateur sur le dessus,
// prise de mouvement arrière ; joint torique de centrage (3) ; pompe 74 cm³
// (2) accouplée derrière la première.
// Orifices (brides 4 vis SAE J518, exportés dans PUMPS pour P212 et P272) :
// pompe 1 aspiration 2 1/2 po code 61 côté -Z, refoulement 1 1/4 po code 62
// côté +Z ; pompe 2 aspiration 2 po code 61 côté +Z, refoulement 1 po code 61
// côté -Z (refoulements opposés comme sur la page 272).
// Repère : origine sur l'axe de l'arbre, au plan de la face C du moteur
// (appui de la lanterne) ; +X le long de l'arbre vers les pompes, Y vers le
// haut, dessous des pattes du moteur à y = -0.2286 (hauteur d'axe D = 9 po du
// cadre 365) ; +Z côté refoulement de la pompe 1. Encombrement ≈ 1.53 (X, de
// -0.80 à 0.73) × 0.53 (Y) × 0.46 (Z) m.
// Cotes : cadre 365TC (hauteur d'axe 9 po, AJ 11 po, AK 9 po, BD 12,5 po,
// 2E 14 po, 2F 12,25 po, arbre U 2 3/8 po, AH 4 1/4 po) ; bride SAE C (centrage
// Ø 5 po, 4 trous sur carré de 4,5 po) ; pompes et lanterne estimées d'après
// les proportions de la vue éclatée (pompe 1 ≈ 0.28 m de long).
// Dans P186 (repère machine de frame.js) : groupe posé sur le pont (pattes à
// y = DECK), arbre parallèle à X, pompes vers l'arrière (rotation de π autour
// de Y), face C vers x ≈ -1.0, z ≈ -0.32 (emplacement du repère 9).
import { IN, portedBlock, orbPlug, capScrew, j518 } from './_chassis.js';

// Orifices des pompes (repère P208) : centre de la face de bride, normale sortante.
export const PUMPS = {
  s1: { pos: [0.435, -0.01, -0.103], dir: [0, 0, -1], dash: 40, code: 61 },
  b1: { pos: [0.435, -0.01, 0.103], dir: [0, 0, 1], dash: 20, code: 62 },
  s2: { pos: [0.69, -0.01, 0.088], dir: [0, 0, 1], dash: 32, code: 61 },
  b2: { pos: [0.69, -0.01, -0.088], dir: [0, 0, -1], dash: 16, code: 61 },
  feet: -0.2286,
};

export default function P208(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const D = 9 * IN; // hauteur d'axe
  const rU = (2.375 * IN) / 2;

  // Plaque (plan YZ, épaisseur selon X de x0 à x1), contour arrondi, trous [y, z, r].
  const plateX = (h, w, x0, x1, mat, { r = 0, holes = [] } = {}) => {
    const p = S.plate(h, w, x1 - x0, mat, { r, holes: holes.map(([y, z, rr]) => [-y, z, rr]) });
    p.rotation.z = -Math.PI / 2;
    p.position.x = (x0 + x1) / 2;
    return p;
  };
  // Prisme (plan YZ) de x0 à x1 : Shape (u, v) → (z = -u, y = v).
  const prism = (shape, x0, x1) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 16 });
    S.creaseNormals(geo);
    const m = new THREE.Mesh(geo);
    m.rotation.y = Math.PI / 2;
    m.position.x = x0;
    return m;
  };
  // Plot d'orifice J518 : bloc à alésage et 4 taraudages, face sortante selon dir (±Z), long axe selon Y.
  const pad = (port, mat) => {
    const f = j518(port.dash, port.code);
    const w = f.W + f.d * 2.6, h = f.L + f.d * 2.6, t = 0.016;
    const holes = [[0, 0, f.rb * 0.92, 0.014]];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) holes.push([sx * f.W / 2, sy * f.L / 2, f.d * 0.42, 0.012]);
    const b = portedBlock(api, w, h, t, mat, holes, { spot: 0 });
    const [x, y, z] = port.pos;
    b.position.set(x, y, z - port.dir[2] * t / 2);
    if (port.dir[2] < 0) b.rotation.y = Math.PI;
    return b;
  };

  // ---------------------------------------------------------------- 4 — moteur électrique
  const blue = [], steel = [], cast = [];
  // Flasque avant et bride C (Ø 12,5 po, 4 taraudages 5/8-11 sur Ø 11 po, centrage Ø 9 po).
  const holesC = [0, 1, 2, 3].map((k) => {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    return [Math.cos(a) * 0.1397, Math.sin(a) * 0.1397, 0.0083];
  });
  const cface = new THREE.Shape();
  cface.absarc(0, 0, 0.1588, 0, Math.PI * 2, false);
  holesC.forEach(([u, v, r]) => { const p = new THREE.Path(); p.absarc(u, v, r, 0, Math.PI * 2, true); cface.holes.push(p); });
  const ce = new THREE.Path(); ce.absarc(0, 0, 0.055, 0, Math.PI * 2, true); cface.holes.push(ce);
  blue.push(prism(cface, -0.024, 0));
  blue.push(S.lathe([[0.055, -0.03], [0.13, -0.03], [0.17, -0.055], [0.198, -0.075], [0.198, -0.09], [0.055, -0.09], [0.055, -0.03]], 'blue', { axis: 'x', seg: 48 }));
  // Moyeu de roulement, joint à lèvre autour de l'arbre.
  cast.push(S.lathe([[rU + 0.002, -0.03], [0.055, -0.03], [0.055, -0.006], [0.05, -0.004], [rU + 0.002, -0.004], [rU + 0.002, -0.03]], 'castIron', { axis: 'x', seg: 32 }));
  // Corps : fût Ø 0.38 et 34 ailettes longitudinales (sauf sous le moteur, entre les pattes).
  blue.push(S.cyl(0.19, 0.53, 'blue', { axis: 'x', seg: 48, pos: [-0.355, 0, 0] }));
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    if (Math.abs(Math.sin(a) + 1) < 0.25) continue; // dessous : pattes
    const fin = S.box(0.5, 0.03, 0.005, 'blue', { r: 0.0015 });
    fin.position.set(-0.35, Math.sin(a) * 0.2, Math.cos(a) * 0.2);
    fin.rotation.x = -a + Math.PI / 2;
    blue.push(fin);
  }
  // Flasque arrière, capot de ventilateur à grille (vrais trous).
  blue.push(S.lathe([[0, -0.66], [0.17, -0.66], [0.198, -0.64], [0.198, -0.62], [0.17, -0.615], [0, -0.615]], 'blue', { axis: 'x', seg: 48 }));
  blue.push(S.at(S.shell(0.205, 0.199, 0.13, 'blue', { axis: 'x', seg: 48 }), [-0.73, 0, 0]));
  const grille = new THREE.Shape();
  grille.absarc(0, 0, 0.205, 0, Math.PI * 2, false);
  for (const [rr, n, hr] of [[0.06, 8, 0.016], [0.105, 14, 0.017], [0.152, 20, 0.017], [0.185, 26, 0.009]]) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr;
      const p = new THREE.Path(); p.absarc(Math.cos(a) * rr, Math.sin(a) * rr, hr, 0, Math.PI * 2, true); grille.holes.push(p);
    }
  }
  blue.push(prism(grille, -0.8, -0.794));
  // Ventilateur derrière la grille.
  cast.push(S.cyl(0.04, 0.03, 'castIron', { axis: 'x', seg: 20, pos: [-0.77, 0, 0] }));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const b = S.box(0.03, 0.14, 0.004, 'plastic');
    b.position.set(-0.77, Math.sin(a) * 0.1, Math.cos(a) * 0.1);
    b.rotation.x = -a + Math.PI / 2;
    cast.push(b);
  }
  // Pattes : semelle et pieds à trous oblongs (2E 14 po, 2F 12,25 po).
  for (const xf of [-0.16, -0.471]) {
    for (const sz of [-1, 1]) {
      blue.push(S.box(0.09, 0.07, 0.07, 'blue', { r: 0.006, pos: [xf, -D + 0.035 + 0.018, sz * 0.165] }));
      const foot = S.plate(0.11, 0.09, 0.018, 'blue', { r: 0.008, holes: [[0, 0.004, 0.0105]] });
      foot.position.set(xf, -D + 0.009, sz * 0.178);
      blue.push(foot);
    }
  }
  blue.push(S.box(0.4, 0.05, 0.3, 'blue', { r: 0.01, pos: [-0.315, -0.165, 0] }));
  // Boîte à bornes sur le dessus (couvercle à 4 vis, entrée de conduit côté -Z).
  blue.push(S.box(0.2, 0.06, 0.18, 'blue', { r: 0.008, pos: [-0.22, 0.215, 0] }));
  blue.push(S.box(0.23, 0.07, 0.22, 'blue', { r: 0.012, pos: [-0.22, 0.28, 0] }));
  blue.push(S.box(0.235, 0.012, 0.225, 'blue', { r: 0.005, pos: [-0.22, 0.321, 0] }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) steel.push(S.bolt(0.006, 0.012, 'zinc', { pos: [-0.22 + sx * 0.1, 0.33, sz * 0.095] }));
  cast.push(S.lathe([[0, 0], [0.024, 0], [0.024, 0.02], [0.02, 0.026], [0.016, 0.026], [0.016, 0.04], [0, 0.04]], 'castIron', { axis: '-z', seg: 20, pos: [-0.22, 0.275, -0.11] }));
  // Anneau de levage (piton) sur le dessus, à l'arrière.
  steel.push(S.lathe([[0, 0], [0.022, 0], [0.022, 0.008], [0.012, 0.012], [0, 0.012]], 'steel', { seg: 20, pos: [-0.5, 0.2, 0] }));
  const eye = S.torus(0.025, 0.007, 'steel', { axis: 'x' });
  eye.position.set(-0.5, 0.245, 0);
  steel.push(eye);
  // Bout d'arbre Ø 2 3/8 po, rainure de clavette fermée 5/8 × 5/16 po.
  steel.push(S.lathe([[0, -0.03], [rU, -0.03], [rU, 0.035], [0, 0.035]], 'steel', { axis: 'x', seg: 32 }));
  const kw = 0.625 * IN;
  const shaftK = new THREE.Shape();
  const ak = Math.asin(kw / 2 / rU);
  shaftK.moveTo(rU * Math.cos(Math.PI / 2 + ak), rU * Math.sin(Math.PI / 2 + ak));
  for (let i = 1; i <= 40; i++) {
    const a = Math.PI / 2 + ak + ((2 * Math.PI - 2 * ak) * i) / 40;
    shaftK.lineTo(rU * Math.cos(a), rU * Math.sin(a));
  }
  shaftK.lineTo(kw / 2, rU - kw / 2);
  shaftK.lineTo(-kw / 2, rU - kw / 2);
  shaftK.closePath();
  steel.push(prism(shaftK, 0.035, 0.1));
  steel.push(S.lathe([[0, 0.1], [rU, 0.1], [rU, 0.106], [rU - 0.002, 0.108], [0, 0.108]], 'steel', { axis: 'x', seg: 32 }));
  P('4', S.group(
    S.merged(blue, 'blue'), S.merged(steel, 'steel'), S.merged(cast, 'castIron'),
    S.at(S.nameplate(0.1, 0.06), [-0.35, 0.02, -0.226], [0, Math.PI, 0]),
  ), [0, 0, 0]);

  // ---------------------------------------------------------------- 7 — clavette 5/8 × 5/8 × 2 1/2 po
  P('7', S.box(0.0635, kw, kw, 'steel', { r: 0.0008, pos: [0.0675, rU, 0] }), [0, 0.09, 0]);

  // ---------------------------------------------------------------- 6 — accouplement (P210)
  // P210 : origine au plan de l'étoile, moyeu moteur vers -X (dos à x = -0.085).
  P('6', S.at(api.sub('P210'), [0.108, 0, 0]), [0.25, 0, 0]);

  // ---------------------------------------------------------------- 5 — lanterne
  const alu = [];
  const flC = new THREE.Shape();
  flC.absarc(0, 0, 0.1588, 0, Math.PI * 2, false);
  holesC.forEach(([u, v]) => { const p = new THREE.Path(); p.absarc(u, v, 0.0087, 0, Math.PI * 2, true); flC.holes.push(p); });
  const ci = new THREE.Path(); ci.absarc(0, 0, 0.104, 0, Math.PI * 2, true); flC.holes.push(ci);
  alu.push(prism(flC, 0, 0.022));
  // Congé bride / fût, fût à deux fenêtres de visite (±Z).
  alu.push(S.lathe([[0.104, 0.022], [0.135, 0.022], [0.112, 0.04], [0.104, 0.04], [0.104, 0.022]], 'castAlu', { axis: 'x', seg: 48 }));
  alu.push(S.slotted(0.112, 0.104, 0.022, 0.186, [
    { a: 0, w: 0.62, y0: 0.06, y1: 0.15 }, { a: Math.PI, w: 0.62, y0: 0.06, y1: 0.15 },
  ], 'castAlu', { axis: 'x', seg: 48 }));
  // Bride SAE C côté pompe : carré arrondi, centrage Ø 5 po, 4 taraudages sur carré de 4,5 po.
  const sae = 0.0573;
  alu.push(plateX(0.2, 0.2, 0.184, 0.2, 'castAlu', {
    r: 0.035, holes: [[0, 0, 0.0640], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [a * sae, b * sae, 0.0079])],
  }));
  P('5', S.merged(alu, 'castAlu'), [0.5, 0, 0]);

  // ---------------------------------------------------------------- pompes à pistons axiaux
  // Pompe : bride de fixation (x0), carter, couvercle de distribution à orifices, régulateur.
  const pump = (x0, { fl, hw, hz, xb, xe, ey, ez, s, b, cyl, thru }) => {
    const ci2 = [], st = [], dark = [];
    // Centrage et bride carrée 4 trous.
    ci2.push(S.lathe([[0.02, x0 - 0.008], [0.0632, x0 - 0.008], [0.0635, x0 - 0.007], [0.0635, x0], [0.02, x0]], 'castIron', { axis: 'x', seg: 40 }));
    ci2.push(plateX(fl, fl, x0, x0 + 0.022, 'castIron', {
      r: 0.02, holes: [[0, 0, 0.022], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, c]) => [a * sae, c * sae, 0.0095])],
    }));
    // Carter : bloc à pans arrondis + fût cylindrique, nervure de raccord.
    const L = xb - x0 - 0.022, xc = (x0 + 0.022 + xb) / 2;
    ci2.push(S.box(L, hw, hz, 'castIron', { r: 0.03, pos: [xc, 0, 0] }));
    ci2.push(S.cyl(cyl, L, 'castIron', { axis: 'x', seg: 40, pos: [xc, 0, 0] }));
    ci2.push(S.lathe([[0.03, x0 + 0.022], [cyl * 0.85, x0 + 0.022], [cyl * 0.8, x0 + 0.04], [0.03, x0 + 0.04]], 'castIron', { axis: 'x', seg: 32 }));
    // Couvercle de distribution (orifices S / B sur ±Z) et ses plots J518.
    ci2.push(S.box(xe - xb, ey, ez, 'castIron', { r: 0.008, pos: [(xb + xe) / 2, 0, 0] }));
    ci2.push(pad(s, 'castIron'), pad(b, 'castIron'));
    // Vis CHC d'assemblage carter / couvercle (4, face arrière visible aux coins).
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      st.push(S.at(capScrew(api, 0.012, 0.05), [xe, sy * (ey / 2 - 0.016), sz * (ez / 2 - 0.016)], [0, 0, -Math.PI / 2]));
    }
    // Régulateur (pression / débit) sur le couvercle, deux vis de réglage à contre-écrou et chapeau selon +Z.
    const xr = (xb + xe) / 2;
    ci2.push(S.box(0.065, 0.05, 0.1, 'castIron', { r: 0.005, pos: [xr, ey / 2 + 0.025, 0.0] }));
    for (const dx of [-0.016, 0.016]) {
      st.push(S.lathe([[0, 0], [0.008, 0], [0.008, 0.012], ...S.thread(0.007, 0.012, 0.028, { pitch: 0.0015, chamferBottom: false }), [0, 0.028]], 'steel', { axis: 'z', seg: 14, pos: [xr + dx, ey / 2 + 0.03, 0.05] }));
      st.push(S.nut(0.017, 0.008, 'steel', { axis: 'z', pos: [xr + dx, ey / 2 + 0.03, 0.058] }));
      dark.push(S.lathe([[0, 0], [0.0105, 0], [0.0105, 0.016], [0.008, 0.02], [0, 0.02]], 'darkSteel', { axis: 'z', seg: 6, pos: [xr + dx, ey / 2 + 0.03, 0.07] }));
    }
    // Bouchons ORB : pilotage du régulateur (dessus), drains du carter (dessus et dessous).
    st.push(S.at(orbPlug(api, 0.016), [xr, ey / 2 + 0.05, -0.03]));
    st.push(S.at(orbPlug(api, 0.024), [xc + 0.02, hw / 2, 0]));
    st.push(S.at(orbPlug(api, 0.024), [xc + 0.02, -hw / 2, 0], [Math.PI, 0, 0]));
    if (thru) {
      // Prise de mouvement arrière : adaptateur SAE C, goujons et écrous de la pompe 2.
      ci2.push(S.lathe([[0.0, xe], [0.072, xe], [0.072, xe + 0.012], [0.0635, xe + 0.015], [0, xe + 0.015]], 'castIron', { axis: 'x', seg: 40 }));
      for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        st.push(S.stud(0.0159, 0.028, 'zinc', { axis: 'x', pos: [xe + 0.037, sy * sae, sz * sae], washer: true }));
        st.push(S.cyl(0.008, 0.03, 'zinc', { axis: 'x', seg: 12, pos: [xe + 0.02, sy * sae, sz * sae] }));
      }
    }
    // Arbre cannelé SAE C (14 dents 12/24) dans le moyeu d'accouplement.
    st.push(S.gear(0.0145, 0.0159, 14, 0.05, 'steel', { axis: 'x', pos: [x0 - 0.033, 0, 0] }));
    st.push(S.cyl(0.015, 0.012, 'steel', { axis: 'x', seg: 20, pos: [x0 - 0.002, 0, 0] }));
    return S.group(
      S.merged(ci2, 'castIron'), S.merged(st, 'steel'), S.merged(dark, 'darkSteel'),
      S.at(S.nameplate(0.06, 0.035), [xc, 0.0, -hz / 2 - 0.001], [0, Math.PI, 0]),
    );
  };

  // 1 — pompe 100 cm³ (bride à x = 0.2), couvercle de x = 0.395 à 0.475.
  P('1', pump(0.2, { fl: 0.17, hw: 0.18, hz: 0.16, xb: 0.395, xe: 0.475, ey: 0.2, ez: 0.19, s: PUMPS.s1, b: PUMPS.b1, cyl: 0.098, thru: true }), [0.72, 0, 0]);
  // 3 — joint torique de centrage SAE C entre les deux pompes.
  P('3', S.torus(0.0615, 0.0018, 'rubber', { axis: 'x', pos: [0.4915, 0, 0] }), [0.82, 0, 0]);
  // 2 — pompe 74 cm³ (bride à x = 0.49), couvercle de x = 0.655 à 0.725.
  P('2', pump(0.49, { fl: 0.15, hw: 0.15, hz: 0.14, xb: 0.655, xe: 0.725, ey: 0.17, ez: 0.16, s: PUMPS.s2, b: PUMPS.b2, cyl: 0.085, thru: false }), [0.95, 0, 0]);

  return { view: { dir: [0.75, 0.6, 1.15] } };
}
