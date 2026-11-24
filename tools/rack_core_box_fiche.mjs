// Écrit public/equipment/rack-core-box/data.json : les cotes viennent du modèle
// (src/models/rack-core-box/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : le rack vu du côté des fourches et vu de côté.
// Usage : node tools/rack_core_box_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { IN, BOITE, PILE, TUBE, BASE, FOURCHE, CADRE, largeurPile, largeurBase, dessusTole, hautBoite, largeurRangee, horsTout, nombreBoites, passages } from '../src/models/rack-core-box/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const pgcd = (a, b) => (b ? pgcd(b, a % b) : a);
/** Pouces en fraction, au seizième près. */
const po = (v) => { const q = Math.round((v / IN) * 16), e = Math.floor(q / 16), r = q % 16, d = pgcd(r, 16); return `${e || ''}${r ? ` ${r / d}/${16 / d}` : ''} po`.trim(); };
const h = horsTout(), N = nombreBoites(), NA = 2 * CADRE.parCote;
const m = (v) => `${fr(v / 1000, 2)} m`;

const SOURCE = 'Une photo du client, prise sous terre (P01), qui ne montre qu\'une portion du rack. Aucun plan, aucune cote publiée, fabricant non identifié';
const ECHELLE = `La longueur d'une boîte à carottes, donnée par le client : au moins ${m(BOITE.long)}. C'est la seule cote sûre ; toutes les autres sont relevées sur la photo à cette échelle (à ± 10 % environ) ou supposées`;
const USAGE = 'Rack de transport et d\'entreposage des boîtes à carottes pleines : on les empile couchées sur la plate-forme, entre les arceaux, et on déplace le tout par les passages de fourche';

