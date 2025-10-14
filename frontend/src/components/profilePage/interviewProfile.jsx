import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Upload } from "lucide-react";

const InterviewProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    department: "",
    position: "",
    profilePic: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch profile from backend
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/interviewer/profile`, {
        withCredentials: true,
      });
      
        setProfile({
          name: data.user.name,
          email: data.user.email,
          company: data.user.company || "",
          department: data.user.department || "",
          position: data.user.position || "",
          profilePic: data.user.profilePic || "",
        });
    
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile info
  const handleUpdate = async () => {
    try {
      console.log("call")
      const { data } = await axios.post(
        `${BASE_URL}/api/interviewer/update`,
        profile,
        { withCredentials: true }
      );
      alert(data.message);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Handle profile pic selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload profile pic
  const handleUpload = async () => {
    if (!image) return alert("Select an image first");

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BASE_URL}/api/interviewer/upload-profile-pic`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(data.message);
      setImage(null);
      setPreview(null);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-indigo-100 space-y-8"
      >
        <h2 className="text-3xl font-bold text-indigo-700 text-center">
          My Profile
        </h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <motion.img
            src={preview || profile.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover mb-4 border-4 border-indigo-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
          />
          <div className="flex gap-2">
            <input type="file" onChange={handleImageChange} />
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-indigo-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border border-indigo-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-indigo-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border border-indigo-200 px-4 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-semibold text-indigo-700 mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={profile.company}
              onChange={handleChange}
              className="w-full border border-indigo-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-indigo-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={profile.department}
              onChange={handleChange}
              className="w-full border border-indigo-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-indigo-700 mb-1">Position</label>
            <input
              type="text"
              name="position"
              value={profile.position}
              onChange={handleChange}
              className="w-full border border-indigo-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="text-center">
          <button
            onClick={handleUpdate}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md transition"
          >
            Update Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewProfile;
