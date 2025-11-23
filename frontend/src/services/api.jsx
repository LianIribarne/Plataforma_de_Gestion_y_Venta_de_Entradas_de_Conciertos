import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true
});

// Si llega 401, intenta renovar token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await api.post("/usuarios/refresh/");
        return api(err.config);
      } catch {
        // logout forzado
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
