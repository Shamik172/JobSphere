import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  AlertCircle, 
  Loader2, 
  Building2, 
  User, 
  FileText 
} from "lucide-react";
import { notify } from "../../notification/Notification";

export default function MyAssessment() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null); // Modal state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();

  const fetchMyAssessments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/candidate/my_assessment`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAssessments(data.assessments || []);
      } else {
        notify(data.message || "Failed to load assessments", "error");
      }
    } catch (err) {
      notify("Network error loading assessments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssessments();
  }, []);

  const handleAccept = async (assessmentId, e) => {
    e.stopPropagation();
    setActionLoadingId(assessmentId);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/candidate/assessments/${assessmentId}/accept`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        notify("Invitation accepted! You can now enter the call room.", "success");
        setAssessments((prev) =>
          prev.map((item) =>
            item.assessmentId === assessmentId ? { ...item, status: "Accepted" } : item
          )
        );
      } else {
        notify(data.message || "Could not accept", "error");
      }
    } catch (err) {
      notify("Error accepting invitation", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (assessmentId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to decline this invitation? It will be removed from your dashboard.")) {
      return;
    }
    setActionLoadingId(assessmentId);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/candidate/assessments/${assessmentId}/decline`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        notify("Invitation declined and removed.", "info");
        setAssessments((prev) => prev.filter((item) => item.assessmentId !== assessmentId));
      } else {
        notify("Could not decline invitation", "error");
      }
    } catch (err) {
      notify("Error declining invitation", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleJoinCall = (assessmentId, roomId, e) => {
    e.stopPropagation();
    navigate(`/videocall/${assessmentId}/${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              My Scheduled Assessments
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Review your invitations, inspect evaluation requirements, and join technical interview sessions.
            </p>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-slate-300 font-semibold">
            {assessments.length} Total Sessions
          </span>
        </div>

        {/* Empty State */}
        {assessments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-md mx-auto space-y-3">
            <AlertCircle size={36} className="mx-auto text-slate-500" />
            <h3 className="text-base font-semibold text-slate-300">No Assessment Invitations</h3>
            <p className="text-xs text-slate-500">
              When an organization invites you to an interview, your invitation card will appear here.
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assessments.map((item) => {
              const isInvited = item.status === "Invited";
              const isAccepted = item.status === "Accepted";
              const isCompleted = item.status === "Completed";
              const isBusy = actionLoadingId === item.assessmentId;

              return (
                <div
                  key={item.assessmentId}
                  onClick={() => setSelectedAssessment(item)}
                  className="group relative cursor-pointer rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 p-6 backdrop-blur-xl transition duration-200 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Title & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition truncate">
                        {item.name}
                      </h2>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isInvited
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Host & Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-purple-400" />
                        <span>Host: {item.host?.name || "Technical Team"}</span>
                      </div>
                      {item.host?.company && (
                        <div className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-indigo-400" />
                          <span>{item.host.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Schedule & Duration Pills */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                        <Calendar size={13} className="text-purple-400" />
                        <span>
                          {item.scheduledAt
                            ? new Date(item.scheduledAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Flexible schedule"}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                        <Clock size={13} className="text-indigo-400" />
                        <span>{item.duration || 60} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssessment(item)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                    >
                      <Eye size={13} /> View Details
                    </button>

                    <div className="flex items-center gap-2">
                      {isInvited && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleDecline(item.assessmentId, e)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition disabled:opacity-50"
                          >
                            <XCircle size={13} /> Decline
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleAccept(item.assessmentId, e)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow disabled:opacity-50"
                          >
                            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Accept Invitation
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          type="button"
                          onClick={(e) => handleJoinCall(item.assessmentId, item.roomId, e)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
                        >
                          <Video size={13} /> Join Call Room
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs text-slate-500 font-medium">Session Concluded</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedAssessment.name}</h3>
                <p className="text-xs text-slate-400">Host: {selectedAssessment.host?.name || "Technical Team"}</p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Description & Syllabus
                </span>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  {selectedAssessment.description || "No specific instructions or topic outline provided by the host."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Duration</span>
                  <span className="font-semibold text-slate-200">{selectedAssessment.duration || 60} Minutes</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Session Status</span>
                  <span className="font-semibold text-slate-200">{selectedAssessment.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </button>
              {selectedAssessment.status === "Accepted" && (
                <button
                  onClick={(e) => handleJoinCall(selectedAssessment.assessmentId, selectedAssessment.roomId, e)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Video size={13} /> Enter Call Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}