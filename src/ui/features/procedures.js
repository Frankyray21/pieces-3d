// Procédures d'assemblage pas à pas (public/equipment/<id>/procedures.json).
//
// Une procédure suit un assemblage 3D du manuel : chaque étape reprend une page
// (ou une liste) du manuel et pose ses pièces dans l'ordre donné. Lecteur :
// barre en bas de la scène (étape n/N, Précédent, Suivant, Lecture auto,
// progression) et panneau latéral (texte de l'étape, pièces avec numéros et
// quantités, vignette de la page). À chaque étape, les pièces déjà posées
// restent en place, celles de l'étape arrivent depuis leur position éclatée
// (mouvement amorti), les suivantes sont cachées. En sortant, le modèle est
// rétabli (tout visible, assemblé, rien de mis en évidence).
//
// Les procédures sont chargées avec l'équipement qui les déclare (ctx.equipmentData) :
// pas de requête, donc pas d'erreur 404 pour un équipement qui n'en a pas.
// Un clic sur une pièce pendant la procédure la sélectionne : sa fiche se pose
// par-dessus les détails de l'étape, qui reviennent quand elle se ferme. Une
// pièce d'une étape suivante (sélectionnée par la liste ou la recherche) fait
// passer à son étape, pour qu'elle soit visible. Échap (après la fiche et la
// sélection) quitte la procédure.
//
// Deux sortes de procédures (champ « kind » de procedures.json) : « montage »,
// étapes données par le manuel ; « listes », parcours des listes du manuel
// (pas un ordre de montage).
import './procedures.css';

const ARRIVE = 900; // durée du mouvement d'une pièce (ms)
const PAUSE = 2400; // lecture auto : pause après la pose d'une étape (ms)
const FAR = 1.25; // départ : position éclatée × FAR
const RM = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
// Icônes des commandes de la barre (seules visibles sur un téléphone à l'horizontale, où la barre tient sur une rangée).
const PLAY = '<svg class="ico-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z"/></svg>';
const REPLAY = '<svg class="ico-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>';
/** Libellé de la sorte de procédure. */
const KIND = { montage: 'Montage d’après le manuel', listes: 'Parcours des listes du manuel (pas un ordre de montage)' };

