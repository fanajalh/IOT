const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient GET ${endpoint}] Error:`, err.message);
      return { success: false, message: err.message };
    }
  },

  async post(endpoint, data = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient POST ${endpoint}] Error:`, err.message);
      return { success: false, message: err.message };
    }
  }
};
