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
// drain vert, aspiration cyan…), nom, description tirée des modèles (commentaires
// d'après le manuel). branches : circuits alimentés par ce tronçon commun.
const CIRCUITS = [
  { id: 'pression', color: '#e02424', name: 'Pression', desc: 'Groupe → console : refoulement de la pompe A11VO130 (boyau de 1 po).' },
  { id: 'retour', color: '#1d5fd6', name: 'Retour', desc: 'Retour d\'huile au réservoir par les filtres RTF-47 (console → filtre n° 2 ; refroidisseur → filtre n° 1).' },
  { id: 'drain', color: '#14923f', name: 'Drain', desc: 'Drains des carters et de la console vers le collecteur de retour UM-064-600PP, puis le réservoir.' },
  { id: 'aspiration', color: '#0fa3a3', name: 'Aspiration', desc: 'Vannes du réservoir → aspirations des pompes.' },
  { id: 'pilotage', color: '#f07c12', name: 'Pilotage', desc: 'Vanne de démarrage DTDA-MHN-GAI ↔ bride de refoulement de l\'A11VO130.' },
  { id: 'rotation-a', color: '#c026d3', name: 'Rotation A', desc: 'Console (distributeur SD25, section rotation) → orifice A du moteur de la tête.' },
  { id: 'rotation-b', color: '#7444e0', name: 'Rotation B', desc: 'Console (distributeur SD25, section rotation) → orifice B du moteur de la tête.' },
  { id: 'avance-treuil', color: '#b8860b', name: 'Avance / treuil (commun)', desc: 'Console → sélecteur mât / treuil gauche, qui envoie l\'huile au vérin d\'avance (vannes à bille) ou au moteur du treuil.', branches: ['avance', 'recul', 'treuil'] },
  { id: 'avance', color: '#e8c20c', name: 'Avance', desc: 'Sélecteur gauche → tige creuse avant du vérin d\'avance UM-064-100Z.' },
  { id: 'recul', color: '#8a6d1f', name: 'Recul', desc: 'Sélecteur gauche → tige creuse arrière du vérin d\'avance UM-064-100Z.' },
  { id: 'treuil', color: '#9a4a14', name: 'Treuil', desc: 'Sélecteur gauche ↔ moteur White du treuil de câble.' },
  { id: 'mat', color: '#d0367a', name: 'Bascule / relevage (commun)', desc: 'Console → sélecteur droit, qui envoie l\'huile aux vérins de bascule ou au vérin de relevage.', branches: ['bascule', 'relevage'] },
  { id: 'bascule', color: '#f47cb4', name: 'Bascule', desc: 'Sélecteur droit → blocs YEJ des deux vérins de bascule HBU-3010.' },
  { id: 'relevage', color: '#8f1d4a', name: 'Relevage', desc: 'Sélecteur droit → bloc YEJ du vérin de relevage UM-064-300Z.' },
  { id: 'eau', color: '#3cb4f0', name: 'Eau', desc: 'Bloc d\'eau 3 voies de la console → émerillon d\'eau de la tête.' },
  { id: 'lubrification', color: '#7cbf1a', name: 'Lubrification', desc: 'Tête : pompe 139 → filtre → refroidisseur → régulateur NDV-10-N → transmission et roulements (page 2.3).', branches: ['lubrification-retour'] },
  { id: 'lubrification-retour', color: '#4f6d12', name: 'Lubrification — aspiration', desc: 'Tête : carter, transmission et boîte → vanne 3 voies → pompe 139 (page 2.3).' },
  { id: 'event', color: '#8c9aab', name: 'Évent', desc: 'Tête : rangée d\'évent, couvercle et reniflard (page 2.3).' },
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
const dimMats = new Map();
/** Variante estompée d'un matériau (comme le fantôme de la visionneuse, un peu plus visible). */
const dimMat = (base, opacity = 0.13) => {
  const key = `${base.uuid}:${opacity}`;
  let m = dimMats.get(key);
  if (!m) {
    m = base.clone();
    m.transparent = true;
    m.opacity = opacity;
    m.depthWrite = false;
    m.userData = { ...m.userData, fin: null };
    m.onBeforeCompile = () => {};
    m.customProgramCacheKey = () => '';
    dimMats.set(key, m);
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
          map.set(o, lit ? colorMat(hex, !!focus) : dimMat(colorMat(hex, false), 0.22));
        } else if (h) {
          if (!lit) map.set(o, dimMat(orig(o)));
        } else {
          map.set(o, dimMat(orig(o)));
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
    const sw = (id) => `<span class="circuits-sw" style="--c:${info(id).color}"></span>`;
    const legend = () => {
      const gs = groups();
      const rows = gs.map(([id, list]) => {
        const c = info(id);
        return `<li><button type="button" class="circuits-item" data-circuit="${esc(id)}" aria-pressed="${focus === id}">
          ${sw(id)}<span class="circuits-txt"><span class="circuits-name">${esc(c.name)}</span>
          <span class="circuits-n">${list.length} boyau${list.length > 1 ? 'x' : ''}</span>
          <span class="circuits-ends"><b>De</b> ${ends(list, 'circuitFrom')}<br><b>À</b> ${ends(list, 'circuitTo')}</span></span></button></li>`;
      }).join('');
      return `<div class="circuits">${focus ? detail() : `<p class="circuits-hint">Boyaux colorés selon leur circuit, le reste de la machine estompé. Cliquez un circuit ci-dessous ou un boyau dans la vue pour le suivre d'un bout à l'autre.</p>`}
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
    };
    const stop = () => {
      if (!active) return;
      active = false;
      focus = null;
      picked = null;
      btn.setAttribute('aria-pressed', 'false');
      ctx.ui.sidePanel.release(OWNER);
      apply();
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
      if (!hoses.length) { stop(); return; }
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
    // Vue d'ensemble : sous-assemblages remplacés par leur version détaillée.
    ctx.on('model-update', ({ model }) => { if (model === ctx.viewer.model) rescan(model); });
    ctx.on('view', ({ type }) => {
      if (type !== 'assembly') { btn.style.display = 'none'; stop(); }
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
    const hoseAt = (e) => {
      const cam = ctx.viewer.camera, canvas = ctx.viewer.canvas;
      if (!cam || !canvas) return null;
      const rect = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const shown = hoses.filter((h) => { for (let a = h; a; a = a.parent) if (!a.visible) return false; return true; });
      return ray.intersectObjects(shown, false)[0]?.object ?? null;
    };
    const onCanvas = (e) => active && !!ctx.viewer.canvas && e.target === ctx.viewer.canvas;
    document.addEventListener('pointerdown', (e) => { down = onCanvas(e) && e.isPrimary ? { x: e.clientX, y: e.clientY } : null; }, true);
    document.addEventListener('pointerup', (e) => {
      if (!onCanvas(e) || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      down = null;
      const h = hoseAt(e);
      if (!h) return;
      e.stopPropagation();
      // Le boyau prend la main : plus de pièce sélectionnée, la légende revient par-dessus la fiche.
      if (ctx.selection) ctx.viewer.select(null);
      if (ctx.ui.sidePanel.owner !== OWNER) openPanel();
      setFocus(h.userData.circuit, { hose: h });
    }, true);
    document.addEventListener('dblclick', (e) => { if (onCanvas(e) && hoseAt(e)) e.stopPropagation(); }, true);
  },
};
