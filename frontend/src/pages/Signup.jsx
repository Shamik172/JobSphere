import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { notify } from "../notification/Notification.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import JobSphereEcosystemBackground from "../components/canvas/JobSphereEcosystemBackground.jsx";
import AuthFeatureShowcase from "../components/auth/AuthFeatureShowcase.jsx";
import "../components/auth/authStyles.css";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Terminal,
  User,
  UserCheck,
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const [userType, setUserType] = useState("interviewer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/${userType}/signup`;

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        notify(data.message || "Account created successfully! Please log in.", "success");
        navigate("/login", { state: { userType } });
      } else {
        notify(data.message || "Failed to create account.", "error");
      }
    } catch {
      notify("Network error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isInterviewer = userType === "interviewer";

  return (
    <div className={`js-theme ${isDark ? "dark" : ""} relative min-h-screen font-sans selection:bg-emerald-500 selection:text-white`}>
      <JobSphereEcosystemBackground isDark={isDark} />
      <div className="js-atmosphere" />

      {/* Theme Switcher Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="glass-panel fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-[var(--title-color)] transition-all hover:scale-105 active:scale-95"
      >
        {isDark ? (
          <><Sun size={14} className="text-amber-400" /><span>Light Mode</span></>
        ) : (
          <><Moon size={14} className="text-emerald-800" /><span>Dark Mode</span></>
        )}
      </button>

      <main className="flex min-h-screen items-center justify-center p-3 sm:p-6 lg:p-10 w-full overflow-x-hidden">
        {/* Outer Card: max-w-[425px] on phone, max-w-[1140px] on laptop */}
        <div className="glass-panel grid w-full max-w-[425px] overflow-hidden rounded-[28px] sm:max-w-[620px] lg:max-w-[1140px] lg:grid-cols-[1.15fr_1.2fr]">

          {/* Desktop Left Showcase Aside */}
          <aside className="js-aside relative hidden flex-col justify-between p-10 xl:p-12 lg:flex border-r border-[var(--aside-border)]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/30">
                  <Terminal size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[var(--title-color)]">JobSphere<span className="text-emerald-400">.</span></h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-subtle)]">Interview Ecosystem</p>
                </div>
              </div>
              <div className="mt-9">
                <AuthFeatureShowcase />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[var(--aside-border)] pt-4 text-xs font-bold text-[var(--text-subtle)]">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> End-to-End Encrypted</span>
              <span>JobSphere Cloud</span>
            </div>
          </aside>

          {/* Right Signup Form Card */}
          <section className="flex flex-col justify-center px-4 py-4 sm:p-9 xl:p-12 w-full max-w-full overflow-hidden box-border" style={{ background: "var(--right-panel-bg)" }}>
            
            {/* Mobile Header */}
            <div className="mb-2.5 sm:mb-4 flex items-center justify-between w-full lg:hidden">
              <span className="text-base sm:text-lg font-black text-[var(--title-color)] tracking-tight">JobSphere</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)] shrink-0">Register</span>
            </div>

            {/* Mobile Showcase */}
            <AuthFeatureShowcase isMobile />

            {/* Role Switcher Pill */}
            <div className="js-seg relative mb-2.5 sm:mb-6 flex rounded-xl sm:rounded-2xl p-1 backdrop-blur-md">
              <div
                className={`js-btn-primary absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg sm:rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isInterviewer ? "left-1" : "left-[calc(50%+2px)]"
                }`}
              />

              <button
                type="button"
                onClick={() => setUserType("interviewer")}
                className={`js-seg-btn relative z-10 flex flex-1 select-none items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-extrabold transition-colors duration-200 ${
                  isInterviewer ? "is-active" : ""
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Interviewer
              </button>

              <button
                type="button"
                onClick={() => setUserType("candidate")}
                className={`js-seg-btn relative z-10 flex flex-1 select-none items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-extrabold transition-colors duration-200 ${
                  !isInterviewer ? "is-active" : ""
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Candidate
              </button>
            </div>

            {/* Heading */}
            <div className="mb-2 sm:mb-0 text-center sm:text-left">
              <h1 className="text-lg font-black text-[var(--title-color)] sm:text-3xl leading-snug">
                Create an account
              </h1>
              <p className="text-[10.5px] font-medium text-[var(--text-muted)] sm:mt-1.5 sm:text-sm">
                Get started with JobSphere as a {isInterviewer ? "technical interviewer" : "candidate"}.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-2 sm:mt-6 space-y-2 sm:space-y-4">
              <div className="space-y-0.5 sm:space-y-1.5">
                <label htmlFor="name" className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Henderson"
                    className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-3 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-0.5 sm:space-y-1.5">
                <label htmlFor="email" className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Work Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-3 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-0.5 sm:space-y-1.5">
                <label htmlFor="password" className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-10 text-xs sm:text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-2.5 sm:right-3.5 p-1 text-[var(--icon-color)] hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-[17px] sm:h-[17px]" /> : <Eye className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="js-btn-primary group relative mt-1 sm:mt-2 flex h-9 sm:h-11 w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm font-bold text-white active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-4 border-t border-[var(--aside-border)] text-center text-[10.5px] sm:text-xs font-medium text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ userType }}
                className="js-link ml-1 font-bold hover:underline"
              >
                Sign In
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}