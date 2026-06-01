import { Menu } from "lucide-react";
import { motion } from "framer-motion";

const heroImage = new URL("../../assets/hero.png", import.meta.url).href;

type HomePageProps = {
  onOpenArchive: () => void;
};

export function HomePage({ onOpenArchive }: HomePageProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#030706] px-6 py-24 text-slate-100 [perspective:1800px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_39%,rgba(75,220,214,.17),transparent_24%),radial-gradient(circle_at_68%_66%,rgba(236,176,88,.13),transparent_25%),linear-gradient(140deg,#030706_0%,#081313_46%,#020506_100%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.035)_0_1px,transparent_1px_15px)]" />
      <div className="absolute left-1/2 top-[54%] h-[34svh] w-[52vw] -translate-x-1/2 rounded-full bg-cyan-200/10 blur-[90px]" />
      <div className="absolute bottom-[-20svh] left-1/2 h-[42svh] w-[70vw] -translate-x-1/2 rounded-[100%] border border-cyan-100/10 bg-black/30 blur-sm" />

      <header className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-4">
        <a
          href="mailto:reuben@zju.edu.cn"
          className="rounded-full border border-white/10 bg-black/25 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-100/90 backdrop-blur-xl transition hover:border-cyan-200/35 hover:text-cyan-50"
        >
          Reuben S. K. Agbozo
        </a>
        <button
          onClick={onOpenArchive}
          className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-black/25 text-slate-200 backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-100"
          aria-label="Open User Behavior Archive"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <motion.button
        type="button"
        onClick={onOpenArchive}
        initial={{ opacity: 0, y: 30, rotateX: 14, rotateY: -13, scale: 0.78 }}
        animate={{ opacity: 1, y: -8, rotateX: 9, rotateY: -11, scale: 0.82 }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -14, rotateX: 7, rotateY: -9, scale: 0.84 }}
        className="relative z-10 block w-[min(64vw,980px)] overflow-hidden rounded-[30px] border border-white/10 bg-black/20 shadow-[0_48px_130px_rgba(0,0,0,.66)] outline-none ring-0 transition hover:border-cyan-200/40 hover:shadow-[0_52px_150px_rgba(34,211,238,.15)] max-md:w-[86vw]"
        aria-label="Open archive"
      >
        <span className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(110deg,rgba(255,255,255,.12),transparent_26%,transparent_70%,rgba(255,255,255,.08))]" />
        <img
          src={heroImage}
          alt="Human Behavior Architect visual"
          className="max-h-[62svh] w-full object-contain opacity-88"
        />
      </motion.button>
    </main>
  );
}
