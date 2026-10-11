// Outils communs aux assemblages du porteur DU311-T (P328 et ses
// sous-ensembles) : pièces légères (peu de triangles) pour les nombreuses
// tôles percées, rondelles, joints et six-pans du porteur, dont le modèle
// complet (deux chenilles, quatre stabilisateurs, réservoirs, vannes) doit
// rester sous 150 000 triangles. Fichier préfixé « _ » : pas un assemblage.

export const IN = 0.0254;

/**
 * Outils liés à l'api d'un builder : const T = kit(api).
 *   T.plate(w, d, t, mat, { holes: [[x, z, r]], cutouts: [[x, z, w, d]], r, seg })
 *     tôle dans le plan XZ centrée (épaisseur selon Y), trous à seg côtés.
 *   T.band(ro, ri, y0, y1, mat, seg) : bague de section rectangulaire (joint,
 *     rondelle, circlip) autour de Y.
 *   T.washer(d, mat, { pos, axis }) : rondelle plate pour vis de diamètre d,
 *     posée sur le plan y = 0 (épaisseur vers +Y).
 *   T.lock(d, mat, opts) : rondelle Grower (coupée, légèrement vrillée).
 *   T.hex(af, h, mat, { pos, axis }) : prisme six-pans (surplat af) centré.
 *   T.screw(d, len, mat, { pos, axis, seg }) : vis H légère (tête vers +axe,
 *     tige vers −axe depuis l'origine), 8 segments.
 *   T.toward(obj, dir, pos) : oriente un objet construit le long de +Y.
 */
export function kit(api) {
  const { THREE, S } = api;
  const { lathe, merged, group, at } = S;
  const Y = new THREE.Vector3(0, 1, 0);

  const toward = (obj, dir, pos = [0, 0, 0]) => {
    const g = group(obj);
    g.quaternion.setFromUnitVectors(Y, new THREE.Vector3(...dir).normalize());
    g.position.set(...pos);
    return g;
  };
  const axisDir = { y: [0, 1, 0], '-y': [0, -1, 0], x: [1, 0, 0], '-x': [-1, 0, 0], z: [0, 0, 1], '-z': [0, 0, -1] };
  const place = (obj, { pos = [0, 0, 0], axis = 'y' } = {}) => toward(obj, axisDir[axis] || axis, pos);

  const plate = (w, d, t, mat, { holes = [], cutouts = [], r = 0, seg = 8 } = {}) => {
    const s = new THREE.Shape();
    const x0 = -w / 2, y0 = -d / 2;
    const rr = Math.min(r, w / 2, d / 2);
    s.moveTo(x0 + rr, y0);
    s.lineTo(x0 + w - rr, y0);
    if (rr) s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr);
    s.lineTo(x0 + w, y0 + d - rr);
    if (rr) s.quadraticCurveTo(x0 + w, y0 + d, x0 + w - rr, y0 + d);
    s.lineTo(x0 + rr, y0 + d);
    if (rr) s.quadraticCurveTo(x0, y0 + d, x0, y0 + d - rr);
    s.lineTo(x0, y0 + rr);
    if (rr) s.quadraticCurveTo(x0, y0, x0 + rr, y0);
    for (const [x, z, hr] of holes) s.holes.push(new THREE.Path().absarc(x, -z, hr, 0, Math.PI * 2, true));
    for (const [x, z, cw, cd] of cutouts) {
      const p = new THREE.Path();
      p.moveTo(x - cw / 2, -z - cd / 2); p.lineTo(x - cw / 2, -z + cd / 2); p.lineTo(x + cw / 2, -z + cd / 2); p.lineTo(x + cw / 2, -z - cd / 2);
      p.closePath();
      s.holes.push(p);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: Math.max(2, Math.round(seg / 2)) });
    geo.translate(0, 0, -t / 2);
    geo.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(geo)], mat);
  };

  const band = (ro, ri, y0, y1, mat, seg = 14) => lathe([[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, { seg });

  const washer = (d, mat = 'zinc', { seg = 12, ...opts } = {}) => {
    const t = Math.max(d * 0.16, 0.0012);
    return place(band(d * 1.05, d * 0.54, 0, t, mat, seg), opts);
  };

  const lock = (d, mat = 'zinc', opts = {}) => {
    const t = Math.max(d * 0.25, 0.0012), ro = d * 0.9, ri = d * 0.54;
    const shape = new THREE.Shape().absarc(0, 0, ro, 0.12, Math.PI * 2 - 0.12, false);
    shape.absarc(0, 0, ri, Math.PI * 2 - 0.12, 0.12, true);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 3 });
    geo.rotateX(-Math.PI / 2);
    return place(merged([new THREE.Mesh(geo)], mat), opts);
  };

  const hex = (af, h, mat = 'zinc', opts = {}) => {
    const R = af / Math.sqrt(3);
    const m = merged([at(new THREE.Mesh(new THREE.CylinderGeometry(R, R, h, 6)), [0, 0, 0], [0, Math.PI / 6, 0])], mat);
    return place(m, opts);
  };

  const screw = (d, len, mat = 'zinc', { pos, axis = 'y', seg = 8 } = {}) => {
    const af = d * 1.5, hh = d * 0.65, R = af / Math.sqrt(3);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(R, R, hh, 6));
    head.position.y = hh / 2;
    head.rotation.y = Math.PI / 6;
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(d / 2, d / 2 * 0.92, len, seg, 1));
    shank.position.y = -len / 2;
    return place(merged([head, shank], mat), { pos, axis });
  };

  return { plate, band, washer, lock, hex, screw, toward, place };
}

