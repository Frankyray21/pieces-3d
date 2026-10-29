// Commandes posées sur la console 3D : pour chaque manette, quatre flèches translucides autour du soufflet (fonction
// de chaque axe dans l'écran affiché) et une colonne d'étiquettes pour ses boutons (couches à gauche, fonctions à
// droite), chacune reliée par un trait au bouton qu'elle commande sur la tête — comme les vignettes de manette des
// copies d'écran du manuel. La fonction active est en orange. Toucher une flèche incline la manette (elle reste
// inclinée ; la toucher de nouveau la relâche), toucher une étiquette appuie sur le bouton.
//
// Le contenu (libellés, états) n'est refait que lorsqu'il change ; les positions suivent la 3D à chaque image
// (transformations seulement : rotation de la vue, zoom, plein écran restent fluides). Vue trop petite : rien n'est
// affiché, le pupitre de la page prend le relais (attribut data-cmd du conteneur absent).
import { T, BOUTON } from './eris.js';
import { court } from './ecran.js';

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SENS = { up: ['y', 1], down: ['y', -1], left: ['x', -1], right: ['x', 1] };
const SYMBOLE = { up: '▲', down: '▼', left: '◀', right: '▶' };
/** Taille minimale de la vue pour poser les commandes dessus (px). */
const MIN_L = 760;
const MIN_H = 380;
/** Échelle des commandes selon la taille de la vue (lisibles en plein écran, compactes sinon). */
const echelle = (W, H) => Math.round(Math.min(1.25, Math.max(0.8, Math.min(W / 1300, H / 760))) * 100) / 100;
/** Largeur maximale d'une colonne d'étiquettes (px à l'échelle 1). */
const COL = 168;
/**
 * Part de la largeur de la vue à garder libre de chaque côté de la console pour les colonnes d'étiquettes, posées
 * contre les bords (0 si les commandes ne sont pas affichées à cette taille).
 */
export function margeCote(W, H) {
  if (W < MIN_L || H < MIN_H) return 0;
  return Math.min(0.24, (COL * echelle(W, H) + 26) / W);
}

/**
 * conteneur : vue 3D ; sim : createSim() ; geo : { bouton(side, pos) → {x, y} | null, base(side) → {x, y},
 * tete(side) → {x, y} } (positions à l'écran, px dans le conteneur) ; agir() : après une action.
 */
