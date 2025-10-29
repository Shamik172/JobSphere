import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Laptop2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function CandidateHeroSection() {
  const [questions, setQuestions] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch 5 random questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/random`,
          { withCredentials: true }
        );
        setQuestions(res.data.data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16">
      {/* Left side - heading and text */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold leading-tight"
        >
          Ace your next interview with{" "}
          <span className="text-indigo-600">real-time coding practice</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-base text-slate-600 max-w-xl"
        >
          Prepare confidently with interactive mock interviews — featuring live
          code editor, video chat, and instant feedback.
        </motion.p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/candidate/my_assessment"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:opacity-95"
          >
            My Assessment <ArrowRight size={16} />
          </Link>

          <Link
            to="/browse_questions"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-5 py-3 text-sm font-medium hover:bg-slate-50"
          >
            Explore Questions
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-50 p-2">
              <Code2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold">500+ problems</div>
              <div className="text-xs">for real interview prep</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-50 p-2">
              <Laptop2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold">Live Mock Rooms</div>
              <div className="text-xs">practice with peers or AI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Practice Questions */}
      <motion.div className="relative mx-auto w-full max-w-2xl">
        <div className="rounded-2xl shadow-2xl overflow-hidden border border-slate-100 bg-white p-5">
          <h2 className="text-lg font-semibold mb-4">🧩 Practice Questions</h2>
          {questions.length === 0 ? (
            <p className="text-sm text-slate-500">Loading questions...</p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li
                  key={q._id}
                  className="flex justify-between items-center border p-3 rounded-lg hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-700">{q.title}</span>
                  <button
                    onClick={() =>
                      navigate(`/candidatePracticesQuestion/${q._id}`)
                    }
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Practice
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </section>
  );
}
