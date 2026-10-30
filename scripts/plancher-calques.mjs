// Calques 2D de la vidéo du plancher (bandeau des étapes, carton d'étape,
// encadré « Pourquoi », carton titre, carton « À retenir », étiquette) : HTML
// et CSS communs au montage HyperFrames (scripts/video-plancher-hf.mjs) et au
// montage direct (scripts/video-plancher-montage.mjs).
import { RETENIR, stepCard, STEP_CARD } from '../src/video/plancher-script.js';
import { V8_BAND } from '../src/video/plancher-v8.js';

export const W = 1280, H = 720, H3 = 540;
export const FONTS = [
  ['Barlow Condensed', 600, 'barlow-condensed', 'barlow-condensed-latin-600-normal.woff2'],
  ['Barlow Condensed', 700, 'barlow-condensed', 'barlow-condensed-latin-700-normal.woff2'],
  ['IBM Plex Sans', 400, 'ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2'],
  ['IBM Plex Sans', 600, 'ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2'],
  ['IBM Plex Mono', 500, 'ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2'],
];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const S = (x) => (+x.toFixed(4)).toString();

/**
 * Calques de la vidéo.
 * @param segs   chronologie (timeline())
 * @param fits   tailles de police du bandeau mesurées dans la page de capture
 * @param fontCss règles @font-face
 * @param video  (s, i) => balise de la 3D du segment (HyperFrames), facultatif
 * @returns { css, layers, subs } : layers = éléments de premier niveau (data-start,
 *   data-duration), subs = [id, corps] des calques à plusieurs éléments, montés
 *   dans l'hôte de même id.
 */
