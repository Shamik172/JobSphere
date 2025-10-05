import React from "react";


export default function TestimonialsSection() {
    const testimonials = [
        { name: "Rajat S.", role: "Engineering Manager", company: "NovaCorp", quote: "JobSphere cut interview time by 40% and standardized scoring." },
        { name: "Maya P.", role: "Talent Lead", company: "ScaleUp", quote: "Live playback helps us calibrate hiring with precision." },
        { name: "Anika R.", role: "CTO", company: "ByteSoft", quote: "Integrations and analytics made onboarding easy." }
    ];


    return (
        <section id="customers" className="py-12">
            <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold">Trusted by hiring teams</h3>
                <p className="mt-2 text-slate-600">See how JobSphere speeds up hiring cycles.</p>
            </div>
            <div className="mt-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => <Testimonial key={t.name} {...t} />)}
            </div>
        </section>
    );
}


function Testimonial({ name, role, company, quote }) {
    return (
        <div className="rounded-xl border p-6 bg-white shadow-sm">
            <div className="text-sm text-slate-700">“{quote}”</div>
            <div className="mt-4 text-sm font-semibold">{name}</div>
            <div className="text-xs text-slate-500">{role} • {company}</div>
        </div>
    );
}