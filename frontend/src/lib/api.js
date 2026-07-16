import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Get token
export function getToken() {
  return localStorage.getItem("token");
}

// Automatically attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Save auth
export function saveAuth(token, user) {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

// Get stored user
export function getStoredUser() {
  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Clear auth
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export { api };
export default api;