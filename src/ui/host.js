// Socle des fonctions de l'interface (src/ui/features/*.js) : bus d'événements,
// emplacements d'interface (panneau latéral, outils, recherche, page
// d'équipement, page plein écran) et contexte « ctx » passé à chaque module.
// main.js fournit l'accès à son état (app) ; voir src/ui/features/README.md.

import { icon, iconEl } from './icons.js';
import { systemOf, systems } from './systems.js';

const $ = (sel) => document.querySelector(sel);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Petit bus d'événements : on(type, fn) → fonction de désabonnement. */
export function createBus() {
  const subs = new Map();
  const off = (type, fn) => subs.get(type)?.delete(fn);
  const on = (type, fn) => {
    if (!subs.has(type)) subs.set(type, new Set());
    subs.get(type).add(fn);
    return () => off(type, fn);
  };
  const once = (type, fn) => {
    const stop = on(type, (d) => { stop(); fn(d); });
    return stop;
  };
  const emit = (type, detail) => {
    for (const fn of [...(subs.get(type) || [])]) {
      // Une fonction en erreur ne bloque ni les autres ni le site.
      try { fn(detail); } catch (err) { console.error(`[fonction] événement « ${type} »`, err); }
    }
  };
  return { on, off, once, emit };
}

/** Contenu : élément DOM, ou chaîne HTML (à échapper par l'appelant). */
function fill(box, content) {
  if (content == null) return;
  if (content instanceof Node) box.replaceChildren(content);
  else box.innerHTML = String(content);
}

/**
 * Crée le contexte des fonctions. app : accès à l'état de main.js
 * ({ state(), viewer(), is3d(), go(), follow(), hashFor(), path3d(), select(),
 *   openPage(), setPane(), narrow(), toast(), viewToken() }).
 */
