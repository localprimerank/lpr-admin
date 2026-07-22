const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || '/backend-api';
const API_URL = configuredApiUrl.replace(/\/$/, '');

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function setAuthSession({ token, user }) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
}

function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  let headers;
  if (options.body instanceof FormData) {
    // Do NOT set Content-Type — browser must set it with the multipart boundary.
    // But we still need the Authorization token for protected routes.
    const token = getToken();
    headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers = { ...getHeaders(options.auth !== false), ...(options.headers || {}) };
  }

  const config = {
    ...options,
    headers,
  };
  
  const res = await fetch(url, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  getServices: () => apiRequest('/services'),
  getService: (id) => apiRequest(`/services/${id}`),
  createService: (data) => apiRequest('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => apiRequest(`/services/${id}`, { method: 'DELETE' }),

  getProjects: () => apiRequest('/projects?published=all'),
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  getBlogs: () => apiRequest('/blogs?published=all'),
  getBlog: (id) => apiRequest(`/blogs/${id}`),
  createBlog: (data) => apiRequest('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id, data) => apiRequest(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id) => apiRequest(`/blogs/${id}`, { method: 'DELETE' }),

  getClients: () => apiRequest('/clients'),
  getClient: (id) => apiRequest(`/clients/${id}`),
  createClient: (data) => apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => apiRequest(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE' }),

  getSkills: () => apiRequest('/skills'),
  getSkill: (id) => apiRequest(`/skills/${id}`),
  createSkill: (data) => apiRequest('/skills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (id, data) => apiRequest(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkill: (id) => apiRequest(`/skills/${id}`, { method: 'DELETE' }),

  getStats: () => apiRequest('/stats'),
  getStat: (id) => apiRequest(`/stats/${id}`),
  createStat: (data) => apiRequest('/stats', { method: 'POST', body: JSON.stringify(data) }),
  updateStat: (id, data) => apiRequest(`/stats/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStat: (id) => apiRequest(`/stats/${id}`, { method: 'DELETE' }),

  getTestimonials: () => apiRequest('/testimonials'),
  getTestimonial: (id) => apiRequest(`/testimonials/${id}`),
  createTestimonial: (data) => apiRequest('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestimonial: (id) => apiRequest(`/testimonials/${id}`, { method: 'DELETE' }),

  getContacts: () => apiRequest('/contact'),
  getContact: (id) => apiRequest(`/contact/${id}`),
  updateContact: (id, data) => apiRequest(`/contact/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => apiRequest(`/contact/${id}`, { method: 'DELETE' }),

  getHero: () => apiRequest('/hero'),
  updateHero: (data) => apiRequest('/hero', { method: 'PUT', body: JSON.stringify(data) }),

  getSiteSettings: () => apiRequest('/site-settings'),
  updateSiteSettings: (data) => apiRequest('/site-settings', { method: 'PUT', body: JSON.stringify(data) }),

  getAbout: () => apiRequest('/about'),
  createAbout: (data) => apiRequest('/about', { method: 'POST', body: JSON.stringify(data) }),
  updateAbout: (id, data) => apiRequest(`/about`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAbout: (id) => apiRequest(`/about/${id}`, { method: 'DELETE' }),

  uploadImage: async (formData) => {
    return apiRequest('/upload', {
      method: 'POST',
      body: formData,
      // No headers needed here — apiRequest handles auth token + lets browser set multipart boundary
    });
  },

  getGallery: () => apiRequest('/gallery'),
  getAllGalleries: () => apiRequest('/gallery/all'),
  createGallery: (data) => apiRequest('/gallery', { method: 'POST', body: JSON.stringify(data) }),
  updateGallery: (id, data) => apiRequest(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGallery: (id) => apiRequest(`/gallery/${id}`, { method: 'DELETE' }),

  getFAQs: () => apiRequest('/faq'),
  getAllFAQs: () => apiRequest('/faq/all'),
  createFAQ: (data) => apiRequest('/faq', { method: 'POST', body: JSON.stringify(data) }),
  updateFAQ: (id, data) => apiRequest(`/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFAQ: (id) => apiRequest(`/faq/${id}`, { method: 'DELETE' }),
};
