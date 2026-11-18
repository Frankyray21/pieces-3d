// Scène de sciage du bois (P02) : la scie de la page P01 coupe le bout d'un
// 2 × 4 posé à plat sur deux cales. Animation en trois étapes (montage par
// étapes de la visionneuse) : appuyer le patin, scier, retirer la scie.
//
// Du manuel : la course de 13 mm, les deux temps de la mise en marche (bouton
// de sécurité, puis gâchette), la lampe qui s'allume avec l'interrupteur, la
// vitesse qui suit la pression. Le reste est une mise en scène : la pièce de
// bois, ses cales, l'avance et le basculement de la scie, la sciure, la chute
// qui tombe. La cadence est ralentie pour la lecture (environ 7 courses par
// seconde, contre 50 au plus sur l'outil). L'opérateur n'est pas montré.
//
// Repère de la scène, en millimètres : X de la lame vers la poignée (le chant
// de la pièce touché par le patin est à x = 0), Y vers le haut depuis le sol,
// Z le long de la pièce ; z = 0 est le plan de la lame. Modèle en mètres.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { AXE, LAME, PUBLIE } from './scie.js';

const MM = 0.001;
const RAD = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (u) => { const t = clamp(u); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ------------------------------------------------------------------ décor (mm)

export const PIECE = { ep: 38, large: 89, long: 760, chute: 180 }; // 2 × 4 raboté ; chute : bout scié
export const CALE = { cote: 140, long: 300, z: [-140, -480] }; // deux bouts de 6 × 6
export const TRAIT = 1.6; // largeur du trait de scie
const JEU = 0.5; // entre le patin et le chant de la pièce
const Yb = CALE.cote, Yt = Yb + PIECE.ep; // dessous et dessus de la pièce
const X_LOIN = -JEU - PIECE.large, X_PRES = -JEU; // chants de la pièce
const BAS = LAME.haut - LAME.soie / 2; // ligne des dents sous l'axe du coulisseau

// ------------------------------------------------------------------ déroulement (s)

export const DUREE = { approche: 1.8, coupe: 10.5, retrait: 2.2 };
const T1 = DUREE.approche, T2 = T1 + DUREE.coupe, T3 = T2 + DUREE.retrait;
// Coupe, en secondes depuis son début : sécurité, gâchette, démarrage, avance, relâchement, frein.
const U = { bouton: [0.05, 0.25], gachette: [0.25, 0.5], lance: [0.45, 1.0], avance: [1.0, 7.5], lache: [7.8, 7.95], frein: [7.9, 8.2] };
const CADENCE = 7; // courses par seconde à l'écran
const DEPART = { x: 95, y: Yt + 78, angle: 15 }; // scie tenue au-dessus de la pièce
const RETRAIT = { x: 105, y: Yt + 72, angle: 13 };
const ANGLE = { debut: 10, fin: 2 }; // poignée relevée : la lame attaque par le chant éloigné
const Y_DEBUT = Yt + PIECE.large * Math.sin(ANGLE.debut * RAD) + BAS * Math.cos(ANGLE.debut * RAD) + 2; // dents à 2 mm du bois
const Y_FIN = Yb + BAS - 6; // dents 6 mm sous la pièce

/** Avance de la coupe (0 à 1) à l'instant u de l'étape. */
const avance = (u) => { const q = clamp((u - U.avance[0]) / (U.avance[1] - U.avance[0])); return 0.85 * q + 0.15 * q * q; };
/** Régime du moteur (0 à 1). */
const regime = (u) => smooth((u - U.lance[0]) / (U.lance[1] - U.lance[0])) * (1 - smooth((u - U.frein[0]) / (U.frein[1] - U.frein[0])));
/** Intégrale du régime (s) : la phase de la lame en découle, la course finit entière. */
function tours(u) {
  const [a0, a1] = U.lance, [b0, b1] = U.frein, La = a1 - a0, Lb = b1 - b0;
  if (u <= a0) return 0;
  if (u <= a1) { const t = (u - a0) / La; return La * (t * t * t - (t * t * t * t) / 2); }
  if (u <= b0) return La / 2 + (u - a1);
  const t = clamp((u - b0) / Lb);
  return La / 2 + (b0 - a1) + Lb * (t - t * t * t + (t * t * t * t) / 2);
}
const TOURS = tours(DUREE.coupe);
const COURSES = Math.round(CADENCE * TOURS);

/** Pose de la scie pendant la coupe : origine de l'outil (patin, axe du coulisseau) et angle. */
function poseCoupe(u) {
  const p = avance(u);
  const angle = lerp(ANGLE.debut, ANGLE.fin, smooth(p));
  const y = lerp(Y_DEBUT, Y_FIN, p);
  // Le patin reste appuyé sur l'arête du dessus de la pièce.
  return { x: X_PRES + (Yt - y) * Math.tan(angle * RAD), y, angle };
}

/** Hauteur de la ligne des dents à l'abscisse x de la scène, pour une pose donnée. */
function dents({ x, y, angle }, xs) {
  const c = Math.cos(angle * RAD), s = Math.sin(angle * RAD);
  const xt = (xs - x - BAS * s) / c; // abscisse le long de la lame
  return y + xt * s - BAS * c;
}

// Trait de scie : fond du trait en N colonnes, à chaque instant de l'avance (le bois scié le reste).
const COLONNES = 18, PAS = 320;
const xCol = (i) => lerp(X_LOIN, X_PRES, i / COLONNES);
const FOND = (() => {
  const t = new Float32Array((PAS + 1) * (COLONNES + 1)).fill(Yt);
  let fini = null;
  for (let s = 0; s <= PAS; s++) {
    const u = lerp(U.avance[0], U.avance[1], s / PAS), pose = poseCoupe(u);
    let reste = false;
    for (let i = 0; i <= COLONNES; i++) {
      const avant = s ? t[(s - 1) * (COLONNES + 1) + i] : Yt;
      const y = Math.min(avant, clamp(dents(pose, xCol(i)), Yb, Yt));
      t[s * (COLONNES + 1) + i] = y;
      if (y > Yb + 1e-6) reste = true;
    }
    if (!reste && fini == null) fini = u;
  }
  return { t, fini: fini ?? U.avance[1] };
})();
/** Instant (dans l'étape) où la pièce est sciée de part en part. */
export const U_SCIE = FOND.fini;
/** Fond du trait à la colonne (fractionnaire) c, à l'instant u de l'étape. */
function fond(c, u) {
  const s = clamp((u - U.avance[0]) / (U.avance[1] - U.avance[0])) * PAS;
  const s0 = Math.min(PAS - 1, Math.floor(s)), fs = s - s0;
  const i0 = Math.min(COLONNES - 1, Math.floor(clamp(c, 0, COLONNES))), fi = clamp(c, 0, COLONNES) - i0;
  const at = (ss, ii) => FOND.t[ss * (COLONNES + 1) + ii];
  return lerp(lerp(at(s0, i0), at(s0, i0 + 1), fi), lerp(at(s0 + 1, i0), at(s0 + 1, i0 + 1), fi), fs);
}

/** État de la scène à l'instant T (s) du déroulement : fonction pure, rejouable dans les deux sens. */
export function etat(T) {
  const u = clamp(T - T1, 0, DUREE.coupe);
  let pose;
  if (T <= T1) {
    const k = smooth(T / T1), c = poseCoupe(0);
    pose = { x: lerp(DEPART.x, c.x, k), y: lerp(DEPART.y, c.y, k), angle: lerp(DEPART.angle, c.angle, k) };
  } else if (T <= T2) pose = poseCoupe(u);
  else {
    const k = smooth((T - T2) / DUREE.retrait), c = poseCoupe(DUREE.coupe);
    pose = { x: lerp(c.x, RETRAIT.x, k), y: lerp(c.y, RETRAIT.y, k), angle: lerp(c.angle, RETRAIT.angle, k) };
  }
  const w = regime(u);
  const phase = (2 * Math.PI * COURSES * tours(u)) / TOURS;
  // Vibrations de la scie en marche (amplitude visible, exagérée d'environ deux fois).
  pose.y += w * 0.35 * Math.sin(2 * Math.PI * 23 * u);
  pose.x += w * 0.3 * Math.sin(phase);
  pose.angle += w * 0.12 * Math.sin(2 * Math.PI * 17 * u + 1);
  const presse = smooth((u - U.gachette[0]) / (U.gachette[1] - U.gachette[0])) * (1 - smooth((u - U.lache[0]) / (U.lache[1] - U.lache[0])));
  return {
    u, pose, regime: w,
    recul: PUBLIE.course * (0.5 - 0.5 * Math.cos(phase)), // la lame rentre de 13 mm et ressort
    gachette: presse,
    bouton: smooth((u - U.bouton[0]) / (U.bouton[1] - U.bouton[0])) * (1 - smooth((u - U.lache[1]) / 0.15)),
    lampe: smooth((u - U.gachette[0]) / 0.15), // elle reste allumée de 10 à 15 s après le relâchement (manuel)
    chute: Math.max(0, u - U_SCIE), // temps écoulé depuis que la chute est détachée
  };
}

// ------------------------------------------------------------------ pièces de la scène

const boite = (w, h, d, materiau, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * MM, h * MM, d * MM), mat(materiau));
  m.position.set(x * MM, y * MM, z * MM);
  return m;
};

