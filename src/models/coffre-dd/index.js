// Coffre à outils ITH (Machines Roger International) : modèle 3D d'après le
// dessin 087 « Coffre à outil ITH » (M.R.I. Inc., D. Côté, juin 2011) : plan de
// coupes des tôles, trois vues cotées et détails 1 à 3. L'épaisseur des tôles
// et les pentures ne sont pas détaillées sur le dessin (estimées). La peinture
// (rouge dehors, blanc dedans) et les ajouts du coffre ouvert (tiroir, panier,
// crochets, autocollant) viennent des photos ; le contenu n'est pas modélisé.
// Sur le dessus, à gauche : support de tube D-D du dessin 0102803 (P03) ; sa
// position et son orientation sur le coffre ne figurent sur aucun dessin.
// Repère : X largeur, Y vers le haut, +Z côté portes.

const IN = 0.0254;
const W = 48 * IN, D = 39.5 * IN; // largeur, profondeur (vue de côté)
const Y0 = 4 * IN; // dessous de la caisse, posée sur les tubes 4 × 4 × 1/4
const H = Y0 + 54 * IN; // dessus de la caisse (derrière de 54 po)
const YK = Y0 + 21 * IN; // haut du devant, bas des portes
const ZT = -D / 2 + 20 * IN; // arête avant du dessus (20 po)
const T = 0.125 * IN; // tôle : épaisseur non indiquée sur le dessin
const RUN = D / 2 - ZT, RISE = H - YK;
const TILT = Math.atan2(RUN, RISE); // inclinaison des portes par rapport à la verticale
const L = Math.hypot(RUN, RISE); // hauteur des portes le long de la pente (38 5/8 po sur le dessin)
const WI = W - 2 * T - 0.002; // largeur intérieure
const ZB = -D / 2 + T; // face intérieure du derrière
const SH_D = 16 * IN, LIP = 4 * IN, DIV_H = 12 * IN; // tablettes : fond, devant, divisions
const YA = H - DIV_H, YB = H - 2 * DIV_H; // dessus des tablettes du haut et du bas
const ROD = 0.375 * IN; // rayon de la tige de 3/4 po

/** Tôle à deux couches : rouge du côté de la normale (axe 0-2, signe), blanc de l'autre. */
function panel(S, size, pos, axis, sign) {
  const out = [...size], inn = [...size], po = [...pos], pi = [...pos];
  out[axis] = inn[axis] = T / 2;
  for (let k = 0; k < 3; k++) if (k !== axis) inn[k] -= 2 * T;
  po[axis] += (sign * T) / 4;
  pi[axis] -= (sign * T) / 4;
  return S.group(S.box(...out, 'red', { pos: po }), S.box(...inn, 'white', { pos: pi }));
}

/** Tôle découpée dans le plan ZY (profil [z, y]), épaisseur selon X. */
function cheek(S, pts, t, material, x, holes = []) {
  const m = S.extrude(pts, t, material, { holes });
  m.rotation.y = -Math.PI / 2;
  m.position.x = x;
  return m;
}

/** Côté : tôle de 40 × 54 po, coupée à 21 po au devant et à 20 po au dessus. */
function side(S, s) {
  const prof = [[-D / 2, Y0], [D / 2, Y0], [D / 2, YK], [ZT, H], [-D / 2, H]];
  const e = T;
  const profIn = [[-D / 2 + e, Y0 + e], [D / 2 - e, Y0 + e], [D / 2 - e, YK], [ZT, H - e], [-D / 2 + e, H - e]];
  return S.group(cheek(S, prof, T / 2, 'red', s * (W / 2 - T / 4)), cheek(S, profIn, T / 2, 'white', s * (W / 2 - (3 * T) / 4)));
}

/** Tube de base 4 × 4 × 1/4 po, bouts fermés, d'avant en arrière. */
function baseTube(S) {
  return S.box(Y0, Y0, D, 'red', { r: 0.009, pos: [0, Y0 / 2, 0] });
}

/** Oreille de levage (détail 1) : plaque de 6 × 4 po, rond de 3 1/2 po, trou de 2 1/2 po. */
function liftLug(S) {
  const r = 1.75 * IN, cy = 4 * IN - r, bx = 3 * IN;
  const d = Math.hypot(bx, cy), a0 = Math.atan2(-cy, bx) + Math.acos(r / d);
  const pts = [[-bx, 0], [bx, 0]];
  for (let i = 0; i <= 16; i++) { const a = a0 + (i / 16) * (Math.PI - 2 * a0); pts.push([r * Math.cos(a), cy + r * Math.sin(a)]); }
  return cheek(S, pts, 0.375 * IN, 'red', 0, [[0, cy, 1.25 * IN]]);
}

