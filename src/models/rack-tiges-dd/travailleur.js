// Travailleur en silhouette sobre (combinaison orange à bandes réfléchissantes,
// casque à lampe, gants bleus, comme sur la photo de l'étape 14 de la
// procédure) : repère d'échelle humaine et « à deux » de l'étape 4. Pieds à
// l'origine, regard vers −Z (vers la paroi), 1,75 m.

const POSES = {
  debout: { epaule: [0.08, 0.08], coude: [0.12, 0.12] },
  // Mains en avant à hauteur de poitrine et d'épaule : tient un poteau du support.
  porte: { epaule: [1.25, 1.05], coude: [0.55, 0.75] },
  // Tient un outil devant lui, à hauteur d'épaule (foreuse à percussion).
  perce: { epaule: [1.38, 1.2], coude: [0.2, 0.55] },
};

function membre(S, r, len, material, bande) {
  const g = S.group(S.cyl(r, len, material, { pos: [0, -len / 2, 0], seg: 14 }));
  if (bande) g.add(S.cyl(r + 0.003, 0.028, 'bandeReflet', { pos: [0, -len * bande, 0], seg: 14 }));
  return g;
}

/** Travailleur dans la pose donnée ('debout', 'porte', 'perce'). */
export function travailleur(S, pose = 'debout') {
  const P = POSES[pose] || POSES.debout;
  const g = S.group();
  // Jambes et bottes.
  for (const s of [-1, 1]) {
    const jambe = S.group(membre(S, 0.078, 0.45, 'tissuOrange'));
    const bas = membre(S, 0.06, 0.4, 'tissuOrange', 0.55);
    bas.position.y = -0.45;
    jambe.add(bas);
    jambe.position.set(s * 0.095, 0.94, 0);
    g.add(jambe, S.box(0.105, 0.1, 0.27, 'rubber', { r: 0.03, pos: [s * 0.095, 0.05, -0.04] }));
  }
  // Bassin, torse, bandes réfléchissantes (ceinture, poitrine, bretelles).
  g.add(S.box(0.33, 0.2, 0.2, 'tissuOrange', { r: 0.06, pos: [0, 0.99, 0] }));
  g.add(S.box(0.37, 0.47, 0.21, 'tissuOrange', { r: 0.08, pos: [0, 1.28, 0] }));
  for (const y of [1.13, 1.33]) g.add(S.box(0.376, 0.03, 0.216, 'bandeReflet', { r: 0.014, pos: [0, y, 0] }));
  for (const s of [-1, 1]) g.add(S.box(0.03, 0.17, 0.216, 'bandeReflet', { r: 0.012, pos: [s * 0.1, 1.44, 0] }));
  // Bras : épaule, coude, main gantée.
  [-1, 1].forEach((s, i) => {
    const bras = membre(S, 0.046, 0.3, 'tissuOrange');
    const avant = membre(S, 0.04, 0.26, 'tissuOrange', 0.7);
    avant.add(S.box(0.06, 0.1, 0.08, 'gantBleu', { r: 0.025, pos: [0, -0.3, 0] }));
    avant.position.y = -0.3;
    avant.rotation.x = P.coude[i];
    bras.add(avant, S.ball(0.058, 'tissuOrange'));
    bras.position.set(s * 0.228, 1.455, 0);
    bras.rotation.x = P.epaule[i];
    g.add(bras);
  });
  // Cou, tête, casque à lampe.
  g.add(S.cyl(0.05, 0.08, 'peau', { pos: [0, 1.54, 0], seg: 14 }));
  g.add(S.ball(0.1, 'peau', { pos: [0, 1.655, 0] }));
  // Casque : calotte et rebord (profil du bas vers le haut).
  g.add(S.lathe([[0.001, -0.01], [0.112, -0.01], [0.142, -0.014], [0.142, -0.005], [0.12, 0.002], [0.117, 0.03], [0.098, 0.075], [0.06, 0.1], [0.001, 0.108]], 'yellow', { pos: [0, 1.69, -0.004], seg: 24 }));
  g.add(S.box(0.05, 0.04, 0.03, 'black', { r: 0.008, pos: [0, 1.745, -0.118] }), S.cyl(0.016, 0.012, 'lamp', { axis: 'z', pos: [0, 1.745, -0.136], seg: 14 }));
  return g;
}
