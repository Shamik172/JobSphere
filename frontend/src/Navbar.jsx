import React, { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const hiddenRoutes = ["/", "/login", "/signup"];
  const hideNavbar = hiddenRoutes.includes(location.pathname);
  if (hideNavbar) return null;

  // Function to set active link style
  const linkClass = (path) =>
    location.pathname === path
      ? "text-indigo-600 font-semibold"
      : "hover:text-indigo-600";

  // Function to generate nav links based on role
  const navLinks = () => {
    if (!user) return null;

    if (user.role === "interviewer") {
      return (
        <>
          <Link to="/create_assessment" className={linkClass("/create_assessment")}>
            Create Assessment
          </Link>
          <Link
            to="/assessment/upcoming_assessment"
            className={linkClass("/assessment/upcoming_assessment")}
          >
            Upcoming Assessments
          </Link>
          <Link to="/profile" className={linkClass("/profile")}>
            Interview Profile
          </Link>
        </>
      );
    }

    if (user.role === "candidate") {
      return (
        <>
          <Link to="/candidateProfile" className={linkClass("/candidateProfile")}>
            Candidate Profile
          </Link>
          <Link
            to="/candidate/my_assessment"
            className={linkClass("/candidate/my_assessment")}
          >
            My Assessments
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left section: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="rounded-md bg-indigo-600 text-white px-3 py-2 font-semibold text-lg hover:bg-indigo-700 transition"
          >
            JobSphere
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
            {navLinks()}
          </nav>
        </div>

        {/* Right section: Login / Logout / Mobile menu */}
        <div className="flex items-center gap-4">
          {!loading &&
            (isLoggedIn ? (
              <button
                onClick={handleLogout}
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
            ))}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-700 hover:text-indigo-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-3">
          {navLinks()}
          {!loading && !isLoggedIn && (
            <>
              <Link to="/login" className="hover:text-indigo-600">
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
        </nav>
      )}
    </header>
  );
}
