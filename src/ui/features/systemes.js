// Navigation par systèmes + fil d'Ariane.
//
// 1. Tuiles des systèmes (page de l'équipement, rendue par src/ui/eqhome.js) :
//    une tuile dont l'assemblage n'a pas de modèle 3D propre porte
//    data-sysx-iso / data-sysx-from / data-sysx-path ; un clic ouvre la vue 3D
//    de l'ensemble qui le contient avec ce sous-ensemble isolé, et sa liste de
//    pièces dans le panneau latéral (propriétaire « systemes »). Une ligne de
//    la liste sélectionne la pièce : sa fiche se pose par-dessus la liste, qui
//    revient quand la fiche se ferme.
// 2. Fil d'Ariane en haut de la vue : équipement › système › … › assemblage ›
//    pièce sélectionnée ; chaque maillon ramène à son niveau. Trop long pour la
//    largeur : les maillons du milieu se replient derrière « … ».

import './systemes.css';
import { keyRows } from '../rows.js';

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

    // Lignes sans objet 3D propre : dans la vue de l'ensemble, le sous-ensemble est souvent un seul bloc (ses
    // pièces ne sont pas dessinées à part) ; la ligne ouvre quand même sa fiche, et l'isolement reste visible.
    const NO3D = 'Non dessinée à part en 3D : le sous-ensemble entier est mis en évidence';
    const panelHtml = (st) => {
      const eq = ctx.equipment;
      const a = eq.assemblies.get(st.target);
      const sys = ctx.systemOf(st.target);
      let n3d = 0;
      const rows = a.parts.map((r) => {
        const sub = r.link && eq.assemblies.get(r.link);
        const has = ctx.viewer.objects([[...st.path, r.ref]]).length > 0;
        if (has) n3d++;
        return `<tr data-sysx-ref="${esc(r.ref)}"${has ? '' : ` class="sysx-no3d" title="${esc(NO3D)}"`}><td><span class="sysx-ref">${esc(label(r))}</span></td>
          <td class="mono">${esc(r.pn || '—')}</td><td class="q">${esc(r.qty ?? '')}</td>
          <td>${esc(r.desc || '')}${sub ? ` <span class="sysx-sub">${icon('droite', { size: 12 })}${esc(badge(sub.sheet))}</span>` : ''}</td></tr>`;
      }).join('');
      const none = a.parts.length - n3d;
      const legend = !none ? '' : n3d
        ? `<p class="sysx-legend"><span class="sysx-no3d-key" aria-hidden="true"></span>${none} ligne${none > 1 ? 's' : ''} en gris : pièce${none > 1 ? 's' : ''} non dessinée${none > 1 ? 's' : ''} à part en 3D ; leur fiche s’ouvre, le sous-ensemble reste mis en évidence.</p>`
        : `<p class="sysx-legend">Le sous-ensemble est un seul bloc dans la vue 3D de l’ensemble : ses pièces n’y sont pas dessinées à part. Une ligne ouvre sa fiche (et « Voir sur le dessin ») ; le sous-ensemble reste mis en évidence.</p>`;
      return `<div class="sysx-panel" style="--sys:${sys?.color || 'var(--accent)'}">
        <p class="sysx-pmeta"><span class="mono">${esc(badge(a.sheet))}</span> · ${a.parts.length} ligne${a.parts.length > 1 ? 's' : ''} · isolé dans « ${esc(eq.assemblies.get(st.from).titleFr)} »</p>
        <div class="sysx-pbtns">
          <button type="button" class="btn" data-go="${esc(st.target)}">${icon('liste', { size: 15 })}Ouvrir l’assemblage</button>
          <button type="button" class="btn" data-page="${esc(a.sheet)}">${icon('page', { size: 15 })}Page du ${eq.docWord}</button>
          <button type="button" class="btn" data-sysx-act="all">${icon('cube', { size: 15 })}Tout afficher</button>
        </div>
        ${a.note ? `<p class="sysx-note">${esc(a.note)}</p>` : ''}
        ${legend}
        <table class="sysx-rows"><thead><tr><th>Réf.</th><th>N° pièce</th><th class="q">Qté</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    };

    const panelEl = document.createElement('div'); // contenu du panneau (gardé sous la fiche d'une pièce)
    const showIsolated = (st) => {
      if (!ctx.viewer.objects([st.path]).length) {
        // Pas trouvé en 3D : les dessins de l'assemblage, à la place de l'entrée de l'ensemble (Retour revient d'où l'on vient).
        iso = null;
        history.replaceState(history.state, '', ctx.hashFor(st.target));
        ctx.go(st.target);
        return;
      }
      iso = st;
      const a = ctx.equipment.assemblies.get(st.target);
      // Sous-ensemble sélectionné (fil d'Ariane), puis sa liste dans le panneau, qui remplace sa fiche.
      ctx.viewer.select(st.path);
      panelEl.innerHTML = panelHtml(st);
      keyRows(panelEl.querySelector('tbody'), 'tr[data-sysx-ref]', (tr) => tr.click());
      ctx.ui.sidePanel.open({ owner: OWNER, title: a.titleFr, icon: ctx.systemOf(st.target)?.icon || 'cle', content: panelEl });
      // Cadrage dans la partie de la scène que le panneau ne couvre pas (marges du socle).
      ctx.viewer.isolate([st.path], { frame: true });
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

    /** Vrai si la vue affichée est l'ensemble où le sous-ensemble est isolé. */
    const isoShown = () => !!iso && ctx.view?.type === 'assembly' && ctx.view.id === iso.from;
    const endIso = () => {
      iso = null;
      ctx.ui.sidePanel.release(OWNER);
    };

    // Panneau : une ligne sélectionne la pièce dans la vue (chemin depuis l'ensemble affiché).
    panelEl.addEventListener('click', (e) => {
      if (!isoShown()) return;
      if (e.target.closest('[data-sysx-act="all"]')) { ctx.viewer.clear(); ctx.viewer.frame(); return; }
      const tr = e.target.closest('tr[data-sysx-ref]');
      if (!tr) return;
      ctx.viewer.select([...iso.path, tr.dataset.sysxRef]);
      // Pièce sans objet 3D propre : sa fiche s'ouvre, le sous-ensemble isolé reste en évidence (rien n'est sélectionné en 3D).
      if (tr.classList.contains('sysx-no3d')) ctx.viewer.isolate([iso.path]);
    });

    ctx.on('assembly', ({ id }) => {
      if (pending && pending.from === id) {
        const st = pending;
        pending = null;
        showIsolated(st);
        return;
      }
      pending = null;
      if (iso && iso.from !== id) endIso();
    });
    // Autre vue (schéma, contrôle des listes, autre assemblage) : fin de l'isolement, le panneau se ferme.
    ctx.on('view', ({ type, id }) => {
      if (iso && (type !== 'assembly' || id !== iso.from)) endIso();
    });
    ctx.on('equipment', () => {
      pending = null;
      iso = null;
    });
    // Panneau replié ou pris par un autre mode : fin de l'isolement (pièces de nouveau toutes visibles).
    // La vue de l'ensemble est recadrée : le modèle reprend la place du panneau (comme à la sortie des autres modes).
    ctx.on('sidepanel', ({ open, owner }) => {
      if (open || owner !== OWNER) return;
      if (iso && ctx.view?.type === 'assembly' && ctx.view.id === iso.from) {
        ctx.viewer.clear();
        if (ctx.selection) ctx.viewer.select(null); // sous-ensemble (ou pièce) sélectionné pour le fil d'Ariane
        ctx.viewer.frame();
      }
      iso = null;
    });
    ctx.on('select', ({ path }) => {
      if (!iso || !ctx.ui.sidePanel.has(OWNER)) return;
      // Ligne du panneau correspondant à la pièce sélectionnée (sous le sous-ensemble isolé), même sous la fiche.
      const inside = path && iso.path.every((r, i) => path[i] === r) && path.length > iso.path.length ? path[iso.path.length] : null;
      panelEl.querySelectorAll('tr.on').forEach((tr) => tr.classList.remove('on'));
      if (inside) panelEl.querySelector(`tr[data-sysx-ref="${CSS.escape(inside)}"]`)?.classList.add('on');
    });

    // ------------------------------------------------------------ fil d'Ariane
    const stage = ctx.ui.stage;
    const nav = document.createElement('nav');
    nav.className = 'sysx-crumbs';
    nav.setAttribute('aria-label', 'Fil d’Ariane');
    nav.hidden = true;
    const menu = document.createElement('div');
    menu.className = 'sysx-cmenu';
    menu.hidden = true;
    stage.prepend(nav);
    stage.appendChild(menu);

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
            if (!folded) { parts.push(`<button type="button" class="sysx-c more" data-more="1" title="Niveaux masqués" aria-label="Niveaux masqués" aria-haspopup="true" aria-expanded="false">…</button>`); folded = true; }
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
        // Seul l'isolement de ce module est effacé : les marques d'un autre mode (entretien, procédure) restent.
        ctx.viewer.select(null);
        if (iso && ctx.ui.sidePanel.has(OWNER)) { ctx.viewer.clear(); ctx.ui.sidePanel.release(OWNER); }
        ctx.viewer.frame();
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
        b.setAttribute('aria-expanded', String(!menu.hidden));
        return;
      }
      const l = current[Number(b.dataset.i)];
      if (l && !l.cur) run(l.act);
      else if (l?.cur && l.act.startsWith('sel')) ctx.viewer.frame([l.act.slice(4).split('>')]); // « sel:… » : recadrer la pièce (un seul chemin)
    });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      menu.hidden = true;
      run(current[Number(b.dataset.i)].act);
    });
    document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && !nav.contains(e.target)) menu.hidden = true; });
    // Échap : le menu des niveaux masqués d'abord (couche au-dessus des autres).
    ctx.ui.onEscape(() => { if (menu.hidden) return false; menu.hidden = true; return true; }, 110);

    let raf = 0;
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    for (const t of ['view', 'assembly', 'select', 'equipment']) ctx.on(t, later);
    ctx.on('route', ({ token }) => { if (token === 'catalogue') { nav.hidden = true; menu.hidden = true; } else later(); });
    let lastW = 0;
    new ResizeObserver(() => { if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; later(); } }).observe(stage);
  },
};
