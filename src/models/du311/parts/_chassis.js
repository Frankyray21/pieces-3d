// Fonctions partagées des équipements du châssis DU311-TVK (P186) : blocs
// usinés à orifices, bouchons et raccords hydrauliques (ORB, JIC 37°), vis,
// et distributeurs proportionnels sectionnels PVG 32 (P190, P192, P194, P196,
// P216). Préfixe « _ » : fichier non inscrit comme assemblage.
//
// Distributeur PVG 32 (repère commun de P190, P192, P194, P196, P216) :
// origine au centre de la face inférieure de la plaque d'extrémité, Y vers le
// haut le long de l'empilage (plaque d'extrémité en bas, couvercle d'entrée en
// haut, comme sur les dessins), X selon les tiroirs (poignées vers -X,
// électrovannes PVE vers +X), +Z = face des orifices A / B et P / T.
// Corps de section 116 (X) × 48 (Y, épaisseur d'empilage PVG 32) × 100 (Z) mm,
// d'après les proportions des vues isométriques (épaisseur 48 mm du catalogue).
// Orifices : A / B 7/8-14 UNF (SAE -10), P / T 1 1/16-12 UN (SAE -12), lamages.

export const IN = 0.0254;
export const MM = 0.001;

// ------------------------------------------------------------ blocs usinés

/**
 * Bloc w (X) × h (Y) × d (Z) centré, orifices taraudés borgnes sur la face +Z :
 * holes = [[x, y, r, prof]] (r : rayon de taraudage). Le prisme est percé de
 * part en part puis chaque trou est rebouché par un noyau à la profondeur
 * voulue : vrai trou visible, fond plat, filet suggéré, lamage usiné.
 * Retourne un Group (corps dans material, lamages et filets en 'steel' si
 * machined, sinon dans material).
 */
export function portedBlock(api, w, h, d, material, holes = [], { spot = 1.45, machined = 'steel' } = {}) {
  const { THREE, S } = api;
  const mb = Math.min(0.0016, Math.min(w, h, d) * 0.08);
  const v = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = new THREE.Shape(v([[-w / 2 + mb, -h / 2 + mb], [w / 2 - mb, -h / 2 + mb], [w / 2 - mb, h / 2 - mb], [-w / 2 + mb, h / 2 - mb]]));
  holes.forEach(([x, y, r]) => {
    const p = new THREE.Path();
    p.absarc(x, y, r + mb, 0, Math.PI * 2, true);
    shape.holes.push(p);
  });
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: 0, bevelSegments: 1, curveSegments: 24,
  });
  geo.translate(0, 0, -d / 2 + mb);
  S.creaseNormals(geo);
  const core = [], mach = [];
  holes.forEach(([x, y, r, depth = r * 2]) => {
    // noyau qui rebouche le perçage derrière le fond du trou
    const len = d - depth;
    core.push(S.cyl(r + mb * 0.5, len, material, { axis: 'z', seg: 24, pos: [x, y, -d / 2 + len / 2] }));
    // filet (chemise usinée dans le trou) et lamage
    mach.push(S.shell(r + mb * 0.4, r * 0.94, depth * 0.85, machined, { axis: 'z', seg: 24, pos: [x, y, d / 2 - depth * 0.85 / 2 - 0.002] }));
    if (spot) mach.push(S.ring(r * spot, r * 1.0, 0.0006, machined, { axis: 'z', seg: 32, pos: [x, y, d / 2 + 0.0003] }));
  });
  const g = S.group(S.merged([new THREE.Mesh(geo), ...core], material));
  if (mach.length) g.add(S.merged(mach, machined));
  return g;
}

/** Bouchon ORB (six-pans + collerette + joint torique), tête vers +Y, posé sur y = 0. */
export function orbPlug(api, af, material = 'steel') {
  const { S } = api;
  const h = af * 0.42;
  return S.group(
    S.merged([
      S.nut(af, h, material, { pos: [0, h / 2 + af * 0.08, 0] }),
      S.cyl(af * 0.56, af * 0.08, material, { pos: [0, af * 0.04, 0], seg: 20 }),
    ], material),
    S.torus(af * 0.42, af * 0.035, 'rubber', { pos: [0, af * 0.02, 0] }),
  );
}

