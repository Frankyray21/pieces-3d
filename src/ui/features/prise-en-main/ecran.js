// Écran ERIS du simulateur (HTML) : disposition des copies d'écran du manuel (p. 122 à 147) — heure et modes en
// haut, voyants à droite, couches de la manette gauche en bas à gauche, fonctions de la manette droite en bas à
// droite, fonctions des axes autour des deux manettes dessinées, alarmes qui défilent en bas.
import { T, MODES } from './eris.js';

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** Libellé court en français (première partie de la traduction). */
const COURT = {
  'tram-reverse': 'Déplacement arrière', 'tram-forward': 'Déplacement avant', control: 'Commande', 'tram-enable': 'Activation du déplacement',
  'field-left': 'Champ', 'field-right': 'Champ', 'value-up': 'Valeur +', 'value-down': 'Valeur −',
};
export const court = (id) => COURT[id] || String(T[id]?.[1] || id).split(/ [:(—]/)[0];
const lib = (id, fr) => esc(fr ? court(id) : T[id]?.[0] || id);

/** Manette dessinée (contour, comme à l'écran) avec ses quatre fonctions ; flèches seulement sur les axes actifs. */
function manette(axes, pos, fr, cls) {
  const { up, down, left, right } = axes;
  const on = (k) => pos && ((k === 'up' && pos.y > 0) || (k === 'down' && pos.y < 0) || (k === 'left' && pos.x < 0) || (k === 'right' && pos.x > 0));
  const fl = (k, id) => (id ? `<span class="er-ar er-a-${k}${on(k) ? ' on' : ''}" aria-hidden="true"></span><span class="er-lb er-l-${k}${on(k) ? ' on' : ''}">${lib(id, fr)}</span>` : '');
  return `<div class="er-stick ${cls}">
    <svg viewBox="0 0 60 100" class="er-stick-svg" aria-hidden="true"><path d="M22 8c6-6 18-4 20 4l-2 10c4 2 6 6 4 10l-6 30h6v4H16v-4h6l-6-38c-1-6 1-12 6-16Z" /><rect x="12" y="70" width="36" height="5" rx="1"/><rect x="10" y="78" width="40" height="5" rx="1"/><rect x="12" y="86" width="36" height="5" rx="1"/><rect x="8" y="94" width="44" height="5" rx="1"/></svg>
    ${fl('up', up)}${fl('down', down)}${fl('left', left)}${fl('right', right)}
  </div>`;
}

/** Cadran (indications du simulateur, sans valeurs chiffrées). */
function cadran(v, label, unite) {
  const a = -120 + 240 * Math.min(1, Math.max(0, v));
  return `<div class="er-g"><svg viewBox="0 0 100 70" aria-hidden="true"><path class="er-g-arc" d="M14 62A40 40 0 1 1 86 62"/><line class="er-g-n" x1="50" y1="50" x2="50" y2="16" transform="rotate(${a.toFixed(1)} 50 50)"/></svg><span class="er-g-u">${esc(unite)}</span><span class="er-g-l">${esc(label)}</span></div>`;
}

function angle(v, label) {
  return `<div class="er-dial"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="er-dial-c"/><line x1="50" y1="50" x2="50" y2="14" class="er-dial-n" transform="rotate(${(-v).toFixed(1)} 50 50)"/><circle cx="50" cy="50" r="3"/></svg><span>${esc(label)} : <b>${v.toFixed(1)}</b> DEG</span></div>`;
}

/**
 * HTML de l'écran. sim : createSim() ; opts.fr : libellés traduits ; opts.alarmes : liste des alarmes du manuel
 * (n → { nom }).
 */
export function ecran(sim, { fr = false, alarmes = new Map(), img = (p) => p } = {}) {
  const s = sim.s;
  if (!s.power) return '<div class="er er-off"><span>Console éteinte</span></div>';
  const c = sim.couche();
  const { L, R } = sim.axes();
  const d = new Date();
  const heure = `${String(d.getHours()).padStart(2, '0')} : ${String(d.getMinutes()).padStart(2, '0')}`;
  const liste = (ids, side) => ids.map((id) => {
    const on = side === 'L' ? (id === c || sim.actif(id)) : sim.actif(id);
    return `<li class="${on ? 'on' : ''}">${lib(id, fr)}</li>`;
  }).join('');
  const voyant = (n, alt) => `<img src="${esc(img(`prise-en-main/voyant-${n}.webp`))}" alt="${esc(alt)}">`;
  let centre = '';
  let manettes = true;

  if (s.mode === 'system') {
    manettes = c === 'hole' || c === 'configuration';
    if (c === 'start') {
      manettes = false;
      centre = `<div class="er-start"><span class="er-box${s.pompe ? ' on' : ''}">${fr ? 'Pompe hydraulique' : 'Hydraulic Pump'}</span><span class="er-box${s.compresseur ? ' on' : ''}">${fr ? 'Compresseur' : 'Compressor'}</span></div>`;
    } else if (c === 'diagnostic') {
      manettes = false;
      const vmm = (n) => `<span class="er-vmm">VMM ${n}</span>`;
      centre = `<div class="er-diag">
        <div><b>Mast Control Panel</b>${vmm(13)}</div>
        <div><b>Front Control Panel</b>${vmm(10)}${vmm(12)}${vmm(7)}${vmm(8)}${vmm(9)}</div>
        <div><b>Rear Control Panel</b>${vmm(6)}${vmm(5)}</div>
        <div><b>Air Module Control Panel</b>${vmm(3)}</div>
        <div><b>Main Power Panel</b>${vmm(2)}${vmm(1)}</div></div>`;
    } else if (c === 'configuration') {
      manettes = false;
      centre = `<div class="er-pwd"><p>${fr ? 'Manette gauche gauche/droite : choisir le champ.' : 'Use left hand joystick left/right to select field.'}<br>${fr ? 'Manette droite haut/bas : changer la valeur.' : 'Use right hand joystick up/down to change value.'}</p>
        <div>${s.motDePasse.map((v, i) => `<span class="${i === s.champMdp ? 'on' : ''}">${v}</span>`).join('')}</div></div>`;
    } else if (c === 'error') {
      manettes = false;
      const src = s.vueAlarmes === 'history' ? s.historique : s.alarmes;
      centre = `<div class="er-alarms"><b>${s.vueAlarmes === 'history' ? (fr ? 'Historique des alarmes' : 'Alarm History') : (fr ? 'Alarmes actives' : 'Active Alarms')}</b>
        <ol>${src.map((a, i) => `<li class="${i === s.alarmeSel ? 'sel' : ''}">${a.n}. ${esc(alarmes.get(a.n)?.nom || '')}</li>`).join('') || `<li class="none">${fr ? 'Aucune alarme' : '—'}</li>`}</ol></div>`;
    } else {
      centre = `<div class="er-hole">
        <div class="er-col"><i>Actual Hole Depth</i><b>${s.profondeur.toFixed(2)} ft</b><i>Total Drill Depth</i><b>${s.profondeurTotale.toFixed(1)} ft</b></div>
        <div class="er-fields">
          <span class="${s.champ === 0 ? 'sel' : ''}"><i>HOLE NUMBER</i><b>${sim.holes.map((h, i) => `<u class="${i === s.trou ? 'on' : ''}">${h}</u>`).join(' ')}</b></span>
          <span class="${s.champ === 1 ? 'sel' : ''}"><i>PRESET DEPTH</i><b>${s.preset.toFixed(1)} ft</b></span>
          <span class="${s.champ === 2 ? 'sel' : ''}"><i>ROD LENGTH</i><b>${s.longueurTige.toFixed(4)} In</b></span>
          <span><i>RODS IN HOLE</i><b>${s.tiges}</b></span>
        </div></div>`;
    }
  } else if (s.mode === 'tram') {
    const relevés = !s.stabAvant && !s.stabArriere;
    centre = `<div class="er-tram">
      <div class="er-carrier" style="transform:translateY(${(-s.position * 0.05).toFixed(2)}cqw) rotate(${s.cap.toFixed(1)}deg)"><i>Rear</i><span></span><span></span><span></span><i>Front</i><em class="l">Left</em><em class="r">Right</em></div>
      ${relevés ? '<span class="er-pill">Outrigger Up</span>' : ''}</div>`;
  } else if (s.mode === 'setup') {
    centre = `<div class="er-dials">${angle(s.swing, 'Swing')}${angle(s.dump, 'Dump')}</div>`;
  } else {
    const tourne = s.lock || (s.R.x !== 0 && !s.makeup);
    const g = [
      cadran(s.lock || s.R.y > 0 ? s.pulldown / 100 : 0.02, 'Pulldown', 'PSI'),
      cadran(s.lock || s.R.y < 0 ? s.holdback / 100 : 0.02, 'Holdback', 'PSI'),
      cadran(tourne ? 0.3 + s.rotationVitesse / 250 : 0.02, 'Rotation', 'PSI'),
      cadran(s.air ? 0.55 : 0.02, 'Drill Air', 'PSI'),
      cadran(tourne ? s.rotationVitesse / 100 : 0.02, 'Rotation', 'RPM'),
    ].join('');
    const taux = s.lock ? (5 * (0.5 + s.rotationVitesse / 100) * 60).toFixed(2) : '0.00';
    centre = `<div class="er-drill">
      <div class="er-col"><i>Hole Number</i><b>A1B2C3D4</b><i>Preset Hole Depth</i><b>${s.preset.toFixed(1)} ft</b><i>Actual Hole Depth</i><b>${s.profondeur.toFixed(2)} ft</b><i>Penetration Rate</i><b>${taux} ft/min</b><i>Rods In Hole</i><b>${s.tiges}</b></div>
      <div class="er-gauges">${g}</div>
      <div class="er-stages"><span>STAGE 1</span><span>STAGE 2</span></div>
      ${c === 'carousel-water' ? `<div class="er-water">Water Flow <b>${Math.round(s.debitEau)} %</b></div>` : ''}
      ${s.recul > 0 ? '<div class="er-note">Preset Hole Depth Reached</div>' : ''}
    </div>`;
  }

  const ticker = s.alarmes.length && !(s.mode === 'system' && c === 'error')
    ? `<div class="er-ticker${s.silence ? '' : ' blink'}">⚠ ${s.alarmes.map((a) => `${a.n}. ${esc(alarmes.get(a.n)?.nom || '')}`).join(' · ')}</div>` : '';
  const ctrl = s.control ? 11 : 10;
  return `<div class="er" data-mode="${s.mode}">
    <div class="er-top"><span class="er-clock">${heure}</span><span class="er-date">${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      <span class="er-modes">${MODES.map((m) => `<span class="${m === s.mode ? 'on' : ''}">${fr ? esc(T[m][1]) : T[m][0]}</span>`).join('')}</span></div>
    <div class="er-status">${voyant(1, 'CANBUS : communication correcte')}${s.mode === 'drill' ? '' : voyant(8, 'DRILL : forage sélectionné')}${voyant(ctrl, s.control ? 'CONTROL : commande active' : 'CONTROL : commande inactive')}</div>
    <div class="er-centre">${centre}</div>
    ${manettes ? `<div class="er-sticks">${manette(L, s.L, fr, 'g')}${manette(R, s.R, fr, 'd')}</div>` : ''}
    <ul class="er-list er-left">${liste(sim.couches(), 'L')}</ul>
    <ul class="er-list er-right">${liste(sim.fonctions(), 'R')}</ul>
    ${s.klaxon > 0 ? '<div class="er-horn">HORN</div>' : ''}
    ${ticker}
  </div>`;
}
