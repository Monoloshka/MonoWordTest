/* NW.js (Windows XP / Vista build): open http(s) links in the system browser. */
(function () {
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
})();
