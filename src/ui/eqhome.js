// Page d'un équipement (adresse « #<équipement>.apercu ») : machine → systèmes.
// Données clés en gros chiffres, une carte par système (bandeau de couleur et
// icône), schémas et listes, fiche technique, puis l'emplacement des fonctions
// (ctx.ui.equipmentHome).

import { icon } from './icons.js';
import { systems } from './systems.js';
import { esc } from './host.js';

/** Assemblages sous id (compris), en profondeur. */
function subtree(eq, id, out = new Set()) {
  if (out.has(id) || !eq.assemblies.has(id)) return out;
  out.add(id);
  for (const c of eq.assemblies.get(id).children) subtree(eq, c, out);
  return out;
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
  const cards = sys.map((s) => {
    const a = eq.assemblies.get(s.id);
    const ids = subtree(eq, s.id);
    const lines = [...ids].reduce((n, id) => n + eq.assemblies.get(id).parts.length, 0);
    const sub = ids.size - 1;
    return `<button type="button" class="syscard" data-go="${esc(s.id)}" style="--sys:${s.color}">
      <span class="sys-ico">${icon(s.icon, { size: 22 })}</span>
      <span class="sys-body"><strong>${esc(s.title)}</strong>
        <span class="sys-meta"><span class="mono">${esc(badge(a.sheet))}</span>${sub ? ` · ${sub} sous-ensemble${sub > 1 ? 's' : ''}` : ''} · ${lines} ligne${lines > 1 ? 's' : ''}</span></span>
      ${has3d(s.id) ? '<span class="tag3d">3D</span>' : ''}
      ${icon('droite', { size: 18, cls: 'chev' })}
    </button>`;
  }).join('');
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
    ${sys.length ? `<section class="eqh-sec"><h3>${icon('cle', { size: 16 })}Systèmes</h3><div class="syscards">${cards}</div></section>` : ''}
    ${docs ? `<section class="eqh-sec"><h3>${icon('liste', { size: 16 })}${esc(eq.labels?.documents || 'Schémas et listes')}</h3><div class="doccards">${docs}</div></section>` : ''}
    ${specs.length ? `<section class="eqh-sec"><h3>${icon('engrenage', { size: 16 })}Fiche technique</h3>
      <dl class="card specs-card">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>` : ''}`;
  el.appendChild(slot);
  return el;
}
