import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Default to interviewer login unless redirected
  const initialUserType = location.state?.userType || "interviewer";
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

  const from =
    location.state?.from?.pathname ||
    (userType === "interviewer" ? "/" : "/assessment");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUserTypeToggle = () => {
    setUserType((prev) =>
      prev === "interviewer" ? "candidate" : "interviewer"
    );
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

  // === Dynamic theme colors based on user type ===
  const theme = isInterviewer
    ? {
        bg: "from-indigo-300 via-blue-500 to-purple-600",
        card: "bg-white/70 border-white/40",
        accent: "indigo",
        text: "text-gray-800",
      }
    : {
        bg: "from-orange-300 via-pink-500 to-purple-600",
        card: "bg-white/70 border-white/40",
        accent: "orange",
        text: "text-gray-800",
      };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center p-4`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${theme.card} backdrop-blur-2xl`}
      >
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2 tracking-tight">
          JobSphere
        </h1>
        <p className="text-center text-gray-700 mb-8 font-medium">
          {isInterviewer ? "Interviewer Portal" : "Candidate Portal"}
        </p>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={20}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={20}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
              isInterviewer
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90"
                : "bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90"
            } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("failed") || message.includes("error")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={handleUserTypeToggle}
            className={`text-sm font-medium ${
              isInterviewer
                ? "text-indigo-700 hover:text-indigo-900"
                : "text-orange-700 hover:text-orange-900"
            } hover:underline`}
          >
            {isInterviewer
              ? "Login as a Candidate"
              : "Login as an Interviewer"}
          </button>
        </div>

        {/* Signup */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-700">
          Don’t have an account?{" "}
          <button
            onClick={() =>
              navigate("/signup", { state: { userType: userType } })
            }
            className={`font-semibold ${
              isInterviewer
                ? "text-indigo-800 hover:text-indigo-900"
                : "text-orange-800 hover:text-orange-900"
            } hover:underline`}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
