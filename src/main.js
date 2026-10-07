import './styles.css';
import { Viewer } from './viewer/Viewer.js';
import { buildProcedural } from './viewer/assembly.js';
import { loadIndex, loadEquipment, search, sourceLabel } from './data/equipment.js';
import { createCart } from './ui/cart.js';
import cubexModels from './models/cubex-mri-5200/index.js';

// Modèles 3D disponibles par équipement (builders procéduraux).
const MODELS = { 'cubex-mri-5200': cubexModels };

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const narrow = () => window.matchMedia('(max-width: 900px)').matches;

const S = {
  index: [],
  eq: null,
  view: null, // { type: 'assembly' | 'document' | 'issues', id }
  selected: null,
  filter: '',
  labels: true,
  isolate: false,
  explode: 0,
};
let viewer = null;
const cart = createCart(() => { renderCartButton(); if (!$('#drawer').hidden) renderDrawer(); refreshAddButtons(); });

try { S.labels = localStorage.getItem('pieces3d.labels') !== '0'; } catch { /* préférence non disponible */ }

// ------------------------------------------------------------------ démarrage

async function init() {
  bindChrome();
  renderCartButton();
  try {
    S.index = await loadIndex();
    S.eq = await loadEquipment(S.index[0].id);
  } catch (err) {
    $('#panel').innerHTML = `<div class="phead"><h1>Chargement impossible</h1><p class="sub">${esc(err.message)}. Vérifiez que les fichiers de données sont publiés avec la page.</p></div>`;
    return;
  }
  renderRail();
  window.addEventListener('hashchange', route);
  route();
}

