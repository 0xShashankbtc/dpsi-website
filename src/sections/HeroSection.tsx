import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

export function optimizeMediaUrl(url?: string, _isMobile: boolean = false): string {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (clean.includes("cloudinary.com") && clean.includes("/video/upload/")) {
    const uploadIdx = clean.indexOf("/video/upload/");
    const afterUpload = clean.substring(uploadIdx + "/video/upload/".length);
    const parts = afterUpload.split("/");
    const hasTransform = parts.length > 1 && !/^v\d+$/.test(parts[0]);
    const cleanPath = hasTransform ? parts.slice(1).join("/") : afterUpload;

    // Deliver pristine 1080p 60fps video on all devices (mobile & desktop).
    // On mobile devices, because the video is landscape (16:9) and rendered with object-cover on tall portrait screens (852px-932px height),
    // downscaling to w_720 gave only ~404px vertical resolution, which caused severe pixelation and blurriness when stretched over a 2556px+ Retina display.
    // Serving w_1920 ensures full 1080 vertical lines, delivering razor-sharp HD clarity with hardware-accelerated H.264 decoding.
    return `${clean.substring(0, uploadIdx)}/video/upload/q_auto:best,vc_auto,w_1920,c_limit/${cleanPath}`;
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

const CACHED_SLIDERS_KEY = "dpsi_cached_hero_sliders_v2";

const DEFAULT_HERO_SLIDES = [
  {
    image: "/images/dps/slider_1.webp",
    videoUrl: "/videos/campus_hero.mp4",
    mobileVideoUrl: "/videos/campus_hero.mp4",
    useSeparateMobileVideo: false,
    mediaType: "video" as const,
    title: "Delhi Public School Indirapuram",
    subtitle: "Premier CBSE Day School in Ghaziabad • Nursery to Class XII",
    badge: "Admissions Open 2026-27",
    buttonText: "",
    buttonLink: "/admissions",
  },
];

export default function HeroSection() {
  const { data: cmsSliders } = trpc.cms.listSliders.useQuery();

  const [cachedSliders, setCachedSliders] = useState<any[] | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CACHED_SLIDERS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (cmsSliders && cmsSliders.length > 0) {
      try {
        localStorage.setItem(CACHED_SLIDERS_KEY, JSON.stringify(cmsSliders));
      } catch {}
      setCachedSliders(cmsSliders);
    }
  }, [cmsSliders]);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const effectiveSliders =
    (cmsSliders && cmsSliders.length > 0)
      ? cmsSliders
      : (cachedSliders && cachedSliders.length > 0)
      ? cachedSliders
      : null;

  const activeSlides =
    effectiveSliders && effectiveSliders.length > 0
      ? effectiveSliders
          .filter((s: any) => !s.isDeleted && s.isActive !== false)
          .map((s: any) => {
            const rawVid = (s.videoUrl || "").trim();
            const rawMobileVid = (s.mobileVideoUrl || "").trim();
            const rawImg = (s.imageUrl || "").trim();
            const isVideo = s.mediaType === "video" || Boolean(rawVid) || Boolean(rawMobileVid);
            return {
              image: rawImg || "/images/dps/slider_1.webp",
              videoUrl: rawVid || "/videos/campus_hero.mp4",
              mobileVideoUrl: rawMobileVid || "/videos/campus_hero.mp4",
              useSeparateMobileVideo: Boolean(s.useSeparateMobileVideo),
              mediaType: (isVideo ? "video" : "image") as "image" | "video",
              title: s.title,
              subtitle: s.subtitle || "",
              badge: s.subtitle ? "Excellence in Education" : "Admissions Open 2026-27",
              buttonText: s.buttonText || "",
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

  const hasDedicatedMobileVideo = Boolean(isMobile && slide.useSeparateMobileVideo && slide.mobileVideoUrl);
  const effectiveRawVideo = hasDedicatedMobileVideo ? slide.mobileVideoUrl : slide.videoUrl;
  const hasVideo = slide.mediaType === "video" && Boolean(effectiveRawVideo);

  const videoSource = hasVideo
    ? optimizeMediaUrl(effectiveRawVideo, isMobile)
    : "";

  // Automatically load and start video playback when videoSource or slide changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && hasVideo && videoSource) {
      video.muted = isMuted;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
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

      // iOS Safari gesture fallback
      const handleUserGesture = () => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      };
      window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });
      window.addEventListener("click", handleUserGesture, { once: true, passive: true });
      return () => {
        window.removeEventListener("touchstart", handleUserGesture);
        window.removeEventListener("click", handleUserGesture);
      };
    }
  }, [videoSource, safeSlideIndex, hasVideo, isMuted]);

  // Eagerly pause video hardware decode loop as soon as user scrolls down to preserve 100% GPU/CPU for smooth 60/120fps scrolling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScrollPause = () => {
      if (!videoRef.current) return;
      if (window.scrollY > 220) {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      } else {
        if (videoRef.current.paused && isPlayingVideo) {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    window.addEventListener("scroll", handleScrollPause, { passive: true });

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            if (videoRef.current.paused && isPlayingVideo && window.scrollY < 220) {
              videoRef.current.play().catch(() => {});
            }
          } else {
            if (!videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        },
        { threshold: [0, 0.25] }
      );
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScrollPause);
      observer?.disconnect();
    };
  }, [isPlayingVideo]);

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
      className="relative w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none contain-paint"
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
              loop
              playsInline
              preload="auto"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
              onVolumeChange={() => {
                if (videoRef.current) {
                  setIsMuted(videoRef.current.muted);
                }
              }}
              className="w-full h-full object-cover object-center will-change-transform"
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
        <div
          style={{ backgroundColor: "rgba(255, 255, 255, 0.14)" }}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl border border-white/30 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xl shadow-black/10 cursor-default transition-all"
        >
          <span>{slide.badge || "Admissions Open 2026-27"}</span>
          <span className="text-white/40">|</span>
          <span className="text-[11px] sm:text-xs text-white/85">CBSE Affiliation No. 2130541</span>
        </div>
      </motion.div>

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
