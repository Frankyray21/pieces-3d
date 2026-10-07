import './styles.css';
import { Viewer } from './viewer/Viewer.js';
import { buildProcedural } from './viewer/assembly.js';
import { loadIndex, loadEquipment, search, sourceLabel } from './data/equipment.js';
import cubexModels from './models/cubex-mri-5200/index.js';
import du311Models from './models/du311/index.js';
import './ui/resize.js';

// Modèles 3D disponibles par équipement (builders procéduraux).
const MODELS = { 'cubex-mri-5200': cubexModels, du311: du311Models };

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const narrow = () => window.matchMedia('(max-width: 900px)').matches;
const keyOf = (path) => path.join('>');

const S = {
  index: [],
  eq: null,
  view: null, // { type: 'assembly' | 'document' | 'issues', id }
  selected: null, // chemin de repères depuis l'assemblage affiché, ex. ['F14', '1', '4']
  expanded: new Set(), // groupes éclatés sur place (clés de chemins)
  filter: '',
  labels: true,
  edges: false, // contours des pièces (traits du dessin), sur demande
  isolate: false,
  explode: 0,
  section: { on: false, axis: 'z', pos: 0.5, flip: false, scope: 'all' },
};
let viewer = null;

try { S.labels = localStorage.getItem('pieces3d.labels') !== '0'; } catch { /* préférence non disponible */ }
// Contours de dessin : désactivés par défaut (rendu photo), à la demande.
try { S.edges = localStorage.getItem('pieces3d.edges') === '1'; } catch { /* préférence non disponible */ }

// ------------------------------------------------------------------ démarrage

