import './styles.css';
import { Viewer } from './viewer/Viewer.js';
import { buildProcedural } from './viewer/assembly.js';
import { loadIndex, loadEquipment, search, sourceLabel, sheetLabel, sizeGroups, isPnText } from './data/equipment.js';
import cubexModels from './models/cubex-mri-5200/index.js';
import du311Models from './models/du311/index.js';
import du311StdModels, { overview as du311StdOverview } from './models/du311-std/index.js';
import epirocModels from './models/epiroc-ith/index.js';
import './ui/resize.js';
import { createAtelier, isAtelierToken } from './ui/atelier.js';
import { icon } from './ui/icons.js';

// Modèles 3D disponibles par équipement (builders procéduraux).
const MODELS = { 'cubex-mri-5200': cubexModels, du311: du311Models, 'du311-std': du311StdModels, 'epiroc-ith': epirocModels };
// Vue d'ensemble légère : sous-assemblages simplifiés affichés d'abord, remplacés
// un à un par leur version détaillée (facettes allégées) une fois la vue montrée.
const OVERVIEW = { 'du311-std': du311StdOverview };
// Appareils modestes (téléphone, peu de mémoire) : la vue d'ensemble reste simplifiée.
const LIGHT = (navigator.deviceMemory && navigator.deviceMemory < 4) || matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
let detailToken = 0;

// Développement (npm run dev) : un fichier src/models/<eq>/parts/Pxxx.js pas
// encore inscrit dans parts/index.js (brouillon) s'affiche quand même, pour
// l'assemblage ouvert et ses sous-assemblages. Absent du site publié.
const DRAFTS = import.meta.env.DEV ? import.meta.glob('./models/*/parts/P*.js') : {};

async function loadDrafts(eq, id) {
  const ids = new Set();
  const walk = (k) => {
    if (ids.has(k) || !eq.assemblies.has(k)) return;
    ids.add(k);
    eq.assemblies.get(k).parts.forEach((r) => r.link && walk(r.link));
  };
  walk(id);
  const models = (MODELS[eq.id] = { ...(MODELS[eq.id] || {}) });
  await Promise.all([...ids].map(async (k) => {
    const load = DRAFTS[`./models/${eq.id}/parts/${k}.js`];
    if (load) models[k] = (await load()).default;
  }));
}

// Version complète du site (toutes les pages du manuel) : la publication
// allégée en Artifact y renvoie pour les pages qu'elle n'inclut pas.
const SITE = 'https://frankyray21.github.io/pieces-3d/';

// Page d'accueil 3D : consigne affichée sous la scène.
const HOME_HINT = "Clic : ouvrir la page de l'outil · glisser : tourner · clic droit : déplacer";
// Disposition en hauteur d'une page d'accueil quand la scène est plus haute que large d'au moins ce rapport
// (à l'ouverture) ; ensuite, hystérésis : on la quitte sous 1, on y revient au-delà de 1,4 (clavier, barre d'adresse).
const PORTRAIT_RATIO = 1.2;
const PORTRAIT_LEAVE = 1;
const PORTRAIT_ENTER = 1.4;

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
  edges: false, // contours des pièces (traits du dessin) : en option, rendu réaliste par défaut
  isolate: false,
  explode: 0,
  section: { on: false, axis: 'z', pos: 0.5, flip: false, scope: 'all' },
  railTab: 'sys', // sommaire : « sys » (par système) ou « asm » (arbre des assemblages)
  atlSel: null, // élément d'atelier sélectionné (« t:3 », « n:P084-… ») et sa vue
  atlSelView: null,
  atlSys: null, // filtre par système des vues d'atelier
  atlKind: null, // filtre par type des consignes
};
let viewer = null;

try { S.labels = localStorage.getItem('pieces3d.labels') !== '0'; } catch { /* préférence non disponible */ }
try { S.edges = localStorage.getItem('pieces3d.contours') === '1'; } catch { /* préférence non disponible */ }
try { S.railTab = localStorage.getItem('pieces3d.sommaire') || 'sys'; } catch { /* préférence non disponible */ }

// Documentation d'atelier (systèmes, données techniques, entretien, consignes, schémas).
const atl = createAtelier({
  S, $, esc, badge, go, follow, openPage, jumpToRow, setPane, narrow,
  has3d: (id) => !!(MODELS[S.eq?.id] || {})[id],
});

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
  if (!$('#modal').hidden) closePage(); // retour arrière avec une page ouverte : on la ferme
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
    S.atlSel = null;
    S.atlSys = null;
    S.atlKind = null;
    const doc = S.eq.docWord === 'catalogue' ? 'catalogue' : 'manuel';
    $('#btn-page').textContent = `Page du ${doc}`;
    $('#btn-page').title = `Voir la page du ${doc}`;
    $('#btn-labels').title = `Afficher les repères du ${doc}`;
  }
  const eq = S.eq;
  // Page d'accueil (adresse sans « # ») : la liste des équipements.
  const home = raw === '' || token === 'catalogue';
  $('#catalogue').hidden = !home;
  if (home) { document.title = 'Équipements · Pièces 3D'; renderCatalogue(); return; }
  if (token === 'controle') return openIssues();
  if (eq.atelier && isAtelierToken(token)) return openAtelier(token);
  if (eq.assemblies.has(token)) return openAssembly(token);
  if (eq.documents.has(token)) return openDocument(token);
  openAssembly(eq.root);
}

function go(token) {
  const h = `#${hashFor(token)}`;
  if (location.hash === h) route();
  else location.hash = h;
}

