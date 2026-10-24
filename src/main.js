import './styles.css';
import { Viewer } from './viewer/Viewer.js';
import { buildProcedural } from './viewer/assembly.js';
import { loadIndex, loadEquipment, sourceLabel, sheetLabel, sizeGroups, isPnText } from './data/equipment.js';
import cubexModels from './models/cubex-mri-5200/index.js';
import du311Models from './models/du311/index.js';
import du311StdModels, { overview as du311StdOverview } from './models/du311-std/index.js';
import epirocModels from './models/epiroc-ith/index.js';
import plancherModels from './models/plancher-dd/index.js';
import stmModels from './models/stm-1500/index.js';
import './ui/resize.js';
import './ui/atelier.css';
import { createHost } from './ui/host.js';
import { renderEquipmentHome } from './ui/eqhome.js';
import { systemOf } from './ui/systems.js';
import { icon } from './ui/icons.js';

// Fonctions de l'interface : chaque fichier src/ui/features/<nom>.js est chargé
// tout seul (export par défaut { id, order, init(ctx) }) ; ceux dont le nom
// commence par « _ » (exemples, brouillons) sont ignorés. Voir src/ui/features/README.md.
const FEATURES = import.meta.glob(['./ui/features/*.js', '!./ui/features/_*.js'], { eager: true });

// Modèles 3D disponibles par équipement (builders procéduraux).
const MODELS = { 'cubex-mri-5200': cubexModels, du311: du311Models, 'du311-std': du311StdModels, 'epiroc-ith': epirocModels, 'plancher-dd': plancherModels, 'stm-1500': stmModels };
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

// Publication allégée (Artifact, scripts/build-artifact.mjs) : pages du manuel
// non publiées, par équipement (« * » : toutes). Aucune requête n'est faite
// pour ces pages : un message en tient lieu.
const PUBLICATION = (() => {
  try { return JSON.parse(document.getElementById('publication')?.textContent || 'null') || {}; } catch { return {}; }
})();
function pageMissing(eqId, sheet) {
  const m = PUBLICATION.pagesAbsentes?.[eqId];
  return m === '*' || (Array.isArray(m) && m.includes(sheet));
}

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
  steps: { on: false, n: 0 }, // montage par étapes (vue qui le propose : model.view.steps)
  stepsList: null,
};
let viewer = null;
let host = null; // socle des fonctions (createHost)

try { S.labels = localStorage.getItem('pieces3d.labels') !== '0'; } catch { /* préférence non disponible */ }
try { S.edges = localStorage.getItem('pieces3d.contours') === '1'; } catch { /* préférence non disponible */ }

// ------------------------------------------------------------------ démarrage