async function init() {
  bindChrome();
  try {
    S.index = await loadIndex();
  } catch (err) {
    loadError(err);
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

function loadError(err) {
  $('#panel').innerHTML = `<div class="phead"><h1>Chargement impossible</h1><p class="sub">${esc(err.message)}. Vérifiez que les fichiers de données sont publiés avec la page.</p></div>`;
}

// Adresse : « #F05 » pour le premier équipement du catalogue (liens existants),
// « #du311.P024 » pour les autres (un lien d'Artifact claude.ai ne transmet que
// lettres, chiffres et « . _ ~ - » ; « / » reste accepté en lecture).
function hashFor(token, id = S.eq.id) {
  return id === S.index[0].id ? token : `${id}.${token}`;
}

async function route() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  const m = /^([^./]+)[./](.*)$/.exec(raw);
  const known = !!m && S.index.some((e) => e.id === m[1]);
  const id = known ? m[1] : S.index[0].id;
  const token = known ? m[2] : raw;
  if (S.eq?.id !== id) {
    try {
      S.eq = await loadEquipment(id);
    } catch (err) {
      loadError(err);
      return;
    }
    S.view = null;
    S.selected = null;
  }
  const eq = S.eq;
  // Page d'accueil (adresse sans « # ») : la liste des équipements.
  const home = raw === '' || token === 'catalogue';
  $('#catalogue').hidden = !home;
  if (home) { document.title = 'Équipements · Pièces 3D'; renderCatalogue(); return; }
  if (token === 'controle') return openIssues();
  if (eq.assemblies.has(token)) return openAssembly(token);
  if (eq.documents.has(token)) return openDocument(token);
  openAssembly(eq.root);
}

function go(token) {
  const h = `#${hashFor(token)}`;
  if (location.hash === h) route();
  else location.hash = h;
}

// ------------------------------------------------------------------ chemins dans l'arbre des pièces

function isAsmView() {
  return S.view?.type === 'assembly';
}

/** Ligne de la liste désignée par un chemin (assemblage affiché → sous-groupes). */
function rowAt(path) {
  if (!path?.length) return null;
  if (S.view.type === 'document') return S.eq.documents.get(S.view.id).parts.find((r) => r.ref === path[0]) || null;
  let asm = S.eq.assemblies.get(S.view.id);
  let row = null;
  for (let i = 0; i < path.length; i++) {
    row = asm?.parts.find((p) => p.ref === path[i]) || null;
    if (!row) return null;
    if (i < path.length - 1) asm = S.eq.assemblies.get(row.link);
  }
  return row;
}

/** Chemin des objets 3D (les pièces gauches symétriques pointent vers la pièce droite). */
function path3d(path) {
  const out = [];
  for (let i = 0; i < path.length; i++) {
    const row = rowAt(path.slice(0, i + 1));
    out.push(row?.mirrorOf || path[i]);
  }
  return out;
}

function isGroupPath(path) {
  if (!is3d()) return false;
  const row = rowAt(path);
  return !!row?.link && viewer.isGroup(path3d(path));
}

// ------------------------------------------------------------------ assemblages 3D

function ensureViewer() {
  if (viewer) return viewer;
  viewer = new Viewer($('#viewport'), {
    onHover: (path) => markRow(path, 'hov'),
    onSelect: (path, { double }) => {
      if (!path) { select(null); return; }
      if (double && isGroupPath(path)) { toggleGroup(path); return; }
      select(path, { from3d: true });
    },
  });
  viewer.setLabels(S.labels);
  viewer.setEdges(S.edges);
  return viewer;
}

// Vrai quand la vue courante est un assemblage modélisé en 3D (sinon : dessins du manuel).
function is3d() {
  return !!viewer && isAsmView() && S.view.is3d;
}

async function openAssembly(id, { select: selPath = null } = {}) {
  const eq = S.eq;
  const asm = eq.assemblies.get(id);
  const same = isAsmView() && S.view.id === id;
  const builders = MODELS[eq.id] || {};
  const has3d = !!builders[id];
  S.view = { type: 'assembly', id, is3d: has3d };
  S.filter = '';
  $('#docview').hidden = has3d;
  $('#viewport').hidden = !has3d;
  $('#tools').hidden = !has3d;
  $('#titleblock').hidden = !has3d;
  $('#hint').hidden = !has3d;
  document.title = `${asm.titleFr} · ${eq.name} · Pièces 3D`;
  if (!has3d) {
    if (!same) { S.selected = null; S.expanded.clear(); showSheets(asm.sheets || [id]); }
    renderSectionBar();
  } else if (!same) {
    S.selected = null;
    S.expanded.clear();
    S.section = { ...S.section, on: false, scope: 'all' };
    const v = ensureViewer();
    $('#loading').hidden = false;
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    const model = buildProcedural(builders, id);
    $('#loading').hidden = true;
    if (model) {
      v.setModel(model);
      v.setIsolate(S.isolate);
      S.section.axis = model.view.section?.axis || 'z';
      S.section.pos = model.view.section?.pos ?? 0.5;
      if (S.explode > 0) {
        v.setExplode(S.explode);
        v.frame();
      }
    }
    renderSectionBar();
  }
  renderRail();
  renderCrumbs();
  renderTitleblock(asm);
  renderPanel();
  if (selPath) select(selPath, { focus: true });
}

/** Éclate (ou rassemble) un groupe sur place, avec ses parents. */
function toggleGroup(path, force) {
  if (!viewer || !isGroupPath(path)) return;
  const key = keyOf(path);
  const open = force ?? !S.expanded.has(key);
  if (open) {
    if (S.explode < 0.99) setMainExplode(1, { frame: false });
    for (let i = 1; i <= path.length; i++) {
      const sub = path.slice(0, i);
      if (!isGroupPath(sub)) continue;
      S.expanded.add(keyOf(sub));
      viewer.setGroupExplode(path3d(sub), 1);
    }
    viewer.focusPath(path3d(path));
  } else {
    for (const k of [...S.expanded]) if (k === key || k.startsWith(`${key}>`)) S.expanded.delete(k);
    viewer.setGroupExplode(path3d(path), 0);
    viewer.focusPath(path3d(path));
  }
  renderRows();
  renderDetail();
}

function setMainExplode(t, { frame = true } = {}) {
  S.explode = t;
  $('#explode').value = Math.round(t * 100);
  viewer?.setExplode(t);
  if (frame) viewer?.frame();
}

function explodeEverything(on) {
  if (!viewer) return;
  S.explode = on ? 1 : 0;
  $('#explode').value = on ? 100 : 0;
  viewer.explodeAll(on ? 1 : 0);
  S.expanded = new Set(on ? viewer.groupPaths().map(keyOf) : []);
  viewer.frame();
  renderRows();
  renderDetail();
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
  $('#sectionbar').hidden = true;
  $('#hint').hidden = true;
  $('#titleblock').hidden = true;
  showSheets(doc.sheets);
  renderRail();
  renderCrumbs();
  renderPanel();
}

// Pages du manuel affichées dans la scène (schémas, ou dessins d'un assemblage sans 3D).
function showSheets(sheets) {
  const eq = S.eq;
  const dv = $('#docview');
  dv.hidden = false;
  dv.innerHTML = sheets.map((s) => `
    <figure>
      <img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du manuel : ${esc(eq.sheetTitles[s] || '')}" data-sheet="${s}" loading="lazy">
      <figcaption><span class="mono">${eq.document.reference.split(',')[0]}-${s}</span> · ${esc(eq.sheetTitles[s] || '')} — cliquez pour agrandir</figcaption>
    </figure>`).join('') || '<p class="sub">Aucun dessin pour cette liste au manuel.</p>';
  dv.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => openPage(img.dataset.sheet));
    img.addEventListener('load', () => img.closest('figure').classList.toggle('portrait', img.naturalHeight > img.naturalWidth));
  });
  dv.scrollTop = 0;
}

