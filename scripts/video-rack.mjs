// Vidéo de la procédure d'installation du support de tiges (PRO-DD-ST-008).
// Le montage par étapes de la page #rack-tiges-dd.P02 est joué passage par
// passage (src/video/rack-script.js) : bandeau (étape, titre, mots-clés), plans
// de caméra, animations d'étape, repères montrés une idée à la fois, détails
// de la procédure incrustés. Chaque image est calculée sous une horloge
// arrêtée (Playwright clock) puis capturée : 1280 × 720, H.264.
//
// Serveur de développement lancé sans rechargement à chaud :
//   npx vite --config vite.capture.config.js --port 5174
//
// Tournage (images par passage dans <out>/images/<passage>/, puis encodage) :
//   node scripts/video-rack.mjs --out scratch/rack/video [--fps 24] [--url http://localhost:5174]
//   node scripts/video-rack.mjs --out scratch/rack/video --only etape-05,etape-12   (re-tourne ces passages, garde les autres)
//   … --only titre,etape-00 --no-encode    (tournage seul : deux tournages en parallèle se partagent les passages)
//   node scripts/video-rack.mjs --out scratch/rack/video --encode-only [--voix video/rack/voix.mp3]
//
// Réglage des plans (serveur d'images fixes, une page gardée ouverte) :
//   node scripts/video-rack.mjs --serve 5180
//   GET /still?seg=etape-05&t=3.5&out=/chemin/a.jpg       image du passage à l'instant t, telle que dans la vidéo
//   GET /still?step=5&pos=x,y,z&tgt=x,y,z&out=/chemin/b.jpg   étape 5 posée, caméra donnée (step=all : tout affiché)
//        options : fov=20 (angle de champ, 38 par défaut) · anim=0..1 (avancement de l'animation de l'étape)
//                  tags=a,b (thèmes de repères affichés ; « - » : comme sur le site) · hide=M (pièces masquées)
//                  band=0 (sans bandeau) · labels=1 (repères)
//   GET /reload          recharge la page (après une modification du modèle ou du scénario)
//   GET /segments        passages du scénario (identifiant, étape, début, durée, plans)
//   GET /eval?js=…       exécute du code dans la page (essais d'ambiance : fond, lumières)
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, existsSync, readdirSync, symlinkSync, linkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { join, resolve, dirname } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const out = opt('out', 'scratch/rack/video');
const base = opt('url', 'http://localhost:5174');
const FPS = Number(opt('fps', '24'));
const only = opt('only') ? opt('only').split(',') : null;
const voix = opt('voix');
const servePort = opt('serve');
const mp4 = opt('render', join(out, 'installation-support-tiges.mp4'));
const frames = join(out, 'images');

// Scénario relu à chaque rechargement (le serveur d'images suit les modifications).
let script = await import('../src/video/rack-script.js');
let segs = script.timeline();
async function reloadScript() {
  script = await import(`../src/video/rack-script.js?v=${process.hrtime.bigint()}`);
  segs = script.timeline();
}