/** Bouchon à six-pans creux affleurant (orifice de mesure / LS), tête vers +Y. */
export function socketPlug(api, r, material = 'steel') {
  const { S } = api;
  const hexR = r * 0.55;
  return S.group(
    S.lathe([[hexR, 0.0012], [r, 0.0012], [r * 1.05, 0.0006], [r * 1.05, 0], [hexR, 0]], material, { seg: 20 }),
    S.lathe([[0, -0.002], [hexR, -0.002], [hexR, 0.0012]], material, { seg: 6 }),
  );
}

/**
 * Vis CHC (tête cylindrique à six-pans creux) : tête vers +Y posée sur y = 0,
 * tige vers -Y. d : diamètre nominal, len : longueur sous tête.
 */
export function capScrew(api, d, len, material = 'blackOxide') {
  const { S } = api;
  const R = d * 0.75, hh = d, hexR = (d * 0.5) / Math.cos(Math.PI / 6) / 1.15, c = R * 0.12;
  return S.group(
    S.lathe([[0, -len], [d / 2 - c * 0.5, -len], [d / 2, -len + c * 0.5], [d / 2, 0], [R - c, 0], [R, c], [R, hh - c], [R - c, hh], [hexR, hh]], material, { seg: 16 }),
    S.lathe([[0, hh * 0.5], [hexR, hh * 0.5], [hexR, hh]], material, { seg: 6 }),
  );
}

// ------------------------------------------------------------ PVG 32

export const PVG = {
  w: 0.116, // longueur selon les tiroirs (X)
  d: 0.1, // profondeur (Z)
  sec: 0.048, // épaisseur d'une section (Y)
  inlet: 0.062, // couvercle d'entrée (PVP)
  end: 0.03, // plaque d'extrémité
  rods: [[-0.04, -0.03], [0.04, -0.03], [0, 0.034]], // tirants [x, z]
};

/** Corps de section PVB : orifices A / B sur +Z, bouchons de mesure, ressort de tiroir côté -X. */
function pvgSection(api, { tram = false } = {}) {
  const { S } = api;
  const { w, d, sec } = PVG;
  const ra = 0.0111; // 7/8-14 UNF (SAE -10, adaptateurs de P214)
  const g = portedBlock(api, w, sec, d, 'castIron', [[-0.024, 0, ra, 0.022], [0.024, 0, ra, 0.022]]);
  // Bossages des clapets antichoc / anticavitation (PVLP) sur la face avant, de part et d'autre.
  const plugs = [];
  for (const sx of [-1, 1]) plugs.push(S.at(orbPlug(api, 0.016), [sx * 0.049, 0, d / 2], [Math.PI / 2, 0, 0]));
  if (tram) plugs.push(S.at(orbPlug(api, 0.014), [0, sec * 0.3, d / 2], [Math.PI / 2, 0, 0]));
  // Bouchons LS A / B sur la face arrière.
  for (const sx of [-1, 1]) plugs.push(S.at(socketPlug(api, 0.006), [sx * 0.03, 0, -d / 2], [-Math.PI / 2, 0, 0]));
  g.add(S.merged(plugs.filter((p) => p), 'steel'));
  // Bout de tiroir et ressort de rappel côté -X (sous le boîtier de la poignée).
  g.add(S.cyl(0.0085, 0.014, 'chrome', { axis: 'x', seg: 16, pos: [-w / 2 - 0.007, 0, 0] }));
  g.add(S.spring(0.011, 0.0014, 0.012, 4, 'steel', { axis: 'x', pos: [-w / 2 - 0.006, 0, 0], perTurn: 12, radial: 5 }));
  return g;
}

/** Couvercle d'entrée PVP : orifices P / T (SAE -12) sur +Z, orifice de manomètre dessus, LS sur +X. */
function pvgInlet(api) {
  const { S } = api;
  const { w, d, inlet } = PVG;
  const rp = 0.0135;
  const g = portedBlock(api, w, inlet, d, 'castIron', [[-0.028, -0.004, rp, 0.026], [0.03, -0.004, rp, 0.026], [0, 0.016, 0.0055, 0.012]]);
  const plugs = [
    S.at(orbPlug(api, 0.017), [-0.015, inlet / 2, -0.03]), // manomètre (dessus)
    S.at(orbPlug(api, 0.017), [w / 2, 0.01, -0.02], [0, 0, -Math.PI / 2]), // LS
    S.at(orbPlug(api, 0.022), [-w / 2, 0, 0.0], [0, 0, Math.PI / 2]), // limiteur de pression (côté -X)
  ];
  g.add(S.merged(plugs, 'steel'));
  // Plateau gravé du dessus (P, T, LS) : léger bossage usiné.
  g.add(S.box(0.07, 0.0008, 0.05, 'steel', { pos: [0.012, inlet / 2 + 0.0004, 0.012] }));
  return g;
}