// ============================================================================
// Raccords hydrauliques SAE (JIC 37°, ORB, NPT), boulonnerie et blocs percés,
// en basse définition (quelques centaines de triangles par raccord) — section
// des collecteurs et vannes (P346, P350, P354, P358, P360, P362, P364, P374,
// P386, P388). Utilise IN (ci-dessus).
//
// Convention de chaque raccord : origine au centre de la face de l'orifice
// qui le reçoit (face d'appui), +Y sortant de l'orifice ; la queue filetée
// (ORB / NPT) plonge vers −Y. Pour un raccord à écrou tournant femelle,
// l'origine est le bout du nez mâle qu'il coiffe (siège du cône 37°).
// Chaque raccord expose userData.ports = [{ p, d }] : bouts des nez mâles (ou
// entrées femelles) dans son repère, pour enchaîner les raccords (racPort).
// Matériaux : acier zingué ('zinc'), joints toriques 'rubber'.
// ============================================================================

export const RAC_IN = 0.0254;

// SAE J514 : filetage (po), six-pans du corps (po), six-pans de l'écrou tournant (po).
export const JIC = {
  4: { t: 7 / 16, hex: 9 / 16, nut: 9 / 16 },
  6: { t: 9 / 16, hex: 5 / 8, nut: 11 / 16 },
  8: { t: 3 / 4, hex: 13 / 16, nut: 7 / 8 },
  12: { t: 1 + 1 / 16, hex: 1.25, nut: 1.25 },
  16: { t: 1 + 5 / 16, hex: 1.5, nut: 1.5 },
  20: { t: 1 + 5 / 8, hex: 1.875, nut: 2 },
  24: { t: 1 + 7 / 8, hex: 2.25, nut: 2.375 },
};
// NPT : diamètre extérieur du tube (po) et six-pans usuel (po), par taille en 1/16 po.
export const NPT = {
  2: { t: 0.405, hex: 9 / 16 },
  4: { t: 0.54, hex: 11 / 16 },
  6: { t: 0.675, hex: 7 / 8 },
  8: { t: 0.84, hex: 1 + 1 / 16 },
  12: { t: 1.05, hex: 1.25 },
  16: { t: 1.315, hex: 1 + 5 / 8 },
};

