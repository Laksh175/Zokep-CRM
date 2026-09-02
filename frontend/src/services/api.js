const RAW_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_BASE ? (RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE.replace(/\/$/, '')}/api`) : '/api';

const getHeaders = (isFormData = false) => {
  const headers = {};
  const token = localStorage.getItem('zokep_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const buildUrl = (endpoint, params = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullPath = `${API_BASE}${cleanEndpoint}`;

  let urlObj;
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    urlObj = new URL(fullPath);
  } else {
    urlObj = new URL(fullPath, window.location.origin);
  }

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      urlObj.searchParams.append(key, params[key]);
    }
  });
  return urlObj.toString();
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && contentType.includes('text/csv')) {
    return await response.blob();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    error.subscriptionExpired = data?.subscriptionExpired || false;
    error.isDeactivated = data?.isDeactivated || false;
    throw error;
  }

  return data;
};

export const api = {
  // GET
  get: async (endpoint, params = {}) => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // POST
  post: async (endpoint, body = {}) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  // PUT
  put: async (endpoint, body = {}) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  // DELETE
  delete: async (endpoint, body = {}) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  // Upload Form Data (Multipart)
  upload: async (endpoint, formData) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },
};

export default api;
