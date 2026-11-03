---
name: video-plancher
description: Produire ou modifier vite la vidéo de formation du plancher PRO-DD-ST-003 (3D Three.js, rendu Blender sur le PC, voix ElevenLabs, montage ffmpeg) sans tout refaire. À utiliser pour une nouvelle version de la vidéo, un encart ajouté, une voix refaite, un scintillement à corriger ou une version compressée.
---

# Vidéo du plancher : production rapide

Règle d'or : ne refaire que ce qui change. Une nouvelle version réutilise les images 3D,
la voix et les annotations de la version d'avant ; seules les parties nouvelles sont
calculées, puis le montage refait le MP4 en une seule passe.

## D'où vient le gain de temps

| Étape | Avant | Maintenant |
|---|---|---|
| Montage (calques, voix, encodage) | HyperFrames, 3 encodages, 35 à 40 min | `video-plancher-montage.mjs`, une passe ffmpeg, 40 s de calques + 8 à 11 min d'encodage |
| Calques (bandeau, cartons, « Pourquoi ») | une capture par image | une capture par état distinct (595 captures pour 12 090 images) |
| Annotations | avec le rendu 3D | calculées avec la caméra seule, environ 2 min pour toute la vidéo |
| Rendu photoréaliste | Three.js dans le navigateur, moins réaliste | Blender Cycles sur la carte graphique du PC (RTX 5070 Ti, OptiX), 64 échantillons, environ 1,9 s par image |
| Images fixes | rendues | sautées, reprises de l'image d'avant (`scripts/blender-images.py`) : 66 % de l'encart 8 pi sans rendu |
| Ajout d'un encart | tout refaire | silence ajouté dans la ligne de temps, images d'avant décalées d'un nombre entier d'images : 361 images rendues sur 12 090 (12 min) |
| Voix | toute la voix régénérée | seulement les nouvelles répliques, dans un fichier à part placé par le montage |
| Image qui clignote | nouveau rendu (5 à 9 h) | interpolation de ses voisines (`scripts/video-interpoler.py`, 2 min) |

## Chaîne de production

0. **Serveur de capture**, sans rechargement à chaud (à relancer après chaque modification
   du code, sinon l'export prend l'ancienne version) :
   `npx vite --config vite.capture.config.js --port 5174 --strictPort`
