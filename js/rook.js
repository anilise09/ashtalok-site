/* Rook in the page hero and in the footer: walks in from the right, waves hello, presents the page, and
   now and then turns, walks off the left edge and comes back in from the right. Tap him to see the
   gesture again. The footer Rook starts when the footer scrolls into view.
   Clips only where transparent WebM plays properly (not Safari or anything on iOS), never with reduced
   motion; there the hero keeps its still pose and the footer shows a still wave. */
(function () {
  // The site's own root, from where this script was loaded (js/<this>.js), so the pictures and clips are
  // found from any page: index.html and v2/index.html alike.
  var SITE = (function () { var s = document.currentScript; return s && s.src ? s.src.replace(/js\/[^/]*$/, '') : ''; })();
  var ua = navigator.userAgent;
  var appleWebKit = /iP(hone|ad|od)/.test(ua) || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua));
  var clipsOk = !matchMedia('(prefers-reduced-motion: reduce)').matches && !appleWebKit &&
    !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');

  var LOOP = { wave: true, walk: true, turn: false, back: false, present: false };   // clip -> loops?
  var CYCLE = 33 / 24;          // one walk cycle (two steps), seconds
  var SPEED = 0.5043;           // ground speed, in clip widths per second, measured from the planted foot
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function rook(slot, stage, startWhenSeen) {
    var walker = document.createElement('span'), v = {};
    walker.className = 'rk-walk'; walker.setAttribute('aria-hidden', 'true');
    Object.keys(LOOP).forEach(function (n) {
      var el = document.createElement('video');
      el.muted = true; el.loop = LOOP[n]; el.playsInline = true; el.preload = 'none';
      // Decorative: hidden from screen readers and never a Tab stop (Firefox makes every <video> one).
      el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.setAttribute('aria-hidden', 'true'); el.tabIndex = -1;
      el.className = 'v-' + n; el.src = SITE + 'assets/mascot/rook-' + n + '.webm';
      walker.appendChild(el); v[n] = el;
    });
    slot.appendChild(walker);
    slot.classList.add('rk-on', 'has-video'); stage.classList.add('rk-live');   // the still pose makes way; he walks in

    var x = 0, busy = true, visible = !startWhenSeen, started = false, timer = null, turnNo = 0;
    function load(names) {
      return Promise.all(names.map(function (n) {
        var el = v[n]; if (el.readyState >= 4) return 1;
        el.preload = 'auto'; el.load();
        return new Promise(function (r) { el.addEventListener('canplaythrough', r, { once: true }); setTimeout(r, 6000); });
      }));
    }
    function play(name) {       // resolves when a one-shot clip ends (loops resolve at once); a one-shot holds its last frame
      var el = v[name]; el.currentTime = 0;
      var pr = el.play(); if (pr && pr.catch) pr.catch(function () {});
      return new Promise(function (res) {
        var swap = function () {
          el.classList.add('on');
          Object.keys(v).forEach(function (n) { if (n !== name) { v[n].classList.remove('on'); v[n].pause(); } });
        };
        if (el.readyState >= 3) requestAnimationFrame(swap); else el.addEventListener('playing', swap, { once: true });
        if (LOOP[name]) res(); else el.addEventListener('ended', function () { res(); }, { once: true });
      });
    }
    function place(px) { x = px; walker.style.transform = 'translateX(' + px + 'px)'; }
    function walkTo(px) {       // whole walk cycles at the measured stride speed, so the feet never skate
      var w = walker.offsetWidth, from = x;
      var n = Math.max(1, Math.round(Math.abs(px - from) / (SPEED * w * CYCLE)));
      return play('walk').then(function () {
        return walker.animate([{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + px + 'px)' }],
          { duration: n * CYCLE * 1000, easing: 'linear' }).finished;
      }).then(function () { place(px); });
    }
    function edges() {          // offsets that put him just outside the stage on each side
      var h = stage.getBoundingClientRect(), s = slot.getBoundingClientRect();
      var left0 = s.left + walker.offsetLeft;
      return { left: h.left - left0 - walker.offsetWidth - 20, right: h.right - left0 + 20 };
    }
    function hello() { return play('wave').then(function () { return wait((v.wave.duration || 4) * 1000); }); }
    function present() { return play('present'); }
    function patrol() {
      return load(['turn']).then(function () { return play('turn'); })
        .then(function () { return walkTo(edges().left); })
        .then(function () { place(edges().right); return walkTo(0); })
        .then(function () { return play('back'); });
    }
    function idle() { busy = false; clearTimeout(timer); timer = setTimeout(act, 7000); }
    function act() {            // wave, present, or a patrol ending in a wave; always back to presenting
      if (!visible || document.hidden) { timer = setTimeout(act, 1500); return; }
      busy = true;
      var n = turnNo++ % 3;
      (n === 0 ? hello() : n === 2 ? patrol().then(hello) : Promise.resolve()).then(present).then(idle);
    }
    function enter() {
      if (started) return; started = true;
      load(['walk', 'back', 'wave', 'present']).then(function () {
        place(edges().right);
        return walkTo(0);
      }).then(function () { return play('back'); }).then(hello).then(present).then(idle);
    }
    slot.addEventListener('click', function () { if (busy) return; busy = true; clearTimeout(timer); present().then(idle); });
    addEventListener('resize', function () { if (!busy) place(0); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && startWhenSeen && document.readyState === 'complete') enter();
      }, { threshold: startWhenSeen ? 0.35 : 0.2 }).observe(stage);
    } else visible = true;
    if (!startWhenSeen) { if (document.readyState === 'complete') enter(); else addEventListener('load', enter); }
    else addEventListener('load', function () { if (visible) enter(); });
  }

  // Top: the hero's own mascot slot
  var heroSlot = document.querySelector('.page-hero .mascot-slot');
  if (clipsOk && heroSlot && heroSlot.querySelector('img')) rook(heroSlot, heroSlot.closest('.page-hero'), false);

  // Bottom: a Rook standing in the footer
  var footer = document.querySelector('.site-footer');
  if (footer) {
    var foot = document.createElement('div');
    foot.className = 'mascot-slot rk-foot';
    var still = document.createElement('img');   // built, not written as markup (the site's script rule)
    still.src = SITE + 'assets/mascot/rook-wave.webp'; still.alt = ''; still.width = 200; still.height = 250;
    foot.appendChild(still);
    footer.appendChild(foot); footer.classList.add('rk-foot-on');
    if (clipsOk) rook(foot, footer, true);
  }
})();
