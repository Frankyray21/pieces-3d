// Circuits hydrauliques en couleur : outil « Circuits » de la barre de la vue 3D.
// Les boyaux des modèles portent une étiquette (userData.circuit, circuitLabel,
// circuitFrom, circuitTo : voir src/models/stm-1500/*.js). En mode actif, chaque
// boyau prend la couleur de son circuit et le reste de la machine est estompé ;
// la légende (panneau latéral) donne pour chaque circuit sa couleur, son nom, le
// nombre de boyaux et les raccords de départ et d'arrivée. Un clic sur un circuit
// de la légende ou sur un boyau met ce circuit seul en évidence, d'un bout à
// l'autre (tronçons communs compris), avec la liste de ses boyaux et raccords.
// Sans boyau étiqueté dans le modèle affiché, l'outil n'apparaît pas.
// Un clic sur une autre pièce la sélectionne : sa fiche se pose par-dessus la
// légende (le mode reste actif, la pièce garde ses couleurs) et la légende
// revient quand la fiche se ferme.
import './circuits.css';
import * as THREE from 'three';

// Circuits connus : couleur (conventions usuelles : pression rouge, retour bleu,
// drain vert, aspiration cyan… ; teintes revues pour rester distinctes en
// deutéranopie), nom, description. Le manuel ne contient pas le schéma
// hydraulique (pages 4.14 et 4.15 citées mais absentes) : les raccordements qui
// ne sont pas dans les listes sont des hypothèses du modèle, signalées comme
// telles. branches : circuits alimentés par ce tronçon commun.
const CIRCUITS = [
  { id: 'pression', color: '#e02424', name: 'Pression', desc: 'Groupe → console, traversée de la plaque CA12 « PRESSION #1 » (plaques de la console, P082). Pompe qui l\'alimente : hypothèse du modèle (A11VO130).' },
  { id: 'retour', color: '#1d5fd6', name: 'Retour', desc: 'Retour d\'huile au réservoir par les deux filtres RTF-47 : de la console, et du refroidisseur (raccordement : hypothèse du modèle).' },
  { id: 'drain', color: '#14923f', name: 'Drain', desc: 'Drains des carters et de la console vers le collecteur de retour UM-064-600PP, puis le réservoir.' },
  { id: 'aspiration', color: '#0fa3a3', name: 'Aspiration', desc: 'Vannes du réservoir → aspirations des pompes.' },
  { id: 'pilotage', color: '#f07c12', name: 'Pilotage', desc: 'Vanne de démarrage DTDA-MHN-GAI ↔ bride de refoulement de l\'A11VO130 (tracé : hypothèse du modèle).' },
  { id: 'rotation-a', color: '#c026d3', name: 'Rotation A', desc: 'Console (distributeur SD25, section rotation) → orifice A du moteur de la tête.' },
  { id: 'rotation-b', color: '#532f6f', name: 'Rotation B', desc: 'Console (distributeur SD25, section rotation) → orifice B du moteur de la tête.' },
  { id: 'avance-treuil', color: '#fbd298', name: 'Sélecteur mât / treuil gauche', desc: 'Console → sélecteur DF10-6B-12L gauche (« SWITCH VALVE MAST TO WIRE LINE », page 1.1), qui envoie l\'huile au vérin d\'avance (vannes à bille) ou au moteur du treuil.', branches: ['avance', 'recul', 'treuil'] },
  { id: 'avance', color: '#e8c20c', name: 'Avance', desc: 'Sélecteur gauche → tige creuse avant du vérin d\'avance UM-064-100Z.' },
  { id: 'recul', color: '#533c1d', name: 'Recul', desc: 'Sélecteur gauche → tige creuse arrière du vérin d\'avance UM-064-100Z.' },
  { id: 'treuil', color: '#903e0e', name: 'Treuil', desc: 'Sélecteur gauche ↔ moteur White du treuil de câble.' },
  { id: 'mat', color: '#d0367a', name: 'Sélecteur mât / treuil droit', desc: 'Console → sélecteur DF10-6B-12L droit (« SWITCH VALVE MAST TO WIRE LINE », page 1.1). Hypothèse du modèle : ses sorties vont aux vérins de bascule et de relevage (aucune page ne les relie).', branches: ['bascule', 'relevage'] },
  { id: 'bascule', color: '#f47cb4', name: 'Bascule (hypothèse)', desc: 'Hypothèse du modèle : sélecteur droit → blocs YEJ des deux vérins de bascule HBU-3010.' },
  { id: 'relevage', color: '#820d49', name: 'Relevage (hypothèse)', desc: 'Hypothèse du modèle : sélecteur droit → bloc YEJ du vérin de relevage UM-064-300Z.' },
  { id: 'eau', color: '#3cb4f0', name: 'Eau', desc: 'Bloc d\'eau 3 voies de la console → émerillon d\'eau de la tête.' },
  { id: 'lubrification', color: '#b4dfbf', name: 'Lubrification', desc: 'Tête : UM-012-139 (« HYDRAULIC MOTOR » à la liste, pompe d\'aspiration de la page 2.3) → filtre → refroidisseur → régulateur NDV-10-N → transmission et roulements inférieur et supérieur (page 2.3).', branches: ['lubrification-retour'] },
  { id: 'lubrification-retour', color: '#81b474', name: 'Lubrification — aspiration', desc: 'Tête : carter, transmission et boîte → vanne 3 voies → UM-012-139 (page 2.3).' },
  { id: 'event', color: '#5a6472', name: 'Couvercle et reniflard', desc: 'Tête : transmission → couvercle (H23C, « TRANSMISSION/COVER ») et transmission → reniflard (H08C, « FOR BREATHER »), page 2.3.' },
];
const BY_ID = new Map(CIRCUITS.map((c) => [c.id, c]));
const info = (id) => BY_ID.get(id) || { id, color: '#8c9aab', name: id, desc: '' };
/** Circuits mis en évidence avec c : lui-même, ses branches et le tronçon commun qui l'alimente. */
const family = (id) => {
  const s = new Set([id, ...(info(id).branches || [])]);
  for (const c of CIRCUITS) if (c.branches?.includes(id)) s.add(c.id);
  return s;
};

