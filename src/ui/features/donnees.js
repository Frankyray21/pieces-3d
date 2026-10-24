// Données techniques en tableaux (adresse « #<équipement>.donnees »).
//
// - Valeurs relevées dans le manuel, groupées par système (foreuse, tête,
//   treuil, groupe, console…), une valeur par ligne, unités métriques et
//   impériales, colonne « Source » qui ouvre la page du manuel. Elles viennent
//   de public/equipment/<id>/donnees.json (ctx.equipmentData('donnees'), lu à
//   la construction : aucune requête) ; sans ce fichier, la fiche technique de
//   data.json (specs, weights) est reprise telle quelle, sans page source.
// - Tableau « Visserie par assemblage » calculé depuis les listes de pièces
//   (boulons, vis, écrous, rondelles, goupilles) : quantité par taille.
// Rien n'est inventé : une donnée absente du manuel n'apparaît pas.

import './donnees.css';
// Visserie : calcul commun avec le contrôle scripts/check-visserie.mjs.
import { visserie, libTaille, libMm, tri } from '../../data/visserie.js';

const ID = 'donnees';
const RM = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const smooth = () => (RM.matches ? 'auto' : 'smooth');
/** Texte de recherche : minuscules sans accents, « × » lu comme « x ». */
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/×/g, 'x');

