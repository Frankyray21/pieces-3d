import { P010, P015, P016, P017, SLED_VIA, HEAD_VIA, SWIVEL_PORT } from './drill.js';
import { P048, P049 } from './head.js';
import { P042, P039, P040, P041 } from './winch.js';
import { P068, P069, PP_VIA } from './powerpack.js';
import { P078, P079, CON_PACK_VIA, CON_ROT, CON_WATER_VIA, CON_SLED, CON_BACK_N } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010), sa tête
// Boyles (P048), le pivot de poulie, le guide de tiges et la poulie de la rallonge
// (P015 à P017), son treuil de câble 10 000 pi (P042, étapes P039 à P041),
// le groupe hydraulique 125 HP (P068) et la console (P078) ; les autres
// assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble prêt à forer, disposé comme sur le plan de l'atelier (vue de
// dessus : X vers la droite du plan, Z vers le bas) : foreuse à gauche, inclinée,
// l'avance pointée vers le bas à gauche (trou). Console STM à droite de la
// foreuse, à plus de 3 m, commandes tournées vers la droite : l'opérateur se tient
// entre la console et le groupe et regarde la foreuse par-dessus la console.
// Groupe hydraulique en haut à droite, en long, à plus de 3 m de la foreuse,
// raccords au bout tourné vers la console, interrupteur principal (porte de la
// boîte électrique) accessible du côté bas du plan, vers la gauche. Boyaux posés
// au sol, chacun dans sa voie, et branchés : groupe → console (pression, retour,
// drain) ; console → foreuse (rotation A et B vers le moteur
// de la tête, boyaux des sélecteurs du traîneau, eau vers l'émerillon par-dessus le
// moteur). Seul le matériel du manuel est modélisé.
// Contrôles : node scripts/check-layout.mjs --eq stm-1500 P002 --min 3 --ref 1.
const DRILL = { pos: [-3.0, 0, 0.6], yaw: -1.84 }; // avance vers (−0,27 ; 0,96) dans le plan
const CONSOLE = { pos: [1.75, 0, -0.9], yaw: Math.PI / 2 }; // commandes vers +X (opérateur à droite)
const PACK = { pos: [4.85, 0, -1.1], yaw: 0 }; // bout des raccords (−X) vers la console
const FLOOR = 0.025; // boyaux posés au sol (garde sous la courbe)

