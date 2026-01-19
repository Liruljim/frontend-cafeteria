// assets/js/auth.js
import { apiGet } from './api.js';

function getToken() {
  return localStorage.getItem('token');
}

function removeToken() {
  console.log('Removing token and logging out');
  localStorage.removeItem('token');
  window.location.href = '/pages/login.html';
}

// Decodifica un JWT (sin verificar firma) para extraer payload
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

// Intenta obtener perfil via API; si falla y token parece JWT, devuelve claims (semi-trusted)
export async function getMyProfile() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const data = await apiGet('auth/me');
    console.log(data);
    if (data.error ) removeToken();
    return data.user || data;
  } catch (err) {
    removeToken();
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export async function ensureAuthOrRedirect(redirectTo = '/pages/login.html') {
  const profile = await getMyProfile();
  if (!profile) {
    window.location.href = redirectTo;
    return false;
  }
  return profile;
}

export function logout() {
  removeToken();
  window.location.href = '/pages/login.html';
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export async function obtenerRol() {
  const profile = await getMyProfile();
  return profile?.rol || profile?.role;
}