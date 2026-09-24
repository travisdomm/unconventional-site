/* Runs before first paint (loaded synchronously in <head>, kept tiny on purpose).
   Flags the document so CSS can safely hide things that JS will reveal later. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    if (new URLSearchParams(window.location.search).has('dev')) root.classList.add('dev');
    if (window.localStorage.getItem('motion') === 'paused') root.classList.add('motion-paused');
  } catch (e) { /* private mode / blocked storage: carry on with defaults */ }
})();
