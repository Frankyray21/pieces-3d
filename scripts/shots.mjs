// Captures de non-régression des modèles 3D (navigateur Chromium via Playwright).
// Pour chaque page : vue assemblée, vue éclatée et vue en coupe, enregistrées
// dans le dossier de sortie ; avec --ref, chaque capture est comparée à celle du
// même nom dans le dossier de référence (part de pixels qui diffèrent).
//
// Usage (serveur de développement lancé : npm run dev) :
//   node scripts/shots.mjs --eq epiroc-ith --out scratch/shots/ref P064 P065
//   node scripts/shots.mjs --eq epiroc-ith --out scratch/shots/new --ref scratch/shots/ref P064 P065
// Options : --url http://localhost:5173 · --views a,e,s · --max-diff 1 (%) · --size 1800x900
// Playwright n'est pas une dépendance du projet : variable PW = chemin du paquet
// installé (ex. PW=$(npm root -g)/playwright).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const eq = opt('eq', 'epiroc-ith');
const out = opt('out', 'scratch/shots/new');
const ref = opt('ref', null);
const base = opt('url', 'http://localhost:5173');
const views = opt('views', 'a,e,s').split(',');
const maxDiff = parseFloat(opt('max-diff', '1'));
const [w, h] = opt('size', '1800x900').split('x').map(Number);
const ids = args.length ? args : Object.keys(JSON.parse(readFileSync(new URL(`../public/equipment/${eq}/data.json`, import.meta.url), 'utf8')).assemblies);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const settle = (ms) => page.waitForTimeout(ms);
const ready = () => page.waitForFunction(() => document.querySelector('#loading')?.hidden !== false, null, { timeout: 120000 });
const pressed = (sel) => page.$eval(sel, (b) => b.getAttribute('aria-pressed') === 'true');
// Page d'accueil (view.home) : ni éclatement ni coupe, leurs boutons sont masqués.
const shown = (sel) => page.isVisible(sel);

await page.goto(`${base}/#${eq}.${ids[0]}`, { waitUntil: 'networkidle' });
const shots = [];
for (const id of ids) {
  await page.evaluate((hash) => { location.hash = hash; }, `${eq}.${id}`);
  await settle(300);
  await ready();
  if (!(await page.$('#viewport:not([hidden]) canvas'))) { console.log(`– ${id} : pas de 3D`); continue; }
  // Bulles de repères toujours affichées, coupe éteinte, assemblé.
  if (!(await pressed('#btn-labels'))) await page.click('#btn-labels');
  if (await pressed('#btn-section')) await page.click('#btn-section');
  const home = !(await shown('#btn-explode'));
  if (!home) await page.click('#btn-assemble');
  await settle(1200);
  const grab = async (v) => {
    const file = join(out, `${id}-${v}.png`);
    await page.locator('#stage').screenshot({ path: file, timeout: 60000 });
    shots.push({ id, v, file });
  };
  if (views.includes('a')) await grab('a');
  if (home) console.log(`– ${id} : page d'accueil, vue assemblée seulement`);
  else if (views.includes('e')) { await page.click('#btn-explode'); await settle(1800); await grab('e'); await page.click('#btn-assemble'); await settle(1200); }
  if (!home && views.includes('s')) { await page.click('#btn-section'); await settle(1200); await grab('s'); await page.click('#btn-section'); }
  console.log(`✓ ${id}`);
}

let failed = errors.length > 0;
if (ref) {
  // Comparaison dans le navigateur (canvas) : pas de dépendance d'image côté Node.
  const cmp = await browser.newPage();
  for (const s of shots) {
    const old = join(ref, `${s.id}-${s.v}.png`);
    if (!existsSync(old)) { console.log(`? ${s.id}-${s.v} : pas de référence`); continue; }
    const pct = await cmp.evaluate(async ([a, b]) => {
      const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return 100;
      const px = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        return g.getImageData(0, 0, c.width, c.height).data;
      };
      const da = px(ia), db = px(ib);
      let n = 0;
      for (let k = 0; k < da.length; k += 4) {
        if (Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]) > 48) n++;
      }
      return (100 * n) / (da.length / 4);
    }, [old, s.file].map((f) => `data:image/png;base64,${readFileSync(f).toString('base64')}`));
    const bad = pct > maxDiff;
    if (bad) failed = true;
    console.log(`${bad ? '≠' : '='} ${s.id}-${s.v} : ${pct.toFixed(2)} % de pixels différents`);
  }
}
if (errors.length) console.log(`Erreurs de la page :\n${[...new Set(errors)].join('\n')}`);
await browser.close();
process.exit(failed ? 1 : 0);
