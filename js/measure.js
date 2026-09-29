/* ==========================================================================
   Visit measurement (HubSpot). Loaded on the public pages only; nothing else on the site depends on it, so a page
   works the same when it is blocked. Plain JS, no inline code: the pages' Content-Security-Policy allows exactly the
   HubSpot addresses this needs, and nothing more.

   1. Adds HubSpot's standard tracking code (id "hs-script-loader") once the page has finished loading, or after
      3 s at the latest, so it never competes with the film or the page's own files.
   2. Loads nothing at all when:
      - the visitor has turned measurement off on privacy.html (HubSpot's own opt-out cookie, __hs_do_not_track);
      - the browser sends Global Privacy Control or Do Not Track;
      - the device is set to a time zone in Europe or in an EU region elsewhere (EU/EEA and UK law asks for consent
        first; there is no consent banner, so no measurement there at all; privacy.html says so);
      - the browser blocks cookies for this site (HubSpot's opt-out cookie, and the switch on privacy.html, could not
        work there, so that counts as a no; privacy.html says so);
      - the page is not served from unconventional.pro (local previews never count as visits). Add ?measure=test
        to a local address to load it there anyway, for testing; the rules above still apply.
   3. Runs the "Turn off measurement" control on privacy.html ([data-measure]).
   ========================================================================== */
