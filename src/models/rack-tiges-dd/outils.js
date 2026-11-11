// Outils et quincaillerie de l'installation, d'après le texte et les photos de
// la procédure PRO-DD-ST-008 : boulon à œil, tendeur à cliquet de chaîne,
// foreuse à percussion électrique sans fil, tournevis plat.
import { IN } from './support.js';

export const HOLE = 18 * IN; // profondeur du trou (étape 2)
export const BOLT = { out: 0.075, eye: 0.118, in: 0.38 }; // boulon à œil : tige hors du trou, centre de l'œil, longueur enfoncée

/**
 * Boulon à œil forgé (photo de l'étape 3) : tige et œil en goutte, ouverture
 * de l'œil le long de X (la chaîne le traverse de gauche à droite). Origine au
 * collet du trou, sur la face de la roche ; le trou s'enfonce vers −Z. La tige
 * n'est pas enfoncée jusqu'au fond : il reste HOLE − BOLT.in au fond du trou.
 */
export function eyeBolt(S, material = 'boulonForge') {
  const z0 = BOLT.out;
  const loop = [[0, 0, z0], [0, 0.02, z0 + 0.016], [0, 0.03, z0 + 0.043], [0, 0.021, z0 + 0.068], [0, 0, z0 + 0.078], [0, -0.021, z0 + 0.068], [0, -0.03, z0 + 0.043], [0, -0.02, z0 + 0.016]];
  return S.group(
    S.cyl(0.011, BOLT.in + BOLT.out, material, { axis: 'z', pos: [0, 0, (BOLT.out - BOLT.in) / 2], seg: 14 }),
    S.tube(loop, 0.0085, material, { closed: true, seg: 40, radial: 8 }),
  );
}

/** Bouche du trou de 18 po (étape 2) : collet sombre sur la roche et fond d'ombre, juste derrière la face. */
export function hole(S) {
  return S.group(
    S.ring(0.024, 0.0165, 0.004, 'blackOxide', { axis: 'z', pos: [0, 0, 0.002], seg: 20 }),
    S.cyl(0.0165, 0.002, 'blackOxide', { axis: 'z', pos: [0, 0, -0.012], seg: 20 }),
  );
}

export const LEVER = { rest: -0.45, travel: -0.6 }; // levier du cliquet : inclinaison au repos, course d'un coup de pompe (rad, vers la paroi)
export const TENDEUR = { crochet: 0.135, course: 0.05 }; // tendeur : demi-entraxe des crochets une fois serré, course de chaque vis

/**
 * Tendeur à cliquet de chaîne (étape 8), le long de X, centré à l'origine :
 * corps fileté, boîtier du cliquet, levier articulé (userData.lever) pompé
 * pendant le serrage, une vis à crochet à chaque bout. Les vis sortent du
 * corps de `x` chacune (userData.regler(x), de 0 à TENDEUR.course) : c'est en
 * les rentrant que le tendeur reprend le mou de la chaîne.
 */
export function binder(S) {
  const g = S.group(
    S.cyl(0.015, 0.24, 'safety', { axis: 'x', seg: 14 }),
    S.box(0.05, 0.05, 0.04, 'darkSteel'),
  );
  // Levier du côté de la paroi : il ne touche jamais les tiges, qui sont de l'autre côté des traverses.
  const lever = S.group(S.box(0.026, 0.3, 0.018, 'safety', { pos: [0, 0.15, 0] }));
  S.at(lever, [0.02, 0, -0.03], [LEVER.rest, 0, -0.25]);
  g.add(lever);
  g.userData.lever = lever;
  const bouts = [-1, 1].map((s) => {
    const bout = S.group(S.cyl(0.0065, 0.1, 'steel', { axis: 'x', pos: [-s * 0.064, 0, 0], seg: 10 }), S.torus(0.016, 0.005, 'darkSteel', { axis: 'z' }));
    bout.userData.crochet = true; // repéré par le contrôle chiffré (scripts/check-rack.mjs)
    g.add(bout);
    return bout;
  });
  g.userData.regler = (x) => bouts.forEach((bout, i) => { bout.position.x = (i ? 1 : -1) * (TENDEUR.crochet + x); });
  g.userData.regler(0);
  return g;
}

