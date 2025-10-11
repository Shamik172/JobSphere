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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeToggle = () => {
    setUserType(prevType => (prevType === "interviewer" ? "candidate" : "interviewer"));
    setMessage(""); // Clear any previous messages on toggle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const isInterviewer = userType === "interviewer";
    const apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/${userType}/signup`;
    
    // Construct the payload with only the relevant fields for the selected role
    let payload = {
        name: form.name,
        email: form.email,
        password: form.password,
    };

    if (isInterviewer) {
        payload.company = form.company;
        payload.department = form.department;
    } else {
        payload.resume_url = form.resume_url;
        payload.portfolio_url = form.portfolio_url;
    }

    try {
      const res = await axios.post(apiEndpoint, payload);
      
      // On success, redirect to the login page with a success message
      navigate("/login", { state: { message: res.data.message || "Signup successful! Please log in." }});

    } catch (err) {
      setMessage(err.response?.data?.message || "An unknown error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  const isInterviewer = userType === "interviewer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/30 rounded-2xl p-10 shadow-[0_0_50px_rgba(255,255,255,0.2)] w-full max-w-md text-gray-800">
        <h1 className="text-4xl font-extrabold mb-2 text-center bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
          Create an Account
        </h1>
        <p className="text-sm text-center text-gray-700 mb-8">
          Signing up as an {isInterviewer ? "Interviewer" : "Candidate"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* --- Common Fields --- */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input name="email" placeholder="Email address" type="email" value={form.email} onChange={handleChange} required className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-indigo-1000" size={18} />
            <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          
          {/* --- Role-Specific Fields --- */}
          {isInterviewer ? (
            <>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-indigo-1000" size={18} />
                <input name="company" placeholder="Company" value={form.company} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-indigo-1000" size={18} />
                <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 text-indigo-1000" size={18} />
                <input name="resume_url" placeholder="Resume URL (Optional)" type="url" value={form.resume_url} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 text-indigo-1000" size={18} />
                <input name="portfolio_url" placeholder="Portfolio URL (Optional)" type="url" value={form.portfolio_url} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-xl py-3 pl-10 pr-3 border border-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold text-lg tracking-wide text-white shadow-md transition ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98]"}`}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {message && <p className="mt-4 font-medium text-red-600">{message}</p>}

        <div className="mt-4 text-center text-sm">
          <button onClick={handleUserTypeToggle} className="font-semibold text-indigo-700 hover:underline">
            {isInterviewer ? "Are you a Candidate?" : "Are you an Interviewer?"}
          </button>
        </div>

        <div className="mt-3 text-sm text-center text-gray-700">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-indigo-700 font-semibold hover:underline hover:text-indigo-800">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

