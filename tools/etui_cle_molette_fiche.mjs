// Écrit public/equipment/etui-cle-molette/data.json : les cotes viennent du modèle
// (src/models/etui-cle-molette/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page du relevé (pages/P001.webp en est une capture de 2 200 × 1 700 px).
// Usage : node tools/etui_cle_molette_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { H, LARGEUR, PROFONDEUR, CUIR, PASSANT, AILE, RIVET, CEINTURE, INTERIEUR, AVANT, largeur, pose } from '../src/models/etui-cle-molette/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = { 0: '', 0.25: ' 1/4', 0.5: ' 1/2', 0.75: ' 3/4' };
const po = (v) => { const q = Math.round((v / 25.4) * 4) / 4, e = Math.floor(q); return `${e || ''}${FRACTIONS[q - e]} po`.trim(); };
const q = pose();
const entraxe = 2 * (largeur(RIVET.y[0]) / 2 - AILE / 2);
const jour = H - CUIR - 36; // hauteur libre du passant, du raccord du bas au pli du haut

// Relevé sur la photo (pixels), échelle 304,8 mm / 74,5 px.
const PX = 304.8 / 74.5;
const RELEVE = [
  ['Hauteur de l\'étui', 31, `${po(H)} (${mm(H)})`],
  ['Largeur en haut', 19, `${po(LARGEUR.haut)} (${mm(LARGEUR.haut)})`],
  ['Largeur en bas', 15.5, `${po(LARGEUR.bas)} (${mm(LARGEUR.bas)})`],
  ['Entraxe des deux rivets du bas', 13.5, `${mm(entraxe)} sur le modèle`],
  ['Tête de la clé au-dessus de l\'étui', 14.5, `${mm(q.dessus)} sur le modèle`],
  ['Manche de la clé sous l\'étui', 29, `${mm(q.dessous)} sur le modèle`],
  ['Largeur de la tête de la clé', 17, '68 mm sur la clé de 12 po du site'],
  ['Largeur du manche de la clé', 6, '24 à 32 mm sur la clé de 12 po du site'],
];

