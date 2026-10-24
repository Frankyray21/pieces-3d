// Fiche de la pièce sélectionnée, dans le panneau latéral (seule fiche du site) :
// numéro (un par taille), description, quantités, repère, assemblage parent,
// groupes, actions de la vue 3D (éclater le groupe, coupe, centrer), notes et
// lignes à vérifier, cotes mesurées sur la 3D, autres listes qui portent le
// même numéro et vignette de la page du manuel. « Voir sur le dessin » ouvre
// la page du manuel avec la bulle de la pièce entourée d'un cercle animé
// (positions : public/equipment/<id>/bulles.json, produit par
// tools/extract_bulles.py ; sans position connue, la page s'ouvre simplement).
//
// La fiche se pose par-dessus le panneau d'un mode (circuits, entretien,
// procédure, sous-ensemble isolé : sidePanel.open({ over: true })) : le mode
// reste actif, et revient quand la fiche se ferme (×, « ‹ », Échap).
import { Box3, Matrix4, Quaternion, Vector3 } from 'three';
import { normPn, sizeGroups } from '../../data/equipment.js';
import './fiche.css';

const OWNER = 'fiche';


// ------------------------------------------------------------------ cotes mesurées sur la 3D

/** Boîte de l'objet dans son propre repère (rotation de l'objet annulée), en unités du monde (m). */
function localSize(obj) {
  obj.updateWorldMatrix(true, true);
  const pos = new Vector3(), quat = new Quaternion(), scl = new Vector3();
  obj.matrixWorld.decompose(pos, quat, scl);
  const inv = new Matrix4().compose(pos, quat, new Vector3(1, 1, 1)).invert();
  const box = new Box3();
  const corner = new Vector3();
  const m = new Matrix4();
  obj.traverseVisible((o) => {
    const g = o.geometry;
    if (!g || !(o.isMesh || o.isLine || o.isPoints)) return;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    if (!b || b.isEmpty()) return;
    m.multiplyMatrices(inv, o.matrixWorld);
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(m);
      box.expandByPoint(corner);
    }
  });
  return box.isEmpty() ? null : box.getSize(new Vector3());
}

/** Boîte commune de plusieurs objets, axes du monde. */
function worldSize(objs) {
  const box = new Box3();
  for (const o of objs) box.expandByObject(o);
  return box.isEmpty() ? null : box.getSize(new Vector3());
}

/** Cotes de la sélection : { dims: [a, b, c] en mm (décroissant), n, mode }. */
function measure(objects) {
  const objs = (objects || []).filter(Boolean);
  if (!objs.length) return null;
  const sizes = objs.map(localSize).filter(Boolean);
  if (!sizes.length) return null;
  const sorted = (v) => [v.x, v.y, v.z].map((x) => x * 1000).sort((a, b) => b - a);
  const all = sizes.map(sorted);
  const same = all.every((d) => d.every((x, i) => Math.abs(x - all[0][i]) < 1));
  if (same) return { dims: all[0], n: objs.length, mode: objs.length > 1 ? 'chacune' : 'piece' };
  const w = worldSize(objs);
  return w ? { dims: sorted(w), n: objs.length, mode: 'ensemble' } : null;
}

const fmtMm = (x) => `${x < 10 ? x.toFixed(1).replace('.', ',') : Math.round(x).toLocaleString('fr-CA')} mm`;
const fmtIn = (x) => `${(x / 25.4).toFixed(x / 25.4 < 10 ? 2 : 1).replace('.', ',')} po`;

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
    /** Pages du manuel où chercher la bulle : dessin de l'assemblage d'abord. */
    const sheetsOf = (row) => {
      const o = ownerOf(row);
      return [...new Set([row.source.sheet, ...(o?.sheets || []), ...(o?.lists || [])].filter(Boolean))];
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
      if (v.is3d && v.objects(path).length) btns.push('<button type="button" class="btn" data-fiche-act="center">Centrer</button>');
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
      const m = measure(d.objects);
      const dims = m ? `
        <section class="fiche-sec">
          <h4>Cotes mesurées sur la 3D</h4>
          <table class="fiche-dims"><tbody>
            ${m.dims.map((x, i) => `<tr><th>${['Plus grande', 'Moyenne', 'Plus petite'][i]}</th><td class="mono">${fmtMm(x)}</td><td class="mono">${fmtIn(x)}</td></tr>`).join('')}
          </tbody></table>
          <p class="fiche-sub">${m.mode === 'chacune' ? `Chacune des ${m.n} pièces posées. ` : m.mode === 'ensemble' ? `Encombrement des ${m.n} objets, à l'état affiché. ` : ''}${sub ? 'Sous-ensemble entier, à l\'état affiché (éclaté ou non). ' : ''}Boîte englobante du modèle 3D, indicative : les cotes qui font foi sont celles du ${e.docWord}.</p>
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
          <dt>Assemblage</dt><dd><button type="button" class="fiche-link" data-go="${esc(row.source.id)}"><span class="mono">${esc(sheetLabel(row.source.sheet))}</span> ${esc(own?.titleFr || row.source.id)}</button></dd>
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
        else if (t.dataset.ficheAct === 'center') ctx.viewer.frame(path);
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
    ctx.on('assembly', close);
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
