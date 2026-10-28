// Planches du manuel affichées dans la scène (schémas et listes, assemblages sans 3D) :
//
// - bulles cliquables : chaque bulle de repère lue sur la planche
//   (public/equipment/<id>/bulles.json, « reperes ») sélectionne sa pièce, comme
//   un clic dans la liste (fiche dans le panneau latéral) ; la bulle de la pièce
//   sélectionnée est cerclée ;
// - schémas en couleur par circuit (public/equipment/<id>/schemas.json) :
//   composants des schémas hydrauliques et pneumatiques colorés par circuit,
//   sur la planche (bulles) et dans la liste ; étiquettes des schémas
//   électriques colorées par catégorie ; légende (un clic isole un circuit) ;
//   titre relu de chaque planche ; renvois « to / from » cliquables vers
//   l'échelon cité ; sommaire des circuits, planche par planche.
// Tout vient du manuel : bulles et étiquettes lues par OCR (tools/ocr_pages.py),
// circuits déduits des descriptions de la liste (tools/build_atelier.py).
import './planches.css';
import * as THREE from 'three';

const ID = 'planches';
// Couleurs des circuits : conventions des schémas (pression rouge, retour bleu…), distinctes en deutéranopie.
const COLORS = {
  'electricite-puissance': '#d32f2f', 'electricite-commande': '#1e6fd9', 'electricite-capteurs': '#2e7d32', 'electricite-eclairage': '#e09b00',
  'hydraulique-pompe': '#d32f2f', 'hydraulique-forage': '#ef6c00', 'hydraulique-mise': '#8e24aa', 'hydraulique-porteur': '#2e7d32',
  'hydraulique-carrousel': '#795548', 'hydraulique-retour': '#1e6fd9',
  'air-forage': '#3949ab', 'air-eau': '#0097a7', 'air-huile': '#a1661b', 'air-commande': '#2e7d32',
};
const FAMILLE = { electricite: 'Électricité', hydraulique: 'Hydraulique', air: 'Air comprimé et eau' };

