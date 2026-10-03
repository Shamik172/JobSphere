import React from "react";
import { Loader2 } from "lucide-react";

const Line = ({ w = "w-full", h = "h-3" }) => <div className={`lp-skeleton ${h} ${w}`} />;

function SkeletonTile() {
  return (
    <div className="lp-glass-card flex items-center gap-3 rounded-2xl p-3">
      <div className="lp-skeleton h-9 w-9 shrink-0 !rounded-xl" />
      <div className="flex-1 space-y-2">
        <Line w="w-1/3" h="h-4" />
        <Line w="w-2/3" h="h-2.5" />
      </div>
    </div>
  );
}

function SkeletonCard({ rows = 3 }) {
  return (
    <div className="lp-glass-card rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <div className="lp-skeleton h-9 w-9 shrink-0 !rounded-xl" />
        <div className="flex-1 space-y-2">
          <Line w="w-1/2" />
          <Line w="w-1/3" h="h-2.5" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Line key={i} w={i % 2 ? "w-5/6" : "w-full"} h="h-9" />
        ))}
      </div>
    </div>
  );
}

export default function PageLoader({ variant = "directory", label = "Loading…" }) {
  return (
    <main
      className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8 lp-enter"
      aria-busy="true"
      aria-live="polite"
    >
      {/* status strip */}
      <div className="lp-glass-card rounded-3xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="lp-icon-chip">
            <Loader2 size={17} className="animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[var(--lp-text-title)]">{label}</p>
            <div className="lp-loadbar mt-2">
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonTile key={i} />
        ))}
      </div>

      {variant === "directory" ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} rows={2} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard rows={4} />
          </div>
        </div>
      )}
    </main>
  );
}