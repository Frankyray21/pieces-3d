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
| `'select'` | `{ ref, path, row, pn, path3d, objects, source }` | pièce cliquée en 3D (`source: '3d'`) ou ligne de liste / recherche (`'list'`) ; désélection : `ref`, `path`, `row` à `null`. `path` : chemin de repères depuis l'assemblage affiché (`['1', '4']` = repère 4 du sous-groupe 1) ; `path3d` : chemin résolu en 3D ; `objects` : objets Three.js sélectionnés. Émis avant le cadrage de la pièce (qui tient compte du panneau ouvert par la fiche) |
| `'view-state'` | `{ explode, expanded, section }` | éclatement, groupes éclatés (clés de chemins `'1>4'`) ou coupe changés |
| `'model-update'` | `{ model, old, part, done }` | la vue d'ensemble a remplacé un sous-assemblage simplifié (`old`) par sa version détaillée (`part`) : refaire les marques posées sur le modèle (pastilles, couleurs…) ; `done` : dernier remplacement |
| `'route'` | `{ hash, equipmentId, token, view }` | après chaque changement d'adresse traité (`token` : `'catalogue'`, id d'assemblage, de document, `'controle'`, `'apercu'` ou adresse d'une fonction) |
| `'sidepanel'` | `{ open, owner, over?, base?, restored? }` | panneau latéral : couche ouverte / fermée (`owner` : propriétaire donné à `open` ; `over` : couche ouverte avec `over: true`, comme la fiche ; `base` : propriétaire recouvert par elle ; `restored` : couche recouverte revenue). Voir « Panneau latéral et modes » |
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
| `ctx.equipmentData(nom, equipmentId?)` | données complémentaires `public/equipment/<id>/<nom>.json` (`'bulles'`, `'donnees'`, `'entretien'`, `'procedures'`) de l'équipement chargé, ou `null`. Chargées une fois, avant l'événement `'equipment'`, pour un équipement dont `public/equipment/index.json` déclare les fichiers (champ `extras`, `src/data/extras.js`) : aucune requête, donc aucune erreur 404, pour un équipement qui n'en a pas ; inscrites dans la page de la publication en Artifact (`scripts/build-artifact.mjs`). Un nouveau fichier s'ajoute au champ `extras` de l'index (et au motif `EXTRAS` de `scripts/build-artifact.mjs`) |

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
| `ctx.openRow(clé)` | ouvre la ligne d'une liste (`row.key`, ex. `'P042:9'`, `row.usedIn[i].key`, `flag.refs[i].key`) : son assemblage ou son document, la ligne sélectionnée |
| `ctx.pageUrl(feuille) → url \| null` | image d'une page du manuel (`'P042'`) ; `null` si la page n'est pas publiée avec cette version du site (publication allégée en Artifact) : afficher un message plutôt qu'une image |
| `ctx.openPage(feuille)` | ouvre la page du manuel dans la visionneuse de pages |
| `ctx.sheetTitle(feuille)` | titre de la page |
| `ctx.sheetOwner(feuille)` | id de l'assemblage ou du document de la page |

### Vue 3D (`ctx.viewer`)

Les repères sont ceux de la liste de l'assemblage affiché : `'3'`, un chemin
`'1>4'` (repère 4 du groupe 1) ou `['1', '4']`. Plages, pièces symétriques et
groupes sont résolus comme pour un clic dans la liste. Sans vue 3D (dessins
du manuel), les méthodes ne font rien et retournent 0.

