import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { JOBSPHERE_FEATURES } from "./authData.jsx";

function CodeCard({ cur, isMobile = false }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--code-border)] bg-[var(--code-bg)] shadow-xl shadow-black/40 ring-1 ring-emerald-400/10">
      {/* Header Bar */}
      <div className="flex h-7 sm:h-8 items-center justify-between border-b border-white/10 bg-white/5 px-2.5 sm:px-3.5">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <div className="flex gap-1 sm:gap-1.5 shrink-0">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-rose-500" />
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-500" />
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="truncate font-mono text-[9.5px] sm:text-[11px] font-bold text-slate-300">
            {cur.file}
          </span>
        </div>
        <div className="flex gap-1 sm:gap-1.5 shrink-0 pl-1.5">
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold text-emerald-300 whitespace-nowrap">
            {cur.tags[0]}
          </span>
          <span className="rounded bg-teal-500/20 px-1.5 py-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold text-teal-300 whitespace-nowrap">
            {cur.tags[1]}
          </span>
        </div>
      </div>

      {/* Code Editor Body: Compact & cleanly scaled on phones, full size on tablets/laptops */}
      <div
        className={`${
          isMobile
            ? "h-[92px] p-2 text-[9.5px] leading-[15px] tracking-tight"
            : "h-[125px] p-3.5 text-[11.5px] leading-[21px]"
        } overflow-hidden font-mono text-slate-100`}
      >
        {cur.code}
      </div>
    </div>
  );
}

export default function AuthFeatureShowcase({ features = JOBSPHERE_FEATURES, isMobile = false }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const swapTimer = useRef(null);
  const touchX = useRef(null);

  const goTo = (next) => {
    clearTimeout(swapTimer.current);
    setFade(false);
    swapTimer.current = setTimeout(() => {
      setIdx(next);
      setFade(true);
    }, 180);
  };

  useEffect(() => {
    const t = setTimeout(() => goTo((idx + 1) % features.length), 4500);
    return () => clearTimeout(t);
  }, [idx, features.length]);

  useEffect(() => () => clearTimeout(swapTimer.current), []);

  const cur = features[idx];

  /* ---------------- Mobile & Tablet View ---------------- */
  if (isMobile) {
    const onTouchStart = (e) => {
      touchX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      touchX.current = null;
      if (Math.abs(dx) < 35) return;
      goTo(dx < 0 ? (idx + 1) % features.length : (idx - 1 + features.length) % features.length);
    };

    return (
      <div
        className="js-aside mb-3 sm:mb-5 w-full select-none rounded-2xl border border-white/15 p-3.5 sm:p-5 lg:hidden shadow-xl shadow-emerald-950/20 flex flex-col justify-between"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top Header: Badge + Pagination */}
        <div className="flex h-5 sm:h-6 items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--tag-border)] bg-[var(--tag-bg)] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-bold text-[var(--tag-text)] shadow-sm">
            <Sparkles size={11} className="shrink-0 text-emerald-300" />
            <span className="truncate max-w-[170px] sm:max-w-none">{cur.badge}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {features.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center"
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === i
                      ? "w-4 sm:w-5 bg-[var(--dot-active)] shadow-sm"
                      : "w-1.5 bg-[var(--dot-idle)] hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Compact on Phone (<sm), Spacious Description on Tablet (sm+) */}
        <div className={`mt-1.5 sm:mt-3 transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
          {/* Headline slot */}
          <div className="h-[20px] sm:h-[48px] flex items-center">
            <h2 className="text-[13px] sm:text-xl font-black leading-tight text-[var(--title-color)] truncate sm:whitespace-normal sm:line-clamp-2 w-full">
              {cur.headline}
            </h2>
          </div>

          {/* Description slot */}
          <div className="mt-0.5 sm:mt-1.5 h-[28px] sm:h-[48px] overflow-hidden">
            <p className="text-[10.5px] sm:text-sm font-medium leading-[14px] sm:leading-relaxed text-[var(--text-muted)] line-clamp-2">
              {cur.subtext}
            </p>
          </div>

          {/* Code Section */}
          <div className="mt-2 sm:mt-4">
            <div className="block sm:hidden">
              <CodeCard cur={cur} isMobile />
            </div>
            <div className="hidden sm:block">
              <CodeCard cur={cur} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Desktop View (Untouched) ---------------- */
  return (
    <div className={`flex h-[420px] flex-col justify-between transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-30"}`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tag-border)] bg-[var(--tag-bg)] px-3.5 py-1 text-xs font-bold text-[var(--tag-text)] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            {cur.badge}
          </span>
          <div className="flex gap-1.5">
            {features.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 hover:bg-emerald-300 ${
                  idx === i ? "w-6 bg-[var(--dot-active)] shadow-sm" : "w-2 bg-[var(--dot-idle)]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 h-[120px]">
          <h2 className="text-[28px] font-black leading-tight text-[var(--title-color)]">
            {cur.headline}
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--text-muted)]">
            {cur.subtext}
          </p>
        </div>
      </div>

      <CodeCard cur={cur} />
    </div>
  );
}