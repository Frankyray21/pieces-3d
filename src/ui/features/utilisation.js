// Manuel de l'utilisateur (manuel d'opération) : adresse « #<équipement>.utilisation ».
//
// Lecteur de pages : sommaire du PDF (signets, chapitres repliables), page affichée en image, page précédente /
// suivante (boutons, flèches du clavier, balayage sur téléphone), numéro de page à saisir, recherche plein texte
// sur toutes les pages (mots sans accents, extrait autour du premier mot trouvé).
//
// Données : public/equipment/<id>/utilisation.json (titre, édition, pages, sommaire ; ctx.equipmentData), texte des
// pages dans utilisation-texte.json (chargé à la première recherche), images dans utilisation/U001.webp…
// (tools/extract_utilisation.py). Sans utilisation.json, rien n'apparaît.
//
// Une autre fonction ouvre une page précise par ctx.emit('utilisation:page', n) puis ctx.go('utilisation').
import './utilisation.css';

const ID = 'utilisation';
const SITE = 'https://frankyray21.github.io/pieces-3d/';
/** Texte de recherche : minuscules sans accents. */
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");
/** Pages absentes de la publication allégée (Artifact) : « <id>/utilisation » vaut « * ». */
const ABSENT = (() => {
  try { return JSON.parse(document.getElementById('publication')?.textContent || 'null')?.pagesAbsentes || {}; } catch { return {}; }
})();

