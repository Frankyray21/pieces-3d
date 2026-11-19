// Écrit public/equipment/cle-a-molette/data.json : les cotes viennent du modèle (src/models/cle-a-molette/forme.js),
// pour que la fiche et la 3D disent la même chose. Avec --page <fichier.html>, écrit aussi la page des cotes
// (pages/P001.webp en est une capture de 2 200 × 1 700 px).
// Usage : node tools/cle_molette_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { base, dims, GRANDEUR, IN } from '../src/models/cle-a-molette/forme.js';

const fr = (v, n = 1) => v.toFixed(n).replace('.', ',');
const mm = (m, n = 0) => `${fr(m * 1000, n)} mm`;
const po = (m, n = 2) => `${fr(m / IN, n)} po`;
const masse = (kg) => `${fr(kg, 2)} kg (${fr(kg / 0.45359237, 2)} lb)`;
const b = base(), d = dims(), angle = fr((b.angle * 180) / Math.PI, 1);
const SOURCE = 'https://opengameart.org/content/tool-pack-1';

const data = {
  id: 'cle-a-molette',
  name: `Clé à molette (Westcott) de ${GRANDEUR} po`,
  manufacturer: 'Modèle libre (OpenGameArt, CC0)',
  category: 'Outils à main',
  document: {
    title: 'Cotes du modèle et provenance (clé à molette du « Tool Pack 1 » d\'OpenGameArt, CC0)',
    reference: 'Clé',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', `Clé à molette du « Tool Pack 1 » d'OpenGameArt, auteur LonesomeDucky, licence CC0 (domaine public) — ${SOURCE}`],
    ['Modèle', 'Maillage allégé pour le jeu : 1 240 triangles en trois pièces (corps, mâchoire mobile, molette), textures PBR de 1 024 px (couleur, normales, rugosité et métal)'],
    ['Grandeur', `${GRANDEUR} po : ${mm(d.L)} de longueur hors tout (le modèle d'origine, de ${mm(b.L)}, est ramené à l'échelle ${fr(d.s, 3)})`],
    ['Largeur de tête', `${mm(d.W)} (${po(d.W)}), mâchoire mobile non comprise`],
    ['Épaisseur', `${mm(d.Tcorps, 1)} au corps, ${mm(d.T, 1)} à la molette`],
    ['Ouverture montrée', `${mm(d.ouverture)} (${po(d.ouverture, 1)}), comme sur le modèle`],
    ['Angle de tête', `${angle}° entre l'axe du manche et les faces des mâchoires (mesuré sur le modèle)`],
    ['Cotes', 'Toutes sont celles du modèle mis à l\'échelle : aucune ne vient d\'un catalogue'],
    ['Marquage', '« 12"-300mm » et « ToolMaster » en relief dans la cuvette du manche, sur les deux faces'],
    ['Fini', 'Chromé, piqué de rouille (textures du modèle)'],
    ['Export pour moteur de jeu', 'unreal/SM_Cle_A_Molette_12po.glb (glTF binaire, mètres) : trois maillages à l\'échelle 1, la mâchoire et la molette avec leur pivot, un matériau et trois textures — voir docs/cle-a-molette-unreal.md'],
  ],
  weights: [
    ['Clé complète (masse calculée du modèle, acier)', masse(d.kg)],
    ['Corps', masse(d.kgPieces.corps)],
    ['Mâchoire mobile (valeur approchée)', masse(d.kgPieces.machoire)],
    ['Molette', masse(d.kgPieces.molette)],
  ],
  sheetTitles: { P001: 'Cotes du modèle et provenance' },
  root: 'P001',
  assemblies: {
    P001: {
      title: 'ADJUSTABLE WRENCH 12"',
      titleFr: `Clé à molette (Westcott) de ${GRANDEUR} po`,
      sheets: ['P001'],
      note: `Clé à molette de ${GRANDEUR} po couchée à plat, mâchoires entrouvertes, en trois pièces. Le modèle n'a pas été dessiné ici : c'est la clé à molette du « Tool Pack 1 » d'OpenGameArt (auteur LonesomeDucky, licence CC0), un modèle de jeu prêt pour Unreal Engine. Il représente une clé marquée « 12"-300mm » et mesure ${mm(b.L)} ; il est ramené à ${mm(d.L)} de long, d'un seul facteur d'échelle. Largeur de tête, épaisseur et masse sont donc celles du modèle, pas des cotes de catalogue. Les trois pièces sont celles du fichier, rien n'a été ajouté : l'axe de la molette et son ressort, que le modèle ne contient pas, ne sont pas montrés. La mâchoire mobile coulisse dans la tête, perpendiculairement aux faces des mâchoires ; l'angle de tête est de ${angle}°. Elle est montrée ouverte de ${mm(d.ouverture)} (${po(d.ouverture, 1)}), comme sur le modèle ; la molette ne tourne pas quand on la déplace. Masses calculées en acier (7,85 g/cm³) d'après le volume de chaque maillage. La photo reçue montre une clé chromée rangée mâchoires vers le haut ; elle est trop petite (44 × 96 pixels) pour y relever une cote.`,
      parts: [
        ['1', '', 1, `CORPS : manche et mâchoire fixe, d'une pièce — ${mm(d.L)} de long, tête de ${mm(d.W)}, ${mm(d.Tcorps, 1)} d'épais`, { pseudo: true, note: `Cuvette sur les deux faces du manche, marquée « 12"-300mm » et « ToolMaster » ; trou d'accrochage à six pans au bout du manche ; fenêtre de la molette dans la tête. Masse calculée : ${masse(d.kgPieces.corps)}.` }],
        ['2', '', 1, 'MÂCHOIRE MOBILE, à tige à crémaillère', { pseudo: true, note: `La tige ronde coulisse dans la tête ; ses dents sont en prise avec la molette. Masse calculée : ${masse(d.kgPieces.machoire)} (valeur approchée : le maillage de cette pièce n'est pas tout à fait fermé). Le bout de la tige, caché dans la tête une fois la clé montée, n'a pas de texture : il paraît noir en vue éclatée.` }],
        ['3', '', 1, `MOLETTE (vis sans fin) — Ø ${mm(d.T, 1)}`, { pseudo: true, note: `Pièce la plus épaisse de la clé : elle dépasse des deux faces de la tête pour être tournée du pouce. Masse calculée : ${masse(d.kgPieces.molette)}.` }],
      ],
    },
  },
  documents: [],
};
writeFileSync(new URL('../public/equipment/cle-a-molette/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`${mm(d.L)} × ${mm(d.W)} × ${mm(d.T, 1)}, ${masse(d.kg)}`);

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const rang = (nom, valeur, origine) => `<tr><td class="g">${nom}</td><td>${valeur}</td><td class="g">${origine}</td></tr>`;
  writeFileSync(process.argv[at + 1], `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
html, body { margin: 0; background: #fff; }
body { width: 2200px; height: 1700px; box-sizing: border-box; padding: 78px 90px; font: 26px/1.35 "DejaVu Sans", Verdana, sans-serif; color: #1a1b1e; }
h1 { font-size: 50px; margin: 0 0 14px; }
.sous { color: #4a4d52; margin: 0 0 30px; max-width: 1900px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
th, td { border: 2px solid #1a1b1e; padding: 15px 18px; text-align: center; }
th { background: #e9eaee; font-size: 24px; }
td.g { text-align: left; }
p { color: #4a4d52; margin: 0 0 20px; max-width: 1900px; }
p b { color: #33363a; }
.petit { font-size: 21px; }
</style></head><body>
<h1>Clé à molette (Westcott) de ${GRANDEUR} po — cotes du modèle</h1>
<p class="sous">Clé à molette du « Tool Pack 1 » d'OpenGameArt (auteur LonesomeDucky, licence CC0), marquée « 12"-300mm ». Aucune cote ne vient d'un catalogue : toutes sont mesurées sur le modèle, ramené à ${GRANDEUR} po de long.</p>
<table>
<tr><th>Cote</th><th>Valeur</th><th>Provenance</th></tr>
${rang('Longueur hors tout', `${mm(d.L, 1)} (${GRANDEUR} po)`, `Grandeur nominale ; le modèle d'origine mesure ${mm(b.L)} (échelle ${fr(d.s, 3)})`)}
${rang('Largeur de tête', `${mm(d.W, 1)} (${po(d.W)})`, 'Corps seul, sans la tige de la mâchoire mobile qui dépasse')}
${rang('Épaisseur du corps', `${mm(d.Tcorps, 1)}`, 'Mesurée sur le maillage du corps')}
${rang('Épaisseur à la molette', `${mm(d.T, 1)}`, 'Diamètre de la molette, la pièce la plus épaisse')}
${rang('Ouverture montrée', `${mm(d.ouverture, 1)} (${po(d.ouverture, 1)})`, 'Écart des faces des mâchoires, tel que modélisé')}
${rang('Angle de tête', `${angle}°`, 'Entre l\'axe du manche et les faces des mâchoires')}
${rang('Masse calculée', masse(d.kg), `Volume des maillages × 7,85 g/cm³ : corps ${fr(d.kgPieces.corps, 2)} kg, mâchoire ${fr(d.kgPieces.machoire, 2)} kg, molette ${fr(d.kgPieces.molette, 2)} kg`)}
</table>
<p><b>Modèle.</b> 1 240 triangles en trois pièces (corps, mâchoire mobile, molette), textures de 1 024 px (couleur, normales, rugosité et métal) ; chromé, piqué de rouille. Marquage « 12"-300mm » et « ToolMaster » dans la cuvette du manche.</p>
<p><b>Méthode.</b> Un seul facteur d'échelle, pour que la longueur hors tout égale ${GRANDEUR} po : la tête garde son angle et la molette reste ronde.</p>
<p><b>Limites.</b> Ce n'est la clé d'aucun catalogue. L'axe de la molette et son ressort ne font pas partie du modèle. Le maillage de la mâchoire mobile n'est pas tout à fait fermé : sa masse est approchée.</p>
<p class="petit">Source : ${SOURCE} (fichier tool_pack_1.zip, adjustable_wrench.glb). Licence CC0 1.0 : usage libre, sans attribution obligatoire.</p>
</body></html>
`);
}
