// Mode « Systèmes » de la vue 3D (premier bouton du dock « Atelier ») : la machine
// prend la couleur de ses systèmes fonctionnels — moteur, hydraulique, électricité,
// air, avance, carrousel… (public/equipment/<id>/systemes.json, produit par
// tools/build_atelier.py d'après le titre de chaque assemblage du manuel).
//
// Le panneau latéral donne la légende : un système par ligne, avec sa couleur,
// son pictogramme et le nombre d'ensembles présents dans la vue. Un clic sur un
// système le montre seul (le reste est estompé) et zoome sur le cœur du système ;
// il liste aussi ses ensembles : un clic zoome sur l'ensemble (mis en évidence),
// « Ouvrir » affiche sa liste (le mode reste actif, la vue garde ses couleurs). Un clic sur une pièce la sélectionne : sa fiche se pose par-dessus
// la légende, qui revient quand elle se ferme. Chaque maillage prend la couleur
// de l'ensemble le plus proche qui le contient (un distributeur hydraulique
// monté sur l'avance est bleu hydraulique).
import './systemes3d.css';
import * as THREE from 'three';

const OWNER = 'systemes3d';
const mats = new Map();
const colorMat = (hex) => {
  let m = mats.get(hex);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55, metalness: 0.05, emissive: hex, emissiveIntensity: 0.12 });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    mats.set(hex, m);
  }
  return m;
};

