// Planches du manuel affichées dans la scène (schémas et listes, assemblages sans 3D) :
//
// - bulles cliquables : chaque bulle de repère lue sur la planche
//   (public/equipment/<id>/bulles.json, « reperes ») sélectionne sa pièce, comme
//   un clic dans la liste (fiche dans le panneau latéral) ; la bulle de la pièce
//   sélectionnée est cerclée ;
// - schémas en couleur par circuit (public/equipment/<id>/schemas.json) :
//   composants des schémas hydrauliques et pneumatiques colorés par circuit,
//   sur la planche (bulles) et dans la liste ; étiquettes des schémas
//   électriques colorées par catégorie ; légende (un clic isole un circuit) ;
//   titre relu de chaque planche ; renvois « to / from » cliquables vers
//   l'échelon cité ; sommaire des circuits, planche par planche.
// Tout vient du manuel : bulles et étiquettes lues par OCR (tools/ocr_pages.py),
// circuits déduits des descriptions de la liste (tools/build_atelier.py).
import './planches.css';

const ID = 'planches';
// Couleurs des circuits : conventions des schémas (pression rouge, retour bleu…), distinctes en deutéranopie.
const COLORS = {
  'electricite-puissance': '#d32f2f', 'electricite-commande': '#1e6fd9', 'electricite-capteurs': '#2e7d32', 'electricite-eclairage': '#e09b00',
  'hydraulique-pompe': '#d32f2f', 'hydraulique-forage': '#ef6c00', 'hydraulique-mise': '#8e24aa', 'hydraulique-porteur': '#2e7d32',
  'hydraulique-carrousel': '#795548', 'hydraulique-retour': '#1e6fd9',
  'air-forage': '#3949ab', 'air-eau': '#0097a7', 'air-huile': '#a1661b', 'air-commande': '#2e7d32',
};
const FAMILLE = { electricite: 'Électricité', hydraulique: 'Hydraulique', air: 'Air comprimé et eau' };

