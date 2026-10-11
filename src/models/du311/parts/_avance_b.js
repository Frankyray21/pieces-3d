// Fonctions communes du groupe « avance-b » (déflecteur P036, bras de tige
// P070, centreur fendu P092, collecteur P126, mâchoires P146) : quincaillerie
// en pouces (vis, écrous, rondelles), raccords hydrauliques JIC / ORB,
// bouchons, rotules, circlips. Fichier préfixé « _ » : non inscrit comme
// assemblage. Toutes les pièces sont construites le long de +Y local
// (voir chaque fonction) ; on les place ensuite avec at() / orient().
// Cotes en pouces converties en mètres ; quincaillerie Gr 8 zinguée
// (« ZNC ») en 'zinc', vis CHC (« A574 BLK ») en 'blackOxide'.

export const IN = 0.0254;
export const u = (v) => v * IN;

/** Profil de révolution en pouces [r, y] → lathe en mètres. */
export function L(S, pts, mat = 'steel', seg = 24, opts = {}) {
  return S.lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
}

/** Objet orienté : son +Y local amené sur la direction dir, placé en pos (m). */
export function along(THREE, obj, dir, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
  g.position.set(...pos);
  return g;
}

// Surplats usuels (po) des têtes H et écrous : d → surplat.
const AF = { 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.5: 0.75, 0.625: 0.9375, 0.75: 1.125, 0.875: 1.3125, 1.0: 1.5 };
const af = (d) => AF[d] ?? d * 1.5;

/** Prisme hexagonal (surplat a, hauteur h, po) chanfreiné à 30° aux deux faces, percé r0 (po), de y0 à y0 + h. */
export function hexPrism(S, THREE, a, h, y0, r0, mat) {
  const R = a / 2 / Math.cos(Math.PI / 6);
  // Chanfrein 30° du dessus seulement (le dessous porte sur sa face d'appui :
  // une facette tournée vers le bas renverrait le ciel en reflet blanc).
  const c = Math.min(a * 0.05, h * 0.25);
  const side = [[R, y0], [R, y0 + h - c], [R - c * 1.7, y0 + h]];
  const m = L(S, r0 > 0 ? [[r0, y0], ...side, [r0, y0 + h], [r0, y0]] : [[0, y0], ...side, [0, y0 + h]], mat, 6);
  m.children[0].rotation.y = Math.PI / 6;
  return m;
}

/**
 * Vis à tête hexagonale (HHCS) d × len (po) : tête vers +Y, dessous de tête à
 * y = 0, tige vers -Y ; rondelle plate optionnelle (washer : épaisseur po)
 * sous la tête, la tête étant alors relevée. Filets suggérés.
 */
export function hhcs(S, THREE, d, len, { mat = 'zinc', washer = 0, washerOD } = {}) {
  const r = d / 2, a = af(d), hh = d * 0.62;
  const y0 = washer;
  const g = [];
  g.push(hexPrism(S, THREE, a, hh, y0 + 0.02 * d, 0, mat));
  g.push(L(S, [[0, y0], [a * 0.48, y0], [a * 0.48, y0 + 0.03 * d], [0, y0 + 0.03 * d]], mat, 20));
  const th = Math.min(len, Math.max(d * 2 + 0.25, len * 0.5));
  g.push(L(S, [[0, -len], [r * 0.8, -len], ...S.thread(r, -len + r * 0.2, -len + th, { pitch: d * 0.15, maxTurns: 6 }), [r, y0], [0, y0]], mat, 14));
  if (washer) g.push(L(S, [[r * 1.08, 0], [(washerOD ?? d * 2.1) / 2, 0], [(washerOD ?? d * 2.1) / 2, washer], [r * 1.08, washer], [r * 1.08, 0]], mat, 24));
  return S.merged(g, mat);
}

