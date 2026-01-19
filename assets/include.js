async function includeHTML(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const html = await res.text();
  el.innerHTML = html;
  return el;
}

// Helper para cargar múltiples includes en secuencia
export async function includeMany(items) {
  for (const it of items) {
    await includeHTML(it.selector, it.url);
  }
}

export default includeHTML;

// Ejemplo automatizado (no ejecutado por default en módulos que importan esta librería)
if (typeof window !== 'undefined' && !window.__INCLUDE_AUTOMATIC__) {
  // no auto-execute in module mode
}

