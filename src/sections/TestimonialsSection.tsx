import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function TestimonialsSection() {
  const { data: testimonials, isLoading } = trpc.testimonials.featured.useQuery();
  const [current, setCurrent] = useState(0);

  if (!isLoading && !testimonials?.length) return null;

  const next = () => setCurrent((prev) => (prev + 1) % (testimonials?.length || 1));
  const prev = () => setCurrent((prev) => (prev - 1 + (testimonials?.length || 1)) % (testimonials?.length || 1));

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
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-200 dark:border-slate-700">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            Parent & Alumni Voices
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What They Say About Us
          </h2>
          <div className="w-14 h-1 bg-slate-900 dark:bg-slate-100 mx-auto mt-4 rounded-full" />
        </motion.div>

        {isLoading ? (
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
        ) : testimonials && testimonials.length > 0 && testimonials[current] ? (
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
                  else if (info.offset.x > 50) prev();
                }}
                className="flat-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center cursor-grab active:cursor-grabbing relative shadow-sm rounded-3xl"
              >
                {/* Quote icon */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
                  <Quote className="w-5 h-5" />
                </div>
                <p className="text-base sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-8 font-medium italic select-none">
                  "{testimonials[current].content}"
                </p>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider">
                    {testimonials[current].role}
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
                  className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Previous"
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
                      backgroundColor: i === current ? "#0f172a" : "rgba(148, 163, 184, 0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="h-1.5 rounded-full cursor-pointer"
                    title={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Next"
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