function route() {
  const token = decodeURIComponent(location.hash.replace(/^#/, ''));
  const eq = S.eq;
  $('#catalogue').hidden = token !== 'catalogue';
  if (token === 'catalogue') { renderCatalogue(); return; }
  if (token === 'controle') return openIssues();
  if (eq.assemblies.has(token)) return openAssembly(token);
  if (eq.documents.has(token)) return openDocument(token);
  openAssembly(eq.root);
}

function go(token) {
  if (location.hash === `#${token}`) route();
  else location.hash = token;
}

// ------------------------------------------------------------------ assemblages 3D

function ensureViewer() {
  if (viewer) return viewer;
  viewer = new Viewer($('#viewport'), {
    onHover: (ref) => markRow(ref, 'hov'),
    onSelect: (ref, { double }) => {
      if (!ref) { select(null); return; }
      const row = rowFor3d(ref);
      if (double && row?.link) { go(row.link); return; }
      select(row ? row.ref : ref, { from3d: true });
    },
  });
  viewer.setLabels(S.labels);
  return viewer;
}

function currentAssembly() {
  return S.view?.type === 'assembly' ? S.eq.assemblies.get(S.view.id) : null;
}

function rowFor3d(ref) {
  const asm = currentAssembly();
  return asm?.parts.find((p) => p.ref === ref) || null;
}

function ref3d(row) {
  return row.mirrorOf || row.ref;
}

async function openAssembly(id, { select: selRef = null } = {}) {
  const eq = S.eq;
  const asm = eq.assemblies.get(id);
  const same = S.view?.type === 'assembly' && S.view.id === id;
  S.view = { type: 'assembly', id };
  S.filter = '';
  $('#docview').hidden = true;
  $('#viewport').hidden = false;
  $('#tools').hidden = false;
  $('#titleblock').hidden = false;
  $('#hint').hidden = false;
  document.title = `${asm.titleFr} · ${eq.name} · Pièces 3D`;
  if (!same) {
    S.selected = null;
    const v = ensureViewer();
    $('#loading').hidden = false;
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    const builders = MODELS[eq.id] || {};
    const model = buildProcedural(builders, id);
    $('#loading').hidden = true;
    if (model) {
      v.setExplode(0, { animate: false });
      v.setModel(model);
      v.setIsolate(S.isolate);
      if (S.explode > 0) {
        v.setExplode(S.explode);
        v.frame({ exploded: S.explode > 0.3 });
      }
    }
  }
  renderRail();
  renderCrumbs();
  renderTitleblock(asm);
  renderPanel();
  if (selRef) select(selRef, { focus: true });
}

// ------------------------------------------------------------------ documents (schémas + listes)

function openDocument(id) {
  const eq = S.eq;
  const doc = eq.documents.get(id);
  S.view = { type: 'document', id };
  S.selected = null;
  S.filter = '';
  document.title = `${doc.titleFr} · ${eq.name} · Pièces 3D`;
  $('#viewport').hidden = true;
  $('#tools').hidden = true;
  $('#hint').hidden = true;
  $('#titleblock').hidden = true;
  const dv = $('#docview');
  dv.hidden = false;
  dv.innerHTML = doc.sheets.map((s) => `
    <figure>
      <img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du manuel : ${esc(eq.sheetTitles[s] || '')}" data-sheet="${s}" loading="lazy">
      <figcaption><span class="mono">${eq.document.reference.split(',')[0]}-${s}</span> · ${esc(eq.sheetTitles[s] || '')} — cliquez pour agrandir</figcaption>
    </figure>`).join('');
  dv.querySelectorAll('img').forEach((img) => img.addEventListener('click', () => openPage(img.dataset.sheet)));
  dv.scrollTop = 0;
  renderRail();
  renderCrumbs();
  renderPanel();
}

async function openIssues() {
  if (!viewer?.model) await openAssembly(S.eq.root);
  S.view = { type: 'issues', id: 'controle' };
  S.selected = null;
  renderRail();
  renderCrumbs();
  renderPanel();
  if (narrow()) setPane('panel');
}

// ------------------------------------------------------------------ rail

function renderRail() {
  const eq = S.eq;
  const cur = S.view?.id;
  const issueCount = (id) => eq.assemblies.get(id).parts.filter((p) => p.flags.some((f) => f.level === 'error')).length;
  const node = (id) => {
    const a = eq.assemblies.get(id);
    const err = issueCount(id);
    const kids = a.children.length ? `<ul class="tree">${a.children.map(node).join('')}</ul>` : '';
    return `<li><button type="button" class="node ${id === cur ? 'cur' : ''}" data-go="${id}">
      <span class="sheet">${id}</span><span class="t">${esc(a.titleFr)}</span>
      <span class="n">${err ? `<span class="alert" title="Numéros à vérifier">!</span> ` : ''}${a.parts.length}</span></button>${kids}</li>`;
  };
  const docs = [...eq.documents.values()].map((d) => `<li><button type="button" class="node ${d.id === cur ? 'cur' : ''}" data-go="${d.id}">
    <span class="sheet">${d.sheets[d.sheets.length - 1]}</span><span class="t">${esc(d.titleFr)}</span><span class="n">${d.parts.length}</span></button></li>`).join('');
  const errors = eq.issues.filter((r) => r.flags.some((f) => f.level === 'error')).length;
  $('#rail').innerHTML = `
    <div class="equip"><strong>${esc(eq.name)}</strong><span>${esc(eq.category)} · n° de série ${esc(eq.serial)}</span></div>
    <div><h2>Assemblages 3D</h2><ul class="tree">${node(eq.root)}</ul></div>
    <div><h2>Schémas et listes</h2><ul class="tree">${docs}</ul></div>
    <div><h2>Manuel</h2><ul class="tree">
      <li><button type="button" class="node ${cur === 'controle' ? 'cur' : ''}" data-go="controle"><span class="sheet">QC</span><span class="t">Contrôle des listes</span><span class="n">${errors ? `<span class="alert">${errors}</span> / ` : ''}${eq.issues.length}</span></button></li>
      <li><button type="button" class="node" data-page="F01"><span class="sheet">PDF</span><span class="t">Pages du manuel (${eq.document.sheets})</span><span class="n"></span></button></li>
    </ul></div>
    <details class="more"><summary>Fiche technique</summary>
      <dl class="specs">${eq.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
      ${eq.weights.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </details>`;
}

function renderCrumbs() {
  const eq = S.eq;
  const parts = [];
  if (S.view.type === 'assembly') {
    let id = S.view.id;
    while (id) { parts.unshift(id); id = eq.assemblies.get(id).parent; }
  }
  const items = [`<button type="button" data-go="${eq.root}">${esc(eq.name)}</button>`];
  if (S.view.type === 'assembly') {
    parts.forEach((id, i) => items.push(`<button type="button" class="${i === parts.length - 1 ? 'cur' : ''}" data-go="${id}">${id} · ${esc(eq.assemblies.get(id).titleFr)}</button>`));
  } else if (S.view.type === 'document') {
    const d = eq.documents.get(S.view.id);
    items.push(`<button type="button" class="cur" data-go="${d.id}">${esc(d.titleFr)}</button>`);
  } else {
    items.push('<button type="button" class="cur" data-go="controle">Contrôle des listes</button>');
  }
  $('#crumbs').innerHTML = items.join('<span class="sep">›</span>');
}

function renderTitleblock(asm) {
  const eq = S.eq;
  const ref = eq.document.reference.split(',')[0];
  $('#titleblock').innerHTML = `
    <div><span class="k">Projet</span><span class="v">${esc(eq.name)}</span></div>
    <div><span class="k">Client</span><span class="v">${esc(eq.manufacturer)}</span></div>
    <div class="wide"><span class="k">Titre</span><span class="v">${esc(asm.title)}</span></div>
    <div><span class="k">Feuille</span><span class="v">${asm.sheet} · ${asm.parts.length} lignes</span></div>
    <div><span class="k">Préparé</span><span class="v">${esc(eq.document.date)}</span></div>
    <div class="wide"><span class="v dwg">${esc(ref)}-${asm.sheet}-03</span></div>`;
}

// ------------------------------------------------------------------ panneau des pièces

function viewRows() {
  const eq = S.eq;
  if (S.view.type === 'assembly') return eq.assemblies.get(S.view.id).parts;
  if (S.view.type === 'document') return eq.documents.get(S.view.id).parts;
  return [];
}

function renderPanel() {
  const eq = S.eq;
  const panel = $('#panel');
  if (S.view.type === 'issues') {
    const groups = eq.issues.slice().sort((a, b) => sevRank(b) - sevRank(a));
    panel.innerHTML = `
      <div class="phead"><h1>Contrôle des listes</h1>
        <p class="sub">${eq.issues.length} lignes du manuel méritent une vérification avant de commander : même numéro avec des descriptions différentes, numéros presque identiques (une frappe d'écart), lignes ou numéros absents. Cliquez une ligne pour l'ouvrir.</p></div>
      <div class="tablewrap"><ul class="issues">${groups.map((r) => {
        const f = r.flags.find((x) => x.level === 'error') || r.flags.find((x) => x.level === 'warn');
        return `<li><button type="button" data-row="${esc(r.key)}">
          <span class="top"><span class="ico ${f.level}">${f.level === 'error' ? '✕' : '!'}</span><span class="mono">${esc(r.pn || '—')}</span><span>${esc(r.desc)}</span></span>
          <span class="why">${esc(sourceLabel(eq, r.source))} · réf. ${esc(r.ref)} — ${esc(f.text)}</span></button></li>`;
      }).join('')}</ul></div>`;
    panel.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => jumpToRow(b.dataset.row)));
    return;
  }
  const isAsm = S.view.type === 'assembly';
  const src = isAsm ? eq.assemblies.get(S.view.id) : eq.documents.get(S.view.id);
  const sheets = isAsm ? src.sheet : src.sheets.join(' / ');
  panel.innerHTML = `
    <div class="phead">
      <h1>${esc(src.titleFr)}</h1>
      <span class="sub">Feuille ${sheets} · ${esc(src.title)}</span>
      ${src.note ? `<div class="note">${esc(src.note)}</div>` : ''}
      <label class="sr" for="filter">Filtrer la liste</label>
      <input class="filter" id="filter" type="search" placeholder="Filtrer cette liste…" value="${esc(S.filter)}">
    </div>
    <div class="detail" id="detail" hidden></div>
    <div class="tablewrap" id="tablewrap"><table class="parts">
      <thead><tr><th class="c-ref">Réf.</th><th>N° pièce</th><th class="c-qty">Qté</th><th>Description</th><th class="c-add"><span class="sr">Ajouter</span></th></tr></thead>
      <tbody id="rows"></tbody></table></div>`;
  $('#filter').addEventListener('input', (e) => { S.filter = e.target.value; renderRows(); });
  renderRows();
  renderDetail();
}

