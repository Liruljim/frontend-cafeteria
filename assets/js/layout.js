// assets/js/layout.js
import includeHTML, { includeMany } from '/assets/include.js';
import { getMyProfile, logout } from '/assets/js/auth.js';

export async function initLayout({ sidebarSelector = '#sidebar-slot', topbarSelector = '#topbar-slot', pageTitle } = {}) {
  // Load partials if slots exist
  const items = [];
  if (document.querySelector(sidebarSelector)) items.push({ selector: sidebarSelector, url: '/partials/sidebar.html' });
  if (document.querySelector(topbarSelector)) items.push({ selector: topbarSelector, url: '/partials/topbar.html' });

  if (items.length) await includeMany(items);

  // Fill page title if provided
  if (pageTitle) {
    const t = document.getElementById('pageTitle');
    if (t) t.textContent = pageTitle;
  }

  // Populate user info in topbar and handle role-based UI
  let userRole = null;
  try {
    const profile = await getMyProfile();
    if (profile) {
      userRole = profile.rol || profile.role;
      const nameEl = document.getElementById('userName');
      const emailEl = document.getElementById('userEmail');
      const avatarEl = document.getElementById('userAvatar');
      if (nameEl) nameEl.textContent = profile.nombre || profile.name || profile.user?.nombre || profile.user?.name || profile.email || 'Usuario';
      if (emailEl) emailEl.textContent = profile.email || profile.user?.email || '';
      if (avatarEl) {
        const initial = (profile.nombre || profile.name || profile.email || '').charAt(0).toUpperCase() || 'U';
        avatarEl.textContent = initial;
      }
    }
  } catch (e) {
    // ignore
  }

  // Role-based UI visibility
  if (userRole === 'vendedor') {
    // Hide entire sidebar for vendedor (they only use POS)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('hidden');

    // Hide admin-only elements anywhere in the page
    document.querySelectorAll('[data-admin-only]').forEach(el => el.remove());

    // Hide management nav sections in mobile menu too
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      // Keep only POS link and logout
      mobileMenu.querySelectorAll('a[data-nav]:not([data-nav="pos"])').forEach(a => a.remove());
      mobileMenu.querySelectorAll('.text-xs.font-bold').forEach(el => el.remove()); // Group headers
    }
  } else if (userRole === 'admin') {
    // Show everything for admin (default)
    // Nothing to hide
  }

  // Wire logout buttons
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebarLogout = document.getElementById('sidebarLogout');
  const mobileLogout = document.getElementById('mobileLogout');
  [logoutBtn, sidebarLogout, mobileLogout].forEach(b => {
    if (b) b.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  });

  // Mobile menu toggles
  const mobileMenu = document.getElementById('mobileMenu');
  const btnMobileMenu = document.getElementById('btnMobileMenu');
  const btnCloseMobile = document.getElementById('btnCloseMobile');

  if (btnMobileMenu && mobileMenu) btnMobileMenu.addEventListener('click', () => mobileMenu.classList.remove('hidden'));
  if (btnCloseMobile && mobileMenu) btnCloseMobile.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  if (mobileMenu) mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) mobileMenu.classList.add('hidden'); });

  // Active nav (por data-page en body)
  const current = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.dataset.nav === current) a.classList.add('bg-gray-800');
  });

  return { userRole };
}

export default initLayout;

