import { Command, Grid3X3, Search, Share2 } from "lucide-react";

type TopBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function TopBar({ search, onSearchChange }: TopBarProps) {
  return (
    <header className="pointer-events-none fixed left-24 right-8 top-5 z-30 flex items-center justify-between gap-6">
      <div className="pointer-events-auto flex items-center gap-3">
        <h1 className="text-[13px] font-semibold uppercase tracking-[0.42em] text-slate-100">
          User Behavior Archive
        </h1>
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
      </div>

      <label className="pointer-events-auto flex h-11 w-[min(420px,36vw)] items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 text-sm text-slate-400 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <Search className="h-4 w-4 text-slate-300" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search archive..."
        />
        <span className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
          <Command className="h-3 w-3" />K
        </span>
      </label>

      <div className="pointer-events-auto flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-slate-300 backdrop-blur-xl">
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-slate-300 backdrop-blur-xl">
          <Share2 className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-2 py-1.5 backdrop-blur-xl">
          <img
            src="/assets/hero.png"
            alt=""
            className="h-8 w-8 rounded-full object-cover grayscale"
          />
        </div>
      </div>
    </header>
  );
}