export default {
  id: ID,
  order: 70,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const textes = new Map(); // id d'équipement → Promise<string[]>
    let demande = null; // page demandée par une autre fonction
    const courante = new Map(); // id d'équipement → dernière page lue

    ctx.on('utilisation:page', (n) => { demande = Number(n) || null; });

    // --- carte en tête de la page de l'équipement
    const card = document.createElement('section');
    card.className = 'card-box ut-card';
    card.hidden = true;
    ctx.ui.equipmentHomeTop.appendChild(card);

    ctx.on('equipment', ({ id }) => {
      const man = ctx.equipmentData(ID, id);
      card.hidden = !man;
      if (!man) return;
      const chap = man.sommaire.filter(([niv]) => niv === 1);
      card.innerHTML = `
        <div class="ut-card-head">
          <div>
            <span class="ut-kicker">Manuel d'opération</span>
            <h3>${icon('page', { size: 18 })}${esc(man.titre)}${man.modele ? ` · ${esc(man.modele)}` : ''}</h3>
          </div>
          <button type="button" class="btn" data-go="${ID}">Ouvrir le manuel ${icon('droite', { size: 16 })}</button>
        </div>
        <p class="ut-card-sub">${man.pages} pages${man.edition ? ` · édition ${esc(man.edition)}` : ''} · sommaire, recherche dans le texte et pages du manuel.</p>
        <div class="ut-card-chaps">${chap.map(([, num, t, p]) => `<button type="button" class="chip" data-ut-page="${p}" title="Page ${p}">${esc(num)} ${esc(t)}</button>`).join('')}</div>`;
    });

    // Liens « page du manuel d'opération » (data-ut-page) depuis n'importe quelle fonction.
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ut-page]');
      if (!b || !ctx.equipmentData(ID)) return;
      e.preventDefault();
      demande = Number(b.dataset.utPage) || null;
      ctx.go(ID);
    });

    const texteDe = (eqId) => {
      if (!textes.has(eqId)) {
        textes.set(eqId, fetch(`equipment/${eqId}/utilisation-texte.json`).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        }).catch((err) => { textes.delete(eqId); throw err; }));
      }
      return textes.get(eqId);
    };

    // --- page plein écran
    ctx.registerRoute(ID, () => {
      const eq = ctx.equipment;
      const man = eq && ctx.equipmentData(ID, eq.id);
      if (!man) return;
      const absent = ABSENT[`${eq.id}/${ID}`] === '*';
      const n = man.pages;
      let page = demande || courante.get(eq.id) || man.sommaire[0]?.[3] || 1;
      demande = null;

      const el = document.createElement('div');
      el.className = 'ut';
      el.innerHTML = `
        <aside class="ut-side">
          <label class="ut-search">${icon('recherche', { size: 16 })}<input type="search" placeholder="Chercher dans le manuel…" aria-label="Chercher dans le texte du manuel" autocomplete="off"></label>
          <p class="ut-count" aria-live="polite"></p>
          <nav class="ut-toc" aria-label="Sommaire">${toc(man)}</nav>
          <ol class="ut-results" hidden></ol>
        </aside>
        <section class="ut-view" aria-label="Page du manuel">
          <div class="ut-bar">
            <button type="button" class="btn ut-prev" title="Page précédente (←)" aria-label="Page précédente">${icon('gauche', { size: 16 })}</button>
            <label class="ut-num">Page <input type="number" min="1" max="${n}" step="1" inputmode="numeric" aria-label="Numéro de page"> / ${n}</label>
            <button type="button" class="btn ut-next" title="Page suivante (→)" aria-label="Page suivante">${icon('droite', { size: 16 })}</button>
            <span class="ut-where"></span>
          </div>
          <figure class="ut-fig"></figure>
          <p class="ut-meta">${esc(man.titre)}${man.modele ? ` · ${esc(man.modele)}` : ''}${man.edition ? ` · ${esc(man.edition)}` : ''}. ${esc(man.note || '')}${man.source ? ` <a href="${esc(man.source)}" target="_blank" rel="noopener">PDF d'origine</a>.` : ''}</p>
        </section>`;
      const $ = (s) => el.querySelector(s);
      const fig = $('.ut-fig');
      const num = $('.ut-num input');
      const where = $('.ut-where');

      /** Index dans le sommaire de la section qui contient la page (dernière entrée qui commence avant elle), ou -1. */
      const sectionIndex = (p) => {
        let best = -1;
        man.sommaire.forEach((e, i) => { if (e[3] <= p && (best < 0 || e[3] >= man.sommaire[best][3])) best = i; });
        return best;
      };
      const section = (p) => man.sommaire[sectionIndex(p)] || null;
      /** Numéro et titre d'une entrée (sans espace en tête quand l'entrée n'a pas de numéro). */
      const nomSection = (e) => (e ? [e[1], e[2]].filter(Boolean).join(' ') : '');
      /**
       * Barre collante : la figure doit commencer juste sous elle. La cible est la place de la barre une fois collée
       * (haut de .wp-body + retrait), pas sa place actuelle : sur téléphone, la barre n'est pas encore collée quand on
       * touche le sommaire. toujours : amener la figure sous la barre même si elle est plus bas (sommaire, recherche).
       */
      const sousLaBarre = (toujours = false) => {
        const wb = el.closest('.wp-body');
        if (!wb) return;
        const cible = wb.getBoundingClientRect().top + parseFloat(getComputedStyle(wb).paddingTop || 0) + $('.ut-bar').offsetHeight + 8;
        const dy = cible - fig.getBoundingClientRect().top;
        if (dy > 0 || toujours) wb.scrollTop -= dy;
      };

      // ouvrir : le chapitre de la page s'ouvre dans le sommaire, les autres se replient (navigation par page).
      const show = (p, { focus = false, ouvrir = true } = {}) => {
        page = Math.min(n, Math.max(1, Math.round(Number(p)) || 1));
        courante.set(eq.id, page);
        num.value = page;
        $('.ut-prev').disabled = page <= 1;
        $('.ut-next').disabled = page >= n;
        const si = sectionIndex(page);
        const s = man.sommaire[si] || null;
        where.textContent = nomSection(s);
        if (absent) {
          const full = location.href.startsWith(SITE) ? '' : ` <a href="${SITE}${esc(location.hash)}" target="_blank" rel="noopener">Voir la version complète du site</a>.`;
          fig.innerHTML = `<p class="missing">Les pages de ce manuel ne sont pas incluses dans cette version du site.${full}</p>`;
        } else {
          const src = `equipment/${eq.id}/${man.image.replace('{n}', String(page).padStart(3, '0'))}`;
          fig.innerHTML = `<img src="${esc(src)}" alt="Page ${page} du manuel de l'utilisateur${s ? ` : ${esc(s[2])}` : ''}" decoding="async">`;
          // Page suivante préchargée : la lecture page à page reste fluide.
          if (page < n) new Image().src = `equipment/${eq.id}/${man.image.replace('{n}', String(page + 1).padStart(3, '0'))}`;
        }
        el.querySelectorAll('.ut-toc [data-i]').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === si));
        const on = el.querySelector('.ut-toc .on');
        if (on && ouvrir) {
          const det = on.closest('details');
          el.querySelectorAll('.ut-toc details[open]').forEach((d) => { if (d !== det) d.open = false; });
          if (det) det.open = true;
        }
        if (on && focus) on.scrollIntoView({ block: 'nearest' });
        // Page changée plus bas dans la page : revenir en haut de la visionneuse (sous la barre, pas derrière).
        sousLaBarre();
      };

      $('.ut-prev').addEventListener('click', () => show(page - 1));
      $('.ut-next').addEventListener('click', () => show(page + 1));
      num.addEventListener('change', () => show(num.value === '' ? page : Number(num.value)));
      // Boutons précédent / suivant à jour dès la saisie : Tab depuis le champ va au bouton voisin, pas en bas de page.
      num.addEventListener('input', () => {
        const v = Math.round(Number(num.value));
        if (!num.value || Number.isNaN(v)) return;
        $('.ut-prev').disabled = v <= 1;
        $('.ut-next').disabled = v >= n;
      });
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-p]');
        if (!b) return;
        e.preventDefault();
        // Titre d'un chapitre (summary) : il ouvre le chapitre et sa première page ; touché de nouveau alors qu'il est
        // ouvert, il se replie.
        if (b.tagName === 'SUMMARY') {
          const det = b.parentElement;
          if (det.open) { det.open = false; return; }
          el.querySelectorAll('.ut-toc details[open]').forEach((d) => { d.open = false; });
          det.open = true;
          show(Number(b.dataset.p), { ouvrir: false });
        } else show(Number(b.dataset.p));
        if (ctx.narrow()) sousLaBarre(true);
      });
      // Flèches ← → : page précédente / suivante, dès l'ouverture (écouteur du document, retiré quand la page se ferme).
      const fleches = (e) => {
        if (!el.isConnected) { document.removeEventListener('keydown', fleches); return; }
        if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
        if (e.key === 'ArrowLeft') { show(page - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { show(page + 1); e.preventDefault(); }
      };
      document.addEventListener('keydown', fleches);
      // Balayage horizontal sur la page (téléphone) ; un geste surtout vertical (défilement) ne tourne pas la page.
      let x0 = null;
      let y0 = null;
      fig.addEventListener('touchstart', (e) => {
        const one = e.touches.length === 1;
        x0 = one ? e.touches[0].clientX : null;
        y0 = one ? e.touches[0].clientY : null;
      }, { passive: true });
      fig.addEventListener('touchcancel', () => { x0 = null; });
      fig.addEventListener('touchend', (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        const dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (window.visualViewport && window.visualViewport.scale > 1.05) return; // page zoomée : on se déplace
        if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) show(page + (dx < 0 ? 1 : -1));
      });

      // --- recherche plein texte
      const input = $('.ut-search input');
      const results = $('.ut-results');
      const count = $('.ut-count');
      let tour = 0;
      const chercher = async () => {
        const q = norm(input.value).trim();
        const t = ++tour;
        const mots = q.split(/\s+/).filter((m) => m.length > 1);
        $('.ut-toc').hidden = !!mots.length;
        results.hidden = !mots.length;
        if (!mots.length) { count.textContent = ''; results.innerHTML = ''; return; }
        let pages;
        try { pages = await texteDe(eq.id); } catch {
          count.textContent = 'Texte du manuel non disponible.';
          return;
        }
        if (t !== tour) return;
        const trouve = [];
        pages.forEach((txt, i) => {
          const nt = norm(txt);
          if (mots.every((m) => nt.includes(m))) trouve.push({ p: i + 1, txt, at: nt.indexOf(mots[0]) });
        });
        const MAX = 120;
        count.textContent = !trouve.length ? 'Aucune page ne contient ces mots.'
          : `${trouve.length} page${trouve.length > 1 ? 's' : ''}${trouve.length > MAX ? ` (${MAX} premières affichées : précisez la recherche)` : ''}`;
        results.innerHTML = trouve.slice(0, MAX).map(({ p, txt, at }) => {
          const s = section(p);
          const a = Math.max(0, at - 60);
          const brut = txt.slice(a, at + 140);
          // Mots trouvés surlignés : repérés sur le texte brut sans accents (même longueur, caractère par caractère),
          // puis chaque morceau échappé à part (une apostrophe ou un chiffre ne coupe pas une entité HTML).
          const nex = norm(brut);
          const marks = [];
          for (const m of mots) { let k = nex.indexOf(m); while (k >= 0) { marks.push([k, k + m.length]); k = nex.indexOf(m, k + m.length); } }
          marks.sort((x, y) => x[0] - y[0]);
          let out = '';
          let k = 0;
          for (const [d, f] of marks) { if (d < k) continue; out += `${esc(brut.slice(k, d))}<mark>${esc(brut.slice(d, f))}</mark>`; k = f; }
          out += esc(brut.slice(k));
          out = `${a ? '…' : ''}${out}${at + 140 < txt.length ? '…' : ''}`;
          return `<li><button type="button" data-p="${p}"><span class="mono">p. ${p}</span>${s ? `<b>${esc(nomSection(s))}</b>` : ''}<span class="ut-ex">${out}</span></button></li>`;
        }).join('');
      };
      let timer = 0;
      input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(chercher, 160); });
      input.addEventListener('focus', () => { texteDe(eq.id).catch(() => {}); }, { once: true });

      document.title = `Manuel d'opération · ${eq.name} · Pièces 3D`;
      ctx.ui.showPage(`${man.titre} — ${eq.name}`, el, { icon: 'page', repli: 'apercu' });
      show(page, { focus: true });
    });

    /**
     * Sommaire : un bloc repliable par chapitre (le titre du chapitre est le <summary> lui-même : un seul arrêt de
     * tabulation), sections et sous-sections en retrait. data-i : index de l'entrée dans man.sommaire.
     */
    function toc(man) {
      const out = [];
      let open = false;
      const corps = ([, num, t, p]) => `<span class="ut-tn">${esc(num)}</span><span class="ut-tt">${esc(t)}</span><span class="ut-tp">${p}</span>`;
      man.sommaire.forEach((e, i) => {
        const [niv, num, , p] = e;
        if (niv === 1) {
          if (open) out.push('</div></details>');
          out.push(`<details><summary class="ut-t n1" data-p="${p}" data-i="${i}" data-num="${esc(num)}">${corps(e)}</summary><div class="ut-sub">`);
          open = true;
        } else out.push(`<button type="button" class="ut-t n${Math.min(niv, 4)}" data-p="${p}" data-i="${i}" data-num="${esc(num)}">${corps(e)}</button>`);
      });
      if (open) out.push('</div></details>');
      return out.join('');
    }
  },
};
