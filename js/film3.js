/* ==========================================================================
   Unconventional — the intro film, version 3: the home film (home.html) since
   2026-09-26, and the two cuts on preview.html (Preview 1, the owner's edited cut,
   content/media.js, the same as home) and preview2.html (Preview 2, the first cut,
   content/media-p2.js).
   Four scenes in one hero, then the title card:
     01 People           photoreal footage (media slots film-s1-01 … s1-08);
                         until it is ready, the v2 prologue on this canvas
     02 Build            this canvas, from the drawing, to T.realCut (the "three
                         quarters techy" build below), then photoreal footage
                         (film-s2-01 … s2-05) from the match-cut frame
     03 Arrival          photoreal footage (film-s3-01 … s3-10); until it is
                         ready, the v2 power-up, crowd and team at FOH
     04 Unconventional   the logo built and brought into place: footage
                         (film-s4-01 … s4-03 + the hold still), or the canvas
                         logo build near the end of this file
   The sequence player at the end of the file decides, scene by scene, what
   plays (see "Film v3: the sequence player"). With every slot empty the whole
   film runs on this canvas, and ?film=SECONDS means the same as before.

   Scene 2's build is a copy of js/film.js (v2, the home film until 2026-09-26) whose BUILD act
   is the "three quarters techy" build, told in the real order of
   work on a summit plateau at night:
     01 survey and set-out (total station, GNSS rovers, stakes, paint lines,
        a mapping drone scanning the ground)   02 ground prep and logistics
        (graders, a water truck, trackway, a convoy of trucks up the ridge
        road, containers, cabins, generators, light towers, cable runs)
     03 heavy lift (two crawler cranes, telehandlers, forklifts)   04 the deck
        on system scaffolding (base jacks, standards, ledgers, braces, panels)
     05 ground-support towers (one stacked, five hinged up by the cranes), the
        roof grid pinned together at deck level   06 hoists, pre-rig, the
        synchronised lift to trim   07 LED columns growing down from rising
        bars   08 line arrays fanning open as they fly, subs, delay towers
     09 lighting, lasers, flame   10 checks: pixel map, focus, line check,
        crew clear, work lights.
   Digital crew in hi-vis and hard hats walk, carry, climb, kneel, drive and
   point where the work is, and three CAD detail views cut in (base jack,
   coupler clamp, spigot + pin + R-clip). The act ends at T.realCut on a low
   three-quarter of the roof at trim under work lights: the frame the
   photoreal quarter of scene 2 picks up from. After it, the v2 power-up
   still plays (the fallback when no footage is present).
   Every number on screen is a dimension of this model; nothing is named.

   The v2 notes follow (acts 1, 2 and 4 are unchanged).
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
                 watching what they started. (In v3 this is scene 3's
                 fallback; v2's owner photos are not used here.)
   Stage ideas are borrowed from festival main stages and keynote rooms in
   general (scale, ground-support roofs, IMAG, wings, delay masts, a ribbon
   screen); nothing is copied from any one show, and nothing is named.

   Inputs (content/media.js): intro-drawing (shown on the CAD screen) and the
   film-s… footage slots. Motion stops for "Pause motion" and
   prefers-reduced-motion (then one still is held: the logo under the title).
   ?film=21.5 on the URL starts the film at that second. Skip jumps to the
   logo and the title card.
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
    burst: 7.6,            // the idea seed bursts into the plan
    // ---- scene 2 of film v3: the build, in the real order of work
    drawIn: 11.0,          // where scene 2 starts: the drawing on the CAD screen
    survey: [13.6, 17.2],  // 01 total station, rovers, stakes, paint lines, the mapping drone
    ground: [15.6, 19.8],  // 02 graders, water truck, trackway, the convoy, cabins, generators, light towers
    deck: [18.6, 22.2],    // 03-04 plant on site; base jacks, system scaffold, ledgers, braces, deck panels
    towers: [20.8, 24.4],  // 05 ground-support towers (one stacked, five hinged up), the roof grid at deck level
    prerig: [23.4, 24.6],  // 06 hoists hung, lighting and hang bars pre-rigged under the grid
    roof: [24.6, 26.6],    // 06 the synchronised lift to trim
    video: [26.65, 29.4],  // 07 halo module; LED columns grow down from rising bars; IMAG; wings
    audio: [29.2, 31.2],   // 08 line arrays fan open as they fly; subs; delay towers
    light: [29.8, 31.6],   // 09 the arch and band, fixtures, lasers, flame, followspots
    site: [30.8, 32.2],    // FOH, barricade, camera and followspot towers
    explode: [32.3, 32.9, 33.2, 33.6],   // the finished stage lifts apart into layers, holds, slams home
    checks: [33.7, 36.0],  // 10 pixel map, focus, line check, crew clear, work lights
    realCut: 36.0,         // the match cut: the photoreal quarter of scene 2 takes over on this frame
    power: [36.4, 38.6],   // (scene 3 fallback, without footage) everything comes alive
    end: 39.4,             // (v2's title card) the lasers ease down after it
    s3End: 41.6            // the end of the scene 3 fallback: fireworks, drones, the team at FOH; then scene 4
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
    barrier: { e: INK,    ea: 0.5,  w: 1 },
    // film v3: the site, the plant and the crew's kit, by trade
    stake:   { e: LIME,   ea: 1,    w: 1.1,  f: [64, 78, 20],  fa: 0.95 }, // survey: stakes, targets, instruments
    paint:   { e: LIME,   ea: 0.55, w: 1 },                                // set-out paint lines
    track:   { e: MUTED,  ea: 0.3,  w: 1,    f: [24, 25, 24],  fa: 0.9 },  // trackway roads and pads
    truck:   { e: INK,    ea: 0.62, w: 1,    f: [30, 30, 34],  fa: 0.97 }, // logistics
    box:     { e: MUTED,  ea: 0.62, w: 1,    f: [36, 35, 34],  fa: 0.97 }, // containers, cabins, cases
    gen:     { e: AMBER,  ea: 0.78, w: 1,    f: [44, 34, 22],  fa: 0.97 }, // power: generators, fuel, distro
    plant:   { e: AMBER,  ea: 0.92, w: 1.05, f: [60, 40, 16],  fa: 0.97 }, // heavy plant
    boom:    { e: AMBER,  ea: 0.8,  w: 1,    f: [56, 38, 16],  fa: 0.97 },
    wlt:     { e: WARM,   ea: 0.7,  w: 1,    f: [42, 38, 32],  fa: 0.97 }, // mobile light towers
    sub:     { e: MUTED,  ea: 0.5,  w: 0.9 },                              // system scaffold under the deck
    jack:    { e: AMBER,  ea: 0.75, w: 1 },                                // base jacks, sole boards
    deckp:   { e: INK,    ea: 0.38, w: 1,    f: [27, 27, 31],  fa: 0.97 }, // deck panels
    ballast: { e: MUTED,  ea: 0.6,  w: 1,    f: [46, 46, 50],  fa: 0.97 },
    hoist:   { e: AMBER,  ea: 1,    w: 1.1,  f: [110, 64, 22], fa: 0.97 }, // chain hoists, motor controller
    cable:   { e: TEAL,   ea: 0.42, w: 1 },
    cart:    { e: MUTED,  ea: 0.7,  w: 1 }
  };
  var KIND_NAMES = Object.keys(KIND);
  var parts = [], lights = [], lasers = [], flames = [], callouts = [], nodes = [], imags = [], archLine = [], masts = [];

  function part(kind, t0, geo, o) {
    var p = { kind: kind, st: KIND[kind], t0: t0, dur: 0.55, segs: geo.segs || [], faces: geo.faces || [], truss: geo.truss || null,
      anim: 'drop', arrive: [0, 4, 0], layer: 1, lift: false, veh: null, out: null, dyf: null, nMain: geo.nMain || 0, det: 0, quiet: false, noX: false };
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
    if (p.truss) p.truss.m = mul(add(p.truss.a, p.truss.b), 0.5);
    p.ki = KIND_NAMES.indexOf(kind);
    p.screens = p.faces.some(function (f) { return !!f.screen; });
    p.Mo = { k: 0, dy: 0, off: null, ov: [0, 0, 0], gs: -1, ps: -1, X: null };   // this part's motion, reused every frame
    parts.push(p);
    return p;
  }
  function roofY(t) { return lerp(-21.8, 0, inOut(span(t, T.roof))); }

  /* ---- Moving and articulated kit (film v3) ------------------------------
     Plant, trucks and the hinged towers are ordinary parts drawn in their own
     frame; a Rig moves that frame once per frame: an optional hinge (a turn
     about a level axis through a pivot), then a turn about the vertical, then
     a move. X.a fades the whole rig in and out. */
  function Rig(fn) { this.fn = fn; this.X = { t: NaN, h: false, hx: 1, hz: 0, px: 0, py: 0, pz: 0, hc: 1, hs: 0, cy: 1, sy: 0, tx: 0, ty: 0, tz: 0, a: 1 }; }
  Rig.prototype.at = function (t) {
    var X = this.X;
    if (X.t !== t) { X.t = t; X.h = false; X.a = 1; X.cy = 1; X.sy = 0; X.tx = 0; X.ty = 0; X.tz = 0; this.fn(t, X); }
    return X;
  };
  function hingeX(X, px, py, pz, hx, hz, ang) { X.h = true; X.px = px; X.py = py; X.pz = pz; X.hx = hx; X.hz = hz; X.hc = Math.cos(ang); X.hs = Math.sin(ang); }
  function placeX(X, yaw, x, y, z) { X.cy = Math.cos(yaw); X.sy = Math.sin(yaw); X.tx = x; X.ty = y; X.tz = z; }
  var RX = 0, RY = 0, RZ = 0;
  function rigPt(X, x, y, z) {
    if (X.h) {
      var vx = x - X.px, vy = y - X.py, vz = z - X.pz, kd = X.hx * vx + X.hz * vz, c = X.hc, s = X.hs;
      x = X.px + vx * c - X.hz * vy * s + X.hx * kd * (1 - c);
      y = X.py + vy * c + (X.hz * vx - X.hx * vz) * s;
      z = X.pz + vz * c + X.hx * vy * s + X.hz * kd * (1 - c);
    }
    RX = x * X.cy + z * X.sy + X.tx; RY = y + X.ty; RZ = -x * X.sy + z * X.cy + X.tz;
  }
  function fadeWin(t, a, b) { return smooth(span(t, [a, a + 0.35])) * (1 - smooth(span(t, [b - 0.35, b]))); }

  /* ---- The site: a summit plateau, and the ridge road that climbs to it -- */
  var SITE_C = [0, 20], PAD = { x0: -122, x1: 122, z0: -132, z1: 150 };
  var SPUR_A = Math.atan2(-0.8, 0.6);   // the ridge the access road climbs, to the north-east
  function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  function rimR(a) { var d = angDiff(a, SPUR_A) / 0.11; return 330 + 46 * Math.sin(3 * a + 0.6) + 24 * Math.sin(7 * a + 2.1) + 1400 * Math.exp(-d * d); }
  function groundH(x, z) {
    var dx = x - SITE_C[0], dz = z - SITE_C[1], r = Math.sqrt(dx * dx + dz * dz), a = Math.atan2(dz, dx);
    var h = 1.2 * Math.sin(x / 31 + 1.3) * Math.cos(z / 27) + 0.8 * Math.sin((x + 2 * z) / 47) + 0.5 * Math.sin(x / 13 - z / 17);
    var R = rimR(a);
    if (r > R) h -= Math.pow(r - R, 1.3) * 1.25;
    var d = angDiff(a, SPUR_A) / 0.11, spur = Math.exp(-d * d);
    if (spur > 0.01 && r > 330) h -= (r - 330) * 0.09 * spur;   // along the spur the ground falls gently: the road's grade
    return h;
  }
  // The grading: a front sweeps down the pad behind the graders.
  function gradeFront(t) { return lerp(PAD.z0 - 30, PAD.z1 + 40, span(t, [T.ground[0] + 0.2, T.ground[0] + 3.0])); }
  function padIn(x, z) { return clamp((Math.min(x - PAD.x0, PAD.x1 - x, z - PAD.z0, PAD.z1 - z) + 12) / 24, 0, 1); }
  function siteH(x, z, t) {
    var m = padIn(x, z);
    if (m <= 0) return groundH(x, z);
    var g = smooth(clamp((gradeFront(t) - (z + 0.2 * x)) / 22, 0, 1));
    return groundH(x, z) * (1 - m * (0.55 + 0.45 * g));
  }
  var ROAD = (function () {   // from far down the ridge to the site gate, then the backstage road
    var pts = [], r, ca = Math.cos(SPUR_A), sa = Math.sin(SPUR_A);
    for (r = 1560; r > 380; r -= 60) { var w = 24 * Math.sin(r / 130); pts.push([SITE_C[0] + r * ca - w * sa, SITE_C[1] + r * sa + w * ca]); }
    pts.push([150, -170], [124, -140], [122, -100], [118, -54]);
    return pts;
  })();
  function polyPath(pts) {
    var cum = [0];
    for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts: pts, cum: cum, L: cum[cum.length - 1] };
  }
  var PA_X = 0, PA_Z = 0;
  function pathAt(P, s) {
    var pts = P.pts, cum = P.cum, i = 1;
    s = clamp(s, 0, P.L);
    while (i < pts.length - 1 && cum[i] < s) i++;
    var a = pts[i - 1], b = pts[i], u = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    PA_X = lerp(a[0], b[0], u); PA_Z = lerp(a[1], b[1], u);
  }
  // Place a rig on a path at distance s, turned along it (looking a few metres ahead and behind, so corners are smooth).
  function onPath(X, P, s, t, back) {
    pathAt(P, s - 3.5); var x0 = PA_X, z0 = PA_Z;
    pathAt(P, s + 3.5); var x1 = PA_X, z1 = PA_Z;
    pathAt(P, s);
    var yaw = Math.atan2(x1 - x0, z1 - z0) + (back ? Math.PI : 0);
    placeX(X, yaw, PA_X, siteH(PA_X, PA_Z, t), PA_Z);
  }

  /* ---- Local-frame geometry for the kit (+z forward, y up) --------------- */
  function merge(list) { var g = { segs: [], faces: [] }; list.forEach(function (q) { if (q.segs) g.segs = g.segs.concat(q.segs); if (q.faces) g.faces = g.faces.concat(q.faces); }); return g; }
  // main outlines first, then small detail drawn only when the part is big on screen
  function detailed(main, det) { var g = merge(main), d = merge(det); g.nMain = g.segs.length; g.segs = g.segs.concat(d.segs); g.faces = g.faces.concat(d.faces); return g; }
  function S(list) { return { segs: list }; }
  function polySegs(pts, closed) { var s = [], n = pts.length; for (var i = 0; i < n - (closed ? 0 : 1); i++) s.push([pts[i], pts[(i + 1) % n]]); return s; }
  function pieces(a, b, step) { var L = len(sub(b, a)), n = Math.max(1, Math.round(L / step)), s = []; for (var i = 0; i < n; i++) s.push([lerp3(a, b, i / n), lerp3(a, b, (i + 1) / n)]); return s; }
  function wheelSegs(x, z, r) {
    var s = [];
    for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2, b = (i + 1) / 8 * Math.PI * 2; s.push([[x, r + r * Math.sin(a), z + r * Math.cos(a)], [x, r + r * Math.sin(b), z + r * Math.cos(b)]]); }
    return s;
  }
  function wheelsAt(zs, half, r) { var s = []; zs.forEach(function (z) { s = s.concat(wheelSegs(-half, z, r), wheelSegs(half, z, r)); }); return S(s); }
  function ribs(x0, x1, y0, y1, z0, z1, step) {   // vertical lines down both long sides (container corrugation, curtain straps)
    var s = [], n = Math.max(1, Math.round((z1 - z0) / step));
    for (var i = 1; i < n; i++) { var z = lerp(z0, z1, i / n); s.push([[x0, y0, z], [x0, y1, z]], [[x1, y0, z], [x1, y1, z]]); }
    return S(s);
  }
  var KITS = {
    truck: function () {
      return [
        ['truck', detailed([boxGeo(-1.25, 1.0, 5.4, 1.25, 3.7, 7.7)], [S([[[-1.1, 2.6, 7.72], [1.1, 2.6, 7.72]], [[-1.1, 3.5, 7.72], [1.1, 3.5, 7.72]], [[-1.2, 1.3, 7.72], [1.2, 1.3, 7.72]],
          [[1.05, 3.7, 5.6], [1.05, 4.6, 5.6]], [[-1.05, 3.7, 5.6], [-1.05, 4.6, 5.6]]])])],
        ['box', detailed([boxGeo(-1.3, 1.25, -7.4, 1.3, 4.0, 5.1)], [ribs(-1.31, 1.31, 1.3, 3.95, -7.4, 5.1, 1.25)])],
        ['truck', detailed([S([[[-0.9, 0.95, -7.4], [-0.9, 0.95, 7.7]], [[0.9, 0.95, -7.4], [0.9, 0.95, 7.7]]])], [wheelsAt([6.8, 4.1, 2.9, -4.2, -5.5, -6.8], 1.2, 0.5)])]
      ];
    },
    grader: function () {
      var bl = 0.45;
      return [
        ['plant', detailed([boxGeo(-0.45, 1.0, -4.6, 0.45, 1.5, 4.4), boxGeo(-1.15, 1.1, -4.5, 1.15, 2.4, -3.0), boxGeo(-1.0, 1.5, -3.0, 1.0, 3.3, -1.3)],
          [wheelsAt([3.9, -2.8, -4.0], 1.15, 0.7), S([[[0, 1.2, 4.4], [0, 0.7, 0.6]]])])],
        ['plant', oboxGeo([0, 0.45, 0.6], [2.1 * Math.cos(bl), 0, -2.1 * Math.sin(bl)], [0, 0.32, 0], [0.07 * Math.sin(bl), 0, 0.07 * Math.cos(bl)])]
      ];
    },
    water: function () {
      return [
        ['plant', boxGeo(-1.25, 1.0, 3.6, 1.25, 3.3, 5.8)],
        ['truck', detailed([boxGeo(-1.1, 1.3, -4.4, 1.1, 3.1, 3.3)], [wheelsAt([5.0, -2.2, -3.4], 1.15, 0.55), S([[[-1.3, 0.8, -4.6], [1.3, 0.8, -4.6]]])])]
      ];
    },
    forklift: function () {
      return [
        ['plant', detailed([boxGeo(-1.1, 0.5, -1.9, 1.1, 1.5, 1.5)], [wheelsAt([1.1, -1.3], 1.12, 0.55),
          S([[[-0.9, 1.5, -0.9], [-0.9, 2.7, -0.9]], [[0.9, 1.5, -0.9], [0.9, 2.7, -0.9]], [[-0.9, 1.5, 0.9], [-0.9, 2.7, 0.9]], [[0.9, 1.5, 0.9], [0.9, 2.7, 0.9]],
            [[-0.9, 2.7, -0.9], [0.9, 2.7, 0.9]], [[0.9, 2.7, -0.9], [-0.9, 2.7, 0.9]]])])],
        ['plant', S([[[-0.5, 0.3, 1.8], [-0.5, 3.1, 1.8]], [[0.5, 0.3, 1.8], [0.5, 3.1, 1.8]], [[-0.5, 3.1, 1.8], [0.5, 3.1, 1.8]], [[-0.5, 1.5, 1.8], [0.5, 1.5, 1.8]]])]
      ];
    },
    tele: function () {
      return [
        ['plant', detailed([boxGeo(-1.2, 0.6, -2.6, 1.2, 1.5, 2.4), boxGeo(0.25, 1.5, -0.6, 1.2, 2.7, 1.2)], [wheelsAt([1.6, -1.7], 1.2, 0.6)])]
      ];
    },
    crane: function () {   // the tracks and carbody; the house turns, the boom luffs (see craneKit)
      return [
        ['plant', detailed([boxGeo(-3.7, 0, -3.9, -2.6, 1.25, 3.9), boxGeo(2.6, 0, -3.9, 3.7, 1.25, 3.9)],
          [S([[[-3.7, 0.6, -3.9], [-3.7, 0.6, 3.9]], [[3.7, 0.6, -3.9], [3.7, 0.6, 3.9]], [[-2.6, 0.9, 0], [2.6, 0.9, 0]]])])]
      ];
    },
    house: function () {
      return [
        ['plant', detailed([boxGeo(-2.0, 1.3, -2.8, 2.0, 4.1, 2.4), boxGeo(-2.3, 1.7, -5.3, 2.3, 3.8, -2.8), boxGeo(1.25, 1.4, 1.3, 2.25, 3.7, 3.4)],
          [S([[[-1.5, 4.1, -2.0], [0, 9.0, -3.2]], [[1.5, 4.1, -2.0], [0, 9.0, -3.2]], [[0, 9.0, -3.2], [0, 4.1, 1.0]], [[-2.3, 2.75, -5.3], [2.3, 2.75, -5.3]]])])]
      ];
    }
  };
  var KITRIGS = [], BEACON = { grader: [0, 3.45, -2.1], water: [0, 3.45, 4.7], forklift: [0, 2.85, 0], tele: [0.75, 2.85, 0.3], house: [1.75, 3.85, 2.3] };
  function kit(name, rig, t0, o) {
    var list = [];
    if (BEACON[name]) KITRIGS.push({ rig: rig, p: BEACON[name] });
    KITS[name]().forEach(function (k) {
      var q = { veh: rig, anim: 'fade', dur: 0.25, quiet: true, noX: true };
      if (o) for (var key in o) q[key] = o[key];
      list.push(part(k[0], t0, k[1], q));
    });
    return list;
  }

  /* ---- Survey kit and marks ------------------------------------------------ */
  var CP = [-30, 34], GB = [30, 40];   // the total station's control point; the GNSS base
  function tripodGeo(x, z, h, station) {
    var s = [], head = [x, h, z];
    for (var i = 0; i < 3; i++) { var a = i / 3 * Math.PI * 2 + 0.4; s.push([head, [x + 0.62 * Math.cos(a), 0, z + 0.62 * Math.sin(a)]]); }
    var g = merge([S(s)]);
    if (station) g = merge([g, boxGeo(x - 0.1, h, z - 0.09, x + 0.1, h + 0.35, z + 0.09), S([[[x - 0.08, h + 0.24, z], [x + 0.2, h + 0.24, z]]])]);
    else { var d = []; for (i = 0; i < 8; i++) { var b = i / 8 * Math.PI * 2, e = (i + 1) / 8 * Math.PI * 2; d.push([[x + 0.1 * Math.cos(b), h + 0.3, z + 0.1 * Math.sin(b)], [x + 0.1 * Math.cos(e), h + 0.3, z + 0.1 * Math.sin(e)]]); } g = merge([g, S(d.concat([[head, [x, h + 0.3, z]]]))]); }
    return g;
  }
  function targetGeo(x, z) {   // a ground control target: a checkerboard square for the drone
    var y = 0.03, f = [];
    [[0, 0], [1, 1]].forEach(function (q) { var x0 = x - 0.5 + q[0] * 0.5, z0 = z - 0.5 + q[1] * 0.5; f.push({ p: [[x0, y, z0], [x0 + 0.5, y, z0], [x0 + 0.5, y, z0 + 0.5], [x0, y, z0 + 0.5]], n: [0, 1, 0] }); });
    return { segs: polySegs([[x - 0.5, y, z - 0.5], [x + 0.5, y, z - 0.5], [x + 0.5, y, z + 0.5], [x - 0.5, y, z + 0.5]], true), faces: f };
  }
  function stakeGeo(x, z) {   // a lath with a flag, beside a painted cross
    var lx = x + 0.4, lz = z + 0.4;
    return S([[[lx, 0, lz], [lx, 1.2, lz]], [[lx, 1.2, lz], [lx + 0.28, 1.12, lz]], [[lx + 0.28, 1.12, lz], [lx, 1.02, lz]],
      [[x - 0.5, 0.02, z], [x + 0.5, 0.02, z]], [[x, 0.02, z - 0.5], [x, 0.02, z + 0.5]]]);
  }
  var STAKES = [], GCPS = [[-60, 70], [60, 70], [-90, -30], [90, -30], [0, -60], [0, 110]];
  var PAINT = [];

  var WATER = { rig: null }, WLT = [], TRUCKS = [], GENS = [], ROVERS = [];

  /* ---- The crew: digital workers in hi-vis and hard hats (drawn with the stage) -- */
  var CREW = [];
  var VEST_C = [LIME, AMBER], HAT_C = [INK, [255, 214, 90]];
  function man(way, o) {
    var w = { way: way, t0: way[0][0] - 0.25, t1: Infinity, mode: 'walk', stop: 'stand', vest: 0, hat: 1, y: 0, aim: null, face: null, rig: null, seat: null, cum: [0], yaws: [] };
    if (o) for (var k in o) w[k] = o[k];
    var yaw = w.yaw0 || 0, i;
    for (i = 1; i < way.length; i++) {
      var a = way[i - 1], b = way[i], L = Math.hypot(b[1] - a[1], b[2] - a[2]);
      w.cum.push(w.cum[i - 1] + L + Math.abs((b[3] || 0) - (a[3] || 0)));
      if (L > 0.05) yaw = Math.atan2(b[1] - a[1], b[2] - a[2]);
      w.yaws.push(yaw);
    }
    if (!w.yaws.length) w.yaws.push(yaw);
    CREW.push(w);
    return w;
  }

  /* ---- Cranes: a crawler crane's house slews and its boom luffs so that the hook
     is where the job needs it; the rope, hook and loads are drawn each frame. */
  var CRANES = [];
  function craneKit(base, yaw0, jobs, t0, t1) {
    var cr = { base: base, jobs: jobs, L: 58, st: { t: NaN, yaw: yaw0, el: 0.2, tip: [0, 0, 0], hook: [0, 0, 0], load: null }, t0: t0, t1: t1 };
    // A job key is a hook position at a time: p (a point), fn (follow a moving point, e.g. a tower top
    // as it swings up) or neither (hold where the previous key ended). The hook eases between keys.
    function keyPos(i, tt) { var J = cr.jobs; return J[i].fn ? J[i].fn(tt) : J[i].p ? J[i].p : i > 0 ? keyPos(i - 1, J[i].t) : [base[0], 4, base[2] + 10]; }
    function state(t) {
      var s = cr.st;
      if (s.t === t) return s;
      s.t = t;
      var J = cr.jobs, i = 0, H, load = null;
      while (i < J.length - 1 && t >= J[i + 1].t) i++;
      var a = J[i], b = J[Math.min(i + 1, J.length - 1)];
      if (a.fn) { H = a.fn(t); load = 'tower'; }
      else {
        var u = b === a ? 1 : smooth(clamp((t - a.t) / Math.max(0.01, b.t - a.t), 0, 1));
        H = lerp3(keyPos(i, a.t), keyPos(i + 1 < J.length ? i + 1 : i, b.t), u); load = a.load || null;
      }
      var fx = H[0] - base[0], fz = H[2] - base[2];
      var yaw = Math.atan2(fx, fz), fwd = [Math.sin(yaw), Math.cos(yaw)];
      var piv = [base[0] + fwd[0] * 2.0, 3.2, base[2] + fwd[1] * 2.0];
      var r = Math.hypot(H[0] - piv[0], H[2] - piv[2]), el = Math.acos(clamp(r / cr.L, 0.2, 0.985));
      var up = smooth(span(t, [cr.t0, cr.t0 + 1.0]));   // the boom rises off its rest when the crane sets up
      el = lerp(0.09, el, up);
      s.yaw = yaw; s.el = el;
      s.tip = [piv[0] + fwd[0] * cr.L * Math.cos(el), piv[1] + cr.L * Math.sin(el), piv[2] + fwd[1] * cr.L * Math.cos(el)];
      s.hook = up < 1 ? [s.tip[0], Math.max(0.5, s.tip[1] - 6), s.tip[2]] : [s.tip[0], Math.min(H[1], s.tip[1] - 2.5), s.tip[2]];
      s.load = load; s.a = fadeWin(t, cr.t0, cr.t1);
      return s;
    }
    cr.state = state;
    var tracks = new Rig(function (t, X) { placeX(X, yaw0, base[0], 0, base[2]); X.a = fadeWin(t, cr.t0, cr.t1); });
    var house = new Rig(function (t, X) { var s = state(t); placeX(X, s.yaw, base[0], 0, base[2]); X.a = s.a; });
    var boom = new Rig(function (t, X) { var s = state(t); hingeX(X, 0, 3.2, 2.0, -1, 0, s.el); placeX(X, s.yaw, base[0], 0, base[2]); X.a = s.a; });
    kit('crane', tracks, t0);
    kit('house', house, t0);
    part('boom', t0, trussGeo([0, 3.2, 2.0], [0, 3.2, 2.0 + cr.L], 1.5, 2.3), { veh: boom, anim: 'fade', dur: 0.25, quiet: true, noX: true });
    CRANES.push(cr);
    return cr;
  }

  // The ground-support towers: T1 is stacked section by section; the other five are pinned
  // together lying on the ground, then hinged up by the cranes.
  var HINGE = [null, [21.95, 22.7], [22.8, 23.55], [22.1, 22.85], [22.95, 23.7], [23.6, 24.35]];
  function hingeK(n, t) { return HINGE[n] ? inOut(span(t, HINGE[n])) : 1; }
  function towerTop(n, t) {   // where the top of tower n is, as it swings up
    var tw = TOWERS[n], s = tw[0] < 0 ? -1 : 1, a = -s * (Math.PI / 2) * (1 - hingeK(n, t)), h = 25.6;
    return [tw[0] - h * Math.sin(a), 0.25 + h * Math.cos(a), tw[1]];
  }

  // Every worker, where the work is: [time, x, z, y] waypoints; they walk (or carry, or climb) between
  // them and, when they stop, do their stop pose (kneel, work, point, wave, drive...).
  function buildCrew(STAKES) {
    var S0 = T.survey[0], G0 = T.ground[0], D0 = T.deck[0], W0 = T.towers[0], R0 = T.prerig[0], V0 = T.video[0], A0 = T.audio[0], L0 = T.light[0], X0 = T.site[0], C0 = T.checks[0];
    var k, H = DECK.h;
    function R(a, b) { return a + rnd() * (b - a); }
    function put(way, t, x, z, y) { var l = way[way.length - 1]; if (l && t < l[0] + 0.04) t = l[0] + 0.04; way.push([t, x, z, y || 0]); }
    // a gang: each worker hops from spot to spot around a moving work front, pausing to work at each
    function gang(n, t0, t1, at, o) {
      for (var g = 0; g < n; g++) {
        var way = [], t = t0 + rnd() * 0.35, hop = (o.hop || 0.6) * R(0.85, 1.2), p = at(t, g), q;
        put(way, t, p[0], p[1], p[2]);
        while (t < t1) {
          put(way, t + hop * R(0.35, 0.6), p[0], p[1], p[2]);
          t += hop;
          q = at(t, g);
          put(way, t, q[0], q[1], q[2]);
          p = q;
        }
        man(way, { t0: t0, t1: t1 + 0.25, mode: o.mode || 'walk', stop: o.stops ? o.stops[g % o.stops.length] : 'work',
          vest: o.vest !== undefined ? o.vest : (g % 4 === 3 ? 1 : 0), hat: o.hat !== undefined ? o.hat : (g % 5 === 0 ? 0 : 1), face: o.face || null });
      }
    }

    // 01 the surveyor at the total station, two GNSS rovers and their stake crews, the drone pilot
    man([[S0 + 0.1, CP[0] - 0.9, CP[1] + 0.5]], { stop: 'station', face: [0, 10], t1: G0 + 2.2, vest: 0, hat: 0 });
    var front = STAKES.filter(function (s) { return s.z > -2 && s.z < 30 && Math.abs(s.x) < 30; });
    [front.filter(function (s) { return s.x < 0; }), front.filter(function (s) { return s.x >= 0; })].forEach(function (list, n) {
      var way = [], way2 = [], base = n ? [10, 30] : [-12, 30];
      put(way, S0 + 0.2, base[0], base[1]);
      put(way2, S0 + 0.3, base[0] - 2, base[1] + 1);
      list.forEach(function (s) {
        put(way, s.t - 0.12, s.x + 0.9, s.z + 0.3); put(way, s.t + 0.1, s.x + 0.9, s.z + 0.3);
        put(way2, s.t + 0.02, s.x - 0.6, s.z + 0.7); put(way2, s.t + 0.28, s.x - 0.6, s.z + 0.7);
      });
      put(way, S0 + 3.3, base[0] + 3, base[1] + 4);
      ROVERS.push(man(way, { mode: 'rover', stop: 'rover', t1: S0 + 3.5, vest: 0, hat: 1 }));
      man(way2, { mode: 'walk', stop: 'kneel', t1: S0 + 3.4, vest: 1, hat: 1 });
    });
    man([[S0, -25, 27]], { stop: 'work', face: [10, -30], t1: S0 + 3.6, vest: 0, hat: 1 });

    // 02 a banksman at the gate, trackway crews behind the laying front, light-tower techs, the compound, electricians
    man([[G0 + 0.6, 129, -121]], { stop: 'wave', face: [135, -160], t1: G0 + 4.0, vest: 1, hat: 1 });
    var TP = polyPath([[122, -128], [122, -48], [-118, -48]]);
    gang(6, G0 + 1.0, G0 + 2.1, function (t, g) { pathAt(TP, (t - G0 - 1.0) / 0.028 * 10 - 8 - g * 3); return [PA_X + (g % 2 ? 2.6 : -2.6), PA_Z + (g % 3 - 1) * 2.2]; },
      { mode: 'carry', stops: ['kneel', 'work', 'kneel'], hop: 0.4, vest: 1 });
    WLT.slice(0, 8).forEach(function (L, n) { man([[L.t0 - 0.7, L.x + 1.7, L.z + 1.3]], { stop: 'work', face: [L.x, L.z], t1: L.t0 + 0.6, vest: n % 2, hat: 1 }); });
    gang(8, G0 + 3.0, C0 + 2.0, function () { return [R(36, 108), R(-120, -62)]; }, { stops: ['stand', 'work'], hop: 1.1, vest: 1 });
    gang(3, G0 + 3.0, W0 + 2.0, function () { return [R(-88, -50), R(-80, -60)]; }, { stops: ['kneel', 'work'], hop: 0.9, vest: 1 });

    // 04 scaffolders at the growing edge of the substructure (tubes on their shoulders), then the deck crew on top
    gang(16, D0, D0 + 2.1, function (t) { var row = clamp((t - D0 - 0.2) / 0.16, 0, 9); return [R(-21, 21), -14 + row * 2 + R(-1.2, 2.5)]; },
      { mode: 'tube', stops: ['kneel', 'work', 'kneel', 'work'], hop: 0.55 });
    gang(10, D0 + 1.5, D0 + 3.4, function (t) { var row = clamp((t - D0 - 1.45) / 0.18, 0, 8.5); return [R(-20, 20), -14 + row * 2 + R(-2.5, 0.3), H]; },
      { mode: 'carry', stops: ['kneel', 'work'], hop: 0.5 });
    man([[D0, -20, 6.5], [D0 + 1.2, -4, 6.5], [D0 + 1.6, -4, 6.5], [D0 + 2.6, 12, 6.5], [D0 + 3.0, 12, 6.5], [W0 + 2.5, 30, 12]],
      { stop: 'point', aim: [0, 1, -8], t1: W0 + 2.8, vest: 0, hat: 0 });

    // 05 a climber rides T1 up as it is stacked; crews at every tower base; a climber up each tower once it stands
    TOWERS.forEach(function (tw, n) {
      var s = tw[0] < 0 ? -1 : 1, up = n ? HINGE[n][1] + 0.1 : W0 + 0.5, top = n ? Math.max(up + 0.7, R0 + 0.25) : W0 + 0.35 + 7 * 0.22 + 0.3;
      gang(2, W0 - 0.1, n ? HINGE[n][1] : W0 + 1.8, function () { return [tw[0] + s * R(1.8, 3.2), tw[1] + R(-2.5, 2.5)]; }, { stops: ['kneel', 'work'], hop: 0.7, face: [tw[0], tw[1]] });
      man([[up, tw[0] - s * 0.72, tw[1] + 0.2, 0], [top, tw[0] - s * 0.72, tw[1] + 0.2, 23.4], [T.roof[1] + 0.3, tw[0] - s * 0.72, tw[1] + 0.2, 23.4]],
        { mode: 'climb', stop: 'climb', face: [tw[0], tw[1] + 0.2], t1: T.roof[1] + 0.5, vest: 0, hat: 0 });
    });
    gang(10, W0 + 1.4, T.roof[0] - 0.3, function (t, g) { return [R(-20, 20), [3, -4.5, -12.5][g % 3] + R(-1.2, 1.2), H]; }, { stops: ['kneel', 'work'], hop: 0.6 });
    // 06 the head rigger at the motor controller, calling the lift
    man([[R0 - 0.2, -17, -8, H], [R0 + 0.3, -20.2, -11.6, H]], { stop: 'point', aim: [0, 18, -4], t1: T.roof[1] + 0.8, vest: 0, hat: 0 });

    // 07 LED crew latching tiles at the foot of the rising columns; the halo crew at the spine
    gang(8, V0 + 0.2, V0 + 2.6, function (t) { var col = clamp((t - V0 - 0.3) / 0.075, 0, 23); return [LED.x0 + (col + 0.5) * 1.5 + R(-2.5, 2.5), LED.z + R(1.0, 2.4), H]; },
      { mode: 'carry', stops: ['work', 'work', 'kneel'], hop: 0.45, face: [0, -40] });
    gang(3, V0, V0 + 2.2, function () { return [R(-3, 3), R(-11.4, -10.4), H]; }, { stops: ['work'], hop: 0.8, face: [0, -40] });

    // 08 the audio crew at the carts under each hang; a crew up every delay tower
    [-1, 1].forEach(function (s) { gang(4, A0, A0 + 1.9, function () { return [s * 21 + R(-2.4, 2.4), R(8.4, 11.6)]; }, { stops: ['work', 'kneel'], hop: 0.5, face: [s * 21, 7.2] }); });
    [[46, [-36, -13, 13, 36]], [84, [-28, 0, 28]]].forEach(function (row, ri) {
      row[1].forEach(function (x, mi) {
        var t0 = A0 + 0.1 + ri * 0.22 + mi * 0.06, z = row[0];
        man([[t0, x - 2.6, z + 2.2], [t0 + 0.35, x - 2.6, z + 2.2], [t0 + 0.5, x - 1.9, z + 1.1, 0], [t0 + 1.2, x - 1.9, z + 1.1, 13.2], [A0 + 2.4, x - 1.9, z + 1.1, 13.2]],
          { stop: 'work', face: [x, z], t1: A0 + 2.6, vest: mi % 2, hat: 1 });
      });
    });
    // 09 lighting and effects techs along the downstage edge
    gang(6, L0 + 0.9, X0 + 1.5, function (t, g) { return [[-19.5, -15, -11, 7, 11, 15][g] + R(-2, 2), R(2.4, 3.4), H]; }, { stops: ['kneel', 'work'], hop: 0.55, face: [0, 30], vest: 1 });
    // the barricade crew carry sections along the line and pin them; the FOH crew at the desks
    gang(8, X0 - 0.1, X0 + 1.3, function (t, g) { var u = clamp((t - X0) / 1.1 + (g - 3.5) * 0.03, 0, 1); return [lerp(-24, 24, u) + R(-1, 1), 8.8 + R(0, 1.6)]; },
      { mode: 'carry', stops: ['kneel', 'work'], hop: 0.4, vest: 1 });
    gang(4, X0 + 0.3, C0 + 2.2, function (t, g) { return [[-3.2, 0, 3.2, 1.6][g] + R(-0.3, 0.3), 58.2 + R(-0.3, 0.3), 1.0]; }, { stops: ['work'], hop: 1.5, face: [0, 0] });

    // stagehands push tile and rack cases across the deck in lines; up-riggers walk the grid once it is at trim;
    // a safety officer walks the site
    gang(8, V0 + 0.1, A0 + 1.2, function (t, g) { var u = ((t - V0) * 0.45 + g * 0.13) % 1; return [lerp(-18, 18, (g + 0.5) / 8) + R(-1, 1), lerp(1.5, -10.5, u), H]; },
      { mode: 'carry', stops: ['work', 'stand'], hop: 0.55, vest: 1, face: [0, -40] });
    [[5, -1], [-4.5, 1], [-14, -1], [5, 1]].forEach(function (rp, n) {
      var z = rp[0], dir = rp[1], xa = -16 * dir, xb = 14 * dir, t0 = T.roof[1] + 0.2 + n * 0.15, way = [];
      // along the top chord of an arch, clipped on: short hops, pausing to work at the fixings
      for (var q = 0; q <= 6; q++) {
        var x = lerp(xa, xb, q / 6), y = archY(x) + 0.46;
        way.push([t0 + q * 0.75, x, z, y]); way.push([t0 + q * 0.75 + 0.4, x, z, y]);
      }
      man(way, { stop: 'kneel', t1: T.explode[0] - 0.1, vest: 0, hat: 0 });
    });
    man([[D0 + 0.4, -40, 20], [D0 + 1.6, -30, 10], [D0 + 2.0, -30, 10], [W0 + 1.4, 30, 10], [W0 + 1.8, 30, 10], [V0 + 1.0, 32, -24], [V0 + 1.4, 32, -24], [A0 + 1.0, -30, 30]],
      { stop: 'point', aim: [0, 6, -4], t1: A0 + 1.2, vest: 1, hat: 0 });

    // 10 the stage manager calls the checks; the crew walk off the deck; riggers stay on the grid for the last look
    man([[C0 - 0.4, -12, 0, H], [C0 + 0.1, -17, 2.4, H]], { stop: 'point', aim: [0, 11, -12.5], t1: C0 + 2.7, vest: 0, hat: 0 });
    for (k = 0; k < 10; k++) {
      var sx = k % 2 ? 1 : -1, x0 = R(-16, 16), z0 = R(-10, 2), zz = R(-12, -9);
      man([[C0 + 0.2 + k * 0.05, x0, z0, H], [C0 + 0.5 + k * 0.06, x0, z0, H], [C0 + 1.8 + k * 0.04, sx * 21.5, zz, H], [C0 + 2.1 + k * 0.04, sx * 26, zz + 1, 0]],
        { stop: 'stand', t1: C0 + 2.25 + k * 0.03, vest: k % 3 === 0 ? 1 : 0, hat: 1 });
    }
    [[-7, 5], [9, -4.5], [-15, -14]].forEach(function (rp, n) {
      var y = archY(rp[0]) + 0.46;
      man([[C0 + 0.3 + n * 0.1, rp[0] - 1.6, rp[1], archY(rp[0] - 1.6) + 0.46], [C0 + 1.1 + n * 0.1, rp[0], rp[1], y]],
        { stop: n === 1 ? 'point' : 'work', aim: [0, 2, 20], face: [rp[0] + 3, rp[1] + 6], t1: T.power[0] + 0.4, vest: 0, hat: 0 });
    });
  }

  (function build() {
    var i, j, k, lv, S0 = T.survey[0], G0 = T.ground[0], D0 = T.deck[0], W0 = T.towers[0], R0 = T.prerig[0], V0 = T.video[0], A0 = T.audio[0], L0 = T.light[0], X0 = T.site[0], C0 = T.checks[0];
    seed = 31337;

    /* ======== 01  Survey and set-out ======== */
    part('stake', S0 + 0.15, tripodGeo(CP[0], CP[1], 1.55, true), { anim: 'pop', dur: 0.35, quiet: true, noX: true });
    part('stake', S0 + 0.3, tripodGeo(GB[0], GB[1], 1.45, false), { anim: 'pop', dur: 0.35, quiet: true, noX: true });
    GCPS.forEach(function (g, n) { part('stake', S0 + 0.1 + n * 0.08, targetGeo(g[0], g[1]), { anim: 'fade', dur: 0.3, quiet: true, noX: true }); });
    // the points: every foot of the structure, marked where it lands
    var pts = [[-22, -14], [22, -14], [-22, 4], [22, 4], [0, -14], [0, 4], [-2.5, 18], [2.5, 18], [0, 22.2],
      [-25.2, 5.3], [25.2, 5.3], [-40.2, 5.3], [40.2, 5.3], [-26, -14], [26, -14], [-36, -6], [36, -6], [-21, 7.2], [21, 7.2],
      [-36, 46], [-13, 46], [13, 46], [36, 46], [-28, 84], [0, 84], [28, 84], [-6, 54], [6, 54], [-6, 62], [6, 62], [-80, -18], [80, -18]];
    TOWERS.forEach(function (tw) { pts.push([tw[0], tw[1]]); });
    pts.sort(function (a, b) { return Math.hypot(a[0] - CP[0], a[1] - CP[1]) - Math.hypot(b[0] - CP[0], b[1] - CP[1]); });
    pts.forEach(function (q, n) { STAKES.push({ x: q[0], z: q[1], t: S0 + 0.45 + n * 0.055 }); });
    STAKES.forEach(function (s) { part('stake', s.t, stakeGeo(s.x, s.z), { arrive: [0, 1.4, 0], dur: 0.3, quiet: true, noX: true }); });
    // the set-out painted on the ground: the drawing, now full size
    function paint(t0, dur, list) { var segs = []; list.forEach(function (l) { segs = segs.concat(pieces(l[0], l[1], 1.5)); }); part('paint', t0, S(segs), { anim: 'draw', dur: dur, quiet: true, noX: true }); PAINT.push(t0); }
    var y0 = 0.03;
    paint(S0 + 1.3, 0.9, [[[-22, y0, 4], [22, y0, 4]], [[22, y0, 4], [22, y0, -14]], [[22, y0, -14], [-22, y0, -14]], [[-22, y0, -14], [-22, y0, 4]]]);
    paint(S0 + 1.5, 0.6, [[[0, y0, -18], [0, y0, 66]], [[-2.5, y0, 4], [-2.5, y0, 18]], [[2.5, y0, 4], [2.5, y0, 18]]]);
    (function () { var l = []; for (var q = 0; q < 20; q++) { var a = q / 20 * Math.PI * 2, b = (q + 1) / 20 * Math.PI * 2; l.push([[4.5 * Math.cos(a), y0, 22.2 + 4.5 * Math.sin(a)], [4.5 * Math.cos(b), y0, 22.2 + 4.5 * Math.sin(b)]]); } paint(S0 + 1.8, 0.5, l); })();
    paint(S0 + 1.9, 0.6, TOWERS.map(function (tw) { return [[tw[0] - 1.6, y0, tw[1] - 1.6], [tw[0] + 1.6, y0, tw[1] + 1.6]]; }).concat(TOWERS.map(function (tw) { return [[tw[0] - 1.6, y0, tw[1] + 1.6], [tw[0] + 1.6, y0, tw[1] - 1.6]]; })));
    paint(S0 + 2.1, 0.7, [[[-24, y0, 8], [-3.6, y0, 8]], [[3.6, y0, 8], [24, y0, 8]], [[-6, y0, 54], [6, y0, 54]], [[6, y0, 54], [6, y0, 62]], [[6, y0, 62], [-6, y0, 62]], [[-6, y0, 62], [-6, y0, 54]]]);
    paint(S0 + 2.3, 0.8, [[[-26, y0, -14], [-36, y0, -14]], [[-36, y0, -14], [-36, y0, -6]], [[26, y0, -14], [36, y0, -14]], [[36, y0, -14], [36, y0, -6]],
      [[-40.2, y0, 5.3], [-25.2, y0, 5.3]], [[25.2, y0, 5.3], [40.2, y0, 5.3]], [[-80, y0, -18], [80, y0, -18]]]);

    /* ======== 02  Ground prep and logistics ======== */
    // two graders sweep the pad; a water truck follows to lay the dust
    [[-100, 100, -4], [90, -90, 10]].forEach(function (g, n) {
      var rig = new Rig(function (t, X) {
        var u = span(t, [G0 + 0.2, G0 + 3.0]), x = lerp(g[0], g[1], u), z = gradeFront(t) - 0.2 * x + g[2];
        var u2 = span(t + 0.02, [G0 + 0.2, G0 + 3.0]), x2 = lerp(g[0], g[1], u2), z2 = gradeFront(t + 0.02) - 0.2 * x2 + g[2];
        placeX(X, Math.atan2(x2 - x, z2 - z), x, 0, z);
        X.a = fadeWin(t, G0 - 0.1, G0 + 3.3);
      });
      kit('grader', rig, G0 - 0.1);
      man([[G0, 0, 0]], { rig: rig, seat: [0, 1.9, -2.1], stop: 'drive', t0: G0 - 0.1, t1: G0 + 3.3, vest: 1, hat: 1 });
    });
    var water = new Rig(function (t, X) {
      var tt = t - 0.45, u = span(tt, [G0 + 0.2, G0 + 3.0]), x = lerp(-100, 100, u) - 12, z = gradeFront(tt) - 0.2 * x - 18;
      var u2 = span(tt + 0.02, [G0 + 0.2, G0 + 3.0]), x2 = lerp(-100, 100, u2) - 12, z2 = gradeFront(tt + 0.02) - 0.2 * x2 - 18;
      placeX(X, Math.atan2(x2 - x, z2 - z), x, 0, z);
      X.a = fadeWin(t, G0 + 0.3, G0 + 3.7);
    });
    kit('water', water, G0 + 0.3);
    WATER.rig = water;

    // trackway: heavy panels laid like dominoes from the gate round the back of the stage, then the side roads
    var TRACKS = [[[122, -128], [122, -48], [-118, -48]], [[54, -48], [54, 36]], [[-54, -48], [-54, 36]]];
    var tt0 = G0 + 1.0;
    TRACKS.forEach(function (route, ri) {
      for (var q = 0; q < route.length - 1; q++) {
        var a = route[q], b = route[q + 1], Lr = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(Lr / 10), d = [(b[0] - a[0]) / Lr, (b[1] - a[1]) / Lr], nrm = [-d[1] * 3, d[0] * 3];
        for (var m = 0; m < n; m++) {
          var p0 = [a[0] + d[0] * Lr * m / n, a[1] + d[1] * Lr * m / n], p1 = [a[0] + d[0] * Lr * (m + 1) / n, a[1] + d[1] * Lr * (m + 1) / n], y = 0.04;
          var quad = [[p0[0] + nrm[0], y, p0[1] + nrm[1]], [p1[0] + nrm[0], y, p1[1] + nrm[1]], [p1[0] - nrm[0], y, p1[1] - nrm[1]], [p0[0] - nrm[0], y, p0[1] - nrm[1]]];
          var joints = [];
          for (var e = 1; e < 4; e++) { var pe = lerp3([p0[0], y, p0[1]], [p1[0], y, p1[1]], e / 4); joints.push([[pe[0] + nrm[0], y, pe[2] + nrm[1]], [pe[0] - nrm[0], y, pe[2] - nrm[1]]]); }
          joints.push([[p0[0], y, p0[1]], [p1[0], y, p1[1]]]);
          part('track', tt0 + (ri ? 0.9 + ri * 0.12 : 0) + (ri ? m * 0.028 : (q * 8 + m) * 0.028), detailed([{ segs: [[quad[0], quad[1]], [quad[2], quad[3]]], faces: [{ p: quad, n: [0, 1, 0] }] }], [S(joints)]),
            { arrive: [0, 1.2, 0], dur: 0.25, quiet: true, noX: true });
        }
      }
    });
    // crane pads
    [[-62, -30], [62, -30]].forEach(function (c2, n) {
      part('track', G0 + 2.0 + n * 0.1, { segs: polySegs([[c2[0] - 7, 0.04, c2[1] - 7], [c2[0] + 7, 0.04, c2[1] - 7], [c2[0] + 7, 0.04, c2[1] + 7], [c2[0] - 7, 0.04, c2[1] + 7]], true),
        faces: [{ p: [[c2[0] - 7, 0.04, c2[1] - 7], [c2[0] + 7, 0.04, c2[1] - 7], [c2[0] + 7, 0.04, c2[1] + 7], [c2[0] - 7, 0.04, c2[1] + 7]], n: [0, 1, 0] }] }, { arrive: [0, 1, 0], dur: 0.3, quiet: true, noX: true });
    });

    // mobile light towers: the night shift's work lights
    [[-40, 26, 0.6], [40, 26, -0.6], [-60, -22, 1.2], [60, -22, -1.2], [-32, -40, 0.4], [32, -40, -0.4], [72, -58, -2.0], [108, -92, -2.3],
     [44, -112, 2.9], [-64, -56, 2.2], [-94, -84, 2.5], [0, 44, 0], [-18, -60, 3.1], [92, -40, -1.6], [-90, 10, 1.4], [90, 10, -1.4]].forEach(function (L, n) {
      var x = L[0], z = L[1], yaw = L[2] + Math.PI, t0 = G0 + 0.5 + n * 0.06, fwd = [Math.sin(yaw), Math.cos(yaw)];
      var tr = oboxGeo([x, 0.7, z], [0.75 * Math.cos(yaw), 0, -0.75 * Math.sin(yaw)], [0, 0.45, 0], [2 * fwd[0], 0, 2 * fwd[1]]);
      part('wlt', t0, tr, { arrive: [0, 1.5, 0], dur: 0.3, quiet: true, noX: true });
      part('wlt', t0 + 0.25, S([[[x, 1.15, z], [x, 9.0, z]]]), { anim: 'grow', anchor: [x, 1.15, z], dur: 0.6, quiet: true, noX: true });
      var hx = x - fwd[0] * 0.3, hz = z - fwd[1] * 0.3;
      part('wlt', t0 + 0.25, boxGeo(hx - 0.9, 8.6, hz - 0.25, hx + 0.9, 9.4, hz + 0.25), { anim: 'rise', arrive: [0, -7.6, 0], dur: 0.6, quiet: true, noX: true });
      WLT.push({ x: hx, z: hz, y: 9.0, aim: [x - fwd[0] * 16, z - fwd[1] * 16], t0: t0 + 0.8 });
    });

    // the convoy: trucks climb the ridge road with their lights on and pull into the dock and the compound
    var BAYS = [[-30, -37], [-18, -37], [-6, -37], [6, -37], [18, -37], [30, -37], [70, -66], [88, -66]];
    BAYS.forEach(function (bay, n) {
      var route = ROAD.slice();
      if (n < 6) route.push([bay[0] + 16, -54], [bay[0] + 5, -50], [bay[0], -44], [bay[0], bay[1]]);
      else route.push([110, -58], [bay[0] + 12, -60], [bay[0], bay[1]]);
      var P = polyPath(route), tk = G0 + 0.7 + n * 0.3, dur = 2.9;
      var rig = new Rig(function (t, X) {
        var u = span(t, [tk, tk + dur]), s = P.L * (1 - Math.pow(1 - u, 2.2));
        onPath(X, P, s, t);
        X.a = fadeWin(t, tk, 1e9);
      });
      kit('truck', rig, tk);
      TRUCKS.push({ rig: rig, t0: tk, t1: tk + dur });
      man([[tk, 0, 0]], { rig: rig, seat: [0.55, 2.0, 6.4], stop: 'drive', t0: tk, t1: tk + dur + 0.2, vest: 1, hat: 1 });
    });
    // dock bays painted at 45 degrees, the compound's containers and cabins, the generator farm, fuel and its fence
    paint(G0 + 1.9, 0.5, BAYS.slice(0, 6).map(function (b) { return [[b[0] - 1.6, y0, b[1] - 8], [b[0] - 1.6, y0, b[1] + 1]]; }).concat([[[-33, y0, -45], [33, y0, -45]]]));
    for (i = 0; i < 9; i++) {
      var cx = 36 + i * 8.2, big = i % 3 === 1;
      part('box', G0 + 2.6 + i * 0.05, detailed([boxGeo(cx - 1.22, 0, -78 - (big ? 12.19 : 6.06), cx + 1.22, 2.59, -78)], [ribs(cx - 1.23, cx + 1.23, 0.1, 2.5, -78 - (big ? 12.19 : 6.06), -78, 0.6)]),
        { arrive: [0, 5, 0], dur: 0.35, quiet: true, noX: true });
      if (i % 2 === 0) part('box', G0 + 2.9 + i * 0.05, detailed([boxGeo(cx - 1.22, 2.59, -84.06, cx + 1.22, 5.18, -78)], [ribs(cx - 1.23, cx + 1.23, 2.7, 5.1, -84.06, -78, 0.6)]),
        { arrive: [0, 5, 0], dur: 0.35, quiet: true, noX: true });
    }
    for (i = 0; i < 8; i++) {
      var bx = 38 + i * 8.5, stack = i < 4;
      part('box', G0 + 2.75 + i * 0.05, detailed([boxGeo(bx - 3, 0, -104, bx + 3, 2.7, -101)], [S([[[bx - 1.5, 0, -100.98], [bx - 1.5, 2.1, -100.98]], [[bx - 0.7, 0, -100.98], [bx - 0.7, 2.1, -100.98]],
        [[bx + 0.6, 1.1, -100.98], [bx + 2.2, 1.1, -100.98]], [[bx + 0.6, 2.0, -100.98], [bx + 2.2, 2.0, -100.98]]])]), { arrive: [0, 5, 0], dur: 0.35, quiet: true, noX: true });
      if (stack) part('box', G0 + 3.0 + i * 0.05, detailed([boxGeo(bx - 3, 2.7, -104, bx + 3, 5.4, -101)], [S([[[bx - 2.6, 5.4, -101], [bx - 2.6, 6.5, -101]], [[bx + 2.6, 5.4, -101], [bx + 2.6, 6.5, -101]], [[bx - 2.6, 6.5, -101], [bx + 2.6, 6.5, -101]]])]),
        { arrive: [0, 5, 0], dur: 0.35, quiet: true, noX: true });
    }
    // two clear-span tents at the back of the compound: portal frames every 5 m
    [[50, -120], [82, -120]].forEach(function (tn, n) {
      var s2 = [], x0 = tn[0] - 7.5, x1 = tn[0] + 7.5;
      for (var q = 0; q <= 4; q++) { var z = tn[1] - 10 + q * 5; s2.push([[x0, 0, z], [x0, 3, z]], [[x0, 3, z], [tn[0], 5.5, z]], [[tn[0], 5.5, z], [x1, 3, z]], [[x1, 3, z], [x1, 0, z]]); }
      s2.push([[x0, 3, tn[1] - 10], [x0, 3, tn[1] + 10]], [[x1, 3, tn[1] - 10], [x1, 3, tn[1] + 10]], [[tn[0], 5.5, tn[1] - 10], [tn[0], 5.5, tn[1] + 10]]);
      part('box', G0 + 3.2 + n * 0.1, S(s2), { anim: 'grow', anchor: [tn[0], 0, tn[1]], dur: 0.45, quiet: true, noX: true });
    });
    // generator farm, upstage left, fenced; fuel tanks beside it
    for (i = 0; i < 6; i++) {
      var gx = -84 + (i % 3) * 14, gz = i < 3 ? -64 : -76;
      var gg = detailed([boxGeo(gx - 6.1, 0, gz - 1.22, gx + 6.1, 2.9, gz + 1.22)], [S([[[gx - 5.2, 2.9, gz], [gx - 5.2, 3.9, gz]], [[gx + 5.2, 2.9, gz], [gx + 5.2, 3.9, gz]],
        [[gx - 6.11, 0.5, gz - 0.9], [gx - 6.11, 2.4, gz - 0.9]], [[gx - 6.11, 0.5, gz + 0.9], [gx - 6.11, 2.4, gz + 0.9]], [[gx + 6.11, 0.5, gz - 0.9], [gx + 6.11, 2.4, gz - 0.9]], [[gx + 6.11, 0.5, gz + 0.9], [gx + 6.11, 2.4, gz + 0.9]]])]);
      part('gen', G0 + 2.8 + i * 0.07, gg, { arrive: [0, 5, 0], dur: 0.35, quiet: true, noX: true });
      GENS.push([gx + 5.2, 4.0, gz]);
    }
    [[-50, -60], [-50, -66]].forEach(function (f, n) { part('gen', G0 + 3.2 + n * 0.06, boxGeo(f[0] - 1.25, 0, f[1] - 0.75, f[0] + 1.25, 1.8, f[1] + 0.75), { arrive: [0, 3, 0], dur: 0.3, quiet: true, noX: true }); });
    (function () {
      var fs = [], x0 = -93, x1 = -45, z0 = -84, z1 = -56, h = 2, q;
      [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]].forEach(function (e) {
        var n = Math.round(Math.hypot(e[2] - e[0], e[3] - e[1]) / 3.5);
        for (q = 0; q <= n; q++) { var x = lerp(e[0], e[2], q / n), z = lerp(e[1], e[3], q / n); fs.push([[x, 0, z], [x, h, z]]); }
        fs.push([[e[0], h, e[1]], [e[2], h, e[3]]], [[e[0], 0.1, e[1]], [e[2], 0.1, e[3]]]);
      });
      part('barrier', G0 + 3.4, S(fs), { anim: 'draw', dur: 0.6, quiet: true, noX: true });
    })();
    // feeder cables from the farm to the stage wings, over ramps where they cross the road
    [[[-54, 0.05, -60], [-54, 0.05, -47], [-30, 0.05, -36], [-27, 0.05, -14]], [[-47, 0.05, -70], [-20, 0.05, -52], [20, 0.05, -52], [40, 0.05, -40], [27, 0.05, -14]]].forEach(function (run, n) {
      var segs = [];
      for (var q = 0; q < run.length - 1; q++) segs = segs.concat(pieces(run[q], run[q + 1], 3));
      part('cable', G0 + 3.5 + n * 0.2, S(segs), { anim: 'draw', dur: 0.8, quiet: true, noX: true });
    });
    [[-45.5, -48], [30, -48]].forEach(function (rp, n) {
      var s3 = [];
      for (var q = 0; q < 7; q++) { var z = rp[1] - 3 + q * 0.9; s3.push([[rp[0] - 0.25, 0.08, z], [rp[0] + 0.25, 0.08, z]], [[rp[0] - 0.25, 0.08, z], [rp[0] - 0.25, 0.08, z + 0.85]], [[rp[0] + 0.25, 0.08, z], [rp[0] + 0.25, 0.08, z + 0.85]]); }
      part('jack', G0 + 3.9 + n * 0.1, S(s3), { anim: 'fade', dur: 0.3, quiet: true, noX: true });
    });

    /* ======== 03  Heavy plant ======== */
    // two crawler cranes on their pads; their jobs: hinge the towers up, then lift the arch's steel
    function topOf(n) { return function (t) { return add(towerTop(n, t), [0, 0.9, 0]); }; }
    craneKit([-62, 0, -30], 0.9, [
      { t: G0 + 2.2, p: [-58, 4, -12] },
      { t: HINGE[1][0] - 0.35, p: [-49.6, 3.4, -4.5] },
      { t: HINGE[1][0], fn: topOf(1) },
      { t: HINGE[1][1] + 0.1 },
      { t: HINGE[2][0] - 0.3, p: [-49.6, 3.4, -14] },
      { t: HINGE[2][0], fn: topOf(2) },
      { t: HINGE[2][1] + 0.1 },
      { t: HINGE[2][1] + 0.6, p: [-50, 14, -24] },
      { t: L0 - 0.5, p: [-66, 2.5, -44], load: 'arch' },
      { t: L0 + 0.15, p: [-68, 16, -18], load: 'arch' },
      { t: L0 + 0.5 },
      { t: L0 + 1.1, p: [-60, 18, -30] },
      { t: 33.0, p: [-56, 16, -26] }
    ], G0 + 2.2, 33.2);
    craneKit([62, 0, -30], -0.9, [
      { t: G0 + 2.3, p: [58, 4, -12] },
      { t: HINGE[3][0] - 0.35, p: [49.6, 3.4, 5] },
      { t: HINGE[3][0], fn: topOf(3) },
      { t: HINGE[3][1] + 0.1 },
      { t: HINGE[4][0] - 0.3, p: [49.6, 3.4, -4.5] },
      { t: HINGE[4][0], fn: topOf(4) },
      { t: HINGE[4][1] + 0.08 },
      { t: HINGE[5][0] - 0.3, p: [49.6, 3.4, -14] },
      { t: HINGE[5][0], fn: topOf(5) },
      { t: HINGE[5][1] + 0.1 },
      { t: HINGE[5][1] + 0.6, p: [50, 14, -24] },
      { t: L0 - 0.4, p: [66, 2.5, -44], load: 'arch' },
      { t: L0 + 0.25, p: [68, 16, -18], load: 'arch' },
      { t: L0 + 0.6 },
      { t: L0 + 1.2, p: [60, 18, -30] },
      { t: 33.0, p: [56, 16, -26] }
    ], G0 + 2.3, 33.2);
    man([[G0 + 2.3, -52, -18], [W0 + 1.0, -52, -18], [W0 + 1.3, -44, -8]], { stop: 'wave', t1: W0 + 3.0, face: [-40, -4], vest: 1, hat: 1 });
    man([[G0 + 2.4, 52, -8], [W0 + 1.0, 52, -8], [W0 + 1.3, 44, -2]], { stop: 'wave', t1: W0 + 3.7, face: [40, 0], vest: 1, hat: 1 });

    // forklifts: deck panels from the dock to the upstage edge of the deck, forks up, and back
    [[-12, 0], [0, 0.35], [12, 0.7]].forEach(function (f, n) {
      var x = f[0], per = 1.25, t0 = D0 + 0.6 + f[1];
      var body = new Rig(function (t, X) {
        var q = ((t - t0) / per) % 1, z;
        if (t < t0) q = 0;
        z = q < 0.4 ? lerp(-36, -18.2, smooth(q / 0.4)) : q < 0.55 ? -18.2 : q < 0.95 ? lerp(-18.2, -36, smooth((q - 0.55) / 0.4)) : -36;
        placeX(X, 0, x, 0, z);
        X.a = fadeWin(t, D0 + 0.3, W0 + 1.0);
      });
      var forks = new Rig(function (t, X) {
        var B = body.at(t), q = ((t - t0) / per) % 1, h = t < t0 ? 0.3 : q < 0.35 ? 0.4 : q < 0.5 ? lerp(0.4, 2.25, smooth((q - 0.35) / 0.15)) : q < 0.62 ? 2.25 : lerp(2.25, 0.4, smooth(clamp((q - 0.62) / 0.2, 0, 1)));
        placeX(X, 0, B.tx, h, B.tz); X.a = B.a;
      });
      var load = new Rig(function (t, X) {
        var F = forks.at(t), q = ((t - t0) / per) % 1;
        placeX(X, 0, F.tx, F.ty, F.tz); X.a = F.a * (t < t0 || q < 0.55 || q > 0.97 ? 1 : 0);
      });
      kit('forklift', body, D0 + 0.3);
      part('plant', D0 + 0.3, S([[[-0.4, 0, 1.9], [-0.4, 0, 3.1]], [[0.4, 0, 1.9], [0.4, 0, 3.1]], [[-0.55, 0, 1.85], [0.55, 0, 1.85]], [[-0.55, 0, 1.85], [-0.55, 1.0, 1.85]], [[0.55, 0, 1.85], [0.55, 1.0, 1.85]]]),
        { veh: forks, anim: 'fade', dur: 0.25, quiet: true, noX: true });
      part('deckp', D0 + 0.3, boxGeo(-1.1, 0.05, 1.95, 1.1, 0.75, 3.0), { veh: load, anim: 'fade', dur: 0.25, quiet: true, noX: true });
      man([[D0, 0, 0]], { rig: body, seat: [0, 1.5, -0.6], stop: 'drive', t0: D0 + 0.3, t1: W0 + 1.0, vest: 1, hat: 1 });
    });
    // telehandlers: one feeds T1's sections as it is stacked; one lifts scaffold bundles onto the deck
    // (a rotating telehandler: its boom telescopes in two stages so the forks meet the top of the tower)
    var TH1 = new Rig(function (t, X) { placeX(X, Math.atan2(11, -10), -36, 0, 15); X.a = fadeWin(t, W0 - 0.3, W0 + 2.6); });
    function th1Reach(t) { var top = 0.25 + clamp((t - (W0 + 0.35)) / 0.22 + 1, 1, 8) * 3.2 + 1.0, D = 16.8; return { el: Math.atan2(top - 2.0, D), L: Math.hypot(top - 2.0, D) }; }
    function th1Stage(f) {
      return new Rig(function (t, X) {
        var Rr = th1Reach(t), B = TH1.at(t), ext = Math.max(0, Rr.L - 12.8) * f;
        hingeX(X, 0, 2.0, -2.2, -1, 0, Rr.el);
        X.cy = B.cy; X.sy = B.sy; X.a = B.a;
        X.tx = B.tx + B.sy * Math.cos(Rr.el) * ext; X.ty = B.ty + Math.sin(Rr.el) * ext; X.tz = B.tz + B.cy * Math.cos(Rr.el) * ext;
      });
    }
    kit('tele', TH1, W0 - 0.3);
    part('boom', W0 - 0.3, boxGeo(-0.3, 1.72, -2.2, 0.3, 2.34, 10.6), { veh: th1Stage(0), anim: 'fade', dur: 0.25, quiet: true, noX: true });
    part('boom', W0 - 0.3, boxGeo(-0.24, 1.78, -1.0, 0.24, 2.28, 10.6), { veh: th1Stage(0.5), anim: 'fade', dur: 0.25, quiet: true, noX: true });
    part('boom', W0 - 0.3, detailed([boxGeo(-0.18, 1.84, -0.5, 0.18, 2.22, 10.6)], [S([[[-0.6, 1.3, 10.6], [0.6, 1.3, 10.6]], [[-0.6, 1.3, 10.6], [-0.6, 2.5, 10.6]], [[0.6, 1.3, 10.6], [0.6, 2.5, 10.6]],
      [[-0.4, 1.3, 10.6], [-0.4, 1.3, 11.8]], [[0.4, 1.3, 10.6], [0.4, 1.3, 11.8]]])]), { veh: th1Stage(1), anim: 'fade', dur: 0.25, quiet: true, noX: true });
    man([[W0, 0, 0]], { rig: TH1, seat: [0.7, 1.6, 0.3], stop: 'drive', t0: W0 - 0.3, t1: W0 + 2.6, vest: 1, hat: 1 });
    var TH2 = new Rig(function (t, X) {
      var q = ((t - D0 - 0.2) / 1.5) % 1, x;
      if (t < D0 + 0.2) q = 0;
      x = q < 0.45 ? lerp(46, 31, smooth(q / 0.45)) : q < 0.55 ? 31 : lerp(31, 46, smooth(clamp((q - 0.55) / 0.4, 0, 1)));
      placeX(X, -Math.PI / 2, x, 0, -8);
      X.a = fadeWin(t, D0 - 0.1, W0 + 0.8);
    });
    var th2boom = new Rig(function (t, X) {
      var q = ((t - D0 - 0.2) / 1.5) % 1, el = t < D0 + 0.2 ? 0.1 : q < 0.3 ? 0.1 : q < 0.5 ? lerp(0.1, 0.26, smooth((q - 0.3) / 0.2)) : lerp(0.26, 0.1, smooth(clamp((q - 0.5) / 0.2, 0, 1)));
      hingeX(X, 0, 2.0, -2.2, -1, 0, el); var B = TH2.at(t); X.cy = B.cy; X.sy = B.sy; X.tx = B.tx; X.ty = B.ty; X.tz = B.tz; X.a = B.a;
    });
    kit('tele', TH2, D0 - 0.1);
    part('boom', D0 - 0.1, detailed([boxGeo(-0.28, 1.75, -2.2, 0.28, 2.3, 9.8)], [S([[[-0.6, 1.4, 9.8], [0.6, 1.4, 9.8]], [[-0.6, 1.4, 9.8], [-0.6, 2.4, 9.8]], [[0.6, 1.4, 9.8], [0.6, 2.4, 9.8]]])]),
      { veh: th2boom, anim: 'fade', dur: 0.25, quiet: true, noX: true });
    man([[D0, 0, 0]], { rig: TH2, seat: [0.7, 1.6, 0.3], stop: 'drive', t0: D0 - 0.1, t1: W0 + 0.8, vest: 1, hat: 1 });

    /* ======== 04  The deck on system scaffolding ======== */
    var XS2 = [], ZS2 = [], nStd = 0;
    for (i = 0; i <= 20; i++) XS2.push(-22 + i * 2.2);
    for (j = 0; j <= 9; j++) ZS2.push(-14 + j * 2);
    ZS2.forEach(function (z, jr) {
      var tj = D0 + 0.05 + jr * 0.16, spindles = [], plates = [], std = [], led = [], det = [];
      XS2.forEach(function (x) {
        spindles.push([[x, 0.03, z], [x, 0.42, z]]);
        plates.push([[x - 0.15, 0.02, z - 0.15], [x + 0.15, 0.02, z - 0.15]], [[x + 0.15, 0.02, z - 0.15], [x + 0.15, 0.02, z + 0.15]], [[x + 0.15, 0.02, z + 0.15], [x - 0.15, 0.02, z + 0.15]],
          [[x - 0.15, 0.02, z + 0.15], [x - 0.15, 0.02, z - 0.15]], [[x - 0.07, 0.3, z], [x + 0.07, 0.3, z]], [[x, 0.3, z - 0.07], [x, 0.3, z + 0.07]]);
        std.push([[x, 0.42, z], [x, 2.02, z]]);
        nStd++;
      });
      part('jack', tj, detailed([S(spindles)], [S(plates)]), { arrive: [0, 0.8, 0], dur: 0.3 });
      for (i = 0; i < 20; i++) led.push([[XS2[i], 0.55, z], [XS2[i + 1], 0.55, z]], [[XS2[i], 1.95, z], [XS2[i + 1], 1.95, z]]);
      if (jr < 9) XS2.forEach(function (x, xi) {
        det.push([[x, 0.55, z], [x, 0.55, z + 2]], [[x, 1.95, z], [x, 1.95, z + 2]]);
        if (xi % 5 === 0) det.push([[x, 0.55, z], [x, 1.95, z + 2]]);
      });
      for (i = jr % 4; i < 20; i += 4) det.push([[XS2[i], 0.55, z], [XS2[i + 1], 1.95, z]]);
      part('sub', tj + 0.3, detailed([S(std.concat(led))], [S(det)]), { anim: 'grow', anchor: [0, 0.42, z], dur: 0.4 });
    });
    // deck panels: dropped in row by row from upstage, filling like tiles on a floor
    for (j = 0; j < 9; j++) for (i = 0; i < 20; i += 2) {
      var x0 = XS2[i], z0 = ZS2[j], yd = DECK.h;
      var fp = [], es = [];
      [0, 1].forEach(function (h2) {
        var xa = x0 + h2 * 2.2 + 0.02, xb = xa + 2.16;
        fp.push({ p: [[xa, yd, z0 + 0.02], [xb, yd, z0 + 0.02], [xb, yd, z0 + 1.98], [xa, yd, z0 + 1.98]], n: [0, 1, 0] });
        es.push([[xa, yd, z0 + 0.02], [xb, yd, z0 + 0.02]], [[xb, yd, z0 + 0.02], [xb, yd, z0 + 1.98]], [[xb, yd, z0 + 1.98], [xa, yd, z0 + 1.98]], [[xa, yd, z0 + 1.98], [xa, yd, z0 + 0.02]]);
      });
      part('deckp', D0 + 1.45 + j * 0.18 + Math.abs(i - 9) * 0.012, { segs: es, faces: fp }, { arrive: [0, 1.4, 0], dur: 0.3 });
    }
    // the thrust and the round B-stage, the front skirt, the upstage handrail, two stair towers
    for (j = 0; j < 7; j++) part('deck', D0 + 2.7 + j * 0.06, boxGeo(-2.5, 0, 4 + j * 2 + 0.03, 2.5, DECK.h, 4 + j * 2 + 1.97), { arrive: [0, 0, -3], dur: 0.35 });
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
      part('deck', D0 + 3.1, { segs: segs, faces: faces }, { anim: 'pop', dur: 0.4 });
    })();
    part('deckp', D0 + 3.15, { segs: [[[-22, 0, 4], [22, 0, 4]], [[-22, DECK.h, 4], [22, DECK.h, 4]]], faces: [{ p: [[-22, 0, 4.01], [22, 0, 4.01], [22, DECK.h, 4.01], [-22, DECK.h, 4.01]], n: [0, 0, 1] },
      { p: [[-22, 0, -14], [-22, 0, 4], [-22, DECK.h, 4], [-22, DECK.h, -14]], n: [-1, 0, 0] }, { p: [[22, 0, 4], [22, 0, -14], [22, DECK.h, -14], [22, DECK.h, 4]], n: [1, 0, 0] }] }, { anim: 'fade', dur: 0.4 });
    (function () {
      var s4 = [];
      XS2.forEach(function (x) { s4.push([[x, DECK.h, -14], [x, DECK.h + 1.1, -14]]); });
      s4.push([[-22, DECK.h + 1.1, -14], [22, DECK.h + 1.1, -14]], [[-22, DECK.h + 0.5, -14], [22, DECK.h + 0.5, -14]]);
      [-1, 1].forEach(function (s) {
        var x = s * 23.2;
        for (var q = 0; q < 8; q++) s4.push([[x - 0.55, q * 0.27, -12.9 + q * 0.3], [x + 0.55, q * 0.27, -12.9 + q * 0.3]]);
        s4.push([[x - 0.55, 0, -12.9], [x - 0.55, DECK.h, -10.8]], [[x + 0.55, 0, -12.9], [x + 0.55, DECK.h, -10.8]]);
      });
      part('sub', D0 + 3.2, S(s4), { anim: 'draw', dur: 0.4 });
    })();
    // secondary structures: two VIP decks on scaffold, either side of the field
    [-1, 1].forEach(function (s, si) {
      var xa = s * 66, xb = s * 88, t0 = D0 + 2.2 + si * 0.2;
      for (lv = 0; lv < 3; lv++) part('scaff', t0 + lv * 0.15, scaffoldGeo(Math.min(xa, xb), Math.max(xa, xb), 16, 34, lv * 1.4, (lv + 1) * 1.4, 8, 6, lv === 0), { anim: 'grow', anchor: [s * 77, lv * 1.4, 25], dur: 0.3, noX: true });
      for (lv = 0; lv < 3; lv++) {
        var xt0 = s > 0 ? 66 + lv * 7.3 : -66 - lv * 7.3, xt1 = s > 0 ? xt0 + 7.3 : xt0 - 7.3;
        part('tier', t0 + 0.5 + lv * 0.1, boxGeo(Math.min(xt0, xt1), (lv + 1) * 1.4 - 0.2, 16, Math.max(xt0, xt1), (lv + 1) * 1.4, 34), { arrive: [0, 2, 0], dur: 0.35, noX: true });
      }
    });

    /* ======== 05  Ground support: towers, sleeve blocks, the roof grid at deck level ======== */
    TOWERS.forEach(function (tw, n) {
      var s = tw[0] < 0 ? -1 : 1;
      part('plate', W0 + n * 0.06, detailed([boxGeo(tw[0] - 1.3, 0, tw[1] - 1.3, tw[0] + 1.3, 0.25, tw[1] + 1.3)],
        [S([[[tw[0] - 1.3, 0.12, tw[1] - 1.3], [tw[0] - 2.4, 0.12, tw[1] - 2.4]], [[tw[0] + 1.3, 0.12, tw[1] - 1.3], [tw[0] + 2.4, 0.12, tw[1] - 2.4]],
          [[tw[0] + 1.3, 0.12, tw[1] + 1.3], [tw[0] + 2.4, 0.12, tw[1] + 2.4]], [[tw[0] - 1.3, 0.12, tw[1] + 1.3], [tw[0] - 2.4, 0.12, tw[1] + 2.4]]])]), { arrive: [0, 3, 0] });
      [-1, 1].forEach(function (e, en) {
        var bx = tw[0] + s * 2.6, bz = tw[1] + e * 2.0;
        part('ballast', W0 + 0.2 + n * 0.06 + en * 0.05, boxGeo(bx - 0.75, 0, bz - 0.38, bx + 0.75, 0.75, bz + 0.38), { arrive: [0, 3, 0], dur: 0.35 });
      });
      var rig = n === 0 ? null : new Rig(function (t, X) { hingeX(X, tw[0], 0.25, tw[1], 0, 1, -s * (Math.PI / 2) * (1 - hingeK(n, t))); });
      for (lv = 0; lv < 8; lv++) {
        var ya = 0.25 + lv * 3.2, yb = ya + 3.2;
        if (n === 0) part('spine', W0 + 0.35 + lv * 0.22, trussGeo([tw[0], ya, tw[1]], [tw[0], yb, tw[1]], 0.76, 0.8), { anim: 'grow', anchor: [tw[0], ya, tw[1]], dur: 0.3 });
        else part('tower', W0 + 0.15 + (n - 1) * 0.1 + lv * 0.045, trussGeo([tw[0], ya, tw[1]], [tw[0], yb, tw[1]], 0.76, 0.8), { anim: 'pop', dur: 0.22, veh: rig });
      }
      var up = n === 0 ? W0 + 2.1 : HINGE[n][1] + 0.05;
      // the sleeve block, which rides up the tower with the roof, and the head block with its hoist and chain bag
      part('clamp', up, boxGeo(tw[0] - 0.62, 23.2, tw[1] - 0.62, tw[0] + 0.62, 24.3, tw[1] + 0.62), { anim: 'pop', lift: true, dur: 0.35 });
      // (the head block is fitted before a tower is hinged up, so it rises with it)
      part('hoist', n ? W0 + 0.15 + (n - 1) * 0.1 + 8 * 0.045 : W0 + 0.35 + 8 * 0.22, detailed([boxGeo(tw[0] - 0.32, 25.85, tw[1] - 0.32, tw[0] + 0.32, 26.55, tw[1] + 0.32)],
        [boxGeo(tw[0] + s * 0.45, 24.9, tw[1] - 0.18, tw[0] + s * 0.8, 25.8, tw[1] + 0.18)]), { anim: 'pop', dur: 0.35, veh: rig });
    });
    // the roof: three arches, a front lip, cantilevers and purlins, pinned together at deck level, then lifted
    var XS = [];
    for (i = 0; i <= 12; i++) XS.push(-TOWER_X + i * 4);
    TOWER_Z.forEach(function (z, a) {
      for (i = 0; i < 12; i++) {
        part('roof', W0 + 1.5 + a * 0.24 + i * 0.04, trussGeo([XS[i], archY(XS[i]), z], [XS[i + 1], archY(XS[i + 1]), z], 0.9, 0.95),
          { lift: true, anim: 'pop', dur: 0.3 });
      }
    });
    for (i = 0; i < 12; i++) {
      part('roof', W0 + 2.25 + i * 0.04, trussGeo([XS[i], lipY(XS[i]), LIP_Z], [XS[i + 1], lipY(XS[i + 1]), LIP_Z], 0.8, 0.95), { lift: true, anim: 'pop', dur: 0.3 });
    }
    for (i = 0; i <= 12; i += 2) {
      var xr = XS[i], yr = archY(xr);
      part('roof', W0 + 2.6 + i * 0.03, trussGeo([xr, yr, 5], [xr, lipY(xr), LIP_Z], 0.6, 0.9), { lift: true, anim: 'pop', dur: 0.3 });
      part('roof', W0 + 2.7 + i * 0.03, trussGeo([xr, yr, 5], [xr, yr, -4.5], 0.6, 0.95), { lift: true, anim: 'pop', dur: 0.3 });
      part('roof', W0 + 2.8 + i * 0.03, trussGeo([xr, yr, -4.5], [xr, yr, -14], 0.6, 0.95), { lift: true, anim: 'pop', dur: 0.3 });
    }

    /* ======== 06  Hoists, pre-rig, the lift ======== */
    for (i = 0; i < 12; i++) {
      var xa = XS[i], xb = XS[i + 1];
      [[5, -4.5], [-4.5, -14]].forEach(function (zz, n) {
        part('skin', R0 + 0.7 + n * 0.1 + i * 0.02, { faces: [{ p: [[xa, archY(xa), zz[0]], [xb, archY(xb), zz[0]], [xb, archY(xb), zz[1]], [xa, archY(xa), zz[1]]], n: [0, -1, 0], two: true }] },
          { lift: true, anim: 'fade', dur: 0.5 });
      });
      part('skin', R0 + 0.9 + i * 0.02, { faces: [{ p: [[xa, lipY(xa), LIP_Z], [xb, lipY(xb), LIP_Z], [xb, archY(xb), 5], [xa, archY(xa), 5]], n: [0, -1, 0], two: true }] },
        { lift: true, anim: 'fade', dur: 0.5 });
    }
    [3, -2, -7].forEach(function (z, n) {
      for (i = 0; i < 5; i++) {
        part('roof', R0 + n * 0.1 + i * 0.04, trussGeo([-20 + i * 8, 21.2, z], [-12 + i * 8, 21.2, z], 0.52, 0.6), { lift: true, arrive: [0, 2.5, 0], dur: 0.35 });
      }
      for (i = 0; i < 12; i++) {
        var fx = -19.25 + i * 3.5, yb2 = 20.15;
        var fgeo = boxGeo(fx - 0.24, yb2, z - 0.24, fx + 0.24, yb2 + 0.5, z + 0.24);
        fgeo.segs.push([[fx - 0.3, 20.95, z], [fx - 0.3, yb2 + 0.25, z]], [[fx + 0.3, 20.95, z], [fx + 0.3, yb2 + 0.25, z]], [[fx - 0.3, 20.95, z], [fx + 0.3, 20.95, z]]);
        var pl = part('fixture', R0 + 0.3 + n * 0.08 + i * 0.015, fgeo, { lift: true, anim: 'pop', dur: 0.25 });
        lights.push({ o: [fx, yb2, z], n: lights.length, grp: n, p: pl });
      }
    });
    for (i = 0; i < 16; i++) {
      var lx = -21 + i * 2.8, ly = lipY(lx) - 1.3;
      var pl2 = part('fixture', R0 + 0.45 + i * 0.012, boxGeo(lx - 0.26, ly, LIP_Z - 0.26, lx + 0.26, ly + 0.55, LIP_Z + 0.26), { lift: true, anim: 'pop', dur: 0.25 });
      lights.push({ o: [lx, ly, LIP_Z], n: lights.length, grp: 3, p: pl2 });
    }
    // the motor controller in the wings, its cables up every tower to the hoists
    part('hoist', R0 + 0.1, detailed([boxGeo(-21.4, DECK.h, -13.4, -20.2, DECK.h + 0.9, -12.6)], [S([[[-21.3, DECK.h + 0.6, -12.58], [-20.3, DECK.h + 0.6, -12.58]], [[-21.3, DECK.h + 0.4, -12.58], [-20.3, DECK.h + 0.4, -12.58]]])]), { anim: 'pop', dur: 0.3 });
    TOWERS.forEach(function (tw, n) {
      var s = tw[0] < 0 ? -1 : 1, c0 = [-20.8, DECK.h + 0.3, -12.6], foot = [tw[0] - s * 0.5, 0.3, tw[1] + 0.5];
      var run = [c0, [-20.8, DECK.h, tw[1] < -12 ? tw[1] + 1.5 : -12], [tw[0] - s * 1.6, DECK.h, tw[1] + 0.8], foot, [tw[0] - s * 0.42, 25.6, tw[1] + 0.42]];
      var segs = [];
      for (var q = 0; q < run.length - 1; q++) segs = segs.concat(pieces(run[q], run[q + 1], 2.5));
      part('cable', Math.max(R0 + 0.2 + n * 0.05, (HINGE[n] ? HINGE[n][1] : 0) + 0.1), S(segs), { anim: 'draw', dur: 0.5, quiet: true });
    });

    /* ======== 07  Video: the halo module, LED columns growing down from rising bars ======== */
    part('spine', V0, trussGeo([0, DECK.h, -13.3], [0, 20.0, -13.3], 0.76, 0.8), { anim: 'grow', anchor: [0, DECK.h, -13.3], dur: 0.35, xl: 4 });
    part('bracket', V0 + 0.35, boxGeo(-1.1, 19.9, -14.0, 1.1, 20.7, -12.6), { arrive: [0, 2.5, 0], dur: 0.3 });
    part('rig', V0 + 0.05, trussGeo([-19, 19.9, LED.z], [19, 19.9, LED.z], 0.52, 0.6), { arrive: [0, 4, 0], dur: 0.4, mod: true });
    part('rig', V0 + 0.2, { segs: [-16, -8, 0, 8, 16].map(function (x) { return [[x, 20.1, LED.z], [x, archY(x), -14]]; }) }, { anim: 'fade', dur: 0.4, mod: true });
    [-16, -8, 8, 16].forEach(function (x, n) { part('hoist', V0 + 0.25 + n * 0.04, boxGeo(x - 0.22, 20.25, LED.z - 0.2, x + 0.22, 20.85, LED.z + 0.2), { anim: 'pop', dur: 0.25, mod: true }); });
    for (i = 0; i < 32; i++) {
      var a0 = -Math.PI / 2 + i / 32 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 32;
      part('halo', V0 + 0.45 + i * 0.03, ringGeo(HALO.c, HALO.r0, HALO.r1, a0, a1, HALO.d, 2, { grp: 'halo', a: i / 32 }), { anim: 'pop', dur: 0.28 });
    }
    [-3.2, 3.2].forEach(function (dy, n) {
      part('clamp', V0 + 1.35 + n * 0.08, oboxGeo([0, HALO.c[1] + dy, -12.85], [6.3, 0, 0], [0, 0.16, 0], [0, 0, 0.16]), { arrive: [0, 0, -2], dur: 0.3, xl: 4 });
    });
    for (i = 0; i < 24; i++) {
      var b0 = -Math.PI / 2 - i / 24 * Math.PI * 2, b1 = b0 - Math.PI * 2 / 24;
      part('ring2', V0 + 1.35 + i * 0.03, ringGeo([0, HALO.c[1], -11.9], 4.4, 5.0, b1, b0, 1.0, 2, { grp: 'ring2', a: i / 24 }), { anim: 'pop', dur: 0.28 });
    }
    [[0.35, 1.6, 8], [1.6, 2.95, 14], [2.95, 4.3, 20]].forEach(function (ring, ri) {
      for (var s = 0; s < ring[2]; s++) {
        var c0 = s / ring[2] * Math.PI * 2 + ri * 0.2, c1 = c0 + Math.PI * 2 / ring[2], rm = (ring[0] + ring[1]) / 2, am = (c0 + c1) / 2;
        part('disc', V0 + 1.75 + ri * 0.16 + s * 0.01, sectorGeo(HALO.c, ring[0] + 0.03, ring[1] - 0.03, c0 + 0.01, c1 - 0.01, -12.45,
          { grp: 'disc', x: HALO.c[0] + rm * Math.cos(am), y: HALO.c[1] + rm * Math.sin(am), r: rm, a: (s + 0.5) / ring[2] }), { anim: 'pop', dur: 0.3 });
      }
    });
    for (i = 0; i < 8; i++) {
      var ca = i / 8 * Math.PI * 2 + Math.PI / 8, cxp = HALO.c[0] + 7.55 * Math.cos(ca), cyp = HALO.c[1] + 7.55 * Math.sin(ca);
      part('clamp', V0 + 1.55 + i * 0.04, oboxGeo([cxp, cyp, -12.2], [0.35 * Math.cos(ca), 0.35 * Math.sin(ca), 0], [-0.22 * Math.sin(ca), 0.22 * Math.cos(ca), 0], [0, 0, 0.35]), { anim: 'pop', dur: 0.3, xl: 4 });
    }
    // Each column: the hang bar is hooked on at deck level, a tile is latched under it, the bar rises one tile,
    // the next tile is latched underneath... so the column grows downward from a rising bar.
    var tw2 = (LED.x1 - LED.x0) / LED.cols, th = (LED.y1 - LED.y0) / LED.rows, nTiles = 0, STEP = 0.045;
    function colRise(tc) { return function (t) { return -Math.max(0, LED.rows - 1 - (t - tc) / STEP) * th; }; }
    for (i = 0; i < LED.cols; i++) {
      var tc = V0 + 0.3 + i * 0.075, rise = colRise(tc), cxl = LED.x0 + (i + 0.5) * tw2, gap = false;
      for (j = 0; j < LED.rows; j++) if (Math.hypot(cxl - HALO.c[0], LED.y0 + (j + 0.5) * th - HALO.c[1]) < HALO.r1 + 0.6) gap = true;
      // (a column interrupted by the halo is hung in two pieces instead: its tiles drop onto their own bars)
      part('rig', tc - 0.05, S(boxGeo(cxl - tw2 / 2 + 0.05, LED.y1 + 0.02, LED.z - 0.08, cxl + tw2 / 2 - 0.05, LED.y1 + 0.22, LED.z + 0.08).segs),
        gap ? { arrive: [0, 1.5, 0], dur: 0.25, mod: true } : { anim: 'fade', dur: 0.1, dyf: rise, mod: true });
      for (j = LED.rows - 1; j >= 0; j--) {
        var cy = LED.y0 + (j + 0.5) * th, d = Math.hypot(cxl - HALO.c[0], cy - HALO.c[1]);
        if (d < HALO.r1 + 0.6) continue;
        var x0l = LED.x0 + i * tw2 + 0.05, x1l = x0l + tw2 - 0.1, y0l = LED.y0 + j * th + 0.05, y1l = y0l + th - 0.1;
        part('led', tc + (LED.rows - 1 - j) * STEP, panelGeo([[x0l, y0l, LED.z], [x1l, y0l, LED.z], [x1l, y1l, LED.z], [x0l, y1l, LED.z]], [0, 0, 1], { grp: 'led', x: cxl, y: cy }),
          gap ? { arrive: [0, 1.4, 0], dur: 0.3 } : { anim: 'fade', dur: 0.12, dyf: rise });
        nTiles++;
      }
    }

    // ---- Wings: scaffold towers on each side, then blades of LED radiating out, segment by segment.
    [-1, 1].forEach(function (s, si) {
      var xa = s * 26, xb = s * 36;
      for (lv = 0; lv < 4; lv++) {
        var ya = lv * 2.55, yb = ya + 2.55;
        part('scaff', V0 + 2.05 + lv * 0.15 + si * 0.05, scaffoldGeo(Math.min(xa, xb), Math.max(xa, xb), -14, -6, ya, yb, 4, 3, true),
          { anim: 'grow', anchor: [s * 31, ya, -10], dur: 0.3 });
      }
      [5.1, 10.2].forEach(function (ty, n) {
        part('tier', V0 + 2.45 + n * 0.15 + si * 0.05, boxGeo(Math.min(xa, xb), ty - 0.25, -14, Math.max(xa, xb), ty, -6), { arrive: [0, 2, 0], dur: 0.35 });
      });
      WING.ang.forEach(function (deg, fi) {
        var th2 = deg * DEG, dir = [s * Math.cos(th2), Math.sin(th2), 0], perp = [-s * Math.sin(th2), Math.cos(th2), 0];
        var L = WING.len[fi], pv = [s * WING.x, WING.y, WING.z];
        for (var sg = 0; sg < 5; sg++) {
          var mid = 1.2 + (sg + 0.5) * L / 5, mc = add(pv, mul(dir, mid));
          var geo = oboxGeo(mc, mul(dir, L / 10 - 0.08), mul(perp, 1.15 - sg * 0.12), [0, 0, 0.32]);
          geo.faces[5].screen = { grp: 'wing', fin: fi, seg: sg, side: s, x: mc[0], y: mc[1] };
          part('wing', V0 + 2.55 + fi * 0.1 + sg * 0.09 + si * 0.04, geo, { arrive: mul(dir, -3), dur: 0.35 });
        }
        if (fi === 1 || fi === 3) flames.push({ p: add(pv, mul(dir, 1.2 + L + 0.4)), n: flames.length, tip: true });
      });
    });

    // ---- IMAG: two screens on their own towers, either side of the roof.
    [-1, 1].forEach(function (s, si) {
      [s * 25.2, s * 40.2].forEach(function (x, n) {
        for (lv = 0; lv < 4; lv++) {
          part('tower', V0 + 2.3 + lv * 0.1 + n * 0.06 + si * 0.04, trussGeo([x, 0.2 + lv * 3.4, IMAG.z - 0.5], [x, 0.2 + (lv + 1) * 3.4, IMAG.z - 0.5], 0.52, 0.6),
            { anim: 'grow', anchor: [x, 0.2 + lv * 3.4, IMAG.z - 0.5], dur: 0.2 });
        }
      });
      part('rig', V0 + 2.75 + si * 0.04, trussGeo([s * 25.2, 13.8, IMAG.z - 0.5], [s * 40.2, 13.8, IMAG.z - 0.5], 0.52, 0.6), { arrive: [0, 3, 0], dur: 0.35 });
      var cols = 8, rows = 5, x0 = s * IMAG.x - IMAG.w / 2, cw = IMAG.w / cols, rh = (IMAG.y1 - IMAG.y0) / rows;
      for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) {
        var qx = x0 + cc * cw, qy = IMAG.y0 + r * rh;
        var q = [[qx + 0.03, qy + 0.03, IMAG.z], [qx + cw - 0.03, qy + 0.03, IMAG.z], [qx + cw - 0.03, qy + rh - 0.03, IMAG.z], [qx + 0.03, qy + rh - 0.03, IMAG.z]];
        part('imag', V0 + 2.85 + (rows - 1 - r) * 0.08 + cc * 0.022 + si * 0.05, panelGeo(q, [0, 0, 1], { grp: 'imag', u: (cc + 0.5) / cols, v: (r + 0.5) / rows, side: s }),
          { arrive: [0, 1.2, 0], dur: 0.28 });
      }
      imags.push({ s: s, x0: x0, x1: x0 + IMAG.w, y0: IMAG.y0, y1: IMAG.y1, z: IMAG.z + 0.02 });
    });

    /* ======== 09  (with the audio) the arch, the band, the ribbon ======== */
    var phi0 = Math.acos(-ARCH.c[1] / ARCH.r);
    [-1, 1].forEach(function (s) {
      for (var q = 0; q < ARCH.n; q++) {
        var p0 = s * phi0 * (1 - q / ARCH.n), p1 = s * phi0 * (1 - (q + 1) / ARCH.n);
        var A = [ARCH.r * Math.sin(p0), ARCH.c[1] + ARCH.r * Math.cos(p0), ARCH.c[2]];
        var B = [ARCH.r * Math.sin(p1), ARCH.c[1] + ARCH.r * Math.cos(p1), ARCH.c[2]];
        part('arch', L0 + 0.1 + q * 0.05, trussGeo(A, B, 1.3, 1.3), { anim: 'pop', dur: 0.3 });
      }
      part('plate', L0 + 0.05, boxGeo(s * ARCH.r * Math.sin(phi0) - 1.6, 0, ARCH.c[2] - 1.6, s * ARCH.r * Math.sin(phi0) + 1.6, 0.3, ARCH.c[2] + 1.6), { arrive: [0, 3, 0], dur: 0.3 });
    });
    for (i = 0; i <= 64; i++) { var ph = -phi0 + i / 64 * 2 * phi0; archLine.push([ARCH.r * Math.sin(ph), ARCH.c[1] + ARCH.r * Math.cos(ph) - 0.65, ARCH.c[2] + 0.66]); }
    function bandAt(x) { return x <= 50 ? [x, 8.0] : [50 + (x - 50) * Math.cos(18 * DEG), 8.0 + (x - 50) * Math.sin(18 * DEG)]; }
    [-1, 1].forEach(function (s, si) {
      for (var ci = 0; ci < 18; ci++) {
        var xa = 25.6 + ci * 2.05, xb = xa + 1.95, pa = bandAt(xa), pb = bandAt(xb);
        for (var row = 0; row < 2; row++) {
          var ya = 0.9 + row * 2.05, yb = ya + 1.95;
          var qb = [[s * pa[0], ya, pa[1]], [s * pb[0], ya, pb[1]], [s * pb[0], yb, pb[1]], [s * pa[0], yb, pa[1]]];
          part('band', L0 + 0.3 + ci * 0.03 + (1 - row) * 0.05 + si * 0.02, panelGeo(qb, [0, 0, 1], { grp: 'band', x: s * (xa + xb) / 2, y: (ya + yb) / 2 }),
            { arrive: [0, 1.5, 0], dur: 0.3 });
        }
      }
    });
    for (i = 0; i < 16; i++) {
      var ra = -15 + i * 1.875, rb = ra + 1.875;
      var za = 4.0 + 4.0 * (1 - (ra / 15) * (ra / 15)), zb = 4.0 + 4.0 * (1 - (rb / 15) * (rb / 15));
      part('ribbon', L0 + 0.7 + (7.5 - Math.abs(i + 0.5 - 8)) * 0.025, panelGeo([[ra, 17.4, za], [rb, 17.4, zb], [rb, 18.6, zb], [ra, 18.6, za]], [0, 0, 1],
        { grp: 'ribbon', x: (ra + rb) / 2, y: 18 }), { arrive: [0, 2, 0], dur: 0.3 });
    }
    part('rig', L0 + 0.75, { segs: [-12, -4, 4, 12].map(function (x) { var z = 4 + 4 * (1 - (x / 15) * (x / 15)); return [[x, 18.6, z], [x, lipY(x) - 0.4, LIP_Z]]; }) }, { anim: 'fade', dur: 0.35 });

    /* ======== 08  Audio: the arrays arrive on carts, are pinned under their fly frames and fan open as they fly ======== */
    var splay = [0, 0.5, 0.5, 1, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6];
    [-1, 1].forEach(function (s, si) {
      var x = s * 21, tA = A0 + 0.15 + si * 0.06, BOX = 0.42, hang = { t: NaN, c: [], a: [] };
      for (k = 0; k < 16; k++) { hang.c.push([0, 0, 0]); hang.a.push(0); }
      function hangAt(t) {   // where every box is: stacked straight while it is pinned, fanning open into its J as it lifts
        if (hang.t === t) return hang;
        hang.t = t;
        var n = clamp((t - tA) / 0.045 + 1, 0, 16), e = inOut(span(t, [tA + 0.8, tA + 1.45]));
        var top = lerp(0.55 + n * BOX, 23.3, e), hinge = [x, top, 7.2], ang = 0;
        for (var q = 0; q < 16; q++) {
          ang += splay[q] * DEG * e;
          var v = [0, Math.cos(ang), Math.sin(ang)];
          hang.c[q] = sub(hinge, mul(v, BOX / 2)); hang.a[q] = ang;
          hinge = sub(hinge, mul(v, BOX));
        }
        hang.top = top;
        return hang;
      }
      part('clamp', tA - 0.1, boxGeo(x - 0.8, 23.3, 6.8, x + 0.8, 23.6, 7.6), { arrive: [0, 0.6, 0], dur: 0.25, dyf: function (t) { return hangAt(t).top - 23.3; } });
      part('rig', tA + 0.8, { segs: [[[x - 0.6, 23.6, 7.2], [x - 0.6, lipY(x), LIP_Z]], [[x + 0.6, 23.6, 7.2], [x + 0.6, lipY(x), LIP_Z]]] }, { anim: 'fade', dur: 0.5 });
      // four carts of four boxes, pinned at 0 degrees, waiting in front of the hang; each stack goes as it is pinned
      for (k = 0; k < 4; k++) {
        var cxk = x + s * (k - 1.5) * 1.7, zc = 10.2;
        part('cart', tA - 0.3 + k * 0.03, S(polySegs([[cxk - 0.75, 0.22, zc - 0.45], [cxk + 0.75, 0.22, zc - 0.45], [cxk + 0.75, 0.22, zc + 0.45], [cxk - 0.75, 0.22, zc + 0.45]], true)
          .concat([[[cxk - 0.6, 0, zc - 0.4], [cxk - 0.6, 0.22, zc - 0.4]], [[cxk + 0.6, 0, zc + 0.4], [cxk + 0.6, 0.22, zc + 0.4]]])), { anim: 'fade', dur: 0.2, out: [tA + 1.3, tA + 1.6], quiet: true });
        part('pa', tA - 0.3 + k * 0.03, S(boxGeo(cxk - 0.67, 0.22, zc - 0.32, cxk + 0.67, 0.22 + 4 * BOX, zc + 0.32).segs.concat(
          [1, 2, 3].map(function (m) { return [[cxk - 0.67, 0.22 + m * BOX, zc + 0.32], [cxk + 0.67, 0.22 + m * BOX, zc + 0.32]]; }))), { anim: 'fade', dur: 0.2, out: [tA + k * 4 * 0.045 - 0.05, tA + k * 4 * 0.045 + 0.1], quiet: true });
      }
      splay.forEach(function (sp, bi) {
        var rig = new Rig(function (t, X) { var H = hangAt(t); hingeX(X, 0, 0, 0, 1, 0, H.a[bi]); placeX(X, 0, H.c[bi][0], H.c[bi][1], H.c[bi][2]); });
        var geo = detailed([oboxGeo([0, 0, 0], [0.67, 0, 0], [0, BOX / 2 - 0.01, 0], [0, 0, 0.32])], [S([[[-0.55, 0, 0.33], [0.55, 0, 0.33]]])]);
        part('pa', tA + bi * 0.045, geo, { veh: rig, anim: 'fade', dur: 0.12 });
      });
      for (k = 0; k < 15; k++) {
        var sx = s * (4.1 + k * 1.18);
        var geo2 = boxGeo(sx - 0.55, 0, 4.7, sx + 0.55, 1.3, 5.8);
        geo2.segs.push([[sx - 0.55, 0.65, 5.8], [sx + 0.55, 0.65, 5.8]]);
        part('pa', A0 + 0.35 + k * 0.03 + si * 0.02, geo2, { anim: 'pop', dur: 0.3 });
      }
      for (k = 0; k < 4; k++) part('box', A0 + 0.5 + k * 0.05 + si * 0.03, boxGeo(s * (27 + k * 0.75) - 0.3, 0, 0.4, s * (27 + k * 0.75) + 0.3, 1.4, 1.2), { arrive: [0, 2, 0], dur: 0.3, quiet: true });
    });
    // delay towers: scaffold, a truss arm cantilevered toward the back of the field, an array of its own
    [[46, [-36, -13, 13, 36]], [84, [-28, 0, 28]], [150, [-65, -25, 25, 65]]].forEach(function (row, ri) {
      row[1].forEach(function (x, mi) {
        var z = row[0], t0 = A0 + 0.1 + ri * 0.22 + mi * 0.06, H2 = 13.2;
        part('ballast', t0, boxGeo(x - 2.2, 0, z - 2.2, x + 2.2, 0.35, z + 2.2), { anim: 'pop', dur: 0.25, noX: true });
        part('sub', t0 + 0.05, detailed([scaffoldGeo(x - 1.5, x + 1.5, z - 1.5, z + 1.5, 0.35, H2, 1, 1, false)],
          [S([[[x - 1.5, 0.35, z + 1.5], [x + 1.5, H2 * 0.5, z + 1.5]], [[x + 1.5, H2 * 0.5, z + 1.5], [x - 1.5, H2, z + 1.5]], [[x - 1.5, H2 * 0.5, z - 1.5], [x + 1.5, H2 * 0.5, z - 1.5]],
            [[x - 1.5, H2 * 0.5, z + 1.5], [x - 1.5, H2 * 0.5, z - 1.5]], [[x + 1.5, H2 * 0.5, z + 1.5], [x + 1.5, H2 * 0.5, z - 1.5]]])]), { anim: 'grow', anchor: [x, 0.35, z], dur: 0.45, noX: true });
        part('mast', t0 + 0.45, trussGeo([x, H2 + 0.3, z - 1.5], [x, H2 + 0.3, z + 3.2], 0.52, 0.6), { arrive: [0, 3, 0], dur: 0.3, noX: true });
        var h2 = [x, H2 - 0.1, z + 2.9], ang2 = 0;
        for (k = 0; k < 8; k++) {
          ang2 += (k < 3 ? 1 : 3) * DEG;
          var v2 = [0, Math.cos(ang2), Math.sin(ang2)], w2 = [0, -Math.sin(ang2), Math.cos(ang2)], c2 = sub(h2, mul(v2, 0.18));
          part('pa', t0 + 0.65 + k * 0.03, oboxGeo(c2, [0.5, 0, 0], mul(v2, 0.17), mul(w2, 0.26)), { arrive: [0, 1.4, 0], dur: 0.25, noX: true });
          h2 = sub(h2, mul(v2, 0.36));
        }
        if (ri < 2) masts.push([x, z]);
      });
    });

    /* ======== FOH, barricade, camera and followspot towers ======== */
    part('foh', X0 + 0.2, boxGeo(-6, 0, 54, 6, 1.0, 62), { arrive: [0, 2.5, 0], dur: 0.4 });
    [-3.2, 0, 3.2].forEach(function (x, n) {
      var cg = boxGeo(x - 1.2, 1.0, 56.4, x + 1.2, 1.95, 57.4);
      cg.faces[4].screen = { grp: 'console', x: x, y: 2 };
      part('console', X0 + 0.4 + n * 0.06, cg, { anim: 'pop', dur: 0.3 });
    });
    [-1, 1].forEach(function (s, si) {
      var x = s * 14, z = 60;
      part('sub', X0 + 0.3 + si * 0.05, scaffoldGeo(x - 1.5, x + 1.5, z - 1.5, z + 1.5, 0, 7.6, 1, 1, true), { anim: 'grow', anchor: [x, 0, z], dur: 0.4, noX: true });
      part('fixture', X0 + 0.7 + si * 0.05, detailed([oboxGeo([x, 8.3, z - 0.3], [0.2, 0, 0], [0, 0.2, 0], [0, 0, 0.8])], [S([[[x, 7.6, z], [x, 8.1, z]]])]), { anim: 'pop', dur: 0.3, noX: true });
      part('sub', X0 + 0.35 + si * 0.05, scaffoldGeo(s * 18 - 1, s * 18 + 1, 33, 35, 0, 4, 1, 1, false), { anim: 'grow', anchor: [s * 18, 0, 34], dur: 0.35, noX: true });
    });
    (function () {
      var path = [[-24, 8], [-3.6, 8]], a0b = Math.atan2(17.6 - 22.2, -3.6), sweep = Math.PI + 2 * (a0b + Math.PI);
      for (var q = 0; q <= 16; q++) { var a = a0b - q / 16 * sweep; path.push([6.2 * Math.cos(a), 22.2 + 6.2 * Math.sin(a)]); }
      path.push([3.6, 8], [24, 8]);
      var segs = [];
      for (var n = 0; n < path.length - 1; n++) {
        var a2 = path[n], b2 = path[n + 1];
        segs.push([[a2[0], 1.1, a2[1]], [b2[0], 1.1, b2[1]]], [[a2[0], 0.05, a2[1]], [a2[0], 1.1, a2[1]]]);
      }
      part('barrier', X0, { segs: segs }, { anim: 'draw', dur: 1.1 });
    })();

    // ---- FX: lasers and flame units along the deck edge, hazers in the wings, followspot chairs under the lip.
    [-19.5, -15, -11, -7, 7, 11, 15, 19.5].forEach(function (x, n) {
      var pl = part('laser', L0 + 1.2 + n * 0.04, boxGeo(x - 0.3, DECK.h, 3.3, x + 0.3, DECK.h + 0.4, 3.9), { anim: 'pop', dur: 0.3 });
      lasers.push({ o: [x, DECK.h + 0.3, 3.9], n: n, p: pl });
    });
    [-17, -13, -9, -5, 5, 9, 13, 17].forEach(function (x, n) {
      part('fx', L0 + 1.35 + n * 0.04, boxGeo(x - 0.28, DECK.h, 3.4, x + 0.28, DECK.h + 0.35, 3.96), { anim: 'pop', dur: 0.3 });
      flames.push({ p: [x, DECK.h + 0.4, 3.7], n: flames.length, tip: false });
    });
    [-20, 20].forEach(function (x, n) { part('fx', L0 + 1.45 + n * 0.05, boxGeo(x - 0.3, DECK.h, -3.2, x + 0.3, DECK.h + 0.35, -2.6), { anim: 'pop', dur: 0.3 }); });
    [-9, 9].forEach(function (x, n) {
      var yb3 = lipY(x) - 2.6;
      part('fixture', L0 + 0.9 + n * 0.05, S(polySegs([[x - 0.5, yb3, LIP_Z - 0.5], [x + 0.5, yb3, LIP_Z - 0.5], [x + 0.5, yb3, LIP_Z + 0.5], [x - 0.5, yb3, LIP_Z + 0.5]], true)
        .concat([[[x - 0.5, yb3, LIP_Z - 0.5], [x - 0.5, yb3 + 1.4, LIP_Z - 0.5]], [[x + 0.5, yb3, LIP_Z + 0.5], [x + 0.5, yb3 + 1.4, LIP_Z + 0.5]], [[x, yb3 + 0.5, LIP_Z], [x, yb3 + 0.5, LIP_Z + 1.4]]])), { anim: 'pop', dur: 0.3 });
    });

    /* ======== Two slab scissor lifts on the deck, for the halo and the wall's cabling ======== */
    // the X-stack straightens as the platform rises; a tech rides the platform
    [[-8.5, V0 + 0.2, V0 + 2.9], [8.5, V0 + 0.35, V0 + 2.9]].forEach(function (sl) {
      var x = sl[0], z = -10.2, y0 = DECK.h + 0.55, Lb = 2.2, N = 5;
      function rise(t) { return smooth(span(t, [sl[1] + 0.25, sl[1] + 1.0])) * (1 - smooth(span(t, [sl[2] - 0.7, sl[2] - 0.25]))); }
      function ang(t) { var h = lerp(0.18, 9.2, rise(t)) / N; return Math.asin(clamp(h / Lb, 0.03, 0.97)); }
      var alive = function (t) { return fadeWin(t, sl[1], sl[2]); };
      var base = new Rig(function (t, X) { placeX(X, 0, x, DECK.h, z); X.a = alive(t); });
      part('plant', sl[1], detailed([boxGeo(-1.25, 0, -0.6, 1.25, 0.55, 0.6)], [S([[[-1.25, 0.28, 0.61], [1.25, 0.28, 0.61]]])]), { veh: base, anim: 'fade', dur: 0.2, quiet: true, noX: true, mod: true });
      [0, 1, 2, 3, 4].forEach(function (lvl) { [-1, 1].forEach(function (dir) {
        [-0.52, 0.52].forEach(function (zs) {
          var bar = new Rig(function (t, X) {
            var a = ang(t), h = Lb * Math.sin(a);
            hingeX(X, 0, 0, 0, 0, 1, dir * a); placeX(X, 0, x, y0 + (lvl + 0.5) * h, z + zs); X.a = alive(t);
          });
          part('plant', sl[1], S([[[-Lb / 2, 0, 0], [Lb / 2, 0, 0]]]), { veh: bar, anim: 'fade', dur: 0.2, quiet: true, noX: true, mod: true });
        });
      }); });
      var deckRig = new Rig(function (t, X) { var h = Lb * Math.sin(ang(t)); placeX(X, 0, x, y0 + N * h, z); X.a = alive(t); });
      part('plant', sl[1], detailed([boxGeo(-1.3, 0, -0.62, 1.3, 0.12, 0.62)], [S([[[-1.3, 1.1, -0.62], [1.3, 1.1, -0.62]], [[-1.3, 1.1, 0.62], [1.3, 1.1, 0.62]], [[-1.3, 1.1, -0.62], [-1.3, 1.1, 0.62]], [[1.3, 1.1, -0.62], [1.3, 1.1, 0.62]],
        [[-1.3, 0.12, -0.62], [-1.3, 1.1, -0.62]], [[1.3, 0.12, -0.62], [1.3, 1.1, -0.62]], [[-1.3, 0.12, 0.62], [-1.3, 1.1, 0.62]], [[1.3, 0.12, 0.62], [1.3, 1.1, 0.62]]])]),
        { veh: deckRig, anim: 'fade', dur: 0.2, quiet: true, noX: true, mod: true });
      man([[sl[1], 0, 0]], { rig: deckRig, seat: [0.2, 0.12, -0.2], stop: 'work', t0: sl[1], t1: sl[2], vest: 0, hat: 0 });
    });

    /* ======== A secondary stage on the west of the field (built in the background) ======== */
    (function () {
      var t0 = D0 + 1.6, x0 = -104, x1 = -96, z0 = 22, z1 = 38, H2 = 12.4, i2, lv2;
      part('deck', t0, boxGeo(x0, 0, z0, x1, 1.6, z1), { arrive: [0, 2, 0], dur: 0.35, noX: true });
      [[x0 + 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4], [x1 - 0.4, z0 + 0.4], [x1 - 0.4, z1 - 0.4]].forEach(function (tp, n) {
        for (lv2 = 0; lv2 < 4; lv2++) part('tower', t0 + 0.4 + n * 0.08 + lv2 * 0.1, trussGeo([tp[0], lv2 * 3.1, tp[1]], [tp[0], (lv2 + 1) * 3.1, tp[1]], 0.52, 0.6), { anim: 'grow', anchor: [tp[0], lv2 * 3.1, tp[1]], dur: 0.2, noX: true });
      });
      [[[x0 + 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4]], [[x1 - 0.4, z0 + 0.4], [x1 - 0.4, z1 - 0.4]], [[x0 + 0.4, z0 + 0.4], [x1 - 0.4, z0 + 0.4]], [[x0 + 0.4, z1 - 0.4], [x1 - 0.4, z1 - 0.4]]].forEach(function (e, n) {
        part('roof', t0 + 1.0 + n * 0.08, trussGeo([e[0][0], H2, e[0][1]], [e[1][0], H2, e[1][1]], 0.52, 0.6), { arrive: [0, 3, 0], dur: 0.3, noX: true });
      });
      for (i2 = 0; i2 < 8; i2++) for (var r2 = 0; r2 < 4; r2++) {
        var za = z0 + 1.5 + i2 * 1.625, ya = 3.2 + r2 * 1.8;
        part('led', t0 + 1.4 + i2 * 0.04 + (3 - r2) * 0.03, panelGeo([[x1 - 1.2, ya, za + 1.6], [x1 - 1.2, ya, za], [x1 - 1.2, ya + 1.75, za], [x1 - 1.2, ya + 1.75, za + 1.6]], [1, 0, 0], { grp: 'led', x: -30 + za, y: ya }), { arrive: [0, 1.2, 0], dur: 0.25, noX: true });
      }
      [z0 - 1.2, z1 + 1.2].forEach(function (zp, n) {
        for (var q = 0; q < 8; q++) part('pa', t0 + 1.8 + n * 0.1 + q * 0.03, oboxGeo([x1 + 0.3 + q * 0.03, 11.2 - q * 0.4, zp], [0.3, 0, 0], [0, 0.19, 0], [0, 0, 0.6]), { arrive: [0, 1.4, 0], dur: 0.25, noX: true });
      });
    })();

    /* ======== The crew ======== */
    buildCrew(STAKES);

    // ---- Callouts: a CAD engineer's notes, pinned to the work as it happens.
    callouts.push(
      { p: [CP[0], 1.95, CP[1]], t0: S0 + 0.6, t1: S0 + 2.3, text: 'CP 01  ·  TOTAL STATION  ·  +1.550', dx: 26, dy: -34, c: LIME },
      { p: [-22, 0.05, 4], t0: S0 + 2.0, t1: S0 + 3.5, text: 'SET-OUT  ·  ' + STAKES.length + ' POINTS', dx: -24, dy: -30, c: LIME },
      { p: [PAD.x1, 0.3, -20], t0: G0 + 0.9, t1: G0 + 2.4, text: 'PAD  244 000 × 282 000  ·  GRADING', dx: -26, dy: -30, c: MUTED },
      { p: [122, 0.5, -100], t0: G0 + 2.7, t1: G0 + 4.0, text: 'CONVOY  ·  ' + BAYS.length + ' × 15 100', dx: 26, dy: -30, c: INK },
      { p: [-70, 4, -64], t0: G0 + 3.3, t1: G0 + 4.6, text: 'POWER  ·  6 × 12 190 GENSET', dx: -26, dy: -28, c: AMBER },
      { p: [0, DECK.h, -5], t0: D0 + 1.0, t1: D0 + 2.9, text: 'DECK  +2 200  ·  ' + nStd + ' STANDARDS', dx: 30, dy: -34, c: INK },
      { p: [-24, 26.6, 5], t0: W0 + 0.8, t1: W0 + 2.3, text: 'T1  ·  GROUND SUPPORT  ·  H 26 000', dx: 26, dy: -30, c: LIME },
      { p: [24, 18, -4.5], t0: HINGE[4][1], t1: HINGE[5][1] + 0.3, text: 'T2 – T6  ·  HINGED UP', dx: 26, dy: -26, c: LIME },
      { p: [0, archY(0), 5], t0: T.roof[0] - 0.4, t1: T.roof[1] + 0.2, text: 'ROOF  ·  6 HOISTS  ·  SYNC LIFT', live: 'lift', dx: 30, dy: -34, c: LIME },
      { p: [0, 20.7, -13.3], t0: V0 + 0.15, t1: V0 + 1.2, text: 'SPINE  ·  H 18 000', dx: 34, dy: -24, c: LIME },
      { p: [HALO.c[0] + HALO.r1 * 0.72, HALO.c[1] + HALO.r1 * 0.72, -10.8], t0: V0 + 1.3, t1: V0 + 2.3, text: 'HALO  Ø 14 400', dx: 40, dy: -30, c: LIME },
      { p: [LED.x1, LED.y1, LED.z], t0: V0 + 0.9, t1: V0 + 2.5, text: 'LED  36 × 16 M  ·  ' + LED.cols + ' COLUMNS  ·  ' + nTiles + ' TILES', dx: 26, dy: -24, c: TEAL },
      { p: [WING.x + Math.cos(54 * DEG) * 23, WING.y + Math.sin(54 * DEG) * 23, WING.z], t0: V0 + 3.0, t1: V0 + 3.9, text: 'WINGS  8 × 22 M', dx: 22, dy: -22, c: VIOLET_LINE },
      { p: [0, 40, ARCH.c[2]], t0: L0 + 0.6, t1: L0 + 1.7, text: 'ARCH  160 000  ·  H 40 000', dx: 28, dy: -22, c: LIME },
      { p: [21, 23.3, 7.2], t0: A0 + 1.4, t1: A0 + 2.4, text: 'PA  2 × 16  ·  SUBS 30', dx: 26, dy: -26, c: INK },
      { p: [13, 14, 46], t0: A0 + 1.6, t1: A0 + 2.7, text: 'DELAYS  4 + 3 + 4', dx: 22, dy: -22, c: INK },
      { p: [0, 2.0, 58], t0: X0 + 0.6, t1: X0 + 1.5, text: 'FOH  +58 000', dx: -22, dy: -24, c: INK }
    );

    // ---- Where the ideas land in the hologram (act 1): the same key points, in the same order, as film v2.
    [-1, 1].forEach(function (s) { WING.ang.forEach(function (deg, fi) { nodes.push([s * WING.x + s * Math.cos(deg * DEG) * (WING.len[fi] + 1.2), 0, WING.z]); }); });
    [-1, 1].forEach(function (s) { var x0 = s * IMAG.x - IMAG.w / 2; nodes.push([x0, 0, IMAG.z], [x0 + IMAG.w, 0, IMAG.z]); });
    [-1, 1].forEach(function (s) { nodes.push([s * 21, 0, 7.2]); });
    [[46, [-36, -13, 13, 36]], [84, [-28, 0, 28]]].forEach(function (row) { row[1].forEach(function (x) { nodes.push([x, 0, row[0]]); }); });
    nodes.push([-6, 0, 54], [6, 0, 54], [6, 0, 62], [-6, 0, 62]);
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
    // film v3, scene 2: down onto the ground with the surveyors, then round the build in the order of work
    { t: 16.0,  target: [-14, 1.5, 22], dist: 44, yaw: -42, pitch: 13, fov: 40 },    // the total station, rovers, stakes
    { t: 17.3,  target: [-8, 2, 12],  dist: 60, yaw: -54, pitch: 16, fov: 40 },       // paint lines; the drone lands; light towers go up
    { t: 18.9,  target: [30, 0, -90], fit: 440, yaw: -52, pitch: 17, fov: 40 },       // up and out: the plateau, the convoy on the ridge road
    { t: 20.0,  target: [10, 0, -40], fit: 250, yaw: -40, pitch: 21, fov: 40 },       // the dock, the compound, the cranes setting up
    { t: 21.1,  target: [0, 1.5, -5], fit: 74, yaw: -28, pitch: 24, fov: 38 },        // the deck on its scaffold
    { t: 22.6,  target: [-24, 10, -1], dist: 58, yaw: -40, pitch: 11, fov: 40 },      // the towers: one stacked, the others hinged up
    { t: 24.4,  target: [0, 7, -4],   fit: 112, yaw: -34, pitch: 15, fov: 38 },       // the roof pinned together on the deck, pre-rigged
    { t: 26.6,  target: [0, 15, -4],  fit: 124, yaw: -14, pitch: 9,  fov: 38 },       // lifted to trim
    { t: 26.65, target: [0, 11.2, -12], fit: 42, yaw: 0, pitch: 1.5, fov: 36, cut: true },   // cut to elevation, like the reference
    { t: 28.5,  target: [0, 11.2, -12], fit: 40, yaw: 0, pitch: 1.5, fov: 36 },
    { t: 30.0,  target: [0, 17, -8],  fit: 176, yaw: 0,  pitch: 5,  fov: 38 },        // the whole facade: wings, arch, band
    { t: 31.6,  target: [6, 12, 14],  fit: 190, yaw: 28, pitch: 14, fov: 38 },        // round to the field: PA, delays, FOH
    { t: 32.9,  target: [0, 33, -4],  fit: 205, yaw: 30, pitch: 9,  fov: 38 },        // exploded into layers
    { t: 33.7,  target: [0, 15, 0],   fit: 150, yaw: 24, pitch: 8,  fov: 38 },
    { t: 36.0,  target: [-2, 18, -3], dist: 60, yaw: 36, pitch: -13, fov: 46, fixedFov: true },      // T.realCut: low three-quarter, the roof at trim under work lights
    { t: 36.6,  target: [-2, 18, -3], dist: 59.4, yaw: 35.6, pitch: -13, fov: 46, fixedFov: true },
    { t: 39.1,  target: [0, 12, 0],   dist: 64.4, yaw: -1.3, pitch: -6.6, fov: 46, frame: "end" },   // (fallback) down behind the team at the desk
    { t: 46,    target: [0, 12, 0],   dist: 63.5, yaw: -0.8, pitch: -6.6, fov: 46, frame: "end" }
  ];

  function resolve(k) {
    var aspect = W / H, fov = (k.fov || 38) * DEG, dist = k.dist, f, px = W / 2, py = H / 2;
    if (aspect < 1 && !k.fixedFov) fov = Math.min(fov * 1.35, 64 * DEG);   // fixedFov: phones see the same centre crop as the footage
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
    led: 3, disc: 3, imag: 3, band: 3, ribbon: 3, halo: 4, ring2: 4, bracket: 4, wing: 4, arch: 4, pa: 5, fx: 5, laser: 5,
    sub: 0, jack: 0, deckp: 0, ballast: 1, hoist: 2, cable: 2, cart: 5 };
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
  // A part's motion this frame, written into its own reused record (no garbage per part per frame).
  function motion(p, t) {
    var k = clamp((t - p.t0) / p.dur, 0, 1);
    if (k <= 0) return null;
    var M = p.Mo;
    M.k = k; M.dy = (p.lift ? roofY(t) : 0) + (p.noX ? 0 : explodeY(p, t)) + (p.dyf ? p.dyf(t) : 0);
    M.off = null; M.gs = -1; M.ps = -1; M.X = p.veh ? p.veh.at(t) : null;
    if (p.anim === 'drop' || p.anim === 'rise') {
      var e = p.anim === 'drop' ? outBack(k) : outCubic(k);
      if (e !== 1) { var o = M.ov; o[0] = p.arrive[0] * (1 - e); o[1] = p.arrive[1] * (1 - e); o[2] = p.arrive[2] * (1 - e); M.off = o; }
    }
    else if (p.anim === 'grow') M.gs = outCubic(k);
    else if (p.anim === 'pop') M.ps = 0.2 + 0.8 * outBack(k);
    return M;
  }
  function mv(p, M, q) {
    var x = q[0], y = q[1], z = q[2];
    if (M.off) { x += M.off[0]; y += M.off[1]; z += M.off[2]; }
    else if (M.gs >= 0) y = p.anchor[1] + (y - p.anchor[1]) * M.gs;
    else if (M.ps >= 0) { x = p.c[0] + (x - p.c[0]) * M.ps; y = p.c[1] + (y - p.c[1]) * M.ps; z = p.c[2] + (z - p.c[2]) * M.ps; }
    if (M.X) { rigPt(M.X, x, y, z); x = RX; y = RY; z = RZ; }
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
  // Level of detail: a truss far away is drawn as its four chords, or as a single line;
  // other parts drop their small detail (wheels, ribs, plates, grilles) once they are small on screen.
  function lodSegs(p, c) {
    if (!p.truss) return p.nMain && p._pr < (LITE ? 16 : 10) * dpr ? p.nMain : p.segs.length;
    var m = p.truss;
    mv(p, p._M, m.m);
    if (!pj(c, MX, MY, MZ)) return 0;
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
  // The checks: every screen runs a pixel-map test (a white column sweeping across, then colour bars).
  var TESTK = 0, BARS = [INK, LIME, TEAL, VIOLET_LINE, AMBER, WARM];
  function testFill(sc, t, base, sh, alpha, k) {
    var u = t - T.checks[0] - 0.1, x = sc.x !== undefined ? sc.x : sc.side ? sc.side * (26 + (sc.u || 0.5) * 13) : 0, col, g;
    if (sc.grp === 'halo' || sc.grp === 'ring2') { col = sc.grp === 'halo' ? LIME : WARM; g = 0.3 + 0.4 * (Math.floor(sc.a * 16 + u * 8) % 2); }
    else if (u < 0.9) { var xs = lerp(-62, 62, u / 0.9), d = Math.abs(x - xs); col = INK; g = d < 3.2 ? 1 - d / 3.2 * 0.6 : 0.05; }
    else { col = BARS[clamp(Math.floor((x + 60) / 20), 0, 5)]; g = 0.72; }
    var kk = clamp(k * g, 0, 1), uu = sh * (1 - kk);
    return rgbaS([base[0] * uu + col[0] * kk, base[1] * uu + col[1] * kk, base[2] * uu + col[2] * kk], 1, Math.max(alpha, 0.35 * kk + alpha * (1 - kk)));
  }
  // Faces are collected per depth band, sorted, and filled in runs of the same colour;
  // edges in the same band are grouped by style and stroked once per style.
  var faceList = [], facePool = [], fpi = 0;
  function collectFaces(t, c, p, power, keep) {
    // wireframe first, then shaded: the faces fill in just after the part lands (the CAD reveal)
    var M = p._M, st = p.st, X = M.X, fadeIn = (p.anim === 'fade' ? M.k : clamp((t - (p.t0 + p.dur * 0.55)) / 0.35, 0, 1)) * keep, j, v;
    if (fadeIn <= 0.01) return;
    for (j = 0; j < p.faces.length; j++) {
      var f = p.faces[j], q = f.p, nx = f.n[0], ny = f.n[1], nz = f.n[2];
      if (X) {   // a rig turns its faces too
        if (X.h) {
          var kd = X.hx * nx + X.hz * nz, hc = X.hc, hs = X.hs;
          var ax = nx * hc - X.hz * ny * hs + X.hx * kd * (1 - hc), ay = ny * hc + (X.hz * nx - X.hx * nz) * hs, az = nz * hc + X.hx * ny * hs + X.hz * kd * (1 - hc);
          nx = ax; ny = ay; nz = az;
        }
        var bx = nx * X.cy + nz * X.sy; nz = -nx * X.sy + nz * X.cy; nx = bx;
      }
      mv(p, M, q[0]);   // back faces are dropped before anything is projected
      var facing = nx * (c.pos[0] - MX) + ny * (c.pos[1] - MY) + nz * (c.pos[2] - MZ) > 0;
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
      var sh = st.flat ? 1 : Math.round((0.55 + 0.55 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])) * (facing ? 1 : 0.55) * 20) / 20;
      var lit = f.screen && power > 0 && facing ? litAt(f.screen, t) : 0;
      if (TESTK > 0 && f.screen && facing) slot.fill = testFill(f.screen, t, st.f, sh, st.fa * fadeIn, TESTK);
      else slot.fill = lit > 0 ? content(f.screen, t, lit, st.f, sh, st.fa * fadeIn) : rgbaS(st.f, sh, st.fa * fadeIn);
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

  /* ---- The crew: where each worker is, their pose, and how they are drawn ----
     They are painted inside the stage's depth bands, so structure in front of
     them hides them. Far away a worker is a hi-vis stroke under a hard hat;
     close up, a full figure: limbs, vest, helmet, and whatever they carry. */
  var CS = { x: 0, y: 0, z: 0, yaw: 0, spd: 0, ph: 0, climb: false, moving: false };
  function crewAt(w, t) {
    var way = w.way, n = way.length, i;
    CS.spd = 0; CS.climb = false; CS.moving = false; CS.ph = 0;
    if (w.rig) {
      var X = w.rig.at(t);
      rigPt(X, w.seat[0], w.seat[1], w.seat[2]); CS.x = RX; CS.y = RY; CS.z = RZ; CS.yaw = Math.atan2(X.sy, X.cy);
      return;
    }
    if (t <= way[0][0] || n === 1) { var a0 = way[0]; CS.x = a0[1]; CS.z = a0[2]; CS.y = a0[3] !== undefined ? a0[3] : w.y; CS.yaw = w.yaws[0]; return; }
    for (i = 0; i < n - 1; i++) {
      var b = way[i + 1];
      if (t < b[0]) {
        var a = way[i], dt = b[0] - a[0], u = (t - a[0]) / dt, e = smooth(u);
        var ya = a[3] !== undefined ? a[3] : w.y, yb = b[3] !== undefined ? b[3] : w.y;
        CS.x = lerp(a[1], b[1], e); CS.z = lerp(a[2], b[2], e); CS.y = lerp(ya, yb, e);
        var L = Math.hypot(b[1] - a[1], b[2] - a[2]), dy = Math.abs(yb - ya);
        CS.yaw = w.yaws[i];
        if (L + dy > 0.05) {
          var avg = (L + dy) / dt;
          CS.moving = true; CS.climb = dy > L; CS.spd = avg * 6 * u * (1 - u);
          // a walking stride; in time-lapse (fast) moves the cadence is capped so legs never blur
          CS.ph = avg < 2.6 ? (w.cum[i] + (L + dy) * e) / 1.45 * Math.PI * 2 : t * Math.PI * 2 * 1.9;
        }
        return;
      }
    }
    var z = way[n - 1]; CS.x = z[1]; CS.z = z[2]; CS.y = z[3] !== undefined ? z[3] : w.y; CS.yaw = w.yaws[w.yaws.length - 1];
  }
  // 20 points: 0 head, 1 neck, 2 pelvis, 3-5 left hip/knee/foot, 6-8 right, 9-11 left shoulder/elbow/hand,
  // 12-14 right, 15-16 a vest band, 17-19 a carried tool.
  var CJ = new Float64Array(60), CPX = new Float64Array(40), CB = { x: 0, y: 0, z: 0, fx: 0, fz: 1, sx: 1, sz: 0 };
  function J(i, f, y, s) { var o = i * 3; CJ[o] = CB.x + CB.fx * f + CB.sx * s; CJ[o + 1] = CB.y + y; CJ[o + 2] = CB.z + CB.fz * f + CB.sz * s; }
  function crewPose(w, t, mode, idx) {
    var amp = CS.moving && !CS.climb ? (CS.spd > 2.6 ? 0.42 : 0.42 * clamp(CS.spd / 1.45, 0, 1)) : 0, ph = CS.ph, s;
    var bob = 0.025 * Math.abs(Math.sin(ph)) * (amp / 0.42);
    if (mode === 'kneel') {   // one knee down, working at the ground: bolting a plate, pinning a panel
      var tap = 0.1 * Math.abs(Math.sin(t * 8 + idx));
      J(0, 0.32, 1.26, 0); J(1, 0.22, 1.1, 0); J(2, -0.04, 0.62, 0);
      J(3, -0.04, 0.62, -0.1); J(4, 0.4, 0.52, -0.12); J(5, 0.42, 0.02, -0.12);
      J(6, -0.04, 0.62, 0.1); J(7, -0.02, 0.06, 0.12); J(8, -0.48, 0.05, 0.12);
      J(9, 0.2, 1.05, -0.19); J(10, 0.4, 0.66, -0.22); J(11, 0.6, 0.24, -0.13);
      J(12, 0.2, 1.05, 0.19); J(13, 0.42, 0.7 + tap, 0.22); J(14, 0.62, 0.26 + tap * 1.6, 0.13);
      J(15, 0.24, 0.98, -0.13); J(16, 0.24, 0.98, 0.13);
      return 0;
    }
    if (mode === 'drive') {   // seated in a cab, hands on the controls
      J(0, 0.03, 0.74, 0); J(1, 0, 0.56, 0); J(2, 0, 0, 0);
      J(3, 0, 0, -0.1); J(4, 0.45, 0.05, -0.12); J(5, 0.5, -0.42, -0.12);
      J(6, 0, 0, 0.1); J(7, 0.45, 0.05, 0.12); J(8, 0.5, -0.42, 0.12);
      J(9, 0, 0.5, -0.19); J(10, 0.2, 0.28, -0.22); J(11, 0.42, 0.3, -0.16);
      J(12, 0, 0.5, 0.19); J(13, 0.2, 0.28, 0.22); J(14, 0.42, 0.3, 0.16);
      J(15, 0, 0.36, -0.13); J(16, 0, 0.36, 0.13);
      return 0;
    }
    var climbing = mode === 'climb', tool = 0;
    J(0, climbing ? 0.08 : 0.03, 1.67 + bob, 0); J(1, 0, 1.5 + bob, 0); J(2, climbing ? -0.05 : 0, 0.96 + bob, 0);
    J(15, 0.02, 1.28 + bob, -0.13); J(16, 0.02, 1.28 + bob, 0.13);
    for (s = -1; s <= 1; s += 2) {
      var li = s < 0 ? 3 : 6, ai = s < 0 ? 9 : 12, phase = ph + (s > 0 ? Math.PI : 0);
      if (climbing) {   // on a tower face: hands reaching up in turn, knees stepping
        var lift = 0.22 * Math.sin(t * 7 + (s > 0 ? Math.PI : 0) + idx);
        J(li, -0.05, 0.95, 0.1 * s); J(li + 1, 0.3, 0.62 + lift, 0.14 * s); J(li + 2, 0.24, 0.16 + lift, 0.14 * s);
        J(ai, 0, 1.43, 0.19 * s); J(ai + 1, 0.22, 1.72 - lift * 0.5, 0.28 * s); J(ai + 2, 0.3, 1.98 - lift, 0.2 * s);
        continue;
      }
      var a = amp * Math.sin(phase), b = amp * 1.4 * Math.max(0, Math.sin(phase - 1.1));
      var ky = 0.95 + bob - 0.47 * Math.cos(a), kf = 0.47 * Math.sin(a);
      J(li, 0, 0.95 + bob, 0.09 * s); J(li + 1, kf, ky, 0.09 * s); J(li + 2, kf + 0.47 * Math.sin(a - b), ky - 0.47 * Math.cos(a - b), 0.1 * s);
      var aa = -amp * 0.85 * Math.sin(phase), sy = 1.43 + bob, arm = mode;
      J(ai, 0, sy, 0.19 * s);
      if (s < 0 && (arm === 'tube' || arm === 'rover')) arm = 'swing';   // the load rides in the right hand; the left arm swings
      if (s < 0 && arm === 'point') arm = 'radio';
      if (arm === 'carry') { J(ai + 1, 0.2, 1.18, 0.24 * s); J(ai + 2, 0.4, 1.06, 0.17 * s); tool = 1; }
      else if (arm === 'tube') { J(ai + 1, 0.2, 1.32, 0.3); J(ai + 2, 0.06, 1.6, 0.2); tool = 2; }
      else if (arm === 'rover') { J(ai + 1, 0.12, 1.2, 0.28); J(ai + 2, 0.32, 1.22, 0.22); tool = 3; }
      else if (arm === 'radio') { J(ai + 1, 0.1, 1.16, -0.26); J(ai + 2, 0.12, 1.44, -0.12); }
      else if (arm === 'wave') { var wv = 0.12 * Math.sin(t * 5 + s * 1.3); J(ai + 1, 0.05, 1.78, 0.32 * s); J(ai + 2, 0.1, 2.06 + wv, 0.4 * s); }
      else if (arm === 'work' || arm === 'station') { var wk = arm === 'work' ? 0.07 * Math.sin(t * 8 + s * 1.5 + idx) : 0; J(ai + 1, 0.16, 1.14, 0.25 * s); J(ai + 2, 0.34, 1.3 + wk, 0.12 * s); }
      else if (arm === 'point' && w.aim) {   // a straight arm toward what they are calling
        var o = ai * 3, dx = w.aim[0] - CJ[o], dy2 = w.aim[1] - CJ[o + 1], dz = w.aim[2] - CJ[o + 2], L = Math.sqrt(dx * dx + dy2 * dy2 + dz * dz) || 1;
        dx /= L; dy2 /= L; dz /= L;
        CJ[o + 3] = CJ[o] + dx * 0.29; CJ[o + 4] = CJ[o + 1] + dy2 * 0.29; CJ[o + 5] = CJ[o + 2] + dz * 0.29;
        CJ[o + 6] = CJ[o] + dx * 0.56; CJ[o + 7] = CJ[o + 1] + dy2 * 0.56; CJ[o + 8] = CJ[o + 2] + dz * 0.56;
      }
      else { J(ai + 1, 0.29 * Math.sin(aa), sy - 0.29 * Math.cos(aa), 0.22 * s); J(ai + 2, 0.29 * Math.sin(aa) + 0.27 * Math.sin(aa + 0.3), sy - 0.29 * Math.cos(aa) - 0.27 * Math.cos(aa + 0.3), 0.21 * s); }
    }
    if (tool === 1) { J(17, 0.28, 0.9, 0); J(18, 0.66, 0.9, 0); J(19, 0.66, 1.22, 0); }                 // a case, held in front
    else if (tool === 2) { J(17, -1.3, 1.64, 0.17); J(18, 1.7, 1.64, 0.17); }                         // a scaffold tube on the shoulder
    else if (tool === 3) { J(17, 0.33, 0.02, 0.22); J(18, 0.33, 2.02, 0.22); J(19, 0.33, 2.02, 0.22); } // a GNSS pole with its antenna
    return tool;
  }
  var CREW_COLS = [[150, 146, 138], LIME, AMBER, INK, [255, 214, 90], [196, 192, 182], [236, 234, 226]];
  function crewBucket(ci, wpx, a) {
    var wq = clamp(Math.round(wpx * 2), 1, 999), aq = clamp(Math.round(a * 10), 1, 10), key = 3e7 + ci * 100000 + aq * 1000 + wq;
    var b = buckets.get(key);
    if (!b || !b.on) b = bucket(key, CREW_COLS[ci], aq / 10, wq / 2 / dpr);
    return b.xy;
  }
  var crewVis = [], crewRec = [];
  function gatherCrew(t, c) {
    var n = 0;
    for (var i = 0; i < CREW.length; i++) {
      var w = CREW[i];
      if (t < w.t0 || t > w.t1) continue;
      var a = clamp((t - w.t0) / 0.25, 0, 1) * clamp((w.t1 - t) / 0.25, 0, 1);
      if (w.rig) a *= w.rig.at(t).a;
      if (a <= 0.02) continue;
      crewAt(w, t);
      if (!pj(c, CS.x, CS.y + 0.9, CS.z)) continue;
      var s = c.f / PZ;
      if (1.75 * s < 1.2 * dpr || PX < -40 * dpr || PX > W + 40 * dpr || PY < -60 * dpr || PY > H + 60 * dpr) continue;
      var r = crewRec[n] || (crewRec[n] = {});
      r.w = w; r.d = PZ; r.s = s; r.a = a; r.x = CS.x; r.y = CS.y; r.z = CS.z; r.yaw = CS.yaw; r.moving = CS.moving; r.climb = CS.climb; r.spd = CS.spd; r.ph = CS.ph; r.idx = i;
      if (!CS.moving && !w.rig) { var f = w.aim && w.stop === 'point' ? [w.aim[0], w.aim[2]] : w.face; if (f) r.yaw = Math.atan2(f[0] - CS.x, f[1] - CS.z); }
      if (1.75 * s < 7 * dpr) {   // far away: just where the stroke and the helmet go
        var top = w.stop === 'drive' && !CS.moving ? 0.56 : 1.45;
        pj(c, CS.x, CS.y + (top < 1 ? 0 : 0.1), CS.z); r.bx = PX; r.by = PY;
        pj(c, CS.x, CS.y + top, CS.z); r.nx = PX; r.ny = PY;
        pj(c, CS.x, CS.y + top + 0.2, CS.z); r.hx = PX; r.hy = PY;
      }
      crewVis[n++] = r;
    }
    crewVis.length = n;
    crewVis.sort(function (a2, b2) { return b2.d - a2.d; });
    prof.n_crew = n;
    return n;
  }
  function pushJ(xy, i, j) { xy.push(CPX[i * 2], CPX[i * 2 + 1], CPX[j * 2], CPX[j * 2 + 1]); }
  function drawWorker(r, t, c, dim) {
    var w = r.w, s = r.s, a = r.a * dim, vest = 1 + w.vest, hat = 3 + w.hat;
    if (1.75 * s < 7 * dpr) {
      crewBucket(vest, Math.max(1.1 * dpr, 0.2 * s), a).push(r.bx, r.by, r.nx, r.ny);
      crewBucket(hat, Math.max(1.5 * dpr, 0.3 * s), a).push(r.hx, r.hy, r.hx + 0.01, r.hy);
      return;
    }
    CS.moving = r.moving; CS.climb = r.climb; CS.spd = r.spd; CS.ph = r.ph;
    CB.x = r.x; CB.y = r.y; CB.z = r.z; CB.fx = Math.sin(r.yaw); CB.fz = Math.cos(r.yaw); CB.sx = Math.cos(r.yaw); CB.sz = -Math.sin(r.yaw);
    var mode = r.moving ? (r.climb ? 'climb' : w.mode) : w.stop;
    var tool = crewPose(w, t, mode, r.idx), last = tool === 1 || tool === 3 ? 20 : tool === 2 ? 19 : 17, i;
    for (i = 0; i < last; i++) { if (!pj(c, CJ[i * 3], CJ[i * 3 + 1], CJ[i * 3 + 2])) return; CPX[i * 2] = PX; CPX[i * 2 + 1] = PY; }
    var limbs = crewBucket(0, 0.085 * s, a);
    pushJ(limbs, 3, 4); pushJ(limbs, 4, 5); pushJ(limbs, 6, 7); pushJ(limbs, 7, 8);
    pushJ(limbs, 9, 10); pushJ(limbs, 10, 11); pushJ(limbs, 12, 13); pushJ(limbs, 13, 14);
    pushJ(crewBucket(vest, 0.23 * s, a), 1, 2);
    pushJ(crewBucket(vest, 0.12 * s, a), 9, 12);
    if (s * 1.75 > 34 * dpr) pushJ(crewBucket(6, 0.035 * s, a), 15, 16);   // the reflective band
    var hx = CPX[0], hy = CPX[1];
    crewBucket(hat, 0.27 * s, a).push(hx, hy, hx + 0.01, hy);
    if (tool) {
      var tb = crewBucket(5, Math.max(dpr, 0.045 * s), a);
      pushJ(tb, 17, 18);
      if (tool === 1) { pushJ(tb, 18, 19); tb.push(CPX[38], CPX[39], CPX[34], CPX[35] - (CPX[37] - CPX[39])); }
      if (tool === 3) crewBucket(1, Math.max(1.5 * dpr, 0.2 * s), a).push(CPX[38] - 0.1 * s, CPX[39], CPX[38] + 0.1 * s, CPX[39]);
    }
  }

  // The stage, painted from the back to the front in depth bands (the crew in among them).
  var active = [], BAND = 40;
  function isModule(p) { return p.mod || p.xl === 4 || p.kind === 'halo' || p.kind === 'ring2' || p.kind === 'disc' || p.kind === 'led' || p.kind === 'bracket' || (p.kind === 'spine' && p.t0 > T.video[0] - 0.1); }
  function drawStage(t, c, power) {
    var i, p, M, X, dNear = c.dist * 0.45, dFar = c.dist * 1.9, landed = 0;
    active.length = 0; fpi = 0; flushes = 0;
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      if (t < p.t0 || (p.out && t >= p.out[1])) continue;
      M = motion(p, t);
      if (!M) continue;
      X = M.X;
      if (X && X.a <= 0.01) continue;
      if (!p.quiet && t >= p.t0 + p.dur * 0.7) landed++;
      if (X) { mv(p, M, p.c); if (!pj(c, MX, MY, MZ)) continue; }
      else if (!pj(c, p.c[0], p.c[1] + M.dy, p.c[2])) continue;
      // skip what can't be seen: smaller than a pixel, or wholly off screen
      var pr = p.r * c.f / PZ, m2 = pr + 60 * dpr;
      if (pr < 0.45 * dpr || PX < -m2 || PX > W + m2 || PY < -m2 || PY > H + m2) continue;
      p._M = M; p._d = PZ; p._pr = pr;
      active.push(p);
    }
    var nCrew = gatherCrew(t, c), ci = 0;
    var qs = now();
    active.sort(function (a, b) { return b._d - a._d; });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the slam: every edge flashes lime for a moment as the exploded layers land together
    var slam = t >= T.explode[3] ? clamp(1 - (t - T.explode[3]) / 0.45, 0, 1) : 0, slamQ = Math.round(slam * 6);
    // while the halo module builds in elevation, everything else steps back so it reads alone
    var focus = span(t, [T.video[0] - 0.05, T.video[0] + 0.35]) * (1 - span(t, [T.video[0] + 2.4, T.video[0] + 3.0]));
    for (var b0 = 0; b0 < active.length || ci < nCrew; b0 += BAND) {
      var b1 = Math.min(active.length, b0 + BAND);
      for (i = b0; i < b1; i++) {
        p = active[i];
        // out in the field (delays, FOH) things step back once the show starts, so the stage owns the frame
        var keep = p.c[2] > 30 && !p.veh ? lerp(1, p.kind === 'foh' || p.kind === 'console' ? 0.12 : 0.3, power) : 1;
        if (focus > 0 && !isModule(p)) keep *= 1 - 0.6 * focus;
        if (p.out) keep *= 1 - span(t, p.out);
        if (p._M.X) keep *= p._M.X.a;
        p._keep = keep;
        // small structural parts read fine as outlines; screens always get their faces
        if (p.faces.length && p.st.f && p._pr > (p.screens ? 1.5 : LITE ? 8 : 5) * dpr) collectFaces(t, c, p, power, keep);
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
        var fresh = p.quiet ? 0 : Math.round((1 - clamp((t - (p.t0 + p.dur)) / 0.2, 0, 1)) * 3);
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
      // then the crew standing further away than anything still to come
      var lim = b1 < active.length ? active[b1]._d : -1;
      if (ci < nCrew && crewVis[ci].d >= lim) {
        while (ci < nCrew && crewVis[ci].d >= lim) { drawWorker(crewVis[ci], t, c, 1); ci++; }
        strokeBuckets();
      }
    }
    qs = lap('s_paint', qs); prof.n_active = active.length; prof.n_faces = fpi; prof.n_flush = flushes;
    // The moment each part lands: a short flash in its type colour.
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < active.length; i++) {
      p = active[i];
      var land = t - (p.t0 + p.dur * 0.7);
      if (land <= 0 || land >= 0.45 || p.st.noEdge || p.quiet) continue;
      var k2 = Math.round((1 - land / 0.45) * 6);
      var fc = p.kind === 'deck' || p.kind === 'deckp' || p.kind === 'pa' || p.kind === 'foh' || p.kind === 'rig' ? INK : p.st.e;
      pushSegs(bucket(-1 - (p.ki * 7 + k2), fc, 0.7 * k2 / 6, 2.2).xy, p, p._M, c, lodSegs(p, c));
    }
    strokeBuckets();
    ctx.restore();
    return landed;
  }

  // The roof's hoists: chains from the head blocks down to the sleeve blocks as the roof climbs.
  function drawChains(t, c) {
    var a = span(t, [T.roof[0] - 0.5, T.roof[0] - 0.1]) * (1 - span(t, [T.roof[1] + 0.2, T.roof[1] + 0.8]));
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
      if (lx < 16 * dpr || lx > W - 16 * dpr || ly < 96 * dpr || ly > H - 16 * dpr) return;   // (the header and the act list live up top)
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
    var on = span(t, [P0(1.0), P0(1.4)]) * power * (1 - 0.45 * smooth(span(t, [T.end + 0.6, T.end + 1.8])));   // quieter under the title
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
  var CORE = { c: [0, HALO.c[1], -10.6], h: 4.0, w: 2.5, t0: T.video[0] + 2.1 };
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

  /* ---- The cranes' pendants, ropes, hook blocks, slings and loads (bodies and booms are parts) -- */
  function drawCranes(t, c) {
    ctx.save(); ctx.lineCap = 'round';
    CRANES.forEach(function (cr) {
      var s = cr.state(t);
      if (!(s.a > 0.01)) return;
      var tip = s.tip, hk = s.hook, b = cr.base, sy = Math.sin(s.yaw), cy = Math.cos(s.yaw), side = [cy, 0, -sy];
      var gantry = [b[0] - 3.2 * sy, 9.0, b[2] - 3.2 * cy];
      ctx.strokeStyle = rgba(AMBER, 0.7 * s.a); ctx.lineWidth = dpr;
      ctx.beginPath();
      function L(p, q) { if (!pj(c, p[0], p[1], p[2])) return; var x0 = PX, y0 = PY; if (!pj(c, q[0], q[1], q[2])) return; ctx.moveTo(x0, y0); ctx.lineTo(PX, PY); }
      L(add(gantry, mul(side, 0.4)), add(tip, mul(side, 0.3))); L(add(gantry, mul(side, -0.4)), add(tip, mul(side, -0.3)));
      L(add(tip, mul(side, 0.2)), add(hk, mul(side, 0.2))); L(add(tip, mul(side, -0.2)), add(hk, mul(side, -0.2)));
      // the hook block
      var h0 = add(hk, [0, -0.6, 0]);
      L(add(hk, mul(side, 0.4)), add(h0, mul(side, 0.4))); L(add(hk, mul(side, -0.4)), add(h0, mul(side, -0.4)));
      L(add(hk, mul(side, 0.4)), add(hk, mul(side, -0.4))); L(add(h0, mul(side, 0.4)), add(h0, mul(side, -0.4)));
      if (s.load === 'tower') {   // two slings down to the tower's head as it swings up
        var tt = add(hk, [0, -0.9, 0]);
        L(h0, add(tt, [0.45, 0, 0.45])); L(h0, add(tt, [-0.45, 0, -0.45]));
      } else if (s.load === 'arch') {   // a length of the arch's truss on two slings, steadied by tag lines
        var dir = [sy, 0, cy], la = add(h0, add(mul(side, -4.5), [0, -3.2, 0])), lb = add(h0, add(mul(side, 4.5), [0, -3.2, 0])), dn = [0, -1.3, 0];
        L(h0, la); L(h0, lb); L(la, lb); L(add(la, dn), add(lb, dn)); L(la, add(la, dn)); L(lb, add(lb, dn));
        for (var q = 0; q < 6; q++) L(lerp3(la, lb, q / 6), add(lerp3(la, lb, (q + 1) / 6), dn));
        ctx.stroke();
        ctx.strokeStyle = rgba(INK, 0.35 * s.a); ctx.beginPath();
        L(add(la, dn), [la[0] - dir[0] * 6 - side[0] * 3, 0, la[2] - dir[2] * 6 - side[2] * 3]); L(add(lb, dn), [lb[0] - dir[0] * 6 + side[0] * 3, 0, lb[2] - dir[2] * 6 + side[2] * 3]);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ==========================================================================
     Film v3: the night around the build
     ========================================================================== */
  // Stars, and three rings of mountain ridges falling away below the summit plateau.
  var STARS = [], RIDGES = [];
  (function () {
    seed = 919;
    for (var i = 0; i < 320; i++) {
      var az = rnd() * Math.PI * 2, el = Math.asin(0.03 + rnd() * rnd() * 0.95), R0 = 9000;
      STARS.push([SITE_C[0] + R0 * Math.cos(el) * Math.cos(az), R0 * Math.sin(el), SITE_C[1] + R0 * Math.cos(el) * Math.sin(az), 0.25 + rnd() * 0.75, rnd() * 6]);
    }
    [[1650, -420, 300, [23, 23, 27]], [2900, -300, 420, [18, 18, 22]], [4800, -220, 560, [15, 15, 18]]].forEach(function (rg, ri) {
      var pts = [], n = 120, ph1 = rnd() * 6, ph2 = rnd() * 6, ph3 = rnd() * 6;
      for (var k = 0; k <= n; k++) {
        var a = k / n * Math.PI * 2, h = rg[1] + rg[2] * (0.55 + 0.25 * Math.sin(3 * a + ph1) + 0.14 * Math.sin(7 * a + ph2) + 0.06 * Math.sin(17 * a + ph3));
        var d = Math.abs(angDiff(a, SPUR_A)) < 0.18 ? 0.85 : 1;   // a saddle where the ridge road comes in
        pts.push([SITE_C[0] + rg[0] * Math.cos(a), h * d, SITE_C[1] + rg[0] * Math.sin(a)]);
      }
      RIDGES.push({ pts: pts, col: rg[3] });
    });
  })();
  var RUNX = [], RUNB = [];
  function drawSky(t, c, k) {
    if (k <= 0) return;
    var i, p;
    ctx.save();
    // stars (a slow twinkle, no flashing)
    ctx.fillStyle = rgba(INK, 0.55 * k);
    ctx.beginPath();
    for (i = 0; i < STARS.length; i++) {
      p = STARS[i];
      if (!pj(c, p[0], p[1], p[2]) || PX < 0 || PX > W || PY < 0 || PY > H) continue;
      var s = (0.7 + 0.8 * p[3] * (0.75 + 0.25 * Math.sin(t * 0.9 + p[4]))) * dpr;
      ctx.rect(PX - s / 2, PY - s / 2, s, s);
    }
    ctx.fill();
    // the ridges, far to near: filled silhouettes with a faint crest line
    RIDGES.slice().reverse().forEach(function (rg) {
      var pts = rg.pts;
      RUNX.length = 0; RUNB.length = 0;
      function flush() {
        if (RUNX.length >= 4) {
          ctx.beginPath(); ctx.moveTo(RUNX[0], RUNX[1]);
          for (var q = 2; q < RUNX.length; q += 2) ctx.lineTo(RUNX[q], RUNX[q + 1]);
          for (q = RUNB.length - 2; q >= 0; q -= 2) ctx.lineTo(RUNB[q], RUNB[q + 1]);
          ctx.closePath(); ctx.fillStyle = rgba(rg.col, k); ctx.fill();
          ctx.beginPath(); ctx.moveTo(RUNX[0], RUNX[1]);
          for (q = 2; q < RUNX.length; q += 2) ctx.lineTo(RUNX[q], RUNX[q + 1]);
          ctx.strokeStyle = rgba(MUTED, 0.16 * k); ctx.lineWidth = dpr; ctx.stroke();
        }
        RUNX.length = 0; RUNB.length = 0;
      }
      for (var q = 0; q < pts.length; q++) {
        var a = pts[q];
        if (!pj(c, a[0], a[1], a[2])) { flush(); continue; }
        var x = PX, y = PY;
        if (!pj(c, a[0], -2600, a[2])) { flush(); continue; }
        RUNX.push(x, y); RUNB.push(PX, PY);
      }
      flush();
    });
    ctx.restore();
  }

  // The plateau as a survey mesh: a fine grid on the pad (combed flat by the graders), a coarse one
  // beyond, the rim where the mountain falls away, and the ridge road.
  var TERR = (function () {
    var VX = [], VZ = [], VY0 = [], PADV = [], segs = [], i, j, x, z, idx = {};
    function vert(x, z, pad) { var key = x + ',' + z; if (idx[key] !== undefined) return idx[key]; idx[key] = VX.length; VX.push(x); VZ.push(z); VY0.push(groundH(x, z)); PADV.push(pad ? 1 : 0); return VX.length - 1; }
    for (x = -120; x <= 120; x += 10) for (z = -130; z < 150; z += 10) segs.push(vert(x, z, true), vert(x, z + 10, true));
    for (z = -130; z <= 150; z += 10) for (x = -120; x < 120; x += 10) segs.push(vert(x, z, true), vert(x + 10, z, true));
    function inPad(x, z) { return x >= -121 && x <= 121 && z >= -131 && z <= 151; }
    for (x = -720; x <= 720; x += 40) for (z = -700; z < 740; z += 40) if (!(inPad(x, z) && inPad(x, z + 40))) segs.push(vert(x, z, false), vert(x, z + 40, false));
    for (z = -700; z <= 740; z += 40) for (x = -720; x < 720; x += 40) if (!(inPad(x, z) && inPad(x + 40, z))) segs.push(vert(x, z, false), vert(x + 40, z, false));
    var n = VX.length, rim = [];
    for (i = 0; i <= 240; i++) { var a = i / 240 * Math.PI * 2, r = rimR(a) - 2; rim.push([SITE_C[0] + r * Math.cos(a), groundH(SITE_C[0] + r * Math.cos(a), SITE_C[1] + r * Math.sin(a)), SITE_C[1] + r * Math.sin(a)]); }
    var edges = [[], []];
    for (i = 0; i < ROAD.length; i++) {
      var p0 = ROAD[Math.max(0, i - 1)], p1 = ROAD[Math.min(ROAD.length - 1, i + 1)], dx = p1[0] - p0[0], dz = p1[1] - p0[1], l = Math.hypot(dx, dz) || 1;
      [-1, 1].forEach(function (s, si) { var ex = ROAD[i][0] - dz / l * 4 * s, ez = ROAD[i][1] + dx / l * 4 * s; edges[si].push([ex, groundH(ex, ez) + 0.2, ez]); });
    }
    return { VX: VX, VZ: VZ, VY0: VY0, PAD: PADV, segs: segs, n: n, SX: new Float32Array(n), SY: new Float32Array(n), D: new Float32Array(n), OK: new Uint8Array(n), rim: rim, road: edges };
  })();
  function droneAt(t) {
    var S0 = T.survey[0], u = span(t, [S0 - 0.3, S0 + 2.7]);
    if (t < S0 + 2.7) return [118 * Math.sin(u * Math.PI * 7), 55, lerp(-150, 170, u)];
    var v = smooth(span(t, [S0 + 2.7, S0 + 3.4]));
    return [lerp(0, -24, v), lerp(55, 0.35, v * v), lerp(170, 30, v)];
  }
  function drawTerrain(t, c, k) {
    if (k <= 0) return;
    var G = TERR, i, S0 = T.survey[0], scanZ = t < S0 + 2.7 ? droneAt(t)[2] : 1e9, outer = span(t, [S0 + 1.2, S0 + 3.0]) * k;
    var gf = gradeFront(t), gOn = t > T.ground[0];
    for (i = 0; i < G.n; i++) {
      var x = G.VX[i], z = G.VZ[i], y = G.VY0[i];
      if (G.PAD[i]) {
        if (z > scanZ + 4) { G.OK[i] = 0; continue; }
        var m = padIn(x, z), g = gOn ? smooth(clamp((gf - (z + 0.2 * x)) / 22, 0, 1)) : 0;
        y *= 1 - m * (0.55 + 0.45 * g);
      } else if (outer <= 0.01) { G.OK[i] = 0; continue; }
      if (!pj(c, x, y, z)) { G.OK[i] = 0; continue; }
      G.OK[i] = 1; G.SX[i] = PX; G.SY[i] = PY; G.D[i] = PZ;
    }
    var near = c.dist * 1.2, far = c.dist * 3.5;
    ctx.save(); ctx.lineWidth = dpr;
    [[0.16, 0, near], [0.1, near, far], [0.05, far, 1e9]].forEach(function (band, bi) {
      ctx.beginPath();
      var S = G.segs;
      for (var q = 0; q < S.length; q += 2) {
        var a = S[q], b = S[q + 1];
        if (!G.OK[a] || !G.OK[b]) continue;
        var d = G.D[a] > G.D[b] ? G.D[a] : G.D[b];
        if (d < band[1] || d >= band[2]) continue;
        ctx.moveTo(G.SX[a], G.SY[a]); ctx.lineTo(G.SX[b], G.SY[b]);
      }
      ctx.strokeStyle = rgba(MUTED, band[0] * k * (bi ? (0.5 + 0.5 * outer) : 1));
      ctx.stroke();
    });
    // the rim, and the road up the ridge
    if (outer > 0.01) polyline3(c, G.rim, MUTED, 0.3 * outer, 1);
    var road = span(t, [T.ground[0] - 0.6, T.ground[0] + 0.2]) * k;
    if (road > 0) { polyline3(c, G.road[0], MUTED, 0.32 * road, 1); polyline3(c, G.road[1], MUTED, 0.32 * road, 1); }
    ctx.restore();
  }

  // Light towers' pools of light on the ground (and, at the end, the work lights on the deck).
  function pool(c, x, y, z, r, col, a) {
    if (a <= 0.003 || !pj(c, x, y, z)) return;
    var rr = r * c.f / PZ;
    if (rr < 1) return;
    ctx.save(); ctx.translate(PX, PY); ctx.scale(1, clamp(Math.abs(c.fw[1]) * 1.3 + 0.12, 0.14, 1));
    glowDot(0, 0, rr, col, a);
    ctx.restore();
  }
  function drawPools(t, c, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var wl = span(t, [T.checks[0] + 1.4, T.checks[0] + 2.0]);
    WLT.forEach(function (L) {
      var on = span(t, [L.t0, L.t0 + 0.3]) * k;
      if (on > 0) pool(c, L.aim[0], 0.05, L.aim[1], 22, WARM, (0.07 + 0.05 * wl) * on);
    });
    if (wl > 0) [[-14, 0], [0, -4], [14, 0], [-8, -10], [8, -10]].forEach(function (q) { pool(c, q[0], DECK.h + 0.02, q[1], 11, WARM, 0.12 * wl * k); });
    ctx.restore();
  }

  // The survey: shots from the total station to each new stake, the rovers' prisms, the mapping drone.
  function drawSurvey(t, c) {
    var S0 = T.survey[0];
    if (t < S0 - 0.3 || t > S0 + 3.6) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    var st = [CP[0], 1.78, CP[1]];
    ctx.lineWidth = dpr;
    STAKES.forEach(function (s) {
      var u = (t - s.t + 0.05) / 0.4;
      if (u <= 0 || u >= 1) return;
      ctx.strokeStyle = rgba(LIME, 0.75 * (1 - u));
      if (clipSeg(c, st, [s.x + 0.4, 1.15, s.z + 0.4])) { ctx.beginPath(); ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); ctx.stroke(); }
      ringOnFloor(c, s.x, 0.03, s.z, 0.3 + 1.4 * u, LIME, 0.6 * (1 - u), 1);
    });
    ctx.setLineDash([5 * dpr, 4 * dpr]);
    ROVERS.forEach(function (w) {
      if (t < S0 + 0.25 || t > w.t1 - 0.2) return;
      crewAt(w, t);
      ctx.strokeStyle = rgba(LIME, 0.35 + 0.15 * Math.sin(t * 9));
      if (clipSeg(c, st, [CS.x + 0.33 * Math.cos(CS.yaw), CS.y + 2.02, CS.z - 0.33 * Math.sin(CS.yaw)])) { ctx.beginPath(); ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); ctx.stroke(); }
    });
    // the drone's flight grid, drawn in the air behind it, and its scan across the ground
    var u0 = span(t, [S0 - 0.3, S0 + 2.7]);
    if (u0 > 0) {
      ctx.strokeStyle = rgba(LIME, 0.22); ctx.beginPath();
      var first = true;
      for (var q = 0; q <= 90; q++) {
        var tq = S0 - 0.3 + (Math.min(t, S0 + 2.7) - (S0 - 0.3)) * q / 90, p = droneAt(tq);
        if (!pj(c, p[0], p[1], p[2])) { first = true; continue; }
        if (first) { ctx.moveTo(PX, PY); first = false; } else ctx.lineTo(PX, PY);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    var d = droneAt(t);
    if (t < S0 + 2.7) {
      var a = 0.32 * span(t, [S0 - 0.3, S0]);
      ctx.strokeStyle = rgba(LIME, a);
      ctx.beginPath();
      [[-34, 0], [34, 0]].forEach(function (o) { if (clipSeg(c, d, [d[0] + o[0], 0.1, d[2]])) { ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); } });
      if (clipSeg(c, [d[0] - 34, 0.1, d[2]], [d[0] + 34, 0.1, d[2]])) { ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); }
      ctx.stroke();
      if (clipSeg(c, [-130, 0.1, d[2]], [130, 0.1, d[2]])) { ctx.strokeStyle = rgba(LIME, 0.14); ctx.beginPath(); ctx.moveTo(SX0, SY0); ctx.lineTo(SX1, SY1); ctx.stroke(); }
    }
    if (pj(c, d[0], d[1], d[2])) {
      var s = Math.max(5 * dpr, 0.9 * c.f / PZ), x = PX, y = PY;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgba(INK, 0.9); ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.35); ctx.lineTo(x + s, y + s * 0.35); ctx.moveTo(x - s, y + s * 0.35); ctx.lineTo(x + s, y - s * 0.35); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      glowDot(x - s, y - s * 0.35, 4 * dpr, LIME, 0.8); glowDot(x + s, y + s * 0.35, 4 * dpr, WARM, 0.5 + 0.4 * Math.sin(t * 6.3));
    }
    ctx.restore();
  }

  // Lights on the kit: truck headlights and tail lights, amber beacons on the plant, the light towers' lamps.
  function drawKitLights(t, c, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    TRUCKS.forEach(function (tr) {
      if (t < tr.t0 || t > tr.t1 + 0.6) return;
      var X = tr.rig.at(t), on = X.a * (1 - span(t, [tr.t1, tr.t1 + 0.6])) * k;
      [-0.85, 0.85].forEach(function (x) {
        rigPt(X, x, 1.35, 7.8);
        if (pj(c, RX, RY, RZ)) glowDot(PX, PY, Math.max(3 * dpr, 1.4 * c.f / PZ), WARM, 0.85 * on);
        rigPt(X, x * 1.3, 1.2, -7.5);
        if (pj(c, RX, RY, RZ)) glowDot(PX, PY, Math.max(2 * dpr, 0.7 * c.f / PZ), AMBER, 0.6 * on);
      });
    });
    if (WATER.rig) {   // the water truck's spray bar laying the dust behind it
      var WX = WATER.rig.at(t);
      if (WX.a > 0.02) for (var q = 0; q < 18; q++) {
        var back = 1.2 + ((q * 0.37 + t * 3.1) % 1) * 5.5, fx = ((q % 9) - 4) * 0.32 * (1 + back * 0.3);
        rigPt(WX, fx, 0.25 + 0.35 * Math.abs(Math.sin(q * 1.7)) * (1 - back / 7), -4.6 - back);
        if (pj(c, RX, RY, RZ)) glowDot(PX, PY, Math.max(1.5 * dpr, 0.45 * c.f / PZ), TEAL, 0.3 * WX.a * k);
      }
    }
    KITRIGS.forEach(function (kr, n) {
      var X = kr.rig.at(t);
      if (X.a <= 0.02) return;
      rigPt(X, kr.p[0], kr.p[1], kr.p[2]);
      if (!pj(c, RX, RY, RZ)) return;
      var blink = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.1 + n * 1.7);   // about once a second: never a flash
      glowDot(PX, PY, Math.max(2.5 * dpr, 0.9 * c.f / PZ), AMBER, 0.75 * blink * X.a * k);
    });
    WLT.forEach(function (L) {
      var on = span(t, [L.t0, L.t0 + 0.3]) * k;
      if (on <= 0) return;
      for (var q = -1.5; q <= 1.5; q += 1) {
        var fx = L.aim[0] - L.x, fz = L.aim[1] - L.z, fl = Math.hypot(fx, fz) || 1;
        if (pj(c, L.x + fz / fl * q * 0.45, L.y + 0.1, L.z - fx / fl * q * 0.45)) glowDot(PX, PY, clamp(1.1 * c.f / PZ, 2.5 * dpr, 8 * dpr), WARM, 0.75 * on);
      }
    });
    ctx.restore();
  }

  // The checks: focus (fixtures one by one onto their marks), then the work lights for the last look.
  function drawChecks(t, c, k) {
    var C0 = T.checks[0];
    if (t < C0 || k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [0, 5, 9, 14, 18, 23, 27, 32].forEach(function (li, n) {
      var f = lights[li], u = (t - (C0 + 0.8 + n * 0.12)) / 0.7;
      if (!f || u <= 0 || u >= 1) return;
      var on = Math.sin(u * Math.PI);
      beam(c, f.o, norm([Math.sin(n) * 0.12, -1, Math.cos(n) * 0.1]), f.o[1] - DECK.h, 0.55, WARM, 0.22 * on * k);
    });
    var wl = span(t, [C0 + 1.4, C0 + 2.0]) * k;
    if (wl > 0) {
      [[-16, 3], [0, 3], [16, 3], [-16, -7], [0, -7], [16, -7]].forEach(function (q) {
        if (pj(c, q[0], 21.6, q[1])) glowDot(PX, PY, Math.max(4 * dpr, 2.2 * c.f / PZ), WARM, 0.55 * wl);
      });
      if (pj(c, 0, 12, -4)) glowDot(PX, PY, 34 * c.f / PZ, WARM, 0.06 * wl);   // the work lights' wash under the roof
    }
    ctx.restore();
  }

  /* ---- Detail views: three pieces of real hardware, cut in as CAD details --
     A circle on the right with the part turning slowly, a matching circle on
     the main view where that part is, and a leader between them. */
  var IC = null;
  function iseg(a, b) { if (!pj(IC, a[0], a[1], a[2])) return; var x0 = PX, y0 = PY; if (!pj(IC, b[0], b[1], b[2])) return; ctx.moveTo(x0, y0); ctx.lineTo(PX, PY); }
  function ipoly(pts) { var first = true; for (var i = 0; i < pts.length; i++) { if (!pj(IC, pts[i][0], pts[i][1], pts[i][2])) { first = true; continue; } if (first) { ctx.moveTo(PX, PY); first = false; } else ctx.lineTo(PX, PY); } }
  function iframe(d) { var e1 = Math.abs(d[1]) > 0.9 ? norm(cross(d, [1, 0, 0])) : norm(cross(d, [0, 1, 0])); return [e1, cross(d, e1)]; }
  function iring(o, d, r, n) {
    var F = iframe(d), pts = [];
    for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, ca = Math.cos(a) * r, sa = Math.sin(a) * r; pts.push([o[0] + F[0][0] * ca + F[1][0] * sa, o[1] + F[0][1] * ca + F[1][1] * sa, o[2] + F[0][2] * ca + F[1][2] * sa]); }
    ipoly(pts);
  }
  function icyl(a, b, r, n) {   // a cylinder: both rims and its two silhouette lines, as seen from the inset camera
    var d = norm(sub(b, a));
    iring(a, d, r, n); iring(b, d, r, n);
    var vd = norm(sub(mul(add(a, b), 0.5), IC.pos)), s = cross(d, vd), sl = len(s);
    if (sl < 1e-4) return;
    s = mul(s, r / sl);
    iseg(add(a, s), add(b, s)); iseg(sub(a, s), sub(b, s));
  }
  function ibox(c, hx, hy, hz) {
    var P = [];
    for (var i = 0; i < 8; i++) P.push([c[0] + (i & 1 ? hx : -hx), c[1] + (i & 2 ? hy : -hy), c[2] + (i & 4 ? hz : -hz)]);
    for (i = 0; i < 8; i++) [1, 2, 4].forEach(function (bit) { if (!(i & bit)) iseg(P[i], P[i | bit]); });
  }
  function ink(col, a, w) { ctx.strokeStyle = rgba(col, a); ctx.lineWidth = w * dpr; ctx.stroke(); }
  function ilabel(p, text, col, dx, dy) {
    if (!pj(IC, p[0], p[1], p[2])) return;
    var x = PX + dx * dpr, y = PY + dy * dpr;
    ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = dpr;
    ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = rgba(col, 0.95); ctx.textAlign = dx < 0 ? 'right' : 'left'; ctx.fillText(text, x + (dx < 0 ? -4 : 4) * dpr, y);
  }
  // A: the base jack, from sole board to standard
  function detailJack(u, t) {
    var y0 = 0.038 + 0.25 * (1 - smooth(span(u, [0, 0.16]))), hn = y0 + lerp(0.1, 0.27, smooth(span(u, [0.18, 0.5]))), ang = span(u, [0.18, 0.5]) * 18;
    ctx.beginPath(); ibox([0, 0.019, 0], 0.25, 0.019, 0.112); ink(WARM, 0.55, 1);
    ctx.beginPath(); ibox([0, y0 + 0.004, 0], 0.075, 0.004, 0.075); ink(AMBER, 0.95, 1.3);
    ctx.beginPath(); icyl([0, y0 + 0.008, 0], [0, y0 + 0.56, 0], 0.019, 14); ink(INK, 0.9, 1.2);
    var vd = norm(sub([0, 0.3, 0], IC.pos)), s = norm(cross([0, 1, 0], vd));
    ctx.beginPath();
    for (var y = y0 + 0.06; y < y0 + 0.54; y += 0.016) iseg(add([0, y, 0], mul(s, 0.019)), add([0, y + 0.008, 0], mul(s, -0.019)));
    ink(INK, 0.4, 1);
    ctx.beginPath(); icyl([0, hn, 0], [0, hn + 0.03, 0], 0.034, 14);
    [0, Math.PI].forEach(function (o) { var a = ang + o; iseg([0.034 * Math.cos(a), hn + 0.015, 0.034 * Math.sin(a)], [0.078 * Math.cos(a), hn + 0.024, 0.078 * Math.sin(a)]); });
    ink(AMBER, 0.95, 1.3);
    var lz = span(u, [0.32, 0.56]);
    if (lz > 0 && lz < 1) {   // the laser level's plane sweeping across the jacks' target height
      ctx.beginPath(); iseg([-0.34, y0 + 0.285, lerp(-0.3, 0.3, lz)], [0.34, y0 + 0.285, lerp(-0.3, 0.3, lz)]); ink(TEAL, 0.9 * Math.sin(lz * Math.PI), 1.4);
    }
    var ec = smooth(span(u, [0.52, 0.66])), yc = hn + 0.03 + 0.3 * (1 - ec);
    if (u > 0.5) { ctx.beginPath(); icyl([0, yc, 0], [0, yc + 0.24, 0], 0.0242, 14); iring([0, yc + 0.18, 0], [0, 1, 0], 0.062, 20); iring([0, yc + 0.189, 0], [0, 1, 0], 0.062, 20); ink(MUTED, 0.95, 1.2); }
    var es = smooth(span(u, [0.68, 0.86])), ys = yc + 0.12 + 0.45 * (1 - es);
    if (u > 0.66) { ctx.beginPath(); icyl([0, ys, 0], [0, ys + 0.5, 0], 0.0242, 14); iring([0, ys + 0.44, 0], [0, 1, 0], 0.062, 20); ink(MUTED, 0.95, 1.2); }
    ctx.font = '500 ' + (9.5 * dpr).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'middle';
    if (u > 0.12) ilabel([0.075, y0 + 0.008, 0.075], '150 × 150', AMBER, 34, 16);
    if (u > 0.3) ilabel([-0.019, y0 + 0.18, 0], 'Ø 38', INK, -30, 6);
    if (u > 0.8) ilabel([-0.0242, ys + 0.3, 0], 'Ø 48.3', MUTED, -30, -8);
  }
  // B: a right-angle coupler clamping a brace to a standard
  function shellPt(c, ax, r, a, o, hinge, rot) {
    var p = ax === 'y' ? [r * Math.cos(a), o, r * Math.sin(a)] : [r * Math.cos(a), r * Math.sin(a), o];
    if (rot) {   // swing about the hinge line, in the jaw's plane
      var hx = r * Math.cos(hinge), hy = r * Math.sin(hinge), px = ax === 'y' ? p[0] : p[0], pv = ax === 'y' ? p[2] : p[1];
      var dx = px - hx, dv = pv - hy, cr = Math.cos(rot), sr = Math.sin(rot), nx = hx + dx * cr - dv * sr, nv = hy + dx * sr + dv * cr;
      if (ax === 'y') { p[0] = nx; p[2] = nv; } else { p[0] = nx; p[1] = nv; }
    }
    return [c[0] + p[0], c[1] + p[1], c[2] + p[2]];
  }
  function ishell(c, ax, r, a0, a1, h, hinge, rot) {
    for (var side = -1; side <= 1; side += 2) { var pts = []; for (var i = 0; i <= 8; i++) pts.push(shellPt(c, ax, r, lerp(a0, a1, i / 8), side * h / 2, hinge, rot)); ipoly(pts); }
    iseg(shellPt(c, ax, r, a0, -h / 2, hinge, rot), shellPt(c, ax, r, a0, h / 2, hinge, rot));
    iseg(shellPt(c, ax, r, a1, -h / 2, hinge, rot), shellPt(c, ax, r, a1, h / 2, hinge, rot));
  }
  function detailCoupler(u, t) {
    var drop = 0.22 * (1 - smooth(span(u, [0.52, 0.66]))), bc = [0.066, drop, 0];
    ctx.beginPath(); icyl([0, -0.24, 0], [0, 0.24, 0], 0.0242, 14); icyl([0.066, drop, -0.26], [0.066, drop, 0.26], 0.0242, 14); ink(MUTED, 0.95, 1.2);
    var fa = (1 - smooth(span(u, [0.12, 0.32]))) * 1.9, fb = (1 - smooth(span(u, [0.66, 0.8]))) * 1.9;
    ctx.beginPath();
    ishell([0, 0.012, 0], 'y', 0.03, -Math.PI / 2, Math.PI / 2, 0.042, 0, 0);                              // jaw A, fixed half
    ishell([0, 0.012, 0], 'y', 0.03, Math.PI / 2, Math.PI * 1.5, 0.042, Math.PI / 2, -fa);                 // jaw A, the flap
    ishell([0.066, 0, 0], 'z', 0.03, Math.PI / 2, Math.PI * 1.5, 0.042, 0, 0);                              // jaw B, fixed half (toward the standard)
    ishell([0.066, 0, 0], 'z', 0.03, -Math.PI / 2, Math.PI / 2, 0.042, -Math.PI / 2, fb);                  // jaw B, the flap
    ink(AMBER, 0.95, 1.3);
    // T-bolts swing up into the flaps; nuts spin down
    var ba = smooth(span(u, [0.32, 0.42])), bb = smooth(span(u, [0.8, 0.88])), na = span(u, [0.42, 0.52]), nb = span(u, [0.88, 0.96]);
    ctx.beginPath();
    var p0 = [-0.036, 0.012, -0.03], dA = [Math.cos(lerp(-1.4, 0, ba)), 0, Math.sin(lerp(-1.4, 0, ba))];
    icyl(add(p0, mul(dA, -0.02)), add(p0, mul(dA, 0.03)), 0.007, 8);
    if (na > 0) iring(add(p0, mul(dA, 0.03 - 0.012 * na)), dA, 0.011, 6);
    var p1 = [0.066 + 0.036, -0.03, 0], dB = [Math.cos(lerp(1.4, 0, bb)), Math.sin(lerp(1.4, 0, bb)) * -1, 0];
    icyl(add(p1, mul(dB, -0.02)), add(p1, mul(dB, 0.03)), 0.007, 8);
    if (nb > 0) iring(add(p1, mul(dB, 0.03 - 0.012 * nb)), dB, 0.011, 6);
    ink(INK, 0.9, 1.1);
    ctx.font = '500 ' + (9.5 * dpr).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'middle';
    ilabel([0, 0.2, 0], 'STANDARD  Ø 48.3', MUTED, 24, -6);
    if (u > 0.6) ilabel([0.066, drop, 0.22], 'BRACE', MUTED, 22, 10);
    if (u > 0.45) ilabel([0, -0.04, -0.03], 'M16', INK, -24, 18);
  }
  // C: two truss chords joined: spigot, pins, R-clips
  function detailSpigot(u, t) {
    var gap = 0.2 * (1 - smooth(span(u, [0, 0.26])));
    ctx.beginPath();
    icyl([0, -0.36, 0], [0, -0.1, 0], 0.025, 14); icyl([0, 0.1 + gap, 0], [0, 0.36 + gap, 0], 0.025, 14);
    iseg([0.022, -0.3, 0.01], [0.3, -0.12, 0.01]); iseg([0.022, 0.3 + gap, 0.01], [0.3, 0.12 + gap, 0.01]);
    iseg([0.01, -0.22, 0.022], [0.01, -0.02, 0.3]); iseg([0.01, 0.22 + gap, 0.022], [0.01, 0.02 + gap, 0.3]);
    ink(LIME, 0.75, 1.1);
    ctx.beginPath(); icyl([0, -0.1, 0], [0, 0, 0], 0.031, 16); icyl([0, gap, 0], [0, 0.1 + gap, 0], 0.031, 16); ink(LIME, 1, 1.4);
    ctx.beginPath(); icyl([0, -0.08, 0], [0, 0.08, 0], 0.0175, 12); ink(INK, 0.95, 1.2);
    // the pins go in through the cross holes, then three taps with a nylon hammer
    [[-0.05, span(u, [0.3, 0.44])], [0.05 + gap, span(u, [0.38, 0.52])]].forEach(function (pn, n) {
      var e = smooth(pn[1]), yh = pn[0], xt = lerp(0.2, -0.045, e);
      if (pn[1] <= 0) return;
      ctx.beginPath(); icyl([xt, yh, 0], [xt + 0.088, yh, 0], 0.0075, 10); iring([xt + 0.088, yh, 0], [1, 0, 0], 0.013, 12); ink(AMBER, 0.95, 1.3);
      var tap = span(u, [0.54 + n * 0.05, 0.62 + n * 0.05]);
      if (tap > 0 && tap < 1 && pj(IC, xt + 0.09, yh, 0)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(PX, PY, 7 * dpr, AMBER, 0.8 * Math.abs(Math.sin(tap * Math.PI * 3))); ctx.restore(); }
      // the R-clip: its straight leg through the hole in the pin's tip, the curved leg snapping over
      var r1 = smooth(span(u, [0.68 + n * 0.05, 0.8 + n * 0.05])), r2 = smooth(span(u, [0.8 + n * 0.05, 0.9 + n * 0.05]));
      if (r1 > 0) {
        var z0 = lerp(0.12, -0.034, r1), E = [-0.052, yh, z0 + 0.068], pts = [[-0.052, yh, z0], E];
        for (var q = 1; q <= 6; q++) { var k = q / 6; pts.push([E[0] + 0.075 * k, yh + (0.016 * Math.sin(k * Math.PI)) * r2 + (1 - r2) * 0.05 * k, E[2] - 0.05 * k * r2 + (1 - r2) * 0.02 * k]); }
        ctx.beginPath(); ipoly(pts); ink(TEAL, 0.95, 1.2);
      }
    });
    ctx.font = '500 ' + (9.5 * dpr).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'middle';
    if (gap > 0.03) ilabel([0.0175, 0.06, 0], 'SPIGOT', INK, 30, -14);
    if (u > 0.45) ilabel([0.05, -0.05, 0], 'PIN Ø 16', AMBER, 32, 12);
    if (u > 0.82) ilabel([-0.05, 0.055, 0.03], 'R-CLIP', TEAL, -30, -12);
    ilabel([-0.025, -0.3, 0], 'CHORD Ø 50', LIME, -28, 10);
  }
  var INSETS = [
    { t: [18.85, 20.25], id: 'A', title: 'DETAIL A  ·  BASE JACK', sub: 'SOLE BOARD  ·  PLATE  ·  SPINDLE  ·  COLLAR', at: [-13.2, 0.3, -6], fn: detailJack, c: [0, 0.34, 0], size: 0.72, yaw: 0.5 },
    { t: [20.3, 21.7], id: 'B', title: 'DETAIL B  ·  COUPLER CLAMP', sub: 'RIGHT-ANGLE COUPLER  ·  BRACE TO STANDARD', at: [4.4, 1.2, 4], fn: detailCoupler, c: [0.03, 0.0, 0], size: 0.5, yaw: 0.75 },
    { t: [21.75, 23.55], id: 'C', title: 'DETAIL C  ·  SPIGOT  ·  PIN  ·  R-CLIP', sub: 'TRUSS CHORD JOINT  ·  4 PER SECTION END', at: [-24.38, 9.85, 5.38], fn: detailSpigot, c: [0.03, 0.02, 0], size: 0.62, yaw: 0.65 }
  ];
  function drawInsets(t, c) {
    for (var i = 0; i < INSETS.length; i++) {
      var I = INSETS[i], a = fadeWin(t, I.t[0], I.t[1]);
      if (a <= 0.01) continue;
      var u = clamp((t - I.t[0] - 0.25) / (I.t[1] - I.t[0] - 0.6), 0, 1), port = W < H;
      var R = Math.min(W, H) * (port ? 0.26 : 0.18), cx = W - R - (port ? 16 : 48) * dpr, cy = port ? H * 0.3 : H * 0.5;
      ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
      if (pj(c, I.at[0], I.at[1], I.at[2]) && PX > 0 && PX < W && PY > 0 && PY < H) {
        var ax = PX, ay = PY, dx = ax - cx, dy = ay - cy, dl = Math.hypot(dx, dy) || 1;
        if (dl > R + 14 * dpr) {
          ctx.beginPath(); ctx.arc(ax, ay, 9 * dpr, 0, Math.PI * 2);
          ctx.moveTo(cx + dx / dl * R, cy + dy / dl * R); ctx.lineTo(ax - dx / dl * 9 * dpr, ay - dy / dl * 9 * dpr);
          ctx.strokeStyle = 'rgba(11,11,12,0.85)'; ctx.lineWidth = 4 * dpr; ctx.stroke();   // a dark halo, so the leader reads over any structure
          ctx.strokeStyle = rgba(LIME, 0.95); ctx.lineWidth = 1.4 * dpr; ctx.stroke();
          ctx.fillStyle = rgba(LIME, 0.95); ctx.font = '600 ' + (10 * dpr).toFixed(1) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(I.id, ax + 16 * dpr, ay - 14 * dpr);
        }
      }
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(12,12,14,0.94)'; ctx.fill();
      ctx.strokeStyle = rgba(INK, 0.32); ctx.lineWidth = dpr; ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R - 1.5 * dpr, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = rgba(MUTED, 0.07); ctx.beginPath();
      for (var g = -R; g <= R; g += 14 * dpr) { ctx.moveTo(cx + g, cy - R); ctx.lineTo(cx + g, cy + R); ctx.moveTo(cx - R, cy + g); ctx.lineTo(cx + R, cy + g); }
      ctx.stroke();
      IC = camFrom({ target: I.c, dist: 1.6, yaw: I.yaw + u * 0.8, pitch: 0.34, f: 1.45 * R * 1.6 / I.size, px: cx, py: cy + R * 0.04 }, 0.05);
      I.fn(u, t);
      ctx.restore();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // the captions stay on screen even when the circle sits hard against the edge (phones)
      function capX(text) { var hw = ctx.measureText(text).width / 2 + 12 * dpr; return clamp(cx, hw, W - hw); }
      ctx.font = '600 ' + (10.5 * dpr).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(LIME, 0.95);
      ctx.fillText(I.title, capX(I.title), cy + R + 16 * dpr);
      ctx.font = '500 ' + (9.5 * dpr).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(MUTED, 0.9);
      ctx.fillText(I.sub, capX(I.sub), cy + R + 31 * dpr);
      ctx.fillText('SCALE 1:4', cx, cy - R - 12 * dpr);
      ctx.restore();
    }
  }

  /* ---- The camera crane at the front of the stage (a keynote touch) ------ */
  var JIB = { base: [17, 0, 12.5], t0: T.site[0] + 0.6 };
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
  // The assembly readout in the corner during the build: the order of work, step by step.
  var PHASES = [[T.survey[0], '01  SURVEY  ·  SET-OUT'], [T.ground[0] + 0.2, '02  GROUND PREP  ·  LOGISTICS'], [T.ground[0] + 2.2, '03  PLANT  ·  CRANES ON THEIR PADS'],
    [T.deck[0] + 0.1, '04  DECK  ·  SYSTEM SCAFFOLD'], [T.deck[0] + 1.45, '04  DECK  ·  PANELS'], [T.towers[0] + 0.1, '05  GROUND SUPPORT  ·  TOWERS'],
    [T.towers[0] + 1.5, '05  ROOF GRID  ·  AT DECK LEVEL'], [T.prerig[0], '06  HOISTS  ·  PRE-RIG'], [T.roof[0], '06  SYNC LIFT'],
    [T.video[0], '07  VIDEO  ·  LED COLUMNS'], [T.video[0] + 2.05, '07  SCENIC  ·  WINGS  ·  IMAG'], [T.audio[0], '08  AUDIO  ·  ARRAYS  ·  DELAYS'],
    [T.light[0], '09  LIGHTING  ·  ARCH  ·  FX'], [T.site[0], '09  SITE  ·  FOH  ·  BARRIER'], [T.explode[0], 'EXPLODED VIEW'],
    [T.checks[0], '10  CHECKS  ·  PIXEL MAP'], [T.checks[0] + 0.8, '10  CHECKS  ·  FOCUS  ·  LINE CHECK'], [T.checks[0] + 1.6, '10  CREW CLEAR  ·  WORK LIGHTS']];
  var COUNTED = 0;
  function drawReadout(t, landed) {
    var a = span(t, [14.8, 15.3]) * (1 - span(t, [T.realCut - 0.6, T.realCut - 0.2]));
    if (a <= 0) return;
    if (!COUNTED) parts.forEach(function (p) { if (!p.quiet) COUNTED++; });
    // on phones the Skip button sits bottom-left, so the readout moves up above it
    var d = dpr, x = Math.max(20 * d, (W - 1280 * d) / 2 + 32 * d), y = H - (W / d < 600 ? 84 : 30) * d, phase = '', i, crew = 0, plant = 0;
    PHASES.forEach(function (ph) { if (t >= ph[0]) phase = ph[1]; });
    if (phase === '06  SYNC LIFT') phase += '  ·  6 / 6 HOISTS  ·  +' + (TRIM + roofY(t)).toFixed(3);
    if (phase === '10  CHECKS  ·  PIXEL MAP') phase += '  ·  COL ' + ('0' + clamp(Math.floor((t - T.checks[0] - 0.1) / 0.9 * LED.cols) + 1, 1, LED.cols)).slice(-2) + ' / ' + LED.cols;
    if (phase === '10  CHECKS  ·  FOCUS  ·  LINE CHECK') phase += '  ·  ' + ['L', 'L  R', 'L  R  SUBS', 'L  R  SUBS  DELAYS'][clamp(Math.floor((t - T.checks[0] - 0.8) / 0.2), 0, 3)];
    for (i = 0; i < CREW.length; i++) if (t >= CREW[i].t0 && t <= CREW[i].t1) crew++;
    for (i = 0; i < KITRIGS.length; i++) if (KITRIGS[i].rig.at(t).a > 0.5) plant++;
    for (i = 0; i < TRUCKS.length; i++) if (t >= TRUCKS[i].t0 && t < TRUCKS[i].t1 + 3) plant++;
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '500 ' + (10.5 * d).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = rgba(MUTED, 0.85 * a);
    ctx.fillText('PARTS  ' + ('000' + landed).slice(-4) + ' / ' + ('000' + COUNTED).slice(-4) + '     CREW  ' + ('00' + crew).slice(-3) + '     PLANT  ' + ('0' + plant).slice(-2), x, y - 16 * d);
    ctx.fillStyle = rgba(LIME, 0.95 * a);
    ctx.fillText(phase, x, y);
    var bw = Math.min(220 * d, W * 0.4);
    ctx.fillStyle = rgba(INK, 0.12 * a); ctx.fillRect(x, y - 30 * d, bw, d);
    ctx.fillStyle = rgba(LIME, 0.9 * a); ctx.fillRect(x, y - 30 * d, bw * Math.min(1, landed / COUNTED), d);
    ctx.restore();
  }

  /* ==========================================================================
     A frame of the film
     ========================================================================== */
  // Review aid (only with ?dev): time spent per layer, read by window.__film.
  var DEV = /[?&]dev/.test(window.location.search), prof = {};
  function now() { return DEV ? performance.now() : 0; }
  function lap(name, t0) { if (!DEV) return 0; var t1 = performance.now(); prof[name] = t1 - t0; return t1; }
  // The stage world (scenes 1-3 on canvas) at canvas time t. The sequence player below decides when it is on screen.
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
    var pen = null, landed = 0;

    ctx.save();
    roundRect(r, 14 * dpr * (1 - o)); ctx.clip();
    if (o < 1) { ctx.fillStyle = rgba([15, 15, 17], (1 - o)); ctx.fillRect(r.x, r.y, r.w, r.h); }
    {
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
        var c = cameraB(t), liftK = span(t, [T.lift[0], T.roof[0]]), power = inOut(span(t, T.power));
        var hit = (t - T.explode[3]) / 0.35;   // the slam shakes the frame for a moment
        if (hit > 0 && hit < 1) { c.px += Math.sin(t * 91) * 3 * dpr * (1 - hit); c.py += Math.cos(t * 77) * 3 * dpr * (1 - hit); }
        var planFade = 1 - 0.55 * span(t, [T.roof[0], T.explode[0]]);
        var night = 1 - 0.6 * span(t, [T.power[0] + 0.5, T.power[1]]);   // the site stays, quieter, once the show is on
        TESTK = span(t, [T.checks[0] + 0.05, T.checks[0] + 0.3]) * (1 - span(t, [T.checks[0] + 1.9, T.checks[0] + 2.2]));
        var q0 = now();
        drawSky(t, c, span(t, [T.lift[0] + 0.6, T.lift[1]]));
        drawTerrain(t, c, night);
        q0 = lap("env", q0);
        pen = drawPlan(t, c, planFade, 0, liftK, power);
        drawLabels(t, c, 1 - clamp(span(t, T.lift) * 1.8, 0, 1));
        pen = drawOwnerDrawing(t, chrome(r).inner) || pen;
        drawPools(t, c, 1 - power);
        drawSurvey(t, c);
        drawChains(t, c);
        drawCranes(t, c);
        drawShockwave(t, c);
        q0 = lap("plan", q0);
        landed = drawStage(t, c, power);
        q0 = lap("stage", q0);
        drawKitLights(t, c, 1 - power);
        drawChecks(t, c, 1 - power);
        q0 = lap("kit", q0);
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
        drawCallouts(t, c, 1 - span(t, [T.explode[0] - 0.1, T.explode[0] + 0.3]));
        drawExplodeLabels(t, c);
        drawInsets(t, c);
      }
    }
    ctx.restore();
    drawChrome(t, r, chromeK, pen);
    if (t >= SWITCH) drawReadout(t, landed);
  }

  /* ==========================================================================
     Scene 4, drawn live: the logo is built and brought into place.
     The canvas version of scene 4 (it plays until the logo footage is ready),
     recreated from the owner's logo (brand/unconventional-logo.jpg): a giant
     steel "U" monogram, a deep stainless frame with a white neon tube running
     along it and truss lacing inside, over the word UNCONVENTIONAL in heavy
     steel capitals with a bright bevelled edge.
       build   eight truss sections of the U fly in, spine first, and are
               pinned together in the air, in the build's CAD colours
       steel   the wireframe turns to brushed steel; a sheen runs across it
       lower   two chain hoists lower it onto its riser; it lands and settles,
               the chains go slack and run back up
       tiles   the word rises out of the deck as LED tiles, left to right, and
               resolves into steel letters standing in front of the U
       strike  the neon in the U strikes with one soft stutter, then glows
       letters UNCONVENTIONAL lights up letter by letter, left to right
       hold    a clean hold; under the title card the logo settles aside.
     No lime in the logo itself: the lime lives in the set (a work light).
     Every number on screen is a dimension of this model.
     ========================================================================== */
  var LG = {
    build: [0.35, 2.35],
    steel: [2.15, 3.05],
    lower: [2.95, 4.55],
    tiles: [3.95, 5.35],
    strike: 5.45,
    letters: [5.95, 7.15],
    title: 7.5,            // the title card comes up
    settle: [7.5, 8.7]     // the logo moves aside to make room for it
  };
  var U_BASE = 2.4, U_TOP = 10.4, U_ARM = 2.5, U_HALF = 0.8, U_RAIL = 0.5, U_DEP = 0.6, U_LIFT = 5.2;
  var U_ARC = U_BASE + U_HALF + U_ARM;          // the centre of the bottom bend
  var WORD = 'UNCONVENTIONAL', W_Z = 4.2, W_CAP = 1.5, W_RATIO = 11.0;   // cap height (m); width : cap height, as in the owner's logo
  var RISER = { x: 3.9, y: U_BASE, z: 1.4 };

  // The U's centre line, sampled from the top of the left arm, round the bend, to the top of the right arm.
  var UPATH = (function () {
    var pts = [], i, y, a, s = 0;
    for (i = 0; i <= 6; i++) { y = lerp(U_TOP, U_ARC, i / 6); pts.push({ x: -U_ARM, y: y, nx: -1, ny: 0 }); }
    for (i = 1; i < 24; i++) { a = Math.PI + Math.PI * i / 24; pts.push({ x: Math.cos(a) * U_ARM, y: U_ARC + Math.sin(a) * U_ARM, nx: Math.cos(a), ny: Math.sin(a) }); }
    for (i = 0; i <= 6; i++) { y = lerp(U_ARC, U_TOP, i / 6); pts.push({ x: U_ARM, y: y, nx: 1, ny: 0 }); }
    pts.forEach(function (p, k) { if (k) s += Math.hypot(p.x - pts[k - 1].x, p.y - pts[k - 1].y); p.s = s; });
    pts.L = s;
    return pts;
  })();
  function uAt(s) {
    var P = UPATH, i = 1;
    s = clamp(s, 0, P.L);
    while (i < P.length - 1 && P[i].s < s) i++;
    var a = P[i - 1], b = P[i], u = clamp((s - a.s) / ((b.s - a.s) || 1), 0, 1);
    var nx = lerp(a.nx, b.nx, u), ny = lerp(a.ny, b.ny, u), nl = Math.hypot(nx, ny) || 1;
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), nx: nx / nl, ny: ny / nl };
  }
  // Eight truss sections, pinned together spine first (the bottom of the bend, then outward to the arm tops).
  var USEC = (function () {
    var n = 8, idx = [], k, i, secs = [], order = [3, 4, 2, 5, 1, 6, 0, 7];
    for (k = 0; k <= n; k++) {
      var goal = UPATH.L * k / n, best = 0;
      for (i = 0; i < UPATH.length; i++) if (Math.abs(UPATH[i].s - goal) < Math.abs(UPATH[best].s - goal)) best = i;
      idx.push(best);
    }
    for (k = 0; k < n; k++) {
      var mid = UPATH[Math.round((idx[k] + idx[k + 1]) / 2)], rank = order.indexOf(k), t0 = LG.build[0] + rank * 0.19, sd = rank % 2 ? -1 : 1;
      secs.push({ i0: idx[k], i1: idx[k + 1], s0: UPATH[idx[k]].s, s1: UPATH[idx[k + 1]].s, t0: t0, t1: t0 + 0.55, cx: mid.x, cy: mid.y,
        off: [mid.nx * 3.4, mid.ny * 3.4 + 1.4, 2.2 * sd], rot: 0.6 * sd, P: {}, L: [] });
    }
    secs.idx = idx;
    return secs;
  })();
  // Lacing: X bracing inside the channel all the way round, and the X truss across the gap between the arms.
  (function () {
    var bay = 0.95, s, z = -0.28, o = 0.62;
    for (s = 0.35; s + bay <= UPATH.L - 0.3; s += bay) {
      var a = uAt(s), b = uAt(s + bay), mid = s + bay / 2, k = 0;
      while (k < USEC.length - 1 && mid > USEC[k].s1) k++;
      USEC[k].L.push([a.x + a.nx * o, a.y + a.ny * o, z, b.x - b.nx * o, b.y - b.ny * o, z], [a.x - a.nx * o, a.y - a.ny * o, z, b.x + b.nx * o, b.y + b.ny * o, z]);
    }
  })();
  var GAP_X = U_ARM - U_HALF, UGAP = { t0: LG.build[0] + 8 * 0.19, t1: LG.build[0] + 8 * 0.19 + 0.55, cx: 0, cy: 8.2, off: [0, 0.6, -3.5], rot: 0, L: [] };
  [[10.05, 8.2], [8.2, 10.05], [8.2, 6.35], [6.35, 8.2]].forEach(function (q) { UGAP.L.push([-GAP_X, q[0], -0.3, GAP_X, q[1], -0.3]); });
  UGAP.L.push([-GAP_X, 10.05, -0.3, GAP_X, 10.05, -0.3], [-GAP_X, 8.2, -0.3, GAP_X, 8.2, -0.3], [-GAP_X, 6.35, -0.3, GAP_X, 6.35, -0.3]);

  // A section's arrival (it flies in, turning, and pins home with a small overshoot), plus the lift.
  var SX = { c: 1, s: 0, ox: 0, oy: 0, oz: 0, cx: 0, cy: 0, ly: 0 };
  function secXf(S, t, ly) {
    var k = clamp((t - S.t0) / (S.t1 - S.t0), 0, 1), r = k >= 1 ? 0 : 1 - outBack(k);
    SX.c = Math.cos(S.rot * r); SX.s = Math.sin(S.rot * r);
    SX.ox = S.off[0] * r; SX.oy = S.off[1] * r; SX.oz = S.off[2] * r; SX.cx = S.cx; SX.cy = S.cy; SX.ly = ly;
    return k;
  }
  function upj(c, x, y, z) {
    var dx = x - SX.cx, dy = y - SX.cy;
    return pj(c, SX.cx + dx * SX.c - dy * SX.s + SX.ox, SX.cy + dx * SX.s + dy * SX.c + SX.oy + SX.ly, z + SX.oz);
  }
  var RAILS = [['OF', U_HALF, U_DEP], ['IF', -U_HALF, U_DEP], ['ORF', U_RAIL, U_DEP], ['IRF', -U_RAIL, U_DEP], ['OB', U_HALF, -U_DEP], ['IB', -U_HALF, -U_DEP], ['N', 0, 0.28]];
  function projSection(S, t, ly, c) {
    S.k = secXf(S, t, ly);
    S.a = smooth(clamp((t - S.t0) / 0.2, 0, 1));
    for (var r = 0; r < RAILS.length; r++) {
      var key = RAILS[r][0], o = RAILS[r][1], z = RAILS[r][2], arr = S.P[key] || (S.P[key] = []), n = 0;
      for (var i = S.i0; i <= S.i1; i++) {
        var q = UPATH[i];
        if (upj(c, q.x + q.nx * o, q.y + q.ny * o, z)) { arr[n++] = PX; arr[n++] = PY; } else { arr[n++] = NaN; arr[n++] = NaN; }
      }
      arr.length = n;
    }
    projLacing(S, c);
  }
  function projLacing(S, c) {
    var out = S.LP || (S.LP = []), n = 0;
    for (var i = 0; i < S.L.length; i++) {
      var m = S.L[i];
      if (!upj(c, m[0], m[1], m[2])) continue;
      var x0 = PX, y0 = PY;
      if (!upj(c, m[3], m[4], m[5])) continue;
      out[n++] = x0; out[n++] = y0; out[n++] = PX; out[n++] = PY;
    }
    out.length = n;
  }
  function liftAt(t) {
    var y = U_LIFT * (1 - inOut(span(t, LG.lower))), d = t - LG.lower[1];
    if (d > 0) y -= 0.07 * Math.sin(d * 17) * Math.exp(-d * 7);   // it lands with a small settle
    return y;
  }
  function neonAt(t) {   // the strike: on, one soft stutter, then up to full (a single flash, well under three a second)
    var d = t - LG.strike;
    if (d < 0) return 0;
    if (d < 0.07) return 0.75;
    if (d < 0.19) return 0.08;
    return 0.3 + 0.7 * smooth(clamp((d - 0.19) / 0.3, 0, 1));
  }
  var LSTEP = (LG.letters[1] - LG.letters[0] - 0.3) / (WORD.length - 1);
  function letterLit(i, t) { return smooth(span(t, [LG.letters[0] + i * LSTEP, LG.letters[0] + i * LSTEP + 0.3])); }

  /* ---- The word: rendered once into images (steel, lit, reflections) and a grid of LED tiles ---- */
  var WD = null;
  function wordFont(px) { return '900 ' + px + 'px "Arial Black", "Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif'; }
  function buildWord() {
    var S = 180, probe = document.createElement('canvas').getContext('2d');
    probe.font = wordFont(S);
    var mU = probe.measureText('U'), capH = Math.round(mU.actualBoundingBoxAscent > 0 ? mU.actualBoundingBoxAscent : S * 0.72);
    var natural = probe.measureText(WORD).width, sx = clamp(W_RATIO * capH / natural, 0.7, 1.3), textW = natural * sx;
    var pad = Math.round(S * 0.3), ext = S * 0.075, w = Math.ceil(textW + pad * 2), h = Math.ceil(capH + pad * 2), bounds = [], i;
    for (i = 0; i <= WORD.length; i++) bounds.push(pad + probe.measureText(WORD.slice(0, i)).width * sx + (i ? ext * 0.4 : 0));
    function layer() { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
    function text(g, lw, style) {
      g.save(); g.translate(pad, pad + capH); g.scale(sx, 1); g.font = wordFont(S); g.lineJoin = 'round';
      if (lw) { g.lineWidth = lw; g.strokeStyle = style; g.strokeText(WORD, 0, 0); } else { g.fillStyle = style; g.fillText(WORD, 0, 0); }
      g.restore();
    }
    function grad(g, stops) { var gr = g.createLinearGradient(0, -capH, 0, 0); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
    function tinted(src, col) { var cv = layer(), g = cv.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, w, h); return cv; }
    var mask = layer(), mg = mask.getContext('2d');
    text(mg, 0, '#fff');
    // the face: a dark letter, a dark inner line, and a bright bevelled edge (steel when unlit, white neon when lit)
    function face(lit) {
      var cv = layer(), g = cv.getContext('2d');
      text(g, 0, grad(g, lit ? [[0, '#2a2f35'], [1, '#14171a']] : [[0, '#1d2025'], [1, '#0d0f11']]));
      g.globalCompositeOperation = 'source-atop';
      text(g, S * 0.15, '#07080a');
      text(g, S * 0.095, lit ? '#ffffff' : grad(g, [[0, '#b4bbc2'], [0.55, '#6b737b'], [1, '#41474d']]));
      return cv;
    }
    function band() { var cv = layer(), g = cv.getContext('2d'); text(g, S * 0.095, '#fff'); g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0); return cv; }
    function compose(lit) {
      var cv = layer(), g = cv.getContext('2d'), back = tinted(mask, lit ? '#1c2127' : '#121519'), rim = tinted(mask, lit ? '#8e98a2' : '#4f575f'), N = 12;
      for (var k = N; k >= 1; k--) g.drawImage(k <= 2 ? rim : back, ext * 0.45 * k / N, ext * k / N);
      g.drawImage(face(lit), 0, 0);
      if (lit) {   // the neon glow around each letter's edge
        var b = band();
        g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = 'rgba(214,232,255,0.9)'; g.shadowBlur = S * 0.14;
        g.globalAlpha = 0.55; g.drawImage(b, 0, 0); g.drawImage(b, 0, 0);
        g.restore();
      }
      return cv;
    }
    function reflect(src) {   // the same letters mirrored on the glossy deck, fading away from the baseline
      var base = pad + capH, cv = document.createElement('canvas'), g;
      cv.width = w; cv.height = Math.ceil(base + capH * 0.85); g = cv.getContext('2d');
      g.save(); g.translate(0, base * 2); g.scale(1, -1); g.drawImage(src, 0, 0); g.restore();
      g.globalCompositeOperation = 'destination-in';
      var gr = g.createLinearGradient(0, base, 0, base + capH * 0.8);
      gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, cv.height);
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(0, 0, w, base);   // nothing above the deck line
      return cv;
    }
    var dark = compose(false), lit = compose(true);
    // LED tiles: a grid over the letters, one tile where a cell is mostly inside a letter
    var data = mg.getImageData(0, 0, w, h).data, gs = capH / 8, tiles = [], land = [], ww = W_CAP * textW / capH, tx, ty, a2, b2;
    for (i = 0; i < WORD.length; i++) land.push(0);
    for (ty = pad; ty < pad + capH - 1; ty += gs) {
      for (tx = pad; tx < pad + textW - 1; tx += gs) {
        var cov = 0;
        for (a2 = 0; a2 < 4; a2++) for (b2 = 0; b2 < 4; b2++) {
          var px2 = Math.min(w - 1, Math.floor(tx + (a2 + 0.5) * gs / 4)), py2 = Math.min(h - 1, Math.floor(ty + (b2 + 0.5) * gs / 4));
          if (data[(py2 * w + px2) * 4 + 3] > 127) cov++;
        }
        if (cov < 7) continue;
        var u = tx + gs / 2, v = ty + gs / 2, li = 0;
        while (li < WORD.length - 1 && u > bounds[li + 1]) li++;
        var jit = (Math.sin(u * 12.9898 + v * 78.233) * 43758.5453) % 1;
        var t0 = LG.tiles[0] + ((u - pad) / textW) * 0.85 + Math.abs(jit) * 0.12;
        tiles.push({ x: -ww / 2 + (u - pad) / textW * ww, y: (pad + capH - v) / capH * W_CAP, t0: t0, li: li });
        land[li] = Math.max(land[li], t0 + 0.42);
      }
    }
    return { dark: dark, lit: lit, reflD: reflect(dark), reflL: reflect(lit), w: w, h: h, pad: pad, capH: capH, textW: textW, WW: ww,
      bounds: bounds, tiles: tiles, land: land, tile: gs / capH * W_CAP * 0.84 };
  }
  function wordData() { if (!WD) { try { WD = buildWord(); } catch (e) { WD = null; } } return WD; }
  function wordWidth() { return WD ? WD.WW : W_CAP * W_RATIO; }

  /* ---- The logo camera: close on the U in the air, down with it, then front-on; aside under the title ---- */
  var LCAM = [
    { t: 0,   target: [0, 10.2, 0],   d: 0.68,  yaw: -30, pitch: 9 },
    { t: 2.4, target: [0, 11.7, 0],   d: 0.74,  yaw: -16, pitch: 7 },
    { t: 3.0, target: [0, 11.2, 0.4], d: 0.8,   yaw: -12, pitch: 6 },
    { t: 4.6, target: [0, 5.6, 1.6],  d: 0.97,  yaw: -3,  pitch: 3.5 },
    { t: 5.6, target: [0, 5.2, 2.0],  d: 1.0,   yaw: 0,   pitch: 3 },
    { t: 8.7, target: [0, 5.2, 2.0],  d: 0.985, yaw: 0,   pitch: 3 }
  ];
  var LFOV = 38 * DEG, LHOLD = { W: 0, H: 0, WW: 0 };
  function fitLogo() {
    var WW = wordWidth();
    if (LHOLD.W === W && LHOLD.H === H && LHOLD.WW === WW) return LHOLD;
    // the hold keeps clear of the header and act labels above and the readout below: 70 % of the height, centred a little low
    var aspect = W / H, ty = Math.tan(LFOV / 2), tx = ty * aspect, fx = aspect < 1 ? 0.92 : 0.86, fy = 0.68, half = WW / 2 + 0.6, py0 = H * 0.535;
    var D = Math.max(half / (tx * fx) + (W_Z - 2), 5.4 / (ty * fy) + (W_Z - 2), (U_TOP + 0.4 - 5.2) / (ty * fy) - 2);
    var c = camFrom({ target: [0, 5.2, 2], dist: D * 0.985, yaw: 0, pitch: 3 * DEG, f: (H / 2) / ty, px: W / 2, py: py0 }, 0.3);
    pj(c, 0, U_TOP, 0); var top = PY;
    pj(c, 0, 0, W_Z); var bot = PY;
    pj(c, -WW / 2, 0, W_Z); var left = PX;
    pj(c, WW / 2, 0, W_Z); var right = PX;
    // where the logo settles under the title card: the upper right on wide screens, the top on tall ones
    var goal = aspect >= 1.25 ? { x: 0.72, y: 0.37, h: 0.28 } : aspect >= 1 ? { x: 0.5, y: 0.34, h: 0.24 } : { x: 0.5, y: 0.34, w: 0.8 };
    LHOLD = { W: W, H: H, WW: WW, D: D, py0: py0, from: [W / 2, (top + bot) / 2], to: [goal.x * W, goal.y * H],
      s: goal.h ? Math.min(1, goal.h * H / (bot - top)) : Math.min(1, goal.w * W / (right - left)) };
    return LHOLD;
  }
  function logoCam(t) {
    var F = fitLogo(), i = 0;
    while (i < LCAM.length - 1 && t >= LCAM[i + 1].t) i++;
    var a = LCAM[i], b = LCAM[Math.min(i + 1, LCAM.length - 1)], u = a === b ? 0 : inOut(clamp((t - a.t) / (b.t - a.t), 0, 1));
    var k = inOut(span(t, LG.settle)), sc = lerp(1, F.s, k), cx = lerp(F.from[0], F.to[0], k), cy = lerp(F.from[1], F.to[1], k);
    return camFrom({
      target: lerp3(a.target, b.target, u), dist: F.D * Math.exp(lerp(Math.log(a.d), Math.log(b.d), u)),
      yaw: lerp(a.yaw, b.yaw, u) * DEG, pitch: lerp(a.pitch, b.pitch, u) * DEG,
      f: (H / 2) / Math.tan(LFOV / 2) * sc, px: cx + (W / 2 - F.from[0]) * sc, py: cy + (F.py0 - F.from[1]) * sc
    }, 0.3);
  }

  /* ---- The set: stars, the dark stage behind, a glossy deck, one lime work light ---- */
  var LSTARS = (function () { seed = 7171; var s = []; for (var i = 0; i < 110; i++) s.push([rnd(), Math.pow(rnd(), 1.4) * 0.55, 0.25 + rnd() * 0.75]); return s; })();
  function seg3(c, a, b) {
    if (!pj(c, a[0], a[1], a[2])) return;
    var x0 = PX, y0 = PY;
    if (!pj(c, b[0], b[1], b[2])) return;
    ctx.moveTo(x0, y0); ctx.lineTo(PX, PY);
  }
  function quad3(c, pts) {   // a filled quad; false when it is behind the camera
    ctx.beginPath();
    for (var i = 0; i < 4; i++) { if (!pj(c, pts[i][0], pts[i][1], pts[i][2])) return false; if (i) ctx.lineTo(PX, PY); else ctx.moveTo(PX, PY); }
    ctx.closePath();
    return true;
  }
  function drawLogoSet(t, c, neon, lit) {
    var d = dpr, i;
    // stars
    ctx.fillStyle = rgba(INK, 0.5);
    for (i = 0; i < LSTARS.length; i++) {
      var st = LSTARS[i], s = (st[2] > 0.8 ? 1.6 : 1) * d;
      ctx.globalAlpha = st[2] * 0.55 * (1 - st[1] * 1.3);
      ctx.fillRect(st[0] * W, st[1] * H, s, s);
    }
    ctx.globalAlpha = 1;
    // the deck: a glossy black floor from the back of the stage to the front edge, with panel seams
    if (pj(c, -60, 0, -11)) {
      var yb = PY;
      pj(c, 60, 0, -11);
      var yb2 = PY, top = Math.min(yb, yb2);
      if (top < H) {
        var gr = ctx.createLinearGradient(0, top, 0, H);
        gr.addColorStop(0, '#121418'); gr.addColorStop(0.35, '#0b0c0e'); gr.addColorStop(1, '#060607');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.moveTo(0, yb); ctx.lineTo(W, yb2); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = rgba(INK, 0.045); ctx.lineWidth = d;
      ctx.beginPath();
      for (var x = -22; x <= 22; x += 2) seg3(c, [x, 0, -11], [x, 0, 11]);
      for (var z = -11; z <= 11; z += 1.25) seg3(c, [-22, 0, z], [22, 0, z]);
      ctx.stroke();
    }
    // the stage behind, dark: two towers, the roof beam, an LED wall resting black
    var wall = [[-13.5, 2.6, -9.6], [13.5, 2.6, -9.6], [13.5, 17.4, -9.6], [-13.5, 17.4, -9.6]];
    if (quad3(c, wall)) {
      ctx.fillStyle = '#0e0f12'; ctx.fill();
      ctx.strokeStyle = rgba(INK, 0.035); ctx.lineWidth = d;
      ctx.beginPath();
      for (i = 1; i < 18; i++) seg3(c, [-13.5 + i * 1.5, 2.6, -9.6], [-13.5 + i * 1.5, 17.4, -9.6]);
      for (i = 1; i < 10; i++) seg3(c, [-13.5, 2.6 + i * 1.48, -9.6], [13.5, 2.6 + i * 1.48, -9.6]);
      ctx.stroke();
      if (neon > 0 && pj(c, 0, 8, -9.6)) glowDot(PX, PY, 9.5 * c.f / PZ, [150, 185, 230], 0.16 * neon);
    }
    ctx.strokeStyle = rgba(INK, 0.12); ctx.lineWidth = d;
    ctx.beginPath();
    [-17, 17].forEach(function (tx) {
      for (var e = 0; e < 4; e++) { var ex = tx + (e & 1 ? 0.4 : -0.4), ez = -9 + (e & 2 ? 0.4 : -0.4); seg3(c, [ex, 0, ez], [ex, 22.8, ez]); }
      for (var y = 0; y < 22.8; y += 1.2) { seg3(c, [tx - 0.4, y, -9.4], [tx + 0.4, y + 1.2, -9.4]); seg3(c, [tx - 0.4, y, -8.6], [tx + 0.4, y + 1.2, -8.6]); }
    });
    for (i = 0; i < 4; i++) { var by = 22.8 + (i & 1 ? 0.9 : 0), bz = -9 + (i & 2 ? 0.45 : -0.45); seg3(c, [-17, by, bz], [17, by, bz]); }
    for (var bx = -17; bx < 17; bx += 1.2) seg3(c, [bx, 22.8, -9.45], [bx + 1.2, 23.7, -9.45]);
    ctx.stroke();
    // the lime work light, far back on the deck: the only lime in the frame
    if (pj(c, -12.5, 0, -4.5)) {
      var fx0 = PX, fy0 = PY, r0 = 3.2 * c.f / PZ;
      ctx.save(); ctx.translate(fx0, fy0); ctx.scale(1, 0.22); glowDot(0, 0, r0, LIME, 0.2); ctx.restore();
      ctx.strokeStyle = rgba(INK, 0.3); ctx.lineWidth = 1.2 * d;
      ctx.beginPath(); seg3(c, [-12.5, 0, -4.5], [-12.5, 1.9, -4.5]); seg3(c, [-12.9, 0, -4.1], [-12.5, 0.5, -4.5]); seg3(c, [-12.1, 0, -4.1], [-12.5, 0.5, -4.5]); ctx.stroke();
      if (pj(c, -12.5, 2.0, -4.5)) { glowDot(PX, PY, 0.9 * c.f / PZ, LIME, 0.9); ctx.fillStyle = rgba(LIME, 1); ctx.fillRect(PX - 1.5 * d, PY - 1.5 * d, 3 * d, 3 * d); }
    }
    // the neon's light on the deck and the riser, and the letters' light on the deck
    if (neon > 0 && pj(c, 0, 0, 1.8)) {
      ctx.save(); ctx.translate(PX, PY); ctx.scale(1, 0.2); glowDot(0, 0, 7 * c.f / PZ, [190, 215, 255], 0.2 * neon); ctx.restore();
    }
    if (lit > 0 && pj(c, 0, 0, W_Z + 0.6)) {
      ctx.save(); ctx.translate(PX, PY); ctx.scale(1, 0.12); glowDot(0, 0, wordWidth() * 0.62 * c.f / PZ, [205, 225, 255], 0.22 * lit); ctx.restore();
    }
  }
  function drawRiser(c, neon) {
    var X = RISER.x, Y = RISER.y, Z = RISER.z;
    var faces = [
      { p: [[-X, 0, Z], [X, 0, Z], [X, Y, Z], [-X, Y, Z]], n: [0, 0, 1], col: '#101215' },
      { p: [[-X, Y, Z], [X, Y, Z], [X, Y, -Z], [-X, Y, -Z]], n: [0, 1, 0], col: '#1a1d21' },
      { p: [[-X, 0, -Z], [-X, 0, Z], [-X, Y, Z], [-X, Y, -Z]], n: [-1, 0, 0], col: '#0b0c0e' },
      { p: [[X, 0, Z], [X, 0, -Z], [X, Y, -Z], [X, Y, Z]], n: [1, 0, 0], col: '#0b0c0e' }
    ];
    faces.forEach(function (f) {
      var q = f.p[0];
      if (dot(f.n, sub(c.pos, q)) <= 0) return;
      if (quad3(c, f.p)) { ctx.fillStyle = f.col; ctx.fill(); }
    });
    ctx.strokeStyle = rgba([205, 212, 220], 0.4 + 0.3 * neon); ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath(); seg3(c, [-X, Y, Z], [X, Y, Z]); ctx.stroke();
    ctx.strokeStyle = rgba(INK, 0.12); ctx.lineWidth = dpr;
    ctx.beginPath(); seg3(c, [-X, 0, Z], [X, 0, Z]); ctx.stroke();
  }
  function drawHoists(t, c, ly) {
    var land = LG.lower[1], a = 1 - span(t, [land + 1.0, land + 1.6]);
    if (a <= 0) return;
    var rise = inOut(span(t, [land + 0.45, land + 1.6])) * 10, d = dpr;
    [-1, 1].forEach(function (sd) {
      var x = sd * U_ARM, yb = U_TOP + ly + 0.35 + rise, sag = t > land ? 0.45 * smooth(span(t, [land, land + 0.4])) * (1 - rise / 10) : 0;
      ctx.beginPath();
      var first = true;
      for (var i = 0; i <= 10; i++) {
        var u = i / 10, y = lerp(30, yb, u), xx = x + sd * sag * Math.sin(u * Math.PI) * 0.8;
        if (!pj(c, xx, y, 0)) { first = true; continue; }
        if (first) { ctx.moveTo(PX, PY); first = false; } else ctx.lineTo(PX, PY);
      }
      ctx.strokeStyle = rgba([8, 9, 11], a); ctx.lineWidth = Math.max(1.5 * d, 0.09 * c.f / Math.max(1, PZ)); ctx.stroke();
      ctx.setLineDash([3 * d, 2.5 * d]);
      ctx.strokeStyle = rgba([150, 158, 166], 0.8 * a); ctx.lineWidth = Math.max(1 * d, 0.05 * c.f / Math.max(1, PZ)); ctx.stroke();
      ctx.setLineDash([]);
      if (pj(c, x, yb, 0)) {   // the hook and shackle
        ctx.strokeStyle = rgba([175, 182, 190], 0.9 * a); ctx.lineWidth = 1.4 * d;
        ctx.beginPath(); ctx.arc(PX, PY + 0.2 * c.f / PZ, Math.max(2 * d, 0.2 * c.f / PZ), 0, Math.PI * 2); ctx.stroke();
      }
    });
  }

  /* ---- The steel U ---- */
  var U_LIGHT = norm([-0.5, 0.7, 0.6]);
  function strokeRail(key, closed) {   // append every section's polyline for this rail to the current path
    for (var k = 0; k < USEC.length; k++) {
      var arr = USEC[k].P[key], first = true;
      if (!arr) continue;
      for (var i = 0; i < arr.length; i += 2) {
        var x = arr[i], y = arr[i + 1];
        if (x !== x) { first = true; continue; }
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
    }
  }
  function strokeLacing(list) {
    for (var k = 0; k < list.length; k++) {
      var L = list[k].LP;
      if (!L) continue;
      for (var i = 0; i < L.length; i += 4) { ctx.moveTo(L[i], L[i + 1]); ctx.lineTo(L[i + 2], L[i + 3]); }
    }
  }
  function capLines(S, at) {   // the closed top end of an arm (the first or last sample of a section)
    var j = at * 2, P = S.P;
    [['OF', 'IF'], ['OB', 'IB'], ['OF', 'OB'], ['IF', 'IB']].forEach(function (e) {
      var a = P[e[0]], b = P[e[1]];
      if (a[j] !== a[j] || b[j] !== b[j]) return;
      ctx.moveTo(a[j], a[j + 1]); ctx.lineTo(b[j], b[j + 1]);
    });
  }
  function drawU(t, c, ly, steel, neon) {
    var d = dpr, k, i, S, all = USEC.concat([UGAP]);
    for (k = 0; k < USEC.length; k++) projSection(USEC[k], t, ly, c);
    UGAP.k = secXf(UGAP, t, ly); UGAP.a = smooth(clamp((t - UGAP.t0) / 0.2, 0, 1)); projLacing(UGAP, c);
    if (!pj(c, 0, 7 + ly, 0)) return;
    var sc = c.f / PZ, cy0 = PY;
    pj(c, 0, U_TOP + ly, 0); var yTop = PY;
    pj(c, 0, U_BASE + ly, 0); var yBot = PY;
    pj(c, -U_ARM - U_HALF, 7 + ly, 0); var xL = PX;
    pj(c, U_ARM + U_HALF, 7 + ly, 0); var xR = PX;
    var wire = 1 - steel;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 1. The CAD wireframe (while it is built), in the build's trade colours
    if (wire > 0) {
      for (k = 0; k < all.length; k++) {
        S = all[k];
        if (S.a <= 0) continue;
        var fly = S.k < 1, a = S.a * wire;
        ctx.globalAlpha = a;
        if (S !== UGAP) {
          ctx.strokeStyle = rgba(TEAL, fly ? 0.7 : 0.95); ctx.lineWidth = 1.3 * d;
          ctx.beginPath(); strokeOne(S, 'OF'); strokeOne(S, 'IF'); if (S === USEC[0]) capLines(S, 0); if (S === USEC[7]) capLines(S, (S.P.OF.length / 2) - 1); ctx.stroke();
          ctx.strokeStyle = rgba(TEAL, 0.55); ctx.lineWidth = d;
          ctx.beginPath(); strokeOne(S, 'ORF'); strokeOne(S, 'IRF'); strokeOne(S, 'OB'); strokeOne(S, 'IB'); ctx.stroke();
          ctx.strokeStyle = rgba(LIME, 0.9); ctx.lineWidth = 1.2 * d;
          ctx.beginPath(); strokeOne(S, 'N'); ctx.stroke();
          // the section's box edges, front to back, at both ends
          ctx.strokeStyle = rgba(TEAL, 0.4); ctx.lineWidth = d;
          ctx.beginPath(); rungs(S); ctx.stroke();
        }
        ctx.strokeStyle = rgba(VIOLET_LINE, 0.75); ctx.lineWidth = d;
        ctx.beginPath(); strokeLacing([S]); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // pins: a lime flash at each joint as the second of its two sections lands
      ctx.globalCompositeOperation = 'lighter';
      for (k = 1; k < USEC.length; k++) {
        var tl = Math.max(USEC[k - 1].t1, USEC[k].t1), fa = t >= tl ? (1 - span(t, [tl, tl + 0.45])) * wire : 0;
        if (fa <= 0) continue;
        var P = USEC[k].P;
        [P.OF, P.IF].forEach(function (arr) { if (arr[0] === arr[0]) glowDot(arr[0], arr[1], 12 * d, LIME, fa); });
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // 2. Brushed steel
    if (steel > 0) {
      ctx.globalAlpha = steel;
      var lit = neon, camPos = c.pos;
      // the back of the channel, and the inside faces of its walls that face the camera
      for (k = 0; k < USEC.length; k++) wallFaces(USEC[k], c, camPos, ly, 'back', lit);
      for (k = 0; k < USEC.length; k++) wallFaces(USEC[k], c, camPos, ly, 'inside', lit);
      railSteel('OB', 0.16, sc, yTop, yBot, 0.55);
      railSteel('IB', 0.16, sc, yTop, yBot, 0.55);
      // the lacing inside the channel and the X truss across the gap
      ctx.strokeStyle = '#07080a'; ctx.lineWidth = Math.max(1.2 * d, 0.1 * sc);
      ctx.beginPath(); strokeLacing(all); ctx.stroke();
      ctx.strokeStyle = steelGrad(yTop, yBot, 0.75 + 0.25 * lit); ctx.lineWidth = Math.max(0.8 * d, 0.065 * sc);
      ctx.beginPath(); strokeLacing(all); ctx.stroke();
      // the neon tube: clear glass until it strikes
      ctx.strokeStyle = 'rgba(190,200,212,0.3)'; ctx.lineWidth = Math.max(1 * d, 0.1 * sc);
      ctx.beginPath(); strokeRail('N'); ctx.stroke();
      if (lit > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        [[0.95, [150, 190, 255], 0.07], [0.4, [195, 222, 255], 0.2], [0.15, [235, 244, 255], 0.75], [0.065, [255, 255, 255], 1]].forEach(function (L) {
          ctx.strokeStyle = rgba(L[1], L[2] * lit * steel); ctx.lineWidth = Math.max(1 * d, L[0] * sc);
          ctx.beginPath(); strokeRail('N'); ctx.stroke();
        });
        ctx.restore();
      }
      // the outside faces of the walls and the top ends, then the front frame
      for (k = 0; k < USEC.length; k++) wallFaces(USEC[k], c, camPos, ly, 'outside', lit);
      railSteel('ORF', 0.12, sc, yTop, yBot, 0.85);
      railSteel('IRF', 0.12, sc, yTop, yBot, 0.85);
      railSteel('OF', 0.2, sc, yTop, yBot, 1);
      railSteel('IF', 0.2, sc, yTop, yBot, 1);
      if (lit > 0) {   // the inner rails catch the neon
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba([205, 225, 255], 0.3 * lit * steel); ctx.lineWidth = Math.max(1 * d, 0.07 * sc);
        ctx.beginPath(); strokeRail('ORF'); strokeRail('IRF'); ctx.stroke();
        ctx.restore();
      }
      joints(sc, steel);
      sheen(t, xL, xR, sc, steel);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function strokeOne(S, key) {
    var arr = S.P[key], first = true;
    for (var i = 0; i < arr.length; i += 2) {
      var x = arr[i], y = arr[i + 1];
      if (x !== x) { first = true; continue; }
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
  }
  function rungs(S) {
    var P = S.P, n = P.OF.length;
    [0, n - 2].forEach(function (j) {
      [['OF', 'OB'], ['IF', 'IB'], ['OF', 'IF'], ['OB', 'IB']].forEach(function (e) {
        var a = P[e[0]], b = P[e[1]];
        if (a[j] !== a[j] || b[j] !== b[j]) return;
        ctx.moveTo(a[j], a[j + 1]); ctx.lineTo(b[j], b[j + 1]);
      });
    });
  }
  function steelGrad(y0, y1, k) {
    var g = ctx.createLinearGradient(0, y0, 0, y1 + (y1 - y0) * 0.1);
    g.addColorStop(0, rgba(mix([96, 104, 112], [228, 233, 237], k), 1));
    g.addColorStop(0.45, rgba(mix([60, 66, 72], [150, 158, 166], k), 1));
    g.addColorStop(0.6, rgba(mix([45, 50, 55], [110, 118, 126], k), 1));
    g.addColorStop(1, rgba(mix([28, 31, 35], [74, 80, 87], k), 1));
    return g;
  }
  function railSteel(key, wm, sc, y0, y1, k) {
    var w = Math.max(1.2 * dpr, wm * sc);
    ctx.strokeStyle = '#050607'; ctx.lineWidth = w * 1.4;
    ctx.beginPath(); strokeRail(key); ctx.stroke();
    ctx.strokeStyle = steelGrad(y0, y1, k); ctx.lineWidth = w;
    ctx.beginPath(); strokeRail(key); ctx.stroke();
    ctx.save(); ctx.translate(-w * 0.18, -w * 0.22);
    ctx.strokeStyle = rgba([246, 248, 250], 0.42 * k); ctx.lineWidth = Math.max(0.6 * dpr, w * 0.22);
    ctx.beginPath(); strokeRail(key); ctx.stroke();
    ctx.restore();
  }
  function wallFaces(S, c, camPos, ly, which, lit) {
    var P = S.P, n = P.OF.length / 2, i;
    for (i = 0; i < n - 1; i++) {
      var q = UPATH[S.i0 + i], q2 = UPATH[S.i0 + i + 1], nx = (q.nx + q2.nx) / 2, ny = (q.ny + q2.ny) / 2;
      var px = (q.x + q2.x) / 2, py = (q.y + q2.y) / 2 + ly, vx = camPos[0] - px, vy = camPos[1] - py;
      if (which === 'back') {
        polyFill(P.OB, P.IB, i, lit > 0 ? rgba(mix([13, 15, 18], [34, 42, 52], lit), 1) : '#0d0f12');
        continue;
      }
      // the outer wall (at +half) faces out along n; the inner wall (at -half) faces out along -n
      var outerOut = nx * vx + ny * vy > 0;
      if (which === 'outside') {
        if (outerOut) polyFill(P.OF, P.OB, i, shadeSteel(nx, ny, 0.9));
        else polyFill(P.IF, P.IB, i, shadeSteel(-nx, -ny, 0.9));
      } else {
        var inCol = lit > 0 ? rgba(mix([22, 25, 29], [52, 62, 74], lit), 1) : '#16191d';
        if (outerOut) polyFill(P.IF, P.IB, i, inCol); else polyFill(P.OF, P.OB, i, inCol);
      }
    }
    if (which === 'outside') {   // the flat tops of the two arms
      if (S === USEC[0]) capFill(S, 0);
      if (S === USEC[USEC.length - 1]) capFill(S, n - 1);
    }
  }
  function shadeSteel(nx, ny, k) {
    var l = clamp(0.35 + 0.65 * (nx * U_LIGHT[0] + ny * U_LIGHT[1]), 0, 1) * k;
    return rgba(mix([30, 34, 38], [150, 158, 166], l), 1);
  }
  function polyFill(A, B, i, col) {
    var j = i * 2;
    if (A[j] !== A[j] || A[j + 2] !== A[j + 2] || B[j] !== B[j] || B[j + 2] !== B[j + 2]) return;
    ctx.beginPath(); ctx.moveTo(A[j], A[j + 1]); ctx.lineTo(A[j + 2], A[j + 3]); ctx.lineTo(B[j + 2], B[j + 3]); ctx.lineTo(B[j], B[j + 1]); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  }
  function capFill(S, i) {
    var P = S.P, j = i * 2;
    if (P.OF[j] !== P.OF[j] || P.OB[j] !== P.OB[j]) return;
    ctx.beginPath(); ctx.moveTo(P.OF[j], P.OF[j + 1]); ctx.lineTo(P.IF[j], P.IF[j + 1]); ctx.lineTo(P.IB[j], P.IB[j + 1]); ctx.lineTo(P.OB[j], P.OB[j + 1]); ctx.closePath();
    ctx.fillStyle = '#6d757d'; ctx.fill();
  }
  function joints(sc, k) {   // bolted plates across the front frame where the sections meet
    var d = dpr, w = Math.max(1.5 * d, 0.24 * sc);
    ctx.lineCap = 'butt';
    for (var s = 1; s < USEC.length; s++) {
      var P = USEC[s].P;
      [['OF', 'ORF'], ['IF', 'IRF']].forEach(function (e) {
        var a = P[e[0]], b = P[e[1]];
        if (a[0] !== a[0] || b[0] !== b[0]) return;
        ctx.strokeStyle = '#050607'; ctx.lineWidth = w * 1.5;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = rgba([176, 184, 192], k); ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.fillStyle = rgba([20, 22, 25], k);
        [0.3, 0.7].forEach(function (u) { var bx = lerp(a[0], b[0], u), by = lerp(a[1], b[1], u), r = Math.max(0.8 * d, 0.045 * sc); ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); });
      });
    }
    ctx.lineCap = 'round';
  }
  function sheen(t, xL, xR, sc, k) {   // a band of light running across the steel: once as it turns to steel, once after the letters light
    var p = span(t, LG.steel), q = span(t, [LG.letters[1], LG.letters[1] + 1.1]), pos = p > 0 && p < 1 ? p : q > 0 && q < 1 ? q : -1;
    if (pos < 0) return;
    var x = lerp(xL - (xR - xL) * 0.3, xR + (xR - xL) * 0.3, pos), wB = (xR - xL) * 0.18;
    var g = ctx.createLinearGradient(x - wB, 0, x + wB, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, rgba([255, 255, 255], 0.5 * k)); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(1 * dpr, 0.14 * sc);
    ctx.beginPath(); strokeRail('OF'); strokeRail('IF'); strokeRail('ORF'); strokeRail('IRF'); ctx.stroke();
    ctx.restore();
  }

  /* ---- The word ---- */
  function drawWord(t, c) {
    if (t < LG.tiles[0]) return 0;
    var D = wordData();
    if (!D) return 0;
    var WW = D.WW, i;
    if (!pj(c, -WW / 2, W_CAP, W_Z)) return 0;
    var xl = PX, yt = PY;
    if (!pj(c, WW / 2, 0, W_Z)) return 0;
    var xr = PX, yb = PY, sx = (xr - xl) / D.textW, sy = (yb - yt) / D.capH, ox = xl - D.pad * sx, oy = yt - D.pad * sy;
    var res = [], lit = [], landed = 0, litN = 0;
    for (i = 0; i < WORD.length; i++) {
      res.push(smooth(span(t, [D.land[i], D.land[i] + 0.35])));
      lit.push(letterLit(i, t));
      if (lit[i] > 0.5) litN++;
    }
    // reflections on the deck, then the letters
    slices(D.reflD, ox, oy, sx, sy, function (k) { return res[k] * (1 - lit[k]); }, D);
    slices(D.reflL, ox, oy, sx, sy, function (k) { return res[k] * lit[k]; }, D);
    // the LED tiles, rising out of the deck
    if (t < LG.tiles[1] + 0.6) {
      var d = dpr;
      for (i = 0; i < D.tiles.length; i++) {
        var T0 = D.tiles[i], u = clamp((t - T0.t0) / 0.42, 0, 1);
        if (u <= 0) continue;
        if (u >= 1) landed++;
        var a = smooth(clamp(u * 3, 0, 1)) * (1 - res[T0.li]);
        if (a <= 0.01) continue;
        if (!pj(c, T0.x, T0.y - (1 - outCubic(u)) * 1.6, W_Z)) continue;
        var s = D.tile * c.f / PZ;
        ctx.fillStyle = rgba([16, 19, 23], a); ctx.fillRect(PX - s / 2, PY - s / 2, s, s);
        ctx.strokeStyle = rgba(TEAL, 0.75 * a); ctx.lineWidth = d; ctx.strokeRect(PX - s / 2 + 0.5, PY - s / 2 + 0.5, s - 1, s - 1);
        ctx.fillStyle = rgba(LIME, 0.55 * a * (u < 1 ? 1 : 0.5)); ctx.fillRect(PX - d, PY - d, 2 * d, 2 * d);
      }
    } else landed = D.tiles.length;
    slices(D.dark, ox, oy, sx, sy, function (k) { return res[k]; }, D);
    slices(D.lit, ox, oy, sx, sy, function (k) { return res[k] * lit[k]; }, D);
    WSTAT.tiles = landed; WSTAT.total = D.tiles.length; WSTAT.lit = litN;
    return lit.reduce(function (s2, v) { return s2 + v; }, 0) / WORD.length;
  }
  var WSTAT = { tiles: 0, total: 0, lit: 0 };
  function slices(img, ox, oy, sx, sy, alphaOf, D) {
    var n = WORD.length, prevA = ctx.globalAlpha;
    for (var i = 0; i < n; i++) {
      var a = alphaOf(i);
      if (a <= 0.003) continue;
      var u0 = i ? D.bounds[i] : 0, u1 = i < n - 1 ? D.bounds[i + 1] : D.w;
      ctx.globalAlpha = prevA * Math.min(1, a);
      ctx.drawImage(img, u0, 0, u1 - u0, img.height, ox + u0 * sx, oy, (u1 - u0) * sx + 0.6, img.height * sy);
    }
    ctx.globalAlpha = prevA;
  }

  // The logo's readout, in the build's language: what is happening, in numbers of this model.
  function drawLogoReadout(t, ly) {
    var a = span(t, [0.45, 0.85]) * (1 - span(t, [LG.title - 0.5, LG.title - 0.1]));
    if (a <= 0) return;
    var d = dpr, x = Math.max(20 * d, (W - 1280 * d) / 2 + 32 * d), y = H - (W / d < 600 ? 84 : 30) * d, one, two, pins = 0, k;
    for (k = 1; k < USEC.length; k++) if (t >= Math.max(USEC[k - 1].t1, USEC[k].t1)) pins += 4;
    if (t < LG.lower[0]) { one = '04  STEEL U  ·  8 SECTIONS  ·  PINS ' + ('0' + pins).slice(-2) + ' / 28'; two = 'H 8.000   W 6.600   D 1.200   STAINLESS'; }
    else if (t < LG.tiles[0] + 0.2) { one = '04  CHAIN HOISTS  ·  2 / 2  ·  +' + Math.max(0, ly).toFixed(3); two = 'LANDING ON RISER  ·  +' + U_BASE.toFixed(3); }
    else if (t < LG.strike) { one = '04  LED TILES  ·  ' + ('00' + WSTAT.tiles).slice(-3) + ' / ' + ('00' + WSTAT.total).slice(-3); two = 'LETTERS  ·  CAP ' + W_CAP.toFixed(3); }
    else { one = '04  NEON  ·  ON  ·  LETTERS ' + ('0' + WSTAT.lit).slice(-2) + ' / ' + WORD.length; two = 'UNCONVENTIONAL'; }
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '500 ' + (10.5 * d).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = rgba(MUTED, 0.85 * a); ctx.fillText(two, x, y - 16 * d);
    ctx.fillStyle = rgba(LIME, 0.95 * a); ctx.fillText(one, x, y);
    ctx.restore();
  }

  function renderLogo(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    var c = logoCam(t), ly = liftAt(t), steel = smooth(span(t, LG.steel)), neon = neonAt(t);
    var litShare = 0;
    for (var i = 0; i < WORD.length; i++) litShare += letterLit(i, t);
    litShare /= WORD.length;
    drawLogoSet(t, c, neon, litShare);
    drawRiser(c, neon);
    drawHoists(t, c, ly);
    drawU(t, c, ly, steel, neon);
    drawWord(t, c);
    drawLogoReadout(t, ly);
  }

  /* ==========================================================================
     Film v3: the sequence player
     The film is a run of segments in one hero: footage clips (content/media.js
     slots film-s1-01 … film-s4-03) and canvas stretches. A scene plays as
     footage only when its clips are marked "ready" and load; otherwise it
     falls back to this canvas, so the film always plays:
       01 People          clips s1-01 … s1-08    fallback: the v2 prologue (canvas 0 → T.drawIn)
       02 Build           canvas T.drawIn → T.realCut (always), then clips s2-01 … s2-05
                          (no fallback needed: without them the canvas carries straight on)
       03 Arrival         clips s3-01 … s3-10    fallback: the power-up, crowd, fireworks, drones
                          and the team at FOH (canvas T.realCut → T.s3End)
       04 Unconventional  clips s4-01 … s4-03    fallback: the canvas logo above; the footage
                          version needs s4-03 (the lit hold), so the film always ends on the name;
                          under the title the hold dissolves into the owner's exact logo (EXACT)
     Joins: soft cuts inside a scene; the canvas dissolves into s2-01 on the
     match-cut frame (its lines linger in screen blend for 0.4 s); s1-08's
     paper turns dark with lime lines and dissolves into the canvas drawing;
     a hard cut from s2-05 to s3-01; a dip to black into scene 4.
     Clips are created as <video> elements when they are next (muted,
     playsinline, preload "metadata", then "auto" for the next clip while the
     current one plays) and let go of when done. A clip that errors, or does
     not load within WAIT_MAX seconds, is dropped; if autoplay is refused,
     the whole film falls back to the canvas.
     Loading: the clip on screen is played as soon as its element exists
     (iPhones and iPads buffer nothing before play(), so waiting for a frame
     first would wait forever); it stays invisible until it has a frame at
     the right place (or shows its poster at its start). Where a browser does
     not buffer the next clip on its own, that clip is warmed: played unseen,
     paused on its first frame, set back to its in point. A clip whose
     playhead stops (a network stall) for WAIT_MAX seconds is dropped too.
     Timing: `?film=SECONDS` is a time on this sequence (with no footage it is
     the same as the canvas time: 0 people, 11 build, 36 arrival, 41.6 logo).
     ========================================================================== */
  var XF = 0.22, WAIT_MAX = 8, STILLS = { wipe: [0.9, 2.5], title: 3.1, len: 3.5 };
  var FEATHER = 'linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)';   // must match .intro__still.is-fitw
  // The film ends on the owner's exact logo (slot film-s4-03 `exact`: brand/unconventional-logo.jpg copied pixel for
  // pixel into a 653×443 PNG, its dark backdrop feathered out over a 48 px margin). Under the title card the AI hold
  // (phones: the lit still) dissolves into it, registered on the U. EXACT: the U in that PNG (centre, width) and the
  // word's width, in its own pixels; EXREF: the U in the frame it replaces (the hold / the clip's end frame, and the
  // phones' 9:16 lit still), as fractions of that frame. It is never shown larger than its own pixels (see exactCap).
  // g0-g1: the dark gap between the U and the word (the PNG: U ends at row 315, the word starts at 341; the hold: 745 and
  // 752 of 1080). The two words sit at different heights, so below that line the old word goes out before the exact
  // one comes in (they are never seen double) while the U crossfades in place: see xfade. The canvas ending (no
  // footage: autoplay refused, or s4-03 lost) dissolves into the same PNG (logoX), registered on the canvas U.
  var SETTLE = 1.2, RESETTLE = 0.8, EXACT = { w: 653, h: 443, ux: 335.5, uy: 223.5, uw: 161, ww: 471, g0: 318, g1: 338, fade: 0.7 };
  var EXREF = { wide: { x: 0.5034, y: 0.4366, w: 0.2620, ar: 16 / 9, g0: 0.681, g1: 0.6945 }, tall: { x: 0.5019, y: 0.4820, w: 0.3722, ar: 9 / 16 } };
  // Captions under "An imagined brief" while scene 1 plays (site text: no shot depends on text in the footage).
  var CAPTIONS = {
    'film-s1-03': [[0, 'Brief · Site · Summit plateau']],
    'film-s1-04': [[0, 'Brief · Site · Summit plateau']],
    'film-s1-05': [[0, 'Brief · 100,000 guests · 3 nights · December'], [1.0, 'KPIs · Attendance · Sell-through · Reach · Dwell']],
    'film-s1-06': [[0, 'Sponsors · Title · Presenting · Partner'], [1.3, 'Campaign · Launch']]
  };
  var SCENES = [
    { act: 'people', brief: true, clips: ['film-s1-01', 'film-s1-02a', 'film-s1-02b', 'film-s1-03', 'film-s1-04', 'film-s1-05', 'film-s1-06', 'film-s1-07', 'film-s1-08'],
      fb: { world: 'stage', t0: 0, t1: T.drawIn } },
    { act: 'build', fb: { world: 'stage', t0: T.drawIn, t1: T.realCut } },
    { act: 'build', clips: ['film-s2-01', 'film-s2-02', 'film-s2-03', 'film-s2-03b', 'film-s2-04', 'film-s2-05'] },
    { act: 'arrival', clips: ['film-s3-01', 'film-s3-02', 'film-s3-03', 'film-s3-04', 'film-s3-05', 'film-s3-06', 'film-s3-07', 'film-s3-08', 'film-s3-09', 'film-s3-10'],
      fb: { world: 'stage', t0: T.realCut, t1: T.s3End } },
    { act: 'logo', clips: ['film-s4-01', 'film-s4-02', 'film-s4-03'], need: 'film-s4-03', fb: { world: 'logo', t0: 0, t1: Infinity } }
  ];

  var PHONE = false, FOOTAGE = true, CLIPS = {}, SEG = [], M_END = 1;
  // iOS / iPadOS (which reports itself as a Mac with touch) buffers a video only once it is played: warm every next clip.
  // Elsewhere a next clip is warmed only if it has had a second to buffer and still has no frame (then WARM_NEXT turns on).
  var WARM_NEXT = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var curSeg = null, prevSeg = null, loc = 0, ploc = 0, waitN = 0, zTop = 2;
  var mediaBox = null, vignette = null, tint = null, logoX = null;
  var captionEl = section.querySelector('[data-intro-caption]');

  function clipFor(name) {
    if (!FOOTAGE) return null;
    var c = CLIPS[name];
    if (c === undefined) {
      var s = slots[name];
      c = CLIPS[name] = s && s.type === 'video' && s.status === 'ready' && s.src ? {
        name: name, slot: s, src: PHONE && s.srcMobile ? s.srcMobile : s.src,
        in: Math.max(0, +s.in || 0), out: Math.max(0, +s.out || 0), dur: 0,
        el: null, meta: false, ready: false, done: false, failed: false, seekTo: -1, wait: 0,
        shown: false, posterOk: false, warm: false, lastT: -1, autoAt: 0,
        hold: null, end: null, over: null, dark: null, lit: null, exact: null, stillsOk: 0, stillsFailed: false, contain: false
      } : null;
      if (c) c.dur = c.out > c.in ? c.out - c.in : Math.max(0.5, +s.use || 3);
    }
    return c && !c.failed ? c : null;
  }
  function needMet(name) {
    var c = clipFor(name);
    return !!c;
  }
  function planSeq() {
    var out = [];
    SCENES.forEach(function (sc, si) {
      var list = [];
      if (sc.clips && (!sc.need || needMet(sc.need))) {
        sc.clips.forEach(function (name, ci) {
          var c = clipFor(name);
          if (!c) return;
          var stills = PHONE && c.slot.phoneStills && c.slot.phoneStills.length === 2 && !c.stillsFailed;
          if (PHONE && name === 'film-s4-03' && !stills) c.contain = true;   // no phone stills: show the whole frame, so the word is never cut
          list.push({ kind: stills ? 'stills' : 'clip', clip: c, name: name, scene: si, key: si * 100 + ci + 1 });
        });
      }
      if (!list.length && sc.fb) list.push({ kind: 'canvas', world: sc.fb.world, t0: sc.fb.t0, t1: sc.fb.t1, scene: si, key: si * 100 });
      list.forEach(function (g) { g.act = sc.act; g.brief = !!sc.brief && g.kind !== 'canvas'; out.push(g); });
    });
    for (var i = 0; i < out.length; i++) out[i].join = i ? joinOf(out[i - 1], out[i]) : joinT('none', 0);
    SEG = out;
    layout();
  }
  // A join: how one segment hands over to the next, and how long the two overlap.
  function joinT(type, d) { return { type: type, d: d, over: type === 'fade' || type === 'paper' || type === 'match' ? d : 0 }; }
  function joinOf(a, b) {
    if (a.kind === 'canvas' && b.kind === 'canvas' && a.world === b.world && a.t1 === b.t0) return joinT('none', 0);
    if (b.scene === 4 && a.scene !== 4) return joinT('dip', 0.5);   // a dip to black into the logo
    if (a.kind !== 'canvas' && b.kind !== 'canvas') return a.scene === b.scene ? joinT('fade', XF) : a.scene === 2 && b.scene === 3 ? joinT('cut', 0) : joinT('fade', 0.4);
    if (a.kind !== 'canvas') return a.name === 'film-s1-08' ? joinT('paper', 0.5) : joinT('fade', 0.6);
    return b.name === 'film-s2-01' ? joinT('match', 0.6) : joinT('fade', 0.6);
  }
  function segLen(g) { return g.kind === 'canvas' ? g.t1 - g.t0 : g.kind === 'stills' ? STILLS.len : g.clip.dur; }
  function layout() {
    var m = 0;
    SEG.forEach(function (g, i) { g.len = segLen(g); if (i) m -= g.join.over; g.m0 = m; m += g.len; });
    var L = SEG[SEG.length - 1];
    L.titleAt = L.kind === 'canvas' ? LG.title : L.kind === 'stills' ? STILLS.title : L.clip.dur + (L.clip.slot.hold ? 0.4 : 0);
    // (the film rests once it has settled aside and, if there is one, dissolved into the exact logo: see exactMix)
    L.restAt = L.kind === 'canvas' ? LG.settle[1] + 0.05 + (L.world === 'logo' && exactSrc() ? EXACT.fade : 0) : L.titleAt + SETTLE + 0.05 + (L.clip.slot.exact ? EXACT.fade : 0);
    M_END = L.m0 + L.titleAt;
  }
  function nextOf(g) { var i = SEG.indexOf(g); return i >= 0 ? SEG[i + 1] || null : null; }
  function isLast(g) { return g === SEG[SEG.length - 1]; }

  /* ---- Layers: the canvas and, when there is footage, <video> and <img> elements in one box ---- */
  function box() {
    if (mediaBox) return mediaBox;
    mediaBox = document.createElement('div');
    mediaBox.className = 'intro__media';
    mediaBox.setAttribute('aria-hidden', 'true');
    section.insertBefore(mediaBox, canvas);
    mediaBox.appendChild(canvas);
    vignette = document.createElement('div');
    vignette.className = 'intro__vignette';
    mediaBox.appendChild(vignette);
    vignette.style.zIndex = '100000';
    return mediaBox;
  }
  function raise(el) { if (el) el.style.zIndex = String(++zTop); }
  function setOp(el, a) {
    if (!el) return;
    var v = a <= 0.001 ? 0 : a >= 0.999 ? 1 : Math.round(a * 1000) / 1000;
    if (el._op !== v) { el.style.opacity = String(v); el._op = v; }
  }
  function img(src, cls, onload, onerror, srcset) {
    var im = document.createElement('img');
    im.className = cls; im.alt = ''; im.decoding = 'async';
    im.addEventListener('load', function () { im._ok = true; if (onload) onload(); if (!raf && curSeg) draw(); });   // (a held frame needs redrawing)
    im.addEventListener('error', function () { im._bad = true; if (onerror) onerror(); });
    if (srcset) im.srcset = srcset;
    im.src = src;
    box().appendChild(im);
    setOp(im, 0);
    return im;
  }
  // The owner's exact logo: an image, so it needs no autoplay (the canvas ending uses it too). A slot may add
  // `exact2x`, the same PNG at twice the size, for high-density screens (see exactCap).
  function exactSrc() { var s = slots['film-s4-03']; return s && s.exact ? s.exact : ''; }
  function exactImg(s) {
    var im = img(s.exact, 'intro__exact', function () {
      im._dens = s.exact2x && (im.currentSrc || '').indexOf(s.exact2x) >= 0 ? 2 : 1;
      late(im, '_at');
    }, function () { late(im, '_badAt'); }, s.exact2x ? s.exact + ' 1x, ' + s.exact2x + ' 2x' : '');
    return im;
  }
  function logoExact() { if (!logoX && exactSrc()) logoX = exactImg(slots['film-s4-03']); return logoX; }
  function exactOf(g) { return !g ? null : g.kind === 'canvas' ? (g.world === 'logo' ? logoX : null) : g.clip.exact; }
  // The exact logo arrived (or failed) after its moment, with the film under the title: its dissolve (or the frame's
  // re-settle) runs from now rather than cutting in, and the clock starts again for it. (With Pause motion it simply shows.)
  function late(im, key) {
    if (curSeg && isLast(curSeg) && exactOf(curSeg) === im && !paused()) im[key] = loc;
    kick();
    if (!raf && curSeg) draw();
  }
  function ensure(g, preload) {
    if (!g) return;
    if (g.kind === 'canvas') { if (g.world === 'logo') logoExact(); return; }
    var c = g.clip, s = c.slot;
    if (g.kind === 'stills') {
      if (!c.dark) {
        var ok = function () { c.stillsOk++; }, bad = function () { if (c.stillsFailed) return; c.stillsFailed = true; console.warn('[film] "' + c.name + '" phone stills did not load; playing the clip instead.'); replan(); };
        // the logo stills are shown across the full width (never cropped at the sides), feathered top and bottom
        c.dark = img(s.phoneStills[0], 'intro__still is-fitw', ok, bad);
        c.lit = img(s.phoneStills[1], 'intro__still is-fitw', ok, bad);
      }
      if (s.exact && !c.exact) c.exact = exactImg(s);
      return;
    }
    if (!c.el) makeVideo(c, preload);
    else if (preload === 'auto' && c.el.preload !== 'auto') { c.el.preload = 'auto'; c.autoAt = performance.now(); }
    if (s.hold && !PHONE && !c.hold) c.hold = img(s.hold, 'intro__still');
    if (s.phoneEnd && PHONE && !c.end) c.end = img(s.phoneEnd, 'intro__still');
    if (s.overlay && !c.over) c.over = img(s.overlay, 'intro__still is-screen');
    if (s.exact && !c.exact) c.exact = exactImg(s);
  }
  function makeVideo(c, preload) {
    var v = document.createElement('video'), s = c.slot;
    v.className = 'intro__clip' + (c.contain ? ' is-contain' : '');
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
    v.playsInline = true; v.setAttribute('playsinline', '');
    v.disablePictureInPicture = true; v.tabIndex = -1; v.setAttribute('aria-hidden', 'true');
    v.preload = preload || 'metadata';
    c.autoAt = v.preload === 'auto' ? performance.now() : 0;
    c.warm = c.shown = false; arm(c);
    // the poster is the 16:9 keyframe: a phone strip is cut off-centre (at `focus`), so it gets none and stays dark
    // until its first frame, instead of showing a centred poster that jumps sideways when the video starts
    if (s.poster && c.src === s.src) v.poster = s.poster;
    if (typeof s.focus === 'number' && c.src === s.src) v.style.objectPosition = (clamp(s.focus, 0, 1) * 100).toFixed(1) + '% 50%';
    // ready: a frame at the right place is decoded (on iOS that only happens once the clip has been played)
    function check() {
      if (!c.meta || v.readyState < 2 || v.seeking) return;
      c.ready = true;
      if (!c.shown) { c.shown = true; if (!raf && c.el === v && onScreen(c)) draw(); }   // a held frame (the paused still) shows it too
    }
    v.addEventListener('playing', function () {
      if (c.warm) {
        c.warm = false;
        if (c.meta && !onScreen(c)) {   // a warmed next clip: keep its first frame, back at the in point
          v.pause();
          if (Math.abs(v.currentTime - c.in) > 0.02) v.currentTime = c.in;
          c.ready = c.shown = true;
          return;
        }
      }
      check();
    });
    v.addEventListener('timeupdate', check);
    v.addEventListener('waiting', function () { c.ready = false; });   // out of data mid-clip: the clock holds (and the stall watchdog runs)
    v.addEventListener('loadedmetadata', function () {
      var full = v.duration;
      if (isFinite(full) && full > 0) {
        var end = c.out > c.in && c.out <= full ? c.out : full;
        c.dur = Math.max(0.3, end - Math.min(c.in, full - 0.3));
        layout();
      }
      c.meta = true;
      var to = c.in + Math.max(0, c.seekTo);
      c.seekTo = -1;
      if (to > 0.001) { c.ready = false; v.currentTime = Math.min(to, c.in + c.dur - 0.04); }
      check();
    });
    v.addEventListener('loadeddata', check);
    v.addEventListener('seeked', check);
    v.addEventListener('canplay', check);
    v.addEventListener('error', function () {
      if (c.src !== s.src) {   // the phone file is missing: try the full-size one
        c.src = s.src; c.meta = c.ready = c.shown = c.warm = false;
        if (typeof s.focus === 'number') v.style.objectPosition = (clamp(s.focus, 0, 1) * 100).toFixed(1) + '% 50%';
        v.src = c.src;
        return;
      }
      fail(c, 'did not load');
    });
    v.src = c.src;
    box().appendChild(v);
    setOp(v, 0);
    c.el = v;
  }
  function drop(c) {   // let go of a clip's elements (they are made again if the clip is needed again)
    if (c.el) { try { c.el.pause(); c.el.removeAttribute('src'); c.el.load(); } catch (e) { /* ignore */ } c.el.remove(); c.el = null; }
    [c.hold, c.end, c.over, c.dark, c.lit, c.exact].forEach(function (im) { if (im) im.remove(); });
    c.hold = c.end = c.over = c.dark = c.lit = c.exact = null;
    c.meta = c.ready = c.done = c.shown = c.warm = false; c.seekTo = -1; c.stillsOk = 0;
    arm(c);
  }
  // (Re)arm a clip's timers: the load / stall wait starts again from zero whenever a clip is entered, sought or let go of.
  function arm(c) { c.wait = 0; c.lastT = -1; }
  function onScreen(c) { return (!!curSeg && curSeg.clip === c) || (!!prevSeg && prevSeg.clip === c); }
  function seekClip(c, l) {
    c.done = l >= c.dur - 0.04;
    arm(c);
    if (!c.el) return;
    if (c.meta) { c.ready = false; c.el.currentTime = c.in + Math.min(Math.max(0, l), c.dur - 0.04); }
    else c.seekTo = l;
  }
  function refused(e) { if (e && e.name === 'NotAllowedError') noFootage('autoplay was refused'); }
  // Play a clip that is on screen. Not gated on a loaded frame: iOS buffers nothing until play() is called.
  // (An ended element is left alone: play() would restart it from 0.)
  function playV(c) {
    if (!c || !c.el || c.done || c.el.ended || !c.el.paused) return;
    var p = c.el.play();
    if (p && p.catch) p.catch(refused);
  }
  // Warm the next clip where the browser will not buffer it by itself (see WARM_NEXT): play it unseen; its 'playing'
  // handler pauses it on the first frame and marks it ready.
  function warmV(c) {
    if (!c || !c.el || c.ready || c.warm || c.done || c.el.ended || !c.el.paused || c.el.readyState >= 2) return;
    if (!WARM_NEXT) { if (!c.autoAt || performance.now() - c.autoAt < 1000) return; WARM_NEXT = true; }
    c.warm = true;
    var p = c.el.play();
    if (p && p.catch) p.catch(function (e) { c.warm = false; refused(e); });
  }
  function pauseV(c) { if (c && c.el && !c.el.paused) c.el.pause(); }
  function layersOf(g) {
    if (!g) return [];
    if (g.kind === 'canvas') return [canvas, exactOf(g)];
    var c = g.clip;
    return g.kind === 'stills' ? [c.dark, c.lit, c.exact] : [c.el, c.hold, c.end, c.over, c.exact];
  }
  function hide(g) {
    layersOf(g).forEach(function (el) { setOp(el, 0); });
    if (g && g.clip) { pauseV(g.clip); if (g.clip.name === 'film-s1-08') setOp(tint, 0); }
  }

  // Enter a segment: bring its layers to the top (the canvas stays above the footage in the match cut).
  function enter(g, l, jump) {
    ensure(g, 'auto');
    var ex = exactOf(g);
    if (ex) ex._at = ex._badAt = undefined;   // a new pass: the exact logo's dissolve is on its planned time again
    if (g.kind === 'canvas') { raise(canvas); raise(ex); return; }
    var c = g.clip;
    arm(c);
    if (g.kind === 'clip') {
      if (jump || l > 0.05) seekClip(c, l); else { c.done = false; if (c.meta && Math.abs(c.el.currentTime - c.in) > 0.05) seekClip(c, 0); }
      // until its first frame, a clip shows its poster only at its start, and only the full-size file (see makeVideo)
      c.posterOk = !!c.slot.poster && c.src === c.slot.src && l <= 0.05;
      raise(c.el); raise(c.over); raise(c.hold); raise(c.end); raise(c.exact);
      if (c.name === 'film-s1-08') { tintEl(); raise(tint); }
      if (g.join.type === 'match' && !jump) raise(canvas);
    } else { raise(c.dark); raise(c.lit); raise(c.exact); }
  }
  function tintEl() {
    if (!tint) { tint = document.createElement('div'); tint.className = 'intro__tint'; box().appendChild(tint); setOp(tint, 0); }
    return tint;
  }
  function go(g, l, jump) {
    if (prevSeg && prevSeg !== g) hide(prevSeg);
    prevSeg = null;
    if (curSeg && curSeg !== g) { if (!jump && g.join.over > 0) { prevSeg = curSeg; ploc = loc; } else hide(curSeg); }
    curSeg = g; loc = l || 0; waitN = 0;
    enter(g, loc, jump);
    ahead();
    if (running()) { playV(g.clip || {}); }
  }
  // Keep the next footage segment loading while this one plays; let go of everything else.
  function ahead() {
    var i = SEG.indexOf(curSeg), keep = [curSeg, prevSeg];
    for (var k = i + 1; k < SEG.length && k <= i + 2; k++) {
      if (SEG[k].kind !== 'canvas') keep.push(SEG[k]);
      ensure(SEG[k], k === i + 1 ? 'auto' : 'metadata');   // (for the canvas logo: its exact logo)
    }
    Object.keys(CLIPS).forEach(function (name) {
      var c = CLIPS[name];
      if (!c || (!c.el && !c.dark && !c.hold && !c.end && !c.over && !c.exact)) return;
      for (var j = 0; j < keep.length; j++) if (keep[j] && keep[j].clip === c) return;
      drop(c);
    });
  }
  function fail(c, why) {
    if (c.failed) return;
    c.failed = true;
    console.warn('[film] "' + c.name + '" is marked ready but ' + c.src + ' ' + why + '; ' + 'the film plays on without it.');
    drop(c);
    replan();
  }
  function noFootage(why) {
    if (!FOOTAGE) return;
    FOOTAGE = false;
    console.info('[film] ' + why + ': playing the canvas version of the film.');
    Object.keys(CLIPS).forEach(function (name) { if (CLIPS[name]) drop(CLIPS[name]); });
    replan();
  }
  // After a clip drops out (or a whole scene falls back), carry on from the same place in the story.
  function replan() {
    var old = curSeg, oldPrev = prevSeg;
    planSeq();
    if (!old) return;
    var same = null, i;
    for (i = 0; i < SEG.length; i++) if (SEG[i].key === old.key && SEG[i].kind === old.kind) same = SEG[i];
    if (same && (!same.clip || !same.clip.failed)) {
      curSeg = same;
      prevSeg = null;
      if (oldPrev) { var p2 = null; for (i = 0; i < SEG.length; i++) if (SEG[i].key === oldPrev.key && SEG[i].kind === oldPrev.kind) p2 = SEG[i]; if (p2 && nextOf(p2) === same) prevSeg = p2; else hide(oldPrev); }
      ahead();
      return;
    }
    hide(old); if (oldPrev) hide(oldPrev);
    curSeg = null; prevSeg = null;
    for (i = 0; i < SEG.length; i++) {
      var s2 = SEG[i];
      if (s2.scene > old.scene || (s2.scene === old.scene && (s2.kind === 'canvas' || s2.key > old.key))) { go(s2, 0, true); return; }
    }
    go(SEG[SEG.length - 1], 0, true);
  }

  /* ---- The clock ---- */
  function advance(dt) {
    var g = curSeg, nx = nextOf(g);
    if (prevSeg && loc >= g.join.d + (g.join.type === 'match' ? 0.4 : 0)) { hide(prevSeg); prevSeg = null; ahead(); }
    if (prevSeg) ploc += dt;
    if (prevSeg && prevSeg.kind === 'clip') tailClip(prevSeg.clip);
    if (nx && nx.kind === 'clip') warmV(nx.clip);
    if (g.kind === 'clip') {
      var c = g.clip;
      if (!c.done && c.el) {
        playV(c);   // on screen: play it now, loaded or not (iOS loads nothing until then)
        // Watchdog: the clip must be loaded and its playhead moving. Not loaded yet, or stopped mid-clip
        // (a network stall), for WAIT_MAX seconds in all: it is dropped and the film carries on without it.
        var ct = c.el.currentTime;
        if (c.ready && ct !== c.lastT) { c.lastT = ct; c.wait = 0; }
        else { c.wait += dt; if (c.wait > WAIT_MAX) { fail(c, c.ready ? 'stalled' : 'did not load in time'); return; } }
        if (!c.ready) return;
        loc = clamp(ct - c.in, 0, c.dur);
        if (c.el.ended || loc >= c.dur - 0.04) { c.done = true; loc = c.dur; pauseV(c); }
      } else if (!c.done) return;
      else if (!nx) loc += dt;   // the last clip: its end frame holds, then the hold still and the title
      else loc = Math.max(loc, c.dur);
    } else if (g.kind === 'stills') {
      var s = g.clip;
      if (s.stillsOk < 2) { s.wait += dt; if (s.wait > WAIT_MAX) { s.stillsFailed = true; replan(); } return; }
      loc += dt;
    } else loc += dt;
    if (!nx) return;
    var at = g.len - nx.join.over;
    if (loc < at) return;
    if (nx.kind === 'clip' && !nx.clip.ready) {   // the next clip is late: hold this frame for it
      if (g.kind === 'canvas') loc = Math.min(loc, g.len);
      nx.clip.wait += dt; waitN += dt;
      if (nx.clip.wait > WAIT_MAX) fail(nx.clip, 'did not load in time');
      return;
    }
    go(nx, waitN > 0 ? 0 : loc - at, false);
  }
  function tailClip(c) {   // a clip finishing under a transition stops at its out point
    if (!c.el || c.done) return;
    if (c.el.ended || c.el.currentTime >= c.in + c.dur - 0.04) { c.done = true; pauseV(c); }
  }

  /* ---- A frame: the canvas (when it is on screen), the layers' opacity, the HUD ---- */
  var lastAct = '', lastEnd = null, lastBrief = null, lastCap = null;
  function draw() {
    var g = curSeg, p = prevSeg, j = g.join, nx = nextOf(g);
    var inK = j.type === 'none' || j.type === 'cut' ? 1 : j.type === 'dip' ? smooth(clamp(loc / (j.d / 2), 0, 1)) : smooth(clamp(loc / j.d, 0, 1));
    var outK = nx && nx.join.type === 'dip' ? 1 - smooth(clamp((loc - (g.len - nx.join.d / 2)) / (nx.join.d / 2), 0, 1)) : 1;
    var cv = g.kind === 'canvas' ? g : p && p.kind === 'canvas' ? p : null;
    if (cv) {
      var lt = cv === g ? loc : Math.min(ploc, cv.len);
      if (cv.world === 'logo') renderLogo(lt); else render(cv.t0 + Math.min(lt, cv.len));
    }
    // the canvas (its ending, the canvas logo, dissolves into the exact logo too: see xfade)
    var cA = 0, blend = '', lx = g.kind === 'canvas' && isLast(g) ? exactMix(g, loc) : 0, LX = xfade(lx);
    if (g.kind === 'canvas') cA = inK * outK * LX.oU;
    else if (p && p.kind === 'canvas') {
      cA = 1;
      if (j.type === 'match') { blend = 'screen'; cA = 1 - smooth(clamp((loc - 0.6) / 0.4, 0, 1)); }
    }
    setOp(canvas, cA);
    if (canvas._blend !== blend) { canvas.style.mixBlendMode = blend; canvas._blend = blend; }
    if (logoX) {
      var lo = exactOf(g) === logoX;
      if (lo) { placeExact(g); splitX(g, lx, LX, [canvas]); } else split(canvas, 0, 0, 1);
      setOp(logoX, lo && logoX._ok ? inK * outK * LX.eU : 0);
    }
    // footage
    if (p && p.kind !== 'canvas') footage(p, ploc, 1);
    if (g.kind !== 'canvas') footage(g, loc, (j.type === 'match' ? smooth(clamp(loc / 0.6, 0, 1)) : inK) * outK);
    settle(g);
    hud(g);
  }
  function footage(g, l, a) {
    var c = g.clip;
    // the last frame hands over to the exact logo: it fades in over the frame, then the frame under it fades out
    var x = exactMix(g, l), X = xfade(x), xo = X.oU;
    if (c.exact) { placeExact(g); setOp(c.exact, c.exact._ok ? a * X.eU : 0); }
    if (g.kind === 'stills') {
      setOp(c.dark, c.dark && c.dark._ok ? a * xo : 0);
      var w = smooth(span(l, STILLS.wipe));
      setOp(c.lit, c.lit && c.lit._ok && w > 0 ? a * xo : 0);
      if (c.lit) {   // the lit still is wiped on from left to right (a soft edge), inside the same top and bottom feather
        var edge = (w * 130 - 15).toFixed(1), m = w >= 1 ? '' : 'linear-gradient(90deg, #000 ' + edge + '%, transparent ' + (+edge + 15).toFixed(1) + '%), ' + FEATHER;
        if (c.lit._mask !== m) {
          c.lit.style.webkitMaskImage = m; c.lit.style.maskImage = m;
          c.lit.style.webkitMaskComposite = m ? 'source-in' : ''; c.lit.style.maskComposite = m ? 'intersect' : '';
          c.lit._mask = m;
        }
      }
      return;
    }
    if (c.exact) splitX(g, x, X, [c.el, c.hold]);
    setOp(c.el, c.shown || c.posterOk ? a * xo : 0);   // invisible until it has a frame (iOS would show an empty box or a play glyph)
    if (c.hold) setOp(c.hold, c.hold._ok ? a * xo * smooth(clamp((l - c.dur) / 0.4, 0, 1)) : 0);
    if (c.end) setOp(c.end, c.end._ok ? a * xo * smooth(clamp((l - (c.dur - 0.8)) / 0.8, 0, 1)) : 0);
    if (c.over) setOp(c.over, c.over._ok ? a * xo * 0.9 * smooth(clamp((l - 0.1) / 0.6, 0, 1)) : 0);   // lime lines traced over a locked shot (S1-07)
    if (c.name === 'film-s1-08' && c.el) {
      // The paper darkens, then comes back inverted (dark paper, light lines) under a lime multiply, so the
      // lines turn lime, ready to dissolve into the canvas drawing. (Animating invert() itself would pass
      // through flat grey half way.)
      var k = clamp((l - (c.dur - 0.8)) / 0.8, 0, 1), f = '', tk = 0;
      if (k > 0 && k < 0.45) f = 'brightness(' + (1 - 0.85 * smooth(k / 0.45)).toFixed(3) + ')';
      else if (k >= 0.45) { f = 'invert(1) grayscale(1) contrast(1.3) brightness(' + (0.15 + 0.85 * smooth((k - 0.45) / 0.55)).toFixed(3) + ')'; tk = 1; }
      if (c.el._f !== f) { c.el.style.filter = f; c.el._f = f; }
      setOp(tint, tk * a);
    }
  }
  // The exact logo's place in the media box (CSS px, before the settle transform) and its scale (1 = its own
  // pixels): its U over the U of the frame it replaces, but never so wide that the word would leave the screen.
  // g0-g1: the gap under the U in the replaced layers' own box (for split). The canvas logo is matched as it rests
  // (after its settle), and there the scale is capped at once (the canvas camera does not make room for it).
  function exactFit(g) {
    var bw = W / dpr, bh = H / dpr, s;
    if (g.kind === 'canvas') {
      var c = logoCam(LG.settle[1]), ux, uy, uw, ub;
      pj(c, 0, (U_TOP + U_BASE) / 2, 0); ux = PX / dpr; uy = PY / dpr;
      pj(c, -U_ARM - U_HALF, 7, 0); uw = PX;
      pj(c, U_ARM + U_HALF, 7, 0); uw = (PX - uw) / dpr;
      pj(c, 0, U_BASE, 0); ub = PY / dpr;
      pj(c, 0, W_CAP, W_Z);   // the top of the word (it stands in front of the U)
      s = Math.min(uw / EXACT.uw, (bw - 32) / EXACT.ww, exactCap(logoX));
      return { s: s, x: ux - EXACT.ux * s, y: uy - EXACT.uy * s, g0: ub, g1: Math.max(ub + 2, PY / dpr) };
    }
    var r = g.kind === 'stills' ? EXREF.tall : EXREF.wide, fw;
    if (g.kind === 'stills') fw = bw;   // .is-fitw: the full width, centred
    else fw = g.clip.contain ? Math.min(bw, bh * r.ar) : Math.max(bw, bh * r.ar);   // object-fit: cover (or contain)
    var fh = fw / r.ar, top = (bh - fh) / 2;
    s = Math.min(r.w * fw / EXACT.uw, (bw - 32) / EXACT.ww);
    return { s: s, x: (bw - fw) / 2 + r.x * fw - EXACT.ux * s, y: top + r.y * fh - EXACT.uy * s, g0: top + (r.g0 || 0) * fh, g1: top + (r.g1 || 0) * fh };
  }
  function placeExact(g) {
    var e = exactOf(g), f = exactFit(g), key = f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ' ' + f.s.toFixed(4);
    if (e._fit === key) return;
    e._fit = key;
    e.style.left = f.x.toFixed(1) + 'px'; e.style.top = f.y.toFixed(1) + 'px';
    e.style.width = (EXACT.w * f.s).toFixed(1) + 'px'; e.style.height = (EXACT.h * f.s).toFixed(1) + 'px';
  }
  // "Never larger than its own pixels", as a scale of the 1x file (1 = one CSS px per pixel of it). With a 2x master
  // (slot `exact2x`, once the browser has picked it) the rule holds in device pixels too. With only the 1x file it holds
  // in CSS px, so a 2x or 3x screen upscales the logo like any 1x image on the web: holding it in device px there would
  // halve it. The owner's logo is 557 px wide; a larger (or vector) master is the real fix.
  function exactCap(e) { return e && e._dens > 1 ? e._dens / Math.max(1, window.devicePixelRatio || 1) : 1; }
  // 0 → 1 over EXACT.fade s: the dissolve into the exact logo. It starts with the title card or, where the logo
  // would still be larger than its own pixels, later in the settle, once the shrinking frame has brought it down
  // (the canvas logo: once it has settled). If the logo only arrived later than that, it runs from then (see late).
  function exactMix(g, l) {
    var e = exactOf(g), start;
    if (!e || !e._ok || !isLast(g)) return 0;
    if (g.kind === 'canvas') start = LG.settle[1];
    else {
      var s = exactFit(g).s, C = exactCap(e), k = s <= C ? 0 : clamp((1 - C / s) / (1 - settleTo(g)[2]), 0, 1);
      var u = k < 0.5 ? Math.cbrt(k / 4) : 1 - Math.cbrt(2 * (1 - k)) / 2;   // the settle's inOut, inverted
      start = g.titleAt + SETTLE * u;
    }
    if (e._at > start) start = e._at;
    return clamp((l - start) / EXACT.fade, 0, 1);
  }
  // The dissolve (x from exactMix) for the frame it replaces (o) and the exact logo (e), above the gap under the U (U)
  // and below it (W): the U crossfades in place, registered; below the gap the old word has gone before the exact word
  // comes in, so the two words, which sit at different heights, are never seen double.
  function xfade(x) {
    return { oU: 1 - smooth(clamp((x - 0.35) / 0.65, 0, 1)), oW: 1 - smooth(clamp(x / 0.45, 0, 1)),
      eU: smooth(clamp(x / 0.7, 0, 1)), eW: smooth(clamp((x - 0.4) / 0.6, 0, 1)) };
  }
  // Below the line y0 → y1 (CSS px in the element's own box) the element shows at k of its opacity (k = 1: no mask).
  function split(el, y0, y1, k) {
    if (!el) return;
    var m = k >= 0.999 ? '' : 'linear-gradient(to bottom, #000 ' + y0.toFixed(1) + 'px, rgba(0,0,0,' + Math.max(0, k).toFixed(3) + ') ' + y1.toFixed(1) + 'px)';
    if (el._split !== m) { el._split = m; el.style.webkitMaskImage = m; el.style.maskImage = m; }
  }
  function splitX(g, x, X, olds) {   // olds: the layers of the frame being replaced
    var on = x > 0 && x < 1, f = on ? exactFit(g) : null;
    olds.forEach(function (el) { split(el, on ? f.g0 : 0, on ? f.g1 : 0, on ? X.oW / X.oU : 1); });
    split(exactOf(g), on ? EXACT.g0 * f.s : 0, on ? EXACT.g1 * f.s : 0, on ? (X.eU > 0 ? X.eW / X.eU : 0) : 1);
  }
  // Where footage settles under the title: aside on wide screens, up on tall ones; and no larger than keeps the
  // exact logo within its own pixels (so on big screens it settles a little smaller). That is planned while the logo
  // loads; if it fails, the frame eases back out to its usual size from that moment (RESETTLE s).
  function settleTo(g) {
    var aspect = W / H, to = aspect >= 1.25 ? [22, -13, 0.42] : aspect >= 1 ? [0, -16, 0.48] : [0, -16, 0.82];
    var e = g.clip && g.clip.exact, w;
    if (e) {
      w = !e._bad ? 1 : e._badAt >= 0 ? 1 - smooth(clamp((loc - e._badAt) / RESETTLE, 0, 1)) : 0;
      if (w > 0) to[2] = lerp(to[2], Math.min(to[2], exactCap(e) / exactFit(g).s), w);
    }
    return to;
  }
  var lastSettle = '';
  function settle(g) {   // footage hold: under the title the frame shrinks aside (the canvas logo does this with its camera)
    if (!mediaBox) return;
    var k = isLast(g) && g.kind !== 'canvas' ? inOut(span(loc, [g.titleAt, g.titleAt + SETTLE])) : 0, to = k > 0 ? settleTo(g) : null;
    var tf = k > 0 ? 'translate(' + (to[0] * k).toFixed(2) + '%, ' + (to[1] * k).toFixed(2) + '%) scale(' + lerp(1, to[2], k).toFixed(4) + ')' : '';
    if (tf !== lastSettle) { lastSettle = tf; mediaBox.style.transform = tf; }
    setOp(vignette, k);
  }
  function hud(g) {
    if (g.act !== lastAct) { section.setAttribute('data-act', g.act); lastAct = g.act; }
    var ended = isLast(g) && loc >= g.titleAt;
    if (ended !== lastEnd) { section.classList.toggle('is-end', ended); lastEnd = ended; }
    var brief = !!g.brief;
    if (brief !== lastBrief) { section.classList.toggle('is-brief', brief); lastBrief = brief; }
    // a slot can replace its captions (captions: [] turns the caption box off for that shot)
    var cap = '', list = brief && g.clip ? (g.clip.slot && Array.isArray(g.clip.slot.captions) ? g.clip.slot.captions : CAPTIONS[g.name]) : null;
    if (list) list.forEach(function (e) { if (loc >= e[0]) cap = e[1]; });
    // (a caption going off keeps its words while its box fades out: an emptied box would fade out as a bare lime tick)
    if (captionEl && cap !== lastCap) { if (cap) captionEl.textContent = cap; section.classList.toggle('has-caption', !!cap); lastCap = cap; }
    // (the last segment runs to the title card, which can come after its clip ends: then the bar still reaches the end)
    if (progressEl) progressEl.style.transform = 'scaleX(' + clamp((g.m0 + Math.min(loc, isLast(g) ? g.titleAt : g.len)) / M_END, 0, 1).toFixed(4) + ')';
  }

  /* ---- Seeking: ?film=, Skip, Replay, the paused still ---- */
  function seekMaster(m) {
    m = Math.max(0, m);
    var k = 0;
    while (k < SEG.length - 1 && SEG[k + 1].m0 <= m) k++;
    var g = SEG[k], l = m - g.m0, p = k > 0 ? SEG[k - 1] : null;
    if (prevSeg) hide(prevSeg);
    if (curSeg && curSeg !== g) hide(curSeg);
    prevSeg = null; curSeg = null;
    Object.keys(CLIPS).forEach(function (name) { if (CLIPS[name]) arm(CLIPS[name]); });   // a new pass: no clip keeps an old wait
    if (p && g.join.over > 0 && l < g.join.d + (g.join.type === 'match' ? 0.4 : 0)) {   // mid-transition: both layers
      curSeg = p; loc = m - p.m0; enter(p, loc, true);
      prevSeg = p; ploc = loc;
    }
    curSeg = g; loc = l; waitN = 0;
    enter(g, l, true);
    if (prevSeg && g.join.type === 'match') raise(canvas);
    ahead();
  }
  function holdTime() { var L = SEG[SEG.length - 1]; return L.m0 + L.restAt + 0.01; }

  /* ==========================================================================
     Clock, size, visibility, Skip and the motion control
     ========================================================================== */
  var raf = 0, last = 0, inView = true;
  var start = parseFloat(new URLSearchParams(window.location.search).get('film'));

  function paused() { return root.classList.contains('motion-paused'); }
  function running() { return inView && !document.hidden && !paused(); }
  // At rest: the end state is reached, including the exact logo's dissolve (or the re-settle when it failed). While the
  // logo is still loading the clock rests too; its load handler (late) starts it again for the dissolve.
  function resting() {
    if (!curSeg || !isLast(curSeg) || prevSeg || loc < curSeg.restAt) return false;
    var e = exactOf(curSeg);
    if (!e) return true;
    if (e._bad) return !(e._badAt >= 0) || loc >= e._badAt + RESETTLE;
    return !e._ok || exactMix(curSeg, loc) >= 1;
  }
  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    advance(dt);
    draw();
    if (running() && !resting()) raf = window.requestAnimationFrame(frame); else last = 0;
  }
  function eachClip(fn) { [curSeg, prevSeg].forEach(function (g) { if (g && g.kind === 'clip') fn(g.clip); }); }
  function kick() {
    if (!running()) return;
    eachClip(playV);
    if (!raf && !resting()) { last = 0; raf = window.requestAnimationFrame(frame); }
  }
  function halt() { if (raf) window.cancelAnimationFrame(raf); raf = 0; last = 0; eachClip(pauseV); draw(); }

  function resize() {
    var bx = section.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(bx.width)), cssH = Math.max(1, Math.round(bx.height));
    dpr = Math.min(window.devicePixelRatio || 1, cssW < 700 ? 1.5 : 2);
    LITE = cssW < 700 || (navigator.hardwareConcurrency || 8) <= 4;   // phones and small machines draw a lighter crowd, fewer beams
    W = Math.round(cssW * dpr); H = Math.round(cssH * dpr);
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    screen = screenRect();
    lastSettle = -1;
    if (curSeg) draw();
  }
  function loadImage(name, done) {
    var slot = slots[name];
    if (!slot || slot.status !== 'ready' || !slot.src) return;
    var im = new Image();
    im.decoding = 'async';
    im.onload = function () { done(im, slot); if (!raf && curSeg) draw(); };
    im.onerror = function () { console.warn('[film] "' + name + '" is marked ready but ' + slot.src + ' did not load.'); };
    im.src = slot.src;
  }
  loadImage('intro-drawing', function (im, slot) { drawingImg = im; drawingInvert = !!slot.invert; });

  // Phones get the lighter phone files (pre-cropped 9:16 strips) and the 9:16 stills.
  (function () { var bx = section.getBoundingClientRect(); PHONE = bx.width < 700 || bx.width / Math.max(1, bx.height) < 0.9; })();
  box();
  resize();
  planSeq();
  if (!isNaN(start) && start >= 0) seekMaster(start);
  else if (paused()) seekMaster(holdTime());   // Pause motion / reduced motion: one still, the logo hold under the title
  else go(SEG[0], 0, true);
  draw();
  // the word is drawn in the site's display face when "Arial Black" is not installed: rebuild it once fonts arrive
  // (built here, once, so the logo scene never pays for it mid-film)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { WD = null; LHOLD.W = 0; wordData(); if (!raf && curSeg) draw(); });

  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) kick(); else { if (raf) { window.cancelAnimationFrame(raf); raf = 0; last = 0; } eachClip(pauseV); }
    }).observe(section);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else kick(); });
  new MutationObserver(function () {
    if (paused()) halt(); else kick();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  if (replayBtn) replayBtn.addEventListener('click', function () {
    lastEnd = null;
    seekMaster(0);
    if (paused() && motionToggle) motionToggle.click();
    draw();
    kick();
    // the title card (and this button) hides again, so keyboard focus moves to Skip, which is back
    if (skipBtn) { try { skipBtn.focus({ preventScroll: true }); } catch (e) { skipBtn.focus(); } }
  });
  if (skipBtn) skipBtn.addEventListener('click', function () {
    var L = SEG[SEG.length - 1];
    if (curSeg !== L || loc < L.titleAt) seekMaster(L.m0 + L.titleAt + 0.01);
    draw();
    kick();
    // the button hides itself once the title card is up, so keyboard focus moves to the title,
    // once it has become visible (its reveal is staggered by a fraction of a second)
    var title = section.querySelector('#intro-title'), tries = 0;
    function focusOn(el) { el.setAttribute('tabindex', '-1'); try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } return document.activeElement === el; }
    (function attempt() {
      if (title && focusOn(title)) return;
      if (++tries < 15) setTimeout(attempt, 100);
      else focusOn(section);   // last resort: the film section itself, which is labelled by the title
    })();
  });
  // Review hook, only with ?dev on the URL: time a single frame at any second of the film.
  if (/[?&]dev\b/.test(window.location.search)) {
    window.__film = { T: T, LG: LG, parts: parts.length, crew: CREW.length, prof: prof,
      frame: function (t) { var a = performance.now(); render(t); return performance.now() - a; },
      logo: function (t) { var a = performance.now(); renderLogo(t); return performance.now() - a; },
      seek: function (m) { seekMaster(m); draw(); kick(); return { seg: curSeg.name || curSeg.world, local: loc }; },
      // run the clock by hand (the app's browser pane does not animate a hidden tab): n steps of dt seconds
      step: function (dt, n) { for (var i = 0; i < (n || 1); i++) { advance(dt); draw(); } return { seg: curSeg.name || curSeg.world, local: +loc.toFixed(3), m: +(curSeg.m0 + Math.min(loc, curSeg.len)).toFixed(3), prev: prevSeg ? prevSeg.name || prevSeg.world : null, act: section.getAttribute('data-act'), end: section.classList.contains('is-end'), canvas: canvas.style.opacity }; },
      plan: function () { return SEG.map(function (g) { return { what: g.name || g.world + ' ' + g.t0 + '-' + g.t1, act: g.act, m0: +g.m0.toFixed(2), len: g.len, join: g.join.type }; }); },
      at: function (t, p) { var c = cameraB(t); return pj(c, p[0], p[1], p[2]) ? [PX / dpr, PY / dpr, PZ] : null; } };
  }
  kick();
})();
