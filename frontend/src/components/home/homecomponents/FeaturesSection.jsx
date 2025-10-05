import React from "react";
import { motion } from "framer-motion";
import { Video, Code, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Live video + code",
      icon: <Video size={20} />,
      desc: "Run interviews with low-latency video, synchronized editor, and real-time collaboration."
    },
    {
      title: "Curated question bank",
      icon: <Code size={20} />,
      desc: "Choose role-specific problems with test cases and tags — reusable for your team."
    },
    {
      title: "Analytics & reports",
      icon: <Users size={20} />,
      desc: "Scorecards, playback, and reports that streamline your hiring process."
    }
  ];

  return (
    <section id="features" className="py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold">
          Everything you need for technical interviews
        </h2>
        <p className="mt-2 text-slate-600">
          A single integrated workspace built for fairness, speed, and efficiency.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -6 }}
            className="rounded-xl border border-slate-100 p-6 bg-white shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-indigo-50 text-indigo-600">
              {f.icon}
            </div>
            <h4 className="mt-4 font-semibold">{f.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
