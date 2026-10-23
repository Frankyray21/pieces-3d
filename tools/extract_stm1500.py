#!/usr/bin/env python3
"""
Données du STM-1500 (Usinage Marcotte, s/n STM-1500-128) : public/equipment/stm-1500/data.json
et src/models/stm-1500/refs.js (n° de pièce → repère, par assemblage).

Usage :
    python3 -I tools/extract_stm1500_lists.py manuel.pdf "10,11,…" listes.json > listes.txt
    python3 -I tools/extract_stm1500.py listes.json

Les listes viennent du brouillon (positions des mots) puis sont nettoyées :
suites de description, lignes de cartouche, colonnes d'un tableau voisin. Les
pages sans couche texte (moteur et pompes P069, raccords de la tête P049,
composants de la console P079, refroidisseur P074, accumulateur P083) et la
liste de débit du support d'avance (P012) sont transcrites ici à la main.
Le manuel désigne les pièces par leur numéro (bulles des dessins) : le
repère d'une ligne est son rang dans la liste.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = json.load(open(sys.argv[1]))

# ------------------------------------------------------------------ pages

SHEETS = {
    'P001': 'Couverture (photo STM-1500)', 'P002': 'Fiche de la machine', 'P003': 'Section foreuse',
    'P004': 'Index de la foreuse', 'P005': 'Dimensions hors-tout (1.01)', 'P006': 'Dimensions avec roues et timon (1.02)',
    'P007': 'Dimensions avec plateforme rotative (1.03)', 'P008': 'Points de graissage (1.04)', 'P009': 'Numéros de série (1.05)',
    'P010': 'Pièces de la foreuse (1.0)', 'P011': 'Traîneau (1.1)', 'P012': 'Support d\'avance — débit (1.2)',
    'P013': 'Avance et pied (1.3)', 'P014': 'Base du serre-tiges de pied (1.4)', 'P015': 'Pivot de poulie (1.5)',
    'P016': 'Guide de tiges (1.6)', 'P017': 'Poulie pivotante (1.7)', 'P018': 'Table de la tête (1.8)',
    'P019': 'Vérins de bascule et de relevage (1.9)', 'P020': 'Jambes et attelage (1.10)', 'P021': 'Vérin d\'avance (1.11)',
    'P022': 'Vérin d\'avance supérieur « bazooka » (1.12)', 'P023': 'Garde-corps (1.13)', 'P024': 'Boîte de commande de l\'interrupteur (1.13.1)',
    'P025': 'Interrupteur de sécurité et câble (1.13.2)', 'P026': 'Supports de l\'arrêt d\'urgence (1.13.3)',
    'P027': 'Plateforme rotative (1.14)', 'P028': 'Réglage de l\'œil du vérin supérieur (1.15)', 'P029': 'Émerillon d\'eau (1.16)',
    'P030': 'Roue et moyeu', 'P031': 'Serre-tiges Boyles 12HH — éclaté', 'P032': 'Serre-tiges Boyles 12HH — liste',
    'P033': 'Malaxeur à boue — dimensions', 'P034': 'Malaxeur à boue — liste', 'P035': 'Malaxeur à boue — hélices',
    'P036': 'Pompe à eau FMC 435', 'P037': 'Treuil de câble 10 000 pi — couverture', 'P038': 'Treuil — dimensions (8.0)',
    'P039': 'Treuil — étape 1 (8.1)', 'P040': 'Treuil — étape 2 (8.2)', 'P041': 'Treuil — étape 3 (8.3)', 'P042': 'Treuil — étape 4 (8.4)',
    'P043': 'Treuil — réglage des bras (10° à 40°)', 'P044': 'Treuil — réglage des bras (50° à 70°)',
    'P045': 'Tête de forage — couverture', 'P046': 'Index de la tête', 'P047': 'Tête — dimensions (2.1)', 'P048': 'Tête — éclaté (2.2)',
    'P049': 'Tête — raccords et boyaux (2.3)', 'P050': 'Tête — spécifications (2.4)', 'P051': 'Mandrin Boyles H — éclaté',
    'P052': 'Mandrin Boyles H — liste', 'P053': 'Transmission Funk HMD-2355 — couverture', 'P054': 'Transmission Funk — liste (1)',
    'P055': 'Transmission Funk — liste (2)', 'P056': 'Transmission Funk — liste (3)', 'P057': 'Transmission Funk — groupe 1',
    'P058': 'Transmission Funk — groupe 2', 'P059': 'Transmission Funk — groupe 3', 'P060': 'Transmission Funk — groupe 4',
    'P061': 'Transmission Funk — coupe', 'P062': 'Transmission Funk — cotes', 'P063': 'Section groupe hydraulique',
    'P064': 'Index du groupe hydraulique', 'P065': 'Groupe — dimensions avec roues (3.01)', 'P066': 'Groupe avec console verrouillée (3.0)',
    'P067': 'Groupe — dimensions (3.1)', 'P068': 'Groupe hydraulique 125 HP (3.2)', 'P069': 'Moteur et pompes (3.3)',
    'P070': 'Groupe moteur-pompes — description (3.4)', 'P071': 'Support de pompe et collecteur (3.5)', 'P072': 'Réservoir hydraulique (3.6)',
    'P073': 'Filtre de retour (3.7)', 'P074': 'Refroidisseur AOCHM-30 (option)', 'P075': 'Section console',
    'P076': 'Index de la console', 'P077': 'Console — dimensions (4.1)', 'P078': 'Console — panneaux (4.2)',
    'P079': 'Console — composants hydrauliques (4.3)', 'P080': 'Console — détails des composants (4.4)',
    'P081': 'Console — blocs pompe à eau et avance (4.4.1)', 'P082': 'Console — plaques d\'identification', 'P083': 'Accumulateur AM-45-250 (4.4.2)',
    'P084': 'Contrôleur de sécurité (4.6)', 'P085': 'Boîte de sécurité', 'P086': 'Contrôleur SECFOR CAT3 (1)',
    'P087': 'Contrôleur SECFOR CAT3 (2)', 'P088': 'Contrôleur SECFOR CAT3 (3)', 'P089': 'Contrôleur SECFOR CAT3 (4)',
    'P090': 'Contrôleur SECFOR CAT3 (5)', 'P091': 'Contrôleur SECFOR CAT3 (6)', 'P092': 'Contrôleur SECFOR CAT3 (7)',
    'P093': 'Contrôleur SECFOR CAT3 (8)', 'P094': 'Contrôleur SECFOR CAT3 (9)', 'P095': 'Schéma du panneau 600 V 125 HP',
    'P096': 'Contrôleur SECFOR CAT3 — couverture',
}

# ------------------------------------------------------------------ assemblages
# id : (titre anglais du manuel, titre français, n° d'assemblage, pages de dessin)
ASM = {
    'P002': ('STM-1500 drill rig', 'STM-1500 : foreuse, groupe hydraulique et console', 'STM-1500-128', ['P002', 'P001']),
    'P010': ('Drill parts', 'Foreuse complète', 'FBRA-002-100AS', ['P010', 'P005', 'P006', 'P007', 'P008', 'P009']),
    'P011': ('Frame', 'Traîneau', 'FBRA-002-150BM', ['P011']),
    'P012': ('Feed frame support — parts list', 'Support d\'avance', 'FBRA-002-600BB', ['P012']),
    'P013': ('Feed frame assembly', 'Avance (poutre, pied, poulies)', 'FBRA-002-300BB', ['P013']),
    'P014': ('Foot clamp base', 'Base du serre-tiges de pied', 'UM-064-800B', ['P014']),
    'P015': ('Pulley pivot', 'Pivot de poulie', 'UM-064-1000DD', ['P015']),
    'P016': ('Rod guide', 'Guide de tiges', 'UM-064-155C', ['P016']),
    'P017': ('Swivel pulley', 'Poulie pivotante', 'UM-064-180C', ['P017']),
    'P018': ('Head table', 'Table de la tête', 'UM-064-200DS', ['P018']),
    'P019': ('Feed frame and tilt cylinders', 'Vérins de bascule et de relevage', 'FBRA-002-515ZZ', ['P019']),
    'P020': ('Legs & removable hitch', 'Jambes et attelage amovible', 'UM-064-400D', ['P020']),
    'P021': ('Feed cylinder', 'Vérin d\'avance', 'UM-064-100Z', ['P021']),
    'P022': ('Top feed cylinder (bazooka)', 'Vérin d\'avance supérieur', 'FTD-030-100ZZ', ['P022']),
    'P023': ('Drill guards', 'Garde-corps', 'UM-064-1200GG', ['P023', 'P026']),
    'P024': ('Control box for safety switch', 'Boîte de commande de l\'interrupteur', 'UM-064-1310S', ['P024']),
    'P025': ('Safety switch and Telemecanique', 'Interrupteur de sécurité et câble', 'UM-064-1300SS', ['P025']),
    'P027': ('Drill rotative platform', 'Plateforme rotative (option)', 'UM-064-800AA', ['P027']),
    'P028': ('Top feed cylinder rod end adjustment', 'Réglage de l\'œil du vérin supérieur', 'FTD-148-800K', ['P028']),
    'P029': ('Water swivel assembly', 'Émerillon d\'eau', 'UM-106-100AA', ['P029']),
    'P030': ('Wheel & hub', 'Roue et moyeu (option)', 'UM-064-1601RM', ['P030']),
    'P032': ('Rod clamp 12 HH', 'Serre-tiges de pied Boyles 12HH', 'UM-079-100AA', ['P032', 'P031']),
    'P034': ('Mud mixer', 'Malaxeur à boue', 'UM-024-100A', ['P034', 'P033', 'P035']),
    'P036': ('Water pump FMC 435', 'Pompe à eau FMC 435', 'UM-058-800PP', ['P036']),
    'P042': ('Hoist wire line 10 000\' — step 4', 'Treuil de câble 10 000 pi', 'UM-032-100A', ['P042', 'P037', 'P038']),
    'P039': ('Hoist — step 1', 'Treuil — volants et carters', 'UM-032-100A', ['P039']),
    'P040': ('Hoist — step 2', 'Treuil — pignons et chaîne 35', 'UM-032-100A', ['P040']),
    'P041': ('Hoist — step 3', 'Treuil — bras et guide-câble', 'UM-032-100A', ['P041']),
    'P048': ('Underground drill head Boyles assembly', 'Tête de forage Boyles', 'UM-012-100UG', ['P048', 'P045', 'P047', 'P050']),
    'P049': ('Drilling head fitting details', 'Tête — raccords et boyaux', 'UM-012-100UG-HC-04', ['P049']),
    'P052': ('Chuck Boyle H', 'Mandrin Boyles H', 'UM-070-142AA', ['P052', 'P051']),
    'P068': ('Power pack for 125HP-600V-60H', 'Groupe hydraulique 125 HP', 'UM-064-FMX-005-100PPP', ['P068', 'P065', 'P066', 'P067']),
    'P069': ('Power pack 125HP-600V-60HZ', 'Moteur et pompes', 'UM-064-STM-1500-600V', ['P069', 'P070']),
    'P071': ('Pump support & manifold', 'Support de pompe et collecteur', 'UM-064-102P-N', ['P071']),
    'P072': ('Hydraulic tank', 'Réservoir hydraulique 110 gal', 'UM-064-300TD', ['P072']),
    'P073': ('Filter unit', 'Filtre de retour RTF-47', 'RTF-47', ['P073']),
    'P078': ('Control panels', 'Console de commande', 'UM-051-300P-FMC-036', ['P078', 'P077']),
    'P079': ('Console hydraulic components', 'Console — composants hydrauliques', 'UM-051-FMC-036-5', ['P079']),
    'P080': ('Hydraulic components details', 'Console — blocs et distributeurs', 'UM-051-300P-001-3', ['P080']),
    'P081': ('Hydraulic components details', 'Console — blocs pompe à eau et avance', 'UM-051-FMC-036-7', ['P081']),
    'P084': ('Safety controller details', 'Contrôleur de sécurité', 'UM-CIT-SC-UG', ['P084']),
    'P085': ('Security box assembly', 'Boîte de sécurité', 'UM-CIT-SC-UG', ['P085']),
}

# Liens n° de pièce → assemblage (sous-ensembles), par liste.
LINKS = {
    'P010': {'UM-064-200C': 'P013', 'UM-064-400D': 'P020', 'FBRA-002-150BM': 'P011', 'FBRA-002-300BB': 'P013', 'FBRA-002-400HH': 'P042', 'FBRA-002-600BB': 'P012',
             'FTD-030-100ZZ': 'P022', 'FTD-148-800K': 'P028', 'UM-012-100UG': 'P048', 'UM-064-200DS': 'P018',
             'UM-064-300Z': 'P019', 'UM-064-351D': 'P020', 'UM-064-800B': 'P014', 'UM-079-100A-12': 'P032',
             'UM-064-100Z': 'P021'},
    'P013': {'UM-064-1000DD': 'P015', 'UM-064-180C_R1': 'P017', 'UM-064-200C': 'P016'},
    'P042': {},
    'P048': {'UM-012-142': 'P052'},
    'P068': {'FMX-005-300TD': 'P072', 'UM-064-STM-1500-600V': 'P069', 'UM-064-102P-N': 'P071', 'UM-064-1601RM': 'P030'},
    'P072': {'RTF47': 'P073'},
    'P078': {'UM-CIT-SC-UG': 'P084'},
    'P084': {'UM-CIT-SC-UG': 'P085'},
}
# Lignes ajoutées (renvois du dessin sans ligne de liste) : [n°, qté, description, lien].
PSEUDO = {
    'P002': [['FBRA-002-100AS', 1, 'COMPLETE DRILL (FOREUSE)', 'P010'],
             ['UM-064-FMX-005-100PPP', 1, 'POWER PACK 125HP-600V-60H', 'P068'],
             ['UM-051-300P-FMC-036', 1, 'HYDRAULIC CONTROL CONSOLE', 'P078']],
    'P010': [['UM-064-1200GG', None, 'UNDERGROUND GUARD COMPLETE ASSEMBLY (page 1.13)', 'P023'],
             ['UM-106-100AA', 1, 'WATER SWIVEL ASSEMBLY (page 1.16)', 'P029'],
             ['UM-064-1601RM', None, 'WHEEL & HUB — OPTION (page 1.02)', 'P030']],
    'P042': [['STEP 1', None, 'HANDWHEELS AND CHAIN GUARDS (page 8.1)', 'P039'],
             ['STEP 2', None, 'SPROCKETS AND CHAIN 35 (page 8.2)', 'P040'],
             ['STEP 3', None, 'ARMS AND WIRE GUIDE (page 8.3)', 'P041']],
    'P048': [['UM-012-100UG-HC-04', None, 'DRILLING HEAD FITTING DETAILS (page 2.3)', 'P049']],
    'P078': [['UM-051-FMC-036-5', None, 'CONSOLE HYDRAULIC COMPONENTS (page 4.3)', 'P079']],
    'P079': [['UM-051-300P-001-3', None, 'HYDRAULIC COMPONENTS DETAILS (page 4.4)', 'P080'],
             ['UM-051-FMC-036-7', None, 'HYDRAULIC COMPONENTS DETAILS (page 4.4.1)', 'P081']],
}
NOTES = {
    'P002': "Prêt à forer, disposé d'après le plan de l'atelier : foreuse à gauche, inclinée vers le trou ; console STM à droite de la foreuse, à plus de 3 m (3,3 m), commandes tournées vers l'opérateur qui se tient entre la console et le groupe et regarde la foreuse par-dessus la console ; groupe hydraulique en haut à droite, à plus de 3 m (5,5 m), raccords au bout tourné vers la console, interrupteur principal accessible du côté bas. Boyaux branchés au sol : groupe → console (pression, retour, drain) et câble de commande ; console → tête (rotation A et B), bloc du traîneau (avance, vérins) et eau vers l'émerillon (par-dessus le moteur de la tête), chaque boyau dans sa voie. Seul le matériel du manuel est en 3D.",
    'P010': "Avance à 0° (horizontale) comme sur la page 1.01, sans le garde-corps grillagé ni le vérin supérieur ; le vérin d'avance double est logé dans la poutre. Treuil de câble posé sur l'arrière du traîneau, capot en position haute comme à la page 1.01 (volant sous la poutre) ; vérins de bascule de la chape des longerons à la patte avant du support d'avance, vérin de relevage couché dans le support, sous la poutre ; jambes et attelage non posés (page 1.01). Les sous-ensembles qui ont leur liste ouvrent leur page (dessins du manuel).",
    'P068': "Groupe posé sur ses patins : roues, moyeux et timon (options, pages 3.01 et 3.2) ne sont pas montés en 3D.",
    'P012': "Liste de débit (matériaux et longueurs en pouces) ; quantités illisibles pour trois lignes.",
    'P042': "Treuil en position haute (page 8.0 : 642 mm hors tout), câble enroulé sur le tambour. Les listes des pages 8.1 à 8.4 valent pour les versions gauche et droite (UM-032-100A_L et _R) : une machine porte un tambour, une transmission par chaîne 80 et un moteur White ; côté transmissions comme sur la foreuse (page 1.01). Le cadre « option underground » de la page 8.0 (hors liste) n'est pas monté.",
}

# Treuil UM-032-100A (pages 8.1 à 8.4) : les listes valent pour les versions gauche et droite
# (UM-032-100A_L et _R, page 8.0) ; une machine porte un seul tambour, une seule transmission et un
# seul moteur. qty3d : nombre posé en 3D sur une machine (dessins des pages 8.1 à 8.4).
DRAWN = {
    'P042': {'6400-12-12': 2, 'B437-1500': 4, 'B750-2500': 2, 'UM-032-102A': 1, 'UM-032-104B': 1, 'UM-032-111F': 1,
             'UM-032-112F': 1, 'UM-032-225F': 1, 'UM-032-241F': 1, 'UM-032-C2': 1, 'UM-041-208F': 1, 'UMV-10MW-12': 1,
             'W375': 2, 'W750': 2, 'SS375-500': 1, 'SS313-375': 1},
    'P039': {'B375-1250': 1, 'B375-3500': 3, 'SP250-1250': 2, 'SP375-3000': 1, 'UM-032-102F': 1, 'UM-032-103A': 1,
             'UM-032-163F': 1, 'UM-032-169F': 1, 'W375': 4},
    'P040': {'UM-032-109F': 1, 'UM-032-110F': 1, 'UM-032-162F': 1, 'UM-032-165F': 1, 'UM-032-224F': 1, 'UM-032-C1': 1},
    'P041': {'UM-032-226F': 1},
    'P079': {'UM-10B-TR#8': 2, 'M02-03-B-2': 1},
}
# Quantités dessinées qui ne s'expliquent pas par les deux versions : note propre à la ligne.
NOTES3D = {
    ('P039', 'B375-1250'): "La liste (versions gauche et droite UM-032-100A_L et _R) indique 10 boulons ; la page 8.1 "
                           "n'en dessine qu'un, la vis du bout de la vis-mère (en 3D) : les autres boulons ne sont pas dessinés.",
    ('P039', 'W375'): "La liste (versions gauche et droite UM-032-100A_L et _R) indique 25 rondelles ; en 3D, 4 : sous "
                      "les trois boulons du carter et sous la vis du bout. Les autres boulons ne sont pas dessinés.",
    ('P079', 'UM-10B-TR#8'): "Repère 27 du schéma hydraulique. La liste en indique 3 ; les dessins de la console (pages 4.1 à 4.4) en montrent 2 (en 3D).",
    ('P079', 'M02-03-B-2'): "La liste en indique 2 ; les dessins de la console (pages 4.1 à 4.4) en montrent 1 (en 3D).",
}
# Lignes de liste sans pièce dessinée : pas de 3D (note propre à la ligne).
NOT_DRAWN = {
    ('P079', '2404-8-8'), ('P079', '6505-8-8'), ('P079', '6600-8-8-8'),
}
# Ensembles détaillés dans la même liste : la ligne de l'ensemble désigne ses pièces (n° des lignes).
GROUPS = {
    'P041': {'UM-041-014F': ['UM-041-164F', 'UM-041-106F', 'UM-041-155F', 'B375-1500', 'UM-041-020F', '',
                             'UM-041-176F', 'UM-041-174F', 'CTP-125-2250']},
}
# Renvois d'étape dont l'assemblage a sa 3D (inséré dans le treuil complet).
PSEUDO_3D = {'P039', 'P040', 'P041', 'P049', 'P079'}

# ------------------------------------------------------------------ transcriptions à la main
HAND = {
    'P012': [
        ('3-16 LINK', 24, 'CHAIN 3/16 LINK'), ('FBRA-001-101B', None, 'P.L. 1/2" 44W — 2 1/2 in'),
        ('FBRA-001-201B', None, 'PL 3/4 in, 44W — 23 in'), ('FBRA-001-202B', 4, 'F.B. 1/2 in X 2 1/2 — 10 3/4 in'),
        ('FBRA-001-203B', 8, 'PL 1/2 in, 44W — 5 1/2 x 3 in'), ('FBRA-001-204B', None, 'PL 1/4 in 44W — 6 in'),
        ('UM-064-200B', 2, 'B.P.SHC 80 3 in (PIVOT TUBE) — 33 3/8 in'), ('UM-064-204B', 4, 'FB3 in X 1 in — 9 1/2 in'),
        ('UM-064-207B', 4, 'FA 2 1/2 in X 2 1/2 in X 1/2 in — 27 1/2 in'), ('UM-064-210B', 2, 'HSS 5 in X 3 in X 1/4 in — 47 in'),
        ('UM-064-211B', 4, 'ACIER À CLÉ 4 1/2 x 1 1/2 (CLAMP) — 9 1/2 in'), ('UM-064-213B', 2, 'PL 3/4 in, 44W — 2 x 2 1/8 in'),
        ('UM-064-218B', 2, 'FB1 1/2 in X 5/8 in — 47 in'), ('UM-064-220B', 1, 'PL 1/2 in, 44W — 8 3/4 x 8 1/2 in'),
    ],
    'P049': [
        ('2404-6-4', 3, 'MJIC x MP'), ('2404-8-6', 1, 'MJIC x MP'), ('2501-06-04', 1, 'MJIC x MP 90 DEG.'),
        ('2501-6-6', 3, 'MJIC x MP 90 DEG.'), ('2501-6-8', 4, 'MJIC x MP 90 DEG.'), ('2501-8-8', 1, 'MJIC x MP 90 DEG.'),
        ('2501LL-8-8', 1, 'MJIC x MP 90 DEG.'), ('2601-06-06-08', 1, 'MJIC x MJIC x MP TEE'), ('5000-6-6', 1, 'FP x FP COUPLING'),
        ('6402-8-8', 1, 'ORB x FJIC SWIVEL'), ('6500-06-06', 4, 'MJIC x FJIC SWIVEL'), ('6600-06-06-06', 2, 'MJIC x MJIC x FJIC SWIVEL BRANCH TEE'),
        ('6600-8-8-8', 1, 'MJIC x MJIC x FJIC SWIVEL BRANCH TEE'), ('6602-06-06-06', 1, 'MJIC x FJIC x MJIC SWIVEL RUN TEE'),
        ('6801-6-8', 1, 'MJIC x MORB 90 DEG.'), ('A-1199-R-4048', 1, 'BREATHER'),
        ('UM-012-H08C', 1, 'HOSE 3/8 Ø FOR BREATHER 24" lg'), ('UM-012-H10C', 1, 'HOSE 3/8 Ø-BED HOUSING/TRANSMIS. 3 3/4" lg'),
        ('UM-012-H11C', 1, 'HOSE 1/2 Ø-TRANSMISSION/CASING 5"'), ('UM-012-H15C-UG', 1, 'HOSE 3/8 Ø-CASING/SUCCION 9 3/4" lg'),
        ('UM-012-H16C-UG', 1, 'HOSE 3/8 Ø-CASING/SUCCION 21"'), ('UM-012-H17C-UG', 1, 'HOSE 3/8 Ø FILTER OUT/COOLER DOWN 10" lg'),
        ('UM-012-H18C-UG', 1, 'HOSE 3/8 Ø-COOLER UP/REGULATOR 12" lg'), ('UM-012-H20C-UG', 1, 'HOSE 3/8 Ø-PRESSION IN/FILTER 6 3/4" lg'),
        ('UM-012-H21C-UG', 1, 'HOSE 3/8 Ø-REGULATOR/TRANSMISSION IN 5" lg'), ('UM-012-H22C-UG', 1, 'HOSE 3/8 Ø-TRANSMISSION/BED HOUSING 8" lg'),
        ('UM-012-H23C-UG', 1, 'HOSE 3/8 Ø-TRANSMISSION/COVER 10" lg'), ('UM-012-H24C-UG', 1, 'HOSE 3/8 Ø-REGULATOR/LOWER BEARING 9" lg'),
        ('UM-012-H25C-UG', 1, 'HOSE 3/8 Ø-REGULATOR/UPPER BEARING 7" lg'), ('NDV-10-N', 1, 'REGULATOR'), ('UM-10B-TR#6', 1, 'BKH - 3/8 NPT'),
    ],
    'P069': [
        ('OR-219', 1, 'O-RING I.D. 1 5/16 O.D. 1 7/16'), ('SF-COD61-16', 2, 'SPLIT FLANGE #16 (1") CODE 61'), ('LC375', 4, 'LOCK WASHER 3/8"'),
        ('B375-1250', 4, 'BOLT 3/8 - 16 NC X 1 1/4'), ('6400-12-12', 1, '6400-12-12'), ('W750', 4, 'FLAT WASHER 3/4'),
        ('LC625', 4, 'LOCK WASHER 5/8"'), ('B625-1750', 4, 'BOLT 5/8-UNC x 1 3/4"'), ('UM-F81-31228', 1, 'COUPLING F-81-31228'),
        ('F87U', 1, 'INSERTS (F87U)'), ('218P', 1, 'LOCK PINE'), ('UM-F81-B1308C-1', 1, 'COUPLING (F81)'), ('BH447-SAED-1', 1, 'HOUSING'),
        ('BH447-SAED-4', 1, 'HOUSING CAP'), ('B375-750', 2, 'BOLT 3/8-UNC X 3/4"'), ('W375', 2, 'FLAT WASHER 3/8'),
        ('CT125504NPBBW22', 1, 'WEG MOTOR 125 HP (444/5TC, 1780 RPM, 575 V, 184 A)'), ('SP43-24-24', 1, 'FLANGE -code-61 NPT-1 1/2'),
        ('UM-064-250P', 1, 'FLANGE KIT-code-61'), ('UM-064-318TD', 1, 'KING NIPPLE 3"'), ('A11VO130', 1, 'PUMP A11VO130DSF10LNSD62K04'),
        ('A10VO45K', 1, 'PUMP A10VO45DFR52LPUC62K68'), ('6801F-06-06', 1, 'MJIC 6 x MORB 6'), ('568-237', 1, 'O-RING I.D. 3 3/8 O.D 3 5/8'),
        ('568-225', 1, 'O-RING I.D. 1 7/8 O.D. 2 1/8'), ('UM-064-276P', 1, 'STREET ELBOW 3"'), ('A10VO45N', 1, 'PUMP A10VO45DFR52LPUC64N00'),
        ('6400-8-8', 2, 'MJIC x MORB'), ('6500-08-08', 1, 'MJIC 08 x FJIC 08 SWIVEL'), ('6801-24-24', 1, 'MJIC 24 x MORB 24'),
        ('6400-12-16', 1, 'MJIC 12 x MP 16'), ('2501-24-24', 1, 'MJIC 24 x MP 24'), ('SHCS500-1500', 4, 'SHCS 1/2-UNC X 1 1/2"'),
        ('SHCS625-2000', 4, 'SHCS 5/8-UNC X 2"'), ('B750-2500', 4, 'BOLT 3/4-UNC x 2 1/2"'), ('OR-222', 1, 'O-RING #222'),
        ('449-74446-20', 2, 'SPLIT FLANGE #20 CODE 62'), ('LC500', 4, 'LOCK WASHER 1/2"'), ('B437-1000', 4, 'BOLT 7/16-UNC x 1"'),
        ('02436083', 1, 'COUPLING FOR A11VO130 (K04)'), ('02436084', 1, 'COUPLING FOR A10VO45 (K68)'),
    ],
    'P079': [
        ('UM-020-643P', 1, 'WATER BLOCK'), ('UM-10B-TR#16', 2, 'BALL VALVE BKH-1-NPT-1125 (5000 PSI)'), ('5406-P-12', 2, 'HEX 12-MP PLUG'),
        ('6602-16-16-16', 1, 'MJIC 16 x FJIC 16 x MJIC 16 SWIVEL RUN TEE'), ('UM-020-CE7', 1, 'STICKER FOR WATER BLOCK'),
        ('2404-16-16', 2, 'MJIC 16 X MP 16'), ('6400-16-16', 1, '6400-16-16'), ('2406-16-04', 1, 'FEM. JIC X 16 X MJIC 04'),
        ('6806-16-16', 2, 'MJIC 12 x FJIC 12 x MJIC 12'), ('M02-03-B-2', 2, 'M02-03-B-2'), ('10250H', 1, 'SPECIAL PURPOSE CONTROL STATION'),
        ('2011F03-06744-51', 1, 'BLOC FOR WATER PUMP AND MUD MIXER', 66), ('2404-8-8', 1, 'MJIC 8 x MP 8'),
        ('6505-8-8', 1, 'MP 8 x FJIC 8 SWIVEL STRAIGHT'), ('6600-8-8-8', 1, 'MJIC 8 x MJIC 8 x FJIC 8 TEE'),
        ('AM3051003', 1, 'ACCUMULATOR 1 gal.', 39), ('AM-45-250', 1, 'ACCUMULATOR 1/2 gal.'), ('HA250SH9003SFU', 1, 'RETURN BLOCK HA250', 43),
        ('PBDB-LNN-ECI', 2, 'PRESSURE REDUCER', 25), ('PBDB-LNN-ECI_S', 1, 'PRESSURE REDUCER', 5),
        ('RPGC-LCN-CAL_S', 2, 'PILOT OPERATED, BALANCED PISTON RELIEF VALVE', 23), ('SD25', 1, 'VALVE (ROTATION, SCREW-UNSCREW, FAST FEED)', 12),
        ('SDS150', 1, 'VALVE CHUCK, CLAMP, LOW FEED, WIRE LINE', 13), ('SWH-G02-C2D12-20', 1, 'ELEC. VALVE D03 12 V c/f DIN', 28),
        ('UM-10B-TR#8', 3, 'BKH-1/2-NPT', 27), ('UM-CE-BDJ', 1, 'JUNCTION BOX'), ('UM-CIT-SC-UG', 1, 'UNDERGROUND SAFETY CONTROLLER'),
        ('UMV-10-C2', 4, 'STAUFF SPG-063-5000S (GAUGE)', 38), ('UMV-10-C4', 1, 'PITANCO 250LFSS22W 1500Psi (GAUGE)'),
        ('UMV-10B-#12', 1, 'BKH-34-NPT-1125'), ('UMV-10BS-01', 1, 'BLOCK FEED SET MANIFOLD', 64), ('UMV-10BS-105', 1, 'BLOCK SYNCHRO', 65),
        ('UMV-10V-NDRV-10-N', 2, 'FLOW CONTROL'), ('UMV-10VS-2009F03', 1, 'SECURITY BLOCK #2', 45),
    ],
}
# Documents : (titre anglais, titre français, pages, colonnes, lignes [repère, n°, qté, description]).
DOCS = [
    ('P043', 'Hoist — arm positions', 'Treuil — réglage des bras', ['P043', 'P044'], [
        ['1', 'UM-032-115F', 2, 'LOWER ARM'], ['2', 'UM-032-116F', 2, 'UPPER ARM']]),
    ('P053', 'Transmission Funk HMD-2355', 'Transmission Funk HMD-2355 (4 vitesses)', [f'P{n:03d}' for n in range(53, 63)], [
        ['1', 'YZ4023882', 1, 'ASM CASE & GEAR — TRANS 4 SPD W/4023381 FLG'], ['2', '4023824', 1, 'SHIFT CAP ASM'],
        ['3', '4023208', 1, 'ADAPTER GROUP (HYD MOTOR SAE D)'], ['4', '4HMD147', 1, 'ASM COUPLING 13T 8/16P SPLINE'],
        ['201', 'F23309', 1, "PLUG, SHIPPING SAE 'D', 6\" DIA PLASTIC COVER"]]),
    ('P074', 'AOCHM-30 parts list (option)', 'Refroidisseur air-huile AOCHM-30 (option)', ['P074'], [
        ['1', '106-2020', None, 'CORE'], ['2', '199-0015', None, 'GASKET KIT'], ['3', '306-3002', None, 'MOTOR'],
        ['4', '107-0006', None, 'TOP PANEL'], ['5', '107-0006', None, 'BOTTOM PANEL'], ['6', '107-0047', None, 'RIGHT TANK'],
        ['7', '107-0046', None, 'LEFT TANK'], ['8', '107-0009', None, 'MOTOR BRACKET'], ['9', '107-0004', None, 'LOUVER'],
        ['10', '307-0010', None, 'FAN'], ['11', '308-0005', None, 'FAN GUARD'], ['12', '107-0002', None, 'RIGHT PANEL'],
        ['13', '107-0002', None, 'LEFT PANEL'], ['14', '107-0008', None, 'BACK PANEL'], ['15', '312-1002', None, 'SHAFT ADAPTER']]),
    ('P082', 'Riveted panels identification', 'Console — plaques d\'identification rivetées', ['P082'], None),
    ('P083', 'Accumulator AM-45-250 details', 'Accumulateur AM-45-250', ['P083'], [
        ['1', 'AI-1QT-308', 1, 'SAFETY CAP'], ['1', 'AI-1QT-309', 1, 'SAFETY CAP O-RING'], ['2', 'AI-1QT-306', 1, 'PROTECTIVE CAP'],
        ['3', 'AI-1QT-303', 1, 'VALVE CAP'], ['4', 'AI-S-304', 1, 'VALVE CORE'], ['5', 'AM-309', 1, 'ACCUMIGHT GAS VALVE'],
        ['6', 'AM-310', 1, 'GAS VALVE O-RING'], ['7', '', 1, 'SHELL (NOT FOR SALE)'], ['8', 'AM-413', 1, 'LABEL'],
        ['9', 'AM-411', 1, 'TEFLON RING'], ['10', 'AM-45-3KT', 1, 'BLADDER KIT (BUNA-NITRILE)'], ['11', 'AM-412', 1, 'METAL RING'],
        ['12', 'AM-410-L', 1, 'O-RING']]),
    ('P086', 'Safety controller SECFOR CAT3', 'Contrôleur de sécurité SECFOR CAT3 — documentation', [f'P{n:03d}' for n in range(86, 95)] + ['P096'], []),
    ('P095', '600VAC 125HP drill control panel — schematic', 'Schéma du panneau de commande 600 V, 125 HP', ['P095'], []),
]

# ------------------------------------------------------------------ nettoyage du brouillon
JUNK = re.compile(r'COMPLETE|C:\\|OVERALL DIMENSION|HEIGHT:|WIDTH:|LENGTH:|GOOD CABLE|O-RONG|IF YOU|DE PIÈCES|HYDRAULIC SHEMA|'
                  r'PLEASE|ONLY CARTRIDGE|ASSEMBLY WITH|^SPOOL|^AND$|^ROD$|^FAST|^WIRE LINE$|^CHUCK/CLAMP|^T2SDS|^FEED$|'
                  r'^DE SÉCURITÉ|^BOX \(UNDER|^COMPLE|^HP1000$|^JN1$|^SK-01$|^UM-CIT-SC-UG$|^UM-041-014F$|^UM-064-800B$|^FBRA-002-150BM$|'
                  r'^UM-058-800PP$|^\(MODIFIED\)$|^1$')
PN = re.compile(r'^(?=.*[\d-])[A-Z0-9][A-Z0-9#._/()+-]*$')
# N° absents du brouillon (cachés par le dessin ou hors colonne), par page : description → n°.
PNFIX = {
    'P071': {'MANIFOLD LYNCH U': 'H2505H09003SFU'},
    'P080': {'SECURITY BLOCK #2': 'UMV-10VS-2009F03', 'INLET COVER': 'SDS150_AC(YG3)', 'SPRING RETURN KIT': 'V8-MDS10-11-16',
             'INLET C COVER WITH RELIEF': 'FE-SD25'},
    'P081': {'PLUGGED BODY': '654512-06744-51'},
    'P019': {'YEJ BLOC': 'YEJ'},
    'P025': {'TELEMACANIQUE XY2-CH EMERGENCY STOP SWITCH': 'XY2-CH'},
    'P036': {'SKF 2307 E-2RS1 BEARING': '2307 E-2RS1'},
    'P068': {'DTDA-MHN-GAI STARTING VALVE': 'DTDA-MHN-GAI'},
    'P084': {'HDC 10B ABU (HOUSING)': 'HDC-1205000000', 'HDC 10B DODQ 4BO (COVER)': 'HDC-1665230000'},
    'P085': {'HDC- INSERT FEMALE, NO. OF POLE: 10': 'HDC-1204100000', 'HDC ROCKSTAR HOUSING IP 65': 'HDC-1205000000',
             'HDC ROCKSTAR HOUSING CAP IP 65': 'HDC-1665230000', 'ENGLISH STICKER': 'UM-CIT-SC-UG-CA1'},
    'P040': {'': 'UM-032-102F'},
}
PNPREFIX = {'10D003 806 12': 'C016 10D003 806 12', '20C003 100 12': 'C016 20C003 100 12', '20F003 100 12': 'C016 20F003 100 12',
            '20G003 100 12': 'C016 20G003 100 12', '20H003 110 12': 'C016 20H003 110 12', 'GRADE 8 BOLT 1/2-UNC x 6 1/2': 'B500-6500GR8',
            'GRADE 8 BOLT 1/2-UNC x 8': 'B500-8000GR8'}


def clean(page, tables):
    rows = []
    for t in tables:
        for item, name, q in t['rows']:
            text = re.sub(r'\s+', ' ', f'{item} {name}'.replace('{', ' ').replace('}', ' ')).strip()
            hyd = None
            m = re.search(r'\bREF (\d+)\b', text)
            if m:
                hyd = int(m.group(1))
                text = (text[:m.start()] + text[m.end():]).strip()
            text = re.sub(r'\s+(COMPLETE .*|O-RONG KIT.*|UNDERGROUND GUARD .*|UM-012-104A)$', '', text)
            qm = re.match(r'\s*(\d+)', q or '')
            qty = int(qm.group(1)) if qm else None
            toks = text.split(' ')
            # Quantité d'un tableau voisin collée devant le n° (« 1 UM-064-300Z … »).
            if len(toks) > 1 and re.fullmatch(r'\d{1,2}', toks[0]) and PN.match(toks[1]) and re.search(r'[A-Z-]', toks[1]):
                toks = toks[1:]
                text = ' '.join(toks)
            if qty is None:
                if not text or JUNK.search(text) or (len(toks) == 1 and PN.match(text) and rows and page != 'P040'):
                    continue
                if 'KIT' in text.upper() and re.search(r'\d{4,}|KP\d|HERSK|CHV', text):
                    rows.append({'pn': next((x.strip('#') for x in toks if re.search(r'\d{3,}', x)), ''), 'qty': None, 'desc': text})
                    continue
                if rows:
                    rows[-1]['desc'] += ' ' + text
                continue
            pn, desc = '', text
            for pre, full in PNPREFIX.items():
                if text.startswith(pre):
                    pn, desc = full, text[len(pre):].strip() or text
                    break
            else:
                if toks and PN.match(toks[0]) and toks[0] not in ('1/2"', '90°'):
                    pn, desc = toks[0], ' '.join(toks[1:]) or toks[0]
            rows.append({'pn': pn, 'qty': qty, 'desc': desc, 'hyd': hyd})
    for r in rows:
        r['desc'] = re.sub(r'\s+', ' ', r['desc']).strip()
        if page == 'P068' and r['pn'] == 'NC3':
            r['pn'], r['desc'] = 'NC375', 'NUT 3/8-UNC'
        if page == 'P011':
            r['desc'] = r['desc'].replace('1/4-UNF VALVE', '1/4-UNF')
        if not r['pn']:
            r['pn'] = PNFIX.get(page, {}).get(r['desc'], '')
        r['pn'] = r['pn'].replace('-----', '')
    return rows


def lines_for(page):
    if page in HAND:
        return [{'pn': h[0], 'qty': h[1], 'desc': h[2], 'hyd': h[3] if len(h) > 3 else None} for h in HAND[page]]
    if page == 'P002':
        return []
    return clean(page, RAW.get(str(int(page[1:])), []))


assemblies, refs = {}, {}
for aid, (title, fr, pn, sheets) in ASM.items():
    rows = lines_for(aid)
    out, rmap = [], {}
    for i, r in enumerate(rows, 1):
        extra = {}
        link = LINKS.get(aid, {}).get(r['pn'])
        if link and link != aid:
            extra['link'] = link
        if r.get('hyd'):
            extra['note'] = f'Repère {r["hyd"]} du schéma hydraulique.'
        if r['qty'] is None and 'KIT' in r['desc'].upper():
            extra['kit'] = True
        if aid == 'P010' and r['pn'] in ('FTD-030-100ZZ', 'FTD-148-800K'):
            extra['note'] = 'Non monté en 3D : l\'avance se fait par le vérin double logé dans la poutre (UM-064-100Z).'
            extra['no3d'] = True
        if aid == 'P010' and r['pn'] == 'UM-064-351D':
            extra['note'] = 'Non monté en 3D : la page 1.01 ne le montre posé dans aucune vue (voir 1.10).'
            extra['no3d'] = True
        if aid == 'P010' and r['pn'] == 'UM-064-400D':
            extra['note'] = ("Non montées en 3D : à 0° (page 1.01) les jambes ne sont pas posées ; aux inclinaisons de 45° et 90°, "
                             "elles se posent entre l'oreille d'un poteau du traîneau (à 455 mm du sol) et une patte sous la poutre (voir 1.01 et 1.10).")
            extra['no3d'] = True
        if aid == 'P068' and r['pn'] in ('UM-064-1601RM', 'UM-064-1605RM', 'UM-064-195TB', 'UM-064-TD41'):
            extra['note'] = 'Option non montée (groupe posé sur ses patins).'
            extra['no3d'] = True
            extra.pop('link', None)
        if (aid, r['pn']) in NOT_DRAWN:
            extra['note'] = 'Non dessiné sur les pages de la console (4.1 à 4.4) : pas de 3D.'
            extra['no3d'] = True
        n3d = DRAWN.get(aid, {}).get(r['pn'])
        if n3d is not None and n3d != r['qty']:
            extra['qty3d'] = n3d
            extra['note'] = NOTES3D.get((aid, r['pn'])) or (
                f"La liste vaut pour les versions gauche et droite (UM-032-100A_L et _R) : elle indique {r['qty']}, "
                f"une machine en porte {n3d} (en 3D).")
        out.append([str(i), r['pn'], r['qty'], r['desc']] + ([extra] if extra else []))
        rmap.setdefault(r['pn'], str(i))
    for row in out:
        members = GROUPS.get(aid, {}).get(row[1])
        if members:
            if len(row) == 4:
                row.append({})
            row[4]['group'] = [rmap[m] for m in members]
    for j, (ppn, q, desc, link) in enumerate(PSEUDO.get(aid, []), len(out) + 1):
        no3d = link not in PSEUDO_3D and ('OPTION' in desc or q is None)
        out.append([str(j), ppn, q, desc, {'link': link, 'pseudo': True, **({'no3d': True} if no3d else {})}])
        rmap.setdefault(ppn, str(j))
    a = {'title': title, 'titleFr': fr, 'pn': pn, 'sheets': sheets, 'parts': out}
    if aid in NOTES:
        a['note'] = NOTES[aid]
    assemblies[aid] = a
    refs[aid] = rmap

documents = []
for did, title, fr, sheets, parts in DOCS:
    if parts is None:
        parts = [[str(i), r['pn'], r['qty'], r['desc']] for i, r in enumerate(clean(did, RAW.get(str(int(did[1:])), [])), 1)]
        parts = [[p[0], p[1], p[2], p[3]] for p in parts]
    documents.append({'id': did, 'title': title, 'titleFr': fr, 'sheets': sheets, 'columns': ['ref', 'pn', 'qty', 'desc'], 'parts': parts})

data = {
    'id': 'stm-1500',
    'name': 'Usinage Marcotte STM-1500',
    'manufacturer': 'Usinage Marcotte',
    'category': 'Foreuse aux diamants souterraine',
    'serial': 'STM-1500-128',
    'document': {'title': 'Part book for STM-1500', 'reference': 'FBRA-002 (client Machines Roger)', 'preparedBy': 'Usinage Marcotte inc., Val-d\'Or (M. S. Gignac)',
                 'date': '2013-11-26', 'sheets': 96, 'pagePattern': 'pages/{sheet}.webp'},
    'specs': [['Modèle', 'STM-1500 (foreuse aux diamants souterraine, avance à vérin « top feed »)'],
              ['Moteur électrique', 'WEG 125 HP, 575 V, 60 Hz, 1 780 tr/min, 184 A (CT125504NPBBW22)'],
              ['Pompes', 'Rexroth A11VO130 + A10VO45 + A10VO45 en tandem'],
              ['Tête de forage', 'UM-012-100UG Boyles, transmission Funk HMD-2355 4 vitesses, moteur A6VM160, 1 200 tr/min max'],
              ['Mandrin', 'Boyles H, passage Ø 3 7/8 po'],
              ['Serre-tiges de pied', 'Boyles 12HH'],
              ['Treuil de câble', '10 000 pi (UM-032-100A), tambour à flasques Ø 490 mm, moteur White RE12, chaîne 80'],
              ['Réservoir', '110 gal US'],
              ['Foreuse à 0°', '4 202 × 864 × 1 731 mm, axe à 1 235 mm'],
              ['Groupe hydraulique', '2 460 × 1 225 × 1 548 mm'],
              ['Console', '791 × 778 × 1 496 mm']],
    'weights': [['Foreuse sans câble', '6 000 lb'], ['Groupe hydraulique', '5 800 lb'], ['Console', '800 lb']],
    'sheetTitles': SHEETS,
    'root': 'P002',
    'assemblies': assemblies,
    'documents': documents,
}
out = ROOT / 'public/equipment/stm-1500/data.json'
out.write_text(json.dumps(data, ensure_ascii=False, indent=1))
(ROOT / 'src/models/stm-1500/refs.js').write_text(
    '// Généré par tools/extract_stm1500.py — ne pas modifier à la main.\n'
    '// Repère (rang de la ligne) de chaque n° de pièce, par assemblage.\n'
    f'export default {json.dumps(refs, ensure_ascii=False, indent=1)};\n')
print(out, len(assemblies), 'assemblages', sum(len(a['parts']) for a in assemblies.values()), 'lignes ;', len(documents), 'documents')
