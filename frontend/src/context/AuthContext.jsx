import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isLoggedIn = !!user;

  const verifyAuth = async () => {
    try {
      // First, try to verify as an interviewer
      const interviewerRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/interviewer/verify`, {
        withCredentials: true,
      });
      if (interviewerRes.data.loggedIn) {
        setUser(interviewerRes.data.user);
        setLoading(false);
        return;
      }

      // If not an interviewer, try to verify as a candidate
      const candidateRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/candidate/verify`, {
        withCredentials: true,
      });
      if (candidateRes.data.loggedIn) {
        setUser(candidateRes.data.user);
        setLoading(false);
        return;
      }
      
      setUser(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async () => {
    await verifyAuth();
  };

  const logout = async () => {
    if (!user) return;
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/${user.role}/logout`;
      await axios.post(endpoint, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