const CSS = `
  .topbar, #rail, #panel, #mtabs, #toast, #dock, #stage > :not(#viewport) { display: none !important; }
  /* Ambiance de mine : fond sombre (les bords coupés du décor s'y perdent), léger vignettage. */
  #stage { position: fixed !important; inset: 0 !important; z-index: 50; background: radial-gradient(110% 85% at 50% 35%, #232a31, #06080a) !important; }
  #stage::after { content: ''; position: absolute; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(0, 0, 0, .42) 100%); }
  #vband { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 30px 34px 20px; color: #fff;
    background: linear-gradient(to top, rgba(14,18,24,.95) 60%, rgba(14,18,24,0)); font-family: 'IBM Plex Sans', sans-serif; }
  #vband.off { display: none; }
  #vband .n { font: 600 17px 'IBM Plex Mono', monospace; color: #ff9d4d; letter-spacing: .06em; text-transform: uppercase; }
  #vband .t { font: 700 36px 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: .02em; margin: 2px 0 4px; }
  #vband .x { font-size: 21px; line-height: 1.35; max-width: 56em; color: #e8ecf1; }
  #vbadge { position: fixed; top: 24px; left: 30px; z-index: 61; font: 600 16px 'IBM Plex Mono', monospace; letter-spacing: .08em; text-transform: uppercase;
    color: #10151b; background: #ff9d4d; padding: 6px 12px; border-radius: 5px; display: none; }
  #vinset, #vcard { position: fixed; top: 26px; right: 28px; z-index: 61; opacity: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 34px rgba(0, 0, 0, .55); }
  #vinset { width: 500px; background: #fff; border: 2px solid #ff9d4d; }
  #vinset .i { background-repeat: no-repeat; background-color: #fff; }
  #vinset .c { font: 600 15px 'IBM Plex Sans', sans-serif; color: #fff; background: #1b222b; padding: 7px 12px; }
  #vcard { min-width: 400px; background: rgba(16, 21, 27, .93); border: 1px solid rgba(255, 157, 77, .7); color: #fff; font-family: 'IBM Plex Sans', sans-serif; padding: 14px 20px 16px; }
  #vcard .h { font: 600 15px 'IBM Plex Mono', monospace; color: #ff9d4d; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 8px; }
  #vcard table { border-collapse: collapse; width: 100%; }
  #vcard td { padding: 6px 18px 6px 0; font-size: 23px; line-height: 1.25; vertical-align: baseline; }
  #vcard td:first-child { font: 700 27px 'Barlow Condensed', sans-serif; letter-spacing: .03em; text-transform: uppercase; color: #ffd0a6; white-space: nowrap; }
  #vcard td:last-child { padding-right: 0; }
  .balloon.caption.note { font-size: 17px !important; font-weight: 600; padding: 6px 11px !important; max-width: 22em !important; }
`;

