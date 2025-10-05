import React from "react";


export default function PricingSection() {
    const plans = [
        { title: "Starter", price: "Free", bullets: ["2 seats", "50 interviews/mo", "Basic analytics"] },
        { title: "Professional", price: "$99/mo", bullets: ["10 seats", "Unlimited interviews", "Advanced scorecards"], featured: true },
        { title: "Enterprise", price: "Custom", bullets: ["SSO & SAML", "Dedicated support", "Custom integrations"] }
    ];


    return (
        <section id="pricing" className="py-12">
            <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold">Simple pricing</h3>
                <p className="mt-2 text-slate-600">From startups to enterprise teams — scale easily.</p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((p) => <PricingCard key={p.title} {...p} />)}
            </div>
        </section>
    );
}


function PricingCard({ title, price, bullets, featured }) {
    return (
        <div className={`${featured ? "scale-105 border-indigo-200 bg-indigo-50" : "bg-white"} rounded-xl border p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{title}</div>
                {featured && <div className="text-xs text-indigo-700 font-semibold">Most popular</div>}
            </div>
            <div className="mt-4 text-2xl font-bold">{price}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {bullets.map((b) => <li key={b}>• {b}</li>)}
            </ul>
            <a className={`mt-6 inline-block px-4 py-2 rounded-md ${featured ? "bg-indigo-700 text-white" : "border border-slate-200"}`}>{featured ? "Start trial" : "Choose"}</a>
        </div>
    );
}