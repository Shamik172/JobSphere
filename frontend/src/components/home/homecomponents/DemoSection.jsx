import React from "react";
import { motion } from "framer-motion";

export default function DemoSection() {
  return (
    <section className="py-28 bg-indigo-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-12 md:p-16 flex flex-col md:flex-row items-center gap-12"
        >
          {/* Text Section */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl md:text-5xl font-bold text-indigo-800 leading-tight">
              See <span className="text-indigo-600">JobSphere</span> in Action
            </h3>
            <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
              Watch how to create question packs, start interviews, and assess candidates effectively with our intuitive dashboard.
            </p>

            <ol className="mt-8 space-y-4 text-gray-600 text-base md:text-lg list-decimal list-inside">
              <li>
                <span className="font-semibold text-indigo-600">Create question packs:</span> Add tags and difficulty levels easily.
              </li>
              <li>
                <span className="font-semibold text-indigo-600">Start live interviews:</span> Instant coding + video sessions.
              </li>
              <li>
                <span className="font-semibold text-indigo-600">Evaluate candidates:</span> Use scorecards, analytics, and playback.
              </li>
            </ol>

            <a
              href="/signup"
              className="mt-10 inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              Start Free Trial
            </a>
          </div>

          {/* Video / Demo Section */}
          <div className="flex-1">
            <div className="relative rounded-2xl shadow-xl overflow-hidden group">
              <div className="w-full h-80 md:h-96 bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl md:text-3xl font-bold rounded-2xl">
                Demo Video
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 4l12 6-12 6V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
