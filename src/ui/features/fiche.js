// Fiche de la pièce sélectionnée, dans le panneau latéral : numéro, description,
// quantités, repère, assemblage parent, notes, cotes mesurées sur la 3D, autres
// assemblages qui listent le même numéro et vignette de la page du manuel.
// « Voir sur le dessin » ouvre la page du manuel avec la bulle de la pièce
// entourée d'un cercle animé (positions : public/equipment/<id>/bulles.json,
// produit par tools/extract_bulles.py ; sans position connue, la page s'ouvre
// simplement).
import { Box3, Matrix4, Quaternion, Vector3 } from 'three';
import './fiche.css';

const OWNER = 'fiche';
// Équipements dont les positions des bulles sont connues (évite une requête vaine ailleurs).
const BULLES = new Set(['stm-1500']);

/** Comme normPn (src/data/equipment.js). */
const normPn = (pn) => String(pn || '').toUpperCase().replace(/^\*/, '').replace(/\s/g, '');

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
    const bulles = new Map(); // id d'équipement → Promise<pages | null>
    let current = null; // dernier détail de « select » affiché
    let drawing = null; // page « Voir sur le dessin » ouverte : { close }

    const loadBulles = (eqId) => {
      if (!BULLES.has(eqId)) return Promise.resolve(null);
      if (!bulles.has(eqId)) {
        bulles.set(eqId, fetch(`equipment/${eqId}/bulles.json`)
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => j?.pages ?? null)
          .catch(() => null));
      }
      return bulles.get(eqId);
    };

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
    const locate = async (row) => {
      const pages = await loadBulles(eq().id);
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

    // ---------------------------------------------------------------- contenu de la fiche
    const render = (d) => {
      const e = eq();
      const { row, path } = d;
      const own = ownerOf(row);
      const box = document.createElement('div');
      box.className = 'fiche';
      const desc = row.descFr || row.fr || null;
      const sub = row.link ? e.assemblies.get(row.link) || e.documents.get(row.link) : null;
      const qtyTxt = row.qty != null ? `${row.qty}${row.uom ? ` ${esc(row.uom)}` : ''}` : 'non indiquée';
      const q3d = row.qty3d != null && row.qty3d !== row.qty
        ? `<span class="fiche-sub">${row.qty3d} posée${row.qty3d > 1 ? 's' : ''} en 3D</span>` : '';
      // Fil des groupes, depuis l'assemblage affiché.
      const asm = ctx.assembly;
      const groupes = path.length > 1 && asm ? path.slice(0, -1).map((_, i) => {
        let a = asm, r = null;
        for (const ref of path.slice(0, i + 1)) {
          r = a?.parts.find((p) => p.ref === ref);
          a = r?.link ? e.assemblies.get(r.link) : null;
        }
        return r?.link ? `<button type="button" class="chip" data-go="${esc(r.link)}">${esc(r.link)} · ${esc(e.assemblies.get(r.link)?.titleFr || r.desc)}</button>` : '';
      }).filter(Boolean).join(' › ') : '';
      const ids = [row.supplier && `Fournisseur <span class="mono">${esc(row.supplier)}</span>`, row.sandvik && row.sandvik !== 'N/A' && `Sandvik <span class="mono">${esc(row.sandvik)}</span>`].filter(Boolean).join(' · ');
      const notes = [row.note, ...(row.flags || []).filter((f) => f.level !== 'info' && f.text !== row.note).map((f) => f.text)].filter(Boolean);
      // Autres assemblages qui listent le même numéro (un lien par liste).
      const seen = new Set([row.source.id]);
      const autres = (row.usedIn || []).filter((o) => !seen.has(o.source.id) && seen.add(o.source.id));
      const autresHtml = autres.map((o) => {
        const t = o.source.type === 'assembly' ? e.assemblies.get(o.source.id)?.titleFr : e.documents.get(o.source.id)?.titleFr;
        return `<li><button type="button" class="fiche-link" data-go="${esc(o.source.id)}"><span class="mono">${esc(sheetLabel(o.source.sheet))}</span> ${esc(t || o.source.id)}<span class="fiche-sub">réf. ${esc(refLabel(o))} · qté ${o.qty ?? '—'}</span></button></li>`;
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
      box.innerHTML = `
        <div class="fiche-head">
          <span class="fiche-ref" title="Repère">${esc(refLabel(row))}</span>
          <div class="fiche-id">
            <div class="fiche-pn mono">${esc(row.pnText || row.pn || '—')}</div>
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
        ${notes.length ? `<section class="fiche-sec"><h4>Notes</h4>${notes.map((n) => `<p class="fiche-note">${esc(n)}</p>`).join('')}</section>` : ''}
        ${dims}
        ${autres.length ? `<section class="fiche-sec"><h4>Aussi listé dans ${autres.length} autre${autres.length > 1 ? 's' : ''} liste${autres.length > 1 ? 's' : ''}</h4><ul class="fiche-list">${autresHtml}</ul></section>` : ''}
        ${url ? `<section class="fiche-sec">
          <h4>Page du ${e.docWord}</h4>
          <button type="button" class="fiche-thumb" data-fiche-draw title="Voir la pièce sur le dessin">
            <img src="${esc(url)}" alt="Page ${esc(sheet)} du ${e.docWord}" loading="lazy">
            <span class="fiche-thumb-cap"><span class="mono">${esc(sheetLabel(sheet))}</span> ${esc(ctx.sheetTitle(sheet))}</span>
          </button>
          <button type="button" class="btn primary fiche-draw" data-fiche-draw>${icon('page', { size: 16 })}<span>Voir sur le dessin</span></button>
        </section>` : ''}`;
      box.querySelector('.fiche-thumb img')?.addEventListener('error', (ev) => ev.target.closest('.fiche-thumb')?.remove());
      box.querySelectorAll('[data-fiche-draw]').forEach((b) => b.addEventListener('click', () => showDrawing(row)));
      // Bouton actif seulement si une bulle est connue (sinon libellé « Ouvrir la page »).
      locate(row).then(({ boxes }) => {
        if (current?.row !== row) return;
        const lbl = box.querySelector('.fiche-draw span');
        if (lbl && !boxes.length) lbl.textContent = 'Ouvrir la page';
      });
      return box;
    };

    const open = (d) => {
      current = d;
      ctx.ui.sidePanel.open({ owner: OWNER, title: 'Fiche de la pièce', icon: 'cle', content: render(d) });
      ctx.ui.sidePanel.body.scrollTop = 0;
    };
    const close = () => {
      current = null;
      if (ctx.ui.sidePanel.owner === OWNER) ctx.ui.sidePanel.close();
    };

    ctx.on('select', (d) => {
      if (!d?.row || !ctx.equipment) { close(); return; }
      open(d);
    });
    ctx.on('equipment', close);
    ctx.on('assembly', close);
    ctx.on('sidepanel', ({ open: o, owner }) => { if (!o && owner === OWNER) current = null; });
    // Échap : la page du dessin d'abord (sans toucher à la sélection), sinon la fiche.
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (drawing) {
        e.stopImmediatePropagation();
        e.preventDefault();
        drawing.close();
      } else if (ctx.ui.sidePanel.owner === OWNER && ctx.ui.sidePanel.isOpen
        && !document.body.classList.contains('page-open') && document.getElementById('modal')?.hidden !== false) {
        // (Échap ferme d'abord la page plein écran ou la visionneuse des pages.)
        close();
      }
    }, true);

    // ---------------------------------------------------------------- « Voir sur le dessin »
    async function showDrawing(row) {
      const { sheet, boxes } = await locate(row);
      if (!sheet) return;
      if (!boxes.length) { ctx.openPage(sheet); return; }
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
      img.addEventListener('error', () => { view.innerHTML = `<p class="fiche-sub" style="padding:16px">Page ${esc(sheet)} non publiée dans cette version.</p>`; });
      let lastW = 0;
      const ro = new ResizeObserver(() => { if (view.clientWidth !== lastW) { lastW = view.clientWidth; layout(); } });
      el.querySelector('[data-act="zoom"]').addEventListener('click', () => { zoomed = !zoomed; layout(); });
      el.querySelector('[data-act="next"]')?.addEventListener('click', (ev) => {
        idx = (idx + 1) % boxes.length;
        ev.currentTarget.querySelector('b').textContent = String(idx + 1);
        zoomed = true;
        layout();
      });
      el.querySelector('[data-act="page"]').addEventListener('click', () => { drawing?.close(); ctx.openPage(sheet); });
      const page = ctx.ui.showPage(`Sur le dessin : réf. ${refLabel(row)}`, el, {
        icon: 'page',
        onClose: () => { ro.disconnect(); drawing = null; },
      });
      drawing = page;
      ro.observe(view);
      if (img.complete) layout();
    }
  },
};
