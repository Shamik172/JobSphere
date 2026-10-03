import React from "react";

export const JOBSPHERE_FEATURES = [
  {
    badge: "AI Assessment Engine",
    headline: "AtCoder Scraper & Gemini AI Testcases",
    subtext: "Parse real problems from AtCoder, extract sample constraints, and generate adversarial edge cases with Gemini.",
    file: "gemini_evaluator.ts",
    tags: ["Gemini AI", "AtCoder"],
    code: (
      <>
        <p><span className="text-purple-400 font-bold">const</span> challenge = <span className="text-purple-400">await</span> AtCoder.<span className="text-cyan-400">parse</span>(<span className="text-emerald-300">"arc175_b"</span>);</p>
        <p className="text-slate-400">// Generating edge cases via Gemini</p>
        <p><span className="text-purple-400">const</span> cases = <span className="text-purple-400">await</span> Gemini.<span className="text-yellow-300">generateCases</span>(challenge);</p>
        <p className="text-emerald-400">console.log(`Generated {'${cases.length}'} test assertions`);</p>
      </>
    ),
  },
  {
    badge: "Synchronous IDE",
    headline: "Low-Latency Multi-Cursor Code Editor",
    subtext: "Real-time Monaco code editor with live multi-cursor broadcasting, sandbox isolation, and test execution.",
    file: "session_runner.ts",
    tags: ["Monaco IDE", "C++ / JS / Py"],
    code: (
      <>
        <p><span className="text-purple-400 font-bold">const</span> sandbox = <span className="text-purple-400">new</span> <span className="text-blue-400">CodeSandbox</span>(&#123; timeout: <span className="text-orange-300">"2000ms"</span> &#125;);</p>
        <p className="text-slate-400">// Broadcasting live cursor to peers</p>
        <p>sandbox.<span className="text-cyan-400">syncCursors</span>([<span className="text-emerald-300">"Interviewer"</span>, <span className="text-emerald-300">"Candidate"</span>]);</p>
        <p><span className="text-purple-400">await</span> sandbox.<span className="text-emerald-400">executeCode</span>();</p>
      </>
    ),
  },
  {
    badge: "System Design Canvas",
    headline: "Real-Time Excalidraw Whiteboard",
    subtext: "Transition seamlessly between algorithmic coding and system architecture diagrams on a shared zero-latency canvas.",
    file: "system_design.excalidraw",
    tags: ["Excalidraw", "WebRTC HD"],
    code: (
      <>
        <p><span className="text-purple-400 font-bold">interface</span> <span className="text-yellow-300">ArchitectureCanvas</span> &#123;</p>
        <p className="pl-4">whiteboard: <span className="text-emerald-300">"Excalidraw"</span>;</p>
        <p className="pl-4">syncDelayMs: <span className="text-cyan-400">8</span>;</p>
        <p className="pl-4">webrtcSignaling: <span className="text-emerald-300">"Connected HD"</span>;</p>
        <p>&#125;</p>
      </>
    ),
  },
];