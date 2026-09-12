import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, GraduationCap, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { formatISTDate } from "@/lib/dateUtils";

export default function PrincipalMessage() {
  const { data: events } = trpc.events.list.useQuery();
  const { data: settings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = settings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const name = getSetting("principal_name", "Ms. Priya Elizabeth John");
  const title = getSetting("principal_title", "Principal, DPS Indirapuram");
  const badge = getSetting("principal_badge", "Principal's Message");
  const headline = getSetting("principal_headline", "Nurturing Future Leaders");
  const image = getSetting("principal_image", "/images/leadership/priya_john.webp");
  const p1 = getSetting(
    "principal_message_p1",
    "Welcome to Delhi Public School Indirapuram, where we believe in empowering every child to discover their unique potential. Our institution stands as a beacon of excellence, combining traditional values with modern educational approaches."
  );
  const p2 = getSetting(
    "principal_message_p2",
    "With over two decades of legacy, we have consistently delivered outstanding academic results while fostering creativity, critical thinking, and character building. Our state-of-the-art facilities and dedicated faculty ensure that every student receives the best possible education."
  );

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT — Principal Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-800">
              <img
                src={image}
                alt={name}
                width={600}
                height={450}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {/* Name plate */}
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{title}</p>
                </div>
                <div className="w-9 h-9 bg-emerald-800 text-white rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Message */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-5 border border-emerald-400/30">
              <GraduationCap className="w-3.5 h-3.5" />
              {badge}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight leading-tight">
              {headline}
            </h2>

            <div className="border-l-2 border-emerald-500/40 pl-5 space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              <p>{p1}</p>
              {p2 && <p>{p2}</p>}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-max">
              <Button
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                asChild
              >
                <Link to="/about">
                  Read Full Message <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* UPCOMING EVENTS */}
        {events && events.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Upcoming Events
              </h3>
              <Link
                to="/news-events"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
              >
                View All Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.slice(0, 3).map((event: any, i: number) => (
                <motion.div
                  key={event.id || event._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to="/news-events"
                    className="flat-card bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-600/70 rounded-2xl flex items-center gap-4 p-4 cursor-pointer group shadow-xs hover:shadow-lg hover:shadow-emerald-950/5 transition-all block h-full"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md shadow-emerald-900/20 border border-emerald-500/30 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-900/30 transition-all">
                      <span className="text-2xl sm:text-3xl font-black leading-none tracking-tight text-white">
                        {new Date(event.eventDate).getDate()}
                      </span>
                      <span className="text-[11px] font-extrabold uppercase mt-1 text-emerald-200 tracking-wider">
                        {new Date(event.eventDate).toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{formatISTDate(event.eventDate)}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{event.location}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
