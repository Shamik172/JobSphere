import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Lock, Mail, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Smart Initialization: Check for a userType passed from another page.
  const initialUserType = location.state?.userType || 'interviewer';
  const [userType, setUserType] = useState(initialUserType);

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(location.state?.message || ""); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const from = location.state?.from?.pathname || (userType === 'interviewer' ? '/' : '/assessment');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUserTypeToggle = () => {
    setUserType(prev => prev === "interviewer" ? "candidate" : "interviewer");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/${userType}/login`;
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        await login();
        navigate(from, { replace: true });
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Server error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isInterviewer = userType === "interviewer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">JobSphere</h1>
        <p className="text-center text-gray-700 mb-8">
          {isInterviewer ? "Interviewer Portal" : "Candidate Portal"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} /><input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white/50 rounded-lg border border-white/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"/></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} /><input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white/50 rounded-lg border border-white/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"/></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        {message && <p className={`mt-4 text-center font-medium ${message.includes("failed") || message.includes("error") ? "text-red-600" : "text-green-600"}`}>{message}</p>}

        <div className="mt-6 text-center">
            <button onClick={handleUserTypeToggle} className="text-sm text-indigo-700 hover:underline">
                {isInterviewer ? "Login as a Candidate" : "Login as an Interviewer"}
            </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/30 text-center text-sm text-gray-700">
            Don't have an account?{" "}
            <button 
                onClick={() => navigate('/signup', { state: { userType: userType } })} 
                className="font-semibold text-indigo-800 hover:underline"
            >
                Sign Up
            </button>
        </div>
        
      </div>
    </div>
  );
};
export default Login;

