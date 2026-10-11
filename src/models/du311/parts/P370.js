// P370 — Réservoir de graisse 32 litres CM18214 rév. 6 (page 370) : « TANK
// ASSEMBLY, 32 LITRE », repère 1 de P368. Caisson mécano-soudé en tôle de
// 3/16 po (6) : dessus percé d'une ouverture rectangulaire à cadre taraudé,
// d'un manchon 1 NPT (reniflard) et du passage du tirant de la pompe ; deux
// pattes de fixation pliées soudées au pied des petites faces ; trois voyants
// de niveau (2) étagés sur la petite face −X ; deux bouchons à six-pans creux
// noyés (9) sur la petite face +X. Couvercle (5) boulonné sur le cadre par
// 10 vis H 3/8 × 3/4 (10) et rondelles Grower (11), joint plat (7) dessous ;
// col de remplissage soudé au couvercle, fermé par le bouchon à quatre ergots
// (3) ; réducteur six-pans 1 NPT × 3/4 (8) et reniflard (1). Joint (4) entre
// le fond du réservoir et la bride d'aspiration de la pompe (P368 repère 2).
// Repère : origine au centre du dessous du fond, Y vers le haut, X selon la
// grande face (couvercle vers −X), Z selon la profondeur. Caisson 0.40 (X) ×
// 0.30 (Y) × 0.27 (Z) m = 32 L ; pattes de fixation jusqu'à x = ±0.255, dessus
// des bouchons à y ≈ 0.36. Aspiration de la pompe : orifice Ø 75 mm du fond en
// (x, z) = PUMP (exporté), tirant de pompe au même aplomb à travers le dessus.

import { IN, kit } from './_porteur.js';

export const TANK = { w: 0.40, h: 0.30, d: 0.27, t: 0.1875 * IN };
export const PUMP = { x: 0.06, z: 0.05, r: 0.0375 };
const CV = { x: -0.105, w: 0.13, d: 0.235 }; // couvercle : centre X, largeur X, longueur Z
const NECK = { z: 0.035, r: 0.056, h: 0.05 }; // col de remplissage sur le couvercle
const BR = { x: 0.07, z: -0.07 }; // reniflard
// Voyants (y, z) sur la face −X ; bouchons (y) sur la face +X.
const GLASS = [[0.07, 0.07], [0.15, 0.07], [0.23, 0.07]];
const PLUG_Y = [0.06, 0.24];