export default {
  id: ID,
  order: 80,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const bulles = () => ctx.equipmentData('bulles');
    const schemas = () => ctx.equipmentData('schemas');
    const eq = () => ctx.equipment;
    const label = (s) => (eq().docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s);
    const dv = () => document.getElementById('docview');
    const refOf = (r) => String(r ?? '').replace(/#\d+$/, '');
    let pending = null; // { sheet, rung } : planche à montrer une fois le schéma affiché
    let iso = ''; // circuit isolé

    /** Famille de circuits d'un schéma (électricité, hydraulique, air) ou null. */
    const famOf = (doc) => schemas()?.documents?.[doc] || null;
    const circuitOf = (doc, ref) => schemas()?.composants?.[doc]?.[refOf(ref)] || null;
    const color = (fam, c) => COLORS[`${fam}-${c}`] || 'var(--muted)';
    /** Planche qui porte l'échelon n (le même schéma d'abord). */
    const rungSheet = (n, doc) => {
      const all = Object.entries(schemas()?.planches || {}).filter(([, v]) => v.rungs && n >= v.rungs[0] && n <= v.rungs[1]);
      return (all.find(([, v]) => v.doc === doc) || all[0] || [null])[0];
    };

    /** Calque d'une planche : bulles, étiquettes colorées, renvois. */
    const overlay = (sheet, doc) => {
      const out = [];
      const fam = famOf(doc);
      const pct = (v) => `${(v * 100).toFixed(2)}%`;
      for (const [ref, x, y, w, h] of bulles()?.reperes?.[sheet] || []) {
        const c = circuitOf(doc, ref);
        out.push(`<button type="button" class="pl-hs" data-ref="${esc(ref)}"${c ? ` data-circ="${c}" style="--cc:${color(fam, c)};` : ' style="'}left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}" aria-label="Repère ${esc(ref)}" title="Réf. ${esc(ref)}"></button>`);
      }
      const p = schemas()?.planches?.[sheet];
      for (const [c, x, y, w, h] of p?.marks || []) {
        out.push(`<span class="pl-mk" data-circ="${c}" style="--cc:${color('electricite', c)};left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}"></span>`);
      }
      for (const [n, x, y, w, h] of p?.xrefs || []) {
        const t = rungSheet(n, p.doc);
        if (t) out.push(`<button type="button" class="pl-xr" data-rung="${n}" style="left:${pct(x)};top:${pct(y)};width:${pct(w)};height:${pct(h)}" title="Aller à l'échelon ${n} (${esc(label(t))})" aria-label="Échelon ${n}, page ${esc(label(t))}"></button>`);
      }
      return out.length ? `<div class="pl-ovl">${out.join('')}</div>` : '';
    };

    /** Compte des composants ou des étiquettes par circuit. */
    const counts = (doc, fam) => {
      const n = {};
      if (fam === 'electricite') for (const v of Object.values(schemas()?.planches || {})) { if (v.doc === doc) (v.marks || []).forEach((m) => { n[m[0]] = (n[m[0]] || 0) + 1; }); }
      else for (const c of Object.values(schemas()?.composants?.[doc] || {})) n[c] = (n[c] || 0) + 1;
      return n;
    };

    /** Bandeau du schéma : légende des circuits et sommaire des planches. */
    const bar = (doc) => {
      const fam = famOf(doc);
      if (!fam) return '';
      const n = counts(doc, fam);
      const chips = (schemas().circuits?.[fam] || []).filter((c) => n[c.id]).map((c) => `<button type="button" class="pl-chip" data-circ="${c.id}" aria-pressed="false" style="--cc:${color(fam, c.id)}"><i></i>${esc(c.name)} <b>${n[c.id]}</b></button>`).join('');
      const som = Object.entries(schemas().planches || {}).filter(([, v]) => v.doc === doc && v.rungs);
      const what = fam === 'electricite' ? 'étiquettes du schéma' : 'composants de la liste';
      if (!chips && !som.length) return '';
      return `<div class="pl-bar">
        ${chips ? `<div class="pl-legend" role="group" aria-label="Circuits"><span class="pl-lt">${icon(fam === 'electricite' ? 'eclair' : 'goutte', { size: 16 })}${esc(FAMILLE[fam])} — circuits <small>(${what} ; un clic isole un circuit)</small></span>${chips}</div>` : ''}
        ${som.length ? `<details class="pl-som"><summary>Circuit par circuit : ${som.length} planches</summary><ol>${som.map(([s, v]) => `<li><button type="button" data-pl-sheet="${esc(s)}"><span class="mono">${esc(label(s))}</span><span>${esc(v.title || 'Planche sans titre lu')}</span><small>éch. ${v.rungs[0]}–${v.rungs[1]}</small></button></li>`).join('')}</ol></details>` : ''}
      </div>`;
    };

    /** Couleur des lignes de la liste d'un schéma (refaite quand la liste est redessinée). */
    const markRows = () => {
      const v = ctx.view;
      const tb = document.getElementById('rows');
      if (!tb || v?.type !== 'document') return;
      const fam = famOf(v.id);
      tb.querySelectorAll('tr[data-key]').forEach((tr) => {
        const c = circuitOf(v.id, tr.dataset.key);
        tr.classList.toggle('pl-circ', !!c);
        if (c) tr.style.setProperty('--cc', color(fam, c));
        tr.classList.toggle('pl-dim', !!iso && c !== iso);
      });
    };
    let rowsObs = null;
    const watchRows = () => {
      rowsObs?.disconnect();
      const tb = document.getElementById('rows');
      if (!tb) return;
      rowsObs = new MutationObserver(markRows);
      rowsObs.observe(tb, { childList: true });
      markRows();
    };

    const isolate = (c) => {
      iso = iso === c ? '' : c;
      const root = dv();
      root.querySelectorAll('.pl-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.circ === iso)));
      root.querySelectorAll('.pl-hs, .pl-mk').forEach((el) => el.classList.toggle('pl-dim', !!iso && el.dataset.circ !== iso));
      markRows();
    };

    const mark = (ref) => dv()?.querySelectorAll('.pl-hs').forEach((b) => b.classList.toggle('on', ref != null && b.dataset.ref === ref));

    /** Montre une planche du schéma affiché (et la ligne de l'échelon demandé). */
    const show = (sheet, rung) => {
      const fig = dv()?.querySelector(`.pl-pg[data-sheet="${CSS.escape(sheet)}"]`)?.closest('figure');
      if (!fig) return;
      const p = schemas()?.planches?.[sheet];
      let y = 0;
      if (rung != null && p?.ry && p.rungs[1] > p.rungs[0]) y = p.ry[0] + (p.ry[1] - p.ry[0]) * (rung - p.rungs[0]) / (p.rungs[1] - p.rungs[0]);
      const img = fig.querySelector('img');
      const top = fig.offsetTop + (img ? img.offsetHeight * y : 0) - (y ? dv().clientHeight * 0.35 : 12);
      dv().scrollTo({ top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      fig.classList.remove('pl-flash'); void fig.offsetWidth; fig.classList.add('pl-flash');
      fig.querySelectorAll('.pl-rung').forEach((m) => m.remove());
      if (y) fig.querySelector('.pl-pg').insertAdjacentHTML('beforeend', `<span class="pl-rung" style="top:${(y * 100).toFixed(2)}%"><b>${rung}</b></span>`);
    };
    const goSheet = (sheet, rung = null) => {
      const doc = ctx.sheetOwner(sheet);
      if (ctx.view?.type === 'document' && ctx.view.id === doc) show(sheet, rung);
      else { pending = { sheet, rung }; ctx.go(doc); }
      if (ctx.narrow()) ctx.ui.setPane('stage');
    };

    /** Habille les planches affichées (une fois par affichage). */
    const decorate = () => {
      const v = ctx.view;
      const root = dv();
      if (!root || root.hidden || !eq()) return;
      const doc = v.type === 'document' ? v.id : null;
      if (doc && !root.querySelector('.pl-bar')) root.insertAdjacentHTML('afterbegin', bar(doc));
      for (const img of root.querySelectorAll('figure > img[data-sheet]')) {
        const s = img.dataset.sheet;
        const ovl = overlay(s, doc || v.id);
        const title = schemas()?.planches?.[s]?.title;
        if (!ovl && !title) continue;
        const pg = document.createElement('div');
        pg.className = 'pl-pg';
        pg.dataset.sheet = s;
        img.replaceWith(pg);
        pg.appendChild(img);
        pg.insertAdjacentHTML('beforeend', ovl);
        const cap = img.closest('figure').querySelector('figcaption .mono');
        if (title && cap) cap.insertAdjacentHTML('afterend', ` · <strong class="pl-title">${esc(title)}</strong>`);
      }
      iso = '';
      watchRows();
      mark(refOf(ctx.selection?.ref));
      if (pending && doc === ctx.sheetOwner(pending.sheet)) {
        const { sheet, rung } = pending;
        pending = null;
        requestAnimationFrame(() => show(sheet, rung));
      }
    };

    // Clics sur les planches (délégués : les planches sont refaites à chaque vue).
    document.addEventListener('click', (e) => {
      const root = dv();
      if (!root || !root.contains(e.target)) return;
      const hs = e.target.closest('.pl-hs');
      if (hs) { e.stopPropagation(); ctx.viewer.select(hs.dataset.ref); return; }
      const xr = e.target.closest('.pl-xr');
      if (xr) {
        e.stopPropagation();
        const t = rungSheet(+xr.dataset.rung, ctx.view?.id);
        if (t) goSheet(t, +xr.dataset.rung);
        return;
      }
      const ch = e.target.closest('.pl-chip');
      if (ch) { isolate(ch.dataset.circ); return; }
      const sh = e.target.closest('[data-pl-sheet]');
      if (sh) goSheet(sh.dataset.plSheet);
    }, true);

    ctx.on('view', (v) => {
      if (v.type === 'document' || (v.type === 'assembly' && !v.is3d)) requestAnimationFrame(decorate);
    });

    // ---------------------------------------------------------------- outil « Schémas » du dock (vue 3D)
    // Schémas et listes du manuel, rangés par famille. Un clic reste dans la vue 3D : les composants du schéma
    // sont montrés à leur place sur la machine (couleur de leur circuit, le reste estompé, vue cadrée), avec leur
    // liste ; un composant de la liste sélectionne sa pièce (fiche par-dessus). Les composants se retrouvent par
    // leur numéro dans les listes des assemblages (schémas hydrauliques et pneumatiques), ou par la ligne qui
    // renvoie au schéma, ou par le boîtier lui-même (même numéro de coffret) ; un boîtier électrique que le
    // manuel ne dessine qu'en planches le dit, et ses planches ne s'ouvrent que par le bouton prévu.
    const SCH = 'schemas';
    const HW = /\b(BOLTS?|SCREWS?|NUTS?|WASHERS?|WSHR|HHCS|SHCS|PINS?|RIVETS?|CLAMPS?|TIES?|STRAPS?|LABELS?|DECALS?|DECL|GROMMETS?|SPACERS?|STANDOFFS?)\b/;
    const BOX = /CUT-?OUT|ENCLOSURE|\bBOX\b|CABINET|CAMERA|CONSOLE|MONITOR/;
    let shown = null; // { doc, targets } : schéma montré en 3D
    let schIso = ''; // circuit isolé parmi ses composants
    let pendingDoc = null; // schéma à montrer après l'ouverture de la machine entière
    const normPn = (p) => String(p || '').toUpperCase().replace(/^\*/, '').replace(/\s/g, '');

    /** Pièces de la vue 3D par (assemblage, repère) : tous les exemplaires. */
    const modelParts = () => {
      const out = new Map();
      const root = ctx.viewer.model?.root;
      if (!root) return out;
      root.traverse((g) => {
        const a = g.userData?.isAssembly && g.userData.assemblyId;
        if (!a) return;
        for (const q of g.userData.parts || []) {
          const k = `${a}:${q.userData.partRef}`;
          if (!out.has(k)) out.set(k, []);
          out.get(k).push(q);
        }
      });
      return out;
    };
    /** Composants d'un schéma présents dans la vue 3D : [{ row, key, objs, circ }]. */
    const targetsOf = (doc) => {
      const e = eq();
      const d = e.documents.get(doc);
      const fam = famOf(doc);
      const parts = modelParts();
      const byPn = new Map();
      for (const a of e.assemblies.values()) for (const r of a.parts) for (const pn of r.pns || []) {
        const k = normPn(pn);
        if (!byPn.has(k)) byPn.set(k, []);
        byPn.get(k).push(r);
      }
      const out = [];
      const seen = new Set();
      const add = (docRow, r) => {
        const key = `${r.source.id}:${String(r.ref)}`;
        const objs = parts.get(key) || parts.get(`${r.source.id}:${refOf(r.ref)}`);
        if (!objs?.length || seen.has(key)) return;
        seen.add(key);
        out.push({ row: docRow || r, key, objs, circ: docRow && fam !== 'electricite' ? circuitOf(doc, docRow.ref) : null });
      };
      // ligne d'un assemblage qui renvoie au schéma (télécommande ERIS…)
      for (const a of e.assemblies.values()) for (const r of a.parts) if (r.link === doc) add(null, r);
      for (const r of d.parts) {
        const u = String(r.desc || '').toUpperCase();
        if (HW.test(u)) continue;
        // schéma hydraulique ou pneumatique : chaque composant ; boîtier électrique : seulement le coffret lui-même
        if (fam === 'electricite' && !BOX.test(u)) continue;
        for (const pn of r.pns || []) for (const m of byPn.get(normPn(pn)) || []) add(r, m);
      }
      return out;
    };

    const paintSch = () => {
      if (!shown || !ctx.viewer.model) return;
      const fam = famOf(shown.doc);
      const lit = new Map();
      for (const t of shown.targets) {
        if (schIso && t.circ !== schIso) continue;
        const hex = t.circ ? color(fam, t.circ) : '#ff7c24';
        for (const o of t.objs) o.traverse((m) => { if (m.isMesh && !m.userData.isEdges) lit.set(m, hex); });
      }
      const map = new Map();
      ctx.viewer.model.root.traverse((m) => {
        if (!m.isMesh || m.userData.isEdges) return;
        map.set(m, lit.has(m) ? litMat(lit.get(m)) : ctx.viewer.dimMaterial(ctx.viewer.originalMaterial(m), 0.08));
      });
      ctx.viewer.setBaseMaterials(map);
    };
    const mats = new Map();
    const litMat = (hex) => {
      if (!mats.has(hex)) {
        const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45, metalness: 0, emissive: hex, emissiveIntensity: 0.3 });
        m.polygonOffset = true;
        m.polygonOffsetFactor = 1;
        mats.set(hex, m);
      }
      return mats.get(hex);
    };
    const frameSch = () => {
      const objs = shown.targets.filter((t) => !schIso || t.circ === schIso).flatMap((t) => t.objs);
      if (!objs.length) return;
      const box = new THREE.Box3();
      objs.forEach((o) => box.expandByObject(o));
      ctx.viewer.frame(box);
    };
    /** Chemin de repères d'une ligne depuis l'assemblage affiché (pour la sélectionner en 3D). */
    const pathTo = (asmId, ref) => {
      const e = eq();
      const start = ctx.view?.id;
      const queue = [[start, []]];
      const seen = new Set();
      while (queue.length) {
        const [id, path] = queue.shift();
        if (id === asmId) return [...path, ref];
        if (seen.has(id)) continue;
        seen.add(id);
        for (const r of e.assemblies.get(id)?.parts || []) if (r.link && e.assemblies.has(r.link)) queue.push([r.link, [...path, r.ref]]);
      }
      return null;
    };

    /** Liste des schémas, ou le schéma montré en 3D. */
    const schPanel = () => {
      const e = eq();
      const el = document.createElement('div');
      el.className = 'pl-sch';
      if (shown) {
        const d = e.documents.get(shown.doc);
        const fam = famOf(shown.doc);
        const n = {};
        shown.targets.forEach((t) => { if (t.circ) n[t.circ] = (n[t.circ] || 0) + 1; });
        const chips = fam && fam !== 'electricite' ? (schemas().circuits?.[fam] || []).filter((c) => n[c.id]).map((c) => `<button type="button" class="pl-chip" data-sch-circ="${c.id}" aria-pressed="${schIso === c.id}" style="--cc:${color(fam, c.id)}"><i></i>${esc(c.name)} <b>${n[c.id]}</b></button>`).join('') : '';
        const rows = shown.targets.filter((t) => !schIso || t.circ === schIso);
        const missing = d.parts.filter((r) => !HW.test(String(r.desc).toUpperCase()) && !shown.targets.some((t) => t.row === r)).length;
        el.innerHTML = `
          <button type="button" class="pl-back" data-sch-back>${icon('gauche', { size: 15 })}Tous les schémas</button>
          <h3 class="pl-sch-t"><span class="mono">${esc(label(d.sheets[0]))}</span> ${esc(d.titleFr)}</h3>
          ${shown.targets.length ? `<p class="pl-sch-intro">${fam === 'electricite' ? 'Le boîtier est mis en évidence sur la machine' : `${shown.targets.length} composant${shown.targets.length > 1 ? 's' : ''} du schéma à leur place sur la machine, en couleur par circuit`} ; le reste est estompé. Touchez un composant pour sa fiche.</p>
            ${chips ? `<div class="pl-legend">${chips}</div>` : ''}
            <ul class="pl-comp">${rows.map((t) => `<li><button type="button" data-sch-sel="${esc(t.key)}"${t.circ ? ` style="--cc:${color(fam, t.circ)}"` : ''}><i></i><span class="t">${esc(t.row.desc)}</span><span class="mono">${esc(t.row.pn || '')}</span><small>${esc(t.key.split(':')[0])}${t.objs.length > 1 ? ` · ×${t.objs.length}` : ''}</small></button></li>`).join('')}</ul>
            ${missing && fam !== 'electricite' ? `<p class="pl-sch-intro">${missing} composant${missing > 1 ? 's' : ''} du schéma ne ${missing > 1 ? 'sont' : 'est'} pas dans cette vue 3D.</p>` : ''}`
          : `<p class="pl-sch-intro">${ctx.view?.id !== e.root ? 'Aucun composant de ce schéma dans l’assemblage affiché.' : 'Ce boîtier ou ce schéma n’a pas de pièce dessinée en 3D : le manuel le décrit seulement par ses planches.'}</p>`}
          <div class="pl-sch-acts">
            ${ctx.view?.id !== e.root ? `<button type="button" class="btn primary" data-sch-root>Voir sur la machine entière</button>` : ''}
            <button type="button" class="btn" data-go="${esc(d.id)}">${icon('page', { size: 15 })}Planches du ${esc(e.docWord)}</button>
          </div>`;
        return el;
      }
      const fams = schemas()?.documents || {};
      const docs = [...e.documents.values()];
      const groups = [...Object.keys(FAMILLE).map((f) => [FAMILLE[f], docs.filter((d) => fams[d.id] === f), f]), ['Autres schémas et listes', docs.filter((d) => !fams[d.id]), null]]
        .filter(([, list]) => list.length);
      el.innerHTML = `<p class="pl-sch-intro">Touchez un schéma pour voir ses composants sur la machine, en 3D.</p>
        ${groups.map(([title, list, fam]) => `<h4>${fam ? icon(fam === 'electricite' ? 'eclair' : fam === 'air' ? 'vent' : 'goutte', { size: 15 }) : ''}${esc(title)}</h4>
          <ul>${list.map((d) => {
            const n = fam ? counts(d.id, fam) : {};
            const dots = fam ? (schemas().circuits?.[fam] || []).filter((c) => n[c.id]).map((c) => `<i style="--cc:${color(fam, c.id)}" title="${esc(c.name)}"></i>`).join('') : '';
            const planches = Object.values(schemas()?.planches || {}).filter((v) => v.doc === d.id && v.rungs).length;
            return `<li><button type="button" data-sch-doc="${esc(d.id)}"><span class="mono">${esc(label(d.sheets[0]))}</span><span class="t">${esc(d.titleFr)}</span>
              <small>${d.parts.length ? `${d.parts.length} composants` : planches ? `${planches} planches` : `${d.sheets.length} page${d.sheets.length > 1 ? 's' : ''}`}</small>${dots ? `<span class="pl-dots">${dots}</span>` : ''}</button></li>`;
          }).join('')}</ul>`).join('')}`;
      return el;
    };
    const renderSch = ({ top = false } = {}) => {
      if (!ctx.ui.sidePanel.has(SCH)) return;
      ctx.ui.sidePanel.setContent(schPanel(), SCH);
      if (top && ctx.ui.sidePanel.owner === SCH) ctx.ui.sidePanel.body.scrollTop = 0;
    };
    const showDoc = (doc, { frame = true } = {}) => {
      if (frame) { ctx.viewer.select(null); schIso = ''; }
      shown = { doc, targets: targetsOf(doc) };
      renderSch({ top: frame });
      if (!shown.targets.length) { ctx.viewer.restoreBaseMaterials(); return; }
      paintSch();
      if (frame) frameSch();
    };
    const leaveDoc = () => {
      if (!shown) return;
      shown = null;
      schIso = '';
      ctx.viewer.restoreBaseMaterials();
    };
    const schBtn = ctx.ui.addTool({
      id: 'schemas-tool', rank: 70, label: 'Schémas', icon: 'schema', title: 'Schémas du manuel : leurs composants en couleur sur la machine', pressed: false,
      onClick: () => {
        if (ctx.ui.sidePanel.has(SCH)) { ctx.ui.sidePanel.release(SCH); return; }
        ctx.ui.sidePanel.open({ owner: SCH, title: 'Schémas du manuel', icon: 'schema', content: schPanel() });
        if (shown) { paintSch(); frameSch(); }
      },
    });
    schBtn.hidden = true;
    ctx.ui.sidePanel.element?.addEventListener('click', (e) => {
      if (ctx.ui.sidePanel.owner !== SCH) return;
      const t = e.target;
      const doc = t.closest('[data-sch-doc]');
      if (doc) { showDoc(doc.dataset.schDoc); return; }
      if (t.closest('[data-sch-back]')) { leaveDoc(); renderSch({ top: true }); ctx.viewer.frame(); return; }
      const c = t.closest('[data-sch-circ]');
      if (c) { schIso = schIso === c.dataset.schCirc ? '' : c.dataset.schCirc; paintSch(); renderSch(); frameSch(); return; }
      const sel = t.closest('[data-sch-sel]');
      if (sel) {
        const [asm, ref] = sel.dataset.schSel.split(':');
        const path = pathTo(asm, ref);
        if (path) ctx.viewer.select(path.join('>'));
        return;
      }
      if (t.closest('[data-sch-root]')) { pendingDoc = shown.doc; ctx.go(eq().root); }
    });
    ctx.on('equipment', ({ equipment }) => { schBtn.hidden = !equipment?.documents?.size; leaveDoc(); pendingDoc = null; });
    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === SCH) schBtn.setAttribute('aria-pressed', String(open));
      if (!open && owner === SCH) leaveDoc();
    });
    // Autre assemblage 3D : le schéma montré est recherché dans le nouveau modèle.
    ctx.on('assembly', ({ is3d }) => {
      if (pendingDoc && is3d) { const d = pendingDoc; pendingDoc = null; if (!ctx.ui.sidePanel.has(SCH)) ctx.ui.sidePanel.open({ owner: SCH, title: 'Schémas du manuel', icon: 'schema', content: schPanel() }); requestAnimationFrame(() => showDoc(d)); return; }
      if (shown && is3d) requestAnimationFrame(() => showDoc(shown.doc));
      else if (shown) leaveDoc();
    });
    // Vue d'ensemble : sous-ensembles détaillés arrivés, les composants sont recherchés à nouveau (sans recadrer).
    ctx.on('model-update', ({ model, done }) => { if (shown && done && model === ctx.viewer.model) showDoc(shown.doc, { frame: false }); });
    ctx.on('select', (d) => mark(d?.row ? refOf(d.ref) : null));
  },
};
