// Travailleur de la carte 3D (vue à la 3e personne) : combinaison orange à
// bandes réfléchissantes, casque et lampe frontale reliée à sa batterie de
// ceinture, lunettes, gants et bottes — l'EPI du formulaire (question 7).
// Pieds à Y = 0, regard vers Z négatif ; membres articulés pour la marche.
import * as THREE from 'three';
import { mat } from '../../../viewer/materials.js';

const M = {
  combi: () => mat('tissuOrange'),
  bande: () => mat('bandeReflet'),
  gant: () => mat('gantBleu'),
  peau: () => mat('peau'),
  botte: new THREE.MeshStandardMaterial({ color: 0x16171a, roughness: 0.7 }),
  casque: new THREE.MeshStandardMaterial({ color: 0xf4c51c, roughness: 0.35, metalness: 0.05 }),
  noir: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.55 }),
  verre: new THREE.MeshStandardMaterial({ color: 0x9fd3ff, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.55 }),
  lentille: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1cf, emissiveIntensity: 6 }),
};

const capsule = (r, l, m, seg = 10) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, seg), m);
const boite = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

function membre(r, l, m) {
  // Pivot en haut, membre vers le bas.
  const piv = new THREE.Group();
  const c = capsule(r, l, m);
  c.position.y = -l / 2 - r * 0.3;
  piv.add(c);
  return piv;
}

/** Construit le travailleur. Retourne { group, animer(vitesse, dt), lampe (Object3D au front) }. */
export function creerAvatar() {
  const g = new THREE.Group();
  g.name = 'travailleur';
  const corps = new THREE.Group();
  g.add(corps);

  // Jambes (pivots aux hanches).
  const jambes = [-1, 1].map((s) => {
    const cuisse = membre(0.085, 0.34, M.combi());
    cuisse.position.set(s * 0.1, 0.92, 0);
    const genou = membre(0.075, 0.32, M.combi());
    genou.position.y = -0.44;
    cuisse.add(genou);
    const bande = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.05, 14), M.bande());
    bande.position.y = -0.18;
    genou.add(bande);
    const botte = boite(0.12, 0.2, 0.25, M.botte);
    botte.position.set(0, -0.4, -0.04);
    genou.add(botte);
    corps.add(cuisse);
    return { cuisse, genou };
  });

  // Tronc, bandes réfléchissantes, ceinture et batterie de lampe.
  const tronc = capsule(0.2, 0.42, M.combi(), 14);
  tronc.scale.set(1, 1, 0.72);
  tronc.position.y = 1.2;
  corps.add(tronc);
  for (const y of [1.06, 1.3]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.203, 0.203, 0.05, 20), M.bande());
    b.scale.set(1, 1, 0.73);
    b.position.y = y;
    corps.add(b);
  }
  const ceinture = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.06, 20), M.noir);
  ceinture.scale.set(1, 1, 0.74);
  ceinture.position.y = 0.95;
  corps.add(ceinture);
  const batterie = boite(0.14, 0.12, 0.06, M.noir);
  batterie.position.set(0, 0.97, 0.16);
  corps.add(batterie);

  // Tête, casque, lampe frontale, lunettes.
  const tete = new THREE.Group();
  tete.position.y = 1.58;
  corps.add(tete);
  const cou = capsule(0.055, 0.06, M.peau());
  cou.position.y = -0.08;
  tete.add(cou);
  const visage = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 14), M.peau());
  visage.scale.set(0.92, 1.1, 1);
  visage.position.y = 0.06;
  tete.add(visage);
  const casque = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.casque);
  casque.scale.set(1, 0.85, 1.12);
  casque.position.y = 0.11;
  tete.add(casque);
  const visiere = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 24, 1, false, Math.PI * 0.6, Math.PI * 0.8), M.casque);
  visiere.position.set(0, 0.115, -0.02);
  tete.add(visiere);
  const lampe = new THREE.Group();
  lampe.position.set(0, 0.17, -0.14);
  tete.add(lampe);
  const boitier = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 14), M.noir);
  boitier.rotation.x = Math.PI / 2;
  lampe.add(boitier);
  const lentille = new THREE.Mesh(new THREE.CircleGeometry(0.026, 16), M.lentille);
  lentille.position.z = -0.026;
  lentille.rotation.y = Math.PI;
  lampe.add(lentille);
  const lunettes = boite(0.17, 0.045, 0.02, M.verre);
  lunettes.position.set(0, 0.075, -0.1);
  tete.add(lunettes);
  // Cordon de la lampe : du casque à la batterie, dans le dos.
  const cordon = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.75, 0.13), new THREE.Vector3(0.05, 1.5, 0.2), new THREE.Vector3(0.06, 1.2, 0.2), new THREE.Vector3(0.02, 1.0, 0.19),
  ]), 16, 0.008, 6), M.noir);
  corps.add(cordon);

  // Bras (pivots aux épaules), gants.
  const bras = [-1, 1].map((s) => {
    const epaule = membre(0.065, 0.28, M.combi());
    epaule.position.set(s * 0.27, 1.43, 0);
    const avant = membre(0.058, 0.26, M.combi());
    avant.position.y = -0.36;
    epaule.add(avant);
    const bande = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), M.bande());
    bande.position.y = -0.14;
    avant.add(bande);
    const gant = capsule(0.05, 0.06, M.gant());
    gant.position.y = -0.37;
    avant.add(gant);
    corps.add(epaule);
    return { epaule, avant };
  });

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.avatar = true; } });

  let phase = 0;
  /** Marche : vitesse en m/s (0 = au repos). */
  function animer(vitesse, dt) {
    const v = Math.min(1.4, vitesse / 2.2);
    phase += dt * (2.2 + vitesse * 2.6);
    const s = Math.sin(phase);
    const a = 0.55 * v;
    jambes[0].cuisse.rotation.x = s * a;
    jambes[1].cuisse.rotation.x = -s * a;
    jambes[0].genou.rotation.x = -Math.max(0, -Math.cos(phase)) * a * 1.2;
    jambes[1].genou.rotation.x = -Math.max(0, Math.cos(phase)) * a * 1.2;
    bras[0].epaule.rotation.x = -s * a * 0.9;
    bras[1].epaule.rotation.x = s * a * 0.9;
    for (const b of bras) b.avant.rotation.x = 0.25 + 0.35 * v;
    bras[0].epaule.rotation.z = -0.08;
    bras[1].epaule.rotation.z = 0.08;
    corps.position.y = Math.abs(Math.cos(phase)) * 0.035 * v;
    corps.rotation.x = -0.06 * v;
    // Respiration au repos.
    if (v < 0.05) tete.rotation.x = 0.03 * Math.sin(phase * 0.4);
  }
  return { group: g, animer, lampe, tete };
}