async function openIssues() {
  if (!S.view) await openAssembly(S.eq.root);
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
  // Grande arborescence : seule la branche de l'assemblage courant est dépliée.
  const big = eq.assemblies.size > 40;
  const models = MODELS[eq.id] || {};
  const n3d = [...eq.assemblies.keys()].filter((id) => models[id]).length;
  const partial = n3d > 0 && n3d < eq.assemblies.size;
  const path = new Set();
  for (let a = eq.assemblies.get(cur); a; a = eq.assemblies.get(a.parent)) path.add(a.id);
  const node = (id) => {
    const a = eq.assemblies.get(id);
    const err = issueCount(id);
    const open = !big || id === eq.root || path.has(id);
    const kids = a.children.length && open ? `<ul class="tree">${a.children.map(node).join('')}</ul>` : '';
    return `<li><button type="button" class="node ${id === cur ? 'cur' : ''}" data-go="${id}">
      <span class="sheet ${partial && models[id] ? 'm3d' : ''}">${id}</span><span class="t">${a.children.length && !open ? '▸ ' : ''}${esc(a.titleFr)}</span>
      <span class="n">${err ? `<span class="alert" title="Numéros à vérifier">!</span> ` : ''}${a.parts.length}</span></button>${kids}</li>`;
  };
  const docs = [...eq.documents.values()].map((d) => `<li><button type="button" class="node ${d.id === cur ? 'cur' : ''}" data-go="${d.id}">
    <span class="sheet">${d.sheets[d.sheets.length - 1]}</span><span class="t">${esc(d.titleFr)}</span><span class="n">${d.parts.length}</span></button></li>`).join('');
  const errors = eq.issues.filter((r) => r.flags.some((f) => f.level === 'error')).length;
  $('#rail').innerHTML = `
    <div class="equip"><strong>${esc(eq.name)}</strong><span>${esc(eq.category)} · n° de série ${esc(eq.serial)}</span></div>
    <div><h2>Assemblages${n3d && !partial ? ' 3D' : ''}</h2>${partial ? `<p class="legend"><span class="sheet m3d">3D</span><span>${n3d} assemblages en 3D, les autres avec les dessins du manuel. Ouvrir : ${[...eq.assemblies.values()].filter((a) => models[a.id] && !models[a.parent]).map((a) => `<button type="button" class="lnk" data-go="${a.id}">${a.id} ${esc(a.titleFr)}</button>`).join('')}</span></p>` : ''}<ul class="tree">${node(eq.root)}</ul></div>
    <div><h2>Schémas et listes</h2><ul class="tree">${docs}</ul></div>
    <div><h2>Manuel</h2><ul class="tree">
      <li><button type="button" class="node ${cur === 'controle' ? 'cur' : ''}" data-go="controle"><span class="sheet">QC</span><span class="t">Contrôle des listes</span><span class="n">${errors ? `<span class="alert">${errors}</span> / ` : ''}${eq.issues.length}</span></button></li>
      <li><button type="button" class="node" data-page="${eq.sheetId(1)}"><span class="sheet">PDF</span><span class="t">Pages du manuel (${eq.document.sheets})</span><span class="n"></span></button></li>
    </ul></div>
    <details class="more"><summary>Fiche technique</summary>
      <dl class="specs">${eq.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
      ${eq.weights.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </details>`;
}

