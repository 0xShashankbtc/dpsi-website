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
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Vertical blue rule decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-700 via-blue-400 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — Principal Photo */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-[0_8px_40px_0_rgba(30,58,138,0.14)] border border-slate-200">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {/* Name plate — clean flat style */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">{name}</p>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">{title}</p>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Message */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold mb-5 border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              {badge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              {headline}
            </h2>
            {/* Blue left border quote block */}
            <div className="border-l-4 border-blue-700 pl-5 space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              <p>{p1}</p>
              {p2 && <p>{p2}</p>}
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-max">
              <Button
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-700/20 cursor-pointer"
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
          <div className="mt-20 pt-16 border-t border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
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
                  className="flat-card flex items-center gap-4 p-4 cursor-pointer group"
                >
                  {/* Date block */}
                  <div className="w-14 h-14 bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xl font-black leading-none">
                      {new Date(event.eventDate).getDate()}
                    </span>
                    <span className="text-[10px] font-bold uppercase mt-0.5 opacity-80">
                      {new Date(event.eventDate).toLocaleString("default", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 font-medium">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                      {formatISTDate(event.eventDate)}
                      <MapPin className="w-3.5 h-3.5 ml-1 text-blue-400" />
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
