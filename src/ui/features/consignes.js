// Consignes imprimées sur les dessins du manuel : couples, produits de freinage,
// cales, orientation, trousses… (public/equipment/<id>/consignes.json, produit par
// tools/build_atelier.py : lues par OCR, puis relues et traduites sur la planche).
//
// - Page « #<équipement>.consignes » : toutes les consignes, filtrables par type,
//   chacune avec l'extrait de la planche (un clic ouvre la page du manuel), le
//   texte traduit (étapes numérotées en liste), le texte d'origine, l'assemblage
//   et les repères cités (un clic ouvre la pièce dans sa liste).
// - Outil « Consignes » de la vue 3D : consignes de l'assemblage affiché et de
//   ses sous-assemblages, dans le panneau latéral ; un repère cité de
//   l'assemblage affiché sélectionne la pièce (fiche par-dessus).
// - Carte sur la page de l'équipement.
// Le manuel de pièces ne contient pas de procédure de réparation pas à pas :
// la page le dit, et ne montre que ce qui est imprimé sur les planches.
import './consignes.css';

const ID = 'consignes';
const KINDS = {
  couple: 'Couple de serrage',
  freinage: 'Freinage et étanchéité',
  graissage: 'Graissage et huile',
  reglage: 'Réglage, cales, orientation',
  trousse: 'Trousse',
  note: 'Note de montage',
};

