/* The home page (index.html): the app demo Rook explains, and Rook walking the hero, the FAQ and the goodbye.
   Changes nothing but this page: no storage, no requests, and every piece of text is set as text. */
(function () {
  // The site's own root, from where this script was loaded (js/<this>.js), so the pictures and clips are
  // found from any page: index.html and v2/index.html alike.
  var SITE = (function () { var s = document.currentScript; return s && s.src ? s.src.replace(/js\/[^/]*$/, '') : ''; })();
  // A visit to a news site. type: site | ads | trackers | social
  var VISIT = [
    { d: 'www.cnn.com', t: 'site' },
    { d: 'securepubads.g.doubleclick.net', t: 'ads', list: 'built-in ads list' },
    { d: 'media.cnn.com', t: 'site' },
    { d: 'c.amazon-adsystem.com', t: 'ads', list: 'built-in ads list' },
    { d: 'sb.scorecardresearch.com', t: 'trackers', list: 'built-in trackers list' },
    { d: 'ads.pubmatic.com', t: 'ads', list: 'built-in ads list' },
    { d: 'ssum-sec.casalemedia.com', t: 'ads', list: 'built-in ads list' },
    { d: 'stats.g.doubleclick.net', t: 'trackers', list: 'built-in trackers list' },
    { d: 'cdn.cnn.com', t: 'site' },
    { d: 'ib.adnxs.com', t: 'ads', list: 'built-in ads list' },
    { d: 'connect.facebook.net', t: 'social', list: 'built-in social list' },
    { d: 'ad.doubleclick.net', t: 'ads', list: 'built-in ads list' },
    { d: 'www.google-analytics.com', t: 'trackers', list: 'built-in trackers list' },
    { d: 'platform.twitter.com', t: 'social', list: 'built-in social list' }
  ];
  var LEVELS = {
    light:    { name: 'Light', blocks: ['ads'], tiles: ['ads', 'security', 'dns'] },
    balanced: { name: 'Balanced', blocks: ['ads', 'trackers'], tiles: ['ads', 'trackers', 'security', 'dns'] },
    strict:   { name: 'Strict', blocks: ['ads', 'trackers', 'social'], tiles: ['ads', 'trackers', 'popups', 'security', 'dns'] }
  };
  // What Rook says about each part of the app
  var SAY = {
    'level-light':    ['Protection level', 'Light', 'Blocks ads only. Pick it if a site you need keeps breaking.'],
    'level-balanced': ['Protection level', 'Balanced', 'Blocks ads, trackers and telemetry. The right choice for most people.'],
    'level-strict':   ['Protection level', 'Strict', 'Balanced plus more lists, such as social widgets. A few sites may need an allow.'],
    'toggle-off':     ['Protection switch', 'AshtaLok is off', 'Apps now go straight to the internet. Flip the switch to turn protection back on.'],
    'toggle-on':      ['Protection switch', "You're protected again", 'The switch turns AshtaLok on or off for the whole phone.'],
    'pause':          ['Pause', 'Paused for {n}', 'Handy when a site misbehaves. AshtaLok switches itself back on when the time is up.'],
    'resume':         ['Pause', 'Back on', 'Protection is running again.'],
    'row-blocked':    ['Recent activity', '{d}', 'Blocked: {type}, from the {list}. Chrome asked for it. If something broke, tap Allow this site.'],
    'row-site':       ['Recent activity', '{d}', 'Part of the site itself, so it goes through, looked up over encrypted DNS.'],
    'row-paused':     ['Recent activity', '{d}', 'Allowed because protection is paused.'],
    'row-yours':      ['Recent activity', '{d}', 'You allowed this one. Tap Block again to undo it.'],
    'row-level':      ['Recent activity', '{d}', 'Not on the lists this level uses. Switch to Strict to block it.'],
    'allow':          ['Your rules', '{d} is allowed', 'It gets through from now on. You can block it again from the same row.'],
    'block-again':    ['Your rules', '{d} is blocked again', 'Back to what the lists decide.'],
    'icon-ads':       ['Shortcut', 'Ads', 'Blocks ad servers, so the ad never loads in the first place.'],
    'icon-trackers':  ['Shortcut', 'Trackers', 'Stops analytics and tracking companies from hearing about your visit.'],
    'icon-popups':    ['Shortcut', 'Popups', 'Blocks pop-up and redirect ad networks.'],
    'icon-security':  ['Shortcut', 'Security lists', 'A place for security lists. They are still being chosen, so this site makes no claim about them yet.'],
    'icon-dns':       ['Shortcut', 'DNS', 'Pick your encrypted DNS provider. Addresses AshtaLok lets through are looked up there.'],
    'icon-lists':     ['Shortcut', 'Lists', 'Add community lists such as EasyList, or write your own allow and block rules.'],
    'icon-firewall':  ['Shortcut', 'Firewall', 'Choose which apps may use Wi-Fi or mobile data. In testing: it switches on for customers after its phone tests.'],
    'head-rook':      ['Top bar', 'Rook', "That's me, AshtaLok's warden. Now and then I say hello from up here."],
    'head-activity':  ['Recent activity', 'Every decision, on this phone', 'Every address your apps asked for, and what AshtaLok decided. Tap a row to see why.'],
    'card-blocked':   ['Recent activity', '{n} blocked today', 'Every address your apps asked for, and what AshtaLok decided. Tap a row to see why.'],
    'card-browse':    ['Card', 'Private browser', 'A browser that keeps no history. Share a video from the YouTube app to it and it plays without ads.'],
    'card-https':     ['Card', 'HTTPS filtering', "Removes ads served from the page's own address, in supported browsers. In testing: it switches on for customers after its phone tests."],
    'card-firewall':  ['Card', 'Apps limited', 'How many apps the firewall keeps off Wi-Fi or mobile data. In testing: it switches on for customers after its phone tests.'],
    'card-apps':      ['Card', 'Apps protected', 'Every app goes through AshtaLok unless you leave one out.'],
    'card-passwords': ['Card', 'Passwords', 'Your vault, encrypted on this phone with a master password only you know.'],
    'card-dns':       ['Card', 'Encrypted DNS', 'Who looks up the addresses AshtaLok lets through: Cloudflare or Quad9, encrypted.'],
    'card-theme':     ['Card', 'Theme', 'Light and dark, and themes to choose.'],
    'back-home':      ['Bottom bar', 'Home', 'Your protection at a glance: on or off, your level, and how much was blocked today.'],
    'head-settings':  ['Top bar', 'Settings', 'Where you choose your DNS provider, your lists and how AshtaLok behaves.'],
    'nav-firewall':   ['Bottom bar', 'Firewall', 'Choose which apps may use Wi-Fi or mobile data. In testing: it switches on for customers after its phone tests.'],
    'nav-apps':       ['Bottom bar', 'Apps', 'Every app on your phone, and what each one asked for.'],
    'nav-home':       ['Bottom bar', 'Home', 'Your protection at a glance: on or off, your level, and how much was blocked today.'],
    'nav-vault':      ['Bottom bar', 'Vault', 'Your passwords, encrypted on this phone with a master password only you know. No cloud copy.'],
    'nav-stats':      ['Bottom bar', 'Statistics', 'Ads, trackers and other blocks, counted by app and by company.']
  };

  var feed = document.getElementById('feed');
  var state = { level: 'balanced', on: true, pauseMin: 0, pauseEnd: 0, pauseTimer: null, allowed: {}, items: [], open: null, blockedToday: 147, idx: 0, timer: null };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cb = document.getElementById('coachBubble'), fig = document.getElementById('coachFig');

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function labelled(label, value) { var n = el('span'); n.appendChild(document.createTextNode(label)); n.appendChild(el('b', null, value)); return n; }
  function fill(str, v) { return str.replace(/\{(\w+)\}/g, function (_, k) { return v && v[k] != null ? v[k] : ''; }); }
  function explain(key, v) {
    var m = SAY[key]; if (!m) return;
    document.getElementById('cbK').textContent = m[0];
    document.getElementById('cbT').textContent = fill(m[1], v);
    document.getElementById('cbB').textContent = fill(m[2], v);
    [cb, fig].forEach(function (el, i) { var c = i ? 'presenting' : 'pop'; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); });
    coachPresent();
  }

  function paused() { return !state.on || state.pauseMin > 0; }
  function decide(it) {
    if (it.t === 'site') return { ok: true, why: 'site', say: 'row-site' };
    if (paused()) return { ok: true, why: 'paused', say: 'row-paused' };
    if (state.allowed[it.d]) return { ok: true, why: 'you allowed it', say: 'row-yours' };
    if (LEVELS[state.level].blocks.indexOf(it.t) >= 0) return { ok: false, why: it.t + ' · filter', say: 'row-blocked' };
    return { ok: true, why: 'not blocked at ' + state.level, say: 'row-level' };
  }
  function row(it, isNew) {
    var r = decide(it);
    var li = document.createElement('li');
    li.className = 'req' + (isNew && !reduce ? ' new' : '');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'req-btn'; btn.id = 'req-' + it.key;
    btn.setAttribute('aria-expanded', String(state.open === it.key));
    // Built as elements, never written as markup (the site's script rule).
    var icon = el('img'); icon.src = SITE + 'assets/app/chrome.webp'; icon.alt = ''; icon.width = 60; icon.height = 60;
    var text = el('span'); text.style.minWidth = '0';
    text.appendChild(el('span', 'dom', it.d));
    text.appendChild(el('span', 'why ' + (r.ok ? 'a' : 'b'), (r.ok ? 'Allowed' : 'Blocked') + ' · ' + r.why));
    var when = el('span', 'when', it.time);
    if (!r.ok) { when.appendChild(el('br')); when.appendChild(document.createTextNode('×' + it.n)); }
    btn.appendChild(icon); btn.appendChild(text); btn.appendChild(when);
    btn.addEventListener('click', function () {
      state.open = state.open === it.key ? null : it.key;
      explain(r.say, { d: it.d, type: it.t, list: it.list });
      render();
    });
    li.appendChild(btn);
    if (state.open === it.key) {
      var det = document.createElement('div'); det.className = 'detail';
      det.appendChild(labelled('Asked by ', 'Chrome'));
      det.appendChild(labelled('List ', it.list || 'none'));
      if (it.t !== 'site') {
        var a = document.createElement('button'); a.type = 'button'; a.className = 'allow';
        a.textContent = state.allowed[it.d] ? 'Block again' : 'Allow this site';
        a.addEventListener('click', function () {
          if (state.allowed[it.d]) { delete state.allowed[it.d]; explain('block-again', { d: it.d }); }
          else { state.allowed[it.d] = true; explain('allow', { d: it.d }); }
          render();
        });
        det.appendChild(a);
      }
      li.appendChild(det);
    }
    return li;
  }
  function fmt(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); }
  function render(newKey) {
    feed.replaceChildren();
    state.items.forEach(function (it) { feed.appendChild(row(it, it.key === newKey)); });
    document.getElementById('decN').textContent = state.items.length + ' decisions';
    document.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.level === state.level)); });
    document.querySelectorAll('.prow button').forEach(function (x) { x.setAttribute('aria-pressed', String(+x.dataset.min === state.pauseMin)); });
    document.getElementById('pToggle').setAttribute('aria-checked', String(!paused()));
    var t = document.getElementById('pTitle'), s = document.getElementById('pSub');
    document.getElementById('pShield').classList.toggle('off', paused());
    if (!state.on) { t.textContent = 'Protection is off'; s.textContent = 'Until you turn it back on'; }
    else if (state.pauseMin) { t.textContent = 'Paused'; s.textContent = 'Back on in ' + fmt(Math.max(0, Math.round((state.pauseEnd - Date.now()) / 1000))); }
    else { t.textContent = "You're protected"; s.textContent = LEVELS[state.level].name + ' level · encrypted DNS'; }
    document.getElementById('cBlocked').textContent = String(state.blockedToday);
    document.querySelectorAll('.nl-tile').forEach(function (x) { x.classList.toggle('on', LEVELS[state.level].tiles.indexOf(x.dataset.tile) >= 0); });
  }
  // Recent activity is its own page in the app, opened from the bell or the "blocked today" card.
  var home = document.getElementById('nlHome'), activity = document.getElementById('nlActivity');
  function showActivity(on) {
    home.hidden = on; activity.hidden = !on;
    if (on) activity.querySelector('.ptoday').scrollTop = 0;
  }
  function push() {
    var it = VISIT[state.idx];
    if (!it) { clearInterval(state.timer); state.timer = null; return; }
    var sec = 12 + state.idx * 2;
    var item = { d: it.d, t: it.t, list: it.list, key: 'k' + state.idx, n: 2 + (state.idx * 5) % 8, time: '05:50:' + String(sec).padStart(2, '0') };
    state.items.unshift(item);
    if (!decide(item).ok) state.blockedToday++;
    state.idx++;
    render(item.key);
  }
  function start() {
    state.items = []; state.idx = 0; state.open = null;
    for (var i = 0; i < 5; i++) push();
    render();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(push, reduce ? 3200 : 1900);
  }
  function resume(quiet) { state.on = true; state.pauseMin = 0; clearInterval(state.pauseTimer); render(); if (!quiet) explain('resume'); }

  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () { state.level = b.dataset.level; render(); explain('level-' + state.level); });
  });
  document.querySelectorAll('.prow button').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = +b.dataset.min;
      if (state.pauseMin === m) { resume(); return; }
      state.on = true; state.pauseMin = m; state.pauseEnd = Date.now() + m * 60000;
      clearInterval(state.pauseTimer);
      state.pauseTimer = setInterval(function () { if (Date.now() >= state.pauseEnd) resume(); else render(); }, 1000);
      render();
      explain('pause', { n: b.textContent });
    });
  });
  document.getElementById('pToggle').addEventListener('click', function () {
    if (paused()) { resume(true); explain('toggle-on'); } else { state.on = false; render(); explain('toggle-off'); }
  });
  var hots = document.querySelectorAll('.hot');
  hots.forEach(function (h) {
    h.addEventListener('click', function () {
      var key = h.dataset.explain;
      hots.forEach(function (x) { x.setAttribute('aria-pressed', String(x === h)); });
      if (key === 'head-activity' || key === 'card-blocked') showActivity(true);
      else if (key === 'nav-home') showActivity(false);
      explain(key, { n: state.blockedToday });
      walkerAwake();
    });
  });
  document.getElementById('nlBack').addEventListener('click', function () { showActivity(false); explain('back-home'); walkerAwake(); });
  document.querySelector('.phone-demo').addEventListener('pointerdown', function () { walkerAwake(); });
  document.getElementById('replay').addEventListener('click', function () { start(); showActivity(true); explain('row-site', { d: 'www.cnn.com' }); });

  // Rook on video: only where transparent WebM plays properly (not Safari or anything on iOS), never with reduced motion.
  var ua = navigator.userAgent;
  var appleWebKit = /iP(hone|ad|od)/.test(ua) || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua));
  var canClip = !reduce && !appleWebKit && !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');
  var CLIP = { wave: true, walk: true, turn: false, back: false };   // name -> loops?
  var CYCLE = 33 / 24;          // one walk cycle (two steps), seconds
  var SPEED = 0.5043;           // ground speed, in element widths per second, measured from the planted foot
  function clips(media) {       // one <video> per clip, stacked; only the playing one is visible
    if (!canClip) return null;
    if (media.rk) return media.rk;
    var set = {};
    Object.keys(CLIP).forEach(function (n) {
      var v = document.createElement('video');
      v.muted = true; v.loop = CLIP[n]; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
      v.src = SITE + 'assets/mascot/rook-' + n + '.webm';
      media.appendChild(v); set[n] = v;
    });
    media.rk = { v: set, cur: null };
    return media.rk;
  }
  function preload(media, names) {
    var c = clips(media); if (!c) return Promise.resolve();
    return Promise.all(names.map(function (n) {
      var v = c.v[n]; if (v.readyState >= 4) return 1;
      v.preload = 'auto'; v.load();
      return new Promise(function (res) { v.addEventListener('canplaythrough', res, { once: true }); setTimeout(res, 6000); });
    }));
  }
  function show(media, name) {  // play a clip; resolves when a one-shot clip ends (loops resolve at once)
    var c = clips(media); if (!c) return Promise.resolve();
    var v = c.v[name]; v.currentTime = 0;
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    return new Promise(function (res) {
      var swap = function () {
        v.classList.add('on'); media.classList.add('has-video');
        Object.keys(c.v).forEach(function (n) { if (n !== name) { c.v[n].classList.remove('on'); c.v[n].pause(); } });
        c.cur = name;
      };
      if (v.readyState >= 3) requestAnimationFrame(swap); else v.addEventListener('playing', swap, { once: true });
      if (CLIP[name]) res(); else v.addEventListener('ended', function () { res(); }, { once: true });
    });
  }
  function pauseAll(media, on) {
    var c = media.rk; if (!c || !c.cur) return;
    var v = c.v[c.cur]; if (on) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
  }

  // Rook on the phone: walks to and fro along the top of the protection card, as he does in the app, and
  // stands still 15 s after the last touch (the app's MotionIdle). Only while the demo is on screen; with
  // reduced motion, or no transparent WebM, he just stands there.
  var walkway = document.getElementById('nlWalkway'), walker = document.getElementById('nlWalker');
  var wk = { video: null, on: false, visible: false, x: null, dir: -1, last: 0, idleAt: 0 };
  function walkerVideo() {
    if (!canClip) return null;
    if (wk.video) return wk.video;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    v.src = SITE + 'assets/mascot/rook-walk.webm';
    v.addEventListener('playing', function () { v.classList.add('on'); walker.classList.add('has-video'); }, { once: true });
    walker.appendChild(v); wk.video = v;
    return v;
  }
  function walkerRange() { return Math.max(0, walkway.clientWidth - walker.offsetWidth); }
  // The walk clip faces left; walking right, he is mirrored.
  function walkerPlace() { walker.style.transform = 'translateX(' + wk.x + 'px)'; walker.classList.toggle('flip', wk.dir > 0); }
  function walkerStep(t) {
    if (!wk.on) return;
    var dt = wk.last ? Math.min(0.1, (t - wk.last) / 1000) : 0; wk.last = t;
    if (Date.now() >= wk.idleAt) { wk.on = false; wk.last = 0; if (wk.video) wk.video.pause(); return; }
    var max = walkerRange();
    if (wk.x === null) wk.x = max * 0.62;
    wk.x += wk.dir * SPEED * walker.offsetWidth * dt;
    if (wk.x <= 0) { wk.x = 0; wk.dir = 1; } else if (wk.x >= max) { wk.x = max; wk.dir = -1; }
    walkerPlace();
    requestAnimationFrame(walkerStep);
  }
  function walkerAwake() {
    wk.idleAt = Date.now() + 15000;
    if (wk.x === null) { wk.x = walkerRange() * 0.62; walkerPlace(); }
    if (!wk.visible || wk.on) return;
    var v = walkerVideo(); if (!v) return;
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    wk.on = true; wk.last = 0; requestAnimationFrame(walkerStep);
  }
  function walkerSeen(on) {
    wk.visible = on;
    if (on) walkerAwake(); else { wk.on = false; wk.last = 0; if (wk.video) wk.video.pause(); }
  }
  addEventListener('resize', function () { if (wk.x !== null) { wk.x = Math.min(wk.x, walkerRange()); walkerPlace(); } });

  // Rook: walks in, talks through a few tips, then walks to the other side.
  // Each tip is [text, bold] pieces, put on the page as text and <b> elements.
  var TIPS = [
    [["Hi, I'm Rook.", true], [' Welcome to AshtaLok!']],
    [['I stand on the wall. '], ['Ads and trackers stop here.', true]],
    [['Real sites get through, looked up over encrypted DNS.']],
    [['Everything I decide, '], ['I decide on your phone.', true]],
    [['Light, Balanced or Strict. '], ['Balanced suits most people.', true]],
    [['Something broke? '], ['Pause me for 5 minutes', true], [', or allow just that site.']],
    [['Your passwords stay on your phone, '], ['locked with a password only you know.', true]],
    [['Want to see me work? '], ['Try the app just below.', true]]
  ];
  var TIPS_PER_SIDE = 3;
  var guide = document.getElementById('guide'), gWalk = guide.querySelector('.rk-walk'), gMedia = guide.querySelector('.rk-media');
  var bubble = document.getElementById('bubble'), bText = document.getElementById('bubbleText'), dots = document.getElementById('bubbleDots');
  var tip = -1, tipTimer = null, guideVisible = true, onSide = 0, busy = true, gx = 0;
  TIPS.forEach(function () { dots.appendChild(document.createElement('i')); });
  function wave(el) { el.classList.remove('waving'); void el.offsetWidth; el.classList.add('waving'); }
  function spot(side) {           // x of Rook's box for each side, inside the hero's content column
    var W = guide.clientWidth, w = gWalk.offsetWidth, m = innerWidth > 1000 ? -Math.min(60, w * 0.18) : -w * 0.12;
    return side === 'left' ? m : W - w - m;
  }
  function place(x) { gx = x; gWalk.style.transform = 'translateX(' + x + 'px)'; }
  function walkTo(x) {            // walk at the measured stride speed, in whole cycles so he stops mid-stride-cycle cleanly
    var w = gWalk.offsetWidth, from = gx, dist = Math.abs(x - from);
    var n = Math.max(1, Math.round(dist / (SPEED * w * CYCLE))), dur = n * CYCLE * 1000;
    return show(gMedia, 'walk').then(function () {
      var anim = gWalk.animate([{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + x + 'px)' }], { duration: dur, easing: 'linear' });
      return anim.finished.then(function () { place(x); });
    });
  }
  function nextTip() {
    tip = (tip + 1) % TIPS.length; onSide++;
    bubble.setAttribute('data-hide', 'true');
    setTimeout(function () {
      bText.replaceChildren();
      TIPS[tip].forEach(function (p) { bText.appendChild(p[1] ? el('b', null, p[0]) : document.createTextNode(p[0])); });
      [].forEach.call(dots.children, function (d, i) { d.className = i === tip ? 'on' : ''; });
      bubble.setAttribute('data-hide', 'false');
      if (onSide === 1) wave(gWalk);
    }, 250);
  }
  function arrive(side) {
    guide.dataset.side = side; guide.classList.remove('moving'); guide.classList.add('still');
    onSide = 0; busy = false; nextTip(); runTips();
  }
  function travel(side, viaEdges) {   // turn, walk left (off the left edge and back in from the right if needed), turn back
    busy = true; guide.classList.add('moving'); guide.classList.remove('still'); bubble.setAttribute('data-hide', 'true');
    if (!canClip) {                   // no clips: a quiet fade, never a fake walk
      guide.classList.add('hidden');
      return new Promise(function (r) { setTimeout(r, 500); }).then(function () { place(spot(side)); guide.classList.remove('hidden'); arrive(side); });
    }
    return show(gMedia, 'turn').then(function () {
      if (!viaEdges) return walkTo(spot(side));
      return walkTo(-gWalk.offsetWidth - 40).then(function () { place(guide.clientWidth + 40); return walkTo(spot(side)); });
    }).then(function () { return show(gMedia, 'back'); }).then(function () { show(gMedia, 'wave'); arrive(side); });
  }
  function tick() {
    if (busy || !guideVisible || document.hidden) return;
    if (onSide < TIPS_PER_SIDE) { nextTip(); return; }
    clearInterval(tipTimer);
    // from the right he strolls left across the headline; from the left he walks off and comes back in from the right
    if (guide.dataset.side === 'right') travel('left', false); else travel('right', true);
  }
  function runTips() { clearInterval(tipTimer); tipTimer = setInterval(tick, 4200); }
  function tapGuide() { if (busy) return; nextTip(); runTips(); }
  gWalk.addEventListener('click', tapGuide);
  gWalk.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapGuide(); } });
  addEventListener('resize', function () { if (!busy) place(spot(guide.dataset.side)); });
  // Entrance, after the page has loaded: walk in from the right edge, behind the headline, to the left spot.
  function enter() {
    if (!canClip) { place(spot('left')); guide.classList.remove('hidden'); arrive('left'); return; }
    preload(gMedia, ['walk', 'back', 'wave']).then(function () {
      place(guide.clientWidth + 40); guide.classList.remove('hidden'); guide.classList.add('moving');
      return walkTo(spot('left'));
    }).then(function () { return show(gMedia, 'back'); }).then(function () { show(gMedia, 'wave'); arrive('left'); preload(gMedia, ['turn']); });
  }
  if (document.readyState === 'complete') enter(); else addEventListener('load', enter);
  // The goodbye Rook at the bottom just waves.
  var closing = document.getElementById('closingRook');
  function playClip(media, on) { if (!media || !canClip) return; if (on) { if (!media.rk || !media.rk.cur) show(media, 'wave'); else pauseAll(media, true); } else pauseAll(media, false); }

  // The coach next to the phone: waves hello when the demo comes into view, then presents whatever was tapped.
  function coachSetup() {
    if (!canClip) return null;
    if (fig.rkv) return fig.rkv;
    function mk(src, cls, loop) {
      var v = document.createElement('video');
      v.muted = true; v.loop = loop; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
      v.src = SITE + 'assets/mascot/' + src; v.className = cls; fig.appendChild(v); return v;
    }
    fig.rkv = { w: mk('rook-wave.webm', 'v-wave', true), p: mk('rook-present.webm', 'v-present', false) };
    return fig.rkv;
  }
  function coachShow(v) {
    var c = fig.rkv, pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    var sw = function () {
      v.classList.add('on'); fig.classList.add('has-video');
      [c.w, c.p].forEach(function (x) { if (x !== v) { x.classList.remove('on'); setTimeout(function () { x.pause(); }, 220); } });
    };
    if (v.readyState >= 3) requestAnimationFrame(sw); else v.addEventListener('playing', sw, { once: true });
  }
  function coachHello(on) {
    var c = coachSetup(); if (!c) return;
    if (!on) { c.w.pause(); if (!c.p.ended) c.p.pause(); return; }
    if (!fig.rkMode) { fig.rkMode = 'wave'; coachShow(c.w); c.p.preload = 'auto'; c.p.load(); cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); }
    else if (fig.rkMode === 'wave') { var pr = c.w.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }
  function coachPresent() {             // replay the presenting gesture from the start for every tap, then hold the pose
    var c = coachSetup(); if (!c) return;
    fig.rkMode = 'present'; c.p.currentTime = 0; coachShow(c.p);
  }

  // Wave hello (or goodbye) whenever a Rook scrolls into view
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (el === guide) { guideVisible = en.isIntersecting; if (!busy) pauseAll(gMedia, en.isIntersecting); return; }
        if (el.classList.contains('stage')) { el.classList.toggle('seen', en.isIntersecting); coachHello(en.isIntersecting); walkerSeen(en.isIntersecting); return; }
        var b = el.querySelector('.bubble');
        if (en.isIntersecting) {
          if (el.id === 'faqAv') { el.classList.remove('hello'); void el.offsetWidth; el.classList.add('hello'); }
          else { wave(el); playClip(el.querySelector('.rk-media'), true); }
          if (b) setTimeout(function () { b.setAttribute('data-hide', 'false'); }, 300);
        } else { if (b) b.setAttribute('data-hide', 'true'); playClip(el.querySelector('.rk-media'), false); }
      });
    }, { threshold: 0.45 });
    [guide, document.querySelector('.stage'), document.getElementById('faqAv'), document.getElementById('closingRook')].forEach(function (el) { io.observe(el); });
  }

  start();
})();
