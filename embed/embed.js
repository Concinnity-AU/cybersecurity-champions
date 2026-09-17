/* Cybersecurity Champions Challenge — Squarespace embed snippet.
 *
 * Drop-in: paste the <div> + <script> into a Squarespace Code Block on
 * the page you want to host the challenge. The iframe auto-resizes
 * based on postMessage events from the embedded app.
 *
 * Two ways to install:
 *   1. Inline (recommended): copy the contents of EMBED_SNIPPET.html into
 *      a Squarespace Code Block.
 *   2. Hosted: drop the same <div>, then <script src="…/embed.js"></script>
 *      pointing at this file. The script self-bootstraps if it finds the
 *      container element.
 */
(function () {
  'use strict';

  var EMBED_ORIGIN = 'https://cybersecurity.tims.org.au';
  var INITIAL_HEIGHT = 720;
  var MIN_HEIGHT = 400;
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

  // The iframe can't see this page's URL, so forward campaign attribution:
  // this page's UTMs, plus `ref` = the hostname that referred the visitor here.
  function embedUrl() {
    var params = ['embed=1'];
    try {
      var here = new URLSearchParams(window.location.search);
      for (var i = 0; i < UTM_KEYS.length; i++) {
        var v = here.get(UTM_KEYS[i]);
        if (v) params.push(UTM_KEYS[i] + '=' + encodeURIComponent(v.slice(0, 120)));
      }
      if (document.referrer) {
        var refHost = new URL(document.referrer).hostname;
        if (refHost && refHost !== window.location.hostname) {
          params.push('ref=' + encodeURIComponent(refHost));
        }
      }
    } catch (e) {
      /* attribution is best-effort */
    }
    return EMBED_ORIGIN + '/?' + params.join('&');
  }

  function init() {
    var container = document.getElementById('cybersec-challenge');
    if (!container) return;
    if (container.getAttribute('data-cybersec-initialised') === '1') return;
    container.setAttribute('data-cybersec-initialised', '1');
    container.style.width = '100%';

    var iframe = document.createElement('iframe');
    iframe.src = embedUrl();
    iframe.title = 'Cybersecurity Champions Challenge';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
    );
    iframe.setAttribute('allow', 'clipboard-write; web-share');
    iframe.style.cssText =
      'width:100%;border:0;display:block;height:' +
      INITIAL_HEIGHT +
      'px;transition:height .3s ease;';
    container.appendChild(iframe);

    window.addEventListener('message', function (e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type !== 'cybersec:resize') return;
      // Strict origin check — only accept messages from the embedded app.
      if (e.origin !== EMBED_ORIGIN) return;
      var h = Number(e.data.height);
      if (!isFinite(h) || h <= 0) return;
      // Match content height exactly. Adding padding here would amplify
      // the height on each round-trip and trigger a runaway resize loop.
      var next = Math.max(MIN_HEIGHT, Math.round(h));
      if (Math.abs(parseInt(iframe.style.height, 10) - next) > 4) {
        iframe.style.height = next + 'px';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