/** Plaque d'extrémité : 'cover' (CP004208, couvercle plein) ou 'lx' (CP003744, orifice LX, pattes). */
function pvgEnd(api, kind = 'cover') {
  const { S } = api;
  const { w, d, end } = PVG;
  const g = S.group(S.box(w, end, d, 'castIron', { r: 0.0015 }));
  if (kind === 'lx') {
    // Pattes de fixation de part et d'autre (selon X), taraudées dessous.
    for (const sx of [-1, 1]) g.add(S.box(0.014, end * 0.6, d * 0.7, 'castIron', { r: 0.0015, pos: [sx * (w / 2 + 0.006), -end * 0.2, 0] }));
    g.add(S.at(orbPlug(api, 0.017), [w / 2 + 0.013, -end * 0.2, 0], [0, 0, -Math.PI / 2]));
  } else {
    g.add(S.at(socketPlug(api, 0.006), [0.03, 0, d / 2], [Math.PI / 2, 0, 0]));
  }
  return g;
}

/** Commande manuelle PVM (poignée courte) contre la face -X, levier vers -X. */
function pvgHandle(api) {
  const { S } = api;
  const { sec } = PVG;
  const alu = [
    S.box(0.008, sec * 0.92, 0.07, 'castAlu', { r: 0.002, pos: [-0.004, 0, 0] }),
    S.box(0.032, sec * 0.7, 0.05, 'castAlu', { r: 0.004, pos: [-0.022, 0, 0] }),
    // chape du levier
    ...[-1, 1].map((s) => S.box(0.016, 0.022, 0.006, 'castAlu', { r: 0.002, pos: [-0.04, 0.006, s * 0.009] })),
  ];
  const screws = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) screws.push(S.at(capScrew(api, 0.005, 0.01), [-0.008, sy * sec * 0.36, sz * 0.03], [0, 0, Math.PI / 2]));
  const ang = 0.12; // levier légèrement relevé
  const L = 0.11;
  const lever = S.rod([-0.04, 0.006, 0], [-0.04 - L * Math.cos(ang), 0.006 + L * Math.sin(ang), 0], 0.005, 'steel', 14);
  const pin = S.cyl(0.0035, 0.026, 'steel', { axis: 'z', seg: 12, pos: [-0.04, 0.006, 0] });
  const knob = S.lathe([[0, 0], [0.008, 0], [0.011, 0.012], [0.013, 0.045], [0.012, 0.056], [0.006, 0.06], [0, 0.06]], 'plastic', { seg: 20 });
  const kx = -0.04 - L * Math.cos(ang), ky = 0.006 + L * Math.sin(ang);
  knob.position.set(kx + 0.03 * Math.cos(ang), ky - 0.03 * Math.sin(ang), 0);
  knob.rotation.z = Math.PI / 2 + ang;
  return S.group(S.merged(alu, 'castAlu'), S.merged([...screws, lever, pin], 'steel'), knob);
}

/** Électrovanne PVE (commande électrohydraulique, connecteur AMP) contre la face +X. */
function pvgPVE(api) {
  const { THREE, S } = api;
  const { sec, d } = PVG;
  const h = sec * 0.94;
  // Embase alu, puis boîtier plastique à capot incliné, ailettes et connecteur.
  const base = S.box(0.022, h, d * 0.94, 'castAlu', { r: 0.002, pos: [0.011, 0, 0] });
  const prof = [[0, -h / 2], [0.082, -h / 2], [0.082, h / 2 - 0.004], [0.06, h / 2 + 0.006], [0.012, h / 2 + 0.006], [0, h / 2 - 0.004]];
  const body = S.extrude(prof, d * 0.82, 'plastic');
  body.position.set(0.022, 0, 0);
  // Ailettes de refroidissement du bout (quatre lames horizontales).
  const fins = [0, 1, 2, 3].map((i) => S.box(0.012, 0.005, d * 0.8, 'plastic', { r: 0.0012, pos: [0.106, -h * 0.33 + i * h * 0.2, 0] }));
  const conn = S.box(0.02, 0.016, 0.026, 'plastic', { r: 0.002, pos: [0.115, -h * 0.1, 0.012] });
  const latch = S.box(0.012, 0.004, 0.012, 'plastic', { pos: [0.118, -h * 0.1 + 0.01, 0.012] });
  const screws = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) screws.push(S.at(capScrew(api, 0.005, 0.02), [0.023, sy * h * 0.36, sz * d * 0.42], [0, 0, -Math.PI / 2]));
  const led = S.cyl(0.0035, 0.002, 'lamp', { pos: [0.05, h / 2 + 0.0065, -0.02], seg: 12 });
  void THREE;
  return S.group(base, S.merged([body, ...fins, conn, latch], 'plastic'), S.merged(screws, 'steel'), led);
}

