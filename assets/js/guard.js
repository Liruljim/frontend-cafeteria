// assets/js/guard.js
// Role-based page access control

import { getMyProfile, logout } from './auth.js';

/**
 * Verifies the user has an allowed role.
 * If not authenticated, redirects to login.
 * If authenticated but wrong role, redirects to appropriate page.
 * @param {string[]} allowedRoles - Array of roles allowed to access the page
 * @returns {Promise<object|null>} - User profile if allowed, null otherwise
 */
export async function requireRole(allowedRoles = ['admin']) {
  const profile = await getMyProfile();

  if (!profile) {
    window.location.href = '/pages/login.html';
    return null;
  }

  const userRole = profile.rol || profile.role;

  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 'vendedor') {
      window.location.href = '/pages/pos.html';
    } else {
      // Unknown role or no access - logout
      logout();
    }
    return null;
  }

  return profile;
}

/**
 * Get current user role from profile.
 * @returns {Promise<string|null>}
 */
export async function getCurrentRole() {
  const profile = await getMyProfile();
  return profile?.rol || profile?.role || null;
}

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const role = await getCurrentRole();
  return role === 'admin';
}

/**
 * Check if current user is vendedor
 * @returns {Promise<boolean>}
 */
export async function isVendedor() {
  const role = await getCurrentRole();
  return role === 'vendedor';
}