async function init() {
  bindChrome();
  host = createHost({
    state: () => S,
    viewer: () => viewer,
    is3d,
    has3d: (id) => !!(S.eq && (MODELS[S.eq.id] || {})[id]),
    go,
    navigate,
    follow,
    hashFor: (token, id) => hashFor(token, id ?? S.eq?.id ?? S.index[0]?.id),
    path3d: (path) => (path?.length && S.view ? path3d(path) : []),
    rowAt: (path) => (S.view ? rowAt(path) : null),
    select: (path, opts) => select(path, opts),
    openRow: jumpToRow,
    assemble: ({ animate = true } = {}) => explodeEverything(false, { animate, frame: false }),
    groups: {
      is: (path) => !!path.length && isGroupPath(path),
      isOpen: (path) => !!path.length && isGroupPath(path) && S.expanded.has(keyOf(path)),
      toggle: (path, force) => toggleGroup(path, force),
    },
    section: {
      canCut: (path) => !!path.length && !S.view?.home && !!viewer?.hasInterior(path3d(path)),
      isCut: () => S.section.on && S.section.scope === 'selection',
      cut: (path) => {
        if (!path) { setSection({ on: false }); return; }
        if (keyOf(path) !== keyOf(S.selected || [])) select(path);
        const p3 = path3d(path);
        setSection({ on: true, scope: 'selection', ...viewer.autoSection(p3) });
        viewer.focusPath(p3);
      },
    },
    openPage,
    setPane,
    pane: () => $('#workspace').dataset.pane,
    narrow,
    toast,
    // Vue sous une page plein écran (retour à la fermeture).
    viewToken: () => S.view?.id || S.eq?.root || '',
    leaveRoute,
    exitFullscreen: () => { if (fullscreenEl() || document.body.classList.contains('stage-full')) toggleFullscreen(); },
  });
  host.ctx.registerRoute('apercu', (ctx) => showEquipmentHome(ctx));
  // Échap (une couche à la fois, voir host.js) : visionneuse des pages, sélection, scène en plein écran.
  host.ctx.ui.onEscape(() => { if ($('#modal').hidden) return false; closePage(); return true; }, 100);
  host.ctx.ui.onEscape(() => { if (!S.selected) return false; select(null); return true; }, 40);
  host.ctx.ui.onEscape(() => { if (!document.body.classList.contains('stage-full')) return false; toggleFullscreen(); return true; }, 20);
  try {
    S.index = await loadIndex();
  } catch (err) {
    loadError(err);
    return;
  }
  await host.loadFeatures(FEATURES);
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

// Rang de l'entrée d'historique dans la session du site (history.state.idx) :
// une page liée à l'adresse qui n'est pas la première entrée se ferme par un
// retour d'historique (Retour, Échap), sans empiler d'entrée.
let lastIdx = -1;
function stampHistory() {
  let idx = history.state?.idx;
  if (idx == null) {
    idx = lastIdx + 1;
    history.replaceState({ ...(history.state || {}), idx }, '');
  }
  lastIdx = idx;
}

async function route() {
  stampHistory();
  // Visionneuse des pages ouverte : l'adresse change (Retour, lien) ; elle se ferme.
  if (!$('#modal').hidden) closePage();
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
    // Pages non publiées (version allégée) : pas d'adresse d'image.
    const url = S.eq.pageUrl;
    S.eq.pageUrl = (sheet) => (pageMissing(id, sheet) ? null : url(sheet));
    S.view = null;
    S.selected = null;
    const doc = S.eq.docWord === 'catalogue' ? 'catalogue' : 'manuel';
    $('#btn-page').textContent = `Page du ${doc}`;
    $('#btn-page').title = `Voir la page du ${doc}`;
    $('#btn-labels').title = `Afficher les repères du ${doc}`;
    host.ctx.ui.sidePanel.closeAll();
    host.bus.emit('equipment', { equipment: S.eq, id: S.eq.id });
  }
  const eq = S.eq;
  const info = { hash: location.hash, equipmentId: eq.id, token };
  // Page d'accueil (adresse sans « # ») : la liste des équipements.
  const home = raw === '' || token === 'catalogue';
  $('#catalogue').hidden = !home;
  const featureRoute = !home && host.routes.has(token);
  if (!featureRoute) host.hidePage();
  if (home) { document.title = 'Équipements · Pièces 3D'; renderCatalogue(); host.bus.emit('route', { ...info, token: 'catalogue', view: null }); return; }
  if (featureRoute) {
    // Page d'une fonction (ou page de l'équipement) : affichée tout de suite. Sans vue en
    // place (lien direct), la vue d'ensemble n'est construite qu'à la fermeture de la page.
    await host.runRoute(token, info);
  } else if (token === 'controle') await openIssues();
  else if (eq.assemblies.has(token)) await openAssembly(token);
  else if (eq.documents.has(token)) openDocument(token);
  else await openAssembly(eq.root);
  host.bus.emit('route', { ...info, view: S.view ? { ...S.view } : null });
}

/** Page de l'équipement (#<équipement>.apercu) : machine → systèmes → fiches. */
function showEquipmentHome(ctx) {
  const eq = S.eq;
  document.title = `${eq.name} · Pièces 3D`;
  ctx.ui.showPage(eq.name, renderEquipmentHome(eq, { has3d: ctx.has3d, badge, slot: ctx.ui.equipmentHome }), { icon: 'accueil' });
}

