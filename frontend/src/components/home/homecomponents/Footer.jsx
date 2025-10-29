import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaStar } from "react-icons/fa";

export default function Footer() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const socialIcons = [
    { icon: <FaFacebookF />, link: "#" },
    { icon: <FaTwitter />, link: "#" },
    { icon: <FaLinkedinIn />, link: "#" },
    { icon: <FaInstagram />, link: "#" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim() || rating === 0) return;
    console.log("Feedback submitted:", { feedback, rating });
    setSubmitted(true);
    setFeedback("");
    setRating(0);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer className="w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 border-t border-indigo-200 py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col md:flex-row md:flex-wrap md:justify-between gap-10">

        {/* Brand */}
        <div className="flex-1 min-w-[200px] md:flex-[1.5]">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            JobSphere
          </h2>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Empowering smarter interviews and better hiring decisions with AI-powered insights.
          </p>
        </div>

        {/* Product */}
        <div className="flex-1 min-w-[120px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Product</h3>
          <ul className="space-y-2">
            {["Features", "Demo", "Roadmap"].map((item, i) => (
              <li key={i}>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="flex-1 min-w-[120px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Company</h3>
          <ul className="space-y-2">
            {["About", "Careers", "Contact"].map((item, i) => (
              <li key={i}>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow Us */}
        <div className="flex-1 min-w-[120px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Follow us</h3>
          <div className="flex gap-3 mt-3">
            {socialIcons.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-600 hover:text-indigo-600 transition-colors text-2xl sm:text-3xl"
              >
                {item.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Feedback / Review */}
        <div className="flex-2 min-w-[300px] md:flex-[2]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Feedback</h3>
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-3xl shadow-md p-6 space-y-4 hover:shadow-lg transition-all"
          >
            {/* Star rating */}
            <div className="flex justify-start gap-1 mb-2">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(rating)}
                    className="text-2xl focus:outline-none"
                  >
                    <FaStar
                      className={`${
                        starValue <= (hover || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none h-32 text-gray-700 placeholder-gray-400"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              Submit Feedback
            </motion.button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-center text-sm font-medium mt-1"
              >
                🎉 Thanks for your feedback!
              </motion.p>
            )}
          </form>
        </div>

      </div>

      {/* Bottom copyright */}
      <div className="mt-16 text-center text-gray-500 text-sm sm:text-base border-t border-gray-200 pt-6">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-indigo-600">JobSphere</span>. All rights reserved.
      </div>
    </footer>
  );
}
