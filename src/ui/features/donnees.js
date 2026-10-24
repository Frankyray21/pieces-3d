// Données techniques en tableaux (adresse « #<équipement>.donnees »).
//
// - Valeurs relevées dans le manuel, groupées par système (foreuse, tête,
//   treuil, groupe, console…), une valeur par ligne, unités métriques et
//   impériales, colonne « Source » qui ouvre la page du manuel. Elles viennent
//   de public/equipment/<id>/donnees.json ; sans ce fichier, la fiche technique
//   de data.json (specs, weights) est reprise telle quelle, sans page source.
// - Tableau « Visserie par assemblage » calculé depuis les listes de pièces
//   (boulons, vis, écrous, rondelles, goupilles) : quantité par taille.
// Rien n'est inventé : une donnée absente du manuel n'apparaît pas.

import './donnees.css';

const ID = 'donnees';

// ------------------------------------------------------------------ chargement de donnees.json
const cache = new Map(); // id d'équipement → Promise<objet | null>
function loadDonnees(eqId) {
  if (!cache.has(eqId)) {
    cache.set(eqId, fetch(`equipment/${eqId}/donnees.json`, { cache: 'no-cache' })
      .then((r) => (r.ok && /json/.test(r.headers.get('content-type') || 'json') ? r.json() : null))
      .catch(() => null));
  }
  return cache.get(eqId);
}

// ------------------------------------------------------------------ visserie
/** Décimal → fraction au 1/64 la plus proche (« 5/8 », « 2 3/4 », « 1 »). */
function frac(x) {
  if (!Number.isFinite(x) || x <= 0) return '';
  let n = Math.round(x * 64);
  const whole = Math.floor(n / 64);
  let r = n % 64;
  let d = 64;
  while (r && r % 2 === 0) { r /= 2; d /= 2; }
  return r ? `${whole ? `${whole} ` : ''}${r}/${d}` : String(whole);
}
/** « 2 3/4 », « 5/8 », « 1.75 », « 0.750 » → décimal. */
function num(s) {
  s = String(s).trim();
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return m[1] / m[2];
  return parseFloat(s);
}
/** Code de taille d'un numéro (« 625 » → 5/8 po, « 75 » → 3/4 po, « 1000 » → 1 po). */
const code = (c) => (c.length <= 2 ? +c / 100 : +c / 1000);

const EXCLU = /ELBOW|UNION|JIC|FITTING|ADAPT|HOSE|VALVE|SWIVEL|BULKHEAD|CONNECTOR|ZERK|GREASE|\bTEE\b|PLUG|NIPPLE|W\/ ?NUT|WITH NUT|CAP NUT|RECEPTACLE/;

/** Famille de la pièce d'après sa description, sinon d'après son numéro. */
function famille(desc, pn) {
  const d = String(desc || '').toUpperCase();
  if (EXCLU.test(d)) return null;
  if (/HAIR ?PIN|COTTER|GOUPILLE/.test(d)) return { f: 'goupille', t: /COTTER/.test(d) ? 'Goupille fendue' : 'Goupille épingle' };
  if (/WASHER|WHASHER|RONDELLE/.test(d)) return { f: 'rondelle', t: /LOCK/.test(d) ? 'Rondelle frein' : /TENSION/.test(d) ? 'Rondelle de tension' : 'Rondelle plate' };
  if (/\bNUTS?\b|[ÉE]CROU/.test(d)) return { f: 'ecrou', t: /JAM/.test(d) ? 'Contre-écrou' : /LOCK|NYL|\bLK\b|STOVER|NYLOC/.test(d) ? 'Écrou de blocage' : /FLANGE/.test(d) ? 'Écrou à embase' : 'Écrou' };
  if (/BOLT|SCREW|SHCS|COUNTERSUNK|\bVIS\b|BOULON/.test(d)) {
    const t = /SET SCREW/.test(d) ? 'Vis de pression' : /COUNTERSUNK/.test(d) ? 'Vis à tête fraisée' : /SHCS|SOCKET/.test(d) ? 'Vis à tête creuse' : /SQUARE HEAD/.test(d) ? 'Boulon à tête carrée' : /EYE BOLT/.test(d) ? 'Boulon à œil' : /U-BOLT/.test(d) ? 'Boulon en U' : 'Boulon';
    return { f: 'vis', t };
  }
  const p = String(pn || '').toUpperCase();
  if (/^(SHCS|SHC)\d/.test(p)) return { f: 'vis', t: 'Vis à tête creuse' };
  if (/^SS\d/.test(p)) return { f: 'vis', t: 'Vis de pression' };
  if (/^(B|BS|SH|CS)\d+-\d+$/.test(p)) return { f: 'vis', t: 'Boulon' };
  if (/^(NC|NF|LN|NFC|JN)\d/.test(p)) return { f: 'ecrou', t: 'Écrou' };
  if (/^(W|LC)\d+$/.test(p)) return { f: 'rondelle', t: /^LC/.test(p) ? 'Rondelle frein' : 'Rondelle plate' };
  if (/^HP\d+$/.test(p)) return { f: 'goupille', t: 'Goupille épingle' };
  if (/^CTP\d/.test(p)) return { f: 'goupille', t: 'Goupille fendue' };
  return null;
}

