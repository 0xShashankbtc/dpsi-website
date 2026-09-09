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

    const step = fullText.length > 50 ? 3 : 2;
    timer = setInterval(() => {
      if (isPaused) return;
      charIndex += step;
      if (charIndex >= fullText.length) {
        setDisplayText(fullText);
        clearInterval(timer);

        holdTimer = setTimeout(() => {
          setIsFading(true);
          fadeTimer = setTimeout(() => {
            onSlideComplete();
          }, 500);
        }, 3200);
        return;
      }
      setDisplayText(fullText.slice(0, Math.min(charIndex, fullText.length)));
    }, 16);

    return () => {
      clearInterval(timer);
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  }, [fullText, isPaused]);

  return (
    <motion.span
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="font-semibold text-slate-800 text-sm sm:text-base leading-snug tracking-tight"
    >
      {displayText}
      {!isFading && displayText.length < fullText.length && (
        <span className="inline-block w-0.5 h-4 bg-blue-700 ml-0.5 animate-pulse" />
      )}
    </motion.span>
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

  const safeSlideIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeSlideIndex] || DEFAULT_HERO_SLIDES[0];

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

  if (activeSlides.length === 0) return null;

  return (
    <div
      className="w-full flex flex-col bg-white contain-layout"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* TOP ANNOUNCEMENT BAR — cobalt blue with typewriter */}
      <div className="relative z-30 bg-blue-700 text-white py-3 px-4 sm:px-8 border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase shrink-0 w-max border border-white/30">
              {slide.badge}
            </span>
            <HeroTypewriter
              fullText={fullText}
              onSlideComplete={handleNextSlide}
              isPaused={isPaused}
            />
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg transition-all text-xs shadow-sm cursor-pointer flex items-center gap-1 border border-white/80"
                asChild
              >
                <Link to={slide.buttonLink || "/admissions"}>
                  {slide.buttonText || "Apply Now"} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                className="border border-white/50 bg-transparent hover:bg-white/10 text-white px-4 py-2 rounded-lg font-semibold transition-all text-xs cursor-pointer"
                asChild
              >
                <Link to="/about">Explore Campus</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HERO IMAGE SLIDER — full bleed, clean crossfade */}
      <section className="relative min-h-[50vh] sm:min-h-[65vh] lg:min-h-[78vh] overflow-hidden bg-slate-100">
        <AnimatePresence initial={false}>
          <motion.div
            key={(slide.videoUrl || slide.image) + safeSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 will-change-transform"
          >
            {slide.mediaType === "video" && slide.videoUrl ? (
              <video
                src={slide.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                loading={safeSlideIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                {...(safeSlideIndex === 0 ? { fetchPriority: "high" } : {})}
              />
            )}
            {/* Subtle dark overlay at bottom for nav controls readability */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/25 shadow-xl">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              handleManualSlideChange(
                (safeSlideIndex - 1 + activeSlides.length) % activeSlides.length
              )
            }
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          <div className="flex items-center gap-1.5 px-1">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualSlideChange(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  safeSlideIndex === idx
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/45 hover:bg-white/70"
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManualSlideChange((safeSlideIndex + 1) % activeSlides.length)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
