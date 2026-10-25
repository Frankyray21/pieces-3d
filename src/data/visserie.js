// Visserie calculée d'après les listes de pièces (boulons, vis, écrous,
// rondelles, goupilles) : famille et taille lues dans la description, sinon
// dans le numéro (B625-2750 = 5/8 × 2 3/4 po). Au moindre doute, la taille
// reste « non précisée » plutôt que déduite. Module sans dépendance : utilisé
// par la page des données techniques (src/ui/features/donnees.js) et par le
// contrôle scripts/check-visserie.mjs.

/** Décimal → fraction au 1/64 (« 5/8 », « 2 3/4 », « 1 ») ; une cote qui n'en est pas une reste décimale (« 3,865 »). */
export function frac(x) {
  if (!Number.isFinite(x) || x <= 0) return '';
  if (Math.abs(x * 64 - Math.round(x * 64)) > 0.05) return String(+x.toFixed(3)).replace('.', ',');
  const n = Math.round(x * 64);
  const whole = Math.floor(n / 64);
  let r = n % 64;
  let d = 64;
  while (r && r % 2 === 0) { r /= 2; d /= 2; }
  return r ? `${whole ? `${whole} ` : ''}${r}/${d}` : String(whole);
}

/** « 2 3/4 », « 5/8 », « 1.75 », « 0.750 » → décimal. */
function num(s) {
  s = String(s).trim().replace(/^(\d+)\s*-\s*(\d+\/\d+)$/, '$1 $2'); // « 1-5/8 » = 1 5/8
  // Fractions en pouces : dénominateur 2, 4, 8, 16, 32 ou 64 seulement (« 1 1/12 » est rejeté).
  const ok = (d) => [2, 4, 8, 16, 32, 64].includes(+d);
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return ok(m[3]) ? +m[1] + m[2] / m[3] : NaN;
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return ok(m[2]) ? m[1] / m[2] : NaN;
  return parseFloat(s);
}

/** Code de taille d'un numéro (« 625 » → 5/8 po, « 75 » → 3/4 po, « 1000 » → 1 po). */
const code = (c) => (c.length <= 2 ? +c / 100 : +c / 1000);

// Pas de la visserie : raccords, robinets, ensembles (trousses, brides fendues), manilles, colliers de boyau
// (« CLAMP, T-BOLT »), coudes de tube (« SW.NUT BENT TUBE ELB.LG »), bielles (« CONNECTING ROD AND CAP (INC. 2 BOLTS
// & NUTS) ») et pièces usinées qui ne portent un mot de visserie que dans leur nom (vis-mère, bague, axe, bras de
// distributeur, clavette).
export const EXCLU = /ELBOW|\bELB\b|ELB\.|BENT TUBE|UNION|JIC|FITTING|ADAPT|HOSE|VALVE|SWIVEL|BULKHEAD|CONNECTOR|ZERK|GREASE|\bTEE\b|PLUG|NIPPLE|W\/ ?NUT|WITH NUT|CAP NUT|RECEPTACLE|BACKUP|\bKIT\b|SHACKLE|ANCHOR|CLAMP|COLLIER|CONNECTING ROD|LEAD SCREW|\bARM\b|\bKEY\b/;

/** Description en majuscules, sans la mention d'un ensemble (« PART OF THE … KIT », sans effet sur la famille). */
const net = (desc) => String(desc || '').toUpperCase().replace(/VIS-[ÀA]-VIS/g, '').trim();
/** Motif d'exclusion de la description (raccord, collier, bielle…), ou null. */
export function exclusion(desc) {
  const d = net(desc).replace(/\([^)]*(?:\bKIT\b|PART OF)[^)]*\)/g, ' ').replace(/\s[—–-]\s.*PART OF.*$/, '');
  return d.match(EXCLU)?.[0] ?? null;
}
// Goupilles du commerce ; un « PIN » nu n'en est une que suivi de ses cotes (« PIN 3/4 x 4 1/2" Lg. »).
const GOUPILLE = /HAIR ?PIN|COTTER|CUTTER PIN|SPRING PIN|ROLL PIN|DOWEL PIN|CLEVIS PIN|PIN, CLEVIS|GOUPILLE|^PIN\b[\s,-]*(?:Ø\s*)?\d/;