export default function P370(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const T_ = kit(api);
  const { plate } = T_;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Six-pans (surplat af, hauteur h) centré en y.
  const hexM = (af, h, y, m = 'zinc') => merged([at(new THREE.Mesh(new THREE.CylinderGeometry(af / Math.sqrt(3), af / Math.sqrt(3), h, 6)), [0, y, 0])], m);
  const { w: W, h: H, d: D, t: T } = TANK;
  // Perçages du cadre / couvercle : 4 par grand côté, 1 par petit côté.
  const holesCV = [];
  for (const z of [-0.09, -0.03, 0.03, 0.09]) for (const s of [-1, 1]) holesCV.push([s * (CV.w / 2 - 0.014), z]);
  holesCV.push([0, -CV.d / 2 + 0.014], [0, CV.d / 2 - 0.014]);

  // ---------------------------------------------------------------- 6 — caisson
  const shell = [
    box(W, T, D, 'grey', { pos: [0, T / 2, 0] }),
    box(T, H - 2 * T, D, 'grey', { pos: [-W / 2 + T / 2, H / 2, 0] }),
    box(T, H - 2 * T, D, 'grey', { pos: [W / 2 - T / 2, H / 2, 0] }),
    box(W, H - 2 * T, T, 'grey', { pos: [0, H / 2, -D / 2 + T / 2] }),
    box(W, H - 2 * T, T, 'grey', { pos: [0, H / 2, D / 2 - T / 2] }),
  ];
  // Dessus percé : ouverture du couvercle, manchon du reniflard, tirant de pompe.
  const top = plate(W, D, T, 'grey', {
    cutouts: [[CV.x, 0, CV.w - 0.05, CV.d - 0.05]],
    holes: [[BR.x, BR.z, 0.022], [PUMP.x, PUMP.z, 0.012]],
  });
  top.position.y = H - T / 2;
  // Cadre taraudé soudé autour de l'ouverture (1/4 po).
  const frame = plate(CV.w, CV.d, 0.25 * IN, 'grey', { cutouts: [[0, 0, CV.w - 0.05, CV.d - 0.05]], r: 0.006 });
  frame.position.set(CV.x, H + 0.125 * IN, 0);
  // Manchon 1 NPT soudé (reniflard), bossage du tirant de pompe.
  const sock = lathe([[0.017, H], [0.024, H], [0.024, H + 0.022], [0.017, H + 0.022]], 'grey', { seg: 16, pos: [BR.x, 0, BR.z] });
  const boss = lathe([[0.012, H], [0.02, H], [0.02, H + 0.008], [0.012, H + 0.008]], 'grey', { seg: 14, pos: [PUMP.x, 0, PUMP.z] });
  // Fond : bride d'aspiration usinée sous l'orifice de la pompe.
  const suction = lathe([[PUMP.r, -0.006], [PUMP.r + 0.016, -0.006], [PUMP.r + 0.016, 0], [PUMP.r, 0]], 'grey', { seg: 20, pos: [PUMP.x, 0, PUMP.z] });
  // Pattes pliées (1/4 po) au pied des petites faces, deux trous Ø 7/16.
  const feet = [];
  for (const s of [-1, 1]) {
    const foot = plate(0.055, 0.2, 0.25 * IN, 'grey', { holes: [[0, -0.065, 0.0056], [0, 0.065, 0.0056]], r: 0.004 });
    foot.position.set(s * (W / 2 + 0.0275), 0.125 * IN, 0);
    feet.push(foot);
    feet.push(box(0.25 * IN, 0.05, 0.2, 'grey', { pos: [s * (W / 2 + 0.125 * IN), 0.025, 0] }));
    for (const z of [-0.095, 0.095]) {
      const g = S.extrude([[0, 0], [0.045, 0], [0, 0.045]], 0.25 * IN, 'grey');
      g.position.set(s * W / 2, 0.006, z);
      if (s < 0) g.rotation.y = Math.PI;
      feet.push(g);
    }
  }
  // Bossages des voyants (−X) et des bouchons (+X).
  const lugs = [];
  for (const [y, z] of GLASS) lugs.push(at(cyl(0.022, 0.006, 'grey', { axis: 'x', seg: 16 }), [-W / 2 - 0.003, y, z]));
  for (const y of PLUG_Y) lugs.push(at(cyl(0.02, 0.006, 'grey', { axis: 'x', seg: 16 }), [W / 2 + 0.003, y, 0.05]));
  P('6', merged([...shell, top, frame, sock, boss, suction, ...feet, ...lugs], 'grey'), [0, 0, 0]);

  // ---------------------------------------------------------------- 7 — joint ; 5 — couvercle ; 10, 11 — vis
  const yF = H + 0.25 * IN; // dessus du cadre
  const gasket = plate(CV.w, CV.d, 0.002, 'rubber', { cutouts: [[0, 0, CV.w - 0.05, CV.d - 0.05]], holes: holesCV.map(([x, z]) => [x, z, 0.005]), r: 0.006 });
  gasket.position.set(CV.x, yF + 0.001, 0);
  P('7', gasket, [0, 0.08, 0]);
  const yC = yF + 0.002; // dessous du couvercle
  const lid = plate(CV.w, CV.d, 0.1875 * IN, 'grey', { holes: [...holesCV.map(([x, z]) => [x, z, 0.0052]), [0, NECK.z, NECK.r - 0.004]], r: 0.006 });
  lid.position.set(CV.x, yC + 0.09375 * IN, 0);
  const neck = lathe([[NECK.r - 0.004, yC], [NECK.r, yC], [NECK.r, yC + NECK.h], [NECK.r - 0.004, yC + NECK.h]], 'grey', { seg: 32, pos: [CV.x, 0, NECK.z] });
  P('5', merged([lid, neck], 'grey'), [0, 0.16, 0]);
  const yB = yC + 0.1875 * IN;
  holesCV.forEach(([x, z], i) => {
    P('11', T_.lock(0.375 * IN, 'zinc', { pos: [CV.x + x, yB, z] }), [0, 0.22, 0]);
    P('10', T_.screw(0.375 * IN, 0.75 * IN, 'zinc', { pos: [CV.x + x, yB + 0.0024, z] }), [0, 0.27, 0]);
    void i;
  });

  // ---------------------------------------------------------------- 3 — bouchon du col (quatre ergots)
  const yN = yC + NECK.h;
  const cap = lathe([
    [NECK.r - 0.008, yN - 0.03], [NECK.r - 0.006, yN - 0.03], [NECK.r - 0.006, yN - 0.002], [NECK.r + 0.006, yN - 0.002],
    [NECK.r + 0.008, yN + 0.003], [NECK.r + 0.008, yN + 0.016], [NECK.r + 0.004, yN + 0.02], [0, yN + 0.02],
  ], 'black', { seg: 32 });
  const lugsCap = [0, Math.PI / 2].map((a) => box(2 * NECK.r + 0.01, 0.012, 0.007, 'black', { r: 0.002, pos: [0, yN + 0.025, 0], rot: [0, a, 0] }));
  P('3', at(group(cap, ...lugsCap), [CV.x, 0, NECK.z]), [0, 0.34, 0]);

  // ---------------------------------------------------------------- 8 — réducteur 1 NPT × 3/4 ; 1 — reniflard
  const yS = H + 0.022;
  const bush = group(
    lathe([[0.012, yS - 0.02], [0.0165, yS - 0.02], [0.0165, yS], [0.012, yS]], 'zinc', { seg: 12 }),
    hexM(0.038, 0.009, yS + 0.0045),
  );
  P('8', at(bush, [BR.x, 0, BR.z]), [0, 0.1, 0]);
  const yR = yS + 0.009;
  const breather = group(
    lathe([[0, yR], [0.01, yR], [0.01, yR + 0.012], [0, yR + 0.012]], 'zinc', { seg: 10 }),
    lathe([[0, yR + 0.01], [0.032, yR + 0.012], [0.035, yR + 0.016], [0.035, yR + 0.04], [0.031, yR + 0.046], [0.024, yR + 0.048], [0, yR + 0.048]], 'black', { seg: 24 }),
  );
  // Nervures moletées de la coiffe.
  const ribs = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ribs.push(box(0.004, 0.024, 0.005, 'black', { pos: [Math.cos(a) * 0.035, yR + 0.028, Math.sin(a) * 0.035], rot: [0, -a, 0] }));
  }
  breather.add(merged(ribs, 'black'));
  P('1', at(breather, [BR.x, 0, BR.z]), [0, 0.18, 0]);

  // ---------------------------------------------------------------- 2 — voyants de niveau (×3), face −X
  for (const [y, z] of GLASS) {
    const sight = group(
      hexM(0.03, 0.01, 0.005),
      lathe([[0, 0.01], [0.011, 0.01], [0.011, 0.013], [0, 0.013]], 'glass', { seg: 16 }),
      lathe([[0.011, 0.01], [0.0135, 0.01], [0.0135, 0.0125], [0.011, 0.0125]], 'zinc', { seg: 16 }),
    );
    sight.rotation.z = Math.PI / 2;
    sight.position.set(-W / 2 - 0.006, y, z);
    P('2', sight, [-0.06, 0, 0]);
  }

  // ---------------------------------------------------------------- 9 — bouchons noyés (×2), face +X
  for (const y of PLUG_Y) {
    const pl = lathe([[0.0045, 0.0005], [0.013, 0.0005], [0.0132, -0.016], [0, -0.016], [0, -0.003], [0.0045, -0.003]], 'darkSteel', { seg: 6, axis: 'x' });
    P('9', at(pl, [W / 2 + 0.006, y, 0.05]), [0.06, 0, 0]);
  }

  // ---------------------------------------------------------------- 4 — joint pompe / réservoir (sous le fond)
  P('4', at(S.ring(PUMP.r + 0.014, PUMP.r + 0.002, 0.003, 'rubber', { seg: 28 }), [PUMP.x, -0.0075, PUMP.z]), [0, -0.08, 0]);

  return { view: { dir: [-1, 0.9, 1.1] } };
}
