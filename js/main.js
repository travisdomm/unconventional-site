/* ==========================================================================
   Unconventional — site behaviour. Plain JS, no dependencies, no build step.

   1. Media slots   – renders content/media.js into the [data-slot] elements
   2. Motion        – in-view autoplay, the "Pause motion" control
   3. Header + nav  – scrolled state, mobile menu
   4. Brand wall    – renders content/brands.js into the scrolling strip
   5. Scroll reveal
   6. Dev overlay   – add ?dev to the URL
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var slots = window.MEDIA_SLOTS || {};
  var dev = root.classList.contains('dev');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var slotEls = [].slice.call(document.querySelectorAll('[data-slot]'));
  var loopingVideos = [];

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: preferences just won't persist */ }
    return null;
  }

  /* ---- 1. Media slots --------------------------------------------------- */
  function buildImage(el, name, src, alt) {
    var img = document.createElement('img');
    img.alt = alt || '';
    img.decoding = 'async';
    if (name === 'hero') img.fetchPriority = 'high';
    else img.loading = 'lazy';
    img.addEventListener('load', function () { el.classList.add('is-loaded'); });
    img.addEventListener('error', function () {
      img.remove();
      el.classList.remove('is-loaded');
      console.warn('[slots] "' + name + '" is marked ready but ' + src + ' did not load. Showing the placeholder.');
    });
    img.src = src;
    return img;
  }

  function buildVideo(el, name, slot, mode) {
    var video = document.createElement('video');
    var markLoaded = function () { el.classList.add('is-loaded'); };

    video.playsInline = true;
    video.setAttribute('playsinline', '');
    if (slot.poster) {
      video.poster = slot.poster;
      var probe = new Image();
      probe.onload = markLoaded;
      probe.src = slot.poster;
    }

    if (mode === 'player') {
      video.controls = true;
      video.preload = slot.poster ? 'none' : 'metadata';
      if (slot.alt) video.setAttribute('aria-label', slot.alt);
      video.addEventListener('loadedmetadata', markLoaded);
    } else {
      // Decorative loop: silent, no controls, plays only while on screen.
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.loop = true;
      video.preload = 'metadata';
      video.disablePictureInPicture = true;
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('loadeddata', markLoaded);
      loopingVideos.push(video);
    }

    video.addEventListener('error', function () {
      var i = loopingVideos.indexOf(video);
      if (i > -1) loopingVideos.splice(i, 1);
      video.remove();
      el.classList.remove('is-loaded');
      console.warn('[slots] "' + name + '" is marked ready but ' + slot.src + ' did not load.');
      if (slot.poster) el.appendChild(buildImage(el, name, slot.poster, slot.alt));
    });

    video.src = slot.src;
    return video;
  }

  slotEls.forEach(function (el) {
    var name = el.getAttribute('data-slot');
    var slot = slots[name];
    if (!slot) {
      console.warn('[slots] "' + name + '" is used in the HTML but missing from content/media.js');
      return;
    }
    if (slot.status !== 'ready' || !slot.src) return;
    var mode = el.getAttribute('data-slot-mode') || 'inline';
    el.appendChild(slot.type === 'video'
      ? buildVideo(el, name, slot, mode)
      : buildImage(el, name, slot.src, slot.alt));
  });

  /* ---- 2. Motion -------------------------------------------------------- */
  // Respect the OS "reduce motion" setting unless the visitor has chosen otherwise here.
  if (reduceMotion.matches && store('motion') === null) root.classList.add('motion-paused');

  function motionPaused() { return root.classList.contains('motion-paused'); }

  function syncVideo(video) {
    if (video._inView && !motionPaused()) {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { /* autoplay refused: poster stays */ });
    } else {
      video.pause();
    }
  }

  if ('IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target._inView = entry.isIntersecting;
        syncVideo(entry.target);
      });
    }, { rootMargin: '160px 0px' });
    loopingVideos.forEach(function (video) { videoObserver.observe(video); });
  } else {
    loopingVideos.forEach(function (video) { video._inView = true; syncVideo(video); });
  }

  var motionToggle = document.querySelector('[data-motion-toggle]');
  if (motionToggle) {
    var motionLabel = motionToggle.querySelector('[data-motion-label]');
    var paintMotionToggle = function () {
      var paused = motionPaused();
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion');
      if (motionLabel) motionLabel.textContent = paused ? 'Play motion' : 'Pause motion';
    };
    motionToggle.addEventListener('click', function () {
      root.classList.toggle('motion-paused');
      store('motion', motionPaused() ? 'paused' : 'playing');
      paintMotionToggle();
      loopingVideos.forEach(syncVideo);
    });
    paintMotionToggle();
  }

  /* ---- 3. Header + nav -------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var paintHeader = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', paintHeader, { passive: true });
    paintHeader();
  }

  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    var setNav = function (open) {
      root.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', function () { setNav(!root.classList.contains('nav-open')); });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (event) {
      if (!root.classList.contains('nav-open')) return;
      if (event.key === 'Escape') {
        setNav(false);
        navToggle.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      // Keep keyboard focus inside the open menu (toggle <-> links).
      var links = nav.querySelectorAll('a');
      var last = links[links.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        navToggle.focus();
      } else if (event.shiftKey && document.activeElement === navToggle) {
        event.preventDefault();
        last.focus();
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (event) {
      if (event.matches) setNav(false);
    });
  }

  /* ---- 4. Brand wall ---------------------------------------------------- */
  // Only confirmed brands with a logo file are rendered; the strip stays hidden otherwise.
  var brandsSection = document.querySelector('[data-brands]');
  var brandsList = document.querySelector('[data-brands-list]');
  var brands = (window.BRANDS || []).filter(function (brand) {
    return brand && brand.status === 'confirmed' && brand.logo && brand.name;
  });

  if (brandsSection && brandsList && brands.length) {
    brands.forEach(function (brand) {
      var item = document.createElement('li');
      var img = document.createElement('img');
      img.className = 'brand-logo';
      img.src = brand.logo;
      img.alt = brand.name;
      img.decoding = 'async';
      img.addEventListener('load', scheduleMarquee);
      item.appendChild(img);
      brandsList.appendChild(item);
    });
    brandsSection.hidden = false;
  }

  var track = document.querySelector('[data-marquee]');
  var marqueeTimer;
  function scheduleMarquee() {
    clearTimeout(marqueeTimer);
    marqueeTimer = setTimeout(buildMarquee, 150);
  }
  function buildMarquee() {
    if (!track || !track.children.length) return;
    var group = track.children[0];
    if (!group.children.length) return;
    while (track.children.length > 1) track.removeChild(track.lastChild);
    var groupWidth = group.getBoundingClientRect().width;
    if (!groupWidth) return;
    // Even number of identical groups, at least two screens wide, so sliding by -50% is seamless.
    var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / groupWidth));
    if (copies % 2) copies += 1;
    for (var i = 1; i < copies; i++) {
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    track.style.animationDuration = Math.round((groupWidth * copies) / 2 / 70) + 's'; // ~70px per second
  }
  if (track) {
    window.addEventListener('resize', scheduleMarquee);
    window.addEventListener('load', scheduleMarquee);
    buildMarquee();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMarquee);
  }

  /* ---- 5. Scroll reveal ------------------------------------------------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  var finishReveal = function (el) {
    // Drop the reveal classes afterwards so they never fight an element's own hover transitions.
    el.classList.remove('reveal', 'is-visible');
    el.style.removeProperty('--reveal-delay');
  };
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    revealEls.forEach(finishReveal);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        revealObserver.unobserve(el);
        el.addEventListener('transitionend', function done(event) {
          if (event.target !== el || event.propertyName !== 'opacity') return;
          el.removeEventListener('transitionend', done);
          finishReveal(el);
        });
        el.classList.add('is-visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) {
      var siblings = [].filter.call(el.parentNode.children, function (node) {
        return node.classList.contains('reveal');
      });
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 4) * 90 + 'ms');
      revealObserver.observe(el);
    });
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---- 6. Dev overlay (?dev) -------------------------------------------- */
  if (dev) buildDevOverlay();

  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function buildDevOverlay() {
    var placed = {};

    slotEls.forEach(function (el) {
      var name = el.getAttribute('data-slot');
      var slot = slots[name];
      placed[name] = el;
      var chip = node('span', 'slot-chip' + (slot && slot.status === 'ready' ? ' is-ready' : ''));
      chip.appendChild(node('i'));
      var label = node('span');
      label.appendChild(node('b', '', name));
      label.appendChild(document.createTextNode(slot ? ' · ' + slot.type + ' · ' + slot.status : ' · missing from content/media.js'));
      chip.appendChild(label);
      el.appendChild(chip);
    });

    var names = Object.keys(slots);
    var ready = names.filter(function (name) { return slots[name].status === 'ready'; }).length;
    var standIns = document.querySelectorAll('[data-placeholder]').length;
    var robots = document.querySelector('meta[name="robots"]');
    var blocked = !!robots && /noindex/i.test(robots.getAttribute('content') || '');

    var panel = node('aside', 'dev-panel');
    panel.setAttribute('aria-label', 'Site readiness (dev only)');
    var bar = node('button', 'dev-panel__bar');
    bar.type = 'button';
    bar.appendChild(node('span', '', 'Site readiness'));
    bar.appendChild(node('span', '', ready + '/' + names.length + ' media · ' + brands.length + ' brands'));
    bar.addEventListener('click', function () {
      panel.classList.toggle('is-collapsed');
      store('dev-panel', panel.classList.contains('is-collapsed') ? 'collapsed' : 'open');
    });
    if (store('dev-panel') === 'collapsed') panel.classList.add('is-collapsed');

    var body = node('div', 'dev-panel__body');
    var stats = node('div', 'dev-panel__stats');
    stats.appendChild(node('div', ready === names.length ? 'ok' : 'warn', 'Media slots filled: ' + ready + ' of ' + names.length));
    stats.appendChild(node('div', brands.length ? 'ok' : 'warn', 'Brand wall: ' + brands.length + ' confirmed brand' + (brands.length === 1 ? '' : 's') + (brands.length ? '' : ' (strip hidden)')));
    stats.appendChild(node('div', standIns ? 'warn' : 'ok', 'Stand-in copy left: ' + standIns + (standIns ? ' (dashed outlines)' : '')));
    stats.appendChild(node('div', blocked ? 'warn' : 'ok', blocked ? 'Search engines: BLOCKED (noindex is on)' : 'Search engines: allowed'));
    body.appendChild(stats);

    var list = node('div', 'dev-panel__list');
    names.forEach(function (name) {
      var slot = slots[name];
      var item = node('button', 'dev-panel__item' + (slot.status === 'ready' ? ' is-ready' : ''));
      item.type = 'button';
      item.appendChild(node('i'));
      var where = placed[name] ? '' : (slot.offPage ? ' (not shown on the page)' : ' (NOT PLACED in the HTML)');
      item.appendChild(node('b', '', name + ' · ' + slot.status + where));
      item.appendChild(node('span', '', slot.spec || ''));
      if (placed[name]) {
        item.addEventListener('click', function () {
          placed[name].scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      list.appendChild(item);
    });
    body.appendChild(list);

    panel.appendChild(bar);
    panel.appendChild(body);
    document.body.appendChild(panel);
  }
})();
