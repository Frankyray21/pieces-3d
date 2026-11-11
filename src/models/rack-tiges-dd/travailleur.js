// Travailleur en silhouette sobre (combinaison orange à bandes réfléchissantes,
// casque à lampe, gants bleus, comme sur la photo de l'étape 14 de la
// procédure) : repère d'échelle humaine, foreur de l'étape 2, « à deux » de
// l'étape 4. Pieds à l'origine, regard vers −Z (vers la paroi), 1,80 m casqué.
//
// La silhouette est articulée : les mains et les pieds vont où on les pose
// (cinématique inverse à deux segments : épaule, coude, gant ; hanche, genou,
// cheville). Elle tient donc vraiment ce qu'elle tient, et le suit quand il bouge.
import * as THREE from 'three';

const HANCHE = 0.94, CHEVILLE = 0.09; // hauteurs, debout
const CUISSE = 0.45, TIBIA = 0.4; // hanche → genou → cheville
const ECART = 0.095; // demi-écart des hanches et des pieds
const EPAULE = [0.228, 0.515]; // épaule : demi-largeur, hauteur au-dessus des hanches
const BRAS = 0.3, AVANT = 0.3; // épaule → coude → centre du gant

const BAS = new THREE.Vector3(0, -1, 0);

/** Segment de membre : cylindre qui part de l'origine vers le bas, avec une bande réfléchissante éventuelle. */
function membre(S, r, len, material, bande) {
  const g = S.group(S.cyl(r, len, material, { pos: [0, -len / 2, 0], seg: 14 }));
  if (bande) g.add(S.cyl(r + 0.003, 0.028, 'bandeReflet', { pos: [0, -len * bande, 0], seg: 14 }));
  return g;
}

/**
 * Membre de deux segments (a puis b), de sa racine vers une cible : place de
 * l'articulation, pliée du côté `vers`, et bout réellement atteint (la cible,
 * ou le bout du membre tendu vers elle si elle est hors de portée).
 */
function plier(racine, cible, a, b, vers) {
  const d = cible.clone().sub(racine);
  const L = Math.min(Math.max(d.length(), Math.abs(a - b) + 1e-3), a + b - 1e-3);
  d.normalize();
  const x = (a * a - b * b + L * L) / (2 * L);
  const cote = vers.clone().addScaledVector(d, -vers.dot(d));
  if (cote.lengthSq() < 1e-8) cote.set(1, 0, 0).addScaledVector(d, -d.x);
  cote.normalize();
  return {
    pli: racine.clone().addScaledVector(d, x).addScaledVector(cote, Math.sqrt(Math.max(0, a * a - x * x))),
    bout: racine.clone().addScaledVector(d, L),
  };
}

/** Pose un segment (qui pend de son origine) d'un point vers un autre. */
function viser(o, de, vers) {
  o.position.copy(de);
  o.quaternion.setFromUnitVectors(BAS, vers.clone().sub(de).normalize());
}

/**
 * Travailleur. Sa pose se règle, et se règle de nouveau à volonté (animation),
 * par `userData.pose({ … })` :
 *  - bassin : [dx, dy, dz], déplacement des hanches depuis la station debout
 *    (repère du travailleur : −Z devant lui) ; les hanches descendent d'elles-mêmes
 *    si les jambes ne peuvent pas atteindre les pieds ;
 *  - penche : buste penché vers l'avant (rad) ; tourne : buste tourné autour de
 *    la verticale (rad ; positif : épaule droite en avant) ; regard : tête tournée
 *    par rapport au buste (rad ; positif : vers la gauche) ;
 *  - pieds : [gauche, droit], [x, z] de chaque botte au sol (repère du
 *    travailleur) ; par défaut, sous les hanches ;
 *  - mains : [gauche, droite], point où va le centre de chaque gant, donné dans
 *    le repère du parent du travailleur (le chantier, là où sont les objets
 *    tenus) ; null : le bras pend le long du corps ;
 *  - coudes : [gauche, droit], côté vers lequel plie chaque coude (repère du travailleur).
 * Poser et orienter le travailleur avant de lui donner une pose qui vise des mains.
 */