/**
 * Foreuse à percussion électrique sans fil (étape 2), d'après la photo d'un
 * marteau perforateur à poignée fermée, avec batterie : mèche le long de −Z,
 * pointe à l'origine ; butée de profondeur réglée à 18 po. La mèche (30 mm)
 * perce le trou où glisse la tige du boulon à œil (22 mm). userData.prises :
 * où la tiennent les deux mains (poignée fermée à l'arrière, poignée latérale
 * à gauche), depuis la pointe de la mèche.
 */
export function hammerDrill(S, bit = 0.5) {
  const z0 = bit; // nez du mandrin
  const g = S.group(
    S.cyl(0.015, bit, 'steel', { axis: 'z', pos: [0, 0, bit / 2], seg: 12 }),
    S.cyl(0.026, 0.035, 'black', { axis: 'z', pos: [0, 0, z0 + 0.0175] }),
    S.cyl(0.034, 0.06, 'black', { axis: 'z', pos: [0, 0, z0 + 0.065] }),
    // Collier et poignée latérale, à gauche ; la butée de profondeur s'arrête à 18 po de la pointe.
    S.cyl(0.041, 0.03, 'black', { axis: 'z', pos: [0, 0, z0 + 0.115] }),
    S.cyl(0.021, 0.13, 'black', { axis: 'x', pos: [-0.115, 0, z0 + 0.115] }),
    S.cyl(0.03, 0.012, 'black', { axis: 'x', pos: [-0.052, 0, z0 + 0.115] }),
    S.cyl(0.004, z0 + 0.13 - HOLE, 'steel', { axis: 'z', pos: [0.012, 0.052, (HOLE + z0 + 0.13) / 2], seg: 8 }),
    // Carter rouge : canon, boîtier du moteur.
    S.cyl(0.04, 0.2, 'red', { axis: 'z', pos: [0, 0, z0 + 0.225] }),
    S.box(0.078, 0.2, 0.115, 'red', { r: 0.012, pos: [0, -0.1, z0 + 0.255] }),
    // Sans fil : batterie glissée sous le boîtier, jusque sous la poignée.
    S.box(0.082, 0.02, 0.2, 'black', { r: 0.006, pos: [0, -0.208, z0 + 0.3] }),
    S.box(0.09, 0.07, 0.15, 'black', { r: 0.012, pos: [0, -0.253, z0 + 0.3] }),
    S.box(0.092, 0.018, 0.06, 'red', { r: 0.004, pos: [0, -0.24, z0 + 0.3] }),
    // Sélecteur de fonction sur le flanc.
    S.cyl(0.027, 0.012, 'black', { axis: 'x', pos: [0.04, -0.01, z0 + 0.25] }),
    S.box(0.014, 0.012, 0.05, 'black', { pos: [0.048, -0.01, z0 + 0.25] }),
    // Poignée fermée et gâchette.
    S.box(0.05, 0.035, 0.12, 'red', { r: 0.008, pos: [0, 0.02, z0 + 0.37] }),
    S.box(0.045, 0.2, 0.04, 'black', { r: 0.012, pos: [0, -0.07, z0 + 0.42] }),
    S.box(0.045, 0.035, 0.1, 'red', { r: 0.008, pos: [0, -0.175, z0 + 0.365] }),
    S.box(0.02, 0.05, 0.016, 'black', { pos: [0, -0.02, z0 + 0.395] }),
  );
  g.userData.prises = { arriere: [0, -0.07, z0 + 0.42], cote: [-0.125, 0, z0 + 0.115] };
  return g;
}

/** Tournevis plat (étape 14), lame le long de −Z, pointe à l'origine. */
export function tournevis(S) {
  return S.group(
    S.cyl(0.0035, 0.15, 'steel', { axis: 'z', pos: [0, 0, 0.075], seg: 8 }),
    S.box(0.007, 0.0015, 0.02, 'steel', { pos: [0, 0, 0.008] }),
    S.cyl(0.015, 0.1, 'safety', { axis: 'z', pos: [0, 0, 0.2] }),
  );
}
