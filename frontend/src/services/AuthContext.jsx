import { createContext, useContext, useState, useEffect } from "react";
import { login, logout } from "./authService";
import { checkSession } from "../services/sessionHeartbeat";
import { registerForcedLogout } from "./authForcedLogout";

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
    if (!user) return;

    const interval = setInterval(() => {
      checkSession();
    }, 5 * 1000);

    return () => clearInterval(interval);
  }, [user]);

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
