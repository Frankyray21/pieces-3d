// Plan du plancher pour foreuse aux diamants sous terre, d'après la procédure
// PRO-DD-ST-003 de Machines Roger International (révision juillet 2026).
//
// Repère (mètres) : X le long de la galerie (longueur du plancher, 32 pi),
// Z en travers de la galerie (largeur du plancher, 16 pi, sens du forage :
// la foreuse fore dans le mur Z négatif, ses patins croisent les 6 × 6),
// Y vers le haut. Le dessous des madriers 6 × 6 est à Y = 0 : c'est le point
// le plus haut du sol (étape 2, le premier madrier repose directement sur le
// sol), le dessus du plancher est donc à 9 po (6 × 6 + 3 × 8).
//
// Les pièces calculées ici portent leur numéro d'étape de la procédure
// (step), pour animer le montage dans l'ordre (vidéo de formation).

export const IN = 0.0254;
export const FT = 0.3048;

// Bois brut (dimensions pleines) et bois raboté.
export const B66 = 6 * IN; // madrier 6 × 6 brut
export const P3 = 3 * IN; // 3 × 8 brut : épaisseur
export const P8 = 8 * IN; // 3 × 8 brut : largeur
export const S24 = { t: 1.5 * IN, w: 3.5 * IN }; // 2 × 4 raboté
export const R24 = { t: 2 * IN, w: 4 * IN }; // 2 × 4 brut

// Plancher complet (étape 1 et critère 4 : 500 m et plus).
export const W = 16 * FT; // largeur (Z)
export const L = 32 * FT; // longueur (X), deux sections de 16 × 16 pi
export const SEC = 16 * FT;
export const DECK = B66 + P3; // dessus du plancher : 9 po

// Madriers 6 × 6 d'une section : le premier sur la ligne de peinture, un autre
// à 16 pi (cadrage 16 × 16), les autres entre les deux. La procédure en donne
// « 4 autres à 32 po centre » ; 7 madriers au total respectent à la fois les
// 16 pi et l'entraxe d'environ 32 po (31 po, faces extérieures au ras des
// planches). Constante à ajuster si la procédure retient 6 madriers.
export const JOISTS = 7;
export const joistZ = Array.from({ length: JOISTS }, (_, k) => -W / 2 + B66 / 2 + (k * (W - B66)) / (JOISTS - 1));

// Galerie : 18 pi de large, l'écart plancher-mur est de 12 po de chaque côté
// (étape 17 : grillage de 24 po au bas du mur).
export const GAL = 9 * FT; // demi-largeur
export const GAL_X0 = -4.2;
export const GAL_X1 = L + 6.5;
export const WALL_H = 2.7; // murs coupés à cette hauteur (vue en écorché)

// Foreuse (silhouette) : sur la section 1, tour tournée vers le mur Z négatif.
export const DRILL = { x: 2.7, front: -GAL + 0.2, tilt: (12 * Math.PI) / 180, len: 3.0, frontY: DECK + 1.2 };

// Escalier : au bout du plancher (X = L), du côté Z positif de l'axe.
export const STAIR = { z0: 0.35, w: 48 * IN, tread: 16 * IN };

// ------------------------------------------------------------------ sol

const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

// Sol brut de la galerie : pente vers le bout de la galerie (la section 2 est
// plus haute que le sol, d'où les soutiens 6 × 6 et l'escalier), léger dévers,
// ondulations de roche concassée et un creux sous un coin (cage de bois).
function rawGround(x, z) {
  const drop = -0.42 * smooth((x - 1.2) / 8.2);
  const cross = -0.035 * (z + W / 2) / W;
  const dip = -0.36 * Math.exp(-((x - (L - 0.95)) ** 2 + (z - (W / 2 - 0.75)) ** 2) / (2 * 0.42 ** 2));
  const n = 0.012 * Math.sin(2.3 * x + 1.1 * z) * Math.cos(2.9 * z - 0.8 * x) + 0.006 * Math.sin(5.7 * x + 0.4) * Math.sin(4.3 * z + 1.2);
  // Au-delà du plancher, le sol remonte doucement vers l'entrée de la galerie.
  const beyond = 0.08 * smooth((x - (L + 1.5)) / 4);
  return drop + cross + dip + n + beyond;
}

// Point le plus haut sous le plancher = 0.
const OFFSET = (() => {
  let m = -Infinity;
  for (let x = 0; x <= L + 1e-6; x += 0.05) for (let z = -W / 2; z <= W / 2 + 1e-6; z += 0.05) m = Math.max(m, rawGround(x, z));
  return m;
})();

