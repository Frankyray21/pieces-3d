// Outils communs du lot « cabine et réservoirs » du DU311 sur roues (P224,
// P226, P228, P234, P238, P278, P284, P286, P288, P290, P326, P328, P330) :
// cotes partagées (cabine, auvent, siège, réservoirs) et quincaillerie en
// pouces (vis H, CHC, écrous, rondelles, raccords JIC / ORB / NPT, traversées
// de cloison). Fichier préfixé « _ » : pas un assemblage.
//
// Repère machine (../layout.js) : origine au sol sous l'articulation, X vers
// l'avant, Y vers le haut, +Z à droite. Les cotes de la cabine viennent des
// vues de dessus des pages 12, 212, 282 (échelle : siège de 0,50 m, voie des
// pneus 12.00-20) : caisson ouvert de 1,67 × 0,95 m posé sur le châssis
// arrière derrière l'articulation, poste de conduite transversal (opérateur
// tourné vers −Z), pupitre avant en chevron face à l'articulation, marchepied
// côté −Z, auvent FOPS en porte-à-faux sur deux montants à l'extrémité +Z.
import { kit, racFactory, racPose, JIC, NPT } from '../../du311/parts/_porteur.js';
import { hhcs, shcs as shcsIn, hexNut, nylocNut, flatWasher, splitWasher, nordLock } from '../../du311/parts/_avance_b.js';

export const IN = 0.0254;
export const u = (v) => v * IN;

// ---------------------------------------------------------------- cabine (P278 / P286)
// Repère de P286 (caisson + auvent) : axes du repère machine, origine au
// centre du dessous du caisson principal (sans le pupitre) ; P278 le place en CAB.o.
export const CAB = {
  o: [-0.75, 1.04, 0.115],
  hx: 0.35, // demi-profondeur du caisson principal (X) : paroi arrière à x = −hx
  hz: 0.835, // demi-longueur (Z) : extrémité +Z (auvent) et −Z (accès)
  nose: 0.6, // face avant du pupitre (x local)
  noseZ: [-0.015, 0.605], // face droite du pupitre (z local)
  H: 0.94, // dessus de la paroi arrière (y local)
  hc: 0.58, // dessus du pupitre avant
  t: 0.25 * IN, // tôle du caisson
  land: { z1: -0.53, y: 0.3 }, // palier d'accès : de z = −hz à z1, plancher à y
  hinge: { x: [-0.3, 0.3], y: -0.035, z: 0.355 }, // axe de basculement (selon X) sous le caisson
};
/** Point du repère de P286 → repère machine. */
export const cabToMachine = ([x, y, z]) => [x + CAB.o[0], y + CAB.o[1], z + CAB.o[2]];

// Auvent ROPS/FOPS (P288) : repère d'axes machine, origine au centre du
// dessous de l'embase ; posé dans le caisson contre la paroi +Z (repère P286).
export const CANOPY = {
  at: [0, CAB.t, CAB.hz - CAB.t - 0.075], // origine de P288 dans le repère de P286
  base: { w: u(21), h: u(27.5), d: u(5.5) }, // embase (X × Y × Z)
  post: { a: u(3.5), x: u(7.8), rec: u(4.25) }, // montants carrés (côté a, à ±x), fourreaux de côté rec
  top: 2.22, // dessus de l'auvent (repère machine)
  len: 1.3, // longueur (Z, de +0.10 à −1.20 dans le repère de P288)
  wid: 0.95, // largeur (X)
  cx: 0.13, // décalage du milieu de l'auvent vers +X (pupitre)
  pin5: 0.09, pin6: 0.4, pin9: 0.645, // hauteurs des axes : pied des vérins, œil de tige, verrouillage
};
/** Hauteur du dessus de l'auvent dans le repère de P288. */
export const canopyTopLocal = () => CANOPY.top - CAB.o[1] - CANOPY.at[1];

// Siège (P290) : repère du siège (X vers l'avant de l'opérateur, Y haut, Z à
// sa droite, origine sur le plancher entre les deux embases) ; dans le repère
// de P286, tourné de +90° autour de Y (opérateur tourné vers −Z).
export const SEAT = { at: [-0.05, CAB.t + 0.004, 0.36], rotY: Math.PI / 2 };

// Collecteur 10 gal (P284) sous le palier d'accès, repère machine : origine au
// centre du dessous, grand axe selon X (couvercle vers +X), orifices vers +Z.
export const MANIF = { at: [-0.74, 0.8, -0.62], L: 0.6, H: 0.35, D: 0.18 };