// ------------------------------------------------------------------ module
export default {
  id: ID,
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;

    /** Lien vers la page du manuel (géré par le site : data-page). */
    const src1 = (p) => `<button type="button" class="dn-src mono" data-page="${esc(p)}" title="${esc(`Ouvrir la page ${p} du manuel${ctx.sheetTitle(p) ? ` : ${ctx.sheetTitle(p)}` : ''}`)}">${icon('page', { size: 13 })}${esc(p)}</button>`;
    /** Page(s) source : une page, ou plusieurs (« p »: ["P043", "P044"]). */
    const src = (p) => {
      const list = (Array.isArray(p) ? p : [p]).filter(Boolean);
      return list.length ? `<span class="dn-srcs">${list.map(src1).join('')}</span>` : '<span class="dn-nosrc">—</span>';
    };
    /** Marque « conv. » d'une valeur convertie (le manuel ne donne que l'autre unité). */
    const convTag = '<span class="dn-conv" title="Valeur convertie : le manuel ne donne que l’autre unité">conv.</span>';

    const disponible = (eq, don) => !!(don || eq.specs?.length || eq.weights?.length || visserie(eq).length);

    // --- bouton de la barre d'outils (vue 3D)
    const tool = ctx.ui.addTool({
      id: 'donnees-tool', label: 'Données', icon: 'liste', title: 'Données techniques de l’équipement (cotes, poids, moteur, visserie)',
      onClick: () => ctx.go(ID),
    });

    // --- carte de la page d'équipement
    const card = document.createElement('section');
    card.className = 'card-box dn-card';
    card.hidden = true;
    ctx.ui.equipmentHome.appendChild(card);

    ctx.on('equipment', ({ equipment: eq, id }) => {
      card.hidden = true;
      const don = ctx.equipmentData(ID, id);
      const ok = disponible(eq, don);
      tool.hidden = !ok;
      if (!ok) return;
      const nVal = don ? don.groupes.reduce((n, g) => n + g.tableaux.reduce((k, t) => k + t.lignes.length, 0), 0) : (eq.specs?.length || 0) + (eq.weights?.length || 0);
      const nVis = new Set(visserie(eq).map((l) => l.cle)).size;
      const cles = (don?.cles || []).slice(0, 4);
      card.innerHTML = `
        <div class="dn-card-head">
          <h3>${icon('liste', { size: 18 })}Données techniques</h3>
          <button type="button" class="btn primary" data-go="${ID}">Ouvrir les tableaux ${icon('droite', { size: 16 })}</button>
        </div>
        <p class="dn-card-sub">${nVal} valeur${nVal > 1 ? 's' : ''}${don ? ' relevées au manuel, avec la page source' : ' de la fiche technique'}${nVis ? ` · visserie : ${nVis} taille${nVis > 1 ? 's' : ''} au total, détail par assemblage` : ''}.</p>
        ${cles.length ? `<div class="dn-card-keys">${cles.map((k) => `<div><b>${esc(k.v)}</b>${k.conv === 'v' ? convTag : ''}<span>${esc(k.l)}</span></div>`).join('')}</div>` : ''}`;
      card.hidden = false;
    });

    // --- page plein écran
    ctx.registerRoute(ID, () => {
      const eq = ctx.equipment;
      if (!eq) return;
      const don = ctx.equipmentData(ID, eq.id);
      const el = document.createElement('div');
      el.className = 'dn';
      el.innerHTML = render(eq, don);
      wire(el, eq);
      document.title = `Données techniques · ${eq.name} · Pièces 3D`;
      ctx.ui.showPage(`Données techniques — ${eq.name}`, el, { icon: 'liste' });
    });

    // ---------------------------------------------------------------- rendu
    function render(eq, don) {
      const groupes = don ? don.groupes : fiche(eq);
      const vis = visserie(eq);
      const nav = [...groupes.map((g) => [g.id, g.titre]), ...(vis.length ? [['visserie', 'Visserie']] : [])];
      const cles = don?.cles || [];
      return `
        <header class="dn-head">
          <p class="dn-intro">${esc(eq.manufacturer)} · ${esc(eq.document?.title || '')}${eq.document?.reference ? ` (${esc(eq.document.reference)}${eq.document.client ? `, client ${esc(eq.document.client)}` : ''})` : ''}</p>
          ${don?.note ? `<p class="dn-note">${esc(don.note)}</p>` : `<p class="dn-note">Fiche technique de l’équipement (sans renvoi de page) et visserie calculée d’après les listes du ${esc(eq.docWord)}.</p>`}
        </header>
        ${cles.length ? `<section class="dn-keys" aria-label="Chiffres clés">${cles.map((k) => `
          <div class="dn-key">
            <span class="dn-key-v">${esc(k.v)}${k.conv === 'v' ? ` ${convTag}` : ''}</span>
            ${k.s ? `<span class="dn-key-s">${esc(k.s)}${k.conv === 's' ? ` ${convTag}` : ''}</span>` : ''}
            <span class="dn-key-l">${esc(k.l)}</span>
            ${src(k.p)}
          </div>`).join('')}</section>` : ''}
        <nav class="dn-nav" aria-label="Sections">${nav.map(([id, t]) => `<a class="chip" href="#" data-dn-jump="${esc(id)}">${esc(t)}</a>`).join('')}</nav>
        ${groupes.map((g) => groupe(eq, g)).join('')}
        ${vis.length ? visserieHtml(eq, vis) : ''}`;
    }

    /** Fiche technique de data.json, sans page source (équipement sans donnees.json). */
    function fiche(eq) {
      const out = [];
      if (eq.specs?.length) out.push({ id: 'fiche', titre: 'Fiche technique', icone: 'engrenage', tableaux: [{ titre: 'Caractéristiques', lignes: eq.specs.map(([l, v]) => ({ l, v })) }] });
      if (eq.weights?.length) out.push({ id: 'masses', titre: 'Masses', icone: 'structure', tableaux: [{ titre: 'Poids', lignes: eq.weights.map(([l, v]) => ({ l, v })) }] });
      return out;
    }

    function groupe(eq, g) {
      const sys = g.asm ? ctx.systemOf(g.asm) : null;
      const color = sys?.color || 'var(--sys-0)';
      const asm = g.asm && eq.assemblies.get(g.asm);
      return `<section class="dn-grp" id="dn-${esc(g.id)}" style="--sys:${color}">
        <div class="dn-grp-head">
          <span class="dn-grp-ico">${icon(g.icone || sys?.icon || 'cle', { size: 20 })}</span>
          <h3>${esc(g.titre)}</h3>
          ${asm ? `<button type="button" class="btn dn-asm" data-go="${esc(g.asm)}" title="${esc(asm.titleFr || asm.title)}">${icon(ctx.has3d(g.asm) ? 'cube' : 'page', { size: 15 })}<span>Voir l’assemblage</span></button>` : ''}
        </div>
        ${g.tableaux.map((t) => tableau(t)).join('')}
      </section>`;
    }

    function tableau(t) {
      const deux = t.lignes.some((l) => l.m || l.i);
      const anySrc = t.lignes.some((l) => l.p);
      return `<div class="dn-tw card-box">
        <table class="dn-t${deux ? '' : ' one'}">
          <caption>${esc(t.titre)}</caption>
          <thead><tr><th scope="col">Donnée</th>${deux ? '<th scope="col">Métrique</th><th scope="col">Impérial</th>' : '<th scope="col">Valeur</th>'}${anySrc ? '<th scope="col" class="c-src">Source</th>' : ''}</tr></thead>
          <tbody>${t.lignes.map((l) => {
            const conv = (u) => (l.conv === u ? ` ${convTag}` : '');
            const vals = l.m || l.i
              ? `<td class="c-m" data-u="Métrique">${esc(l.m || '—')}${conv('m')}</td><td class="c-i" data-u="Impérial">${esc(l.i || '—')}${conv('i')}</td>`
              : `<td class="c-v"${deux ? ' colspan="2"' : ''}>${esc(l.v ?? '—')}</td>`;
            return `<tr><th scope="row" class="c-l">${esc(l.l)}${l.n ? `<small class="dn-n">${esc(l.n)}</small>` : ''}</th>${vals}${anySrc ? `<td class="c-src">${src(l.p)}</td>` : ''}</tr>`;
          }).join('')}</tbody>
        </table>
      </div>`;
    }

    function visserieHtml(eq, lignes) {
      // Total par taille (somme des quantités inscrites aux listes).
      const tot = new Map();
      for (const l of lignes) {
        if (!tot.has(l.cle)) tot.set(l.cle, { ...l, qte: 0, inconnu: 0, pns: new Set(), asms: new Set(), descs: new Set() });
        const g = tot.get(l.cle);
        if (l.q != null) g.qte += l.q; else g.inconnu++;
        if (l.r.pn) g.pns.add(l.r.pn);
        if (l.r.desc) g.descs.add(l.r.desc);
        g.asms.add(l.asm.id);
      }
      const totaux = [...tot.values()].sort(tri);
      const taille = (l) => (l.t ? `<span class="dn-sz">${esc(libTaille(l.t))}${l.t.filet ? ` <span class="dn-th">${esc(l.t.filet)}</span>` : ''}</span><small class="dn-mm">${esc(libMm(l.t))}</small>` : '<span class="dn-nosrc">non précisée</span>');
      const parAsm = new Map();
      for (const l of lignes) {
        if (!parAsm.has(l.asm.id)) parAsm.set(l.asm.id, []);
        parAsm.get(l.asm.id).push(l);
      }
      const nb = (n) => n.toLocaleString('fr-CA');
      const tailles = (n, q) => `${nb(n)} taille${n > 1 ? 's' : ''}, ${nb(q)} pièce${q > 1 ? 's' : ''}`;
      // Quantité inscrite ; « ? » quand une liste ne la donne pas.
      const qte = (g) => (g.inconnu ? (g.qte ? `${nb(g.qte)}<span class="dn-nosrc"> + ?</span>` : '<span class="dn-nosrc" title="Quantité non inscrite à la liste">?</span>') : nb(g.qte));
      const asmBlocks = [...parAsm.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr', { numeric: true })).map(([id, ls]) => {
        const a = eq.assemblies.get(id);
        const sys = ctx.systemOf(id);
        // Regroupement par taille dans l'assemblage.
        const m = new Map();
        for (const l of ls) {
          if (!m.has(l.cle)) m.set(l.cle, { ...l, qte: 0, inconnu: 0, items: [] });
          const g = m.get(l.cle);
          if (l.q != null) g.qte += l.q; else g.inconnu++;
          g.items.push(l);
        }
        const rows = [...m.values()].sort(tri);
        const total = ls.reduce((n, l) => n + (l.q || 0), 0);
        const search = ls.map((l) => `${l.r.pn} ${l.r.desc} ${l.fam.t} ${libTaille(l.t)}`).join(' ');
        return `<details class="dn-asmv" data-asm="${esc(id)}" data-search="${esc(norm(`${id} ${a.titleFr || ''} ${a.title || ''} ${search}`))}" style="--sys:${sys?.color || 'var(--sys-0)'}">
          <summary><span class="mono dn-asm-id">${esc(id)}</span><span class="dn-asm-t">${esc(a.titleFr || a.title)}</span><span class="dn-asm-n">${rows.length} taille${rows.length > 1 ? 's' : ''} · ${nb(total)} pce${total > 1 ? 's' : ''}</span></summary>
          <div class="dn-asmv-body">
            <table class="dn-t dn-vt">
              <thead><tr><th scope="col">Pièce</th><th scope="col">Taille</th><th scope="col">Numéro · repère</th><th scope="col" class="c-q">Qté</th></tr></thead>
              <tbody>${rows.map((g) => `<tr data-search="${esc(norm(g.items.map((l) => `${l.r.pn} ${l.r.desc} ${l.fam.t} ${libTaille(l.t)}`).join(' ')))}">
                <th scope="row" class="c-l">${esc(g.fam.t)}</th>
                <td>${taille(g)}</td>
                <td>${g.items.map((l) => `<button type="button" class="dn-pn" data-dn-asm="${esc(id)}" data-dn-ref="${esc(l.r.ref)}" title="${esc(`${l.r.desc} — repère ${l.r.label || l.r.ref} : voir dans l’assemblage`)}"><span class="mono">${esc(l.r.pn || '—')}</span><span class="dn-ref">rep. ${esc(l.r.label || l.r.ref)}${l.q != null && g.items.length > 1 ? ` · ${l.q}` : ''}</span></button>${l.ecart ? `<small class="dn-warn">${icon('alerte', { size: 12 })}${esc(l.ecart)}</small>` : ''}`).join('')}</td>
                <td class="c-q">${qte(g)}</td>
              </tr>`).join('')}</tbody>
            </table>
            <p class="dn-asmv-foot">${src(a.sheet)} <button type="button" class="btn dn-asm" data-go="${esc(id)}">${icon(ctx.has3d(id) ? 'cube' : 'page', { size: 15 })}<span>Ouvrir l’assemblage</span></button></p>
          </div>
        </details>`;
      }).join('');
      const totalPieces = totaux.reduce((n, g) => n + g.qte, 0);
      return `<section class="dn-grp dn-vis" id="dn-visserie" style="--sys:var(--accent)">
        <div class="dn-grp-head">
          <span class="dn-grp-ico">${icon('cle', { size: 20 })}</span>
          <h3>Visserie par assemblage</h3>
        </div>
        <p class="dn-note">Calculée d’après les listes de pièces du ${esc(eq.docWord)} : boulons, vis, écrous, rondelles et goupilles. Taille lue dans la description, sinon dans le numéro (B625-2750 = 5/8 × 2 3/4 po). Les quantités sont celles inscrites aux listes, sans multiplier par le nombre d’assemblages montés.</p>
        <label class="dn-filter">${icon('recherche', { size: 16 })}<input type="search" placeholder="Filtrer : 5/8, B750, écrou, P013…" aria-label="Filtrer la visserie"><span class="dn-count" aria-live="polite"></span></label>
        <div class="dn-tw card-box">
          <table class="dn-t dn-tot">
            <caption>Total par taille — <span class="dn-cap">${tailles(totaux.length, totalPieces)}</span></caption>
            <thead><tr><th scope="col">Pièce</th><th scope="col">Taille</th><th scope="col">Numéros</th><th scope="col" class="c-q">Qté</th><th scope="col">Assemblages</th></tr></thead>
            <tbody>${totaux.map((g) => `<tr data-search="${esc(norm(`${g.fam.t} ${libTaille(g.t)} ${[...g.pns].join(' ')} ${[...g.asms].join(' ')} ${[...g.descs].join(' ')}`))}" data-qte="${g.qte}">
              <th scope="row" class="c-l">${esc(g.fam.t)}</th>
              <td>${taille(g)}</td>
              <td class="mono dn-pns">${esc([...g.pns].join(', ') || '—')}</td>
              <td class="c-q">${qte(g)}</td>
              <td><div class="dn-asms">${[...g.asms].map((id) => `<button type="button" class="dn-asmchip mono" data-dn-open="${esc(id)}" title="${esc(eq.assemblies.get(id).titleFr || '')}">${esc(id)}</button>`).join('')}</div></td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="dn-asmlist">${asmBlocks}</div>
      </section>`;
    }

    // ---------------------------------------------------------------- interactions
    function wire(el, eq) {
      el.addEventListener('click', (e) => {
        const jump = e.target.closest('[data-dn-jump]');
        if (jump) {
          e.preventDefault();
          el.querySelector(`#dn-${CSS.escape(jump.dataset.dnJump)}`)?.scrollIntoView({ behavior: smooth(), block: 'start' });
          return;
        }
        const open = e.target.closest('[data-dn-open]');
        if (open) {
          const d = el.querySelector(`.dn-asmv[data-asm="${CSS.escape(open.dataset.dnOpen)}"]`);
          if (d) { d.open = true; d.scrollIntoView({ behavior: smooth(), block: 'start' }); }
          return;
        }
        const pn = e.target.closest('[data-dn-ref]');
        if (pn) {
          const { dnAsm: id, dnRef: ref } = pn.dataset;
          // Ouvre l'assemblage puis sélectionne la ligne (fiche, liste et 3D).
          const off = ctx.once('assembly', (d) => { if (d.id === id) setTimeout(() => ctx.viewer.select(ref), 60); });
          setTimeout(off, 15000);
          ctx.go(id);
        }
      });
      const input = el.querySelector('.dn-filter input');
      if (!input) return;
      const count = el.querySelector('.dn-count');
      const cap = el.querySelector('.dn-cap');
      const capAll = cap?.textContent || '';
      const totRows = [...el.querySelectorAll('.dn-tot tbody tr')];
      const blocks = [...el.querySelectorAll('.dn-asmv')];
      const nb = (n) => n.toLocaleString('fr-CA');
      input.addEventListener('input', () => {
        const q = norm(input.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        const hit = (s) => words.every((w) => s.includes(w));
        let n = 0, pcs = 0;
        for (const tr of totRows) { const ok = !words.length || hit(tr.dataset.search); tr.hidden = !ok; if (ok) { n++; pcs += +tr.dataset.qte || 0; } }
        // Légende du tableau : tailles et pièces affichées.
        if (cap) cap.textContent = words.length ? `${nb(n)} taille${n > 1 ? 's' : ''} sur ${capAll.split(' ')[0]}, ${nb(pcs)} pièce${pcs > 1 ? 's' : ''}` : capAll;
        for (const d of blocks) {
          const rows = [...d.querySelectorAll('tbody tr')];
          const head = hit(norm(d.dataset.asm));
          let k = 0;
          for (const tr of rows) { const ok = !words.length || head || hit(tr.dataset.search); tr.hidden = !ok; if (ok) k++; }
          d.hidden = words.length > 0 && !k;
          d.open = words.length > 0 && k > 0 && blocks.length > 1 ? true : d.open && !!words.length;
        }
        count.textContent = words.length ? `${n} taille${n > 1 ? 's' : ''}` : '';
      });
    }
  },
};
