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
      "Build coding assessments in just a few clicks. Add custom problems, multiple rounds, and different difficulty levels. Invite candidates and interviewers instantly via email, and manage everything in one intuitive dashboard.",
    reverse: false,
    bg: "bg-gradient-to-r from-indigo-50 to-indigo-100",
  },
  {
    id: 2,
    image: image2,
    title: "Real-time Coding & Video Interview",
    description:
      "Conduct seamless real-time interviews with integrated coding and video chat. Observe candidates’ coding logic and communication skills simultaneously, and execute/debug code in a secure environment.",
    reverse: true,
    bg: "bg-gradient-to-r from-purple-50 to-purple-100",
  },
  {
    id: 3,
    image: image3,
    title: "Track Performance & Generate Reports",
    description:
      "Evaluate every candidate objectively with instant performance analytics and detailed reports. Compare candidates across metrics, export results, and make data-driven hiring decisions faster and smarter.",
    reverse: false,
    bg: "bg-gradient-to-r from-teal-50 to-teal-100",
  },
];

export default function ShowcaseSection() {
  return (
    <section className="w-full py-28 space-y-28 bg-gray-50">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4"
        >
          Empower Your Hiring Process
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600 leading-relaxed"
        >
          From creating coding challenges to conducting real-time interviews and
          analyzing performance — our platform simplifies every step of your
          technical hiring journey.
        </motion.p>
      </div>

      {/* Showcase Blocks */}
      {showcaseData.map((item, index) => (
        <motion.div
          key={item.id}
          className={`flex flex-col lg:flex-row items-center justify-between gap-10 max-w-7xl mx-auto px-6 py-12 rounded-3xl shadow-xl ${item.bg} hover:shadow-2xl transition-shadow duration-500 ${
            item.reverse ? "lg:flex-row-reverse" : ""
          }`}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          {/* Image Section */}
          <motion.div
            className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-md"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-auto rounded-2xl object-cover shadow-lg"
            />
          </motion.div>

          {/* Text Section */}
          <motion.div
            className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center"
            initial={{ opacity: 0, x: item.reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-indigo-800 mb-4">
              {item.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {item.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#4F46E5" }}
              whileTap={{ scale: 0.95 }}
              className="self-start bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-full shadow-md transition-all"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      ))}
    </section>
  );
}