function renderCrumbs() {
  const eq = S.eq;
  const chain = [];
  if (isAsmView()) {
    let id = S.view.id;
    while (id) { chain.unshift(id); id = eq.assemblies.get(id).parent; }
  }
  const items = [`<button type="button" data-go="${eq.root}">${esc(eq.name)}</button>`];
  if (isAsmView()) {
    chain.forEach((id, i) => items.push(`<button type="button" class="${i === chain.length - 1 ? 'cur' : ''}" data-go="${id}">${id} · ${esc(eq.assemblies.get(id).titleFr)}</button>`));
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
    <button type="button" class="tb-page" data-page="${asm.sheet}" title="Ouvrir la page ${asm.sheet} du manuel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/><path d="M9 11h7M9 14h7M9 17h4.5"/></svg>
      <strong>${asm.sheet}</strong><small>Manuel</small>
    </button>
    <div class="tb-grid">
    <div><span class="k">Projet</span><span class="v">${esc(eq.name)}</span></div>
    <div><span class="k">Client</span><span class="v">${esc(eq.manufacturer)}</span></div>
    <div class="wide"><span class="k">Titre</span><span class="v">${esc(asm.title)}</span></div>
    <div><span class="k">Feuille</span><span class="v">${asm.sheet} · ${asm.parts.length} lignes</span></div>
    <div><span class="k">Préparé</span><span class="v">${esc(eq.document.date)}</span></div>
    <div class="wide"><span class="v dwg">${asm.pn ? `${esc(asm.pn)} rév. ${esc(asm.rev || '0')}` : `${esc(ref)}-${asm.sheet}-03`}</span></div>
    </div>`;
}

// ------------------------------------------------------------------ panneau des pièces

function renderPanel() {
  const eq = S.eq;
  const panel = $('#panel');
  if (S.view.type === 'issues') {
    const groups = eq.issues.slice().sort((a, b) => sevRank(b) - sevRank(a));
    panel.innerHTML = `
      <div class="phead"><h1>Contrôle des listes</h1>
        <p class="sub">${eq.issues.length} lignes du manuel méritent une vérification : même numéro avec des descriptions différentes, numéros presque identiques (une frappe d'écart), lignes ou numéros absents. Cliquez une ligne pour l'ouvrir.</p></div>
      <div class="tablewrap"><ul class="issues">${groups.map((r) => {
        const f = r.flags.find((x) => x.level === 'error') || r.flags.find((x) => x.level === 'warn');
        return `<li><button type="button" data-row="${esc(r.key)}">
          <span class="top"><span class="ico ${f.level}">${f.level === 'error' ? '✕' : '!'}</span><span class="mono">${esc(r.pn || '—')}</span><span>${esc(r.desc)}</span></span>
          <span class="why">${esc(sourceLabel(eq, r.source))} · réf. ${esc(r.ref)} — ${esc(f.text)}</span></button></li>`;
      }).join('')}</ul></div>`;
    panel.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => jumpToRow(b.dataset.row)));
    return;
  }
  const isAsm = isAsmView();
  const src = isAsm ? eq.assemblies.get(S.view.id) : eq.documents.get(S.view.id);
  const list = isAsm ? [src.sheet] : src.sheets;
  const sheets = list.length > 3 ? `${list[0]} à ${list[list.length - 1]}` : list.join(' / ');
  const sub = [`Feuille ${sheets}`, src.pn && `N° ${src.pn}`, src.title !== src.titleFr && src.title].filter(Boolean);
  panel.innerHTML = `
    <div class="phead">
      <h1>${esc(src.titleFr)}</h1>
      <span class="sub">${sub.map(esc).join(' · ')}</span>
      ${src.note ? `<div class="note">${esc(src.note)}</div>` : ''}
      <label class="sr" for="filter">Filtrer la liste</label>
      <input class="filter" id="filter" type="search" placeholder="Filtrer cette liste…" value="${esc(S.filter)}">
    </div>
    <div class="detail" id="detail" hidden></div>
    <div class="tablewrap" id="tablewrap"><table class="parts">
      <thead><tr><th class="c-ref">Réf.</th><th>N° pièce</th><th class="c-qty">Qté</th><th>Description</th></tr></thead>
      <tbody id="rows"></tbody></table></div>`;
  $('#filter').addEventListener('input', (e) => { S.filter = e.target.value; renderRows(); });
  renderRows();
  renderDetail();
}

function sevRank(r) {
  return r.flags.some((f) => f.level === 'error') ? 2 : 1;
}

/** Lignes affichées : l'assemblage courant, et sous chaque groupe éclaté, ses propres pièces. */
function visibleRows() {
  const q = S.filter.trim().toUpperCase();
  const out = [];
  const match = (r) => !q || `${r.ref} ${r.pn} ${r.desc} ${r.supplier || ''}`.toUpperCase().includes(q);
  if (S.view.type === 'document') {
    S.eq.documents.get(S.view.id).parts.forEach((r) => { if (match(r)) out.push({ r, path: [r.ref], depth: 0 }); });
    return out;
  }
  const walk = (asm, prefix, depth) => {
    for (const r of asm.parts) {
      const path = [...prefix, r.ref];
      const group = isGroupPath(path);
      const open = group && S.expanded.has(keyOf(path));
      if (match(r) || open) out.push({ r, path, depth, group, open });
      if (open) walk(S.eq.assemblies.get(r.link), path, depth + 1);
    }
  };
  walk(S.eq.assemblies.get(S.view.id), [], 0);
  return out;
}

function renderRows() {
  const tb = $('#rows');
  if (!tb) return;
  const selKey = S.selected ? keyOf(S.selected) : '';
  const rows = visibleRows();
  tb.innerHTML = rows.map(({ r, path, depth, group, open }) => {
    const f = r.flags.find((x) => x.level === 'error') || r.flags.find((x) => x.level === 'warn');
    const ico = f ? `<span class="ico ${f.level}" title="${esc(f.text)}">${f.level === 'error' ? '✕' : '!'}</span>` : '';
    const sub = r.ref.includes('.');
    const refTxt = sub ? '↳' : esc(r.ref);
    const pn = r.pn ? esc(r.pn) : r.nss ? '<span title="Non vendu séparément">NSS</span>' : r.supplier ? `<span title="N° fournisseur">${esc(r.supplier)}</span>` : '<span class="ico warn">—</span>';
    const key = keyOf(path);
    const tog = group
      ? `<button type="button" class="tog" data-tog="${esc(key)}" aria-expanded="${open}" title="${open ? 'Rassembler ce groupe' : 'Éclater ce groupe sur place'}" aria-label="${open ? 'Rassembler' : 'Éclater'} le groupe ${esc(r.desc)}">${open ? '▾' : '▸'}</button>`
      : '<span class="tog-sp"></span>';
    return `<tr data-key="${esc(key)}" data-key3d="${esc(keyOf(path3d(path)))}" class="${sub ? 'sub-row' : ''} ${depth ? 'nested' : ''} ${key === selKey ? 'sel' : ''}">
      <td class="c-ref" style="--d:${depth}">${tog}<span class="refb ${r.link ? 'link' : ''}">${refTxt}</span></td>
      <td class="c-pn">${pn}${ico}</td>
      <td class="c-qty">${r.qty ?? '—'}</td>
      <td class="c-desc">${esc(r.desc)}${r.link ? ` <button type="button" class="linkchip" data-go="${r.link}" title="Ouvrir la page ${r.link}">${r.link} ›</button>` : ''}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" style="padding:18px 14px;color:var(--muted)">Aucune ligne ne correspond au filtre.</td></tr>';
  const byKey = new Map(rows.map((x) => [keyOf(x.path), x]));
  tb.querySelectorAll('tr[data-key]').forEach((tr) => {
    const item = byKey.get(tr.dataset.key);
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-tog], [data-go]')) return;
      select(item.path, { focus: true });
    });
    tr.addEventListener('dblclick', (e) => {
      if (e.target.closest('[data-tog], [data-go]')) return;
      if (item.group) toggleGroup(item.path);
    });
    tr.addEventListener('mouseenter', () => { if (is3d()) viewer.setHover(path3d(item.path)); });
    tr.addEventListener('mouseleave', () => viewer?.setHover(null));
  });
  tb.querySelectorAll('[data-tog]').forEach((b) => b.addEventListener('click', () => toggleGroup(byKey.get(b.dataset.tog).path)));
}

