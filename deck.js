(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const deck = document.querySelector('.deck');
  let i = 0, on = false;

  slides.forEach((sl, k) => {
    const pg = document.createElement('div');
    pg.className = 'pg';
    pg.textContent = (k + 1) + ' / ' + slides.length;
    sl.appendChild(pg);
    const num = sl.querySelector('.num');
    if (num) num.textContent = (k + 1);
  });

  // Matches --nd-w in deck.css (min(430px, 92vw)) so the slide's available
  // width always agrees with the space the drawer actually reserves.
  function reservedW() {
    return drawerOpen ? Math.min(430, window.innerWidth * 0.92) : 0;
  }
  function fit() {
    const s = Math.min((window.innerWidth - reservedW()) / 1280, window.innerHeight / 720);
    document.documentElement.style.setProperty('--present-scale', s);
  }
  function applyZoom() {
    if (on) { deck.style.zoom = '1'; return; }
    const byW = (window.innerWidth - 80 - reservedW()) / 1280;
    const byH = (window.innerHeight - 80) / 720;
    deck.style.zoom = Math.max(0.5, Math.min(byW, byH, 1.5));
  }
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((sl, k) => sl.classList.toggle('current', k === i));
    if (drawerOpen) renderNotes();
  }
  // Previous/next slide outside present mode: there is no single "current"
  // slide in the normal scrolling view, so step from whichever slide is
  // nearest the viewport centre and scroll smoothly to the next one.
  function stepSlide(delta) {
    if (on) { show(i + delta); return; }
    const next = Math.max(0, Math.min(slides.length - 1, nearestToViewportCenter() + delta));
    slides[next].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function nearestToViewportCenter() {
    const mid = window.innerHeight / 2;
    let best = 0, bestD = Infinity;
    slides.forEach((sl, k) => {
      const r = sl.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }
  function enter() {
    const start = nearestToViewportCenter();
    on = true;
    document.body.classList.add('present');
    deck.style.zoom = '1';
    fit();
    show(start);
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }
  function exit() {
    on = false;
    document.body.classList.remove('present');
    slides.forEach(sl => sl.classList.remove('current'));
    applyZoom();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    slides[i] && slides[i].scrollIntoView({ block: 'center' });
  }

  const drawer = document.createElement('aside');
  drawer.className = 'notesdrawer';
  drawer.innerHTML =
    '<div class="nd-head"><span class="nd-ey">SPEAKER NOTES</span><span class="nd-pg"></span>' +
    '<button class="nd-x" title="Close (Esc)">✕</button></div>' +
    '<div class="nd-title"></div><div class="nd-body"></div>' +
    '<div class="nd-foot">N toggle · ←/→ pages while open · Esc closes</div>';
  document.body.appendChild(drawer);
  const ndTitle = drawer.querySelector('.nd-title');
  const ndBody  = drawer.querySelector('.nd-body');
  const ndPg    = drawer.querySelector('.nd-pg');
  let drawerOpen = false;

  function slideTitle(sl) {
    const t = sl.querySelector('.title, .dname, .dkick');
    return t ? t.textContent.trim() : 'Slide';
  }
  function renderNotes() {
    const k = on ? i : nearestToViewportCenter();
    const sl = slides[k];
    ndPg.textContent = (k + 1) + ' / ' + slides.length;
    ndTitle.textContent = slideTitle(sl);
    const note = sl.querySelector('.snotes');
    ndBody.innerHTML = note ? note.innerHTML : '<p class="empty">No notes for this slide yet.</p>';
  }
  function openDrawer() {
    renderNotes(); drawer.classList.add('open'); drawerOpen = true;
    nbtn.classList.add('armed'); document.body.classList.add('notes-open');
    on ? fit() : applyZoom();
  }
  function closeDrawer() {
    drawer.classList.remove('open'); drawerOpen = false;
    nbtn.classList.remove('armed'); document.body.classList.remove('notes-open');
    on ? fit() : applyZoom();
  }
  function toggleDrawer(){ drawerOpen ? closeDrawer() : openDrawer(); }
  drawer.querySelector('.nd-x').onclick = closeDrawer;
  document.addEventListener('mousedown', (e) => {
    if (!drawerOpen) return;
    if (drawer.contains(e.target) || (typeof nbtn !== 'undefined' && nbtn.contains(e.target))) return;
    closeDrawer();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); on ? exit() : enter(); return; }
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); toggleDrawer(); return; }
    if (e.key === 'Escape' && drawerOpen) { e.preventDefault(); closeDrawer(); return; }
    // Left/right move to the previous/next slide everywhere, not just in
    // full-screen present mode — outside it, stepSlide() scrolls instead of
    // switching a "current" slide. Skipped while typing (e.g. a comment box)
    // so the deck doesn't steal the keystroke from a text field.
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (!typing && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault(); stepSlide(e.key === 'ArrowRight' ? 1 : -1); return;
    }
    if (!on) return;
    if (e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(i + 1); }
    else if (e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
    else if (e.key === 'Escape') { exit(); }
  });
  window.addEventListener('resize', () => { on ? fit() : applyZoom(); });
  let ndRaf = 0;
  window.addEventListener('scroll', () => {
    if (!drawerOpen || on || ndRaf) return;
    ndRaf = requestAnimationFrame(() => { ndRaf = 0; renderNotes(); });
  }, { passive: true });
  applyZoom();
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && on) exit();
  });

  const btn = document.createElement('button');
  btn.className = 'present-btn';
  btn.textContent = '▶ Present';
  btn.title = 'Full-screen present (F). ←/→ or Space to move, Esc to exit.';
  btn.onclick = enter;
  document.body.appendChild(btn);

  const nbtn = document.createElement('button');
  nbtn.className = 'notes-btn';
  nbtn.textContent = '✎ Notes';
  nbtn.title = 'Speaker notes (N). Shows the current slide’s notes; ←/→ pages while open.';
  nbtn.onclick = toggleDrawer;
  document.body.appendChild(nbtn);
})();
