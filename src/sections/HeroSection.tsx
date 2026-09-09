import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

const DEFAULT_HERO_SLIDES = [
  {
    image: "/images/dps/slider_1.webp",
    videoUrl: "/videos/campus_hero.mp4",
    mediaType: "video" as const,
    title: "Delhi Public School Indirapuram",
    subtitle: "Premier CBSE Day School in Ghaziabad • Nursery to Class XII",
    badge: "Admissions Open 2026-27",
    buttonText: "Apply Now",
    buttonLink: "/admissions",
  },
];

export default function HeroSection() {
  const { data: cmsSliders } = trpc.cms.listSliders.useQuery(undefined, {
    staleTime: 60000,
  });

  const activeSlides =
    cmsSliders && cmsSliders.length > 0
      ? cmsSliders
          .filter((s: any) => !s.isDeleted && s.isActive !== false)
          .map((s: any) => ({
            image: s.imageUrl || "/images/dps/slider_1.webp",
            videoUrl: s.videoUrl || (s.mediaType === "video" ? "/videos/campus_hero.mp4" : ""),
            mediaType: (s.mediaType || (s.videoUrl ? "video" : "image")) as "image" | "video",
            title: s.title,
            subtitle: s.subtitle || "",
            badge: s.subtitle ? "Excellence in Education" : "Admissions Open 2026-27",
            buttonText: s.buttonText || "Apply Now",
            buttonLink: s.buttonLink || "/admissions",
          }))
      : DEFAULT_HERO_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const safeSlideIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const hasVideo = Boolean(slide.videoUrl || slide.mediaType === "video");
  const videoSource = slide.videoUrl || (hasVideo ? "/videos/campus_hero.mp4" : "");

  const handleNextSlide = () => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrevSlide = () => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlayingVideo(false);
      }
    }
  };

  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* BACKGROUND VIDEO / IMAGE */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={safeSlideIndex + (hasVideo ? "-vid" : "-img")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {hasVideo && videoSource ? (
            <video
              ref={videoRef}
              src={videoSource}
              poster={slide.image || "/images/dps/slider_1.webp"}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={slide.image || "/images/dps/slider_1.webp"}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          )}

          {/* Minimalist Cinematic Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/40" />
          <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-90" />
        </motion.div>
      </AnimatePresence>

      {/* MINIMALIST HERO CONTENT OVERLAY */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Subtle minimalist badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold tracking-wide mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{slide.badge || "Admissions Open 2026-27"}</span>
        </motion.div>

        {/* Minimalist Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-5 max-w-4xl"
        >
          {slide.title}
        </motion.h1>

        {/* Minimalist Subtitle */}
        {slide.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto mb-9 leading-relaxed"
          >
            {slide.subtitle}
          </motion.p>
        )}

        {/* Clean, Sorted Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3.5"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="lg"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-7 py-3 rounded-xl transition-all text-sm shadow-lg shadow-black/20 cursor-pointer flex items-center gap-2"
              asChild
            >
              <Link to={slide.buttonLink || "/admissions"}>
                {slide.buttonText || "Apply Now"} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="lg"
              variant="outline"
              className="border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-7 py-3 rounded-xl font-semibold transition-all text-sm cursor-pointer"
              asChild
            >
              <Link to="/about">Explore Campus</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* MINIMALIST BOTTOM CONTROLS */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-6">
        {/* Video Play/Pause Control */}
        {hasVideo && (
          <button
            type="button"
            onClick={toggleVideoPlayback}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer"
            title={isPlayingVideo ? "Pause Background Video" : "Play Background Video"}
          >
            {isPlayingVideo ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause Video</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Play Video</span>
              </>
            )}
          </button>
        )}

        {/* Multi-Slide Navigation (Only shown if >1 slide) */}
        {activeSlides.length > 1 && (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 ml-auto">
            <button
              onClick={handlePrevSlide}
              className="p-1 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    safeSlideIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNextSlide}
              className="p-1 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
