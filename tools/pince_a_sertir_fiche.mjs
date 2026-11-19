// Écrit public/equipment/pince-a-sertir/data.json : les cotes viennent du modèle
// (src/models/pince-a-sertir/index.js), pour que la fiche et la 3D disent la même chose.
// Vérifie au passage que le mécanisme reste monté sur toute sa course.
// Avec --page <fichier.html>, écrit aussi la page du relevé (pages/P02.webp en est une capture de 2 200 × 1 700 px).
// Usage : node tools/pince_a_sertir_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import {
  L, EMPREINTES, TETE, EP, PIVOT, ECLISSE, ARTIC, CENTRE, BOULON, BRAS, MANCHON, BIELLE, PHI_MAX,
  etat, ecartement, jour, pointMachoire, STEPS,
} from '../src/models/pince-a-sertir/index.js';

const RAD = Math.PI / 180;
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;

// Contrôle du mécanisme, de fermé à ouvert : bielles de longueur constante,
// boulon central sur l'axe, queues et oreilles sans se croiser.
let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
for (let i = 0; i <= 40; i++) {
  const phi = (PHI_MAX * i) / 40, e = etat(phi);
  const bielle = Math.hypot(e.J[0] - e.C[0], e.J[1] - e.C[1]);
  if (Math.abs(bielle - BIELLE) > 1e-6) echec(`bielle de ${fr(bielle, 3)} mm à ${fr(phi / RAD, 1)}°`);
  if (Math.abs(Math.hypot(e.J[0] - PIVOT.x, e.J[1] + PIVOT.s) - Math.hypot(ARTIC.x - PIVOT.x, ARTIC.s - PIVOT.s)) > 1e-6) echec(`queue de mâchoire déformée à ${fr(phi / RAD, 1)}°`);
  if (e.J[0] < ARTIC.r + 0.99) echec(`oreilles des poignées qui se croisent à ${fr(phi / RAD, 1)}°`);
  if (i > 0 && e.psi <= etat((PHI_MAX * (i - 1)) / 40).psi) echec(`poignée qui ne s'ouvre plus à ${fr(phi / RAD, 1)}°`);
}
const ouvert = etat(PHI_MAX);
const bout = 2 * pointMachoire(0, 0, PHI_MAX)[0];
const serrage = { pivot: EP.machoire + 2 * (EP.eclisse + 0.2), tete: EP.tete };
const longBoulon = (s) => Math.round(s + BOULON.ecrou + 3);
const empreintes = EMPREINTES.map((e, i) => `n° ${i + 1} : câble de ${e.cable} po (${e.mm} mm)`).join(' ; ');
const diametres = EMPREINTES.map((e) => fr(e.d)).join(', ').replace(/, ([^,]*)$/, ' et $1');
const jours = EMPREINTES.map((e) => `${fr(jour(e, PHI_MAX))} mm (${e.cable} po)`).join(', ');

const SOURCE = 'Capture d\'écran reçue d\'une recherche d\'images (639 × 1 147 pixels) : fiche VEVOR Canada « Pince à sertir de câble » et vignettes de détaillants ; la pince y mesure environ 180 pixels de long. Quatre vignettes montrent la pince à trois empreintes et ont servi ; les autres montrent d\'autres modèles (quatre ou cinq empreintes, coupe-câble). Aucun plan.';
const AFAIRE = 'Pour faire mieux : la pince elle-même sur une table avec une règle, de face et de côté, ou la fiche du fabricant — les épaisseurs, la visserie et le diamètre des empreintes seraient alors des mesures et non des hypothèses.';