export default {
  id: ID,
  order: 75,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const data = (id) => ctx.equipmentData(ID, id);
    const eq = () => ctx.equipment;
    const label = (s) => (eq().docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s);
    const ownerOf = (c) => (c.type === 'doc' ? eq().documents.get(c.asm) : eq().assemblies.get(c.asm));
    /** Vrai si l'assemblage id est root ou l'un de ses sous-assemblages. */
    const under = (id, root) => {
      for (let a = eq().assemblies.get(id), n = 0; a && n < 30; a = eq().assemblies.get(a.parent), n++) if (a.id === root) return true;
      return false;
    };
    let kind = null; // filtre de la page

    /** Texte traduit : une suite numérotée (« 1. … 2. … ») devient une liste d'étapes. */
    const steps = (text) => {
      const parts = String(text).split(/\s+(?=\d{1,2}[.)]\s*\S)/);
      const head = /^\d{1,2}[.)]/.test(parts[0]) ? '' : parts.shift();
      if (parts.length < 2) return `<p class="csg-fr">${esc(text)}</p>`;
      return `${head ? `<p class="csg-fr">${esc(head)}</p>` : ''}<ol class="csg-fr csg-steps">${parts.map((p) => `<li>${esc(p.replace(/^\d{1,2}[.)]\s*/, ''))}</li>`).join('')}</ol>`;
    };

    /** Extrait de la planche autour du texte (zone [x, y, l, h] relative à l'image). */
    const crop = (c) => {
      const url = ctx.pageUrl(c.sheet);
      if (!url) return '';
      const pad = 0.02;
      const x = Math.max(0, c.box[0] - pad), y = Math.max(0, c.box[1] - pad * 0.8);
      const w = Math.min(1 - x, c.box[2] + 2 * pad), h = Math.min(1 - y, c.box[3] + 1.6 * pad);
      return `<button type="button" class="csg-crop" data-page="${esc(c.sheet)}" style="--x:${x};--y:${y};--w:${w};--h:${h}" title="Ouvrir la page ${esc(label(c.sheet))} du ${esc(eq().docWord)}">
        <img src="${esc(url)}" alt="Extrait de la page ${esc(label(c.sheet))}" loading="lazy" decoding="async"></button>`;
    };
    /** Proportions de chaque extrait, une fois la page chargée. */
    const fit = (root) => root.querySelectorAll('.csg-crop img').forEach((img) => {
      const set = () => {
        const b = img.parentElement;
        const st = getComputedStyle(b);
        if (img.naturalWidth) b.style.aspectRatio = `${(+st.getPropertyValue('--w') * img.naturalWidth).toFixed(1)} / ${(+st.getPropertyValue('--h') * img.naturalHeight).toFixed(1)}`;
      };
      if (img.complete) set(); else img.addEventListener('load', set, { once: true });
      img.addEventListener('error', () => img.parentElement.remove(), { once: true });
    });

    const card = (c) => {
      const o = ownerOf(c);
      const refs = (c.items || []).map((r) => `<button type="button" class="chip" data-csg-row="${esc(`${c.asm}:${r}`)}" data-csg-ref="${esc(r)}" data-csg-asm="${esc(c.asm)}">Réf. ${esc(r)}</button>`).join('');
      return `<article class="csg-card csg-${esc(c.kind)}">
        ${crop(c)}
        <div class="csg-body">
          <span class="csg-kind">${esc(KINDS[c.kind] || KINDS.note)}</span>
          ${steps(c.fr)}
          <p class="csg-en" lang="en">${esc(c.en)}</p>
          ${refs ? `<p class="csg-refs">Pièces citées : ${refs}</p>` : ''}
          <button type="button" class="csg-src" data-go="${esc(c.asm)}"><span class="mono">${esc(label(c.sheet))}</span> ${esc(o?.titleFr || c.asm)}</button>
        </div>
      </article>`;
    };

    // Repère cité : la pièce de l'assemblage affiché est sélectionnée sur place ; sinon sa liste s'ouvre.
    const onRef = (b) => {
      const v = ctx.view;
      if (v?.type === 'assembly' && v.id === b.dataset.csgAsm) ctx.viewer.select(b.dataset.csgRef);
      else ctx.openRow(b.dataset.csgRow);
    };

    // ---------------------------------------------------------------- page
    ctx.registerRoute(ID, () => {
      const d = data(eq()?.id);
      if (!d) return;
      const el = document.createElement('div');
      el.className = 'csg';
      const draw = () => {
        const list = d.consignes.filter((c) => !kind || c.kind === kind);
        const kinds = Object.keys(KINDS).filter((k) => d.consignes.some((c) => c.kind === k));
        el.innerHTML = `
          <div class="csg-head">
            <p class="csg-intro">${esc(eq().manufacturer)} · ${esc(eq().document.title)}</p>
            <p class="csg-note">${d.consignes.length} consigne${d.consignes.length > 1 ? 's' : ''} imprimée${d.consignes.length > 1 ? 's' : ''} sur les planches, avec l'extrait du dessin et la traduction ; chacune a été relue sur sa planche.</p>
            <p class="csg-miss">${icon('alerte', { size: 16 })}<span><b>Absent du manuel de pièces :</b> procédures de réparation pas à pas, couples autres que ceux des dessins. Les consignes ci-dessous sont celles que le dessinateur a portées sur chaque planche.</span></p>
          </div>
          ${kinds.length > 1 ? `<div class="csg-filter" role="group" aria-label="Filtrer par type">
            <button type="button" class="chip ${kind ? '' : 'on'}" data-csg-kind="" aria-pressed="${!kind}">Toutes <b>${d.consignes.length}</b></button>
            ${kinds.map((k) => `<button type="button" class="chip csg-${k} ${kind === k ? 'on' : ''}" data-csg-kind="${k}" aria-pressed="${kind === k}"><i class="csg-dot"></i>${esc(KINDS[k])} <b>${d.consignes.filter((c) => c.kind === k).length}</b></button>`).join('')}
          </div>` : ''}
          <div class="csg-grid">${list.map(card).join('')}</div>`;
        fit(el);
      };
      draw();
      el.addEventListener('click', (e) => {
        const k = e.target.closest('[data-csg-kind]');
        if (k) { kind = k.dataset.csgKind || null; draw(); return; }
        const r = e.target.closest('[data-csg-row]');
        if (r) ctx.openRow(r.dataset.csgRow);
      });
      document.title = `Consignes des dessins · ${eq().name} · Pièces 3D`;
      ctx.ui.showPage(`Consignes des dessins — ${eq().name}`, el, { icon: 'page' });
    });

    // ---------------------------------------------------------------- outil de la vue 3D
    const mine = () => {
      const d = data();
      const v = ctx.view;
      if (!d || v?.type !== 'assembly' || v.home) return [];
      return d.consignes.filter((c) => c.type !== 'doc' && under(c.asm, v.id));
    };
    const panel = () => {
      const list = mine();
      const a = eq().assemblies.get(ctx.view.id);
      const el = document.createElement('div');
      el.className = 'csg-panel';
      el.innerHTML = `<p class="csg-note">${list.length} consigne${list.length > 1 ? 's' : ''} des dessins pour ${esc(a?.titleFr || a?.title || '')}${list.some((c) => c.asm !== a?.id) ? ' et ses sous-ensembles' : ''}.</p>
        ${list.map(card).join('')}
        <p class="csg-note"><button type="button" class="csg-link" data-go="${ID}">Toutes les consignes de l'équipement ›</button></p>`;
      el.addEventListener('click', (e) => {
        const r = e.target.closest('[data-csg-row]');
        if (r) onRef(r);
      });
      fit(el);
      return el;
    };
    const tool = ctx.ui.addTool({
      id: 'consignes-tool', label: 'Consignes', icon: 'page', title: 'Consignes imprimées sur les dessins de cet assemblage', pressed: false,
      onClick: () => ctx.ui.sidePanel.toggle({ owner: ID, title: 'Consignes des dessins', icon: 'page', content: panel() }),
    });
    tool.hidden = true;
    ctx.on('sidepanel', ({ open, owner }) => { if (owner === ID) tool.setAttribute('aria-pressed', String(open)); });
    ctx.on('view', () => {
      const n = mine().length;
      tool.hidden = !n || !ctx.viewer.is3d;
      tool.querySelector('.ftool-n')?.remove();
      if (n) tool.insertAdjacentHTML('beforeend', `<span class="ftool-n">${n}</span>`);
      if (ctx.ui.sidePanel.owner === ID) {
        if (n) ctx.ui.sidePanel.setContent(panel(), ID);
        else ctx.ui.sidePanel.release(ID);
      }
    });

    // ---------------------------------------------------------------- carte de la page d'équipement
    const box = document.createElement('section');
    box.className = 'card-box csg-card-home';
    box.hidden = true;
    ctx.ui.equipmentHome.appendChild(box);
    ctx.on('equipment', ({ id }) => {
      const d = data(id);
      box.hidden = !d?.consignes?.length;
      if (box.hidden) return;
      const counts = Object.keys(KINDS).map((k) => [k, d.consignes.filter((c) => c.kind === k).length]).filter(([, n]) => n);
      box.innerHTML = `
        <div class="csg-home-head">
          <h3>${icon('page', { size: 18 })}Consignes des dessins</h3>
          <button type="button" class="btn primary" data-go="${ID}">Voir les consignes ${icon('droite', { size: 16 })}</button>
        </div>
        <p class="csg-note">${d.consignes.length} consignes imprimées sur les planches (relues et traduites), avec l'extrait du dessin.</p>
        <p class="csg-home-kinds">${counts.map(([k, n]) => `<span class="csg-${k}"><i class="csg-dot"></i>${esc(KINDS[k])} · ${n}</span>`).join('')}</p>`;
    });
  },
};