/** Ouvre la page du montage, horloge arrêtée ; le rendu 3D est fait une fois par image, à la demande. */
async function open() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('ERREUR', e.message));
  await page.clock.install();
  const ctx = { browser, page, inSteps: false, at: -1, tags: 'null', hide: '[]', over: '', busy: false, camKey: '', last: null, count: { rendues: 0, habillées: 0, reprises: 0 } };
  ctx.load = async (first) => {
    if (first) await page.goto(`${base}/#rack-tiges-dd.P02`, { waitUntil: 'networkidle' });
    else { await page.clock.resume(); await page.reload({ waitUntil: 'networkidle' }); }
    await page.waitForFunction(() => window.viewer?.model && document.querySelector('#stepsbar') && !document.querySelector('#stepsbar').hidden, null, { timeout: 180000, polling: 200 });
    await page.addStyleTag({ content: CSS });
    await page.evaluate(() => {
      const add = (id, html) => { const e = document.createElement('div'); e.id = id; e.innerHTML = html; document.body.append(e); return e; };
      add('vband', '<div class="n"></div><div class="t"></div><div class="x"></div>');
      const badge = add('vbadge', '');
      const ins = add('vinset', '<div class="i"></div><div class="c"></div>');
      const card = add('vcard', '<div class="h"></div><table></table>');
      window.__badge = (text) => { badge.style.display = text ? 'block' : 'none'; badge.textContent = text || ''; };
      // Incrustation d'un détail d'une page de la procédure : { url, crop: [x0, y0, x1, y1], w, ratio, caption, alpha }.
      window.__inset = (o) => {
        ins.style.opacity = o ? o.alpha : 0;
        const key = o && JSON.stringify([o.url, o.crop, o.w]);
        if (!o || ins.dataset.key === key) return;
        ins.dataset.key = key;
        const w = o.w || 500, [x0, y0, x1, y1] = o.crop, sx = w / (x1 - x0), sy = sx * o.ratio;
        ins.style.width = `${w}px`;
        const i = ins.querySelector('.i');
        i.style.cssText = `width:${w}px;height:${Math.round((y1 - y0) * sy)}px;background-image:url(${o.url});background-size:${sx}px ${sy}px;background-position:${-x0 * sx}px ${-y0 * sy}px`;
        ins.querySelector('.c').textContent = o.caption || '';
      };
      // Carton : { title, rows: [{ cells, alpha }], alpha }.
      window.__card = (o) => {
        card.style.opacity = o ? o.alpha : 0;
        if (!o) return;
        card.querySelector('.h').textContent = o.title;
        const tb = card.querySelector('table');
        if (tb.dataset.n !== String(o.rows.length) || tb.dataset.t !== o.title) {
          tb.dataset.n = o.rows.length; tb.dataset.t = o.title;
          tb.innerHTML = o.rows.map((r) => `<tr>${r.cells.map((c) => `<td></td>`).join('')}</tr>`).join('');
          o.rows.forEach((r, i) => r.cells.forEach((c, j) => { tb.rows[i].cells[j].textContent = c; }));
        }
        o.rows.forEach((r, i) => { tb.rows[i].style.opacity = r.alpha; });
      };
      const lab = document.querySelector('#btn-labels');
      if (lab.getAttribute('aria-pressed') === 'true') lab.click();
      window.dispatchEvent(new Event('resize'));
      // Rendu différé : les étapes d'animation tournent à chaque tic d'horloge,
      // l'image n'est dessinée qu'une fois, juste avant la capture.
      const v = window.viewer;
      const real = v._render.bind(v);
      v._render = () => { window.__want = true; };
      v._measure = () => {}; // pas de baisse de qualité automatique pendant la capture
      window.__flush = () => { real(!!v.post); window.__want = false; };
      v.grid.visible = false; // pas de grille de sol : le chantier a son plancher
      const FOV = v.camera.fov;
      window.__cam = (pos, tgt, fov) => {
        if (v.camera.fov !== (fov || FOV)) { v.camera.fov = fov || FOV; v.camera.updateProjectionMatrix(); }
        v.lookAt(pos, tgt, { instant: true });
      };
      // Durées d'origine des animations d'étape (le scénario peut les régler pour un passage).
      window.__anims = () => (v._stepAnims || []).map((a) => { a.__base = a.__base || { delay: a.delay, dur: a.dur }; return a; });
    });
    // Horloge arrêtée : le temps n'avance plus que par runFor.
    await page.clock.pauseAt(new Date(Date.now() + 3000));
    await page.clock.runFor(500);
    Object.assign(ctx, { inSteps: true, at: 0, tags: 'null', hide: '[]', over: '', busy: false, camKey: '', last: null }); // la page s'ouvre en montage par étapes, à l'étape 0
  };
  await ctx.load(true);
  return ctx;
}

const click = (ctx, sel) => ctx.page.evaluate((s) => document.querySelector(s).click(), sel);
const jump = (ctx, k) => ctx.page.evaluate((n) => { const r = document.querySelector('#st-range'); r.value = n; r.dispatchEvent(new Event('input')); }, k);

/** Bandeau du passage (ou masqué). */
const band = (ctx, s) => ctx.page.evaluate((b) => {
  const el = document.querySelector('#vband');
  el.classList.toggle('off', !b);
  if (!b) return;
  el.querySelector('.n').textContent = b.num; el.querySelector('.t').textContent = b.title; el.querySelector('.x').textContent = b.text;
}, s ? { num: s.num, title: s.title, text: s.text } : null);

/** Étape n affichée sans animation (null : montage fermé, tout est affiché). */
async function showStep(ctx, n) {
  if (n == null) {
    if (ctx.inSteps) { await click(ctx, '#st-close'); ctx.inSteps = false; ctx.at = -1; }
    return;
  }
  if (!ctx.inSteps) { await click(ctx, '#btn-steps'); ctx.inSteps = true; }
  await jump(ctx, n);
  ctx.at = n;
}