/** Vis CHC (SHCS) d × len (po), six-pans creux : tête vers +Y (dessous à y = 0). */
export function shcs(S, THREE, d, len, { mat = 'blackOxide' } = {}) {
  const r = d / 2, R = d * 0.75, H = d, hx = (d * 0.5) / Math.cos(Math.PI / 6) / 2 * 1.0;
  const head = L(S, [[0, H * 0.55], [hx, H * 0.55], [hx, H], [R - d * 0.06, H], [R, H - d * 0.06], [R, d * 0.04], [R - d * 0.04, 0], [0, 0]].reverse(), mat, 24);
  const sock = L(S, [[0, H * 0.55], [hx, H * 0.55], [hx, H], [0, H]].reverse(), mat, 6);
  const th = Math.min(len, Math.max(d * 2 + 0.25, len * 0.5));
  const shank = L(S, [[0, -len], [r * 0.8, -len], ...S.thread(r, -len + r * 0.2, -len + th, { pitch: d * 0.15, maxTurns: 6 }), [r, 0], [0, 0]], mat, 14);
  return S.merged([head, sock, shank], mat);
}

/** Vis à tête fraisée CHC (FHCS) d × len (po), dessus de tête à y = 0, tige vers -Y. */
export function fhcs(S, THREE, d, len, { mat = 'blackOxide' } = {}) {
  const r = d / 2, R = d, hk = (R - r) / Math.tan((41 * Math.PI) / 180), hx = d * 0.32 / Math.cos(Math.PI / 6);
  return S.merged([
    L(S, [[0, -len], [r * 0.8, -len], ...S.thread(r, -len + r * 0.2, -hk - d * 0.2, { pitch: d * 0.15, maxTurns: 8 }), [r, -hk], [R, 0], [hx, 0], [hx, -d * 0.35], [0, -d * 0.45]], mat, 20),
  ], mat);
}

/** Vis sans tête à six-pans creux (set screw) d × len (po), bout cuvette en -Y, dessus à y = 0. */
export function setScrew(S, THREE, d, len, { mat = 'blackOxide' } = {}) {
  const r = d / 2, hx = d * 0.25 / Math.cos(Math.PI / 6);
  return S.merged([
    L(S, [[0, -len + d * 0.05], [r * 0.35, -len], [r * 0.62, -len], [r * 0.78, -len + d * 0.12], ...S.thread(r, -len + d * 0.15, -d * 0.08, { pitch: d * 0.16, maxTurns: 8 }), [r * 0.85, 0], [hx, 0], [hx, -d * 0.4], [0, -d * 0.5]], mat, 16),
  ], mat);
}

/** Vis carrée à bout pointu (SQSS) d × len (po) : tête carrée vers +Y, dessous à y = 0. */
export function sqss(S, THREE, d, len, { mat = 'steel' } = {}) {
  const r = d / 2, a = d, h = d * 0.75;
  const head = S.box(u(a), u(h), u(a), mat, { r: u(d * 0.05) });
  head.position.y = u(h / 2);
  return S.merged([head,
    L(S, [[0, -len], [r * 0.5, -len + r * 0.4], ...S.thread(r, -len + r * 0.6, 0, { pitch: d * 0.15, maxTurns: 12 }), [r, 0], [0, 0]], mat, 14)], mat);
}

/** Écrou H (d po) : hauteur 7/8 d (jam : 5/8 d), de y = 0 à h, axe Y. */
export function hexNut(S, THREE, d, { mat = 'zinc', jam = false } = {}) {
  const h = d * (jam ? 0.6 : 0.875);
  return hexPrism(S, THREE, af(d), h, 0, d * 0.45, mat);
}

/** Écrou à freinage nylon (d po) : corps six-pans puis collerette sertie et bague nylon (blanc) vers +Y, de y = 0 à h. */
export function nylocNut(S, THREE, d, { mat = 'zinc' } = {}) {
  const a = af(d), h1 = d * 0.7, h = d * 1.05;
  const g = new THREE.Group();
  g.add(S.merged([
    hexPrism(S, THREE, a, h1, 0, d * 0.43, mat),
    L(S, [[d * 0.43, h1], [a * 0.47, h1], [a * 0.45, h - d * 0.06], [a * 0.38, h], [d * 0.43, h], [d * 0.43, h1]], mat, 20),
  ], mat));
  g.add(L(S, [[d * 0.42, h1 + d * 0.02], [a * 0.37, h1 + d * 0.02], [a * 0.37, h - d * 0.02], [d * 0.42, h - d * 0.02], [d * 0.42, h1 + d * 0.02]], 'white', 20));
  return g;
}

