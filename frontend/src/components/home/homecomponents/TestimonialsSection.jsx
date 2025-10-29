import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
    const testimonials = [
        { name: "Rajat S.", role: "Engineering Manager", company: "NovaCorp", quote: "JobSphere cut interview time by 40% and standardized scoring.", rating: 5 },
        { name: "Maya P.", role: "Talent Lead", company: "ScaleUp", quote: "Live playback helps us calibrate hiring with precision.", rating: 4 },
        { name: "Anika R.", role: "CTO", company: "ByteSoft", quote: "Integrations and analytics made onboarding easy.", rating: 5 },
        { name: "Vikram K.", role: "HR Manager", company: "TechSolutions", quote: "Candidate evaluation has never been easier.", rating: 4 },
        { name: "Sara L.", role: "Recruiter", company: "InnovateX", quote: "Automated scoring saves us so much time.", rating: 5 },
        { name: "Dev P.", role: "Product Lead", company: "NextGen", quote: "The analytics dashboard helps us make faster decisions.", rating: 4 },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const prevIndex = (current - 1 + testimonials.length) % testimonials.length;
    const nextIndex = (current + 1) % testimonials.length;

    const peekOffset = 220;

    const renderStars = (count) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>★</span>
            );
        }
        return stars;
    };

    return (
        <section
            id="customers"
            className="py-16 relative bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50"
            style={{
                boxShadow: '0 0 80px 10px rgba(59, 130, 246, 0.15)',
                borderRadius: '2rem',
            }}
        >
            <div className="max-w-6xl mx-auto text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-800">Trusted by hiring teams</h3>
                <p className="mt-2 text-gray-600">See how JobSphere speeds up hiring cycles.</p>
            </div>

            <div className="max-w-6xl mx-auto relative flex justify-center items-center overflow-hidden">
                {/* Left peek */}
                <motion.div
                    key={prevIndex}
                    initial={{ opacity: 0.4, scale: 0.85, x: -peekOffset }}
                    animate={{ opacity: 0.5, scale: 0.85, x: -peekOffset }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute z-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 rounded-3xl shadow-md p-4 w-[500px] min-h-[280px] flex flex-col justify-center items-center"
                >
                    <p className="text-indigo-500 italic text-sm text-center">{`“${testimonials[prevIndex].quote}”`}</p>
                    <div className="font-semibold text-indigo-500 mt-2">{testimonials[prevIndex].name}</div>
                    <div className="mt-1">{renderStars(testimonials[prevIndex].rating)}</div>
                </motion.div>

                {/* Center card */}
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 0.95, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="z-10 bg-white rounded-3xl shadow-lg p-8 min-h-[280px] w-[520px] flex flex-col md:flex-row items-center justify-between border border-indigo-50"
                >
                    <div className="flex-1 text-left pr-6">
                        <p className="text-gray-700 italic text-lg md:text-xl">{`“${testimonials[current].quote}”`}</p>
                        <div className="mt-2">{renderStars(testimonials[current].rating)}</div>
                    </div>
                    <div className="flex-1 text-right pl-6 mt-4 md:mt-0">
                        <div className="font-semibold text-indigo-600 text-lg md:text-xl">{testimonials[current].name}</div>
                        <div className="text-sm md:text-base text-gray-500">{testimonials[current].role} • {testimonials[current].company}</div>
                    </div>
                </motion.div>

                {/* Right peek */}
                <motion.div
                    key={nextIndex}
                    initial={{ opacity: 0.4, scale: 0.85, x: peekOffset }}
                    animate={{ opacity: 0.5, scale: 0.85, x: peekOffset }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute z-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 rounded-3xl shadow-md p-4 w-[500px] min-h-[280px] flex flex-col justify-center items-center"
                >
                    <p className="text-indigo-500 italic text-sm text-center">{`“${testimonials[nextIndex].quote}”`}</p>
                    <div className="font-semibold text-indigo-500 mt-2">{testimonials[nextIndex].name}</div>
                    <div className="mt-1">{renderStars(testimonials[nextIndex].rating)}</div>
                </motion.div>
            </div>
        </section>
    );
}