const pieces = [
  ['1', '', 2, 'MÂCHOIRE forgée, noire, à trois demi-empreintes', { pseudo: true, note: `Une droite et une gauche, symétriques. Acier allié forgé et trempé selon la fiche du produit. Contour relevé sur la vue de face : tête de ${mm(TETE.large)} de large, bout à méplat de ${mm(TETE.bout)}, queue de ${mm(ARTIC.s - PIVOT.s)} entre le pivot et l'articulation de la poignée. Épaisseur de ${mm(EP.machoire)} supposée. Empreintes pour câble de ${EMPREINTES.map((e) => e.cable).join(', ')} po, de la plus petite (au bout) à la plus grande (près du pivot) ; leurs diamètres (${diametres} mm) ne sont pas publiés : estimés sur les photos.` }],
  ['2', '', 2, `ÉCLISSE de ${mm(ECLISSE.long)} × ${mm(ECLISSE.large)}, une devant et une derrière`, { pseudo: true, note: `Les deux éclisses portent les boulons de pivot des mâchoires, à ${mm(2 * PIVOT.x)} l'un de l'autre. La marque VEVOR est inscrite sur l'éclisse avant (lisible sur le gros plan) : elle n'est pas reproduite. Épaisseur de ${mm(EP.eclisse)} supposée ; l'éclisse arrière, cachée, est supposée identique.` }],
  ['3', '', 2, `BOULON de pivot de mâchoire, tête hexagonale (M${BOULON.d} × ${longBoulon(serrage.pivot)} supposé)`, { pseudo: true, note: 'Chaque mâchoire tourne sur son boulon. Les photos montrent une tête sombre de chaque côté de l\'inscription ; grandeur, longueur et forme exacte de la tête sont supposées.' }],
  ['4', '', 2, 'POIGNÉE rouge : tête forgée et bras en acier tubulaire', { pseudo: true, note: `Une droite et une gauche. La tête, épaisse de ${mm(EP.tete)} (supposé), chevauche la queue de la mâchoire par deux oreilles de Ø ${mm(2 * ARTIC.r)} ; les deux têtes se rejoignent sur le boulon central par une patte à mi-épaisseur (à l'arrière pour la poignée droite, à l'avant pour la gauche : agencement supposé). Entre les deux têtes, un jour en trou de serrure, puis la butée où elles se touchent, pince fermée. Bras de Ø ${mm(2 * BRAS.r0)} à la sortie de la tête puis ${mm(2 * BRAS.r1)}, légèrement cintré vers l'extérieur : écartement des bras relevé sur la vue de face. Le bras est modélisé plein : l'épaisseur de la paroi du tube n'est pas publiée.` }],
  ['5', '', 2, `BOULON d'articulation mâchoire-poignée (M${BOULON.d} × ${longBoulon(serrage.tete)} supposé)`, { pseudo: true, note: `À ${mm(BIELLE, 1)} du boulon central : c'est la petite bielle de la genouillère. Grandeur supposée.` }],
  ['6', '', 1, `BOULON central des poignées (M${BOULON.d} × ${longBoulon(serrage.tete)} supposé)`, { pseudo: true, note: 'Les deux poignées tournent l\'une sur l\'autre autour de ce boulon, qui se déplace le long de l\'axe de la pince quand on ouvre. Une vignette de détaillant signale un « boulon réglable » à la tête des poignées, sans dire lequel des trois ni comment : le réglage n\'est pas modélisé.' }],
  ['7', '', 5, `ÉCROU hexagonal M${BOULON.d} (supposé), derrière`, { pseudo: true, note: 'Aucune photo ne montre le dos de la pince : écrous supposés, un par boulon.' }],
  ['8', '', 2, `MANCHON DE POIGNÉE en caoutchouc noir, ${mm(MANCHON.s1 - MANCHON.s0)} de long`, { pseudo: true, note: 'Garde au départ, quatre bossages pour les doigts du côté intérieur, bout évasé. Le trou d\'accrochage visible au bout des manchons sur une vignette n\'est pas modélisé.' }],
];