/** Durées des animations de l'étape n pour ce passage (s.anim), sinon celles du modèle. */
const timing = (ctx, n, anim) => ctx.page.evaluate(([k, o]) => {
  for (const a of window.__anims()) if (a.step === k) Object.assign(a, a.__base, o || {});
}, [n, anim || null]);

/** Début d'un passage : son étape arrive avec ses animations (pose des pièces, animation d'étape). */
async function enter(ctx, s) {
  if (s.step == null) { await showStep(ctx, null); return; }
  if (!ctx.inSteps) { await click(ctx, '#btn-steps'); ctx.inSteps = true; ctx.at = 0; }
  await timing(ctx, s.step, s.anim);
  if (s.step === 0) { await jump(ctx, 0); await click(ctx, '#st-replay'); ctx.at = 0; return; }
  if (ctx.at !== s.step - 1) await jump(ctx, s.step - 1);
  await click(ctx, '#st-next');
  ctx.at = s.step;
}

const fade = (t, from, to, d = 0.4) => Math.max(0, Math.min(1, (t - from) / d, (to - t) / d));

/**
 * Habillage du passage à l'instant t : thèmes de repères, pièces masquées, pastille du plan,
 * incrustation, carton. Retourne ce qui a changé : { scene } la 3D, { overlay } l'habillage.
 */
async function dress(ctx, s, t) {
  let scene = false;
  const tags = JSON.stringify(script.tagsAt(s, t));
  if (tags !== ctx.tags) { ctx.tags = tags; scene = true; await ctx.page.evaluate((x) => window.viewer.setStepTags(x), JSON.parse(tags)); }
  const shot = script.shotAt(s, t);
  // Pièces masquées pendant le plan (hide : repères de la liste, ex. la paroi pour une vue en coupe).
  const hide = JSON.stringify(shot.hide || []);
  if (hide !== ctx.hide) {
    ctx.hide = hide; scene = true;
    await ctx.page.evaluate((refs) => {
      const v = window.viewer;
      for (const r of window.__hidden || []) if (!refs.includes(r)) for (const o of v.model.refs.get(r) || []) o.visible = true;
      for (const r of refs) for (const o of v.model.refs.get(r) || []) o.visible = false;
      window.__hidden = refs;
      v.invalidate();
    }, shot.hide || []);
  }
  const i = s.inset, onI = !!i && t >= i.from && t < i.to;
  const c = s.card, onC = !!c && t >= c.from && t < c.to;
  const inset = onI ? { url: `${base}/equipment/rack-tiges-dd/pages/${i.page}.webp`, crop: i.crop, w: i.w, ratio: i.ratio || 1705 / 1318, caption: i.caption, alpha: fade(t, i.from, i.to) } : null;
  const card = onC ? { title: c.title, alpha: fade(t, c.from, c.to), rows: c.rows.map((r) => ({ cells: r.cells, alpha: fade(t, c.from + (r.t || 0), 1e9) })) } : null;
  const over = JSON.stringify([shot.badge || null, inset, card]);
  const overlay = over !== ctx.over;
  if (overlay) {
    ctx.over = over;
    await ctx.page.evaluate(([b, x, y]) => { window.__badge(b); window.__inset(x); window.__card(y); }, [shot.badge || null, inset, card]);
  }
  return { scene, overlay };
}

/**
 * Une image : caméra posée, horloge avancée de dt, puis seulement ce qu'il faut refaire. Le rendu 3D
 * (coûteux) n'est refait que si la scène a changé : caméra, animation en cours, étape, repères. La
 * capture de la page n'est refaite que si l'écran a changé ; sinon l'image précédente est reprise (lien).
 */
