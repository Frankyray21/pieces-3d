// Écrit public/equipment/bac-retention-100l/data.json : les cotes viennent du modèle
// (src/models/bac-retention-100l/index.js), pour que la fiche et la 3D disent la même chose.
// Contrôle aussi que le caillebotis entre dans l'ouverture et repose sur l'épaulement.
// Usage : node tools/bac_retention_fiche.mjs
import { writeFileSync } from 'node:fs';
import {
  HORS_TOUT, LEVRE, PAROI, CEINTURE, PASSAGES, OUVERTURE, EPAULEMENT, FOND, CAILLEBOTIS, PUBLIE, AFFICHE,
  dessusCaillebotis, cuve, volumeCaillebotis, volumeRetention, volumeEncombrement,
} from '../src/models/bac-retention-100l/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;

let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
const C = CAILLEBOTIS, c = cuve(), V = volumeRetention();
if (C.L > OUVERTURE.L || C.P > OUVERTURE.P) echec('le caillebotis n\'entre pas dans l\'ouverture');
if (C.L <= c.L || C.P <= c.P) echec('le caillebotis tombe dans la cuve (pas d\'appui sur l\'épaulement)');
if (dessusCaillebotis() > HORS_TOUT.H) echec('le caillebotis dépasse la lèvre');

const SOURCE = 'Page du produit fournie par le client (capture de la fiche du distributeur neatfx) : photo du bac avec son caillebotis et choix des deux versions (P01), description et caractéristiques techniques (P02). Les fiches techniques (PDF) et le dessin coté de la galerie n\'ont pas pu être consultés : l\'intérieur du bac est supposé';
const PUB = `Mini bac de rétention 100 L en PEHD jaune, à poser, pour produits chimiques corrosifs : ${HORS_TOUT.L} × ${HORS_TOUT.P} × ${HORS_TOUT.H} mm hors tout (L × l × h), caillebotis de ${C.L} × ${C.P} mm (« amovible en PP » dans le texte, « caillebotis PEHD » dans le choix de la version), jaune TEIN006 (proche RAL 1028), volume de rétention de ${PUBLIE.retention} L, capacité de charge (UR) de ${PUBLIE.charge} kg, pour des contenants d'une capacité pouvant atteindre 100 L. Réf. PF100006F sans caillebotis, PFCP100006F avec caillebotis`;
const RELEVE = `Relevés sur la photo, par proportion avec la longueur hors tout : lèvre de ${mm(LEVRE.haut)} sur tout le pourtour, paroi en retrait de ${mm(PAROI.retrait)} sous la lèvre, ceinture pleine de ${mm(CEINTURE.y)} de haut jusqu'à la lèvre, passages au pied des parois (${PASSAGES.long.x.length} par côté long, ${PASSAGES.court.z.length} par côté court, ${mm(PASSAGES.long.large)} de large, ${mm(CEINTURE.y)} de haut), grille du caillebotis de ${C.nx} × ${C.nz} alvéoles. Cotes à ±10 % environ (photo en perspective)`;
const INTERIEUR = `Supposés : ouverture de ${OUVERTURE.L} × ${OUVERTURE.P} mm sous la lèvre (5 mm de jeu autour du caillebotis), épaulement à ${mm(EPAULEMENT.y)} du sol qui porte le caillebotis (dessus du caillebotis à ${mm(dessusCaillebotis())}, ${mm(HORS_TOUT.H - dessusCaillebotis())} sous la lèvre), cuve de ${c.L} × ${c.P} mm sous l'épaulement, fond de ${mm(FOND.ep)} ; caillebotis de ${mm(C.haut)} d'épaisseur. Parois dessinées pleines (le bac rotomoulé est en fait creux, à paroi de quelques millimètres)`;
const VOLUME = `Le volume publié (${PUBLIE.retention} L) dépasse le volume de l'encombrement publié lui-même (${fr(HORS_TOUT.L / 10)} × ${fr(HORS_TOUT.P / 10, 1)} × ${fr(HORS_TOUT.H / 10, 1)} cm = ${fr(volumeEncombrement(), 1)} L) : il ne peut pas être le volume de rétention réel. Dans le modèle, la cuve retient ${fr(V.brut)} L jusqu'au haut de la lèvre (${fr(V.net)} L caillebotis en place). Les « 100 L » semblent désigner la capacité des contenants à poser sur le bac. À vérifier sur la fiche technique avant de s'y fier pour une rétention réglementaire`;
const AFF = `Affiche « MAX 100 LITRES » ajoutée à la demande du client : ${AFFICHE.L} × ${AFFICHE.H} mm, texte noir sur fond blanc à cadre rouge, collée au milieu de la ceinture, côté long avant. Elle reprend la capacité publiée (100 L) ; ce n'est pas une pièce du fabricant`;

