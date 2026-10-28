// Simulateur de la console ERIS (Sandvik DU311, manuel de l'utilisateur, pages 121 à 147).
//
// Modèle d'état seulement (aucun DOM) : modes SYSTEM, TRAM, SETUP et DRILL, couches de la manette gauche,
// fonctions de la manette droite, voyants CANBUS / DRILL / CONTROL, alarmes, arrêt d'urgence. Les libellés de
// l'écran sont ceux des copies d'écran du manuel (en anglais, comme sur la machine), avec leur traduction tirée du
// texte du manuel. Les règles viennent du manuel :
//   - au démarrage, mode SYSTEM, couche Start (p. 122, 125) ;
//   - sans « Control », les modes Déplacement, Mise en place et Forage ne peuvent pas être sélectionnés (p. 123) ;
//   - changement de mode : bouton extérieur de la manette gauche (touche Mode) maintenu + manette gauche vers la
//     gauche ou la droite (p. 124) ; un bouton de la manette gauche choisit la couche (p. 124) ;
//   - déplacement seulement avec « Tram Enable » maintenu ; relâché, les pointeurs disparaissent (p. 138) ;
//   - en Configuration, les angles de balancement et de déchargement sont affichés en temps réel (p. 139) ;
//   - forage manuel : couche Pulldown/Holdback par défaut, verrouillage de la foreuse après air/eau, rotation et
//     avance vers l'avant maintenues ; manette droite relâchée, l'avance devient automatique (p. 144, 145) ;
//   - profondeur prédéfinie atteinte : arrêt du forage, avance ramenée en arrière deux secondes (p. 137) ;
//   - silence et réinitialisation des alarmes seulement depuis l'écran Error (p. 130) ;
//   - arrêt d'urgence : toutes les fonctions s'arrêtent ; il reste actionné jusqu'à sa réinitialisation manuelle,
//     qui ne redémarre pas la machine (p. 44 à 46) ;
//   - l'air de forage suppose le compresseur en marche (p. 171).
// Valeurs affichées (profondeur, angles, débit) : celles du simulateur, pour l'exercice.