/** Couvercle de ressort (section sans PVE) contre la face +X. */
function pvgSpringCover(api) {
  const { S } = api;
  const { sec } = PVG;
  return S.group(
    S.box(0.006, sec * 0.8, 0.06, 'castAlu', { r: 0.002, pos: [0.003, 0, 0] }),
    S.cyl(0.016, 0.03, 'castAlu', { axis: 'x', seg: 24, pos: [0.021, 0, 0] }),
    S.merged([0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      return S.at(capScrew(api, 0.005, 0.01), [0.006, Math.cos(a) * 0.024, Math.sin(a) * 0.024], [0, 0, -Math.PI / 2]);
    }), 'steel'),
  );
}

/** Tirant fileté avec écrou à chaque bout, de y0 à y1 (dans le repère du distributeur). */
function pvgRod(api, x, z, y0, y1) {
  const { S } = api;
  const r = 0.004;
  return S.group(S.merged([
    S.cyl(r, y1 - y0 + 0.012, 'zinc', { seg: 12, pos: [x, (y0 + y1) / 2, z] }),
    S.nut(0.013, 0.0065, 'zinc', { pos: [x, y0 - 0.0033, z] }),
    S.nut(0.013, 0.0065, 'zinc', { pos: [x, y1 + 0.0033, z] }),
  ], 'zinc'));
}

/**
 * Distributeur PVG 32 complet : enregistre chaque pièce (une par unité).
 * spec = { end: [ref, 'cover' | 'lx'], sections: [{ ref, handle, pve, spring, tram }] (du bas
 * vers le haut), inlet: ref, kit: ref des tirants (trousse de joints + boulonnerie) }.
 * Retourne la hauteur totale (m) et les y des milieux de section.
 */
export function pvgValve(api, spec) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { w, sec, end, inlet } = PVG;
  const n = spec.sections.length;
  const H = end + n * sec + inlet;
  // Éclaté : empilage étiré selon Y, pièces latérales sorties selon X.
  const gap = 0.035;
  const ey = (i) => (i + 1) * gap; // déplacement de la section i (0 = plaque d'extrémité)
  P(spec.end[0], S.at(pvgEnd(api, spec.end[1]), [0, end / 2, 0]), [0, 0, 0]);
  const ys = [];
  spec.sections.forEach((s, i) => {
    const y = end + sec * (i + 0.5);
    ys.push(y);
    P(s.ref, S.at(pvgSection(api, s), [0, y, 0]), [0, ey(i), 0]);
    if (s.handle) P(s.handle, S.at(pvgHandle(api), [-w / 2, y, 0]), [-0.09, ey(i), 0]);
    if (s.pve) P(s.pve, S.at(pvgPVE(api), [w / 2, y, 0]), [0.1, ey(i), 0]);
    if (s.spring) P(s.spring, S.at(pvgSpringCover(api), [w / 2, y, 0]), [0.08, ey(i), 0]);
  });
  P(spec.inlet, S.at(pvgInlet(api), [0, H - inlet / 2, 0]), [0, ey(n), 0]);
  if (spec.kit) PVG.rods.forEach(([x, z]) => P(spec.kit, pvgRod(api, x, z, 0, H), [0, -0.6 * H - 0.06, 0]));
  return { H, ys };
}

