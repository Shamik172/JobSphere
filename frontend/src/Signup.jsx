import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/interviewer/signup`,
        form,
        { withCredentials: true }
      );

      setMessage(res.data.message || "Signup successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-600 to-purple-600 flex items-center justify-center px-4">
      {/* Glassy Signup Card */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/30 rounded-2xl p-10 shadow-[0_0_50px_rgba(255,255,255,0.2)] w-full max-w-md text-center text-gray-800">
        {/* Logo / Title */}
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
          JobSphere
        </h1>
        <p className="text-sm text-gray-700 mb-8">
          Join our platform to streamline and enhance your hiring process
        </p>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

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

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg tracking-wide text-white shadow-md transition ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Error / Success Message */}
        {message && (
          <p
            className={`mt-4 font-medium ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Bottom Link */}
        <div className="mt-6 text-sm text-gray-700">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-700 font-semibold hover:underline hover:text-indigo-800"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
