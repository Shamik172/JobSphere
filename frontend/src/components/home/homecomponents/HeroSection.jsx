import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Users } from "lucide-react";

export default function HeroSection() {
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
          Hire smarter with{" "}
          <span className="text-indigo-600">real-time coding interviews</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-base text-slate-600 max-w-xl"
        >
          Conduct collaborative, structured technical interviews with integrated
          video, code editor, and whiteboard — built for fast, fair, and scalable
          hiring.
        </motion.p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:opacity-95"
          >
            Watch Demo <ArrowRight size={16} />
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

      {/* Right side - live interview mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-2xl"
      >
        {/* Mockup: Video call + coding workspace */}
        <div className="rounded-2xl shadow-2xl overflow-hidden border border-slate-100 bg-white">
          {/* Top header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400" />
              <div>
                <div className="font-semibold">
                  Live Interview — Frontend Engineer
                </div>
                <div className="text-xs text-slate-500">Room: JS-2025</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Live
              </span>
              <span>00:12:34</span>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-0">
            {/* Interviewers list */}
            <div className="col-span-1 md:col-span-1 p-3 border-r border-slate-100 bg-slate-50">
              <div className="text-xs font-medium text-slate-600">
                Interviewers
              </div>
              <ul className="mt-3 space-y-3">
                <li className="text-sm">Alex Johnson</li>
                <li className="text-sm">Priya Sharma</li>
                <li className="text-sm">K. Patel</li>
              </ul>
            </div>

            {/* Code editor preview */}
            <div className="col-span-2 md:col-span-3 p-3">
              <div className="w-full h-44 bg-slate-900 rounded-md text-white p-3 font-mono text-sm overflow-auto">
                {
                  `// Candidate code snapshot
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return null;
}`
                }
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-3">
                <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold">
                  Share Question
                </button>
                <button className="px-3 py-2 rounded-md border border-slate-200 text-sm">
                  Open Whiteboard
                </button>
                <button className="px-3 py-2 rounded-md border border-slate-200 text-sm">
                  Export Transcript
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Example live interview workspace — collaborative editor, participants,
          and controls in one place.
        </div>
      </motion.div>
    </section>
  );
}
