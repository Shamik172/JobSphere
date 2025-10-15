import React from "react";
import { motion } from "framer-motion";
import image1 from "../../pic/image1.jpg";
import image2 from "../../pic/image2.jpg";
import image3 from "../../pic/image3.jpg";

const showcaseData = [
  {
    id: 1,
    image: image1,
    title: "Create Assessments Easily",
    description:
      "Build coding assessments in just a few clicks — without any complexity. Add custom problems, multiple rounds, and different difficulty levels. Invite candidates and interviewers instantly via email, and manage everything in one intuitive dashboard. Collaborate in real-time and streamline your hiring process from start to finish.",
    reverse: false,
  },
  {
    id: 2,
    image: image2,
    title: "Real-time Coding & Video Interview",
    description:
      "Experience seamless real-time interviews with integrated coding and video chat support. Conduct technical discussions while observing candidates’ coding logic and communication skills simultaneously. You can execute, debug, and evaluate code on the go — all within a secure, synchronized environment that keeps both interviewer and candidate connected smoothly.",
    reverse: true,
  },
  {
    id: 3,
    image: image3,
    title: "Track Performance & Generate Reports",
    description:
      "Evaluate every candidate objectively with instant performance analytics and detailed reports. Track execution time, memory usage, code accuracy, and test case coverage for every submission. Compare candidates across multiple metrics, export results easily, and make data-driven hiring decisions faster and smarter than ever before.",
    reverse: false,
  },
];

export default function ShowcaseSection() {
  return (
    <section className="w-full bg-gradient-to-b from-blue-50 via-white to-blue-50 py-20 space-y-24">
      {/* === Section Header === */}
      <div className="text-center max-w-3xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-blue-800 mb-4"
        >
          Empower Your Hiring Process
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-lg text-gray-700 leading-relaxed"
        >
          From creating coding challenges to conducting real-time interviews and
          analyzing performance — our platform simplifies every step of your
          technical hiring journey.
        </motion.p>
      </div>

      {/* === Showcase Blocks === */}
      {showcaseData.map((item, index) => (
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
            <h2 className="text-3xl font-semibold text-blue-900 mb-4">
              {item.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {item.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full shadow-md transition"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      ))}
    </section>
  );
}
