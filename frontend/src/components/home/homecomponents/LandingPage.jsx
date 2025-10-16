import React from "react";
import { motion } from "framer-motion";
import { Users, Code2, Video, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* ===== Hero Section ===== */}
      <section className="text-center py-20 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-slate-800"
        >
          Empowering <span className="text-indigo-600">Coding Interviews</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-5 max-w-2xl mx-auto text-slate-600 text-lg"
        >
          A real-time collaborative platform where Interviewers and Candidates
          connect, code, and communicate — all in one place.
        </motion.p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
          >
            Get Started
          </Link>
          <a
            href="#overview"
            className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* ===== Overview Section ===== */}
      <section id="overview" className="py-16 px-8 md:px-16">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-center text-slate-800"
        >
          What Can You Do On This Platform?
        </motion.h2>

        <p className="text-center text-slate-600 mt-3 mb-10">
          Whether you're hiring or preparing for your next interview — we’ve got
          you covered.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* ===== Interviewer Card ===== */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Briefcase className="text-indigo-600" size={26} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                For Interviewers
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Conduct structured technical interviews with{" "}
              <span className="font-semibold text-indigo-600">
                real-time video calls, code editors, and whiteboards
              </span>
              . Share coding problems, view candidate code live, and evaluate
              effectively — all in one collaborative workspace.
            </p>

            <ul className="mt-4 list-disc list-inside text-slate-600 text-sm space-y-1">
              <li>Live code editor with multiple language support</li>
              <li>Instant code execution and result checking</li>
              <li>Integrated video chat for real-time interaction</li>
              <li>Secure and private interview rooms</li>
            </ul>

            <Link
              to="/create_assessment"
              className="inline-block mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:opacity-90"
            >
              Create Interview Room
            </Link>
          </motion.div>

          {/* ===== Candidate Card ===== */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Code2 className="text-indigo-600" size={26} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                For Candidates
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Practice and perform better in interviews with{" "}
              <span className="font-semibold text-indigo-600">
                live mock rooms, coding challenges, and feedback tools
              </span>
              . Collaborate with mentors or friends to improve your problem-solving skills.
            </p>

            <ul className="mt-4 list-disc list-inside text-slate-600 text-sm space-y-1">
              <li>Access curated DSA & system design problems</li>
              <li>Collaborate in real-time mock sessions</li>
              <li>Track performance and review solutions</li>
              <li>Join practice rooms instantly — no setup needed</li>
            </ul>

            <Link
              to="/join_room"
              className="inline-block mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:opacity-90"
            >
              Join Practice Room
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} JobSphere — Empowering Technical Interviews
      </footer>
    </div>
  );
}