/** Tige pliée en U : pattes en a = 0 et a = len, hauteur h, coins arrondis ; map place le point (a, b) du profil. */
function uRod(S, len, h, map, material = 'red') {
  const rc = 1 * IN, pts = [[0, 0]];
  for (let i = 0; i <= 6; i++) { const a = Math.PI - (i / 6) * (Math.PI / 2); pts.push([rc + rc * Math.cos(a), h - rc + rc * Math.sin(a)]); }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 - (i / 6) * (Math.PI / 2); pts.push([len - rc + rc * Math.cos(a), h - rc + rc * Math.sin(a)]); }
  pts.push([len, 0]);
  return S.tube(pts.map(([a, b]) => map(a, b)), ROD, material, { sharp: true, seg: 90, radial: 12 });
}

/** Repère d'une porte : origine au bas de sa ligne de pentures, Y le long de la pente, Z vers l'extérieur. */
function doorFrame(THREE, s, angle) {
  const m = new THREE.Matrix4().makeTranslation(0, YK, D / 2);
  m.multiply(new THREE.Matrix4().makeRotationX(-TILT));
  m.multiply(new THREE.Matrix4().makeTranslation((s * W) / 2, 0, 0));
  return m.multiply(new THREE.Matrix4().makeRotationY(s * angle));
}

const DW = W / 2 - 0.0015; // largeur d'une porte (24 po, jeu au joint)

/** Porte : tôle de 24 × 39 po. */
function door(S, s) {
  const x = (-s * DW) / 2;
  return S.group(
    S.box(DW, L, T / 2, 'red', { pos: [x, L / 2, (3 * T) / 4] }),
    S.box(DW - 0.004, L - 0.004, T / 2, 'white', { pos: [x, L / 2, T / 4] }),
  );
}

/** Poignée de porte (détail 2) : tige de 3/4 po, 12 × 4 po, à 3 po du joint et à 12 po du bas. */
function handle(S, s) {
  // Longueur le long de la pente, pattes vers l'extérieur.
  return S.at(S.group(uRod(S, 12 * IN, 4 * IN, (a, b) => [0, a, b])), [-s * (W / 2 - 3 * IN), 12 * IN, T]);
}

const BAR_Y = L - 12 * IN, BAR_T = 0.375 * IN; // barre du détail 3, à 12 po du haut des portes

/** Barre de verrouillage (détail 3) : plat de 13 × 1 1/2 × 3/8 po à fente, poignée de 6 × 3 po. */
function latchBar(S) {
  const bar = S.plate(13 * IN, 1.5 * IN, BAR_T, 'red', { cutouts: [[2.5 * IN, 0, 6 * IN, 0.5 * IN]], r: 0.002 });
  bar.rotation.x = Math.PI / 2;
  const u = uRod(S, 6 * IN, 3 * IN, (a, b) => [a, 0, b]);
  return S.at(S.group(bar, S.at(u, [-0.5 * IN, 0, BAR_T / 2])), [W / 2, BAR_Y, T + BAR_T / 2]);
}

/** Plaque de 1/4 po percée à 3/8 po, debout sur la porte (repères 2 et 3 du détail 3). */
function pivotPlate(S, h, dy) {
  const a = 0.75 * IN;
  const m = S.extrude([[-a, 0], [a, 0], [a, h], [-a, h]], 0.25 * IN, 'red', { holes: [[0, h - a, 0.1875 * IN]] });
  m.rotation.x = Math.PI / 2; // la plaque sort vers +Z, épaisseur le long de la pente
  return S.at(S.group(m), [W / 2 - 5.75 * IN, BAR_Y + dy, T]);
}

/** Fer angle de 1/4 po, 2 × 2 po, aile de 3/4 po (repère 1 du détail 3), sous la barre à 3 po du joint. */
function angleRest(S) {
  const t = 0.25 * IN;
  return S.at(S.group(
    S.box(2 * IN, 2 * IN, t, 'red', { pos: [0, -1 * IN, t / 2] }),
    S.box(2 * IN, t, 0.75 * IN, 'red', { pos: [0, -t / 2, 0.375 * IN] }),
  ), [W / 2 - 3 * IN, BAR_Y - 0.75 * IN - 0.001, T]);
}

/** Penture : gond et patte soudés au côté, patte de la porte (qui suit l'ouverture). */
function hinge(S, s, y, angle) {
  const leaf = S.group(S.box(0.045, 0.07, 0.004, 'red', { pos: [-s * 0.03, 0, T + 0.002] }));
  leaf.rotation.y = s * angle;
  return S.at(S.group(
    S.cyl(0.011, 3 * IN, 'red', { pos: [s * 0.006, 0, 0.011], seg: 14 }),
    S.box(0.004, 0.07, 0.045, 'red', { pos: [s * 0.002, 0, -0.02] }),
    leaf,
  ), [0, y, 0]);
}