/** Joint torique léger (lathe de 20 segments) : rayon moyen r, section cs (po), plan XZ à y (po). */
export function oring(S, r, cs, y = 0, mat = 'rubber') {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 6;
    pts.push([r + cs * Math.cos(a), y + cs * Math.sin(a)]);
  }
  return L(S, pts, mat, 20);
}

/** Rondelle plate SAE (d po) : de y = 0 à t, axe Y. */
export function flatWasher(S, THREE, d, { mat = 'zinc', od, t } = {}) {
  const ro = (od ?? (d <= 0.5 ? d * 2.1 : d * 1.95)) / 2, th = t ?? Math.max(0.065, d * 0.13);
  return L(S, [[d * 0.53, 0], [ro, 0], [ro, th], [d * 0.53, th], [d * 0.53, 0]], mat, 28);
}

/** Rondelle fendue (Grower, d po) : coupure en biais, de y = 0 à t. */
export function splitWasher(S, THREE, d, { mat = 'zinc' } = {}) {
  const ro = u(d * 0.9), ri = u(d * 0.53), t = u(Math.max(0.06, d * 0.25));
  return S.slotted(ro, ri, 0, t, [{ a: 0, w: 0.09, y0: 0, y1: t }], mat, { seg: 32 });
}

/** Rondelles autobloquantes à coins (Nord-Lock, paire, d po) : deux disques à rampes radiales, de y = 0 à 2t. */
export function nordLock(S, THREE, d, { mat = 'zinc' } = {}) {
  const ro = d * 0.9, ri = d * 0.53, t = Math.max(0.05, d * 0.11);
  const g = [L(S, [[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]], mat, 24), L(S, [[ri, t + 0.004], [ro, t + 0.004], [ro, 2 * t], [ri, 2 * t], [ri, t + 0.004]], mat, 24)];
  // Rampes : petites dents radiales sur les faces extérieures.
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    for (const [y, s] of [[0, -1], [2 * t, 1]]) {
      const b = S.box(u(ro - ri), u(0.012), u(0.035), mat);
      b.position.set(u((ro + ri) / 2) * Math.cos(a), u(y + s * 0.006), -u((ro + ri) / 2) * Math.sin(a));
      b.rotation.y = a;
      g.push(b);
    }
  }
  return S.merged(g, mat);
}

/**
 * Raccord droit ORB mâle → JIC mâle (FA01055-xx / FA01033) le long de +Y :
 * filet ORB (ou NPT conique si npt) sous y = 0 avec joint torique, six-pans
 * à y = 0, nez JIC 37° vers +Y. dash : taille (-04 = 1/4 po, -06 = 3/8 po).
 */
export function jicAdapter(S, THREE, dash = 6, { npt = false, mat = 'zinc', jicDash } = {}) {
  const jd = jicDash ?? dash;
  const rj = { 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531, 16: 0.656 }[jd] ?? jd / 32;
  const ro = { 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531 }[dash] ?? dash / 32;
  const a = Math.max(rj, ro) * 2 * 1.25 + 0.06;
  const hh = a * 0.42;
  const g = [hexPrism(S, THREE, a, hh, 0, 0, mat)];
  // Nez JIC : gorge, filet, cône 37°.
  g.push(L(S, [[0, hh], [rj * 0.8, hh], [rj * 0.8, hh + 0.08], ...S.thread(rj, hh + 0.08, hh + rj * 1.6, { pitch: 0.06, maxTurns: 6, chamferBottom: false }), [rj * 0.72, hh + rj * 2.0], [rj * 0.45, hh + rj * 2.0], [0, hh + rj * 2.0]], mat, 16));
  // Queue : ORB (filet droit + torique) ou NPT conique.
  if (npt) g.push(L(S, [[0, -ro * 1.9], ...S.thread(ro * 0.95, -ro * 1.9, -0.02, { r1: ro * 1.08, pitch: 0.055, maxTurns: 7 }), [ro, 0], [0, 0]], mat, 16));
  else g.push(L(S, [[0, -ro * 1.6], ...S.thread(ro, -ro * 1.6, -0.12, { pitch: 0.055, maxTurns: 6 }), [ro * 0.9, -0.12], [ro * 0.9, 0], [0, 0]], mat, 16));
  const obj = new THREE.Group();
  obj.add(S.merged(g, mat));
  if (!npt) obj.add(oring(S, ro * 0.98, 0.035, -0.07));
  return obj;
}