/** Libellés : id → [écran (anglais), français, page]. */
export const T = {
  system: ['SYSTEM', 'Système', 124], tram: ['TRAM', 'Déplacement', 137], setup: ['SETUP', 'Mise en place', 139], drill: ['DRILL', 'Forage', 141],
  // SYSTEM — couches (manette gauche)
  diagnostic: ['Diagnostic', 'Diagnostic', 126], start: ['Start', 'Démarrage', 125], configuration: ['Configuration', 'Configuration', 128],
  error: ['Error', 'Erreur', 130], hole: ['Hole Configuration', 'Configuration des trous', 137],
  // SYSTEM — fonctions (manette droite)
  control: ['Control', 'Commande : prendre le contrôle de la machine', 125], compressor: ['Compressor', 'Compresseur (marche/arrêt)', 125],
  'hydraulic-pump': ['Hydraulic Pump', 'Pompe hydraulique (marche/arrêt)', 125], horn: ['Horn', 'Avertisseur sonore', 125],
  'drill-light': ['Drill Light', 'Éclairage de la foreuse', 125], 'can-bus': ['CAN Bus', 'État du bus CAN (VMM et manettes)', 126],
  'log-off': ['Log Off', 'Quitter la configuration', 129],
  silence: ['Silence', 'Silence de l’alarme', 130], 'bottom-alarm': ['Bottom Alarm', 'Dernière alarme de la liste', 130], 'top-alarm': ['Top Alarm', 'Première alarme de la liste', 130],
  'alarm-history': ['Alarm History', 'Historique des alarmes', 130], 'current-alarm': ['Current Alarm', 'Alarmes actives', 130], reset: ['Reset', 'Réinitialisation de l’alarme', 130],
  'reset-total-depth': ['Reset Total Depth', 'Remise à zéro de la profondeur totale', 137], 'reset-hole-depth': ['Reset Hole Depth', 'Remise à zéro de la profondeur du trou', 137],
  increase: ['Increase', 'Augmenter la valeur', 137], decrease: ['Decrease', 'Diminuer la valeur', 137],
  'scroll-left': ['Scroll Left', 'Champ précédent', 137], 'scroll-right': ['Scroll Right', 'Champ suivant', 137],
  'field-left': ['Select Field', 'Champ précédent', 128], 'field-right': ['Select Field', 'Champ suivant', 128],
  'value-up': ['Change Value', 'Augmenter le chiffre', 128], 'value-down': ['Change Value', 'Diminuer le chiffre', 128],
  // TRAM
  'tram-enable': ['Tram Enable', 'Activation du déplacement (maintenir)', 138], laser: ['Laser', 'Laser', 137],
  'cable-reel-in': ['Cable Reel In', 'Enroulement du câble (dévidoir)', 138],
  'tram-reverse': ['Tram Reverse', 'Pousser : l’unité s’éloigne de l’opérateur', 138], 'tram-forward': ['Tram Forward', 'Tirer : l’unité vient vers l’opérateur', 138],
  'steering-left': ['Steering Left', 'Direction à gauche', 138], 'steering-right': ['Steering Right', 'Direction à droite', 138],
  // SETUP
  outrigger: ['Outrigger', 'Stabilisateur', 140], feed: ['Feed', 'Avance', 139], stinger: ['Stinger', 'Élinde', 140],
  'deck-slide': ['Deck Slide', 'Deck Slide (non décrit dans ces pages)', 139], 'mast-slide': ['Mast Slide', 'Glissement du mât', 139],
  'dump-down': ['Dump Down', 'Déchargement vers le bas', 139], 'dump-up': ['Dump Up', 'Déchargement vers le haut', 139],
  'swing-clockwise': ['Swing Clockwise', 'Balancement horaire', 139], 'swing-counterclockwise': ['Swing Counterclockwise', 'Balancement antihoraire', 139],
  'feed-extend': ['Feed Extend', 'Extension de l’avance', 139], 'feed-retract': ['Feed Retract', 'Rétraction de l’avance', 139],
  'mast-slide-left': ['Mast Slide Left', 'Glissement du mât à gauche', 139], 'mast-slide-right': ['Mast Slide Right', 'Glissement du mât à droite', 139],
  'upper-stinger-out': ['Upper Stinger Out', 'Élinde supérieure : extension', 140], 'upper-stinger-in': ['Upper Stinger In', 'Élinde supérieure : rétraction', 140],
  'lower-stinger-in': ['Lower Stinger In', 'Élinde inférieure : rétraction', 140], 'lower-stinger-out': ['Lower Stinger Out', 'Élinde inférieure : extension', 140],
  'front-outrigger-down': ['Front Outrigger Down', 'Stabilisateur avant : abaisser', 140], 'front-outrigger-up': ['Front Outrigger Up', 'Stabilisateur avant : relever', 140],
  'rear-outrigger-down': ['Rear Outrigger Down', 'Stabilisateur arrière : abaisser', 140], 'rear-outrigger-up': ['Rear Outrigger Up', 'Stabilisateur arrière : relever', 140],
  // DRILL — couches
  'slip-centralizer': ['Slip/Centralizer', 'Glissement/Guide-mèche', 143], 'carousel-wrench': ['Carousel/Wrench', 'Carrousel/Clé', 142],
  'arm-clamp': ['Arm/Clamp', 'Bras/Pince', 143], accrafeed: ['Accrafeed', 'Accrafeed', 147], 'carousel-water': ['Carousel/Water', 'Carrousel/Eau', 146],
  'pulldown-holdback': ['Pulldown/Holdback', 'Abaissement/Retenue', 144], pulldown: ['Pulldown', 'Abaissement', 147],
  // DRILL — fonctions
  'makeup-breakout': ['Makeup/Breakout', 'Mise en place/Désaccouplement', 144], 'drill-air': ['Drill Air', 'Air de forage', 145],
  'spline-piston': ['Spline Piston', 'Spline Piston (non décrit dans ces pages)', 141], 'collar-air': ['Collar Air', 'Collar Air (non décrit dans ces pages)', 141],
  'manual-drilling': ['Manual Drilling', 'Forage manuel', 144], water: ['Water', 'Eau', 145], 'drill-lock': ['Drill Lock', 'Verrouillage de la foreuse', 145],
  'reverse-drilling': ['Reverse Drilling', 'Forage inversé', 141],
  'slip-in': ['Slip In', 'Plaque coulissante vers l’intérieur', 143], 'slip-out': ['Slip Out', 'Plaque coulissante vers l’extérieur', 143],
  'centralizer-out': ['Centralizer Out', 'Mâchoires du guide-mèche vers l’extérieur', 143], 'centralizer-in': ['Centralizer In', 'Mâchoires du guide-mèche vers l’intérieur', 143],
  'breakout-wrench-in': ['Breakout Wrench In', 'Mécanisme de désaccouplement : rétraction', 142], 'breakout-wrench-out': ['Breakout Wrench Out', 'Mécanisme de désaccouplement : extension', 142],
  'carousel-rotate-out': ['Carousel Rotate Out', 'Rotation du carrousel vers l’extérieur', 142], 'carousel-rotate-in': ['Carousel Rotate In', 'Rotation du carrousel vers l’intérieur', 142],
  'arm-in': ['Arm In', 'Bras du carrousel vers l’intérieur', 143], 'arm-out': ['Arm Out', 'Bras du carrousel vers l’extérieur', 143],
  'clamp-open': ['Clamp Open', 'Ouverture de la pince', 143], 'clamp-close': ['Clamp Close', 'Fermeture de la pince', 143],
  'pulldown-increase': ['Pulldown Increase', 'Augmenter l’abaissement', 144], 'pulldown-decrease': ['Pulldown Decrease', 'Diminuer l’abaissement', 144],
  'holdback-increase': ['Holdback Increase', 'Augmenter la retenue', 144], 'holdback-decrease': ['Holdback Decrease', 'Diminuer la retenue', 144],
  'water-flow-increase': ['Water Flow Increase', 'Augmenter le débit d’eau', 146], 'water-flow-decrease': ['Water Flow Decrease', 'Diminuer le débit d’eau', 146],
  'feed-forward': ['Feed Forward', 'Avance vers l’avant', 141], 'feed-reverse': ['Feed Reverse', 'Avance vers l’arrière', 141],
  'rotation-forward': ['Rotation Forward', 'Rotation vers l’avant', 141], 'rotation-reverse': ['Rotation Reverse', 'Rotation vers l’arrière', 141],
  'rotation-increase': ['Rotation Increase', 'Augmenter la vitesse de rotation', 145], 'rotation-decrease': ['Rotation Decrease', 'Diminuer la vitesse de rotation', 145],
  makeup: ['Makeup', 'Vissage : rotation horaire rapide et avance lente', 144], breakout: ['Breakout', 'Dévissage : rotation antihoraire rapide et levage lent', 144],
};

export const MODES = ['system', 'tram', 'setup', 'drill'];

/**
 * Bouton physique de chaque nom de liste, relevé sur les vignettes de manette des copies d'écran (coins en bas de
 * l'écran, p. 122 à 147) : un trait relie chaque nom à un bouton de la tête, et le bouton de la couche ou de la
 * fonction active y est orange. Tête vue par l'opérateur : HG, HD (rangée du haut), MG, MD (rangée du milieu),
 * B (bouton du bas) et C (bouton du côté extérieur ; à gauche, c'est la touche Mode).
 */