const data = {
  id: 'pince-a-sertir',
  name: 'Pince à sertir de 30 po pour manchons de câble (wire line)',
  manufacturer: 'VEVOR',
  category: 'Outils à main',
  serial: '',
  document: {
    title: 'Capture d\'écran d\'une recherche d\'images : fiche VEVOR Canada et vignettes de détaillants (aucun plan)',
    reference: 'Pince à sertir 30 po',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Usage', 'Sertir les manchons ovales et les manchons d\'arrêt en aluminium ou en cuivre sur un câble d\'acier — par exemple la boucle du câble du wire line. Selon les fiches des détaillants ; rien n\'y est dit des manchons d\'acier inoxydable.'],
    ['Données publiées', 'Longueur de 30 po (762 mm) ; trois empreintes, pour câble de 5/32, 1/4 et 5/16 po (4, 6 et 8 mm) ; acier allié, mâchoires forgées et trempées, poignées en acier tubulaire, manchons de poignée en caoutchouc ; poids brut (emballé) de 10 lb selon un détaillant'],
    ['Empreintes', `${empreintes}. Diamètres non publiés : ${diametres} mm sur le modèle, estimés sur les photos.`],
    ['Lu sur la vignette des dimensions (texte flou)', 'Longueur « 30 po / 760 mm » et tableau « 3-Cavity » des trois grandeurs : lisibles. Largeur de la tête, ouverture maximale des poignées et poids net : chiffres illisibles, non repris.'],
    ['Échelle du relevé', `Vue de face : la pince mesure 176 pixels pour ${mm(L)}, soit 4,3 mm par pixel ; chaque cote relevée est juste à un pixel près, environ 5 mm`],
    ['Tête', `${mm(TETE.large)} de large (22 pixels), ${mm(TETE.long)} du bout des mâchoires au bout de leurs queues ; pivots des mâchoires à ${mm(PIVOT.s)} du bout, à ${mm(2 * PIVOT.x)} l'un de l'autre`],
    ['Poignées', `Boulons d'articulation à ${mm(ARTIC.s)} du bout, à ${mm(2 * ARTIC.x)} l'un de l'autre ; boulon central à ${mm(CENTRE.s)} ; bras de Ø ${mm(2 * BRAS.r1)} ; manchons de Ø ${mm(2 * MANCHON.r)} et ${mm(MANCHON.s1 - MANCHON.s0)} de long ; ${mm(ecartement(0))} hors tout aux manchons, pince fermée`],
    ['Épaisseurs (supposées)', `Mâchoires ${mm(EP.machoire)}, éclisses ${mm(EP.eclisse)}, têtes des poignées ${mm(EP.tete)} : aucune vue de côté ne permet de les mesurer`],
    ['Mécanisme', `Celui d'un coupe-boulons : mâchoires sur deux pivots, poignées articulées sur les queues des mâchoires et entre elles ; fermée, la pince a ses trois boulons de poignée presque alignés (genouillère)`],
    ['Ouverture du modèle', `Jusqu'à ce que les oreilles des deux poignées se rejoignent sur l'axe : mâchoires ouvertes de ${fr(PHI_MAX / RAD)}° chacune, poignées de ${fr(ouvert.psi / RAD)}° chacune, soit ${mm(ecartement(PHI_MAX))} d'un bout à l'autre ; jour aux empreintes : ${jours} ; ${mm(bout)} entre les bouts des mâchoires. Valeurs du modèle, pas du fabricant.`],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Vignettes de la capture d\'écran reçue : vue d\'ensemble, gros plan de la tête, vue de face et dimensions',
    P02: 'Relevé sur la vue de face : cotes retenues pour le modèle et hypothèses',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'HAND SWAGER, 30 IN, 3 CAVITIES',
      titleFr: 'Pince à sertir de 30 po, à 3 empreintes',
      pn: '',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après les vignettes d'une recherche d'images, sans plan ni cote. Données publiées, reprises telles quelles : la longueur de 30 po et les trois empreintes pour câble de 5/32, 1/4 et 5/16 po. Tout le reste est relevé en proportion sur la vue de face, à environ 5 mm près, ou supposé. Visible sur les photos : les deux mâchoires noires et leurs trois empreintes, l'éclisse avant et ses deux boulons, le jour entre les queues des mâchoires, les têtes rouges des poignées et leurs trois boulons alignés, le jour en trou de serrure, les bras tubulaires cintrés, les manchons noirs à bossages. Supposé, parce que caché : toutes les épaisseurs, le dos de la pince (éclisse arrière, écrous), la façon dont les têtes des poignées s'emboîtent sur le boulon central, la grandeur de la visserie. Non modélisé, parce qu'illisible : le détail entre les deux mâchoires derrière l'éclisse, le réglage signalé par une vignette (« boulon réglable »), l'inscription de l'éclisse, le trou d'accrochage des manchons. Les boucles de câble serties qui accompagnent la pince sur la photo du produit ne font pas partie de l'outil. La page « Fonctionnement » montre la pince qui s'ouvre et se referme. ${AFAIRE}`,
      parts: [...pieces, ['9', '', null, 'Fonctionnement : la pince s\'ouvre et se referme (scène animée)', { link: 'P02', no3d: true, pseudo: true }]],
    },
    P02: {
      title: 'HOW IT WORKS',
      titleFr: 'Fonctionnement : ouvrir, refermer',
      pn: '',
      sheets: ['P02', 'P01'],
      note: `La même pince, animée en trois temps. ${STEPS.map((s) => s.text).join(' ')} La cinématique est celle des cotes relevées sur les photos : l'ouverture maximale du fabricant n'a pas pu être lue. Mode d'emploi (nombre de sertissages par manchon, ordre, contrôle au calibre) : à prendre dans la notice du fabricant des manchons, il ne figure pas sur les vignettes reçues.`,
      parts: pieces,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/pince-a-sertir/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`pince de ${mm(L)} ; ouverture : mâchoires ${fr(PHI_MAX / RAD, 1)}°, poignées ${fr(ouvert.psi / RAD, 1)}°, ${mm(ecartement(PHI_MAX))} d'un bout à l'autre ; jours ${jours}`);