/** Signale la vue affichée aux fonctions et applique la couleur de son système. */
function viewChanged() {
  const sys = isAsmView() ? systemOf(S.eq, S.view.id) : null;
  const shell = $('#shell');
  if (sys) shell.style.setProperty('--sys', sys.color);
  else shell.style.removeProperty('--sys');
  shell.dataset.system = sys ? sys.id : '';
  host.bus.emit('view', { ...S.view, system: sys });
}

/** Va à une adresse complète (« #du311.P032 ») ; attend la fin d'un retour d'historique en cours (couche fermée). */
function navigate(h) {
  host.whenSettled(() => {
    if (location.hash === h) { route(); return; }
    // Entrée d'une couche (page « Sur le dessin », visionneuse…) : remplacée, pour ne pas laisser d'entrée morte.
    if (history.state?.layer) location.replace(h);
    else location.hash = h;
  });
}

function go(token) {
  navigate(`#${hashFor(token)}`);
}

/** Page liée à l'adresse fermée : retour à l'entrée précédente, sinon (lien direct) la vue d'en dessous à la place. */
function leaveRoute() {
  host.whenSettled(() => {
    if ((history.state?.idx ?? 0) > 0) { history.back(); return; }
    const h = `#${hashFor(host.ctx.view?.id || S.eq?.root || '')}`;
    if (location.hash === h) route();
    else location.replace(h);
  });
}

/** Suit un lien vers une page (sur téléphone, on passe à la vue 3D ou au dessin). */
function follow(token) {
  if ((S.eq?.assemblies.has(token) || S.eq?.documents.has(token)) && narrow()) setPane('stage');
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

/** Numéros d'une ligne de la liste : un par taille (regroupés), ou texte du catalogue. */
function pnHtml(r) {
  const val = (v) => (isPnText(v) ? `<span>${esc(v)}</span>` : `<span class="pnt">${esc(v === '-' ? '—' : v)}</span>`);
  if (r.sizes) {
    // Étiquette de plusieurs tailles (« NW · HW · HWT ») au-dessus du numéro.
    return sizeGroups(r).map(([v, ss]) => {
      const label = ss.join(' · ');
      return `<span class="szl${label.length > 5 ? ' stack' : ''}"><span class="sz">${esc(label)}</span>${val(v)}</span>`;
    }).join('');
  }
  if (r.pn) return esc(r.pn);
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

/**
 * Marges de cadrage d'un assemblage : hors de la barre d'outils (haut), du
 * cartouche et du montage par étapes (bas), du panneau latéral et des barres
 * des fonctions (host.insets).
 */
function viewInsets() {
  const vp = $('#viewport').getBoundingClientRect();
  const tools = $('#tools'), tb = $('#titleblock');
  const top = tools.hidden ? 0 : tools.getBoundingClientRect().bottom - vp.top + 6;
  const sb = $('#stepsbar');
  const above = (el) => (el.hidden || !el.offsetHeight ? 0 : vp.bottom - el.getBoundingClientRect().top + 6);
  const bottom = Math.max(above(tb), above(sb));
  return withFeatureInsets({ top, bottom });
}

/** Ajoute les marges des fonctions et du panneau latéral. */
function withFeatureInsets(ins) {
  const f = host?.insets() || {};
  return {
    ...ins,
    top: Math.max(ins.top || 0, f.top || 0),
    bottom: Math.max(ins.bottom || 0, f.bottom || 0),
    left: Math.max(ins.left || 0, f.left || 0),
    right: Math.max(ins.right || 0, f.right || 0),
  };
}

/**
 * Marges de cadrage de la page d'accueil : sous la barre d'outils, place pour
 * les légendes du bas et pour celles qui dépassent des outils en bout de rangée.
 */
function homeInsets() {
  const st = $('#stage').getBoundingClientRect(), tools = $('#tools').getBoundingClientRect();
  return withFeatureInsets({ top: Math.max(0, tools.bottom - st.top) + 6, bottom: 34, side: S.view?.portrait ? 40 : 0 });
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
    S.stepsList = null;
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
      S.stepsList = model.view.steps || null;
      S.steps = { on: false, n: 0 };
      S.section.axis = model.view.section?.axis || 'z';
      S.section.pos = model.view.section?.pos ?? 0.5;
      if (S.explode > 0 && !S.view.home) {
        v.setExplode(S.explode);
        v.frame();
      }
    }
    renderSectionBar();
  }
  renderSteps();
  // Page d'accueil : barre d'outils sans éclatement, consigne adaptée.
  $('#tools').classList.toggle('home', !!S.view.home);
  fitHomeChrome();
  baseHint ??= $('#hint').textContent;
  $('#hint').textContent = S.view.home ? HOME_HINT : baseHint;
  renderRail();
  renderTitleblock(asm);
  renderPanel();
  viewChanged();
  host.bus.emit('assembly', { id, assembly: asm, is3d: has3d, home: !!S.view.home, model: has3d ? viewer?.model ?? null : null, equipment: eq });
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
    if (det && live() && viewer.replacePart(p, det.root)) {
      // Les fonctions qui ont posé des marques sur le modèle les refont (pastilles, couleurs…).
      host.bus.emit('model-update', { model, old: p, part: det.root, done: !queue.length });
    }
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
  emitViewState();
}