const data = {
  id: 'rack-core-box',
  name: 'Rack de boîtes à carottes (core box)',
  manufacturer: 'Fabricant non identifié',
  category: 'Rack de transport des boîtes à carottes',
  serial: '',
  document: {
    title: 'Photo du client (aucun plan) et cotes relevées ou supposées',
    reference: '',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Échelle', ECHELLE],
    ['Usage', USAGE],
    ['Encombrement', `${m(h.large)} de large (d'un côté à l'autre) × ${m(h.profond)} (le long des boîtes) × ${m(h.haut)} de haut — largeur calculée pour ${PILE.colonnes} boîtes de ${mm(BOITE.large)} (largeur de boîte supposée), le reste relevé sur la photo à l'échelle de la boîte`],
    ['Boîte à carottes', `Boîte de bois à couvercle, ${m(BOITE.long)} de long (donnée par le client). Supposé : ${mm(BOITE.large)} de large, ${mm(hautBoite())} de haut fermée, ${BOITE.rangees} rangées de ${mm(largeurRangee())} — proportions des bouts de boîtes de la photo. À remplacer par les cotes réelles de la boîte si elles sont connues`],
    ['Empilement', `${PILE.colonnes} colonnes de ${PILE.etages} boîtes, soit ${N} boîtes, couchées en travers, bouts vers le côté des fourches, colonnes décalées l'une de l'autre (jusqu'à ${mm(PILE.decalage[1] - PILE.decalage[0])}) comme sur la photo. Il entre ${PILE.colonnes} boîtes de large et jusqu'à ${PILE.etages} de haut (donnés par le client) : le modèle montre le rack plein, la photo ${PILE.visibles} boîtes de haut. Pile pleine : ${mm(PILE.etages * hautBoite())} de haut (hauteur de boîte supposée), sous le dessus des arceaux`],
    ['Plate-forme', `Pâle sur la photo. ${m(largeurBase())} × ${m(BASE.profond)}, dessus à ${mm(dessusTole())} du sol. Supposé : cadre de tube de ${po(BASE.cadre.large)} × ${po(BASE.cadre.haut)}, deux traverses, tôle de ${po(BASE.tole)}`],
    ['Passages de fourche', `${FOURCHE.nombre}, sous la plate-forme, le long des boîtes, un sous une colonne sur deux, à ${mm(FOURCHE.entraxe)} d'entraxe : deux sont visibles sur la photo, le troisième est supposé par symétrie. Supposé aussi : tube de ${po(FOURCHE.large)} × ${po(FOURCHE.haut)}`],
    ['Arceaux', `Bleus sur la photo. Les côtés ne sont pas continus (précision du client) : chaque côté porte ${CADRE.parCote} arceaux séparés, un au bord avant et un au bord arrière, soit ${NA} en tout. Chaque arceau : deux montants, une traverse haute et une diagonale, ${mm(CADRE.large)} de large et ${mm(CADRE.haut)} au-dessus de la tôle (relevé). Supposé : tube carré de ${po(TUBE.cote)}, diagonale de ${po(TUBE.diagonale)}, même sens de diagonale partout ; un seul arceau est visible en entier sur la photo, les autres en partie`],
    ['Non modélisé', 'Le contenu des boîtes (carottes, blocs de métrage), les inscriptions et le cerclage des boîtes. Soudures non dessinées'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du client : une portion du rack de boîtes à carottes, sous terre',
    P02: 'Cotes du rack (relevées sur la photo à l\'échelle de la boîte de 1,5 m, ou supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'CORE BOX RACK',
      titleFr: 'Rack de boîtes à carottes',
      pn: '',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après une photo du client (P01), qui ne montre qu'une portion du rack. ${USAGE}. Échelle : la boîte à carottes de ${m(BOITE.long)} (donnée par le client) ; les autres cotes sont relevées sur la photo à cette échelle ou supposées (voir la fiche et P02). Largeur et hauteur de la boîte supposées. En vue éclatée, la pile monte et les couvercles se soulèvent.`,
      parts: [
        ['1', '', 1, 'PLATE-FORME (cadre de tube et tôle)', { note: `${m(largeurBase())} × ${m(BASE.profond)} : largeur pour ${PILE.colonnes} boîtes, profondeur relevée sur la photo. Sections supposées : tube de ${po(BASE.cadre.large)} × ${po(BASE.cadre.haut)}, tôle de ${po(BASE.tole)}.` }],
        ['2', '', FOURCHE.nombre, 'PASSAGE DE FOURCHE', { note: `Sous la plate-forme, le long des boîtes, à ${mm(FOURCHE.entraxe)} d'entraxe ; deux visibles sur la photo, le troisième supposé. Tube de ${po(FOURCHE.large)} × ${po(FOURCHE.haut)} supposé.` }],
        ['3', '', 2 * NA, 'MONTANT D\'ARCEAU', { note: `Tube carré de ${po(TUBE.cote)} supposé ; arceau de ${mm(CADRE.haut)} de haut au-dessus de la tôle (relevé).` }],
        ['4', '', NA, 'TRAVERSE HAUTE D\'ARCEAU', { note: `Tube carré de ${po(TUBE.cote)} supposé, ${mm(CADRE.large)} de long (relevé).` }],
        ['5', '', NA, 'DIAGONALE D\'ARCEAU', { note: `Du pied du montant avant à la tête du montant arrière. Tube de ${po(TUBE.diagonale)} supposé ; sens relevé sur l'arceau avant gauche, supposé pour les autres.` }],
        ['6', '', N, `BOÎTE À CAROTTES (core box) de ${m(BOITE.long)}`, { note: `Bois, ${BOITE.rangees} rangées. Longueur donnée par le client (minimum) ; largeur de ${mm(BOITE.large)} et hauteur de ${mm(BOITE.haut)} supposées. Quantité : ${PILE.colonnes} de large (donné par le client) × ${PILE.etages} de haut, rack plein (donnés par le client ; ${PILE.visibles} de haut sur la photo).` }],
        ['7', '', N, 'COUVERCLE DE BOÎTE À CAROTTES', { note: `Contreplaqué de ${mm(BOITE.couvercle)} supposé.` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/rack-core-box/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; rack de ${m(h.large)} × ${m(h.profond)} × ${m(h.haut)}, ${N} boîtes`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const k = 0.5; // px par mm
  const hc = (xa, xb, y, txt) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 10}" text-anchor="middle">${txt}</text>`;
  const vc = (x, ya, yb, txt) => `<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + 12}" y="${(ya + yb) / 2 + 7}">${txt}</text>`;
  const rect = (ox, sol, x0, x1, y0, y1, cls) => `<rect x="${ox + x0 * k}" y="${sol - y1 * k}" width="${(x1 - x0) * k}" height="${(y1 - y0) * k}" class="${cls}"/>`;
  const sol = 760, W = largeurBase() / 2, D = BASE.profond / 2, yT = dessusTole(), yB = FOURCHE.haut, c = TUBE.cote;
  // Vue du côté des fourches (bouts des boîtes) : X à l'horizontale.
  const ox = 540;
  let face = rect(ox, sol, -W, W, yB, yT, 'pl');
  for (const x of passages()) face += rect(ox, sol, x - FOURCHE.large / 2, x + FOURCHE.large / 2, 0, yB, 'pl');
  for (const s of [-1, 1]) {
    face += rect(ox, sol, s > 0 ? W - c : -W, s > 0 ? W : -W + c, yT, yT + CADRE.haut, 'bl');
  }
  const pas = BOITE.large + PILE.jeu, x0 = -largeurPile() / 2;
  for (let col = 0; col < PILE.colonnes; col++) for (let et = 0; et < PILE.etages; et++) face += rect(ox, sol, x0 + col * pas, x0 + col * pas + BOITE.large, yT + et * hautBoite(), yT + (et + 1) * hautBoite(), 'bois');
  face += hc(ox - W * k, ox + W * k, sol + 60, `${m(largeurBase())} (${PILE.colonnes} boîtes)`)
    + vc(ox + W * k + 40, sol - (yT + CADRE.haut) * k, sol, `${m(h.haut)} †`)
    + hc(ox + x0 * k, ox + (x0 + BOITE.large) * k, sol - (yT + PILE.etages * hautBoite()) * k - 30, `${mm(BOITE.large)} ‡`)
    + hc(ox + passages()[0] * k, ox + passages()[1] * k, sol + 110, `entraxe ${mm(FOURCHE.entraxe)} †`);
  // Vue de côté : Z à l'horizontale, l'avant (fourches) à gauche.
  const oz = 1640;
  let cote = rect(oz, sol, -D, D, yB, yT, 'pl') + rect(oz, sol, -D, D, 0, yB, 'pl');
  for (let et = 0; et < PILE.etages; et++) cote += rect(oz, sol, -BOITE.long / 2, BOITE.long / 2, yT + et * hautBoite(), yT + (et + 1) * hautBoite(), 'bois');
  // L'avant (fourches, +Z du modèle) est à gauche : z du modèle = -abscisse.
  for (const b of [1, -1]) {
    const a0 = -b * D, a1 = a0 + b * CADRE.large, g = Math.min(a0, a1), d = Math.max(a0, a1);
    cote += rect(oz, sol, g, g + c, yT, yT + CADRE.haut, 'bl') + rect(oz, sol, d - c, d, yT, yT + CADRE.haut, 'bl') + rect(oz, sol, g, d, yT + CADRE.haut - c, yT + CADRE.haut, 'bl');
    cote += `<line x1="${oz + (g + c) * k}" y1="${sol - yT * k}" x2="${oz + (d - c) * k}" y2="${sol - (yT + CADRE.haut - c) * k}" class="dg"/>`;
  }
  cote += hc(oz - D * k, oz - (D - CADRE.large) * k, sol - (yT + CADRE.haut) * k - 30, `${mm(CADRE.large)} †`);
  cote += hc(oz - D * k, oz + D * k, sol + 60, `${m(BASE.profond)} †`)
    + hc(oz - BOITE.long / 2 * k, oz + BOITE.long / 2 * k, sol + 110, `boîte : ${m(BOITE.long)} (donnée par le client)`)
    + vc(oz + D * k + 40, sol - (yT + CADRE.haut) * k, sol - yT * k, `${mm(CADRE.haut)} †`);
  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:44px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .bois{fill:#ecd9b0;stroke:#333;stroke-width:1.5}.pl{fill:#d9dcdf;stroke:#333;stroke-width:1.5}.bl{fill:#7d9bd0;stroke:#333;stroke-width:1.5}.dg{stroke:#4a6cab;stroke-width:${TUBE.diagonale * k}}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}text.t{font-weight:600;font-size:24px}
    table{position:absolute;left:70px;top:1060px;width:2060px;border-collapse:collapse;font-size:19px;line-height:1.3}
    th{width:230px;text-align:left;vertical-align:top;padding:6px 12px 6px 0;color:#444}td{padding:6px 0;border-top:1px solid #ddd}
    </style><h1>Rack de boîtes à carottes (core box) — cotes</h1>
    <p class="s">Aucun plan. Échelle : la boîte de ${m(BOITE.long)} donnée par le client. † = relevé sur la photo à cette échelle (± 10 % environ) ; ‡ = supposé.</p>
    <svg width="2200" height="930"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="${ox - W * k}" y="150" class="t">Vu du côté des fourches (bouts des boîtes)</text>${face}
    <text x="${oz - D * k}" y="150" class="t">Vu de côté (deux arceaux séparés)</text>${cote}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