/** Bois qui reste dans le trait : lame de bois entre les deux bouts, du dessous de la pièce au fond du trait. */
function boisDuTrait() {
  const n = COLONNES, h = TRAIT / 2;
  const pos = new Float32Array((n * 4 + 2) * 6 * 3), nor = new Float32Array(pos.length);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  const m = new THREE.Mesh(geo, mat('woodPlaned'));
  m.frustumCulled = false;
  m.userData.noEdges = true; // sa forme change : pas de contour figé
  m.raycast = () => {};
  /** Met la lame de bois à la hauteur du fond du trait de l'instant u. */
  m.userData.maj = (u) => {
    let k = 0;
    const quad = (a, b, c, d, nx, ny, nz) => {
      for (const p of [a, b, c, a, c, d]) {
        pos[k] = p[0] * MM; pos[k + 1] = p[1] * MM; pos[k + 2] = p[2] * MM;
        nor[k] = nx; nor[k + 1] = ny; nor[k + 2] = nz;
        k += 3;
      }
    };
    const y = (i) => fond(i, u);
    for (let i = 0; i < n; i++) {
      const x0 = xCol(i), x1 = xCol(i + 1), y0 = y(i), y1 = y(i + 1);
      quad([x0, y0, h], [x1, y1, h], [x1, y1, -h], [x0, y0, -h], 0, 1, 0); // fond du trait
      quad([x0, Yb, -h], [x1, Yb, -h], [x1, Yb, h], [x0, Yb, h], 0, -1, 0); // dessous
      quad([x0, Yb, h], [x1, Yb, h], [x1, y1, h], [x0, y0, h], 0, 0, 1);
      quad([x1, Yb, -h], [x0, Yb, -h], [x0, y0, -h], [x1, y1, -h], 0, 0, -1);
    }
    quad([X_LOIN, Yb, -h], [X_LOIN, Yb, h], [X_LOIN, y(0), h], [X_LOIN, y(0), -h], -1, 0, 0);
    quad([X_PRES, Yb, h], [X_PRES, Yb, -h], [X_PRES, y(n), -h], [X_PRES, y(n), h], 1, 0, 0);
    geo.attributes.position.needsUpdate = true;
  };
  m.userData.maj(0);
  return m;
}

