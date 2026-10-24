// Recherche globale : numéros de pièce (tirets, espaces et casse indifférents),
// mots de la description (anglais du manuel, ou français grâce à un petit
// lexique de correspondances), repères des schémas (« réf 12 »), titres
// d'assemblage et de page — sur l'équipement affiché et sur tous les
// équipements du catalogue (data.json chargés à la demande, une fois).
//
// Seule recherche du site : elle prend le champ #q de l'en-tête (index.html).
// Raccourcis : « / » ou Ctrl+K pour ouvrir, flèches, Entrée, Échap.
// Sur téléphone, la recherche s'ouvre en plein écran (au toucher du champ, à
// la frappe ou par Entrée, pas à la simple prise du focus par Tab) ; le reste
// du site sort alors de la tabulation, et Retour du navigateur la ferme.
// L'index du catalogue n'est chargé qu'à la première ouverture.

import './recherche.css';
import { systemOf } from '../systems.js';

// Modèles 3D par équipement (mêmes modules que main.js : rien de plus au paquet).
const MODS = import.meta.glob('../../models/*/index.js', { eager: true });
const MODELS = {};
for (const [file, m] of Object.entries(MODS)) MODELS[file.split('/')[3]] = m.default || {};

// ------------------------------------------------------------------ texte

/** Minuscules sans accents. */
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
/** Numéro de pièce comparable : lettres et chiffres seulement (« hcpe-211 » = « HCPE 211 »). */
const normPn = (s) => fold(s).replace(/^\*/, '').replace(/[^a-z0-9]/g, '');
/** Suite de mots repliés, encadrée d'espaces (recherche de préfixes par « includes(' mot') »). */
const hayOf = (...parts) => ` ${parts.filter(Boolean).map((p) => fold(p).replace(/[^a-z0-9]+/g, ' ').trim()).join(' ')} `;
const isPnText = (v) => /^\d[\d -]{5,12}\d$/.test(String(v || ''));

