// Icônes simples en SVG en ligne (trait de 1,8 px, couleur du texte : currentColor).
// Usage : icon('goutte') → chaîne SVG ; iconEl('cle', { size: 20 }) → élément.
// Noms français, avec quelques alias anglais (gear, drop, bolt, cable, wrench, search).

const P = {
  // Engrenage : moteur, transmission, rotation.
  engrenage: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5"/><circle cx="12" cy="12" r="6.6"/>',
  // Goutte : hydraulique, huile, eau.
  goutte: '<path d="M12 3.2c3.3 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.7-6.8 6-11Z"/><path d="M9.2 14.6a2.8 2.8 0 0 0 2.8 2.8"/>',
  // Éclair : électricité.
  eclair: '<path d="M13.2 2.8 5.6 13.4h5.6l-1 7.8 7.6-10.6h-5.6l1-7.8Z"/>',
  // Câble : câblage, treuil, wire line.
  cable: '<path d="M4 20v-4.5a3.5 3.5 0 0 1 3.5-3.5h9a3.5 3.5 0 0 0 3.5-3.5V4"/><path d="M2.6 20h2.8M18.6 4h2.8"/><circle cx="12" cy="12" r="1.1"/>',
  // Clé : entretien, mécanique générale.
  cle: '<path d="M14.8 3.6a4.6 4.6 0 0 0-4.3 6.2l-6.6 6.6a1.8 1.8 0 0 0 2.6 2.6l6.6-6.6a4.6 4.6 0 0 0 6.2-4.3l-2.8 2.8-2.9-.7-.7-2.9 2.8-2.8a4.6 4.6 0 0 0-.9-.9Z"/>',
  // Loupe : recherche.
  recherche: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.6 5.6"/>',
  // Page du manuel.
  page: '<path d="M6 2.8h8.4L18.8 7v14.2H6Z"/><path d="M14.4 2.8V7h4.4M9 11h6.6M9 14h6.6M9 17h4.2"/>',
  // Cube : 3D, assemblage.
  cube: '<path d="M12 2.8 3.8 7.3v9.4l8.2 4.5 8.2-4.5V7.3Z"/><path d="m3.8 7.3 8.2 4.5 8.2-4.5M12 11.8v9.4"/>',
  // Liste de pièces.
  liste: '<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.6" cy="6.5" r="1"/><circle cx="4.6" cy="12" r="1"/><circle cx="4.6" cy="17.5" r="1"/>',
  // Avertissement (numéros à vérifier).
  alerte: '<path d="M12 3.4 2.6 20h18.8Z"/><path d="M12 9.6v4.8M12 17.2v.2"/>',
  // Fermer, chevrons.
  fermer: '<path d="m6 6 12 12M18 6 6 18"/>',
  droite: '<path d="m9 5 7 7-7 7"/>',
  gauche: '<path d="m15 5-7 7 7 7"/>',
  // Accueil (vue d'ensemble de l'équipement).
  accueil: '<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M6 9.4v10.4h12V9.4"/><path d="M10 19.8v-5.4h4v5.4"/>',
  // Panneau latéral.
  panneau: '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2"/><path d="M14.6 4.2v15.6"/>',
  // Structure (châssis, traîneau, plancher) : poutre en treillis.
  structure: '<path d="M3 7h18M3 17h18M5 7l4 10 4-10 4 10 4-10"/>',
};
const ALIAS = { gear: 'engrenage', drop: 'goutte', bolt: 'eclair', 'éclair': 'eclair', wrench: 'cle', 'clé': 'cle', search: 'recherche', close: 'fermer', home: 'accueil', list: 'liste', warning: 'alerte' };

/** Noms disponibles. */
export const ICONS = Object.keys(P);

/**
 * SVG d'une icône (chaîne). size : côté en px (défaut 18) ; title : texte
 * accessible (sinon l'icône est décorative) ; cls : classes en plus de « ico-svg ».
 */
export function icon(name, { size = 18, title = '', cls = '' } = {}) {
  const body = P[ALIAS[name] || name] || P.cle;
  const t = String(title).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const a11y = t ? `role="img" aria-label="${t}"` : 'aria-hidden="true"';
  return `<svg class="ico-svg${cls ? ` ${cls}` : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${t ? `<title>${t}</title>` : ''}${body}</svg>`;
}

/** Même icône, sous forme d'élément DOM. */
export function iconEl(name, opts) {
  const t = document.createElement('template');
  t.innerHTML = icon(name, opts);
  return t.content.firstElementChild;
}
