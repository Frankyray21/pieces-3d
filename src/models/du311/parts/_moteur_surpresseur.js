// Cotes et fonctions communes du groupe « moteur-surpresseur » du DU311-TVK :
// moteur diesel Deutz D914L04 (P242 et ses sous-assemblages) et surpresseur
// Le Roi (P274, compresseur P280 / P282, bloc P288 et ses pièces internes).
// Fichier partagé (préfixe « _ ») : pas un assemblage, jamais inscrit dans
// parts/index.js.

export const IN = 0.0254;
export const MM = 0.001;
export const DEG = Math.PI / 180;

// ---------------------------------------------------------------- moteur Deutz D914L04
// Diesel quatre cylindres en ligne refroidi par air (page 260) : carter-cylindres
// et carter d'huile, cylindres à ailettes et culasses individuelles, carter de
// volant SAE à l'arrière, soufflante de refroidissement (turbine d'axe parallèle
// au vilebrequin) à l'avant, capot d'air le long des cylindres côté injection.
// Encombrement d'après les données Deutz (≈ 0,80 × 0,78 × 0,60 m).
//
// REPÈRE MOTEUR (P260 et tout ce qui se pose sur le moteur : P256, P262, P264,
// P266, P268) : origine sur l'axe du vilebrequin, dans le plan de la face
// arrière du carter de volant (face SAE où se boulonne la plaque
// d'entraînement de pompe P260 rep. 5) ; +X vers l'avant (soufflante) ;
// Y vers le haut ; +Z = X × Y, à droite en regardant vers l'avant : côté
// injection, filtres et capot d'air ; −Z côté échappement et démarreur.
export const ENG = {
  pitch: 0.125, // entraxe des cylindres
  cylX: [0.175, 0.3, 0.425, 0.55], // axes des cylindres 1 à 4 (1 côté volant)
  bore: 0.102,
  deckY: 0.17, // haut du carter-cylindres (pied des cylindres)
  headY: 0.33, // plan de joint cylindre / culasse
  coverY: 0.43, // plan de joint culasse / couvre-culbuteurs
  topY: 0.48, // dessus des couvre-culbuteurs
  panY: -0.3, // dessous du carter d'huile
  bellX: 0.11, // fin du carter de volant (début du carter-cylindres)
  blockX: [0.11, 0.62],
  blowerX: [0.62, 0.78], // carter de soufflante
  blowerC: [0.17, 0.05], // axe de la soufflante (y, z)
  blowerR: 0.2,
  pulleyX: 0.8, // plan des courroies (poulie de vilebrequin)
  sae: { boreR: 0.205, boltR: 0.2143, outR: 0.238, n: 12 }, // carter de volant SAE 3
  flywheelX: 0.04, // face du volant, en retrait de la face SAE (SAE 11,5 po)
  // Pattes du moteur (dessous à footY) : deux sur le carter de volant, deux à
  // l'avant sous la soufflante — appuis des supports P256 rep. 17 / 18.
  footY: -0.26,
  feet: [[0.055, -0.25], [0.055, 0.25], [0.6, -0.21], [0.6, 0.21]], // [x, z]
  exhaust: { y: 0.37, z: -0.235, outX: 0.08 }, // collecteur : axe, sortie arrière
  intake: { y: 0.44, z: 0.17 }, // tubulure d'admission (raccord P268 à l'avant)
  // Filtres déportés (P262, P264) sur la cornière P256 rep. 8 posée en travers
  // sur le carter de volant : aile verticale dans le plan x = flangeX (face
  // −X), filtres suspendus derrière elle ; consoles de filtres du moteur
  // (P260 : huile à x = 0.47, gazole à x = 0.345, sous y = −0.106, z = 0.215).
  filters: { flangeX: 0.023, oilZ: 0.27, fuelZ: 0.4, headTopY: 0.19, axisX: -0.045 },
};

