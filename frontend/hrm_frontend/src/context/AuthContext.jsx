// quản lý đăng nhập toàn app
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api
        .get("/auth/me/")
        .then((res) => {
          setUser(res.data);
          setRole(res.data.role);
        })
        .catch(() => localStorage.removeItem("access_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    setUser(res.data.user);
    setRole(res.data.role);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    setRole(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
