import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export function optimizeMediaUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (clean.includes("cloudinary.com") && clean.includes("/video/upload/")) {
    if (clean.includes("/video/upload/q_auto:best")) return clean;
    return clean.replace(
      "/video/upload/",
      "/video/upload/q_auto:best,vc_auto,w_1920,c_limit/"
    );
  }
  if (clean.includes("cloudinary.com") && clean.includes("/image/upload/")) {
    if (clean.includes("/image/upload/q_auto:best")) return clean;
    return clean.replace(
      "/image/upload/",
      "/image/upload/q_auto:best,f_auto,w_2560,c_limit/"
    );
  }
  return clean;
}

const DEFAULT_HERO_SLIDES = [
  {
    image: "/images/dps/slider_1.webp",
    videoUrl: "",
    mediaType: "image" as const,
    title: "Delhi Public School Indirapuram",
    subtitle: "Premier CBSE Day School in Ghaziabad • Nursery to Class XII",
    badge: "Admissions Open 2026-27",
    buttonText: "",
    buttonLink: "/admissions",
  },
];

export default function HeroSection() {
  const { data: cmsSliders } = trpc.cms.listSliders.useQuery();
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const activeSlides =
    cmsSliders && cmsSliders.length > 0
      ? cmsSliders
          .filter((s: any) => !s.isDeleted && s.isActive !== false)
          .map((s: any) => {
            const rawVid = (s.videoUrl || "").trim();
            const rawImg = (s.imageUrl || "").trim();
            const isVideo = s.mediaType === "video" || Boolean(rawVid);
            return {
              image: rawImg || "/images/dps/slider_1.webp",
              videoUrl: optimizeMediaUrl(rawVid),
              mediaType: (isVideo ? "video" : "image") as "image" | "video",
              title: s.title,
              subtitle: s.subtitle || "",
              badge: s.subtitle ? "Excellence in Education" : "Admissions Open 2026-27",
              buttonText: s.buttonText || "Apply Now",
              buttonLink: s.buttonLink || "/admissions",
            };
          })
      : DEFAULT_HERO_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const safeSlideIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const hasVideo = slide.mediaType === "video" && Boolean(slide.videoUrl);
  const videoSource = hasVideo ? slide.videoUrl : "";

  // Automatically load and start video playback when videoSource or slide changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && hasVideo && videoSource) {
      video.muted = isMuted;
      video.defaultMuted = true;
      try {
        video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlayingVideo(true))
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            });
        }
      } catch {
        // Safe catch
      }
    }
  }, [videoSource, safeSlideIndex, hasVideo]);

  // Mouse Parallax Physics for Super Smooth 3D Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[78vh] sm:min-h-[86vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none contain-paint"
      style={{ perspective: "1000px" }}
    >
      {/* GPU-ACCELERATED BACKGROUND MEDIA */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`hero-slide-${safeSlideIndex}-${hasVideo ? videoSource : slide.image}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden will-change-transform"
        >
          {hasVideo && videoSource ? (
            <video
              ref={videoRef}
              key={videoSource}
              src={videoSource}
              poster={slide.image || "/images/dps/slider_1.webp"}
              autoPlay
              muted={isMuted}
              defaultMuted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
              onVolumeChange={() => {
                if (videoRef.current) {
                  setIsMuted(videoRef.current.muted);
                }
              }}
              className="w-full h-full object-cover object-center scale-[1.02] will-change-transform"
            />
          ) : (
            <img
              src={slide.image || "/images/dps/slider_1.webp"}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          )}

          {/* Ultra-subtle gradient so video is bright, crisp and clearly visible */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-transparent to-black/45" />
        </motion.div>
      </AnimatePresence>

      {/* TOP PORTION: ADMISSIONS OPEN BADGE (86% TRANSPARENT GLASSMORPHISM) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute top-5 sm:top-7 inset-x-0 z-20 flex justify-center px-4 pointer-events-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/[0.14] hover:bg-white/[0.22] backdrop-blur-xl border border-white/30 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xl shadow-black/10 cursor-default transition-all">
          <span>{slide.badge || "Admissions Open 2026-27"}</span>
          <span className="text-white/40">|</span>
          <span className="text-[11px] sm:text-xs text-white/85">CBSE Affiliation No. 2130541</span>
        </div>
      </motion.div>

      {/* DYNAMIC HERO OVERLAY (DRIVEN BY DB / CMS) */}
      {(slide.title?.trim() || slide.subtitle?.trim() || slide.buttonText?.trim()) && (
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center will-change-transform"
        >
          {/* Dynamic Title */}
          {slide.title && slide.title.trim() && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-5 max-w-4xl drop-shadow-md"
            >
              {slide.title}
            </motion.h1>
          )}

          {/* Dynamic Subtitle */}
          {slide.subtitle && slide.subtitle.trim() && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-xl text-slate-200 font-normal max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-md"
            >
              {slide.subtitle}
            </motion.p>
          )}

          {/* Dynamic Action Button from Database */}
          {slide.buttonText && slide.buttonText.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3.5 mb-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-7 py-3 rounded-xl transition-all text-sm shadow-xl shadow-black/25 cursor-pointer flex items-center gap-2"
                  asChild
                >
                  <Link to={slide.buttonLink || "/admissions"}>
                    {slide.buttonText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* MINIMALIST INTERACTIVE CONTROLS DOCK (BOTTOM) */}
      <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
        {/* Left: Video Play & Audio Controls */}
        {hasVideo && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
              title={isPlayingVideo ? "Pause Video" : "Play Video"}
            >
              {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingVideo ? "Pause" : "Play"}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
              title={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs transition-all cursor-pointer hidden md:inline-flex shadow-sm"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Slide Controls (If Multiple Slides) */}
        {activeSlides.length > 1 && (
          <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 ml-auto shadow-sm">
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
