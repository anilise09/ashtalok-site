/* QuietWall website: the one place a page talks to QuietWall's own server (docs/ACCOUNTS_API.md).
 *
 * Every page works without a server. A page goes live only when this site's own GET /api/health
 * answers {"accounts": true} -- or "notify": true, for the release-news form. A static host, a page
 * opened from a file, a preview, a server that is switched off, a slow answer or JavaScript turned off
 * all leave the page in preview mode, which is the page as written: elements marked
 * data-when="preview" show, and data-when="live" ones stay hidden (styles.css).
 *
 * Requests go only to this site's /api/. Every request that changes anything carries X-QuietWall: 1.
 * Whatever goes wrong, a page gets a plain-English sentence to show -- the server's own message, or
 * one of the fallbacks below -- never a raw error. Nothing is kept in the browser: the only cookie is
 * the server's sign-in cookie, which scripts cannot read.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var OFF = { accounts: false, notify: false, sms: false };
  var HEALTH_WAIT_MS = 5000;
  var CALL_WAIT_MS = 20000;

  var SAY = {
    network: 'We couldn’t reach AshtaLok. Check your connection and try again.',
    401: 'You’re signed out. Log in again to carry on.',
    403: 'This page is out of date. Reload it and try again.',
    404: 'That isn’t there any more. Reload the page and try again.',
    429: 'Too many tries. Wait a few minutes, then try again.',
    server: 'Something went wrong on our side. Try again in a minute.',
    other: 'That didn’t work. Check what you entered and try again.'
  };

  // Until the server has answered, whatever carries data-qw-wait stays invisible, so a live page does
  // not flash its preview notice (styles.css reveals it after a few seconds whatever happens).
  root.setAttribute('data-qw-checking', '');

  function timer(ms) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return { signal: ctrl ? ctrl.signal : undefined, stop: function () { clearTimeout(t); } };
  }

  var ready = new Promise(function (resolve) {
    var settled = false;
    function finish(state) { if (!settled) { settled = true; resolve(state); } }
    setTimeout(function () { finish(OFF); }, HEALTH_WAIT_MS + 200);
    var t = timer(HEALTH_WAIT_MS);
    try {
      fetch('/api/health', { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store', signal: t.signal })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (body) {
          t.stop();
          finish({ accounts: !!body && body.accounts === true, notify: !!body && body.notify === true, sms: !!body && body.sms === true });
        }, function () { t.stop(); finish(OFF); });
    } catch (e) {
      finish(OFF);
    }
  });

  function reveal() { root.removeAttribute('data-qw-checking'); }
  // A page that has more to load before it can be shown (the account page) holds, and reveals itself.
  ready.then(function () { if (!root.hasAttribute('data-qw-hold')) reveal(); });

  function setMode(live) { root.setAttribute('data-qw-mode', live ? 'live' : 'preview'); }

  function messageFor(status, body) {
    var said = body && body.error && typeof body.error.message === 'string' ? body.error.message.trim() : '';
    if (said && said.length <= 300) return said;
    if (SAY[status]) return SAY[status];
    return status >= 500 ? SAY.server : SAY.other;
  }

  /**
   * Calls this site's /api/<path>. Never rejects: resolves {ok, status, data, text, code, message},
   * where message is a sentence a page can show as it is.
   */
  function call(method, path, body) {
    var init = { method: method, headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' };
    if (method !== 'GET') init.headers['X-QuietWall'] = '1';
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    var t = timer(CALL_WAIT_MS);
    init.signal = t.signal;
    var offline = { ok: false, status: 0, data: null, text: '', code: 'network', message: SAY.network };
    return new Promise(function (resolve) {
      try {
        fetch('/api/' + String(path).replace(/^\/+/, ''), init).then(function (r) {
          return r.text().then(function (text) {
            var data = null;
            if (text) { try { data = JSON.parse(text); } catch (e) { data = null; } }
            t.stop();
            resolve({
              ok: r.ok,
              status: r.status,
              data: r.ok ? data : null,
              text: r.ok ? text : '',
              code: !r.ok && data && data.error && typeof data.error.code === 'string' ? data.error.code : '',
              message: r.ok ? '' : messageFor(r.status, data)
            });
          });
        }).catch(function () { t.stop(); resolve(offline); });
      } catch (e) {
        t.stop();
        resolve(offline);
      }
    });
  }

  /** The token from an emailed link (#token=... or ?token=...), taken off the address bar at once. */
  function takeToken() {
    var token = '';
    try {
      token = new URLSearchParams(location.hash.replace(/^#/, '')).get('token') ||
              new URLSearchParams(location.search).get('token') || '';
    } catch (e) { token = ''; }
    if (history.replaceState && (location.search || location.hash)) history.replaceState(null, '', location.pathname);
    return token.trim();
  }

  /** Marks a button busy while a request runs; returns the function that puts it back. */
  function busy(button, label) {
    var before = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    if (label) button.textContent = label;
    return function () {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (label) button.textContent = before;
    };
  }

  window.QW = { ready: ready, reveal: reveal, setMode: setMode, call: call, takeToken: takeToken, busy: busy, say: SAY };
})();