**Attention** : `objects`, `highlight`, `isolate` et `frame` prennent une
*liste* de repères ; un tableau seul y est lu comme une liste
(`['1', '9']` = repères 1 et 9 de l'assemblage). Un chemin seul s'écrit
`'1>9>63>5'` ou s'enveloppe : `[['1', '9', '63', '5']]`. `select`, `isGroup`,
`toggleGroup`, `canCut` et `cut` prennent un seul chemin (`'1>4'` ou `['1', '4']`).

| Signature | Rôle |
|---|---|
| `ctx.viewer.is3d` | vrai si la vue courante est un modèle 3D |
| `ctx.viewer.raw` | instance `Viewer` (src/viewer/Viewer.js) ou `null` |
| `ctx.viewer.scene` / `.camera` / `.model` | scène Three.js, caméra, modèle affiché (`{ root, view }`) |
| `ctx.viewer.canvas` | toile WebGL (clics, pointeur) |
| `ctx.viewer.objects(repères) → Object3D[]` | objets 3D des repères (plusieurs exemplaires possibles) |
| `ctx.viewer.highlight(repères, { ghost = false, frame = false }) → n` | met en évidence (bleu-vert) ; `repères` : un repère ou une liste (`['1', '2', '3>4']`) ; `ghost` : estompe les autres ; `frame` : cadre ces pièces ; retourne le nombre d'objets trouvés. Remplace la mise en évidence précédente ; effacée au changement d'assemblage |
| `ctx.viewer.isolate(repères, { frame }) → n` | = `highlight(repères, { ghost: true })` |
| `ctx.viewer.markObjects(objets, { ghost, frame }) → n` | comme `highlight`, pour des objets 3D quelconques du modèle (graisseurs, boyaux…) ; `ghost` estompe tout le reste, même avec une liste vide |
| `ctx.viewer.clear()` | plus rien de mis en évidence |
| `ctx.viewer.frame(cible?)` | cadre tout le modèle (sans argument), des repères, des objets 3D ou une boîte `THREE.Box3`, dans la partie de la scène laissée libre (voir `ctx.ui.setInsets`) |
| `ctx.viewer.lookAt([x, y, z], [x, y, z])` | caméra à une position, vers une cible |
| `ctx.viewer.select(repère)` | sélectionne comme un clic dans la liste (fiche, liste, 3D) ; `null` désélectionne |
| `ctx.viewer.path3d(repère) → string[]` | chemin 3D résolu (`'1\|2\|3'` pour un ensemble) |
| `ctx.viewer.dimMaterial(matériau, opacité = 0.13)` | variante estompée (transparente) d'un matériau, pour `setBaseMaterials` : contrairement au fantôme de `ghost`, la pièce reste cliquable (modes Circuits et Entretien) |
| `ctx.viewer.setBaseMaterials(entrées)` / `.restoreBaseMaterials()` | recolore des maillages : `Map` ou liste de `[maillage, matériau]`, qui remplace le jeu précédent (les autres maillages retrouvent leur matériau) ; survol, sélection, estompage et coupe s'appliquent par-dessus ; oublié au changement de modèle. `ctx.viewer.originalMaterial(maillage)` : matériau d'origine |
| `ctx.viewer.showParts(cible, visible) → Object3D[]` / `.restoreParts()` | montre ou masque des pièces (repères ou objets) avec leurs bulles de repère ; `restoreParts` rend les visibilités d'origine |
| `ctx.viewer.arriveParts(cible, { far, duration, gap }) → ms` / `.settleParts()` | montage pas à pas : chaque pièce apparaît à son tour depuis sa position éclatée × `far` et glisse à sa place ; `settleParts` arrête et pose tout |
| `ctx.viewer.assemble({ animate })` | tout rassembler (comme « Assembler » : curseur, groupes éclatés et liste suivent) |
| `ctx.viewer.isGroup(r)` / `.isGroupOpen(r)` / `.toggleGroup(r, force?)` | groupe éclatable sur place (double-clic) : état, bascule |
| `ctx.viewer.canCut(r)` / `.isCut()` / `.cut(r \| null)` | vue en coupe de la pièce (sélectionnée au besoin), ou fin de la coupe |
| `ctx.viewer.invalidate()` | demande une image (après un changement fait directement sur la scène) |

Les modules n'utilisent que cette API (pas les membres internes de `Viewer`
préfixés par `_`, ni `markObjs`, `insets`, `step` ou `userData.baseMaterial`).

### Emplacements d'interface (`ctx.ui`)

