// Textures procédurales d'usure (peinture écaillée, rouille, huile ; aucune poussière).
// Chaque jeu donne : couleur (map), rugosité/métal (G = rugosité, B = métal, comme glTF)
// et carte de normales. Toutes les textures se répètent sans couture.
import * as THREE from 'three';

// ---------- bruit périodique ----------
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
function periodicNoise(N, cells, rand) {
  const g = new Float32Array(cells * cells).map(() => rand());
  const out = new Float32Array(N * N);
  const sm = t => t * t * (3 - 2 * t);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = i / N * cells, y = j / N * cells;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = sm(x - x0), fy = sm(y - y0);
    const a = g[(y0 % cells) * cells + x0 % cells], b = g[(y0 % cells) * cells + (x0 + 1) % cells];
    const c = g[((y0 + 1) % cells) * cells + x0 % cells], d = g[((y0 + 1) % cells) * cells + (x0 + 1) % cells];
    out[j * N + i] = (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  return out;
}
function fbm(N, rand, octaves = [4, 8, 16, 32, 64], gains = [0.5, 0.25, 0.13, 0.07, 0.05]) {
  const out = new Float32Array(N * N);
  octaves.forEach((c, k) => { const n = periodicNoise(N, c, rand); for (let i = 0; i < out.length; i++) out[i] += n[i] * gains[k]; });
  const s = gains.reduce((a, b) => a + b, 0);
  for (let i = 0; i < out.length; i++) out[i] /= s;
  return out;
}

// Masque dessiné sur un canevas 2D (blobs irréguliers, rayures, coulures), répété en tuile.
function maskCanvas(N, draw) {
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#000'; cx.fillRect(0, 0, N, N);
  for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { cx.save(); cx.translate(ox, oy); draw(cx); cx.restore(); }
  const d = cx.getImageData(0, 0, N, N).data;
  const m = new Float32Array(N * N);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4] / 255;
  return m;
}
function blob(cx, rand, x, y, r) {
  cx.beginPath();
  const n = 14 + Math.floor(rand() * 8);
  let rr = r;
  for (let k = 0; k <= n; k++) {
    const a = k / n * Math.PI * 2;
    rr = rr * 0.6 + r * (0.6 + rand() * 0.6) * 0.4;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * (0.6 + rand() * 0.6);
    k ? cx.lineTo(px, py) : cx.moveTo(px, py);
  }
  cx.closePath(); cx.fill();
}

const hex = c => new THREE.Color(c);
function toTex(cv, srgb, repeat = 1) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(repeat, repeat);
  return t;
}

/**
 * Jeu de textures usées.
 * opts : base (couleur), wear (0-1 écaillage), rust (0-1), oil (0-1), rough (rugosité de la peinture),
 *        metal (true = métal nu : pas de peinture), seed, checker (motif de tôle larmée).
 */