// ---------------------------------------------------------------- réservoir hydraulique 34 gal (P326 / P328)
// Repère de P328 : origine au centre du dessous du caisson principal, axes
// machine (X avant, Y haut, Z droite) ; P326 le pose en TANK.at (repère machine).
export const TANK = {
  at: [0.34, 1.02, 0], // posé sur les traverses du châssis avant, devant l'articulation
  D: 0.28, // profondeur du caisson principal (X)
  W: 0.72, // largeur (Z)
  H: 0.72, // hauteur
  nose: 0.12, // saillie du chevron arrière (vers −X)
  ny: 0.22, // le chevron commence à cette hauteur (dégagement en bas)
  t: 0.1875 * IN,
};

// ---------------------------------------------------------------- quincaillerie

const AF = { 0.19: 0.3125, 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.4375: 0.625, 0.5: 0.75, 0.625: 0.9375, 0.75: 1.125, 1.0: 1.5 };
export const af = (d) => AF[d] ?? d * 1.5;

/**
 * Outils liés à l'api d'un builder : const H = cabHw(api).
 * Toutes les pièces sont construites le long de +Y local puis posées par
 * pose(obj, pos, dir, side) : +Y selon dir, +X vers side.
 *   bolt(d, len, pos, dir, { mat, light }) : vis H d × len (po), dessous de
 *     tête en pos, tige vers −dir ; light : six-pans + fût lisse.
 *   capscrew(d, len, pos, dir, mat) : vis CHC (A574 noire).
 *   washer(d, pos, dir, kind) : 'flat' (SAE), 'split' (Grower), 'hc'
 *     (fendue à collet haut), 'nl' (Nord-Lock) ; wT(d, kind) : épaisseur (m).
 *   nut(d, pos, dir, kind) : 'hex', 'nyl' (frein nylon), 'jam'.
 *   R : raccords légers (racFactory) ; K : tôles, rondelles légères (kit).
 */
export function cabHw(api) {
  const { THREE, S } = api;
  const R = racFactory(S, { light: true });
  const K = kit(api);
  const pose = (obj, pos, dir = [0, 1, 0], side = [1, 0, 0]) => racPose(THREE, S.group(obj), pos, dir, side);

  const wT = (d, kind = 'flat') => {
    if (kind === 'split' || kind === 'hc') return u(Math.max(0.06, d * 0.25));
    if (kind === 'nl') return u(Math.max(0.05, d * 0.11) * 2);
    return u(Math.max(0.065, d * 0.13));
  };
  const lightBolt = (d, len, mat) => S.merged([
    S.lathe([[0, 0], [u(af(d)) / Math.sqrt(3), 0], [u(af(d)) / Math.sqrt(3), u(d * 0.6)], [u(af(d)) * 0.45, u(d * 0.65)], [0, u(d * 0.65)]], mat, { seg: 6 }),
    S.lathe([[0, -u(len)], [u(d) * 0.42, -u(len)], [u(d) / 2, -u(len) + u(d) * 0.08], [u(d) / 2, 0.0004], [0, 0.0004]], mat, { seg: 8 }),
  ], mat);

  return {
    R, K, pose, wT, JIC, NPT,
    bolt: (d, len, pos, dir = [0, 1, 0], { mat = 'zinc', light = false } = {}) =>
      pose(light ? lightBolt(d, len, mat) : hhcs(S, THREE, d, len, { mat }), pos, dir),
    capscrew: (d, len, pos, dir = [0, 1, 0], mat = 'blackOxide') => pose(shcsIn(S, THREE, d, len, { mat }), pos, dir),
    washer: (d, pos, dir = [0, 1, 0], kind = 'flat', mat = 'zinc') => {
      if (kind === 'split') return pose(splitWasher(S, THREE, d, { mat }), pos, dir);
      if (kind === 'nl') return pose(nordLock(S, THREE, d, { mat }), pos, dir);
      if (kind === 'hc') return pose(S.lathe([[u(d * 0.53), 0], [u(d * 0.82), 0], [u(d * 0.82), wT(d, 'hc')], [u(d * 0.53), wT(d, 'hc')], [u(d * 0.53), 0]], mat, { seg: 16 }), pos, dir);
      return pose(flatWasher(S, THREE, d, { mat }), pos, dir);
    },
    nut: (d, pos, dir = [0, 1, 0], kind = 'hex', mat = 'zinc') =>
      pose(kind === 'nyl' ? nylocNut(S, THREE, d, { mat }) : hexNut(S, THREE, d, { mat, jam: kind === 'jam' }), pos, dir),

    /**
     * Raccord de traversée de cloison JIC mâle / mâle à contre-écrou (FA01000
     * 45°, FA01001 90°, FA01002 droit), taille dash : la tôle est en y ∈ [0, t],
     * le corps appuie dessous (y < 0), l'écrou dessus ; le mâle long sort
     * selon +Y, le second sous la tôle selon −Y (droit), à 45° ou à 90° (vers +X).
     */
    bulkhead(dash, kind = 'straight', t = 0.25 * IN) {
      const J = JIC[dash];
      const r = (J.t * IN) / 2, hx = J.hex * IN * 1.1, nh = r * 0.9;
      const zinc = [];
      const len = t + nh + r * 0.35;
      // Fût fileté au travers, contre-écrou, mâle supérieur.
      zinc.push(R.rodY(r * 1.12, -0.001, len));
      zinc.push(R.hexY(hx, t + 0.0005, nh));
      zinc.push(R.jicNose(J.t, len));
      // Corps six-pans sous la tôle.
      const hh = r * 1.1;
      zinc.push(R.hexY(hx, -hh, hh));
      if (kind === 'straight') {
        const m = R.jicNose(J.t, 0);
        m.rotation.x = Math.PI;
        m.position.y = -hh;
        zinc.push(m);
      } else {
        const a = kind === '45' ? Math.PI / 4 : Math.PI / 2;
        const rb = r * 1.0, yc = -hh - rb * 1.05;
        zinc.push(R.knuckle(rb, yc, -hh + 0.0005));
        const br = S.group(R.sleeve(rb, 0, rb * 1.05), R.jicNose(J.t, rb * 1.05));
        br.position.set(0, yc, 0);
        br.rotation.z = -(Math.PI - a); // sortie vers +X (90°) ou à 45° vers +X et −Y
        zinc.push(br);
      }
      return S.merged(zinc, 'zinc');
    },

    /** Adaptateur métrique (filetage M d mm, joint plat) → mâle JIC jd (CP0053xx), le long de +Y. */
    metric(dmm, jd) {
      const J = JIC[jd];
      const r = dmm / 2000, af = Math.max(J.hex * IN, r * 2.4), h = af * 0.42;
      return S.group(
        S.merged([
          S.lathe([[0, -r * 1.6], [r * 0.9, -r * 1.6], [r, -r * 1.3], [r, 0], [0, 0]], 'zinc', { seg: 10 }),
          R.hexY(af, 0.0012, h),
          R.jicNose(J.t, 0.0012 + h),
        ], 'zinc'),
        S.lathe([[r * 1.05, 0], [af * 0.48, 0], [af * 0.48, 0.0012], [r * 1.05, 0.0012]], 'rubber', { seg: 12 }),
      );
    },
  };
}

