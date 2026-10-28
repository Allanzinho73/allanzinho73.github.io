/* Allan Kenji Honda — page interactions. Vanilla JS, no dependencies.
   demos.js (the playable projects) loads after this file and registers
   its own commands in AKH.actions. */
(() => {
  'use strict';

  const AKH = (window.AKH = window.AKH || {});
  AKH.actions = AKH.actions || [];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EMAIL = 'allanhonda73@gmail.com';
  const LINKS = {
    resume: $('[data-resume]') ? $('[data-resume]').getAttribute('href') : '',
    linkedin: 'https://www.linkedin.com/in/allan-honda-b0a80a290/',
    github: 'https://github.com/allanzinho73',
  };
  AKH.reduceMotion = reduceMotion;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* When an element first scrolls into view, run fn once. */
  AKH.onVisible = (el, fn, threshold = 0.25) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { threshold });
    io.observe(el);
  };

  AKH.scrollTo = (el, block = 'start') => {
    if (typeof el === 'string') el = $(el);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block });
  };

  /* ---------- Toast + copy ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  };
  AKH.toast = toast;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(text === EMAIL ? 'Email copied. Talk soon!' : 'Copied');
    } catch {
      toast(`Copy didn’t work here. It’s ${text}`);
    }
  };
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', () => copyText(btn.dataset.copy)));

  /* ---------- Theme (circle reveal from the toggle where supported) ---------- */
  const themeBtn = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeMeta.setAttribute('content', t === 'light' ? '#f4f6fa' : '#06090f');
    themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  };
  const toggleTheme = () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    store.set('theme', next);
    if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => applyTheme(next));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  };
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  themeBtn.addEventListener('click', toggleTheme);

  /* ---------- Keyboard hint (⌘K on Apple devices) ---------- */
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (isMac) $$('[data-kbd]').forEach((k) => { k.textContent = '⌘K'; });
  if (!finePointer) $$('[data-nav-hint]').forEach((s) => { s.textContent = 'Tap Menu to get around.'; });

  /* ---------- Nav: scrolled state, progress bar, scroll spy ---------- */
  const navWrap = $('.nav-wrap');
  const progress = $('.progress span');
  const navLinks = $$('.links a');
  const pill = $('.links .pill');
  let activeLink = null;

  const movePill = () => {
    if (!activeLink || !activeLink.offsetWidth) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${activeLink.offsetWidth}px`;
    pill.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  };
  const setActive = (id) => {
    activeLink = navLinks.find((a) => a.getAttribute('href') === `#${id}`) || null;
    navLinks.forEach((a) => (a === activeLink ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    movePill();
  };
  const spyTargets = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const inBand = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)));
    const current = spyTargets.find((s) => inBand.has(s.id));
    setActive(current ? current.id : null);
  }, { rootMargin: '-45% 0px -50% 0px' });
  spyTargets.forEach((s) => spy.observe(s));
  addEventListener('resize', movePill);

  /* Experience timeline fills as you scroll past it */
  const tlWrap = $('.timeline-wrap');
  const tlFill = $('.tl-fill');
  const tlItems = $$('.tl-item');
  const updateTimeline = () => {
    if (!tlWrap) return;
    const r = tlWrap.getBoundingClientRect();
    const mid = innerHeight * 0.62;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    tlFill.style.transform = `scaleY(${p.toFixed(4)})`;
    tlItems.forEach((li) => li.classList.toggle('lit', li.getBoundingClientRect().top + 14 < mid));
  };

  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const y = scrollY;
      const max = root.scrollHeight - innerHeight;
      navWrap.classList.toggle('scrolled', y > 8);
      progress.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
      updateTimeline();
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Cursor light: background grid + card borders ---------- */
  if (finePointer && !reduceMotion) {
    const spot = $('.bg-spot');
    let mx = 0;
    let my = 0;
    let queued = false;
    addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      const card = e.target.closest && e.target.closest('.glow-card');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--gx', `${e.clientX - r.left}px`);
        card.style.setProperty('--gy', `${e.clientY - r.top}px`);
      }
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        spot.style.setProperty('--mx', `${mx}px`);
        spot.style.setProperty('--my', `${my}px`);
      });
    }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealGroups = new Map();
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (revealGroups.get(e.target) || []).forEach((el) => el.classList.add('in'));
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  $$('.reveal').forEach((el) => {
    // A heading fully hidden by clip-path never counts as visible, so watch its parent instead.
    const watch = el.matches('.sec-head h2') ? el.parentElement : el;
    if (!revealGroups.has(watch)) revealGroups.set(watch, []);
    revealGroups.get(watch).push(el);
    revealIO.observe(watch);
  });

  /* ---------- Stat counters ---------- */
  const countUp = (el) => {
    const n = $('.n', el);
    const to = parseFloat(el.dataset.count);
    const from = parseFloat(el.dataset.from || '0');
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { n.textContent = to.toFixed(dec); return; }
    const t0 = performance.now();
    const dur = 1500;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      n.textContent = (from + (to - from) * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('.stat-num[data-count]').forEach((el) => {
    if (!reduceMotion) $('.n', el).textContent = parseFloat(el.dataset.from || '0').toFixed(parseInt(el.dataset.decimals || '0', 10));
    AKH.onVisible(el, () => countUp(el), 0.6);
  });

  /* ---------- Hero name: letters swell toward the cursor ---------- */
  const nameLine = $('.name-line');
  if (nameLine) {
    const words = nameLine.textContent.trim().split(/\s+/);
    const letters = [];
    nameLine.textContent = '';
    let i = 0;
    words.forEach((w, wi) => {
      const word = document.createElement('span');
      word.className = 'word';
      [...w].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.style.setProperty('--i', i++);
        word.append(s);
        letters.push({ el: s, wg: 650, wd: 88, heat: 0, lift: 0 });
      });
      nameLine.append(word);
      if (wi < words.length - 1) nameLine.append(' ');
    });
    const caret = document.createElement('span');
    caret.className = 'caret';
    nameLine.lastElementChild.append(caret);

    if (!reduceMotion) {
      const hero = $('.hero');
      const RADIUS = 260;
      let px = -1e5;
      let py = -1e5;
      let running = false;
      let sweeping = false;

      const frame = () => {
        const rects = letters.map((L) => L.el.getBoundingClientRect());
        let moving = false;
        letters.forEach((L, k) => {
          const r = rects[k];
          const d = Math.hypot(px - (r.left + r.width / 2), (py - (r.top + r.height / 2)) * 1.3);
          let t = Math.max(0, 1 - d / RADIUS);
          t = t * t * (3 - 2 * t);
          const tw = 650 + 150 * t;
          const td = 88 + 12 * t;
          L.wg += (tw - L.wg) * 0.18;
          L.wd += (td - L.wd) * 0.18;
          L.heat += (t * 0.85 - L.heat) * 0.18;
          L.lift += (t * 10 - L.lift) * 0.18;
          if (Math.abs(tw - L.wg) > 0.4 || Math.abs(t * 0.85 - L.heat) > 0.004) moving = true;
          const st = L.el.style;
          st.setProperty('--wg', L.wg.toFixed(1));
          st.setProperty('--wd', L.wd.toFixed(2));
          st.setProperty('--heat', L.heat.toFixed(3));
          st.setProperty('--lift', L.lift.toFixed(2));
        });
        if (moving || sweeping) requestAnimationFrame(frame);
        else running = false;
      };
      const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

      // One slow sweep across the name, so touch users see the effect too.
      const sweep = () => {
        if (sweeping || scrollY > innerHeight) return;
        const r = nameLine.getBoundingClientRect();
        const t0 = performance.now();
        const dur = 1700;
        sweeping = true;
        const step = (now) => {
          if (!sweeping) return;
          const p = Math.min(1, (now - t0) / dur);
          px = r.left - 120 + (r.width + 240) * p;
          py = r.top + r.height * 0.55;
          if (p < 1) requestAnimationFrame(step);
          else { sweeping = false; px = py = -1e5; }
        };
        requestAnimationFrame(step);
        kick();
      };

      if (finePointer) {
        hero.addEventListener('pointermove', (e) => { sweeping = false; px = e.clientX; py = e.clientY; kick(); }, { passive: true });
        hero.addEventListener('pointerleave', () => { px = py = -1e5; kick(); });
        setTimeout(sweep, 1300);
      } else {
        setTimeout(sweep, 1300);
        setInterval(() => { if (!document.hidden) sweep(); }, 7000);
      }
    }
  }

  /* ---------- Rotating phrase with a scramble effect ---------- */
  const rot = $('.rot-text');
  if (rot && !reduceMotion) {
    const phrases = ['repetitive work', '3-minute forms', 'messy spreadsheets', 'manual reports', 'copy-paste routines'];
    const glyphs = '#%&*+=<>/\\[]{}01_';
    let idx = 0;
    const scrambleTo = (next) => {
      const prev = rot.textContent;
      const len = Math.max(prev.length, next.length);
      const t0 = performance.now();
      const dur = 750;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        let out = '';
        for (let k = 0; k < len; k++) {
          const settle = (k / len) * 0.7 + 0.3;
          if (p >= settle) out += next[k] || '';
          else if (p > settle - 0.32) out += next[k] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
          else out += prev[k] || '';
        }
        rot.textContent = out;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    setInterval(() => {
      if (document.hidden || scrollY > innerHeight) return;
      idx = (idx + 1) % phrases.length;
      scrambleTo(phrases[idx]);
    }, 2800);
  }

  /* ---------- The race: one license record, by hand vs. the AI agent ----------
     Times are in simulated seconds and replayed at 12x speed. */
  const race = $('#race');
  if (race) {
    const SPEED = 12;
    const VALUES = ['LIC-2041-SP', '2026-03-12', '2027-03-12', 'license_2041.pdf'];
    const PLAN = {
      manual: {
        end: 120,
        fields: [[5, 31], [37, 55], [61, 79], [88, 108]],
        status: [[0, 'opening the PDF…'], [5, 'typing it in…'], [80, 'looking for the file…'], [108, 'saving…']],
      },
      agent: {
        end: 30,
        fields: [[10, 13], [13, 16], [16, 19], [19, 25]],
        status: [[0, 'reading the PDF…'], [10, 'filling the form…'], [19, 'attaching the file…'], [25, 'saving…']],
      },
    };
    const lanes = {};
    Object.keys(PLAN).forEach((key) => {
      const el = $(`[data-lane="${key}"]`, race);
      lanes[key] = {
        el,
        clock: $('[data-clock]', el),
        status: $('[data-status]', el),
        bar: $('[data-bar]', el),
        fields: $$('[data-field]', el).map((f) => ({ f, out: $('output', f), text: null, state: null })),
      };
    });
    const verdict = $('#race-verdict');
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    // People type unevenly; keep it monotonic so text never "un-types".
    const human = (p) => Math.min(1, Math.max(0, p + 0.045 * Math.sin(p * Math.PI * 5)));

    const renderLane = (key, t) => {
      const P = PLAN[key];
      const L = lanes[key];
      const tt = Math.min(t, P.end);
      L.clock.textContent = fmt(tt);
      L.bar.style.transform = `scaleX(${(tt / P.end).toFixed(4)})`;
      P.fields.forEach(([a, b], i) => {
        const F = L.fields[i];
        const val = VALUES[i];
        const isFile = i === VALUES.length - 1;
        let text = '';
        let state = '';
        if (t >= b) { text = val; state = 'filled'; }
        else if (t >= a) {
          state = 'typing';
          if (isFile) text = key === 'agent' ? 'uploading…' : 'browsing…';
          else {
            const p = (t - a) / (b - a);
            text = val.slice(0, key === 'agent' ? Math.ceil(val.length * p) : Math.floor(val.length * human(p)));
          }
        }
        if (text !== F.text) { F.out.textContent = text; F.text = text; }
        if (state !== F.state) {
          F.f.classList.toggle('typing', state === 'typing');
          F.f.classList.toggle('filled', state === 'filled');
          F.f.classList.toggle('file', isFile && state === 'filled');
          F.state = state;
        }
      });
      const done = t >= P.end;
      let status = P.status[0][1];
      P.status.forEach(([at, s]) => { if (t >= at) status = s; });
      L.status.textContent = done ? '✓ saved' : status;
      L.el.classList.toggle('done', done);
      L.el.dataset.phase = done ? 'done' : t < P.fields[0][0] ? 'read' : 'work';
    };

    let t0 = 0;
    let raf = 0;
    const frame = (now) => {
      const t = ((now - t0) / 1000) * SPEED;
      renderLane('manual', t);
      renderLane('agent', t);
      if (t >= PLAN.agent.end && !race.dataset.agentDone) {
        race.dataset.agentDone = '1';
        verdict.innerHTML = '<strong>Agent: done in 0:30.</strong> Still typing by hand…';
      }
      if (t < PLAN.manual.end) raf = requestAnimationFrame(frame);
      else {
        race.classList.add('finished');
        verdict.innerHTML = '<strong>Agent 0:30</strong> · by hand 2:00 in this replay (1–3 min in real life)';
      }
    };
    const start = () => {
      cancelAnimationFrame(raf);
      race.classList.remove('finished');
      delete race.dataset.agentDone;
      verdict.textContent = 'Replayed at 12× speed';
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    AKH.replayRace = () => {
      AKH.scrollTo(race, 'center');
      setTimeout(start, reduceMotion ? 0 : 450);
    };

    if (reduceMotion) {
      renderLane('manual', 999);
      renderLane('agent', 999);
      race.classList.add('finished');
      verdict.innerHTML = '<strong>Agent 0:30</strong> · by hand 1–3 min';
    } else {
      AKH.onVisible(race, () => setTimeout(start, 500), 0.35);
    }
    $('#race-replay').addEventListener('click', start);
    $$('[data-action="race"]').forEach((b) => b.addEventListener('click', AKH.replayRace));
  }

  /* ---------- About: ID badge tilts toward the cursor ---------- */
  const badge = $('#badge');
  if (badge && finePointer && !reduceMotion) {
    const stage = badge.parentElement;
    stage.addEventListener('pointermove', (e) => {
      const r = badge.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      badge.classList.add('tilting');
      badge.style.setProperty('--ry', `${((x - 0.5) * 18).toFixed(2)}deg`);
      badge.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`);
      badge.style.setProperty('--sx', `${(x * 100).toFixed(1)}%`);
      badge.style.setProperty('--sy', `${(y * 100).toFixed(1)}%`);
    });
    stage.addEventListener('pointerleave', () => {
      badge.classList.remove('tilting');
      badge.style.setProperty('--rx', '0deg');
      badge.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- Skills filter ---------- */
  const skillGroups = $('.skill-groups');
  const filterBtns = $$('.filter');
  const skillItems = $$('.skill-list li');
  filterBtns.forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? skillItems.length : skillItems.filter((li) => li.dataset.tags.split(' ').includes(f)).length;
    const c = document.createElement('span');
    c.className = 'count';
    c.textContent = n;
    btn.append(c);
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      skillGroups.classList.toggle('filtering', f !== 'all');
      skillItems.forEach((li) => li.classList.toggle('match', f === 'all' || li.dataset.tags.split(' ').includes(f)));
    });
  });

  /* ---------- Local time in São Paulo ---------- */
  const clockEl = $('#sp-clock');
  const clockStatus = $('#sp-status');
  const spFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const tickClock = () => {
    const parts = Object.fromEntries(spFormat.formatToParts(new Date()).map((p) => [p.type, p.value]));
    clockEl.innerHTML = `${parts.hour}<span class="colon">:</span>${parts.minute}`;
    const mins = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    const weekend = parts.weekday === 'Sat' || parts.weekday === 'Sun';
    let msg;
    let state;
    if (mins < 7 * 60 || mins >= 23 * 60) { msg = 'Probably asleep. I’ll reply in the morning.'; state = 'idle'; }
    else if (weekend) { msg = 'Weekend mode, but I still read email.'; state = 'idle'; }
    else if (mins < 18 * 60) { msg = 'Probably at work right now.'; state = 'on'; }
    else { msg = 'Probably in class at Mackenzie.'; state = 'busy'; }
    clockStatus.textContent = msg;
    clockStatus.dataset.state = state;
  };
  if (clockEl) { tickClock(); setInterval(tickClock, 20000); }

  /* ---------- Live repos from the GitHub API ---------- */
  const ghBox = $('#gh');
  const LANG_COLORS = {
    Python: '#3572A5', Java: '#b07219', C: '#555555', 'C++': '#f34b7d', HTML: '#e34c26', CSS: '#563d7c',
    JavaScript: '#f1e05a', TypeScript: '#3178c6', 'Jupyter Notebook': '#DA5B0B', Shell: '#89e051',
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = (iso) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (new Date(iso) - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [u, s] of units) if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), u);
    return 'just now';
  };
  const loadRepos = async () => {
    let repos;
    try {
      const cached = sessionStorage.getItem('gh-repos');
      if (cached) repos = JSON.parse(cached);
    } catch { /* storage blocked */ }
    if (!repos) {
      try {
        const res = await fetch('https://api.github.com/users/allanzinho73/repos?sort=pushed&per_page=30', {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) return;
        repos = (await res.json()).map((r) => ({
          name: r.name, url: r.html_url, desc: r.description, lang: r.language,
          stars: r.stargazers_count, pushed: r.pushed_at, fork: r.fork, archived: r.archived,
        }));
        try { sessionStorage.setItem('gh-repos', JSON.stringify(repos)); } catch { /* ignore */ }
      } catch { return; }
    }
    const list = repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => new Date(b.pushed) - new Date(a.pushed))
      .slice(0, 4);
    if (!list.length) return;
    $('#gh-list').innerHTML = list.map((r) => `
      <li><a class="repo glow-card" href="${esc(r.url)}" target="_blank" rel="noopener">
        <span class="repo-name">${esc(r.name)}</span>
        <span class="repo-desc">${esc(r.desc || (r.name.endsWith('.github.io') ? 'This website.' : 'No description yet.'))}</span>
        <span class="repo-meta">
          ${r.lang ? `<span><i class="lang-dot" style="background:${LANG_COLORS[r.lang] || '#8592a8'}"></i>${esc(r.lang)}</span>` : ''}
          ${r.stars ? `<span>★ ${r.stars}</span>` : ''}
          <span>updated ${esc(ago(r.pushed))}</span>
        </span>
      </a></li>`).join('');
    ghBox.hidden = false;
  };
  if (ghBox) AKH.onVisible($('#projects'), loadRepos, 0);

  /* ---------- Command palette (Ctrl/⌘ + K) ---------- */
  const pal = $('#palette');
  const palInput = $('#palette-input');
  const palList = $('#palette-list');
  const go = (sel) => () => AKH.scrollTo(sel);
  const openUrl = (url) => () => window.open(url, '_blank', 'noopener');
  const baseActions = [
    { group: 'Go to', label: 'About', icon: '01', run: go('#about') },
    { group: 'Go to', label: 'Experience', icon: '02', run: go('#experience') },
    { group: 'Go to', label: 'Projects', icon: '03', run: go('#projects') },
    { group: 'Go to', label: 'Skills', icon: '04', run: go('#skills') },
    { group: 'Go to', label: 'Contact', icon: '05', run: go('#contact') },
    { group: 'Go to', label: 'Back to top', icon: '↑', run: go('#top') },
    { group: 'Actions', label: 'Copy my email', icon: '@', hint: EMAIL, run: () => copyText(EMAIL) },
    { group: 'Actions', label: 'Open my resume (PDF)', icon: '↗', keywords: 'cv curriculum', run: openUrl(LINKS.resume) },
    { group: 'Actions', label: 'Open LinkedIn', icon: 'in', run: openUrl(LINKS.linkedin) },
    { group: 'Actions', label: 'Open GitHub', icon: 'gh', run: openUrl(LINKS.github) },
    { group: 'Actions', label: 'Switch light / dark theme', icon: '◐', keywords: 'mode color', run: toggleTheme },
    { group: 'Demos', label: 'Replay the license agent race', icon: '▶', keywords: 'ai claude automation', run: () => AKH.replayRace && AKH.replayRace() },
  ];
  let shown = [];
  let sel = 0;

  const renderPalette = () => {
    const q = palInput.value.trim().toLowerCase();
    const all = [...baseActions, ...AKH.actions];
    shown = all.filter((a) => {
      if (!q) return true;
      const hay = `${a.group} ${a.label} ${a.keywords || ''}`.toLowerCase();
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    if (!shown.length) {
      palList.innerHTML = '<li class="pal-empty" role="presentation">Nothing matches. Try “projects” or “email”.</li>';
      palInput.removeAttribute('aria-activedescendant');
      return;
    }
    let html = '';
    let group = '';
    shown.forEach((a, i) => {
      if (a.group !== group) { group = a.group; html += `<li class="pal-group" role="presentation">${esc(group)}</li>`; }
      html += `<li class="pal-item" role="option" id="pal-${i}" data-i="${i}" aria-selected="${i === sel}">
        <span class="pal-ic" aria-hidden="true">${esc(a.icon || '›')}</span>
        <span class="pal-label">${esc(a.label)}</span>
        ${a.hint ? `<span class="pal-hint">${esc(a.hint)}</span>` : ''}</li>`;
    });
    palList.innerHTML = html;
    palInput.setAttribute('aria-activedescendant', `pal-${sel}`);
  };
  const highlight = (i) => {
    if (!shown.length) return;
    sel = (i + shown.length) % shown.length;
    $$('.pal-item', palList).forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i === sel)));
    palInput.setAttribute('aria-activedescendant', `pal-${sel}`);
    const el = $(`#pal-${sel}`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  };
  const runItem = (i) => {
    const a = shown[i];
    if (!a) return;
    pal.close();
    setTimeout(() => a.run(), 60);
  };
  const openPalette = () => {
    if (pal.open) return;
    palInput.value = '';
    sel = 0;
    renderPalette();
    pal.showModal();
    palInput.focus();
  };

  $('#palette-open').addEventListener('click', openPalette);
  palInput.addEventListener('input', () => { sel = 0; renderPalette(); });
  palInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(sel - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); runItem(sel); }
  });
  palList.addEventListener('click', (e) => {
    const li = e.target.closest('.pal-item');
    if (li) runItem(+li.dataset.i);
  });
  palList.addEventListener('pointermove', (e) => {
    const li = e.target.closest('.pal-item');
    if (li && +li.dataset.i !== sel) highlight(+li.dataset.i);
  });
  pal.addEventListener('click', (e) => { if (e.target === pal) pal.close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (pal.open) pal.close();
      else openPalette();
    }
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
