// Écrit public/equipment/pince-monseigneur/data.json : les cotes viennent du modèle
// (src/models/pince-monseigneur/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page du relevé (pages/P02.webp en est une capture de 2 200 × 1 700 px ;
// le fichier HTML doit être écrit à côté d'une copie de pages/P01.webp).
// Usage : node tools/pince_monseigneur_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { L, CARRE, POIGNEE, FUT, PIED, BISEAU, EPAULE, ETIQUETTE, masse, angleBiseau } from '../src/models/pince-monseigneur/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / 25.4) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const m = masse();
const angle = angleBiseau();

// Relevé sur la photo (pixels) : la barre mesure 546 pixels pour 60 po.
const PX = L / 546;
const VUE = 34; // le pied carré est vu tourné d'environ 34° : deux faces de 6 et 9 pixels
const rad = (VUE * Math.PI) / 180;
const carreVu = CARRE * (Math.cos(rad) + Math.sin(rad));
const octoVu = (FUT.plats / Math.cos(Math.PI / 8)) * Math.sin(((90 - VUE + 22.5) * Math.PI) / 180);
const coteCarre = Math.hypot(6 * PX, 9 * PX);
const RELEVE = [
  ['Longueur totale', '546', `${po(L)} (${mm(L)})`, `${po(L)} : donnée publiée, c'est l'échelle`],
  ['Poignée ronde, longueur', '207', mm(207 * PX), `${po(POIGNEE.long)} (${mm(POIGNEE.long)})`],
  ['Poignée ronde, diamètre', '8,0', mm(8 * PX, 1), `${po(POIGNEE.d)} (${mm(POIGNEE.d, 1)})`],
  ['Fût à pans, longueur', '212', mm(212 * PX), `${po(FUT.long)} (${mm(FUT.long)})`],
  ['Fût à pans, largeur vue', '10,4 à 11,7', `${fr(10.4 * PX)} à ${mm(11.7 * PX)}`, `Octogone de ${po(FUT.plats)} sur plats : ${mm(octoVu, 1)} vu sous cet angle`],
  ['Pied carré, longueur avec le biseau', '127', mm(127 * PX), `${po(PIED.long)} (${mm(PIED.long)})`],
  ['Pied carré, largeur vue en coin', '14,0 à 14,8', `${fr(14 * PX)} à ${mm(14.8 * PX)}`, `Carré de ${po(CARRE)} : ${mm(carreVu, 1)} vu tourné de ${VUE}°`],
  ['Pied carré, les deux faces vues', '6 et 9', `${fr(6 * PX)} et ${mm(9 * PX)}, soit un côté de ${mm(coteCarre)}`, `${po(CARRE)} (${mm(CARRE, 1)}) : lame publiée par Garant`],
  ['Biseau et acier nu, longueur', '25 à 26', `${fr(25 * PX)} à ${mm(26 * PX)}`, `${po(BISEAU.long)} (${mm(BISEAU.long)}), angle de ${fr(angle)}°`],
  ['Bas de l\'étiquette, au-dessus du tranchant', '42', mm(42 * PX), `${po(ETIQUETTE.bas)} (${mm(ETIQUETTE.bas)})`],
  ['Haut de l\'étiquette, au-dessus du tranchant', '91', mm(91 * PX), `${po(ETIQUETTE.haut)} (${mm(ETIQUETTE.haut)})`],
];

const ECART = `Masse calculée sur le modèle : ${fr(m.kg, 1)} kg (${fr(m.lb, 1)} lb) à 7 850 kg/m³, contre 18 lb (8,2 kg) publiées. L'écart de ${fr(100 * (1 - m.lb / 18))} % correspond à des sections plus larges d'environ 2 mm, moins d'un pixel de la photo`;
const SOURCES = 'Les sources ne s\'accordent pas sur la largeur : Garant publie une lame de 1 1/8 po ; des détaillants indiquent une pointe de 1 1/4 po (Staples, Vallen) ou une barre de 1 1/2 po de large (Vallen, Tenaquip, Cobalt Industrial). La photo donne un pied carré de 29 à 30 mm de côté : la valeur de Garant est retenue';

