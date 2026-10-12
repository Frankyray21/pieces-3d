// P416 — Pont arrière « CLTR ASSY, REAR DECK DU311 10703 » CX038437 (page
// 416) : filtre coalescent (1) sur son support (4), enrouleur de câble type
// 20.1 K560 (2), moteur électrique 75 HP 575 V 365T (3), support du
// transformateur (5), transmission par courroies (6, P418) et pont arrière
// (7, P420 : cadre, capot, surpresseur, accessoires). Repère machine
// (../layout.js) ; constantes REEL et DRIVE de ../reardeck.js (axes des corps
// « reel », « flywheel » et « sheave » de la simulation).
// - Support du filtre coalescent (4, CX019875) : la même pièce est la ligne B
//   du capot P422 ; elle en est sortie ici pour être la ligne 4 (elle reste
//   dans P422 vu seul). Le filtre (1) pend sous sa console, tête en haut.
// - Enrouleur (2) : tambour à axe longitudinal (selon X) en REEL, deux joues
//   Ø 1,1 m à huit rayons, noyau Ø 0,4 m garni du câble 600 V (spires
//   jointives), arbre sur deux chevalets posés sur le plancher du pont ;
//   motoréducteur (réducteur à arbre creux, moteur hydraulique) et collecteur
//   tournant côté arrière ; corps « reel » pour les pièces tournantes.
// - Moteur 75 HP (3) : carcasse 365T (hauteur d'axe 9 po) sur sa semelle
//   (P488 rep. 19), arbre Ø 2 3/8 po vers −Z portant la poulie de P418 en
//   DRIVE ; carcasse à ailettes, capot de ventilateur à grille côté +Z,
//   boîte à bornes et anneau de levage ; arbre « sheave ».
// - Support du transformateur (5) : console en tôle pliée 1/4 po boulonnée sur
//   la face extérieure du flanc gauche, à l'avant du pont.
import { body } from '../layout.js';
import { REEL, DRIVE } from '../reardeck.js';
import { SHEAVE_AT } from './P418.js';

const IN = 0.0254;
const FLOOR = 0.5; // dessus du plancher du pont
const PAD = 0.531; // dessus de la semelle du moteur (P488 rep. 19)