// Mots français → débuts de mots anglais des listes de pièces (aide à la saisie
// en français ; les descriptions restent celles du manuel).
const LEX = {
  verin: ['cylinder', 'cyl', 'ram'], pompe: ['pump'], moteur: ['motor', 'engine'],
  flexible: ['hose'], boyau: ['hose'], tuyau: ['hose', 'pipe', 'tube'], conduite: ['line', 'pipe', 'tube'],
  filtre: ['filter', 'strainer', 'element'], valve: ['valve'], soupape: ['valve', 'relief'], clapet: ['check', 'valve'],
  distributeur: ['valve', 'directional', 'manifold'], electrovanne: ['solenoid', 'valve'], bobine: ['coil', 'solenoid'],
  joint: ['seal', 'gasket', 'o-ring', 'oring', 'packing'], torique: ['o-ring', 'oring', 'ring'], garniture: ['packing', 'seal'], roulement: ['bearing'], palier: ['bearing', 'bushing'],
  ecrou: ['nut', 'locknut'], boulon: ['bolt', 'hhcs', 'capscrew', 'screw'], vis: ['screw', 'bolt', 'capscrew', 'shcs', 'hhcs'],
  rondelle: ['washer'], raccord: ['fitting', 'adapter', 'adaptor', 'connector', 'union', 'elbow', 'tee', 'nipple', 'coupling'],
  coude: ['elbow'], bouchon: ['plug', 'cap'], couvercle: ['cover', 'cap', 'lid'], reservoir: ['tank', 'reservoir'],
  treuil: ['winch', 'hoist'], cable: ['cable', 'wire'], fil: ['wire'], chenille: ['track', 'crawler'], mat: ['mast'],
  tete: ['head'], accouplement: ['coupling'], ressort: ['spring'], plaque: ['plate'], support: ['bracket', 'support', 'mount'],
  goupille: ['pin'], axe: ['pin', 'shaft', 'axle'], arbre: ['shaft'], engrenage: ['gear'], pignon: ['pinion', 'sprocket', 'gear'],
  manometre: ['gauge', 'gage'], interrupteur: ['switch'], capteur: ['sensor', 'transducer', 'transmitter'], relais: ['relay'],
  fusible: ['fuse'], faisceau: ['harness'], collier: ['clamp', 'collar'], autocollant: ['decal', 'label', 'sticker'],
  etiquette: ['decal', 'label', 'tag'], bague: ['bushing', 'ring', 'sleeve'], douille: ['bushing', 'sleeve', 'socket'],
  accumulateur: ['accumulator'], refroidisseur: ['cooler'], radiateur: ['radiator'], batterie: ['battery'],
  phare: ['light', 'lamp'], lampe: ['lamp', 'light'], lumiere: ['light', 'lamp'], eclairage: ['light', 'lamp'],
  ventilateur: ['fan'], courroie: ['belt'], poulie: ['pulley', 'sheave'], chaine: ['chain'], roue: ['wheel'], pneu: ['tire', 'tyre'],
  siege: ['seat'], frein: ['brake'], machoire: ['jaw'], mandrin: ['chuck'], serre: ['clamp', 'holder', 'chuck'], tige: ['rod'],
  patin: ['pad', 'shoe', 'slide'], glissiere: ['slide', 'guide'], chassis: ['frame', 'chassis'], cadre: ['frame'], cabine: ['cab'],
  reducteur: ['reducer', 'gearbox'], huile: ['oil'], eau: ['water'], graisseur: ['grease', 'lubricator', 'zerk'],
  compresseur: ['compressor'], demarreur: ['starter'], alternateur: ['alternator'], poignee: ['handle', 'grip'], levier: ['lever'],
  manette: ['lever', 'joystick', 'handle'], bouton: ['button', 'knob', 'push'], voyant: ['indicator', 'light', 'lamp'],
  commande: ['control'], panneau: ['panel'], boite: ['box'], carter: ['housing', 'case', 'cover'], corps: ['body'],
  marche: ['step'], echelle: ['ladder'], protecteur: ['guard', 'cover', 'shield'], protection: ['guard', 'cover', 'shield'],
  emerillon: ['swivel'], carottier: ['core barrel', 'barrel'], connecteur: ['connector', 'plug'], clavette: ['key'],
  anneau: ['ring'], entretoise: ['spacer'], cale: ['shim', 'spacer'], moyeu: ['hub'], tambour: ['drum'], bras: ['arm'],
  pied: ['foot', 'leg'], plancher: ['floor', 'deck'], toit: ['roof', 'canopy'], porte: ['door'], vitre: ['glass', 'window'],
  fenetre: ['window'], klaxon: ['horn'], alarme: ['alarm'], avertisseur: ['horn', 'alarm', 'beacon'], tableau: ['panel', 'board'],
  hydraulique: ['hydraulic', 'hyd'], electrique: ['electric', 'elec'], pneumatique: ['pneumatic', 'air'],
  avant: ['front', 'fwd'], arriere: ['rear', 'back'], gauche: ['left', 'lh'], droit: ['right', 'rh'], droite: ['right', 'rh'],
  superieur: ['upper', 'top'], inferieur: ['lower', 'bottom'], haut: ['upper', 'top'], bas: ['lower', 'bottom'],
  interieur: ['inner', 'inside'], exterieur: ['outer', 'outside'], principal: ['main'], securite: ['safety'], urgence: ['emergency'],
  arret: ['stop'], pression: ['pressure'], retour: ['return'], aspiration: ['suction'], vidange: ['drain'], niveau: ['level'],
  avance: ['feed'], foreuse: ['drill'], forage: ['drill'], boue: ['mud'], carburant: ['fuel'], echappement: ['exhaust'],
  silencieux: ['muffler', 'silencer'], vitesse: ['speed'], debit: ['flow'],
  lubrificateur: ['lubricator'], graisse: ['grease'], air: ['air'], tube: ['tube'], piston: ['piston'], console: ['console'],
};
const STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'a', 'au', 'aux', 'et', 'en', 'pour', 'sur', 'un', 'une', 'avec', 'page', 'pages', 'p']);
/** Numéro de page du manuel tel qu'il est imprimé (« 2.4 », « 1.04 », « 4.4.2 »). */
const PAGE_NUM = /^\d{1,2}(?:\.\d{1,2}){1,2}$/;

const LEX_KEYS = Object.keys(LEX);
/** Variantes d'un mot de la requête (pluriel, traduction) ; typing : mot en cours de frappe (« filt » → filtre). */
function variants(w, typing = false) {
  const out = new Set([w]);
  const sing = w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : null;
  if (sing) out.add(sing);
  const keys = [w, sing];
  if (typing && w.length >= 4) keys.push(...LEX_KEYS.filter((k) => k !== w && k.startsWith(w)));
  for (const k of keys) for (const t of LEX[k] || []) out.add(fold(t).replace(/[^a-z0-9]+/g, ' '));
  return [...out];
}

