import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Loader2,
  Camera,
  RotateCcw,
  Save,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { notify } from "../notification/Notification.jsx";
import PageShell from "../components/common/PageShell.jsx";

export default function ProfilePage() {
  const { user } = useAuth();
  const role = user?.role || "candidate";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    department: "",
    position: "",
    education: "",
    skills: "",
    experience: "",
    profilePic: "",
    document_url: "",
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Avatar object URL preview cleanup
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePicPreview(null);
      return;
    }
    const url = URL.createObjectURL(profilePicFile);
    setProfilePicPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePicFile]);

  // Fetch current profile data
  const fetchProfile = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/${role}/profile`, {
        withCredentials: true,
      });
      setProfile((prev) => ({ ...prev, ...data.user }));
      notify("Profile synced successfully", "success");
    } catch (e) {
      console.warn("Fetch profile failed", e);
      notify("Failed to fetch profile", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectProfilePic = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify("Please select an image file", "error");
    if (file.size > 5 * 1024 * 1024) return notify("Image too large (max 5MB)", "error");
    setProfilePicFile(file);
  };

  const onSelectDocument = (file) => {
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) return notify("Please upload PDF / DOC / DOCX files", "error");
    if (file.size > 10 * 1024 * 1024) return notify("File too large (max 10MB)", "error");
    setDocumentFile(file);
    setDocumentName(file.name);
  };

  const handleUploadFiles = async () => {
    if (!profilePicFile && !documentFile) {
      return notify("Select an avatar or document first", "warning");
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (profilePicFile) formData.append("profilePic", profilePicFile);
      if (documentFile) {
        if (role === "candidate") formData.append("resume", documentFile);
        else if (role === "interviewer") formData.append("companyProof", documentFile);
      }

      const resp = await axios.post(`${BACKEND_URL}/api/${role}/profile/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      notify(resp.data.message || "Assets uploaded successfully", "success");

      setProfile((prev) => ({
        ...prev,
        profilePic: resp.data.uploadedFiles?.profilePic || prev.profilePic,
        document_url: resp.data.uploadedFiles?.document || prev.document_url,
      }));
      setProfilePicFile(null);
      setDocumentFile(null);
      setDocumentName("");
    } catch (err) {
      console.error(err);
      notify("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/${role}/profile/update`, profile, {
        withCredentials: true,
      });
      setProfile((prev) => ({ ...prev, ...data.user }));
      notify(data.message || "Profile updated successfully", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const isInterviewer = role === "interviewer";
  const docLabel = isInterviewer ? "Company Verification Proof" : "Candidate Resume";

  return (
    <PageShell>
      <main className="lp-enter mx-auto max-w-5xl space-y-4 px-3 pb-16 pt-3 sm:space-y-5 sm:px-6 sm:pt-4 lg:px-8 lg:pt-8">
        {/* Header Hero Card */}
        <section className="lp-glass-card rounded-2xl p-4 sm:rounded-3xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Trigger */}
              <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                <img
                  src={profilePicPreview || profile.profilePic || "/default-avatar.png"}
                  alt={profile.name || "Avatar"}
                  className="h-full w-full rounded-2xl object-cover ring-2 ring-[var(--ring-gap)] shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change avatar"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onSelectProfilePic(e.target.files?.[0])}
                  ref={fileInputRef}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-lg font-black text-[var(--lp-text-title)] sm:text-2xl">
                    {profile.name || "User Profile"}
                  </h1>
                  <span className="lp-badge is-ok capitalize">
                    <ShieldCheck size={12} /> {role}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-[var(--lp-text-muted)] sm:text-sm">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={fetching}
                className="lp-btn-ghost h-9 px-3.5 text-xs"
              >
                <RotateCcw size={13} className={fetching ? "animate-spin" : ""} />
                <span>{fetching ? "Syncing..." : "Sync"}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="js-btn-primary flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white shadow-md active:scale-95"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{saving ? "Saving..." : "Save changes"}</span>
              </button>
            </div>
          </div>

          {/* Pending Avatar Upload Pill */}
          {profilePicFile && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-[var(--lp-link)]">
              <span>New photo selected: {profilePicFile.name}</span>
              <button
                type="button"
                onClick={handleUploadFiles}
                disabled={loading}
                className="js-btn-primary flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] text-white"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                <span>Upload</span>
              </button>
            </div>
          )}
        </section>

        {/* Content Section: 2 Column Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Profile Form */}
          <div className="space-y-4 lg:col-span-2">
            <div className="lp-glass-card space-y-4 rounded-2xl p-4 sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-2 border-b border-[var(--lp-surface-border)] pb-3">
                <Sparkles size={16} className="text-[var(--lp-link)]" />
                <h2 className="text-sm font-black text-[var(--lp-text-title)] sm:text-base">
                  Account & Identity Details
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="lp-label">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold opacity-75 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="lp-label">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold opacity-75 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-b border-[var(--lp-surface-border)] pb-3 pt-2">
                {isInterviewer ? (
                  <Building2 size={16} className="text-[var(--lp-link)]" />
                ) : (
                  <GraduationCap size={16} className="text-[var(--lp-link)]" />
                )}
                <h2 className="text-sm font-black text-[var(--lp-text-title)] sm:text-base">
                  {isInterviewer ? "Organization & Placement" : "Academic & Technical Credentials"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isInterviewer ? (
                  <>
                    <div>
                      <label className="lp-label">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={profile.company}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="lp-label">Department / Team</label>
                      <input
                        type="text"
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                        placeholder="e.g. Infrastructure Engineering"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="lp-label">Designation / Role</label>
                      <input
                        type="text"
                        name="position"
                        value={profile.position}
                        onChange={handleChange}
                        placeholder="e.g. Staff Engineer"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="lp-label">Highest Education</label>
                      <input
                        type="text"
                        name="education"
                        value={profile.education}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech in Computer Science, IIT Bombay"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="lp-label">Key Competencies / Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={profile.skills}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, Go, Distributed Systems"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="lp-label">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={profile.experience}
                        onChange={handleChange}
                        placeholder="e.g. 3 years full-stack"
                        className="glass-input h-10 w-full rounded-xl px-3 text-xs font-semibold sm:text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Document Verification & Upload Hub */}
          <div className="space-y-4">
            <div className="lp-glass-card space-y-3.5 rounded-2xl p-4 sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-2 border-b border-[var(--lp-surface-border)] pb-3">
                <Briefcase size={16} className="text-[var(--lp-link)]" />
                <h2 className="text-sm font-black text-[var(--lp-text-title)] sm:text-base">
                  Documents & Verification
                </h2>
              </div>

              <p className="text-xs font-medium leading-relaxed text-[var(--lp-text-muted)]">
                {isInterviewer
                  ? "Attach proof of company affiliation (Offer letter, Employee ID, or NDAs)."
                  : "Upload your current CV or technical resume for evaluators."}
              </p>

              {/* Upload Drop Container */}
              <div className="rounded-xl border border-dashed border-[var(--lp-surface-border)] bg-[var(--lp-surface)] p-3 text-center">
                <FileText size={28} className="mx-auto text-[var(--lp-link)]" />
                <p className="mt-1 truncate text-xs font-bold text-[var(--lp-text-title)]">
                  {documentName || docLabel}
                </p>
                <p className="text-[10px] font-semibold text-[var(--lp-text-muted)]">
                  PDF or DOCX up to 10MB
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onSelectDocument(e.target.files?.[0])}
                    ref={docInputRef}
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="lp-btn-ghost h-8 px-3 text-xs"
                  >
                    <Upload size={13} />
                    <span>{documentFile ? "Replace" : "Select file"}</span>
                  </button>

                  {documentFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentFile(null);
                        setDocumentName("");
                      }}
                      className="lp-icon-btn is-danger !h-8 !w-8"
                      title="Remove file"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Push Document Changes Button */}
              {documentFile && (
                <button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={loading}
                  className="js-btn-primary flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>Save and upload asset</span>
                </button>
              )}

              {/* Verified Existing Document Link */}
              {profile.document_url && !documentFile && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      <span className="text-xs font-bold text-[var(--lp-text-title)]">
                        Active Document
                      </span>
                    </div>
                    <a
                      href={encodeURI(profile.document_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-black text-[var(--lp-link)] hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}