// Base API configuration and HTTP client
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("datapulse_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- Dataset Endpoints ---
  async uploadDataset(formData) {
    const res = await fetch(`${API_BASE_URL}/datasets/upload`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async loadSampleDataset() {
    const res = await fetch(`${API_BASE_URL}/datasets/sample`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDatasets() {
    const res = await fetch(`${API_BASE_URL}/datasets`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDatasetById(id) {
    const res = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteDataset(id) {
    const res = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- Dashboard Endpoints ---
  async getOverviewStats() {
    const res = await fetch(`${API_BASE_URL}/dashboards/stats/overview`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createDashboard(payload) {
    const res = await fetch(`${API_BASE_URL}/dashboards`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getDashboards() {
    const res = await fetch(`${API_BASE_URL}/dashboards`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDashboardById(id) {
    const res = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateDashboard(id, payload) {
    const res = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async duplicateDashboard(id) {
    const res = await fetch(`${API_BASE_URL}/dashboards/${id}/duplicate`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteDashboard(id) {
    const res = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