/**
 * Coude 90° (FA01052 ORB → JIC, FA01009 / FA01217 tournant) : queue (ORB ou
 * écrou tournant JIC femelle) selon -Y sous y = 0, corps forgé coudé, nez JIC
 * vers +X. swivel : écrou tournant à la place de la queue filetée.
 */
export function jicElbow(S, THREE, dash = 6, { swivel = false, mat = 'zinc', tee = false } = {}) {
  const rj = { 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531, 16: 0.656 }[dash] ?? dash / 32;
  const a = rj * 2 * 1.25 + 0.06;
  const B = rj * 2.0; // demi-longueur du corps
  const g = [];
  // Corps : bloc arrondi à l'angle.
  g.push(L(S, [[0, 0], [a * 0.5, 0], [a * 0.5, B], [a * 0.42, B + a * 0.2], [0, B + a * 0.2]], mat, 20));
  const arm = L(S, [[0, 0], [a * 0.45, 0], [a * 0.45, B], [0, B]], mat, 20, { axis: 'x' });
  arm.position.y = u(B * 0.62);
  g.push(arm);
  // Nez JIC vers +X.
  const nose = L(S, [[0, B], [rj * 0.8, B], ...S.thread(rj, B + 0.06, B + rj * 1.6, { pitch: 0.06, maxTurns: 6, chamferBottom: false }), [rj * 0.72, B + rj * 2.0], [0, B + rj * 2.0]], mat, 16, { axis: 'x' });
  nose.position.y = u(B * 0.62);
  g.push(nose);
  if (tee) {
    const n2 = L(S, [[0, B], [rj * 0.8, B], ...S.thread(rj, B + 0.06, B + rj * 1.6, { pitch: 0.06, maxTurns: 6, chamferBottom: false }), [rj * 0.72, B + rj * 2.0], [0, B + rj * 2.0]], mat, 16, { axis: '-x' });
    n2.position.y = u(B * 0.62);
    g.push(n2);
    const arm2 = L(S, [[0, 0], [a * 0.45, 0], [a * 0.45, B], [0, B]], mat, 20, { axis: '-x' });
    arm2.position.y = u(B * 0.62);
    g.push(arm2);
  }
  if (swivel) {
    // Écrou tournant JIC femelle : six-pans sur -Y.
    g.push(hexPrism(S, THREE, a + 0.12, rj * 1.8, -rj * 1.8, rj * 0.7, mat));
  } else {
    g.push(hexPrism(S, THREE, a, a * 0.35, -a * 0.35, 0, mat));
    g.push(L(S, [[0, -rj * 1.6 - a * 0.35], ...S.thread(rj, -rj * 1.6 - a * 0.35, -a * 0.35 - 0.1, { pitch: 0.055, maxTurns: 6 }), [rj * 0.9, -a * 0.35], [0, -a * 0.35]], mat, 16));
  }
  return S.merged(g, mat);
}

/** Bouchon ORB à six-pans creux et joint torique (FA01280 / CP002891), tête de y = 0 à +Y, queue filetée vers -Y. */
export function orbPlug(S, THREE, dash = 4, { mat = 'zinc' } = {}) {
  const r = { 4: 0.2185, 6: 0.281, 8: 0.375 }[dash] ?? dash / 32;
  const R = r * 1.45, h = r * 0.6, hx = r * 0.55 / Math.cos(Math.PI / 6);
  const g = new THREE.Group();
  g.add(S.merged([
    L(S, [[hx, h * 0.3], [hx, h], [R - 0.02, h], [R, h - 0.02], [R, 0.02], [R - 0.02, 0], [0, 0], [0, h * 0.3]].reverse(), mat, 24),
    L(S, [[0, h * 0.3], [hx, h * 0.3], [hx, h], [0, h]].reverse(), mat, 6),
    L(S, [[0, -r * 1.4], ...S.thread(r, -r * 1.4, -0.1, { pitch: 0.05, maxTurns: 5 }), [r * 0.9, 0], [0, 0]], mat, 14),
  ], mat));
  g.add(oring(S, r, 0.035, -0.05));
  return g;
}