// Sciure : couleur du bois frais, mate.
let SCIURE = null;
const sciure = () => (SCIURE ||= Object.assign(new THREE.MeshStandardMaterial({ color: 0xdcc296, roughness: 1, metalness: 0 }), { name: 'djr183-sciure' }));

const hasard = (a, b, c) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };

/** Grains de sciure : projetés au-dessus du trait, puis sous la pièce une fois le bois traversé. */
function grains(n = 420) {
  const pos = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setDrawRange(0, 0);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdcc296, size: 0.003, sizeAttenuation: true }));
  pts.frustumCulled = false;
  pts.raycast = () => {};
  const VIE = 0.75, G = 5; // durée d'un grain (s), pesanteur adoucie (les grains flottent)
  pts.userData.maj = (u) => {
    let k = 0;
    for (let j = 0; j < n; j++) {
      const dec = ((j * 0.61803) % 1) * VIE;
      const tour = Math.floor((u - dec) / VIE), age = u - dec - tour * VIE, ne = u - age;
      if (ne < U.avance[0] || ne > U_SCIE + 0.1 || regime(ne) < 0.3) continue;
      const r = (q) => hasard(j, tour, q);
      const c = r(1) * COLONNES, x0 = lerp(X_LOIN, X_PRES, c / COLONNES), f = fond(c, ne);
      let x, y, z;
      if (r(0) < 0.45 || f > Yb + 0.5) {
        // Au-dessus : là où le trait est commencé, grains tirés vers le patin par le retour de la lame.
        if (f > Yt - 0.5) continue;
        x = x0 + (50 + 300 * r(2)) * age;
        y = Yt + 1 + (300 + 500 * r(3)) * age - 0.5 * G * 1000 * age * age;
        z = (r(4) - 0.5) * 300 * age;
        const surPiece = x > X_LOIN && x < X_PRES && z < PIECE.chute && z > PIECE.chute - PIECE.long && (z < 0 || u < U_SCIE);
        y = Math.max(y, surPiece ? Yt + 0.8 : 0.8);
      } else {
        // En dessous : là où la lame a traversé, la sciure tombe au sol.
        x = x0 + (r(2) - 0.5) * 250 * age;
        y = Math.max(0.8, Yb - 1 - (250 + 400 * r(3)) * age - 0.5 * G * 1000 * age * age);
        z = (r(4) - 0.5) * 120 * age;
      }
      pos[k++] = x * MM; pos[k++] = y * MM; pos[k++] = z * MM;
    }
    geo.setDrawRange(0, k / 3);
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

/** Petit tas de sciure au sol, sous le trait ; il grossit avec la coupe. */
function tas() {
  const profil = [[0, 1], [0.25, 0.86], [0.6, 0.45], [0.9, 0.1], [1, 0]].map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), sciure());
  m.position.set(((X_LOIN + X_PRES) / 2) * MM, 0, 0);
  m.userData.noEdges = true;
  m.raycast = () => {};
  m.userData.maj = (u) => {
    let scie = 0;
    for (let i = 0; i <= COLONNES; i++) scie += (Yt - fond(i, u)) / (PIECE.ep * (COLONNES + 1));
    const k = Math.sqrt(scie);
    m.scale.set(Math.max(1e-4, 0.055 * k), Math.max(1e-4, 0.011 * k), Math.max(1e-4, 0.04 * k));
  };
  m.userData.maj(0);
  return m;
}

