// Écrit public/equipment/coupleur-quik-loc/data.json : les cotes viennent du modèle
// (src/models/coupleur-quik-loc/index.js), pour que la fiche et la 3D disent la même chose.
// Contrôle aussi que le nez de la fiche mâle entre dans la bague, que le corps
// reste dans le diamètre publié et que le support ne touche pas les fiches.
// Usage : node tools/coupleur_quik_loc_fiche.mjs
import { writeFileSync } from 'node:fs';
import {
  CATALOGUE, TAILLE, D, L, ECHELLE, CABLE, BAGUE, NEZ, CONTACTS, FEMELLE, MALE, COLLIER, TIGE, PATTE, TROUS, BOULON,
} from '../src/models/coupleur-quik-loc/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const po = (v) => {
  const e = Math.floor(v + 1e-9), f = Math.round((v - e) * 16);
  if (!f) return `${e} po`;
  let n = f, d = 16;
  while (n % 2 === 0) { n /= 2; d /= 2; }
  return `${e ? `${e} ` : ''}${n}/${d} po`;
};

let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
if (NEZ.r >= BAGUE.rInt) echec('le nez de la fiche mâle n\'entre pas dans la bague');
if (MALE.r0 > D / 2 || FEMELLE.cone.r1 > D / 2) echec('un corps dépasse le diamètre publié');
if (FEMELLE.bout - 0 > L + 0.5 || NEZ.haut - MALE.bout.y > L + 0.5) echec('une fiche dépasse la longueur publiée');
if (PATTE.x - PATTE.large / 2 <= MALE.r0) echec('les pattes touchent la fiche mâle');
if (TIGE.x - TIGE.r <= D / 2) echec('les tiges touchent la fiche femelle');
if (CONTACTS.rayon + CONTACTS.douilleExt >= NEZ.r) echec('les contacts sortent du nez');

const longueur = FEMELLE.bout - MALE.bout.y;
const T = TAILLE;
const SOURCE = 'Photo fournie par le client (coupleur suspendu dans une galerie, dans son support en inox) ; cotes des fiches tirées du catalogue Crouse-Hinds (Eaton) des connecteurs Quik-Loc 600 V (tableau des fiches, cotes A et B en pouces, « approximatives »), relevées par la recherche : les pages du fabricant n\'ont pas pu être ouvertes depuis la session, le dessin coté n\'est pas reproduit ici';
const IDENT = `Connecteur Quik-Loc 600 V de Crouse-Hinds (Eaton), série standard (D), câble à câble : fiche femelle en haut, fiche mâle en bas, corps en caoutchouc noir, bague d'accouplement en bronze au manganèse, presse-étoupe côté câble, homologué MSHA pour les mines souterraines. Taille ${T.awg} AWG, ${T.amp} A : ${T.femelle} (femelle) et ${T.male} (mâle), 3 fils, 600 V c.a./c.c. Taille déduite de l'échelle de la photo (boulons de 3/8 po et pattes de 1 po du support, câble de ≈ ${mm(2 * CABLE.r)}, celui d'un câble portatif 3 × 4/0) : à confirmer par le numéro imprimé sur le corps`;
const PUB = `Fiche ${T.awg} AWG, ${T.amp} A : diamètre hors tout A = ${po(T.A)} (${mm(D, 1)}), longueur B = ${po(T.B)} (${mm(L, 1)}), pour la fiche mâle comme pour la femelle. Autres tailles du même tableau : ${CATALOGUE.filter((c) => c !== T).map((c) => `${c.awg} ${c.amp} A (${c.male} / ${c.femelle}${c.A ? `, ${po(c.A)} × ${po(c.B)}` : `, B = ${po(c.B)}`})`).join(' ; ')}`;
const RELEVE = `Relevé sur la photo (≈ ${fr(ECHELLE, 2)} mm par pixel, par le diamètre du corps de la fiche mâle) : bague d'accouplement de ${mm(BAGUE.haut)} sous le ruban (Ø ${mm(2 * BAGUE.rExt)}), corps de la fiche mâle conique de Ø ${mm(2 * MALE.r0, 0)} à Ø ${mm(2 * MALE.r1, 0)} sur ${mm(-MALE.y1)}, puis presse-étoupe jusqu'au câble ; corps de la fiche femelle conique, de Ø ${mm(2 * FEMELLE.cone.r0)} sous le collier intermédiaire à Ø ${mm(D, 1)} au collier supérieur, puis cylindrique. Cotes à ±10 % (photo de près, en perspective)`;
const SUPPOSE = `Supposés : nez de la fiche mâle de Ø ${mm(2 * NEZ.r)} engagé de ${mm(NEZ.haut)} dans la bague ; 3 broches de phase de Ø ${mm(2 * CONTACTS.broche)} sur un cercle de Ø ${mm(2 * CONTACTS.rayon)} et une broche de mise à la terre au centre, de ${mm(CONTACTS.long)} ; bout de la fiche femelle (hors photo) refermé en presse-étoupe sur la longueur publiée. Femelle en haut, côté alimentation (les douilles restent hors tension à nu quand on désaccouple) : à confirmer`;
const SUPPORT = `Fabriqué à la mine, relevé sur la photo, en inox : collier supérieur (sur la fiche femelle, Ø int. ${mm(2 * COLLIER.haut.rInt, 1)}) et collier intermédiaire (sous la bague, Ø int. ${mm(2 * COLLIER.milieu.rInt)}), chacun en deux demi-colliers à oreilles de ${mm(COLLIER.large)} × ${mm(COLLIER.ep)}, ${mm(2 * COLLIER.oreille)} d'une oreille à l'autre, serrés par des boulons de 3/8 po ; deux tiges de 1/2 po accrochées par-dessus les oreilles du collier supérieur, bout fileté dans les pattes ; deux pattes plates de 1 × 1/4 po, de ${mm(PATTE.yHaut - PATTE.yBas)}, bout arrondi, boulonnées sous les oreilles du collier intermédiaire, percées de Ø ${mm(2 * TROUS.r)} (gauche à ${mm(-TROUS.gauche[0])} et ${mm(-TROUS.gauche[1])} sous la bague, droite à ${mm(-TROUS.droite[0])} et ${mm(-TROUS.droite[1])}). Le support tient les deux fiches accouplées et reprend la traction des câbles`;

