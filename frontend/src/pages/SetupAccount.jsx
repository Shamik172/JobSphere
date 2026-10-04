import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { notify } from "../notification/Notification.jsx";
import JobSphereEcosystemBackground from "../components/canvas/JobSphereEcosystemBackground.jsx";
import AuthFeatureShowcase from "../components/auth/AuthFeatureShowcase.jsx";
import "../components/auth/authStyles.css";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  User,
  X,
} from "lucide-react";

export default function SetupAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const params = new URLSearchParams(location.search);
  const emailFromUrl = params.get("email") || "";
  const tokenFromUrl = params.get("token") || "";
  const rawRedirect = params.get("redirect") || "/";

  const cleanRedirect = useMemo(() => {
    try {
      return rawRedirect.startsWith("http")
        ? new URL(rawRedirect).pathname + new URL(rawRedirect).search
        : rawRedirect;
    } catch {
      return "/";
    }
  }, [rawRedirect]);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    email: emailFromUrl,
    name: emailFromUrl ? emailFromUrl.split("@")[0] : "",
    tempPassword: tokenFromUrl,
    newPassword: "",
    confirmPassword: "",
  });

  const [verifyingTemp, setVerifyingTemp] = useState(false);
  const [tempVerified, setTempVerified] = useState(false);
  const [tempError, setTempError] = useState("");
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);
  const [show, setShow] = useState({ temp: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const lastCheckedRef = useRef("");

  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "tempPassword") {
      setTempError("");
      setIsAlreadyActive(false);
      if (tempVerified) setTempVerified(false);
    }
  };

  const verifyTempKey = async (tempToVerify) => {
    if (!form.email || !tempToVerify) return;
    setVerifyingTemp(true);
    setTempError("");
    setIsAlreadyActive(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/verify-temp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, tempPassword: tempToVerify }),
      });
      const data = await res.json();
      lastCheckedRef.current = tempToVerify;

      if (res.ok && data.valid) {
        setTempVerified(true);
        notify("Access key verified! Create your password.", "success");
      } else {
        setTempVerified(false);
        if (data.message && data.message.toLowerCase().includes("already activated")) {
          setIsAlreadyActive(true);
          setTempError("This account is already activated.");
        } else {
          setTempError(data.message || "Invalid or expired key.");
        }
      }
    } catch {
      setTempError("Server connection failed.");
    } finally {
      setVerifyingTemp(false);
    }
  };

  useEffect(() => {
    const temp = form.tempPassword.trim();
    if (temp.length === 8 && !tempVerified && lastCheckedRef.current !== temp) {
      verifyTempKey(temp);
    }
  }, [form.tempPassword, tempVerified]);

  const criteria = useMemo(
    () => [
      { ok: form.newPassword.length >= 8, text: "8+ characters" },
      { ok: /[A-Z]/.test(form.newPassword), text: "1 uppercase" },
      { ok: /[a-z]/.test(form.newPassword), text: "1 lowercase" },
      { ok: /\d/.test(form.newPassword), text: "1 numeric digit" },
    ],
    [form.newPassword]
  );

  const isPasswordValid = criteria.every((c) => c.ok);
  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tempVerified) return notify("Verify key first.", "warning");
    if (!isPasswordValid) return notify("Password criteria unmet.", "warning");
    if (!passwordsMatch) return notify("Passwords do not match.", "error");

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/activate-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          tempPassword: form.tempPassword.trim(),
          newPassword: form.newPassword,
          name: form.name,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Activation failed.");
      notify("Workspace activated!", "success");
      await login();
      navigate(cleanRedirect, { replace: true });
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

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
          <>
            <Sun size={14} className="text-amber-400" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-emerald-800" />
            <span>Dark Mode</span>
          </>
        )}
      </button>

      <main className="flex min-h-screen items-center justify-center p-3 sm:p-6 lg:p-10 w-full overflow-x-hidden">
        {/* Outer Card */}
        <div className="glass-panel grid w-full max-w-[425px] overflow-hidden rounded-[28px] sm:max-w-[620px] lg:max-w-[1140px] lg:grid-cols-[1.15fr_1.2fr]">
          {/* Desktop Left Showcase Aside */}
          <aside className="js-aside relative hidden flex-col justify-between p-10 xl:p-12 lg:flex border-r border-[var(--aside-border)]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/30">
                  <Terminal size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[var(--title-color)]">
                    JobSphere<span className="text-emerald-400">.</span>
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-subtle)]">
                    Interview Ecosystem
                  </p>
                </div>
              </div>
              <div className="mt-9">
                <AuthFeatureShowcase />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[var(--aside-border)] pt-4 text-xs font-bold text-[var(--text-subtle)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> End-to-End Encrypted
              </span>
              <span>JobSphere Cloud</span>
            </div>
          </aside>

          {/* Right Setup Form Card */}
          <section
            className="flex flex-col justify-between px-4 py-5 sm:p-8 lg:px-12 lg:py-10 w-full max-w-full overflow-hidden box-border"
            style={{ background: "var(--right-panel-bg)" }}
          >
            <div className="flex flex-col">
              {/* Mobile Header (Hidden on Laptop) */}
              <div className="mb-2.5 sm:mb-4 flex items-center justify-between w-full lg:hidden">
                <span className="text-base sm:text-lg font-black text-[var(--title-color)] tracking-tight">
                  JobSphere
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)] shrink-0">
                  Setup
                </span>
              </div>

              {/* Mobile Showcase */}
              <AuthFeatureShowcase isMobile />

              {/* Stepper Progress */}
              <div className="mb-3 sm:mb-4 lg:mb-6 flex flex-col items-center">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      currentStep === 1
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40"
                        : tempVerified
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {tempVerified ? <Check size={14} strokeWidth={3} /> : "1"}
                  </button>

                  <div
                    className={`h-1.5 w-10 sm:w-12 lg:w-16 rounded-full transition-colors ${
                      tempVerified ? "bg-emerald-500" : "bg-emerald-500/20"
                    }`}
                  />

                  <button
                    type="button"
                    disabled={!tempVerified}
                    onClick={() => tempVerified && setCurrentStep(2)}
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      currentStep === 2
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40"
                        : tempVerified
                        ? "bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/50"
                        : "bg-slate-500/15 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    2
                  </button>
                </div>

                <span className="mt-1.5 lg:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                  {currentStep === 1 ? "Step 1: Invitation Key" : "Step 2: Create Password"}
                </span>
              </div>

              {/* Heading */}
              <div className="mb-2.5 sm:mb-4 lg:mb-6 text-center sm:text-left">
                <h1 className="text-lg font-black text-[var(--title-color)] sm:text-2xl lg:text-3xl leading-snug">
                  {currentStep === 1 ? "Validate Invitation" : "Create Permanent Password"}
                </h1>
                <p className="text-[10.5px] font-medium text-[var(--text-muted)] sm:mt-1 sm:text-xs lg:text-sm">
                  {currentStep === 1
                    ? "Validate your 8-digit key to unlock your workspace access."
                    : "Set your permanent credentials to finish onboarding."}
                </p>
              </div>

              {/* Already Activated Notice Banner */}
              {isAlreadyActive && (
                <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 sm:p-4 text-left">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span className="text-xs font-black sm:text-sm">Account is already active!</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[var(--text-muted)] sm:text-xs">
                    You have already set up your password via an earlier invitation. Sign in directly to view all your assessments.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(cleanRedirect)}`)}
                    className="js-btn-primary mt-3 flex h-9 sm:h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md"
                  >
                    <LogIn size={14} />
                    <span>Proceed to Login</span>
                  </button>
                </div>
              )}

              {/* Carousel Track Container */}
              <div className="w-full overflow-hidden">
                <form
                  onSubmit={handleSubmit}
                  className={`flex w-[200%] transition-transform duration-300 ease-in-out ${
                    currentStep === 1 ? "translate-x-0" : "-translate-x-1/2"
                  }`}
                >
                  {/* SLIDE 1: Key & Profile Details */}
                  <div className="w-1/2 shrink-0 pr-3 sm:pr-4 lg:pr-6 space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                    {/* Invited Email */}
                    <div className="space-y-1 lg:space-y-1.5">
                      <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--title-color)]">
                        Invited Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail
                          className="w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] pointer-events-none absolute left-3 text-[var(--icon-color)]"
                          strokeWidth={2.4}
                        />
                        <input
                          type="email"
                          value={form.email}
                          readOnly
                          tabIndex={-1}
                          className="glass-input-locked h-9 sm:h-10 lg:h-11 w-full rounded-xl pl-8 sm:pl-10 pr-20 !text-[10px] sm:!text-xs lg:!text-sm font-medium opacity-90 select-all"
                        />
                        <span className="pointer-events-none absolute right-2.5 sm:right-3 flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <Lock size={10} /> Locked
                        </span>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1 lg:space-y-1.5">
                      <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--title-color)]">
                        Your Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User
                          className="w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] pointer-events-none absolute left-3 text-[var(--icon-color)]"
                          strokeWidth={2.4}
                        />
                        <input
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. Alex Henderson"
                          className="glass-input h-9 sm:h-10 lg:h-11 w-full rounded-xl pl-8 sm:pl-10 pr-3 !text-[10px] sm:!text-xs lg:!text-sm font-medium placeholder:!text-[10px] sm:placeholder:!text-xs lg:placeholder:!text-sm"
                        />
                      </div>
                    </div>

                    {/* Temporary Key Input */}
                    <div className="space-y-1 lg:space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--title-color)]">
                          8-Character Key
                        </label>
                        {verifyingTemp ? (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600">
                            <Loader2 size={11} className="animate-spin" /> Verifying...
                          </span>
                        ) : tempVerified ? (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Confirmed
                          </span>
                        ) : null}
                      </div>

                      <div className="relative flex items-center">
                        <KeyRound
                          className="w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] pointer-events-none absolute left-3 text-[var(--icon-color)]"
                          strokeWidth={2.4}
                        />
                        <input
                          name="tempPassword"
                          required
                          maxLength={8}
                          disabled={tempVerified}
                          type={show.temp ? "text" : "password"}
                          value={form.tempPassword}
                          onChange={handleChange}
                          placeholder="Paste 8-char key"
                          className={`glass-input h-9 sm:h-10 lg:h-11 w-full rounded-xl pl-8 sm:pl-10 pr-8 font-mono !text-[10px] sm:!text-xs lg:!text-sm tracking-widest uppercase placeholder:!text-[10px] sm:placeholder:!text-xs lg:placeholder:!text-sm ${
                            tempVerified
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                              : tempError
                              ? "border-rose-500 bg-rose-500/10 text-rose-500 font-bold"
                              : "font-semibold"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => toggle("temp")}
                          aria-label="Toggle temporary key visibility"
                          className="absolute right-2 sm:right-3 p-1 text-[var(--icon-color)] hover:scale-110"
                        >
                          {show.temp ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </button>
                      </div>

                      {tempError && !isAlreadyActive && (
                        <p className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-500">
                          <ShieldAlert size={12} /> {tempError}
                        </p>
                      )}
                    </div>

                    {/* Step 1 Action: Next Slide Button */}
                    <div className="pt-2 sm:pt-3">
                      <button
                        type="button"
                        disabled={!tempVerified || verifyingTemp}
                        onClick={() => setCurrentStep(2)}
                        className="js-btn-primary group flex h-9 sm:h-10 lg:h-11 w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md"
                      >
                        <span>Continue to Password Setup</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>

                  {/* SLIDE 2: Permanent Password Setup */}
                  <div className="w-1/2 shrink-0 pl-3 sm:pl-4 lg:pl-6 space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--lp-link)] hover:underline"
                    >
                      <ArrowLeft size={13} />
                      <span>Back to Key & Details</span>
                    </button>

                    {/* New Password */}
                    <div className="space-y-1 lg:space-y-1.5">
                      <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--title-color)]">
                        Create Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock
                          className="w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] pointer-events-none absolute left-3 text-[var(--icon-color)]"
                          strokeWidth={2.4}
                        />
                        <input
                          name="newPassword"
                          required
                          type={show.new ? "text" : "password"}
                          value={form.newPassword}
                          onChange={handleChange}
                          placeholder="••••••••••••"
                          className="glass-input h-9 sm:h-10 lg:h-11 w-full rounded-xl pl-8 sm:pl-10 pr-8 !text-[10px] sm:!text-xs lg:!text-sm font-medium placeholder:!text-[10px] sm:placeholder:!text-xs lg:placeholder:!text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggle("new")}
                          aria-label="Toggle password visibility"
                          className="absolute right-2 sm:right-3 p-1 text-[var(--icon-color)] hover:scale-110"
                        >
                          {show.new ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[var(--aside-border)] bg-[var(--aside-bg)] p-2 sm:p-2.5">
                      {criteria.map((c) => (
                        <div
                          key={c.text}
                          className={`flex items-center gap-1 text-[9.5px] sm:text-[11px] lg:text-xs font-bold ${
                            c.ok ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--text-subtle)]"
                          }`}
                        >
                          {c.ok ? <Check size={11} strokeWidth={3} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                          <span>{c.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1 lg:space-y-1.5">
                      <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--title-color)]">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock
                          className="w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] pointer-events-none absolute left-3 text-[var(--icon-color)]"
                          strokeWidth={2.4}
                        />
                        <input
                          name="confirmPassword"
                          required
                          type={show.confirm ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••••••"
                          className="glass-input h-9 sm:h-10 lg:h-11 w-full rounded-xl pl-8 sm:pl-10 pr-8 !text-[10px] sm:!text-xs lg:!text-sm font-medium placeholder:!text-[10px] sm:placeholder:!text-xs lg:placeholder:!text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggle("confirm")}
                          aria-label="Toggle password visibility"
                          className="absolute right-2 sm:right-3 p-1 text-[var(--icon-color)] hover:scale-110"
                        >
                          {show.confirm ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </button>
                      </div>

                      {form.confirmPassword && (
                        <p className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold ${passwordsMatch ? "text-emerald-700 dark:text-emerald-400" : "text-rose-500"}`}>
                          {passwordsMatch ? (
                            <>
                              <Check size={11} strokeWidth={3} /> Passwords match
                            </>
                          ) : (
                            <>
                              <X size={11} /> Passwords do not match
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Final Activation Submission */}
                    <div className="pt-2 sm:pt-3">
                      <button
                        type="submit"
                        disabled={submitting || !isPasswordValid || !passwordsMatch}
                        className="js-btn-primary group flex h-9 sm:h-10 lg:h-11 w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <>
                            <span>Activate & Enter Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom Nav Links */}
            <div className="mt-4 lg:mt-8 border-t border-[var(--aside-border)] pt-3 lg:pt-4 text-center text-[10.5px] sm:text-xs lg:text-[13px] font-semibold text-[var(--text-subtle)]">
              Already have an active account?{" "}
              <Link
                to={`/login?redirect=${encodeURIComponent(cleanRedirect)}`}
                className="font-bold text-[var(--lp-link)] hover:underline"
              >
                Log In
              </Link>
              <span className="mx-2 text-slate-500">•</span>
              <Link to="/signup" className="font-bold text-[var(--lp-link)] hover:underline">
                Create Account
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}