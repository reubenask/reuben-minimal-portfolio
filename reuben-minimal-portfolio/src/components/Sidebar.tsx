import {
  ChevronRight,
  Clock3,
  Folder,
  Orbit,
  Settings,
  Star,
  Bookmark,
  Grid2X2,
} from "lucide-react";

const items = [Orbit, Folder, Star, Clock3, Bookmark, Grid2X2];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-20 flex-col items-center border-r border-white/10 bg-black/10 py-7 backdrop-blur-xl">
      <button className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,.24)]">
        <Orbit className="h-5 w-5" />
      </button>

      <nav className="mt-10 flex flex-1 flex-col items-center gap-6 text-slate-400">
        {items.slice(1).map((Icon) => (
          <button
            key={Icon.displayName}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-cyan-100"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-5 text-slate-400">
        <button className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-white/5 hover:text-cyan-100">
          <Settings className="h-4 w-4" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-white/5 hover:text-cyan-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