// ------------------------------------------------------------ raccords hydrauliques
// Tailles SAE (« dash » = seizièmes de pouce) : t = Ø du filet JIC / ORB (po),
// hex = six-pans d'un adaptateur (po), od = Ø ext. du tube (po).
export const SAE = {
  2: { t: 5 / 16, hex: 7 / 16, od: 1 / 8 },
  4: { t: 7 / 16, hex: 9 / 16, od: 1 / 4 },
  5: { t: 1 / 2, hex: 5 / 8, od: 5 / 16 },
  6: { t: 9 / 16, hex: 11 / 16, od: 3 / 8 },
  8: { t: 3 / 4, hex: 7 / 8, od: 1 / 2 },
  10: { t: 7 / 8, hex: 1, od: 5 / 8 },
  12: { t: 1 + 1 / 16, hex: 1.25, od: 3 / 4 },
  16: { t: 1 + 5 / 16, hex: 1.5, od: 1 },
  20: { t: 1 + 5 / 8, hex: 1.875, od: 1.25 },
  24: { t: 1 + 7 / 8, hex: 2.125, od: 1.5 },
  32: { t: 2.5, hex: 2.75, od: 2 },
};
const sae = (dash) => SAE[dash] || SAE[8];

/** Profil d'un embout mâle JIC 37° de y0 à y0 + len (rayon de filet rt) : filet puis cône. */
function jicMaleProfile(api, rt, y0, len) {
  const { S } = api;
  const yc = y0 + len - rt * 0.55;
  return [
    ...S.thread(rt, y0, yc, { pitch: rt * 0.22, maxTurns: 6, chamferBottom: false }),
    [rt * 0.92, yc + rt * 0.05], [rt * 0.62, y0 + len], [rt * 0.42, y0 + len], [rt * 0.42, y0 + len - 0.002], [0, y0 + len - 0.002],
  ];
}

/**
 * Adaptateur droit MORB → MJIC (ou MORB → MORB) le long de +Y, origine sur la
 * face de l'orifice : queue ORB vissée sous y = 0 (cachée), joint torique,
 * six-pans, embout JIC mâle. Retourne l'objet et la position du bout (tip).
 */
export function orbAdapter(api, orb, jic = orb, material = 'zinc') {
  const { S } = api;
  const a = sae(orb), b = sae(jic);
  const rt = (b.t * IN) / 2, ro = (a.t * IN) / 2;
  const af = Math.max(a.hex, b.hex) * IN;
  const hh = af * 0.42;
  const len = rt * 2.6 + 0.004;
  const g = S.group(
    S.merged([
      S.lathe([[0, -ro * 1.5], [ro * 0.95, -ro * 1.5], [ro, -ro * 1.3], [ro, 0], [0, 0]], material, { seg: 14 }),
      S.nut(af, hh, material, { pos: [0, hh / 2 + 0.0008, 0] }),
      S.cyl(af * 0.48, 0.0008, material, { seg: 18, pos: [0, 0.0004, 0] }),
      S.lathe([[0, hh], [rt * 0.85, hh], [rt * 0.85, hh + 0.003], ...jicMaleProfile(api, rt, hh + 0.003, len)], material, { seg: 16 }),
    ], material),
    S.torus(ro * 1.05, ro * 0.08, 'rubber', { pos: [0, 0.0006, 0] }),
  );
  return { obj: g, tip: hh + 0.003 + len };
}

/** Écrou tournant JIC femelle (six-pans) le long de +Y, de y = 0 à y = h. */
function swivelNutGeo(api, dash, material) {
  const { S } = api;
  const b = sae(dash);
  const af = (b.hex + 0.0625) * IN, h = b.t * IN * 0.75;
  return { obj: S.nut(af, h, material, { pos: [0, h / 2, 0] }), h, af };
}

/**
 * Coude 90° à écrou tournant (SFJIC → MJIC) : l'écrou coiffe un embout mâle
 * dont le bout est à l'origine (écrou de y = -0.6 h à 0.4 h), le corps monte
 * selon +Y puis la sortie mâle part selon +Z. long : coude de tube cintré à
 * grandes branches (FA01019). Retourne { obj, out: [0, y, z] du bout mâle }.
 */