export function createHost(app) {
  const bus = createBus();
  const routes = new Map();

  // ---------------------------------------------------------------- panneau latéral droit (dans la scène)
  const sp = $('#sidepanel');
  const spTitle = sp.querySelector('.sp-title');
  const spIcon = sp.querySelector('.sp-icon');
  const spBody = sp.querySelector('.sp-body');
  let spOwner = null;
  const setOpen = (on) => {
    sp.hidden = !on;
    $('#stage').classList.toggle('side-open', on);
    if (on) placePanel();
    // La scène garde sa taille (le panneau la recouvre) ; seule la mise en page des outils change.
  };
  const sidePanel = {
    element: sp,
    get body() { return spBody; },
    get isOpen() { return !sp.hidden; },
    get owner() { return spOwner; },
    open({ title, content, owner = null, icon: ic } = {}) {
      const prev = spOwner;
      if (title != null) spTitle.textContent = title;
      spIcon.innerHTML = ic ? icon(ic, { size: 18 }) : '';
      if (content !== undefined) fill(spBody, content);
      spOwner = owner;
      setOpen(true);
      if (app.narrow()) app.setPane('stage');
      if (prev !== owner && prev != null) bus.emit('sidepanel', { open: false, owner: prev });
      bus.emit('sidepanel', { open: true, owner });
    },
    close() {
      if (sp.hidden) return;
      const owner = spOwner;
      setOpen(false);
      spOwner = null;
      bus.emit('sidepanel', { open: false, owner });
    },
    toggle(opts = {}) {
      if (!sp.hidden && spOwner === (opts.owner ?? null)) sidePanel.close();
      else sidePanel.open(opts);
    },
    setTitle(t) { spTitle.textContent = t ?? ''; },
    setContent(content) { fill(spBody, content); },
  };
  sp.querySelector('.sp-close').addEventListener('click', () => sidePanel.close());
  // Le panneau commence sous la barre d'outils de la scène (qui garde toute sa largeur).
  const tools = $('#tools');
  const placePanel = () => {
    const st = $('#stage').getBoundingClientRect();
    const tb = tools.getBoundingClientRect();
    const below = !tools.hidden && tb.height ? Math.round(tb.bottom - st.top + 8) : 12;
    $('#stage').style.setProperty('--tools-bottom', `${below}px`);
  };
  new ResizeObserver(placePanel).observe(tools);
  new MutationObserver(placePanel).observe(tools, { attributes: true, attributeFilter: ['hidden'] });

  // ---------------------------------------------------------------- outils de la scène
  const ftools = $('#ftools');
  const addTool = (btn) => {
    let el = btn;
    if (!(btn instanceof Element)) {
      const { id, label = '', title = '', icon: ic, pressed, onClick } = btn || {};
      el = document.createElement('button');
      el.type = 'button';
      if (id) el.id = id;
      el.title = title || label;
      el.innerHTML = `${ic ? icon(ic, { size: 16 }) : ''}${label ? `<span>${esc(label)}</span>` : ''}`;
      if (!label) el.setAttribute('aria-label', title);
      if (pressed != null) el.setAttribute('aria-pressed', String(!!pressed));
      if (onClick) el.addEventListener('click', onClick);
    }
    el.classList.add('tbtn');
    ftools.appendChild(el);
    ftools.hidden = false;
    return el;
  };

  // ---------------------------------------------------------------- page plein écran (sur l'espace de travail)
  const wp = $('#wpage');
  const wpTitle = wp.querySelector('.wp-title');
  const wpIcon = wp.querySelector('.wp-icon');
  const wpBody = wp.querySelector('.wp-body');
  let routing = null; // jeton d'adresse en cours de traitement (page liée à l'adresse)
  let page = null; // { routed, onClose }
  const showPage = (title, content, { icon: ic, onClose } = {}) => {
    const prev = page;
    page = { routed: routing != null, token: routing, onClose };
    if (prev?.onClose && prev.onClose !== onClose) try { prev.onClose(); } catch (err) { console.error(err); }
    wpTitle.textContent = title ?? '';
    wpIcon.innerHTML = ic ? icon(ic, { size: 20 }) : '';
    fill(wpBody, content);
    wp.hidden = false;
    wp.scrollTop = 0;
    wpBody.scrollTop = 0;
    document.body.classList.add('page-open');
    bus.emit('page', { open: true, title, token: page.token });
    return { element: wpBody, close: closePage };
  };
  /** Ferme la page ; une page liée à l'adresse revient à la vue d'en dessous. */
  const closePage = () => {
    if (!page) return;
    const p = page;
    hidePage();
    if (p.routed) app.go(app.viewToken());
  };
  const hidePage = () => {
    if (!page) return;
    const p = page;
    page = null;
    wp.hidden = true;
    wpBody.replaceChildren();
    document.body.classList.remove('page-open');
    if (p.onClose) try { p.onClose(); } catch (err) { console.error(err); }
    bus.emit('page', { open: false, token: p.token });
  };
  wp.querySelector('.wp-close').addEventListener('click', closePage);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && page && $('#modal').hidden) closePage();
  });

  // ---------------------------------------------------------------- emplacements fixes
  const searchSlot = $('#searchslot');
  const equipmentHome = document.createElement('div');
  equipmentHome.className = 'eqh-slot';

  // ---------------------------------------------------------------- 3D
  /** Un repère « 3 », un chemin « 1>4 » ou ['1', '4'] → chemin de la liste ['1', '4']. */
  const toPath = (ref) => (ref == null ? [] : Array.isArray(ref) ? ref.map(String) : String(ref).split('>').filter(Boolean));
  /** Plusieurs pièces : un repère seul, ou une liste de repères / chemins (['1', '2', '3>4', ['5', '2']]). */
  const toPathList = (refs) => (refs == null ? [] : (Array.isArray(refs) ? refs : [refs]).map(toPath).filter((p) => p.length));
  const viewer = {
    get raw() { return app.viewer(); },
    get scene() { return app.viewer()?.scene ?? null; },
    get camera() { return app.viewer()?.camera ?? null; },
    get model() { return app.is3d() ? app.viewer()?.model ?? null : null; },
    get is3d() { return app.is3d(); },
    /** Chemin 3D (repères résolus : plages, symétriques, groupes) d'un repère ou d'un chemin de la liste. */
    path3d(ref) { return app.path3d(toPath(ref)); },
    highlight(refs, { ghost = false, frame = false } = {}) {
      const v = app.viewer();
      if (!app.is3d() || !v) return 0;
      const paths = toPathList(refs).map((p) => app.path3d(p));
      const objs = v.setMarked(paths, { ghost });
      if (frame && objs.length) v.focusPaths(paths);
      return objs.length;
    },
    isolate(refs, opts = {}) { return viewer.highlight(refs, { ...opts, ghost: true }); },
    clear() { if (app.is3d()) app.viewer()?.setMarked(null); },
    frame(refs) {
      const v = app.viewer();
      if (!app.is3d() || !v) return;
      if (refs == null) v.frame();
      else v.focusPaths(toPathList(refs).map((p) => app.path3d(p)));
    },
    select(ref) { const p = toPath(ref); app.select(p.length ? p : null, { focus: true }); },
  };

  // ---------------------------------------------------------------- contexte
  const ctx = {
    version: 1,
    bus,
    on: bus.on,
    off: bus.off,
    once: bus.once,
    emit: bus.emit,
    get equipment() { return app.state().eq; },
    get index() { return app.state().index; },
    get view() { const v = app.state().view; return v ? { ...v } : null; },
    get assembly() {
      const { eq, view } = app.state();
      return view?.type === 'assembly' ? eq.assemblies.get(view.id) : null;
    },
    get document() {
      const { eq, view } = app.state();
      return view?.type === 'document' ? eq.documents.get(view.id) : null;
    },
    get selection() {
      const s = app.state();
      if (!s.selected) return null;
      return { ref: s.selected[s.selected.length - 1], path: [...s.selected], row: app.rowAt(s.selected) };
    },
    viewer,
    go: (target) => (String(target).startsWith('#') ? (location.hash = target) : app.follow(String(target))),
    hashFor: (token, eqId) => `#${app.hashFor(token, eqId)}`,
    registerRoute(token, handler) {
      if (!/^[a-z][a-z0-9_-]*$/.test(token)) throw new Error(`Jeton d'adresse invalide : « ${token} »`);
      routes.set(token, handler);
    },
    pageUrl: (sheet) => app.state().eq?.pageUrl(sheet) ?? null,
    openPage: (sheet) => app.openPage(String(sheet)),
    sheetTitle: (sheet) => app.state().eq?.sheetTitles[sheet] ?? '',
    sheetOwner: (sheet) => app.state().eq?.sheetOwner.get(sheet) ?? null,
    systems: () => systems(app.state().eq),
    systemOf: (id) => systemOf(app.state().eq, id),
    has3d: (id) => app.has3d(id),
    icons: { icon, iconEl },
    esc,
    toast: (msg, ms) => app.toast(msg, ms),
    narrow: () => app.narrow(),
    ui: {
      sidePanel,
      addTool,
      searchSlot,
      equipmentHome,
      showPage,
      closePage,
      setPane: (p) => app.setPane(p),
    },
  };

  /** Charge les modules (sortie de import.meta.glob, eager) dans l'ordre de « order ». */
  const loadFeatures = async (mods) => {
    const list = Object.entries(mods)
      .map(([file, m]) => ({ file, f: m.default }))
      .filter(({ file, f }) => {
        if (!f || typeof f.init !== 'function') { console.warn(`[fonction] ${file} : export par défaut { id, order, init(ctx) } attendu`); return false; }
        return !f.disabled;
      })
      .sort((a, b) => (a.f.order ?? 100) - (b.f.order ?? 100) || a.file.localeCompare(b.file));
    const loaded = [];
    for (const { file, f } of list) {
      try {
        await f.init(ctx);
        loaded.push(f.id || file);
      } catch (err) {
        console.error(`[fonction] ${f.id || file} : échec de init`, err);
      }
    }
    return loaded;
  };

  return {
    ctx,
    bus,
    routes,
    loadFeatures,
    hidePage,
    closePage,
    get pageOpen() { return !!page; },
    /** Traitement d'une adresse de fonction : showPage appelé pendant handler est lié à l'adresse. */
    async runRoute(token, info) {
      const handler = routes.get(token);
      routing = token;
      try { await handler(ctx, info); } catch (err) { console.error(`[fonction] adresse « ${token} »`, err); } finally { routing = null; }
    },
  };
}
