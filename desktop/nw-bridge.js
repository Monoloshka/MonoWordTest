/* NW.js (Windows XP / Vista build): mark the page as a standalone app (shows the Exit button),
   open http(s) links in the system browser, and add the small things NW.js does not do by itself:
   F5 / Ctrl+R reload and Ctrl+mouse-wheel zoom. Every part is wrapped so that a failure only disables that part. */
window.MWT_STANDALONE = true;
(function () {
  function win() { return (typeof nw !== 'undefined' ? nw : require('nw.gui')).Window.get(); }

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el.nodeName !== 'A') { el = el.parentNode; }
    if (!el || !/^https?:\/\//i.test(el.href || '')) { return; }
    try {
      var gui = (typeof nw !== 'undefined') ? nw : require('nw.gui');
      e.preventDefault();
      gui.Shell.openExternal(el.href);
    } catch (err) { /* fall back to default behaviour */ }
  }, false);

  document.addEventListener('keydown', function (e) {
    var k = e.key || '';
    if (k === 'F5' || ((e.ctrlKey || e.metaKey) && (k === 'r' || k === 'R'))) {
      e.preventDefault();
      try { location.reload(); } catch (err) { }
    }
  }, false);

  document.addEventListener('wheel', function (e) {
    if (!e.ctrlKey) { return; }
    try {
      var w = win();
      w.zoomLevel = Math.max(-3, Math.min(5, (w.zoomLevel || 0) + (e.deltaY < 0 ? 0.5 : -0.5)));
      e.preventDefault();
    } catch (err) { /* no zoom support in this NW.js build */ }
  }, false);
})();