function markRow(path, cls) {
  document.querySelectorAll(`#rows tr.${cls}`).forEach((tr) => tr.classList.remove(cls));
  if (!path) return;
  document.querySelectorAll(`#rows tr[data-key3d="${CSS.escape(keyOf(path))}"]`).forEach((tr) => tr.classList.add(cls));
}

function select(path, { focus = false, from3d = false } = {}) {
  S.selected = path?.length ? path : null;
  const row = S.selected ? rowAt(S.selected) : null;
  document.querySelectorAll('#rows tr.sel').forEach((tr) => tr.classList.remove('sel'));
  if (row) {
    const tr = document.querySelector(`#rows tr[data-key="${CSS.escape(keyOf(S.selected))}"]`);
    tr?.classList.add('sel');
    if (tr && from3d) tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  if (is3d()) {
    const p3 = row ? path3d(S.selected) : null;
    viewer.setSelected(p3);
    if (row && focus && viewer.resolve(p3).length && !narrow()) viewer.focusPath(p3);
  }
  renderDetail();
  renderSectionBar();
  if (row && from3d && narrow()) toast(`Réf. ${row.ref} · ${row.pn || '—'} · ${row.desc}`, 3500);
}

function renderDetail() {
  const box = $('#detail');
  if (!box) return;
  const path = S.selected;
  const row = path ? rowAt(path) : null;
  if (!row) { box.hidden = true; box.innerHTML = ''; return; }
  const eq = S.eq;
  box.hidden = false;
  const long = row.ref.length > 3;
  const flags = row.flags.map((f) => `<div class="flag ${f.level}">${esc(f.text)}${f.refs?.length ? `<span class="lnk">${f.refs.map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${o.source.sheet} réf. ${esc(o.ref)} · ${esc(o.desc)}</button>`).join('')}</span>` : ''}</div>`).join('');
  const others = (row.usedIn || []).filter((o) => !row.flags.some((f) => f.refs?.includes(o)));
  const used = others.length ? `<div class="meta">Aussi listé : <span class="lnk">${others.map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${o.source.sheet} réf. ${esc(o.ref)}</button>`).join(' ')}</span></div>` : '';
  const mirror = row.mirrorOf ? `<div class="flag info">Pièce symétrique (côté gauche) : la 3D met en évidence la pièce droite, réf. ${esc(row.mirrorOf)}.</div>` : '';
  const ids = [row.supplier && `Fournisseur ${esc(row.supplier)}`, row.sandvik && row.sandvik !== 'N/A' && `Sandvik ${esc(row.sandvik)}`].filter(Boolean).join(' · ');
  // Fil du groupe : où se trouve la pièce dans l'arbre des sous-assemblages.
  const trail = path.length > 1 ? `<div class="trail">Dans ${path.slice(0, -1).map((_, i) => {
    const g = rowAt(path.slice(0, i + 1));
    return `<button type="button" class="chip" data-sel="${esc(keyOf(path.slice(0, i + 1)))}">${esc(g.link)} · ${esc(eq.assemblies.get(g.link)?.titleFr || g.desc)}</button>`;
  }).join(' › ')}</div>` : '';
  const group = isGroupPath(path);
  const open = group && S.expanded.has(keyOf(path));
  const p3 = is3d() ? path3d(path) : null;
  const cutHere = p3 && viewer?.hasInterior(p3);
  const cutActive = S.section.on && S.section.scope === 'selection';
  box.innerHTML = `
    <div class="row1">
      <span class="ref ${long ? 'long' : ''}">${long ? '▸' : esc(row.ref)}</span>
      <div style="min-width:0"><h3>${esc(row.desc)}</h3>
        <div class="meta">${row.qty != null ? `Qté au manuel : ${row.qty}` : 'Qté non indiquée'} · feuille ${row.source.sheet}${ids ? ` · ${ids}` : ''}</div></div>
      <button type="button" class="close" id="d-close" aria-label="Fermer la fiche">×</button>
    </div>
    ${trail}
    <div class="pnline">${row.pn ? `<span class="pnbig">${esc(row.pn)}</span>` : `<span class="meta">${row.supplier ? `N° fournisseur : <span class="mono">${esc(row.supplier)}</span>` : 'Aucun numéro de pièce'}</span>`}</div>
    ${mirror}${flags}${used}
    <div class="actions">
      ${group ? `<button type="button" class="btn primary" id="d-tog">${open ? 'Rassembler ce groupe' : 'Éclater ce groupe'}</button>` : ''}
      ${cutHere ? `<button type="button" class="btn" id="d-cut">${cutActive ? 'Quitter la coupe' : 'Voir en coupe'}</button>` : ''}
      ${is3d() ? '<button type="button" class="btn" id="d-focus">Centrer</button>' : ''}
      ${row.link ? `<button type="button" class="btn" data-go="${row.link}">Ouvrir ${row.link} ›</button>` : ''}
      ${row.see ? row.see.map((s) => `<button type="button" class="btn" data-page="${s}">Voir ${s}</button>`).join('') : ''}
    </div>`;
  $('#d-close').addEventListener('click', () => select(null));
  $('#d-tog')?.addEventListener('click', () => toggleGroup(path));
  $('#d-cut')?.addEventListener('click', () => {
    if (cutActive) setSection({ on: false });
    else {
      setSection({ on: true, scope: 'selection', ...viewer.autoSection(p3) });
      viewer.focusPath(p3);
    }
  });
  $('#d-focus')?.addEventListener('click', () => { viewer?.focusPath(p3); if (narrow()) setPane('stage'); });
  box.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => jumpToRow(b.dataset.row)));
  box.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => select(b.dataset.sel.split('>'), { focus: true })));
}

