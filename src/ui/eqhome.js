// Page d'un équipement (adresse « #<équipement>.apercu ») : machine → systèmes.
// Données clés en gros chiffres, une tuile par système (bandeau de couleur,
// icône, vignette de la page du manuel) suivie des tuiles de ses
// sous-assemblages (et de leurs propres sous-ensembles en raccourcis), schémas
// et listes, fiche technique, puis l'emplacement des fonctions
// (ctx.ui.equipmentHome). Un sous-ensemble sans modèle 3D propre s'ouvre isolé
// dans la vue 3D de l'ensemble qui le contient (src/ui/features/systemes.js).

import { icon } from './icons.js';
import { systems, systemTiles, refPath } from './systems.js';
import { esc } from './host.js';

/**
 * Action d'une tuile : l'assemblage lui-même s'il a un modèle 3D (ou s'il n'a
 * que les dessins du manuel) ; sinon l'ensemble 3D le plus proche qui le
 * contient (hors page d'accueil de l'équipement), avec ce sous-ensemble isolé.
 */
function tileAction(eq, id, has3d) {
  if (has3d(id)) return `data-go="${esc(id)}"`;
  for (let a = eq.assemblies.get(eq.assemblies.get(id)?.parent); a && a.id !== eq.root; a = eq.assemblies.get(a.parent)) {
    if (!has3d(a.id)) continue;
    const path = refPath(eq, a.id, id);
    if (path?.length) return `data-sysx-iso="${esc(id)}" data-sysx-from="${esc(a.id)}" data-sysx-path="${esc(path.join('>'))}"`;
    break;
  }
  return `data-go="${esc(id)}"`;
}

/** Pages du manuel publiées avec cette version du site (sonde par équipement). */
const pagesOk = new Map();

const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;

/** Tuiles d'un système : en-tête (le système), puis ses sous-assemblages. */
function renderSystem(eq, t, { has3d, badge, pageUrl }, n) {
  // Vignette : la page du manuel (aucune si la page n'est pas publiée avec cette version du site).
  const thumb = (sheet, alt) => (pageUrl(sheet) ? `<span class="sysx-thumb"><img data-src="${esc(pageUrl(sheet))}" alt="${esc(alt)}" decoding="async"></span>` : '');
  const meta = (x) => `<span class="mono">${esc(badge(x.sheet))}</span> · ${plural(x.pieces, 'pièce')}${x.subs ? ` · ${plural(x.subs, 'sous-ensemble')}` : ''}`;
  const tag3d = (id, iso) => (has3d(id) ? '<span class="tag3d">3D</span>' : iso ? '<span class="tag3d iso" title="Isolé dans la vue 3D de l’ensemble">3D</span>' : '');
  const tile = (c) => {
    const act = tileAction(eq, c.id, has3d);
    const chips = c.children.map((g) => `<button type="button" class="sysx-chip" ${tileAction(eq, g.id, has3d)} title="${esc(g.title)} · ${esc(badge(g.sheet))}">${icon(g.icon, { size: 14 })}<span>${esc(g.title)}</span></button>`).join('');
    return `<div class="sysx-tile">
      <button type="button" class="sysx-open" ${act}>
        ${thumb(c.sheet, `Page ${c.sheet} du ${eq.docWord}`)}
        <span class="sysx-head"><span class="sysx-ico">${icon(c.icon, { size: 18 })}</span><strong>${esc(c.title)}</strong>${tag3d(c.id, act.includes('data-sysx-iso'))}</span>
        <span class="sysx-meta">${meta(c)}</span>
      </button>${chips ? `<div class="sysx-chips">${chips}</div>` : ''}
    </div>`;
  };
  const MAX = 12;
  const first = t.children.slice(0, MAX).map(tile).join('');
  const rest = t.children.slice(MAX);
  return `<section class="sysx-sys" style="--sys:${t.color}" aria-label="${esc(t.title)}">
    <button type="button" class="sysx-main" ${tileAction(eq, t.id, has3d)}>
      <span class="sysx-ico big">${icon(t.icon, { size: 24 })}</span>
      <span class="sysx-body"><span class="sysx-kicker">Système ${n}</span><strong>${esc(t.title)}</strong>
        <span class="sysx-meta">${meta(t)}</span></span>
      ${tag3d(t.id, false)}
      ${thumb(t.sheet, `Page ${t.sheet} du ${eq.docWord}`)}
      ${icon('droite', { size: 18, cls: 'chev' })}
    </button>
    ${first ? `<div class="sysx-grid">${first}</div>` : ''}
    ${rest.length ? `<details class="sysx-more"><summary>Afficher les ${rest.length} autres sous-ensembles</summary><div class="sysx-grid">${rest.map(tile).join('')}</div></details>` : ''}
  </section>`;
}

