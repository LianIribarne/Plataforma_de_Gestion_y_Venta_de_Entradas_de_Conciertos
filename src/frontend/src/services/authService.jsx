import api from "./api";
import { endpoints } from "./endpoints";

export const login = async (email, password) => {
  const res = await api.post(endpoints.usuarios.login, { email, password });
  return res.data;
};

export const refreshToken = async () => {
  try {
    const res = await api.post(endpoints.usuarios.refresh);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const logout = async () => {
  await api.post(endpoints.usuarios.logout);
};
