// Chantier de l'installation (page P02) : la galerie et le plancher de foreuse
// du modèle « plancher-dd » (section 1), la paroi de roche avec son grillage et
// son soutènement, le support contre la paroi, pieds sur le plancher.
// Repère du chantier (mètres) : X le long de la paroi (−X à gauche quand on lui
// fait face), Y vers le haut (0 = dessus du plancher), +Z vers l'intérieur de
// la galerie ; paroi à Z ≈ −1, pieds du support à Z = 0.
import { buildProcedural } from '../../viewer/assembly.js';
import plancher from '../plancher-dd/index.js';
import { gallery, wallZ as rockZ } from '../plancher-dd/site.js';
import { DECK, SEC, DRILL } from '../plancher-dd/plan.js';

export { DECK, SEC, DRILL };
import { IN, T2, XP, H_TOP, WALL, W } from './support.js';

export const WALL_Z = W(0, H_TOP + T2 / 2, -WALL)[2]; // plan d'appui des pattes du haut
export const FT5 = 60 * IN; // 5 pi

// Étape 1 : près du mur et loin de la ligne de tir (la foreuse fore vers le
// front de taille, au centre de la galerie) : contre la paroi, à l'arrière de
// la section. Le décor est tourné de quelques degrés au plus autour de la
// verticale (yaw) pour que les deux pattes du haut s'appuient sur la paroi,
// comme le demande l'étape 4 : repère du chantier = Ry(yaw) · (repère du plancher − Q0).
const ARM_Y = W(0, H_TOP, -WALL)[1];
export const MINE = (() => {
  const x0 = 3.3;
  let yaw = 0, zq = 0, e = [0, 0];
  for (let it = 0; it < 40; it++) {
    e = [-1, 1].map((s) => {
      const qx = s * XP * Math.cos(yaw) - WALL_Z * Math.sin(yaw) + x0;
      const qz = s * XP * Math.sin(yaw) + WALL_Z * Math.cos(yaw) + zq;
      return qz - rockZ(-1, qx, ARM_Y + DECK);
    });
    zq -= (e[0] + e[1]) / 2;
    yaw -= (e[1] - e[0]) / (2 * XP);
  }
  return { x0, yaw, zq, d: Math.max(Math.abs(e[0]), Math.abs(e[1])) };
})();

/** Face de la paroi (Z, repère du chantier) au point (x, y). */
export const rockAt = (x, y) => {
  const c = Math.cos(MINE.yaw), sn = Math.sin(MINE.yaw);
  const qx = x * c - WALL_Z * sn + MINE.x0;
  return -(qx - MINE.x0) * sn + (rockZ(-1, qx, y + DECK) - MINE.zq) * c;
};
/** Point du repère du plancher (plancher-dd) → repère du chantier. */
export const fromDeck = (qx, qy, qz) => {
  const c = Math.cos(MINE.yaw), sn = Math.sin(MINE.yaw);
  const x = qx - MINE.x0, z = qz - MINE.zq;
  return [x * c + z * sn, qy - DECK, -x * sn + z * c];
};

/**
 * Soutènement de la paroi : grillage soudé (mailles de 4 po) qui épouse la
 * roche, retenu par des boulons en quinconce — split sets (tube fendu, anneau
 * et plaque bombée) et barres d'armature (tige filetée, écrou et plaque carrée).
 */
