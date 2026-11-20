// Entraînement et circuit d'eau de la pompe Bean 420 posée sur le tube à l'eau (page P03 de l'équipement
// tube-eau). Tout est indicatif : aucun plan ne montre ce montage. Références :
// - photo de la FMC L09-420 à moteur hydraulique du catalogue TIME Ltd (page PU26, page P03 ici) : moteur
//   orbital White, cloche d'accouplement, soupape de sûreté sur un coude au bout du collecteur, côté moteur ;
// - manuel de la foreuse STM-1500, page 1.6 (pompe FMC 435) : adaptateur boulonné au chapeau de la pompe,
//   accouplement et moteur White ; la flotte de ce bac porte le nom de la STM-1500 ;
// - manuel de la pompe AL0918B, section 4 et figure 6 (page P04 ici) : aspiration au moins aussi grosse que
//   l'orifice (1 1/2 po NPT), manomètre au refoulement avant toute vanne, soupape de sûreté juste en aval de la
//   pompe et retour au réservoir, jamais à l'aspiration ; soupape PPFMC 3546492, manomètre PPAM A000380000 ;
// - waterpack de la foreuse DR1500-U (pages 9 et 10 de son manuel) : réservoir à flotte, pompe entraînée par
//   un moteur hydraulique par un accouplement sous un garde, boyau de refoulement vers la foreuse.
// Dimensions des pièces du commerce (moteur, accouplement, raccords) : ordres de grandeur, relevés sur la
// photo à l'échelle de la pompe.
// Repère : celui du bac (pouces ; X depuis le bout gauche, Y depuis le sol, Z depuis la face arrière).
import { COTE, RELEVE, BOITIER, FACE_ENTRAINEMENT } from '../pompe-bean-420/index.js';

const IN = 0.0254;

