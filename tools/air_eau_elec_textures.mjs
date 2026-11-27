// Textures du lot air, eau et électricité (air-eau-electricite) : couleur (saleté, boue, coulures,
// éclats de peinture, inscriptions) et normales, dessinées sur un canevas dans Chromium (Playwright),
// enregistrées en JPEG dans public/equipment/air-eau-electricite/textures/. Le site et l'export Unreal
// (scripts/export-air-eau-elec-unreal.mjs) lisent les mêmes fichiers.
//
// Convention : UV du glTF (v = 0 en haut de l'image) ; le modèle charge les textures avec flipY = false.
// Usage : node tools/air_eau_elec_textures.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const OUT = new URL('../public/equipment/air-eau-electricite/textures/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Ce qui suit s'exécute dans la page.
function generer() {
  // ---------------------------------------------------------------- bruit
  let graine = 1;
  const alea = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
  const semer = (s) => { graine = s * 7919 + 13; for (let i = 0; i < 5; i++) alea(); };
  function treillis(n) { const t = new Float32Array(n * n); for (let i = 0; i < t.length; i++) t[i] = alea(); return t; }
  // Bruit de valeur périodique (tuile), octaves.
  function bruit(W, H, echelleX, echelleY, octaves = 4) {
    const out = new Float32Array(W * H);
    let amp = 1, tot = 0;
    for (let o = 0; o < octaves; o++) {
      const nx = Math.max(1, Math.round(echelleX * 2 ** o)), ny = Math.max(1, Math.round(echelleY * 2 ** o));
      const n = Math.max(nx, ny), g = treillis(n);
      for (let y = 0; y < H; y++) {
        const fy = (y / H) * ny, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
        for (let x = 0; x < W; x++) {
          const fx = (x / W) * nx, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
          const a = g[(y0 % ny) * n + (x0 % nx)], b = g[(y0 % ny) * n + ((x0 + 1) % nx)];
          const c = g[((y0 + 1) % ny) * n + (x0 % nx)], d = g[((y0 + 1) % ny) * n + ((x0 + 1) % nx)];
          out[y * W + x] += amp * (a + (b - a) * sx + (c - a + (a - b - c + d) * sx) * sy);
        }
      }
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot;
    return out;
  }
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  // ---------------------------------------------------------------- canevas
  function canevas(W, H) { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  /** Normales (OpenGL, Y vers le haut) depuis une carte de hauteur. */
  function normales(W, H, haut, force) {
    const c = canevas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const h = (xx, yy) => haut[((yy + H) % H) * W + ((xx + W) % W)];
      const dx = (h(x + 1, y) - h(x - 1, y)) * force, dy = (h(x, y + 1) - h(x, y - 1)) * force;
      const l = Math.hypot(dx, dy, 1), i = (y * W + x) * 4;
      img.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; // v vers le bas dans l'image : Y OpenGL vers le haut
      img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  /** Pixels de couleur d'après une fonction (x, y, i) => [r, g, b]. */
  function peindre(W, H, f) {
    const c = canevas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, [r, gg, b] = f(x, y, i);
      img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  const melange = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const fois = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

  /** Éclaboussures de boue (taches rondes floues) : carte 0–1. */
  function eclaboussures(W, H, n, rMin, rMax, bas = 0) {
    const c = canevas(W, H), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < n; k++) {
      const x = alea() * W, y = bas ? H * (1 - bas * alea() ** 2) : alea() * H, r = rMin + (rMax - rMin) * alea() ** 2;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.25 + 0.6 * alea();
      grad.addColorStop(0, `rgba(255,255,255,${a})`); grad.addColorStop(0.6, `rgba(255,255,255,${a * 0.6})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) { g.save(); g.translate(ox, oy); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }
    }
    const d = g.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return out;
  }
  /** Coulures verticales (vers le bas de l'image) : carte 0–1. */
  function coulures(W, H, n, long, larg) {
    const c = canevas(W, H), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < n; k++) {
      const x = alea() * W, y = alea() * H, l = long * (0.3 + alea()), w = larg * (0.4 + alea());
      const grad = g.createLinearGradient(0, y, 0, y + l);
      const a = 0.2 + 0.5 * alea();
      grad.addColorStop(0, `rgba(255,255,255,${a})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      for (const oy of [-H, 0]) { g.beginPath(); g.ellipse(x, y + oy + l / 2, w / 2, l / 2, 0, 0, 7); g.fill(); }
    }
    const d = g.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return out;
  }
  /** Rayures fines (traits droits clairs). */
  function rayures(W, H, n, long) {
    const c = canevas(W, H), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const x = alea() * W, y = alea() * H, a = alea() * Math.PI, l = long * (0.2 + alea());
      g.strokeStyle = `rgba(255,255,255,${0.3 + 0.6 * alea()})`; g.lineWidth = 0.6 + alea() * 1.4;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const d = g.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return out;
  }
  /** Texte répété le long de x (inscription moulée d'un boyau ou d'un câble). */
  function inscrire(c, texte, { couleur, y, corps, pas, alpha = 0.85 }) {
    const g = c.getContext('2d');
    g.save();
    g.globalAlpha = alpha; g.fillStyle = couleur;
    g.font = `700 ${corps}px "Arial Narrow", Arial, sans-serif`;
    g.textBaseline = 'middle';
    const p = Math.max(pas, g.measureText(texte).width + 60);
    for (let x = 10; x + g.measureText(texte).width < c.width + 1; x += p) g.fillText(texte, x, y);
    g.restore();
  }
  /** Use de l'inscription : on gratte le texte avec le bruit (canevas déjà peint). */
  function salir(c, sale, couleurSale, quantite) {
    const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let i = 0; i < sale.length; i++) {
      const t = Math.min(1, sale[i] * quantite);
      for (let k = 0; k < 3; k++) d[i * 4 + k] = d[i * 4 + k] * (1 - t) + couleurSale[k] * t;
    }
    g.putImageData(img, 0, 0);
  }

  const R = {};
  const BOUE = hex('#5d574d'), BOUE_SECHE = hex('#8c8679'), CRASSE = hex('#2d2a25');

  // ---------------------------------------------------------------- boyaux (u = longueur 1 m, v = tour)
  function boyau(nom, s, base, bande, texte, couleurTexte) {
    semer(s);
    const W = 1024, H = 256;
    const n1 = bruit(W, H, 16, 4, 5), grain = bruit(W, H, 128, 32, 2), sp = eclaboussures(W, H, 90, 4, 40), sp2 = eclaboussures(W, H, 400, 1, 5);
    const col = peindre(W, H, (x, y, i) => {
      let c = fois(hex(base), 0.82 + 0.28 * n1[i] + 0.08 * grain[i]);
      if (bande && Math.abs(y - H * 0.5) < H * 0.07) c = fois(hex(bande), 0.85 + 0.2 * n1[i]);
      return c;
    });
    if (texte) inscrire(col, texte, { couleur: couleurTexte, y: H * 0.5, corps: 22, pas: 512 });
    const sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) {
      const v = Math.floor(i / W) / H, dessous = lisse(0.55, 1, Math.abs(v - 0.5) * 2); // dessous du boyau, couché au sol
      sale[i] = 0.35 * n1[i] * n1[i] + sp[i] * 0.9 + sp2[i] * 0.5 + dessous * (0.55 + 0.4 * n1[i]);
    }
    salir(col, sale, melange(BOUE, BOUE_SECHE, 0.4), 1);
    const h = new Float32Array(W * H);
    for (let i = 0; i < h.length; i++) h[i] = grain[i] * 0.6 + sp[i] * 0.8 + n1[i] * 0.3;
    R[nom] = { color: col, normal: normales(W, H, h, 2.2) };
  }
  boyau('boyau-air-bp', 1, '#d8ae1c', null, 'AIR  BASSE PRESSION  2 po  ·  ID 51 mm', '#1c1a14');
  boyau('boyau-air-hp', 2, '#1e1f21', '#a8241c', 'AIR  HAUTE PRESSION  2 po  ·  ID 51 mm', '#e8e2d2');
  boyau('boyau-eau', 3, '#1e1f21', '#1f5aa8', 'EAU  1 po  ·  ID 25 mm', '#e8e2d2');
  boyau('gaine-600v', 4, '#191a1c', null, '600 V  ·  TYPE SHD-GC  ·  3/C + 2 G + GC  ·  CÂBLE MINIER', '#d8d2be');

  // Gaine spiralée (protecteur de boyau) : rainures en hélice.
  {
    semer(5);
    const W = 1024, H = 256, n1 = bruit(W, H, 16, 4, 4), sp = eclaboussures(W, H, 120, 4, 34);
    const h = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = (x / W) * 40 + y / H; // 40 spires par mètre
      h[y * W + x] = Math.pow(Math.abs(Math.sin(Math.PI * t)), 0.4);
    }
    const col = peindre(W, H, (x, y, i) => fois(hex('#8f9294'), 0.55 + 0.45 * h[i] - 0.1 * n1[i]));
    const sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) sale[i] = (1 - h[i]) * 0.7 + sp[i] + 0.3 * n1[i];
    salir(col, sale, BOUE, 0.9);
    R['spirale'] = { color: col, normal: normales(W, H, h, 4) };
  }
  // Boyau tressé inox (800 °F) : tresse en diagonale, deux sens.
  {
    semer(6);
    const W = 512, H = 256, n1 = bruit(W, H, 8, 4, 4), sp = eclaboussures(W, H, 40, 3, 24);
    const h = new Float32Array(W * H), fil = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const a = (x / W) * 48 + (y / H) * 16, b = (x / W) * 48 - (y / H) * 16; // 48 mailles par 0,5 m, 16 sur le tour
      const fa = a - Math.floor(a), fb = b - Math.floor(b);
      const dessus = (Math.floor(a) + Math.floor(b)) % 2 === 0;
      const brinsA = Math.abs(Math.sin(fa * Math.PI * 5)), brinsB = Math.abs(Math.sin(fb * Math.PI * 5));
      const ea = Math.sin(fb * Math.PI), eb = Math.sin(fa * Math.PI);
      h[y * W + x] = dessus ? 0.5 + 0.5 * ea * brinsA : 0.5 + 0.5 * eb * brinsB;
      fil[y * W + x] = dessus ? brinsA : brinsB;
    }
    const col = peindre(W, H, (x, y, i) => fois(hex('#b9bcbf'), 0.45 + 0.45 * h[i] + 0.12 * fil[i] - 0.1 * n1[i]));
    const sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) sale[i] = (1 - h[i]) * 0.6 + sp[i] * 0.7 + 0.25 * n1[i];
    salir(col, sale, melange(CRASSE, hex('#6b4a2a'), 0.3), 0.85); // bleui et noirci par la chaleur
    R['tresse-inox'] = { color: col, normal: normales(W, H, h, 3) };
  }
  // Câble d'acier toronné (whip check) : torons en hélice.
  {
    semer(7);
    const W = 512, H = 128, n1 = bruit(W, H, 8, 2, 3);
    const h = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = (x / W) * 24 * 6 + (y / H) * 6;
      const f = t - Math.floor(t);
      h[y * W + x] = Math.sin(f * Math.PI) * (0.8 + 0.2 * Math.sin(((x / W) * 24 * 6 * 7 - (y / H) * 42) * Math.PI));
    }
    const col = peindre(W, H, (x, y, i) => fois(hex('#9da3a8'), 0.35 + 0.6 * h[i] - 0.12 * n1[i]));
    R['cable-acier'] = { color: col, normal: normales(W, H, h, 3) };
  }

  // ---------------------------------------------------------------- surfaces (1 m × 1 m, projection en boîte)
  function surface(nom, s, base, { boue = 0.6, coul = 0, eclats = 0, metal = null, brosse = 0, raies = 0, rouille = 0, var: va = 0.25 } = {}) {
    semer(s);
    const W = 1024, H = 1024;
    const n1 = bruit(W, H, 6, 6, 6), n2 = bruit(W, H, 24, 24, 3), grain = bruit(W, H, 256, 256, 1);
    const sp = eclaboussures(W, H, 160, 3, 50, 0.6), cl = coulures(W, H, Math.round(coul * 160), 260, 14);
    const ec = eclats ? bruit(W, H, 18, 18, 4) : null, ry = raies ? rayures(W, H, raies, 120) : null;
    const br = brosse ? bruit(W, H, 2, 400, 2) : null;
    const rs = rouille ? bruit(W, H, 30, 30, 4) : null;
    const h = new Float32Array(W * H);
    const col = peindre(W, H, (x, y, i) => {
      let c = fois(hex(base), 1 - va / 2 + va * n1[i] + 0.06 * grain[i] + (br ? brosse * (br[i] - 0.5) : 0));
      h[i] = grain[i] * 0.3 + (br ? br[i] * brosse * 2 : 0);
      if (ec) { const t = lisse(0.66, 0.7, ec[i] * 0.7 + n2[i] * 0.3); c = melange(c, metal ? hex(metal) : hex('#5a5d60'), t); h[i] -= t * 0.8; }
      if (ry) c = melange(c, hex('#d6d6d0'), ry[i] * 0.6);
      if (rs) { const t = lisse(0.7, 0.8, rs[i] * 0.75 + n1[i] * 0.25) * rouille; c = melange(c, hex('#6e3a1c'), t); h[i] += t * 0.4; }
      return c;
    });
    const sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) {
      const v = Math.floor(i / W) / H;
      sale[i] = boue * (0.5 * n1[i] * n1[i] + 0.9 * sp[i] + 0.35 * lisse(0.6, 1, v) * n2[i]) + cl[i] * 1.2;
      h[i] += sp[i] * 0.6;
    }
    salir(col, sale, melange(CRASSE, BOUE, 0.45), 1);
    R[nom] = { color: col, normal: normales(W, H, h, 1.6) };
  }
  surface('inox-sale', 8, '#a9aba8', { boue: 0.6, coul: 0.45, brosse: 0.12, raies: 120, var: 0.3 });
  surface('rouge-peint', 9, '#a8221c', { boue: 0.7, coul: 0.5, eclats: 1, metal: '#4a4440', raies: 60, var: 0.3 });
  surface('gris-peint', 10, '#8d9296', { boue: 0.55, coul: 0.4, eclats: 1, raies: 40 });
  surface('jaune-plastique', 11, '#e1b416', { boue: 0.6, raies: 80, var: 0.2 });
  surface('orange-peint', 12, '#d9561c', { boue: 0.65, eclats: 1, metal: '#3e3b38', raies: 50, rouille: 0.6 });
  surface('orange-plastique', 13, '#e2631e', { boue: 0.5, raies: 30, var: 0.18 });
  surface('acier-zingue', 14, '#8a8d8c', { boue: 0.55, rouille: 0.8, raies: 70, var: 0.35 });
  surface('rouge-bouton', 15, '#c0161a', { boue: 0.3, raies: 20, var: 0.15 });

  // ---------------------------------------------------------------- étiquettes (images entières)
  const POLICE = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
  function etiquette(nom, W, H, dessin, usure = 0.5, s = 20) {
    semer(s);
    const c = canevas(W, H), g = c.getContext('2d');
    dessin(g, W, H);
    const n1 = bruit(W, H, 5, 5 * H / W, 5), sp = eclaboussures(W, H, 30, 3, Math.max(W, H) / 10);
    const sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) sale[i] = usure * (0.4 * n1[i] * n1[i] + 0.8 * sp[i]);
    salir(c, sale, melange(CRASSE, BOUE, 0.4), 1);
    R[nom] = { color: c };
  }
  const ajuster = (g, txt, max, corps, graisse = 900) => {
    g.font = `${graisse} ${corps}px ${POLICE}`;
    const w = g.measureText(txt).width;
    if (w > max) g.font = `${graisse} ${(corps * max) / w}px ${POLICE}`;
  };
  // DANGER 600 VOLTS : autocollant blanc, bandeau noir à ovale rouge (comme sur la photo de la console).
  etiquette('danger-600v', 512, 576, (g, W, H) => {
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#111'; g.fillRect(0, 0, W, H * 0.3);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(W / 2, H * 0.15, W * 0.44, H * 0.11, 0, 0, 7); g.fill();
    g.fillStyle = '#d0141c'; g.beginPath(); g.ellipse(W / 2, H * 0.15, W * 0.42, H * 0.095, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ajuster(g, 'DANGER', W * 0.7, 80); g.fillText('DANGER', W / 2, H * 0.155);
    g.fillStyle = '#d0141c';
    ajuster(g, '600', W * 0.8, 150, 800); g.fillText('600', W / 2, H * 0.5);
    ajuster(g, 'VOLTS', W * 0.85, 130, 800); g.fillText('VOLTS', W / 2, H * 0.78);
    g.strokeStyle = '#999'; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4);
  }, 0.35, 21);
  // Transformateur : autocollant jaune très usé.
  etiquette('danger-transfo', 640, 384, (g, W, H) => {
    g.fillStyle = '#f2cf16'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = '#c8141c'; g.lineWidth = 8; g.beginPath(); g.ellipse(W / 2, H * 0.17, W * 0.3, H * 0.12, 0, 0, 7); g.stroke();
    g.fillStyle = '#c8141c'; ajuster(g, 'DANGER', W * 0.5, 60); g.fillText('DANGER', W / 2, H * 0.17);
    g.fillStyle = '#111'; ajuster(g, 'TRANSFORMATEUR', W * 0.9, 64); g.fillText('TRANSFORMATEUR', W / 2, H * 0.45);
    ajuster(g, '600 VOLTS', W * 0.7, 62); g.fillText('600 VOLTS', W / 2, H * 0.66);
    ajuster(g, '120 VOLTS', W * 0.7, 62); g.fillText('120 VOLTS', W / 2, H * 0.86);
  }, 1.1, 22);
  // Boîte de défaut à la terre.
  etiquette('gfb', 512, 384, (g, W, H) => {
    g.fillStyle = '#ecebe5'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f2cf16'; g.fillRect(0, 0, W, H * 0.28);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ajuster(g, 'ATTENTION', W * 0.6, 60); g.fillText('ATTENTION', W / 2, H * 0.14);
    ajuster(g, 'PROTECTION DE DÉFAUT', W * 0.9, 40, 800); g.fillText('PROTECTION DE DÉFAUT', W / 2, H * 0.42);
    ajuster(g, 'À LA TERRE · 600 V', W * 0.9, 40, 800); g.fillText('À LA TERRE · 600 V', W / 2, H * 0.56);
    ajuster(g, 'ESSAI (TEST) CHAQUE QUART', W * 0.9, 28, 700); g.fillText('ESSAI (TEST) CHAQUE QUART', W / 2, H * 0.74);
    ajuster(g, 'RÉARMER (RESET) APRÈS DÉCLENCHEMENT', W * 0.9, 28, 700); g.fillText('RÉARMER (RESET) APRÈS DÉCLENCHEMENT', W / 2, H * 0.86);
  }, 0.6, 23);
  // Arrêt d'urgence : plaque jaune ronde.
  etiquette('estop', 512, 512, (g, W, H) => {
    g.fillStyle = '#e8b912'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(W / 2, H / 2);
    g.font = `900 46px ${POLICE}`;
    const pas = 0.16;
    // Haut : lettres debout, de gauche à droite.
    const haut = 'ARRÊT D\'';
    [...haut].forEach((ch, k) => { g.save(); g.rotate((k - (haut.length - 1) / 2) * pas); g.translate(0, -205); g.fillText(ch, 0, 0); g.restore(); });
    // Bas : lettres debout, lues de gauche à droite (sens inverse sur le cercle).
    const bas = 'URGENCE';
    [...bas].forEach((ch, k) => { g.save(); g.rotate(-(k - (bas.length - 1) / 2) * pas); g.translate(0, 205); g.fillText(ch, 0, 0); g.restore(); });
    g.restore();
  }, 0.5, 24);
  // Banderole DANGER rouge (u : 1 m de ruban).
  {
    semer(25);
    const W = 1024, H = 64, c = canevas(W, H), g = c.getContext('2d');
    g.fillStyle = '#c8161c'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f4f0e8'; g.textBaseline = 'middle'; g.font = `900 38px ${POLICE}`;
    for (let x = 20; x < W; x += 256) g.fillText('DANGER', x, H / 2 + 2);
    const n1 = bruit(W, H, 16, 1, 4), sp = eclaboussures(W, H, 30, 2, 14), sale = new Float32Array(W * H);
    for (let i = 0; i < sale.length; i++) sale[i] = 0.3 * n1[i] * n1[i] + sp[i] * 0.8;
    salir(c, sale, BOUE, 1);
    R['banderole'] = { color: c };
  }
  // Fenêtre de la porte : plexiglas embué de crasse (couleur = voile, l'alpha est dans le matériau).
  {
    semer(26);
    const W = 512, H = 1024, n1 = bruit(W, H, 4, 8, 5), cl = coulures(W, H, 60, 300, 20), sp = eclaboussures(W, H, 40, 4, 60);
    const c = peindre(W, H, (x, y, i) => {
      const t = Math.min(1, 0.25 + 0.5 * n1[i] + cl[i] * 0.8 + sp[i] * 0.6);
      return melange([235, 235, 230], hex('#4a453c'), t);
    });
    R['vitre'] = { color: c };
  }
  // Face du contacteur (100-D140) et poignée du disjoncteur CB1, vues à travers la fenêtre.
  etiquette('contacteur', 384, 512, (g, W, H) => {
    g.fillStyle = '#d9d9d4'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#555'; g.font = `700 30px ${POLICE}`; g.textAlign = 'left'; g.fillText('100-D140', 30, 60);
    g.font = `400 14px Arial`; for (let k = 0; k < 8; k++) g.fillText('━━━━━━━━━━━━━━━━━━━━', 30, 120 + k * 16);
    g.fillStyle = '#333'; g.beginPath(); g.arc(W / 2, H * 0.42, 34, 0, 7); g.fill();
    g.fillStyle = '#eee'; g.fillRect(40, H * 0.82, W - 80, 50);
    g.fillStyle = '#222'; g.font = `700 22px Arial`; g.fillText('2 T1    4 T2    6 T3', 60, H * 0.82 + 32);
  }, 0.4, 27);
  etiquette('cb1', 128, 64, (g, W, H) => {
    g.fillStyle = '#fafafa'; g.fillRect(0, 0, W, H); g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 40px ${POLICE}`; g.fillText('CB1', W / 2, H / 2 + 2);
  }, 0.2, 28);

  // Sortie : JPEG (couleur 0,88 ; normales 0,92).
  const out = {};
  for (const [nom, t] of Object.entries(R)) {
    out[`${nom}`] = t.color.toDataURL('image/jpeg', 0.88);
    if (t.normal) out[`${nom}-n`] = t.normal.toDataURL('image/jpeg', 0.92);
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();
const images = await page.evaluate(generer);
await browser.close();
let total = 0;
for (const [nom, url] of Object.entries(images)) {
  const buf = Buffer.from(url.split(',')[1], 'base64');
  total += buf.length;
  writeFileSync(new URL(`${nom}.jpg`, OUT), buf);
}
console.log(`${Object.keys(images).length} textures, ${(total / 1e6).toFixed(2)} Mo`);
