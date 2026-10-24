// Mode « Entretien et graissage » : bouton à clé dans la barre de la vue 3D.
// La machine est estompée, chaque point à vérifier (graisseur, niveau, filtre,
// reniflard…) porte une pastille numérotée ancrée en 3D, et le panneau latéral
// donne la liste numérotée (type, emplacement, assemblage, page source).
//
// Données : public/equipment/<id>/entretien.json (points du manuel, avec leurs
// pages). Les objets 3D concernés portent userData.entretien = { type, id }
// (src/models/<id>/*.js) ; un point sans objet 3D est placé par coordonnées
// (« marqueurs » : repère local d'un assemblage, accroché à une de ses pièces).
// Équipement sans fichier entretien.json : l'outil n'apparaît pas.
import './entretien.css';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Équipements qui ont un fichier entretien.json, connus à la construction (noms de fichiers seulement : les
// chargeurs du glob ne sont jamais appelés) ; le fichier est lu à la demande, sans requête (ni erreur 404)
// pour les autres équipements.
const HAS = new Set(Object.keys(import.meta.glob('../../../public/equipment/*/entretien.json')).map((f) => f.split('/').slice(-2, -1)[0]));
const DATA = new Map(); // id → données chargées (null : illisibles)
const load = async (id) => {
  if (!HAS.has(id)) return null;
  if (!DATA.has(id)) {
    try {
      const res = await fetch(`equipment/${id}/entretien.json`, { cache: 'no-cache' });
      DATA.set(id, res.ok ? await res.json() : null);
    } catch {
      DATA.set(id, null);
    }
  }
  return DATA.get(id);
};

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
    let sig = ''; // signature du modèle (remplacements de pièces pendant le chargement de la vue d'ensemble)
    let timer = null;
    let current = null; // id du point mis en évidence

    const data = () => (ctx.equipment ? DATA.get(ctx.equipment.id) ?? null : null);
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

    const signature = () => {
      const m = ctx.viewer.model;
      if (!m) return '';
      let n = 0;
      m.root.traverse((o) => { if (o.userData.entretien || o.userData.isAssembly) n++; });
      return `${m.root.uuid}:${n}`;
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
      el.addEventListener('click', (e) => { e.stopPropagation(); focus(pt.def.id, { frame: false, scroll: true }); });
      const label = new CSS2DObject(el);
      label.center.set(0.5, 0.5);
      return label;
    };

    const placePins = () => {
      clearPins();
      const v = ctx.viewer.raw;
      if (!v) return;
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
      v.invalidate?.();
    };

    // Machine estompée, objets des points en évidence (sans toucher à la sélection).
    const ghost = () => {
      const v = ctx.viewer.raw;
      if (!v || !ctx.viewer.is3d) return;
      v.markObjs = points.flatMap((p) => p.objs);
      v.markGhost = true;
      v._refreshStates();
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
      ctx.viewer.raw?.invalidate?.();
    };

    // Cadre le point (tous ses exemplaires) en gardant la direction de vue ; le point est placé au milieu de la
    // partie de la scène que le panneau latéral ne couvre pas.
    const frameOn = (id) => {
      const v = ctx.viewer.raw;
      const mine = pins.filter((p) => p.point.def.id === id);
      if (!v || !mine.length) return;
      const box = new THREE.Box3();
      const w = new THREE.Vector3();
      for (const { label } of mine) box.expandByPoint(label.getWorldPosition(w));
      const c = box.getCenter(new THREE.Vector3());
      const r = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.25);
      const cam = v.camera;
      const dir = cam.position.clone().sub(v.controls.target).normalize();
      const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      const dist = Math.max((r / tan) * 1.5, 0.7);
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).normalize();
      const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1).normalize();
      const stage = v.container.getBoundingClientRect();
      const sp = ctx.ui.sidePanel.isOpen ? ctx.ui.sidePanel.element.getBoundingClientRect() : null;
      const H = 2 * dist * tan, W = H * cam.aspect;
      const target = c.clone();
      if (sp && stage.width) {
        if (ctx.narrow()) {
          // Panneau en bas de la scène : le point remonte au milieu de la partie libre.
          const covered = Math.max(0, stage.bottom - sp.top);
          target.addScaledVector(up, -((covered / 2) / stage.height) * H);
        } else {
          const covered = Math.max(0, stage.right - sp.left);
          target.addScaledVector(right, ((covered / 2) / stage.width) * W);
        }
      }
      v.lookAt(target.clone().addScaledVector(dir, dist).toArray(), target.toArray());
    };

    // ------------------------------------------------------------ marche / arrêt
    const build = () => {
      points = collect();
      sig = signature();
      placePins();
      ghost();
      ctx.viewer.raw?.container?.classList.add('ent-on');
      if (current && !points.some((p) => p.def.id === current)) current = null;
      if (ctx.ui.sidePanel.owner === OWNER) {
        ctx.ui.sidePanel.setContent(panel());
        if (current) focus(current);
      }
    };

    const start = () => {
      if (!usable()) return;
      active = true;
      btn.setAttribute('aria-pressed', 'true');
      current = null;
      points = collect();
      ctx.ui.sidePanel.open({ owner: OWNER, title: 'Entretien et graissage', icon: 'cle', content: panel() });
      ctx.ui.sidePanel.element.classList.add('ent-side');
      build();
      // La vue d'ensemble remplace ses sous-assemblages simplifiés par leur version détaillée après coup :
      // pastilles et estompage refaits si le modèle a changé.
      clearInterval(timer);
      timer = setInterval(() => {
        if (!active || !usable()) return;
        if (signature() !== sig) build();
      }, 800);
    };

    const teardown = () => {
      clearPins();
      const v = ctx.viewer.raw;
      v?.container?.classList.remove('ent-on');
      if (v && ctx.viewer.is3d && v.markGhost) v.setMarked(null);
    };

    const stop = ({ keepPanel = false } = {}) => {
      if (!active) return;
      active = false;
      clearInterval(timer);
      timer = null;
      btn.setAttribute('aria-pressed', 'false');
      teardown();
      points = [];
      current = null;
      ctx.ui.sidePanel.element.classList.remove('ent-side');
      if (!keepPanel && ctx.ui.sidePanel.owner === OWNER) ctx.ui.sidePanel.close();
    };

    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === OWNER && !open) stop({ keepPanel: true });
    });

    // Nouvel assemblage ou nouvelle vue : bouton montré seulement pour une vue 3D d'un équipement qui a des données ;
    // en mode entretien, les points du nouvel assemblage remplacent les anciens.
    const refresh = () => {
      btn.hidden = !usable();
      if (!active) return;
      clearPins();
      if (!usable()) { stop(); return; }
      current = null;
      build();
    };
    ctx.on('assembly', refresh);
    ctx.on('view', refresh);
    ctx.on('equipment', ({ id }) => {
      if (active) stop();
      btn.hidden = true;
      load(id).then(() => { if (ctx.equipment?.id === id) refresh(); });
    });
  },
};
