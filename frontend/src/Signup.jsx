import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Mail, Building, Briefcase, Link as LinkIcon } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("interviewer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    department: "",
    resume_url: "",
    portfolio_url: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUserTypeToggle = () => {
    setUserType(prev => (prev === "interviewer" ? "candidate" : "interviewer"));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/${userType}/signup`;
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      ...(userType === "interviewer"
        ? { company: form.company, department: form.department }
        : { resume_url: form.resume_url, portfolio_url: form.portfolio_url }),
    };

    try {
      const res = await axios.post(apiEndpoint, payload);
      navigate("/login", {
        state: { message: res.data.message || "Signup successful! Please log in." },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "An unknown error occurred.");
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
        button: "from-indigo-500 to-blue-600",
      }
    : {
        bg: "from-orange-300 via-pink-500 to-purple-600",
        card: "bg-white/70 border-white/40",
        accent: "orange",
        text: "text-gray-800",
        button: "from-orange-500 to-pink-600",
      };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center p-4`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${theme.card} backdrop-blur-2xl`}
      >
        {/* Title */}
        <h1
          className={`text-4xl font-extrabold text-center mb-2 tracking-tight bg-clip-text text-transparent ${
            isInterviewer
              ? "bg-gradient-to-r from-indigo-700 to-blue-600"
              : "bg-gradient-to-r from-orange-600 to-pink-500"
          }`}
        >
          Create an Account
        </h1>
        <p className="text-center text-gray-700 mb-8 font-medium">
          Signing up as an {isInterviewer ? "Interviewer" : "Candidate"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          {/* Role-specific Fields */}
          {isInterviewer ? (
            <>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input
                  name="company"
                  type="text"
                  placeholder="Company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input
                  name="department"
                  type="text"
                  placeholder="Department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input
                  name="resume_url"
                  type="url"
                  placeholder="Resume URL (optional)"
                  value={form.resume_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input
                  name="portfolio_url"
                  type="url"
                  placeholder="Portfolio URL (optional)"
                  value={form.portfolio_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
              loading
                ? "cursor-not-allowed opacity-70"
                : `bg-gradient-to-r ${theme.button} hover:opacity-90`
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center font-medium text-red-600">{message}</p>
        )}

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={handleUserTypeToggle}
            className={`text-sm font-medium hover:underline ${
              isInterviewer
                ? "text-indigo-700 hover:text-indigo-900"
                : "text-orange-700 hover:text-orange-900"
            }`}
          >
            {isInterviewer ? "Sign up as a Candidate" : "Sign up as an Interviewer"}
          </button>
        </div>

        {/* Login link */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login", { state: { userType } })}
            className={`font-semibold hover:underline ${
              isInterviewer
                ? "text-indigo-800 hover:text-indigo-900"
                : "text-orange-800 hover:text-orange-900"
            }`}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;