(function () {
  'use strict';

  var LOADER = 'https://js-na2.hs-scripts.com/247534008.js';
  var OPT_OUT = '__hs_do_not_track';
  var PROBE = '__measure_check'; // the one-moment cookie test (cookiesKept)
  var HS_COOKIES = ['__hstc', 'hubspotutk', '__hssc', '__hssrc'];
  var HALF_YEAR = 15552000; // 180 days, the lifetime HubSpot gives its own opt-out cookie
  var live = /(^|\.)unconventional\.pro$/.test(window.location.hostname);
  var test = /[?&]measure=test(&|$)/.test(window.location.search);

  // Reading document.cookie can throw where cookies are off (sandboxed or opaque pages): that reads as no cookie.
  function hasCookie(name) {
    try { return new RegExp('(?:^|;\\s*)' + name + '=').test(document.cookie); } catch (e) { return false; }
  }

  // Every domain a cookie readable here can sit on: host-only first, then this host and its parents (not the TLD).
  function cookieDomains() {
    var parts = window.location.hostname.split('.');
    var list = [''];
    for (var i = 0; i < parts.length - 1; i++) list.push(parts.slice(i).join('.'));
    return list;
  }

  function clearCookie(name) {
    cookieDomains().forEach(function (domain) {
      document.cookie = name + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (domain ? '; domain=' + domain : '');
    });
  }

  function privacySignal() {
    var n = window.navigator || {};
    return n.globalPrivacyControl === true || n.doNotTrack === '1' || n.doNotTrack === 'yes' || window.doNotTrack === '1';
  }

  // IANA time zones in Europe, plus the EU's regions elsewhere (Azores, Madeira, Canaries, Ceuta and Melilla, Cyprus,
  // the French overseas regions) and Svalbard. Wider than the law needs, on purpose.
  function europeanTimeZone() {
    var zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* old browser: no zone */ }
    return /^(Europe\/.+|Atlantic\/(Azores|Canary|Faroe|Madeira|Reykjavik)|Africa\/Ceuta|Arctic\/Longyearbyen|Asia\/(Nicosia|Famagusta)|Indian\/(Reunion|Mayotte)|America\/(Guadeloupe|Martinique|Cayenne|Marigot))$/.test(zone);
  }

  // Whether this browser keeps a cookie for this site. Where it doesn't, HubSpot's opt-out cookie (and the switch on
  // privacy.html) couldn't work, so blocking cookies counts as a no. Checked once per page: a session cookie is
  // written, read back and deleted at once.
  var cookieCheck;
  function cookiesKept() {
    if (cookieCheck === undefined) {
      cookieCheck = false;
      try {
        if (window.navigator.cookieEnabled !== false) {
          document.cookie = PROBE + '=1; path=/; SameSite=Lax';
          cookieCheck = hasCookie(PROBE);
          document.cookie = PROBE + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } catch (e) { /* no cookie access at all: a no */ }
    }
    return cookieCheck;
  }

  // Why measurement is off here, or 'on'.
  function state() {
    if (privacySignal()) return 'signal';
    if (europeanTimeZone()) return 'region';
    if (hasCookie(OPT_OUT)) return 'off';
    if (!cookiesKept()) return 'cookies';
    if (!live && !test) return 'local';
    return 'on';
  }

  /* ---- 1. Load HubSpot's tracking code, once, after the page ----------- */
  var tried = false;
  function load() {
    if (tried) return;
    tried = true;
    if (state() !== 'on' || document.getElementById('hs-script-loader')) return;
    // Keep HubSpot's cookies on www.unconventional.pro only. By default HubSpot writes them to .unconventional.pro,
    // which would also send the visitor ID to every subdomain (pay.unconventional.pro is GoDaddy's payment links).
    (window._hsq = window._hsq || []).push(['setCookiesToSubdomain', true]);
    var script = document.createElement('script');
    script.id = 'hs-script-loader';
    script.async = true;
    script.src = LOADER;
    document.body.appendChild(script);
  }

  if (document.readyState === 'complete') {
    setTimeout(load, 0);
  } else {
    window.addEventListener('load', function () { setTimeout(load, 0); });
    setTimeout(load, 3000);
  }

  /* ---- 3. The control on privacy.html ---------------------------------- */
  var box = document.querySelector('[data-measure]');
  if (!box) return;
  var status = box.querySelector('[data-measure-state]');
  var toggle = box.querySelector('[data-measure-toggle]');
  var words = {
    on: 'Measurement is on in this browser.',
    off: 'Measurement is off in this browser. A small cookie keeps that choice for six months.',
    signal: 'Your browser sends a privacy signal, so this site measures nothing here.',
    region: 'Your device is set to a time zone in Europe or in an EU region elsewhere, so this site measures nothing here.',
    cookies: 'Your browser blocks cookies, so this site measures nothing here.',
    local: 'Measurement only runs on www.unconventional.pro.'
  };

  function render() {
    var now = state();
    status.textContent = words[now];
    toggle.hidden = now === 'signal' || now === 'region' || now === 'cookies';
    toggle.textContent = now === 'off' ? 'Turn measurement back on' : 'Turn off measurement';
  }

  // HubSpot records presses on buttons at pointer-down, before 'click' fires. Opt out first, at the window's capture
  // phase (ahead of HubSpot's own listener on the button), so the press that switches measurement off is never sent.
  var switchingOff = false;
  function optOutEarly(e) {
    if (switchingOff || !e.target || !e.target.closest || !e.target.closest('[data-measure-toggle]')) return;
    if (state() !== 'on') return;
    switchingOff = true;
    document.cookie = OPT_OUT + '=yes; path=/; max-age=' + HALF_YEAR + '; SameSite=Lax' + (window.location.protocol === 'https:' ? '; Secure' : '');
    (window._hsq = window._hsq || []).push(['doNotTrack']);
  }
  ['pointerdown', 'mousedown', 'touchstart'].forEach(function (type) {
    window.addEventListener(type, optOutEarly, { capture: true, passive: true });
  });

  toggle.addEventListener('click', function () {
    if (switchingOff) {
      // The opt-out was set at pointer-down: finish it (clear HubSpot's visitor cookies) rather than toggling back on.
      switchingOff = false;
      HS_COOKIES.forEach(clearCookie);
    } else if (hasCookie(OPT_OUT)) {
      clearCookie(OPT_OUT);
      if (window._hsq) window._hsq.push(['doNotTrack', { track: true }]);
    } else {
      document.cookie = OPT_OUT + '=yes; path=/; max-age=' + HALF_YEAR + '; SameSite=Lax' + (window.location.protocol === 'https:' ? '; Secure' : '');
      // If HubSpot is already running on this page, tell it too; then clear its visitor cookies.
      (window._hsq = window._hsq || []).push(['doNotTrack']);
      HS_COOKIES.forEach(clearCookie);
    }
    render();
  });

  render();
  box.hidden = false;
})();
