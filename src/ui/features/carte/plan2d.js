// Plan 2D de la mine (minicarte et carte plein écran). Nord = Z positif, en
// haut ; vue de dessus sans miroir : u = (x1 - x), v = (z1 - z).
import { L, W } from '../../../models/plancher-dd/plan.js';

export const PX = 10; // pixels par mètre de l'image du plan

/** Image du plan : galeries, parois, plancher, refuge. */
export function imagePlan(bornes, sdf, { refuge, escalier }) {
  const w = Math.ceil((bornes.x1 - bornes.x0) * PX), h = Math.ceil((bornes.z1 - bornes.z0) * PX);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const img = x.createImageData(w, h);
  const d = img.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const wx = bornes.x1 - (i + 0.5) / PX, wz = bornes.z1 - (j + 0.5) / PX;
    const s = sdf(wx, wz);
    const k = (j * w + i) * 4;
    if (s > 0.35) { d[k + 3] = 0; continue; }
    if (s > -0.05) { d[k] = 200; d[k + 1] = 206; d[k + 2] = 214; d[k + 3] = Math.round(255 * Math.max(0, Math.min(1, (0.35 - s) / 0.3))); continue; }
    // Intérieur : gris ardoise, un peu plus clair près des parois.
    const t = Math.min(1, -s / 2.2);
    d[k] = 66 - 18 * t; d[k + 1] = 74 - 18 * t; d[k + 2] = 86 - 18 * t; d[k + 3] = 240;
  }
  x.putImageData(img, 0, 0);
  const U = (wx) => (bornes.x1 - wx) * PX, V = (wz) => (bornes.z1 - wz) * PX;
  // Plancher (bois) et escalier.
  x.fillStyle = 'rgba(196, 146, 82, 0.85)';
  x.fillRect(U(L), V(W / 2), L * PX, W * PX);
  x.strokeStyle = 'rgba(255, 214, 150, 0.9)';
  x.lineWidth = 1.5;
  x.strokeRect(U(L), V(W / 2), L * PX, W * PX);
  x.fillStyle = 'rgba(230, 180, 110, 0.9)';
  x.fillRect(U(escalier.x1), V(escalier.z1), (escalier.x1 - escalier.x0) * PX, (escalier.z1 - escalier.z0) * PX);
  // Refuge.
  x.fillStyle = 'rgba(34, 211, 107, 0.9)';
  x.fillRect(U(refuge.x1), V(refuge.zc + refuge.hz), (refuge.x1 - refuge.x0) * PX, 2 * refuge.hz * PX);
  return { canvas: c, U, V };
}

/** Pictogramme rond d'un point (lettre sur pastille de couleur). */
export function pastille(x, px, py, r, couleur, lettre, { anneau = '#fff', alpha = 1 } = {}) {
  x.save();
  x.globalAlpha = alpha;
  x.beginPath();
  x.arc(px, py, r, 0, Math.PI * 2);
  x.fillStyle = couleur;
  x.fill();
  x.lineWidth = Math.max(1.5, r * 0.22);
  x.strokeStyle = anneau;
  x.stroke();
  if (lettre) {
    x.fillStyle = '#0b0d12';
    x.font = `800 ${Math.round(r * 1.15)}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(lettre, px, py + r * 0.06);
  }
  x.restore();
}

/** Flèche du joueur (pointe vers le haut avant rotation). */
export function flecheJoueur(x, px, py, ang, r) {
  x.save();
  x.translate(px, py);
  x.rotate(ang);
  x.beginPath();
  x.moveTo(0, -r);
  x.lineTo(r * 0.72, r * 0.8);
  x.lineTo(0, r * 0.38);
  x.lineTo(-r * 0.72, r * 0.8);
  x.closePath();
  x.shadowColor = 'rgba(0,0,0,0.6)';
  x.shadowBlur = 4;
  x.fillStyle = '#ffffff';
  x.fill();
  x.lineWidth = 1.5;
  x.strokeStyle = '#141824';
  x.stroke();
  x.restore();
}

/** Tracé d'itinéraire (trait de couleur sur un liseré sombre). pts : points écran. */
export function trace(x, pts, epaisseur, couleur = '#ff7c24') {
  if (!pts || pts.length < 2) return;
  x.save();
  x.lineJoin = x.lineCap = 'round';
  x.beginPath();
  x.moveTo(...pts[0]);
  for (const p of pts.slice(1)) x.lineTo(...p);
  x.strokeStyle = 'rgba(16, 21, 27, 0.8)';
  x.lineWidth = epaisseur * 1.8;
  x.stroke();
  x.strokeStyle = couleur;
  x.lineWidth = epaisseur;
  x.stroke();
  x.restore();
}
