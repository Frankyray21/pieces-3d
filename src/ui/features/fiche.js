// Fiche de la pièce sélectionnée, dans le panneau latéral (seule fiche du site) :
// numéro (un par taille), description, quantités, repère, assemblage parent,
// groupes, actions de la vue 3D (éclater le groupe, coupe, centrer), notes et
// lignes à vérifier, données techniques du manuel d'un sous-ensemble (relevées
// dans donnees.json, avec leur page : aucune cote n'est mesurée sur la 3D),
// autres listes qui portent le même numéro et vignette de la page du manuel. « Voir sur le dessin » ouvre
// la page du manuel avec la bulle de la pièce entourée d'un cercle animé
// (positions : public/equipment/<id>/bulles.json, produit par
// tools/extract_bulles.py ; sans position connue, la page s'ouvre simplement).
//
// La fiche se pose par-dessus le panneau d'un mode (circuits, entretien,
// procédure, sous-ensemble isolé : sidePanel.open({ over: true })) : le mode
// reste actif, et revient quand la fiche se ferme (×, « ‹ », Échap).
import { normPn, sizeGroups } from '../../data/equipment.js';
import './fiche.css';

const OWNER = 'fiche';

// ------------------------------------------------------------------ module

export default {
  id: OWNER,
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    let current = null; // dernier détail de « select » affiché
    let box = null; // contenu de la fiche affichée

    const eq = () => ctx.equipment;
    const sheetLabel = (s) => (eq().docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s);
    const refLabel = (r) => r.label ?? String(r.ref).replace(/#\d+$/, '');
    /** Assemblage ou document qui contient la ligne. */
    const ownerOf = (row) => {
      const e = eq();
      return row.source.type === 'assembly' ? e.assemblies.get(row.source.id) : e.documents.get(row.source.id);
    };
    /** Pages du manuel où chercher la bulle : dessin de l'assemblage d'abord (pour un schéma, ses dessins avant sa liste). */
    const sheetsOf = (row) => {
      const o = ownerOf(row);
      const pages = row.source.type === 'document'
        ? [...(o?.sheets || []), row.source.sheet]
        : [row.source.sheet, ...(o?.sheets || []), ...(o?.lists || [])];
      return [...new Set(pages.filter(Boolean))];
    };
    /**
     * Données techniques du manuel d'un sous-ensemble (donnees.json) : tableaux
     * dont toutes les valeurs viennent de ses pages. Retourne { tables, group }.
     */
    const manualData = (asmId) => {
      const don = ctx.equipmentData('donnees');
      if (!don || !asmId) return null;
      const tables = [];
      let group = null;
      for (const g of don.groupes || []) {
        if (g.asm === asmId) group = g;
        for (const t of g.tableaux || []) {
          const pages = t.lignes.map((l) => l.p).filter(Boolean);
          if (pages.length && pages.every((pg) => ctx.sheetOwner(pg) === asmId)) tables.push(t);
        }
      }
      return tables.length || group ? { tables, group } : null;
    };
    /** Page et positions de la bulle de la ligne : { sheet, boxes } (boxes vide si inconnue). */
    const locate = (row) => {
      const pages = ctx.equipmentData('bulles')?.pages ?? null;
      const sheets = sheetsOf(row);
      const keys = (row.pns?.length ? row.pns : [row.pn]).map(normPn).filter(Boolean);
      if (pages) {
        for (const s of sheets) {
          const boxes = keys.flatMap((k) => pages[s]?.[k] || []);
          if (boxes.length) return { sheet: s, boxes };
        }
      }
      return { sheet: sheets[0], boxes: [] };
    };

    // ---------------------------------------------------------------- actions de la vue 3D
    const actionsHtml = (d) => {
      const { row, path } = d;
      const e = eq();
      const v = ctx.viewer;
      const btns = [];
      if (v.is3d && v.isGroup(path)) {
        btns.push(`<button type="button" class="btn primary" data-fiche-act="group">${v.isGroupOpen(path) ? 'Rassembler ce groupe' : 'Éclater ce groupe'}</button>`);
      }
      if (v.is3d && v.canCut(path)) {
        btns.push(`<button type="button" class="btn" data-fiche-act="cut">${v.isCut() ? 'Quitter la coupe' : 'Voir en coupe'}</button>`);
      }
      if (v.is3d && v.objects([path]).length) btns.push('<button type="button" class="btn" data-fiche-act="center">Centrer</button>');
      for (const s of row.see || []) btns.push(`<button type="button" class="btn" data-page="${esc(s)}">Voir ${esc(e.docWord === 'catalogue' ? sheetLabel(s) : s)}</button>`);
      return btns.length ? `<div class="fiche-actions">${btns.join('')}</div>` : '<div class="fiche-actions" hidden></div>';
    };

    // ---------------------------------------------------------------- contenu de la fiche
    const render = (d) => {
      const e = eq();
      const { row, path } = d;
      const own = ownerOf(row);
      const el = document.createElement('div');
      el.className = 'fiche';
      const desc = row.descFr || row.fr || null;
      const sub = row.link ? e.assemblies.get(row.link) || e.documents.get(row.link) : null;
      const qtyTxt = row.qty != null ? `${row.qty}${row.uom ? ` ${esc(row.uom)}` : ''}` : 'non indiquée';
      const q3d = row.qty3d != null && row.qty3d !== row.qty
        ? `<span class="fiche-sub">${row.qty3d} dessinée${row.qty3d > 1 ? 's' : ''} (posée${row.qty3d > 1 ? 's' : ''} en 3D)</span>` : '';
      // Numéros : un par taille (regroupés), sinon le numéro ou le texte du catalogue.
      const sizes = row.sizes ? sizeGroups(row) : null;
      const pnHtml = sizes?.length
        ? `<div class="fiche-sizes">${sizes.map(([v, ss]) => `<div><span class="fiche-sz">${esc(ss.join(' · '))}</span><span class="mono">${esc(v === '-' ? '—' : v)}</span></div>`).join('')}</div>`
        : `<div class="fiche-pn mono">${esc(row.pnText || row.pn || (row.nss ? 'Non vendu séparément' : '—'))}</div>`;
      // Groupes depuis l'assemblage affiché : chaque maillon sélectionne le groupe dans la vue.
      const asm = ctx.assembly;
      const groupes = path.length > 1 && asm ? path.slice(0, -1).map((_, i) => {
        let a = asm, r = null;
        for (const ref of path.slice(0, i + 1)) {
          r = a?.parts.find((p) => p.ref === ref);
          a = r?.link ? e.assemblies.get(r.link) : null;
        }
        return r ? `<button type="button" class="chip" data-fiche-sel="${esc(path.slice(0, i + 1).join('>'))}" title="Sélectionner ce groupe">${esc(r.link || refLabel(r))} · ${esc(e.assemblies.get(r.link)?.titleFr || r.desc)}</button>` : '';
      }).filter(Boolean).join(' › ') : '';
      const ids = [row.supplier && `Fournisseur <span class="mono">${esc(row.supplier)}</span>`, row.sandvik && row.sandvik !== 'N/A' && `Sandvik <span class="mono">${esc(row.sandvik)}</span>`].filter(Boolean).join(' · ');
      // Remarques et lignes à vérifier (avec les lignes en cause, cliquables).
      const rowChip = (o, extra = '') => `<button type="button" class="chip" data-fiche-row="${esc(o.key)}">${esc(sheetLabel(o.source.sheet))} réf. ${esc(refLabel(o))}${extra}</button>`;
      const flags = (row.flags || []).filter((f) => f.level !== 'info' || f.text !== row.note);
      const notes = [
        row.note ? `<p class="fiche-note info">${esc(row.note)}</p>` : '',
        row.mirrorOf ? `<p class="fiche-note info">Pièce symétrique (côté gauche) : la 3D met en évidence la pièce droite, réf. ${esc(row.mirrorOf)}.</p>` : '',
        ...flags.map((f) => `<div class="fiche-note ${esc(f.level)}">${esc(f.text)}${f.refs?.length ? `<span class="fiche-chips">${f.refs.map((o) => rowChip(o, ` · ${esc(o.desc)}`)).join('')}</span>` : ''}</div>`),
      ].filter(Boolean);
      // Autres listes qui portent le même numéro (une ligne par liste ; un clic l'ouvre, la ligne sélectionnée).
      const flagged = new Set(flags.flatMap((f) => (f.refs || []).map((o) => o.key)));
      const seen = new Set([row.source.id]);
      const autres = (row.usedIn || []).filter((o) => !flagged.has(o.key) && !seen.has(o.source.id) && seen.add(o.source.id));
      const autresHtml = autres.map((o) => {
        const t = o.source.type === 'assembly' ? e.assemblies.get(o.source.id)?.titleFr : e.documents.get(o.source.id)?.titleFr;
        return `<li><button type="button" class="fiche-link" data-fiche-row="${esc(o.key)}"><span class="mono">${esc(sheetLabel(o.source.sheet))}</span> ${esc(t || o.source.id)}<span class="fiche-sub">réf. ${esc(refLabel(o))} · qté ${o.qty ?? '—'}</span></button></li>`;
      }).join('');
      // Données du manuel du sous-ensemble (valeurs relevées avec leur page ; rien n'est mesuré sur la 3D).
      const md = sub && row.link && e.assemblies.has(row.link) ? manualData(row.link) : null;
      const MAXL = 12;
      const mdLines = md ? md.tables.flatMap((t) => t.lignes.map((l) => ({ t, l }))) : [];
      const mdVal = (l) => {
        const conv = (u) => (l.conv === u ? ' <small class="fiche-sub fiche-conv" title="Valeur convertie : le manuel ne donne que l’autre unité">conv.</small>' : '');
        if (l.m || l.i) return [l.m && `${esc(l.m)}${conv('m')}`, l.i && `${esc(l.i)}${conv('i')}`].filter(Boolean).join(' · ');
        return esc(l.v ?? '—');
      };
      const dims = md ? `
        <section class="fiche-sec">
          <h4>Données du ${e.docWord}</h4>
          ${mdLines.length ? `<table class="fiche-dims"><tbody>
            ${mdLines.slice(0, MAXL).map(({ l }) => `<tr><th>${esc(l.l)}</th><td>${mdVal(l)}</td><td>${l.p ? `<button type="button" class="chip" data-page="${esc(l.p)}" title="Ouvrir la page ${esc(l.p)}">${esc(l.p)}</button>` : ''}</td></tr>`).join('')}
          </tbody></table>` : ''}
          <p class="fiche-sub">${mdLines.length > MAXL ? `${mdLines.length - MAXL} autres valeurs dans les ` : 'Voir aussi les '}<button type="button" class="fiche-link" data-go="donnees">données techniques${md.group ? ` (${esc(md.group.titre)})` : ''}</button>.</p>
        </section>` : '';
      const sheet = sheetsOf(row)[0];
      const url = sheet ? ctx.pageUrl(sheet) : null;
      const pageSec = !sheet ? '' : url ? `<section class="fiche-sec">
          <h4>Page du ${e.docWord}</h4>
          <button type="button" class="fiche-thumb" data-fiche-draw title="Voir la pièce sur le dessin">
            <img src="${esc(url)}" alt="Page ${esc(sheet)} du ${e.docWord}" loading="lazy">
            <span class="fiche-thumb-cap"><span class="mono">${esc(sheetLabel(sheet))}</span> ${esc(ctx.sheetTitle(sheet))}</span>
          </button>
          <button type="button" class="btn primary fiche-draw" data-fiche-draw>${icon('page', { size: 16 })}<span>${locate(row).boxes.length ? 'Voir sur le dessin' : 'Ouvrir la page'}</span></button>
        </section>` : `<section class="fiche-sec">
          <h4>Page du ${e.docWord}</h4>
          <p class="fiche-sub">La page ${esc(sheetLabel(sheet))} (${esc(ctx.sheetTitle(sheet))}) n'est pas incluse dans cette version du site.</p>
          <button type="button" class="btn fiche-draw" data-page="${esc(sheet)}">${icon('page', { size: 16 })}<span>Ouvrir la page</span></button>
        </section>`;
      el.innerHTML = `
        <div class="fiche-head">
          <span class="fiche-ref" title="Repère">${esc(refLabel(row))}</span>
          <div class="fiche-id">
            ${pnHtml}
            <div class="fiche-desc">${esc(row.desc)}</div>
            ${desc ? `<div class="fiche-fr">${esc(desc)}</div>` : ''}
            ${sub?.titleFr && sub.titleFr !== row.desc ? `<div class="fiche-fr">${esc(sub.titleFr)}</div>` : ''}
          </div>
        </div>
        <dl class="fiche-grid">
          <dt>Quantité</dt><dd>${qtyTxt}${q3d}</dd>
          <dt>Repère</dt><dd>${esc(refLabel(row))}${path.length > 1 ? `<span class="fiche-sub">dans le groupe ${esc(path.slice(0, -1).map((p) => p.replace(/#\d+$/, '')).join(' › '))}</span>` : ''}</dd>
          <dt>${row.source.type === 'document' ? 'Schéma / liste' : 'Assemblage'}</dt><dd><button type="button" class="fiche-link" data-go="${esc(row.source.id)}"><span class="mono">${esc(sheetLabel(row.source.sheet))}</span> ${esc(own?.titleFr || row.source.id)}</button></dd>
          ${sub ? `<dt>Sous-ensemble</dt><dd><button type="button" class="fiche-link" data-go="${esc(row.link)}">Ouvrir ${esc(sheetLabel(sub.sheet || sub.sheets?.[0] || row.link))} ›</button></dd>` : ''}
          ${ids ? `<dt>Autres n°</dt><dd>${ids}</dd>` : ''}
        </dl>
        ${groupes ? `<div class="fiche-trail">Dans ${groupes}</div>` : ''}
        ${actionsHtml(d)}
        ${notes.length ? `<section class="fiche-sec"><h4>Notes</h4>${notes.join('')}</section>` : ''}
        ${dims}
        ${autres.length ? `<section class="fiche-sec"><h4>Aussi listé dans ${autres.length} autre${autres.length > 1 ? 's' : ''} liste${autres.length > 1 ? 's' : ''}</h4><ul class="fiche-list">${autresHtml}</ul></section>` : ''}
        ${pageSec}`;
      el.querySelector('.fiche-thumb img')?.addEventListener('error', (ev) => ev.target.closest('.fiche-thumb')?.remove());
      el.addEventListener('click', (ev) => {
        const t = ev.target.closest('[data-fiche-draw], [data-fiche-act], [data-fiche-sel], [data-fiche-row]');
        if (!t) return;
        if (t.hasAttribute('data-fiche-draw')) showDrawing(row);
        else if (t.dataset.ficheSel) ctx.viewer.select(t.dataset.ficheSel);
        else if (t.dataset.ficheRow) ctx.openRow(t.dataset.ficheRow);
        else if (t.dataset.ficheAct === 'group') ctx.viewer.toggleGroup(path);
        else if (t.dataset.ficheAct === 'cut') ctx.viewer.cut(ctx.viewer.isCut() ? null : path);
        else if (t.dataset.ficheAct === 'center') ctx.viewer.frame([path]); // chemin enveloppé : une seule pièce
      });
      return el;
    };

    const open = (d) => {
      current = d;
      box = render(d);
      ctx.ui.sidePanel.open({ owner: OWNER, title: 'Fiche de la pièce', icon: 'cle', content: box, over: true });
      ctx.ui.sidePanel.body.scrollTop = 0;
    };
    const close = () => {
      current = null;
      box = null;
      if (ctx.ui.sidePanel.owner === OWNER) ctx.ui.sidePanel.close();
    };

    ctx.on('select', (d) => {
      if (!d?.row || !ctx.equipment) { close(); return; }
      open(d);
    });
    // Groupe éclaté ou rassemblé, coupe : les boutons de la fiche suivent.
    ctx.on('view-state', () => {
      const old = current && box?.querySelector('.fiche-actions');
      if (!old) return;
      const t = document.createElement('template');
      t.innerHTML = actionsHtml(current).trim();
      old.replaceWith(t.content);
    });
    ctx.on('equipment', close);
    // Autre vue (assemblage, schéma, contrôle des listes) : la fiche se ferme si plus rien n'est
    // sélectionné ; même assemblage réaffiché (retour d'une page plein écran) : elle reste.
    const closeIfNone = () => { if (current && !ctx.selection) close(); };
    ctx.on('assembly', closeIfNone);
    ctx.on('view', closeIfNone);
    ctx.on('sidepanel', ({ open: o, owner }) => { if (!o && owner === OWNER) { current = null; box = null; } });

    // ---------------------------------------------------------------- « Voir sur le dessin »
    function showDrawing(row) {
      const { sheet, boxes } = locate(row);
      if (!sheet) return;
      if (!boxes.length || !ctx.pageUrl(sheet)) { ctx.openPage(sheet); return; }
      const e = eq();
      const el = document.createElement('div');
      el.className = 'fiche-dw';
      el.innerHTML = `
        <div class="fiche-dw-bar">
          <span class="fiche-dw-pn mono">${esc(row.pn)}</span>
          <span class="fiche-dw-t">${esc(row.desc)} · <span class="mono">${esc(sheetLabel(sheet))}</span> ${esc(ctx.sheetTitle(sheet))}</span>
          ${boxes.length > 1 ? `<button type="button" class="btn" data-act="next">Bulle <b>1</b>/${boxes.length} ›</button>` : ''}
          <button type="button" class="btn" data-act="zoom">Page entière</button>
          <button type="button" class="btn" data-act="page" title="Ouvrir dans la visionneuse des pages">Visionneuse</button>
        </div>
        <div class="fiche-dw-view"><div class="fiche-dw-sheet">
          <img src="${esc(ctx.pageUrl(sheet))}" alt="Page ${esc(sheet)} du ${e.docWord}">
          ${boxes.map(([x, y, w, h], i) => `<span class="fiche-ring" data-i="${i}" style="left:${(x + w / 2) * 100}%;top:${(y + h / 2) * 100}%;--rw:${w * 100}%"></span>`).join('')}
        </div></div>
        <p class="fiche-sub fiche-dw-foot">Bulle repérée d'après le texte du ${e.docWord} (${esc(sheetLabel(sheet))}).</p>`;
      const view = el.querySelector('.fiche-dw-view');
      const pageEl = el.querySelector('.fiche-dw-sheet');
      const img = pageEl.querySelector('img');
      let idx = 0;
      let zoomed = true;
      const layout = () => {
        if (!img.naturalWidth) return;
        // Hauteur de la vue : celle de l'écran (moins l'en-tête), ou la page entière si elle est plus basse.
        const vw = view.clientWidth, maxH = Math.max(240, window.innerHeight - (ctx.narrow() ? 280 : 220));
        const ratio = img.naturalWidth / img.naturalHeight;
        const fitW = Math.min(vw, maxH * ratio);
        // Zoom : le texte de la bulle fait environ 120 px de large (au plus 1,2 × la taille de l'image).
        const width = zoomed ? Math.max(fitW, Math.min(120 / boxes[idx][2], img.naturalWidth * 1.2)) : fitW;
        const H = width / ratio;
        const vh = zoomed ? maxH : Math.min(maxH, Math.max(240, H + 2));
        pageEl.style.width = `${width}px`;
        view.style.height = `${vh}px`;
        const [x, y, w, h] = boxes[idx];
        view.scrollTo({ left: (x + w / 2) * width - vw / 2, top: (y + h / 2) * H - vh / 2, behavior: 'instant' });
        el.querySelectorAll('.fiche-ring').forEach((r) => r.classList.toggle('on', Number(r.dataset.i) === idx));
        const zb = el.querySelector('[data-act="zoom"]');
        if (zb) zb.textContent = zoomed ? 'Page entière' : 'Zoom sur la bulle';
      };
      img.addEventListener('load', layout);
      img.addEventListener('error', () => { view.innerHTML = `<p class="fiche-sub" style="padding:16px">Page ${esc(sheet)} non incluse dans cette version du site.</p>`; });
      let lastW = 0;
      const ro = new ResizeObserver(() => { if (view.clientWidth !== lastW) { lastW = view.clientWidth; layout(); } });
      el.querySelector('[data-act="zoom"]').addEventListener('click', () => { zoomed = !zoomed; layout(); });
      el.querySelector('[data-act="next"]')?.addEventListener('click', (ev) => {
        idx = (idx + 1) % boxes.length;
        ev.currentTarget.querySelector('b').textContent = String(idx + 1);
        zoomed = true;
        layout();
      });
      // Page plein écran non liée à l'adresse : Retour ou Échap la ferme, la fiche et la sélection restent.
      const page = ctx.ui.showPage(`Sur le dessin : réf. ${refLabel(row)}`, el, { icon: 'page', onClose: () => ro.disconnect() });
      el.querySelector('[data-act="page"]').addEventListener('click', () => { page.close(); ctx.openPage(sheet); });
      ro.observe(view);
      if (img.complete) layout();
    }
  },
};
