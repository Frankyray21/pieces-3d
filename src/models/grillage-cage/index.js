// Panneau de grillage rigide de la cage : treillis soudé à plis en V, maille de
// 2 × 6 po, fil de calibre 6, galvanisé (type Oméga II Architectural).
//
// Deux sources, sans plan :
//   - données publiées pour ce type de panneau (Oméga II Architectural) : fil de
//     calibre 6 (0,192 po), maille de 1 31/32 × 6 po, panneau de 92 3/4 po de
//     large, hauteur de catalogue de 70 po ;
//   - photo de la cage (P01, relevé en P02) : fils verticaux tous les 2 po
//     environ, fils horizontaux tous les 6 po environ, deux bandes de trois
//     fils rapprochés (les plis en V) vers 9 po et 38 po sous le bout des fils
//     verticaux, qui dépassent d'environ 1 po la traverse du haut de la cage.
// Le fil horizontal du haut (derrière la traverse), le pli du bas (au pied du
// panneau, illisible sur la photo), l'angle des plis et le côté des fils
// horizontaux sont supposés ; voir la note de la page.
//
// Repère du modèle : X largeur (0 au milieu), Y vers le haut (0 à l'axe du fil
// horizontal du bas), +Z vers l'avant (côté où sortent les plis). Mètres.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { balayer, cercle, tauxPolygone } from '../porte-1801020/formes.js';

const IN = 0.0254;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (po)

/** Fil de calibre 6. */
export const FIL = 0.192;
/** Fils verticaux : 48 au pas de 1 31/32 po (92 3/4 po hors tout). */
export const VERTICAUX = { n: 48, pas: 1 + 31 / 32 };
/** Fils horizontaux : 12 mailles de 6 po mesurées à plat, soit 13 fils. */
export const MAILLES = { n: 12, pas: 6 };
/** Mailles pliées en V, comptées du bas (0 = maille du pied), et angle des pans. */
export const PLIS = { mailles: [0, 5, 10], angle: 30 };
/** Pointes : dépassement des fils verticaux au-dessus du fil horizontal du haut. */
export const POINTE = 1;

const PAN = MAILLES.pas / 2; // longueur d'un pan du V
const SAILLIE = PAN * Math.sin(PLIS.angle * RAD); // profondeur du pli
const PAN_Y = PAN * Math.cos(PLIS.angle * RAD); // hauteur prise par un pan

/**
 * Profil d'un fil vertical [y, z] du bas vers le haut, et place des fils
 * horizontaux : `courants` aux limites de maille, `sommets` au creux des V.
 */
export function profil() {
  const trace = [[0, 0]];
  const courants = [0], sommets = [];
  let y = 0;
  for (let i = 0; i < MAILLES.n; i++) {
    if (PLIS.mailles.includes(i)) {
      trace.push([y + PAN_Y, SAILLIE]);
      sommets.push(y + PAN_Y);
      y += 2 * PAN_Y;
      trace.push([y, 0]);
    } else {
      y += MAILLES.pas;
      // Mailles plates qui se suivent : un seul segment droit.
      if (trace.length > 1 && trace[trace.length - 2][1] === 0 && trace[trace.length - 1][1] === 0) trace.pop();
      trace.push([y, 0]);
    }
    courants.push(y);
  }
  return { trace, courants, sommets, hauteur: y };
}

/** Largeur et hauteur hors tout, longueur de fil et masse (acier, 0,2836 lb/po³). */
export function bilan() {
  const { courants, sommets, hauteur } = profil();
  const large = (VERTICAUX.n - 1) * VERTICAUX.pas + FIL;
  const longV = MAILLES.n * MAILLES.pas + FIL / 2 + POINTE; // longueur développée d'un fil vertical
  const fil = VERTICAUX.n * longV + (courants.length + sommets.length) * large;
  return {
    large,
    haut: hauteur + FIL / 2 + POINTE,
    profond: SAILLIE + 2 * FIL,
    fil,
    masse: fil * (Math.PI / 4) * FIL ** 2 * 0.2836,
    horizontaux: courants.length + sommets.length,
  };
}

// ------------------------------------------------------------------ pièces

const COTES = 10; // côtés du polygone qui approche le rond du fil
const Xp = new THREE.Vector3(1, 0, 0);

/** Fil rond le long d'un tracé de points 3D (m) contenu dans un plan de normale B. */
function fil(points, B) {
  const geo = balayer(points, cercle((FIL / 2) * IN, COTES), B);
  geo.userData.edgeAngle = 80; // pas de contours le long du fil
  const m = new THREE.Mesh(geo, mat('zinc'));
  m.userData.kVolume = 1 / tauxPolygone(COTES);
  return m;
}

/** Repère 1 : fil vertical, plié en V à chaque pli ; ras du fil du bas, en pointe de 1 po au-dessus du fil du haut. */
function filVertical(trace) {
  const pts = trace.map(([y, z]) => new THREE.Vector3(0, y * IN, z * IN));
  pts[0].y -= (FIL / 2) * IN;
  pts[pts.length - 1].y += POINTE * IN;
  return fil(pts, Xp);
}

/** Repères 2 et 3 : fil horizontal droit, soudé derrière les fils verticaux. */
function filHorizontal(large) {
  const h = (large / 2) * IN;
  return fil([new THREE.Vector3(-h, 0, 0), new THREE.Vector3(h, 0, 0)], new THREE.Vector3(0, 0, 1));
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const { trace, courants, sommets } = profil();
  const { large } = bilan();
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  // Fils verticaux, devant : une seule géométrie, 48 fois.
  const modele = filVertical(trace);
  const x0 = -((VERTICAUX.n - 1) * VERTICAUX.pas) / 2;
  for (let i = 0; i < VERTICAUX.n; i++) {
    const f = i ? new THREE.Mesh(modele.geometry, modele.material) : modele;
    f.userData.kVolume = modele.userData.kVolume;
    f.position.x = (x0 + i * VERTICAUX.pas) * IN;
    put('1', f, [0, 0, 0.1]);
  }

  // Fils horizontaux courants, derrière les verticaux.
  const droit = filHorizontal(large);
  const pose = (y, z) => {
    const f = new THREE.Mesh(droit.geometry, droit.material);
    f.userData.kVolume = droit.userData.kVolume;
    f.position.set(0, y * IN, z * IN);
    return f;
  };
  for (const y of courants) put('2', pose(y, -FIL), [0, 0, -0.1]);

  // Fil du creux de chaque V : tangent aux deux pans, par derrière.
  const zCreux = SAILLIE - FIL / Math.cos(PLIS.angle * RAD);
  for (const y of sommets) put('3', pose(y, zCreux), [0, 0, -0.22]);

  return { view: { dir: [-0.55, 0.22, 1] } };
}

export default { P01 };
