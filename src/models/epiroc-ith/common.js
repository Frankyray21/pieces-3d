import * as THREE from 'three';

// Outils de carottage Epiroc : repère commun à tous les modèles.
// Axe de l'outil selon X, le haut du trou (lance, câble) vers +X ; vue de
// côté par défaut (les pièces longues se lisent de gauche à droite, comme les
// photos du catalogue). Unités : mètres ; les pièces d'une famille sont
// dessinées en multiples du diamètre de corps D de la taille.

// Dimensions DCDMA des séries Q (tige, tube extérieur, tube intérieur, couronne).
// D : diamètre du corps des têtes (passe dans la tige) ; shoulder : épaulement
// d'atterrissage, juste sous l'alésage de la tige.
export const SIZES = {
  B: { D: 0.0415, shoulder: 0.0445, rod: [0.0556, 0.046], outer: [0.0572, 0.046], inner: [0.0429, 0.0381], bit: [0.0599, 0.0364] },
  N: { D: 0.0545, shoulder: 0.0585, rod: [0.0699, 0.0603], outer: [0.073, 0.0603], inner: [0.0556, 0.050], bit: [0.0757, 0.0476] },
  H: { D: 0.0705, shoulder: 0.0755, rod: [0.0889, 0.0778], outer: [0.0921, 0.0778], inner: [0.073, 0.0667], bit: [0.096, 0.0635] },
  P: { D: 0.0915, shoulder: 0.098, rod: [0.1143, 0.1016], outer: [0.1175, 0.1032], inner: [0.0921, 0.087], bit: [0.1226, 0.085] },
};

/** Vue par défaut : de côté, légèrement plongeante (outil horizontal). */
export const SIDE = { dir: [0.18, 0.42, 1], section: { axis: 'z', pos: 0.5 } };

/** Rotation pour orienter selon Z (goupilles transversales) un objet construit selon Y. */
export const ALONG_Z = [Math.PI / 2, 0, 0];

/**
 * Mise en page de la vue éclatée, comme les dessins du catalogue : les pièces
 * de l'axe s'écartent les unes des autres sur place (rangée A), les pièces
 * intérieures passent sur une rangée sous l'outil (B), la petite visserie au-
 * dessus (C), chaque rangée gardant l'ordre de montage. Une pièce peut aussi
 * suivre une autre (follow) avec un déplacement propre (goupilles, cliquets).
 *
 *   const L = layout(api, D);
 *   L.add('6', obj, { row: 'A' });
 *   L.add('7', pin, { follow: '6', extra: [0, 1.5, 0] });
 *   L.done();
 *
 * minPitch : écart minimal (en D) entre les centres de deux pièces voisines
 * d'une rangée, pour que les bulles des rondelles et des écrous ne se
 * chevauchent pas. order : clé de tri (mètres, le long de l'axe) d'une pièce
 * dont la boîte ne dit pas la place dans l'ordre de montage (bague enfilée
 * sur un tube, par exemple). anchor : les rangées hors de l'axe se placent
 * au droit de l'endroit de l'axe éclaté où vont leurs pièces (goupilles au-
 * dessus de leur corps), sans chevauchement ; sinon elles sont centrées.
 */
