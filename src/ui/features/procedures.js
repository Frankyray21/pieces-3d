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
// Les procédures sont lues au moment de la construction (import.meta.glob) :
// pas de requête, donc pas d'erreur 404 pour un équipement qui n'en a pas.
import * as THREE from 'three';
import './procedures.css';

const FILES = import.meta.glob('../../../public/equipment/*/procedures.json', { eager: true, import: 'default' });
const BY_EQ = new Map(Object.entries(FILES).map(([f, d]) => [f.split('/').at(-2), d?.procedures || []]));

const ARRIVE = 900; // durée du mouvement d'une pièce (ms)
const PAUSE = 2400; // lecture auto : pause après la pose d'une étape (ms)
const FAR = 1.25; // départ : position éclatée × FAR
const ease = (k) => 1 - Math.pow(1 - k, 3);

export default {
  id: 'procedures',
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    const list = () => BY_EQ.get(ctx.equipment?.id) || [];
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
    let run = null; // { proc, n, steps: [{ objs, paths }], managed, extras, timer, raf, anim, focus }
    let pending = null; // procédure à lancer à l'ouverture de son assemblage

    // Barre de commande, posée sur la scène.
    const stage = document.getElementById('stage');
    const bar = document.createElement('div');
    bar.className = 'proc-bar';
    bar.hidden = true;
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Procédure pas à pas');
    bar.innerHTML = `
      <div class="proc-bar-row">
        <button type="button" class="tbtn proc-prev" title="Étape précédente" aria-label="Étape précédente">${icon('gauche', { size: 16 })}</button>
        <div class="proc-bar-mid">
          <span class="proc-num"></span>
          <span class="proc-bar-title"></span>
        </div>
        <button type="button" class="tbtn proc-next" title="Étape suivante" aria-label="Étape suivante">${icon('droite', { size: 16 })}</button>
      </div>
      <div class="proc-progress" role="progressbar" aria-label="Progression de la procédure" aria-valuemin="0"><div class="proc-segs"></div></div>
      <div class="proc-bar-row proc-bar-actions">
        <button type="button" class="tbtn proc-play" aria-pressed="false" title="Lecture automatique des étapes">Lecture auto</button>
        <button type="button" class="tbtn proc-replay" title="Rejouer la pose de cette étape">Rejouer</button>
        <button type="button" class="tbtn proc-details" aria-pressed="false" title="Texte, pièces et page du manuel">Détails</button>
        <button type="button" class="tbtn proc-quit" title="Quitter la procédure (modèle rétabli)">${icon('fermer', { size: 14 })}<span>Quitter</span></button>
      </div>`;
    stage.appendChild(bar);
    const $b = (s) => bar.querySelector(s);
    new ResizeObserver(() => stage.style.setProperty('--proc-bar-h', `${bar.offsetHeight + 16}px`)).observe(bar);

    // ------------------------------------------------------------ 3D
    const V = () => ctx.viewer.raw;

    /** Prépare le modèle : objets de chaque étape, conteneurs, objets hors procédure (posés à la fin). */
    const prepare = (proc) => {
      const v = V();
      const steps = proc.steps.map((st) => {
        const objs = [];
        for (const p of st.parts) {
          const path3d = ctx.viewer.path3d(p);
          for (const o of v.resolve(path3d)) if (!objs.includes(o)) objs.push(o);
        }
        return { objs, paths: st.parts };
      });
      const stepOf = new Map();
      steps.forEach((s, i) => s.objs.forEach((o) => { if (!stepOf.has(o)) stepOf.set(o, i); }));
      const containers = new Set();
      for (const o of stepOf.keys()) for (let a = o.parent; a && a !== v.model.root; a = a.parent) containers.add(a);
      // Objets hors étapes : pièces non citées et ajouts du modèle (câble, décor) ; affichés à la dernière étape.
      const extras = [];
      const visit = (node) => {
        for (const c of node.children) {
          if (c.isCSS2DObject || stepOf.has(c)) continue;
          if (containers.has(c)) visit(c);
          else extras.push(c);
        }
      };
      visit(v.model.root);
      const managed = [...stepOf.keys(), ...extras];
      return { steps, stepOf, extras, managed, wasVisible: new Map(managed.map((o) => [o, o.visible])) };
    };

    /**
     * Marges de cadrage pendant la procédure : la barre en bas, le panneau
     * latéral à droite (grand écran). Le viewer ne connaît que des marges
     * symétriques : le cadrage est fait dans la largeur libre, puis décalé
     * vers la gauche de la moitié du panneau.
     */
    const panelW = () => (!ctx.narrow() && ctx.ui.sidePanel.isOpen ? ctx.ui.sidePanel.element.offsetWidth + 12 : 0);
    const runInsets = (orig) => () => {
      const b = (typeof orig === 'function' ? orig() : orig) || {};
      const vp = V()?.container.getBoundingClientRect();
      const barTop = bar.hidden || !vp ? 0 : vp.bottom - bar.getBoundingClientRect().top + 8;
      return { ...b, bottom: Math.max(b.bottom || 0, barTop), side: Math.max(b.side || 0, panelW() / 2) };
    };
    /** Cadre tout le modèle (paths absent) ou des pièces, dans la partie libre de la scène, avec un mouvement de caméra. */
    const frameFree = (paths = null) => {
      const v = V();
      if (!v?.model) return;
      const cam = v.camera, ctl = v.controls;
      const p0 = cam.position.clone(), t0 = ctl.target.clone();
      if (paths) {
        const objs = paths.flatMap((p) => v.resolve(ctx.viewer.path3d(p)));
        if (!objs.length) return;
        const box = v._atTargets(() => { const b = new THREE.Box3(); objs.forEach((o) => b.expandByObject(o)); return b; });
        v.frame({ box, instant: true });
      } else v.frame({ instant: true });
      const shift = panelW() / 2;
      if (shift) {
        const back = cam.position.clone().sub(ctl.target);
        const upp = (2 * back.length() * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)) / (v.container.clientHeight || 1);
        const right = new THREE.Vector3(0, 1, 0).cross(back.normalize()).normalize().multiplyScalar(shift * upp);
        cam.position.add(right);
        ctl.target.add(right);
      }
      const p1 = cam.position.clone(), t1 = ctl.target.clone();
      cam.position.copy(p0);
      ctl.target.copy(t0);
      ctl.update();
      v.lookAt(p1.toArray(), t1.toArray());
    };

    /** Remet chaque pièce à sa place (éclatement du viewer : 0 partout pendant la procédure). */
    const settle = () => {
      if (!run) return;
      cancelAnimationFrame(run.raf);
      run.anim = null;
      V()?._applyAll();
    };

    /** Affiche l'étape n : posées avant, arrivée animée de l'étape, cachées après. */
    const show = (n, { animate = true } = {}) => {
      if (!run) return 0;
      const v = V();
      settle();
      const last = run.proc.steps.length - 1;
      run.n = Math.max(0, Math.min(last, n));
      for (const [o, i] of run.prep.stepOf) o.visible = i <= run.n;
      for (const o of run.prep.extras) o.visible = run.n === last && run.prep.wasVisible.get(o);
      const fresh = run.prep.steps[run.n].objs;
      let total = 0;
      if (animate && fresh.length) {
        const gap = Math.max(40, Math.min(260, 3200 / fresh.length));
        const now = performance.now();
        run.anim = fresh.map((o, i) => {
          const to = o.position.clone();
          const ex = o.userData.explode;
          const from = ex ? to.clone().addScaledVector(ex, FAR) : to.clone();
          o.position.copy(from);
          o.visible = false;
          return { o, from, to, start: now + i * gap };
        });
        total = (fresh.length - 1) * gap + ARRIVE;
        const tick = () => {
          if (!run?.anim) return;
          const t = performance.now();
          let left = 0;
          for (const a of run.anim) {
            const k = (t - a.start) / ARRIVE;
            if (k < 0) { left++; continue; }
            a.o.visible = true;
            a.o.position.lerpVectors(a.from, a.to, ease(Math.min(1, k)));
            if (k < 1) left++;
          }
          v.invalidate();
          v._refreshLabels();
          if (left) run.raf = requestAnimationFrame(tick);
          else { run.anim = null; v._cullDirty = true; }
        };
        run.raf = requestAnimationFrame(tick);
      }
      v._cullDirty = true;
      v.labels?.forEach((l) => { l.culled = false; });
      v._refreshLabels();
      v.invalidate();
      mark();
      render();
      if (ctx.ui.sidePanel.owner === 'procedures') ctx.ui.sidePanel.body.scrollTop = 0;
      return total;
    };

    /** Met en évidence les pièces de l'étape (ou la pièce choisie dans la liste). */
    const mark = () => {
      if (!run) return;
      const st = run.proc.steps[run.n];
      if (run.focus) { ctx.viewer.highlight([run.focus]); frameFree([run.focus]); }
      else ctx.viewer.highlight(st.parts);
    };

    // ------------------------------------------------------------ lecture auto
    const stopPlay = () => {
      if (!run) return;
      clearTimeout(run.timer);
      run.timer = null;
      $b('.proc-play').setAttribute('aria-pressed', 'false');
      $b('.proc-play').textContent = 'Lecture auto';
    };
    const playNext = () => {
      if (!run) return;
      const last = run.proc.steps.length - 1;
      if (run.n >= last) { stopPlay(); return; }
      run.focus = null;
      const ms = show(run.n + 1);
      run.timer = setTimeout(playNext, ms + PAUSE);
    };
    const togglePlay = () => {
      if (!run) return;
      if (run.timer) { stopPlay(); return; }
      $b('.proc-play').setAttribute('aria-pressed', 'true');
      $b('.proc-play').textContent = 'Pause';
      run.focus = null;
      if (run.n >= run.proc.steps.length - 1) {
        const ms = show(0);
        run.timer = setTimeout(playNext, ms + PAUSE);
      } else playNext();
    };
    const go = (n) => { if (!run) return; stopPlay(); run.focus = null; show(n); };

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
        const shown = V()?.resolve(ctx.viewer.path3d(p)).length > 0;
        return { p, path, row, shown };
      });
      const thumb = ctx.pageUrl(st.sheet);
      panelBody.innerHTML = `
        <p class="proc-kicker">${esc(proc.title)}</p>
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
      if (!run.focus) frameFree();
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
      const pr = $b('.proc-progress');
      pr.setAttribute('aria-valuemax', String(N));
      pr.setAttribute('aria-valuenow', String(n + 1));
      $b('.proc-segs').innerHTML = proc.steps.map((s, i) => `<button type="button" class="proc-seg${i < n ? ' done' : ''}${i === n ? ' cur' : ''}" data-i="${i}" title="Étape ${i + 1} : ${esc(s.title)}" aria-label="Étape ${i + 1}"></button>`).join('');
      if (ctx.ui.sidePanel.owner === 'procedures') renderPanel();
    };

    $b('.proc-prev').addEventListener('click', () => go(run.n - 1));
    $b('.proc-next').addEventListener('click', () => go(run.n + 1));
    $b('.proc-replay').addEventListener('click', () => go(run.n));
    $b('.proc-play').addEventListener('click', togglePlay);
    $b('.proc-quit').addEventListener('click', () => stop());
    $b('.proc-details').addEventListener('click', () => {
      if (ctx.ui.sidePanel.owner === 'procedures') ctx.ui.sidePanel.close();
      else openPanel();
    });
    $b('.proc-segs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) go(Number(b.dataset.i));
    });
    // Flèches du clavier pendant la procédure (hors champs de saisie).
    document.addEventListener('keydown', (e) => {
      if (!run || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' && run.n < run.proc.steps.length - 1) { e.preventDefault(); go(run.n + 1); }
      if (e.key === 'ArrowLeft' && run.n > 0) { e.preventDefault(); go(run.n - 1); }
    });

    // ------------------------------------------------------------ début et fin
    const start = (proc) => {
      if (!ctx.viewer.is3d || !V()?.model) return;
      if (run) stop({ quiet: true });
      // Modèle assemblé, sans animation d'éclatement en cours (l'état du site suit : bouton « Assembler »).
      const v = V();
      if (v.explode > 0 || v.nodes.some((nd) => nd.userData.explodeT > 0 || nd.userData.targetT > 0)) {
        document.getElementById('btn-assemble')?.click();
      }
      v.explodeAll(0, { animate: false });
      run = { proc, n: 0, prep: prepare(proc), timer: null, raf: 0, anim: null, focus: null, prevStep: v.step, model: v.model, insets: v.insets };
      v.insets = runInsets(v.insets);
      v.step = 'procedure'; // bulles des pièces cachées masquées (voir Viewer._refreshLabels)
      stage.classList.add('proc-on');
      bar.hidden = false;
      tool.setAttribute('aria-pressed', 'true');
      // Sur téléphone, le panneau couvrirait la scène : il s'ouvre par « Détails ».
      if (!ctx.narrow()) openPanel();
      else if (ctx.ui.sidePanel.owner === 'procedures-list') ctx.ui.sidePanel.close();
      show(0);
      frameFree();
      ctx.emit('procedures:started', { id: proc.id, assembly: proc.assembly });
    };

    /** Sortie : modèle rétabli (tout visible, assemblé, rien de mis en évidence). */
    const stop = ({ quiet = false, gone = false } = {}) => {
      if (!run) return;
      stopPlay();
      settle();
      const r = run;
      run = null;
      const v = V();
      if (!gone && v?.model) {
        for (const o of r.prep.managed) o.visible = r.prep.wasVisible.get(o) ?? true;
        v.step = r.prevStep ?? null;
        v.insets = r.insets;
        stage.classList.remove('proc-on');
        v._applyAll();
        ctx.viewer.clear();
        v.labels?.forEach((l) => { l.culled = false; });
        v._cullDirty = true;
        v._refreshLabels();
        if (!quiet) v.frame();
      }
      stage.classList.remove('proc-on');
      bar.hidden = true;
      tool.setAttribute('aria-pressed', 'false');
      if (ctx.ui.sidePanel.owner === 'procedures') ctx.ui.sidePanel.close();
      ctx.emit('procedures:stopped', { id: r.proc.id });
    };

    /** Lance une procédure : ouvre d'abord son assemblage si besoin. */
    const launch = (proc) => {
      if (ctx.view?.type === 'assembly' && ctx.view.id === proc.assembly && ctx.viewer.is3d) { start(proc); return; }
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
        <p class="proc-intro">Montage illustré, étape par étape, d'après les pages du manuel : les pièces posées restent en place, celles de l'étape arrivent depuis la vue éclatée.</p>
        <ul class="proc-cards">${procs.map((p) => `
          <li><button type="button" class="proc-card" data-id="${esc(p.id)}">
            <span class="proc-card-t">${esc(p.title)}</span>
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
        renderList();
        ctx.ui.sidePanel.toggle({ title: 'Procédures', content: listBody, owner: 'procedures-list', icon: 'cle' });
      },
    });
    tool.hidden = true;

    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === 'procedures') $b('.proc-details').setAttribute('aria-pressed', String(open));
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
        <p class="proc-home-p">Montage pas à pas en 3D, d'après les pages du manuel : texte de chaque étape, pièces avec numéros et quantités, vignette de la page.</p>
        <ul class="proc-cards">${procs.map((p) => `
          <li><button type="button" class="proc-card" data-proc="${esc(p.id)}">
            <span class="proc-card-t">${esc(p.title)}</span>
            <span class="proc-card-s">${esc(p.summary || '')}</span>
            <span class="proc-card-m">${p.steps.length} étapes · ${esc(ctx.equipment.assemblies.get(p.assembly)?.titleFr || p.assembly)}</span>
          </button></li>`).join('')}
        </ul>`;
    });

    // ------------------------------------------------------------ changements de vue
    ctx.on('assembly', ({ id, is3d, home }) => {
      // Nouveau modèle (ou dessins du manuel) : la procédure en cours n'a plus d'objet.
      if (run && (run.proc.assembly !== id || V()?.model !== run.model)) stop({ gone: V()?.model !== run.model, quiet: true });
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
      if (run && (type !== 'assembly' || id !== run.proc.assembly)) stop({ gone: V()?.model !== run.model, quiet: true });
    });
  },
};
