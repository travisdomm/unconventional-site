/* ==========================================================================
   TEMPORARY FRONT DOOR — js/gate.js

   A curtain, not a lock: this check runs in the visitor's browser and the
   site's files are public, so it keeps casual visitors out and nothing more.

   To take the gate down: rename home.html back to index.html, delete
   js/gate.js, js/guard.js and css/gate.css, and remove the two gate lines
   (the gate.css link and the guard.js script) plus the temporary
   "noindex" tag from the head of the page.
   ========================================================================== */
(function () {
  'use strict';

  var LOGIN = 'admin';       // compared case-insensitively
  var PASSWORD = 'Atlas';    // compared case-insensitively too; shown as written here
  var SHOW_HINT = true;      // false hides the "here's the way in" wink on the page
  var TOKEN_KEY = 'uc-gate';
  var TOKEN = 'atlas-2026';
  var HOME = 'home.html';

  function remember() {
    try { localStorage.setItem(TOKEN_KEY, TOKEN); } catch (e) { /* storage blocked */ }
    try { sessionStorage.setItem(TOKEN_KEY, TOKEN); } catch (e) { /* storage blocked */ }
  }
  function remembered() {
    try { if (localStorage.getItem(TOKEN_KEY) === TOKEN) return true; } catch (e) { /* storage blocked */ }
    try { if (sessionStorage.getItem(TOKEN_KEY) === TOKEN) return true; } catch (e) { /* storage blocked */ }
    return false;
  }

  // Owner switches: ?door shows this page even when already in, ?lock forgets the entry first.
  var params = new URLSearchParams(location.search);
  if (params.has('lock')) {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked */ }
  }

  // Already in: straight through.
  if (remembered() && !params.has('door') && !params.has('lock')) { location.replace(HOME); return; }

  var form = document.querySelector('[data-gate-form]');
  var error = document.querySelector('[data-gate-error]');
  var hint = document.querySelector('[data-gate-hint]');

  if (hint && SHOW_HINT) {
    var line = document.createElement('p');
    var login = document.createElement('strong');
    var pass = document.createElement('strong');
    login.textContent = 'Admin';
    pass.textContent = PASSWORD;
    line.appendChild(document.createTextNode('You came all this way, so here is the key. Login '));
    line.appendChild(login);
    line.appendChild(document.createTextNode(' · Password '));
    line.appendChild(pass);
    line.appendChild(document.createTextNode('. Type them in to enter. Yes, really. 😛'));
    hint.appendChild(line);
    hint.hidden = false;
    if (error) error.textContent = 'Not quite. The answer is sitting right above the box.';
  }

  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var login = (form.elements.login.value || '').trim().toLowerCase();
    var password = (form.elements.password.value || '').trim().toLowerCase();

    if (login === LOGIN && password === PASSWORD.toLowerCase()) {
      remember();
      document.documentElement.classList.add('gate-open');
      setTimeout(function () { location.assign(HOME); }, 350);
      return;
    }

    if (error) error.hidden = false;
    form.classList.remove('is-shaking');
    void form.offsetWidth; // restart the animation
    form.classList.add('is-shaking');
    form.elements.password.value = '';
    form.elements.password.focus();
  });
})();
