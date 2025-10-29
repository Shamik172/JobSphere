import React from "react";
import { motion } from "framer-motion";

export default function PricingSection() {
    const plans = [
        { title: "Starter", price: "Free", bullets: ["2 seats", "50 interviews/mo", "Basic analytics"] },
        { title: "Professional", price: "$99/mo", bullets: ["10 seats", "Unlimited interviews", "Advanced scorecards"], featured: true },
        { title: "Enterprise", price: "Custom", bullets: ["SSO & SAML", "Dedicated support", "Custom integrations"] }
    ];

    return (
        <section id="pricing" className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center px-6">
                <h3 className="text-4xl font-bold text-gray-900">Simple & Transparent Pricing</h3>
                <p className="mt-4 text-gray-600 text-lg">From startups to enterprise teams — scale easily with plans that fit your needs.</p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
                {plans.map((p) => (
                    <PricingCard key={p.title} {...p} />
                ))}
            </div>
        </section>
    );
}

function PricingCard({ title, price, bullets, featured }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative flex flex-col justify-between rounded-2xl p-8 shadow-lg transition-all duration-300
                ${featured ? "bg-gradient-to-br from-indigo-400 to-indigo-400 text-white border-2 border-indigo-300" : "bg-white text-gray-700 border border-gray-200"}`}
        >
            {featured && (
                <div className="absolute top-0 -mt-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Most Popular
                </div>
            )}
            <div className="flex flex-col gap-4">
                <div className="text-2xl font-semibold">{title}</div>
                <div className="text-4xl font-bold">{price}</div>
                <ul className={`mt-4 space-y-2 ${featured ? "text-white/90" : "text-gray-600"}`}>
                    {bullets.map((b) => <li key={b}>• {b}</li>)}
                </ul>
            </div>
            <a
                className={`mt-8 inline-block text-center font-medium px-6 py-3 rounded-full shadow-md transition
                    ${featured ? "bg-white text-indigo-600 hover:bg-white/90" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
                {featured ? "Start Free Trial" : "Choose Plan"}
            </a>
        </motion.div>
    );
}
