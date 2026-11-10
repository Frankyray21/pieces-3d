// Coffre à outils de chantier (Machines Roger International) : modèle 3D d'après
// deux photos (coffre fermé, coffre ouvert). Aucun plan ni cote : toutes les
// dimensions sont estimées sur les photos. Le contenu du coffre (palan, seau,
// boyau, pièces) n'est pas modélisé.
// Repère : X largeur, Y vers le haut, +Z côté portes.

const W = 1.22, D = 0.91, H = 1.3; // hors tout (estimé : environ 48 × 36 × 51 po)
const Y0 = 0.1; // dessous de la caisse, posée sur les passages de fourche
const YK = 0.52; // haut du panneau avant droit, bas des portes
const ZT = -0.045; // arête avant du dessus
const T = 0.006; // tôle (peinte rouge dehors, blanc dedans)
const RUN = D / 2 - ZT, RISE = H - YK;
const TILT = Math.atan2(RUN, RISE); // inclinaison des portes par rapport à la verticale
const L = Math.hypot(RUN, RISE); // hauteur des portes le long de la pente
const WI = W - 2 * T - 0.004; // largeur intérieure utile
const ZB = -D / 2 + T; // face intérieure du fond arrière
const YA = 1.04, YB = 0.72; // tablettes du haut et du bas

/** Position en Z de la face inclinée à la hauteur y. */
const zs = (y) => D / 2 - ((y - YK) * RUN) / RISE;

/** Tôle à deux couches : rouge du côté de la normale n (axe 0-2, signe), blanc de l'autre. */
function panel(S, size, pos, axis, sign) {
  const out = [...size], inn = [...size], po = [...pos], pi = [...pos];
  out[axis] = inn[axis] = T / 2;
  for (let k = 0; k < 3; k++) if (k !== axis) inn[k] -= 2 * T;
  po[axis] += (sign * T) / 4;
  pi[axis] -= (sign * T) / 4;
  return [S.box(...out, 'red', { pos: po }), S.box(...inn, 'white', { pos: pi })];
}

/** Tôle découpée dans le plan ZY (profil [z, y]), épaisseur selon X. */
function cheek(S, pts, t, material, x) {
  const m = S.extrude(pts, t, material);
  m.rotation.y = -Math.PI / 2;
  m.position.x = x;
  return m;
}

/** Caisse soudée : plancher, fond, côtés, dessus et panneau avant. */
function body(S) {
  const prof = [[-D / 2, Y0], [D / 2, Y0], [D / 2, YK], [ZT, H], [-D / 2, H]];
  const e = T; // retrait de la couche blanche
  const profIn = [[-D / 2 + e, Y0 + e], [D / 2 - e, Y0 + e], [D / 2 - e, YK], [ZT, H - e], [-D / 2 + e, H - e]];
  const g = S.group(
    ...panel(S, [W, T, D], [0, Y0 + T / 2, 0], 1, -1),
    ...panel(S, [W, H - Y0, T], [0, (H + Y0) / 2, -D / 2 + T / 2], 2, -1),
    ...panel(S, [W, T, ZT + D / 2], [0, H - T / 2, (ZT - D / 2) / 2], 1, 1),
    ...panel(S, [W, YK - Y0, T], [0, (YK + Y0) / 2, D / 2 - T / 2], 2, 1),
  );
  for (const s of [-1, 1]) {
    g.add(cheek(S, prof, T / 2, 'red', s * (W / 2 - T / 4)), cheek(S, profIn, T / 2, 'white', s * (W / 2 - (3 * T) / 4)));
  }
  return g;
}

/** Passage de fourche : tube rectangulaire sous la caisse, d'avant en arrière. */
function forkPocket(S) {
  const w = 0.2, h = Y0, t = 0.005, len = D - 0.02;
  return S.merged([
    S.box(w, t, len, 'red', { pos: [0, t / 2, 0] }), S.box(w, t, len, 'red', { pos: [0, h - t / 2, 0] }),
    S.box(t, h - 2 * t, len, 'red', { pos: [(w - t) / 2, h / 2, 0] }), S.box(t, h - 2 * t, len, 'red', { pos: [-(w - t) / 2, h / 2, 0] }),
  ], 'red');
}

