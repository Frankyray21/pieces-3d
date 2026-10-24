// Systèmes d'un équipement : les sous-assemblages directs de l'assemblage
// racine (ex. STM-1500 : foreuse, groupe hydraulique, console). Chaque système
// reçoit une couleur de la palette (variables CSS --sys-1 à --sys-8, définies
// dans atelier.css pour les modes clair et sombre) et une icône déduite de son
// titre. Un assemblage plus profond hérite du système de son ancêtre.

export const PALETTE_SIZE = 8;

const RULES = [
  ['goutte', /hydraul|huile|pomp|pump|power ?pack|r[ée]servoir|tank|refroid|cooler|accumul|fluid|graiss|lubri|water|\beau\b|filtr/i],
  ['eclair', /[ée]lectri|electric|c[âa]blage|wiring|batter|[ée]clairage|light|sensor|capteur/i],
  ['cable', /treuil|winch|wire ?line|c[âa]ble|cable|overshot|hoist/i],
  ['panneau', /console|commande|control|tableau de bord|dashboard/i],
  ['engrenage', /foreuse|drill|moteur|engine|motor|t[êe]te|head|rotation|transmission|gear|engren|pivot|poulie|pulley|carottier|core barrel|[ée]merillon|swivel/i],
  ['structure', /ch[âa]ssis|chassis|frame|plancher|structure|tra[îi]neau|skid|m[âa]t\b|mast|slide|glissi[èe]re|chenille|track|deck|garde|marche|recouvrement|toit|canop/i],
];

/** Icône d'un titre d'assemblage (nom de icons.js). */
export function iconFor(...titles) {
  const t = titles.filter(Boolean).join(' ');
  for (const [name, re] of RULES) if (re.test(t)) return name;
  return 'cle';
}

/**
 * Système d'un assemblage : { id, title, index (1…), color (« var(--sys-n) »),
 * icon } ; null pour la racine, un document ou un identifiant inconnu.
 */
export function systemOf(eq, id) {
  if (!eq || !eq.assemblies.has(id) || id === eq.root) return null;
  let a = eq.assemblies.get(id);
  while (a.parent && a.parent !== eq.root && eq.assemblies.has(a.parent)) a = eq.assemblies.get(a.parent);
  if (a.parent !== eq.root) return null; // assemblage hors de l'arbre de la racine
  const sys = systems(eq);
  return sys.find((s) => s.id === a.id) || null;
}

const cache = new WeakMap();
/** Systèmes de l'équipement, dans l'ordre de la liste de la racine. */
export function systems(eq) {
  if (!eq) return [];
  if (cache.has(eq)) return cache.get(eq);
  const root = eq.assemblies.get(eq.root);
  const ids = [];
  for (const p of root?.parts || []) if (p.link && eq.assemblies.has(p.link) && !ids.includes(p.link)) ids.push(p.link);
  const out = ids.map((id, i) => {
    const a = eq.assemblies.get(id);
    const n = (i % PALETTE_SIZE) + 1;
    return { id, title: a.titleFr, index: n, color: `var(--sys-${n})`, icon: iconFor(a.titleFr, a.title) };
  });
  cache.set(eq, out);
  return out;
}