function setMainExplode(t, { frame = true } = {}) {
  S.explode = t;
  $('#explode').value = Math.round(t * 100);
  viewer?.setExplode(t);
  if (frame) viewer?.frame();
  emitViewState();
}

function explodeEverything(on, { animate = true, frame = true } = {}) {
  if (!viewer) return;
  S.explode = on ? 1 : 0;
  $('#explode').value = on ? 100 : 0;
  viewer.explodeAll(on ? 1 : 0, { animate });
  S.expanded = new Set(on ? viewer.groupPaths().map(keyOf) : []);
  if (frame) viewer.frame();
  renderRows();
  emitViewState();
}

/** Signale aux fonctions l'état de la vue 3D (éclatement, groupes éclatés, coupe). */
function emitViewState() {
  host?.bus.emit('view-state', { explode: S.explode, expanded: [...S.expanded], section: { ...S.section } });
}

// ------------------------------------------------------------------ montage par étapes

// Vue qui le propose (model.view.steps, ex. le plancher de foreuse) : au départ,
// seulement le décor ; à chaque étape, ses pièces sont posées une à une dans
// l'ordre de pose (Viewer.setStep), en surbrillance, avec la caméra de l'étape
// (step.cam), ses outils et ses annotations. Le panneau donne le titre et le
// texte de l'étape et un lien vers sa page de la procédure.
const STEP_PAUSE = 2600; // lecture : pause après la pose d'une étape (ms)
const STEP_CAM_BACK = 1.55; // recul de la caméra de l'étape
let stepTimer = null;

function stopStepPlay() {
  clearTimeout(stepTimer);
  stepTimer = null;
  $('#st-play').setAttribute('aria-pressed', 'false');
  $('#st-play').textContent = 'Lecture';
}

function renderSteps() {
  const list = S.stepsList;
  const on = !!list && S.steps.on && is3d();
  $('#btn-steps').hidden = !list || !is3d();
  $('#btn-steps').setAttribute('aria-pressed', String(on));
  $('#stepsbar').hidden = !on;
  $('#stage').classList.toggle('stepping', on);
  if (!on) { stopStepPlay(); return; }
  const n = S.steps.n, st = list[n], last = list.length - 1;
  const range = $('#st-range');
  range.max = last;
  range.value = n;
  $('#st-num').textContent = st.label || (n === 0 ? 'Avant' : `Étape ${n} / ${last}`);
  $('#st-title').textContent = st.title;
  $('#st-text').textContent = st.text;
  const page = $('#st-page');
  page.hidden = !st.page;
  if (st.page) {
    page.dataset.page = st.page;
    page.textContent = `Voir la page ${st.page} de la procédure`;
  }
  $('#st-prev').disabled = n === 0;
  $('#st-next').disabled = n === last;
}

