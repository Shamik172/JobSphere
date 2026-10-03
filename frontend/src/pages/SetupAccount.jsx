import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { notify } from "../notification/Notification.jsx";
import JobSphereEcosystemBackground from "../components/canvas/JobSphereEcosystemBackground.jsx";
import AuthFeatureShowcase from "../components/auth/AuthFeatureShowcase.jsx";
import "../components/auth/authStyles.css";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
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

  const [form, setForm] = useState({
    email: emailFromUrl,
    name: emailFromUrl ? emailFromUrl.split("@")[0] : "",
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [verifyingTemp, setVerifyingTemp] = useState(false);
  const [tempVerified, setTempVerified] = useState(false);
  const [tempError, setTempError] = useState("");
  const [show, setShow] = useState({ temp: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const lastCheckedRef = useRef("");

  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "tempPassword") {
      setTempError("");
      if (tempVerified) setTempVerified(false);
    }
  };

  useEffect(() => {
    const temp = form.tempPassword.trim();
    if (temp.length === 8 && !tempVerified && lastCheckedRef.current !== temp) {
      verifyTempKey(temp);
    }
  }, [form.tempPassword, tempVerified]);

  const verifyTempKey = async (tempToVerify) => {
    if (!form.email || !tempToVerify) return;
    setVerifyingTemp(true);
    setTempError("");
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
        setTempError(data.message || "Invalid or expired key.");
      }
    } catch {
      setTempError("Server connection failed.");
    } finally {
      setVerifyingTemp(false);
    }
  };

  const criteria = useMemo(() => [
    { ok: form.newPassword.length >= 8, text: "8+ characters" },
    { ok: /[A-Z]/.test(form.newPassword), text: "1 uppercase" },
    { ok: /[a-z]/.test(form.newPassword), text: "1 lowercase" },
    { ok: /\d/.test(form.newPassword), text: "1 numeric digit" },
  ], [form.newPassword]);

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

          {/* Right Setup Form Card */}
          <section className="flex flex-col justify-center px-4 py-4 sm:p-9 xl:p-12 w-full max-w-full overflow-hidden box-border" style={{ background: "var(--right-panel-bg)" }}>
            
            {/* Mobile Header */}
            <div className="mb-2.5 sm:mb-4 flex items-center justify-between w-full lg:hidden">
              <span className="text-base sm:text-lg font-black text-[var(--title-color)] tracking-tight">JobSphere</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)] shrink-0">Setup</span>
            </div>

            {/* Mobile Showcase */}
            <AuthFeatureShowcase isMobile />

            {/* Stepper Progress */}
            <div className="mb-2.5 sm:mb-5 flex flex-col items-center">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl text-xs font-bold text-white transition-all ${
                  tempVerified ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-emerald-600"
                }`}>
                  {tempVerified ? <Check size={14} strokeWidth={3} /> : "1"}
                </div>
                <div className={`h-1.5 w-10 sm:w-12 rounded-full transition-colors ${tempVerified ? "bg-emerald-500" : "bg-emerald-500/20"}`} />
                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                  tempVerified ? "bg-emerald-600 text-white" : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                }`}>
                  2
                </div>
              </div>
              <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                {tempVerified ? "Step 2: Create Password" : "Step 1: Invitation Key"}
              </span>
            </div>

            {/* Heading */}
            <div className="mb-2 sm:mb-0 text-center sm:text-left">
              <h1 className="text-lg font-black text-[var(--title-color)] sm:text-3xl leading-snug">
                Finish setting up account
              </h1>
              <p className="text-[10.5px] font-medium text-[var(--text-muted)] sm:mt-1.5 sm:text-sm">
                Validate your key to unlock your personal workspace access.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-2 sm:mt-6 space-y-2 sm:space-y-3.5">
              
              {/* Prefilled Locked Email */}
              <div className="space-y-0.5 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Invited Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    tabIndex={-1}
                    className="glass-input-locked h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-20 text-xs sm:text-sm font-semibold opacity-90 select-all"
                  />
                  <span className="pointer-events-none absolute right-2.5 flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <Lock size={10} /> Locked
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-0.5 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Your Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Henderson"
                    className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-3 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Temporary Key */}
              <div className="space-y-0.5 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">8-Character Key</label>
                  {verifyingTemp ? (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600"><Loader2 size={11} className="animate-spin" /> Verifying...</span>
                  ) : tempVerified ? (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} /> Confirmed</span>
                  ) : null}
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                  <input
                    name="tempPassword"
                    required
                    maxLength={8}
                    disabled={tempVerified}
                    type={show.temp ? "text" : "password"}
                    value={form.tempPassword}
                    onChange={handleChange}
                    placeholder="Paste 8-char key"
                    className={`glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-9 font-mono text-xs sm:text-sm tracking-widest uppercase ${
                      tempVerified
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                        : tempError
                        ? "border-rose-500 bg-rose-500/10 text-rose-500"
                        : ""
                    }`}
                  />
                  <button type="button" onClick={() => toggle("temp")} aria-label="Toggle temporary key visibility" className="absolute right-2.5 sm:right-3.5 p-1 text-[var(--icon-color)] hover:scale-110">
                    {show.temp ? <EyeOff className="w-4 h-4 sm:w-[17px] sm:h-[17px]" /> : <Eye className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />}
                  </button>
                </div>
                {tempError && (
                  <p className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-500"><ShieldAlert size={12} /> {tempError}</p>
                )}
              </div>

              {/* Password Setup Form */}
              {tempVerified ? (
                <div className="space-y-2.5 sm:space-y-3.5 border-t border-[var(--aside-border)] pt-2 sm:pt-3">
                  <div className="space-y-0.5 sm:space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Create Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                      <input
                        name="newPassword"
                        required
                        type={show.new ? "text" : "password"}
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-9 text-xs sm:text-sm font-semibold"
                      />
                      <button type="button" onClick={() => toggle("new")} aria-label="Toggle password visibility" className="absolute right-2.5 sm:right-3.5 p-1 text-[var(--icon-color)] hover:scale-110">
                        {show.new ? <EyeOff className="w-4 h-4 sm:w-[17px] sm:h-[17px]" /> : <Eye className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 rounded-xl border border-[var(--aside-border)] bg-[var(--aside-bg)] p-2 sm:p-2.5">
                    {criteria.map((c) => (
                      <div key={c.text} className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold ${c.ok ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--text-subtle)]"}`}>
                        {c.ok ? <Check size={11} strokeWidth={3} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 sm:space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-bold text-[var(--title-color)]">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] pointer-events-none absolute left-3 sm:left-3.5 text-[var(--icon-color)]" strokeWidth={2.4} />
                      <input
                        name="confirmPassword"
                        required
                        type={show.confirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        className="glass-input h-9 sm:h-11 w-full rounded-xl pl-9 sm:pl-11 pr-9 text-xs sm:text-sm font-semibold"
                      />
                      <button type="button" onClick={() => toggle("confirm")} aria-label="Toggle password visibility" className="absolute right-2.5 sm:right-3.5 p-1 text-[var(--icon-color)] hover:scale-110">
                        {show.confirm ? <EyeOff className="w-4 h-4 sm:w-[17px] sm:h-[17px]" /> : <Eye className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />}
                      </button>
                    </div>
                    {form.confirmPassword && (
                      <p className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold ${passwordsMatch ? "text-emerald-700 dark:text-emerald-400" : "text-rose-500"}`}>
                        {passwordsMatch ? <><Check size={11} strokeWidth={3} /> Passwords match</> : <><X size={11} /> Passwords do not match</>}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !isPasswordValid || !passwordsMatch}
                    className="js-btn-primary group relative mt-1 sm:mt-2 flex h-9 sm:h-11 w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm font-bold text-white active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate-spin" />
                    ) : (
                      <>
                        <span>Activate & Enter Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl p-3 shadow-sm border border-[var(--tag-border)] bg-[var(--tag-bg)]">
                  <Sparkles size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[11px] font-semibold text-[var(--title-color)]">Password inputs unlock automatically once your 8-digit key is verified.</p>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}