const pieces = [
  ['1', T.femelle, 1, `FICHE FEMELLE QUIK-LOC 600 V, ${T.amp} A, ${T.awg} AWG, 3 fils (série standard)`, { note: `Catalogue : Ø ${po(T.A)} × ${po(T.B)} (${mm(D, 1)} × ${mm(L, 1)}). Corps en caoutchouc, bague d'accouplement en bronze au manganèse (recouverte de ruban sur la photo), douilles de contact. Corps conique poussiéreux sur la photo. En haut, côté alimentation (supposé).` }],
  ['2', T.male, 1, `FICHE MÂLE QUIK-LOC 600 V, ${T.amp} A, ${T.awg} AWG, 3 fils (série standard)`, { note: `Catalogue : Ø ${po(T.A)} × ${po(T.B)}. Corps noir légèrement conique (Ø ${mm(2 * MALE.r0)} à ${mm(2 * MALE.r1)} relevés), nez engagé dans la bague de la femelle, broches supposées. Presse-étoupe sous le ruban blanc.` }],
  ['3', '', 1, 'COLLIER SUPÉRIEUR en inox, deux demi-colliers à oreilles (support du coupleur)', { pseudo: true, note: `Sur la fiche femelle, Ø int. ${mm(2 * COLLIER.haut.rInt, 1)}, ${mm(COLLIER.large)} de large. Les tiges s'accrochent par-dessus ses oreilles. Fabriqué à la mine (relevé sur la photo).` }],
  ['4', '', 1, 'COLLIER INTERMÉDIAIRE en inox, deux demi-colliers à oreilles', { pseudo: true, note: `Sous la bague d'accouplement, sur le col de la fiche femelle (Ø int. ${mm(2 * COLLIER.milieu.rInt)}). Les pattes sont boulonnées sous ses oreilles.` }],
  ['5', '', 2, 'TIGE À CROCHET en inox, Ø 1/2 po', { pseudo: true, note: `Crochet par-dessus l'oreille du collier supérieur, bout fileté dans le trou de la patte, ${mm(COLLIER.haut.y - TIGE.yBas)} entre les deux.` }],
  ['6', '', 2, 'PATTE PLATE en inox, 1 × 1/4 po, percée, bout arrondi', { pseudo: true, note: `${mm(PATTE.yHaut - PATTE.yBas)} de long, de part et d'autre de la fiche mâle ; trous de Ø ${mm(2 * TROUS.r)} relevés sur la photo (l'attache autobloquante passe dans le trou bas de la patte droite).` }],
  ['7', '', 6, 'BOULON 3/8 po avec rondelle et écrou, inox', { pseudo: true, note: `2 serrent le collier supérieur, 2 le collier intermédiaire (à ${mm(BOULON.xSerrage)} de l'axe), 2 fixent les pattes à ses oreilles. Sur la photo on voit les 2 du collier supérieur.` }],
  ['8', '', 2, 'ÉCROU 1/2 po, inox (bout fileté des tiges)', { pseudo: true, note: 'Derrière la patte.' }],
  ['9', '', 2, 'RUBAN ISOLANT BLANC', { pseudo: true, note: 'Tel que sur la photo : un tour sur la bague d\'accouplement, un autre sur le presse-étoupe et la sortie du câble de la fiche mâle.' }],
  ['10', '', 1, 'ATTACHE AUTOBLOQUANTE en nylon', { pseudo: true, note: 'Autour du presse-étoupe de la fiche mâle, passée dans le trou bas de la patte droite (sur la photo).' }],
  ['11', '', 2, `CÂBLE PORTATIF 3 × ${T.awg} AWG (amorce)`, { pseudo: true, note: `Ø ≈ ${mm(2 * CABLE.r)} (supposé, câble de mine 2 kV) ; en haut vers l'alimentation, en bas vers l'équipement.` }],
];

