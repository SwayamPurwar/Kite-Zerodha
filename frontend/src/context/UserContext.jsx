import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    walletBalance: 0,
    avatar: "",
    email: "",
    name: ""
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const updateBalance = (newBalance) => {
    setUser((prev) => ({ ...prev, walletBalance: newBalance }));
  };

  const login = (token, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("walletBalance", balance);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("walletBalance");
    localStorage.removeItem("avatar");
    setIsAuthenticated(false);
    setUser({ walletBalance: 0, avatar: "", email: "", name: "" });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(res.data);
        localStorage.setItem("walletBalance", res.data.walletBalance);
        if (res.data.avatar) {
          localStorage.setItem("avatar", res.data.avatar);
        }
      } catch (error) {
        console.error("Failed to load user profile");
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider value={{ user, setUser, updateBalance, isAuthenticated, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};