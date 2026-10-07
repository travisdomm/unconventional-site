/* ==========================================================================
   Unconventional — the end reel's hook (the home page, live since 2026-10-06; and preview-end.html)
   Hands the background over from the home film to the end reel (js/endreel.js)
   without touching js/film3.js: it only watches what film3.js already does.

   film3.js's end state, read from the page:
     - section[data-intro] gets .is-end once the last segment reaches its
       title time (the title card comes up), and
     - the owner's image of the logo (img.intro__final, placed by film3.js in
       CSS px with style left/top/width/height) is fully in: style.opacity "1".
   Then, after a short rest on the logo with the card up (REST), the reel is
   mounted in the film's media box (.intro__media, above the film's own
   layers and under the scrim and the card), laid out on exactly that image's
   place, and faded in on its first frame, which IS that image (so the hand-
   over cannot be seen). It then loops behind the card. Replay (or anything
   that takes .is-end away) fades it out and rests it; the film plays again.
   The reel is mounted (at rest) in idle time as soon as the image is in,
   told the image's place up front (so it lays itself out once), and makes
   what it needs later (the wall's words, the beams' haze) in idle time
   during the rest (reel.prepare), a few milliseconds at a time: neither the
   poll tick, nor a click on Play motion, nor the hand-over does heavy work.
   ?reel           skips the film straight to its end and starts the reel at once
   ?reel=7.5       ... and starts the reel at that second
   Motion stopped (Pause motion, or reduced motion without "Play motion"): the reel does not take over at all; the
   film's own still (the owner's logo, with the card) stays. That holds if Pause is pressed during the rest on the
   logo or while the reel's first frame is loading, too: it never fades in. Pressing "Play motion" arms the hand-over
   (1 s on the logo, then the reel). Pausing once the reel is up shows the reel's one designed still (endreel.js,
   STILL), and a resize or a turn while paused redraws that still.
   Resizes: the reel is mounted with relay: true, so it does not listen for them itself; this hook relays each burst
   once it settles (60 ms, and again at 0.7 s and 2 s for film3.js's image swap after a turn), as one relayout with
   the new image place. A resting reel is not laid out or drawn at all.
   ========================================================================== */
