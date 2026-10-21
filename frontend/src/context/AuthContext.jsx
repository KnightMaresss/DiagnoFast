import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(readStoredUser);
  const [token, setTokenState] = useState(() => localStorage.getItem("token") || null);
  const navigate = useNavigate();

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  }, []);



  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setUserState(null);
    setTokenState(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  }, []);

  // Refresh user from server whenever token changes (keeps session fresh across tabs)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) logout();
      }
    })();
    return () => { cancelled = true; };
  }, [token, setUser, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
export default AuthContext;