function P002(api) {
  const { at, tube, group } = api.S;
  const V = (a) => new api.THREE.Vector3(...a);
  const drill = at(api.sub('P010'), DRILL.pos, [0, DRILL.yaw, 0]);
  const cons = at(api.sub('P078'), CONSOLE.pos, [0, CONSOLE.yaw, 0]);
  const pack = at(api.sub('P068'), PACK.pos, [0, PACK.yaw, 0]);
  [drill, cons, pack].forEach((o) => o.updateMatrixWorld(true));
  const W = (obj, p) => obj.localToWorld(V(p));
  const D = (obj, d) => V(d).transformDirection(obj.matrixWorld);

  // Côté d'un boyau : sortie dans l'axe du raccord, point haut puis descente quasi verticale
  // jusqu'au sol (ou tracé imposé « via », du sol jusqu'au raccord, pour contourner une pièce).
  const end = (p, n, r, out, shift) => {
    const floor = FLOOR + r;
    const g = p.clone().addScaledVector(n, out).add(shift || V([0, 0, 0])).setY(floor);
    const pts = [p, p.clone().addScaledVector(n, Math.min(0.18, out * 0.45))];
    if (pts[1].y > floor + 0.3) pts.push(g.clone().setY(floor + 0.2));
    pts.push(g);
    return pts;
  };
  // Boyau entre deux raccords : les deux côtés, deux points au sol à 0,3 m des descentes
  // (le parcours reste posé au sol, sans plonger dessous), câble ou boyau.
  // Pont au-dessus de boyaux déjà posés au sol : le tronçon au sol est redécoupé tous les 2,5 cm et monte
  // par-dessus chaque boyau croisé (dessus du boyau + garde de 5 mm), avec une rampe de 0,15 m de part et d'autre.
  const bridge = (pts, r, over) => {
    const flat = (q) => q.y < FLOOR + r + 0.005;
    const dense = [];
    pts.forEach((q, k) => {
      const prev = pts[k - 1];
      if (prev && flat(prev) && flat(q)) {
        const n = Math.ceil(prev.distanceTo(q) / 0.025);
        for (let j = 1; j < n; j++) dense.push(prev.clone().lerp(q, j / n));
      }
      dense.push(q.clone());
    });
    // Hauteur à franchir au droit de chaque point au sol (null : rien dessous).
    const need = dense.map((q) => {
      if (!flat(q)) return null;
      let h = null;
      over.forEach((o) => o.pts.forEach((c, k) => {
        const c0 = o.pts[k - 1];
        if (!c0 || Math.min(c.y, c0.y) > FLOOR + o.r + 0.03) return; // tronçons au sol (et pieds des descentes) de l'autre boyau
        const ex = c.x - c0.x, ez = c.z - c0.z, t = Math.min(1, Math.max(0, ((q.x - c0.x) * ex + (q.z - c0.z) * ez) / (ex * ex + ez * ez || 1)));
        const d = Math.hypot(q.x - c0.x - t * ex, q.z - c0.z - t * ez);
        if (d < o.r + r + 0.015) h = Math.max(h ?? 0, c0.y + t * (c.y - c0.y) + o.r + r + 0.005);
      }));
      return h;
    });
    // Rampes de 0,15 m le long du boyau de part et d'autre de chaque franchissement.
    const ramp = 0.15;
    return dense.map((q) => {
      if (!flat(q)) return q;
      let h = q.y;
      need.forEach((top, j) => {
        if (top === null) return;
        const s = Math.hypot(q.x - dense[j].x, q.z - dense[j].z);
        if (s < ramp) h = Math.max(h, top - (top - q.y) * s / ramp);
      });
      return q.clone().setY(h);
    });
  };
  const run = (A, B, r, mat = 'hose', over) => {
    const a = A.via ? A.via.slice().reverse() : end(A.p, A.n, r, A.out ?? 0.4, A.shift);
    const b = B.via ? B.via : end(B.p, B.n, r, B.out ?? 0.4, B.shift).reverse();
    const ga = a[a.length - 1], gb = b[0];
    const u = gb.clone().sub(ga).setY(0);
    const len = u.length();
    u.normalize().multiplyScalar(Math.min(0.3, len * 0.3));
    let pts = [...a, ga.clone().add(u), gb.clone().sub(u), ...b];
    // Tronçons au sol redécoupés tous les 0,15 m au plus : la courbe (Catmull-Rom uniforme) reste alors sur son tracé
    // aux coudes au lieu de déborder dans la voie voisine (ex. pression et retour au coin du groupe).
    const low = (q) => q.y < FLOOR + r + 0.005;
    pts = pts.flatMap((q, k) => {
      const prev = pts[k - 1];
      if (!prev || !low(prev) || !low(q)) return [q];
      const n = Math.ceil(prev.distanceTo(q) / 0.15);
      return [...Array.from({ length: n - 1 }, (_, j) => prev.clone().lerp(q, (j + 1) / n)), q];
    });
    if (over) pts = bridge(pts, r, over);
    let L = 0;
    for (let k = 1; k < pts.length; k++) L += pts[k].distanceTo(pts[k - 1]);
    const seg = Math.ceil(L / 0.025); // un segment tous les 2,5 cm : coudes lisses
    const arr = pts.map((q) => q.toArray());
    const t = mat === 'hose' ? tube(arr, r, 'hose', { seg }) : tube(arr, r, 'black', { seg, ends: 'gland', endMaterial: 'black', radial: 8, tension: 0.4 });
    t.userData.hose = { pts, r }; // tracé gardé pour les ponts des boyaux posés ensuite
    return t;
  };
  // Étiquette de circuit hydraulique d'un boyau (outil « Circuits » de l'interface ; sans effet sur la géométrie).
  const circ = (t, circuit, circuitLabel, circuitFrom, circuitTo) => Object.assign(t.userData, { circuit, circuitLabel, circuitFrom, circuitTo }) && t;
  const PACK_CIRC = [
    ['pression', 'Pression : groupe → console', 'Groupe : refoulement d\'une pompe (A11VO130 : hypothèse du modèle)', 'Console : traversée arrière de la pression (plaque CA12 « PRESSION #1 »)'],
    ['retour', 'Retour : console → groupe', 'Console : traversée arrière du retour (bloc de retour HA250, repère 43 du schéma)', 'Groupe : filtre de retour RTF-47 côté console (raccordement : hypothèse du modèle)'],
    ['drain', 'Drain : console → groupe', 'Console : traversée arrière du drain', 'Groupe : collecteur de retour UM-064-600PP (611P, embout coudé)'],
  ];
  const SLED_CIRC = [
    ['avance-treuil', 'Console → sélecteur mât / treuil gauche, raccord avant intérieur', 'Console : traversée arrière (bloc du traîneau)', 'Foreuse : sélecteur DF10-6B-12L gauche, raccord avant intérieur (6400-8-8)'],
    ['avance-treuil', 'Console → sélecteur mât / treuil gauche, raccord avant extérieur', 'Console : traversée arrière (bloc du traîneau)', 'Foreuse : sélecteur DF10-6B-12L gauche, raccord avant extérieur (6400-8-8)'],
    ['mat', 'Console → sélecteur mât / treuil droit, raccord avant intérieur', 'Console : traversée arrière (bloc du traîneau)', 'Foreuse : sélecteur DF10-6B-12L droit, raccord avant intérieur (6400-8-8)'],
    ['mat', 'Console → sélecteur mât / treuil droit, raccord avant extérieur', 'Console : traversée arrière (bloc du traîneau)', 'Foreuse : sélecteur DF10-6B-12L droit, raccord avant extérieur (6400-8-8)'],
  ];
  const hoses = [];
  const cBack = D(cons, CON_BACK_N);
  // Groupe → console : pression (1 po), retour, drain, chacun sur son raccord, par les tracés imposés des deux
  // appareils (voies imbriquées, sans croisement). Pas de câble de commande : le manuel n'en montre aucun.
  PP_VIA.forEach((via, i) => hoses.push(circ(run({ via: CON_PACK_VIA[2 - i].map((q) => W(cons, q)) }, { via: via.map((q) => W(pack, q)) }, i === 0 ? 0.022 : 0.017), ...PACK_CIRC[i])));
  // Console → tête : rotation A et B (1 po), par-dessus le bout arrière de la poutre jusqu'aux coudes du moteur.
  const rot = HEAD_VIA.map((via, i) => run({ p: W(cons, CON_ROT[i]), n: cBack }, { via: via.map((q) => W(drill, q)) }, 0.022));
  rot.forEach((t, i) => circ(t, i ? 'rotation-b' : 'rotation-a', `Rotation ${'AB'[i]} : console → moteur de la tête`,
    `Console : traversée arrière de la rotation ${'AB'[i]} (plaque CA11 « ROTATION A & B »)`, `Tête : coude 290T de l'orifice ${'AB'[i]} du moteur de rotation`));
  hoses.push(...rot);
  // Console → raccords avant des deux sélecteurs mât / treuil du traîneau (tracés imposés : par-dessus le longeron
  // gauche, devant les poteaux avant).
  SLED_VIA.forEach((via, i) => hoses.push(circ(run({ p: W(cons, CON_SLED[i]), n: cBack }, { via: via.map((q) => W(drill, q)) }, 0.016), ...SLED_CIRC[i])));
  // Eau : traversée de la console → entrée axiale au bout de l'émerillon (raccord tourné vers l'arrière), montée côté
  // console devant les boyaux de rotation, passage au-dessus du flanc −Z de la poutre, arrivée dans l'axe de la broche.
  const [sx, sy, sz] = SWIVEL_PORT, wr = 0.02, x0 = sx - 0.16;
  const swivel = [[x0, FLOOR + wr, -0.94], [x0, 0.2, -0.92], [x0, 0.75, -0.84], [x0, 1.1, -0.62], [x0 + 0.01, sy + 0.02, -0.34],
    [x0 + 0.04, sy + 0.01, -0.14], [sx - 0.1, sy, -0.03], [sx - 0.04, sy, sz], [sx, sy, sz]];
  // Au sol, sa voie longe celle des boyaux de rotation sans s'y mêler : point de passage à 0,35 m du pied de la
  // rotation A, écarté du côté du pied de sa montée (au-delà de la rotation B si elle s'y trouve). S'il en croisait
  // un (console déplacée), il passerait par-dessus : aucun boyau ne traverse l'autre.
  const wFoot = W(drill, swivel[0]);
  const flatA = rot[0].userData.hose.pts.filter((q) => q.y < FLOOR + 0.022 + 0.005);
  const [fa, fb] = [flatA[0], flatA[flatA.length - 1]], dir = fb.clone().sub(fa).setY(0).normalize();
  const side = new api.THREE.Vector3(dir.z, 0, -dir.x); // normale au sol de la voie de rotation A
  const toB = rot[1].userData.hose.pts.find((q) => q.y < FLOOR + 0.03).clone().sub(fa);
  if (side.dot(wFoot.clone().sub(fa)) < 0) side.negate(); // du côté du pied de la montée
  const off = side.dot(toB) > 0 ? 0.17 : 0.1; // au-delà de la rotation B si elle est de ce côté
  const wpt = fa.clone().addScaledVector(dir, 0.35).addScaledVector(side, off).setY(FLOOR + wr);
  hoses.push(circ(run({ via: [wpt, ...CON_WATER_VIA.map((q) => W(cons, q))] }, { via: swivel.map((q) => W(drill, q)) }, wr, 'hose', rot.map((t) => t.userData.hose)),
    'eau', 'Eau : console → émerillon', 'Console : vanne haute du bloc d\'eau 3 voies UM-020-643P (2404-16-16)', 'Foreuse : entrée axiale de l\'émerillon d\'eau UM-106-10011-UG'));

  api.part('1', drill, [-1.2, 0, 0]);
  api.part('3', cons, [0, 0.6, 0]);
  api.part('2', pack, [1.2, 0, -0.6]);
  api.add(group(hoses));
  return { view: { dir: [0.2, 1.1, 1.0] } };
}

export default { P002, P010, P015, P016, P017, P039, P040, P041, P042, P048, P049, P068, P069, P078, P079 };
