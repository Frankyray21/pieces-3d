// Documentation d'atelier tirée du manuel de pièces (equipment/<id>/atelier.json,
// produit par tools/build_atelier.py) : navigation par système, données
// techniques, entretien, consignes imprimées sur les dessins, schémas par
// circuit et bulles cliquables des planches. Ce que le manuel ne contient pas
// (procédures pas à pas, intervalles, codes de diagnostic…) est dit tel quel.
import { icon } from './icons.js';

export const VIEWS = {
  technique: { title: 'Données techniques', icon: 'tech' },
  entretien: { title: 'Entretien', icon: 'service' },
  consignes: { title: 'Consignes des dessins', icon: 'notes' },
  schemas: { title: 'Schémas par circuit', icon: 'schema' },
};
const KINDS = {
  couple: 'Couple de serrage', freinage: 'Freinage et étanchéité', graissage: 'Graissage et huile',
  reglage: 'Réglage, cales, orientation', trousse: 'Trousse', note: 'Note de montage',
};
const FAM = { electricite: ['Électricité', 'electric'], hydraulique: ['Hydraulique', 'hydraulic'], air: ['Air comprimé et eau', 'air'] };
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

export function isAtelierToken(t) {
  return Object.hasOwn(VIEWS, t) || /^sys-[a-z]+$/.test(t);
}

