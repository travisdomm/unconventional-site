/* ==========================================================================
   TEMPORARY FRONT DOOR — js/gate.js

   A curtain, not a lock: this check runs in the visitor's browser and the
   site's files are public, so it keeps casual visitors out and nothing more.
   The login and password are not written here in plain text: only their
   salted SHA-256 fingerprints are, so a look at the source does not hand
   them over.

   Loaded in the <head> of index.html WITHOUT defer, so a visitor who is
   already in is sent on before the door paints. The rest waits for the page.
   ?next=about.html (set by js/guard.js) sends people back to the page they
   were trying to open.

   To take the gate down: copy home.html over index.html, remove the gate
   lines and the temporary "noindex" tag from its head, and delete
   js/gate.js, js/guard.js and css/gate.css.
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

  // Owner switches: ?door shows this page even when already in, ?lock forgets the entry first.
  if (params.has('lock')) {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
  }

  // Already in: straight through, before the door paints.
  if (remembered() && !params.has('door') && !params.has('lock')) { location.replace(next); return; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setUp);
  else setUp();

  function setUp() {
    var form = document.querySelector('[data-gate-form]');
    var error = document.querySelector('[data-gate-error]');
    var hint = document.querySelector('[data-gate-hint]');
    var closedLine = document.querySelector('[data-gate-hint-closed]');
    var errorText = error ? error.textContent : '';

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
  }
})();