export default function P416(api) {
  const { THREE, S } = api;
  const { box, cyl, ring, torus, lathe, tube, cable, bolt, merged, enclosure, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 7 — pont arrière ; 4 — support du filtre coalescent sorti du capot P422 (ligne B)
  const deck = api.sub('P420');
  deck.updateMatrixWorld(true);
  const canopy = (deck.userData.parts || []).find((p) => p.userData.partRef === '2');
  let mount = null;
  if (canopy) {
    const list = canopy.userData.parts || [];
    const k = list.findIndex((p) => p.userData.partRef === 'B');
    if (k >= 0) {
      mount = list[k];
      list.splice(k, 1);
      const m = mount.matrixWorld.clone();
      mount.parent.remove(mount);
      mount.matrix.copy(m);
      mount.matrix.decompose(mount.position, mount.quaternion, mount.scale);
    }
  }
  P('7', deck, [0, 0, 0]);
  if (mount) P('4', mount, [-0.12, 0.05, 0]);

  // 1 — filtre coalescent 1/2 NPT : tête en fonte d'alu (deux orifices), cuve et purge
  {
    const box4 = mount ? new THREE.Box3().setFromObject(mount) : new THREE.Box3(new THREE.Vector3(-3.05, 1.62, 0.53), new THREE.Vector3(-2.82, 1.91, 0.67));
    const c = box4.getCenter(new THREE.Vector3());
    const x = c.x, z = c.z, yTop = box4.min.y;
    P('1', group(
      at(box(0.075, 0.07, 0.075, 'castAlu', { r: 0.006 }), [x, yTop - 0.035, z]),
      ...[1, -1].map((s) => at(cyl(0.013, 0.025, 'castAlu', { axis: 'x', seg: 16 }), [x + s * 0.048, yTop - 0.035, z])),
      lathe([[0, 0], [0.034, 0], [0.042, 0.01], [0.042, 0.2], [0.038, 0.22], [0.02, 0.235], [0, 0.235]], 'castAlu', { seg: 32 })
        .translateX(x).translateY(yTop - 0.07 - 0.235).translateZ(z),
      at(ring(0.044, 0.04, 0.012, 'black', { seg: 32 }), [x, yTop - 0.08, z]),
      at(box(0.012, 0.12, 0.004, 'glass'), [x, yTop - 0.19, z + 0.042]),
      at(cyl(0.008, 0.03, 'brass', { seg: 12 }), [x, yTop - 0.07 - 0.25, z]),
      at(cyl(0.012, 0.012, 'red', { seg: 12 }), [x, yTop - 0.004, z]),
    ), [0, -0.1, 0.3]);
  }

  // 2 — enrouleur de câble type 20.1 K560
  {
    const { x: rx, y: ry, r: rr, w } = REEL;
    const joue = (s) => {
      const xs = rx + s * w / 2;
      const spokes = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const rm = (rr + 0.2) / 2;
        return at(box(0.012, rr - 0.2, 0.05, 'grey'), [xs, ry + Math.cos(a) * rm, Math.sin(a) * rm], [a, 0, 0]);
      });
      return group(
        at(ring(rr, rr - 0.035, 0.016, 'grey', { axis: 'x', seg: 72 }), [xs, ry, 0]),
        at(torus(rr - 0.0175, 0.006, 'grey', { axis: 'x', seg: 72 }), [xs - s * 0.01, ry, 0]),
        merged(spokes, 'grey'),
        at(ring(0.22, 0.04, 0.02, 'grey', { axis: 'x', seg: 40 }), [xs, ry, 0]),
        merged(Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return at(bolt(0.375 * IN, 1 * IN, 'zinc', { axis: 'x' }), [xs + s * 0.01, ry + Math.cos(a) * 0.17, Math.sin(a) * 0.17], [0, 0, s > 0 ? 0 : Math.PI]);
        }), 'zinc'),
      );
    };
    // câble 600 V : spires jointives sur le noyau (couches extérieures en hélice légère)
    const turns = [];
    for (let k = 0; k < 9; k++) turns.push(at(torus(0.34, 0.021, 'rubber', { axis: 'x', seg: 56 }), [rx - w / 2 + 0.03 + k * 0.05, ry, 0]));
    const drum = group(
      joue(1), joue(-1),
      at(cyl(0.2, w, 'grey', { axis: 'x', seg: 48 }), [rx, ry, 0]),
      at(cyl(0.32, w - 0.04, 'rubber', { axis: 'x', seg: 56 }), [rx, ry, 0]),
      merged(turns, 'rubber'),
      at(cyl(0.035, w + 0.36, 'steel', { axis: 'x', seg: 24 }), [rx, ry, 0]),
    );
    // sortie du câble (vers le guide-câble arrière droit) et presse-étoupe sur le noyau
    const lead = cable([[rx + 0.1, ry - 0.36, 0.05], [rx - 0.2, ry - 0.45, 0.35], [-3.9, 1.1, 0.62], [-4.27, 1.25, 0.6]], 0.021, { material: 'rubber' });
    // chevalets (tube carré 3 po) sur le plancher, paliers à semelle
    const stand = (x) => group(
      ...[1, -1].map((s) => tube([[x, FLOOR, s * 0.22], [x, ry - 0.06, s * 0.03]], 0.035, 'lightGrey', { sharp: true, seg: 4 })),
      at(box(0.08, 0.012, 0.52, 'lightGrey'), [x, FLOOR + 0.006, 0]),
      at(box(0.09, 0.06, 0.16, 'castIron', { r: 0.008 }), [x, ry - 0.045, 0]),
      at(cyl(0.05, 0.07, 'castIron', { axis: 'x', seg: 24 }), [x, ry, 0]),
      merged([-0.06, 0.06].map((z) => at(bolt(0.5 * IN, 1.5 * IN, 'zinc'), [x, ry - 0.014, z])), 'zinc'),
    );
    const xr = rx - w / 2 - 0.12, xf = rx + w / 2 + 0.1;
    // motoréducteur côté arrière : réducteur à arbre creux, moteur hydraulique orbital, flexibles
    const drive = group(
      at(box(0.12, 0.24, 0.22, 'charcoal', { r: 0.02 }), [xr - 0.1, ry, 0]),
      at(cyl(0.065, 0.12, 'charcoal', { axis: 'z', seg: 32 }), [xr - 0.1, ry + 0.04, 0.17]),
      at(cyl(0.05, 0.03, 'steel', { axis: 'z', seg: 24 }), [xr - 0.1, ry + 0.04, 0.245]),
      ...[1, -1].map((s) => at(cyl(0.012, 0.03, 'steel', { axis: 'y', seg: 12 }), [xr - 0.1 + s * 0.03, ry + 0.115, 0.17])),
      // bras de réaction vers le chevalet arrière
      at(box(0.012, 0.3, 0.05, 'lightGrey'), [xr - 0.03, ry - 0.2, -0.08]),
      // collecteur tournant (bagues) et boîte à bornes en bout d'arbre
      at(cyl(0.06, 0.1, 'grey', { axis: 'x', seg: 32 }), [xr - 0.21, ry, 0]),
      at(enclosure(0.12, 0.14, 0.1, 'grey'), [xr - 0.3, ry, 0]),
    );
    P('2', group(body('reel', drum), lead, stand(xr), stand(xf), drive), [0, 0.6, 0]);
  }

  // 3 — moteur électrique 75 HP 365T (TEFC), arbre vers −Z dans le plan des courroies
  {
    const [mx, my] = [DRIVE.x, DRIVE.yMotor];
    const z0 = -0.3, z1 = 0.24, R = 0.205;
    const fins = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return at(box(0.012, 0.035, z1 - z0 - 0.06, 'blue'), [mx + Math.cos(a) * (R + 0.012), my + Math.sin(a) * (R + 0.012), (z0 + z1) / 2], [0, 0, a + Math.PI / 2]);
    });
    P('3', group(
      at(cyl(R, z1 - z0, 'blue', { axis: 'z', seg: 48 }), [mx, my, (z0 + z1) / 2]),
      merged(fins, 'blue'),
      // flasques et capot de ventilateur à grille
      at(cyl(R + 0.02, 0.05, 'blue', { axis: 'z', seg: 48 }), [mx, my, z0 - 0.02]),
      at(cyl(R + 0.02, 0.04, 'blue', { axis: 'z', seg: 48 }), [mx, my, z1 + 0.02]),
      at(cyl(R + 0.01, 0.1, 'blue', { axis: 'z', seg: 48, r2: R - 0.02 }), [mx, my, z1 + 0.09]),
      merged([0.05, 0.1, 0.15].map((r) => at(torus(r, 0.004, 'steel', { axis: 'z', seg: 40 }), [mx, my, z1 + 0.142])), 'steel'),
      // pattes (365T : entraxe 14 × 11 1/4 po) boulonnées sur la semelle
      ...[1, -1].map((s) => at(box(0.07, my - R - PAD + 0.05, z1 - z0 - 0.04, 'blue'), [mx + s * 0.155, (PAD + my - R + 0.05) / 2, (z0 + z1) / 2])),
      merged([1, -1].flatMap((s) => [-0.143, 0.143].map((dz) => at(bolt(0.625 * IN, 2.5 * IN, 'zinc'), [mx + s * 0.178, PAD + 0.025, -0.03 + dz]))), 'zinc'),
      // boîte à bornes et presse-étoupe, anneau de levage
      at(box(0.2, 0.15, 0.17, 'blue', { r: 0.012 }), [mx + 0.05, my + R + 0.07, 0.02]),
      at(cyl(0.025, 0.05, 'black', { axis: 'x', seg: 16 }), [mx + 0.175, my + R + 0.06, 0.02]),
      at(torus(0.03, 0.008, 'steel', { axis: 'z', seg: 24 }), [mx - 0.06, my + R + 0.05, -0.08]),
      // bout d'arbre Ø 2 3/8 po et clavette (tourne avec la poulie)
      body('sheave', group(
        at(cyl(1.1875 * IN, SHEAVE_AT[2] - z0 > 0 ? 0.1 : z0 - SHEAVE_AT[2] + 0.06, 'steel', { axis: 'z', seg: 24 }), [mx, my, (z0 + SHEAVE_AT[2]) / 2 - 0.03]),
        at(box(0.016, 0.01, 0.12, 'steel'), [mx, my + 1.1875 * IN, SHEAVE_AT[2] + 0.02]),
      )),
    ), [0, -0.3, 0.45]);
  }

  // 5 — support du transformateur : console pliée 1/4 po sur la face extérieure du flanc gauche
  P('5', group(
    at(box(0.4, 0.36, 0.0064, 'lightGrey'), [-3.0, 0.74, -0.8757]),
    at(box(0.4, 0.0064, 0.16, 'lightGrey'), [-3.0, 0.563, -0.955]),
    ...[1, -1].map((s) => at(box(0.0064, 0.12, 0.16, 'lightGrey'), [-3.0 + s * 0.197, 0.623, -0.955])),
    merged([-0.15, 0.15].flatMap((dx) => [0.66, 0.86].map((y) => at(bolt(0.5 * IN, 1.25 * IN, 'zinc', { axis: 'z' }), [-3.0 + dx, y, -0.879], [Math.PI, 0, 0]))), 'zinc'),
  ), [0, 0, -0.45]);

  // 6 — transmission par courroies (P418, origine sur l'axe de l'arbre du moteur)
  P('6', at(api.sub('P418'), SHEAVE_AT), [0, 0, -0.55]);
  return { view: { dir: [-1.1, 0.7, 1.0] } };
}