export function travailleur(S, pose = {}) {
  const g = S.group();
  // Tête, origine à la base du cou : cou, tête, casque (calotte et rebord, profil du bas vers le haut), lampe.
  const tete = S.at(S.group(
    S.cyl(0.05, 0.08, 'peau', { seg: 14 }),
    S.ball(0.1, 'peau', { pos: [0, 0.115, 0] }),
    S.lathe([[0.001, -0.01], [0.112, -0.01], [0.142, -0.014], [0.142, -0.005], [0.12, 0.002], [0.117, 0.03], [0.098, 0.075], [0.06, 0.1], [0.001, 0.108]], 'yellow', { pos: [0, 0.15, -0.004], seg: 24 }),
    S.box(0.05, 0.04, 0.03, 'black', { r: 0.008, pos: [0, 0.205, -0.118] }),
    S.cyl(0.016, 0.012, 'lamp', { axis: 'z', pos: [0, 0.205, -0.136], seg: 14 }),
  ), [0, 0.6, 0]);
  // Buste, origine aux hanches : bassin, torse, bandes réfléchissantes (ceinture, poitrine, bretelles), tête.
  const buste = S.group(
    S.box(0.33, 0.2, 0.2, 'tissuOrange', { r: 0.06, pos: [0, 0.05, 0] }),
    S.box(0.37, 0.47, 0.21, 'tissuOrange', { r: 0.08, pos: [0, 0.34, 0] }),
    ...[0.19, 0.39].map((y) => S.box(0.376, 0.03, 0.216, 'bandeReflet', { r: 0.014, pos: [0, y, 0] })),
    ...[-1, 1].map((s) => S.box(0.03, 0.17, 0.216, 'bandeReflet', { r: 0.012, pos: [s * 0.1, 0.5, 0] })),
    tete,
  );
  g.add(buste);
  // Bras : épaule et haut du bras, coude, avant-bras et gant.
  const bras = [-1, 1].map(() => {
    const haut = membre(S, 0.046, BRAS, 'tissuOrange');
    haut.add(S.ball(0.058, 'tissuOrange'));
    const bas = membre(S, 0.04, AVANT - 0.04, 'tissuOrange', 0.7);
    const gant = S.box(0.06, 0.1, 0.08, 'gantBleu', { r: 0.025, pos: [0, -AVANT, 0] });
    gant.userData.gant = true; // repéré par le contrôle chiffré (scripts/check-rack.mjs)
    bas.add(S.ball(0.045, 'tissuOrange'), gant);
    g.add(haut, bas);
    return { haut, bas };
  });
  // Jambes : cuisse, genou, bas de jambe, botte à plat au sol.
  const jambes = [-1, 1].map(() => {
    const haut = membre(S, 0.078, CUISSE, 'tissuOrange');
    const bas = membre(S, 0.06, TIBIA, 'tissuOrange', 0.55);
    bas.add(S.ball(0.07, 'tissuOrange'));
    const botte = S.group(S.box(0.105, 0.1, 0.27, 'rubber', { r: 0.03, pos: [0, 0.05, -0.04] }));
    botte.userData.botte = true;
    g.add(haut, bas, botte);
    return { haut, bas, botte };
  });

  g.userData.pose = (P = {}) => {
    g.updateMatrix();
    const inv = g.matrix.clone().invert();
    const [dx, dy, dz] = P.bassin || [0, 0, 0];
    buste.rotation.set(-(P.penche || 0), P.tourne || 0, 0, 'YXZ');
    tete.rotation.set((P.penche || 0) * 0.6, P.regard || 0, 0, 'YXZ'); // la tête reste droite quand le buste se penche
    buste.position.set(dx, HANCHE + dy, dz);
    buste.updateMatrix();
    const sur = (x, y) => new THREE.Vector3(x, y, 0).applyMatrix4(buste.matrix); // point du buste → repère du travailleur
    const pieds = [-1, 1].map((s, i) => (P.pieds?.[i] ? new THREE.Vector3(P.pieds[i][0], 0, P.pieds[i][1]) : new THREE.Vector3(s * ECART, 0, 0)));
    // Les hanches ne sont jamais plus hautes que ne le permettent les jambes.
    pieds.forEach((p, i) => {
      const h = sur((i ? 1 : -1) * ECART, 0);
      const d2 = (p.x - h.x) ** 2 + (p.z - h.z) ** 2;
      buste.position.y = Math.min(buste.position.y, CHEVILLE + Math.sqrt(Math.max(0.01, (CUISSE + TIBIA - 0.004) ** 2 - d2)));
    });
    buste.updateMatrix();
    jambes.forEach((j, i) => {
      const s = i ? 1 : -1;
      const hanche = sur(s * ECART, 0), cheville = pieds[i].clone().setY(CHEVILLE);
      const { pli } = plier(hanche, cheville, CUISSE, TIBIA, new THREE.Vector3(s * 0.12, 0, -1)); // le genou plie vers l'avant
      viser(j.haut, hanche, pli);
      viser(j.bas, pli, cheville);
      j.botte.position.copy(pieds[i]);
    });
    bras.forEach((b, i) => {
      const s = i ? 1 : -1;
      const epaule = sur(s * EPAULE[0], EPAULE[1]);
      const main = P.mains?.[i]
        ? new THREE.Vector3(...P.mains[i]).applyMatrix4(inv)
        : epaule.clone().add(new THREE.Vector3(s * 0.03, 0.012 - BRAS - AVANT, -0.07)); // au repos : le long du corps
      const vers = P.coudes?.[i] ? new THREE.Vector3(...P.coudes[i]) : new THREE.Vector3(s * 0.3, -0.6, 0.7);
      const { pli, bout } = plier(epaule, main, BRAS, AVANT, vers);
      viser(b.haut, epaule, pli);
      viser(b.bas, pli, bout);
    });
    return g;
  };
  return g.userData.pose(pose);
}