export function swivelElbow(api, dash, { long = false, material = 'zinc' } = {}) {
  const { S } = api;
  const b = sae(dash);
  const rt = (b.t * IN) / 2;
  const nut = swivelNutGeo(api, dash, material);
  const y0 = -nut.h * 0.6;
  nut.obj.position.y += y0;
  const parts = [nut.obj];
  let outY, outZ;
  if (long) {
    // Tube cintré : branche montante, rayon de cintrage 1,5 D, branche horizontale.
    const r = (b.od * IN) / 2, R = r * 3.2, L1 = rt * 5, L2 = rt * 4;
    const yb = y0 + nut.h;
    const pts = [[0, yb, 0], [0, yb + L1, 0]];
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      pts.push([0, yb + L1 + Math.sin(a) * R, R - Math.cos(a) * R]);
    }
    pts.push([0, yb + L1 + R, R + L2]);
    parts.push(S.tube(pts, r, material, { sharp: true, ends: 'none', radial: 14 }));
    outY = yb + L1 + R;
    outZ = R + L2;
    parts.push(S.cyl(rt * 1.1, rt * 0.8, material, { axis: 'z', seg: 16, pos: [0, outY, outZ + rt * 0.4] }));
    parts.push(S.at(S.lathe(jicMaleProfile(api, rt, 0, rt * 2.4), material, { seg: 16 }), [0, outY, outZ + rt * 0.8], [Math.PI / 2, 0, 0]));
    outZ += rt * 0.8 + rt * 2.4;
  } else {
    // Corps forgé : bloc à angle arrondi, sortie six-pans + embout mâle.
    const s = b.hex * IN * 0.92;
    const yb = y0 + nut.h + s * 0.45;
    parts.push(S.cyl(rt * 0.95, nut.h * 0.6, material, { seg: 16, pos: [0, y0 + nut.h + nut.h * 0.3 - 0.001, 0] }));
    parts.push(S.box(s, s, s, material, { r: s * 0.3, pos: [0, yb, 0] }));
    parts.push(S.at(S.nut(s, s * 0.35, material), [0, yb, s * 0.5 + s * 0.175], [Math.PI / 2, 0, 0]));
    parts.push(S.at(S.lathe(jicMaleProfile(api, rt, 0, rt * 2.4), material, { seg: 16 }), [0, yb, s * 0.5 + s * 0.35], [Math.PI / 2, 0, 0]));
    outY = yb;
    outZ = s * 0.85 + rt * 2.4;
  }
  return { obj: S.merged(parts, material), out: [0, outY, outZ] };
}

/** Té (mâle JIC sur les trois branches) : passage selon Y, branche selon +Z, centre à l'origine. */
export function jicTee(api, dash, material = 'zinc') {
  const { S } = api;
  const b = sae(dash);
  const rt = (b.t * IN) / 2, s = b.hex * IN;
  const parts = [S.box(s, s * 1.1, s, material, { r: s * 0.12 })];
  for (const [rot, pos] of [[[0, 0, 0], [0, s * 0.55, 0]], [[Math.PI, 0, 0], [0, -s * 0.55, 0]], [[Math.PI / 2, 0, 0], [0, 0, s * 0.5]]]) {
    parts.push(S.at(S.lathe(jicMaleProfile(api, rt, 0, rt * 2.4), material, { seg: 16 }), pos, rot));
  }
  return { obj: S.merged(parts, material), reach: s * 0.5 + rt * 2.4 };
}

/**
 * Oriente un objet construit le long de +Y (et +Z secondaire) : axe principal
 * selon dir, axe secondaire selon side (perpendiculaire), origine en pos.
 */
export function orient(api, obj, pos, dir, side = null) {
  const { THREE } = api;
  const Y = new THREE.Vector3(...dir).normalize();
  let Z = side ? new THREE.Vector3(...side) : (Math.abs(Y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1));
  Z = Z.sub(Y.clone().multiplyScalar(Z.dot(Y))).normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z);
  const g = api.S.group(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  g.position.set(...pos);
  return g;
}

// ------------------------------------------------------------ raccords NPT
// Tube NPT : Ø extérieur du filet (po) par « dash » (seizièmes de pouce) :
// -02 = 1/8, -04 = 1/4, -06 = 3/8, -08 = 1/2, -12 = 3/4, -16 = 1, -20 = 1 1/4,
// -24 = 1 1/2, -32 = 2 NPT.
export const NPT = { 2: 0.405, 4: 0.54, 6: 0.675, 8: 0.84, 12: 1.05, 16: 1.315, 20: 1.66, 24: 1.9, 32: 2.375 };

