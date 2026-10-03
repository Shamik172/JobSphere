import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import "../../styles/theme.css";
import {
  Terminal,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/login");
  };

  const isInterviewer = user?.role === "interviewer";
  const isCandidate = user?.role === "candidate";

  const assessmentsActive =
    location.pathname.startsWith("/assessments") && location.pathname !== "/create_assessment";
  const createActive =
    location.pathname === "/create_assessment" || location.pathname === "/assessments/create";
  const candidateActive = location.pathname.startsWith("/candidate/my_assessment");

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full px-2.5 pt-2.5 sm:px-6 lg:px-8">
      <div
        className={`lp-glass-nav mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${
          scrolled ? "shadow-2xl shadow-emerald-950/10 dark:shadow-black/70" : ""
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3 sm:px-5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 transition active:scale-95 group">
            <div className="js-btn-primary flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Terminal size={17} strokeWidth={2.5} />
            </div>
            <span className="text-sm sm:text-base font-black tracking-tight text-[var(--lp-text-title)]">
              JobSphere<span className="text-emerald-500 animate-pulse">.</span>
            </span>
          </Link>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden items-center gap-1.5 sm:flex">
            {!isLoggedIn ? (
              <>
                <a href="#platform" className="lp-nav-link">Workspace</a>
                <a href="#features" className="lp-nav-link">Features</a>
                <a href="#roles" className="lp-nav-link">Dual Portals</a>
              </>
            ) : (
              <>
                {isInterviewer && (
                  <>
                    <Link to="/assessments" className={`lp-nav-link ${assessmentsActive ? "is-active" : ""}`}>
                      <LayoutDashboard size={14} /> Assessments
                    </Link>
                    <Link to="/create_assessment" className={`lp-nav-link ${createActive ? "is-active" : ""}`}>
                      <PlusCircle size={14} /> New Round
                    </Link>
                  </>
                )}
                {isCandidate && (
                  <Link to="/candidate/my_assessment" className={`lp-nav-link ${candidateActive ? "is-active" : ""}`}>
                    <CalendarCheck size={14} /> My Assessments
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="lp-icon-btn is-lg !h-8 !w-8 sm:!h-9 sm:!w-9"
            >
              {isDark ? (
                <Sun size={16} strokeWidth={2.4} className="text-amber-400" />
              ) : (
                <Moon size={16} strokeWidth={2.4} className="text-emerald-800" />
              )}
            </button>

            {!isLoggedIn ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="lp-nav-link">Sign In</Link>
                <Link
                  to="/signup"
                  className="js-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95"
                >
                  Get Started <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/profile" className="lp-profile-pill group">
                  <User size={14} className="text-[var(--lp-link)] group-hover:scale-110 transition-transform" />
                  <span className="max-w-[120px] truncate">{user?.name || "Profile"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Sign Out"
                  className="lp-icon-btn is-lg is-danger"
                >
                  <LogOut size={15} strokeWidth={2.4} />
                </button>
              </div>
            )}

            {/* Mobile menu toggle: explicitly hidden on tablet and laptop */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              className="lp-icon-btn is-lg !h-8 !w-8 sm:!hidden md:!hidden lg:!hidden"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown: explicitly hidden on tablet and laptop */}
        {mobileMenuOpen && (
          <div className="border-t border-[var(--lp-nav-border)] p-3.5 sm:hidden">
            <div className="flex flex-col gap-1.5">
              {!isLoggedIn ? (
                <>
                  <a href="#platform" onClick={closeMenu} className="lp-nav-link py-2.5">Workspace Cockpit</a>
                  <a href="#features" onClick={closeMenu} className="lp-nav-link py-2.5">Platform Features</a>
                  <a href="#roles" onClick={closeMenu} className="lp-nav-link py-2.5">Dual Portals</a>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--lp-nav-border)] pt-3">
                    <Link to="/login" className="lp-btn-ghost py-2.5 text-xs">Sign In</Link>
                    <Link to="/signup" className="js-btn-primary flex items-center justify-center rounded-xl py-2.5 text-xs font-bold text-white">
                      Get Started Free
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {isInterviewer && (
                    <>
                      <Link to="/assessments" className={`lp-nav-link py-2.5 ${assessmentsActive ? "is-active" : ""}`}>
                        <LayoutDashboard size={15} /> Assessments
                      </Link>
                      <Link to="/create_assessment" className={`lp-nav-link py-2.5 ${createActive ? "is-active" : ""}`}>
                        <PlusCircle size={15} /> Create Assessment
                      </Link>
                    </>
                  )}
                  {isCandidate && (
                    <Link to="/candidate/my_assessment" className={`lp-nav-link py-2.5 ${candidateActive ? "is-active" : ""}`}>
                      <CalendarCheck size={15} /> My Assessments
                    </Link>
                  )}
                  <Link to="/profile" className="lp-nav-link py-2.5">
                    <User size={15} /> My Profile ({user?.name})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="lp-nav-link py-2.5 text-[var(--lp-danger-text)] justify-start"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}