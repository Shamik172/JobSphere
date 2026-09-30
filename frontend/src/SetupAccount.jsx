import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { notify } from "./notification/Notification.jsx";

export default function SetupAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const emailFromUrl = queryParams.get("email") || "";
  const rawRedirect = queryParams.get("redirect") || "/";

  // Sanitize redirect: strip origin if an absolute URL was passed
  const cleanRedirect = useMemo(() => {
    try {
      if (rawRedirect.startsWith("http")) {
        const parsed = new URL(rawRedirect);
        return parsed.pathname + parsed.search;
      }
      return rawRedirect;
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

  // Stage 1: Temp password verification states
  const [verifyingTemp, setVerifyingTemp] = useState(false);
  const [tempVerified, setTempVerified] = useState(false);
  const [tempError, setTempError] = useState("");

  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const lastCheckedTempRef = useRef("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset verification if user edits temp password after validating
    if (name === "tempPassword") {
      setTempError("");
      if (tempVerified) setTempVerified(false);
    }
  };

  // Automatically verify when temp password reaches exactly 8 characters
  useEffect(() => {
    const temp = form.tempPassword.trim();
    if (temp.length === 8 && !tempVerified && lastCheckedTempRef.current !== temp) {
      handleVerifyTempPassword(temp);
    }
  }, [form.tempPassword, tempVerified]);

  const handleVerifyTempPassword = async (tempToVerify) => {
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
      lastCheckedTempRef.current = tempToVerify;

      if (res.ok && data.valid) {
        setTempVerified(true);
        setTempError("");
        notify("Temporary password verified! Please choose your new password.", "success");
      } else {
        setTempVerified(false);
        setTempError(data.message || "Invalid temporary password.");
      }
    } catch {
      setTempError("Failed to verify password with server.");
    } finally {
      setVerifyingTemp(false);
    }
  };

  // Password criteria validation
  const criteria = useMemo(() => {
    const p = form.newPassword;
    return {
      length: p.length >= 8,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /\d/.test(p),
    };
  }, [form.newPassword]);

  const isPasswordValid = criteria.length && criteria.hasUpper && criteria.hasLower && criteria.hasNumber;
  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tempVerified) {
      notify("Please verify your temporary password first.", "warning");
      return;
    }

    if (!isPasswordValid) {
      notify("Password does not meet security criteria.", "warning");
      return;
    }

    if (!passwordsMatch) {
      notify("New passwords do not match.", "error");
      return;
    }

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
      if (!res.ok) throw new Error(data.message || "Failed to activate account");

      notify("Account activated successfully!", "success");
      await login();

      // Clean navigate to destination
      navigate(cleanRedirect, { replace: true });
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2 border border-indigo-500/20">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Activate Your Account</h1>
          <p className="text-xs text-slate-400">
            Verify temporary credentials to unlock and set your permanent password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email (Read Only) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Invited Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none focus:outline-none"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Your Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* STAGE 1: Temporary Password Input & Auto-Check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400">Temporary Password from Email</label>
              {verifyingTemp && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400">
                  <Loader2 size={12} className="animate-spin" /> Verifying...
                </span>
              )}
              {tempVerified && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>

            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showTemp ? "text" : "password"}
                name="tempPassword"
                required
                disabled={tempVerified}
                placeholder="Paste 8-character password"
                value={form.tempPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border rounded-xl text-sm font-mono transition ${
                  tempVerified
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/10 cursor-not-allowed"
                    : tempError
                    ? "border-rose-500/50 text-rose-200"
                    : "border-slate-800 text-white focus:ring-1 focus:ring-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowTemp(!showTemp)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showTemp ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {tempError && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <X size={12} /> {tempError}
              </p>
            )}
            {!tempVerified && !tempError && (
              <p className="text-[10px] text-slate-500 mt-1">
                Enter your 8-character temporary key to unlock password setup.
              </p>
            )}
          </div>

          {/* STAGE 2: Unlocks ONLY when Temporary Password is Verified */}
          {tempVerified ? (
            <div className="space-y-4 pt-3 border-t border-slate-800/80 animate-in fade-in duration-300">
              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">New Permanent Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    required
                    placeholder="Create secure password"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 px-1">
                  <span className={`text-[11px] flex items-center gap-1.5 ${criteria.length ? "text-emerald-400" : "text-slate-500"}`}>
                    {criteria.length ? <Check size={12} /> : <X size={12} />} At least 8 characters
                  </span>
                  <span className={`text-[11px] flex items-center gap-1.5 ${criteria.hasUpper ? "text-emerald-400" : "text-slate-500"}`}>
                    {criteria.hasUpper ? <Check size={12} /> : <X size={12} />} One uppercase letter
                  </span>
                  <span className={`text-[11px] flex items-center gap-1.5 ${criteria.hasLower ? "text-emerald-400" : "text-slate-500"}`}>
                    {criteria.hasLower ? <Check size={12} /> : <X size={12} />} One lowercase letter
                  </span>
                  <span className={`text-[11px] flex items-center gap-1.5 ${criteria.hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                    {criteria.hasNumber ? <Check size={12} /> : <X size={12} />} One number
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                    {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !isPasswordValid || !passwordsMatch}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Activate & Proceed to Assessment
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
              🔒 New password options will unlock once the temporary password is verified.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}