export const BOUTON = {
  L: {
    diagnostic: 'MG', start: 'HG', configuration: 'MD', error: 'HD', hole: 'B',
    'tram-enable': 'B',
    outrigger: 'MG', feed: 'HG', stinger: 'HD',
    'carousel-wrench': 'MG', 'carousel-water': 'MG', accrafeed: 'HG', 'arm-clamp': 'MD', 'pulldown-holdback': 'HD', pulldown: 'HD', 'slip-centralizer': 'B',
  },
  R: {
    control: 'C', compressor: 'MD', 'hydraulic-pump': 'HD', horn: 'MG', 'drill-light': 'HG',
    'can-bus': 'HG', 'log-off': 'C',
    silence: 'C', 'bottom-alarm': 'MD', 'top-alarm': 'HD', 'alarm-history': 'MG', 'current-alarm': 'HG', reset: 'B',
    'reset-total-depth': 'C', 'reset-hole-depth': 'HG',
    laser: 'B', 'deck-slide': 'MG', 'mast-slide': 'HG',
    'makeup-breakout': 'C', 'drill-lock': 'C', 'drill-air': 'MD', 'spline-piston': 'HD', 'reverse-drilling': 'HD', 'collar-air': 'MG', 'manual-drilling': 'HG', water: 'B',
  },
};
/** Nom d'une position de bouton. */
export const POSITION = { HG: 'en haut à gauche', HD: 'en haut à droite', MG: 'au milieu à gauche', MD: 'au milieu à droite', B: 'en bas', C: 'sur le côté extérieur' };
/** Fonctions qui restent actives (bascule) ; les autres agissent à l'appui. */
const BASCULE = new Set(['control', 'compressor', 'hydraulic-pump', 'drill-light', 'laser', 'mast-slide', 'makeup-breakout', 'drill-air', 'manual-drilling', 'water', 'drill-lock', 'reverse-drilling', 'accrafeed']);
const HOLE_FIELDS = ['Hole Number', 'Preset Depth', 'Rod Length'];
const HOLES = ['A', '1', 'B', '2', 'C', '3', 'D', '4'];

/** Axes : { up, down, left, right } → id de libellé ou null. */
const ax = (up, down, left, right) => ({ up, down, left, right });