/** Famille de la pièce d'après sa description, sinon d'après son numéro : { f, t } ou null. */
export function famille(desc, pn) {
  const d = net(desc);
  if (exclusion(desc)) return null;
  if (/TIRE-FOND|LAG SCREW/.test(d)) return { f: 'vis', t: 'Tire-fond' };
  if (GOUPILLE.test(d)) {
    // Épingle avant fendue (« COTTERS, HAIRPIN 1 in » est une goupille épingle).
    const t = /HAIR ?PIN/.test(d) ? 'Goupille épingle' : /COTTER|CUTTER/.test(d) ? 'Goupille fendue'
      : /SPRING PIN|ROLL PIN/.test(d) ? 'Goupille élastique' : /DOWEL/.test(d) ? 'Goupille de positionnement'
        : /CLEVIS/.test(d) ? 'Axe de chape' : /GOUPILLE/.test(d) ? 'Goupille' : 'Axe';
    return { f: 'goupille', t };
  }
  // Abréviations des catalogues Sandvik : « WSHR,FLT SAE-0.250 », « WSHR,SL-0.375 », « WSHR,NL-… » ; « HHCS,0.375UNC-1.000 ».
  if (/\bWSHR\b/.test(d)) return { f: 'rondelle', t: /\bNL\b/.test(d) ? 'Rondelle de blocage' : /\bSL\b|LOCK/.test(d) ? 'Rondelle frein' : 'Rondelle plate' };
  if (/\bHHCS\b/.test(d)) return { f: 'vis', t: 'Vis à tête hexagonale' };
  if (/\bFHCS\b/.test(d)) return { f: 'vis', t: 'Vis à tête fraisée' };
  if (/\bBHCS\b/.test(d)) return { f: 'vis', t: 'Vis à tête bombée' };
  if (/WASHER|WHASHER|RONDELLE/.test(d)) return { f: 'rondelle', t: /LOCK/.test(d) ? 'Rondelle frein' : /TENSION/.test(d) ? 'Rondelle de tension' : 'Rondelle plate' };
  if (/\bNUTS?\b|[ÉE]CROU/.test(d)) return { f: 'ecrou', t: /JAM/.test(d) ? 'Contre-écrou' : /LOCK|NYL|\bLK\b|STOVER|NYLOC/.test(d) ? 'Écrou de blocage' : /FLANGE/.test(d) ? 'Écrou à embase' : 'Écrou' };
  if (/BOLT|SCREW|SHCS|COUNTERSUNK|\bVIS\b|BOULON/.test(d)) {
    const t = /SET SCREW/.test(d) ? 'Vis de pression' : /COUNTERSUNK/.test(d) ? 'Vis à tête fraisée' : /SHCS|SOCKET/.test(d) ? 'Vis à tête creuse'
      : /SQUARE HEAD/.test(d) ? 'Boulon à tête carrée' : /EYE BOLT/.test(d) ? 'Boulon à œil' : /U-BOLT/.test(d) ? 'Boulon en U'
        : /SHOULDER/.test(d) ? 'Boulon à épaulement' : /MACHINE SCREW/.test(d) ? 'Vis à métaux' : 'Boulon';
    return { f: 'vis', t };
  }
  const p = String(pn || '').toUpperCase();
  if (/^(SHCS|SHC)\d/.test(p)) return { f: 'vis', t: 'Vis à tête creuse' };
  if (/^SS\d/.test(p)) return { f: 'vis', t: 'Vis de pression' };
  if (/^(B|BS|SH|CS)\d+-\d+$/.test(p)) return { f: 'vis', t: 'Boulon' };
  if (/^(NC|NF|LN|NFC|JN)\d/.test(p)) return { f: 'ecrou', t: 'Écrou' };
  if (/^(W|LC)\d+$/.test(p)) return { f: 'rondelle', t: /^LC/.test(p) ? 'Rondelle frein' : 'Rondelle plate' };
  if (/^HP\d+$/.test(p)) return { f: 'goupille', t: 'Goupille épingle' };
  if (/^CTP-?\d/.test(p)) return { f: 'goupille', t: 'Goupille fendue' };
  return null;
}

const FR = String.raw`(\d+\s*-\s*\d+\/\d+|\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`;
/** Diamètre d'une vis à jauge n° n (po). */
const jauge = (n) => 0.06 + 0.013 * n;

/**
 * Taille lue dans la description : { d (po), l (po) | null, filet ('UNC' | 'UNF' | ''), jauge? } ou null.
 * Jauge « #12-24 X 1" » : n° 12, longueur 1 po. « 5/8-11UNC X 3/4 DIA … X 4.0 LG. » : la cote suivie de
 * DIA est un diamètre d'épaulement, la longueur est celle marquée LG. Filet métrique (« M14 ») : non précisée.
 */