export default {
  id: OWNER,
  order: 55,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    let active = false;
    let focus = null; // système montré seul
    let zoomed = null; // ensemble du système sur lequel la vue est cadrée
    let root = null;
    let parts = new Map(); // maillage → id du système
    let present = new Map(); // id du système → Set des ensembles présents dans la vue
    let selected = new Set(); // maillages de la pièce sélectionnée (gardent leurs couleurs)

    const data = () => ctx.equipmentData('systemes');
    const sysById = (id) => data()?.systemes.find((s) => s.id === id) || null;

    /** Système de chaque maillage : celui de l'ensemble le plus proche qui le contient. */
    const scan = (model) => {
      parts = new Map();
      present = new Map();
      const d = data();
      root = model?.root ?? null;
      if (!d || !root) return;
      const of = d.assemblages || {};
      const visit = (o, sys, asm) => {
        const a = o.userData?.isAssembly && o.userData.assemblyId;
        if (a && of[a]) { sys = of[a]; asm = a; }
        if (o.isMesh && !o.userData.isEdges && sys) {
          parts.set(o, sys);
          if (!present.has(sys)) present.set(sys, new Set());
          if (asm) present.get(sys).add(asm);
        }
        for (const c of o.children) visit(c, sys, asm);
      };
      visit(root, null, null);
    };
    const usable = () => {
      const v = ctx.view;
      return !!data() && ctx.viewer.is3d && v?.type === 'assembly' && !v.home && present.size > 1;
    };

    // ---------------------------------------------------------------- couleurs
    const paint = () => {
      const map = new Map();
      for (const [o, sys] of parts) {
        if (selected.has(o)) continue;
        const s = sysById(sys);
        if (!s) continue;
        map.set(o, !focus || sys === focus ? colorMat(s.couleur) : ctx.viewer.dimMaterial(ctx.viewer.originalMaterial(o), 0.1));
      }
      return map;
    };
    const apply = () => {
      if (active && root) ctx.viewer.setBaseMaterials(paint());
      else ctx.viewer.restoreBaseMaterials();
    };

    // ---------------------------------------------------------------- légende (panneau latéral)
    const titleOf = (id) => {
      const a = ctx.equipment.assemblies.get(id);
      return a ? `${a.sheet || id} · ${a.titleFr || a.title}` : id;
    };
    const panel = () => {
      const d = data();
      const el = document.createElement('div');
      el.className = 's3';
      const list = d.systemes.filter((s) => present.has(s.id));
      const cur = focus ? sysById(focus) : null;
      const asms = cur ? [...present.get(focus)].filter((a) => a !== ctx.view?.id).sort() : [];
      el.innerHTML = `
        <p class="s3-intro">${cur ? `<b>${esc(cur.nom)}</b> seul : le reste de la machine est estompé. <button type="button" class="btn s3-all" data-s3="">Tous les systèmes</button>` : 'La machine en couleur par système, d’après le manuel. Touchez un système pour le voir seul ; touchez une pièce pour sa fiche.'}</p>
        <ul class="s3-list">${list.map((s) => `
          <li><button type="button" class="s3-sys${focus === s.id ? ' on' : ''}" data-s3="${esc(s.id)}" aria-pressed="${focus === s.id}" style="--c:${esc(s.couleur)}">
            <span class="s3-ico">${icon(s.icone, { size: 18 })}</span><span class="s3-t">${esc(s.nom)}</span><span class="s3-n">${present.get(s.id).size || ''}</span>
          </button></li>`).join('')}
        </ul>
        ${cur ? `${asms.length ? `<h4 class="s3-h">Ensembles — ${esc(cur.nom)} (${asms.length})</h4>
          <p class="s3-tip">Touchez un ensemble pour zoomer dessus ; « Ouvrir » affiche sa liste de pièces.</p>
          <ul class="s3-asms">${asms.map((a) => `<li class="${zoomed === a ? 'on' : ''}" style="--c:${esc(cur.couleur)}"><button type="button" class="s3-asm" data-s3-zoom="${esc(a)}" aria-pressed="${zoomed === a}">${esc(titleOf(a))}</button><button type="button" class="s3-open" data-go="${esc(a)}" title="Ouvrir ${esc(titleOf(a))}">Ouvrir ›</button></li>`).join('')}</ul>` : ''}` : ''}
        <p class="s3-note">${esc(d.note.split(' ; ')[0])}.</p>`;
      el.addEventListener('click', (e) => {
        const z = e.target.closest('[data-s3-zoom]');
        if (z) { zoomTo(z.dataset.s3Zoom); return; }
        const b = e.target.closest('[data-s3]');
        if (b) show(b.dataset.s3 || null);
      });
      return el;
    };
    const render = () => { if (active) ctx.ui.sidePanel.setContent(panel(), OWNER); };

    /**
     * Boîte du cœur d'un ensemble de maillages : celle des maillages dont le centre tombe entre les 8e et 92e
     * centiles (pondérés par la taille) de chaque axe. Un système qui court sur toute la machine (flexibles
     * hydrauliques, conduites d'air) est ainsi cadré là où ses pièces se concentrent, au lieu de la machine entière.
     */
    const coreBox = (objs) => {
      const items = [];
      for (const o of objs) {
        const b = new THREE.Box3().setFromObject(o);
        if (b.isEmpty()) continue;
        const sz = b.getSize(new THREE.Vector3());
        items.push({ b, c: b.getCenter(new THREE.Vector3()), w: Math.cbrt(Math.max(sz.x * sz.y * sz.z, 1e-9)) });
      }
      if (!items.length) return null;
      const total = items.reduce((t, i) => t + i.w, 0);
      const pct = (ax, q) => {
        const sorted = items.slice().sort((a, b) => a.c[ax] - b.c[ax]);
        let acc = 0;
        for (const i of sorted) { acc += i.w; if (acc >= q * total) return i.c[ax]; }
        return sorted[sorted.length - 1].c[ax];
      };
      const lo = new THREE.Vector3(pct('x', 0.08), pct('y', 0.08), pct('z', 0.08));
      const hi = new THREE.Vector3(pct('x', 0.92), pct('y', 0.92), pct('z', 0.92));
      const box = new THREE.Box3();
      for (const i of items) if (i.c.x >= lo.x && i.c.x <= hi.x && i.c.y >= lo.y && i.c.y <= hi.y && i.c.z >= lo.z && i.c.z <= hi.z) box.union(i.b);
      return box.isEmpty() ? null : box;
    };

    /** Montre un système seul (null : tous) et zoome sur lui. */
    const show = (id) => {
      focus = focus === id ? null : id;
      zoomed = null;
      ctx.viewer.clear();
      apply();
      render();
      const objs = focus ? [...parts].filter(([, s]) => s === focus).map(([o]) => o) : [];
      const box = objs.length ? coreBox(objs) : null;
      ctx.viewer.frame(box || undefined);
    };

    /** Zoom sur un ensemble du système montré (tous ses exemplaires dans la vue), mis en évidence. */
    const zoomTo = (asm) => {
      if (!root) return;
      if (zoomed === asm) { zoomed = null; ctx.viewer.clear(); render(); show(focus); return; }
      const groups = [];
      root.traverse((o) => { if (o.userData?.isAssembly && o.userData.assemblyId === asm) groups.push(o); });
      if (!groups.length) return;
      zoomed = asm;
      const box = new THREE.Box3();
      groups.forEach((g) => box.expandByObject(g));
      ctx.viewer.markObjects(groups, { ghost: false });
      ctx.viewer.frame(box);
      render();
    };

    // ---------------------------------------------------------------- outil du dock
    const btn = ctx.ui.addTool({
      id: 'systemes3d-tool', rank: 10, label: 'Systèmes', icon: 'calques', title: 'La machine en couleur par système (moteur, hydraulique, électricité, air…)', pressed: false,
      onClick: () => (active ? stop() : start()),
    });
    btn.hidden = true;
    const start = () => {
      if (!usable()) return;
      ctx.viewer.select(null);
      active = true;
      focus = null;
      zoomed = null;
      btn.setAttribute('aria-pressed', 'true');
      ctx.ui.sidePanel.open({ owner: OWNER, title: 'Systèmes de la machine', icon: 'calques', content: panel() });
      apply();
    };
    const stop = () => {
      if (!active) return;
      active = false;
      focus = null;
      if (zoomed) ctx.viewer.clear();
      zoomed = null;
      btn.setAttribute('aria-pressed', 'false');
      ctx.viewer.restoreBaseMaterials();
      ctx.ui.sidePanel.release(OWNER);
    };
    const rescan = (model) => {
      scan(model);
      btn.hidden = !usable();
      if (!active) return;
      if (btn.hidden) { stop(); return; }
      if (focus && !present.has(focus)) focus = null;
      apply();
      render();
    };

    ctx.on('assembly', ({ is3d, model }) => { selected = new Set(); rescan(is3d ? model : null); });
    // Vue d'ensemble : sous-ensembles simplifiés remplacés par leur version détaillée (nouveaux maillages à colorer).
    ctx.on('model-update', ({ model, done }) => { if (model === ctx.viewer.model && (active || done)) rescan(model); });
    ctx.on('view', ({ type }) => { if (type !== 'assembly') { btn.hidden = true; stop(); } });
    ctx.on('equipment', () => { stop(); btn.hidden = true; });
    ctx.on('sidepanel', ({ open, owner }) => { if (!open && owner === OWNER && active) stop(); });
    // Pièce sélectionnée : gardée à ses couleurs (sa fiche se pose par-dessus la légende).
    ctx.on('select', ({ objects }) => {
      selected = new Set();
      for (const o of objects || []) o.traverse((m) => { if (m.isMesh) selected.add(m); });
      if (active) apply();
    });
  },
};