const FR = String.raw`(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`;
/** Taille lue dans la description : { d (po), l (po) | null, filet ('UNC' | 'UNF' | '') }. */
function tailleDesc(desc) {
  const s = String(desc || '').replace(/[’′]/g, "'").replace(/''/g, '"');
  let d = null; let filet = ''; let rest = s;
  let m = s.match(new RegExp(String.raw`(\d+\/\d+|\d+(?:\.\d+)?)\s*"?\s*-?\s*(?:\d{1,2}\s*-?\s*)?(UNC|UNF|NC|NF)\b`, 'i'));
  if (m) {
    d = num(m[1]); filet = /F$/i.test(m[2]) ? 'UNF' : 'UNC'; rest = s.slice(m.index + m[0].length);
  } else if ((m = s.match(/(\d+\/\d+|\b1\b)\s*"/)) || (m = s.match(/\b(\d+\/\d+)\b/))) {
    d = num(m[1]); rest = s.slice(m.index + m[0].length);
  }
  if (d == null || !(d > 0) || d > 2) return null;
  let l = null;
  m = rest.match(new RegExp(String.raw`[xX×]\s*${FR}`)) || rest.match(new RegExp(String.raw`-?\s*${FR}\s*"?\s*LG\b`, 'i'));
  if (m) { const v = num(m[1]); if (v > 0 && v < 40) l = v; }
  return { d, l, filet };
}
/** Taille déduite du numéro (B625-2750 → 5/8 × 2 3/4, W500 → 1/2). */
function taillePn(pn) {
  const p = String(pn || '').toUpperCase();
  let m = p.match(/^(?:B|BS|SH|SHC|SHCS|CS|SS|CTP)(\d{2,4})-(\d{3,5})/);
  if (m) return { d: code(m[1]), l: +m[2] / 1000, filet: '' };
  m = p.match(/^(?:W|LC|NC|NF|LN|NFC|HP)(\d{2,4})(NC|NF)?$/);
  if (m) return { d: code(m[1]), l: null, filet: m[2] ? (m[2] === 'NF' ? 'UNF' : 'UNC') : '' };
  m = p.match(/^JN(\d)$/);
  if (m) return { d: +m[1], l: null, filet: '' };
  return null;
}
const same = (a, b) => Math.abs(a - b) < 1 / 64 + 1e-9;
const libTaille = (t) => (t ? `${frac(t.d)}${t.l ? ` × ${frac(t.l)}` : ''} po` : '');
const libMm = (t) => (t ? `${(t.d * 25.4).toFixed(1).replace('.', ',')}${t.l ? ` × ${(t.l * 25.4).toFixed(1).replace('.', ',')}` : ''} mm` : '');
const ORDRE = { vis: 0, ecrou: 1, rondelle: 2, goupille: 3 };

/** Lignes de visserie de toutes les listes d'assemblage. */
function visserie(eq) {
  const lignes = [];
  for (const a of eq.assemblies.values()) {
    for (const r of a.parts) {
      if (r.pseudo) continue;
      const fam = famille(r.desc, r.pn);
      if (!fam) continue;
      const td = tailleDesc(r.desc);
      const tp = taillePn(r.pn);
      let t = td || tp;
      if (td && tp && td.l == null && tp.l != null && same(td.d, tp.d)) t = { ...td, l: tp.l };
      const ecart = td && tp && (!same(td.d, tp.d) || (td.l != null && tp.l != null && !same(td.l, tp.l)))
        ? `Le numéro ${r.pn} indique ${libTaille(tp)} ; la description, ${libTaille(td)}.` : '';
      if (t && !t.filet && tp?.filet) t = { ...t, filet: tp.filet };
      const q = typeof r.qty === 'number' ? r.qty : /^\d+$/.test(String(r.qty ?? '').trim()) ? +r.qty : null;
      lignes.push({ asm: a, r, fam, t, q, ecart, cle: `${fam.f}|${fam.t}|${t ? `${frac(t.d)}|${t.l ? frac(t.l) : ''}|${t.filet}` : '?'}` });
    }
  }
  return lignes;
}
const tri = (a, b) => ORDRE[a.fam.f] - ORDRE[b.fam.f] || a.fam.t.localeCompare(b.fam.t, 'fr')
  || (a.t ? a.t.d : 99) - (b.t ? b.t.d : 99) || (a.t?.l ?? 0) - (b.t?.l ?? 0);

// ------------------------------------------------------------------ module
export default {
  id: ID,
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;

    /** Lien vers la page du manuel (géré par le site : data-page). */
    const src = (p) => (p ? `<button type="button" class="dn-src mono" data-page="${esc(p)}" title="${esc(`Ouvrir la page ${p} du manuel${ctx.sheetTitle(p) ? ` : ${ctx.sheetTitle(p)}` : ''}`)}">${icon('page', { size: 13 })}${esc(p)}</button>` : '<span class="dn-nosrc">—</span>');

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

    ctx.on('equipment', async ({ equipment: eq, id }) => {
      card.hidden = true;
      tool.hidden = !(eq.specs?.length || eq.weights?.length);
      const don = await loadDonnees(id);
      if (ctx.equipment?.id !== id) return;
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
        <p class="dn-card-sub">${nVal} valeur${nVal > 1 ? 's' : ''}${don ? ' relevées au manuel, avec la page source' : ' de la fiche technique'}${nVis ? ` · visserie : ${nVis} taille${nVis > 1 ? 's' : ''} par assemblage` : ''}.</p>
        ${cles.length ? `<div class="dn-card-keys">${cles.map((k) => `<div><b>${esc(k.v)}</b><span>${esc(k.l)}</span></div>`).join('')}</div>` : ''}`;
      card.hidden = false;
    });

    // --- page plein écran
    ctx.registerRoute(ID, async () => {
      const eq = ctx.equipment;
      if (!eq) return;
      const don = await loadDonnees(eq.id);
      if (ctx.equipment !== eq) return;
      const el = document.createElement('div');
      el.className = 'dn';
      el.innerHTML = render(eq, don);
      wire(el, eq);
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
          <p class="dn-intro">${esc(eq.manufacturer)} · ${esc(eq.document?.title || '')}${eq.document?.reference ? ` (${esc(eq.document.reference)})` : ''}</p>
          ${don?.note ? `<p class="dn-note">${esc(don.note)}</p>` : `<p class="dn-note">Fiche technique de l’équipement (sans renvoi de page) et visserie calculée d’après les listes du ${esc(eq.docWord)}.</p>`}
        </header>
        ${cles.length ? `<section class="dn-keys" aria-label="Chiffres clés">${cles.map((k) => `
          <div class="dn-key">
            <span class="dn-key-v">${esc(k.v)}</span>
            ${k.s ? `<span class="dn-key-s">${esc(k.s)}</span>` : ''}
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
            const conv = (u) => (l.conv === u ? ' <span class="dn-conv" title="Valeur convertie : le manuel ne donne que l’autre unité">conv.</span>' : '');
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
        if (!tot.has(l.cle)) tot.set(l.cle, { ...l, qte: 0, inconnu: 0, pns: new Set(), asms: new Set() });
        const g = tot.get(l.cle);
        if (l.q != null) g.qte += l.q; else g.inconnu++;
        if (l.r.pn) g.pns.add(l.r.pn);
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
        const search = ls.map((l) => `${l.r.pn} ${l.r.desc} ${l.fam.t} ${libTaille(l.t)}`).join(' ').toLowerCase();
        return `<details class="dn-asmv" data-search="${esc(`${id} ${a.titleFr || ''} ${a.title || ''} ${search}`.toLowerCase())}" style="--sys:${sys?.color || 'var(--sys-0)'}">
          <summary><span class="mono dn-asm-id">${esc(id)}</span><span class="dn-asm-t">${esc(a.titleFr || a.title)}</span><span class="dn-asm-n">${rows.length} taille${rows.length > 1 ? 's' : ''} · ${nb(total)} pce${total > 1 ? 's' : ''}</span></summary>
          <div class="dn-asmv-body">
            <table class="dn-t dn-vt">
              <thead><tr><th scope="col">Pièce</th><th scope="col">Taille</th><th scope="col">Numéro · repère</th><th scope="col" class="c-q">Qté</th></tr></thead>
              <tbody>${rows.map((g) => `<tr data-search="${esc(g.items.map((l) => `${l.r.pn} ${l.r.desc} ${l.fam.t} ${libTaille(l.t)}`).join(' ').toLowerCase())}">
                <th scope="row" class="c-l">${esc(g.fam.t)}</th>
                <td>${taille(g)}</td>
                <td>${g.items.map((l) => `<button type="button" class="dn-pn" data-dn-asm="${esc(id)}" data-dn-ref="${esc(l.r.ref)}" title="${esc(`${l.r.desc} — repère ${l.r.label || l.r.ref} : voir dans l’assemblage`)}"><span class="mono">${esc(l.r.pn || '—')}</span><span class="dn-ref">rep. ${esc(l.r.label || l.r.ref)}${l.q != null && g.items.length > 1 ? ` · ${l.q}` : ''}</span></button>${l.ecart ? `<small class="dn-warn">${icon('alerte', { size: 12 })}${esc(l.ecart)}</small>` : ''}`).join('')}</td>
                <td class="c-q">${nb(g.qte)}${g.inconnu ? '<span class="dn-nosrc"> + ?</span>' : ''}</td>
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
            <caption>Total par taille — ${nb(totaux.length)} tailles, ${nb(totalPieces)} pièces</caption>
            <thead><tr><th scope="col">Pièce</th><th scope="col">Taille</th><th scope="col">Numéros</th><th scope="col" class="c-q">Qté</th><th scope="col">Assemblages</th></tr></thead>
            <tbody>${totaux.map((g) => `<tr data-search="${esc(`${g.fam.t} ${libTaille(g.t)} ${[...g.pns].join(' ')} ${[...g.asms].join(' ')}`.toLowerCase())}">
              <th scope="row" class="c-l">${esc(g.fam.t)}</th>
              <td>${taille(g)}</td>
              <td class="mono dn-pns">${esc([...g.pns].join(', ') || '—')}</td>
              <td class="c-q">${nb(g.qte)}${g.inconnu ? '<span class="dn-nosrc"> + ?</span>' : ''}</td>
              <td class="dn-asms">${[...g.asms].map((id) => `<button type="button" class="dn-asmchip mono" data-dn-open="${esc(id)}" title="${esc(eq.assemblies.get(id).titleFr || '')}">${esc(id)}</button>`).join('')}</td>
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
          el.querySelector(`#dn-${CSS.escape(jump.dataset.dnJump)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        const open = e.target.closest('[data-dn-open]');
        if (open) {
          const d = el.querySelector(`.dn-asmv[data-search^="${CSS.escape(open.dataset.dnOpen.toLowerCase())} "]`);
          if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
      const totRows = [...el.querySelectorAll('.dn-tot tbody tr')];
      const blocks = [...el.querySelectorAll('.dn-asmv')];
      const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      input.addEventListener('input', () => {
        const q = norm(input.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        const hit = (s) => words.every((w) => norm(s).includes(w));
        let n = 0;
        for (const tr of totRows) { const ok = !words.length || hit(tr.dataset.search); tr.hidden = !ok; if (ok) n++; }
        for (const d of blocks) {
          const rows = [...d.querySelectorAll('tbody tr')];
          const head = hit(d.dataset.search.split(' ').slice(0, 1).join(' '));
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
