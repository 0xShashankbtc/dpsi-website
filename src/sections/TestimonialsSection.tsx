import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function TestimonialsSection() {
  const { data: testimonials } = trpc.testimonials.featured.useQuery();
  const [current, setCurrent] = useState(0);

  if (!testimonials?.length) return null;

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Subtle blue strip at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700 opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-200">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            Parent & Alumni Voices
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What They Say About Us
          </h2>
          {/* Cobalt underline */}
          <div className="w-14 h-1 bg-blue-700 mx-auto mt-4 rounded-full" />
        </motion.div>

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
              className="flat-card p-8 sm:p-12 text-center cursor-grab active:cursor-grabbing relative"
            >
              {/* Quote icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto mb-6">
                <Quote className="w-6 h-6" />
              </div>
              <p className="text-base sm:text-xl text-slate-700 leading-relaxed mb-8 font-medium italic select-none">
                "{testimonials[current].content}"
              </p>
              <div>
                <h4 className="font-black text-slate-900 text-lg tracking-tight">
                  {testimonials[current].name}
                </h4>
                <p className="text-blue-700 font-bold text-xs mt-1 uppercase tracking-wider">
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
                className="rounded-full w-10 h-10 border-slate-200 bg-white shadow-sm cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </motion.div>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrent(i)}
                  animate={{
                    width: i === current ? 24 : 8,
                    backgroundColor: i === current ? "#1d4ed8" : "rgba(148, 163, 184, 0.5)",
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
                className="rounded-full w-10 h-10 border-slate-200 bg-white shadow-sm cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                title="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