/** Support à crochets, à l'intérieur de la porte gauche (photo). */
function hookPlate(S) {
  const x0 = 0.3, y = 0.6;
  const g = S.group(S.box(0.26, 0.07, 0.003, 'white', { pos: [x0, y, -0.0015] }));
  for (let i = 0; i < 4; i++) {
    const x = x0 - 0.09 + i * 0.06;
    g.add(S.box(0.014, 0.004, 0.035, 'white', { pos: [x, y - 0.02, -0.0175] }), S.box(0.014, 0.022, 0.004, 'white', { pos: [x, y - 0.011, -0.035] }));
  }
  return g;
}

const DRAWER = { x: -0.1, w: 0.58, h: 0.1, d: 0.38, zf: ZB + SH_D };

/** Tiroir suspendu sous la tablette du bas, avec poignée et loquet (photo). */
function drawer(S) {
  const { w, h, d } = DRAWER, t = 0.003;
  return S.group(
    S.box(w, t, d, 'white', { pos: [0, t / 2, -d / 2] }),
    S.box(w, h, t, 'white', { pos: [0, h / 2, -t / 2] }),
    S.box(w, h - 0.01, t, 'white', { pos: [0, h / 2, -d + t / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [w / 2 - t / 2, h / 2, -d / 2] }),
    S.box(t, h - 0.01, d, 'white', { pos: [-w / 2 + t / 2, h / 2, -d / 2] }),
    S.tube([[-0.075, h / 2, 0], [-0.075, h / 2, 0.035], [0.075, h / 2, 0.035], [0.075, h / 2, 0]], 0.006, 'white', { sharp: true, radial: 8 }),
    S.box(0.02, 0.05, 0.006, 'white', { pos: [-w / 2 + 0.03, h - 0.02, 0.003] }),
    S.cyl(0.006, 0.014, 'white', { axis: 'z', pos: [-w / 2 + 0.03, h - 0.005, 0.008], seg: 10 }),
  );
}

/** Glissière du tiroir : cornière pendue sous la tablette (photo). */
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

/**
 * Support de tube D-D (dessin 0102803) : berceau en Y de 3/4 po, base de
 * 8 × 3 × 1/2 po à quatre trous, gousset de 1/2 po ; 17 1/2 po de haut.
 * Repère : plaque du berceau dans le plan XY, base posée en y = 0, gousset vers +Z.
 * Le rayon du berceau (4 po) et les trous de la base sont mesurés sur le dessin à l'échelle.
 */
function P03(api) {
  const S = api.S;
  const cy = 16.5, ro = 6, ri = 4, hw = 1.5, tb = 0.5, tp = 0.75;
  const pts = [[-hw, tb], [hw, tb]];
  const arc = (cx, r, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  const a = Math.asin(hw / ro); // raccord du montant de 3 po au rayon extérieur
  arc(0, ro, -Math.PI / 2 + a, 0, 20);
  arc(5, 1, 0, Math.PI, 10);
  arc(0, ri, 0, -Math.PI, 36);
  arc(-5, 1, 0, Math.PI, 10);
  arc(0, ro, Math.PI, Math.PI * 1.5 - a, 20);
  const zp = -1.5 + tp / 2; // la plaque affleure le bord arrière de la base
  const fork = S.at(S.extrude(pts.map(([x, y]) => [x * IN, y * IN]), tp * IN, 'red'), [0, 0, zp * IN]);
  const holes = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) holes.push([sx * 3.5 * IN, sz * 1 * IN, 0.28 * IN]);
  const base = S.at(S.plate(8 * IN, 3 * IN, tb * IN, 'red', { holes, r: 0.25 * IN }), [0, (tb / 2) * IN, 0]);
  const z0 = zp + tp / 2;
  const gusset = cheek(S, [[z0, tb], [1.5, tb], [1.5, tb + 0.1], [z0 + 0.25, 11.5], [z0, 11.5]].map(([z, y]) => [z * IN, y * IN]), 0.5 * IN, 'red', 0);
  api.part('1', fork, [0, 0.12, -0.2]);
  api.part('2', base, [0, -0.15, 0]);
  api.part('3', gusset, [0, 0.05, 0.25]);
  return { view: { dir: [0.9, 0.4, 1.2] } };
}

/**
 * Coffre complet. open : angle d'ouverture des portes [gauche, droite] en
 * radians ; extras : ajouts visibles sur la photo du coffre ouvert.
 */
function build(api, open, extras) {
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

  // Tôles du plan de coupes.
  put('1', panel(S, [W, H - Y0, T], [0, (H + Y0) / 2, -D / 2 + T / 2], 2, -1), [0, 0, -0.55]);
  put('2', panel(S, [W, T, D], [0, Y0 + T / 2, 0], 1, -1), [0, -0.3, 0]);
  for (const s of [-1, 1]) put('3', side(S, s), [s * 0.55, 0, 0]);
  put('4', panel(S, [W, T, ZT + D / 2], [0, H - T / 2, (ZT - D / 2) / 2], 1, 1), [0, 0.5, 0]);
  put('5', panel(S, [W, YK - Y0, T], [0, (YK + Y0) / 2, D / 2 - T / 2], 2, 1), [0, 0, 0.6]);

  // Tablettes : fond de 16 po, devant de 4 po, divisions de 16 × 12 po (cases de 16 po).
  const t = T / 2, zf = ZB + SH_D;
  for (const [k, y] of [[0, YA], [1, YB]]) {
    put('7', S.box(WI, t, SH_D, 'white', { pos: [0, y - t / 2, ZB + SH_D / 2] }), [0, k ? -0.12 : 0.02, 0.05]);
    put('8', S.box(WI, LIP, t, 'white', { pos: [0, y + LIP / 2, zf + t / 2] }), [0, k ? -0.12 : 0.02, 0.4]);
    for (const sx of [-1, 1]) {
      put('9', S.box(t, DIV_H - t - 0.001, SH_D, 'white', { pos: [sx * 8 * IN, y + (DIV_H - t) / 2, ZB + SH_D / 2] }), [0, k ? 0.02 : 0.16, 0.05]);
    }
  }

  for (const s of [-1, 1]) put('10', S.at(baseTube(S), [s * 18 * IN, 0, 0]), [0, -0.55, 0]);
  for (const s of [-1, 1]) put('12', S.at(liftLug(S), [s * (W / 2 - 0.1875 * IN), H, ZT - 3 * IN]), [0, 0.8, 0]);

  for (const s of [-1, 1]) {
    const a = open[s < 0 ? 0 : 1];
    const dx = s * (0.3 + 0.3 * Math.sin(a));
    put('6', onDoor(door(S, s), s, a), out(0.7, dx));
    put('13', onDoor(handle(S, s), s, a), out(1.0, dx));
    for (const y of [5 * IN, L - 5 * IN]) put('11', onDoor(hinge(S, s, y, a), s, 0), [s * 0.8, 0, 0]);
  }
  // Détail 3 : la barre pivote sur la porte gauche et se rabat sur la droite.
  const a = open[0], dx = -(0.3 + 0.3 * Math.sin(a));
  put('14', onDoor(latchBar(S), -1, a), out(1.3, dx));
  put('15', onDoor(angleRest(S), -1, a), out(0.95, dx));
  put('16', onDoor(pivotPlate(S, 1.5 * IN, 0.5 * IN), -1, a), out(1.15, dx - 0.12));
  put('17', onDoor(pivotPlate(S, 2 * IN, 0.75 * IN + 0.125 * IN + 0.001), -1, a), out(0.95, dx - 0.12));

  // Support de tube D-D sur le dessus, à gauche : berceau en travers du coffre
  // (tube couché dans la largeur), gousset vers le centre.
  const sup = api.sub('P03', { inPlace: true });
  sup.rotation.y = Math.PI / 2;
  put('23', S.at(sup, [-W / 2 + 3 * IN, H, -D / 2 + 8 * IN]), [-0.25, 0.9, 0]);

  put('18', S.at(decal(S), [-0.1, Y0 + (YK - Y0) * 0.42, D / 2]), [0, 0, 0.9]);
  if (!extras) return;
  put('19', S.at(drawer(S), [DRAWER.x, YB - t - DRAWER.h - 0.006, DRAWER.zf]), [0, -0.12, 0.9]);
  for (const s of [-1, 1]) {
    put('20', S.at(slide(S, s), [DRAWER.x + s * (DRAWER.w / 2 + 0.004), YB - t, DRAWER.zf - DRAWER.d / 2]), [s * 0.1, -0.12, 0.45]);
  }
  put('21', S.at(basket(S), [W / 2 - T - 0.105, Y0 + T, D / 2 - T - 0.15]), [0, 0.15, 1.2]);
  put('22', onDoor(hookPlate(S), -1, a), out(0.4, dx));
}

/** Coffre fermé, tôle par tôle (dessin 087). */
function P01(api) {
  build(api, [0, 0], false);
  return { view: { dir: [0.75, 0.5, 1.25] } };
}

/** Coffre ouvert : tablettes du dessin et ajouts visibles sur la photo. */
function P02(api) {
  build(api, [1.95, 1.7], true);
  return { view: { dir: [0.35, 0.45, 1.3] } };
}

export default { P01, P02, P03 };
