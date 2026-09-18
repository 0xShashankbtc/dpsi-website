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
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const defaultBadge = getSetting("admission_badge", getSetting("admission_status", "Admissions Open 2026-27"));
  const affiliationText = getSetting("school_affiliation", "CBSE Affiliation No. 2130541");

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
              badge: s.badge || (s.subtitle ? "Excellence in Education" : defaultBadge),
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
    ? (isMobile
        ? optimizeMediaUrl(effectiveRawVideo, { isMobile: true, quality: "good", width: 720 })
        : optimizeMediaUrl(effectiveRawVideo, { isMobile: false, quality: "good", width: 1920 }))
    : "";

  const videoPoster = (hasVideo && effectiveRawVideo) ? getVideoPosterUrl(effectiveRawVideo, isMobile) : "";
  const effectivePoster =
    videoPoster ||
    (slide.image && !slide.image.includes("slider_1.webp")
      ? optimizeMediaUrl(slide.image, { isMobile, preset: "hero" })
      : "");

  // High-performance visibility & viewport playback manager:
  // - Offloads viewport detection to native IntersectionObserver (0 forced reflows, 0 scroll lag)
  // - Automatically pauses video when out of viewport to free 100% GPU/CPU
  // - Resumes playback instantly when hero re-enters viewport or user switches back to tab
  useEffect(() => {
    if (typeof window === "undefined" || !hasVideo) return;

    const container = containerRef.current;
    if (!container) return;

    let isIntersecting = true;

    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isIntersecting && document.visibilityState === "visible") {
        if (video.paused && !userPausedRef.current) {
          video.muted = isMuted;
          video.play().catch(() => {});
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    };

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          syncPlayback();
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    }

    const onVisibilityChange = () => {
      syncPlayback();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onVisibilityChange);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onVisibilityChange);
    };
  }, [hasVideo, videoSource, isMuted]);

  // Ensure video starts playing immediately on load or slide change without re-rendering loop
  useEffect(() => {
    const video = videoRef.current;
    if (video && hasVideo && !userPausedRef.current) {
      video.muted = isMuted;
      video.playsInline = true;
      video.play().catch(() => {});
    }
  }, [videoSource, hasVideo, isMuted, safeSlideIndex]);

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
      className="relative w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none"
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
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 z-1 overflow-hidden"
        >
          {hasVideo && videoSource ? (
            <video
              ref={videoRef}
              key={videoSource}
              src={videoSource}
              poster={effectivePoster || undefined}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              onEnded={(e) => {
                // Continuous hardware loop guarantee
                e.currentTarget.currentTime = 0;
                if (!userPausedRef.current) {
                  e.currentTarget.play().catch(() => {});
                }
              }}
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => {
                if (userPausedRef.current) {
                  setIsPlayingVideo(false);
                }
              }}
              className="w-full h-full object-cover pointer-events-none transform-gpu"
            />
          ) : (
            <img
              src={effectivePoster || slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
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

      {/* TOP PORTION: ADMISSIONS OPEN BADGE (HIGH CONTRAST GLASSMORPHISM) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute top-[max(1.25rem,calc(env(safe-area-inset-top)+0.5rem))] sm:top-7 inset-x-0 z-20 flex justify-center items-center px-3 sm:px-4 pointer-events-auto"
      >
        <div
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl border border-white/40 text-white text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide shadow-xl shadow-black/20 cursor-default transition-all max-w-[94vw] truncate"
        >
          <span className="text-white font-bold truncate">{slide.badge || defaultBadge}</span>
          <span className="text-white/70 shrink-0" aria-hidden="true">•</span>
          <span className="text-[10px] sm:text-xs text-slate-100 font-medium truncate">{affiliationText}</span>
        </div>
      </motion.div>

      {/* MINIMALIST INTERACTIVE CONTROLS DOCK (BOTTOM - 48PX ACCESSIBLE TOUCH TARGETS) */}
      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
        {/* Left: Video Play & Audio Controls */}
        {hasVideo && (
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/85 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-semibold transition-all cursor-pointer shadow-md touch-manipulation"
              title={isPlayingVideo ? "Pause Video" : "Play Video"}
              aria-label={isPlayingVideo ? "Pause Video" : "Play Video"}
            >
              {isPlayingVideo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlayingVideo ? "Pause" : "Play"}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/85 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-semibold transition-all cursor-pointer shadow-md touch-manipulation"
              title={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
              aria-label={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-black/70 hover:bg-black/85 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs transition-all cursor-pointer hidden md:inline-flex items-center justify-center shadow-md touch-manipulation"
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Slide Controls (If Multiple Slides) */}
        {activeSlides.length > 1 && (
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/30 ml-auto shadow-md pointer-events-auto">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white hover:text-amber-300 transition-colors cursor-pointer touch-manipulation active:scale-90"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1 px-1">
              {activeSlides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className="min-h-[44px] min-w-[28px] flex items-center justify-center cursor-pointer touch-manipulation"
                  title={`Go to slide ${idx + 1}`}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-300 ${
                      safeSlideIndex === idx ? "w-6 bg-amber-400" : "w-2 bg-white/70 hover:bg-white"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleNextSlide}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white hover:text-amber-300 transition-colors cursor-pointer touch-manipulation active:scale-90"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