function sevRank(r) {
  return r.flags.some((f) => f.level === 'error') ? 2 : 1;
}

function renderRows() {
  const q = S.filter.trim().toUpperCase();
  const rows = viewRows().filter((r) => !q || `${r.ref} ${r.pn} ${r.desc} ${r.supplier || ''}`.toUpperCase().includes(q));
  const tb = $('#rows');
  if (!tb) return;
  tb.innerHTML = rows.map((r) => {
    const f = r.flags.find((x) => x.level === 'error') || r.flags.find((x) => x.level === 'warn');
    const ico = f ? `<span class="ico ${f.level}" title="${esc(f.text)}">${f.level === 'error' ? '✕' : '!'}</span>` : '';
    const sub = r.ref.includes('.');
    const refTxt = r.link && r.pseudo ? '→' : sub ? '↳' : esc(r.ref);
    const pn = r.pn ? esc(r.pn) : r.supplier ? `<span title="N° fournisseur">${esc(r.supplier)}</span>` : '<span class="ico warn">—</span>';
    const canAdd = !!(r.pn || r.supplier || !r.pseudo);
    return `<tr data-ref="${esc(r.ref)}" class="${sub ? 'sub-row' : ''} ${r.ref === S.selected ? 'sel' : ''}">
      <td class="c-ref"><span class="${r.link ? 'link' : ''}">${refTxt}</span></td>
      <td class="c-pn">${pn}${ico}</td>
      <td class="c-qty">${r.qty ?? '—'}</td>
      <td class="c-desc">${esc(r.desc)}${r.link ? ` <span class="linkchip">${r.link} ›</span>` : ''}</td>
      <td class="c-add">${canAdd ? `<button type="button" class="addbtn ${cart.has(r) ? 'in' : ''}" data-add="${esc(r.ref)}" title="Ajouter à la commande" aria-label="Ajouter ${esc(r.pn || r.desc)} à la commande">${cart.has(r) ? '✓' : '+'}</button>` : ''}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="5" style="padding:18px 14px;color:var(--muted)">Aucune ligne ne correspond au filtre.</td></tr>';
  tb.querySelectorAll('tr[data-ref]').forEach((tr) => {
    const ref = tr.dataset.ref;
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-add]')) return;
      select(ref, { focus: true });
    });
    tr.addEventListener('dblclick', () => { const r = rowByRef(ref); if (r?.link) go(r.link); });
    tr.addEventListener('mouseenter', () => { const r = rowByRef(ref); if (viewer && S.view.type === 'assembly' && r) viewer.setHover(ref3d(r)); });
    tr.addEventListener('mouseleave', () => viewer?.setHover(null));
  });
  tb.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => {
    const r = rowByRef(b.dataset.add);
    cart.add(r, r.qty && r.qty <= 4 ? r.qty : 1, S.eq.name);
    toast(`Ajouté : ${r.pn || r.desc}`);
  }));
}

function refreshAddButtons() {
  document.querySelectorAll('#rows [data-add]').forEach((b) => {
    const r = rowByRef(b.dataset.add);
    const inCart = r && cart.has(r);
    b.classList.toggle('in', inCart);
    b.textContent = inCart ? '✓' : '+';
  });
  if (S.selected) renderDetail();
}

function rowByRef(ref) {
  return viewRows().find((r) => r.ref === ref) || null;
}

function markRow(ref, cls) {
  document.querySelectorAll(`#rows tr.${cls}`).forEach((tr) => tr.classList.remove(cls));
  if (!ref) return;
  const rows = viewRows().filter((r) => ref3d(r) === ref);
  rows.forEach((r) => document.querySelector(`#rows tr[data-ref="${CSS.escape(r.ref)}"]`)?.classList.add(cls));
}

function select(ref, { focus = false, from3d = false } = {}) {
  S.selected = ref;
  const row = ref ? rowByRef(ref) : null;
  document.querySelectorAll('#rows tr.sel').forEach((tr) => tr.classList.remove('sel'));
  if (row) {
    const tr = document.querySelector(`#rows tr[data-ref="${CSS.escape(ref)}"]`);
    tr?.classList.add('sel');
    if (tr && from3d) tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  if (viewer && S.view.type === 'assembly') {
    viewer.setSelected(row ? ref3d(row) : null);
    if (row && focus && viewer.hasRef(ref3d(row)) && !narrow()) viewer.focusRef(ref3d(row));
  }
  renderDetail();
  if (row && from3d && narrow()) toast(`Réf. ${row.ref} · ${row.pn || '—'} · ${row.desc}`, 3500);
}

function renderDetail() {
  const box = $('#detail');
  if (!box) return;
  const row = S.selected ? rowByRef(S.selected) : null;
  if (!row) { box.hidden = true; box.innerHTML = ''; return; }
  const eq = S.eq;
  box.hidden = false;
  const long = row.ref.length > 3;
  const flags = row.flags.map((f) => `<div class="flag ${f.level}">${esc(f.text)}${f.refs?.length ? `<span class="lnk">${f.refs.map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${o.source.sheet} réf. ${esc(o.ref)} · ${esc(o.desc)}</button>`).join('')}</span>` : ''}</div>`).join('');
  const others = (row.usedIn || []).filter((o) => !row.flags.some((f) => f.refs?.includes(o)));
  const used = others.length ? `<div class="meta">Aussi listé : <span class="lnk">${others.map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${o.source.sheet} réf. ${esc(o.ref)}</button>`).join(' ')}</span></div>` : '';
  const mirror = row.mirrorOf ? `<div class="flag info">Pièce symétrique (côté gauche) : la 3D met en évidence la pièce droite, réf. ${esc(row.mirrorOf)}.</div>` : '';
  const ids = [row.supplier && `Fournisseur ${esc(row.supplier)}`, row.sandvik && row.sandvik !== 'N/A' && `Sandvik ${esc(row.sandvik)}`].filter(Boolean).join(' · ');
  const canAdd = !!(row.pn || row.supplier || !row.pseudo);
  const inCart = cart.has(row);
  const defQty = row.qty && row.qty <= 4 ? row.qty : 1;
  box.innerHTML = `
    <div class="row1">
      <span class="ref ${long ? 'long' : ''}">${esc(row.ref)}</span>
      <div style="min-width:0"><h3>${esc(row.desc)}</h3>
        <div class="meta">${row.qty != null ? `Qté au manuel : ${row.qty}` : 'Qté non indiquée'} · feuille ${row.source.sheet}${ids ? ` · ${ids}` : ''}</div></div>
      <button type="button" class="close" id="d-close" aria-label="Fermer la fiche">×</button>
    </div>
    <div class="pnline">${row.pn ? `<span class="pnbig">${esc(row.pn)}</span><button type="button" class="chip" id="d-copy">Copier le n°</button>` : `<span class="meta">${row.supplier ? `N° fournisseur : <span class="mono">${esc(row.supplier)}</span>` : 'Aucun numéro de pièce'}</span>`}</div>
    ${mirror}${flags}${used}
    <div class="actions">
      ${canAdd ? `<span class="stepper"><button type="button" id="d-minus" aria-label="Moins">−</button><input id="d-qty" inputmode="numeric" value="${defQty}" aria-label="Quantité"><button type="button" id="d-plus" aria-label="Plus">+</button></span>
      <button type="button" class="btn primary" id="d-add">${inCart ? 'Ajouter encore' : 'Ajouter à la commande'}</button>` : ''}
      ${row.link ? `<button type="button" class="btn" data-go="${row.link}">Ouvrir ${row.link} ›</button>` : ''}
      ${S.view.type === 'assembly' ? '<button type="button" class="btn" id="d-focus">Centrer</button>' : ''}
      ${row.see ? row.see.map((s) => `<button type="button" class="btn" data-page="${s}">Voir ${s}</button>`).join('') : ''}
    </div>`;
  $('#d-close').addEventListener('click', () => select(null));
  $('#d-copy')?.addEventListener('click', () => copy(row.pn, `N° ${row.pn} copié`));
  const qty = $('#d-qty');
  $('#d-minus')?.addEventListener('click', () => { qty.value = Math.max(1, (+qty.value || 1) - 1); });
  $('#d-plus')?.addEventListener('click', () => { qty.value = (+qty.value || 0) + 1; });
  $('#d-add')?.addEventListener('click', () => {
    cart.add(row, Math.max(1, +qty.value || 1), eq.name);
    toast(`Ajouté à la commande : ${qty.value} × ${row.pn || row.desc}`);
  });
  $('#d-focus')?.addEventListener('click', () => { if (viewer?.hasRef(ref3d(row))) { viewer.focusRef(ref3d(row)); if (narrow()) setPane('stage'); } });
  box.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => jumpToRow(b.dataset.row)));
}

function jumpToRow(key) {
  const eq = S.eq;
  const r = eq.rows.find((x) => x.key === key);
  if (!r) return;
  if (r.source.type === 'assembly') {
    if (S.view?.type === 'assembly' && S.view.id === r.source.id) select(r.ref, { focus: true });
    else { history.replaceState(null, '', `#${r.source.id}`); openAssembly(r.source.id, { select: r.ref }); }
  } else {
    history.replaceState(null, '', `#${r.source.id}`);
    openDocument(r.source.id);
    select(r.ref);
    document.querySelector(`#rows tr[data-ref="${CSS.escape(r.ref)}"]`)?.scrollIntoView({ block: 'center' });
  }
  if (narrow()) setPane('panel');
}

// ------------------------------------------------------------------ recherche

function bindSearch() {
  const input = $('#q');
  const box = $('#results');
  let hits = [];
  let idx = -1;
  const render = () => {
    const q = input.value;
    if (q.trim().length < 2) { box.hidden = true; return; }
    hits = search(S.eq, q);
    idx = -1;
    box.hidden = false;
    box.innerHTML = hits.length ? hits.map((r, i) => `<button type="button" class="res" data-i="${i}">
      <span class="pn">${esc(r.pn || r.supplier || '—')}</span><span>${esc(r.desc)}</span>
      <span class="where">${esc(sourceLabel(S.eq, r.source))} · réf. ${esc(r.ref)}${r.qty != null ? ` · qté ${r.qty}` : ''}</span></button>`).join('')
      : `<div class="empty">Aucune pièce trouvée pour « ${esc(q)} ». Essayez un numéro partiel ou un mot de la description (en anglais, comme au manuel).</div>`;
    box.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('mousedown', (e) => { e.preventDefault(); pick(+b.dataset.i); }));
  };
  const pick = (i) => {
    const r = hits[i];
    if (!r) return;
    box.hidden = true;
    input.blur();
    jumpToRow(r.key);
  };
  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('blur', () => setTimeout(() => { box.hidden = true; }, 120));
  input.addEventListener('keydown', (e) => {
    const n = hits.length;
    if (e.key === 'ArrowDown' && n) { idx = (idx + 1) % n; e.preventDefault(); }
    else if (e.key === 'ArrowUp' && n) { idx = (idx - 1 + n) % n; e.preventDefault(); }
    else if (e.key === 'Enter') { pick(idx >= 0 ? idx : 0); return; }
    else if (e.key === 'Escape') { box.hidden = true; input.blur(); return; }
    else return;
    box.querySelectorAll('.res').forEach((b, i) => b.classList.toggle('on', i === idx));
    box.querySelector('.res.on')?.scrollIntoView({ block: 'nearest' });
  });
}

// ------------------------------------------------------------------ commande

function renderCartButton() {
  const n = cart.count();
  $('#cart-count').textContent = n;
  $('#cart-btn').classList.toggle('has', n > 0);
}

function openDrawer() {
  $('#drawer').hidden = false;
  let scrim = $('#scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.id = 'scrim';
    scrim.className = 'scrim';
    scrim.addEventListener('click', closeDrawer);
    document.body.appendChild(scrim);
  }
  scrim.hidden = false;
  renderDrawer();
}

function closeDrawer() {
  $('#drawer').hidden = true;
  const s = $('#scrim');
  if (s) s.hidden = true;
}

function renderDrawer() {
  const eq = S.eq;
  const d = $('#drawer');
  const items = cart.items;
  const embedded = window.self !== window.top;
  d.innerHTML = `
    <header><h2>Liste de commande</h2><button type="button" class="btn x" id="c-close">Fermer</button></header>
    <div class="body">${items.length ? items.map((i) => `
      <div class="line" data-key="${esc(i.key)}">
        <span class="pn">${esc(i.pn || i.supplier || 'Sans numéro')}</span>
        <span class="d">${esc(i.desc)}</span>
        <span class="w">${esc(i.where.join(' · '))}</span>
        <span class="stepper"><button type="button" data-step="-1" aria-label="Moins">−</button><input value="${i.qty}" inputmode="numeric" aria-label="Quantité" id="q-${esc(i.key)}"><button type="button" data-step="1" aria-label="Plus">+</button></span>
        <button type="button" class="rm" data-rm aria-label="Retirer">×</button>
      </div>`).join('') : `<div class="empty"><strong>La liste est vide.</strong><span>Cliquez une pièce dans la 3D ou dans la liste, puis « Ajouter à la commande ». Les pièces sont regroupées par numéro.</span></div>`}</div>
    ${items.length ? `<footer>
      <label for="c-text">Texte de la demande (à coller dans un courriel ou un bon de commande)</label>
      <textarea id="c-text" readonly>${esc(cart.asText(eq))}</textarea>
      <div class="actions">
        <button type="button" class="btn primary" id="c-copy">Copier la demande</button>
        <button type="button" class="btn" id="c-csv">Copier en CSV</button>
        ${embedded ? '' : '<button type="button" class="btn" id="c-dl">Télécharger CSV</button>'}
        <button type="button" class="btn" id="c-clear">Vider</button>
      </div></footer>` : ''}`;
  $('#c-close').addEventListener('click', closeDrawer);
  d.querySelectorAll('.line').forEach((line) => {
    const key = line.dataset.key;
    const input = line.querySelector('input');
    line.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => cart.setQty(key, (+input.value || 1) + +b.dataset.step)));
    input.addEventListener('change', () => cart.setQty(key, +input.value || 1));
    line.querySelector('[data-rm]').addEventListener('click', () => cart.remove(key));
  });
  $('#c-copy')?.addEventListener('click', () => copy(cart.asText(eq), 'Demande copiée', $('#c-text')));
  $('#c-csv')?.addEventListener('click', () => copy(cart.asCsv(eq), 'CSV copié', $('#c-text')));
  $('#c-dl')?.addEventListener('click', () => {
    const blob = new Blob(['﻿' + cart.asCsv(eq)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `commande-${eq.id}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  const clear = $('#c-clear');
  clear?.addEventListener('click', () => {
    if (clear.dataset.armed) { cart.clear(); return; }
    clear.dataset.armed = '1';
    clear.textContent = 'Confirmer : vider';
    setTimeout(() => { if (clear.isConnected) { delete clear.dataset.armed; clear.textContent = 'Vider'; } }, 3000);
  });
}

// ------------------------------------------------------------------ pages du manuel

let zoom = 'fit';
function openPage(sheet) {
  const eq = S.eq;
  const n = eq.document.sheets;
  const num = Math.min(n, Math.max(1, parseInt(sheet.slice(1), 10) || 1));
  const s = `F${String(num).padStart(2, '0')}`;
  const m = $('#modal');
  m.hidden = false;
  m.innerHTML = `
    <div class="bar">
      <button type="button" class="btn" id="p-prev" ${num <= 1 ? 'disabled' : ''} aria-label="Page précédente">‹</button>
      <strong>${s}</strong><span>${esc(eq.sheetTitles[s] || '')}</span>
      <button type="button" class="btn" id="p-next" ${num >= n ? 'disabled' : ''} aria-label="Page suivante">›</button>
      <span class="sp"></span>
      <button type="button" class="btn" id="p-zoom">${zoom === 'fit' ? 'Taille réelle' : 'Ajuster'}</button>
      ${eq.assemblies.has(s) ? `<button type="button" class="btn" id="p-3d">Ouvrir en 3D</button>` : ''}
      <button type="button" class="btn" id="p-close">Fermer</button>
    </div>
    <div class="canvas"><img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du manuel" id="p-img"></div>`;
  const img = $('#p-img');
  const fit = () => {
    const c = m.querySelector('.canvas');
    if (zoom === 'fit') {
      const w = Math.min(c.clientWidth - 32, (c.clientHeight - 16) * 1.5);
      img.style.width = `${Math.max(200, w)}px`;
    } else img.style.width = '2200px';
  };
  img.addEventListener('load', fit);
  fit();
  $('#p-prev').addEventListener('click', () => openPage(`F${num - 1}`));
  $('#p-next').addEventListener('click', () => openPage(`F${num + 1}`));
  $('#p-zoom').addEventListener('click', () => { zoom = zoom === 'fit' ? 'full' : 'fit'; openPage(s); });
  $('#p-close').addEventListener('click', closePage);
  $('#p-3d')?.addEventListener('click', () => { closePage(); go(s); });
}
function closePage() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

// ------------------------------------------------------------------ catalogue

function renderCatalogue() {
  const c = $('#catalogue');
  c.innerHTML = `<div class="cat-inner">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><h1>Équipements</h1><button type="button" class="btn" data-go="${S.eq.root}" style="margin-left:auto">Retour à la 3D</button></div>
    <p>Chaque équipement provient d'un manuel de pièces : listes extraites page par page, assemblages en 3D éclatée, schémas, et liste de commande.</p>
    <div class="cards">
      ${S.index.map((e) => `<button type="button" class="card" data-go="${S.eq.root}">
        <img src="${esc(e.thumbnail)}" alt="Couverture du manuel ${esc(e.name)}">
        <span class="cb"><strong>${esc(e.name)}</strong><span>${esc(e.manufacturer)} · ${esc(e.category)}</span><span>${esc(e.status)}</span></span></button>`).join('')}
      <div class="card add"><strong>Ajouter un équipement</strong>
        <ol><li>Déposer le PDF du manuel de pièces.</li><li>Extraire les listes (outil <span class="mono">tools/extract_parts.py</span>) et relire.</li><li>Modéliser chaque assemblage (formes paramétriques) ou importer un modèle CAO (.glb).</li></ol>
      </div>
    </div></div>`;
}

// ------------------------------------------------------------------ chrome

function setPane(p) {
  $('#workspace').dataset.pane = p;
  document.querySelectorAll('#mtabs button').forEach((b) => b.classList.toggle('on', b.dataset.pane === p));
  if (p === 'stage') viewer?.resize();
}

function bindChrome() {
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) {
      e.preventDefault();
      const t = g.dataset.go;
      if (S.eq?.assemblies.has(t) && narrow()) setPane('stage');
      if (S.eq?.documents.has(t) && narrow()) setPane('stage');
      go(t);
      return;
    }
    const p = e.target.closest('[data-page]');
    if (p) { e.preventDefault(); openPage(p.dataset.page); }
  });
  $('#brand').addEventListener('click', () => go('catalogue'));
  $('#cart-btn').addEventListener('click', openDrawer);
  document.querySelectorAll('#mtabs button').forEach((b) => b.addEventListener('click', () => setPane(b.dataset.pane)));
  const slider = $('#explode');
  slider.addEventListener('input', () => { S.explode = slider.value / 100; viewer?.setExplode(S.explode, { animate: false }); });
  slider.addEventListener('change', () => viewer?.frame({ exploded: S.explode > 0.3 }));
  const animateTo = (t) => {
    S.explode = t;
    slider.value = t * 100;
    viewer?.setExplode(t);
    viewer?.frame({ exploded: t > 0.3 });
  };
  $('#btn-assemble').addEventListener('click', () => animateTo(0));
  $('#btn-explode').addEventListener('click', () => animateTo(1));
  const lb = $('#btn-labels');
  lb.setAttribute('aria-pressed', String(S.labels));
  lb.addEventListener('click', () => {
    S.labels = !S.labels;
    lb.setAttribute('aria-pressed', String(S.labels));
    viewer?.setLabels(S.labels);
    try { localStorage.setItem('pieces3d.labels', S.labels ? '1' : '0'); } catch { /* ignoré */ }
  });
  const iso = $('#btn-isolate');
  iso.addEventListener('click', () => {
    S.isolate = !S.isolate;
    iso.setAttribute('aria-pressed', String(S.isolate));
    viewer?.setIsolate(S.isolate);
    if (S.isolate && !S.selected) toast('Sélectionnez une pièce : les autres seront estompées.');
  });
  $('#btn-frame').addEventListener('click', () => viewer?.frame({ exploded: S.explode > 0.3 }));
  $('#btn-page').addEventListener('click', () => { if (S.view?.type === 'assembly') openPage(S.view.id); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) closePage();
    else if (!$('#drawer').hidden) closeDrawer();
    else if (S.selected) select(null);
  });
  bindSearch();
}

let toastTimer;
function toast(msg, ms = 2200) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

async function copy(text, okMsg, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    if (fallbackEl) {
      fallbackEl.value = text;
      fallbackEl.focus();
      fallbackEl.select();
      toast('Copie automatique refusée : le texte est sélectionné, faites Ctrl+C.');
    } else toast('Copie automatique refusée par le navigateur.');
  }
}

init();
