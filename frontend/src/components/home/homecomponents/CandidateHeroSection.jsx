import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Laptop2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CandidateHeroSection() {
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
          Prepare confidently with interactive mock interviews — featuring live code editor, video chat, and instant feedback.
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

      {/* Right side - mock interview preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-2xl"
      >
        <div className="rounded-2xl shadow-2xl overflow-hidden border border-slate-100 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-400" />
              <div>
                <div className="font-semibold">Mock Room — DSA Practice</div>
                <div className="text-xs text-slate-500">Room ID: DS-1457</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Practicing
              </span>
              <span>00:08:26</span>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-0">
            {/* Participants */}
            <div className="col-span-1 md:col-span-1 p-3 border-r border-slate-100 bg-slate-50">
              <div className="text-xs font-medium text-slate-600">
                Participants
              </div>
              <ul className="mt-3 space-y-3">
                <li className="text-sm">You</li>
                <li className="text-sm">AI Interviewer</li>
              </ul>
            </div>

            {/* Code editor preview */}
            <div className="col-span-2 md:col-span-3 p-3">
              <div className="w-full h-44 bg-slate-900 rounded-md text-white p-3 font-mono text-sm overflow-auto">
                {
                  `// DSA Challenge: Reverse a Linked List
function reverseList(head) {
  let prev = null;
  let current = head;
  while (current) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`
                }
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold">
                  Run Code
                </button>
                <button className="px-3 py-2 rounded-md border border-slate-200 text-sm">
                  Get Hint
                </button>
                <button className="px-3 py-2 rounded-md border border-slate-200 text-sm">
                  View Solution
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Example mock coding room — collaborative code editor, participants,
          and practice tools in one place.
        </div>
      </motion.div>
    </section>
  );
}
