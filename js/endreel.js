/* ==========================================================================
   Unconventional — the end reel ("Truss Cosmos", final)
   site/js/endreel.js (= endreel-lab/truss-cosmos-final/reel.js) · plain JS,
   one Canvas 2D, no libraries, nothing downloaded.

   28.300 s that loop behind the end card, after the film's last frame (the
   owner's image of the logo, full screen). The reel opens ON that frame and
   lands back ON it, so the film's ending, the reel and every loop are one piece.
   Timed on a 120 BPM grid (a beat is 0.5 s, a bar 2 s); see TL, and
   brand/raw/endreel/FINAL.md for the beat sheet.

      0.0  the logo frame. STANDBY: a light runs along the U's neon.
      0.5  GO. The camera pushes into the U; the photo hands over to a drawn echo
           of it (the same U in the same place) and the bracing in the U's counter
           grows back into depth as an endless box truss.
      1.5  through the U: inside the truss. Speed, chrome glints, dust.
      2.0  "Concept."  3.0 "Culture."  4.0 "Technical reality."
      4.0  the truss bursts (an exploded view); its pieces fly out into the black.
      5.0  (2026-10-06, v4: no stage) on the beat the black closes and the five cues
           play full frame (the Higgsfield render, media/endreel/cues.mp4; makeStory
           draws them if the video cannot play), 3.7-4.3 s each, their words set over
           them; at 25.0 the picture folds to a line of light; at 25.5 the old timeline
           resumes at its 12.2 with no stage world: the truss re-forms round the camera
           out of the dark and retracts into the U, the logo at 28.1.
           (Before, with the stage, kept in the code behind STAGE:)
      4.4  reality: a CAD floor scans out, the desert ridge is plotted.
      5.0  the stage camera: it swoops low and deep round to the left (28 deg)
      5.5  through the cloud of pieces; they fly in on the 16ths (a few right past
           the lens) and build the stage at architectural scale (towers, roof, PA,
           a solid 34 m LED wall, lights); it lands front-on as the roof locks.
      7.45 the wall wakes, cabinet by cabinet from the centre; the audience comes
           up out of the dark in front of it.
      8.0  SHOW: ten beams open in haze; the wall calls the event types, one a
           beat: bar 5 a camera whips along one line of them (neighbours dim at
           the wall's edges); bar 6 the line rolls up and the rest come up a
           column, larger each time. Each lights letter by letter on its beat.
           The camera pushes in for four seconds on a slow lateral arc.
     11.5  it flies through the last word; "Live / events" rises into the wall,
     12.0  the climax: the beams burst open (a sunburst in a wide frame, ten
           columns in a tall one), a band of light sweeps the wall, its light
           swells over the deck. The camera breathes in, then is pulled straight
           back down the truss (which re-forms around it, drawn by still lines
           radiating from the lit stage at its far end); the truss retracts.
     14.2  out through the U, onto the photo; 14.8 - 15.0 the logo frame again.

   Light safety (WCAG 2.3.1) by construction: anything that sweeps across the
   screen is capped below a 0.1 luminance step (lines, drawn with 'lighten' so
   a dense moving lattice cannot add up), faded by its spacing on screen (small
   lattices), streaked or faded at speed, or blurred over a 1/30 s shutter (the
   photo's zoom, the flying words, the beams, the wall); lit type never moves
   while it is lit. Checked per pixel at desktop and phone sizes (FINAL.md).

   API (deterministic: a frame depends on t only; seeded randomness):
     EndReel.mount(container, opts) -> reel   a canvas of its own, filling the
                                              container; also window.__reel
     EndReel.create(canvas, opts) -> reel     on a canvas you own
     reel.frame(t)   draws the frame at t (wrapped to 0-28.3), returns ms; works
                     with no animation frames (a hidden tab, a review tool)
     reel.still(t)   the one still (STILL); kept through resizes while shown
     reel.duration (28.3), reel.W, reel.H (device px), reel.STILL
     reel.play() / pause() / seek(t) / time / playing / resize()
     reel.prepare()  (a page) makes the wall's words and the beams' haze ahead,
                     in idle time
     reel.setLayout({ head, room, rect })   the header's height, the title
                     card's room and the image's place, as film3.js has them
     reel.relayout({ head, room, rect })    a new size and layout in one pass
     reel.activate(on[, t])   (mount) run or rest; it also rests off screen and
                     in a hidden tab, and shows its still for Pause motion /
                     reduced motion
     reel.isReady()  true once the owner's image has loaded
   It never throws: a failure is logged once and the reel keeps its last frame.
   LITE (under 700 px wide, or 4 cores or fewer): fewer stars and dust, a coarser crowd,
   a coarser LED wall, a smaller beam buffer. Backing store up to 1.5x, stepping
   down to 1.25 then 1 if playback drops frames.
   No names, logos or set pieces of any real brand, show or venue; the only
   logo is the owner's own, from their image. The only words: "Concept."
   "Culture." "Technical reality.", the event types and "Live events", grid
   bubbles A-E, and show-calling words (CUE, STANDBY, GO, a timecode).
   ========================================================================== */