/** Profil d'un filet NPT mâle conique (1:16) de y0 (bout) à y1, rayon r au gros bout. */
function nptMaleProfile(api, r, y0, y1) {
  const { S } = api;
  return S.thread(r * 0.94, y0, y1, { r1: r, pitch: r * 0.2, maxTurns: 7 });
}

/**
 * Raccord à queue NPT mâle (vissée sous y = 0, dans l'orifice) : six-pans de
 * y = 0 à hh, puis sortie inclinée de angle (degrés, de +Y vers +Z) :
 * end = 'jic' (embout JIC mâle), 'swivel' (écrou tournant JIC femelle),
 * 'fnpt' (taraudage NPT femelle, coude de tuyauterie), 'npt' (mamelon NPT mâle).
 * npt, jic : tailles dash. Retourne { obj, out (centre du bout), dir (axe de sortie) }.
 */
export function nptFitting(api, { npt = 8, jic = npt, angle = 0, end = 'jic', material = 'zinc' } = {}) {
  const { THREE, S } = api;
  const rn = (NPT[npt] * IN) / 2;
  const b = SAE[jic] || SAE[8];
  const rt = (b.t * IN) / 2;
  const af = Math.max(b.hex * IN, rn * 2.25);
  const hh = af * 0.45;
  const parts = [
    S.lathe([[0, -rn * 1.6], ...nptMaleProfile(api, rn, -rn * 1.6, 0), [rn * 0.9, 0], [0, 0]], material, { seg: 14 }),
  ];
  const a = (angle * Math.PI) / 180;
  const dir = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
  let base; // centre de départ du bout de sortie
  if (angle === 0) {
    parts.push(S.nut(af, hh, material, { pos: [0, hh / 2, 0] }));
    base = new THREE.Vector3(0, hh, 0);
  } else {
    // Corps forgé : six-pans bas, coude rond, collet de sortie.
    parts.push(S.nut(af, hh, material, { pos: [0, hh / 2, 0] }));
    const rb = af * 0.42;
    const c = new THREE.Vector3(0, hh + rb, 0);
    parts.push(S.cyl(rb, rb * 2, material, { seg: 18, pos: [0, hh + rb * 0.5, 0] }));
    parts.push(S.ball(rb, material, { pos: c.toArray() }));
    const p1 = c.clone().addScaledVector(dir, rb * 1.1);
    parts.push(S.rod(c.toArray(), p1.toArray(), rb, material, 18));
    base = p1;
  }
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const tail = (obj) => { obj.quaternion.copy(q); obj.position.copy(base); return obj; };
  let len;
  if (end === 'jic') {
    len = rt * 2.6 + 0.003;
    parts.push(tail(S.lathe([[0, 0], [rt * 0.85, 0], [rt * 0.85, 0.003], ...jicMaleProfile(api, rt, 0.003, len - 0.003)], material, { seg: 16 })));
  } else if (end === 'npt') {
    len = rn * 1.6;
    parts.push(tail(S.lathe([[0, 0], [rn, 0], ...nptMaleProfile(api, rn, 0, len).map(([r, y]) => [r, len - y]).reverse(), [0, len]], material, { seg: 14 })));
  } else if (end === 'swivel') {
    const sn = (b.hex + 0.0625) * IN, nh = rt * 1.5;
    len = 0.004 + nh;
    parts.push(tail(S.group(S.cyl(rt * 0.8, 0.005, material, { seg: 14, pos: [0, 0.0025, 0] }), S.nut(sn, nh, material, { pos: [0, 0.004 + nh / 2, 0] }))));
  } else {
    // Bout femelle NPT : manchon taraudé (vrai alésage).
    len = rn * 1.7;
    parts.push(tail(S.lathe([[rn * 0.95, len], [rn * 0.95, 0], [rn * 1.3, 0], [rn * 1.38, len * 0.1], [rn * 1.38, len - 0.002], [rn * 1.3, len], [rn * 0.95, len]], material, { seg: 18 })));
    parts.push(tail(S.cyl(rn, 0.002, material, { seg: 16, pos: [0, len * 0.2, 0] })));
  }
  const out = base.clone().addScaledVector(dir, len);
  return { obj: S.merged(parts, material), out: out.toArray(), dir: dir.toArray() };
}

