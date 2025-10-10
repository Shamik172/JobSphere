import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Search, Loader2, Users, FileText } from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const handleResponse = async (res) => {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch data");
    } catch {
      throw new Error("Faupcoming_assessmentiled to fetch data: " + res.statusText);
    }
  }
  return res.json();
};

const api = {
  getAllAssessments: async () => {
    const res = await fetch(`${API_BASE_URL}/assessments/my-assessments`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse(res);
  },
};

export default function UpcomingAssessments() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState({ hosted: [], collaborator: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const fetchAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAllAssessments();
      setAssessments({
        hosted: data.hosted || [],
        collaborator: data.collaborator || [],
      });
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const filterAssessments = (list) =>
    list.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const withinDate =
        (!dateRange.from || new Date(a.createdAt) >= new Date(dateRange.from)) &&
        (!dateRange.to || new Date(a.createdAt) <= new Date(dateRange.to));
      return matchesSearch && withinDate;
    });

  const filteredHosted = useMemo(() => filterAssessments(assessments.hosted), [searchQuery, dateRange, assessments]);
  const filteredCollaborator = useMemo(() => filterAssessments(assessments.collaborator), [searchQuery, dateRange, assessments]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-indigo-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="ml-4 text-indigo-700 font-semibold">Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-red-50 text-red-700 font-semibold text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-indigo-100 mb-8">
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Search className="text-indigo-600" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessment by name..."
              className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="text-indigo-600" size={20} />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-indigo-500 font-semibold">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hosted Assessments */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Hosted Assessments
            </h2>
            {filteredHosted.length > 0 ? (
              <div className="space-y-4">
                {filteredHosted.map((a) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => (window.location.href = `/assessment/${a._id}`)}
                    className="cursor-pointer bg-indigo-50 rounded-xl shadow-md p-5 border border-indigo-200 hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold text-indigo-700">{a.name}</h3>
                    <p className="text-sm text-indigo-600 mt-1 line-clamp-2">{a.description || "No description"}</p>
                    <p className="text-xs text-gray-500 mt-2">Created on: {new Date(a.createdAt).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-indigo-500 italic">No hosted assessments found.</p>
            )}
          </section>

          {/* Collaborator Assessments */}
          <section>
            <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
              <Users className="text-purple-600" /> Collaborator Assessments
            </h2>
            {filteredCollaborator.length > 0 ? (
              <div className="space-y-4">
                {filteredCollaborator.map((a) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => (window.location.href = `/assessment/${a._id}`)}
                    className="cursor-pointer bg-purple-50 rounded-xl shadow-md p-5 border border-purple-200 hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold text-purple-700">{a.name}</h3>
                    <p className="text-sm text-purple-600 mt-1 line-clamp-2">{a.description || "No description"}</p>
                    <p className="text-xs text-gray-500 mt-2">Created on: {new Date(a.createdAt).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-purple-500 italic">No collaborator assessments found.</p>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}
