import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/interviewer/verify", {
          withCredentials: true, // send cookies
        });

        if (res.data.loggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Login just re-verifies token
  const login = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/interviewer/verify", { withCredentials: true });
      setIsLoggedIn(res.data.loggedIn);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // Logout clears cookie on server
  const logout = async () => {
    await axios.post("http://localhost:5000/api/interviewer/logout", {}, { withCredentials: true });
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
