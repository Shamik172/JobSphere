import React from "react";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="rounded-md bg-indigo-600 text-white px-3 py-2 font-semibold">
          JobSphere
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
          <a href="#features" className="hover:text-indigo-600">
            Features
          </a>
          <a href="#demo" className="hover:text-indigo-600">
            Demo
          </a>
          <a href="#pricing" className="hover:text-indigo-600">
            Pricing
          </a>
          <a href="#customers" className="hover:text-indigo-600">
            Customers
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <a className="hidden md:inline-block text-sm" href="/login/candidate">
          Login
        </a>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow"
        >
          Get started <ArrowRight size={16} />
        </a>
      </div>
    </header>
  );
}
