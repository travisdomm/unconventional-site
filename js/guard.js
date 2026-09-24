/* TEMPORARY FRONT DOOR — js/guard.js
   Loaded synchronously in the head of home.html, before anything paints:
   visitors who have not come through the front door are sent back to it.
   Delete this file (and its script tag) when the gate comes down. */
(function () {
  var TOKEN_KEY = 'uc-gate';
  var TOKEN = 'door-open-7f3a'; // must match js/gate.js
  try { if (localStorage.getItem(TOKEN_KEY) === TOKEN) return; } catch (e) { /* storage blocked */ }
  try { if (sessionStorage.getItem(TOKEN_KEY) === TOKEN) return; } catch (e) { /* storage blocked */ }
  document.documentElement.classList.add('gated');
  location.replace('./');
})();
