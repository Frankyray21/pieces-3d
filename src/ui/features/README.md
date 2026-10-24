# Fonctions de l'interface (`src/ui/features/`)

Chaque fonction de l'interface est **un fichier** `src/ui/features/<nom>.js`,
chargé automatiquement par `src/main.js` :

```js
const FEATURES = import.meta.glob(['./ui/features/*.js', '!./ui/features/_*.js'], { eager: true });
```

Aucun fichier partagé à modifier : ajouter le fichier suffit. Les fichiers dont
le nom commence par `_` (exemples, brouillons) sont ignorés ; voir
[`_exemple.js`](./_exemple.js).

## Forme d'un module

```js
import './<nom>.css'; // styles de la fonction (facultatif), importés par le module lui-même

export default {
  id: '<nom>',        // identifiant court (sert aussi de « owner » du panneau latéral)
  order: 100,         // ordre d'initialisation (petit = tôt ; défaut 100)
  disabled: false,    // true : jamais initialisé
  init(ctx) { … },    // appelé une fois, avant la première adresse ; peut être async
};
```

`init` est appelé une seule fois, après le chargement du catalogue des
équipements et **avant** le traitement de la première adresse : la fonction
s'abonne aux événements, crée ses boutons et ses emplacements, enregistre ses
adresses. Une erreur dans `init` ou dans un abonné est journalisée et n'arrête
ni les autres fonctions ni le site.

Règles du projet (CLAUDE.md) : textes et commentaires en français ; ne montrer
que ce qui figure dans le manuel de l'équipement. Les styles utilisent les
variables de `src/styles.css` et `src/ui/atelier.css` (`--surface`, `--ink`,
`--muted`, `--line`, `--accent`, `--radius`, `--sys`, `--sys-1` à `--sys-8`…),
définies pour les modes clair et sombre. Préfixer ses classes CSS par l'id de
la fonction. Rester lisible sur téléphone (marges de 16 px, pas de défilement
horizontal). Classes prêtes à l'emploi : `btn`, `btn primary`, `tbtn`, `chip`,
`card-box` (carte à coins arrondis), `mono`.

## Le contexte `ctx`

### Événements

