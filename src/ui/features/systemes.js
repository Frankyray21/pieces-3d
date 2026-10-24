// Navigation par systèmes + fil d'Ariane.
//
// 1. Tuiles des systèmes (page de l'équipement, rendue par src/ui/eqhome.js) :
//    une tuile dont l'assemblage n'a pas de modèle 3D propre porte
//    data-sysx-iso / data-sysx-from / data-sysx-path ; un clic ouvre la vue 3D
//    de l'ensemble qui le contient avec ce sous-ensemble isolé, et sa liste de
//    pièces dans le panneau latéral.
// 2. Fil d'Ariane en haut de la vue : équipement › système › … › assemblage ›
//    pièce sélectionnée ; chaque maillon ramène à son niveau. Trop long pour la
//    largeur : les maillons du milieu se replient derrière « … ».

import './systemes.css';

const OWNER = 'systemes';

export default {
  id: 'systemes',
  order: 40,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const badge = (s) => (ctx.equipment?.docWord === 'catalogue' ? String(parseInt(String(s).replace(/^\D+/, ''), 10)) : s);
    const label = (r) => r.label ?? r.ref;

    // ------------------------------------------------------------ sous-ensemble isolé dans la vue de l'ensemble
    let pending = null; // { from, path, target } en attente de l'ouverture de « from »
    let iso = null; // sous-ensemble isolé affiché : { from, path, target }

    const panelHtml = (st) => {
      const eq = ctx.equipment;
      const a = eq.assemblies.get(st.target);
      const sys = ctx.systemOf(st.target);
      const rows = a.parts.map((r) => {
        const sub = r.link && eq.assemblies.get(r.link);
        return `<tr data-sysx-ref="${esc(r.ref)}"><td><span class="sysx-ref">${esc(label(r))}</span></td>
          <td class="mono">${esc(r.pn || '—')}</td><td class="q">${esc(r.qty ?? '')}</td>
          <td>${esc(r.desc || '')}${sub ? ` <span class="sysx-sub">${icon('droite', { size: 12 })}${esc(badge(sub.sheet))}</span>` : ''}</td></tr>`;
      }).join('');
      return `<div class="sysx-panel" style="--sys:${sys?.color || 'var(--accent)'}">
        <p class="sysx-pmeta"><span class="mono">${esc(badge(a.sheet))}</span> · ${a.parts.length} ligne${a.parts.length > 1 ? 's' : ''} · isolé dans « ${esc(eq.assemblies.get(st.from).titleFr)} »</p>
        <div class="sysx-pbtns">
          <button type="button" class="btn" data-go="${esc(st.target)}">${icon('liste', { size: 15 })}Ouvrir l’assemblage</button>
          <button type="button" class="btn" data-page="${esc(a.sheet)}">${icon('page', { size: 15 })}Page du ${eq.docWord}</button>
          <button type="button" class="btn" data-sysx-act="all">${icon('cube', { size: 15 })}Tout afficher</button>
        </div>
        ${a.note ? `<p class="sysx-note">${esc(a.note)}</p>` : ''}
        <table class="sysx-rows"><thead><tr><th>Réf.</th><th>N° pièce</th><th class="q">Qté</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    };

    const showIsolated = (st) => {
      const n = ctx.viewer.isolate([st.path], { frame: true });
      if (!n) { iso = null; ctx.go(st.target); return; } // pas trouvé en 3D : les dessins de l'assemblage
      iso = st;
      const a = ctx.equipment.assemblies.get(st.target);
      ctx.ui.sidePanel.open({ owner: OWNER, title: a.titleFr, icon: ctx.systemOf(st.target)?.icon || 'cle', content: panelHtml(st) });
      // Grand écran : le panneau recouvre la droite de la scène ; le cadrage garde
      // une marge de sa largeur de chaque côté (le sous-ensemble reste visible).
      const v = ctx.viewer.raw;
      const orig = v?.insets;
      const side = ctx.narrow() ? 0 : ctx.ui.sidePanel.element.offsetWidth + 24;
      if (v && side) v.insets = () => ({ ...((typeof orig === 'function' ? orig() : orig) || {}), side });
      try {
        ctx.viewer.select(st.path);
        ctx.viewer.isolate([st.path], { frame: true }); // la sélection recadre : l'isolement garde le cadrage du sous-ensemble
      } finally {
        if (v && side) v.insets = orig;
      }
    };

    document.addEventListener('click', (e) => {
      const t = e.target.closest?.('[data-sysx-iso]');
      if (!t || !ctx.equipment) return;
      e.preventDefault();
      const st = { target: t.dataset.sysxIso, from: t.dataset.sysxFrom, path: t.dataset.sysxPath.split('>') };
      pending = st;
      if (ctx.view?.type === 'assembly' && ctx.view.id === st.from && !document.body.classList.contains('page-open')) {
        pending = null;
        showIsolated(st);
      } else ctx.go(st.from);
      if (ctx.narrow()) ctx.ui.setPane('stage');
    });

    // Panneau : une ligne sélectionne la pièce dans la vue (chemin depuis l'ensemble affiché).
    ctx.ui.sidePanel.element.addEventListener('click', (e) => {
      if (ctx.ui.sidePanel.owner !== OWNER || !iso) return;
      if (e.target.closest('[data-sysx-act="all"]')) { ctx.viewer.clear(); ctx.viewer.frame(); return; }
      const tr = e.target.closest('tr[data-sysx-ref]');
      if (tr) ctx.viewer.select([...iso.path, tr.dataset.sysxRef]);
    });

    ctx.on('assembly', ({ id }) => {
      if (pending && pending.from === id) {
        const st = pending;
        pending = null;
        showIsolated(st);
        return;
      }
      pending = null;
      if (iso && iso.from !== id) {
        iso = null;
        if (ctx.ui.sidePanel.owner === OWNER) ctx.ui.sidePanel.close();
      }
    });
    ctx.on('equipment', () => {
      pending = null;
      iso = null;
    });
    ctx.on('sidepanel', ({ open, owner }) => { if (!open && owner === OWNER) iso = null; });
    ctx.on('select', ({ path }) => {
      if (ctx.ui.sidePanel.owner !== OWNER || !iso) return;
      // Ligne du panneau correspondant à la pièce sélectionnée (sous le sous-ensemble isolé).
      const inside = path && iso.path.every((r, i) => path[i] === r) && path.length > iso.path.length ? path[iso.path.length] : null;
      ctx.ui.sidePanel.body.querySelectorAll('tr.on').forEach((tr) => tr.classList.remove('on'));
      if (inside) ctx.ui.sidePanel.body.querySelector(`tr[data-sysx-ref="${CSS.escape(inside)}"]`)?.classList.add('on');
    });

    // ------------------------------------------------------------ fil d'Ariane
    const stage = document.getElementById('stage');
    const nav = document.createElement('nav');
    nav.className = 'sysx-crumbs';
    nav.setAttribute('aria-label', 'Fil d’Ariane');
    nav.hidden = true;
    const menu = document.createElement('div');
    menu.className = 'sysx-cmenu';
    menu.hidden = true;
    stage.prepend(nav);
    stage.appendChild(menu);
    document.getElementById('shell')?.classList.add('sysx-on');

    /** Maillons : [{ label, title, act, color, cur, home }]. */
    const links = () => {
      const eq = ctx.equipment;
      const v = ctx.view;
      if (!eq || !v) return [];
      const out = [{ label: eq.name, title: `${eq.name} — page de l’équipement et systèmes`, act: 'go:apercu', home: true }];
      if (v.type === 'assembly') {
        const chain = [];
        for (let id = v.id; id && eq.assemblies.has(id); id = eq.assemblies.get(id).parent) {
          if (chain.includes(id)) break;
          chain.unshift(id);
        }
        for (const id of chain) {
          const a = eq.assemblies.get(id);
          const root = id === eq.root;
          out.push({
            label: root ? 'Vue d’ensemble' : a.titleFr,
            title: `${badge(a.sheet)} · ${a.titleFr}`,
            act: `go:${id}`,
            color: ctx.systemOf(id)?.color,
          });
        }
        // Pièce sélectionnée : chaque niveau du chemin (sous-ensemble, puis pièce).
        const sel = ctx.selection;
        if (sel?.path?.length) {
          let asm = eq.assemblies.get(v.id);
          sel.path.forEach((ref, i) => {
            const r = asm?.parts.find((p) => p.ref === ref);
            if (!r) return;
            const sub = r.link && eq.assemblies.get(r.link);
            const last = i === sel.path.length - 1;
            out.push({
              label: sub ? sub.titleFr : `${label(r)} · ${r.desc || r.pn || ''}`,
              title: `Réf. ${label(r)}${r.pn ? ` · ${r.pn}` : ''} · ${r.desc || ''}`,
              act: `sel:${sel.path.slice(0, i + 1).join('>')}`,
              part: true,
              color: ctx.systemOf(v.id)?.color,
            });
            asm = sub || null;
          });
        }
      } else if (v.type === 'document') {
        const d = ctx.document;
        out.push({ label: 'Vue d’ensemble', title: eq.assemblies.get(eq.root)?.titleFr || '', act: `go:${eq.root}` });
        if (d) out.push({ label: d.titleFr, title: d.titleFr, act: `go:${d.id}` });
        const sel = ctx.selection;
        if (sel?.row) out.push({ label: `${label(sel.row)} · ${sel.row.desc || ''}`, title: `Réf. ${label(sel.row)}`, act: `sel:${sel.path.join('>')}`, part: true });
      } else {
        out.push({ label: 'Vue d’ensemble', title: '', act: `go:${eq.root}` });
        out.push({ label: 'Contrôle des listes', title: 'Contrôle des listes', act: 'go:controle' });
      }
      out[out.length - 1].cur = true;
      return out;
    };

    const item = (l, i) => `<button type="button" class="sysx-c${l.cur ? ' cur' : ''}${l.part ? ' part' : ''}${l.home ? ' eq' : ''}" data-i="${i}" title="${esc(l.title)}"${l.cur ? ' aria-current="page"' : ''}${l.color ? ` style="--sys:${l.color}"` : ''}>${l.home ? icon('accueil', { size: 15 }) : l.color ? '<span class="dot"></span>' : ''}<span class="t">${esc(l.label)}</span></button>`;
    const SEP = '<span class="sysx-sep" aria-hidden="true">›</span>';
    let current = [];

    const render = () => {
      menu.hidden = true;
      current = links();
      nav.hidden = !current.length;
      stage.classList.toggle('sysx-has-crumbs', current.length > 0);
      if (!current.length) { nav.innerHTML = ''; return; }
      // Tout afficher, puis replier le milieu tant que ça dépasse (on garde le premier et les deux derniers, puis le dernier).
      const draw = (hidden) => {
        const parts = [];
        let folded = false;
        current.forEach((l, i) => {
          if (hidden.has(i)) {
            if (!folded) { parts.push(`<button type="button" class="sysx-c more" data-more="1" title="Niveaux masqués" aria-haspopup="true">…</button>`); folded = true; }
            return;
          }
          parts.push(item(l, i));
        });
        nav.innerHTML = parts.join(SEP);
        nav.dataset.hidden = [...hidden].join(',');
      };
      // Mesure sans rétrécir les maillons : on replie le milieu d'abord, l'ellipse de chaque maillon ensuite.
      const n = current.length;
      const hidden = new Set();
      nav.classList.add('measure');
      draw(hidden);
      for (let i = 1; nav.scrollWidth > nav.clientWidth + 1 && i < n - 1; i++) {
        hidden.add(i);
        draw(hidden);
      }
      nav.classList.remove('measure');
    };

    const run = (act) => {
      const k = act.indexOf(':');
      const [kind, arg] = [act.slice(0, k), act.slice(k + 1)];
      if (kind === 'go' && ctx.view?.type === 'assembly' && ctx.view.id === arg && !document.body.classList.contains('page-open')) {
        // Niveau de l'assemblage affiché : on remonte à l'ensemble (plus de pièce sélectionnée ni d'isolement).
        ctx.viewer.select(null);
        ctx.viewer.clear();
        ctx.viewer.frame();
        if (ctx.ui.sidePanel.owner === OWNER) ctx.ui.sidePanel.close();
      } else if (kind === 'go') ctx.go(arg);
      else if (kind === 'sel') ctx.viewer.select(arg.split('>'));
    };
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.more) {
        const hid = (nav.dataset.hidden || '').split(',').filter(Boolean).map(Number);
        menu.innerHTML = hid.map((i) => item(current[i], i)).join('');
        const r = b.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        menu.style.left = `${Math.max(8, Math.min(r.left - s.left, s.width - 268))}px`;
        menu.style.top = `${r.bottom - s.top + 6}px`;
        menu.hidden = !menu.hidden;
        return;
      }
      const l = current[Number(b.dataset.i)];
      if (l && !l.cur) run(l.act);
      else if (l?.cur && l.act.startsWith('sel')) ctx.viewer.frame(l.act.slice(4).split('>')); // « sel:… » : recadrer la pièce
    });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      menu.hidden = true;
      run(current[Number(b.dataset.i)].act);
    });
    document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && !nav.contains(e.target)) menu.hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.hidden = true; });

    let raf = 0;
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    for (const t of ['view', 'assembly', 'select', 'equipment']) ctx.on(t, later);
    ctx.on('route', ({ token }) => { if (token === 'catalogue') { nav.hidden = true; menu.hidden = true; } else later(); });
    let lastW = 0;
    new ResizeObserver(() => { if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; later(); } }).observe(stage);
  },
};
