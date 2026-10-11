// Outils communs aux trousses de boyaux P058 (tête 6245) et P064 (centreur
// fendu) de l'avance V30 (P032) : pose d'un raccord de la bibliothèque
// _avance_a.js avec ses sièges dans le repère du parent, flexible serti entre
// deux sièges, siège « nu » d'un composant voisin non dessiné ici. Fichier
// préfixé « _ » : pas un assemblage, non inscrit dans parts/index.js.
import { place, seat, hose } from './_avance_a.js';

/** Siège { p, d } (p : bout du cône mâle, d : sortie vers le flexible), embout éventuel. */
export const S = (p, d, end, t) => ({ p, d, ...(end ? { end } : {}), ...(t ? { t } : {}) });
/** Même siège, avec un embout coudé ('90' | '45') dont la douille sort selon t. */
export const E = (s, end, t) => ({ p: s.p, d: s.d, end, t });

export function hoseKit(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  /**
   * Pose un raccord (objet de _avance_a.js) : face d'appui en pos, axe +Y local
   * selon dir, +X local au plus près de x ; inscrit au repère ref, déplacement
   * e en vue éclatée. Retourne ses sièges libres dans le repère de l'ensemble.
   */
  const fit = (ref, obj, pos, dir, x, e) => {
    const g = place(obj, pos, dir, x);
    g.ports = g.userData.ports;
    P(ref, g, e);
    return (g.userData.ports || []).map((_, i) => seat(g, i));
  };
  /** Flexible de catalogue L (po), taille n, entre les sièges a et b. */
  const H = (ref, L, n, a, b, opts, e) => {
    const g = hose(L, n, a, b, opts);
    P(ref, g, e);
    return g;
  };
  return { P, fit, H };
}
