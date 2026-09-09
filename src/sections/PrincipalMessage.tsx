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
    <section className="py-20 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
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
                <div className="w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shrink-0">
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold mb-5 border border-slate-200 dark:border-slate-700">
              <GraduationCap className="w-3.5 h-3.5" />
              {badge}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight leading-tight">
              {headline}
            </h2>

            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-5 space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              <p>{p1}</p>
              {p2 && <p>{p2}</p>}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-max">
              <Button
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
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
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Upcoming Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.slice(0, 3).map((event: any, i: number) => (
                <motion.div
                  key={event.id || event._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className="flat-card bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-4 p-4 cursor-pointer group shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-13 h-13 bg-slate-900 dark:bg-slate-700 text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-lg font-black leading-none">
                      {new Date(event.eventDate).getDate()}
                    </span>
                    <span className="text-[10px] font-bold uppercase mt-0.5 text-slate-400">
                      {new Date(event.eventDate).toLocaleString("default", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 font-medium">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                      {formatISTDate(event.eventDate)}
                      <MapPin className="w-3.5 h-3.5 ml-1 text-slate-500" />
                      {event.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
