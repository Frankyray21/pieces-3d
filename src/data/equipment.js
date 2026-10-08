// Chargement et normalisation des données d'équipement + contrôle qualité
// des listes de pièces (numéros en double, numéros proches, lignes absentes).

const BASE = 'equipment/';

export async function loadIndex() {
  const res = await fetch(`${BASE}index.json`);
  if (!res.ok) throw new Error(`Index des équipements introuvable (${res.status})`);
  return (await res.json()).equipment;
}

export async function loadEquipment(id) {
  const res = await fetch(`${BASE}${id}/data.json`);
  if (!res.ok) throw new Error(`Données de l'équipement « ${id} » introuvables (${res.status})`);
  return normalize(await res.json());
}

const isPnText = (v) => /^\d[\d -]{5,12}\d$/.test(String(v || ''));

function row(raw, source) {
  const [ref, pn, qty, desc, extra = {}] = raw;
  const r = {
    ref: String(ref),
    pn: pn || '',
    qty: qty ?? null,
    desc,
    ...extra,
    source,
    key: `${source.id}:${ref}`,
  };
  // Tous les numéros de la ligne (un par taille quand ils diffèrent : N, N2, N3…).
  r.pns = [...new Set([r.pn, ...Object.values(r.sizes || {}).filter(isPnText)].filter(Boolean))];
  return r;
}

/**
 * Repères répétés dans une même liste (« 4 » pour les tubes de 1,5 m et de
 * 3 m, options d'une même pièce) : chaque ligne reste sélectionnable sous un
 * repère interne « 4#2 », affiché « 4 », et désigne la même pièce en 3D.
 */
function dedupe(parts) {
  const seen = new Map();
  return parts.map((raw) => {
    const ref = String(raw[0]);
    const n = (seen.get(ref) || 0) + 1;
    seen.set(ref, n);
    if (n === 1) return raw;
    const extra = raw[4] || {};
    return [`${ref}#${n}`, raw[1], raw[2], raw[3], { ...extra, label: ref, same: extra.same || ref }];
  });
}

/** Tailles d'une ligne regroupées par numéro : [[n°, [N, N3]], [n°, [N2]]]. */
export function sizeGroups(r) {
  const m = new Map();
  for (const [s, v] of Object.entries(r.sizes || {})) {
    if (!m.has(v)) m.set(v, []);
    m.get(v).push(s);
  }
  return [...m];
}

export { isPnText };

function normalize(data) {
  const base = `${BASE}${data.id}/`;
  const eq = {
    ...data,
    pageUrl: (sheet) => base + data.document.pagePattern.replace('{sheet}', sheet),
    // « catalogue » (pages numérotées) ou « manuel » (feuilles F01, P024…).
    docWord: data.document.kind === 'catalogue' ? 'catalogue' : 'manuel',
    sheetId: sheetNaming(Object.keys(data.sheetTitles)[0] || 'F01'),
    sheetOwner: new Map(),
    assemblies: new Map(),
    documents: new Map(),
    rows: [],
  };
  for (const [id, a] of Object.entries(data.assemblies)) {
    const source = { type: 'assembly', id, sheet: id };
    const sheet = a.sheet || id;
    source.sheet = sheet;
    const asm = { ...a, id, sheet, parts: dedupe(a.parts).map((r) => row(r, source)), parent: null, children: [] };
    eq.assemblies.set(id, asm);
  }
  for (const asm of eq.assemblies.values()) {
    for (const p of asm.parts) {
      if (p.link && eq.assemblies.has(p.link)) {
        const child = eq.assemblies.get(p.link);
        if (!child.parent) child.parent = asm.id;
        if (!asm.children.includes(p.link)) asm.children.push(p.link);
      }
    }
    eq.rows.push(...asm.parts);
  }
  for (const asm of eq.assemblies.values()) asm.children.sort();
  // Page du manuel → assemblage ou document qui la contient (dessins et listes).
  const own = (sheet, id) => { if (!eq.sheetOwner.has(sheet)) eq.sheetOwner.set(sheet, id); };
  for (const asm of eq.assemblies.values()) [asm.id, ...(asm.sheets || []), ...(asm.lists || [])].forEach((s) => own(s, asm.id));
  for (const d of data.documents) d.sheets.forEach((s) => own(s, d.id));
  for (const d of data.documents) {
    const source = { type: 'document', id: d.id, sheet: d.sheets[d.sheets.length - 1] };
    const doc = { ...d, parts: dedupe(d.parts).map((r) => row(r, source)) };
    eq.documents.set(d.id, doc);
    eq.rows.push(...doc.parts);
  }
  analyze(eq);
  return eq;
}