/** Cotes du montage (pouces), calculées à partir de la pose de la pompe sur le bac (ctx, voir index.js). */
export function geometrie(ctx) {
  const { POSE_POMPE, VERS_BAC } = ctx;
  const AR = COTE.arbre;
  // Arbre d'entrée : axe le long de Z, sorti vers la face arrière.
  const [xa, ya] = VERS_BAC([AR.x, AR.y, 0]);
  const zFace = POSE_POMPE.z - FACE_ENTRAINEMENT; // face de la bride du boîtier d'entraînement (17)
  const zBout = POSE_POMPE.z - AR.bout; // bout de l'arbre
  const LANT = { long: 6.065, bride: 0.5, r: 2.25, rInt: 1.95, alesage: 1.0, carre: 4.6, pilote: 1.62, vis: 1.75 };
  const zM = zFace - LANT.long; // face du moteur contre la cloche
  const MOT = { flasque: 0.6, palier: [zM - 2.4, zM - 0.6], corps: [zM - 4.6, zM - 2.4], gerotor: [zM - 5.9, zM - 4.6], fond: [zM - 6.7, zM - 5.9], rPalier: 2.05, large: 4.4, vis: 1.85 };
  const zPort = zM - 3.5, zDrain = zM - 1.5;
  // Refoulement : un orifice à chaque bout du collecteur ; la soupape côté moteur (arrière), le boyau à l'avant.
  const arr = VERS_BAC([0, COTE.refoulement, -RELEVE.collecteur.z]);
  const avt = VERS_BAC([0, COTE.refoulement, RELEVE.collecteur.z]);
  const asp = VERS_BAC([0, RELEVE.colonne.y0, 0]); // dessous de l'orifice d'aspiration du milieu
  const coude = { z: arr[2] - 1.525, haut: arr[1] + 1.6 };
  const soupape = { x: arr[0], z: coude.z, y: coude.haut, sortie: [arr[0] - 1.95, coude.haut + 1.3, coude.z] };
  const te = { z: avt[2] + 1.825, haut: avt[1] + 0.95 };
  const yMan = ctx.yManchon, zMan = ctx.MANCHON.z[0];
  const R = { hyd: 0.6, drain: 0.37, refoul: 0.75, retour: 0.6, arrivee: 0.7, tuyau: 0.95 };
  const sol = (r) => r + 0.1;
  const BOYAUX = {
    pression: { r: R.hyd, pts: [[xa + 3.2, ya, zPort], [xa + 4.6, ya - 0.17, zPort - 0.2], [xa + 5.4, ya - 1.6, zPort - 1.6], [xa + 5.4, ya - 4.9, -1.6], [xa + 5.3, 31, -2.4], [xa + 5.2, 12, -2.5], [xa + 5.2, 4, -2.8], [xa + 5.2, 1.6, -5.4], [xa + 5.2, sol(R.hyd), -9], [xa + 5.2, sol(R.hyd), -12]] },
    retourHyd: { r: R.hyd, pts: [[xa - 3.2, ya, zPort], [xa - 4.6, ya - 0.17, zPort - 0.2], [xa - 5.4, ya - 1.6, zPort - 1.6], [xa - 5.4, ya - 4.9, -1.6], [xa - 5.3, 31, -2.4], [xa - 5.2, 12, -2.5], [xa - 5.2, 4, -2.8], [xa - 5.2, 1.6, -5.4], [xa - 5.2, sol(R.hyd), -9], [xa - 5.2, sol(R.hyd), -12]] },
    drain: { r: R.drain, pts: [[xa, ya + 2.75, zDrain], [xa, ya + 3.75, zDrain - 0.6], [xa, ya + 4, zDrain - 2.8], [xa, ya + 3, zM - 6.9], [xa, ya - 1.4, -2.6], [xa, 31, -2.6], [xa, 12, -2.6], [xa, 4, -2.9], [xa, 1.6, -5.4], [xa, sol(R.drain), -9], [xa, sol(R.drain), -12]] },
    retour: { r: R.retour, pts: [soupape.sortie, [soupape.sortie[0] - 1.3, soupape.sortie[1] - 0.25, soupape.z], [soupape.sortie[0] - 2.6, soupape.sortie[1] - 2, soupape.z + 0.05], [soupape.sortie[0] - 3.2, 39, soupape.z + 0.15], [soupape.sortie[0] - 3.3, 33, soupape.z + 0.15], [soupape.sortie[0] - 3.3, 26, soupape.z + 0.15], [soupape.sortie[0] - 3.3, 22, soupape.z + 0.15]] },
    refoulement: { r: R.refoul, pts: [[avt[0], avt[1], te.z + 0.8], [avt[0], avt[1] - 0.19, te.z + 2.9], [avt[0] + 0.07, 41, 32], [avt[0] + 0.17, 37.6, 35.6], [avt[0] + 0.27, 33.5, 36.95], [avt[0] + 0.27, 22, 37.25], [avt[0] + 0.27, 6, 37.25], [avt[0] + 0.27, 1.6, 38.9], [avt[0] + 0.27, sol(R.refoul), 43], [avt[0] + 0.27, sol(R.refoul), 47.5]] },
    arrivee: { r: R.arrivee, pts: [[-1.95, yMan, zMan], [-3.6, yMan - 0.34, zMan + 0.04], [-5, yMan - 2.94, zMan + 0.24], [-5.4, 18, zMan + 0.44], [-5.4, 6, zMan + 0.44], [-6.6, 1.6, zMan + 0.44], [-10, sol(R.arrivee), zMan + 0.44], [-14, sol(R.arrivee), zMan + 0.44]] },
  };
  const ASP = { x: asp[0], z: asp[2], haut: asp[1], mamelon: 33.4, union: 31.5, tuyau: 11.2, clapet: 8.6, crepine: 5.8, r: R.tuyau, rCrepine: 1.55 };
  return { xa, ya, zFace, zBout, zM, zPort, zDrain, LANT, MOT, arr, avt, coude, soupape, te, ASP, BOYAUX, R };
}

