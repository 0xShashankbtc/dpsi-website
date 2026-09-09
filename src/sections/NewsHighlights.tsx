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
    <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-200 dark:border-slate-700">
              Campus Updates
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-slate-900 dark:text-white hover:text-slate-700 font-bold text-sm border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group shadow-sm"
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
              <div className="flat-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col group cursor-pointer shadow-sm hover:shadow-md transition-all">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-t-2xl">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[11px] font-bold rounded-md backdrop-blur-sm shadow-sm">
                      {item.category || "News"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatISTDate(item.createdAt)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-900 dark:text-white group-hover:gap-2 gap-1 transition-all">
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
            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