1. **Scénario** : `src/video/plancher-script.js` (SEGMENTS, GAPS, CUTS, VOICE_FILE,
   `timeline()`, `vt(seg, v)` : instant v de l'enregistrement → instant dans la vidéo).
   Texte pour ElevenLabs : `node scripts/video-plancher-script.mjs`.
2. **Export pour Blender** (scène + animation image par image) :
   `PW=$(npm root -g)/playwright node scripts/blender-export.mjs --out scratch/blenderNN --url http://localhost:5174`
   → `scene.glb` (objets nommés `n<rang>`) et `anim.json` (changements de visibilité et de
   position par image, caméra, transparence de la cage).
3. **Images à rendre** : `python3 scripts/blender-images.py scratch/blenderNN/anim.json --out scratch/blenderNN [--range a:b]`
   → `images.json` (liste à rendre) et `dup.json` (image → image rendue).
4. **Rendu Blender** (persistance désactivée, dernier argument `0`) :
   `blender --background --factory-startup --python scripts/blender-plancher.py -- scene.glb anim.json @images.json sortie/ 64 gpu 100 0`
   Images déjà présentes sautées (le rendu peut reprendre) ; `lot_NNN.zip` toutes les
   400 images ; `FINI` dans `sortie/rendu.log` à la fin.
5. **Dossier 3d/** de la version : `f_00000.jpg` … une image par image de la vidéo, en
   liens durs vers les images rendues (`dup.json`) et vers la version d'avant.
6. **Annotations** : `PW=… node scripts/video-plancher-annot.mjs --out scratch/vNN --fps 24 --url http://localhost:5174`
7. **Montage** : `PW=… node scripts/video-plancher-montage.mjs --frames scratch/vNN --render plancher.mp4`
   Essai rapide sans voix : `--range a:b`. Pour un aperçu, toujours un dossier neuf.
8. **Vérifications** (plus bas), puis livraison.

## Réglages à ne pas changer

- **Encodage** : libx264, `crf 21`, `preset slow`, `tune film`,
  `-x264-params bframes=0:aq-mode=3:ipratio=1.0` (défauts du script de montage). Avec les
  images B, la veine du bois scintillait 4 fois par seconde.
- **Rendu** : données persistantes désactivées. Avec la persistance, le GPU finit par
  rendre des surfaces en noir (parois, affiches) sur une longue suite d'images.
- **Ne jamais mélanger dans une vidéo des images rendues avec des réglages différents**
  (persistance oui ou non, autre version de `blender-plancher.py`) : la veine du bois
  change et l'image « saute ». C'était le clignement aux 1,5 à 3 s de la v17 : 183 images
  témoins refaites autrement que leurs voisines.
- **Durées des ajouts** en multiples de 1/24 s (`r24`), pour que les images d'après se
  décalent d'un nombre entier d'images.

## Ajouter un encart sans tout refaire

Modèle : l'encart « Variante : 6 × 6 de 8 pi » (`src/video/plancher-v8.js`, étape 11).

- Définir l'encart : instant `v` dans la voix principale, fichier de voix à part, répliques
  `[début, fin]`, cadrages (`V8_CAM`, `V8_KEYS`), phases des pièces, notes, bandeau.
- Ajouter `[v, durée]` aux GAPS du segment : `timeline()` calcule `seg.insert`, le montage
  place la voix de l'encart, les calques ajoutent le bandeau « Variante ».
- Annotations : couper celles qui chevauchent le début de l'encart, noir pendant l'encart
  (`annot.blackout`) sauf les notes de l'encart.
- Pièces retirées pendant l'encart : retirer aussi leurs vis et tire-fonds, sinon ils
  restent debout dans le vide.
- Vérifier la reprise des images : exporter la nouvelle animation et la comparer à
  l'ancienne image par image hors de l'encart (caméra, états, visibilité effective par la
  hiérarchie). Les nouveaux objets décalent les noms `n<rang>` situés après eux. Zéro
  différence : les images de la version d'avant servent telles quelles (avant l'encart :
  même numéro ; après : numéro + durée × 24).

## Voix ElevenLabs

- Mode dialogue : orateur 1 = Formateur, orateur 2 = Travailleuse. Prompt à jour : v23.
- Un nouvel enregistrement peut contenir des passages en double (plusieurs prises) :
  transcrire (Whisper) et vérifier qui parle avant de couper.
- Couper avec ffmpeg (`atrim`, fondu de 10 ms aux bouts, 0,35 s de silence entre les
  morceaux), mesurer les instants réels dans le fichier monté, les mettre dans `LINES`.
- Les voix sont mono à la source ; le montage normalise à −16 LUFS.

## Vérifications avant de livrer

- `ffprobe` : nombre d'images = durée × 24 ; durée de l'audio ≈ celle de la vidéo.
  `ebur128` : −16 LUFS.
- Planche de contrôle des passages modifiés (images clés, annotations superposées) et des
  raccords avant et après un encart.
- Clignements : `python3 scripts/video-clignements.py scratch/vNN/3d/f_%05d.jpg <n> --out iso.json`
  (ou sur le MP4). Correctif : `python3 scripts/video-interpoler.py scratch/vNN/3d iso.json --anim anim.json`,
  puis refaire le montage.
- Écouter les nouvelles répliques : la transcription automatique se trompe parfois
  (« seize par seize » pour « six par six »).

## Versions compressées

- Environ 45 Mo, sans perte visible : montage avec `--crf 26 --abr 128k --ac 2`.
- Moins de 30 Mo : deux passes à partir de la version maîtresse, `-b:v 335k`, AAC 128k
  stéréo, mêmes paramètres x264. À 25 Mo, le bois devient flou en mouvement (trop compressé).

## Pièges rencontrés

- Les dossiers d'images partagent des fichiers par liens durs : ne jamais écrire dans un
  fichier existant ; le supprimer, puis écrire le nouveau.
- `pkill -f motif` tue aussi le shell dont la commande contient le motif : arrêter un
  processus par son numéro.
- Le serveur Vite ne voit pas toujours les modifications : le relancer avant un export.

## Sur le PC de François (Claude Code local)

- Blender 5.2 : `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` ; dossier de
  rendu : `C:\Users\Frank\Claude code\plancher-blender` (`vNN\scene.glb`, `vNN\anim.json`,
  `vNN\rendu\`).
- En local, plus de transfert de fichiers : export, rendu, montage et encodage sur la même
  machine. Outils : Node et Playwright (Chromium), ffmpeg (celui de Shutter Encoder ou une
  installation à part), Python avec `numpy`, `scipy` et `opencv-python`.
- Lancer le rendu en arrière-plan (fichier `.cmd`) et suivre `rendu.log`.
