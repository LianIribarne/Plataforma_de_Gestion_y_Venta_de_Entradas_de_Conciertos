import api from "./api";

export const checkSession = async () => {
  try {
    await api.get("/usuarios/protected/");
    return true;
  } catch (err) {
    return false;
  }
};