export const ground = (x, z) => rawGround(x, z) - OFFSET;

/** Point le plus haut du sol sous une empreinte rectangulaire (centre, demi-tailles). */
export function groundUnder(x, z, hx, hz) {
  let m = -Infinity;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) m = Math.max(m, ground(x + (i / 2) * hx, z + (j / 2) * hz));
  return m;
}

// ------------------------------------------------------------------ blocages

export const WEDGE = { len: 10 * IN, w: 3.5 * IN, t: 2 * IN }; // coin de bois
const BLOCK38 = 24 * IN; // blocage 3 × 8 (longueur)
const BLOCK66 = 18 * IN; // blocage 6 × 6
const CRIB = 30 * IN; // pièces de cage (24 à 36 po)
const MIN = 0.006; // jeu sous lequel le madrier repose directement

/**
 * Empilement de soutien sous un appui (dessous de l'appui à Y = top) :
 * blocages 6 × 6 et 3 × 8 posés dans le sens contraire de l'appui, puis coin
 * de bois (ou paire de coins opposés) pour mettre de niveau. Au-delà de 18 po
 * de blocage, une cage (pièces croisées, étape 11). along : 'z' sous un madrier
 * (qui suit X), 'x' sous un soutien de 16 pi (qui suit Z).
 *
 * Retourne des pièces { kind, size: [sx, sy, sz], pos: [x, y, z] } et des coins
 * { kind: 'wedge', pos, dir, flip, thick } ; kind : 'b38', 'b66', 'crib', 'wedge'.
 */
export function stack(x, z, top, along = 'z', { forceTop38 = false, len38 = BLOCK38 } = {}) {
  const lz = along === 'z';
  const foot = lz ? [P8 / 2, len38 / 2] : [len38 / 2, P8 / 2];
  const g = groundUnder(x, z, ...foot);
  const G = top - g;
  const out = [];
  if (G < MIN) return { pieces: out, gap: G, ground: g };
  let n66 = Math.max(0, Math.floor((G - MIN) / B66));
  let rem = G - n66 * B66;
  let n38 = Math.max(0, Math.floor((rem - MIN) / P3));
  // Jonction des sections : le dessus est un 3 × 8 à plat, assez large pour les deux bouts.
  if (forceTop38 && n38 === 0 && n66 > 0) { n66 -= 1; n38 = Math.floor((G - n66 * B66 - MIN) / P3); }
  const r = G - n66 * B66 - n38 * P3;
  const crib = n66 * B66 + n38 * P3 >= 17.9 * IN;
  let y = g;
  const piece = (kind, sAlong, sh, sAcross, px = x, pz = z) => {
    const size = lz ? [sAcross, sh, sAlong] : [sAlong, sh, sAcross];
    out.push({ kind, size, pos: [px, y + sh / 2, pz] });
  };
  if (crib) {
    // Cage : couches de deux 6 × 6 parallèles, sens alterné d'une couche à l'autre.
    for (let i = 0; i < n66; i++) {
      const alongZ = i % 2 === 0;
      const off = CRIB / 2 - B66 / 2;
      for (const s of [-1, 1]) {
        const size = alongZ ? [B66, B66, CRIB] : [CRIB, B66, B66];
        out.push({ kind: 'crib', size, pos: [x + (alongZ ? s * off : 0), y + B66 / 2, z + (alongZ ? 0 : s * off)] });
      }
      y += B66;
    }
  } else {
    for (let i = 0; i < n66; i++) { piece('b66', BLOCK66, B66, B66); y += B66; }
  }
  for (let i = 0; i < n38; i++) { piece('b38', len38, P3, P8); y += P3; }
  // Coins : enfoncés en travers de l'appui (le long de « along »).
  const single = r <= WEDGE.t;
  out.push({ kind: 'wedge', pos: [x, y, z], along, pair: !single, thick: r });
  return { pieces: out, gap: G, ground: g };
}

// ------------------------------------------------------------------ appuis

// Six appuis minimum par madrier (étape 5) : cinq dans la section, plus le
// blocage de jonction partagé à 16 pi (étape 5, dernier point).
export const SUPPORTS_S1 = [0.6, 3.6, 6.6, 9.6, 12.8].map((f) => f * FT);
export const SUPPORTS_S2 = [19.3, 22.5, 25.7, 28.9, 31.4].map((f) => f * FT);
export const JOINT_X = SEC;

