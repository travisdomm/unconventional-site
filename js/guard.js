/* TEMPORARY FRONT DOOR — js/guard.js
   Loaded synchronously in the head of every inner page, before anything paints:
   visitors who have not come through the front door are sent back to it, with
   ?next=<this page> so the door can bring them straight back here afterwards.
   Delete this file (and its script tags) when the gate comes down. */
(function () {
  var TOKEN_KEY = 'uc-gate';
  var TOKEN = 'door-open-7f3a'; // must match js/gate.js
  try { if (localStorage.getItem(TOKEN_KEY) === TOKEN) return; } catch (e) { /* storage blocked */ }
  try { if (sessionStorage.getItem(TOKEN_KEY) === TOKEN) return; } catch (e) { /* storage blocked */ }
  document.documentElement.classList.add('gated');
  var page = location.pathname.split('/').pop();
  var here = /^[a-z0-9-]+\.html$/.test(page) ? page + (/^#[a-z0-9-]+$/.test(location.hash) ? location.hash : '') : '';
  location.replace('./' + (here ? '?next=' + encodeURIComponent(here) : ''));
})();