// ---------------------------------------------------------------- compresseur Le Roi CP48001
// Compresseur surpresseur trois cylindres en W (vue de bout de la page 282 :
// cylindre central vertical, deux cylindres latéraux à ±60°), un seul maneton
// portant les trois bielles côte à côte. Échelle tirée de la poulie 5VP
// quatre gorges (Ø ext. estimé 16 po = 0,406 m) des vues de la page 282.
//
// REPÈRE COMMUN de tous les sous-assemblages du bloc (P288 et ses enfants
// P290, P294, P296, P298, P300, P302, P304) :
//   origine sur l'axe du vilebrequin, dans le plan de l'axe du cylindre
//   central ; +X le long du vilebrequin vers la poulie (bout d'entraînement) ;
//   Y vers le haut ; +Z = X × Y (horizontal). Pattes du carter à y = LR.footY.
// Les pièces d'un cylindre (P290 culasse, P300 cylindre, P304 bielle et
// piston) sont dessinées dans un REPÈRE DE CYLINDRE : même origine (axe du
// vilebrequin, au droit du cylindre), Y le long de l'axe du cylindre vers la
// culasse, X le long du vilebrequin. P288 les place par
//   at(api.sub('P300'), [LR.cyl[i].x, 0, 0], [LR.cyl[i].a, 0, 0])
// (rotation autour de X : l'axe +Y du cylindre devient (0, cos a, sin a)).
// Cotes reprises des vues des pages 282 et 288 (Ø des ailettes = 0,14 m pour
// l'échelle) : cylindre de 0,12 m de la face d'appui au plan de joint, carter
// de 0,25 m de long, pattes à 0,165 m sous l'axe, culasse coiffée de deux
// bouchons de clapets alignés le long du vilebrequin (aspiration côté −X,
// refoulement côté +X).
export const LR = {
  bore: 3.5 * IN, // alésage (estimé, ailettes Ø 0,14 m)
  stroke: 3 * IN, // course (estimée)
  crankR: 1.5 * IN, // rayon de manivelle
  rod: 0.19, // entraxe de bielle (dessus du piston au PMH à 2 mm du plan de joint)
  pinToCrown: 0.045, // axe de piston → dessus du piston
  // Le long de l'axe d'un cylindre, depuis l'axe du vilebrequin :
  deck: 0.155, // face d'appui du cylindre sur le carter (dessus du plan de joint du carter)
  headFace: 0.275, // plan de joint cylindre / culasse
  headTop: 0.36, // dessus des bouchons de clapets
  finR: 0.07, // rayon extérieur des ailettes du cylindre
  flange: 0.07, // demi-côté de la bride carrée du pied de cylindre
  flangeBolt: 0.056, // vis du pied de cylindre à (±, ±) flangeBolt
  headBoltR: 0.064, // vis de culasse : quatre à 45° sur ce rayon
  valveX: 0.032, // clapets : aspiration à −valveX, refoulement à +valveX
  // Trois cylindres : angle autour de X (rad) et position le long du vilebrequin.
  cyl: [
    { a: -60 * DEG, x: -0.03 },
    { a: 0, x: 0 },
    { a: 60 * DEG, x: 0.03 },
  ],
  // Maneton : un seul, trois têtes de bielle côte à côte (largeur 28 mm chacune).
  pinR: 0.0225,
  pinX: [-0.047, 0.047],
  // Angle du maneton, vu de +X, mesuré depuis +Y vers +Z (même sens que cyl.a) :
  // 0 = point mort haut du cylindre central. Pour le cylindre i, l'angle du
  // maneton par rapport à son axe vaut crank - cyl[i].a (option { crank } de
  // P304 et de P298).
  crank: 0,
  // Carter (P296) : faces d'extrémité, demi-largeur du bas, pattes.
  rearX: -0.14, // face arrière (palier et pompe à huile P302)
  frontX: 0.11, // face avant (côté poulie : boîtier de joint P296 rep. 27)
  halfW: 0.125, // demi-largeur du bas du carter (sous les portées latérales)
  bottomY: -0.158, // dessous du fond du carter
  footY: -0.165, // dessous des pattes
  footHalfW: 0.165, // bord extérieur des pattes
  feetX: [-0.112, 0.082], // axes des trous des quatre pattes (z = ±0.145)
  feetZ: 0.145,
  rearOpenR: 0.1, // ouverture arrière (centrage du flasque P302)
  // Flasque arrière P302 rep. 17 : rayon, cercle de 11 vis, faces.
  retR: 0.125,
  retBoltR: 0.112,
  retFaceX: -0.158, // face extérieure du plateau du flasque
  hubX: -0.176, // face du moyeu (pompe à huile ; couvercle P294)
  // Paliers à rouleaux coniques (cuvettes P296 rep. 3 et P302 rep. 1).
  bearingX: [-0.128, 0.093],
  // Poulie 5VP quatre gorges (P298 rep. 8) : axe à x = sheaveX, Ø ext. 16 po.
  sheaveX: 0.215,
  sheaveR: 8 * IN,
  sheaveW: 0.078,
};

// Point de l'axe d'un cylindre i à la distance d de l'axe du vilebrequin,
// dans le repère du bloc.
export function lrCylPoint(i, d) {
  const c = LR.cyl[i];
  return [c.x, d * Math.cos(c.a), d * Math.sin(c.a)];
}