// ---------------------------------------------------------------- matériaux
const colorMats = new Map();
const colorMat = (hex, strong) => {
  const key = `${hex}:${strong ? 1 : 0}`;
  let m = colorMats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.42, metalness: 0, emissive: hex, emissiveIntensity: strong ? 0.5 : 0.22 });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    colorMats.set(key, m);
  }
  return m;
};
export default {
  id: 'circuits',
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const OWNER = 'circuits';
    let active = false;
    let focus = null; // circuit mis en évidence
    let picked = null; // boyau cliqué
    let hoses = []; // boyaux étiquetés du modèle affiché
    let root = null;
    let selected = new Set(); // maillages de la pièce sélectionnée (jamais estompés)

    const btn = ctx.ui.addTool({ label: 'Circuits', icon: 'goutte', title: 'Circuits hydrauliques en couleur', pressed: false, onClick: () => (active ? stop() : start()) });
    btn.style.display = 'none';

    /** Couleurs du mode : boyaux à la couleur de leur circuit, le reste estompé (API du visualiseur). */
    const paint = () => {
      const map = new Map();
      if (!root) return map;
      const fam = focus ? family(focus) : null;
      const orig = (o) => ctx.viewer.originalMaterial(o);
      root.traverse((o) => {
        if (!o.isMesh || o.userData.isEdges || selected.has(o)) return;
        const h = o.userData.circuit ? o : o.parent?.userData.circuit ? o.parent : null;
        const lit = h && (!fam || fam.has(h.userData.circuit));
        if (h === o) {
          const hex = info(o.userData.circuit).color;
          map.set(o, lit ? colorMat(hex, !!focus) : ctx.viewer.dimMaterial(colorMat(hex, false), 0.22));
        } else if (h) {
          if (!lit) map.set(o, ctx.viewer.dimMaterial(orig(o)));
        } else {
          map.set(o, ctx.viewer.dimMaterial(orig(o)));
        }
      });
      return map;
    };
    const apply = () => {
      if (active && root) ctx.viewer.setBaseMaterials(paint());
      else ctx.viewer.restoreBaseMaterials();
    };

    // ---------------------------------------------------------------- légende (panneau latéral)
    const groups = () => {
      const map = new Map();
      for (const h of hoses) {
        const id = h.userData.circuit;
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(h);
      }
      const order = (id) => { const i = CIRCUITS.findIndex((c) => c.id === id); return i < 0 ? 999 : i; };
      return [...map.entries()].sort((a, b) => order(a[0]) - order(b[0]));
    };
    const uniq = (list) => [...new Set(list.filter(Boolean))];
    // Raccords d'un bout des boyaux d'un circuit : le raccord s'il est unique, sinon les organes (avant « : »).
    const ends = (list, key) => {
      const u = uniq(list.map((h) => h.userData[key]));
      if (u.length <= 1) return esc(u[0] || '—');
      const org = uniq(u.map((t) => t.split(' : ')[0]));
      return `${org.map(esc).join(' ; ')} <span class="circuits-k">(${u.length} raccords)</span>`;
    };
    const sw = (id) => `<span class="circuits-sw" style="--c:${info(id).color}" aria-hidden="true"></span>`;
    const legend = () => {
      const gs = groups();
      const rows = gs.map(([id, list]) => {
        const c = info(id);
        return `<li><button type="button" class="circuits-item" data-circuit="${esc(id)}" aria-pressed="${focus === id}">
          ${sw(id)}<span class="circuits-txt"><span class="circuits-name">${esc(c.name)}</span>
          <span class="circuits-n">${list.length} boyau${list.length > 1 ? 'x' : ''}</span>
          <span class="circuits-ends"><b>De</b> ${ends(list, 'circuitFrom')}<br><b>À</b> ${ends(list, 'circuitTo')}</span></span></button></li>`;
      }).join('');
      const verb = ctx.narrow() || matchMedia('(pointer: coarse)').matches ? 'Touchez' : 'Cliquez';
      return `<div class="circuits">${focus ? detail() : `<p class="circuits-hint">Boyaux colorés selon leur circuit, le reste de la machine estompé. ${verb} un circuit ci-dessous ou un boyau dans la vue pour le suivre d'un bout à l'autre.</p>`}
        <p class="circuits-warn">Le manuel ne contient pas le schéma hydraulique : les raccordements absents des listes sont des hypothèses du modèle, signalées comme telles.</p>
        <h4 class="circuits-h">Légende · ${hoses.length} boyaux</h4><ul class="circuits-list">${rows}</ul></div>`;
    };
    const detail = () => {
      const fam = family(focus);
      const list = hoses.filter((h) => fam.has(h.userData.circuit));
      const c = info(focus);
      const items = list.map((h) => {
        const u = h.userData, own = u.circuit === focus;
        return `<li class="${h === picked ? 'is-picked' : ''}">${sw(u.circuit)}<div><div class="circuits-hl">${esc(u.circuitLabel || info(u.circuit).name)}${own ? '' : ` <span class="chip">${esc(info(u.circuit).name)}</span>`}${u.partRef ? ` <span class="mono">rep. ${esc(u.partRef)}</span>` : ''}</div>
          <div class="circuits-ends"><b>De</b> ${esc(u.circuitFrom || '—')}<br><b>À</b> ${esc(u.circuitTo || '—')}</div></div></li>`;
      }).join('');
      return `<section class="circuits-detail card-box" style="--c:${c.color}">
        <div class="circuits-dh">${sw(focus)}<strong>${esc(c.name)}</strong><button type="button" class="btn circuits-all">Tous les circuits</button></div>
        ${c.desc ? `<p class="circuits-desc">${esc(c.desc)}</p>` : ''}
        <ol class="circuits-hoses">${items}</ol></section>`;
    };
    const panelEl = document.createElement('div');
    panelEl.addEventListener('click', (e) => {
      if (e.target.closest('.circuits-all')) { setFocus(null); return; }
      const b = e.target.closest('[data-circuit]');
      if (b) setFocus(b.dataset.circuit === focus ? null : b.dataset.circuit, { frame: true });
    });
    const openPanel = () => ctx.ui.sidePanel.open({ owner: OWNER, title: 'Circuits hydrauliques', icon: 'goutte', content: panelEl });
    const render = () => {
      panelEl.innerHTML = legend(); // aussi quand la fiche d'une pièce recouvre la légende
      if (ctx.ui.sidePanel.owner !== OWNER) return;
      if (!ctx.ui.sidePanel.body.contains(panelEl)) ctx.ui.sidePanel.setContent(panelEl);
      ctx.ui.sidePanel.body.scrollTop = 0; // détail du circuit en tête du panneau
      panelEl.querySelector('.is-picked')?.scrollIntoView?.({ block: 'nearest' });
    };

    const setFocus = (id, { frame = false, hose = null } = {}) => {
      focus = id;
      picked = hose;
      apply();
      render();
      if (frame && id) { const fam = family(id); ctx.viewer.frame(hoses.filter((h) => fam.has(h.userData.circuit))); }
    };

    const start = () => {
      if (!hoses.length) return;
      active = true;
      focus = null;
      picked = null;
      btn.setAttribute('aria-pressed', 'true');
      panelEl.innerHTML = legend();
      openPanel();
      apply();
      // Modèle recadré dans la partie de la scène que la légende (panneau ou volet bas) ne couvre pas.
      requestAnimationFrame(() => { if (active) ctx.viewer.frame(); });
    };
    const stop = ({ reframe = true } = {}) => {
      if (!active) return;
      active = false;
      focus = null;
      picked = null;
      btn.setAttribute('aria-pressed', 'false');
      ctx.ui.sidePanel.release(OWNER);
      apply();
      // Légende fermée : le modèle reprend toute la scène.
      if (reframe) ctx.viewer.frame();
    };
    // Le panneau est pris par un autre mode, ou replié : le mode s'arrête (couleurs rétablies).
    ctx.on('sidepanel', ({ open, owner }) => { if (owner === OWNER && !open) stop(); });

    // ---------------------------------------------------------------- modèle affiché
    const scan = (r) => {
      const list = [];
      r?.traverse((o) => { if (o.isMesh && o.userData.circuit) list.push(o); });
      return list;
    };
    const rescan = (model) => {
      root = model?.root ?? null;
      hoses = scan(root);
      btn.style.display = hoses.length ? '' : 'none';
      if (!hoses.length) { stop({ reframe: false }); return; }
      if (active) {
        if (focus && !hoses.some((h) => family(focus).has(h.userData.circuit))) focus = null;
        if (picked && !hoses.includes(picked)) picked = null;
        apply();
        render();
      }
    };
    ctx.on('assembly', ({ is3d, model }) => {
      selected = new Set();
      picked = null;
      rescan(is3d ? model : null);
    });
    // Vue d'ensemble : sous-assemblages remplacés par leur version détaillée (en mode actif à chaque fois,
    // sinon au dernier remplacement : de nouveaux boyaux peuvent faire paraître l'outil).
    ctx.on('model-update', ({ model, done }) => { if (model === ctx.viewer.model && (active || done)) rescan(model); });
    ctx.on('view', ({ type }) => {
      if (type !== 'assembly') { btn.style.display = 'none'; stop({ reframe: false }); }
    });
    // Pièce sélectionnée pendant le mode : gardée à ses couleurs (sa fiche s'ouvre par-dessus la légende).
    ctx.on('select', ({ objects }) => {
      selected = new Set();
      for (const o of objects || []) o.traverse((m) => { if (m.isMesh) selected.add(m); });
      if (active) apply();
    });

    // ---------------------------------------------------------------- clic sur un boyau
    // Écouteur en phase de capture : le clic sur un boyau étiqueté ne sélectionne pas la pièce qui le contient.
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down = null;
    /** Boyau sous le pointeur ; au doigt (pointeur grossier), tolérance de TOUCH_R px autour du point touché. */
    const TOUCH_R = 14;
    const hoseAt = (e) => {
      const cam = ctx.viewer.camera, canvas = ctx.viewer.canvas;
      if (!cam || !canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const shown = hoses.filter((h) => { for (let a = h; a; a = a.parent) if (!a.visible) return false; return true; });
      const at = (x, y) => {
        ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(ndc, cam);
        return ray.intersectObjects(shown, false)[0]?.object ?? null;
      };
      const hit = at(e.clientX, e.clientY);
      if (hit || !(e.pointerType === 'touch' || e.pointerType === 'pen' || matchMedia('(pointer: coarse)').matches)) return hit;
      // Cercles de 7 puis 14 px : le premier boyau trouvé, le plus près du point touché.
      for (const r of [TOUCH_R / 2, TOUCH_R]) {
        for (let k = 0; k < 8; k++) {
          const t = (k / 8) * Math.PI * 2;
          const h = at(e.clientX + r * Math.cos(t), e.clientY + r * Math.sin(t));
          if (h) return h;
        }
      }
      return null;
    };
    const onCanvas = (e) => active && !!ctx.viewer.canvas && e.target === ctx.viewer.canvas;
    document.addEventListener('pointerdown', (e) => { down = onCanvas(e) && e.isPrimary ? { x: e.clientX, y: e.clientY } : null; }, true);
    document.addEventListener('pointerup', (e) => {
      if (!onCanvas(e) || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      down = null;
      const h = hoseAt(e);
      if (!h) return;
      // Le clic n'atteint pas la vue (pas de sélection de la pièce qui contient le boyau) ; les commandes de la
      // caméra, qui ont capturé le pointeur, sont relâchées par un « pointercancel » (sinon la vue tourne au
      // moindre mouvement de la souris).
      e.stopPropagation();
      ctx.viewer.canvas.dispatchEvent(new PointerEvent('pointercancel', { pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: e.isPrimary, clientX: e.clientX, clientY: e.clientY }));
      // Le boyau prend la main : plus de pièce sélectionnée, la légende revient par-dessus la fiche.
      if (ctx.selection) ctx.viewer.select(null);
      if (ctx.ui.sidePanel.owner !== OWNER) openPanel();
      setFocus(h.userData.circuit, { hose: h });
    }, true);
    document.addEventListener('dblclick', (e) => { if (onCanvas(e) && hoseAt(e)) e.stopPropagation(); }, true);
  },
};
