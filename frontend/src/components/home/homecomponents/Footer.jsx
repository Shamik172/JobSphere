import React from "react";


export default function Footer() {
    return (
        <footer className="mt-12 border-t border-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <div className="font-semibold">JobSphere</div>
                    <div className="mt-2 text-sm text-slate-600">Modern interviews. Better hires.</div>
                </div>
                <div className="flex gap-8 text-sm text-slate-600">
                    <div>
                        <div className="font-medium">Product</div>
                        <div className="mt-2 space-y-1">
                            <a className="block">Features</a>
                            <a className="block">Demo</a>
                            <a className="block">Roadmap</a>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Company</div>
                        <div className="mt-2 space-y-1">
                            <a className="block">About</a>
                            <a className="block">Careers</a>
                            <a className="block">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}