function jumpToRow(key) {
  const eq = S.eq;
  const r = eq.rows.find((x) => x.key === key);
  if (!r) return;
  if (r.source.type === 'assembly') {
    if (isAsmView() && S.view.id === r.source.id) select([r.ref], { focus: true });
    else { history.replaceState(null, '', `#${hashFor(r.source.id)}`); openAssembly(r.source.id, { select: [r.ref] }); }
  } else {
    history.replaceState(null, '', `#${hashFor(r.source.id)}`);
    openDocument(r.source.id);
    select([r.ref]);
    document.querySelector(`#rows tr[data-key="${CSS.escape(r.ref)}"]`)?.scrollIntoView({ block: 'center' });
  }
  if (narrow()) setPane('panel');
}

// ------------------------------------------------------------------ vue en coupe

function setSection(patch) {
  S.section = { ...S.section, ...patch };
  if (S.section.scope === 'selection' && !S.selected) S.section.scope = 'all';
  viewer?.setSection(S.section);
  renderSectionBar();
  renderDetail();
}

function renderSectionBar() {
  const bar = $('#sectionbar');
  const sec = S.section;
  $('#btn-section').setAttribute('aria-pressed', String(sec.on));
  bar.hidden = !sec.on || !is3d();
  bar.querySelectorAll('[data-axis]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.axis === sec.axis)));
  $('#secpos').value = Math.round(sec.pos * 100);
  const scope = $('#sec-scope');
  scope.disabled = !S.selected;
  scope.setAttribute('aria-pressed', String(sec.scope === 'selection'));
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

// ------------------------------------------------------------------ pages du manuel

let zoom = 'fit';
function openPage(sheet) {
  const eq = S.eq;
  const n = eq.document.sheets;
  const num = Math.min(n, Math.max(1, parseInt(sheet.replace(/^\D+/, ''), 10) || 1));
  const s = eq.sheetId(num);
  const owner = eq.sheetOwner.get(s);
  const owner3d = eq.assemblies.has(owner) && !!(MODELS[eq.id] || {})[owner];
  const m = $('#modal');
  m.hidden = false;
  m.innerHTML = `
    <div class="bar">
      <button type="button" class="btn" id="p-prev" ${num <= 1 ? 'disabled' : ''} aria-label="Page précédente">‹</button>
      <strong>${s}</strong><span>${esc(eq.sheetTitles[s] || '')}</span>
      <button type="button" class="btn" id="p-next" ${num >= n ? 'disabled' : ''} aria-label="Page suivante">›</button>
      <span class="sp"></span>
      <button type="button" class="btn" id="p-zoom">${zoom === 'fit' ? 'Taille réelle' : 'Ajuster'}</button>
      ${owner ? `<button type="button" class="btn" id="p-open">${owner3d ? 'Ouvrir en 3D' : 'Ouvrir la liste'}</button>` : ''}
      <button type="button" class="btn" id="p-close">Fermer</button>
    </div>
    <div class="canvas"><img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du manuel" id="p-img"></div>`;
  const img = $('#p-img');
  // Page absente (publication allégée : pages de liste laissées de côté).
  img.addEventListener('error', () => {
    m.querySelector('.canvas').innerHTML = `<p class="missing">La page ${s} n'est pas incluse dans cette version du site.${owner ? ' Sa liste de pièces est reprise dans « Ouvrir la liste ».' : ''}</p>`;
  });
  const fit = () => {
    const c = m.querySelector('.canvas');
    const ratio = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5;
    if (zoom === 'fit') {
      const w = Math.min(c.clientWidth - 32, (c.clientHeight - 16) * ratio);
      img.style.width = `${Math.max(200, w)}px`;
    } else img.style.width = `${img.naturalWidth || 2200}px`;
  };
  img.addEventListener('load', fit);
  fit();
  $('#p-prev').addEventListener('click', () => openPage(eq.sheetId(num - 1)));
  $('#p-next').addEventListener('click', () => openPage(eq.sheetId(num + 1)));
  $('#p-zoom').addEventListener('click', () => { zoom = zoom === 'fit' ? 'full' : 'fit'; openPage(s); });
  $('#p-close').addEventListener('click', closePage);
  $('#p-open')?.addEventListener('click', () => { closePage(); go(owner); });
}
function closePage() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

// ------------------------------------------------------------------ catalogue

function renderCatalogue() {
  const c = $('#catalogue');
  c.innerHTML = `<div class="cat-inner">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><h1>Équipements</h1>${S.view ? `<button type="button" class="btn" data-go="${S.eq.root}" style="margin-left:auto">Retour à ${esc(S.eq.name)}</button>` : ''}</div>
    <p>Chaque équipement provient d'un manuel de pièces : listes extraites page par page, assemblages en 3D éclatée jusqu'au plus petit ensemble, vues en coupe, schémas et contrôle des listes.</p>
    <div class="cards">
      ${S.index.map((e) => `<button type="button" class="card" data-hash="#${esc(e.id)}.">
        <img src="${esc(e.thumbnail)}" alt="${esc(e.name)}">
        <span class="cb"><strong>${esc(e.name)}</strong><span>${esc(e.manufacturer)} · ${esc(e.category)}</span><span>${esc(e.status)}</span></span></button>`).join('')}
      <div class="card add"><strong>Ajouter un équipement</strong>
        <ol><li>Déposer le PDF du manuel de pièces.</li><li>Extraire les listes (outil <span class="mono">tools/extract_parts.py</span>, ou <span class="mono">tools/extract_sandvik.py</span> pour un manuel Sandvik) et relire.</li><li>Modéliser chaque assemblage (formes paramétriques) ou importer un modèle CAO (.glb).</li></ol>
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
      if ((S.eq?.assemblies.has(t) || S.eq?.documents.has(t)) && narrow()) setPane('stage');
      go(t);
      return;
    }
    const h = e.target.closest('[data-hash]');
    if (h) { e.preventDefault(); location.hash = h.dataset.hash; return; }
    const p = e.target.closest('[data-page]');
    if (p) { e.preventDefault(); openPage(p.dataset.page); }
  });
  $('#brand').addEventListener('click', () => go('catalogue'));
  document.querySelectorAll('#mtabs button').forEach((b) => b.addEventListener('click', () => setPane(b.dataset.pane)));

  const slider = $('#explode');
  slider.addEventListener('input', () => { S.explode = slider.value / 100; viewer?.setExplode(S.explode, { animate: false }); });
  slider.addEventListener('change', () => {
    if (S.explode < 0.02 && S.expanded.size) { explodeEverything(false); return; }
    viewer?.frame();
  });
  $('#btn-assemble').addEventListener('click', () => explodeEverything(false));
  $('#btn-explode').addEventListener('click', () => setMainExplode(1));
  $('#btn-explode-all').addEventListener('click', () => explodeEverything(true));

  const lb = $('#btn-labels');
  lb.setAttribute('aria-pressed', String(S.labels));
  lb.addEventListener('click', () => {
    S.labels = !S.labels;
    lb.setAttribute('aria-pressed', String(S.labels));
    viewer?.setLabels(S.labels);
    try { localStorage.setItem('pieces3d.labels', S.labels ? '1' : '0'); } catch { /* ignoré */ }
  });
  const eb = $('#btn-edges');
  eb.setAttribute('aria-pressed', String(S.edges));
  eb.addEventListener('click', () => {
    S.edges = !S.edges;
    eb.setAttribute('aria-pressed', String(S.edges));
    viewer?.setEdges(S.edges);
    try { localStorage.setItem('pieces3d.edges', S.edges ? '1' : '0'); } catch { /* ignoré */ }
  });
  const iso = $('#btn-isolate');
  iso.addEventListener('click', () => {
    S.isolate = !S.isolate;
    iso.setAttribute('aria-pressed', String(S.isolate));
    viewer?.setIsolate(S.isolate);
    if (S.isolate && !S.selected) toast('Sélectionnez une pièce : les autres seront estompées.');
  });
  $('#btn-frame').addEventListener('click', () => viewer?.frame());
  $('#btn-page').addEventListener('click', () => { if (isAsmView()) openPage(S.view.id); });

  // Vue en coupe
  $('#btn-section').addEventListener('click', () => setSection({ on: !S.section.on, scope: S.section.on ? S.section.scope : 'all' }));
  document.querySelectorAll('#sectionbar [data-axis]').forEach((b) => b.addEventListener('click', () => setSection({ axis: b.dataset.axis })));
  $('#secpos').addEventListener('input', (e) => setSection({ pos: e.target.value / 100 }));
  $('#sec-flip').addEventListener('click', () => setSection({ flip: !S.section.flip }));
  $('#sec-scope').addEventListener('click', () => setSection({ scope: S.section.scope === 'selection' ? 'all' : 'selection' }));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) closePage();
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

init();
