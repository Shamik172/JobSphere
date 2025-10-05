import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interviewer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        await login();
        navigate("/");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-600 to-purple-600 flex items-center justify-center px-4">
      {/* Glassy Login Card */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/30 rounded-2xl p-10 shadow-[0_0_50px_rgba(255,255,255,0.2)] w-full max-w-md text-center text-gray-800">
        {/* Logo / Title */}
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
          JobSphere
        </h1>
        <p className="text-sm text-gray-700 mb-8">
          Streamline your hiring with smart, collaborative assessments
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input
              name="email"
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg tracking-wide text-white shadow-md transition ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition"
          >
            Forgot Password?
          </button>
        </div>

        {/* Error Message */}
        {message && (
          <p className="mt-4 text-red-600 font-medium">{message}</p>
        )}

        {/* Bottom Link */}
        <div className="mt-3 text-sm text-gray-700">
          New here?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-700 font-semibold hover:underline hover:text-indigo-800"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
