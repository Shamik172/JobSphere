import React from "react";


export default function DemoSection() {
    return (
        <section id="demo" className="py-12">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-xl font-bold">See JobSphere in action</h3>
                    <p className="mt-3 text-slate-600">Watch how to build question packs, start interviews, and assess candidates effectively.</p>
                    <ol className="mt-6 space-y-4 text-sm text-slate-700">
                        <li><b>1.</b> Create question packs with tags and levels.</li>
                        <li><b>2.</b> Start a live video + code interview instantly.</li>
                        <li><b>3.</b> Evaluate using scorecards and playback.</li>
                    </ol>
                    <a href="#signup" className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold">Start free trial</a>
                </div>
                <div>
                    <div className="rounded-lg border overflow-hidden">
                        <div className="w-full h-56 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center text-white">Demo video</div>
                    </div>
                </div>
            </div>
        </section>
    );
}