/**
 * Pose un objet : +Y local selon dir, +X local tourné vers side (projeté
 * perpendiculairement à dir), origine en pos. Renvoie l'objet.
 */
export function racPose(THREE, obj, pos, dir, side = [1, 0, 0]) {
  const Y = new THREE.Vector3(...dir).normalize();
  let X = new THREE.Vector3(...side);
  X.sub(Y.clone().multiplyScalar(X.dot(Y)));
  if (X.lengthSq() < 1e-10) {
    X = new THREE.Vector3(0, 0, 1).cross(Y);
    if (X.lengthSq() < 1e-10) X = new THREE.Vector3(1, 0, 0);
  }
  X.normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  obj.position.set(...pos);
  obj.updateMatrix();
  return obj;
}

/** Orifice i d'un raccord posé, dans le repère de son parent : { p, d } (tableaux). */
export function racPort(THREE, obj, i = 0) {
  obj.updateMatrix();
  const pt = obj.userData.ports[i];
  const p = new THREE.Vector3(...pt.p).applyMatrix4(obj.matrix);
  const d = new THREE.Vector3(...pt.d).applyQuaternion(obj.quaternion).normalize();
  return { p: p.toArray(), d: d.toArray() };
}

/** Vecteur de longueur k le long de dir (déplacement d'éclaté). */
export const racOut = (dir, k) => {
  const l = Math.hypot(...dir) || 1;
  return dir.map((v) => (v / l) * k);
};

/**
 * Fabrique de raccords et de boulonnerie liée à la bibliothèque de formes
 * (api.S). Tailles d'entrée en « dash » (1/16 po). Pièces de révolution à
 * 9-10 facettes (ombrage lissé), six-pans à 6, sans filets dessinés.
 */
