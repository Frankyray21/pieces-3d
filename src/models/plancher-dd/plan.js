// Plan du plancher pour foreuse aux diamants sous terre, d'après la procédure
// PRO-DD-ST-003 de Machines Roger International (révision juillet 2026).
//
// Repère (mètres) : X le long de la galerie (longueur du plancher, 32 pi),
// Z en travers de la galerie (largeur du plancher, 16 pi : toute la largeur
// de la galerie), Y vers le haut. La foreuse fore vers le fond de la galerie
// (X négatif, front de taille où sont marqués les fonds de trous). Les
// planches 3 × 8 sont en travers de la galerie, dans le sens contraire du
// forage ; les madriers 6 × 6 dans le sens contraire des planches, le long de
// la galerie. Section 1 au fond (X de 0 à 16 pi), section 2 vers l'entrée :
// ses madriers prolongent ceux de la section 1 (bout à bout sur le blocage de
// jonction, X = 16 pi), et les 2 planches laissées libres au bout de la
// section 1 sont à cette jonction, au centre du plancher.
// Le dessous des madriers 6 × 6 est à Y = 0 : c'est le point le plus haut du
// sol (étape 2, le premier madrier repose directement sur le sol), le dessus
// du plancher est donc à 9 po (6 × 6 + 3 × 8).
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

// Madriers 6 × 6 de 16 pi, le long de la galerie (selon X). Section 1 : le
// premier sur la ligne de peinture (rive Z négative), un autre à 16 pi (cadrage
// 16 × 16), les autres entre les deux. La procédure en donne « à 32 po
// centre » : 7 madriers respectent les 16 pi et l'entraxe d'environ 32 po
// (31 po). Section 2 : mêmes lignes, de X = 16 pi à 32 pi.
export const JOISTS = 7;
export const joistZ = Array.from({ length: JOISTS }, (_, k) => -W / 2 + B66 / 2 + (k * (W - B66)) / (JOISTS - 1));
export const JOINT_X = SEC; // jonction des deux sections (blocage commun)
// Appuis de la section 1 (étape 5) : rangées en travers (selon Z), au moins 6
// par madrier, plus le blocage de jonction.
export const SUPPORTS_X = Array.from({ length: 6 }, (_, k) => 0.16 + k * 0.8);
// Section 2 (étape 10) : soutiens 6 × 6 de 16 pi en travers (sens contraire des
// madriers), à environ 32 po centre de la jonction jusqu'au madrier guide,
// posé à 16 pi de la section 1.
export const SLEEPERS_X = Array.from({ length: 6 }, (_, k) => SEC + ((k + 1) * (SEC - B66 / 2)) / 6);
export const GUIDE_X = SLEEPERS_X[5];

// Galerie : 18 pi de large, l'écart plancher-mur est de 12 po de chaque côté
// (étape 17 : grillage de 24 po au bas du mur). Front de taille (fond de la
// galerie) à FACE_X, devant le bout X = 0 du plancher.
export const GAL = 9 * FT; // demi-largeur
export const FACE_X = -0.12; // plancher collé au front de taille
export const GAL_X0 = FACE_X - 0.1;
export const GAL_X1 = L + 8.6;
export const WALL_H = 2.7; // murs coupés à cette hauteur (vue en écorché)

// Foreuse : sur la section 1, tour tournée vers le front de taille (X
// négatif) ; ses patins suivent X, comme les madriers. x : avant de la tour ;
// z : axe de la tour.
export const DRILL = { x: 0.3, z: -0.35, tilt: (12 * Math.PI) / 180, len: 3.0, frontY: DECK + 1.2 };

// Escalier : au bout du plancher (X = L), du côté Z positif de l'axe.
export const STAIR = { z0: 0.35, w: 48 * IN, tread: 16 * IN };

// ------------------------------------------------------------------ sol

// Creux sous un croisement de la section 2 (cage de bois, étape 11).
export const DIP = { x: SLEEPERS_X[4], z: joistZ[5] };