export function creerCommandes(conteneur, sim, geo, { agir = () => {} } = {}) {
  const racine = document.createElement('div');
  racine.className = 'c3-cmd';
  racine.innerHTML = '<svg class="c3-cmd-traits" aria-hidden="true"></svg><div class="c3-cmd-L"></div><div class="c3-cmd-R"></div>';
  conteneur.appendChild(racine);
  const svg = racine.querySelector('svg');
  const zone = { L: racine.querySelector('.c3-cmd-L'), R: racine.querySelector('.c3-cmd-R') };
  let signature = '';
  let visible = null;
  let mesures = null; // tailles des colonnes et des étiquettes (refaites après un rendu ou un changement d'échelle)
  let tracesPrec = '';

  /** Étiquettes de la manette : [{ id, pos, on, en, fr }] (couches à gauche avec la touche Mode, fonctions à droite). */
  const etiquettes = (side) => {
    const s = sim.s;
    const ids = side === 'L' ? sim.couches() : sim.fonctions();
    const liste = ids.map((id) => ({
      id, pos: BOUTON[side][id] || null, en: T[id]?.[0] || id, fr: court(id),
      on: s.power && (side === 'L' ? id === sim.couche() || sim.actif(id) : sim.actif(id)),
    }));
    if (side === 'L') liste.unshift({ id: 'mode', pos: 'C', en: 'Touche Mode', fr: s.modeKey ? 'maintenue : ◀ ▶ change de mode' : 'maintenir + ◀ ▶', on: s.power && s.modeKey });
    return liste;
  };

  /** Fonctions des axes : { up: { en, fr } | null, … } ; touche Mode tenue : changement de mode à gauche et à droite. */
  const axes = (side) => {
    const a = sim.axes();
    if (side === 'L' && sim.s.modeKey) return { up: null, down: null, left: { en: '◀ Mode', fr: 'mode précédent' }, right: { en: 'Mode ▶', fr: 'mode suivant' } };
    const out = {};
    for (const k of Object.keys(SENS)) out[k] = a[side][k] ? { en: T[a[side][k]]?.[0] || a[side][k], fr: court(a[side][k]) } : null;
    return { ...out, pointeurs: side === 'L' || a.pointeursR !== false };
  };

  const rendre = () => {
    const s = sim.s;
    for (const side of ['L', 'R']) {
      const ax = axes(side);
      const pos = side === 'L' && s.modeKey ? { x: 0, y: 0 } : s[side];
      const fleches = Object.keys(SENS).map((k) => {
        const f = ax[k];
        const [axe, v] = SENS[k];
        const on = !!f && pos[axe] === v;
        const actif = !!f && ax.pointeurs !== false;
        return `<button type="button" class="c3-fl c3-fl-${k}${on ? ' on' : ''}${actif ? '' : ' vide'}" data-cmd-axe="${side}:${k}" aria-pressed="${on}" ${actif ? '' : 'tabindex="-1"'}
          aria-label="${esc(`Manette ${side === 'L' ? 'gauche' : 'droite'}, ${{ up: 'pousser', down: 'tirer', left: 'à gauche', right: 'à droite' }[k]}${f ? ` : ${f.en} (${f.fr})` : ''}`)}"><i aria-hidden="true">${SYMBOLE[k]}</i></button>
          ${f ? `<span class="c3-lb c3-lb-${k}${on ? ' on' : ''}${actif ? '' : ' vide'}" aria-hidden="true"><b>${esc(f.en)}</b><small>${esc(f.fr)}</small></span>` : ''}`;
      }).join('');
      const chips = etiquettes(side).map((e) => `<button type="button" class="c3-chip${e.on ? ' on' : ''}" data-cmd-id="${esc(side)}:${esc(e.id)}" data-pos="${esc(e.pos || '')}" aria-pressed="${e.on}"
        title="${esc(T[e.id]?.[1] || e.fr)}"><b>${esc(e.en)}</b><small>${esc(e.fr)}</small></button>`).join('');
      // Focus clavier gardé sur la même commande après le rendu.
      const f = document.activeElement && zone[side].contains(document.activeElement) ? (document.activeElement.dataset.cmdAxe || document.activeElement.dataset.cmdId) : null;
      zone[side].innerHTML = `<div class="c3-croix" data-side="${side}">${fleches}<button type="button" class="c3-fl-c" data-cmd-axe="${side}:centre" aria-label="Relâcher la manette ${side === 'L' ? 'gauche' : 'droite'}">●</button></div><div class="c3-chips" data-side="${side}">${chips}</div>`;
      if (f) zone[side].querySelector(`[data-cmd-axe="${CSS.escape(f)}"], [data-cmd-id="${CSS.escape(f)}"]`)?.focus({ preventScroll: true });
    }
    mesures = null;
  };
  const mesurer = (k) => {
    const m = { k };
    for (const side of ['L', 'R']) {
      const col = zone[side].querySelector('.c3-chips');
      // Libellés de la croix tournés vers le bord (flèche du haut et flèche extérieure) : la colonne passe au-dessus.
      const taille = (sel) => { const e = zone[side].querySelector(sel); return e ? { w: e.offsetWidth, h: e.offsetHeight } : null; };
      m[side] = {
        cw: col.offsetWidth, ch: col.offsetHeight, haut: taille('.c3-lb-up'), ext: taille(side === 'L' ? '.c3-lb-left' : '.c3-lb-right'),
        chips: [...col.children].map((c) => ({ pos: c.dataset.pos, top: c.offsetTop, left: c.offsetLeft, w: c.offsetWidth, h: c.offsetHeight, on: c.classList.contains('on') })),
      };
    }
    return m;
  };

  const sig = () => {
    const s = sim.s;
    return JSON.stringify([s.power, s.modeKey, s.L, s.R, sim.couche(), sim.couches(), sim.fonctions(), sim.axes(),
      [...sim.couches(), ...sim.fonctions()].map((id) => sim.actif(id))]);
  };

  // Clics : flèches (bascule d'un axe, comme la croix du pupitre) et étiquettes (bouton de la manette).
  racine.addEventListener('pointerdown', (ev) => { if (ev.target.closest('button')) ev.stopPropagation(); });
  racine.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-cmd-axe]');
    if (a) {
      const [side, k] = a.dataset.cmdAxe.split(':');
      if (k === 'centre') sim.stick(side, 0, 0);
      else if (side === 'L' && sim.s.modeKey && (k === 'left' || k === 'right')) {
        sim.stick('L', k === 'left' ? -1 : 1, 0); // touche Mode tenue : un toucher = un changement de mode
        sim.stick('L', 0, 0);
      } else {
        const [axe, v] = SENS[k];
        const p = { ...sim.s[side] };
        p[axe] = p[axe] === v ? 0 : v;
        sim.stick(side, p.x, p.y);
      }
      agir();
      return;
    }
    const c = ev.target.closest('[data-cmd-id]');
    if (c) {
      const [side, id] = c.dataset.cmdId.split(':');
      if (id === 'mode') sim.modeKey(!sim.s.modeKey);
      else sim.bouton(side, id);
      agir();
    }
  });

  /** Place les commandes (à chaque image). */
  const placer = () => {
    const W = conteneur.clientWidth;
    const H = conteneur.clientHeight;
    const ok = W >= MIN_L && H >= MIN_H;
    if (ok !== visible) {
      visible = ok;
      racine.hidden = !ok;
      if (ok) conteneur.dataset.cmd = ''; else delete conteneur.dataset.cmd;
    }
    if (!ok) return;
    const sg = sig();
    if (sg !== signature) { signature = sg; rendre(); }
    const k = echelle(W, H);
    if (!mesures || mesures.k !== k) { racine.style.setProperty('--k', String(k)); mesures = mesurer(k); }
    const r = 62 * k; // rayon de la croix
    let traits = '';
    for (const side of ['L', 'R']) {
      const b = geo.base(side);
      const croix = zone[side].querySelector('.c3-croix');
      croix.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
      croix.style.setProperty('--r', `${r.toFixed(1)}px`);
      // Colonne d'étiquettes contre le bord de la vue, à la hauteur de la tête, sans descendre sur les libellés
      // gauche et droite de la croix (posés sous leur flèche) ; sous les boutons du haut de la vue.
      const t = geo.tete(side);
      const col = zone[side].querySelector('.c3-chips');
      const { ch, cw, chips, haut, ext } = mesures[side];
      const x = side === 'L' ? 10 : W - cw - 10;
      const sens = side === 'L' ? -1 : 1;
      // Rectangles [gauche, droite, haut] de ces libellés, d'après leur placement en CSS.
      const rect = (x0, w, top) => (side === 'L' ? [x0 - w, x0, top] : [x0, x0 + w, top]);
      const rHaut = haut && rect(b.x + sens * 23 * k, haut.w, b.y - r - haut.h / 2);
      const rExt = ext && rect(b.x + sens * (r - 17 * k), ext.w, b.y + 21 * k);
      const placerY = (lbs) => {
        let bas = b.y + 14 * k;
        for (const [g, d, top] of lbs) if (g < x + cw && d > x) bas = Math.min(bas, top - 6);
        return Math.min(H - ch - 8, Math.max(58, Math.min(t.y - ch / 2, bas - ch)));
      };
      let y = placerY([rHaut, rExt].filter(Boolean));
      // Vue trop basse pour passer au-dessus : le libellé du haut passe du côté de l'écran.
      const dedans = !!rHaut && rHaut[0] < x + cw && rHaut[1] > x && y + ch > rHaut[2] - 6;
      if (dedans) y = placerY([rExt].filter(Boolean));
      if (dedans !== (croix.dataset.haut === 'in')) { if (dedans) croix.dataset.haut = 'in'; else delete croix.dataset.haut; }
      col.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // Traits : de chaque étiquette au bouton qu'elle commande.
      for (const chip of chips) {
        const q = chip.pos && geo.bouton(side, chip.pos);
        if (!q) continue;
        const cy = y + chip.top + chip.h / 2;
        const cx = side === 'L' ? x + chip.left + chip.w : x + chip.left;
        const { on } = chip;
        traits += `<path d="M${cx.toFixed(1)} ${cy.toFixed(1)} L${q.x.toFixed(1)} ${q.y.toFixed(1)}" class="${on ? 'on' : ''}"/><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${(4.5 * k).toFixed(1)}" class="${on ? 'on' : ''}"/>`;
      }
    }
    const cle = `${W},${H}|${traits}`;
    if (cle !== tracesPrec) {
      tracesPrec = cle;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = traits;
    }
  };

  return {
    maj: placer,
    /** Vrai si les commandes sont posées sur la vue (sinon le pupitre de la page les remplace). */
    visibles: () => !!visible,
    detruire() { delete conteneur.dataset.cmd; racine.remove(); },
  };
}
