// P334 — Groupe de pompage CX028746 rév. 1 « PUMP DRIVE - 60HP, 575V, 60HZ »
// (page 334, vue éclatée), repère 9 de P208. Moteur électrique 60 HP 575 V
// (4, carcasse en fonte NEMA 364/5TC à ailettes longitudinales, pattes à
// trous oblongs doubles 364 / 365, boîte à bornes sur le dessus à couvercle
// pyramidal, deux anneaux de levage, capot de ventilateur à grille, graisseurs
// sur les flasques) ; clavette 5/8 po carrée × 2 7/8 po (7) dans la rainure du
// bout d'arbre Ø 2 3/8 po ; accouplement à griffes (6 = P336, repris du TVK
// P210) ; lanterne d'accouplement (5) : bride NEMA C (Ø 12,5 po) serrée par
// quatre vis H 5/8-11 × 1 3/4 po (8) à rondelles Grower (9) dans les
// taraudages de la face C, fût à deux fenêtres de visite, face SAE C 4 trous ;
// pompe à pistons axiaux 100 cm³ à gauche (1) et pompe 74 cm³ SAE C (2)
// accouplée derrière elle par sa prise de mouvement, joint torique de centrage
// (3) ; chaque pompe tenue par quatre vis H 1/2-13 × 4 po (10), rondelles
// Grower (11) et plates (12) dans ses oreilles de bride.
// Repère machine (P208 le place à l'identité) : arbre selon X, face C du
// moteur à x = PD.x = 1.10, axe à y = PD.y = 0.78, z = 0 (../_fronta.js) ;
// pompes vers le nez (+X), pattes du moteur à y = 0.551 sur les traverses du
// châssis avant. Orifices des pompes exportés (PUMPS, repère machine) pour les
// adaptateurs d'aspiration et de refoulement (P350, P376, P380) : pompe 1
// aspiration 2 1/2 po code 61 côté −Z, refoulement 1 1/4 po code 62 côté +Z ;
// pompe 2 aspiration 2 po code 61 côté +Z, refoulement 1 po code 61 côté −Z.
// Encombrement ≈ 1.53 (X, de 0.30 à 1.83) × 0.56 (Y) × 0.46 (Z) m.
// Cotes : cadre 364/5TC (hauteur d'axe 9 po, 2E 14 po, 2F 11 1/4 et 12 1/4 po,
// BA 5 7/8 po, AJ 11 po, AK 9 po, BD 12,5 po, U 2 3/8 po, AH 4 1/4 po) ; bride
// SAE C (centrage Ø 5 po, 4 trous sur carré de 4,5 po) ; carcasse et pompes
// d'après les proportions de la vue éclatée (moteur WEG W22, pompes série 45).
// Tout le groupe est sur le châssis avant (corps « front » de la simulation).
import { body } from '../layout.js';
import { portedBlock, orbPlug, capScrew, j518 } from '../../du311/parts/_chassis.js';
import { hhcs, splitWasher, flatWasher, along } from '../../du311/parts/_avance_b.js';
import { IN, PD } from './_fronta.js';

// Orifices des pompes (repère local : origine sur l'axe au plan de la face C, +X vers les pompes).
const PORTS = {
  s1: { pos: [0.435, -0.01, -0.103], dir: [0, 0, -1], dash: 40, code: 61 },
  b1: { pos: [0.435, -0.01, 0.103], dir: [0, 0, 1], dash: 20, code: 62 },
  s2: { pos: [0.69, -0.01, 0.088], dir: [0, 0, 1], dash: 32, code: 61 },
  b2: { pos: [0.69, -0.01, -0.088], dir: [0, 0, -1], dash: 16, code: 61 },
};
/** Orifices des pompes dans le repère machine : centre de la face de bride, normale sortante. */
export const PUMPS = Object.fromEntries(Object.entries(PORTS).map(([k, p]) => [k, { ...p, pos: [PD.x + p.pos[0], PD.y + p.pos[1], PD.z + p.pos[2]] }]));

