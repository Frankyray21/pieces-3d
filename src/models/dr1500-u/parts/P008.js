// P008 — Panneaux du groupe hydraulique (page 8, 12 repères). Posé à l'identité par P007 (ligne « p. 8 ») :
// même repère local (GP dans _groupes.js : X vers le bout des pompes et du réservoir, Z vers le flanc de la boîte
// électrique). Tôle de 3 mm [estimé], rouges comme le cadre (rouge Machines Roger, demande du client ; le manuel est en noir et blanc).
// Disposition relevée sur la vue éclatée de la page 8 (chaque panneau s'écarte de la face qu'il ferme) :
//   bout −X (moteur)      : 1 cache moteur (bas, rebord plié en haut), 2 côté plug (fenêtre de la prise, éclair) ;
//   flanc −Z (coolers)    : 5 porte gauche (bout moteur), 4 hood cooler #1 (en Γ : jambe à ouïes devant le double
//                           cooler, bras le long du haut), 3 hood cooler #2 (sous le bras, petite grille en bas) ;
//   dessus                : 6 tôle hood dessus (bout moteur, bords roulés sur les arceaux), 7 hood filtreur réduit
//                           (bande −Z au-dessus du filtre), 8 hood réservoir diesel (bande +Z jusqu'au bout +X,
//                           poignée encastrée) ; entre 7 et 8, au-dessus de la valve directionnelle, une ouverture ;
//   bout +X (« bulkhead ») : 9 haut (éclair, encoche), 10 bas (fenêtre) ;
//   flanc +Z              : 12 porte droite (entre la boîte électrique et le réservoir), 11 côté jauge (fente de la
//                           jauge du réservoir).
// Cotes : appuis sur le cadre (GP) ; découpes mesurées sur la page 8 [mesure, ±3 cm].
import { GP, slab, bent, arc, rect, rrect, perforee, poignee, charniere, eclair } from './_groupes.js';

const { x1, z1, H, tr, rb, e } = GP;
const XF = x1 + e / 2, ZF = z1 + e / 2; // plans des panneaux d'extrémité et de flanc
const YS = 0.99; // haut des panneaux de flanc, sous le bord roulé des hoods [mesure]
const YB = 0.1; // bas des panneaux (dessus des patins)

