const API_URL = 'https://backend-cafeteria-p46t.onrender.com';

function getToken() {
  return localStorage.getItem('token');
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = { 
    'Content-Type': 'application/json',
    ...options.headers 
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, '')}`, config);
  
  // Handle 401 globally if needed (optional)
  if (response.status === 401) {
    // Optionally redirect or event
    console.warn('Unauthorized access');
  }

  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...data };
  }
  return data;
}

export const apiGet = (endpoint, params = {}) => {
  const url = new URL(`${API_URL}/${endpoint.replace(/^\//, '')}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetchWithAuth(url.toString().replace(API_URL + '/', ''), { method: 'GET' });
};

export const apiPost = (endpoint, body) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (endpoint, body) => fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (endpoint) => fetchWithAuth(endpoint, { method: 'DELETE' });

// Compatibility for my previous global window.api usage if I need to support both temporarily,
// but better to migrate everything to modules. I will migrate.