/** Va à l'étape n : pièces des étapes précédentes en place, celles de n posées une à une (animate). Retourne la durée de la pose. */
function setStepN(n, { animate = true } = {}) {
  const list = S.stepsList;
  if (!list || !viewer) return 0;
  S.steps.n = Math.max(0, Math.min(list.length - 1, n));
  const st = list[S.steps.n];
  const ms = viewer.setStep(S.steps.n, { animate });
  // Caméras de l'étape réglées pour la vidéo (cadre large) : reculées pour la scène du site, plus étroite.
  if (st.cam) viewer.lookAt(st.cam.pos.map((v, i) => st.cam.tgt[i] + (v - st.cam.tgt[i]) * STEP_CAM_BACK), st.cam.tgt);
  renderSteps();
  return ms;
}

function toggleSteps(on = !S.steps.on) {
  if (!S.stepsList || !viewer) return;
  S.steps.on = on;
  if (on) {
    if (S.explode > 0 || S.expanded.size) explodeEverything(false);
    // Au départ, rien : seulement la galerie ; puis l'étape 0 se pose.
    viewer.setStep(-1, { animate: false });
    setStepN(0);
  } else {
    stopStepPlay();
    viewer.setStep(null);
    renderSteps();
    viewer.frame();
  }
}

function playSteps() {
  if (!S.steps.on) { stopStepPlay(); return; }
  const last = S.stepsList.length - 1;
  if (S.steps.n >= last) { stopStepPlay(); return; }
  const ms = setStepN(S.steps.n + 1);
  stepTimer = setTimeout(playSteps, ms + STEP_PAUSE);
}

function bindSteps() {
  $('#btn-steps').addEventListener('click', () => toggleSteps());
  $('#st-close').addEventListener('click', () => toggleSteps(false));
  $('#st-prev').addEventListener('click', () => { stopStepPlay(); setStepN(S.steps.n - 1); });
  $('#st-next').addEventListener('click', () => { stopStepPlay(); setStepN(S.steps.n + 1); });
  $('#st-replay').addEventListener('click', () => { stopStepPlay(); setStepN(S.steps.n); });
  $('#st-range').addEventListener('input', (e) => { stopStepPlay(); setStepN(Number(e.target.value), { animate: false }); });
  $('#st-play').addEventListener('click', () => {
    if (stepTimer) { stopStepPlay(); return; }
    $('#st-play').setAttribute('aria-pressed', 'true');
    $('#st-play').textContent = 'Pause';
    if (S.steps.n >= S.stepsList.length - 1) {
      viewer.setStep(-1, { animate: false });
      stepTimer = setTimeout(playSteps, 0);
      S.steps.n = -1;
      return;
    }
    playSteps();
  });
}

// ------------------------------------------------------------------ plein écran

// Scène en plein écran (API Fullscreen, préfixe webkit sur iPad) ; sans elle
// (iPhone), la scène occupe toute la fenêtre.
function fullscreenEl() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function renderFullscreen() {
  const on = !!fullscreenEl() || document.body.classList.contains('stage-full');
  $('#btn-full').setAttribute('aria-pressed', String(on));
  $('#btn-full').textContent = on ? 'Quitter le plein écran' : 'Plein écran';
}

function toggleFullscreen() {
  const st = $('#stage');
  if (fullscreenEl()) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else if (document.body.classList.contains('stage-full')) {
    document.body.classList.remove('stage-full');
  } else if (st.requestFullscreen || st.webkitRequestFullscreen) {
    const req = (st.requestFullscreen || st.webkitRequestFullscreen).call(st);
    if (req?.catch) req.catch(() => document.body.classList.add('stage-full'));
  } else {
    document.body.classList.add('stage-full');
  }
  setTimeout(() => { renderFullscreen(); viewer?.resize(); }, 120);
}

function bindFullscreen() {
  $('#btn-full').addEventListener('click', toggleFullscreen);
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { renderFullscreen(); viewer?.resize(); });
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
  renderPanel();
  viewChanged();
}

