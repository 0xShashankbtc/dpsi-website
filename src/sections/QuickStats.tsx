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
  Calendar: <Calendar className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
  GraduationCap: <GraduationCap className="w-7 h-7" />,
  Network: <Network className="w-7 h-7" />,
  Award: <Award className="w-7 h-7" />,
  Trophy: <Trophy className="w-7 h-7" />,
};

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const numericValue = parseFloat(target.replace(/[^0-9.]/g, ""));
  const isPercentage = target.includes("%");

  useEffect(() => {
    if (!isInView || isNaN(numericValue)) return;
    const duration = 1400;
    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
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

  const getGridClasses = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-sm";
    if (count === 2) return "grid-cols-2 max-w-2xl";
    if (count === 3) return "grid-cols-1 sm:grid-cols-3 max-w-4xl";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl";
    if (count === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-6xl";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-7xl";
  };

  return (
    <section className="py-14 sm:py-16 bg-slate-50 border-y border-slate-200 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`grid ${getGridClasses(stats.length)} gap-4 sm:gap-5 mx-auto justify-center`}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="flat-card text-center p-6 sm:p-7 flex flex-col items-center justify-center min-h-[150px] group cursor-default"
            >
              {/* Icon with clean styling */}
              <div className="text-amber-500 mb-3 flex justify-center group-hover:scale-110 transition-transform duration-200">
                {iconMap[stat.icon || "Award"] || <Award className="w-7 h-7" />}
              </div>
              {/* Large bold number */}
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight leading-none">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.value.includes("%") ? "%" : stat.value.includes("+") ? "+" : ""}
                />
              </h3>
              {/* Minimalist underline accent */}
              <div className="w-8 h-0.5 bg-slate-900 dark:bg-white rounded-full mb-2 group-hover:w-12 transition-all duration-300" />
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