/**
 * Lignes de soutien de la section 2 : là où le sol est assez bas pour glisser
 * un 6 × 6 de 16 pi sous les madriers (étape 10), dans le sens contraire.
 */
export function sleeperLines() {
  return SUPPORTS_S2.filter((x) => Math.min(...joistZ.map((z) => -groundUnder(x, z, BLOCK38 / 2, P8 / 2))) >= B66 + 0.012);
}

/** Hauteur du dessus du plancher au-dessus du sol au bord (x, z). */
export const deckHeight = (x, z) => DECK - ground(x, z);

/** Plus petite abscisse à partir de laquelle le bord (z) dépasse 12 po de haut. */
export function over12(z) {
  for (let x = 0; x <= L; x += 0.05) if (deckHeight(x, z) > 12 * IN) return x;
  return null;
}

// ------------------------------------------------------------------ étapes

/** Étapes de la procédure, pour l'animation du montage. */
export const STEPS = [
  { n: 0, title: 'Inspection des lieux par le superviseur', text: 'Plancher exempt de débris, plat, fonds de trous trouvés et marqués.' },
  { n: 1, title: 'Marquer la position du plancher', text: "Avec le plan de forage, tracer à la peinture la ligne de référence du plancher (16 × 32 pi)." },
  { n: 2, title: 'Trouver le point le plus haut', text: 'Niveau au laser Bosch : le premier madrier repose directement sur le sol au point le plus haut.' },
  { n: 3, title: 'Placer la structure de base', text: 'Madriers 6 × 6 dans le sens contraire du forage : les patins de la foreuse croisent les 6 × 6.' },
  { n: 4, title: 'Cadrage 16 × 16 pi', text: 'Premier madrier sur la ligne de peinture, un 6 × 6 à 16 pi, les autres à environ 32 po centre.' },
  { n: 5, title: 'Mettre de niveau', text: 'Niveau de 48 po sur un 3 × 8 de 8 pi ; blocages 3 × 8 ou 6 × 6 et coins de bois, au moins 6 par madrier, et blocage de jonction pour la section suivante.' },
  { n: 6, title: 'Couvrir en 3 × 8', text: 'Planches dans le sens contraire des 6 × 6, tire-fonds à chaque extrémité ; avancer sur la surface déjà couverte, sans enjamber les 6 × 6.' },
  { n: 7, title: 'Resserrer les planches', text: 'À environ 50 % : coins de bois enfoncés pour mettre les planches en tension, puis visser la planche devant les coins.' },
  { n: 8, title: 'Laisser deux planches libres', text: 'Espace pour commencer la structure de la section 2 ; à la fin, visser pour joindre les sections.' },
  { n: 9, title: 'Section 2 : hauteur au laser', text: 'Le faisceau du laser donne la hauteur à soutenir sous les 6 × 6.' },
  { n: 10, title: 'Section 2 : madrier guide et soutiens', text: 'Madrier guide à 16 pi de la section 1 ; soutiens 6 × 6 de 16 pi dans le sens contraire quand la hauteur le permet.' },
  { n: 11, title: 'Section 2 : madriers et blocages', text: 'Madriers à environ 32 po centre, soutiens alignés sous les croisements, cages de bois dans les cas spéciaux.' },
  { n: 12, title: 'Couvrir la section 2', text: 'Répéter les étapes 6 et 7.' },
  { n: 13, title: 'Couper au ras', text: "Aucun 6 × 6 ni 3 × 8 ne dépasse : bouts coupés carrés au ras du plancher." },
  { n: 14, title: 'Marches', text: 'Plancher plus haut que 12 po : marches de 16 po de profondeur, 36 à 60 po de large, 12 po de haut au plus.' },
  { n: 15, title: 'Garde-corps et lisse inférieure', text: 'RSST art. 12 : lisse supérieure entre 1 et 1,2 m, lisse intermédiaire à mi-hauteur, plinthe d’au moins 90 mm.' },
  { n: 16, title: 'Mains courantes', text: "Plus d'une marche : mains courantes." },
  { n: 17, title: 'Grillage au bas du mur', text: 'Écart plancher-mur de 12 po ou moins : grillage de 24 po fixé au bas du mur.' },
  { n: 18, title: 'Plancher secondaire', text: '32 × 72 po au moins, 12 po de haut au plus, dernière planche à 3 po de la tour, deux dernières planches vissées.' },
];