// Numérotation des pages d'après un exemple : « F01 » → F01, F02… ; « P001 » → P001, P002…
function sheetNaming(sample) {
  const [, prefix, digits] = /^(\D*)(\d+)$/.exec(sample) || [null, 'F', '01'];
  return (num) => `${prefix}${String(num).padStart(digits.length, '0')}`;
}

export function normPn(pn) {
  return String(pn || '').toUpperCase().replace(/^\*/, '').replace(/[\s]/g, '');
}

const GENERIC = new Set(['VALVE', 'ASS', 'ASS.', 'ASSEMBLY', 'AND', 'FOR', 'WITH', 'THE', 'A-B', 'PART', 'KIT', 'SOLD', 'ONLY', 'IN']);
const NEAR_GENERIC = new Set(['VALVE', 'AND', 'FOR', 'WITH', 'THE', '-']);
const SYN = {
  ESTOP: 'EMERGENCY', CENTRALISER: 'CENTRALIZER', LUBRIFICATOR: 'LUBRICATOR', TAB: 'TABLE', ROCKDRILL: 'ROCK', HOLBACK: 'HOLD', HOLDBACK: 'HOLD',
  // Abréviations de visserie (catalogue Epiroc : « HHCS », « Capscrew », « Locknut »).
  HHCS: 'BOLT', SHCS: 'BOLT', CAPSCREW: 'BOLT', SCREW: 'BOLT', LOCKNUT: 'NUT', NYLOC: 'NUT',
};

