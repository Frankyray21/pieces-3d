// Commandes posées sur la console 3D : pour chaque manette, quatre flèches translucides autour du soufflet (fonction
// de chaque axe dans l'écran affiché) et une colonne d'étiquettes pour ses boutons (couches à gauche, fonctions à
// droite), chacune reliée par un trait au bouton qu'elle commande sur la tête — comme les vignettes de manette des
// copies d'écran du manuel. La fonction active est en orange. Toucher une flèche incline la manette (elle reste
// inclinée ; la toucher de nouveau la relâche), toucher une étiquette appuie sur le bouton. Une étiquette se déplace en
// la faisant glisser (son trait suit) ; la place choisie est gardée (part de la vue, donc suivie en plein écran) et
// « Recentrer » remet toutes les étiquettes à leur place.
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
const echelle = (W, H) => Math.round(Math.min(1.6, Math.max(0.85, Math.min(W / 1100, H / 650))) * 100) / 100;
/** Largeur maximale d'une colonne d'étiquettes (px à l'échelle 1). */
const COL = 190;
/** Glissement (px) au-delà duquel toucher une étiquette la déplace au lieu d'appuyer sur le bouton. */
const SEUIL = 6;
const CLE = 'pem-c3-etiquettes';
/** Places gardées (format { px, py } seulement ; une ancienne version gardait des décalages, ignorés). */
const lire = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CLE)) || {};
    return Object.fromEntries(Object.entries(v).filter(([, d]) => Number.isFinite(d?.px) && Number.isFinite(d?.py)));
  } catch { return {}; }
};
/** Bande du haut de la vue laissée aux boutons Plein écran et Recentrer. */
const HAUT = 58;
const ecrire = (v) => { try { localStorage.setItem(CLE, JSON.stringify(v)); } catch { /* stockage indisponible */ } };
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
  racine.innerHTML = '<svg class="c3-cmd-traits" aria-hidden="true"></svg><div class="c3-cmd-L"></div><div class="c3-cmd-R"></div>'
    + '<button type="button" class="c3-power" data-cmd-power><i aria-hidden="true">⏻</i><span></span></button>';
  conteneur.appendChild(racine);
  const svg = racine.querySelector('svg');
  // Interrupteur marche/arrêt : petit sur la console (côté droit du bloc droit, p. 121), doublé d'un bouton bien visible.
  const btnPower = racine.querySelector('.c3-power');
  let powerPrec = null;
  let powerPos = '';
  const zone = { L: racine.querySelector('.c3-cmd-L'), R: racine.querySelector('.c3-cmd-R') };
  let signature = '';
  let visible = null;
  let mesures = null; // tailles des colonnes et des étiquettes (refaites après un rendu ou un changement d'échelle)
  let tracesPrec = '';
  /**
   * Étiquettes déplacées : « side:id » → { px, py }, coin haut gauche en part de la largeur et de la hauteur de la
   * vue (place absolue : elle ne dépend ni du rang dans la colonne ni de la colonne compacte).
   */
  let decalages = lire();
  const affiche = new Map(); // « side:id » → { x, y, w, h } : place affichée à la dernière image
  let glisse = null; // { cle, id, x0, y0, gx, gy, bouge }
  let finGlisse = -1e9; // heure de fin du dernier déplacement (le clic qui le suit n'est pas un appui)
  // Colonne trop haute pour la vue (petit écran) : étiquettes sur une ligne, sans la traduction (gardée dans l'infobulle).
  const compacte = { L: false, R: false };
  const pleine = { L: null, R: null }; // colonne complète { ch, cw, k } mesurée, pour savoir quand elle tient de nouveau

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
        // Toutes les flèches inclinent la manette ; sans fonction sur cet axe (ou sans pointeurs, p. 138), elle est
        // seulement plus pâle et le simulateur explique pourquoi rien ne bouge.
        const on = pos[axe] === v;
        const actif = !!f && ax.pointeurs !== false;
        return `<button type="button" class="c3-fl c3-fl-${k}${on ? ' on' : ''}${actif ? '' : ' vide'}" data-cmd-axe="${side}:${k}" aria-pressed="${on}"
          aria-label="${esc(`Manette ${side === 'L' ? 'gauche' : 'droite'}, ${{ up: 'pousser', down: 'tirer', left: 'à gauche', right: 'à droite' }[k]}${f ? ` : ${f.en} (${f.fr})` : ''}`)}"><i aria-hidden="true">${SYMBOLE[k]}</i></button>
          ${f ? `<span class="c3-lb c3-lb-${k}${on ? ' on' : ''}${actif ? '' : ' vide'}" aria-hidden="true"><b>${esc(f.en)}</b><small>${esc(f.fr)}</small></span>` : ''}`;
      }).join('');
      const chips = etiquettes(side).map((e) => `<button type="button" class="c3-chip${e.on ? ' on' : ''}" data-cmd-id="${esc(side)}:${esc(e.id)}" data-pos="${esc(e.pos || '')}" aria-pressed="${e.on}"
        title="${esc(T[e.id]?.[1] || e.fr)}"><b>${esc(e.en)}</b><small>${esc(e.fr)}</small></button>`).join('');
      // Focus clavier gardé sur la même commande après le rendu.
      const f = document.activeElement && zone[side].contains(document.activeElement) ? (document.activeElement.dataset.cmdAxe || document.activeElement.dataset.cmdId) : null;
      zone[side].innerHTML = `<div class="c3-croix" data-side="${side}">${fleches}<button type="button" class="c3-fl-c" data-cmd-axe="${side}:centre" aria-label="Relâcher la manette ${side === 'L' ? 'gauche' : 'droite'}">●</button></div><div class="c3-chips${compacte[side] ? ' compacte' : ''}" data-side="${side}">${chips}</div>`;
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
        cw: col.offsetWidth, ch: col.offsetHeight, haut: taille('.c3-lb-up'), ext: taille(side === 'L' ? '.c3-lb-left' : '.c3-lb-right'), basLb: taille('.c3-lb-down'),
        chips: [...col.children].map((c) => ({ el: c, cle: c.dataset.cmdId, pos: c.dataset.pos, top: c.offsetTop, left: c.offsetLeft, w: c.offsetWidth, h: c.offsetHeight, on: c.classList.contains('on'), tr: '' })),
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
  racine.addEventListener('pointerdown', (ev) => {
    if (!ev.target.closest('button')) return;
    ev.stopPropagation();
    const c = ev.target.closest('.c3-chip');
    if (!c || ev.button > 0 || glisse) return;
    const a = affiche.get(c.dataset.cmdId);
    if (!a) return;
    finGlisse = -1e9;
    glisse = { cle: c.dataset.cmdId, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, a, bouge: false };
  });
  // Glissement suivi sur la fenêtre : l'étiquette peut être refaite (changement de couche) pendant le geste.
  const surBouge = (ev) => {
    if (!glisse || ev.pointerId !== glisse.id) return;
    const dx = ev.clientX - glisse.x0;
    const dy = ev.clientY - glisse.y0;
    if (!glisse.bouge && Math.hypot(dx, dy) < SEUIL) return;
    if (!glisse.bouge) { glisse.bouge = true; racine.classList.add('c3-glisse'); }
    ev.preventDefault();
    // Place gardée bornée comme à l'affichage (dans la vue, sous les boutons du haut).
    const W = Math.max(1, conteneur.clientWidth);
    const H = Math.max(1, conteneur.clientHeight);
    const { a } = glisse;
    const x = Math.min(W - a.w - 4, Math.max(4, a.x + dx));
    const y = Math.min(H - a.h - 4, Math.max(HAUT, a.y + dy));
    decalages[glisse.cle] = { px: x / W, py: y / H };
  };
  const surLache = (ev) => {
    if (!glisse || ev.pointerId !== glisse.id) return;
    if (glisse.bouge) { finGlisse = performance.now(); ecrire(decalages); }
    racine.classList.remove('c3-glisse');
    glisse = null;
  };
  window.addEventListener('pointermove', surBouge);
  window.addEventListener('pointerup', surLache);
  window.addEventListener('pointercancel', surLache);
  racine.addEventListener('click', (ev) => {
    // Clic qui suit un déplacement (au doigt, il peut arriver un peu après) : pas un appui.
    if (performance.now() - finGlisse < 450 && ev.target.closest('.c3-chip')) { finGlisse = -1e9; ev.preventDefault(); return; }
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
    if (ev.target.closest('[data-cmd-power]')) { sim.power(); agir(); return; }
    const c = ev.target.closest('[data-cmd-id]');
    if (c) {
      const [side, id] = c.dataset.cmdId.split(':');
      if (id === 'mode') sim.modeKey(!sim.s.modeKey);
      else sim.bouton(side, id);
      agir();
    }
  });

  /**
   * Hauteur qu'aurait la vue avec les commandes posées dessus : en plein écran, la vue prend toute la place laissée
   * par la consigne et les messages, y compris celle du pupitre de la page (caché quand les commandes sont
   * affichées) ; sans ce calcul, une vue basse à cause du pupitre le resterait. Les gouttières comptent pour chaque
   * rangée de la grille, même vide.
   */
  const hauteurPossible = (H) => {
    let plein = false;
    try { plein = !!conteneur.closest(':fullscreen, .c3-plein'); } catch { plein = !!conteneur.closest('.c3-plein'); }
    const P = conteneur.parentElement;
    if (visible || !plein || !P) return H;
    const st = getComputedStyle(P);
    let h = P.clientHeight - (parseFloat(st.paddingTop) || 0) - (parseFloat(st.paddingBottom) || 0);
    const rangees = st.display === 'grid' ? st.gridTemplateRows.split(' ').filter(Boolean).length : P.children.length;
    h -= Math.max(0, rangees - 1) * (parseFloat(st.rowGap) || 0);
    // Rangées occupées par autre chose que la vue et le pupitre : hauteur de la plus haute pièce de chaque rangée (la
    // consigne et le sélecteur de mission partagent la première).
    const parRangee = new Map();
    for (const e of P.children) {
      if (e === conteneur || e.matches('.pem-deck, .pem-keys') || !e.offsetParent) continue;
      const r = getComputedStyle(e).gridRowStart;
      const cle = r && r !== 'auto' ? r : e;
      parRangee.set(cle, Math.max(parRangee.get(cle) || 0, e.offsetHeight));
    }
    for (const v of parRangee.values()) h -= v;
    return Math.max(H, h);
  };

  /** Place les commandes (à chaque image). */
  const placer = () => {
    const W = conteneur.clientWidth;
    const H = conteneur.clientHeight;
    // Hystérésis : il faut 16 px de plus pour afficher que pour garder affiché (pas d'alternance à la limite).
    const ok = W >= MIN_L && (visible ? H >= MIN_H : hauteurPossible(H) >= MIN_H + 16);
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
    const r = 66 * k; // rayon de la croix
    let traits = '';
    let refaire = false; // colonne passée en compacte ou revenue complète : nouvelles mesures à l'image suivante
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
      const rHaut = haut && rect(b.x + sens * 25 * k, haut.w, b.y - r - haut.h / 2);
      const rExt = ext && rect(b.x + sens * (r - 19 * k), ext.w, b.y + 23 * k);
      // Flèches de la croix tournées vers le bord (haut et extérieure) : obstacles aussi.
      const fl = 19 * k + 4;
      const rFlHaut = [b.x - fl, b.x + fl, b.y - r - fl];
      const rFlExt = [b.x + sens * r - fl, b.x + sens * r + fl, b.y - fl];
      /** Bas permis pour une colonne de largeur l (contre le bord) : au-dessus des obstacles qu'elle croise. */
      const limite = (obs, l = cw) => {
        const x0 = side === 'L' ? 10 : W - l - 10;
        let bas = b.y + 14 * k;
        for (const [g, d, top] of obs) if (g < x0 + l && d > x0) bas = Math.min(bas, top - 6);
        return Math.min(H - 8, bas);
      };
      const placerY = (bas, h) => Math.max(HAUT, Math.min(t.y - h / 2, bas - h));
      const tous = [rHaut, rExt, rFlHaut, rFlExt].filter(Boolean);
      const sansHaut = [rExt, rFlHaut, rFlExt].filter(Boolean);
      let bas = limite(tous);
      // Vue trop basse pour passer au-dessus : le libellé du haut passe du côté de l'écran, seulement s'il croise la
      // colonne et que l'écarter fait gagner de la place.
      const dedans = !!rHaut && HAUT + ch > bas && rHaut[0] < x + cw && rHaut[1] > x && limite(sansHaut) > bas;
      if (dedans) bas = limite(sansHaut);
      if (dedans !== (croix.dataset.haut === 'in')) { if (dedans) croix.dataset.haut = 'in'; else delete croix.dataset.haut; }
      // Toujours trop haute : colonne compacte ; revient complète quand elle tient de nouveau (avec une marge).
      // (La colonne complète est plus large : elle se teste avec sa propre largeur.)
      if (!compacte[side]) pleine[side] = { ch, cw, k };
      const P = pleine[side];
      // (Colonne complète mesurée à une autre échelle : sa taille suit l'échelle.)
      const f = P ? k / P.k : 1;
      const veut = compacte[side] ? !P || HAUT + P.ch * f > limite(sansHaut, P.cw * f) - 12 : HAUT + ch > bas;
      if (veut !== compacte[side]) { compacte[side] = veut; col.classList.toggle('compacte', veut); refaire = true; }
      const y = placerY(bas, ch);
      col.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // Étiquettes déplacées (gardées dans la vue) ; traits : du point de l'étiquette le plus proche du bouton qu'elle
      // commande jusqu'à ce bouton.
      for (const chip of chips) {
        const d = decalages[chip.cle];
        const x0 = x + chip.left;
        const y0 = y + chip.top;
        let gx = x0;
        let gy = y0;
        if (d) {
          gx = Math.min(W - chip.w - 4, Math.max(4, d.px * W));
          gy = Math.min(H - chip.h - 4, Math.max(HAUT, d.py * H));
        }
        const tx = gx - x0;
        const ty = gy - y0;
        affiche.set(chip.cle, { x: gx, y: gy, w: chip.w, h: chip.h });
        const tr = tx || ty ? `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)` : '';
        if (tr !== chip.tr) { chip.tr = tr; chip.el.style.transform = tr; }
        const q = chip.pos && geo.bouton(side, chip.pos);
        if (!q) continue;
        const cx = Math.min(gx + chip.w, Math.max(gx, q.x));
        const cy = Math.min(gy + chip.h, Math.max(gy, q.y));
        const { on } = chip;
        traits += `<path d="M${cx.toFixed(1)} ${cy.toFixed(1)} L${q.x.toFixed(1)} ${q.y.toFixed(1)}" class="${on ? 'on' : ''}"/><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${(4.5 * k).toFixed(1)}" class="${on ? 'on' : ''}"/>`;
      }
    }
    const obstaclesPower = [];
    if (mesures.R) {
      // Libellés de la manette droite proches de l'interrupteur (flèche du bas et flèche extérieure) : [g, d, haut, bas].
      const b = geo.base('R');
      const r = 66 * k;
      const { basLb, ext } = mesures.R;
      if (basLb) { const top = b.y + r + 23 * k; obstaclesPower.push([b.x - basLb.w / 2, b.x + basLb.w / 2, top, top + basLb.h]); }
      if (ext) { const top = b.y + 23 * k; const g = b.x + r - 19 * k; obstaclesPower.push([g, g + ext.w, top, top + ext.h]); }
    }
    if (refaire) mesures = null;
    // Bouton marche/arrêt : à droite de l'interrupteur, gardé dans la vue.
    if (sim.s.power !== powerPrec) {
      powerPrec = sim.s.power;
      btnPower.classList.toggle('on', powerPrec);
      btnPower.setAttribute('aria-pressed', String(powerPrec));
      btnPower.querySelector('span').textContent = powerPrec ? 'Marche — toucher pour arrêter' : 'Arrêt — toucher pour allumer';
      btnPower.title = 'Interrupteur marche/arrêt (repère 1, p. 121)';
    }
    if (geo.inter) {
      const q = geo.inter();
      const bw = btnPower.offsetWidth;
      const bh = btnPower.offsetHeight;
      let px = Math.min(W - bw - 8, Math.max(8, q.x + 16 * k));
      let py = Math.min(H - bh - 8, Math.max(8, q.y + 30 * k));
      // Écarté des libellés de la manette droite : à leur droite s'il y a la place, sinon dessous.
      for (const [g, d, top, bas] of obstaclesPower) {
        if (px < d + 6 && px + bw > g - 6 && py < bas + 6 && py + bh > top - 6) {
          if (d + 8 + bw <= W - 8) px = d + 8;
          else py = Math.min(H - bh - 8, bas + 6);
        }
      }
      const t = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      if (t !== powerPos) { powerPos = t; btnPower.style.transform = t; }
      traits += `<path d="M${(px + 14 * k).toFixed(1)} ${py.toFixed(1)} L${q.x.toFixed(1)} ${q.y.toFixed(1)}" class="${powerPrec ? 'on' : ''}"/><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${(4.5 * k).toFixed(1)}" class="${powerPrec ? 'on' : ''}"/>`;
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
    /** Remet toutes les étiquettes à leur place. */
    replacer() { decalages = {}; ecrire(decalages); },
    detruire() {
      window.removeEventListener('pointermove', surBouge);
      window.removeEventListener('pointerup', surLache);
      window.removeEventListener('pointercancel', surLache);
      delete conteneur.dataset.cmd;
      racine.remove();
    },
  };
}
