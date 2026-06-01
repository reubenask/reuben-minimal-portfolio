import { useState } from "react";
import { X } from "lucide-react";
import { HomePage } from "./components/HomePage";
import { UbaArchive } from "./uba/UbaArchive";

export default function App() {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#040908] font-mono text-slate-100">
      <HomePage onOpenArchive={() => setIsArchiveOpen(true)} />

      {isArchiveOpen && (
        <section className="fixed inset-0 z-50 overflow-hidden bg-[#040807]">
          <button
            onClick={() => setIsArchiveOpen(false)}
            className="fixed right-5 top-5 z-[80] grid h-10 w-10 place-items-center rounded-full border border-cyan-100/20 bg-white/[0.06] text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-xl transition hover:border-cyan-200/60 hover:bg-cyan-300/10"
            aria-label="Close archive"
          >
            <X className="h-4 w-4" />
          </button>
          <UbaArchive />
        </section>
      )}
    </div>
  );
}