/** Suit un lien vers une page (sur téléphone, on passe à la vue 3D ou au dessin). */
function follow(token) {
  if ((S.eq?.assemblies.has(token) || S.eq?.documents.has(token) || isAtelierToken(token)) && narrow()) setPane('stage');
  go(token);
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

/**
 * Chemin des objets 3D. Les pièces gauches symétriques pointent vers la pièce
 * droite ; une ligne répétée (« same ») vers la première ; un ensemble (« A »,
 * groupe explicite) ou une plage de repères (« 1-5 », « B,2-14 ») vers toutes
 * ses pièces, sous la forme « 1|2|3|4|5 » que la visionneuse sait résoudre.
 */
function path3d(path) {
  const out = [];
  let asm = S.view?.type === 'assembly' ? S.eq.assemblies.get(S.view.id) : null;
  for (let i = 0; i < path.length; i++) {
    const row = rowAt(path.slice(0, i + 1));
    out.push(target3d(row, asm) || path[i]);
    asm = row?.link ? S.eq.assemblies.get(row.link) : null;
  }
  return out;
}

function target3d(row, asm) {
  if (!row) return null;
  if (row.group) return row.group.join('|');
  const t = row.mirrorOf || row.same || row.ref;
  const refs = expandRef(t, asm);
  return refs ? refs.join('|') : t;
}

const RANGE = /^(?:[A-Z]|\d+[A-Z]?)(?:[-,]\d+[A-Z]?)+$/;
/** Repères d'une plage « 12-22 », « B,2-14 » ou « 1-3-6 » présents dans la liste. */
function expandRef(ref, asm) {
  if (!asm || !RANGE.test(ref)) return null;
  const known = new Set(asm.parts.map((p) => p.ref));
  const out = [];
  for (const tok of ref.split(',')) {
    const n = tok.split('-');
    if (n.length === 2 && /^\d+$/.test(n[0]) && /^\d+$/.test(n[1])) {
      for (let k = +n[0]; k <= +n[1]; k++) out.push(String(k));
      for (const r of known) {
        const m = /^(\d+)[A-Z]$/.exec(r);
        if (m && +m[1] >= +n[0] && +m[1] <= +n[1]) out.push(r);
      }
    } else out.push(...n);
  }
  const res = out.filter((r) => known.has(r) && r !== ref);
  return res.length ? res : null;
}

/** Repère affiché (une ligne répétée garde le repère du catalogue). */
const refLabel = (r) => r.label ?? r.ref;

/** Badge d'une page : « P024 » (manuel) ou « 24 » (catalogue). */
function badge(s) {
  return S.eq.docWord === 'catalogue' ? String(parseInt(String(s).replace(/^\D+/, ''), 10)) : s;
}

/** Numéros d'une ligne : un par taille (regroupés), ou texte du catalogue. */
function pnHtml(r, big = false) {
  const val = (v) => (isPnText(v) ? `<span class="${big ? 'pnbig' : ''}">${esc(v)}</span>` : `<span class="pnt">${esc(v === '-' ? '—' : v)}</span>`);
  if (r.sizes) {
    // Étiquette de plusieurs tailles (« NW · HW · HWT ») au-dessus du numéro.
    return sizeGroups(r).map(([v, ss]) => {
      const label = ss.join(' · ');
      return `<span class="szl${!big && label.length > 5 ? ' stack' : ''}"><span class="sz">${esc(label)}</span>${val(v)}</span>`;
    }).join('');
  }
  if (r.pn) return big ? `<span class="pnbig">${esc(r.pn)}</span>` : esc(r.pn);
  if (r.pnText) return `<span class="pnt">${esc(r.pnText)}</span>`;
  return null;
}

function isGroupPath(path) {
  if (!is3d() || S.view.home) return false;
  const row = rowAt(path);
  return !!row?.link && viewer.isGroup(path3d(path));
}

// ------------------------------------------------------------------ assemblages 3D

function ensureViewer() {
  if (viewer) return viewer;
  viewer = new Viewer($('#viewport'), {
    insets: viewInsets,
    onHover: (path) => markRow(path, 'hov'),
    onSelect: (path, { double }) => {
      if (!path) { select(null); return; }
      // Page d'accueil : chaque outil ouvre sa page (pas de vue éclatée).
      if (S.view.home) { openLinked(path); return; }
      if (double && isGroupPath(path)) { toggleGroup(path); return; }
      select(path, { from3d: true });
    },
  });
  viewer.setLabels(S.labels);
  viewer.setEdges(S.edges);
  if (import.meta.env.DEV) window.viewer = viewer; // inspection (scripts de captures)
  return viewer;
}

// Vrai quand la vue courante est un assemblage modélisé en 3D (sinon : dessins du manuel).
function is3d() {
  return !!viewer && isAsmView() && S.view.is3d;
}

/** Page d'accueil (view.home) : l'objet cliqué ouvre la page liée de sa ligne. */
function openLinked(path) {
  const row = rowAt(path.slice(0, 1));
  if (row?.link) follow(row.link);
  else select(path.slice(0, 1), { from3d: true });
}

/**
 * Scène plus haute que large (téléphone tenu droit) : disposition en hauteur
 * des pages qui s'y prêtent. current : disposition actuelle (hystérésis).
 */
function portraitStage(current = null) {
  const st = $('#stage');
  const w = st.clientWidth || window.innerWidth, h = st.clientHeight || window.innerHeight;
  return h > w * (current == null ? PORTRAIT_RATIO : current ? PORTRAIT_LEAVE : PORTRAIT_ENTER);
}

let baseHint = null;

/** Page d'accueil dans une petite scène (téléphone) : le cartouche cacherait des outils, il est masqué. */
function fitHomeChrome() {
  const st = $('#stage');
  // Scène masquée (onglet Pièces ou Assemblages sur téléphone) : rien à mesurer.
  if (!is3d() || !st.clientWidth || !st.clientHeight) return;
  $('#titleblock').hidden = !!S.view.home && (st.clientWidth < 640 || st.clientHeight < 520);
}

/** Saisie en cours (le clavier du téléphone réduit la scène) : pas de nouvelle disposition. */
function typing() {
  const a = document.activeElement;
  return !!a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'range'));
}