// Chute : place au repos sur la pièce, puis au sol.
const CHUTE = { tombe: 0.17, rebond: 0.5, angle: 22, lacet: 12, glisse: 45 };

/** Pose de la chute (mm, degrés) t secondes après qu'elle est détachée : elle pique du bout libre, touche le sol, rebondit et se couche. */
export function poseChute(t) {
  const y0 = (Yb + Yt) / 2, z0 = TRAIT / 2 + PIECE.chute / 2, x0 = (X_LOIN + X_PRES) / 2;
  const sol = (a) => (PIECE.ep / 2) * Math.cos(a * RAD) + (PIECE.chute / 2) * Math.sin(Math.abs(a) * RAD);
  if (t <= 0) return { x: x0, y: y0, z: z0, tangage: 0, lacet: 0 };
  const { tombe, rebond, angle, lacet, glisse } = CHUTE;
  if (t < tombe) {
    const a = angle * (t / tombe) ** 1.5;
    return { x: x0, y: Math.max(y0 - 4905 * t * t, sol(a)), z: z0 + 8 * (t / tombe), tangage: a, lacet: 0 };
  }
  const s = clamp((t - tombe) / (rebond - tombe)), a = angle * (1 - smooth(s));
  return { x: x0 - 10 * smooth(s), y: sol(a) + 26 * 4 * s * (1 - s), z: z0 + 8 + (glisse - 8) * smooth(s), tangage: a, lacet: lacet * smooth(s) };
}

// ------------------------------------------------------------------ étapes

export const STEPS = [
  { label: 'Départ', title: 'Pièce sur ses cales, scie au-dessus du trait', text: 'Un 2 × 4 posé à plat sur deux bouts de 6 × 6 ; le bout à scier dépasse de la cale. La lame est dans l\'axe du trait.' },
  { title: 'Appuyer le patin', text: 'Le patin vient s\'appuyer sur l\'arête de la pièce, poignée relevée : la lame, en travers de la pièce, n\'est qu\'à 2 mm du bois.' },
  { title: 'Scier', text: `Bouton de sécurité enfoncé, puis gâchette pressée : la lampe s'allume et la lame bat de ${PUBLIE.course} mm. La scie descend dans le bois en basculant, la sciure tombe et la chute se détache. Cadence ralentie pour la lecture (environ ${CADENCE} courses par seconde ; jusqu'à ${PUBLIE.cadence / 60} sur l'outil).` },
  { title: 'Relâcher et retirer la scie', text: 'Gâchette relâchée, la lame s\'arrête ; la lampe s\'éteint d\'elle-même de 10 à 15 secondes plus tard. La scie se retire de la pièce.' },
];