export function layout(api, D, { gap = 0.35, rows = { A: 0, B: -2.3, C: 2.1 }, spread = 1, minPitch = 0, anchor = false } = {}) {
  const items = [];
  const L = {
    add(ref, obj, o = {}) {
      const it = { ref: String(ref), obj, row: o.row ?? (o.follow ? null : 'A'), follow: o.follow ?? null, extra: o.extra || [0, 0, 0], key: o.key ?? null, gap: o.gap, noLabel: o.noLabel, order: o.order };
      items.push(it);
      return obj;
    },
    done() {
      for (const it of items) {
        it.obj.updateMatrixWorld(true);
        it.box = new THREE.Box3().setFromObject(it.obj);
        it.c = it.box.getCenter(new THREE.Vector3());
        it.ex = new THREE.Vector3();
      }
      // Position éclatée sur l'axe d'un point x de l'assemblage (interpolée
      // entre les centres des pièces de la rangée A).
      let onAxis = (x) => x;
      const lenOf = (it) => it.box.max.x - it.box.min.x;
      const pitch = (a, b) => Math.max(lenOf(a) / 2 + (a.gap ?? gap) * D * spread + lenOf(b) / 2, minPitch * D);
      const rowList = Object.entries(rows).sort(([a], [b]) => (a === 'A' ? -1 : b === 'A' ? 1 : 0));
      for (const [row, ry] of rowList) {
        const key = (it) => it.order ?? it.box.min.x;
        const list = items.filter((it) => it.row === row).sort((a, b) => key(a) - key(b) || a.c.x - b.c.x);
        if (!list.length) continue;
        if (anchor && row !== 'A') {
          const want = list.map((it) => onAxis(it.c.x));
          const pos = [];
          list.forEach((it, i) => pos.push(i ? Math.max(want[i], pos[i - 1] + pitch(list[i - 1], it)) : want[i]));
          const shift = want.reduce((sum, w, i) => sum + w - pos[i], 0) / list.length;
          list.forEach((it, i) => it.ex.set(pos[i] + shift - it.c.x, ry * D - it.c.y, 0));
          continue;
        }
        let x = list[0].box.min.x;
        let prev = null;
        const targets = list.map((it) => {
          const len = it.box.max.x - it.box.min.x;
          let t = x + len / 2;
          if (prev != null && t - prev < minPitch * D) {
            x += minPitch * D - (t - prev);
            t = x + len / 2;
          }
          prev = t;
          x += len + (it.gap ?? gap) * D * spread;
          return t;
        });
        // Rangée centrée sur le centre des pièces assemblées.
        const span0 = (list[0].box.min.x + Math.max(...list.map((it) => it.box.max.x))) / 2;
        const span1 = (list[0].box.min.x + x - (list[list.length - 1].gap ?? gap) * D * spread) / 2;
        list.forEach((it, i) => it.ex.set(targets[i] - (span1 - span0) - it.c.x, ry * D - (row === 'A' ? 0 : it.c.y), 0));
        if (row === 'A') {
          const pts = list.map((it) => [it.c.x, it.c.x + it.ex.x]).sort((a, b) => a[0] - b[0]);
          onAxis = (x) => {
            if (x <= pts[0][0]) return x + pts[0][1] - pts[0][0];
            const n = pts.length - 1;
            if (x >= pts[n][0]) return x + pts[n][1] - pts[n][0];
            const k = pts.findIndex((p) => p[0] >= x);
            const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
            return x1 > x0 ? y0 + ((x - x0) * (y1 - y0)) / (x1 - x0) : y1;
          };
        }
      }
      const byKey = new Map(items.filter((it) => it.key).map((it) => [it.key, it]));
      const host = (it) => byKey.get(it.follow) || items.find((o) => o.ref === it.follow && !o.follow);
      for (const it of items) {
        if (!it.follow) continue;
        const h = host(it);
        if (h) it.ex.copy(h.ex);
      }
      for (const it of items) {
        it.ex.add(new THREE.Vector3(...it.extra).multiplyScalar(D));
        api.part(it.ref, it.obj, it.ex.toArray(), { noLabel: it.noLabel });
      }
    },
  };
  return L;
}

/** Profil en unités de D → mètres, fermé automatiquement pour une pièce creuse. */
export function prof(D, pts) {
  const out = pts.map(([r, x]) => [r * D, x * D]);
  const [r0, y0] = out[0];
  const [r1, y1] = out[out.length - 1];
  if (r0 > 0 && (r0 !== r1 || y0 !== y1)) out.push([r0, y0]);
  return out;
}
