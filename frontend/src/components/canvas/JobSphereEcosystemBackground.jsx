import React, { useEffect, useRef } from "react";

const HUBS = [
  { l: "AtCoder", light: "#0284C7", dark: "#38BDF8" },
  { l: "Gemini AI", light: "#7E22CE", dark: "#A855F7" },
  { l: "Excalidraw", light: "#E11D48", dark: "#F43F5E" },
  { l: "WebRTC", light: "#059669", dark: "#10B981" },
  { l: "Monaco IDE", light: "#047857", dark: "#34D399" },
  { l: "Sandbox", light: "#D97706", dark: "#F59E0B" },
];

const LINK_DIST = 190;
const MOUSE_DIST = 210;

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export default function JobSphereEcosystemBackground({ isDark, subtle = false }) {
  const canvasRef = useRef(null);
  const darkRef = useRef(isDark);
  const subtleRef = useRef(subtle);

  // Prop changes only update refs, so the nodes never reshuffle.
  useEffect(() => {
    darkRef.current = isDark;
    subtleRef.current = subtle;
  }, [isDark, subtle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let animId = 0;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a, b) => a + Math.random() * (b - a);

    const ambientCount = Math.max(14, Math.min(34, Math.round((w * h) / 42000)));
    const nodes = [
      ...HUBS.map((t) => ({
        ...t,
        hub: true,
        r: 5,
        x: rand(60, w - 60),
        y: rand(60, h - 60),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        phase: rand(0, Math.PI * 2),
      })),
      ...Array.from({ length: ambientCount }, (_, i) => {
        const t = HUBS[i % HUBS.length];
        return {
          light: t.light,
          dark: t.dark,
          hub: false,
          r: rand(1.6, 2.6),
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.4, 0.4),
          vy: rand(-0.4, 0.4),
          phase: rand(0, Math.PI * 2),
        };
      }),
    ];

    const packets = [];

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 20 || n.x > w - 20) {
          n.vx *= -1;
          n.x = Math.min(Math.max(n.x, 20), w - 20);
        }
        if (n.y < 20 || n.y > h - 20) {
          n.vy *= -1;
          n.y = Math.min(Math.max(n.y, 20), h - 20);
        }
      }
    };

    const draw = (time) => {
      const dark = darkRef.current;
      const sub = subtleRef.current;
      const fade = sub ? 0.55 : 1;
      ctx.clearRect(0, 0, w, h);

      const linkRgb = dark ? "52,211,153" : "4,120,87";
      const linkAlpha = (dark ? 0.22 : 0.3) * fade;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const k = 1 - d / LINK_DIST;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${linkRgb},${k * linkAlpha})`;
            ctx.lineWidth = a.hub && b.hub ? 1.4 : 1;
            ctx.stroke();

            if (!reduceMotion && (a.hub || b.hub) && packets.length < (sub ? 8 : 18) && Math.random() < 0.0008) {
              packets.push({ a: i, b: j, t: 0, speed: rand(0.008, 0.016) });
            }
          }
        }
      }

      if (mouse.x > -999) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < MOUSE_DIST) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${linkRgb},${(1 - d / MOUSE_DIST) * (dark ? 0.4 : 0.45) * fade})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (let p = packets.length - 1; p >= 0; p--) {
        const pk = packets[p];
        const a = nodes[pk.a];
        const b = nodes[pk.b];
        pk.t += pk.speed;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pk.t >= 1 || dist > LINK_DIST * 1.15) {
          packets.splice(p, 1);
          continue;
        }
        const x = a.x + (b.x - a.x) * pk.t;
        const y = a.y + (b.y - a.y) * pk.t;
        const rgb = hexToRgb(dark ? a.dark : a.light);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${rgb},${0.9 * fade})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgb(${rgb})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const n of nodes) {
        const col = dark ? n.dark : n.light;
        const rgb = hexToRgb(col);
        const pulse = 0.5 + 0.5 * Math.sin(time / 900 + n.phase);

        if (n.hub) {
          const haloR = 16 + pulse * 7;
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
          halo.addColorStop(0, `rgba(${rgb},${(dark ? 0.45 : 0.35) * fade})`);
          halo.addColorStop(1, `rgba(${rgb},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb},${(dark ? 0.55 : 0.5) * fade})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = (n.hub ? 1 : dark ? 0.7 : 0.8) * (sub ? 0.8 : 1);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (n.hub && !sub) {
          ctx.font = "700 11px Inter, system-ui, sans-serif";
          const tw = ctx.measureText(n.l).width;
          const lx = n.x + 14;
          const ly = n.y;
          ctx.fillStyle = dark ? "rgba(8,13,26,0.7)" : "rgba(255,255,255,0.78)";
          ctx.strokeStyle = `rgba(${rgb},${dark ? 0.4 : 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(lx - 6, ly - 10, tw + 12, 20, 10);
          else ctx.rect(lx - 6, ly - 10, tw + 12, 20);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = dark ? "rgba(241,245,249,0.95)" : "rgba(15,23,42,0.92)";
          ctx.textBaseline = "middle";
          ctx.fillText(n.l, lx, ly + 0.5);
        }
      }
    };

    const loop = (time) => {
      step();
      draw(time);
      animId = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(animId);
      if (reduceMotion) draw(0);
      else animId = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else start();
    };

    const onResize = () => {
      resize();
      if (reduceMotion) draw(0);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}