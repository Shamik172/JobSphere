import React from "react";
import { motion } from "framer-motion";
import image1 from "../../pic/image1.jpg";
import image2 from "../../pic/image2.jpg";
import image3 from "../../pic/image3.jpg";

const candidateShowcaseData = [
  {
    id: 1,
    image: image1,
    title: "Practice Real Coding Interviews",
    description:
      "Simulate live technical interviews with real-time code editors and instant feedback. Practice DSA, system design, and role-specific problems in a realistic environment designed to help you perform confidently during actual interviews.",
    reverse: false,
  },
  {
    id: 2,
    image: image2,
    title: "Collaborate and Learn Together",
    description:
      "Invite friends or mentors to join your session for mock interviews or pair programming. Discuss logic, learn best practices, and improve your communication and coding clarity — just like a real interview panel.",
    reverse: true,
  },
  {
    id: 3,
    image: image3,
    title: "Track Your Progress & Improve",
    description:
      "Get detailed analytics for every practice — execution time, accuracy, code quality, and memory usage. Identify weak areas and get personalized insights to continuously improve your interview readiness.",
    reverse: false,
  },
];

export default function CandidateShowcaseSection() {
  return (
    <section className="w-full bg-gradient-to-b from-indigo-50 via-white to-indigo-50 py-20 space-y-24">
      {/* === Section Header === */}
      <div className="text-center max-w-3xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4"
        >
          Prepare Smarter, Perform Better
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-lg text-gray-700 leading-relaxed"
        >
          Get hands-on experience with real interview setups, practice problems,
          collaborate live, and track your improvement — everything you need to
          become interview-ready.
        </motion.p>
      </div>

      {/* === Showcase Blocks === */}
      {candidateShowcaseData.map((item, index) => (
        <motion.div
          key={item.id}
          className={`flex flex-col lg:flex-row items-center justify-between gap-10 max-w-7xl mx-auto px-6 ${
            item.reverse ? "lg:flex-row-reverse" : ""
          }`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          {/* Image Section */}
          <motion.div
            className="w-full lg:w-1/2"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </motion.div>

          {/* Text Section */}
          <motion.div
            className="w-full lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, x: item.reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-indigo-900 mb-4">
              {item.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {item.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-full shadow-md transition"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      ))}
    </section>
  );
}