/** Builder de la page P03 : ctx donne la pose de la pompe et les cotes du bac (index.js). */
export function circuit(api, ctx) {
  const { S } = api;
  const { L, D } = ctx;
  const G = geometrie(ctx);
  const { xa, ya, zFace, zBout, zM, LANT, MOT } = G;
  const pos = (x, y, z) => [(x - L / 2) * IN, y * IN, (z - D / 2) * IN];
  const P = (pts) => pts.map(([x, y, z]) => pos(x, y, z));
  const m2 = (pts) => pts.map(([x, y]) => [(x - L / 2) * IN, y * IN]);
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); };

  /** Pièces tournées d'axe X, Y ou Z, en coordonnées absolues du bac : profil [[r, coordonnée croissante]], axe passant par (u, v). */
  const tourX = (profil, material, y, z, seg = 32) => S.lathe(profil.map(([r, x]) => [r * IN, x * IN]), material, { axis: 'x', seg, pos: pos(0, y, z) });
  const tourY = (profil, material, x, z, seg = 32) => S.lathe(profil.map(([r, y]) => [r * IN, y * IN]), material, { axis: 'y', seg, pos: pos(x, 0, z) });
  const tourZ = (profil, material, x, y, seg = 32) => S.lathe(profil.map(([r, z]) => [r * IN, z * IN]), material, { axis: 'z', seg, pos: pos(x, y, 0) });
  /** Six-pans d'axe X, Y ou Z (surplat af) entre a0 et a1 (coordonnées absolues). */
  const hex = (af, a0, a1, material, axe, u, v) => {
    const Rh = af / 2 / Math.cos(Math.PI / 6);
    const prof = [[0, a0], [Rh, a0], [Rh, a1], [0, a1]];
    if (axe === 'x') return S.lathe(prof.map(([r, x]) => [r * IN, x * IN]), material, { axis: 'x', seg: 6, pos: pos(0, u, v) });
    if (axe === 'y') return S.lathe(prof.map(([r, y]) => [r * IN, y * IN]), material, { axis: 'y', seg: 6, pos: pos(u, 0, v) });
    return S.lathe(prof.map(([r, z]) => [r * IN, z * IN]), material, { axis: 'z', seg: 6, pos: pos(u, v, 0) });
  };
  /** Carré aux coins arrondis de côté c, centré en (x, y), extrudé le long de Z de z0 à z1 ; trous [x, y, r]. */
  const carreZ = (c, rc, x, y, z0, z1, material, holes = []) => {
    const h = c / 2, pts = [];
    for (const [cx, cy, a0] of [[x + h - rc, y - h + rc, -90], [x + h - rc, y + h - rc, 0], [x - h + rc, y + h - rc, 90], [x - h + rc, y - h + rc, 180]]) {
      for (let k = 0; k <= 5; k++) { const a = ((a0 + 18 * k) * Math.PI) / 180; pts.push([cx + rc * Math.cos(a), cy + rc * Math.sin(a)]); }
    }
    const p = S.extrude(m2(pts), (z1 - z0) * IN, material, { center: false, holes: holes.map(([hx, hy, hr]) => [(hx - L / 2) * IN, hy * IN, hr * IN]) });
    p.position.z = (z0 - D / 2) * IN;
    return p;
  };
  /** Raccord rapide au bout d'un boyau : corps et bague, dans la direction d ('x', '-x', 'z' ou '-z') depuis le point o. */
  const raccordRapide = (o, d, r, material = 'zinc') => {
    const k = d.replace('-', ''), s = d.startsWith('-') ? -1 : 1, a = o['xyz'.indexOf(k)];
    const prof = [[0, 0], [r * 1.05, 0], [r * 1.05, 0.5], [r * 1.3, 0.6], [r * 1.3, 1.5], [r * 1.12, 1.6], [r * 1.12, 2.3], [r * 0.7, 2.5], [0, 2.5]];
    // lathe : profil parcouru dans le sens croissant de la coordonnée le long de l'axe.
    const profil = (s > 0 ? prof : [...prof].reverse()).map(([rr, t]) => [rr, a + s * t]);
    return k === 'x' ? tourX(profil, material, o[1], o[2], 24) : tourZ(profil, material, o[0], o[1], 24);
  };
  const rArbre = COTE.arbre.d / 2;

  // --- Moteur hydraulique orbital (1) : flasque carré, pilote, arbre, palier, corps à orifices, gérotor, fond.
  const moteur = S.group(
    carreZ(LANT.carre, 0.35, xa, ya, zM - MOT.flasque, zM, 'charcoal', [-1, 1].flatMap((sx) => [-1, 1].map((sy) => [xa + sx * MOT.vis, ya + sy * MOT.vis, 0.27]))),
    tourZ([[0, zM], [1.6, zM], [1.6, zM + 0.2], [0.625, zM + 0.2], [0.625, zM + 2.45], [0, zM + 2.45]], 'steel', xa, ya),
    tourZ([[0, MOT.palier[0]], [MOT.rPalier - 0.1, MOT.palier[0]], [MOT.rPalier, MOT.palier[0] + 0.1], [MOT.rPalier, MOT.palier[1]], [0, MOT.palier[1]]], 'charcoal', xa, ya, 40),
    S.box(MOT.large * IN, MOT.large * IN, (MOT.corps[1] - MOT.corps[0]) * IN, 'charcoal', { r: 0.35 * IN, pos: pos(xa, ya, (MOT.corps[0] + MOT.corps[1]) / 2) }),
    S.box(4.6 * IN, 4.6 * IN, (MOT.gerotor[1] - MOT.gerotor[0]) * IN, 'charcoal', { r: 0.3 * IN, pos: pos(xa, ya, (MOT.gerotor[0] + MOT.gerotor[1]) / 2) }),
    S.box(4.3 * IN, 4.3 * IN, (MOT.fond[1] - MOT.fond[0]) * IN, 'charcoal', { r: 0.5 * IN, pos: pos(xa, ya, (MOT.fond[0] + MOT.fond[1]) / 2) }),
    // Bossages des orifices (de chaque côté) et du drain (dessus du palier).
    ...[-1, 1].map((sx) => tourX(sx > 0 ? [[0, xa + 2.15], [0.5, xa + 2.15], [0.5, xa + 2.5], [0, xa + 2.5]] : [[0, xa - 2.5], [0.5, xa - 2.5], [0.5, xa - 2.15], [0, xa - 2.15]], 'charcoal', ya, G.zPort, 24)),
    tourY([[0, ya + MOT.rPalier - 0.2], [0.35, ya + MOT.rPalier - 0.2], [0.35, ya + 2.25], [0, ya + 2.25]], 'charcoal', xa, G.zDrain, 20),
    // Tirants du fond.
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => S.bolt(0.5 * IN, 1 * IN, 'zinc', { axis: '-z', pos: pos(xa + sx * 1.6, ya + sy * 1.6, MOT.fond[0]) }))),
  );
  put('1', moteur, [0, 0, -0.45]);

  // --- Cloche d'accouplement (2) : bride côté pompe, corps, bride carrée côté moteur.
  const cloche = S.group(
    tourZ([[LANT.rInt, zM + 0.5], [LANT.r, zM + 0.5], [LANT.r, zFace], [LANT.alesage, zFace], [LANT.alesage, zFace - LANT.bride], [LANT.rInt, zFace - LANT.bride], [LANT.rInt, zM + 0.5]], 'orange', xa, ya, 44),
    carreZ(LANT.carre, 0.35, xa, ya, zM, zM + 0.5, 'orange', [[xa, ya, LANT.pilote], ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => [xa + sx * MOT.vis, ya + sy * MOT.vis, 0.25]))]),
  );
  cloche.children[0].userData.hasInterior = true;
  put('2', cloche, [0, 0, -0.22]);

  // --- Accouplement à mâchoires (3) : moyeu sur l'arbre de la pompe, étoile, moyeu sur l'arbre du moteur.
  const accouplement = S.group(
    tourZ([[rArbre, zBout - 0.175], [1.5, zBout - 0.175], [1.5, zBout + 1.925], [rArbre, zBout + 1.925], [rArbre, zBout - 0.175]], 'steel', xa, ya, 36),
    tourZ([[0.7, zBout - 0.675], [1.35, zBout - 0.675], [1.35, zBout - 0.175], [0.7, zBout - 0.175], [0.7, zBout - 0.675]], 'rubber', xa, ya, 36),
    tourZ([[0.625, zM + 0.4], [1.5, zM + 0.4], [1.5, zBout - 0.675], [0.625, zBout - 0.675], [0.625, zM + 0.4]], 'steel', xa, ya, 36),
  );
  put('3', accouplement, [0, 0.12, -0.3]);

  // --- Vis de la cloche (4), à la place des trois vis du boîtier d'entraînement ; vis du moteur (5).
  for (const a of BOITIER.angles) {
    const t = (a * Math.PI) / 180;
    put('4', S.bolt(0.375 * IN, 1.25 * IN, 'blackOxide', { axis: '-z', pos: pos(xa + BOITIER.r * Math.cos(t), ya + BOITIER.r * Math.sin(t), zFace - LANT.bride) }), [0, 0, -0.1]);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    put('5', S.bolt(0.5 * IN, 1.25 * IN, 'zinc', { axis: '-z', pos: pos(xa + sx * MOT.vis, ya + sy * MOT.vis, zM - MOT.flasque) }), [0, 0, -0.55]);
  }

  // --- Adaptateurs des orifices du moteur (6) et boyaux hydrauliques (7, 8) avec leurs raccords rapides (9).
  for (const sx of [-1, 1]) {
    const x0 = xa + sx * 2.5, x1 = xa + sx * 2.85, x2 = xa + sx * 3.2;
    put('6', S.group(hex(1, Math.min(x0, x1), Math.max(x0, x1), 'zinc', 'x', ya, G.zPort), tourX([[0, Math.min(x1, x2)], [0.42, Math.min(x1, x2)], [0.42, Math.max(x1, x2)], [0, Math.max(x1, x2)]], 'zinc', ya, G.zPort, 16)), [sx * 0.08, 0, -0.45]);
  }
  put('6', S.group(hex(0.75, ya + 2.25, ya + 2.5, 'zinc', 'y', xa, G.zDrain), tourY([[0, ya + 2.5], [0.28, ya + 2.5], [0.28, ya + 2.75], [0, ya + 2.75]], 'zinc', xa, G.zDrain, 16)), [0, 0.05, -0.45]);
  for (const [cle, ref, rr] of [['pression', '7', 0.6], ['retourHyd', '7', 0.6], ['drain', '8', 0.37]]) {
    const b = G.BOYAUX[cle];
    put(ref, S.hose(P(b.pts), b.r * IN), [0, 0.05, -0.5]);
    const fin = b.pts[b.pts.length - 1];
    put('9', raccordRapide(fin, '-z', rr), [0, 0, -0.62]);
  }

  // --- Soupape de sûreté sur un coude au bout arrière du collecteur (10, 11), retour au bac (12).
  const { arr, coude, soupape } = G;
  put('10', S.group(
    tourZ([[0, coude.z + 0.85], [0.66, coude.z + 0.85], [0.66, arr[2]], [0, arr[2]]], 'darkSteel', arr[0], arr[1], 24),
    tourZ([[0, coude.z], [0.82, coude.z], [0.82, coude.z + 0.85], [0, coude.z + 0.85]], 'darkSteel', arr[0], arr[1], 24),
    S.ball(0.82 * IN, 'darkSteel', { pos: pos(arr[0], arr[1], coude.z) }),
    tourY([[0, arr[1]], [0.82, arr[1]], [0.82, coude.haut], [0, coude.haut]], 'darkSteel', arr[0], coude.z, 24),
  ), [0, 0.05, -0.12]);
  const y0 = soupape.y;
  put('11', S.group(
    hex(1.375, y0, y0 + 0.45, 'brass', 'y', soupape.x, soupape.z),
    tourY([[0, y0 + 0.45], [0.95, y0 + 0.45], [0.95, y0 + 2.2], [0.8, y0 + 2.3], [0.72, y0 + 2.3], [0.72, y0 + 4.5], [0, y0 + 4.5]], 'brass', soupape.x, soupape.z, 32),
    hex(1.1, y0 + 4.5, y0 + 5, 'brass', 'y', soupape.x, soupape.z),
    tourY([[0, y0 + 5], [0.18, y0 + 5], [0.18, y0 + 5.9], [0, y0 + 5.9]], 'steel', soupape.x, soupape.z, 12),
    hex(0.6, y0 + 5.15, y0 + 5.4, 'steel', 'y', soupape.x, soupape.z),
    // Sortie latérale vers le retour (côté des culasses, comme sur la photo).
    tourX([[0, soupape.x - 1.4], [0.55, soupape.x - 1.4], [0.55, soupape.x - 0.5], [0, soupape.x - 0.5]], 'brass', y0 + 1.3, soupape.z, 24),
    hex(1, soupape.sortie[0], soupape.x - 1.4, 'brass', 'x', y0 + 1.3, soupape.z),
  ), [0, 0.25, -0.12]);
  put('12', S.hose(P(G.BOYAUX.retour.pts), G.BOYAUX.retour.r * IN), [-0.12, 0.25, -0.1]);

  // --- Refoulement : mamelon (13), té (14), manomètre (15), boyau vers la foreuse (16) et son raccord rapide (17).
  const { avt, te } = G;
  put('13', S.group(
    tourZ([[0, avt[2]], [0.66, avt[2]], [0.66, avt[2] + 0.375], [0, avt[2] + 0.375]], 'darkSteel', avt[0], avt[1], 20),
    hex(1.375, avt[2] + 0.375, avt[2] + 0.775, 'darkSteel', 'z', avt[0], avt[1]),
    tourZ([[0, avt[2] + 0.775], [0.66, avt[2] + 0.775], [0.66, avt[2] + 1.125], [0, avt[2] + 1.125]], 'darkSteel', avt[0], avt[1], 20),
  ), [0, 0, 0.08]);
  put('14', S.group(
    tourZ([[0, te.z - 0.8], [0.82, te.z - 0.8], [0.82, te.z + 0.8], [0, te.z + 0.8]], 'darkSteel', avt[0], avt[1], 24),
    tourY([[0, avt[1]], [0.82, avt[1]], [0.82, te.haut], [0, te.haut]], 'darkSteel', avt[0], te.z, 24),
  ), [0, 0, 0.14]);
  const rG = 1.25;
  const mano = S.gauge(rG * IN, { axis: 'z' });
  mano.position.set(...pos(avt[0], te.haut + 0.3 + 1.4 * rG, te.z));
  put('15', S.group(hex(1.375, te.haut, te.haut + 0.3, 'brass', 'y', avt[0], te.z), mano), [0, 0.15, 0.14]);
  const ref = G.BOYAUX.refoulement;
  put('16', S.hose(P(ref.pts), ref.r * IN), [0, 0, 0.3]);
  put('17', raccordRapide(ref.pts[ref.pts.length - 1], 'z', 0.75, 'brass'), [0, 0, 0.42]);

  // --- Aspiration : mamelon (18), raccord union (19), tuyau (20), clapet de pied à crépine (21).
  const A = G.ASP;
  put('18', tourY([[0, A.mamelon], [A.r, A.mamelon], [A.r, A.haut], [0, A.haut]], 'zinc', A.x, A.z, 28), [0, -0.05, 0]);
  put('19', S.group(
    hex(2.25, A.union, A.union + 0.55, 'darkSteel', 'y', A.x, A.z),
    tourY([[0, A.union + 0.55], [1.4, A.union + 0.55], [1.4, A.mamelon - 0.5], [0, A.mamelon - 0.5]], 'darkSteel', A.x, A.z, 8),
    hex(2.25, A.mamelon - 0.5, A.mamelon, 'darkSteel', 'y', A.x, A.z),
  ), [0, -0.12, 0]);
  put('20', tourY([[0, A.tuyau], [A.r, A.tuyau], [A.r, A.union], [0, A.union]], 'zinc', A.x, A.z, 28), [0, -0.2, 0]);
  const fenetres = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) fenetres.push({ a: (i * Math.PI) / 6 + (j % 2) * 0.26, w: 0.2, y0: (A.crepine + 0.35 + j * 0.75) * IN, y1: (A.crepine + 0.85 + j * 0.75) * IN });
  put('21', S.group(
    hex(2.3, A.tuyau - 0.6, A.tuyau + 0.2, 'brass', 'y', A.x, A.z),
    tourY([[0, A.clapet], [1.35, A.clapet], [1.35, A.tuyau - 0.6], [0, A.tuyau - 0.6]], 'brass', A.x, A.z, 32),
    S.slotted(A.rCrepine * IN, (A.rCrepine - 0.08) * IN, A.crepine * IN, A.clapet * IN, fenetres, 'zinc', { axis: 'y', pos: pos(A.x, 0, A.z) }),
    tourY([[0, A.crepine], [A.rCrepine, A.crepine], [A.rCrepine, A.crepine + 0.12], [0, A.crepine + 0.12]], 'zinc', A.x, A.z, 32),
  ), [0, -0.3, 0]);

  // --- Arrivée d'eau : mamelon (13) dans le premier demi-manchon de 1 po, boyau (22), raccord rapide (17).
  const yM = ctx.yManchon, zMan = ctx.MANCHON.z[0];
  put('13', S.group(
    tourX([[0, -1.05], [0.66, -1.05], [0.66, -0.75], [0, -0.75]], 'darkSteel', yM, zMan, 20),
    hex(1.375, -1.45, -1.05, 'darkSteel', 'x', yM, zMan),
    tourX([[0, -1.95], [0.66, -1.95], [0.66, -1.45], [0, -1.45]], 'darkSteel', yM, zMan, 20),
  ), [-0.08, 0, 0]);
  const arrivee = G.BOYAUX.arrivee;
  put('22', S.hose(P(arrivee.pts), arrivee.r * IN), [-0.25, 0, 0]);
  put('17', raccordRapide(arrivee.pts[arrivee.pts.length - 1], '-x', 0.75, 'brass'), [-0.35, 0, 0]);

  return { view: { dir: [-0.7, 0.6, -1] } };
}