(function () {
  'use strict';

  var DUR = 15;
  var DEG = Math.PI / 180;

  /* ---- Palette: the site's tokens ---------------------------------------- */
  var INK = [244, 241, 234], STEEL = [148, 168, 210], LIME = [216, 255, 61], HOT = [255, 251, 242], BLUE = [138, 164, 255];
  var COLS = [INK, STEEL, LIME, HOT, BLUE];
  var C_INK = 0, C_STEEL = 1, C_LIME = 2, C_HOT = 3, C_BLUE = 4;   // (BLUE: chrome lit by the LED wall)
  // the night of the owner's image (sampled from it): sky top, sky low, land
  var SKY_TOP = [8, 11, 25], SKY_LOW = [22, 29, 52], LAND = [12, 10, 14];
  var MONO = 'ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace';
  var DISPLAY = '"Bricolage Grotesque", "Arial Narrow", system-ui, sans-serif';

  /* ---- The owner's image (film3.js FINAL), and where its U is -------------
     keep / U / reg are film3.js's numbers. horizon: eye level in the image
     (fraction of its height). arc: the bottom of the U, measured on each image
     (U units, 1 = the outer half-width): outer edge, neon, counter.          */
  var FINAL = {
    wide: { ar: 2560 / 1429, smallW: 1600, keep: { l: 0.122, r: 0.890, t: 0.181, b: 0.823 },
      U: { x: 0.5035, w: 0.2593 }, reg: { x: -0.00439, y: -0.00072, w: 1.00864 },
      horizon: 0.535, arc: { o: 0.86, n: 0.626, i: 0.242 } },
    tall: { ar: 1536 / 2752, smallW: 900, keep: { l: 0.031, r: 0.979, t: 0.3645, b: 0.668 },
      U: { x: 0.5017, w: 0.3722 }, reg: { x: 0, y: -0.00355, w: 1 },
      horizon: 0.525, arc: { o: 1.0, n: 0.65, i: 0.39 } }
  };
  var S = 4;                         // metres per U unit
  var U_TOP = 1.416, U_DEPTH = 1.3;  // the top of the U (units, above the arcs' centre); its depth (m)
  // the U's nested contours, inside out: [outer rx, inner rx, top] (units); ry follows from the arc table
  var UC = [[1.0, 0.287, 1.416], [0.925, 0.362, 1.35], [0.85, 0.437, 1.276], [0.762, 0.538, 1.19]];
  var NEON = [0.622, 1.054];         // rx, top

  /* ---- The timeline, in seconds (beats at 120 BPM in brackets) ------------ */
  var TL = {
    standby: [0.08, 0.5],      // b0-b1   a light runs along the neon (on the photo)
    go: 0.5,                   // b1      GO: the push starts
    imgOut: [0.52, 1.02],      //         the photo hands over to the drawing (done before the push is fast)
    grow: [0.62, 2.9],         //         the truss grows back from the U's bracing
    passU: 1.5,                // b3      through the U
    words: [['Concept.', 2.0, 2.76], ['Culture.', 3.0, 3.76], ['Technical reality.', 4.0, 5.3]],
    burst: 4.0,                // b8      the exploded view
    desert: [4.4, 5.3],        //         land and sky fade up
    scan: [4.5, 6.3],          //         the CAD floor scans out from the stage's centre line
    ridge: [4.9, 6.6],         //         the ridge is plotted, left to right
    deck: [5.0, 5.9],          // b10     the deck: set-out, then up
    towers: 5.5,               // b11     first landings (16ths)
    show: 8.0,                 // b16     SHOW
    strike: 12.0,              // b24     the beams fold away
    back: 12.3,                //         pulled back; the truss re-forms around the camera
    retract: [12.6, 14.3],     //         the truss retracts into the U (finishing just after the camera is out)
    imgIn: [14.2, 14.72],      //         the photo comes back, registered
    land: 14.8                 //         the logo frame (rest to 15.0 = 0.0)
  };
  // The wall calls the event types, one a beat from the SHOW downbeat (8.0). Ordered for rhythm: longest first, so the
  // type grows beat by beat (the typographic camera frames each one), a crescendo into "Live events" at 12.0. Seven,
  // not eight ("Fan experiences" is left out): the last one holds a whole beat while the light draws in, and the climax
  // gets its own beat to build.
  var EVENTS = ['Concerts and tours', 'Brand activations', 'Product launches', 'Car launches', 'Trade shows', 'Keynotes',
    'Sports'];
  var LAST_WORD = ['Live', 'events'];   // "Live events", set stacked on two lines: the climax
  // HUD show calls, on the new clock: [time, cue, 0 = STANDBY / 1 = GO] (the five cues call 04-08, the fold 09)
  var CUES = [[0.08, '01', 0], [0.5, '01', 1], [1.0, '02', 0], [1.5, '02', 1], [3.5, '03', 0], [4.0, '03', 1],
    [4.6, '04', 0], [5.0, '04', 1], [8.9, '05', 0], [9.3, '05', 1], [12.6, '06', 0], [13.0, '06', 1], [16.9, '07', 0], [17.3, '07', 1],
    [20.7, '08', 0], [21.1, '08', 1], [24.6, '09', 0], [25.0, '09', 1], [26.5, '10', 0], [27.0, '10', 1]];
  // the cues (2026-10-06, v4: no stage). "Technical reality." lands as the truss bursts; its pieces fly out into the
  // black and on the beat at SB_AT the five cues play full frame (each as long as its part of the cue video: F frames at
  // 30 fps); a half-second fold to a line of light; then the old timeline resumes at SB_RESUME with no stage world, the
  // truss re-forming round the camera out of the dark, home to the logo. (The stage, its desert and its wall are kept in
  // the code, off: STAGE.)
  var SBK = { F: [129, 111, 129, 114, 117], N: 5, FOLD: 0.5, D: [], T0: [], FRAMES: 0 };
  for (var sbi = 0; sbi < SBK.N; sbi++) { SBK.T0.push(SBK.FRAMES / 30); SBK.D.push(SBK.F[sbi] / 30); SBK.FRAMES += SBK.F[sbi]; }
  SBK.CUES = SBK.FRAMES / 30; SBK.LEN = SBK.CUES + SBK.FOLD;
  var SB_AT = 5.0, SB_RESUME = 12.2, TOTAL = SB_AT + SBK.LEN + (DUR - SB_RESUME);
  var STAGE = false;    // the stage world (desert, CAD floor, stage, LED wall, crowd, beams): off since 2026-10-06
  var STILL_T = 4.6;    // the one still (Pause motion while the reel is up): "Technical reality.", the truss burst apart

  /* ---- World constants (metres) ------------------------------------------ */
  var LT = 128, PANEL = 2.6;       // the truss runs from the back of the U to LT
  var ZS = 150;                    // the stage's centre line (z)
  var FLIGHT = 0.72;               // a piece's flight from the cloud to its place

  /* ---- Maths ------------------------------------------------------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function seg(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function smooth(k) { return k * k * (3 - 2 * k); }
  function fmt(a) { return a < 0 ? 0 : a > 1 ? 1 : Math.round(a * 1000) / 1000; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + fmt(a) + ')'; }
  function mix(a, b, k) { return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))]; }
  var E = {
    inQuad: function (k) { return k * k; },
    outQuad: function (k) { return 1 - (1 - k) * (1 - k); },
    inCubic: function (k) { return k * k * k; },
    inQuart: function (k) { return k * k * k * k; },
    outCubic: function (k) { k = 1 - k; return 1 - k * k * k; },
    inOutCubic: function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    outQuint: function (k) { k = 1 - k; return 1 - k * k * k * k * k; },
    inOutQuart: function (k) { return k < 0.5 ? 8 * k * k * k * k : 1 - Math.pow(-2 * k + 2, 4) / 2; },
    inOutQuint: function (k) { return k < 0.5 ? 16 * k * k * k * k * k : 1 - Math.pow(-2 * k + 2, 5) / 2; },
    inExpo: function (k) { return k <= 0 ? 0 : Math.pow(2, 10 * k - 10); },
    outExpo: function (k) { return k >= 1 ? 1 : 1 - Math.pow(2, -10 * k); },
    inOutExpo: function (k) { return k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2; },
    outBack: function (k) { var c = 1.4, d = k - 1; return 1 + (c + 1) * d * d * d + c * d * d; },
    // a damped spring that lands exactly on 1 at k = 1 (8% overshoot)
    settle: function (k) { return k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(2, -9 * k) * Math.cos(k * Math.PI * 2.5); }
  };
  // Animation curves: keys [t, value, slope?]; a missing slope is set so the curve never overshoots its keys
  // (monotone cubic Hermite: Fritsch-Butland slopes, Fritsch-Carlson limits). Like a curve editor's "auto clamped".
  function Curve(keys) {
    var n = keys.length, T = [], V = [], M = [], fx = [], D = [], i;
    for (i = 0; i < n; i++) { T[i] = keys[i][0]; V[i] = keys[i][1]; fx[i] = keys[i].length > 2; M[i] = fx[i] ? keys[i][2] : 0; }
    for (i = 0; i < n - 1; i++) D[i] = (V[i + 1] - V[i]) / (T[i + 1] - T[i]);
    for (i = 0; i < n; i++) {
      if (fx[i]) continue;
      if (i === 0) M[i] = 0;
      else if (i === n - 1) M[i] = 0;
      else if (D[i - 1] * D[i] <= 0) M[i] = 0;
      else { var h0 = T[i] - T[i - 1], h1 = T[i + 1] - T[i]; M[i] = 3 * (h0 + h1) / ((2 * h1 + h0) / D[i - 1] + (h1 + 2 * h0) / D[i]); }
    }
    for (i = 0; i < n - 1; i++) {
      if (D[i] === 0) { if (!fx[i]) M[i] = 0; if (!fx[i + 1]) M[i + 1] = 0; continue; }
      var a = M[i] / D[i], b = M[i + 1] / D[i], s = a * a + b * b;
      if (s > 9) { var tau = 3 / Math.sqrt(s); if (!fx[i]) M[i] = tau * a * D[i]; if (!fx[i + 1]) M[i + 1] = tau * b * D[i]; }
    }
    return function (t) {
      if (t <= T[0]) return V[0];
      if (t >= T[n - 1]) return V[n - 1];
      var k = 0;
      while (t > T[k + 1]) k++;
      var h = T[k + 1] - T[k], u = (t - T[k]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * V[k] + (u3 - 2 * u2 + u) * h * M[k] + (-2 * u3 + 3 * u2) * V[k + 1] + (u3 - u2) * h * M[k + 1];
    };
  }
  function rng(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // quaternions [x, y, z, w]
  function qAxis(x, y, z, a) { var l = Math.sqrt(x * x + y * y + z * z) || 1, s = Math.sin(a / 2) / l; return [x * s, y * s, z * s, Math.cos(a / 2)]; }
  function qMul(a, b) {
    return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  }
  function qSlerp(a, b, k) {
    var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], s = 1;
    if (d < 0) { d = -d; s = -1; }
    var k0, k1;
    if (d > 0.9995) { k0 = 1 - k; k1 = k; }
    else { var th = Math.acos(d), sn = Math.sin(th); k0 = Math.sin((1 - k) * th) / sn; k1 = Math.sin(k * th) / sn; }
    k1 *= s;
    var q = [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1, a[3] * k0 + b[3] * k1];
    var l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
    return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  }
  function qMat(q, m) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    m[0] = 1 - 2 * (y * y + z * z); m[1] = 2 * (x * y - z * w); m[2] = 2 * (x * z + y * w);
    m[3] = 2 * (x * y + z * w); m[4] = 1 - 2 * (x * x + z * z); m[5] = 2 * (y * z - x * w);
    m[6] = 2 * (x * z - y * w); m[7] = 2 * (y * z + x * w); m[8] = 1 - 2 * (x * x + y * y);
  }
  var Q_ID = [0, 0, 0, 1], Q_UP = qAxis(0, 0, 1, Math.PI / 2), Q_Z = qAxis(0, 1, 0, -Math.PI / 2);   // local x -> y, x -> z

  /* ==========================================================================
     One reel on one canvas
     ========================================================================== */
  /* ==========================================================================
     Cue 5-6 (2026-10-06, v3): the cues on the LED wall
     ==========================================================================
     At the SHOW downbeat (8.0) the camera pushes into the LED wall. On its face five cues play, each an object or a
     person in black space that opens into its world (Keynotes, Activations, Experiential, Live Entertainment, Sports),
     their words set over them; then the picture folds to a line of light, as a wall powering down, and the camera comes
     back out of the wall and home to the logo.
     The pictures are the Higgsfield render of the storyboard (media/endreel/cues.mp4: five MiniMax H3 clips joined at
     30 fps and smoothed, pixel by pixel, wherever they flickered: see brand/raw/endreel/FINAL.md). makeStory draws the
     same five cues itself (the storyboard, brand/raw/endreel/storyboard-v5/), for a browser that cannot play the video
     yet, from five pre-rendered worlds (media/endreel/world-*.jpg) and its own drawing of a microscope. */
  function makeStory(base) {
    var W = 1600, H = 900, TAU = Math.PI * 2, q = 0, CW = 0, CH = 0;
    var SC = mk(2, 2), P = {}, WORLD = {}, IMG = {};
    var NAMES = { keynote: 'world-keynote.jpg', keynoteEmpty: 'world-keynote-empty.jpg', build: 'world-build.jpg', tower: 'world-tower.jpg', pov: 'world-pov.jpg', viewing: 'world-viewing.jpg' };
    function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
    var started = false;
    function start() {   // (the worlds load only when the reel is asked to prepare or reaches the cues)
      if (started) return; started = true;
      for (var nm in NAMES) (function (name) { var im = new Image(); im.decoding = 'async'; im.onload = function () { im._ok = true; }; im.onerror = function () { im._bad = true; }; im.src = base + name; IMG[name] = im; })(NAMES[nm]);
    }
    function ready() { if (!started) return false; for (var n in NAMES) if (!IMG[NAMES[n]]._ok) return false; return true; }
    function size(w) {
      var nq = Math.round(clamp(w / W, 0.6, 1.5) * 20) / 20;
      if (nq === q) return;
      q = nq; CW = Math.round(W * q); CH = Math.round(H * q); SC.width = CW; SC.height = CH; WORLD = {};
      ['mask', 'inside', 'tint'].forEach(function (n) { P[n] = mk(CW, CH); });
    }
    function raw(c) { var k = c.getContext('2d'); k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = 1; k.globalCompositeOperation = 'source-over'; k.filter = 'none'; return k; }
    function des(k) { k.setTransform(q, 0, 0, q, 0, 0); return k; }
    function cam(k, z, cx, cy, fx, fy) { k.setTransform(q * z, 0, 0, q * z, q * (cx - z * fx), q * (cy - z * fy)); return k; }
    function world(key, hue) {   // a world at the canvas's size, and the same world in one colour
      var id = key + hue, w = WORLD[id]; if (w) return w;
      var im = IMG[NAMES[key]]; if (!im || !im._ok) return null;
      var c = mk(CW, CH), k = c.getContext('2d'); k.drawImage(im, 0, 0, CW, CH);
      var d = mk(CW, CH), kd = d.getContext('2d'); kd.drawImage(c, 0, 0);
      kd.globalCompositeOperation = 'color'; kd.fillStyle = 'rgb(' + hue + ')'; kd.fillRect(0, 0, CW, CH);
      kd.globalCompositeOperation = 'screen'; kd.fillStyle = 'rgba(' + hue + ',0.14)'; kd.fillRect(0, 0, CW, CH);
      return (WORLD[id] = { c: c, d: d });
    }

    /* ---- drawing, in design space ---- */
    function lin(k, x0, y0, x1, y1, st) { var g = k.createLinearGradient(x0, y0, x1, y1); st.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
    function rad(k, x, y, r, st, sy) {
      k.save(); k.translate(x, y); if (sy) k.scale(1, sy);
      var g = k.createRadialGradient(0, 0, 0, 0, 0, r); st.forEach(function (s) { g.addColorStop(s[0], s[1]); });
      k.fillStyle = g; k.beginPath(); k.arc(0, 0, r, 0, TAU); k.fill(); k.restore();
    }
    function ell(k, x, y, rx, ry, rot) { k.beginPath(); k.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
    function U(o, u, p) { return [o[0] + p[0] * u, o[1] + p[1] * u]; }
    function fadeBlack(k, a) { if (a <= 0) return; k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1; k.fillStyle = 'rgba(0,0,0,' + fmt(a) + ')'; k.fillRect(0, 0, CW, CH); k.restore(); }
    function spindle(m, a, b, ra, rm, rb, tm) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, N = 12, i, t, r, A = [], B = [];
      tm = tm || 0.4; if (rm == null) rm = (ra + rb) / 2;
      for (i = 0; i <= N; i++) {
        t = i / N; r = t < tm ? ra + (rm - ra) * smooth(t / tm) : rm + (rb - rm) * smooth((t - tm) / (1 - tm));
        A.push([a[0] + dx * t + nx * r, a[1] + dy * t + ny * r]); B.push([a[0] + dx * t - nx * r, a[1] + dy * t - ny * r]);
      }
      m.beginPath(); m.moveTo(A[0][0], A[0][1]); for (i = 1; i <= N; i++) m.lineTo(A[i][0], A[i][1]);
      for (i = N; i >= 0; i--) m.lineTo(B[i][0], B[i][1]); m.closePath(); m.fill();
      m.beginPath(); m.arc(a[0], a[1], ra, 0, TAU); m.fill(); m.beginPath(); m.arc(b[0], b[1], rb, 0, TAU); m.fill();
    }
    function person(m, ps, o, u) {
      function J(k) { return U(o, u, ps[k]); }
      var t = ps.torso;
      ['B', 'F'].forEach(function (s) {
        spindle(m, J('hip' + s), J('kn' + s), 0.36 * u, 0.33 * u, 0.22 * u, 0.25);
        spindle(m, J('kn' + s), J('an' + s), 0.22 * u, 0.25 * u, 0.12 * u, 0.3);
        spindle(m, J('an' + s), J('toe' + s), 0.13 * u, 0.13 * u, 0.08 * u, 0.4);
        spindle(m, J('sh' + s), J('el' + s), 0.24 * u, 0.23 * u, 0.17 * u, 0.3);
        spindle(m, J('el' + s), J('wr' + s), 0.17 * u, 0.19 * u, 0.11 * u, 0.3);
        spindle(m, J('wr' + s), J('ha' + s), 0.12 * u, 0.14 * u, 0.09 * u, 0.5);
      });
      spindle(m, J('hipB'), J('hipF'), 0.38 * u, 0.4 * u, 0.38 * u, 0.5);
      spindle(m, J('shB'), J('shF'), 0.26 * u, 0.28 * u, 0.26 * u, 0.5);
      var n = J('neck'), p = J('pelvis'), h = J('head');
      spindle(m, n, p, t[0] * 0.9 * u, t[1] * u, t[2] * u, 0.62);
      m.beginPath(); m.arc(n[0] + (p[0] - n[0]) * 0.28, n[1] + (p[1] - n[1]) * 0.28, t[0] * u, 0, TAU); m.fill();
      spindle(m, n, h, 0.22 * u, 0.2 * u, 0.22 * u, 0.5);
      m.save(); m.translate(h[0], h[1]); m.rotate(ps.headRot || 0); ell(m, 0, 0, 0.41 * u, 0.52 * u); m.fill();
      if (ps.face) { var f = ps.face; m.beginPath(); m.moveTo(f * 0.34 * u, -0.14 * u); m.lineTo(f * 0.53 * u, 0.07 * u); m.lineTo(f * 0.34 * u, 0.16 * u); m.closePath(); m.fill(); ell(m, f * 0.18 * u, 0.36 * u, 0.25 * u, 0.2 * u); m.fill(); }
      m.restore();
    }
    function fan(k, cx, cy, a0, a1, r0, r1, hue, peak) {
      var N = 40; k.save(); k.globalCompositeOperation = 'lighter';
      for (var i = 0; i < N; i++) {
        var t1 = (i + 1) / N, b0 = a0 + (a1 - a0) * i / N, b1 = a0 + (a1 - a0) * t1;
        k.fillStyle = 'rgba(' + hue + ',' + fmt(peak * t1 * t1) + ')';
        k.beginPath(); k.arc(cx, cy, r1, Math.min(b0, b1), Math.max(b0, b1) + 0.004); k.arc(cx, cy, r0, Math.max(b0, b1) + 0.004, Math.min(b0, b1), true); k.closePath(); k.fill();
      }
      k.restore();
    }

    /* ---- the five subjects (frame A coordinates) ---- */
    var BAT = { pelvis: [0, 0], hipF: [0.3, 0.05], hipB: [-0.3, -0.02], knF: [1.2, 1.5], anF: [1.6, 3.3], toeF: [2.45, 3.42], knB: [-0.95, 1.6], anB: [-1.85, 3.0], toeB: [-1.15, 3.42],
      neck: [0.45, -2.5], head: [0.85, -3.15], headRot: 0.3, face: 1, torso: [0.6, 0.48, 0.58],
      shF: [0.85, -2.25], elF: [2.04, -1.51], wrF: [2.89, -0.98], haF: [3.25, -0.82], shB: [0.35, -2.3], elB: [1.45, -1.45], wrB: [2.7, -1.05], haB: [3.05, -0.92] };
    var DRUM = { pelvis: [0, 0], hipF: [0.5, 0], hipB: [-0.5, 0], knF: [0.75, 0.6], anF: [0.8, 2.9], toeF: [0.95, 3.1], knB: [-0.75, 0.6], anB: [-0.8, 2.9], toeB: [-0.95, 3.1],
      neck: [0.05, -2.5], head: [0.12, -3.15], headRot: 0.15, torso: [0.92, 0.7, 0.85],
      shF: [0.95, -2.3], elF: [1.9, -2.85], wrF: [1.7, -3.85], haF: [1.6, -4.1], shB: [-0.95, -2.3], elB: [-1.5, -1.3], wrB: [-1.25, -0.45], haB: [-1.05, -0.3] };
    var oBat = [940, 470], uBat = 88, oDrum = [1130, 470], uDrum = 72, BTN = { cx: 1090, top: 450 }, HS = { cx: 1080, cy: 430 };
    function batter(m) { var o = oBat, u = uBat; person(m, BAT, o, u); spindle(m, U(o, u, [2.75, -0.98]), U(o, u, [6.15, -1.45]), 0.085 * u, 0.1 * u, 0.21 * u, 0.6); }
    function drummer(m) {
      var o = oDrum, u = uDrum;
      function E2(x, y, rx, ry, rot) { var c = U(o, u, [x, y]); ell(m, c[0], c[1], rx * u, ry * u, rot); m.fill(); }
      function R(x0, y0, x1, y1) { var a = U(o, u, [x0, y0]), b = U(o, u, [x1, y1]); m.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      function S(a, b, r0, r1) { spindle(m, U(o, u, a), U(o, u, b), r0 * u, (r0 + r1) / 2 * u, r1 * u); }
      person(m, DRUM, o, u);
      S([1.6, -4.1], [0.85, -5.55], 0.07, 0.045); S([-1.05, -0.3], [-1.6, 0.38], 0.07, 0.045);
      var bd = U(o, u, [0, 1.75]); m.beginPath(); m.arc(bd[0], bd[1], 1.35 * u, 0, TAU); m.fill();
      E2(-0.6, 0.12, 0.52, 0.34, 0.3); S([-0.6, 0.12], [-0.55, 0.6], 0.42, 0.42); E2(0.65, 0.12, 0.52, 0.34, -0.3); S([0.65, 0.12], [0.6, 0.6], 0.42, 0.42);
      E2(-1.45, 0.45, 0.72, 0.2, 0); R(-2.17, 0.45, -0.73, 0.82); S([-1.45, 0.8], [-1.45, 2.6], 0.05, 0.05); S([-1.45, 2.6], [-1.9, 3.1], 0.04, 0.04); S([-1.45, 2.6], [-1.0, 3.1], 0.04, 0.04);
      E2(1.8, 0.85, 0.66, 0.2, 0); R(1.14, 0.85, 2.46, 1.9); S([1.3, 1.9], [1.25, 3.1], 0.05, 0.05); S([2.3, 1.9], [2.35, 3.1], 0.05, 0.05);
      E2(-2.45, -0.3, 0.66, 0.07, 0); E2(-2.45, -0.18, 0.66, 0.07, 0); S([-2.45, -0.18], [-2.45, 3.1], 0.05, 0.05);
      E2(-2.7, -2.0, 0.95, 0.12, -0.25); S([-2.7, -2.0], [-2.3, 3.1], 0.05, 0.05);
      E2(2.6, -2.45, 1.0, 0.13, 0.3); S([2.6, -2.45], [2.3, 3.1], 0.05, 0.05);
      E2(2.85, -0.55, 0.95, 0.12, 0.15); S([2.85, -0.55], [2.85, 3.1], 0.05, 0.05);
    }
    function button(m, p) {
      var cx = BTN.cx, top = BTN.top, d = p && p.d || 0;
      ell(m, cx, 800, 220, 42); m.fill();
      m.fillRect(cx - 82, top + 30, 164, 800 - top - 30); ell(m, cx, 800, 82, 18); m.fill();
      m.fillRect(cx - 235, top, 470, 46); ell(m, cx, top + 46, 235, 60); m.fill(); ell(m, cx, top, 235, 60); m.fill();
      m.fillRect(cx - 172, top - 30, 344, 30); ell(m, cx, top - 30, 172, 44); m.fill();
      m.beginPath(); m.ellipse(cx, top - 30 + d, 158, 122 - d * 1.5, 0, Math.PI, TAU); m.fill(); ell(m, cx, top - 30 + d, 158, 40); m.fill();
    }
    function headset(m) {
      var cx = HS.cx, cy = HS.cy;
      m.save(); m.lineWidth = 44; m.strokeStyle = '#fff'; m.beginPath(); m.ellipse(cx, cy + 70, 470, 300, 0, 0, TAU); m.stroke(); m.restore();
      spindle(m, [cx, cy - 120], [cx, cy - 228], 30, 30, 30);
      m.beginPath(); m.roundRect(cx - 310, cy - 130, 620, 262, 120); m.fill();
    }
  // Our own drawing of a binocular lab microscope, front on, as seen from the seat (2026-10-06; it replaces the owner's
  // product photograph). micV(m, mode): 'mask' fills every part in the current fill style (the window); 'detail' draws
  // the edge lines and highlights that make it read as a machined object, over the filled window.
  var MICV = { ox: 1120, oy: 108, s: 1, lensL: [-69, 0], lensR: [69, 0] };
  function micPt(p) { return [MICV.ox + p[0] * MICV.s, MICV.oy + p[1] * MICV.s]; }
  function micV(m, mode) {
    var det = mode === 'detail', D = 'rgba(0,0,0,0.55)', L = 'rgba(255,255,255,0.32)';
    function shape(fn, light) { m.beginPath(); fn(); if (!det) m.fill(); else { m.strokeStyle = D; m.lineWidth = 2.5; m.stroke(); } }
    function rr(x, y, w, h, r) { shape(function () { m.roundRect(x, y, w, h, r); }); }
    function pg(p) { shape(function () { m.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) m.lineTo(p[i][0], p[i][1]); m.closePath(); }); }
    function line(x0, y0, x1, y1, c, w) { if (!det) return; m.strokeStyle = c || D; m.lineWidth = w || 2.5; m.beginPath(); m.moveTo(x0, y0); m.lineTo(x1, y1); m.stroke(); }
    function ring(x, y, rx, ry, c) { if (!det) return; m.strokeStyle = c || D; m.lineWidth = 2.5; m.beginPath(); m.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); m.stroke(); }
    m.save(); m.translate(MICV.ox, MICV.oy); m.scale(MICV.s, MICV.s); m.lineJoin = 'round'; m.lineCap = 'round';
    // the base, the limb and the light port
    pg([[-120, 610], [120, 610], [152, 648], [152, 692], [-152, 692], [-152, 648]]);
    pg([[-62, 238], [62, 238], [86, 640], [-86, 640]]);
    line(-150, 650, 150, 650); line(-60, 250, -82, 600, L, 2); ring(0, 600, 38, 38); ring(0, 600, 24, 24);
    // the focus knobs, coarse and fine, both sides; the stage's drive on the right
    rr(-152, 468, 64, 98, 22); rr(88, 468, 64, 98, 22); rr(-180, 494, 32, 48, 12); rr(148, 494, 32, 48, 12);
    for (var g = 0; g < 4; g++) { line(-142 + g * 14, 480, -142 + g * 14, 554); line(98 + g * 14, 480, 98 + g * 14, 554); }
    rr(144, 388, 14, 122, 4); rr(134, 470, 34, 22, 6); rr(136, 496, 30, 20, 6);
    // the condenser under the stage
    rr(-40, 388, 80, 44, 8); rr(-58, 430, 116, 16, 8);
    // the stage: a black plate, its top face catching the light, two clips
    pg([[-166, 350], [166, 350], [174, 364], [-174, 364]]); rr(-174, 362, 348, 26, 4);
    rr(-124, 343, 64, 7, 3); rr(60, 343, 64, 7, 3);
    if (det) { m.fillStyle = 'rgba(255,255,255,0.12)'; m.beginPath(); m.moveTo(-166, 350); m.lineTo(166, 350); m.lineTo(174, 364); m.lineTo(-174, 364); m.closePath(); m.fill(); }
    // the revolving nosepiece and three objectives
    rr(-76, 236, 152, 32, 14);
    pg([[-16, 266], [16, 266], [11, 352], [-11, 352]]); pg([[-56, 260], [-30, 262], [-46, 334], [-64, 330]]); pg([[56, 260], [30, 262], [46, 334], [64, 330]]);
    line(-14, 300, 14, 300); line(-58, 292, -36, 294); line(58, 292, 36, 294); line(-74, 252, 74, 252);
    // the arm's support and the binocular head with its prism housing
    rr(-76, 186, 152, 62, 10);
    pg([[-94, 100], [94, 100], [72, 194], [-72, 194]]);
    shape(function () { m.arc(0, 108, 36, 0, Math.PI * 2); });
    line(-90, 104, -70, 190, L, 2);
    // the eyepieces: two tubes angled out, rubber cups, the lenses
    [-1, 1].forEach(function (d) {
      m.save(); m.translate(d * 48, 124); m.rotate(d * 0.17);
      rr(-27, -112, 54, 112, 6); rr(-33, -126, 66, 42, 10);
      line(-27, -84, 27, -84); line(-24, -78, -24, -8, L, 2);
      ring(0, -126, 25, 9);
      m.restore();
    });
    m.restore();
  }
    function microscope(m) { micV(m, 'mask'); }

    /* ---- the light that belongs to each subject (through the same camera); p: 0-1 through frame A ---- */
    function batX(k, c, p) {
      var h = U(oBat, uBat, [2.75, -0.98]), a1 = Math.atan2(-0.47, 3.4), a0 = -2.5;
      if (p > 0.02) fan(k, h[0], h[1], a0, lerp(a0, a1, E.outCubic(p)), 0.9 * uBat, 3.5 * uBat, c.hue, 0.34);
      var hit = smooth(seg(p, 0.78, 1));
      if (hit <= 0) return;
      var bx = h[0] + Math.cos(a1) * 2.75 * uBat, by = h[1] + Math.sin(a1) * 2.75 * uBat;
      k.save(); k.globalCompositeOperation = 'lighter';
      k.strokeStyle = lin(k, bx + 460, by + 34, bx, by, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,' + fmt(0.85 * hit) + ')']]); k.lineWidth = 5; k.lineCap = 'round';
      k.beginPath(); k.moveTo(bx + 460, by + 34); k.lineTo(bx, by); k.stroke();
      rad(k, bx, by, 46, [[0, 'rgba(255,255,255,' + fmt(0.95 * hit) + ')'], [0.3, 'rgba(' + c.hue + ',' + fmt(0.5 * hit) + ')'], [1, 'rgba(' + c.hue + ',0)']]);
      k.restore();
    }
    function drumX(k, c, p) {
      var h = U(oDrum, uDrum, [1.6, -4.1]), a1 = Math.atan2(-1.45, -0.75), h2 = U(oDrum, uDrum, [-1.05, -0.3]);
      if (p > 0.02) { fan(k, h[0], h[1], -2.95, lerp(-2.95, a1, E.outCubic(p)), 0.15 * uDrum, 1.62 * uDrum, c.hue, 0.4); fan(k, h2[0], h2[1], -1.2, lerp(-1.2, Math.atan2(0.68, -0.55), E.outCubic(p)), 0.15 * uDrum, 0.88 * uDrum, c.hue, 0.3); }
      k.save(); k.globalCompositeOperation = 'lighter';
      [[-3.5, -1.8], [3.45, -2.75], [3.7, -0.68]].forEach(function (pt, i) { var g = U(oDrum, uDrum, pt), a = 0.6 + 0.2 * Math.sin(p * 3 + i * 2); rad(k, g[0], g[1], 28, [[0, 'rgba(255,255,255,' + fmt(0.9 * a) + ')'], [1, 'rgba(' + c.hue + ',0)']]); });
      k.restore();
    }
    function buttonX(k, c, p) {
      var cx = BTN.cx, top = BTN.top, gl = p && p.glow != null ? p.glow : 1;
      k.save(); k.globalCompositeOperation = 'lighter';
      rad(k, cx, top - 90, 330, [[0, 'rgba(' + c.hue + ',' + fmt(0.55 * gl) + ')'], [1, 'rgba(' + c.hue + ',0)']], 0.8);
      rad(k, cx, top - 100, 120, [[0, 'rgba(255,255,255,' + fmt(0.75 * gl) + ')'], [1, 'rgba(255,255,255,0)']], 0.6);
      rad(k, cx, 806, 380, [[0, 'rgba(' + c.hue + ',' + fmt(0.3 * gl) + ')'], [1, 'rgba(' + c.hue + ',0)']], 0.14);
      k.restore();
    }
    function micX(k, c) {
      micV(k, 'detail');
      k.save(); k.globalCompositeOperation = 'lighter';
      [MICV.lensL, MICV.lensR].forEach(function (p) { var e = micPt(p); rad(k, e[0], e[1], 62, [[0, 'rgba(255,255,255,0.95)'], [0.3, 'rgba(' + c.hue + ',0.75)'], [1, 'rgba(' + c.hue + ',0)']], 0.7); });
      var f = micPt([0, 600]); rad(k, f[0], f[1], 46, [[0, 'rgba(255,255,255,0.7)'], [1, 'rgba(' + c.hue + ',0)']]);
      var b = micPt([0, 694]); rad(k, b[0], b[1], 420, [[0, 'rgba(' + c.hue + ',0.18)'], [1, 'rgba(' + c.hue + ',0)']], 0.12);
      k.restore();
    }
    function headsetX(k, c) {
      var cx = HS.cx, cy = HS.cy, wd = world(c.world, c.hue);
      k.save(); k.fillStyle = 'rgba(0,0,0,0.6)'; k.beginPath(); k.roundRect(cx - 280, cy - 104, 560, 212, 98); k.fill();
      k.fillStyle = '#000'; k.beginPath(); k.moveTo(cx - 56, cy + 133); k.quadraticCurveTo(cx - 46, cy + 46, cx, cy + 40); k.quadraticCurveTo(cx + 46, cy + 46, cx + 56, cy + 133); k.closePath(); k.fill(); k.restore();
      [cx - 128, cx + 128].forEach(function (lx, j) {
        var ly = cy - 12, R = 86;
        k.save(); ell(k, lx, ly, R, R); k.clip();
        if (wd) { k.save(); k.translate(lx, ly); k.scale(0.3, 0.3); k.translate(-800 + (j ? 18 : -18), -450); k.drawImage(wd.d, 0, 0, W, H); k.globalAlpha = 0.65; k.drawImage(wd.c, 0, 0, W, H); k.restore(); }
        var vg = k.createRadialGradient(lx, ly, R * 0.45, lx, ly, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); k.fillStyle = vg; k.fillRect(lx - R, ly - R, 2 * R, 2 * R);
        k.restore();
        k.save(); k.globalCompositeOperation = 'lighter'; k.strokeStyle = 'rgba(' + c.hue + ',0.85)'; k.lineWidth = 3; ell(k, lx, ly, R + 3, R + 3); k.stroke();
        k.strokeStyle = 'rgba(255,255,255,0.35)'; k.lineWidth = 4; k.beginPath(); k.arc(lx, ly, R - 14, -2.6, -1.9); k.stroke(); k.restore();
      });
    }

    /* ---- frames ---- */
    function figFrame(k, c, z, mix, u, p, a) {
      if (a <= 0) return;
      var f = c.focus, cx = lerp(f[0], 800, u), cy = lerp(f[1], 450, u), wd = world(c.worldA || c.world, c.hue);
      var m = raw(P.mask); m.clearRect(0, 0, CW, CH); cam(m, z, cx, cy, f[0], f[1]); m.fillStyle = '#fff'; m.strokeStyle = '#fff'; c.fig(m, p);
      var ki = raw(P.inside); ki.clearRect(0, 0, CW, CH);
      if (wd) {
        var ox = lerp(c.figC[0] - 800, 0, u) * q, oy = lerp(c.figC[1] - 450, 0, u) * q;
        ki.drawImage(wd.d, ox, oy); if (mix > 0) { ki.globalAlpha = mix; ki.drawImage(wd.c, ox, oy); ki.globalAlpha = 1; }
      }
      ki.globalCompositeOperation = 'destination-in'; ki.drawImage(P.mask, 0, 0); ki.globalCompositeOperation = 'source-over';
      rimOf(k, c.hue, a, false);
      k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = a; k.drawImage(P.inside, 0, 0); k.restore();
      if (c.extra) { k.save(); cam(k, z, cx, cy, f[0], f[1]); k.globalAlpha = a; c.extra(k, c, p); k.restore(); }
    }
    function shadowFrame(k, c, z, u, p, a) {
      if (a <= 0) return;
      var f = c.focus, cx = lerp(f[0], 800, u), cy = lerp(f[1], 450, u);
      var m = raw(P.mask); m.clearRect(0, 0, CW, CH); cam(m, z, cx, cy, f[0], f[1]); m.fillStyle = '#fff'; c.fig(m, p);
      rimOf(k, c.hue, a, true);
    }
    function rimOf(k, hue, a, black) {
      var t = raw(P.tint); t.clearRect(0, 0, CW, CH); t.drawImage(P.mask, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = 'rgb(' + hue + ')'; t.fillRect(0, 0, CW, CH);
      k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.globalCompositeOperation = 'lighter';
      k.filter = 'blur(' + (30 * q).toFixed(1) + 'px)'; k.globalAlpha = 0.32 * a; k.drawImage(P.tint, 0, 0);
      k.filter = 'blur(' + (2 * q).toFixed(1) + 'px)'; k.globalAlpha = 0.95 * a; k.drawImage(P.tint, 0, 0);
      k.filter = 'none';
      if (black) { t.fillStyle = '#000'; t.fillRect(0, 0, CW, CH); k.globalCompositeOperation = 'source-over'; k.globalAlpha = a; k.drawImage(P.tint, 0, 0); }
      k.restore();
    }
    function circleView(k, wd, cx, cy, R, scale, shift, mix, a, o, hue) {
      if (!wd || a <= 0 || R < 1) return;
      k.save(); des(k); k.globalAlpha = a; ell(k, cx, cy, R, R); k.clip();
      k.save(); k.translate(cx, cy); k.scale(scale, scale); k.translate(-800 + shift, -450); k.drawImage(wd.d, 0, 0, W, H); k.globalAlpha = a * mix; k.drawImage(wd.c, 0, 0, W, H); k.restore();
      k.globalAlpha = a;
      if (o.vig > 0) { var vg = k.createRadialGradient(cx, cy, R * 0.5, cx, cy, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + fmt(0.78 * o.vig) + ')'); k.fillStyle = vg; k.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
      if (o.cross > 0) {
        k.strokeStyle = 'rgba(255,255,255,' + fmt(0.3 * o.cross) + ')'; k.lineWidth = 1.2; k.beginPath(); k.moveTo(cx - R, cy); k.lineTo(cx + R, cy); k.moveTo(cx, cy - R); k.lineTo(cx, cy + R);
        for (var i = -10; i <= 10; i++) { var tl = i % 5 ? 7 : 15; k.moveTo(cx + i * 22, cy - tl); k.lineTo(cx + i * 22, cy + tl); }
        k.stroke();
      }
      k.restore();
      if (o.ring > 0) { k.save(); des(k); k.globalCompositeOperation = 'lighter'; k.strokeStyle = 'rgba(' + hue + ',' + fmt(0.75 * o.ring * a) + ')'; k.lineWidth = 2.5; ell(k, cx, cy, R, R); k.stroke(); k.lineWidth = 14; k.globalAlpha = 0.25; k.stroke(); k.restore(); }
    }
    function worldFull(k, c, hold) {
      var wd = world(c.world, c.hue); if (!wd) return;
      var s = 1 + 0.035 * hold; k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.drawImage(wd.c, CW * (1 - s) / 2, CH * (1 - s) / 2, CW * s, CH * s); k.restore();
    }
    // the storyboard's beats (designed for 2.5 s), stretched over the cue's length (CUE_LEN, set by frame())
    var CUE_LEN = SBK.D[0];
    function phases(t) { var u = t * 2.5 / CUE_LEN; return { aIn: smooth(seg(u, 0, 0.3)), act: seg(u, 0.25, 1.2), push: seg(u, 1.2, 1.7), rev: seg(u, 1.7, 2.1), hold: seg(u, 2.1, 2.45), out: smooth(seg(u, 2.4, 2.5)), u: u }; }
    function figCue(k, c, t) {
      var ph = phases(t), pe = E.inOutCubic(ph.push), re = E.inOutCubic(ph.rev), zB = c.zB;
      if (ph.rev >= 1) worldFull(k, c, ph.hold);
      else { figFrame(k, c, (ph.rev > 0 ? zB * Math.pow(32 / zB, re) : 1 + (zB - 1) * pe) * (0.96 + 0.04 * ph.aIn), 0.5 * pe + 0.5 * re, pe, ph.act, 1); fadeBlack(k, 1 - ph.aIn); }
      fadeBlack(k, ph.out);
    }
    function micCue(k, c, t) {
      var ph = phases(t), pe = E.inOutCubic(ph.push), re = E.inOutCubic(ph.rev), cv = smooth(seg(ph.push, 0.5, 1));
      if (ph.rev >= 1) worldFull(k, c, ph.hold);
      else {
        if (cv < 1) { figFrame(k, c, (1 + 4 * pe) * (0.96 + 0.04 * ph.aIn), 0.3 * pe, pe, ph.act, 1); fadeBlack(k, cv); }
        circleView(k, world(c.world, c.hue), 800, 450, lerp(392, 1000, re), lerp(0.56, 1, re), 0, lerp(0.5, 1, re), cv, { vig: 1 - re, cross: 1 - re, ring: 1 - re }, c.hue);
        fadeBlack(k, 1 - ph.aIn);
      }
      fadeBlack(k, ph.out);
    }
    function vrCue(k, c, t) {
      var ph = phases(t), pe = E.inOutCubic(ph.push), re = E.inOutCubic(ph.rev), cv = smooth(seg(ph.push, 0.5, 1)), wd = world(c.world, c.hue);
      if (ph.rev >= 1) worldFull(k, c, ph.hold);
      else {
        if (cv < 1) { figFrame(k, c, (1 + 2.4 * pe) * (0.96 + 0.04 * ph.aIn), 0.3 * pe, pe, ph.act, 1); fadeBlack(k, cv); }
        [-1, 1].forEach(function (e) { circleView(k, wd, lerp(800 + e * 360, 800, re), 450, lerp(330, 1150, re), lerp(0.8, 1, re), e * 16 * (1 - re), lerp(0.55, 1, re), cv, { vig: 1 - re, cross: 0, ring: 1 - re }, c.hue); });
        fadeBlack(k, 1 - ph.aIn);
      }
      fadeBlack(k, ph.out);
    }
    function btnCue(k, c, t) {
      var ph = phases(t), pe = E.inOutCubic(ph.push), re = E.inOutCubic(ph.rev), press = smooth(seg(ph.u, 0.95, 1.12)), wd = world(c.world, c.hue);
      if (ph.rev >= 1) worldFull(k, c, ph.hold);
      else {
        var z = (1 + 1.3 * pe) * (0.96 + 0.04 * ph.aIn) + 0.5 * re, bk = smooth(seg(ph.push, 0.25, 0.7)), p = { d: 34 * press, glow: 1 - 0.3 * press };
        var R = ph.rev > 0 ? lerp(400, 1300, re) : 400 * E.outCubic(seg(ph.push, 0.35, 1));
        var f = c.focus;
        circleView(k, wd, lerp(f[0], 800, pe), lerp(f[1], 450, pe), R, 1, 0, lerp(0.6, 1, re), 1, { vig: 0, cross: 0, ring: 1 - re }, c.hue);
        figFrame(k, c, z, 0, pe, p, 1 - bk);
        shadowFrame(k, c, z, pe, p, bk * (1 - re));
        fadeBlack(k, 1 - ph.aIn);
      }
      fadeBlack(k, ph.out);
    }
    var CUEL = [
      { hue: '255,168,60', world: 'keynote', worldA: 'keynoteEmpty', fig: microscope, extra: micX, figC: [1120, 450], focus: micPt(MICV.lensL), run: micCue },
      { hue: '255,46,136', world: 'build', fig: button, extra: buttonX, figC: [1090, 470], focus: [BTN.cx, BTN.top - 60], run: btnCue },
      { hue: '60,236,214', world: 'tower', fig: headset, extra: headsetX, figC: [1080, 450], focus: [1080, 418], run: vrCue },
      { hue: '168,96,255', world: 'pov', fig: drummer, extra: drumX, figC: [1130, 420], focus: U(oDrum, uDrum, [0.12, -3.0]), zB: 3.4, run: figCue },
      { hue: '190,255,64', world: 'viewing', fig: batter, extra: batX, figC: [1150, 460], focus: U(oBat, uBat, [1.6, -1.6]), zB: 3.0, run: figCue }
    ];
    // cue i at t seconds into it, on the story's own canvas
    function frame(i, t) {
      start();
      var k = raw(SC); k.fillStyle = '#000'; k.fillRect(0, 0, CW, CH); des(k);
      i = Math.max(0, Math.min(4, i)); CUE_LEN = SBK.D[i]; var c = CUEL[i]; c.run(k, c, t);
      return SC;
    }
    return { size: size, frame: frame, ready: ready, start: start, canvas: SC };
  }

  function create(canvas, opts) {
    opts = opts || {};
    // (not opaque: an opaque canvas lets the browser draw text with coloured LCD fringes, which would put saturated
    // red pixels on screen; the reel paints every pixel anyway)
    var ctx = canvas.getContext('2d', { alpha: true });
    var api = { duration: TOTAL, W: 0, H: 0, time: 0, playing: false, STILL: STILL_T, TL: TL };
    var DBG = api.dbg = {};   // review switches (noLines, noBloom, noLED, noFx, noCrowd, noType, noSweep, noSpill, noGrid, noLighten, round...)
    var W = 1, H = 1, Wc = 1, Hc = 1, dpr = 1, LITE = false;
    var HEAD = opts.head != null ? opts.head : 76, ROOM = opts.room != null ? opts.room : -1, RECT = null;
    var KIND = 'wide', A = FINAL.wide.arc, TY = 2.35, GROUND = -3.44, PORTRAIT = false;

    function mk(w, h) { var c = document.createElement('canvas'); c.width = w || 1; c.height = h || 1; return c; }
    var glow = mk(), gx = glow.getContext('2d'), glow2 = mk(), g2x = glow2.getContext('2d'), glow3 = mk(), g3x = glow3.getContext('2d');
    var GS = 0.25;                                         // the glow buffer's scale
    var layer = mk(), lx = layer.getContext('2d'), layerOk = false, layerKey = '';
    var IMG = {};                                          // loaded images by src
    var imgRect = { x: 0, y: 0, w: 1, h: 1 };

    /* ---- Sprites ---- */
    var SPR = [];
    (function () {
      var g = mk(64, 64), c = g.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,252,244,1)'); gr.addColorStop(0.12, 'rgba(255,250,240,0.75)');
      gr.addColorStop(0.35, 'rgba(255,248,236,0.18)'); gr.addColorStop(1, 'rgba(255,248,236,0)');
      c.fillStyle = gr; c.fillRect(0, 0, 64, 64); SPR[0] = g;   // 0: a soft point of light
      var s = mk(128, 128), d = s.getContext('2d');
      d.globalCompositeOperation = 'lighter';
      d.drawImage(g, 40, 40, 48, 48);
      var lg = d.createLinearGradient(0, 64, 128, 64);
      lg.addColorStop(0, 'rgba(255,250,240,0)'); lg.addColorStop(0.5, 'rgba(255,250,240,0.9)'); lg.addColorStop(1, 'rgba(255,250,240,0)');
      d.fillStyle = lg; d.fillRect(0, 63, 128, 2);
      var vg = d.createLinearGradient(64, 24, 64, 104);
      vg.addColorStop(0, 'rgba(255,250,240,0)'); vg.addColorStop(0.5, 'rgba(255,250,240,0.55)'); vg.addColorStop(1, 'rgba(255,250,240,0)');
      d.fillStyle = vg; d.fillRect(63.5, 24, 1, 80);
      SPR[1] = s;                                                 // 1: a four-point chrome glint
      var l = mk(64, 64), e = l.getContext('2d'), lr = e.createRadialGradient(32, 32, 0, 32, 32, 32);
      lr.addColorStop(0, 'rgba(232,255,140,1)'); lr.addColorStop(0.2, 'rgba(216,255,61,0.55)'); lr.addColorStop(1, 'rgba(216,255,61,0)');
      e.fillStyle = lr; e.fillRect(0, 0, 64, 64); SPR[2] = l;     // 2: the lime work light
    })();

    /* ---- Batching: lines and dots by colour, width and alpha (alpha on a square-root scale) ---- */
    var NA = 18, NW = 4, NC = COLS.length, LA = 1;
    var BK = [], BM = [], DB = [], STY = [], STYM = [], i0;
    for (i0 = 0; i0 < NA * NW * NC; i0++) { BK.push([]); BM.push([]); }
    for (i0 = 0; i0 < NA * NC; i0++) {
      var c0 = COLS[(i0 / NA) | 0], a0 = Math.pow(((i0 % NA) + 0.5) / NA, 2);
      DB.push([]); STY.push(rgba(c0, a0));
      STYM.push('rgb(' + Math.round(c0[0] * a0) + ',' + Math.round(c0[1] * a0) + ',' + Math.round(c0[2] * a0) + ')');
    }
    var WID = [0.8, 1.3, 2.3, 6.5];   // far, mid, near, and a tube's body (near chords: a soft wide stroke under the core)
    // Two kinds of batch. Still lines add their light ('lighter': where they cross they glow). Moving lines (mx) are
    // drawn opaque in their capped colour with 'lighten', so where they overlap a pixel shows the brightest of them,
    // never their sum: a moving lattice cannot pile up into a flicker, however dense it gets on a small screen.
    function addLine(x1, y1, x2, y2, a, c, w, mx) {
      a *= LA;
      if (a < 0.006) return;
      var q = Math.sqrt(a) * NA | 0;
      if (q >= NA) q = NA - 1;
      (mx ? BM : BK)[(c * NW + w) * NA + q].push(x1, y1, x2, y2);
    }
    function addDot(x, y, s, a, c) {
      a *= LA;
      if (a < 0.008 || x < -4 || y < -4 || x > W + 4 || y > H + 4) return;
      var q = Math.sqrt(a) * NA | 0;
      if (q >= NA) q = NA - 1;
      DB[c * NA + q].push(x, y, s);
    }
    function flushLines(g) {
      g.lineCap = DBG.round ? 'round' : 'butt'; var nl = 0, ns = 0;
      for (var pass = 0; pass < 2; pass++) {
      var B = pass ? BK : BM, ST = pass ? STY : STYM;
      g.globalCompositeOperation = pass || DBG.noLighten ? 'lighter' : 'lighten';
      for (var c = 0; c < NC; c++) for (var w = 0; w < NW; w++) for (var q = 0; q < NA; q++) {
        var arr = B[(c * NW + w) * NA + q];
        if (!arr.length) continue;
        // (far lines are exact 1-device-px hairlines on dense screens: the GPU's fastest path; wider strokes are a
        // little slimmer there too; paths go to the GPU in chunks of 64 segments, which keeps them on fast paths)
        g.strokeStyle = ST[c * NA + q];
        g.lineWidth = DBG.hair ? Math.min(1, WID[w] * dpr) : w === 0 && dpr >= 1.5 ? 1 : WID[w] * (dpr > 1 ? 0.8 * dpr : 1);
        var CH = DBG.chunk || 64;
        g.beginPath();
        for (var j = 0, m = 0; j < arr.length; j += 4) {
          g.moveTo(arr[j], arr[j + 1]); g.lineTo(arr[j + 2], arr[j + 3]);
          if (++m >= CH) { g.stroke(); g.beginPath(); m = 0; ns++; }
        }
        nl += arr.length / 4; ns++;
        g.stroke();
        arr.length = 0;
      }
      }
      g.globalCompositeOperation = 'lighter';
      api.stats = { lines: nl, strokes: ns, sprites: SP.length / 5 };
    }
    function flushDots(g) {
      g.globalCompositeOperation = 'lighter';
      for (var k = 0; k < DB.length; k++) {
        var arr = DB[k];
        if (!arr.length) continue;
        g.fillStyle = STY[k];
        g.beginPath();
        for (var j = 0; j < arr.length; j += 3) { var s = arr[j + 2]; g.rect(arr[j] - s / 2, arr[j + 1] - s / 2, s, s); }
        g.fill();
        arr.length = 0;
      }
    }
    // Motion blur. A line that moved more than its own width during the shutter is drawn as the area it swept (a quad
    // from where it was to where it is), its light spread over that area (alpha x width / sweep), so the energy stays
    // the same: fast lines become faint streaks, slow ones stay crisp. A finer alpha ladder: the streaks are faint.
    var NQ = 40, QB = [], QSTY = [];
    for (i0 = 0; i0 < NQ * NC; i0++) { QB.push([]); QSTY.push(rgba(COLS[(i0 / NQ) | 0], Math.pow(((i0 % NQ) + 0.5) / NQ, 2))); }
    function addQuad(x1, y1, x2, y2, x3, y3, x4, y4, a, c) {
      a *= LA;
      if (a < 0.005) return;   // (fainter than this a streak is not seen, but it would still cost its whole area)
      if ((x1 < -9 && x2 < -9 && x3 < -9 && x4 < -9) || (x1 > W + 9 && x2 > W + 9 && x3 > W + 9 && x4 > W + 9) ||
        (y1 < -9 && y2 < -9 && y3 < -9 && y4 < -9) || (y1 > H + 9 && y2 > H + 9 && y3 > H + 9 && y4 > H + 9)) return;
      var q = Math.sqrt(a) * NQ | 0;
      if (q >= NQ) q = NQ - 1;
      QB[c * NQ + q].push(x1, y1, x2, y2, x3, y3, x4, y4);
    }
    function addStreak(x0, y0, x1, y1, s, a, c) {   // a point of size s that moved from (x0, y0) to (x1, y1)
      var dx = x1 - x0, dy = y1 - y0, l = Math.sqrt(dx * dx + dy * dy);
      if (l < s) { addDot(x1, y1, s, a, c); return; }
      var nx = -dy / l * s / 2, ny = dx / l * s / 2;
      addQuad(x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny, a * s / (s + l), c);
    }
    // (streaks are soft: they are filled in a half-size buffer, which keeps big faint ones cheap on dense screens)
    var qbuf = mk(), qbx = qbuf.getContext('2d'), QS = 0.4;
    function flushQuads(g) {
      var k, any = false;
      for (k = 0; k < QB.length && !any; k++) if (QB[k].length) any = true;
      if (!any) return;
      var qw = Math.max(1, Math.ceil(W * QS)), qh = Math.max(1, Math.ceil(H * QS));
      if (qbuf.width !== qw || qbuf.height !== qh) { qbuf.width = qw; qbuf.height = qh; }
      qbx.setTransform(1, 0, 0, 1, 0, 0); qbx.globalCompositeOperation = 'source-over'; qbx.globalAlpha = 1; qbx.clearRect(0, 0, qw, qh);
      qbx.setTransform(QS, 0, 0, QS, 0, 0); qbx.globalCompositeOperation = 'lighter';
      for (k = 0; k < QB.length; k++) {
        var arr = QB[k];
        if (!arr.length) continue;
        qbx.fillStyle = QSTY[k];
        qbx.beginPath();
        for (var j = 0, m = 0; j < arr.length; j += 8) {
          qbx.moveTo(arr[j], arr[j + 1]); qbx.lineTo(arr[j + 2], arr[j + 3]); qbx.lineTo(arr[j + 4], arr[j + 5]); qbx.lineTo(arr[j + 6], arr[j + 7]); qbx.closePath();
          if (++m >= 48) { qbx.fill(); qbx.beginPath(); m = 0; }
        }
        qbx.fill();
        arr.length = 0;
      }
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1; g.imageSmoothingEnabled = true;
      g.drawImage(qbuf, 0, 0, W, H); g.restore();
    }
    var SP = [];   // sprites: type, x, y, size, alpha
    function addSprite(type, x, y, s, a) {
      a *= LA;
      if (a < 0.01 || s < 0.5 || x < -s || y < -s || x > W + s || y > H + s) return;
      SP.push(type, x, y, s, a);
    }
    function flushSprites(g, k, ga) {
      g.globalCompositeOperation = 'lighter';
      for (var j = 0; j < SP.length; j += 5) {
        var s = SP[j + 3] * k;
        g.globalAlpha = Math.min(1, SP[j + 4] * ga);
        g.drawImage(SPR[SP[j]], SP[j + 1] * k - s / 2, SP[j + 2] * k - s / 2, s, s);
      }
      g.globalAlpha = 1;
    }

    /* ---- The camera ---- */
    var CX = 0, CY = 0, CZ = 0, R0 = 1, R1 = 0, R2 = 0, U0 = 0, U1 = 1, U2 = 0, F0 = 0, F1 = 0, F2 = 1, FOC = 1000, PX = 0, PY = 0;
    var NEAR = 0.3, FN = 30, FF = 160, COOL = 34;   // fog start / end, and the depth where chrome turns to cool steel
    var PORTALS = [];
    var CAM = {}, CAM2 = {};
    var HOME = { D: 27, cy: 0, px: 0, py: 0, tx: 0, ty: 0 }, PC = { x: 0, y: 0 }, CV = {}, DSTAGE = 45, LOOK_Y = 6.2;
    function useCam(c) {
      CX = c.x; CY = c.y; CZ = c.z; FOC = c.f; PX = c.px; PY = c.py;
      var cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
      F0 = sy * cp; F1 = sp; F2 = cy * cp;
      var rl = Math.sqrt(F2 * F2 + F0 * F0) || 1, r0 = F2 / rl, r1 = 0, r2 = -F0 / rl;
      var u0 = F1 * r2 - F2 * r1, u1 = F2 * r0 - F0 * r2, u2 = F0 * r1 - F1 * r0;
      var cr = Math.cos(c.roll), sr = Math.sin(c.roll);
      R0 = r0 * cr + u0 * sr; R1 = r1 * cr + u1 * sr; R2 = r2 * cr + u2 * sr;
      U0 = u0 * cr - r0 * sr; U1 = u1 * cr - r1 * sr; U2 = u2 * cr - r2 * sr;
    }
    // The stage camera (SC.t0 - SC.t1): polar about the stage's centre line (R metres back, swung phi degrees, at
    // height h). It takes over from the truss camera at 5.0 and hands back at 12.3 with matching position and speed.
    // Its aim is composed, not looked-at: the pitch that sets the LED wall's bottom edge on a fixed line of the frame
    // (SC.yB), so the stage sits on the same line while the camera swoops, orbits, rises and pushes in.
    var SC = { t0: 5.0, t1: 12.3 };
    function scPos(t, o) {
      var R = SC.R(t), ph = SC.ph(t) * DEG;
      o.x = R * Math.sin(ph); o.z = ZS - R * Math.cos(ph); o.y = SC.h(t);
      return o;
    }
    var SCP = {};
    function scAim(t, o) {   // the composed look point for the stage camera at time t (t inside SC)
      scPos(t, SCP);
      var L = Wd.led, d = Math.sqrt(SCP.x * SCP.x + (L.z - SCP.z) * (L.z - SCP.z));
      var a = Math.atan2(L.y0 - SCP.y, d), th = a - Math.atan((PC.y - SC.yB(t)) / FOC);
      o.lx = 0; o.ly = SCP.y + Math.tan(th) * d; o.lz = L.z;
      return o;
    }
    var AIM = {};
    // The pull-back (SC.t1 to home): the camera leaves the climax with the stage camera's orientation (PB) and, while
    // it gathers speed and the truss is still forming round it (PB.k0 - PB.k1), settles to home: level, on the truss's
    // axis, the photo's principal point. From then on it only travels straight back along that axis, so every member
    // parallel to it (the chords and rails) stands still on screen and keeps its full light: a crisp tunnel of lines
    // radiating from the lit stage at its far end, all the way out through the U.
    var PB = { pitch: 0, vpY: 0, y: 0, k0: 12.3, k1: 12.8 };
    function camAt(t, o) {
      var z, free = smooth(seg(t, 1.5, 2.2)) * (1 - smooth(seg(t, 13.55, 14.15)));
      if (t > SC.t0 && t < SC.t1) scPos(t, o);
      else {
        z = CV.z(t);
        // up to the U (and back out of it) the camera rides the ray from home through the counter's centre,
        // so the photo can zoom about one fixed point and stay registered to the drawing
        var yRay = HOME.cy + (TY - HOME.cy) * clamp((z + HOME.D) / HOME.D, 0, 1);
        o.z = z; o.x = CV.x(t) * free; o.y = lerp(yRay, CV.y(t), free);
        if (t >= SC.t1) {
          var kh = smooth(seg(t, PB.k0, PB.k1));
          o.yaw = 0; o.roll = 0; o.pitch = PB.pitch * (1 - kh);
          o.px = lerp(PC.x, HOME.px, kh); o.py = lerp(PB.vpY, HOME.py, kh) - FOC * Math.tan(o.pitch);
          o.f = FOC;
          return o;
        }
      }
      var w = smooth(seg(t, 4.3, 6.4)) * (1 - smooth(seg(t, 12.3, 13.65)));   // look at the stage (levelling off slowly on the way home)
      var tx = 0, ty = LOOK_Y, tz = ZS, kc = smooth(seg(t, 5.0, 6.6));
      if (kc > 0) { scAim(Math.min(t, SC.t1), AIM); tx = lerp(tx, AIM.lx, kc); ty = lerp(ty, AIM.ly, kc); tz = lerp(tz, AIM.lz, kc); }
      var lx = tx - o.x, ly = ty - o.y, lz = Math.max(8, tz - o.z);
      o.yaw = Math.atan2(lx, lz) * w;
      o.pitch = Math.atan2(ly, Math.sqrt(lx * lx + lz * lz)) * w;
      o.roll = CV.roll(t) * DEG;
      var pk = smooth(seg(t, 1.15, 1.85)) * (1 - smooth(seg(t, 13.45, 14.1)));
      o.px = lerp(HOME.px, PC.x, pk); o.py = lerp(HOME.py, PC.y, pk);
      o.f = FOC;
      return o;
    }
    var CAMQ = {}, SHUT_W = 1 / 30, MCAP = 0.24, QCAP = 0.13, STREAK = 0, FADEFAST = false, BUILD = 1;
    function shutterAt(t) { return 1 / 30; }
    function fogA(z) {
      var a = z < 1.2 ? smooth(clamp((z - NEAR) / 0.9, 0, 1)) : 1;
      return z > FN ? a * (1 - smooth(clamp((z - FN) / (FF - FN), 0, 1))) : a;
    }
    // The camera a shutter ago (usePrev), for motion blur: each line is also projected through it.
    var QX = 0, QY = 0, QZ = 0, QR0 = 1, QR1 = 0, QR2 = 0, QU0 = 0, QU1 = 1, QU2 = 0, QF0 = 0, QF1 = 0, QF2 = 1, QPX = 0, QPY = 0, MB = false;
    function usePrev(c) {
      QX = c.x; QY = c.y; QZ = c.z; QPX = c.px; QPY = c.py;
      var cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
      QF0 = sy * cp; QF1 = sp; QF2 = cy * cp;
      var rl = Math.sqrt(QF2 * QF2 + QF0 * QF0) || 1, r0 = QF2 / rl, r1 = 0, r2 = -QF0 / rl;
      var u0 = QF1 * r2 - QF2 * r1, u1 = QF2 * r0 - QF0 * r2, u2 = QF0 * r1 - QF1 * r0;
      var cr = Math.cos(c.roll), sr = Math.sin(c.roll);
      QR0 = r0 * cr + u0 * sr; QR1 = r1 * cr + u1 * sr; QR2 = r2 * cr + u2 * sr;
      QU0 = u0 * cr - r0 * sr; QU1 = u1 * cr - r1 * sr; QU2 = u2 * cr - r2 * sr;
      MB = true;
    }
    var QJ = { x: 0, y: 0, z: 0 };
    function projQ(x, y, z) {
      var dx = x - QX, dy = y - QY, dz = z - QZ, zc = dx * QF0 + dy * QF1 + dz * QF2;
      if (zc < NEAR) return false;
      QJ.x = QPX + FOC * (dx * QR0 + dy * QR1 + dz * QR2) / zc; QJ.y = QPY - FOC * (dx * QU0 + dy * QU1 + dz * QU2) / zc; QJ.z = zc;
      return true;
    }
    function lwOf(wc) { return wc === 0 && dpr >= 1.5 ? 1 : WID[wc] * (dpr > 1 ? 0.8 * dpr : 1); }
    function seg3(ax, ay, az, bx, by, bz, al, c, w) { seg3p(ax, ay, az, bx, by, bz, ax, ay, az, bx, by, bz, al, c, w); }
    // a world line from a to b, which was from pa to pb a shutter ago (its own motion; the camera's comes from usePrev)
    function seg3p(ax, ay, az, bx, by, bz, pax, pay, paz, pbx, pby, pbz, al, c, w) {
      var dx = ax - CX, dy = ay - CY, dz = az - CZ;
      var x1 = dx * R0 + dy * R1 + dz * R2, y1 = dx * U0 + dy * U1 + dz * U2, z1 = dx * F0 + dy * F1 + dz * F2;
      dx = bx - CX; dy = by - CY; dz = bz - CZ;
      var x2 = dx * R0 + dy * R1 + dz * R2, y2 = dx * U0 + dy * U1 + dz * U2, z2 = dx * F0 + dy * F1 + dz * F2, k, ka = 0, kb = 1;
      if (z1 < NEAR) { if (z2 < NEAR) return; k = (NEAR - z1) / (z2 - z1); x1 += (x2 - x1) * k; y1 += (y2 - y1) * k; z1 = NEAR; ka = k; }
      else if (z2 < NEAR) { k = (NEAR - z2) / (z1 - z2); x2 += (x1 - x2) * k; y2 += (y1 - y2) * k; z2 = NEAR; kb = 1 - k; }
      var zm = (z1 + z2) * 0.5, a = al * fogA(zm);
      if (a * LA < 0.004) return;
      var s1x = PX + FOC * x1 / z1, s1y = PY - FOC * y1 / z1, s2x = PX + FOC * x2 / z2, s2y = PY - FOC * y2 / z2;
      // atmospheric perspective: warm chrome near, cool steel far
      if (c === C_INK && zm > COOL) c = C_STEEL;
      var tube = w === -1, wc = tube || w == null ? (zm < 6 ? 2 : zm < 24 ? 1 : 0) : w;
      var ba = tube && zm < 13 ? a * 0.16 * (1 - zm / 13) : 0;   // a tube: near, a soft body under a bright core
      if (tube) a *= 1.12;
      var mx = false;
      if (MB && projQ(lerp(pax, pbx, ka), lerp(pay, pby, ka), lerp(paz, pbz, ka))) {
        var e1x = QJ.x, e1y = QJ.y;
        if (projQ(lerp(pax, pbx, kb), lerp(pay, pby, kb), lerp(paz, pbz, kb))) {
          var e2x = QJ.x, e2y = QJ.y, lx = s2x - s1x, ly = s2y - s1y, ll = Math.sqrt(lx * lx + ly * ly), d;
          if (ll > 0.5) { lx /= ll; ly /= ll; d = Math.max(Math.abs((e1x - s1x) * ly - (e1y - s1y) * lx), Math.abs((e2x - s2x) * ly - (e2y - s2y) * lx)); }
          else d = Math.max(Math.abs(e1x - s1x) + Math.abs(e1y - s1y), Math.abs(e2x - s2x) + Math.abs(e2y - s2y));
          var lw = lwOf(wc), mv = smooth(clamp((d - 0.3) / 0.7, 0, 1));
          // in the pull-back and the swoop (STREAK) a line that really flies is drawn as the camera would see it: a
          // streak over the area it swept during the shutter, its light spread over that area (energy kept: a x width /
          // sweep), and never brighter than QCAP. Successive members' streaks overlap into a steady glow (speed lines),
          // so nothing crisp sweeps the frame and no pixel flickers as a lattice rushes past
          // (the truss on the way home is the exception, FADEFAST: its cross-members, lacing and portals simply fade as
          // they speed up, so the tunnel is drawn by its chords, which stand still in the straight dolly, and by the far
          // frames, which barely move: crisp lines, no curtains of streaks)
          if (FADEFAST && d > 2 * lw) { a *= 1 - smooth(clamp((d - 2 * lw) / (5 * lw), 0, 1)); ba = 0; if (a * LA < 0.004) return; }
          else if (STREAK && d > (STREAK === 2 ? 6 : 4) * lw) {
            addQuad(s1x, s1y, s2x, s2y, e2x, e2y, e1x, e1y, Math.min(a * lw / d, QCAP), c);
            if (ba > 0) addQuad(s1x, s1y, s2x, s2y, e2x, e2y, e1x, e1y, Math.min(ba * lwOf(3) / d, QCAP * 0.5), c);
            return;
          }
          // a line that sweeps across the screen is never brighter than MCAP: on its own it cannot step a pixel by 0.1
          // in relative luminance as it passes (WCAG 2.3.1, by construction); still lines keep their full light (a
          // line sliding along itself does not count as moving: in a straight dolly the truss's chords stay crisp)
          var cap = STREAK === 1 ? MCAP * 0.85 : MCAP * BUILD;   // (a little lower in the pull-back, where the rig recedes over the lit wall; higher in the build, where the lines are few and far apart)
          if (mv > 0 && c !== C_HOT) { a = lerp(a, Math.min(a, cap), mv); ba = lerp(ba, Math.min(ba, cap * 0.5), mv); mx = mv > 0.02; }   // (hot lines are one-off accents: the portals on the way in, the scan, the shock frame)
        }
      }
      if ((s1x < -9 && s2x < -9) || (s1x > W + 9 && s2x > W + 9) || (s1y < -9 && s2y < -9) || (s1y > H + 9 && s2y > H + 9)) return;
      if (ba > 0) addLine(s1x, s1y, s2x, s2y, ba, c, 3, mx);
      addLine(s1x, s1y, s2x, s2y, a, c, wc, mx);
    }
    var PJ = { x: 0, y: 0, z: 0 };
    function proj(x, y, z) {
      var dx = x - CX, dy = y - CY, dz = z - CZ, zc = dx * F0 + dy * F1 + dz * F2;
      PJ.z = zc;
      if (zc < NEAR) return false;
      PJ.x = PX + FOC * (dx * R0 + dy * R1 + dz * R2) / zc; PJ.y = PY - FOC * (dx * U0 + dy * U1 + dz * U2) / zc;
      return true;
    }
    // chrome: where a tube from A to B catches the key light (the point where the half-vector between the light
    // and the eye is square to the tube), a glint. It slides along the tube as the camera moves.
    var LX = 0, LY = 0, LZ = 0;
    function gl(ax, ay, az, dx, dy, dz, len, s) {
      var px = ax + dx * len * s, py = ay + dy * len * s, pz = az + dz * len * s;
      var vx = CX - px, vy = CY - py, vz = CZ - pz, vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      var hx = LX + vx / vl, hy = LY + vy / vl, hz = LZ + vz / vl;
      return (hx * dx + hy * dy + hz * dz) / (Math.sqrt(hx * hx + hy * hy + hz * hz) || 1);
    }
    function glint(ax, ay, az, bx, by, bz, a, big) {
      var dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len < 0.05) return;
      dx /= len; dy /= len; dz /= len;
      var f0 = gl(ax, ay, az, dx, dy, dz, len, 0), f1 = gl(ax, ay, az, dx, dy, dz, len, 1);
      if (f0 * f1 > 0) return;
      var lo = 0, hi = 1, flo = f0;
      for (var k = 0; k < 6; k++) { var m = (lo + hi) / 2, fm = gl(ax, ay, az, dx, dy, dz, len, m); if (fm * flo > 0) { lo = m; flo = fm; } else hi = m; }
      var s = (lo + hi) / 2;
      if (!proj(ax + dx * len * s, ay + dy * len * s, az + dz * len * s)) return;
      var z = PJ.z, fa = fogA(z) * a;
      if (fa < 0.02) return;
      var size = clamp(FOC * (big ? 0.5 : 0.3) / z, 2 * dpr, 46 * dpr);
      addSprite(size > 9 * dpr ? 1 : 0, PJ.x, PJ.y, size * (size > 9 * dpr ? 2.2 : 1.6), fa);
    }

    /* ---- The world, built once (seeded) ---- */
    var Wd = null;
    function arcRy(rx) {   // the U's bottom: vertical radius for a contour at rx (units), measured on the image
      return rx <= NEON[0] ? lerp(A.i, A.n, (rx - 0.287) / (NEON[0] - 0.287)) : lerp(A.n, A.o, (rx - NEON[0]) / (1 - NEON[0]));
    }
    function uOutline(c, nA) {
      var rxo = c[0] * S, ryo = arcRy(c[0]) * S, rxi = c[1] * S, ryi = arcRy(c[1]) * S, top = c[2] * S, p = [], i, a;
      p.push([-rxo, top], [-rxo, 0]);
      for (i = 1; i < nA; i++) { a = Math.PI + Math.PI * i / nA; p.push([rxo * Math.cos(a), ryo * Math.sin(a)]); }
      p.push([rxo, 0], [rxo, top], [rxi, top], [rxi, 0]);
      for (i = 1; i < nA; i++) { a = -Math.PI * i / nA; p.push([rxi * Math.cos(a), ryi * Math.sin(a)]); }
      p.push([-rxi, 0], [-rxi, top], [-rxo, top]);
      return p;
    }
    function neonPath(nA) {
      var rx = NEON[0] * S, ry = A.n * S, top = NEON[1] * S, p = [[-rx, top], [-rx, 0]], i, a;
      for (i = 1; i < nA; i++) { a = Math.PI + Math.PI * i / nA; p.push([rx * Math.cos(a), ry * Math.sin(a)]); }
      p.push([rx, 0], [rx, top]);
      var L = [0];
      for (i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
      return { p: p, L: L, len: L[L.length - 1] };
    }
    function sec(z) {   // the truss's section: the U's counter, opening out over the first 22 m
      var k = smooth(seg(z, U_DEPTH, U_DEPTH + 22));
      return { hw: lerp(0.287 * S - 0.02, 2.7, k), yb: lerp(TY - (U_TOP * S - TY), TY - 4.1, k), yt: lerp(U_TOP * S, TY + 4.1, k) };
    }
    function build() {
      var R = rng(20261003), i, j, k;
      var w = { };
      // the U (front contours at z = 0, the back outline at U_DEPTH, the edges between), the neon, the bracing
      w.uFront = UC.map(function (c, n) { return uOutline(c, n === 0 ? 28 : 22); });
      w.uBack = uOutline(UC[0], 20);
      w.neon = neonPath(36);
      var rxo = S, rxi = 0.287 * S, top = U_TOP * S;
      w.uEdges = [[-rxo, top], [-rxi, top], [rxi, top], [rxo, top], [-rxo, 0], [rxo, 0], [-rxi, 0], [rxi, 0], [0, -A.o * S], [0, -A.i * S]];
      var bx = rxi - 0.06, bz = U_DEPTH * 0.55, ys = [top - 0.25, top * 0.68, top * 0.36, 0.25];
      w.brace = [];
      for (i = 0; i < ys.length - 1; i++) {
        w.brace.push([-bx, ys[i], bx, ys[i + 1]], [bx, ys[i], -bx, ys[i + 1]]);
        w.brace.push([-bx, ys[i], bx, ys[i]]);
      }
      for (i = 0; i < w.brace.length; i++) w.brace[i].push(bz);
      // the truss: stations every PANEL from the back of the U; 18 members a bay (chords, frames, Warren lacing)
      var NP = Math.round((LT - U_DEPTH) / PANEL), st = [];
      for (i = 0; i <= NP; i++) {
        var z = U_DEPTH + i * PANEL, s = sec(z), ym = (s.yb + s.yt) / 2;
        st.push({ z: z, c: [[-s.hw, s.yb], [s.hw, s.yb], [s.hw, s.yt], [-s.hw, s.yt]], ml: [-s.hw, ym], mr: [s.hw, ym] });
      }
      var TA = [], TI = [], TK = [];
      function tl(a, za, b, zb, kind, bay) { TA.push(a[0], a[1], za, b[0], b[1], zb); TI.push(bay); TK.push(kind); }
      for (i = 0; i <= NP; i++) {
        var A0 = st[i], c = A0.c, z0 = A0.z;
        // the frame at this station (kind 1)
        tl(c[0], z0, c[1], z0, 1, i); tl(c[1], z0, A0.mr, z0, 1, i); tl(A0.mr, z0, c[2], z0, 1, i);
        tl(c[2], z0, c[3], z0, 1, i); tl(c[3], z0, A0.ml, z0, 1, i); tl(A0.ml, z0, c[0], z0, 1, i);
        if (i === NP) break;
        var B0 = st[i + 1], d = B0.c, z1 = B0.z, p = i % 2;
        for (j = 0; j < 4; j++) tl(c[j], z0, d[j], z1, 0, i);                     // chords (kind 0)
        tl(A0.ml, z0, B0.ml, z1, 3, i); tl(A0.mr, z0, B0.mr, z1, 3, i);          // mid chords (kind 3)
        // rails (kind 4, only on the way home, when the truss re-forms round the camera): more lines along its faces, so
        // in the straight pull-back the tunnel is drawn by many still lines radiating from the stage, not a few
        for (j = 0; j < 3; j++) { var fx = (j - 1) * 0.5; tl([c[3][0] * fx * -1, c[3][1]], z0, [d[3][0] * fx * -1, d[3][1]], z1, 4, i); tl([c[0][0] * fx * -1, c[0][1]], z0, [d[0][0] * fx * -1, d[0][1]], z1, 4, i); }
        for (j = 0; j < 2; j++) { var fy = j ? 0.75 : 0.25; tl([c[0][0], lerp(c[0][1], c[3][1], fy)], z0, [d[0][0], lerp(d[0][1], d[3][1], fy)], z1, 4, i); tl([c[1][0], lerp(c[1][1], c[2][1], fy)], z0, [d[1][0], lerp(d[1][1], d[2][1], fy)], z1, 4, i); }
        if (p) {                                                                 // lacing (kind 2), Warren
          tl(c[0], z0, d[1], z1, 2, i); tl(c[3], z0, d[2], z1, 2, i);
          tl(c[0], z0, B0.ml, z1, 2, i); tl(A0.ml, z0, d[3], z1, 2, i); tl(c[1], z0, B0.mr, z1, 2, i); tl(A0.mr, z0, d[2], z1, 2, i);
        } else {
          tl(c[1], z0, d[0], z1, 2, i); tl(c[2], z0, d[3], z1, 2, i);
          tl(A0.ml, z0, d[0], z1, 2, i); tl(c[3], z0, B0.ml, z1, 2, i); tl(A0.mr, z0, d[1], z1, 2, i); tl(c[2], z0, B0.mr, z1, 2, i);
        }
      }
      w.TA = new Float32Array(TA); w.TI = TI; w.TK = TK; w.TN = TK.length; w.st = st;
      // a stage truss (local x along its length, centred): chords, end frames, Warren lacing (3 bays a face)
      var tpl = [], hs = 0.45, CC = [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]];
      for (j = 0; j < 4; j++) tpl.push([-0.5, CC[j][0], CC[j][1], 0.5, CC[j][0], CC[j][1], 1]);
      [-0.5, 0.5].forEach(function (x) { for (j = 0; j < 4; j++) { var n = (j + 1) % 4; tpl.push([x, CC[j][0], CC[j][1], x, CC[n][0], CC[n][1], 0]); } });
      for (j = 0; j < 4; j++) {
        var P0 = CC[j], P1 = CC[(j + 1) % 4];
        for (k = 0; k < 3; k++) {
          var xa = -0.5 + k / 3, xb = -0.5 + (k + 1) / 3, a0 = k % 2 ? P1 : P0, a1 = k % 2 ? P0 : P1;
          tpl.push([xa, a0[0], a0[1], xb, a1[0], a1[1], 0]);
        }
      }
      w.tpl = tpl;
      // the stage: 4 towers, the roof grid (front, back, sides, 3 cross) — 68 pieces, each landing on the grid
      var segs = [], deckTop = GROUND + 2.0, roofY = 17.0, zf = ZS - 7, zb2 = ZS + 7, tx = 20;
      function piece(x, y, z, q, len, land, grp) { segs.push({ p: [x, y, z], q: q, len: len, land: land, grp: grp }); }
      var th = (roofY - deckTop) / 6;
      [[-tx, zf], [tx, zf], [-tx, zb2], [tx, zb2]].forEach(function (tw, m) {
        for (j = 0; j < 6; j++) piece(tw[0], deckTop + th * (j + 0.5), tw[1], Q_UP, th, TL.towers + j * 0.125 + m * 0.03125, 0);
      });
      var fl = 2 * tx / 12;
      for (j = 0; j < 12; j++) {
        var rank = Math.floor(Math.abs(j - 5.5));
        piece(-tx + fl * (j + 0.5), roofY, zf, Q_ID, fl, 6.5 + rank * 0.0625, 1);
        piece(-tx + fl * (j + 0.5), roofY, zb2, Q_ID, fl, 6.75 + rank * 0.0625, 1);
      }
      var sl = (zb2 - zf) / 4;
      for (j = 0; j < 4; j++) {
        piece(-tx, roofY, zf + sl * (j + 0.5), Q_Z, sl, 7.0 + j * 0.0625, 2);
        piece(tx, roofY, zf + sl * (j + 0.5), Q_Z, sl, 7.0 + j * 0.0625, 2);
        [-10, 0, 10].forEach(function (x, n) { piece(x, roofY, zf + sl * (j + 0.5), Q_Z, sl, 7.125 + n * 0.0625 + j * 0.03125, 2); });
      }
      // where each piece is before: born on the truss's walls as it bursts, then a cloud hanging in the dark
      segs.forEach(function (s, n) {
        var ang = R() * Math.PI * 2, rad = 7 + R() * 20;
        s.rp = [Math.cos(ang) * rad, TY + 2 + Math.sin(ang) * rad * 0.75, 84 + R() * 46];
        s.rq = qAxis(R() - 0.5, R() - 0.5, R() - 0.5, R() * Math.PI * 2);
        s.sa = [R() - 0.5, R() - 0.5, R() - 0.5]; s.sr = (R() < 0.5 ? -1 : 1) * (0.25 + R() * 0.45);
        s.dv = [(R() - 0.5) * 0.8, (R() - 0.5) * 0.5, (R() - 0.5) * 0.8];
        var wz = 76 + R() * 44, sc = sec(wz), wall = n % 4, f = R();
        s.sp = wall === 0 ? [-sc.hw, lerp(sc.yb, sc.yt, f), wz] : wall === 1 ? [sc.hw, lerp(sc.yb, sc.yt, f), wz] :
          wall === 2 ? [lerp(-sc.hw, sc.hw, f), sc.yb, wz] : [lerp(-sc.hw, sc.hw, f), sc.yt, wz];
        s.delay = Math.max(0, wz - 70) * 0.006;
        s.arc = 1.5 + R() * 3;
      });
      w.segs = segs;
      // the deck, the PA, the lights, the LED wall
      w.deck = { x: 22, z0: ZS - 8.5, z1: ZS + 8, y0: GROUND, y1: deckTop };
      w.pa = [-1, 1].map(function (sd) { return { x: sd * 18.75, z: zf - 1.2, y: roofY - 1.2, side: sd }; });
      w.heads = [];
      for (j = 0; j < 10; j++) w.heads.push([-16.2 + j * 3.6, roofY - 0.95, zf]);
      // the LED wall: 34 x 11.5 m (about 3:1, so a long event type still sets large), solid, upstage
      w.led = { x0: -17, x1: 17, y0: deckTop + 0.5, y1: deckTop + 12.0, z: zb2 - 0.9 };
      w.roofY = roofY; w.deckTop = deckTop;
      // the floor: a CAD grid (pieces, so the fog can fall off along them)
      var gl0 = [];
      for (i = -12; i <= 12; i++) for (k = 30; k < 330; k += 6) gl0.push([i * 4, k, i * 4, k + 6, i % 5 === 0 ? 1 : 0]);
      for (k = 32; k <= 330; k += 4) for (i = -48; i < 48; i += 8) gl0.push([i, k, i + 8, k, (k - ZS) % 20 === 0 ? 1 : 0]);
      w.grid = gl0;
      // the ridge: a long massif behind the site, like the owner's image (a plotted line, then a silhouette)
      var rid = [], RZ = 1400;
      for (i = -64; i <= 64; i++) {
        var x = i * 42, u = i / 64;
        var h = 34 + 70 * Math.pow(Math.max(0, Math.sin(u * 2.1 + 0.6)), 1.6) + 52 * Math.pow(Math.max(0, Math.cos(u * 5.3 - 0.9)), 2) +
          26 * Math.sin(u * 13.7 + 1.3) * Math.sin(u * 3.1) + 9 * (R() - 0.5);
        rid.push([x, GROUND + Math.max(6, h), RZ]);
      }
      w.ridge = rid;
      // stars: the night sky all round (directions), with a few bright ones; dust: specks near the flight path
      var nS = LITE ? 650 : 1500, stars = new Float32Array(nS * 6);
      for (i = 0; i < nS; i++) {
        var uz = R() * 2 - 1, ph = R() * Math.PI * 2, rr = Math.sqrt(1 - uz * uz), mg = Math.pow(R(), 3.2);
        stars.set([rr * Math.cos(ph), uz * 0.92 + 0.08, rr * Math.sin(ph), 0.18 + 0.82 * mg, 1 + Math.floor(R() * 3), R() * 6.283], i * 6);
      }
      w.stars = stars; w.nS = nS;
      var nD = LITE ? 120 : 280, dust = new Float32Array(nD * 4);
      for (i = 0; i < nD; i++) {
        var da = R() * Math.PI * 2, dr = 2.5 + Math.pow(R(), 0.7) * 26;
        dust.set([Math.cos(da) * dr, TY + Math.sin(da) * dr * 0.8, -6 + R() * 150, 0.3 + R() * 0.7], i * 4);
      }
      w.dust = dust; w.nD = nD;
      // the audience: row on row on the field, from the barrier back, wider as they go (for scale: see crowd())
      var rows = [], cz2;
      for (cz2 = ZS - 10.4; cz2 > ZS - 46; cz2 -= 0.95 * (0.78 + 0.3 * R())) {
        var half = 15.5 + (ZS - 10.4 - cz2) * 0.6;
        rows.push({ z: cz2, half: half, s: (R() * 4) | 0, off: (R() - 0.5) * 2 * Math.max(0, 39.5 - half), ph: R() });
      }
      w.rows = rows;
      // LED panels set into the truss's walls, here and there: they wake as the camera comes by
      w.panels = [];
      for (i = 3; i < NP - 1; i += 2 + Math.floor(R() * 3)) {
        var side = R() < 0.5 ? -1 : 1, up = R() < 0.5;
        w.panels.push({ i: i, side: side, up: up, ph: R() });
      }
      // the cosmos: three giant triangular trusses crossing the dark, far out (only while the space is abstract)
      w.megas = [
        { a: [-700, 74, 430], b: [700, 74, 430], s: 9, p: 14 },
        { a: [-92, 28, -60], b: [-92, 28, 900], s: 8, p: 12 },
        { a: [118, -22, -60], b: [118, -22, 900], s: 8, p: 12 }
      ];
      return w;
    }

    /* ---- Size, layout, the image's place, the rig ---- */
    function fitFinal(kind, room) {   // film3.js finalFit, ported (no previous frame: its registered place is the cover frame)
      var bw = Wc, bh = Hc, F = FINAL[kind], K = F.keep, ar = F.ar, side = Math.max(6, 0.012 * bw), top = HEAD + 8, bot = bh - room - 14;
      var fw = kind === 'wide' ? Math.max(bw, bh * 16 / 9) : bw, fh = kind === 'wide' ? fw * 9 / 16 : fw * 16 / 9;
      var reg = rect((bw - fw) / 2 + F.reg.x * fw, (bh - fh) / 2 + F.reg.y * fh, F.reg.w * fw, ar);
      function rect(x, y, w, a) { return { x: x, y: y, w: w, h: w / a }; }
      function pick(v, k0, k1, c0, c1) { if (k1 < k0) k0 = k1 = (k0 + k1) / 2; var lo = Math.max(k0, c0), hi = Math.min(k1, c1); return lo <= hi ? clamp(v, lo, hi) : clamp(v, k0, k1); }
      function fits(r) { return r.x + K.l * r.w >= side - 0.5 && r.x + K.r * r.w <= bw - side + 0.5 && r.y + K.t * r.h >= top - 0.5 && r.y + K.b * r.h <= bot + 0.5; }
      function covers(r) { return r.x <= 0.5 && r.y <= 0.5 && r.x + r.w >= bw - 0.5 && r.y + r.h >= bh - 0.5; }
      function around(w) {
        var h = w / ar, mx = (K.l + K.r) / 2, my = (K.t + K.b) / 2, vy = reg.y + my * reg.h - my * h;
        if (h < bh - 0.5) vy = Math.min(vy, 0);
        var y = pick(vy, top - K.t * h, bot - K.b * h, bh - h, 0);
        if (y + h < bh - 0.5) y = Math.max(Math.min(y, bot - 20 - K.b * h), Math.min(y, top - K.t * h));
        return rect(pick(reg.x + mx * reg.w - mx * w, side - K.l * w, bw - side - K.r * w, bw - w, 0), y, w, ar);
      }
      var cw = Math.max(bw, bh * ar), r = reg, c;
      if (!fits(reg)) r = around(Math.min(cw, (bw - 2 * side) / (K.r - K.l), Math.max(1, bot - top) / (K.b - K.t) * ar));
      else if (!covers(reg) && cw / reg.w < 1.04 && fits(c = around(cw))) r = c;
      r.cov = Math.max(0, Math.min(bw, r.x + r.w) - Math.max(0, r.x)) * Math.max(0, Math.min(bh, r.y + r.h) - Math.max(0, r.y)) / (bw * bh);
      r.kind = kind;
      return r;
    }
    // Where the pieces hang (the exploded view) is staged for the camera: each piece waits where the camera will see it
    // at the moment it leaves for its place, somewhere in the frame's sky (never in the card's band), 10 to 50 m off,
    // so its flight is an arc through the frame; and three that leave while the camera swoops wait just beside its
    // path, a few metres off, and fly past the lens into place (large, blurred foreground pieces). It depends on the
    // camera, so it is set with it (seeded: the same every time).
    var FGC = {};
    function routePieces() {
      var segs = Wd.segs, R = rng(51507), order = [], i, fg = 0;
      for (i = 0; i < segs.length; i++) if (segs[i].land - FLIGHT > 4.55) order.push(i);
      order.sort(function (a, b) { return segs[a].land - segs[b].land || a - b; });
      for (var k = 0; k < order.length; k++) {
        var s = segs[order[k]], ts = s.land - FLIGHT, ru = R(), rv = R(), rd = R();
        camAt(ts, FGC);
        var cy = Math.cos(FGC.yaw), sy = Math.sin(FGC.yaw), cp = Math.cos(FGC.pitch), sp = Math.sin(FGC.pitch);
        var f0 = sy * cp, f1 = sp, f2 = cy * cp, r0 = cy, r2 = -sy, u0 = -sy * sp, u1 = cp, u2 = -cy * sp;
        var sx = lerp(0.07, 0.93, ru) * W, syy = lerp(0.1, 0.56, Math.pow(rv, 0.8)) * H, dep = lerp(10, 50, Math.pow(rd, 0.9));
        // (every fourth piece leaving while the camera swoops, up to three: the foreground pass-by, at a frame edge)
        if (fg < 3 && ts > 5.2 && ts < 6.2 && k % 4 === 1) { dep = 2.6 + rd * 1.6; sx = (fg % 2 ? 0.94 : 0.06) * W; syy = lerp(0.18, 0.45, rv) * H; fg++; }
        var dx = (sx - FGC.px) / FOC, dy = -(syy - FGC.py) / FOC;
        var tx = FGC.x + dep * (f0 + dx * r0 + dy * u0), ty = FGC.y + dep * (f1 + dy * u1), tz = FGC.z + dep * (f2 + dx * r2 + dy * u2);
        ty = Math.max(GROUND + 1.2, ty);
        var d = ts - TL.burst;
        s.rp = [tx - s.dv[0] * d, ty - s.dv[1] * d, tz - s.dv[2] * d];
      }
    }
    function layout() {
      var room = ROOM >= 0 ? ROOM : Math.round(Hc * 0.22);
      var r = RECT;
      if (!r) {
        var a = Wc >= Hc ? 'wide' : 'tall', b = a === 'wide' ? 'tall' : 'wide', ra = fitFinal(a, room), rb = fitFinal(b, room);
        r = rb.cov > ra.cov + 0.05 ? rb : ra;
      }
      var kindChanged = KIND !== r.kind;
      KIND = r.kind; A = FINAL[KIND].arc;
      TY = (U_TOP - A.i) / 2 * S; GROUND = -A.o * S;
      imgRect = { x: r.x * dpr, y: r.y * dpr, w: r.w * dpr, h: r.h * dpr };
      if (!Wd || kindChanged || Wd.lite !== LITE) { Wd = build(); Wd.lite = LITE; }
      var F = FINAL[KIND];
      FOC = 1.178 * Math.sqrt(W * H);
      var hw = F.U.w / 2 * imgRect.w, ux = imgRect.x + F.U.x * imgRect.w, topY = imgRect.y + F.keep.t * imgRect.h;
      HOME.D = S * FOC / hw;
      HOME.px = ux; HOME.py = imgRect.y + F.horizon * imgRect.h;
      HOME.cy = U_TOP * S - (HOME.py - topY) * HOME.D / FOC;
      HOME.tx = ux; HOME.ty = HOME.py - FOC * (TY - HOME.cy) / HOME.D;
      var portrait = PORTRAIT = W < H * 0.9;
      PC.x = W / 2; PC.y = H * (portrait ? 0.42 : 0.4);
      // the stage shot: frame its width (and its height inside the band above the card)
      // (wide: an architectural wide shot, the stage about half the frame with sky above it for the beams;
      // tall: the stage's width across the screen, the beams filling the sky above)
      var D = HOME.D;
      LOOK_Y = portrait ? 9.5 : 7.4;
      // The stage camera. Its distances come from the share of the frame's width the LED wall should span: f0 on the
      // SHOW downbeat (8.0, the architectural wide shot: the whole rig, sky above it for the beams), f1 at the climax
      // (11.75, after a four-second push-in), but never so close that the lighting truss leaves the frame's top 12%.
      var L = Wd.led, wallW = L.x1 - L.x0, G = GROUND, wz = L.z - ZS, hz = ZS - Wd.heads[0][2], hy = Wd.heads[0][1];
      // the wall's bottom edge: its composed line. In landscape it eases a little lower during the show (a slow tilt up
      // as the camera pushes in), which leaves the lighting truss room below the header's calm band.
      var yB0 = H * (portrait ? 0.60 : 0.585), yB1 = H * 0.645, yB2 = H * (portrait ? 0.645 : 0.668);
      SC.yB = Curve([[5.0, yB0], [8.0, yB1], [11.6, yB2], [12.3, yB2]]);
      function dFor(f) { return FOC * wallW / (f * W); }
      function headsY(R, h) {   // where the lighting truss sits on screen, the camera R back at height h (composed aim)
        var a = Math.atan2(L.y0 - h, R + wz), th = a - Math.atan((PC.y - yB2) / FOC), ah = Math.atan2(hy - h, R - hz);
        return PC.y - FOC * Math.tan(ah - th);
      }
      // the push: from the architectural wide shot on SHOW (the wall 37% of the frame's width in landscape) to about
      // half the frame at the climax, never so close that the lighting truss reaches the header's band
      var R0 = dFor(portrait ? 0.66 : 0.37) - wz, R1 = dFor(portrait ? 0.86 : 0.495) - wz, hC = G + 6.3;
      for (var it = 0; it < 60 && headsY(R1 - 1.2, hC) < (portrait ? 0.2 : 0.155) * H; it++) R1 += 0.75;
      R1 = Math.min(R1, R0 - 4);
      var Rs = ZS - 78, Rb1 = Rs * (portrait ? 1.0 : 0.76), Rb2 = lerp(Rb1, R0, 0.62), Rend = R1 - 1.2;
      // the swoop (5.0-6.2) goes low and deep round to the left through the cloud of pieces while the towers rise,
      // swings back to the front as the roof locks (7.35); in the show a slow lateral arc (8.4 right, 11.3 left)
      // separates towers, wall and ridge, and it settles dead centre for the climax (still from 11.9)
      SC.R = Curve([[5.0, Rs, -3], [6.2, Rb1], [7.35, Rb2], [8.0, R0], [11.75, R1], [12.0, R1 - 0.9], [12.3, Rend, 0]]);
      SC.ph = Curve([[5.0, 0, 0], [6.2, portrait ? -15 : -28], [7.35, -1.5], [8.4, portrait ? 2.6 : 3.4], [11.3, portrait ? -2.6 : -3.4], [11.9, -0.25], [12.3, 0, 0]]);
      SC.h = Curve([[5.0, 3.8, 0], [6.2, G + (portrait ? 2.7 : 3.4)], [7.35, G + (portrait ? 5.0 : 5.8)], [8.0, G + 6.9], [11.75, hC], [12.3, G + 6.2, 0]]);
      SC.dClimax = R1 + wz; SC.d0 = R0 + wz;
      DSTAGE = R0;
      var zEnd = ZS - Rend, yEnd = G + 6.2;
      // where the stage camera leaves off (12.3): the pull-back keeps this orientation (see camAt)
      scPos(SC.t1 - 1e-6, SCP); scAim(SC.t1 - 1e-6, AIM);
      PB.pitch = Math.atan2(AIM.ly - SCP.y, Math.max(8, AIM.lz - SCP.z));
      PB.vpY = PC.y + FOC * Math.tan(PB.pitch); PB.y = SCP.y;
      // the pull-back: away from the climax fast (the stage drops to about a quarter of the frame by 13.2), then an
      // even glide down the truss, out through the U on 14.15 (home at 14.66: the last third of a second is the still
      // logo frame)
      CV.z = Curve([[0, -D, 0], [TL.go, -D, 0], [TL.passU, 0, 38], [2.5, 35], [4.0, 70, 21], [5.0, 78, 3], [TL.back, zEnd, 0],
        [12.7, zEnd * 0.8], [13.2, zEnd * 0.38], [13.7, zEnd * 0.15], [14.15, 0, -45], [14.66, -D, 0], [15, -D, 0]]);
      CV.y = Curve([[0, TY], [1.5, TY], [2.0, TY + 0.35], [3.0, TY - 0.4], [4.0, TY + 0.2], [5.0, 3.8, 0], [TL.back, yEnd, 0],
        [PB.k1, TY, 0], [14.15, TY], [15, TY]]);
      CV.x = Curve([[0, 0], [1.5, 0], [2.25, 0.5], [3.0, -0.45], [3.75, 0.35], [4.4, 0], [5.0, 0], [TL.back, 0], [13.25, 0], [15, 0]]);
      CV.roll = Curve([[0, 0], [1.5, 0], [2.4, -8], [3.3, 5], [4.0, 0], [5.5, -2], [6.3, -3.2], [8.0, 0], [10.5, 0.6], [11.9, 0], [15, 0]]);
      // portals: heavier frames in the truss, placed exactly where the camera will be on each beat (2.0 ... 3.5),
      // so it passes one on every beat; the U itself is crossed on 1.5 and the truss bursts on 4.0
      PORTALS = [2.0, 2.5, 3.0, 3.5].map(function (bt) { return CV.z(bt); });
      // the corkscrew (degrees at full depth): it snaps in on the beat at 3.0 ("Culture."), flips on 3.5, is
      // straightened by the burst on 4.0
      CV.tw = Curve([[0, 0], [2.95, 0], [3.2, 32], [3.48, 30], [3.7, -14], [4.0, 0], [15, 0]]);
      routePieces();
      // buffers
      var gw = Math.max(1, Math.ceil(W * GS)), gh = Math.max(1, Math.ceil(H * GS));
      if (glow.width !== gw || glow.height !== gh) {
        glow.width = gw; glow.height = gh;
        glow2.width = Math.max(1, Math.ceil(gw / 2)); glow2.height = Math.max(1, Math.ceil(gh / 2));
        glow3.width = Math.max(1, Math.ceil(gw / 4)); glow3.height = Math.max(1, Math.ceil(gh / 4));
      }
      ledSetup();
      calmGrad = null;
      requestImage();
    }

    /* ---- The owner's image: loaded, fitted, feathered where it does not reach the edge (as film3.js does) ---- */
    function srcFor() {
      var I = opts.images || {}, pair = I[KIND] || [];
      var small = pair[0], big = pair[1] || pair[0];
      return imgRect.w <= FINAL[KIND].smallW * 1.05 && small ? small : big;
    }
    function requestImage() {
      var src = srcFor();
      if (!src) return;
      var im = IMG[src];
      if (!im) {
        im = IMG[src] = new Image();
        im.decoding = 'async';
        im.onload = function () { im._ok = true; prepLayer(); if (api.onready) api.onready(); if (!api.playing) redraw(); };
        im.onerror = function () { im._bad = true; console.warn('[endreel] ' + src + ' did not load; the reel opens on its drawing of the logo.'); };
        im.src = src;
      }
      prepLayer();
    }
    function prepLayer() {
      var src = srcFor(), im = IMG[src];
      layerOk = false;
      if (!im || !im._ok) return;
      var key = [src, imgRect.x, imgRect.y, imgRect.w, imgRect.h, W, H].map(String).join(' ');
      if (key === layerKey) { layerOk = true; return; }
      var r = imgRect, lw = Math.max(1, Math.round(r.w)), lh = Math.max(1, Math.round(r.h));
      layer.width = lw; layer.height = lh;
      lx.globalCompositeOperation = 'source-over'; lx.imageSmoothingQuality = 'high';
      lx.drawImage(im, 0, 0, lw, lh);
      function fz(band, most) { return band > 0.5 ? Math.min(most, Math.max(8 * dpr, band * 1.5)) : 0; }
      var ft = fz(r.y, 0.09 * r.h), fb = fz(H - r.y - r.h, 0.09 * r.h), fl = fz(r.x, 0.04 * r.w), fr = fz(W - r.x - r.w, 0.04 * r.w);
      lx.globalCompositeOperation = 'destination-in';
      if (ft || fb) { var g = lx.createLinearGradient(0, 0, 0, lh); g.addColorStop(0, ft ? 'rgba(0,0,0,0)' : '#000'); g.addColorStop(clamp(ft / lh, 0, 1), '#000'); g.addColorStop(clamp(1 - fb / lh, 0, 1), '#000'); g.addColorStop(1, fb ? 'rgba(0,0,0,0)' : '#000'); lx.fillStyle = g; lx.fillRect(0, 0, lw, lh); }
      if (fl || fr) { var h = lx.createLinearGradient(0, 0, lw, 0); h.addColorStop(0, fl ? 'rgba(0,0,0,0)' : '#000'); h.addColorStop(clamp(fl / lw, 0, 1), '#000'); h.addColorStop(clamp(1 - fr / lw, 0, 1), '#000'); h.addColorStop(1, fr ? 'rgba(0,0,0,0)' : '#000'); lx.fillStyle = h; lx.fillRect(0, 0, lw, lh); }
      lx.globalCompositeOperation = 'source-over';
      layerKey = key; layerOk = true;
    }
    function drawLayer(a, k) {   // k: the zoom of the push, about the counter's centre (HOME.tx, ty)
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
      var r = imgRect;
      if (k === 1) ctx.drawImage(layer, Math.round(r.x), Math.round(r.y), layer.width, layer.height);
      else ctx.drawImage(layer, HOME.tx + (r.x - HOME.tx) * k, HOME.ty + (r.y - HOME.ty) * k, r.w * k, r.h * k);
      ctx.globalAlpha = 1;
    }
    // the same, zoom-blurred: the photo as it moved during the shutter (from zoom kq to k), averaged in a buffer, so
    // its bright edges smear radially instead of sweeping across the screen while it dissolves
    // (at half size while it moves fast: it is blurred anyway, and a software canvas pays per pixel; at most six moments)
    var zbuf = mk(), zbx = zbuf.getContext('2d');
    function drawLayerMB(a, k, kq) {
      if (a < 0.01) return;
      var span = Math.abs(Math.log(k / kq)) * Math.max(W, H) * 0.6, n = span > 1.5 ? Math.min(6, Math.max(2, Math.ceil(span / 4))) : 1;   // (blurred until the smear is under 1.5 px: no snap to sharp)
      if (n <= 1) { drawLayer(a, k); return; }
      var zs = n >= 4 ? 0.5 : 1, zw = Math.ceil(W * zs), zh = Math.ceil(H * zs);   // (full size while it settles: no focus pop)
      if (zbuf.width !== zw || zbuf.height !== zh) { zbuf.width = zw; zbuf.height = zh; }
      var r = imgRect;
      zbx.setTransform(zs, 0, 0, zs, 0, 0); zbx.globalCompositeOperation = 'source-over'; zbx.globalAlpha = 1; zbx.clearRect(0, 0, W, H);
      for (var j = 0; j < n; j++) {
        var kj = Math.exp(lerp(Math.log(kq), Math.log(k), j / (n - 1)));
        zbx.globalAlpha = 1 / (j + 1);
        zbx.drawImage(layer, HOME.tx + (r.x - HOME.tx) * kj, HOME.ty + (r.y - HOME.ty) * kj, r.w * kj, r.h * kj);
      }
      zbx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.imageSmoothingEnabled = true; ctx.drawImage(zbuf, 0, 0, W, H); ctx.globalAlpha = 1;
    }

    /* ==========================================================================
       Layers
       ========================================================================== */
    function imageAlpha(t) {
      if (t < TL.imgOut[0]) return 1;
      if (t < TL.imgIn[0]) return 1 - E.inOutCubic(seg(t, TL.imgOut[0], TL.imgOut[1]));
      return E.inOutCubic(seg(t, TL.imgIn[0], TL.imgIn[1]));
    }
    function vecAlpha(t) { return E.inOutCubic(seg(t, 0.62, 1.04)) * (1 - E.inOutCubic(seg(t, 14.3, 14.74))); }
    function desertW(t) { return smooth(seg(t, TL.desert[0], TL.desert[1])); }

    function sky(t, a, des) {
      if (a <= 0) return;
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
      // the cosmos: near-black, a navy bloom where the truss vanishes; the desert: the image's navy night
      var top = mix([3, 4, 8], SKY_TOP, des), low = mix([8, 10, 19], SKY_LOW, des);
      var hy = horizonY(), g = ctx.createLinearGradient(0, hy - H * 0.9, 0, hy);
      g.addColorStop(0, rgba(top, 1)); g.addColorStop(1, rgba(low, 1));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var cg = ctx.createRadialGradient(PX, PY, 0, PX, PY, Math.max(W, H) * 0.42);
      cg.addColorStop(0, rgba([28, 36, 70], 0.42 * (1 - des))); cg.addColorStop(1, 'rgba(28,36,70,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    function horizonY() { return proj(CX + F0 * 1e5, CY, CZ + F2 * 1e5) ? PJ.y : PY; }

    function stars(t, a) {
      if (a <= 0) return;
      var st = Wd.stars, n = Wd.nS, big = [];
      var w = 0.75 * a, sd = dpr;
      for (var i = 0; i < n; i++) {
        var o = i * 6, x = st[o], y = st[o + 1], z = st[o + 2];
        var zc = x * F0 + y * F1 + z * F2;
        if (zc < 0.05) continue;
        var sx = PX + FOC * (x * R0 + y * R1 + z * R2) / zc, sy = PY - FOC * (x * U0 + y * U1 + z * U2) / zc;
        if (sx < -2 || sy < -2 || sx > W + 2 || sy > H + 2) continue;
        var m = st[o + 3], tw = 0.82 + 0.18 * Math.sin(st[o + 4] * t * Math.PI * 2 / DUR + st[o + 5]);
        var al = m * tw * w;
        addDotRaw(sx, sy, (0.7 + m * 1.2) * sd, al, m > 0.8 ? C_HOT : C_INK);
        if (m > 0.93 && !LITE) big.push(sx, sy, m * al);
      }
      flushDotsRaw();
      for (var j = 0; j < big.length; j += 3) addSprite(1, big[j], big[j + 1], 18 * dpr, big[j + 2] * 0.5);
    }
    // stars are drawn under the photo and the land: their own batch, unaffected by LA
    var SD = []; for (i0 = 0; i0 < NA * NC; i0++) SD.push([]);
    function addDotRaw(x, y, s, a, c) { if (a < 0.01) return; var q = Math.sqrt(a) * NA | 0; if (q >= NA) q = NA - 1; SD[c * NA + q].push(x, y, s); }
    function flushDotsRaw() {
      ctx.globalCompositeOperation = 'lighter';
      for (var k = 0; k < SD.length; k++) {
        var arr = SD[k]; if (!arr.length) continue;
        ctx.fillStyle = STY[k]; ctx.beginPath();
        for (var j = 0; j < arr.length; j += 3) { var s = arr[j + 2]; ctx.rect(arr[j] - s / 2, arr[j + 1] - s / 2, s, s); }
        ctx.fill(); arr.length = 0;
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // the land: below the ridge, a silhouette (drawn over the stars), the plotted ridge line on top
    function land(t, a) {
      if (a <= 0) return;
      var rid = Wd.ridge, pts = [];
      for (var i = 0; i < rid.length; i++) if (proj(rid[i][0], rid[i][1], rid[i][2])) pts.push(PJ.x, PJ.y);
      if (pts.length < 4) return;
      var hy = horizonY();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
      var g = ctx.createLinearGradient(0, hy - H * 0.12, 0, H);
      g.addColorStop(0, rgba([22, 16, 24], 1)); g.addColorStop(0.25, rgba(LAND, 1)); g.addColorStop(1, rgba([9, 9, 11], 1));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(pts[0], H * 2); ctx.lineTo(pts[0], pts[1]);
      for (var j = 2; j < pts.length; j += 2) ctx.lineTo(pts[j], pts[j + 1]);
      ctx.lineTo(pts[pts.length - 2], H * 2); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    function ridgeLine(t) {
      var k = seg(t, TL.ridge[0], TL.ridge[1]);
      if (k <= 0) return;
      var rid = Wd.ridge, n = rid.length - 1, head = E.inOutCubic(k) * n, fade = 1 - smooth(seg(t, 13.9, 14.5));
      FN = 900; FF = 3000; COOL = 0;
      for (var i = 0; i < n && i < head; i++) {
        var f = Math.min(1, head - i), a = rid[i], b = rid[i + 1];
        var near = Math.max(0, 1 - (head - i) / 6);   // the pen: brighter where it is drawing
        seg3(a[0], a[1], a[2], lerp(a[0], b[0], f), lerp(a[1], b[1], f), b[2], (0.3 + 0.6 * near) * fade, C_INK, 0);
      }
      if (k < 1) { var hi = Math.min(n, Math.floor(head)), hf = head - hi, p = rid[hi], q = rid[Math.min(n, hi + 1)];
        if (proj(lerp(p[0], q[0], hf), lerp(p[1], q[1], hf), p[2])) addSprite(0, PJ.x, PJ.y, 22 * dpr, 0.9 * fade); }
    }

    function grid(t) {
      var k = seg(t, TL.scan[0], TL.scan[1]);
      if (k <= 0) return;
      // (in the show the CAD plan gives way to light: the grid steps back, the centre line and the bubbles go)
      var R = 18 + 320 * E.outCubic(k), g = Wd.grid, sk = showK(t), skb = smooth(seg(t, 7.8, 8.6)), fade = 1 - smooth(seg(t, 13.6, 14.4)), gf = fade * (1 - 0.6 * sk), y = GROUND;
      FN = 40; FF = 230;
      for (var i = 0; i < g.length; i++) {
        var p = g[i], mx = (p[0] + p[2]) / 2, mz = (p[1] + p[3]) / 2, d = Math.sqrt(mx * mx + (mz - ZS) * (mz - ZS));
        if (d > R) continue;
        var edge = Math.exp(-(R - d) * (R - d) / 60) * (k < 1 ? 1 : 0);
        seg3(p[0], y, p[1], p[2], y, p[3], ((p[4] ? 0.3 : 0.13) + 0.75 * edge) * gf, edge > 0.3 ? C_HOT : C_STEEL, 0);
      }
      // the centre line, dash-dot, and grid bubbles A-E at the front of the stage (drafting)
      if (k > 0.15) {
        var a = smooth(seg(k, 0.15, 0.5)) * fade * (1 - skb) * LA;   // (gone for good once the show starts)
        if (a > 0.004) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(INK, 0.42 * a); ctx.lineWidth = 1.1 * dpr;
        ctx.setLineDash([14 * dpr, 5 * dpr, 2 * dpr, 5 * dpr]); ctx.beginPath();
        var ok = false;
        for (var z = 40; z < 300; z += 10) {
          if (proj(0, y, z)) { if (!ok) ctx.moveTo(PJ.x, PJ.y); else ctx.lineTo(PJ.x, PJ.y); ok = true; } else ok = false;
        }
        ctx.stroke(); ctx.restore();
        var bz = ZS - 15, labels = ['A', 'B', 'C', 'D', 'E'];
        for (var b = 0; b < 5; b++) bubble(-20 + b * 10, y, bz, labels[b], a * smooth(seg(k, 0.25 + b * 0.04, 0.45 + b * 0.04)));
        }
      }
    }
    function bubble(x, y, z, label, a) {
      if (a <= 0.01) return;
      var r = 1.3, n = 18, px0 = 0, py0 = 0;
      for (var i = 0; i <= n; i++) {
        var an = i / n * Math.PI * 2;
        var bx1 = x + Math.cos(an) * r, bz1 = z - 3 + Math.sin(an) * r;
        if (i) seg3(px0, y, py0, bx1, y, bz1, 0.55 * a / LA, C_INK, 1);
        px0 = bx1; py0 = bz1;
      }
      seg3(x, y, z - 1.7, x, y, z, 0.4 * a / LA, C_INK, 0);
      if (proj(x, y, z - 3) && PJ.z < 140) {
        var fs = clamp(FOC * 1.1 / PJ.z, 6 * dpr, 30 * dpr);
        textQ.push([label, PJ.x, PJ.y, fs, 0.62 * a, 'mono']);
      }
    }

    function megas(t) {
      var a = smooth(seg(t, 1.0, 2.0)) * (1 - smooth(seg(t, 4.6, 6.2)));
      if (a <= 0) return;
      FN = 180; FF = 900;
      Wd.megas.forEach(function (m) {
        var dx = m.b[0] - m.a[0], dy = m.b[1] - m.a[1], dz = m.b[2] - m.a[2], L = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var ux = dx / L, uy = dy / L, uz = dz / L;
        // a section frame: two vectors square to the axis
        var px = -uz, py = 0, pz = ux, pl = Math.sqrt(px * px + pz * pz);
        if (pl < 0.1) { px = 1; py = 0; pz = 0; pl = 1; }
        px /= pl; pz /= pl;
        var qx = uy * pz - uz * py, qy = uz * px - ux * pz, qz = ux * py - uy * px;
        var cs = [[0, 1], [0.866, -0.5], [-0.866, -0.5]], n = Math.ceil(L / m.p), s = m.s;
        for (var i = 0; i < n; i++) {
          var x0 = m.a[0] + ux * m.p * i, y0 = m.a[1] + uy * m.p * i, z0 = m.a[2] + uz * m.p * i;
          var near = Math.abs(x0 - CX) + Math.abs(z0 - CZ) < 380;
          for (var c = 0; c < 3; c++) {
            var e = cs[c], f = cs[(c + 1) % 3];
            var ax = x0 + (px * e[0] + qx * e[1]) * s, ay = y0 + (py * e[0] + qy * e[1]) * s, az = z0 + (pz * e[0] + qz * e[1]) * s;
            seg3(ax, ay, az, ax + ux * m.p, ay + uy * m.p, az + uz * m.p, 0.55 * a, C_STEEL, 0);
            if (near) {
              var bx = x0 + (px * f[0] + qx * f[1]) * s, by = y0 + (py * f[0] + qy * f[1]) * s, bz = z0 + (pz * f[0] + qz * f[1]) * s;
              seg3(ax, ay, az, bx, by, bz, 0.3 * a, C_STEEL, 0);
              seg3(ax, ay, az, bx + ux * m.p, by + uy * m.p, bz + uz * m.p, 0.26 * a, C_STEEL, 0);
            }
          }
        }
      });
    }

    function tunnelFront(t) {
      var L = LT + 3 - U_DEPTH;
      if (t < TL.grow[0]) return U_DEPTH;
      if (t < TL.retract[0]) return U_DEPTH + L * E.outQuad(seg(t, TL.grow[0], TL.grow[1]));
      return U_DEPTH + L * (1 - E.inCubic(seg(t, TL.retract[0], TL.retract[1])));
    }
    var KA = [0.92, 0.5, 0.36, 0.5, 0.62];   // alpha by member: chord, frame, lacing, mid chord, rail (the chords run down the view: they barely move on screen, so they carry the light)
    // A member's drawn stretch at a moment (state S: the time, the growth front, the twist, the camera's depth), so
    // it can be drawn where it is and where it was a shutter ago (the burst, the twist and the flight all blur).
    var TSN = {}, TSP = {}, MA = new Float32Array(8), MQ = new Float32Array(8), Z4 = 0, ZB = 0, TPREV = 0;
    function tState(tt, czz, o) { o.t = tt; o.front = tunnelFront(tt); o.twr = CV.tw(tt) * DEG; o.ret = tt >= TL.back; o.cz = czz; return o; }
    function twistS(x, y, z, S) {
      var k = smooth(clamp((z - S.cz - 4) / 66, 0, 1)), a = S.twr * k, c = Math.cos(a), s = Math.sin(a), dy = y - TY;
      TWx = x * c - dy * s; TWy = TY + x * s + dy * c;
    }
    function memberAt(n, S, out) {
      var TA = Wd.TA, o = n * 6, az = TA[o + 2], bz = TA[o + 5], tt = S.t;
      if (S.front <= az) return false;
      if (tt > TL.burst + 1.6 && tt < TL.back) return false;
      var v = (S.front - az) / Math.max(bz - az, 2.2);
      if (v > 1) v = 1;
      var zi = Wd.st[Wd.TI[n]].z, e = 0;
      if (tt >= TL.burst && tt < TL.back) { var d0 = TL.burst + 0.006 * Math.max(0, zi - Z4); e = E.outExpo(seg(tt, d0, d0 + 0.95)); }
      else if (tt >= TL.back) { var d1 = TL.back + 0.004 * Math.max(0, zi - ZB); e = 1 - E.inOutCubic(seg(tt, d1, d1 + 0.5)); }
      if (e > 0.995) return false;
      var sc = S.ret ? 1 : 1 + 10 * e, zo = S.ret ? 0 : 7 * e;
      var ax = TA[o], ay = TA[o + 1], bx = TA[o + 3], by = TA[o + 4];
      if (S.twr) { twistS(ax, ay, az, S); ax = TWx; ay = TWy; twistS(bx, by, bz, S); bx = TWx; by = TWy; }
      ax *= sc; ay = TY + (ay - TY) * sc; bx *= sc; by = TY + (by - TY) * sc;
      out[0] = ax; out[1] = ay; out[2] = az + zo; out[3] = ax + (bx - ax) * v; out[4] = ay + (by - ay) * v; out[5] = az + (bz - az) * v + zo;
      out[6] = e; out[7] = v;
      return true;
    }
    function tunnel(t) {
      var front = tunnelFront(t);
      if (front <= U_DEPTH + 0.01) return;
      var hidden = t > TL.burst + 1.6 && t < TL.back;
      if (hidden) return;
      var z4 = Z4 = CV.z(TL.burst), zb = ZB = CV.z(TL.back), TK = Wd.TK, st = Wd.st;
      FN = 24; FF = 92; COOL = 30;
      var sparks = t < TL.grow[1] || t > TL.retract[0];
      TWr = CV.tw(t) * DEG;   // the corkscrew (radians at full depth ahead)
      var ret = t >= TL.back;   // on the way home the truss materialises in place (a staggered fade), no implosion
      tState(t, CZ, TSN); tState(TPREV, QZ, TSP);
      FADEFAST = ret && t < 14.12;   // (see seg3p; reset at the end. Out through the U the camera leaves the axis: speed lines again)
      for (var n = 0; n < Wd.TN; n++) {
        if ((TK[n] === 4 && !ret) || !memberAt(n, TSN, MA)) continue;
        if (!MB || !memberAt(n, TSP, MQ)) MQ.set(MA);
        var e = MA[6], v = MA[7], kind = TK[n], al = (1 - e) * (1 - e) * KA[kind];
        // detail by spacing on screen (a mip level): a frame or a lacing member fades out where the bays it belongs to
        // are closer than about 3-6 device px on screen, so a receding lattice never packs into a shimmer on a small
        // screen; the chords, which carry the tunnel, stay
        if (kind === 1 || kind === 2) {
          var zc = MA[2] - CZ;
          if (zc > 2) { var bsp = FOC * 3 * PANEL * (1 + 10 * e) / (zc * zc); al *= smooth(clamp((bsp - 3) / 3, 0, 1)); }
        }
        seg3p(MA[0], MA[1], MA[2], MA[3], MA[4], MA[5], MQ[0], MQ[1], MQ[2], MQ[3], MQ[4], MQ[5], al, C_INK, kind === 0 ? -1 : null);
        if (kind === 0 && e < 0.05) {
          if (v >= 1) { if (MA[2] - CZ < 46 && MA[2] - CZ > -2) glint(MA[0], MA[1], MA[2], MA[3], MA[4], MA[5], 0.85, false); }
          else if (sparks && proj(MA[3], MA[4], MA[5])) addSprite(0, PJ.x, PJ.y, clamp(FOC * 0.5 / PJ.z, 3 * dpr, 30 * dpr), 0.95 * fogA(PJ.z));
        }
      }
      // LED panels in the walls: a faint pixel face that wakes as the camera comes up to it (not on the way home: there
      // each would come from behind the camera, a big pane at the frame's edge)
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var pn = 0; pn < (ret ? 0 : Wd.panels.length); pn++) {
        var P = Wd.panels[pn], A0 = st[P.i], B0 = st[P.i + 1];
        if (front <= B0.z) continue;
        var e3 = 0;
        if (t >= TL.burst && t < TL.back) { var d4 = TL.burst + 0.006 * Math.max(0, A0.z - z4); e3 = E.outExpo(seg(t, d4, d4 + 0.95)); }
        else if (t >= TL.back) { var d5 = TL.back + 0.004 * Math.max(0, A0.z - zb); e3 = 1 - E.inOutCubic(seg(t, d5, d5 + 0.5)); }
        if (e3 > 0.9) continue;
        var ci = P.side < 0 ? (P.up ? [0, 3] : [0, 0]) : (P.up ? [1, 2] : [1, 1]), qs = [], ok = true;
        var mkA = P.side < 0 ? A0.ml : A0.mr, mkB = P.side < 0 ? B0.ml : B0.mr;
        var ya0 = P.up ? mkA[1] : A0.c[ci[0]][1], ya1 = P.up ? A0.c[ci[1]][1] : mkA[1], yb0 = P.up ? mkB[1] : B0.c[ci[0]][1], yb1 = P.up ? B0.c[ci[1]][1] : mkB[1];
        var xa = mkA[0] * 0.995, xb = mkB[0] * 0.995, sk3 = ret ? 1 : 1 + 10 * e3;
        var Q = [[xa, ya0, A0.z], [xb, yb0, B0.z], [xb, yb1, B0.z], [xa, ya1, A0.z]];
        for (var qi = 0; qi < 4 && ok; qi++) { tv(Q[qi][0], Q[qi][1], Q[qi][2], sk3); ok = proj(TWx, TWy, Q[qi][2]); qs.push(PJ.x, PJ.y); }
        if (!ok) continue;
        // (it wakes as the camera comes up to it, and lets go before it passes: no big pane sweeping past the lens)
        var dzp = A0.z - CZ, wake = clamp(1 - dzp / 34, 0, 1), pa2 = (0.035 + 0.13 * wake * wake) * fogA(Math.max(1, dzp)) * (1 - e3) * smooth(clamp((dzp - 2) / 9, 0, 1)) * LA;
        if (pa2 < 0.01) continue;
        ctx.fillStyle = rgba([150, 172, 240], pa2);
        ctx.beginPath(); ctx.moveTo(qs[0], qs[1]); ctx.lineTo(qs[2], qs[3]); ctx.lineTo(qs[4], qs[5]); ctx.lineTo(qs[6], qs[7]); ctx.closePath(); ctx.fill();
        for (var rw = 1; rw < 6; rw++) {   // pixel rows, a scan running along them
          var f = rw / 6;
          tv(xa, lerp(ya0, ya1, f), A0.z, sk3); var rx0 = TWx, ry0 = TWy;
          tv(xb, lerp(yb0, yb1, f), B0.z, sk3);
          seg3(rx0, ry0, A0.z, TWx, TWy, B0.z, (0.12 + 0.35 * wake) * (1 - e3) * (0.6 + 0.4 * Math.sin(rw * 1.7 + P.ph * 6.28 + t * Math.PI * 4)), C_STEEL, 0);
        }
      }
      ctx.restore();
      // the beat portals: a double frame with marker lights, brightening as the camera comes up to it
      for (var p = 0; p < PORTALS.length; p++) {
        var zp = PORTALS[p];
        if (front <= zp + 0.2 || zp < CZ - 1) continue;
        var e2 = 0;
        if (t >= TL.burst && t < TL.back) { var d2 = TL.burst + 0.006 * Math.max(0, zp - z4); e2 = E.outExpo(seg(t, d2, d2 + 0.95)); }
        else if (t >= TL.back) { var d3 = TL.back + 0.004 * Math.max(0, zp - zb); e2 = 1 - E.inOutCubic(seg(t, d3, d3 + 0.5)); }
        if (e2 > 0.995) continue;
        var s = sec(zp), sk = ret ? 1 : 1 + 10 * e2, near = clamp(1 - (zp - CZ) / 45, 0, 1), pa = (1 - e2) * (1 - e2) * (0.3 + 0.7 * near * near);
        // (on the way home a portal comes from behind the camera: it is an ordinary member then, capped and streaked like
        // the rest, fading up with its distance ahead, and it carries no marker lights: nothing hot sweeps in from the edges)
        if (ret) pa = (1 - e2) * (1 - e2) * 0.6 * smooth(clamp((zp - CZ - 2) / 10, 0, 1));
        var pc = ret ? C_INK : C_HOT;
        var gp = clamp((front - zp) / 6, 0, 1);
        for (var r = 0; r < 2; r++) {
          var ins = r * 0.24, ra = pa * (r ? 0.55 : 0.95) * gp, K = [[-s.hw + ins, s.yb + ins], [s.hw - ins, s.yb + ins], [s.hw - ins, s.yt - ins], [-s.hw + ins, s.yt - ins]], KP = [];
          for (var kk = 0; kk < 4; kk++) { tv(K[kk][0], K[kk][1], zp, sk); KP.push(TWx, TWy); }
          for (kk = 0; kk < 4; kk++) { var k2 = (kk + 1) % 4; seg3(KP[kk * 2], KP[kk * 2 + 1], zp, KP[k2 * 2], KP[k2 * 2 + 1], zp, ra, pc, -1); }
          if (r === 0 && !ret) for (kk = 0; kk < 4; kk++) if (proj(KP[kk * 2], KP[kk * 2 + 1], zp)) addSprite(1, PJ.x, PJ.y, clamp(FOC * 1.1 / PJ.z, 6 * dpr, 80 * dpr), pa * gp * 0.85 * fogA(PJ.z));
        }
      }
      // the burst's shock frame: the section, blown outwards from just ahead of the camera
      var sh = seg(t, TL.burst, TL.burst + 0.55);
      if (sh > 0 && sh < 1) {
        for (var w2 = 0; w2 < 2; w2++) {
          var kx = E.outCubic(clamp(sh * 1.15 - w2 * 0.15, 0, 1)), zs = z4 + 7 + w2 * 5, ss = sec(zs), m = 1 + 12 * kx, sa = (1 - kx) * (1 - kx) * 0.95;
          var x0 = -ss.hw * m, x1 = ss.hw * m, y0 = TY + (ss.yb - TY) * m, y1 = TY + (ss.yt - TY) * m;
          seg3(x0, y0, zs, x1, y0, zs, sa, C_HOT, -1); seg3(x1, y0, zs, x1, y1, zs, sa, C_HOT, -1);
          seg3(x1, y1, zs, x0, y1, zs, sa, C_HOT, -1); seg3(x0, y1, zs, x0, y0, zs, sa, C_HOT, -1);
        }
      }
      FADEFAST = false;
    }
    // the corkscrew: (x, y) turned about the truss's axis, more the deeper ahead of the camera; then the burst's scale
    var TWr = 0, TWx = 0, TWy = 0;
    function TW2(x, y, z) {
      var k = smooth(clamp((z - CZ - 4) / 66, 0, 1)), a = TWr * k, c = Math.cos(a), s = Math.sin(a), dy = y - TY;
      TWx = x * c - dy * s; TWy = TY + x * s + dy * c;
    }
    function tv(x, y, z, sk) { if (TWr) { TW2(x, y, z); x = TWx; y = TWy; } TWx = x * sk; TWy = TY + (y - TY) * sk; }
    // the light at the end of the truss (the key light for the glints): a cool bloom and an anamorphic streak
    function endLight(t) {
      var a = smooth(seg(t, 0.85, 1.7)) * (1 - smooth(seg(t, 3.85, 4.25))) * LA;
      if (a <= 0.01 || !proj(0, TY + 1, LT + 60)) return;
      var x = PJ.x, y = PJ.y, r = Math.max(W, H) * 0.2;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba([196, 212, 255], 0.2 * a)); g.addColorStop(0.3, rgba([150, 170, 230], 0.07 * a)); g.addColorStop(1, 'rgba(150,170,230,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      var s = ctx.createLinearGradient(x - W * 0.45, 0, x + W * 0.45, 0);
      s.addColorStop(0, 'rgba(170,190,255,0)'); s.addColorStop(0.5, rgba([200, 215, 255], 0.22 * a)); s.addColorStop(1, 'rgba(170,190,255,0)');
      ctx.fillStyle = s; ctx.fillRect(x - W * 0.45, y - 0.8 * dpr, W * 0.9, 1.6 * dpr);
      ctx.restore();
      gx.save(); gx.globalCompositeOperation = 'lighter'; gx.globalAlpha = 0.5 * a;
      var gs = 150 * dpr * GS; gx.drawImage(SPR[0], x * GS - gs / 2, y * GS - gs / 2, gs, gs);
      gx.restore();
    }

    function segPose(s, t, out) {
      if (t < TL.burst + s.delay) return false;
      var tb = TL.burst + s.delay, ts = s.land - FLIGHT, p, q, a = 1, d;
      if (t < ts) {
        var k = E.outExpo(seg(t, tb, tb + 1.4));
        d = t - TL.burst;
        var rp = [s.rp[0] + s.dv[0] * d, s.rp[1] + s.dv[1] * d, s.rp[2] + s.dv[2] * d];
        var rq = qMul(qAxis(s.sa[0], s.sa[1], s.sa[2], s.sr * d), s.rq);
        p = [lerp(s.sp[0], rp[0], k), lerp(s.sp[1], rp[1], k), lerp(s.sp[2], rp[2], k)];
        q = qSlerp(Q_Z, rq, E.outCubic(k));
        a = seg(t, tb, tb + 0.15);
        out.fly = 0;
      } else if (t < s.land) {
        d = ts - TL.burst;
        var fp = [s.rp[0] + s.dv[0] * d, s.rp[1] + s.dv[1] * d, s.rp[2] + s.dv[2] * d];
        var fq = qMul(qAxis(s.sa[0], s.sa[1], s.sa[2], s.sr * d), s.rq);
        var kk = E.inOutCubic(seg(t, ts, s.land));
        p = [lerp(fp[0], s.p[0], kk), lerp(fp[1], s.p[1], kk) + Math.sin(kk * Math.PI) * s.arc, lerp(fp[2], s.p[2], kk)];
        q = qSlerp(fq, s.q, kk);
        out.fly = Math.sin(kk * Math.PI);
      } else {
        var b = 1 - E.settle(seg(t, s.land, s.land + 0.4));
        p = [s.p[0], s.p[1] + 0.35 * b, s.p[2]]; q = s.q;
        out.fly = 0;
      }
      out.p = p; out.q = q; out.a = a; out.since = t - s.land;
      return true;
    }
    var M9 = new Float32Array(9), M9Q = new Float32Array(9), POSE = {}, POSEQ = {};
    function stage(t) {
      if (t < TL.burst) return;
      var fade = 1 - smooth(seg(t, 13.75, 14.3));
      if (fade <= 0) return;
      var tpl = Wd.tpl, segs = Wd.segs;
      FN = 60; FF = 300; COOL = 150;
      // light on the rig: moonlight until the wall wakes; then the wall back-lights what stands near it and the heads
      // light the roof (the front towers, far from both, stay dimmer: depth)
      var wo = wallOn(t), bo = beamOn(t), lz = Wd.led.z, ry = Wd.roofY, LEDX = Wd.led.x1, LEDY0 = Wd.led.y0, LEDY1 = Wd.led.y1;
      for (var n = 0; n < segs.length; n++) {
        var s = segs[n];
        if (!segPose(s, t, POSE)) continue;
        qMat(POSE.q, M9);
        // where it was a shutter ago (pieces in flight streak)
        var hq = MB && segPose(s, TPREV, POSEQ);
        if (hq) qMat(POSEQ.q, M9Q);
        var p = POSE.p, len = s.len, m = M9, pq = hq ? POSEQ.p : p, mq = hq ? M9Q : M9;
        var lit = 0.86 - 0.18 * wo + 0.55 * wo * Math.exp(-Math.max(0, lz - p[2]) / 5) + 0.3 * bo * Math.exp(-Math.abs(p[1] - ry) / 2.5);
        var a = POSE.a * fade * (0.62 + 0.38 * POSE.fly) * lit;
        // chrome glints while it is built (the show lights it instead: on members running down the view axis a slow
        // push makes the specular point skip from member to member, a twinkle the eye reads as flicker)
        var gla = 1 - smooth(seg(t, 7.4, 7.9)), nearCam = gla > 0 && Math.abs(p[2] - CZ) < 70;
        // detail by size on screen: a piece's lacing and end frames fade where its bays get closer than a few device px (a
        // small screen, a far piece), so a lattice never packs into a shimmer; in the pull-back the lacing goes altogether
        // and the rig recedes as clean outlines (its chords), which keeps the receding stage from flickering
        var lod = 1 - smooth(seg(t, SC.t1, SC.t1 + 0.35));
        if (proj(p[0] - m[0] * len / 2, p[1] - m[3] * len / 2, p[2] - m[6] * len / 2)) { var lx0 = PJ.x, ly0 = PJ.y; if (proj(p[0] + m[0] * len / 2, p[1] + m[3] * len / 2, p[2] + m[6] * len / 2)) lod *= smooth(clamp((Math.hypot(PJ.x - lx0, PJ.y - ly0) / 3 - 4) / 5, 0, 1)); }
        for (var j = 0; j < tpl.length; j++) {
          var L = tpl[j], x1 = L[0] * len, x2 = L[3] * len;
          var ax = p[0] + m[0] * x1 + m[1] * L[1] + m[2] * L[2], ay = p[1] + m[3] * x1 + m[4] * L[1] + m[5] * L[2], az = p[2] + m[6] * x1 + m[7] * L[1] + m[8] * L[2];
          var bx = p[0] + m[0] * x2 + m[1] * L[4] + m[2] * L[5], by = p[1] + m[3] * x2 + m[4] * L[4] + m[5] * L[5], bz = p[2] + m[6] * x2 + m[7] * L[4] + m[8] * L[5];
          var qax = pq[0] + mq[0] * x1 + mq[1] * L[1] + mq[2] * L[2], qay = pq[1] + mq[3] * x1 + mq[4] * L[1] + mq[5] * L[2], qaz = pq[2] + mq[6] * x1 + mq[7] * L[1] + mq[8] * L[2];
          var qbx = pq[0] + mq[0] * x2 + mq[1] * L[4] + mq[2] * L[5], qby = pq[1] + mq[3] * x2 + mq[4] * L[4] + mq[5] * L[5], qbz = pq[2] + mq[6] * x2 + mq[7] * L[4] + mq[8] * L[5];
          var la = (L[6] ? 0.78 : 0.42 * lod) * a, lw = L[6] ? -1 : null;
          if (la < 0.004) continue;
          // chrome near the wall takes its blue (the back towers' inner faces, the roof's underside), fading with distance
          var kb = 0;
          if (wo > 0.01) {
            var mxp = (ax + bx) / 2, myp = (ay + by) / 2, mzp = (az + bz) / 2, ddx = Math.max(0, Math.abs(mxp) - LEDX), ddy = Math.max(0, LEDY0 - myp, myp - LEDY1), ddz = mzp - lz;
            kb = wo * 0.85 * (1 - smooth(clamp((Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz) - 1) / 9, 0, 1)));
          }
          if (kb > 0.02) {
            seg3p(ax, ay, az, bx, by, bz, qax, qay, qaz, qbx, qby, qbz, la * (1 - kb), C_INK, lw);
            seg3p(ax, ay, az, bx, by, bz, qax, qay, qaz, qbx, qby, qbz, la * kb * 1.3, C_BLUE, lw);
          } else seg3p(ax, ay, az, bx, by, bz, qax, qay, qaz, qbx, qby, qbz, la, C_INK, lw);
          if (L[6] && nearCam && j < 2) glint(ax, ay, az, bx, by, bz, 0.8 * a * gla, false);
        }
        // the landing: a quick hard glint at each of its joints, then gone (scale: they read as points on a big rig)
        if (POSE.since >= 0 && POSE.since < 0.26) {
          var env = POSE.since < 0.035 ? POSE.since / 0.035 : 1 - smooth((POSE.since - 0.035) / 0.225);
          for (var je = -1; je <= 1; je += 2) {
            var hx = p[0] + m[0] * je * len / 2, hy = p[1] + m[3] * je * len / 2, hz = p[2] + m[6] * je * len / 2;
            if (proj(hx, hy, hz)) addSprite(1, PJ.x, PJ.y, clamp(FOC * 1.1 / PJ.z, 7 * dpr, 40 * dpr), 0.5 * env * fade * fogA(PJ.z));
          }
        }
      }
      deck(t, fade); pa(t, fade); heads(t, fade); ledFrame(t, fade);
    }
    // the audience: dark heads and shoulders, seen from behind, against the wall's light on the deck's front and the
    // ground; a thin rim of its blue on the front rows' heads (back-lit). Each row is one strip of people, made once
    // (four strips, picked and shifted row by row), laid on its line across the field in one draw: a few dozen draws a
    // frame, into a buffer at half the size. Drawn before the rig and the truss (their lines pass over it), never over
    // the wall (it is above them on screen from any of the camera's places). They come in as the wall lights the field,
    // bob a little on the beat from the SHOW downbeat, and are gone as the camera sets off on the pull-back. Rows deep
    // in the card's band, under its scrim, are not drawn.
    var CROWD = null, CK = 0, STW = 80, HREF = 1.69;   // strips: [silhouettes, rims]; CK px a metre; STW m wide; HREF: the strip's reference head height
    function crowdStrips() {
      CK = LITE ? 40 : 64;
      var R = rng(4242), k = CK, sw = Math.round(STW * k), sh = Math.round(1.3 * k), out = [[], []];
      for (var s = 0; s < 4; s++) {
        var c = mk(sw, sh), g = c.getContext('2d'), rm = mk(sw, Math.round(0.5 * k)), rg = rm.getContext('2d');
        g.fillStyle = '#05060a';
        rg.strokeStyle = 'rgb(170,190,255)'; rg.lineWidth = 0.035 * k; rg.lineCap = 'round';
        for (var x = 0.3 + R() * 0.5; x < STW - 0.3; x += 0.52 + R() * 0.55) {
          if (R() < 0.1) { x += 0.4; continue; }   // (gaps)
          var hgt = 1.56 + R() * 0.26, b = (0.88 + 0.24 * R()) * k, cx = x * k, hy = (0.25 + HREF - hgt) * k, r = 0.115 * k;
          g.beginPath(); g.arc(cx, hy, r, 0, Math.PI * 2); g.fill();
          g.beginPath();   // neck, shoulders and upper body: a rounded trapezoid
          g.moveTo(cx - 0.05 * b, hy + 0.08 * k); g.lineTo(cx + 0.05 * b, hy + 0.08 * k);
          g.quadraticCurveTo(cx + 0.06 * b, hy + 0.2 * k, cx + 0.2 * b, hy + 0.23 * k);
          g.quadraticCurveTo(cx + 0.25 * b, hy + 0.25 * k, cx + 0.245 * b, hy + 0.36 * k);
          g.lineTo(cx + 0.235 * b, hy + 0.58 * k); g.lineTo(cx - 0.235 * b, hy + 0.58 * k);   // (the rest is lost in the dark between the rows)
          g.lineTo(cx - 0.245 * b, hy + 0.36 * k); g.quadraticCurveTo(cx - 0.25 * b, hy + 0.25 * k, cx - 0.2 * b, hy + 0.23 * k);
          g.quadraticCurveTo(cx - 0.06 * b, hy + 0.2 * k, cx - 0.05 * b, hy + 0.08 * k);
          g.closePath(); g.fill();
          rg.beginPath(); rg.arc(cx, hy, r - 0.01 * k, Math.PI * 1.12, Math.PI * 1.88); rg.stroke();
        }
        out[0].push(c); out[1].push(rm);
      }
      CROWD = out;
    }
    var crowdC = mk(), crx = crowdC.getContext('2d'), CS = 0.5;
    function rowXf(x0, x1, y, z, o) {   // the affine map from a strip's px to the screen for the stretch x0...x1 of a row
      if (!proj(x0, y, z)) return false; var ax = PJ.x, ay = PJ.y;
      if (!proj(x1, y, z)) return false; var bx = PJ.x, by = PJ.y;
      if (!proj(x0, y - 1, z)) return false;
      var L = (x1 - x0) * CK;
      o.a = (bx - ax) / L; o.b = (by - ay) / L; o.c = (PJ.x - ax) / CK; o.d = (PJ.y - ay) / CK; o.ax = ax; o.ay = ay;
      return true;
    }
    var RX = {};
    function crowd(t) {
      var on = smooth(seg(t, 7.55, 8.2)) * (1 - smooth(seg(t, SC.t1, SC.t1 + 0.32))) * LA;   // (gone as the camera sets off: heads rushing over the lit floor would flicker)
      if (on <= 0.01) return;
      if (!CROWD || CK !== (LITE ? 40 : 64)) crowdStrips();
      var rows = Wd.rows, G = GROUND, front = ZS - 10.4, rimOn = wallOn(t) * (0.9 + 0.9 * climax(t)), bounce = smooth(seg(t, 8.0, 8.5));
      var cw = Math.max(1, Math.ceil(W * CS)), ch = Math.max(1, Math.ceil(H * CS)), y0 = 1e9, y1 = -1e9, bottom = H * 0.93, i, k = CK;
      if (crowdC.width !== cw || crowdC.height !== ch) { crowdC.width = cw; crowdC.height = ch; }
      crx.setTransform(1, 0, 0, 1, 0, 0); crx.globalCompositeOperation = 'source-over'; crx.globalAlpha = 1; crx.clearRect(0, 0, cw, ch);
      crx.imageSmoothingEnabled = true;
      for (var pass = 0; pass < 2; pass++) {
        crx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
        for (i = 0; i < rows.length; i++) {
          var rw = rows[i], rk = rimOn * Math.exp(-Math.max(0, front - rw.z) / 7);
          if (pass && rk < 0.05) continue;
          // (a bob on the beat, a few centimetres, row by row a little out of step)
          var bob = 0.035 * bounce * (0.5 + 0.5 * Math.cos(2 * Math.PI * 2 * (t - 8) + rw.ph * 2.4)), yh = G + HREF + bob;
          var xa = -STW / 2 + rw.off;   // (where the strip starts, in x)
          if (!rowXf(-rw.half, rw.half, yh, rw.z, RX)) continue;
          if (RX.ay > bottom || RX.ay < -0.5 * CK * RX.d) continue;
          var sx0 = (-rw.half - xa) * k, sw = 2 * rw.half * k, src = pass ? CROWD[1][rw.s] : CROWD[0][rw.s], srcH = src.height;
          // strip px (u, v) -> screen: the row's left end at (ax, ay) is strip (sx0, 0.25 k)
          crx.setTransform(CS * RX.a, CS * RX.b, CS * RX.c, CS * RX.d, CS * (RX.ax - sx0 * RX.a - 0.25 * k * RX.c), CS * (RX.ay - sx0 * RX.b - 0.25 * k * RX.d));
          crx.globalAlpha = pass ? Math.min(1, 0.6 * rk) : 1;
          crx.drawImage(src, sx0, 0, sw, srcH, sx0, 0, sw, srcH);
          if (!pass) { var top = RX.ay - 0.25 * k * RX.d, bot = top + 1.3 * k * RX.d; if (top < y0) y0 = top; if (bot > y1) y1 = bot; }
        }
      }
      crx.setTransform(1, 0, 0, 1, 0, 0); crx.globalAlpha = 1; crx.globalCompositeOperation = 'source-over';
      if (y1 < y0) return;
      var by0 = Math.max(0, Math.floor(y0 * CS) - 1), by1 = Math.min(ch, Math.ceil(y1 * CS) + 1);
      if (by1 <= by0) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = on; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(crowdC, 0, by0, cw, by1 - by0, 0, by0 / CS, cw / CS, (by1 - by0) / CS);
      ctx.restore();
    }
    function box3(x0, y0, z0, x1, y1, z1, a, c) {
      seg3(x0, y0, z0, x1, y0, z0, a, c); seg3(x1, y0, z0, x1, y1, z0, a, c); seg3(x1, y1, z0, x0, y1, z0, a, c); seg3(x0, y1, z0, x0, y0, z0, a, c);
      seg3(x0, y0, z1, x1, y0, z1, a, c); seg3(x1, y0, z1, x1, y1, z1, a, c); seg3(x1, y1, z1, x0, y1, z1, a, c); seg3(x0, y1, z1, x0, y0, z1, a, c);
      seg3(x0, y0, z0, x0, y0, z1, a, c); seg3(x1, y0, z0, x1, y0, z1, a, c); seg3(x1, y1, z0, x1, y1, z1, a, c); seg3(x0, y1, z0, x0, y1, z1, a, c);
    }
    function deck(t, fade) {
      var k = seg(t, TL.deck[0], TL.deck[1]);
      if (k <= 0) return;
      var d = Wd.deck, tr = E.inOutCubic(seg(k, 0, 0.55)), up = E.outBack(seg(k, 0.45, 1));
      var P = [[-d.x, d.z0], [d.x, d.z0], [d.x, d.z1], [-d.x, d.z1], [-d.x, d.z0]], per = 0, i;
      var Ls = []; for (i = 0; i < 4; i++) { var l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); Ls.push(l); per += l; }
      var run = tr * per, yb = d.y0, yt = lerp(d.y0, d.y1, up), a = 0.55 * fade;
      for (i = 0; i < 4 && run > 0; i++) {
        var f = Math.min(1, run / Ls[i]); run -= Ls[i];
        var x2 = lerp(P[i][0], P[i + 1][0], f), z2 = lerp(P[i][1], P[i + 1][1], f);
        seg3(P[i][0], yb, P[i][1], x2, yb, z2, a * 1.2, t < 6.0 ? C_HOT : C_INK, 1);   // (hot while it is set out; ordinary chrome after, so it is capped when it moves)
        if (up > 0) seg3(P[i][0], yt, P[i][1], x2, yt, z2, a, C_INK);
      }
      if (up > 0) {
        for (i = 0; i <= 8; i++) { var x = -d.x + i * d.x / 4; seg3(x, yb, d.z0, x, yt, d.z0, a * 0.8, C_INK); }
        for (i = 1; i < 8; i++) { var xx = -d.x + i * d.x / 4; seg3(xx, yt, d.z0, xx, yt, d.z1, a * 0.35, C_INK); }
        seg3(-d.x, yb, d.z1, -d.x, yt, d.z1, a, C_INK); seg3(d.x, yb, d.z1, d.x, yt, d.z1, a, C_INK);
      }
    }
    function pa(t, fade) {
      Wd.pa.forEach(function (P) {
        var ang = 0, y = P.y, z = P.z, bw = 1.25, bh = 0.62, bd = 0.95;
        seg3(P.x - 0.9, P.y + 0.15, P.z, P.x + 0.9, P.y + 0.15, P.z, 0.5 * fade * seg(t, 7.15, 7.3), C_INK);
        for (var j = 0; j < 10; j++) {
          var k = E.outBack(seg(t, 7.2 + j * 0.045, 7.2 + j * 0.045 + 0.32));
          if (k <= 0) break;
          ang += (0.6 + j * j * 0.22) * DEG;
          var hy = bh * k, dy = Math.cos(ang) * hy, dz = -Math.sin(ang) * hy;
          var y2 = y - dy, z2 = z + dz, a = 0.6 * fade;
          var x0 = P.x - bw / 2, x1 = P.x + bw / 2, zb0 = z + Math.sin(ang) * 0 + bd * Math.cos(ang), yb0 = y + bd * Math.sin(ang);
          seg3(x0, y, z, x1, y, z, a, C_INK); seg3(x0, y2, z2, x1, y2, z2, a, C_INK);
          seg3(x0, y, z, x0, y2, z2, a, C_INK); seg3(x1, y, z, x1, y2, z2, a, C_INK);
          seg3(x0, y, z, x0, yb0, zb0, a * 0.5, C_INK); seg3(x1, y, z, x1, yb0, zb0, a * 0.5, C_INK);
          y = y2; z = z2;
        }
      });
    }
    function heads(t, fade) {
      Wd.heads.forEach(function (h, j) {
        var k = E.outBack(seg(t, 7.6 + j * 0.03125, 7.6 + j * 0.03125 + 0.25));
        if (k <= 0) return;
        var s = 0.32 * k, a = 0.65 * fade;
        box3(h[0] - s, h[1] - s * 1.6, h[2] - s, h[0] + s, h[1], h[2] + s, a, C_INK);
      });
    }

    /* ==========================================================================
       The show (7.2 - 13.95): the LED wall, the words on it, its light, the beams
       ========================================================================== */
    function wallOn(t) { return smooth(seg(t, 7.45, 7.95)) * (1 - seg(t, 13.85, 13.95)); }   // the wall's light
    function stageFade(t) { return 1 - smooth(seg(t, 13.75, 14.3)); }
    function showK(t) { return smooth(seg(t, 7.8, 8.6)) * (1 - smooth(seg(t, 12.3, 13.1))); }   // CAD gives way to light
    function climax(t) { return smooth(seg(t, 11.94, 12.08)) * (1 - 0.65 * smooth(seg(t, 12.15, 12.9))); }
    function setTrack(g, px) { try { g.letterSpacing = px.toFixed(2) + 'px'; } catch (e) { /* no tracking */ } }

    /* ---- The LED wall: a real wall. Its picture is drawn on a small canvas (2 px per LED), laid on a dot grid at the
       LED pitch with its cabinet seams (one a metre), and mapped onto its plane in strips. The wall's resolution
       follows its size on screen at the climax (an LED pitch of about 5 device px there); the grid fades out wherever
       the pitch on screen gets small, so it never beats into moire. ---- */
    var LED = { cols: 0, rows: 0, key: '' }, led = mk(), ledx = led.getContext('2d'), wordsC = mk(), wcx = wordsC.getContext('2d');
    var dots = mk(), LP = 4;   // LP: device-ish px per LED in the wall's texture (the picture is drawn at that size: crisp type)
    function ledSetup() {
      var L = Wd.led, wallW = L.x1 - L.x0, wallH = L.y1 - L.y0;
      var px = FOC * wallW / Math.max(10, SC.dClimax || 60);
      var cols = Math.round(clamp(px / (LITE ? 6 : 5), 64, LITE ? 180 : 300)), rows = Math.max(16, Math.round(cols * wallH / wallW));
      var key = cols + 'x' + rows;
      if (LED.key === key) return;
      LED.key = key; LED.cols = cols; LED.rows = rows;
      led.width = wordsC.width = dots.width = cols * LP; led.height = wordsC.height = dots.height = rows * LP;
      var d = dots.getContext('2d'), per = cols / wallW, k;   // LEDs per metre (the seams: a 2 m module, faint)
      d.clearRect(0, 0, dots.width, dots.height);
      d.fillStyle = 'rgba(0,0,0,0.5)';
      for (k = 0; k < cols; k++) d.fillRect(k * LP + LP - 1, 0, 1, rows * LP);
      for (k = 0; k < rows; k++) d.fillRect(0, k * LP + LP - 1, cols * LP, 1);
      d.fillStyle = 'rgba(0,0,0,0.3)';
      for (k = 2; k < wallW; k += 2) d.fillRect(Math.round(k * per) * LP - 1, 0, 1, rows * LP);
      for (k = 2; k < wallH; k += 2) d.fillRect(0, Math.round(k * per) * LP - 1, cols * LP, 1);
      TK = null;
    }

    /* ---- The words on the wall: a line, a column and a climax, on the 120 BPM grid ----
       The event types are set in Bricolage Grotesque ExtraBold with tight tracking, each after a small square (a cue
       light). Every word arrives on its beat and lights there, letter by letter from the left (a light running along
       it), its square turning lime: GO; it dims just before the next move. Dim type is white at a level (DIM) whose
       step over the wall's face stays just under 0.1 in relative luminance, so moving type never flickers a pixel; lit
       type never moves (WCAG 2.3.1).
       Bar 5 (8.0-9.5), the line: the first four are set as one line at one size; a camera on it whips from word to word
       (inOutQuint, WH, landing on the beat), so the words travel across the wall, blurred along the line only. While a
       word holds, its neighbours sit dim at the wall's edges: the line is there, and it creeps (never dead).
       Bar 6 (10.0-11.0), the column: on the bar line, where the beams cross, the move changes. The line rolls up and
       the next words come up a column, one a beat, each larger than the last; a roll runs across the wall from the
       left (STG), so it ripples, and the light follows it (a foretaste of the climax's letters). The word above stays
       dim at the wall's top edge, the next one waits at its bottom edge.
       11.5: the camera flies through "Sports" (zoom-blurred, dim). "Live / events" rises, stacked, the largest type of
       the piece, tracking in; 12.0: it lights. */
    var TK = null;
    var TK0 = 8.0, TKB = 0.5, WH = 0.17, STG = 0.05, TKX = 11.5, SHUT = 1 / 30, EV1 = 4, DIM = 0.24, CAPS = [0.3, 0.33, 0.36];
    function tkBeat(k) { return TK0 + k * TKB; }
    function tkMove(k) { return k === 0 ? TK0 - 0.36 : tkBeat(k) - WH - (k >= EV1 ? STG : 0); }   // the move to word k starts
    function tkOff(k) { return k < EVENTS.length - 1 ? tkMove(k + 1) + 0.005 : TKX + 0.005; }       // word k is dark again
    function tkFont(fs) { return '800 ' + fs + 'px ' + DISPLAY; }
    function tkLayout() {
      var CW = wordsC.width, CH = wordsC.height, fs = Math.max(8, Math.round(CH * 0.62)), g = wcx, i, j, tr = -0.022 * fs;
      g.font = tkFont(fs); setTrack(g, tr);
      var cap = g.measureText('H').actualBoundingBoxAscent || fs * 0.7;
      var bs = cap * 0.34, bg = cap * 0.42, gap = fs * 0.6, x = 0, items = [], sLine = 1e9;
      for (i = 0; i < EVENTS.length; i++) {
        var word = EVENTS[i], w = g.measureText(word).width, iw = bs + bg + w, lx = [0];
        for (j = 1; j <= word.length; j++) lx.push(g.measureText(word.slice(0, j)).width);
        items.push({ x: x, w: iw, tw: w, c: null, word: word, lx: lx, s: i < EV1 ? 1 : Math.min(0.78 * CW / iw, CAPS[i - EV1] * CH / cap) });   // (its picture: tkWord)
        if (i < EV1) { sLine = Math.min(sLine, 0.74 * CW / iw); x += iw + gap; }
      }
      sLine = Math.min(sLine, 0.3 * CH / cap);
      for (i = 0; i < EV1; i++) items[i].s = sLine;
      // the column: row 0 is the line, row r the word EV1 + r - 1; centres half their caps and a fifth of the wall apart
      var rowY = [0], rowCap = [cap * sLine];
      for (i = EV1; i < items.length; i++) { var cr = cap * items[i].s; rowY.push(rowY[rowY.length - 1] + 0.5 * (rowCap[rowCap.length - 1] + cr) + 0.2 * CH); rowCap.push(cr); }
      // the climax: "Live" / "events", stacked: each line's cap height 37% of the wall; the block (from the top of
      // "Live", its i's dot included, to the baseline of "events") 89% of it, centred, so the margins are equal
      g.font = tkFont(fs); setTrack(g, 0);
      var lines = LAST_WORD.map(function (s) {
        var ad = [], tot = 0;
        for (var q = 0; q < s.length; q++) { var aw = g.measureText(s[q]).width; ad.push(aw); tot += aw; }
        return { s: s, ad: ad, w: tot + (s.length - 1) * tr };
      });
      var asc = g.measureText(LAST_WORD[0]).actualBoundingBoxAscent || cap, dsc = Math.max(0, g.measureText(LAST_WORD[1]).actualBoundingBoxDescent || 0);
      var mw = Math.max(lines[0].w, lines[1].w), kL = Math.min(0.37 * CH / cap, 0.8 * CW / (mw + bs + bg));
      var lh = Math.max(cap * kL * 1.2, 0.89 * CH - (asc + dsc) * kL), base1 = (CH - ((asc + dsc) * kL + lh)) / 2 + asc * kL;
      TK = { fs: fs, cap: cap, bs: bs, bg: bg, tr: tr, items: items, CW: CW, CH: CH, sLine: sLine, rowY: rowY, rowCap: rowCap,
        lines: lines, kL: kL, lh: lh, base1: base1, mw: mw };
    }
    // a word set once, white on transparent (made when first needed, or ahead of time in prepare(), one per idle step)
    function tkWord(it) {
      if (it.c) return it.c;
      var fs = TK.fs, c = mk(Math.ceil(it.tw + fs * 0.3), Math.ceil(fs * 1.3)), cg = c.getContext('2d');
      cg.font = tkFont(fs); setTrack(cg, TK.tr); cg.textBaseline = 'alphabetic'; cg.fillStyle = '#fffbf2';
      cg.fillText(it.word, fs * 0.08, fs);
      return (it.c = c);
    }
    // how lit letter j of word k is: the light runs along it from the left from just before its beat (the move has
    // all but landed: under a pixel to go), about 16 ms a letter (faster on long words: it is done by +0.15 s); it
    // goes as the next move starts
    function tkLit(k, j, t) {
      var it = TK.items[k], b = tkBeat(k), n = it.word.length, Tc = Math.min(0.15, 0.016 * (n - 1)), d = Tc * (it.lx[j] + it.lx[j + 1]) / 2 / Math.max(1, it.tw);
      var off = tkOff(k);
      return smooth(seg(t, b - 0.02 + d, b + 0.03 + d)) * (1 - smooth(seg(t, off - 0.04, off)));
    }
    var LIT = [], DY = [];
    // word k into the words canvas: its square's left at x0, its baseline at base, scale s, alpha mul; lit: false for
    // a dim neighbour; dy: per-letter vertical offsets (null: none)
    function drawWord(g, k, x0, base, s, mul, lit, t, dy) {
      var it = TK.items[k], c = tkWord(it), fs = TK.fs, tx = x0 + (TK.bs + TK.bg) * s - fs * 0.08 * s, ty = base - fs * s, n = it.word.length, j, any = false, all = true;
      for (j = 0; j < n; j++) { LIT[j] = lit ? tkLit(k, j, t) : 0; if (LIT[j] > 0.002) any = true; if (LIT[j] < 0.998) all = false; }
      var b = tkBeat(k), off = tkOff(k), sq = lit ? clamp(E.outBack(seg(t, b - 0.02, b + 0.08)), 0, 1) * (1 - smooth(seg(t, off - 0.04, off))) : 0, bsz = TK.bs * s;
      g.globalAlpha = 1;
      g.fillStyle = rgba(mix(INK, LIME, sq), mul * (DIM + (0.95 - DIM) * sq));
      g.fillRect(x0, base - TK.cap * s + (dy ? dy[0] : 0), bsz, bsz);   // (its top on the cap line)
      if (!dy) {
        if (all) { g.globalAlpha = Math.min(1, mul); g.drawImage(c, tx, ty, c.width * s, c.height * s); g.globalAlpha = 1; return; }
        g.globalAlpha = Math.min(1, DIM * mul); g.drawImage(c, tx, ty, c.width * s, c.height * s);
        if (!any) { g.globalAlpha = 1; return; }
      }
      for (j = 0; j < n; j++) {
        var lv = dy ? DIM + (1 - DIM) * LIT[j] : (1 - DIM) * LIT[j];
        if (!dy && LIT[j] <= 0.002) continue;
        var sx = fs * 0.08 + it.lx[j], k2 = j;
        // (a run of letters at the same level in one draw, when they do not move apart)
        if (!dy && LIT[j] >= 0.998) while (k2 + 1 < n && LIT[k2 + 1] >= 0.998) k2++;
        var sw = it.lx[k2 + 1] - it.lx[j];
        if (j === 0) { sx -= fs * 0.08; sw += fs * 0.08; }   // (the first letter's side bearing)
        if (k2 === n - 1) sw = c.width - sx;                  // (and the last letter's)
        g.globalAlpha = Math.min(1, lv * mul);
        g.drawImage(c, sx, 0, sw, c.height, tx + sx * s, ty + (dy ? dy[j] : 0), sw * s, c.height * s);
        j = k2;
      }
      g.globalAlpha = 1;
    }
    // the line's camera: its centre (in line units) at t
    function tkCX(t) {
      var items = TK.items, s = TK.sLine, i = 0;
      while (i < EV1 - 1 && t >= tkMove(i + 1)) i++;
      function rest(k, u) { var q = items[k]; return q.x + q.w / 2 + 0.006 * TK.CW / s * u; }   // (it creeps while it holds)
      var m0 = tkMove(i), b = tkBeat(i), hold = i < EV1 - 1 ? tkMove(i + 1) : tkMove(EV1);
      if (t < b) {
        var e = E.inOutQuint(seg(t, m0, b)), from = i === 0 ? items[0].x - TK.CW / (2 * s) - 0.04 * TK.CW / s : rest(i - 1, 1);
        return lerp(from, rest(i, 0), e);
      }
      return rest(i, seg(t, b, hold));
    }
    // the column's camera: how far up it has rolled (texture px) at t, for type at x (the roll runs from the left)
    function tkCY(t, x) {
      var y = 0, rows = TK.rowY;
      for (var k = EV1; k < TK.items.length; k++) {
        var r = k - EV1 + 1, m0 = tkMove(k) + STG * clamp(x / TK.CW, 0, 1);
        if (t <= m0) break;
        y = lerp(rows[r - 1], rows[r], E.inOutQuint(seg(t, m0, m0 + WH)));
      }
      return y;
    }
    // the type layer at one moment ts (a shutter sample), alpha mul; the light follows the frame's own t (lit type
    // does not move, so it needs no blur)
    function tkScene(g, ts, t, mul) {
      var items = TK.items, CW = TK.CW, CH = TK.CH, s0 = TK.sLine, cx = tkCX(ts), rolling = ts > tkMove(EV1) && ts < tkBeat(items.length - 1) + 0.01;
      var cyC = tkCY(ts, CW / 2), k, j;
      // row 0: the line
      var base0 = CH * 0.5 + TK.rowCap[0] * 0.5 - cyC;
      if (base0 > 0) {
        for (k = 0; k < EV1; k++) {
          var it = items[k], x0 = CW / 2 + (it.x - cx) * s0;
          if (x0 > CW || x0 + it.w * s0 < 0) continue;
          var lit = t >= tkBeat(k) - 0.03 && t < tkOff(k) + 0.01;
          if (rolling) {
            var tx = x0 + (TK.bs + TK.bg) * s0;
            for (j = 0; j < it.word.length; j++) DY[j] = cyC - tkCY(ts, tx + it.lx[j] * s0);
            drawWord(g, k, x0, base0, s0, mul, lit, t, DY);
          } else drawWord(g, k, x0, base0, s0, mul, lit, t, null);
        }
      }
      // rows 1...: the column
      for (k = EV1; k < items.length; k++) {
        var r = k - EV1 + 1, w = items[k], s = w.s, base = CH * 0.5 + TK.rowCap[r] * 0.5 + TK.rowY[r] - cyC;
        var vis = smooth(seg(ts, tkMove(k) - 0.3, tkMove(k) - 0.15));   // (the next word waits at the bottom edge from the hold before its move)
        if (base - TK.rowCap[r] > CH || base < 0 || vis <= 0) continue;
        var xw = (CW - w.w * s) / 2, lt = t >= tkBeat(k) - 0.03 && t < tkOff(k) + 0.01, txw = xw + (TK.bs + TK.bg) * s;
        if (rolling) { for (j = 0; j < w.word.length; j++) DY[j] = cyC - tkCY(ts, txw + w.lx[j] * s); drawWord(g, k, xw, base, s, mul * vis, lt, t, DY); }
        else drawWord(g, k, xw, base, s, mul * vis, lt, t, null);
      }
    }
    function tkWords(t, g) {
      var on = seg(t, TK0 - 0.4, TK0 - 0.18), fo = 1 - smooth(seg(t, TKX + 0.06, TKX + 0.22));
      if (on <= 0 || fo <= 0) return;
      var CW = TK.CW, CH = TK.CH, K;
      g.globalCompositeOperation = 'lighter';
      if (t > TKX) {
        // the camera flies through the last word: everything zooms about the wall's centre, dim and blurred, and is gone
        for (var z = 0; z < 6; z++) {
          var Z = Math.exp(E.inCubic(seg(t - SHUT * z / 5, TKX, TKX + 0.22)) * 2.2);
          g.setTransform(Z, 0, 0, Z, CW / 2 * (1 - Z), CH / 2 * (1 - Z));
          tkScene(g, TKX, t, fo / 6);
        }
        g.setTransform(1, 0, 0, 1, 0, 0);
        return;
      }
      // the shutter: how far the type moves in 1/30 s (along the line, or up the column)
      var mvx = Math.abs(tkCX(t) - tkCX(t - SHUT)) * TK.sLine, mvy = Math.abs(tkCY(t, CW / 2) - tkCY(t - SHUT, CW / 2));
      K = Math.max(1, Math.min(10, Math.round(Math.max(mvx, mvy) / 3) + 1));
      for (var j = 0; j < K; j++) tkScene(g, K > 1 ? t - SHUT * j / (K - 1) : t, t, on / K);
    }
    // "Live / events": each letter rises out of a slot under its line (outExpo, a 16 ms stagger), the tracking draws
    // in; settled by 11.95, it lights on 12.0 (the cascade runs across both lines), its lime cue light pops: GO
    function tkClimax(t, g) {
      var t0 = 11.6;
      if (t < t0) return;
      var CW = TK.CW, k = TK.kL, fs = TK.fs * k, cap = TK.cap * k, bs = TK.bs * k, bgap = TK.bg * k;
      var x0 = (CW - (TK.mw * k + bs + bgap)) / 2 + bs + bgap, li = 0;
      g.globalCompositeOperation = 'lighter'; g.font = tkFont(Math.max(4, fs)); g.textBaseline = 'alphabetic'; setTrack(g, 0);
      for (var l = 0; l < 2; l++) {
        var ln = TK.lines[l], base = TK.base1 + l * TK.lh, st = t0 + l * 0.07, K = t < st + 0.016 * ln.s.length + 0.3 ? 3 : 1;
        g.save(); g.beginPath(); g.rect(0, base - cap * 1.3, CW, cap * 1.3 + fs * 0.14); g.clip();
        for (var smp = 0; smp < K; smp++) {
          var ts = K > 1 ? t - SHUT * smp / (K - 1) : t, x = x0;
          for (var j = 0; j < ln.s.length; j++) {
            var q = E.outExpo(seg(ts, st + j * 0.016, st + j * 0.016 + 0.36));
            var trk = lerp(0.16, -0.022, q) * fs, dy = (1 - q) * cap * 1.32;
            var lit = smooth(seg(t, 12.0 + (li + j) * 0.018, 12.06 + (li + j) * 0.018));
            if (q > 0) { g.fillStyle = rgba(HOT, (DIM + (1 - DIM) * lit) * Math.min(1, q * 4) / K); g.fillText(ln.s[j], x, base + dy); }
            x += ln.ad[j] * k + trk;
          }
        }
        li += ln.s.length;
        g.restore();
      }
      // the cue light, lime: GO (its top on the cap line of "Live")
      var p = E.outBack(seg(t, 11.98, 12.12));
      if (p > 0) { var sz = bs * p; g.fillStyle = rgba(LIME, 0.95); g.fillRect(x0 - bgap - bs / 2 - sz / 2, TK.base1 - cap + (bs - sz) / 2, sz, sz); }
    }

    /* ---- The wall's picture: its field (an emissive navy with a slow light moving in it), the words, power up/down ---- */
    var VW = {}, PULL_W = 0.2, WL = 1;   // (WL: the words' level; in the pull-back, at speed, PULL_W: lit type sliding in towards the vanishing point then stays under a 0.1 luminance step)
    function ledContent(t) {
      if (!TK) tkLayout();
      var g = ledx, CW = led.width, CH = led.height;
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      var fg = g.createLinearGradient(0, 0, 0, CH);
      fg.addColorStop(0, 'rgb(13,17,36)'); fg.addColorStop(0.6, 'rgb(7,9,20)'); fg.addColorStop(1, 'rgb(4,5,11)');
      g.fillStyle = fg; g.fillRect(0, 0, CW, CH);
      // a broad soft light drifting in the picture (one slow pass per two bars), and the climax's breath
      var ph = (t - 8) * Math.PI / 2, lxp = CW * (0.5 + 0.32 * Math.sin(ph)), cl = climax(t);
      var rg = g.createRadialGradient(lxp, CH * 0.3, 0, lxp, CH * 0.3, CW * 0.55);
      rg.addColorStop(0, 'rgba(64,84,160,' + fmt(0.2 + 0.22 * cl) + ')'); rg.addColorStop(1, 'rgba(64,84,160,0)');
      g.fillStyle = rg; g.fillRect(0, 0, CW, CH);
      if (cl > 0) {
        var cg = g.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, CW * 0.45);
        cg.addColorStop(0, 'rgba(150,170,235,' + fmt(0.16 * cl) + ')'); cg.addColorStop(1, 'rgba(150,170,235,0)');
        g.fillStyle = cg; g.fillRect(0, 0, CW, CH);
      }
      // 12.0: one broad soft band of light sweeps the wall behind "Live events", left to right in 0.45 s (the LED grid
      // shows in it); a single pass, so a pixel brightens once and settles
      var sw = DBG.noSweep ? 0 : seg(t, 12.0, 12.45);
      if (sw > 0 && sw < 1) {
        var bx = lerp(-0.45 * CW, 1.45 * CW, E.inOutCubic(sw)), bw2 = CW * 0.42, sa = Math.sin(Math.PI * Math.min(1, sw * 1.15));
        var sg = g.createLinearGradient(bx - bw2, 0, bx + bw2, CH * 0.3);
        sg.addColorStop(0, 'rgba(126,150,232,0)'); sg.addColorStop(0.5, 'rgba(132,156,238,' + fmt(0.2 * sa) + ')'); sg.addColorStop(1, 'rgba(126,150,232,0)');
        g.fillStyle = sg; g.fillRect(0, 0, CW, CH);
      }
      // the words (their own layer, so the wall's edges can feather them)
      wcx.setTransform(1, 0, 0, 1, 0, 0); wcx.globalCompositeOperation = 'source-over'; wcx.globalAlpha = 1; wcx.clearRect(0, 0, CW, CH);
      if (t > TK0 - 0.4 && !DBG.noType) { tkWords(t, wcx); tkClimax(t, wcx); }
      wcx.globalCompositeOperation = 'destination-out';
      var ew = CW * 0.045, eg = wcx.createLinearGradient(0, 0, ew, 0);
      eg.addColorStop(0, 'rgba(0,0,0,1)'); eg.addColorStop(1, 'rgba(0,0,0,0)'); wcx.fillStyle = eg; wcx.fillRect(0, 0, ew, CH);
      eg = wcx.createLinearGradient(CW - ew, 0, CW, 0); eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,1)');
      wcx.fillStyle = eg; wcx.fillRect(CW - ew, 0, ew, CH);
      if (t > 9.4 && t < 11.75) {   // (the column: the words above and below fade into the wall's top and bottom edges)
        var eh = CH * 0.1; wcx.globalAlpha = 1 - smooth(seg(t, 11.6, 11.75));
        eg = wcx.createLinearGradient(0, 0, 0, eh); eg.addColorStop(0, 'rgba(0,0,0,1)'); eg.addColorStop(1, 'rgba(0,0,0,0)'); wcx.fillStyle = eg; wcx.fillRect(0, 0, CW, eh);
        eg = wcx.createLinearGradient(0, CH - eh, 0, CH); eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,1)'); wcx.fillStyle = eg; wcx.fillRect(0, CH - eh, CW, eh);
        wcx.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = WL; g.drawImage(wordsC, 0, 0); g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      // power up: the cabinets wake in columns from the centre out on the 32nds (7.45-7.8), each fading up
      if (t < 7.85) {
        var nc = 34, cw = CW / nc;
        g.fillStyle = '#000';
        for (var c = 0; c < nc; c++) {
          var dd = Math.abs(c + 0.5 - nc / 2) / (nc / 2), on = smooth(seg(t, 7.45 + Math.round(dd * 10) * 0.03125, 7.45 + Math.round(dd * 10) * 0.03125 + 0.12));
          if (on >= 1) continue;
          g.globalAlpha = 1 - on; g.fillRect(Math.floor(c * cw), 0, Math.ceil(cw) + 1, CH);
        }
        g.globalAlpha = 1;
      }
      // power down: the picture folds to a line (13.55-13.85)
      var off = seg(t, 13.55, 13.85);
      if (off > 0) {
        var hh = Math.max(1, CH * (1 - E.inCubic(off)));
        g.globalCompositeOperation = 'copy';
        g.drawImage(led, 0, 0, CW, CH, 0, (CH - hh) / 2, CW, hh);
        g.globalCompositeOperation = 'source-over';
      }
    }
    function ledDraw(t) {
      if (t < 7.45 || t > 13.95) return;
      var fade = (1 - seg(t, 13.85, 13.95)) * LA;
      if (fade <= 0) return;
      var L = Wd.led, NS = 12, cols = led.width, rows = led.height;
      // the LED pitch on screen now: the grid shows only where it is at least ~3 device px
      var ym = (L.y0 + L.y1) / 2, pitch = 0;
      if (proj(L.x0, ym, L.z)) { var ax = PJ.x, ay = PJ.y; if (proj(L.x1, ym, L.z)) pitch = Math.hypot(PJ.x - ax, PJ.y - ay) / LED.cols; }
      if (pitch <= 0) return;
      // the pull-back: the wall shrinks down the truss crisp (drawn once: no ghosting); its field keeps its glow (the
      // light at the end of the tunnel) and only its type comes down as it speeds away
      WL = 1;
      if (t > SC.t1) WL = lerp(1, PULL_W, smooth(seg(t, SC.t1, SC.t1 + 0.32)));   // (down as the camera sets off, before the type moves much)
      ledContent(t);
      // (the LED grid goes as the wall recedes: a fine dot pattern sliding under lit strokes would shimmer)
      var pull = t > SC.t1 ? smooth(seg(t, SC.t1, SC.t1 + 0.25)) : 0, gridA = 0.85 * smooth(seg(pitch, 2.4, 4.2)) * (1 - pull);
      if (gridA > 0.01 && !DBG.noGrid) { ledx.globalCompositeOperation = 'destination-out'; ledx.globalAlpha = gridA; ledx.drawImage(dots, 0, 0); ledx.globalAlpha = 1; }
      ledx.globalCompositeOperation = 'source-over';
      var a = 0.92 * fade, K = 1;
      if (t <= SC.t1 && MB && proj(0, ym, L.z)) {
        // motion blur: when the wall moves on screen it is drawn at K moments of the 1/30 s shutter, its corners carried
        // from where the camera saw them then to now, and averaged (lit type smears as a camera would see it)
        var cx0 = PJ.x, cy0 = PJ.y; if (projQ(0, ym, L.z)) K = Math.max(1, Math.min(3, Math.round(Math.hypot(cx0 - QJ.x, cy0 - QJ.y) / 3) + 1));
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      gx.save(); gx.globalCompositeOperation = 'lighter';
      var sw = cols / NS;
      for (var s = 0; s < NS; s++) {
        var x0 = lerp(L.x0, L.x1, s / NS), x1 = lerp(L.x0, L.x1, (s + 1) / NS);
        if (!proj(x0, L.y1, L.z)) continue; var p0x = PJ.x, p0y = PJ.y;
        if (!proj(x1, L.y1, L.z)) continue; var p1x = PJ.x, p1y = PJ.y;
        if (!proj(x0, L.y0, L.z)) continue; var p2x = PJ.x, p2y = PJ.y;
        var sx = s * sw, fa = a * fogA(PJ.z) / K, sww = Math.min(sw + 0.5, cols - sx);   // (a half-pixel overlap hides the seams between strips)
        var q0x = p0x, q0y = p0y, q1x = p1x, q1y = p1y, q2x = p2x, q2y = p2y;
        if (K > 1 && projQ(x0, L.y1, L.z)) { q0x = QJ.x; q0y = QJ.y; if (projQ(x1, L.y1, L.z)) { q1x = QJ.x; q1y = QJ.y; } if (projQ(x0, L.y0, L.z)) { q2x = QJ.x; q2y = QJ.y; } }
        for (var k = 0; k < K; k++) {
          var f = K > 1 ? k / (K - 1) : 1;
          var a0x = lerp(q0x, p0x, f), a0y = lerp(q0y, p0y, f), a1x = lerp(q1x, p1x, f), a1y = lerp(q1y, p1y, f), a2x = lerp(q2x, p2x, f), a2y = lerp(q2y, p2y, f);
          ctx.globalAlpha = fa;
          ctx.setTransform((a1x - a0x) / sw, (a1y - a0y) / sw, (a2x - a0x) / rows, (a2y - a0y) / rows, a0x, a0y);
          ctx.drawImage(led, sx, 0, sww, rows, 0, 0, sww, rows);
          if (k === K - 1) {
            // its glow, in the bloom (not from its lowest fifth: the bottom edge and the lower line of type stay crisp)
            gx.globalAlpha = fa * K * 0.34;
            gx.setTransform(GS * (a1x - a0x) / sw, GS * (a1y - a0y) / sw, GS * (a2x - a0x) / rows, GS * (a2y - a0y) / rows, GS * a0x, GS * a0y);
            gx.drawImage(led, sx, 0, sww, rows * 0.8, 0, 0, sww, rows * 0.8);
          }
        }
      }
      ctx.restore(); gx.restore();
      // a halo in the haze round the wall's edges: its outline filled flat in the glow buffer, which the bloom spreads
      // past every edge (the wall reads as a light source, not a picture)
      if (proj(L.x0, L.y1, L.z)) {
        var h0x = PJ.x, h0y = PJ.y, hok = proj(L.x1, L.y1, L.z), h1x = PJ.x, h1y = PJ.y;
        hok = hok && proj(L.x1, L.y0, L.z); var h2x = PJ.x, h2y = PJ.y;
        hok = hok && proj(L.x0, L.y0, L.z);
        if (hok) {
          gx.save(); gx.setTransform(GS, 0, 0, GS, 0, 0); gx.globalCompositeOperation = 'lighter';
          gx.fillStyle = rgba([104, 128, 225], 0.16 * a * wallOn(t) * (1 + 0.6 * climax(t)) * (1 - smooth(seg(t, 13.5, 13.75))));
          gx.beginPath(); gx.moveTo(h0x, h0y); gx.lineTo(h1x, h1y); gx.lineTo(h2x, h2y); gx.lineTo(PJ.x, PJ.y); gx.closePath(); gx.fill();
          gx.restore();
        }
      }
    }
    // the wall is solid: its dark face hides the ridge, the sky and the far floor behind it
    function quad(P) {   // project four world points; false if any is behind the camera
      var out = [];
      for (var i = 0; i < 4; i++) { if (!proj(P[i][0], P[i][1], P[i][2])) return null; out.push(PJ.x, PJ.y); }
      return out;
    }
    function fillQ(q) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.lineTo(q[4], q[5]); ctx.lineTo(q[6], q[7]); ctx.closePath(); ctx.fill(); }
    function wallPanel(t) {
      var a = smooth(seg(t, 7.2, 7.6)) * stageFade(t) * LA;
      if (a <= 0.01) return;
      var L = Wd.led, q = quad([[L.x0, L.y1, L.z], [L.x1, L.y1, L.z], [L.x1, L.y0, L.z], [L.x0, L.y0, L.z]]);
      if (!q) return;
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.fillStyle = 'rgb(7,8,13)'; fillQ(q); ctx.restore();
    }
    // the wall's light on the deck, the ground in front and the haze round it
    function spill(t) {
      var on = wallOn(t) * stageFade(t) * LA;
      if (on <= 0.01) return;
      // (on the 12.0 downbeat the wall's light swells across the deck, the field and the haze, then settles)
      var lvl = on * (0.9 + 1.25 * climax(t)), L = Wd.led, d = Wd.deck, q, gr;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // the deck's floor: brightest at the wall's foot
      q = quad([[-d.x, d.y1, L.z - 0.1], [d.x, d.y1, L.z - 0.1], [d.x, d.y1, d.z0], [-d.x, d.y1, d.z0]]);
      if (q) {
        gr = ctx.createLinearGradient((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, (q[4] + q[6]) / 2, (q[5] + q[7]) / 2);
        gr.addColorStop(0, rgba([120, 140, 215], 0.30 * lvl)); gr.addColorStop(0.45, rgba([120, 140, 215], 0.09 * lvl)); gr.addColorStop(1, rgba([120, 140, 215], 0.02 * lvl));
        ctx.fillStyle = gr; fillQ(q);
      }
      // the deck's front face, washed from above (the audience's heads stand against it: their silhouettes)
      q = quad([[-d.x, d.y1, d.z0], [d.x, d.y1, d.z0], [d.x, d.y0, d.z0], [-d.x, d.y0, d.z0]]);
      if (q) {
        gr = ctx.createLinearGradient(0, (q[1] + q[3]) / 2, 0, (q[5] + q[7]) / 2);
        gr.addColorStop(0, rgba([128, 148, 222], 0.2 * lvl)); gr.addColorStop(0.5, rgba([128, 148, 222], 0.08 * lvl)); gr.addColorStop(1, rgba([128, 148, 222], 0.02 * lvl));
        ctx.fillStyle = gr; fillQ(q);
      }
      // the ground in front of the stage
      q = quad([[-34, GROUND, d.z0], [34, GROUND, d.z0], [52, GROUND, d.z0 - 46], [-52, GROUND, d.z0 - 46]]);
      if (q) {
        gr = ctx.createLinearGradient((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, (q[4] + q[6]) / 2, (q[5] + q[7]) / 2);
        gr.addColorStop(0, rgba([110, 128, 200], 0.15 * lvl)); gr.addColorStop(0.35, rgba([110, 128, 200], 0.05 * lvl)); gr.addColorStop(1, rgba([110, 128, 200], 0));
        ctx.fillStyle = gr; fillQ(q);
      }
      // haze: the wall's light scattered round it, and a low band of it at the stage's foot
      if (proj(0, (L.y0 + L.y1) / 2, L.z)) {
        var cx = PJ.x, cy = PJ.y, r = FOC * (L.x1 - L.x0) * 0.8 / PJ.z;
        ctx.setTransform(1, 0, 0, 0.62, 0, cy * 0.38);
        gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, rgba([96, 116, 190], 0.11 * lvl)); gr.addColorStop(0.5, rgba([96, 116, 190], 0.04 * lvl)); gr.addColorStop(1, 'rgba(96,116,190,0)');
        ctx.fillStyle = gr; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.restore();
    }
    function ledFrame(t, fade) {
      var k = seg(t, 7.2, 7.6);
      if (k <= 0) return;
      var L = Wd.led, a = 0.45 * fade * k, x, face = 1 - wallOn(t);
      seg3(L.x0, L.y0, L.z, L.x1, L.y0, L.z, a, C_INK); seg3(L.x0, L.y1, L.z, L.x1, L.y1, L.z, a, C_INK);
      seg3(L.x0, L.y0, L.z, L.x0, L.y1, L.z, a, C_INK); seg3(L.x1, L.y0, L.z, L.x1, L.y1, L.z, a, C_INK);
      if (face > 0.01) for (x = 1; x < 12; x++) { var xx = lerp(L.x0, L.x1, x / 12); seg3(xx, L.y0, L.z, xx, lerp(L.y0, L.y1, E.outCubic(seg(k, x / 24, 0.5 + x / 24))), L.z, a * 0.35 * face, C_INK); }
    }

    /* ---- Beams: ten moving heads on the front truss, in haze ----
       Each is a narrow cone (a hot core and a soft halo, falling off along its length) drawn into a half-size buffer,
       which is then multiplied by a slow drifting haze (soft noise made once), so the light has texture and air; it
       goes onto the frame and into the bloom. The choreography is on the bar: 8.0 the columns open into a fan, it sways
       in a rolling wave; 9.75-10.35 it folds into a cross; a wave rolls through it; 11.0 it opens back out; 11.55 it
       draws in to a crown over the stage; 12.0 ten straight columns, a little brighter: the climax. */
    var beamC = mk(), bcx = beamC.getContext('2d'), hazeC = null;
    function hazeSetup() {
      var w = 160, h = 96, c = mk(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), R = rng(73), oct = [[5, 0.5], [11, 0.3], [23, 0.2]], grids = [];
      oct.forEach(function (o) { var n = o[0], gw = n + 1, gh = Math.ceil(n * h / w) + 1, a = new Float32Array(gw * gh); for (var i = 0; i < a.length; i++) a[i] = R(); grids.push({ n: n, gw: gw, gh: gh, a: a, wt: o[1] }); });
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var v = 0;
        for (var k = 0; k < grids.length; k++) {
          var G = grids[k], fx = x / w * G.n, fy = y / w * G.n, ix = Math.floor(fx), iy = Math.floor(fy), ux = smooth(fx - ix), uy = smooth(fy - iy);
          var a00 = G.a[iy * G.gw + ix], a10 = G.a[iy * G.gw + ix + 1], a01 = G.a[(iy + 1) * G.gw + ix], a11 = G.a[(iy + 1) * G.gw + ix + 1];
          v += G.wt * lerp(lerp(a00, a10, ux), lerp(a01, a11, ux), uy);
        }
        var o = (y * w + x) * 4;
        im.data[o] = im.data[o + 1] = im.data[o + 2] = 255; im.data[o + 3] = Math.round(255 * (0.38 + 0.62 * Math.pow(clamp((v - 0.2) / 0.6, 0, 1), 1.25)));
      }
      g.putImageData(im, 0, 0);
      hazeC = c;
    }
    function beamOn(t) { return smooth(seg(t, 7.96, 8.16)) * (1 - smooth(seg(t, 12.32, 12.75))); }
    var AIMB = {};
    function beamAim(i, n, t, o) {
      var u = (i - (n - 1) / 2) / ((n - 1) / 2), tt = t - 8;
      var open = E.outExpo(seg(t, 8.0, 8.6)), x = E.inOutCubic(seg(t, 9.75, 10.35)), back = E.inOutCubic(seg(t, 11.0, 11.5));
      var pinch = E.inOutCubic(seg(t, 11.55, 11.95)), col = E.outExpo(seg(t, 11.97, 12.22));
      var spread = lerp(lerp(lerp(64, -46, x), 56, back), -15, pinch);
      var sway = 13 * Math.sin(Math.PI * tt - u * 1.1) * (1 - x + back * x) * (1 - pinch);
      var wave = smooth(seg(t, 10.35, 10.6)) * (1 - smooth(seg(t, 11.1, 11.4)));
      var tilt = lerp(150, 160, pinch) + 15 * wave * Math.sin(2 * Math.PI * (t - 10.35) - i * 0.62);
      o.pan = (u * spread + sway) * open * (1 - col);
      o.tilt = lerp(lerp(176, tilt, open), 177.5, col);
      // the climax pose. Tall frames: ten straight columns (the whole tall sky is theirs). Wide frames: the lighting truss
      // sits high there and columns would leave the frame at once, into the header's dark band; so the crown explodes
      // into the widest sunburst of the piece, symmetrical, raked a little towards the audience: the centre beams stand
      // up, the outer ones lie down across the middle of the sky (long diagonals), and it keeps opening as it breathes
      if (!PORTRAIT && col > 0) {
        var th = Math.pow(Math.abs(u), 0.7) * lerp(100, 110, smooth(seg(t, 12.05, 12.4)));   // (the outer pair lie below the horizontal: raked over the audience, across the middle of the frame)
        o.pan = lerp(o.pan, (u < 0 ? -1 : 1) * 64, col);
        o.tilt = lerp(o.tilt, 180 - th, col);
      }
      return o;
    }
    function beams(t) {
      var on = beamOn(t) * stageFade(t);
      if (on <= 0) return;
      if (!hazeC) hazeSetup();
      var BS = (LITE ? 0.4 : 0.5) / Math.max(1, dpr * 0.75), bw = Math.max(1, Math.ceil(W * BS)), bh = Math.max(1, Math.ceil(H * BS));   // (soft light: a buffer about half the CSS size)
      if (beamC.width !== bw || beamC.height !== bh) { beamC.width = bw; beamC.height = bh; }
      bcx.setTransform(1, 0, 0, 1, 0, 0); bcx.globalCompositeOperation = 'source-over'; bcx.globalAlpha = 1; bcx.clearRect(0, 0, bw, bh);
      bcx.globalCompositeOperation = 'lighter'; bcx.setTransform(BS, 0, 0, BS, 0, 0);
      var hs = Wd.heads, n = hs.length, tt = t - 8;
      var lift = 1 + 0.06 * Math.max(0, 1 - ((((tt % 0.5) + 0.5) % 0.5) / 0.25)), boost = 1 + 0.2 * climax(t);
      // motion blur: when the heads move fast (the fan opening, the fold, the snap to columns), each beam is drawn at
      // several moments of a 1/30 s shutter, so a sweeping beam smears instead of flicking across the sky
      var K = 1, mv = 0;
      for (var i = 0; i < n; i += 3) { beamAim(i, n, t, AIMB); var p0 = AIMB.pan, t0 = AIMB.tilt; beamAim(i, n, t - 1 / 30, AIMB); mv = Math.max(mv, Math.abs(p0 - AIMB.pan) + Math.abs(t0 - AIMB.tilt)); }
      if (mv > 0.6) K = Math.min(6, 1 + Math.ceil(mv / 1.2));
      for (var smp = 0; smp < K; smp++) {
        var ts = K > 1 ? t - (1 / 30) * smp / (K - 1) : t;
        for (i = 0; i < n; i++) {
          beamAim(i, n, ts, AIMB);
          var pan = AIMB.pan * DEG, tilt = AIMB.tilt * DEG, h = hs[i];
          var dx = Math.sin(tilt) * Math.sin(pan), dy = -Math.cos(tilt), dz = -Math.sin(tilt) * Math.cos(pan);
          beam(h[0], h[1] - 0.45, h[2], dx, dy, dz, 95, on * lift * boost / K, smp === 0 ? on * lift * boost : 0);
        }
      }
      // haze: the light only shows where there is something in the air to catch it
      bcx.setTransform(1, 0, 0, 1, 0, 0); bcx.globalCompositeOperation = 'destination-in';
      var dr = (t - 8) * 0.012, hw = bw * 1.35, hh = bh * 1.35;
      bcx.drawImage(hazeC, -bw * (0.2 + dr), -bh * 0.18, hw, hh);
      bcx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.globalAlpha = LA;
      ctx.drawImage(beamC, 0, 0, W, H); ctx.restore();
      gx.save(); gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalCompositeOperation = 'lighter'; gx.globalAlpha = 0.75 * LA;
      gx.drawImage(beamC, 0, 0, glow.width, glow.height); gx.restore();
    }
    function beam(x, y, z, dx, dy, dz, L, a, lens) {
      if (a <= 0.003) return;
      var ex = x + dx * L, ey = y + dy * L, ez = z + dz * L;
      var zs = (x - CX) * F0 + (y - CY) * F1 + (z - CZ) * F2, ze = (ex - CX) * F0 + (ey - CY) * F1 + (ez - CZ) * F2;
      if (zs < NEAR && ze < NEAR) return;
      var kk = 1;
      if (ze < NEAR) { kk = (zs - NEAR) / (zs - ze); ex = x + dx * L * kk; ey = y + dy * L * kk; ez = z + dz * L * kk; }
      if (!proj(x, y, z)) return;
      var sx = PJ.x, sy = PJ.y, sz = PJ.z;
      if (!proj(ex, ey, ez)) return;
      var tx = PJ.x, ty = PJ.y, tz = PJ.z;
      var vx = tx - sx, vy = ty - sy, vl = Math.sqrt(vx * vx + vy * vy) || 1, nx = -vy / vl, ny = vx / vl;
      var r0 = 0.13, r1 = r0 + L * kk * 0.036;   // a 2 degree half-angle
      var w0 = Math.max(0.7 * dpr, FOC * r0 / sz), w1 = Math.min(W * 0.6, FOC * r1 / tz);
      var fa = a * fogA(Math.min(sz, 220)) * LA;
      var g = bcx;
      // the halo, then the core; both fall off along the beam (a hot start, a long soft tail)
      for (var p = 0; p < 2; p++) {
        var m = p ? 1 : 2.6, al = p ? 0.24 * fa : 0.07 * fa, gr = g.createLinearGradient(sx, sy, tx, ty);
        gr.addColorStop(0, rgba(HOT, al)); gr.addColorStop(0.12, rgba(HOT, al * 0.62)); gr.addColorStop(0.4, rgba(HOT, al * 0.26)); gr.addColorStop(1, rgba(HOT, 0));
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(sx + nx * w0 * m, sy + ny * w0 * m); g.lineTo(tx + nx * w1 * m, ty + ny * w1 * m); g.lineTo(tx - nx * w1 * m, ty - ny * w1 * m); g.lineTo(sx - nx * w0 * m, sy - ny * w0 * m); g.closePath(); g.fill();
      }
      // the lens: a hot point
      if (lens) addSprite(0, sx, sy, clamp(FOC * 1.0 / sz, 6 * dpr, 36 * dpr), Math.min(1, lens * fogA(Math.min(sz, 220)) * LA * 3.2));
    }
    // (the lime work light beside the stage is gone: at the show's scale it read as a stray dot)

    /* ---- The U, drawn: registered on the photo at home ---- */
    function uEcho(t) {
      if (CZ > U_DEPTH + 0.5) return;   // behind the camera
      FN = 60; FF = 240; COOL = 70;
      var front = Wd.uFront, i, c, p;
      // GO: a band of light scans down the U as the drawing takes over the photo (and back up as it lands)
      var top = U_TOP * S, bot = -A.o * S, sc1 = seg(t, TL.go, TL.go + 0.45), sc2 = seg(t, 14.05, 14.55);
      var band = sc1 > 0 && sc1 < 1 ? lerp(top + 1, bot - 1, E.inOutCubic(sc1)) : sc2 > 0 && sc2 < 1 ? lerp(bot - 1, top + 1, E.inOutCubic(sc2)) : -99;
      // (while the camera is close to the U, sweeping through it, only its outer and inner contours stay: four nested
      // outlines sweeping across the same pixels in half a second would flicker)
      var close = t < 7 ? smooth(seg(t, 0.85, 1.25)) : 1 - smooth(seg(t, 14.25, 14.6));
      for (c = 0; c < front.length; c++) {
        p = front[c];
        var a = (c === 0 ? 0.8 : c === 3 ? 0.5 : 0.36 * (1 - close));
        if (a < 0.005) continue;
        for (i = 0; i < p.length - 1; i++) {
          var my = (p[i][1] + p[i + 1][1]) / 2, boost = band > -90 ? Math.exp(-(my - band) * (my - band) / 1.3) : 0;
          seg3(p[i][0], p[i][1], 0, p[i + 1][0], p[i + 1][1], 0, Math.min(1, a + 0.9 * boost), boost > 0.4 ? C_HOT : C_INK);
        }
        if (c === 0 && close < 1) for (i = 0; i < p.length - 1; i += 2) glint(p[i][0], p[i][1], 0, p[i + 1][0], p[i + 1][1], 0, 0.75 * (1 - close), true);
      }
      p = Wd.uBack;
      for (i = 0; i < p.length - 1; i++) seg3(p[i][0], p[i][1], U_DEPTH, p[i + 1][0], p[i + 1][1], U_DEPTH, 0.34, C_INK);
      for (i = 0; i < Wd.uEdges.length; i++) { var e = Wd.uEdges[i]; seg3(e[0], e[1], 0, e[0], e[1], U_DEPTH, 0.42, C_INK); }
      // the bracing: lit at GO, then the truss grows back from it
      var lit = 0.5 + 0.5 * smooth(seg(t, TL.go, TL.go + 0.25)) * (1 - smooth(seg(t, 1.0, 1.4))) + 0.4 * smooth(seg(t, 14.0, 14.4));
      for (i = 0; i < Wd.brace.length; i++) { var b = Wd.brace[i]; seg3(b[0], b[1], b[4], b[2], b[3], b[4], 0.6 * lit, C_INK, -1); glint(b[0], b[1], b[4], b[2], b[3], b[4], 0.7, false); }
      neon(t, 1);
    }
    function neonPts() {   // the neon, projected (with the near plane); returns a flat list and the mean depth
      var p = Wd.neon.p, out = [], zs = 0, n = 0, z = -0.06;
      for (var i = 0; i < p.length; i++) if (proj(p[i][0], p[i][1], z)) { out.push(PJ.x, PJ.y); zs += PJ.z; n++; } else out.push(NaN, NaN);
      out.z = n ? zs / n : 0;
      return out;
    }
    function strokePts(g, pts, k) {
      g.beginPath(); var pen = false;
      for (var i = 0; i < pts.length; i += 2) { var x = pts[i] * k, y = pts[i + 1] * k; if (x !== x) { pen = false; continue; } if (!pen) g.moveTo(x, y); else g.lineTo(x, y); pen = true; }
      g.stroke();
    }
    function neon(t, a) {
      var pts = neonPts();
      if (!pts.z) return;
      // a glass tube: a thin white-hot core, a faint body, the rest of its light in the bloom
      var core = clamp(FOC * 0.055 / pts.z, 1.1 * dpr, 9 * dpr), body = clamp(FOC * 0.2 / pts.z, 2 * dpr, 34 * dpr), al = a * LA * fogA(pts.z);
      if (al <= 0.01) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = rgba(INK, 0.1 * al); ctx.lineWidth = body; strokePts(ctx, pts, 1);
      ctx.strokeStyle = rgba(HOT, 0.85 * al); ctx.lineWidth = core; strokePts(ctx, pts, 1);
      ctx.restore();
      gx.save(); gx.globalCompositeOperation = 'lighter'; gx.lineCap = 'round'; gx.lineJoin = 'round';
      gx.strokeStyle = rgba(HOT, 0.36 * al); gx.lineWidth = Math.max(1, body * 1.25 * GS); strokePts(gx, pts, GS);
      gx.restore();
    }
    // STANDBY: a light runs along the neon on the photo (home camera, registered)
    function standby(t) {
      var k = seg(t, TL.standby[0], TL.standby[1]);
      if (k <= 0 || k >= 1) return;
      var env = Math.sin(Math.PI * k), head = E.inOutCubic(seg(t, 0.1, 0.49)), N = Wd.neon, pts = neonPts();
      if (!pts.z) return;
      var w = clamp(FOC * 0.2 / pts.z, 1.2 * dpr, 40 * dpr);
      var hl = head * N.len, tail = N.len * 0.26, i;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      gx.save(); gx.globalCompositeOperation = 'lighter'; gx.lineCap = 'round';
      for (i = 0; i < N.p.length - 1; i++) {
        var l0 = N.L[i], l1 = N.L[i + 1];
        if (l1 < hl - tail || l0 > hl) continue;
        var x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[i * 2 + 2], y1 = pts[i * 2 + 3];
        if (x0 !== x0 || x1 !== x1) continue;
        var f = clamp(1 - (hl - (l0 + l1) / 2) / tail, 0, 1), aa = env * f * f;
        ctx.strokeStyle = rgba(HOT, 0.7 * aa); ctx.lineWidth = w * 1.1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        gx.strokeStyle = rgba(HOT, aa); gx.lineWidth = w * 5 * GS;
        gx.beginPath(); gx.moveTo(x0 * GS, y0 * GS); gx.lineTo(x1 * GS, y1 * GS); gx.stroke();
      }
      // the head: a four-point glint riding the tube
      for (i = 0; i < N.p.length - 2 && N.L[i + 1] < hl; i++);
      var ff = clamp((hl - N.L[i]) / ((N.L[i + 1] - N.L[i]) || 1), 0, 1), hx = lerp(pts[i * 2], pts[i * 2 + 2], ff), hy = lerp(pts[i * 2 + 1], pts[i * 2 + 3], ff);
      if (hx === hx) {
        var s = w * 11;
        ctx.globalAlpha = 0.9 * env; ctx.drawImage(SPR[1], hx - s / 2, hy - s / 2, s, s);
        gx.globalAlpha = env; gx.drawImage(SPR[0], (hx - s / 2) * GS, (hy - s / 2) * GS, s * GS, s * GS);
      }
      ctx.restore(); gx.restore();
    }

    /* ---- Dust: specks near the path; streaked by the camera's motion (a 1/40 s shutter) ---- */
    function dust(t) {
      var a = smooth(seg(t, 0.7, 1.3)) * (1 - smooth(seg(t, 14.0, 14.5)));
      if (a <= 0) return;
      camAt(Math.max(0, t - 1 / 40), CAM2);
      var d = Wd.dust, n = Wd.nD, prev = [];
      var keep = { x: CX, y: CY, z: CZ, r0: R0, r1: R1, r2: R2, u0: U0, u1: U1, u2: U2, f0: F0, f1: F1, f2: F2, px: PX, py: PY };
      useCam(CAM2);
      for (var i = 0; i < n; i++) { var o = i * 4; prev.push(proj(d[o], d[o + 1], d[o + 2]) ? PJ.x : NaN, PJ.y); }
      CX = keep.x; CY = keep.y; CZ = keep.z; R0 = keep.r0; R1 = keep.r1; R2 = keep.r2; U0 = keep.u0; U1 = keep.u1; U2 = keep.u2; F0 = keep.f0; F1 = keep.f1; F2 = keep.f2; PX = keep.px; PY = keep.py;
      for (i = 0; i < n; i++) {
        o = i * 4;
        if (!proj(d[o], d[o + 1], d[o + 2])) continue;
        var z = PJ.z, al = a * d[o + 3] * fogA(z) * clamp(z / 3, 0, 1) * (z > 60 ? 0 : 1);
        if (al < 0.02) continue;
        var px = prev[i * 2], py = prev[i * 2 + 1];
        var dsz = clamp(FOC * 0.035 / z, 1, 3.2 * dpr);
        if (px === px) addStreak(px, py, PJ.x, PJ.y, dsz, al * 0.7, C_INK);
        else addDot(PJ.x, PJ.y, dsz, al * 0.7, C_INK);
      }
    }

    /* ---- Words: "Concept." "Culture." "Technical reality." ---- */
    var textQ = [];
    var letterCache = {};
    function letters(word, fs) {
      var key = word + '|' + Math.round(fs);
      if (letterCache[key]) return letterCache[key];
      ctx.font = '800 ' + fs + 'px ' + DISPLAY;
      var out = [], x = 0, track = -0.03 * fs;
      for (var i = 0; i < word.length; i++) { var w = ctx.measureText(word[i]).width; out.push([word[i], x, w]); x += w + track; }
      out.width = x - track;
      return (letterCache[key] = out);
    }
    // Each word is set at the vanishing point. Its letters arrive from depth one after another (a 1/45 s stagger,
    // expo-out), it drifts towards the camera while it holds, then the camera passes through it (expo-in) on the
    // next beat. The last one does not fly past: it holds through the burst and its letters lift away.
    function wordScale(t, at, out, last) {   // the first letter's scale at t (0: not shown), to size the motion blur
      var ki = E.outExpo(seg(t, at, at + 0.42)), ko = last ? 0 : E.inExpo(seg(t, out, out + 0.24));
      if (ki <= 0 || ko >= 1) return 0;
      var sc = (1 + 0.06 * seg(t, at, out)) / (1 + (1 - ki) * 1.6);
      return last ? sc : sc / Math.max(0.08, 1 - ko * 0.9);
    }
    function words(t) {
      for (var n = 0; n < TL.words.length; n++) {
        var wd = TL.words[n], s = wd[0], at = wd[1], out = wd[2], last = n === TL.words.length - 1;
        if (t < at || t > out + 0.5) continue;
        var fs = Math.min(W * (W < H ? 0.12 : 0.068), H * 0.11), L = letters(s, fs);
        if (L.width > W * 0.84) { fs *= W * 0.84 / L.width; L = letters(s, fs); }
        var drift = 1 + 0.06 * seg(t, at, out), rot = -CAM.roll * 0.5, cr = Math.cos(rot), sr = Math.sin(rot);
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        // a soft dark pocket behind the word (one gradient, cheaper than a blurred shadow per letter)
        var pk = Math.min(seg(t, at, at + 0.3), 1 - seg(t, out, out + (last ? 0.4 : 0.2))) * LA;
        if (pk > 0) {
          var pw = L.width * 0.62 * drift, ph = fs * 0.95;
          ctx.setTransform(pw / 50, 0, 0, ph / 50, PX, PY - fs * 0.02);
          var pg = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
          pg.addColorStop(0, 'rgba(3,4,9,' + fmt(0.55 * pk) + ')'); pg.addColorStop(1, 'rgba(3,4,9,0)');
          ctx.fillStyle = pg; ctx.fillRect(-50, -50, 100, 100);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.font = '800 ' + fs + 'px ' + DISPLAY; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        var gr = ctx.createLinearGradient(0, -fs * 0.72, 0, 0);
        gr.addColorStop(0, 'rgb(255,253,248)'); gr.addColorStop(1, 'rgb(204,201,194)');
        ctx.fillStyle = gr;
        // motion blur: while the letters fly in or out (their scale changing fast), each is drawn at several moments
        // of a 1/30 s shutter and averaged, so the strokes smear instead of sweeping across the screen
        var K = 1, sNow = wordScale(t, at, out, last), sThen = wordScale(t - 1 / 30, at, out, last);
        if (sNow > 0 && sThen > 0) { var rr = Math.abs(Math.log(sNow / sThen)); K = rr > 0.01 ? Math.min(16, 2 + Math.ceil(rr * L.width * sNow / 5)) : 1; }
        else if (sNow > 0 || sThen > 0) K = 12;
        if (last && t > out - 0.15) K = Math.max(K, 4);   // (its letters lift away)
        for (var smp = 0; smp < K; smp++) {
          var ts = K > 1 ? t - (1 / 30) * smp / (K - 1) : t, dts = 1 + 0.06 * seg(ts, at, out);
          for (var i = 0; i < L.length; i++) {
            var li = L[i];
            if (li[0] === ' ') continue;
            var ki = E.outExpo(seg(ts, at + i * 0.022, at + i * 0.022 + 0.42));
            var ko = last ? E.inCubic(seg(ts, out - 0.12 + i * 0.018, out + 0.2 + i * 0.018)) : E.inExpo(seg(ts, out, out + 0.24));
            if (ki <= 0 || ko >= 1) continue;
            var sc = dts / (1 + (1 - ki) * 1.6);              // arriving from depth
            if (!last) sc /= Math.max(0.08, 1 - ko * 0.9);      // leaving past the camera
            var lx = (-L.width / 2 + li[1] + li[2] / 2) * sc, ly = fs * 0.34 * sc - (last ? ko * fs * 0.55 : 0);
            var X = PX + lx * cr - ly * sr, Y = PY + lx * sr + ly * cr;
            ctx.globalAlpha = ki * (1 - ko) * LA * 0.95 / K;
            ctx.globalCompositeOperation = K > 1 ? 'lighter' : 'source-over';
            ctx.setTransform(sc * cr, sc * sr, -sc * sr, sc * cr, X, Y);
            ctx.fillText(li[0], -li[2] / 2, 0);
          }
        }
        ctx.restore();
      }
    }

    /* ---- Small labels (grid bubbles) ---- */
    function flushText() {
      if (!textQ.length) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < textQ.length; i++) {
        var q = textQ[i];
        ctx.font = '500 ' + Math.round(q[3]) + 'px ' + MONO; ctx.fillStyle = rgba(INK, q[4]);
        ctx.fillText(q[0], q[1], q[2]);
      }
      ctx.restore(); textQ.length = 0;
    }

    /* ---- The show-calling corner: cue and timecode, under the header ---- */
    function hud(t) {
      var a = smooth(seg(t, 0.1, 0.4)) * (1 - smooth(seg(t, TOTAL - 0.7, TOTAL - 0.3)));
      if (a <= 0) return;
      var cue = CUES[0];
      for (var i = 0; i < CUES.length; i++) if (t >= CUES[i][0]) cue = CUES[i];
      var go = cue[2] === 1 && t - cue[0] < 0.5, gut = clamp(Wc * 0.045, 20, 56) * dpr, y = (HEAD + 20) * dpr, fs = 10.5 * dpr;
      var tc = Math.floor(t * 30), ff = tc % 30, ss = Math.floor(t) % 60;
      var tcs = 'TC 00:00:' + (ss < 10 ? '0' : '') + ss + ':' + (ff < 10 ? '0' : '') + ff;
      var label = 'CUE ' + cue[1] + '   ' + (cue[2] ? 'GO' : 'STANDBY');
      // typed on and off, a character at a time
      var nOn = Math.floor(seg(t, 0.1, 0.42) * 24), nOff = Math.floor(seg(t, TOTAL - 0.7, TOTAL - 0.38) * 24), show = Math.max(0, nOn - nOff);
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'middle';
      ctx.font = '500 ' + fs + 'px ' + MONO;
      try { ctx.letterSpacing = (0.14 * fs).toFixed(1) + 'px'; } catch (e) { /* older engines: no tracking */ }
      ctx.fillStyle = rgba(INK, 0.5 * a);
      var sq = 6 * dpr;
      ctx.fillStyle = go ? rgba(LIME, 0.95 * a) : rgba(INK, 0.28 * a);
      ctx.fillRect(gut, y - sq / 2, sq, sq);
      ctx.fillStyle = rgba(INK, 0.56 * a);
      var txt = label.slice(0, show);
      ctx.textAlign = 'left';
      if (go && txt.length > 9) { ctx.fillText(txt.slice(0, 9), gut + sq + 10 * dpr, y); var wv = ctx.measureText(txt.slice(0, 9)).width; ctx.fillStyle = rgba(LIME, 0.95 * a); ctx.fillText(txt.slice(9), gut + sq + 10 * dpr + wv, y); }
      else ctx.fillText(txt, gut + sq + 10 * dpr, y);
      // the timecode; its frames field changes every frame, so it is set dimmer (no pixel of it steps by 0.1)
      ctx.textAlign = 'right';
      var tcv = tcs.slice(0, show), cut = Math.min(tcv.length, tcs.length - 2), wf = ctx.measureText(tcv.slice(cut)).width;
      ctx.fillStyle = rgba(INK, 0.42 * a); ctx.fillText(tcv.slice(0, cut), W - gut - wf, y);
      if (tcv.length > cut) { ctx.fillStyle = rgba(INK, 0.2 * a); ctx.fillText(tcv.slice(cut), W - gut, y); }
      ctx.restore();
    }

    /* ---- Bloom (a mip chain of the glow buffer), the calm zones ---- */
    function bloom(a) {
      g2x.globalCompositeOperation = 'copy'; g2x.drawImage(glow, 0, 0, glow2.width, glow2.height);
      g3x.globalCompositeOperation = 'copy'; g3x.drawImage(glow2, 0, 0, glow3.width, glow3.height);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 0.5 * a; ctx.drawImage(glow, 0, 0, W, H);
      ctx.globalAlpha = 0.6 * a; ctx.drawImage(glow2, 0, 0, W, H);
      ctx.globalAlpha = 0.75 * a; ctx.drawImage(glow3, 0, 0, W, H);
      ctx.restore();
    }
    var calmGrad = null;
    function calm(a) {
      if (a <= 0) return;
      if (!calmGrad) {
        // the header's band is the header's real height (HEAD, CSS px): at least 80% dark behind all of it, so its text
        // keeps >= 4.5:1 even when the neon or a beam passes through; then it eases off below
        var hd = clamp(HEAD * dpr / H, 0.04, 0.2);
        calmGrad = ctx.createLinearGradient(0, 0, 0, H);
        calmGrad.addColorStop(0, 'rgba(11,11,12,0.88)'); calmGrad.addColorStop(hd, 'rgba(11,11,12,0.8)'); calmGrad.addColorStop(hd + 0.06, 'rgba(11,11,12,0.34)'); calmGrad.addColorStop(hd + 0.13, 'rgba(11,11,12,0)');
        calmGrad.addColorStop(0.6, 'rgba(11,11,12,0)'); calmGrad.addColorStop(0.72, 'rgba(11,11,12,0.42)'); calmGrad.addColorStop(0.86, 'rgba(11,11,12,0.7)');
        calmGrad.addColorStop(1, 'rgba(11,11,12,0.8)');
      }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
      ctx.fillStyle = calmGrad; ctx.fillRect(0, 0, W, H); ctx.restore();
    }

    /* ==========================================================================
       render(t)
       ========================================================================== */
    function renderOld(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      camAt(t, CAM); useCam(CAM);
      // motion blur: the camera (and the moving parts) a 1/30 s shutter ago
      SHUT_W = shutterAt(t); TPREV = t - SHUT_W; camAt(TPREV < 0 ? TPREV + DUR : TPREV, CAMQ); usePrev(CAMQ); STREAK = t > TL.back ? 1 : t > 5.05 && t < 7.0 ? 2 : 0; BUILD = 1 + 0.6 * smooth(seg(t, 4.9, 5.4)) * (1 - smooth(seg(t, 7.4, 8.0)));
      var imgA = layerOk ? imageAlpha(t) : 0, vec = layerOk ? vecAlpha(t) : 1;
      ctx.fillStyle = '#0b0b0c'; ctx.fillRect(0, 0, W, H);
      if (api.debugReg && layerOk) {   // review: the drawing over the photo at full strength (registration check)
        drawLayer(1, 1); LA = 1; MB = false; uEcho(t); flushLines(ctx); flushDots(ctx); SP.length = 0; return;
      }
      // the logo frame itself: exactly the photo, nothing else
      if (imgA >= 1 && vec <= 0 && (t <= TL.standby[0] || t >= TL.standby[1])) { drawLayer(1, 1); return; }
      var a = Math.max(0.0001, 1 - imgA);
      // the key light sits ahead, low over the far end of the truss (then the stage): chrome glints face the camera
      LX = 0.28 * Math.sin(t * Math.PI * 2 / DUR); LY = 0.32; LZ = 0.9;
      var ll = Math.sqrt(LX * LX + LY * LY + LZ * LZ); LX /= ll; LY /= ll; LZ /= ll;
      gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalCompositeOperation = 'source-over'; gx.globalAlpha = 1; gx.clearRect(0, 0, glow.width, glow.height);
      SP.length = 0;
      var des = STAGE ? desertW(t) : 0;
      if (!DBG.noSky) sky(t, a, des);
      stars(t, a * (1 - 0.3 * des));
      if (!DBG.noSky && STAGE) land(t, a * des);
      if (imgA > 0) { var kz = CZ < -0.5 ? HOME.D / -CZ : 1, kzq = QZ < -0.5 ? HOME.D / -QZ : 1; if (kz === 1 && kzq === 1) drawLayer(imgA, 1); else drawLayerMB(imgA, kz, kzq); }
      LA = vec;
      if (!DBG.noFx) endLight(t);
      if (STAGE) { ridgeLine(t); grid(t); } megas(t);
      if (STAGE && t > 7.1 && t < 14.4) {   // the far world first: the LED wall is solid and stands in front of it
        if (DBG.noLines) for (var bj = 0; bj < BK.length; bj++) BK[bj].length = 0;
        flushQuads(ctx); flushLines(ctx); flushDots(ctx);
        if (!DBG.noLED) { wallPanel(t); if (!DBG.noSpill) spill(t); }
        // (the audience goes down before the rig and the truss: their lines pass over it, so a head moving past a still
        // line in the pull-back never hides and shows it again and again)
        if (!DBG.noCrowd) crowd(t);
      }
      tunnel(t); if (STAGE) stage(t); uEcho(t); dust(t);
      if (DBG.noLines) { for (var bi = 0; bi < BK.length; bi++) BK[bi].length = 0; for (bi = 0; bi < QB.length; bi++) QB[bi].length = 0; }
      flushQuads(ctx); flushLines(ctx); flushDots(ctx);
      if (!DBG.noLED && STAGE) ledDraw(t);
      if (!DBG.noFx && STAGE) beams(t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (DBG.noSprites) SP.length = 0;
      flushSprites(ctx, 1, 1);
      flushSprites(gx, GS, 0.6);
      flushText();
      standby(t);
      if (!DBG.noWords) words(t);
      if (!DBG.noBloom) bloom(Math.max(vec, t < 0.6 ? 1 : 0));
      if (!DBG.noSky) calm(1 - imgA);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }


    /* ==========================================================================
       render(t): the new clock (TOTAL seconds). 0 - 5.0 is the reel as it was, with no stage world: "Technical
       reality." and the burst, closing to black; at 5.0 the five cues play full frame, their words set over them; the
       picture folds to a line of light; the old timeline resumes at SB_RESUME, the truss re-forming round the camera.
       The cues' pictures: opts.cueFrame(i) (frame i at 30 fps, for a frame-exact export), else the cue video (played in
       step with the reel), else makeStory's own drawing of the storyboard.
       ========================================================================== */
    var SBASE = opts.storyMedia != null ? opts.storyMedia : 'media/endreel/', STORY = makeStory(SBASE);
    api.story = STORY;
    var CVID = null, CVIDok = false, CVIDfail = false;
    function cueVideo() {   // the cue video, made once the reel prepares or reaches the cues; muted, inline, looping off
      if (CVID || CVIDfail || opts.cueFrame || opts.cueVideo === false) return CVID;
      CVID = document.createElement('video'); CVID.muted = true; CVID.defaultMuted = true; CVID.playsInline = true; CVID.setAttribute('playsinline', ''); CVID.preload = 'auto';
      CVID.addEventListener('canplay', function () { CVIDok = true; });
      CVID.addEventListener('error', function () { CVIDfail = true; CVIDok = false; STORY.start(); });
      CVID.src = SBASE + 'cues.mp4';
      return CVID;
    }
    // (the drawn storyboard's pictures load only when it is needed: the video failed, or is not ready when the cues
    // start; an export starts them itself)
    api.prepareCues = function () { cueVideo(); };
    // where the cue pictures sit on the clock (an export supplies them frame by frame through opts.cueFrame)
    api.cueSpan = { at: SB_AT, frames: SBK.FRAMES, fold: SBK.FOLD, starts: SBK.T0.slice() };
    function cueImage(ct, playing) {   // the cue picture at ct seconds into the cues, or null
      if (opts.cueFrame) return opts.cueFrame(Math.max(0, Math.min(SBK.FRAMES - 1, Math.floor(ct * 30 + 1e-6))));
      var v = cueVideo();
      if (!v || !CVIDok || v.readyState < 2) return null;
      if (playing) {
        if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { CVIDfail = true; }); }
        if (Math.abs(v.currentTime - ct) > 0.25) v.currentTime = ct;
      } else {
        if (!v.paused) v.pause();
        if (Math.abs(v.currentTime - ct) > 0.04) v.currentTime = ct;
      }
      return v;
    }
    function cueRest() { if (CVID && !CVID.paused) CVID.pause(); }
    // the 16:9 picture's place on the frame: the whole picture, fitted (black fills any bars)
    function picRect() { var s = Math.min(W / 1600, H / 900); return { x: (W - 1600 * s) / 2, y: (H - 900 * s) / 2, w: 1600 * s, h: 900 * s, s: s }; }
    function drawPic(img, a, squash) {
      var r = picRect(), iw = img.videoWidth || img.width, ih = img.videoHeight || img.height, hh = r.h * (squash == null ? 1 : squash);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, iw, ih, r.x, r.y + (r.h - hh) / 2, r.w, hh); ctx.globalAlpha = 1;
    }
    // the cue's word, in two states, both still (type never moves, so it can never flicker): set large while the figure
    // stands in the black, gone as the camera pushes in; then small, a label with a lime rule, once the cue's world is
    // revealed, until just before the cut. [word, large in, large out, label in] in seconds into the cue; the label goes
    // 0.4 s before the cue ends. Low on the left of the picture; on a tall screen both sit under the picture, in the black.
    // A fifth field sets the large word on several lines ("Live Entertainment" stacks, clear of the drum kit).
    var CUE_WORDS = [['Keynotes', 0.06, 1.3, 2.9], ['Activations', 0.04, 0.82, 1.6], ['Experiential', 0.06, 1.2, 2.9],
      ['Live Entertainment', 0.04, 0.9, 2.2, ['Live', 'Entertainment']], ['Sports', 0.06, 1.35, 2.4]];
    function fitFont(txt, fs, maxW, weight, track) {   // the size that keeps txt within maxW
      ctx.font = weight + ' ' + fs + 'px ' + DISPLAY;
      try { ctx.letterSpacing = (fs * track).toFixed(2) + 'px'; } catch (e) { /* no tracking */ }
      var w = ctx.measureText(txt).width;
      if (w > maxW) { fs *= maxW / w; ctx.font = weight + ' ' + fs + 'px ' + DISPLAY; try { ctx.letterSpacing = (fs * track).toFixed(2) + 'px'; } catch (e) { /* no tracking */ } }
      return fs;
    }
    function cueWord(i, t) {
      var cw = CUE_WORDS[i], len = SBK.D[i];
      // (even 0.5 s ramps: the large white type, and its shadow over a moving picture, change by well under 0.1 in
      // luminance from one frame to the next)
      var aBig = seg(t, cw[1], cw[1] + 0.5) * (1 - seg(t, cw[2], cw[2] + 0.5));
      var aCap = smooth(seg(t, cw[3], cw[3] + 0.35)) * (1 - smooth(seg(t, len - 0.4, len - 0.12)));
      if (aBig <= 0.004 && aCap <= 0.004) return;
      var r = picRect(), tall = H > W * 1.05, gut = tall ? clamp(Wc * 0.07, 20, 56) * dpr : r.x + 112 * r.s;
      var maxW = tall ? W - 2 * gut : r.w - 224 * r.s, fs, y;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      if (aBig > 0.004) {
        var lines = cw[4] || [cw[0]], longest = lines.reduce(function (a, b) { return b.length > a.length ? b : a; }), lh = 0.92;
        fs = fitFont(longest, tall ? W * 0.13 : 120 * r.s, maxW, 800, -0.035);
        // a tall screen sets the lines down from under the picture; a wide one up from the last line's baseline
        y = tall ? r.y + r.h + 26 * dpr + fs * 0.8 : r.y + 690 * r.s - (lines.length - 1) * fs * lh;
        ctx.globalAlpha = aBig; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = tall ? 0 : 50 * r.s; ctx.shadowOffsetY = tall ? 0 : 6 * r.s;
        ctx.fillStyle = '#fbf8f1';
        for (var li = 0; li < lines.length; li++) ctx.fillText(lines[li], gut, y + li * fs * lh);
      }
      if (aCap > 0.004) {
        var cap = cw[0].toUpperCase(), rule = tall ? 22 * dpr : 44 * r.s, gap = tall ? 12 * dpr : 22 * r.s;
        fs = fitFont(cap, tall ? 15 * dpr : 30 * r.s, maxW - rule - gap, 700, 0.14);
        y = tall ? r.y + r.h + 26 * dpr + fs : r.y + 812 * r.s;
        ctx.globalAlpha = aCap; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = tall ? 0 : 24 * r.s; ctx.shadowOffsetY = 0;
        ctx.fillStyle = rgba(LIME, 0.95); ctx.fillRect(gut, y - fs * 0.36 - Math.max(1, fs * 0.06), rule, Math.max(2, fs * 0.12));
        ctx.fillStyle = '#fbf8f1'; ctx.fillText(cap, gut + rule + gap, y);
      }
      ctx.restore();
    }
    function cuesAt(ct, playing) {   // the cue picture at ct seconds into the cues, and its word
      var i = 0; while (i < SBK.N - 1 && ct >= SBK.T0[i + 1]) i++;
      var t = ct - SBK.T0[i], img = cueImage(ct, playing);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (img) drawPic(img, 1);
      else { STORY.size(Math.min(W, H * 16 / 9)); drawPic(STORY.frame(i, t), 1); }
      cueWord(i, t);
    }
    function render(tn) {
      if (tn < SB_AT) {   // the old reel to "Technical reality."; the burst's pieces fly out into the black, which closes
        // over everything on the beat the cues start (the cue video is made early, so it has buffered by then)
        cueRest(); if (tn > 1.0) cueVideo();
        renderOld(tn);
        var fb = smooth(seg(tn, SB_AT - 0.35, SB_AT));
        if (fb > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(0,0,0,' + fmt(fb) + ')'; ctx.fillRect(0, 0, W, H); }
        hud(tn); return;
      }
      var ct = tn - SB_AT;
      if (ct < SBK.CUES) { cuesAt(ct, api.playing); hud(tn); return; }
      var ft = ct - SBK.CUES;
      if (ft < SBK.FOLD) {   // the picture folds to a line of light, as an LED wall powering down, and the line goes out
        var img = cueImage(SBK.CUES - 1 / 30, false), p = ft / SBK.FOLD, sq = 1 - E.inCubic(seg(p, 0, 0.55));
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        if (sq > 0.004) { if (img) drawPic(img, 1, sq); else { STORY.size(Math.min(W, H * 16 / 9)); drawPic(STORY.frame(SBK.N - 1, SBK.D[SBK.N - 1] - 0.001), 1, sq); } }
        var r = picRect(), lw = r.w * (1 - E.inCubic(seg(p, 0.5, 1))), la = smooth(seg(p, 0.3, 0.5)) * (1 - smooth(seg(p, 0.85, 1)));
        if (la > 0 && lw > 1) {
          var cy = r.y + r.h / 2, lg = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);
          lg.addColorStop(0, 'rgba(216,255,61,0)'); lg.addColorStop(0.5, 'rgba(255,253,240,' + fmt(0.85 * la) + ')'); lg.addColorStop(1, 'rgba(216,255,61,0)');
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg; ctx.fillRect(W / 2 - lw / 2, cy - Math.max(1, 1.5 * dpr), lw, Math.max(2, 3 * dpr));
          ctx.globalAlpha = 0.35 * la; ctx.fillRect(W / 2 - lw / 2, cy - 10 * dpr, lw, 20 * dpr); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
        cueRest(); hud(tn); return;
      }
      // home: old time from SB_RESUME, no stage world: the truss re-forms round the camera out of the dark, retracts
      // into the U, the logo
      var to = ft - SBK.FOLD + SB_RESUME;
      cueRest(); renderOld(to);
      var fi = 1 - smooth(seg(to, SB_RESUME, SB_RESUME + 0.12));
      if (fi > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,' + fmt(fi) + ')'; ctx.fillRect(0, 0, W, H); }
      hud(tn);
    }

    /* ---- Size and clock ---- */
    // The backing store follows the screen's pixel ratio up to 1.5 (as film3.js caps it: the lines are drawn in device
    // px and stay crisp, and a Retina screen fills 44% fewer pixels than at 2). If playback still drops frames
    // (watchPace), it steps down to 1.25, then 1, and stays there. Nothing is laid out again unless the size or the
    // layout really changed.
    var DPRCAP = 1.5, SIG = '';
    function resize() {
      var cw, ch;
      if (opts.size) { cw = opts.size.w; ch = opts.size.h; }
      else { cw = canvas.clientWidth || canvas.offsetWidth || 1; ch = canvas.clientHeight || canvas.offsetHeight || 1; }
      dpr = opts.dpr || Math.min(window.devicePixelRatio || 1, DPRCAP);
      var sig = [cw, ch, dpr, HEAD, ROOM, RECT ? [RECT.x, RECT.y, RECT.w, RECT.h, RECT.kind].join(',') : '-'].join(' ');
      if (sig === SIG && Wd) return;
      SIG = sig;
      Wc = cw; Hc = ch;
      W = Math.max(1, Math.round(cw * dpr)); H = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      LITE = opts.lite != null ? !!opts.lite : (cw < 700 || (navigator.hardwareConcurrency || 8) <= 4);
      api.W = W; api.H = H; api.lite = LITE;
      layout();
      if (PREPPED) prepSoon();   // (a new size: the wall's words are set again, ahead of time)
    }
    // one frame at t (seconds, wrapped into the loop); returns its script time in ms. It never throws: if a frame fails
    // (it should not) the reel says so once in the console and stops on its last good frame.
    var failed = false;
    function frame(t) {
      var t0 = performance.now();
      t = (+t || 0) % TOTAL; if (t < 0) t += TOTAL;   // (exact for 0 <= t < TOTAL: adding TOTAL first would round)
      api.time = t;
      if (failed) return 0;
      try { render(t); }
      catch (e) {
        failed = true; api.pause();
        try { console.warn('[endreel] a frame failed and the reel has stopped: ' + (e && e.message)); } catch (e2) { /* no console */ }
      }
      return performance.now() - t0;
    }
    function safe(fn) { try { fn(); } catch (e) { failed = true; api.pause(); try { console.warn('[endreel] ' + (e && e.message)); } catch (e2) { /* no console */ } } }
    var raf = 0, last = 0, PACE = { n: 0, sum: 0, min: 1e9, skip: 40 };
    function loop(now) {
      raf = 0;
      var ms = last ? now - last : 0, dt = last ? Math.min(0.1, ms / 1000) : 0;
      last = now;
      api.frame(api.time + dt);
      if (ms > 0 && !opts.dpr) watchPace(ms);
      if (api.playing) raf = requestAnimationFrame(loop);
    }
    // over each 60 frames: if they average more than 1.25x the shortest interval seen (the screen's refresh), frames are
    // being dropped: step the backing store down a notch (never back up)
    function watchPace(ms) {
      if (PACE.skip > 0) { PACE.skip--; return; }
      if (ms < PACE.min) PACE.min = ms;
      PACE.sum += ms; PACE.n++;
      if (PACE.n < 60) return;
      var avg = PACE.sum / PACE.n; PACE.sum = 0; PACE.n = 0;
      if (avg > 1.25 * Math.max(PACE.min, 4) && dpr > 1.01) {
        DPRCAP = dpr > 1.3 ? 1.25 : 1; PACE.skip = 40; api.dprSteps = (api.dprSteps || 0) + 1;
        safe(resize); frame(api.time);
      }
    }
    api.frame = frame;
    // The one still (Pause motion / reduced motion while the reel is up): the frame at STILL_T. Once shown, any redraw
    // (a resize, a turn, the photo arriving) draws the still again, never a plain frame.
    var stillOn = false, stillAt = STILL_T;
    api.still = function (t) { stillOn = true; stillAt = t != null ? +t : STILL_T; frame(stillAt); };
    function redraw() { if (api.active === false) return; frame(stillOn ? stillAt : api.time); }
    api.play = function () {
      if (api.playing || failed) return;
      stillOn = false; api.playing = true; last = 0; raf = requestAnimationFrame(loop);
    };
    api.pause = function () { api.playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; cueRest(); };
    api.seek = function (t) { stillOn = false; frame(t); };
    // a resting reel (not active) is not drawn: it is redrawn when it is activated
    api.resize = function () { safe(resize); if (!api.playing) redraw(); };
    function setL(o) { o = o || {}; if (o.head != null) HEAD = o.head; if (o.room != null) ROOM = o.room; if (o.rect !== undefined) RECT = o.rect; }
    api.setLayout = function (o) { setL(o); SIG = ''; safe(resize); if (!api.playing) redraw(); };
    // the new size and the new layout together, in one pass (the hook's resize relay)
    api.relayout = function (o) { setL(o); safe(resize); if (!api.playing) redraw(); };
    api.isReady = function () { return layerOk; };
    // Made ahead, in idle time, a few milliseconds a step (so neither the hand-over nor the 7.5 s mark does heavy
    // work): the haze for the beams and the wall's words one by one. (The photo's layer is made when it has loaded.)
    var PREPPED = false, PQ = [];
    function idle(fn) { if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 400 }); else setTimeout(fn, 16); }
    function prepSoon() {
      PQ = [function () { if (!hazeC) hazeSetup(); }, function () { if (!TK) tkLayout(); }];
      EVENTS.forEach(function (w, i) { PQ.push(function () { if (!TK) tkLayout(); tkWord(TK.items[i]); }); });
      idle(function step(dl) {
        var t0 = performance.now();
        while (PQ.length) {
          safe(PQ.shift());
          if (performance.now() - t0 > 6 || (dl && dl.timeRemaining && dl.timeRemaining() < 3)) break;
        }
        if (PQ.length) idle(step);
      });
    }
    api.prepare = function () { api.prepareCues(); if (!PREPPED) { PREPPED = true; prepSoon(); } return layerOk; };
    api.camera = function (t) { return camAt(t, {}); };
    // (review) where a world point is on screen at t (device px), or null behind the lens; and the world itself
    api.project = function (x, y, z, t) { camAt(t, CAM); useCam(CAM); return proj(x, y, z) ? { x: PJ.x, y: PJ.y, z: PJ.z } : null; };
    api.world = function () { return Wd; };
    api.sc = SC;
    api.home = HOME;
    api.redrawWhenFonts = function () {
      if (document.fonts && document.fonts.load) {
        Promise.all([document.fonts.load('800 64px "Bricolage Grotesque"'), document.fonts.load('700 64px "Bricolage Grotesque"')]).then(function () {
          letterCache = {}; TK = null; if (PREPPED) prepSoon(); if (!api.playing) redraw();
        }, function () {});
      }
    };
    if (opts.rect) RECT = opts.rect;   // (the image's place, when the page knows it: one layout, not two)
    safe(resize);
    api.redrawWhenFonts();
    return api;
  }

  /* ==========================================================================
     The controller: when the reel plays, holds its still, or rests
     ========================================================================== */
  // Motion stops as it does on the rest of the site: for "Pause motion" (html.motion-paused), and for the system's
  // reduced-motion setting unless the visitor chose "Play motion" here (main.js stores that as motion = playing).
  var ROOT = document.documentElement;
  var MQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function stillWanted() {
    if (ROOT.classList.contains('motion-paused')) return true;
    if (!MQ || !MQ.matches) return false;
    try { return window.localStorage.getItem('motion') !== 'playing'; } catch (e) { return true; }
  }
  // main.js applies the system's reduced-motion setting only when the page loads. If the setting changes while the page
  // is open and the visitor has made no choice here, it is applied the same way now (html.motion-paused, and the
  // toggle painted as main.js paints it), so the button's label and the state agree. Undone if the setting is turned
  // off again and it was this that paused.
  var ownPause = false;
  function paintToggle() {
    var b = document.querySelector('[data-motion-toggle]');
    if (!b) return;
    var paused = ROOT.classList.contains('motion-paused'), l = b.querySelector('[data-motion-label]');
    b.setAttribute('aria-pressed', String(paused)); b.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion');
    if (l) l.textContent = paused ? 'Play motion' : 'Pause motion';
  }
  function syncReducedMotion() {
    var stored = null;
    try { stored = window.localStorage.getItem('motion'); } catch (e) { /* no storage */ }
    if (stored !== null || !MQ) return;
    if (MQ.matches && !ROOT.classList.contains('motion-paused')) { ROOT.classList.add('motion-paused'); ownPause = true; paintToggle(); }
    else if (!MQ.matches && ownPause) { ROOT.classList.remove('motion-paused'); ownPause = false; paintToggle(); }
  }
  if (MQ && MQ.addEventListener) MQ.addEventListener('change', syncReducedMotion);
  // Wires a reel to the page: it plays only while it is active (reel.activate), on screen (watch: the element whose
  // visibility counts) and the tab is visible; otherwise it rests on its frame. With motion stopped it shows its one
  // still (opts.still, default STILL_T), and keeps showing it through resizes. reel.hold = t pins one frame (review).
  function control(reel, watch, opts) {
    opts = opts || {};
    var still = opts.still != null ? +opts.still : STILL_T, inView = true;
    reel.active = opts.active !== false;
    function apply() {
      if (reel.hold != null) { reel.pause(); reel.frame(reel.hold); return; }
      if (!reel.active) { reel.pause(); return; }
      if (stillWanted()) { reel.pause(); reel.still(still); return; }
      if (!document.hidden && inView && reel.autoplay !== false) reel.play(); else reel.pause();
    }
    reel.apply = apply;
    reel.activate = function (on, t) {
      reel.active = !!on;
      if (on && t != null) reel.seek(t);
      apply();
    };
    // (mounted by the hook, the reel does not listen for resizes itself: the hook relays them, with the new layout)
    if (!opts.relay) window.addEventListener('resize', function () { reel.resize(); });
    document.addEventListener('visibilitychange', apply);
    new MutationObserver(apply).observe(ROOT, { attributes: true, attributeFilter: ['class'] });
    if (MQ && MQ.addEventListener) MQ.addEventListener('change', apply);
    if (watch && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[en.length - 1].isIntersecting; apply(); }).observe(watch);
    }
    return reel;
  }

  /* ---- mount(container, opts): a canvas of its own, filling the container -------------------------------------
     opts: images { wide: [small, big], tall: [small, big] } (the owner's image, as content/media.js lists it), head,
     room, rect (as film3.js measures and fits them), still, lite, active (false: wait for reel.activate(true)),
     watch (the element whose visibility pauses it; default the container), relay (true: the caller relays resizes,
     with reel.relayout). Returns the reel (also window.__reel), or null if this browser cannot draw it (then the page
     simply keeps what it had). */
  function mount(container, opts) {
    opts = opts || {};
    try {
      var c = document.createElement('canvas');
      if (!c.getContext || !c.getContext('2d', { alpha: true })) return null;
      c.className = 'endreel';
      c.setAttribute('aria-hidden', 'true');
      var st = c.style;
      st.position = 'absolute'; st.left = '0'; st.top = '0'; st.width = '100%'; st.height = '100%'; st.display = 'block'; st.pointerEvents = 'none';
      container.appendChild(c);
      var reel = create(c, { images: opts.images, head: opts.head, room: opts.room, rect: opts.rect, lite: opts.lite, dpr: opts.dpr });
      reel.canvas = c;
      reel.active = opts.active !== false;
      window.__reel = reel;
      return control(reel, opts.watch || container, opts);
    } catch (e) {
      try { console.warn('[endreel] could not start: ' + (e && e.message)); } catch (e2) { /* no console */ }
      return null;
    }
  }

  window.EndReel = { create: create, mount: mount, control: control, duration: TOTAL, TL: TL, STILL: STILL_T };

  /* ---- Auto-mount for the review lab: canvas[data-endreel] -> window.__reel --------------------------------------
     data-final-wide / data-final-tall: "small.jpg big.jpg" (the owner's image). ?t=7.5 holds a frame, ?lite=1. */
  function auto() {
    var c = document.querySelector('canvas[data-endreel]');
    if (!c || window.__reel) return;
    try {
      var pair = function (s) { return (s || '').split(/\s+/).filter(Boolean); };
      var q = new URLSearchParams(location.search);
      var reel = create(c, {
        images: { wide: pair(c.getAttribute('data-final-wide')), tall: pair(c.getAttribute('data-final-tall')) },
        lite: q.has('lite') ? q.get('lite') !== '0' : null
      });
      window.__reel = reel;
      var h = parseFloat(q.get('t'));
      if (!isNaN(h)) reel.hold = h;
      reel.frame(isNaN(h) ? 0 : h);
      reel.prepare();
      control(reel, null, {});
      reel.apply();
    } catch (e) {
      try { console.warn('[endreel] could not start: ' + (e && e.message)); } catch (e2) { /* no console */ }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
