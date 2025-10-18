import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Users, Star } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const [latestAssessments, setLatestAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch assessments from backend
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/assessments/latest`,
          { withCredentials: true }
        );

        // Flatten grouped object into an array for carousel
        const grouped = res.data.grouped || {};
        const flatList = Object.values(grouped).flat();
        setLatestAssessments(flatList);
      } catch (err) {
        console.error("Error fetching latest assessments:", err);
        setLatestAssessments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const topThree = latestAssessments.slice(0, 3);
  const safeIndex = topThree.length > 0 ? currentIndex % topThree.length : 0;

  // Auto-slide carousel
  useEffect(() => {
    if (topThree.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topThree.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topThree.length]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16">
      {/* Left Section */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold leading-tight"
        >
          Hire smarter with{" "}
          <span className="text-indigo-600">real-time coding interviews</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-base text-slate-600 max-w-xl"
        >
          Conduct structured technical interviews with integrated video, collaborative code editor, and question management.
        </motion.p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/assessment/upcoming_assessment"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:opacity-95"
          >
            Upcoming Assessments <ArrowRight size={16} />
          </a>
          <a
            href="/create_assessment"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-5 py-3 text-sm font-medium hover:bg-slate-50"
          >
            Create Assessment
          </a>
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-50 p-2">
              <Star size={18} className="text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold">4.8/5</div>
              <div className="text-xs">Interview experience</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-50 p-2">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold">200+ companies</div>
              <div className="text-xs">trust JobSphere</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Carousel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-5xl"
      >
        <h2 className="text-3xl font-extrabold mb-2 flex justify-center text-indigo-800 transition-all duration-300">
          {loading
            ? "Fetching Assessments..."
            : topThree.length === 0
              ? "Add Your Assessment"
              : "Latest Interview Sessions"}
        </h2>


        {loading ? (
          // Skeleton / Shimmer loading card
          <div className="relative h-96 rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-50 to-violet-50 animate-pulse flex flex-col p-6 gap-4">
            {/* Header */}
            <div className="h-8 w-2/3 bg-indigo-200 rounded-lg"></div>
            <div className="h-6 w-1/4 bg-indigo-100 rounded-lg"></div>

            {/* Questions & Participants */}
            <div className="flex flex-1 gap-4 mt-4">
              {/* Questions */}
              <div className="w-3/5 bg-white rounded-xl p-4">
                <div className="h-6 w-3/4 bg-indigo-100 rounded-lg mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-indigo-100 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-indigo-100 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-indigo-100 rounded-md"></div>
                </div>
              </div>

              {/* Participants */}
              <div className="w-2/5 flex flex-col gap-3">
                <div className="flex-1 bg-violet-50 rounded-xl p-3">
                  <div className="h-5 w-1/2 bg-violet-100 rounded-lg mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-violet-100 rounded-md"></div>
                    <div className="h-4 w-3/4 bg-violet-100 rounded-md"></div>
                  </div>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-xl p-3">
                  <div className="h-5 w-1/2 bg-indigo-100 rounded-lg mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-indigo-100 rounded-md"></div>
                    <div className="h-4 w-3/4 bg-indigo-100 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="h-10 w-32 bg-indigo-200 rounded-xl mt-4 ml-auto"></div>
          </div>
        ) : topThree.length === 0 ? (
          // Dummy demo card if no assessments exist
          <div className="relative h-96 rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex flex-col p-6 gap-4">
            <h3 className="text-xl font-bold text-indigo-700">
              Create your first assessment
            </h3>
            <p className="text-slate-500 text-sm">
              No assessments found. Here’s a demo card to get you started.
            </p>

            <div className="flex flex-1 gap-4 mt-4">
              {/* Demo Questions */}
              <div className="w-3/5 bg-white rounded-xl p-4 overflow-auto">
                <h4 className="font-semibold text-indigo-600 mb-2">Demo Assessment</h4>
                <div className="space-y-2 text-xs font-mono text-slate-700">
                  <div>// Example Question 1</div>
                  <div>// Example Question 2</div>
                  <div>// Example Question 3</div>
                </div>
              </div>

              {/* Demo Participants */}
              <div className="w-2/5 flex flex-col gap-3 overflow-auto">
                <div className="flex-1 bg-violet-50 rounded-xl p-3">
                  <h5 className="text-indigo-600 font-medium mb-2">Collaborators</h5>
                  <ul className="text-xs text-slate-700 space-y-1">
                    <li>Demo User 1</li>
                    <li>Demo User 2</li>
                  </ul>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-xl p-3">
                  <h5 className="text-indigo-700 font-medium mb-2">Candidates</h5>
                  <ul className="text-xs text-slate-700 space-y-1">
                    <li>Candidate 1</li>
                    <li>Candidate 2</li>
                  </ul>
                </div>
              </div>
            </div>

            <a
              href="/create_assessment"
              className=" ml-auto bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700"
            >
              Create Assessment
            </a>
          </div>
        ) : (
          <div className="relative h-96 overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-50 to-violet-50 hover:scale-[1.02] transition-transform duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={topThree[safeIndex]?._id || "empty"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-between p-6"
              >
                {/* Header - Name & Date */}
                <div className="flex justify-between items-start">
                  {/* Left side - Name & Date */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-indigo-900 tracking-tight">
                      {topThree[safeIndex]?.name || "Untitled Assessment"}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-indigo-700">
                      <span className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded-full shadow-sm">
                        <CalendarDays size={16} />
                        {topThree[safeIndex]?.createdAt
                          ? new Date(topThree[safeIndex].createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span className="bg-violet-100 px-2 py-1 rounded-full shadow-sm text-violet-700">
                        By: {topThree[safeIndex]?.created_by?.name || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Right side - View Session Button */}
                  <Link
                    to={`/assessment/${topThree[safeIndex]?._id || "#"}`}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-md"
                  >
                    View Session
                    <ArrowRight size={16} />
                  </Link>
                </div>


                {/* Middle - Questions & Participants */}
                <div className="flex flex-1 gap-4 mt-3">
                  {/* Left - Questions */}
                  {/* Left - Questions */}
                  <div className=" w-[60%] h-[220px]   rounded-xl p-4 shadow-inner border bg-white border-indigo-100 flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-2 mb-2">
                      <h4 className="font-semibold text-indigo-700 text-lg">Questions</h4>
                      <span className="text-xs text-indigo-500 font-medium">
                        {topThree[safeIndex]?.questions?.length || 0} total
                      </span>
                    </div>

                    {/* Scrollable Question List */}
                    <div className="flex-1 overflow-y-auto max-h-64 pr-1 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
                      {topThree[safeIndex]?.questions?.length > 0 ? (
                        <ul className="space-y-2">
                          {topThree[safeIndex].questions.map((q) => (
                            <li
                              key={q._id}
                              className="flex justify-between items-center text-sm bg-indigo-50 px-3 py-2 rounded-md border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-all duration-200"
                            >
                              <span className="truncate text-indigo-900 font-medium">{q.title}</span>
                              {/* Difficulty Indicator */}
                              <div
                                className={`h-4 w-4 rounded-full shadow-sm ${q.difficulty === "Hard"
                                    ? "bg-red-500"
                                    : q.difficulty === "Medium"
                                      ? "bg-yellow-400"
                                      : "bg-green-500"
                                  }`}
                                title={q.difficulty}
                              ></div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex justify-center items-center h-24">
                          <p className="text-sm text-indigo-400">No questions yet</p>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Right - Participants */}
                  {/* Right - Participants */}
                  <div className="w-2/5 h-[250px] flex flex-col gap-3">
                    {/* Collaborators */}
                    <div className="flex-1 bg-violet-50 rounded-xl p-3 overflow-auto border border-violet-200 shadow-inner">
                      <h4 className="font-semibold text-violet-700 mb-2">Collaborators</h4>
                      {topThree[safeIndex]?.participants?.interviewers?.length > 0 ? (
                        <ul className="space-y-2">
                          {topThree[safeIndex].participants.interviewers.map((p, i) => (
                            <li
                              key={i}
                              className="text-sm bg-white px-2 py-1 rounded-md border border-violet-200 shadow-sm flex justify-between hover:bg-violet-100"
                            >
                              {p.name || "Unknown"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-violet-400">No collaborators yet</p>
                      )}
                    </div>

                    {/* Candidates */}
                    <div className="flex-1 bg-indigo-50 rounded-xl p-3 overflow-auto border border-indigo-200 shadow-inner">
                      <h4 className="font-semibold text-indigo-700 mb-2">Candidates</h4>
                      {topThree[safeIndex]?.participants?.candidates?.length > 0 ? (
                        <ul className="space-y-2">
                          {topThree[safeIndex].participants.candidates.map((p, i) => (
                            <li
                              key={i}
                              className="text-sm bg-white px-2 py-1 rounded-md border border-indigo-200 shadow-sm flex justify-between hover:bg-indigo-100"
                            >
                              {p.name || "Unknown"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-indigo-400">No candidates yet</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer - Actions */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-slate-600">
                    Questions: {topThree[safeIndex]?.questions?.length || 0} | Participants: {topThree[safeIndex]?.participants?.length || 0}
                  </span>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Dots */}
        {topThree.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {topThree.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === safeIndex ? "bg-indigo-600 shadow-md" : "bg-indigo-200"
                  }`}
              ></div>
            ))}
          </div>
        )}
      </motion.div>



    </section>
  );
}