export function tailleDesc(desc) {
  const s = String(desc || '').replace(/[’′]/g, "'").replace(/''/g, '"');
  // Cotes décimales des catalogues Sandvik : « HHCS,0.375UNC-1.000 » (diamètre, filet, longueur après le tiret),
  // « WSHR,FLT SAE-0.250 », « WSHR,NL-0.312(M8) » (diamètre de la rondelle, équivalent métrique entre parenthèses).
  let m = s.match(/(\d*\.\d+)\s*(UNC|UNF)\s*-\s*(\d*\.\d+)(?![\d.])/i);
  if (m && +m[1] > 0 && +m[1] <= 2) return { d: +m[1], l: +m[3] > 0 && +m[3] < 40 ? +m[3] : null, filet: m[2].toUpperCase() };
  m = s.match(/^WSHR\b.*?-\s*(\d*\.\d+)(?![\d.])/i);
  if (m && +m[1] > 0 && +m[1] <= 2) return { d: +m[1], l: null, filet: '' };
  if (/\bM\d{1,2}(?:\s*[xX×]|\b)/.test(s)) return null;
  // Longueur explicite « 4.0 LG. », « 2 1/4 LG », « 3.000 LG. ».
  const lg = s.match(new RegExp(String.raw`(?:[xX×]\s*)?${FR}\s*"?\s*(?:LG|LONG|LENGTH)\b`, 'i'));
  const lgVal = lg ? num(lg[1]) : null;
  // Jauge : « #12-24 », « #10 ».
  m = s.match(/#\s*(\d{1,2})(?:\s*-\s*(\d{2}))?\b/);
  if (m) {
    const n = +m[1];
    let l = lgVal;
    if (l == null) { const x = s.slice(m.index + m[0].length).match(new RegExp(String.raw`[xX×]\s*${FR}\s*"?`)); if (x) l = num(x[1]); }
    return { d: jauge(n), jauge: n, l: l > 0 && l < 40 ? l : null, filet: '' };
  }
  // Diamètre cherché hors de la longueur explicite (« PIN 3/4 x 4 1/2" Lg. » : 3/4).
  const sd = lg ? s.slice(0, lg.index) + ' '.repeat(lg[0].length) + s.slice(lg.index + lg[0].length) : s;
  let d = null; let filet = ''; let rest = sd;
  m = sd.match(new RegExp(String.raw`${FR}\s*"?\s*-?\s*(?:\d{1,2}\s*-?\s*)?(UNC|UNF|NC|NF)\b`, 'i'));
  if (m) {
    d = num(m[1]); filet = /F$/i.test(m[2]) ? 'UNF' : 'UNC'; rest = sd.slice(m.index + m[0].length);
  } else if ((m = sd.match(/(\d+\s+\d+\/\d+|\d+\/\d+|\b1\b)\s*"/)) || (m = sd.match(/\b(\d+\s+\d+\/\d+|\d+\/\d+)\b/))) {
    d = num(m[1]); rest = sd.slice(m.index + m[0].length);
  }
  if (d == null || !(d > 0) || d > 2) return null; // NaN (fraction douteuse) compris
  let l = null;
  if (lgVal != null) l = lgVal;
  else {
    // « X 2 3/4 » ; pas « X 3/4 DIA » (diamètre d'épaulement).
    m = rest.match(new RegExp(String.raw`[xX×]\s*${FR}(?!\s*"?\s*(?:DIA|Ø))`));
    if (m && !new RegExp(String.raw`^\s*"?\s*(?:DIA|Ø)`, 'i').test(rest.slice(m.index + m[0].length))) l = num(m[1]);
  }
  if (!(l > 0 && l < 40)) l = null;
  return { d, l, filet };
}

/** Longueur seule d'un tire-fond (« Tire-fond 6 po : … » : 6 po ; le diamètre n'est pas donné). */
function longueurSeule(desc) {
  const m = String(desc || '').match(new RegExp(String.raw`${FR}\s*(?:po|in|")(?![a-z])`, 'i'));
  const l = m ? num(m[1]) : NaN;
  return l > 0 && l < 40 ? { d: null, l, filet: '' } : null;
}

/** Taille déduite du numéro (B625-2750 → 5/8 × 2 3/4, W500 → 1/2). Les numéros Sandvik « SH00012-1.000 » ne portent
 * qu'un code de diamètre (pas une cote) : leur taille vient de la description. */
export function taillePn(pn) {
  const p = String(pn || '').toUpperCase();
  let m = p.match(/^(?:B|BS|SH|SHC|SHCS|CS|SS|CTP-?)(\d{2,4})-(\d{3,5})/);
  if (m) return { d: code(m[1]), l: +m[2] / 1000, filet: '' };
  m = p.match(/^(?:W|LC|NC|NF|LN|NFC|HP)(\d{2,4})(NC|NF)?$/);
  if (m) return { d: code(m[1]), l: null, filet: m[2] ? (m[2] === 'NF' ? 'UNF' : 'UNC') : '' };
  m = p.match(/^JN(\d)$/);
  if (m) return { d: +m[1], l: null, filet: '' };
  return null;
}

export const same = (a, b) => Math.abs(a - b) < 1 / 64 + 1e-9;
/** Libellé de la taille : « 5/8 × 2 3/4 po », « n° 12 × 1 po », « × 6 po » (longueur seule d'un tire-fond). */
export const libTaille = (t) => {
  if (!t) return '';
  if (t.jauge != null) return `n° ${t.jauge}${t.l ? ` × ${frac(t.l)} po` : ''}`;
  if (t.d == null) return t.l ? `× ${frac(t.l)} po` : '';
  return `${frac(t.d)}${t.l ? ` × ${frac(t.l)}` : ''} po`;
};
const mm = (x) => (x * 25.4).toFixed(1).replace('.', ',');
export const libMm = (t) => {
  if (!t) return '';
  if (t.d == null) return t.l ? `× ${mm(t.l)} mm` : '';
  return `${mm(t.d)}${t.l ? ` × ${mm(t.l)}` : ''} mm`;
};
const ORDRE = { vis: 0, ecrou: 1, rondelle: 2, goupille: 3 };
/** Type par défaut de chaque famille (« BOLT », « NUT » sans précision) : tout autre type est plus précis. */
const GENERIQUE = { vis: 'Boulon', ecrou: 'Écrou', rondelle: 'Rondelle plate', goupille: 'Axe' };

/** Numéro comparable d'une ligne (majuscules, sans espaces) ; '' s'il est trop court pour désigner une pièce. */
export const cleNum = (pn) => {
  const p = String(pn || '').toUpperCase().replace(/\s+/g, '');
  return p.length >= 4 && /\d/.test(p) ? p : '';
};
/** Partie « taille » de la clé de regroupement. */
const dimOf = (t) => (t ? `${t.jauge != null ? `#${t.jauge}` : t.d != null ? frac(t.d) : ''}|${t.l ? frac(t.l) : ''}|${t.filet}` : '?');
/** Deux tailles compatibles : même diamètre (ou jauge) ; longueur et filet identiques, ou absents de l'une. */
function compatibles(a, b) {
  if ((a.jauge ?? null) !== (b.jauge ?? null)) return false;
  if (a.d != null && b.d != null && !same(a.d, b.d)) return false;
  if (a.l != null && b.l != null && !same(a.l, b.l)) return false;
  return !(a.filet && b.filet && a.filet !== b.filet);
}
const fusion = (a, b) => ({ ...a, d: a.d ?? b.d, l: a.l ?? b.l, filet: a.filet || b.filet, ...(a.jauge ?? b.jauge) != null ? { jauge: a.jauge ?? b.jauge } : {} });
const libFilet = (t) => `${libTaille(t)}${t.filet ? ` ${t.filet}` : ''}`;
const ids = (ls) => [...new Set(ls.map((l) => l.asm.id))].join(', ');

/**
 * Un numéro = une pièce : les lignes d'un même numéro (sur plusieurs pages) reçoivent la même taille et le même type.
 * Tailles compatibles (« HHCS 3/8-16 », « HHCS 3/8-16 x 1 1/4 », « HHCS 3/8 - 16 UNC x 1 1/4 ») : la plus complète, et
 * le type le plus précis, avec une note qui dit d'où elle vient. Tailles contradictoires (« 7/8 - 9 UNC » sur une page,
 * « 3/4 - 10 UNC » sur une autre) : une seule ligne « tailles différentes selon les pages », chaque taille citée.
 */
function unifier(lignes) {
  const parNum = new Map();
  for (const l of lignes) {
    const k = cleNum(l.r.pn);
    if (!k) continue;
    if (!parNum.has(k)) parNum.set(k, []);
    parNum.get(k).push(l);
  }
  for (const [k, ls] of parNum) {
    if (ls.length < 2 || new Set(ls.map((l) => l.cle)).size < 2) continue;
    const familles = new Set(ls.map((l) => l.fam.f));
    const precis = [...new Set(ls.filter((l) => l.fam.t !== GENERIQUE[l.fam.f]).map((l) => l.fam.t))];
    let t = null;
    let tailleOk = true;
    for (const l of ls) {
      if (!tailleOk || !l.t) continue;
      if (!t) t = l.t;
      else if (compatibles(t, l.t)) t = fusion(t, l.t);
      else tailleOk = false;
    }
    const typeOk = familles.size === 1 && precis.length <= 1;
    if (tailleOk && typeOk) {
      const f = ls[0].fam.f;
      const fam = { f, t: precis[0] || GENERIQUE[f] };
      const cle = `${f}|${fam.t}|${dimOf(t)}`;
      const sourcesType = ls.filter((l) => l.fam.t === fam.t);
      for (const l of ls) {
        if (l.cle === cle) continue;
        const notes = [];
        // Lignes qui donnent ce que celle-ci ne dit pas (diamètre, longueur, filet).
        const apport = ls.filter((x) => x !== l && x.t && ((l.t?.d == null && x.t.d != null) || (l.t?.l == null && x.t.l != null) || (!l.t?.filet && x.t.filet)));
        if (dimOf(l.t) !== dimOf(t)) notes.push(`taille ${libFilet(t)} d’après ${ids(apport)}`);
        if (l.fam.t !== fam.t) notes.push(`type « ${fam.t} » d’après ${ids(sourcesType)}`);
        l.complete = `Même numéro ailleurs : ${notes.join(' ; ')}.`;
        l.fam = fam;
        l.t = t;
        l.cle = cle;
      }
    } else {
      // Contradiction du catalogue : une seule ligne, chaque taille avec ses assemblages.
      const tailles = new Map();
      for (const l of ls) {
        const lib = `${l.fam.t}${l.t ? ` ${libFilet(l.t)}` : ', taille non précisée'}`;
        if (!tailles.has(lib)) tailles.set(lib, []);
        tailles.get(lib).push(l);
      }
      const conflit = [...tailles.entries()].map(([lib, xs]) => `${lib} (${ids(xs)})`);
      // Pièce : le type, ou les types quand ils diffèrent aussi.
      const types = [...new Set(ls.map((l) => l.fam.t))];
      const fam = { f: ls[0].fam.f, t: types.join(' / ') };
      const quoi = tailleOk ? 'Désignations différentes' : 'Tailles différentes';
      const texte = `${quoi} selon les pages pour le numéro ${ls[0].r.pn} : ${conflit.join(' ; ')}.`;
      for (const l of ls) {
        l.conflit = conflit;
        l.ecart = l.ecart ? `${l.ecart} ${texte}` : texte;
        l.fam = fam;
        l.cle = `${fam.f}|conflit|${k}`;
      }
    }
  }
}

/** Lignes de visserie de toutes les listes d'assemblage (équipement normalisé : assemblies → parts { ref, pn, qty, desc }). */
export function visserie(eq) {
  const lignes = [];
  for (const a of eq.assemblies.values()) {
    for (const r of a.parts) {
      if (r.pseudo) continue;
      const fam = famille(r.desc, r.pn);
      if (!fam) continue;
      const td = tailleDesc(r.desc) || (fam.t === 'Tire-fond' ? longueurSeule(r.desc) : null);
      // Jauge ou filet métrique dans la description : le numéro ne dit rien de plus sûr.
      const tp = td?.jauge != null ? null : taillePn(r.pn);
      let t = td || tp;
      if (td && tp && td.d != null && td.l == null && tp.l != null && same(td.d, tp.d)) t = { ...td, l: tp.l };
      const ecart = td && tp && td.d != null && (!same(td.d, tp.d) || (td.l != null && tp.l != null && !same(td.l, tp.l)))
        ? `Le numéro ${r.pn} indique ${libTaille(tp)} ; la description, ${libTaille(td)}.` : '';
      if (t && !t.filet && tp?.filet) t = { ...t, filet: tp.filet };
      // Le filet ne distingue que les vis et les écrous.
      if (t && (fam.f === 'rondelle' || fam.f === 'goupille')) t = { ...t, filet: '' };
      const q = typeof r.qty === 'number' ? r.qty : /^\d+$/.test(String(r.qty ?? '').trim()) ? +r.qty : null;
      const dim = dimOf(t);
      lignes.push({ asm: a, r, fam, t, q, ecart, cle: `${fam.f}|${fam.t}|${dim}` });
    }
  }
  unifier(lignes);
  return lignes;
}

export const tri = (a, b) => ORDRE[a.fam.f] - ORDRE[b.fam.f] || a.fam.t.localeCompare(b.fam.t, 'fr')
  || (a.t?.d ?? 99) - (b.t?.d ?? 99) || (a.t?.l ?? 0) - (b.t?.l ?? 0);
