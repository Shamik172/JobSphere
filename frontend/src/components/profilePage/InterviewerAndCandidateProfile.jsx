import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, ImageIcon, RotateCcw, Save } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../notification/Notification";

export default function InterviewerAndCandidateProfile() {
  const { user } = useAuth();
  const role = user?.role || "candidate";

  console.log("profile page: ", user)

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
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fileInputRef = useRef();
  const docInputRef = useRef();

  // Preview image
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePicPreview(null);
      return;
    }
    const url = URL.createObjectURL(profilePicFile);
    setProfilePicPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePicFile]);

  // Fetch existing profile
  const fetchProfile = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/${role}/profile`, {
        withCredentials: true,
      });
      // Merge backend profile
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

  // Handlers
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
    if (!profilePicFile && !documentFile) return notify("Select a profile pic or document first", "warning");
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

      notify(resp.data.message || "Files uploaded successfully", "success");

      // Update profile state with new Cloudinary URLs
      setProfile((prev) => ({
        ...prev,
        profilePic: resp.data.uploadedFiles?.profilePic || prev.profilePic,
        document_url: resp.data.uploadedFiles?.document || prev.document_url,
      }));

    } catch (err) {
      console.error(err);
      notify("Upload failed", "error");
    } finally {
      setLoading(false);
      setProfilePicFile(null);
      setDocumentFile(null);
      setDocumentName("");
      setProfilePicPreview(null);
    }
  };


  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/${role}/profile/update`, profile, {
        withCredentials: true,
      });
      setProfile((prev) => ({ ...prev, ...data.user }));
      notify(data.message || "Profile saved successfully", "success");
    } catch (err) {
      console.error(err);
      notify("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-indigo-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700">
              {role === "candidate" ? "Candidate Profile" : "Interviewer Profile"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your details and upload required documents.</p>
          </div>
          <div
            className={`px-4 py-1 rounded-full text-xs font-semibold ${
              fetching ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {fetching ? "Syncing..." : "Up to date"}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative flex flex-col items-center">
              <motion.img
                src={profilePicPreview || profile.profilePic || "/default-avatar.png"}
                alt="avatar"
                className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                whileHover={{ scale: 1.03 }}
              />
              <label className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 cursor-pointer hover:bg-indigo-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onSelectProfilePic(e.target.files?.[0])}
                  ref={fileInputRef}
                />
                <ImageIcon size={16} />
                <span className="text-xs font-medium text-indigo-700">Change</span>
              </label>
            </div>

            <div className="text-center mt-2">
              <div className="font-semibold text-indigo-700 text-lg">{profile.name || "Your Name"}</div>
              <div className="text-sm text-slate-500">{profile.email || "you@example.com"}</div>
            </div>

            {/* Document Upload */}
            <div className="w-full">
              <div className="rounded-lg border border-dashed border-indigo-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium">
                    {documentName || (role === "candidate" ? "Resume (PDF/DOCX)" : "Company Proof (PDF/DOCX)")}
                  </span>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-sm text-indigo-700 font-medium">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onSelectDocument(e.target.files?.[0])}
                        ref={docInputRef}
                      />
                      <Upload size={14} />
                      <span>{documentFile ? "Replace" : "Upload"}</span>
                    </label>
                    {documentFile && (
                      <button
                        onClick={() => {
                          setDocumentFile(null);
                          setDocumentName("");
                        }}
                        className="text-sm text-slate-500 hover:text-red-500 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-400">Max sizes: Image 5MB — Document 10MB</div>
              </div>
            </div>
            <button
              onClick={handleUploadFiles}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
              <span>{loading ? "Uploading..." : "Upload Files"}</span>
            </button>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" value={profile.name} disabled />
              <InputField label="Email" name="email" value={profile.email} disabled />

              {role === "interviewer" ? (
                <>
                  <InputField label="Company" name="company" value={profile.company} onChange={handleChange} />
                  <InputField label="Department" name="department" value={profile.department} onChange={handleChange} />
                  <InputField label="Position" name="position" value={profile.position} onChange={handleChange} />
                </>
              ) : (
                <>
                  <InputField label="Education" name="education" value={profile.education} onChange={handleChange} />
                  <InputField label="Skills" name="skills" value={profile.skills} onChange={handleChange} />
                  <InputField label="Experience" name="experience" value={profile.experience} onChange={handleChange} />
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-3 mt-6">
              <button
                onClick={fetchProfile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                <RotateCcw size={16} /> Reload
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>

            {/* Show uploaded document button */}
            {profile.document_url && !documentFile && (
              <a
                href={encodeURI(profile.document_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-15 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md"
              >
                <Upload size={16} /> View Uploaded {role === "candidate" ? "Resume" : "Company Proof"}
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Tip: Keep your photo professional and ensure uploaded documents are valid.
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Input Field
function InputField({ label, name, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
          disabled ? "bg-gray-50 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
