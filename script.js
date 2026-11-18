(() => {
  'use strict';
  /* ===== Configuração interna ===== */
  const WA_NUMBER = '5544984564559';
  const WA_TEXT = 'Olá, Silvia! Vim pelo site e gostaria de agendar um horário.';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ===== WhatsApp + métricas internas (a origem do botão fica só no tracking) ===== */
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  $$('[data-wa]').forEach(a => {
    a.href = waUrl; a.target = '_blank';
    a.addEventListener('click', () => {
      const source = a.dataset.wa;
      try {
        (window.dataLayer = window.dataLayer || []).push({ event: 'whatsapp_click', source, page: 'site' });
        if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { event_category: 'lead', event_label: source });
        if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { source });
        const k = 'wa_clicks'; const d = JSON.parse(localStorage.getItem(k) || '{}'); d[source] = (d[source] || 0) + 1; localStorage.setItem(k, JSON.stringify(d));
      } catch (e) {}
    });
  });

  /* ===== Proteção leve de mídia ===== */
  document.addEventListener('contextmenu', e => { if (e.target.closest('.nosave,img,video,.foot-logo')) e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (e.target.closest('img,video,.nosave')) e.preventDefault(); });
  $('#year').textContent = new Date().getFullYear();

  /* ===== Loader ===== */
  const loader = $('#loader');
  setTimeout(() => loader.classList.add('done'), reduce ? 0 : 1500);
  setTimeout(() => loader.classList.add('done'), 3500);

  /* ===== Split do título ===== */
  let ci = 0;
  const split = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part || /^\s+$/.test(part)) { frag.append(' '); return; }
        const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', ci++); s.textContent = ch; w.append(s); });
        frag.append(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) split(n);
  });
  split($('#h1'));

  /* ===== Reveal ===== */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  // Elementos recortados (clip-path) têm área visível zero e não disparam o observador: observa-se o pai.
  const clipMap = new Map();
  const cpio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cpio.unobserve(e.target);
    (clipMap.get(e.target) || []).forEach(c => c.classList.add('in'));
  }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal-clip').forEach(el => { const p = el.parentElement; if (!clipMap.has(p)) { clipMap.set(p, []); cpio.observe(p); } clipMap.get(p).push(el); });

  /* ===== Contadores ===== */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now();
    const f = t => { const p = clamp((t - t0) / 1800), v = to * (1 - Math.pow(1 - p, 4)); el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ===== Linhas do corpo (desenho) ===== */
  $$('.bodyline path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 20));

  /* ===== Scroll: progresso, parallax, passos ===== */
  const nav = $('#nav'), bar = $('#progress'), photo = $('#heroPhoto');
  const prep = $('#preparo'), steps = $$('#steps .step'), pfill = $('#pfill');
  const par = $$('[data-speed]');
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('stuck', y > 40);
    if (y < vh * 1.2 && !reduce) photo.style.transform = `translateY(${y * -0.08}px) rotate(${y * 0.012}deg)`;
    if (prep) {
      const r = prep.getBoundingClientRect(), p = clamp(-r.top / (r.height - vh));
      pfill.style.transform = `scaleX(${p})`;
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      steps.forEach((s, i) => s.classList.toggle('on', i <= idx));
    }
    $$('.reveal-clip:not(.in)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in'); });
    par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed) - 20}px)`; });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); update();

  /* ===== Cursor de luz, tilt, magnético ===== */
  const cur = $('#cursor');
  if (matchMedia('(hover:hover)').matches && !reduce) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    (function m() { cx += (tx - cx) * .12; cy += (ty - cy) * .12; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(m); })();
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.style.setProperty('--ry', (x - .5) * 10 + 'deg'); c.style.setProperty('--rx', (.5 - y) * 10 + 'deg'); c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%'); });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* ===== Menu mobile ===== */
  const burger = $('#burger'), menu = $('#menu');
  const toggle = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => toggle(!menu.classList.contains('open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* ===== Vídeos: carrega e toca só quando visíveis ===== */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .5 });
  $$('video[data-src]').forEach(v => { v.disablePictureInPicture = true; v.setAttribute('controlsList', 'nodownload noplaybackrate'); vio.observe(v); });

  /* ===== Pétalas (canvas) ===== */
  const cv = $('#petals'), ctx = cv.getContext('2d'); let W, H, ps = [];
  const mk = init => ({ x: Math.random() * W, y: init ? Math.random() * H : -20, s: (Math.random() * 9 + 5) * dpr, vy: (Math.random() * .6 + .25) * dpr, vx: (Math.random() - .5) * .4 * dpr, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, ph: Math.random() * 6.28, c: Math.random() < .25 ? '158,171,112' : '255,255,255', a: Math.random() * .4 + .2 });
  let dpr = 1;
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = cv.offsetWidth * dpr; H = cv.height = cv.offsetHeight * dpr; ps = Array.from({ length: Math.round(Math.min(46, W / dpr / 26)) }, () => mk(true)); };
  resize(); addEventListener('resize', resize);
  let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
  (function draw() {
    if (vis) {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.y += p.vy; p.ph += .015; p.x += p.vx + Math.sin(p.ph) * .6 * dpr; p.r += p.vr;
        if (p.y > H + 30) ps[i] = mk(false);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, .55 + Math.abs(Math.sin(p.ph)) * .45);
        ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.bezierCurveTo(p.s * .8, -p.s * .4, p.s * .6, p.s * .6, 0, p.s); ctx.bezierCurveTo(-p.s * .6, p.s * .6, -p.s * .8, -p.s * .4, 0, -p.s); ctx.fill(); ctx.restore();
      });
    }
    if (!reduce) requestAnimationFrame(draw);
  })();
})();