export function createAtelier(ctx) {
  const { S, esc } = ctx;
  const A = () => S.eq?.atelier || null;

  // ---------------------------------------------------------------- index
  function ix() {
    const eq = S.eq;
    if (eq._atl) return eq._atl;
    const a = eq.atelier;
    const sysOf = new Map();
    for (const s of a.systems) [...s.assemblies, ...s.documents].forEach((id) => sysOf.set(id, s.id));
    const docFam = new Map();
    const rungs = [];
    for (const [s, v] of Object.entries(a.schematics || {})) {
      if (!docFam.has(v.doc)) docFam.set(v.doc, v.fam);
      if (v.rungs) rungs.push({ sheet: s, doc: v.doc, lo: v.rungs[0], hi: v.rungs[1], ry: v.ry });
    }
    const notes = new Map(a.notes.map((n) => [n.id, n]));
    eq._atl = { a, sysOf, systems: new Map(a.systems.map((s) => [s.id, s])), docFam, rungs, notes };
    return eq._atl;
  }
  const has = () => !!A();
  const sysOf = (id) => ix().sysOf.get(id) || null;
  const sysName = (id) => ix().systems.get(id)?.name || '';

  function sysChip(id, cls = '') {
    const s = ix().systems.get(id);
    if (!s) return '';
    return `<span class="sysico ${cls}" style="--c:var(--sys-${s.id})" title="${esc(s.name)}">${icon(s.icon)}</span>`;
  }

  /** Planche d'une source (page de l'assemblage ou première page du schéma). */
  function sheetOf(src) {
    if (!src) return null;
    if (src.sheet) return src.sheet;
    if (src.type === 'asm') return S.eq.assemblies.get(src.id)?.sheet || src.id;
    if (src.type === 'doc') return S.eq.documents.get(src.id)?.sheets[0] || null;
    return null;
  }
  function srcTitle(src) {
    if (src?.type === 'asm') return S.eq.assemblies.get(src.id)?.titleFr || src.id;
    if (src?.type === 'doc') return S.eq.documents.get(src.id)?.titleFr || src.id;
    return 'Fiche de l\'équipement';
  }
  function srcLabel(src) {
    const s = sheetOf(src);
    return `${s ? `${esc(ctx.badge(s))} · ` : ''}${esc(srcTitle(src))}${src?.ref ? ` · réf. ${esc(src.ref)}` : ''}`;
  }
  const pbadge = (src) => { const s = sheetOf(src); return s ? `<span class="pbadge">${esc(ctx.badge(s))}</span>` : ''; };
  const rowKey = (src) => (src?.ref != null && src.type !== 'spec' ? `${src.id}:${src.ref}` : null);
  const rowExists = (key) => !!key && S.eq.rows.some((r) => r.key === key);
  const has3d = (id) => ctx.has3d(id);

  /** Extrait d'une planche (zone [x, y, l, h] normalisée), cliquable : ouvre la planche. */
  function crop(sheet, box, pad = 0.018) {
    if (!sheet || !box) return '';
    const x = Math.max(0, box[0] - pad), y = Math.max(0, box[1] - pad * 0.8);
    const w = Math.min(1 - x, box[2] + 2 * pad), h = Math.min(1 - y, box[3] + 1.6 * pad);
    return `<button type="button" class="crop" data-page="${esc(sheet)}" data-box="${box.join(',')}" style="--x:${x};--y:${y};--w:${w};--h:${h}" title="Ouvrir la planche ${esc(ctx.badge(sheet))}">
      <img src="${esc(S.eq.pageUrl(sheet))}" alt="Extrait de la planche ${esc(ctx.badge(sheet))}" loading="lazy" decoding="async"></button>`;
  }
  /** Rapport largeur/hauteur des extraits, une fois la planche chargée. */
  function fitCrops(root) {
    root.querySelectorAll('.crop img').forEach((img) => {
      const set = () => {
        const b = img.parentElement;
        const st = getComputedStyle(b);
        const w = +st.getPropertyValue('--w'), h = +st.getPropertyValue('--h');
        if (img.naturalWidth) b.style.aspectRatio = `${(w * img.naturalWidth).toFixed(1)} / ${(h * img.naturalHeight).toFixed(1)}`;
      };
      if (img.complete) set(); else img.addEventListener('load', set, { once: true });
      img.addEventListener('error', () => { img.parentElement.classList.add('gone'); }, { once: true });
    });
  }

  const miss = (items) => `<aside class="atl-miss"><strong>Absent du manuel de pièces</strong><ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul></aside>`;

  function head(ico, title, lede, sys) {
    const eq = S.eq;
    return `<header class="atl-head">${ico}<div>
      <p class="atl-kicker"><button type="button" data-go="${esc(eq.root)}">${esc(eq.name)}</button>${sys ? ` › <button type="button" data-go="sys-${sys}">${esc(sysName(sys))}</button>` : ''}</p>
      <h1>${esc(title)}</h1>${lede ? `<p class="atl-lede">${lede}</p>` : ''}</div></header>`;
  }
  const viewIcon = (v) => `<span class="sysico big view">${icon(VIEWS[v].icon)}</span>`;

  /** Pastilles de filtre par système (vues générales). */
  function sysFilter(items) {
    const count = new Map();
    items.forEach((it) => it.system && count.set(it.system, (count.get(it.system) || 0) + 1));
    const ids = ix().a.systems.map((s) => s.id).filter((id) => count.has(id));
    if (ids.length < 2) return '';
    return `<div class="chips" role="group" aria-label="Filtrer par système">
      <button type="button" class="fchip ${S.atlSys ? '' : 'on'}" data-sysf="">Tous <span class="n">${items.length}</span></button>
      ${ids.map((id) => `<button type="button" class="fchip ${S.atlSys === id ? 'on' : ''}" data-sysf="${id}">${sysChip(id)}${esc(sysName(id))} <span class="n">${count.get(id)}</span></button>`).join('')}</div>`;
  }
  const bySys = (it) => !S.atlSys || it.system === S.atlSys;
  const selCls = (key) => (S.atlSel === key ? 'sel' : '');

  // ---------------------------------------------------------------- éléments sélectionnables
  /** Élément désigné par une clé « t:3 » (donnée), « g:0 » (graissage), « n:P084-…» (consigne)… */
  function item(key) {
    const a = A();
    if (!a || !key) return null;
    const [k, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    const m = a.maintenance;
    const pick = (arr) => arr?.[+id];
    switch (k) {
      case 't': { const t = pick(a.tech); return t && { kind: t.group, title: t.label, value: t.value, src: t.src, box: t.box, text: t.text, note: t.note, system: t.system }; }
      case 'g': { const g = pick(m.grease); return g && { kind: 'Point de graissage', title: g.title, value: `${g.points} graisseur${g.points > 1 ? 's' : ''}`, src: { ...g.src, ref: g.rows[0]?.ref }, rows: g.rows, system: g.system }; }
      case 'c': { const c = pick(m.central); return c && { kind: 'Graissage centralisé', title: c.title, value: c.lines ? `${c.lines} lignes de graissage` : `${c.parts} pièces`, src: { type: 'asm', id: c.id }, system: 'graissage' }; }
      case 'l': { const t = pick(m.fluids); return t && { kind: 'Capacité', title: t.label, value: t.value, src: t.src, system: t.system }; }
      case 'd': { const t = pick(m.fills); return t && { kind: 'Repère de remplissage', title: t.desc, pn: t.pn, src: t.src, system: t.system }; }
      case 'f': { const t = pick(m.filters); return t && { kind: 'Filtre et élément', title: t.desc, pn: t.pn, qty: t.qty, src: t.src, system: t.system }; }
      case 'k': { const t = pick(m.kits); return t && { kind: 'Trousse', title: t.desc, pn: t.pn, value: t.life, src: t.src, system: t.system }; }
      case 'o': { const t = pick(m.tools); return t && { kind: 'Outillage', title: t.desc, pn: t.pn, src: t.src, system: t.system }; }
      case 'v': { const t = pick(m.intervals); return t && { kind: 'Durée de vie indiquée', title: t.desc, pn: t.pn, value: t.life, src: t.src }; }
      case 'n': { const n = ix().notes.get(id); return n && { kind: KINDS[n.kind], title: srcTitle(n.src), note: n.id, src: n.src, box: n.box, system: n.system }; }
      default: return null;
    }
  }

  // ---------------------------------------------------------------- vues
  function techView() {
    const a = A();
    const rows = a.tech.map((t, i) => ({ ...t, i }));
    const shown = rows.filter(bySys);
    const groups = [];
    for (const t of shown) {
      let g = groups.find((x) => x.name === t.group);
      if (!g) groups.push((g = { name: t.group, rows: [] }));
      g.rows.push(t);
    }
    const torques = rows.some((t) => t.group.startsWith('Couples'));
    const read = rows.some((t) => t.box);
    return `${head(viewIcon('technique'), 'Données techniques', `${rows.length} valeurs relevées dans le manuel : titres et descriptions des listes${read ? ', et valeurs imprimées sur les dessins (relues sur la planche)' : ''}. Unités d'origine, avec leur équivalent métrique.`)}
      ${sysFilter(rows)}
      ${groups.map((g) => `<section class="atl-sec"><h2>${esc(g.name)} <span class="n">${g.rows.length}</span></h2>
        <div class="tscroll"><table class="atl-t"><thead><tr><th>Désignation</th><th>Valeur</th><th class="c-sys"><span class="sr">Système</span></th><th class="c-pg">Page</th></tr></thead><tbody>
        ${g.rows.map((t) => `<tr data-item="t:${t.i}" class="${selCls(`t:${t.i}`)}"><td>${esc(t.label)}</td><td class="val">${esc(t.value) || '—'}</td><td class="c-sys">${t.system ? sysChip(t.system) : ''}</td><td class="c-pg">${pbadge(t.src)}</td></tr>`).join('')}
        </tbody></table></div></section>`).join('') || '<p class="atl-empty">Aucune donnée pour ce système.</p>'}
      ${miss([
        'Cotes de montage, jeux et tolérances : le manuel de pièces n\'en donne pas.',
        torques ? 'Couples de serrage : seuls ceux imprimés sur les dessins sont repris ici ; les autres figurent au manuel d\'entretien du constructeur.' : 'Couples de serrage : aucun n\'est imprimé sur les dessins de ce manuel ; voir le manuel d\'entretien du constructeur.',
      ])}`;
  }

  function maintView() {
    const m = A().maintenance;
    const idx = (arr, k) => (arr || []).map((x, i) => ({ ...x, key: `${k}:${i}` })).filter(bySys);
    const g = idx(m.grease, 'g'), c = idx(m.central, 'c').map((x) => ({ ...x, system: 'graissage' }));
    const l = idx(m.fluids, 'l'), d = idx(m.fills, 'd'), f = idx(m.filters, 'f'), k = idx(m.kits, 'k'), o = idx(m.tools, 'o'), v = idx(m.intervals, 'v');
    const all = [...(m.grease || []), ...(m.fluids || []), ...(m.filters || []), ...(m.kits || []), ...(m.tools || [])];
    const nGrease = g.reduce((s, x) => s + x.points, 0);
    const sec = (ico, title, n, cols, rows, extra = '') => (rows.length ? `<section class="atl-sec"><h2>${icon(ico)} ${title} <span class="n">${n}</span></h2>${extra}
      <div class="tscroll"><table class="atl-t"><thead><tr>${cols.map((x) => `<th class="${x[1] || ''}">${x[0]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></section>` : '');
    const tr = (x, cells) => `<tr data-item="${x.key}" class="${selCls(x.key)}">${cells.join('')}<td class="c-sys">${x.system ? sysChip(x.system) : ''}</td><td class="c-pg">${pbadge(x.src)}</td></tr>`;
    const tail = [['<span class="sr">Système</span>', 'c-sys'], ['Page', 'c-pg']];
    return `${head(viewIcon('entretien'), 'Entretien', 'Plan d\'entretien tiré des listes du manuel : où graisser, quels filtres et quelles trousses commander, quels liquides et en quelle quantité. Cliquez une ligne pour la voir sur la machine.')}
      ${sysFilter(all)}
      ${sec('grease', 'Points de graissage', `${nGrease} graisseurs sur ${g.length} ensembles`, [['Ensemble'], ['Graisseurs', 'num'], ['N° du graisseur'], ...tail],
        g.map((x) => tr(x, [`<td>${esc(x.title)}</td>`, `<td class="num">${x.points}</td>`, `<td class="mono">${esc([...new Set(x.rows.map((r) => r.pn))].join(', '))}</td>`])),
        c.length ? `<div class="cards">${c.map((x) => `<button type="button" class="mini ${selCls(x.key)}" data-item="${x.key}">${icon('grease')}<span><strong>${esc(x.title)}</strong><small>Graissage centralisé · ${x.lines ? `${x.lines} lignes` : `${x.parts} pièces`} · ${esc(ctx.badge(x.id))}</small></span></button>`).join('')}</div>` : '')}
      ${sec('hydraulic', 'Liquides et capacités', l.length, [['Réservoir'], ['Capacité'], ...tail], l.map((x) => tr(x, [`<td>${esc(x.label)}</td>`, `<td class="val">${esc(x.value)}</td>`])))}
      ${sec('decal', 'Repères de remplissage (autocollants)', d.length, [['Repère'], ['N° de pièce'], ...tail], d.map((x) => tr(x, [`<td>${esc(x.desc)}</td>`, `<td class="mono">${esc(x.pn)}</td>`])))}
      ${sec('service', 'Filtres et éléments filtrants', f.length, [['Désignation'], ['N° de pièce'], ['Qté', 'num'], ...tail], f.map((x) => tr(x, [`<td>${esc(x.desc)}</td>`, `<td class="mono">${esc(x.pn)}</td>`, `<td class="num">${x.qty ?? '—'}</td>`])))}
      ${sec('kit', 'Trousses d\'entretien et de réparation', k.length, [['Désignation'], ['N° de pièce'], ['Durée indiquée'], ...tail], k.map((x) => tr(x, [`<td>${esc(x.desc)}</td>`, `<td class="mono">${esc(x.pn)}</td>`, `<td>${esc(x.life || '')}</td>`])))}
      ${sec('tools', 'Outillage spécial', o.length, [['Désignation'], ['N° de pièce'], ...tail], o.map((x) => tr(x, [`<td>${esc(x.desc)}</td>`, `<td class="mono">${esc(x.pn || '—')}</td>`])))}
      ${v.length ? sec('service', 'Durées de vie indiquées', v.length, [['Pièce'], ['N° de pièce'], ['Durée'], ...tail], v.map((x) => tr(x, [`<td>${esc(x.desc)}</td>`, `<td class="mono">${esc(x.pn)}</td>`, `<td>${esc(x.life)}</td>`]))) : ''}
      ${miss([
        v.length ? 'Intervalles d\'entretien : le catalogue ne donne que la durée de certaines trousses (ci-dessus).' : 'Intervalles d\'entretien (heures, jours) : le manuel de pièces n\'en fixe pas ; voir le manuel d\'utilisation et d\'entretien du constructeur.',
        'Qualité et viscosité des huiles et graisses : seulement quand une note du dessin l\'indique (voir Consignes des dessins).',
      ])}`;
  }

  /** Texte d'une consigne : une suite numérotée (« 1. … 2. … ») devient une liste d'étapes. */
  function steps(text, cls) {
    const parts = String(text).split(/\s+(?=\d{1,2}[.)]\s*\S)/);
    const head = /^\d{1,2}[.)]/.test(parts[0]) ? '' : parts.shift();
    if (parts.length < 2) return `<p class="${cls}">${esc(text)}</p>`;
    return `${head ? `<p class="${cls}">${esc(head)}</p>` : ''}<ol class="${cls} steps">${parts.map((p) => `<li>${esc(p.replace(/^\d{1,2}[.)]\s*/, ''))}</li>`).join('')}</ol>`;
  }

  function noteCard(n) {
    const key = `n:${n.id}`;
    return `<article class="note-card ${selCls(key)}" data-item="${key}">
      ${crop(n.src.sheet, n.box)}
      <div class="nc-body"><div class="nc-top"><span class="kind k-${n.kind}">${KINDS[n.kind]}</span>${n.system ? sysChip(n.system) : ''}</div>
        ${n.fr ? steps(n.fr, 'fr') : ''}<p class="en">${esc(n.en)}${n.ocr ? ' <span class="ocrtag" title="Texte lu automatiquement sur la planche, non relu">lecture auto.</span>' : ''}</p>
        <p class="nc-src">${srcLabel(n.src)}</p></div></article>`;
  }

  function notesView() {
    const a = A();
    const all = a.notes;
    const kinds = Object.keys(KINDS).filter((k) => all.some((n) => n.kind === k));
    const shown = all.filter(bySys).filter((n) => !S.atlKind || n.kind === S.atlKind);
    return `${head(viewIcon('consignes'), 'Consignes des dessins', `${all.length} consignes imprimées sur les planches du manuel (couples, produits de freinage, cales, orientation, trousses…), avec l'extrait du dessin et la traduction. Les repères cités renvoient aux pièces de la liste.`)}
      ${miss(['Procédures de réparation pas à pas : le manuel de pièces n\'en contient pas. Les consignes ci-dessous sont celles que le dessinateur a portées sur chaque planche.'])}
      ${kinds.length > 1 ? `<div class="chips" role="group" aria-label="Filtrer par type"><button type="button" class="fchip ${S.atlKind ? '' : 'on'}" data-kind="">Toutes</button>${kinds.map((k) => `<button type="button" class="fchip ${S.atlKind === k ? 'on' : ''}" data-kind="${k}"><span class="kdot k-${k}"></span>${KINDS[k]} <span class="n">${all.filter((n) => n.kind === k).length}</span></button>`).join('')}</div>` : ''}
      ${sysFilter(all)}
      <div class="note-grid">${shown.map(noteCard).join('') || '<p class="atl-empty">Aucune consigne pour ce filtre.</p>'}</div>`;
  }

  /** Planches de schémas d'une famille, regroupées par document. */
  function schemDocs(fam) {
    const out = new Map();
    for (const [s, v] of Object.entries(A().schematics || {})) {
      if (v.fam !== fam) continue;
      if (!out.has(v.doc)) out.set(v.doc, []);
      out.get(v.doc).push([s, v]);
    }
    return out;
  }
  function circuitCounts(fam, doc) {
    const n = {};
    if (fam === 'electricite') {
      for (const v of Object.values(A().schematics || {})) if (v.doc === doc || (!doc && v.fam === fam)) (v.marks || []).forEach((m) => { n[m[0]] = (n[m[0]] || 0) + 1; });
    } else {
      for (const [d, m] of Object.entries(A().rowCircuits || {})) if (d === doc || (!doc && ix().docFam.get(d) === fam)) Object.values(m).forEach((c) => { n[c] = (n[c] || 0) + 1; });
    }
    return n;
  }
  function legendChips(fam, counts, interactive) {
    return (A().circuits?.[fam] || []).filter((c) => counts[c.id]).map((c) => interactive
      ? `<button type="button" class="lchip c-${fam}-${c.id}" data-circ="${c.id}" aria-pressed="false"><i></i>${esc(c.name)} <span class="n">${counts[c.id]}</span></button>`
      : `<span class="lchip c-${fam}-${c.id}"><i></i>${esc(c.name)}</span>`).join('');
  }

  function schemasView(sys = null) {
    const fams = Object.keys(FAM).filter((f) => (!sys || sys === f) && schemDocs(f).size);
    const body = fams.map((fam) => {
      const docs = schemDocs(fam);
      const inner = [...docs].map(([doc, sheets]) => {
        const d = S.eq.documents.get(doc);
        if (fam === 'electricite') {
          return `<div class="sch-doc"><h3><button type="button" data-go="${esc(doc)}">${esc(d.titleFr)}</button> <span class="n">${sheets.length} planches</span></h3>
            <ol class="circuits">${sheets.map(([s, v]) => `<li><button type="button" data-sheetgo="${esc(s)}"><span class="pbadge">${esc(ctx.badge(s))}</span><span class="t">${esc(v.title || 'Planche sans titre lu')}</span><span class="rg">éch. ${v.rungs[0]}–${v.rungs[1]}</span></button></li>`).join('')}</ol></div>`;
        }
        const n = circuitCounts(fam, doc);
        return `<div class="sch-doc"><h3><button type="button" data-go="${esc(doc)}">${esc(d.titleFr)}</button> <span class="n">${d.parts.length} composants · ${sheets.length} planche${sheets.length > 1 ? 's' : ''}</span></h3>
          <div class="legend-row">${legendChips(fam, n, false)}</div></div>`;
      }).join('');
      const lede = fam === 'electricite'
        ? 'Circuit par circuit : chaque planche du schéma en échelle porte son titre. Sur la planche, les étiquettes sont colorées par catégorie et les renvois « to / from » mènent à l\'échelon cité.'
        : 'Composants de la liste rangés par circuit : sur le schéma, leurs bulles prennent la couleur du circuit ; touchez une couleur pour ne garder que ce circuit.';
      return `<section class="atl-sec"><h2>${icon(FAM[fam][1])} ${FAM[fam][0]}</h2><p class="atl-p">${lede}</p>
        <div class="legend-row">${legendChips(fam, circuitCounts(fam, null), false)}</div>${inner}</section>`;
    }).join('');
    if (sys) return body;
    return `${head(viewIcon('schemas'), 'Schémas par circuit', 'Schémas électriques, hydrauliques et pneumatiques du manuel, en couleur par circuit.')}
      ${body || '<p class="atl-empty">Ce manuel ne contient pas de schéma lisible.</p>'}
      ${miss(['Le tracé des conduites et des fils reste celui de la planche numérisée : la couleur est portée par les repères et les étiquettes lus sur le dessin.'])}`;
  }

  function compCard(id) {
    const eq = S.eq;
    const a = eq.assemblies.get(id);
    if (a) return `<button type="button" class="comp" data-go="${esc(id)}"><span class="sheet ${has3d(id) ? 'm3d' : ''}">${esc(ctx.badge(a.sheet))}</span><span class="t">${esc(a.titleFr)}</span><span class="n">${a.parts.length} pièces${has3d(id) ? ' · 3D' : ''}</span></button>`;
    const d = eq.documents.get(id);
    return d ? `<button type="button" class="comp doc" data-go="${esc(id)}"><span class="sheet">${esc(ctx.badge(d.sheets[0]))}</span><span class="t">${esc(d.titleFr)}</span><span class="n">${d.parts.length ? `${d.parts.length} composants · ` : ''}schéma</span></button>` : '';
  }

  function sysView(id) {
    const a = A();
    const s = ix().systems.get(id);
    if (!s) return '<p class="atl-empty">Système inconnu.</p>';
    const tech = a.tech.map((t, i) => ({ ...t, i })).filter((t) => t.system === id);
    const m = a.maintenance;
    const grease = (m.grease || []).map((x, i) => ({ ...x, key: `g:${i}` })).filter((x) => x.system === id);
    const filters = (m.filters || []).map((x, i) => ({ ...x, key: `f:${i}` })).filter((x) => x.system === id);
    const kits = (m.kits || []).map((x, i) => ({ ...x, key: `k:${i}` })).filter((x) => x.system === id);
    const fluids = (m.fluids || []).map((x, i) => ({ ...x, key: `l:${i}` })).filter((x) => x.system === id);
    const notes = a.notes.filter((n) => n.system === id);
    const comps = [...s.assemblies, ...s.documents];
    const counts = [`${comps.length} composants`, tech.length && `${tech.length} données techniques`, grease.length && `${grease.reduce((x, g) => x + g.points, 0)} graisseurs`,
      filters.length && `${filters.length} filtres`, notes.length && `${notes.length} consignes`].filter(Boolean).join(' · ');
    const list = (title, ico, rows, more) => (rows.length ? `<section class="atl-sec"><h2>${icon(ico)} ${title} <span class="n">${rows.length}</span></h2>${more}</section>` : '');
    const mrow = (x, a1, a2) => `<button type="button" class="mrow ${selCls(x.key)}" data-item="${x.key}"><span class="t">${esc(a1)}</span><span class="v">${esc(a2)}</span>${pbadge(x.src)}</button>`;
    const schem = schemasView(id);
    return `${head(sysChip(id, 'big'), s.name, counts)}
      <section class="atl-sec"><h2>Composants <span class="n">${comps.length}</span></h2><div class="comp-grid">${comps.map(compCard).join('')}</div></section>
      ${list('Données techniques', 'tech', tech, `<div class="tscroll"><table class="atl-t"><tbody>${tech.slice(0, 14).map((t) => `<tr data-item="t:${t.i}" class="${selCls(`t:${t.i}`)}"><td>${esc(t.label)}</td><td class="val">${esc(t.value) || '—'}</td><td class="c-pg">${pbadge(t.src)}</td></tr>`).join('')}</tbody></table></div>${tech.length > 14 ? `<button type="button" class="more" data-viewsys="technique">Les ${tech.length} données du système ›</button>` : ''}`)}
      ${list('Entretien', 'service', [...grease, ...fluids, ...filters, ...kits], `<div class="mlist">${[
        ...grease.map((x) => mrow(x, `Graissage · ${x.title}`, `${x.points} graisseur${x.points > 1 ? 's' : ''}`)),
        ...fluids.map((x) => mrow(x, x.label, x.value)),
        ...filters.slice(0, 12).map((x) => mrow(x, x.desc, x.pn)),
        ...kits.slice(0, 8).map((x) => mrow(x, x.desc, x.pn)),
      ].join('')}</div><button type="button" class="more" data-viewsys="entretien">Plan d'entretien du système ›</button>`)}
      ${list('Consignes des dessins', 'notes', notes, `<div class="note-grid">${notes.slice(0, 6).map(noteCard).join('')}</div>${notes.length > 6 ? `<button type="button" class="more" data-viewsys="consignes">Les ${notes.length} consignes du système ›</button>` : ''}`)}
      ${schem}`;
  }

  // ---------------------------------------------------------------- panneau latéral
  function detailHtml() {
    const it = item(S.atlSel);
    if (!it) return '';
    const sheet = it.note ? ix().notes.get(it.note)?.src.sheet : sheetOf(it.src);
    const box = it.box || (it.note ? ix().notes.get(it.note)?.box : null);
    const key = rowKey(it.src);
    const row = rowExists(key);
    const n = it.note ? ix().notes.get(it.note) : null;
    const asm = it.src?.type === 'asm' || it.src?.type === 'doc' ? it.src.id : null;
    const refs = n?.items?.map((r) => `<button type="button" class="chip" data-row="${esc(`${n.src.id}:${r}`)}">Réf. ${esc(r)}</button>`).join(' ');
    const rows = it.rows?.length ? `<div class="meta">Graisseurs : <span class="lnk">${it.rows.map((r) => `<button type="button" class="chip" data-row="${esc(`${it.src.id}:${r.ref}`)}">Réf. ${esc(r.ref)} · ${esc(r.pn)}${r.qty > 1 ? ` × ${r.qty}` : ''}</button>`).join(' ')}</span></div>` : '';
    return `<div class="detail atl-detail">
      <div class="row1"><span class="kindtag">${esc(it.kind)}</span>${it.system ? sysChip(it.system) : ''}<button type="button" class="close" data-unsel aria-label="Fermer la fiche">×</button></div>
      <h3>${esc(it.title)}</h3>
      ${it.value ? `<div class="bigval">${esc(it.value)}</div>` : ''}
      ${it.pn ? `<div class="pnline"><span class="pnbig">${esc(it.pn)}</span>${it.qty != null ? `<span class="meta">qté ${esc(it.qty)}</span>` : ''}</div>` : ''}
      ${n?.fr ? steps(n.fr, 'fr') : ''}${n ? `<p class="en">${esc(n.en)}</p>` : ''}${it.text ? `<p class="en">${esc(it.text)}</p>` : ''}
      ${box && sheet ? crop(sheet, box, 0.03) : ''}
      ${refs ? `<div class="meta">Pièces citées : <span class="lnk">${refs}</span></div>` : ''}${rows}
      <div class="meta">Source : ${srcLabel(it.src)}</div>
      <div class="actions">
        ${row ? `<button type="button" class="btn primary" data-row="${esc(key)}">Voir la pièce${asm && has3d(asm) ? ' en 3D' : ''}</button>` : ''}
        ${asm ? `<button type="button" class="btn ${row ? '' : 'primary'}" data-go="${esc(asm)}">Ouvrir ${esc(ctx.badge(sheetOf({ type: it.src.type, id: asm })))}</button>` : ''}
        ${sheet ? `<button type="button" class="btn" data-page="${esc(sheet)}"${box ? ` data-box="${box.join(',')}"` : ''}${it.src?.ref ? ` data-ref="${esc(it.src.ref)}"` : ''}>Voir la planche</button>` : ''}
      </div></div>`;
  }

  function renderPanel() {
    const v = S.view.id;
    const panel = ctx.$('#panel');
    const sys = v.startsWith('sys-') ? v.slice(4) : null;
    let title, sub, list;
    if (sys) {
      const s = ix().systems.get(sys);
      const a = A();
      const m = a.maintenance;
      const n = (arr) => (arr || []).filter((x) => x.system === sys).length;
      const go = (view, label, count, ico) => (count ? `<button type="button" class="comp" data-viewsys="${view}"><span class="sysico view">${icon(ico)}</span><span class="t">${label}</span><span class="n">${count}</span></button>` : '');
      title = s?.name || 'Système';
      sub = 'Ce que le manuel donne pour ce système :';
      list = `<div class="comp-list sys-list">
        ${go('technique', 'Données techniques', n(a.tech), 'tech')}
        ${go('entretien', 'Entretien (graissage, filtres, trousses)', n(m.grease) + n(m.filters) + n(m.kits) + n(m.fluids), 'service')}
        ${go('consignes', 'Consignes des dessins', n(a.notes), 'notes')}
        ${(s?.documents || []).map((d) => `<button type="button" class="comp" data-go="${esc(d)}"><span class="sysico view">${icon('schema')}</span><span class="t">${esc(S.eq.documents.get(d)?.titleFr || d)}</span><span class="n">${esc(ctx.badge(S.eq.documents.get(d)?.sheets[0] || d))}</span></button>`).join('')}
        </div>`;
    } else if (v === 'schemas') {
      title = VIEWS[v].title;
      sub = 'Schémas du manuel : touchez-en un pour l\'ouvrir avec ses circuits en couleur.';
      const docs = [...new Set(Object.values(A().schematics || {}).map((x) => x.doc))];
      list = `<div class="comp-list">${docs.map(compCard).join('')}</div>`;
    } else {
      title = VIEWS[v].title;
      sub = 'Touchez une ligne pour voir d\'où elle vient sur la planche. Filtrer par système :';
      list = `<div class="comp-list sys-list"><button type="button" class="comp ${S.atlSys ? '' : 'cur'}" data-sysf=""><span class="sysico view">${icon(VIEWS[v].icon)}</span><span class="t">Tous les systèmes</span><span class="n"></span></button>${ix().a.systems.map((s) => `<button type="button" class="comp ${S.atlSys === s.id ? 'cur' : ''}" data-sysf="${s.id}">${sysChip(s.id)}<span class="t">${esc(s.name)}</span><span class="n">${s.assemblies.length + s.documents.length}</span></button>`).join('')}</div>`;
    }
    panel.innerHTML = `<div class="phead"><h1>${esc(title)}</h1><span class="sub">${sub}</span></div>${detailHtml()}<div class="tablewrap">${list}</div>`;
    fitCrops(panel);
  }

  function renderStage() {
    const v = S.view.id;
    const dv = ctx.$('#docview');
    dv.hidden = false;
    dv.classList.add('atl-view');
    const html = v === 'technique' ? techView() : v === 'entretien' ? maintView() : v === 'consignes' ? notesView() : v === 'schemas' ? schemasView() : sysView(v.slice(4));
    dv.innerHTML = `<div class="atl">${html}</div>`;
    fitCrops(dv);
  }

  /** Ouvre une vue d'atelier (S.view déjà posé par l'appelant). */
  function render({ keepScroll = false } = {}) {
    const dv = ctx.$('#docview');
    const top = dv.scrollTop;
    renderStage();
    renderPanel();
    dv.scrollTop = keepScroll ? top : 0;
  }

  /** Clics dans la vue et le panneau (délégués une fois pour toutes). */
  function bind() {
    const onClick = (e) => {
      const t = e.target;
      const sg0 = t.closest('[data-sheetgo]');
      if (sg0 && S.view?.type !== 'atelier') { gotoSheet(sg0.dataset.sheetgo); return; }
      if (S.view?.type !== 'atelier') return;
      const f = t.closest('[data-sysf]');
      if (f) { S.atlSys = f.dataset.sysf || null; render({ keepScroll: false }); return; }
      const k = t.closest('[data-kind]');
      if (k) { S.atlKind = k.dataset.kind || null; render({ keepScroll: true }); return; }
      const vs = t.closest('[data-viewsys]');
      if (vs) { S.atlSys = S.view.id.slice(4); ctx.go(vs.dataset.viewsys); return; }
      const sg = t.closest('[data-sheetgo]');
      if (sg) { gotoSheet(sg.dataset.sheetgo); return; }
      if (t.closest('[data-unsel]')) { S.atlSel = null; render({ keepScroll: true }); return; }
      const r = t.closest('[data-row]');
      if (r) { e.stopPropagation(); ctx.jumpToRow(r.dataset.row); return; }
      if (t.closest('[data-go], [data-page]')) return; // liens et planches : gérés plus haut
      const it = t.closest('[data-item]');
      if (it) {
        S.atlSel = S.atlSel === it.dataset.item ? null : it.dataset.item;
        S.atlSelView = S.view.id;
        render({ keepScroll: true });
        if (S.atlSel && ctx.narrow()) ctx.setPane('panel');
      }
    };
    ctx.$('#docview').addEventListener('click', onClick);
    ctx.$('#panel').addEventListener('click', onClick);
  }

  // ---------------------------------------------------------------- planches : bulles, schémas
  function rungSheet(n, doc) {
    const rs = ix().rungs.filter((r) => n >= r.lo && n <= r.hi);
    return rs.find((r) => r.doc === doc) || rs[0] || null;
  }

  /** Calque d'une planche : bulles des repères, étiquettes colorées, renvois d'échelons. */
  function overlay(sheet) {
    if (!has()) return '';
    const a = A();
    const owner = S.eq.sheetOwner.get(sheet);
    const sc = a.schematics?.[sheet];
    const fam = sc?.fam || ix().docFam.get(owner);
    const rc = a.rowCircuits?.[owner] || null;
    const out = [];
    for (const [ref, x, y, r] of a.hotspots?.[sheet] || []) {
      const c = rc?.[ref];
      out.push(`<button type="button" class="hs${c ? ` c-${fam}-${c}` : ''}" data-hs="${esc(ref)}"${c ? ` data-circ="${c}"` : ''} style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(r * 200 + 0.5).toFixed(2)}%" aria-label="Repère ${esc(ref)}" title="Réf. ${esc(ref)}"></button>`);
    }
    for (const [c, x, y, w, h] of sc?.marks || []) {
      out.push(`<span class="mk c-electricite-${c}" data-circ="${c}" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%"></span>`);
    }
    for (const [n, x, y, w, h] of sc?.xrefs || []) {
      const t = rungSheet(n, sc.doc);
      if (!t) continue;
      out.push(`<button type="button" class="xr" data-rung="${n}" data-doc="${esc(sc.doc)}" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%" title="Aller à l'échelon ${n} (${esc(ctx.badge(t.sheet))})" aria-label="Échelon ${n}, ${esc(ctx.badge(t.sheet))}"></button>`);
    }
    return out.length ? `<div class="ovl">${out.join('')}</div>` : '';
  }

  /** Bandeau de légende des circuits d'un schéma (au-dessus des planches). */
  function legend(doc) {
    if (!has()) return '';
    const fam = ix().docFam.get(doc);
    if (!fam) return '';
    const n = circuitCounts(fam, doc);
    const chips = legendChips(fam, n, true);
    if (!chips) return '';
    const what = fam === 'electricite' ? 'étiquettes du schéma' : 'composants de la liste';
    return `<div class="legend-bar" role="group" aria-label="Circuits"><span class="lg-t">${icon(FAM[fam][1])} Circuits <small>(${what})</small></span>${chips}</div>`;
  }

  /** Titre lu d'une planche de schéma (pour la légende de la figure). */
  function sheetTitle(sheet) {
    const sc = A()?.schematics?.[sheet];
    return sc?.title ? `${sc.title}${sc.rungs ? ` · échelons ${sc.rungs[0]}–${sc.rungs[1]}` : ''}` : '';
  }

  /** Isole un circuit (les autres s'estompent) ; même circuit : tout réafficher. */
  function isolate(root, circ) {
    const cur = root.dataset.iso || '';
    const next = cur === circ ? '' : circ;
    root.dataset.iso = next;
    root.querySelectorAll('.lchip[data-circ]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.circ === next)));
    root.querySelectorAll('.ovl .hs, .ovl .mk').forEach((el) => el.classList.toggle('dim', !!next && el.dataset.circ !== next));
    // Liste du schéma : les composants des autres circuits s'estompent aussi.
    const fam = ix().docFam.get(S.view?.id);
    ctx.$('#rows')?.querySelectorAll('tr').forEach((tr) => tr.classList.toggle('dim', !!next && !tr.classList.contains(`c-${fam}-${next}`)));
  }

  function markHotspots(root, ref) {
    root?.querySelectorAll('.ovl .hs').forEach((b) => b.classList.toggle('sel', ref != null && b.dataset.hs === ref));
  }

  /** Planche contenant un échelon : ouvre le schéma et la fait défiler jusqu'à lui. */
  function gotoRung(n, doc) {
    const t = rungSheet(n, doc);
    if (t) gotoSheet(t.sheet, n);
  }
  function gotoSheet(sheet, rung = null) {
    const doc = S.eq.sheetOwner.get(sheet);
    const show = () => {
      const fig = ctx.$(`#docview figure[data-sheet="${CSS.escape(sheet)}"]`);
      if (!fig) return;
      const r = A().schematics?.[sheet];
      let y = 0;
      if (rung != null && r?.ry && r.rungs[1] > r.rungs[0]) y = r.ry[0] + (r.ry[1] - r.ry[0]) * (rung - r.rungs[0]) / (r.rungs[1] - r.rungs[0]);
      const dv = ctx.$('#docview');
      const img = fig.querySelector('img');
      const off = fig.offsetTop + (img ? img.offsetHeight * y : 0) - (y ? dv.clientHeight * 0.35 : 64);
      dv.scrollTo({ top: Math.max(0, off), behavior: 'smooth' });
      fig.classList.remove('flash'); void fig.offsetWidth; fig.classList.add('flash');
      if (rung != null && y) {
        fig.querySelectorAll('.rungmark').forEach((m) => m.remove());
        fig.querySelector('.pg')?.insertAdjacentHTML('beforeend', `<span class="rungmark" style="top:${(y * 100).toFixed(2)}%"><b>${rung}</b></span>`);
      }
    };
    if (S.view?.type === 'document' && S.view.id === doc) show();
    else { ctx.follow(doc); setTimeout(() => requestAnimationFrame(show), 60); }
    if (ctx.narrow()) ctx.setPane('stage');
  }

  /** Bulle sur une planche (repère du dessin) pour une ligne de liste, s'il y en a une. */
  function hotspotSheet(row) {
    if (!has() || !row) return null;
    const eq = S.eq;
    const ref = row.label ?? row.ref;
    const src = row.source;
    const sheets = src.type === 'assembly' ? [eq.assemblies.get(src.id).sheet, ...(eq.assemblies.get(src.id).sheets || [])] : eq.documents.get(src.id).sheets;
    return sheets.find((s) => (A().hotspots?.[s] || []).some((h) => h[0] === ref)) || null;
  }

  /** Planches d'un schéma électrique sans liste, par titre de circuit (panneau latéral). */
  function sheetList(doc) {
    if (!has()) return '';
    const items = Object.entries(A().schematics || {}).filter(([, v]) => v.doc === doc && v.rungs);
    if (!items.length) return '';
    return `<div class="comp-list">${items.map(([s, v]) => `<button type="button" class="comp" data-sheetgo="${esc(s)}"><span class="sheet">${esc(ctx.badge(s))}</span><span class="t">${esc(v.title || 'Planche sans titre lu')}</span><span class="n">échelons ${v.rungs[0]}–${v.rungs[1]}</span></button>`).join('')}</div>`;
  }

  /** Circuit d'une ligne de schéma (marque de couleur dans la liste). */
  function rowCircuit(doc, ref) {
    const c = A()?.rowCircuits?.[doc]?.[ref];
    return c ? `c-${ix().docFam.get(doc)}-${c}` : '';
  }

  // ---------------------------------------------------------------- recherche
  function search(q) {
    if (!has()) return [];
    const eq = S.eq;
    const u = fold(q).trim();
    if (u.length < 2) return [];
    const words = u.split(/\s+/);
    const hit = (s) => { const f = fold(s); return words.every((w) => f.includes(w)); };
    const out = [];
    if (/\b(CODES?|DIAGNOSTICS?|DTC|SPN|FMI|DEFAUTS?|ERREURS?|ALARMES?|PANNES?)\b/.test(u)) {
      out.push({ tag: 'Diagnostic', label: 'Codes de diagnostic', sub: 'Ce manuel de pièces n\'en contient aucun : voir le manuel d\'utilisation ou l\'afficheur de la machine.' });
    }
    const pm = /^(?:P|PAGE|F)?\s*(\d{1,3})$/.exec(u);
    if (pm) {
      const s = eq.sheetId(+pm[1]);
      if (eq.sheetTitles[s] != null || eq.sheetOwner.has(s)) out.push({ tag: ctx.badge(s), label: `Page ${ctx.badge(s)} du ${eq.docWord}`, sub: eq.sheetTitles[s] || '', act: () => ctx.openPage(s) });
    }
    for (const s of ix().a.systems) if (hit(s.name)) out.push({ tag: 'Système', label: s.name, sub: `${s.assemblies.length + s.documents.length} composants`, act: () => ctx.go(`sys-${s.id}`) });
    for (const [k, v] of Object.entries(VIEWS)) if (hit(v.title)) out.push({ tag: 'Atelier', label: v.title, sub: '', act: () => ctx.go(k) });
    let n = 0;
    for (const c of [...eq.assemblies.values(), ...eq.documents.values()]) {
      if (n >= 8) break;
      if (hit(`${c.titleFr} ${c.title} ${c.pn || ''}`)) {
        n++;
        const sh = c.sheet || c.sheets[0];
        out.push({ tag: ctx.badge(sh), label: c.titleFr, sub: [sysName(sysOf(c.id)), c.pn && `N° ${c.pn}`].filter(Boolean).join(' · '), act: () => ctx.follow(c.id) });
      }
    }
    n = 0;
    ix().a.tech.forEach((t, i) => {
      if (n < 6 && hit(`${t.label} ${t.value} ${t.group}`)) { n++; out.push({ tag: 'Donnée', label: t.label, sub: `${t.value} · ${t.group}`, act: () => openItem('technique', `t:${i}`) }); }
    });
    n = 0;
    for (const nt of ix().a.notes) {
      if (n < 6 && hit(`${nt.fr || ''} ${nt.en} ${KINDS[nt.kind]}`)) { n++; out.push({ tag: 'Consigne', label: nt.fr || nt.en, sub: `${KINDS[nt.kind]} · ${ctx.badge(nt.src.sheet)}`, act: () => openItem('consignes', `n:${nt.id}`) }); }
    }
    n = 0;
    for (const [s, v] of Object.entries(ix().a.schematics || {})) {
      if (n < 6 && v.title && hit(`${v.title} ${v.titleEn || ''}`)) { n++; out.push({ tag: 'Schéma', label: v.title, sub: ctx.badge(s), act: () => gotoSheet(s) }); }
    }
    return out;
  }

  function openItem(view, key) {
    S.atlSel = key;
    S.atlSelView = view;
    S.atlSys = null;
    S.atlKind = null;
    ctx.go(view);
    if (ctx.narrow()) setTimeout(() => ctx.setPane('panel'), 0);
  }

  // ---------------------------------------------------------------- sommaire
  /** Liens d'atelier et liste des systèmes (rail). */
  function railHtml() {
    if (!has()) return '';
    const v = S.view;
    const cur = v?.type === 'atelier' ? v.id : null;
    const a = A();
    const count = { technique: a.tech.length, entretien: (a.maintenance.grease?.length || 0) + (a.maintenance.filters?.length || 0) + (a.maintenance.kits?.length || 0) + (a.maintenance.fluids?.length || 0), consignes: a.notes.length, schemas: Object.keys(a.schematics || {}).length };
    const nav = Object.entries(VIEWS).filter(([k]) => count[k]).map(([k, x]) => `<button type="button" class="anav ${cur === k ? 'cur' : ''}" data-go="${k}">${icon(x.icon)}<span>${x.title}</span><span class="n">${count[k]}</span></button>`).join('');
    const sysCur = cur?.startsWith('sys-') ? cur.slice(4) : v && (v.type === 'assembly' || v.type === 'document') ? sysOf(v.id) : null;
    const sys = a.systems.map((s) => {
      const open = s.id === sysCur;
      const kids = open ? `<ul class="tree">${[...s.assemblies, ...s.documents].map((id) => {
        const as = S.eq.assemblies.get(id), d = S.eq.documents.get(id);
        const t = as?.titleFr || d?.titleFr;
        return `<li><button type="button" class="node ${v?.id === id ? 'cur' : ''}" data-go="${esc(id)}"><span class="sheet ${as && has3d(id) ? 'm3d' : ''}">${esc(ctx.badge(as ? as.sheet : d.sheets[0]))}</span><span class="t">${esc(t)}</span><span class="n">${(as || d).parts.length || ''}</span></button></li>`;
      }).join('')}</ul>` : '';
      return `<li><button type="button" class="node sysnode ${cur === `sys-${s.id}` ? 'cur' : ''} ${open ? 'open' : ''}" data-go="sys-${s.id}">${sysChip(s.id)}<span class="t">${esc(s.name)}</span><span class="n">${s.assemblies.length + s.documents.length}</span></button>${kids}</li>`;
    }).join('');
    return { nav: `<div class="anavs">${nav}</div>`, systems: `<ul class="tree systree">${sys}</ul>` };
  }

  /** Système du composant affiché (fil d'Ariane). */
  function crumbSystem() {
    if (!has()) return null;
    const v = S.view;
    const id = v?.type === 'atelier' ? (v.id.startsWith('sys-') ? v.id.slice(4) : null) : sysOf(v?.id);
    return id ? { id, name: sysName(id), chip: sysChip(id, 'sm') } : null;
  }

  return {
    has, bind, render, renderPanel, overlay, legend, sheetTitle, isolate, markHotspots, gotoRung, gotoSheet,
    hotspotSheet, rowCircuit, sheetList, search, railHtml, crumbSystem, sysOf, title: (v) => (v.startsWith('sys-') ? sysName(v.slice(4)) : VIEWS[v]?.title || ''),
  };
}
