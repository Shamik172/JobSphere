import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Search, Loader2, Users, FileText, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const handleResponse = async (res) => {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch data");
    } catch {
      throw new Error("Failed to fetch data: " + res.statusText);
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
  const navigate = useNavigate();
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
      const itemDate = new Date(a.scheduledAt || a.createdAt);
      const withinDate =
        (!dateRange.from || itemDate >= new Date(dateRange.from)) &&
        (!dateRange.to || itemDate <= new Date(dateRange.to));
      return matchesSearch && withinDate;
    });

  const filteredHosted = useMemo(
    () => filterAssessments(assessments.hosted),
    [searchQuery, dateRange, assessments.hosted]
  );
  const filteredCollaborator = useMemo(
    () => filterAssessments(assessments.collaborator),
    [searchQuery, dateRange, assessments.collaborator]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center text-slate-300">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={40} />
        <p className="text-sm font-medium tracking-wide text-slate-400">Loading your assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-300 max-w-md text-center">
          <p className="text-sm font-semibold mb-2">Error Loading Assessments</p>
          <p className="text-xs text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Dashboard</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Assessment Directory
            </h1>
          </div>
          <button
            onClick={() => navigate("/assessments/create")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
          >
            Create Assessment
          </button>
        </div>

        {/* Filters */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessment by name..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar size={17} className="text-indigo-400 shrink-0" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-500 font-medium">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Hosted Assessments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> Hosted by Me
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                {filteredHosted.length}
              </span>
            </div>

            {filteredHosted.length > 0 ? (
              <div className="space-y-3.5">
                {filteredHosted.map((a) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/assessments/${a._id}`)}
                    className="group cursor-pointer rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 p-5 backdrop-blur-xl transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition">
                          {a.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {a.description || "No description provided."}
                        </p>
                      </div>
                      <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.scheduledAt && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400">Scheduled: {new Date(a.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No hosted assessments found.</p>
            )}
          </section>

          {/* Collaborator Assessments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users size={18} className="text-purple-400" /> Collaborator Panels
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                {filteredCollaborator.length}
              </span>
            </div>

            {filteredCollaborator.length > 0 ? (
              <div className="space-y-3.5">
                {filteredCollaborator.map((a) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/assessments/${a._id}`)}
                    className="group cursor-pointer rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/40 p-5 backdrop-blur-xl transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-400 transition">
                          {a.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {a.description || "No description provided."}
                        </p>
                      </div>
                      <ArrowRight size={18} className="text-slate-600 group-hover:text-purple-400 transition shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.scheduledAt && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400">Scheduled: {new Date(a.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No collaborator assessments found.</p>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}