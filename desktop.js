(() => {
  const layer = document.querySelector('.window-layer');
  const names = { about: 'About AJ', research: 'Research', software: 'Public software', papers: 'Publications', education: 'Education & teaching', skills: 'Technical skills' };
  const windows = new Map();
  let level = 10;

  function focusWindow(win) {
    win.style.zIndex = ++level;
    for (const item of windows.values()) item.classList.toggle('active', item === win);
  }

  function openWindow(id) {
    if (!names[id]) return;
    if (windows.has(id)) {
      const win = windows.get(id);
      focusWindow(win);
      win.querySelector('button').focus();
      return;
    }
    const win = document.createElement('section');
    win.className = 'desktop-window active';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', names[id]);
    win.innerHTML = '<header class="window-bar"><strong></strong><div><button class="maximize" aria-label="Maximize window">□</button><button class="close" aria-label="Close window">×</button></div></header><div class="window-content"></div>';
    win.querySelector('strong').textContent = names[id];
    win.querySelector('.window-content').append(document.querySelector('#content-' + id).content.cloneNode(true));
    const offset = (windows.size % 4) * 22;
    win.style.left = Math.max(12, (innerWidth - Math.min(660, innerWidth - 24)) / 2 + offset - 30) + 'px';
    win.style.top = Math.min(90 + offset, innerHeight / 4) + 'px';
    windows.set(id, win);
    layer.append(win);
    focusWindow(win);
    win.querySelector('.close').addEventListener('click', () => {
      win.remove();
      windows.delete(id);
      document.querySelector('.dock a[href="#' + id + '"]').focus();
      history.replaceState(null, '', '#home');
    });
    win.querySelector('.maximize').addEventListener('click', event => {
      const maximized = win.classList.toggle('maximized');
      event.currentTarget.setAttribute('aria-label', maximized ? 'Restore window' : 'Maximize window');
    });
    win.addEventListener('pointerdown', () => focusWindow(win));
    const bar = win.querySelector('.window-bar');
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || win.classList.contains('maximized')) return;
      const bounds = win.getBoundingClientRect();
      const start = { x: event.clientX, y: event.clientY };
      bar.setPointerCapture(event.pointerId);
      function drag(e) {
        win.style.left = Math.max(0, Math.min(innerWidth - Math.min(bounds.width, 120), bounds.left + e.clientX - start.x)) + 'px';
        win.style.top = Math.max(48, Math.min(innerHeight - 120, bounds.top + e.clientY - start.y)) + 'px';
      }
      function stop() {
        bar.removeEventListener('pointermove', drag);
        bar.removeEventListener('pointerup', stop);
        bar.removeEventListener('pointercancel', stop);
      }
      bar.addEventListener('pointermove', drag);
      bar.addEventListener('pointerup', stop);
      bar.addEventListener('pointercancel', stop);
    });
    win.querySelector('.close').focus();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.hash.slice(1);
    if (names[id]) {
      event.preventDefault();
      history.replaceState(null, '', '#' + id);
      openWindow(id);
    }
    if (id === 'home') {
      event.preventDefault();
      for (const win of windows.values()) win.remove();
      windows.clear();
      history.replaceState(null, '', '#home');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') layer.querySelector('.active .close')?.click();
  });
  document.querySelector('.theme-switch').addEventListener('click', event => {
    const day = document.body.classList.toggle('daylight');
    event.currentTarget.textContent = day ? 'Moonlight ☾' : 'Daylight ☼';
    event.currentTarget.setAttribute('aria-label', day ? 'Switch to moonlight' : 'Switch to daylight');
  });
  addEventListener('hashchange', () => openWindow(location.hash.slice(1)));
  openWindow(location.hash.slice(1));
})();
