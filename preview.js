/* Preview helper: keeps the Claude artifact preview on the same page and
   scroll position when a new version is published. It does nothing on
   livinglundin.com and can be deleted before the site goes live. */
(function () {
  if (/(^|\.)livinglundin\.com$/.test(location.hostname)) return;

  var KEY = 'll-preview';
  var store;
  try { store = window.sessionStorage; store.getItem(KEY); } catch (e) { return; }

  var page = location.pathname.split('/').pop() || 'index.html';
  var cameFromLink = store.getItem(KEY + '-nav');
  store.removeItem(KEY + '-nav');

  var saved = null;
  try { saved = JSON.parse(store.getItem(KEY) || 'null'); } catch (e) {}

  if (!cameFromLink && saved) {
    if (saved.page !== page && page === 'index.html') {
      location.replace(saved.page);
      return;
    }
    if (saved.page === page && saved.y) {
      window.addEventListener('load', function () { window.scrollTo(0, saved.y); });
    }
  }

  function save() {
    try { store.setItem(KEY, JSON.stringify({ page: page, y: window.scrollY })); } catch (e) {}
  }
  save();

  var timer;
  window.addEventListener('scroll', function () {
    clearTimeout(timer);
    timer = setTimeout(save, 150);
  }, { passive: true });

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (/^(https?:|mailto:|#)/.test(href)) return;
    try { store.setItem(KEY + '-nav', '1'); } catch (err) {}
  });
})();