/**
 * Scène redimensionnée (rotation du téléphone, panneaux, onglets) : autre
 * disposition de la page d'accueil si la scène passe de large à haute, et
 * cartouche ajusté. Seul le modèle est refait : liste, filtre et sélection restent.
 */
function fitHome() {
  const st = $('#stage');
  if (!is3d() || !st.clientWidth || !st.clientHeight) return;
  if (S.view.portrait != null && !typing()) {
    const portrait = portraitStage(S.view.portrait);
    if (portrait !== S.view.portrait) {
      S.view.portrait = portrait;
      const model = buildProcedural(MODELS[S.eq.id] || {}, S.view.id, { portrait });
      if (model) {
        viewer.setModel(model);
        if (S.selected) viewer.setSelected(path3d(S.selected));
      }
    }
  }
  fitHomeChrome();
}

/** Marges de cadrage d'un assemblage : hors de la barre d'outils (haut) et du cartouche (bas). */
function viewInsets() {
  const vp = $('#viewport').getBoundingClientRect();
  const tools = $('#tools'), tb = $('#titleblock');
  const top = tools.hidden ? 0 : tools.getBoundingClientRect().bottom - vp.top + 6;
  const bottom = tb.hidden || !tb.offsetHeight ? 0 : vp.bottom - tb.getBoundingClientRect().top + 6;
  return { top, bottom };
}

/**
 * Marges de cadrage de la page d'accueil : sous la barre d'outils, place pour
 * les légendes du bas et pour celles qui dépassent des outils en bout de rangée.
 */
function homeInsets() {
  const st = $('#stage').getBoundingClientRect(), tools = $('#tools').getBoundingClientRect();
  return { top: Math.max(0, tools.bottom - st.top) + 6, bottom: 34, side: S.view?.portrait ? 40 : 0 };
}

async function openAssembly(id, { select: selPath = null } = {}) {
  const eq = S.eq;
  const asm = eq.assemblies.get(id);
  const prev = S.view;
  const same = isAsmView() && prev.id === id;
  if (import.meta.env.DEV) await loadDrafts(eq, id);
  const builders = MODELS[eq.id] || {};
  const builder = builders[id];
  const has3d = !!builder;
  // home : connu une fois le modèle construit (view.home) ; portrait : null si le builder ne s'adapte pas.
  S.view = { type: 'assembly', id, is3d: has3d, home: same && !!prev.home, portrait: same ? prev.portrait : (builder?.responsive ? portraitStage() : null) };
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
    detailToken++;
    const ov = OVERVIEW[eq.id]?.root === id ? OVERVIEW[eq.id] : null;
    const model = buildProcedural(ov ? { ...builders, ...ov.builders } : builders, id, S.view.portrait != null ? { portrait: S.view.portrait } : {});
    $('#loading').hidden = true;
    renderTitleblock(asm); // avant le cadrage, qui évite le cartouche
    if (model) {
      S.view.home = !!model.view.home;
      v.insets = S.view.home ? homeInsets : viewInsets;
      v.setModel(model);
      v.setIsolate(S.isolate && !S.view.home);
      if (ov && !LIGHT) upgradeDetail(model, builders, ov);
      S.section.axis = model.view.section?.axis || 'z';
      S.section.pos = model.view.section?.pos ?? 0.5;
      if (S.explode > 0 && !S.view.home) {
        v.setExplode(S.explode);
        v.frame();
      }
    }
    renderSectionBar();
  }
  // Page d'accueil : barre d'outils sans éclatement, consigne adaptée.
  $('#tools').classList.toggle('home', !!S.view.home);
  fitHomeChrome();
  baseHint ??= $('#hint').textContent;
  $('#hint').textContent = S.view.home ? HOME_HINT : baseHint;
  renderRail();
  renderCrumbs();
  renderTitleblock(asm);
  renderPanel();
  if (selPath) select(selPath, { focus: true });
}

/**
 * Vue d'ensemble : remplace un à un les sous-assemblages simplifiés par leur
 * version détaillée, entre deux images (la page reste utilisable) ; abandonné
 * si l'on change de vue.
 */
function upgradeDetail(model, builders, ov) {
  const token = detailToken;
  const queue = (model.root.userData.parts || []).filter((p) => p.userData.isAssembly && ov.builders[p.userData.assemblyId]);
  const badge = $('#loadingDetail');
  const live = () => token === detailToken && viewer?.model === model;
  badge.hidden = !queue.length;
  const step = () => {
    if (!live() || !queue.length) { if (token === detailToken) badge.hidden = true; return; }
    const p = queue.shift();
    const det = buildProcedural(builders, p.userData.assemblyId, { quality: ov.quality });
    if (det && live()) viewer.replacePart(p, det.root);
    setTimeout(step, 60);
  };
  setTimeout(step, 400);
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
  showSheets(doc.sheets, { doc: id });
  renderRail();
  renderCrumbs();
  renderPanel();
}