export function createSim() {
  const s = {
    power: false, control: false, pompe: false, compresseur: false, eclairage: false, laser: false,
    mode: 'system', couche: { system: 'start', setup: 'feed', drill: null }, modeKey: false, tramEnable: false,
    L: { x: 0, y: 0 }, R: { x: 0, y: 0 },
    // Mise en place
    swing: -90, dump: 90, extension: 0, stabAvant: false, stabArriere: false, mastSlide: true,
    // Forage
    manual: false, accrafeed: false, lock: false, reverse: false, air: false, eau: false, makeup: false, spline: false, collar: false,
    debitEau: 44, pulldown: 50, holdback: 50, rotationVitesse: 50,
    profondeur: 0, profondeurTotale: 0, preset: 40, tiges: 0, longueurTige: 72, trou: 0, champ: 0, recul: 0, profondeurAtteinte: false,
    position: 0, cap: 0, motDePasse: [0, 0, 0, 0, 0, 0], champMdp: 0,
    estop: false, alarmes: [], historique: [], silence: false, alarmeSel: 0, vueAlarmes: 'current',
    klaxon: 0, visite: new Set(), action: null, message: null,
  };

  const msg = (texte, ton = 'info', page = null) => { s.message = { texte, ton, page, t: Date.now() }; };
  const visite = (k) => s.visite.add(k);
  const couche = () => {
    if (s.mode === 'drill') return s.couche.drill || coucheDrillDefaut();
    return s.couche[s.mode] ?? null;
  };
  const coucheDrillDefaut = () => (s.accrafeed ? 'pulldown' : s.manual ? 'pulldown-holdback' : 'slip-centralizer');

  /** Couches de la manette gauche du mode affiché. */
  function couches() {
    if (s.mode === 'system') return ['diagnostic', 'start', 'configuration', 'error', 'hole'];
    if (s.mode === 'tram') return ['tram-enable'];
    if (s.mode === 'setup') return ['outrigger', 'feed', 'stinger'];
    if (s.manual || s.accrafeed) return ['carousel-water', 'accrafeed', 'arm-clamp', s.accrafeed ? 'pulldown' : 'pulldown-holdback', 'slip-centralizer'];
    return ['carousel-wrench', 'accrafeed', 'arm-clamp', 'slip-centralizer'];
  }

  /** Fonctions de la manette droite. */
  function fonctions() {
    const c = couche();
    if (s.mode === 'system') {
      if (c === 'start') return ['control', 'compressor', 'hydraulic-pump', 'horn', 'drill-light'];
      if (c === 'diagnostic') return ['can-bus'];
      if (c === 'configuration') return []; // écran du mot de passe : aucune fonction à droite (p. 128)
      if (c === 'error') return ['silence', 'bottom-alarm', 'top-alarm', 'alarm-history', 'current-alarm', 'reset'];
      return ['reset-total-depth', 'reset-hole-depth'];
    }
    if (s.mode === 'tram') return ['laser'];
    // Deck Slide et Mast Slide seulement dans la couche Feed (p. 139) ; Stinger et Outrigger : Laser seul (p. 140).
    if (s.mode === 'setup') return couche() === 'feed' ? ['deck-slide', 'mast-slide', 'laser'] : ['laser'];
    if (s.accrafeed) return ['drill-lock', 'drill-air', 'collar-air', 'manual-drilling', 'water'];
    if (s.manual) return ['drill-lock', 'drill-air', 'reverse-drilling', 'collar-air', 'manual-drilling', 'water'];
    return ['makeup-breakout', 'drill-air', 'spline-piston', 'collar-air', 'manual-drilling', 'water'];
  }

  /** Axes des deux manettes pour l'écran affiché. */
  function axes() {
    const c = couche();
    let L = ax(null, null, null, null);
    let R = ax(null, null, null, null);
    if (s.mode === 'system') {
      if (c === 'hole') {
        L = ax('increase', 'decrease', 'scroll-left', 'scroll-right');
        R = ax('feed-forward', 'feed-reverse', 'rotation-forward', 'rotation-reverse');
      } else if (c === 'configuration') {
        L = ax(null, null, 'field-left', 'field-right');
        R = ax('value-up', 'value-down', null, null);
      }
    } else if (s.mode === 'tram') {
      L = ax(null, 'cable-reel-in', null, null);
      R = ax('tram-reverse', 'tram-forward', 'steering-left', 'steering-right');
    } else if (s.mode === 'setup') {
      if (c === 'feed') { L = ax('dump-down', 'dump-up', 'swing-clockwise', 'swing-counterclockwise'); R = ax('feed-extend', 'feed-retract', 'mast-slide-left', 'mast-slide-right'); }
      if (c === 'stinger') { L = ax('upper-stinger-out', 'upper-stinger-in', 'lower-stinger-in', 'lower-stinger-out'); R = { ...L }; }
      if (c === 'outrigger') { L = ax('front-outrigger-down', 'front-outrigger-up', null, null); R = ax('front-outrigger-down', 'front-outrigger-up', 'rear-outrigger-down', 'rear-outrigger-up'); }
    } else {
      const m = {
        'slip-centralizer': ax('slip-in', 'slip-out', 'centralizer-out', 'centralizer-in'),
        'carousel-wrench': ax('breakout-wrench-in', 'breakout-wrench-out', 'carousel-rotate-out', 'carousel-rotate-in'),
        'arm-clamp': ax('arm-in', 'arm-out', 'clamp-open', 'clamp-close'),
        'pulldown-holdback': ax('pulldown-increase', 'pulldown-decrease', 'holdback-decrease', 'holdback-increase'),
        pulldown: ax('pulldown-increase', 'pulldown-decrease', null, null),
        'carousel-water': ax('water-flow-increase', 'water-flow-decrease', 'carousel-rotate-out', 'carousel-rotate-in'),
      };
      L = m[c] || L;
      if (s.lock) R = ax(null, null, 'rotation-increase', 'rotation-decrease');
      else if (s.makeup && !s.manual && !s.accrafeed) R = ax('makeup', 'breakout', null, null);
      else R = ax('feed-forward', 'feed-reverse', 'rotation-forward', 'rotation-reverse');
    }
    // Déplacement : sans Tram Enable maintenu, les pointeurs disparaissent (p. 138).
    // Déplacement sans Tram Enable maintenu : les libellés restent, les pointeurs disparaissent (p. 138).
    return { L, R, pointeursR: !(s.mode === 'tram' && !s.tramEnable) };
  }

  /** Fonction d'un axe dévié : id de libellé ou null. */
  const fonctionAxe = (side, x, y) => {
    const tout = axes();
    if (side === 'R' && !tout.pointeursR) return []; // déplacement désactivé sans Tram Enable
    const a = tout[side];
    return [x < 0 ? a.left : x > 0 ? a.right : null, y > 0 ? a.up : y < 0 ? a.down : null].filter(Boolean);
  };

  const actif = (id) => ({
    control: s.control, compressor: s.compresseur, 'hydraulic-pump': s.pompe, 'drill-light': s.eclairage, laser: s.laser,
    'mast-slide': s.mastSlide, 'makeup-breakout': s.makeup, 'drill-air': s.air, 'manual-drilling': s.manual, water: s.eau,
    'drill-lock': s.lock, 'reverse-drilling': s.reverse, accrafeed: s.accrafeed, 'spline-piston': s.spline, 'collar-air': s.collar,
    'tram-enable': s.tramEnable, silence: s.silence && s.alarmes.length > 0, 'current-alarm': s.vueAlarmes === 'current' && couche() === 'error',
    'alarm-history': s.vueAlarmes === 'history' && couche() === 'error', horn: s.klaxon > 0,
  }[id] ?? false);

  // ------------------------------------------------------------------ alarmes
  function alarme(n, { effet = true } = {}) {
    if (s.alarmes.some((a) => a.n === n)) return;
    s.alarmes.push({ n, t: Date.now() });
    s.historique.unshift({ n, t: Date.now() });
    s.silence = false;
    if (!effet) return;
    // Effets donnés par la liste des alarmes (p. 131 à 136).
    if ([2, 8, 9, 10, 11, 12, 30, 35, 37, 38, 39, 40].includes(n)) arretTotal();
    if (n === 3) { s.eau = false; s.lock = false; }
    if ([13, 14, 15, 16].includes(n) || n === 1) { s.pompe = false; s.lock = false; }
    // « Arrête la pompe hydraulique et le moteur du compresseur » (1), « Éteint le compresseur » (4, 5, 17 à 29,
    // 41 à 43) ; sans compresseur, pas d'air de forage (p. 171).
    if ([1, 4, 5, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 41, 42, 43].includes(n)) { s.compresseur = false; s.air = false; s.lock = false; }
  }
  function arretTotal() {
    s.pompe = false; s.compresseur = false; s.lock = false; s.air = false; s.eau = false; s.tramEnable = false;
    s.L = { x: 0, y: 0 }; s.R = { x: 0, y: 0 };
  }

  // ------------------------------------------------------------------ événements
  function power() {
    s.power = !s.power;
    if (!s.power) {
      Object.assign(s, { control: false, pompe: false, compresseur: false, eclairage: false, laser: false, modeKey: false, tramEnable: false, lock: false, air: false, eau: false, manual: false, accrafeed: false, makeup: false, reverse: false });
      s.L = { x: 0, y: 0 }; s.R = { x: 0, y: 0 };
      msg('Console éteinte.', 'info', 121);
    } else {
      s.mode = 'system'; s.couche.system = 'start';
      msg('Console allumée : mode SYSTEM, couche Start (démarrage).', 'ok', 122);
      // Bouton d'arrêt d'urgence resté enfoncé pendant que la console était éteinte : l'alarme apparaît à l'allumage.
      if (s.estop) { alarme(10); msg('Console allumée, arrêt d’urgence ERIS actionné : relâcher le bouton, puis réinitialiser l’alarme (couche Error).', 'danger', 132); }
    }
    visite(s.power ? 'power-on' : 'power-off');
  }

  function estop(on) {
    if (on === s.estop) return;
    s.estop = on;
    if (on) {
      // Chaque enfoncement arrête tout, même si l'alarme 10 est encore active d'un arrêt précédent.
      arretTotal();
      if (s.power) alarme(10);
      visite('estop');
      msg('Arrêt d’urgence actionné : toutes les fonctions en cours sont arrêtées. Il reste actionné jusqu’à sa réinitialisation manuelle.', 'danger', 44);
    } else {
      msg('Bouton d’arrêt d’urgence relâché. Réinitialiser l’alarme dans la couche Error, puis redémarrer ce qui doit l’être : la réinitialisation ne redémarre pas la machine.', 'info', 46);
    }
  }

  function modeKey(on) {
    if (!s.power) return;
    s.modeKey = on;
    s.L = { x: 0, y: 0 }; // la manette gauche repart du centre, avec ou sans la touche Mode
    if (on) { msg('Touche Mode maintenue : déplacer la manette gauche vers la gauche ou la droite pour changer de mode.', 'info', 124); }
  }

  function changerMode(dir) {
    const i = MODES.indexOf(s.mode);
    const j = i + dir;
    if (j < 0 || j >= MODES.length) return;
    const cible = MODES[j];
    if (cible !== 'system' && !s.control) {
      msg('Commande inactive (voyant CONTROL gris) : les modes Déplacement, Mise en place et Forage ne peuvent pas être sélectionnés. Mode SYSTEM, couche Start : appuyer sur Control.', 'warn', 123);
      return;
    }
    s.mode = cible;
    s.tramEnable = false;
    s.lock = false; // le forage verrouillé ne continue pas hors du mode DRILL
    s.R = { x: 0, y: 0 };
    visite(cible);
    msg(`Mode ${T[cible][0]} (${T[cible][1]}).`, 'ok', T[cible][2]);
  }

  /** Manette : x, y ∈ {-1, 0, 1} (y = 1 : poussée vers l'avant). */
  function stick(side, x, y) {
    if (!s.power) { msg('La console est éteinte : interrupteur marche/arrêt.', 'warn', 121); return; }
    if (side === 'L' && s.modeKey) {
      // Un seul changement de mode par déviation : au départ du centre vers la gauche ou la droite.
      const avant = s.L.x;
      s.L = { x, y };
      if (x && x !== avant) changerMode(x);
      return;
    }
    s[side] = { x, y };
    if (!x && !y) {
      if (side === 'R' && s.lock) visite('lock-relache');
      if (side === 'R' && s.lock) msg('Manette droite relâchée : la vitesse d’avance devient automatique, la rotation revient à la vitesse du dernier verrouillage.', 'ok', 145);
      return;
    }
    const f = fonctionAxe(side, x, y);
    if (!f.length) {
      if (s.mode === 'tram' && side === 'R' && !s.tramEnable) msg('Maintenir Tram Enable : sans lui, les pointeurs disparaissent et le déplacement est désactivé.', 'warn', 138);
      else msg('Aucune fonction sur cet axe dans cette couche.', 'info');
      return;
    }
    for (const id of f) agir(id);
  }

  const hydraulique = () => {
    if (s.estop) { msg('Arrêt d’urgence actionné : aucune fonction.', 'danger', 44); return false; }
    if (!s.pompe) { msg('Pompe hydraulique arrêtée : la démarrer en mode SYSTEM, couche Start (Hydraulic Pump).', 'warn', 125); return false; }
    return true;
  };

  /** Fonction d'un axe, à la déviation de la manette (les effets continus sont dans tick). */
  function agir(id) {
    const [en, fr, page] = T[id] || [id, id, null];
    // Fonction exécutée : retenue pour les missions, annoncée à la première déviation.
    const dire = (extra = '', ton = 'ok') => {
      s.action = id;
      visite(id);
      msg(`${en} : ${fr}${extra}`, ton, page);
    };
    switch (id) {
      case 'increase': case 'decrease': {
        const d = id === 'increase' ? 1 : -1;
        if (s.champ === 0) s.trou = (s.trou + d + HOLES.length) % HOLES.length;
        if (s.champ === 1) s.preset = Math.max(1, s.preset + d);
        if (s.champ === 2) s.longueurTige = Math.max(12, s.longueurTige + d * 12);
        return dire(` (${HOLE_FIELDS[s.champ]})`);
      }
      case 'scroll-left': case 'scroll-right':
        s.champ = (s.champ + (id === 'scroll-right' ? 1 : -1) + HOLE_FIELDS.length) % HOLE_FIELDS.length;
        return dire(` : ${HOLE_FIELDS[s.champ]}`);
      case 'field-left': case 'field-right':
        s.champMdp = Math.min(5, Math.max(0, s.champMdp + (id === 'field-right' ? 1 : -1)));
        return dire(' (manette gauche, gauche/droite)');
      case 'value-up': case 'value-down':
        s.motDePasse[s.champMdp] = (s.motDePasse[s.champMdp] + (id === 'value-up' ? 1 : 9)) % 10;
        return dire(' (manette droite, haut/bas). Le mot de passe s’obtient auprès d’un concessionnaire local.');
      case 'cable-reel-in': return hydraulique() && dire();
      default: break;
    }
    if (s.mode === 'system' && couche() === 'hole') {
      // Configuration des trous : la manette droite avance le foret jusqu'au contact de la surface (p. 137).
      if (!hydraulique()) return;
      return dire(' — amener le foret au contact de la surface, puis Reset Hole Depth.');
    }
    if (!hydraulique()) return;
    if (s.mode === 'tram') return dire();
    if (s.mode === 'setup') {
      if (id === 'front-outrigger-down') s.stabAvant = true;
      if (id === 'front-outrigger-up') s.stabAvant = false;
      if (id === 'rear-outrigger-down') s.stabArriere = true;
      if (id === 'rear-outrigger-up') s.stabArriere = false;
      return dire(id.startsWith('swing') || id.startsWith('dump') ? ' — angle affiché en temps réel.' : '');
    }
    if (s.mode === 'drill') {
      if (id.startsWith('water-flow')) return dire(' — le débit s’affiche au-dessus du graphique de la manette gauche.');
      return dire();
    }
    return dire();
  }
  const clamp = (v) => Math.min(100, Math.max(0, v));

  function bouton(side, id) {
    if (!s.power) { msg('La console est éteinte : interrupteur marche/arrêt.', 'warn', 121); return; }
    const [en, fr, page] = T[id] || [id, id, null];
    visite(id);
    if (side === 'L') {
      if (id === 'tram-enable') {
        s.tramEnable = !s.tramEnable;
        if (!s.tramEnable) { s.R = { x: 0, y: 0 }; msg('Tram Enable relâché : les pointeurs disparaissent, le déplacement est désactivé.', 'info', 138); }
        else {
          msg('Tram Enable maintenu : l’axe de la manette est activé pour le déplacement. Pousser : l’unité s’éloigne ; tirer : elle vient vers vous.', 'ok', 138);
          // Manette droite déjà déviée : sa fonction s'exécute dès que l'axe est activé.
          if (s.R.x || s.R.y) for (const f of fonctionAxe('R', s.R.x, s.R.y)) agir(f);
        }
        return;
      }
      if (id === 'accrafeed') {
        s.accrafeed = !s.accrafeed;
        if (s.accrafeed) s.manual = false;
        s.couche.drill = null; s.lock = false;
        msg(s.accrafeed ? 'Accrafeed activé : la manette gauche augmente ou diminue l’abaissement ; la retenue dépend de la pression de rotation.' : 'Accrafeed désactivé.', 'ok', 147);
        return;
      }
      if (s.mode === 'drill') s.couche.drill = id;
      else s.couche[s.mode] = id;
      s.L = { x: 0, y: 0 };
      if (id === 'error') s.vueAlarmes = 'current';
      msg(`Couche ${en} (${fr}).`, 'ok', page);
      return;
    }
    // Manette droite
    if (s.estop && !['silence', 'bottom-alarm', 'top-alarm', 'alarm-history', 'current-alarm', 'reset', 'horn', 'can-bus'].includes(id)) {
      msg('Arrêt d’urgence actionné : relâcher le bouton, réinitialiser l’alarme dans la couche Error, puis redémarrer.', 'danger', 44);
      return;
    }
    switch (id) {
      case 'control':
        s.control = !s.control;
        if (!s.control) { s.lock = false; s.tramEnable = false; if (s.mode !== 'system') s.mode = 'system'; }
        return msg(s.control ? 'Commande active (CONTROL orange) : les modes Déplacement, Mise en place et Forage peuvent être sélectionnés.' : 'Commande inactive (CONTROL gris).', 'ok', 123);
      case 'hydraulic-pump':
        if (!s.pompe && s.alarmes.some((a) => a.n === 10)) return msg('Alarme « Arrêt d’urgence ERIS 1 activé » : la réinitialiser d’abord (mode SYSTEM, couche Error, Reset). Elle permet seulement de redémarrer.', 'warn', 45);
        s.pompe = !s.pompe;
        if (!s.pompe) s.lock = false;
        return msg(s.pompe ? 'Pompe hydraulique en marche : circuit hydraulique activé.' : 'Pompe hydraulique arrêtée.', 'ok', 125);
      case 'compressor':
        if (!s.compresseur && s.alarmes.some((a) => a.n === 10)) return msg('Alarme « Arrêt d’urgence ERIS 1 activé » : la réinitialiser d’abord (mode SYSTEM, couche Error, Reset). Elle permet seulement de redémarrer.', 'warn', 45);
        s.compresseur = !s.compresseur;
        if (!s.compresseur) { s.air = false; s.lock = false; }
        return msg(s.compresseur ? 'Compresseur en marche (à vide jusqu’à la sélection de l’air de forage).' : 'Compresseur arrêté.', 'ok', 171);
      case 'horn': s.klaxon = 1.2; return msg('Horn : l’avertisseur sonore retentit.', 'ok', 125);
      case 'drill-light': s.eclairage = !s.eclairage; return msg(s.eclairage ? 'Feux de la foreuse allumés.' : 'Feux de la foreuse éteints.', 'ok', 125);
      case 'laser': s.laser = !s.laser; return msg(s.laser ? 'Laser activé.' : 'Laser désactivé.', 'ok', 137);
      case 'can-bus': return msg('Diagnostic : l’état des contrôleurs VMM et des manettes est indiqué par la couleur (orange : communication correcte).', 'info', 126);
      case 'log-off': s.couche.system = 'start'; return msg('Configuration quittée.', 'info', 128);
      case 'silence':
        if (!s.alarmes.length) return msg('Aucune alarme active.', 'info', 130);
        s.silence = true; visite('silence');
        return msg('Silence : silence de l’alarme. L’alarme reste active jusqu’à sa réinitialisation.', 'ok', 130);
      case 'reset': {
        if (!s.alarmes.length) return msg('Aucune alarme active à réinitialiser.', 'info', 130);
        if (s.estop) return msg('Relâcher d’abord le bouton d’arrêt d’urgence (le tourner ou le tirer).', 'warn', 46);
        const avaitEstop = s.alarmes.some((a) => a.n === 10);
        s.alarmes = []; s.silence = false; s.alarmeSel = 0;
        visite(avaitEstop ? 'reset-estop' : 'reset');
        return msg(avaitEstop ? 'Alarme réinitialisée. La machine ne redémarre pas seule : redémarrer la pompe hydraulique et le compresseur au besoin.' : 'Alarme réinitialisée.', 'ok', avaitEstop ? 45 : 130);
      }
      case 'top-alarm': s.alarmeSel = 0; return msg('Première alarme de la liste.', 'info', 130);
      case 'bottom-alarm': s.alarmeSel = Math.max(0, (s.vueAlarmes === 'history' ? s.historique : s.alarmes).length - 1); return msg('Dernière alarme de la liste.', 'info', 130);
      case 'alarm-history': s.vueAlarmes = 'history'; s.alarmeSel = 0; return msg('Historique des alarmes.', 'info', 130);
      case 'current-alarm': s.vueAlarmes = 'current'; s.alarmeSel = 0; return msg('Alarmes actives.', 'info', 130);
      case 'reset-hole-depth': s.profondeur = 0; s.profondeurAtteinte = false; return msg('Profondeur du trou remise à zéro.', 'ok', 137);
      case 'reset-total-depth': s.profondeurTotale = 0; return msg('Profondeur totale remise à zéro.', 'ok', 137);
      case 'mast-slide': return msg('Mast Slide : la manette droite (gauche/droite) fait glisser le mât.', 'info', 139);
      case 'deck-slide': case 'spline-piston': case 'collar-air':
        if (id !== 'deck-slide') s[id === 'spline-piston' ? 'spline' : 'collar'] = !s[id === 'spline-piston' ? 'spline' : 'collar'];
        return msg(`${en} : fonction affichée à l’écran, non décrite dans les pages 121 à 147 du manuel.`, 'info', page);
      case 'makeup-breakout':
        s.makeup = !s.makeup; s.R = { x: 0, y: 0 };
        return msg(s.makeup ? 'Mise en place/Désaccouplement : pousser la manette droite visse les joints (rotation horaire rapide, avance lente) ; la tirer les dévisse (rotation antihoraire rapide, levage lent).' : 'Mise en place/Désaccouplement désactivé.', 'ok', 144);
      case 'manual-drilling':
        s.manual = !s.manual;
        if (s.manual) { s.accrafeed = false; s.makeup = false; }
        s.lock = false; s.couche.drill = null;
        return msg(s.manual ? 'Forage manuel : la couche Abaissement/Retenue (Pulldown/Holdback) est la couche par défaut de la manette gauche ; la fonction Drill Lock apparaît.' : 'Forage manuel désactivé : sous-mode par défaut (pression d’avance maximale, vitesse d’avance réglable avec la manette droite).', 'ok', 144);
      case 'reverse-drilling': s.reverse = !s.reverse; return msg(s.reverse ? 'Forage inversé sélectionné.' : 'Forage inversé désactivé.', 'ok', 141);
      case 'drill-air':
        if (!s.air && !s.compresseur) return msg('Compresseur arrêté : le démarrer en mode SYSTEM, couche Start, avant l’air de forage.', 'warn', 171);
        s.air = !s.air;
        if (!s.air) s.lock = false; // l'air et l'eau sont la condition du verrouillage (p. 145, étape 1)
        return msg(s.air ? 'Air de forage activé.' : 'Air de forage coupé.', 'ok', 145);
      case 'water':
        if (!s.eau && s.alarmes.some((a) => a.n === 3)) return msg('Alarme « Bas niveau d’eau de la mine » active : la pompe à eau est arrêtée.', 'warn', 132);
        s.eau = !s.eau;
        if (!s.eau) s.lock = false;
        return msg(s.eau ? `Eau activée : le débit revient au dernier réglage (${s.debitEau} %).` : 'Eau coupée.', 'ok', 146);
      case 'drill-lock': {
        if (s.lock) { s.lock = false; return msg('Verrouillage de la foreuse désactivé.', 'info', 145); }
        if (!s.pompe) return msg('Pompe hydraulique arrêtée.', 'warn', 125);
        if (!s.air || !s.eau) return msg('Étape 1 : activer d’abord l’alimentation en air (Drill Air) et en eau (Water) de la foreuse.', 'warn', 145);
        if (!(s.R.x < 0 && s.R.y > 0)) return msg('Appliquer et maintenir la rotation vers l’avant ET l’avance vers l’avant avec la manette droite, puis appuyer sur Drill Lock.', 'warn', 145);
        s.lock = true; s.profondeurAtteinte = false;
        return msg('Verrouillage de la foreuse activé : relâcher la manette droite. La vitesse d’avance devient automatique (temps accéléré dans le simulateur).', 'ok', 145);
      }
      default:
        return msg(`${en} : ${fr}.`, 'info', page);
    }
  }

  /** Avance du temps (dt en secondes) : axes maintenus, forage, recul après la profondeur prédéfinie. */
  function tick(dt) {
    if (s.klaxon > 0) s.klaxon = Math.max(0, s.klaxon - dt);
    if (!s.power) return;
    if (s.recul > 0) s.recul = Math.max(0, s.recul - dt);
    const ok = s.pompe && !s.estop;
    // Axes maintenus : effets continus.
    for (const side of ['L', 'R']) {
      const { x, y } = s[side];
      if ((!x && !y) || (side === 'L' && s.modeKey)) continue;
      for (const id of fonctionAxe(side, x, y)) {
        if (!ok) continue;
        if (id === 'swing-clockwise') s.swing = Math.max(-90, s.swing - 15 * dt);
        if (id === 'swing-counterclockwise') s.swing = Math.min(90, s.swing + 15 * dt);
        if (id === 'dump-down') s.dump = Math.max(-90, s.dump - 15 * dt);
        if (id === 'dump-up') s.dump = Math.min(90, s.dump + 15 * dt);
        if (id === 'feed-extend') s.extension = Math.min(100, s.extension + 40 * dt);
        if (id === 'feed-retract') s.extension = Math.max(0, s.extension - 40 * dt);
        if (id === 'tram-reverse') s.position = Math.min(100, s.position + 25 * dt);
        if (id === 'tram-forward') s.position = Math.max(-100, s.position - 25 * dt);
        if (id === 'steering-left') s.cap = Math.max(-30, s.cap - 20 * dt);
        if (id === 'steering-right') s.cap = Math.min(30, s.cap + 20 * dt);
        const pas = (id.endsWith('increase') ? 1 : -1) * 20 * dt;
        if (id.startsWith('water-flow')) s.debitEau = clamp(s.debitEau + pas / 2);
        if (id.startsWith('pulldown-')) s.pulldown = clamp(s.pulldown + pas);
        if (id.startsWith('holdback-')) s.holdback = clamp(s.holdback + pas);
        if (id === 'rotation-increase' || id === 'rotation-decrease') s.rotationVitesse = clamp(s.rotationVitesse + pas);
      }
    }
    // Forage verrouillé : l'avance est automatique (temps accéléré : environ 5 pi/s pour l'exercice).
    if (s.mode === 'drill' && s.lock && ok) {
      const d = 5 * dt * (0.5 + s.rotationVitesse / 100);
      s.profondeur += d; s.profondeurTotale += d;
      s.tiges = Math.floor(s.profondeur / (s.longueurTige / 12));
      if (s.profondeur >= s.preset) {
        s.profondeur = s.preset; s.lock = false; s.recul = 2; s.profondeurAtteinte = true; s.R = { x: 0, y: 0 };
        visite('profondeur');
        msg('Profondeur de trou prédéfinie atteinte : le forage s’arrête automatiquement et l’avance est ramenée en arrière pendant deux secondes.', 'ok', 137);
      }
    }
  }

  /** Fonction (ou couche) du bouton physique `pos` de la manette `side` dans l'écran affiché, ou null. */
  function fonctionBouton(side, pos) {
    const ids = side === 'L' ? couches() : fonctions();
    return ids.find((id) => BOUTON[side][id] === pos) || null;
  }

  /** Appui sur un bouton physique de manette. */
  function appuyer(side, pos) {
    if (!s.power) { msg('La console est éteinte : interrupteur marche/arrêt.', 'warn', 121); return; }
    if (side === 'L' && pos === 'C') { modeKey(!s.modeKey); return; }
    const id = fonctionBouton(side, pos);
    if (!id) { msg(`Ce bouton (${POSITION[pos]}) n’a pas de fonction dans cet écran.`, 'info', 124); return; }
    bouton(side, id);
  }

  /** État résumé pour les missions. */
  function etat() {
    return {
      power: s.power, control: s.control, pompe: s.pompe, compresseur: s.compresseur, mode: s.mode, couche: couche(), modeKey: s.modeKey,
      tramEnable: s.tramEnable, manual: s.manual, air: s.air, eau: s.eau, lock: s.lock, estop: s.estop, silence: s.silence,
      alarmes: s.alarmes.length > 0, action: s.action, profondeurAtteinte: s.profondeurAtteinte,
      rotAvant: s.mode === 'drill' && s.R.x < 0, avanceAvant: s.mode === 'drill' && s.R.y > 0, Rcentre: !s.R.x && !s.R.y,
    };
  }

  /** Remet le simulateur dans un état de départ : « eteint » ou « pret » (console allumée, contrôle pris, pompe et compresseur en marche). */
  function preparer(depart = 'eteint') {
    const neuf = createSim();
    for (const k of Object.keys(s)) delete s[k];
    Object.assign(s, neuf.s);
    if (depart === 'pret') {
      Object.assign(s, { power: true, control: true, pompe: true, compresseur: true });
      msg('Console prête : contrôle pris, pompe hydraulique et compresseur en marche.', 'info', 125);
    }
  }

  return { s, T, couche, couches, fonctions, axes, actif, power, estop, modeKey, stick, bouton, appuyer, fonctionBouton, tick, etat, alarme, preparer, holes: HOLES, holeFields: HOLE_FIELDS, bascule: BASCULE };
}
