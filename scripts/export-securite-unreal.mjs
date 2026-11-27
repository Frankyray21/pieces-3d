// Exporte pour Unreal Engine (ou Blender) chaque article du lot de sécurité de la
// place de travail, avec ses textures d'usure, dans public/equipment/securite-chantier/unreal/ :
// un GLB par article (SM_*.glb), l'ensemble du cadenassage, le harnais avec sa longe
// et le lot complet (Lot_Securite_Complet.glb), plus index.json (tailles, triangles).
//
// Unités : mètres, Y vers le haut, origine au sol (glTF). Unreal convertit à l'import
// (centimètres, Z vers le haut) ; garder l'échelle 1.
//
// Les textures sont dessinées sur des canevas : l'export se fait dans Chromium
// (Playwright), sur le serveur de développement.
// Usage : npm run dev, puis node scripts/export-securite-unreal.mjs [--url http://localhost:5173] [noms…]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const at = args.indexOf('--url');
const base = at >= 0 ? args.splice(at, 2)[1] : 'http://localhost:5173';
const out = 'public/equipment/securite-chantier/unreal';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
const noms = args.length ? args : await page.evaluate(async () => (await import('/scripts/export-securite-page.js')).noms());
const index = { unites: 'mètres, Y vers le haut, origine au sol (glTF) ; Unreal : échelle d\'import 1', fichiers: {} };
for (const nom of noms) {
  const r = await page.evaluate(async (n) => (await import('/scripts/export-securite-page.js')).exporter(n), nom);
  const buf = Buffer.from(r.data, 'base64');
  writeFileSync(join(out, `${nom}.glb`), buf);
  index.fichiers[`${nom}.glb`] = { octets: buf.length, triangles: r.tris, taille_m: r.taille };
  console.log(`${nom}.glb : ${(buf.length / 1e6).toFixed(2)} Mo, ${r.tris} triangles, ${r.taille.join(' × ')} m`);
}
if (!args.length) writeFileSync(join(out, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
if (erreurs.length) console.log(erreurs.join('\n'));
await browser.close();
