// Lignes d'un tableau au clavier (liste des pièces, liste d'un sous-ensemble isolé) : une seule étape de
// tabulation pour tout le tableau (la ligne choisie, sinon la première), flèches haut et bas, Origine et Fin pour
// passer d'une ligne à l'autre, Entrée ou Espace pour l'ouvrir (comme un clic). Les boutons des lignes (groupe,
// lien vers une page) gardent leur propre place dans la tabulation.

/**
 * Prépare le corps de tableau « body » (une fois ; les lignes peuvent être refaites ensuite). sel : sélecteur des
 * lignes ; activate(tr) : ouverture d'une ligne. Retourne refresh(), à appeler après avoir refait les lignes.
 */
export function keyRows(body, sel, activate) {
  const rows = () => [...body.querySelectorAll(sel)];
  const current = (list) => list.find((r) => r.classList.contains('sel') || r.classList.contains('on')) || list[0];
  const rove = (list, cur) => list.forEach((r) => { r.tabIndex = r === cur ? 0 : -1; });
  const refresh = () => { const list = rows(); rove(list, current(list)); };
  if (!body.dataset.keyRows) {
    body.dataset.keyRows = '1';
    body.addEventListener('keydown', (e) => {
      const tr = e.target.closest?.(sel);
      if (!tr || e.target !== tr || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(tr); return; }
      const list = rows();
      const i = list.indexOf(tr);
      const j = e.key === 'ArrowDown' ? Math.min(list.length - 1, i + 1) : e.key === 'ArrowUp' ? Math.max(0, i - 1)
        : e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : -1;
      if (j < 0) return;
      e.preventDefault();
      rove(list, list[j]);
      list[j].focus();
      list[j].scrollIntoView({ block: 'nearest' });
    });
    // Ligne prise au clic ou à la tabulation : elle devient l'étape de tabulation du tableau.
    body.addEventListener('focusin', (e) => {
      const tr = e.target.closest?.(sel);
      if (tr && e.target === tr) rove(rows(), tr);
    });
  }
  refresh();
  return refresh;
}
