import { createContext, useContext, useState, useEffect } from "react";
import { login, logout } from "./authService";
import { registerForcedLogout } from "./authForcedLogout";
import api from "./api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = async (email, password) => {
    try {
      const data = await login(email, password);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem("user");
      if (!saved) return;

      try {
        await api.post("/usuarios/refresh/"); 
        const res = await api.get("/usuarios/me/");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    init();
  }, []);

  const logoutUser = async () => {
    await logout();
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    registerForcedLogout(logoutUser);
  }, []);

  const value = { user, loginUser, logoutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
