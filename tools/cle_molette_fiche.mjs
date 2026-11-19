// Écrit public/equipment/cle-a-molette/data.json : les cotes viennent du modèle (src/models/cle-a-molette/forme.js),
// pour que la fiche et la 3D disent la même chose. Avec --page <fichier.html>, écrit aussi la page des cotes
// (pages/P001.webp en est une capture de 2 200 × 1 700 px).
// Usage : node tools/cle_molette_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { base, dims, SIZES, IN } from '../src/models/cle-a-molette/forme.js';

const fr = (v, n = 1) => v.toFixed(n).replace('.', ',');
const mm = (m, n = 0) => `${fr(m * 1000, n)} mm`;
const po = (m, n = 2) => `${fr(m / IN, n)} po`;
const masse = (kg) => `${fr(kg, kg < 1 ? 2 : 1)} kg (${fr(kg / 0.45359237, kg < 0.45 ? 2 : 1)} lb)`;
const b = base(), d12 = dims(12);
const SOURCE = 'https://opengameart.org/content/tool-pack-1';

const lignes = SIZES.map((size, k) => {
  const d = dims(size);
  const extra = { pseudo: true, note: `Copie à l'échelle ${fr(d.s, 3)} du modèle d'origine. Épaisseur du corps : ${mm(d.Tcorps, 1)} ; mâchoires ouvertes de ${mm(d.ouverture)} comme sur le modèle. Masse calculée en acier : ${masse(d.kg)}.` };
  if (size === 12) { extra.link = 'P002'; extra.note = `La grandeur que le modèle d'origine représente (marquage « 12"-300mm »). ${extra.note}`; }
  return [String(k + 1), '', 1, `Clé à molette de ${size} po — ${mm(d.L)} de long, tête de ${mm(d.W)}, ${mm(d.T, 1)} d'épais`, extra];
});