async function shoot(ctx, cam, dt, file, { scene = false, overlay = false } = {}) {
  const key = JSON.stringify([cam.pos, cam.tgt, cam.fov]);
  await ctx.page.evaluate(([p, t, f]) => window.__cam(p, t, f), [cam.pos, cam.tgt, cam.fov]);
  await ctx.page.clock.runFor(dt);
  // La caméra de l'étape (interface) ne doit pas reprendre la main entre deux images.
  const busy = await ctx.page.evaluate(([p, t, f]) => { window.__cam(p, t, f); return window.viewer.tweens.some((x) => x.kind !== 'camera'); }, [cam.pos, cam.tgt, cam.fov]);
  const render = scene || busy || ctx.busy || key !== ctx.camKey || !ctx.last;
  ctx.busy = busy;
  ctx.camKey = key;
  if (render) await ctx.page.evaluate(() => window.__flush());
  if (render || overlay) {
    await ctx.page.screenshot({ path: file, type: 'jpeg', quality: 92, timeout: 240000 });
    ctx.last = file;
    ctx.count[render ? 'rendues' : 'habillées']++;
  } else {
    linkSync(ctx.last, file);
    ctx.count.reprises++;
  }
}

const vec = (s) => s.split(',').map(Number);

if (servePort) {
  // Sous SIGTERM, Playwright ferme le navigateur ; le serveur doit s'arrêter aussi.
  for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => process.exit(0));
  const ctx = await open();
  let queue = Promise.resolve();
  const handle = async (url) => {
    const q = url.searchParams;
    if (url.pathname === '/reload') { await reloadScript(); await ctx.load(false); return { ok: true, segments: segs.length }; }
    if (url.pathname === '/segments') return segs.map((s) => ({ id: s.id, step: s.step, start: s.start, dur: s.dur, num: s.num, title: s.title, text: s.text, voix: s.voix, shots: s.shots, reveal: s.reveal, cues: s.cues }));
    // Essais de rendu (réglage de l'ambiance) : code exécuté dans la page.
    if (url.pathname === '/eval') return { ok: true, value: await ctx.page.evaluate(q.get('js')) };
    if (url.pathname !== '/still') throw new Error('Routes : /still, /segments, /reload, /eval');
    const file = resolve(q.get('out') || join(out, 'still.jpg'));
    mkdirSync(dirname(file), { recursive: true });
    let cam, s = null;
    if (q.get('seg')) {
      const i = segs.findIndex((x) => x.id === q.get('seg'));
      if (i < 0) throw new Error(`Passage inconnu : ${q.get('seg')}`);
      s = segs[i];
      const t = Math.min(s.dur, Number(q.get('t') || 0));
      cam = script.cameraAt(segs, i, t);
      const st = script.stepAt(s, t);
      await showStep(ctx, st);
      await dress(ctx, s, t);
      // Animation de l'étape à l'instant t du passage (état final si elle est terminée ou si l'étape est un rappel).
      if (st != null) {
        await ctx.page.evaluate(([n, ms, o, done]) => {
          const v = window.viewer;
          for (const a of window.__anims()) if (a.step === n) { const d = { ...a.__base, ...(o || {}) }; a.update(done ? 1 : Math.max(0, Math.min(1, (ms - (d.delay || 0)) / (d.dur || 3000)))); }
          v.invalidate();
        }, [st, t * 1000, s.anim || null, !!s.still || st !== s.step]);
      }
    } else {
      const st = q.get('step') ?? 'all';
      const n = st === 'all' ? null : Number(st);
      await showStep(ctx, n);
      s = segs.find((x) => x.step === n) || segs[0];
      cam = { pos: vec(q.get('pos')), tgt: vec(q.get('tgt')), fov: q.get('fov') ? Number(q.get('fov')) : undefined };
      const tags = !q.get('tags') || q.get('tags') === '-' ? null : q.get('tags').split(',');
      const hide = q.get('hide') ? q.get('hide').split(',') : [];
      await ctx.page.evaluate(([x, h]) => {
        const v = window.viewer;
        v.setStepTags(x); window.__badge(null); window.__inset(null); window.__card(null);
        for (const r of window.__hidden || []) for (const o of v.model.refs.get(r) || []) o.visible = true;
        for (const r of h) for (const o of v.model.refs.get(r) || []) o.visible = false;
        window.__hidden = h;
      }, [tags, hide]);
      Object.assign(ctx, { tags: JSON.stringify(tags), hide: JSON.stringify(hide), over: '' });
      if (q.get('anim') != null && n != null) await ctx.page.evaluate(([k, a]) => { for (const x of window.__anims()) if (x.step === k) x.update(a); window.viewer.invalidate(); }, [n, Number(q.get('anim'))]);
    }
    await band(ctx, q.get('band') === '0' ? null : s);
    const lab = await ctx.page.evaluate(() => document.querySelector('#btn-labels').getAttribute('aria-pressed') === 'true');
    if (lab !== (q.get('labels') === '1')) await click(ctx, '#btn-labels');
    ctx.last = null; // image fixe : toujours rendue et capturée
    await shoot(ctx, cam, 400, file);
    return { ok: true, out: file, cam };
  };
  createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    queue = queue.then(() => handle(url)).then(
      (r) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(`${JSON.stringify(r)}\n`); },
      (e) => { res.writeHead(500, { 'content-type': 'application/json' }); res.end(`${JSON.stringify({ ok: false, error: String(e.message || e) })}\n`); },
    );
  }).listen(Number(servePort), () => console.log(`Images fixes : http://localhost:${servePort}/still?seg=titre&t=0&out=…`));
} else {
  if (!args.includes('--encode-only')) {
    const ctx = await open();
    const t0 = Date.now();
    for (const [i, s] of segs.entries()) {
      if (only && !only.includes(s.id)) continue;
      const dir = join(frames, s.id);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      // still : l'étape est affichée sans animation (rappel) ; sinon elle arrive avec ses animations.
      if (s.still) await showStep(ctx, s.step); else await enter(ctx, s);
      await band(ctx, s);
      const count = Math.round(s.dur * FPS);
      let cur = s.step;
      ctx.last = null; // nouveau passage, nouveau bandeau : première image toujours rendue
      ctx.count = { rendues: 0, habillées: 0, reprises: 0 };
      for (let f = 0; f < count; f++) {
        const t = f / FPS, st = script.stepAt(s, t);
        const stepped = st !== cur;
        if (stepped) { await showStep(ctx, st); cur = st; }
        const d = await dress(ctx, s, t);
        await shoot(ctx, script.cameraAt(segs, i, t), 1000 / FPS, join(dir, `f${String(f).padStart(5, '0')}.jpg`), { scene: d.scene || stepped, overlay: d.overlay });
      }
      console.log(`${s.id} : ${count} images, dont ${ctx.count.rendues} rendues, ${ctx.count['habillées']} habillées, ${ctx.count.reprises} reprises (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    await ctx.browser.close();
  }
  // --no-encode : tournage seul (plusieurs tournages en parallèle, chacun ses passages, puis un seul encodage).
  if (args.includes('--no-encode')) process.exit(0);
  // Encodage : les passages bout à bout, dans l'ordre du scénario (suite d'images numérotée par liens).
  const seq = join(out, 'suite');
  rmSync(seq, { recursive: true, force: true });
  mkdirSync(seq, { recursive: true });
  let n = 0;
  for (const s of segs) {
    const dir = join(frames, s.id);
    if (!existsSync(dir)) throw new Error(`Passage non tourné : ${s.id}`);
    const want = Math.round(s.dur * FPS);
    const files = readdirSync(dir).filter((x) => x.endsWith('.jpg')).sort();
    if (files.length !== want) throw new Error(`${s.id} : ${files.length} images, ${want} attendues (passage à re-tourner : --only ${s.id})`);
    for (const f of files) symlinkSync(resolve(dir, f), join(seq, `f${String(n++).padStart(6, '0')}.jpg`));
  }
  const audio = voix ? ['-i', voix, '-c:a', 'aac', '-b:a', '128k', '-shortest'] : [];
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(seq, 'f%06d.jpg'), ...audio, '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
  rmSync(seq, { recursive: true, force: true });
  console.log(`→ ${mp4} (${n} images, ${(n / FPS).toFixed(1)} s)`);
}