function words(desc) {
  return String(desc).toUpperCase()
    .replace(/([A-Z])\s*\/\s*(?=[A-Z])/g, '$1 ') // REGULATOR/STRAINER → REGULATOR STRAINER
    .replace(/([A-Z])-(?=[A-Z])/g, '$1 ') // LOAD-UNLOAD → LOAD UNLOAD
    .split(/[^A-Z0-9"#/.-]+/)
    .filter(Boolean);
}
const isSize = (t) => /\d/.test(t);

function tokens(desc) {
  return new Set(words(desc).filter((t) => t.length > 2 && !isSize(t) && !GENERIC.has(t)).map((t) => SYN[t] || t));
}

function trigrams(s) {
  s = String(s).toUpperCase().replace(/[^A-Z]/g, '');
  const out = new Set();
  for (let i = 0; i < s.length - 2; i++) out.add(s.slice(i, i + 3));
  return out;
}

/** Deux descriptions désignent-elles vraisemblablement la même pièce ? */
function similar(a, b) {
  const ta = tokens(a), tb = tokens(b);
  for (const t of ta) if (tb.has(t)) return true;
  const ga = trigrams(a), gb = trigrams(b);
  if (!ga.size || !gb.size) return false;
  let n = 0;
  for (const g of ga) if (gb.has(g)) n++;
  return n / Math.min(ga.size, gb.size) >= 0.5;
}

/** Test strict : mots de l'une inclus dans l'autre, et dimensions compatibles. */
function sameItem(a, b) {
  const split = (d) => {
    const all = words(d).filter((t) => !NEAR_GENERIC.has(t));
    return {
      names: new Set(all.filter((t) => t.length > 2 && !isSize(t)).map((t) => SYN[t] || t)),
      sizes: new Set(all.filter(isSize)),
    };
  };
  const A = split(a), B = split(b);
  if (A.sizes.size && B.sizes.size && ![...A.sizes].some((x) => B.sizes.has(x))) return false;
  if (!A.names.size || !B.names.size) return false;
  const [s, l] = A.names.size <= B.names.size ? [A.names, B.names] : [B.names, A.names];
  for (const t of s) if (!l.has(t)) return false;
  return true;
}

function lev1(a, b) {
  // Vrai si a et b diffèrent d'exactement une édition (substitution, insertion, suppression).
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) === 1;
}

// Numérotation interne à préfixe de lettres (Sandvik : CX011242, SH00010-1.250) :
// un seul chiffre d'écart désigne une variante ou une autre taille, pas une frappe.
function sequential(a, b) {
  // Numéros à 9 chiffres ou plus (Epiroc 3760017222, 3760017223…) : des pièces
  // voisines portent des numéros consécutifs ; seul un écart dans les trois
  // derniers chiffres est ainsi normal (un écart plus haut reste suspect).
  if (a.length === b.length && /^\d{9,}$/.test(a) && /^\d{9,}$/.test(b)) {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return i >= a.length - 3;
    return false;
  }
  if (a.length !== b.length || !/^[A-Z]{2}/.test(a) || !/^[A-Z]{2}/.test(b)) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return /\d/.test(a[i]) && /\d/.test(b[i]);
  return false;
}

function analyze(eq) {
  const byPn = new Map();
  for (const r of eq.rows) {
    r.flags = [];
    if (r.flag === 'missing-row') r.flags.push({ level: 'warn', text: 'Ligne absente de la liste du manuel.' });
    if (r.flag === 'no-pn' || (!r.pns.length && !r.pseudo && !r.supplier && !r.nss && !r.pnText)) r.flags.push({ level: 'warn', text: `Aucun numéro de pièce au ${eq.docWord}.` });
    for (const pn of r.pns) {
      const n = normPn(pn);
      if (!n) continue;
      if (!byPn.has(n)) byPn.set(n, []);
      if (!byPn.get(n).includes(r)) byPn.get(n).push(r);
    }
  }
  eq.byPn = byPn;
  const linked = (a, b) => a.link === b.source.id || b.link === a.source.id;
  for (const r of eq.rows) r.usedIn = [];
  for (const [, rows] of byPn) {
    for (const r of rows) {
      const others = rows.filter((o) => o !== r);
      r.usedIn.push(...others.filter((o) => !r.usedIn.includes(o)));
      const conflicts = others.filter((o) => !linked(r, o) && !similar(r.desc, o.desc));
      if (conflicts.length && !r.flags.some((f) => f.level === 'error')) {
        r.flags.push({ level: 'error', text: 'Ce numéro figure ailleurs avec une description différente — vérifier avant de commander.', refs: conflicts });
      }
    }
  }
  // Numéros presque identiques (une seule frappe d'écart) pour la même pièce,
  // jamais listés ensemble sur une même feuille : erreur de saisie probable.
  const pns = [...byPn.keys()].filter((p) => p.length >= 6);
  const sheetsOf = (pn) => new Set(byPn.get(pn).map((r) => r.source.id));
  for (let i = 0; i < pns.length; i++) {
    for (let j = i + 1; j < pns.length; j++) {
      if (!lev1(pns[i], pns[j]) || sequential(pns[i], pns[j])) continue;
      const si = sheetsOf(pns[i]);
      if ([...sheetsOf(pns[j])].some((x) => si.has(x))) continue;
      for (const a of byPn.get(pns[i])) for (const b of byPn.get(pns[j])) {
        if (!sameItem(a.desc, b.desc)) continue;
        a.flags.push({ level: 'warn', text: `Numéro très proche ailleurs (${pns[j]}) pour la même pièce — possible erreur de saisie.`, refs: [b] });
        b.flags.push({ level: 'warn', text: `Numéro très proche ailleurs (${pns[i]}) pour la même pièce — possible erreur de saisie.`, refs: [a] });
      }
    }
  }
  for (const r of eq.rows) if (r.note && !r.flags.some((f) => f.text === r.note)) r.flags.push({ level: 'info', text: r.note });
  eq.issues = eq.rows.filter((r) => r.flags.some((f) => f.level !== 'info'));
}

export function sourceLabel(eq, src) {
  if (src.type === 'assembly') return `${sheetLabel(eq, src.sheet)} · ${eq.assemblies.get(src.id).titleFr}`;
  const d = eq.documents.get(src.id);
  return `${d.sheets.map((s) => sheetLabel(eq, s)).join('/')} · ${d.titleFr}`;
}

/** Nom d'une page : « P024 » (manuel) ou « p. 24 » (catalogue à pages numérotées). */
export function sheetLabel(eq, s) {
  return eq.docWord === 'catalogue' ? `p. ${parseInt(String(s).replace(/^\D+/, ''), 10)}` : s;
}

/** Recherche plein texte (numéro, description, fournisseur). */
export function search(eq, q) {
  q = q.trim().toUpperCase();
  if (q.length < 2) return [];
  const qn = q.replace(/\s/g, '');
  const words = q.split(/\s+/);
  return eq.rows
    .map((r) => {
      const pns = r.pns.map(normPn);
      const sup = normPn(r.supplier);
      let score = 0;
      if (pns.includes(qn)) score = 100;
      else if (pns.some((pn) => pn.includes(qn))) score = 60;
      else if (sup && sup.includes(qn)) score = 50;
      else if (words.every((w) => r.desc.toUpperCase().includes(w))) score = 30;
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map((x) => x.r);
}