console.log(ok ? '✓ mécanisme monté sur toute la course (41 positions)' : '✕ mécanisme à revoir');

// Relevé sur la vue de face (pixels de la capture), échelle 762 mm / 176 px.
const PX = L / 176;
const RELEVE = [
  ['Longueur hors tout', '176', `${mm(L)} : c'est l'échelle`, `${mm(L)} (30 po, donnée publiée)`],
  ['Largeur de la tête noire', '21 à 22', `${mm(21 * PX)} à ${mm(22 * PX)}`, mm(TETE.large)],
  ['Du bout des mâchoires à l\'inscription de l\'éclisse', '15', mm(15 * PX), `${mm(PIVOT.s)} (pivots des mâchoires)`],
  ['Entre les deux boulons de l\'éclisse', '12 à 13', `${mm(12 * PX)} à ${mm(13 * PX)}`, `${mm(2 * PIVOT.x)} (gros plan : environ 48 mm)`],
  ['Du bout des mâchoires aux boulons des poignées', '36 à 37', `${mm(36 * PX)} à ${mm(37 * PX)}`, `${mm(ARTIC.s)} (articulations) et ${mm(CENTRE.s)} (boulon central)`],
  ['Du boulon central à un boulon d\'articulation (gros plan)', '22', 'environ 30 mm à 1,4 mm par pixel', mm(BIELLE, 1)],
  ['Jour entre les queues des mâchoires', '3 à 8', `${mm(3 * PX)} à ${mm(8 * PX)}`, '8 mm derrière l\'éclisse, 35 mm aux poignées'],
  ['Largeur aux têtes rouges des poignées', '19 à 20', `${mm(19 * PX)} à ${mm(20 * PX)}`, '86 mm'],
  ['Demi-écartement des bras, de la tête aux manchons', '7 à 12,5', `${mm(7 * PX)} à ${mm(12.5 * PX)}`, '30 à 54 mm'],
  ['Longueur des manchons', '31', mm(31 * PX), mm(MANCHON.s1 - MANCHON.s0)],
  ['Largeur des manchons', '6 à 8', `${mm(6 * PX)} à ${mm(8 * PX)}`, `Ø ${mm(2 * MANCHON.r)}, ${mm(2 * MANCHON.r + MANCHON.bosse, 1)} aux bossages`],
];
const at = process.argv.indexOf('--page');
if (at >= 0) {
  const rangs = RELEVE.map(([nom, px, soit, retenu]) => `<tr><td class="g">${nom}</td><td>${px} px</td><td>${soit}</td><td class="g">${retenu}</td></tr>`).join('\n');
  writeFileSync(process.argv[at + 1], `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
html, body { margin: 0; background: #fff; }
body { width: 2200px; height: 1700px; box-sizing: border-box; padding: 56px 84px; font: 23px/1.33 "DejaVu Sans", Verdana, sans-serif; color: #1a1b1e; }
h1 { font-size: 44px; margin: 0 0 10px; }
.sous { color: #4a4d52; margin: 0 0 20px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
th, td { border: 2px solid #1a1b1e; padding: 8px 14px; text-align: center; }
th { background: #e9eaee; font-size: 21px; }
td.g { text-align: left; }
p { color: #4a4d52; margin: 0 0 12px; }
p b { color: #33363a; }
</style></head><body>
<h1>Pince à sertir de 30 po — relevé sur la vue de face</h1>
<p class="sous">Vignettes d'une recherche d'images (page P01), sans plan ni cote. Échelle : la pince mesure 176 pixels pour les 30 po publiés, soit ${fr(PX, 1)} mm par pixel. Chaque lecture est juste à un pixel près, environ 5 mm.</p>
<table>
<tr><th>Cote</th><th>Lue sur la vignette</th><th>Soit</th><th>Retenu pour le modèle</th></tr>
${rangs}
</table>
<p><b>Données publiées, reprises telles quelles.</b> Longueur de 30 po ; trois empreintes pour câble de 5/32, 1/4 et 5/16 po (4, 6 et 8 mm) ; acier allié, mâchoires forgées et trempées, poignées en acier tubulaire, manchons en caoutchouc.</p>
<p><b>Lu sur les vignettes.</b> Mâchoires noires à trois empreintes, de la plus petite au bout à la plus grande près du pivot ; éclisse avant à deux boulons ; jour entre les queues des mâchoires ; têtes rouges des poignées à trois boulons alignés ; jour en trou de serrure ; bras cintrés ; manchons à bossages du côté intérieur.</p>
<p><b>Supposé, parce que caché.</b> Les épaisseurs (mâchoires ${mm(EP.machoire)}, éclisses ${mm(EP.eclisse)}, têtes des poignées ${mm(EP.tete)}) ; le dos de la pince (éclisse arrière, écrous) ; l'emboîtement des deux têtes sur le boulon central ; la visserie (M${BOULON.d}) ; le diamètre des empreintes (${diametres} mm).</p>
<p><b>Illisible, non repris.</b> Sur la vignette des dimensions : la largeur de la tête, l'ouverture maximale des poignées et le poids net. Non modélisés : le détail entre les mâchoires derrière l'éclisse, le « boulon réglable » signalé par une vignette, l'inscription de l'éclisse, le trou d'accrochage des manchons.</p>
<p><b>Ouverture du modèle.</b> Mâchoires de ${fr(PHI_MAX / RAD)}° chacune, poignées de ${fr(ouvert.psi / RAD)}° chacune (${mm(ecartement(PHI_MAX))} d'un bout à l'autre), jusqu'à ce que les oreilles des poignées se rejoignent sur l'axe ; jour aux empreintes : ${jours}. Valeurs du modèle, pas du fabricant.</p>
<p><b>Pour faire mieux.</b> La pince sur une table avec une règle, de face et de côté, ou la fiche du fabricant : les hypothèses deviendraient des mesures.</p>
</body></html>
`);
}
process.exit(ok ? 0 : 1);
