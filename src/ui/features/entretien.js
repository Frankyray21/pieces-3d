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
// La machine est estompée par des matériaux transparents (pas par le fantôme de
// la visionneuse) : un clic sur une pièce la sélectionne, sa fiche se pose
// par-dessus la liste des points (le mode reste actif) ; un clic sur une
// pastille ramène la liste. Sans point dans le modèle affiché, l'outil est
// masqué (et rien n'est estompé si le mode est déjà actif). Les pastilles qui
// se chevauchent à l'écran sont regroupées (« 3 +2 ») ; un clic cadre le groupe.
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
// Lettre du type sur chaque pastille : le type ne dépend pas que de la couleur (niveau et trappe d'inspection, bouchon
// et reniflard se confondent en deutéranopie).
const LETTRE = { graisseur: 'G', niveau: 'N', filtre: 'F', reniflard: 'R', bouchon: 'B', inspection: 'I', thermometre: 'T', vidange: 'V', plaque: 'P' };
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
      el.dataset.t = LETTRE[pt.def.type] || '';
      el.title = `${pt.n}. ${pt.def.titre}${pt.def.approx ? ' (position approchée)' : ''}`;
      el.setAttribute('aria-label', `Point ${pt.n} : ${TYPES[pt.def.type] || pt.def.type}, ${pt.def.titre}${pt.def.approx ? ' (position approchée)' : ''}`);
      el.dataset.ent = pt.def.id;
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        reveal();
        const pin = pins.find((p) => p.el === el);
        // Pastille qui regroupe d'autres points : on cadre le groupe (elles se séparent à l'écran). Groupe d'un seul
        // point (ses exemplaires, ex. deux bouchons de niveau) : ce point, comme une pastille seule.
        if (pin?.points > 1) { focus(pt.def.id, { frame: false, scroll: true }); frameLabels(pin.cluster.map((p) => p.label)); }
        else focus(pt.def.id, { frame: true, scroll: true });
      });
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
      relayout();
      ctx.viewer.invalidate();
    };

    // Machine estompée (matériaux transparents : les pièces restent cliquables), objets des points en évidence ;
    // la pièce sélectionnée garde ses couleurs. Sans point : rien n'est estompé.
    let selected = new Set();
    const ghost = () => {
      if (!ctx.viewer.is3d) return;
      const model = ctx.viewer.model;
      if (!points.length || !model) { ctx.viewer.restoreBaseMaterials(); ctx.viewer.clear(); return; }
      const keep = new Set();
      for (const o of points.flatMap((p) => p.objs)) o.traverse((m) => keep.add(m));
      const map = new Map();
      model.root.traverse((o) => {
        if (!o.isMesh || o.userData.isEdges || keep.has(o) || selected.has(o)) return;
        map.set(o, ctx.viewer.dimMaterial(ctx.viewer.originalMaterial(o), 0.1));
      });
      ctx.viewer.setBaseMaterials(map);
      ctx.viewer.markObjects(points.flatMap((p) => p.objs));
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
        const rv = def?.renvoi;
        wrap.innerHTML = `<p class="ent-empty">Aucun point d'entretien du manuel dans cet assemblage${a ? ` (${esc(a.titleFr || a.title)})` : ''}.</p>
          ${rv?.texte ? `<p class="ent-note">${esc(rv.texte)}</p>` : ''}
          ${rv?.pages?.length ? `<p class="ent-pages">${rv.pages.map(pageBtn).join('')}</p>` : ''}`;
        return wrap;
      }
      const counts = {};
      points.forEach((p) => { counts[p.def.type] = (counts[p.def.type] || 0) + 1; });
      wrap.innerHTML = `
        <p class="ent-intro"><strong>${points.length} point${points.length > 1 ? 's' : ''} à vérifier</strong>${a ? ` — ${esc(a.titleFr || a.title)}` : ''}</p>
        <p class="ent-types">${Object.entries(counts).map(([t, n]) => `<span class="ent-type ent-${esc(t)}"><i aria-hidden="true">${esc(LETTRE[t] || '')}</i>${esc(TYPES[t] || t)} · ${n}</span>`).join('')}</p>
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
      if (scroll && item) item.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (frame) frameOn(id);
      relayout(); // les pastilles du point choisi passent en tête des groupes (jamais cachées)
      ctx.viewer.invalidate();
    };

    // Cadre le point (tous ses exemplaires) en gardant la direction de vue, dans la partie de la scène que le
    // panneau latéral et les barres ne couvrent pas (marges du socle).
    const frameOn = (id = null) => {
      const mine = id == null ? pins : pins.filter((p) => p.point.def.id === id);
      frameLabels(mine.map((p) => p.label));
    };
    const frameLabels = (labels) => {
      if (!labels.length) return;
      const box = new THREE.Box3();
      const w = new THREE.Vector3();
      for (const label of labels) box.expandByPoint(label.getWorldPosition(w));
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
    const openPanel = (content) => ctx.ui.sidePanel.open({ owner: OWNER, title: 'Entretien et graissage', icon: 'cle', content });

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
      // La liste prend le panneau : la pièce sélectionnée (et sa fiche) est relâchée, comme au clic sur une pastille.
      if (ctx.selection) ctx.viewer.select(null);
      active = true;
      btn.setAttribute('aria-pressed', 'true');
      current = null;
      points = collect();
      openPanel(panel());
      build();
      frameOn(); // tous les points dans la partie libre de la scène
      shown = ctx.viewer.model?.root.uuid ?? null;
      startDeclutter();
    };

    const teardown = () => {
      clearPins();
      stopDeclutter();
      ctx.ui.stage.classList.remove('ent-on');
      ctx.viewer.restoreBaseMaterials();
      ctx.viewer.clear();
    };

    const stop = ({ reframe = true } = {}) => {
      if (!active) return;
      active = false;
      btn.setAttribute('aria-pressed', 'false');
      teardown();
      points = [];
      current = null;
      ctx.ui.sidePanel.release(OWNER);
      // Liste fermée : le modèle reprend toute la scène (comme à la sortie d'une procédure).
      if (reframe) ctx.viewer.frame();
    };

    // Le panneau est pris par un autre mode, ou replié : le mode s'arrête (machine et repères rétablis).
    ctx.on('sidepanel', ({ open, owner }) => {
      if (owner === OWNER && !open) stop();
    });
    // La vue d'ensemble remplace ses sous-assemblages simplifiés par leur version détaillée après coup :
    // pastilles et estompage refaits.
    ctx.on('model-update', ({ done }) => {
      if (active && usable()) build();
      else if (done && !active) btn.hidden = !usable() || !collect().length;
    });
    // Pièce sélectionnée pendant le mode : gardée à ses couleurs (sa fiche se pose par-dessus la liste).
    ctx.on('select', ({ objects }) => {
      selected = new Set();
      for (const o of objects || []) o.traverse((m) => { if (m.isMesh) selected.add(m); });
      if (active && points.length) ghost();
    });

    // Nouvel assemblage ou nouvelle vue : bouton montré seulement pour une vue 3D d'un équipement qui a des données ;
    // en mode entretien, les points du nouvel assemblage remplacent les anciens.
    const refresh = () => {
      // Outil montré seulement s'il y a des points dans le modèle affiché (ou si le mode est déjà actif).
      btn.hidden = !usable() || (!active && !collect().length);
      if (!active) return;
      clearPins();
      if (!usable()) { stop({ reframe: false }); return; }
      current = null;
      const before = ctx.viewer.model?.root.uuid;
      build();
      if (before && before !== shown) frameOn();
      shown = before;
    };
    ctx.on('assembly', refresh);
    ctx.on('view', refresh);
    ctx.on('equipment', () => {
      if (active) stop({ reframe: false });
      btn.hidden = true;
    });

    // ------------------------------------------------------------ pastilles qui se chevauchent
    // Toutes les 250 ms (si la caméra a bougé) : les pastilles qui se recouvrent à l'écran (largeur réelle de chaque
    // pastille, marge plus grande au doigt) sont regroupées sous une seule (« 3 +2 » : le point 3 et 2 autres points) ;
    // les autres sont masquées. Les pastilles du point choisi passent en premier : elles ne sont jamais masquées.
    // Plusieurs exemplaires d'un même point (deux bouchons de niveau) ne comptent que pour un point.
    let declutterTimer = 0;
    let lastCam = '';
    const v3 = new THREE.Vector3();
    const labelOf = (p) => {
      const ids = new Set(p.cluster.map((q) => q.point.def.id));
      p.points = ids.size;
      const n = ids.size - 1;
      p.el.textContent = n ? `${p.point.n} +${n}` : String(p.point.n);
      p.el.classList.toggle('is-group', n > 0);
      const label = `Point ${p.point.n} : ${TYPES[p.point.def.type] || p.point.def.type}, ${p.point.def.titre}${p.point.def.approx ? ' (position approchée)' : ''}`;
      p.el.setAttribute('aria-label', n ? `${label} — et ${n} autre${n > 1 ? 's' : ''} point${n > 1 ? 's' : ''} au même endroit : cadrer le groupe` : label);
    };
    const declutter = () => {
      const cam = ctx.viewer.camera, canvas = ctx.viewer.canvas;
      if (!active || !pins.length || !cam || !canvas) return;
      const key = `${cam.matrixWorld.elements.map((x) => x.toFixed(4)).join(',')}${canvas.clientWidth}x${canvas.clientHeight}|${current}`;
      if (key === lastCam) return;
      lastCam = key;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const M = matchMedia('(pointer: coarse)').matches ? 10 : 4; // marge entre deux pastilles (doigt : zone de toucher)
      const xy = pins.map((p) => { p.label.getWorldPosition(v3).project(cam); return [(v3.x + 1) * w / 2, (1 - v3.y) * h / 2, v3.z <= 1]; });
      // Ordre : pastilles du point choisi d'abord, puis l'ordre des points.
      const order = pins.map((_, i) => i).sort((a, b) => (pins[b].point.def.id === current) - (pins[a].point.def.id === current) || a - b);
      const size = (i) => [Math.max(24, pins[i].el.offsetWidth || 24), Math.max(24, pins[i].el.offsetHeight || 24)];
      const overlap = (i, j, wi, wj) => Math.abs(xy[i][0] - xy[j][0]) < (wi + wj) / 2 + M && Math.abs(xy[i][1] - xy[j][1]) < 24 + M;
      // Deux passes : regroupement avec les largeurs affichées, puis avec celles des étiquettes (« 14 +4 », plus large).
      for (let pass = 0; pass < 2; pass++) {
        const leader = pins.map(() => -1);
        const widths = pins.map((_, i) => size(i)[0]);
        for (const i of order) {
          if (leader[i] >= 0) continue;
          leader[i] = i;
          pins[i].cluster = [pins[i]];
          if (!xy[i][2]) continue;
          for (const j of order) {
            if (leader[j] >= 0 || !xy[j][2]) continue;
            if (overlap(i, j, widths[i], widths[j])) { leader[j] = i; pins[i].cluster.push(pins[j]); }
          }
        }
        pins.forEach((p, i) => {
          const lead = leader[i] === i;
          p.el.hidden = !lead;
          if (!lead) { p.cluster = null; p.points = 0; return; }
          labelOf(p);
        });
      }
    };
    /** Regroupement refait tout de suite (point choisi, pastilles reposées). */
    const relayout = () => { lastCam = ''; declutter(); };
    const startDeclutter = () => { stopDeclutter(); lastCam = ''; declutterTimer = setInterval(declutter, 250); declutter(); };
    const stopDeclutter = () => { clearInterval(declutterTimer); declutterTimer = 0; };
  },
};
