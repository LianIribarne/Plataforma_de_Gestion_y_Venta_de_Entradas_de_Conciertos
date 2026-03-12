import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/usuarios/login/", { email, password });
  return res.data;
};

export const refreshToken = async () => {
  try {
    const res = await api.post("/usuarios/refresh/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const logout = async () => {
  await api.post("/usuarios/logout/");
};