// Embiellage dans le repère de cylindre pour un angle de maneton phi (rad,
// depuis +Y vers +Z, 0 = PMH) : centre du maneton (cY, cZ), hauteur de l'axe
// de piston pinY, et angle beta de la bielle autour de X (+Y local de la
// bielle, de la tête vers le pied, = (0, cos beta, sin beta)).
export function lrRod(phi) {
  const cY = LR.crankR * Math.cos(phi), cZ = LR.crankR * Math.sin(phi);
  const pinY = cY + Math.sqrt(LR.rod * LR.rod - cZ * cZ);
  return { cY, cZ, pinY, beta: Math.atan2(-cZ, pinY - cY) };
}

// Contour d'un disque (n points, sens trigonométrique) centré en (cx, cy),
// pour extrude() / plate().
export function lrCircle(r, n = 32, cx = 0, cy = 0) {
  return Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

// ================================================================ accessoires (P246 à P316)
// Section de la session « accessoires du moteur et du surpresseur » : visserie
// UNC, rondelles, raccords hydrauliques JIC 37° / NPT / ORB et tuyauterie NPT
// (mamelons, coudes, tés, croix, manchons, réductions, brides), partagés par
// P246, P248, P250, P252, P254, P278, P308, P310, P312 et P314.
// Tout est regroupé dans l'objet ACC (pas d'autre nom exporté, pour ne pas
// heurter les autres sections) ; chaque fonction reçoit S (= api.S) et rend
// un objet dans un repère local décrit dans son commentaire. Tailles par
// numéro de tiret (seizièmes de pouce : -06 = 3/8, -32 = 2 po, -48 = 3 po).
export const ACC = (() => {
  const I = (v) => v * IN;
  // JIC 37° : [filetage, six-pans du corps, six-pans de l'écrou tournant] (po).
  const JIC = {
    4: [7 / 16, 9 / 16, 9 / 16], 6: [9 / 16, 5 / 8, 11 / 16], 8: [3 / 4, 13 / 16, 7 / 8],
    10: [7 / 8, 15 / 16, 1], 12: [17 / 16, 1.125, 1.25], 16: [21 / 16, 1.375, 1.5],
    20: [13 / 8, 1.625, 1.875], 24: [15 / 8, 1.875, 2.125], 32: [2.5, 2.5, 2.75],
  };
  // NPT : diamètre extérieur du tube et longueur de filet utile (po).
  const NPT = {
    2: [0.405, 0.26], 4: [0.54, 0.4], 6: [0.675, 0.41], 8: [0.84, 0.53], 12: [1.05, 0.55],
    16: [1.315, 0.68], 20: [1.66, 0.71], 24: [1.9, 0.72], 32: [2.375, 0.76], 48: [3.5, 1.2],
  };
  // Écrous hexagonaux UNC : [surplat, hauteur] (po) par diamètre (po).
  const NUT = {
    0.25: [7 / 16, 7 / 32], 0.3125: [1 / 2, 17 / 64], 0.375: [9 / 16, 21 / 64], 0.4375: [11 / 16, 3 / 8],
    0.5: [3 / 4, 7 / 16], 0.5625: [7 / 8, 31 / 64], 0.625: [15 / 16, 35 / 64], 0.75: [9 / 8, 41 / 64],
  };
  const jic = (n) => JIC[n] || JIC[6];
  const npt = (n) => NPT[n] || NPT[8];
  const g = (S, ...o) => S.group(...o);

  // Prisme hexagonal chanfreiné (surplat af, de y0 à y1), en profil de lathe à 6 facettes.
  const hexProf = (af, y0, y1) => {
    const R = af / 2 / Math.cos(Math.PI / 6), c = Math.min(R * 0.12, (y1 - y0) * 0.25);
    return [[0, y0], [R - c, y0], [R, y0 + c * 0.6], [R, y1 - c * 0.6], [R - c, y1], [0, y1]];
  };
  const hex = (S, af, y0, y1, mat) => S.lathe(hexProf(af, y0, y1), mat, { seg: 6 });

  // Filet mâle NPT conique de y = 0 (épaulement) à y = -L (bout), axe -Y, rayon en mètres.
  const nptProf = (S, n, L = I(npt(n)[1])) => {
    const r = I(npt(n)[0]) / 2, r0 = r - L / 32; // conicité 1/16 au diamètre
    return [[0, -L * 0.85], [r * 0.6, -L * 0.85], [r * 0.6, -L], ...S.thread(r0, -L, 0, { r1: r, pitch: I(n >= 24 ? 1 / 11.5 : n >= 12 ? 1 / 14 : 1 / 18), maxTurns: 6 })];
  };
  // Embout mâle JIC 37° le long de +Y depuis y0 : col, filet, cône, alésage.
  const jicProf = (n, y0) => {
    const T = I(jic(n)[0]), r = T / 2, L = T * 0.85;
    return [
      [r * 0.82, y0], [r * 0.82, y0 + L * 0.15], [r, y0 + L * 0.2], [r * 0.96, y0 + L * 0.3], [r, y0 + L * 0.4],
      [r * 0.96, y0 + L * 0.5], [r, y0 + L * 0.6], [r * 0.95, y0 + L * 0.68], [r * 0.95, y0 + L * 0.74],
      [r * 0.6, y0 + L], [r * 0.42, y0 + L], [r * 0.42, y0 + L * 0.8], [0, y0 + L * 0.8],
    ];
  };
  const jicLen = (n) => I(jic(n)[0]) * 0.85;
  // Embout mâle ORB (filetage droit SAE, joint torique sous l'épaulement), axe -Y.
  const orbParts = (S, n, mat) => {
    const T = I(jic(n)[0]), r = T / 2, L = T * 0.7;
    return [
      S.lathe([[r * 0.5, -L], [r * 0.9, -L], ...S.thread(r, -L + r * 0.1, -T * 0.12, { pitch: T * 0.12, maxTurns: 5 }), [r * 0.8, -T * 0.12], [r * 0.8, 0], [0, 0]], mat, { seg: 12 }),
      S.at(S.torus(r * 0.92, T * 0.06, 'rubber'), [0, -T * 0.09, 0]),
    ];
  };
  // Écrou tournant femelle JIC (SFJIC) : six-pans d'écrou de y0 à y0 + h, ouverture vers -Y.
  const swivelProf = (n, y0) => {
    const T = I(jic(n)[0]), h = T * 0.75, R = I(jic(n)[2]) / 2 / Math.cos(Math.PI / 6);
    const c = R * 0.1;
    return { prof: [[T * 0.5, y0], [R - c, y0], [R, y0 + c * 0.6], [R, y0 + h - c * 0.6], [R - c, y0 + h], [T * 0.3, y0 + h]], h };
  };

  // Matière d'un objet rendu en un seul maillage.
  const one = (S, list, mat) => S.merged(list, mat);
  // Conduit court entre l'axe d'un corps de raccord et un embout (raccords coudés, tés).
  const leg = (S, r, y0, y1, mat) => S.lathe([[0, y0], [r, y0], [r, y1], [0, y1]], mat, { seg: 14 });
  // Oriente un groupe construit selon +Y vers +X / -X / +Z / -Z / -Y.
  const turn = (S, o, axis) => {
    const r = { x: [0, 0, -Math.PI / 2], '-x': [0, 0, Math.PI / 2], z: [Math.PI / 2, 0, 0], '-z': [-Math.PI / 2, 0, 0], '-y': [Math.PI, 0, 0], y: null }[axis];
    return r ? S.at(S.group(o), [0, 0, 0], r) : o;
  };

  return {
    JIC, NPT, NUT, I,
    // Diamètre extérieur (m) d'un tube NPT.
    pipeOD: (n) => I(npt(n)[0]),
    jicLen,

    // ------------------------------------------------------------ visserie
    // Vis H UNC d (po) × len (po), tête à l'origine, tige vers -Y.
    hhcs: (S, d, len, mat = 'zinc') => S.bolt(I(d), I(len), mat),
    // Écrou hexagonal UNC, face d'appui à y = 0, écrou vers +Y.
    hexNut: (S, d, mat = 'zinc') => {
      const [af, h] = NUT[d] || [d * 1.5, d * 0.875];
      return S.nut(I(af), I(h), mat, { pos: [0, I(h) / 2, 0] });
    },
    // Écrou à freinage nylon (bague bleue au sommet), face d'appui à y = 0.
    lockNut: (S, d, mat = 'zinc') => {
      const [af, h] = NUT[d] || [d * 1.5, d * 0.875];
      return g(S, S.nut(I(af), I(h), mat, { pos: [0, I(h) / 2, 0] }),
        S.lathe([[I(d) * 0.5, I(h)], [I(af) * 0.47, I(h)], [I(af) * 0.45, I(h) * 1.3], [I(d) * 0.55, I(h) * 1.35]], mat, { seg: 16 }),
        S.ring(I(d) * 0.52, I(d) * 0.44, I(h) * 0.12, 'blue', { pos: [0, I(h) * 1.27, 0], seg: 16 }));
    },
    // Rondelle plate SAE (OD ≈ 2,1 d), face inférieure à y = 0.
    flatWasher: (S, d, mat = 'zinc') => {
      const t = I(d >= 0.5 ? 0.095 : d >= 0.375 ? 0.065 : 0.05);
      return S.washer(I(d) * 1.06, I(d) * 0.54, t, mat, { pos: [0, t / 2, 0] });
    },
    // Rondelle frein fendue (Grower) : anneau coupé, extrémités décalées.
    splitWasher: (S, d, mat = 'zinc') => {
      const ro = I(d) * 0.88, ri = I(d) * 0.53, t = I(d) * 0.24;
      return S.slotted(ro, ri, 0, t, [{ a: 0.4, w: 0.12, y0: -1, y1: 1 }], mat, { seg: 20 });
    },
    // Rondelle Nord-Lock (paire collée, cames radiales en surface), face inférieure à y = 0.
    nordLock: (S, d) => {
      const ro = I(d) * 0.95, ri = I(d) * 0.53, t = I(d) * 0.12;
      const cams = [];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        cams.push(S.box(ro - ri, t * 0.18, I(d) * 0.08, 'zinc', { pos: [Math.cos(a) * (ro + ri) / 2, t * 2.04, Math.sin(a) * (ro + ri) / 2], rot: [0, -a, 0] }));
      }
      return g(S, one(S, [S.ring(ro, ri, t * 0.96, 'zinc', { pos: [0, t / 2, 0], seg: 24 }), S.ring(ro, ri, t * 0.96, 'zinc', { pos: [0, t * 1.5, 0], seg: 24 }), ...cams], 'zinc'));
    },

    // ------------------------------------------------------------ raccords JIC / NPT / ORB
    // Adaptateur droit : mâle A (NPT, ORB ou JIC) vers -Y depuis y = 0 (face de
    // l'orifice), six-pans, mâle JIC B vers +Y. Bout du cône B en userData.tip.
    straight: (S, { a, b = a, aType = 'npt', mat = 'zinc' }) => {
      const hf = Math.max(I(jic(b)[1]), aType === 'npt' ? I(npt(a)[0]) * 1.05 : I(jic(a)[1]));
      const hh = hf * 0.42;
      const parts = [hex(S, hf, 0, hh, mat), S.lathe(jicProf(b, hh), mat, { seg: 14 })];
      if (aType === 'npt') parts.push(S.lathe(nptProf(S, a), mat, { seg: 14 }));
      else if (aType === 'orb') parts.push(orbParts(S, a, mat)[0]);
      else parts.push(S.lathe(jicProf(a, 0).map(([r, y]) => [r, -y]).reverse(), mat, { seg: 14 }));
      const o = g(S, one(S, parts, mat));
      if (aType === 'orb') o.add(S.at(S.torus(I(jic(a)[0]) * 0.46, I(jic(a)[0]) * 0.06, 'rubber'), [0, -I(jic(a)[0]) * 0.09, 0]));
      o.userData.tip = hh + jicLen(b);
      return o;
    },
    // Adaptateur coudé (90° ou 45°) : mâle A vers -Y depuis la face de
    // l'orifice (y = 0), corps forgé, mâle JIC B dans le plan XY vers +X
    // (90°) ou à 45° vers +X+Y. userData.out = [x, y] du bout du cône B,
    // userData.dir = direction de B.
    elbow: (S, { a, b = a, aType = 'npt', angle = 90, female = false, mat = 'zinc' }) => {
      const Tb = I(jic(b)[0]), ra = aType === 'npt' ? I(npt(a)[0]) / 2 : I(jic(a)[0]) / 2;
      const rb = Math.max(ra, Tb * 0.55) * 1.02;
      const h = rb * 1.6 + (female ? I(npt(a)[1]) * 0.6 : 0); // axe de la branche B
      const L = rb * 1.7; // de l'axe vertical à l'embout B
      const parts = [];
      if (female) {
        // Femelle NPT : corps six-pans taraudé.
        parts.push(hex(S, ra * 2.7, 0, h + rb, mat));
        parts.push(S.ring(ra * 1.0, ra * 0.8, 0.0012, 'blackOxide', { pos: [0, -0.0005, 0], seg: 16 }));
      } else {
        parts.push(hex(S, Math.max(ra * 2.15, I(jic(b)[1])), 0, rb * 0.75, mat));
        parts.push(leg(S, rb, rb * 0.7, h + rb * 0.95, mat));
      }
      if (aType === 'npt' && !female) parts.push(S.lathe(nptProf(S, a), mat, { seg: 14 }));
      else if (aType === 'orb') parts.push(orbParts(S, a, mat)[0]);
      // Branche B.
      const ang = angle === 45 ? Math.PI / 4 : Math.PI / 2;
      const br = S.group(leg(S, rb, 0, L, mat), S.lathe(jicProf(b, L), mat, { seg: 14 }));
      br.rotation.z = -ang;
      br.position.y = h;
      parts.push(br);
      // Rotule du coude.
      parts.push(S.at(S.lathe([[0, -rb], [rb * 0.7, -rb * 0.75], [rb, 0], [rb * 0.7, rb * 0.75], [0, rb]], mat, { seg: 14 }), [0, h, 0]));
      const o = g(S, one(S, parts, mat));
      if (aType === 'orb') o.add(S.at(S.torus(I(jic(a)[0]) * 0.46, I(jic(a)[0]) * 0.06, 'rubber'), [0, -I(jic(a)[0]) * 0.09, 0]));
      const Lt = L + jicLen(b);
      o.userData.out = [Math.sin(ang) * Lt, h + Math.cos(ang) * Lt];
      o.userData.dir = [Math.sin(ang), Math.cos(ang)];
      return o;
    },
    // Té tournant SFJIC-MJIC/MJIC (FA01011) ou té de branche (FA01007) : écrou
    // tournant femelle à l'origine, ouverture vers -Y (son siège s'appuie sur
    // le cône du raccord mâle qui le reçoit, à y = 0) ; corps, passage mâle
    // JIC vers +Y, branche mâle JIC vers +X. userData.run, userData.branch :
    // bouts des cônes [x, y].
    swivelTee: (S, n, { mat = 'zinc', elbow = false } = {}) => {
      const T = I(jic(n)[0]), { prof, h } = swivelProf(n, -T * 0.35);
      const rb = T * 0.52, yc = h + T * 0.15;
      const parts = [
        S.lathe(prof, mat, { seg: 6 }),
        leg(S, T * 0.32, h - T * 0.4, yc, mat),
        S.at(S.box(rb * 2.1, rb * 2.1, rb * 2.1, mat, { r: rb * 0.3 }), [0, yc, 0]),
      ];
      const L = rb * 1.25;
      if (!elbow) parts.push(leg(S, rb * 0.8, yc, yc + L, mat), S.lathe(jicProf(n, yc + L), mat, { seg: 14 }));
      const br = S.group(leg(S, rb * 0.8, 0, L, mat), S.lathe(jicProf(n, L), mat, { seg: 14 }));
      br.rotation.z = -Math.PI / 2;
      br.position.y = yc;
      parts.push(br);
      const o = g(S, one(S, parts, mat));
      o.userData.run = [0, yc + L + jicLen(n)];
      o.userData.branch = [L + jicLen(n), yc];
      return o;
    },
    // Adaptateur droit tournant : écrou femelle JIC (SFJIC) à l'origine,
    // ouverture vers -Y ; mâle NPT (ou femelle NPT) vers +Y. userData.tip :
    // bout du filet (ou face du corps femelle).
    swivelStraight: (S, { a, b = a, femaleNpt = false, mat = 'zinc' }) => {
      const T = I(jic(a)[0]), { prof, h } = swivelProf(a, -T * 0.35);
      const parts = [S.lathe(prof, mat, { seg: 6 })];
      const hf = Math.max(I(npt(b)[0]) * 1.05, I(jic(a)[1]));
      let tip;
      if (femaleNpt) {
        const ro = I(npt(b)[0]) * 0.68, Lb = I(npt(b)[1]) * 1.05;
        tip = h + Lb + T * 0.3;
        parts.push(hex(S, ro * 2.2, h - T * 0.1, tip, mat));
        parts.push(S.ring(I(npt(b)[0]) * 0.5, I(npt(b)[0]) * 0.4, 0.0012, 'blackOxide', { pos: [0, tip + 0.0005, 0], seg: 16 }));
      } else {
        parts.push(hex(S, hf, h - T * 0.1, h + hf * 0.4, mat));
        const Lb = I(npt(b)[1]);
        parts.push(S.at(S.lathe(nptProf(S, b, Lb), mat, { seg: 14 }), [0, h + hf * 0.4 + Lb, 0], [Math.PI, 0, 0]));
        tip = h + hf * 0.4 + Lb;
      }
      const o = g(S, one(S, parts, mat));
      o.userData.tip = tip;
      return o;
    },
    // Écrou borgne JIC (FA01003) : bouchon d'un embout mâle, ouverture vers -Y, siège à y = 0.
    capNut: (S, n, mat = 'zinc') => {
      const T = I(jic(n)[0]), af = I(jic(n)[2]), y1 = T * 0.55;
      return one(S, [S.lathe(hexProf(af, -T * 0.4, y1), mat, { seg: 6 }),
        S.lathe([[0, y1], [af * 0.42, y1], [af * 0.3, y1 + T * 0.15], [0, y1 + T * 0.19]], mat, { seg: 14 })], mat);
    },
    // Traversée de cloison MNPT-MJIC (FA01035) : corps à six-pans à y = 0 (face
    // d'appui sur la tôle, côté +Y), filet de traversée vers -Y de longueur
    // through (m) avec écrou de blocage, mâle NPT au bout ; mâle JIC vers +Y.
    bulkhead: (S, { a, b = a, through = 0.006, mat = 'zinc' }) => {
      const T = I(jic(b)[0]), r = T * 0.62, af = I(jic(b)[2]) * 1.1;
      const parts = [
        hex(S, af, 0, af * 0.4, mat),
        S.lathe(jicProf(b, af * 0.4), mat, { seg: 14 }),
        S.lathe([[r * 0.6, -through - T * 0.7], [r, -through - T * 0.7], ...S.thread(r, -through - T * 0.7, 0, { pitch: T * 0.1, maxTurns: 6 }).slice(1), [0, 0]], mat, { seg: 14 }),
        S.at(S.nut(af, af * 0.35, mat), [0, -through - af * 0.175, 0]),
        S.at(S.lathe(nptProf(S, a), mat, { seg: 14 }), [0, -through - T * 0.7, 0]),
      ];
      return one(S, parts, mat);
    },

    // ------------------------------------------------------------ tuyauterie NPT
    // Mamelon NPT de longueur len (m), de y = 0 à y = len, filets aux deux bouts.
    nipple: (S, n, len, mat = 'darkSteel', { sch = 40 } = {}) => {
      const r = I(npt(n)[0]) / 2, Lt = Math.min(I(npt(n)[1]), len / 2), ri = r * (sch >= 80 ? 0.78 : 0.86);
      const th = (y0, y1, up) => S.thread(r * 0.985, y0, y1, { pitch: I(n >= 24 ? 1 / 11.5 : 1 / 14), maxTurns: 7, chamferBottom: true, r1: r }).map(([x, y]) => (up ? [x, y] : [x, y0 + y1 - y]));
      const prof = [[ri, 0], ...th(0, Lt, true), [r, len - Lt], ...th(len - Lt, len, false).reverse(), [ri, len]];
      return S.lathe([...prof, [ri, 0]], mat, { seg: n >= 24 ? 28 : 18 });
    },
    // Coude femelle 90° / 45° (fonte malléable ou acier forgé) : centre à
    // l'origine, entrée vers -Y, sortie vers +X (90°) ou à 45° vers +X-Y…
    // userData.a = distance centre → face (m), userData.end = [x, y] de la face
    // de sortie, userData.dir = direction de sortie.
    pipeElbow: (S, n, { angle = 90, mat = 'darkSteel', forged = false } = {}) => {
      const r = I(npt(n)[0]) / 2, R = r * (forged ? 1.42 : 1.28);
      const A = angle === 45 ? r * 1.55 + I(0.15) : r * 1.85 + I(0.12);
      const ang = (angle * Math.PI) / 180;
      // Bras : de la face (bourrelet) vers le centre.
      const arm = () => S.lathe([[r * 0.98, 0], [R * 1.06, 0], [R * 1.06, A * 0.16], [R, A * 0.24], [R, A], [0, A]], mat, { seg: 24 });
      const a1 = S.at(arm(), [0, 0, 0], [Math.PI, 0, 0]); // vers -Y
      const a2 = S.group(arm());
      a2.rotation.z = Math.PI - ang; // 90° : vers +X
      const bead = S.at(S.lathe([[0, -R], [R * 0.72, -R * 0.72], [R, 0], [R * 0.72, R * 0.72], [0, R]], mat, { seg: 24 }), [0, 0, 0]);
      const o = g(S, one(S, [a1, a2, bead], mat));
      const dir = [Math.sin(ang), -Math.cos(ang)];
      o.userData.a = A;
      o.userData.dir = dir;
      o.userData.end = [dir[0] * A, dir[1] * A];
      return o;
    },
    // Té (branches : -Y, +Y, +X) ou croix (+ -X) femelle : centre à l'origine.
    pipeTee: (S, n, { cross = false, mat = 'darkSteel' } = {}) => {
      const r = I(npt(n)[0]) / 2, R = r * 1.28, A = r * 1.85 + I(0.12);
      const arm = (rot) => S.at(S.lathe([[r * 0.98, 0], [R * 1.06, 0], [R * 1.06, A * 0.16], [R, A * 0.24], [R, A], [0, A]], mat, { seg: 24 }), [0, 0, 0], rot);
      const list = [arm(null), arm([Math.PI, 0, 0]), arm([0, 0, -Math.PI / 2]), S.ball ? S.ball(R * 1.02, mat) : null];
      if (cross) list.push(arm([0, 0, Math.PI / 2]));
      const o = g(S, one(S, list.filter(Boolean), mat));
      o.userData.a = A;
      return o;
    },
    // Manchon (coupling) NPT forgé : de y = 0 à y = L.
    coupling: (S, n, mat = 'darkSteel') => {
      const r = I(npt(n)[0]) / 2, R = r * 1.28, L = I(npt(n)[1]) * 2 + I(0.25);
      const c = R * 0.08;
      return S.lathe([[r * 0.98, 0], [R - c, 0], [R, c], [R, L - c], [R - c, L], [r * 0.98, L], [r * 0.98, 0]], mat, { seg: 28 });
    },
    // Réduction hexagonale (hex bushing) mâle n / femelle m : face du six-pans à
    // y = 0, filet mâle vers -Y, ouverture femelle vers +Y.
    hexBushing: (S, n, m, mat = 'darkSteel') => {
      const r = I(npt(n)[0]) / 2, af = r * 2.15, hh = Math.max(I(0.25), r * 0.45);
      const ri = I(npt(m)[0]) / 2;
      return one(S, [
        S.lathe(hexProf(af, 0, hh), mat, { seg: 6 }),
        S.lathe(nptProf(S, n), mat, { seg: 24 }),
        S.ring(ri * 1.02, ri * 0.9, 0.0012, 'blackOxide', { pos: [0, hh + 0.0005, 0] }),
      ], mat);
    },
    // Bride à visser 150 lb à face surélevée (ASME B16.5) : face de joint à
    // y = 0 (portée surélevée vers +Y), moyeu vers -Y. n = taille (48 = 3 po).
    flange150: (S, n = 48, mat = 'darkSteel') => {
      const D = { 48: [7.5, 0.94, 5.0, 4.25, 1.19, 6.0, 4, 0.75], 32: [6.0, 0.75, 3.62, 3.06, 1.0, 4.75, 4, 0.75], 24: [5.0, 0.69, 2.88, 2.5, 0.88, 3.88, 4, 0.625] }[n] || [7.5, 0.94, 5.0, 4.25, 1.19, 6.0, 4, 0.75];
      const [od, t, rf, hub, Y, bc, nb, bh] = D.map((v, i) => (i === 6 ? v : I(v)));
      const r = I(npt(n)[0]) / 2;
      const shape = [];
      const e = I(0.0625); // portée surélevée de 1/16 po : dessus à y = 0
      const prof = [[r * 0.98, -Y], [hub / 2, -Y], [hub / 2 + e, -Y + e], [hub / 2 * 1.05, -t - e - I(0.1)], [od / 2 - e, -t - e], [od / 2, -t],
        [od / 2, -e - I(0.05)], [od / 2 - I(0.05), -e], [rf / 2, -e], [rf / 2, 0], [r * 1.06, 0], [r * 0.98, -I(0.02)]];
      const body = S.lathe([...prof, [r * 0.98, -Y]], mat, { seg: 40 });
      shape.push(body);
      // Trous de boulons : manchons sombres (alésages) dans l'épaisseur.
      for (let k = 0; k < nb; k++) {
        const a = Math.PI / nb + (k * 2 * Math.PI) / nb;
        shape.push(S.at(S.cyl(bh / 2 + I(0.03), t * 1.01, 'blackOxide', { seg: 12 }), [Math.cos(a) * bc / 2, -t / 2 - e, Math.sin(a) * bc / 2]));
      }
      const o = g(S, body, ...shape.slice(1));
      o.userData = { od, t: t + e, bc, nb, bh, a0: Math.PI / nb };
      return o;
    },
    turn,
  };
})();

// Prisme couché : contour [[x, z], …] percé de contours [[[x, z], …], …],
// extrudé selon +Y de y0 à y1, normales lissées sur les arrondis (fonte,
// brides, plaques). Renvoie un maillage du matériau donné.
export function lrPrism(api, outline, holes, y0, y1, material) {
  const { THREE, S } = api;
  const v = (pts) => pts.map(([x, z]) => new THREE.Vector2(x, -z));
  const shape = new THREE.Shape(v(outline));
  holes.forEach((h) => shape.holes.push(new THREE.Path(v(h))));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 12 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return S.merged([new THREE.Mesh(S.creaseNormals(geo))], material);
}

// Rectangle à coins arrondis (rayon r, n points par coin) centré en (cx, cz).
export function lrRoundRect(w, d, r, n = 4, cx = 0, cz = 0) {
  const out = [];
  const c = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 1], [-w / 2 + r, -d / 2 + r, 2], [w / 2 - r, -d / 2 + r, 3]];
  for (const [x, z, q] of c) {
    for (let k = 0; k <= n; k++) {
      const a = ((q + k / n) * Math.PI) / 2;
      out.push([cx + x + r * Math.cos(a), cz + z + r * Math.sin(a)]);
    }
  }
  return out;
}
