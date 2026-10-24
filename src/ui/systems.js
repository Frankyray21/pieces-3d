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

/** Au-delà, la racine est une table des matières (catalogue d'outils) plutôt qu'une machine en systèmes. */
export const MAX_SYSTEMS = 12;

/** Assemblages directs de la racine (enfants dont elle est le parent), dans l'ordre de sa liste. */
export function rootChildren(eq) {
  const root = eq?.assemblies.get(eq.root);
  const ids = [];
  for (const p of root?.parts || []) {
    const a = p.link && eq.assemblies.get(p.link);
    if (a && a.parent === eq.root && !ids.includes(p.link)) ids.push(p.link);
  }
  return ids;
}

const cache = new WeakMap();
/**
 * Systèmes de l'équipement, dans l'ordre de la liste de la racine. Aucun pour
 * un catalogue ou une racine de plus de MAX_SYSTEMS assemblages (table des
 * matières : pas de couleur par système).
 */
export function systems(eq) {
  if (!eq) return [];
  if (cache.has(eq)) return cache.get(eq);
  let ids = rootChildren(eq);
  if (eq.docWord === 'catalogue' || ids.length > MAX_SYSTEMS) ids = [];
  const out = ids.map((id, i) => {
    const a = eq.assemblies.get(id);
    const n = (i % PALETTE_SIZE) + 1;
    return { id, title: a.titleFr, index: n, color: `var(--sys-${n})`, icon: iconFor(a.titleFr, a.title) };
  });
  cache.set(eq, out);
  return out;
}

// ------------------------------------------------------------------ tuiles par système
// Navigation plus fine que les systèmes racine : chaque système, puis ses
// sous-assemblages directs (traîneau, avance, treuil, tête…), puis leurs
// propres sous-assemblages en raccourcis. Tout est déduit de la hiérarchie
// des listes (parent / children, lignes « link ») : rien n'est propre à un
// équipement.

/** Assemblages sous id (compris), en profondeur. */
export function subtree(eq, id, out = new Set()) {
  if (out.has(id) || !eq.assemblies.has(id)) return out;
  out.add(id);
  for (const c of eq.assemblies.get(id).children) subtree(eq, c, out);
  return out;
}

/** Enfants d'un assemblage, dans l'ordre de sa liste (lignes « link »), sans doublon. */
export function childrenOf(eq, id) {
  const a = eq.assemblies.get(id);
  if (!a) return [];
  const ids = [];
  for (const p of a.parts) if (p.link && p.link !== id && eq.assemblies.has(p.link) && !ids.includes(p.link)) ids.push(p.link);
  for (const c of a.children || []) if (eq.assemblies.has(c) && !ids.includes(c)) ids.push(c);
  return ids;
}

/**
 * Chemin de repères de l'assemblage « from » jusqu'au sous-assemblage « to »
 * (ex. ['5', '2']), ou null si « to » n'est pas sous « from ».
 */
export function refPath(eq, from, to) {
  const path = [];
  let id = to;
  const seen = new Set();
  while (id && id !== from) {
    if (seen.has(id)) return null;
    seen.add(id);
    const a = eq.assemblies.get(id);
    const parent = a && eq.assemblies.get(a.parent);
    if (!parent) return null;
    const row = parent.parts.find((r) => r.link === id);
    if (!row) return null;
    path.unshift(row.ref);
    id = parent.id;
  }
  return id === from ? path : null;
}

/** Lignes de pièces (hors renvois vers un sous-assemblage) d'un ensemble d'assemblages. */
function pieceLines(eq, ids) {
  let n = 0;
  for (const id of ids) for (const r of eq.assemblies.get(id).parts) if (!r.link) n++;
  return n;
}

/**
 * Tuiles des systèmes : [{ id, title, icon, color, index, sheet, pieces, subs,
 * children: [tuile…] }] — profondeur 2 sous chaque système (enfants avec
 * leurs propres enfants en raccourcis). « pieces » : lignes de pièces des
 * listes du manuel, sous-ensembles compris ; « subs » : nombre de sous-ensembles.
 */
export function systemTiles(eq) {
  const tile = (id, sys, depth) => {
    const a = eq.assemblies.get(id);
    const ids = subtree(eq, id);
    return {
      id,
      title: a.titleFr || a.title,
      icon: depth ? iconFor(a.titleFr, a.title) : sys.icon,
      color: sys.color,
      index: sys.index,
      system: sys.id,
      sheet: a.sheet || (a.sheets || [])[0] || id,
      pieces: pieceLines(eq, ids),
      subs: ids.size - 1,
      // Sous-tuiles : sans la racine ni un autre système (déjà présenté pour lui-même).
      children: depth < 2 ? childrenOf(eq, id).filter((c) => c !== eq.root && !sysIds.has(c)).map((c) => tile(c, sys, depth + 1)) : [],
    };
  };
  const list = systems(eq);
  const sysIds = new Set(list.map((s) => s.id));
  return list.map((s) => tile(s.id, s, 0));
}
