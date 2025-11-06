document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!navToggle || !mobileMenu) return;

  let backdrop = null;

  function createBackdrop() {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
    // force reflow for transition
    window.getComputedStyle(backdrop).opacity;
    backdrop.classList.add('visible');
    backdrop.addEventListener('click', closeMenu);
  }

  function removeBackdrop() {
    if (!backdrop) return;
    backdrop.classList.remove('visible');
    backdrop.removeEventListener('click', closeMenu);
    // remove after transition
    setTimeout(() => { if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); backdrop = null; }, 220);
  }

  function openMenu() {
    mobileMenu.hidden = false;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.innerHTML = '<span class="material-icons-outlined">close</span>';
    createBackdrop();

    // prevent background scroll while menu is open
    document.body.style.overflow = 'hidden';
    // focus management: focus first focusable element inside menu
    const focusable = mobileMenu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    document.addEventListener('keydown', trapTabKey);
    document.addEventListener('keydown', onKeyDown);
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<span class="material-icons-outlined">menu</span>';
    removeBackdrop();
    // wait for transition, then hide
    setTimeout(() => { mobileMenu.hidden = true; }, 260);
    document.removeEventListener('keydown', trapTabKey);
    document.removeEventListener('keydown', onKeyDown);
    // restore body scroll
    document.body.style.overflow = '';
    navToggle.focus();
  }

  function toggleMenu() { if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu(); }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  }

  function trapTabKey(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(mobileMenu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) { // shift + tab
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else { // tab
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  navToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

});
