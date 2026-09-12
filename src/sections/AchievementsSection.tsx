import { motion } from "framer-motion";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";
import { trpc } from "@/providers/trpc";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/initialDataSnapshot";

export default function AchievementsSection() {
  const { data: achievements, isLoading } = trpc.achievements.list.useQuery();
  const effectiveAchievements =
    achievements && achievements.length > 0 ? achievements : DEFAULT_ACHIEVEMENTS;

  const slides: CoverflowSlide[] = effectiveAchievements.map((ach: any) => ({
    src: ach.imageUrl || ach.image || "/images/dps/topper_siddhant.webp",
    alt: ach.studentName,
    title: `${ach.studentName} • ${ach.score}`,
    subtitle: `${ach.className || ach.class} • ${ach.exam || "CBSE Board Examination"}`,
    meta: [
      { label: "Rank", value: ach.rank || ach.stream || "#1 Rank" },
      { label: "Score", value: `${ach.score} Aggregate` },
      { label: "Year", value: ach.year || "2025-26" },
    ],
  }));

  if (!isLoading && slides.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 border border-slate-200 dark:border-slate-700">
            Academic Excellence
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Class X & XII Toppers
          </h2>
          {/* Neutral underline */}
          <div className="w-16 h-1 bg-slate-900 dark:bg-slate-100 mx-auto rounded-full mb-4" />
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base font-normal leading-relaxed">
            Celebrating outstanding academic achievements in CBSE Board Examinations. Our Dipsites continue to set benchmark results nationwide.
          </p>
        </motion.div>

        {isLoading && slides.length === 0 ? (
          <div className="w-full max-w-4xl mx-auto py-8 flex items-center justify-center gap-4 sm:gap-6 overflow-hidden">
            <div className="hidden sm:block w-48 h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse opacity-40 scale-90 shrink-0" />
            <div className="w-64 sm:w-72 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shadow-lg shrink-0 flex flex-col justify-end p-6">
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
            </div>
            <div className="hidden sm:block w-48 h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse opacity-40 scale-90 shrink-0" />
          </div>
        ) : slides.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl mx-auto py-2"
          >
            <CoverflowCarousel
              slides={slides}
              showCaption={true}
              showNavigation={true}
              showPagination={true}
              cardWidth="clamp(180px, 26vw, 290px)"
              rotate={42}
              depth={0.7}
              perspective={3.2}
              className="py-2"
              cardClassName="border border-slate-200 dark:border-slate-700 shadow-xl rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800"
            />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
