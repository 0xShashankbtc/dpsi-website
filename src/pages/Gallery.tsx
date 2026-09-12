import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Image as ImageIcon } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { trpc } from "@/providers/trpc";
import VideoGallerySection from "@/sections/VideoGallerySection";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";

export default function Gallery() {
  const { data: legacyGallery, isLoading: isLegacyLoading } = trpc.gallery.list.useQuery();
  const { data: cmsGallery, isLoading: isCmsLoading } = trpc.cms.listGalleryImages.useQuery();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isLoading = isLegacyLoading || isCmsLoading;

  // Merge CMS images with legacy images
  const liveItems = useMemo(() => {
    const fromCms = cmsGallery?.map((img: any) => ({
      id: img._id?.toString() || img._id,
      title: img.title,
      category: img.category || "Campus",
      imageUrl: img.imageUrl,
      description: img.description,
      featured: img.featured ?? true,
    })) || [];

    if (fromCms.length > 0) return fromCms;

    return (legacyGallery || []).map((img: any) => ({
      id: img.id || img._id,
      title: img.title,
      category: img.category || "Campus",
      imageUrl: img.imageUrl,
      description: img.description,
      featured: img.featured ?? true,
    }));
  }, [cmsGallery, legacyGallery]);

  // Extract dynamic categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    liveItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [liveItems]);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return liveItems;
    return liveItems.filter((g) => g.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [liveItems, selectedCategory]);

  // Construct dynamic 3D Coverflow slides
  const coverflowSlides: CoverflowSlide[] = useMemo(() => {
    return liveItems.slice(0, 10).map((item) => ({
      src: item.imageUrl,
      alt: item.title,
      title: item.title,
      subtitle: item.category ? `Category: ${item.category}` : "Campus Showcase",
      meta: [
        { label: "Category", value: item.category || "General" },
        { label: "Campus", value: "DPS Indirapuram" },
      ],
    }));
  }, [liveItems]);

  return (
    <Layout>
      <SEO
        title="Campus Gallery"
        description="Explore campus photo gallery, events, labs, sports grounds, and facilities at DPS Indirapuram."
      />
      <section className="relative py-20 sm:py-24 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
        {/* Dynamic Background Mesh Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              Interactive Campus Tour
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              3D Campus Gallery
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              Drag, swipe, and explore the futuristic infrastructure, innovation labs, sports arenas, and vibrant life at DPS Indirapuram.
            </p>
          </div>
        </div>
      </section>

      {/* 3D COVERFLOW INTERACTIVE SHOWCASE */}
      {coverflowSlides.length > 0 && (
        <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                3D Coverflow Perspective
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Drag or Click to Navigate
              </h2>
            </div>

            <div className="w-full max-w-5xl mx-auto">
              <CoverflowCarousel
                slides={coverflowSlides}
                showCaption={true}
                showNavigation={true}
                showPagination={true}
                cardWidth="clamp(180px, 28vw, 320px)"
                rotate={42}
                depth={0.7}
                perspective={3.2}
                className="py-4"
                cardClassName="border-2 border-emerald-500/30 shadow-2xl rounded-3xl"
              />
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-white dark:bg-slate-900 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              All Photo Collections
            </h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Photos Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedCategory !== "All"
                  ? `No photos uploaded under "${selectedCategory}" category yet.`
                  : "No gallery photographs have been published yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-slate-900"
                  onClick={() => setSelectedImage(item.imageUrl)}
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-emerald-300 text-xs font-medium">{item.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>


      <VideoGallerySection />

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setSelectedImage(null)}>
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Gallery"
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}