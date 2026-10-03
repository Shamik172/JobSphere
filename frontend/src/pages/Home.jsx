import React, { useState } from "react";
import { Link } from "react-router-dom";
import JobSphereEcosystemBackground from "../components/canvas/JobSphereEcosystemBackground.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../components/landing/landingStyles.css";
import {
    ArrowRight,
    Bot,
    Briefcase,
    CheckCircle2,
    Code2,
    Database,
    Network,
    PenTool,
    Play,
    Server,
    ShieldCheck,
    UserCheck,
    Users,
    Video,
} from "lucide-react";

export default function Home() {
    const { isDark } = useTheme();
    const { isLoggedIn, user } = useAuth();
    const [heroTab, setHeroTab] = useState("editor");

    return (
        <div className={`relative min-h-screen font-sans selection:bg-emerald-500 selection:text-white ${isDark ? "dark" : ""}`}>
            {/* Background Interactive Mesh Canvas */}
            <JobSphereEcosystemBackground isDark={isDark} />

            {/* Dynamic Theme Gradient */}
            <div
                className="fixed inset-0 -z-20 transition-colors duration-700 pointer-events-none"
                style={{ background: "var(--lp-bg-grad)" }}
            />

            <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-20 sm:pb-32">
                {/* ================= HERO SECTION ================= */}
                <section id="platform" className="grid items-center gap-8 lg:grid-cols-[1.1fr_1.1fr] lg:gap-10 pt-2 sm:pt-6">

                    {/* Left Column: Core Value Proposition */}
                    <div className="flex flex-col items-start text-left">
                        <div
                            className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black tracking-wide sm:text-xs"
                            style={{
                                background: "var(--lp-pill-bg)",
                                border: "1px solid var(--lp-pill-border)",
                                color: "var(--lp-pill-text)",
                            }}
                        >
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="truncate">Technical Interview & Assessment Workspace</span>
                        </div>

                        <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--lp-text-title)] sm:text-5xl lg:text-[52px] leading-[1.12]">
                            One unified cockpit. <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                                Flawless technical interviews.
                            </span>
                        </h1>

                        <p className="mt-3.5 max-w-xl text-xs sm:text-sm lg:text-base leading-relaxed text-[var(--lp-text-body)] font-semibold">
                            Eliminate third-party tool fragmentation. JobSphere combines low-latency Monaco code execution, synchronized Excalidraw system design, and browser-native HD WebRTC into an end-to-end interview workspace.
                        </p>

                        {/* CTAs */}
                        <div className="mt-6 sm:mt-8 flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                            {!isLoggedIn ? (
                                <>
                                    <Link
                                        to="/signup"
                                        style={{ background: "var(--lp-accent)", boxShadow: "var(--lp-accent-shadow)" }}
                                        className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95 active:scale-95"
                                    >
                                        <span>Start Free Assessment Round</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="lp-glass-card flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-[var(--lp-text-title)] transition hover:border-emerald-500/40 active:scale-95"
                                    >
                                        Candidate Sign In
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to={user?.role === "interviewer" ? "/assessments" : "/candidate/my_assessment"}
                                    style={{ background: "var(--lp-accent)", boxShadow: "var(--lp-accent-shadow)" }}
                                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-95 active:scale-95"
                                >
                                    <span>Enter Workspace Dashboard</span>
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>

                        {/* Micro Stats Bar */}
                        <div className="mt-8 sm:mt-10 grid w-full grid-cols-3 gap-2 border-t border-[var(--lp-pill-border)] pt-5 text-center sm:text-left">
                            <div>
                                <p className="text-base sm:text-xl font-black text-[var(--lp-text-title)]">&lt; 15ms</p>
                                <p className="text-[10px] sm:text-[11px] font-bold text-[var(--lp-text-muted)]">Cursor Latency</p>
                            </div>
                            <div>
                                <p className="text-base sm:text-xl font-black text-[var(--lp-text-title)]">100%</p>
                                <p className="text-[10px] sm:text-[11px] font-bold text-[var(--lp-text-muted)]">Browser Native</p>
                            </div>
                            <div>
                                <p className="text-base sm:text-xl font-black text-[var(--lp-text-title)]">Gemini 2.5</p>
                                <p className="text-[10px] sm:text-[11px] font-bold text-[var(--lp-text-muted)]">Edge Cases</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Room Simulation Preview */}
                    <div className="lp-glass-card relative min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl">
                        {/* Top Bar of Mockup */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--lp-pill-border)] pb-2.5 sm:pb-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHeroTab("editor")}
                                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition ${
                                        heroTab === "editor"
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "text-[var(--lp-text-body)] hover:text-emerald-600 dark:hover:text-emerald-400"
                                    }`}
                                >
                                    <Code2 size={13} />
                                    <span>Monaco</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHeroTab("whiteboard")}
                                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition ${
                                        heroTab === "whiteboard"
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "text-[var(--lp-text-body)] hover:text-emerald-600 dark:hover:text-emerald-400"
                                    }`}
                                >
                                    <PenTool size={13} />
                                    <span>Excalidraw</span>
                                </button>
                            </div>

                            {/* Status indicators */}
                            <div className="flex items-center gap-1.5">
                                <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-black tracking-wide
                                bg-emerald-500/15 border border-emerald-600/40 text-emerald-950 dark:bg-emerald-400/10 dark:border-emerald-400/30 dark:text-emerald-300"
                                >
                                    <Video size={12} strokeWidth={2.5} className="text-emerald-700 dark:text-emerald-400" />
                                    <span>1080p</span>
                                </span>

                                <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-black tracking-wide
                                bg-slate-200/90 border border-slate-400/50 text-slate-900 dark:bg-white/10 dark:border-white/20 dark:text-slate-100"
                                >
                                    <Users size={12} strokeWidth={2.5} className="text-slate-700 dark:text-slate-300" />
                                    <span>2 In Call</span>
                                </span>
                            </div>
                        </div>

                        {/* TAB 1: Live Monaco Editor */}
                        {heroTab === "editor" ? (
                            <div className="mt-2.5 sm:mt-3 overflow-x-auto rounded-xl sm:rounded-2xl bg-slate-950 p-3 sm:p-4 font-mono text-[11px] sm:text-xs shadow-2xl border border-slate-800">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] sm:text-[11px] text-slate-400">
                                    <span className="text-slate-300 font-bold truncate">solution.cpp (C++20)</span>
                                    <span className="text-emerald-400 flex shrink-0 items-center gap-1 font-bold">
                                        <Play size={10} fill="currentColor" /> 0ms
                                    </span>
                                </div>
                                <div className="mt-2.5 space-y-1 leading-relaxed text-slate-200 whitespace-nowrap">
                                    <p><span className="text-purple-400">#include</span> <span className="text-emerald-300">&lt;iostream&gt;</span></p>
                                    <p><span className="text-purple-400">#include</span> <span className="text-emerald-300">&lt;vector&gt;</span></p>
                                    <p className="pt-1 text-slate-500">// Synchronized multi-cursor candidate input</p>
                                    <p><span className="text-blue-400">int</span> <span className="text-yellow-300">findOptimalPath</span>(<span className="text-blue-400">const</span> std::vector&lt;<span className="text-blue-400">int</span>&gt;&amp; network) &#123;</p>
                                    <p className="pl-3 sm:pl-4 text-slate-500">// Edge cases generated via Gemini API</p>
                                    <p className="pl-3 sm:pl-4"><span className="text-purple-400">return</span> network.empty() ? -1 : network[0];</p>
                                    <p>&#125;</p>
                                </div>
                            </div>
                        ) : (
                            /* TAB 2: Excalidraw Canvas Mockup */
                            <div
                                className="mt-2.5 sm:mt-3 flex h-[190px] sm:h-[210px] flex-col items-center justify-center rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner relative overflow-hidden"
                                style={{
                                    background: "var(--lp-canvas-preview-bg)",
                                    border: "1.5px solid var(--lp-canvas-preview-border)",
                                }}
                            >
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-20"
                                    style={{
                                        backgroundImage: isDark
                                            ? "radial-gradient(#34D399 1px, transparent 1px)"
                                            : "radial-gradient(#059669 1px, transparent 1px)",
                                        backgroundSize: "16px 16px",
                                    }}
                                />

                                <div className="relative z-10 flex max-w-full items-center gap-1.5 sm:gap-4 overflow-x-auto px-1">
                                    {/* Node 1: Gateway */}
                                    <div
                                        className="flex flex-col items-center gap-1 rounded-xl p-2 sm:p-2.5 shadow-md shrink-0"
                                        style={{
                                            background: "var(--lp-node-bg)",
                                            border: "2px solid var(--lp-node-border)",
                                            color: "var(--lp-node-text)",
                                        }}
                                    >
                                        <Network size={14} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-[10px] sm:text-[11px] font-black">API Gateway</span>
                                    </div>

                                    <div className="h-0.5 w-4 sm:w-6 bg-emerald-500 relative flex items-center justify-center shrink-0">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    </div>

                                    {/* Node 2: Cache */}
                                    <div
                                        className="flex flex-col items-center gap-1 rounded-xl p-2 sm:p-2.5 shadow-md shrink-0"
                                        style={{
                                            background: "var(--lp-node-bg)",
                                            border: "2px solid #0D9488",
                                            color: "var(--lp-node-text)",
                                        }}
                                    >
                                        <Server size={14} className="text-teal-600 dark:text-teal-400" />
                                        <span className="text-[10px] sm:text-[11px] font-black">Redis Cache</span>
                                    </div>

                                    <div className="h-0.5 w-4 sm:w-6 bg-teal-500 shrink-0" />

                                    {/* Node 3: DB Cluster */}
                                    <div
                                        className="flex flex-col items-center gap-1 rounded-xl p-2 sm:p-2.5 shadow-md shrink-0"
                                        style={{
                                            background: "var(--lp-node-bg)",
                                            border: "2px solid #0284C7",
                                            color: "var(--lp-node-text)",
                                        }}
                                    >
                                        <Database size={14} className="text-cyan-600 dark:text-cyan-400" />
                                        <span className="text-[10px] sm:text-[11px] font-black">DB Shards</span>
                                    </div>
                                </div>

                                <p className="relative z-10 mt-4 text-[10px] sm:text-[11px] font-black tracking-wide uppercase text-emerald-800 dark:text-emerald-300 text-center">
                                    Infinite Collaborative Excalidraw Engine
                                </p>
                            </div>
                        )}

                        {/* Bottom Status Ribbon */}
                        <div
                            className="mt-2.5 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl p-2 sm:p-2.5 text-[11px] sm:text-xs font-bold"
                            style={{
                                background: "var(--lp-pill-bg)",
                                color: "var(--lp-pill-text)",
                                border: "1px solid var(--lp-pill-border)",
                            }}
                        >
                            <span className="flex items-center gap-1.5 truncate">
                                <Bot size={14} className="shrink-0" /> AtCoder Problem Ingested
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-semibold opacity-90 truncate">
                                Suite: 12 Hidden Edge Cases Passed
                            </span>
                        </div>
                    </div>
                </section>

                {/* ================= 3 PRIMARY PILLARS (BENTO) ================= */}
                <section id="features" className="mt-20 sm:mt-28">
                    <div className="text-center px-1">
                        <span
                            className="inline-block rounded-full px-3 py-1 text-[11px] sm:text-xs font-black tracking-wider uppercase"
                            style={{
                                background: "var(--lp-pill-bg)",
                                color: "var(--lp-pill-text)",
                                border: "1px solid var(--lp-pill-border)",
                            }}
                        >
                            Technical Architecture
                        </span>
                        <h2 className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--lp-text-title)]">
                            Engineered for Real Engineering Assessments
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm font-semibold text-[var(--lp-text-body)]">
                            Everything required to orchestrate high-stakes rounds from problem formulation to candidate evaluation.
                        </p>
                    </div>

                    <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
                        {/* Pillar 1 */}
                        <div className="lp-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <Video size={20} strokeWidth={2.4} />
                            </div>
                            <h3 className="mt-3.5 text-base sm:text-lg font-black text-[var(--lp-text-title)]">
                                Live Collaborative Room
                            </h3>
                            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[var(--lp-text-body)] font-semibold">
                                Integrated WebRTC peer-to-peer video, Monaco multi-cursor synchronized IDE, and Excalidraw whiteboard without leaving your browser tab.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="lp-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-500/20 text-teal-700 dark:text-teal-400">
                                <Bot size={20} strokeWidth={2.4} />
                            </div>
                            <h3 className="mt-3.5 text-base sm:text-lg font-black text-[var(--lp-text-title)]">
                                AI Problem Ingestion
                            </h3>
                            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[var(--lp-text-body)] font-semibold">
                                Scrape live algorithmic problems directly from AtCoder. Gemini AI automatically synthesizes edge cases, sample constraints, and evaluation testbeds.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="lp-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400">
                                <ShieldCheck size={20} strokeWidth={2.4} />
                            </div>
                            <h3 className="mt-3.5 text-base sm:text-lg font-black text-[var(--lp-text-title)]">
                                Session Control & Security
                            </h3>
                            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[var(--lp-text-body)] font-semibold">
                                Token-gated candidate entry, host-controlled assessment termination, and isolated socket namespaces ensuring zero crosstalk and absolute privacy.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================= DUAL PORTALS COMPARISON ================= */}
                <section id="roles" className="mt-20 sm:mt-28">
                    <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                        {/* Interviewer Hub */}
                        <div className="lp-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-l-4 border-emerald-500 shadow-xl">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                <Briefcase size={16} /> Interviewer Experience
                            </div>
                            <h3 className="mt-2 text-xl sm:text-2xl font-black text-[var(--lp-text-title)]">
                                Assessment Control Center
                            </h3>
                            <ul className="mt-4 sm:mt-6 space-y-3 text-xs sm:text-sm font-bold text-[var(--lp-text-body)]">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Build custom rounds, assign problem banks, and allocate evaluation criteria.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Smart directory lookup: auto-detects registered engineers and prevents credential spoofing.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Multi-interviewer panels with real-time in-call presence tracking.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Candidate Portal */}
                        <div className="lp-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-l-4 border-teal-500 shadow-xl">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                                <UserCheck size={16} /> Candidate Experience
                            </div>
                            <h3 className="mt-2 text-xl sm:text-2xl font-black text-[var(--lp-text-title)]">
                                Frictionless Assessment Portal
                            </h3>
                            <ul className="mt-4 sm:mt-6 space-y-3 text-xs sm:text-sm font-bold text-[var(--lp-text-body)]">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                    <span>Direct token deep-links: 1-click workspace activation without password friction.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                    <span>Personal &quot;My Assessments&quot; dashboard with clear Accept / Decline decision workflows.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                    <span>Pre-flight checks to test audio, video, and compiler bindings before live rounds.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ================= BOTTOM CTA BANNER ================= */}
                <section className="relative mt-20 sm:mt-28 mb-4">
                    <div className="lp-glass-card rounded-2xl sm:rounded-3xl px-4 py-10 sm:px-12 sm:py-16 text-center shadow-2xl">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--lp-text-title)] leading-tight">
                            {isLoggedIn
                                ? `Ready to jump back into your rounds, ${user?.name || "Engineer"}?`
                                : "Ready to upgrade your technical hiring standards?"}
                        </h2>
                        <p className="mx-auto mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm font-semibold text-[var(--lp-text-body)]">
                            {isLoggedIn
                                ? "Access your active assessments, schedule new candidate evaluations, or review upcoming technical rounds."
                                : "Join engineering teams conducting low-latency collaborative rounds on JobSphere."}
                        </p>
                        <div className="mt-6 sm:mt-8 flex justify-center">
                            {isLoggedIn ? (
                                <Link
                                    to={user?.role === "interviewer" ? "/assessments" : "/candidate/my_assessment"}
                                    style={{ background: "var(--lp-accent)", boxShadow: "var(--lp-accent-shadow)" }}
                                    className="relative z-10 flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    <span>Go to {user?.role === "interviewer" ? "Assessment Hub" : "My Assessments"}</span>
                                    <ArrowRight size={15} />
                                </Link>
                            ) : (
                                <Link
                                    to="/signup"
                                    style={{ background: "var(--lp-accent)", boxShadow: "var(--lp-accent-shadow)" }}
                                    className="relative z-10 flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    <span>Get Started for Free</span>
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}