// Pictogrammes au trait (24 × 24) : un par système, et ceux des vues d'atelier.
const P = {
  general: '<path d="M2 16V8h9v8M11 11h5l3 3v2M2 16h17"/><circle cx="6" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>',
  carrier: '<path d="M3 13h18M5 13V9h14v4"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  engine: '<path d="M4 10h3V7h8l2 3h3v7h-3l-2 2H8l-1-2H4z"/><path d="M9 7V5h4v2M2 12v3"/>',
  cab: '<path d="M5 20V9l3-5h8l2 5v11z"/><path d="M8 4l-1 6h10l-1-6M5 14h14"/>',
  hydraulic: '<path d="M12 3s-5 6-5 10a5 5 0 0 0 10 0c0-4-5-10-5-10z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  air: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/>',
  electric: '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
  slide: '<path d="M3 6h18M3 18h18"/><rect x="8" y="9" width="8" height="6" rx="1"/><path d="M12 6v3M12 15v3"/>',
  feed: '<path d="M9 2h6v4H9zM12 6v12M10 18h4l-2 4z"/><path d="M7 10h10M7 14h10"/>',
  carousel: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="6.5" r="1.5"/><circle cx="17.5" cy="12" r="1.5"/><circle cx="12" cy="17.5" r="1.5"/><circle cx="6.5" cy="12" r="1.5"/>',
  grease: '<path d="M4 12h10l4-4 3 1-4 5v5H4z"/><path d="M8 12V9h4v3"/>',
  fire: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-4-12-3 2-6 5-6 9-1-1-2-2-2-4-2 2-2 5-2 7 0 4 3 7 7 7z"/>',
  decal: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  barrel: '<rect x="9" y="2" width="6" height="20" rx="1"/><path d="M9 6h6M9 18h6"/>',
  head: '<path d="M8 3h8v6l-2 3v9h-4v-9L8 9z"/>',
  overshot: '<path d="M12 2v10a4 4 0 1 1-4 4"/><path d="M9 5h6"/>',
  swivel: '<circle cx="12" cy="9" r="5"/><path d="M12 14v8M9 22h6M4 9h3M17 9h3"/>',
  packing: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  casing: '<path d="M7 2v20M17 2v20M7 6h10M7 18h10"/>',
  fitting: '<path d="M2 9h6v6H2zM16 9h6v6h-6zM8 11h8M8 13h8"/>',
  kit: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  tech: '<path d="M4 4h16v16H4zM4 9h16M4 14h16M10 4v16"/>',
  service: '<circle cx="12" cy="13" r="8"/><path d="M12 13l4-3M9 2h6M12 2v3"/>',
  notes: '<path d="M8 3h8v3H8z"/><path d="M8 4.5H5V21h14V4.5h-3"/><path d="M8 11h8M8 15h6"/>',
  schema: '<path d="M4 6h6v4h4V6h6M4 18h4v-4h8v4h4"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="18" r="1.5"/>',
  page: '<path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/><path d="M9 11h7M9 14h7M9 17h4.5"/>',
};

/** Pictogramme en SVG (trait de la couleur du texte). */
export function icon(name) {
  return `<svg class="ico24" viewBox="0 0 24 24" aria-hidden="true">${P[name] || P.general}</svg>`;
}
