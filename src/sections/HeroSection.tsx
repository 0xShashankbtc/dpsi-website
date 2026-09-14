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
import { optimizeMediaUrl, getVideoPosterUrl } from "@/lib/mediaUtils";
export { optimizeMediaUrl, getVideoPosterUrl };

const CACHED_SLIDERS_KEY = "dpsi_cached_hero_sliders_v2";

const DEFAULT_HERO_SLIDES = [
  {
    image: "https://res.cloudinary.com/uqty03zf/video/upload/so_0,q_auto,f_auto,w_1920,c_limit/v1789020646/dpsi_videos/u1s2ebtl3owdvrtxcp4v.jpg",
    videoUrl: "https://res.cloudinary.com/uqty03zf/video/upload/v1789020646/dpsi_videos/u1s2ebtl3owdvrtxcp4v.mp4",
    mobileVideoUrl: "",
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
            const derivedPoster = rawVid ? getVideoPosterUrl(rawVid, isMobile) : "";
            const cleanImage = (rawImg && !rawImg.includes("slider_1.webp")) ? rawImg : "";
            return {
              image: cleanImage || derivedPoster || "/images/dps/logo.webp",
              videoUrl: rawVid || (isVideo ? "https://res.cloudinary.com/uqty03zf/video/upload/v1789020646/dpsi_videos/u1s2ebtl3owdvrtxcp4v.mp4" : ""),
              mobileVideoUrl: rawMobileVid,
              useSeparateMobileVideo: Boolean(s.useSeparateMobileVideo && rawMobileVid),
              mediaType: (isVideo ? "video" : "image") as "image" | "video",
              title: s.title || "Delhi Public School Indirapuram",
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
  const userPausedRef = useRef(false);

  const safeSlideIndex = activeSlides.length > 0 ? currentSlide % activeSlides.length : 0;
  const slide = activeSlides[safeSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const hasDedicatedMobileVideo = Boolean(isMobile && slide.useSeparateMobileVideo && slide.mobileVideoUrl);
  const effectiveRawVideo = hasDedicatedMobileVideo ? slide.mobileVideoUrl : slide.videoUrl;
  const hasVideo = slide.mediaType === "video" && Boolean(effectiveRawVideo);

  const videoSource = hasVideo
    ? optimizeMediaUrl(effectiveRawVideo, isMobile)
    : "";

  const videoPoster = (hasVideo && effectiveRawVideo) ? getVideoPosterUrl(effectiveRawVideo, isMobile) : "";
  const effectivePoster =
    videoPoster ||
    (slide.image && !slide.image.includes("slider_1.webp")
      ? optimizeMediaUrl(slide.image, { isMobile, preset: "hero" })
      : "");

  // Automatically load and start video playback when videoSource or slide changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && hasVideo && videoSource) {
      video.muted = isMuted;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      if (video.paused && !userPausedRef.current) {
        video.play().then(() => setIsPlayingVideo(true)).catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }

      // iOS / WebKit user gesture fallback (handles strict autoplay restrictions)
      const handleUserGesture = () => {
        if (videoRef.current && videoRef.current.paused && !userPausedRef.current) {
          videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
        }
      };
      window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });
      window.addEventListener("click", handleUserGesture, { once: true, passive: true });
      window.addEventListener("scroll", handleUserGesture, { once: true, passive: true });
      return () => {
        window.removeEventListener("touchstart", handleUserGesture);
        window.removeEventListener("click", handleUserGesture);
        window.removeEventListener("scroll", handleUserGesture);
      };
    }
  }, [videoSource, safeSlideIndex, hasVideo, isMuted]);

  // Eagerly pause video hardware decode loop as soon as user scrolls down to preserve 100% GPU/CPU for smooth 60/120fps scrolling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScrollPause = () => {
      if (!videoRef.current) return;
      if (window.scrollY > 240) {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      } else {
        if (videoRef.current.paused && !userPausedRef.current) {
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
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            if (videoRef.current.paused && !userPausedRef.current && window.scrollY < 240) {
              videoRef.current.play().catch(() => {});
            }
          } else if (!entry.isIntersecting) {
            if (!videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        },
        { threshold: [0, 0.15] }
      );
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScrollPause);
      observer?.disconnect();
    };
  }, []);

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
        userPausedRef.current = false;
        videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
      } else {
        userPausedRef.current = true;
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

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX > 0) {
        handlePrevSlide();
      } else {
        handleNextSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none contain-paint touch-pan-y"
    >
      {/* BRANDED FALLBACK BACKDROP WITH DPSI LOGO */}
      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center pointer-events-none z-0">
        <div className="relative flex flex-col items-center gap-3">
          <img
            src="/images/dps/logo.webp"
            alt="Delhi Public School Indirapuram"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-75 animate-pulse drop-shadow-[0_0_24px_rgba(245,158,11,0.25)]"
            width={128}
            height={128}
            loading="eager"
            fetchPriority="high"
          />
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        </div>
      </div>

      {/* GPU-ACCELERATED BACKGROUND MEDIA */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`hero-slide-${safeSlideIndex}-${hasVideo ? videoSource : slide.image}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 z-1 overflow-hidden will-change-transform"
        >
          {hasVideo && videoSource ? (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el) {
                  el.muted = isMuted;
                  el.defaultMuted = true;
                  el.playsInline = true;
                  el.setAttribute("playsinline", "true");
                  el.setAttribute("webkit-playsinline", "true");
                  if (el.paused && !userPausedRef.current) {
                    el.play().then(() => setIsPlayingVideo(true)).catch(() => {});
                  }
                }
              }}
              key={videoSource}
              src={videoSource}
              poster={effectivePoster || undefined}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                v.muted = isMuted;
                if (!userPausedRef.current && v.paused) {
                  v.play().then(() => setIsPlayingVideo(true)).catch(() => {});
                }
              }}
              onCanPlay={(e) => {
                const v = e.currentTarget;
                if (!userPausedRef.current && v.paused) {
                  v.play().then(() => setIsPlayingVideo(true)).catch(() => {});
                }
              }}
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => {
                if (userPausedRef.current) {
                  setIsPlayingVideo(false);
                }
              }}
              onVolumeChange={() => {
                if (videoRef.current) {
                  setIsMuted(videoRef.current.muted);
                }
              }}
              className="w-full h-full object-cover object-center will-change-transform"
            />
          ) : (
            <img
              src={effectivePoster || "/images/dps/logo.webp"}
              alt={slide.title}
              className="w-full h-full object-cover object-center will-change-transform"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1920}
              height={1080}
            />
          )}

          {/* Ultra-subtle gradient so video is bright, crisp and clearly visible */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-transparent to-black/45" />
        </motion.div>
      </AnimatePresence>

      {/* PRIMARY SEMANTIC H1 FOR ACCESSIBILITY & SEO */}
      <h1 className="sr-only">
        Delhi Public School Indirapuram — Premier CBSE School in Ghaziabad
      </h1>

      {/* TOP PORTION: ADMISSIONS OPEN BADGE (86% TRANSPARENT GLASSMORPHISM) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute top-5 sm:top-7 inset-x-0 z-20 flex justify-center items-center px-4 pointer-events-auto"
      >
        <div
          style={{ backgroundColor: "rgba(255, 255, 255, 0.14)" }}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl border border-white/30 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xl shadow-black/10 cursor-default transition-all"
        >
          <span>{slide.badge || "Admissions Open 2026-27"}</span>
          <span className="text-white/40">|</span>
          <span className="text-[11px] sm:text-xs text-white/85">CBSE Affiliation No. 2130541</span>
        </div>
      </motion.div>

      {/* MINIMALIST INTERACTIVE CONTROLS DOCK (BOTTOM) */}
      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
        {/* Left: Video Play & Audio Controls */}
        {hasVideo && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full bg-black/55 hover:bg-black/75 active:scale-95 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm touch-manipulation"
              title={isPlayingVideo ? "Pause Video" : "Play Video"}
            >
              {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingVideo ? "Pause" : "Play"}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full bg-black/55 hover:bg-black/75 active:scale-95 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm touch-manipulation"
              title={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 sm:p-1.5 rounded-full bg-black/55 hover:bg-black/75 active:scale-95 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs transition-all cursor-pointer hidden md:inline-flex shadow-sm touch-manipulation"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Slide Controls (If Multiple Slides) */}
        {activeSlides.length > 1 && (
          <div className="flex items-center gap-2 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 ml-auto shadow-sm pointer-events-auto">
            <button
              onClick={handlePrevSlide}
              className="p-1.5 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer touch-manipulation active:scale-90"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {activeSlides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer touch-manipulation ${
                    safeSlideIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNextSlide}
              className="p-1.5 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer touch-manipulation active:scale-90"
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
