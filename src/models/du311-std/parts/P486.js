// P486 — Vanne papillon motorisée CP002394 « ACTUATOR ASSY » (page 486),
// repère 2 de P482 (coupure de l'admission d'air de mine). Vanne papillon
// 3 po à oreilles de centrage (3, CP002399) : corps fonte à manchette
// élastomère débordant sur les deux faces, papillon inox visible dans le
// passage, col et platine ISO 5211 ; étrier de liaison en tôle pliée (cadre
// ajouré, vu de face à la page 486) et accouplement ; actionneur pneumatique
// double effet à crémaillères (1, CP006818) : corps profilé en alu, deux
// flasques vissés, arbre de sortie à indicateur de position ; distributeur
// monostable 5/2 24 V CC (2, CP002400) monté NAMUR sur la face de
// l'actionneur, bobine et connecteur DIN, trois orifices 1/4 NPT sur sa face
// supérieure (reçoivent P482 rep. 19).
// Repère : origine au centre du papillon, sur l'axe de la tuyauterie ; X
// selon l'axe de passage (faces de la manchette à x = ±ACT.face), Y selon
// la tige vers l'actionneur, +Z côté distributeur.
// Encombrement ≈ 0.20 (X) × 0.36 (Y) × 0.21 (Z) m. Cotes : vanne 3 po
// (entre brides 150 lb, face à face 46 mm) ; actionneur et distributeur aux
// proportions de la page 486.
import { I, hexProf } from './_rearb.js';

const W = 0.046; // face à face de la vanne
const YT = 0.118, YA = 0.178, HA = 0.082; // platine de vanne, dessous de l'actionneur, hauteur du corps
const LA = 0.19, DA = 0.085; // longueur (X) et profondeur (Z) du corps d'actionneur
export const ACT = {
  face: W / 2,
  // Orifices 1/4 NPT du distributeur (faces à y = ports[i][1], vers +Y).
  ports: [[-0.022, YA + HA - 0.006, DA / 2 + 0.03], [0, YA + HA - 0.006, DA / 2 + 0.03], [0.022, YA + HA - 0.006, DA / 2 + 0.03]],
};

