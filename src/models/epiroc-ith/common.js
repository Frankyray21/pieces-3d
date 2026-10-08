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
 */
export function layout(api, D, { gap = 0.35, rows = { A: 0, B: -2.3, C: 2.1 }, spread = 1 } = {}) {
  const items = [];
  const L = {
    add(ref, obj, o = {}) {
      const it = { ref: String(ref), obj, row: o.row ?? (o.follow ? null : 'A'), follow: o.follow ?? null, extra: o.extra || [0, 0, 0], key: o.key ?? null, gap: o.gap, noLabel: o.noLabel };
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
      for (const [row, ry] of Object.entries(rows)) {
        const list = items.filter((it) => it.row === row).sort((a, b) => a.box.min.x - b.box.min.x || a.c.x - b.c.x);
        if (!list.length) continue;
        let x = list[0].box.min.x;
        const targets = list.map((it) => {
          const len = it.box.max.x - it.box.min.x;
          const t = x + len / 2;
          x += len + (it.gap ?? gap) * D * spread;
          return t;
        });
        // Rangée centrée sur le centre des pièces assemblées.
        const span0 = (list[0].box.min.x + Math.max(...list.map((it) => it.box.max.x))) / 2;
        const span1 = (list[0].box.min.x + x - (list[list.length - 1].gap ?? gap) * D * spread) / 2;
        list.forEach((it, i) => it.ex.set(targets[i] - (span1 - span0) - it.c.x, ry * D - (row === 'A' ? 0 : it.c.y), 0));
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
