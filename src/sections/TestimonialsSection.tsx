import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { DEFAULT_TESTIMONIALS } from "@/lib/initialDataSnapshot";

export default function TestimonialsSection() {
  const { data: testimonials, isLoading } = trpc.testimonials.featured.useQuery();
  const effectiveTestimonials =
    testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const [current, setCurrent] = useState(0);

  if (!isLoading && !effectiveTestimonials.length) return null;

  const next = () => setCurrent((prev) => (prev + 1) % (effectiveTestimonials.length || 1));
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + (effectiveTestimonials.length || 1)) % (effectiveTestimonials.length || 1)
    );

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900 relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-400/30">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            Parent & Alumni Voices
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What They Say About Us
          </h2>
          <div className="w-14 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {isLoading && effectiveTestimonials.length === 0 ? (
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center rounded-3xl animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-8" />
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-1" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-24" />
            </div>
          </div>
        ) : effectiveTestimonials.length > 0 && effectiveTestimonials[current] ? (
          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) next();
                  if (info.offset.x > 50) prev();
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center rounded-3xl shadow-sm relative group cursor-grab active:cursor-grabbing"
              >
                <Quote className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 mb-8 leading-relaxed italic max-w-2xl mx-auto">
                  "{effectiveTestimonials[current].content}"
                </p>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                    {effectiveTestimonials[current].name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {effectiveTestimonials[current].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="rounded-full w-10 h-10 border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </Button>
              </motion.div>

              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrent(i)}
                    animate={{
                      width: i === current ? 24 : 8,
                      backgroundColor: i === current ? "#059669" : "rgba(148, 163, 184, 0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="h-1.5 rounded-full cursor-pointer"
                    title={`Testimonial ${i + 1}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-pressed={i === current}
                  />
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="rounded-full w-10 h-10 border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </Button>
              </motion.div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