export function racFactory(S) {
  const { lathe, merged, group } = S;
  const COS30 = Math.cos(Math.PI / 6);
  const sg = (r) => (r > 0.012 ? 9 : 8);
  const hexR = (af) => af / 2 / COS30;

  // Six-pans (surplat af) de y0 à y0 + h, chanfrein du dessus ; percé (ri) si demandé.
  const hexY = (af, y0, h, ri = 0, mat = 'zinc') => {
    const R = hexR(af), c = Math.min(R * 0.14, h * 0.3);
    const p = ri
      ? [[ri, y0], [R, y0], [R, y0 + h - c * 0.6], [R - c, y0 + h], [ri, y0 + h]]
      : [[0, y0], [R, y0], [R, y0 + h - c * 0.6], [R - c, y0 + h], [0, y0 + h]];
    return lathe(p, mat, { seg: 6 });
  };
  // Fût cylindrique.
  const rodY = (r, y0, y1, mat = 'zinc') => lathe([[0, y0], [r, y0], [r, y1], [0, y1]], mat, { seg: sg(r) });
  // Nez mâle JIC 37° de y0 à y0 + L : collet, filet, cône 37°, alésage.
  const noseLen = (t) => t * IN * 0.95;
  const jicNose = (t, y0) => {
    const r = (t * IN) / 2, L = noseLen(t), y1 = y0 + L;
    return lathe([
      [0, y0], [r * 0.86, y0], [r, y0 + L * 0.2],
      [r, y1 - L * 0.24], [r * 0.64, y1], [0, y1 - L * 0.3],
    ], 'zinc', { seg: sg(r) });
  };
  // Joint torique (section carrée).
  const oring = (R, w, y) => lathe([[R + w, y - w * 0.5], [R + w, y + w * 0.5], [R - w, y + w * 0.5]], 'rubber', { seg: 9 });
  // Queue ORB (filetage droit, dégagement, joint) sous y = 0.
  const orbStud = (t, rub) => {
    const r = (t * IN) / 2, L = r * 1.25;
    rub.push(oring(r * 0.92, r * 0.09, -r * 0.12));
    return lathe([[0, -L], [r, -L], [r, -r * 0.3], [r * 0.84, 0.0005], [0, 0.0005]], 'zinc', { seg: 8 });
  };
  // Queue NPT conique sous y = 0.
  const nptStud = (t) => {
    const r = (t * IN) / 2, L = r * 1.3;
    return lathe([[0, -L], [r * 0.86, -L], [r, 0.0005], [0, 0.0005]], 'zinc', { seg: 7 });
  };
  // Mâle NPT vers le haut, de y0 à y0 + L.
  const nptUp = (t, y0) => {
    const r = (t * IN) / 2, L = r * 1.3;
    return lathe([[0, y0], [r, y0], [r * 0.86, y0 + L], [r * 0.45, y0 + L], [0, y0 + L - r * 0.2]], 'zinc', { seg: sg(r) });
  };
  // Fût de y0 jusqu'au centre yc, fermé par un dôme (corps de coude ou de té).
  const knuckle = (r, yc, y0 = yc - r) => lathe([[0, y0], [r, y0], [r, yc], [r * 0.7, yc + r * 0.7], [0, yc + r]], 'zinc', { seg: sg(r) });
  // Manchon ouvert (branche de coude qui sort du dôme).
  const sleeve = (r, y0, y1) => lathe([[r, y0], [r, y1]], 'zinc', { seg: sg(r) });

  const finish = (zinc, rub, ports) => {
    const g = group(merged(zinc, 'zinc'), rub.length ? merged(rub, 'rubber') : null);
    g.userData.ports = ports;
    return g;
  };
  // Queue côté orifice : ORB (avec bague et écrou de blocage si orientable) ou NPT.
  const portEnd = (port, dash, zinc, rub, adjustable) => {
    if (port === 'npt') { zinc.push(nptStud(NPT[dash].t)); return 0; }
    const s = JIC[dash];
    if (!adjustable) { zinc.push(orbStud(s.t, rub)); return 0; }
    // Orientable : joint caché sous la bague, non dessiné.
    zinc.push(orbStud(s.t, []));
    // Bague d'appui sous l'écrou de blocage (un seul profil).
    const r = (s.t * IN) / 2, h = r * 0.55, R = hexR(s.hex * IN * 1.02), c = R * 0.12, w = r * 0.12;
    zinc.push(lathe([[r * 0.85, 0], [R, 0], [R, w + h - c * 0.6], [R - c, w + h], [r * 0.85, w + h]], 'zinc', { seg: 6 }));
    return w + h;
  };
  const dimsOf = (port, dash) => (port === 'npt' ? NPT[dash] : JIC[dash]);

  return {
    hexY, rodY, jicNose, noseLen, knuckle, sleeve, oring, nptStud,

    /** Vis H d × len (m), tête en haut à l'origine, tige vers −Y. */
    bolt: (d, len, mat = 'zinc') => merged([
      hexY(d * 1.5, 0, d * 0.65, 0, mat),
      lathe([[0, -len], [d / 2, -len], [d / 2, 0.0005]], mat, { seg: 6 }),
    ], mat),
    /** Rondelle plate (SAE) ou fendue (grower) de vis d, posée sur y = 0. */
    washer: (d, { split = false, mat = 'zinc' } = {}) => {
      const ro = split ? d * 0.88 : d * 1.05, ri = d * 0.54, t = split ? d * 0.25 : d * 0.16;
      return lathe([[ro, 0], [ro, t], [ri, t]], mat, { seg: 8 });
    },
    /** Écrou H de vis d, posé sur y = 0. */
    nut: (d, mat = 'zinc') => lathe([[d * 0.87, 0], [d * 0.87, d * 0.85], [d * 0.5, d * 0.85]], mat, { seg: 6 }),

    /** Adaptateur droit : orifice (ORB / NPT pd) → mâle JIC jd (FA01055, FA01033). */
    straight({ port = 'orb', pd, jd }) {
      const zinc = [], rub = [];
      portEnd(port, pd, zinc, rub, false);
      const P = dimsOf(port, pd), J = JIC[jd];
      const af = Math.max(P.hex, J.hex) * IN, h = af * 0.42;
      zinc.push(hexY(af, 0, h));
      zinc.push(jicNose(J.t, h));
      return finish(zinc, rub, [{ p: [0, h + noseLen(J.t), 0], d: [0, 1, 0] }]);
    },

    /**
     * Coude forgé (90 ou 45°) : orifice (ORB orientable / NPT) → mâle JIC jd,
     * sortie dans le plan XY vers +X (FA01052, FA01051, FA01032, FA01031).
     */
    elbow({ port = 'orb', pd, jd, angle = 90 }) {
      const zinc = [], rub = [];
      const y0 = portEnd(port, pd, zinc, rub, port === 'orb');
      const P = dimsOf(port, pd), J = JIC[jd];
      const rb = ((Math.max(P.t, J.t) * IN) / 2) * 0.92;
      let yc;
      if (port === 'npt') {
        const af = P.hex * IN, h = af * 0.38;
        zinc.push(hexY(af, 0, h));
        yc = h + rb * 1.1;
        zinc.push(knuckle(rb, yc, h - 0.0005));
      } else {
        yc = y0 + rb * 1.25;
        zinc.push(knuckle(rb, yc, y0 - 0.0005));
      }
      const a = (angle * Math.PI) / 180;
      const lo = rb * 1.1;
      const branch = group(sleeve(rb, 0, lo), jicNose(J.t, lo));
      branch.position.set(0, yc, 0);
      branch.rotation.z = -a;
      zinc.push(branch);
      const d = [Math.sin(a), Math.cos(a), 0];
      const L = lo + noseLen(J.t);
      return finish(zinc, rub, [{ p: [d[0] * L, yc + d[1] * L, 0], d }]);
    },

    /** Bouchon ORB à tête six-pans (FA01279). */
    orbPlug(dash) {
      const zinc = [], rub = [];
      portEnd('orb', dash, zinc, rub, false);
      const af = JIC[dash].hex * IN;
      zinc.push(hexY(af, 0, af * 0.42));
      return finish(zinc, rub, []);
    },

    /** Bouchon NPT à tête six-pans (FA01214, bouchon trempé). */
    nptPlugHex(dash) {
      const P = NPT[dash], af = P.hex * IN * 0.9;
      return finish([nptStud(P.t), hexY(af, 0, af * 0.5)], [], []);
    },

    /** Bouchon NPT à tête carrée (FA16028). */
    nptPlugSquare(dash) {
      const P = NPT[dash], a = P.t * IN * 0.8;
      return finish([nptStud(P.t), lathe([[0, 0], [a / Math.SQRT2, 0], [a / Math.SQRT2, a * 0.9], [0, a * 0.9]], 'zinc', { seg: 4 })], [], []);
    },

    /** Bouchon NPT conique à six-pans creux, affleurant (FA01215). */
    nptPlugFlush(dash) {
      const r = (NPT[dash].t * IN) / 2, s = (r * 0.45) / COS30;
      const body = lathe([[0, -r * 1.3], [r * 0.84, -r * 1.3], [r, 0.001], [s, 0.001], [s, -r * 0.5], [0, -r * 0.5]], 'zinc', { seg: 6 });
      return finish([body], [], []);
    },

    /** Mamelon six-pans NPT → NPT (FA01207) : queue pd dans l'orifice, mâle ud en haut. */
    hexNipple(pd, ud = pd) {
      const P = NPT[pd], U = NPT[ud];
      const af = Math.max(P.hex, U.hex) * IN, h = af * 0.42;
      return finish([nptStud(P.t), hexY(af, 0, h), nptUp(U.t, h)], [], [{ p: [0, h + ((U.t * IN) / 2) * 1.3, 0], d: [0, 1, 0] }]);
    },

    /** Réduction mâle NPT pd / femelle NPT fd (FA01208, « pipe inc. & ext. connector »). */
    nptBushing(pd, fd) {
      const af = NPT[pd].hex * IN, h = af * 0.5, R = hexR(af);
      const r = (NPT[fd].t * IN) / 2;
      const head = lathe([[0, 0], [R, 0], [R, h], [r * 0.95, h], [r * 0.95, h * 0.25], [0, h * 0.25]], 'zinc', { seg: 6 });
      return finish([nptStud(NPT[pd].t), head], [], [{ p: [0, h, 0], d: [0, 1, 0], female: true }]);
    },

    /**
     * Écrou tournant femelle JIC fd posé sur un nez mâle (origine = bout du
     * nez), puis corps. kind : 'tee' (té de passage, FA01011 : mâle en haut et
     * branche vers +X), 'elbow' (coude, FA01009 : sortie vers +X), 'reducer'
     * (réduction, FA01010 : mâle jd en haut).
     */
    swivel({ kind, fd, jd = fd }) {
      const zinc = [];
      const F = JIC[fd], J = JIC[jd];
      const nL = noseLen(F.t);
      const nutH = nL * 1.05, y0 = -nL * 0.82;
      const r = (F.t * IN) / 2;
      zinc.push(hexY(F.nut * IN, y0, nutH));
      const yTop = y0 + nutH;
      if (kind === 'reducer') {
        const af = J.hex * IN, h = af * 0.5;
        zinc.push(rodY(r * 0.8, yTop - 0.001, yTop + r * 0.25));
        zinc.push(hexY(af, yTop + r * 0.25, h));
        const y1 = yTop + r * 0.25 + h;
        zinc.push(jicNose(J.t, y1));
        return finish(zinc, [], [{ p: [0, y1 + noseLen(J.t), 0], d: [0, 1, 0] }]);
      }
      const rb = r;
      const yc = yTop + rb * 1.3;
      zinc.push(knuckle(rb, yc, yTop - 0.001));
      const ports = [];
      const lo = rb * 0.95;
      const br = group(sleeve(rb * 0.85, 0, lo), jicNose(J.t, lo));
      br.position.set(0, yc, 0);
      br.rotation.z = -Math.PI / 2;
      zinc.push(br);
      if (kind === 'tee') {
        zinc.push(sleeve(rb * 0.85, yc, yc + lo), jicNose(F.t, yc + lo));
        ports.push({ p: [0, yc + lo + noseLen(F.t), 0], d: [0, 1, 0] });
      }
      ports.push({ p: [lo + noseLen(J.t), yc, 0], d: [1, 0, 0] });
      return finish(zinc, [], ports);
    },

    /** Adaptateur droit NPT pd → écrou tournant femelle JIC fd (FA01042) : entrée femelle en haut. */
    nptSwivel(pd, fd) {
      const P = NPT[pd], F = JIC[fd];
      const af = P.hex * IN, h = af * 0.4;
      const r = (F.t * IN) / 2, nutH = noseLen(F.t) * 1.05, R = hexR(F.nut * IN);
      const y1 = h + r * 0.5;
      const nutObj = lathe([[r * 0.9, y1], [R, y1], [R, y1 + nutH - 0.001], [R * 0.88, y1 + nutH], [r * 0.95, y1 + nutH], [r * 0.95, y1]], 'zinc', { seg: 6 });
      return finish([nptStud(P.t), hexY(af, 0, h), rodY(r * 0.8, h - 0.001, y1 + 0.001), nutObj], [], [{ p: [0, y1 + nutH, 0], d: [0, 1, 0], female: true }]);
    },
  };
}

