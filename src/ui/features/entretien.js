// Mode « Entretien et graissage » : bouton à clé dans la barre de la vue 3D.
// La machine est estompée, chaque point à vérifier (graisseur, niveau, filtre,
// reniflard…) porte une pastille numérotée ancrée en 3D, et le panneau latéral
// donne la liste numérotée (type, emplacement, assemblage, page source).
//
// Données : public/equipment/<id>/entretien.json (points du manuel, avec leurs
// pages ; ctx.equipmentData('entretien')). Les objets 3D concernés portent
// userData.entretien = { type, id } (src/models/<id>/*.js) ; un point sans objet
// 3D est placé par coordonnées (« marqueurs » : repère local d'un assemblage,
// accroché à une de ses pièces). Équipement sans fichier entretien.json :
// l'outil n'apparaît pas.
//
// Un clic sur une pièce la sélectionne : sa fiche se pose par-dessus la liste
// des points (le mode reste actif) ; un clic sur une pastille ramène la liste.
import './entretien.css';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const TYPES = {
  graisseur: 'Graisseur',
  niveau: "Niveau d'huile",
  filtre: 'Filtre',
  reniflard: 'Reniflard',
  bouchon: 'Bouchon',
  inspection: "Trappe d'inspection",
  thermometre: 'Thermomètre',
  vidange: 'Vidange',
  plaque: 'Plaque',
};
const OWNER = 'entretien';

