// Socle des fonctions de l'interface (src/ui/features/*.js) : bus d'événements,
// emplacements d'interface (panneau latéral, outils, recherche, page
// d'équipement, page plein écran), marges de cadrage, touche Échap et contexte
// « ctx » passé à chaque module. main.js fournit l'accès à son état (app) ;
// voir src/ui/features/README.md.

import { Box3 } from 'three';
import { icon, iconEl } from './icons.js';
import { systemOf, systems } from './systems.js';
import { equipmentData } from '../data/extras.js';

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

/** Onglets du téléphone : libellé du bouton de retour du panneau latéral. */
const PANE_BACK = { panel: 'Liste des pièces', rail: 'Assemblages' };

/**
 * Crée le contexte des fonctions. app : accès à l'état de main.js
 * ({ state(), viewer(), is3d(), has3d(), go(), navigate(), follow(), hashFor(),
 *   path3d(), rowAt(), select(), openRow(), assemble(), groups, section,
 *   openPage(), setPane(), pane(), narrow(), toast(), viewToken(),
 *   leaveRoute(), exitFullscreen() }).
 */
export function createHost(app) {
  const bus = createBus();
  const routes = new Map();

  // ---------------------------------------------------------------- touche Échap
  // Une seule couche fermée par appui, de la plus haute à la plus basse :
  // fenêtres surgissantes (> 100), visionneuse des pages (100), page plein
  // écran (80), panneau latéral (60), sélection (40), scène en plein écran (20).
  const escapes = [];
  const onEscape = (fn, order = 50) => {
    const layer = { fn, order };
    escapes.push(layer);
    escapes.sort((a, b) => b.order - a.order);
    return () => { const i = escapes.indexOf(layer); if (i >= 0) escapes.splice(i, 1); };
  };
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    for (const { fn } of escapes) {
      let done = false;
      try { done = !!fn(e); } catch (err) { console.error('[fonction] Échap', err); }
      if (done) { e.preventDefault(); return; }
    }
  });

  // ---------------------------------------------------------------- couches et historique
  // Couches plein écran sans adresse propre (page « Sur le dessin », visionneuse
  // des pages, recherche plein écran du téléphone) : une entrée d'historique
  // (même adresse) est ajoutée à l'ouverture, pour que le bouton Retour du
  // navigateur ferme la couche au lieu de quitter la vue. Fermée par
  // l'interface (×, ‹, Échap), la couche consomme son entrée (history.back) ;
  // une navigation lancée juste après attend la fin de ce retour (whenSettled).
  const layers = []; // { id, onBack }
  let layerSeq = 0;
  let backPending = 0;
  let afterBack = [];
  const flushBack = () => {
    backPending = 0;
    const fns = afterBack;
    afterBack = [];
    for (const fn of fns) { try { fn(); } catch (err) { console.error('[fonction] historique', err); } }
  };
  /** Ajoute une couche ; onBack : fermeture demandée par le bouton Retour. Retourne release() (fermeture par l'interface). */
  const historyLayer = (onBack) => {
    const id = ++layerSeq;
    layers.push({ id, onBack });
    // Une couche fermée juste avant (« Sur le dessin » → visionneuse, recherche → page du manuel) consomme encore son
    // entrée : la nouvelle entrée n'est ajoutée qu'après ce retour, sinon il l'emporterait (et quitterait la vue).
    whenSettled(() => { if (layers.some((l) => l.id === id)) history.pushState({ ...(history.state || {}), layer: id }, ''); });
    const release = () => {
      const i = layers.findIndex((l) => l.id === id);
      if (i < 0) return;
      layers.splice(i, 1);
      // Entrée de la couche toujours affichée (pas de navigation entre-temps) : on la consomme
      // (après un autre retour en cours, s'il y en a un).
      whenSettled(() => {
        if (history.state?.layer !== id) return;
        backPending++;
        history.back();
        setTimeout(() => { if (backPending) flushBack(); }, 1000); // filet : retour sans « popstate »
      });
    };
    release.id = id;
    return release;
  };
  window.addEventListener('popstate', (e) => {
    if (backPending) { flushBack(); return; } // retour demandé par release()
    const cur = e.state?.layer ?? 0;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i].id <= cur) continue;
      const [l] = layers.splice(i, 1);
      try { l.onBack(); } catch (err) { console.error('[fonction] couche', err); }
    }
  });
  /** fn après la fin d'un retour d'historique en cours (couche fermée), sinon tout de suite. */
  const whenSettled = (fn) => { if (backPending) afterBack.push(fn); else fn(); };

  // ---------------------------------------------------------------- panneau latéral droit (dans la scène)
  // Un propriétaire à la fois (owner) : c'est aussi l'arbitrage des modes
  // (circuits, entretien, procédure, sous-ensemble isolé), exclusifs. Une
  // couche ouverte avec over: true (la fiche de la pièce) se pose par-dessus le
  // panneau d'un mode, qui reste actif et revient à sa fermeture ; toute autre
  // ouverture remplace le panneau, et l'ancien propriétaire reçoit
  // 'sidepanel' { open: false } : il se désactive (couleurs, marques rétablies).
  const sp = $('#sidepanel');
  const spTitle = sp.querySelector('.sp-title');
  const spIcon = sp.querySelector('.sp-icon');
  const spBody = sp.querySelector('.sp-body');
  const spBack = sp.querySelector('.sp-back');
  let top = null; // couche affichée : { owner, title, icon, className, over, from }
  let base = null; // couche recouverte : idem + nodes (son contenu, mis de côté)
  // from : sur téléphone, onglet quitté à l'ouverture de la couche (bouton de retour).
  // Scène étroite : le panneau devient un volet bas (atelier.css, requête de conteneur sur #stage).
  const COMPACT_W = 720;
  const isCompact = () => { const w = $('#stage').clientWidth; return w > 0 && w < COMPACT_W; };
  // Volet bas (téléphone, scène étroite) : une entrée d'historique tant qu'il est ouvert, comme pour la visionneuse
  // et les pages ; le bouton Retour du navigateur ferme la couche du dessus (la fiche, puis le mode qu'elle
  // recouvrait) et revient à l'onglet quitté à l'ouverture, sans quitter l'assemblage. Une seule entrée pour toute la
  // pile ; fermé par l'interface (×, Échap…) ou caché par un autre onglet (« Liste des pièces »), le volet consomme son
  // entrée, reprise quand l'onglet « Vue » le remontre.
  let spLayer = null; // release() de l'entrée d'historique du volet
  const holdHistory = () => {
    if (spLayer || sp.hidden || !(app.narrow() || isCompact()) || (app.narrow() && app.pane() !== 'stage')) return;
    spLayer = historyLayer(() => {
      spLayer = null;
      if (sp.hidden) return;
      const from = top?.from;
      sidePanel.close();
      if (from && app.narrow() && app.pane() === 'stage') app.setPane(from);
      holdHistory(); // un mode reste ouvert sous la fiche fermée : une entrée pour lui
    });
  };
  const dropHistory = () => { const release = spLayer; spLayer = null; release?.(); };
  const setOpen = (on) => {
    sp.hidden = !on;
    $('#stage').classList.toggle('side-open', on);
    if (on) { placePanel(); holdHistory(); } else dropHistory();
    // La scène garde sa taille (le panneau la recouvre) ; seule la mise en page des outils change.
  };
  const renderBack = () => {
    const label = base ? base.title : top?.from && app.narrow() ? PANE_BACK[top.from] : null;
    spBack.hidden = !label;
    if (label) {
      spBack.querySelector('span').textContent = label;
      spBack.title = base ? `Revenir à « ${label} »` : `Revenir à l'onglet « ${label} »`;
    }
  };
  const show = (layer) => {
    spTitle.textContent = layer.title ?? '';
    spIcon.innerHTML = layer.icon ? icon(layer.icon, { size: 18 }) : '';
    sp.className = `sidepanel${layer.className ? ` ${layer.className}` : ''}`;
    sp.dataset.owner = layer.owner ?? '';
    renderBack();
  };
  const takeNodes = () => {
    const frag = document.createDocumentFragment();
    frag.append(...spBody.childNodes);
    return frag;
  };
  const emitPanel = (open, owner, extra = {}) => bus.emit('sidepanel', { open, owner, ...extra });
  const sidePanel = {
    element: sp,
    get body() { return spBody; },
    get isOpen() { return !sp.hidden; },
    /** Propriétaire de la couche affichée. */
    get owner() { return sp.hidden ? null : top?.owner ?? null; },
    /** Propriétaire de la couche recouverte par une couche « over » (ou null). */
    get base() { return sp.hidden ? null : base?.owner ?? null; },
    /** Vrai si owner occupe le panneau (affiché ou recouvert). */
    has(owner) { return !sp.hidden && (top?.owner === owner || base?.owner === owner); },
    open({ title, content, owner = null, icon: ic, className, over = false, reveal = true } = {}) {
      const wasOpen = !sp.hidden;
      // Classe du panneau (mise en page propre à un propriétaire) : gardée d'une ouverture à l'autre.
      const same = wasOpen ? [top, base].find((l) => l?.owner === owner) : null;
      const layer = { owner, title, icon: ic, className: className ?? same?.className ?? '', over };
      const closed = []; // propriétaires qui perdent le panneau
      if (wasOpen && top?.owner === owner) {
        // Même propriétaire : mise à jour.
        if (title == null) layer.title = top.title;
        if (ic === undefined) layer.icon = top.icon;
      } else if (wasOpen && base && base.owner === owner) {
        // Le mode recouvert reprend la main : la couche du dessus se ferme.
        closed.push(top.owner);
        if (content === undefined) spBody.replaceChildren(base.nodes);
        if (title == null) layer.title = base.title;
        if (ic === undefined) layer.icon = base.icon;
        base = null;
      } else if (wasOpen && over && top && !top.over) {
        // Couche posée par-dessus le panneau d'un mode, qui reste actif.
        base = { ...top, nodes: takeNodes() };
      } else if (wasOpen) {
        if (top && top.owner !== owner) closed.push(top.owner);
        if (base && !(over && top?.over)) { closed.push(base.owner); base = null; }
      }
      top = layer;
      // Téléphone : la vue s'affiche ; l'onglet quitté reste à portée (bouton « ‹ »).
      layer.from = same?.from ?? null;
      if (app.narrow() && reveal && app.pane() !== 'stage') { layer.from = app.pane(); app.setPane('stage'); }
      if (content !== undefined) fill(spBody, content);
      show(layer);
      setOpen(true);
      for (const o of closed) if (o !== owner) emitPanel(false, o);
      emitPanel(true, owner, { over: !!over, base: base?.owner ?? null });
    },
    /** Ferme la couche affichée ; une couche recouverte revient. */
    close() {
      if (sp.hidden) return;
      const t = top;
      if (base) {
        const b = base;
        base = null;
        top = b;
        spBody.replaceChildren(b.nodes);
        delete b.nodes;
        show(b);
        emitPanel(false, t?.owner ?? null);
        emitPanel(true, b.owner, { restored: true });
        return;
      }
      setOpen(false);
      top = null;
      renderBack();
      emitPanel(false, t?.owner ?? null);
    },
    /** Ferme tout le panneau (couche affichée et couche recouverte). */
    closeAll() {
      if (sp.hidden) return;
      const owners = [top?.owner ?? null, ...(base ? [base.owner] : [])];
      base = null;
      top = null;
      renderBack();
      setOpen(false);
      owners.forEach((o) => emitPanel(false, o));
    },
    /** Rend le panneau si owner l'occupe (affiché : fermé ; recouvert : retiré sous la couche du dessus). */
    release(owner) {
      if (sp.hidden) return;
      if (top?.owner === owner) { sidePanel.close(); return; }
      if (base?.owner === owner) {
        base = null;
        renderBack();
        emitPanel(false, owner);
      }
    },
    toggle(opts = {}) {
      if (!sp.hidden && top?.owner === (opts.owner ?? null)) sidePanel.close();
      else sidePanel.open(opts);
    },
    /** Titre ; owner : celui d'une couche recouverte (sinon la couche affichée). */
    setTitle(t, owner) {
      if (owner != null && base?.owner === owner) { base.title = t ?? ''; renderBack(); return; }
      if (top) top.title = t ?? '';
      spTitle.textContent = t ?? '';
    },
    /** Contenu ; owner : celui d'une couche recouverte (mis de côté jusqu'à son retour). */
    setContent(content, owner) {
      if (owner != null && base?.owner === owner) {
        const frag = document.createDocumentFragment();
        if (content instanceof Node) frag.append(content);
        else { const t = document.createElement('template'); t.innerHTML = String(content ?? ''); frag.append(t.content); }
        base.nodes = frag;
        return;
      }
      if (owner != null && top?.owner !== owner) return;
      fill(spBody, content);
    },
  };
  sp.querySelector('.sp-close').addEventListener('click', () => sidePanel.close());
  // Onglet du téléphone : volet visible (« Vue ») avec son entrée d'historique, ou caché sous un autre onglet sans.
  new MutationObserver(() => { if (app.pane() === 'stage') holdHistory(); else if (app.narrow()) dropHistory(); })
    .observe($('#workspace'), { attributes: true, attributeFilter: ['data-pane'] });
  spBack.addEventListener('click', () => {
    if (base) { sidePanel.close(); return; }
    if (top?.from) { const p = top.from; top.from = null; renderBack(); app.setPane(p); }
  });
  // Le panneau commence sous la barre d'outils de la scène (qui garde toute sa largeur).
  const tools = $('#tools');
  const placePanel = () => {
    const st = $('#stage').getBoundingClientRect();
    if (!st.width || !st.height) return; // scène masquée (onglet du téléphone) : la dernière valeur reste juste
    const tb = tools.getBoundingClientRect();
    const below = !tools.hidden && tb.height ? Math.round(tb.bottom - st.top + 8) : 12;
    $('#stage').style.setProperty('--tools-bottom', `${below}px`);
  };
  new ResizeObserver(placePanel).observe(tools);
  new ResizeObserver(placePanel).observe($('#stage')); // scène de nouveau affichée (onglet « Vue » du téléphone)
  new MutationObserver(placePanel).observe(tools, { attributes: true, attributeFilter: ['hidden'] });

  // ---------------------------------------------------------------- marges de cadrage de la vue 3D
  // Parties de la scène couvertes par l'interface des fonctions (barre d'une
  // procédure…) et par le panneau latéral : le cadrage (Recadrer, sélection,
  // ctx.viewer.frame…) place le modèle dans le reste.
  const insetSources = new Map(); // id → { top, right, bottom, left } | fonction | élément
  const SIDES = ['top', 'right', 'bottom', 'left'];
  /** Marge pour dégager un élément posé sur la scène, par son côté le plus économique. */
  const clearOf = (el, vp) => {
    if (!el || el.hidden || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.right <= vp.left || r.left >= vp.right || r.bottom <= vp.top || r.top >= vp.bottom) return null;
    const m = { top: r.bottom - vp.top, right: vp.right - r.left, bottom: vp.bottom - r.top, left: r.right - vp.left };
    const side = SIDES.reduce((a, k) => (m[k] / (k === 'top' || k === 'bottom' ? vp.height : vp.width) < m[a] / (a === 'top' || a === 'bottom' ? vp.height : vp.width) ? k : a), 'bottom');
    return { [side]: m[side] + 8 };
  };
  const insets = () => {
    const out = { top: 0, right: 0, bottom: 0, left: 0 };
    const vpEl = app.viewer()?.container || $('#viewport');
    const vp = vpEl.getBoundingClientRect();
    if (!vp.width || !vp.height) return out;
    const add = (x) => { if (x) for (const k of SIDES) out[k] = Math.max(out[k], Number(x[k]) || 0); };
    for (const src of insetSources.values()) {
      try {
        if (src instanceof Element) add(clearOf(src, vp));
        else add(typeof src === 'function' ? src(vp) : src);
      } catch (err) { console.error('[fonction] marges', err); }
    }
    if (!sp.hidden) add(clearOf(sp, vp));
    return out;
  };
  const setInsets = (id, value) => {
    if (value == null) insetSources.delete(id);
    else insetSources.set(id, value);
  };

  // ---------------------------------------------------------------- outils de la scène
  // Barre d'outils en deux rangées au besoin : l'éclatement, puis le groupe d'outils (outils du site, puis ceux des
  // fonctions après un séparateur). Scène étroite (téléphone, ou moins de 600 px de scène) : le groupe tient sur une
  // rangée qui défile (glisser, molette, boutons ‹ ›), outils des fonctions en tête pour qu'ils se voient d'emblée.
  const mainGroup = tools.querySelector('.tgroup');
  const feat = document.createElement('span'); // outils des fonctions (display: contents : éléments du groupe)
  feat.className = 'tfeat';
  let sep = null;
  const TOOLS_SCROLL_W = 600; // même seuil que la requête de conteneur de atelier.css
  const toolsScroll = () => { const w = $('#stage').clientWidth; return app.narrow() || (w > 0 && w < TOOLS_SCROLL_W); };
  /** Outils des fonctions : après ceux du site (séparateur devant), ou en tête de la rangée défilante (séparateur après). */
  const placeFeat = () => {
    if (!sep) return;
    if (toolsScroll()) {
      if (feat.lastChild !== sep) feat.append(sep);
      if (mainGroup.firstChild !== feat) mainGroup.prepend(feat);
    } else {
      if (feat.firstChild !== sep) feat.prepend(sep);
      if (mainGroup.lastChild !== feat) mainGroup.append(feat);
    }
  };
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
    el.classList.add('tbtn', 'ftool');
    if (!sep) {
      sep = document.createElement('span');
      sep.className = 'tsep';
      sep.setAttribute('aria-hidden', 'true');
      feat.append(sep);
    }
    if (feat.lastChild === sep && feat.firstChild !== sep) feat.insertBefore(el, sep);
    else feat.append(el);
    placeFeat();
    return el;
  };
  new ResizeObserver(placeFeat).observe($('#stage'));
  // Rangée défilante : fondu et bouton ‹ › sur le bord où il reste des outils ; molette verticale convertie en
  // défilement horizontal ; l'outil qui prend le focus est montré.
  const moreL = tools.querySelector('.tmore.l');
  const moreR = tools.querySelector('.tmore.r');
  const overflowing = () => mainGroup.scrollWidth > mainGroup.clientWidth + 1;
  const toolEdges = () => {
    const over = overflowing();
    const l = over && mainGroup.scrollLeft > 2;
    const r = over && mainGroup.scrollLeft + mainGroup.clientWidth < mainGroup.scrollWidth - 2;
    mainGroup.classList.toggle('more-l', l);
    mainGroup.classList.toggle('more-r', r);
    if (moreL) moreL.hidden = !l;
    if (moreR) moreR.hidden = !r;
  };
  mainGroup.addEventListener('scroll', toolEdges, { passive: true });
  new ResizeObserver(toolEdges).observe(mainGroup);
  new MutationObserver(toolEdges).observe(mainGroup, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'style'] });
  mainGroup.addEventListener('wheel', (e) => {
    if (!overflowing() || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    e.preventDefault();
    mainGroup.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? mainGroup.clientWidth : 1);
  }, { passive: false });
  const scrollTools = (dir) => mainGroup.scrollBy({ left: dir * mainGroup.clientWidth * 0.7, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  moreL?.addEventListener('click', () => scrollTools(-1));
  moreR?.addEventListener('click', () => scrollTools(1));
  mainGroup.addEventListener('focusin', (e) => {
    if (overflowing()) e.target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });

  // ---------------------------------------------------------------- page plein écran (sur l'espace de travail)
  const wp = $('#wpage');
  const wpTitle = wp.querySelector('.wp-title');
  const wpIcon = wp.querySelector('.wp-icon');
  const wpBody = wp.querySelector('.wp-body');
  wpTitle.tabIndex = -1;
  // Contenu recouvert par la page : hors de l'ordre de tabulation et des lecteurs d'écran.
  const COVERED = ['#rail', '#stage', '#panel'];
  const setCovered = (on) => COVERED.forEach((sel) => { const el = $(sel); if (el) el.inert = on; });
  let routing = null; // jeton d'adresse en cours de traitement (page liée à l'adresse)
  let page = null; // { routed, token, onClose, layer, opener }
  const showPage = (title, content, { icon: ic, onClose } = {}) => {
    const prev = page;
    const routed = routing != null;
    // La page s'ouvre hors de la scène : la scène quitte le plein écran.
    app.exitFullscreen?.();
    page = { routed, token: routing, onClose, opener: prev ? prev.opener : document.activeElement };
    if (prev?.onClose && prev.onClose !== onClose) try { prev.onClose(); } catch (err) { console.error(err); }
    // Page sans adresse : une entrée d'historique (Retour du navigateur la ferme) ; reprise d'une page à l'autre.
    if (!routed) {
      const keep = prev && !prev.routed ? prev.layer : null;
      const mine = page;
      page.layer = keep || historyLayer(() => { if (page === mine || page?.layer === mine.layer) hidePage({ fromHistory: true }); });
    } else prev?.layer?.();
    wpTitle.textContent = title ?? '';
    wpIcon.innerHTML = ic ? icon(ic, { size: 20 }) : '';
    fill(wpBody, content);
    wp.hidden = false;
    wp.scrollTop = 0;
    wpBody.scrollTop = 0;
    document.body.classList.add('page-open');
    setCovered(true);
    if (!prev) wpTitle.focus({ preventScroll: true });
    bus.emit('page', { open: true, title, token: page.token });
    return { element: wpBody, close: closePage };
  };
  /** Ferme la page ; une page liée à l'adresse revient à la vue d'en dessous (sans ajouter d'entrée d'historique). */
  const closePage = () => {
    if (!page) return;
    const p = page;
    hidePage();
    if (p.routed) app.leaveRoute();
  };
  const hidePage = ({ fromHistory = false } = {}) => {
    if (!page) return;
    const p = page;
    page = null;
    wp.hidden = true;
    wpBody.replaceChildren();
    document.body.classList.remove('page-open');
    setCovered(false);
    if (!fromHistory) p.layer?.();
    if (p.onClose) try { p.onClose(); } catch (err) { console.error(err); }
    // Focus rendu à l'élément qui a ouvert la page, s'il est encore là.
    const o = p.opener;
    if (o?.isConnected && o !== document.body && !o.closest('[inert]')) o.focus?.({ preventScroll: true });
    bus.emit('page', { open: false, token: p.token });
  };
  wp.querySelector('.wp-close').addEventListener('click', closePage);
  onEscape(() => { if (!page) return false; closePage(); return true; }, 80);
  onEscape(() => { if (sp.hidden) return false; sidePanel.close(); return true; }, 60);

  // ---------------------------------------------------------------- emplacements fixes
  const searchSlot = $('#searchslot');
  const equipmentHome = document.createElement('div');
  equipmentHome.className = 'eqh-slot';

  // ---------------------------------------------------------------- 3D
  /** Un repère « 3 », un chemin « 1>4 » ou ['1', '4'] → chemin de la liste ['1', '4']. */
  const toPath = (ref) => (ref == null ? [] : Array.isArray(ref) ? ref.map(String) : String(ref).split('>').filter(Boolean));
  /**
   * Plusieurs pièces : un repère seul, ou une liste de repères / chemins (['1', '2', '3>4', ['5', '2']]).
   * Attention : un tableau seul est une LISTE de repères ; un chemin seul s'écrit « 5>2 » ou [['5', '2']].
   */
  const toPathList = (refs) => (refs == null ? [] : (Array.isArray(refs) ? refs : [refs]).map(toPath).filter((p) => p.length));
  const live = () => (app.is3d() ? app.viewer() : null);
  // Variantes estompées des matériaux (setBaseMaterials) : les pièces restent cliquables, contrairement au fantôme.
  const dimMats = new Map();
  const dimMaterial = (base, opacity = 0.13) => {
    if (!base) return base;
    const key = `${base.uuid}:${opacity}`;
    let m = dimMats.get(key);
    if (!m) {
      m = base.clone();
      m.transparent = true;
      m.opacity = opacity;
      m.depthWrite = false;
      m.userData = { ...m.userData, fin: null };
      m.onBeforeCompile = () => {};
      m.customProgramCacheKey = () => '';
      dimMats.set(key, m);
    }
    return m;
  };
  const isObjList = (x) => (Array.isArray(x) ? x.length > 0 && x.every((o) => o?.isObject3D) : !!x?.isObject3D);
  /** Objets 3D d'une cible : objet(s) Three.js, ou repère(s) de la liste de l'assemblage affiché. */
  const objectsOf = (target) => {
    const v = live();
    if (!v || target == null) return [];
    if (isObjList(target)) return Array.isArray(target) ? target : [target];
    const out = [];
    for (const p of toPathList(target)) for (const o of v.resolve(app.path3d(p))) if (!out.includes(o)) out.push(o);
    return out;
  };
  const viewer = {
    get raw() { return app.viewer(); },
    get scene() { return app.viewer()?.scene ?? null; },
    get camera() { return app.viewer()?.camera ?? null; },
    get model() { return app.is3d() ? app.viewer()?.model ?? null : null; },
    get is3d() { return app.is3d(); },
    /** Toile WebGL de la vue (clics, pointeur). */
    get canvas() { return app.viewer()?.renderer.domElement ?? null; },
    /** Chemin 3D (repères résolus : plages, symétriques, groupes) d'un repère ou d'un chemin de la liste. */
    path3d(ref) { return app.path3d(toPath(ref)); },
    /** Objets 3D d'un ou plusieurs repères (plusieurs exemplaires possibles). */
    objects(refs) { return objectsOf(refs); },
    highlight(refs, { ghost = false, frame = false } = {}) {
      const v = live();
      if (!v) return 0;
      const paths = toPathList(refs).map((p) => app.path3d(p));
      const objs = v.setMarked(paths, { ghost });
      if (frame && objs.length) v.focusPaths(paths);
      return objs.length;
    },
    isolate(refs, opts = {}) { return viewer.highlight(refs, { ...opts, ghost: true }); },
    /** Met en évidence des objets 3D quelconques (graisseurs, boyaux…). */
    markObjects(objs, { ghost = false, frame = false } = {}) {
      const v = live();
      if (!v) return 0;
      const list = v.markObjects(objectsOf(objs), { ghost });
      if (frame && list.length) v.focusObjects(list);
      return list.length;
    },
    clear() { live()?.setMarked(null); },
    /** Cadre : tout le modèle (sans argument), des repères, des objets 3D ou une boîte (Box3). */
    frame(target) {
      const v = live();
      if (!v) return;
      if (target == null) v.frame();
      else if (target instanceof Box3) { if (!target.isEmpty()) v.frame({ box: target }); }
      else v.focusObjects(objectsOf(target));
    },
    /** Déplace la caméra (position, cible : [x, y, z]). */
    lookAt(pos, target, opts) { live()?.lookAt(pos, target, opts); },
    select(ref) { const p = toPath(ref); app.select(p.length ? p : null, { focus: true }); },
    /** Couleurs : Map ou liste de [maillage, matériau] ; remplace le jeu précédent. */
    setBaseMaterials(entries) { live()?.setBaseMaterials(entries); },
    /** Matériau d'origine d'un maillage (avant setBaseMaterials). */
    originalMaterial(mesh) { return app.viewer()?.originalMaterial(mesh) ?? mesh?.material ?? null; },
    restoreBaseMaterials() { app.viewer()?.restoreBaseMaterials(); },
    /** Variante estompée (transparente) d'un matériau, pour setBaseMaterials : la pièce reste cliquable. */
    dimMaterial,
    /** Montre ou masque des pièces (repères ou objets) et leurs bulles ; retourne les objets. */
    showParts(target, visible = true) {
      const v = live();
      const objs = objectsOf(target);
      if (v && objs.length) v.showParts(objs, visible);
      return objs;
    },
    restoreParts() { app.viewer()?.restoreParts(); },
    /** Arrivée animée de pièces à leur place (montage pas à pas) ; retourne la durée (ms). */
    arriveParts(target, opts) { const v = live(); return v ? v.arriveParts(objectsOf(target), opts) : 0; },
    settleParts() { app.viewer()?.settleParts(); },
    /** Tout rassembler (éclatement à 0, groupes refermés), comme le bouton « Assembler ». */
    assemble({ animate = true } = {}) { if (live()) app.assemble({ animate }); },
    invalidate() { app.viewer()?.invalidate(); },
    /** Groupe éclatable sur place (double-clic) : état et bascule. */
    isGroup(ref) { return !!live() && app.groups.is(toPath(ref)); },
    isGroupOpen(ref) { return !!live() && app.groups.isOpen(toPath(ref)); },
    toggleGroup(ref, force) { if (live()) app.groups.toggle(toPath(ref), force); },
    /** Vue en coupe de la pièce sélectionnée. */
    canCut(ref) { return !!live() && app.section.canCut(toPath(ref)); },
    isCut() { return !!live() && app.section.isCut(); },
    cut(ref) { if (live()) app.section.cut(ref == null ? null : toPath(ref)); },
  };

  // ---------------------------------------------------------------- contexte
  const ctx = {
    version: 2,
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
    go: (target) => (String(target).startsWith('#') ? app.navigate(String(target)) : app.follow(String(target))),
    hashFor: (token, eqId) => `#${app.hashFor(token, eqId)}`,
    registerRoute(token, handler) {
      if (!/^[a-z][a-z0-9_-]*$/.test(token)) throw new Error(`Jeton d'adresse invalide : « ${token} »`);
      routes.set(token, handler);
    },
    /** Ouvre la ligne d'une liste (clé « P042:9 ») : son assemblage ou son document, la ligne sélectionnée. */
    openRow: (key) => app.openRow(String(key)),
    /** Image d'une page du manuel, ou null si la page n'est pas publiée avec cette version du site. */
    pageUrl: (sheet) => app.state().eq?.pageUrl(sheet) ?? null,
    openPage: (sheet) => app.openPage(String(sheet)),
    sheetTitle: (sheet) => app.state().eq?.sheetTitles[sheet] ?? '',
    sheetOwner: (sheet) => app.state().eq?.sheetOwner.get(sheet) ?? null,
    /** Données complémentaires (public/equipment/<id>/<nom>.json : bulles, donnees, entretien, procedures) ou null. */
    equipmentData: (name, eqId) => equipmentData(eqId ?? app.state().eq?.id, name),
    systems: () => systems(app.state().eq),
    systemOf: (id) => systemOf(app.state().eq, id),
    has3d: (id) => app.has3d(id),
    icons: { icon, iconEl },
    esc,
    toast: (msg, ms) => app.toast(msg, ms),
    narrow: () => app.narrow(),
    /** Scène étroite (téléphone, ou moins de 720 px de scène entre le rail et la liste) : volet bas plutôt que panneau latéral. */
    compact: () => app.narrow() || isCompact(),
    ui: {
      sidePanel,
      addTool,
      searchSlot,
      equipmentHome,
      showPage,
      closePage,
      setPane: (p) => app.setPane(p),
      /** Scène (#stage) : élément où poser barres et calques des fonctions. */
      stage: $('#stage'),
      setInsets,
      onEscape,
      historyLayer,
      /** Quitte le plein écran de la scène (avant d'afficher une couche hors de la scène). */
      exitFullscreen: () => app.exitFullscreen?.(),
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
    historyLayer,
    whenSettled,
    /** Marges de cadrage dues aux fonctions et au panneau latéral (px depuis les bords de la vue). */
    insets,
    get pageOpen() { return !!page; },
    /** Traitement d'une adresse de fonction : showPage appelé pendant handler est lié à l'adresse. */
    async runRoute(token, info) {
      const handler = routes.get(token);
      routing = token;
      try { await handler(ctx, info); } catch (err) { console.error(`[fonction] adresse « ${token} »`, err); } finally { routing = null; }
    },
  };
}