export default {
  id: ID,
  order: 80,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const bulles = () => ctx.equipmentData('bulles');
    const schemas = () => ctx.equipmentData('schemas');
    const eq = () => ctx.equipment;
    const label = (s) => (eq().docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s);
    const dv = () => document.getElementById('docview');
    const refOf = (r) => String(r ?? '').replace(/#\d+$/, '');
    let pending = null; // { sheet, rung } : planche à montrer une fois le schéma affiché
    let iso = ''; // circuit isolé

    /** Famille de circuits d'un schéma (électricité, hydraulique, air) ou null. */
    const famOf = (doc) => schemas()?.documents?.[doc] || null;
    const circuitOf = (doc, ref) => schemas()?.composants?.[doc]?.[refOf(ref)] || null;
    const color = (fam, c) => COLORS[`${fam}-${c}`] || 'var(--muted)';
    /** Planche qui porte l'échelon n (le même schéma d'abord). */
    const rungSheet = (n, doc) => {
      const all = Object.entries(schemas()?.planches || {}).filter(([, v]) => v.rungs && n >= v.rungs[0] && n <= v.rungs[1]);
      return (all.find(([, v]) => v.doc === doc) || all[0] || [null])[0];
    };

    /** Calque d'une planche : bulles, étiquettes colorées, renvois. */
    const overlay = (sheet, doc) => {
      const out = [];
      const fam = famOf(doc);
      const pct = (v) => `${(v * 100).toFixed(2)}%`;
      for (const [ref, x, y, w, h] of bulles()?.reperes?.[sheet] || []) {
        const c = circuitOf(doc, ref);
        out.push(`<button type="button" class="pl-hs" data-ref="${esc(ref)}"${c ? ` data-circ="${c}" style="--cc:${color(fam, c)};` : ' style="'}left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}" aria-label="Repère ${esc(ref)}" title="Réf. ${esc(ref)}"></button>`);
      }
      const p = schemas()?.planches?.[sheet];
      for (const [c, x, y, w, h] of p?.marks || []) {
        out.push(`<span class="pl-mk" data-circ="${c}" style="--cc:${color('electricite', c)};left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}"></span>`);
      }
      for (const [n, x, y, w, h] of p?.xrefs || []) {
        const t = rungSheet(n, p.doc);
        if (t) out.push(`<button type="button" class="pl-xr" data-rung="${n}" style="left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}" title="Aller à l'échelon ${n} (${esc(label(t))})" aria-label="Échelon ${n}, page ${esc(label(t))}"></button>`);
      }
      return out.length ? `<div class="pl-ovl">${out.join('')}</div>` : '';
    };

    /** Compte des composants ou des étiquettes par circuit. */
    const counts = (doc, fam) => {
      const n = {};
      if (fam === 'electricite') for (const v of Object.values(schemas()?.planches || {})) { if (v.doc === doc) (v.marks || []).forEach((m) => { n[m[0]] = (n[m[0]] || 0) + 1; }); }
      else for (const c of Object.values(schemas()?.composants?.[doc] || {})) n[c] = (n[c] || 0) + 1;
      return n;
    };

    /** Bandeau du schéma : légende des circuits et sommaire des planches. */
    const bar = (doc) => {
      const fam = famOf(doc);
      if (!fam) return '';
      const n = counts(doc, fam);
      const chips = (schemas().circuits?.[fam] || []).filter((c) => n[c.id]).map((c) => `<button type="button" class="pl-chip" data-circ="${c.id}" aria-pressed="false" style="--cc:${color(fam, c.id)}"><i></i>${esc(c.name)} <b>${n[c.id]}</b></button>`).join('');
      const som = Object.entries(schemas().planches || {}).filter(([, v]) => v.doc === doc && v.rungs);
      const what = fam === 'electricite' ? 'étiquettes du schéma' : 'composants de la liste';
      if (!chips && !som.length) return '';
      return `<div class="pl-bar">
        ${chips ? `<div class="pl-legend" role="group" aria-label="Circuits"><span class="pl-lt">${icon(fam === 'electricite' ? 'eclair' : 'goutte', { size: 16 })}${esc(FAMILLE[fam])} — circuits <small>(${what} ; un clic isole un circuit)</small></span>${chips}</div>` : ''}
        ${som.length ? `<details class="pl-som"><summary>Circuit par circuit : ${som.length} planches</summary><ol>${som.map(([s, v]) => `<li><button type="button" data-pl-sheet="${esc(s)}"><span class="mono">${esc(label(s))}</span><span>${esc(v.title || 'Planche sans titre lu')}</span><small>éch. ${v.rungs[0]}–${v.rungs[1]}</small></button></li>`).join('')}</ol></details>` : ''}
      </div>`;
    };

    /** Couleur des lignes de la liste d'un schéma (refaite quand la liste est redessinée). */
    const markRows = () => {
      const v = ctx.view;
      const tb = document.getElementById('rows');
      if (!tb || v?.type !== 'document') return;
      const fam = famOf(v.id);
      tb.querySelectorAll('tr[data-key]').forEach((tr) => {
        const c = circuitOf(v.id, tr.dataset.key);
        tr.classList.toggle('pl-circ', !!c);
        if (c) tr.style.setProperty('--cc', color(fam, c));
        tr.classList.toggle('pl-dim', !!iso && c !== iso);
      });
    };
    let rowsObs = null;
    const watchRows = () => {
      rowsObs?.disconnect();
      const tb = document.getElementById('rows');
      if (!tb) return;
      rowsObs = new MutationObserver(markRows);
      rowsObs.observe(tb, { childList: true });
      markRows();
    };

    const isolate = (c) => {
      iso = iso === c ? '' : c;
      const root = dv();
      root.querySelectorAll('.pl-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.circ === iso)));
      root.querySelectorAll('.pl-hs, .pl-mk').forEach((el) => el.classList.toggle('pl-dim', !!iso && el.dataset.circ !== iso));
      markRows();
    };

    const mark = (ref) => dv()?.querySelectorAll('.pl-hs').forEach((b) => b.classList.toggle('on', ref != null && b.dataset.ref === ref));

    /** Montre une planche du schéma affiché (et la ligne de l'échelon demandé). */
    const show = (sheet, rung) => {
      const fig = dv()?.querySelector(`.pl-pg[data-sheet="${CSS.escape(sheet)}"]`)?.closest('figure');
      if (!fig) return;
      const p = schemas()?.planches?.[sheet];
      let y = 0;
      if (rung != null && p?.ry && p.rungs[1] > p.rungs[0]) y = p.ry[0] + (p.ry[1] - p.ry[0]) * (rung - p.rungs[0]) / (p.rungs[1] - p.rungs[0]);
      const img = fig.querySelector('img');
      const top = fig.offsetTop + (img ? img.offsetHeight * y : 0) - (y ? dv().clientHeight * 0.35 : 12);
      dv().scrollTo({ top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      fig.classList.remove('pl-flash'); void fig.offsetWidth; fig.classList.add('pl-flash');
      fig.querySelectorAll('.pl-rung').forEach((m) => m.remove());
      if (y) fig.querySelector('.pl-pg').insertAdjacentHTML('beforeend', `<span class="pl-rung" style="top:${(y * 100).toFixed(2)}%"><b>${rung}</b></span>`);
    };
    const goSheet = (sheet, rung = null) => {
      const doc = ctx.sheetOwner(sheet);
      if (ctx.view?.type === 'document' && ctx.view.id === doc) show(sheet, rung);
      else { pending = { sheet, rung }; ctx.go(doc); }
      if (ctx.narrow()) ctx.ui.setPane('stage');
    };

    /** Habille les planches affichées (une fois par affichage). */
    const decorate = () => {
      const v = ctx.view;
      const root = dv();
      if (!root || root.hidden || !eq()) return;
      const doc = v.type === 'document' ? v.id : null;
      if (doc && !root.querySelector('.pl-bar')) root.insertAdjacentHTML('afterbegin', bar(doc));
      for (const img of root.querySelectorAll('figure > img[data-sheet]')) {
        const s = img.dataset.sheet;
        const ovl = overlay(s, doc || v.id);
        const title = schemas()?.planches?.[s]?.title;
        if (!ovl && !title) continue;
        const pg = document.createElement('div');
        pg.className = 'pl-pg';
        pg.dataset.sheet = s;
        img.replaceWith(pg);
        pg.appendChild(img);
        pg.insertAdjacentHTML('beforeend', ovl);
        const cap = img.closest('figure').querySelector('figcaption .mono');
        if (title && cap) cap.insertAdjacentHTML('afterend', ` · <strong class="pl-title">${esc(title)}</strong>`);
      }
      iso = '';
      watchRows();
      mark(refOf(ctx.selection?.ref));
      if (pending && doc === ctx.sheetOwner(pending.sheet)) {
        const { sheet, rung } = pending;
        pending = null;
        requestAnimationFrame(() => show(sheet, rung));
      }
    };

    // Clics sur les planches (délégués : les planches sont refaites à chaque vue).
    document.addEventListener('click', (e) => {
      const root = dv();
      if (!root || !root.contains(e.target)) return;
      const hs = e.target.closest('.pl-hs');
      if (hs) { e.stopPropagation(); ctx.viewer.select(hs.dataset.ref); return; }
      const xr = e.target.closest('.pl-xr');
      if (xr) {
        e.stopPropagation();
        const t = rungSheet(+xr.dataset.rung, ctx.view?.id);
        if (t) goSheet(t, +xr.dataset.rung);
        return;
      }
      const ch = e.target.closest('.pl-chip');
      if (ch) { isolate(ch.dataset.circ); return; }
      const sh = e.target.closest('[data-pl-sheet]');
      if (sh) goSheet(sh.dataset.plSheet);
    }, true);

    ctx.on('view', (v) => {
      if (v.type === 'document' || (v.type === 'assembly' && !v.is3d)) requestAnimationFrame(decorate);
    });
    ctx.on('select', (d) => mark(d?.row ? refOf(d.ref) : null));
  },
};