/**
 * Bloc usiné (collecteur, corps de valve) W × H × D (X × Y × Z) centré à
 * l'origine, arêtes cassées ; chaque orifice est figuré par son lamage usiné
 * (anneau 'steel' affleurant) et son ouverture (disque sombre). ports :
 * [{ p: [x, y, z] sur une face, n: '+x' | '-x' | '+y' | '-y' | '+z' | '-z',
 * r (rayon de l'ouverture, m), spot (rayon du lamage, m, facultatif) }].
 */
export function racBlock(S, THREE, W, H, D, ports = [], { material = 'zinc', seg = 10 } = {}) {
  const { box, lathe, merged, group } = S;
  const ROT = {
    '+y': [0, 0, 0], '-y': [Math.PI, 0, 0], '+x': [0, 0, -Math.PI / 2], '-x': [0, 0, Math.PI / 2], '+z': [Math.PI / 2, 0, 0], '-z': [-Math.PI / 2, 0, 0],
  };
  const holes = [], spots = [];
  for (const pt of ports) {
    const e = 0.0003;
    const h = lathe([[pt.r, e], [0, e]], 'blackOxide', { seg });
    h.rotation.set(...ROT[pt.n]);
    h.position.set(...pt.p);
    holes.push(h);
    if (pt.spot) {
      const s = lathe([[pt.spot, e * 0.6], [pt.r, e * 0.6]], 'steel', { seg });
      s.rotation.set(...ROT[pt.n]);
      s.position.set(...pt.p);
      spots.push(s);
    }
  }
  const g = group(box(W, H, D, material));
  if (holes.length) g.add(merged(holes, 'blackOxide'));
  if (spots.length) g.add(merged(spots, 'steel'));
  return g;
}

