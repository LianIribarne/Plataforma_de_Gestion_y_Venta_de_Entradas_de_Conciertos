import api from "./api";
import { forceLogout } from "./authForcedLogout";
import { refreshToken } from "./authService";
import { endpoints } from "./endpoints";

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => prom.reject(error));
  failedQueue = [];
};

const AUTH_ENDPOINTS = [
  endpoints.usuarios.login,
  endpoints.usuarios.refresh,
  endpoints.usuarios.registrarse,
  endpoints.usuarios.logout,
];

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (AUTH_ENDPOINTS.some(url => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshToken();
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err);
        forceLogout();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
