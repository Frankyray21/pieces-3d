import { normPn } from '../data/equipment.js';

// Liste de commande : regroupe les pièces par numéro, conservée dans le
// navigateur de l'utilisateur (localStorage), exportable en texte ou CSV.

const KEY = 'pieces3d.cart.v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage indisponible : liste en mémoire */ }
}

export function createCart(onChange) {
  let items = read();
  const emit = () => { write(items); onChange(items); };
  return {
    get items() { return items; },
    count() { return items.reduce((n, i) => n + i.qty, 0); },
    keyFor(row) { return normPn(row.pn) || `${row.source.id}:${row.ref}`; },
    has(row) { return items.some((i) => i.key === this.keyFor(row)); },
    add(row, qty, equipment) {
      const key = this.keyFor(row);
      const where = `${row.source.sheet} réf. ${row.ref}`;
      const found = items.find((i) => i.key === key);
      if (found) {
        found.qty += qty;
        if (!found.where.includes(where)) found.where.push(where);
      } else {
        items.push({ key, pn: row.pn, supplier: row.supplier || '', desc: row.desc, qty, where: [where], equipment });
      }
      emit();
    },
    setQty(key, qty) {
      const it = items.find((i) => i.key === key);
      if (!it) return;
      it.qty = Math.max(1, Math.min(9999, qty | 0));
      emit();
    },
    remove(key) { items = items.filter((i) => i.key !== key); emit(); },
    clear() { items = []; emit(); },
    asText(eq) {
      const head = `Demande de pièces — ${eq.name} (n° de série ${eq.serial})`;
      const lines = items.map((i) => {
        const pn = i.pn || (i.supplier ? `${i.supplier} (fournisseur)` : 'SANS NUMÉRO');
        return `${String(i.qty).padStart(4)}  ${pn.padEnd(16)}  ${i.desc}  [${i.where.join(', ')}]`;
      });
      return [head, `Manuel : ${eq.document.title}, ${eq.document.reference}`, '', ' Qté  N° pièce          Description', ...lines].join('\n');
    },
    asCsv(eq) {
      const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
      const rows = [['Quantité', 'N° pièce', 'N° fournisseur', 'Description', 'Référence manuel', 'Équipement']];
      items.forEach((i) => rows.push([i.qty, i.pn, i.supplier, i.desc, i.where.join(' / '), `${eq.name} ${eq.serial}`]));
      return rows.map((r) => r.map(esc).join(';')).join('\n');
    },
  };
}
