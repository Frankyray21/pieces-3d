// Régénère src/models/<eq>/parts/index.js : un builder par fichier Pxxx.js du
// dossier parts/ (un assemblage du manuel par fichier, export par défaut).
// Usage : node scripts/parts-index.mjs du311
import { readdirSync, writeFileSync } from 'node:fs';

const eq = process.argv[2] || 'du311';
const dir = new URL(`../src/models/${eq}/parts/`, import.meta.url);
const ids = readdirSync(dir).filter((f) => /^P\d{3}[A-Z0-9-]*\.js$/.test(f)).map((f) => f.slice(0, -3)).sort();
const name = (id) => id.replace(/-/g, '_');
writeFileSync(new URL('index.js', dir), `// Généré par scripts/parts-index.mjs — ne pas modifier à la main.
// Un builder par assemblage du manuel (voir README.md dans ce dossier).
${ids.map((id) => `import ${name(id)} from './${id}.js';`).join('\n')}

export default {${ids.length ? `\n${ids.map((id) => `  '${id}': ${name(id)},`).join('\n')}\n` : ''}};
`);
console.log(`src/models/${eq}/parts/index.js : ${ids.length} assemblages`);