const data = {
  id: 'pince-monseigneur',
  name: 'Pince-monseigneur Garant CB60PC, 60 po, pointe en biseau',
  manufacturer: 'Garant',
  category: 'Barre-levier forgée',
  serial: '',
  document: {
    title: 'Photo du produit Garant CB60PC (fiche du détaillant BMR, aucun plan) et relevé des cotes',
    reference: 'CB60PC',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', 'Une photo du produit (page P01), barre debout, pointe en bas ; aucun plan. Longueur et lame publiées par Garant, le reste relevé sur la photo'],
    ['Données publiées par Garant', 'Modèle CB60PC, UGS 81036, CUP 055636810363, série Pro : 60 po (152,4 cm), 18 lb, acier forgé et trempé, tête en biseau, lame de 1 1/8 po'],
    ['Échelle de la photo', `${po(L)} sur 546 pixels, soit ${fr(PX, 2)} mm par pixel ; largeurs lues à un demi-pixel près (1,4 mm), longueurs à un pixel près (2,8 mm), puis arrondies au 1/8 po`],
    ['Longueur', `${po(L)} (${mm(L)}) — donnée publiée`],
    ['Poignée', `Ronde, Ø ${po(POIGNEE.d)} (${mm(POIGNEE.d, 1)}) sur ${po(POIGNEE.long)} (${mm(POIGNEE.long)}) ; bout coupé droit`],
    ['Fût', `Octogonal, ${po(FUT.plats)} (${mm(FUT.plats, 1)}) sur plats, sur ${po(FUT.long)} (${mm(FUT.long)}) ; forme des pans supposée (la photo montre deux tons séparés par une arête)`],
    ['Pied', `Carré de ${po(CARRE)} (${mm(CARRE, 1)}) sur ${po(PIED.long)} (${mm(PIED.long)}), biseau compris`],
    ['Pointe', `Biseau d'un seul côté, long de ${po(BISEAU.long)} (${mm(BISEAU.long)}), à environ ${fr(angle)}° de l'axe ; la face opposée reste plate jusqu'au tranchant, large de ${po(CARRE)} ; acier nu, non peint`],
    ['Épaulements', `Poignée ronde vers fût octogonal sur environ ${mm(EPAULE.fut)} ; pans coupés du fût effacés sur environ ${mm(EPAULE.pied)} à l'entrée du pied carré`],
    ['Fini', 'Peinture rouge orangé brillante sur toute la barre, sauf le biseau'],
    ['Étiquette', `Enroulée sur le pied carré, de ${po(ETIQUETTE.bas)} à ${po(ETIQUETTE.haut)} au-dessus du tranchant (${mm(ETIQUETTE.haut - ETIQUETTE.bas)} de haut) : partie sombre et bande blanche en bas ; texte illisible sur la photo, dessin générique`],
    ['Masse', ECART],
    ['Largeur : écart entre les sources', SOURCES],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du produit, agrandie 3 fois (barre debout, pointe en bas)',
    P02: 'Relevé des cotes sur la photo et hypothèses',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'PINCH POINT CROWBAR, 60 IN',
      titleFr: 'Pince-monseigneur de 60 po, pointe en biseau',
      pn: 'CB60PC',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après une photo du produit, sans plan. La barre est forgée d'une seule pièce : les repères 1 à 4 désignent ses zones, qui ne se séparent pas ; seule l'étiquette (repère 5) se décolle en vue éclatée. Deux données de Garant sont reprises telles quelles : la longueur de ${po(L)} et la lame de ${po(CARRE)}, prise pour le côté du pied carré. Le reste est relevé sur la photo (${fr(PX, 2)} mm par pixel) et arrondi au 1/8 po : poignée ronde de Ø ${po(POIGNEE.d)} sur ${po(POIGNEE.long)}, fût à pans sur ${po(FUT.long)}, pied carré sur ${po(PIED.long)}, biseau nu de ${po(BISEAU.long)}. Visible sur la photo : les deux épaulements, deux faces du pied carré, la face plate qui file jusqu'au tranchant, le bout non peint, l'étiquette sombre à bande blanche. Supposé : la forme octogonale du fût (la photo montre deux tons séparés par une arête, sans permettre de compter les pans), le tranchant émoussé de ${mm(BISEAU.tranchant)}, les deux faces cachées et le tour complet de l'étiquette. ${ECART}. ${SOURCES}. La barre est couchée sur le sol, pointe à gauche, face plate vers le haut.`,
      parts: [
        ['1', '', 1, `POIGNÉE ronde, Ø ${po(POIGNEE.d)} × ${po(POIGNEE.long)}`, { pseudo: true, note: `Zone de la barre, pas une pièce séparée. Diamètre relevé : ${mm(8 * PX, 1)} (8,0 pixels), constant à un demi-pixel près sur toute la longueur. Bout coupé droit, arête cassée de ${mm(POIGNEE.chanfrein, 1)} (supposée).` }],
        ['2', '', 1, `FÛT octogonal, ${po(FUT.plats)} sur plats × ${po(FUT.long)}`, { pseudo: true, note: `Zone de la barre, pas une pièce séparée. Largeur vue de ${fr(10.4 * PX)} à ${mm(11.7 * PX)} sur la photo ; un octogone de ${po(FUT.plats)} sur plats en montre ${mm(octoVu, 1)} sous le même angle. Le nombre de pans est supposé. Épaulement d'environ ${mm(EPAULE.fut)} vers la poignée.` }],
        ['3', '', 1, `PIED carré de ${po(CARRE)}, peint, × ${po(PIED.long - BISEAU.long)}`, { pseudo: true, note: `Zone de la barre, pas une pièce séparée. Côté : la lame de ${po(CARRE)} publiée par Garant ; la photo donne ${mm(coteCarre)} (deux faces de 6 et 9 pixels). Longueur de ${po(PIED.long)} avec le biseau. Les pans coupés du fût s'effacent sur environ ${mm(EPAULE.pied)} à l'entrée du pied.` }],
        ['4', '', 1, `POINTE EN BISEAU, acier nu, ${po(BISEAU.long)} de long`, { pseudo: true, note: `Zone de la barre, pas une pièce séparée. Biseau d'un seul côté, à environ ${fr(angle)}° de l'axe ; la face opposée reste plate jusqu'au tranchant. Tranchant de ${po(CARRE)} de large, émoussé sur ${mm(BISEAU.tranchant)} (supposé). Non peinte sur la photo.` }],
        ['5', '', 1, `ÉTIQUETTE enroulée sur le pied carré, ${mm(ETIQUETTE.haut - ETIQUETTE.bas)} de haut`, { pseudo: true, note: `De ${po(ETIQUETTE.bas)} à ${po(ETIQUETTE.haut)} au-dessus du tranchant. Sur la photo : une pastille jaune et un rond sur la face plate, un cartouche blanc sur la face voisine, une bande blanche en bas. Texte et logo illisibles : le dessin du modèle est générique. Le tour complet des quatre faces est supposé.` }],
      ],
    },
  },
  documents: [],
};
writeFileSync(new URL('../public/equipment/pince-monseigneur/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`pince-monseigneur ${mm(L)} ; poignée Ø ${mm(POIGNEE.d, 1)} × ${mm(POIGNEE.long)} ; fût ${mm(FUT.long)} ; pied ${mm(PIED.long)} ; biseau ${mm(BISEAU.long)} à ${fr(angle, 1)}° ; masse ${fr(m.kg, 2)} kg (${fr(m.lb, 1)} lb)`);

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const rangs = RELEVE.map(([nom, px, soit, retenu]) => `<tr><td class="g">${nom}</td><td>${px} px</td><td>${soit}</td><td class="g">${retenu}</td></tr>`).join('\n');
  // Photo P01 (780 × 1 770 px, soit 3 fois la capture) affichée à 1 500 px de haut : 2,5424 px d'écran par pixel d'origine.
  // Dans la capture d'origine, la barre va de y = 76 à 622 ; la page P01 commence à y = 55.
  const K = 1500 / 590, y = (v) => (v - 55) * K;
  const traits = [[76, 'bout de la poignée'], [283, 'épaulement : poignée → fût'], [495, 'épaulement : fût → pied carré'], [531, 'haut de l\'étiquette'], [580, 'bas de l\'étiquette'], [596, 'départ du biseau (acier nu)'], [622, 'tranchant']];
  const marques = traits.map(([v, nom]) => `<div class="t" style="top:${y(v).toFixed(1)}px"><i></i><span>${nom}</span></div>`).join('\n');
  writeFileSync(process.argv[at + 1], `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
html, body { margin: 0; background: #fff; }
body { width: 2200px; height: 1700px; box-sizing: border-box; padding: 60px 70px; font: 22px/1.35 "DejaVu Sans", Verdana, sans-serif; color: #1a1b1e; display: flex; gap: 50px; }
.photo { position: relative; flex: 0 0 770px; height: 1500px; border: 2px solid #c9cbd0; overflow: hidden; }
.photo img { position: absolute; left: 0; top: 0; height: 1500px; }
.t { position: absolute; left: 0; right: 0; height: 0; }
.t i { position: absolute; left: 368px; width: 62px; border-top: 2px solid #1b6fb5; }
.t span { position: absolute; left: 440px; top: -15px; font-size: 18px; color: #1b6fb5; white-space: nowrap; background: #fffc; padding: 0 4px; }
.texte { flex: 1; min-width: 0; }
h1 { font-size: 42px; margin: 0 0 10px; }
.sous { color: #4a4d52; margin: 0 0 22px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 22px; font-size: 20px; }
th, td { border: 2px solid #1a1b1e; padding: 8px 12px; text-align: center; }
th { background: #e9eaee; font-size: 19px; }
td.g { text-align: left; }
p { color: #4a4d52; margin: 0 0 13px; }
p b { color: #33363a; }
</style></head><body>
<div class="photo"><img src="P01.webp" alt="">
${marques}
</div>
<div class="texte">
<h1>Pince-monseigneur Garant CB60PC — relevé sur la photo</h1>
<p class="sous">Une photo du produit (page P01), barre debout, pointe en bas. Échelle : la barre mesure 546 pixels pour ${po(L)}, soit ${fr(PX, 2)} mm par pixel. Largeurs lues à un demi-pixel près (1,4 mm), longueurs à un pixel près (2,8 mm).</p>
<table>
<tr><th>Cote</th><th>Lue sur la photo</th><th>Soit</th><th>Retenu pour le modèle</th></tr>
${rangs}
</table>
<p><b>Données publiées par Garant.</b> Modèle CB60PC, UGS 81036, série Pro : 60 po, 18 lb, acier forgé et trempé, tête en biseau, lame de 1 1/8 po.</p>
<p><b>Ce que la photo montre.</b> Trois tronçons séparés par deux épaulements : une poignée ronde, un fût à pans, un pied carré vu en coin (deux faces). La face de gauche file droit jusqu'au tranchant ; le biseau entame la face opposée. Le bout n'est pas peint. Une étiquette sombre à bande blanche fait le tour du pied.</p>
<p><b>Supposé.</b> La forme octogonale du fût (deux tons séparés par une arête, sans qu'on puisse compter les pans) ; le tranchant émoussé de ${mm(BISEAU.tranchant)} ; les deux faces cachées ; le texte de l'étiquette, illisible.</p>
<p><b>Masse.</b> ${ECART}.</p>
<p><b>Largeur.</b> ${SOURCES}.</p>
<p><b>Pour faire mieux.</b> La mesure au ruban du côté du pied carré, du fût et du diamètre de la poignée remplacerait le relevé et lèverait l'écart de masse.</p>
</div>
</body></html>
`);
}
