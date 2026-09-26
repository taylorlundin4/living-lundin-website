/* Preview helper: keeps the Claude artifact preview on the same page and
   scroll position when a new version is published. It does nothing on
   livinglundin.com and can be deleted before the site goes live. */
(function () {
  if (/(^|\.)livinglundin\.com$/.test(location.hostname)) return;

  var KEY = 'll-preview';
  var store;
  try { store = window.sessionStorage; store.getItem(KEY); } catch (e) { return; }

  // Pages are tracked relative to the site root (the folder preview.js lives in),
  // so posts in journal/ are remembered as "journal/post-name.html".
  var script = document.currentScript;
  var root = script ? new URL('.', script.src).href : new URL('.', location.href).href;
  var here = location.href.split('#')[0].split('?')[0];
  var page = here.indexOf(root) === 0 ? here.slice(root.length) : here.split('/').pop();
  if (!page) page = 'index.html';

  var cameFromLink = store.getItem(KEY + '-nav');
  store.removeItem(KEY + '-nav');

  var saved = null;
  try { saved = JSON.parse(store.getItem(KEY) || 'null'); } catch (e) {}

  // A page opened by clicking a link starts at the top, like it would on the
  // live site. The preview frame otherwise keeps the previous page's scroll.
  if (cameFromLink) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    var toTop = function () { window.scrollTo(0, 0); };
    toTop();
    window.addEventListener('load', function () {
      toTop();
      setTimeout(toTop, 150);
      setTimeout(toTop, 600);
    });
  }

  if (!cameFromLink && saved) {
    if (saved.page !== page && page === 'index.html') {
      location.replace(root + saved.page);
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