/** Requête analysée : mots, numéro normalisé, repère demandé. */
function parse(q) {
  const raw = fold(q).trim();
  let words = raw.split(/[^a-z0-9#]+/).filter(Boolean);
  let ref = null;
  // « réf 12 », « repère 12 », « #12 » : repère d'un schéma ou d'une liste.
  const m = /^(?:#\s*|(?:ref(?:erence)?|rep(?:ere)?)\.?\s+#?)([a-z0-9]+(?:[-.][a-z0-9]+)?)\b\s*(.*)$/.exec(raw);
  if (m) { ref = m[1].toUpperCase(); words = m[2].split(/[^a-z0-9]+/).filter(Boolean); }
  // « 2.4 », « page 8.3 » : numéro de page imprimé, comparé au numéro entre parenthèses des titres de page.
  const pageTok = raw.split(/\s+/).filter((w) => !STOP.has(w));
  const pageNum = pageTok.length === 1 && PAGE_NUM.test(pageTok[0]) ? pageTok[0] : null;
  const meaningful = words.filter((w) => !STOP.has(w));
  if (meaningful.length) words = meaningful;
  const last = words.length - 1;
  return {
    raw,
    qn: normPn(q),
    pageNum,
    ref,
    // Les mots courts (≤ 2) doivent être complets, sauf le dernier (en cours de frappe).
    words: words.map((w, i) => ({ alts: variants(w, i === last).map((a) => ` ${a}${w.length <= 2 && i !== last ? ' ' : ''}`) })),
  };
}
const matchAll = (hay, words) => words.length > 0 && words.every((w) => w.alts.some((a) => hay.includes(a)));

// ------------------------------------------------------------------ données

/** Normalisation légère d'un data.json (sans le contrôle qualité de main.js). */
function prepare(data) {
  const eq = {
    id: data.id, name: data.name, root: data.root, sheetTitles: data.sheetTitles || {},
    docWord: data.document?.kind === 'catalogue' ? 'catalogue' : 'manuel',
    assemblies: new Map(), documents: new Map(), sheetOwner: new Map(),
  };
  const rows = (parts, source) => {
    const seen = new Map();
    return (parts || []).map((raw) => {
      const [ref0, pn, qty, desc, extra = {}] = raw;
      const n = (seen.get(String(ref0)) || 0) + 1;
      seen.set(String(ref0), n);
      const ref = n === 1 ? String(ref0) : `${ref0}#${n}`;
      const r = { ...extra, ref, pn: pn || '', qty: qty ?? null, desc: desc || '', source, key: `${source.id}:${ref}` };
      if (n > 1) r.label = String(ref0);
      r.pns = [...new Set([r.pn, ...Object.values(r.sizes || {}).filter(isPnText)].filter(Boolean))];
      return r;
    });
  };
  for (const [id, a] of Object.entries(data.assemblies || {})) {
    const sheet = a.sheet || id;
    eq.assemblies.set(id, { ...a, id, sheet, parts: rows(a.parts, { type: 'assembly', id, sheet }), parent: null, children: [] });
  }
  for (const asm of eq.assemblies.values()) {
    for (const p of asm.parts) {
      if (p.link && eq.assemblies.has(p.link)) {
        const c = eq.assemblies.get(p.link);
        if (!c.parent) c.parent = asm.id;
        if (!asm.children.includes(p.link)) asm.children.push(p.link);
      }
    }
  }
  const own = (s, id) => { if (!eq.sheetOwner.has(s)) eq.sheetOwner.set(s, id); };
  for (const asm of eq.assemblies.values()) [asm.id, ...(asm.sheets || []), ...(asm.lists || [])].forEach((s) => own(s, asm.id));
  for (const d of data.documents || []) {
    d.sheets.forEach((s) => own(s, d.id));
    eq.documents.set(d.id, { ...d, parts: rows(d.parts, { type: 'document', id: d.id, sheet: d.sheets[d.sheets.length - 1] }) });
  }
  return eq;
}

const sheetLabel = (eq, s) => (eq.docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s);

/** Index de recherche d'un équipement (normalisé par main.js ou par prepare). */
function buildIndex(eq) {
  const models = MODELS[eq.id] || {};
  const parts = new Map();
  const asms = [];
  const pages = [];
  const titleOf = (src) => (src.type === 'assembly' ? eq.assemblies.get(src.id) : eq.documents.get(src.id));
  const sysCache = new Map();
  const sysOf = (id) => {
    if (!sysCache.has(id)) sysCache.set(id, eq.assemblies.has(id) ? systemOf(eq, id) : null);
    return sysCache.get(id);
  };
  const addRows = (list) => {
    for (const r of list) {
      if (!r.desc && !r.pns.length) continue;
      const main = r.pns[0] || r.supplier || r.pnText || '';
      const k = main ? `pn:${normPn(main)}` : `row:${r.key}`;
      let e = parts.get(k);
      if (!e) {
        e = { kind: 'part', eq, pn: r.pns.join(' / ') || r.supplier || r.pnText || '', desc: r.desc, uses: [], keys: new Set(), descs: new Set(), ctx: new Set() };
        parts.set(k, e);
      }
      const src = titleOf(r.source);
      const use = { type: r.source.type, id: r.source.id, sheet: r.source.sheet, ref: r.ref, label: r.label || r.ref, qty: r.qty, title: src?.titleFr || src?.title || r.source.id, has3d: r.source.type === 'assembly' && !!models[r.source.id] && !r.no3d, sys: r.source.type === 'assembly' ? sysOf(r.source.id) : null };
      e.uses.push(use);
      for (const p of [...r.pns, r.supplier, r.pnText, r.sandvik]) if (p && p !== 'N/A') e.keys.add(normPn(p));
      e.descs.add(r.desc);
      e.ctx.add(src?.titleFr); e.ctx.add(src?.title);
    }
  };
  for (const a of eq.assemblies.values()) {
    addRows(a.parts);
    asms.push({
      kind: 'asm', eq, id: a.id, sheet: a.sheet, title: a.titleFr || a.title, sub: a.title !== a.titleFr ? a.title : '', pn: a.pn || '',
      n: a.parts.length, has3d: !!models[a.id], sys: sysOf(a.id), doc: false,
      hay: hayOf(a.titleFr, a.title, a.id, a.pn), key: normPn(a.pn), idn: normPn(a.id),
    });
  }
  for (const d of eq.documents.values()) {
    addRows(d.parts);
    asms.push({
      kind: 'asm', eq, id: d.id, sheet: d.sheets[0], title: d.titleFr || d.title, sub: d.title !== d.titleFr ? d.title : '', pn: d.pn || '',
      n: d.parts.length, has3d: false, sys: null, doc: true,
      hay: hayOf(d.titleFr, d.title, d.id, d.pn), key: normPn(d.pn), idn: normPn(d.id),
    });
  }
  for (const [s, t] of Object.entries(eq.sheetTitles || {})) {
    pages.push({ kind: 'page', eq, sheet: s, title: t, owner: eq.sheetOwner.get(s) || null, hay: hayOf(t, s, sheetLabel(eq, s)), idn: normPn(s) });
  }
  const list = [...parts.values()].map((e) => {
    e.hay = hayOf(...e.descs);
    e.ctxHay = hayOf(...e.descs, ...e.ctx);
    e.keys = [...e.keys].filter(Boolean);
    e.has3d = e.uses.some((u) => u.has3d);
    e.qty = e.uses[0].qty;
    delete e.descs; delete e.ctx;
    return e;
  });
  // Lignes de chaque liste (pour « réf 12 ») : repère → lignes.
  return { eq, parts: list, asms, pages };
}

// ------------------------------------------------------------------ module

export default {
  id: 'recherche',
  order: 20,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const input = document.querySelector('#q');
    const box = input?.closest('.search');
    if (!input || !box) return; // en-tête absent : rien à faire

    // ---------------------------------------------------------------- champ de l'en-tête
    input.placeholder = 'Pièce, description, assemblage…';
    input.title = 'Rechercher dans tout le catalogue (raccourci : « / » ou Ctrl+K)';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'rch-list');
    input.setAttribute('enterkeyhint', 'search');
    const kbd = document.createElement('kbd');
    kbd.className = 'rch-kbd';
    kbd.textContent = '/';
    kbd.title = 'Raccourci : « / » ou Ctrl+K';
    box.appendChild(kbd);
    box.classList.add('rch-box');

    // ---------------------------------------------------------------- fenêtre des résultats
    const pop = document.createElement('div');
    pop.className = 'rch-pop';
    pop.hidden = true;
    pop.innerHTML = `
      <div class="rch-head">
        <button type="button" class="rch-back" aria-label="Fermer la recherche">${icon('gauche', { size: 20 })}</button>
        <div class="rch-field">${icon('recherche', { size: 16 })}<input type="search" class="rch-input" autocomplete="off" enterkeyhint="search"
          placeholder="N° de pièce, description, assemblage…" aria-label="Rechercher" role="combobox" aria-controls="rch-list" aria-expanded="true"></div>
      </div>
      <div class="rch-list" id="rch-list" role="listbox" aria-label="Résultats de la recherche"></div>
      <div class="rch-foot"><span class="rch-status"></span><span class="rch-keys"><kbd>↑</kbd><kbd>↓</kbd> choisir · <kbd>Entrée</kbd> ouvrir · <kbd>Échap</kbd> fermer</span></div>`;
    document.body.appendChild(pop);
    const list = pop.querySelector('.rch-list');
    const inner = pop.querySelector('.rch-input');
    const status = pop.querySelector('.rch-status');
    let full = false; // plein écran (téléphone)
    const field = () => (full ? inner : input);

    // ---------------------------------------------------------------- index (une fois par équipement)
    const indexes = new Map(); // id → index
    const state = new Map(); // id → 'loading' | 'ready' | 'error'
    const ensureCurrent = () => {
      const eq = ctx.equipment;
      if (eq && !indexes.has(eq.id)) { indexes.set(eq.id, buildIndex(eq)); state.set(eq.id, 'ready'); }
    };
    let loadingAll = null;
    const loadAll = () => {
      if (loadingAll) return loadingAll;
      loadingAll = (async () => {
        for (const e of ctx.index || []) {
          if (state.has(e.id)) continue;
          state.set(e.id, 'loading');
          try {
            const res = await fetch(`equipment/${e.id}/data.json`);
            if (!res.ok) throw new Error(String(res.status));
            const data = await res.json();
            if (!indexes.has(e.id)) indexes.set(e.id, buildIndex(prepare(data)));
            state.set(e.id, 'ready');
          } catch (err) {
            state.set(e.id, 'error');
            console.warn(`[recherche] ${e.id} : données non chargées`, err);
          }
          if (!pop.hidden) render();
          await new Promise((r) => setTimeout(r, 0)); // laisse respirer la page entre deux équipements
        }
      })();
      return loadingAll;
    };
    ctx.on('equipment', () => { ensureCurrent(); if (!pop.hidden) render(); });

    // ---------------------------------------------------------------- recherche
    const LIMITS = { part: 30, asm: 12, page: 10 };
    function find(q) {
      const P = parse(q);
      const cur = ctx.equipment?.id;
      const view = ctx.view;
      const out = { part: [], asm: [], page: [] };
      const n = P.qn.length;
      // « 2.4 », « page 8.3 » : pages dont le titre porte ce numéro (« … (2.4) ») ; aucune : recherche ordinaire.
      let pageHits = null;
      if (P.pageNum) {
        const re = new RegExp(`\\(${P.pageNum.replace(/\./g, '\\.')}(?:\\)|\\s|[,;])`);
        const hits = [...indexes.values()].flatMap((ix) => ix.pages.filter((p) => re.test(p.title)));
        if (hits.length) pageHits = new Set(hits);
      }
      for (const ix of indexes.values()) {
        const here = ix.eq.id === cur ? 200 : 0; // l'équipement affiché d'abord
        if (P.ref) {
          // Repère : lignes des schémas et listes (et de la vue affichée), filtrées par les mots restants.
          for (const e of ix.parts) {
            for (const u of e.uses) {
              if (u.label.toUpperCase() !== P.ref && u.ref.toUpperCase() !== P.ref) continue;
              const inView = ix.eq.id === cur && view?.id === u.id;
              if (!(u.type === 'document' || inView)) continue;
              if (P.words.length && !matchAll(hayOf(u.title, u.id, ...e.hay.split(' ')), P.words)) continue;
              out.part.push({ e, s: (inView ? 900 : 500) + here, use: u });
            }
          }
          continue;
        }
        if (pageHits) {
          // Numéro de page imprimé trouvé dans un titre de page : seules ces pages sont proposées.
          for (const p of ix.pages) if (pageHits.has(p)) out.page.push({ e: p, s: 1000 + here });
          continue;
        }
        for (const e of ix.parts) {
          let s = 0;
          if (n >= 2) {
            for (const k of e.keys) {
              const v = k === P.qn ? 1000 : k.startsWith(P.qn) && n >= 3 ? 800 : n >= 4 && k.includes(P.qn) ? 600 : 0;
              if (v > s) s = v;
            }
          }
          if (!s && matchAll(e.hay, P.words)) s = 300 + (e.hay.startsWith(P.words[0].alts[0]) ? 20 : 0);
          else if (!s && P.words.length > 1 && matchAll(e.ctxHay, P.words)) s = 150;
          if (s) out.part.push({ e, s: s + here + (e.has3d ? 5 : 0) });
        }
        for (const a of ix.asms) {
          let s = 0;
          if (n >= 2 && (a.idn === P.qn || (a.key && a.key === P.qn))) s = 1000;
          else if (n >= 3 && a.key && a.key.startsWith(P.qn)) s = 700;
          else if (matchAll(a.hay, P.words)) s = 400;
          if (s) out.asm.push({ e: a, s: s + here + (a.doc ? 0 : 3) });
        }
        for (const p of ix.pages) {
          let s = 0;
          if (n >= 2 && p.idn === P.qn) s = 1000;
          else if (matchAll(p.hay, P.words)) s = 300;
          if (s) out.page.push({ e: p, s: s + here });
        }
      }
      for (const k of Object.keys(out)) {
        out[k].sort((a, b) => b.s - a.s);
        out[k] = out[k].slice(0, LIMITS[k]);
      }
      return { P, out };
    }

    // ---------------------------------------------------------------- affichage
    let flat = []; // résultats (indices des options)
    let ordre = []; // indices dans l'ordre affiché
    let active = -1;
    let lastQ = null;
    const hl = (text, P) => {
      let h = esc(text);
      const ws = P.words.flatMap((w) => w.alts.map((a) => a.trim())).filter((a) => a.length >= 2 && /^[a-z0-9 -]+$/.test(a));
      if (!ws.length) return h;
      const re = new RegExp(`\\b(${ws.map((w) => w.replace(/[-]/g, '\\-')).join('|')})`, 'gi');
      return h.replace(re, '<mark>$1</mark>');
    };
    const eqTag = (eq) => (eq.id === ctx.equipment?.id ? '' : `<span class="rch-eq">${esc(eq.name)}</span>`);
    const dot = (sys) => `<span class="rch-dot" style="--c:${sys ? sys.color : 'var(--sys-0)'}" title="${esc(sys ? `Système : ${sys.title}` : 'Hors système')}"></span>`;
    const usesHtml = (e, eq) => {
      const max = 3;
      const chips = e.uses.slice(0, max).map((u, i) => `<span class="rch-use" data-use="${i}" title="Ouvrir ${esc(u.title)} et sélectionner la pièce">${esc(sheetLabel(eq, u.sheet))} · ${esc(u.title)} · réf. ${esc(u.label)}${u.qty != null ? ` ×${esc(u.qty)}` : ''}</span>`).join('');
      return chips + (e.uses.length > max ? `<span class="rch-more">+ ${e.uses.length - max} autre${e.uses.length - max > 1 ? 's' : ''}</span>` : '');
    };

    function render() {
      ensureCurrent();
      const q = field().value;
      const t0 = performance.now();
      flat = [];
      ordre = [];
      active = -1;
      if (q.trim().length < 2) {
        list.innerHTML = `<div class="rch-help">
          <p><strong>Cherchez dans ${ctx.index?.length > 1 ? `les ${ctx.index.length} équipements du catalogue` : 'le catalogue'}</strong>, l'équipement affiché en premier :</p>
          <ul><li>un <b>numéro de pièce</b>, entier ou partiel — tirets, espaces et majuscules facultatifs ;</li>
          <li>des <b>mots de la description</b>, en anglais comme au manuel ou en français (vérin, pompe, flexible…) ;</li>
          <li>un <b>repère de schéma</b> : « réf 12 » ou « #12 », suivi au besoin d'un mot du titre (« réf 12 hydraulique ») ;</li>
          <li>un <b>titre d'assemblage</b>, de schéma ou de page, ou son numéro (P042).</li></ul></div>`;
        updateStatus(0);
        setExpanded(true);
        return;
      }
      const { P, out } = find(q);
      pop.dataset.find = (performance.now() - t0).toFixed(1);
      const html = { part: [], asm: [], page: [] };
      let groups = html.part;
      if (out.part.length) {
        groups.push(`<div class="rch-group" role="presentation">${P.ref ? `Repère ${esc(P.ref)}` : 'Pièces'} <span>${out.part.length}${out.part.length >= LIMITS.part ? '+' : ''}</span></div>`);
        for (const r of out.part) {
          const { e } = r;
          const i = flat.push(r) - 1;
          const u = r.use || bestUse(e);
          const sys = u.sys;
          groups.push(`<div class="rch-opt" role="option" id="rch-o${i}" data-i="${i}" aria-selected="false">
            ${dot(sys)}
            <div class="rch-main">
              <div class="rch-l1"><span class="rch-pn mono">${esc(e.pn || '—')}</span>${e.has3d ? '<span class="rch-3d" title="La pièce a un objet 3D">3D</span>' : ''}${eqTag(e.eq)}
                <span class="rch-qty">${r.use ? (r.use.qty != null ? `qté ${esc(r.use.qty)}` : '') : e.qty != null ? `qté ${esc(e.qty)}` : ''}</span></div>
              <div class="rch-desc">${hl(e.desc, P)}</div>
              <div class="rch-uses">${r.use ? `<span class="rch-use" data-use="${e.uses.indexOf(r.use)}">${esc(sheetLabel(e.eq, r.use.sheet))} · ${esc(r.use.title)} · réf. ${esc(r.use.label)}</span>` : usesHtml(e, e.eq)}</div>
            </div></div>`);
        }
      }
      groups = html.asm;
      if (out.asm.length) {
        groups.push(`<div class="rch-group" role="presentation">Assemblages et schémas <span>${out.asm.length}</span></div>`);
        for (const r of out.asm) {
          const a = r.e;
          const i = flat.push(r) - 1;
          groups.push(`<div class="rch-opt" role="option" id="rch-o${i}" data-i="${i}" aria-selected="false">
            ${dot(a.sys)}
            <div class="rch-main">
              <div class="rch-l1"><span class="rch-sheet mono">${esc(sheetLabel(a.eq, a.sheet))}</span><span class="rch-title">${hl(a.title, P)}</span>${a.has3d ? '<span class="rch-3d" title="Assemblage en 3D">3D</span>' : ''}${eqTag(a.eq)}</div>
              <div class="rch-uses">${a.doc ? 'Schéma / liste' : 'Assemblage'} · ${a.n} ligne${a.n > 1 ? 's' : ''}${a.pn ? ` · <span class="mono">${esc(a.pn)}</span>` : ''}${a.sub ? ` · ${esc(a.sub)}` : ''}${a.sys ? ` · ${esc(a.sys.title)}` : ''}</div>
            </div></div>`);
        }
      }
      groups = html.page;
      if (out.page.length) {
        groups.push(`<div class="rch-group" role="presentation">Pages du manuel <span>${out.page.length}</span></div>`);
        for (const r of out.page) {
          const p = r.e;
          const i = flat.push(r) - 1;
          groups.push(`<div class="rch-opt" role="option" id="rch-o${i}" data-i="${i}" aria-selected="false">
            <span class="rch-ico">${icon('page', { size: 16 })}</span>
            <div class="rch-main">
              <div class="rch-l1"><span class="rch-sheet mono">${esc(sheetLabel(p.eq, p.sheet))}</span><span class="rch-title">${hl(p.title, P)}</span>${eqTag(p.eq)}</div>
            </div></div>`);
        }
      }
      // Groupes dans l'ordre de leur meilleur résultat (à égalité : pièces, assemblages, pages).
      const order = ['part', 'asm', 'page'].filter((k) => out[k].length).sort((a, b) => (out[b][0].s - out[a][0].s) || 0);
      const all = order.flatMap((k) => html[k]).join('');
      // Navigation au clavier dans l'ordre affiché.
      list.innerHTML = all
        || `<div class="rch-empty">Rien trouvé pour « ${esc(q)} ». Essayez un numéro partiel, un autre mot de la description ou « réf 12 » pour un repère de schéma.</div>`;
      const shown = [...list.querySelectorAll('.rch-opt')].map((o) => +o.dataset.i);
      if (shown.length) setActive(shown[0], false); // sans défilement : pas de mise en page forcée à chaque frappe
      ordre = shown;
      list.scrollTop = 0;
      lastQ = q;
      updateStatus(performance.now() - t0);
      setExpanded(true);
    }
    function updateStatus(ms) {
      const total = ctx.index?.length || 0;
      const ready = [...state.values()].filter((s) => s === 'ready').length;
      const loading = [...state.values()].some((s) => s === 'loading');
      const err = [...state.values()].filter((s) => s === 'error').length;
      status.textContent = `${loading ? `Chargement du catalogue : ${ready}/${total}…` : `${ready} équipement${ready > 1 ? 's' : ''} indexé${ready > 1 ? 's' : ''}`}${err ? ` · ${err} indisponible${err > 1 ? 's' : ''}` : ''}`;
      pop.dataset.ms = ms.toFixed(1);
    }
    function setExpanded(on) {
      input.setAttribute('aria-expanded', String(on && !full));
    }
    function setActive(i, scroll = true) {
      const opts = list.querySelectorAll('.rch-opt');
      opts.forEach((o) => { o.classList.remove('on'); o.setAttribute('aria-selected', 'false'); });
      active = i;
      const o = list.querySelector(`#rch-o${i}`);
      if (!o) { field().removeAttribute('aria-activedescendant'); return; }
      o.classList.add('on');
      o.setAttribute('aria-selected', 'true');
      field().setAttribute('aria-activedescendant', o.id);
      if (scroll) o.scrollIntoView({ block: 'nearest' });
    }

    // ---------------------------------------------------------------- ouverture / fermeture
    function place() {
      if (full) return;
      const r = box.getBoundingClientRect();
      const w = Math.min(640, window.innerWidth - 32);
      const left = Math.max(16, Math.min(r.right - w, window.innerWidth - 16 - w));
      pop.style.left = `${left}px`;
      pop.style.top = `${Math.round(r.bottom + 6)}px`;
      pop.style.width = `${w}px`;
    }
    let layer = null; // entrée d'historique du plein écran (Retour du navigateur le ferme)
    const shell = document.getElementById('shell');
    function open({ focus = true } = {}) {
      const was = !pop.hidden && full;
      full = ctx.narrow();
      pop.classList.toggle('full', full);
      document.body.classList.toggle('rch-full', full);
      if (full) {
        inner.value = input.value;
        // Plein écran : la scène quitte son propre plein écran, le reste du site sort de la tabulation.
        ctx.ui.exitFullscreen();
        if (shell) shell.inert = true;
        if (!was) layer = ctx.ui.historyLayer(() => close({ fromHistory: true }));
      } else ctx.ui.exitFullscreen();
      pop.hidden = false;
      place();
      loadAll();
      // Plein écran : le champ de l'en-tête est recouvert (inert), la saisie passe au champ de la couche.
      if (full) inner.focus();
      else if (focus && document.activeElement !== input) input.focus();
      if (field().value !== lastQ || !list.childElementCount) render();
      else updateStatus(0);
    }
    function close({ blur = true, fromHistory = false, refocus = false } = {}) {
      if (pop.hidden) return;
      if (full) input.value = inner.value;
      pop.hidden = true;
      document.body.classList.remove('rch-full');
      if (shell) shell.inert = false;
      const rel = layer;
      layer = null;
      if (!fromHistory) rel?.();
      setExpanded(false);
      if (blur) { input.blur(); inner.blur(); }
      // Clavier (Échap en plein écran) : le focus revient au champ de l'en-tête, qui ne rouvre plus la couche.
      if (refocus && full) input.focus({ preventScroll: true });
      full = false;
    }
    window.addEventListener('resize', () => {
      if (pop.hidden) return;
      if (full !== ctx.narrow()) close();
      else place();
    });

    // ---------------------------------------------------------------- saisie et clavier
    const onInput = (e) => {
      if (full && e.target === input) inner.value = input.value; // saisie arrivée dans le champ de l'en-tête
      if (pop.hidden) open({ focus: false }); else render();
    };
    input.addEventListener('input', onInput);
    inner.addEventListener('input', onInput);
    // Ordinateur : la liste s'ouvre à la prise du focus. Téléphone : au toucher (ou à la frappe, Entrée) ;
    // un Tab qui passe par le champ ne doit pas ouvrir le plein écran (il retiendrait le focus).
    input.addEventListener('focus', () => { if (!ctx.narrow()) open({ focus: false }); });
    input.addEventListener('click', () => { if (pop.hidden) open(); });
    const onKey = (e) => {
      const n = flat.length;
      const pos = ordre.indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (n) setActive(ordre[(pos + 1) % n]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) setActive(ordre[(pos - 1 + n) % n]); }
      else if (e.key === 'Enter') { e.preventDefault(); if (pop.hidden) open(); else if (n) pick(active >= 0 ? active : ordre[0]); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // ne pas désélectionner la pièce ni fermer la page en même temps
        if (!pop.hidden) close({ refocus: true });
        else { input.value = ''; input.blur(); }
      } else if (e.key === 'Tab' && !full) close({ blur: false });
      else if (e.key === 'Tab' && full) {
        // Plein écran : le focus reste dans la couche (retour ‹ ↔ champ).
        if (e.target === inner) { e.preventDefault(); pop.querySelector('.rch-back').focus(); }
      }
    };
    input.addEventListener('keydown', onKey);
    inner.addEventListener('keydown', onKey);
    pop.querySelector('.rch-back').addEventListener('click', () => close());
    pop.querySelector('.rch-back').addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); inner.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close({ refocus: true }); }
    });
    // Échap hors du champ (fenêtre ouverte, focus ailleurs) : la fenêtre d'abord.
    ctx.ui.onEscape(() => { if (pop.hidden) return false; close(); return true; }, 120);

    // Raccourcis globaux : « / » (hors champ de saisie) ou Ctrl+K / Cmd+K.
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) {
        e.preventDefault();
        open();
        field().select();
      } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open();
        field().select();
      }
    });

    // Clic dans la liste (sans perdre le focus du champ sur ordinateur).
    pop.addEventListener('mousedown', (e) => { if (!full && e.target !== inner) e.preventDefault(); });
    list.addEventListener('mousemove', (e) => {
      const o = e.target.closest('.rch-opt');
      if (o && +o.dataset.i !== active) setActive(+o.dataset.i, false);
    });
    list.addEventListener('click', (e) => {
      const o = e.target.closest('.rch-opt');
      if (!o) return;
      const chip = e.target.closest('[data-use]');
      pick(+o.dataset.i, chip ? +chip.dataset.use : null);
    });
    // Clic ailleurs : fermer (ordinateur).
    document.addEventListener('pointerdown', (e) => {
      if (pop.hidden || full) return;
      if (pop.contains(e.target) || box.contains(e.target)) return;
      close({ blur: false });
    });

    // ---------------------------------------------------------------- navigation
    /** Usage préféré d'une pièce : vue affichée, puis objet 3D, puis le premier. */
    function bestUse(e) {
      const v = ctx.view;
      const cur = e.eq.id === ctx.equipment?.id;
      return (cur && v && e.uses.find((u) => u.id === v.id)) || e.uses.find((u) => u.has3d) || e.uses[0];
    }
    let pending = null;
    /** Ouvre la vue (équipement, assemblage ou document), puis appelle then(). */
    function openView(eqId, viewId, then) {
      pending?.();
      pending = null;
      const hash = ctx.hashFor(viewId, eqId);
      const pageOpen = document.body.classList.contains('page-open');
      if (ctx.equipment?.id === eqId && ctx.view?.id === viewId && decodeURIComponent(location.hash) === hash) {
        // Vue déjà affichée (sous une page sans adresse propre, comme « Sur le dessin ») : la page se ferme.
        if (pageOpen) ctx.ui.closePage();
        then?.();
        return;
      }
      if (then) {
        const off = ctx.on('route', (d) => {
          if (d.equipmentId !== eqId || d.view?.id !== viewId) return;
          stop();
          // Laisse la vue finir de s'afficher (liste, 3D) avant de sélectionner.
          requestAnimationFrame(() => then());
        });
        const timer = setTimeout(() => stop(), 20000);
        const stop = () => { off(); clearTimeout(timer); if (pending === stop) pending = null; };
        pending = stop;
      }
      ctx.go(hash);
    }
    function selectUse(u) {
      // La fiche de la pièce s'ouvre (sur téléphone : volet bas de la vue, la pièce cadrée au-dessus).
      ctx.viewer.select(u.ref);
      document.querySelector('#rows tr.sel')?.scrollIntoView({ block: 'center' });
      if (ctx.narrow() && !ctx.ui.sidePanel.isOpen) ctx.ui.setPane(ctx.viewer.is3d ? 'stage' : 'panel');
    }
    function pick(i, useIdx = null) {
      const r = flat[i];
      if (!r) return;
      const e = r.e;
      close();
      input.value = '';
      lastQ = null;
      if (e.kind === 'part') {
        const u = useIdx != null ? e.uses[useIdx] : r.use || bestUse(e);
        openView(e.eq.id, u.id, () => selectUse(u));
      } else if (e.kind === 'asm') {
        openView(e.eq.id, e.id, () => { if (ctx.narrow()) ctx.ui.setPane(ctx.viewer.is3d ? 'stage' : 'panel'); });
      } else if (e.kind === 'page') {
        if (e.eq.id === ctx.equipment?.id) ctx.openPage(e.sheet);
        else openView(e.eq.id, e.owner || e.eq.root, () => ctx.openPage(e.sheet));
      }
    }

    // Index du catalogue : chargé à la première ouverture de la recherche (open → loadAll), pas avant.
  },
};