/** Plaque arrondie (tôle) dans le plan XY (épaisseur selon Z), centrée, avec trous [x, y, r]. */
export function panelXY(S, THREE, w, h, t, mat, { r = 0.02, holes = [], cut = [] } = {}) {
  const s = new THREE.Shape();
  const x0 = -w / 2, y0 = -h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  for (const [x, y, hr] of holes) s.holes.push(new THREE.Path().absarc(x, y, hr, 0, Math.PI * 2, true));
  for (const [x, y, cw, ch] of cut) {
    const p = new THREE.Path();
    p.moveTo(x - cw / 2, y - ch / 2); p.lineTo(x - cw / 2, y + ch / 2); p.lineTo(x + cw / 2, y + ch / 2); p.lineTo(x + cw / 2, y - ch / 2);
    p.closePath();
    s.holes.push(p);
  }
  const mb = Math.min(t * 0.16, 0.0012);
  const geo = new THREE.ExtrudeGeometry(s, { depth: t - 2 * mb, bevelEnabled: mb > 0.0004, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 6 });
  geo.translate(0, 0, -(t - 2 * mb) / 2);
  return S.merged([new THREE.Mesh(geo)], mat);
}

/** Prisme d'un profil plan [[a, b]] extrudé : plan 'xy' (épaisseur Z), 'zy' (épaisseur X) ou 'xz' (épaisseur Y), décalé de off selon l'axe d'épaisseur. */
export function prism(S, THREE, pts, depth, mat, plane = 'xy', off = 0, { holes = [] } = {}) {
  const s = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)));
  for (const [a, b, r] of holes) s.holes.push(new THREE.Path().absarc(a, b, r, 0, Math.PI * 2, true));
  const mb = Math.min(depth * 0.16, 0.0012);
  const geo = new THREE.ExtrudeGeometry(s, { depth: depth - 2 * mb, bevelEnabled: mb > 0.0004, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 8 });
  geo.translate(0, 0, -(depth - 2 * mb) / 2);
  if (plane === 'zy') { geo.rotateY(-Math.PI / 2); geo.translate(off, 0, 0); } // (a, b) = (z, y), épaisseur selon X
  else if (plane === 'xz') { geo.rotateX(Math.PI / 2); geo.translate(0, off, 0); } // (a, b) = (x, z), épaisseur selon Y
  else geo.translate(0, 0, off);
  return S.merged([new THREE.Mesh(geo)], mat);
}