(function () {
  'use strict';

  var REST = 2.0;     // seconds on the logo, with the card up, before the reel takes over
  var FADE = 0.6;     // the canvas's fade in and out (its first frame is the logo itself)

  try {
    var section = document.querySelector('[data-intro]');
    if (!section || !window.EndReel) return;
    var q = new URLSearchParams(window.location.search);
    var skipTo = q.has('reel') ? Math.max(0, parseFloat(q.get('reel')) || 0) : null;
    var header = document.querySelector('[data-header]'), endInner = section.querySelector('.intro__end-inner');
    var wrap = null, reel = null, state = 'idle', timer = 0, poll = 0, img = null;

    // the owner's image as the film shows it now: on screen and fully in (or null)
    function finalImg() {
      var list = section.querySelectorAll('img.intro__final');
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (e.complete && e.naturalWidth > 0 && e.style.opacity === '1' && e.style.width) return e;
      }
      return null;
    }
    function kindOf(e) { return e._kind === 'tall' || e._kind === 'wide' ? e._kind : /9x16/.test(e.currentSrc || e.src) ? 'tall' : 'wide'; }
    function rectOf(e) {
      return { x: parseFloat(e.style.left) || 0, y: parseFloat(e.style.top) || 0, w: parseFloat(e.style.width) || 1, h: parseFloat(e.style.height) || 1, kind: kindOf(e) };
    }
    // the room the page leaves the image, as film3.js measures it: the header's height, and the card's top seen from
    // the bottom of the film (CSS px)
    function room() {
      var head = header ? Math.round(header.getBoundingClientRect().height) || 76 : 76;
      var r = endInner ? Math.max(0, Math.round(section.getBoundingClientRect().bottom - endInner.getBoundingClientRect().top)) : -1;
      return { head: head, room: r };
    }
    function images() {
      var s = (window.MEDIA_SLOTS || {})['film-s4-03'] || {};
      return { wide: [s.finalSmall, s.final].filter(Boolean), tall: [s.finalTallSmall, s.finalTall].filter(Boolean) };
    }
    function box() { return section.querySelector('.intro__media') || section; }

    function ensure() {
      if (reel) return reel;
      wrap = document.createElement('div');
      wrap.className = 'intro__endreel';
      wrap.setAttribute('aria-hidden', 'true');
      var st = wrap.style;
      st.position = 'absolute'; st.left = '0'; st.top = '0'; st.right = '0'; st.bottom = '0';
      st.zIndex = '2147483000';   // above every layer film3.js raises in the media box
      st.pointerEvents = 'none'; st.opacity = '0';
      st.transition = 'opacity ' + FADE + 's cubic-bezier(.2, .7, .2, 1)';
      var b = box();
      if (b === section) { st.zIndex = '1'; section.insertBefore(wrap, section.querySelector('.intro__scrim')); }
      else b.appendChild(wrap);
      var m = room();
      // (relay: the reel does not listen for resizes itself; this hook relays them, with the new layout, in one pass)
      // (and the image's place, when it is known, so the reel lays itself out once: mount reads it before its first layout)
      reel = window.EndReel.mount(wrap, { images: images(), head: m.head, room: m.room, rect: img ? rectOf(img) : undefined, active: false, watch: section, relay: true });
      return reel;
    }
    function layout() {
      if (!reel || !img) return;
      var m = room();
      reel.relayout({ head: m.head, room: m.room, rect: rectOf(img) });   // (the new size and layout in one pass)
    }

    // Motion stopped, as the rest of the site decides it (main.js): "Pause motion" (html.motion-paused), or the system's
    // reduced-motion setting unless the visitor chose "Play motion" here. Then the reel never takes over: the film's
    // own still (the owner's logo, with the card) simply stays. If the visitor presses "Play motion", the hand-over is
    // armed from that moment (a short rest, then the reel).
    var ROOT = document.documentElement, RMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function stopped() {
      if (ROOT.classList.contains('motion-paused')) return true;
      if (!RMQ || !RMQ.matches) return false;
      try { return window.localStorage.getItem('motion') !== 'playing'; } catch (e) { return true; }
    }
    var PLAY_REST = 1.0;   // seconds on the logo after "Play motion" before the reel takes over
    function hold() { clearTimeout(timer); timer = 0; state = 'held'; }
    // mounting the reel and preparing it is done in idle time, never inside a poll tick or a click (it lays itself out
    // and makes the photo's layers in short idle steps of its own after that)
    function idle(fn) { if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 500 }); else setTimeout(fn, 0); }
    function prepareSoon() { idle(function () { if (state !== 'resting') return; if (ensure()) { layout(); if (reel.prepare) reel.prepare(); } }); }
    function motionChanged() {
      if (stopped()) {
        // Pause pressed before the reel is on screen (during the rest on the logo, or while its first frame loads):
        // it does not take over at all, now or when it is ready; the film's own still stays until "Play motion"
        if (state === 'resting' || state === 'loading') hold();
        return;
      }
      if (state === 'held') {
        state = 'resting'; timer = setTimeout(takeOver, PLAY_REST * 1000);
        prepareSoon();   // (prepared during the short rest, in idle time: not inside the click)
      }
    }

    // the film is at its end: wait for the image to be fully in, rest on it, then hand over
    function arm() {
      if (state !== 'idle') return;
      state = 'arming';
      clearInterval(poll);
      poll = setInterval(function () {
        if (!section.classList.contains('is-end')) { release(); return; }
        var e = finalImg();
        if (!e) return;
        clearInterval(poll); poll = 0;
        img = e;
        if (stopped()) { hold(); return; }
        // mount the reel now, at rest (in idle time), and let it lay itself out and prepare the photo's keys in idle time
        // during the rest on the logo, so the hand-over itself does no heavy work (endreel.js: prepare)
        state = 'resting';
        timer = setTimeout(takeOver, skipTo != null ? 0 : REST * 1000);
        prepareSoon();
      }, 100);
    }
    function takeOver() {
      timer = 0;
      if (!section.classList.contains('is-end') || !ensure()) { release(); return; }
      if (stopped()) { hold(); return; }
      img = finalImg() || img;
      layout();
      var t0 = skipTo != null ? skipTo : 0, tries = 0;
      reel.frame(t0);
      state = 'loading';
      // its first frame is the owner's image: show it only once its copy has loaded (it is the same file, so this
      // is normally at once); without it after 3 s, carry on (the reel opens on its drawing of the logo instead)
      (function ready() {
        if (state !== 'loading') return;
        if (stopped()) { hold(); return; }   // (motion stopped while it loaded: it stays on the logo)
        if (!reel.isReady() && ++tries < 30) { timer = setTimeout(ready, 100); return; }
        timer = 0; state = 'on';
        reel.activate(true, t0);
        wrap.style.opacity = '1';
        section.classList.add('has-endreel');
        skipTo = null;
      })();
    }
    function release() {
      clearInterval(poll); poll = 0; clearTimeout(timer); timer = 0;
      if (state === 'idle') return;
      state = 'idle'; img = null;
      section.classList.remove('has-endreel');
      if (reel) { reel.activate(false); wrap.style.opacity = '0'; setTimeout(function () { if (state === 'idle' && reel) reel.frame(0); }, FADE * 1000 + 50); }
    }
    function check() { if (section.classList.contains('is-end')) arm(); else release(); }

    new MutationObserver(check).observe(section, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(motionChanged).observe(ROOT, { attributes: true, attributeFilter: ['class'] });
    if (RMQ && RMQ.addEventListener) RMQ.addEventListener('change', motionChanged);
    // a new size (or a phone turned): film3.js re-fits its image, and after a turn swaps to the other image once that
    // has loaded; the reel follows it (read again shortly after, and once more when the new image may have arrived).
    // A burst of resize events (a window being dragged) restarts the timers, so the reel is laid out once it settles;
    // a resting reel is not laid out at all (it is when it takes over)
    var relay = [];
    window.addEventListener('resize', function () {
      relay.forEach(clearTimeout);
      relay = [60, 700, 2000].map(function (ms) {
        return setTimeout(function () { if (state === 'on' || state === 'loading') { img = finalImg() || img; layout(); } }, ms);
      });
    });
    check();

    // ?reel: skip the film to its end (as the Skip button does) once film3.js is running
    if (skipTo != null) {
      var skip = section.querySelector('[data-intro-skip]');
      if (skip && !section.classList.contains('is-end')) setTimeout(function () { skip.click(); }, 0);
    }

    // review handle (the app's browser pane runs no animation frames while hidden)
    window.__endreelHook = { state: function () { return state; }, takeOver: takeOver, release: release, reel: function () { return reel; } };
  } catch (e) {
    try { console.warn('[endreel] the hook could not start: ' + (e && e.message)); } catch (e2) { /* no console */ }
  }
})();
