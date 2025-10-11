import React from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout, loading } = useAuth();
  const navigate = useNavigate(); // ✅ useNavigate hook

  const handleLogout = async () => {
    await logout();      // call logout from context
    navigate("/");       // redirect to home page
  };

  return (
    <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between bg-white shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 text-white px-3 py-2 font-semibold text-lg hover:bg-indigo-700 transition"
        >
          JobSphere
        </Link>

        {isLoggedIn && (
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
            <Link to="/create_assessment" className="hover:text-indigo-600">
              Create Assessment
            </Link>
            <Link
              to="/assessment/upcoming_assessment"
              className="hover:text-indigo-600"
            >
              Upcoming Assessments
            </Link>
          </nav>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {!loading && (
          <>
            {isLoggedIn ? (
              <button
                onClick={handleLogout} // ✅ use handleLogout here
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-red-600 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  className="hidden md:inline-block text-sm text-slate-700 hover:text-indigo-600"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700 transition"
                >
                  Get started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