const NOTE = `Reconstitution 3D d'après la photo fournie par le client et les cotes du catalogue Crouse-Hinds Quik-Loc 600 V : fiche femelle ${T.femelle} et fiche mâle ${T.male} (${T.awg} AWG, ${T.amp} A, Ø ${po(T.A)} × ${po(T.B)} chacune) accouplées, dans un support en inox fabriqué à la mine (colliers à oreilles, tiges à crochet, pattes plates). La taille est déduite de l'échelle de la photo : lire le numéro sur le corps pour la confirmer. Formes relevées sur la photo, contacts supposés ; la coupe par l'axe montre le nez de la fiche mâle dans la bague et les broches dans les douilles. Coupleur accouplé : ${mm(longueur)} du bout d'une fiche au bout de l'autre.`;

const data = {
  id: 'coupleur-quik-loc',
  name: `Coupleur de câble 600 V Quik-Loc ${T.awg} AWG ${T.amp} A, dans son support en inox`,
  manufacturer: 'Crouse-Hinds (Eaton)',
  category: 'Raccordement électrique 600 V (mine souterraine)',
  serial: '',
  document: {
    title: 'Photo du coupleur fournie par le client ; cotes du catalogue Crouse-Hinds Quik-Loc 600 V',
    reference: `${T.femelle} / ${T.male}`,
    preparedBy: '',
    date: '',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Identification', IDENT],
    ['Données publiées', PUB],
    ['Relevé sur la photo', RELEVE],
    ['Supposé', SUPPOSE],
    ['Support', SUPPORT],
    ['Encombrement', `Coupleur accouplé : Ø ${mm(D, 1)} × ${mm(longueur)} (2 fiches de ${mm(L, 1)}, nez de ${mm(NEZ.haut)} engagé) ; support : ${mm(2 * COLLIER.oreille)} de large, ${mm(COLLIER.haut.y + COLLIER.large / 2 - PATTE.yBas)} de haut`],
    ['Non modélisé', 'Filets de la bague d\'accouplement, joints, bornes des conducteurs dans les corps, inscriptions moulées, ce qui retient le support à la paroi (hors photo)'],
    ['À confirmer', `Numéro de catalogue et taille (lire le corps), série (D standard ou G à mise à la terre), fiche femelle en haut ou en bas, nombre de contacts (avec ou sans pilote), cotes du support au ruban`],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo fournie par le client : coupleur 600 V accouplé, suspendu dans son support en inox',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: `QUIK-LOC 600 V CABLE-TO-CABLE CONNECTOR, ${T.awg} AWG, ${T.amp} A, IN STAINLESS HOLDER`,
      titleFr: `Coupleur câble à câble Quik-Loc 600 V, ${T.awg} AWG, ${T.amp} A, dans son support en inox`,
      pn: `${T.femelle} / ${T.male}`,
      sheets: ['P01'],
      note: NOTE,
      parts: pieces,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/coupleur-quik-loc/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(ok ? '✓ nez dans la bague, corps dans le diamètre publié, support dégagé des fiches' : '✕ à revoir');
if (!ok) process.exitCode = 1;
console.log(`fiche Ø ${fr(D, 1)} × ${fr(L, 1)} mm ; coupleur accouplé ${fr(longueur)} mm`);
