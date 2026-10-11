// P344 — Trousse de raccords des moteurs de translation CX027444 (page 344,
// sans illustration) : « KIT, FITTING (CP004810 TRACKS) », repère 17 de P328.
// Raccords posés sur les orifices des deux moteurs (P338 repère 51), la moitié
// de la trousse sur chaque moteur :
// - orifices de travail A et B (bride SAE code 62 3/4 po, dessus du bloc de
//   distribution) : 4 brides fendues 5 (deux demi-brides et joint torique,
//   FA01293-12), 4 coudes 45° 2 (bride code 62 → mâle JIC -12, FA01068-12-12)
//   tournés vers l'intérieur de la machine, 16 vis H 1 (4 par bride, M10
//   estimées) ;
// - drain (1/2 BSPP, face intérieure du bloc) : 2 adaptateurs droits 3
//   (BSPP -08 → JIC -08, FA01081-08-08) ;
// - pilotes (frein, deux vitesses ; 1/4 BSPP) : 4 coudes 90° 4 (BSPP -04 →
//   JIC -06, FA01082-04-06), sorties vers le haut.
// Repère : repère machine du train de chenilles (_porteur.js : TRACK,
// trackToMachine) — origine au sol au milieu entre les deux chenilles et au
// milieu de leur longueur, X vers l'avant, Y vers le haut, Z en travers ;
// chenille droite (RH) centrée en z = −V/2, gauche (LH, miroir) en
// z = +V/2, V = TRACK.gauge = 1.20 m. Les raccords sont donc exactement sur
// les orifices des moteurs tels que P336 les place (P336 en z = −V/2 et sa
// copie miroir en z = +V/2) ; P328 insère la trousse à l'origine de ce repère.
// Encombrement ≈ 0.10 (X, de −0.83 à −0.73) × 0.11 (Y, de 0.41 à 0.52)
// × 0.91 (Z, de −0.46 à +0.46) m.
import { gbxToTrack, gbxDirToTrack, trackToMachine, trackDirToMachine, racFactory, racPose, JIC } from './_porteur.js';
import { PORTS338 } from './P338.js';

export default function P344(api) {
  const { THREE, S } = api;
  const { lathe, merged, group } = S;
  const rf = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const out = (d, k) => d.map((v) => v * k);

  // Coude 45° à bride code 62 (le long de +Y : collet de bride à l'origine,
  // sortie JIC -12 dans le plan XY vers +X).
  const elbow45 = () => {
    const J = JIC[12], r = 0.0125;
    const head = lathe([[0, 0], [0.0175, 0], [0.0175, 0.008], [r, 0.010], [0, 0.010]], 'zinc', { seg: 10 });
    const yc = 0.028;
    const a = Math.PI / 4;
    const branch = group(rf.sleeve(r, 0, 0.012), rf.jicNose(J.t, 0.012));
    branch.position.set(0, yc, 0);
    branch.rotation.z = -a;
    return group(merged([head, rf.knuckle(r, yc, 0.009), branch], 'zinc'));
  };
  // Demi-bride fendue code 62 3/4 po (deux par bride) et joint torique.
  const LB = 0.0238, SB = 0.0119; // demi-entraxes des vis (long × court)
  const splitFlange = () => {
    const halves = [-1, 1].map((s) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 0.0145));
      m.position.set(0, 0.008 + 0.0105, s * 0.0083);
      return m;
    });
    const oring = lathe([[0.0155, -0.0012], [0.0185, -0.0012], [0.0185, 0.0012], [0.0155, 0.0012], [0.0155, -0.0012]], 'rubber', { seg: 10 });
    return group(merged(halves, 'zinc'), oring);
  };
  // Vis H M10 × 45 légère : tête six pans fermée dessus, tige à 4 pans.
  const bolt = (() => {
    const hr = 0.0085, hh = 0.0065;
    const head = new THREE.CylinderGeometry(hr, hr, hh, 6, 1, true).translate(0, hh / 2, 0);
    const top = new THREE.CircleGeometry(hr, 6).rotateX(-Math.PI / 2).translate(0, hh, 0);
    const shank = new THREE.CylinderGeometry(0.005, 0.005, 0.045, 4, 1, true).translate(0, -0.0225, 0);
    return merged([head, top, shank].map((g) => new THREE.Mesh(g)), 'zinc');
  })();

  for (const side of ['R', 'L']) {
    // Orifice de P338 → machine (P338 tourné de 180° dans P336, chenille
    // gauche en miroir).
    const M = (k) => ({
      p: trackToMachine(gbxToTrack(PORTS338[k].pos), side),
      d: trackDirToMachine(gbxDirToTrack(PORTS338[k].dir), side),
    });
    const inward = trackDirToMachine([0, 0, 1], side);
    // A et B : bride (long axe selon X machine), coude 45° tourné vers l'intérieur.
    for (const k of ['A', 'B']) {
      const { p, d } = M(k);
      // Grand axe de la bride selon Z machine (sens de la plage d'orifice).
      P('5', racPose(THREE, splitFlange(), p, d, [0, 0, 1]), out(d, 0.1));
      P('2', racPose(THREE, elbow45(), p, d, inward), out(d, 0.18));
      for (const sl of [-1, 1]) {
        for (const ss of [-1, 1]) {
          const bp = [p[0] + ss * SB, p[1] + 0.0265, p[2] + sl * LB];
          P('1', racPose(THREE, bolt.clone(), bp, d), out(d, 0.26));
        }
      }
    }
    // Drain : adaptateur droit vers l'intérieur.
    {
      const { p, d } = M('drain');
      P('3', racPose(THREE, rf.straight({ port: 'orb', pd: 8, jd: 8 }), p, d), out(d, 0.12));
    }
    // Pilotes : coudes 90°, sorties vers le haut.
    for (const k of ['X1', 'X2']) {
      const { p, d } = M(k);
      P('4', racPose(THREE, rf.elbow({ port: 'orb', pd: 4, jd: 6, angle: 90 }), p, d, [0, 1, 0]), out(d, 0.12));
    }
  }
  return { view: { dir: [-0.9, 0.8, 1.1] } };
}
