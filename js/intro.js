/* ==========================================================================
   Unconventional — the intro film (home page). From concept to reality.

   Rendered live in a <canvas>, in four acts:
     1. An engineering drawing plots itself onto a screen, flat.
     2. The screen opens out and the camera lifts: the drawing becomes the floor.
     3. The rig builds itself on top of it, piece by piece, like bricks clicking in.
     4. The lights come on — and once they are added, the real event photos take over.

   What it can be given (content/media.js):
     intro            a produced film (MP4). When ready it replaces this render.
     intro-drawing    the owner's own engineering drawing, plotted onto the screen in act 1.
     intro-photo-1…4  photos of the finished event, the last act, in order.

   Motion stops for the "Pause motion" control (html.motion-paused, which main.js
   also sets for prefers-reduced-motion): the film then holds a single finished frame.
   ?film=9.5 on the URL starts the film at that second (handy for reviewing a moment).
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
  var progressEl = section.querySelector('[data-intro-progress]');
  var motionToggle = document.querySelector('[data-motion-toggle]');

  /* ---- Palette: the site's own tokens (css/styles.css) ------------------ */
  var BG = '#0b0b0c';
  var INK = [244, 241, 234], MUTED = [168, 164, 154], LIME = [216, 255, 61];
  var TEAL = [20, 184, 162], VIOLET = [124, 57, 239], WARM = [255, 222, 186];
  var MONO = '"Cascadia Code", "SF Mono", Menlo, Consolas, ui-monospace, monospace';

  /* ---- Timeline, in seconds --------------------------------------------- */
  var T = {
    chrome: [0.15, 0.9],   // the screen fades up
    lift: [4.25, 7.0],     // the camera lifts off the drawing
    open: [4.25, 5.9],     // the screen opens out to the full frame
    power: [12.1, 14.0],   // LED wall, lights, haze
    end: 13.6,             // the title card
    photos: 15.6,          // the real photos, when provided
    still: 15.4            // the frame held when motion is paused
  };

  /* ---- Small maths ------------------------------------------------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function span(t, r) { return clamp((t - r[0]) / (r[1] - r[0]), 0, 1); }
  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function outBack(t) { var c = 1.45; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function G(x, z) { return [x, 0, z]; }

  /* ==========================================================================
     The rig, in metres. Stage centre is the origin, y is up, the audience is
     at +z, upstage at -z. Ground support: four towers carrying a roof grid.
     ========================================================================== */
  var TOWERS = [[-6.5, -3.5], [6.5, -3.5], [-6.5, 3.5], [6.5, 3.5]];
  var GRID_Y = 8.3, DECK_Y = 1.2;
  var FIXTURES = [];
  (function () {
    for (var i = 0; i < 8; i++) FIXTURES.push({ x: -5.25 + i * 1.5, z: 3.5, group: 0 });
    for (i = 0; i < 6; i++) FIXTURES.push({ x: -4.5 + i * 1.8, z: 0, group: 1 });
  })();

  // Box truss between two points: four chords, zig-zag lacing on each face, end frames.
  function trussSegs(a, b, size, bay) {
    var d = sub(b, a), L = Math.sqrt(dot(d, d));
    d = mul(d, 1 / L);
    var e1 = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : norm(cross(d, [0, 1, 0]));
    var e2 = cross(d, e1), h = size / 2;
    var c = [add(mul(e1, h), mul(e2, h)), add(mul(e1, -h), mul(e2, h)), add(mul(e1, -h), mul(e2, -h)), add(mul(e1, h), mul(e2, -h))];
    var segs = [], n = Math.max(1, Math.round(L / bay)), i, k;
    for (i = 0; i < 4; i++) segs.push([add(a, c[i]), add(b, c[i])]);
    for (i = 0; i < 4; i++) {
      var c1 = c[i], c2 = c[(i + 1) % 4];
      for (k = 0; k < n; k++) {
        var p = add(a, mul(d, L * k / n)), q = add(a, mul(d, L * (k + 1) / n));
        segs.push(k % 2 ? [add(p, c2), add(q, c1)] : [add(p, c1), add(q, c2)]);
      }
    }
    [a, b].forEach(function (e) { for (var j = 0; j < 4; j++) segs.push([add(e, c[j]), add(e, c[(j + 1) % 4])]); });
    return segs;
  }
  function boxSegs(x0, y0, z0, x1, y1, z1) {
    var p = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    return [[p[0], p[1]], [p[1], p[2]], [p[2], p[3]], [p[3], p[0]], [p[4], p[5]], [p[5], p[6]], [p[6], p[7]], [p[7], p[4]],
            [p[0], p[4]], [p[1], p[5]], [p[2], p[6]], [p[3], p[7]]];
  }

  /* ---- The pieces, in build order -------------------------------------- */
  var KIND = {
    plate: { c: INK, a: 0.7, w: 1 },
    deck: { c: INK, a: 0.6, w: 1 },
    tower: { c: LIME, a: 0.95, w: 1.15 },
    grid: { c: LIME, a: 0.95, w: 1.15 },
    pa: { c: INK, a: 0.72, w: 1 },
    led: { c: TEAL, a: 0.9, w: 1 },
    fixture: { c: VIOLET, a: 1, w: 1.2 }
  };
  var pieces = [], ledPanels = [], decks = [], lights = [];

  function piece(kind, segs, t0, drop, extra) {
    var c = [0, 0, 0];
    segs.forEach(function (s) { c = add(c, mul(add(s[0], s[1]), 0.5)); });
    var p = { kind: kind, segs: segs, t0: t0, dur: 0.6, drop: drop, centre: mul(c, 1 / segs.length) };
    if (extra) for (var key in extra) p[key] = extra[key];
    pieces.push(p);
    return p;
  }

  (function build() {
    var k, i, j;
    // base plates
    TOWERS.forEach(function (tw, n) {
      piece('plate', boxSegs(tw[0] - 0.6, 0, tw[1] - 0.6, tw[0] + 0.6, 0.06, tw[1] + 0.6), 5.8 + n * 0.08, 3);
    });
    // the stage: 6 × 4 platforms of 2 × 2 m, upstage row first
    k = 0;
    for (j = 0; j < 4; j++) for (i = 0; i < 6; i++) {
      var x0 = -6 + i * 2, z0 = -4 + j * 2;
      decks.push(piece('deck', boxSegs(x0 + 0.03, 0, z0 + 0.03, x0 + 1.97, DECK_Y, z0 + 1.97), 6.05 + (k++) * 0.05, 4, {
        top: [[x0, DECK_Y, z0], [x0 + 2, DECK_Y, z0], [x0 + 2, DECK_Y, z0 + 2], [x0, DECK_Y, z0 + 2]]
      }));
    }
    // towers: four 2 m sections each, stacked level by level
    for (var lv = 0; lv < 4; lv++) TOWERS.forEach(function (tw, n) {
      piece('tower', trussSegs([tw[0], lv * 2, tw[1]], [tw[0], lv * 2 + 2, tw[1]], 0.4, 0.5), 6.9 + lv * 0.42 + n * 0.07, 6);
    });
    // sleeve blocks
    TOWERS.forEach(function (tw, n) {
      piece('tower', boxSegs(tw[0] - 0.32, 8.0, tw[1] - 0.32, tw[0] + 0.32, 8.6, tw[1] + 0.32), 8.6 + n * 0.06, 4);
    });
    // roof grid
    var runs = [
      [[-6.5, GRID_Y, 3.5], [6.5, GRID_Y, 3.5], 4],
      [[-6.5, GRID_Y, -3.5], [6.5, GRID_Y, -3.5], 4],
      [[-6.5, GRID_Y, -3.5], [-6.5, GRID_Y, 3.5], 2],
      [[6.5, GRID_Y, -3.5], [6.5, GRID_Y, 3.5], 2],
      [[-6.5, GRID_Y, 0], [6.5, GRID_Y, 0], 4]
    ];
    k = 0;
    runs.forEach(function (r) {
      for (var s = 0; s < r[2]; s++) {
        var a = add(r[0], mul(sub(r[1], r[0]), s / r[2])), b = add(r[0], mul(sub(r[1], r[0]), (s + 1) / r[2]));
        piece('grid', trussSegs(a, b, 0.3, 0.54), 8.9 + (k++) * 0.08, 5);
      }
    });
    // PA: two ground stacks of six cabinets
    k = 0;
    for (lv = 0; lv < 6; lv++) [-8.3, 8.3].forEach(function (x) {
      var y0 = lv * 0.64, z = 3.2, segs = boxSegs(x - 0.5, y0, z - 0.42, x + 0.5, y0 + 0.6, z + 0.42);
      segs.push([[x - 0.4, y0 + 0.3, z + 0.42], [x + 0.4, y0 + 0.3, z + 0.42]]);
      piece('pa', segs, 9.4 + (k++) * 0.065, 5);
    });
    // LED wall: 10 × 5 one-metre panels, bottom row first
    for (j = 0; j < 5; j++) for (i = 0; i < 10; i++) {
      var lx = -5 + i, ly = 1.4 + j, lz = -3.15;
      var q = [[lx + 0.03, ly + 0.03, lz], [lx + 0.97, ly + 0.03, lz], [lx + 0.97, ly + 0.97, lz], [lx + 0.03, ly + 0.97, lz]];
      ledPanels.push(piece('led', [[q[0], q[1]], [q[1], q[2]], [q[2], q[3]], [q[3], q[0]]], 10.05 + j * 0.27 + i * 0.022, 4, { quad: q, i: i, j: j }));
    }
    // moving lights on the front and middle trusses
    FIXTURES.forEach(function (f, n) {
      var y1 = GRID_Y - 0.15, yb = y1 - 0.62, x = f.x, z = f.z;
      var segs = boxSegs(x - 0.17, yb, z - 0.17, x + 0.17, yb + 0.4, z + 0.17);
      segs.push([[x - 0.21, y1, z], [x - 0.21, yb + 0.2, z]], [[x + 0.21, y1, z], [x + 0.21, yb + 0.2, z]], [[x - 0.21, y1, z], [x + 0.21, y1, z]]);
      lights.push(piece('fixture', segs, 11.25 + n * 0.055, 3, { origin: [x, yb, z], group: f.group, n: n }));
    });
  })();

  /* ==========================================================================
     The drawing: the same rig in plan, as it would sit in a CAD file.
     ========================================================================== */
  var P = {
    grid: { c: MUTED, a: 0.09, w: 1, layer: 'GRID', fade: 0.55 },
    major: { c: MUTED, a: 0.18, w: 1, layer: 'GRID', fade: 0.55 },
    centre: { c: MUTED, a: 0.45, w: 1, dash: [16, 5, 3, 5], layer: 'CENTRE LINE', fade: 1 },
    deck: { c: INK, a: 0.9, w: 1.4, layer: 'STAGE', fade: 0.6 },
    sub: { c: INK, a: 0.32, w: 1, dash: [6, 5], layer: 'STAGE', fade: 0.8 },
    truss: { c: LIME, a: 0.95, w: 1.25, layer: 'TRUSS', fade: 0.6 },
    lace: { c: LIME, a: 0.5, w: 1, layer: 'TRUSS', fade: 0.8 },
    tower: { c: LIME, a: 1, w: 1.4, layer: 'TRUSS', fade: 0.6 },
    plate: { c: INK, a: 0.5, w: 1, layer: 'STAGE', fade: 0.7 },
    led: { c: TEAL, a: 1, w: 2, layer: 'VIDEO', fade: 0.7 },
    pa: { c: INK, a: 0.7, w: 1.2, layer: 'AUDIO', fade: 0.7 },
    fix: { c: VIOLET, a: 1, w: 1.4, layer: 'LIGHTING', fade: 0.7 },
    dim: { c: TEAL, a: 0.85, w: 1, layer: 'DIMENSIONS', fade: 1 }
  };
  var plan = [], labels = [];

  function line(a, b, st, t0, dur) { plan.push({ a: a, b: b, st: st, t0: t0, t1: t0 + (dur || 0.35) }); }
  function rect(x0, z0, x1, z1, st, t0, dur) {
    var d = (dur || 0.5) / 4;
    line(G(x0, z0), G(x1, z0), st, t0, d); line(G(x1, z0), G(x1, z1), st, t0 + d, d);
    line(G(x1, z1), G(x0, z1), st, t0 + 2 * d, d); line(G(x0, z1), G(x0, z0), st, t0 + 3 * d, d);
  }
  function label(x, z, text, t0, c) { labels.push({ p: G(x, z), text: text, t0: t0, c: c || MUTED }); }
  function dim(a, b, off, dist, text, t0) {
    var ext = 0.35, la = add(a, mul(off, dist)), lb = add(b, mul(off, dist));
    line(add(a, mul(off, ext)), add(a, mul(off, dist + ext)), P.dim, t0, 0.18);
    line(add(b, mul(off, ext)), add(b, mul(off, dist + ext)), P.dim, t0 + 0.05, 0.18);
    line(la, lb, P.dim, t0 + 0.12, 0.35);
    var tick = norm(add(norm(sub(b, a)), off));
    [la, lb].forEach(function (p, n) { line(add(p, mul(tick, -0.22)), add(p, mul(tick, 0.22)), P.dim, t0 + 0.42 + n * 0.03, 0.08); });
    labels.push({ p: add(mul(add(la, lb), 0.5), mul(off, 0.4)), text: text, t0: t0 + 0.45, c: TEAL, along: [la, lb] });
  }

  (function drawing() {
    var i, t;
    for (i = -14, t = 0.6; i <= 14; i++, t += 0.011) line(G(i, -9), G(i, 10), i % 5 ? P.grid : P.major, t, 0.45);
    for (i = -9, t = 0.7; i <= 10; i++, t += 0.013) line(G(-14, i), G(14, i), i % 5 ? P.grid : P.major, t, 0.45);
    line(G(0, -8.6), G(0, 9.6), P.centre, 0.95, 0.8);
    rect(-6, -4, 6, 4, P.deck, 1.15, 0.8);
    for (i = -4; i <= 4; i += 2) line(G(i, -4), G(i, 4), P.sub, 1.62 + (i + 4) * 0.025, 0.28);
    for (i = -2; i <= 2; i += 2) line(G(-6, i), G(6, i), P.sub, 1.78 + (i + 2) * 0.03, 0.32);
    TOWERS.forEach(function (tw, n) {
      rect(tw[0] - 0.6, tw[1] - 0.6, tw[0] + 0.6, tw[1] + 0.6, P.plate, 1.95 + n * 0.08, 0.3);
      rect(tw[0] - 0.2, tw[1] - 0.2, tw[0] + 0.2, tw[1] + 0.2, P.tower, 2.0 + n * 0.08, 0.2);
    });
    [[[-6.5, 3.5], [6.5, 3.5]], [[-6.5, -3.5], [6.5, -3.5]], [[-6.5, -3.5], [-6.5, 3.5]], [[6.5, -3.5], [6.5, 3.5]], [[-6.5, 0], [6.5, 0]]]
      .forEach(function (r, n) {
        var a = G(r[0][0], r[0][1]), b = G(r[1][0], r[1][1]), v = sub(b, a), len = Math.sqrt(dot(v, v)), d = mul(v, 1 / len);
        var side = [-d[2], 0, d[0]], h = 0.15, t0 = 2.2 + n * 0.16, bays = Math.round(len / 0.55);
        line(add(a, mul(side, h)), add(b, mul(side, h)), P.truss, t0, 0.42);
        line(add(a, mul(side, -h)), add(b, mul(side, -h)), P.truss, t0 + 0.04, 0.42);
        for (var k = 0; k < bays; k++) {
          var p = add(a, mul(d, len * k / bays)), q = add(a, mul(d, len * (k + 1) / bays)), s = k % 2 ? 1 : -1;
          line(add(p, mul(side, h * s)), add(q, mul(side, -h * s)), P.lace, t0 + 0.1 + k * 0.012, 0.1);
        }
      });
    rect(-5, -3.28, 5, -3.02, P.led, 2.95, 0.45);
    [-8.3, 8.3].forEach(function (x, n) { rect(x - 0.5, 2.78, x + 0.5, 3.62, P.pa, 3.05 + n * 0.08, 0.3); });
    FIXTURES.forEach(function (f, n) {
      var t0 = 3.12 + n * 0.018;
      line(G(f.x - 0.18, f.z - 0.18), G(f.x + 0.18, f.z + 0.18), P.fix, t0, 0.06);
      line(G(f.x + 0.18, f.z - 0.18), G(f.x - 0.18, f.z + 0.18), P.fix, t0 + 0.03, 0.06);
    });
    dim(G(-6.5, 3.5), G(6.5, 3.5), [0, 0, 1], 3.0, '13 000', 3.25);
    dim(G(-6.5, -3.5), G(-6.5, 3.5), [-1, 0, 0], 3.4, '7 000', 3.4);
    dim(G(-6, 4), G(6, 4), [0, 0, 1], 1.4, '12 000', 3.5);
    dim(G(-5, -3.15), G(5, -3.15), [0, 0, -1], 1.9, '10 000', 3.6);
    label(0, -7.3, 'UPSTAGE', 3.3);
    label(0, 9.2, 'DOWNSTAGE  ·  AUDIENCE', 3.4);
    label(0, 1.25, 'STAGE +1.200', 3.5, INK);
    label(0, -2.45, 'LED 10 × 5 M', 3.55, TEAL);
    label(-8.3, 4.35, 'PA', 3.6); label(8.3, 4.35, 'PA', 3.62);
    TOWERS.forEach(function (tw, n) { label(tw[0] + (tw[0] < 0 ? -1.15 : 1.15), tw[1] + (tw[1] < 0 ? -0.95 : 0.95), 'T' + (n + 1), 3.45 + n * 0.04, LIME); });
    label(3.3, 0.5, 'GRID +8.300', 3.7, LIME);
  })();

  /* ==========================================================================
     Canvas, camera and projection
     ========================================================================== */
  var W = 1, H = 1, dpr = 1, screen = { x: 0, y: 0, w: 1, h: 1 };

  function screenRect() {
    var w, h;
    if (W >= H) { h = H * 0.64; w = Math.min(W * 0.8, h * 1.62); }
    else { w = W * 0.9; h = Math.min(H * 0.56, w * 1.25); }
    return { x: (W - w) / 2, y: (H - h) / 2 + H * 0.035, w: w, h: h };
  }
  function chrome(r) {
    var top = 30 * dpr, bot = 24 * dpr, left = r.w > 520 * dpr ? 38 * dpr : 0;
    return { top: top, bot: bot, left: left, inner: { x: r.x + left, y: r.y + top, w: r.w - left, h: r.h - top - bot } };
  }

  function camera(t) {
    var lift = inOut(span(t, T.lift)), power = inOut(span(t, T.power)), aspect = W / H;
    var inner = chrome(screen).inner;
    var s0 = Math.min(inner.w / 30, inner.h / 21);            // drawing scale: px per metre
    var D0 = 150, f0 = s0 * D0;
    var fov = (aspect < 1 ? 50 : 38) * Math.PI / 180;
    var f1 = (H / 2) / Math.tan(fov / 2);
    var fovX = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    var D1 = Math.max(aspect < 1 ? 26 : 23.5, 8.2 / Math.tan(fovX / 2));
    var settle = Math.max(0, t - T.lift[1]);
    var dist = Math.exp(lerp(Math.log(D0), Math.log(D1), lift)) * (1 + 0.025 * Math.sin(settle * 0.07));
    var focal = Math.exp(lerp(Math.log(f0), Math.log(f1), lift));
    var phi = lerp(89.3, 19, lift) * Math.PI / 180;
    var theta = lerp(0, -0.55, lift) + 0.45 * Math.sin(settle * 0.045);
    var target = [0, lerp(0, 3.3, lift), lerp(0.5, 0.2, lift)];
    var endX = W * (aspect > 1.25 ? 0.57 : 0.5), endY = H * (aspect < 1 ? 0.42 : 0.47);
    var px = lerp(inner.x + inner.w / 2, lerp(W / 2, endX, power), lift);
    var py = lerp(inner.y + inner.h / 2, lerp(H / 2, endY, power), lift);
    var cp = Math.cos(phi), sp = Math.sin(phi);
    var pos = [target[0] + dist * cp * Math.sin(theta), target[1] + dist * sp, target[2] + dist * cp * Math.cos(theta)];
    var fw = norm(sub(target, pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
    return { pos: pos, fw: fw, rt: rt, up: up, f: focal, px: px, py: py, dist: dist, lift: lift, power: power };
  }
  function project(c, p) {
    var dx = p[0] - c.pos[0], dy = p[1] - c.pos[1], dz = p[2] - c.pos[2];
    var z = dx * c.fw[0] + dy * c.fw[1] + dz * c.fw[2];
    if (z < 0.5) return null;
    var x = dx * c.rt[0] + dy * c.rt[1] + dz * c.rt[2];
    var y = dx * c.up[0] + dy * c.up[1] + dz * c.up[2];
    return [c.px + x * c.f / z, c.py - y * c.f / z, z];
  }
  function roundRect(r, rad) {
    ctx.beginPath();
    ctx.moveTo(r.x + rad, r.y);
    ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
    ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
    ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
    ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
    ctx.closePath();
  }

  /* ==========================================================================
     Drawing each layer
     ========================================================================== */
  // The CAD drawing on the floor. Returns the "pen": where the plotter is right now.
  function drawPlan(t, c, fade) {
    var pen = null, lift = c.lift, power = c.power;
    if (fade <= 0) return pen;
    ctx.lineCap = 'round';
    for (var i = 0; i < plan.length; i++) {
      var e = plan[i];
      if (t < e.t0) continue;
      var k = clamp((t - e.t0) / (e.t1 - e.t0), 0, 1);
      var end = k < 1 ? add(e.a, mul(sub(e.b, e.a), k)) : e.b;
      var a = project(c, e.a), b = project(c, end);
      if (!a || !b) continue;
      var st = e.st, alpha = st.a * fade * (1 - st.fade * lift) * (1 - 0.6 * power);
      if (alpha > 0.004) {
        ctx.strokeStyle = rgba(st.c, alpha);
        ctx.lineWidth = st.w * dpr;
        ctx.setLineDash(st.dash ? [st.dash[0] * dpr, st.dash[1] * dpr].concat(st.dash.length > 2 ? [st.dash[2] * dpr, st.dash[3] * dpr] : []) : []);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      if (!pen || e.t0 >= pen.t0) pen = { t0: e.t0, p: b, x: end[0], z: end[2], layer: st.layer };
    }
    ctx.setLineDash([]);
    drawLabels(t, c, fade * (1 - clamp(lift * 1.8, 0, 1)));
    return pen;
  }

  function drawLabels(t, c, fade) {
    if (fade <= 0) return;
    var size = clamp(c.f / c.dist * 0.36, 8.5 * dpr, 12 * dpr);
    ctx.font = '500 ' + size.toFixed(1) + 'px ' + MONO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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

  // The owner's own drawing, plotted onto the screen in act 1 (when provided).
  var drawingImg = null, drawingInvert = false;
  function drawOwnerDrawing(t, inner) {
    if (!drawingImg) return null;
    var a = span(t, [0.6, 1.3]) * (1 - span(t, [4.3, 5.4]));
    if (a <= 0) return null;
    var pad = 18 * dpr, bw = inner.w - pad * 2, bh = inner.h - pad * 2;
    var s = Math.min(bw / drawingImg.naturalWidth, bh / drawingImg.naturalHeight);
    var w = drawingImg.naturalWidth * s, h = drawingImg.naturalHeight * s;
    var x = inner.x + (inner.w - w) / 2, y = inner.y + (inner.h - h) / 2;
    var wipe = span(t, [0.8, 3.9]);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w * wipe, h); ctx.clip();
    ctx.globalAlpha = a;
    if (drawingInvert) ctx.filter = 'invert(1) hue-rotate(180deg)';
    ctx.drawImage(drawingImg, x, y, w, h);
    ctx.restore();
    if (wipe > 0 && wipe < 1) {
      ctx.strokeStyle = rgba(LIME, 0.8 * a);
      ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(x + w * wipe, y); ctx.lineTo(x + w * wipe, y + h); ctx.stroke();
    }
    return { p: [x + w * wipe, y + h * (0.5 + 0.35 * Math.sin(t * 3.1))], x: wipe * 30 - 15, z: Math.sin(t * 3.1) * 9, layer: 'IMPORT' };
  }

  function drawPieces(t, c) {
    var power = c.power, zNear = c.dist - 12, zFar = c.dist + 12, flashes = [];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Faces first: the stage turns solid and the LED wall lights up once the power comes on.
    if (power > 0) {
      decks.forEach(function (p) {
        if (t < p.t0 + p.dur) return;
        var q = p.top.map(function (v) { return project(c, v); });
        if (q.some(function (v) { return !v; })) return;
        ctx.fillStyle = rgba([20, 20, 23], 0.92 * power);
        ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
        for (var i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]);
        ctx.closePath(); ctx.fill();
      });
    }
    ledPanels.forEach(function (p) {
      var lit = clamp((t - (T.power[0] + 0.1 + Math.abs(p.i - 4.5) * 0.06 + (4 - p.j) * 0.04)) / 0.4, 0, 1);
      if (lit <= 0 || t < p.t0 + p.dur) return;
      var q = p.quad.map(function (v) { return project(c, v); });
      if (q.some(function (v) { return !v; })) return;
      var w = (Math.sin((p.i * 0.16 + p.j * 0.22 - t * 0.28) * Math.PI * 2) + 1) / 2;
      var col = w < 0.5 ? mix(VIOLET, TEAL, w * 2) : mix(TEAL, LIME, (w - 0.5) * 2);
      var glow = 0.55 + 0.45 * (Math.sin(p.i * 0.9 - p.j * 0.6 + t * 1.3) + 1) / 2;
      ctx.fillStyle = rgba(col, lit * glow * 0.92);
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
      for (var i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]);
      ctx.closePath(); ctx.fill();
    });

    // Wireframes, dropping in and clicking into place.
    for (var n = 0; n < pieces.length; n++) {
      var p = pieces[n], k = (t - p.t0) / p.dur;
      if (k <= 0) continue;
      var e = k >= 1 ? 1 : outBack(k), dy = (1 - e) * p.drop;
      var kind = KIND[p.kind];
      var cz = project(c, p.centre), depth = cz ? clamp(1.25 - (cz[2] - zNear) / (zFar - zNear) * 0.7, 0.4, 1) : 0.7;
      var col = p.kind === 'fixture' ? mix(kind.c, WARM, power * 0.6) : mix(kind.c, INK, power * 0.82);
      var alpha = kind.a * clamp(k * 2.2, 0, 1) * depth * lerp(1, p.kind === 'led' ? 0.35 : 0.62, power);
      ctx.beginPath();
      for (var s = 0; s < p.segs.length; s++) {
        var a = project(c, [p.segs[s][0][0], p.segs[s][0][1] + dy, p.segs[s][0][2]]);
        var b = project(c, [p.segs[s][1][0], p.segs[s][1][1] + dy, p.segs[s][1][2]]);
        if (!a || !b) continue;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = kind.w * dpr;
      ctx.stroke();
      var land = t - (p.t0 + p.dur * 0.62);
      if (land > 0 && land < 0.5) flashes.push([p, dy, 1 - land / 0.5]);
    }
    // The moment each piece lands: a short lime flash.
    if (flashes.length) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      flashes.forEach(function (f) {
        var p = f[0];
        ctx.beginPath();
        for (var s = 0; s < p.segs.length; s++) {
          var a = project(c, [p.segs[s][0][0], p.segs[s][0][1] + f[1], p.segs[s][0][2]]);
          var b = project(c, [p.segs[s][1][0], p.segs[s][1][1] + f[1], p.segs[s][1][2]]);
          if (!a || !b) continue;
          ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = rgba(LIME, 0.75 * f[2]);
        ctx.lineWidth = 2.4 * dpr;
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  function haze(c, p, r, col, alpha) {
    var s = project(c, p);
    if (!s || alpha <= 0) return;
    var g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r);
    g.addColorStop(0, rgba(col, alpha));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(s[0] - r, s[1] - r, r * 2, r * 2);
  }
  function beam(c, o, dir, len, radius, col, alpha) {
    var a = project(c, o), b = project(c, add(o, mul(dir, len)));
    if (!a || !b) return;
    var rb = radius * c.f / b[2], ra = 0.1 * c.f / a[2];
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    var g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, rgba(col, alpha));
    g.addColorStop(0.55, rgba(col, alpha * 0.32));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(a[0] + nx * ra, a[1] + ny * ra); ctx.lineTo(b[0] + nx * rb, b[1] + ny * rb);
    ctx.lineTo(b[0] - nx * rb, b[1] - ny * rb); ctx.lineTo(a[0] - nx * ra, a[1] - ny * ra);
    ctx.closePath(); ctx.fill();
    var lens = 9 * dpr, lg = ctx.createRadialGradient(a[0], a[1], 0, a[0], a[1], lens);
    lg.addColorStop(0, rgba(col, Math.min(1, alpha * 2.6)));
    lg.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(a[0], a[1], lens, 0, Math.PI * 2); ctx.fill();
  }
  function drawLight(t, c) {
    var power = c.power;
    if (power <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    haze(c, [0, 5.2, -3.4], 0.6 * H, mix(VIOLET, TEAL, 0.35), 0.11 * power);
    haze(c, [0, 1.6, 3.2], 0.42 * H, LIME, 0.035 * power);
    lights.forEach(function (f) {
      var on = clamp((t - (T.power[0] + 0.25 + f.n * 0.075)) / 0.45, 0, 1) * power;
      if (on <= 0) return;
      var pan = Math.sin(t * 0.5 + f.n * 0.9) * 0.5, tilt = 0.42 + 0.28 * Math.sin(t * 0.33 + f.n * 1.3);
      var toward = f.group ? -0.55 : 1;
      var dir = norm([Math.sin(pan) * Math.sin(tilt), -Math.cos(tilt), toward * Math.cos(pan) * Math.sin(tilt)]);
      var col = f.group ? (f.n % 2 ? VIOLET : TEAL) : (f.n % 2 ? WARM : LIME);
      beam(c, f.origin, dir, 10.5, 1.5, col, 0.34 * on);
    });
    ctx.restore();
  }

  // The last act: the real event, when photos are provided.
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

  // The computer screen around the drawing: window bar, tools, status bar, title block, crosshair.
  function drawChrome(t, r, open, pen) {
    var k = span(t, T.chrome) * clamp(1 - open * 1.6, 0, 1);
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
    for (var i = 0; i < 3; i++) {
      ctx.fillStyle = rgba(INK, 0.2);
      ctx.beginPath(); ctx.arc(r.x + (16 + i * 14) * d, r.y + m.top / 2, 4 * d, 0, Math.PI * 2); ctx.fill();
    }
    ctx.textBaseline = 'middle';
    ctx.font = '500 ' + (11 * d).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = rgba(INK, 0.62); ctx.textAlign = 'center';
    ctx.fillText(drawingImg ? 'event_drawing  —  import' : 'event_plan.dwg  —  Plan view', r.x + r.w / 2, r.y + m.top / 2);
    if (r.w > 460 * d) { ctx.textAlign = 'right'; ctx.fillStyle = rgba(MUTED, 0.7); ctx.fillText('SCALE 1:100', r.x + r.w - 14 * d, r.y + m.top / 2); }
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
    ctx.textAlign = 'left';
    ctx.fillStyle = rgba(MUTED, 0.85);
    var wide = r.w > 560 * d;
    var status = pen ? 'X ' + pen.x.toFixed(3) + '    Z ' + pen.z.toFixed(3) + (wide ? '        SNAP   GRID   ORTHO' : '') + '        LAYER: ' + pen.layer : 'READY';
    ctx.fillText(status, r.x + m.left + 12 * d, r.y + r.h - m.bot / 2);
    // title block
    var ta = span(t, [3.35, 3.8]);
    if (ta > 0 && m.inner.w > 620 * d && !drawingImg) {
      var bw = 214 * d, bh = 66 * d, bx = r.x + r.w - 14 * d - bw, by = r.y + r.h - m.bot - 14 * d - bh;
      ctx.globalAlpha = k * ta;
      ctx.fillStyle = 'rgba(11,11,12,0.88)'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = rgba(INK, 0.3); ctx.lineWidth = d; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.beginPath(); ctx.moveTo(bx, by + bh / 3); ctx.lineTo(bx + bw, by + bh / 3); ctx.moveTo(bx, by + 2 * bh / 3); ctx.lineTo(bx + bw, by + 2 * bh / 3); ctx.stroke();
      ctx.font = '700 ' + (11 * d).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(INK, 0.95);
      ctx.fillText('UNCONVENTIONAL', bx + 10 * d, by + bh / 6);
      ctx.font = '500 ' + (10 * d).toFixed(1) + 'px ' + MONO; ctx.fillStyle = rgba(MUTED, 0.9);
      ctx.fillText('GROUND SUPPORT  ·  PLAN VIEW', bx + 10 * d, by + bh / 2);
      ctx.fillStyle = rgba(LIME, 0.95);
      ctx.fillText('SCALE 1:100       DWG 001', bx + 10 * d, by + 5 * bh / 6);
    }
    // crosshair
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
    // bezel
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = 'rgba(244,241,234,0.16)'; ctx.lineWidth = d;
    roundRect(r, rad); ctx.stroke();
    ctx.restore();
  }

  /* ==========================================================================
     A frame of the film
     ========================================================================== */
  var lastAct = '', lastEnd = null;
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var c = camera(t), open = inOut(span(t, T.open));
    var r = { x: lerp(screen.x, 0, open), y: lerp(screen.y, 0, open), w: lerp(screen.w, W, open), h: lerp(screen.h, H, open) };
    var appear = span(t, T.chrome), coveredByPhotos = photos.length && t > T.photos + 1.7;

    ctx.save();
    roundRect(r, 14 * dpr * (1 - open)); ctx.clip();
    if (open < 1) { ctx.fillStyle = rgba([15, 15, 17], (1 - open) * appear); ctx.fillRect(r.x, r.y, r.w, r.h); }
    var pen = null;
    if (!coveredByPhotos) {
      pen = drawPlan(t, c, appear * (drawingImg ? span(t, [4.1, 5.2]) : 1));
      pen = drawOwnerDrawing(t, chrome(r).inner) || pen;
      drawPieces(t, c);
      drawLight(t, c);
    }
    drawPhotos(t);
    ctx.restore();
    drawChrome(t, r, open, pen);

    var act = t < T.lift[0] ? 'concept' : t < T.power[0] ? 'build' : 'reality';
    if (act !== lastAct) { section.setAttribute('data-act', act); lastAct = act; }
    var ended = t >= T.end;
    if (ended !== lastEnd) { section.classList.toggle('is-end', ended); lastEnd = ended; }
    if (progressEl) progressEl.style.transform = 'scaleX(' + clamp(t / T.end, 0, 1).toFixed(4) + ')';
  }

  /* ==========================================================================
     Clock, size, visibility and the motion control
     ========================================================================== */
  var filmT = 0, raf = 0, last = 0, inView = true;
  var start = parseFloat(new URLSearchParams(window.location.search).get('film'));
  if (!isNaN(start) && start >= 0) filmT = start;

  function paused() { return root.classList.contains('motion-paused'); }
  function running() { return inView && !document.hidden && !paused(); }
  function stillTime() { return photos.filter(Boolean).length ? T.photos + 2 : T.still; }
  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    filmT += dt;
    render(filmT);
    if (running()) raf = window.requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf && running()) { last = 0; raf = window.requestAnimationFrame(frame); } }
  function halt() { if (raf) window.cancelAnimationFrame(raf); raf = 0; last = 0; render(filmT); }

  function resize() {
    var box = section.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(box.width)), cssH = Math.max(1, Math.round(box.height));
    dpr = Math.min(window.devicePixelRatio || 1, cssW < 700 ? 1.5 : 2);
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
    img.onerror = function () { console.warn('[intro] "' + name + '" is marked ready but ' + slot.src + ' did not load.'); };
    img.src = slot.src;
  }

  function startRender() {
    section.classList.remove('has-film');
    loadImage('intro-drawing', function (img, slot) { drawingImg = img; drawingInvert = !!slot.invert; });
    ['intro-photo-1', 'intro-photo-2', 'intro-photo-3', 'intro-photo-4'].forEach(function (name, i) {
      loadImage(name, function (img) {
        photos[i] = img;
        if (paused() && filmT < stillTime()) filmT = stillTime();
      });
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
      if (paused() && motionToggle) motionToggle.click();   // main.js flips the class, saves the choice and relabels the button
      render(0);
      kick();
    });
    kick();
  }

  /* ---- A produced film, when there is one ------------------------------- */
  var filmSlot = slots.intro;
  var video = filmSlot && filmSlot.status === 'ready' ? section.querySelector('[data-slot="intro"] video') : null;
  if (video) {
    section.classList.add('has-film');
    var endAt = +filmSlot.endAt || 0;
    var check = function () { section.classList.toggle('is-end', video.currentTime >= endAt); };
    video.addEventListener('timeupdate', check);
    video.addEventListener('error', function () { startRender(); }, { once: true });
    if (replayBtn) replayBtn.addEventListener('click', function () {
      if (paused() && motionToggle) motionToggle.click();
      video.currentTime = 0;
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
    });
    check();
  } else {
    startRender();
  }
})();
