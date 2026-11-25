// Itinéraire (GPS) : A* sur une grille de la mine. Une cellule est praticable
// si le travailleur y tient (distance au mur, garde-corps, objets posés) ; le
// plancher ne s'atteint donc que par l'escalier, comme à pied.

const PAS = 0.35;

/**
 * Prépare la grille. libre(x, z) → vrai si la position est praticable.
 * Retourne { trouver(de, vers) → [[x, z], …] | null, longueur(chemin), proche([x, z]) }.
 */
export function grilleChemins(bornes, libre) {
  const { x0, z0 } = bornes;
  const nx = Math.ceil((bornes.x1 - x0) / PAS), nz = Math.ceil((bornes.z1 - z0) / PAS);
  const ok = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) ok[j * nx + i] = libre(x0 + (i + 0.5) * PAS, z0 + (j + 0.5) * PAS) ? 1 : 0;
  const cell = (x, z) => [Math.floor((x - x0) / PAS), Math.floor((z - z0) / PAS)];
  const centre = (i, j) => [x0 + (i + 0.5) * PAS, z0 + (j + 0.5) * PAS];
  const dedans = (i, j) => i >= 0 && j >= 0 && i < nx && j < nz;

  /** Cellule praticable la plus proche (spirale), ou null. */
  function proche(x, z) {
    const [ci, cj] = cell(x, z);
    for (let r = 0; r < 12; r++) {
      let best = null, bd = Infinity;
      for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
        if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || !dedans(i, j) || !ok[j * nx + i]) continue;
        const [cx, cz] = centre(i, j);
        const d = (cx - x) ** 2 + (cz - z) ** 2;
        if (d < bd) { bd = d; best = [i, j]; }
      }
      if (best) return best;
    }
    return null;
  }

  const g = new Float32Array(nx * nz);
  const from = new Int32Array(nx * nz);
  const ferme = new Uint8Array(nx * nz);
  const VOIS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];

  function trouver(de, vers) {
    const a = proche(de[0], de[1]), b = proche(vers[0], vers[1]);
    if (!a || !b) return null;
    const ia = a[1] * nx + a[0], ib = b[1] * nx + b[0];
    g.fill(Infinity);
    from.fill(-1);
    ferme.fill(0);
    const h = (k) => {
      const di = Math.abs((k % nx) - b[0]), dj = Math.abs(Math.floor(k / nx) - b[1]);
      return Math.max(di, dj) + (Math.SQRT2 - 1) * Math.min(di, dj);
    };
    // Tas binaire (f, k).
    const tas = [];
    const pousser = (f, k) => {
      tas.push([f, k]);
      let i = tas.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (tas[p][0] <= tas[i][0]) break; [tas[p], tas[i]] = [tas[i], tas[p]]; i = p; }
    };
    const tirer = () => {
      const top = tas[0], last = tas.pop();
      if (tas.length) {
        tas[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < tas.length && tas[l][0] < tas[m][0]) m = l;
          if (r < tas.length && tas[r][0] < tas[m][0]) m = r;
          if (m === i) break;
          [tas[m], tas[i]] = [tas[i], tas[m]];
          i = m;
        }
      }
      return top;
    };
    g[ia] = 0;
    pousser(h(ia), ia);
    while (tas.length) {
      const [, k] = tirer();
      if (ferme[k]) continue;
      if (k === ib) break;
      ferme[k] = 1;
      const i = k % nx, j = Math.floor(k / nx);
      for (const [di, dj, c] of VOIS) {
        const ii = i + di, jj = j + dj;
        if (!dedans(ii, jj)) continue;
        const kk = jj * nx + ii;
        if (!ok[kk] || ferme[kk]) continue;
        // Pas de coin coupé en diagonale.
        if (di && dj && (!ok[j * nx + ii] || !ok[jj * nx + i])) continue;
        const ng = g[k] + c;
        if (ng < g[kk]) { g[kk] = ng; from[kk] = k; pousser(ng + h(kk), kk); }
      }
    }
    if (from[ib] < 0 && ia !== ib) return null;
    const pts = [];
    for (let k = ib; k >= 0; k = k === ia ? -1 : from[k]) pts.push(centre(k % nx, Math.floor(k / nx)));
    pts.reverse();
    pts[0] = [de[0], de[1]];
    return lisser(simplifier(pts));
  }

  // Simplification par visibilité : on saute les points tant que la ligne reste praticable.
  function visible(a, b) {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (PAS * 0.5));
    for (let s = 1; s < n; s++) {
      const t = s / n;
      const [i, j] = cell(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
      if (!dedans(i, j) || !ok[j * nx + i]) return false;
    }
    return true;
  }
  function simplifier(pts) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !visible(pts[i], pts[j])) j--;
      out.push(pts[j]);
      i = j;
    }
    return out;
  }
  function lisser(pts) {
    if (pts.length < 3) return pts;
    let p = pts;
    for (let it = 0; it < 2; it++) {
      const q = [p[0]];
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i], b = p[i + 1];
        if (i > 0) q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        if (i < p.length - 2) q.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      q.push(p[p.length - 1]);
      p = q;
    }
    return p;
  }
  const longueur = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  return { trouver, longueur, proche: (x, z) => !!proche(x, z) };
}