export default {
  id: 'entretien',
  order: 60,

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;
    let active = false;
    let pins = []; // { label, el, point }
    let points = []; // points présents dans le modèle affiché : { n, def, objs, marks }
    let current = null; // id du point mis en évidence
    let shown = null; // modèle déjà cadré par le mode

    const data = () => ctx.equipmentData('entretien');
    const usable = () => {
      const v = ctx.view;
      return !!data() && ctx.viewer.is3d && v?.type === 'assembly' && !v.home && !!ctx.viewer.model;
    };

    const btn = ctx.ui.addTool({
      id: 'entretien-btn',
      label: 'Entretien',
      icon: 'cle',
      title: 'Entretien et graissage : points à vérifier (manuel)',
      pressed: false,
      onClick: () => (active ? stop() : start()),
    });
    btn.hidden = true;

    // ------------------------------------------------------------ recherche des points dans le modèle
    const collect = () => {
      const model = ctx.viewer.model;
      const def = data();
      if (!model || !def) return [];
      const root = model.root;
      const tagged = new Map(); // id → objets étiquetés
      const subs = new Map(); // id d'assemblage → racines de ses exemplaires dans le modèle
      root.traverse((o) => {
        const t = o.userData.entretien;
        if (t?.id) { if (!tagged.has(t.id)) tagged.set(t.id, []); tagged.get(t.id).push(o); }
        const a = o.userData.isAssembly && o.userData.assemblyId;
        if (a) { if (!subs.has(a)) subs.set(a, []); subs.get(a).push(o); }
      });
      const list = [];
      for (const p of def.points || []) {
        const objs = tagged.get(p.id) || [];
        const marks = [];
        for (const m of p.marqueurs || []) {
          for (const sub of subs.get(m.assemblage) || []) {
            const part = (sub.userData.parts || []).find((q) => q.userData.partRef === String(m.repere)) || sub;
            marks.push({ sub, part, pos: m.pos });
          }
        }
        if (objs.length || marks.length) list.push({ n: list.length + 1, def: p, objs, marks });
      }
      return list;
    };

    // ------------------------------------------------------------ pastilles
    const clearPins = () => {
      for (const { label } of pins) {
        label.element.remove();
        label.parent?.remove(label);
      }
      pins = [];
    };

    const makePin = (pt) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `ent-pin ent-${pt.def.type}${pt.def.approx ? ' is-approx' : ''}`;
      el.textContent = String(pt.n);
      el.title = `${pt.n}. ${pt.def.titre}${pt.def.approx ? ' (position approchée)' : ''}`;
      el.dataset.ent = pt.def.id;
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => { e.stopPropagation(); reveal(); focus(pt.def.id, { frame: false, scroll: true }); });
      const label = new CSS2DObject(el);
      label.center.set(0.5, 0.5);
      return label;
    };

    const placePins = () => {
      clearPins();
      if (!ctx.viewer.model) return;
      for (const pt of points) {
        for (const o of pt.objs) {
          // Centre de l'objet, comme les bulles des repères.
          o.updateMatrixWorld(true);
          const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
          const label = makePin(pt);
          o.worldToLocal(c);
          label.position.copy(c);
          o.add(label);
          pins.push({ label, el: label.element, point: pt });
        }
        for (const m of pt.marks) {
          // Coordonnées dans le repère de l'assemblage, accrochées à la pièce prise à sa place assemblée.
          const keep = m.part.position.clone();
          if (m.part !== m.sub && m.part.userData.basePos) m.part.position.copy(m.part.userData.basePos);
          m.sub.updateMatrixWorld(true);
          const w = m.sub.localToWorld(new THREE.Vector3(...m.pos));
          const local = m.part.worldToLocal(w.clone());
          m.part.position.copy(keep);
          m.sub.updateMatrixWorld(true);
          const label = makePin(pt);
          label.position.copy(local);
          m.part.add(label);
          pins.push({ label, el: label.element, point: pt });
        }
      }
      ctx.viewer.invalidate();
    };

    // Machine estompée, objets des points en évidence (sans toucher à la sélection).
    const ghost = () => {
      if (ctx.viewer.is3d) ctx.viewer.markObjects(points.flatMap((p) => p.objs), { ghost: true });
    };

    // ------------------------------------------------------------ panneau latéral
    const asmLine = (id) => {
      const a = ctx.equipment?.assemblies.get(id);
      if (!a) return '';
      return `${esc(a.titleFr || a.title)}`;
    };
    const pageBtn = (s) => `<button type="button" class="chip ent-page" data-page="${esc(s)}" title="${esc(ctx.sheetTitle(s))}">${esc(ctx.sheetTitle(s) || s)}</button>`;

    const panel = () => {
      const def = data();
      const wrap = document.createElement('div');
      wrap.className = 'ent-panel';
      const v = ctx.view;
      const a = v ? ctx.equipment.assemblies.get(v.id) : null;
      if (!points.length) {
        wrap.innerHTML = `<p class="ent-empty">Aucun point d'entretien du manuel dans cet assemblage${a ? ` (${esc(a.titleFr || a.title)})` : ''}.</p>
          <p class="ent-note">Les points de graissage de la machine sont à la page 1.04 ; voir aussi la tête (2.x) et le réservoir (3.6, 3.7).</p>
          <p>${pageBtn('P008')}</p>`;
        return wrap;
      }
      const counts = {};
      points.forEach((p) => { counts[p.def.type] = (counts[p.def.type] || 0) + 1; });
      wrap.innerHTML = `
        <p class="ent-intro"><strong>${points.length} point${points.length > 1 ? 's' : ''} à vérifier</strong>${a ? ` — ${esc(a.titleFr || a.title)}` : ''}</p>
        <p class="ent-types">${Object.entries(counts).map(([t, n]) => `<span class="ent-type ent-${esc(t)}"><i></i>${esc(TYPES[t] || t)} · ${n}</span>`).join('')}</p>
        <ol class="ent-list">${points.map((p) => `
          <li class="ent-item" data-ent="${esc(p.def.id)}">
            <button type="button" class="ent-go" title="Cadrer ce point dans la vue 3D">
              <span class="ent-num ent-${esc(p.def.type)}">${p.n}</span>
              <span class="ent-main">
                <span class="ent-kind">${esc(TYPES[p.def.type] || p.def.type)}${/^[A-F]$/.test(p.def.id) ? ` · détail ${esc(p.def.id)} (1.04)` : ''}${p.def.approx ? ' · position approchée' : ''}</span>
                <span class="ent-title">${esc(p.def.titre)}</span>
                <span class="ent-where">${esc(p.def.lieu)}</span>
                ${p.def.consigne ? `<span class="ent-rule">${esc(p.def.consigne)}</span>` : ''}
              </span>
            </button>
            <span class="ent-meta">
              <span class="ent-asm">${icon('structure', { size: 13 })} ${asmLine(p.def.assemblage)}</span>
              <span class="ent-src">${esc(p.def.source || '')}</span>
              <span class="ent-pages">${(p.def.pages || []).map(pageBtn).join('')}</span>
            </span>
          </li>`).join('')}
        </ol>
        ${def.note ? `<p class="ent-note">${esc(def.note)}</p>` : ''}`;
      wrap.querySelectorAll('.ent-item').forEach((li) => {
        li.querySelector('.ent-go').addEventListener('click', () => focus(li.dataset.ent, { frame: true }));
      });
      return wrap;
    };

    // ------------------------------------------------------------ mise en évidence et cadrage
    const focus = (id, { frame = false, scroll = false } = {}) => {
      current = id;
      for (const { el } of pins) el.classList.toggle('is-current', el.dataset.ent === id);
      const body = ctx.ui.sidePanel.body;
      let item = null;
      body?.querySelectorAll('.ent-item').forEach((li) => {
        const on = li.dataset.ent === id;
        li.classList.toggle('is-current', on);
        if (on) item = li;
      });
      if (scroll && item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (frame) frameOn(id);
      ctx.viewer.invalidate();
    };

    // Cadre le point (tous ses exemplaires) en gardant la direction de vue, dans la partie de la scène que le
    // panneau latéral et les barres ne couvrent pas (marges du socle).
    const frameOn = (id = null) => {
      const mine = id == null ? pins : pins.filter((p) => p.point.def.id === id);
      if (!mine.length) return;
      const box = new THREE.Box3();
      const w = new THREE.Vector3();
      for (const { label } of mine) box.expandByPoint(label.getWorldPosition(w));
      // Au moins 60 cm de côté : un point seul reste dans son contexte.
      const size = box.getSize(new THREE.Vector3()).max(new THREE.Vector3(0.6, 0.6, 0.6));
      box.setFromCenterAndSize(box.getCenter(new THREE.Vector3()), size);
      ctx.viewer.frame(box);
    };

    /** Le panneau de la liste revient (la fiche d'une pièce le recouvrait). */
    const reveal = () => {
      if (!active) return;
      if (ctx.selection) ctx.viewer.select(null); // la fiche se ferme : la liste revient dessous
      if (ctx.ui.sidePanel.owner !== OWNER) openPanel(panel());
    };
    const openPanel = (content) => ctx.ui.sidePanel.open({ owner: OWNER, title: 'Entretien et graissage', icon: 'cle', content, className: 'ent-side' });

    // ------------------------------------------------------------ marche / arrêt
    const build = () => {
      points = collect();
      placePins();
      ghost();
      ctx.ui.stage.classList.add('ent-on');
      if (current && !points.some((p) => p.def.id === current)) current = null;
      if (ctx.ui.sidePanel.owner === OWNER) {
        ctx.ui.sidePanel.setContent(panel());
        if (current) focus(current);
      } else if (ctx.ui.sidePanel.base === OWNER) ctx.ui.sidePanel.setContent(panel(), OWNER); // sous la fiche
    };

    const start = () => {
      if (!usable()) return;
      active = true;
      btn.setAttribute('aria-pressed', 'true');
      current = null;
      points = collect();
      openPanel(panel());
      build();
      frameOn(); // tous les points dans la partie libre de la scène
      shown = ctx.viewer.model?.root.uuid ?? null;
    };

    const teardown = () => {
      clearPins();
      ctx.ui.stage.classList.remove('ent-on');
      ctx.viewer.clear();
    };

    const stop = () => {
      if (!active) return;
      active = false;
      btn.setAttribute('aria-pressed', 'false');
      teardown();
      points = [];
      current = null;
      ctx.ui.sidePanel.release(OWNER);
    };

    // Le panneau est pris par un autre mode, ou replié : le mode s'arrête (machine et repères rétablis).
    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === OWNER && !open) stop();
    });
    // La vue d'ensemble remplace ses sous-assemblages simplifiés par leur version détaillée après coup :
    // pastilles et estompage refaits.
    ctx.on('model-update', () => { if (active && usable()) build(); });

    // Nouvel assemblage ou nouvelle vue : bouton montré seulement pour une vue 3D d'un équipement qui a des données ;
    // en mode entretien, les points du nouvel assemblage remplacent les anciens.
    const refresh = () => {
      btn.hidden = !usable();
      if (!active) return;
      clearPins();
      if (!usable()) { stop(); return; }
      current = null;
      const before = ctx.viewer.model?.root.uuid;
      build();
      if (before && before !== shown) frameOn();
      shown = before;
    };
    ctx.on('assembly', refresh);
    ctx.on('view', refresh);
    ctx.on('equipment', () => {
      if (active) stop();
      btn.hidden = true;
    });
  },
};