const data = {
  id: 'etui-cle-molette',
  name: 'Étui en cuir pour clé à molette, porté à la ceinture',
  manufacturer: 'Fabricant non indiqué',
  category: 'Étui de mineur en cuir riveté',
  document: {
    title: 'Photo reçue de l\'étui porté à la ceinture, clé rangée (aucun plan), et relevé des cotes',
    reference: 'Étui',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', 'Une seule photo, de 44 × 96 pixels : la clé à molette rangée mâchoires vers le haut dans un étui porté à la taille ; aucun plan, aucune cote'],
    ['Échelle', `La clé, prise pour une 12 po : 304,8 mm sur 74,5 pixels, soit ${fr(PX, 1)} mm par pixel ; relevé à environ 8 mm près (deux pixels)`],
    ['Hauteur', `${po(H)} (${mm(H)}) — relevée : ${mm(31 * PX)}`],
    ['Largeur', `${po(LARGEUR.haut)} (${mm(LARGEUR.haut)}) en haut, ${po(LARGEUR.bas)} (${mm(LARGEUR.bas)}) en bas — relevées : ${mm(19 * PX)} et ${mm(15.5 * PX)}`],
    ['Profondeur', `${po(PROFONDEUR)} (${mm(PROFONDEUR)}), supposée : celle d'un étui de mineur du commerce (Savaco ETUIDM01, 4 × 2 1/2 × 1 1/2 po)`],
    ['Fourreau', `Ouvert en haut et en bas ; ${mm(INTERIEUR.haut)} de large à l'intérieur en haut, ${mm(INTERIEUR.bas)} en bas, ${mm(AVANT - CUIR, 1)} de profond`],
    ['Rivets', `4, tête de ${mm(RIVET.d)} : les deux du bas sont visibles sur la photo, à ${mm(13.5 * PX)} l'un de l'autre (${mm(entraxe)} sur le modèle) ; les deux du haut sont supposés`],
    ['Passant de ceinture', `Dos replié par-dessus la ceinture et repris par les rivets du bas : jour de ${mm(PASSANT)}, hauteur libre d'environ ${mm(jour)} — supposé, caché sur la photo`],
    ['Cuir', `${mm(CUIR, 1)} d'épais, brun : épaisseur et couleur supposées (la photo, sombre, montre l'étui gris)`],
    ['Clé rangée', `Clé à molette de 12 po, mâchoires fermées : la tête dépasse de ${mm(q.dessus)} au-dessus de l'étui, le manche de ${mm(q.dessous)} au-dessous (photo : ${mm(14.5 * PX)} et ${mm(29 * PX)})`],
    ['Ceinture', `Tronçon de ${po(CEINTURE.large)} de large et ${mm(CEINTURE.epais)} d'épais, pour situer l'étui : cotes supposées`],
    ['Export pour moteur de jeu', 'unreal/SM_Etui_Cle_A_Molette.glb (l\'étui seul) et unreal/etui-avec-cle.glb (l\'étui et la clé de 12 po rangée), glTF binaire, mètres — voir docs/etui-cle-molette-unreal.md'],
  ],
  weights: [],
  sheetTitles: {
    P001: 'Relevé des cotes sur la photo et hypothèses',
    P002: 'Photo reçue, agrandie 12 fois (44 × 96 pixels à l\'origine ; bord gauche coupé)',
  },
  root: 'P002',
  assemblies: {
    P002: {
      title: 'WRENCH HOLSTER ON BELT',
      titleFr: 'Étui porté à la ceinture, clé de 12 po rangée',
      sheets: ['P002', 'P001'],
      note: `Mise en situation, comme sur la photo reçue : l'étui pend à la ceinture, la clé à molette y est rangée manche en bas, mâchoires vers le haut. La clé descend dans le fourreau jusqu'à ce que les épaules de sa tête s'appuient sur la gueule, large de ${mm(INTERIEUR.haut)} à l'intérieur : la tête dépasse alors de ${mm(q.dessus)} au-dessus de l'étui et le manche de ${mm(q.dessous)} au-dessous (${mm(14.5 * PX)} et ${mm(29 * PX)} relevés sur la photo, à 8 mm près). La pose est calculée, pas relevée. Les mâchoires sont fermées : ouverte, la tige de la mâchoire mobile dépasserait du côté de la tête et buterait sur l'étui. Le tronçon de ceinture ne sert qu'à situer l'étui ; sa largeur est supposée.`,
      parts: [
        ['1', '', 1, `ÉTUI EN CUIR — ${po(H)} de haut, ${po(LARGEUR.haut)} de large en haut, ${po(LARGEUR.bas)} en bas`, { link: 'P001', pseudo: true, note: 'Reconstitution d\'après la photo ; dos, passant de ceinture et profondeur supposés.' }],
        ['2', '', 1, 'CLÉ À MOLETTE DE 12 PO, mâchoires fermées, rangée manche en bas', { pseudo: true, note: 'Hors étui : c\'est la clé de la page « Clé à molette (Westcott) de 12 po » du site (modèle d\'OpenGameArt, CC0).' }],
        ['3', '', 1, `CEINTURE DE MINEUR, tronçon de ${mm(CEINTURE.long)} (pour situer)`, { pseudo: true, note: `Bande de cuir noir de ${po(CEINTURE.large)} de large et ${mm(CEINTURE.epais)} d'épais, droite dans le passant et cintrée au-delà. Largeur, épaisseur et couleur supposées : la ceinture n'est pas lisible sur la photo. Ni boucle ni autre accessoire.` }],
      ],
    },
    P001: {
      title: 'LEATHER WRENCH HOLSTER',
      titleFr: 'Étui en cuir pour clé à molette',
      sheets: ['P001', 'P002'],
      note: `Reconstitution 3D d'après une seule photo, très petite (44 × 96 pixels), sans plan ni cote. L'échelle vient de la clé, prise pour une 12 po (${fr(PX, 1)} mm par pixel) : largeur de sa tête (70 mm relevés) et de son manche (25 mm) concordent avec la clé de 12 po du site. Relevé sur la photo, à environ 8 mm près : la hauteur de l'étui (${mm(31 * PX)}), sa largeur en haut (${mm(19 * PX)}) et en bas (${mm(15.5 * PX)}), et deux rivets brillants aux coins du bas, à ${mm(13.5 * PX)} l'un de l'autre ; ces cotes sont arrondies au demi-pouce. Supposé, parce que caché ou illisible : le dos et le passant de ceinture (dos replié par-dessus la ceinture, repris par les rivets du bas), les deux rivets du haut, l'épaisseur et la couleur du cuir, et la profondeur, reprise d'un étui de mineur du commerce (Savaco ETUIDM01, 4 × 2 1/2 × 1 1/2 po). Non modélisé : coutures, marque ou estampille, que la photo ne montre pas. Une photo plus grande de l'étui, de face et de dos, permettrait de corriger la forme.`,
      parts: [
        ['1', '', 1, `DOS replié en passant de ceinture — bande de cuir de ${po(LARGEUR.haut)} à ${po(LARGEUR.bas)} de large`, { pseudo: true, note: `Une seule bande de ${mm(CUIR, 1)} d'épais : elle monte contre la clé, se replie en haut par-dessus la ceinture et redescend derrière ; les deux épaisseurs se rejoignent en bas, serrées par les rivets. Jour de ${mm(PASSANT)} pour la ceinture, hauteur libre d'environ ${mm(jour)}. Entièrement supposé : le dos est caché sur la photo.` }],
        ['2', '', 1, `FOURREAU : bande de cuir cintrée en U, ${po(H)} de haut, ailes de ${mm(AILE, 1)} rivetées sur le dos`, { pseudo: true, note: `Ouvert en haut et en bas : le manche le traverse, la tête de la clé s'appuie sur la gueule. Largeur intérieure de ${mm(INTERIEUR.haut)} en haut et de ${mm(INTERIEUR.bas)} en bas ; avancée de ${mm(AVANT, 1)} devant le dos (profondeur supposée). Hauteur et largeurs relevées sur la photo.` }],
        ['3', '', 4, `RIVET à tête bombée de ${mm(RIVET.d)}`, { pseudo: true, note: `Les deux du bas sont visibles sur la photo (points brillants, à ${mm(13.5 * PX)} l'un de l'autre) ; ils traversent l'aile du fourreau et les deux épaisseurs du dos. Les deux du haut, supposés, ne traversent que l'aile et l'avant du dos, pour laisser passer la ceinture. Diamètre et matière (acier nickelé) supposés.` }],
      ],
    },
  },
  documents: [],
};
writeFileSync(new URL('../public/equipment/etui-cle-molette/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`étui ${mm(H)} × ${mm(LARGEUR.haut)}/${mm(LARGEUR.bas)} × ${mm(PROFONDEUR)} ; clé : ${mm(q.dessus)} au-dessus, ${mm(q.dessous)} au-dessous ; rivets du bas à ${mm(entraxe)}`);

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const rangs = RELEVE.map(([nom, px, retenu]) => `<tr><td class="g">${nom}</td><td>${fr(px, 1)} px</td><td>${mm(px * PX)}</td><td class="g">${retenu}</td></tr>`).join('\n');
  writeFileSync(process.argv[at + 1], `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
html, body { margin: 0; background: #fff; }
body { width: 2200px; height: 1700px; box-sizing: border-box; padding: 70px 90px; font: 25px/1.35 "DejaVu Sans", Verdana, sans-serif; color: #1a1b1e; }
h1 { font-size: 48px; margin: 0 0 12px; }
.sous { color: #4a4d52; margin: 0 0 26px; max-width: 1950px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 26px; }
th, td { border: 2px solid #1a1b1e; padding: 12px 16px; text-align: center; }
th { background: #e9eaee; font-size: 23px; }
td.g { text-align: left; }
p { color: #4a4d52; margin: 0 0 16px; max-width: 1950px; }
p b { color: #33363a; }
</style></head><body>
<h1>Étui en cuir pour clé à molette — relevé sur la photo</h1>
<p class="sous">Une seule photo, de 44 × 96 pixels (page P002). Échelle : la clé, prise pour une 12 po, mesure 74,5 pixels, soit ${fr(PX, 1)} mm par pixel. Chaque lecture est juste à deux pixels près, environ 8 mm.</p>
<table>
<tr><th>Cote</th><th>Lue sur la photo</th><th>Soit</th><th>Retenu pour le modèle</th></tr>
${rangs}
</table>
<p><b>Ce que la photo montre.</b> Un étui plus large en haut qu'en bas, deux rivets brillants aux coins du bas, la clé rangée manche en bas et mâchoires vers le haut. La largeur de la tête et celle du manche concordent avec une clé de 12 po.</p>
<p><b>Supposé, parce que caché ou illisible.</b> Le dos et le passant de ceinture (dos replié par-dessus la ceinture, repris par les rivets du bas) ; les deux rivets du haut ; l'épaisseur du cuir (${mm(CUIR, 1)}) et sa couleur (brun : la photo, sombre, le montre gris) ; la profondeur (${po(PROFONDEUR)}), reprise d'un étui de mineur du commerce (Savaco ETUIDM01, 4 × 2 1/2 × 1 1/2 po).</p>
<p><b>Non modélisé.</b> Coutures, marque ou estampille : la photo ne les montre pas.</p>
<p><b>Pour faire mieux.</b> Une photo plus grande de l'étui, de face et de dos, avec une règle à côté, permettrait de corriger la forme et de remplacer les hypothèses par des mesures.</p>
</body></html>
`);
}