const pieces = [
  ['1', 'PF100006F', 1, 'BAC DE RÉTENTION 100 L à poser, PEHD jaune, sans caillebotis', { note: `${HORS_TOUT.L} × ${HORS_TOUT.P} × ${HORS_TOUT.H} mm hors tout, jaune TEIN006 (proche RAL 1028) ; lèvre, ceinture et passages au pied relevés sur la photo ; épaulement et cuve supposés. Charge admissible publiée : ${PUBLIE.charge} kg. Retient ${fr(V.brut)} L dans le modèle (100 L publiés : voir « Volume de rétention »). Réf. du bac vendu seul.` }],
  ['2', '', 1, `CAILLEBOTIS amovible, ${C.L} × ${C.P} mm, noir`, { pseudo: true, note: `Cotes publiées ; ${mm(C.haut)} d'épaisseur et grille de ${C.nx} × ${C.nz} alvéoles relevées sur la photo. Posé sur l'épaulement, dessus à ${mm(HORS_TOUT.H - dessusCaillebotis())} sous la lèvre : les contenants restent au-dessus d'un éventuel déversement. En PP (texte) ou PEHD (choix de la version). Vendu avec le bac sous la réf. PFCP100006F (bac avec caillebotis) ; pas de réf. seule publiée.` }],
  ['3', '', 1, 'AFFICHE « MAX 100 LITRES »', { pseudo: true, note: `${AFFICHE.L} × ${AFFICHE.H} mm, collée au milieu de la ceinture, côté long avant. Ajoutée à la demande du client : ne figure pas sur la fiche du produit.` }],
];

const NOTE = `Reconstitution 3D d'après la page du produit fournie par le client (photo, P01, et caractéristiques, P02), sans plan : les cotes hors tout et celles du caillebotis sont publiées, la lèvre, la ceinture, les passages au pied et la grille sont relevés sur la photo, l'intérieur (épaulement et cuve) est supposé. La coupe par le milieu montre le caillebotis posé sur l'épaulement. L'affiche « MAX 100 LITRES » est ajoutée à la demande du client. Attention : le volume publié de 100 L dépasse l'encombrement du bac (${fr(volumeEncombrement(), 1)} L) ; le modèle retient ${fr(V.brut)} L. Pour faire mieux : la fiche technique du bac (PDF du distributeur) ou le bac mesuré au ruban.`;

const data = {
  id: 'bac-retention-100l',
  name: 'Mini bac de rétention 100 L en PEHD jaune, avec caillebotis',
  manufacturer: 'neatfx (distributeur)',
  category: 'Rétention des produits chimiques',
  serial: '',
  document: {
    title: 'Page du produit fournie par le client (capture de la fiche du distributeur neatfx), aucun plan',
    reference: 'PFCP100006F',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUB],
    ['Relevé sur la photo', RELEVE],
    ['Intérieur (supposé)', INTERIEUR],
    ['Volume de rétention', VOLUME],
    ['Encombrement', `${HORS_TOUT.L} × ${HORS_TOUT.P} × ${HORS_TOUT.H} mm (publié) ; caillebotis ${C.L} × ${C.P} × ${C.haut} mm, ${fr(volumeCaillebotis(), 1)} L de matière`],
    ['Affiche', AFF],
    ['Non modélisé', 'Paroi creuse du bac rotomoulé, renforts sous le caillebotis, marquages moulés, contenants (bidons de la galerie)'],
    ['À confirmer', 'Volume de rétention réel, forme intérieure (épaulement ou plots sous le caillebotis), épaisseur et grille du caillebotis, nombre et taille des passages au pied'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Page du produit fournie par le client : photo du bac avec caillebotis et choix des deux versions (PF100006F, PFCP100006F)',
    P02: 'Page du produit : description et caractéristiques techniques publiées',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'MINI SPILL PALLET 100 L, HDPE, WITH GRATING',
      titleFr: 'Mini bac de rétention 100 L à poser, PEHD jaune, avec caillebotis',
      pn: 'PFCP100006F',
      sheets: ['P01', 'P02'],
      note: NOTE,
      parts: pieces,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/bac-retention-100l/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(ok ? '✓ caillebotis dans l\'ouverture, posé sur l\'épaulement, sous la lèvre' : '✕ à revoir');
if (!ok) process.exitCode = 1;
console.log(`rétention ${fr(V.brut, 1)} L (net ${fr(V.net, 1)} L) ; encombrement ${fr(volumeEncombrement(), 1)} L ; caillebotis ${fr(volumeCaillebotis(), 2)} L ; cuve ${c.L} × ${c.P}`);