/** Clapet anti-retour en ligne, corps six-pans (af, longueur L) taraudé NPT femelle aux deux bouts, axe Y centré. */
export function inlineCheck(api, npt, L, af, material = 'steel') {
  const { S, THREE } = api;
  const rn = (NPT[npt] * IN) / 2;
  const hexR = af / 2 / Math.cos(Math.PI / 6);
  const shape = new THREE.Shape(Array.from({ length: 6 }, (_, i) => new THREE.Vector2(hexR * Math.cos((i * Math.PI) / 3), hexR * Math.sin((i * Math.PI) / 3))));
  const h = new THREE.Path();
  h.absarc(0, 0, rn * 0.97, 0, Math.PI * 2, true);
  shape.holes.push(h);
  const mb = 0.0008;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: L - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 18 });
  geo.translate(0, 0, -L / 2 + mb);
  geo.rotateX(-Math.PI / 2);
  // Cloison du siège au milieu (l'alésage n'est pas traversant).
  return S.merged([new THREE.Mesh(geo), S.cyl(rn, L * 0.4, material, { seg: 16 })], material);
}

/** Point local [x, y, z] d'un objet orienté par orient(pos, dir, side) → coordonnées du parent. */
export function orientPoint(api, local, pos, dir, side) {
  const { THREE } = api;
  const Y = new THREE.Vector3(...dir).normalize();
  let Z = side ? new THREE.Vector3(...side) : (Math.abs(Y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1));
  Z = Z.sub(Y.clone().multiplyScalar(Z.dot(Y))).normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z);
  return new THREE.Vector3(...pos).addScaledVector(X, local[0]).addScaledVector(Y, local[1]).addScaledVector(Z, local[2]).toArray();
}

/**
 * Vanne à boisseau sphérique 3 voies montée sur panneau : corps cubique
 * (côté s), trois bossages taraudés NPT (±X et -Y), chapeau fileté et écrou de
 * panneau sur +Y, levier plat. Centre du corps à l'origine. Retourne
 * { obj, ports: { '-x', '+x', '-y' } (faces des orifices) }.
 */
export function ballValve3(api, npt = 8, { s = 0.048, stem = 0.06, material = 'brass', handle = 'red' } = {}) {
  const { S } = api;
  const rn = (NPT[npt] * IN) / 2;
  const boss = rn * 1.45, bl = 0.012;
  const body = [S.box(s, s, s, material, { r: 0.004 })];
  const ports = {};
  for (const [k, dir] of [['-x', [-1, 0, 0]], ['+x', [1, 0, 0]], ['-y', [0, -1, 0]]]) {
    const c = dir.map((v) => v * (s / 2 + bl / 2));
    body.push(S.at(S.lathe([[rn * 0.95, bl / 2], [rn * 0.95, -bl / 2], [boss, -bl / 2], [boss, bl / 2 - 0.0015], [boss - 0.0015, bl / 2], [rn * 0.95, bl / 2]], material, { seg: 6 }), c,
      dir[0] ? [0, 0, -dir[0] * Math.PI / 2] : [Math.PI, 0, 0]));
    ports[k] = dir.map((v) => v * (s / 2 + bl));
  }
  // Chapeau fileté (traverse le panneau), écrou de panneau, tige carrée, levier.
  const bonnet = S.lathe([[0, s / 2], [0.016, s / 2], [0.016, s / 2 + 0.004], ...S.thread(0.0125, s / 2 + 0.004, s / 2 + stem, { pitch: 0.0016, maxTurns: 12, chamferBottom: false }), [0, s / 2 + stem]], material, { seg: 24 });
  const steel = [
    S.cyl(0.005, 0.016, 'steel', { seg: 4, pos: [0, s / 2 + stem + 0.008, 0] }),
    S.nut(0.008, 0.005, 'steel', { pos: [0, s / 2 + stem + 0.02, 0] }),
  ];
  const lever = S.group(
    S.box(0.13, 0.006, 0.028, handle, { r: 0.0025, pos: [0.045, 0, 0] }),
    S.box(0.03, 0.012, 0.03, handle, { r: 0.004, pos: [0, -0.003, 0] }),
  );
  lever.position.y = s / 2 + stem + 0.014;
  return { obj: S.group(S.merged(body, material), bonnet, S.merged(steel, 'steel'), lever), ports, top: s / 2 + stem };
}