export function P02(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); return obj; };

  // Scie : l'assemblage P01, posé et animé d'un bloc ; ses pièces mobiles sont animées dans son repère.
  const scie = put('1', api.sub('P01'), [0.12, 0.1, 0]);
  const de = (ref) => scie.userData.parts.filter((p) => p.userData.partRef === ref);
  const mobiles = ['1', '4', '5'].flatMap(de); // lame, manchon du serre-lame, coulisseau
  const [gachette] = de('13'), [bouton] = de('14');
  // Lampe : matériau propre à la scène, pour l'allumer.
  const feu = mat('lamp').clone();
  feu.name = 'djr183-lampe';
  de('7').forEach((p) => p.traverse((o) => { if (o.isMesh && o.material?.name === 'lamp') o.material = feu; }));
  const place = (p) => p.userData.basePos || p.position.clone();
  const repos = new Map([...mobiles, gachette, bouton].map((p) => [p, place(p)]));

  // Pièce de bois : le bout qui reste, le bois du trait, puis la chute.
  const zReste = -(PIECE.long - PIECE.chute);
  const reste = S.group(boite(PIECE.large, PIECE.ep, -zReste - TRAIT / 2, 'woodPlaned', (X_LOIN + X_PRES) / 2, (Yb + Yt) / 2, (zReste - TRAIT / 2) / 2));
  const trait = boisDuTrait();
  reste.add(trait);
  put('2', reste, [0, 0, -0.1]);
  const chute = put('3', S.group(boite(PIECE.large, PIECE.ep, PIECE.chute, 'woodPlaned', 0, 0, 0)), [0, 0, 0.12]);
  for (const z of CALE.z) put('4', S.box(CALE.long * MM, CALE.cote * MM, CALE.cote * MM, 'wood', { pos: [((X_LOIN + X_PRES) / 2 + 5) * MM, (CALE.cote / 2) * MM, z * MM] }), [0, -0.08, 0]);
  const poussiere = grains(), monticule = tas();
  put('5', S.group(poussiere, monticule), [0, -0.05, 0.08]);

  /** Met toute la scène à l'instant T du déroulement. */
  const poser = (T) => {
    const e = etat(T), a = e.pose.angle * RAD;
    scie.rotation.z = a;
    scie.position.set((e.pose.x + AXE * Math.sin(a)) * MM, (e.pose.y - AXE * Math.cos(a)) * MM, 0);
    for (const p of mobiles) p.position.copy(repos.get(p)).x += e.recul * MM;
    gachette.position.copy(repos.get(gachette)).add(new THREE.Vector3(0.0012, 0.0034, 0).multiplyScalar(e.gachette));
    bouton.position.copy(repos.get(bouton)).z -= 0.0025 * e.bouton;
    feu.emissiveIntensity = 0.06 + 1.9 * e.lampe;
    trait.userData.maj(e.u);
    poussiere.userData.maj(e.u);
    monticule.userData.maj(e.u);
    const c = poseChute(e.chute);
    chute.position.set(c.x * MM, c.y * MM, c.z * MM);
    chute.rotation.set(c.tangage * RAD, c.lacet * RAD, 0, 'YXZ');
  };
  poser(0);

  // Une animation par étape ; chacune ne prend la main qu'une fois commencée (la première pose le départ).
  [[0, T1], [T1, T2], [T2, T3]].forEach(([t0, t1], i) => {
    const g = S.group();
    g.userData.stepAnim = { step: i + 1, delay: 250, dur: (t1 - t0) * 1000, update: (k) => { if (k > 0 || i === 0) poser(lerp(t0, t1, k)); } };
    api.add(g);
  });

  const cible = [0.1, 0.16, 0], recul = [-0.36, 0.3, 0.66];
  const cam = { pos: cible.map((v, i) => v + recul[i]), tgt: cible };
  return { view: { dir: [-0.5, 0.45, 1], steps: STEPS.map((s) => ({ ...s, cam })), stepsAuto: true, stepsPlay: true } };
}
