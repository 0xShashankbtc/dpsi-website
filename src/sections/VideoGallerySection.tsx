import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { trpc } from "@/providers/trpc";

function extractYoutubeInfo(url: string) {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/i
  );
  const id = match ? match[1] : cleanUrl.length === 11 && /^[\w-]{11}$/.test(cleanUrl) ? cleanUrl : "";

  if (!id) return null;

  return {
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1`,
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  };
}

import { optimizeMediaUrl } from "./HeroSection";

export default function VideoGallerySection() {
  const { data: cmsVideos, isLoading } = trpc.cms.listVideos.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const dynamicVideos = cmsVideos
    ?.filter((v: any) => !v.isDeleted && v.isPublished !== false)
    ?.map((v: any, i: number) => {
      const targetUrl = (v.youtubeUrl || v.videoUrl || "").trim();
      const yt = targetUrl ? extractYoutubeInfo(targetUrl) : null;
      if (yt) {
        return {
          id: v._id ? String(v._id) : yt.id || `yt-${i}`,
          title: v.title,
          url: yt.embedUrl,
          thumbnail: v.thumbnailUrl || yt.thumbnail,
          isDirectVideo: false,
        };
      }
      const directVid = (v.videoUrl || v.youtubeUrl || "").trim();
      let thumb = (v.thumbnailUrl || "").trim();
      if (!thumb && directVid.includes("cloudinary.com") && directVid.includes("/video/upload/")) {
        thumb = directVid.replace(
          "/video/upload/",
          "/video/upload/so_0,w_800,c_limit,q_auto,f_auto/"
        ).replace(/\.[^/.]+$/, ".jpg");
      }
      if (!thumb) {
        thumb = "/images/dps/slider_1.webp";
      }

      return {
        id: v._id ? String(v._id) : `vid-${i}`,
        title: v.title,
        url: optimizeMediaUrl(directVid),
        thumbnail: thumb,
        isDirectVideo: !!(v.videoUrl || targetUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/i)),
      };
    });

  const videos = dynamicVideos || [];

  if (!isLoading && videos.length === 0) {
    return null;
  }

  const safeIndex = videos.length > 0 ? currentIndex % videos.length : 0;
  const activeVideo = videos[safeIndex];

  if (!activeVideo) {
    return null;
  }

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className="w-full flex flex-col">
      {/* MINIMALIST VIDEO GALLERY HEADER (NO HARDCODED BLUE) */}
      <div className="w-full py-12 sm:py-14 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
              Video Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Experience Life at DPS Indirapuram
            </h2>
            <div className="w-16 h-1 bg-slate-900 dark:bg-slate-100 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base font-normal">
              Explore our state-of-the-art AI & Robotics Innovation Lab, Annual Cultural Celebrations, and campus achievements.
            </p>
          </motion.div>
        </div>
      </div>

      {/* VIDEO PLAYER SECTION (CLEAN MINIMALIST NEUTRAL SLATE) */}
      <section className="relative py-16 sm:py-20 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Video Player Carousel Container */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto flex items-center justify-center"
          >
            {/* Left Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="absolute left-2 sm:-left-14 z-20 p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xl transition-colors cursor-pointer"
              title="Previous Video"
              aria-label="Previous Video"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Video Player Box */}
            <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-2xl relative group">
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  activeVideo.isDirectVideo ? (
                    <video
                      key={activeVideo.id}
                      src={activeVideo.url}
                      poster={activeVideo.thumbnail}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      key={activeVideo.id}
                      src={activeVideo.url}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <motion.div
                    key={`thumb-${activeVideo.id}`}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <img
                      src={activeVideo.thumbnail}
                      alt={activeVideo.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-4 sm:p-6">
                      {/* Top Title Overlay */}
                      <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 max-w-xl self-start shadow-md">
                        <p className="font-bold text-sm sm:text-base text-white line-clamp-1">
                          {activeVideo.title}
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium">DPS Indirapuram Official Channel</p>
                      </div>

                      {/* Center Minimalist Play Button */}
                      <div className="self-center my-auto relative">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-2xl transition-colors"
                        >
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-0.5" />
                        </motion.div>
                      </div>

                      {/* Bottom Watch prompt */}
                      <div className="self-end text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
                        Click to Watch Video ▶
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-2 sm:-right-14 z-20 p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xl transition-colors cursor-pointer"
              title="Next Video"
              aria-label="Next Video"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </motion.div>

          {/* Thumbnail Selector Strip */}
          <div className="mt-8 flex items-center justify-center gap-3 overflow-x-auto max-w-3xl mx-auto py-2">
            {videos.map((vid, index) => (
              <motion.button
                key={vid.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 w-28 sm:w-36 aspect-video cursor-pointer ${
                  safeIndex === index
                    ? "border-slate-900 dark:border-white shadow-lg ring-2 ring-slate-400"
                    : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
