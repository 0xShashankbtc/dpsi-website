import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatISTDate } from "@/lib/dateUtils";

export default function NewsHighlights() {
  const { data: cmsActivities, isLoading } = trpc.cms.listActivities.useQuery();
  const { data: legacyNews } = trpc.news.featured.useQuery();

  const dynamicActivities = cmsActivities
    ?.filter((a: any) => !a.isDeleted && a.isPublished !== false)
    ?.map((a: any) => ({
      id: a._id?.toString() || a._id,
      title: a.title,
      category: a.category || "Campus Update",
      excerpt: a.description,
      image: a.imageUrl || "",
      createdAt: a.eventDate || a.createdAt || new Date().toISOString(),
    }));

  const displayNews =
    dynamicActivities && dynamicActivities.length > 0
      ? dynamicActivities.slice(0, 6)
      : legacyNews && legacyNews.length > 0
      ? legacyNews.map((n: any) => ({
          id: n.id,
          title: n.title,
          category: n.category || "News",
          excerpt: n.excerpt || n.content?.slice(0, 120),
          image: n.image || "",
          createdAt: n.createdAt,
        }))
      : [];

  if (!isLoading && displayNews.length === 0) return null;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-orange-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-200">
              Campus Updates
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Latest Highlights & News
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              to="/news-events"
              className="hidden sm:inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-bold text-sm border border-slate-200 px-4 py-2 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <div className="flat-card overflow-hidden h-full flex flex-col group cursor-pointer">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center rounded-t-2xl">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-blue-300" />
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-blue-700 text-white text-[11px] font-bold rounded-md shadow-sm">
                      {item.category || "News"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {formatISTDate(item.createdAt)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700 group-hover:gap-2 gap-1 transition-all">
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All link */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/news-events"
            className="inline-flex items-center gap-1.5 text-blue-700 font-bold text-sm border border-blue-200 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all"
          >
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