// Pages du manuel affichées dans la scène (schémas, ou dessins d'un assemblage sans 3D).
function showSheets(sheets) {
  const eq = S.eq;
  const dv = $('#docview');
  dv.hidden = false;
  dv.innerHTML = sheets.map((s) => (eq.pageUrl(s) ? `
    <figure>
      <img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du ${eq.docWord} : ${esc(eq.sheetTitles[s] || '')}" data-sheet="${s}" loading="lazy">
      <figcaption><span class="mono">${eq.docWord === 'catalogue' ? sheetLabel(eq, s) : `${eq.document.reference.split(',')[0]}-${s}`}</span> · ${esc(eq.sheetTitles[s] || '')} — cliquez pour agrandir</figcaption>
    </figure>` : `<figure>${missingPage(s, ` ${esc(eq.sheetTitles[s] || '')} : sa liste de pièces est dans le panneau « Pièces ».`)}</figure>`)).join('') || `<p class="sub">Aucun dessin pour cette liste au ${eq.docWord}.</p>`;
  dv.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => openPage(img.dataset.sheet));
    img.addEventListener('load', () => img.closest('figure').classList.toggle('portrait', img.naturalHeight > img.naturalWidth));
    img.addEventListener('error', () => { img.closest('figure').innerHTML = missingPage(img.dataset.sheet); });
  });
  dv.scrollTop = 0;
}

/** Message à la place d'une page absente de cette publication (version allégée). */
function missingPage(s, extra = '') {
  const full = location.href.startsWith(SITE) ? '' : ` <a href="${SITE}${esc(location.hash)}" target="_blank" rel="noopener">Voir la version complète du site</a>.`;
  return `<p class="missing">La page ${s} n'est pas incluse dans cette version du site.${extra}${full}</p>`;
}