/**
 * Rotule (roulement sphérique) le long de Y, centrée : bague extérieure
 * (rOut, largeur w) et rotule chromée à alésage rIn, débordant de la bague (po).
 */
export function sphericalBearing(S, THREE, rOut, rIn, w, { mat = 'steel' } = {}) {
  const g = new THREE.Group();
  const rb = rOut * 0.78; // rayon de la sphère
  const wb = w * 1.25 / 2;
  g.add(L(S, [[rb * 0.92, -w / 2], [rOut, -w / 2], [rOut, w / 2], [rb * 0.92, w / 2], [rb * 0.92, -w / 2]], mat, 32));
  const prof = [];
  const a0 = Math.asin(Math.min(0.99, wb / rb));
  for (let i = 0; i <= 10; i++) {
    const a = -a0 + (2 * a0 * i) / 10;
    prof.push([rb * Math.cos(a), rb * Math.sin(a)]);
  }
  g.add(L(S, [[rIn, -wb], ...prof, [rIn, wb], [rIn, -wb]], 'chrome', 32));
  return g;
}

/** Anneau élastique d'arrêt (circlip intérieur), rayon r (po), plan XZ, oreilles percées. */
export function circlip(S, THREE, r, { mat = 'blackOxide', t = 0.05, w } = {}) {
  const ww = w ?? Math.max(0.08, r * 0.09);
  const gap = 0.35 / r * 0.4;
  const ring = S.slotted(u(r), u(r - ww), -u(t / 2), u(t / 2), [{ a: 0, w: gap, y0: -u(t), y1: u(t) }], mat, { seg: 40 });
  const ears = [];
  for (const s of [-1, 1]) {
    const a = s * (gap / 2 + 0.09);
    const e = S.cyl(u(ww * 1.2), u(t), mat, { seg: 12 });
    e.position.set(u(r - ww * 1.4) * Math.sin(a), 0, u(r - ww * 1.4) * Math.cos(a));
    ears.push(e);
  }
  return S.merged([ring, ...ears], mat);
}

/** Graisseur droit 1/4-28 le long de +Y (six-pans de y = 0, bille au bout). */
export function greaseNipple(S, THREE, { mat = 'brass' } = {}) {
  return S.merged([
    L(S, [[0, -0.22], [0.12, -0.22], [0.12, 0], [0, 0]], mat, 10),
    hexPrism(S, THREE, 0.3125, 0.16, 0, 0, mat),
    L(S, [[0, 0.16], [0.09, 0.16], [0.09, 0.3], [0.13, 0.33], [0.13, 0.4], [0.07, 0.45], [0, 0.45]], mat, 14),
  ], mat);
}

/** Bague lisse (douille) rOut × rIn × len (po), le long de Y, centrée, chanfreins aux deux bouts. */
export function bushing(S, THREE, ro, ri, len, mat = 'brass') {
  const c = Math.min(0.03, (ro - ri) * 0.3);
  return L(S, [[ri, -len / 2], [ro - c, -len / 2], [ro, -len / 2 + c], [ro, len / 2 - c], [ro - c, len / 2], [ri, len / 2], [ri + c, len / 2 - c], [ri, len / 2 - c * 1.2], [ri, -len / 2]], mat, 36);
}

/**
 * Axe lisse Ø d × len (po) le long de Y, centré : bouts chanfreinés, gorge
 * de circlip ou trou de goupille optionnels ; tête (collet soudé) en +Y si
 * head = { r, h } ; plaquette d'arrêt soudée si tab.
 */
export function pin(S, THREE, d, len, { mat = 'steel', head, grooves = [] } = {}) {
  const r = d / 2, c = Math.min(0.06, d * 0.06);
  const prof = [[0, -len / 2], [r - c, -len / 2], [r, -len / 2 + c]];
  for (const y of grooves) prof.push([r, y - 0.03], [r - 0.04, y - 0.03], [r - 0.04, y + 0.03], [r, y + 0.03]);
  if (head) prof.push([r, len / 2], [head.r - c, len / 2], [head.r, len / 2 + c], [head.r, len / 2 + head.h - c], [head.r - c, len / 2 + head.h], [0, len / 2 + head.h]);
  else prof.push([r, len / 2 - c], [r - c, len / 2], [0, len / 2]);
  return L(S, prof, mat, 28);
}
