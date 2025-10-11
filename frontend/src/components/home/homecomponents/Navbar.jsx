import React from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext"; // adjust path

export default function Navbar() {
  const { isLoggedIn, logout, loading } = useAuth();

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
        {!loading && (
          <>
            {isLoggedIn ? (
              // ✅ Logout Button
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              // ✅ Show Login + Signup when not logged in
              <>
                <a className="hidden md:inline-block text-sm" href="/login">
                  Login
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700"
                >
                  Get started <ArrowRight size={16} />
                </a>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