// Pages du manuel affichées dans la scène (schémas, ou dessins d'un assemblage sans 3D),
// avec les bulles cliquables des repères et, pour un schéma, la couleur des circuits.
function showSheets(sheets, { doc = null } = {}) {
  const eq = S.eq;
  const dv = $('#docview');
  dv.hidden = false;
  dv.classList.remove('atl-view');
  dv.dataset.iso = '';
  const legend = doc ? atl.legend(doc) : '';
  dv.innerHTML = legend + (sheets.map((s) => `
    <figure data-sheet="${s}">
      <div class="pg"><img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du ${eq.docWord} : ${esc(eq.sheetTitles[s] || '')}" data-sheet="${s}" loading="lazy">${atl.overlay(s)}</div>
      <figcaption><span class="mono">${eq.docWord === 'catalogue' ? sheetLabel(eq, s) : `${eq.document.reference.split(',')[0]}-${s}`}</span> · ${esc(atl.sheetTitle(s) || eq.sheetTitles[s] || '')} — cliquez pour agrandir${atl.has() && eq.atelier.hotspots?.[s] ? ', ou une bulle pour voir la pièce' : ''}</figcaption>
    </figure>`).join('') || `<p class="sub">Aucun dessin pour cette liste au ${eq.docWord}.</p>`);
  dv.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => openPage(img.dataset.sheet));
    img.addEventListener('load', () => img.closest('figure').classList.toggle('portrait', img.naturalHeight > img.naturalWidth));
    img.addEventListener('error', () => { img.closest('figure').innerHTML = missingPage(img.dataset.sheet); });
  });
  dv.querySelectorAll('.ovl .hs').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    select([b.dataset.hs], { from3d: true });
  }));
  dv.querySelectorAll('.ovl .xr').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); atl.gotoRung(+b.dataset.rung, b.dataset.doc); }));
  dv.querySelectorAll('.legend-bar [data-circ]').forEach((b) => b.addEventListener('click', () => atl.isolate(dv, b.dataset.circ)));
  dv.scrollTop = 0;
}

/** Message à la place d'une page absente de cette publication (version allégée). */
function missingPage(s, extra = '') {
  const full = location.href.startsWith(SITE) ? '' : ` <a href="${SITE}${esc(location.hash)}" target="_blank" rel="noopener">Voir la version complète du site</a>.`;
  return `<p class="missing">La page ${s} n'est pas incluse dans cette version du site.${extra}${full}</p>`;
}