/**
 * Contenu de la page. opts : { has3d(id), badge(sheet), slot (élément des fonctions) }.
 */
export function renderEquipmentHome(eq, { has3d, badge, slot }) {
  const el = document.createElement('div');
  el.className = 'eqh';
  const n3d = [...eq.assemblies.keys()].filter(has3d).length;
  const errors = eq.issues.filter((r) => r.flags.some((f) => f.level === 'error')).length;
  const stat = (n, label, extra = '') => `<div class="stat${extra}"><span class="num">${esc(n)}</span><span class="lbl">${esc(label)}</span></div>`;
  const sys = systems(eq);
  const cards = systemTiles(eq).map((t, i) => renderSystem(eq, t, { has3d, badge, pageUrl: eq.pageUrl }, i + 1)).join('');
  const docs = [...eq.documents.values()].map((d) => `<button type="button" class="doccard" data-go="${esc(d.id)}">
      ${icon('page', { size: 18 })}<span class="mono">${esc(badge(d.sheets[d.sheets.length - 1]))}</span><span class="t">${esc(d.titleFr)}</span></button>`).join('');
  const specs = [...(eq.specs || []), ...(eq.weights || [])];
  el.innerHTML = `
    <header class="eqh-hero card-box">
      <div class="eqh-id">
        <span class="kicker">${esc(eq.manufacturer)} · ${esc(eq.category)}</span>
        <h2>${esc(eq.name)}</h2>
        <span class="sub">${eq.serial ? `N° de série ${esc(eq.serial)} · ` : ''}${esc(eq.document.title || '')}${eq.document.date ? ` · ${esc(eq.document.date)}` : ''}</span>
      </div>
      <div class="eqh-actions">
        <button type="button" class="btn primary" data-go="${esc(eq.root)}">${icon('cube', { size: 16 })}${n3d ? 'Ouvrir la vue 3D' : 'Ouvrir l’assemblage général'}</button>
        <button type="button" class="btn" data-page="${esc(eq.sheetId(1))}">${icon('page', { size: 16 })}Pages du ${eq.docWord}</button>
      </div>
    </header>
    <section class="stats" aria-label="Données clés">
      ${stat(eq.assemblies.size, 'assemblages')}
      ${n3d ? stat(n3d, 'en 3D') : ''}
      ${stat(eq.rows.length, 'lignes de pièces')}
      ${stat(eq.document.sheets, `pages du ${eq.docWord}`)}
      ${errors ? stat(errors, 'numéros à vérifier', ' warn') : ''}
    </section>
    ${sys.length ? `<section class="eqh-sec"><h3>${icon('cle', { size: 16 })}Systèmes</h3><div class="sysx">${cards}</div></section>` : ''}
    ${docs ? `<section class="eqh-sec"><h3>${icon('liste', { size: 16 })}${esc(eq.labels?.documents || 'Schémas et listes')}</h3><div class="doccards">${docs}</div></section>` : ''}
    ${specs.length ? `<section class="eqh-sec"><h3>${icon('engrenage', { size: 16 })}Fiche technique</h3>
      <dl class="card specs-card">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>` : ''}`;
  // Vignettes chargées à l'approche de l'écran seulement (pages du manuel lourdes
  // à décoder). La première sert de sonde : si les pages du manuel ne sont pas
  // publiées avec cette version du site, toutes les vignettes s'effacent.
  const imgs = [...el.querySelectorAll('.sysx-thumb img')];
  const drop = (img) => { img.parentNode?.classList.add('none'); img.remove(); };
  const start = () => {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); e.target.src = e.target.dataset.src; }
    }, { rootMargin: '200px 0px' }) : null;
    for (const img of imgs.slice(1)) {
      img.addEventListener('error', () => drop(img));
      if (io) io.observe(img);
      else img.src = img.dataset.src;
    }
  };
  if (pagesOk.get(eq.id) === false) imgs.forEach(drop);
  else if (imgs.length) {
    const probe = imgs[0];
    probe.addEventListener('load', () => { if (pagesOk.get(eq.id) !== true) { pagesOk.set(eq.id, true); start(); } }, { once: true });
    probe.addEventListener('error', () => {
      if (pagesOk.get(eq.id) === true) { drop(probe); return; } // cette page seule manque
      pagesOk.set(eq.id, false);
      imgs.forEach(drop);
    }, { once: true });
    if (pagesOk.get(eq.id) === true) start();
    probe.src = probe.dataset.src;
  }
  el.appendChild(slot);
  return el;
}
