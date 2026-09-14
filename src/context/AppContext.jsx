import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false); // loader

  useEffect(() => {
    const tokenVal = localStorage.getItem("token") || Cookies.get("token");
    const roleVal = localStorage.getItem("role") || Cookies.get("role");
    const userVal = localStorage.getItem("user") || Cookies.get("user");

    if (tokenVal && roleVal && userVal) {
      setToken(tokenVal);
      setRole(roleVal);
      try {
        setUser(JSON.parse(decodeURIComponent(userVal)));
      } catch (e) {
        try {
          setUser(JSON.parse(userVal));
        } catch (err) {
          setUser(userVal);
        }
      }
    }

    setLoading(false);
  }, []);

  const logout = async () => {
    setLogoutLoading(true); // loader start

    // optional delay to make loader visible
    await new Promise((resolve) => setTimeout(resolve, 200));

    // clear cookies
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");

    // clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("profileId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");

    // clear state
    setToken(null);
    setRole(null);
    setUser(null);

    setLogoutLoading(false); 
    navigate("/"); 
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        logoutLoading,
        isAuthenticated: !!token,
        setUser,
        setRole,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
