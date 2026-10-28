// Prise en main de la console (premier contact avec l'équipement) : adresse « #<équipement>.prise-en-main ».
//
// Parcours en six étapes pour un travailleur qui découvre la machine : la console (figure du manuel, repères
// cliquables, défi « trouver la commande »), les manettes (axes LX, LY, RX, RY et touche Mode), l'écran et ses
// voyants (exercice de reconnaissance), le simulateur de la console ERIS avec des missions guidées (démarrer, changer
// de mode, se déplacer, mettre en place, forer, alarmes, arrêt d'urgence), les alarmes du manuel et un quiz.
// Chaque contenu renvoie à sa page du manuel de l'utilisateur (data-ut-page, fonction « utilisation »).
//
// Données : public/equipment/<id>/prise-en-main.json (ctx.equipmentData) : textes, figures, missions, alarmes,
// quiz ; le simulateur (prise-en-main/eris.js) suit les pages 121 à 147 du manuel. Progression gardée dans le
// navigateur (localStorage, facultatif). Sans prise-en-main.json, rien n'apparaît.
import './prise-en-main.css';
import { createSim, T, BOUTON, POSITION } from './prise-en-main/eris.js';
import { ecran, court } from './prise-en-main/ecran.js';
import { creerConsole3D } from './prise-en-main/console3d.js';

const ID = 'prise-en-main';
const RM = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const melange = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};

/** Petit écran ou pointeur tactile : l'écran ERIS de la console 3D y serait trop petit pour être lu (vue 2D par défaut). */
// Seuil 1200 px : en dessous, les lignes de l'écran ERIS de la vue 3D font moins de 7 px de haut.
const ecranEtroit = () => typeof matchMedia === 'function' && matchMedia('(max-width: 1199px), (pointer: coarse)').matches;

