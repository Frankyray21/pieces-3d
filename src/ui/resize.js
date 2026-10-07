// Poignées de redimensionnement : faire glisser le bord du menu des
// assemblages (gauche) ou du panneau des pièces (droite) pour les élargir.
// Double-clic sur une poignée : largeur par défaut. Largeurs mémorisées dans
// le navigateur. Inactif sur téléphone (les volets y sont en onglets).

const KEY = 'pieces3d.widths.v1';
const LIMITS = { rail: [180, 620], panel: [280, 760] };
const MIN_STAGE = 320;

const CSS = `
.workspace { position: relative; }
.resizer {
  position: absolute; top: 0; bottom: 0; width: 10px; margin-left: -5px; z-index: 6;
  cursor: col-resize; touch-action: none; background: none; border: 0; padding: 0;
}
.resizer::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 4px; width: 2px;
  background: transparent; transition: background 0.12s;
}
.resizer:hover::after, .resizer:focus-visible::after, .resizer.dragging::after { background: var(--accent); }
.resizer:focus-visible { outline: none; }
body.resizing, body.resizing * { cursor: col-resize !important; user-select: none !important; }
@media (max-width: 900px) { .resizer { display: none; } }
/* Vue 3D étroite (panneaux élargis) : on masque l'aide pour laisser la place au cartouche. */
.stage { container-type: inline-size; }
@container (max-width: 860px) { .hint { display: none; } }
`;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(w) {
  try { localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* stockage indisponible */ }
}

function init() {
  const ws = document.getElementById('workspace');
  if (!ws) return;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const widths = read();
  const current = (side) => document.getElementById(side).getBoundingClientRect().width;
  const clamp = (side, px) => {
    const [lo, hi] = LIMITS[side];
    const other = side === 'rail' ? current('panel') : current('rail');
    const room = ws.clientWidth - other - MIN_STAGE;
    return Math.round(Math.max(lo, Math.min(hi, room, px)));
  };
  const apply = (side, px) => {
    if (px == null) ws.style.removeProperty(`--${side}-w`);
    else ws.style.setProperty(`--${side}-w`, `${px}px`);
    place();
  };

  const handles = {};
  const place = () => {
    handles.rail.style.left = `${current('rail')}px`;
    handles.panel.style.left = `${ws.clientWidth - current('panel')}px`;
  };

  for (const side of ['rail', 'panel']) {
    const h = document.createElement('div');
    h.className = 'resizer';
    h.tabIndex = 0;
    h.setAttribute('role', 'separator');
    h.setAttribute('aria-orientation', 'vertical');
    h.setAttribute('aria-label', side === 'rail' ? 'Redimensionner le menu des assemblages' : 'Redimensionner le panneau des pièces');
    h.title = 'Glisser pour redimensionner · double-clic : largeur par défaut';
    ws.appendChild(h);
    handles[side] = h;

    h.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      h.classList.add('dragging');
      document.body.classList.add('resizing');
      const rect = ws.getBoundingClientRect();
      const move = (ev) => {
        const px = side === 'rail' ? ev.clientX - rect.left : rect.right - ev.clientX;
        apply(side, clamp(side, px));
      };
      const up = () => {
        h.classList.remove('dragging');
        document.body.classList.remove('resizing');
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', up);
        h.removeEventListener('pointercancel', up);
        widths[side] = Math.round(current(side));
        save(widths);
      };
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
      h.addEventListener('pointercancel', up);
    });
    h.addEventListener('dblclick', () => {
      delete widths[side];
      save(widths);
      apply(side, null);
    });
    h.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 64 : 16;
      const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const grow = side === 'rail' ? dir : -dir;
      widths[side] = clamp(side, current(side) + grow * step);
      apply(side, widths[side]);
      save(widths);
    });
  }

  if (widths.rail) apply('rail', clamp('rail', widths.rail));
  if (widths.panel) apply('panel', clamp('panel', widths.panel));
  place();
  new ResizeObserver(place).observe(ws);
}

init();