export default function P008(api) {
  const S = api.S, { at, group, box, cyl, merged } = S;
  const mat = 'red';

  // Têtes de vis de fixation (dômes) le long d'un contour, dans le plan local de la tôle (face +z).
  const vis = (pts) => merged(pts.map(([u, v]) => at(cyl(0.007, 0.004, 'steel', { axis: 'z', seg: 10 }), [u, v, e / 2 + 0.002])), 'steel');
  const bord = (x0, y0, x1_, y1, n = 3) => {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const u = x0 + 0.03 + ((x1_ - x0 - 0.06) * i) / n;
      p.push([u, y0 + 0.025], [u, y1 - 0.025]);
    }
    return p;
  };
  // Pose d'une tôle dessinée dans le plan local (u, v), face extérieure vers +z local :
  //   flanc(+1) : u = x ; flanc(−1) (tourné de 180°) : u = −x ; bout(−1) (−90° autour de Y) : u = z ;
  //   bout(+1) (+90°) : u = −z. On dessine en coordonnées monde et on retourne u avec U(−1) quand il le faut.
  const flanc = (s, obj) => at(obj, [0, 0, s * ZF], s < 0 ? [0, Math.PI, 0] : null);
  const bout = (s, obj) => at(obj, [s * XF, 0, 0], [0, s * Math.PI / 2, 0]);
  const U = (s, pts) => pts.map(([u, v]) => [s * u, v]);
  const UH = (s, hs) => hs.map((h) => (typeof h[0] === 'number' ? [s * h[0], h[1], h[2]] : U(s, h)));

  // ------------------------------------------------------------------ bout −X (moteur)
  // 1 — Cache moteur PA721 : bande basse sur toute la largeur, rebord plié vers l'extérieur en haut.
  {
    const o = [[-z1, YB], [z1, YB], [z1, 0.36], [-z1, 0.36]];
    api.part('1', bout(-1, group(
      slab(api, U(1, o), [], e, mat),
      at(box(2 * z1 - 0.06, 0.012, 0.025, mat), [0, 0.355, 0.0125]),
      vis(bord(-z1, YB, z1, 0.36, 4)),
    )), [-0.6, -0.1, 0]);
  }
  // 2 — PL côté plug PP7169 : du haut du cache moteur au haut de l'arceau, coins du haut arrondis comme l'arceau,
  // fenêtre de la prise (face −X de la boîte électrique), encoche en bas côté +Z, éclair de danger.
  {
    const R = rb + tr;
    const o = [[-z1, 0.36], [0.3, 0.36], [0.3, 0.46], [z1, 0.46], ...arc(z1 - R, H - R, R, 0, Math.PI / 2, 8), ...arc(-z1 + R, H - R, R, Math.PI / 2, Math.PI, 8)];
    api.part('2', bout(-1, group(
      slab(api, o, [rect(0.46, 0.88, 0.2, 0.16)], e, mat),
      at(slab(api, eclair(-0.05, 0.66, 0.24), [], 0.001, 'black'), [0, 0, e / 2 + 0.0005]),
      vis([...bord(-z1, 0.46, z1, H - 0.1, 4).filter(([u, v]) => v < 1.0 || Math.abs(u) < 0.4)]),
    )), [-0.6, 0.15, 0]);
  }

  // ------------------------------------------------------------------ flanc −Z (coolers)
  const XD = -0.74; // joint porte gauche / hood cooler #1 (poteau x −0,75)
  // 5 — Porte gauche PA722 : coin haut côté moteur arrondi, poignée côté moteur, charnières côté +X (page 8).
  {
    const o = rrect(-x1, YB + 0.02, XD, YS, [0, 0, 0, 0.1]);
    api.part('5', flanc(-1, group(
      slab(api, U(-1, o), [], e, mat),
      at(poignee(api, 0.1, 0.035), [-(-x1 + 0.06), 0.55, e / 2], [0, 0, Math.PI / 2]),
      at(cyl(0.012, 0.01, 'black', { axis: 'z', seg: 14 }), [-(-x1 + 0.06), 0.45, e / 2 + 0.005]),
      ...[0.3, 0.8].map((y) => at(charniere(api, 0.1), [-(XD - 0.012), y, e / 2])),
    )), [0, 0, -1.15]);
  }
  // 4 — Hood cooler #1 PA719 : tôle en Γ, jambe à ouïes carrées devant le double cooler (x −0,74 → −0,15),
  // bras le long du haut jusqu'au bout +X ; congé intérieur r 0,1.
  {
    const xm = GP.xMid, ya = 0.62, r = 0.1;
    const o = [[XD, YB + 0.02], [xm, YB + 0.02], [xm, ya - r], ...arc(xm + r, ya - r, r, Math.PI, Math.PI / 2, 6), [x1, ya], [x1, YS], [XD, YS]];
    api.part('4', flanc(-1, group(
      perforee(api, U(-1, o), [-xm + 0.03, 0.18, -XD - 0.03, 0.95], 0.022, 0.013, e, mat),
      vis(bord(XD, YB + 0.02, xm, YS, 2).map(([u, v]) => [-u, v])),
      vis([0.1, 0.45, 0.8, 1.15].map((x) => [-x, YS - 0.025])),
    )), [0, 0.05, -0.85]);
  }
  // 3 — Hood cooler #2 PA720 : sous le bras du #1, coin haut côté moteur arrondi (épouse le congé), petite grille
  // d'ouïes en bas côté moteur (page 8).
  {
    const xm = GP.xMid, ya = 0.62;
    const o = rrect(xm, YB, x1, ya, [0, 0, 0, 0.1]);
    api.part('3', flanc(-1, group(
      perforee(api, U(-1, o), [-(xm + 0.2), 0.14, -(xm + 0.03), 0.4], 0.022, 0.013, e, mat),
      vis(bord(xm, YB, x1, ya, 4).map(([u, v]) => [-u, v])),
    )), [0, 0, -0.6]);
  }

  // ------------------------------------------------------------------ dessus
  // Section des hoods (plan z, y) : dessus plat sur les arceaux et les longerons, bords roulés au rayon de l'arceau
  // (rb + tr) jusqu'à 6 cm sous la fin du cintrage. bent() extrude selon z local : on tourne de +90° autour de Y
  // (u local → −z monde), d'où u = −z.
  const R = rb + tr + e / 2, yc = H - tr - rb, zc = GP.za - rb;
  const coteM = [[-ZF, yc - 0.06], ...arc(-zc, yc, R, Math.PI, Math.PI / 2, 10)]; // bord roulé −Z
  const coteP = [...arc(zc, yc, R, Math.PI / 2, 0, 10), [ZF, yc - 0.06]]; // bord roulé +Z
  const hood = (line, xa, xb) => at(bent(api, line.map(([z, y]) => [-z, y]), e, xb - xa, mat), [(xa + xb) / 2, 0, 0], [0, Math.PI / 2, 0]);
  const top = H + e / 2, xm = GP.xMid, zj = -0.12; // joint des hoods 7 et 8 (au-dessus du filtre)
  const visDessus = (xa, xb, za, zb) => merged([xa + 0.03, xb - 0.03].flatMap((x) => [za + 0.04, zb - 0.04].map((z) => at(cyl(0.007, 0.004, 'steel', { seg: 10 }), [x, top + e / 2 + 0.002, z]))), 'steel');
  // 6 — Tôle hood dessus PP7112 : bout moteur jusqu'à l'arceau du milieu, les deux bords roulés.
  api.part('6', group(hood([...coteM, ...coteP], -x1, xm + 0.02), visDessus(-x1, xm, -zc, zc)), [0, 0.75, 0]);
  // 7 — Hood filtreur réduit PP7111 : bande −Z au-dessus du filtre de pression, de l'arceau du milieu à x 0,45.
  api.part('7', group(hood([...coteM, [zj, top]], xm + 0.02, 0.45), visDessus(xm + 0.02, 0.45, -zc, zj)), [0, 0.95, -0.25]);
  // 8 — Hood réservoir diesel PP7110 : bande +Z jusqu'au bout +X, bord roulé +Z, poignée encastrée près du bout.
  api.part('8', group(
    hood([[zj, top], ...coteP], xm + 0.02, x1),
    visDessus(xm + 0.02, x1, zj, zc),
    at(box(0.14, 0.008, 0.035, 'darkSteel', { r: 0.004 }), [x1 - 0.12, top + 0.004, zc - 0.02]),
  ), [0, 0.85, 0.1]);

  // ------------------------------------------------------------------ bout +X (bulkhead)
  // 9 — PL côté bulkhead haut PP7177 : coins du haut arrondis, encoche au coin −Z du haut, éclair.
  {
    const Rr = rb + tr;
    const o = [[-z1, 0.62], [z1, 0.62], ...arc(z1 - Rr, H - Rr, Rr, 0, Math.PI / 2, 8), [-0.43, H], [-0.43, 1.04], [-z1, 1.04]];
    api.part('9', bout(1, group(
      slab(api, U(-1, o), [], e, mat),
      at(slab(api, eclair(-0.22, 0.84, 0.22), [], 0.001, 'black'), [0, 0, e / 2 + 0.0005]),
      vis(bord(-z1, 0.62, z1, 1.04, 4).map(([u, v]) => [-u, v])),
    )), [0.7, 0.15, 0]);
  }
  // 10 — PL côté bulkhead bas PP7178 : fenêtre rectangulaire côté −Z (page 8).
  {
    const o = [[-z1, YB], [z1, YB], [z1, 0.62], [-z1, 0.62]];
    api.part('10', bout(1, group(
      slab(api, U(-1, o), [U(-1, rect(-0.42, 0.36, 0.18, 0.34))], e, mat),
      vis(bord(-z1, YB, z1, 0.62, 4)),
    )), [0.7, -0.05, 0]);
  }

  // ------------------------------------------------------------------ flanc +Z
  // 12 — Porte droite PA723 : entre les poteaux x −0,28 et 0,42 (après la boîte électrique), coin haut côté −X
  // arrondi, charnières côté +X, poignée côté −X (page 8).
  {
    const xa = -0.29, xb = 0.43;
    api.part('12', flanc(1, group(
      slab(api, rrect(xa, YB + 0.02, xb, YS, [0, 0, 0, 0.08]), [], e, mat),
      at(poignee(api, 0.1, 0.035), [xa + 0.06, 0.55, e / 2], [0, 0, Math.PI / 2]),
      at(cyl(0.012, 0.01, 'black', { axis: 'z', seg: 14 }), [xa + 0.06, 0.45, e / 2 + 0.005]),
      ...[0.3, 0.8].map((y) => at(charniere(api, 0.1), [xb - 0.012, y, e / 2])),
    )), [0, 0, 1.1]);
  }
  // 11 — PL côté gauge rés. hyd. PP7172 : du poteau x 0,42 au bout +X, fente verticale devant la jauge de niveau du
  // réservoir (x 0,62), coin haut côté −X arrondi.
  api.part('11', flanc(1, group(
    slab(api, rrect(0.43, YB, x1, YS, [0, 0, 0, 0.1]), [rect(0.62, 0.84, 0.06, 0.26)], e, mat),
    vis(bord(0.43, YB, x1, YS, 3)),
  )), [0, 0.15, 0.6]);

  return { view: { dir: [-0.85, 0.55, 0.75] } };
}