/** Vue d'atelier : données techniques, entretien, consignes, schémas, ou page d'un système. */
async function openAtelier(token) {
  const eq = S.eq;
  // Une sélection n'a de sens que dans la vue où elle a été faite.
  if (S.atlSelView !== token) S.atlSel = null;
  if (token.startsWith('sys-')) S.atlSys = null;
  S.view = { type: 'atelier', id: token };
  S.selected = null;
  document.title = `${atl.title(token)} · ${eq.name} · Pièces 3D`;
  $('#viewport').hidden = true;
  $('#tools').hidden = true;
  $('#sectionbar').hidden = true;
  $('#hint').hidden = true;
  $('#titleblock').hidden = true;
  atl.render();
  renderRail();
  renderCrumbs();
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
      <span class="sheet ${partial && models[id] ? 'm3d' : ''}">${badge(a.sheet)}</span><span class="t">${a.children.length && !open ? '▸ ' : ''}${esc(a.titleFr)}</span>
      <span class="n">${err ? `<span class="alert" title="Numéros à vérifier">!</span> ` : ''}${a.parts.length}</span></button>${kids}</li>`;
  };
  const docs = [...eq.documents.values()].map((d) => `<li><button type="button" class="node ${d.id === cur ? 'cur' : ''}" data-go="${d.id}">
    <span class="sheet">${badge(d.sheets[d.sheets.length - 1])}</span><span class="t">${esc(d.titleFr)}</span><span class="n">${d.parts.length}</span></button></li>`).join('');
  const errors = eq.issues.filter((r) => r.flags.some((f) => f.level === 'error')).length;
  // Légende des assemblages en 3D : liens directs s'ils sont peu nombreux.
  const tops = [...eq.assemblies.values()].filter((a) => models[a.id] && !models[a.parent]);
  const open3d = tops.length <= 8
    ? ` Ouvrir : ${tops.map((a) => `<button type="button" class="lnk" data-go="${a.id}">${badge(a.sheet)} ${esc(a.titleFr)}</button>`).join('')}`
    : ' Leur numéro de page est encadré dans la liste.';
  const asmTree = `
    <div><h2>Assemblages${n3d && !partial ? ' 3D' : ''}</h2>${partial ? `<p class="legend"><span class="sheet m3d">3D</span><span>${n3d} assemblages en 3D, les autres avec les dessins du ${eq.docWord}.${open3d}</span></p>` : ''}<ul class="tree">${node(eq.root)}</ul></div>
    <div><h2>${esc(eq.labels?.documents || 'Schémas et listes')}</h2><ul class="tree">${docs}</ul></div>`;
  const manual = `
    <div><h2>${eq.docWord === 'catalogue' ? 'Catalogue' : 'Manuel'}</h2><ul class="tree">
      <li><button type="button" class="node ${cur === 'controle' ? 'cur' : ''}" data-go="controle"><span class="sheet">QC</span><span class="t">Contrôle des listes</span><span class="n">${errors ? `<span class="alert">${errors}</span> / ` : ''}${eq.issues.length}</span></button></li>
      <li><button type="button" class="node" data-page="${eq.sheetId(1)}"><span class="sheet">PDF</span><span class="t">Pages du ${eq.docWord} (${eq.document.sheets})</span><span class="n"></span></button></li>
    </ul></div>`;
  const head = `<div class="equip"><strong>${esc(eq.name)}</strong><span>${esc(eq.category)} · ${eq.serial ? `n° de série ${esc(eq.serial)}` : esc(eq.document.title)}</span></div>`;
  const a = atl.railHtml();
  if (!a) {
    $('#rail').innerHTML = `${head}${asmTree}${manual}
      <details class="more"><summary>Fiche technique</summary>
        <dl class="specs">${eq.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
        ${eq.weights.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      </details>`;
    return;
  }
  // Sommaire d'atelier : vues transversales, puis navigation par système ou par assemblage.
  const tab = S.railTab === 'asm' ? 'asm' : 'sys';
  $('#rail').innerHTML = `${head}
    <div><h2>Atelier</h2>${a.nav}</div>
    <div class="railtabs" role="tablist" aria-label="Navigation">
      <button type="button" role="tab" data-rtab="sys" aria-selected="${tab === 'sys'}">${icon('general')}Systèmes</button>
      <button type="button" role="tab" data-rtab="asm" aria-selected="${tab === 'asm'}">${icon('page')}Assemblages</button>
    </div>
    ${tab === 'sys' ? `<div role="tabpanel">${a.systems}</div>` : `<div role="tabpanel" class="rpanel">${asmTree}</div>`}
    ${manual}`;
}

function renderCrumbs() {
  const eq = S.eq;
  const chain = [];
  if (isAsmView()) {
    let id = S.view.id;
    while (id) { chain.unshift(id); id = eq.assemblies.get(id).parent; }
  }
  const items = [`<button type="button" data-go="${eq.root}">${esc(eq.name)}</button>`];
  // Fil d'Ariane d'atelier : équipement › système › composant (ses parents du même système).
  const sys = atl.crumbSystem();
  if (sys) items.push(`<button type="button" class="sys ${S.view.type === 'atelier' ? 'cur' : ''}" data-go="sys-${sys.id}">${sys.chip}${esc(sys.name)}</button>`);
  if (S.view.type === 'atelier') {
    if (!S.view.id.startsWith('sys-')) items.push(`<button type="button" class="cur" data-go="${S.view.id}">${esc(atl.title(S.view.id))}</button>`);
  } else if (isAtelierCrumbs(sys)) {
    const own = chain.filter((id, i) => i === chain.length - 1 || atl.sysOf(id) === sys.id);
    own.forEach((id, i) => items.push(`<button type="button" class="${i === own.length - 1 ? 'cur' : ''}" data-go="${id}">${badge(eq.assemblies.get(id).sheet)} · ${esc(eq.assemblies.get(id).titleFr)}</button>`));
  } else if (isAsmView()) {
    chain.forEach((id, i) => items.push(`<button type="button" class="${i === chain.length - 1 ? 'cur' : ''}" data-go="${id}">${badge(eq.assemblies.get(id).sheet)} · ${esc(eq.assemblies.get(id).titleFr)}</button>`));
  } else if (S.view.type === 'document') {
    const d = eq.documents.get(S.view.id);
    items.push(`<button type="button" class="cur" data-go="${d.id}">${esc(d.titleFr)}</button>`);
  } else {
    items.push('<button type="button" class="cur" data-go="controle">Contrôle des listes</button>');
  }
  $('#crumbs').innerHTML = items.join('<span class="sep">›</span>');
}

/** Fil d'Ariane par système (pas pour la vue d'ensemble, racine de l'arbre). */
function isAtelierCrumbs(sys) {
  return !!sys && isAsmView() && S.view.id !== S.eq.root;
}

function renderTitleblock(asm) {
  const eq = S.eq;
  const ref = eq.document.reference.split(',')[0];
  $('#titleblock').innerHTML = `
    <button type="button" class="tb-page" data-page="${asm.sheet}" title="Ouvrir la page ${asm.sheet} du ${eq.docWord}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/><path d="M9 11h7M9 14h7M9 17h4.5"/></svg>
      <strong>${badge(asm.sheet)}</strong><small>${eq.docWord === 'catalogue' ? 'Catalogue' : 'Manuel'}</small>
    </button>
    <div class="tb-grid">
    <div><span class="k">Projet</span><span class="v">${esc(eq.name)}</span></div>
    <div><span class="k">Client</span><span class="v">${esc(eq.manufacturer)}</span></div>
    <div class="wide"><span class="k">Titre</span><span class="v">${esc(asm.title)}</span></div>
    <div><span class="k">${eq.docWord === 'catalogue' ? 'Page' : 'Feuille'}</span><span class="v">${badge(asm.sheet)} · ${asm.parts.length} lignes</span></div>
    <div><span class="k">Préparé</span><span class="v">${esc(eq.document.date)}</span></div>
    <div class="wide"><span class="v dwg">${asm.pn ? `${esc(asm.pn)}${asm.rev ? ` rév. ${esc(asm.rev)}` : ''}` : `${esc(ref)}-${asm.sheet}${eq.docWord === 'catalogue' ? '' : '-03'}`}</span></div>
    </div>`;
}

// ------------------------------------------------------------------ panneau des pièces

function renderPanel() {
  const eq = S.eq;
  const panel = $('#panel');
  if (S.view.type === 'atelier') { atl.renderPanel(); return; }
  if (S.view.type === 'issues') {
    const groups = eq.issues.slice().sort((a, b) => sevRank(b) - sevRank(a));
    panel.innerHTML = `
      <div class="phead"><h1>Contrôle des listes</h1>
        <p class="sub">${eq.issues.length} lignes du ${eq.docWord} méritent une vérification : même numéro avec des descriptions différentes, numéros presque identiques (une frappe d'écart), lignes ou numéros absents. Cliquez une ligne pour l'ouvrir.</p></div>
      <div class="tablewrap"><ul class="issues">${groups.map((r) => {
        const f = r.flags.find((x) => x.level === 'error') || r.flags.find((x) => x.level === 'warn');
        return `<li><button type="button" data-row="${esc(r.key)}">
          <span class="top"><span class="ico ${f.level}">${f.level === 'error' ? '✕' : '!'}</span><span class="mono">${esc(r.pns.join(' / ') || '—')}</span><span>${esc(r.desc)}</span></span>
          <span class="why">${esc(sourceLabel(eq, r.source))} · réf. ${esc(refLabel(r))} — ${esc(f.text)}</span></button></li>`;
      }).join('')}</ul></div>`;
    panel.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => jumpToRow(b.dataset.row)));
    return;
  }
  const isAsm = isAsmView();
  const src = isAsm ? eq.assemblies.get(S.view.id) : eq.documents.get(S.view.id);
  const list = isAsm ? [src.sheet] : src.sheets;
  const cat = eq.docWord === 'catalogue';
  const shown = (isAsm ? [src.sheet, ...(src.sheets || [])] : list).filter((x, i, a) => a.indexOf(x) === i).map(badge);
  const sheets = shown.length > 3 ? `${shown[0]} à ${shown[shown.length - 1]}` : shown.join(' / ');
  const sub = [`${cat ? (shown.length > 1 ? 'Pages' : 'Page') : 'Feuille'} ${sheets}`, src.pn && `N° ${src.pn}`,
    src.sizes && `Tailles : ${src.sizes.join(', ')}`, src.title !== src.titleFr && src.title].filter(Boolean);
  // Schéma électrique sans liste de pièces : le panneau donne ses circuits, planche par planche.
  const circuits = !isAsm && !src.parts.length ? atl.sheetList(src.id) : '';
  if (circuits) {
    panel.innerHTML = `<div class="phead"><h1>${esc(src.titleFr)}</h1><span class="sub">${sub.map(esc).join(' · ')} · circuit par circuit : touchez une planche pour y aller.</span></div><div class="tablewrap">${circuits}</div>`;
    return;
  }
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
  const match = (r) => !q || `${refLabel(r)} ${r.pns.join(' ')} ${r.pnText || ''} ${r.desc} ${r.supplier || ''}`.toUpperCase().includes(q);
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
    const refTxt = sub ? '↳' : esc(refLabel(r));
    const pn = pnHtml(r) ?? (r.nss ? '<span title="Non vendu séparément">NSS</span>' : r.supplier ? `<span title="N° fournisseur">${esc(r.supplier)}</span>` : r.pseudo ? '' : '<span class="ico warn">—</span>');
    const key = keyOf(path);
    const circ = S.view.type === 'document' ? atl.rowCircuit(S.view.id, r.label ?? r.ref) : '';
    const tog = group
      ? `<button type="button" class="tog" data-tog="${esc(key)}" aria-expanded="${open}" title="${open ? 'Rassembler ce groupe' : 'Éclater ce groupe sur place'}" aria-label="${open ? 'Rassembler' : 'Éclater'} le groupe ${esc(r.desc)}">${open ? '▾' : '▸'}</button>`
      : '<span class="tog-sp"></span>';
    return `<tr data-key="${esc(key)}" data-key3d="${esc(keyOf(path3d(path)))}" class="${sub ? 'sub-row' : ''} ${depth ? 'nested' : ''} ${key === selKey ? 'sel' : ''} ${circ ? `circ ${circ}` : ''}">
      <td class="c-ref" style="--d:${depth}">${tog}<span class="refb ${r.link ? 'link' : ''}">${refTxt}</span></td>
      <td class="c-pn">${pn}${ico}</td>
      <td class="c-qty">${r.qty ?? '—'}${r.qty3d != null && r.qty3d !== r.qty ? `<span class="q3d" title="Le dessin du ${S.eq.docWord} en montre ${r.qty3d}">${r.qty3d} en 3D</span>` : ''}</td>
      <td class="c-desc">${esc(r.desc)}${r.link ? ` <button type="button" class="linkchip" data-go="${r.link}" title="Ouvrir la page ${r.link}">${badge(S.eq.assemblies.get(r.link)?.sheet || S.eq.documents.get(r.link)?.sheets[0] || r.link)} ›</button>` : ''}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" style="padding:18px 14px;color:var(--muted)">Aucune ligne ne correspond au filtre.</td></tr>';
  const byKey = new Map(rows.map((x) => [keyOf(x.path), x]));
  tb.querySelectorAll('tr[data-key]').forEach((tr) => {
    const item = byKey.get(tr.dataset.key);
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-tog], [data-go]')) return;
      // Page d'accueil (table des matières) : la ligne ouvre sa page.
      if (S.view.home && item.r.link) { follow(item.r.link); return; }
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
  } else {
    // Dessins affichés : la bulle du repère sélectionné est mise en évidence.
    const dv = $('#docview');
    atl.markHotspots(dv, row && S.selected.length === 1 ? (row.label ?? row.ref) : null);
    if (row && focus && !from3d) dv.querySelector('.ovl .hs.sel')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
  const long = refLabel(row).length > 3;
  const flags = row.flags.map((f) => `<div class="flag ${f.level}">${esc(f.text)}${f.refs?.length ? `<span class="lnk">${f.refs.map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${badge(o.source.sheet)} réf. ${esc(refLabel(o))} · ${esc(o.desc)}</button>`).join('')}</span>` : ''}</div>`).join('');
  const others = (row.usedIn || []).filter((o) => !row.flags.some((f) => f.refs?.includes(o)));
  const used = others.length ? `<div class="meta">Aussi listé : <span class="lnk">${others.slice(0, 24).map((o) => `<button type="button" class="chip" data-row="${esc(o.key)}">${badge(o.source.sheet)} réf. ${esc(refLabel(o))}</button>`).join(' ')}${others.length > 24 ? ` … (${others.length})` : ''}</span></div>` : '';
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
  const cutHere = p3 && !S.view.home && viewer?.hasInterior(p3);
  const cutActive = S.section.on && S.section.scope === 'selection';
  const hsSheet = atl.hotspotSheet(row);
  box.innerHTML = `
    <div class="row1">
      <span class="ref ${long ? 'long' : ''}">${esc(refLabel(row))}</span>
      <div style="min-width:0"><h3>${esc(row.desc)}</h3>
        <div class="meta">${row.qty != null ? `Qté au ${eq.docWord} : ${row.qty}${row.qty3d != null && row.qty3d !== row.qty ? ` (${row.qty3d} dessiné${row.qty3d > 1 ? 's' : ''})` : ''}` : 'Qté non indiquée'} · ${eq.docWord === 'catalogue' ? sheetLabel(eq, row.source.sheet) : `feuille ${row.source.sheet}`}${ids ? ` · ${ids}` : ''}</div></div>
      <button type="button" class="close" id="d-close" aria-label="Fermer la fiche">×</button>
    </div>
    ${trail}
    <div class="pnline ${row.sizes ? 'sizes' : ''}">${pnHtml(row, true) ?? `<span class="meta">${row.supplier ? `N° fournisseur : <span class="mono">${esc(row.supplier)}</span>` : 'Aucun numéro de pièce'}</span>`}</div>
    ${mirror}${flags}${used}
    <div class="actions">
      ${group ? `<button type="button" class="btn primary" id="d-tog">${open ? 'Rassembler ce groupe' : 'Éclater ce groupe'}</button>` : ''}
      ${cutHere ? `<button type="button" class="btn" id="d-cut">${cutActive ? 'Quitter la coupe' : 'Voir en coupe'}</button>` : ''}
      ${is3d() ? '<button type="button" class="btn" id="d-focus">Centrer</button>' : ''}
      ${row.link ? `<button type="button" class="btn" data-go="${row.link}">Ouvrir ${eq.docWord === 'catalogue' ? sheetLabel(eq, eq.assemblies.get(row.link)?.sheet || eq.documents.get(row.link)?.sheets[0] || row.link) : row.link} ›</button>` : ''}
      ${row.see ? row.see.map((s) => `<button type="button" class="btn" data-page="${s}">Voir ${eq.docWord === 'catalogue' ? sheetLabel(eq, s) : s}</button>`).join('') : ''}
      ${hsSheet ? `<button type="button" class="btn" data-page="${hsSheet}" data-ref="${esc(refLabel(row))}" title="Ouvrir la planche, le repère mis en évidence">Voir sur la planche</button>` : ''}
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
  if (S.view?.home) S.section.on = false; // page d'accueil : pas de coupe
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
  // Recherche globale : systèmes, composants, pages, données, consignes et schémas (atelier), puis pièces.
  const render = () => {
    const q = input.value;
    if (q.trim().length < 2) { box.hidden = true; return; }
    const more = atl.search(q);
    const parts = search(S.eq, q);
    hits = [...more.map((x) => ({ atl: x })), ...parts.map((r) => ({ r }))];
    idx = -1;
    box.hidden = false;
    const head = (t) => `<div class="rhead">${t}</div>`;
    const html = hits.map((h, i) => {
      if (h.atl) {
        const x = h.atl;
        return `<button type="button" class="res atl ${x.act ? '' : 'info'}" data-i="${i}" ${x.act ? '' : 'disabled'}>
          <span class="pn tag">${esc(x.tag)}</span><span>${esc(x.label)}</span>${x.sub ? `<span class="where">${esc(x.sub)}</span>` : ''}</button>`;
      }
      const r = h.r;
      return `<button type="button" class="res" data-i="${i}">
        <span class="pn">${esc(r.pns.join(' / ') || r.supplier || r.pnText || '—')}</span><span>${esc(r.desc)}</span>
        <span class="where">${esc(sourceLabel(S.eq, r.source))} · réf. ${esc(refLabel(r))}${r.qty != null ? ` · qté ${r.qty}` : ''}</span></button>`;
    });
    if (more.length && parts.length) html.splice(more.length, 0, head(`Pièces (${parts.length})`));
    box.innerHTML = hits.length ? html.join('')
      : `<div class="empty">Rien trouvé pour « ${esc(q)} ». Essayez un numéro partiel, un numéro de page (P224) ou un mot de la description (en anglais, comme au ${S.eq.docWord}).</div>`;
    box.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('mousedown', (e) => { e.preventDefault(); pick(+b.dataset.i); }));
  };
  const pick = (i) => {
    const h = hits[i];
    if (!h || (h.atl && !h.atl.act)) return;
    box.hidden = true;
    input.blur();
    if (h.atl) h.atl.act();
    else jumpToRow(h.r.key);
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
/**
 * Page du manuel en grand. opts.ref : repère à mettre en évidence (bulle) ;
 * opts.box : zone [x, y, l, h] à encadrer (consigne, valeur relevée).
 */
function openPage(sheet, opts = {}) {
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
    <div class="canvas"><div class="pg" id="p-pg"><img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du ${eq.docWord}" id="p-img">${atl.overlay(s)}${opts.box ? `<span class="hlbox" style="left:${opts.box[0] * 100}%;top:${opts.box[1] * 100}%;width:${opts.box[2] * 100}%;height:${opts.box[3] * 100}%"></span>` : ''}</div></div>
    <div class="hsfiche" id="p-fiche" hidden></div>`;
  const img = $('#p-img');
  const pg = $('#p-pg');
  // Bulles : fiche de la pièce (n°, description, quantité) et lien vers la liste ou la 3D.
  const fiche = (ref) => {
    atl.markHotspots(pg, ref);
    const row = owner ? (eq.assemblies.get(owner) || eq.documents.get(owner))?.parts.find((r) => (r.label ?? r.ref) === ref) : null;
    const box = $('#p-fiche');
    if (!row) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<span class="ref">${esc(ref)}</span><div class="fb"><strong>${esc(row.desc)}</strong>
      <span class="mono">${esc(row.pns.join(' / ') || row.pnText || row.supplier || '—')}</span><span class="meta">Qté ${row.qty ?? '—'} · ${esc(sourceLabel(eq, row.source))}</span></div>
      <button type="button" class="btn primary" id="p-row">${owner3d ? 'Voir en 3D' : 'Voir dans la liste'}</button><button type="button" class="btn" id="p-fclose" aria-label="Fermer la fiche">×</button>`;
    $('#p-row').addEventListener('click', () => { closePage(); jumpToRow(row.key); });
    $('#p-fclose').addEventListener('click', () => { box.hidden = true; atl.markHotspots(pg, null); });
  };
  pg.querySelectorAll('.ovl .hs').forEach((b) => b.addEventListener('click', () => fiche(b.dataset.hs)));
  pg.querySelectorAll('.ovl .xr').forEach((b) => b.addEventListener('click', () => { closePage(); atl.gotoRung(+b.dataset.rung, b.dataset.doc); }));
  if (opts.ref) fiche(opts.ref);
  // En taille réelle, la zone ou la bulle demandée est amenée au centre.
  const focusMark = () => {
    const t = pg.querySelector('.hlbox') || pg.querySelector('.ovl .hs.sel');
    if (t && zoom !== 'fit') t.scrollIntoView({ block: 'center', inline: 'center' });
  };
  // Page absente (publication allégée : pages de liste laissées de côté).
  img.addEventListener('error', () => {
    m.querySelector('.canvas').innerHTML = missingPage(s, owner ? ' Sa liste de pièces est reprise dans « Ouvrir la liste ».' : '');
  });
  const fit = () => {
    const c = m.querySelector('.canvas');
    const ratio = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5;
    if (zoom === 'fit') {
      const w = Math.min(c.clientWidth - 32, (c.clientHeight - 16) * ratio);
      img.style.width = `${Math.max(200, w)}px`;
    } else img.style.width = `${img.naturalWidth || 2200}px`;
  };
  img.addEventListener('load', () => { fit(); focusMark(); });
  fit();
  $('#p-prev').addEventListener('click', () => openPage(eq.sheetId(num - 1)));
  $('#p-next').addEventListener('click', () => openPage(eq.sheetId(num + 1)));
  $('#p-zoom').addEventListener('click', () => { zoom = zoom === 'fit' ? 'full' : 'fit'; openPage(s, opts); });
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
        <ol><li>Déposer le PDF du manuel de pièces.</li><li>Extraire les listes (outil <span class="mono">tools/extract_parts.py</span>, <span class="mono">tools/extract_sandvik.py</span> pour un manuel Sandvik, <span class="mono">tools/extract_epiroc.py</span> pour le catalogue Epiroc) et relire.</li><li>Modéliser chaque assemblage (formes paramétriques) ou importer un modèle CAO (.glb).</li></ol>
      </div>
    </div></div>`;
}

// ------------------------------------------------------------------ chrome

function setPane(p) {
  $('#workspace').dataset.pane = p;
  document.querySelectorAll('#mtabs button').forEach((b) => b.classList.toggle('on', b.dataset.pane === p));
  if (p === 'stage') { viewer?.resize(); fitHome(); }
}

function bindChrome() {
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) {
      e.preventDefault();
      follow(g.dataset.go);
      return;
    }
    const h = e.target.closest('[data-hash]');
    if (h) { e.preventDefault(); location.hash = h.dataset.hash; return; }
    const p = e.target.closest('[data-page]');
    if (p) {
      e.preventDefault();
      openPage(p.dataset.page, { box: p.dataset.box ? p.dataset.box.split(',').map(Number) : null, ref: p.dataset.ref || null });
      return;
    }
    const t = e.target.closest('[data-rtab]');
    if (t) {
      S.railTab = t.dataset.rtab;
      try { localStorage.setItem('pieces3d.sommaire', S.railTab); } catch { /* ignoré */ }
      renderRail();
      $(`#rail [data-rtab="${S.railTab}"]`)?.focus();
    }
  });
  atl.bind();
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
    try { localStorage.setItem('pieces3d.contours', S.edges ? '1' : '0'); } catch { /* ignoré */ }
  });
  const iso = $('#btn-isolate');
  iso.addEventListener('click', () => {
    S.isolate = !S.isolate;
    iso.setAttribute('aria-pressed', String(S.isolate));
    viewer?.setIsolate(S.isolate);
    if (S.isolate && !S.selected) toast('Sélectionnez une pièce : les autres seront estompées.');
  });
  $('#btn-frame').addEventListener('click', () => viewer?.frame());
  // Page d'accueil adaptée à la scène (rotation, panneaux redimensionnés, onglets).
  let relayout;
  new ResizeObserver(() => {
    clearTimeout(relayout);
    relayout = setTimeout(fitHome, 250);
  }).observe($('#stage'));
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
