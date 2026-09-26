/* ==========================================================================
   TEMPORARY FRONT DOOR — js/gate.js

   A curtain, not a lock: this check runs in the visitor's browser and the
   site's files are public, so it keeps casual visitors out and nothing more.
   The login and password are not written here in plain text: only their
   salted SHA-256 fingerprints are, so a look at the source does not hand
   them over.

   The door is ALWAYS the front page, even for visitors who are already in
   (the owner's call, 2026-09-25): they see it too, plus a "walk straight in"
   link, so "don't make me log in again" means no typing, not no door.
   Inner pages and direct links skip the door for them (js/guard.js).
   ?next=about.html (set by js/guard.js) sends people back to the page they
   were trying to open.

   To take the gate down: copy home.html over index.html, remove the gate
   lines and the temporary "noindex" tag from the heads of index.html and
   about.html, point about.html's three home.html links back at "./", and
   delete js/gate.js, js/guard.js and css/gate.css (full steps: CLAUDE.md).
   ========================================================================== */
(function () {
  'use strict';

  var SALT = 'unconventional-door-2026|';
  var LOGIN_HASH = '46037f87acb985fa28c7709543848db32d27a1eaefb27ee91fe5f044249f9fa6';      // SHA-256 of SALT + the login, lower-cased
  var PASSWORD_HASH = 'e13594b4d9c44d7033d5929aa68ca693cdd04a08a5f17b147d8b4ee05fc7fca3';    // SHA-256 of SALT + the password, lower-cased
  var HINT_TEXT = '';                 // Set this to print the way in on the page (the original joke),
                                      // e.g. 'Login X · Password Y. Type them in to enter. Yes, really.'
  var TOKEN_KEY = 'uc-gate';
  var TOKEN = 'door-open-7f3a';       // must match js/guard.js
  var HOME = 'home.html';

  // Ticked "don't make me log in again": remembered on this device. Otherwise only for this browser session.
  function remember(persist) {
    try { sessionStorage.setItem(TOKEN_KEY, TOKEN); } catch (e) { /* storage blocked */ }
    try {
      if (persist) localStorage.setItem(TOKEN_KEY, TOKEN); else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* storage blocked */ }
  }
  function remembered() {
    try { if (localStorage.getItem(TOKEN_KEY) === TOKEN) return true; } catch (e) { /* storage blocked */ }
    try { if (sessionStorage.getItem(TOKEN_KEY) === TOKEN) return true; } catch (e) { /* storage blocked */ }
    return false;
  }
  function digest(text) {
    var bytes = new TextEncoder().encode(SALT + text);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buffer) {
      var view = new Uint8Array(buffer), hex = '';
      for (var i = 0; i < view.length; i++) hex += ('0' + view[i].toString(16)).slice(-2);
      return hex;
    });
  }

  // Where to go once in: only ever one of this site's own pages ("about.html", "home.html#brands").
  var params = new URLSearchParams(location.search);
  var hash = /^#[a-z0-9-]+$/.test(location.hash) ? location.hash : '';
  var asked = params.get('next') || '';
  var next = /^[a-z0-9-]+\.html(#[a-z0-9-]+)?$/.test(asked) ? asked : HOME + hash;

  // Owner switch: ?lock makes this browser forget the entry (the "walk straight in" link goes away).
  if (params.has('lock')) {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setUp);
  else setUp();

  function setUp() {
    var form = document.querySelector('[data-gate-form]');
    var error = document.querySelector('[data-gate-error]');
    var hint = document.querySelector('[data-gate-hint]');
    var closedLine = document.querySelector('[data-gate-hint-closed]');
    var skip = document.querySelector('[data-gate-skip]');
    var skipLink = document.querySelector('[data-gate-skip-link]');
    var errorText = error ? error.textContent : '';

    // Already in on this device or in this session: the door stays, with a way straight through.
    // Remembered on this device: the box starts ticked, so logging in by hand keeps it remembered.
    function reflectEntry() {
      var inNow = remembered();
      if (skip && skipLink) {
        if (inNow) skipLink.href = next;
        skip.hidden = !inNow;
      }
      var onDevice = false;
      try { onDevice = localStorage.getItem(TOKEN_KEY) === TOKEN; } catch (e) { /* storage blocked */ }
      if (onDevice && form && form.elements.remember) form.elements.remember.checked = true;
    }
    reflectEntry();

    if (hint && HINT_TEXT) {
      var line = document.createElement('p');
      line.textContent = HINT_TEXT + ' 😛';
      if (closedLine) closedLine.hidden = true;
      hint.appendChild(line);
      errorText = 'Not quite. The answer is sitting right above the box.';
    }

    if (!form) return;
    var busy = false;

    function fail(message) {
      if (error) { error.textContent = message || errorText; error.hidden = false; }
      form.classList.remove('is-shaking');
      void form.offsetWidth; // restart the animation
      form.classList.add('is-shaking');
      form.elements.password.value = '';
      form.elements.password.focus();
    }
    function open() {
      remember(!!(form.elements.remember && form.elements.remember.checked));
      document.documentElement.classList.add('gate-open');
      setTimeout(function () { location.assign(next); }, 350);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (busy) return;
      var login = (form.elements.login.value || '').trim().toLowerCase();
      var password = (form.elements.password.value || '').trim().toLowerCase();
      if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
        fail('This door only opens over a secure (https) connection.');
        return;
      }
      busy = true;
      Promise.all([digest(login), digest(password)]).then(function (hashes) {
        busy = false;
        if (hashes[0] === LOGIN_HASH && hashes[1] === PASSWORD_HASH) open(); else fail();
      }, function () { busy = false; fail(); });
    });

    // Back button: browsers can restore this page exactly as it was left (faded out on the way in).
    // Bring the door back, clear the password, and show the current entry state.
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) return;
      document.documentElement.classList.remove('gate-open');
      busy = false;
      form.elements.password.value = '';
      reflectEntry();
    });
  }
})();
