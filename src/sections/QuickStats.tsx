import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  Users,
  GraduationCap,
  Network,
  Award,
  Trophy,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const iconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  GraduationCap: <GraduationCap className="w-8 h-8" />,
  Network: <Network className="w-8 h-8" />,
  Award: <Award className="w-8 h-8" />,
  Trophy: <Trophy className="w-8 h-8" />,
};

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const numericValue = parseFloat(target.replace(/[^0-9.]/g, ""));
  const isPercentage = target.includes("%");

  useEffect(() => {
    if (!isInView || isNaN(numericValue)) return;
    const duration = 1600;
    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Cubic ease-out: 1 - (1 - progress)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easeProgress * numericValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCount(numericValue);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, numericValue]);

  if (isNaN(numericValue)) {
    return <span>{target}</span>;
  }

  const display = isPercentage ? count.toFixed(1) : Math.floor(count).toLocaleString();
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function QuickStats() {
  const { data: stats } = trpc.stats.list.useQuery();

  if (!stats?.length) return null;

  // Compute symmetric grid columns based on item count
  const getGridClasses = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-sm";
    if (count === 2) return "grid-cols-2 max-w-2xl";
    if (count === 3) return "grid-cols-1 sm:grid-cols-3 max-w-4xl";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl";
    if (count === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-6xl";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-7xl";
  };

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-b from-sky-50/70 via-emerald-50/40 to-white text-slate-900 relative overflow-hidden border-y border-emerald-100/80">
      {/* Subtle Ambient Light Floating Glows */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[300px] bg-gradient-to-r from-sky-200/30 via-emerald-200/30 to-teal-200/20 blur-3xl pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`grid ${getGridClasses(stats.length)} gap-4 sm:gap-6 mx-auto justify-center`}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -6,
                scale: 1.03,
                boxShadow: "0 20px 35px -10px rgba(16, 185, 129, 0.18)"
              }}
              className="text-center p-5 sm:p-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-emerald-200/70 hover:border-emerald-400 shadow-md shadow-emerald-950/5 transition-all duration-300 group cursor-default flex flex-col items-center justify-center min-h-[140px]"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
                className="text-amber-500 mb-2.5 flex justify-center group-hover:text-amber-600 transition-colors"
              >
                {iconMap[stat.icon || "Award"] || <Award className="w-7 h-7 sm:w-8 sm:h-8" />}
              </motion.div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1 tracking-tight">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.value.includes("%") ? "%" : stat.value.includes("+") ? "+" : ""}
                />
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}