import React, { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import JobSphereEcosystemBackground from "../canvas/JobSphereEcosystemBackground.jsx";
import "../../styles/theme.css";

/* Wraps every app page (and its loader) so theme, background and fonts are
   always present. Pass canvas={false} to turn the animated background off. */
export default function PageShell({ children, canvas = true }) {
  const { isDark } = useTheme();

  // keep <html> in sync so the navbar, modals and body background follow the toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className={`lp-page relative min-h-screen font-sans selection:bg-emerald-500 selection:text-white ${
        isDark ? "dark" : ""
      }`}
    >
      {canvas && <JobSphereEcosystemBackground isDark={isDark} subtle />}
      <div className="lp-atmosphere" />
      {children}
    </div>
  );
}