export default {
  id: 'procedures',
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const list = () => ctx.equipmentData('procedures')?.procedures || [];
    const forAsm = (id) => list().find((p) => p.assembly === id) || null;

    // ------------------------------------------------------------ données
    /** Ligne de liste d'un chemin de repères (on suit les liens vers les sous-assemblages). */
    const rowAt = (asmId, path) => {
      let id = asmId, row = null;
      for (const ref of path) {
        const asm = id && ctx.equipment.assemblies.get(id);
        if (!asm) return null;
        row = asm.parts.find((r) => r.ref === ref);
        if (!row) return null;
        id = row.link;
      }
      return row;
    };
    const pageLabel = (st) => (st.page ? `page ${st.page}` : ctx.sheetTitle(st.sheet));

    // ------------------------------------------------------------ état du lecteur
    let run = null; // { proc, n, prep: { steps, stepOf, extras, managed, wasVisible }, timer, focus, model }
    let pending = null; // procédure à lancer à l'ouverture de son assemblage

    // Barre de commande, posée sur la scène.
    const stage = ctx.ui.stage;
    /** Une couche recouvre la scène : visionneuse des pages, page plein écran, recherche. */
    const covered = () => !document.getElementById('modal')?.hidden || document.body.classList.contains('page-open')
      || document.body.classList.contains('rch-full') || !!document.querySelector('.rch-pop:not([hidden])');
    const bar = document.createElement('div');
    bar.className = 'proc-bar';
    bar.hidden = true;
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Procédure pas à pas');
    bar.innerHTML = `
      <div class="proc-bar-row">
        <button type="button" class="tbtn proc-prev" title="Étape précédente" aria-label="Étape précédente">${icon('gauche', { size: 16 })}</button>
        <div class="proc-bar-mid">
          <span class="proc-num" aria-live="polite"></span>
          <span class="proc-bar-title"></span>
        </div>
        <button type="button" class="tbtn proc-next" title="Étape suivante" aria-label="Étape suivante">${icon('droite', { size: 16 })}</button>
      </div>
      <div class="proc-progress"><div class="proc-segs" role="group" aria-label="Étapes de la procédure"></div></div>
      <div class="proc-bar-row proc-bar-actions">
        <button type="button" class="tbtn proc-play" aria-pressed="false" title="Lecture automatique des étapes">${PLAY}<span>Lecture auto</span></button>
        <button type="button" class="tbtn proc-replay" title="Rejouer la pose de cette étape">${REPLAY}<span>Rejouer</span></button>
        <button type="button" class="tbtn proc-details" aria-pressed="false" title="Texte, pièces et page du manuel">${icon('liste', { size: 14 })}<span>Détails</span></button>
        <button type="button" class="tbtn proc-quit" title="Quitter la procédure (modèle rétabli)">${icon('fermer', { size: 14 })}<span>Quitter</span></button>
      </div>`;
    stage.appendChild(bar);
    const $b = (s) => bar.querySelector(s);
    // Hauteur de la barre : le panneau latéral (téléphone) et les messages brefs (hors de la scène) se posent au-dessus.
    // Barre masquée (pas de procédure, ou scène cachée sous l'onglet « Pièces » du téléphone) : la dernière hauteur est
    // gardée, pour que le volet et le cadrage soient justes dès que la scène réapparaît.
    new ResizeObserver(() => {
      if (!bar.offsetHeight) return;
      stage.style.setProperty('--proc-bar-h', `${bar.offsetHeight + 16}px`);
      document.documentElement.style.setProperty('--proc-bar-h', `${bar.offsetHeight + 16}px`);
    }).observe(bar);

    // ------------------------------------------------------------ 3D (API publique du visualiseur : ctx.viewer)
    /** Prépare le modèle : objets de chaque étape, conteneurs, objets hors procédure (posés à la fin). */
    const prepare = (proc) => {
      const root = ctx.viewer.model.root;
      const steps = proc.steps.map((st) => ({ objs: ctx.viewer.objects(st.parts), paths: st.parts }));
      const stepOf = new Map();
      steps.forEach((s, i) => s.objs.forEach((o) => { if (!stepOf.has(o)) stepOf.set(o, i); }));
      const containers = new Set();
      for (const o of stepOf.keys()) for (let a = o.parent; a && a !== root; a = a.parent) containers.add(a);
      // Objets hors étapes : pièces non citées et ajouts du modèle (câble, décor) ; affichés à la dernière étape.
      const extras = [];
      const visit = (node) => {
        for (const c of node.children) {
          if (c.isCSS2DObject || stepOf.has(c)) continue;
          if (containers.has(c)) visit(c);
          else extras.push(c);
        }
      };
      visit(root);
      const managed = [...stepOf.keys(), ...extras];
      return { steps, stepOf, extras, managed, wasVisible: new Map(managed.map((o) => [o, o.visible])) };
    };

    /** Affiche l'étape n : posées avant, arrivée animée de l'étape, cachées après. */
    const show = (n, { animate = true } = {}) => {
      if (!run) return 0;
      ctx.viewer.settleParts();
      const last = run.proc.steps.length - 1;
      run.n = Math.max(0, Math.min(last, n));
      const shown = [], hidden = [];
      for (const [o, i] of run.prep.stepOf) (i <= run.n ? shown : hidden).push(o);
      for (const o of run.prep.extras) (run.n === last && run.prep.wasVisible.get(o) ? shown : hidden).push(o);
      ctx.viewer.showParts(shown, true);
      ctx.viewer.showParts(hidden, false);
      const fresh = run.prep.steps[run.n].objs;
      const total = animate && !RM.matches && fresh.length ? ctx.viewer.arriveParts(fresh, { far: FAR, duration: ARRIVE }) : 0;
      mark();
      render();
      if (ctx.ui.sidePanel.owner === 'procedures') ctx.ui.sidePanel.body.scrollTop = 0;
      return total;
    };

    /** Met en évidence les pièces de l'étape (ou la pièce choisie dans la liste). */
    const mark = () => {
      if (!run) return;
      const st = run.proc.steps[run.n];
      if (run.focus) { ctx.viewer.highlight([run.focus]); ctx.viewer.frame([run.focus]); }
      else ctx.viewer.highlight(st.parts);
    };

    // ------------------------------------------------------------ lecture auto
    const stopPlay = () => {
      if (!run) return;
      clearTimeout(run.timer);
      run.timer = null;
      $b('.proc-play').setAttribute('aria-pressed', 'false');
      $b('.proc-play span').textContent = 'Lecture auto';
    };
    const playNext = () => {
      if (!run) return;
      const last = run.proc.steps.length - 1;
      // Une couche recouvre la scène (visionneuse, page plein écran, recherche) : les étapes défileraient sans être
      // vues ; la lecture s'arrête (« Lecture auto » la reprend).
      if (run.n >= last || covered()) { stopPlay(); return; }
      run.focus = null;
      const ms = show(run.n + 1);
      run.timer = setTimeout(playNext, ms + PAUSE);
    };
    const togglePlay = () => {
      if (!run) return;
      if (run.timer) { stopPlay(); return; }
      $b('.proc-play').setAttribute('aria-pressed', 'true');
      $b('.proc-play span').textContent = 'Pause';
      run.focus = null;
      if (run.n >= run.proc.steps.length - 1) {
        const ms = show(0);
        run.timer = setTimeout(playNext, ms + PAUSE);
      } else playNext();
    };
    const go = (n, opts) => { if (!run) return; stopPlay(); run.focus = null; show(n, opts); };

    /** Étape où l'objet (ou ses pièces) devient visible : -1 s'il l'est déjà à toutes les étapes. */
    const stepNeeded = (o) => {
      const { stepOf, extras } = run.prep;
      const last = run.proc.steps.length - 1;
      for (let a = o; a; a = a.parent) {
        if (stepOf.has(a)) return stepOf.get(a);
        if (extras.includes(a)) return last;
      }
      let need = -1;
      o.traverse((c) => { if (stepOf.has(c)) need = Math.max(need, stepOf.get(c)); else if (extras.includes(c)) need = last; });
      return need;
    };

    // ------------------------------------------------------------ panneau latéral
    const panelBody = document.createElement('div');
    panelBody.className = 'proc-panel';

    const qtyText = (row) => {
      if (!row) return '—';
      if (row.qty == null) return '—';
      return row.qty3d != null && row.qty3d !== row.qty ? `${row.qty}<small class="proc-q3d">${row.qty3d} en 3D</small>` : String(row.qty);
    };

    const renderPanel = () => {
      if (!run) return;
      const { proc, n } = run;
      const st = proc.steps[n];
      const asmId = proc.assembly;
      const rows = st.parts.map((p) => {
        const path = p.split('>');
        const row = rowAt(asmId, path);
        const shown = ctx.viewer.objects(p).length > 0;
        return { p, path, row, shown };
      });
      const thumb = ctx.pageUrl(st.sheet);
      panelBody.innerHTML = `
        <p class="proc-kicker">${esc(proc.title)}${KIND[proc.kind] ? ` · ${esc(KIND[proc.kind])}` : ''}</p>
        ${n === 0 ? `<p class="proc-intro">${esc(proc.intro || '')}</p>` : ''}
        <h3 class="proc-step-title"><span class="proc-badge">${n + 1}</span>${esc(st.title)}</h3>
        ${st.label ? `<p class="proc-label">${esc(st.label)} · ${esc(pageLabel(st))}</p>` : `<p class="proc-label">${esc(pageLabel(st))}</p>`}
        <p class="proc-text">${esc(st.text)}</p>
        <h4 class="proc-h">Pièces de l'étape <span>(${rows.length})</span></h4>
        <table class="proc-parts">
          <thead><tr><th>Rep.</th><th>Numéro</th><th>Qté</th><th>Désignation</th></tr></thead>
          <tbody>${rows.map(({ p, path, row, shown }) => `
            <tr data-path="${esc(p)}" class="${run.focus === p ? 'is-on' : ''}${shown ? '' : ' no3d'}" tabindex="0"
              title="${shown ? 'Mettre en évidence cette pièce' : 'Pièce non dessinée en 3D'}">
              <td class="mono proc-ref">${path.slice(0, -1).map((r) => `<small>${esc(r.split('#')[0])}›</small>`).join('')}${esc(path.at(-1).split('#')[0])}</td>
              <td class="mono">${esc(row?.pn || '—')}</td>
              <td>${qtyText(row)}</td>
              <td>${esc(row?.desc || '')}${row?.group ? ` <small>(ensemble : repères ${esc(row.group[0])} à ${esc(row.group.at(-1))})</small>` : ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        ${thumb ? `
        <h4 class="proc-h">Page du manuel</h4>
        <button type="button" class="proc-thumb" data-page="${esc(st.sheet)}" title="Ouvrir la page dans la visionneuse">
          <img src="${esc(thumb)}" alt="${esc(ctx.sheetTitle(st.sheet))}" loading="lazy">
          <span>${esc(ctx.sheetTitle(st.sheet) || st.sheet)}</span>
        </button>` : ''}
        <p class="proc-foot"><button type="button" class="btn proc-quit2">${icon('fermer', { size: 14 })} Quitter la procédure</button></p>`;
    };

    panelBody.addEventListener('click', (e) => {
      if (e.target.closest('.proc-quit2')) { stop(); return; }
      const tr = e.target.closest('tr[data-path]');
      if (tr && run) pick(tr.dataset.path);
    });
    // Page absente (version publiée sans les pages du manuel) : la vignette laisse place à un mot.
    panelBody.addEventListener('error', (e) => {
      const img = e.target;
      if (img.tagName !== 'IMG') return;
      const span = document.createElement('span');
      span.className = 'proc-nopage';
      span.textContent = 'Image de la page absente de cette version du site.';
      img.replaceWith(span);
    }, true);
    panelBody.addEventListener('keydown', (e) => {
      const tr = e.target.closest('tr[data-path]');
      if (tr && run && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(tr.dataset.path); }
    });
    const pick = (p) => {
      run.focus = run.focus === p ? null : p;
      if (!run.focus) ctx.viewer.frame();
      mark();
      renderPanel();
    };

    const openPanel = () => {
      renderPanel();
      ctx.ui.sidePanel.open({ title: 'Procédure', content: panelBody, owner: 'procedures', icon: 'cle' });
    };

    // ------------------------------------------------------------ rendu de la barre
    const render = () => {
      if (!run) return;
      const { proc, n } = run;
      const N = proc.steps.length, st = proc.steps[n];
      $b('.proc-num').textContent = `Étape ${n + 1} / ${N}`;
      $b('.proc-bar-title').textContent = st.title;
      $b('.proc-prev').disabled = n === 0;
      $b('.proc-next').disabled = n === N - 1;
      $b('.proc-segs').innerHTML = proc.steps.map((s, i) => `<button type="button" class="proc-seg${i < n ? ' done' : ''}${i === n ? ' cur' : ''}" data-i="${i}" title="Étape ${i + 1} : ${esc(s.title)}" aria-label="Étape ${i + 1} : ${esc(s.title)}"${i === n ? ' aria-current="step"' : ''}></button>`).join('');
      if (ctx.ui.sidePanel.has('procedures')) renderPanel(); // aussi sous la fiche d'une pièce
    };

    $b('.proc-prev').addEventListener('click', () => go(run.n - 1));
    $b('.proc-next').addEventListener('click', () => go(run.n + 1));
    $b('.proc-replay').addEventListener('click', () => go(run.n));
    $b('.proc-play').addEventListener('click', togglePlay);
    $b('.proc-quit').addEventListener('click', () => stop());
    $b('.proc-details').addEventListener('click', () => {
      if (ctx.ui.sidePanel.owner === 'procedures') ctx.ui.sidePanel.close();
      else openPanel();
      // Scène étroite : le volet bas couvre la moitié de la scène ; le modèle est recadré dans le reste.
      if (ctx.compact()) requestAnimationFrame(() => { if (run) ctx.viewer.frame(); });
    });
    $b('.proc-segs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) go(Number(b.dataset.i));
    });
    // Flèches du clavier pendant la procédure (hors champs de saisie).
    // Une couche recouvre la scène (visionneuse, page plein écran, recherche) : les flèches lui reviennent.
    // Une page plein écran qui s'ouvre arrête aussi la lecture automatique.
    ctx.on('page', ({ open }) => { if (open) stopPlay(); });
    document.addEventListener('keydown', (e) => {
      if (!run || e.altKey || e.ctrlKey || e.metaKey || covered()) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' && run.n < run.proc.steps.length - 1) { e.preventDefault(); go(run.n + 1); }
      if (e.key === 'ArrowLeft' && run.n > 0) { e.preventDefault(); go(run.n - 1); }
    });

    // Échap : sous la fiche (60) et la sélection (40), quitte la procédure.
    ctx.ui.onEscape(() => { if (!run) return false; stop(); return true; }, 30);

    // Pièce sélectionnée (liste, recherche, fiche) qui n'est pas encore posée : on passe à son étape.
    ctx.on('select', ({ objects }) => {
      if (!run || !objects?.length || ctx.viewer.model !== run.model) return;
      let need = -1;
      for (const o of objects) need = Math.max(need, stepNeeded(o));
      if (need > run.n) {
        go(need, { animate: false });
        ctx.toast(`Pièce posée à l’étape ${need + 1} : la procédure passe à cette étape.`);
      }
    });

    // ------------------------------------------------------------ début et fin
    const start = (proc) => {
      if (!ctx.viewer.is3d || !ctx.viewer.model) return;
      if (run) stop({ quiet: true });
      // Pièce sélectionnée avant : désélectionnée (elle pourrait être cachée à l'étape 1).
      if (ctx.selection) ctx.viewer.select(null);
      // Modèle assemblé tout de suite, sans animation d'éclatement en cours (curseur et liste suivent).
      ctx.viewer.assemble({ animate: false });
      run = { proc, n: 0, prep: prepare(proc), timer: null, focus: null, model: ctx.viewer.model };
      stage.classList.add('proc-on');
      bar.hidden = false;
      // Cadrage au-dessus de la barre (et hors du panneau latéral, pris en compte par le socle). Barre posée en colonne
      // à droite (téléphone à l'horizontale) : c'est le côté droit qui est dégagé, le modèle garde toute la hauteur.
      ctx.ui.setInsets('procedures', (vp) => {
        const r = bar.getBoundingClientRect();
        if (bar.hidden || !r.width) return null;
        return r.left > vp.left + vp.width / 2 ? { right: vp.right - r.left + 8 } : { bottom: vp.bottom - r.top + 8 };
      });
      tool.setAttribute('aria-pressed', 'true');
      // Le panneau passe à la procédure : les autres modes (circuits, entretien…) s'arrêtent.
      // Scène étroite (téléphone, tablette) : il couvrirait la scène ; replié, les détails s'ouvrent par « Détails ».
      if (!ctx.compact()) openPanel();
      else ctx.ui.sidePanel.closeAll();
      show(0);
      ctx.viewer.frame();
      ctx.emit('procedures:started', { id: proc.id, assembly: proc.assembly });
    };

    /** Sortie : modèle rétabli (tout visible, assemblé, rien de mis en évidence). */
    const stop = ({ quiet = false, gone = false } = {}) => {
      if (!run) return;
      stopPlay();
      const r = run;
      run = null;
      ctx.ui.setInsets('procedures', null);
      if (!gone) {
        ctx.viewer.restoreParts(); // visibilités d'origine, arrivées en cours posées
        ctx.viewer.clear();
        if (!quiet) ctx.viewer.frame();
      }
      stage.classList.remove('proc-on');
      bar.hidden = true;
      tool.setAttribute('aria-pressed', 'false');
      ctx.ui.sidePanel.release('procedures');
      ctx.emit('procedures:stopped', { id: r.proc.id });
    };

    /** Lance une procédure : ouvre d'abord son assemblage si besoin. */
    const launch = (proc) => {
      const here = ctx.view?.type === 'assembly' && ctx.view.id === proc.assembly && ctx.viewer.is3d;
      // Page plein écran ouverte (page de l'équipement) : on va à l'assemblage, ce qui ferme la page ;
      // la vue (même déjà affichée dessous) émet « assembly » et la procédure démarre.
      if (here && !document.body.classList.contains('page-open')) { start(proc); return; }
      pending = proc;
      ctx.go(proc.assembly);
    };

    // ------------------------------------------------------------ liste des procédures (panneau)
    const listBody = document.createElement('div');
    listBody.className = 'proc-panel';
    const renderList = () => {
      const here = ctx.view?.type === 'assembly' ? ctx.view.id : null;
      const procs = [...list()].sort((a, b) => (b.assembly === here) - (a.assembly === here));
      listBody.innerHTML = procs.length ? `
        <p class="proc-intro">Pas à pas en 3D, d'après les pages du manuel : les pièces posées restent en place, celles de l'étape arrivent depuis la vue éclatée. « Montage » : étapes données par le manuel ; « Parcours des listes » : ordre des listes, pas un ordre de montage.</p>
        <ul class="proc-cards">${procs.map((p) => `
          <li><button type="button" class="proc-card" data-id="${esc(p.id)}">
            <span class="proc-card-t">${esc(p.title)}</span>
            ${KIND[p.kind] ? `<span class="proc-kind proc-kind-${esc(p.kind)}">${esc(KIND[p.kind])}</span>` : ''}
            <span class="proc-card-s">${esc(p.summary || '')}</span>
            <span class="proc-card-m">${p.steps.length} étapes · ${esc(ctx.equipment.assemblies.get(p.assembly)?.titleFr || p.assembly)}${p.assembly === here ? ' · <b>vue affichée</b>' : ''}</span>
          </button></li>`).join('')}
        </ul>` : '<p class="proc-intro">Aucune procédure pour cet équipement.</p>';
    };
    listBody.addEventListener('click', (e) => {
      const b = e.target.closest('.proc-card');
      const proc = b && list().find((p) => p.id === b.dataset.id);
      if (proc) launch(proc);
    });

    // ------------------------------------------------------------ outil de la barre
    const tool = ctx.ui.addTool({
      id: 'btn-procedures',
      label: 'Procédures',
      icon: 'cle',
      title: 'Procédures d\'assemblage pas à pas',
      pressed: false,
      onClick: () => {
        if (run) { stop(); return; }
        const here = ctx.view?.type === 'assembly' ? forAsm(ctx.view.id) : null;
        if (here && ctx.viewer.is3d && !ctx.view.home) { start(here); return; }
        if (ctx.ui.sidePanel.owner === 'procedures-list') { ctx.ui.sidePanel.close(); return; }
        // La liste prend le panneau : la pièce sélectionnée (et sa fiche) est relâchée.
        if (ctx.selection) ctx.viewer.select(null);
        renderList();
        ctx.ui.sidePanel.open({ title: 'Procédures', content: listBody, owner: 'procedures-list', icon: 'cle' });
      },
    });
    tool.hidden = true;

    ctx.on('sidepanel', ({ open, owner, over }) => {
      if (owner === 'procedures') $b('.proc-details').setAttribute('aria-pressed', String(open));
      // Un autre mode prend le panneau (circuits, entretien, sous-ensemble isolé) : la procédure s'arrête.
      // La fiche d'une pièce (over) se pose par-dessus sans l'arrêter.
      if (open && run && !over && owner !== 'procedures' && owner !== 'procedures-list') stop();
    });

    // ------------------------------------------------------------ carte de la page d'équipement
    const card = document.createElement('section');
    card.className = 'card-box proc-home';
    card.hidden = true;
    ctx.ui.equipmentHome.appendChild(card);
    card.addEventListener('click', (e) => {
      const b = e.target.closest('[data-proc]');
      const proc = b && list().find((p) => p.id === b.dataset.proc);
      if (proc) launch(proc);
    });

    ctx.on('equipment', () => {
      if (run) stop({ gone: true });
      pending = null;
      const procs = list();
      tool.hidden = !procs.length;
      card.hidden = !procs.length;
      if (!procs.length) { card.replaceChildren(); return; }
      card.innerHTML = `
        <h3 class="proc-home-h">${icon('cle', { size: 18 })} Procédures d'assemblage</h3>
        <p class="proc-home-p">Pas à pas en 3D, d'après les pages du manuel : texte de chaque étape, pièces avec numéros et quantités, vignette de la page. « Montage » : étapes données par le manuel ; « Parcours des listes » : ordre des listes du manuel, pas un ordre de montage.</p>
        <ul class="proc-cards">${procs.map((p) => `
          <li><button type="button" class="proc-card" data-proc="${esc(p.id)}">
            <span class="proc-card-t">${esc(p.title)}</span>
            ${KIND[p.kind] ? `<span class="proc-kind proc-kind-${esc(p.kind)}">${esc(KIND[p.kind])}</span>` : ''}
            <span class="proc-card-s">${esc(p.summary || '')}</span>
            <span class="proc-card-m">${p.steps.length} étapes · ${esc(ctx.equipment.assemblies.get(p.assembly)?.titleFr || p.assembly)}</span>
          </button></li>`).join('')}
        </ul>`;
    });

    // ------------------------------------------------------------ changements de vue
    ctx.on('assembly', ({ id, is3d, home }) => {
      // Nouveau modèle (ou dessins du manuel) : la procédure en cours n'a plus d'objet.
      if (run && (run.proc.assembly !== id || ctx.viewer.model !== run.model)) stop({ gone: ctx.viewer.model !== run.model, quiet: true });
      tool.hidden = !list().length;
      if (pending && pending.assembly === id && is3d && !home) {
        const p = pending;
        pending = null;
        // Le modèle vient d'être posé : on laisse passer une image.
        requestAnimationFrame(() => start(p));
      } else if (pending && pending.assembly !== id) pending = null;
    });
    // La vue affichée change de type (document, contrôle) : on sort.
    ctx.on('view', ({ type, id }) => {
      if (run && (type !== 'assembly' || id !== run.proc.assembly)) stop({ gone: ctx.viewer.model !== run.model, quiet: true });
    });
  },
};