async function openIssues() {
  if (!S.view) await openAssembly(S.eq.root);
  S.view = { type: 'issues', id: 'controle' };
  S.selected = null;
  viewer?.setSelected(null);
  renderRail();
  renderPanel();
  viewChanged();
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
    const sys = a.parent === eq.root ? systemOf(eq, id) : null; // bandeau de couleur des systèmes
    return `<li><button type="button" class="node ${id === cur ? 'cur' : ''}${sys ? ' sysnode' : ''}" data-go="${id}"${sys ? ` style="--sys:${sys.color}"` : ''}>
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
  $('#rail').innerHTML = `
    <div class="equip"><strong>${esc(eq.name)}</strong><span>${esc(eq.category)} · ${eq.serial ? `n° de série ${esc(eq.serial)}` : esc(eq.document.title)}</span>
      <button type="button" class="btn eq-over" data-go="apercu">${icon('accueil', { size: 16 })}Vue d'ensemble et systèmes</button></div>
    <div><h2>Assemblages${n3d && !partial ? ' 3D' : ''}</h2>${partial ? `<p class="legend"><span class="sheet m3d">3D</span><span>${n3d} assemblages en 3D, les autres avec les dessins du ${eq.docWord}.${open3d}</span></p>` : ''}<ul class="tree">${node(eq.root)}</ul></div>
    <div><h2>${esc(eq.labels?.documents || 'Schémas et listes')}</h2><ul class="tree">${docs}</ul></div>
    <div><h2>${eq.docWord === 'catalogue' ? 'Catalogue' : 'Manuel'}</h2><ul class="tree">
      <li><button type="button" class="node ${cur === 'controle' ? 'cur' : ''}" data-go="controle"><span class="sheet">QC</span><span class="t">Contrôle des listes</span><span class="n">${errors ? `<span class="alert">${errors}</span> / ` : ''}${eq.issues.length}</span></button></li>
      <li><button type="button" class="node" data-page="${eq.sheetId(1)}"><span class="sheet">PDF</span><span class="t">Pages du ${eq.docWord} (${eq.document.sheets})</span><span class="n"></span></button></li>
    </ul></div>
    <details class="more"><summary>Fiche technique</summary>
      <dl class="specs">${eq.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
      ${eq.weights.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </details>`;
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
    <div><span class="k">${eq.document.client ? 'Client' : 'Fabricant'}</span><span class="v">${esc(eq.document.client || eq.manufacturer)}</span></div>
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
  const sys = isAsm ? systemOf(eq, src.id) : null;
  const qtyTotal = src.parts.reduce((n, r) => n + (typeof r.qty === 'number' ? r.qty : 0), 0);
  const toCheck = src.parts.filter((r) => r.flags.some((f) => f.level === 'error')).length;
  panel.innerHTML = `
    <div class="phead">
      ${sys ? `<span class="syskick">${icon(sys.icon, { size: 15 })}${esc(sys.title)}</span>` : ''}
      <h1>${esc(src.titleFr)}</h1>
      <span class="sub">${sub.map(esc).join(' · ')}</span>
      <div class="pstats"><span><b>${src.parts.length}</b>ligne${src.parts.length > 1 ? 's' : ''}</span>${qtyTotal ? `<span><b>${qtyTotal}</b>pièce${qtyTotal > 1 ? 's' : ''}</span>` : ''}${toCheck ? `<span class="warn"><b>${toCheck}</b>à vérifier</span>` : ''}</div>
      ${src.note ? `<div class="note">${esc(src.note)}</div>` : ''}
      <label class="sr" for="filter">Filtrer la liste</label>
      <input class="filter" id="filter" type="search" placeholder="Filtrer cette liste…" value="${esc(S.filter)}">
    </div>
    <div class="tablewrap" id="tablewrap"><table class="parts">
      <thead><tr><th class="c-ref">Réf.</th><th>N° pièce</th><th class="c-qty">Qté</th><th>Description</th></tr></thead>
      <tbody id="rows"></tbody></table></div>`;
  $('#filter').addEventListener('input', (e) => { S.filter = e.target.value; renderRows(); });
  renderRows();
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
    const tog = group
      ? `<button type="button" class="tog" data-tog="${esc(key)}" aria-expanded="${open}" title="${open ? 'Rassembler ce groupe' : 'Éclater ce groupe sur place'}" aria-label="${open ? 'Rassembler' : 'Éclater'} le groupe ${esc(r.desc)}">${open ? '▾' : '▸'}</button>`
      : '<span class="tog-sp"></span>';
    return `<tr data-key="${esc(key)}" data-key3d="${esc(keyOf(path3d(path)))}" class="${sub ? 'sub-row' : ''} ${depth ? 'nested' : ''} ${key === selKey ? 'sel' : ''}">
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
  const p3 = row && is3d() ? path3d(S.selected) : null;
  if (is3d()) viewer.setSelected(p3);
  renderSectionBar();
  // La fiche de la pièce (src/ui/features/fiche.js) s'ouvre dans le panneau latéral ;
  // le cadrage vient après, pour tenir compte du panneau ouvert.
  host?.bus.emit('select', {
    ref: row ? row.ref : null, path: row ? [...S.selected] : null, row, pn: row?.pn || null,
    path3d: p3, objects: p3 ? viewer.selectedObjs.slice() : [],
    source: from3d ? '3d' : 'list',
  });
  if (p3 && focus && viewer.resolve(p3).length) viewer.focusPath(p3);
}

/** Nouvelle entrée d'historique pour une vue ouverte directement (Retour revient à la vue d'avant). */
function pushView(id) {
  const h = `#${hashFor(id)}`;
  if (location.hash === h) return;
  if (history.state?.layer) history.replaceState({ idx: lastIdx }, '', h);
  else { lastIdx += 1; history.pushState({ idx: lastIdx }, '', h); }
}

function jumpToRow(key) {
  const eq = S.eq;
  const r = eq.rows.find((x) => x.key === key);
  if (!r) return;
  if (r.source.type === 'assembly') {
    if (isAsmView() && S.view.id === r.source.id) select([r.ref], { focus: true });
    else { pushView(r.source.id); openAssembly(r.source.id, { select: [r.ref] }); }
  } else {
    if (S.view?.type !== 'document' || S.view.id !== r.source.id) pushView(r.source.id);
    openDocument(r.source.id);
    select([r.ref]);
    document.querySelector(`#rows tr[data-key="${CSS.escape(r.ref)}"]`)?.scrollIntoView({ block: 'center' });
  }
  // Téléphone : la liste, sauf si la fiche de la pièce s'est ouverte sur la vue.
  if (narrow() && !host.ctx.ui.sidePanel.isOpen) setPane('panel');
}

// ------------------------------------------------------------------ vue en coupe

function setSection(patch) {
  S.section = { ...S.section, ...patch };
  if (S.view?.home) S.section.on = false; // page d'accueil : pas de coupe
  if (S.section.scope === 'selection' && !S.selected) S.section.scope = 'all';
  viewer?.setSection(S.section);
  renderSectionBar();
  emitViewState();
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

// ------------------------------------------------------------------ pages du manuel

let zoom = 'fit';
let modalLayer = null; // entrée d'historique de la visionneuse (Retour du navigateur la ferme)
let modalOpener = null;
function openPage(sheet) {
  const eq = S.eq;
  const m0 = $('#modal');
  if (m0.hidden) {
    // La visionneuse couvre toute la fenêtre : la scène quitte le plein écran, le reste sort de la tabulation.
    if (fullscreenEl() || document.body.classList.contains('stage-full')) toggleFullscreen();
    modalOpener = document.activeElement;
    modalLayer = host.historyLayer(() => closePage({ fromHistory: true }));
    $('#shell').inert = true;
  }
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
    <div class="canvas">${eq.pageUrl(s) ? `<img src="${esc(eq.pageUrl(s))}" alt="Page ${s} du ${eq.docWord}" id="p-img">` : ''}</div>`;
  $('#p-prev').addEventListener('click', () => openPage(eq.sheetId(num - 1)));
  $('#p-next').addEventListener('click', () => openPage(eq.sheetId(num + 1)));
  $('#p-zoom').addEventListener('click', () => { zoom = zoom === 'fit' ? 'full' : 'fit'; openPage(s); });
  $('#p-close').addEventListener('click', () => closePage());
  if (!m.contains(document.activeElement)) $('#p-close').focus({ preventScroll: true });
  $('#p-open')?.addEventListener('click', () => { closePage(); go(owner); });
  const img = $('#p-img');
  // Page absente (publication allégée : pages de liste laissées de côté) : un message à la place.
  const missing = () => { m.querySelector('.canvas').innerHTML = missingPage(s, owner ? ' Sa liste de pièces est reprise dans « Ouvrir la liste ».' : ''); };
  if (!img) { missing(); return; }
  img.addEventListener('error', missing);
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
}
function closePage({ fromHistory = false } = {}) {
  const m = $('#modal');
  if (m.hidden) return;
  m.hidden = true;
  m.innerHTML = '';
  $('#shell').inert = false;
  const release = modalLayer;
  modalLayer = null;
  if (!fromHistory) release?.();
  if (modalOpener?.isConnected && modalOpener !== document.body) modalOpener.focus?.({ preventScroll: true });
  modalOpener = null;
}

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
  if (host?.pageOpen) host.hidePage();
  $('#workspace').dataset.pane = p;
  document.querySelectorAll('#mtabs button').forEach((b) => b.classList.toggle('on', b.dataset.pane === p));
  if (p === 'stage') { viewer?.resize(); fitHome(); }
}

function bindChrome() {
  bindSteps();
  bindFullscreen();
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
    if (p) { e.preventDefault(); openPage(p.dataset.page); }
  });
  $('#brand').addEventListener('click', () => go('catalogue'));
  document.querySelectorAll('#mtabs button').forEach((b) => b.addEventListener('click', () => {
    // Onglet touché sur une page plein écran : retour à la vue (adresse comprise).
    if (host?.pageOpen) host.closePage();
    setPane(b.dataset.pane);
  }));

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