const data = {
  id: 'cle-a-molette',
  name: 'Clés à molette (Westcott), 6 à 24 po',
  manufacturer: 'Modèle libre (OpenGameArt, CC0)',
  category: 'Outils à main',
  document: {
    title: 'Cotes du modèle par grandeur et provenance (clé à molette du « Tool Pack 1 » d\'OpenGameArt, CC0)',
    reference: 'Clés',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', `Clé à molette du « Tool Pack 1 » d'OpenGameArt, auteur LonesomeDucky, licence CC0 (domaine public) — ${SOURCE}`],
    ['Modèle', `Maillage allégé pour le jeu : 1 240 triangles en trois pièces (corps, mâchoire mobile, molette), textures PBR de 1 024 px (couleur, normales, rugosité et métal)`],
    ['Grandeurs', `${SIZES.slice(0, -1).join(', ')} et ${SIZES[SIZES.length - 1]} po : copies à l'échelle du même modèle, réglées sur la longueur nominale`],
    ['Cotes', 'Largeur de tête, épaisseur, ouverture et masse sont celles du modèle mis à l\'échelle : aucune ne vient d\'un catalogue'],
    ['Modèle d\'origine', `${mm(b.L)} de long, tête de ${mm(b.W, 1)}, ${mm(b.T, 1)} d'épais à la molette ; ramené à ${mm(d12.L)} pour la 12 po`],
    ['Angle de tête', `${fr((b.angle * 180) / Math.PI, 1)}° entre l'axe du manche et les faces des mâchoires (mesuré sur le modèle)`],
    ['Marquage', '« 12"-300mm » et « ToolMaster » en relief dans la cuvette du manche, sur les deux faces ; le même sur toutes les grandeurs'],
    ['Fini', 'Chromé, piqué de rouille (textures du modèle)'],
    ['Export pour moteur de jeu', 'unreal/SM_Cles_A_Molette.glb (glTF binaire, mètres) : les sept grandeurs, trois maillages par clé à l\'échelle 1, matériau et textures partagés — voir docs/cle-a-molette-unreal.md'],
  ],
  weights: SIZES.map((size) => [`Clé de ${size} po (masse calculée du modèle, acier)`, masse(dims(size).kg)]),
  sheetTitles: { P001: 'Cotes du modèle par grandeur et provenance' },
  root: 'P001',
  assemblies: {
    P001: {
      title: 'ADJUSTABLE WRENCHES',
      titleFr: 'Clés à molette (Westcott), 6 à 24 po',
      sheets: ['P001'],
      note: `Sept clés à molette couchées à plat, bouts de manche alignés, de la plus petite à la plus grande. Le modèle n'a pas été dessiné ici : c'est la clé à molette du « Tool Pack 1 » d'OpenGameArt (auteur LonesomeDucky, licence CC0), un modèle de jeu prêt pour Unreal Engine. Il représente une clé marquée « 12"-300mm » ; chaque grandeur en est une copie à l'échelle, réglée sur sa longueur nominale. Largeur de tête, épaisseur et ouverture suivent donc la longueur dans la même proportion, ce qui n'est pas le cas des vraies clés : une petite clé est en réalité plus trapue, une grande plus élancée, et les masses calculées s'écartent d'autant de celles des catalogues aux deux bouts de la gamme. Le marquage « 12"-300mm » de la texture reste le même sur toutes les grandeurs. La photo reçue montre une clé chromée rangée mâchoires vers le haut ; elle est trop petite (44 × 96 pixels) pour y relever une cote ou une grandeur.`,
      parts: lignes,
    },
    P002: {
      title: 'ADJUSTABLE WRENCH 12"',
      titleFr: 'Clé à molette de 12 po : les trois pièces',
      sheets: ['P001'],
      note: `La clé de 12 po, celle que le modèle d'origine représente, en trois pièces : ce sont celles du fichier, rien n'a été ajouté. L'axe de la molette et son ressort, que le modèle ne contient pas, ne sont pas montrés. La mâchoire mobile coulisse dans la tête, perpendiculairement aux faces des mâchoires ; l'angle de tête est de ${fr((b.angle * 180) / Math.PI, 1)}°. Elle est montrée ouverte de ${mm(d12.ouverture)} (${po(d12.ouverture, 1)}), comme sur le modèle ; la molette ne tourne pas quand on la déplace. Masses calculées en acier (7,85 g/cm³) d'après le volume de chaque maillage.`,
      parts: [
        ['1', '', 1, `CORPS : manche et mâchoire fixe, d'une pièce — ${mm(d12.L)} de long, tête de ${mm(d12.W)}, ${mm(d12.Tcorps, 1)} d'épais`, { pseudo: true, note: `Cuvette sur les deux faces du manche, marquée « 12"-300mm » et « ToolMaster » ; trou d'accrochage à six pans au bout du manche ; fenêtre de la molette dans la tête. Masse calculée : ${masse(d12.kgPieces.corps)}.` }],
        ['2', '', 1, 'MÂCHOIRE MOBILE, à tige à crémaillère', { pseudo: true, note: `La tige ronde coulisse dans la tête ; ses dents sont en prise avec la molette. Masse calculée : ${masse(d12.kgPieces.machoire)} (valeur approchée : le maillage de cette pièce n'est pas tout à fait fermé). Le bout de la tige, caché dans la tête une fois la clé montée, n'a pas de texture : il paraît noir en vue éclatée.` }],
        ['3', '', 1, `MOLETTE (vis sans fin) — Ø ${mm(d12.T, 1)}`, { pseudo: true, note: `Pièce la plus épaisse de la clé : elle dépasse des deux faces de la tête pour être tournée du pouce. Masse calculée : ${masse(d12.kgPieces.molette)}.` }],
      ],
    },
  },
  documents: [],
};
writeFileSync(new URL('../public/equipment/cle-a-molette/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
for (const l of lignes) console.log(l[3]);

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const rangs = SIZES.map((size) => {
    const d = dims(size);
    return `<tr><td>${size} po</td><td>${fr(d.s, 3)}</td><td>${mm(d.L)}</td><td>${mm(d.W)}</td><td>${mm(d.Tcorps, 1)}</td><td>${mm(d.T, 1)}</td><td>${mm(d.ouverture)}</td><td>${masse(d.kg)}</td></tr>`;
  }).join('\n');
  writeFileSync(process.argv[at + 1], `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
html, body { margin: 0; background: #fff; }
body { width: 2200px; height: 1700px; box-sizing: border-box; padding: 78px 90px; font: 26px/1.35 "DejaVu Sans", Verdana, sans-serif; color: #1a1b1e; }
h1 { font-size: 50px; margin: 0 0 14px; }
.sous { color: #4a4d52; margin: 0 0 30px; max-width: 1900px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
th, td { border: 2px solid #1a1b1e; padding: 15px 14px; text-align: center; }
th { background: #e9eaee; font-size: 24px; }
p { color: #4a4d52; margin: 0 0 20px; max-width: 1900px; }
p b { color: #33363a; }
.petit { font-size: 21px; }
</style></head><body>
<h1>Clés à molette (Westcott), 6 à 24 po — cotes du modèle</h1>
<p class="sous">Clé à molette du « Tool Pack 1 » d'OpenGameArt (auteur LonesomeDucky, licence CC0), marquée « 12"-300mm ». Chaque grandeur est une copie à l'échelle de ce modèle ; aucune cote ne vient d'un catalogue.</p>
<table>
<tr><th>Grandeur</th><th>Échelle du<br>modèle</th><th>Longueur</th><th>Largeur<br>de tête</th><th>Épaisseur<br>du corps</th><th>Épaisseur<br>à la molette</th><th>Ouverture<br>montrée</th><th>Masse calculée<br>(acier)</th></tr>
${rangs}
</table>
<p><b>Modèle d'origine.</b> ${mm(b.L)} de long, tête de ${mm(b.W, 1)}, ${mm(b.T, 1)} d'épais à la molette, angle de tête de ${fr((b.angle * 180) / Math.PI, 1)}° ; 1 240 triangles en trois pièces (corps, mâchoire mobile, molette), textures de 1 024 px (couleur, normales, rugosité et métal).</p>
<p><b>Méthode.</b> Un seul facteur d'échelle par grandeur, pour que la longueur hors tout égale la longueur nominale : la tête garde son angle et la molette reste ronde. La masse est le volume des trois maillages multiplié par 7,85 g/cm³.</p>
<p><b>Limites.</b> Les vraies clés ne sont pas des copies à l'échelle les unes des autres : une petite clé est plus trapue, une grande plus élancée. Largeur, épaisseur et masse s'écartent donc de celles des catalogues aux deux bouts de la gamme. Le marquage « 12"-300mm » et « ToolMaster » de la texture reste le même sur toutes les grandeurs. L'axe de la molette et son ressort ne font pas partie du modèle.</p>
<p class="petit">Source : ${SOURCE} (fichier tool_pack_1.zip, adjustable_wrench.glb). Licence CC0 1.0 : usage libre, sans attribution obligatoire.</p>
</body></html>
`);
}
