/* The site's one script, on every page. It only changes the page: nothing is stored, and the one thing
   ever sent -- the release-list form on download.html -- goes through js/qw.js to this site's own /api/,
   exactly as on the old download page. Without it every page reads the same: all content visible, clips
   paused on their first frame with their controls, the gallery scrolled by hand. */
(function () {
  var root = document.documentElement;
  root.classList.add('v2-js');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  // The place the address named on arrival: js/qw.js takes the fragment off the address bar at once on
  // the download page (for emailed tokens), so it is noted here first.
  var arrivedAt = location.hash;
  function toTop() { if (!arrivedAt) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  toTop();
  window.addEventListener('pageshow', toTop);
  // An address that names a place on the page (download.html#notify) lands there once the page is laid out.
  window.addEventListener('load', function () {
    if (!arrivedAt) return;
    var target = null;
    try { target = document.getElementById(decodeURIComponent(arrivedAt.slice(1).split('&')[0])); } catch (e) { target = null; }
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var watch = 'IntersectionObserver' in window;

  function ready(fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }
  function all(sel, from) { return Array.prototype.slice.call((from || document).querySelectorAll(sel)); }

  ready(function () {
    // The menu bar's clock, as a Mac shows it ("Mon Sep 28  4:47 PM"), from the viewer's own device.
    var clock = document.querySelector('.v2-clock');
    if (clock) {
      var tick = function () {
        var d = new Date();
        clock.textContent = d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' +
          d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '\u2002' +
          d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        clock.setAttribute('datetime', d.toISOString());
        setTimeout(tick, 60000 - d.getSeconds() * 1000 - d.getMilliseconds() + 20);
      };
      tick();
    }

    // The nav shows its edge only once the page has scrolled under it.
    var nav = document.querySelector('.v2-nav');
    if (nav) {
      var edge = function () { nav.classList.toggle('is-scrolled', window.scrollY > 4); };
      window.addEventListener('scroll', edge, { passive: true });
      edge();
    }

    // The small-screen menu closes on a choice or on Escape.
    all('.v2-menu').forEach(function (menu) {
      all('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.open = false; }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    });

    // Things arrive once as they come into view; with less motion asked for, they are simply there.
    var reveals = all('.reveal, .v-step, [data-count]');
    function arrive(el) {
      el.classList.remove('pre');
      el.classList.add('is-in');
      if (el.hasAttribute('data-count')) countUp(el);
    }
    if (still || !watch) {
      reveals.forEach(arrive);
    } else {
      // Only what is below the fold now waits to arrive; what is on screen stays as it is.
      var fold = window.innerHeight * 0.92;
      reveals.forEach(function (el) { if (el.classList.contains('reveal') && el.getBoundingClientRect().top > fold) el.classList.add('pre'); });
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { arrive(entry.target); seen.unobserve(entry.target); }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { seen.observe(el); });
    }

    // A number counts up to itself once, eased out. With less motion it is shown as it is.
    function countUp(el) {
      var to = parseInt(el.getAttribute('data-count'), 10);
      if (!to || still) { el.textContent = to.toLocaleString(); return; }
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 1400);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Clips play while on screen, muted, and not at all for someone who asked for less motion.
    var clips = all('video[data-play]');
    if (!still && watch) {
      var playing = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var clip = entry.target;
          if (entry.isIntersecting) { var p = clip.play(); if (p && p.catch) p.catch(function () {}); }
          else clip.pause();
        });
      }, { threshold: 0.5 });
      clips.forEach(function (clip) { playing.observe(clip); });
    }

    // A still picture comes to life where it can: a clip in its place, muted and looping, only while on
    // screen and never with less motion asked for. A clip with a transparent background (data-alpha) is
    // left out on Safari, which doesn't show that transparency.
    var safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    all('img[data-clip]').forEach(function (img) {
      if (still || !watch || (safari && img.hasAttribute('data-alpha'))) return;
      var clip = document.createElement('video');
      clip.muted = true; clip.loop = true; clip.playsInline = true;
      clip.className = img.className;
      clip.setAttribute('aria-hidden', 'true');
      clip.tabIndex = -1;   // decoration: Firefox would otherwise make every clip a Tab stop
      clip.poster = img.getAttribute('src');
      clip.width = img.width; clip.height = img.height;
      clip.src = img.getAttribute('data-clip');
      clip.addEventListener('loadeddata', function () {
        img.replaceWith(clip);
        var p = clip.play(); if (p && p.catch) p.catch(function () {});
        // Off screen it rests.
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) { var q = clip.play(); if (q && q.catch) q.catch(function () {}); } else clip.pause(); });
        }).observe(clip);
      }, { once: true });
      clip.load();
    });

    // The wall: count what it stops and what it lets through, and let anyone pause it.
    all('.wallflow').forEach(function (flow) {
      var stopped = flow.querySelector('[data-stopped]');
      var passed = flow.querySelector('[data-passed]');
      var toggle = flow.querySelector('.wf-toggle');
      var counts = { no: 0, ok: 0 };
      all('.pkt', flow).forEach(function (pkt) {
        pkt.addEventListener('animationiteration', function () {
          var kind = pkt.classList.contains('no') ? 'no' : 'ok';
          counts[kind] += 1;
          (kind === 'no' ? stopped : passed).textContent = counts[kind];
        });
      });
      var paused = false;
      function set(p) {
        paused = p;
        flow.classList.toggle('is-paused', p);
        if (toggle) { toggle.textContent = p ? 'Play' : 'Pause'; toggle.setAttribute('aria-pressed', String(p)); }
      }
      if (toggle) toggle.addEventListener('click', function () { set(!paused); });
      // Off screen it rests, so it costs nothing while you read something else.
      if (watch && !still) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (!paused) flow.classList.toggle('is-paused', !entry.isIntersecting); });
        }).observe(flow);
      }
    });

    // The news page: its ads fold away one by one, the QuietWall icon counts them, and the article stays.
    all('[data-news]').forEach(function (news) {
      var ads = all('[data-ad]', news);
      var badge = news.querySelector('[data-badge]');
      var again = document.querySelector('[data-news-again]');
      var timers = [];
      function reset() {
        timers.forEach(clearTimeout); timers = [];
        news.classList.remove('has-count', 'done');
        badge.textContent = '0';
        ads.forEach(function (ad) { ad.classList.remove('folded'); ad.style.height = ''; });
      }
      function fold(ad, n) {
        ad.style.height = ad.offsetHeight + 'px';
        void ad.offsetHeight;
        ad.classList.add('folded');
        ad.style.height = '0px';
        badge.textContent = String(n);
        news.classList.add('has-count');
      }
      function play() {
        reset();
        if (still) { ads.forEach(function (ad, i) { fold(ad, i + 1); }); news.classList.add('done'); return; }
        ads.forEach(function (ad, i) { timers.push(setTimeout(function () { fold(ad, i + 1); }, 900 + i * 900)); });
        timers.push(setTimeout(function () { news.classList.add('done'); }, 900 + ads.length * 900 + 200));
      }
      if (again) again.addEventListener('click', play);
      if (watch) {
        var shown = false;
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting && !shown) { shown = true; play(); } });
        }, { threshold: 0.4 }).observe(news);
      } else play();
    });

    // The Windows app, clickable: the sidebar and buttons move between its real screens (sample data), and
    // Rook says what each one does. Everything is set as text; nothing is sent.
    all('[data-wdemo]').forEach(function (demo) {
      var shot = demo.querySelector('.wd-shot');
      var screen = demo.querySelector('.wd-screen');
      var bubble = demo.querySelector('.wd-bubble');
      var coach = demo.querySelector('.wd-coach');
      var screens = {};
      all('[data-screen]', demo).forEach(function (s) {
        screens[s.getAttribute('data-screen')] = { src: s.getAttribute('data-src'), alt: s.getAttribute('data-alt') };
        var pre = document.createElement('img'); pre.src = s.getAttribute('data-src');
      });
      function say(b) {
        bubble.querySelector('.cb-k').textContent = b.getAttribute('data-k');
        bubble.querySelector('.cb-t').textContent = b.getAttribute('data-t');
        bubble.querySelector('.cb-b').textContent = b.getAttribute('data-b');
        [bubble, coach].forEach(function (el, i) { var c = i ? 'presenting' : 'pop'; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); });
      }
      function go(name) {
        var to = screens[name]; if (!to) return;
        screen.classList.add('is-switching');
        setTimeout(function () {
          shot.src = to.src; shot.alt = to.alt;
          all('.wd-hots', demo).forEach(function (layer) {
            var f = layer.getAttribute('data-for');
            layer.hidden = !(f === 'all' || f === name);
          });
          screen.classList.remove('is-switching');
        }, still ? 0 : 140);
      }
      all('.wd-hot', demo).forEach(function (b) {
        b.addEventListener('click', function () {
          all('.wd-hot', demo).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          if (b.hasAttribute('data-t')) say(b);
          if (b.hasAttribute('data-go')) go(b.getAttribute('data-go'));
        });
      });
    });

    // The gallery scrolls with the platform's own momentum; the buttons step one card.
    all('[data-gallery]').forEach(function (box) {
      var track = box.querySelector('.gallery');
      var prev = box.querySelector('[data-prev]');
      var next = box.querySelector('[data-next]');
      if (!track || !prev || !next) return;
      function card() { var c = track.querySelector('.g-card'); return c ? c.getBoundingClientRect().width + 20 : 300; }
      function update() {
        prev.disabled = track.scrollLeft < 8;
        next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
      }
      prev.addEventListener('click', function () { track.scrollBy({ left: -card(), behavior: still ? 'auto' : 'smooth' }); });
      next.addEventListener('click', function () { track.scrollBy({ left: card(), behavior: still ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });

    // The setup checklist (welcome.html): ticks are this visit's only; nothing keeps them.
    var boxes = all('#checklist input[type="checkbox"]');
    if (boxes.length) {
      var text = document.getElementById('progress-text');
      var fill = document.getElementById('progress-fill');
      var update = function () {
        var done = 0;
        boxes.forEach(function (b) { b.closest('.check-item').classList.toggle('done', b.checked); if (b.checked) done++; });
        text.textContent = done === boxes.length ? 'All ' + boxes.length + ' steps done. You’re set up.' : done + ' of ' + boxes.length + ' steps done';
        fill.style.width = (done / boxes.length * 100) + '%';
      };
      boxes.forEach(function (b) { b.addEventListener('change', update); });
      update();
    }

    // Help search (help.html): filters the articles on the page; nothing is sent.
    var box = document.getElementById('help-search');
    if (box) {
      var input = document.getElementById('q');
      var status = document.getElementById('search-status');
      var empty = document.getElementById('no-results');
      var articles = all('.help-cat details');
      var cats = all('.help-cat');
      var index = articles.map(function (d) { return (d.textContent + ' ' + (d.getAttribute('data-keywords') || '')).toLowerCase().replace(/\s+/g, ' '); });
      var filter = function () {
        var terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        var shown = 0;
        articles.forEach(function (d, i) {
          var match = terms.every(function (t) { return index[i].indexOf(t) !== -1; });
          d.hidden = !match; if (match) shown++;
        });
        cats.forEach(function (c) { c.hidden = !c.querySelector('details:not([hidden])'); });
        empty.hidden = shown > 0;
        status.textContent = !terms.length ? '' : (shown === 1 ? '1 article matches.' : shown + ' of ' + articles.length + ' articles match.');
      };
      var openFromHash = function () {
        var id = decodeURIComponent(location.hash.slice(1));
        var el = id && document.getElementById(id);
        if (!el) return;
        if (el.hidden || el.closest('[hidden]')) { input.value = ''; filter(); }
        if (el.tagName !== 'DETAILS') return;
        articles.forEach(function (d) { d.classList.remove('is-target'); });
        el.open = true; el.classList.add('is-target'); el.scrollIntoView();
      };
      box.hidden = false;
      input.addEventListener('input', filter);
      window.addEventListener('hashchange', openFromHash);
      openFromHash();
    }

    // The release list (download.html): the old page's form, unchanged. Preview until QuietWall's own
    // server says the list is open (js/qw.js); in preview the address is never read.
    var form = document.getElementById('notify-form');
    if (form) notify(form);
  });

  function notify(form) {
    var input = document.getElementById('notify-email');
    var msg = document.getElementById('notify-msg');
    var sent = document.getElementById('notify-sent');
    var err = document.getElementById('notify-err');
    var button = form.querySelector('button[type="submit"]');
    var QW = window.QW;
    var mode = QW ? QW.ready : Promise.resolve({ notify: false });
    var action = '';
    try { action = new URLSearchParams(location.hash.replace(/^#/, '')).get('action') || ''; } catch (e) { action = ''; }
    var actionToken = QW ? QW.takeToken() : '';
    var actionBox = document.getElementById('notify-action');
    var actionButton = document.getElementById('notify-action-button');
    mode.then(function (h) {
      if (QW) QW.setMode(h.notify);
      if (h.notify && actionToken && (action === 'confirm' || action === 'unsubscribe')) {
        form.hidden = true;
        actionBox.hidden = false;
        document.getElementById('notify-action-title').textContent = action === 'confirm' ? 'Join the release list?' : 'Leave the release list?';
        document.getElementById('notify-action-copy').textContent = action === 'confirm' ?
          'Nothing changes until you press the button. AshtaLok will then keep your address for one release email.' :
          'Nothing changes until you press the button. AshtaLok will then delete your address from the list.';
        actionButton.textContent = action === 'confirm' ? 'Confirm my address' : 'Delete my address';
        actionBox.focus();
      }
    });
    actionButton.addEventListener('click', function () {
      var restore = QW.busy(actionButton, action === 'confirm' ? 'Confirming…' : 'Removing…');
      QW.call('POST', 'notify/' + action, { token: actionToken }).then(function (r) {
        restore();
        if (!r.ok) { var ae = document.getElementById('notify-action-error'); ae.textContent = r.message; ae.focus(); return; }
        actionToken = '';
        document.getElementById('notify-action-title').textContent = action === 'confirm' ? 'You’re on the list' : 'Your address was deleted';
        document.getElementById('notify-action-copy').textContent = action === 'confirm' ? 'AshtaLok will send one email when it is released.' : 'AshtaLok will not send the release email.';
        actionButton.hidden = true;
        actionBox.focus();
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      input.removeAttribute('aria-invalid');
      mode.then(function (h) {
        if (!h.notify) {
          input.value = '';
          msg.hidden = false;
          msg.setAttribute('tabindex', '-1');
          msg.focus();
          return;
        }
        var email = input.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          err.textContent = email ? 'Enter an email address like name@example.com.' : 'Enter your email address.';
          input.setAttribute('aria-invalid', 'true');
          input.focus();
          return;
        }
        sent.hidden = true;
        var restore = QW.busy(button, 'Sending…');
        QW.call('POST', 'notify', { email: email }).then(function (r) {
          restore();
          if (!r.ok) { err.textContent = r.message; err.focus(); return; }
          input.value = '';
          document.getElementById('notify-to').textContent = email;
          sent.hidden = false;
          sent.focus();
        });
      });
    });
  }
})();