export function wornSet(opts) {
  const o = { wear: 0.5, rust: 0.4, oil: 0.3, rough: 0.55, metal: false, seed: 7, N: 512, checker: false, ...opts };
  const N = o.N, rand = rng(o.seed * 9301 + 17);
  const base = hex(o.base);
  const mott = fbm(N, rand);
  const fine = periodicNoise(N, 128, rand);

  // écaillage : blobs de toutes tailles (gros éclats rares, petits nombreux)
  const chips = maskCanvas(N, cx => {
    cx.fillStyle = '#fff';
    const n = Math.round(20 + o.wear * 160);
    for (let i = 0; i < n; i++) {
      const r = (rand() ** 4) * N * 0.028 * (0.4 + o.wear) + 0.8;
      blob(cx, rand, rand() * N, rand() * N, r);
    }
    // rayures (outils, chaînes, élingues)
    cx.strokeStyle = '#fff';
    for (let i = 0; i < 8 + o.wear * 30; i++) {
      cx.lineWidth = 0.6 + rand() * 1.4;
      const x = rand() * N, y = rand() * N, a = rand() * Math.PI, l = 10 + rand() * N * 0.18;
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.3); cx.stroke();
    }
  });
  // halo de rouille autour des éclats + coulures vers le bas (v = hauteur)
  const rustM = maskCanvas(N, cx => {
    cx.filter = 'blur(3px)';
    cx.fillStyle = 'rgba(255,255,255,0.9)';
    const n = Math.round(6 + o.rust * 40);
    for (let i = 0; i < n; i++) blob(cx, rand, rand() * N, rand() * N, 2 + (rand() ** 2) * N * 0.03 * (0.5 + o.rust));
    cx.filter = 'blur(2px)';
    for (let i = 0; i < 4 + o.rust * 18; i++) {
      const x = rand() * N, y = rand() * N, l = 20 + rand() * N * 0.25;
      const gr = cx.createLinearGradient(x, y, x, y + l);
      gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      cx.fillStyle = gr; cx.fillRect(x - 1 - rand() * 2, y, 2 + rand() * 3, l);
    }
  });
  // huile et graisse (sombres, plus lisses)
  const oilM = maskCanvas(N, cx => {
    cx.filter = 'blur(6px)';
    for (let i = 0; i < 2 + o.oil * 10; i++) {
      cx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.5})`;
      blob(cx, rand, rand() * N, rand() * N, 6 + rand() * N * 0.07 * o.oil);
    }
  });

  const col = document.createElement('canvas'); col.width = col.height = N;
  const orm = document.createElement('canvas'); orm.width = orm.height = N;
  const nor = document.createElement('canvas'); nor.width = nor.height = N;
  const C = col.getContext('2d').createImageData(N, N), R = orm.getContext('2d').createImageData(N, N), Nn = nor.getContext('2d').createImageData(N, N);
  const H = new Float32Array(N * N);
  const steel = hex(0x55575a), primer = hex(0x6b6e6c), rustC = hex(0x6e3b1d), rustD = hex(0x3d2414), oilC = hex(0x14120f);
  const c = new THREE.Color();
  for (let i = 0; i < N * N; i++) {
    const x = i % N, y = (i / N) | 0;
    const m = mott[i], f = fine[i];
    let rough, metal, h = 0;
    if (o.metal) {
      // métal nu : variations de teinte, micro-rayures
      c.copy(base).multiplyScalar(0.82 + m * 0.3 + (f - 0.5) * 0.06);
      rough = o.rough + (m - 0.5) * 0.25; metal = 1;
      const ch = chips[i];
      if (ch > 0.5) { c.multiplyScalar(1.15); rough -= 0.12; h = -0.2; }
    } else {
      // peinture : délavée par endroits
      c.copy(base).multiplyScalar(0.78 + m * 0.34 + (f - 0.5) * 0.05);
      c.lerp(hex(0x8a8580), Math.max(0, m - 0.62) * 0.35 * o.wear);
      rough = o.rough + (m - 0.5) * 0.2 + (f - 0.5) * 0.06; metal = 0; h = 1;
      const ch = chips[i];
      if (ch > 0.5) {
        // éclat : bord d'apprêt, puis acier
        const edge = ch < 0.85;
        c.copy(edge ? primer : steel).multiplyScalar(0.85 + f * 0.3);
        rough = edge ? 0.6 : 0.42; metal = edge ? 0 : 0.85; h = edge ? 0.5 : 0;
      }
    }
    const r = rustM[i] * o.rust * (o.metal ? 0.6 : 1);
    if (r > 0.05) {
      const rc = rustC.clone().lerp(rustD, f);
      c.lerp(rc, Math.min(1, r * (0.6 + m * 0.6)));
      rough = rough + (0.95 - rough) * r; metal *= 1 - r;
      h -= r * 0.3 * f;
    }
    const ol = oilM[i] * o.oil;
    if (ol > 0.02) { c.lerp(oilC, ol * 0.75); rough = rough * (1 - ol) + 0.28 * ol; }
    if (o.checker) {
      // tôle larmée : losanges en relief, pas de 32 px
      const u = (x % 32) - 16, v = (y % 32) - 16;
      const a = (u + v) * 0.7071, b = (u - v) * 0.7071;
      const d = (a / 11) ** 2 + (b / 3) ** 2;
      if (d < 1) { h += 1.6 * (1 - d); c.multiplyScalar(1.06); rough -= 0.08; }
    }
    H[i] = h;
    C.data[i * 4] = Math.min(255, c.r ** (1 / 2.2) * 255);
    C.data[i * 4 + 1] = Math.min(255, c.g ** (1 / 2.2) * 255);
    C.data[i * 4 + 2] = Math.min(255, c.b ** (1 / 2.2) * 255);
    C.data[i * 4 + 3] = 255;
    R.data[i * 4] = 255;
    R.data[i * 4 + 1] = Math.max(8, Math.min(255, rough * 255));
    R.data[i * 4 + 2] = Math.max(0, Math.min(255, metal * 255));
    R.data[i * 4 + 3] = 255;
  }
  const k = o.checker ? 2.2 : 1.6;
  for (let i = 0; i < N * N; i++) {
    const x = i % N, y = (i / N) | 0;
    const hx = H[y * N + (x + 1) % N] - H[y * N + (x + N - 1) % N];
    const hy = H[((y + 1) % N) * N + x] - H[((y + N - 1) % N) * N + x];
    const v = new THREE.Vector3(-hx * k, hy * k, 1).normalize();
    Nn.data[i * 4] = (v.x * 0.5 + 0.5) * 255; Nn.data[i * 4 + 1] = (v.y * 0.5 + 0.5) * 255; Nn.data[i * 4 + 2] = (v.z * 0.5 + 0.5) * 255; Nn.data[i * 4 + 3] = 255;
  }
  col.getContext('2d').putImageData(C, 0, 0);
  orm.getContext('2d').putImageData(R, 0, 0);
  nor.getContext('2d').putImageData(Nn, 0, 0);
  const ormT = toTex(orm, false);
  return { map: toTex(col, true), roughnessMap: ormT, metalnessMap: ormT, normalMap: toTex(nor, false) };
}