export default function P486(api) {
  const { THREE, S } = api;
  const { lathe, box, cyl, extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- 3 — vanne papillon
  {
    const rb = I(1.5); // passage
    const body = [
      lathe([[rb, -W / 2 + 0.004], [I(2.35), -W / 2 + 0.004], [I(2.45), -W / 2 + 0.008], [I(2.45), W / 2 - 0.008], [I(2.35), W / 2 - 0.004], [rb, W / 2 - 0.004], [rb, -W / 2 + 0.004]], 'castIron', { axis: 'x', seg: 40 }),
      // Col jusqu'à la platine, bossage inférieur, oreilles de centrage (passages des tiges).
      cyl(I(0.62), YT - I(2.3), 'castIron', { seg: 20, pos: [0, (YT + I(2.3)) / 2, 0] }),
      box(0.03, 0.014, 0.075, 'castIron', { r: 0.004, pos: [0, YT - 0.007, 0] }),
      box(0.06, 0.012, 0.06, 'castIron', { r: 0.003, pos: [0, YT - 0.006, 0] }),
      cyl(I(0.55), I(0.55), 'castIron', { seg: 18, pos: [0, -I(2.55), 0] }),
    ];
    for (const a of [Math.PI / 4, -Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4]) {
      body.push(at(box(W - 0.012, I(0.6), I(0.75), 'castIron', { r: 0.003 }), [0, Math.sin(a) * I(2.75), Math.cos(a) * I(2.75)], [a, 0, 0]));
    }
    // Manchette élastomère : bourrelets des deux faces et revêtement du passage.
    const liner = lathe([[rb * 0.98, -W / 2], [I(2.3), -W / 2], [I(2.3), -W / 2 + 0.004], [rb * 1.02, -W / 2 + 0.004], [rb * 1.02, W / 2 - 0.004], [I(2.3), W / 2 - 0.004], [I(2.3), W / 2], [rb * 0.98, W / 2], [rb * 0.98, -W / 2]], 'rubber', { axis: 'x', seg: 40 });
    // Papillon (lentille inox) entrouvert, axe selon Y, moyeu.
    const disc = group(
      lathe([[0, -0.006], [rb * 0.96, -0.0015], [rb * 0.97, 0], [rb * 0.96, 0.0015], [0, 0.006]], 'steel', { axis: 'x', seg: 32 }),
      cyl(0.008, rb * 1.9, 'steel', { seg: 12 }),
    );
    disc.rotation.y = 0.25;
    // Tige carrée sortant de la platine.
    const stem = box(0.011, 0.02, 0.011, 'steel', { pos: [0, YT + 0.01, 0] });
    P('3', group(merged(body, 'castIron'), liner, merged([disc, stem], 'steel')), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 1 — actionneur (avec étrier et accouplement)
  {
    // Étrier : deux joues en tôle 5 mm ajourées entre la platine et l'actionneur, semelles vissées.
    const yoke = [];
    for (const s of [-1, 1]) {
      const m = extrude([[-0.045, YT], [0.045, YT], [0.045, YA], [-0.045, YA]], 0.005, 'black', { holes: [[0, (YT + YA) / 2, 0.016]] });
      m.position.z = s * 0.035;
      yoke.push(m);
    }
    yoke.push(box(0.09, 0.005, 0.075, 'black', { pos: [0, YT + 0.0025, 0] }), box(0.09, 0.005, 0.075, 'black', { pos: [0, YA - 0.0025, 0] }));
    const coupling = cyl(0.012, YA - YT - 0.01, 'steel', { seg: 16, pos: [0, (YT + YA) / 2, 0] });
    // Corps profilé : section à pans coupés, rainures NAMUR, deux flasques à quatre vis.
    const yc = YA + HA / 2;
    const sec = [[-DA / 2 + 0.008, -HA / 2], [DA / 2 - 0.008, -HA / 2], [DA / 2, -HA / 2 + 0.008], [DA / 2, HA / 2 - 0.008], [DA / 2 - 0.008, HA / 2], [-DA / 2 + 0.008, HA / 2], [-DA / 2, HA / 2 - 0.008], [-DA / 2, -HA / 2 + 0.008]];
    const prof = extrude(sec, LA - 0.03, 'castAlu');
    const pr = at(group(prof), [0, yc, 0], [0, Math.PI / 2, 0]);
    const caps = [-1, 1].map((s) => box(0.015, HA + 0.002, DA + 0.002, 'castAlu', { r: 0.006, pos: [s * (LA / 2 - 0.0075), yc, 0] }));
    const grooves = [-1, 1].map((s) => box(LA - 0.04, 0.003, 0.002, 'castAlu', { pos: [0, yc + s * 0.012, DA / 2 + 0.001] }));
    const screws = [];
    for (const s of [-1, 1]) for (const [dy, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      screws.push(at(S.bolt(0.006, 0.02, 'steel', { axis: s > 0 ? 'x' : '-x' }), [s * LA / 2, yc + dy * (HA / 2 - 0.012), dz * (DA / 2 - 0.012)]));
    }
    // Arbre de sortie et indicateur de position sur le dessus.
    const ind = [cyl(0.009, 0.012, 'steel', { seg: 16, pos: [0, YA + HA + 0.006, 0] })];
    const indY = [box(0.05, 0.008, 0.012, 'yellow', { r: 0.003, pos: [0, YA + HA + 0.016, 0] })];
    // Plaque signalétique sur la face −Z.
    const tag = at(S.nameplate(0.09, 0.035), [0, yc, -DA / 2 - 0.0002], [0, Math.PI, 0]);
    P('1', group(merged(yoke, 'black'), merged([coupling, ...screws, ...ind], 'steel'), merged([pr, ...caps, ...grooves], 'castAlu'), merged(indY, 'yellow'), tag), [0, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 2 — distributeur 5/2 NAMUR 24 V CC
  {
    const z0 = DA / 2, zc = z0 + 0.025, y0 = YA + 0.012, y1 = YA + HA - 0.006;
    const body = [
      box(0.075, y1 - y0, 0.05, 'castAlu', { r: 0.003, pos: [0, (y0 + y1) / 2, zc] }),
      box(0.03, y1 - y0 - 0.01, 0.006, 'castAlu', { r: 0.002, pos: [0.045, (y0 + y1) / 2, zc - 0.012] }),
    ];
    // Vis de fixation NAMUR (deux) et bossages des orifices sur la face supérieure.
    const steel = [
      at(S.bolt(0.005, 0.06, 'steel', { axis: 'z' }), [-0.026, (y0 + y1) / 2, zc + 0.025]),
      at(S.bolt(0.005, 0.06, 'steel', { axis: 'z' }), [0.026, (y0 + y1) / 2, zc + 0.025]),
    ];
    for (const [x] of ACT.ports) body.push(lathe(hexProf(0.014, y1 - 0.004, y1), 'castAlu', { seg: 12, pos: [x, 0, zc + 0.005] }));
    // Opérateur et bobine côté +X : tube culasse, bobine carrée, connecteur DIN.
    const tubeX = 0.06;
    const op = cyl(0.007, 0.03, 'steel', { axis: 'x', seg: 14, pos: [0.0375 + 0.015, (y0 + y1) / 2, zc] });
    const coil = group(
      merged([
        box(0.034, 0.038, 0.038, 'plastic', { r: 0.003, pos: [tubeX + 0.0, (y0 + y1) / 2, zc] }),
        box(0.028, 0.03, 0.012, 'plastic', { r: 0.002, pos: [tubeX, (y0 + y1) / 2, zc + 0.025] }),
        box(0.022, 0.022, 0.01, 'plastic', { r: 0.002, pos: [tubeX, (y0 + y1) / 2, zc + 0.036] }),
      ], 'plastic'),
      S.nut(0.016, 0.006, 'zinc', { axis: 'x', pos: [tubeX + 0.02, (y0 + y1) / 2, zc] }),
    );
    // Commande manuelle (bouton rouge) côté −X.
    const man = cyl(0.005, 0.006, 'red', { axis: 'x', seg: 12, pos: [-0.0405, (y0 + y1) / 2 + 0.008, zc] });
    P('2', group(merged(body, 'castAlu'), merged([...steel, op], 'steel'), coil, man), [0, 0.06, 0.1]);
  }

  void THREE;
  return { view: { dir: [0.8, 0.6, 1.0] } };
}
