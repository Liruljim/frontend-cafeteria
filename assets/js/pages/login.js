// assets/js/pages/login.js
import { apiPost } from '../api.js';
import { saveToken, getMyProfile } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const btn = document.getElementById('btnLogin');
  const errorEl = document.getElementById('loginError');

  async function showError(msg) {
    if (!errorEl) {
      alert(msg);
      return;
    }
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  function redirectByRole(role) {
    if (role === 'vendedor') {
      window.location.href = '/pages/pos.html';
    } else {
      // admin goes to dashboard
      window.location.href = '/pages/dashboard.html';
    }
  }

  // Si ya hay sesión, redirigir según rol
  try {
    getMyProfile().then(profile => {
      if (!profile) return;
      const role = profile?.rol || profile?.role;
      redirectByRole(role);
    }).catch(() => {});
  } catch (e) {
    console.error('Error checking user session', e);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await apiPost('auth/login', { email, password });

      if (data?.token) {
        saveToken(data.token);
        const role = data?.user?.rol || data?.user?.role || data?.role;
        redirectByRole(role);
        return;
      }
      showError(data?.error || 'Credenciales inválidas');
    } catch (err) {
      console.error('Login error', err);
      showError(err.message || 'Error de conexión con el servidor');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
});