function groundSupport(api, x0, x1) {
  const { S, THREE } = api;
  const PITCH = 4 * IN, OFF = 0.014, y0 = 0.25, y1 = 2.38;
  const at = (x, y, off = OFF) => new THREE.Vector3(x, y, rockAt(x, y) + off);
  const nx = Math.floor((x1 - x0) / PITCH), ny = Math.floor((y1 - y0) / PITCH);
  const wires = [];
  const up = new THREE.Vector3(0, 1, 0);
  const wire = (a, b) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, a.distanceTo(b), 4, 1, true));
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
    wires.push(m);
  };
  // Fils horizontaux par tronçons de 2 mailles, fils verticaux par-dessus.
  for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i += 2) wire(at(x0 + i * PITCH, y0 + j * PITCH), at(x0 + Math.min(nx, i + 2) * PITCH, y0 + j * PITCH));
  for (let i = 0; i <= nx; i++) for (let j = 0; j < ny; j += 2) wire(at(x0 + i * PITCH, y0 + j * PITCH, OFF + 0.005), at(x0 + i * PITCH, y0 + Math.min(ny, j + 2) * PITCH, OFF + 0.005));
  const g = S.group(S.merged(wires, 'zinc'));
  // Boulons : rangées à 0,6, 1,45 et 2,2 m, aux 1,2 m, décalées d'une rangée à l'autre.
  let n = 0;
  [[0.6, 0.6], [1.45, 0], [2.2, 0.6]].forEach(([y, shift]) => {
    for (let x = -4.2 + shift; x < x1 - 0.2; x += 1.2) {
      if (x < x0 + 0.2) continue;
      const b = S.group();
      if (n++ % 2 === 0) {
        // Split set : plaque bombée, anneau soudé au bout du tube fendu.
        b.add(S.box(0.15, 0.15, 0.006, 'darkSteel', { pos: [0, 0, 0.003] }), S.cyl(0.045, 0.014, 'darkSteel', { axis: 'z', r2: 0.03, pos: [0, 0, 0.012] }),
          S.shell(0.0195, 0.017, 0.03, 'darkSteel', { axis: 'z', pos: [0, 0, 0.03], seg: 14 }), S.torus(0.021, 0.0045, 'darkSteel', { axis: 'z', pos: [0, 0, 0.022] }));
      } else {
        // Barre d'armature : plaque carrée, écrou et bout de tige filetée.
        b.add(S.box(0.125, 0.125, 0.008, 'zinc', { pos: [0, 0, 0.004] }), S.nut(0.032, 0.018, 'zinc', { axis: 'z', pos: [0, 0, 0.017] }),
          S.cyl(0.0105, 0.07, 'steel', { axis: 'z', pos: [0, 0, 0.04], seg: 10 }));
      }
      S.at(b, [x, y, rockAt(x, y) + OFF + 0.006]);
      g.add(b);
    }
  });
  return g;
}

/** Ne garde d'un objet que les triangles en deçà de X = xmax (décor recadré autour du chantier). */
function cropX(THREE, obj, xmax) {
  obj.updateMatrixWorld(true);
  const v = new THREE.Vector3(), empty = [];
  obj.traverse((m) => {
    if (!m.isMesh) return;
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    const pos = g.attributes.position, keep = [];
    for (let i = 0; i < pos.count; i += 3) {
      let ok = true;
      for (let k = 0; k < 3; k++) if (v.fromBufferAttribute(pos, i + k).applyMatrix4(m.matrixWorld).x > xmax) ok = false;
      if (ok) keep.push(i, i + 1, i + 2);
    }
    const out = new THREE.BufferGeometry();
    for (const [name, a] of Object.entries(g.attributes)) {
      const arr = new a.array.constructor(keep.length * a.itemSize);
      keep.forEach((src, d) => { for (let c = 0; c < a.itemSize; c++) arr[d * a.itemSize + c] = a.array[src * a.itemSize + c]; });
      out.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize));
    }
    m.geometry = out;
    if (!keep.length) empty.push(m);
  });
  empty.forEach((m) => m.removeFromParent());
  return obj;
}

/** Retire les numéros d'étape d'un décor repris d'un autre modèle (il reste affiché en tout temps). */
function still(obj) {
  const gone = [];
  obj.traverse((o) => {
    if (o.userData.stepOnly) gone.push(o);
    for (const k of ['step', 'seq', 'noDrop']) delete o.userData[k];
  });
  gone.forEach((o) => o.removeFromParent());
  return obj;
}

/** Pose dans le chantier un objet construit dans le repère du plancher (plancher-dd). */
export function place(S, o) {
  const g = S.group(S.at(o, [-MINE.x0, -DECK, -MINE.zq]));
  g.rotation.y = MINE.yaw;
  return g;
}

/** Décor du chantier : { rock (paroi, sol de roche, grillage, soutènement), deck (plancher de foreuse) }. */
export function decor(api) {
  const S = api.S;
  const gal = gallery(S);
  gal.remove(gal.children[2]); // paroi d'en face : la vue reste dégagée
  const rock = S.group(place(S, cropX(api.THREE, still(gal), SEC + 0.3)));
  rock.add(groundSupport(api, -MINE.x0 + 0.05, SEC + 0.25 - MINE.x0));
  const deck = place(S, S.group(['P04', 'P07'].map((id) => still(buildProcedural(plancher, id, { inPlace: true, quality: 0.4 }).root))));
  return { rock, deck };
}