/** Oreille de levage en plaque, debout sur le dessus. */
function liftLug(S) {
  const pts = [[-0.045, 0], [0.045, 0], [0.045, 0.06]];
  for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; pts.push([0.045 * Math.cos(a), 0.06 + 0.045 * Math.sin(a)]); }
  pts.push([-0.045, 0.06]);
  return S.extrude(pts, 0.012, 'red', { holes: [[0, 0.062, 0.02]] });
}

/** Repère d'une porte : origine au bas de sa ligne de charnières, Y le long de la pente, Z vers l'extérieur. */
function doorFrame(THREE, s, angle) {
  const m = new THREE.Matrix4().makeTranslation(0, YK, D / 2);
  m.multiply(new THREE.Matrix4().makeRotationX(-TILT));
  m.multiply(new THREE.Matrix4().makeTranslation((s * W) / 2, 0, 0));
  return m.multiply(new THREE.Matrix4().makeRotationY(s * angle));
}

const DW = W / 2 - 0.003; // largeur d'une porte

/** Porte : tôle rouge, blanche à l'intérieur ; la droite porte le couvre-joint. */
function door(S, s) {
  const x = (-s * DW) / 2;
  const g = S.group(
    S.box(DW, L, T / 2, 'red', { pos: [x, L / 2, (3 * T) / 4] }),
    S.box(DW - 0.004, L - 0.004, T / 2, 'white', { pos: [x, L / 2, T / 4] }),
  );
  if (s > 0) g.add(S.box(0.05, L - 0.02, 0.006, 'red', { pos: [-W / 2, L / 2, T + 0.003] }));
  return g;
}

/** Poignée en rond plié en U, pattes inclinées vers le centre du coffre. */
function handle(S, s) {
  const xa = -s * (W / 2 - 0.16), xb = -s * (W / 2 - 0.34), y1 = 0.44, y2 = 0.76, h = 0.085;
  return S.tube([[xa, y1, T], [xb, y1, h], [xb, y2, h], [xa, y2, T]], 0.009, 'red', { sharp: true, seg: 60, radial: 10 });
}

const LATCH_Y = 0.5;

/** Barre de verrouillage à plat, à cheval sur le joint des portes, et son pivot. */
function latchBar(S) {
  const z = T + 0.006 + 0.004;
  return S.group(
    S.box(0.24, 0.036, 0.008, 'red', { pos: [-W / 2, LATCH_Y, z] }),
    S.cyl(0.011, 0.012, 'red', { axis: 'z', pos: [-W / 2 + 0.07, LATCH_Y, z + 0.006], seg: 12 }),
  );
}

/** Oreille de cadenas : plaque percée, debout sur la porte. */
function padlockEar(S, s) {
  const m = S.extrude([[0, -0.028], [0.045, -0.028], [0.045, 0.028], [0, 0.028]], 0.006, 'red', { holes: [[0.028, 0, 0.008]] });
  m.rotation.y = -Math.PI / 2; // la plaque sort vers +Z
  return S.at(S.group(m), [-s * (W / 2 - 0.15), LATCH_Y, T]);
}

/** Charnière : gond et patte soudés au côté, patte de la porte (qui suit l'ouverture). */
function hinge(S, s, y, angle) {
  const leaf = S.group(S.box(0.06, 0.06, 0.005, 'red', { pos: [-s * 0.04, 0, T + 0.0025] }));
  leaf.rotation.y = s * angle;
  return S.at(S.group(
    S.cyl(0.011, 0.085, 'red', { pos: [s * 0.006, 0, 0.011], seg: 14 }),
    S.box(0.005, 0.07, 0.05, 'red', { pos: [s * 0.0025, 0, -0.022] }),
    leaf,
  ), [0, y, 0]);
}

/** Support à crochets, à l'intérieur de la porte gauche. */
function hookPlate(S) {
  const x0 = 0.3, y = 0.6;
  const g = S.group(S.box(0.26, 0.07, 0.003, 'white', { pos: [x0, y, -0.0015] }));
  for (let i = 0; i < 4; i++) {
    const x = x0 - 0.09 + i * 0.06;
    g.add(S.box(0.014, 0.004, 0.035, 'white', { pos: [x, y - 0.02, -0.0175] }), S.box(0.014, 0.022, 0.004, 'white', { pos: [x, y - 0.011, -0.035] }));
  }
  return g;
}

