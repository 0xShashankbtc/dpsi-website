import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

const DEFAULT_HERO_SLIDES = [
  {
    image: "/images/dps/slider_1.webp",
    title: "Delhi Public School Indirapuram",
    subtitle: "Premier CBSE School in Ghaziabad",
    badge: "Admissions Open 2026-27",
    buttonText: "Apply Now",
    buttonLink: "/admissions",
  },
];

// High-Performance Isolated Typewriter Sub-Component (Zero Parent Re-renders)
const HeroTypewriter = memo(function HeroTypewriter({
  fullText,
  onSlideComplete,
  isPaused,
}: {
  fullText: string;
  onSlideComplete: () => void;
  isPaused: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!fullText) return;
    setDisplayText("");
    setIsFading(false);

    let charIndex = 0;
    let timer: any = null;
    let holdTimer: any = null;
    let fadeTimer: any = null;

    // Fast, responsive typing: 2-3 chars per 16ms frame (~60 FPS)
    const step = fullText.length > 50 ? 3 : 2;
    timer = setInterval(() => {
      if (isPaused) return;
      charIndex += step;
      if (charIndex >= fullText.length) {
        setDisplayText(fullText);
        clearInterval(timer);

        // Hold readable text for 4.5 seconds
        holdTimer = setTimeout(() => {
          if (isPaused) return;
          setIsFading(true);
          // Swift 180ms crossfade transition to next slide
          fadeTimer = setTimeout(() => {
            onSlideComplete();
          }, 180);
        }, 4500);
      } else {
        setDisplayText(fullText.slice(0, charIndex));
      }
    }, 16);

    return () => {
      if (timer) clearInterval(timer);
      if (holdTimer) clearTimeout(holdTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [fullText, isPaused, onSlideComplete]);

  return (
    <div
      className={`text-xs sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight min-h-[2.5rem] sm:min-h-[1.75rem] flex items-center min-w-0 transition-opacity duration-200 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="text-sky-950 drop-shadow-2xs leading-tight sm:leading-snug break-words">
        {displayText}
      </span>
      <span className="inline-block w-1.5 h-4 sm:w-2 sm:h-5 bg-sky-600 ml-1 animate-pulse shrink-0" />
    </div>
  );
});

export default function HeroSection() {
  const { data: cmsSliders } = trpc.cms.listSliders.useQuery(undefined, {
    staleTime: 60000,
  });

  const activeSlides =
    cmsSliders && cmsSliders.length > 0
      ? cmsSliders
          .filter((s: any) => !s.isDeleted && s.isActive !== false)
          .map((s: any) => ({
            image: s.imageUrl || "",
            videoUrl: s.videoUrl || "",
            mediaType: (s.mediaType || (s.videoUrl ? "video" : "image")) as "image" | "video",
            title: s.title,
            subtitle: s.subtitle || "",
            badge: s.subtitle ? "Excellence in Education" : "Admissions Open 2026-27",
            buttonText: s.buttonText || "Apply Now",
            buttonLink: s.buttonLink || "/admissions",
          }))
      : DEFAULT_HERO_SLIDES.map((s) => ({ ...s, videoUrl: "", mediaType: "image" as const }));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Safe slide index calculation
  const safeSlideIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeSlideIndex] || DEFAULT_HERO_SLIDES[0];

  // Preload all slider images into memory
  useEffect(() => {
    activeSlides.forEach((s) => {
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, [activeSlides]);

  const fullText = slide ? (slide.subtitle ? `${slide.title} — ${slide.subtitle}` : slide.title) : "";

  const handleNextSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handleManualSlideChange = (newIndex: number) => {
    if (activeSlides.length === 0) return;
    setCurrentSlide(newIndex % activeSlides.length);
  };

  if (activeSlides.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full flex flex-col bg-slate-50 contain-layout"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SEPARATE TEXT BAR ABOVE IMAGE WITH FAST TYPEWRITER (LIGHT THEME) */}
      <div className="relative z-30 bg-gradient-to-r from-sky-100 via-white to-blue-50 text-slate-900 border-b border-sky-200/80 py-3.5 sm:py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          {/* Badge & Animated Typewriter Text (Isolated) */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold tracking-wide uppercase shrink-0 w-max shadow-xs">
              {slide.badge}
            </span>

            <HeroTypewriter
              fullText={fullText}
              onSlideComplete={handleNextSlide}
              isPaused={isPaused}
            />
          </div>

          {/* Action Buttons with Spring Hover/Tap Physics */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 text-xs shadow-md shadow-sky-600/25 cursor-pointer flex items-center gap-1"
                asChild
              >
                <Link to={slide.buttonLink || "/admissions"}>
                  {slide.buttonText || "Apply Now"} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="border border-sky-300 bg-white hover:bg-sky-50 text-sky-900 px-4 py-2 rounded-xl font-bold transition-all duration-300 text-xs cursor-pointer shadow-xs"
                asChild
              >
                <Link to="/about">Explore Campus</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FULL UNBLOCKED HERO IMAGE SLIDER BELOW THE BAR (GPU ACCELERATED OVERLAPPING CROSSFADE) */}
      <section className="relative min-h-[50vh] sm:min-h-[65vh] lg:min-h-[75vh] overflow-hidden bg-slate-950">
        {/* Hardware-Accelerated Ambient Floating Glow (CSS Keyframe Driven) */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none z-10 animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none z-10 animate-pulse" />

        {/* Overlapping Concurrent Crossfade (Zero Black Gaps) */}
        <AnimatePresence initial={false}>
          <motion.div
            key={(slide.videoUrl || slide.image) + safeSlideIndex}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center bg-slate-950 overflow-hidden will-change-transform"
          >
            {/* 100% Unblocked Banner Video or Image */}
            {slide.mediaType === "video" && slide.videoUrl ? (
              <video
                src={slide.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover object-center z-0 will-change-transform"
              />
            ) : (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center z-0 will-change-transform"
                loading={safeSlideIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                {...(safeSlideIndex === 0 ? { fetchPriority: "high" } : {})}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Slide Navigation Controls with Glassmorphism */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 z-30 flex items-center gap-3 bg-slate-950/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20 shadow-2xl">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              handleManualSlideChange(
                (safeSlideIndex - 1 + activeSlides.length) % activeSlides.length
              )
            }
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 px-1">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualSlideChange(idx)}
                className={`h-2 rounded-full cursor-pointer shadow-xs transition-all duration-300 ${
                  safeSlideIndex === idx
                    ? "w-6 bg-sky-400"
                    : "w-2 bg-white/45 hover:bg-white/70"
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManualSlideChange((safeSlideIndex + 1) % activeSlides.length)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}