export function calques({ segs, fits = [], fontCss = '', video = null }) {
  const STEPS = Array.from({ length: 18 }, (_, i) => String(i + 1));
  const label = (b) => (b.n === '' ? '' : b.n === '0' ? 'Avant' : b.n === '18' ? 'Plancher secondaire' : `Étape ${b.n}`);
  const bar = (s) => STEPS.map((k) => {
    const n = Number(s.band.n), kk = Number(k);
    const cls = s.band.n !== '' && kk === n ? 'on' : (s.band.n !== '' && kk < n) || s.id === 'demont' || s.id === 'fin' ? 'done' : '';
    return `<i class="${cls}">${k}</i>`;
  }).join('');
  // Fondu : animation CSS calée sur le temps local du calque (délai 0 = début du calque).
  const anim = (name, at, d) => `animation: ${name} ${S(d)}s linear ${S(at)}s both;`;
  const keys = [];
  let K = 0;
  const inOut = (at, d, fin = 0.5, fout = 0.4) => {
    const name = `io${K++}`;
    const a = (100 * fin) / d, b = 100 - (100 * fout) / d;
    keys.push(`@keyframes ${name} { 0% { opacity: 0; } ${S(a)}% { opacity: 1; } ${S(b)}% { opacity: 1; } 100% { opacity: 0; } }`);
    return anim(name, at, d);
  };

  const L = [];
  const SUBS = [];
  function sub(id, at, d, track, body) {
    SUBS.push([id, body]);
    L.push(`<div id="${id}" class="clip hote" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${S(at)}" data-duration="${S(d)}" data-track-index="${track}" data-width="${W}" data-height="${H}" data-no-timeline></div>`);
  }
  segs.forEach((s, i) => {
    const id = String(i).padStart(2, '0');
    if (video) L.push(video(s, i));
    const bStart = s.card === 'title' ? s.start + s.dur * 0.55 : s.start;
    const b = s.band;
    const bLen = s.start + s.dur - bStart;
    const fit = (txt, max, min, ref) => Math.max(min, Math.min(max, +(max * Math.sqrt(ref / Math.max(1, txt.length))).toFixed(1)));
    sub(`b${id}`, bStart, bLen, 1, `<div class="band">`
      + `<div class="bar">${bar(s)}</div><div class="head" style="${anim('fadein', 0, 0.35)}"><span class="num">${esc(label(b))}</span><span class="title">${b.n === '18' ? '' : esc(b.title)}</span></div>`
      + `<div class="text" style="font-size:${fits[i]?.text ?? fit(b.text, 22, 15, 150)}px;${anim('fadein', 0, 0.35)}">${esc(b.text)}</div>`
      + `<div class="detail" style="font-size:${fits[i]?.detail ?? fit(b.detail, 17, 13, 130)}px;${anim('fadein', 0, 0.35)}">${esc(b.detail)}</div></div>`);
    // Encart de la variante 8 pi : son propre bandeau, par-dessus celui de l'étape.
    if (s.insert) {
      const vb = V8_BAND, at = s.start + s.insert.at, d = s.insert.dur;
      sub(`v${id}`, at, d, 1, `<div class="band">`
        + `<div class="bar">${bar(s)}</div><div class="head" style="${anim('fadein', 0, 0.35)}"><span class="num">${esc(vb.label)}</span><span class="title">${esc(vb.title)}</span></div>`
        + `<div class="text" style="font-size:${fit(vb.text, 22, 15, 150)}px;${anim('fadein', 0, 0.35)}">${esc(vb.text)}</div>`
        + `<div class="detail" style="font-size:${fit(vb.detail, 17, 13, 130)}px;${anim('fadein', 0, 0.35)}">${esc(vb.detail)}</div></div>`);
    }
    // Carton d'étape : grand titre au centre de la 3D pendant 2 s.
    const sc = stepCard(s);
    if (sc) {
      const d = STEP_CARD.dur;
      sub(`k${id}`, s.start, d, 4, `<div class="stepcard" style="${anim('kcard', 0, d)}"><div class="sc-n">${esc(sc.big)}</div>${sc.small ? `<div class="sc-t">${esc(sc.small)}</div>` : ''}</div>`);
    }
    if (s.why) {
      const at = s.start + s.whyAt[0], d = s.whyAt[1] - s.whyAt[0];
      L.push(`<div id="w${id}" class="clip why" data-start="${S(at)}" data-duration="${S(d)}" data-track-index="2" style="${inOut(0, d)}"><b>Pourquoi</b><span>${esc(s.why)}</span></div>`);
    }
    if (s.card === 'title') {
      const d = s.dur * 0.55 + 0.6;
      sub(`c${id}`, s.start, d, 3, `<div class="card title" style="${inOut(0, d, 0.01, 0.6)}">`
        + '<small>Procédure de travail · PRO-DD-ST-003</small><h1>Fabrication d’un plancher pour foreuse aux diamants sous terre</h1><p>Machines Roger International · révision juillet 2026</p></div>');
    }
    if (s.card === 'end') {
      const at = s.start + 1.2, d = s.dur - 1.2;
      sub(`c${id}`, at, d, 3, `<div class="card end" style="${anim('fadein', 0, 0.6)}">`
        + `<h2>À retenir</h2><ol>${RETENIR.map((r) => `<li>${esc(r)}</li>`).join('')}</ol><p>Procédure PRO-DD-ST-003 · Modèle 3D : reconstitution d’après la procédure</p></div>`);
    }
  });

  const css = `
${fontCss}
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #15191c; }
#video { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #15191c; color: #f1f3f4; font-family: "IBM Plex Sans", sans-serif; }
.hote { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
.vue3d { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H3}px; object-fit: fill; z-index: 1; }
.tag { position: absolute; top: 16px; right: 18px; z-index: 5; font: 500 15px/1 "IBM Plex Mono", monospace; letter-spacing: .08em; color: rgba(255,255,255,.8); background: rgba(10,12,14,.55); padding: 6px 9px; border-radius: 4px; }
.bandbg { position: absolute; left: 0; top: ${H3}px; width: ${W}px; height: ${H - H3}px; background: #15191c; border-top: 3px solid #f2c230; box-sizing: border-box; z-index: 1; }
.band { position: absolute; left: 0; top: ${H3}px; width: ${W}px; height: ${H - H3}px; box-sizing: border-box; padding: 10px 26px 12px; border-top: 3px solid #f2c230; background: #15191c; z-index: 2; display: grid; grid-template-rows: auto auto 1fr auto; row-gap: 4px; }
.bar { display: flex; gap: 3px; }
.bar i { flex: 1; font: 500 13px/19px "IBM Plex Mono", monospace; font-style: normal; text-align: center; color: #6c767d; background: #232a2f; border-radius: 2px; }
.bar i.done { background: #3b4348; color: #c8cfd3; }
.bar i.on { background: #f2c230; color: #15191c; font-weight: 600; }
.head { display: flex; align-items: baseline; gap: 12px; white-space: nowrap; overflow: hidden; }
.num { font: 700 30px/1.05 "Barlow Condensed", sans-serif; color: #f2c230; text-transform: uppercase; letter-spacing: .02em; }
.title { font: 600 30px/1.05 "Barlow Condensed", sans-serif; }
.text { color: #f2c230; font-size: 22px; line-height: 1.25; overflow: hidden; min-height: 0; }
.detail { color: #c3ccd2; font-size: 17px; line-height: 1.3; overflow: hidden; max-height: 46px; }
.why { position: absolute; top: 16px; left: 18px; width: 470px; z-index: 4; background: rgba(14,17,20,.88); border-left: 5px solid #f2c230; border-radius: 4px; padding: 12px 16px 13px; font-size: 19px; line-height: 1.35; box-sizing: border-box; will-change: transform; }
.why b { display: block; font: 700 19px/1 "Barlow Condensed", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f2c230; margin-bottom: 6px; }
.card { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H3}px; z-index: 3; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; padding: 0 90px; background: linear-gradient(90deg, rgba(12,14,16,.92) 0%, rgba(12,14,16,.78) 55%, rgba(12,14,16,.35) 100%); }
.card.title h1 { font: 700 60px/1.02 "Barlow Condensed", sans-serif; margin: 10px 0 18px; max-width: 900px; text-transform: uppercase; }
.card.title small { font: 500 18px/1 "IBM Plex Mono", monospace; letter-spacing: .12em; color: #f2c230; }
.card.title p { margin: 0; font-size: 22px; color: #a9b3ba; }
.card.end h2 { font: 700 48px/1 "Barlow Condensed", sans-serif; color: #f2c230; text-transform: uppercase; margin: 0 0 22px; }
.card.end ol { margin: 0 0 24px; padding-left: 34px; font-size: 27px; line-height: 1.5; max-width: 980px; }
.card.end li::marker { color: #f2c230; font-weight: 600; }
.card.end p { margin: 0; font-size: 17px; color: #a9b3ba; }
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
@keyframes kcard { 0% { opacity: 0; transform: translateY(14px) scale(.96); } 14% { opacity: 1; transform: none; } 78% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-8px); } }
.stepcard { position: absolute; left: ${STEP_CARD.rect.x}px; top: ${STEP_CARD.rect.y}px; width: ${STEP_CARD.rect.w}px; height: ${STEP_CARD.rect.h}px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: rgba(12,14,16,.9); border-top: 5px solid #f2c230; border-radius: 6px; z-index: 6; }
.sc-n { font: 700 76px/1 "Barlow Condensed", sans-serif; color: #f2c230; text-transform: uppercase; letter-spacing: .03em; }
.sc-t { font: 600 34px/1.1 "Barlow Condensed", sans-serif; color: #f4f6f7; text-align: center; padding: 0 24px; }
${keys.join('\n')}
`;
  return { css, layers: L, subs: SUBS };
}
