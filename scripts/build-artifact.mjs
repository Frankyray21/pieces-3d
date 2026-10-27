// Produit une page autonome (CSS + JS en ligne) pour la publication en
// Artifact claude.ai : dist-artifact/index.html + les données dans dist/equipment.
// dist-artifact/files.json liste les fichiers de données à publier avec la page.
// Usage : npm run build && node scripts/build-artifact.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Une version d'Artifact contient au plus 511 fichiers (page comprise).
const MAX_FILES = 511;

const dist = 'dist';
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets'));
const js = assets.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');
const app = html.slice(html.indexOf('<!--APP-->') + 10, html.indexOf('<!--/APP-->'));
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>/)[0];

// Fichiers de données. Au-delà de la limite, les pages du manuel qui ne portent
// qu'une liste de pièces d'assemblage sont laissées de côté : leur contenu est
// dans le panneau des pièces, et la page affiche un message à leur place.
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
// Si cela ne suffit pas, les derniers équipements du catalogue sont publiés sans
// les pages de leur manuel (listes, recherche et 3D restent complètes ; la page
// renvoie alors à la version complète du site).
// Données complémentaires (bulles, donnees, entretien, procedures, utilisation, prise-en-main, déclarées par index.json) : inscrites dans la
// page (<script id="extras">, lu par src/data/extras.js) ; elles ne sont pas publiées (limite de fichiers).
const EXTRAS = /\/(?:bulles|donnees|entretien|procedures|utilisation|prise-en-main)\.json$/;
// Pages du manuel de l'utilisateur (utilisation/U001.webp…) : jamais publiées (limite de fichiers) ; le lecteur
// affiche un message avec un lien vers la version complète. Le texte (recherche) et le sommaire restent.
const MANUEL_UTILISATION = /^equipment\/([^/]+)\/utilisation\//;
const all = walk(join(dist, 'equipment')).map((p) => p.slice(dist.length + 1)).filter((p) => !EXTRAS.test(p) && !MANUEL_UTILISATION.test(p)).sort();
const catalogue = JSON.parse(readFileSync(join(dist, 'equipment', 'index.json'), 'utf8')).equipment;
let files = all;
let note = '';
if (all.length + 1 > MAX_FILES) {
  const skip = new Set();
  for (const { id } of catalogue) {
    const data = JSON.parse(readFileSync(join(dist, 'equipment', id, 'data.json'), 'utf8'));
    for (const a of Object.values(data.assemblies)) {
      for (const s of a.lists || []) skip.add(`equipment/${id}/${data.document.pagePattern.replace('{sheet}', s)}`);
    }
  }
  files = all.filter((f) => !skip.has(f));
  note = `${all.length - files.length} pages de liste laissées de côté`;
}
const dropped = [];
for (const { id } of [...catalogue].reverse()) {
  if (files.length + 1 <= MAX_FILES) break;
  files = files.filter((f) => !f.startsWith(`equipment/${id}/pages/`));
  dropped.push(id);
}
if (dropped.length) note += `${note ? ' ; ' : ''}sans pages du manuel : ${dropped.join(', ')}`;
if (files.length + 1 > MAX_FILES) throw new Error(`${files.length + 1} fichiers : au-delà de la limite de ${MAX_FILES}`);

// Pages du manuel non publiées, par équipement (« * » : toutes), inscrites dans
// la page : le site n'en demande pas l'image (aucune erreur 404) et affiche un
// message, avec un lien vers la version complète.
const kept = new Set(files);
const pagesAbsentes = {};
for (const { id } of catalogue) {
  const data = JSON.parse(readFileSync(join(dist, 'equipment', id, 'data.json'), 'utf8'));
  const prefix = `equipment/${id}/`;
  const pages = all.filter((f) => f.startsWith(`${prefix}pages/`));
  const missing = pages.filter((f) => !kept.has(f));
  if (!missing.length) continue;
  if (missing.length === pages.length) { pagesAbsentes[id] = '*'; continue; }
  const [before, after] = data.document.pagePattern.split('{sheet}');
  pagesAbsentes[id] = missing.map((f) => f.slice(prefix.length + before.length, f.length - after.length)).sort();
}
for (const { id, extras: names = [] } of catalogue) if (names.includes('utilisation')) pagesAbsentes[`${id}/utilisation`] = '*';
const publication = JSON.stringify({ pagesAbsentes }).replace(/</g, '\\u003c');
const extras = {};
for (const { id, extras: names = [] } of catalogue) {
  for (const name of names) extras[`${id}/${name}`] = JSON.parse(readFileSync(join(dist, 'equipment', id, `${name}.json`), 'utf8'));
}
const extrasJson = JSON.stringify(extras).replace(/</g, '\\u003c');

// Déclaration d'encodage en tête : servie sans « charset » (aperçu local, serveur statique), la page reste lue en
// UTF-8 (sinon les textes et les expressions régulières du module seraient mal décodés).
const page = `<meta charset="utf-8">
<title>Pièces 3D</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>${css}</style>
<script type="application/json" id="publication">${publication}</script>
<script type="application/json" id="extras">${extrasJson}</script>
${app.trim()}
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
mkdirSync('dist-artifact', { recursive: true });
writeFileSync('dist-artifact/index.html', page);
console.log(`dist-artifact/index.html : ${(page.length / 1024).toFixed(0)} Ko`);

writeFileSync('dist-artifact/files.json', `${JSON.stringify(files, null, 1)}\n`);
const mb = files.reduce((n, f) => n + statSync(join(dist, f)).size, 0) / 1e6;
console.log(`dist-artifact/files.json : ${files.length} fichiers de données (${mb.toFixed(1)} Mo)${note ? `, ${note}` : ''}`);