| Signature | Rôle |
|---|---|
| `ctx.on(type, fn) → off()` | s'abonner ; retourne la fonction de désabonnement |
| `ctx.once(type, fn) → off()` | une seule fois |
| `ctx.off(type, fn)` | se désabonner |
| `ctx.emit(type, detail)` | émettre (aussi entre fonctions : préfixer le type par l'id, ex. `'favoris:change'`) |
| `ctx.bus` | `{ on, off, once, emit }` |

Événements émis par le site :

| Type | `detail` | Quand |
|---|---|---|
| `'equipment'` | `{ equipment, id }` | un autre équipement est chargé (avant l'affichage de sa vue) |
| `'assembly'` | `{ id, assembly, is3d, home, model, equipment }` | un assemblage est affiché, en 3D (`is3d`) ou avec les dessins du manuel ; `home` : page d'accueil 3D de l'équipement (outils cliquables) ; `model` : modèle 3D (`{ root, view }`) ou `null` |
| `'view'` | `{ type, id, is3d?, home?, system }` | toute vue affichée : `type` = `'assembly'`, `'document'` (schéma / liste) ou `'issues'` (contrôle des listes) ; `system` : voir `ctx.systemOf` |
| `'select'` | `{ ref, path, row, pn, path3d, objects, source }` | pièce cliquée en 3D (`source: '3d'`) ou ligne de liste / recherche (`'list'`) ; désélection : `ref`, `path`, `row` à `null`. `path` : chemin de repères depuis l'assemblage affiché (`['1', '4']` = repère 4 du sous-groupe 1) ; `path3d` : chemin résolu en 3D ; `objects` : objets Three.js sélectionnés |
| `'route'` | `{ hash, equipmentId, token, view }` | après chaque changement d'adresse traité (`token` : `'catalogue'`, id d'assemblage, de document, `'controle'`, `'apercu'` ou adresse d'une fonction) |
| `'sidepanel'` | `{ open, owner }` | panneau latéral ouvert / fermé (`owner` : propriétaire donné à `open`) |
| `'page'` | `{ open, title?, token }` | page plein écran affichée / fermée |

### Données

| Signature | Rôle |
|---|---|
| `ctx.equipment` | équipement chargé (voir ci-dessous) ou `null` |
| `ctx.index` | catalogue : `[{ id, name, manufacturer, category, thumbnail, status }]` |
| `ctx.view` | copie de la vue : `{ type: 'assembly' \| 'document' \| 'issues', id, is3d?, home? }` ou `null` |
| `ctx.assembly` | assemblage affiché (objet de `equipment.assemblies`) ou `null` |
| `ctx.document` | schéma / liste affiché ou `null` |
| `ctx.selection` | `{ ref, path, row }` de la pièce sélectionnée, ou `null` |
| `ctx.systems()` | systèmes de l'équipement : `[{ id, title, index, color, icon }]` (sous-assemblages directs de la racine) |
| `ctx.systemOf(assemblyId)` | système d'un assemblage (le sien ou celui de son ancêtre) ; `null` pour la racine et les documents. `color` vaut `'var(--sys-n)'`, `icon` un nom de `icons.js` |
| `ctx.has3d(assemblyId)` | vrai si l'assemblage a un modèle 3D |

**Équipement** (`ctx.equipment`, normalisé par `src/data/equipment.js` à partir
de `public/equipment/<id>/data.json`) :

- `id`, `name`, `manufacturer`, `category`, `serial`, `specs` et `weights`
  (`[[libellé, valeur]]`), `document` (`{ title, reference, date, sheets, kind, pagePattern }`),
  `sheetTitles` (`{ P002: 'titre' }`), `root` (id de l'assemblage racine),
  `docWord` (`'manuel'` ou `'catalogue'`), `labels`.
- `assemblies` : `Map(id → { id, title, titleFr, sheet, sheets, lists, pn, rev, note, parts, parent, children })`.
  Dans `data.json`, `assemblies[id].parts` est une liste de lignes
  `[repère, numéro, qté, description, extras]` ; normalisée, chaque ligne
  devient `{ ref, pn, qty, desc, pns, key, source, flags, usedIn, …extras }`
  (`extras` : `link` vers un sous-assemblage, `sizes`, `supplier`, `mirrorOf`,
  `group`, `see`, `pnText`, `nss`…). `note` : remarque de l'assemblage.
  `sheets` : feuilles de dessin du manuel.
- `documents` : `Map(id → { id, titleFr, sheets, parts })` (schémas, listes).
- `rows` : toutes les lignes ; `issues` : lignes à vérifier (`flags` de niveau `'error'` / `'warn'`).
- `sheetOwner` : `Map(feuille → id de l'assemblage ou du document)` ;
  `sheetId(n)` : n° de page → identifiant (`3` → `'P003'`) ;
  `pageUrl(feuille)` : adresse de l'image de la page.

### Navigation et manuel

| Signature | Rôle |
|---|---|
| `ctx.go(cible)` | `cible` : jeton de l'équipement courant (`'P042'`, `'apercu'`, `'controle'`, adresse d'une fonction) ou adresse complète (`'#du311.P032'`) |
| `ctx.hashFor(token, equipmentId?) → '#…'` | adresse d'un jeton (le premier équipement du catalogue n'a pas de préfixe) |
| `ctx.registerRoute(token, handler(ctx, info))` | adresse d'une fonction : `#<équipement>.<token>` (`token` en minuscules, `[a-z][a-z0-9_-]*`). La vue d'en dessous est ouverte d'abord ; un `showPage` appelé dans `handler` est lié à l'adresse (Retour / Échap reviennent à la vue) |
| `ctx.pageUrl(feuille) → url` | image d'une page du manuel (`'P042'`) |
| `ctx.openPage(feuille)` | ouvre la page du manuel dans la visionneuse de pages |
| `ctx.sheetTitle(feuille)` | titre de la page |
| `ctx.sheetOwner(feuille)` | id de l'assemblage ou du document de la page |

### Vue 3D (`ctx.viewer`)

Les repères sont ceux de la liste de l'assemblage affiché : `'3'`, un chemin
`'1>4'` (repère 4 du groupe 1) ou `['1', '4']`. Plages, pièces symétriques et
groupes sont résolus comme pour un clic dans la liste. Sans vue 3D (dessins
du manuel), les méthodes ne font rien et retournent 0.

| Signature | Rôle |
|---|---|
| `ctx.viewer.is3d` | vrai si la vue courante est un modèle 3D |
| `ctx.viewer.raw` | instance `Viewer` (src/viewer/Viewer.js) ou `null` |
| `ctx.viewer.scene` / `.camera` / `.model` | scène Three.js, caméra, modèle affiché (`{ root, view }`) |
| `ctx.viewer.highlight(repères, { ghost = false, frame = false }) → n` | met en évidence (bleu-vert) ; `repères` : un repère ou une liste (`['1', '2', '3>4']`) ; `ghost` : estompe les autres ; `frame` : cadre ces pièces ; retourne le nombre d'objets trouvés. Remplace la mise en évidence précédente ; effacée au changement d'assemblage |
| `ctx.viewer.isolate(repères, { frame }) → n` | = `highlight(repères, { ghost: true })` |
| `ctx.viewer.clear()` | plus rien de mis en évidence |
| `ctx.viewer.frame(repères?)` | cadre ces pièces, ou tout le modèle sans argument |
| `ctx.viewer.select(repère)` | sélectionne comme un clic dans la liste (fiche, liste, 3D) ; `null` désélectionne |
| `ctx.viewer.path3d(repère) → string[]` | chemin 3D résolu (`'1\|2\|3'` pour un ensemble) |

### Emplacements d'interface (`ctx.ui`)

| Signature | Rôle |
|---|---|
| `ctx.ui.sidePanel.open({ title, content, owner, icon })` | panneau latéral droit, posé sur la scène (plein écran de la scène sur téléphone, où l'onglet « Vue » est affiché). `content` : élément DOM ou HTML (à échapper) ; `owner` : id de la fonction |
| `ctx.ui.sidePanel.close()` / `.toggle(opts)` | replier ; `toggle` replie si le même `owner` l'occupe |
| `ctx.ui.sidePanel.setTitle(t)` / `.setContent(c)` | changer le titre, le contenu |
| `ctx.ui.sidePanel.isOpen` / `.owner` / `.body` / `.element` | état, propriétaire, élément du contenu, panneau |
| `ctx.ui.addTool(bouton \| { id, label, title, icon, pressed, onClick }) → bouton` | bouton dans la barre d'outils de la vue 3D (groupe des fonctions, après « Plein écran ») ; reçoit la classe `tbtn` ; `pressed` → `aria-pressed`. La barre n'est affichée que pour une vue 3D |
| `ctx.ui.searchSlot` | élément de l'en-tête, à droite du champ de recherche (fond sombre : boutons `btn` déjà adaptés) |
| `ctx.ui.equipmentHome` | élément affiché en bas de la page de l'équipement (`#<équipement>.apercu`), après systèmes, schémas et fiche technique ; le même élément sert pour tous les équipements : le remplir à l'événement `'equipment'` |
| `ctx.ui.showPage(titre, contenu, { icon, onClose }) → { element, close }` | page plein écran sur l'espace de travail (en-tête et onglets du téléphone restent visibles) ; Retour ou Échap la ferme |
| `ctx.ui.closePage()` | ferme la page (retour à la vue si elle est liée à une adresse) |
| `ctx.ui.setPane('rail' \| 'stage' \| 'panel')` | onglet affiché sur téléphone |

### Utilitaires

| Signature | Rôle |
|---|---|
| `ctx.icons.icon(nom, { size = 18, title, cls }) → string` | SVG en ligne (`src/ui/icons.js`) : `engrenage`, `goutte`, `eclair`, `cable`, `cle`, `recherche`, `page`, `cube`, `liste`, `alerte`, `fermer`, `droite`, `gauche`, `accueil`, `panneau`, `structure` (alias : `gear`, `drop`, `bolt`, `wrench`, `search`…) |
| `ctx.icons.iconEl(nom, opts) → SVGElement` | même icône, en élément |
| `ctx.esc(texte)` | échappe le HTML |
| `ctx.toast(message, ms?)` | message bref en bas de l'écran |
| `ctx.narrow()` | vrai sur téléphone (≤ 900 px) |

Les boutons et liens portant `data-go="<jeton>"` (navigation) ou
`data-page="<feuille>"` (page du manuel) sont gérés par le site, partout dans la page.
