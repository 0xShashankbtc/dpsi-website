import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { trpc } from "@/providers/trpc";

function extractYoutubeInfo(url: string) {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // Match YouTube URLs: watch?v=, youtu.be/, embed/, shorts/, live/, v/
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
      return {
        id: v._id ? String(v._id) : `vid-${i}`,
        title: v.title,
        url: v.videoUrl || v.youtubeUrl || "",
        thumbnail: v.thumbnailUrl || "",
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
      {/* SKY BLUE VERY LIGHT GRADIENT SECTION BEFORE YOUTUBE LINK */}
      <div className="w-full py-14 sm:py-16 bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 border-y border-sky-200/70 text-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-600/10 border border-sky-300 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              School Video Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-sky-950 tracking-tight font-serif">
              Experience Life at DPS Indirapuram
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto mt-3.5 rounded-full" />
            <p className="text-sky-900/80 mt-3 max-w-2xl mx-auto text-sm sm:text-base font-medium">
              Explore our state-of-the-art AI & Robotics Innovation Lab, Annual Cultural Celebrations, and campus achievements in video.
            </p>
          </motion.div>
        </div>
      </div>

      {/* YOUTUBE VIDEO GALLERY SECTION WITH LIGHT SKY BLUE GRADIENT BACKGROUND */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-sky-200 via-sky-100 to-blue-50 text-slate-900 overflow-hidden border-b border-sky-200/80">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-sky-950 font-serif drop-shadow-xs">
              VIDEO GALLERY
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 mx-auto mt-3 rounded-full" />
          </motion.div>

          {/* Video Player Carousel Container */}
          <div className="relative max-w-4xl mx-auto flex items-center justify-center">
            {/* Left Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="absolute left-2 sm:-left-14 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/90 hover:bg-sky-600 text-sky-900 hover:text-white backdrop-blur-md border border-sky-200 shadow-2xl transition-colors cursor-pointer"
              title="Previous Video"
              aria-label="Previous Video"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Video Player Box */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-sky-400/50 shadow-2xl shadow-sky-950/20 relative group">
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  activeVideo.isDirectVideo ? (
                    <video
                      key={activeVideo.id}
                      src={activeVideo.url}
                      controls
                      autoPlay
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-between p-4 sm:p-6">
                      {/* Top Title Overlay */}
                      <div className="bg-slate-950/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 max-w-xl self-start shadow-lg">
                        <p className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                          {activeVideo.title}
                        </p>
                        <p className="text-[11px] text-sky-400 font-semibold">DPS Indirapuram Official Channel</p>
                      </div>

                      {/* Center Big Red YouTube Play Button with Pulsing Wave */}
                      <div className="self-center my-auto relative">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-2xl bg-red-500 blur-md pointer-events-none"
                        />
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-2xl shadow-red-950/80 transition-colors"
                        >
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-0.5" />
                        </motion.div>
                      </div>

                      {/* Bottom Watch prompt */}
                      <div className="self-end text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-md">
                        Click to Watch Video ▶
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-2 sm:-right-14 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/90 hover:bg-sky-600 text-sky-900 hover:text-white backdrop-blur-md border border-sky-200 shadow-2xl transition-colors cursor-pointer"
              title="Next Video"
              aria-label="Next Video"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto max-w-3xl mx-auto py-2">
            {videos.map((vid, index) => (
              <motion.button
                key={vid.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all shrink-0 w-28 sm:w-36 aspect-video cursor-pointer ${
                  safeIndex === index
                    ? "border-sky-500 shadow-xl shadow-sky-400/40 ring-4 ring-sky-400/40"
                    : "border-sky-200/80 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
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
