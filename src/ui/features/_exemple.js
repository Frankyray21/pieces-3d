// Exemple de fonction (désactivé : les fichiers dont le nom commence par « _ »
// ne sont pas chargés). Pour l'essayer : copier ce fichier sous un nom sans
// « _ » (ex. src/ui/features/exemple.js) ; il ajoute alors :
//   - un bouton « Fiche » dans la barre d'outils de la vue 3D, qui ouvre le
//     panneau latéral avec la fiche de la pièce sélectionnée ;
//   - un bouton loupe dans l'en-tête (zone de recherche) ;
//   - une carte sur la page de l'équipement (#<équipement>.apercu) ;
//   - une page plein écran à l'adresse #<équipement>.exemple.
// Ses styles iraient dans src/ui/features/exemple.css, importé ici :
// import './exemple.css';

export default {
  id: 'exemple',
  order: 900, // ordre de chargement (petit = tôt) ; sans effet sur la mise en page
  disabled: true, // second garde-fou : un module « disabled » n'est jamais initialisé

  init(ctx) {
    const { esc } = ctx;
    const { icon } = ctx.icons;

    // Fiche de la pièce sélectionnée, dans le panneau latéral.
    const fiche = () => {
      const sel = ctx.selection;
      if (!sel) return '<p>Cliquez une pièce dans la vue 3D ou dans la liste.</p>';
      const r = sel.row;
      return `<p class="mono" style="font-size:22px;margin:0">${esc(r.pn || '—')}</p>
        <p>${esc(r.desc)} · qté ${r.qty ?? '—'} · réf. ${esc(sel.ref)}</p>`;
    };
    const btn = ctx.ui.addTool({
      label: 'Fiche',
      icon: 'cle',
      title: 'Fiche de la pièce sélectionnée',
      pressed: false,
      onClick: () => ctx.ui.sidePanel.toggle({ owner: 'exemple', title: 'Fiche de la pièce', icon: 'cle', content: fiche() }),
    });
    ctx.on('sidepanel', ({ open, owner }) => { if (owner === 'exemple') btn.setAttribute('aria-pressed', String(open)); });
    ctx.on('select', () => {
      if (ctx.ui.sidePanel.owner === 'exemple') ctx.ui.sidePanel.setContent(fiche());
    });

    // Mise en évidence : à l'ouverture d'un assemblage 3D, les repères 1 et 2 en bleu-vert (2 s).
    ctx.on('assembly', ({ is3d, home }) => {
      if (!is3d || home) return;
      ctx.viewer.highlight(['1', '2']);
      setTimeout(() => ctx.viewer.clear(), 2000);
    });

    // Zone de recherche de l'en-tête.
    const loupe = document.createElement('button');
    loupe.type = 'button';
    loupe.className = 'btn';
    loupe.innerHTML = icon('recherche', { size: 16, title: 'Recherche avancée' });
    loupe.addEventListener('click', () => ctx.go('exemple'));
    ctx.ui.searchSlot.appendChild(loupe);

    // Carte de la page de l'équipement, refaite à chaque équipement chargé.
    const card = document.createElement('section');
    card.className = 'card-box';
    card.style.padding = '16px';
    ctx.ui.equipmentHome.appendChild(card);
    ctx.on('equipment', ({ equipment: eq }) => {
      card.innerHTML = `<h3 style="margin:0 0 6px">${icon('engrenage')} Exemple</h3>
        <p style="margin:0">${esc(eq.name)} : ${eq.assemblies.size} assemblages, ${ctx.systems().length} systèmes.</p>`;
    });

    // Page plein écran liée à une adresse (#<équipement>.exemple) ; Retour / Échap la ferme.
    ctx.registerRoute('exemple', () => {
      const el = document.createElement('div');
      el.innerHTML = `<p>Page de l'exemple pour ${esc(ctx.equipment.name)}.</p>
        <p><img src="${esc(ctx.pageUrl(ctx.equipment.sheetId(1)))}" alt="Première page du manuel" style="max-width:100%"></p>`;
      ctx.ui.showPage('Exemple', el, { icon: 'recherche' });
    });
  },
};
