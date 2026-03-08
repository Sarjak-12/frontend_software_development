import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const ACCESS_TOKEN_KEY = "planner_access_token";

let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
let refreshInFlight = null;
let onAuthFailure = () => {};
let onSessionRefresh = () => {};

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler || (() => {});
}

export function setSessionRefreshHandler(handler) {
  onSessionRefresh = handler || (() => {});
}

export function setAccessToken(token) {
  accessToken = token || null;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function refreshToken() {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data?.accessToken;
        if (!token) {
          throw new Error("Missing access token");
        }
        setAccessToken(token);
        onSessionRefresh(response.data);
        return token;
      })
      .catch((error) => {
        clearAccessToken();
        onAuthFailure(error);
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (status === 401 && !originalRequest?._retry && !isRefreshCall) {
      originalRequest._retry = true;
      try {
        const token = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