export default {
  id: ID,
  order: 65,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    /** État de l'interface par équipement (conservé quand on revient d'une page du manuel). */
    const UI = new Map();
    const ui = (eqId) => {
      if (!UI.has(eqId)) UI.set(eqId, { etape: null, mission: null, fr: false, vue: ecranEtroit() ? '2d' : '3d', defi: null, voy: null, quiz: null, essais: new Set(), sim: createSim(), info: null });
      return UI.get(eqId);
    };

    // --- progression (navigateur seulement ; la page fonctionne sans)
    const cle = (eqId) => `pieces3d:prise-en-main:${eqId}`;
    const lire = (eqId) => {
      try { return { etapes: {}, missions: {}, quiz: 0, ...JSON.parse(localStorage.getItem(cle(eqId)) || '{}') }; } catch { return { etapes: {}, missions: {}, quiz: 0 }; }
    };
    const ecrire = (eqId, p) => { try { localStorage.setItem(cle(eqId), JSON.stringify(p)); } catch { /* stockage indisponible */ } };
    const fait = (eqId, quoi, id, val = true) => {
      const p = lire(eqId);
      if (p[quoi][id] === val) return;
      p[quoi][id] = val;
      ecrire(eqId, p);
      // Étape terminée : coche tout de suite dans la barre des étapes de la page ouverte.
      if (quoi === 'etapes') document.querySelectorAll(`.pem-step[data-pem-etape="${CSS.escape(id)}"]`).forEach((b) => { b.classList.add('ok'); b.querySelector('.pem-step-n').textContent = '✓'; });
      ctx.emit('prise-en-main:progression', { equipmentId: eqId });
    };

    const pageBtn = (p, txt = null) => `<button type="button" class="pem-page" data-ut-page="${p}" title="Ouvrir la page ${p} du manuel de l’utilisateur">${icon('page', { size: 13 })}${txt ?? `p. ${p}`}</button>`;

    // --- carte en tête de la page de l'équipement
    const card = document.createElement('section');
    card.className = 'card-box pem-card';
    card.hidden = true;
    ctx.ui.equipmentHomeTop.prepend(card);
    const carte = (eqId) => {
      const d = ctx.equipmentData(ID, eqId);
      card.hidden = !d;
      if (!d) return;
      const p = lire(eqId);
      const n = d.etapes.filter((e) => p.etapes[e.id]).length;
      card.innerHTML = `
        <div class="pem-card-main">
          <span class="pem-kicker">Nouveau travailleur · premier contact</span>
          <h3>${esc(d.titre)}</h3>
          <p>${esc(d.sousTitre)}. Pages ${d.pages[0]} à ${d.pages[1]} du manuel de l’utilisateur, en ${d.etapes.length} étapes interactives.</p>
          <ol class="pem-card-steps">${d.etapes.map((e, i) => `<li class="${p.etapes[e.id] ? 'ok' : ''}"><button type="button" data-pem-etape="${esc(e.id)}"><span>${p.etapes[e.id] ? '✓' : i + 1}</span>${esc(e.titre)}</button></li>`).join('')}</ol>
        </div>
        <div class="pem-card-side">
          <div class="pem-ring" style="--p:${Math.round((100 * n) / d.etapes.length)}"><b>${n}/${d.etapes.length}</b><span>étapes</span></div>
          <button type="button" class="btn primary" data-pem-etape="">${n ? (n === d.etapes.length ? 'Revoir' : 'Continuer') : 'Commencer'} ${icon('droite', { size: 16 })}</button>
        </div>`;
    };
    ctx.on('equipment', ({ id }) => carte(id));
    ctx.on('prise-en-main:progression', ({ equipmentId }) => carte(equipmentId));
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pem-etape]');
      if (!b || !ctx.equipment) return;
      const d = ctx.equipmentData(ID);
      if (!d) return;
      const u = ui(ctx.equipment.id);
      if (b.closest('.pem')) return; // dans la page : géré par la page (adresse de l'étape)
      ctx.go(b.dataset.pemEtape ? `${ID}-${b.dataset.pemEtape}` : ID);
    });

    // --- page
    let arret = null; // arrête la boucle du simulateur et le clavier
    ctx.on('page', ({ open, token }) => { if ((!open || !String(token || '').startsWith(ID)) && arret) { arret(); arret = null; } });

    // Une adresse par étape (#<équipement>.prise-en-main-<étape>) : changer d'étape ajoute une entrée d'historique,
    // Retour (bouton de la page ou du navigateur) revient à l'étape précédente au lieu de quitter la formation ;
    // depuis un lien direct, Retour mène à la page de l'équipement (repli « apercu »), pas à la vue 3D.
    // « #<équipement>.prise-en-main » reprend à l'étape en cours (ou la première non faite).
    ctx.registerRoute(ID, () => afficher(null));
    for (const etape of ['console', 'manettes', 'voyants', 'simulateur', 'alarmes', 'quiz']) ctx.registerRoute(`${ID}-${etape}`, () => afficher(etape));

    function afficher(demandee) {
      const eq = ctx.equipment;
      const d = eq && ctx.equipmentData(ID, eq.id);
      if (!d) return;
      const u = ui(eq.id);
      const prog = () => lire(eq.id);
      if (demandee && d.etapes.some((e) => e.id === demandee)) u.etape = demandee;
      if (!u.etape) u.etape = d.etapes.find((e) => !prog().etapes[e.id])?.id || d.etapes[0].id;
      // Adresse sans étape : l'adresse affichée nomme l'étape (sans nouvelle entrée d'historique).
      if (!demandee) try { history.replaceState(history.state, '', ctx.hashFor(`${ID}-${u.etape}`)); } catch { /* adresse inchangée */ }
      const img = (p) => `equipment/${eq.id}/${p}`;
      const alarmes = new Map(d.alarmes.map((a) => [a.n, a]));

      const el = document.createElement('div');
      el.className = 'pem';
      document.title = `Prise en main · ${eq.name} · Pièces 3D`;
      ctx.ui.showPage(`Prise en main — ${eq.name}`, el, { icon: 'cle', repli: 'apercu' });

      const rendre = () => {
        if (arret) { arret(); arret = null; }
        const p = prog();
        const i = d.etapes.findIndex((e) => e.id === u.etape);
        const e = d.etapes[i];
        el.innerHTML = `
          <header class="pem-head">
            <div>
              <span class="pem-kicker">${esc(eq.name)} · manuel de l’utilisateur, pages ${d.pages[0]} à ${d.pages[1]}</span>
              <p class="pem-warn">${icon('alerte', { size: 16 })}<span>${esc(d.avertissement)}</span></p>
            </div>
          </header>
          <nav class="pem-steps" aria-label="Étapes">${d.etapes.map((x, k) => `
            <button type="button" class="pem-step${x.id === u.etape ? ' on' : ''}${p.etapes[x.id] ? ' ok' : ''}" data-pem-etape="${esc(x.id)}" ${x.id === u.etape ? 'aria-current="step"' : ''}>
              <span class="pem-step-n">${p.etapes[x.id] ? '✓' : k + 1}</span><span class="pem-step-t">${esc(x.titre)}</span><span class="pem-step-d">${esc(x.duree)}</span>
            </button>`).join('')}</nav>
          <section class="pem-body" aria-labelledby="pem-h"></section>
          <footer class="pem-nav">
            ${i > 0 ? `<button type="button" class="btn" data-pem-etape="${esc(d.etapes[i - 1].id)}">${icon('gauche', { size: 16 })}${esc(d.etapes[i - 1].titre)}</button>` : '<span></span>'}
            ${i < d.etapes.length - 1 ? `<button type="button" class="btn primary" data-pem-etape="${esc(d.etapes[i + 1].id)}">${esc(d.etapes[i + 1].titre)} ${icon('droite', { size: 16 })}</button>` : ''}
          </footer>`;
        const body = el.querySelector('.pem-body');
        const titre = (t, sous, page) => `<div class="pem-h"><h2 id="pem-h">${esc(t)}</h2>${page ? pageBtn(page, `Manuel p. ${page}`) : ''}</div>${sous ? `<p class="pem-lead">${sous}</p>` : ''}`;
        ({ console: etapeConsole, manettes: etapeManettes, voyants: etapeVoyants, simulateur: etapeSimulateur, alarmes: etapeAlarmes, quiz: etapeQuiz }[e.id])(body, titre, e);
      };

      el.addEventListener('click', (ev) => {
        const b = ev.target.closest('.pem [data-pem-etape]');
        if (!b || !b.dataset.pemEtape || b.dataset.pemEtape === u.etape) return;
        ctx.go(`${ID}-${b.dataset.pemEtape}`);
      });

      // ------------------------------------------------------------ 1. la console
      function etapeConsole(body, titre) {
        const f = d.figureConsole;
        const pts = f.points;
        body.innerHTML = `${titre('La console de l’opérateur', 'Touchez chaque commande pour savoir à quoi elle sert. Puis relevez le défi : retrouver les commandes les plus importantes.', f.page)}
          <div class="pem-tabs" role="group" aria-label="Affichage de la console"><button type="button" class="chip" data-vc="3d" aria-pressed="${u.vueConsole !== 'fig'}">Console 3D</button><button type="button" class="chip" data-vc="fig" aria-pressed="${u.vueConsole === 'fig'}">Figure du manuel</button></div>
          <div class="pem-two">
            <div class="pem-c3"${u.vueConsole === 'fig' ? ' hidden' : ''}>
              <div class="pem-3d"></div>
              <p class="pem-small">Touchez une commande sur la console 3D (glisser pour tourner la vue, molette ou deux doigts pour zoomer). Les commandes s’utilisent pour de vrai à l’étape « Simulateur et missions ».</p>
            </div>
            <figure class="pem-fig"${u.vueConsole === 'fig' ? '' : ' hidden'}>
              <div class="pem-fig-in" style="aspect-ratio:${f.w}/${f.h}">
                <img src="${esc(img(f.image))}" alt="Console de l’opérateur ERIS (figure du manuel, page ${f.page})">
                ${pts.map((pt) => `<button type="button" class="pem-dot" data-n="${pt.n}" style="left:${pt.x * 100}%;top:${pt.y * 100}%" aria-label="${esc(pt.nom)}"><span>${pt.n || 'É'}</span></button>`).join('')}
              </div>
              <figcaption>Figure du manuel, page ${f.page}. Les numéros sont ceux du manuel ; « É » : écran.</figcaption>
            </figure>
            <div class="pem-side">
              <div class="pem-tabs" role="tablist"><button type="button" role="tab" class="chip" data-mode="explorer">Explorer</button><button type="button" role="tab" class="chip" data-mode="defi">Défi : trouver la commande</button></div>
              <div class="pem-panel" aria-live="polite"></div>
            </div>
          </div>`;
        const panel = body.querySelector('.pem-panel');
        const vus = new Set();
        // Console 3D : chaque commande touchée vaut le repère correspondant de la figure.
        const REPERE = { power: 1, manette: (c) => (c.side === 'L' ? 2 : 3), estop: 4, ext: 5, bouton: (c) => (c.side === 'L' ? 2 : 3) };
        let c3 = null;
        const ouvrir3d = () => {
          if (c3 || u.vueConsole === 'fig') return;
          try {
            c3 = creerConsole3D(body.querySelector('.pem-c3 .pem-3d'), createSim(), {
              plein: body.querySelector('.pem-two'),
              surCible: (c) => { const r = REPERE[c.type]; if (r != null) choisir(typeof r === 'function' ? r(c) : r, null); },
            });
            c3.ecran.addEventListener('click', () => choisir(0, null));
            c3.ecran.innerHTML = '<div class="er er-off"><span>Écran ERIS</span></div>';
            arret = () => { c3?.arreter(); c3 = null; };
          } catch (err) {
            console.error(err);
            u.vueConsole = 'fig';
            body.querySelector('.pem-c3').hidden = true;
            body.querySelector('.pem-fig').hidden = false;
          }
        };
        let mode = u.defi ? 'defi' : 'explorer';
        const montrer = (n) => {
          const pt = pts.find((x) => x.n === n);
          vus.add(n);
          body.querySelectorAll('.pem-dot').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) === n));
          panel.innerHTML = `<div class="pem-info"><span class="pem-num">${n || 'É'}</span><h3>${esc(pt.nom)}</h3><p>${esc(pt.texte)}</p></div>
            <p class="pem-small">${vus.size} repère${vus.size > 1 ? 's' : ''} sur ${pts.length} consulté${vus.size > 1 ? 's' : ''}.</p>`;
        };
        const defi = () => {
          const q = u.defi;
          if (q.i >= q.ordre.length) {
            panel.innerHTML = `<div class="pem-result ${q.score === q.ordre.length ? 'ok' : ''}"><b>${q.score} / ${q.ordre.length}</b><p>${q.score === q.ordre.length ? 'Parfait : vous savez où sont les commandes essentielles.' : 'Recommencez pour bien retenir l’emplacement de chaque commande.'}</p>
              <button type="button" class="btn" data-defi="again">Recommencer le défi</button></div>`;
            if (q.score === q.ordre.length) fait(eq.id, 'etapes', 'console');
            return;
          }
          const cible = pts.find((x) => x.n === q.ordre[q.i]);
          panel.innerHTML = `<div class="pem-quest"><span class="pem-small">Question ${q.i + 1} / ${q.ordre.length}</span><p>Touchez sur la console :</p><h3>${esc(cible.nom)}</h3>${q.retour ? `<p class="pem-fb ${q.retour.ok ? 'ok' : 'ko'}">${esc(q.retour.t)}</p>` : ''}</div>`;
        };
        const setMode = (m) => {
          mode = m;
          body.querySelectorAll('.pem-tabs [data-mode]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
          body.querySelectorAll('.pem-dot').forEach((b) => b.classList.remove('on', 'ko', 'ok'));
          if (m === 'defi') {
            if (!u.defi || u.defi.i >= u.defi.ordre.length) u.defi = { ordre: melange(f.defi), i: 0, score: 0, retour: null };
            body.classList.add('pem-defi');
            defi();
          } else {
            u.defi = null;
            body.classList.remove('pem-defi');
            panel.innerHTML = '<p class="pem-small">Touchez une commande sur la console 3D ou un repère numéroté sur la figure.</p>';
          }
        };
        /** Repère n choisi (sur la figure : dot ; en 3D : null). */
        function choisir(n, dot) {
          if (mode === 'explorer') { montrer(n); return; }
          const q = u.defi;
          if (!q || q.i >= q.ordre.length) return;
          const ok = n === q.ordre[q.i];
          const bonne = pts.find((x) => x.n === q.ordre[q.i]);
          if (dot) {
            dot.classList.add(ok ? 'ok' : 'ko');
            setTimeout(() => dot.classList.remove('ok', 'ko'), 700);
          }
          if (ok) q.score += 1;
          q.retour = { ok, t: ok ? `Exact : ${bonne.nom}.` : `Non : c’était le repère ${bonne.n}.` };
          q.i += 1;
          defi();
        }
        body.addEventListener('click', (ev) => {
          const vc = ev.target.closest('[data-vc]');
          if (vc) {
            u.vueConsole = vc.dataset.vc;
            body.querySelectorAll('[data-vc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vc === u.vueConsole)));
            body.querySelector('.pem-c3').hidden = u.vueConsole === 'fig';
            body.querySelector('.pem-fig').hidden = u.vueConsole !== 'fig';
            if (u.vueConsole === 'fig') { c3?.arreter(); c3 = null; } else ouvrir3d();
            return;
          }
          const t = ev.target.closest('[data-mode]');
          if (t) { setMode(t.dataset.mode); return; }
          if (ev.target.closest('[data-defi]')) { u.defi = null; setMode('defi'); return; }
          const dot = ev.target.closest('.pem-dot');
          if (dot) choisir(Number(dot.dataset.n), dot);
        });
        setMode(mode);
        ouvrir3d();
      }

      // ------------------------------------------------------------ 2. les manettes
      function etapeManettes(body, titre) {
        const f = d.figureManettes;
        const axesNoms = { 'L-x--1': 'LX vers la gauche', 'L-x-1': 'LX vers la droite', 'L-y-1': 'LY vers le haut (pousser)', 'L-y--1': 'LY vers le bas (tirer)', 'R-x--1': 'RX vers la gauche', 'R-x-1': 'RX vers la droite', 'R-y-1': 'RY vers le haut (pousser)', 'R-y--1': 'RY vers le bas (tirer)' };
        body.innerHTML = `${titre('Les manettes', 'Les deux manettes font presque tout. Chacune a deux axes et des boutons ; la fonction de chaque axe change selon le mode et la couche affichés à l’écran.', f.page)}
          <div class="pem-two">
            <figure class="pem-fig"><div class="pem-fig-in" style="aspect-ratio:${f.w}/${f.h}"><img src="${esc(img(f.image))}" alt="Console vue de face avec les axes LX, LY, RX, RY (figure du manuel, page ${f.page})"></div>
              <figcaption>Figure du manuel, page ${f.page}. Repère 1 : touche Mode.</figcaption></figure>
            <div class="pem-side">
              <ul class="pem-bullets">${f.texte.map((t) => `<li>${esc(t)}</li>`).join('')}
                <li>Les boutons de la <b>manette gauche</b> choisissent la <b>couche</b> (liste en bas à gauche de l’écran) ; ceux de la <b>manette droite</b> activent les <b>fonctions</b> (liste en bas à droite). ${pageBtn(124)}</li>
                <li>Pour <b>changer de mode</b> : maintenir la touche Mode et déplacer la manette gauche vers la gauche ou la droite. ${pageBtn(124)}</li></ul>
              <div class="pem-try">
                <p><b>Essayez :</b> touchez les flèches pour nommer chaque axe.</p>
                <div class="pem-try-pads">${['L', 'R'].map((side) => `<div><span>Manette ${side === 'L' ? 'gauche' : 'droite'}</span>${pad(side, null, { simple: true })}</div>`).join('')}</div>
                <p class="pem-try-out" aria-live="polite">—</p>
                <div class="pem-try-done">${Object.keys(axesNoms).map((k) => `<span class="chip${u.essais.has(k) ? ' on' : ''}" data-k="${k}">${esc(axesNoms[k].split(' ')[0])} ${k.endsWith('-1') && !k.endsWith('--1') ? '+' : '−'}</span>`).join('')}</div>
              </div>
            </div>
          </div>`;
        body.addEventListener('click', (ev) => {
          const b = ev.target.closest('.pem-pad [data-dir]');
          if (!b) return;
          const side = b.closest('.pem-pad').dataset.side;
          const [axe, v] = { up: ['y', 1], down: ['y', -1], left: ['x', -1], right: ['x', 1] }[b.dataset.dir] || [];
          if (!axe) return;
          const k = `${side}-${axe}-${v}`;
          u.essais.add(k);
          body.querySelector('.pem-try-out').textContent = `${axesNoms[k]} : ${side}${axe.toUpperCase()} = ${v > 0 ? '+1' : '−1'}`;
          body.querySelector(`.pem-try-done [data-k="${k}"]`)?.classList.add('on');
          if (u.essais.size === 8) { fait(eq.id, 'etapes', 'manettes'); body.querySelector('.pem-try-out').textContent += ' — les 8 directions sont faites ✓'; }
        });
      }

      // ------------------------------------------------------------ 3. voyants
      function etapeVoyants(body, titre, e) {
        body.innerHTML = `${titre('L’écran et ses voyants', 'À droite de l’écran, trois voyants indiquent l’état de la console. Lisez-les avant toute manœuvre : ils disent si la console communique avec la foreuse et si vous avez le contrôle.', e.page)}
          <div class="pem-voy">${d.voyants.map((g) => `
            <section class="card-box pem-voy-g"><h3>${esc(g.groupe)}</h3><p class="pem-small">${esc(g.titre)} — ${esc(g.aide)}</p>
              <ul>${g.etats.map((s) => `<li><img src="${esc(img(s.img))}" alt="${esc(g.groupe)} : ${esc(s.court)}"><span>${esc(s.texte)}</span></li>`).join('')}</ul></section>`).join('')}</div>
          <section class="card-box pem-ex">
            <h3>Exercice : que veut dire ce voyant ?</h3>
            <div class="pem-ex-in" aria-live="polite"></div>
          </section>
          <p class="pem-small">Autres repères de l’écran : le mode actif est en haut à droite ; les erreurs et avertissements actifs défilent en bas de l’écran (liste complète : mode SYSTEM, couche Error) ${pageBtn(124)}</p>`;
        const zone = body.querySelector('.pem-ex-in');
        const tous = d.voyants.flatMap((g) => g.etats.map((s) => ({ ...s, g })));
        const nouveau = () => { u.voy = { ordre: melange(tous).slice(0, 8), i: 0, score: 0, retour: null }; };
        if (!u.voy) nouveau();
        const dessiner = () => {
          const q = u.voy;
          if (q.i >= q.ordre.length) {
            zone.innerHTML = `<div class="pem-result ${q.score >= 7 ? 'ok' : ''}"><b>${q.score} / ${q.ordre.length}</b><p>${q.score >= 7 ? 'Bien lu : vous reconnaissez les voyants.' : 'Relisez les voyants ci-dessus puis recommencez.'}</p><button type="button" class="btn" data-voy="again">Recommencer</button></div>`;
            if (q.score >= 7) fait(eq.id, 'etapes', 'voyants');
            return;
          }
          const v = q.ordre[q.i];
          // Choix : l'état à trouver et jusqu'à trois autres du même voyant (comparés par leur image).
          if (!v.choix) v.choix = melange([v, ...melange(v.g.etats.filter((x) => x.img !== v.img)).slice(0, 3)]);
          zone.innerHTML = `<span class="pem-small">Voyant ${q.i + 1} / ${q.ordre.length}</span>
            <img class="pem-ex-img" src="${esc(img(v.img))}" alt="Voyant ${esc(v.g.groupe)} à identifier">
            <div class="pem-choices">${v.choix.map((c, k) => `<button type="button" class="pem-choice" data-k="${k}">${esc(c.texte)}</button>`).join('')}</div>
            ${q.retour ? `<p class="pem-fb ${q.retour.ok ? 'ok' : 'ko'}">${esc(q.retour.t)}</p>` : ''}`;
        };
        body.addEventListener('click', (ev) => {
          if (ev.target.closest('[data-voy]')) { nouveau(); dessiner(); return; }
          const b = ev.target.closest('.pem-choice');
          if (!b || !zone.contains(b)) return;
          const q = u.voy;
          const v = q.ordre[q.i];
          const c = v.choix[Number(b.dataset.k)];
          const ok = c.img === v.img;
          if (ok) q.score += 1;
          q.retour = { ok, t: ok ? 'Exact.' : `Non : ${v.texte}` };
          q.i += 1;
          dessiner();
          // Focus clavier sur la première réponse suivante (ou « Recommencer »), pas perdu sur la page.
          zone.querySelector('.pem-choice, [data-voy]')?.focus({ preventScroll: true });
        });
        dessiner();
      }

      // ------------------------------------------------------------ 4. simulateur
      function etapeSimulateur(body, titre, e) {
        const sim = u.sim;
        const p0 = prog();
        const ouverte = u.mission || d.missions.find((m) => !p0.missions[m.id])?.id || d.missions[0].id;
        body.innerHTML = `${titre('Simulateur de la console ERIS', 'Faites les missions dans l’ordre : chaque étape se coche toute seule quand elle est faite. Vous pouvez aussi manipuler librement. L’écran reprend celui de la machine (libellés en anglais) ; les commandes sous l’écran sont traduites.', e.page)}
          <div class="pem-sim">
            <aside class="pem-missions" aria-label="Missions">${d.missions.map((m, k) => `
              <details class="pem-m${p0.missions[m.id] ? ' ok' : ''}" data-m="${esc(m.id)}" ${ouverte === m.id ? 'open' : ''}>
                <summary><span class="pem-m-n">${p0.missions[m.id] ? '✓' : k + 1}</span><span class="pem-m-t">${esc(m.titre)}</span></summary>
                <div class="pem-m-body"><p>${esc(m.but)} ${pageBtn(m.page)}</p>
                  <ol class="pem-m-steps"></ol>
                  <div class="pem-m-act"><button type="button" class="btn primary" data-start="${esc(m.id)}">${u.mission === m.id ? 'Recommencer' : 'Commencer'}</button>
                  ${m.declencheur ? `<button type="button" class="btn" data-alarme="${m.declencheur}">Déclencher l’alarme</button>` : ''}</div>
                </div>
              </details>`).join('')}
            </aside>
            <div class="pem-console">
              <div class="pem-now" aria-live="polite"></div>
              <div class="pem-opts">
                <div class="pem-tabs" role="group" aria-label="Affichage"><button type="button" class="chip" data-vue="3d" aria-pressed="${u.vue === '3d'}">Console 3D</button><button type="button" class="chip" data-vue="2d" aria-pressed="${u.vue === '2d'}">Écran 2D</button></div>
                <label class="pem-fr"><input type="checkbox" ${u.fr ? 'checked' : ''}> Traduire l’écran en français (sur la machine, l’écran est en anglais)</label>
              </div>
              <div class="pem-3d"${u.vue === '3d' ? '' : ' hidden'}></div>
              <p class="pem-small pem-3d-aide"${u.vue === '3d' ? '' : ' hidden'}>3D : glisser une manette pour l’incliner (elle reste en place ; la toucher sans glisser la recentre) · appuyer sur les boutons des têtes de manette (survoler un bouton affiche sa fonction ; l’actif s’allume en orange) · touche Mode sur le côté gauche de la manette gauche · arrêt d’urgence, interrupteur à droite · toucher un nom à l’écran = appuyer sur son bouton · glisser ailleurs pour tourner la vue · pour lire l’écran : zoomer (molette, deux doigts) ou choisir « Écran 2D ».</p>
              <div class="pem-screen"${u.vue === '2d' ? '' : ' hidden'}><div class="pem-screen-in"></div></div>
              <div class="pem-msg" aria-live="polite"></div>
              <div class="pem-deck"></div>
              <p class="pem-small pem-keys">Clavier (après un clic dans la console) : manette gauche W A S D, manette droite ← ↑ → ↓, touche Mode : M (maintenir). À la souris ou au doigt, une flèche touchée reste maintenue : la toucher de nouveau (ou ●) pour relâcher.</p>
            </div>
          </div>`;
        const scr2d = body.querySelector('.pem-screen-in');
        const zone3d = body.querySelector('.pem-3d');
        let c3 = null;
        const ouvrir3d = () => {
          if (c3 || u.vue !== '3d') return;
          try {
            c3 = creerConsole3D(zone3d, sim, { agir: () => tout(), plein: body.querySelector('.pem-console') });
            const r = document.createElement('button');
            r.type = 'button'; r.className = 'btn pem-3d-reset'; r.dataset.recentrer = ''; r.textContent = 'Recentrer';
            zone3d.appendChild(r);
          } catch (err) {
            console.error(err);
            u.vue = '2d';
            zone3d.hidden = true;
            body.querySelector('.pem-screen').hidden = false;
          }
        };
        const scr = { set innerHTML(h) { (c3 && u.vue === '3d' ? c3.ecran : scr2d).innerHTML = h; } };
        const now = body.querySelector('.pem-now');
        const deck = body.querySelector('.pem-deck');
        const msgEl = body.querySelector('.pem-msg');
        let sig = '';
        let dernierMsg = 0;

        const missionCourante = () => d.missions.find((m) => m.id === u.mission);
        const cond = (si) => {
          const et = sim.etat();
          return Object.entries(si).every(([k, v]) => {
            if (k === 'visite' || k === 'action') return sim.s.visite.has(v);
            if (k === 'actionDebut') return [...sim.s.visite].some((x) => x.startsWith(v));
            return et[k] === v;
          });
        };
        const verifier = () => {
          const m = missionCourante();
          if (!m) return;
          u.etapesM = u.etapesM || {};
          let k = u.etapesM[m.id] ?? 0;
          while (k < m.etapes.length && cond(m.etapes[k].si)) k += 1;
          if (k !== (u.etapesM[m.id] ?? 0)) {
            u.etapesM[m.id] = k;
            dessinerMissions();
            if (k === m.etapes.length) {
              fait(eq.id, 'missions', m.id);
              const tout = d.missions.every((x) => prog().missions[x.id]);
              if (tout) fait(eq.id, 'etapes', 'simulateur');
              ctx.toast(`Mission réussie : ${m.titre}`);
              dessinerMissions();
            }
          }
        };
        function dessinerMissions() {
          const p = prog();
          // Consigne en cours, au-dessus de l'écran (visible même quand la liste des missions est plus bas).
          const mc = missionCourante();
          const kc = mc ? (u.etapesM?.[mc.id] ?? 0) : 0;
          const focusNow = now.contains(document.activeElement);
          now.innerHTML = !mc ? '<span>Choisissez une mission dans la liste, ou manipulez librement la console.</span>'
            : kc >= mc.etapes.length ? `<b>✓ Mission réussie : ${esc(mc.titre)}</b>${d.missions[d.missions.indexOf(mc) + 1] ? `<button type="button" class="btn primary" data-start="${esc(d.missions[d.missions.indexOf(mc) + 1].id)}">Mission suivante ${icon('droite', { size: 14 })}</button>` : ''}`
              : `<span class="pem-now-k">Mission ${d.missions.indexOf(mc) + 1} · étape ${kc + 1}/${mc.etapes.length}</span><span>${esc(mc.etapes[kc].t)}</span>`;
          now.classList.toggle('ok', !!mc && kc >= mc.etapes.length);
          // « Mission suivante » remplacé alors qu'il avait le focus : le focus reste dans la console.
          if (focusNow && !now.contains(document.activeElement)) body.querySelector('.pem-console')?.focus({ preventScroll: true });
          body.querySelectorAll('.pem-m').forEach((det) => {
            const m = d.missions.find((x) => x.id === det.dataset.m);
            const k = u.mission === m.id ? (u.etapesM?.[m.id] ?? 0) : (p.missions[m.id] ? m.etapes.length : -1);
            det.classList.toggle('ok', !!p.missions[m.id]);
            det.querySelector('.pem-m-n').textContent = p.missions[m.id] ? '✓' : String(d.missions.indexOf(m) + 1);
            det.querySelector('.pem-m-steps').innerHTML = m.etapes.map((st, j) => `<li class="${j < k ? 'ok' : j === k ? 'now' : ''}">${esc(st.t)} ${pageBtn(st.page)}</li>`).join('');
          });
        }

        const dessinerEcran = () => {
          scr.innerHTML = ecran(sim, { fr: u.fr, alarmes, img });
        };
        const dessinerMsg = () => {
          const m = sim.s.message;
          if (!m || m.t === dernierMsg) return;
          dernierMsg = m.t;
          msgEl.className = `pem-msg ${m.ton}`;
          msgEl.innerHTML = `<span>${esc(m.texte)}</span>${m.page ? pageBtn(m.page) : ''}`;
        };
        // Clé de l'élément qui a le focus dans le pupitre : il est retrouvé après le rendu (focus clavier gardé).
        const cleFocus = (e) => {
          if (!e || !deck.contains(e)) return null;
          const pad = e.closest('.pem-pad');
          if (pad && e.dataset.dir) return `.pem-pad[data-side="${pad.dataset.side}"] [data-dir="${e.dataset.dir}"]`;
          if (e.dataset.id) return `.pem-key[data-side="${e.dataset.side}"][data-id="${CSS.escape(e.dataset.id)}"]`;
          for (const a of ['data-power', 'data-estop', 'data-ext', 'data-modekey']) if (e.hasAttribute(a)) return `[${a}]`;
          return null;
        };
        let sigDeck = '';
        const dessinerDeck = () => {
          const s = sim.s;
          const focus = cleFocus(document.activeElement);
          const { L, R } = sim.axes();
          const btns = (ids, side) => ids.map((id) => {
            const on = side === 'L' ? (id === sim.couche() || sim.actif(id)) : sim.actif(id);
            const pos = BOUTON[side][id];
            return `<button type="button" class="pem-key${on ? ' on' : ''}" data-side="${side}" data-id="${esc(id)}" title="${esc(`${T[id]?.[1] || id}${pos ? ` — bouton ${POSITION[pos]} de la manette` : ''}`)}"><b>${esc(T[id]?.[0] || id)}</b><span>${esc(court(id))}</span></button>`;
          }).join('');
          deck.innerHTML = `
            <div class="pem-js">
              <h4>Manette gauche <span class="pem-small">${sim.couche() ? `couche ${esc(T[sim.couche()]?.[0] || '')}` : ''}</span></h4>
              <button type="button" class="pem-mode${s.modeKey ? ' on' : ''}" aria-pressed="${s.modeKey}" data-modekey>Touche Mode ${s.modeKey ? '(maintenue)' : ''}</button>
              ${pad('L', s.modeKey ? { up: null, down: null, left: '◀ mode', right: 'mode ▶' } : lbl(L), { pos: s.L })}
              <div class="pem-keys-l">${btns(sim.couches(), 'L')}</div>
            </div>
            <div class="pem-mid">
              <button type="button" class="pem-power${s.power ? ' on' : ''}" data-power aria-pressed="${s.power}"><span></span>Marche/arrêt</button>
              <button type="button" class="pem-estop${s.estop ? ' on' : ''}" data-estop aria-pressed="${s.estop}"><span></span>${s.estop ? 'Tourner pour relâcher' : 'Arrêt d’urgence'}</button>
              <button type="button" class="pem-ext" data-ext><span></span>Extincteur</button>
            </div>
            <div class="pem-js">
              <h4>Manette droite</h4>
              ${pad('R', lbl(R), { pos: s.R })}
              <div class="pem-keys-r">${btns(sim.fonctions(), 'R')}</div>
            </div>`;
          sigDeck = signatureDeck();
          // Bouton disparu au redessin (autre couche, autre mode) : le focus reste dans la console (clavier actif).
          if (focus) (deck.querySelector(focus) || body.querySelector('.pem-console'))?.focus({ preventScroll: true });
        };
        /** Ce que montre le pupitre : il n'est redessiné que si cela change. */
        const signatureDeck = () => {
          const s = sim.s;
          return JSON.stringify([s.power, s.estop, s.modeKey, s.L, s.R, sim.couche(), sim.couches(), sim.fonctions(), [...sim.couches(), ...sim.fonctions()].map((id) => sim.actif(id)), sim.axes()]);
        };
        const lbl = (a) => Object.fromEntries(Object.entries(a).map(([k, id]) => [k, id ? court(id) : null]));
        const tout = () => { dessinerEcran(); dessinerDeck(); dessinerMsg(); verifier(); sig = signature(); };
        const signature = () => {
          const s = sim.s;
          return [s.mode, sim.couche(), s.swing | 0, s.dump | 0, s.position | 0, s.cap | 0, s.profondeur.toFixed(1), Math.round(s.debitEau), s.klaxon > 0, s.recul > 0, s.lock, s.alarmes.length, new Date().getMinutes()].join('|');
        };

        body.addEventListener('change', (ev) => {
          if (ev.target.closest('.pem-fr')) { u.fr = ev.target.checked; dessinerEcran(); }
        });
        body.addEventListener('click', (ev) => {
          const t = ev.target;
          const start = t.closest('[data-start]');
          if (start) {
            const m = d.missions.find((x) => x.id === start.dataset.start);
            u.mission = m.id;
            u.etapesM = { ...(u.etapesM || {}), [m.id]: 0 };
            sim.preparer(m.id === 'demarrer' ? 'eteint' : 'pret');
            body.querySelectorAll('.pem-m').forEach((x) => { x.open = x.dataset.m === m.id; x.querySelector('[data-start]').textContent = x.dataset.m === m.id ? 'Recommencer' : 'Commencer'; });
            dessinerMissions();
            tout();
            return;
          }
          const al = t.closest('[data-alarme]');
          if (al) {
            if (!sim.s.power) sim.preparer('pret');
            sim.alarme(Number(al.dataset.alarme));
            const a = alarmes.get(Number(al.dataset.alarme));
            sim.s.message = { texte: `Alarme ${a.n}. ${a.nom} — ${a.effet}. ${a.detail}`, ton: 'danger', page: 132, t: Date.now() };
            tout();
            return;
          }
          if (t.closest('[data-power]')) { sim.power(); tout(); return; }
          if (t.closest('[data-estop]')) { sim.estop(!sim.s.estop); tout(); return; }
          const v = t.closest('[data-vue]');
          if (v) {
            u.vue = v.dataset.vue;
            body.querySelectorAll('[data-vue]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vue === u.vue)));
            zone3d.hidden = u.vue !== '3d';
            body.querySelector('.pem-3d-aide').hidden = u.vue !== '3d';
            body.querySelector('.pem-screen').hidden = u.vue !== '2d';
            if (u.vue === '3d') ouvrir3d(); else if (c3) { c3.arreter(); c3 = null; }
            dessinerEcran();
            return;
          }
          if (t.closest('[data-recentrer]')) { c3?.recentrer(); return; }
          // Nom touché à l'écran (2D ou 3D) : même effet que le bouton de la manette.
          const li = t.closest('[data-er-id]');
          if (li) { sim.bouton(li.dataset.erSide, li.dataset.erId); tout(); return; }
          if (t.closest('[data-ext]')) {
            sim.s.message = { texte: 'Actionneur du système extincteur automatique : à n’utiliser qu’en cas d’incendie. Une fois déployé, l’unité de forage s’arrête (alarme 2). Non déclenché dans le simulateur.', ton: 'warn', page: 131, t: Date.now() };
            dessinerMsg();
            return;
          }
          if (t.closest('[data-modekey]')) { sim.modeKey(!sim.s.modeKey); tout(); return; }
          const k = t.closest('.pem-key');
          if (k) { sim.bouton(k.dataset.side, k.dataset.id); tout(); return; }
          const dir = t.closest('.pem-deck .pem-pad [data-dir]');
          if (dir) {
            const side = dir.closest('.pem-pad').dataset.side;
            const pos = { ...sim.s[side] };
            if (side === 'L' && sim.s.modeKey && (dir.dataset.dir === 'left' || dir.dataset.dir === 'right')) {
              // Touche Mode maintenue : un toucher = un changement de mode (aller-retour de la manette).
              sim.stick('L', dir.dataset.dir === 'left' ? -1 : 1, 0);
              sim.stick('L', 0, 0);
              tout();
              return;
            }
            if (dir.dataset.dir === 'centre') { pos.x = 0; pos.y = 0; }
            else {
              const [axe, v] = { up: ['y', 1], down: ['y', -1], left: ['x', -1], right: ['x', 1] }[dir.dataset.dir];
              pos[axe] = pos[axe] === v ? 0 : v;
            }
            sim.stick(side, pos.x, pos.y);
            tout();
          }
        });

        // Clavier : W A S D, flèches, M.
        const CLES = { w: ['L', 'y', 1], s: ['L', 'y', -1], a: ['L', 'x', -1], d: ['L', 'x', 1], ArrowUp: ['R', 'y', 1], ArrowDown: ['R', 'y', -1], ArrowLeft: ['R', 'x', -1], ArrowRight: ['R', 'x', 1] };
        // Le clavier ne commande la console que si le focus est dans la console (clic ou tabulation) : ailleurs,
        // les flèches gardent leur rôle (défilement de la page).
        const consoleEl = body.querySelector('.pem-console');
        consoleEl.tabIndex = -1;
        // En capture : la console 3D arrête la propagation des appuis sur ses commandes.
        consoleEl.addEventListener('pointerdown', () => { if (!consoleEl.contains(document.activeElement)) consoleEl.focus({ preventScroll: true }); }, true);
        const enfoncees = new Set(); // touches tenues (relâchées à l'arrêt ou quand la fenêtre perd le focus)
        const touche = (ev, bas) => {
          if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
          const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
          if (bas && (!consoleEl.contains(document.activeElement) || ev.target.closest('input, textarea, select'))) return;
          if (!bas && !enfoncees.has(k)) return;
          if (k === 'm') { ev.preventDefault(); if (ev.repeat) return; sim.modeKey(bas); if (bas) enfoncees.add(k); else enfoncees.delete(k); tout(); return; }
          const c = CLES[k];
          if (!c) return;
          ev.preventDefault();
          if (ev.repeat) return;
          if (bas) enfoncees.add(k); else enfoncees.delete(k);
          const [side, axe, v] = c;
          const pos = { ...sim.s[side] };
          if (bas) pos[axe] = v;
          else if (pos[axe] === v) pos[axe] = 0;
          else return;
          sim.stick(side, pos.x, pos.y);
          tout();
        };
        const relacher = () => {
          for (const k of [...enfoncees]) touche({ key: k, ctrlKey: false, metaKey: false, altKey: false, repeat: false, preventDefault() {}, target: consoleEl }, false);
          enfoncees.clear();
        };
        const kd = (ev) => touche(ev, true);
        const ku = (ev) => touche(ev, false);
        document.addEventListener('keydown', kd);
        document.addEventListener('keyup', ku);
        window.addEventListener('blur', relacher);

        // Boucle : axes maintenus, forage, avertisseur.
        let raf = 0;
        let t0 = performance.now();
        const boucle = (t) => {
          const dt = Math.min(0.1, (t - t0) / 1000);
          t0 = t;
          sim.tick(dt);
          const sg = signature();
          if (sg !== sig) { sig = sg; dessinerEcran(); dessinerMsg(); verifier(); if (signatureDeck() !== sigDeck) dessinerDeck(); }
          raf = requestAnimationFrame(boucle);
        };
        raf = requestAnimationFrame(boucle);
        arret = () => { relacher(); cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); window.removeEventListener('blur', relacher); c3?.arreter(); c3 = null; };
        ouvrir3d();

        dessinerMissions();
        tout();
      }

      // ------------------------------------------------------------ 5. alarmes
      function etapeAlarmes(body, titre, e) {
        fait(eq.id, 'etapes', 'alarmes');
        const effets = [...new Set(d.alarmes.map((a) => a.effet))];
        body.innerHTML = `${titre('Alarmes et arrêts', 'La machine se protège : selon l’alarme, elle arrête l’unité de forage, la pompe hydraulique, le compresseur ou la pompe à eau, ou affiche un simple avertissement. Les alarmes actives défilent en bas de l’écran ; le silence et la réinitialisation se font seulement depuis l’écran Error (mode SYSTEM).', e.page)}
          <div class="pem-al-sum">${effets.map((ef) => `<button type="button" class="card-box pem-al-k" data-ef="${esc(ef)}"><b>${d.alarmes.filter((a) => a.effet === ef).length}</b><span>${esc(ef)}</span></button>`).join('')}</div>
          <label class="pem-search">${icon('recherche', { size: 16 })}<input type="search" placeholder="Chercher une alarme (ex. : huile, arrêt d’urgence, câble)" aria-label="Chercher une alarme"></label>
          <p class="pem-small pem-al-n"></p>
          <ol class="pem-al"></ol>
          <p class="pem-small">Certaines alarmes ou certains arrêts concernent des options qui ne s’appliquent peut-être pas à votre unité ${pageBtn(131)}</p>`;
        const liste = body.querySelector('.pem-al');
        let filtre = null;
        const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const dessiner = () => {
          const q = norm(body.querySelector('.pem-search input').value).split(/\s+/).filter(Boolean);
          const vis = d.alarmes.filter((a) => (!filtre || a.effet === filtre) && q.every((m) => norm(`${a.n} ${a.nom} ${a.effet} ${a.detail}`).includes(m)));
          body.querySelectorAll('.pem-al-k').forEach((b) => b.classList.toggle('on', b.dataset.ef === filtre));
          body.querySelector('.pem-al-n').textContent = `${vis.length} alarme${vis.length > 1 ? 's' : ''} sur ${d.alarmes.length}${filtre ? ` · ${filtre}` : ''}`;
          liste.innerHTML = vis.map((a) => {
            const grave = a.effet.startsWith('Arrête l\'unité');
            const reset = /Réinitialisation requise|nécessite une réinitialisation|Nécessite une réinitialisation/.test(a.detail);
            const coupure = /couper l'alimentation électrique principale/.test(a.detail);
            return `<li class="card-box pem-al-i${grave ? ' grave' : a.effet.startsWith('Indicateur') ? ' avert' : ''}">
              <span class="pem-al-num">${a.n}</span>
              <div><h4>${esc(a.nom)}</h4><p class="pem-al-ef">${esc(a.effet)}</p><p>${esc(a.detail)}</p>
              <p class="pem-tags">${reset ? '<span class="chip">Réinitialisation requise</span>' : ''}${coupure ? '<span class="chip">Couper l’alimentation principale pour réinitialiser</span>' : ''}</p></div>
            </li>`;
          }).join('');
        };
        body.addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-ef]');
          if (!b) return;
          filtre = filtre === b.dataset.ef ? null : b.dataset.ef;
          dessiner();
        });
        body.querySelector('.pem-search input').addEventListener('input', dessiner);
        dessiner();
      }

      // ------------------------------------------------------------ 6. quiz
      function etapeQuiz(body, titre) {
        body.innerHTML = `${titre('Quiz final', `${d.quiz.length} questions sur ce qu’il faut savoir avant de toucher la console. Il faut ${Math.ceil(d.quiz.length * 0.8)} bonnes réponses pour réussir.`, null)}<section class="card-box pem-quiz" aria-live="polite"></section>`;
        const zone = body.querySelector('.pem-quiz');
        const nouveau = () => { u.quiz = { ordre: melange(d.quiz.map((q) => ({ ...q, choix: melange(q.r.map((t, k) => ({ t, ok: k === q.ok }))) }))), i: 0, score: 0, rep: null }; };
        if (!u.quiz) nouveau();
        const dessiner = () => {
          const q = u.quiz;
          if (q.i >= q.ordre.length) {
            const reussi = q.score >= Math.ceil(q.ordre.length * 0.8);
            if (reussi) fait(eq.id, 'etapes', 'quiz');
            const p = lire(eq.id);
            if (q.score > (p.quiz || 0)) { p.quiz = q.score; ecrire(eq.id, p); }
            zone.innerHTML = `<div class="pem-result ${reussi ? 'ok' : ''}"><b>${q.score} / ${q.ordre.length}</b>
              <p>${reussi ? 'Réussi ! Vous avez les bases de la console ERIS. Prochaine étape : la formation sur la machine avec un opérateur qualifié.' : 'Pas encore : revoyez les étapes et le simulateur, puis recommencez.'}</p>
              <button type="button" class="btn primary" data-quiz="again">Recommencer le quiz</button></div>`;
            return;
          }
          const x = q.ordre[q.i];
          zone.innerHTML = `<div class="pem-qhead"><span class="pem-small">Question ${q.i + 1} / ${q.ordre.length}</span><span class="pem-small">Score : ${q.score}</span></div>
            <div class="pem-bar"><span style="width:${(100 * q.i) / q.ordre.length}%"></span></div>
            <h3>${esc(x.q)}</h3>
            <div class="pem-choices">${x.choix.map((c, k) => `<button type="button" class="pem-choice${q.rep != null ? (c.ok ? ' ok' : k === q.rep ? ' ko' : '') : ''}" data-k="${k}" ${q.rep != null ? 'disabled' : ''}>${esc(c.t)}</button>`).join('')}</div>
            ${q.rep != null ? `<p class="pem-fb ${x.choix[q.rep].ok ? 'ok' : 'ko'}">${x.choix[q.rep].ok ? 'Exact.' : `Non. Bonne réponse : ${esc(x.choix.find((c) => c.ok).t)}.`} ${pageBtn(x.page, `Voir p. ${x.page}`)}</p>
              <button type="button" class="btn primary" data-quiz="next">${q.i + 1 < q.ordre.length ? 'Question suivante' : 'Voir le résultat'} ${icon('droite', { size: 16 })}</button>` : ''}`;
        };
        body.addEventListener('click', (ev) => {
          const a = ev.target.closest('[data-quiz]');
          const q = u.quiz;
          if (a) {
            if (a.dataset.quiz === 'again') nouveau();
            else { q.i += 1; q.rep = null; }
            dessiner();
            zone.querySelector('.pem-choice, [data-quiz]')?.focus({ preventScroll: true });
            return;
          }
          const b = ev.target.closest('.pem-choice');
          if (!b || q.rep != null) return;
          q.rep = Number(b.dataset.k);
          if (q.ordre[q.i].choix[q.rep].ok) q.score += 1;
          dessiner();
          zone.querySelector('[data-quiz="next"]')?.focus({ preventScroll: true });
        });
        dessiner();
      }

      rendre();
      el.closest('.wp-body')?.scrollTo({ top: 0 });
    }

    /** Croix directionnelle d'une manette : flèches (avec leur fonction) et ● pour relâcher. */
    function pad(side, labels, { pos = null, simple = false } = {}) {
      const on = (k) => pos && ((k === 'up' && pos.y > 0) || (k === 'down' && pos.y < 0) || (k === 'left' && pos.x < 0) || (k === 'right' && pos.x > 0));
      const b = (k, sym) => {
        const t = labels?.[k];
        return `<button type="button" class="pem-dir d-${k}${on(k) ? ' on' : ''}${!simple && !t ? ' vide' : ''}" data-dir="${k}" aria-pressed="${!!on(k)}" aria-label="${esc(`${side === 'L' ? 'Manette gauche' : 'Manette droite'} ${{ up: 'pousser', down: 'tirer', left: 'à gauche', right: 'à droite' }[k]}${t ? ` : ${t}` : ''}`)}"><i>${sym}</i>${simple ? '' : `<small>${esc(t || '—')}</small>`}</button>`;
      };
      return `<div class="pem-pad${simple ? ' simple' : ''}" data-side="${side}">
        ${b('up', '▲')}${b('left', '◀')}<button type="button" class="pem-dir d-centre" data-dir="centre" aria-label="Relâcher la manette"><i>●</i></button>${b('right', '▶')}${b('down', '▼')}
      </div>`;
    }
  },
};