export default function P334(api) {
  const { THREE, S } = api;
  const D = 9 * IN; // hauteur d'axe
  const rU = (2.375 * IN) / 2; // bout d'arbre
  const kw = 0.625 * IN; // clavette
  const sae = 2.25 * IN; // demi-carré des trous SAE C
  // Pièce du groupe : repère local → machine, corps « front ».
  const P = (ref, obj, e) => { obj.position.add(new THREE.Vector3(PD.x, PD.y, PD.z)); return api.part(ref, body('front', obj), e); };

  // Plaque (plan YZ, épaisseur selon X de x0 à x1), contour arrondi, trous [y, z, r].
  const plateX = (h, w, x0, x1, mat, { r = 0, holes = [] } = {}) => {
    const p = S.plate(h, w, x1 - x0, mat, { r, holes: holes.map(([y, z, rr]) => [-y, z, rr]) });
    p.rotation.z = -Math.PI / 2;
    p.position.x = (x0 + x1) / 2;
    return p;
  };
  // Prisme de section (u, v) → (z = −u, y = v), extrudé selon X de x0 à x1.
  const prism = (shape, x0, x1, curve = 16) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: curve });
    S.creaseNormals(geo);
    const m = new THREE.Mesh(geo);
    m.rotation.y = Math.PI / 2;
    m.position.x = x0;
    return m;
  };
  const circle = (s, r, x = 0, y = 0, hole = false) => { const p = hole ? new THREE.Path() : s; p.absarc(x, y, r, 0, Math.PI * 2, hole); if (hole) s.holes.push(p); return s; };

  // ---------------------------------------------------------------- 4 — moteur électrique 60 HP
  {
    const blue = [], steel = [], cast = [], zinc = [], black = [];
    const RB = 0.186; // fût de la carcasse
    // Flasque avant et face C : Ø 12,5 po, 4 taraudages 5/8-11 sur Ø 11 po (à 45°), centrage AK 9 po.
    const holesC = [0, 1, 2, 3].map((k) => { const a = Math.PI / 4 + (k * Math.PI) / 2; return [Math.cos(a) * 0.1397, Math.sin(a) * 0.1397]; });
    const cface = circle(new THREE.Shape(), 0.1588);
    holesC.forEach(([u, v]) => circle(cface, 0.0083, u, v, true));
    circle(cface, 0.06, 0, 0, true);
    blue.push(prism(cface, -0.026, -0.004));
    blue.push(S.lathe([[0.06, -0.004], [0.1143, -0.004], [0.1143, 0], [0.06, 0]], 'blue', { axis: 'x', seg: 48 }));
    blue.push(S.lathe([[0.06, -0.03], [0.13, -0.03], [0.165, -0.05], [0.195, -0.072], [0.2, -0.085], [0.2, -0.1], [0.06, -0.1]], 'blue', { axis: 'x', seg: 48 }));
    // Nervures de raideur entre la face C et le flasque (8).
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      const rib = S.box(0.06, 0.012, 0.03, 'blue', { r: 0.003 });
      rib.position.set(-0.058, Math.sin(a) * 0.168, Math.cos(a) * 0.168);
      rib.rotation.x = -a + Math.PI / 2;
      blue.push(rib);
    }
    // Chapeau de roulement et bague d'étanchéité (V-ring) autour de l'arbre.
    cast.push(S.lathe([[rU + 0.001, -0.004], [0.05, -0.004], [0.05, 0.004], [0.044, 0.008], [rU + 0.001, 0.008]], 'castIron', { axis: 'x', seg: 32 }));
    black.push(S.lathe([[rU, 0.008], [rU + 0.008, 0.008], [rU + 0.008, 0.016], [rU, 0.016]], 'rubber', { axis: 'x', seg: 28 }));
    // Fût et ailettes longitudinales (sauf entre les pattes et sous la boîte à bornes).
    blue.push(S.cyl(RB, 0.52, 'blue', { axis: 'x', seg: 56, pos: [-0.36, 0, 0] }));
    for (let k = 0; k < 44; k++) {
      const a = (k / 44) * Math.PI * 2;
      const s = Math.sin(a), c = Math.cos(a);
      if (s < -0.55) continue; // dessous : pattes
      const top = s > 0.86;
      const fin = S.box(top ? 0.19 : 0.49, 0.032, 0.006, 'blue', { r: 0.0025 });
      fin.position.set(top ? -0.51 : -0.36, s * (RB + 0.014), c * (RB + 0.014));
      fin.rotation.x = -a + Math.PI / 2;
      blue.push(fin);
    }
    // Flasque arrière et capot de ventilateur en tôle emboutie (grille à vrais trous, nervures).
    blue.push(S.lathe([[0.05, -0.64], [0.172, -0.64], [0.2, -0.628], [0.2, -0.61], [0.18, -0.6], [0.05, -0.6]], 'blue', { axis: 'x', seg: 48 }));
    blue.push(S.at(S.shell(0.206, 0.2, 0.125, 'blue', { axis: 'x', seg: 56 }), [-0.7, 0, 0]));
    blue.push(S.lathe([[0.2, -0.645], [0.212, -0.645], [0.212, -0.637], [0.2, -0.637]], 'blue', { axis: 'x', seg: 56 }));
    const grille = circle(new THREE.Shape(), 0.206);
    for (const [rr, n, hr] of [[0.055, 8, 0.014], [0.095, 14, 0.015], [0.135, 20, 0.015], [0.175, 26, 0.011]]) {
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rr * 3; circle(grille, hr, Math.cos(a) * rr, Math.sin(a) * rr, true); }
    }
    blue.push(prism(grille, -0.768, -0.762, 12));
    blue.push(S.lathe([[0.2, -0.766], [0.207, -0.766], [0.209, -0.758], [0.209, -0.75], [0.2, -0.75]], 'blue', { axis: 'x', seg: 56 }));
    // Vis du capot (4) sur la périphérie.
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; zinc.push(S.at(S.cyl(0.006, 0.006, 'zinc', { seg: 12 }), [-0.67, Math.sin(a) * 0.209, Math.cos(a) * 0.209], [a - Math.PI / 2, 0, 0])); }
    // Ventilateur derrière la grille : moyeu et pales.
    cast.push(S.cyl(0.042, 0.035, 'castIron', { axis: 'x', seg: 24, pos: [-0.735, 0, 0] }));
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const b = S.box(0.035, 0.14, 0.004, 'plastic');
      b.position.set(-0.735, Math.sin(a) * 0.11, Math.cos(a) * 0.11);
      b.rotation.x = -a + Math.PI / 2;
      black.push(b);
    }
    // Pattes coulées : deux longerons et quatre semelles à trous oblongs doubles (2E 14 po).
    const bas = -D;
    for (const sz of [-1, 1]) {
      blue.push(S.box(0.47, 0.07, 0.05, 'blue', { r: 0.008, pos: [-0.35, bas + 0.075, sz * 0.15] }));
      blue.push(S.box(0.47, 0.022, 0.08, 'blue', { r: 0.004, pos: [-0.35, bas + 0.11, sz * 0.13] }));
      for (const xf of [-0.149 - 0.017, -0.149 - 0.2858 - 0.017]) {
        const foot = S.plate(0.075, 0.1, 0.02, 'blue', { r: 0.008, cutouts: [[0, 0.004, 0.034, 0.021]] });
        foot.position.set(xf, bas + 0.01, sz * 0.178);
        blue.push(foot);
        blue.push(S.box(0.07, 0.05, 0.02, 'blue', { r: 0.005, pos: [xf, bas + 0.045, sz * 0.165] }));
      }
    }
    blue.push(S.box(0.44, 0.06, 0.24, 'blue', { r: 0.012, pos: [-0.35, -0.155, 0] }));
    // Borne de masse sur la patte arrière droite.
    zinc.push(S.at(S.nut(0.013, 0.007, 'zinc'), [-0.52, bas + 0.115, 0.172]));
    // Boîte à bornes : embase, caisson, couvercle pyramidal à 4 vis, deux entrées de câble (−Z).
    const tbx = -0.25;
    blue.push(S.box(0.2, 0.05, 0.17, 'blue', { r: 0.01, pos: [tbx, RB + 0.02, 0] }));
    blue.push(S.box(0.235, 0.105, 0.215, 'blue', { r: 0.012, pos: [tbx, RB + 0.095, 0] }));
    const lid = S.lathe([[0, 0], [0.165, 0], [0.165, 0.012], [0.12, 0.04], [0, 0.042]], 'blue', { seg: 4 });
    lid.rotation.y = Math.PI / 4;
    lid.scale.set(1.0, 1, 0.92);
    blue.push(S.at(S.group(lid), [tbx, RB + 0.148, 0]));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) zinc.push(S.bolt(0.006, 0.014, 'zinc', { pos: [tbx + sx * 0.098, RB + 0.161, sz * 0.088] }));
    for (const dx of [-0.05, 0.05]) {
      cast.push(S.lathe([[0.01, 0], [0.024, 0], [0.024, 0.008], [0.019, 0.012], [0.019, 0.03], [0.012, 0.034], [0.01, 0.034]], 'castIron', { axis: '-z', seg: 6, pos: [tbx + dx, RB + 0.085, -0.1075] }));
      black.push(S.cyl(0.011, 0.006, 'rubber', { axis: 'z', seg: 16, pos: [tbx + dx, RB + 0.085, -0.144] }));
    }
    // Anneaux de levage (pitons) sur le dessus, avant et arrière.
    for (const x of [-0.12, -0.56]) {
      steel.push(S.lathe([[0, 0], [0.024, 0], [0.024, 0.008], [0.012, 0.014], [0, 0.014]], 'steel', { seg: 20, pos: [x, RB + 0.03, 0] }));
      steel.push(S.torus(0.026, 0.0075, 'steel', { axis: 'x', pos: [x, RB + 0.07, 0] }));
    }
    // Graisseurs et bouchons de purge de graisse sur les flasques.
    for (const x of [-0.07, -0.62]) {
      zinc.push(S.lathe([[0, 0], [0.006, 0], [0.006, 0.01], [0.004, 0.012], [0.004, 0.018], [0.006, 0.02], [0.003, 0.024], [0, 0.024]], 'brass', { seg: 10, pos: [x, 0.2, 0.03] }));
      zinc.push(S.at(S.nut(0.012, 0.008, 'zinc'), [x, -0.205, 0.04]));
    }
    // Bout d'arbre Ø 2 3/8 po (AH 4 1/4 po), rainure de clavette 5/8 po débouchante vers l'avant.
    steel.push(S.lathe([[0, -0.03], [rU, -0.03], [rU, 0.035], [0, 0.035]], 'steel', { axis: 'x', seg: 36 }));
    const shaftK = new THREE.Shape();
    const ak = Math.asin(kw / 2 / rU);
    shaftK.moveTo(rU * Math.cos(Math.PI / 2 + ak), rU * Math.sin(Math.PI / 2 + ak));
    for (let i = 1; i <= 40; i++) { const a = Math.PI / 2 + ak + ((2 * Math.PI - 2 * ak) * i) / 40; shaftK.lineTo(rU * Math.cos(a), rU * Math.sin(a)); }
    shaftK.lineTo(kw / 2, rU - kw / 2);
    shaftK.lineTo(-kw / 2, rU - kw / 2);
    shaftK.closePath();
    steel.push(prism(shaftK, 0.035, 0.105));
    steel.push(S.lathe([[0, 0.105], [rU - 0.002, 0.105], [rU - 0.002, 0.108], [0, 0.108]], 'steel', { axis: 'x', seg: 36 }));
    // Trou de centre taraudé en bout d'arbre (vrai chambrage).
    steel.push(S.lathe([[0.006, 0.1081], [0.0095, 0.1081], [0.0095, 0.1085], [0.006, 0.1085]], 'steel', { axis: 'x', seg: 16 }));
    P('4', S.group(
      S.merged(blue, 'blue'), S.merged(steel, 'steel'), S.merged(cast, 'castIron'), S.merged(zinc, 'zinc'), S.merged(black, 'rubber'),
      S.at(S.nameplate(0.11, 0.07), [-0.36, 0.06, RB + 0.031], [0, 0, 0]),
    ), [0, 0, 0]);
  }

  // ---------------------------------------------------------------- 7 — clavette 5/8 × 5/8 × 2 7/8 po
  P('7', S.box(2.875 * IN, kw, kw, 'steel', { r: 0.0008, pos: [0.035 + 1.4375 * IN, rU, 0] }), [0, 0.1, 0]);

  // ---------------------------------------------------------------- 6 — accouplement (P336 = P210 du TVK)
  // P210 : origine au plan de l'étoile, moyeu moteur vers −X (dos à x = −0.085).
  P('6', S.at(api.sub('P336'), [0.108, 0, 0]), [0.28, 0, 0]);

  // ---------------------------------------------------------------- 5 — lanterne (fonte d'alu)
  {
    const alu = [];
    // Bride côté moteur : Ø 12,5 po, 4 passages 5/8 et 4 trous d'allègement, centrage.
    const flC = circle(new THREE.Shape(), 0.1588);
    [0, 1, 2, 3].forEach((k) => { const a = Math.PI / 4 + (k * Math.PI) / 2; circle(flC, 0.0087, Math.cos(a) * 0.1397, Math.sin(a) * 0.1397, true); circle(flC, 0.011, Math.cos(a + Math.PI / 4) * 0.138, Math.sin(a + Math.PI / 4) * 0.138, true); });
    circle(flC, 0.104, 0, 0, true);
    alu.push(prism(flC, 0, 0.022));
    alu.push(S.lathe([[0.104, -0.004], [0.1135, -0.004], [0.1135, 0], [0.104, 0]], 'castAlu', { axis: 'x', seg: 48 }));
    // Congé bride / fût, fût à deux fenêtres de visite (±Z), bossages des vis côté pompe.
    alu.push(S.lathe([[0.104, 0.022], [0.14, 0.022], [0.116, 0.042], [0.104, 0.042]], 'castAlu', { axis: 'x', seg: 48 }));
    alu.push(S.slotted(0.116, 0.106, 0.022, 0.152, [{ a: 0, w: 0.7, y0: 0.055, y1: 0.13 }, { a: Math.PI, w: 0.7, y0: 0.055, y1: 0.13 }], 'castAlu', { axis: 'x', seg: 48 }));
    alu.push(plateX(0.205, 0.205, 0.15, 0.2, 'castAlu', { r: 0.04, holes: [[0, 0, 0.0645], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [a * sae, b * sae, 0.0072])] }));
    // Nervures fût / face SAE.
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const rib = S.box(0.03, 0.01, 0.04, 'castAlu', { r: 0.003 });
      rib.position.set(0.135, Math.sin(a) * 0.12, Math.cos(a) * 0.12);
      rib.rotation.x = -a + Math.PI / 2;
      alu.push(rib);
    }
    P('5', S.merged(alu, 'castAlu'), [0.55, 0, 0]);
  }

  // ---------------------------------------------------------------- 8, 9 — vis de la lanterne sur la face C
  {
    const tw = 0.25 * 0.625; // rondelle Grower 5/8 (po)
    [0, 1, 2, 3].forEach((k) => {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      const y = Math.sin(a) * 0.1397, z = Math.cos(a) * 0.1397;
      P('9', along(THREE, splitWasher(S, THREE, 0.625), [1, 0, 0], [0.022, y, z]), [0.4, y * 0.3, z * 0.3]);
      P('8', along(THREE, hhcs(S, THREE, 0.625, 1.75), [1, 0, 0], [0.022 + tw * IN, y, z]), [0.48, y * 0.3, z * 0.3]);
    });
  }

  // ---------------------------------------------------------------- pompes à pistons axiaux
  // Plot d'orifice J518 : bloc à alésage et 4 taraudages, face sortante selon dir (±Z).
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
  // Pompe : bride à oreilles épaisses (x0 → x0 + 0.045), carter, couvercle de distribution, régulateur.
  const pump = (x0, { fl, hw, hz, xb, xe, ey, ez, s, b, cyl, thru }) => {
    const ci = [], st = [], dark = [];
    ci.push(S.lathe([[0.02, x0 - 0.008], [0.0632, x0 - 0.008], [0.0635, x0 - 0.007], [0.0635, x0], [0.02, x0]], 'castIron', { axis: 'x', seg: 40 }));
    ci.push(plateX(fl, fl, x0, x0 + 0.02, 'castIron', { r: 0.022, holes: [[0, 0, 0.022], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, c]) => [a * sae, c * sae, 0.007])] }));
    // Oreilles des vis : bossages percés de x0 + 0.02 à x0 + 0.045.
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) ci.push(S.lathe([[0.0072, x0 + 0.02], [0.016, x0 + 0.02], [0.016, x0 + 0.045], [0.0072, x0 + 0.045]], 'castIron', { axis: 'x', seg: 20, pos: [0, sy * sae, sz * sae] }));
    const L = xb - x0 - 0.02, xc = (x0 + 0.02 + xb) / 2;
    ci.push(S.box(L, hw, hz, 'castIron', { r: 0.03, pos: [xc, 0, 0] }));
    ci.push(S.cyl(cyl, L, 'castIron', { axis: 'x', seg: 40, pos: [xc, 0, 0] }));
    // Nervures de fonderie sur les flancs (±Y).
    for (const sy of [-1, 1]) ci.push(S.box(L * 0.8, 0.012, hz * 0.55, 'castIron', { r: 0.004, pos: [xc, sy * (hw / 2 + 0.004), 0] }));
    ci.push(S.box(xe - xb, ey, ez, 'castIron', { r: 0.008, pos: [(xb + xe) / 2, 0, 0] }));
    ci.push(pad(s, 'castIron'), pad(b, 'castIron'));
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) st.push(S.at(capScrew(api, 0.012, 0.05), [xe, sy * (ey / 2 - 0.016), sz * (ez / 2 - 0.016)], [0, 0, -Math.PI / 2]));
    // Régulateur pression / débit sur le couvercle : deux vis de réglage, contre-écrous, chapeaux.
    const xr = (xb + xe) / 2;
    ci.push(S.box(0.065, 0.05, 0.1, 'castIron', { r: 0.005, pos: [xr, ey / 2 + 0.025, 0] }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) st.push(S.at(capScrew(api, 0.006, 0.02), [xr + sx * 0.024, ey / 2 + 0.05, sz * 0.04]));
    for (const dx of [-0.016, 0.016]) {
      st.push(S.lathe([[0, 0], [0.008, 0], [0.008, 0.012], ...S.thread(0.007, 0.012, 0.028, { pitch: 0.0015, chamferBottom: false }), [0, 0.028]], 'steel', { axis: 'z', seg: 14, pos: [xr + dx, ey / 2 + 0.03, 0.05] }));
      st.push(S.nut(0.017, 0.008, 'steel', { axis: 'z', pos: [xr + dx, ey / 2 + 0.03, 0.058] }));
      dark.push(S.lathe([[0, 0], [0.0105, 0], [0.0105, 0.016], [0.008, 0.02], [0, 0.02]], 'darkSteel', { axis: 'z', seg: 6, pos: [xr + dx, ey / 2 + 0.03, 0.07] }));
    }
    // Bouchons ORB : pilotage (dessus du régulateur), drains du carter (dessus et dessous), prise de pression.
    st.push(S.at(orbPlug(api, 0.016), [xr, ey / 2 + 0.05, -0.03]));
    st.push(S.at(orbPlug(api, 0.024), [xc + 0.02, hw / 2, 0]));
    st.push(S.at(orbPlug(api, 0.024), [xc + 0.02, -hw / 2, 0], [Math.PI, 0, 0]));
    st.push(S.at(orbPlug(api, 0.016), [xe - 0.02, ey / 2, ez / 2 - 0.03]));
    if (thru) {
      // Prise de mouvement arrière : adaptateur SAE C à 4 bossages taraudés.
      ci.push(S.lathe([[0.0, xe], [0.072, xe], [0.072, xe + 0.01], [0.0635, xe + 0.015], [0, xe + 0.015]], 'castIron', { axis: 'x', seg: 40 }));
      for (const sy of [-1, 1]) for (const sz of [-1, 1]) ci.push(S.lathe([[0, xe - 0.04], [0.014, xe - 0.04], [0.014, xe + 0.015], [0, xe + 0.015]], 'castIron', { axis: 'x', seg: 16, pos: [0, sy * sae, sz * sae] }));
    }
    // Arbre cannelé SAE C (14 dents 12/24) dans le moyeu d'accouplement.
    st.push(S.gear(0.0145, 0.0159, 14, 0.05, 'steel', { axis: 'x', pos: [x0 - 0.033, 0, 0] }));
    st.push(S.cyl(0.015, 0.012, 'steel', { axis: 'x', seg: 20, pos: [x0 - 0.002, 0, 0] }));
    return S.group(
      S.merged(ci, 'castIron'), S.merged(st, 'steel'), S.merged(dark, 'darkSteel'),
      S.at(S.nameplate(0.06, 0.035), [xc, 0.0, -hz / 2 - 0.001], [0, Math.PI, 0]),
    );
  };

  // 1 — pompe 100 cm³ (bride à x = 0.2), couvercle de x = 0.395 à 0.475.
  P('1', pump(0.2, { fl: 0.17, hw: 0.18, hz: 0.16, xb: 0.395, xe: 0.475, ey: 0.2, ez: 0.19, s: PORTS.s1, b: PORTS.b1, cyl: 0.098, thru: true }), [0.75, 0, 0]);
  // 3 — joint torique de centrage SAE C entre les deux pompes.
  P('3', S.torus(0.0615, 0.0018, 'rubber', { axis: 'x', pos: [0.4915, 0, 0] }), [0.85, 0, 0]);
  // 2 — pompe 74 cm³ (bride à x = 0.49), couvercle de x = 0.655 à 0.725.
  P('2', pump(0.49, { fl: 0.15, hw: 0.15, hz: 0.14, xb: 0.655, xe: 0.725, ey: 0.17, ez: 0.16, s: PORTS.s2, b: PORTS.b2, cyl: 0.085, thru: false }), [1.0, 0, 0]);

  // ---------------------------------------------------------------- 10, 11, 12 — vis des pompes
  // Rondelle plate 1/2 (0.097 po), Grower 1/2 (0.125 po), tête de vis vers +X.
  const tP = 0.097 * IN, tG = 0.125 * IN;
  for (const [x0, e] of [[0.2 + 0.045, 0.62], [0.49 + 0.045, 0.9]]) {
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const y = sy * sae, z = sz * sae;
      P('12', along(THREE, flatWasher(S, THREE, 0.5, { t: 0.097 }), [1, 0, 0], [x0, y, z]), [e, sy * 0.03, sz * 0.03]);
      P('11', along(THREE, splitWasher(S, THREE, 0.5), [1, 0, 0], [x0 + tP, y, z]), [e + 0.04, sy * 0.03, sz * 0.03]);
      P('10', along(THREE, hhcs(S, THREE, 0.5, 4), [1, 0, 0], [x0 + tP + tG, y, z]), [e + 0.1, sy * 0.03, sz * 0.03]);
    }
  }

  return { view: { dir: [0.75, 0.6, 1.15] } };
}
