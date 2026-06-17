import { Suspense, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroScene } from "./HeroScene";

const architectFrontImage = new URL("../../assets/hero-gallery-architect-front.png", import.meta.url).href;
const architectProfileImage = new URL("../../assets/hero-gallery-architect-profile.png", import.meta.url).href;

const gallerySlides = [
  { src: architectProfileImage, alt: "User Behavior Architect profile interface" },
  { src: architectFrontImage, alt: "User Behavior Architect portrait interface" },
];

type HomePageProps = {
  onOpenArchive: () => void;
};

export function HomePage({ onOpenArchive }: HomePageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = gallerySlides[activeSlide];

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % gallerySlides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  function showPrevious(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveSlide((current) => (current - 1 + gallerySlides.length) % gallerySlides.length);
  }

  function showNext(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveSlide((current) => (current + 1) % gallerySlides.length);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030706] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(24,169,154,.2),transparent_32%),radial-gradient(circle_at_55%_90%,rgba(219,161,77,.13),transparent_28%),linear-gradient(180deg,#020504_0%,#06110f_54%,#020504_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.065] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:86px_86px]" />
      <div className="pointer-events-none absolute inset-x-[-12%] bottom-[-32%] h-[55vh] rounded-[50%] bg-[radial-gradient(circle,rgba(115,255,237,.2),rgba(115,255,237,.05)_34%,transparent_68%)] blur-3xl" />

      <div className="pointer-events-none absolute inset-0 z-[1] opacity-45 mix-blend-screen">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <header className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-4">
        <a
          href="mailto:reuben@zju.edu.cn"
          className="rounded-full border border-white/15 bg-black/28 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-100/90 shadow-[0_18px_60px_rgba(0,0,0,.35)] backdrop-blur-xl transition hover:border-cyan-200/35 hover:text-cyan-50 max-sm:max-w-[calc(100vw-6.25rem)] max-sm:truncate"
        >
          User Behavior Architect
        </a>
        <button
          onClick={onOpenArchive}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,.35)] backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-100"
          aria-label="Open User Behavior Archive"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col justify-center px-6 pb-8 pt-28 max-sm:px-5 max-sm:pb-6"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="mb-8 text-center max-sm:mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-100/70">
              User Behavior Architect
            </p>
            <p className="mt-4 text-[clamp(1.35rem,3vw,2.9rem)] font-semibold uppercase leading-tight tracking-[0.26em] text-white/90 max-sm:tracking-[0.14em]">
              Research. Systems. Human Behavior.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenArchive}
            className="group relative max-w-full outline-none [perspective:1400px]"
            style={{ width: "min(82vw, 980px, calc((100svh - 15.5rem) * 1.777))" }}
            aria-label="Open User Behavior Archive"
          >
            <div className="pointer-events-none absolute inset-x-[9%] bottom-[-16%] h-[34%] rounded-[50%] bg-cyan-300/18 blur-3xl transition duration-700 group-hover:bg-cyan-200/25" />
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.035] shadow-[0_40px_120px_rgba(0,0,0,.58)] backdrop-blur-xl transition duration-700 [transform:rotateX(2deg)_rotateY(-5deg)] group-hover:border-cyan-200/45 group-hover:shadow-[0_48px_150px_rgba(36,240,231,.18)] group-hover:[transform:rotateX(0deg)_rotateY(0deg)_translateY(-6px)] max-sm:rounded-[1.35rem]">
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-cover object-[58%_50%]"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,transparent_45%,rgba(0,0,0,.28)_100%),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.32))]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/60 to-transparent" />
            </div>
          </button>

          <div className="mt-7 flex w-full max-w-[980px] items-end justify-between gap-5 max-md:flex-col max-md:items-center">
            <p className="max-w-[38rem] text-sm leading-7 text-slate-100/68 max-md:text-center">
              Research, design, and intelligent systems shaped around how people decide, learn, and work.
            </p>

            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-2 shadow-[0_18px_70px_rgba(0,0,0,.35)] backdrop-blur-xl">
              <button
                type="button"
                onClick={showPrevious}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-cyan-100"
                aria-label="Previous gallery image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {gallerySlides.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeSlide ? "w-8 bg-cyan-200" : "w-2 bg-white/35 hover:bg-white/60"
                }`}
                aria-label={`Show gallery image ${index + 1}`}
              />
              ))}
              <button
                type="button"
                onClick={showNext}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-cyan-100"
                aria-label="Next gallery image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