| Signature | Rôle |
|---|---|
| `ctx.ui.sidePanel.open({ title, content, owner, icon, className, over, reveal })` | panneau latéral droit, posé sur la scène (volet bas sur téléphone, où l'onglet « Vue » est affiché si `reveal`, par défaut). `content` : élément DOM ou HTML (à échapper) ; `owner` : id de la fonction ; `className` : classe du panneau (mise en page propre, gardée d'une ouverture à l'autre) ; `over` : se pose par-dessus le panneau d'un mode (voir ci-dessous) |
| `ctx.ui.sidePanel.close()` / `.closeAll()` / `.toggle(opts)` | replie la couche affichée (une couche recouverte revient) / tout ; `toggle` replie si le même `owner` l'occupe |
| `ctx.ui.sidePanel.release(owner)` | rend le panneau si `owner` l'occupe, affiché ou recouvert (à l'arrêt d'un mode) |
| `ctx.ui.sidePanel.setTitle(t, owner?)` / `.setContent(c, owner?)` | changer le titre, le contenu ; avec `owner` d'une couche recouverte, son contenu est remplacé sous la couche du dessus |
| `ctx.ui.sidePanel.isOpen` / `.owner` / `.base` / `.has(owner)` / `.body` / `.element` | état, propriétaire affiché, propriétaire recouvert, `owner` présent (affiché ou recouvert), élément du contenu, panneau |
| `ctx.ui.setInsets(id, marges \| fonction \| élément \| null)` | parties de la scène couvertes par l'interface d'une fonction (`{ top, right, bottom, left }` en px, fonction qui les retourne, ou élément posé sur la scène, dégagé par son côté le plus économique) : le cadrage (`frame`, sélection, « Recadrer ») place le modèle dans le reste. Le panneau latéral est pris en compte d'office ; `null` retire les marges |
| `ctx.ui.onEscape(fn, ordre) → off()` | couche fermée par Échap : `fn()` retourne vrai si elle a fermé quelque chose (voir « Touche Échap ») |
| `ctx.ui.stage` | la scène (`#stage`) : élément où poser barres et calques |
| `ctx.ui.addTool(bouton \| { id, label, title, icon, pressed, onClick }) → bouton` | bouton dans la barre d'outils de la vue 3D (groupe principal, après « Plein écran » et un séparateur) ; reçoit les classes `tbtn ftool` ; `pressed` → `aria-pressed`. La barre n'est affichée que pour une vue 3D ; sur téléphone ou dans une scène de moins de 600 px, le groupe d'outils tient sur une rangée qui défile (glisser, molette, boutons ‹ ›), les outils des fonctions en tête |
| `ctx.ui.searchSlot` | élément de l'en-tête, à droite du champ de recherche (fond sombre : boutons `btn` déjà adaptés) |
| `ctx.ui.equipmentHome` | élément affiché en bas de la page de l'équipement (`#<équipement>.apercu`), après systèmes, schémas et fiche technique ; le même élément sert pour tous les équipements : le remplir à l'événement `'equipment'` |
| `ctx.ui.showPage(titre, contenu, { icon, onClose }) → { element, close }` | page plein écran sur l'espace de travail (en-tête et onglets du téléphone restent visibles) ; Retour ou Échap la ferme. Le contenu recouvert (rail, scène, liste) sort de la tabulation (`inert`), le focus passe au titre. Une page sans adresse propre ajoute une entrée d'historique : le bouton Retour du navigateur la ferme. La scène en plein écran le quitte |
| `ctx.ui.closePage()` | ferme la page ; liée à une adresse, elle revient à l'entrée d'historique précédente (lien direct : la vue d'en dessous remplace l'adresse), sans empiler d'entrée |
| `ctx.ui.historyLayer(surRetour) → release()` | couche plein écran sans adresse (recherche du téléphone…) : une entrée d'historique est ajoutée (après la fin d'un retour en cours, quand une autre couche vient de se fermer : « Sur le dessin » → visionneuse), `surRetour()` est appelé si le bouton Retour du navigateur la ferme ; `release()` à la fermeture par l'interface consomme l'entrée |
| `ctx.ui.exitFullscreen()` | quitte le plein écran de la scène (avant d'afficher une couche hors de la scène) |
| `ctx.ui.setPane('rail' \| 'stage' \| 'panel')` | onglet affiché sur téléphone |

### Utilitaires

| Signature | Rôle |
|---|---|
| `ctx.icons.icon(nom, { size = 18, title, cls }) → string` | SVG en ligne (`src/ui/icons.js`) : `engrenage`, `goutte`, `eclair`, `cable`, `cle`, `recherche`, `page`, `cube`, `liste`, `alerte`, `fermer`, `droite`, `gauche`, `accueil`, `panneau`, `structure` (alias : `gear`, `drop`, `bolt`, `wrench`, `search`…) |
| `ctx.icons.iconEl(nom, opts) → SVGElement` | même icône, en élément |
| `ctx.esc(texte)` | échappe le HTML |
| `ctx.toast(message, ms?)` | message bref en bas de l'écran |
| `ctx.narrow()` | vrai sur téléphone (≤ 900 px) |
| `ctx.compact()` | vrai sur téléphone ou quand la scène fait moins de 720 px de large (tablette, petit portable) : le panneau latéral y est un volet bas (requête de conteneur `@container stage (max-width: 719px)`), à ne pas ouvrir d'office |

Les boutons et liens portant `data-go="<jeton>"` (navigation) ou
`data-page="<feuille>"` (page du manuel) sont gérés par le site, partout dans la page.
Avec `data-go="donnees"`, `data-dn-section="<id de groupe>"` ouvre la page des données
techniques sur cette section (mise en évidence un instant).

## Panneau latéral et modes

Le panneau latéral a **un propriétaire à la fois** (`owner`) ; c'est aussi
l'arbitrage des **modes**, exclusifs : circuits (`'circuits'`), entretien
(`'entretien'`), procédure (`'procedures'`, `'procedures-list'`),
sous-ensemble isolé (`'systemes'`).

- Un mode qui ouvre le panneau le prend : l'ancien propriétaire reçoit
  `'sidepanel' { open: false, owner }` et se désactive proprement (couleurs,
  marques, pastilles, visibilités rétablies). Une procédure en cours s'arrête
  aussi quand un autre mode prend le panneau (sa barre n'en dépend pas).
- Un mode qui démarre (circuits, entretien, procédure, liste des procédures)
  relâche d'abord la pièce sélectionnée (`ctx.viewer.select(null)`) : sa
  fiche se ferme avec elle, et le panneau du mode s'affiche (pas de pièce
  restée orange sans fiche). Le sous-ensemble isolé (`'systemes'`), lui,
  sélectionne son sous-ensemble (fil d'Ariane) et le relâche à sa sortie, où
  la vue de l'ensemble est recadrée.
- La **fiche de la pièce** (`'fiche'`) se ferme quand une autre vue
  s'affiche sans pièce sélectionnée (schéma, contrôle des listes, autre
  assemblage) ; le même assemblage réaffiché (retour d'une page plein écran)
  la garde.
- La **fiche de la pièce** (`'fiche'`) s'ouvre avec `over: true` : elle se
  pose par-dessus le panneau d'un mode, qui **reste actif** ; l'en-tête montre
  « ‹ <titre du mode> » ; la fiche fermée (×, « ‹ », Échap, désélection), le
  panneau du mode revient. Un clic sur une pièce pendant un mode la sélectionne
  donc (fiche par-dessus) sans arrêter le mode ; un clic sur un boyau
  (circuits) ou une pastille (entretien) ferme la fiche et ramène le mode.
- Replier le panneau d'un mode arrête le mode. Un mode qui s'arrête appelle
  `sidePanel.release(owner)` (son panneau peut être recouvert par la fiche).
- Un mode recouvert qui rouvre son panneau (`open` avec son `owner`) passe
  devant : la couche du dessus se ferme.

Sur téléphone, le panneau est un volet bas (la vue reste visible au-dessus,
la pièce y est cadrée) ; ouvert depuis l'onglet « Pièces » ou « Assemblages »,
il bascule sur « Vue » et son en-tête offre « ‹ Liste des pièces » (ou
« ‹ Assemblages ») pour y revenir. Volet bas ouvert (téléphone, scène étroite),
une entrée d'historique est ajoutée : le bouton Retour du navigateur ferme la
couche du dessus (la fiche, puis le mode) et revient à l'onglet quitté, sans
quitter l'assemblage ; fermé par ×, Échap ou caché par un autre onglet, le
volet consomme son entrée.

## Touche Échap

Une seule couche est fermée par appui, de la plus haute à la plus basse :
fenêtres surgissantes des fonctions (recherche 120, liste des points d'une
pastille groupée de l'entretien 115, menu du fil d'Ariane 110),
visionneuse des pages (100), page plein écran (80), panneau latéral (60 : la
couche du dessus, la fiche avant le mode recouvert), sélection (40),
procédure en cours (30), scène en plein écran (20). Une fonction ajoute sa couche avec `ctx.ui.onEscape(fn,
ordre)`.

## Publication allégée (Artifact)

`npm run build:artifact` publie certaines pages du manuel sans leur image (au
plus 511 fichiers). La liste est inscrite dans la page (`#publication`) :
`ctx.pageUrl` retourne `null` pour ces pages, aucune requête n'est faite, et la
visionneuse affiche un message avec un lien vers la version complète du site.
