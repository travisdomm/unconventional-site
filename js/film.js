/* ==========================================================================
   Unconventional — the intro film, version 2 (PREVIEW: preview.html only).
   From people to reality. The live home page still runs js/intro.js.

   Rendered live in a <canvas>, in four acts:
     1. People   Two people meet. A team gathers round a table. Their sparks
                 gather into a small crystal (the idea seed), which bursts into
                 a hologram of the plan.
     2. Concept  The camera dives into the hologram; it lands as a site plan
                 on a CAD screen, which dimensions and labels itself.
     3. Build    The screen opens and a mega stage assembles itself part by
                 part, colour-coded like a CAD build sequence (the owner's
                 reference video): a ground-support spine, five more towers, a
                 roof built at grade with its lighting pre-rigged, lifted on
                 hoists; the deck; the halo module built spine-first in a
                 front elevation (drum swept in arcs, cross-bars, inner ring,
                 round LED, the idea seed again as an 11 m core); wings, IMAG,
                 a 160 m arch, a panoramic band and ribbon, flown PA, delay
                 masts, FOH, while temporary cranes come and go. Then the whole
                 stage lifts apart into labelled layers and slams home.
     4. Reality  It powers up: LED, beams, lasers, flames, fireworks, a crowd,
                 the sparks back as drones, and the team at the mixing desk
                 watching what they started. Then the owner's event photos
                 (when added) and the title card.
   Stage ideas are borrowed from festival main stages and keynote rooms in
   general (scale, ground-support roofs, IMAG, wings, delay masts, a ribbon
   screen); nothing is copied from any one show, and nothing is named.

   Inputs (content/media.js): intro-drawing (shown on the CAD screen) and
   intro-photo-1…4 (the last act). Motion stops for "Pause motion" and
   prefers-reduced-motion (a finished frame is held). ?film=21.5 on the URL
   starts the film at that second. The Skip button jumps to the finished stage.
   Every structure here is original: no names, logos or set pieces of any
   real festival, brand or show.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var section = document.querySelector('[data-intro]');
  var canvas = section ? section.querySelector('[data-intro-canvas]') : null;
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var slots = window.MEDIA_SLOTS || {};
  var replayBtn = section.querySelector('[data-intro-replay]');
  var skipBtn = section.querySelector('[data-intro-skip]');
  var progressEl = section.querySelector('[data-intro-progress]');
  var motionToggle = document.querySelector('[data-motion-toggle]');

  /* ---- Palette: the site's own tokens (css/styles.css) ------------------ */
  var BG = '#0b0b0c';
  var INK = [244, 241, 234], MUTED = [168, 164, 154], LIME = [216, 255, 61];
  var TEAL = [20, 184, 162], VIOLET = [124, 57, 239], WARM = [255, 222, 186], AMBER = [255, 156, 58];
  var VIOLET_LINE = [167, 130, 255];   // brand violet, lifted so a 1 px line still reads on near-black
  var MONO = '"Cascadia Code", "SF Mono", Menlo, Consolas, ui-monospace, monospace';
  var DEG = Math.PI / 180;

  /* ---- Timeline, in seconds --------------------------------------------- */
  var T = {
    floor: [0.0, 1.3],     // the floor grid fades up
    shake: [2.6, 3.8],     // two people meet and shake hands
    ripple: [2.9, 4.4],    // the handshake ripples across the floor
    table: [4.3, 5.3],     // a table rises where they met
    spark: [6.3, 9.4],     // ideas spark above the team and fly up
    holo: [6.8, 9.9],      // the plan draws itself in the air
    dive: [9.3, 11.0],     // the camera dives into the plan
    close: [10.0, 11.0],   // the frame closes down into a CAD window
    plot: [11.0, 13.3],    // dimensions and labels
    lift: [13.3, 16.1],    // the camera lifts off the plan
    open: [13.3, 14.9],    // the window opens out to the full frame
    roof: [19.7, 21.9],    // the roof goes up on its hoists
    burst: 7.6,            // the idea seed bursts into the plan
    explode: [29.7, 30.3, 30.6, 31.0],   // the finished stage lifts apart into layers, holds, slams home
    power: [31.2, 33.4],   // everything comes alive
    end: 34.2,             // the title card
    photos: 36.6,          // the real photos, when provided
    still: 35.4            // the frame held when motion is paused, and where Skip lands
  };
  function P0(dt) { return T.power[0] + dt; }   // a moment in the power-up
  var SWITCH = 11.0;       // before: the people's world; after: the stage's (same picture at the switch)

  /* ---- Small maths ------------------------------------------------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function span(t, r) { return clamp((t - r[0]) / (r[1] - r[0]), 0, 1); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function outCubic(t) { var u = 1 - t; return 1 - u * u * u; }
  function outBack(t) { var c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  // The same, scaled by s, for the hot paths: colour strings are cached (up to a fixed size) instead of rebuilt every frame.
  var RGBA = new Map();
  function rgbaS(c, s, a) {
    var r = Math.min(255, Math.round(c[0] * s)), g = Math.min(255, Math.round(c[1] * s)), b = Math.min(255, Math.round(c[2] * s));
    var ai = Math.round(clamp(a, 0, 1) * 100), key = ((r * 256 + g) * 256 + b) * 101 + ai, str = RGBA.get(key);
    if (str === undefined) { str = 'rgba(' + r + ',' + g + ',' + b + ',' + (ai / 100) + ')'; if (RGBA.size < 30000) RGBA.set(key, str); }
    return str;
  }
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function scale(c, s) { return [Math.round(clamp(c[0] * s, 0, 255)), Math.round(clamp(c[1] * s, 0, 255)), Math.round(clamp(c[2] * s, 0, 255))]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rotAxis(v, k, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
  }
  function G(x, z) { return [x, 0, z]; }
  var seed = 20260925;
  function rnd() {   // deterministic, so every replay and every ?film= frame is identical
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /* ==========================================================================
     The stage, in metres. Stage centre is the origin, y is up, the audience
     is at +z, upstage at -z. Original design; it borrows the scale and the
     vocabulary of festival main stages and corporate keynote rooms: a vast
     ground-support roof, side IMAG, a 36 m LED wall with a halo, radiating
     wings on scaffold, a thrust to a round B-stage, flown PA, delays, FOH.
     ========================================================================== */
  var TOWER_X = 24, TRIM = 24, RISE = 7;
  var TOWER_Z = [5, -4.5, -14];
  var TOWERS = [];
  [-1, 1].forEach(function (s) { TOWER_Z.forEach(function (z) { TOWERS.push([s * TOWER_X, z]); }); });
  function archY(x) { var u = x / TOWER_X; return TRIM + RISE * (1 - u * u); }
  function lipY(x) { var u = x / TOWER_X; return TRIM - 1.5 + (RISE + 2.5) * (1 - u * u); }
  var LIP_Z = 9.5;
  var DECK = { x0: -22, x1: 22, z0: -14, z1: 4, h: 2.2 };
  var LED = { x0: -18, x1: 18, y0: 3.2, y1: 19.2, z: -12.5, cols: 24, rows: 10 };
  var HALO = { c: [0, 11.2, -11.6], r0: 6.2, r1: 7.2, d: 1.6 };
  var WING = { x: 28, y: 10.2, z: -8, ang: [18, 36, 54, 72], len: [22, 23, 22, 18] };
  var IMAG = { x: 32.7, w: 13.6, y0: 5.2, y1: 12.85, z: 6.3 };
  var ARCH = { c: [0, -60, -18], r: 100, n: 16 };   // an upper arc only: 160 m between its feet, 40 m at the apex

  // The hologram: the plan hovers above the team's table at 1 : 62.
  var HOLO_C = [0, 1.3, 0], HOLO_S = 1 / 78, PLAN_C = [0, 0, 20], PLAN_D = 118, PLAN_W = 132, PLAN_H = 86;
  function toA(p) { return [HOLO_C[0] + (p[0] - PLAN_C[0]) * HOLO_S, HOLO_C[1] + (p[1] - PLAN_C[1]) * HOLO_S, HOLO_C[2] + (p[2] - PLAN_C[2]) * HOLO_S]; }

  /* ---- Geometry builders ------------------------------------------------ */
  // Box truss between two points: four chords (listed first, for level of detail), lacing, end frames.
  function trussGeo(a, b, size, bay) {
    var d = sub(b, a), L = len(d);
    d = mul(d, 1 / L);
    var e1 = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : norm(cross(d, [0, 1, 0]));
    var e2 = cross(d, e1), h = size / 2;
    var cr = [add(mul(e1, h), mul(e2, h)), add(mul(e1, -h), mul(e2, h)), add(mul(e1, -h), mul(e2, -h)), add(mul(e1, h), mul(e2, -h))];
    var segs = [], n = Math.max(1, Math.round(L / bay)), i, k;
    for (i = 0; i < 4; i++) segs.push([add(a, cr[i]), add(b, cr[i])]);
    for (i = 0; i < 4; i++) for (k = 0; k < n; k++) {
      var p = add(a, mul(d, L * k / n)), q = add(a, mul(d, L * (k + 1) / n));
      segs.push(k % 2 ? [add(p, cr[(i + 1) % 4]), add(q, cr[i])] : [add(p, cr[i]), add(q, cr[(i + 1) % 4])]);
    }
    [a, b].forEach(function (e) { for (var j = 0; j < 4; j++) segs.push([add(e, cr[j]), add(e, cr[(j + 1) % 4])]); });
    return { segs: segs, truss: { a: a, b: b, size: size } };
  }
  // Oriented box: centre plus three half-axis vectors. Faces carry outward normals.
  function oboxGeo(c, u, v, w) {
    var P = [], i;
    for (i = 0; i < 8; i++) P.push(add(add(add(c, mul(u, i & 1 ? 1 : -1)), mul(v, i & 2 ? 1 : -1)), mul(w, i & 4 ? 1 : -1)));
    var F = [[0, 2, 6, 4, mul(u, -1)], [1, 3, 7, 5, u], [0, 4, 5, 1, mul(v, -1)], [2, 3, 7, 6, v], [0, 1, 3, 2, mul(w, -1)], [4, 6, 7, 5, w]];
    var faces = F.map(function (f) { return { p: [P[f[0]], P[f[1]], P[f[2]], P[f[3]]], n: norm(f[4]) }; });
    var segs = [];
    for (i = 0; i < 8; i++) [1, 2, 4].forEach(function (bit) { if (!(i & bit)) segs.push([P[i], P[i | bit]]); });
    return { segs: segs, faces: faces };
  }
  function boxGeo(x0, y0, z0, x1, y1, z1) {
    return oboxGeo([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [(x1 - x0) / 2, 0, 0], [0, (y1 - y0) / 2, 0], [0, 0, (z1 - z0) / 2]);
  }
  function panelGeo(q, n, screen) {
    return { segs: [[q[0], q[1]], [q[1], q[2]], [q[2], q[3]], [q[3], q[0]]], faces: [{ p: q, n: n, two: true, screen: screen || null }] };
  }
  // A segment of a thick ring (drum) standing in the XY plane, facing the audience.
  function ringGeo(c, r0, r1, a0, a1, d, steps, screen) {
    var zf = c[2] + d / 2, zb = c[2] - d / 2, i, fo = [], fi = [], bo = [], bi = [];
    function P(r, a, z) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), z]; }
    for (i = 0; i <= steps; i++) {
      var a = lerp(a0, a1, i / steps);
      fo.push(P(r1, a, zf)); fi.push(P(r0, a, zf)); bo.push(P(r1, a, zb)); bi.push(P(r0, a, zb));
    }
    var faces = [{ p: fo.concat(fi.slice().reverse()), n: [0, 0, 1], screen: screen || null }, { p: bo.concat(bi.slice().reverse()), n: [0, 0, -1] }];
    var segs = [];
    for (i = 0; i < steps; i++) {
      var am = lerp(a0, a1, (i + 0.5) / steps), out = [Math.cos(am), Math.sin(am), 0];
      faces.push({ p: [fo[i], fo[i + 1], bo[i + 1], bo[i]], n: out });
      faces.push({ p: [fi[i], fi[i + 1], bi[i + 1], bi[i]], n: mul(out, -1) });
      segs.push([fo[i], fo[i + 1]], [fi[i], fi[i + 1]], [bo[i], bo[i + 1]], [bi[i], bi[i + 1]]);
    }
    segs.push([fo[0], fi[0]], [fo[steps], fi[steps]], [fo[0], bo[0]], [fo[steps], bo[steps]], [fi[0], bi[0]], [fi[steps], bi[steps]]);
    return { segs: segs, faces: faces };
  }
  // A flat annulus sector (a slice of the round LED in the halo).
  function sectorGeo(c, r0, r1, a0, a1, z, screen) {
    var pts = [], i, n = 3;
    for (i = 0; i <= n; i++) { var a = lerp(a0, a1, i / n); pts.push([c[0] + r1 * Math.cos(a), c[1] + r1 * Math.sin(a), z]); }
    for (i = n; i >= 0; i--) { var b = lerp(a0, a1, i / n); pts.push([c[0] + r0 * Math.cos(b), c[1] + r0 * Math.sin(b), z]); }
    var segs = [];
    for (i = 0; i < pts.length; i++) segs.push([pts[i], pts[(i + 1) % pts.length]]);
    return { segs: segs, faces: [{ p: pts, n: [0, 0, 1], two: true, screen: screen }] };
  }
  // Scaffold: standards on a grid, ledgers at each lift, braces on the outer faces.
  function scaffoldGeo(x0, x1, z0, z1, y0, y1, nx, nz, braces) {
    var segs = [], i, j, xs = [], zs = [];
    for (i = 0; i <= nx; i++) xs.push(lerp(x0, x1, i / nx));
    for (j = 0; j <= nz; j++) zs.push(lerp(z0, z1, j / nz));
    xs.forEach(function (x) { zs.forEach(function (z) { segs.push([[x, y0, z], [x, y1, z]]); }); });
    xs.forEach(function (x) { segs.push([[x, y1, z0], [x, y1, z1]]); });
    zs.forEach(function (z) { segs.push([[x0, y1, z], [x1, y1, z]]); });
    if (braces) for (i = 0; i < nx; i++) {
      segs.push([[xs[i], y0, z1], [xs[i + 1], y1, z1]]);
      segs.push([[xs[i], y0, z0], [xs[i + 1], y1, z0]]);
    }
    return { segs: segs };
  }

  /* ---- The parts, colour-coded by type like a CAD build ---------------- */
  var KIND = {
    plate:   { e: MUTED,  ea: 0.7,  w: 1,    f: [34, 34, 38],  fa: 0.95 },
    spine:   { e: LIME,   ea: 1,    w: 1.3 },
    tower:   { e: LIME,   ea: 0.85, w: 1.05 },
    roof:    { e: LIME,   ea: 0.6,  w: 1 },
    skin:    { f: [20, 184, 162], fa: 0.06, noEdge: true, flat: true },
    rig:     { e: INK,    ea: 0.7,  w: 1 },
    clamp:   { e: AMBER,  ea: 1,    w: 1.2,  f: [150, 84, 26],  fa: 0.95 },
    deck:    { e: INK,    ea: 0.42, w: 1,    f: [26, 26, 30],  fa: 0.96 },
    led:     { e: TEAL,   ea: 0.85, w: 1,    f: [14, 34, 38],  fa: 0.92 },
    halo:    { e: LIME,   ea: 1,    w: 1.3,  f: [52, 62, 24],  fa: 0.95 },
    ring2:   { e: WARM,   ea: 0.95, w: 1.1,  f: [52, 46, 38],  fa: 0.95 },
    disc:    { e: TEAL,   ea: 0.7,  w: 1,    f: [16, 38, 42],  fa: 0.92 },
    wing:    { e: VIOLET_LINE, ea: 1,    w: 1.2,  f: [30, 22, 56],  fa: 0.93 },
    scaff:   { e: MUTED,  ea: 0.5,  w: 0.9 },
    tier:    { e: MUTED,  ea: 0.6,  w: 1,    f: [28, 28, 32],  fa: 0.93 },
    imag:    { e: TEAL,   ea: 0.85, w: 1,    f: [14, 34, 38],  fa: 0.93 },
    pa:      { e: MUTED,  ea: 0.85, w: 1,    f: [40, 40, 44],  fa: 0.97 },
    fixture: { e: VIOLET_LINE, ea: 1,    w: 1.1,  f: [46, 34, 70],  fa: 0.96 },
    fx:      { e: AMBER,  ea: 1,    w: 1.1,  f: [70, 40, 20],  fa: 0.96 },
    laser:   { e: TEAL,   ea: 1,    w: 1.1,  f: [20, 56, 50],  fa: 0.96 },
    foh:     { e: INK,    ea: 0.55, w: 1,    f: [28, 28, 32],  fa: 0.9 },
    console: { e: TEAL,   ea: 0.8,  w: 1,    f: [22, 30, 32],  fa: 0.95 },
    bracket: { e: VIOLET, ea: 1,    w: 1.2,  f: [70, 40, 130], fa: 0.95 },
    arch:    { e: LIME,   ea: 0.8,  w: 1.1 },
    band:    { e: TEAL,   ea: 0.8,  w: 1,    f: [14, 34, 38],  fa: 0.92 },
    ribbon:  { e: TEAL,   ea: 0.9,  w: 1,    f: [14, 34, 38],  fa: 0.93 },
    mast:    { e: INK,    ea: 0.75, w: 1.1 },
    barrier: { e: INK,    ea: 0.5,  w: 1 }
  };
  var KIND_NAMES = Object.keys(KIND);
  var parts = [], lights = [], lasers = [], flames = [], callouts = [], nodes = [], imags = [], archLine = [], masts = [];

  function part(kind, t0, geo, o) {
    var p = { kind: kind, st: KIND[kind], t0: t0, dur: 0.55, segs: geo.segs || [], faces: geo.faces || [], truss: geo.truss || null,
      anim: 'drop', arrive: [0, 4, 0], layer: 1, lift: false };
    if (o) for (var key in o) p[key] = o[key];
    var c = [0, 0, 0], n = 0;
    p.segs.forEach(function (s) { c = add(c, add(s[0], s[1])); n += 2; });
    p.faces.forEach(function (f) { f.p.forEach(function (q) { c = add(c, q); n++; }); });
    p.c = n ? mul(c, 1 / n) : [0, 0, 0];
    if (!p.anchor) p.anchor = p.c;
    // bounding radius, so parts that are sub-pixel or off screen can be skipped each frame
    var r = 0;
    p.segs.forEach(function (s) { r = Math.max(r, len(sub(s[0], p.c)), len(sub(s[1], p.c))); });
    p.faces.forEach(function (f) { f.p.forEach(function (q) { r = Math.max(r, len(sub(q, p.c))); }); });
    p.r = r;
    p.ki = KIND_NAMES.indexOf(kind);
    p.screens = p.faces.some(function (f) { return !!f.screen; });
    parts.push(p);
    return p;
  }
  function roofY(t) { return lerp(-21.8, 0, inOut(span(t, T.roof))); }

  (function build() {
    var i, j, k, lv;

    // ---- Ground: base plates and ballast under the six towers.
    TOWERS.forEach(function (tw, n) {
      part('plate', 14.7 + n * 0.07, boxGeo(tw[0] - 1.3, 0, tw[1] - 1.3, tw[0] + 1.3, 0.25, tw[1] + 1.3), { arrive: [0, 3, 0] });
    });

    // ---- The spine: tower T1 grows alone, section by section. Then the other five.
    TOWERS.forEach(function (tw, n) {
      var first = n === 0;
      for (lv = 0; lv < 8; lv++) {
        var y0 = 0.25 + lv * 3.2, y1 = y0 + 3.2;
        var t0 = first ? 15.3 + lv * 0.2 : 16.95 + (n - 1) * 0.09 + lv * 0.16;
        part(first ? 'spine' : 'tower', t0, trussGeo([tw[0], y0, tw[1]], [tw[0], y1, tw[1]], 0.76, 0.8),
          { anim: 'grow', anchor: [tw[0], y0, tw[1]], dur: first ? 0.3 : 0.26 });
      }
      // hoist motor at the head of each tower
      part('clamp', 18.55 + n * 0.06, boxGeo(tw[0] - 0.32, 25.85, tw[1] - 0.32, tw[0] + 0.32, 26.55, tw[1] + 0.32), { anim: 'pop', dur: 0.35 });
      // the sleeve block that rides up the tower with the roof
      part('clamp', 18.3 + n * 0.06, boxGeo(tw[0] - 0.62, 23.2, tw[1] - 0.62, tw[0] + 0.62, 24.3, tw[1] + 0.62), { anim: 'pop', lift: true, dur: 0.35 });
    });

    // ---- The roof: three arches, a front lip, cantilevers and purlins, built at ground level, then lifted.
    var XS = [];
    for (i = 0; i <= 12; i++) XS.push(-TOWER_X + i * 4);
    TOWER_Z.forEach(function (z, a) {
      for (i = 0; i < 12; i++) {
        part('roof', 17.35 + a * 0.28 + i * 0.045, trussGeo([XS[i], archY(XS[i]), z], [XS[i + 1], archY(XS[i + 1]), z], 0.9, 0.95),
          { lift: true, anim: 'pop', dur: 0.32 });
      }
    });
    for (i = 0; i < 12; i++) {
      part('roof', 18.2 + i * 0.045, trussGeo([XS[i], lipY(XS[i]), LIP_Z], [XS[i + 1], lipY(XS[i + 1]), LIP_Z], 0.8, 0.95), { lift: true, anim: 'pop', dur: 0.32 });
    }
    for (i = 0; i <= 12; i += 2) {
      var x = XS[i], y = archY(x);
      part('roof', 18.75 + i * 0.03, trussGeo([x, y, 5], [x, lipY(x), LIP_Z], 0.6, 0.9), { lift: true, anim: 'pop', dur: 0.3 });
      part('roof', 18.85 + i * 0.03, trussGeo([x, y, 5], [x, y, -4.5], 0.6, 0.95), { lift: true, anim: 'pop', dur: 0.3 });
      part('roof', 18.95 + i * 0.03, trussGeo([x, y, -4.5], [x, y, -14], 0.6, 0.95), { lift: true, anim: 'pop', dur: 0.3 });
    }
    // the roof membrane
    for (i = 0; i < 12; i++) {
      var xa = XS[i], xb = XS[i + 1];
      [[5, -4.5], [-4.5, -14]].forEach(function (zz, n) {
        part('skin', 19.1 + n * 0.1 + i * 0.02, { faces: [{ p: [[xa, archY(xa), zz[0]], [xb, archY(xb), zz[0]], [xb, archY(xb), zz[1]], [xa, archY(xa), zz[1]]], n: [0, -1, 0], two: true }] },
          { lift: true, anim: 'fade', dur: 0.5 });
      });
      part('skin', 19.3 + i * 0.02, { faces: [{ p: [[xa, lipY(xa), LIP_Z], [xb, lipY(xb), LIP_Z], [xb, archY(xb), 5], [xa, archY(xa), 5]], n: [0, -1, 0], two: true }] },
        { lift: true, anim: 'fade', dur: 0.5 });
    }

    // ---- The deck: 4 × 2 m platforms, upstage first, then the thrust and the round B-stage.
    k = 0;
    for (j = 0; j < 9; j++) for (i = 0; i < 11; i++) {
      var x0 = DECK.x0 + i * 4, z0 = DECK.z0 + j * 2;
      part('deck', 20.1 + j * 0.13 + Math.abs(i - 5) * 0.03, boxGeo(x0 + 0.03, 0, z0 + 0.03, x0 + 3.97, DECK.h, z0 + 1.97), { arrive: [0, 3.5, 0], dur: 0.45 });
    }
    for (j = 0; j < 7; j++) {
      part('deck', 21.3 + j * 0.07, boxGeo(-2.5, 0, 4 + j * 2 + 0.03, 2.5, DECK.h, 4 + j * 2 + 1.97), { arrive: [0, 0, -3], dur: 0.4 });
    }
    (function () {
      var top = [], bot = [], n = 20, faces = [], segs = [], r = 4.5, cz = 22.2;
      for (var q = 0; q < n; q++) {
        var a = q / n * Math.PI * 2;
        top.push([r * Math.cos(a), DECK.h, cz + r * Math.sin(a)]);
        bot.push([r * Math.cos(a), 0, cz + r * Math.sin(a)]);
      }
      faces.push({ p: top, n: [0, 1, 0] });
      for (q = 0; q < n; q++) {
        var q2 = (q + 1) % n, am = (q + 0.5) / n * Math.PI * 2;
        faces.push({ p: [top[q], top[q2], bot[q2], bot[q]], n: [Math.cos(am), 0, Math.sin(am)] });
        segs.push([top[q], top[q2]], [bot[q], bot[q2]]);
        if (q % 5 === 0) segs.push([top[q], bot[q]]);
      }
      part('deck', 21.85, { segs: segs, faces: faces }, { anim: 'pop', dur: 0.45 });
    })();

    // ---- Pre-rig at low trim: the lighting trusses and their fixtures hang under the roof before it lifts.
    [3, -2, -7].forEach(function (z, n) {
      for (i = 0; i < 5; i++) {
        part('roof', 19.0 + n * 0.1 + i * 0.04, trussGeo([-20 + i * 8, 21.2, z], [-12 + i * 8, 21.2, z], 0.52, 0.6), { lift: true, arrive: [0, 2.5, 0], dur: 0.35 });
      }
      for (i = 0; i < 12; i++) {
        var fx = -19.25 + i * 3.5, yb = 20.15;
        var fgeo = boxGeo(fx - 0.24, yb, z - 0.24, fx + 0.24, yb + 0.5, z + 0.24);
        fgeo.segs.push([[fx - 0.3, 20.95, z], [fx - 0.3, yb + 0.25, z]], [[fx + 0.3, 20.95, z], [fx + 0.3, yb + 0.25, z]], [[fx - 0.3, 20.95, z], [fx + 0.3, 20.95, z]]);
        var pl = part('fixture', 19.3 + n * 0.08 + i * 0.015, fgeo, { lift: true, anim: 'pop', dur: 0.25 });
        lights.push({ o: [fx, yb, z], n: lights.length, grp: n, p: pl });
      }
    });
    // the razor line: a row of fixtures along the front lip
    for (i = 0; i < 16; i++) {
      var lx = -21 + i * 2.8, ly = lipY(lx) - 1.3;
      var pl2 = part('fixture', 19.45 + i * 0.012, boxGeo(lx - 0.26, ly, LIP_Z - 0.26, lx + 0.26, ly + 0.55, LIP_Z + 0.26), { lift: true, anim: 'pop', dur: 0.25 });
      lights.push({ o: [lx, ly, LIP_Z], n: lights.length, grp: 3, p: pl2 });
    }

    // ---- The halo module, built the way the reference builds its module: a spine first, a violet header
    //      clamp, the drum swept round in arcs, amber cross-bars, the inner ring the other way, the round LED.
    part('spine', 22.05, trussGeo([0, DECK.h, -13.3], [0, 20.0, -13.3], 0.76, 0.8), { anim: 'grow', anchor: [0, DECK.h, -13.3], dur: 0.35, xl: 4 });
    part('bracket', 22.4, boxGeo(-1.1, 19.9, -14.0, 1.1, 20.7, -12.6), { arrive: [0, 2.5, 0], dur: 0.3 });
    part('rig', 22.3, trussGeo([-19, 19.9, LED.z], [19, 19.9, LED.z], 0.52, 0.6), { arrive: [0, 4, 0], dur: 0.45 });
    part('rig', 22.45, { segs: [-16, -8, 0, 8, 16].map(function (x) { return [[x, 20.1, LED.z], [x, archY(x), -14]]; }) }, { anim: 'fade', dur: 0.4 });
    for (i = 0; i < 32; i++) {
      var a0 = -Math.PI / 2 + i / 32 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 32;
      part('halo', 22.5 + i * 0.03, ringGeo(HALO.c, HALO.r0, HALO.r1, a0, a1, HALO.d, 2, { grp: 'halo', a: i / 32 }), { anim: 'pop', dur: 0.28 });
    }
    [-3.2, 3.2].forEach(function (dy, n) {
      part('clamp', 23.4 + n * 0.08, oboxGeo([0, HALO.c[1] + dy, -12.85], [6.3, 0, 0], [0, 0.16, 0], [0, 0, 0.16]), { arrive: [0, 0, -2], dur: 0.3, xl: 4 });
    });
    for (i = 0; i < 24; i++) {
      var b0 = -Math.PI / 2 - i / 24 * Math.PI * 2, b1 = b0 - Math.PI * 2 / 24;
      part('ring2', 23.4 + i * 0.03, ringGeo([0, HALO.c[1], -11.9], 4.4, 5.0, b1, b0, 1.0, 2, { grp: 'ring2', a: i / 24 }), { anim: 'pop', dur: 0.28 });
    }
    [[0.35, 1.6, 8], [1.6, 2.95, 14], [2.95, 4.3, 20]].forEach(function (ring, ri) {
      for (var s = 0; s < ring[2]; s++) {
        var c0 = s / ring[2] * Math.PI * 2 + ri * 0.2, c1 = c0 + Math.PI * 2 / ring[2], rm = (ring[0] + ring[1]) / 2, am = (c0 + c1) / 2;
        part('disc', 23.8 + ri * 0.16 + s * 0.01, sectorGeo(HALO.c, ring[0] + 0.03, ring[1] - 0.03, c0 + 0.01, c1 - 0.01, -12.45,
          { grp: 'disc', x: HALO.c[0] + rm * Math.cos(am), y: HALO.c[1] + rm * Math.sin(am), r: rm, a: (s + 0.5) / ring[2] }), { anim: 'pop', dur: 0.3 });
      }
    });
    for (i = 0; i < 8; i++) {
      var ca = i / 8 * Math.PI * 2 + Math.PI / 8, cxp = HALO.c[0] + 7.55 * Math.cos(ca), cyp = HALO.c[1] + 7.55 * Math.sin(ca);
      part('clamp', 23.6 + i * 0.04, oboxGeo([cxp, cyp, -12.2], [0.35 * Math.cos(ca), 0.35 * Math.sin(ca), 0], [-0.22 * Math.sin(ca), 0.22 * Math.cos(ca), 0], [0, 0, 0.35]), { anim: 'pop', dur: 0.3, xl: 4 });
    }
    // the LED wall around it: tiles fill outward from the halo (the reference's radial fill)
    var tiles = [], tw = (LED.x1 - LED.x0) / LED.cols, th = (LED.y1 - LED.y0) / LED.rows, maxD = 0;
    for (j = 0; j < LED.rows; j++) for (i = 0; i < LED.cols; i++) {
      var cx = LED.x0 + (i + 0.5) * tw, cy = LED.y0 + (j + 0.5) * th, d = Math.hypot(cx - HALO.c[0], cy - HALO.c[1]);
      if (d < HALO.r1 + 0.6) continue;
      tiles.push({ i: i, j: j, cx: cx, cy: cy, d: d });
      maxD = Math.max(maxD, d);
    }
    tiles.forEach(function (tl) {
      var x0 = LED.x0 + tl.i * tw + 0.05, x1 = x0 + tw - 0.1, y0 = LED.y0 + tl.j * th + 0.05, y1 = y0 + th - 0.1;
      var q = [[x0, y0, LED.z], [x1, y0, LED.z], [x1, y1, LED.z], [x0, y1, LED.z]];
      part('led', 23.55 + (tl.d - HALO.r1) / (maxD - HALO.r1) * 1.7 + rnd() * 0.05, panelGeo(q, [0, 0, 1], { grp: 'led', x: tl.cx, y: tl.cy }),
        { arrive: [0, 1.4, 0], dur: 0.35 });
    });

    // ---- Wings: scaffold towers on each side, then blades of LED radiating out, segment by segment.
    [-1, 1].forEach(function (s, si) {
      var xa = s * 26, xb = s * 36;
      for (lv = 0; lv < 4; lv++) {
        var ya = lv * 2.55, yb = ya + 2.55;
        part('scaff', 24.95 + lv * 0.18 + si * 0.05, scaffoldGeo(Math.min(xa, xb), Math.max(xa, xb), -14, -6, ya, yb, 4, 3, true),
          { anim: 'grow', anchor: [s * 31, ya, -10], dur: 0.3 });
      }
      [5.1, 10.2].forEach(function (ty, n) {
        part('tier', 25.4 + n * 0.2 + si * 0.05, boxGeo(Math.min(xa, xb), ty - 0.25, -14, Math.max(xa, xb), ty, -6), { arrive: [0, 2, 0], dur: 0.4 });
      });
      WING.ang.forEach(function (deg, fi) {
        var th2 = deg * DEG, dir = [s * Math.cos(th2), Math.sin(th2), 0], perp = [-s * Math.sin(th2), Math.cos(th2), 0];
        var L = WING.len[fi], pv = [s * WING.x, WING.y, WING.z];
        for (var sg = 0; sg < 5; sg++) {
          var mid = 1.2 + (sg + 0.5) * L / 5, mc = add(pv, mul(dir, mid));
          var geo = oboxGeo(mc, mul(dir, L / 10 - 0.08), mul(perp, 1.15 - sg * 0.12), [0, 0, 0.32]);
          geo.faces[5].screen = { grp: 'wing', fin: fi, seg: sg, side: s, x: mc[0], y: mc[1] };
          part('wing', 25.55 + fi * 0.12 + sg * 0.11 + si * 0.04, geo, { arrive: mul(dir, -3), dur: 0.35 });
        }
        if (fi === 1 || fi === 3) flames.push({ p: add(pv, mul(dir, 1.2 + L + 0.4)), n: flames.length, tip: true });
        nodes.push([pv[0] + s * Math.cos(th2) * (L + 1.2), 0, pv[2]]);
      });
    });

    // ---- IMAG: two screens on their own towers, either side of the roof.
    [-1, 1].forEach(function (s, si) {
      [s * 25.2, s * 40.2].forEach(function (x, n) {
        for (lv = 0; lv < 4; lv++) {
          part('tower', 25.6 + lv * 0.12 + n * 0.06 + si * 0.04, trussGeo([x, 0.2 + lv * 3.4, IMAG.z - 0.5], [x, 0.2 + (lv + 1) * 3.4, IMAG.z - 0.5], 0.52, 0.6),
            { anim: 'grow', anchor: [x, 0.2 + lv * 3.4, IMAG.z - 0.5], dur: 0.22 });
        }
      });
      part('rig', 26.1 + si * 0.04, trussGeo([s * 25.2, 13.8, IMAG.z - 0.5], [s * 40.2, 13.8, IMAG.z - 0.5], 0.52, 0.6), { arrive: [0, 3, 0], dur: 0.4 });
      var cols = 8, rows = 5, x0 = s * IMAG.x - IMAG.w / 2, cw = IMAG.w / cols, rh = (IMAG.y1 - IMAG.y0) / rows;
      for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) {
        var qx = x0 + cc * cw, qy = IMAG.y0 + r * rh;
        var q = [[qx + 0.03, qy + 0.03, IMAG.z], [qx + cw - 0.03, qy + 0.03, IMAG.z], [qx + cw - 0.03, qy + rh - 0.03, IMAG.z], [qx + 0.03, qy + rh - 0.03, IMAG.z]];
        part('imag', 26.25 + (rows - 1 - r) * 0.09 + cc * 0.025 + si * 0.05, panelGeo(q, [0, 0, 1], { grp: 'imag', u: (cc + 0.5) / cols, v: (r + 0.5) / rows, side: s }),
          { arrive: [0, 1.2, 0], dur: 0.3 });
      }
      imags.push({ s: s, x0: x0, x1: x0 + IMAG.w, y0: IMAG.y0, y1: IMAG.y1, z: IMAG.z + 0.02 });
      nodes.push([x0, 0, IMAG.z], [x0 + IMAG.w, 0, IMAG.z]);
    });

    // ---- The horizon arch: 160 m of truss sweeping up from both feet to meet 40 m above the deck.
    var phi0 = Math.acos(-ARCH.c[1] / ARCH.r);
    [-1, 1].forEach(function (s) {
      for (var q = 0; q < ARCH.n; q++) {
        var p0 = s * phi0 * (1 - q / ARCH.n), p1 = s * phi0 * (1 - (q + 1) / ARCH.n);
        var A = [ARCH.r * Math.sin(p0), ARCH.c[1] + ARCH.r * Math.cos(p0), ARCH.c[2]];
        var B = [ARCH.r * Math.sin(p1), ARCH.c[1] + ARCH.r * Math.cos(p1), ARCH.c[2]];
        part('arch', 26.35 + q * 0.058, trussGeo(A, B, 1.3, 1.3), { anim: 'pop', dur: 0.3 });
      }
      part('plate', 26.3, boxGeo(s * ARCH.r * Math.sin(phi0) - 1.6, 0, ARCH.c[2] - 1.6, s * ARCH.r * Math.sin(phi0) + 1.6, 0.3, ARCH.c[2] + 1.6), { arrive: [0, 3, 0], dur: 0.3 });
    });
    for (i = 0; i <= 64; i++) { var ph = -phi0 + i / 64 * 2 * phi0; archLine.push([ARCH.r * Math.sin(ph), ARCH.c[1] + ARCH.r * Math.cos(ph) - 0.65, ARCH.c[2] + 0.66]); }

    // ---- The horizon band: a low panoramic LED ribbon either side, its outer panels folded toward the crowd.
    function bandAt(x) { return x <= 50 ? [x, 8.0] : [50 + (x - 50) * Math.cos(18 * DEG), 8.0 + (x - 50) * Math.sin(18 * DEG)]; }
    [-1, 1].forEach(function (s, si) {
      for (var ci = 0; ci < 18; ci++) {
        var xa = 25.6 + ci * 2.05, xb = xa + 1.95, pa = bandAt(xa), pb = bandAt(xb);
        for (var row = 0; row < 2; row++) {
          var ya = 0.9 + row * 2.05, yb = ya + 1.95;
          var qb = [[s * pa[0], ya, pa[1]], [s * pb[0], ya, pb[1]], [s * pb[0], yb, pb[1]], [s * pa[0], yb, pa[1]]];
          part('band', 26.5 + ci * 0.035 + (1 - row) * 0.06 + si * 0.02, panelGeo(qb, [0, 0, 1], { grp: 'band', x: s * (xa + xb) / 2, y: (ya + yb) / 2 }),
            { arrive: [0, 1.5, 0], dur: 0.3 });
        }
      }
    });

    // ---- The ribbon: a thin curved LED band bowing out over centre stage, hung from the lip.
    for (i = 0; i < 16; i++) {
      var ra = -15 + i * 1.875, rb = ra + 1.875;
      var za = 4.0 + 4.0 * (1 - (ra / 15) * (ra / 15)), zb = 4.0 + 4.0 * (1 - (rb / 15) * (rb / 15));
      part('ribbon', 26.95 + (7.5 - Math.abs(i + 0.5 - 8)) * 0.025, panelGeo([[ra, 17.4, za], [rb, 17.4, zb], [rb, 18.6, zb], [ra, 18.6, za]], [0, 0, 1],
        { grp: 'ribbon', x: (ra + rb) / 2, y: 18 }), { arrive: [0, 2, 0], dur: 0.3 });
    }
    part('rig', 27.0, { segs: [-12, -4, 4, 12].map(function (x) { var z = 4 + 4 * (1 - (x / 15) * (x / 15)); return [[x, 18.6, z], [x, lipY(x) - 0.4, LIP_Z]]; }) }, { anim: 'fade', dur: 0.35 });

    // ---- PA: two flown line arrays in a J, box by box from the top; subs on the ground.
    var splay = [0, 0.5, 0.5, 1, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6];
    [-1, 1].forEach(function (s, si) {
      var hinge = [s * 21, 23.3, 7.2], ang = 0, x = s * 21;
      part('clamp', 27.15 + si * 0.03, boxGeo(x - 0.8, 23.3, 6.8, x + 0.8, 23.6, 7.6), { arrive: [0, 2, 0], dur: 0.35, xl: 5 });
      part('rig', 27.2 + si * 0.03, { segs: [[[x - 0.6, 23.6, 7.2], [x - 0.6, lipY(x), LIP_Z]], [[x + 0.6, 23.6, 7.2], [x + 0.6, lipY(x), LIP_Z]]] }, { anim: 'fade', dur: 0.3, xl: 5 });
      splay.forEach(function (sp, bi) {
        ang += sp * DEG;
        var v = [0, Math.cos(ang), Math.sin(ang)], w = [0, -Math.sin(ang), Math.cos(ang)];
        var c = sub(hinge, mul(v, 0.21));
        var geo = oboxGeo(c, [0.67, 0, 0], mul(v, 0.2), mul(w, 0.32));
        geo.segs.push([add(add(c, mul(w, 0.32)), [-0.55, 0, 0]), add(add(c, mul(w, 0.32)), [0.55, 0, 0])]);
        part('pa', 27.3 + bi * 0.05 + si * 0.025, geo, { arrive: [0, 2.2, 0], dur: 0.3 });
        hinge = sub(hinge, mul(v, 0.42));
      });
      nodes.push([x, 0, 7.2]);
      for (k = 0; k < 15; k++) {
        var sx = s * (4.1 + k * 1.18);
        var geo2 = boxGeo(sx - 0.55, 0, 4.7, sx + 0.55, 1.3, 5.8);
        geo2.segs.push([[sx - 0.55, 0.65, 5.8], [sx + 0.55, 0.65, 5.8]]);
        part('pa', 27.7 + k * 0.03 + si * 0.02, geo2, { anim: 'pop', dur: 0.3 });
      }
    });

    // ---- Delay masts out in the field, dropped into their footings in rows: 4, then 3.
    [[46, [-36, -13, 13, 36]], [84, [-28, 0, 28]]].forEach(function (row, ri) {
      row[1].forEach(function (x, mi) {
        var z = row[0], t0 = 28.0 + ri * 0.3 + mi * 0.07;
        part('clamp', t0 - 0.1, boxGeo(x - 0.9, 0, z - 0.9, x + 0.9, 0.35, z + 0.9), { anim: 'pop', dur: 0.25 });
        part('mast', t0, { segs: [[[x - 0.14, 0.35, z], [x - 0.14, 16.2, z]], [[x + 0.14, 0.35, z], [x + 0.14, 16.2, z]], [[x - 2.2, 16.2, z], [x + 2.2, 16.2, z]],
          [[x - 2.2, 16.2, z], [x - 2.2, 15.4, z]], [[x + 2.2, 16.2, z], [x + 2.2, 15.4, z]]] }, { arrive: [0, 22, 0], dur: 0.45 });
        var h2 = [x, 15.1, z + 0.4], ang2 = 0;
        for (k = 0; k < 8; k++) {
          ang2 += (k < 3 ? 1 : 3) * DEG;
          var v2 = [0, Math.cos(ang2), Math.sin(ang2)], w2 = [0, -Math.sin(ang2), Math.cos(ang2)], c2 = sub(h2, mul(v2, 0.18));
          part('pa', t0 + 0.4 + k * 0.035, oboxGeo(c2, [0.5, 0, 0], mul(v2, 0.17), mul(w2, 0.26)), { arrive: [0, 1.4, 0], dur: 0.25 });
          h2 = sub(h2, mul(v2, 0.36));
        }
        masts.push([x, z]);
        nodes.push([x, 0, z]);
      });
    });

    // ---- Front of house: a low open riser (so it never blocks the view) with three consoles.
    part('foh', 28.35, boxGeo(-6, 0, 54, 6, 1.0, 62), { arrive: [0, 2.5, 0], dur: 0.4 });
    [-3.2, 0, 3.2].forEach(function (x, n) {
      var cg = boxGeo(x - 1.2, 1.0, 56.4, x + 1.2, 1.95, 57.4);
      cg.faces[4].screen = { grp: 'console', x: x, y: 2 };
      part('console', 28.55 + n * 0.06, cg, { anim: 'pop', dur: 0.3 });
    });
    nodes.push([-6, 0, 54], [6, 0, 54], [6, 0, 62], [-6, 0, 62]);

    // ---- Barricade, drawn along its line.
    (function () {
      // along the front, down both sides of the thrust, and round the B-stage on the audience side
      var path = [[-24, 8], [-3.6, 8]], a0b = Math.atan2(17.6 - 22.2, -3.6), sweep = Math.PI + 2 * (a0b + Math.PI);
      for (var q = 0; q <= 16; q++) { var a = a0b - q / 16 * sweep; path.push([6.2 * Math.cos(a), 22.2 + 6.2 * Math.sin(a)]); }
      path.push([3.6, 8], [24, 8]);
      var segs = [];
      for (var n = 0; n < path.length - 1; n++) {
        var a2 = path[n], b2 = path[n + 1];
        segs.push([[a2[0], 1.1, a2[1]], [b2[0], 1.1, b2[1]]], [[a2[0], 0.05, a2[1]], [a2[0], 1.1, a2[1]]]);
      }
      part('barrier', 28.25, { segs: segs }, { anim: 'draw', dur: 1.1 });
    })();

    // ---- FX: lasers and flame units along the deck edge.
    [-19.5, -15, -11, -7, 7, 11, 15, 19.5].forEach(function (x, n) {
      var pl = part('laser', 29.0 + n * 0.04, boxGeo(x - 0.3, DECK.h, 3.3, x + 0.3, DECK.h + 0.4, 3.9), { anim: 'pop', dur: 0.3 });
      lasers.push({ o: [x, DECK.h + 0.3, 3.9], n: n, p: pl });
    });
    [-17, -13, -9, -5, 5, 9, 13, 17].forEach(function (x, n) {
      part('fx', 29.15 + n * 0.04, boxGeo(x - 0.28, DECK.h, 3.4, x + 0.28, DECK.h + 0.35, 3.96), { anim: 'pop', dur: 0.3 });
      flames.push({ p: [x, DECK.h + 0.4, 3.7], n: flames.length, tip: false });
    });

    // ---- Callouts: a CAD engineer's notes, pinned to the parts as they arrive.
    callouts.push(
      { p: [-24, 26.6, 5], t0: 15.7, t1: 18.6, text: 'T1  ·  GROUND SUPPORT  ·  H 26 000', dx: 26, dy: -30, c: LIME },
      { p: [0, archY(0), 5], t0: 19.3, t1: 22.0, text: 'ROOF  ·  PRE-RIGGED  ·  LIFT', live: 'lift', dx: 30, dy: -34, c: LIME },
      { p: [0, 20.7, -13.3], t0: 22.2, t1: 23.3, text: 'SPINE  ·  H 18 000', dx: 34, dy: -24, c: LIME },
      { p: [HALO.c[0] + HALO.r1 * 0.72, HALO.c[1] + HALO.r1 * 0.72, -10.8], t0: 23.3, t1: 25.1, text: 'HALO  Ø 14 400', dx: 40, dy: -30, c: LIME },
      { p: [LED.x1, LED.y1, LED.z], t0: 24.1, t1: 25.4, text: 'LED  36 × 16 M  ·  ' + tiles.length + ' TILES', dx: 26, dy: -24, c: TEAL },
      { p: [WING.x + Math.cos(54 * DEG) * 23, WING.y + Math.sin(54 * DEG) * 23, WING.z], t0: 26.0, t1: 27.3, text: 'WINGS  8 × 22 M', dx: 22, dy: -22, c: VIOLET_LINE },
      { p: [0, 40, ARCH.c[2]], t0: 27.1, t1: 28.5, text: 'ARCH  160 000  ·  H 40 000', dx: 28, dy: -22, c: LIME },
      { p: [21, 23.3, 7.2], t0: 27.6, t1: 29.1, text: 'PA  2 × 16  ·  SUBS 30', dx: 26, dy: -26, c: INK },
      { p: [13, 16.2, 46], t0: 28.3, t1: 29.5, text: 'DELAYS  4 + 3', dx: 22, dy: -22, c: INK },
      { p: [0, 2.0, 58], t0: 28.6, t1: 29.6, text: 'FOH  +58 000', dx: -22, dy: -24, c: INK }
    );

    // ---- Where the ideas land in the hologram: the key points of the plan.
    [[-22, -14], [22, -14], [22, 4], [-22, 4], [-2.5, 18], [2.5, 18], [0, 22.2], [0, -11.6], [-18, LED.z], [18, LED.z], [0, LIP_Z],
     [-31, -14], [31, -14], [-31, -6], [31, -6]].forEach(function (q) { nodes.push([q[0], 0, q[1]]); });
    TOWERS.forEach(function (tw) { nodes.push([tw[0], 0, tw[1]]); });
  })();

  /* ==========================================================================
     The plan: the same stage and site in plan, as it would sit in a CAD file.
     Its outline draws itself in the air above the team's table; the details
     follow on the CAD screen.
     ========================================================================== */
  var P = {
    grid:   { c: MUTED,  a: 0.09, w: 1,   keep: 0.3, layer: 'GRID' },
    major:  { c: MUTED,  a: 0.2,  w: 1,   keep: 0.35, layer: 'GRID' },
    centre: { c: MUTED,  a: 0.45, w: 1,   keep: 0.5, dash: [16, 5, 3, 5], layer: 'CENTRE LINE' },
    deck:   { c: INK,    a: 0.9,  w: 1.4, keep: 0.4, layer: 'STAGE' },
    sub:    { c: INK,    a: 0.3,  w: 1,   keep: 0.2, dash: [6, 5], layer: 'STAGE' },
    truss:  { c: LIME,   a: 0.95, w: 1.3, keep: 0.4, layer: 'GROUND SUPPORT' },
    tower:  { c: LIME,   a: 1,    w: 1.5, keep: 0.4, layer: 'GROUND SUPPORT' },
    led:    { c: TEAL,   a: 1,    w: 2.2, keep: 0.4, layer: 'VIDEO' },
    halo:   { c: LIME,   a: 1,    w: 1.6, keep: 0.4, layer: 'VIDEO' },
    wing:   { c: VIOLET_LINE, a: 1,    w: 1.5, keep: 0.4, layer: 'SCENIC' },
    scaff:  { c: MUTED,  a: 0.6,  w: 1,   keep: 0.3, layer: 'SCENIC' },
    pa:     { c: INK,    a: 0.75, w: 1.2, keep: 0.35, layer: 'AUDIO' },
    site:   { c: MUTED,  a: 0.55, w: 1,   keep: 0.3, dash: [8, 6], layer: 'SITE' },
    foh:    { c: INK,    a: 0.7,  w: 1.2, keep: 0.35, layer: 'SITE' },
    dim:    { c: TEAL,   a: 0.85, w: 1,   keep: 0, layer: 'DIMENSIONS' }
  };
  var plan = [], labels = [];
  function line(a, b, st, t0, dur) { plan.push({ a: a, b: b, st: st, t0: t0, t1: t0 + (dur || 0.3) }); }
  function rect(x0, z0, x1, z1, st, t0, dur) {
    var d = (dur || 0.4) / 4;
    line(G(x0, z0), G(x1, z0), st, t0, d); line(G(x1, z0), G(x1, z1), st, t0 + d, d);
    line(G(x1, z1), G(x0, z1), st, t0 + 2 * d, d); line(G(x0, z1), G(x0, z0), st, t0 + 3 * d, d);
  }
  function circle(cx, cz, r, st, t0, dur, n) {
    n = n || 24;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
      line(G(cx + r * Math.cos(a), cz + r * Math.sin(a)), G(cx + r * Math.cos(b), cz + r * Math.sin(b)), st, t0 + i / n * dur, dur / n * 1.5);
    }
  }
  function label(x, z, text, t0, c) { labels.push({ p: G(x, z), text: text, t0: t0, c: c || MUTED }); }
  function dim(a, b, off, dist, text, t0) {
    var ext = 1.0, la = add(a, mul(off, dist)), lb = add(b, mul(off, dist));
    line(add(a, mul(off, ext)), add(a, mul(off, dist + ext)), P.dim, t0, 0.16);
    line(add(b, mul(off, ext)), add(b, mul(off, dist + ext)), P.dim, t0 + 0.05, 0.16);
    line(la, lb, P.dim, t0 + 0.1, 0.32);
    var tick = norm(add(norm(sub(b, a)), off));
    [la, lb].forEach(function (p, n) { line(add(p, mul(tick, -0.7)), add(p, mul(tick, 0.7)), P.dim, t0 + 0.4 + n * 0.03, 0.08); });
    labels.push({ p: add(mul(add(la, lb), 0.5), mul(off, 1.3)), text: text, t0: t0 + 0.42, c: TEAL, along: [la, lb] });
  }

  (function drawing() {
    var i, t, H0 = 0.8;   // in the air: starts once the idea seed has burst over the table
    for (i = -60, t = 6.85 + H0; i <= 60; i += 10, t += 0.02) line(G(i, -20), G(i, 62), P.major, t, 0.4);
    for (i = -20, t = 6.95 + H0; i <= 60; i += 10, t += 0.03) line(G(-60, i), G(60, i), P.major, t, 0.4);
    line(G(0, -19), G(0, 62), P.centre, 7.15 + H0, 0.7);
    rect(DECK.x0, DECK.z0, DECK.x1, DECK.z1, P.deck, 7.3 + H0, 0.6);
    rect(-2.5, 4, 2.5, 18, P.deck, 7.75 + H0, 0.35);
    circle(0, 22.2, 4.5, P.deck, 7.9 + H0, 0.4, 20);
    TOWERS.forEach(function (tw, n) { rect(tw[0] - 1.3, tw[1] - 1.3, tw[0] + 1.3, tw[1] + 1.3, P.tower, 7.95 + H0 + n * 0.05, 0.25); });
    [5, -4.5, -14].forEach(function (z, n) { line(G(-TOWER_X, z), G(TOWER_X, z), P.truss, 8.15 + H0 + n * 0.08, 0.35); });
    line(G(-TOWER_X, LIP_Z), G(TOWER_X, LIP_Z), P.truss, 8.35 + H0, 0.35);
    for (i = -24; i <= 24; i += 8) line(G(i, LIP_Z), G(i, -14), P.truss, 8.45 + H0 + (i + 24) * 0.004, 0.25);
    line(G(-60, ARCH.c[2]), G(60, ARCH.c[2]), P.halo, 8.5 + H0, 0.45);
    line(G(LED.x0, LED.z), G(LED.x1, LED.z), P.led, 8.6 + H0, 0.3);
    rect(-HALO.r1, -12.4, HALO.r1, -10.8, P.halo, 8.7 + H0, 0.3);
    [-1, 1].forEach(function (s, si) {
      rect(Math.min(s * 26, s * 36), -14, Math.max(s * 26, s * 36), -6, P.scaff, 8.8 + H0 + si * 0.05, 0.3);
      WING.ang.forEach(function (deg, fi) {
        var L = WING.len[fi] + 1.2;
        line(G(s * WING.x, WING.z + (fi - 1.5) * 0.5), G(s * (WING.x + L * Math.cos(deg * DEG)), WING.z + (fi - 1.5) * 0.5), P.wing, 8.85 + H0 + fi * 0.04 + si * 0.05, 0.25);
      });
      line(G(s * (IMAG.x - IMAG.w / 2), IMAG.z), G(s * (IMAG.x + IMAG.w / 2), IMAG.z), P.led, 9.0 + H0 + si * 0.05, 0.25);
      [25.2, 40.2].forEach(function (x) { rect(s * x - 0.4, IMAG.z - 0.9, s * x + 0.4, IMAG.z - 0.1, P.tower, 9.05 + H0 + si * 0.05, 0.15); });
      line(G(s * 25.6, 8), G(s * 50, 8), P.led, 9.08 + H0 + si * 0.04, 0.2);
      line(G(s * 50, 8), G(s * (50 + 12.4 * Math.cos(18 * DEG)), 8 + 12.4 * Math.sin(18 * DEG)), P.led, 9.18 + H0 + si * 0.04, 0.1);
      rect(s * 21 - 0.7, 6.9, s * 21 + 0.7, 7.5, P.pa, 9.1 + H0 + si * 0.04, 0.15);
      rect(s * 3.5, 4.7, s * 21.4, 5.8, P.pa, 9.15 + H0 + si * 0.04, 0.25);
    });
    line(G(-24, 8), G(-3.6, 8), P.site, 9.2 + H0, 0.3);
    line(G(3.6, 8), G(24, 8), P.site, 9.25 + H0, 0.3);
    line(G(-3.6, 8), G(-3.6, 17.6), P.site, 9.3 + H0, 0.15);
    line(G(3.6, 8), G(3.6, 17.6), P.site, 9.3 + H0, 0.15);
    [-36, -13, 13, 36].forEach(function (x, n) {
      circle(x, 46, 0.9, P.pa, 9.35 + H0 + n * 0.03, 0.15, 10);
      line(G(x - 1.4, 46), G(x + 1.4, 46), P.pa, 9.38 + H0 + n * 0.03, 0.08);
      line(G(x, 44.6), G(x, 47.4), P.pa, 9.4 + H0 + n * 0.03, 0.08);
    });
    rect(-6, 54, 6, 62, P.foh, 9.45 + H0, 0.3);

    // On the CAD screen (act 2)
    for (i = -60, t = 11.0; i <= 60; i += 2, t += 0.003) if (i % 10) line(G(i, -20), G(i, 62), P.grid, t, 0.35);
    for (i = -20, t = 11.05; i <= 60; i += 2, t += 0.004) if (i % 10) line(G(-60, i), G(60, i), P.grid, t, 0.35);
    for (i = -18; i <= 18; i += 4) line(G(i, DECK.z0), G(i, DECK.z1), P.sub, 11.2 + (i + 18) * 0.004, 0.25);
    for (i = -12; i <= 2; i += 2) line(G(DECK.x0, i), G(DECK.x1, i), P.sub, 11.3 + (i + 12) * 0.006, 0.25);
    [3, -2, -7].forEach(function (z, n) { line(G(-20, z), G(20, z), P.truss, 11.35 + n * 0.05, 0.3); });
    dim(G(-TOWER_X, LIP_Z), G(TOWER_X, LIP_Z), [0, 0, 1], 2.4, '48 000', 11.5);
    dim(G(DECK.x0, DECK.z0), G(DECK.x1, DECK.z0), [0, 0, -1], 7.5, '44 000', 11.65);
    dim(G(DECK.x0, DECK.z0), G(DECK.x0, DECK.z1), [-1, 0, 0], 5.5, '18 000', 11.8);
    dim(G(-2.5, 4), G(-2.5, 18), [-1, 0, 0], 5.0, '14 000', 11.95);
    dim(G(30, DECK.z1), G(30, 58), [1, 0, 0], 2.0, '54 000', 12.1);
    label(0, -21.2, 'UPSTAGE', 12.2);
    label(0, 32.5, 'DOWNSTAGE  ·  AUDIENCE', 12.25);
    label(0, -5, 'STAGE +2.200', 12.3, INK);
    label(0, -9.2, 'LED 36 × 16 M', 12.35, TEAL);
    label(0, -13.3, 'HALO Ø 14 400', 12.4, LIME);
    label(0, 22.2, 'B', 12.45, INK);
    TOWERS.forEach(function (tw, n) { label(tw[0] + (tw[0] < 0 ? -2.8 : 2.8), tw[1] + 1.6, 'T' + (n + 1), 12.5 + n * 0.03, LIME); });
    label(-31, -16.2, 'WINGS', 12.65, VIOLET_LINE); label(31, -16.2, 'WINGS', 12.67, VIOLET_LINE);
    label(-IMAG.x, IMAG.z - 2.2, 'IMAG', 12.7, TEAL); label(IMAG.x, IMAG.z - 2.2, 'IMAG', 12.72, TEAL);
    label(-44, 11.2, 'BAND', 12.74, TEAL); label(44, 11.2, 'BAND', 12.76, TEAL);
    label(46, -20.2, 'ARCH  →  Ø 200 000', 12.78, LIME);
    label(-24.5, 49.4, 'DELAYS', 12.8); label(24.5, 49.4, 'DELAYS', 12.82);
    label(0, 64.2, 'FOH', 12.85, INK);
    label(11, 10, 'ROOF +24.000', 12.9, LIME);
  })();

  /* ==========================================================================
     The people: pictogram figures. Two meet, then a team round a table.
     ========================================================================== */
  function R(deg, r) { return [r * Math.cos(deg * DEG), r * Math.sin(deg * DEG)]; }
  var FIGS = [
    { way: [[0.3, -4.3, 0], [2.6, -0.43, 0], [3.85, -0.43, 0], [4.65, -1.9, 0, 'back']], look: [0, 0], hero: true,
      arms: [{ t0: 2.35, t1: 3.9, kind: 'shake' }, { t0: 6.9, t1: 8.8, kind: 'point' }] },
    { way: [[0.45, 4.3, 0], [2.6, 0.43, 0], [3.85, 0.43, 0], [4.65, 1.9, 0, 'back']], look: [0, 0], hero: true,
      arms: [{ t0: 2.35, t1: 3.9, kind: 'shake' }, { t0: 7.4, t1: 9.1, kind: 'point' }] }
  ];
  [[58, 4.1], [122, 4.3], [215, 4.2], [270, 4.5], [325, 4.35]].forEach(function (m, n) {
    var a = R(m[0], 5.6), b = R(m[0], 1.9);
    FIGS.push({ way: [[m[1], a[0], a[1]], [m[1] + 2.15, b[0], b[1]]], look: [0, 0],
      arms: n % 2 ? [{ t0: 6.7 + n * 0.15, t1: 8.9, kind: 'point' }] : [] });
  });
  var SHAKE_AT = [0, 1.02, 0];

  function wayAt(way, t) {
    var d = 0, i;
    if (t <= way[0][0]) return { x: way[0][1], z: way[0][2], d: 0, v: [0, 0], speed: 0, back: false };
    for (i = 0; i < way.length - 1; i++) {
      var a = way[i], b = way[i + 1], L = Math.hypot(b[1] - a[1], b[2] - a[2]);
      if (t < b[0]) {
        var r = (t - a[0]) / (b[0] - a[0]), u = smooth(r);
        return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), d: d + L * u, v: L > 0.01 ? [(b[1] - a[1]) / L, (b[2] - a[2]) / L] : [0, 0],
          speed: L / (b[0] - a[0]) * 6 * r * (1 - r), back: b[3] === 'back' };
      }
      d += L;
    }
    var e = way[way.length - 1];
    return { x: e[1], z: e[2], d: d, v: [0, 0], speed: 0, back: false };
  }
  function ik(S, P0, l1, l2, hint) {
    var d = sub(P0, S), L = len(d), maxL = (l1 + l2) * 0.985;
    if (L > maxL) { d = mul(d, maxL / L); L = maxL; }
    if (L < 0.05) L = 0.05;
    var dn = mul(d, 1 / L), a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    var pv = norm(sub(hint, mul(dn, dot(hint, dn))));
    return { e: add(add(S, mul(dn, a)), mul(pv, h)), h: add(S, d) };
  }
  function armWeight(F, t, kind) {
    var w = 0;
    (F.arms || []).forEach(function (a) { if (a.kind === kind) w = Math.max(w, clamp((t - a.t0) / 0.35, 0, 1) * clamp((a.t1 - t) / 0.35, 0, 1)); });
    return smooth(w);
  }
  // Joints of a figure at time t, in world space.
  function pose(F, t, idx) {
    var w = wayAt(F.way, t), yaw;
    if (w.speed > 0.05 && !w.back) yaw = Math.atan2(w.v[0], w.v[1]);
    else yaw = Math.atan2(F.look[0] - w.x, F.look[1] - w.z);
    var fwd = [Math.sin(yaw), 0, Math.cos(yaw)], side = [Math.cos(yaw), 0, -Math.sin(yaw)], up = [0, 1, 0];
    var amp = 0.42 * clamp(w.speed / 1.45, 0, 1), ph = w.d / 1.45 * Math.PI * 2 * (w.back ? -1 : 1);
    var sway = (1 - clamp(w.speed, 0, 1)) * 0.012 * Math.sin(t * 1.4 + idx * 1.7);
    var y0 = F.y0 || 0;   // standing height (the team ends up on the FOH riser)
    var base = [w.x + side[0] * sway, y0, w.z + side[2] * sway], bob = 0.025 * Math.abs(Math.sin(ph)) * (amp / 0.42);
    function at(f, y, s) { return [base[0] + fwd[0] * f + side[0] * s, y + y0, base[2] + fwd[2] * f + side[2] * s]; }
    var J = { yaw: yaw, base: base, head: at(0.02, 1.67 + bob, 0), neck: at(0, 1.5 + bob, 0), pelvis: at(0, 0.96 + bob * 0.6, 0), legs: [], arms: [] };
    [-1, 1].forEach(function (s) {
      var phase = ph + (s > 0 ? Math.PI : 0), a = amp * Math.sin(phase), b = amp * 1.4 * Math.max(0, Math.sin(phase - 1.1));
      var hip = at(0, 0.95 + bob * 0.6, 0.075 * s);
      var knee = add(hip, [fwd[0] * 0.47 * Math.sin(a), -0.47 * Math.cos(a), fwd[2] * 0.47 * Math.sin(a)]);
      var foot = add(knee, [fwd[0] * 0.47 * Math.sin(a - b), -0.47 * Math.cos(a - b), fwd[2] * 0.47 * Math.sin(a - b)]);
      J.legs.push([hip, knee, foot]);
      var sh = at(0, 1.43 + bob, 0.12 * s), aa = -amp * 0.85 * Math.sin(phase);
      var el = add(sh, add(mul(fwd, 0.29 * Math.sin(aa)), add([0, -0.29 * Math.cos(aa), 0], mul(side, 0.035 * s))));
      var hd = add(el, add(mul(fwd, 0.27 * Math.sin(aa + 0.3)), [0, -0.27 * Math.cos(aa + 0.3), 0]));
      var hint = add([0, -1, 0], mul(side, 0.45 * s));
      if (s > 0) {
        var ws = armWeight(F, t, 'shake');
        if (ws > 0) {
          var env = clamp((t - 2.85) / 0.2, 0, 1) * clamp((3.6 - t) / 0.2, 0, 1);
          var k1 = ik(sh, add(SHAKE_AT, [0, 0.04 * Math.sin((t - 2.85) * 15) * env, 0]), 0.29, 0.27, hint);
          el = lerp3(el, k1.e, ws); hd = lerp3(hd, k1.h, ws);
        }
        var wp = armWeight(F, t, 'point');
        if (wp > 0) {
          var aim = add(sh, mul(norm(sub([0, 1.62 + 0.05 * Math.sin(t * 2 + idx), 0], sh)), 0.56));
          var k2 = ik(sh, aim, 0.29, 0.27, hint);
          el = lerp3(el, k2.e, wp); hd = lerp3(hd, k2.h, wp);
        }
      }
      if (F.performer) {
        var k3 = ik(sh, add(sh, add(mul(side, 0.22 * s), [0, 0.52, 0.05])), 0.29, 0.27, add([0, 1, 0], mul(side, s)));
        el = k3.e; hd = k3.h;
      }
      J.arms.push([sh, el, hd]);
    });
    return J;
  }

  /* ==========================================================================
     Canvas, cameras and projection
     ========================================================================== */
  var W = 1, H = 1, dpr = 1, screen = { x: 0, y: 0, w: 1, h: 1 }, LITE = false;
  function screenRect() {
    var w, h;
    if (W >= H) { h = H * 0.66; w = Math.min(W * 0.82, h * 1.62); }
    else { w = W * 0.9; h = Math.min(H * 0.56, w * 1.25); }
    return { x: (W - w) / 2, y: (H - h) / 2 + H * 0.035, w: w, h: h };
  }
  function chrome(r) {
    var top = 30 * dpr, bot = 24 * dpr, left = r.w > 520 * dpr ? 38 * dpr : 0;
    return { top: top, bot: bot, left: left, inner: { x: r.x + left, y: r.y + top, w: r.w - left, h: r.h - top - bot } };
  }
  function screenScale() { var inner = chrome(screen).inner; return Math.min(inner.w / PLAN_W, inner.h / PLAN_H); }

  // Camera keys. yaw 0 = looking upstage from the audience; pitch 90 = straight down.
  var CAM_A = [
    { t: 0,    target: [0, 1.0, 0],  dist: 9.8, yaw: 0,   pitch: 7,  fov: 34 },
    { t: 2.6,  target: [0, 1.1, 0],  dist: 6.0, yaw: -10, pitch: 9,  fov: 34 },
    { t: 3.9,  target: [0, 1.15, 0], dist: 5.3, yaw: -16, pitch: 12, fov: 34 },
    { t: 6.5,  target: [0, 1.05, 0], dist: 9.0, yaw: -30, pitch: 31, fov: 36 },
    { t: 9.3,  target: [0, 1.3, 0],  dist: 6.4, yaw: -40, pitch: 44, fov: 36 },
    { t: 11.0, target: HOLO_C, dist: HOLO_S * PLAN_D, yaw: 0, pitch: 89.5, frame: 'screen' }
  ];
  var CAM_B = [
    { t: 11.0,  target: PLAN_C, dist: PLAN_D, yaw: 0, pitch: 89.5, frame: 'screen' },
    { t: 13.3,  target: PLAN_C, dist: PLAN_D, yaw: 0, pitch: 89.5, frame: 'screen' },
    { t: 16.1,  target: [-24, 12.5, 5], dist: 46, yaw: -40, pitch: 7,  fov: 40 },
    { t: 17.9,  target: [-20, 13, 1], dist: 56, yaw: -80, pitch: 12, fov: 40 },
    { t: 19.7,  target: [0, 8, -3],   fit: 118, yaw: -34, pitch: 17, fov: 38 },
    { t: 22.0,  target: [0, 15, -4],  fit: 124, yaw: -14, pitch: 9,  fov: 38 },
    { t: 22.05, target: [0, 11.2, -12], fit: 42, yaw: 0, pitch: 1.5, fov: 36, cut: true },   // cut to elevation, like the reference
    { t: 25.0,  target: [0, 11.2, -12], fit: 39, yaw: 0, pitch: 1.5, fov: 36 },
    { t: 27.4,  target: [0, 17, -8],  fit: 176, yaw: 0,  pitch: 5,  fov: 38 },    // the whole facade: wings, arch, band
    { t: 29.3,  target: [6, 12, 12],  fit: 176, yaw: 28, pitch: 14, fov: 38 },    // round to the field: PA, masts, FOH
    { t: 30.4,  target: [0, 33, -4],  fit: 205, yaw: 30, pitch: 9,  fov: 38 },    // exploded into layers
    { t: 31.2,  target: [0, 15, 0],   fit: 150, yaw: 18, pitch: 8,  fov: 38 },
    { t: 33.9,  target: [0, 12, 0],   dist: 64.4, yaw: -1.3, pitch: -6.6, fov: 46, frame: "end" },   // down behind the team at the desk
    { t: 40,    target: [0, 12, 0],   dist: 63.5, yaw: -0.8, pitch: -6.6, fov: 46, frame: "end" }
  ];

  function resolve(k) {
    var aspect = W / H, fov = (k.fov || 38) * DEG, dist = k.dist, f, px = W / 2, py = H / 2;
    if (aspect < 1) fov = Math.min(fov * 1.35, 64 * DEG);
    if (k.fit) {
      var fovX = 2 * Math.atan(Math.tan(fov / 2) * aspect);
      dist = (k.fit * (aspect < 1 ? 0.6 : aspect < 1.3 ? 0.85 : 1) / 2) / Math.tan(fovX / 2);
    }
    if (k.frame === 'screen') {
      var inner = chrome(screen).inner;
      f = screenScale() * PLAN_D; px = inner.x + inner.w / 2; py = inner.y + inner.h / 2;
    } else f = (H / 2) / Math.tan(fov / 2);
    if (k.frame === 'end') { px = W * (aspect > 1.25 ? 0.6 : 0.5); py = H * (aspect < 1 ? 0.36 : 0.45); }
    return { target: k.target, dist: dist, yaw: k.yaw * DEG, pitch: k.pitch * DEG, f: f, px: px, py: py };
  }
  function viewAt(keys, t) {
    var i = 0;
    while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
    var a = resolve(keys[i]);
    if (i === keys.length - 1 || keys[i + 1].cut) return a;
    var b = resolve(keys[i + 1]), u = inOut(clamp((t - keys[i].t) / (keys[i + 1].t - keys[i].t), 0, 1));
    return {
      target: lerp3(a.target, b.target, u), dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), u)),
      yaw: lerp(a.yaw, b.yaw, u), pitch: lerp(a.pitch, b.pitch, u),
      f: Math.exp(lerp(Math.log(a.f), Math.log(b.f), u)), px: lerp(a.px, b.px, u), py: lerp(a.py, b.py, u)
    };
  }
  function camFrom(v, near) {
    var cp = Math.cos(v.pitch), sp = Math.sin(v.pitch);
    var pos = [v.target[0] + v.dist * cp * Math.sin(v.yaw), v.target[1] + v.dist * sp, v.target[2] + v.dist * cp * Math.cos(v.yaw)];
    var fw = norm(sub(v.target, pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
    return { pos: pos, fw: fw, rt: rt, up: up, f: v.f, px: v.px, py: v.py, dist: v.dist, near: near };
  }
  function cameraA(t) { return camFrom(viewAt(CAM_A, t), 0.04); }
  function cameraB(t) {
    var v = viewAt(CAM_B, t);
    if (t > T.lift[1]) v.yaw += 0.05 * Math.sin((t - T.lift[1]) * 0.21);   // a slow breath in the long shots
    return camFrom(v, 0.5);
  }
  // The stage seen through the people's camera: the plan hovering at 1 : 62 above the table.
  function toStage(cA) {
    return { pos: add(PLAN_C, mul(sub(cA.pos, HOLO_C), 1 / HOLO_S)), fw: cA.fw, rt: cA.rt, up: cA.up, f: cA.f, px: cA.px, py: cA.py, dist: cA.dist / HOLO_S, near: 0.5 };
  }

  var PX = 0, PY = 0, PZ = 0;
  function pj(c, x, y, z) {
    var dx = x - c.pos[0], dy = y - c.pos[1], dz = z - c.pos[2];
    var zz = dx * c.fw[0] + dy * c.fw[1] + dz * c.fw[2];
    if (zz < c.near) return false;
    var xx = dx * c.rt[0] + dy * c.rt[1] + dz * c.rt[2];
    var yy = dx * c.up[0] + dy * c.up[1] + dz * c.up[2];
    PX = c.px + xx * c.f / zz; PY = c.py - yy * c.f / zz; PZ = zz;
    return true;
  }
  function project(c, p) { return pj(c, p[0], p[1], p[2]) ? [PX, PY, PZ] : null; }
  function roundRect(r, rad) {
    ctx.beginPath();
    ctx.moveTo(r.x + rad, r.y);
    ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
    ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
    ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
    ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
    ctx.closePath();
  }
  // Soft glows are drawn from small pre-rendered sprites (one per colour), not per-frame gradients.
  var sprites = {};
  function sprite(col) {
    var key = col.join(','), s = sprites[key];
    if (!s) {
      s = document.createElement('canvas'); s.width = s.height = 64;
      var g2 = s.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, rgba(col, 1)); gr.addColorStop(0.35, rgba(col, 0.35)); gr.addColorStop(1, rgba(col, 0));
      g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
      sprites[key] = s;
    }
    return s;
  }
  function glowDot(x, y, r, col, a) {
    if (a <= 0.003 || r <= 0.5) return;
    var prev = ctx.globalAlpha;
    ctx.globalAlpha = prev * Math.min(1, a);
    ctx.drawImage(sprite(col), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = prev;
  }

  /* ==========================================================================
     Act 1: the people
     ========================================================================== */
  // The floor grid of act 1, built once: short segments grouped by distance from the centre, so it fades outward.
  var FLOOR = (function () {
    var R0 = 7.5, step = 0.5, x, lines = [[], [], [], []];
    for (x = -R0; x <= R0 + 1e-6; x += step) {
      var h = Math.sqrt(Math.max(0, R0 * R0 - x * x));
      for (var z = -h; z < h - 1e-6; z += step) {
        var z2 = Math.min(h, z + step), dmid = Math.hypot(x, (z + z2) / 2), b = clamp(Math.floor(dmid / R0 * 4), 0, 3);
        lines[b].push([x, 0, z], [x, 0, z2], [z, 0, x], [z2, 0, x]);
      }
    }
    return lines;
  })();
  function drawFloorA(t, c, a) {
    if (a <= 0) return;
    ctx.lineWidth = dpr;
    FLOOR.forEach(function (L, b) {
      ctx.strokeStyle = rgba(MUTED, a * [0.2, 0.13, 0.07, 0.03][b]);
      ctx.beginPath();
      for (var i = 0; i < L.length; i += 2) {
        if (!pj(c, L[i][0], L[i][1], L[i][2])) continue;
        var x0 = PX, y0 = PY;
        if (!pj(c, L[i + 1][0], L[i + 1][1], L[i + 1][2])) continue;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      }
      ctx.stroke();
    });
    // a pool of light where they will meet
    if (pj(c, 0, 0, 0)) {
      var r = 3.2 * c.f / PZ;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(PX, PY); ctx.scale(1, clamp(Math.abs(c.fw[1]) * 1.2, 0.18, 1));
      glowDot(0, 0, r, WARM, 0.07 * a);
      ctx.restore();
    }
  }
  function ringOnFloor(c, cx, y, cz, r, col, a, w) {
    if (a <= 0.003) return;
    ctx.beginPath();
    for (var i = 0, first = true; i <= 48; i++) {
      var an = i / 48 * Math.PI * 2;
      if (!pj(c, cx + r * Math.cos(an), y, cz + r * Math.sin(an))) { first = true; continue; }
      if (first) { ctx.moveTo(PX, PY); first = false; } else ctx.lineTo(PX, PY);
    }
    ctx.strokeStyle = rgba(col, a);
    ctx.lineWidth = w * dpr;
    ctx.stroke();
  }
  function drawTable(t, c, a) {
    var e = outCubic(span(t, T.table));
    if (e <= 0 || a <= 0) return;
    var y = lerp(0.02, 1.0, e), r = 1.05, top = [], i;
    for (i = 0; i < 48; i++) { var an = i / 48 * Math.PI * 2; if (pj(c, r * Math.cos(an), y, r * Math.sin(an))) top.push([PX, PY]); }
    // pedestal
    ctx.strokeStyle = rgba(INK, 0.35 * a * e); ctx.lineWidth = dpr;
    ctx.beginPath();
    for (i = 0; i < 8; i++) {
      var b = i / 8 * Math.PI * 2;
      if (!pj(c, 0.22 * Math.cos(b), 0, 0.22 * Math.sin(b))) continue;
      var x0 = PX, y0 = PY;
      if (!pj(c, 0.22 * Math.cos(b), y, 0.22 * Math.sin(b))) continue;
      ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
    }
    ctx.stroke();
    if (top.length > 2) {
      ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]);
      for (i = 1; i < top.length; i++) ctx.lineTo(top[i][0], top[i][1]);
      ctx.closePath();
      ctx.fillStyle = rgba([18, 20, 22], 0.92 * a * e); ctx.fill();
      ctx.strokeStyle = rgba(LIME, 0.85 * a * e); ctx.lineWidth = 1.4 * dpr; ctx.stroke();
    }
    ringOnFloor(c, 0, y + 0.002, 0, 0.62, TEAL, 0.35 * a * e, 1);
    // the hologram emitter
    var on = span(t, [T.burst - 0.2, T.burst + 0.4]) * a;
    if (on > 0 && pj(c, 0, y, 0)) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glowDot(PX, PY, 0.7 * c.f / PZ, LIME, 0.3 * on);
      ctx.restore();
    }
  }
  function drawFigure(c, F, idx, t, a, focusZ) {
    a *= smooth(clamp((t - (F.way[0][0] - 0.4)) / 0.7, 0, 1));   // each person steps in out of the dark
    if (a <= 0) return null;
    var J = pose(F, t, idx);
    if (!pj(c, J.pelvis[0], J.pelvis[1], J.pelvis[2])) return;
    var s = c.f / PZ;
    // whoever stands between us and the table is backlit: a darker silhouette with a rim of light
    var body = mix(INK, [74, 72, 68], clamp((focusZ - PZ) / 1.8, 0, 0.8));
    // shadow
    if (pj(c, J.base[0], J.base[1] + 0.001, J.base[2])) {
      var sx = PX, sy = PY;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(1, clamp(Math.abs(c.fw[1]) * 1.4, 0.15, 1));
      ctx.fillStyle = rgba([0, 0, 0], 0.45 * a);
      ctx.beginPath(); ctx.arc(0, 0, 0.36 * s, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    var chains = [J.legs[0], J.legs[1], [J.neck, J.pelvis], J.arms[0], J.arms[1]], pts = [];
    chains.forEach(function (ch) {
      var q = [];
      for (var i = 0; i < ch.length; i++) { if (!pj(c, ch[i][0], ch[i][1], ch[i][2])) return; q.push([PX, PY]); }
      pts.push(q);
    });
    if (!pj(c, J.head[0], J.head[1], J.head[2])) return;
    var hx = PX, hy = PY;
    function strokeAll(col, al, grow) {
      ctx.strokeStyle = rgba(col, al); ctx.fillStyle = rgba(col, al);
      pts.forEach(function (q, n) {
        ctx.lineWidth = (n === 2 ? 0.155 : 0.074) * s * grow;
        ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
        for (var i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
        ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(hx, hy, 0.112 * s * (grow > 1 ? 1.25 : 1), 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var think = span(t, [6.1, 6.5]) * (1 - span(t, [9.2, 9.8]));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    strokeAll(LIME, (0.035 + 0.05 * think) * a, 1.6);
    ctx.restore();
    strokeAll(body, 0.94 * a, 1);
    if (think > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glowDot(hx, hy - 0.05 * s, 0.3 * s, LIME, 0.16 * think * a * (0.75 + 0.25 * Math.sin(t * 5 + idx)));
      ctx.restore();
    }
    return J;
  }
  function drawBurst(t, c) {
    var k = (t - 2.95) / 0.9;
    if (k <= 0 || k >= 1 || !pj(c, SHAKE_AT[0], SHAKE_AT[1], SHAKE_AT[2])) return;
    var x = PX, y = PY, s = c.f / PZ;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glowDot(x, y, (0.12 + 0.5 * outCubic(k)) * s, LIME, 0.9 * (1 - k));
    seed = 99;
    for (var i = 0; i < 16; i++) {
      var an = rnd() * Math.PI * 2, el = (rnd() - 0.3) * 1.4, sp = 0.25 + rnd() * 0.45, d = sp * outCubic(k);
      if (!pj(c, SHAKE_AT[0] + Math.cos(an) * Math.cos(el) * d, SHAKE_AT[1] + Math.sin(el) * d, SHAKE_AT[2] + Math.sin(an) * Math.cos(el) * d)) continue;
      ctx.fillStyle = rgba(i % 3 ? LIME : WARM, 0.9 * (1 - k));
      ctx.fillRect(PX - dpr, PY - dpr, 2 * dpr, 2 * dpr);
    }
    ctx.restore();
  }

  // Ideas: sparks leave the team's heads, gather into one small spinning crystal (the seed),
  // and when it bursts they land on the plan's key points and the plan draws itself.
  var SEED = [0, 1.9, 0];
  var OCTA = [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
  var OCTA_EDGES = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]];
  function octaPoint(c, h, w, ang, v) {   // vertex v of an octahedron (half-height h, half-width w) turned by ang about y
    var o = OCTA[v], x = o[0] * w, z = o[2] * w, ca = Math.cos(ang), sa = Math.sin(ang);
    return [c[0] + x * ca + z * sa, c[1] + o[1] * h, c[2] - x * sa + z * ca];
  }
  function seedSize(t) { return (0.05 + 0.13 * smooth(span(t, [6.4, 7.35]))) * (1 - smooth(span(t, [T.burst, T.burst + 0.3]))); }
  function seedVertex(t, v) { var s = seedSize(t); return octaPoint(SEED, s * 1.35, s, t * 2.4, v); }
  var SPARKS = [];
  (function () {
    var order = nodes.map(function (n, i) { return i; });
    seed = 4242;
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    var k = 0;
    for (var round = 0; round < 6; round++) FIGS.forEach(function (F, fi) {
      if (k >= order.length) return;
      SPARKS.push({ fi: fi, tb: T.spark[0] + round * 0.12 + fi * 0.03, dur: 0.55, v: k % 6,
        tu: T.burst + (k % 12) * 0.02, dur2: 0.75 + (k % 3) * 0.1, node: toA(nodes[order[k++]]), bend: (rnd() - 0.5) * 0.6 });
    });
  })();
  function trail(c, B, e, a, headCol) {
    var q = [];
    for (var i = 0; i <= 6; i++) { var pt = B(clamp(e - 0.22 * (1 - i / 6), 0, 1)); if (pj(c, pt[0], pt[1], pt[2])) q.push([PX, PY]); }
    for (i = 1; i < q.length; i++) {
      ctx.strokeStyle = rgba(i > 4 ? WARM : LIME, a * 0.18 * i);
      ctx.lineWidth = (0.6 + i * 0.25) * dpr;
      ctx.beginPath(); ctx.moveTo(q[i - 1][0], q[i - 1][1]); ctx.lineTo(q[i][0], q[i][1]); ctx.stroke();
    }
    if (q.length) glowDot(q[q.length - 1][0], q[q.length - 1][1], 5 * dpr, headCol, 0.9 * a);
  }
  function drawSparks(t, c, heads, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    // the seed itself
    var s = seedSize(t);
    if (t > 6.4 && s > 0.004) {
      var burst = clamp(1 - Math.abs(t - T.burst) / 0.25, 0, 1);
      ctx.strokeStyle = rgba(LIME, a * (0.85 + 0.15 * burst)); ctx.lineWidth = 1.3 * dpr;
      ctx.beginPath();
      OCTA_EDGES.forEach(function (e2) {
        var p = seedVertex(t, e2[0]), q = seedVertex(t, e2[1]);
        if (!pj(c, p[0], p[1], p[2])) return;
        var x0 = PX, y0 = PY;
        if (!pj(c, q[0], q[1], q[2])) return;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      });
      ctx.stroke();
      if (pj(c, SEED[0], SEED[1], SEED[2])) glowDot(PX, PY, (0.35 + 1.4 * burst) * c.f / PZ, LIME, (0.25 + 0.7 * burst) * a);
    }
    var rising = [];
    SPARKS.forEach(function (sp) {
      var u = (t - sp.tb) / sp.dur;
      if (u <= 0) return;
      var h = heads[sp.fi] || [0, 1.7, 0], p0, p1, p2;
      if (t < sp.tu) {
        // rising from the head into the seed
        p0 = add(h, [0, 0.14, 0]); p2 = seedVertex(t, sp.v);
        p1 = add(mul(add(p0, p2), 0.5), [sp.bend * 0.4, 0.45, sp.bend * 0.2]);
        var B = function (v) { var w = 1 - v; return add(add(mul(p0, w * w), mul(p1, 2 * w * v)), mul(p2, v * v)); };
        if (u < 1) {
          trail(c, B, outCubic(u), a, WARM);
          var hp = B(outCubic(u));
          if (pj(c, hp[0], hp[1], hp[2])) rising.push(PX, PY);
        } else if (pj(c, p2[0], p2[1], p2[2])) glowDot(PX, PY, 4 * dpr, LIME, 0.8 * a);
        return;
      }
      // out of the burst and down onto the plan
      var u2 = (t - sp.tu) / sp.dur2;
      p0 = seedVertex(sp.tu, sp.v); p2 = sp.node;
      p1 = add(mul(add(p0, p2), 0.5), [sp.bend, 0.5, sp.bend * 0.5]);
      if (u2 < 1) trail(c, function (v) { var w = 1 - v; return add(add(mul(p0, w * w), mul(p1, 2 * w * v)), mul(p2, v * v)); }, outCubic(u2), a, LIME);
      else if (pj(c, p2[0], p2[1], p2[2])) {
        var land = clamp(1 - (u2 - 1) * sp.dur2 / 0.5, 0, 1);
        glowDot(PX, PY, (3 + 9 * land) * dpr, LIME, (0.35 + 0.6 * land) * a * (1 - span(t, [10.2, 11.0])));
      }
    });
    // ideas finding each other: faint links between sparks that pass close on their way to the seed
    if (rising.length > 2) {
      var reach = 70 * dpr;
      ctx.lineWidth = dpr;
      for (var i = 0; i < rising.length; i += 2) for (var j = i + 2; j < rising.length; j += 2) {
        var dx = rising[i] - rising[j], dy = rising[i + 1] - rising[j + 1], d = Math.sqrt(dx * dx + dy * dy);
        if (d > reach) continue;
        ctx.strokeStyle = rgbaS(LIME, 1, (1 - d / reach) * 0.35 * a);
        ctx.beginPath(); ctx.moveTo(rising[i], rising[i + 1]); ctx.lineTo(rising[j], rising[j + 1]); ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ==========================================================================
     The plan (hologram in act 1, CAD in act 2, floor under the build)
     ========================================================================== */
  var PLAN_GROUPS = null;   // the plan's lines grouped by style, for the cheap path once it has finished drawing
  function drawPlan(t, c, fade, holo, liftK, power) {
    var pen = null;
    if (fade <= 0) return pen;
    if (!holo && t >= T.open[1] + 0.1) {
      if (!PLAN_GROUPS) {
        var m = new Map();
        plan.forEach(function (e) { var g = m.get(e.st); if (!g) { g = []; m.set(e.st, g); } g.push(e); });
        PLAN_GROUPS = [];
        m.forEach(function (lines, st) { PLAN_GROUPS.push({ st: st, lines: lines }); });
      }
      ctx.lineCap = 'round';
      PLAN_GROUPS.forEach(function (g) {
        var st = g.st, alpha = st.a * fade * lerp(1, st.keep, liftK) * (1 - 0.75 * power);
        if (alpha <= 0.004) return;
        ctx.strokeStyle = rgba(st.c, alpha); ctx.lineWidth = st.w * dpr;
        ctx.setLineDash(st.dash ? st.dash.map(function (v) { return v * dpr; }) : []);
        ctx.beginPath();
        g.lines.forEach(function (e) {
          if (!pj(c, e.a[0], e.a[1], e.a[2])) return;
          var ax = PX, ay = PY;
          if (!pj(c, e.b[0], e.b[1], e.b[2])) return;
          ctx.moveTo(ax, ay); ctx.lineTo(PX, PY);
        });
        ctx.stroke();
      });
      ctx.setLineDash([]);
      return null;
    }
    ctx.lineCap = 'round';
    if (holo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; }
    for (var i = 0; i < plan.length; i++) {
      var e = plan[i];
      if (t < e.t0) continue;
      var k = clamp((t - e.t0) / (e.t1 - e.t0), 0, 1), st = e.st;
      var ex = k < 1 ? add(e.a, mul(sub(e.b, e.a), k)) : e.b;
      if (!pj(c, e.a[0], e.a[1], e.a[2])) continue;
      var ax = PX, ay = PY;
      if (!pj(c, ex[0], ex[1], ex[2])) continue;
      var alpha = st.a * fade * lerp(1, st.keep, liftK) * (1 - 0.75 * power);
      var col = holo > 0 ? mix(st.c, st.c === MUTED || st.c === INK ? TEAL : st.c, holo) : st.c;
      if (holo > 0) alpha *= lerp(1, 0.85 + 0.15 * Math.sin(t * 23 + i), holo);
      if (alpha > 0.004) {
        ctx.strokeStyle = rgba(col, alpha);
        ctx.lineWidth = st.w * dpr * (holo > 0 ? lerp(1, 1.25, holo) : 1);
        ctx.setLineDash(st.dash && holo < 0.5 ? st.dash.map(function (v) { return v * dpr; }) : []);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(PX, PY); ctx.stroke();
      }
      if (!pen || e.t0 >= pen.t0) pen = { t0: e.t0, p: [PX, PY], x: ex[0], z: ex[2], layer: st.layer };
    }
    ctx.setLineDash([]);
    if (holo > 0) ctx.restore();
    return pen;
  }
  function drawLabels(t, c, fade) {
    if (fade <= 0) return;
    var size = clamp(c.f / c.dist * 1.15, 8.5 * dpr, 12 * dpr);
    ctx.font = '500 ' + size.toFixed(1) + 'px ' + MONO;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    labels.forEach(function (l) {
      if (t < l.t0) return;
      var p = project(c, l.p);
      if (!p) return;
      var shown = l.text.slice(0, Math.ceil(l.text.length * clamp((t - l.t0) / 0.35, 0, 1)));
      ctx.fillStyle = rgba(l.c, 0.9 * fade * clamp((t - l.t0) / 0.2, 0, 1));
      if (l.along) {
        var p1 = project(c, l.along[0]), p2 = project(c, l.along[1]);
        if (p1 && p2) {
          var ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
          if (ang > Math.PI / 2) ang -= Math.PI;
          if (ang < -Math.PI / 2) ang += Math.PI;
          ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.fillText(shown, 0, 0); ctx.restore();
          return;
        }
      }
      ctx.fillText(shown, p[0], p[1]);
    });
  }

  /* ==========================================================================
     Acts 3 and 4: the build and the power
     ========================================================================== */
  var MX = 0, MY = 0, MZ = 0;
  // The exploded view: every trade lifts to its own height, like the reference's exploded coda.
  var LAYER = { plate: 0, deck: 0, barrier: 0, tower: 1, spine: 1, scaff: 1, tier: 1, roof: 2, skin: 2, rig: 2, clamp: 2, fixture: 2,
    led: 3, disc: 3, imag: 3, band: 3, ribbon: 3, halo: 4, ring2: 4, bracket: 4, wing: 4, arch: 4, pa: 5, fx: 5, laser: 5 };
  var LAYER_Y = [0, 8, 17, 27, 38, 49];
  var LAYER_NAMES = ['01  DECK', '02  GROUND SUPPORT', '03  ROOF  ·  RIG  ·  LIGHT', '04  VIDEO', '05  SCENIC', '06  AUDIO  ·  FX'];
  function explodeK(t) {
    var e = T.explode;
    if (t <= e[0] || t >= e[3]) return 0;
    if (t < e[1]) return inOut(span(t, [e[0], e[1]]));
    if (t < e[2]) return 1;
    var u = span(t, [e[2], e[3]]);
    return 1 - u * u * u;
  }
  function explodeY(p, t) {
    var k = explodeK(t);
    if (!k || p.c[2] > 30) return 0;
    return LAYER_Y[p.xl !== undefined ? p.xl : (LAYER[p.kind] || 0)] * k;
  }
  function motion(p, t) {
    var k = clamp((t - p.t0) / p.dur, 0, 1);
    if (k <= 0) return null;
    var M = { k: k, dy: (p.lift ? roofY(t) : 0) + explodeY(p, t), off: null, gs: -1, ps: -1 };
    if (p.anim === 'drop') { var e = outBack(k); if (e !== 1) M.off = mul(p.arrive, 1 - e); }
    else if (p.anim === 'grow') M.gs = outCubic(k);
    else if (p.anim === 'pop') M.ps = 0.2 + 0.8 * outBack(k);
    return M;
  }
  function mv(p, M, q) {
    var x = q[0], y = q[1], z = q[2];
    if (M.off) { x += M.off[0]; y += M.off[1]; z += M.off[2]; }
    else if (M.gs >= 0) y = p.anchor[1] + (y - p.anchor[1]) * M.gs;
    else if (M.ps >= 0) { x = p.c[0] + (x - p.c[0]) * M.ps; y = p.c[1] + (y - p.c[1]) * M.ps; z = p.c[2] + (z - p.c[2]) * M.ps; }
    MX = x; MY = y + M.dy; MZ = z;
  }
  var LIGHT = norm([-0.35, 0.85, 0.45]);

  // What the screens show once the power is on.
  // One canvas: every LED surface samples the same colour field by its position in the world,
  // so the content flows across the wall, the band, the ribbon and the wings as one image.
  function field(x, y, t) {
    var w = (Math.sin((x / 46 + y / 30 - t * 0.2) * Math.PI * 2) + 1) / 2;
    var col = w < 0.5 ? mix(VIOLET, TEAL, w * 2) : mix(TEAL, LIME, (w - 0.5) * 2);
    var d = Math.hypot(x - HALO.c[0], y - HALO.c[1]);
    var ring = Math.max(0, Math.sin(d * 0.55 - t * 3.6));     // rings travelling out from the halo
    return [mix(col, INK, 0.22 * ring * ring), 0.55 + 0.45 * ring];
  }
  // The lit colour of a screen, blended over its unlit base, as one fill.
  function content(sc, t, lit, base, sh, alpha) {
    var col, g, f;
    if (sc.grp === 'led' || sc.grp === 'disc' || sc.grp === 'band' || sc.grp === 'ribbon') {
      f = field(sc.x, sc.y, t); col = f[0]; g = f[1];
      if (sc.grp === 'disc') col = mix(col, INK, 0.3 * Math.max(0, Math.sin(sc.a * 12 + t * 3)));
      if (sc.grp === 'ribbon') { var scan = Math.max(0, Math.sin(sc.x * 0.25 - t * 5)); col = mix(col, LIME, scan * scan); g = 0.6 + 0.4 * scan; }
    } else if (sc.grp === 'wing') {
      var ch = (Math.sin(sc.seg * 1.3 - t * 6.5 + sc.fin * 0.9) + 1) / 2;
      f = field(sc.x, sc.y, t);
      col = mix(f[0], LIME, ch * ch); g = 0.4 + 0.6 * ch;
    } else if (sc.grp === 'imag') {
      col = mix([26, 22, 42], [58, 40, 88], sc.v); g = 0.85;
    } else if (sc.grp === 'console') {
      col = TEAL; g = 0.5 + 0.1 * Math.sin(t * 2 + sc.x);
    } else { // halo rings
      var pulse = (Math.sin(sc.a * Math.PI * 4 - t * 5) + 1) / 2;
      col = sc.grp === 'halo' ? mix(LIME, INK, pulse * 0.4) : mix(WARM, INK, pulse * 0.5); g = 0.75 + 0.25 * pulse;
    }
    var k = clamp(lit * g, 0, 1), u = sh * (1 - k);
    return rgbaS([base[0] * u + col[0] * k, base[1] * u + col[1] * k, base[2] * u + col[2] * k], 1, Math.max(alpha, 0.35 * k + alpha * (1 - k)));
  }
  // Power comes on from the halo outward: the rings first, then each surface by its distance.
  function litAt(sc, t) {
    var d;
    if (sc.grp === 'halo') d = 0; else if (sc.grp === 'ring2') d = 3;
    else if (sc.grp === 'imag') d = 30; else if (sc.grp === 'console') d = 12;
    else d = 6 + Math.hypot(sc.x - HALO.c[0], sc.y - HALO.c[1]);
    return clamp((t - (T.power[0] + 0.1 + d * 0.028)) / 0.35, 0, 1);
  }

  // Edges are gathered into one pending path while consecutive parts share a style,
  // and flushed whenever the style changes or a part with faces has to be painted.
  var pend = { key: '', col: INK, a: 1, w: 1, xy: [] };
  var flushes = 0;
  function flushPend() {
    if (pend.xy.length) {
      flushes++;
      ctx.strokeStyle = rgba(pend.col, pend.a);
      ctx.lineWidth = pend.w * dpr;
      ctx.beginPath();
      for (var j = 0; j < pend.xy.length; j += 4) { ctx.moveTo(pend.xy[j], pend.xy[j + 1]); ctx.lineTo(pend.xy[j + 2], pend.xy[j + 3]); }
      ctx.stroke();
      pend.xy.length = 0;
    }
    pend.key = '';
  }
  function fillPoly(xy) {
    ctx.beginPath(); ctx.moveTo(xy[0], xy[1]);
    for (var i = 2; i < xy.length; i += 2) ctx.lineTo(xy[i], xy[i + 1]);
    ctx.closePath(); ctx.fill();
  }
  // Level of detail: a truss far away is drawn as its four chords, or as a single line.
  function lodSegs(p, c) {
    if (!p.truss) return p.segs.length;
    var m = p.truss, dy = p._M ? p._M.dy : 0;
    if (!pj(c, (m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2 + dy, (m.a[2] + m.b[2]) / 2)) return 0;
    var px = m.size * c.f / PZ;
    return px < (LITE ? 2.2 : 1.6) * dpr ? -1 : px < (LITE ? 7 : 4.5) * dpr ? 4 : p.segs.length;
  }
  function pushSegs(xy, p, M, c, n) {
    if (n === -1) {
      var m = p.truss;
      mv(p, M, m.a); if (!pj(c, MX, MY, MZ)) return;
      var ax = PX, ay = PY;
      mv(p, M, m.b); if (!pj(c, MX, MY, MZ)) return;
      xy.push(ax, ay, PX, PY);
      return;
    }
    var segs = p.segs, count = p.anim === 'draw' ? Math.floor(segs.length * M.k) : n;
    for (var s = 0; s < count; s++) {
      mv(p, M, segs[s][0]); if (!pj(c, MX, MY, MZ)) continue;
      var x0 = PX, y0 = PY;
      mv(p, M, segs[s][1]); if (!pj(c, MX, MY, MZ)) continue;
      xy.push(x0, y0, PX, PY);
    }
  }
  // Faces are collected per depth band, sorted, and filled in runs of the same colour;
  // edges in the same band are grouped by style and stroked once per style.
  var faceList = [], facePool = [], fpi = 0;
  function collectFaces(t, c, p, power, keep) {
    // wireframe first, then shaded: the faces fill in just after the part lands (the CAD reveal)
    var M = p._M, st = p.st, fadeIn = (p.anim === 'fade' ? M.k : clamp((t - (p.t0 + p.dur * 0.55)) / 0.35, 0, 1)) * keep, j, v;
    if (fadeIn <= 0.01) return;
    for (j = 0; j < p.faces.length; j++) {
      var f = p.faces[j], q = f.p;
      mv(p, M, q[0]);   // back faces are dropped before anything is projected
      var facing = f.n[0] * (c.pos[0] - MX) + f.n[1] * (c.pos[1] - MY) + f.n[2] * (c.pos[2] - MZ) > 0;
      if (!facing && !f.two) continue;
      var slot = facePool[fpi] || (facePool[fpi] = { xy: [], d: 0, fill: '' });
      var xy = slot.xy, dsum = 0, ok = true;
      xy.length = 0;
      for (v = 0; v < q.length; v++) {
        if (v) mv(p, M, q[v]);
        if (!pj(c, MX, MY, MZ)) { ok = false; break; }
        xy.push(PX, PY); dsum += PZ;
      }
      if (!ok) continue;
      fpi++;
      var sh = st.flat ? 1 : Math.round((0.55 + 0.55 * Math.max(0, dot(f.n, LIGHT))) * (facing ? 1 : 0.55) * 20) / 20;
      var lit = f.screen && power > 0 && facing ? litAt(f.screen, t) : 0;
      slot.fill = lit > 0 ? content(f.screen, t, lit, st.f, sh, st.fa * fadeIn) : rgbaS(st.f, sh, st.fa * fadeIn);
      slot.d = dsum / q.length;
      faceList.push(slot);
    }
  }
  function fillFaces() {
    if (!faceList.length) return;
    faceList.sort(function (a, b) { return b.d - a.d; });
    var cur = null;
    for (var i = 0; i < faceList.length; i++) {
      var s = faceList[i], xy = s.xy;
      if (s.fill !== cur) { if (cur !== null) ctx.fill(); ctx.fillStyle = cur = s.fill; ctx.beginPath(); }
      ctx.moveTo(xy[0], xy[1]);
      for (var k = 2; k < xy.length; k += 2) ctx.lineTo(xy[k], xy[k + 1]);
      ctx.closePath();
    }
    ctx.fill();
    faceList.length = 0;
  }
  var buckets = new Map(), used = [];
  function bucket(key, col, a, w) {
    var b = buckets.get(key);
    if (!b) { b = { col: col, a: a, w: w, xy: [], on: false }; buckets.set(key, b); }
    if (!b.on) { b.on = true; b.col = col; b.a = a; b.w = w; used.push(b); }
    return b;
  }
  function strokeBuckets() {
    for (var i = 0; i < used.length; i++) {
      var b = used[i];
      if (b.xy.length) {
        flushes++;
        ctx.strokeStyle = rgbaS(b.col, 1, b.a);
        ctx.lineWidth = b.w * dpr;
        ctx.beginPath();
        for (var j = 0; j < b.xy.length; j += 4) { ctx.moveTo(b.xy[j], b.xy[j + 1]); ctx.lineTo(b.xy[j + 2], b.xy[j + 3]); }
        ctx.stroke();
        b.xy.length = 0;
      }
      b.on = false;
    }
    used.length = 0;
  }

  // The stage, painted from the back to the front in depth bands.
  var active = [], BAND = 40;
  function isModule(p) { return p.xl === 4 || p.kind === 'halo' || p.kind === 'ring2' || p.kind === 'disc' || p.kind === 'led' || p.kind === 'bracket' || (p.kind === 'spine' && p.t0 > 22); }
  function drawStage(t, c, power) {
    var i, p, M, dNear = c.dist * 0.45, dFar = c.dist * 1.9, landed = 0;
    active.length = 0; fpi = 0; flushes = 0;
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      if (t < p.t0) continue;
      M = motion(p, t);
      if (!M) continue;
      if (t >= p.t0 + p.dur * 0.7) landed++;
      if (!pj(c, p.c[0], p.c[1] + M.dy, p.c[2])) continue;
      // skip what can't be seen: smaller than a pixel, or wholly off screen
      var pr = p.r * c.f / PZ, m2 = pr + 60 * dpr;
      if (pr < 0.45 * dpr || PX < -m2 || PX > W + m2 || PY < -m2 || PY > H + m2) continue;
      p._M = M; p._d = PZ; p._pr = pr;
      active.push(p);
    }
    var qs = now();
    active.sort(function (a, b) { return b._d - a._d; });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the slam: every edge flashes lime for a moment as the exploded layers land together
    var slam = t >= T.explode[3] ? clamp(1 - (t - T.explode[3]) / 0.45, 0, 1) : 0, slamQ = Math.round(slam * 6);
    // while the halo module builds in elevation, everything else steps back so it reads alone
    var focus = span(t, [22.0, 22.4]) * (1 - span(t, [24.9, 25.6]));
    for (var b0 = 0; b0 < active.length; b0 += BAND) {
      var b1 = Math.min(active.length, b0 + BAND);
      for (i = b0; i < b1; i++) {
        p = active[i];
        // out in the field (delays, FOH) things step back once the show starts, so the stage owns the frame
        var keep = p.c[2] > 30 ? lerp(1, p.kind === 'foh' || p.kind === 'console' ? 0.12 : 0.3, power) : 1;
        if (focus > 0 && !isModule(p)) keep *= 1 - 0.6 * focus;
        p._keep = keep;
        // small structural parts read fine as outlines; screens always get their faces
        if (p.faces.length && p._pr > (p.screens ? 1.5 : LITE ? 8 : 5) * dpr) collectFaces(t, c, p, power, keep);
      }
      fillFaces();
      for (i = b0; i < b1; i++) {
        p = active[i]; M = p._M;
        var st = p.st;
        if (st.noEdge) continue;
        var n = lodSegs(p, c);
        if (n === 0) continue;
        var depth = clamp(1.3 - (p._d - dNear) / (dFar - dNear) * 0.85, 0.32, 1);
        var lit = p.kind === 'halo' || p.kind === 'wing' || p.kind === 'ring2';
        var a = st.ea * (p.anim === 'fade' ? M.k : clamp(M.k * 2.2, 0, 1)) * depth * lerp(1, lit ? 0.5 : 0.55, power) * p._keep;
        var aq = Math.round(clamp(a + slamQ / 6 * 0.35 * p._keep, 0, 1) * 14);
        // parts arrive in their trade colour with a short lime tick as they land
        var fresh = Math.round((1 - clamp((t - (p.t0 + p.dur)) / 0.2, 0, 1)) * 3);
        var key = (((p.ki * 15 + aq) * 9 + Math.round(power * 8)) * 7 + slamQ) * 4 + fresh;
        var b = buckets.get(key);
        if (!b || !b.on) {
          var col = power > 0 ? mix(st.e, INK, power * (lit ? 0.2 : 0.7)) : st.e;
          if (fresh > 0) col = mix(col, LIME, fresh / 3 * 0.85);
          if (slamQ > 0) col = mix(col, LIME, slamQ / 6 * 0.85);
          b = bucket(key, col, aq / 14, st.w);
        }
        pushSegs(b.xy, p, M, c, n);
      }
      strokeBuckets();
    }
    qs = lap('s_paint', qs); prof.n_active = active.length; prof.n_faces = fpi; prof.n_flush = flushes;
    // The moment each part lands: a short flash in its type colour.
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < active.length; i++) {
      p = active[i];
      var land = t - (p.t0 + p.dur * 0.7);
      if (land <= 0 || land >= 0.45 || p.st.noEdge) continue;
      var k2 = Math.round((1 - land / 0.45) * 6);
      var fc = p.kind === 'deck' || p.kind === 'pa' || p.kind === 'foh' || p.kind === 'rig' ? INK : p.st.e;
      pushSegs(bucket(-1 - (p.ki * 7 + k2), fc, 0.7 * k2 / 6, 2.2).xy, p, p._M, c, lodSegs(p, c));
    }
    strokeBuckets();
    ctx.restore();
    return landed;
  }

  function drawChains(t, c) {
    var a = span(t, [19.3, 19.7]) * (1 - span(t, [22.0, 22.6]));
    if (a <= 0) return;
    var dy = roofY(t);
    ctx.save();
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.strokeStyle = rgba(AMBER, 0.85 * a); ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    TOWERS.forEach(function (tw) {
      [-0.25, 0.25].forEach(function (o) {
        if (!pj(c, tw[0] + o, 25.85, tw[1])) return;
        var x0 = PX, y0 = PY;
        if (!pj(c, tw[0] + o, 24.3 + dy, tw[1])) return;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      });
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawCallouts(t, c, fade) {
    if (fade <= 0) return;
    var size = 10.5 * dpr;
    ctx.font = '500 ' + size.toFixed(1) + 'px ' + MONO;
    ctx.textBaseline = 'middle';
    callouts.forEach(function (o) {
      var a = clamp((t - o.t0) / 0.25, 0, 1) * clamp((o.t1 - t) / 0.35, 0, 1) * fade;
      if (a <= 0) return;
      var p = o.p, dy = o.live === 'lift' ? roofY(t) : 0;
      if (!pj(c, p[0], p[1] + dy, p[2])) return;
      var x = PX, y = PY, lx = x + o.dx * dpr, ly = y + o.dy * dpr, right = o.dx >= 0;
      if (lx < 16 * dpr || lx > W - 16 * dpr || ly < 16 * dpr || ly > H - 16 * dpr) return;
      var text = o.text + (o.live === 'lift' ? '  +' + (TRIM + dy).toFixed(3) : '');
      var shown = text.slice(0, Math.ceil(text.length * clamp((t - o.t0) / 0.5, 0, 1)));
      ctx.strokeStyle = rgba(o.c, 0.7 * a); ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.lineTo(lx + (right ? 1 : -1) * 14 * dpr, ly); ctx.stroke();
      ctx.fillStyle = rgba(o.c, 0.95 * a);
      ctx.beginPath(); ctx.arc(x, y, 2.4 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(shown, lx + (right ? 1 : -1) * 20 * dpr, ly);
    });
  }

  /* ---- Power: beams, lasers, flames, haze, the crowd -------------------- */
  function beam(c, o, dir, L, radius, col, alpha) {
    if (!pj(c, o[0], o[1], o[2])) return;
    var ax = PX, ay = PY, az = PZ, e = add(o, mul(dir, L));
    if (!pj(c, e[0], e[1], e[2])) return;
    var bx = PX, by = PY, rb = radius * c.f / PZ, ra = 0.12 * c.f / az;
    var dx = bx - ax, dy = by - ay, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    var g = ctx.createLinearGradient(ax, ay, bx, by);
    g.addColorStop(0, rgba(col, alpha)); g.addColorStop(0.55, rgba(col, alpha * 0.3)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ax + nx * ra, ay + ny * ra); ctx.lineTo(bx + nx * rb, by + ny * rb);
    ctx.lineTo(bx - nx * rb, by - ny * rb); ctx.lineTo(ax - nx * ra, ay - ny * ra);
    ctx.closePath(); ctx.fill();
    glowDot(ax, ay, 8 * dpr, col, Math.min(1, alpha * 2.4));
  }
  var CROWD = [];
  (function () {
    seed = 777;
    while (CROWD.length < 2600) {
      var z = 10.5 + rnd() * 82, half = 25 + (z - 10) * 0.42, x = (rnd() * 2 - 1) * half, clear = true;
      if (Math.abs(x) < 7 && z < 29.5) continue;
      if (Math.abs(x) < 8 && z > 51 && z < 64) continue;
      masts.forEach(function (m) { if (Math.abs(x - m[0]) < 2.4 && Math.abs(z - m[1]) < 2.4) clear = false; });
      if (!clear) continue;
      CROWD.push({ x: x, y: 1.55 + rnd() * 0.2, z: z, ph: rnd() * 10, light: rnd() < 0.14, w: (z - 10) / 82 });
    }
  })();
  function drawCrowd(t, c) {
    var a = span(t, [P0(-0.2), P0(1.6)]);
    if (a <= 0) return;
    ctx.fillStyle = rgba([150, 146, 138], 0.5 * a);
    ctx.beginPath();
    var lightsOn = [], step = LITE ? 2 : 1;
    for (var i = 0; i < CROWD.length; i += step) {
      var m = CROWD[i];
      if (t < P0(-0.2) + m.w * 1.6) continue;
      var y = m.y + 0.06 * Math.max(0, Math.sin(t * 7.5 + m.ph)) * span(t, [P0(1.4), P0(2.4)]);
      if (!pj(c, m.x, y, m.z) || PX < 0 || PX > W || PY < 0 || PY > H) continue;
      var s = clamp(0.3 * c.f / PZ, 0.7 * dpr, 2.6 * dpr);
      ctx.rect(PX - s / 2, PY - s / 2, s, s);
      if (m.light) lightsOn.push(PX, PY, m.ph);
    }
    ctx.fill();
    if (lightsOn.length) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < lightsOn.length; i += 3) {
        var tw = 0.5 + 0.5 * Math.sin(t * 2.3 + lightsOn[i + 2] * 3);
        ctx.fillStyle = rgba(WARM, 0.55 * a * tw * span(t, [P0(1.2), P0(2.2)]));
        ctx.fillRect(lightsOn[i] - dpr, lightsOn[i + 1] - dpr, 2 * dpr, 2 * dpr);
      }
      ctx.restore();
    }
  }
  // A segment clipped to the camera's near plane (a laser can run past the lens).
  var SX0 = 0, SY0 = 0, SX1 = 0, SY1 = 0;
  function clipSeg(c, a, b) {
    var za = (a[0] - c.pos[0]) * c.fw[0] + (a[1] - c.pos[1]) * c.fw[1] + (a[2] - c.pos[2]) * c.fw[2];
    var zb = (b[0] - c.pos[0]) * c.fw[0] + (b[1] - c.pos[1]) * c.fw[1] + (b[2] - c.pos[2]) * c.fw[2];
    var n = c.near * 1.01;
    if (za < n && zb < n) return false;
    var p = a, q = b;
    if (za < n) p = lerp3(a, b, (n - za) / (zb - za));
    else if (zb < n) q = lerp3(a, b, (n - za) / (zb - za));
    if (!pj(c, p[0], p[1], p[2])) return false;
    SX0 = PX; SY0 = PY;
    if (!pj(c, q[0], q[1], q[2])) return false;
    SX1 = PX; SY1 = PY;
    return true;
  }
  function drawLasers(t, c, power) {
    var on = span(t, [P0(1.0), P0(1.4)]) * power * (t > T.end + 1 ? 0.55 : 1);
    if (on <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    lasers.forEach(function (L) {
      var col = L.n % 2 ? TEAL : LIME, side = L.o[0] < 0 ? -1 : 1;
      for (var k = 0; k < (LITE ? 4 : 6); k++) {
        // a fan over the crowd that breathes up and sweeps across
        var sweep = side * 0.25 + Math.sin(t * 0.8 + L.n * 0.7) * 0.45 + (k - 2.5) * 0.11;
        var elev = 0.16 + 0.09 * k * (0.6 + 0.4 * Math.sin(t * 1.1 + L.n)) + 0.1 * Math.sin(t * 0.6);
        var d = norm([Math.sin(sweep) * Math.cos(elev), Math.sin(elev), Math.cos(sweep) * Math.cos(elev)]);
        if (!clipSeg(c, L.o, add(L.o, mul(d, 170)))) continue;
        ctx.strokeStyle = rgba(col, 0.1 * on); ctx.lineWidth = 4 * dpr;
        ctx.beginPath(); ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.7 * on); ctx.lineWidth = 1 * dpr;
        ctx.beginPath(); ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); ctx.stroke();
      }
      if (pj(c, L.o[0], L.o[1], L.o[2])) glowDot(PX, PY, 7 * dpr, col, 0.8 * on);
    });
    ctx.restore();
  }
  function flameAt(t, n, tip) {
    var bursts = tip ? [P0(1.6), P0(3.2)] : [P0(1.2), P0(2.3)], v = 0;
    for (var i = 0; i < bursts.length; i++) { var k = (t - bursts[i] - (n % 4) * 0.05) / 0.9; if (k > 0 && k < 1) v = Math.max(v, Math.sin(k * Math.PI)); }
    var cyc = (t - P0(6)) % 5.2; if (t > P0(6) && cyc < 0.9) v = Math.max(v, Math.sin(cyc / 0.9 * Math.PI) * (tip ? 0.9 : 0.7));
    return v;
  }
  function drawFlames(t, c) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    flames.forEach(function (F) {
      var v = flameAt(t, F.n, F.tip);
      if (v <= 0 || !pj(c, F.p[0], F.p[1], F.p[2])) return;
      var s = c.f / PZ, hgt = (F.tip ? 7 : 5.5) * v * s, flick = 1 + 0.08 * Math.sin(t * 40 + F.n * 3);
      ctx.save(); ctx.translate(PX, PY - hgt * 0.45); ctx.scale(1, 2.4 * flick);
      glowDot(0, 0, hgt * 0.42, AMBER, 0.75 * v);
      glowDot(0, hgt * 0.1, hgt * 0.2, WARM, 0.8 * v);
      ctx.restore();
      glowDot(PX, PY, hgt * 0.8, AMBER, 0.12 * v);
    });
    ctx.restore();
  }
  function polyline3(c, pts, col, a, w) {
    ctx.strokeStyle = rgba(col, a); ctx.lineWidth = w * dpr;
    ctx.beginPath();
    var first = true;
    for (var i = 0; i < pts.length; i++) {
      if (!pj(c, pts[i][0], pts[i][1], pts[i][2])) { first = true; continue; }
      if (first) { ctx.moveTo(PX, PY); first = false; } else ctx.lineTo(PX, PY);
    }
    ctx.stroke();
  }
  var DECK_EDGE = (function () {
    var y = DECK.h + 0.02, pts = [[-22, y, 4.02], [-2.5, y, 4.02], [-2.5, y, 18.1]], a0 = Math.atan2(18.1 - 22.2, -2.5), sw = Math.PI + 2 * (a0 + Math.PI);
    for (var q = 0; q <= 16; q++) { var a = a0 - q / 16 * sw; pts.push([4.55 * Math.cos(a), y, 22.2 + 4.55 * Math.sin(a)]); }
    pts.push([2.5, y, 18.1], [2.5, y, 4.02], [22, y, 4.02]);
    return pts;
  })();
  function drawLight(t, c, power) {
    if (power <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // the haze, lit by the wall
    if (pj(c, 0, 11, -10)) glowDot(PX, PY, 0.75 * Math.max(W, H), mix(VIOLET, TEAL, 0.4), 0.13 * power);
    if (pj(c, 0, HALO.c[1], -11)) glowDot(PX, PY, 11 * c.f / PZ, LIME, 0.16 * power * (0.8 + 0.2 * Math.sin(t * 3)));
    imags.forEach(function (m) { if (pj(c, m.s * IMAG.x, (m.y0 + m.y1) / 2, m.z + 1)) glowDot(PX, PY, 12 * c.f / PZ, VIOLET, 0.1 * power); });
    // the deck's edge, drawn in light (a keynote touch)
    polyline3(c, DECK_EDGE, WARM, 0.55 * span(t, [P0(0.3), P0(0.8)]), 1.4);
    // the arch's pixel line: a chase running up both sides to the apex
    var arc = span(t, [P0(0.5), P0(1.1)]) * power;
    if (arc > 0) {
      ctx.lineWidth = 2 * dpr; ctx.lineCap = 'round';
      for (var i = 0; i < archLine.length - 1; i++) {
        var up = Math.min(i, archLine.length - 2 - i), k = (Math.sin(up * 0.42 - t * 7) + 1) / 2;
        if (!pj(c, archLine[i][0], archLine[i][1], archLine[i][2])) continue;
        var x0 = PX, y0 = PY;
        if (!pj(c, archLine[i + 1][0], archLine[i + 1][1], archLine[i + 1][2])) continue;
        ctx.strokeStyle = rgba(LIME, arc * (0.18 + 0.7 * k * k));
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(PX, PY); ctx.stroke();
      }
    }
    var beams = LITE ? 2 : 1;
    lights.forEach(function (f, n) {
      if (n % beams) return;
      var on = clamp((t - (T.power[0] + 0.35 + (f.n % 12) * 0.05 + f.grp * 0.12)) / 0.45, 0, 1) * power;
      if (on <= 0) return;
      var pan = Math.sin(t * 0.55 + f.n * 0.7) * 0.55, tilt = 0.35 + 0.3 * Math.sin(t * 0.37 + f.n * 1.1);
      var toward = f.grp === 3 ? 1 : f.grp === 2 ? -0.35 : 0.55;
      var dir = norm([Math.sin(pan) * Math.sin(tilt), -Math.cos(tilt), toward * Math.cos(pan) * Math.sin(tilt)]);
      if (f.grp === 3) dir = norm([Math.sin(pan) * 0.6, 0.35 + 0.5 * Math.abs(Math.sin(t * 0.4 + f.n)), 1]);   // the razor line fans up and out
      var col = f.grp === 3 ? (f.n % 2 ? WARM : LIME) : f.grp === 1 ? (f.n % 2 ? TEAL : VIOLET) : (f.n % 2 ? VIOLET : LIME);
      beam(c, f.o, dir, f.grp === 3 ? 40 : 24, f.grp === 3 ? 3 : 2.4, col, 0.2 * on);
    });
    ctx.restore();
  }

  /* ---- The side screens: the handshake that started it, live and huge -- */
  var PERFORMER = { way: [[0, 0, 1.2]], look: [0, 30], performer: true };
  function figureOnPlane(c, J, map, col, a, S) {
    var chains = [J.legs[0], J.legs[1], [J.neck, J.pelvis], J.arms[0], J.arms[1]];
    ctx.strokeStyle = rgba(col, a); ctx.fillStyle = rgba(col, a);
    chains.forEach(function (ch, n) {
      ctx.beginPath();
      for (var k = 0; k < ch.length; k++) { if (!map(ch[k])) return; if (k) ctx.lineTo(PX, PY); else ctx.moveTo(PX, PY); }
      ctx.lineWidth = (n === 2 ? 0.155 : 0.074) * S * c.f / PZ;
      ctx.stroke();
    });
    if (map(J.head)) { ctx.beginPath(); ctx.arc(PX, PY, 0.112 * S * c.f / PZ, 0, Math.PI * 2); ctx.fill(); }
  }
  function drawImagFeed(t, c, power) {
    if (power <= 0) return;
    imags.forEach(function (m) {
      var on = clamp((t - P0(0.9)) / 0.5, 0, 1) * power;
      if (on <= 0) return;
      var q = [[m.x0, m.y0, m.z], [m.x1, m.y0, m.z], [m.x1, m.y1, m.z], [m.x0, m.y1, m.z]], xy = [];
      for (var i = 0; i < 4; i++) { if (!pj(c, q[i][0], q[i][1], q[i][2])) return; xy.push(PX, PY); }
      ctx.save();
      ctx.beginPath(); ctx.moveTo(xy[0], xy[1]); for (i = 2; i < 8; i += 2) ctx.lineTo(xy[i], xy[i + 1]); ctx.closePath(); ctx.clip();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var cx = (m.x0 + m.x1) / 2, S = 3.0, ts = 3.15 + 0.22 * Math.sin(t * 1.4);
      function onScreen(pt) { return pj(c, cx + pt[0] * S, m.y0 + 0.25 + pt[1] * S, m.z + 0.01); }
      figureOnPlane(c, pose(FIGS[0], ts, 0), onScreen, INK, 0.85 * on, S);
      figureOnPlane(c, pose(FIGS[1], ts, 1), onScreen, INK, 0.85 * on, S);
      ctx.globalCompositeOperation = 'lighter';
      if (onScreen(SHAKE_AT)) glowDot(PX, PY, 1.1 * S * c.f / PZ, LIME, 0.55 * on * (0.8 + 0.2 * Math.sin(t * 6)));
      ctx.restore();
    });
  }
  function drawPerformer(t, c) {
    var a = span(t, [P0(0.1), P0(0.6)]);
    if (a <= 0) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    figureOnPlane(c, pose(PERFORMER, t, 0), function (p) { return pj(c, p[0], p[1] + DECK.h, p[2]); }, INK, a, 1);
    ctx.restore();
  }

  /* ---- The core: the idea seed again, eleven metres tall inside the halo -- */
  var CORE = { c: [0, HALO.c[1], -10.6], h: 4.0, w: 2.5, t0: 24.15 };
  function drawCore(t, c, power) {
    if (t < CORE.t0) return;
    var cc = [CORE.c[0], CORE.c[1] + LAYER_Y[4] * explodeK(t), CORE.c[2]], ang = 0.35 * (t - CORE.t0) + 0.4, P = [], i;
    for (i = 0; i < 6; i++) P.push(octaPoint(cc, CORE.h, CORE.w, ang, i));
    var fillK = span(t, [CORE.t0 + 0.45, CORE.t0 + 0.8]), ring = [2, 4, 3, 5], faces = [];
    if (fillK > 0) {
      for (i = 0; i < 4; i++) [0, 1].forEach(function (pole) {
        var tri = [P[pole], P[ring[i]], P[ring[(i + 1) % 4]]], cen = mul(add(add(tri[0], tri[1]), tri[2]), 1 / 3);
        var n = norm(cross(sub(tri[1], tri[0]), sub(tri[2], tri[0])));
        if (dot(n, sub(cen, cc)) < 0) n = mul(n, -1);
        if (dot(n, sub(c.pos, cen)) <= 0) return;
        var xy = [], d = 0;
        for (var v = 0; v < 3; v++) { if (!pj(c, tri[v][0], tri[v][1], tri[v][2])) return; xy.push(PX, PY); d += PZ; }
        faces.push({ xy: xy, d: d, sh: 0.45 + 0.55 * Math.max(0, dot(n, LIGHT)) });
      });
      faces.sort(function (a, b) { return b.d - a.d; });
      faces.forEach(function (f) {
        ctx.fillStyle = rgba(mix(scale(LIME, 0.28 * f.sh), mix(LIME, WARM, 0.35 * f.sh), power), (0.55 + 0.35 * power) * fillK);
        fillPoly(f.xy);
      });
    }
    ctx.lineCap = 'round';
    OCTA_EDGES.forEach(function (e2, n) {
      var k = clamp((t - (CORE.t0 + n * 0.035)) / 0.4, 0, 1);
      if (k <= 0) return;
      var a = P[e2[0]], b = P[e2[1]], out = mul(norm(sub(mul(add(a, b), 0.5), cc)), 16 * (1 - outBack(k)));
      if (!pj(c, a[0] + out[0], a[1] + out[1], a[2] + out[2])) return;
      var x0 = PX, y0 = PY;
      if (!pj(c, b[0] + out[0], b[1] + out[1], b[2] + out[2])) return;
      ctx.strokeStyle = rgba(power > 0 ? mix(LIME, WARM, 0.4 * power) : LIME, 0.95 * k); ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(PX, PY); ctx.stroke();
    });
    if (power > 0 && pj(c, cc[0], cc[1], cc[2])) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glowDot(PX, PY, 10 * c.f / PZ, LIME, 0.4 * power * (0.85 + 0.15 * Math.sin(t * 2.5)));
      ctx.restore();
    }
  }

  /* ---- Temporary kit: two crawler cranes that swing in, work, and dissolve -- */
  var CRANES = [
    { base: [-46, 0, 20], aims: [[16.9, [-24, 5]], [18.8, [-8, -4]], [21.9, [-4, -12]], [24.8, [-31, -9]], [27.5, [-31, -9]]] },
    { base: [50, 0, -32], aims: [[16.9, [24, -14]], [18.8, [8, -8]], [21.9, [4, -12]], [24.8, [31, -10]], [27.5, [31, -10]]] }
  ];
  function craneYaw(cr, t) {
    var A = cr.aims, i = 0;
    while (i < A.length - 1 && t >= A[i + 1][0]) i++;
    function yawTo(p) { return Math.atan2(p[0] - cr.base[0], p[1] - cr.base[2]); }
    var a = yawTo(A[i][1]);
    if (i === A.length - 1) return a;
    var b = yawTo(A[i + 1][1]), d = b - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return a + d * smooth(clamp((t - A[i][0]) / Math.min(1.6, A[i + 1][0] - A[i][0]), 0, 1));
  }
  function drawCranes(t, c) {
    var a = span(t, [16.8, 17.5]) * (1 - span(t, [27.3, 28.0]));
    if (a <= 0) return;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(AMBER, 0.72 * a); ctx.lineWidth = dpr;
    CRANES.forEach(function (cr, ci) {
      var yaw = craneYaw(cr, t), el = 62 * DEG, fwd = [Math.sin(yaw), 0, Math.cos(yaw)];
      var u = [fwd[0] * Math.cos(el), Math.sin(el), fwd[2] * Math.cos(el)], side = norm(cross(u, [0, 1, 0]));
      var piv = add(cr.base, [0, 3.2, 0]), tip = add(piv, mul(u, 58)), segs = [], k;
      var L = [add(piv, mul(side, 0.8)), add(tip, mul(side, 0.3))], Rr = [add(piv, mul(side, -0.8)), add(tip, mul(side, -0.3))];
      segs.push(L, Rr);
      for (k = 0; k < 20; k++) {
        var p = lerp3(L[0], L[1], k / 20), q = lerp3(Rr[0], Rr[1], (k + 1) / 20);
        segs.push([p, q]);
      }
      var hook = 20 + 6 * Math.sin(t * 0.9 + ci * 2), hk = add(tip, [0, -hook, 0]);
      segs.push([tip, hk], [add(hk, [-0.5, 0, 0]), add(hk, [0.5, 0, 0])]);
      segs.push([piv, add(piv, mul(fwd, -8))], [add(piv, mul(fwd, -8)), add(piv, [0, 6, 0])], [add(piv, [0, 6, 0]), tip]);
      var b = cr.base;
      [[-3.5, -2.2], [3.5, -2.2], [3.5, 2.2], [-3.5, 2.2]].forEach(function (o, n, arr) {
        var o2 = arr[(n + 1) % 4];
        var p1 = [b[0] + o[0] * fwd[2] + o[1] * fwd[0], 0, b[2] - o[0] * fwd[0] + o[1] * fwd[2]], p2 = [b[0] + o2[0] * fwd[2] + o2[1] * fwd[0], 0, b[2] - o2[0] * fwd[0] + o2[1] * fwd[2]];
        segs.push([p1, p2], [add(p1, [0, 2.4, 0]), add(p2, [0, 2.4, 0])], [p1, add(p1, [0, 2.4, 0])]);
      });
      ctx.beginPath();
      segs.forEach(function (s) {
        if (!pj(c, s[0][0], s[0][1], s[0][2])) return;
        var x0 = PX, y0 = PY;
        if (!pj(c, s[1][0], s[1][1], s[1][2])) return;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      });
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ---- The camera crane at the front of the stage (a keynote touch) ------ */
  var JIB = { base: [17, 0, 12.5], t0: 28.9 };
  function drawJib(t, c) {
    var a = span(t, [JIB.t0, JIB.t0 + 0.5]);
    if (a <= 0) return;
    var b = JIB.base, piv = [b[0], 3.6, b[2]], yaw = Math.atan2(-b[0], -b[2]) + 0.55 * Math.sin(t * 0.5), el = 0.22 + 0.14 * Math.sin(t * 0.37);
    var u = [Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)], tip = add(piv, mul(u, 12)), back = add(piv, mul(u, -3.5));
    var up = [0, 0.22, 0], segs = [[add(back, up), add(tip, up)], [sub(back, up), sub(tip, up)], [[b[0], 0, b[2]], [b[0], 3.4, b[2]]]], k;
    for (k = 0; k < 12; k++) segs.push([add(lerp3(back, tip, k / 12), k % 2 ? up : mul(up, -1)), add(lerp3(back, tip, (k + 1) / 12), k % 2 ? mul(up, -1) : up)]);
    [tip, back].forEach(function (p, n) {
      var h = n ? 0.5 : 0.3;
      segs.push([add(p, [-h, -h, 0]), add(p, [h, -h, 0])], [add(p, [h, -h, 0]), add(p, [h, h, 0])], [add(p, [h, h, 0]), add(p, [-h, h, 0])], [add(p, [-h, h, 0]), add(p, [-h, -h, 0])]);
    });
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(INK, 0.75 * a); ctx.lineWidth = dpr;
    ctx.beginPath();
    segs.forEach(function (s) {
      if (!pj(c, s[0][0], s[0][1], s[0][2])) return;
      var x0 = PX, y0 = PY;
      if (!pj(c, s[1][0], s[1][1], s[1][2])) return;
      ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
    });
    ctx.stroke();
    if (pj(c, piv[0], piv[1], piv[2])) { ctx.fillStyle = rgba(AMBER, 0.9 * a); ctx.beginPath(); ctx.arc(PX, PY, 2.2 * dpr, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  /* ---- The slam: a shockwave across the ground as the layers land -------- */
  function drawShockwave(t, c) {
    var u = (t - T.explode[3]) / 0.7;
    if (u <= 0 || u >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ringOnFloor(c, 0, 0.05, -4, 4 + 150 * outCubic(u), LIME, 0.7 * (1 - u), 2);
    ringOnFloor(c, 0, 0.05, -4, 2 + 80 * outCubic(u), WARM, 0.4 * (1 - u), 1.2);
    ctx.restore();
  }
  var XL_ANCHOR = [[-22, 2.2, 4], [-24, 13, 5], [-24, 26, 5], [-18, 17, -12.5], [-40, 24, -8], [-21, 18, 7.2]];
  function drawExplodeLabels(t, c) {
    var k = explodeK(t), vis = clamp((k - 0.55) / 0.45, 0, 1) * (t < T.explode[2] + 0.1 ? 1 : 0);
    if (vis <= 0) return;
    ctx.save();
    ctx.font = '500 ' + (10.5 * dpr).toFixed(1) + 'px ' + MONO;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    XL_ANCHOR.forEach(function (p, i) {
      if (!pj(c, p[0], p[1] + LAYER_Y[i] * k, p[2])) return;
      var x = PX, y = PY, text = LAYER_NAMES[i];
      // labels sit to the left of their layer, unless that would run off the screen
      var left = x - 40 * dpr - ctx.measureText(text).width > 10 * dpr, lx = x + (left ? -34 : 34) * dpr;
      var shown = text.slice(0, Math.ceil(text.length * clamp((t - T.explode[0] - 0.3 - i * 0.05) / 0.35, 0, 1)));
      var col = [INK, LIME, LIME, TEAL, VIOLET_LINE, INK][i];
      ctx.strokeStyle = rgba(col, 0.7 * vis); ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, y); ctx.stroke();
      ctx.fillStyle = rgba(col, 0.95 * vis);
      ctx.beginPath(); ctx.arc(x, y, 2.2 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = left ? 'right' : 'left';
      ctx.fillText(shown, lx + (left ? -6 : 6) * dpr, y);
    });
    ctx.restore();
  }

  /* ---- Fireworks behind the stage, and the sparks' return as drones ------ */
  var SHELLS = [[-38, 1.35, 62, LIME], [38, 1.45, 64, WARM], [-62, 1.85, 56, TEAL], [62, 1.95, 58, LIME], [-14, 2.35, 72, WARM], [14, 2.45, 70, TEAL]];
  var SHELL_DIRS = [];
  (function () {
    seed = 3131;
    for (var i = 0; i < 56; i++) {
      var th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), sp = 13 + rnd() * 5;
      SHELL_DIRS.push([Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp, Math.sin(ph) * Math.sin(th) * sp]);
    }
  })();
  function drawFireworks(t, c) {
    if (t < P0(1.3) || t > P0(5.2)) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    SHELLS.forEach(function (sh) {
      var tl = P0(sh[1]), tb = tl + 1.0, x = sh[0], z = -42;
      if (t < tl || t > tb + 1.8) return;
      if (t < tb) {
        var u = (t - tl) / 1.0, y = sh[2] * (1 - (1 - u) * (1 - u)), y2 = Math.max(0, y - 5);
        if (pj(c, x, y2, z)) { var x0 = PX, y0 = PY; if (pj(c, x, y, z)) { ctx.strokeStyle = rgba(WARM, 0.55); ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(PX, PY); ctx.stroke(); glowDot(PX, PY, 4 * dpr, WARM, 0.9); } }
        return;
      }
      var tau = t - tb, fade = 1 - tau / 1.8;
      if (tau < 0.3 && pj(c, x, sh[2], z)) glowDot(PX, PY, 26 * c.f / PZ, sh[3], 0.5 * (1 - tau / 0.3));
      ctx.strokeStyle = rgba(sh[3], 0.85 * fade); ctx.lineWidth = 1.3 * dpr;
      ctx.beginPath();
      SHELL_DIRS.forEach(function (v, i) {
        if (LITE && i % 2) return;
        function at(tt) { var drag = 1 - 0.2 * tt; return [x + v[0] * tt * drag, sh[2] + v[1] * tt * drag - 4.9 * tt * tt, z + v[2] * tt * drag]; }
        var p = at(Math.max(0, tau - 0.08)), q = at(tau);
        if (!pj(c, p[0], p[1], p[2])) return;
        var x0 = PX, y0 = PY;
        if (!pj(c, q[0], q[1], q[2])) return;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      });
      ctx.stroke();
    });
    ctx.restore();
  }
  var DRONE = { c: [0, 47, -26], h: 11, w: 8, t: [P0(1.2), P0(3.2)] }, DRONES = [];
  (function () {
    seed = 5151;
    for (var k = 0; k < 120; k++) DRONES.push({ e: k % 12, u: (Math.floor(k / 12) + 0.5) / 10, s: [(rnd() * 2 - 1) * 70, 28 + rnd() * 50, -70 + rnd() * 60], d: rnd() * 0.6, ph: rnd() * 6 });
  })();
  function drawDrones(t, c) {
    var a = span(t, [DRONE.t[0] - 0.5, DRONE.t[0]]);
    if (a <= 0) return;
    var ang = 0.16 * t, V = [], i;
    for (i = 0; i < 6; i++) V.push(octaPoint(DRONE.c, DRONE.h, DRONE.w, ang, i));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var formed = span(t, [DRONE.t[1], DRONE.t[1] + 0.8]);
    if (formed > 0) {
      ctx.strokeStyle = rgba(LIME, 0.14 * formed); ctx.lineWidth = dpr;
      ctx.beginPath();
      OCTA_EDGES.forEach(function (e2) {
        if (!pj(c, V[e2[0]][0], V[e2[0]][1], V[e2[0]][2])) return;
        var x0 = PX, y0 = PY;
        if (!pj(c, V[e2[1]][0], V[e2[1]][1], V[e2[1]][2])) return;
        ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
      });
      ctx.stroke();
    }
    DRONES.forEach(function (d, k) {
      var e2 = OCTA_EDGES[d.e], target = lerp3(V[e2[0]], V[e2[1]], d.u);
      var m = smooth(span(t, [DRONE.t[0] + d.d, DRONE.t[1] - 0.6 + d.d]));
      var p = lerp3(add(d.s, [0, 2 * Math.sin(t + d.ph), 0]), target, m);
      if (!pj(c, p[0], p[1], p[2])) return;
      var tw = 0.65 + 0.35 * Math.sin(t * 4 + d.ph);
      ctx.fillStyle = rgba(LIME, a * tw);
      ctx.fillRect(PX - dpr, PY - dpr, 2 * dpr, 2 * dpr);
      if (k % 4 === 0) glowDot(PX, PY, 5 * dpr, LIME, 0.35 * a * tw);
    });
    ctx.restore();
  }

  /* ---- The team, at the mixing desk, watching what they started ---------- */
  var TEAM = [-3.9, -2.5, -0.7, 0.7, 2.5, 3.9, 5.3].map(function (x) { return { way: [[0, x, 54.9]], look: [x * 0.12, 0], y0: 1.0 }; });
  function drawTeam(t, c) {
    var a = span(t, [P0(0.2), P0(1.2)]);
    if (a <= 0) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    TEAM.forEach(function (F, i) {
      var J = pose(F, t, i + 3), map = function (p) { return pj(c, p[0], p[1], p[2]); };
      if (!pj(c, J.pelvis[0], J.pelvis[1], J.pelvis[2])) return;
      // rim-lit by the stage, then the silhouette
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      figureOnPlane(c, J, map, i === 2 || i === 3 ? LIME : WARM, 0.6 * a, 1.3);
      ctx.restore();
      figureOnPlane(c, J, map, [14, 14, 16], 0.96 * a, 1);
    });
    ctx.restore();
  }

  /* ---- The last act: the real event, when photos are provided ----------- */
  var photos = [];
  function cover(img, alpha, zoom, drift) {
    var s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - w) / 2 + drift * W * 0.02, (H - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }
  function drawPhotos(t) {
    var list = photos.filter(Boolean);
    if (!list.length || t < T.photos) return 0;
    var per = 5.5, pt = t - T.photos, k = Math.floor(pt / per), local = pt - k * per, n = list.length;
    if (k > 0) cover(list[(k - 1) % n], 1, 1.03 + 0.05 * (per + local) / (per * 2), -0.5 + (per + local) / (per * 2));
    var a = inOut(clamp(local / 1.6, 0, 1));
    cover(list[k % n], a, 1.03 + 0.05 * local / (per * 2), -0.5 + local / (per * 2));
    return k > 0 ? 1 : a;
  }

  // The owner's own drawing, on the CAD screen (when provided).
  var drawingImg = null, drawingInvert = false;
  function drawOwnerDrawing(t, inner) {
    if (!drawingImg) return null;
    var a = span(t, [11.0, 11.5]) * (1 - span(t, [13.4, 14.4]));
    if (a <= 0) return null;
    var pad = 18 * dpr, bw = inner.w - pad * 2, bh = inner.h - pad * 2;
    var s = Math.min(bw / drawingImg.naturalWidth, bh / drawingImg.naturalHeight);
    var w = drawingImg.naturalWidth * s, h = drawingImg.naturalHeight * s;
    var x = inner.x + (inner.w - w) / 2, y = inner.y + (inner.h - h) / 2, wipe = span(t, [11.1, 13.0]);
    ctx.save();
    ctx.fillStyle = rgba([15, 15, 17], a); ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    ctx.beginPath(); ctx.rect(x, y, w * wipe, h); ctx.clip();
    ctx.globalAlpha = a;
    if (drawingInvert) ctx.filter = 'invert(1) hue-rotate(180deg)';
    ctx.drawImage(drawingImg, x, y, w, h);
    ctx.restore();
    return { p: [x + w * wipe, y + h * (0.5 + 0.35 * Math.sin(t * 3.1))], x: wipe * 88 - 44, z: Math.sin(t * 3.1) * 30, layer: 'IMPORT' };
  }

  /* ---- The CAD window --------------------------------------------------- */
  function drawChrome(t, r, k, pen) {
    if (k <= 0) return;
    var m = chrome(r), d = dpr, rad = 14 * d;
    ctx.save();
    ctx.globalAlpha = k;
    roundRect(r, rad); ctx.clip();
    ctx.fillStyle = 'rgba(21,21,24,0.97)';
    ctx.fillRect(r.x, r.y, r.w, m.top);
    ctx.fillRect(r.x, r.y + r.h - m.bot, r.w, m.bot);
    if (m.left) ctx.fillRect(r.x, r.y + m.top, m.left, r.h - m.top - m.bot);
    ctx.fillStyle = 'rgba(244,241,234,0.09)';
    ctx.fillRect(r.x, r.y + m.top - d, r.w, d);
    ctx.fillRect(r.x, r.y + r.h - m.bot, r.w, d);
    if (m.left) ctx.fillRect(r.x + m.left - d, r.y + m.top, d, r.h - m.top - m.bot);
    for (var i = 0; i < 3; i++) { ctx.fillStyle = rgba(INK, 0.2); ctx.beginPath(); ctx.arc(r.x + (16 + i * 14) * d, r.y + m.top / 2, 4 * d, 0, Math.PI * 2); ctx.fill(); }
    ctx.textBaseline = 'middle';
    ctx.font = '500 ' + (11 * d).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = rgba(INK, 0.62); ctx.textAlign = 'center';
    ctx.fillText(drawingImg ? 'event_drawing  —  import' : 'main_stage_site.dwg  —  Plan view', r.x + r.w / 2, r.y + m.top / 2);
    if (r.w > 460 * d) { ctx.textAlign = 'right'; ctx.fillStyle = rgba(MUTED, 0.9); ctx.fillText('SCALE 1:500', r.x + r.w - 14 * d, r.y + m.top / 2); }
    if (m.left) {
      var cx = r.x + m.left / 2, y0 = r.y + m.top + 22 * d, g = 30 * d, s2 = 6 * d;
      ctx.lineWidth = d;
      for (i = 0; i < 6; i++) {
        var yy = y0 + i * g, active = (pen && pen.layer === 'DIMENSIONS') ? i === 3 : i === 1;
        ctx.strokeStyle = active ? rgba(LIME, 0.95) : rgba(INK, 0.38);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        if (i === 0) ctx.rect(cx - s2, yy - s2, s2 * 2, s2 * 2);
        if (i === 1) { ctx.moveTo(cx - s2, yy + s2); ctx.lineTo(cx + s2, yy - s2); }
        if (i === 2) ctx.arc(cx, yy, s2, 0, Math.PI * 2);
        if (i === 3) { ctx.moveTo(cx - s2, yy); ctx.lineTo(cx + s2, yy); ctx.moveTo(cx - s2, yy - s2 / 2); ctx.lineTo(cx - s2, yy + s2 / 2); ctx.moveTo(cx + s2, yy - s2 / 2); ctx.lineTo(cx + s2, yy + s2 / 2); }
        if (i === 4) { ctx.font = '600 ' + (12 * d).toFixed(1) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('A', cx, yy); }
        if (i === 5) { ctx.moveTo(cx - s2, yy - s2 / 1.5); ctx.lineTo(cx + s2, yy - s2 / 1.5); ctx.moveTo(cx - s2, yy); ctx.lineTo(cx + s2, yy); ctx.moveTo(cx - s2, yy + s2 / 1.5); ctx.lineTo(cx + s2, yy + s2 / 1.5); }
        ctx.stroke();
      }
    }
    ctx.font = '500 ' + (10 * d).toFixed(1) + 'px ' + MONO;
    ctx.textAlign = 'left'; ctx.fillStyle = rgba(MUTED, 0.85);
    var wide = r.w > 560 * d;
    var status = pen ? 'X ' + pen.x.toFixed(3) + '    Z ' + pen.z.toFixed(3) + (wide ? '        SNAP   GRID   ORTHO' : '') + '        LAYER: ' + pen.layer : 'READY';
    ctx.fillText(status, r.x + m.left + 12 * d, r.y + r.h - m.bot / 2);
    var ta = span(t, [12.6, 13.0]);
    if (ta > 0 && m.inner.w > 620 * d && !drawingImg) {
      var bw = 214 * d, bh = 66 * d, bx = r.x + r.w - 14 * d - bw, by = r.y + r.h - m.bot - 14 * d - bh;
      ctx.globalAlpha = k * ta;
      ctx.fillStyle = 'rgba(11,11,12,0.88)'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = rgba(INK, 0.3); ctx.lineWidth = d; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.beginPath(); ctx.moveTo(bx, by + bh / 3); ctx.lineTo(bx + bw, by + bh / 3); ctx.moveTo(bx, by + 2 * bh / 3); ctx.lineTo(bx + bw, by + 2 * bh / 3); ctx.stroke();
      ctx.font = '700 ' + (11 * d).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(INK, 0.95);
      ctx.fillText('UNCONVENTIONAL', bx + 10 * d, by + bh / 6);
      ctx.font = '500 ' + (10 * d).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(MUTED, 0.9);
      ctx.fillText('MAIN STAGE  ·  SITE PLAN', bx + 10 * d, by + bh / 2);
      ctx.fillStyle = rgba(LIME, 0.95);
      ctx.fillText('SCALE 1:500       DWG 001', bx + 10 * d, by + 5 * bh / 6);
    }
    if (pen && pen.p && t < T.lift[0] + 0.3) {
      var inr = m.inner;
      ctx.globalAlpha = k * (1 - span(t, [T.lift[0] - 0.1, T.lift[0] + 0.3]));
      ctx.beginPath(); ctx.rect(inr.x, inr.y, inr.w, inr.h); ctx.clip();
      ctx.strokeStyle = rgba(INK, 0.26); ctx.lineWidth = d;
      ctx.beginPath();
      ctx.moveTo(inr.x, pen.p[1]); ctx.lineTo(inr.x + inr.w, pen.p[1]);
      ctx.moveTo(pen.p[0], inr.y); ctx.lineTo(pen.p[0], inr.y + inr.h);
      ctx.stroke();
      ctx.strokeStyle = rgba(LIME, 0.95);
      ctx.strokeRect(pen.p[0] - 5 * d, pen.p[1] - 5 * d, 10 * d, 10 * d);
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = 'rgba(244,241,234,0.16)'; ctx.lineWidth = d;
    roundRect(r, rad); ctx.stroke();
    ctx.restore();
  }

  // The assembly readout in the corner during the build.
  var PHASES = [[14.6, 'GROUND SUPPORT'], [17.3, 'ROOF  ·  ASSEMBLY AT GRADE'], [19.0, 'ROOF  ·  PRE-RIG LIGHTING'], [19.7, 'ROOF  ·  LIFT'], [20.1, 'DECK'],
    [22.05, 'VIDEO  ·  SPINE + HALO'], [23.55, 'VIDEO  ·  LED WALL'], [24.95, 'SCENIC  ·  WINGS'], [25.6, 'VIDEO  ·  IMAG'], [26.35, 'SCENIC  ·  ARCH + BAND'],
    [27.15, 'AUDIO  ·  PA'], [28.0, 'SITE  ·  DELAYS + FOH'], [28.9, 'FX  ·  LASERS + FLAME']];
  function drawReadout(t, landed) {
    var a = span(t, [14.8, 15.3]) * (1 - span(t, [29.4, 29.8]));
    if (a <= 0) return;
    // on phones the Skip button sits bottom-left, so the readout moves up above it
    var d = dpr, x = Math.max(20 * d, (W - 1280 * d) / 2 + 32 * d), y = H - (W / d < 600 ? 84 : 30) * d, phase = '';
    PHASES.forEach(function (ph) { if (t >= ph[0]) phase = ph[1]; });
    if (phase === 'ROOF  ·  LIFT') phase += '  +' + (TRIM + roofY(t)).toFixed(3);
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '500 ' + (10.5 * d).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = rgba(MUTED, 0.85 * a);
    ctx.fillText('PARTS  ' + ('000' + landed).slice(-4) + ' / ' + ('000' + parts.length).slice(-4), x, y - 16 * d);
    ctx.fillStyle = rgba(LIME, 0.95 * a);
    ctx.fillText(phase, x, y);
    var bw = Math.min(220 * d, W * 0.4);
    ctx.fillStyle = rgba(INK, 0.12 * a); ctx.fillRect(x, y - 30 * d, bw, d);
    ctx.fillStyle = rgba(LIME, 0.9 * a); ctx.fillRect(x, y - 30 * d, bw * landed / parts.length, d);
    ctx.restore();
  }

  /* ==========================================================================
     A frame of the film
     ========================================================================== */
  var lastAct = '', lastEnd = null;
  // Review aid (only with ?dev): time spent per layer, read by window.__film.
  var DEV = /[?&]dev/.test(window.location.search), prof = {};
  function now() { return DEV ? performance.now() : 0; }
  function lap(name, t0) { if (!DEV) return 0; var t1 = performance.now(); prof[name] = t1 - t0; return t1; }
  function actAt(t) { return t < 9.6 ? 'people' : t < 15.0 ? 'concept' : t < T.power[0] ? 'build' : 'reality'; }
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // The frame: full screen, closing down into the CAD window, then opening again.
    var o = t < T.lift[0] ? 1 - inOut(span(t, T.close)) : inOut(span(t, T.open));
    var r = { x: lerp(screen.x, 0, o), y: lerp(screen.y, 0, o), w: lerp(screen.w, W, o), h: lerp(screen.h, H, o) };
    var chromeK = (1 - o) * (t < T.lift[0] ? span(t, [10.3, 11.0]) : 1);
    var pen = null, landed = 0, coveredByPhotos = photos.length && t > T.photos + 1.7;

    ctx.save();
    roundRect(r, 14 * dpr * (1 - o)); ctx.clip();
    if (o < 1) { ctx.fillStyle = rgba([15, 15, 17], (1 - o)); ctx.fillRect(r.x, r.y, r.w, r.h); }
    if (!coveredByPhotos) {
      if (t < SWITCH) {
        var cA = cameraA(t), cB = toStage(cA);
        var people = 1 - span(t, [9.9, 10.8]);
        drawFloorA(t, cA, span(t, T.floor) * people);
        var rip = span(t, T.ripple);
        if (rip > 0) {
          ringOnFloor(cA, 0, 0.004, 0, 0.05 + 1.0 * outCubic(rip), LIME, 0.9 * (1 - rip * 0.6) * people, 1.4);
          ringOnFloor(cA, 0, 0.004, 0, 0.05 + 3.4 * outCubic(rip), LIME, 0.5 * (1 - rip) * people, 1);
        }
        drawTable(t, cA, people);
        var order = FIGS.map(function (F, i) { var w = wayAt(F.way, t); return { i: i, d: dot(sub([w.x, 1, w.z], cA.pos), cA.fw) }; });
        order.sort(function (a, b) { return b.d - a.d; });
        var heads = [], focusZ = pj(cA, 0, 1, 0) ? PZ : 5;
        order.forEach(function (o2) { var J = drawFigure(cA, FIGS[o2.i], o2.i, t, people, focusZ); if (J) heads[o2.i] = J.head; });
        drawBurst(t, cA);
        var holoIn = span(t, [T.burst - 0.1, T.burst + 0.4]);
        if (holoIn > 0) {
          // the projection: a faint cone from the table up to the plan
          if (people > 0 && pj(cA, 0, 1.02, 0)) {
            var ex = PX, ey = PY;
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = rgba(LIME, 0.12 * holoIn * people); ctx.lineWidth = dpr;
            ctx.beginPath();
            [[-60, -20], [60, -20], [60, 62], [-60, 62]].forEach(function (q) { var a2 = toA([q[0], 0, q[1]]); if (pj(cA, a2[0], a2[1], a2[2])) { ctx.moveTo(ex, ey); ctx.lineTo(PX, PY); } });
            ctx.stroke();
            ctx.restore();
          }
          drawPlan(t, cB, holoIn, 1 - span(t, [9.8, 10.9]), 0, 0);
        }
        drawSparks(t, cA, heads, 1);
      } else {
        var c = cameraB(t), liftK = span(t, [T.lift[0], 22]), power = inOut(span(t, T.power));
        var hit = (t - T.explode[3]) / 0.35;   // the slam shakes the frame for a moment
        if (hit > 0 && hit < 1) { c.px += Math.sin(t * 91) * 3 * dpr * (1 - hit); c.py += Math.cos(t * 77) * 3 * dpr * (1 - hit); }
        var planFade = 1 - 0.55 * span(t, [22, 29]);
        var q0 = now();
        pen = drawPlan(t, c, planFade, 0, liftK, power);
        drawLabels(t, c, 1 - clamp(span(t, T.lift) * 1.8, 0, 1));
        pen = drawOwnerDrawing(t, chrome(r).inner) || pen;
        drawChains(t, c);
        drawCranes(t, c);
        drawShockwave(t, c);
        q0 = lap("plan", q0);
        landed = drawStage(t, c, power);
        q0 = lap("stage", q0);
        drawCore(t, c, power);
        drawJib(t, c);
        drawCrowd(t, c);
        q0 = lap("crowd", q0);
        drawPerformer(t, c);
        drawImagFeed(t, c, power);
        drawLight(t, c, power);
        q0 = lap("light", q0);
        drawLasers(t, c, power);
        drawFlames(t, c);
        drawFireworks(t, c);
        drawDrones(t, c);
        q0 = lap("fx", q0);
        drawTeam(t, c);
        drawCallouts(t, c, 1 - span(t, [29.4, 29.8]));
        drawExplodeLabels(t, c);
      }
    }
    drawPhotos(t);
    ctx.restore();
    drawChrome(t, r, chromeK, pen);
    if (t >= SWITCH && !coveredByPhotos) drawReadout(t, landed);

    var act = actAt(t);
    if (act !== lastAct) { section.setAttribute('data-act', act); lastAct = act; }
    var ended = t >= T.end;
    if (ended !== lastEnd) { section.classList.toggle('is-end', ended); lastEnd = ended; }
    if (progressEl) progressEl.style.transform = 'scaleX(' + clamp(t / T.end, 0, 1).toFixed(4) + ')';
  }

  /* ==========================================================================
     Clock, size, visibility, Skip and the motion control
     ========================================================================== */
  var filmT = 0, raf = 0, last = 0, inView = true;
  var start = parseFloat(new URLSearchParams(window.location.search).get('film'));
  if (!isNaN(start) && start >= 0) filmT = start;

  function paused() { return root.classList.contains('motion-paused'); }
  function running() { return inView && !document.hidden && !paused(); }
  function stillTime() { return photos.filter(Boolean).length ? T.photos + 2 : T.still; }
  var rest = false;
  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    filmT += dt;
    // on phones, once the title card is up, the living stage only needs half the frames (kinder to batteries)
    rest = LITE && filmT > T.end + 3 ? !rest : false;
    if (!rest) render(filmT);
    if (running()) raf = window.requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf && running()) { last = 0; raf = window.requestAnimationFrame(frame); } }
  function halt() { if (raf) window.cancelAnimationFrame(raf); raf = 0; last = 0; render(filmT); }

  function resize() {
    var box = section.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(box.width)), cssH = Math.max(1, Math.round(box.height));
    dpr = Math.min(window.devicePixelRatio || 1, cssW < 700 ? 1.5 : 2);
    LITE = cssW < 700 || (navigator.hardwareConcurrency || 8) <= 4;   // phones and small machines draw a lighter crowd, fewer beams
    W = Math.round(cssW * dpr); H = Math.round(cssH * dpr);
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    screen = screenRect();
    render(filmT);
  }
  function loadImage(name, done) {
    var slot = slots[name];
    if (!slot || slot.status !== 'ready' || !slot.src) return;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () { done(img, slot); if (!raf) render(filmT); };
    img.onerror = function () { console.warn('[film] "' + name + '" is marked ready but ' + slot.src + ' did not load.'); };
    img.src = slot.src;
  }

  loadImage('intro-drawing', function (img, slot) { drawingImg = img; drawingInvert = !!slot.invert; });
  ['intro-photo-1', 'intro-photo-2', 'intro-photo-3', 'intro-photo-4'].forEach(function (name, i) {
    loadImage(name, function (img) { photos[i] = img; if (paused() && filmT < stillTime()) filmT = stillTime(); });
  });
  if (paused() && isNaN(start)) filmT = stillTime();

  resize();
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) kick(); else if (raf) { window.cancelAnimationFrame(raf); raf = 0; last = 0; }
    }).observe(section);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else kick(); });
  new MutationObserver(function () {
    if (paused()) { if (raf) halt(); } else kick();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  if (replayBtn) replayBtn.addEventListener('click', function () {
    filmT = 0;
    lastEnd = null;
    if (paused() && motionToggle) motionToggle.click();
    render(0);
    kick();
  });
  if (skipBtn) skipBtn.addEventListener('click', function () {
    filmT = Math.max(filmT, T.end + 0.2);
    render(filmT);
    kick();
    // the button hides itself once the title card is up, so keyboard focus moves to the title
    var title = section.querySelector('#intro-title');
    if (title) { title.setAttribute('tabindex', '-1'); try { title.focus({ preventScroll: true }); } catch (e) { title.focus(); } }
  });
  // Review hook, only with ?dev on the URL: time a single frame at any second of the film.
  if (/[?&]dev\b/.test(window.location.search)) {
    window.__film = { T: T, parts: parts.length, prof: prof, frame: function (t) { var a = performance.now(); render(t); return performance.now() - a; } };
  }
  kick();
})();
