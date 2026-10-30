// Export de la vidéo du plancher pour Blender : scène complète (scene.glb) et animation
// image par image (anim.json : changements des objets, caméra, transparence de la cage).
//   PW=$(npm root -g)/playwright node scripts/blender-export.mjs --out scratch/blender --url http://localhost:5174
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const out = opt('out', 'scratch/blender');
const base = opt('url', 'http://localhost:5173');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('page:', e.message));
await page.goto(`${base}/video-plancher.html?capture&scale=0.25&ao=0`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });
const glb = await page.evaluate(() => window.__blenderScene());
writeFileSync(join(out, 'scene.glb'), Buffer.from(glb, 'base64'));
const total = Math.round((await page.evaluate(() => window.__video.duration)) * 24);
const anim = { fps: 24, frames: total, changes: [], cam: [], ghost: [] };
for (let f = 0; f < total; f += 1000) {
  const a = await page.evaluate(([x, y]) => window.__blenderAnim(x, y), [f, Math.min(total, f + 1000)]);
  anim.fov = a.fov; anim.aspect = a.aspect;
  anim.changes.push(...a.changes); anim.cam.push(...a.cam); anim.ghost.push(...a.ghost);
}
writeFileSync(join(out, 'anim.json'), JSON.stringify(anim));
console.log(`scene.glb ${(glb.length * 0.75 / 1e6).toFixed(1)} Mo ; ${total} images, ${anim.changes.length} changements`);
await browser.close();