/** Tablette à cases : fond, rebord avant incliné comme les portes, séparateurs jusqu'à yTop. */
function shelf(S, y, yTop, lipH, fracs) {
  const zf = zs(y) - 0.022, t = 0.004;
  const g = S.group(S.box(WI, t, zf - ZB, 'white', { pos: [0, y - t / 2, (zf + ZB) / 2] }));
  const lip = S.box(WI, lipH, t, 'white');
  lip.rotation.x = -TILT;
  g.add(S.at(lip, [0, y + (lipH / 2) * Math.cos(TILT), zf - (lipH / 2) * Math.sin(TILT)]));
  const pts = [[ZB, y], [zf - 0.012, y], [zs(yTop) - 0.034, yTop], [ZB, yTop]];
  for (const f of fracs) g.add(cheek(S, pts, t, 'white', (f - 0.5) * WI));
  return g;
}

const DRAWER = { x: -0.1, w: 0.58, h: 0.1, d: 0.42, zf: 0.3 };

/** Tiroir suspendu sous la tablette du bas, avec poignée et loquet. */
function drawer(S) {
  const { w, h, d } = DRAWER, t = 0.003;
  const g = S.group(
    S.box(w, t, d, 'white', { pos: [0, t / 2, -d / 2] }),
    S.box(w, h, t, 'white', { pos: [0, h / 2, -t / 2] }),
    S.box(w, h - 0.01, t, 'white', { pos: [0, h / 2, -d + t / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [w / 2 - t / 2, h / 2, -d / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [-w / 2 + t / 2, h / 2, -d / 2] }),
    S.tube([[-0.075, h / 2, 0], [-0.075, h / 2, 0.035], [0.075, h / 2, 0.035], [0.075, h / 2, 0]], 0.006, 'white', { sharp: true, radial: 8 }),
    // Loquet à gauche de la façade.
    S.box(0.02, 0.05, 0.006, 'white', { pos: [-w / 2 + 0.03, h - 0.02, 0.003] }),
    S.cyl(0.006, 0.014, 'white', { axis: 'z', pos: [-w / 2 + 0.03, h - 0.005, 0.008], seg: 10 }),
  );
  return g;
}

/** Glissière du tiroir : cornière pendue sous la tablette. */
function slide(S, s) {
  const { h, d } = DRAWER, t = 0.004;
  return S.group(
    S.box(t, h + 0.012, d, 'white', { pos: [0, -(h + 0.012) / 2, 0] }),
    S.box(0.022, t, d, 'white', { pos: [-s * 0.011, -(h + 0.012) + t / 2, 0] }),
  );
}

/** Métal déployé : losanges en feuillards croisés, dans le plan XY, de 0 à w et de 0 à h. */
function expanded(S, w, h, pitch = 0.024) {
  const bars = [];
  for (const dir of [1, -1]) {
    for (let c = -h + pitch / 2; c < w; c += pitch) {
      const x0 = Math.max(c, 0), x1 = Math.min(w, c + h), len = (x1 - x0) * Math.SQRT2;
      if (len < 0.008) continue;
      const xm = (x0 + x1) / 2, ym = xm - c;
      const b = S.box(len, 0.003, 0.002, 'white', { pos: [dir > 0 ? xm : w - xm, ym, 0] });
      b.rotation.z = (dir * Math.PI) / 4;
      bars.push(b);
    }
  }
  return S.merged(bars, 'white');
}

/** Panier au bas à droite : caisson ouvert sur le dessus, bas en métal déployé. */
function basket(S) {
  const w = 0.2, d = 0.28, h = 0.4, band = 0.14, t = 0.003, hm = h - band;
  const g = S.group(
    S.box(w, t, d, 'white', { pos: [0, t / 2, 0] }),
    // Bandeau plein du haut (quatre faces).
    S.box(w, band, t, 'white', { pos: [0, h - band / 2, d / 2] }), S.box(w, band, t, 'white', { pos: [0, h - band / 2, -d / 2] }),
    S.box(t, band, d, 'white', { pos: [-w / 2, h - band / 2, 0] }), S.box(t, band, d, 'white', { pos: [w / 2, h - band / 2, 0] }),
  );
  // Montants d'angle.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(S.box(0.02, hm, 0.02, 'white', { pos: [sx * (w / 2 - 0.01), hm / 2, sz * (d / 2 - 0.01)] }));
  g.add(S.at(expanded(S, w, hm), [-w / 2, 0, d / 2]));
  const side = expanded(S, d, hm);
  side.rotation.y = Math.PI / 2;
  g.add(S.at(side, [-w / 2, 0, d / 2]));
  return g;
}

/** Autocollant du panneau avant (emplacement et proportions ; sans le lettrage). */
function decal(S) {
  return S.group(
    S.box(0.4, 0.2, 0.001, 'lightGrey', { r: 0.02, pos: [0, 0, 0.0005] }),
    S.box(0.36, 0.105, 0.0006, 'charcoal', { pos: [0, 0, 0.0013] }),
    S.cyl(0.024, 0.0006, 'red', { axis: 'z', pos: [-0.085, 0, 0.0019], seg: 24 }),
  );
}

/** Coffre complet ; open : angle d'ouverture des portes [gauche, droite] en radians. */
function build(api, open) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  const n = [0, Math.sin(TILT), Math.cos(TILT)]; // normale des portes
  const out = (k, dx = 0) => [dx, n[1] * k, n[2] * k];
  /** Pièce posée dans le repère d'une porte. */
  const onDoor = (obj, s, angle) => {
    const g = S.group(obj);
    g.applyMatrix4(doorFrame(api.THREE, s, angle));
    return g;
  };

  put('1', body(S), [0, 0, 0]);
  for (const s of [-1, 1]) put('2', S.at(forkPocket(S), [s * 0.33, 0, 0]), [0, -0.3, 0]);
  for (const sx of [-1, 1]) for (const z of [ZT - 0.03, -D / 2 + 0.03]) put('3', S.at(liftLug(S), [sx * (W / 2 - 0.06), H, z]), [0, 0.3, 0]);

  for (const s of [-1, 1]) {
    const a = open[s < 0 ? 0 : 1];
    const side = s * (0.35 + 0.25 * Math.sin(a));
    put(s < 0 ? '4' : '5', onDoor(door(S, s), s, a), out(0.55, side));
    put('7', onDoor(handle(S, s), s, a), out(0.85, side));
    put('9', onDoor(padlockEar(S, s), s, a), out(0.7, side));
    for (const y of [0.15, L - 0.15]) put('6', onDoor(hinge(S, s, y, a), s, 0), [s * 0.3, 0, 0]);
    if (s > 0) put('8', onDoor(latchBar(S), s, a), out(1.0, side));
    else put('15', onDoor(hookPlate(S), s, a), out(0.3, side));
  }

  put('10', shelf(S, YA, H - T, 0.07, [0.3, 0.64]), [0, 0.25, 1.0]);
  put('11', shelf(S, YB, YA - 0.004, 0.085, [0.32, 0.65]), [0, 0.05, 1.25]);
  put('12', S.at(drawer(S), [DRAWER.x, YB - 0.004 - DRAWER.h - 0.006, DRAWER.zf]), [0, -0.1, 1.7]);
  for (const s of [-1, 1]) {
    put('13', S.at(slide(S, s), [DRAWER.x + s * (DRAWER.w / 2 + 0.004), YB - 0.004, DRAWER.zf - DRAWER.d / 2]), [s * 0.12, -0.1, 1.25]);
  }
  put('14', S.at(basket(S), [W / 2 - T - 0.105, Y0 + T, D / 2 - T - 0.15]), [0.25, 0.2, 1.1]);
  put('16', S.at(decal(S), [-0.1, Y0 + (YK - Y0) * 0.42, D / 2]), [0, 0, 0.3]);
}

/** Coffre fermé (photo 1). */
function P01(api) {
  build(api, [0, 0]);
  return { view: { dir: [0.75, 0.5, 1.25] } };
}

/** Coffre ouvert : rangement intérieur (photo 2). */
function P02(api) {
  build(api, [1.95, 1.7]);
  return { view: { dir: [0.35, 0.45, 1.3] } };
}

export default { P01, P02 };