// ============================================================================
// Chenilles (P336, une chenille ; P338 réducteur ; P344 raccords des moteurs).
// Repère de P336 : origine au sol, sur l'axe de la chenille (milieu de la
// largeur des patins), au milieu de l'entraxe barbotin / roue folle ; X vers
// l'avant, Y vers le haut, +Z vers l'intérieur de la machine (chenille droite).
// Repère machine (P328, P344) : origine au sol au milieu entre les chenilles,
// au milieu de leur longueur ; chenille droite (RH) centrée en z = −gauge/2,
// gauche (LH, P336 en miroir Z) en z = +gauge/2.
// Cotes estimées d'après la vue de côté et la vue arrière de la page 330
// (échelle : traverse arrière = largeur du châssis 39 po), et la page 336.
// ============================================================================
export const TRACK = {
  gauge: 1.2, // voie : entraxe des deux chenilles (m)
  shoeW: 0.3, // largeur des patins
  pitch: 4.504 / 35, // pas de la chaîne (35 maillons)
  sprocketX: -0.78, idlerX: 0.78, // axes du barbotin (arrière) et de la roue folle
  axleY: 0.292, // hauteur des deux axes
  pinR: 0.217, // rayon primitif (axes de chaîne) au barbotin et à la roue folle
  frameTop: 0.465, // dessus du châssis de chenille (appui du châssis porteur)
  padZ: [0.1, 0.16], // console d'appui côté intérieur (z de P336)
  length: 2.14, // longueur hors tout
  height: 0.67, // hauteur hors tout (dessus du brin supérieur sur le galet porteur)
  gbxZ: 0.09, // face d'appui de la bride du réducteur P338 (z de P336)
};

/**
 * Point [x, y, z] de P338 → repère de P336 : le réducteur est tourné de 180°
 * autour de Y (son +Z, l'extérieur, devient −Z) et sa face d'appui posée en
 * z = TRACK.gbxZ, axe sur celui du barbotin.
 */
export const gbxToTrack = ([x, y, z]) => [TRACK.sprocketX - x, TRACK.axleY + y, TRACK.gbxZ - z];
export const gbxDirToTrack = ([x, y, z]) => [-x, y, -z];
/** Point de P336 → repère machine, chenille 'R' (droite) ou 'L' (gauche, miroir). */
export const trackToMachine = ([x, y, z], side = 'R') => (side === 'R' ? [x, y, z - TRACK.gauge / 2] : [x, y, TRACK.gauge / 2 - z]);
export const trackDirToMachine = ([x, y, z], side = 'R') => (side === 'R' ? [x, y, z] : [x, y, -z]);