const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

// Sol brut de la galerie : pente vers le bout de la galerie (la section 2 est
// plus haute que le sol, d'où les soutiens 6 × 6 et l'escalier), léger dévers,
// ondulations de roche concassée et un creux sous un coin (cage de bois).
function rawGround(x, z) {
  const drop = -0.33 * smooth((x - 0.45) / 8.2);
  const cross = -0.035 * (z + W / 2) / W;
  const dip = -0.5 * Math.exp(-((x - DIP.x) ** 2 + (z - DIP.z) ** 2) / (2 * 0.33 ** 2));
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
 * Soutien sous un appui (dessous de l'appui à Y = top). Règle de chantier :
 * jamais de bois simplement empilé. Un seul blocage (3 × 8 ou 6 × 6), posé
 * dans le sens contraire de l'appui, puis un coin de bois (ou une paire de
 * coins opposés) pour mettre de niveau ; au-delà, une cage : couches de deux
 * pièces parallèles, croisées d'une couche à l'autre (étape 11, cas spéciaux).
 * along : 'z' sous un appui qui suit X, 'x' sous un appui qui suit Z.
 *
 * Retourne des pièces { kind, size: [sx, sy, sz], pos: [x, y, z] } et des coins
 * { kind: 'wedge', pos, along, pair, thick } ; kind : 'b38', 'b66', 'crib', 'wedge'.
 */
export const WEDGE_MAX = WEDGE.t * 1.75; // paire de coins opposés au plus serré
export function stack(x, z, top, along = 'z', { len38 = BLOCK38, inFloor = false } = {}) {
  const lz = along === 'z';
  // Sous le plancher, un blocage ne dépasse pas la rive (étape 13) : sous un
  // madrier de rive, il est décalé vers l'intérieur (il porte toujours le madrier).
  const shift = (len) => {
    if (!inFloor) return 0;
    const c = lz ? z : x, lo = lz ? -W / 2 : 0, hi = lz ? W / 2 : L;
    return Math.min(Math.max(c, lo + len / 2), hi - len / 2) - c;
  };
  const d38 = shift(len38);
  const foot = lz ? [P8 / 2, len38 / 2] : [len38 / 2, P8 / 2];
  const g = lz ? groundUnder(x, z + d38, ...foot) : groundUnder(x + d38, z, ...foot);
  const G = top - g;
  const out = [];
  if (G < MIN) return { pieces: out, gap: G, ground: g };
  const piece = (kind, sAlong, sh, sAcross, y) => {
    const size = lz ? [sAcross, sh, sAlong] : [sAlong, sh, sAcross];
    const d = shift(sAlong);
    out.push({ kind, size, pos: [x + (lz ? 0 : d), y + sh / 2, z + (lz ? d : 0)] });
  };
  let y = g;
  if (G <= WEDGE_MAX) {
    // Coins seulement.
  } else if (G <= P3 + WEDGE_MAX) {
    piece('b38', len38, P3, P8, y); y += P3;
  } else if (G <= B66 + WEDGE_MAX) {
    piece('b66', BLOCK66, B66, B66, y); y += B66;
  } else {
    // Cage : couches de deux 6 × 6 parallèles, sens alterné ; couche de 3 × 8 au besoin.
    const off = CRIB / 2 - B66 / 2;
    let i = 0;
    while (top - y - B66 > WEDGE_MAX - 1e-6 || i < 2) {
      if (top - y - B66 < MIN) break;
      const alongZ = i % 2 === 0;
      for (const s of [-1, 1]) {
        const size = alongZ ? [B66, B66, CRIB] : [CRIB, B66, B66];
        out.push({ kind: 'crib', size, pos: [x + (alongZ ? s * off : 0), y + B66 / 2, z + (alongZ ? 0 : s * off)] });
      }
      y += B66;
      i++;
    }
    if (top - y > WEDGE_MAX) {
      const alongZ = i % 2 === 0;
      for (const s of [-1, 1]) {
        const size = alongZ ? [P8, P3, CRIB] : [CRIB, P3, P8];
        out.push({ kind: 'crib', size, pos: [x + (alongZ ? s * (CRIB / 2 - P8 / 2) : 0), y + P3 / 2, z + (alongZ ? 0 : s * (CRIB / 2 - P8 / 2))] });
      }
      y += P3;
    }
  }
  const r = top - y;
  out.push({ kind: 'wedge', pos: [x, y, z], along, pair: r > WEDGE.t, thick: r });
  return { pieces: out, gap: G, ground: g };
}

// ------------------------------------------------------------------ appuis

/** Hauteur du dessus du plancher au-dessus du sol au bord (x, z). */
export const deckHeight = (x, z) => DECK - ground(x, z);

/** Plus petite abscisse à partir de laquelle le bord (z) dépasse 12 po de haut. */
export function over12(z) {
  for (let x = 0; x <= L; x += 0.05) if (deckHeight(x, z) > 12 * IN) return x;
  return null;
}

// ------------------------------------------------------------------ étapes

/** Étapes de la procédure (page où elles sont décrites), pour le montage par étapes et la vidéo. */
export const STEPS = [
  { n: 0, cam: { pos: [3.4, 1.65, 0.9], tgt: [-0.95, 1.5, 0.1] }, page: 'P02', title: 'Inspection des lieux par le superviseur', text: 'Plancher exempt de débris, plat, fonds de trous trouvés et marqués.' },
  { n: 1, cam: { pos: [-2.6, 2.0, 0.9], tgt: [3.2, -0.15, -2.35] }, page: 'P02', title: 'Marquer la position du plancher', text: "Avec le plan de forage, tracer à la peinture la ligne de référence du plancher (16 × 32 pi)." },
  { n: 2, cam: { pos: [-1.9, 1.45, 1.4], tgt: [0.9, -0.05, -1.7] }, page: 'P03', title: 'Trouver le point le plus haut', text: 'Niveau au laser Bosch : le premier madrier repose directement sur le sol au point le plus haut.' },
  { n: 3, cam: { pos: [SEC / 2 + 4.0, 3.1, 5.8], tgt: [SEC / 2, -0.05, -0.2] }, page: 'P03', title: 'Placer la structure de base', text: 'Madriers 6 × 6 le long de la galerie, les planches 3 × 8 en travers, dans le sens contraire du forage.' },
  { n: 4, cam: { pos: [SEC / 2 + 2.6, 4.2, 4.6], tgt: [SEC / 2, -0.05, 0] }, page: 'P04', title: 'Cadrage 16 × 16 pi', text: 'Premier madrier sur la ligne de peinture, un 6 × 6 à 16 pi, les autres à environ 32 po centre.' },
  { n: 5, cam: { pos: [SEC * 0.78, 0.75, 4.1], tgt: [SEC * 0.42, -0.02, 0.6] }, page: 'P05', title: 'Mettre de niveau', text: 'Niveau de 48 po sur un 3 × 8 de 8 pi ; blocages 3 × 8 ou 6 × 6 et coins de bois, au moins 6 par madrier, et blocage de jonction pour la section suivante.' },
  { n: 6, cam: { pos: [-1.9, 3.5, 4.6], tgt: [SEC * 0.62, 0, 0] }, page: 'P07', title: 'Couvrir en 3 × 8', text: 'Planches 3 × 8 dans le sens contraire des 6 × 6, la première vissée avec des tire-fonds à chaque extrémité ; avancer sur la surface déjà couverte, sans enjamber les 6 × 6.' },
  { n: 7, cam: { pos: [SEC + 1.15, 1.35, 0.95], tgt: [SEC - 1.4, 0.15, -1.0] }, page: 'P08', title: 'Resserrer les planches', text: 'À environ 50 % : coins de bois enfoncés pour mettre les planches en tension, puis visser la planche devant les coins.' },
  { n: 8, cam: { pos: [SEC + 1.8, 1.6, 3.4], tgt: [SEC - 0.3, 0.1, 0.3] }, page: 'P09', title: 'Laisser deux planches libres', text: 'À la jonction, au centre du plancher : espace pour commencer la structure de la section 2 ; à la fin, visser pour joindre les sections.' },
  { n: 9, cam: { pos: [L + 1.7, 0.6, 4.1], tgt: [L - 1.6, -0.25, 1.0] }, page: 'P09', title: 'Section 2 : hauteur au laser', text: 'Le faisceau du laser donne la hauteur à soutenir sous les 6 × 6.' },
  { n: 10, cam: { pos: [SEC * 1.5 + 4.6, 2.2, 5.6], tgt: [SEC * 1.5, -0.25, 0] }, page: 'P10', title: 'Section 2 : madrier guide et soutiens', text: 'Madrier guide à 16 pi de la section 1 ; soutiens 6 × 6 de 16 pi dans le sens contraire quand la hauteur le permet.' },
  { n: 11, cam: { pos: [SEC * 1.5 + 4.6, 2.7, 5.6], tgt: [SEC * 1.5, -0.2, 0] }, page: 'P12', title: 'Section 2 : madriers et blocages', text: 'Madriers dans le prolongement de ceux de la section 1, à environ 32 po centre ; soutiens alignés sous les croisements, cages de bois dans les cas spéciaux.' },
  { n: 12, cam: { pos: [L + 3.0, 3.4, 4.8], tgt: [SEC * 1.45, 0, 0] }, page: 'P13', title: 'Couvrir la section 2', text: 'Répéter les étapes 6 et 7.' },
  { n: 13, cam: { pos: [4.6, 0.8, 3.9], tgt: [6.4, 0.16, 2.44] }, page: 'P13', title: 'Couper au ras', text: "Aucun 6 × 6 ni 3 × 8 ne dépasse : bouts coupés carrés au ras du plancher." },
  { n: 14, cam: { pos: [L + 3.4, 1.45, 2.15], tgt: [L + 0.3, 0.02, 0.96] }, page: 'P14', title: 'Marches', text: 'Plancher plus haut que 12 po : marches de 16 po de profondeur, 36 à 60 po de large, 12 po de haut au plus.' },
  { n: 15, cam: { pos: [L + 4.6, 2.7, 5.2], tgt: [L - 2.2, 0.6, 0.4] }, page: 'P16', title: 'Garde-corps et lisse inférieure', text: 'RSST art. 12 : lisse supérieure entre 1 et 1,2 m, lisse intermédiaire à mi-hauteur, plinthe d’au moins 90 mm.' },
  { n: 16, cam: { pos: [L + 3.0, 1.7, 2.2], tgt: [L + 0.3, 0.3, 0.96] }, page: 'P16', title: 'Mains courantes', text: "Plus d'une marche : mains courantes." },
  { n: 17, cam: { pos: [6.3, 1.9, -1.2], tgt: [6.6, 0.0, -2.75] }, page: 'P16', title: 'Grillage au bas du mur', text: 'Écart plancher-mur de 12 po ou moins : grillage de 24 po fixé au bas du mur.' },
  { n: 18, cam: { pos: [3.3, 1.9, 2.5], tgt: [0.9, 0.35, 0.3] }, page: 'P17', label: 'À la foreuse', title: 'Plancher secondaire', text: '32 × 72 po au moins, 12 po de haut au plus, dernière planche à 3 po de la tour, deux dernières planches vissées.' },
];

// Point le plus haut du sol sous la section 1 (étape 2).
const HIGH = (() => {
  let b = { y: -Infinity };
  for (let x = 0; x <= SEC; x += 0.05) for (let z = -W / 2; z <= W / 2; z += 0.05) { const y = ground(x, z); if (y > b.y) b = { x, z, y }; }
  return b;
})();

// Planches 3 × 8 en travers de la galerie (selon Z), posées côte à côte du
// fond vers l'entrée : section 1, 0 à 23 (22 et 23 : les 2 planches libres à
// la jonction) ; section 2, 24 à 47.
export const plankX = (i) => (i + 0.5) * P8;
// Sens de pose (étape 6) : on couvre en marchant sur ce qui est déjà couvert, sans enjamber
// les 6 × 6. Section 1 : de la jonction (2 planches libres laissées) vers le front de taille ;
// section 2 : les 2 planches de jonction posées d'abord (non vissées) pour passer de la section 1
// sans enjamber, puis de la jonction vers le bout côté galerie. d1(k) / d2(k) : indice de la k-ième planche posée.
export const S1_FIRST = 21, S2_FIRST = 24;
export const d1 = (k) => S1_FIRST - k;
export const d2 = (k) => S2_FIRST + k;
export const TIGHT = 10; // planche vissée devant les coins de serrage (étape 7)

/** Annotations du montage par étapes : texte posé dans la 3D aux étapes données. */
export const NOTES = [
  { steps: [1], pos: [0, 0.05, -1.2], text: 'Ligne de référence en peinture' },
  { steps: [2], pos: [HIGH.x, HIGH.y + 0.45, HIGH.z], text: 'Point le plus haut : le 1er madrier repose sur le sol' },
  { steps: [2, 9], pos: [0.25, 0.25, -W / 2 + 0.6], text: 'Niveau au laser Bosch' },
  { steps: [3], pos: [1.2, B66 + 0.05, joistZ[0]], text: '1er madrier 6 × 6 sur la ligne de peinture' },
  { steps: [4], pos: [1.2, B66 + 0.05, joistZ[JOISTS - 1]], text: 'Madrier à 16 pi du premier' },
  { steps: [5], pos: [SUPPORTS_X[2], -0.02, joistZ[1] + 0.25], text: 'Blocage + coin, en sens contraire' },
  { steps: [5], pos: [JOINT_X, -0.02, joistZ[3]], text: 'Blocage de jonction' },
  { steps: [6], pos: [plankX(d1(3)), DECK + 0.05, 1.2], text: 'Avancer sur la surface couverte' },
  { steps: [6], pos: [plankX(d1(0)), DECK + 0.05, joistZ[0]], text: '1re planche : tire-fonds aux 2 bouts' },
  { steps: [7], pos: [plankX(d1(TIGHT)) - P8 / 2, DECK + 0.3, 0.5], text: 'Coins enfoncés : planches en tension' },
  { steps: [8], pos: [plankX(22) + P8 / 2, B66 + 0.1, 0], text: '2 planches laissées libres, à la jonction' },
  { steps: [9], pos: [SEC * 1.5, 0.05, 0], text: 'Le sol descend : hauteur à soutenir' },
  { steps: [10], pos: [SLEEPERS_X[1], -B66 + 0.05, joistZ[1]], text: 'Soutiens 6 × 6 de 16 pi en sens contraire' },
  { steps: [10], pos: [GUIDE_X, 0.02, -0.6], text: 'Madrier guide' },
  { steps: [11], pos: [JOINT_X + 0.3, B66 + 0.05, joistZ[2]], text: 'Madriers dans le prolongement de la section 1' },
  { steps: [11], pos: [SLEEPERS_X[2], -B66 + 0.05, joistZ[4]], text: 'Soutiens enlignés aux croisements' },
  { steps: [10, 11], pos: [DIP.x, -0.3, DIP.z], text: 'Cage : pièces de 24 à 36 po' },
  { steps: [12], pos: [plankX(22) + P8 / 2, DECK + 0.05, 0], text: 'Planches de jonction vissées' },
  { steps: [13], pos: [L - 0.6, DECK + 0.05, W / 2], text: 'Bouts coupés carrés, au ras' },
  { steps: [15], pos: [L + 0.05, DECK + 0.12, -0.1], text: 'Plinthe de 90 mm min.' },
  { steps: [16], pos: [L + 0.5, DECK + 0.95, STAIR.z0 - 0.05], text: 'Main courante de chaque côté' },
];
